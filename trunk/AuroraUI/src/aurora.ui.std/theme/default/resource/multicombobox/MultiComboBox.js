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
		var sf = this,
			ds = typeof(name)==='string'?$(name) : name;
		if(sf.optionDataSet != ds){
			sf.processDataSet('un');
			sf.optionDataSet = ds;
			sf.processDataSet('on');
			sf.rendered = false;
			ds.selectable = true;
			if(!Ext.isEmpty(sf.value)) sf.setValue(sf.value, true)
		}
	},
	processDataSet: function(ou){
		var sf = this,
			ds = sf.optionDataSet;
		$A.MultiComboBox.superclass.processDataSet.call(sf,ou);
		if(ds){
            ds[ou]('select', sf.onDatasetSelect, sf)
            ds[ou]('unselect', sf.onDatasetUnSelect, sf);
		}
	},
	onDatasetSelect : function(ds,record){
		var sf = this,v = [];
		if(sf.rendered){
			sf.view.select('li .item-ckb').item(ds.indexOf(record)+1).removeClass('item-ckb-u').addClass('item-ckb-c');
			if(ds.getSelected().length == ds.getAll().length){
				sf.view.select('li.item-multicombobox-select-all .item-ckb').removeClass('item-ckb-u').addClass('item-ckb-c');
			}
		}
		Ext.each(ds.getSelected(),function(r){
			v.push(r.get(sf.displayfield));
		});
		sf.setValue(v.join(';'));
	},
	onDatasetUnSelect : function(ds,record){
		var sf = this,v = [];
		if(sf.rendered){
			sf.view.select('li .item-ckb').item(ds.indexOf(record)+1).removeClass('item-ckb-c').addClass('item-ckb-u');
			sf.view.select('li.item-multicombobox-select-all .item-ckb').removeClass('item-ckb-c').addClass('item-ckb-u');
		}
		Ext.each(ds.getSelected(),function(r){
			v.push(r.get(sf.displayfield));
		});
		sf.setValue(v.join(';'));
	},
	onViewClick:function(e,t){
		t = Ext.fly(t)
		if(t.is('div.item-ckb')){
			t = t.parent('li');
		}else if(!t.is('li')){
		    return;
		}		
		this.onSelect(t.dom);
	},	
	onSelect:function(target){
		var sf = this,
			index = target.tabIndex,
			ds = sf.optionDataSet;
		if(index==-1){
			if((target=Ext.fly(target)).hasClass('item-multicombobox-select-all')){
				if(ds.getSelected().length == ds.getAll().length){
					target.select('div').removeClass('item-ckb-c').addClass('item-ckb-u');
					ds.unSelectAll();
				}else{
					target.select('div').removeClass('item-ckb-').addClass('item-ckb-c');
					ds.selectAll();
				}
			}
			return;
		}
		var record = sf.optionDataSet.getAt(index),
			value = record.get(sf.valuefield),
			display=sf.getRenderText(record),
			method = ds.getSelected().indexOf(record) == -1?'select':'unSelect';
		ds[method](record);
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
			sb.push('<li tabIndex="-1" class="item-multicombobox-select-all"><div class="item-ckb item-ckb-',selected.length  == ds.getAll().length?'c':'u','"></div>','全选','</li>')
			Ext.each(ds.getAll(),function(d,i){
				sb.push('<li tabIndex="',i,'"><div class="item-ckb item-ckb-',selected.indexOf(d) == -1?'u':'c','"></div>',sf.getRenderText(d),'</li>');
			});
			v.update(sb.join(''));		
		}
	},
	setValue: function(v, silent,vr){
		var sf = this,r,field,ds = sf.optionDataSet;
        $A.ComboBox.superclass.setValue.call(sf, v, silent);
        if(r = sf.record){
        	if(silent){
    			ds.unSelectAll();
        		Ext.each(v && v.split(';'),function(_v){
        			ds.select(ds.find(sf.displayfield,_v));
        		});
        	}else if(field = r.getMeta().getField(sf.binder.name)){
				Ext.each(field.get('mapping'),function(map){
					var vl=[];
					Ext.each(ds.getSelected(),function(record){
						vl.push(record.get(map.from));
					});
					r.set(map.to,vl.join(';'));
				});
			}
		}
	},
	getIndex:function(v){
		return null;
	}
});