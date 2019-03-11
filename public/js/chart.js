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
	mx: width,
	my: height,
	zx: 0,
	zy: 0
}

function drawAxis(){
	ctx.beginPath();	
	ctx.lineWidth = thickness;
	ctx.strokeStyle = axis_color;
	ctx.beginPath();
	ctx.moveTo(thickness, 0);
	ctx.lineTo(thickness, height - thickness);
	ctx.lineTo(width, height - thickness);
	ctx.stroke();

	ctx.font = "14px Arial";
	ctx.fillText(`${state.zx},${state.zy}`, 10, height - 10);
	ctx.fillText(`${state.mx + state.zx}`, width - 30, height - 10);
	ctx.fillText(`${state.my + state.zy}`, 10, 10);
}

function drawLine(orig_x0, orig_y0, orig_x1, orig_y1){
	let x0 = orig_x0 - state.zx, x1 = orig_x1 - state.zx,
		y0 = - orig_y0 + state.zy, y1 = - orig_y1 + state.zy;
	ctx.lineWidth = thickness;
	ctx.strokeStyle = '#3DC23F';
	ctx.beginPath();
	ctx.moveTo(x0, y0);
	ctx.lineTo(x1, y1);
	ctx.stroke();

	ctx.fillStyle = '#3DC23F';
	ctx.beginPath();
	ctx.arc(x0, y0, radius * 0.8, 0, 2 * Math.PI);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(x1, y1, radius * 0.8, 0, 2 * Math.PI);
	ctx.fill();
}

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

ctx.translate(0.5, height + 0.5);
drawLine(0, 0, 100, 100);
drawLine(100, 100, 200, 480);
drawLine(200, 480, 300, 000);
drawLine(300, 000, 400, 400);
drawLine(400, 400, 500, 30);

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


