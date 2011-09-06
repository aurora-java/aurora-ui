/**
 * @class Aurora.TriggerField
 * @extends Aurora.TextField
 * <p>触发类组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.TriggerField = Ext.extend($A.TextField,{
	constructor: function(config) {
        $A.TriggerField.superclass.constructor.call(this, config);
    },
    initComponent : function(config){
    	$A.TriggerField.superclass.initComponent.call(this, config);
    	this.trigger = this.wrap.child('div[atype=triggerfield.trigger]'); 
    	this.initPopup();
    },
    initPopup: function(){
    	if(this.initpopuped == true) return;
    	this.popup = this.wrap.child('div[atype=triggerfield.popup]');
    	this.shadow = this.wrap.child('div[atype=triggerfield.shadow]');
    	Ext.getBody().insertFirst(this.popup);
    	Ext.getBody().insertFirst(this.shadow);
    	this.initpopuped = true
    },
    processListener: function(ou){
    	$A.TriggerField.superclass.processListener.call(this, ou);
    	this.trigger[ou]('click',this.onTriggerClick, this, {preventDefault:true})
    },
    /**
     * 判断当时弹出面板是否展开
     * @return {Boolean} isexpanded 是否展开
     */
    isExpanded : function(){ 
    	var xy = this.popup.getXY();
    	return !(xy[0]<-500||xy[1]<-500)
    },
    setWidth: function(w){
		this.wrap.setStyle("width",(w+3)+"px");
		this.el.setStyle("width",(w-20)+"px");
	},
    onFocus : function(){
    	if(this.readonly) return;
        $A.TriggerField.superclass.onFocus.call(this);
        if(!this.isExpanded())this.expand();
    },
    onBlur : function(e){
//        if(this.isEventFromComponent(e.target)) return;
//    	if(!this.isExpanded()){
	    	this.hasFocus = false;
	        this.wrap.removeClass(this.focusCss);
	        this.fireEvent("blur", this);
//    	}
    },
    onKeyDown: function(e){
		switch(e.keyCode){
    		case 9:
    		case 13:
    		case 27:if(this.isExpanded())this.collapse();break;
    		case 40:if(!this.isExpanded() && !this.readonly)this.expand();
		}
    	$A.TriggerField.superclass.onKeyDown.call(this,e);
    },
    isEventFromComponent:function(el){
    	var isfrom = $A.TriggerField.superclass.isEventFromComponent.call(this,el);
    	return isfrom || this.popup.contains(el);
    },
	destroy : function(){
		if(this.isExpanded()){
    		this.collapse();
    	}
    	this.shadow.remove();
    	this.popup.remove();
    	delete this.popup;
    	delete this.shadow;
    	$A.TriggerField.superclass.destroy.call(this);
	},
    triggerBlur : function(e){
    	if(this.popup.dom != e.target && !this.popup.contains(e.target) && !this.wrap.contains(e.target)){    		
            if(this.isExpanded()){
	    		this.collapse();
	    	}	    	
        }
    },
    setVisible : function(v){
    	$A.TriggerField.superclass.setVisible.call(this,v);
    	if(v == false && this.isExpanded()){
    		this.collapse();
    	}
    },
    /**
     * 折叠弹出面板
     */
    collapse : function(){
    	Ext.get(document.documentElement).un("mousedown", this.triggerBlur, this);
    	this.popup.moveTo(-1000,-1000);
    	this.shadow.moveTo(-1000,-1000);
    },
    /**
     * 展开弹出面板
     */
    expand : function(){
//    	Ext.get(document.documentElement).on("mousedown", this.triggerBlur, this, {delay: 10});
    	Ext.get(document.documentElement).on("mousedown", this.triggerBlur, this);
    	this.syncPopup();
    },
    syncPopup:function(){
    	var sl = document[Ext.isStrict&&!Ext.isWebKit?'documentElement':'body'].scrollLeft,
    		st = document[Ext.isStrict&&!Ext.isWebKit?'documentElement':'body'].scrollTop,
    		xy = this.wrap.getXY(),
    		_x = xy[0] - sl,
    		_y = xy[1] - st,
			W=this.popup.getWidth(),H=this.popup.getHeight(),
			PH=this.wrap.getHeight(),PW=this.wrap.getWidth(),
			BH=$A.getViewportHeight()-3,BW=$A.getViewportWidth()-3,
			x=((_x+W)>BW?((BW-W)<0?_x:(BW-W)):_x)+sl;
			y=((_y+PH+H)>BH?((_y-H)<0?(_y+PH):(_y-H)):(_y+PH))+st;
    	this.popup.moveTo(x,y);
    	this.shadow.moveTo(x+3,y+3);
    },
    onTriggerClick : function(){
    	if(this.readonly) return;
    	if(this.isExpanded()){
    		this.collapse();
    	}else{
    		this.expand();
	    	this.el.focus();
    	}
    }
});