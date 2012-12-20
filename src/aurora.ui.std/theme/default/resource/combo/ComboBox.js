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
//	constructor : function(config) {
//		$A.ComboBox.superclass.constructor.call(this, config);		
//	},
	initComponent:function(config){
		$A.ComboBox.superclass.initComponent.call(this, config);
		var opt = config.options;
		if(opt) {
            this.setOptions(opt);
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
//	onTriggerClick : function() {
//		this.doQuery();
//		$A.ComboBox.superclass.onTriggerClick.call(this);		
//	},
	onBlur : function(e){
        if(this.hasFocus){
			$A.ComboBox.superclass.onBlur.call(this,e);
			if(!this.readonly/*!this.isExpanded()*/) {
				var raw = this.getRawValue();
				if(this.fetchrecord===false){
					this.setValue(raw)
				}else{
					var record = this.getRecordByDisplay(raw);
					this.setValue(record && this.getRenderText(record)||'');
				}
			}
        }
    },
    getRecordByDisplay: function(name){
    	if(!this.optionDataSet)return null;
		var record = null;
		Ext.each(this.optionDataSet.getAll(),function(r){
			if(this.getRenderText(r) == name){
				record = r;
				return false;
			}
		},this);
		return record;
    },
    /**
     * 展开下拉菜单.
     */
	expand:function(){
		if(!this.optionDataSet)return;
		if(this.rendered===false)this.doQuery();
		$A.ComboBox.superclass.expand.call(this);
		var v = this.getValue();
		this.currentIndex = this.getIndex(v);
//		if(!this.currentIndex) return;
		if (!Ext.isEmpty(v)) {				
			this.selectItem(this.currentIndex,true);
		}		
	},
    onKeyDown: function(e){
        if(this.readonly)return;
        var current = Ext.isEmpty(this.selectedIndex) ? -1 : this.selectedIndex,
        	keyCode = e.keyCode;
        if(keyCode == 40||keyCode == 38){
            this.inKeyMode = true;
            if(keyCode == 38){
                current --;
                if(current>=0){
                    this.selectItem(current,true)
                }            
            }else if(keyCode == 40){
                current ++;
                if(current<this.view.dom.childNodes.length){
                    this.selectItem(current,true)
                }
            }
        }else if(this.inKeyMode && keyCode == 13){
            this.inKeyMode = false;
            var cls = this.selectedClass;
            Ext.each(this.view.dom.childNodes,function(t){
                if(Ext.fly(t).hasClass(cls)){
                    this.onSelect(t)
                    return false;
                }
            },this);
            this.collapse();
            return;
    	}
    	$A.ComboBox.superclass.onKeyDown.call(this,e);
    },
    onKeyUp : function(e){
    	if(this.readonly)return;
    	var c = e.keyCode;
    	if(!e.isSpecialKey()||c==8||c==46){
//    		if(this.timeoutId)
//    			clearTimeout(this.timeoutId)
//    		this.timeoutId = function(){
    			this.doQuery(this.getRawValue());
    			if(!this.isExpanded())
    				$A.ComboBox.superclass.expand.call(this);
                else
                	this.syncPopup();
                this.rendered = false;
//    			delete this.timeoutId;
//    		}.defer(300,this);
    	}
    	$A.ComboBox.superclass.onKeyUp.call(this,e);
    },
	/**
	 * 收起下拉菜单.
	 */
	collapse:function(){
		$A.ComboBox.superclass.collapse.call(this);
		if(!Ext.isEmpty(this.currentIndex))
			Ext.fly(this.getNode(this.currentIndex)).removeClass(this.selectedClass);
//		this.doQuery();
	},
	clearOptions : function(){
	   this.processDataSet('un');
	   this.optionDataSet = null;
	},
	setOptions : function(name){
		var ds = typeof(name)==='string'?$(name) : name;
		if(this.optionDataSet != ds){
			this.optionDataSet = ds;
			this.processDataSet('un');
			this.processDataSet('on');
			this.rendered = false;
			if(!Ext.isEmpty(this.value)) this.setValue(this.value, true)
		}
	},
	processDataSet: function(ou){
		var ds =this.optionDataSet,
			loadFn = this.onDataSetLoad;
		if(ds){
            ds[ou]('load', loadFn, this);
           	ds[ou]('add', loadFn, this);
            ds[ou]('update', loadFn, this);
            ds[ou]('remove', loadFn, this);
            ds[ou]('clear', loadFn, this);
            ds[ou]('reject', loadFn, this);
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
			this.view=this.popup.update('<ul></ul>').child('ul')
				.on('click', this.onViewClick,this)
				.on('mousemove',this.onViewMove,this);
        }
        
        if(this.optionDataSet){
			this.initList();
			this.rendered = true;
		}       
		this.correctViewSize();
	},
	correctViewSize: function(){
		var widthArray = [],
			mw = this.wrap.getWidth();
		Ext.each(this.view.dom.childNodes,function(li){
			mw = Math.max(mw,$A.TextMetrics.measure(li,li.innerHTML).width)||mw;
		});
		var lh = Math.max(20,Math.min(this.popup.child('ul').getHeight()+4,this.maxHeight)); 
		this.popup.setWidth(mw).setHeight(lh);
    	this.shadow.setWidth(mw).setHeight(lh);
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
        this.selectItem(t.tabIndex);
	},
	onSelect:function(target){
		var index = target.tabIndex;
		if(index==-1)return;
		var record = this.optionDataSet.getAt(index),
			value = record.get(this.valuefield),
			display = this.getRenderText(record);//record.get(this.displayfield);
		this.setValue(display,null,record);
		this.fireEvent('select',this, value, display, record);
        
	},
//	initQuery: function(){//事件定义中调用
//		this.doQuery();
//	},
	doQuery : function(q) {		
//		if(q === undefined || q === null){
//			q = '';
//	    }		
//		if(forceAll){
//            this.store.clearFilter();
//        }else{
//            this.store.filter(this.displayField, q);
//        }
		var ds = this.optionDataSet;
        if(ds)
		if(Ext.isEmpty(q)){
			ds.clearFilter();
		}else{
			var reg = new RegExp(q.replace(/[+?*.^$\[\](){}\\|]/g,function(v){
					return '\\'+v;
				}),'i'),
				field = this.displayfield;
	        ds.filter(function(r){
	        	return reg.test(r.get(field));
	        },this);
		}
		//值过滤先不添加
		this.onRender();	
	},
	initList: function(){
//		this.refresh();
		this.currentIndex = this.selectedIndex = null;
		var ds = this.optionDataSet,v = this.view;
//		this.litp=new Ext.Template('<li tabIndex="{index}">{'+this.displayfield+'}&#160;</li>');
		if(ds.loading == true){
			v.update('<li tabIndex="-1">'+_lang['combobox.loading']+'</li>');
		}else{
			var sb = [];
			Ext.each(ds.getAll(),function(d,i){
//				var d = Ext.apply(datas[i].data, {index:i})
//				var rder = $A.getRenderer(this.renderer);
//				var text = this.getRenderText(datas[i]);
				sb.push('<li tabIndex="',i,'">',this.getRenderText(d),'</li>');
			},this);
//			if(sb.length){
				v.update(sb.join(''));			
//			}
		}
	},
	getRenderText : function(record){
        var rder = $A.getRenderer(this.displayrenderer);
        if(rder){
            return rder.call(window,this,record);
        }else{
            return record.get(this.displayfield);
        }
	},
//	refresh:function(){
//		this.view.update('');
//		this.selectedIndex = null;
//	},
	selectItem:function(index,focus){
		if(Ext.isEmpty(index)){
			return;
		}	
		var node = this.getNode(index),
			sindex = this.selectedIndex,
			cls = this.selectedClass;			
		if(node && node.tabIndex!=sindex){
			if(!Ext.isEmpty(sindex)){							
				Ext.fly(this.getNode(sindex)).removeClass(cls);
			}
			this.selectedIndex=node.tabIndex;	
			if(focus)this.focusRow(this.selectedIndex);
			Ext.fly(node).addClass(cls);					
		}			
	},
	focusRow : function(row){
        var r = 20,
            ub = this.popup,
            stop = ub.getScroll().top,
            h = ub.getHeight(),
            sh = ub.dom.scrollWidth > ub.dom.clientWidth? 16 : 0;
        if(row*r<stop){
            ub.scrollTo('top',row*r-1)
        }else if((row+1)*r>(stop+h-sh)){//this.ub.dom.scrollHeight
            ub.scrollTo('top', (row+1)*r-h + sh);
        }
    },
	getNode:function(index){		
		return this.view.dom.childNodes[index];
	},	
	destroy : function(){
		if(this.view){
			this.view.un('click', this.onViewClick,this)
//				.un('mouseover',this.onViewOver,this)
				.un('mousemove',this.onViewMove,this);
		}
		this.processDataSet('un');
    	$A.ComboBox.superclass.destroy.call(this);
		delete this.view;
	},
//	getText : function() {		
//		return this.text;
//	},
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
	setValue: function(v, silent,vr){
        $A.ComboBox.superclass.setValue.call(this, v, silent);
        var r = this.record;
        if(r){
			var field = r.getMeta().getField(this.binder.name);
			if(field){
				var raw = this.getRawValue(),
					record = vr||this.getRecordByDisplay(raw);
				Ext.each(field.get('mapping'),function(map){
					var vl = record ? record.get(map.from) : (this.fetchrecord===false?raw:'');
//    					var vl = record ? (record.get(map.from)||'') : '';
//    					if(vl!=''){
    					if(!Ext.isEmpty(vl,true)){
    						//避免render的时候发生update事件
    						if(silent){
                                r.data[map.to] = vl;
    						}else{
    						    r.set(map.to,vl);						
    						}
    					}else{
    						delete r.data[map.to];
    					}					
				},this);
			}
		}
	},
	getIndex:function(v){
		var df=this.displayfield;
		return Ext.each(this.optionDataSet.getAll(),function(d){
			if(d.data[df]==v){				
				return false;
			}
		});
	}
});