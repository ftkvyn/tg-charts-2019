/* eslint-disable  */
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


const main_chart = document.getElementById('main_chart');
const chart_map = document.getElementById('chart_map');
const ctx = main_chart.getContext('2d');
const ctx_map = main_chart.getContext('2d');
const axis_color = '#f2f4f5';
let width = main_chart.clientWidth;
let map_width = chart_map.clientWidth;
const height = 500,
	map_height = 100;

const thickness = 2.5;
const duration = 300; // ms

const mx = Symbol('Max X'),
	my = Symbol('Max Y'),
	zx = Symbol('Shift X'),
	zy = Symbol('Shift Y'),
	chart_A_opacity = Symbol('Chart A opacity'),
	chart_B_opacity = Symbol('Chart B opacity');

const state = {
	[mx]: width,
	[my]: height * 2,
	[zx]: 0,
	[zy]: 0,
	width: width,
	height: height,
	animateFrameId: null,
	[chart_A_opacity]: 255,
	[chart_B_opacity]: 255,
	canv: main_chart,
	ctx: ctx
};

const map_state = {
	[mx]: map_width,
	[my]: map_height * 2,
	[zx]: 0,
	[zy]: 0,
	width: map_width,
	height: map_width,
	animateFrameId: null,
	[chart_A_opacity]: 255,
	[chart_B_opacity]: 255,
	canv: chart_map,
	ctx: ctx_map
};

function setChartWidths() {
	state.width = state.canv.clientWidth;
	state.canv.width = state.width * 2;

	// map_width = chart_map.clientWidth;
	// chart_map.width = map_width * 2;
}

function translateX(orig_x) {
	return Math.floor((orig_x - state[zx]) * state.scale_x);
}

function translateY(orig_y) {
	return Math.floor((-orig_y + state[zy]) * state.scale_y);
}

function clearChart() {
	state.ctx.clearRect(0, 0, state.canv.width, -state.canv.height);
}

// function clearMap() {
// 	ctx_map.clearRect(0, 0, chart_map.width, -chart_map.height);
// }

function calcScale() {
	state.scale_x = state.width / (state[mx] - state[zx]);
	state.scale_y = state.height / (state[my] - state[zy]);
}

// function calcScaleMap() {
// 	map_state.scale_x = map_width / (map_state[mx] - map_state[zx]);
// 	smap_statetate.scale_y = map_height / (map_state[my] - map_state[zy]);
// }

function drawAxis() {
	ctx.beginPath();
	ctx.lineWidth = thickness;
	ctx.strokeStyle = axis_color;
	ctx.beginPath();
	ctx.moveTo(thickness, -state.height);
	ctx.lineTo(thickness, 0 - thickness);
	ctx.lineTo(state.width, 0 - thickness);
	ctx.stroke();

	ctx.font = '14px Arial';
	ctx.fillText(`${Math.round(state[zx])},${Math.round(state[zy])}`, 10, -10);
	ctx.fillText(`${Math.round(state[mx]) + Math.round(state[zx])}`, state.width - 40, -10);
	ctx.fillText(`${Math.round(state[my]) + Math.round(state[zy])}`, 10, -state.height + 20);
}

function startDraw(orig_x0, orig_y0, color) {
	ctx.lineWidth = thickness;
	ctx.strokeStyle = color;
	ctx.lineJoin = 'round';
	ctx.beginPath();

	let x0 = translateX(orig_x0),
		y0 = translateY(orig_y0);
	ctx.moveTo(x0, y0);
}

function drawNextPoint(orig_x, orig_y) {
	let x = translateX(orig_x),
		y = translateY(orig_y);
	ctx.lineTo(x, y);
}

function endDraw() {
	ctx.stroke();
}

function drawChart() {
	if (state[chart_A_opacity]) {
		const opacity = (`00${Math.round(state[chart_A_opacity]).toString(16)}`).substr(-2);
		startDraw(0, 0, `#3cc23f${opacity}`);
		drawNextPoint(100, 100);
		drawNextPoint(200, 480);
		drawNextPoint(300, 0);
		drawNextPoint(400, 400);
		drawNextPoint(500, 30);
		endDraw();
	}
	if (state[chart_B_opacity]) {
		const opacity = (`00${Math.round(state[chart_B_opacity]).toString(16)}`).substr(-2);
		startDraw(0, 0, `#f34c44${opacity}`);
		drawNextPoint(100, 900);
		drawNextPoint(200, 80);
		drawNextPoint(300, 100);
		drawNextPoint(400, 130);
		drawNextPoint(500, 500);
		endDraw();
	}
}

function drawAll() {
	clearChart();
	calcScale();
	drawChart();
	drawAxis();
}


const changes = {};

function initChangesObject(key) {
	changes[key] = {
		startTimestamp: -1,
		deltaValue: -1,
		originalValue: -1,
	};
}
const changingFields = [mx, my, zx, zy, chart_A_opacity, chart_B_opacity];

function init() {
	setChartWidths();
	ctx.scale(2, 2);
	ctx.translate(0, height);
	drawAll();
	changingFields.forEach(initChangesObject);
}
init();

function startChangeKey(key, targetVal) {
	const val = changes[key];
	val.startTimestamp = Date.now();
	val.deltaValue = targetVal - state[key];
	val.originalValue = state[key];
	if (!state.animateFrameId) {
		state.animateFrameId = requestAnimationFrame(changeAllStep);
	}
}

function changeKeyStep(key) {
	const val = changes[key];
	if (val.startTimestamp == -1) {
		return false;
	}
	const delta = Date.now() - val.startTimestamp;
	let deltaScale = delta / duration;
	if (deltaScale > 1) {
		deltaScale = 1;
	}
	const additionalVal = val.deltaValue * deltaScale;
	state[key] = val.originalValue + additionalVal;

	if (deltaScale >= 1) {
		initChangesObject(key);
	}
	return true;
}

function changeAllStep() {
	const somethingChanged = changingFields.reduce((keyChanged, key) => { return changeKeyStep(key) || keyChanged ;}, false);

	state.animateFrameId = null;
	if (somethingChanged) {
		drawAll();
		if (!state.animateFrameId) {
			state.animateFrameId = requestAnimationFrame(changeAllStep);
		}
	}
}

// ====== UI buttons ====== //

document.getElementById('action_btn').onclick = function () {
	const new_height = +document.getElementById('height_val').value;
	startChangeKey(my, new_height);
};

document.getElementById('action_btn_2').onclick = function () {
	const new_width = +document.getElementById('width_val').value;
	startChangeKey(mx, new_width);
};

document.getElementById('action_randomize').onclick = function () {
	const new_width = Math.round(Math.random() * 1000 + 100);
	const new_height = Math.round(Math.random() * 1000 + 100);
	const new_x_shift = Math.round(Math.random() * 100 - 50);
	const new_y_shift = Math.round(Math.random() * 100 - 50);
	document.getElementById('width_val').value = new_width;
	document.getElementById('height_val').value = new_height;
	startChangeKey(mx, new_width);
	startChangeKey(my, new_height);
	startChangeKey(zx, new_x_shift);
	startChangeKey(zy, new_y_shift);
};

document.getElementById('toggle_A').onclick = function () {
	startChangeKey(chart_B_opacity, 0);
	startChangeKey(my, 500);
};

document.getElementById('toggle_B').onclick = function () {
	startChangeKey(chart_B_opacity, 255);
	startChangeKey(my, 950);
};

let prevTouch = null;

main_chart.addEventListener('touchstart', (event) => {
	prevTouch = event.changedTouches[0];
});

main_chart.addEventListener('touchmove', (event) => {
	let touch = event.changedTouches[0];
	if (event.changedTouches.length > 1 && prevTouch) {
		let touches = event.changedTouches.filter( e => e.identifier === prevTouch.identifier);
		if (touches.length) {
			touch = touches[0];
		}
	}
	if (prevTouch && touch) {
		const dx = touch.pageX - prevTouch.pageX;
		// const dy = -(touch.pageY - prevTouch.pageY);
		state[zx] -= dx;
		state[mx] -= dx;
		// state[zy] -= dy;
		// state[my] -= dy;
		drawAll();
	}
	prevTouch = touch;
	console.log(touch);
});

main_chart.addEventListener('touchend', (event) => {
	prevTouch = null;
});
main_chart.addEventListener('touchcancel', (event) => {
	prevTouch = null;
});

window.onresize = () => {
	// ToDo: handle animations that are in progress
	init();
};
