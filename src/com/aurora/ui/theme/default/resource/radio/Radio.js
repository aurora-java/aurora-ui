$A.Radio = Ext.extend($A.Component, {
	checkedCss:'item-radio-img-c',
	uncheckedCss:'item-radio-img-u',
	readonyCheckedCss:'item-radio-img-readonly-c',
	readonlyUncheckedCss:'item-radio-img-readonly-u',
//	optionCss:'item-radio-option',
	imgCss:'item-radio-img',
	constructor: function(config){
		config.checked = config.checked || false;
		config.readonly = config.readonly || false;
		$A.Radio.superclass.constructor.call(this,config);		
	},
	initComponent:function(config){
		$A.Radio.superclass.initComponent.call(this, config);
		this.wrap=Ext.get(this.id);	
		this.nodes = Ext.DomQuery.select('.item-radio-option',this.wrap.dom);
	},	
	processListener: function(ou){
    	this.wrap[ou]('click',this.onClick,this);
    },
	initEvents:function(){
		$A.Radio.superclass.initEvents.call(this); 	
		this.addEvents('click');    
	},
	setValue:function(value,silent){
		this.value = value;
		this.initStatus();
		$A.Radio.superclass.setValue.call(this,value, silent);
	},
	getValue : function(){
    	var v= this.value;
		v=(v === null || v === undefined ? '' : v);
		return v;
    },
	setReadOnly:function(b){
		if(typeof(b)==='boolean'){
			this.readonly=b?true:false;	
			this.initStatus();		
		}
	},
	initStatus:function(){
		var l=this.nodes.length;
		for (var i = 0; i < l; i++) {
			var node=Ext.fly(this.nodes[i]).child('.'+this.imgCss);		
			node.removeClass(this.checkedCss);
			node.removeClass(this.uncheckedCss);
			node.removeClass(this.readonyCheckedCss);
			node.removeClass(this.readonlyUncheckedCss);
			var value = Ext.fly(this.nodes[i]).getAttributeNS("","itemvalue");
			if((i==0 && this.value == '') || value === this.value){
				this.readonly?node.addClass(this.readonyCheckedCss):node.addClass(this.checkedCss);				
			}else{
				this.readonly?node.addClass(this.readonlyUncheckedCss):node.addClass(this.uncheckedCss);		
			}
		}
	},
	onClick:function(e) {
		if(!this.readonly){
			var l=this.nodes.length;
			for (var i = 0; i < l; i++) {
				var node = Ext.fly(this.nodes[i]);
				if(node.contains(e.target)){
					var v = node.getAttributeNS("","itemvalue");
					this.setValue(v);
					this.fireEvent('click',this,v);
					break;
				}
			}
			
		}		
	}	
});