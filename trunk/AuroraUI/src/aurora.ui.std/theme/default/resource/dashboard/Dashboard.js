(function(){
	var mathSin = Math.sin,
		mathCos = Math.cos,
		mathMin = Math.min,
		mathSqrt = Math.sqrt,
		mathPI = Math.PI,
		angle2Raduis = mathPI / 180,
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
		align : 'center',
		verticalAlign : 'middle',
		padding : 10,
		max : 100,
		min : 0,
		borderWidth : 4,
		borderColor : '#4572A7',
		borderRadius : 5,
		style: {
			fontFamily: '"Lucida Grande", "Lucida Sans Unicode", Verdana, Arial, Helvetica, sans-serif',
			fontSize: '11px',
			color : '#000'
		},
		board : {
			allowDecimals : true,
			dashWidth : 0,
			fillColor : 'gradient(linear,-50% 0,50% 0,color-stop(0,rgba(0,255,255,1)),color-stop(50%,rgba(255,255,0,1)),color-stop(100%,rgba(255,0,0,1)))',
			fillOpacity : 0.5,
			borderColor : '#000',
			borderWidth : 1,
			startAngle : 0,
			endAngle : 180,
			tickColor: '#000',
			tickLength: '25%',
			tickPosition : 'inside',
			tickInterval : null,
			tickAngleInterval : 45,
			tickWidth : 1,
			minorTickColor: '#A0A0A0',
			minorTickLength: 2,
			minorTickPosition: 'inside',
			minorTickWidth: 0,
			marginalTickLength : '50%',
			marginalTickWidth : 1,
			marginalTickColor : '#000',
			startOntick : true,
			showFirstLabel : true,
			showLastLabel : true,
			labels : {
				enabled : true,
				x : 5,
				y : 5,
				style: {
					color: '#666',
					fontSize: '11px',
					lineHeight: '14px'
				}
			}
		},
		pointer : {
			fillColor : 'rgba(135,135,135,0.8)',
			fillOpacity : 1,
			borderColor : '#000',
			borderWidth : 1,
			width : 8,
			dist : 10,
			labels : {
				enabled : true,
				x : 5,
				y : 15,
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
    	this.clear();
    	this.group = this.createGElement('group');
    	this.renderBoard();
    	this.renderCenter();
    	this.renderTitle();
    	this.renderPointer();
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
    renderTitle : function(){
    	var options = this.options.title,
    		text = options.text;
    	if(!text){
    		return;
    	}
    	var	align = convertAlign(options.align),
    		vAlign = convertAlign(options.verticalAlign),
    		width = this.width,
    		height = this.height,
    		margin = options.margin,
    		x = options.x,
    		y = options.y,
    		style = options.style,
    		fontSize = style.fontSize,
    		color = style.color,
    		textWidth = measureText(text,fontSize),
    		textHeight = parseInt(fontSize);
    		this.titleEl = this.createGElement('text',{
    			root : this.group.wrap,
    			text : text,
    			color : color,
    			size : textHeight,
    			dx : x + margin + alignSize(width - margin * 2 - textWidth,align),
    			dy : y + margin + alignSize(height - margin * 2 - textHeight,vAlign)
    		});
    },
    renderBoard : function(){
    	var options = this.options,
    		title = options.title,
    		titleVAlgin = title.verticalAlign,
    		board = options.board,
    		padding = options.padding,
    		borderWidth = options.borderWidth,
    		borderColor = options.borderColor,
    		borderRadius = options.borderRadius,
    		marginLeft = (Ext.isEmpty(options.marginLeft)? 0 : options.marginLeft) + borderWidth,
    		marginRight = (Ext.isEmpty(options.marginRight)? 0 : options.marginRight) + borderWidth,
    		marginTop = (Ext.isEmpty(options.marginTop) ? (title.text && titleVAlgin == 'top' ? title.y + title.margin*2 :0) : options.marginTop) + borderWidth,
    		marginBottom = (Ext.isEmpty(options.marginBottom) ? (title.text && titleVAlgin == 'bottom' ? title.y + title.margin*2 :0) : options.marginBottom) + borderWidth,
    		width = (options.width || 300) - padding * 2 - marginLeft - marginRight,
    		height = (options.height || 300) - padding * 2 - marginTop - marginBottom,
    		align = convertAlign(options.align || 'center'),
    		vAlign = convertAlign(options.verticalAlign || 'middle'),
    		opt = {},radius,x,y,centerX,centerY,
    		startA = (board.startAngle % 360 + 360) % 360,
    		endA = (board.endAngle % 360 + 360) % 360,
    		endA = endA > startA? endA : endA + 360,
    		max = options.max,
    		min = options.min,
    		dashWidth = board.dashWidth||mathMin(height,width)/4,
    		tickAngleInterval = board.tickAngleInterval,
    		minAngle = board.startOntick? startA : 10,
    		interval = this.normalizeTickInterval(board.tickInterval ? board.tickInterval : (max - min) * tickAngleInterval/(endA - minAngle),board),
			tickCount = Math.ceil((max - min)/interval),
			tickAngleInterval = (endA - minAngle) / tickCount,
			minAngle = angle2Raduis * minAngle,
			maxAngle = angle2Raduis * (max - min) * tickAngleInterval / interval + minAngle,
			tickAngleInterval = angle2Raduis * tickAngleInterval,
//    		rotate = (startA - startA % 90),
//    		start = (startA - rotate) * mathPI /180,
//    		end =  (startB - rotate) * mathPI /180,
    		start = angle2Raduis * startA,
    		end =  angle2Raduis * (endA % 360),
    		sinA = mathSin(start),
    		sinB = mathSin(end),
    		cosA = mathCos(start),
    		cosB = mathCos(end),
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
				o[_x]  = padding + o[_x+'R'] + alignSize(_size,_align);
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
    		root:this.group.wrap,
    		x : 0 + borderWidth,
    		y : 0 + borderWidth,
    		width : this.width - borderWidth*2,
    		height : this.height - borderWidth*2,
    		rx : borderRadius,
    		ry : borderRadius,
    		strokecolor : borderColor,
    		strokewidth : borderWidth,
    		fillcolor : 'transparent'
    	}).createGElement('arc',{
    		root:this.group.wrap,
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
			titleColor = labelStyle.color || options.style.color,
			hideLabel;
		board.dashWidth = dashWidth;
    	for(var i = 0;i <= tickCount;i++){
    		var opt = this.getTickOptions(board,(i == 0 || i == tickCount)? 'marginal' : ''),
    			_length = opt.length,
    			_cosA = mathCos(angle),
    			_sinA = mathSin(angle),
    			_points = [x + radius * _cosA , y - radius * _sinA , x + (radius - _length) * _cosA , y -  (radius - _length) * _sinA];
    		hideLabel = !labels.enabled || (!board.showFirstLabel && i == 0)||(!board.showLastLabel && i == tickCount)
    		alert(angle == start)
    		this.createGElement('line',{
    			root : this.group.wrap,
				points : _points.join(" "),
				strokewidth : (angle == start || angle == end) ? 0 :opt.width,
				strokecolor : opt.color,
				title : hideLabel?'':(label+''),
				titlesize : parseInt(labelStyle.fontSize || options.style.fontSize),
				titlecolor : labelStyle.color || options.style.color,
				titlex : labels.x,
				titley : labels.y,
				titlerotation : 90 - angle / angle2Raduis,
				titlefontfamily : labelStyle.fontFamily || options.style.fontFamily
    		})
    		if(i == tickCount - 1){
    			label = max;
    			angle = maxAngle;
    		}else{
    			label += interval;
    			angle += tickAngleInterval;
    		}
    	}
    	
    	Ext.apply(options.pointer,{
	    	center : [x,y],
	    	start : start,
	    	end : end,
	    	minAngle : minAngle,
	    	maxAngle : maxAngle,
	    	radius : radius - options.pointer.dist
    	});
    },
    getTickOptions : function(options,type){
    	type = type ? type + 'T' :'t';
    	var length = options[type + 'ickLength'];
    	if(/\%/.test(length)){
    		length = parseInt(length)/100 * options.dashWidth
    	}
    	return {
    		length : length,
    		width : options[type + 'ickWidth'],
    		color : options[type + 'ickColor']
    	}
    },
    renderPointer : function(){
    	var v = this.record.get(this.binder.name),
    		max = this.options.max,min = this.options.min;
    	if(/\%/.test(v)){
    		v = (max - min) * parseInt(v)/100 + min;
    	}
    	var	options = this.options.pointer,
    		labels = options.labels,
    		style = this.options.style,
    		labelStyle = labels.style,
    		width = options.width,
    		radius = options.radius,
    		center = options.center,
    		start = options.minAngle,
    		end = options.maxAngle < start ? options.maxAngle + mathPI * 2 : options.maxAngle,
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
    		root : this.group.wrap,
    		d : d.join(' '),
    		x : x,
    		y : y,
    		strokecolor : options.borderColor,
    		strokewidth : options.borderWidth,
    		fillcolor : options.fillColor,
    		fillopacity : options.fillOpacity,
    		title : labels.enabled?v:'',
    		titlesize : parseInt(labelStyle.fontSize || style.fontSize),
			titlecolor : labelStyle.color || style.color,
			titlex : labels.x,
			titley : labels.y,
			titlerotation : 90 - angle / angle2Raduis,
			titlefontfamily : labelStyle.fontFamily || style.fontFamily
    		
    	})
    	this.setTopCmp(this.centerEl.wrap)
    	this.setTopCmp(this.titleEl.wrap)
    },
    renderCenter : function(){
    	var options = this.options.pointer,
    		center = options.center,
    		width = options.width;
    	this.centerEl = this.createGElement('arc',{
    		root:this.group.wrap,
    		x : center[0],
    		y : center[1],
    		r : width,
    		innerR : width - 2,
    		start : options.start,
    		end : options.end,
    		cursor : 'default',
    		strokecolor:options.borderColor,
    		strokewidth:options.borderWidth
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