/**
 * @class Aurora.ComboBox
 * @extends Aurora.TriggerField
 * <p>Combo组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.ComboBox = Ext.extend($A.TriggerField, {	
	maxHeight:200,
	blankOption:true,
	rendered:false,
	selectedClass:'item-comboBox-selected',	
	//currentNodeClass:'item-comboBox-current',
	constructor : function(config) {
		$A.ComboBox.superclass.constructor.call(this, config);		
	},
	initComponent:function(config){
		$A.ComboBox.superclass.initComponent.call(this, config);
		if(config.options) {
            this.setOptions(config.options);
		}else{
            this.clearOptions();
		}
	},
	initEvents:function(){
		$A.ComboBox.superclass.initEvents.call(this);
		this.addEvents(
		/**
         * @event select
         * 选择事件.
         * @param {Aurora.Combobox} combo combo对象.
         * @param {Object} value valueField的值.
         * @param {String} display displayField的值.
         * @param {Aurora.Record} record 选中的Record对象
         */
		'select');
	},
	onTriggerClick : function() {
		this.doQuery('',true);
		$A.ComboBox.superclass.onTriggerClick.call(this);		
	},
	onBlur : function(e){
        if(this.readonly)return;
        if(this.hasFocus){
			$A.ComboBox.superclass.onBlur.call(this,e);
			if(!this.isExpanded()) {
				var raw = this.getRawValue();
				if(this.fetchrecord===false){
					this.setValue(raw)
				}else{
					var record = this.getRecordByDisplay(raw);
					if(record != null){
						this.setValue(record.get(this.displayfield));				
					}else{
						this.setValue('');
					}
				}
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
    /**
     * 展开下拉菜单.
     */
	expand:function(){
		if(!this.optionDataSet)return;
		if(this.rendered===false)this.initQuery();
		this.correctViewSize();
		$A.ComboBox.superclass.expand.call(this);
		var v = this.getValue();
		this.currentIndex = this.getIndex(v);
//		if(!this.currentIndex) return;
		if (!Ext.isEmpty(v)) {				
			if(this.selectedIndex)Ext.fly(this.getNode(this.selectedIndex)).removeClass(this.selectedClass);
			var node = this.getNode(this.currentIndex);
			if(node)Ext.fly(node).addClass(this.selectedClass);
			this.selectedIndex = this.currentIndex;
		}		
	},
    onKeyDown: function(e){
        if(this.readonly)return;
        var current = Ext.isEmpty(this.selectedIndex) ? -1 : this.selectedIndex;
        var keyCode = e.keyCode;
        if(keyCode == 40||keyCode == 38){
            this.inKeyMode = true;
            if(keyCode == 38){
                current --;
                if(current>=0){
                    this.selectItem(current)
                }            
            }
            if(keyCode == 40){
                current ++;
                if(current<this.view.dom.childNodes.length){
                    this.selectItem(current)
                }
            }
        }
        if(this.inKeyMode && keyCode == 13){
            this.inKeyMode = false;
            var doms = this.view.dom.childNodes;
            var se = null;
            for(var i=0;i<doms.length;i++){
                var t = doms[i];
                if(Ext.fly(t).hasClass(this.selectedClass)){
                    se = t;
                    break;
                }
            }
            if(se)this.onSelect(se);
            this.collapse();
        } else {
            $A.ComboBox.superclass.onKeyDown.call(this,e);
        }
    },
	/**
	 * 收起下拉菜单.
	 */
	collapse:function(){
		$A.ComboBox.superclass.collapse.call(this);
		if(this.currentIndex!==undefined)
		Ext.fly(this.getNode(this.currentIndex)).removeClass(this.selectedClass);
	},
	clearOptions : function(){
	   this.processDataSet('un');
	   this.optionDataSet = null;
	},
	setOptions : function(name){
		var ds = name
		if(typeof(name)==='string'){
			ds = $(name);
		}
		if(this.optionDataSet != ds){
			this.optionDataSet = ds;
			this.processDataSet('un');
			this.processDataSet('on');
			this.rendered = false;
			if(!Ext.isEmpty(this.value)) this.setValue(this.value, true)
		}
	},
	processDataSet: function(ou){
		if(this.optionDataSet){
            this.optionDataSet[ou]('load', this.onDataSetLoad, this);
            this.optionDataSet[ou]('add', this.onDataSetLoad, this);
            this.optionDataSet[ou]('update', this.onDataSetLoad, this);
            this.optionDataSet[ou]('remove', this.onDataSetLoad, this);
            this.optionDataSet[ou]('clear', this.onDataSetLoad, this);
            this.optionDataSet[ou]('reject', this.onDataSetLoad, this);
		}
	},	
	onDataSetLoad: function(){
		this.rendered=false;
		if(this.isExpanded()) {
            this.expand();
		}
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
//	onViewOver:function(e,t){
//		this.inKeyMode = false;
//	},
	onViewMove:function(e,t){
//		if(this.inKeyMode){ // prevent key nav and mouse over conflicts
//            return;
//        }
        var index = t.tabIndex;
        this.selectItem(index);        
	},
	onSelect:function(target){
		var index = target.tabIndex;
		if(index==-1)return;
		var record = this.optionDataSet.getAt(index);
		var value = record.get(this.valuefield);
		var display = this.getRenderText(record);//record.get(this.displayfield);
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
//		this.litp=new Ext.Template('<li tabIndex="{index}">{'+this.displayfield+'}&#160;</li>');
		if(this.optionDataSet.loading == true){
			this.view.update('<li tabIndex="-1">'+_lang['combobox.loading']+'</li>');
		}else{
			var datas = this.optionDataSet.getAll();
			var l=datas.length;
			var sb = [];
			for(var i=0;i<l;i++){
//				var d = Ext.apply(datas[i].data, {index:i})
				var rder = $A.getRenderer(this.renderer);
				var text = this.getRenderText(datas[i]);
				sb.add('<li tabIndex="'+i+'">'+text+'</li>');	//this.litp.applyTemplate(d)等数据源明确以后再修改		
			}
			if(l!=0){
				this.view.update(sb.join(''));			
			}
		}
	},
	getRenderText : function(record){
        var rder = $A.getRenderer(this.renderer);
        var text = '&#160;';
        if(rder){
            text = rder.call(window,this,record);
        }else{
            text = record.get(this.displayfield);
        }
		return text;
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
    	$A.ComboBox.superclass.destroy.call(this);
		delete this.view;
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
        if(this.record){
			var field = this.record.getMeta().getField(this.binder.name);
			if(field){
				var mapping = field.get('mapping');
				var raw = this.getRawValue();
				var record = this.getRecordByDisplay(raw);
//				if(mapping&&record){
				if(mapping){//TODO: v是空的时候?
					for(var i=0;i<mapping.length;i++){
						var map = mapping[i];
    					var vl = record ? record.get(map.from) : (this.fetchrecord===false?raw:'');
//    					var vl = record ? (record.get(map.from)||'') : '';
//    					if(vl!=''){
    					if(!Ext.isEmpty(vl,true)){
    						//避免render的时候发生update事件
    						if(silent){
                                this.record.data[map.to] = vl;
    						}else{
    						    this.record.set(map.to,vl);						
    						}
    					}else{
    						delete this.record.data[map.to];
    					}
						
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