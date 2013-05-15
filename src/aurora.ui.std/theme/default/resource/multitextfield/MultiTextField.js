(function(A){
var CH_REG = /[^\x00-\xff]/g,
	_N = '',
	TR$TABINDEX = 'tr[tabindex]',
	DIV$ITEM_RECEIVER_INFO = 'div.item-receiver-info',
	SYMBOL = ';',
	SELECTED_CLS = 'autocomplete-selected',
	EVT_MOUSE_MOVE = 'mousemove',
	EVT_COMMIT = 'commit';
/**
 * @class Aurora.MultiTextField
 * @extends Aurora.TextField
 * <p>多文本输入组件.
 * @author huazhen.wu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
A.MultiTextField = Ext.extend(A.TextField,{
	infoTpl : ['<div class="item-receiver-info" _data="{data}"><span class="item-receiver-info-name">{text}</span>','<a class="item-receiver-info-close" href="#" onclick="return false;" hideFocus tabIndex="-1"></a>','</div>'],
    processListener : function(ou){
    	var sf = this;
    	A.MultiTextField.superclass.processListener.call(sf, ou);
    	sf.wrap[ou]('mousedown',sf.onWrapFocus,sf,{preventDefault:true})
    		[ou]('mouseup',sf.onWrapClick,sf);
    },
    initEvents : function(){
        A.Lov.superclass.initEvents.call(this);
        this.addEvents(
	        /**
	         * @event commit
	         * commit事件.
	         * @param {Aurora.MultiTextField} multiTextField 当前MultiTextField组件.
	         * @param {Aurora.Record} r1 当前MultiTextField绑定的Record
	         * @param {Aurora.Record} r2 选中的Record. 
	         */
	        EVT_COMMIT
        );
    },
    onWrapClick : function(e,t){
    	t = Ext.fly(t);
    	if(t.hasClass('item-receiver-info-close')){
    		this.removeItem(t.parent(DIV$ITEM_RECEIVER_INFO));
    	}
    },
    onWrapFocus : function(e,t){
    	var sf = this;
    	e.stopEvent();
    	if(Ext.isIE && t !==sf.el.dom)sf.hasFocus = false;
		sf.focus.defer(Ext.isIE?1:0,sf);
    },
    onBlur : function(){
    	var sf = this,view = sf.autocompleteview;
    	if(sf.hasFocus){
			if(Ext.isIE && sf.hasChange){//for IE
				sf.fetchRecord();
				sf.hasChange = false;
			}else if(!sf.fetching && ( !view || !view.isShow)){
	    		A.MultiTextField.superclass.onBlur.call(sf);
	    	}
	    	sf.hasFocus = false;
	    	sf.wrap.removeClass(sf.focusCss);
    	}
    },
    onChange : function(){
    	var sf = this,value = sf.getRawValue(),
    		view = sf.autocompleteview;
		A.MultiTextField.superclass.onChange.call(sf);
		if(!view || !view.isShow)
	    	if(sf.hasFocus){
				sf.fetchRecord();
	    	}else if(Ext.isIE){
	    		sf.hasChange = true;//for IE
	    	}
    },
    processValue : function(v){
    	var name = this.binder.name,arr=[];
		Ext.each(this.items,function(item){
    		arr.push(item[name]);
    	});
    	return arr.join(SYMBOL);
    },
    formatValue : function(v){
    	var sf = this,v,r = sf.record,binder = sf.binder,name,mapTos=[];
		sf.clearAllItems();
    	if(r&&!Ext.isEmpty(v=r.get(name = sf.binder.name))){
    		Ext.each(sf.getMapping(),function(map){
    			var to = map.to,toValue = String(r.get(to));
				if(name != to){
					mapTos.push({name:to,values:Ext.isEmpty(toValue)?[]:toValue.split(SYMBOL)});
				}
    		})
			Ext.each(v.split(SYMBOL),function(item,index){
				var obj={};
				Ext.each(mapTos,function(mapTo){
					obj[mapTo.name] = mapTo.values[index];
				});
				obj[name] = item;
				sf.items.push(obj);
				sf.addItem(A.MultiTextField.superclass.formatValue.call(sf,item)).item = obj;
			});
    	}
		return _N;
    },
    onKeyDown : function(e){
    	var sf = this,value = sf.getRawValue(),length = sf.getValueLength(value);
    	if(e.keyCode === 8){
	    	if(value===_N){
	    		sf.removeItem(sf.el.prev());
	    	}else{
		    	sf.setSize(length-1);
	    	}
    	}else if(e.keyCode === 186){
    		sf.fetchRecord();
    		e.stopEvent();
    	}else
	    	sf.setSize(length+1);
    	A.MultiTextField.superclass.onKeyDown.call(sf,e);
    },
    getValueLength : function(str){
    	var c = 0,i = 0,cLength = A.defaultChineseLength;
        for (; i < str.length; i++) {
            var cl = str.charAt(i).match(CH_REG);
            c+=cl !=null && cl.length>0?cLength:1;
        }
        return c;
    },
    onKeyUp: function(){
    	this.setSize(this.getValueLength(this.getRawValue()));
    },
    onViewSelect : function(r){
    	var sf = this;
		if(!r){
			if(sf.autocompleteview.isLoaded)
				sf.fetchRecord();
		}else{
			sf.commit(r);
		}
		sf.focus();
    },
    commit : function(r,lr,mapping){
    	var sf = this,record = lr || sf.record,name = sf.binder.name,obj={};
        if(record && r){
        	Ext.each(mapping || sf.getMapping(),function(map){
	    		var from = r.get(map.from),
	    			v = record.get(map.to);
	    		if(!Ext.isEmpty(from)){
		    		obj[map.to]=from;
		    		if(!Ext.isEmpty(v)){
		    			from = v+SYMBOL+from;
	    			}
            	}else{
            		from = v;
            	}
            	record.set(map.to,from);
	    	});
        }
        sf.fireEvent(EVT_COMMIT, sf, record, r)
    },
    setSize : function(size){
    	this.el.set({size:size||1});
    },
    addItem : function(text,noCloseBtn){
    	if(text){
    		var sf = this,
    			tpl = sf.infoTpl;
    		sf.setSize(1);
    		return new Ext.Template(noCloseBtn?tpl[0]+tpl[2]:tpl).insertBefore(sf.el,{text:text,data:text},true);
    	}
    },
    removeItem : function(t){
    	if(t){
    		var sf = this,r = sf.record;
    		Ext.each(sf.getMapping(),function(map){
    			var arr = [];
	    		Ext.each(sf.items.remove(t.item),function(item){
	    			arr.push(item[map.to]);
	    		});
	    		r.set(map.to,arr.join(SYMBOL));
    		});
    	}
    },
    clearAllItems : function(){
    	this.items = [];
    	this.wrap.select(DIV$ITEM_RECEIVER_INFO).remove();
    },
    fetchRecord : function(){
    	if(this.readonly)return;
    	var sf = this,v = sf.getRawValue(),
    		record = sf.record,
    		binder = sf.binder,
        	name = binder.name;
    	sf.fetching = true;
    	if(sf.fetchremote){
    		var url,
	        	svc = sf.service,
	        	mapping = sf.getMapping(),
	        	p = {},
	        	sidebar = A.SideBar,
	        	autocompletefield = sf.autocompletefield;
	        if(!Ext.isEmpty(svc)){
	            url = Ext.urlAppend(sf.context + 'autocrud/'+svc+'/query?pagenum=1&_fetchall=false&_autocount=false', Ext.urlEncode(sf.getPara()));
	        }
	        if(record == null && binder)
	        	record = binder.ds.create({},false);
	        record.isReady=false;
	        if(autocompletefield){
	        	p[autocompletefield] = v;
	        }else{
		        Ext.each(mapping,function(map){
		            if(name == map.to){
		                p[map.from]=v;
		            }
		        });
	        }
	        A.slideBarEnable = sidebar.enable;
	        sidebar.enable = false;
	        if(Ext.isEmpty(v) || Ext.isEmpty(svc)) {
	            sf.fetching = false;
	            record.isReady=true;
	            sidebar.enable = A.slideBarEnable;
	            return;
	        }
	        sf.setRawValue(_N);
	        var info = sf.addItem(_lang['lov.query'],true);
	        sf.qtId = A.request({url:url, para:p, success:function(res){
	            var r = new A.Record({});
	            if(res.result.record){
	                var datas = [].concat(res.result.record),l = datas.length;
	                if(l>0){
	                	if(sf.fetchsingle && l>1){
	                		var sb = sf.createListView(datas,binder).join(_N),
								div = new Ext.Template('<div style="position:absolute;left:0;top:0">{sb}</div>').append(document.body,{'sb':sb},true),
	                			cmp = sf.fetchSingleWindow =  new A.Window({id:sf.id+'_fetchmulti',closeable:true,title:'请选择', height:Math.min(div.getHeight(),sf.maxHeight),width:Math.max(div.getWidth(),200)});
	                		div.remove();
	                		cmp.body.update(sb)
	                			.on(EVT_MOUSE_MOVE,sf.onViewMove,sf)
	                			.on('dblclick',function(e,t){
									t = Ext.fly(t).parent(TR$TABINDEX);
									var index = t.dom.tabIndex;
									if(index<-1)return;
									var r2 = new A.Record(datas[index]);
									sf.commit(r2,record,mapping);
									cmp.close();
		                		})
	                			.child('table').setWidth('100%');
	                	}else{
		                    r = new A.Record(datas[0]);
	                	}
	                }
	            }
	            sf.fetching = false;
	            info.remove();
	            sf.commit(r,record,mapping);
	            record.isReady=true;
	            sidebar.enable = A.slideBarEnable;
	        }, error:sf.onFetchFailed, scope:sf});
    	}else{
    		var v2 = record.get(name);
    		record.set(name,Ext.isEmpty(v2)?v:v2+SYMBOL+v);
    	}
    },
    createListView : function(datas,binder,isRecord){
    	var sb = ['<table class="autocomplete" cellspacing="0" cellpadding="2">'],
    		displayFields = binder.ds.getField(binder.name).getPropertity('displayFields');
        if(displayFields && displayFields.length){
        	sb.push('<tr tabIndex="-2" class="autocomplete-head">');
        	Ext.each(displayFields,function(field){
        		sb.push('<td>',field.prompt,'</td>');
        	});
			sb.push('</tr>');
        }
		for(var i=0,l=datas.length;i<l;i++){
			var d = datas[i];
			sb.push('<tr tabIndex="',i,'"',i%2==1?' class="autocomplete-row-alt"':_N,'>',this.getRenderText(isRecord?d:new A.Record(d),displayFields),'</tr>');	//sf.litp.applyTemplate(d)等数据源明确以后再修改		
		}
		sb.push('</table>');
		return sb;
    },
    getRenderText : function(record,displayFields){
        var sf = this,
        	rder = A.getRenderer(sf.autocompleterenderer),
        	text = [],
        	fn = function(t){
        		var v = record.get(t);
        		text.push('<td>',Ext.isEmpty(v)?'&#160;':v,'</td>');
        	};
        if(rder){
            text.push(rder(sf,record));
        }else if(displayFields){
        	Ext.each(displayFields,function(field){
        		fn(field.name);
        	});
        }else{
        	fn(sf.autocompletefield)
        }
		return text.join(_N);
	},
	onViewMove:function(e,t){
        this.selectItem((Ext.fly(t).findParent(TR$TABINDEX)||t).tabIndex);        
	},
	selectItem:function(index){
		if(Ext.isEmpty(index)||index < -1){
			return;
		}	
		var sf = this,node = sf.getNode(index),selectedIndex = sf.selectedIndex;	
		if(node && node.tabIndex!=selectedIndex){
			if(!Ext.isEmpty(selectedIndex)){							
				Ext.fly(sf.getNode(selectedIndex)).removeClass(SELECTED_CLS);
			}
			sf.selectedIndex=node.tabIndex;			
			Ext.fly(node).addClass(SELECTED_CLS);					
		}			
	},
	getNode:function(index){
		var nodes = this.fetchSingleWindow.body.query('tr[tabindex!=-2]'),l = nodes.length;
		if(index >= l) index =  index % l;
		else if (index < 0) index = l + index % l;
		return nodes[index];
	},
    select:function(){}
});
})($A);