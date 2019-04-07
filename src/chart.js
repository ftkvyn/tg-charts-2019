/* eslint-disable prefer-destructuring */
/* eslint-disable no-continue */
/* jshint esversion: 6 */
(function (global) {
	// ==== Common things ==== //
	// eslint-disable-next-line prefer-destructuring
	const document = global.document,
		requestAnimationFrame = global.requestAnimationFrame || global.mozRequestAnimationFrame ||
	global.webkitRequestAnimationFrame || global.msRequestAnimationFrame;
	global.requestAnimationFrame = requestAnimationFrame;

	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
		dark_background_color = '#1d2837',
		dark_color = '#242f3e',
		white_color = '#ffffff',
		black_color = '#000000',
		axis_color = '#f2f4f5',
		axis_color_zero = '#ecf0f3',
		axis_color_dark = '#293544',
		axis_color_dark_zero = '#313d4d',
		text_color_dark = '#546778',
		text_color_light = '#96a2aa',
		duration = 220, // ms
		padding_y = 0.0,
		padding_x = 0.003,
		main_chart_padding = 16,
		min_thumb_width = 50,
		x_legend_padding = 20,
		x_legend_val_width = 60,
		y_legend_row_height = 50,
		y_legend_text_height = 10,
		mx = Symbol('Max X'),
		my = Symbol('Max Y'),
		zx = Symbol('Shift X'),
		zy = Symbol('Shift Y');

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

	function formatNumber(val) {
		let str = val.toString();
		const parts = [];
		while (str.length > 3) {
			parts.push(str.substr(str.length - 3));
			str = str.substr(0, str.length - 3);
		}
		parts.push(str);

		return parts.reverse().join(' ');
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

			this.changingFields = [mx, my, zx, zy];

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

		setData(data, type) {
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
			this.details_num = -1;
			this.type = type;

			if (type === 'line') {
				this.drawChart = this.drawLineChart;
				this.getMinAndMax = this.getLinesMinAndMax;
			} else if (type === 'bar') {
				this.drawChart = this.drawBarChart;
				this.getMinAndMax = this.getBarsMinAndMax;
			}

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
					if (this.changingFields.findIndex((val) => { return val === graph.opacityKey; }) === -1) {
						this.changingFields.push(graph.opacityKey);
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
			if (this.isLight) {
				strokeColor = axis_color;
			} else {
				strokeColor = axis_color_dark;
			}
			this.ctx.font = '12px Arial';
			const textColor = this.isLight ? text_color_light : text_color_dark;

			// y-legend
			this.y_legend = this.y_legend.filter((leg) => { return leg.display || leg.opacity; }); // removing old garbage.
			for (let i = 0; i < this.y_legend.length; i += 1) {
				this.ctx.lineWidth = this.axisThickness;
				const item = this.y_legend[i];
				if (item.y === 0) {
					if (this.isLight) {
						strokeColor = axis_color_zero;
					} else {
						strokeColor = axis_color_dark_zero;
					}
				}
				this.ctx.strokeStyle = strokeColor + getOpacity(item.opacity);
				this.ctx.beginPath();
				this.ctx.moveTo(main_chart_padding, this.translateY(item.y));
				this.ctx.lineTo(this.width - main_chart_padding, this.translateY(item.y));
				this.ctx.stroke();
				this.ctx.fillStyle = textColor + getOpacity(item.opacity);
				this.ctx.fillText(`${formatNumber(item.y)}`, main_chart_padding, this.translateY(item.y) - y_legend_text_height);
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
				if (this.type === 'bar') {
					this.clearChart();
					this.drawAxis();
					this.drawChart();
				}
				this.prev_details_num = this.details_num;
				this.clearDetails();
				const x = this.translateX(this.x_vals[this.details_num]);
				let moreThanHalf = 0;
				let lessThanHalf = 0;
				const half = ((this[my] - this[zy]) / 2) + this[zy];
				// Configuration
				if (this.type === 'line') {
					let strokeColor = null;
					if (this.isLight) {
						strokeColor = axis_color_zero;
					} else {
						strokeColor = axis_color_dark_zero;
					}
					this.detailsCtx.lineWidth = this.axisThickness * 2;
					this.detailsCtx.strokeStyle = strokeColor;
					this.detailsCtx.beginPath();
					this.detailsCtx.moveTo(x, this.translateY(0));
					this.detailsCtx.lineTo(x, -this.height);
					this.detailsCtx.stroke();
				}

				const oldInfo = this.infoBox.getElementsByClassName('item');
				while (oldInfo.length > 0) {
					this.infoBox.removeChild(oldInfo[0]);
				}

				this.graphs.forEach((gr) => {
					if (gr.display) {
						if (this.type === 'line') {
							this.detailsCtx.lineWidth = this.thickness;
							this.detailsCtx.strokeStyle = gr.color;
							this.detailsCtx.fillStyle = this.isLight ? white_color : dark_background_color;
							this.detailsCtx.beginPath();
							this.detailsCtx.arc(x, this.translateY(gr.y_vals[this.details_num]), this.thickness * 2, 0, 2 * Math.PI);
							this.detailsCtx.fill();
							this.detailsCtx.stroke();
							if (gr.y_vals[this.details_num] > half) {
								moreThanHalf += 1;
							} else {
								lessThanHalf += 1;
							}
						}

						const infoHtml = `<div class="item">
							<div class="value"></div>
							<div class="name"></div>
						</div>`;
						const template = document.createElement('template');
						template.innerHTML = infoHtml;
						const infoEl = template.content.firstChild;
						infoEl.getElementsByClassName('value')[0].innerText = formatNumber(gr.y_vals[this.details_num]);
						infoEl.getElementsByClassName('name')[0].innerText = gr.name;
						infoEl.style.color = gr.color;
						this.infoBox.appendChild(infoEl);
					}
				});

				this.infoBox.getElementsByClassName('date')[0].innerText = `${this.x_legend[this.details_num].day}, ${this.x_legend[this.details_num].name}`;

				this.infoBox.style.display = 'block';
				let left = x - 50;
				if (this.type === 'bar') {
					left = x - this.infoBox.clientWidth + this.bar_width - 10;
				}
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

		drawLineChart() {
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

		drawNextBarItem(orig_x1, orig_x2, from_y, to_y, num, color) {
			const x1 = this.translateX(orig_x1),
				x2 = this.translateX(orig_x2),
				y1 = this.translateY(from_y),
				y2 = this.translateY(to_y);
			if (this.details_num === -1) {
				this.ctx.fillStyle = `${color}aa`;
			} else if (this.details_num === num) {
				this.ctx.fillStyle = `${color}cc`;
			} else {
				this.ctx.fillStyle = `${color}50`;
			}
			this.bar_width = x2 - x1;
			this.ctx.fillRect(x1, y1, this.bar_width, y2 - y1);
		}

		drawBarChart() {
			this.setStartEnd();
			const x_step = this.x_vals[this.end_i - 1] - this.x_vals[this.end_i - 2];
			for (let i = this.start_i + 1; i < this.end_i; i += 1) {
				let currentHeight = 0;
				for (let k = 0; k < this.graphs.length; k += 1) {
					const gr = this.graphs[k];
					if (this[gr.opacityKey]) {
						// bar charts won't disappear, they will shrink
						const multiplier = this[gr.opacityKey] / 255;
						const dy = multiplier * gr.y_vals[i];
						this.drawNextBarItem(this.x_vals[i], this.x_vals[i] - x_step, currentHeight, currentHeight + dy, i, gr.color);
						currentHeight += dy;
					}
				}
			}
			this.calculateMaxY();
		}

		getLinesMinAndMax(visibleCharts) {
			let newMax = Math.max(...visibleCharts
				.map((gr) => { return Math.max(...gr.y_vals.slice(this.prev_start_i, this.prev_end_i)); }));
			newMax += Math.round((newMax - this[zy]) * padding_y);
			let newMin = Math.min(...visibleCharts
				.map((gr) => { return Math.min(...gr.y_vals.slice(this.prev_start_i, this.prev_end_i)); }));
			newMin -= Math.round(newMin * padding_y);
			if (newMin < 0) {
				newMin = 0;
			}
			return { newMin, newMax };
		}

		getBarsMinAndMax(visibleCharts) {
			let newMax = -1;
			for (let i = this.prev_start_i; i < this.prev_end_i; i += 1) {
				let currentSum = 0;
				for (let k = 0; k < visibleCharts.length; k += 1) {
					currentSum += visibleCharts[k].y_vals[i];
				}
				if (currentSum > newMax) {
					newMax = currentSum;
				}
			}
			newMax += Math.round((newMax - this[zy]) * padding_y);
			const newMin = 0;
			return { newMin, newMax };
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
				const { newMax, newMin } = this.getMinAndMax(visibleCharts);
				if ((newMax !== 0 && newMax !== this[my]) ||
					(newMin !== this[zy])) {
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
						let val = newMin;
						const step = Math.floor((newMax - newMin) / this.yLegendItemsCount);
						for (let i = 0; i < this.yLegendItemsCount; i += 1) {
							let displayVal = val;
							let pow = 0;
							while (displayVal > 100) {
								displayVal /= 10;
								pow += 1;
							}
							displayVal = Math.round(displayVal);
							displayVal *= 10 ** pow;
							const item = {
								y: displayVal,
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
						this.startChangeKey(zy, newMin);
					} else {
						this[my] = newMax;
						this[zy] = newMin;
						this.drawAll(true);
					}
				}
			}
		}

		init() {
			this.changingFields.forEach(initChangesObject.bind(this.changes));
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
			val.startTimestamp = Date.now();
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
			let somethingChanged = this.changingFields.reduce((keyChanged, key) => { return this.changeKeyStep(key) || keyChanged; }, false);

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
			const data_x = this.translateBackX(offsetX);
			this.details_num = -1;
			let prevDelta = Infinity;
			for (let i = this.prev_start_i; i < this.prev_end_i; i += 1) {
				if (this.x_vals[i]) {
					if (this.type === 'line') {
						const delta = Math.abs(this.x_vals[i] - data_x);
						if (delta < prevDelta) {
							prevDelta = delta;
							this.details_num = i;
						}
					} else if (this.type === 'bar') {
						if (this.x_vals[i - 1] && (data_x > this.x_vals[i - 1])) {
							this.details_num = i;
						}
					}
				}
			}
			this.drawDetails();
		}

		hideDetails() {
			this.details_num = -1;
			this.clearDetails();
			this.infoBox.style.display = 'none';
			if (this.type === 'bar') {
				this.clearChart();
				this.drawAxis();
				this.drawChart();
			}
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
			let endId,
				cancelId;

			this.detailsCanv.onmousemove = (event) => { this.showDetails(event.offsetX); };
			this.detailsCanv.addEventListener('touchmove', (event) => {
				const touch = event.changedTouches[0];
				this.showDetails(touch.clientX - this.detailsCanvOffset);
				clearTimeout(endId);
				clearTimeout(cancelId);
			});

			this.detailsCanv.onmouseleave = this.hideDetails.bind(this);
			this.detailsCanv.addEventListener('touchend', () => { endId = setTimeout(this.hideDetails.bind(this), 1200); });
			this.detailsCanv.addEventListener('touchcancel', () => { cancelId = setTimeout(this.hideDetails.bind(this), 1200); });

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
				const html = `<div class="btn btn-on">
				<div class="btn-filler" style="border-color: ${gr.color}"></div>
				<div class="btn-mark"><img class="on-img" src="/img/ch2.png" /></div>
				<div class="btn-text" style="color: ${gr.color}">${gr.name}</div>
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
						el.classList.add('btn-on');
					} else {
						el.classList.remove('btn-on');
						el.classList.add('btn-off');
					}
				};
				return el;
			});
			return btns;
		}
	}

	class ChartContainer {
		constructor(appContainerEl) {
			this.appContainerEl = appContainerEl;
			this.appEl = this.appContainerEl.firstElementChild;
			this.main_chart = this.appEl.getElementsByClassName('main_chart')[0];
			this.details_chart = this.appEl.getElementsByClassName('details_chart')[0];
			this.chart_map = this.appEl.getElementsByClassName('chart_map')[0];
			this.height = 300;
			this.map_height = 40;

			this.mainChart = new Chart(this.main_chart, this.height);
			this.mapChart = new Chart(this.chart_map, this.map_height);
			this.mapChart.isDrawAxis = false;
			this.mapChart.thickness = 1.2;
			this.mapChart.entangledChart = this.mainChart;
			this.mainChart.setUpHoverDetails(this.details_chart);

			this.map_container = this.appEl.getElementsByClassName('map_container')[0];
			this.thumb = this.appEl.getElementsByClassName('selected')[0];
			this.thumb_left = this.appEl.getElementsByClassName('thumb_left')[0];
			this.thumb_right = this.appEl.getElementsByClassName('thumb_right')[0];
			this.overlay_left = this.appEl.getElementsByClassName('overlay_left')[0];
			this.overlay_right = this.appEl.getElementsByClassName('overlay_right')[0];
			this.isLight = true;

			this.setupAllEvents();
		}

		initMapBox() {
			this.container_width = this.map_container.offsetWidth;
			this.thumb_width = this.thumb.offsetWidth;
			this.overlay_left.style.width = `${this.container_width - this.thumb_width}px`;
		}

		tryStartMovingX() {
			if (this.mainChart.changes[zx].startTimestamp === -1) {
				this.mainChart.startChangeKey(zx, this.nextfrom);
				this.mainChart.startChangeKey(mx, this.nextto);
			} else {
				requestAnimationFrame(() => {
					this.tryStartMovingX();
				});
			}
		}

		setMapBox(isInitial) {
			if (this.container_width < this.thumb_width) {
				this.thumb_width = 200;
				this.thumb.style.width = `${this.thumb_width}px`;
			}
			const right = +this.thumb.style.right.slice(0, -2);
			const real_from = this.container_width - this.thumb_width - right;
			const real_to = real_from + this.thumb_width;
			const from = this.mapChart.translateBackX(real_from);
			const to = this.mapChart.translateBackX(real_to);

			if (!isInitial) {
				this.nextfrom = from;
				this.nextto = to;
				this.tryStartMovingX();
				this.mainChart.hideDetails();
			} else {
				this.mainChart[zx] = from;
				this.mainChart[mx] = to;
			}
		}

		moveChart(dx) {
			let dx_int = Math.round(dx);
			const right = +this.thumb.style.right.slice(0, -2);
			if (right - dx_int < 0) {
				dx_int = right;
			}
			// eslint-disable-next-line no-mixed-operators
			if (this.container_width - right - this.thumb_width + dx_int < 0) {
				// eslint-disable-next-line no-mixed-operators
				dx_int = right + this.thumb_width - this.container_width;
			}
			this.thumb.style.right = `${right - dx_int}px`;

			this.overlay_right.style.width = `${right - dx_int}px`;
			// eslint-disable-next-line no-mixed-operators
			this.overlay_left.style.width = `${this.container_width - right - this.thumb_width + dx_int}px`;

			this.setMapBox();
		}

		moveLeftBorder(dx) {
			let dx_int = Math.round(dx);
			const left_width = this.overlay_left.offsetWidth;
			if (left_width + dx_int < 0) {
				dx_int = -left_width;
			}
			if (this.thumb_width - dx_int < min_thumb_width) {
				dx_int = this.thumb_width - min_thumb_width;
			}
			this.thumb_width -= dx_int;
			this.thumb.style.width = `${this.thumb_width}px`;

			this.overlay_left.style.width = `${left_width + dx_int}px`;

			this.setMapBox();
		}

		moveRightBorder(dx) {
			let dx_int = Math.round(dx);
			const right_width = this.overlay_right.offsetWidth;
			const right = +this.thumb.style.right.slice(0, -2);
			if (right_width - dx_int < 0) {
				dx_int = right_width;
			}
			if (this.thumb_width + dx_int < min_thumb_width) {
				dx_int = min_thumb_width - this.thumb_width;
			}
			this.thumb_width += dx_int;
			this.thumb.style.width = `${this.thumb_width}px`;
			this.thumb.style.right = `${right - dx_int}px`;

			this.overlay_right.style.width = `${right_width - dx_int}px`;

			this.setMapBox();
		}

		setupTouchEvents() {
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
						this.moveChart(dx);
					} else if (dragLeftStart) {
						this.moveLeftBorder(dx);
					} if (dragRightStart) {
						this.moveRightBorder(dx);
					}
				}
				prevTouch = touch;
				event.preventDefault();
			}

			this.thumb.addEventListener('touchstart', (event) => {
				if (!prevTouch) {
					// Handling only the first touch
					[prevTouch] = event.changedTouches;
					dragThumbStart = true;
				}
			});

			this.thumb_left.addEventListener('touchstart', (event) => {
				if (!prevTouch) {
					// Handling only the first touch
					[prevTouch] = event.changedTouches;
					dragLeftStart = true;
				}
			});

			this.thumb_right.addEventListener('touchstart', (event) => {
				if (!prevTouch) {
					// Handling only the first touch
					[prevTouch] = event.changedTouches;
					dragRightStart = true;
				}
			});

			this.thumb.addEventListener('touchmove', touchMove.bind(this));
			this.thumb_left.addEventListener('touchmove', touchMove.bind(this));
			this.thumb_right.addEventListener('touchmove', touchMove.bind(this));
			this.overlay_left.addEventListener('touchmove', touchMove.bind(this));
			this.overlay_left.addEventListener('touchmove', touchMove.bind(this));

			function touchEnd() {
				prevTouch = null;
				dragThumbStart = false;
				dragLeftStart = false;
				dragRightStart = false;
			}

			this.thumb.addEventListener('touchend', touchEnd.bind(this));

			this.thumb.addEventListener('touchcancel', touchEnd.bind(this));
		}

		setupMouseEvents() {
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
					this.moveChart(dx);
				} else if (dragLeftStart) {
					this.moveLeftBorder(dx);
				} if (dragRightStart) {
					this.moveRightBorder(dx);
				}
			}

			this.thumb_left.onmousedown = (event) => {
				dragLeftStart = true;
				event.cancelBubble = true;
				prevMouseX = event.clientX;
				return false;
			};

			this.thumb_right.onmousedown = (event) => {
				dragRightStart = true;
				event.cancelBubble = true;
				prevMouseX = event.clientX;
				return false;
			};

			this.thumb.onmousedown = (event) => {
				dragThumbStart = true;
				prevMouseX = event.clientX;
			};

			this.thumb.onmousemove = handleMouseMove.bind(this);
			this.thumb_left.onmousemove = handleMouseMove.bind(this);
			this.thumb_right.onmousemove = handleMouseMove.bind(this);
			this.overlay_left.onmousemove = handleMouseMove.bind(this);
			this.overlay_right.onmousemove = handleMouseMove.bind(this);

			document.addEventListener('mouseup', () => {
				dragThumbStart = false;
				dragLeftStart = false;
				dragRightStart = false;
				prevMouseX = 0;
			});
		}

		setColors(isInitial) {
			if (this.isLight) {
				this.appContainerEl.style.background = white_color;
				this.appContainerEl.style.color = black_color;
				this.appContainerEl.classList.remove('dark-theme');
			} else {
				this.appContainerEl.style.background = dark_color;
				this.appContainerEl.style.color = white_color;
				this.appContainerEl.classList.add('dark-theme');
			}
			this.mainChart.isLight = this.isLight;
			this.mapChart.isLight = this.isLight;
			if (!isInitial) {
				this.mainChart.drawAll();
				this.mapChart.drawAll();
			}
		}

		run(collection, type) {
			this.collection = collection;
			this.setColors(true);
			this.mainChart.setData(collection, type);
			this.mapChart.entangledChart = this.mainChart;
			this.mapChart.setData(collection, type);

			const btns = this.mapChart.generateControlButtons();
			const oldBtns = this.appEl.getElementsByClassName('btn');
			while (oldBtns.length > 0) {
				this.appEl.removeChild(oldBtns[0]);
			}
			btns.forEach((btn) => {
				this.appEl.appendChild(btn);
			});

			this.mainChart.init();
			this.mapChart.init();
			this.mapChart.calculateMaxY(true);
			this.setMapBox(true);
			this.mainChart.calculateMaxY(true);
		}

		setupAllEvents() {
			this.setupTouchEvents();
			this.setupMouseEvents();

			global.addEventListener('resize', () => {
				this.mainChart.init();
				this.mainChart.calculateDetailsOffset();
				this.mapChart.init();
				this.mapChart.drawAll();
				this.container_width = this.map_container.clientWidth;
				this.moveChart(0);
				this.setMapBox();
			});
		}
	}

	const charts = [];
	const chartsEls = document.body.getElementsByClassName('app-container');

	// for (let i = 0; i < 1; i += 1) {
	// 	const chart = new ChartContainer(chartsEls[i]);
	// 	charts.push(chart);
	// 	chart.initMapBox();
	// 	chart.run(data[i]);
	// }
	const chart = new ChartContainer(chartsEls[0]);
	charts.push(chart);
	chart.initMapBox();
	chart.run(data[0], 'line');

	const chart2 = new ChartContainer(chartsEls[1]);
	charts.push(chart2);
	chart2.initMapBox();
	chart2.run(data[4], 'bar');

	const dark_link = document.body.getElementsByClassName('set-theme-dark')[0];
	const light_link = document.body.getElementsByClassName('set-theme-light')[0];

	dark_link.onclick = () => {
		for (let i = 0; i < charts.length; i += 1) {
			charts[i].isLight = false;
			charts[i].setColors();
		}
		dark_link.style.display = 'none';
		light_link.style.display = 'initial';
		document.body.classList.add('isDark');
	};

	light_link.onclick = () => {
		for (let i = 0; i < charts.length; i += 1) {
			charts[i].isLight = true;
			charts[i].setColors();
		}
		light_link.style.display = 'none';
		dark_link.style.display = 'initial';
		document.body.classList.remove('isDark');
	};
}(window));
