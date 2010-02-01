Aurora.ChexkBoxGroup=Ext.extend(Aurora.Radio, {
	checkedCss:'item-checkboxgroup-img-c',
	uncheckedCss:'item-checkboxgroup-img-u',
	readonyCheckedCss:'item-checkboxgroup-img-readonly-c',
	readonlyUncheckedCss:'item-checkboxgroup-img-readonly-u',
	optionCss:'item-checkboxgroup-option',
	imgCss:'item-checkboxgroup-img',
	labelCss:'item-checkboxgroup-lb',
	value:[],
	constructor: function(config){	
		Aurora.ChexkBoxGroup.superclass.constructor.call(this,config);		
	},
	initComponent:function(config){
		Aurora.ChexkBoxGroup.superclass.initComponent.call(this, config);	
	},
	initEvents:function(){
		Aurora.ChexkBoxGroup.superclass.initEvents.call(this);					
	},	
	initStatus:function(){
		var datas = this.options.getAll(),l=datas.length;				
		for (var i = 0; i < l; i++) {
			var node=Ext.fly(this.getNode(i)).child('.'+this.imgCss);		
			node.removeClass(this.checkedCss);
			node.removeClass(this.uncheckedCss);
			node.removeClass(this.readonyCheckedCss);
			node.removeClass(this.readonlyUncheckedCss);
			var r=datas[i].data.readonly;		
			if(r===undefined)r=this.readonly;						
			if(this.value.indexOf(datas[i].data[this.valueField])!=-1){				
				r?node.addClass(this.readonyCheckedCss):node.addClass(this.checkedCss);				
			}else{
				r?node.addClass(this.readonlyUncheckedCss):node.addClass(this.uncheckedCss);		
			}
		}
	},
	onClick:function(e){
		var r=this.options.getAll()[e.target.parentNode.index].data.readonly;
		if(r===undefined)r=this.readonly;	
		if(r===false){
			var v=e.target.parentNode.value;						
			if (this.value.indexOf(v)!=-1) {	
				for(var i=0,l=this.value.length;i<l;i++){
					if(this.value[i]===v){
						this.value.splice(i,1);
						break;
					}
				}		
			}else{
				this.value.push(v);					
			}	
			this.setValue(this.value);
			this.fireEvent('click',this,v);
		}
	}	
});