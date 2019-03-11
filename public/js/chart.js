// console.log(data);

(function() {
    const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                                window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

const width = 700, height = 500, map_height = 100;

const main_chart = document.getElementById("main_chart");
const chart_map = document.getElementById("chart_map");
const ctx = main_chart.getContext("2d");
const axis_color = "#f2f4f5";
const radius = 2, thickness = radius * 2;
const duration = 300; // ms

let state = {
	mx: width * 0.7,
	my: height  * 2,
	zx: 0,
	zy: 0,
	animateFrameId: null
}

function clearChart() {
	ctx.clearRect(0, 0, main_chart.width, -main_chart.height);
}

function calcScale () {
	state.scale_x = width / (state.mx - state.zx);
	state.scale_y = height / (state.my - state.zy);
}

function drawAxis(){
	ctx.beginPath();	
	ctx.lineWidth = thickness;
	ctx.strokeStyle = axis_color;
	ctx.beginPath();
	ctx.moveTo(thickness, - height);
	ctx.lineTo(thickness, 0 - thickness);
	ctx.lineTo(width, 0 - thickness);
	ctx.stroke();

	ctx.font = "14px Arial";
	ctx.fillText(`${state.zx},${state.zy}`, 10, - 10);
	ctx.fillText(`${state.mx + state.zx}`, width - 30, - 10);
	ctx.fillText(`${state.my + state.zy}`, 10, - height + 10);
}

function translateX (orig_x) {
	return Math.floor((orig_x - state.zx) * state.scale_x);
}

function translateY (orig_y) {
	return  Math.floor((- orig_y + state.zy) * state.scale_y);
}

function startDraw(orig_x0, orig_y0) {
	ctx.lineWidth = thickness;
	ctx.strokeStyle = '#3DC23F';
	ctx.lineJoin = 'round';
	// ctx.miterLimit = 1;
	ctx.beginPath();

	let x0 = translateX(orig_x0), y0 = translateY(orig_y0);
	ctx.moveTo(x0, y0);
}

function drawNextPoint(orig_x, orig_y) {
	let x = translateX(orig_x), y = translateY(orig_y);
	ctx.lineTo(x, y);
}

function endDraw() {
	ctx.stroke();
}

function drawChart() {
	startDraw(0, 0);
	drawNextPoint(100, 100);
	drawNextPoint(200, 480);
	drawNextPoint(300, 000);
	drawNextPoint(400, 400);
	drawNextPoint(500, 30);
	endDraw();
}

function drawAll() {
	clearChart();
	calcScale();
	drawAxis();
	drawChart();
}

ctx.translate(0, height);
drawAll();

let changeHeightStart = -1;
let changeHeight = -1;
let originalMy = -1;

let changeWidthStart = -1;
let changeWidth = -1;
let originalMx = -1;

function startChangeHeight(targetVal) {
	changeHeightStart = Date.now();
	changeHeight = targetVal - state.my;
	originalMy = state.my;
	if(!state.animateFrameId) {
		state.animateFrameId = requestAnimationFrame(changeAllStep);
	}
}

function changeHeightStep() {
	if(changeHeightStart == -1) {
		return false;
	}
	let delta = Date.now() - changeHeightStart;
	let deltaScale = delta / duration;
	if (deltaScale > 1) {
		deltaScale = 1;
	}
	let additionalHeight = changeHeight * deltaScale;
	state.my = originalMy + additionalHeight;

	if(deltaScale >= 1) {
		changeHeightStart = -1;
		changeHeight = -1;
		originalMy = -1;
	}
	return true;
}

function startChangeWidth(targetVal) {
	changeWidthStart = Date.now();
	changeWidth = targetVal - state.mx;
	originalMx = state.mx;
	if(!state.animateFrameId) {
		state.animateFrameId = requestAnimationFrame(changeAllStep);
	}
}

function changeWidthStep() {
	if(changeWidthStart == -1) {
		return false;
	}
	let delta = Date.now() - changeWidthStart;
	let deltaScale = delta / duration;
	if (deltaScale > 1) {
		deltaScale = 1;
	}
	let additionalWidth = changeWidth * deltaScale;
	state.mx = originalMx + additionalWidth;

	if(deltaScale >= 1) {
		changeWidthStart = -1;
		changeWidth = -1;
		originalMx = -1;
	}
	return true;
}

function changeAllStep() {
	let somethingChanged = false;
	state.animateFrameId = null;
	somethingChanged = changeHeightStep() || somethingChanged;
	somethingChanged = changeWidthStep() || somethingChanged;
	if(somethingChanged) {
		drawAll();
		if(!state.animateFrameId) {
			state.animateFrameId = requestAnimationFrame(changeAllStep);
		}
	}
}

document.getElementById('action_btn').onclick = function(){
	const new_height = +document.getElementById('height_val').value;
	startChangeHeight(new_height);
};

document.getElementById('action_btn_2').onclick = function(){
	const new_width = +document.getElementById('width_val').value;
	console.log(new_width);
	startChangeWidth(new_width);
};

document.getElementById('action_randomize').onclick = function(){
	const new_width = Math.round(Math.random() * 1000 + 100);
	const new_height = Math.round(Math.random() * 1000 + 100);
	document.getElementById('width_val').value = new_width;
	document.getElementById('height_val').value = new_height;
	startChangeWidth(new_width);
	startChangeHeight(new_height);	
};
