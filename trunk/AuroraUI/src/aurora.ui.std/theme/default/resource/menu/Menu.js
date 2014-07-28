(function(A){
var TRUE = true,
	FALSE = false,
	NULL = null,
	EACH = Ext.each,
	CLASS_CURRENT_MENU = 'item-menu-current',
	EVT_MOUSE_DOWN = 'mousedown',
	EVT_MOUSE_UP = 'mouseup',
	EVT_SUBMIT = 'submit',
	SELECTOR_ITEM_MENU_ICON_DIV = 'td.item-menu-icon div',
	TPLT_IE_SHADOW = '<div class="item-ie-shadow"></div>',
	TPLT_MAIN_MENU_LIST_ITEM = '<LI id="{id}" class="item-menu"></LI>',
	TPLT_SUB_MENU_LIST_ITEM = '<TR id="{id}" class="item-menu"></TR>',
	TPLT_MENU_BAR = '<SPAN class="item-menu-text">{text}</SPAN>',
	TPLT_CONTAINER = '<DIV class="item-shadow item-menu-container" style="z-index:{zIndex};visibility:hidden;">{shadow}<TABLE cellspacing="0"><TBODY></TBODY></TABLE></DIV>';

function sortOptions(o1,o2){
	o1.options && o1.options.sort(sortOptions);
	o2.options && o2.options.sort(sortOptions);
	return parseFloat(o1.index)-parseFloat(o2.index);
}
/**
 * @class Aurora.MenuBar
 * @extends Aurora.Component
 * <p>树形组件.
 * @author huazhen.wu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
A.MenuBar=Ext.extend(A.Component,{
	constructor: function(config) {
		var sf = this;
		sf.isActive=FALSE;
		sf.needHide=FALSE;
		sf.children=[];
		sf.selectIndex = NULL;
		A.MenuBar.superclass.constructor.call(sf, config);
		sf.handlerfield=sf.handlerfield||'handler';
		sf.menutype=sf.menutype||'type';
		sf.checked=sf.checked||'checked';
	},
	processListener: function(ou){
		var sf = this;
    	A.MenuBar.superclass.processListener.call(sf,ou);
    	Ext.fly(document)[ou](EVT_MOUSE_DOWN,sf.onMouseDown,sf)
			[ou](EVT_MOUSE_UP,sf.onMouseUp,sf);
    	Ext.getBody()[ou]('selectstart',sf.preventMenuAndSelect,sf)
			[ou]('contextmenu',sf.preventMenuAndSelect,sf);
    	if(ou=='on')
    		A.onReady(function(){
    			sf.processIframeListener(ou);
			});
    	else
    		sf.processIframeListener(ou);
    },
    processIframeListener:function(ou){
    	var sf = this;
    	function registerListener(el){
    		Ext.fly(el)[ou](EVT_MOUSE_DOWN,sf.onMouseDown,sf)
    			[ou](EVT_MOUSE_UP,sf.onMouseUp,sf);
    	}
    	EACH(Ext.getBody().query('iframe'),function(frame,win){
    		(win = frame.contentWindow) && registerListener(win.document);
    		Ext.fly(frame)[ou]('load',function(){
				registerListener(frame.contentWindow.document);
			});
			if(sf.urltarget&&sf.urltarget==frame.name)
				sf.targetFrame=frame;
    	});
    },
    processDataSetLiestener: function(ou){
		var sf = this,
			ds = sf.dataset;
		if(ds){
			ds[ou]('update', sf.onUpdate, sf);
			ds[ou]('load', sf.onLoad, sf);
		}
	},
    bind : function(ds){
    	if(Ext.isString(ds)){
			ds = $(ds);
			if(!ds) return;
		}
		var sf = this;
		sf.dataset = ds;
		sf.processDataSetLiestener('on');
    	sf.onLoad();
    },
    renderText : function(data){
    	var sf = this,
    		text = data.get(sf.displayfield),
    		renderer = sf.renderer && A.getRenderer(sf.renderer);
    	return renderer?renderer(text,data,sf.context):text;
    },
    onUpdate : function(ds,record,name,value){
    	var sf = this;
    	if(name==sf.displayfield)
    		record.menu.setText(sf.value);
    	else if(name==sf.checked)
    		record.menu.check(value);
    },
    onLoad : function(){
    	var sf = this,
    		idfield = sf.idfield,
    		parentfield = sf.parentfield,
    		displayfield = sf.displayfield,
    		sequence = sf.sequence,
    		iconfield = sf.iconfield,
    		handlerfield = sf.handlerfield,
    		urlfield = sf.urlfield,
    		menutype = sf.menutype,
    		checked = sf.checked,
    		rootid = sf.rootid,
    		handler = sf.handler,
    		options=[],
    		map={},
    		datas=sf.dataset.data;
    	EACH(datas,function(data){
    		var id = data.get(idfield),
    			item = map[id]={
	    			record:data,
	    			text:data.get(displayfield),
	    			renderText:sf.renderText(data),
	    			index:data.get(sequence)||Number.MAX_VALUE,
	    			icon:data.get(iconfield),
	    			dataId:id
				},
				type = data.get(menutype);
    		if(type){
    			var types=type.match(/^([^\[\]]+)\[?([^\[\]]+)?\]?$/);
    			Ext.apply(item,{
    				type:types[1],
    				checked:data.get(checked)=="true"||FALSE
				});
    			types[2] && Ext.apply(item,{
    				groupName:types[2]
				});
    		}
    		data.get(handlerfield) &&
    			Ext.apply(item,{
    				listeners:{
						mouseup:function(){
							window[data.get(handlerfield)].apply(window,Ext.toArray(arguments).concat(data))
						}
					}
				});
    		data.get(urlfield) &&
    			Ext.apply(item,{
    				listeners:{
    					submit:function(){
    						sf.directURL(data.get(urlfield),data.get(displayfield));
    					}
					}
				});
    	});
    	EACH(datas,function(data){
    		var pid = data.get(parentfield),
    			self = map[data.get(idfield)];
    		if(!pid||pid==rootid||pid<0)
    			options.push(self);
    		else{
    			var parent = map[pid];
    			(parent.options = parent.options||[]).push(self);
    		}
    	});
    	sf.addMenus(options.sort(sortOptions));
    },
    directURL : function(url,title){
    	var sf = this;
    	if(sf.targetFrame)
    		sf.targetFrame.setAttribute('src',Ext.urlAppend(url,"r="+Math.floor(Math.random()*100000)));
    	else if(sf.urltarget)
    		window.open(url,sf.urltarget);
    	else new A.Window({
    		title:title,
    		url:url,
    		fullScreen:TRUE
		});
    },
    preventMenuAndSelect :function(e,t){
    	if(this.isAncestor(t)){
    		e.stopEvent();
			return FALSE;
		}
    },
	onMouseDown : function(e,t){
		var sf = this,
			index = sf.selectIndex,
			children = sf.children;
		if(index==NULL||!children.length)
			return;
		if(e.button==0){
			if(sf.wrap.contains(t))
				sf.needHide=sf.isActive;
			var child = children[index];
			if(sf.isAncestor(t)){
				sf.isActive=TRUE;
				child.show();
			}else{
				child.inactive();
				child.hide();
				sf.isActive=FALSE;
			}
		}
	},
	onMouseUp : function(e,t){
		var sf = this,
			index = sf.selectIndex,
			children = sf.children;
		if(index==NULL||!children.length)return;
		if(e.button==0){
			if(sf.needHide||!sf.isAncestor(t)){
				sf.isActive=FALSE;
			}
			if(!sf.isActive)
				children[index].hide();
		}
	},
	addMenus : function(options){
		var sf=this,
			children = sf.children,
			j=children.length,
			ul = sf.wrap.child('ul');
		EACH(options,function(opt){
			var _id=sf.id+"-node"+j;
			new Ext.Template(TPLT_MAIN_MENU_LIST_ITEM).append(ul,{
				id:_id
			});
			children.push(opt.record.menu=new Aurora[opt.options?'Menu':'MenuItem'](Ext.apply(opt,{
				id:_id,
				parent:sf,
				bar:sf,
				index:j++
			})));
			delete opt.record;
		});
	},
	destroy : function(){
		var sf = this;
		delete sf.children;
		delete sf.isActive;
		delete sf.needHide;
		A.Menu.superclass.destroy.call(sf);
	},
	isAncestor : function(el){
		var sf = this,
			wrap = sf.wrap,
			ret = FALSE;
		if(wrap.dom!=el&&wrap.contains(el))
			ret = TRUE;
		else EACH(sf.children,function(child){
			if (child.isAncestor&&child.isAncestor(el)){
				return !(ret = TRUE);
			}
		});
		return ret;
	}
});

/**
 * @class Aurora.MenuItem
 * @extends Aurora.Component
 * <p>树形组件.
 * @author huazhen.wu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
A.MenuItem=Ext.extend(A.Component,{
	constructor: function(config) {
		this.hasIcon=FALSE;
		A.MenuItem.superclass.constructor.call(this, config);
	},
	initComponent : function(config){
		var sf = this;
		A.MenuItem.superclass.initComponent.call(sf,config);
		var issub = sf.parent!==sf.bar;
		sf.el=new Ext.Template(issub?sf.menuTpl:TPLT_MENU_BAR).append(sf.wrap,{
			text:sf.renderText,
			width:'16px'
		},TRUE);
		if(issub){
			sf.setIcon();
			sf.type && !sf.children &&
				sf.initMenuType();
		}
	},
	processListener: function(ou){
		var sf = this;
    	A.MenuItem.superclass.processListener.call(sf,ou);
    	sf.wrap[ou](EVT_MOUSE_UP,sf.onMouseUp,sf);
    },
    processMouseOverOut : function(ou){
    	var sf = this;
        sf.wrap[ou]('mouseover',sf.onMouseOver,sf)
    		[ou]('mouseout',sf.onMouseOut,sf);
    },
	initEvents : function(){
		A.MenuItem.superclass.initEvents.call(this);
		this.addEvents(
		/**
         * @event submit
         * menu的url定向.
         */
		EVT_SUBMIT,
		/**
         * @event mouseup
         * menu点击事件.
         */
		EVT_MOUSE_UP);
	},
	getWidth : function(){
		var sf = this;
		return sf.wrap.child('td.item-menu-text').getWidth()+(sf.parent==sf.bar?0:72);
	},
	initMenuType : function(){
		var sf = this,
			type = sf.type;
		(type=='radio'||type=='checkbox') &&	
			sf.wrap.child(SELECTOR_ITEM_MENU_ICON_DIV).addClass("type-"+type);
		sf.check();
	},
	check : function(value){
		this.wrap.child(SELECTOR_ITEM_MENU_ICON_DIV)[(this.checked=value)?'addClass':'removeClass']('check');
	},
	getBindingRecord : function(){
		return this.record;
	},
	setText : function(text){
		var sf = this;
		sf.text=text;
		sf.el.update(sf.renderText=sf.bar.renderText(sf.record));
	},
	setIcon : function(icon){
		var sf = this;
		if(!(icon||(icon=sf.icon))||sf.type)return;
		var _icon=icon.match(/^([^\?]*)\??([^?]*)?$/);
		sf.wrap.child(SELECTOR_ITEM_MENU_ICON_DIV).setStyle({
			'background-image':'url('+(_icon[1].match(/^[\/]{1}/)?sf.bar.context:'')+_icon[1]+')',
			'background-position':_icon[2]||'0 0'
		});
		sf.hasIcon=TRUE;
	},
    submit : function(){
    	var sf = this,
    		bar = sf.bar;
    	if(!sf.children){
    		var checked = sf.checked,
    			barchecked = bar.checked,
    			parent = sf.parent,
    			child = bar.children[bar.selectIndex],
    			record = sf.record;
			if(parent!=bar){
				child.inactive();
				child.hide();
				bar.isActive=FALSE;
			}
			if(sf.type=='checkbox'){
				record.set(bar.checked,!checked);
			}else if(sf.type=='radio'){
				if(checked)return;
				record.set(barchecked,TRUE);
				sf.groupName &&	EACH(parent.groups[sf.groupName],function(item){
					item!=sf &&
						item.record.set(barchecked,FALSE);
				});
			}
    	}
    	sf.fireEvent(EVT_MOUSE_UP,bar,sf);
    	sf.fireEvent(EVT_SUBMIT,bar);
    },
	onMouseUp : function(e){
		e.button==0 &&this.submit();
	},
	onMouseOver : function(e){
		this.active();
	},
	onMouseOut : function(e){
		var sf = this;
		!sf.isActive && sf.inactive();
		sf.showIntervalId && clearTimeout(sf.showIntervalId);
	},
	active : function(){
		var sf = this,
			parent = sf.parent,
			selectIndex = parent.selectIndex,
			index = sf.index;
		sf.wrap.addClass(CLASS_CURRENT_MENU);
		if(selectIndex===index)return;
		if(selectIndex!=NULL){
			var child = parent.children[selectIndex];
			child.inactive();
			if(parent==sf.bar)
				child.hide();
			else (function(){
				child.hide()
			}).defer(299);
		}
		parent.selectIndex=index;
	},
	inactive : function(){
		this.wrap.removeClass(CLASS_CURRENT_MENU);
	},
	show : function(){
	},
	hide : function(){
	},
	destroy : function(){
		delete this.el;
		delete this.bar;
		A.MenuItem.superclass.destroy.call(this);
	},
	menuTpl :['<TD class="item-menu-icon" align="center"><DIV></DIV></TD>',
				'<TD class="item-menu-text">{text}</TD>',
				'<TD></TD>']
});

/**
 * @class Aurora.Menu
 * @extends Aurora.MenuItem
 * <p>树形组件.
 * @author huazhen.wu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
A.Menu=Ext.extend(A.MenuItem,{
	constructor: function(config) {
		var sf = this;
		sf.children=[];
		sf.selectIndex=NULL;
		sf.groups={};
		sf.isActive=FALSE;
		sf.initMenus=FALSE;
		A.Menu.superclass.constructor.call(sf, config);
	},
	initComponent : function(config){
		var sf = this;
		A.Menu.superclass.initComponent.call(sf,config);
		sf.container=new Ext.Template(TPLT_CONTAINER).append(sf.bar.wrap,{
			zIndex:10000+sf.index,
			shadow:Ext.isIE?TPLT_IE_SHADOW:''
		},TRUE);
	},
	addMenus : function(options){
		if(!this.options)return;
		var sf = this,
			width=0,
			children = sf.children,
			j = children.length,
			container = sf.container;
		EACH(options,function(item){
			var menu,
				groupName,
				_id=sf.id+"-node"+j;
			new Ext.Template(TPLT_SUB_MENU_LIST_ITEM).append(container.child('tbody'),{
				id:_id
			});
			item.record.menu=menu=new Aurora[item.options?'Menu':'MenuItem'](Ext.apply(item,{
				id:_id,
				parent:sf,
				bar:sf.bar,
				index:j++
			}));
			(groupName = menu.groupName) &&
				(sf.groups[groupName]=sf.groups[groupName]||[]).push(menu);
			children.push(menu);
			delete item.record;
			width=Math.max(menu.getWidth(),width);
		});
		container.setWidth(width).child('table').setStyle({width:'100%'});
	},
    onMouseOver : function(e){
    	var sf = this;
		A.Menu.superclass.onMouseOver.call(sf,e);
		if(sf.parent===sf.bar)sf.show();
		else sf.showIntervalId=(function(){sf.show()}).defer(300);
	},
	show : function(){
		A.Menu.superclass.show.call(this);
		var sf = this,
			parent = sf.parent,
			wrap = sf.wrap,
			container = sf.container;
		if (!parent.isActive||sf.isActive)return;
		if(!sf.initMenus){
			sf.addMenus(sf.options);
			sf.initMenus=TRUE;
		}
		var xy=wrap.getXY(),x,y,
			W=container.getWidth(),
			H=container.getHeight(),
			PH=wrap.getHeight(),
			PW=wrap.getWidth(),
			BH=A.getViewportHeight()-3,
			BW=A.getViewportWidth()-3;
		if(parent===sf.bar){
			x=(xy[0]+W)>BW?((BW-W)<0?xy[0]:(BW-W)):xy[0];
			y=(xy[1]+PH+H)>BH?((xy[1]-H)<0?(xy[1]+PH):(xy[1]-H)):(xy[1]+PH);
		}else{
			x=(xy[0]+PW+W)>BW?((xy[0]-W)<0?(xy[0]+PW):(xy[0]-W)):(xy[0]+PW);
			y=(xy[1]+PH+H)>BH?((BH-H)<0?xy[1]:(BH-H)):xy[1];
		}
		container.moveTo(x,y).stopFx().fadeIn();
		sf.isActive=TRUE;
	},
	hide : function(){
		A.Menu.superclass.hide.call(this);
		var sf = this,
			selectIndex = sf.selectIndex;
		sf.container.stopFx().hide();
		if(selectIndex!=NULL){
			var child = sf.children[selectIndex];
			child.inactive();
			child.hide();
		}
		sf.isActive=FALSE;
		sf.selectIndex=NULL;
	},
	destroy : function(){
		var sf = this;
		sf.container.remove();
//		sf.shadow.remove();
		delete sf.children;
		delete sf.groups;
		A.Menu.superclass.destroy.call(sf);
	},
	isAncestor : function(el){
		var sf = this,
			container = sf.container,
			ret = FALSE;
		if(container.dom!=el&&container.contains(el))
			ret = TRUE;
		else EACH(sf.children,function(child){
			if (child.isAncestor&&child.isAncestor(el)){
				return !(ret = TRUE);
			}
		});
		return ret;
	},
	menuTpl :['<TD class="item-menu-icon" align="center"><DIV></DIV></TD>',
				'<TD class="item-menu-text">{text}</TD>',
				'<TD class="item-menu-arrow" align="center"><DIV></DIV></TD>']
});
})($A);