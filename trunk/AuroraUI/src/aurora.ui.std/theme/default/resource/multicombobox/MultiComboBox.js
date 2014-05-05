/**
 * @class Aurora.ComboBox
 * @extends Aurora.TriggerField
 * <p>Combo组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.MultiComboBox = Ext.extend($A.ComboBox, {	
	initEvents:function(){
		$A.MultiComboBox.superclass.initEvents.call(this);
		this.addEvents(
		/**
         * @event unselect
         * 选择事件.
         * @param {Aurora.Combobox} combo combo对象.
         * @param {Object} value valueField的值.
         * @param {String} display displayField的值.
         * @param {Aurora.Record} record 选中的Record对象
         */
		'unselect');
	},
	onBlur : function(e){
        if(this.hasFocus){
			$A.ComboBox.superclass.onBlur.call(this,e);
        }
    },
    onKeyDown: function(e){
    },
    onKeyUp : function(e){
    },
	clearOptions : function(){
	   this.processDataSet('un');
	   this.optionDataSet = null;
	},
	setOptions : function(name){
		var ds = typeof(name)==='string'?$(name) : name;
		if(this.optionDataSet != ds){
			this.processDataSet('un');
			this.optionDataSet = ds;
			this.processDataSet('on');
			this.rendered = false;
			ds.selectable = true;
			if(!Ext.isEmpty(this.value)) this.setValue(this.value, true)
		}
	},
	processDataSet: function(ou){
		$A.MultiComboBox.superclass.processDataSet.call(this,ou);
		var sf = this,
			ds = sf.optionDataSet;
		if(ds){
            ds[ou]('select', sf.onDatasetSelect, sf)
            ds[ou]('unselect', sf.onDatasetUnSelect, sf);
		}
	},
	onDatasetSelect : function(ds,record){
		var sf = this,v = [];
		if(sf.rendered){
			sf.view.select('li .item-ckb').item(ds.indexOf(record)).removeClass('item-ckb-u').addClass('item-ckb-c');
			
		}
		Ext.each(ds.getSelected(),function(r){
			v.push(r.get(sf.displayfield));
		});
		this.setValue(v.join(';'));
	},
	onDatasetUnSelect : function(ds,record){
		var sf = this,v = [];
		if(sf.rendered){
			sf.view.select('li .item-ckb').item(ds.indexOf(record)).removeClass('item-ckb-c').addClass('item-ckb-u');
			
		}
		Ext.each(ds.getSelected(),function(r){
			v.push(r.get(sf.displayfield));
		});
		this.setValue(v.join(';'));
	},
	onViewClick:function(e,t){
		if(t.tagName!='LI'){
		    return;
		}		
		this.onSelect(t);
	},	
	onSelect:function(target){
		var index = target.tabIndex;
		if(index==-1)return;
		var sf = this,
			ds = sf.optionDataSet,
			record = sf.optionDataSet.getAt(index),
			value = record.get(sf.valuefield),
			display=sf.getRenderText(record),
			method = ds.getSelected().indexOf(record) == -1?'select':'unSelect';
		ds[method](record);
		//sf.setValue(display,null,record);
		sf.fireEvent(method.toLowerCase(),sf, value, display, record);
        
	},
	initList: function(){
		var sf = this,
			ds = sf.optionDataSet,
			v = sf.view;
		sf.currentIndex = sf.selectedIndex = null;
		if(ds.loading == true){
			v.update('<li tabIndex="-1">'+_lang['ComboBox.loading']+'</li>');
		}else{
			var sb = [],selected =ds.getSelected();
			Ext.each(ds.getAll(),function(d,i){
				sb.push('<li tabIndex="',i,'"><div class="item-ckb item-ckb-',selected.indexOf(d) == -1?'u':'c','"></div>',sf.getRenderText(d),'</li>');
			});
			v.update(sb.join(''));		
		}
	},
	setValue: function(v, silent,vr){
        $A.ComboBox.superclass.setValue.call(this, v, silent);
        var r = this.record;
        if(r && !silent){
			var field = r.getMeta().getField(this.binder.name);
			if(field){
				Ext.each(field.get('mapping'),function(map){
					var vl=[];
					Ext.each(this.optionDataSet.getSelected(),function(record){
						vl.push(record.get(map.from));
					});
					if(vl.length){
						r.set(map.to,vl.join(';'));
					}else{
						delete r.data[map.to];
					}					
				},this);
			}
		}
	},
	getIndex:function(v){
		return null;
	}
});