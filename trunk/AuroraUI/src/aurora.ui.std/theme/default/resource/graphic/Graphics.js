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
    capitalize = function(w){
    	return (w = w.trim()).toLowerCase().replace(/^./,w.charAt(0).toUpperCase());
    },
    newSVG = function(tag,id){
    	var e = DOC.createElementNS(SVG_NS, tag);
    	if(!Ext.isEmpty(id)) e.id = id;
    	return Ext.get(e);
    },
    newVML = function(vml,id){
    	var e = DOC.createElement(vml);
    	if(!Ext.isEmpty(id)) e.id = id;
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
    				return Ext.isEmpty(v)?$0:v
    			}));
    }:function(){
    	var dom,values=Ext.toArray(arguments),options={};
    	if(values.length&&Ext.isObject(values[0])){
    		dom = Ext.get(values.shift());
    	}else{
	    	dom = this.el || this.wrap
    	}
    	if(!Ext.isEmpty(values[0])) dom.setStyle('left',values[0] + PX);
    	if(!Ext.isEmpty(values[1])) dom.setStyle('top',values[1] + PX);
    	if(!Ext.isEmpty(values[2]) && !Ext.isEmpty(values[3])){
	    	dom.dom.coordsize.value= 100 / values[2]+',' +  100 / values[3];
    	}
    	if(!Ext.isEmpty(values[4])){
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
					filter: !Ext.isEmpty(rotation) ? ['progid:DXImageTransform.Microsoft.Matrix(M11=', cosA,
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
    		.setStyle({height:'100%',width:'100%'})//Fixed for FF 11;
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
    onMouseUp : function(e){
    	var sf = this;
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
		    		t = $(a[1]+'_'+id);
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
	        if(!Ext.isEmpty(v)){
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
    	var wrap = this.wrap;
    	if(isSVG(wrap)){
    		transform(wrap,x,y);
    	}else{
    		var xy = this.top.wrap.getXY();
    		wrap.moveTo(xy[0]+x,xy[1]+y);
    	}
    },
    syncFocusMask : function(t){
    	var focusMask = this.focusMask;
    	if(!t.moveable)return focusMask;
    	var delta = t.strokewidth/2 + 3;
		return focusMask.setStyle({'left':t.x-delta+PX,top:t.y-delta+PX}).setWidth(t.width+delta*2).setHeight(t.height+delta*2).set({title:t.info||''});
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
						sf.focusMask = new Ext.Template('<div style="-moz-user-select:none;-webkit-user-select:none;cursor:pointer;background:none;position:absolute;border:1px dashed #000;z-index:999;"></div>').insertFirst(sf.wrap.dom,{},true);
					}
					sf.syncFocusMask(t).show().on('mousedown',t.onMouseDown,t);	
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
					focusMask.hide().un('mousedown',t.onMouseDown,t);	
				}
			}
			sf.fire('blur',null,t);
			sf.focusItem = null;
    	}
    },
    startLine : function(e,t){
    	var sf = this,focusMask = sf.focusMask,
    		el = sf.getGElement(focusMask && focusMask.dom === t? sf.focusItem:t);
    	if(el){
	    	var _xy = sf.wrap.getXY();
			sf.startEl = el;
			sf.drawLinePoints = [e.getPageX() - _xy[0],e.getPageY() - _xy[1]];
			Ext.fly(DOC).on('mousemove',sf.drawLine,sf)
				.on('mouseup',sf.endLine,sf);
    	}
    },
    drawLine : function(e){
    	var sf = this,_xy = sf.wrap.getXY(),
    		x1 = sf.drawLinePoints[0], y1 = sf.drawLinePoints[1],
    		x2 = e.getPageX() - _xy[0],y2 = e.getPageY() - _xy[1],
    		dx = x2 - x1,dy = y2 - y1,d = 10,points;
		if(dx == 0){
			y2 += dy>0?-d:d;
		}else if(dy == 0){
			x2 += dx>0?-d:d;
		}else{
			var ll = Math.sqrt(dx*dx+dy*dy);
			x2 = (ll-d)/ll*dx+x1;
			y2 = (ll-d)/ll*dy+y1;
		}
		points = [x1 , ',' , y1  , ' ' , Math.round(x2) , ',' , Math.round(y2)].join('');
    	if(!sf.newline){
    		var r = sf.startEl.record,table_id = r.get(sf.tableidfield)|| r.get('table_id');
    		sf.newline = sf.dataset.create({'type':'line','config':'strokewidth:1,strokecolor:"#aaaaaa",strokeopacity:"1",titlecolor:"black",titlesize:14,titlex:0,titley:0,endarrow:"classic",points:"'+points+'",editable:true'+(Ext.isEmpty(table_id)?'':(',from:'+table_id))});
    	}else{
    		var config = convertConfig(sf.newline);
    		config.points = points;
    		sf.newline.set('config',Ext.util.JSON.encode(config));
    	}
    },
    endLine : function(e,t){
    	var sf = this;
    	Ext.fly(DOC).un('mousemove',sf.drawLine,sf)
			.un('mouseup',sf.endLine,sf);
    	if(sf.newline){
    		var el = sf.getGElement(t);
    		if(!el||el.el == sf.startEl.el||el.record == sf.newline){
    			sf.dataset.remove(sf.newline);
    		}else{
    			var r = el.record,
    				config = convertConfig(sf.newline);
	    		config.to = r.get(sf.tableidfield)|| r.get('table_id');
	    		sf.newline.set('config',Ext.util.JSON.encode(config));
	    		sf.focus($(sf.id+'_'+sf.newline.id));
	    		sf.fireEvent('drawn');
    		}
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
    	sf.clear();
    	Ext.each(sf.dataset.getAll().sort(function(a,b){
    		var at=a.get('type'),bt=b.get('type');
    		if(at == bt)return 0;
    		else if(at === 'line')return 1;
    		else return -1;
    	}),function(r){
    		if(!r.get('type')){
    			r.data['type'] = 'rect';
    			r.isNew = true;
    		}
    		sf.create(r);
    	});
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
    		type = record.get('type'),
    		x = el.x,y = el.y,
    		processConfig = pub[capitalize(type)].processConfig;
    		config.type = type,
    		_proto = pub[type == 'image'?'Image':'Path'].prototype;
    	if(processConfig && processConfig(config)==false){
    		record.set(name,ov);
    		return;
    	}
    	for(var key in el.initConfig){
    		if(key != 'dataset' && key != 'top' && key != 'root' && key != 'id'){
	    		if(!key in config)delete el[key];
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
//TODO WebKit BUG
//    	if(Ext.isWebKit){
//    		var dom = el.wrap.dom;
//    		dom.setAttribute('transform',dom.getAttribute('transform'));
//    	}
    	el.syncLineEditors(el.x - x,el.y - y);
    	if(el == sf.focusItem && sf.focusMask){
    		sf.syncFocusMask(el);
    	}
    	el.processListener('on');
    	if(el.editors && el.points){
    		var i = 0,eds = el.editors,
    			te = eds[eds.length-1],
    			bindEl = te.bindEl;
    		if(bindEl){
	    		var les = bindEl.lineEditors;
	    		les.splice(les.indexOf(te),1);
	    		delete te.bindEl;
    		}
			for(var p = el.points,l=p.length;i<l;i++){
				var ed = eds[i],p1 = p[i][0],p2 = p[i][1];
				if(ed){
					var edx = ed.x = p1-ed.width/2,
    					edy = ed.y = p2-ed.height/2;
					if(hasSVG && ed.strokewidth % 2 ==1 && el.shadow){
						edx += .5;
						edy += .5;
					}
					ed.moveTo(edx,edy);
				}else{
					el.createEditor(p1,p2);
				}
			}
			while(eds.length > i){
				var ed = eds.pop();
				ed.un('move',el.editorMove,el);
				ed.destroy();
			}
			el.bindEditor(el.to);
    	}
    	//this.focus(el);
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
			if(input == TRANSPARENT || rgba == NONE || Ext.isEmpty(alpha))return this;
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
				this.lineEditors = [];
				return pub.Path.superclass.constructor.call(this,config);
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
			initSVGWrap : function(){
				this.wrap = this.root.appendChild(newSVG('g',this.id));
			},
	    	initVMLWrap : function(){
		    	this.wrap = this.root.appendChild(newVML('v:group',this.id));
		    },
			initSVGElement : function(){
				var sf = this,
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
		    		zoom = sf.zoom;
		    	if(Ext.isEmpty(sf.strokewidth))sf.strokewidth=1;
		    	if(strokecolor==NONE||sf.strokeopacity==0||sf.strokewidth==0)stroke=false;
		    	if(fillcolor==NONE)fill=false;
		    	sf.wrap.setStyle({
		    		position:'absolute',
		    		width:100+PX,
		    		height:100+PX,
		    		left:(sf.x||0)+PX,
		    		top:(sf.y||0)+PX
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
		    	var sf = this;
		    	if(sf.editable){
					sf.editors = [];
					Ext.each(sf.points,function(point){
						sf.createEditor(point[0],point[1]);
					});
					sf.bindEditor(sf.from,true);
					sf.bindEditor(sf.to);
				}
		    },
		    bindEditor : function(id,isFrom){
		    	if(!Ext.isEmpty(id)){
			    	var eds = this.editors,
			    		top = this.top;
						tr = top.dataset.find(top.tableidfield,id);
					if(tr){
						var el = $(top.id+'_'+tr.id);
						if(el){
							var ed = eds[isFrom?0:eds.length-1];
							ed.bindEl = el;
			    			el.lineEditors.push(ed);
		    			}
					}
				}
		    },
		    syncLineEditors : function(dx,dy){
		    	Ext.each(this.lineEditors,function(ed){
					ed.moveTo(ed.x += dx,ed.y += dy);
					ed.fireEvent('move');
		    	});
		    },
		    createEditor : function(x,y){
		    	var sf = this,eds = sf.editors,i = eds.length;
		    	eds[i] = new pub.Oval({
		    		id:sf.id+'_editor'+i,
		    		x:x-5,
		    		y:y-5,
		    		height:10,
		    		width:10,
		    		strokewidth:1,
		    		strokecolor:'rgba(0,0,0,1)',
		    		fillcolor:TRANSPARENT,
		    		root:sf.root,
		    		top:sf.top,
		    		moveable:true
		    	});
		    	eds[i].on('move',sf.editorMove,sf);
		    },
		    editorMove : function(el,ds,record,x,y){
		    	var record = this.getRecord(),
					config = convertConfig(record),points=[];
				Ext.each(this.editors,function(ed){
					points.push((ed.x+5)+','+(ed.y+5));
				});
				config.points = points.join(' ');
				record.set('config',Ext.util.JSON.encode(config));
	   		},
	   		showEditors : function(){
	    		Ext.each(this.editors,function(ed){
	    			setTopCmp(ed.wrap.show());
	    		});
		    },
		    hideEditors : function(){
		    	Ext.each(this.editors,function(ed){
	    			ed.wrap.hide();
	    		});
		    },
		    clearEditors : function(){
		    	var sf = this;
		    	Ext.each(sf.editors,function(ed){
					var el = ed.bindEl;
	    			if(el && el.lineEditors){
	    				el.lineEditors.remove(ed);
	    			}
	    			ed.un('move',sf.editorMove,sf);
	    			ed.destroy();	    	
		    	});
		    	sf.editors = null;
		    },
		    onMouseDown : function(e){
		    	var sf = this,top = sf.top;
		    	if(top.editable && !top.candrawline){
		    		if(sf.dropto || sf.moveable){
				    	sf.beforeMove(e);
			    	}else if(sf.editable){
			    		setTopCmp(sf.wrap);
			    	}
		    	}
		    },
		    onMouseMove : function(e){
		    	e.stopEvent();
		    	var sf = this,
		    		wrap = sf.wrap,
		    		top = sf.top,
		    		w = sf.width||sf.rx*2,
		    		h = sf.height||sf.ry*2,
		    		graphic = top.wrap,
	    			sw = graphic.getWidth(),
	    			sh = graphic.getHeight(),
	    			stroke = sf.strokewidth||0,
		    		_xy = graphic.getXY(),
		    		tx = e.getPageX()+sf.relativeX - _xy[0],
		    		ty = e.getPageY()+sf.relativeY - _xy[1],
		    		x = sf.x,y = sf.y,_x,_y
		    		b=0;
	    		if(stroke && isVML(wrap)){
	    			b =  - stroke/2;
	    		}
	    		if(tx <= b) tx = b;
	    		else if(tx + w - b> sw - 2) tx = sw - 2 - w + b;
	    		if(ty <= b) ty = b;
	    		else if(ty + h - b> sh - 2) ty = sh - 2 - h + b;
				_x = sf.x = Math.round(tx - b);
				_y = sf.y = Math.round(ty - b);
				if(sf.moveable){
					var ds = top.dataset,
						record = ds.getCurrentRecord(),
	        			config = convertConfig(record),
	        			stroke = config.strokewidth/2;
	        		config.x = _x;
	        		config.y = _y;
	        		top.syncFocusMask(config);
	        		record.data.config=Ext.util.JSON.encode(config).replace(/^{|}$/g,'');
	        		record.dirty = true;
					sf.fireEvent('move',sf,ds,record,_x - b,_y - b);
					top.fireEvent('move',sf,ds,record,_x - b,_y - b);
				}
	    		if(isSVG(wrap)){
	    			if(stroke % 2 == 1&&!sf.shadow){
						tx += .5;
						ty += .5;
	    			}
					transform(sf.proxy,tx,ty);
				}else{
		    		sf.proxy.moveTo(tx+_xy[0],ty+_xy[1]);
				}
				sf.syncLineEditors(_x - x,_y - y);
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
		    	fm && fm.un('mousedown',sf.onMouseDown,sf).remove();
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
		Line : function(config){
			if(pub.Line.processConfig(config)==false)return;
			var line = new pub.Path(config);
			line.createEditors();
			line.hideEditors();
			return line;
		},
		Oval:function(config){
			pub.Oval.processConfig(config);
			return new pub.Path(config);
		},
		Arc:function(config){
			pub.Arc.processConfig(config);
			return new pub.Path(config);
		},
		Rect : function(config){
			pub.Rect.processConfig(config);
			return new pub.Path(config);
		},
		Diamond : function(config){
			pub.Diamond.processConfig(config);
			return new pub.Path(config);
		},
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
			var sf = this,wrap = sf.wrap,x = sf.x,y = sf.y,
				dom = (sf.el = wrap.appendChild(newSVG("image",sf.id+"_el")
					.set({x:0,y:0,width:sf.width,height:sf.height}))).dom;
	    	dom.style.cssText=encodeStyle({
	    		stroke:sf.strokecolor,
	    		'stroke-width':sf.strokewidth,
	    		'stroke-opacity':sf.strokeopacity,
	    		'-moz-user-select':NONE
	    	})+sf.style;
	    	dom.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',sf.image);
			if(x||y) transform(wrap,x,y);
	    },
	    initVMLElement : function(){
	    	var sf = this,strokecolor = sf.strokecolor;
	    	sf.el=new Ext.Template(sf.vmlTpl).append(sf.wrap.setStyle({
	    		position:'absolute',
	    		width:100+PX,
	    		height:100+PX,
	    		left:sf.x+PX,
	    		top:sf.y+PX
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
	    		'line-height':size+PX,
	    		cursor:'text'
	    	})+sf.style;
    		dom.textContent = sf.text;
	    	if(!Ext.isEmpty(rotation))transform(sf.el,null,null,null,null,rotation);
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
		    			'line-height':size+PX,
		    			'font-size':size+PX,
		    			'font-family':sf.fontfamily
		    		})+sf.style,
		    		left:sf.dx,
		    		top:sf.dy,
		    		color:sf.color||'black'
		    	},true).update(sf.text);
	    	if(!Ext.isEmpty(rotation)){
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

pub.Line.processConfig = function(config){
	var a= config.points.match(numberReg),points = [];
	if(!a)return false;
	for(var i = 0,l = a.length;i < l;i += 2){
		points.push([a[i],a[i+1]]);
	}
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
pub.Rect.processConfig=function(config){
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
pub.Oval.processConfig = function(config){
	config.height = config.height||config.ry*2;
	config.width = config.width||config.rx*2;
	config.ry = config.height/2;
	config.rx = config.width/2;
	pub.Rect.processConfig(config);
}
pub.Arc.processConfig = hasSVG?function (options) {
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
pub.Diamond.processConfig = function(config){
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
})();