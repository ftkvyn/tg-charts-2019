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

let state = {
	mx: width * 0.7,
	my: height  * 2,
	zx: 0,
	zy: 0
}

function calcScale () {
	state.scale_x = width / (state.mx - state.zx);
	state.scale_y = height / (state.my - state.zy);
}
calcScale();

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

function drawLine(orig_x0, orig_y0, orig_x1, orig_y1) {
	let x0 = orig_x0 - state.zx, x1 = orig_x1 - state.zx,
		y0 = - orig_y0 + state.zy, y1 = - orig_y1 + state.zy;
	
	ctx.lineTo(x1, y1);
	ctx.stroke();
}

ctx.translate(0, height + 0);
drawAxis();

// ctx.beginPath();
// ctx.lineWidth = 4;
// ctx.strokeStyle = '#3DC23F';
// ctx.beginPath();       // Start a new path
// ctx.moveTo(30, 50);    // Move the pen to (30, 50)
// ctx.lineTo(350, 300);  // Draw a line to (150, 100)
// ctx.lineTo(450, 110);
// ctx.lineTo(500, 500);
// ctx.stroke();          // Render the path

startDraw(0, 0);
drawNextPoint(100, 100);
drawNextPoint(200, 480);
drawNextPoint(300, 000);
drawNextPoint(400, 400);
drawNextPoint(500, 30);
endDraw();
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


