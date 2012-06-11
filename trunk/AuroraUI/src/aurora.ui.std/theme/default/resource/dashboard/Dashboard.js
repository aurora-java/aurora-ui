(function(){
	var mathSin = Math.sin,
		mathCos = Math.cos,
		mathMin = Math.min,
		mathSqrt = Math.sqrt,
		mathPI = Math.PI,
		angle2Raduis = mathPI / 180,
		percent2Number =function(pv,v,av){
			if(/\%/.test(pv)){
				return parseFloat(pv)*v/100 + (av||0);
			}
			return pv;
		},
		isPercent = function(v){
			return /\%/.test(v);
		},
		measureText = function(text,fontSize){
			var textEl = new Ext.Template('<span style="font-size:{fontSize}">{text}</span>').append(document.body,{fontSize:fontSize,text:text},true),
    			textWidth = textEl.getWidth();
    		textEl.remove();
    		return textWidth;
		},
		convertAlign = function(a){
			switch(a){
				case 'left' :
				case 'top' : return -1;
				case 'right' :
				case 'bottom' : return 1;
				default : return 0;
			}
		},
		alignSize = function(w,a){
			switch(a){
				case -1: return 0;
				case 0: return w/2;
				case 1: return w;
			}
		},
		merge = function(){
			function clone(object){
				var _clone = function(){};
				_clone.prototype = object
				return new _clone();
			}
			function mergeOne(source, key, current){
				if(Ext.isObject(current)){
					if (Ext.isObject(source[key])) _merge(source[key], current);
					else source[key] = clone(current);
				}else if(Ext.isArray(current)){
					source[key] = [].concat(current);
				}else{
					source[key] = current;
				}
				return source;
			}
			function _merge(source, k, v){
				if (Ext.isString(k)) return mergeOne(source, k, v);
				for (var i = 1, l = arguments.length; i < l; i++){
					var object = arguments[i];
					for (var key in object) mergeOne(source, key, object[key]);
				}
				return source;
			}
			
			return function(){
				var args = [{}],
					i = arguments.length,
					ret;
				while (i--) {
					if (!Ext.isBoolean(arguments[i])) {
						args[i + 1] = arguments[i];
					}
				}
				ret = _merge.apply(null, args);
				return ret;
			}
		}();
$A.Dashboard = Ext.extend($A.Graphics,{
	options : {
		chart : {
			align : 'center',
			verticalAlign : 'middle',
			padding : 10,
			max : 100,
			min : 0,
			borderWidth : 4,
			borderColor : '#4572A7',
			borderRadius : 5,
			backgroundColor : 'gradient(linear,0 0,100% 100%,color-stop(0,rgba(255,255,255,1)),color-stop(100%,rgba(240,240,255,1)))',
			style: {
				fontFamily: '"Lucida Grande", "Lucida Sans Unicode", Verdana, Arial, Helvetica, sans-serif',
				fontSize: '11px',
				color : '#000'
			}
		},
		board : {
			allowDecimals : true,
			width : '40%',
			fillColor : 'gradient(linear,0 0,100% 0,color-stop(0,rgba(0,255,255,1)),color-stop(50%,rgba(255,255,0,1)),color-stop(100%,rgba(255,0,0,1)))',
			fillOpacity : null,
			borderColor : '#000',
			borderWidth : 1,
			startAngle : 0,
			endAngle : 180,
			tickColor: '#000',
			tickLength: '25%',
			tickPosition : 'inside',
			tickInterval : null,
			tickAngleInterval : 30,
			tickWidth : 1,
			tickStartAngle : 10,
			tickEndAngle : -10,
			minorTickColor: '#A0A0A0',
			minorTickLength: 2,
			minorTickPosition: 'inside',
			minorTickWidth: 0,
			marginalTickLength : '50%',
			marginalTickWidth : 1,
			marginalTickColor : '#000',
			startOntick : true,
			endOntick : true,
			showFirstLabel : true,
			showLastLabel : true,
			labels : {
				enabled : true,
				x : 5,
				y : 5,
				rotation : 0,
				style: {
					color: 'rgb(0,0,214)',
					fontSize: '11px',
					lineHeight: '14px'
				}
			}
		},
		pointer : {
			fillColor : 'rgba(135,135,135,0.5)',
			fillOpacity : null,
			borderColor : '#000',
			borderWidth : 1,
			width : 8,
			dist : 10,
			labels : {
				enabled : true,
				x : 15,
				y : -15,
				rotation : -90,
				style: {
					color: 'rgb(145,45,0)',
					fontSize: '11px',
					lineHeight: '14px'
				}
			}
		},
		title : {
			text : 'Dashboard title',
			align : 'center',
			verticalAlign : 'top',
			margin : 15,
			x : 0,
			y : 0,
			style: {
				color: '#3E576F',
				fontSize: '16px'
			}
		}
	},
	constructor : function(config){
		$A.Dashboard.superclass.constructor.call(this,config);
		this.setOptions(config);
	},
	processDataListener : function(ou){
		var ds = this.binder && this.binder.ds;
		if(ds){
			ds[ou]('update',this.redraw,this);
		}
	},
	bind : function(ds,name){
		if(typeof(ds) == 'string'){
    		ds = $(ds);
    	}
    	if(!ds)return;
    	this.binder = {
    		ds: ds,
    		name:name
    	}
    	this.record = ds.getCurrentRecord();
    	this.processDataListener('on');
    	this.onLoad();
    },
    setOptions : function(options,redraw){
    	this.options = merge(this.options,options);
    	if(redraw){
    		this.redraw();
    	}
    },
    onLoad : function(){
    	var chart = this;
		if (!this.hasSVG ) {
			$A.onReady(function(){
				chart.redraw();
			})
		}else{
			chart.redraw();
		}
    },
    redraw : function(){
    	if(!this.record)return;
    	var options = this.options,
    		chart = options.chart,
    		title = options.title,
    		board = options.board
    		pointer = options.pointer;
    	this.clear();
    	this.renderBoard(board,title,pointer,chart);
    	this.renderPointer(pointer,chart);
    	this.renderTitle(title,chart);
    },
    setTitle : function(options){
    	this.options.title = merge(this.options.title,options);
    	this.redraw();
    },
    clear : function(){
    	var cmps = this.top.cmps;
    	while(cmps.length){
    		cmps.pop().destroy();
    	}
    	this.pointerEl = null;
    },
    renderTitle : function(title,chart){
    	var text = title.text;
    	if(!text)return;
    	var	borderWidth = chart.borderWidth,
    		margin = title.margin,
    		style = title.style,
    		fontSize = style.fontSize,
    		titleHeight = parseInt(fontSize);
    		this.createGElement('text',{
    			text : text,
    			color : style.color,
    			size : titleHeight,
    			dx : title.x + margin + alignSize(chart.width - margin * 2 - borderWidth * 2 - measureText(text,fontSize),convertAlign(title.align)),
    			dy : title.y + margin + alignSize(chart.height - margin * 2 - borderWidth * 2 - titleHeight,convertAlign(title.verticalAlign))
    		});
    },
    renderBoard : function(board,title,pointer,chart){
    	var titleVAlgin = title.verticalAlign,
    		padding = chart.padding,
    		borderWidth = chart.borderWidth,
    		borderRadius = chart.borderRadius,
    		textHeight = parseInt(title.style.fontSize),
    		marginLeft = (Ext.isEmpty(chart.marginLeft)? 0 : chart.marginLeft) + borderWidth,
    		marginRight = (Ext.isEmpty(chart.marginRight)? 0 : chart.marginRight) + borderWidth,
    		marginTop = (Ext.isEmpty(chart.marginTop) ? (title.text && titleVAlgin == 'top' ? textHeight + title.margin*2 :0) : chart.marginTop) + borderWidth,
    		marginBottom = (Ext.isEmpty(chart.marginBottom) ? (title.text && titleVAlgin == 'bottom' ? textHeight + title.margin*2 :0) : chart.marginBottom) + borderWidth,
    		chartWidth = chart.width,
    		chartHeight = chart.height,
    		width = (chartWidth || 300) - padding * 2 - marginLeft - marginRight,
    		height = (chartHeight || 300) - padding * 2 - marginTop - marginBottom,
    		align = convertAlign(chart.align),
    		vAlign = convertAlign(chart.verticalAlign),
    		startA = (board.startAngle % 360 + 360) % 360,
    		endA = (board.endAngle % 360 + 360) % 360,
    		endA = endA > startA? endA : endA + 360,
    		start = angle2Raduis * startA,
    		end =  angle2Raduis * (endA % 360),
    		max = chart.max,
    		min = chart.min,
    		dashWidth = board.width,
    		dashWidth = percent2Number(dashWidth,mathMin(height,width)),
    		tickAngleInterval = board.tickAngleInterval * angle2Raduis,
    		minAngle = board.startOntick ? start : board.tickStartAngle * angle2Raduis + start,
			maxAngle = board.endOntick ? end : board.tickEndAngle * angle2Raduis + end,
    		interval = this.normalizeTickInterval(board.tickInterval ? board.tickInterval : (max - min) * tickAngleInterval/(maxAngle - minAngle),board),
			tickAngleInterval =  (maxAngle - minAngle) * interval / (max-min),
			tickCount = Math.ceil((max - min)/interval),
    		sinA = mathSin(start),
    		sinB = mathSin(end),
    		cosA = mathCos(start),
    		cosB = mathCos(end),
    		radius,x,y,
    		getXY = function (startR,endR,xR,yR){
				radius = mathMin(startR , endR);
				var o={xR:xR * radius,yR:yR * radius},_x,_y,_align,_size;
				if(endR <= startR){
					_size = width * (1 - radius / startR);
					_x='x';_y='y';_align=align;
				}else{
					_size = height * (1 - radius / endR);
					_x='y';_y='x',_align=vAlign;
				}
				o[_x] = padding + o[_x+'R'] + alignSize(_size,_align);
				o[_y] = padding + o[_y+'R'];
				x = o.x + marginLeft;y = o.y + marginTop;
			}
    	if(sinA >= 0){
    		if(cosA >= 0){
	    		if(sinB >= 0){
	    			if(cosB > cosA){
	    				getXY(width / 2,height / 2 , 1 , 1);
	    			}else if(cosB >= 0){
	    				getXY(width / cosA,height / sinB , 0 ,sinB);
	    			}else{
	    				getXY(width / (cosA - cosB),height , -cosB , 1);
	    			}
	    		}else{
	    			if(cosB > cosA){
	    				getXY(width / (1 + cosB),height / 2 , 1 , 1);
	    			}else if(cosB >= 0){
	    				getXY(width / (1 + cosA),height / 2 , 1 , 1);
	    			}else{
						getXY(width / (1 + cosA),height / (1 - sinB) , 1 , 1);
	    			}
	    		}
    		}else{
    			if(cosB <= 0){
    				if(sinB > sinA){
    					getXY(width / 2,height / 2 , 1 , 1);
    				}else if(sinB >= 0){
    					getXY(width / - cosB,height / sinA, - cosB , sinA);
    				}else{
    					getXY(width , height/(sinA - sinB),1,sinA)
    				}
    			}else{
    				if(sinB > sinA){
    					getXY(width / 2,height / (1 + sinB) , 1 , sinB);
    				}else if(sinB >= 0){
    					getXY(width / 2,height / (1 + sinA), 1 , sinA);
    				}else{
    					getXY(width , height/(sinA - sinB),1,sinA)
    				}
    			}
    		}
    	}else{
    		if(cosA <= 0){
    			if(sinB <= 0){
    				if(cosB < cosA){
    					getXY(width / 2,height / 2 , 1 , 1);
    				}else if(cosB <= 0){
    					getXY(width / -cosA,height / -sinB , -cosA ,0);
    				}else{
    					getXY(width / (cosB - cosA),height , -cosA , 0);
    				}
    			}else{
    				if(cosB < cosA){
    					getXY(width / (1 - cosB),height / 2 , 1 , 1);
    				}else if(cosB <= 0){
    					getXY(width / (1 + cosA),height / 2 , 1 , 1);
    				}else{
    					getXY(width / (1 - cosA),height / (1 + sinB) , 1 , sinB);
    				}
    			}
    		}else{
    			if(cosB >= 0){
    				if(sinB < sinA){
    					getXY(width / 2,height / 2 , 1 , 1);
    				}else if(sinB <= 0){
    					getXY(width / cosB,height / -sinA, 0 , 0);
    				}else{
    					getXY(width , height/(sinB - sinA),0,sinB)
    				}
    			}else{
    				if(sinB < sinA){
    					getXY(width / 2,height / (1 - sinB) , 1 , 1);
    				}else if(sinB <= 0){
    					getXY(width / 2,height / (1 - sinA), 1 , 1);
    				}else{
    					getXY(width /(1 - cosB), height /(1 - sinA), -cosB, 1)
    				}
    			}
    		}
    	}
    	this.createGElement('rect',{
    		x : borderWidth,
    		y : borderWidth,
    		width : chartWidth - borderWidth*2,
    		height : chartHeight - borderWidth*2,
    		rx : borderRadius,
    		ry : borderRadius,
    		strokecolor : chart.borderColor,
    		strokewidth : borderWidth,
    		fillcolor : chart.backgroundColor,
    		cursor : 'default'
    	}).createGElement('arc',{
    		x : x,
    		y : y,
    		r : radius,
    		innerR : radius - dashWidth,
    		start : start,
    		end : end,
    		cursor : 'default',
    		fillcolor:board.fillColor,
    		fillopacity:board.fillOpacity,
    		strokecolor:board.borderColor,
    		strokewidth:board.borderWidth
    	})
		var angle = minAngle,
			label = min,
			labels = board.labels,
			labelStyle = labels.style,
			hideLabel;
    	for(var i = 0;i <= tickCount;i++){
    		var opt = this.getTickOptions(board,(i == 0 || i == tickCount)? 'marginal' : '',dashWidth),
    			_length = opt.length,
    			_cosA = mathCos(angle),
    			_sinA = mathSin(angle),
    			_points = [x + radius * _cosA , y - radius * _sinA , x + (radius - _length) * _cosA , y -  (radius - _length) * _sinA];
    		hideLabel = !labels.enabled || (!board.showFirstLabel && i == 0)||(!board.showLastLabel && i == tickCount)
    		this.createGElement('line',{
				points : _points.join(" "),
				strokewidth : (angle == start || angle == end) ? 0 :opt.width,
				strokecolor : opt.color,
				title : hideLabel?'':(label+''),
				titlesize : parseInt(labelStyle.fontSize || chart.style.fontSize),
				titlecolor : labelStyle.color || chart.style.color,
				titlex : labels.x,
				titley : labels.y,
				titlerotation : 90 - angle / angle2Raduis - labels.rotation ,
				titlefontfamily : labelStyle.fontFamily || chart.style.fontFamily,
				cursor : 'default'
    		})
    		if(i == tickCount - 1){
    			label = max;
    			angle = maxAngle;
    		}else{
    			label += interval;
    			angle += tickAngleInterval;
    		}
    	}
    	Ext.apply(pointer,{
	    	center : [x,y],
	    	start : start,
	    	end : end,
	    	minAngle : minAngle,
	    	maxAngle : maxAngle,
	    	radius : radius - pointer.dist
    	});
    },
    getTickOptions : function(border,type,dashWidth){
    	type = type ? type + 'T' :'t';
    	return {
    		length : percent2Number(border[type + 'ickLength'],dashWidth),
    		width : border[type + 'ickWidth'],
    		color : border[type + 'ickColor']
    	}
    },
    renderPointer : function(pointer,chart){
    	var max = chart.max,min = chart.min,
    		v = percent2Number(this.record.get(this.binder.name),max - min,min),
    		labels = pointer.labels,
    		style = chart.style,
    		labelStyle = labels.style,
    		width = pointer.width,
    		radius = pointer.radius,
    		center = pointer.center,
    		start = pointer.minAngle,
    		end = pointer.maxAngle < start ? pointer.maxAngle + mathPI * 2 : pointer.maxAngle,
    		angle = (end - start)/(max - min) * (v - min) + start,
    		_angle = angle2Raduis * 135,
    		angleL = angle + _angle,
    		angleR = angle - _angle,
    		sin = mathSin(angle),
    		cos = mathCos(angle),
    		dist = width * radius * mathSqrt(2) / (2 * radius - width),
    		x = center[0] + radius * cos,
    		y = center[1] - radius * sin,
    		d = ['M',center[0] - x,center[1] - y,
    			'L',center[0] + dist * mathCos(angleL) - x,center[1] - dist * mathSin(angleL) - y,
    			0,0,
    			center[0] + dist *mathCos(angleR) - x,center[1] - dist * mathSin(angleR) - y,
    			'Z'];
    	this.pointerEl = this.createGElement('path',{
    		d : d.join(' '),
    		x : x,
    		y : y,
    		strokecolor : pointer.borderColor,
    		strokewidth : pointer.borderWidth,
    		fillcolor : pointer.fillColor,
    		fillopacity : pointer.fillOpacity,
    		title : labels.enabled?v:'',
    		titlesize : parseInt(labelStyle.fontSize || style.fontSize),
			titlecolor : labelStyle.color || style.color,
			titlex : labels.x,
			titley : labels.y,
			titlerotation : 90 - angle / angle2Raduis - labels.rotation,
			titlefontfamily : labelStyle.fontFamily || style.fontFamily
    	}).createGElement('arc',{
    		x : center[0],
    		y : center[1],
    		r : width,
    		innerR : width - 2,
    		start : pointer.start,
    		end : pointer.end,
    		cursor : 'default',
    		strokecolor:pointer.borderColor,
    		strokewidth:pointer.borderWidth
    	})
    },
    normalizeTickInterval : function(interval,options) {
		var magnitude = Math.pow(10, Math.floor(Math.log(interval) / Math.LN10)),
			normalized = interval / magnitude,
			multiples = [1, 2, 2.5, 5, 10];
	
		if (options && options.allowDecimals === false) {
			if (magnitude === 1) {
				multiples = [1, 2, 5, 10];
			} else if (magnitude <= 0.1) {
				multiples = [1 / magnitude];
			}
		}
		for (var i = 0; i < multiples.length; i++) {
			interval = multiples[i];
			if (normalized <= (multiples[i] + (multiples[i + 1] || multiples[i])) / 2) {
				break;
			}
		}
		interval *= magnitude;
		return interval;
	}
})
})();