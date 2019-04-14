/* eslint-disable class-methods-use-this */
/* eslint-disable space-unary-ops */
/* eslint-disable no-mixed-operators */
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

	const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		months = monthsFull.map((m) => { return m.substr(0, 3); }),
		daysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		days = daysFull.map((m) => { return m.substr(0, 3); }),
		dark_background_color = '#1d2837',
		dark_color = '#242f3e',
		white_color = '#ffffff',
		black_color = '#000000',
		axis_color = '#182D3B',
		axis_color_zero = '#182D3B1A',
		axis_color_dark = '#ffffff',
		axis_color_dark_zero = '#ffffff1A',

		text_color_dark = '#A3B1C2',
		text_color_bar_dark_x = '#A3B1C2',
		text_color_bar_dark_y = '#ECF2F8',
		text_color_light = '#8E8E93',
		text_color_bar_light = '#252529',

		duration = 180, // ms
		padding_y = 0.03,
		padding_x = 0.003,
		pie_pad = 0.2,
		main_chart_padding = 16,
		map_left_padding = 0.002,
		min_thumb_width = 10,
		x_legend_padding = 20,
		x_legend_val_width = 60,
		y_legend_row_height = 50,
		y_legend_text_height = 10,
		op = Symbol('Opacity'),
		sum_all = Symbol('Sum'),
		det_x = Symbol('Details X'),
		mx = Symbol('Max X'),
		my = Symbol('Max Y'),
		zx = Symbol('Shift X'),
		zy = Symbol('Shift Y'),
		colors = {
			'#FE3C30': {
				btn: '#E65850',
				text: '#F34C44',
			},
			'#4BD964': {
				btn: '#5FB641',
				text: '#3CC23F',
			},
			'#108BE3': {
				btn: '#3497ED',
				text: '#108BE3',
			},
			'#E8AF14': {
				btn: '#F5BD25',
				text: '#E4AE1B',
			},
			'#5FB641': {
				btn: '#5FB641',
				text: '#4BAB29',
			},
			'#3497ED': {
				btn: '#3497ED',
				text: '#108BE3',
			},
			'#2373DB': {
				btn: '#3381E8',
				text: '#2373DB',
			},
			'#9ED448': {
				btn: '#9ED448',
				text: '#89C32E',
			},
			'#F5BD25': {
				btn: '#F5BD25',
				text: '#EAAF10',
			},
			'#F79E39': {
				btn: '#F79E39',
				text: '#F58608',
			},
			'#E65850': {
				btn: '#E65850',
				text: '#F34C44',
			},
			'#55BFE6': {
				btn: '#35AADC',
				text: '#269ED4',
			},
			'#64ADED': {
				btn: '#3896E8',
				text: '#3896E8',
			},
			'#558DED': {
				btn: '#558DED',
				text: '#558DED',
			},
			'#5CBCDF': {
				btn: '#5CBCDF',
				text: '#5CBCDF',
			},
		},
		colorsDark = {
			'#FE3C30': {
				btn: '#CF5D57',
				text: '#F7655E',
				chart: '#E6574F',
			},
			'#4BD964': {
				btn: '#5AB34D',
				text: '#4BD964',
				chart: '#4BD964',
			},
			'#108BE3': {
				btn: '#4681BB',
				text: '#108BE3',
				chart: '#108BE3',
			},
			'#E8AF14': {
				btn: '#C9AF4F',
				text: '#DEB93F',
				chart: '#DEB93F',
			},
			'#5FB641': {
				btn: '#3DA05A',
				text: '#3CB560',
				chart: '#3DA05A',
			},
			'#3497ED': {
				btn: '#4681BB',
				text: '#5199DF',
				chart: '#4681BB',
			},
			'#2373DB': {
				btn: '#466FB3',
				text: '#3E65CF',
				chart: '#345B9C',
			},
			'#9ED448': {
				btn: '#88BA52',
				text: '#99CF60',
				chart: '#88BA52',
			},
			'#F5BD25': {
				btn: '#F5BD25',
				text: '#DBB630',
				chart: '#D9B856',
			},
			'#F79E39': {
				btn: '#D49548',
				text: '#EE9D39',
				chart: '#D49548',
			},
			'#E65850': {
				btn: '#CF5D57',
				text: '#F7655E',
				chart: '#CF5D57',
			},
			'#55BFE6': {
				btn: '#479FC4',
				text: '#43ADDE',
				chart: '#479FC4',
			},
			'#64ADED': {
				btn: '#4082CE',
				text: '#4082CE',
				chart: '#4082CE',
			},
			'#558DED': {
				btn: '#4461AB',
				text: '#4461AB',
				chart: '#4461AB',
			},
			'#5CBCDF': {
				btn: '#4697B3',
				text: '#4697B3',
				chart: '#4697B3',
			},
		};


	function getColor(original, isLight, key) {
		const colorObj = isLight ? colors[original] : colorsDark[original];
		if (!colorObj) {
			return '#000000'; //original;
		}
		return colorObj[key] || original;
	}

	const timestamp_0 = 1515000000000;

	function initChangesObject(key) {
		this[key] = {
			startTimestamp: -1,
			deltaValue: -1,
			originalValue: -1,
			targetVal: -1,
		};
	}

	function eq(a, b) {
		if (a === b) {
			return true;
		}
		if (a > timestamp_0 && b > timestamp_0) {
			return Math.abs((a - b) / Math.max(Math.abs(a - timestamp_0), Math.abs(b - timestamp_0))) < 0.0001;
		}
		return Math.abs((a - b) / Math.max(Math.abs(a), Math.abs(b))) < 0.0001;
	}

	function prettifyNumber(val) {
		// eslint-disable-next-line no-restricted-globals
		if (!isFinite(val)) {
			return 1;
		}
		let displayVal = val;
		let pow = 0;
		while (displayVal > 100) {
			displayVal /= 10;
			pow += 1;
		}
		displayVal = Math.round(displayVal);
		while (pow > 0) {
			displayVal *= 10;
			pow -= 1;
		}
		return displayVal;
	}

	function changeLabels(el, text, isCalculateWidth) {
		const prevDetailEls = el.getElementsByClassName('detail');
		let prevDetailEl = null;
		for (let i = 0; i < prevDetailEls.length; i += 1) {
			if (!prevDetailEls[i].classList.contains('old')) {
				if (prevDetailEl && prevDetailEl.parentElement) {
					prevDetailEl.parentElement.removeChild(prevDetailEl);
				}
				prevDetailEl = prevDetailEls[i];
			}
		}
		let currentTxt = '';
		if (prevDetailEl) {
			currentTxt = prevDetailEl.innerText;
		}
		// eslint-disable-next-line eqeqeq
		if (currentTxt != text) {
			if (prevDetailEl) {
				prevDetailEl.classList.add('old');
			}
			const detailPart = `<div class="part detail new">${text}</div>`;
			const template = document.createElement('template');
			template.innerHTML = detailPart;
			const detailEl = template.content.firstChild;
			if (prevDetailEl) {
				el.appendChild(detailEl);
				setTimeout(() => {
					detailEl.classList.remove('new');
				}, 0);
				setTimeout(() => {
					if (prevDetailEl && prevDetailEl.parentElement) {
						prevDetailEl.parentElement.removeChild(prevDetailEl);
					}
				}, duration);
			} else {
				detailEl.classList.remove('new');
				el.appendChild(detailEl);
			}
		}
		if (isCalculateWidth) {
			el.style.width = `${el.getElementsByClassName('detail')[0].clientWidth}px`;
			setTimeout(() => {
				el.style.width = `${el.getElementsByClassName('detail')[0].clientWidth}px`;
			}, duration);
		}
	}

	function getDateText(timestamp) {
		const date = new Date(timestamp);
		return [`${days[date.getDay()]}, ${date.getDate()}`, date.getDay()];
	}

	function padZeros(val) {
		return (`00${val}`).substr(-2);
	}

	function getHoursText(timestamp) {
		const date = new Date(timestamp);
		return `${padZeros(date.getHours())}:${padZeros(date.getMinutes())}`;
	}

	function getFullDateText(timestamp) {
		const date = new Date(timestamp);
		return [date.getDate(), monthsFull[date.getMonth()], date.getFullYear(), daysFull[date.getDay()]];
	}

	function getOpacity(val) {
		return padZeros(Math.round(val).toString(16));
	}

	function formatNumber(val, noShortenMillions) {
		if (!noShortenMillions && val >= 1000000) {
			return `${Math.round(val / 1000000)}M`;
		}
		let str = Math.round(val).toString();
		const parts = [];
		while (str.length > 3) {
			parts.push(str.substr(str.length - 3));
			str = str.substr(0, str.length - 3);
		}
		parts.push(str);

		return parts.reverse().join(' ');
	}

	class PieChart {
		constructor(canv, height) {
			this.isPieChart = true;
			this.width = canv.clientWidth;
			this.height = height;
			this.animateFrameId = null;
			this.canv = canv;
			this.ctx = canv.getContext('2d');
			this.changes = {};

			this.changingFields = [op, sum_all];

			this.graphs = [];
		}

		setData(data) {
			this.isDisappearing = false;
			this[op] = 0;
			this[sum_all] = 0;

			this.graphs = [];
			this.data = data;
			this.prev_details_num = undefined;
			this.details_num = -1;

			for (let i = 0; i < this.data.columns.length; i += 1) {
				const col = [...this.data.columns[i]];
				const key = col.shift();
				if (key === 'x') {
					this.x_vals = col;
				} else {
					const graph = {
						name: this.data.names[key],
						color: this.data.colors[key],
						scaleKey: `${key}_area`,
						paddingKey: `${key}_pad`,
						sumKey: `${key}_sum`,
						display: true,
						y_vals: col,
					};
					this[graph.scaleKey] = 100;
					this[graph.paddingKey] = this.radius * 2;
					this[graph.sumKey] = 0;
					this.graphs.push(graph);
					if (this.changingFields.findIndex((val) => { return val === graph.scaleKey; }) === -1) {
						this.changingFields.push(graph.scaleKey);
					}
					if (this.changingFields.findIndex((val) => { return val === graph.paddingKey; }) === -1) {
						this.changingFields.push(graph.paddingKey);
					}
					if (this.changingFields.findIndex((val) => { return val === graph.sumKey; }) === -1) {
						this.changingFields.push(graph.sumKey);
					}
				}
			}

			this[zx] = Math.min(...this.x_vals);
			this[mx] = Math.max(...this.x_vals);
		}

		setChartWidths() {
			this.width = this.canv.clientWidth;
			this.canv.width = this.width * 2;

			this.radius = (Math.min(this.width, this.height)) * (1 - pie_pad);
		}

		clearChart() {
			this.ctx.clearRect(0, 0, this.canv.width * 2, this.canv.height * 2);
		}

		init() {
			this.changingFields.forEach(initChangesObject.bind(this.changes));
			this.setChartWidths();
		}

		appear() {
			this.graphs.forEach((gr) => {
				if (!gr.display) {
					this[gr.scaleKey] = 0;
					this[gr.paddingKey] = 0;
				} else {
					this.startChangeKey(gr.paddingKey, 0);
				}
			});
			this.startChangeKey(op, 0xff);
			this.calculateSections();
		}

		setStartEnd() {
			let start_i = this.x_vals.findIndex((val) => { return val >= this[zx]; });
			if (start_i > 0) {
				// start_i -= 1; // Starting from the first point beyond the chart to the left;
			}
			const end_i = start_i + this.selectedDays;
			this.start_i = start_i;
			this.end_i = end_i;
		}

		drawAll() {
			if (this.isSilent) {
				return;
			}
			this.clearChart();
			this.drawChart();
		}

		drawDetails() {
			return false;
		}

		calculateSections() {
			this.setStartEnd();
			let sum = 0;

			for (let k = 0; k < this.graphs.length; k += 1) {
				const gr = this.graphs[k];
				const multiplier = this[gr.scaleKey] / 100;
				gr.totalVal = 0;
				for (let i = this.start_i; i < this.end_i; i += 1) {
					sum += multiplier * gr.y_vals[i];
					gr.totalVal += multiplier * gr.y_vals[i];
				}
			}

			this.startChangeKey(sum_all, sum);
			for (let k = 0; k < this.graphs.length; k += 1) {
				const gr = this.graphs[k];
				this.startChangeKey(gr.sumKey, gr.totalVal);
			}
		}

		drawChart() {
			if (!this[sum_all]) {
				return;
			}
			let angle = 0;

			for (let k = 0; k < this.graphs.length; k += 1) {
				const gr = this.graphs[k];
				const fraction = this[gr.sumKey] / this[sum_all];
				gr.fraction = fraction;
				const currentAngle = 2 * Math.PI * fraction;
				if (k === 0) {
					angle = - currentAngle / 2;
				}
				gr.fromAngle = angle;
				gr.toAngle = angle + currentAngle;
				if (k === this.graphs.length) {
					gr.toAngle = this.graphs[0].fromAngle;
				}
				let x0 = this.width;
				let y0 = this.height;
				if (this[gr.paddingKey]) {
					x0 += this[gr.paddingKey] * Math.cos(angle + currentAngle / 2);
					y0 += this[gr.paddingKey] * Math.sin(angle + currentAngle / 2);
				}
				gr.xc = this.width + (this.radius / 2) * Math.cos(angle + currentAngle / 2);
				gr.yc = this.height + (this.radius / 2) * Math.sin(angle + currentAngle / 2);

				this.ctx.beginPath();
				this.ctx.moveTo(x0, y0);
				this.ctx.fillStyle = `${getColor(gr.color, this.isLight, 'chart')}${getOpacity(this[op])}`;
				// eslint-disable-next-line space-unary-ops
				this.ctx.arc(x0, y0, this.radius, gr.fromAngle, gr.toAngle);
				this.ctx.lineTo(x0, y0);
				this.ctx.closePath();
				this.ctx.fill();

				// Writing labels
				if (fraction > 0.02) {
					let fontSize = 50;
					let radiusDelay = 0.5;

					if (fraction < 0.3) {
						fontSize = fraction * 100 + 20;
						radiusDelay = 0.5 + (0.3 - fraction);
					}

					if (fraction < 1) {
						x0 = this.width + (this[gr.paddingKey] + this.radius * radiusDelay) * Math.cos(angle + currentAngle / 2);
						y0 = this.height + (this[gr.paddingKey] + this.radius * radiusDelay) * Math.sin(angle + currentAngle / 2);
					} else {
						x0 = this.width;
						y0 = this.height;
					}

					this.ctx.font = `bold ${fontSize}px Arial`;
					this.ctx.fillStyle = '#ffffffee';
					const txt = `${Math.round(fraction * 100)}%`;
					const measures = this.ctx.measureText(txt);

					this.ctx.fillText(txt, x0 - measures.width / 2, y0 + fontSize / 2);
				}

				angle += currentAngle;
			}
		}

		startChangeKey(key, targetVal) {
			const val = this.changes[key];
			if (eq(val.targetVal, targetVal)) {
				return;
			}
			val.targetVal = targetVal;
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
			this.hideDetails();
			const chart = this.graphs.find((ch) => { return ch.scaleKey === key; });
			chart.display = !chart.display;
			this[chart.scaleKey] = chart.display ? 100 : 0;
			this.calculateSections();
		}

		calculateOffset() {
			let parent = this.canv;
			let offsetX = 0,
				offsetY = 0;
			while (parent.offsetParent) {
				offsetX += parent.offsetLeft - parent.scrollLeft;
				offsetY += parent.offsetTop - parent.scrollTop;
				parent = parent.offsetParent;
			}
			this.offsetX = offsetX;
			this.offsetY = offsetY;
		}

		setInfoBox(gr) {
			this.infoBox.style.display = 'block';
			const prevDetailEls = this.infoBox.getElementsByClassName('pie-info-value');
			let prevDetailEl = null;
			for (let i = 0; i < prevDetailEls.length; i += 1) {
				if (!prevDetailEls[i].classList.contains('old')) {
					if (prevDetailEl && prevDetailEl.parentElement) {
						prevDetailEl.parentElement.removeChild(prevDetailEl);
					}
					prevDetailEl = prevDetailEls[i];
				}
			}

			if (prevDetailEl) {
				prevDetailEl.style.width = `${prevDetailEl.clientWidth}px`;
				prevDetailEl.classList.add('old');
			}
			const itemHtml = `<div class="pie-info-value item part new">
					<div class="pie-val name">${gr.name}</div>
					<div class="pie-val value" style="color:${getColor(gr.color, this.isLight, 'text')};">${formatNumber(gr.totalVal)}</div>
				</div>`;
			const template = document.createElement('template');
			template.innerHTML = itemHtml;
			const detailEl = template.content.firstChild;
			if (prevDetailEl) {
				this.infoBox.appendChild(detailEl);
				setTimeout(() => {
					detailEl.classList.remove('new');
				}, 0);
				setTimeout(() => {
					if (prevDetailEl && prevDetailEl.parentElement) {
						prevDetailEl.parentElement.removeChild(prevDetailEl);
					}
				}, duration);
			} else {
				detailEl.classList.remove('new');
				this.infoBox.appendChild(detailEl);
			}
			const width = this.infoBox.clientWidth;
			let left = gr.xc / 2;
			if (gr.xc <= this.width) {
				left -= width * 0.7;
			} else {
				left -= width * 0.3;
			}
			this.infoBox.style.left = `${left}px`;
			if (gr.yc <= this.height) {
				this.infoBox.style.top = `${gr.yc / 2 - 120}px`;
			} else {
				this.infoBox.style.top = `${gr.yc * 0.3}px`;
			}
		}

		showChartDetails(gr) {
			if (this.currentDetailGraph === gr) {
				return;
			}
			if (this.currentDetailGraph) {
				this.startChangeKey(this.currentDetailGraph.paddingKey, 0);
			}
			this.currentDetailGraph = gr;
			let paddingVal = 20;
			if (gr.fraction < 0.3) {
				paddingVal += (1 - gr.fraction) * 20;
			}
			if (eq(gr.fraction, 1)) {
				paddingVal = 0;
			}
			this.startChangeKey(gr.paddingKey, paddingVal);
			this.setInfoBox(gr);
		}

		showDetails(x, y, event) {
			if (this.isSilent) {
				return false;
			}

			const xr = x * 2 - this.width;
			const yr = y * 2 - this.height;
			const isInside = ((xr * xr + yr * yr) <= this.radius * this.radius);
			if (!isInside) {
				if (this.currentDetailGraph) {
					this.startChangeKey(this.currentDetailGraph.paddingKey, 0);
					this.currentDetailGraph = undefined;
				}
				return false;
			}

			if (event) {
				event.preventDefault();
			}

			let angle = Math.atan2(yr, xr);
			if (angle < 0) {
				angle += 2 * Math.PI;
			}

			for (let k = 0; k < this.graphs.length; k += 1) {
				const gr = this.graphs[k];
				if (gr.fromAngle < angle && angle <= gr.toAngle) {
					this.showChartDetails(gr);
					return true;
				}
			}
			// Fallback for 1st section
			this.showChartDetails(this.graphs[0]);
			return true;
		}

		hideDetails() {
			if (this.currentDetailGraph) {
				this.startChangeKey(this.currentDetailGraph.paddingKey, 0);
			}
			this.infoBox.style.display = 'none';
		}

		setUpPieHover() {
			this.calculateOffset();
			let endId,
				cancelId;

			this.canv.addEventListener('mousemove', (event) => {
				if (this.showDetails(event.offsetX, event.offsetY)) {
					clearTimeout(endId);
					clearTimeout(cancelId);
				} else {
					clearTimeout(endId);
					clearTimeout(cancelId);
					endId = setTimeout(this.hideDetails.bind(this), 800);
				}
			});
			this.canv.addEventListener('touchstart', (event) => {
				const touch = event.changedTouches[0];
				this.calculateOffset();
				if (this.showDetails(touch.clientX - this.offsetX, touch.pageY - this.offsetY)) {
					clearTimeout(endId);
					clearTimeout(cancelId);
				} else {
					clearTimeout(endId);
					clearTimeout(cancelId);
					endId = setTimeout(this.hideDetails.bind(this), 800);
				}
			});
			this.canv.addEventListener('touchmove', (event) => {
				const touch = event.changedTouches[0];
				this.calculateOffset();
				if (this.showDetails(touch.clientX - this.offsetX, touch.pageY - this.offsetY, event)) {
					clearTimeout(endId);
					clearTimeout(cancelId);
				} else {
					clearTimeout(endId);
					clearTimeout(cancelId);
					endId = setTimeout(this.hideDetails.bind(this), 800);
				}
			});

			this.canv.addEventListener('mouseleave', () => {
				clearTimeout(endId);
				clearTimeout(cancelId);
				endId = setTimeout(this.hideDetails.bind(this), 800);
			});
			this.canv.addEventListener('touchend', () => {
				clearTimeout(endId);
				clearTimeout(cancelId);
				endId = setTimeout(this.hideDetails.bind(this), 800);
			});
			this.canv.addEventListener('touchcancel', () => {
				clearTimeout(endId);
				clearTimeout(cancelId);
				cancelId = setTimeout(this.hideDetails.bind(this), 800);
			});

			const infoBoxHtml = `<div class="pie-info info" style="display:none;">
			</div>`;
			const template = document.createElement('template');
			template.innerHTML = infoBoxHtml;
			this.infoBox = template.content.firstChild;

			this.canv.parentElement.appendChild(this.infoBox);

			this.infoBox.onmousemove = () => {
				clearTimeout(endId);
				clearTimeout(cancelId);
			};
			this.infoBox.addEventListener('touchmove', () => {
				clearTimeout(endId);
				clearTimeout(cancelId);
			});
			this.infoBox.onmouseleave = () => {
				clearTimeout(endId);
				clearTimeout(cancelId);
				endId = setTimeout(this.hideDetails.bind(this), 1200);
			};
			this.infoBox.addEventListener('touchend', () => {
				clearTimeout(endId);
				clearTimeout(cancelId);
				endId = setTimeout(this.hideDetails.bind(this), 1200);
			});
			this.infoBox.addEventListener('touchcancel', () => {
				clearTimeout(endId);
				clearTimeout(cancelId);
				cancelId = setTimeout(this.hideDetails.bind(this), 1200);
			});
		}
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

			this.changingFields = [mx, my, zx, zy, det_x];

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

		setData(data, type, options) {
			this[mx] = undefined;
			this[zx] = undefined;
			this[my] = undefined;
			this[zy] = undefined;
			this[det_x] = undefined;
			this.prev_end_i = undefined;
			this.prev_start_i = undefined;
			this.x_vals = [];
			this.x_legend = [];
			this.isDisappearing = false;

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
			this.y_scaled = options.y_scaled;
			this.percentBars = options.percentBars;

			if (type === 'line') {
				this.drawChart = this.drawLineChart;
				this.getMinAndMax = this.getLinesMinAndMax;
			} else if (this.percentBars) {
				this.drawChart = this.drawBarChart;
				this.getMinAndMax = this.getAreaMinAndMax;
				this.yLegendItemsCount = 5;
			} else if (type === 'bar') {
				this.drawChart = this.drawBarChart;
				this.getMinAndMax = this.getBarsMinAndMax;
			} else if (type === 'area') {
				this.drawChart = this.drawAreaChart;
				this.getMinAndMax = this.getAreaMinAndMax;
				this.yLegendItemsCount = 5;
			}

			for (let i = 0; i < this.data.columns.length; i += 1) {
				const col = [...this.data.columns[i]];
				const key = col.shift();
				if (key === 'x') {
					this.x_vals = col;
					this.x_legend = col.map((val) => {
						const dayNames = getDateText(val);
						const date = new Date(val);
						const result = {
							name: dayNames[0],
							nameClear: dayNames[0].replace(',', ''),
							monthName: months[date.getMonth()],
							year: date.getFullYear(),
							day: dayNames[1],
							x: val,
							opacity: 255,
							display: true,
						};
						if (this.isAppear) {
							result.opacity = 0;
						}
						if (this.isDetails) {
							result.nameClear = getHoursText(val);
						}
						return result;
					});
				} else {
					const graph = {
						name: this.data.names[key],
						color: this.data.colors[key],
						opacityKey: `${key}_${type}`,
						display: true,
						y_vals: col,
						scale: 1,
					};
					this[graph.opacityKey] = 255;
					this.graphs.push(graph);
					if (this.changingFields.findIndex((val) => { return val === graph.opacityKey; }) === -1) {
						this.changingFields.push(graph.opacityKey);
					}
				}
			}

			if (this.showMore) {
				if (options.isDetails) {
					this.showMore.style.display = 'none';
				} else {
					this.showMore.style.display = 'block';
				}
			}

			if (this.y_scaled) {
				this.graphs[1].y_scaled = true;
				this.scale = 1;
				this.scale_pad = 0;
				if (this.changingFields.indexOf('scale') === -1) {
					this.changingFields.push('scale');
				}
				if (this.changingFields.indexOf('scale_pad') === -1) {
					this.changingFields.push('scale_pad');
				}
				this.graphs[1].y_vals_orig = this.graphs[1].y_vals.map((val) => { return val; });
			}

			this[zx] = Math.min(...this.x_vals);
			if (type === 'bar') {
				this[zx] -= this.x_vals[1] - this.x_vals[0];
			}
			this[mx] = Math.max(...this.x_vals);
			this[mx] += Math.round((this[mx] - this[zx]) * padding_x);
			if (this.entangledChart) {
				this[zx] -= (this[mx] - this[zx]) * map_left_padding;
			}

			this[zy] = 0;
		}

		recalculateScaledY() {
			this.graphs[1].y_vals = this.graphs[1].y_vals_orig.map((val) => { return this.scale_pad + val * this.scale; });
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

		translateBackY(real_y) {
			return (real_y / this.scale_y) + this[zy];
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
			if (this.isAppear) {
				this.x_legend.forEach((val) => { val.opacity = 0; });
			}
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
			let textColor = this.isLight ? text_color_light : text_color_dark;
			if (this.type === 'bar' || this.type === 'area') {
				textColor = this.isLight ? text_color_bar_light : text_color_bar_dark_y;
			}

			// y-legend
			this.y_legend = this.y_legend.filter((leg) => { return leg.display || leg.opacity; }); // removing old garbage.
			for (let i = 0; i < this.y_legend.length; i += 1) {
				this.ctx.lineWidth = this.axisThickness;
				const item = this.y_legend[i];
				this.ctx.strokeStyle = strokeColor + getOpacity(item.opacity / 10);
				this.ctx.beginPath();
				this.ctx.moveTo(main_chart_padding, this.translateY(item.realY));
				this.ctx.lineTo(this.width - main_chart_padding, this.translateY(item.realY));
				this.ctx.stroke();
				if (this.y_scaled) {
					if (!item.hideLeft) {
						this.ctx.fillStyle = getColor(this.graphs[0].color, this.isLight, 'text') + getOpacity(item.opacity);
						if (!this.graphs[0].display) {
							this.ctx.fillStyle = getColor(this.graphs[0].color, this.isLight, 'text') + getOpacity(this[this.graphs[0].opacityKey]);
						}
						this.ctx.fillText(`${formatNumber(item.y)}`, main_chart_padding, this.translateY(item.realY) - y_legend_text_height);
					}

					if (!item.hideRight) {
						this.ctx.fillStyle = getColor(this.graphs[1].color, this.isLight, 'text') + getOpacity(item.opacity);
						if (!this.graphs[1].display) {
							this.ctx.fillStyle = getColor(this.graphs[1].color, this.isLight, 'text') + getOpacity(this[this.graphs[1].opacityKey]);
						}
						this.ctx.fillText(`${formatNumber(item.scaled_y)}`, this.width - main_chart_padding - 30, this.translateY(item.realY) - y_legend_text_height);
					}
				} else {
					let opacityMult = 1;
					if (this.type === 'bar' || this.type === 'area') {
						opacityMult = 0.5;
					} else if (!this.isLight) {
						opacityMult = 0.6;
					}
					this.ctx.fillStyle = textColor + getOpacity(item.opacity * opacityMult);
					this.ctx.fillText(`${formatNumber(item.y)}`, main_chart_padding, this.translateY(item.realY) - y_legend_text_height);
				}
			}

			this.ctx.lineWidth = this.axisThickness;
			if (this.type === 'bar' || this.type === 'area') {
				textColor = this.isLight ? text_color_bar_light : text_color_bar_dark_x;
			}

			// x-legend
			for (let i = this.prev_start_i - 2; i < this.prev_end_i; i += 1) {
				if (this.x_legend[i]) {
					const val = this.x_legend[i];
					if (val.opacity) {
						let opacityMult = 1;
						if (this.type === 'bar' || this.type === 'area') {
							if (this.isLight) {
								opacityMult = 0.5;
							} else {
								opacityMult = 0.6;
							}
						} else if (!this.isLight) {
							opacityMult = 0.6;
						}
						this.ctx.fillStyle = textColor + getOpacity(val.opacity * opacityMult);
						const x = this.translateX(val.x) - Math.round(x_legend_val_width / 2);
						this.ctx.fillText(val.nameClear, x, -3);
					}
				}
			}
		}

		drawAll(isInitial) {
			this.clearChart();
			this.calcScale();
			this.calculateXLabels(isInitial);
			if (this.y_scaled) {
				this.recalculateScaledY();
			}
			this.drawChart();
			this.drawAxis();
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
			if (this.percentBars) {
				end_i = this.x_vals.length + 1;
			}
			this.start_i = start_i;
			this.end_i = end_i;
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

		drawLineChart() {
			this.setStartEnd();

			this.graphs.forEach((gr) => {
				if (this[gr.opacityKey]) {
					const opacity = getOpacity(this[gr.opacityKey]);
					this.startDraw(this.x_vals[this.start_i], gr.y_vals[this.start_i], `${getColor(gr.color, this.isLight, 'chart')}${opacity}`);
					for (let i = this.start_i + 1; i < this.end_i; i += 1) {
						this.drawNextPoint(this.x_vals[i], gr.y_vals[i]);
					}
					this.endDraw();
				}
			});
			this.calculateMaxY();
		}

		startDrawArea(prevLine) {
			this.ctx.lineWidth = 0;
			this.ctx.beginPath();
			const x0 = this.translateX(prevLine[prevLine.length - 1].x),
				y0 = this.translateY(prevLine[prevLine.length - 1].y);
			this.ctx.moveTo(x0, y0);
			for (let i = prevLine.length - 2; i >= 0; i -= 1) {
				this.drawNextPoint(prevLine[i].x, prevLine[i].y);
			}
		}

		endDrawArea(color) {
			this.ctx.closePath();
			this.ctx.fillStyle = `${color}ff`;
			if (this.isDisappearing) {
				this.ctx.fillStyle = `${color}${getOpacity(this[this.graphs[0].opacityKey])}`;
			}
			this.ctx.fill();
		}

		calcAreaTotal(num) {
			let total = 0;
			for (let k = 0; k < this.graphs.length; k += 1) {
				const gr = this.graphs[k];
				total += gr.y_vals[num] * (this[gr.opacityKey] / 255);
			}
			return total;
		}

		drawAreaChart() {
			this.setStartEnd();

			let prevLine = [];
			for (let i = this.start_i; i < this.end_i; i += 1) {
				prevLine.push({ x: this.x_vals[i], y: 0 });
			}

			for (let k = 0; k < this.graphs.length; k += 1) {
				const gr = this.graphs[k];
				if (this[gr.opacityKey]) {
					this.startDrawArea(prevLine);
					// Areas shrink, not disappear.
					let multiplier = this[gr.opacityKey] / 255;
					if (this.isDisappearing) {
						multiplier = 1;
					}
					const line = [];
					for (let i = this.start_i; i < this.end_i; i += 1) {
						const y = prevLine[i - this.start_i].y + 100 * (gr.y_vals[i] * multiplier) / this.calcAreaTotal(i);
						line.push({ x: this.x_vals[i], y });
						this.drawNextPoint(this.x_vals[i], y);
					}
					prevLine = line;
					this.endDrawArea(getColor(gr.color, this.isLight, 'chart'));
				}
			}
			this.calculateMaxY();
		}

		drawNextBarItem(orig_x1, orig_x2, from_y, to_y, num, color) {
			const x1 = this.translateX(orig_x1),
				x2 = this.translateX(orig_x2),
				y1 = this.translateY(from_y),
				y2 = this.translateY(to_y);
			if (this.details_num === -1) {
				this.ctx.fillStyle = `${color}ff`;
			} else if (this.details_num === num) {
				this.ctx.fillStyle = `${color}ff`;
			} else {
				this.ctx.fillStyle = `${color}80`;
			}
			if (this.isDisappearing) {
				this.ctx.fillStyle = `${color}${getOpacity(this[this.graphs[0].opacityKey])}`;
			}
			this.bar_width = x2 - x1;
			this.ctx.fillRect(x1, y1, this.bar_width, y2 - y1);
		}

		drawBarChart() {
			this.setStartEnd();
			this.bar_width = undefined;
			const x_step = this.x_vals[this.end_i - 2] - this.x_vals[this.end_i - 3];
			for (let i = this.start_i; i < this.end_i; i += 1) {
				let currentHeight = 0;
				let sum = 0;
				for (let k = 0; k < this.graphs.length; k += 1) {
					const gr = this.graphs[k];
					let multiplier = this[gr.opacityKey] / 255;
					if (this.isDisappearing) {
						multiplier = 1;
					}
					sum += multiplier * gr.y_vals[i];
				}
				for (let k = 0; k < this.graphs.length; k += 1) {
					const gr = this.graphs[k];
					if (this[gr.opacityKey]) {
						// bar charts won't disappear, they will shrink
						let multiplier = this[gr.opacityKey] / 255;
						if (this.isDisappearing) {
							multiplier = 1;
						}
						let dy = multiplier * gr.y_vals[i];
						if (this.percentBars) {
							dy = 100 * dy / sum;
						}
						this.drawNextBarItem(this.x_vals[i], this.x_vals[i] - x_step, currentHeight, currentHeight + dy, i, getColor(gr.color, this.isLight, 'chart'));
						currentHeight += dy;
					}
				}
			}
			this.calculateMaxY();
		}

		// eslint-disable-next-line class-methods-use-this
		getAreaMinAndMax() {
			if (this.isDrawAxis) {
				return { newMin: 0, newMax: 108 };
			}
			return { newMin: 0, newMax: 100 };
		}

		getLinesMinAndMax(visibleCharts) {
			let newMax = Math.max(...visibleCharts
				.map((gr) => { return Math.max(...gr.y_vals.slice(this.prev_start_i, this.prev_end_i)); }));
			let newMin = Math.min(...visibleCharts
				.map((gr) => { return Math.min(...gr.y_vals.slice(this.prev_start_i, this.prev_end_i)); }));

			if (!this.y_scaled) {
				newMax += Math.round((newMax - newMin) * padding_y);
			}
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

		calculateMaxY(force, noDraw) {
			this.setStartEnd();
			if (this.prev_start_i !== this.start_i || this.prev_end_i !== this.end_i || force) {
				this.prev_start_i = this.start_i || this.prev_start_i || 0;
				this.prev_end_i = this.end_i || this.prev_end_i || 0;
				const visibleCharts = this.graphs
					.filter((ch) => { return ch.display; });
				if (!visibleCharts.length) {
					return;
				}
				let { newMax, newMin } = this.getMinAndMax(visibleCharts);
				if (this.y_scaled) { //  && this.graphs[0].display && this.graphs[1].display
					const newBigVals = this.getLinesMinAndMax([this.graphs[0]]);
					newMax = newBigVals.newMax;
					newMin = newBigVals.newMin;
					const newSmallVals = this.getLinesMinAndMax([this.graphs[1]].map((gr) => { return { y_vals: gr.y_vals_orig }; }));
					const dBig = (newBigVals.newMax - newBigVals.newMin) || 3600000;
					const dSmall = (newSmallVals.newMax - newSmallVals.newMin) || dBig;
					const newScale = dBig / dSmall;
					const newScalePad = newBigVals.newMin - (newSmallVals.newMin * newScale);
					if (!eq(newScale, this.scale)) {
						if ((this.scale !== 1) && !noDraw) {
							this.startChangeKey('scale', newScale);
						} else {
							this.scale = newScale;
						}
					}
					if (!eq(newScalePad, this.scale_pad)) {
						if (this.scale_pad && !noDraw) {
							this.startChangeKey('scale_pad', newScalePad);
						} else {
							this.scale_pad = newScalePad;
						}
					}
				}
				let scaled_visible = '';
				if (this.y_scaled) {
					newMax += Math.round((newMax - newMin) * padding_y);
					scaled_visible = `${this.graphs[0].display}_${this.graphs[1].display}`;
				}
				newMax = Math.round(newMax);
				newMin = Math.round(newMin);
				if (
					(!eq(newMax, 0) && !eq(newMax, this[my])) ||
					(!eq(newMin, this[zy])) ||
					(this.y_scaled && this.prev_scaled_visible !== scaled_visible)) {
					this.prev_scaled_visible = scaled_visible;
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
						let step = Math.floor((newMax - newMin) / this.yLegendItemsCount);
						if (this.type === 'area') {
							step = 25;
						}
						for (let i = 0; i < this.yLegendItemsCount; i += 1) {
							const item = {
								y: prettifyNumber(val),
								realY: val,
								opacity: 0,
								display: true,
								startTimestamp: Date.now(),
							};
							if (this.y_scaled) {
								item.scaled_y = prettifyNumber(Math.round((val - this.scale_pad) / this.scale));
								if (!this.graphs[0].display) {
									item.hideLeft = true;
								}
								if (!this.graphs[1].display) {
									item.hideRight = true;
								}
							}
							if (!this[my]) {
								// Initial creation
								item.opacity = 255;
							}
							if (this.isAppear) {
								item.opacity = 0;
							}
							val += step;
							if (!this.isDisappearing) {
								this.y_legend.push(item);
							}
						}
					}
					if (this[my]) {
						this.startChangeKey(my, newMax);
						this.startChangeKey(zy, newMin);
					} else {
						this[my] = newMax;
						this[zy] = newMin;
						if (!noDraw) {
							this.drawAll(true);
						} else {
							this.calcScale();
						}
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

		startChangeKey(key, targetVal, omitComparison) {
			const val = this.changes[key];
			if (!omitComparison && eq(val.targetVal, targetVal)) {
				return;
			}
			if (!eq(val.targetVal, targetVal)) {
				val.startTimestamp = Date.now();
			}
			val.targetVal = targetVal;
			val.deltaValue = targetVal - this[key];
			val.originalValue = this[key];
			if (!this.animateFrameId) {
				this.animateFrameId = requestAnimationFrame(this.changeAllStep.bind(this));
			}
		}

		static changeLegendEntry(val) {
			if (!val.startTimestamp) {
				return 0;
			}
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
			if (this.isDisappearing || this.isSilent) {
				return;
			}
			const data_x = this.translateBackX(offsetX);
			this.details_num = -1;
			let prevDelta = Infinity;
			for (let i = this.start_i - 1; i < this.end_i; i += 1) {
				if (this.x_vals[i]) {
					if (this.type === 'line' || this.type === 'area') {
						const delta = Math.abs(this.x_vals[i] - data_x);
						if (delta < prevDelta) {
							prevDelta = delta;
							this.details_num = i;
						}
					} else if (this.type === 'bar') {
						let x_val = this.x_vals[i - 1];
						if (i === 0) {
							x_val = this.x_vals[0] - (this.x_vals[1] - this.x_vals[0]);
						}
						if (x_val && (data_x > x_val)) {
							this.details_num = i;
						}
					}
				}
			}
			this.last_details_num = this.details_num;
			if (this[det_x]) {
				this.startChangeKey(det_x, this.x_vals[this.details_num], true);
			} else {
				this[det_x] = this.x_vals[this.details_num];
			}
		}

		hideDetails() {
			if (this.details_num !== undefined && this.details_num !== -1) {
				this.last_details_num = this.details_num;
			}
			this.prev_details_num = undefined;
			this.details_num = -1;
			this[det_x] = undefined;
			this.clearDetails();
			this.infoBox.style.display = 'none';
			if (this.type === 'bar') {
				this.clearChart();
				this.drawChart();
				this.drawAxis();
			}
		}

		findIntersection(chart, x, goRight) {
			const step = goRight ? 1 : -1;
			let num = 0;
			while (this.x_vals[num] && this.x_vals[num] < x) {
				num += 1;
			}
			if (goRight) {
				num -= 1;
			}
			const x0 = this.x_vals[num];
			const x1 = this.x_vals[num + step];
			const y0 = chart.y_vals[num];
			const y1 = chart.y_vals[num + step];
			if (!x1) {
				return y0;
			}

			const dx = x1 - x0;
			const dy = y1 - y0;
			const dx_int = x - x0;

			const dy_int = y0 + dx_int * (dy / dx);
			return dy_int;
		}

		drawDetails() {
			// details
			if (this.isDrawAxis && this.details_num > -1) {
				if (this.type === 'bar') {
					this.clearChart();
					this.drawAxis();
					this.drawChart();
				}
				this.clearDetails();
				const x = this.translateX(this.x_vals[this.details_num]);
				const realX = this.translateX(this[det_x]);
				// Configuration
				if (this.type === 'line' || this.type === 'area') {
					let strokeColor = null;
					if (this.isLight) {
						strokeColor = axis_color_zero;
					} else {
						strokeColor = axis_color_dark_zero;
					}
					this.detailsCtx.lineWidth = this.axisThickness;
					this.detailsCtx.strokeStyle = strokeColor;
					this.detailsCtx.beginPath();
					this.detailsCtx.moveTo(realX, - x_legend_padding);
					if (this.type === 'line') {
						this.detailsCtx.lineTo(realX, -this.height);
					} else {
						this.detailsCtx.lineTo(realX, this.translateY(100));
					}
					this.detailsCtx.stroke();
				}

				this.graphs.forEach((gr) => {
					if (gr.display) {
						if (this.type === 'line') {
							this.detailsCtx.lineWidth = this.thickness;
							this.detailsCtx.strokeStyle = getColor(gr.color, this.isLight, 'chart');
							this.detailsCtx.fillStyle = this.isLight ? white_color : dark_background_color;
							const y = this.findIntersection(gr, this[det_x], this[det_x] > this.x_vals[this.details_num]);
							this.detailsCtx.beginPath();
							this.detailsCtx.arc(realX, this.translateY(y), this.thickness * 2, 0, 2 * Math.PI);
							this.detailsCtx.fill();
							this.detailsCtx.stroke();
						}
					}
				});

				if (this.prev_details_num === this.details_num && !this.force_redraw_details) {
					return;
				}

				this.force_redraw_details = false;

				const oldEls = this.infoBox.getElementsByClassName('old');
				while (oldEls && oldEls.length) {
					oldEls[0].parentElement.removeChild(oldEls[0]);
				}
				const grItems = this.infoBox.getElementsByClassName('item');
				for (let i = 0; i < grItems.length; i += 1) {
					grItems[i].classList.add('hidden');
				}

				this.graphs.forEach((gr) => {
					if (gr.display) {
						let infoEl = this.infoBox.getElementsByClassName(gr.opacityKey)[0];
						let valueText = '';
						if (gr.y_scaled) {
							valueText = formatNumber(gr.y_vals_orig[this.details_num], true);
						} else {
							valueText = formatNumber(gr.y_vals[this.details_num], true);
						}
						if (!infoEl) {
							const infoHtml = `<div class="item ${gr.opacityKey}">
								<div class="value" style="color:${getColor(gr.color, this.isLight, 'text')}"></div>
								<div class="name">${gr.name}</div>
							</div>`;
							const template = document.createElement('template');
							template.innerHTML = infoHtml;
							infoEl = template.content.firstChild;
							const valueEl = infoEl.getElementsByClassName('value')[0];
							infoEl.valueEl = valueEl;
							this.infoBox.appendChild(infoEl);
						} else {
							infoEl.valueEl.style.color = getColor(gr.color, this.isLight, 'text');
						}
						infoEl.classList.remove('hidden');
						changeLabels(infoEl.valueEl, valueText);
					}
				});

				this.prev_details_num = this.details_num;
				let moreThanHalf = 0;

				if (this.type === 'line') {
					const half = this.translateBackY(this.height - (this.infoBox.clientHeight || 80) - x_legend_padding);
					this.graphs.forEach((gr) => {
						if (gr.display) {
							if (gr.y_vals[this.details_num] >= half) {
								moreThanHalf += 1;
							}
						}
					});
				}

				if (this.isDetails) {
					this.infoHour.style.display = 'block';
					this.infoDay.style.display = 'none';
					this.infoMonth.style.display = 'none';
				} else {
					this.infoHour.style.display = 'none';
					this.infoDay.style.display = 'block';
					this.infoMonth.style.display = 'block';
				}

				if (this.isDetails) {
					const text = this.x_legend[this.details_num].nameClear;
					changeLabels(this.infoHour, text);
				} else {
					const dayTxt = `${this.x_legend[this.details_num].name}`;
					changeLabels(this.infoDay, dayTxt);
					const monthTxt = `${this.x_legend[this.details_num].monthName} ${this.x_legend[this.details_num].year}`;
					changeLabels(this.infoMonth, monthTxt);
				}

				this.infoBox.style.display = 'block';
				let left = x - 80;
				if (this.type === 'bar') {
					left = x - this.infoBox.clientWidth + this.bar_width - 10;
				}
				if (this.type === 'area' || moreThanHalf > 0) {
					left = x - this.infoBox.clientWidth - 20;
				}
				if (this.width - left < 190) {
					left = this.width - 190;
				}
				if (left < 0) {
					left = 0;
				}
				this.infoBox.style.top = '0px';
				this.infoBox.style.left = `${left}px`;
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
			let isTouch = false;
			let endId,
				cancelId;

			this.detailsCanv.addEventListener('mousemove', (event) => {
				this.showDetails(event.offsetX);
				clearTimeout(endId);
				clearTimeout(cancelId);
			});
			this.detailsCanv.addEventListener('touchstart', (event) => {
				isTouch = true;
				const touch = event.changedTouches[0];
				this.showDetails(touch.clientX - this.detailsCanvOffset);
				clearTimeout(endId);
				clearTimeout(cancelId);
			});
			this.detailsCanv.addEventListener('touchmove', (event) => {
				isTouch = true;
				const touch = event.changedTouches[0];
				this.showDetails(touch.clientX - this.detailsCanvOffset);
				clearTimeout(endId);
				clearTimeout(cancelId);
			});

			this.detailsCanv.onmouseleave = () => {
				clearTimeout(endId);
				clearTimeout(cancelId);
				endId = setTimeout(this.hideDetails.bind(this), 1200);
			};
			this.detailsCanv.addEventListener('touchend', () => {
				clearTimeout(endId);
				clearTimeout(cancelId);
				endId = setTimeout(this.hideDetails.bind(this), 1200);
			});
			this.detailsCanv.addEventListener('touchcancel', () => {
				clearTimeout(endId);
				clearTimeout(cancelId);
				cancelId = setTimeout(this.hideDetails.bind(this), 1200);
			});

			const infoBoxHtml = `<div class="info" style="display:none;">
				<div style="display:block;clear:both;overflow:hidden;margin-bottom:2px;">
					<div class="hour date"></div>
					<div class="day date"></div>
					<div class="month date"></div>
					<div class="show-more"></div>
				</div>
			</div>`;
			const template = document.createElement('template');
			template.innerHTML = infoBoxHtml;
			this.infoBox = template.content.firstChild;
			this.infoHour = this.infoBox.getElementsByClassName('hour')[0];
			this.infoDay = this.infoBox.getElementsByClassName('day')[0];
			this.infoMonth = this.infoBox.getElementsByClassName('month')[0];
			this.showMore = this.infoBox.getElementsByClassName('show-more')[0];

			this.detailsCanv.parentElement.appendChild(this.infoBox);

			this.detailsCanv.onclick = () => {
				if (!isTouch && !this.isDetails && !this.isSilent) {
					this.changeChart();
				}
			};

			this.infoBox.onmousemove = () => {
				clearTimeout(endId);
				clearTimeout(cancelId);
			};
			this.infoBox.addEventListener('touchmove', () => {
				clearTimeout(endId);
				clearTimeout(cancelId);
			});
			this.infoBox.onmouseleave = () => {
				clearTimeout(endId);
				clearTimeout(cancelId);
				endId = setTimeout(this.hideDetails.bind(this), 1200);
			};
			this.infoBox.addEventListener('touchend', () => {
				clearTimeout(endId);
				clearTimeout(cancelId);
				endId = setTimeout(this.hideDetails.bind(this), 1200);
			});
			this.infoBox.addEventListener('touchcancel', () => {
				clearTimeout(endId);
				clearTimeout(cancelId);
				cancelId = setTimeout(this.hideDetails.bind(this), 1200);
			});

			this.infoBox.onclick = () => {
				if (!this.isDetails) {
					this.changeChart();
				}
			};

			this.zoomOutEl.onclick = () => {
				this.changeChart();
			};
		}

		generateControlButtons() {
			if (this.graphs.length < 2) {
				return null;
			}
			const btns = this.graphs.map((gr) => {
				const template = document.createElement('template');
				const html = `<div class="btn btn-on">
				<div class="btn-filler show-light" style="border-color: ${getColor(gr.color, true, 'btn')}"></div>
				<div class="btn-filler show-dark" style="border-color: ${getColor(gr.color, false, 'btn')}"></div>
				<div class="btn-overlay"></div>
				<div class="btn-mark"><img class="on-img" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAmCAYAAACoPemuAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH4wMMDTMnCMtF7AAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAG5SURBVFjD7dhbSwJBFADgc6K3AvEvdPGx8t0hsSwruxhJF6QIwhCEHusv9BMK+iWGbY7mpashSEJBYVEoobaWuuL2GuZl13VXH3YeZ2eXj5kzh3MWDb5x6MbRA106VJgKU2EqTIXJNHoV3wnsgXODl/87Z/KbkeO5zu1YLRQAgNfg4Tt2lPVQHY0xBBSFUgSGgOAjZ3xX3UqhKJPfjIrChKAmAlP/bqSsMEqYpihzwIKlSkm5oxSKKlQK4mJMrxkDShieEoYf7htqO2r6YrYhCgAAq5sRSphPANBWrTsk1HjQDpQlOIf5cr6lW6mtMbdPCeOUipoJWgWhxMbYESXMZKsoa2gB2TIrWx7zUMIMiEXNh5Ywy+WkJditm21s8s7jqGZEMGoxbMMMlxGfnGt14rp+HZzoj3mpacMWXsF0Kd2+QjHBJsB550IpqOWIvWVUwxiLf8XBFXW3hLNHVjFVTMlXWsdyMXDf74nCrV1u4HvxQ/6aP5qNAgAMCvnY+pUDXwtvyjUjhBqfAMDcaI3jehOTP0nluyRCjaf1nu3cOvH5+6Vz7RuhxlrxtvvAJtpfZKp/FFWYzOMXdz2r/357T48AAAAASUVORK5CYII=" /></div>
				<div class="btn-text show-light" style="color: ${getColor(gr.color, true, 'btn')}">${gr.name}</div>
				<div class="btn-text show-dark" style="color: ${getColor(gr.color, false, 'btn')}">${gr.name}</div>
			</div>`;
				template.innerHTML = html;
				const el = template.content.firstChild;
				let justTurnedOff = false;
				el.onclick = () => {
					if (justTurnedOff) {
						justTurnedOff = false;
						return;
					}
					const isOff = el.classList.contains('btn-off');
					const targetOpacity = isOff ? 255 : 0;

					this.toggleChart(gr.opacityKey);
					this.startChangeKey(gr.opacityKey, targetOpacity);

					if (this.entangledChart) {
						if (!this.entangledChart.isPieChart) {
							this.entangledChart.startChangeKey(gr.opacityKey, targetOpacity);
						}
						this.entangledChart.toggleChart(gr.opacityKey);
						this.entangledChart.force_redraw_details = true;
						this.entangledChart.drawDetails();
					}

					if (isOff) {
						el.classList.remove('btn-off');
						el.classList.add('btn-on');
					} else {
						el.classList.remove('btn-on');
						el.classList.add('btn-off');
					}
				};
				let swichOtherOffId = null;
				const turnOffFn = function turnOffFn() {
					el.classList.remove('holding');
					for (let i = 0; i < btns.length; i += 1) {
						if (btns[i] !== el && btns[i].classList.contains('btn-on')) {
							btns[i].click();
						}
						if (btns[i] === el && btns[i].classList.contains('btn-off')) {
							btns[i].click();
						}
					}
					justTurnedOff = true;
				};

				el.addEventListener('mousedown', (event) => {
					event.preventDefault();
					clearTimeout(swichOtherOffId);
					swichOtherOffId = setTimeout(turnOffFn, 750);
					el.classList.add('holding');
				});

				el.addEventListener('mouseup', () => {
					clearTimeout(swichOtherOffId);
					el.classList.remove('holding');
				});
				el.addEventListener('mouseleave', () => {
					clearTimeout(swichOtherOffId);
					el.classList.remove('holding');
				});

				el.addEventListener('touchstart', (event) => {
					event.preventDefault();
					clearTimeout(swichOtherOffId);
					swichOtherOffId = setTimeout(turnOffFn, 750);
					el.classList.add('holding');
				});

				el.addEventListener('touchend', (e) => {
					clearTimeout(swichOtherOffId);
					el.classList.remove('holding');
					let target = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
					while (target && target !== el) {
						target = target.parentElement;
					}
					if (target === el) {
						el.click();
					}
				});
				el.addEventListener('touchcancel', () => {
					clearTimeout(swichOtherOffId);
					el.classList.remove('holding');
				});
				return el;
			});
			return btns;
		}
	}

	class ChartContainer {
		constructor(appContainerEl, num, singleBar, pieChartDetails) {
			this.num = num;
			this.isPieChartDetails = pieChartDetails;
			this.isSaveBtnState = !singleBar;
			this.isSingleBar = singleBar;
			this.appContainerEl = appContainerEl;
			this.appEl = this.appContainerEl.firstElementChild;
			this.main_chart = this.appEl.getElementsByClassName('main_chart')[0];
			this.details_chart = this.appEl.getElementsByClassName('details_chart')[0];
			this.chart_map = this.appEl.getElementsByClassName('chart_map')[0];
			this.legend_els = this.appEl.getElementsByClassName('legend')[0].getElementsByClassName('date');
			this.zoomOutEl = this.appEl.getElementsByClassName('zoom-out')[0];
			this.titleEl = this.appEl.getElementsByClassName('title')[0];
			this.height = 300;
			this.map_height = 40;

			this.mainChart = new Chart(this.main_chart, this.height);
			this.mainChart.zoomOutEl = this.zoomOutEl;
			this.mapChart = new Chart(this.chart_map, this.map_height);
			this.mapChart.isDrawAxis = false;
			this.mapChart.thickness = 1.2;
			this.mapChart.entangledChart = this.mainChart;
			this.mainChart.setUpHoverDetails(this.details_chart);

			if (pieChartDetails) {
				this.pieChart = new PieChart(this.main_chart, this.height);
				this.pieChart.setUpPieHover();
			}

			this.map_container = this.appEl.getElementsByClassName('map_container')[0];
			this.thumb = this.appEl.getElementsByClassName('selected')[0];
			this.thumb_left = this.appEl.getElementsByClassName('thumb_left')[0];
			this.thumb_right = this.appEl.getElementsByClassName('thumb_right')[0];
			this.overlay_left = this.appEl.getElementsByClassName('overlay_left')[0];
			this.overlay_right = this.appEl.getElementsByClassName('overlay_right')[0];
			this.isLight = false;
			this.windowWidth = this.appEl.clientWidth;

			this.setupAllEvents();
		}

		initMapBox() {
			this.container_width = this.map_container.offsetWidth;
			this.thumb_width = this.thumb.offsetWidth;
			this.overlay_left.style.width = `${this.container_width - this.thumb_width}px`;
		}

		updateLegend(isInitial) {
			let fromDate = '';
			let toDate = '';
			if (this.isPieChartDetails && !this.isOverview) {
				fromDate = this.pieChart.x_vals[this.pieChart.start_i];
				toDate = fromDate;
				if (this.pieChart.selectedDays > 1) {
					toDate = this.pieChart.x_vals[this.pieChart.start_i + this.pieChart.selectedDays - 1];
				}
			} else if (!this.isOverview) {
				if (this.isSingleBar) {
					fromDate = this.mainChart.x_vals[Math.round(this.mainChart.x_vals.length / 2)];
					toDate = fromDate;
				} else {
					fromDate = this.mainChart.x_vals[this.mainChart.start_i + 5];
					toDate = this.mainChart.x_vals[this.mainChart.end_i - 5];
				}
			} else {
				if (this.mainChart[zx] < this.mainChart.x_vals[this.mainChart.start_i]) {
					fromDate = this.mainChart.x_vals[this.mainChart.start_i];
				} else {
					fromDate = this.mainChart.x_vals[this.mainChart.start_i + 1];
				}

				if (this.mainChart[mx] > this.mainChart.x_vals[this.mainChart.end_i - 1]) {
					toDate = this.mainChart.x_vals[this.mainChart.end_i - 1];
				} else {
					toDate = this.mainChart.x_vals[this.mainChart.end_i - 2];
				}
			}
			const fromTxt = getFullDateText(fromDate);
			const toTxt = getFullDateText(toDate);
			const le = this.legend_els;
			if (isInitial) {
				[0, 1, 2, 3, 4, 5, 6].forEach((num) => {
					le[num].classList.add('no-animate');
				});
			}
			if (fromTxt.join() !== toTxt.join()) {
				[0, 1, 2].forEach((num) => {
					le[num].classList.remove('hidden');
				});
				changeLabels(le[0], fromTxt[0], true);
				changeLabels(le[1], fromTxt[1], true);
				changeLabels(le[2], fromTxt[2], true);
				changeLabels(le[3], '-', true);
				changeLabels(le[4], toTxt[0], true);
				changeLabels(le[5], toTxt[1], true);
				changeLabels(le[6], toTxt[2], true);
			} else {
				[0, 1, 2].forEach((num) => {
					le[num].classList.add('hidden');
				});
				changeLabels(le[3], `${fromTxt[3]},`, true);
				changeLabels(le[4], fromTxt[0], true);
				changeLabels(le[5], fromTxt[1], true);
				changeLabels(le[6], fromTxt[2], true);
			}
			setTimeout(() => {
				if (isInitial) {
					[0, 1, 2, 3, 4, 5, 6].forEach((num) => {
						le[num].classList.remove('no-animate');
					});
				}
			});
		}

		tryStartMovingX() {
			if (this.isPieChartDetails && !this.isOverview) {
				this.pieChart[zx] = this.nextfrom;
				this.pieChart[mx] = this.nextto;
				this.pieChart.calculateSections();
				this.updateLegend();
				setTimeout(this.updateLegend.bind(this), duration * 1.2);
				return;
			}
			if (this.mainChart.changes[zx].startTimestamp === -1 ||
				(Date.now() - this.mainChart.changes[zx].startTimestamp > (duration * 0.75))) {
				this.mainChart.startChangeKey(zx, this.nextfrom);
				this.mainChart.startChangeKey(mx, this.nextto);
				this.updateLegend();
				setTimeout(this.updateLegend.bind(this), duration * 1.2);
			} else {
				cancelAnimationFrame(this.moveXFrame);
				this.moveXFrame = requestAnimationFrame(() => {
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
				this.overlay_right.targetWidth = null;
				this.overlay_left.targetWidth = null;
			}
		}

		moveChart(dx, isForce) {
			let dx_int = Math.round(dx);
			if (!this.isOverview && this.isPieDetails) {
				dx_int += this.accumDx || 0;
				if (Math.abs(dx_int) < this.allowedStep && !isForce) {
					this.accumDx = dx_int;
					return;
				}
				dx_int = Math.round(dx_int / this.allowedStep) * this.allowedStep;
				this.accumDx = 0;
			}
			const right = +this.thumb.style.right.slice(0, -2);
			if (right - dx_int < 0) {
				dx_int = right;
			}
			if (this.container_width - right - this.thumb_width + dx_int < 0) {
				dx_int = right + this.thumb_width - this.container_width;
			}
			this.thumb.style.right = `${right - dx_int}px`;

			this.overlay_right.style.width = `${right - dx_int}px`;
			this.overlay_left.style.width = `${this.container_width - right - this.thumb_width + dx_int}px`;

			this.setMapBox();
		}

		moveLeftBorder(dx) {
			let dx_int = Math.round(dx);
			if (!this.isOverview && this.isPieDetails) {
				dx_int += this.accumLDx || 0;
				if (Math.abs(dx_int) < this.allowedStep) {
					this.accumLDx = dx_int;
					return;
				}
				const addDays = Math.round(dx_int / this.allowedStep);
				dx_int = addDays * this.allowedStep;
				if (this.pieChart.selectedDays - addDays < this.pieChart.minSelectedDays) {
					return;
				}
				this.pieChart.selectedDays -= addDays;
				this.accumLDx = 0;
			}
			const left_width = this.overlay_left.targetWidth || this.overlay_left.offsetWidth;
			if (left_width + dx_int < 0) {
				dx_int = -left_width;
			}
			const right = +this.thumb.style.right.slice(0, -2);
			if (this.thumb_width - dx_int < min_thumb_width) {
				dx_int = this.thumb_width - min_thumb_width;
			}
			this.thumb_width -= dx_int;
			this.thumb.style.width = `${this.thumb_width}px`;

			this.overlay_left.targetWidth = this.container_width - right - this.thumb_width;
			this.overlay_left.style.width = `${this.overlay_left.targetWidth}px`;

			this.setMapBox();
		}

		moveRightBorder(dx) {
			let dx_int = Math.round(dx);
			if (!this.isOverview && this.isPieDetails) {
				dx_int += this.accumRDx || 0;
				if (Math.abs(dx_int) < this.allowedStep) {
					this.accumRDx = dx_int;
					return;
				}
				const addDays = Math.round(dx_int / this.allowedStep);
				dx_int = addDays * this.allowedStep;
				if (this.pieChart.selectedDays + addDays < this.pieChart.minSelectedDays) {
					return;
				}
				this.pieChart.selectedDays += addDays;
				this.accumRDx = 0;
			}
			const right_width = this.overlay_right.targetWidth || this.overlay_right.offsetWidth;
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

			this.overlay_right.targetWidth = right - dx_int;
			this.overlay_right.style.width = `${this.overlay_right.targetWidth}px`;

			this.setMapBox();
		}

		moveSelectBoxForOverview() {
			this.map_container.classList.add('animating');
			setTimeout(() => { this.map_container.classList.remove('animating'); }, duration * 1.2);
			if (this.mapBoxParams) {
				this.thumb_width = this.mapBoxParams.thumb_width * this.container_width;
				this.thumb.style.width = `${this.thumb_width}px`;
				this.thumb.style.right = `${this.mapBoxParams.right * this.container_width}px`;

				this.overlay_right.style.width = `${this.mapBoxParams.right * this.container_width}px`;
				this.overlay_left.style.width = `${this.mapBoxParams.left * this.container_width}px`;
			}

			this.mainChart[zx] = this.overviewFrom;
			this.mainChart[mx] = this.overviewTo;
		}

		moveSelectBoxForDetails() {
			this.mapBoxParams = {
				thumb_width: this.thumb_width / this.container_width,
				left: this.overlay_left.offsetWidth / this.container_width,
				right: (+this.thumb.style.right.slice(0, -2)) / this.container_width,
				from: this.mainChart[zx],
				to: this.mainChart[mx],
			};
			if (this.isSingleBar) {
				this.mainChart[zx] = this.mainChart.x_vals[0];
				this.mainChart[mx] = this.mainChart.x_vals[this.mainChart.x_vals.length - 1];
				return;
			}
			this.map_container.classList.add('animating');
			if (!this.isPieChartDetails) {
				setTimeout(() => { this.map_container.classList.remove('animating'); }, duration * 1.2);
			}
			this.detailsFrom -= 3600000;
			let toX = this.detailsFrom + 86400000; // Adding 1day in ms
			const totalX = this.mapChart.x_vals[this.mapChart.x_vals.length - 1] - this.mapChart.x_vals[0];
			const scale = totalX / this.container_width;
			const pad = this.mapChart.x_vals[0];
			let leftVal = (this.detailsFrom - pad) / scale;
			let rightVal = this.container_width - ((toX - pad) / scale);
			let widthVal = this.container_width - rightVal - leftVal;
			let daysDelta = 1;
			while (widthVal < min_thumb_width) {
				toX += 86400000;
				daysDelta += 1;
				rightVal = this.container_width - ((toX - pad) / scale);
				widthVal = this.container_width - rightVal - leftVal;
			}
			if (this.pieChart && this.pieDetailsData.extraRightSpace) {
				rightVal += widthVal;
				leftVal -= widthVal;
			}

			this.thumb_width = widthVal;
			this.thumb.style.width = `${this.thumb_width}px`;
			this.thumb.style.right = `${rightVal}px`;

			this.overlay_right.style.width = `${rightVal}px`;
			this.overlay_left.style.width = `${leftVal}px`;

			if (this.pieChart) {
				this.pieChart[zx] = this.detailsFrom + 0;
				this.pieChart[mx] = toX + 0;
				this.pieChart.selectedDays = daysDelta;
				this.pieChart.minSelectedDays = daysDelta;
			} else {
				this.mainChart[zx] = this.detailsFrom;
				this.mainChart[mx] = toX;
			}
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

			this.mainChart.changeChart = () => {
				if (this.isPieChartDetails) {
					this.mainChart.last_details_num += 1;
					this.generatePieDetailsData();
				}
				this.disappear();
				setTimeout(() => {
					if (this.isOverview) {
						this.showDetails();
					} else {
						this.showOverview();
					}
				}, duration);
			};
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
			this.mainChart.hideDetails();
			this.mainChart.isLight = this.isLight;
			this.mapChart.isLight = this.isLight;
			if (this.pieChart) {
				this.pieChart.hideDetails();
				this.pieChart.isLight = this.isLight;
			}
			if (!isInitial) {
				this.mainChart.drawAll();
				this.mapChart.drawAll();
				if (this.pieChart) {
					this.pieChart.drawAll();
				}
			}
		}

		disappear() {
			if (this.isSaveBtnState) {
				this.btnState = this.btns.map((btn) => { return btn.classList.contains('btn-on'); });
			}
			const deltaMain = this.mainChart[zx] - this.mainChart[mx];
			if (this.isOverview) {
				this.overviewFrom = this.mainChart[zx];
				this.overviewTo = this.mainChart[mx];
			}
			if (this.isPieDetails && !this.isOverview) {
				this.pieChart.hideDetails();
				this.pieChart.startChangeKey(op, 0);
				this.pieChart.graphs.forEach((gr) => {
					this.pieChart.startChangeKey(gr.paddingKey, this.pieChart.radius * 2);
				});
				this.zoomOutEl.classList.add('hidden');
			} else {
				this.mainChart.isDisappearing = true;
				this.mainChart.hideDetails();
				if (this.isOverview) {
					this.mainChart.startChangeKey(zx, this.mainChart[zx] - deltaMain / 2);
					this.mainChart.startChangeKey(mx, this.mainChart[mx] + deltaMain / 2);
					this.titleEl.classList.add('hidden');
				} else {
					if (!this.isSingleBar) {
						this.mainChart.startChangeKey(zx, this.mainChart[zx] + deltaMain / 2);
						this.mainChart.startChangeKey(mx, this.mainChart[mx] - deltaMain / 2);
					} else {
						this.mainChart.startChangeKey(zx, this.mainChart[zx] - deltaMain / 2);
						this.mainChart.startChangeKey(mx, this.mainChart[mx] + deltaMain / 2);
					}
					this.zoomOutEl.classList.add('hidden');
				}

				this.mainChart.graphs.forEach((gr) => {
					this.mainChart.startChangeKey(gr.opacityKey, 0);
				});

				for (let i = 0; i < this.mainChart.y_legend.length; i += 1) {
					const item = this.mainChart.y_legend[i];
					if (item.display) {
						item.display = false;
						item.startTimestamp = Date.now();
					}
				}

				for (let i = 0; i < this.mainChart.x_legend.length; i += 1) {
					const item = this.mainChart.x_legend[i];
					if (item.display) {
						item.display = false;
						item.startTimestamp = Date.now();
					}
				}
			}

			const deltaMap = this.mapChart[zx] - this.mapChart[mx];
			this.mapChart.isDisappearing = true;
			this.mapChart.startChangeKey(zx, this.mapChart[zx] - deltaMap / 2);
			this.mapChart.startChangeKey(mx, this.mapChart[mx] + deltaMap / 2);

			this.mapChart.graphs.forEach((gr) => {
				this.mapChart.startChangeKey(gr.opacityKey, 0);
			});

			if (this.isSingleBar && this.isOverview) {
				this.map_container.style.marginTop = '-80px';
			}
			if (this.btns && !this.isSaveBtnState) {
				this.btns.forEach((btn) => {
					btn.style.transform = 'scale(0)';
				});
			}
		}

		// eslint-disable-next-line class-methods-use-this
		appearChart(chart) {
			if (chart.percentBars) {
				// ToDo: remove
				chart.drawAll();
				return;
			}
			const origMx = chart[mx];
			const origZx = chart[zx];
			const delta = origMx - origZx;
			if (this.isOverview) {
				chart[mx] -= delta * 0.55;
				chart[zx] += delta * 0.55;
			} else {
				// eslint-disable-next-line no-lonely-if
				if (!this.isSingleBar) {
					chart[mx] += delta * 0.65;
					chart[zx] -= delta * 0.65;
				} else {
					chart[mx] -= delta * 0.55;
					chart[zx] += delta * 0.55;
				}
			}
			chart.startChangeKey(zx, origZx);
			chart.startChangeKey(mx, origMx);

			chart.graphs.forEach((gr) => {
				chart[gr.opacityKey] = 0;
				if (gr.display) {
					chart.startChangeKey(gr.opacityKey, 255);
				}
			});
		}

		appear(optionsOrig) {
			this.appearChart(this.mapChart);
			if (this.isOverview) {
				this.moveSelectBoxForOverview();
			} else {
				this.moveSelectBoxForDetails();
			}
			if (!optionsOrig.pieChart) {
				this.mainChart.isAppear = true;
				this.mainChart.calculateMaxY(true, true);
				this.appearChart(this.mainChart);
			} else {
				setTimeout(() => { this.setPieMapAllowedX(); }, duration * 2);
				this.pieChart.appear();
			}
			if (this.isOverview) {
				this.titleEl.classList.remove('hidden');
			} else {
				this.zoomOutEl.classList.remove('hidden');
			}
			this.updateLegend();
		}

		run(collection, optionsOrig) {
			this.collection = collection;
			this.type = this.collection.types.y0;
			this.optionsOrig = this.optionsOrig;
			this.setColors(true);
			const mainOptions = { isDetails: !this.isOverview };
			const mapOptions = { isDetails: !this.isOverview };
			const options = optionsOrig || {};
			if (collection.y_scaled) {
				mainOptions.y_scaled = true;
				mapOptions.y_scaled = true;
			}
			let main = this.mainChart;
			if (optionsOrig.pieChart) {
				mapOptions.percentBars = true;
				this.mainChart.isSilent = true;
				this.pieChart.isSilent = false;
				this.details_chart.style.display = 'none';

				this.mapChart.entangledChart = this.pieChart;
				this.pieChart.init();
				this.pieChart.setData(this.pieDetailsData);
				main = this.pieChart;
			} else {
				this.mainChart.isSilent = false;
				this.details_chart.style.display = 'block';
				if (this.pieChart) {
					this.pieChart.isSilent = true;
				}
				this.mainChart.setData(collection, this.type, mainOptions);
				this.mapChart.entangledChart = this.mainChart;
			}
			this.mapChart.setData(collection, this.type, mapOptions);
			if (this.isSingleBar && this.isOverview) {
				this.map_container.style.marginTop = '0px';
			}

			while (this.btns && this.btns.length > 0) {
				this.appEl.removeChild(this.btns.shift());
			}
			this.btns = this.mapChart.generateControlButtons();
			if (this.btns) {
				this.btns.forEach((btn, num) => {
					if (this.isSaveBtnState && this.btnState && !this.btnState[num]) {
						btn.classList.remove('btn-on');
						btn.classList.add('btn-off');
					} else if (!this.isSaveBtnState) {
						btn.style.transform = 'scale(0)';
					}
					this.appEl.appendChild(btn);
					setTimeout(() => { btn.style.transform = 'scale(1)'; });
				});
			}

			main.init();
			this.mapChart.init();
			this.mapChart.calculateMaxY(true, options.isAppear);
			if (!options.isAppear) {
				this.setMapBox(true);
				if (!optionsOrig.pieChart) {
					this.mainChart.calculateMaxY(true, options.isAppear);
				}
			}
			if (this.isSaveBtnState && this.btnState) {
				main.graphs.forEach((gr, num) => {
					if (!this.btnState[num]) {
						gr.display = false;
						this.mapChart.graphs[num].display = false;
					}
				});
			}
			if (options.isAppear) {
				this.appear(optionsOrig);
			} else {
				this.updateLegend(true);
			}
		}

		setupAllEvents() {
			this.setupTouchEvents();
			this.setupMouseEvents();

			global.addEventListener('resize', () => {
				if (this.windowWidth === this.appEl.clientWidth) {
					return;
				}
				this.windowWidth = this.appEl.clientWidth;
				if (!this.isOverview && this.isPieChartDetails) {
					this.pieChart.init();
					this.pieChart.drawAll();
					setTimeout(() => {
						this.setPieMapAllowedX();
						this.moveChart(0, true);
						this.setMapBox();
					}, duration);
				} else {
					this.mainChart.init();
					this.mainChart.calculateDetailsOffset();
				}
				this.mapChart.init();
				this.mapChart.drawAll();
				this.container_width = this.map_container.clientWidth;
				this.moveChart(0);
				this.setMapBox();
			});
		}

		loadDetails(folder, file) {
			return fetch(`data_1/${this.num}/${folder}/${file}.json`)
				.then((response) => {
					const jsonData = response.json();
					return jsonData;
				});
		}

		loadMainData() {
			if (!this.overviewData) {
				return fetch(`data_1/${this.num}/overview.json`)
					.then((response) => {
						const jsonData = response.json();
						this.overviewData = jsonData;
						return jsonData;
					});
			}
			return new Promise((resolve) => {
				resolve(this.overviewData);
			});
		}

		setPieMapAllowedX() {
			const allowedPieX = [];
			this.allowedStep = 0;
			for (let i = 0; i < this.mapChart.x_vals.length; i += 1) {
				allowedPieX.push(this.mapChart.translateX(this.mapChart.x_vals[i]));
				this.allowedStep = allowedPieX[i] - allowedPieX[i - 1];
			}
		}

		generatePieDetailsData() {
			this.pieDetailsData = {
				types: this.collection.types,
				names: this.collection.names,
				colors: this.collection.colors,
				percentage: this.collection.percentage,
				stacked: this.collection.stacked,
				pieChart: true,
				columns: [],
			};

			let from = this.mainChart.start_i;
			let to = this.mainChart.end_i + 2;
			this.pieDetailsData.extraRightSpace = this.mainChart.end_i === this.mainChart.x_vals.length;
			if (from === 0) {
				from += 1;
				to += 1;
			}
			this.collection.columns.forEach((col) => {
				const newCol = [col[0], ...col.slice(from, to)];
				this.pieDetailsData.columns.push(newCol);
			});
		}

		showPieDetails() {
			this.isOverview = false;
			this.isPieDetails = true;
			this.run(this.pieDetailsData, { isAppear: true, pieChart: true });
		}

		showDetails() {
			const selectedX = this.mainChart.x_vals[this.mainChart.last_details_num];
			this.detailsFrom = selectedX;
			if (this.isPieChartDetails) {
				this.showPieDetails();
				return;
			}
			const selectedDate = new Date(selectedX);
			const folder = `${selectedDate.getFullYear()}-${padZeros(selectedDate.getMonth() + 1)}`;
			const file = padZeros(selectedDate.getDate());
			this.loadDetails(folder, file)
				.then((detailsData) => {
					this.isOverview = false;
					this.mainChart.isDetails = true;
					this.run(detailsData, { isAppear: true });
				})
				.catch((err) => {
					console.error(err);
					document.getElementById('error-box').classList.add('shown');
					setTimeout(() => {
						document.getElementById('error-box').classList.remove('shown');
					}, 4000);
					this.showOverview();
				});
		}

		showOverview(isInitial) {
			this.loadMainData()
				.then((jsonData) => {
					this.isOverview = true;
					this.mainChart.isDetails = false;
					this.run(jsonData, { isAppear: !isInitial });
				})
				.catch((err) => {
					console.error(err);
					document.getElementById('error-box').classList.add('shown');
					setTimeout(() => {
						document.getElementById('error-box').classList.remove('shown');
					}, 4000);
				});
		}
	}

	const charts = [];
	const chartsEls = document.body.getElementsByClassName('app-container');

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

	for (let i = 0; i < 5; i += 1) {
		const isSingleBar = i === 3;
		const isPieDetails = i === 4;
		const chart = new ChartContainer(chartsEls[i], i + 1, isSingleBar, isPieDetails);
		charts.push(chart);
		chart.initMapBox();
		chart.showOverview(true);
	}
}(window));
