Aurora.RadioGroup = Ext.extend(Aurora.Component, {	
	readOnly:false,
	orientation:'horizontal',	
	checkedCss:'item-radio-img-c',
	uncheckedCss:'item-radio-img-u',
	readonyCheckedCss:'item-radio-img-readonly-c',
	readonlyUncheckedCss:'item-radio-img-readonly-u',
	optionCss:'item-radio-option',
	imgCss:'item-radio-img',
	labelCss:'item-radio-lb',
	constructor: function(config){
		config.checked = config.checked || false;
		config.readonly = config.readonly || false;
		this.el=new Ext.Element(document.createElement('div'));
		Aurora.RadioGroup.superclass.constructor.call(this,config);		
	},
	initComponent:function(config){
		Aurora.RadioGroup.superclass.initComponent.call(this, config);
		this.wrap=Ext.get(this.id);
		if (config.options) {
			this.setOptions(config.options);
			this.setOrientation(this.orientation);
			this.initStatus();
		}	
	},	
	initEvents:function(){
		Aurora.RadioGroup.superclass.initEvents.call(this);
		this.el.on('click',this.onClick,this);  	
		this.addEvents('click');    
	},
	setOptions:function(o){
		if(typeof(o)==='string'){
			this.options=window[o];
		}
		this.initOption();
		if(!Ext.isEmpty(this.value))this.setValue(this.value, true);
	},
	setOrientation:function(orientation){
		var o=this.el.child('.'+this.optionCss);		
		orientation==='horizontal'?o.setStyle('float','left'):o.setStyle('float','none');
	},
	initOption:function(){
		this.el.update('');		
		this.otp=new Ext.Template(
	    '<div class="'+this.optionCss+'" value="{'+this.valueField+'}" index={index}>'+                    		
        	'<div class="'+this.imgCss+'"></div>'+
			'<label class="'+this.labelCss+'">{'+this.displayField+'}</label>'+
        '</div>');		
		var datas = this.options.getAll(), l = datas.length;
		for (var i = 0; i < l; i++) {
			var d = Ext.apply(datas[i].data, {
				index: i
			});
			this.otp.append(this.el, d);
		}
		if (l != 0) {
			this.el.appendTo(this.wrap);
		}		
	},
	setValue:function(value,silent){//debugger;
		this.value=value;
		this.initStatus();
		Aurora.RadioGroup.superclass.setValue.call(this,value, silent);
	},
	getNode:function(index){		
		return this.el.dom.childNodes[index];
	},
	setReadOnly:function(b){
		if(typeof(b)==='boolean'){
			this.readonly=b?true:false;	
			this.initStatus();		
		}
	},
	initStatus:function(){
		var datas = this.options.getAll(),l=datas.length;				
		for (var i = 0; i < l; i++) {
			var node=Ext.fly(this.getNode(i)).child('.'+this.imgCss);		
			node.removeClass(this.checkedCss);
			node.removeClass(this.uncheckedCss);
			node.removeClass(this.readonyCheckedCss);
			node.removeClass(this.readonlyUncheckedCss);			
			if(datas[i].data[this.valueField]===this.value){
				this.readonly?node.addClass(this.readonyCheckedCss):node.addClass(this.checkedCss);				
			}else{
				this.readonly?node.addClass(this.readonlyUncheckedCss):node.addClass(this.uncheckedCss);		
			}
		}
	},
	onClick:function(e){
		if(!this.readonly){
			var v=e.target.parentNode.value
			this.setValue(v);
			this.fireEvent('click',this,v);
		}		
	}	
});