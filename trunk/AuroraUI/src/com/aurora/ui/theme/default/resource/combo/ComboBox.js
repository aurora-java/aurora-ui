Aurora.ComboBox = Ext.extend(Aurora.TriggerField, {	
	maxHeight:200,
	blankOption:true,
	rendered:false,
	selectedClass:'item-comboBox-selected',	
	currentNodeClass:'item-comboBox-current',
	constructor : function(config) {
		Aurora.ComboBox.superclass.constructor.call(this, config);		
	},
	initComponent:function(config){
		Aurora.ComboBox.superclass.initComponent.call(this, config);
		//if(config.options) 
		this.setOptions(config.options);		
	},
	initEvents:function(){
		Aurora.ComboBox.superclass.initEvents.call(this);
		this.addEvents('select');
	},
	onTriggerClick : function() {
		this.doQuery('',true);
		Aurora.ComboBox.superclass.onTriggerClick.call(this);		
	},
	onBlur : function(){
		Aurora.ComboBox.superclass.onBlur.call(this);
		if(!this.isExpanded()) {
			var raw = this.getRawValue();
			var record = this.getRecordByDisplay(raw);
			if(record != null){
				this.setValue(record.get(this.valuefield));
			}else {
				this.setValue('');
			}
		}
    },
    getRecordByDisplay: function(name){
    	if(!this.optionDataSet)return null;
    	var datas = this.optionDataSet.getAll();
		var l=datas.length;
		var record = null;
		for(var i=0;i<l;i++){
			var r = datas[i];
			var d = r.get(this.displayfield);
			if(d == name){
				record = r;
				break;
			}
		}
		return record;
    },
	expand:function(){
		if(!this.optionDataSet)return;
		if(this.rendered===false)this.initQuery();
		this.popup.setStyle('width',this.wrap.getStyle('width'));
		Aurora.ComboBox.superclass.expand.call(this);
		var v=this.getValue();
		this.currentIndex = this.getIndex(v);
		if(!this.currentIndex) return;
		if (!Ext.isEmpty(v)) {				
			if(this.selectedIndex)Ext.fly(this.getNode(this.selectedIndex)).removeClass(this.selectedClass);
			Ext.fly(this.getNode(this.currentIndex)).addClass(this.currentNodeClass);
			this.selectedIndex = this.currentIndex;
		}		
	},
	collapse:function(){
		Aurora.ComboBox.superclass.collapse.call(this);
		if(this.currentIndex!==undefined)
		Ext.fly(this.getNode(this.currentIndex)).removeClass(this.currentNodeClass);		
	},
	setOptions : function(name){
		var ds = name
		if(typeof(name)==='string'){
			ds = $(name);
		}
		if(this.currentOptions != ds){
			this.optionDataSet = ds;
			this.rendered = false;
			this.currentOptions = ds;
		}
		if(!Ext.isEmpty(this.value))this.setValue(this.value, true)
	},
	onRender:function(){			
        if(!this.view){
        	this.popup.update('<ul></ul>');
			this.view=this.popup.child('ul');
			this.view.on('click', this.onViewClick,this);
//			this.view.on('mouseover',this.onViewOver,this);
			this.view.on('mousemove',this.onViewMove,this);
        }
        
        if(this.rendered===false && this.optionDataSet){
			this.initList();
			var l = this.optionDataSet.getAll().length;
			var widthArray = [];
			for(var i=0;i<l;i++){
				var li=this.view.dom.childNodes[i];
				var width=Aurora.TextMetrics.measure(li,li.innerHTML).width;
				widthArray.push(width);
			}		
			if(l==0){				
//				this.popup.setHeight(this.miniHeight);
//				this.popup.setWidth(this.wrap.getWidth());
			}else{
				widthArray=widthArray.sort(function(a,b){return a-b});
				var maxWdith=widthArray[l-1]+20;			
				this.popup.setWidth(Math.max(this.wrap.getWidth(),maxWdith));
				if(this.popup.getHeight()>this.maxHeight){				
					this.popup.setHeight(this.maxHeight);
				}
				var w = this.popup.getWidth();
		    	var h = this.popup.getHeight();
		    	this.shadow.setWidth(w);
		    	this.shadow.setHeight(h);
			}
			this.rendered = true;
		}       
	},
	onViewClick:function(e,t){
		if(t.tagName!='LI'){
		    return;
		}		
		this.onSelect(t);
		this.collapse();		
	},	
	onViewOver:function(e,t){
		this.inKeyMode = false;
	},
	onViewMove:function(e,t){
		if(this.inKeyMode){ // prevent key nav and mouse over conflicts
            return;
        }
        var index = t.tabIndex;        
        this.selectItem(index);        
	},
	onSelect:function(target){
//		var value =target.attributes['itemValue'].value;
		var index = target.tabIndex
		var value = this.optionDataSet.getAt(index).get(this.valuefield);
		this.setValue(value);
		this.fireEvent('select',this, value);
//		this.focus()
	},
	initQuery:function(){//事件定义中调用
		this.doQuery(this.getText());
	},
	doQuery : function(q,forceAll) {		
		if(q === undefined || q === null){
			q = '';
	    }		
//		if(forceAll){
//            this.store.clearFilter();
//        }else{
//            this.store.filter(this.displayField, q);
//        }
        
		//值过滤先不添加
		this.onRender();	
	},
	initList: function(){	
		this.refresh();
		this.litp=new Ext.Template('<li tabIndex="{index}" itemValue="{'+this.valuefield+'}">{'+this.displayfield+'}&#160;</li>');
		var datas = this.optionDataSet.getAll();
		var l=datas.length;
		var sb = [];
		for(var i=0;i<l;i++){
			var d = Ext.apply(datas[i].data, {index:i})
			sb.add(this.litp.applyTemplate(d));	//等数据源明确以后再修改		
		}
		if(l!=0){
			this.view.update(sb.join(''));			
		}
	},
	refresh:function(){
		this.view.update('');
		this.selectedIndex = null;
	},
	selectItem:function(index){
		if(Ext.isEmpty(index)){
			return;
		}	
		var node = this.getNode(index);			
		if(node.tabIndex!=this.selectedIndex){
			if(!Ext.isEmpty(this.selectedIndex)){							
				Ext.fly(this.getNode(this.selectedIndex)).removeClass(this.selectedClass);
			}
			this.selectedIndex=node.tabIndex;			
			Ext.fly(node).addClass(this.selectedClass);					
		}			
	},
	getNode:function(index){		
		return this.view.dom.childNodes[index];
	},	
	destroy : function(){
		if(this.view){
			this.view.un('click', this.onViewClick,this);
			this.view.un('mouseover',this.onViewOver,this);
			this.view.un('mousemove',this.onViewMove,this);
		}
		delete this.view;
    	Aurora.ComboBox.superclass.destroy.call(this);
	},
	getText : function() {		
		return this.text;
	},
	processValue : function(rv){
		var r = this.optionDataSet == null ? null : this.optionDataSet.find(this.displayfield, rv);
		if(r != null){
			return r.get(this.valuefield);
		}else{
			return this.value;
		}
	},
	formatValue : function(){
		var v = this.getValue();
		var r = this.optionDataSet == null ? null : this.optionDataSet.find(this.valuefield, v);
		this.text = '';
		if(r != null){
			this.text = r.get(this.displayfield);
		}else{
//			this.text = v;
		}
		return this.text;
	},
//	setValue:function(v,silent){
//        Aurora.ComboBox.superclass.setValue.call(this, v, silent);
//	},
	getIndex:function(v){
		var datas = this.optionDataSet.getAll();		
		var l=datas.length;
		for(var i=0;i<l;i++){
			if(datas[i].data[this.valuefield]==v){				
				return i;
			}
		}
	}
});