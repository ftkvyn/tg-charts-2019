console.log(data);

(function() {
    const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                                window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

let prev = 0;
let vel = 100; // vel px per second;
let left = 0;
let counter = 0;

function step(timestamp) {
    let progress = timestamp - prev; //ms
    prev = timestamp;
    // console.log(progress);
    // console.log(timestamp);
    // console.log('---------------');
    left += progress * vel / 1000;
    move.style.left = left  + "px";
    if(left > 120 || left < 0){
        vel = -vel;
    }
    if (counter++ < 2000) 
    {
        requestAnimationFrame(step);
    }
}

requestAnimationFrame(step);