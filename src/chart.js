/* jshint esversion: 6 */
// console.log(data[0]);
(function (global) {
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	// eslint-disable-next-line prefer-destructuring
	const document = global.document;
	const requestAnimationFrame = global.requestAnimationFrame || global.mozRequestAnimationFrame ||
	global.webkitRequestAnimationFrame || global.msRequestAnimationFrame;
	global.requestAnimationFrame = requestAnimationFrame;

	document.getElementById('app').onselectstart = function () {
		return false;
	};

	const axis_color = '#f2f4f5';
	const duration = 200; // ms
	const padding_y = 0.0;
	const padding_x = 0.003;

	const mx = Symbol('Max X'),
		my = Symbol('Max Y'),
		zx = Symbol('Shift X'),
		zy = Symbol('Shift Y');

	const changingFields = [mx, my, zx, zy];

	function initChangesObject(key) {
		this[key] = {
			startTimestamp: -1,
			deltaValue: -1,
			originalValue: -1,
		};
	}

	class Chart {
		constructor(canv, height) {
			this.width = canv.clientWidth;
			this.height = height;
			this.animateFrameId = null;
			this.canv = canv;
			this.ctx = canv.getContext('2d');
			this.changes = {};

			this.thickness = 2.5;

			this.entangledChart = null;
			this.isDrawAxis = true;
			this.data = null;
			this.x_vals = [];
			this.graphs = [];
		}

		setData(data) {
			this.x_vals = [];
			this.graphs = [];
			this.data = data;

			for (let i = 0; i < this.data.columns.length; i += 1) {
				const col = [...this.data.columns[i]];
				const key = col.shift();
				if (key === 'x') {
					this.x_vals = col;
				} else {
					const graph = {
						name: this.data.names[key],
						color: this.data.colors[key],
						opacityKey: key,
						display: true,
						y_vals: col,
						max_Y: Math.max(...col),
					};
					this[graph.opacityKey] = 255;
					this.graphs.push(graph);
					if (changingFields.findIndex((val) => { return val === graph.opacityKey; }) === -1) {
						changingFields.push(graph.opacityKey);
					}
				}
			}

			this[zx] = Math.min(...this.x_vals);
			this[mx] = Math.max(...this.x_vals);
			this[mx] += Math.round((this[mx] - this[zx]) * padding_x);

			this[zy] = 0;
			// this[my] = Math.max(...this.graphs.map((gr) => { return gr.max_Y; }));
			// this[my] += Math.round((this[my] - this[zy]) * padding_y);
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
			this.ctx.lineWidth = this.thickness;
			this.ctx.strokeStyle = axis_color;
			this.ctx.beginPath();
			this.ctx.moveTo(this.thickness, -this.height);
			this.ctx.lineTo(this.thickness, 0 - this.thickness);
			this.ctx.lineTo(this.width, 0 - this.thickness);
			this.ctx.stroke();

			this.ctx.font = '14px Arial';
			const startDay = new Date(this[zx]);
			const endDay = new Date(this[mx]);
			this.ctx.fillText(`${months[startDay.getMonth()]} ${startDay.getDate()}`, 10, -10);
			this.ctx.fillText(`${months[endDay.getMonth()]} ${endDay.getDate()}`, this.width - 50, -10);
			this.ctx.fillText(`${Math.round(this[my])}`, 10, -this.height + 20);
		}

		startDraw(orig_x0, orig_y0, color) {
			this.ctx.lineWidth = this.thickness;
			this.ctx.strokeStyle = color;
			this.ctx.lineJoin = 'round';
			this.ctx.lineCap = 'round';
			this.ctx.miterLimit = 0;
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
			let start_i = this.x_vals.findIndex((val) => { return val >= this[zx]; });
			if (start_i > 0) {
				start_i -= 1; // Starting from the first point beyond the chart to the left;
			}
			let end_i = start_i;
			for (; end_i < this.x_vals.length; end_i += 1) {
				if (this.x_vals[end_i] >= this[mx]) {
					break;
				}
			}
			if (end_i < this.x_vals.length) {
				end_i += 1; // Going till the first one beyond the chart to the right;
			}

			this.graphs.forEach((gr) => {
				if (this[gr.opacityKey]) {
					const opacity = (`00${Math.round(this[gr.opacityKey]).toString(16)}`).substr(-2);
					this.startDraw(this.x_vals[start_i], gr.y_vals[start_i], `${gr.color}${opacity}`);
					for (let i = start_i + 1; i < end_i; i += 1) {
						// ToDo: draw only visible points
						this.drawNextPoint(this.x_vals[i], gr.y_vals[i]);
					}
					this.endDraw();
				}
			});
			this.calculateMaxY(start_i, end_i);
		}

		calculateMaxY(start_i, end_i, force) {
			if (this.prev_start_i !== start_i || this.prev_end_i !== end_i || force) {
				this.prev_start_i = start_i || this.prev_start_i;
				this.prev_end_i = end_i || this.prev_end_i;
				let newMax = Math.max(...this.graphs
					.filter((ch) => { return ch.display; })
					.map((gr) => { return Math.max(...gr.y_vals.slice(this.prev_start_i, this.prev_end_i)); }));
				newMax += Math.round((newMax - this[zy]) * padding_y);
				if (newMax !== 0 && newMax !== this[my]) {
					if (this[my]) {
						this.startChangeKey(my, newMax);
					} else {
						this[my] = newMax;
						this.drawAll();
					}
				}
			}
		}

		init() {
			changingFields.forEach(initChangesObject.bind(this.changes));
			this.setChartWidths();
			this.ctx.scale(2, 2);
			this.ctx.translate(0, this.height);
			this.drawAll();
		}

		startChangeKey(key, targetVal) {
			const val = this.changes[key];
			if (val.startTimestamp === -1) {
				val.startTimestamp = Date.now();
			}
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

		toggleChart(key) {
			const chart = this.graphs.find((ch) => { return ch.opacityKey === key; });
			chart.display = !chart.display;
			this.calculateMaxY(null, null, true);
		}

		generateControlButtons() {
			const btns = this.graphs.map((gr) => {
				const template = document.createElement('template');
				const html = `<div class="btn">
				<div class="btn-mark" style="border-color: ${gr.color}"><img src="/img/ch2.png" /></div>
				<div class="btn-text">${gr.name}</div>
			</div>`;
				template.innerHTML = html;
				const el = template.content.firstChild;
				el.onclick = () => {
					const isOff = el.classList.contains('btn-off');
					const targetOpacity = isOff ? 255 : 0;

					this.startChangeKey(gr.opacityKey, targetOpacity);
					this.toggleChart(gr.opacityKey);

					if (this.entangledChart) {
						this.entangledChart.startChangeKey(gr.opacityKey, targetOpacity);
						this.entangledChart.toggleChart(gr.opacityKey);
					}

					if (isOff) {
						el.classList.remove('btn-off');
					} else {
						el.classList.add('btn-off');
					}
				};
				return el;
			});
			return btns;
		}
	}

	const appEl = document.getElementById('app');
	const main_chart = document.getElementById('main_chart');
	const chart_map = document.getElementById('chart_map');
	const height = 350,
		map_height = 45;

	const mainChart = new Chart(main_chart, height);
	const mapChart = new Chart(chart_map, map_height);
	mapChart.isDrawAxis = false;
	mapChart.thickness = 1.5;
	mainChart.setData(data[0]);
	mapChart.entangledChart = mainChart;
	mapChart.setData(data[0]);
	// ToDo: calculate the real scale
	mainChart[zx] += (mapChart[mx] - mapChart[zx]) * 0.87;
	mainChart.init();
	mapChart.init();

	// ====== UI buttons ====== //

	const btns = mapChart.generateControlButtons();
	btns.forEach((btn) => {
		appEl.appendChild(btn);
	});

	const map_container = document.getElementById('map_container');
	let container_width = map_container.clientWidth;
	const thumb = document.getElementById('thumb');
	const overlay_left = document.getElementById('overlay_left');
	const overlay_right = document.getElementById('overlay_right');

	thumb.onselectstart = function () {
		return false;
	};

	const thumb_width = thumb.offsetWidth;
	overlay_left.style.width = `${container_width - thumb_width}px`;

	function moveChart(dx) {
		let dx_int = Math.round(dx);
		const right = +thumb.style.right.slice(0, -2);
		if (right - dx_int < 0) {
			dx_int = right;
		}
		// eslint-disable-next-line no-mixed-operators
		if (container_width - right - thumb_width + dx_int < 0) {
			// eslint-disable-next-line no-mixed-operators
			dx_int = right + thumb_width - container_width;
		}
		thumb.style.right = `${right - dx_int}px`;

		overlay_right.style.width = `${right - dx_int}px`;
		overlay_left.style.width = `${container_width - right - thumb_width + dx_int}px`;

		mainChart.moveX(-dx_int / mapChart.scale_x);
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
		let ratio = global.devicePixelRatio;
		if (!ratio) {
			ratio = 1;
		}
		moveChart(dx / ratio);
	});

	document.addEventListener('mouseup', () => {
		dragStart = false;
	});

	global.onresize = () => {
		// ToDo: handle animations that are in progress
		mainChart.init();
		mapChart.init();
		container_width = map_container.clientWidth;
		moveChart(0);
	};
}(window));
