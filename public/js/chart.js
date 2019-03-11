// console.log(data);

(function() {
    const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                                window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

const width = 700, height = 500, map_height = 100;

const main_chart = document.getElementById("main_chart");
// main_chart.width = width; main_chart.height = height;
const chart_map = document.getElementById("chart_map");
// main_chart.width = width; main_chart.height = map_height;
const ctx = main_chart.getContext("2d");
const axis_color = "#f2f4f5";
const radius = 2, thickness = radius * 2;
const duration = 500; // ms

let state = {
	mx: width * 0.7,
	my: height  * 2,
	zx: 0,
	zy: 0
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

ctx.translate(0, height);
calcScale();
drawAxis();
drawChart();

let changeStart = -1;
let changeHeight = -1;
let originalMy = -1;

function startChangeHeight(targetVal) {
	changeStart = Date.now();
	changeHeight = targetVal - state.my;
	originalMy = state.my;
	requestAnimationFrame(changeHeightStep);
}

function changeHeightStep() {
	let delta = Date.now() - changeStart;
	let deltaScale = delta / duration;
	if (deltaScale > 1) {
		deltaScale = 1;
	}
	let additionalHeight = changeHeight * deltaScale;
	state.my = originalMy + additionalHeight;

	clearChart();
	calcScale();
	drawAxis();
	drawChart();
	if(deltaScale < 1) {
		requestAnimationFrame(changeHeightStep);
	}
}

document.getElementById('action_btn').onclick = function(){
	const new_height = +document.getElementById('height_val').value;
	console.log(new_height);
	startChangeHeight(new_height);
};
// let prev = 0;
// let vel = 100; // vel px per second;
// let left = 0;
// let counter = 0;

// function step(timestamp) {
//     let progress = timestamp - prev; //ms
//     prev = timestamp;
//     // console.log(progress);
//     // console.log(timestamp);
//     // console.log('---------------');
//     left += progress * vel / 1000;
//     move.style.left = left  + "px";
//     if(left > 120 || left < 0){
//         vel = -vel;
//     }
//     if (counter++ < 2000) 
//     {
//         requestAnimationFrame(step);
//     }
// }

// requestAnimationFrame(step);


