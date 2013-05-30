(function(A){
var _N = '',
	TR$TABINDEX = 'tr[tabindex]',
	WIDTH = 'width',
	PX = 'px',
	SELECTED_CLS = 'autocomplete-selected',
	EVT_CLICK = 'click',
	EVT_MOUSE_MOVE = 'mousemove',
	EVT_COMMIT = 'commit',
	EVT_BEFORE_TRIGGER_CLICK = 'beforetriggerclick';

/**
 * @class Aurora.Lov
 * @extends Aurora.TextField
 * <p>Lov 值列表组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
A.Lov = Ext.extend(A.TextField,{
    constructor: function(config) {
    	var sf = this;
        sf.isWinOpen = false;
        sf.fetching = false;
        sf.fetchremote = true;
        sf.maxHeight = 240;
        A.Lov.superclass.constructor.call(sf, config);        
    },
    initComponent : function(config){
    	var sf = this;
        A.Lov.superclass.initComponent.call(this,config);
//        	lovservice = sf.lovservice,
//        	lovmodel = sf.lovmodel,
//        	autocomplete = sf.autocomplete;
//        	field = sf.autocompletefield,
//        	view = sf.autocompleteview;
//        if(!Ext.isEmpty(lovservice)){
//            svc = sf.lovservice = sf.processParmater(lovservice);           
//        }else if(!Ext.isEmpty(lovmodel)){
//            svc = sf.lovmodel = sf.processParmater(lovmodel);
//        }
//        if(sf.autocomplete && svc){
//        	if(!field){
//        		Ext.each(sf.getMapping(),function(map){
//        			if(map.to == sf.binder.name) field = sf.autocompletefield = map.from;
//        		});
//        	}
//        	if(view){
//        		view.destroy();
//        		view.un('select',sf.onViewSelect,sf);
//        	}
//        	view = sf.autocompleteview = new A.AutoCompleteView({
//        		id:sf.id,
//        		el:sf.el,
//        		url:sf.context + 'autocrud/'+svc+'/query',
//        		name:field,
//        		size:sf.autocompletesize,
//        		pagesize:sf.autocompletepagesize,
//        		renderer:sf.autocompleterenderer,
//        		binder : sf.binder
//        	});
//        	view.bind(sf);
//        	view.on('select',sf.onViewSelect,sf);
//        }
        sf.trigger = sf.wrap.child('div[atype=triggerfield.trigger]');
    },
    processParmater:function(url){
        var li = url.indexOf('?')
        if(li!=-1){
            this.para = Ext.urlDecode(url.substring(li+1,url.length));
            return url.substring(0,li);
        } 
        return url;
    },
    processListener: function(ou){
    	var sf = this,view = sf.autocompleteview;
        A.Lov.superclass.processListener.call(sf,ou);
        sf.trigger[ou](EVT_CLICK,sf.onTriggerClick, sf, {preventDefault:true});
    },
    initEvents : function(){
        A.Lov.superclass.initEvents.call(this);
        this.addEvents(
        /**
         * @event commit
         * commit事件.
         * @param {Aurora.Lov} lov 当前Lov组件.
         * @param {Aurora.Record} r1 当前lov绑定的Record
         * @param {Aurora.Record} r2 选中的Record. 
         */
        EVT_COMMIT,
        /**
         * @event beforetriggerclick
         * 点击弹出框按钮之前的事件。
         * @param {Aurora.Lov} lov 当前Lov组件.
         */
        EVT_BEFORE_TRIGGER_CLICK);
    },
    onTriggerClick : function(e){
    	e.stopEvent();
    	var sf = this,view = sf.autocompleteview;
    	if(sf.fireEvent(EVT_BEFORE_TRIGGER_CLICK,sf)){
    		sf.showLovWindow();
    	}
    },
    destroy : function(){
    	var sf = this;
    	if(sf.qtId){
    		Ext.Ajax.abort(sf.qtId);
    	}
        A.Lov.superclass.destroy.call(sf);
    },
    clearBind : function(){
    	var sf = this;
    	A.Lov.superclass.clearBind.call(sf);
    	sf.lovurl = null;
    	sf.service = null;
    	sf.autocompleteservice = null
    	sf.lovservice =null;
    	sf.lovmodel = null;
    },
    setWidth: function(w){
        this.wrap.setStyle(WIDTH,(w+3)+PX);
        this.el.setStyle(WIDTH,(w-20)+PX);
    },
    onBlur : function(){
    	var sf = this,view = sf.autocompleteview;
    	if(!view || !view.isShow){
    		$A.Lov.superclass.onBlur.call(sf);
    	}
    },
    onChange : function(e){
    	var sf = this,view = sf.autocompleteview;
    	A.Lov.superclass.onChange.call(sf);
    	if(!view || !view.isShow)
			sf.fetchRecord();
    },
    onKeyDown : function(e){
        if(this.isWinOpen)return;       
        var sf = this,keyCode = e.keyCode,
        	view = sf.autocompleteview;
        if(!view || !view.isShow){
        	if(!e.ctrlKey && keyCode == 40){
        		e.stopEvent();
        		sf.showLovWindow();
        	}
            A.Lov.superclass.onKeyDown.call(sf,e);
        }
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
			sb.push('<tr tabIndex="',i,'"',i%2==1?' class="autocomplete-row-alt"':_N,'>',this.getRenderText(isRecord?d:new $A.Record(d),displayFields),'</tr>');	//sf.litp.applyTemplate(d)等数据源明确以后再修改		
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
    canHide : function(){
        return this.isWinOpen == false;
    },
    commit:function(r,lr,mapping){
        var sf = this,record = lr || sf.record;
        if(sf.win) sf.win.close();
//        sf.setRawValue(_N)
        if(record && r){
        	Ext.each(mapping || sf.getMapping(),function(map){
        		var from = r.get(map.from);
                record.set(map.to,Ext.isEmpty(from)?_N:from);
        	});
        }
//        else{
//          sf.setValue()
//        }
        
        sf.fireEvent(EVT_COMMIT, sf, record, r)
    },
//  setValue: function(v, silent){
//      A.Lov.superclass.setValue.call(this, v, silent);
//      if(this.record && this.dataRecord && silent !== true){
//          var mapping = this.getMapping();
//          for(var i=0;i<mapping.length;i++){
//              var map = mapping[i];
//              this.record.set(map.to,this.dataRecord.get(map.from));
//          }       
//      }
//  },
    onWinClose: function(){
    	var sf = this;
        sf.isWinOpen = false;
        sf.win = null;
        if(!Ext.isIE6 && !Ext.isIE7){//TODO:不知什么地方会导致冲突,ie6 ie7 会死掉 
            sf.focus();
        }else{
        	(function(){sf.focus()}).defer(10);
        }
    },
    getLovPara : function(){
    	return this.getPara();
    },
    fetchRecord : function(){
    	var sf = this;
        if(sf.readonly == true||!sf.fetchremote) return;
        sf.fetching = true;
        var v = sf.getRawValue(),url,
        	svc = sf.service,
        	mapping = sf.getMapping(),
        	record = sf.record,p = {},
        	binder = sf.binder,
        	sidebar = A.SideBar,
        	autocompletefield = sf.autocompletefield;
        if(!Ext.isEmpty(svc)){
//            url = sf.context + 'sys_lov.svc?svc='+sf.lovservice+'&pagesize=1&pagenum=1&_fetchall=false&_autocount=false&'+ Ext.urlEncode(sf.getLovPara());
            url = Ext.urlAppend(sf.context + 'autocrud/'+svc+'/query?pagenum=1&_fetchall=false&_autocount=false', Ext.urlEncode(sf.getLovPara()));
        }
        if(record == null && binder)
        	record = binder.ds.create({},false);
        record.isReady=false;
        if(autocompletefield){
        	p[autocompletefield] = v;
	        Ext.each(mapping,function(map){
	            record.set(map.to,_N);          
	        });
        }else{
	        Ext.each(mapping,function(map){
	            if(binder.name == map.to){
	                p[map.from]=v;
	            }
	            record.set(map.to,_N);          
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
        sf.setRawValue(_lang['lov.query'])
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
            sf.setRawValue(_N);
            sf.commit(r,record,mapping);
            record.isReady=true;
            sidebar.enable = A.slideBarEnable;
        }, error:sf.onFetchFailed, scope:sf});
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
    onFetchFailed: function(res){
        this.fetching = false;
        A.SideBar.enable = A.slideBarEnable;
    },    
    showLovWindow : function(){
    	var sf = this;
        if(sf.fetching||sf.isWinOpen||sf.readonly) return;
        
        var v = sf.getRawValue(),
        	lovurl = sf.lovurl,
    		svc = sf.service,ctx = sf.context,
    		w = sf.lovwidth||400,
			url;
        sf.blur();
        if(!Ext.isEmpty(lovurl)){
            url = Ext.urlAppend(lovurl,Ext.urlEncode(sf.getFieldPara()));
        }else if(!Ext.isEmpty(svc)){
//              url = sf.context + 'sys_lov.screen?url='+encodeURIComponent(sf.context + 'sys_lov.svc?svc='+sf.lovservice + '&'+ Ext.urlEncode(sf.getLovPara()))+'&service='+sf.lovservice+'&';
            url = ctx + 'sys_lov.screen?url='+encodeURIComponent(Ext.urlAppend(ctx + 'autocrud/'+svc+'/query',Ext.urlEncode(sf.getLovPara())))+'&service='+svc;
    	}
        if(url) {
	        sf.isWinOpen = true;
            sf.win = new A.Window({title:sf.title||'Lov', url:Ext.urlAppend(url,"lovid="+sf.id+"&key="+encodeURIComponent(v)+"&gridheight="+(sf.lovgridheight||350)+"&innerwidth="+(w-30)+"&lovautoquery="+(Ext.isEmpty(sf.lovautoquery) ? 'true' : sf.lovautoquery) +"&lovlabelwidth="+(sf.lovlabelwidth||75)+"&lovpagesize="+(sf.lovpagesize||'')), height:sf.lovheight||400,width:w});
            sf.win.on('close',sf.onWinClose,sf);
        }
    },
    isEventFromComponent:function(el){
    	var popup = this.autocompleteview;
    	return $A.Lov.superclass.isEventFromComponent.call(this,el) || (popup && popup.wrap.contains(el));
    }
});

})($A);
/*(function(A){
var TEMPLATE = ['<div tabIndex="-2" class="item-popup" style="visibility:hidden;background-color:#fff;">','</div>'],
    SHADOW_TEMPLATE = ['<div class="item-shadow" style="visibility:hidden;">','</div>'],
    EVT_MOUSE_DOWN = 'mousedown',
	EVT_SHOW = 'show',
	EVT_HIDE = 'hide',
	EVT_RENDER = 'render',
	EVT_BEFORE_RENDER = 'beforerender';
A.Popup = Ext.extend(A.Component,{
	constructor : function(config) {
		var id = 'aurora-item-popup',popup = A.CmpManager.get(id);
		if(popup)return popup;
		config.id=id;
        A.Popup.superclass.constructor.call(this, config);
    },
    initComponent : function(config){
    	var sf = this;
        A.Popup.superclass.initComponent.call(sf,config);
    	sf.wrap = new Ext.Template(TEMPLATE).insertFirst(document.body,{width:sf.width,height:sf.height},true);
    	sf.shadow = new Ext.Template(SHADOW_TEMPLATE).insertFirst(document.body,{width:sf.width,height:sf.height},true);
    },
    initEvents : function(){
        A.Popup.superclass.initEvents.call(this);
        this.addEvents(
        	EVT_SHOW,
        	EVT_HIDE,
        	EVT_BEFORE_RENDER,
        	EVT_RENDER
        );
    },
    processDataSet: function(ou){
    	var sf = this,ds = sf.optionDataSet;
		if(ds){
            ds[ou]('load', sf.onDataSetLoad, sf);
            ds[ou]('query', sf.onDataSetQuery, sf);
		}
	},
	
	onDataSetQuery : function(){
		this.fireEvent(EVT_BEFORE_RENDER,this)
	},
	onDataSetLoad : function(){
		this.fireEvent(EVT_RENDER,this)
	},
//	update : function(){
//		this.wrap.update.apply(this.wrap,Ext.toArray(arguments));
//	},
    show : function(){
    	var sf = this;
    	if(!sf.isShow){
    		sf.isShow=true;
	    	sf.fireEvent(EVT_SHOW,sf);
	    	sf.wrap.show();
	    	sf.shadow.show();
	    	Ext.get(document).on(EVT_MOUSE_DOWN,sf.trigger,sf);
    	}
    },
    trigger : function(e){
    	var sf = this;
    	if(!sf.wrap.contains(e.target) &&(!sf.owner||!sf.owner.wrap.contains(e.target))){ 
    		sf.hide();
    	}
    },
    hide : function(e){
    	var sf = this;
    	if(sf.isShow){
    		sf.isShow=false;
	    	sf.fireEvent(EVT_HIDE,sf)
	    	Ext.get(document).un(EVT_MOUSE_DOWN,sf.trigger,sf)
	    	sf.wrap.hide();
	    	sf.shadow.hide();
    	}
    },
    moveTo : function(x,y){
    	this.wrap.moveTo(x,y);
    	this.shadow.moveTo(x+3,y+3);
    },
    setHeight : function(h){
    	this.wrap.setHeight(h);
    	this.shadow.setHeight(h);
    },
    setWidth : function(w){
    	//this.wrap.setWidth(w);
    	this.shadow.setWidth(w);
    },
    getHeight : function(){
    	return this.wrap.getHeight();
    },
    getWidth : function(){
    	return this.wrap.getWidth();
    },
    addClass : function(className){
    	this.wrap.dom.className = "item-popup "+className;
//		if(this.customClass == className)return;
//    	if(this.customClass)this.wrap.removeClass(this.customClass);
//    	this.customClass = className;
//    	this.wrap.addClass(this.customClass);
    },
    bind : function(ds,cmp){
    	var sf = this;
    	sf.owner = cmp;
    	if(sf.optionDataSet != ds){
    		sf.processDataSet('un');
    		sf.optionDataSet = ds;
			sf.processDataSet('on');
    	}
    },
    destroy : function(){
    	A.Popup.superclass.destroy.call(this);
    	this.processDataSet('un');
    	delete this.shadow;
    }
});

})($A);*/