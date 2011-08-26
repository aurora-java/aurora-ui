(function(){
var DOC=document,
    SVG_NS = 'http://www.w3.org/2000/svg',
    VML_NS = 'urn:schemas-microsoft-com:vml',
    XLINK_NS = 'http://www.w3.org/1999/xlink',
	hasSVG = !!DOC.createElementNS && !!DOC.createElementNS(SVG_NS, "svg").createSVGRect,
	fill = "<v:fill color='{fillColor}' opacity='{fillOpacity}'/>",
	stroke = "<v:stroke startarrow='{startArrow}' endarrow='{endArrow}' color='{strokeColor}' type='{fillType}' joinstyle='miter' weight='{strokeWidth}px' opacity='{strokeOpacity}'/>",
    pathReg = /\w|[\s\d-+.,]*/g,
    numberReg = /[\d-+.]+/g,
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
    	var tmp,style,css=[];
        if (!Ext.isObject(prop)) {
            tmp = {};
            tmp[prop] = value;
            prop = tmp;
        }
        for (style in prop) {
            value = prop[style];
            css.push(style);
            css.push(':');
            css.push(value);
            css.push(';');
        }
        return css.join('');
    },
    convertColor = function(color){
    	if(color && color.search(/rgb/i)!=-1){
    		var c ="#";
    		color.replace(/\d+/g,function(item){
    			var n = Number(item).toString(16);
    			c += (n.length == 1?"0":"") +n;
    		})
    		return c;
    	}
    	return color;
    },
    convertConfig = function(record){
    	return Ext.util.JSON.decode('{'+(record.get('config')||'').replace(/^{|}$/g,'').toLowerCase()+'}')
    },
    transform = function(){
    	var dom,values=Ext.toArray(arguments);
    	if(values.length&&Ext.isObject(values[0])){
    		var el = values.shift();
    		dom = el.dom || el;
    	}else{
	    	dom = this.wrap.dom;
    		if(!isSVG(dom)){
	    		dom = this.root.dom;
    		}
    	}
    	var transform = dom.getAttribute('transform');
    	if(!transform)transform = 'translate(0,0) scale(1,1) rotate(0,0 0)';
    	var t = transform.split('rotate');
    	dom.setAttribute('transform',(t[0].replace(/\(([-.\d]+)\)/g,'($1,$1)')+'rotate'+t[1].replace(/\(([-.\d]+)\)/,'($1,0 0)')).replace(/[-.\d]+/g,function($0){var v=values.shift();return Ext.isEmpty(v)?$0:v}))
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
		this.root = config.root;
		this.top = config.top||this;
		$A.Graphics.superclass.constructor.call(this,config);
		return this;
	},
	initComponent : function(config){ 
		$A.Graphics.superclass.initComponent.call(this,config);
		this.fillcolor = convertColor(this.fillcolor);
		this.strokecolor = convertColor(this.strokecolor);
		if(!this.wrap)this['init'+(hasSVG?'SVG':'VML')+'Wrap']();
		this['init'+(hasSVG?'SVG':'VML')+'Element']();
		if(this.title)this.setTitle(this.title);
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
    		'create',
    		'drawn'
    	)
    },
	processListener: function(ou){
		$A.Graphics.superclass.processListener.call(this,ou);
		this.wrap[ou]('click',this.onClick,this,{preventDefault:true});
		this.wrap[ou]('mouseover',this.onMouseOver,this,{preventDefault:true});
		this.wrap[ou]('mouseout',this.onMouseOut,this,{preventDefault:true});
		this.wrap[ou]('mousedown',this.onMouseDown,this);
    },
    processDataSetLiestener:function(ou){
    	ds = this.dataset;
    	if(ds){
	    	ds[ou]('load', this.onLoad, this);
	    	ds[ou]('update', this.onUpdate, this);
	    	ds[ou]('add', this.onAdd, this);
	    	ds[ou]('remove', this.onRemove, this);
	    	ds[ou]('indexchange', this.onIndexChange, this);
    	}
    },
    initSVGWrap : function(){},
    initVMLWrap : function(){},
    initSVGElement : function(){
    	var svg = newSVG("svg");
    	this.root = newSVG("g");
    	this.wrap.appendChild(svg);
    	svg.appendChild(this.root);
    },
    initVMLElement : function(){
    	if (!DOC.namespaces.hcv) {
            DOC.namespaces.add('v', VML_NS);
            DOC.createStyleSheet().cssText = 
                'v\\:roundrect,v\\:oval,v\\:image,v\\:polyline,v\\:line,v\\:group,v\\:fill,v\\:path,v\\:shape,v\\:stroke'+
                '{ behavior:url(#default#VML); display: inline-block; } ';
        }
        this.root = newVML("v:group");
        this.root.setStyle({position:'absolute',width:this.width,height:this.height})
        this.root.set({coordsize:this.width+','+this.height})
        this.wrap.appendChild(this.root);
//        this.root = this.wrap;
    },
    initProxy : function(){//alert(this.wrap.dom.innerHTML)
    	if(hasSVG){
    		var clone = this.wrap.dom.cloneNode(true);
    		clone.id = this.id + '_proxy';
    		this.proxy = Ext.get(clone);
    	}else{
    		var clone = this.wrap.dom.cloneNode(false);
    		clone.id = this.id + '_proxy';
    		this.proxy = Ext.get(clone);
    		var vml = this.wrap.dom.innerHTML.replace(/^<\?xml[^\/]*\/>/i,'').replace(/id\=([\S]*)/img,"id=$1_proxy");
    		new Ext.Template(vml).append(clone,{},true);
    	}
    	this.proxy.setStyle({'background-color':'transparent','border':'none','position':'absolute','z-index':'99999'});
    	Ext.getBody().insertFirst(this.proxy);
    },
    onMouseDown : function(e,t){
    	this.fire('mousedown',e,t);
		this.focus(t);
    	if(this.top.canDrawLine){
    		if(this.top == this){
    			this.startLine(e);
    		}
    	}else if(this.dropto||this.moveable){
	    	var xy = this.wrap.getXY();
	    	if(isSVG(this.wrap)){
	    		var _xy = this.top.wrap.getXY();
	    		xy[0] = this.x + _xy[0];
	    		xy[1] = this.y + _xy[1];
	    	}
	    	this.relativeX=xy[0]-e.getPageX();
			this.relativeY=xy[1]-e.getPageY();
			this.screenWidth = $A.getViewportWidth();
	        this.screenHeight = $A.getViewportHeight();
	    	if(this.dropto){
		    	if(!this.dropEl)
		    		this.dropEl = $(this.dropto);
		    	if(!this.proxy)
		    		this.initProxy();
		    	this.proxy.moveTo(xy[0],xy[1]);
	    	}else{
	    		this.proxy = this.wrap;
	    	}
	    	if(this.moveable)setTopCmp(this.proxy);
	    	Ext.get(document).on('mousemove',this.onMouseMove,this);
	    	Ext.get(document).on('mouseup',this.onMouseUp,this);
    	}
    },
    onMouseMove : function(e){
    	e.stopEvent();
    	var tx = e.getPageX()+this.relativeX,
    		ty = e.getPageY()+this.relativeY,
    		w = this.width||this.rx*2,
    		h = this.height||this.ry*2,
    		_xy,
    		stroke = this.strokewidth||0,
    		sl = document[Ext.isStrict&&!Ext.isWebKit?'documentElement':'body'].scrollLeft,
    		st = document[Ext.isStrict&&!Ext.isWebKit?'documentElement':'body'].scrollTop;
    	if(isSVG(this.wrap)||isVML(this.wrap)){
    		var graphic = this.top.wrap,
    			sw = graphic.getWidth(),
    			sh = graphic.getHeight(),b=0;
    		_xy = graphic.getXY();
    		tx -=  _xy[0];
    		ty -=  _xy[1];
    		if(stroke && isVML(this.wrap)){
    			b = 1 - stroke/2;
    		}
    		if(tx <= b) tx = b;
    		else if(tx + this.width - b> sw - 2) tx = sw - 2 - this.width + b;
    		if(ty <= b) ty = b;
    		else if(ty + this.height - b> sh - 2) ty = sh - 2 - this.height + b;
			this.x = tx;
			this.y = ty;
			if(this.moveable)this.fireEvent('move',this,this.dataset,tx - b,ty - b);
    		if(isSVG(this.wrap)){
    			if(stroke % 2 == 1){
					tx += 0.5;
					ty += 0.5;
    			}
				transform(this.proxy,tx,ty);
			}else{
				tx += _xy[0];
	    		ty += _xy[1];
	    		this.proxy.moveTo(tx,ty);
			}
    	}else{
	    	var sw = sl + this.screenWidth;
	    	var sh = st + this.screenHeight;
	    	if(tx < 0) tx = 0;
	    	else if((tx+w) >= sw) tx = Math.max(sw - w,0);
	    	if(ty < 0) ty = 0;
	    	else if((ty+h) >= sh) ty = Math.max(sh - h,0);
	    	if(this.moveable)this.fireEvent('move',this,this.dataset,tx,ty);
	    	this.proxy.moveTo(tx,ty);
    	}
    },
    onMouseUp : function(e){
    	Ext.get(document).un('mousemove',this.onMouseMove,this);
    	Ext.get(document).un('mouseup',this.onMouseUp,this);
    	if(this.dropto){
    		var wrap = this.dropEl.wrap,
    			xy = wrap.getXY(),
    			l = xy[0],
    			t = xy[1],
    			r = l + wrap.getWidth(),
    			b = t + wrap.getHeight(),
    			ex = e.getPageX(),
    			ey = e.getPageY();
    		if(ex >= xy[0] && ey >= xy[1] && ex <= r && ey <= b){
				this.dropEl.fireEvent('drop',this.proxy,this.dataset,ex+this.relativeX-l+(hasSVG?4:0),ey+this.relativeY-t+(hasSVG?4:0));
    		}
	    	this.proxy.moveTo(-1000,-1000);
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
    getRecord : function(){
    	var a = this.id.match(/(.*)_(\d+)(_.*)*$/),id;
    	if(a){
    		id=a[2];
	    	if(this.dataset)
	    		return this.dataset.findById(id)
    	}
    },
    fire : function(name,e,t){
    	if(!t) return;
    	var a = t.id.match(/(.*)_(\d+)(_.*)*$/),id,record;
    	if(a){
    		id = a[2];
	    	if(id){
		    	if(this.dataset)
		    		record = this.dataset.findById(id)
		    	if(a[1]){
		    		t = $(a[1]+'_'+id);
		    		this.fireEvent(name,e,t,this.dataset,record);
		    		return t;
		    	}
	    	}
    	}
    	this.fireEvent(name,e,t);
    },
    create : function(g){
    	var type = g.get('type'),config = convertConfig(g);
		config.id = this.id + "_" + g.id;
		config.dataset = this.dataset;
		if(this.renderer){
    	var fder = $A.getRenderer(this.renderer);
	        if(fder == null){
	            alert("未找到"+this.renderer+"方法!")
	            return;
	        }
	        var v = fder.call(window,g,type,config);
	        if(!Ext.isEmpty(v)){
		        if(!Ext.isObject(v)){
		        	v = '{'+String(v).replace(/^{|}$/g,'').toLowerCase()+'}';
		        }else{
		        	v = Ext.util.JSON.encode(v).toLowerCase();
		        }
		        Ext.apply(config,Ext.util.JSON.decode(v));
	        }
		}
		this.createGElement(config.type||type,config);
    },
    resizeSVG : function(){
    	if(hasSVG){
	    	var graphic = this.top.wrap;
	    	var	_xy = graphic.getXY()
	    	var sl = document[Ext.isStrict&&!Ext.isWebKit?'documentElement':'body'].scrollLeft;
	    	var st = document[Ext.isStrict&&!Ext.isWebKit?'documentElement':'body'].scrollTop;
	    	var g = this.root.dom;
	    	var svg = g.ownerSVGElement;
			var box = g.getBoundingClientRect();
			var width = box.left - _xy[0] + box.width +sl;
			var height = box.top - _xy[1] + box.height +st;
			Ext.fly(svg).set({'width':width,'height':height});
    	}
    },
    moveTo :function(x,y){
    	this.x = x;
    	this.y = y;
    	if(isSVG(this.wrap)){
    		transform(this.wrap,x,y);
    	}else{
    		var xy = this.top.wrap.getXY();
    		this.wrap.moveTo(xy[0]+x,xy[1]+y);
    	}
    },
    focus : function(t){
    	t = this.fire('focus',null,t);
    	if(t){
			if(this.focusItem)this.blur();
	    	if(t.editable){
				t.showEditor()
			}
			this.focusItem = t;
    	}else{
    		this.fireEvent('focus')
    	}
    },
    blur : function(){
    	var t = this.focusItem;
    	if(t.editable){
			t.hideEditor()
		}
		this.fire('blur',null,t);
		this.focusItem = null;
    },
    startLine : function(e){
    	var _xy = this.top.wrap.getXY();
		this.drawLinePoints = (e.getPageX() - _xy[0]) +','+(e.getPageY() - _xy[1]);
		Ext.get(document).on('mousemove',this.drawLine,this);
		Ext.get(document).on('mouseup',this.endLine,this);
    },
    drawLine : function(e){
    	var _xy = this.top.wrap.getXY();
    	var points = this.drawLinePoints + ' ' +(e.getPageX() - _xy[0]) +','+(e.getPageY() - _xy[1]);
    	if(!this.newline){
    		this.newline = this.dataset.create({'type':'line','config':'strokewidth:1,strokecolor:"#aaaaaa",strokeopacity:"1",titlecolor:"black",titlesize:14,titlex:0,titley:0,endarrow:"classic",points:"'+points+'",editable:true'});
    	}else{
    		var config = convertConfig(this.newline);
    		config.points = points;
    		this.newline.set('config',Ext.util.JSON.encode(config));
    	}
    },
    endLine : function(e){
    	if(this.newline){
    		this.focus($('_graphics_main_'+this.newline.id));
    		this.fireEvent('drawn');
    	}
    	this.drawLinePoints = null;
    	this.newline = null;
    	Ext.get(document).un('mousemove',this.drawLine,this);
		Ext.get(document).un('mouseup',this.endLine,this);
    },
    clear : function(){
    	var el = this.root.dom;
    	while(el.firstChild){
    		Ext.fly(el.firstChild).remove();
    	}
    },
    bind : function(ds){
    	this.dataset = $(ds);
    	if(this.dataset)this.processDataSetLiestener('on');
    	this.onLoad();
    },
    onLoad : function(){
    	var graphics = this.dataset.getAll();
    	graphics.sort(function(a,b){
    		var at=a.get('type'),bt=b.get('type');
    		if(at === 'line')return -1;
    		else if(bt === 'line')return 1;
    		else return 0;
    	})
    	for(var i = 0,l = graphics.length;i<l;i++){
    		this.create(graphics[i]);
    	}
    },
    onAdd : function(ds,record,index){
    	this.create(record);
    },
    onRemove : function(ds,record,index){
    	var el = $(this.id+'_'+record.id);
    	el.destroy();
    	if(el.text){
    		el.text.destroy();
    		el.text = null;
    	}
    	el.clearEditor();
    },
    onIndexChange : function(ds,record){
    	this.focus($(this.id + '_' +record.id));
    },
    onUpdate : function(ds,record, name, value,ov){
    	var el = $(this.id+'_'+record.id);
    	var config = convertConfig(record);
    	for(var key in el.initConfig){
    		if(key != 'dataset' && key != 'top' && key != 'root' && key != 'id'){
	    		if(!key in config)delete el[key];
	    		else el[key] = config[key];
    		}
    	}
    	if(el.processConfig(config)==false){
    		record.set(name,ov);
    		return;
    	}
    	el.initConfig = config;
    	el.processListener('un');
    	var dom = el.wrap.dom;
    	while(dom.firstChild){
    		Ext.fly(dom.firstChild).remove();
    	}
    	el.initComponent(config);
    	el.processListener('on');
    	if(el.editor && el.points){
    		var i = 0,eds = el.editor;
			for(p = el.points,l=p.length;i<l;i++){
				var ed = eds[i];
				if(ed){
					var rx = ed.rx,ry = ed.ry;
					ed.moveTo(p[i][0]-rx,p[i][1]-ry);
				}else{
					el.createEditor(p[i][0],p[i][1]);
				}
			}
			while(eds.length > i){
				eds.pop().destroy();
			}
    	}
    	/*var prev = Ext.fly(this.id+'_'+record.id).prev();
    	this.onRemove(null,record);
    	this.create(record);
    	if(prev){
    		if(this.title)Ext.fly(this.id+'_'+record.id+'_title').insertAfter(prev)
    		Ext.fly(this.id+'_'+record.id).insertAfter(prev)
    	}*/
    },
	createGElement : function(name,config){
		var el = new pub[capitalize(name)](Ext.apply(config,{root:Ext.get(config.root)||this.root,top:this}));
    	this.fireEvent('create',this,el,name);
    	//this.resizeSVG();
    	return el;
    },
    setTitle : function(title){
    	if(!this.text)this.text = new pub.Text({id:this.id+'_title',dx:this.titlex||0,dy:this.titley||0,color:this.titlecolor,size:this.titlesize,root:this.wrap});
    	this.text.setText(title);
    },
    destroy : function(){
    	this.wrap.remove();
    	if(this.proxy && this.proxy!=this.wrap)this.proxy.remove()
    	$A.Graphics.superclass.destroy.call(this);
    	if(this.dataset)this.processDataSetLiestener('un');
    }
});
var pub ={
	Path:Ext.extend($A.Graphics,{
		zoom:10000,
		initSVGWrap : function(){
			this.wrap = newSVG("g",this.id);
			this.root.appendChild(this.wrap);
		},
    	initVMLWrap : function(){
	    	this.wrap = newVML("v:group");
	    	this.root.appendChild(this.wrap);
	    },
		initSVGElement : function(){
			if(this.x||this.y) {
				if(this.strokewidth&&this.strokewidth%2==1)
					transform(this.wrap,this.x+0.5,this.y+0.5);
				else
					transform(this.wrap,this.x,this.y);
			}
			this.el = newSVG("path",this.id+'_el');
	    	this.el.dom.style.cssText=encodeStyle({
	    		'fill':this.fillcolor,
	    		'fill-opacity':this.fillopacity,
	    		'stroke':this.strokecolor,
	    		'stroke-width':this.strokewidth,
	    		'stroke-opacity':this.strokeopacity,
	    		'cursor':'pointer'
	    	})+this.style;
	    	var config = {};
	    	if(this.startarrow || this.endarrow){
	    		var a = this.d.match(numberReg),l = a.length;
		    	if(this.startarrow){
		    		config['marker-start']='url(#start-arrow-'+this.strokecolor+'-'+this.startarrow+'-'+(this.strokeopacity||1)*100+')';
		    		var point = this.convertArrow(Number(a[0]),y1 = Number(a[1]), x2 = Number(a[2]),y2 = Number(a[3]));
		    		this.d = this.d.replace(/[\d-+.]+\s+[\d-+.]+/,point.x+' '+point.y);
		    	}
		    	if(this.endarrow){
		    		config['marker-end']='url(#end-arrow-'+this.strokecolor+'-'+this.endarrow+'-'+(this.strokeopacity||1)*100+')';
		    		var point = this.convertArrow(Number(a[l-2]),y1 = Number(a[l-1]), x2 = Number(a[l-4]),y2 = Number(a[l-3]));
		    		this.d = this.d.replace(/([\d-+.]+\s+[\d-+.]+)[^\d]*$/,point.x+' '+point.y);
		    	}
	    		new pub.Arrow({color:this.strokecolor,width:this.strokewidth,opacity:this.strokeopacity,endarrow:this.endarrow,startarrow:this.startarrow,root:this.root})
	    	}
	    	config.d=this.d;
	    	this.el.set(config);
	    	this.wrap.appendChild(this.el);
	    },
	    initVMLElement : function(){
	    	var stroke=true,fill=true,filled=true;
	    	if(Ext.isEmpty(this.strokewidth))this.strokewidth=1;
	    	if(Ext.isEmpty(this.strokeopacity))this.strokeopacity=1;
	    	if(!this.strokecolor||this.strokecolor=='none'||this.strokeopacity==0||this.strokewidth==0)stroke=false;
	    	if(Ext.isEmpty(this.fillopacity))this.fillopacity=1;
	    	if(this.fillcolor=='none')filled=false;
	    	if(this.fillcolor=='transparent'||this.fillopacity==0)fill=false;
	        this.wrap.setStyle({position:'absolute',width:100,height:100,left:(this.x||0)+'px',top:(this.y||0)+'px'});
	        this.wrap.set({coordsize:'100,100'});
	    	this.el=new Ext.Template(this.getVmlTpl(stroke,fill,filled)).append(this.wrap.dom,{
	    		id:this.id,
	    		style:this.style,
	    		path:this.convertPath(this.d),
	    		zoom:this.zoom,
	    		fillColor:this.fillcolor||'black',
	    		fillOpacity:this.fillopacity,
	    		strokeColor:this.strokecolor == 'transparent'?'none':this.strokecolor,
	    		strokeWidth:this.strokewidth,
	    		strokeOpacity:this.strokecolor == 'transparent'?0:this.strokeopacity,
	    		endArrow:this.endarrow,
	    		startArrow:this.startarrow
	    	},true)
	    },
	    convertArrow : function(x1,y1,x2,y2){
	    	var dx = x1 - x2,dy = y1 - y2;
	    	if(dx == 0){
				y1 += dy>0?-this.strokewidth:this.strokewidth;
			}else if(dy == 0){
				x1 += dx>0?-this.strokewidth:this.strokewidth;
			}else{
				var ll = Math.sqrt(dx*dx+dy*dy);
				x1 = (ll-this.strokewidth)/ll*dx+x2;
				y1 = (ll-this.strokewidth)/ll*dy+y2;
			}
			return {x:x1,y:y1};
	    },
	    convertPath : function(p){
	    	var arr=p.match(pathReg),p1=[0,0],p2=[0,0],path=[],sf=this,
	    	f1=function(s,isC){
	    		var arr=Ext.isArray(s)?s:s.match(numberReg);
	    		for(var i=0;i<arr.length;i++){
	    			if(!isC||i/2%3==2){
	    				p2[0]+=f4(arr[i]);
	    				p2[1]+=f4(arr[++i]);
	    				path=path.concat(p2);
	    			}else{
	    				path=path.concat([p2[0]+f4(arr[i]),p2[1]+f4(arr[++i])]);
	    			}
	    		}
	    	},
	    	f2=function(s,re){
	    		var arr=s.match(numberReg);
	    		while(arr.length&&arr.length%7==0){
		    		var	rx=f4(arr.shift()),
		    			ry=f4(arr.shift()),
		    			rr=f4(arr.shift()),
		    			la=Number(arr.shift()),//是否是大角度弧线
		    			sw=Number(arr.shift()),//是否是顺时针
		    			x=f4(arr.shift()),
		    			y=f4(arr.shift()),
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
	    		return Math.floor(n*sf.zoom);
	    	},
	    	f5=function(s){
	    		for(var i=0,a=s.match(numberReg);i<a.length;i++){
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
	    	return path.join(' ');
	    },
	    createEditors : function(){
	    	if(this.editable){
				this.editor = [];
				var points = this.points;
				for(var i=0;i<points.length;i++){
					var x = points[i][0],y = points[i][1];
					this.createEditor(x,y);
				}
			}
	    },
	    createEditor : function(x,y){
	    	var i = this.editor.length;
	    	this.editor[i] = new pub.Oval({id:this.id+'_editor'+i,'x':x-5,'y':y-5,'height':10,'width':10,'strokewidth':1,'strokecolor':'black','fillopacity':0,'root':this.root,'top':this.top,'moveable':true});
			this.editor[i].on('move',this.editorMove,this);
	    },
	    editorMove : function(el,ds,x,y){
	    	var record = this.getRecord();
			var config = convertConfig(record),points="";
			for(var i=0,l=this.editor.length;i<l;i++){
				var ed = this.editor[i];
				points += (ed.x+ed.rx)+','+(ed.y+ed.ry)+" ";
			}
			config.points = points;
			record.set('config',Ext.util.JSON.encode(config));
   		},
   		showEditor : function(){
	    	if(this.editor){
	    		for(var i = 0,l = this.editor.length;i<l;i++){
	    			setTopCmp(this.editor[i].wrap);
		    		this.editor[i].wrap.show();
	    		}
	    	}
	    },
	    hideEditor : function(){
	    	if(this.editor){
	    		for(var i = 0,l = this.editor.length;i<l;i++){
	    			this.editor[i].wrap.hide();
	    		}
	    	}
	    },
	    clearEditor : function(){
	    	if(this.editor){
	    		while(this.editor.length){
	    			this.editor.pop().destroy();
	    		}
	    	}
	    },
	    getVmlTpl : function(s,f,filled){
	    	var tpl = ["<v:shape id='{id}' filled='"+filled+"' stroked='"+s+"' coordsize='{zoom},{zoom}' style='position:absolute;left:0;top:0;width:1px;height:1px;cursor:pointer;{style}' path='{path}'>"];
	    	if(f)tpl.push(fill);
	    	if(s)tpl.push(stroke);
	    	tpl.push("</v:shape>");
	    	return tpl;
	    }
	}),
	Line : function(config){
		function processConfig(config){
			var a= config.points.match(numberReg),points = [];
			if(!a)return false;
			for(var i = 0;i<a.length;i+=2){
				points.push([a[i],a[i+1]]);
			}
			if(points.length<2)return false;
			a.splice(2,0,"L");
			config.d = ["M"].concat(a).join(' ');
			if(config.strokewidth == 1)config.strokewidth = 2;
			config.fillcolor = 'none';
			config.points = points;
		}
		if(processConfig(config)==false)return;
		var line = new pub.Path(config);
		line.processConfig = processConfig;
		line.createEditors();
		return line;
	},
	Oval:function(config){
		var superProcessConfig = null;
		function processConfig(config){
			config.height = config.height||config.ry*2;
			config.width = config.width||config.rx*2;
			config.ry = config.height/2;
			config.rx = config.width/2;
			if(superProcessConfig)superProcessConfig(config);
		}
		processConfig(config);
		var oval =  new pub.Rect(config);
		superProcessConfig = oval.processConfig;
		oval.processConfig = processConfig;
		return oval;
	},
	Image : Ext.extend($A.Graphics,{
		initSVGElement : function(){
			this.wrap = newSVG("g",this.id);
			if(this.x||this.y) transform(this.wrap,this.x,this.y);
			this.el = newSVG("image",this.id+"_el");
	    	this.el.dom.style.cssText=encodeStyle({
	    		'stroke':this.strokecolor,
	    		'stroke-width':this.strokewidth,
	    		'stroke-opacity':this.strokeopacity
	    	})+this.style;
	    	this.el.dom.setAttributeNS(XLINK_NS,'xlink:href',this.src);
	    	this.el.set({x:0,y:0,width:this.width,height:this.height});
	    	this.root.appendChild(this.wrap);
	    	this.wrap.appendChild(this.el);
	    },
	    initVMLElement : function(){
	    	this.wrap = newVML("v:group");
	    	this.wrap.setStyle({position:'absolute',width:this.width,height:this.height,left:this.x+'px',top:this.y+'px'});
	        this.wrap.set({coordsize:this.width+','+this.height});
	        this.root.appendChild(this.wrap);
	    	this.wrap=new Ext.Template(this.vmlTpl).append(this.wrap.dom,{
	    		id:this.id,
	    		src:this.src,
	    		style:this.style,
	    		width:this.width,
	    		height:this.height,
	    		strokeColor:this.strokecolor||'none',
	    		strokeWidth:this.strokecolor?this.strokewidth:0,
	    		strokeOpacity:this.strokecolor?(this.strokeopacity||1):0
	    	},true)
	    },
	    vmlTpl : ["<v:image id='{id}' src='{src}' style='position:absolute;left:0;top:0;width:{width}px;height:{height}px;{style}'>",stroke,"</v:image>"]
	}),
	Rect : function(config){
		function processConfig(config){
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
		processConfig(config);
		var rect = new pub.Path(config);
		rect.processConfig = processConfig;
		return rect;
	},
	Diamond : function(config){
		function processConfig(config){
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
		processConfig(config);
		var diamond = new pub.Path(config);
		diamond.processConfig = processConfig;
		return diamond;
	},
	Text : Ext.extend($A.Graphics,{
		initSVGElement : function(){
			var strokewidth = $(this.root.id).strokewidth||0,
				size = this.size||14;
			this.wrap = newSVG("text",this.id);
	    	this.wrap.dom.style.cssText=encodeStyle({
	    		'fill':this.color,
	    		'font-size':size+'px',
	    		'line-height':size+'px',
	    		'cursor':'text'
	    	})+this.style;
	    	this.wrap.set({dx:this.dx-strokewidth+1,dy:this.dy+size-strokewidth-2});
	    	this.root.appendChild(this.wrap);
	    },
	    initVMLElement : function(){
	    	var size = this.size||14;
	    	this.wrap=new Ext.Template(this.vmlTpl).append(this.root.dom,{
	    		id:this.id,
	    		style:encodeStyle({'line-height':size+'px','font-size':size+'px'})+this.style,
	    		left:this.dx,
	    		top:this.dy,
	    		color:this.color||'black'
	    	},true)
	    },
	    setText : function(text){
	    	if(hasSVG)this.wrap.dom.textContent = text;
	    	else this.wrap.update(text);
	    },
	    vmlTpl : "<span id='{id}' style='position:absolute;left:{left}px;top:{top}px;color:{color};{style}'></span>"
	}),
	Arrow : function(config){
		var defs = config.root.child('defs');
		if(!defs){
			defs = newSVG('defs');
			config.root.insertFirst(defs);
		}
		var color = config.color||'black',opacity = config.opacity||1;
		if(config.startarrow){
			var id = 'start-arrow-'+color+'-'+config.startarrow+'-'+opacity*100;
			var marker = Ext.get(id);
			if(!marker){
				marker = newSVG('marker');
				marker.set({id:id,viewBox:'0 0 100 100',refX:40,refY:50,orient:'auto'});
				defs.appendChild(marker);
				new pub.Path({fillcolor:color,fillopacity:opacity,d:'M 100 0 L 0 50 L 100 100 L 66.66 50 z',root:marker});
			}
		}
		if(config.endarrow){
			var id = 'end-arrow-'+color+'-'+config.endarrow+'-'+opacity*100;
			var marker = Ext.get(id);
			if(!marker){
				marker = newSVG('marker');
				marker.set({id:id,viewBox:'0 0 100 100',refX:60,refY:50,orient:'auto'});
				defs.appendChild(marker);
				new pub.Path({fillcolor:color,fillopacity:opacity,d:'M 0 0 L 100 50 L 0 100 L 33.33 50 z',root:marker});
			}
		}
	}
}
})();