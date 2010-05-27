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
    	if(this.hidden == true){
    		this.setVisible(false)
    	}
    },
    processListener: function(ou){
    	$A.Button.superclass.processListener.call(this,ou);
    	this.wrap[ou]("click", this.onClick,  this);
        this.wrap[ou]("mousedown", this.onMouseDown,  this);
    },
    initEvents : function(){
    	$A.Button.superclass.initEvents.call(this);
    	this.addEvents('click');
    },    
    destroy : function(){
		$A.Button.superclass.destroy.call(this);
    	delete this.el;
    },
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
	focus: function(){
		if(this.disabled)return;
		this.el.dom.focus();
	},
	blur : function(){
    	if(this.disabled) return;
    	this.el.dom.blur();
    },
    disable: function(){
    	this.disabled = true;
    	this.wrap.addClass(this.disableCss);
    	this.el.dom.disabled = true;
    },
    enable: function(){
    	this.disabled = false;
    	this.wrap.removeClass(this.disableCss);
    	this.el.dom.disabled = false;
    },
    onMouseDown: function(e){
    	this.wrap.addClass(this.pressCss);
    	Ext.get(document.documentElement).on("mouseup", this.onMouseUp, this);
    },
    onMouseUp: function(e){
    	Ext.get(document.documentElement).un("mouseup", this.onMouseUp, this);
    	this.wrap.removeClass(this.pressCss);
    },
    onClick: function(e){
    	e.stopEvent();
    	this.fireEvent("click", this);
    },
    onMouseOver: function(e){
    	this.wrap.addClass(this.overCss);
    },
    onMouseOut: function(e){
    	this.wrap.removeClass(this.overCss);
    }
});
$A.Button.getTemplate = function(id,text,width){
    return '<TABLE class="item-btn " id="'+id+'" style="WIDTH: '+(width||60)+'px" cellSpacing="0"><TBODY><TR><TD class="item-btn-tl"><I></I></TD><TD class="item-btn-tc"></TD><TD class="item-btn-tr"><I></I></TD></TR><TR><TD class="item-btn-ml"><I></I></TD><TD class="item-btn-mc"><BUTTON hideFocus style="HEIGHT: 17px" atype="btn">'+text+'</BUTTON></TD><TD class="item-btn-mr"><I></I></TD></TR><TR><TD class="item-btn-bl"><I></I></TD><TD class="item-btn-bc"></TD><TD class="item-btn-br"><I></I></TD></TR></TBODY></TABLE><script>new Aurora.Button({"id":"'+id+'"});</script>';
}