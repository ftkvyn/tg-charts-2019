/* eslint-disable no-continue */
/* jshint esversion: 6 */
(function (global) {
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	// eslint-disable-next-line prefer-destructuring
	const document = global.document;
	const requestAnimationFrame = global.requestAnimationFrame || global.mozRequestAnimationFrame ||
	global.webkitRequestAnimationFrame || global.msRequestAnimationFrame;
	global.requestAnimationFrame = requestAnimationFrame;

	document.getElementById('app').onselectstart = function () {
		return false;
	};

	const dark_background_color = '#1d2837';
	const dark_color = '#242f3e';
	const white_color = '#ffffff';
	const black_color = '#000000';
	let isLight = false;
	const axis_color = '#f2f4f5';
	const axis_color_dark = '#303d4a';
	const text_color_dark = '#788490';
	const duration = 200; // ms
	const padding_y = 0.08;
	const padding_x = 0.003;
	let dataNum = 0;
	const min_thumb_width = 50;

	const x_legend_padding = 20;
	const x_legend_val_width = 60;

	const y_legend_row_height = 50;
	const y_legend_text_height = 10;

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

	function getDateText(timestamp) {
		const date = new Date(timestamp);
		return [`${months[date.getMonth()]} ${date.getDate()}`, days[date.getDay()]];
	}

	function getOpacity(val) {
		return (`00${Math.round(val).toString(16)}`).substr(-2);
	}

	class Chart {
		constructor(canv, height) {
			this.width = canv.clientWidth;
			this.height = height;
			this.yLegendItemsCount = Math.round(height / (y_legend_row_height));
			this.animateFrameId = null;
			this.canv = canv;
			this.ctx = canv.getContext('2d');
			this.changes = {};

			this.thickness = 2;
			this.axisThickness = 1;

			this.entangledChart = null;
			this.isDrawAxis = true;
			this.data = null;
			this.x_vals = [];
			this.graphs = [];

			this.x_legend = [];
			this.y_legend = [];

			this.prevSkipItemsEachStep = undefined;
			this.itemsOnScreen = undefined;
		}

		setData(data) {
			this[mx] = undefined;
			this[zx] = undefined;
			this[my] = undefined;
			this[zy] = undefined;
			this.prev_end_i = undefined;
			this.prev_start_i = undefined;
			this.x_vals = [];
			this.x_legend = [];

			this.details_x = undefined;

			this.y_legend = [];
			this.graphs = [];
			this.data = data;
			this.prevSkipItemsEachStep = undefined;
			this.itemsOnScreen = undefined;
			this.prevLength = undefined;
			this.prevVisibleItems = undefined;
			this.prevVisibleItemsChange = undefined;
			this.prev_details_num = undefined;

			for (let i = 0; i < this.data.columns.length; i += 1) {
				const col = [...this.data.columns[i]];
				const key = col.shift();
				if (key === 'x') {
					this.x_vals = col;
					this.x_legend = col.map((val) => {
						const dayNames = getDateText(val);
						return {
							name: dayNames[0],
							day: dayNames[1],
							x: val,
							opacity: 255,
							display: true,
						};
					});
				} else {
					const graph = {
						name: this.data.names[key],
						color: this.data.colors[key],
						opacityKey: key,
						display: true,
						y_vals: col,
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
		}

		setChartWidths() {
			this.width = this.canv.clientWidth;
			this.canv.width = this.width * 2;
			if (this.detailsCanv) {
				this.detailsCanv.width = this.width * 2;
			}
		}

		translateX(orig_x) {
			return Math.floor((orig_x - this[zx]) * this.scale_x);
		}

		translateY(orig_y) {
			return Math.floor((-orig_y + this[zy]) * this.scale_y) - (this.isDrawAxis ? x_legend_padding : 0);
		}

		translateBackX(real_x) {
			return (real_x / this.scale_x) + this[zx];
		}

		clearChart() {
			this.ctx.clearRect(0, 0, this.canv.width, -this.canv.height);
		}

		clearDetails() {
			this.detailsCtx.clearRect(0, 0, this.canv.width, -this.canv.height);
		}

		calcScale() {
			this.scale_x = this.width / (this[mx] - this[zx]);
			if (!this.isDrawAxis) {
				this.scale_y = this.height / (this[my] - this[zy]);
			} else {
				this.scale_y = (this.height - x_legend_padding) / (this[my] - this[zy]);
			}
		}

		moveX(dx) {
			this[zx] -= dx;
			this[mx] -= dx;
		}

		static hideOrShowXLabel(val, toSkip, isInitial) {
			if (toSkip === 0) {
				if (!val.display) {
					val.display = true;
					if (!isInitial) {
						val.startTimestamp = Date.now();
					} else {
						val.opacity = 255;
					}
				}
				return true;
			}

			if (val.display) {
				val.display = false;
				if (!isInitial) {
					val.startTimestamp = Date.now();
				} else {
					val.opacity = 0;
				}
			} else {
				// Speeding up hiding.
				val.startTimestamp -= duration / 2;
			}
			return false;
		}

		processXLabels(from, to, skipItemsEachStep, isInitial) {
			let step = 1;
			if (from > to) {
				step = -1;
			}
			let toSkip = 0;
			for (let i = from; i !== to; i += step) {
				if (this.x_legend[i]) {
					if (Chart.hideOrShowXLabel(this.x_legend[i], toSkip, isInitial)) {
						toSkip = skipItemsEachStep;
					} else {
						toSkip -= 1;
					}
				}
			}
		}

		isXLabelVisible(val) {
			const x = this.translateX(val.x);
			// If visible on the screen
			if (x > (-x_legend_val_width / 2) && x < (this.width + (x_legend_val_width / 2))) {
				return true;
			}
			return false;
		}

		calculateXLabels(isInitial) {
			if (!this.isDrawAxis) {
				return;
			}
			const length = this[mx] - this[zx];
			if (Math.abs(this.prevLength - length) < 5) {
				return;
			}
			const itemsOnScreen = Math.floor(this.width / (x_legend_val_width));
			// eslint-disable-next-line no-mixed-operators
			const dxOnScreen = this.prev_end_i - this.prev_start_i + 1;
			this.prevLength = length;
			let skipItemsEachStep = Math.floor(dxOnScreen / itemsOnScreen);
			if (skipItemsEachStep < 0) {
				skipItemsEachStep = 0;
			}
			if (this.prevSkipItemsEachStep === skipItemsEachStep) {
				return;
			}
			if (!isInitial) {
				let visibleItems = 0;
				for (let i = 0; i < this.x_legend.length; i += 1) {
					if (this.x_legend[i] && this.isXLabelVisible(this.x_legend[i]) && this.x_legend[i].display) {
						visibleItems += 1;
					}
				}
				if (visibleItems === this.prevVisibleItems) {
					return;
				}
				if (this.prevVisibleItems) {
					const visibleItemsChange = this.prevVisibleItems - visibleItems;
					if (visibleItemsChange === -this.prevVisibleItemsChange) {
						// Handling situation with change 6-7-6-7 or 5-6-5-6 and similar
						return;
					}
					this.prevVisibleItemsChange = visibleItemsChange;
				}
				this.prevVisibleItems = visibleItems;
			}
			this.prevSkipItemsEachStep = skipItemsEachStep;
			let start = this.prev_end_i - 1;
			if (!isInitial) {
				while (start > 0 && !this.x_legend[start].display) {
					start -= 1;
				}
			}
			if (start >= this.x_legend.length) {
				start = this.x_legend.length - 1;
			}
			this.processXLabels(start, -1, skipItemsEachStep, isInitial);
			this.processXLabels(start, this.x_legend.length, skipItemsEachStep, isInitial);
		}

		drawAxis() {
			if (!this.isDrawAxis) {
				return;
			}
			// Configuration
			let strokeColor = null;
			if (isLight) {
				strokeColor = axis_color;
			} else {
				strokeColor = axis_color_dark;
			}
			this.ctx.font = '14px Arial';
			const textColor = isLight ? text_color_dark : text_color_dark;

			// y-legend
			this.y_legend = this.y_legend.filter((leg) => { return leg.display || leg.opacity; }); // removing old garbage.
			for (let i = 0; i < this.y_legend.length; i += 1) {
				this.ctx.lineWidth = this.axisThickness;
				const item = this.y_legend[i];
				if (item.y === 0) {
					this.ctx.lineWidth = this.axisThickness * 2;
				}
				this.ctx.strokeStyle = strokeColor + getOpacity(item.opacity);
				this.ctx.beginPath();
				this.ctx.moveTo(0, this.translateY(item.y));
				this.ctx.lineTo(this.width, this.translateY(item.y));
				this.ctx.stroke();
				this.ctx.fillStyle = textColor + getOpacity(item.opacity);
				this.ctx.fillText(`${item.y}`, 0, this.translateY(item.y) - y_legend_text_height);
			}

			this.ctx.lineWidth = this.axisThickness;

			// x-legend
			for (let i = this.prev_start_i - 2; i < this.prev_end_i; i += 1) {
				if (this.x_legend[i]) {
					const val = this.x_legend[i];
					if (val.opacity) {
						this.ctx.fillStyle = textColor + getOpacity(val.opacity);
						const x = this.translateX(val.x) - Math.round(x_legend_val_width / 2);
						this.ctx.fillText(val.name, x, -3);
					}
				}
			}
		}

		drawDetails() {
			// details
			if (this.isDrawAxis && this.details_num > -1) {
				if (this.details_num === this.prev_details_num) {
					return;
				}
				this.prev_details_num = this.details_num;
				this.clearDetails();
				// Configuration
				let strokeColor = null;
				if (isLight) {
					strokeColor = axis_color;
				} else {
					strokeColor = axis_color_dark;
				}
				// ToDo: check if detailed_num changed. If not - do nothing.
				const x = this.translateX(this.x_vals[this.details_num]);
				this.detailsCtx.lineWidth = this.axisThickness * 2;
				this.detailsCtx.strokeStyle = strokeColor;
				this.detailsCtx.beginPath();
				this.detailsCtx.moveTo(x, this.translateY(0));
				this.detailsCtx.lineTo(x, -this.height);
				this.detailsCtx.stroke();

				const oldInfo = this.infoBox.getElementsByClassName('item');
				while (oldInfo.length > 0) {
					this.infoBox.removeChild(oldInfo[0]);
				}

				this.infoBox.getElementsByClassName('date')[0].innerText = `${this.x_legend[this.details_num].day}, ${this.x_legend[this.details_num].name}`;
				let moreThanHalf = 0;
				let lessThanHalf = 0;
				const half = (this[my] - this[zy]) / 2;

				this.graphs.forEach((gr) => {
					if (gr.display) {
						this.detailsCtx.lineWidth = this.thickness;
						this.detailsCtx.strokeStyle = gr.color;
						this.detailsCtx.fillStyle = isLight ? white_color : dark_background_color;
						this.detailsCtx.beginPath();
						this.detailsCtx.arc(x, this.translateY(gr.y_vals[this.details_num]), this.thickness * 2, 0, 2 * Math.PI);
						this.detailsCtx.fill();
						this.detailsCtx.stroke();
						if (gr.y_vals[this.details_num] > half) {
							moreThanHalf += 1;
						} else {
							lessThanHalf += 1;
						}

						const infoHtml = `<div class="item">
							<div class="value"></div>
							<div class="name"></div>
						</div>`;
						const template = document.createElement('template');
						template.innerHTML = infoHtml;
						const infoEl = template.content.firstChild;
						// ToDo: handle long values
						infoEl.getElementsByClassName('value')[0].innerText = gr.y_vals[this.details_num];
						infoEl.getElementsByClassName('name')[0].innerText = gr.name;
						infoEl.style.color = gr.color;
						this.infoBox.appendChild(infoEl);
					}
				});

				this.infoBox.style.display = 'block';
				let left = x - 50;
				if (this.width - left < 140) {
					left = this.width - 140;
				}
				if (left < 0) {
					left = 0;
				}
				this.infoBox.style.left = `${left}px`;
				if (moreThanHalf > lessThanHalf) {
					this.infoBox.style.top = '';
					this.infoBox.style.bottom = `${x_legend_padding}px`;
				} else {
					this.infoBox.style.bottom = '';
					this.infoBox.style.top = '0px';
				}
			}
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

		drawAll(isInitial) {
			this.clearChart();
			this.calcScale();
			this.calculateXLabels(isInitial);
			this.drawAxis();
			this.drawChart();
			if (this.detailsCanv) {
				this.drawDetails();
			}
		}

		setStartEnd() {
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
			this.start_i = start_i;
			this.end_i = end_i;
		}

		drawChart() {
			this.setStartEnd();

			this.graphs.forEach((gr) => {
				if (this[gr.opacityKey]) {
					const opacity = getOpacity(this[gr.opacityKey]);
					this.startDraw(this.x_vals[this.start_i], gr.y_vals[this.start_i], `${gr.color}${opacity}`);
					for (let i = this.start_i + 1; i < this.end_i; i += 1) {
						this.drawNextPoint(this.x_vals[i], gr.y_vals[i]);
					}
					this.endDraw();
				}
			});
			this.calculateMaxY();
		}

		calculateMaxY(force) {
			this.setStartEnd();
			if (this.prev_start_i !== this.start_i || this.prev_end_i !== this.end_i || force) {
				this.prev_start_i = this.start_i || this.prev_start_i || 0;
				this.prev_end_i = this.end_i || this.prev_end_i || 0;
				const visibleCharts = this.graphs
					.filter((ch) => { return ch.display; });
				if (!visibleCharts.length) {
					return;
				}
				let newMax = Math.max(...visibleCharts
					.map((gr) => { return Math.max(...gr.y_vals.slice(this.prev_start_i, this.prev_end_i)); }));
				newMax += Math.round((newMax - this[zy]) * padding_y);
				if (newMax !== 0 && newMax !== this[my]) {
					if (this.isDrawAxis) {
						for (let i = 0; i < this.y_legend.length; i += 1) {
							const item = this.y_legend[i];
							if (item.display) {
								item.display = false;
								item.startTimestamp = Date.now();
							} else {
								// Speed up disappearing
								item.startTimestamp -= duration / 2;
							}
						}
						let val = 0;
						const step = Math.floor(newMax / this.yLegendItemsCount);
						for (let i = 0; i < this.yLegendItemsCount; i += 1) {
							const item = {
								y: val,
								opacity: 0,
								display: true,
								startTimestamp: Date.now(),
							};
							if (!this[my]) {
								// Initial creation
								item.opacity = 255;
							}
							val += step;
							this.y_legend.push(item);
						}
					}
					if (this[my]) {
						this.startChangeKey(my, newMax);
					} else {
						this[my] = newMax;
						this.drawAll(true);
					}
				}
			}
		}

		init() {
			changingFields.forEach(initChangesObject.bind(this.changes));
			this.setChartWidths();
			this.ctx.scale(2, 2);
			this.ctx.translate(0, this.height);

			if (this.detailsCtx) {
				this.detailsCtx.scale(2, 2);
				this.detailsCtx.translate(0, this.height);
			}
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

		static changeLegendEntry(val) {
			const delta = Date.now() - val.startTimestamp;
			let deltaScale = delta / duration;
			if (deltaScale > 1) {
				deltaScale = 1;
			}
			if (deltaScale === 1) {
				val.startTimestamp = -1;
			}
			return Math.round(255 * deltaScale);
		}

		static processLegendEntry(val) {
			let changed = false;
			if (val.display) {
				if (val.opacity !== 255) {
					changed = true;
					val.opacity = Chart.changeLegendEntry(val);
				}
			} else if (val.opacity !== 0) {
				changed = true;
				val.opacity = 255 - Chart.changeLegendEntry(val);
			}
			return changed;
		}

		changeAxisStep() {
			let changed = false;
			for (let i = 0; i < this.x_legend.length; i += 1) {
				const val = this.x_legend[i];
				changed = Chart.processLegendEntry(val) || changed;
			}

			for (let i = 0; i < this.y_legend.length; i += 1) {
				const val = this.y_legend[i];
				changed = Chart.processLegendEntry(val) || changed;
			}
			return changed;
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
			let somethingChanged = changingFields.reduce((keyChanged, key) => { return this.changeKeyStep(key) || keyChanged; }, false);

			if (this.isDrawAxis) {
				somethingChanged = this.changeAxisStep() || somethingChanged;
			}

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
			this.calculateMaxY(true);
		}

		showDetails(offsetX) {
			// console.log(event);
			// this.details_x = event.offsetX;
			const data_x = this.translateBackX(offsetX);
			this.details_num = -1;
			let prevDelta = Infinity;
			for (let i = this.prev_start_i; i < this.prev_end_i; i += 1) {
				if (this.x_vals[i]) {
					const delta = Math.abs(this.x_vals[i] - data_x);
					if (delta < prevDelta) {
						prevDelta = delta;
						this.details_num = i;
					}
				}
			}
			this.drawDetails();
		}

		hideDetails() {
			this.details_num = -1;
			this.clearDetails();
			this.infoBox.style.display = 'none';
		}

		calculateDetailsOffset() {
			let parent = this.detailsCanv;
			let offsetX = 0;
			while (parent.offsetParent) {
				offsetX += parent.offsetLeft - parent.scrollLeft;
				parent = parent.offsetParent;
			}
			this.detailsCanvOffset = offsetX;
		}

		setUpHoverDetails(detailsCanvas) {
			this.detailsCanv = detailsCanvas;
			this.detailsCtx = detailsCanvas.getContext('2d');
			this.calculateDetailsOffset();

			this.detailsCanv.onmousemove = (event) => { this.showDetails(event.offsetX); };
			this.detailsCanv.addEventListener('touchmove', (event) => {
				const touch = event.changedTouches[0];
				this.showDetails(touch.clientX - this.detailsCanvOffset);
			});

			this.detailsCanv.onmouseleave = this.hideDetails.bind(this);
			this.detailsCanv.addEventListener('touchend', this.hideDetails.bind(this));
			this.detailsCanv.addEventListener('touchcancel', this.hideDetails.bind(this));

			const infoBoxHtml = `<div class="info" style="display:none;">
				<div class="date"></div>
			</div>`;
			const template = document.createElement('template');
			template.innerHTML = infoBoxHtml;
			this.infoBox = template.content.firstChild;

			this.detailsCanv.parentElement.appendChild(this.infoBox);
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

	const bodyEl = document.getElementsByTagName('body')[0];
	const appEl = document.getElementById('app');
	const main_chart = document.getElementById('main_chart');
	const details_chart = document.getElementById('details_chart');
	const chart_map = document.getElementById('chart_map');
	const height = 300,
		map_height = 40;

	const mainChart = new Chart(main_chart, height);
	const mapChart = new Chart(chart_map, map_height);
	mapChart.isDrawAxis = false;
	mapChart.thickness = 1.2;
	mapChart.entangledChart = mainChart;
	mainChart.setUpHoverDetails(details_chart);

	// ====== UI setup ====== //

	const map_container = document.getElementById('map_container');
	let container_width = map_container.clientWidth;
	const thumb = document.getElementById('thumb');
	const thumb_left = document.getElementById('thumb_left');
	const thumb_right = document.getElementById('thumb_right');
	const overlay_left = document.getElementById('overlay_left');
	const overlay_right = document.getElementById('overlay_right');
	const dark_link = document.getElementById('set-theme-dark');
	const light_link = document.getElementById('set-theme-light');

	thumb.onselectstart = function () {
		return false;
	};

	let thumb_width = thumb.offsetWidth;
	overlay_left.style.width = `${container_width - thumb_width}px`;

	function setMapBox(isInitial) {
		if (container_width < thumb_width) {
			thumb_width = 200;
			thumb.style.width = `${thumb_width}px`;
		}
		const right = +thumb.style.right.slice(0, -2);
		const real_from = container_width - thumb_width - right;
		const real_to = real_from + thumb_width;
		const from = mapChart.translateBackX(real_from);
		const to = mapChart.translateBackX(real_to);

		if (!isInitial) {
			mainChart.startChangeKey(zx, from);
			mainChart.startChangeKey(mx, to);
		} else {
			mainChart[zx] = from;
			mainChart[mx] = to;
		}
	}

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
		// eslint-disable-next-line no-mixed-operators
		overlay_left.style.width = `${container_width - right - thumb_width + dx_int}px`;

		setMapBox();
	}

	function moveLeftBorder(dx) {
		let dx_int = Math.round(dx);
		const left_width = overlay_left.offsetWidth;
		if (left_width + dx_int < 0) {
			dx_int = -left_width;
		}
		if (thumb_width - dx_int < min_thumb_width) {
			dx_int = thumb_width - min_thumb_width;
		}
		thumb_width -= dx_int;
		thumb.style.width = `${thumb_width}px`;

		overlay_left.style.width = `${left_width + dx_int}px`;

		setMapBox();
	}

	function moveRightBorder(dx) {
		let dx_int = Math.round(dx);
		const right_width = overlay_right.offsetWidth;
		const right = +thumb.style.right.slice(0, -2);
		if (right_width - dx_int < 0) {
			dx_int = right_width;
		}
		if (thumb_width + dx_int < min_thumb_width) {
			dx_int = min_thumb_width - thumb_width;
		}
		thumb_width += dx_int;
		thumb.style.width = `${thumb_width}px`;
		thumb.style.right = `${right - dx_int}px`;

		overlay_right.style.width = `${right_width - dx_int}px`;

		setMapBox();
	}

	function setupTouchEvents() {
		let prevTouch = null;
		let dragThumbStart = false;
		let dragLeftStart = false;
		let dragRightStart = false;

		function touchMove(event) {
			let touch = event.changedTouches[0];
			if (event.changedTouches.length > 1 && prevTouch) {
				const touches = event.changedTouches.filter((e) => { return e.identifier === prevTouch.identifier; });
				if (touches.length) {
					[touch] = touches;
				}
			}
			if (prevTouch && touch) {
				const dx = touch.pageX - prevTouch.pageX;
				if (dragThumbStart) {
					moveChart(dx);
				} else if (dragLeftStart) {
					moveLeftBorder(dx);
				} if (dragRightStart) {
					moveRightBorder(dx);
				}
			}
			prevTouch = touch;
		}

		thumb.addEventListener('touchstart', (event) => {
			if (!prevTouch) {
				// Handling only the first touch
				[prevTouch] = event.changedTouches;
				dragThumbStart = true;
			}
		});

		thumb_left.addEventListener('touchstart', (event) => {
			if (!prevTouch) {
				// Handling only the first touch
				[prevTouch] = event.changedTouches;
				dragLeftStart = true;
			}
		});

		thumb_right.addEventListener('touchstart', (event) => {
			if (!prevTouch) {
				// Handling only the first touch
				[prevTouch] = event.changedTouches;
				dragRightStart = true;
			}
		});

		thumb.addEventListener('touchmove', touchMove);
		thumb_left.addEventListener('touchmove', touchMove);
		thumb_right.addEventListener('touchmove', touchMove);
		overlay_left.addEventListener('touchmove', touchMove);
		overlay_left.addEventListener('touchmove', touchMove);

		function touchEnd() {
			// ToDo: handle the end of some different touch
			prevTouch = null;
			dragThumbStart = false;
			dragLeftStart = false;
			dragRightStart = false;
		}

		thumb.addEventListener('touchend', touchEnd);

		thumb.addEventListener('touchcancel', touchEnd);
	}

	function setupMouseEvents() {
		let dragThumbStart = false;
		let dragLeftStart = false;
		let dragRightStart = false;
		let prevMouseX = 0;

		function handleMouseMove(event) {
			if (!dragThumbStart && !dragLeftStart && !dragRightStart) {
				return;
			}
			const dx = event.clientX - prevMouseX;
			prevMouseX = event.clientX;
			if (dragThumbStart) {
				moveChart(dx);
			} else if (dragLeftStart) {
				moveLeftBorder(dx);
			} if (dragRightStart) {
				moveRightBorder(dx);
			}
		}

		thumb_left.onmousedown = (event) => {
			dragLeftStart = true;
			event.cancelBubble = true;
			prevMouseX = event.clientX;
			return false;
		};

		thumb_right.onmousedown = (event) => {
			dragRightStart = true;
			event.cancelBubble = true;
			prevMouseX = event.clientX;
			return false;
		};

		thumb.onmousedown = (event) => {
			dragThumbStart = true;
			prevMouseX = event.clientX;
		};

		thumb.onmousemove = handleMouseMove;
		thumb_left.onmousemove = handleMouseMove;
		thumb_right.onmousemove = handleMouseMove;
		overlay_left.onmousemove = handleMouseMove;
		overlay_right.onmousemove = handleMouseMove;

		document.onmouseup = () => {
			dragThumbStart = false;
			dragLeftStart = false;
			dragRightStart = false;
			prevMouseX = 0;
		};
	}

	function setColors() {
		if (isLight) {
			bodyEl.style.background = white_color;
			bodyEl.style.color = black_color;
			bodyEl.classList.remove('dark-theme');
		} else {
			bodyEl.style.background = dark_color;
			bodyEl.style.color = white_color;
			bodyEl.classList.add('dark-theme');
		}
	}

	function run(chartNum) {
		dataNum = chartNum;
		setColors();
		mainChart.setData(data[chartNum]);
		mapChart.entangledChart = mainChart;
		mapChart.setData(data[chartNum]);

		const btns = mapChart.generateControlButtons();
		const oldBtns = appEl.getElementsByClassName('btn');
		while (oldBtns.length > 0) {
			appEl.removeChild(oldBtns[0]);
		}
		btns.forEach((btn) => {
			appEl.appendChild(btn);
		});

		mainChart.init();
		mapChart.init();
		mapChart.drawAll();
		setMapBox(true);
		mainChart.calculateMaxY(true);
		mainChart.drawAll();
	}

	function setupAllEvents() {
		setupTouchEvents();
		setupMouseEvents();

		global.onresize = () => {
			// ToDo: handle animations that are in progress
			mainChart.init();
			mainChart.calculateDetailsOffset();
			mapChart.init();
			mapChart.drawAll();
			container_width = map_container.clientWidth;
			moveChart(0);
			// ToDo: handle when a lot of chart is visible and window is resized down.
			setMapBox();
		};

		dark_link.onclick = () => {
			isLight = false;
			run(dataNum);
			dark_link.style.display = 'none';
			light_link.style.display = 'initial';
		};

		light_link.onclick = () => {
			isLight = true;
			run(dataNum);
			light_link.style.display = 'none';
			dark_link.style.display = 'initial';
		};
	}
	setupAllEvents();

	const links = appEl.getElementsByClassName('chart-link');
	for (let i = 0; i < links.length; i += 1) {
		const link = links[i];
		link.onclick = () => {
			const num = +link.innerText - 1;
			run(num);
			moveChart(0);
		};
	}

	run(0);
}(window));
