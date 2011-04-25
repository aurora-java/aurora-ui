(function(){
var DOC=document;
    SVG_NS = 'http://www.w3.org/2000/svg',
	hasSVG = !!DOC.createElementNS && !!DOC.createElementNS(SVG_NS, "svg").createSVGRect,
    firstUp = function(w){
    	return w.toLowerCase().replace(/^\S/,w.toUpperCase().charAt(0));
    },
    newSVG = function(tag){
    	return Ext.get(DOC.createElementNS(SVG_NS, tag));
    },
    newVML = function(vml){
    	return Ext.get(DOC.createElement(vml));
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
    }

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
		this.root=config.root;
		$A.Graphics.superclass.constructor.call(this,config);
		return this;
	},
	initComponent : function(config){ 
		$A.Graphics.superclass.initComponent.call(this,config);
		this['init'+(hasSVG?'SVG':'VML')+'Element']();
    },
    initEvents : function(){
    	$A.Graphics.superclass.initEvents.call(this);
    	this.addEvents(
	    	/**
	         * @event click
	         * 单击事件.
	         * @param {Aurora.Tab} obj 组件对象.
	         */
    		'click'
    	)
    },
	processListener: function(ou){
		$A.Graphics.superclass.processListener.call(this,ou);
		this.wrap[ou]('click',this.onClick,this,{preventDefault:true});
    },
    initSVGElement : function(){
    	this.root = newSVG("svg");
    	this.wrap.dom.appendChild(this.root.dom);
    },
    initVMLElement : function(){
    	if (!DOC.namespaces.hcv) {
            DOC.namespaces.add('v', 'urn:schemas-microsoft-com:vml');
            DOC.createStyleSheet().cssText = 
                'v\\:rect,v\\:oval,v\\:image,v\\:polyline,v\\:line,v\\:group,v\\:fill,v\\:path,v\\:shape,v\\:stroke'+
                '{ behavior:url(#default#VML); display: inline-block; } ';
        }
        this.root = newVML("v:group");
        this.root.setStyle({position:'relative',width:'100%',height:'100%'})
        this.root.set({coordsize:this.width+','+this.height})
        this.wrap.dom.appendChild(this.root.dom);
    },
    onClick : function(e){
    	this.fireEvent('click',this,e);
    },
	createGElement : function(name,config){
    	new $A[firstUp(name)](Ext.apply(config,{root:Ext.get(config.root)||this.root}));
    	return this;
    }
});


$A.Line=Ext.extend($A.Graphics,{
	initSVGElement : function(){
		this.wrap = newSVG("line");
    	this.wrap.dom.style.cssText=encodeStyle({
    		'stroke':this.strokecolor,
    		'stroke-width':this.strokewidth
    	})+this.style;
    	this.wrap.set({x1:this.x1,x2:this.x2,y1:this.y1,y2:this.y2})
    	this.root.appendChild(this.wrap);
    },
    initVMLElement : function(){
    	this.wrap=new Ext.Template(this.vmlLine).append(this.root.dom,{
    		style:this.style,
    		from:this.x1+','+this.y1,
    		to:this.x2+','+this.y2,
    		strokeColor:this.strokecolor||'none',
    		strokeWidth:this.strokewidth,
    		strokeOpacity:this.strokeopacity||1
    	},true)
    },
    vmlLine : ["<v:line style='{style}' from='{from}' to='{to}'>",
    	"<v:stroke color='{strokeColor}'  weight='{strokeWidth}px' opacity='{strokeOpacity}'/>",
    "</v:line>"]
});	

$A.Polyline=Ext.extend($A.Graphics,{
	initSVGElement : function(){
		this.wrap = newSVG("polyline");
    	this.wrap.dom.style.cssText=encodeStyle({
    		'fill':(this.fillcolor||'none'),
    		'fill-opacity':this.fillopacity,
    		'stroke':this.strokecolor,
    		'stroke-width':this.strokewidth,
    		'stroke-opacity':this.strokeopacity
    	})+this.style;
    	this.wrap.set({points:this.points})
    	this.root.appendChild(this.wrap);
    },
    initVMLElement : function(){
    	this.wrap=new Ext.Template(this.vmlLine).append(this.root.dom,{
    		style:this.style,
    		points:this.points,
    		fillColor:this.fillcolor||'none',
    		fillOpacity:this.fillopacity||'1',
    		strokeColor:this.strokecolor||'none',
    		strokeWidth:this.strokewidth,
    		strokeOpacity:this.strokeopacity||1
    	},true)
    },
    vmlLine : ["<v:polyline style='{style}' points='{points}'>",
    "<v:fill color='{fillColor}' opacity='{fillOpacity}'/>",
    "<v:stroke color='{strokeColor}' joinstyle='miter' weight='{strokeWidth}px' opacity='{strokeOpacity}'/>",
    "</v:polyline>"]
});	

$A.Oval=Ext.extend($A.Graphics,{
	initSVGElement : function(){
		this.wrap = newSVG("ellipse");
    	this.wrap.dom.style.cssText=encodeStyle({
    		'fill':this.fillcolor,
    		'fill-opacity':this.fillopacity,
    		'stroke':this.strokecolor,
    		'stroke-width':this.strokewidth,
    		'stroke-opacity':this.strokeopacity
    	})+this.style;
    	this.wrap.set({cx:this.cx,cy:this.cy,rx:this.rx,ry:this.ry});
    	this.root.appendChild(this.wrap);
    },
    initVMLElement : function(){
    	this.wrap=new Ext.Template(this.vmlLine).append(this.root.dom,{
    		style:this.style,
    		left:this.cx-this.rx,
    		top:this.cy-this.ry,
    		width:2*this.rx,
    		height:2*this.ry,
    		fillColor:this.fillcolor||'black',
    		fillOpacity:this.fillopacity||'1',
    		strokeColor:this.strokecolor||'none',
    		strokeWidth:this.strokewidth,
    		strokeOpacity:this.strokeopacity||1
    	},true)
    },
    vmlLine : ["<v:oval style='left:{left}px;top:{top}px;width:{width}px;height:{height}px;{style}'>",
    "<v:fill color='{fillColor}' opacity='{fillOpacity}'/>",
    "<v:stroke color='{strokeColor}' weight='{strokeWidth}px' opacity='{strokeOpacity}'/>",
    "</v:oval>"]
});	

})();