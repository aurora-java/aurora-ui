$A.WindowManager = function(){
    return {
        put : function(win){
        	if(!this.cache) this.cache = [];
        	this.cache.add(win)
        },
        getAll : function(){
        	return this.cache;
        },
        remove : function(win){
        	this.cache.remove(win);
        },
        get : function(id){
        	if(!this.cache) return null;
        	var win = null;
        	for(var i = 0;i<this.cache.length;i++){
    			if(this.cache[i].id == id) {
	        		win = this.cache[i];
    				break;      			
        		}
        	}
        	return win;
        },
        getZindex: function(){
        	var zindex = 40;
        	var all = this.getAll();
        	for(var i = 0;i<all.length;i++){
        		var win = all[i];
        		var zd = win.wrap.getStyle('z-index');
        		if(zd =='auto') zd = 0;
        		if(zd > zindex) zindex = zd;
				break;        		
        	}
        	return zindex;
        }
    };
}();

$A.Window = Ext.extend($A.Component,{
	constructor: function(config) { 
		if($A.WindowManager.get(config.id))return;
        this.draggable = true;
        this.closeable = true;
        this.modal = config.modal||true;
        this.oldcmps = {};
        this.cmps = {};
        $A.Window.superclass.constructor.call(this,config);
    },
    initComponent : function(config){
    	$A.Window.superclass.initComponent.call(this, config);
    	var sf = this; 
    	$A.WindowManager.put(sf);
    	var windowTpl = new Ext.Template(sf.getTemplate());
    	var shadowTpl = new Ext.Template(sf.getShadowTemplate());
    	sf.width = sf.width||350;sf.height=sf.height||400;
        sf.wrap = windowTpl.append(document.body, {title:sf.title,width:sf.width,bodywidth:sf.width-2,height:sf.height}, true);
        sf.shadow = shadowTpl.append(document.body, {}, true);
        sf.focusEl = sf.wrap.child('a[atype=win.focus]')
    	sf.title = sf.wrap.child('div[atype=window.title]');
    	sf.head = sf.wrap.child('td[atype=window.head]');
    	sf.body = sf.wrap.child('div[atype=window.body]');
        sf.closeBtn = sf.wrap.child('div[atype=window.close]');
        if(sf.draggable) sf.initDraggable();
        if(!sf.closeable)sf.closeBtn.hide();
        if(sf.url){
        	sf.showLoading();       
        	sf.load(sf.url,sf.params)
        }
        sf.center();
    },
    processListener: function(ou){
    	$A.Window.superclass.processListener.call(this,ou);
    	if(this.closeable) this.closeBtn[ou]("click", this.onClose,  this); 
    	this.wrap[ou]("click", this.toFront, this);
    	this.focusEl[ou]("keydown", this.handleKeyDown,  this);
    	if(this.draggable)this.head.on('mousedown', this.onMouseDown,this);
    },
    initEvents : function(){
    	$A.Window.superclass.initEvents.call(this);
    	this.addEvents('close','load');    	
    },
    handleKeyDown : function(e){
		e.stopEvent();
		var key = e.getKey();
		if(key == 27){
			this.close();
		}
    },
    initDraggable: function(){
    	this.head.addClass('item-draggable');
//    	this.head.on('mousedown', this.onMouseDown,this);
    },
    focus: function(){
		this.focusEl.focus();
	},
    center: function(){
    	var screenWidth = $A.getViewportWidth();
    	var screenHeight = $A.getViewportHeight();
    	var x = (screenWidth - this.width)/2;
    	var y = (screenHeight - this.height)/2;
        this.wrap.moveTo(x,y);
        this.shadow.setWidth(this.wrap.getWidth())
        this.shadow.setHeight(this.wrap.getHeight())
        this.shadow.moveTo(x+3,y+3)
        this.toFront();
        var sf = this;
        setTimeout(function(){
        	sf.focusEl.focus();
        },10)
    },
    getShadowTemplate: function(){
    	return ['<DIV class="item-shadow""></DIV>']
    },
    getTemplate : function() {
        return [
            '<TABLE class="window-wrap" style="width:{width}px;height:{height}px;" cellSpacing="0" cellPadding="0" border="0">',
			'<TBODY>',
			'<TR style="height:25px;" >',
				'<TD class="window-caption">',
					'<TABLE cellSpacing="0" unselectable="on"  onselectstart="return false;" style="-moz-user-select:none;"  cellPadding="1" width="100%" height="100%" border="0" unselectable="on">',
						'<TBODY>',
						'<TR>',
							'<TD unselectable="on" class="window-caption-label" atype="window.head" width="99%">',
								'<A atype="win.focus" href="#" class="win-fs" tabIndex="-1">&#160;</A><DIV unselectable="on" atype="window.title" unselectable="on">{title}</DIV>',
							'</TD>',
							'<TD unselectable="on" class="window-caption-button" noWrap>',
								'<DIV class="window-close" atype="window.close" unselectable="on"></DIV>',
							'</TD>',
						'</TR>',
						'</TBODY>',
					'</TABLE>',
				'</TD>',
			'</TR>',
			'<TR style="height:99%">',
				'<TD class="window-body" vAlign="top" unselectable="on">',
					'<DIV class="window-content" atype="window.body" style="position:relatvie;width:{bodywidth}px;height:{height}px;" unselectable="on"></DIV>',
				'</TD>',
			'</TR>',
			'</TBODY>',
		'</TABLE>'
        ];
    },
    /**toFront**/
    toFront : function(){ 
    	var myzindex = this.wrap.getStyle('z-index');
    	var zindex = $A.WindowManager.getZindex();
    	if(myzindex =='auto') myzindex = 0;
    	if(myzindex < zindex) {
	    	this.wrap.setStyle('z-index', zindex+5);
	    	this.shadow.setStyle('z-index', zindex+4);
	    	if(this.modal) $A.Mask.mask(this.wrap);
    	}
    },
    onMouseDown : function(e){
    	var sf = this; 
    	//e.stopEvent();
//    	sf.toFront();
    	var xy = sf.wrap.getXY();
    	sf.relativeX=xy[0]-e.getPageX();
		sf.relativeY=xy[1]-e.getPageY();
    	Ext.get(document.documentElement).on("mousemove", sf.onMouseMove, sf);
    	Ext.get(document.documentElement).on("mouseup", sf.onMouseUp, sf);
    },
    onMouseUp : function(e){
    	var sf = this; 
    	Ext.get(document.documentElement).un("mousemove", sf.onMouseMove, sf);
    	Ext.get(document.documentElement).un("mouseup", sf.onMouseUp, sf);
    	if(sf.proxy){
    		sf.wrap.moveTo(sf.proxy.getX(),sf.proxy.getY());
    		sf.shadow.moveTo(sf.proxy.getX()+3,sf.proxy.getY()+3);
	    	sf.proxy.hide();
    	}
    },
    onMouseMove : function(e){
    	e.stopEvent();
    	if(!this.proxy) this.initProxy();
    	this.proxy.show();
    	this.proxy.moveTo(e.getPageX()+this.relativeX,e.getPageY()+this.relativeY);
    },
    showLoading : function(){
    	this.body.update('正在加载...');
    	this.body.setStyle('text-align','center');
    	this.body.setStyle('line-height',5);
    },
    clearLoading : function(){
    	this.body.update('');
    	this.body.setStyle('text-align','');
    	this.body.setStyle('line-height','');
    },
    initProxy : function(){
    	var sf = this; 
    	var p = '<DIV style="border:1px dashed black;Z-INDEX: 10000; LEFT: 0px; WIDTH: 100%; CURSOR: default; POSITION: absolute; TOP: 0px; HEIGHT: 621px;" unselectable="on"></DIV>'
    	sf.proxy = Ext.get(Ext.DomHelper.append(Ext.getBody(),p));
    	var xy = sf.wrap.getXY();
    	sf.proxy.setWidth(sf.wrap.getWidth());
    	sf.proxy.setHeight(sf.wrap.getHeight());
    	sf.proxy.setLocation(xy[0], xy[1]);
    },
    onClose : function(e){
    	 this.close(); 	
    },
    close : function(){
    	$A.WindowManager.remove(this);
    	this.destroy(); 
    	this.fireEvent('close', this)
    },
    destroy : function(){
    	for(var key in this.cmps){
    		var cmp = this.cmps[key];
    		if(cmp.destroy){
    			try{
    				cmp.destroy();
    			}catch(e){
    				alert('销毁window出错: ' + e)
    			}
    		}
    	}
    	var wrap = this.wrap;
    	if(!wrap)return;
    	if(this.proxy) this.proxy.remove();
    	if(this.modal) $A.Mask.unmask(this.wrap);
    	$A.Window.superclass.destroy.call(this);
    	delete this.title;
    	delete this.head;
    	delete this.body;
        delete this.closeBtn;
        delete this.proxy;
        wrap.remove();
        this.shadow.remove();
    },
    load : function(url,params){
    	var cmps = $A.CmpManager.getAll();
    	for(var key in cmps){
    		this.oldcmps[key] = cmps[key];
    	}
    	Ext.Ajax.request({
			url: url,
			params:params||{},
		   	success: this.onLoad.createDelegate(this)
		});		
    },
    setChildzindex : function(z){
    	for(var key in this.cmps){
    		var c = this.cmps[key];
    		c.setZindex(z)
    	}
    },
    onLoad : function(response, options){
    	this.clearLoading();
    	var html = response.responseText;
    	var sf = this
    	this.body.update(html,true,function(){
	    	var cmps = $A.CmpManager.getAll();
	    	for(var key in cmps){
	    		if(sf.oldcmps[key]==null){	    			
	    			sf.cmps[key] = cmps[key];
	    		}
	    	}
	    	sf.fireEvent('load',sf)
    	});
    }
});
$A.showMessage = function(title, msg){
	return $A.showWindow(title, msg, 300, 100, 'win-alert');
}
$A.showComfirm = function(msg, callback){
	var params = {
		win:'aurora-confirm',
		msg:msg||'确认操作?',
		callback:callback||''
	}
	var url = 'confirm.screen';
	var win = new Aurora.Window({id:'aurora-confirm',url: url, params:params, title:'确认', height:130,width:250});
}
$A.hideWindow = function(){
	var cmp = $A.CmpManager.get('aurora-msg')
	if(cmp) cmp.close();
}
$A.showWindow = function(title, msg, width, height, cls){
	cls = cls ||'';
	var cmp = $A.CmpManager.get('aurora-msg')
	if(cmp == null) {
		cmp = new $A.Window({id:'aurora-msg',title:title, height:height,width:width});	
		if(msg)cmp.body.update('<div class="'+cls+'">'+msg+'</div>');
	}
	return cmp;
}