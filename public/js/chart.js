/* jshint esversion: 6 */
// console.log(data);

(function () {
	const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                                window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	window.requestAnimationFrame = requestAnimationFrame;
}());

document.getElementById('app').onselect = function () {
	return false;
};

const thickness = 2.5;
const axis_color = '#f2f4f5';
const duration = 300; // ms

const mx = Symbol('Max X'),
	my = Symbol('Max Y'),
	zx = Symbol('Shift X'),
	zy = Symbol('Shift Y'),
	chart_A_opacity = Symbol('Chart A opacity'),
	chart_B_opacity = Symbol('Chart B opacity');

const changingFields = [mx, my, zx, zy, chart_A_opacity, chart_B_opacity];

function initChangesObject(key) {
	this[key] = {
		startTimestamp: -1,
		deltaValue: -1,
		originalValue: -1,
	};
}

class Chart {
	constructor(canv, height, max_x = 0, max_y = 0) {
		this.width = canv.clientWidth;
		this.height = height;
		this[mx] = this.width;
		if (max_x) {
			this[mx] = max_x;
		} else {
			this[mx] = this.width;
		}
		if (max_y) {
			this[my] = max_y;
		} else {
			this[my] = this.height * 2;
		}
		this[zx] = 0;
		this[zy] = 0;
		this[chart_A_opacity] = 255;
		this[chart_B_opacity] = 255;
		this.animateFrameId = null;
		this.canv = canv;
		this.ctx = canv.getContext('2d');
		this.changes = {};

		this.isDrawAxis = true;
	}

	setChartWidths() {
		this.width = this.canv.clientWidth;
		this.canv.width = this.width * 2;
	}

	translateX(orig_x) {
		return Math.floor((orig_x - this[zx]) * this.scale_x);
	}

	translateY(orig_y) {
		return Math.floor((-orig_y + this[zy]) * this.scale_y);
	}

	clearChart() {
		this.ctx.clearRect(0, 0, this.canv.width, -this.canv.height);
	}

	calcScale() {
		this.scale_x = this.width / (this[mx] - this[zx]);
		this.scale_y = this.height / (this[my] - this[zy]);
	}

	moveX(dx) {
		this[zx] -= dx;
		this[mx] -= dx;
	}

	drawAxis() {
		if (!this.isDrawAxis) {
			return;
		}
		this.ctx.beginPath();
		this.ctx.lineWidth = thickness;
		this.ctx.strokeStyle = axis_color;
		this.ctx.beginPath();
		this.ctx.moveTo(thickness, -this.height);
		this.ctx.lineTo(thickness, 0 - thickness);
		this.ctx.lineTo(this.width, 0 - thickness);
		this.ctx.stroke();

		this.ctx.font = '14px Arial';
		this.ctx.fillText(`${Math.round(this[zx])},${Math.round(this[zy])}`, 10, -10);
		this.ctx.fillText(`${Math.round(this[mx]) + Math.round(this[zx])}`, this.width - 40, -10);
		this.ctx.fillText(`${Math.round(this[my]) + Math.round(this[zy])}`, 10, -this.height + 20);
	}

	startDraw(orig_x0, orig_y0, color) {
		this.ctx.lineWidth = thickness;
		this.ctx.strokeStyle = color;
		this.ctx.lineJoin = 'round';
		this.ctx.beginPath();

		const x0 = this.translateX(orig_x0),
			y0 = this.translateY(orig_y0);
		this.ctx.moveTo(x0, y0);
	}

	drawNextPoint(orig_x, orig_y) {
		const x = this.translateX(orig_x),
			y = this.translateY(orig_y);
		this.ctx.lineTo(x, y);
	}

	endDraw() {
		this.ctx.stroke();
	}

	drawAll() {
		this.clearChart();
		this.calcScale();
		this.drawChart();
		this.drawAxis();
	}

	drawChart() {
		if (this[chart_A_opacity]) {
			const opacity = (`00${Math.round(this[chart_A_opacity]).toString(16)}`).substr(-2);
			this.startDraw(0, 0, `#3cc23f${opacity}`);
			this.drawNextPoint(100, 100);
			this.drawNextPoint(200, 480);
			this.drawNextPoint(300, 0);
			this.drawNextPoint(400, 400);
			this.drawNextPoint(500, 30);
			this.endDraw();
		}
		if (this[chart_B_opacity]) {
			const opacity = (`00${Math.round(this[chart_B_opacity]).toString(16)}`).substr(-2);
			this.startDraw(0, 0, `#f34c44${opacity}`);
			this.drawNextPoint(100, 900);
			this.drawNextPoint(200, 80);
			this.drawNextPoint(300, 100);
			this.drawNextPoint(400, 130);
			this.drawNextPoint(500, 500);
			this.endDraw();
		}
	}

	init() {
		this.setChartWidths();
		this.ctx.scale(2, 2);
		this.ctx.translate(0, this.height);
		this.drawAll();
		changingFields.forEach(initChangesObject.bind(this.changes));
	}

	startChangeKey(key, targetVal) {
		const val = this.changes[key];
		val.startTimestamp = Date.now();
		val.deltaValue = targetVal - this[key];
		val.originalValue = this[key];
		if (!this.animateFrameId) {
			this.animateFrameId = requestAnimationFrame(this.changeAllStep.bind(this));
		}
	}

	changeKeyStep(key) {
		const val = this.changes[key];
		if (val.startTimestamp === -1) {
			return false;
		}
		const delta = Date.now() - val.startTimestamp;
		let deltaScale = delta / duration;
		if (deltaScale > 1) {
			deltaScale = 1;
		}
		const additionalVal = val.deltaValue * deltaScale;
		this[key] = val.originalValue + additionalVal;

		if (deltaScale >= 1) {
			initChangesObject.call(this.changes, key);
		}
		return true;
	}

	changeAllStep() {
		const somethingChanged = changingFields.reduce((keyChanged, key) => { return this.changeKeyStep(key) || keyChanged; }, false);

		this.animateFrameId = null;
		if (somethingChanged) {
			this.drawAll();
			if (!this.animateFrameId) {
				this.animateFrameId = requestAnimationFrame(this.changeAllStep.bind(this));
			}
		}
	}
}

const main_chart = document.getElementById('main_chart');
const chart_map = document.getElementById('chart_map');
const height = 500,
	map_height = 100;

const mainChart = new Chart(main_chart, height);
const mapChart = new Chart(chart_map, map_height, 500, 900);
mapChart.isDrawAxis = false;
mainChart.init();
mapChart.init();

// ====== UI buttons ====== //

document.getElementById('action_btn').onclick = function () {
	const new_height = +document.getElementById('height_val').value;
	mainChart.startChangeKey(my, new_height);
};

document.getElementById('action_btn_2').onclick = function () {
	const new_width = +document.getElementById('width_val').value;
	mainChart.startChangeKey(mx, new_width);
};

document.getElementById('action_randomize').onclick = function () {
	const new_width = Math.round((Math.random() * 1000) + 100);
	const new_height = Math.round((Math.random() * 1000) + 100);
	const new_x_shift = Math.round((Math.random() * 100) - 50);
	const new_y_shift = Math.round((Math.random() * 100) - 50);
	document.getElementById('width_val').value = new_width;
	document.getElementById('height_val').value = new_height;
	mainChart.startChangeKey(mx, new_width);
	mainChart.startChangeKey(my, new_height);
	mainChart.startChangeKey(zx, new_x_shift);
	mainChart.startChangeKey(zy, new_y_shift);
};

document.getElementById('toggle_A').onclick = function () {
	mainChart.startChangeKey(chart_B_opacity, 0);
	mainChart.startChangeKey(my, 500);

	mapChart.startChangeKey(chart_B_opacity, 0);
	mapChart.startChangeKey(my, 500);
};

document.getElementById('toggle_B').onclick = function () {
	mainChart.startChangeKey(chart_B_opacity, 255);
	mainChart.startChangeKey(my, 950);

	mapChart.startChangeKey(chart_B_opacity, 255);
	mapChart.startChangeKey(my, 950);
};

const map_container = document.getElementById('map_container');
let container_width = map_container.clientWidth;
const thumb = document.getElementById('thumb');
const overlay_left = document.getElementById('overlay_left');
const overlay_right = document.getElementById('overlay_right');

const move_duration = 100;
let moveStartTime = -1;
let originalRight = -1;
let moveValue = -1;
let moveFrame = -1;

function moveThumbStep() {
	moveFrame = -1;
	if (moveStartTime === -1) {
		return;
	}
	const delta = Date.now() - moveStartTime;
	let deltaScale = delta / move_duration;
	if (deltaScale > 1) {
		deltaScale = 1;
	}
	const additionalVal = moveValue * deltaScale;
	console.log('step ' + additionalVal);
	thumb.style.right = `${originalRight - additionalVal}px`;

	mainChart.moveX(additionalVal);
	mainChart.drawAll();

	if (deltaScale >= 1) {
		moveStartTime = -1;
		originalRight = -1;
		moveValue = -1;
	} else if (moveFrame === -1) {
		moveFrame = requestAnimationFrame(moveThumbStep);
	}
}

thumb.onselect = function () {
	return false;
};

const thumb_width = thumb.clientWidth;
overlay_left.style.width = `${container_width - thumb_width}px`;

function moveChart(dx) {
	// ToDo: set limits
	const dx_int = Math.round(dx);
	const right = +thumb.style.right.slice(0, -2);
	thumb.style.right = `${right - dx_int}px`;

	overlay_right.style.width = `${right - dx_int}px`;
	overlay_left.style.width = `${container_width - right - thumb_width + dx_int}px`;

	mainChart.moveX(dx_int);
	mainChart.drawAll();
}

let prevTouch = null;

thumb.addEventListener('touchstart', (event) => {
	[prevTouch] = event.changedTouches;
});

thumb.addEventListener('touchmove', (event) => {
	let touch = event.changedTouches[0];
	if (event.changedTouches.length > 1 && prevTouch) {
		const touches = event.changedTouches.filter((e) => { return e.identifier === prevTouch.identifier; });
		if (touches.length) {
			[touch] = touches;
		}
	}
	if (prevTouch && touch) {
		const dx = touch.pageX - prevTouch.pageX;
		moveChart(dx);
	}
	prevTouch = touch;
});

thumb.addEventListener('touchend', () => {
	prevTouch = null;
});
thumb.addEventListener('touchcancel', () => {
	prevTouch = null;
});

let dragStart = false;

thumb.addEventListener('mousedown', () => {
	dragStart = true;
});

thumb.addEventListener('mousemove', (event) => {
	if (!dragStart) {
		return;
	}
	const dx = event.movementX;
	let ratio = window.devicePixelRatio;
	if (!ratio) {
		ratio = 1;
	}
	moveChart(dx / ratio);
});

document.addEventListener('mouseup', () => {
	dragStart = false;
});

window.onresize = () => {
	// ToDo: handle animations that are in progress
	mainChart.init();
	mapChart.init();
	container_width = map_container.clientWidth;
};
