/**
 * @class Aurora.CheckBox
 * @extends Aurora.Component
 * <p>可选组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.CheckBox = Ext.extend($A.Component,{
	checkedCss:'item-ckb-c',
	uncheckedCss:'item-ckb-u',
	readonyCheckedCss:'item-ckb-readonly-c',
	readonlyUncheckedCss:'item-ckb-readonly-u',
	constructor: function(config){
		config.checked = config.checked || false;
		config.readonly = config.readonly || false;
		$A.CheckBox.superclass.constructor.call(this,config);
	},
	initComponent:function(config){
		this.checkedvalue = 'Y';
		this.uncheckedvalue = 'N';
		$A.CheckBox.superclass.initComponent.call(this, config);
		this.wrap=Ext.get(this.id);
		this.el=this.wrap.child('div[atype=checkbox]');
	},
	processListener: function(ou){
    	this.wrap[ou]('click',this.onClick,this);
    	this.el[ou]('keydown',this.onKeyDown,this);
    	this.el[ou]('focus',this.onFocus,this)
    	this.el[ou]('blur',this.onBlur,this)
    },
	initEvents:function(){
		$A.CheckBox.superclass.initEvents.call(this);  	
		this.addEvents(
		/**
         * @event click
         * 鼠标点击事件.
         * @param {Aurora.CheckBox} checkBox 可选组件.
         * @param {Boolean} checked 选择状态.
         */
		'click');    
	},
	destroy : function(){
    	$A.CheckBox.superclass.destroy.call(this);
    	delete this.el;
    },
    onKeyDown : function(e){
    	var keyCode = e.keyCode;
    	if(keyCode == 13){
    		this.onClick.call(this,e)
    	}
    },
	onClick: function(event){
		if(!this.readonly){
			this.checked = this.checked ? false : true;	
			this.setValue(this.checked);
			this.fireEvent('click', this, this.checked);
			this.onFocus();
		}
	},
	focus : function(){
		this.el.focus();
	},
	onFocus : function(){
		this.el.setStyle('outline','1px dotted blue')
		this.fireEvent('focus',this);
	},
	onBlur : function(){
		this.el.setStyle('outline','none')
		this.fireEvent('blur',this);
	},
	setValue:function(v, silent){
		if(typeof(v)==='boolean'){
			this.checked=v?true:false;			
		}else{
			this.checked = (''+v == ''+this.checkedvalue)
//			this.checked = v === this.checkedvalue ? true : false;
		}
		this.initStatus();
		var value = this.checked==true ? this.checkedvalue : this.uncheckedvalue;		
		$A.CheckBox.superclass.setValue.call(this,value, silent);
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
		this.el.removeClass(this.checkedCss);
		this.el.removeClass(this.uncheckedCss);
		this.el.removeClass(this.readonyCheckedCss);
		this.el.removeClass(this.readonlyUncheckedCss);
		if (this.readonly) {				
			this.el.addClass(this.checked ? this.readonyCheckedCss : this.readonlyUncheckedCss);			
		}else{
			this.el.addClass(this.checked ? this.checkedCss : this.uncheckedCss);
		}		
	}			
});