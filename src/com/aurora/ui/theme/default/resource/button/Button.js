$A.Button = Ext.extend($A.Component,{
	disableCss:'item-btn-disabled',
	overCss:'item-btn-over',
	pressCss:'item-btn-pressed',
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
    	this.el[ou]("click", this.onClick,  this);
        this.el[ou]("mousedown", this.onMouseDown,  this);
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
    disable: function(){
    	this.wrap.addClass(this.disableCss);
    	this.el.dom.disabled = true;
    },
    enable: function(){
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
    	this.fireEvent("click", this);
    },
    onMouseOver: function(e){
    	this.wrap.addClass(this.overCss);
    },
    onMouseOut: function(e){
    	this.wrap.removeClass(this.overCss);
    }
});