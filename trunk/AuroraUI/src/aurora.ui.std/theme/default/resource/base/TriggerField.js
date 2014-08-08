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
    	this.popupContent = this.popup.child('div.item-popup-content');
    	Ext.isIE && new Ext.Template('<div class="item-ie-shadow"></div>').insertFirst(this.popup,{});
//    	this.shadow = this.wrap.child('div[atype=triggerfield.shadow]');
    	Ext.getBody().insertFirst(this.popup);
//    	Ext.getBody().insertFirst(this.shadow);
    	this.initpopuped = true
    },
    initEvents:function(){
		$A.TriggerField.superclass.initEvents.call(this);
		this.addEvents(
		/**
         * @event expand
         * 展开事件.
         * @param {Aurora.TriggerField} triggerField 所有可展开控件对象.
         */
		'expand',
		/**
         * @event collapse
         * 收缩事件.
         * @param {Aurora.TriggerField} triggerField 所有可展开控件对象.
         */
		'collapse'
		);
	},
    processListener: function(ou){
    	$A.TriggerField.superclass.processListener.call(this, ou);
    	this.trigger[ou]('click',this.onTriggerClick, this, {preventDefault:true})
    	this.popup[ou]('click',this.onPopupClick, this,{stopPropagation:true})
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
		//this.el.setStyle("width",(w-20)+"px");
	},
	onPopupClick : function(){
		this.hasExpanded = true;
		this.el.focus();	
	},
    onFocus : function(){
        $A.TriggerField.superclass.onFocus.call(this);
        if(!this.readonly && !this.isExpanded() && !this.hasExpanded)this.expand();
        this.hasExpanded = false;
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
    	return $A.TriggerField.superclass.isEventFromComponent.call(this,el) || this.popup.dom == el || this.popup.contains(el);
    },
	destroy : function(){
		if(this.isExpanded()){
    		this.collapse();
    	}
//    	this.shadow.remove();
//    	this.popup.remove();
    	$A.TriggerField.superclass.destroy.call(this);
    	delete this.popup;
    	delete this.popupContent;
//    	delete this.shadow;
	},
    triggerBlur : function(e,t){
    	if(!this.isEventFromComponent(t)){    		
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
//    	this.shadow.moveTo(-1000,-1000);
    	this.fireEvent("collapse", this);
    },
    /**
     * 展开弹出面板
     */
    expand : function(){
//    	Ext.get(document.documentElement).on("mousedown", this.triggerBlur, this, {delay: 10});
        //对于某些行上的cb，如果是二级关联的情况下，会expand多次，导致多次绑定事件
        Ext.get(document.documentElement).un("mousedown", this.triggerBlur, this);
    	Ext.get(document.documentElement).on("mousedown", this.triggerBlur, this);
    	this.syncPopup();
    	this.fireEvent("expand", this);
    },
    syncPopup:function(){
    	var sf = this,
    		wrap = sf.wrap,
    		popup = sf.popup,
    		scroll = Ext.getBody().getScroll(),
    		sl = scroll.left,
    		st = scroll.top,
    		xy = wrap.getXY(),
    		_x = xy[0] - sl,
    		_y = xy[1] - st,
			W=popup.getWidth(),
			H=popup.getHeight(),
			PH=wrap.getHeight(),
			PW=wrap.getWidth(),
			BH=$A.getViewportHeight()-3,
			BW=$A.getViewportWidth()-3,
			x=((_x+W)>BW?((BW-W)<0?_x:(BW-W)):_x)+sl;
			y=((_y+PH+H)>BH?((_y-H)<0?(_y+PH):(_y-H)):(_y+PH))+st;
    	popup.moveTo(x,y);
//    	sf.shadow.moveTo(x+3,y+3);
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