/**
 * @class Aurora.Button
 * @extends Aurora.Component
 * <p>按钮组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Button = Ext.extend($A.Component,{
	disableCss:'item-btn-disabled',
	overCss:'item-btn-over',
	pressCss:'item-btn-pressed',
	disabled:false,
	constructor: function(config) {
        $A.Button.superclass.constructor.call(this, config);
    },
	initComponent : function(config){
    	$A.Button.superclass.initComponent.call(this, config);
    	this.el = this.wrap.child('button[atype=btn]');
    	if(this.hidden == true)this.setVisible(false)
    	if(this.disabled == true)this.disable();
    },
    processListener: function(ou){
    	$A.Button.superclass.processListener.call(this,ou);
    	this.wrap[ou]("click", this.onClick,  this);
        this.wrap[ou]("mousedown", this.onMouseDown,  this);
    },
    initEvents : function(){
    	$A.Button.superclass.initEvents.call(this);
    	this.addEvents(
    	/**
         * @event click
         * 鼠标点击事件.
         * @param {Aurora.Button} button 按钮对象.
         * @param {EventObject} e 键盘事件对象.
         */
    	'click');
    },    
    destroy : function(){
		$A.Button.superclass.destroy.call(this);
    	delete this.el;
    },
    /**
     * 设置按钮是否可见.
     * @param {Boolean} visiable  是否可见.
     */
    setVisible: function(v){
		if(v==true)
			this.wrap.show();
		else
			this.wrap.hide();
	},
//    destroy : function(){
//    	$A.Button.superclass.destroy.call(this);
//    	this.el.un("click", this.onClick,  this);
//    	delete this.el;
//    },
	/**
	 * 获取焦点
	 */
	focus: function(){
		if(this.disabled)return;
		this.el.dom.focus();
	},
	/**
	 * 失去焦点
	 */	
	blur : function(){
    	if(this.disabled) return;
    	this.el.dom.blur();
    },
    /**
     * 设置不可用状态
     */
    disable: function(){
    	this.disabled = true;
    	this.wrap.addClass(this.disableCss);
    	this.el.dom.disabled = true;
    },
    /**
     * 设置可用状态
     */
    enable: function(){
    	this.disabled = false;
    	this.wrap.removeClass(this.disableCss);
    	this.el.dom.disabled = false;
    },
    onMouseDown: function(e){
    	if(!this.disabled){
        	this.wrap.addClass(this.pressCss);
        	Ext.get(document.documentElement).on("mouseup", this.onMouseUp, this);
    	}
    },
    onMouseUp: function(e){
    	if(!this.disabled){
        	Ext.get(document.documentElement).un("mouseup", this.onMouseUp, this);
        	this.wrap.removeClass(this.pressCss);
    	}
    },
    onClick: function(e){
    	if(!this.disabled){
        	e.stopEvent();
        	this.fireEvent("click", this, e);
    	}
    },
    onMouseOver: function(e){
    	if(!this.disabled)
    	this.wrap.addClass(this.overCss);
        $A.Button.superclass.onMouseOver.call(this,e);
    },
    onMouseOut: function(e){
    	if(!this.disabled)
    	this.wrap.removeClass(this.overCss);
        $A.Button.superclass.onMouseOut.call(this,e);
    }
});
$A.Button.getTemplate = function(id,text,width){
    return '<TABLE class="item-btn " id="'+id+'" style="WIDTH: '+(width||60)+'px" cellSpacing="0"><TBODY><TR><TD class="item-btn-tl"><I></I></TD><TD class="item-btn-tc"></TD><TD class="item-btn-tr"><I></I></TD></TR><TR><TD class="item-btn-ml"><I></I></TD><TD class="item-btn-mc"><BUTTON hideFocus style="HEIGHT: 17px" atype="btn">'+text+'</BUTTON></TD><TD class="item-btn-mr"><I></I></TD></TR><TR><TD class="item-btn-bl"><I></I></TD><TD class="item-btn-bc"></TD><TD class="item-btn-br"><I></I></TD></TR></TBODY></TABLE><script>new Aurora.Button({"id":"'+id+'"});</script>';
}