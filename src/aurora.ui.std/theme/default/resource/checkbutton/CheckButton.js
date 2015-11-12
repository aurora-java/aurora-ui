/**
 * @class Aurora.CheckButton
 * @extends Aurora.Component
 * <p>可选组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.CheckButton = Ext.extend($A.Component,{
	checkedCss:'item-ckb-c',
	uncheckedCss:'item-ckb-u',
	readonyCheckedCss:'item-ckb-readonly-c',
	readonlyUncheckedCss:'item-ckb-readonly-u',
	constructor: function(config){
		config.checked = config.checked || false;
		config.readonly = config.readonly || false;
		$A.CheckButton.superclass.constructor.call(this,config);
	},
	initComponent:function(config){
		this.checkedvalue = 'Y';
		this.uncheckedvalue = 'N';
		$A.CheckButton.superclass.initComponent.call(this, config);
		this.wrap=Ext.get(this.id);
	},
	processListener: function(ou){
    	this.wrap[ou]('click',this.onClick,this);
    },
	initEvents:function(){
		$A.CheckButton.superclass.initEvents.call(this);  	
		this.addEvents(
		/**
         * @event click
         * 鼠标点击事件.
         * @param {Aurora.CheckButton} checkBox 可选组件.
         * @param {Boolean} checked 选择状态.
         */
		'click');    
	},
    onKeyDown : function(e){
    	var keyCode = e.keyCode;
    	if(keyCode == 32){
    		this.onClick.call(this,e);
    		e.stopEvent();
    	}
    },
    onMouseDown : function(e){
    	var sf = this;
    	sf.hasFocus && e.stopEvent();
    	sf.focus.defer(Ext.isIE?1:0,sf);
    },
	onClick: function(event){
		if(!this.readonly){
			this.checked = this.checked ? false : true;	
			this.setValue(this.checked);
			this.fireEvent('click', this, this.checked);
		}
	},
	setValue:function(v, silent){
		if(typeof(v)==='boolean'){
			this.checked=v?true:false;			
		}else{
			this.checked = (''+v == ''+this.checkedvalue)
		}
		this.initStatus();
		var value = this.checked==true ? this.checkedvalue : this.uncheckedvalue;		
		$A.CheckButton.superclass.setValue.call(this,value, silent);
	},
	getValue : function(){
    	var v= this.value;
		v=(v === null || v === undefined ? '' : v);
		return v;
    },
//	setReadOnly:function(b){
//		if(typeof(b)==='boolean'){
//			this.readonly=b?true:false;	
//			this.initStatus();		
//		}		
//	},
	initStatus:function(){
		this.wrap.removeClass(this.checkedCss);
		this.wrap.removeClass(this.uncheckedCss);
		this.wrap.removeClass(this.readonyCheckedCss);
		this.wrap.removeClass(this.readonlyUncheckedCss);
		if (this.readonly) {				
			this.wrap.addClass(this.checked ? this.readonyCheckedCss : this.readonlyUncheckedCss);			
		}else{
			this.wrap.addClass(this.checked ? this.checkedCss : this.uncheckedCss);
		}		
	},
	clearValue:function(){
		this.setValue(this.uncheckedvalue,true);
	}
});