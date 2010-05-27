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
    	this.wrap[ou]("keydown", this.onKeyDown, this);
    },
    focus : function(){
    	this.wrap.focus();
    },
    onKeyDown:function(e){
        this.fireEvent('keydown', this, e);
        var keyCode = e.keyCode;
        if(keyCode == 13)  {
            var sf = this;
            setTimeout(function(){
                sf.fireEvent('enterdown', sf, e)
            },5);
        }else if(keyCode==40){
            var vi = this.getValueItem();
            var i = this.options.indexOf(vi);
            if(i+1 < this.options.length){
                var v = this.options[i+1]['value'];
                this.setValue(v)
            }
        }else if(keyCode==38){
            var vi = this.getValueItem();
            var i = this.options.indexOf(vi);
            if(i-1 >=0){
                var v = this.options[i-1]['value'];
                this.setValue(v)
            }
        }
    },
	initEvents:function(){
		$A.Radio.superclass.initEvents.call(this); 	
		this.addEvents('click','keydown','enterdown');    
	},
	setValue:function(value,silent){
		this.value = value;
		this.initStatus();
		$A.Radio.superclass.setValue.call(this,value, silent);
		this.focus();
	},
	getItem: function(){
		var item = this.getValueItem();
		if(item!=null){
            item = new $A.Record(item);
		}
		return item;
	},
	getValueItem: function(){
	   var v = this.getValue();
	   var l = this.options.length;
	   var r = null;
	   for(var i=0;i<l;i++){
	       var o = this.options[i];
	       if(o['value']==v){
	           r = o;
	           break;
	       }
	   }	   
	   return r;
	},
	getValue : function(){
    	var v = this.value;
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
	getItemValue:function(i){
	   var node = Ext.fly(this.nodes[i]);
	   if(!node)return null;
	   var v = node.getAttributeNS("","itemvalue");
	   return v;
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