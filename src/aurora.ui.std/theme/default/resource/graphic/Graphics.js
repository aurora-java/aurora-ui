(function(){
Function.prototype.methodize = function(start) {
	var method = this ,_start = Number(start||0);
	return function() {
		return method.apply(this, new Array(_start).concat(Ext.toArray(arguments))) ;
	};
}

var DOC=document,
	SVG_NS = 'http://www.w3.org/2000/svg',
    VML_NS = 'urn:schemas-microsoft-com:vml',
    NONE = 'none',
    TRANSPARENT = 'transparent',
    PX = 'px',
	hasSVG = !Ext.isIE9 && !!DOC.createElementNS && !!DOC.createElementNS(SVG_NS, "svg").createSVGRect,
	fill = "<v:fill color='{fillColor}' opacity='{fillOpacity}' angle='{angle}' colors='{colors}' type='{type}'></v:fill>",
	stroke = "<v:stroke startarrow='{startArrow}' endarrow='{endArrow}' color='{strokeColor}' joinstyle='miter' weight='{strokeWidth}px' opacity='{strokeOpacity}'></v:stroke>",
    shadow = "<v:shadow on='t' opacity='0.5' offset='5px,5px'></v:shadow>",
    numberReg = /[\d-+.e]+/g,
    mathCos = Math.cos,
    mathSin = Math.sin,
    mathPI = Math.PI,
    pInt = parseInt,
    isEmpty = Ext.isEmpty,
    capitalize = function(w){
    	return (w = w.trim()).replace(/^./,w.charAt(0).toUpperCase());
    },
    newSVG = function(tag,id){
    	var e = DOC.createElementNS(SVG_NS, tag);
    	if(!isEmpty(id)) e.id = id;
    	return Ext.get(e);
    },
    newVML = function(vml,id){
    	var e = DOC.createElement(vml);
    	if(!isEmpty(id)) e.id = id;
    	return Ext.get(e);
    },
    isSVG = function(el){
    	if(hasSVG){
	    	el = el.dom||el;
	    	return el.namespaceURI == SVG_NS;
    	}
    	return false;
    },
    isVML = function(el){
    	if(!hasSVG){
	    	el = el.dom||el;
	    	return !!el.tagUrn && el.tagUrn == VML_NS;
    	}
    	return false;
    },
    encodeStyle = function(prop,value){
    	var tmp={},style,css=[];
        if (!Ext.isObject(prop)) {
            tmp[prop] = value;
            prop = tmp;
        }
        for (style in prop) {
            css.push(style,':',prop[style],';');
        }
        return css.join('');
    },
//	measureText = function(text,fontSize){
//		var textEl = new Ext.Template('<span style="font-size:{fontSize}">{text}</span>').append(DOC.body,{fontSize:fontSize,text:text},true),
//			textWidth = textEl.getWidth();
//		textEl.remove();
//		return textWidth;
//	},
//    convertColor = function(color){
//    	if(color && color.search(/rgb/i)!=-1){
//    		var c ="#";
//    		color.replace(/\d+/g,function(item){
//    			var n = Number(item).toString(16);
//    			c += (n.length == 1?"0":"") +n;
//    		})
//    		return c;
//    	}
//    	return color;
//    },
	
	decodeConfigString = function(str){
		if(!str)return {};
		return Ext.util.JSON.decode('{'+str.replace(/^{|}$/g,'').replace(/[^:,]+:/g,function(item){
			return item.toLowerCase();
		})+'}');
//    	for(var c in config){
//    		var lc = String(c).toLowerCase();
//    	    if(lc !==c){
//	    		config[lc] = config[c];
//	    		delete config[c];
//    		}
//    	}
//    	return config;
	},
    convertConfig = function(record){
    	return decodeConfigString(record.get('config'));
    },
    transform = hasSVG?function(){
    	var dom,values=Ext.toArray(arguments);
    	if(values.length&&Ext.isObject(values[0])){
    		dom = values.shift();
    	}else{
	    	dom = this.el || this.wrap;
    	}
    	dom = dom.dom || dom;
    	var _transform = dom.getAttribute('transform');
    	if(!_transform)_transform = 'translate(0,0) scale(1,1) rotate(0,0 0)';
    	var t = _transform.split('rotate');
    	dom.setAttribute('transform',
    		(t[0].replace(/\(([-.\d]+)\)/g,'($1,$1)')+'rotate'+
    		t[1].replace(/\(([-.\d]+)\)/,'($1,0 0)'))
    			.replace(/[-.\d]+/g,function($0){
    				var v=values.shift();
    				return isEmpty(v)?$0:v
    			}));
    }:function(){
    	var dom,values=Ext.toArray(arguments),options={};
    	if(values.length&&Ext.isObject(values[0])){
    		dom = Ext.get(values.shift());
    	}else{
	    	dom = this.el || this.wrap
    	}
    	if(!isEmpty(values[0])) dom.setStyle('left',values[0] + PX);
    	if(!isEmpty(values[1])) dom.setStyle('top',values[1] + PX);
    	if(!isEmpty(values[2]) && !isEmpty(values[3])){
	    	dom.dom.coordsize.value= 100 / values[2]+',' +  100 / values[3];
    	}
    	if(!isEmpty(values[4])){
    		var xy = dom.getXY(),
    			x = pInt(dom.getStyle('left')||0),
    			y = pInt(dom.getStyle('top')||0),
    			width = dom.getWidth(),
    			height = dom.getHeight(),
    			rotation = values[4],
    			radians = rotation * mathPI / 180, 
				cosA = mathCos(radians),
				sinA = mathSin(radians),
				costheta = mathCos(-radians),
				sintheta = mathSin(-radians),
				costhetb = mathCos(-radians - mathPI/2),
				sinthetb = mathSin(-radians - mathPI/2),
    			dx = dom.dx||x,
    			dy = dom.dy||y,
    			dist = Math.sqrt(dx*dx + dy*dy),
    			angle =  Math.atan(-dy/dx) - radians,
    			x = x -dx + dist * mathCos(angle),
    			y = y -dy - dist * mathSin(angle),
				left,top;
				if(sintheta >= 0){
					if(costheta >= 0){
						left = x;
						top = y - width * sintheta;
					}else{
						left = x + height * costhetb;
						top = y - width * sintheta;
					}
				}else{
					if(costheta >= 0){
						left = x + height * costhetb;
						top = y;
					}else{
						left = x + width * costheta;
						top = y - height * sinthetb;
					}	
				}
    		if(dom.dom.tagName == 'SPAN'){
				dom.setStyle({
					filter: !isEmpty(rotation) ? ['progid:DXImageTransform.Microsoft.Matrix(M11=', cosA,
						', M12=', -sinA, ', M13=100', ', M21=', sinA, ', M22=', cosA,
						', sizingMethod=\'auto expand\')'].join('') : NONE,
					left : left  + PX,
					top : top + PX
				});
    		}else{
	    		dom.setStyle({
	    			rotation:rotation
	    		})
    		}
    	}
    },
    convertPoints = function(points){
    	if(Ext.isString(points)){
	    	var a= points.match(numberReg);
			points = [];
			if(!a)return false;
			for(var i = 0,l = a.length;i < l;i += 2){
				points.push([Number(a[i]),Number(a[i+1])]);
			}
    	}
    	return points;
    },
    setTopCmp = function(){
    	var z = 1,el;
    	return function(cmp){
    		cmp = Ext.get(cmp);
    		if(el!=cmp){
				el = cmp;
				if(isSVG(el))
					el.parent().appendChild(el);
				else
					el.setStyle('z-index',z++);
    		}
		}
    }();

/**
 * @class Aurora.Graphics
 * @extends Aurora.Component
 * 图形基础组件.
 * @author huazhen.wu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Graphics=Ext.extend($A.Component,{
	constructor: function(config) {
		var sf = this;
		sf.root = config.root;
		sf.top = config.top||sf;
		sf.cmps = [];
		$A.Graphics.superclass.constructor.call(sf,config);
		return sf;
	},
	initComponent : function(config){
		var sf = this;
		$A.Graphics.superclass.initComponent.call(sf,config);
		if(hasSVG){
			if(!sf.wrap)sf.initSVGWrap();
			sf.initSVGElement();	
		}else{
			if(!sf.wrap)sf.initVMLWrap();
			sf.initVMLElement();	
		}
//		if(!this.wrap)this['init'+(hasSVG?'SVG':'VML')+'Wrap']();
//		this['init'+(hasSVG?'SVG':'VML')+'Element']();
    },
    initEvents : function(){
    	$A.Graphics.superclass.initEvents.call(this);
    	this.addEvents(
	    	/**
	         * @event click
	         * 单击事件.
	         * @param {Aurora.Graphics} obj 图形对象.
	         * @param {Aurora.DataSet} dataset 数据集对象.
	         * @param {Aurora.Record} record 数据行对象.
	         */
    		'click',
    		'drop',
    		'move',
    		'drawn'
    	)
    },
	processListener: function(ou){
		var sf = this,opt={preventDefault:true};
		$A.Graphics.superclass.processListener.call(sf,ou);
		sf.wrap[ou]('click',sf.onClick,sf,opt)
			[ou]('mouseover',sf.onMouseOver,sf,opt)
			[ou]('mouseout',sf.onMouseOut,sf,opt)
			[ou]('mousedown',sf.onMouseDown,sf);
    },
    processDataSetLiestener:function(ou){
    	var sf = this,ds = sf.dataset;
    	if(ds){
	    	ds[ou]('load', sf.onLoad, sf);
	    	ds[ou]('update', sf.onUpdate, sf);
	    	ds[ou]('add', sf.onAdd, sf);
	    	ds[ou]('remove', sf.onRemove, sf);
	    	ds[ou]('indexchange', sf.onIndexChange, sf);
    	}
    },
    initSVGElement : function(){
    	this.root = newSVG('g').appendTo(newSVG('svg')
    		.setStyle({height:'100%',width:'100%',position:'relative'})//Fixed for FF 11;
    		.appendTo(this.wrap));
    },
    initVMLElement : function(){
    	if (!DOC.namespaces.hcv) {
            DOC.namespaces.add('v', VML_NS);
            DOC.createStyleSheet().cssText = 
                'v\\:shadow,v\\:roundrect,v\\:oval,v\\:image,v\\:polyline,v\\:line,v\\:group,v\\:fill,v\\:path,v\\:shape,v\\:stroke'+
                '{ behavior:url(#default#VML); display: inline-block; } ';
        }
        this.root = newVML('v:group')
        	.setStyle({
        		position:'absolute',
        		width:100+PX,
        		height:100+PX
        	}).set({coordsize:'100,100'})
        	.appendTo(this.wrap);
//        this.root = this.wrap;
    },
    initProxy : function(){
		var sf = this,wrap = sf.wrap,
			clone = wrap.dom.cloneNode(!!hasSVG);
		clone.id = sf.id + '_proxy';
    	if(!hasSVG){
    		new Ext.Template(wrap.dom.innerHTML
    			.replace(/^<\?xml[^\/]*\/>/i,'')
    			.replace(/id\=([\S]*)/img,'id=$1_proxy')
    		).append(clone,{});
    	}
    	sf.proxy = Ext.getBody().insertFirst(Ext.fly(clone).setStyle({'background-color':TRANSPARENT,'border':NONE,'position':'absolute','z-index':'99999'}));
    },
    onMouseDown : function(e,t){
    	var sf = this;
    	sf.fire('mousedown',e,t);
    	if(sf.candrawline){
			sf.startLine(e,t);
    	}else {
    		var ds = sf.dataset;
    		if(ds){
	    		var el = sf.getGElement(t);
	    		if(el && el.record){
	    			ds.locate(ds.getAll().indexOf(el.record)+1);
	    		}
    		}else{
    			sf.focus(t);
    		}
    		if(sf.dropto||sf.moveable){
				sf.sw = $A.getViewportWidth();
		        sf.sh = $A.getViewportHeight();
		        sf.beforeMove(e);
	    	}
    	}
    },
    beforeMove : function(e){
    	var sf = this,wrap = sf.wrap,dropto = sf.dropto,xy = wrap.getXY();
    	if(isSVG(wrap)){
    		var _xy = sf.top.wrap.getXY();
    		xy[0] = sf.x + _xy[0];
    		xy[1] = sf.y + _xy[1];
    	}
    	sf.relativeX=xy[0]-e.getPageX();
		sf.relativeY=xy[1]-e.getPageY();
    	if(dropto){
	    	if(!sf.dropEl)
	    		sf.dropEl = $(dropto);
	    	if(!sf.proxy)
	    		sf.initProxy();
	    	sf.proxy.moveTo(xy[0],xy[1]);
    	}else{
    		sf.proxy = wrap;
    	}
    	if(sf.moveable)setTopCmp(sf.proxy);
    	Ext.fly(DOC).on('mousemove',sf.onMouseMove,sf)
    		.on('mouseup',sf.onMouseUp,sf);
    },
    onMouseMove : function(e){
    	e.stopEvent();
    	var sf = this,
    		tx = e.getPageX()+sf.relativeX,
    		ty = e.getPageY()+sf.relativeY,
    		w = sf.width||sf.rx*2,
    		h = sf.height||sf.ry*2,
    		scroll = Ext.fly(document).getScroll(),
    		sl = scroll.left,
			st = scroll.top,
    		sw = sl + sf.sw,
    		sh = st + sf.sh;
    	if(tx < 0) tx = 0;
    	else if((tx+w) >= sw) tx = Math.max(sw - w,0);
    	if(ty < 0) ty = 0;
    	else if((ty+h) >= sh) ty = Math.max(sh - h,0);
    	if(sf.moveable)sf.fireEvent('move',sf,sf.dataset,null,tx,ty);
    	sf.proxy.moveTo(tx,ty);
    },
    onMouseUp : function(e,t){
    	var sf = this;
    	sf.fire('mouseup',e,t);
    	Ext.fly(DOC).un('mousemove',sf.onMouseMove,sf)
    		.un('mouseup',sf.onMouseUp,sf);
    	if(sf.dropto){
    		var wrap = sf.dropEl.wrap,
    			xy = wrap.getXY(),
    			l = xy[0],
    			t = xy[1],
    			r = l + wrap.getWidth(),
    			b = t + wrap.getHeight(),
    			ex = e.getPageX(),
    			ey = e.getPageY();
    		if(ex >= xy[0] && ey >= xy[1] && ex <= r && ey <= b){
				sf.dropEl.fireEvent('drop',sf.proxy,sf.top.dataset,ex+sf.relativeX-l+(hasSVG?4:0),ey+sf.relativeY-t+(hasSVG?4:0));
    		}
	    	sf.proxy.moveTo(-1000,-1000);
    	}
    },
    onMouseOver : function(e,t){
    	this.fire('mouseover',e,t);
    },
    onMouseOut : function(e,t){
    	this.fire('mouseout',e,t);
    },
    onClick : function(e,t){
    	this.fire('click',e,t);
    },
    getGElement : function(t){
    	var a = t.id.match(/(.*)_(\d+)(_.*)*$/);
    	if(a){
    		var id = a[2];
	    	if(id){
	    		var ds = this.top.dataset,record;
		    	if(ds)
		    		record = ds.findById(id)
		    	if(a[1]){
		    		id = a[1]+'_'+id;
//		    		var i,id2;
//		    		if(a[3] && (i = a[3].indexOf('_el'))!=-1){
//		    			id2 = id+a[3].substring(0,i);
//		    		}
		    		t = $(id);
		    	}
		    	return {el:t,record:record}
	    	}
    	}
    },
    fire : function(name,e,t){
    	if(!t) return;
    	var el = this.getGElement(t);
    	if(el){
    		this.fireEvent(name,e,el.el,this.dataset,el.record);
    		return el.el;
    	}
    	this.fireEvent(name,e,t);
    },
    create : function(g){
    	var sf = this,type = g.get('type'),config = convertConfig(g),
    		renderer = sf.renderer;
		config.id = sf.id + '_' + g.id;
		//config.dataset = sf.dataset;
		if(renderer){
    		var fder = $A.getRenderer(renderer);
	        if(fder == null){
	            alert("未找到"+renderer+"方法!")
	            return;
	        }
	        var v = fder.call(window,g,type,config);
	        if(!isEmpty(v)){
		        if(Ext.isObject(v)){
		        	v = Ext.util.JSON.encode(v);
		        }
		        Ext.apply(config,decodeConfigString(v));
	        }
		}
		sf.createGElement(config.type||type,config);
    },
//    resizeSVG : function(){
//    	if(hasSVG){
//	    	var _xy = this.top.wrap.getXY(),
//	    		g = this.root.dom,
//				box = g.getBoundingClientRect(),
//				scroll = Ext.fly(document).getScroll(),
//				width = box.left - _xy[0] + box.width + scroll.left,
//				height = box.top - _xy[1] + box.height + scroll.top;
//			Ext.fly(g.ownerSVGElement).set({'width':width,'height':height});
//    	}
//    },
    moveTo :function(x,y){
    	var sf = this,wrap = sf.wrap,parent = sf.parent;
    	Ext.apply(sf.initConfig,{x:(sf.x=x),y:(sf.y=y)});
    	if(isSVG(wrap)){
    		if(sf.strokewidth % 2 ==1 && sf.shadow){
				x += .5;
				y += .5;
			}
			if(parent){
				x-=parent.x;
				y-=parent.y;
			}
    		transform(wrap,x,y);
    	}else{
    		var xy = this.top.wrap.getXY();
    		wrap.moveTo(xy[0]+x,xy[1]+y);
    	}
    },
    syncFocusMask : function(t){
    	var focusMask = this.focusMask;
    	if(!t.moveable)return focusMask;
    	var delta = t.strokewidth/2 + 3,
    		xd = delta,yd = delta,
    		w = t.width,
    		h = t.height;
//    	if(t.type == 'diamond'){
//    		var r = Math.atan(h/w);
//    		xd = Math.round(delta/ Math.sin(r)*10)/10;
//    		yd = Math.round(delta/ Math.cos(r)*10)/10;
//    	}
		return focusMask.setStyle({'left':t.x-xd+PX,top:t.y-yd+PX}).setWidth(w+xd*2).setHeight(h+yd*2).set({title:t.info||''});
    },
    focus : function(t){
    	var sf = this;
    	t = sf.fire('focus',null,t);
    	if(t){
			if(sf.focusItem)sf.blur();
			if(sf.editable){
				if(t.editable){
					t.showEditors()
				}
				if(t.moveable){
					if(!sf.focusMask){
						sf.focusMask = new Ext.Template('<div style="-moz-user-select:none;-webkit-user-select:none;background:none;position:absolute;border:1px dashed #000;"></div>').insertFirst(sf.wrap.dom,{},true);
					}
					sf.syncFocusMask(t).show()//.on('mousedown',t.onMouseDown,t);	
				}
			}
			sf.focusItem = t;
    	}else{
    		sf.fireEvent('focus')
    	}
    },
    blur : function(){
    	var sf = this,t = sf.focusItem,focusMask = sf.focusMask;
    	if(t){
    		if(t.editable){
				t.hideEditors()
    		}
			if(t.moveable){
				if(focusMask){
					focusMask.hide()//.un('mousedown',t.onMouseDown,t);	
				}
			}
			sf.fire('blur',null,t);
			sf.focusItem = null;
    	}
    },
    startLine : function(e,t){
    	var sf = this,
    		el = sf.getGElement(t),
    		_xy = sf.wrap.getXY(),
    		x = e.getPageX()- _xy[0],
    		y = e.getPageY()- _xy[1],
    		c;
    	if(el){
    		c = el.el.findConnect(e);
			if(c){
				x = c.x + c.width/2;
				y = c.y + c.height/2;
				sf.startEl = el;
			}
    	}
		sf.drawLinePoints = [x,y];
		Ext.fly(DOC).on('mousemove',sf.drawLine,sf)
			.on('mouseup',sf.endLine,sf);
    },
    drawLine : function(e,t){
    	var sf = this,_xy = sf.wrap.getXY(),
    		x1 = sf.drawLinePoints[0], y1 = sf.drawLinePoints[1],
    		g = sf.getGElement(t),
    		start_el = sf.startEl,
    		x2,y2,r,el,record,
    		points,c,start_table_id,end_table_id;
    	if(g && (r = g.record)!= sf.newline && (el = g.el)!=(start_el && start_el.el)){
    		el.showConnects();
    		c = el.findConnect(e);
    	}
    	if(c){
			end_table_id = r.get(sf.tableidfield)|| r.get('table_id');
    		x2 = c.x + c.width/2;
    		y2 = c.y + c.height/2;
    	}else{
    		x2 = e.getPageX() - _xy[0],y2 = e.getPageY() - _xy[1];
//    		var dx = x2 - x1,dy = y2 - y1,d = 10;
//			if(dx == 0){
//				y2 += dy>0?-d:d;
//			}else if(dy == 0){
//				x2 += dx>0?-d:d;
//			}else{
//				var ll = Math.sqrt(dx*dx+dy*dy);
//				x2 = (ll-d)/ll*dx+x1;
//				y2 = (ll-d)/ll*dy+y1;
//			}
    	}
    	x2 = Math.round(x2);
    	y2 = Math.round(y2);
    	if(!sf.newline){
			points = [[x1 , y1],[x2 , y2]].join(' ');
    		if(start_el){
    			start_table_id = (r = start_el.record).get(sf.tableidfield)|| r.get('table_id');
    		}
    		sf.newline = sf.dataset.create({
    			'type':'zLine',
    			'config':'strokewidth:1,strokecolor:"#aaaaaa",strokeopacity:"1",titlecolor:"black",titlesize:14,titlex:0,titley:0,endarrow:"classic",points:"'+
    			points+'",editable:true,connectable:false'+
    			(isEmpty(start_table_id)?'':(',from:'+start_table_id))+
    			(isEmpty(end_table_id)?'':(',to:'+end_table_id))});
    		var eds = $(sf.id+'_'+sf.newline.id).editors;
    		(function(){
    			eds[eds.length-1].wrap.hide();
    		}).defer(Ext.isIE9?1:0);
    	}else{
    		var config = convertConfig(sf.newline);
    		points = convertPoints(config.points);
    		points.pop();
    		points.push([x2 , y2]);
    		config.points = points.join(' ');
    		if(!end_table_id){
    			delete config.to;
    		}else{
    			config.to = end_table_id;
    		}
    		sf.newline.set('config',Ext.util.JSON.encode(config));
    	}
    },
    endLine : function(e,t){
    	var sf = this;
    	Ext.fly(DOC).un('mousemove',sf.drawLine,sf)
			.un('mouseup',sf.endLine,sf);
    	if(sf.newline){
    		sf.focus($(sf.id+'_'+sf.newline.id));
    		sf.fireEvent('drawn');
    	}
    	delete sf.drawLinePoints;
    	delete sf.newline;
    	delete sf.startEl;
    },
    bind : function(ds,name){
    	var sf = this;
    	sf.dataset = $(ds);
    	sf.tableidfield = name||'table_id';
    	sf.processDataSetLiestener('on');
    	sf.onLoad();
    },
    onLoad : function(){
    	var sf = this;
    	(function(callback){
    		hasSVG?callback():$A.onReady(callback);
    	})(function(){
	    	sf.clear();
	    	Ext.each(sf.dataset.getAll().sort(function(a,b){
	    		var at=a.get('type'),bt=b.get('type');
	    		if(at == bt)return 0;
	    		else if(at === 'line'||at === 'zLine')return 1;
	    		else return -1;
	    	}),function(r){
	    		if(!r.get('type')){
	    			r.data['type'] = 'rect';
	    			r.isNew = true;
	    		}
	    		sf.create(r);
	    	});
    	})
    },
    onAdd : function(ds,record,index){
    	this.create(record);
    },
    onRemove : function(ds,record,index){
    	var el = $(this.id+'_'+record.id);
    	if(this.focusItem == el)this.focusItem = null;
    	el.destroy();
    },
    onIndexChange : function(ds,record){
    	this.focus($(this.id + '_' +record.id));
    },
    onUpdate : function(ds,record, name, value,ov){
		var sf = this,el = $(sf.id+'_'+record.id),
    		config = convertConfig(record),
    		type = record.get('type');
    		config.type = type;
    	if(el.changeConfig(config,record) == false){
    		record.set(name,ov);
    	}
    },
	createGElement : function(name,config){
		var el = new pub[capitalize(name)](Ext.apply(config||{},{type:name,root:(config && Ext.get(config.root))||this.root,top:this.top}));
    	//this.resizeSVG();
		this.top.cmps.push(el);
    	return el;
    },
    createElement : function(name){
    	return this.root.appendChild(hasSVG?newSVG(name):newVML(name));
    },
    clear : function(){
    	var cmps = this.cmps;
    	while(cmps.length){
    		cmps.pop().destroy();
    	}
		this.focusItem = null;
    },
    destroy : function(){
    	var sf = this;
    	sf.wrap.remove();
    	if(sf.proxy && sf.proxy!=sf.wrap)sf.proxy.remove();
    	$A.Graphics.superclass.destroy.call(sf);
    	sf.processDataSetLiestener('un');
    },
    translate : transform.methodize(),
    scale : transform.methodize(2),
    rotate : transform.methodize(4),
    setTopCmp : setTopCmp,
    hasSVG : hasSVG
});
var pub =function(){
	var gradientIndex = 0,
		Color = function (input) {
		if(Ext.isObject(input))return input;
		var rgba = [], result , isGradient = false,type,linear,stops;
		function init(input) {
			if(!input){
				rgba = [0,0,0,1];
			}else if(input == TRANSPARENT){
				rgba = [0,0,0,0];
			}else if(input == NONE){
				rgba = NONE;
			}else{
				//gradirent
				if(/gradient/i.test(input)){
					isGradient = true;
					var argString = /^gradient\((.*)\)$/.exec(input)[1],
						beforeStop = /^([^stop]*),[^,]*stop/.exec(argString)[1];
					type = /^[^,]*/.exec(beforeStop)[0];
					linear = beforeStop.match(/[-\d%]+/g);
					stops = function(arg){
						var arr = [];
						Ext.each(arg,function(item){
							var stop = /\(([^\)]*\))\)$/.exec(item)[1],
								reg = /^([^,]*),(.*)$/.exec(stop);
							arr.push([reg[1],reg[2]]);
						})
						return arr;
					}(argString.match(/stop\([^\)]*\)\)/mg));
				}else{
					// rgba
					result = /rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]?(?:\.[0-9]+)?)\s*\)/.exec(input);
					if (result) {
						rgba = [pInt(result[1]), pInt(result[2]), pInt(result[3]), parseFloat(result[4], 10)];
					} else { // hex
						result = /^#([a-fA-F0-9]{1,2})([a-fA-F0-9]{1,2})([a-fA-F0-9]{1,2})$/.exec(input);
						if (result) {
							rgba = [pInt(plus(result[1]), 16), pInt(plus(result[2]), 16), pInt(plus(result[3]), 16), 1];
						}
					}
				}
			}
		}
		function plus(v){
			return v.length == 1? v+v:v;
		}
		function get(format) {
			var ret = 1;
			if(isGradient){
				if(format === 'gradient'){
					ret = {
						isGradient : isGradient,
						type : type,
						linear : linear,
						stops : stops
					}
				}else{
					ret = '';
				}
			}else if(format === 'a'){
				if(!isNaN(rgba[3])){
					ret = rgba[3];
				}
			}else if (rgba && !isNaN(rgba[0])) {
				if(format === 'hex'){
					ret = '#'+ plus(Number(rgba[0]).toString(16))+plus(Number(rgba[1]).toString(16))+plus(Number(rgba[2]).toString(16));
				}else if (format === 'rgb') {
					ret = 'rgb(' + rgba[0] + ',' + rgba[1] + ',' + rgba[2] + ')';
				}else {
					ret = 'rgba(' + rgba.join(',') + ')';
				}
			}else if(rgba == NONE){
				ret = rgba;
			}else {
				ret = input;
			}
			return ret;
		}
		function brighten(alpha) {
			if (rgba != NONE && isNumber(alpha) && alpha !== 0) {
				var i;
				for (i = 0; i < 3; i++) {
					rgba[i] += pInt(alpha * 255);
	
					if (rgba[i] < 0) {
						rgba[i] = 0;
					}
					if (rgba[i] > 255) {
						rgba[i] = 255;
					}
				}
			}
			return this;
		}
		
		function setOpacity(alpha) {
			if(input == TRANSPARENT || rgba == NONE || isEmpty(alpha))return this;
			rgba[3] = alpha;
			return this;
		}
	
		init(input);
	
		return {
			get: get,
			brighten: brighten,
			setOpacity: setOpacity
		};
	},
	convertArrow = function(strokewidth,x1,y1,x2,y2){
    	var dx = x1 - x2,dy = y1 - y2,d = strokewidth*3/2;
    	if(dx == 0){
			y1 += dy>0?-d:d;
		}else if(dy == 0){
			x1 += dx>0?-d:d;
		}else{
			var ll = Math.sqrt(dx*dx+dy*dy);
			x1 = (ll-d)/ll*dx+x2;
			y1 = (ll-d)/ll*dy+y2;
		}
		return {x:x1,y:y1};
    },
    convertPath = function(){
    	var cache = {};
    	return function(p,zoom){
    		p = p||this.d;
	    	if(cache[p])return cache[p];
	    	zoom = zoom ||this.zoom|| 10000;
	    	var arr=p.match(/\w|[\s\d-+.,e]*/g),p1=[0,0],p2=[0,0],path=[],
	    	f1=function(s,isC){
	    		var arr=Ext.isArray(s)?s:s.match(numberReg);
	    		for(var i=0,l = arr.length;i<l;i++){
	    			var _p1 = p2[0]+f4(arr[i]),_p2 = p2[1]+f4(arr[++i]);
	    			if(!isC||i/2%3==2){
	    				p2[0]=_p1;
	    				p2[1]=_p2;
	    			}
    				path=path.concat([_p1,_p2]);
	    		}
	    	},
	    	f2=function(s,re){
	    		var arr=s.match(numberReg);
	    		while(arr.length&&arr.length%7==0){
		    		var	rx=f4(arr.shift()),//圆心x
		    			ry=f4(arr.shift()),//圆心y
		    			rr=Number(arr.shift()),//
		    			la=Number(arr.shift()),//是否是大角度弧线
		    			sw=Number(arr.shift()),//是否是顺时针
		    			x=f4(arr.shift()),//end x
		    			y=f4(arr.shift()),//end y
		    			l,t,r,b;
		    		if(re){
		    			x+=p2[0];
		    			y+=p2[1];
		    		}
		    		var dx=Math.abs(x-p2[0]),dy=Math.abs(y-p2[1]);
		    		rx=dx;ry=dy;
		    		path.push(sw?'wa':'at');
		    		if((sw^la)^x<p2[0]){
						if(y<p2[1]){
							l=p2[0];
							t=p2[1]-ry;
						}else{
							l=p2[0]-rx;
							t=p2[1];
						}
		    		}else{
		    			if(y<p2[1]){
							l=p2[0]-rx;
							t=p2[1]-(ry<<1);
						}else{
							l=p2[0]-(rx<<1);
							t=p2[1]-ry;
						}
		    		}
		    		r=l+(rx<<1);
					b=t+(ry<<1);
		    		path.push(l,t,r,b,p2[0],p2[1],x,y);
		    		p2=[x,y];
	    		}
	    	},
	    	f3=function(s){
	    		var a=s.match(numberReg).slice(-2);
	    		return [f4(a[0]),f4(a[1])];
	    	},
	    	f4=function(n){
	    		return Number(Number(n*zoom).toFixed(0));
	    	},
	    	f5=function(s){
	    		for(var i=0,a=s.match(numberReg),l=a.length;i<l;i++){
	    			path.push(f4(a[i]))
	    		}
	    	}
	    	for(var i=0;i<arr.length;i++){
	    		switch(arr[i]){
	    			case 'M': p1=f3(arr[i+1]);
	    			case 'C':
	    			case 'L': p2=f3(arr[i+1]);path.push(arr[i]);f5(arr[++i]);break;
	    			case 'm': path.push('M');f1(arr[++i]);p1=[].concat(p2);break;
	    			case 'c': path.push('C');f1(arr[++i],true);break;
	    			case 'l': path.push('L');f1(arr[++i]);break;
	    			case 'h': path.push('L');f1(arr[++i]+" 0");break;
	    			case 'v': path.push('L');f1("0 "+arr[++i]);break;
	    			case 'H': path.push('L');p2[0]=f4(arr[++i]);path.push(p2[0],p2[1]);break;
	    			case 'V': path.push('L');p2[1]=f4(arr[++i]);path.push(p2[0],p2[1]);break;
	    			case 'A': f2(arr[++i]);break;
	    			case 'a': f2(arr[++i],true);break;
	    			case 'Z': 
	    			case 'z': path.push('X');p2=[].concat(p1);break;
	    		}
	    	}
	    	path.push('E');
	    	cache[p] = path.join(' ');
	    	return cache[p];
	    }
	}();
	return {
		Path:Ext.extend($A.Graphics,{
			zoom:10000,
			constructor: function(config) {
				var sf = this;
				sf.lineEditors = [];
				sf.editors = [];
				return pub.Path.superclass.constructor.call(sf,config);
			}, 
			initComponent : function(config){
				config.fillcolor = Color(config.fillcolor).setOpacity(config.fillopacity);
				config.fillopacity = config.fillcolor.get('a');
				config.strokecolor = Color(config.strokecolor).setOpacity(config.strokeopacity);
				config.strokeopacity = config.strokecolor.get('a');
				pub.Path.superclass.initComponent.call(this,config);
				var sf = this,title = sf.title;
				if(hasSVG){
					if(title)sf.initSVGTitle();
					sf.initSVGInfo();
					if(sf.shadow)sf.initSVGShadow();
				}else{
					if(title)sf.initVMLTitle();
					sf.initVMLInfo();
				}
	//			if(this.title)this['init'+(hasSVG?'SVG':'VML')+'Title']();
	//			this['init'+(hasSVG?'SVG':'VML')+'Info']();
	//			if(hasSVG && this.shadow)this.initSVGShadow();
	//			var xy = this.top.wrap.getXY();
		    },
//		    processListener: function(ou){
//				var sf = this;
//				pub.Path.superclass.processListener.call(sf,ou);
//				sf.wrap[ou]('mousemove',sf.onWrapMove,sf);
//		    },
			initSVGWrap : function(){
				this.wrap = this.root.appendChild(newSVG('g',this.id));
			},
	    	initVMLWrap : function(){
		    	this.wrap = this.root.appendChild(newVML('v:group',this.id));
		    },
			initSVGElement : function(){
				var sf = this,
					parent = sf.parent,
					wrap = sf.wrap,
					d = sf.d,
					config = {d:d,fill:sf.createGradient(sf.fillcolor.get('gradient'))},
					fillcolor = sf.fillcolor.get(),
					strokecolor = sf.strokecolor.get('hex'),
					strokewidth = sf.strokewidth,
					strokeopacity = sf.strokeopacity,
					startarrow = sf.startarrow,
					endarrow = sf.endarrow,
					style = (sf.el = newSVG("path",sf.id+'_el')).dom.style,
					x = sf.x,y = sf.y;
				if(x||y) {
					if(strokewidth && strokewidth % 2 == 1 && !sf.shadow){
						x+=.5;y+=.5;	
					}
					if(parent){
						x-=parent.x;
						y-=parent.y;
					}
					transform(wrap,x,y);
				}
		    	style.cssText=encodeStyle({
		    		fill:fillcolor,
		    		'fill-opacity':sf.fillopacity,
		    		stroke:strokecolor,
		    		'stroke-width':strokewidth,
		    		'stroke-opacity':strokewidth?strokeopacity:0,
		    		cursor:sf.cursor || 'pointer'
		    	})+sf.style;
		    	if(strokewidth){
			    	if(!style.stroke){
			    		strokecolor = style.stroke = "#000";
			    		strokeopacity = style.strokeOpacity = 0;
			    	}
			    	if(startarrow || endarrow){
			    		var a = d.match(numberReg),l = a.length,
			    			id = '-' + strokecolor + '-' + strokeopacity * 100;
	//		    		if(Ext.isIE9) id += '-' + strokewidth;
				    	if(startarrow){
				    		config['marker-start'] = 'url(#start-arrow-' + startarrow + id + ')';
				    		var point = convertArrow(strokewidth,Number(a[0]),Number(a[1]),Number(a[2]),Number(a[3]));
				    		a[0] = point.x;a[1] = point.y;
				    		config.d = config.d.replace(/[\d-+.]+\s+[\d-+.]+/,point.x+' '+point.y);
				    	}
				    	if(endarrow){
				    		config['marker-end'] = 'url(#end-arrow-' + endarrow + id + ')';
				    		var point = convertArrow(strokewidth,Number(a[l-2]),Number(a[l-1]),Number(a[l-4]),Number(a[l-3]));
				    		config.d = config.d.replace(/([\d-+.]+\s+[\d-+.]+)[^\d]*$/,point.x+' '+point.y);
				    	}
			    		new pub.Arrow({color:strokecolor,width:strokewidth,opacity:strokeopacity,endarrow:endarrow,startarrow:startarrow,root:sf.root})
			    	}
		    	}
		    	wrap.insertFirst(sf.el.set(config));
		    },
		    initVMLElement : function(){
		    	var sf = this,
		    		fillcolor = sf.fillcolor.get('rgb'),
		    		strokecolor = sf.strokecolor.get('rgb'),
		    		stroke=true,fill=true,filled=true,
		    		zoom = sf.zoom,parent = sf.parent,x = sf.x,y = sf.y;
	    		if(parent){
					x-=parent.x;
					y-=parent.y;
				}
		    	if(isEmpty(sf.strokewidth))sf.strokewidth=1;
		    	if(strokecolor==NONE||sf.strokeopacity==0||sf.strokewidth==0)stroke=false;
		    	if(fillcolor==NONE)fill=false;
		    	sf.wrap.setStyle({
		    		position:'absolute',
		    		width:100+PX,
		    		height:100+PX,
		    		left:(x||0)+PX,
		    		top:(y||0)+PX
		    	}).set({
		    		coordsize:'100,100',
		    		title:sf.info||''
		    	});
		    	sf.el=new Ext.Template(sf.getVmlTpl(stroke,fill,sf.shadow)).insertFirst(sf.wrap.dom,Ext.apply({
		    		id:sf.id+'_el',
		    		style:sf.style,
		    		path:sf.path || convertPath.call(sf),
		    		zoom:zoom,
		    		fillColor:fillcolor,
		    		fillOpacity:sf.fillopacity,
		    		strokeColor:strokecolor,
		    		strokeWidth:sf.strokewidth,
		    		strokeOpacity:sf.strokeopacity,
		    		endArrow:sf.endarrow,
		    		startArrow:sf.startarrow,
		    		cursor:sf.cursor||'pointer'
		    	},sf.createGradient(sf.fillcolor.get('gradient'))),true);
		    },
		    createGradient : hasSVG?function(options){
		    	if(!options.isGradient)return NONE;
		    	var id = 'graphics-gradient' + gradientIndex++,
					linear = options.linear,
					root = this.root,
					gradient = (root.child('defs')||root.insertFirst(newSVG('defs')))
						.appendChild(newSVG(options.type+capitalize('gradient'),id)
						.set({
							x1:linear[0],
							y1:linear[1],
							x2:linear[2],
							y2:linear[3],
							gradientUnits:'userSpaceOnUse'
						}));
					Ext.each(options.stops,function(item){
						var color = Color(item[1]);
						gradient.appendChild(newSVG('stop').set({
							offset:item[0],
							'stop-color':color.get('rgb'),
							'stop-opacity':color.get('a')
						}));
					});
				return 'url('+location.href+'#'+id+')';
		    }:function(options){
		    	if(!options.isGradient)return {};
		    	var type = options.type == 'linear'?'gradient':'',
		    		linear = options.linear,
					top = this.top,
					width = top.width,
					height = top.height,
					colors=[];
					Ext.each(linear,function(item,index){
						if(/\%/.test(item)){
							item = pInt(item)/100;
							linear[index] = (index % 2 == 0 ?width : height) * item;
						}
					});
					Ext.each(options.stops,function(item){
						colors.push(item[0],' ',Color(item[1]).get('rgb'),';');
					});
					return {
						type : type,
						angle : Math.atan((linear[2] - linear[0]) / (linear[3] - linear[1])) / (mathPI / 180) + 180,
						colors : colors.join(''),
						fillOpacity : 1
					}
		    },
		    initSVGShadow : function(){
	    		var fid = 'graphics-filter-shadow'
	    		if(!Ext.get(fid)){
	    			var root = this.root,
	    				filter = (root.child('defs')||root.insertFirst(newSVG('defs')))
	    					.appendChild(newSVG('filter',fid)
							.set({
								x:-.25,
								y:-.25,
								width:1.5,
								height:1.5,
								'color-interpolation-filters':'sRGB'
							}));
	    			filter.appendChild(newSVG('feGaussianBlur')
						.set({
							result:'blur',
							stdDeviation:1,
							'in':'SourceAlpha'
						}));
	    			filter.appendChild(newSVG('feColorMatrix')
						.set({
							values:'1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.6 0 ',
							type:'matrix',
							result:'bluralpha'
						}));
	    			filter.appendChild(newSVG('feOffset')
						.set({
							result:'offsetBlur',
							dx:5,
							dy:5,
							'in':'bluralpha'
						}));
	    			var feMerge = filter.appendChild(newSVG('feMerge'));
	    			feMerge.appendChild(newSVG('feMergeNode')
	    				.set({'in':'offsetBlur'}));
	    			feMerge.appendChild(newSVG('feMergeNode')
						.set({'in':'SourceGraphic'}));
	    		}
	    		this.el.setStyle({'filter':'url(#'+fid+')'});
		    },
		    initSVGTitle : function(){
		    	var sf = this;
		    	sf.text = pub.Text.prototype.initSVGElement.call({
		    		text:sf.title,
		    		id:sf.id+'_title',
		    		size:sf.titlesize||14,
		    		dx:sf.titlex||0,
		    		dy:sf.titley||0,
		    		color:sf.titlecolor,
		    		fontfamily:sf.titlefontfamily,
		    		rotation:sf.titlerotation,
		    		wrap:sf.wrap,
		    		style:'cursor:pointer;-webkit-user-select:none'
		    	});
		    },
		    initVMLTitle : function(){
	    		var sf = this,
	    			x = sf.titlex||0,
					y = sf.titley||0,
					size = sf.titlesize||14,
					root = sf.wrap;
				if(sf.type == 'line' || sf.type == 'path'){
					x += sf.x;
					y += sf.y;
					root = sf.top.wrap;
				}else{
					var strokewidth = sf.strokewidth;
					x += strokewidth/2;
					y += strokewidth/2;
				}
				sf.text = pub.Text.prototype.initVMLElement.call({
					text:sf.title,
					id:sf.id+'_title',
					size:size,
					dx:x,
					dy:y,
					color:sf.titlecolor,
					fontfamily:sf.titlefontfamily,
					rotation:sf.titlerotation,
					wrap:root,
					positionwrap:sf,
					vmlTpl:pub.Text.prototype.vmlTpl
				});
	    	},
	    	initSVGInfo : function(){
	    		var sf = this,info = sf.info;
	    		if(info){
		    		if(!sf.infoEl){
			    		sf.wrap.appendChild(sf.infoEl = newSVG('title'))
		    		}
			    	sf.infoEl.dom.textContent = info;
		    	}else if(sf.infoEl){
	    			sf.infoEl.remove();
	    			sf.infoEl = null;
	    		}
	    	},
	    	initVMLInfo : function(){
	    		this.wrap.set({'title':this.info||''});
	    	},
		    createEditors : function(){
		    	var sf = this,top = sf.top;
		    	if(top.editable){
    				var points = [].concat(sf.points);
		    		switch(sf.type){
		    			case 'line':
							Ext.each(points,function(point){
								sf.createEditor(point);
							});
							break;
		    			case 'zLine':
		    				var fromPoint = points.shift(),
		    					toPoint = points.pop();
		    				sf.createEditor(fromPoint);
		    				sf.createEditor(toPoint);
		    				for(var i =0,len = points.length;i<len;i++){
		    					var p2 = points[i+1];
		    					if(p2){
									sf.createEditor(points[i],p2);		    						
		    					}
		    				}
		    		}
					sf.bindEditor(sf.from,true);
					sf.bindEditor(sf.to);
				}
		    },
		    bindEditor : function(id,isFrom){
		    	if(!isEmpty(id)){
			    	var eds = this.editors,
			    		top = this.top;
						tr = top.dataset.find(top.tableidfield,id);
					if(tr){
						var el = $(top.id+'_'+tr.id);
						if(el){
							var ed = eds[isFrom?0:eds.length-1],
								c = el.findNearlyConnect([ed.x,ed.y]);
							ed.bindEl = c;
			    			c.lineEditors.push(ed);
			    			ed.addConfig({
			    				fillcolor : 'rgb(255,0,0)',
			    				fillopacity : '0.9'
			    			})
		    			}
					}
				}
		    },
		    clearBindEditor :function(){
		    	Ext.each(this.editors,function(ed){
		    		var bindEl = ed.bindEl;
		    		if(bindEl){
			    		var les = bindEl.lineEditors;
			    		les.splice(les.indexOf(ed),1);
			    		delete ed.bindEl;
			    		ed.addConfig({
		    				fillcolor : 'rgb(0,0,0)',
		    				fillopacity : '0'
		    			});
		    		}
		    	});
		    },
		    syncLineEditors : function(x,y){
		    	Ext.each(this.lineEditors,function(ed){
					ed.moveTo(x,y);
					ed.fireEvent('move');
		    	});
		    },
		    syncEditors : function(){
		    	var sf = this;
		    	if(sf.editors.length && sf.points){
		    		var i = 0,eds = sf.editors,p = [].concat(sf.points);
		    		sf.clearBindEditor();
		    		if(sf.type=='zLine'){
		    			var ed = eds[0],
			    			w = ed.width/2,
			    			h = ed.height/2,
			    			fromPoint = p.shift(),
			    			toPoint = p.pop(),
			    			zEds = sf.zEditors;
		    			ed.moveTo(fromPoint[0]-w,fromPoint[1]-h);
		    			eds[1].moveTo(toPoint[0]-w,toPoint[1]-h);
		    			for(;p[i+1];i++){
		    				var zed = zEds[i],pos = p[i],pos2 = p[i+1],edx,edy;
	    					if(zed){
								if(pos2[0] == pos[0]){
									zed.movedir = 'h';
									edx = pos[0];
									edy = (pos[1]+pos2[1])/2;
								}else if(pos2[1] == pos[1]){
									zed.movedir = 'v';
									edx = (pos[0]+pos2[0])/2;
									edy = pos[1];
								}
								zed.moveTo(edx-zed.width/2,edy-zed.height/2);
							}else{
								sf.createEditor(pos,pos2);
							}
		    			}
		    			while(zEds.length>i){
		    				var ed = zEds.pop();
							ed.un('move',sf.editorMove,sf);
							ed.destroy();
		    			}
		    		}else{
						for(var l=p.length;i<l;i++){
							var ed = eds[i],pos = p[i];
							if(ed){
								var edx = pos[0]-ed.width/2,
			    					edy = pos[1]-ed.height/2;
								ed.moveTo(edx,edy);
							}else{
								sf.createEditor(pos);
							}
						}
						while(eds.length > i){
							var ed = eds.pop();
							ed.un('move',sf.editorMove,sf);
							ed.destroy();
						}
		    		}
					!Ext.isEmpty(sf.to) && sf.bindEditor(sf.to);
					!Ext.isEmpty(sf.from) && sf.bindEditor(sf.from,true);
		    	}
		    },
		    createEditor : function(pos,pos2){
		    	var sf = this,eds = sf.editors,eds2 = sf.zEditors,
		    		record = sf.getRecord(),
		    		i = eds.length+eds2.length,ed,type = 'Oval',
		    		moveType,
		    		x = pos[0],
		    		y = pos[1];
		    	if(pos2){
					type = 'Diamond';
					if(pos2[0] == x){
						y = (pos2[1]+y)/2
						moveType = 'h';
					}else if(pos2[1] == y){
						x = (pos2[0]+x)/2
						moveType = 'v';
					}
		    	}
		    	ed = new pub[type]({
		    		type:'oval',
		    		connectable:false,
		    		id:sf.id+'_editor'+i,
		    		x:x-5,
		    		y:y-5,
		    		height:10,
		    		width:10,
		    		strokewidth:1,
		    		strokecolor:'rgba(0,0,0,1)',
		    		fillcolor:TRANSPARENT,
		    		root:sf.wrap,
		    		parent:sf,
		    		top:sf.top,
		    		moveable:true,
		    		movedir:moveType
		    	});
		    	if(pos2){
		    		eds2.push(ed);
		    	}else{
		    		eds.push(ed);
			    	if(i==0){
			    		ed.isFrom = true;
			    	}
			    	ed.on('mousedown',sf.editorDown,sf);
		    	}
		    	ed.on('move',sf.editorMove,sf);
		    	if(record != sf.top.dataset.getCurrentRecord()){
		    		(function(){
		    			ed.wrap.hide();
		    		}).defer(Ext.isIE9?1:0);
		    	}
		    },
		    showEditors : function(){
	    		Ext.each(this.editors.concat(this.zEditors||[]),function(ed){
	    			ed.wrap.show();
	    		});
		    },
		    hideEditors : function(){
		    	Ext.each(this.editors.concat(this.zEditors||[]),function(ed){
	    			ed.wrap.hide();
	    		});
		    },
		    clearEditors : function(){
		    	var sf = this;
		    	Ext.each(sf.editors.concat(sf.zEditors||[]),function(ed){
					var el = ed.bindEl;
	    			if(el && el.lineEditors){
	    				el.lineEditors.remove(ed);
	    			}
	    			ed.un('move',sf.editorMove,sf);
	    			ed.destroy();	    	
		    	});
		    	sf.editors = [];
		    	sf.zEditors = [];
		    },
		    createConnects : function(){
		    	var sf = this,top = sf.top;
		    	if(top.editable){
					sf.connects = [];
					var h = sf.height,
						w = sf.width,
						x = sf.x,
						y = sf.y,
						stroke = sf.strokewidth/2,
						xd = stroke,yd = stroke;
//					if(stroke && sf.type == 'diamond'){
//			    		var r = Math.atan(h/w);
//			    		xd = stroke/ Math.sin(r);
//			    		yd = stroke/ Math.cos(r);
//			    	}
					sf.createConnect(x+w/2,y-yd,1);//top
					sf.createConnect(x+w+xd,y+h/2,2);//right
					sf.createConnect(x+w/2,y+h+yd,3);//bottom
					sf.createConnect(x-xd,y+h/2,4);//left
				}
		    },
		    createConnect:function(x,y,dir){
		    	var sf = this,eds = sf.connects,i = eds.length;
		    	eds[i] = new pub.Rect({
		    		type:'rect',
		    		connectable:false,
		    		id:sf.id+'_connect'+i,
		    		x:x-4,
		    		y:y-4,
		    		height:8,
		    		width:8,
		    		strokewidth:1,
		    		strokecolor:'rgba(0,0,0,1)',
		    		fillcolor:'rgba(255,0,0,0.8)',
		    		parent:sf,
		    		root:sf.wrap,
		    		top:sf.top,
		    		dir : dir
		    	});
		    },
		    showConnects : function(){
		    	Ext.each(this.connects,function(ed){
	    			ed.wrap.show();
	    		});
		    },
		    hideConnects : function(){
		    	Ext.each(this.connects,function(ed){
	    			ed.wrap.hide();
	    		});
		    },
		    clearConnects : function(){
		    	var sf = this;
		    	Ext.each(sf.connects,function(ed){
	    			ed.destroy();	    	
		    	});
		    	sf.connects = null;
		    },
		    findConnect : function(e){
		    	var sf = this,xy = e.xy,
		    		_xy = sf.top.wrap.getXY(),
		    		x = xy[0]-_xy[0],
		    		y = xy[1]-_xy[1],
		    		d = Math.pow(Math.min(sf.height/3,sf.width/3),2),
		    		connected = null;
		    	Ext.each(sf.connects,function(c){
					var dx = x - c.x,dy = y - c.y;
					if(dx*dx+dy*dy<d){
						connected = c;
						return false;
					}
				});
				return connected;
		    },
		    findNearlyConnect : function(p){
		    	var _c,d = Number.MAX_VALUE;
				Ext.each(this.connects,function(c){
					var dx = c.x-p[0],dy = c.y-p[1],
						_d = dx*dx+dy*dy;
					if(_d<d){
						d = _d;
						_c = c;
					}
				});
				return _c;
		    },
		    syncConnects : function(dx,dy,dw,dh){
		    	var sf = this,eds = sf.connects,x,y,_ed;
		    	if(!dw && !dh){
			    	Ext.each(eds,function(ed){
						ed.moveTo(x = ed.x + dx,y = ed.y + dy);
						ed.syncLineEditors(x,y);
			    	});
		    	}else{
		    		(_ed = sf.connects[0]).moveTo(x = _ed.x + dx + dw/2,y=_ed.y + dy);
		    		_ed.syncLineEditors(x,y);
		    		(_ed = sf.connects[1]).moveTo(x = _ed.x + dx + dw,y=_ed.y + dy + dh/2);
		    		_ed.syncLineEditors(x,y);
		    		(_ed = sf.connects[2]).moveTo(x = _ed.x + dx + dw/2,y=_ed.y + dy + dh);
		    		_ed.syncLineEditors(x,y);
		    		(_ed = sf.connects[3]).moveTo(x = _ed.x + dx,y=_ed.y + dy + dh/2);
		    		_ed.syncLineEditors(x,y);
		    	}
		    },
		    editorDown : function(e){
		    	var sf = this,id = e.target.id,ed = sf.currentEditor = $(id.substring(0,id.indexOf('_el')));
		    	ed.hide();
		    	sf.top.editing = true;
		    	ed.on('mouseup',sf.editorUp,sf);
		    },
		    editorMove : function(el,ds,record,x,y){
		    	var sf = this,
		    		record = sf.getRecord(),
					config = convertConfig(record),points=[],
					eds = sf.editors,
					dir = el && el.movedir,
					zEds = sf.zEditors;
				if(dir && zEds && zEds.length){
					points = sf.points;
					var index = zEds.indexOf(el),
						p1 = points[index+1],
						p2 = points[index+2],
						h = el.height/2,
						x = el.x+el.width/2,
						y = el.y+el.height/2,
						p,ed;
					if(dir == 'v'){
						p1[1] = p2[1] = y;
					}else{
						p1[0] = p2[0] = x;
					}
					if(ed = zEds[index-1]){
						p = points[index];
						if(p[0] == p1[0]){
							ed.moveTo(p[0]-ed.width/2,(p[1]+p1[1])/2-ed.height/2);
						}else{
							ed.moveTo((p[0]+p1[0])/2-ed.width/2,p[1]-ed.height/2);
						}
					}
					if(ed = zEds[index+1]){
						p = points[index+3];
						if(p[0] == p2[0]){
							ed.moveTo(p[0]-ed.width/2,(p[1]+p2[1])/2-ed.height/2);
						}else{
							ed.moveTo((p[0]+p2[0])/2-ed.width/2,p[1]-ed.height/2);
						}
					}
					config.generate = false;
				}else{
					Ext.each(eds,function(ed){
						points.push([ed.x+ed.width/2,ed.y+ed.height/2]);
					});
				}
				config.points = points.join(' ');
				record.set('config',Ext.util.JSON.encode(config));
	   		},
	   		editorUp : function(){
	   			var sf = this,ed = sf.currentEditor;
	   			ed.show();
		    	ed.un('mouseup',sf.editorUp,sf);
	   			sf.top.editing = false;
	   			delete sf.currentEditor;
	   		},
	   		onMouseDown : function(e,t){
		    	var sf = this,top = sf.top;
		    	sf.fire('mousedown',e,t);
    			if(top.editable && !top.candrawline){
			    	setTopCmp(sf.wrap);
		    		if(sf.dropto || sf.moveable){
				    	sf.beforeMove(e);
			    	}
		    	}
		    },
		    onMouseMove : function(e,t){
		    	e.stopEvent();
		    	var sf = this,
		    		wrap = sf.wrap,
		    		top = sf.top,
		    		w = sf.width||sf.rx*2,
		    		h = sf.height||sf.ry*2,
		    		parent = sf.parent,
		    		graphic = top.wrap,
	    			sw = graphic.getWidth(),
	    			sh = graphic.getHeight(),
	    			stroke = sf.strokewidth||0,
		    		_xy = graphic.getXY(),
		    		tx = e.getPageX()+sf.relativeX - _xy[0],
		    		ty = e.getPageY()+sf.relativeY - _xy[1],
		    		x = sf.x,y = sf.y,_x,_y,c,table_id,
		    		b=0,type = sf.type,xb = b,yb = b;
	    		if(top.editing){
					var g = sf.getGElement(t),
						el,r;
			    	if(g){
			    		(el = g.el).showConnects();
			    		if(!sf.movedir)c = el.findConnect(e);
			    	}
				}
				if(c){
					table_id = (r = g.record).get(sf.tableidfield)|| r.get('table_id');
					_x = sf.x = c.x;
					_y = sf.y = c.y;
					tx = _x+xb;
					ty = _y+xb;
				}else{
		    		if(stroke && isVML(wrap)){
		    			xb = yb = b =  - stroke/2;
//		    			if(type == 'diamond'){
//				    		var r = Math.atan(h/w);
//				    		xb = Math.round(b/ Math.sin(r)*10)/10;
//				    		yb = Math.round(b/ Math.cos(r)*10)/10;
//				    		//TODO有问题 待解决
//				    	}
		    		}
		    		if(tx <= xb) tx = xb;
		    		else if(tx + w - xb> sw - 2) tx = sw - 2 - w + xb;
		    		if(ty <= yb) ty = yb;
		    		else if(ty + h - yb> sh - 2) ty = sh - 2 - h + yb;
					_x = sf.x = Math.round(tx - xb);
					_y = sf.y = Math.round(ty - yb);
				}
				if(sf.moveable){
					var ds = top.dataset,
						record = ds.getCurrentRecord(),
	        			config = convertConfig(record);
	        		config.x = _x;
	        		config.y = _y;
//	        		config.type = type;
	        		if(!sf.movedir){
		        		if(!Ext.isEmpty(table_id)){
		        			config[sf.isFrom?'from':'to'] = table_id;
		        		}else{
		        			delete config[sf.isFrom?'from':'to'];
		        		}
	        		}
	        		top.syncFocusMask(config);
	        		record.data.config=Ext.util.JSON.encode(config).replace(/^{|}$/g,'');
	        		record.dirty = true;
					sf.fireEvent('move',sf,ds,record,_x - xb,_y - yb);
					top.fireEvent('move',sf,ds,record,_x - xb,_y - yb);
				}
				if(isSVG(wrap)){
	    			if(stroke % 2 == 1&&!sf.shadow){
						tx += .5;
						ty += .5;
	    			}
					if(parent){
						tx-=parent.x;
						ty-=parent.y;
					}
					if(sf.movedir == 'h'){
						ty = null;
					}else if(sf.movedir == 'v'){
						tx = null;
					}
		    		transform(sf.proxy,tx,ty);
				}else{
					if(sf.connectable != false){
						tx-=3;
						ty-=3;
					}
					if(sf.movedir && parent){
						tx-=parent.x;
						ty-=parent.y;
					}
					if(sf.movedir == 'v'){
						sf.proxy.setStyle('top',ty+'px');
					}else if(sf.movedir == 'h'){
						sf.proxy.setStyle('left',tx+'px');
					}else
		    			sf.proxy.moveTo(tx+_xy[0],ty+_xy[1]);
				}
				//sf.syncLineEditors(_x - x,_y - y);
				sf.syncConnects(_x - x,_y - y);
		    },
		    onMouseOver : function(e,t){
		    	var sf = this,top = sf.top;
		    	if((top.candrawline||top.editing) && sf.connectable != false){
		    		sf.showConnects();
		    	}
		    },
		    onMouseOut : function(e){
		    	var sf = this,top = sf.top;
		    	if(sf.connectable != false){
		    		sf.hideConnects();
		    	}
		    },
			getRecord : function(){
		    	var a = this.id.match(/(.*)_(\d+)(_.*)*$/),ds=this.top.dataset;
		    	if(a&&ds){
		    		return ds.findById(a[2])
		    	}
		    },
		    destroy : function(){
		    	var sf = this,fm = sf.focusMask,text = sf.text;
		    	sf.clearEditors();
		    	sf.clearConnects();
		    	fm && fm
		    		//.un('mousedown',sf.onMouseDown,sf)
		    		.remove();
	    		text && text.remove&&text.remove();
		    	pub.Path.superclass.destroy.call(sf);
		    },
		    getVmlTpl : function(s,f,sd){
		    	var tpl = ['<v:shape id="{id}" filled="',f,'" stroked="',s,'" coordsize="{zoom},{zoom}" style="position:absolute;left:0;top:0;width:1px;height:1px;cursor:{cursor};{style}" path="{path}">'];
		    	if(f)tpl.push(fill);
		    	if(s)tpl.push(stroke);
		    	if(sd)tpl.push(shadow);
		    	tpl.push('</v:shape>');
		    	return tpl;
		    },
		    addConfig : function(config){
		    	this.changeConfig(Ext.apply(this.initConfig,config));
		    },
		    changeConfig : function(config,record){
		    	var el = this,
		    		sf = el.top,
		    		type = config.type,
		    		_proto = pub[type == 'image'?'Image':'Path'].prototype,
		    		processConfig = pub[capitalize(type)].processConfig,
		    		x = el.x,y = el.y,w = el.width,h = el.height;
				config.top = el.top;
				if(type == 'zLine'){
					if(config.generate != false){
						pub.ZLine.generate(config);
					}
					if(record){
						var _config = convertConfig(record);
						delete _config.generate;
						if(Ext.isArray(config.points)){
							_config.points = config.points.join(' ');
						}
						record.data.config=Ext.util.JSON.encode(_config).replace(/^{|}$/g,'');
						record.dirty = true;
					}
				}
		    	if(processConfig && processConfig(config)==false){
		    		return false;
		    	}
		    	for(var key in el.initConfig){
		    		if(key != 'dataset' && key != 'top' && key != 'root' && key != 'id'){
			    		if(!(key in config))delete el[key];
		    		}
		    	}
		    	Ext.apply(el,config);
		    	el.initConfig = config;
		    	el.processListener('un');
		    	el.el.remove();
		    	if(el.text)el.text.remove();
		    	if(hasSVG){
		    		el.initSVGElement = _proto.initSVGElement;
		    	}else{
		    		el.initVMLElement = _proto.initVMLElement;
		    		el.vmlTpl = _proto.vmlTpl;
		    	}
		    	el.initComponent(config);
		// WebKit BUG
		//    	if(Ext.isWebKit){
		//    		var dom = el.wrap.dom;
		//    		dom.setAttribute('transform',dom.getAttribute('transform'));
		//    	}
		    	el.syncConnects(el.x - x,el.y - y,el.width - w,el.height - h);
		    	el.syncEditors();
		    	if(el == sf.focusItem && sf.focusMask){
		    		sf.syncFocusMask(el);
		    	}
		    	el.processListener('on');
		    }
		}),
		Group : Ext.extend($A.Graphics,{
			initSVGWrap : function(){
				this.wrap = this.root.appendChild(newSVG('g',this.id));
			},
	    	initVMLWrap : function(){
		    	this.wrap = this.root.appendChild(newVML('v:group',this.id)
		    		.setStyle({
		    			position:'absolute',
		    			width:100+PX,
		    			height:100+PX
		    		}).set({coordsize:'100,100'}));
		    },
			initSVGElement : function(){
		    },
		    initVMLElement : function(){
		    }
		}),
		Line : function(){
			function line(config){
				if(pub.Line.processConfig(config)==false)return;
				var line = new pub.Path(config);
				line.createEditors();
				return line;
			}
			line.processConfig = function(config){
				var points = convertPoints(config.points);
				if(points.length < 2)return false;
				var x = Number(points[0][0]), y = Number(points[0][1]);
				a = ['M',0,0,'L'];
				Ext.each(points,function(p){
					a.push(p[0] - x,p[1] - y);
				});
				config.d = a.join(' ');
				if(config.strokewidth == 1)config.strokewidth = 2;
				config.fillcolor = NONE;
				config.points = points;
				config.x = x;
				config.y = y;
			}
			return line;
		}(),
		ZLine : function(){
			var array_proto_push = Array.prototype.push,
				margin = 25;
			function bt(a,b){
				return a>b;
			}
			function lt(a,b){
				return a<b;
			}
			function findEl(where,top,tr){
				return !isEmpty(where) && 
					(tr = top.dataset.find(top.tableidfield,where)) && 
					$(top.id+'_'+tr.id);
			}
			function exchange(toPoint,fromPoint,isV){
				if(isV)
					return [toPoint[0],fromPoint[1]];
				else
					return [fromPoint[0],toPoint[1]];
			}
			function generatePoints(el,fromPoint,toPoint,isFrom){
				if(!el)return;
				var content = el.findNearlyConnect(isFrom?fromPoint:toPoint);
				if(!content)return;
				var	x = el.x,
					y = el.y,
					w = el.width,
					h = el.height,
					x1 = isFrom?fromPoint[0]:toPoint[0],
					y1 = isFrom?fromPoint[1]:toPoint[1],
					x2 = isFrom?toPoint[0]:fromPoint[0],
					y2 = isFrom?toPoint[1]:fromPoint[1],
					dir = content.dir,
					joinMethod = isFrom?'push':'unshift',
					points = [fromPoint],
					doubleMargin,_margin,
					bl,compareMethod=bt,r,b;
				if((bl = dir == 1) || dir == 3){
					if(bl){
						r = x+w;
						l = x;
						b = y+h;
						_margin = margin;
					}else{
						compareMethod = lt;
						_margin = -margin;
						w = -w;
						r = x;
						l = x-w;
						b = y;
					}
					doubleMargin = _margin*2;
					if(compareMethod(y1-y2,doubleMargin)){
						points[joinMethod]([x1,(y1+y2)/2],[x2,(y1+y2)/2]);
					}else if(compareMethod(y1,y2)){
						points[joinMethod]([x1,y2]);
					}else{
						if(compareMethod(x2 - r ,doubleMargin)){
							points[joinMethod]([x1,y1-_margin],[(r+x2)/2,y1-_margin],[(r+x2)/2,y2]);	
						}else if(compareMethod(-doubleMargin,x2-l)){
							points[joinMethod]([x1,y1-_margin],[(l+x2)/2,y1-_margin],[(l+x2)/2,y2]);	
						}else if(compareMethod(x2 , r) || compareMethod(r-w,x2)){
							points[joinMethod]([x1,y1-_margin],[x2,y1-_margin]);	
						}else{
							points[joinMethod]([x1,y1-_margin],[r+_margin,y1-_margin],[r+_margin,(b+y2)/2],[x2,(b+y2)/2]);	
						}
					}
				}else{
					bl = dir == 2;
					if(bl){
						r = y+h;
						l = y;
						b = x;
						_margin = margin;
					}else{
						compareMethod = lt;
						_margin = -margin;
						h = -h;
						r = y;
						l = y-h;
						b = x+w;
					}
					doubleMargin = _margin*2;
					if(compareMethod(x2-x1,doubleMargin)){
						points[joinMethod]([(x1+x2)/2,y1],[(x1+x2)/2,y2]);
					}else if(compareMethod(x2,x1)){
						points[joinMethod]([x2,y1]);
					}else{
						if(compareMethod(y2 - r ,doubleMargin)){
							points[joinMethod]([x1+_margin,y1],[x1+_margin,(r+y2)/2],[x2,(r+y2)/2]);	
						}else if(compareMethod(-doubleMargin,y2-l)){
							points[joinMethod]([x1+_margin,y1],[x1+_margin,(l+y2)/2],[x2,(l+y2)/2]);	
						}else if(compareMethod(y2 , r) || compareMethod(r-h,y2)){
							points[joinMethod]([x1+_margin,y1],[x1+_margin,y2]);	
						}else{
							points[joinMethod]([x1+_margin,y1],[x1+_margin,r+_margin],[(b+x2)/2,r+_margin],[(b+x2)/2,y2]);	
						}
					}
				}
				points[joinMethod](toPoint);
				if(joinMethod == 'unshift'){
					points.reverse();						
				}
				points.dir = dir;
				return points;
			}
			return Ext.apply(function(config){
				if(pub.ZLine.processConfig(config)==false)return;
				var line = new pub.Path(config);
				line.zEditors = [];
				line.createEditors();
				return line;
			},{
				processConfig : function(config){
					var points = convertPoints(config.points);
					if(points.length < 2)return false;
					var x = points[0][0],
						y = points[0][1];
					
					a = ['M',0,0,'L'];
					Ext.each(points,function(p){
						a.push(p[0] - x,p[1] - y);
					});
					
					config.d = a.join(' ');
					if(config.strokewidth == 1)config.strokewidth = 2;
					config.fillcolor = NONE;
					config.points = points;
					config.x = x;
					config.y = y;
				},
				generate : function(config){
					var top = config.top,
						points = convertPoints(config.points),
						from = config.from,
						to = config.to,
						fromPoint = points[0],
						toPoint = points.pop(),
						x1 = fromPoint[0],
						y1 = fromPoint[1],
						x2 = toPoint[0],
						y2 = toPoint[1],
						fromPoints,
						toPoints;
					if(!from && !to){
						if(Math.abs(x2-x1) < Math.abs(y2-y1)){
							points=[fromPoint,[x1,(y1+y2)/2],[x2,(y1+y2)/2],toPoint];
						}else{
							points=[fromPoint,[(x1+x2)/2,y1],[(x1+x2)/2,y2],toPoint];
						}
					}else{
						fromPoints = generatePoints(from = findEl(from,top),fromPoint,toPoint,true);
						toPoints = generatePoints(to = findEl(to,top),fromPoint,toPoint);
						if(fromPoints && toPoints){
							fromPoints.pop();
							toPoints.shift();
							var fromLength = fromPoints.length,
								toLength = toPoints.length,
								fromDir = fromPoints.dir,
								toDir = toPoints.dir,
								fromX = from.x,
								fromY = from.y,
								fromW = from.width,
								fromH = from.height,
								toX = to.x,
								toY = to.y,
								toW = to.width,
								toH = to.height,
								isV = fromDir == 1 || fromDir == 3,
								bl = fromLength > toLength,
								side = (toDir - fromDir + 4)%4,
								b1 = fromPoint[0]>toPoint[0],
								b2 = fromPoint[1]>toPoint[1],
								p=[],value;
							if(side == 0){
								switch(fromLength * toLength){
									case 16 : 
										fromPoints.splice(2,2);
										toPoints.splice(0,2);
										break;
									case 15 :
										if(bl){
											toPoints.splice(0,2);
										}else{
											fromPoints.splice(1,2);
										}
										break;
									case 12 :
										fromPoints.splice(2,2);
										toPoints.splice(0,2);
										p.push(exchange(toPoints[0],fromPoints[fromPoints.length-1],!isV ^ bl));
										break;
									case 9:
										if(isV ? (fromDir == 1?!b2:b2 ):(fromDir == 2 ? b1:!b1)){
											toPoints.splice(0,2);
										}else{
											fromPoints.splice(1,2);
										}
										break;
									case 8:
										if(bl){
											fromPoints.splice(2,2);
											toPoints.splice(0,1);
										}else{
											fromPoints.splice(1,1);
											toPoints.splice(0,2);
										}
										p.push(exchange(toPoints[0],fromPoints[fromPoints.length-1],!isV ^ bl));
								}
							}else if(side == 2){
								switch(fromLength * toLength){
									case 25 :
									case 15 :
									case 12 :
										fromPoints.splice(2,fromLength-2);
										toPoints.splice(0,toLength-2);
										if(isV){
											if(b1){
												value = Math.max(fromX+fromW,toX+toW)+margin;
											}else{
												value = Math.min(fromX,toX)-margin;
											}
										}else{
											if(b2){
												value = Math.max(fromY+fromH,toY+toH)+margin;
											}else{
												value = Math.min(fromY,toY)-margin;
											}										
										}
										p.push(exchange([value,value],fromPoints[fromPoints.length-1],isV),exchange(toPoints[0],[value,value],!isV));
										break;
									case 16 :
										fromPoints.splice(2,2);
										toPoints.splice(0,2);
										if(isV){
											if(b1){
												value = (toX + toW + fromX)/2
											}else{
												value = (fromX + fromW +toX)/2
											}
										}else{
											if(b2){
												value = (toY + toH + fromY)/2
											}else{
												value = (fromY + fromH +toY)/2
											}
										}
										p.push(exchange([value,value],fromPoints[fromPoints.length-1],isV),exchange(toPoints[0],[value,value],!isV));
										break;
									case 9:
										fromPoints.splice(2,1);
										toPoints.splice(0,1);
										if(isV?b2 ^ fromDir == 1:!b1 ^ fromDir == 2){
											if(isV){
												if(b1){
													value = Math.max(fromX+fromW,toX+toW)+margin;
												}else{
													value = Math.min(fromX,toX)-margin;
												}
											}else{
												if(b2){
													value = Math.max(fromY+fromH,toY+toH)+margin;
												}else{
													value = Math.min(fromY,toY)-margin;
												}										
											}
											p.push(exchange([value,value],fromPoints[fromPoints.length-1],isV),exchange(toPoints[0],[value,value],!isV))
										}
										break;
									case 4:
										fromPoints.splice(1,1);
										toPoints.splice(0,1);
										if(isV){
											value = (fromPoints[fromPoints.length-1][1]+toPoints[0][1])/2;
										}else{
											value = (fromPoints[fromPoints.length-1][0]+toPoints[0][0])/2;
										}
										p.push(exchange([value,value],fromPoints[fromPoints.length-1],!isV),exchange(toPoints[0],[value,value],isV))
										
								}
							}else{
								var side3 = side == 3;
								switch(fromLength * toLength){
									case 25:
										if(side3){
											fromPoints.splice(1,4);
											toPoints.splice(0,2);
										}else{
											fromPoints.splice(3,2);
											toPoints.splice(0,4);
										}
										p.push(exchange(toPoints[0],fromPoints[fromPoints.length-1],!isV));
										break;
									case 10:
									case 20:
										if(side3^bl){
											if(side3){
												fromPoints.splice(1,fromLength-1);
												toPoints.splice(0,2);
											}else{
												fromPoints.splice(3,2);
												toPoints.splice(0,toLength-1);
											}
											p.push(exchange(toPoints[0],fromPoints[fromPoints.length-1],!isV));
										}else{
											if(side3){
												fromPoints.splice(2,3);
												toPoints.splice(0,toLength-1);
												if(fromDir == 1){
													value = fromX - margin;
												}else if(fromDir == 2){
													value = fromY - margin;
												}else if(fromDir == 3){
													value = fromX+fromW+margin;
												}else{
													value = fromY+fromH+margin;
												}
											}else{
												fromPoints.splice(1,fromLength-1);
												toPoints.splice(0,3);
												if(fromDir == 1){
													value = toY-margin;
												}else if(fromDir == 2){
													value = toX+toW+margin;
												}else if(fromDir == 3){
													value = toY+toH+margin;
												}else{
													value = toX - margin;
												}
											}
											p.push(exchange([value,value],fromPoints[fromPoints.length-1],side3 ^!isV),exchange(toPoints[0],[value,value],side3^isV));
										}
										break;
									case 16:
										fromPoints.splice(2,2);
										toPoints.splice(0,2);
										p.push(exchange(toPoints[0],fromPoints[fromPoints.length-1],isV));
										break;
									case 15:
										if(side3){
											if(bl){
												fromPoints.splice(2,3);
												toPoints.splice(0,1);
											}else{
												fromPoints.splice(2,2);
												toPoints.splice(0,2);
											}
										}else{
											if(bl){
												fromPoints.splice(3,2);
												toPoints.splice(0,2);
											}else{
												fromPoints.splice(2,1);
												toPoints.splice(0,3);
											}
										}
										p.push(exchange(toPoints[0],fromPoints[fromPoints.length-1],side3^(isV ^ bl)));
										break;
									case 12:
										if(bl){
											if(isV?side3^(b1 ^ (fromDir == 1)):side3^(b2 ^ (fromDir == 2))){
												fromPoints.splice(2,2);
												toPoints.splice(0,1);
												p.push(exchange(toPoints[0],fromPoints[fromPoints.length-1],isV));
											}else{
												toPoints.splice(0,2);
											}
										}else{
											if(isV?b2 ^ fromDir == 1:!b1 ^ fromDir == 2){
												fromPoints.splice(2,1);
												toPoints.splice(0,2);
												p.push(exchange(toPoints[0],fromPoints[fromPoints.length-1],isV));
											}else{
												fromPoints.splice(1,2);
											}
										}
										break;
									case 9:
										if(isV^(side3^(b1 ^ b2))){
											fromPoints.splice(1,2);
											toPoints.splice(0,2);
											p.push(exchange(toPoints[0],fromPoints[fromPoints.length-1],isV?fromDir == 1 ^ (side3^b1):fromDir == 2 ^ b1));
										}else{
											if(isV?fromDir == 1 ^ (side3^b1) : fromDir == 2 ^ b1){
												fromPoints.splice(1,2);
												toPoints.splice(0,1);
												if(isV){
													if(side3 ^ b1){
														value = (toY+fromPoints[0][1])/2;
													}else{
														value = (toY+toH+fromPoints[0][1])/2;
													}
												}else{
													if(b1){
														value = (toX + toW+fromPoints[0][0])/2
													}else{
														value = (toX+fromPoints[0][0])/2;
													}
												}
												p.push(exchange([value,value],fromPoints[fromPoints.length-1],!isV),exchange(toPoints[0],[value,value],isV));
											}else{
												fromPoints.splice(2,1);
												toPoints.splice(0,2);
												if(isV){
													if(b1){
														value = (fromX + toPoints[0][0])/2;
													}else{
														value = (fromX + fromW+toPoints[0][0])/2;
													}
												}else{
													if(side3 ^ b1){
														value = (fromY+toPoints[0][1])/2;
													}else{
														value = (fromY+fromH+toPoints[0][1])/2;
													}
												}
												p.push(exchange([value,value],fromPoints[fromPoints.length-1],isV),exchange(toPoints[0],[value,value],!isV));
											}
										}
										break;
									case 6:
										if(bl){
											if(isV?!b2^fromDir == 1:b1 ^ fromDir == 2){
												fromPoints.splice(1,2);
											}else{
												fromPoints.splice(2,1);
												toPoints.splice(0,1);
												if(side3){
													if(fromDir == 1){
														value = (toPoints[0][0]+fromX+fromW)/2
													}else if(fromDir == 2){
														value = (toPoints[0][1]+fromY+fromH)/2
													}else if(fromDir == 3){
														value = (toPoints[0][0]+fromX)/2;
													}else{
														value = (toPoints[0][1]+fromY)/2;
													}
												}else{
													if(fromDir == 1){
														value = (toPoints[0][0]+fromX)/2;
													}else if(fromDir == 2){
														value = (toPoints[0][1]+fromY)/2;
													}else if(fromDir == 3){
														value = (toPoints[0][0]+fromX+fromW)/2
													}else{
														value = (toPoints[0][1]+fromY+fromH)/2
													}
												}
												p.push(exchange([value,value],fromPoints[fromPoints.length-1],isV),exchange(toPoints[0],[value,value],!isV));
											}
										}else{
											if(isV?side3 ^ (!b1 ^fromDir == 1):side3 ^(!b2 ^ fromDir == 2)){
												toPoints.splice(0,2);
											}else{
												fromPoints.splice(1,1);
												toPoints.splice(0,1);
												if(fromDir == 1){
													value = (fromPoints[0][1]+toY+toH)/2;
												}else if(fromDir == 2){
													value = (fromPoints[0][0]+toX)/2;
												}else if(fromDir == 3){
													value = (fromPoints[0][1]+toY)/2;
												}else{
													value = (fromPoints[0][0]+toX+toW)/2;
												}
												p.push(exchange([value,value],fromPoints[fromPoints.length-1],!isV),exchange(toPoints[0],[value,value],isV));
											}
										}
								}
							}
							p.length && array_proto_push.apply(fromPoints,p);
							points = fromPoints.concat(toPoints);
						}else if(fromPoints){
							points = fromPoints;
						}else{
							points = toPoints;
						}
					}					
					config.points = points;
					
				}
			});
		}(),
		Oval:Ext.apply(function(config){
			pub.Oval.processConfig(config);
			var p = new pub.Path(config);
			if(config.connectable != false){
				p.createConnects();
				(function(){
					p.hideConnects();
				}).defer(Ext.isIE9?1:0);
			}
			return p;
		},{
			processConfig : function(config){
				config.height = config.height||config.ry*2;
				config.width = config.width||config.rx*2;
				config.ry = config.height/2;
				config.rx = config.width/2;
				pub.Rect.processConfig(config);
			}
		}),
		Arc:function(config){
			function arc (){
				arc.processConfig(config);
				new pub.Path(config)
			}
			arc.processConfig = hasSVG?function (options) {
				var x = options.x,
					y = options.y,
					start = options.start % (2 *mathPI),
					radius = options.r ,
					end = options.end % (2 * mathPI) - 0.000001, // to prevent cos and sin of start and end from becoming equal on 360 arcs
					innerRadius = options.innerR || 0,
					open = options.open,
					cosStart = mathCos(start),
					sinStart = mathSin(start),
					cosEnd = mathCos(end),
					sinEnd = mathSin(end),
					longArc = (end > start? end : end + 2 * mathPI) - start < mathPI ? 0 : 1;
				options.d = [
					'M',
					x + radius * cosStart,
					y - radius * sinStart,
					'A', // arcTo
					radius, // x radius
					radius, // y radius
					0, // slanting
					longArc, // long or short arc
					0, // clockwise
					x + radius * cosEnd,
					y - radius * sinEnd,
					open ? 'M' : 'L',
					x + innerRadius * cosEnd,
					y - innerRadius * sinEnd,
					'A', // arcTo
					innerRadius, // x radius
					innerRadius, // y radius
					0, // slanting
					longArc, // long or short arc
					1, // clockwise
					x + innerRadius * cosStart,
					y - innerRadius * sinStart,
			
					open ? '' : 'Z' // close
				].join(' ');
				options.x = 0;
				options.y = 0;
			}:function (options) {
				var zoom = options.zoom || 10000,
					x = options.x * zoom,
					y = options.y * zoom,
					start = options.start ,
					end = options.end ,
					radius = options.r * zoom,
					cosStart = mathCos(start),
					sinStart = mathSin(start),
					cosEnd = mathCos(end),
					sinEnd = mathSin(end),
					innerRadius = (options.innerR  || 0)* zoom,
					circleCorrection = 0.08 / radius, // #760
					innerCorrection = (innerRadius && 0.1 / innerRadius) || 0,
					ret;
			
				if (end - start === 0) { // no angle, don't show it.
					return ['x'];
			
				}
			//	else if (2 * mathPI - end + start < circleCorrection) { // full circle
			//		// empirical correction found by trying out the limits for different radii
			//		cosEnd = -circleCorrection;
			//	} else if (end - start < innerCorrection) { // issue #186, another mysterious VML arc problem
			//		cosEnd = mathCos(start + innerCorrection);
			//	}
			
				ret = [
					'at', // clockwise arc to
					pInt(- radius), // left
					pInt(- radius), // top
					pInt(radius), // right
					pInt(radius), // bottom
					pInt(radius * cosStart), // start x
					pInt(- radius * sinStart), // start y
					pInt(radius * cosEnd), // end x
					pInt(- radius * sinEnd)  // end y
				];
				if(innerRadius){
					ret.push(
						'wa', // anti clockwise arc to
						pInt(- innerRadius), // left
						pInt(- innerRadius), // top
						pInt(innerRadius), // right
						pInt(innerRadius), // bottom
						pInt(innerRadius * cosEnd), // start x
						pInt(- innerRadius * sinEnd), // start y
						pInt(innerRadius * cosStart), // end x
						pInt(- innerRadius * sinStart) // end y
					);
				}
				ret.push(
					'x', // finish path
					'e' // close
				);
				options.path = ret.join(' ');
			}
			return arc;
		}(),
		Rect : function(){
			function rect(config){
				rect.processConfig(config);
				var p = new pub.Path(config)
				if(config.connectable != false){
					p.createConnects();
					p.hideConnects();
				}
				return p;
			}
			rect.processConfig=function(config){
				var h = Number(config.height)||200,
					w = Number(config.width)||200,
					rx = Math.min(Number(config.rx)||0,w/2),
					ry = Math.min(Number(config.ry)||0,h/2),
					round = rx>0&&ry>0,
					lx = rx!=w/2,
					ly = ry!=h/2,
					d = ['M',0,round?ry:0];
				if(round)d.push('A',rx,ry,0,0,1,rx,0);
				if(lx)d.push('H',w-(round?rx:0));
				if(round)d.push('A',rx,ry,0,0,1,w,ry);
				if(ly)d.push('V',h-(round?ry:0));
				if(round)d.push('A',rx,ry,0,0,1,w-rx,h);
				if(lx)d.push('H',round?rx:0);
				if(round)d.push('A',rx,ry,0,0,1,0,h-ry);
				if(ly)d.push('Z');
				config.d = d.join(' ');
			}
			return rect;
		}(),
		Diamond : function(){
			function diamond(config){
				diamond.processConfig(config);
				var p = new pub.Path(config);
				if(config.connectable != false){
					p.createConnects();
					p.hideConnects();
				}
				return p;
			}
			diamond.processConfig = function(config){
				var h = Number(config.height)||100,
				w = Number(config.width)||200,
				d = ['M',
					0,h/2,
					'L',
					w/2,0,
					w,h/2,
					w/2,h,
					'Z'];
				config.d = d.join(' ');
			}
			return diamond;
		}(),
		Arrow : function(){
			var id,color,opacity,defs,maskerOpt={
					viewBox:'0 0 100 100',
					refX:50,
					refY:50,
					orient:'auto'
				},
				start = 'start-arrow-',end = 'end-arrow-',
				startD = 'M 100 0 L 0 50 L 100 100 L 66.66 50 z',
				endD = 'M 0 0 L 100 50 L 0 100 L 33.33 50 z',
				createArrow = function(arrow,isStart){
					if(arrow){
						var sid = (isStart?start:end) + arrow + id;
						Ext.get(sid)||new pub.Path({
							fillcolor:color,
							fillopacity:opacity,
							d:isStart?startD:endD,
							root:defs.appendChild(newSVG('marker',sid).set(maskerOpt))
						});
					}
				}
			return function(config){
				if(!config.startarrow && !config.endarrow )return;
				var root = config.root;
	//			var vb = '0 0 100 100';
				defs = root.child('defs')||root.insertFirst(newSVG('defs'));
				color = config.color||'#000000';
				opacity = config.opacity||1;
				id = '-' + color + '-' + opacity * 100;
	//			if(Ext.isIE9){
	//				var width = config.width||2,
	//					dt = width / 2 * Math.sqrt(5);
	//				id += '-' + width;
	//				vb = -dt + ' ' + (-dt) + ' ' + (100 + 2 * dt) + ' ' + (100 + 2 * dt);
	//			}
	//			maskerOpt.viewBox = vb;
				createArrow(config.startarrow,true);
				createArrow(config.endarrow);
			}
		}()
	}
}();
Ext.apply(pub,{
	Image : Ext.extend(pub.Path,{
		initSVGElement : function(){
			var sf = this,parent = sf.parent,wrap = sf.wrap,x = sf.x,y = sf.y,
				dom = (sf.el = wrap.appendChild(newSVG("image",sf.id+"_el")
					.set({x:0,y:0,width:sf.width,height:sf.height}))).dom;
	    	dom.style.cssText=encodeStyle({
	    		stroke:sf.strokecolor,
	    		'stroke-width':sf.strokewidth,
	    		'stroke-opacity':sf.strokeopacity,
	    		'-moz-user-select':NONE
	    	})+sf.style;
	    	dom.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',sf.image);
			if(x||y){
				if(parent){
					x-=parent.x;
					y-=parent.y;
				}
				transform(wrap,x,y)
			};
	    },
	    initVMLElement : function(){
	    	var sf = this,strokecolor = sf.strokecolor,parent = sf.parent,x = sf.x,y = sf.y;
	    	if(parent){
				x-=parent.x;
				y-=parent.y;
			}
	    	sf.el=new Ext.Template(sf.vmlTpl).append(sf.wrap.setStyle({
	    		position:'absolute',
	    		width:100+PX,
	    		height:100+PX,
	    		left:x+PX,
	    		top:y+PX
	    	}).set({coordsize:'100,100'}).dom,{
	    		id:sf.id+'_el',
	    		src:sf.image,
	    		style:sf.style,
	    		width:sf.width,
	    		height:sf.height,
	    		strokeColor:strokecolor||NONE,
	    		strokeWidth:strokecolor?sf.strokewidth:0,
	    		strokeOpacity:strokecolor?(sf.strokeopacity||1):0
	    	},true)
	    },
	    vmlTpl : ['<v:image id="{id}" src="{src}" style="position:absolute;left:0;top:0;width:{width}px;height:{height}px;{style}">',stroke,'</v:image>']
	}),
	Text : Ext.extend(pub.Path,{
		initSVGWrap : function(){
			this.wrap = this.root.appendChild(newSVG('g',this.id));
		},
    	initVMLWrap : function(){
	    	this.wrap = this.root.appendChild(newVML('v:group',this.id));
	    },
		initSVGElement : function(){
			var sf = this,
				rotation = sf.rotation,
				size = sf.size||14,
				dom = (sf.el = sf.wrap.appendChild(newSVG('text',sf.id+'_el')
					.set({dx:sf.dx+1,dy:sf.dy+size-2}))).dom;
    		dom.style.cssText=encodeStyle({
	    		fill:sf.color,
	    		'font-size':size+PX,
	    		'font-family':sf.fontfamily,
	    		cursor:'text'
	    	})+sf.style;
    		dom.textContent = sf.text;
	    	if(!isEmpty(rotation))transform(sf.el,null,null,null,null,rotation);
	    	return sf.el;
	    },
	    initVMLElement : function(){
	    	var sf = this,
	    		size = sf.size||14,
	    		rotation = sf.rotation,
	    		positionwrap = sf.positionwrap,
	    		el = sf.el = new Ext.Template(sf.vmlTpl).append(sf.wrap.dom,{
		    		id:sf.id+'_el',
		    		style:encodeStyle({
		    			'font-size':size+PX,
		    			'font-family':sf.fontfamily
		    		})+sf.style,
		    		left:sf.dx,
		    		top:sf.dy,
		    		color:sf.color||'black'
		    	},true).update(sf.text);
	    	if(!isEmpty(rotation)){
	    		var x,y;
	    		if(positionwrap){
	    			x = positionwrap.x;
	    			y = positionwrap.y;
	    			el.dx = positionwrap.titlex;
	    			el.dy = positionwrap.titley;
	    		}
	    		transform(el,null,null,null,null,rotation,x,y);
	    	}
	    	return el;
	    },
	    vmlTpl : "<span id='{id}' unselectable='on'  onselectstart='return false;' style='position:absolute;left:{left}px;top:{top}px;color:{color};cursor:pointer;white-space:nowrap;{style}'></span>"
	})
})

})();