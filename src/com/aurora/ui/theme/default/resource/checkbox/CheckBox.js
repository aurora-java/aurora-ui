Aurora.CheckBox = Ext.extend(Aurora.Component,{
	readOnly:false,	
	checkedCss:'item-checkbox-c',
	uncheckedCss:'item-checkbox-u',
	readonyCheckedCss:'item-checkbox-readonly-c',
	readonlyUncheckedCss:'item-checkbox-readonly-u',
	constructor: function(config){
		config.checked = config.checked || false;
		config.readonly = config.readonly || false;
		Aurora.CheckBox.superclass.constructor.call(this,config);
	},
	initComponent:function(config){
		Aurora.CheckBox.superclass.initComponent.call(this, config);
		this.wrap=Ext.get(this.id);
		this.el=this.wrap.child('div[atype=checkbox]');
	},
	initEvents:function(){
		Aurora.CheckBox.superclass.initEvents.call(this);
		this.el.on('click',function(){
			if(!this.readonly){
				this.checked=this.checked?false:true;				
				this.setValue(this.checked);
				this.fireEvent('click',this,this.checked);
			}
		},this);  	
		this.addEvents('click');    
	},
	setValue:function(v, silent){
		if(typeof(v)==='boolean'){
			this.checked=v?true:false;			
		}else{
			this.checked= v===this.checkValue ? true: false;
		}
		this.initStatus();
		var value =this.checked==true?this.checkValue:this.unCheckValue;		
		Aurora.CheckBox.superclass.setValue.call(this,value, silent);
		this.wrap.child('input[type=hidden]').dom.value=this.value;
	},
	setReadOnly:function(b){
		if(typeof(b)==='boolean'){
			this.readonly=b?true:false;	
			this.initStatus();		
		}		
	},
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