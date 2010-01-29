$A.ComboBox = Ext.extend($A.TriggerField, {	
	maxHeight:200,
	blankOption:true,
	rendered:false,
	selectedClass:'item-comboBox-selected',	
	currentNodeClass:'item-comboBox-current',
	constructor : function(config) {
		$A.ComboBox.superclass.constructor.call(this, config);		
	},
	initComponent:function(config){
		$A.ComboBox.superclass.initComponent.call(this, config);
		if(config.options) this.setOptions(config.options);		
	},
	initEvents:function(){
		$A.ComboBox.superclass.initEvents.call(this);
		this.addEvents('select');
	},
	onTriggerClick : function() {
		this.doQuery('',true);
		$A.ComboBox.superclass.onTriggerClick.call(this);		
	},
	onBlur : function(){
		$A.ComboBox.superclass.onBlur.call(this);
		if(!this.isExpanded()) {
			var raw = this.getRawValue();
			var record = this.getRecordByDisplay(raw);
			if(record != null){
				this.setValue(record.get(this.displayfield));				
			}else{
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
		this.correctViewSize();
		$A.ComboBox.superclass.expand.call(this);
		var v = this.getValue();
		this.currentIndex = this.getIndex(v);
		if(!this.currentIndex) return;
		if (!Ext.isEmpty(v)) {				
			if(this.selectedIndex)Ext.fly(this.getNode(this.selectedIndex)).removeClass(this.selectedClass);
			var node = this.getNode(this.currentIndex);
			if(node)Ext.fly(node).addClass(this.currentNodeClass);
			this.selectedIndex = this.currentIndex;
		}		
	},
	collapse:function(){
		$A.ComboBox.superclass.collapse.call(this);
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
			this.optionDataSet.un('load', this.onDataSetLoad, this);
			this.optionDataSet.on('load', this.onDataSetLoad, this);
			this.rendered = false;
			this.currentOptions = ds;
			if(!Ext.isEmpty(this.value)) this.setValue(this.value, true)
		}
	},
	onDataSetLoad: function(){
		this.rendered=false
		this.expand();
	},
	onRender:function(){	
        if(!this.view){
        	this.popup.update('<ul></ul>');
			this.view=this.popup.child('ul');
			this.view.on('click', this.onViewClick,this);
			this.view.on('mousemove',this.onViewMove,this);
        }
        
        if(this.optionDataSet){
			this.initList();
			this.rendered = true;
		}       
	},
	correctViewSize: function(){
		var widthArray = [];
		var mw = this.wrap.getWidth();
		for(var i=0;i<this.view.dom.childNodes.length;i++){
			var li=this.view.dom.childNodes[i];
			var width=$A.TextMetrics.measure(li,li.innerHTML).width;
			mw = Math.max(mw,width)||mw;
		}
		this.popup.setWidth(mw);
		var lh = Math.min(this.popup.child('ul').getHeight()+2,this.maxHeight); 
		this.popup.setHeight(lh<20?20:lh);
    	this.shadow.setWidth(mw);
    	this.shadow.setHeight(lh<20?20:lh);
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
		var index = target.tabIndex;
		if(index==-1)return;
		var record = this.optionDataSet.getAt(index);
		var value = record.get(this.valuefield);
		var display = record.get(this.displayfield);
//		this.setValue(value);
		this.setValue(display);
		this.fireEvent('select',this, value, display, record);
	},
	initQuery: function(){//事件定义中调用
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
		this.litp=new Ext.Template('<li tabIndex="{index}">{'+this.displayfield+'}&#160;</li>');
		if(this.optionDataSet.loading == true){
			this.view.update('<li tabIndex="-1">正在加载...</li>');
		}else{
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
		if(node && node.tabIndex!=this.selectedIndex){
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
//			this.view.un('mouseover',this.onViewOver,this);
			this.view.un('mousemove',this.onViewMove,this);
		}
		delete this.view;
    	$A.ComboBox.superclass.destroy.call(this);
	},
	getText : function() {		
		return this.text;
	},
//	processValue : function(rv){
//		var r = this.optionDataSet == null ? null : this.optionDataSet.find(this.displayfield, rv);
//		if(r != null){
//			return r.get(this.valuefield);
//		}else{
//			return this.value;
//		}
//	},
//	formatValue : function(){
//		var v = this.getValue();
//		var r = this.optionDataSet == null ? null : this.optionDataSet.find(this.valuefield, v);
//		this.text = '';
//		if(r != null){
//			this.text = r.get(this.displayfield);
//		}else{
////			this.text = v;
//		}
//		return this.text;
//	},
	setValue: function(v, silent){
        $A.ComboBox.superclass.setValue.call(this, v, silent);
        //TODO: v是空的时候?
        if(this.record){
			var field = this.record.getMeta().getField(this.binder.name);
			if(field){
				var mapping = field.get('mapping');
				var raw = this.getRawValue();
				var record = this.getRecordByDisplay(raw);
				if(mapping&&record){
					for(var i=0;i<mapping.length;i++){
						var map = mapping[i];
						this.record.set(map.to,record.get(map.from));
					}
				}
			}
		}
	},
	getIndex:function(v){
		var datas = this.optionDataSet.getAll();		
		var l=datas.length;
		for(var i=0;i<l;i++){
			if(datas[i].data[this.displayfield]==v){				
				return i;
			}
		}
	}
});