(function(){
	var mathSin = Math.sin,
		mathCos = Math.cos,
		mathMin = Math.min,
		mathSqrt = Math.sqrt,
		mathPI = Math.PI,
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
		verticalalign : 'middle',
		padding : 10,
		max : 1,
		min : 0,
		board : {
			fillcolor : 'gradient(linear,-50% 0,50% 0,color-stop(0,rgba(0,255,255,1)),color-stop(50%,rgba(255,255,0,1)),color-stop(100%,rgba(255,0,0,1)))',
			fillopacity : 0.5,
			bordercolor : '#000',
			borderwidth : 1,
			startangle : 0,
			endangle : 180,
			labeld : {
				enabled : false,
				x : 0,
				y : 0
			}
		},
		pointer : {
			fillcolor : 'rgba(135,135,135,0.8)',
			fillopacity : 1,
			bordercolor : '#000',
			borderwidth : 1,
			width : 8,
			dist : 10
		},
		title : {
			text : 'Dashboard title',
			align : 'center',
			verticalalign : 'top',
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
			ds[ou]('update',this.renderPointer,this);
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
    setOptions : function(options){
    	this.options = merge(this.options,options);
    },
    onLoad : function(){
    	this.redraw();
    },
    redraw : function(){
    	if(!this.record)return;
    	this.clear();
    	this.group = this.createGElement('group');
    	this.renderBoard();
    	this.renderPointer();
    	this.renderCenter();
    	this.renderTitle();
    },
    setTitle : function(options){
    	merge(this.options.title,options);
    	this.redraw();
    },
    clear : function(){
    	var cmps = this.top.cmps;
    	while(cmps.length){
    		cmps.pop().destroy();
    	}
    },
    renderTitle : function(){
    	var options = this.options.title,
    		text = options.text;
    	if(!text){
    		return;
    	}
    	var	align = convertAlign(options.align),
    		vAlign = convertAlign(options.verticalalign),
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
    		this.createGElement('text',{
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
    		titleVAlgin = title.verticalalign,
    		board = options.board,
    		padding = options.padding,
    		marginLeft = options.marginLeft || 0,
    		marginRight = options.marginRight || 0,
    		marginTop = options.marginTop || (title.text && titleVAlgin == 'top' ? title.y + title.margin*2 :0),
    		marginBottom = options.marginBottom || (title.text && titleVAlgin == 'bottom' ? title.y + title.margin*2 :0),
    		width = (options.width || 300) - padding * 2 - marginLeft - marginRight,
    		height = (options.height || 300) - padding * 2 - marginTop - marginBottom,
    		align = convertAlign(options.align || 'center'),
    		vAlign = convertAlign(options.verticalalign || 'middle'),
    		opt = {},radius,x,y,centerX,centerY,
    		startA = (board.startangle % 360 + 360) % 360,
    		startB = (board.endangle % 360 + 360) % 360,
//    		rotate = (startA - startA % 90),
//    		start = (startA - rotate) * mathPI /180,
//    		end =  (startB - rotate) * mathPI /180,
    		start = startA * mathPI /180,
    		end =  startB * mathPI /180,
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
    	
    	this.createGElement('arc',{
    		root:this.group.wrap,
    		x : x,
    		y : y,
    		r : radius,
    		innerR : radius - (board.dashwidth||mathMin(height,width)/4),
    		start : start,
    		end : end,
    		cursor : 'default',
    		fillcolor:board.fillcolor,
    		fillopacity:board.fillopacity,
    		strokecolor:board.bordercolor,
    		strokewidth:board.borderwidth
    	})
    	
    	Ext.apply(options.pointer,{
	    	center : [x,y],
	    	start : start,
	    	end : end,
	    	radius : radius - options.pointer.dist
    	});
    },
    renderPointer : function(){
    	if(this.pointerEl){
    		var cmps = this.top.cmps;
    		cmps.splice(cmps.indexOf(this.pointerEl),1);
    		this.pointerEl.destroy();
    	}
    	var v = this.record.get(this.binder.name),
    		isPercent = /\%/.test(v),
    		options = this.options.pointer,
    		max = this.options.max,min=this.options.min;
    	if(isPercent){
    		v = parseInt(v)/100;
    		max = 1;min = 0;
    	}else{
    		v = max - v
    	}
    	var	width = options.width,
    		radius = options.radius,
    		center = options.center,
    		start = options.start,
    		end = options.end,
    		angle = (end - start)/(max - min) * v + start,
    		angleL = angle + 135/180 * mathPI,
    		angleR = angle - 135/180 * mathPI,
    		sin = mathSin(angle),
    		cos = mathCos(angle),
    		dist = width * radius * mathSqrt(2) / (2 * radius - width),
    		d = ['M',center[0],center[1],
    			'L',center[0] + dist * mathCos(angleL),center[1] - dist * mathSin(angleL),
    			center[0] + radius * cos,center[1] - radius * sin,
    			center[0] + dist *mathCos(angleR),center[1] - dist * mathSin(angleR),
    			'Z'];
    	this.pointerEl = this.createGElement('path',{
    		root : this.group.wrap,
    		d : d.join(' '),
    		strokecolor : options.bordercolor,
    		strokewidth : options.borderwidth,
    		fillcolor : options.fillcolor,
    		fillopacity : options.fillopacity
    	})
    },
    renderCenter : function(){
    	var options = this.options.pointer,
    		center = options.center,
    		width = options.width;
    	this.createGElement('arc',{
    		root:this.group.wrap,
    		x : center[0],
    		y : center[1],
    		r : width,
    		innerR : width - 2,
    		start : options.start,
    		end : options.end,
    		cursor : 'default',
    		strokecolor:options.bordercolor,
    		strokewidth:options.borderwidth
    	})
    }
})
})();