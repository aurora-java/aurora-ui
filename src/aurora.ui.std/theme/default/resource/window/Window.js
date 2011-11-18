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
        	}
        	return Number(zindex);
        }
    };
}();
/**
 * @class Aurora.Window
 * @extends Aurora.Component
 * <p>窗口组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Window = Ext.extend($A.Component,{
	constructor: function(config) { 
		if($A.WindowManager.get(config.id))return;
        this.draggable = true;
        this.closeable = true;
        this.fullScreen = false;
        this.modal = config.modal||true;
        this.cmps = {};
//        $A.focusWindow = null;
        $A.Window.superclass.constructor.call(this,config);
    },
    initComponent : function(config){
    	$A.Window.superclass.initComponent.call(this, config);
    	var sf = this; 
    	$A.WindowManager.put(sf);
    	var windowTpl = new Ext.Template(sf.getTemplate());
    	var shadowTpl = new Ext.Template(sf.getShadowTemplate());
    	sf.width = 1*(sf.width||350);
    	sf.height= 1*(sf.height||400);
    	if(sf.fullScreen){
    		sf.width=$A.getViewportWidth()-(Ext.isIE||!sf.hasVScrollBar()?0:17)-(Ext.isIE8?1:0);
    		sf.height=$A.getViewportHeight()-(Ext.isIE||!sf.hasHScrollBar()?26:43);
    		sf.draggable = false;
    		sf.marginheight=1;
    		sf.marginwidth=1;
    	}
        var urlAtt = '';
        if(sf.url){
            urlAtt = 'url="'+sf.url+'"';
        }
        sf.wrap = windowTpl.insertFirst(document.body, {title:sf.title,width:sf.width,bodywidth:sf.width-2,height:sf.height,url:urlAtt}, true);
        sf.shadow = shadowTpl.insertFirst(document.body, {}, true);
        sf.shadow.setWidth(sf.wrap.getWidth());
        sf.shadow.setHeight(sf.wrap.getHeight());
        sf.focusEl = sf.wrap.child('a[atype=win.focus]')
    	sf.title = sf.wrap.child('div[atype=window.title]');
    	sf.head = sf.wrap.child('td[atype=window.head]');
    	sf.body = sf.wrap.child('div[atype=window.body]');
        sf.closeBtn = sf.wrap.child('div[atype=window.close]');
        if(sf.draggable) sf.initDraggable();
        if(!sf.closeable)sf.closeBtn.hide();
        if(Ext.isEmpty(config.x)||Ext.isEmpty(config.y)){
            sf.center();
        }else{
            sf.move(config.x,config.y);
            this.toFront();
            this.focus.defer(10,this);
        }
        if(sf.url){
        	sf.showLoading();       
        	sf.load(sf.url,config.params)
        }
    },
    processListener: function(ou){
    	$A.Window.superclass.processListener.call(this,ou);
    	if(this.closeable) {
    	   this.closeBtn[ou]("click", this.onCloseClick,  this); 
    	   this.closeBtn[ou]("mouseover", this.onCloseOver,  this);
    	   this.closeBtn[ou]("mouseout", this.onCloseOut,  this);
    	   this.closeBtn[ou]("mousedown", this.onCloseDown,  this);
    	}
        if(!this.modal) this.wrap[ou]("click", this.toFront, this);
    	this.focusEl[ou]("keydown", this.handleKeyDown,  this);
    	if(this.draggable)this.head[ou]('mousedown', this.onMouseDown,this);
    },
    initEvents : function(){
    	$A.Window.superclass.initEvents.call(this);
    	this.addEvents(
    	/**
         * @event beforeclose
         * 窗口关闭前的事件.
         * <p>监听函数返回值为false时，不执行关闭</p>
         * @param {Window} this 当前窗口.         * 
         */
    	'beforeclose',
    	/**
         * @event close
         * 窗口关闭事件.
         * @param {Window} this 当前窗口.         * 
         */
    	'close',
    	/**
         * @event load
         * 窗口加载完毕.
         * @param {Window} this 当前窗口.
         */
    	'load');    	
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
    },
    /**
     * 窗口获得焦点.
     * 
     */
    focus: function(){
		this.focusEl.focus();
	},
	/**
     * 窗口居中.
     * 
     */
    center: function(){
    	var screenWidth = $A.getViewportWidth();
    	var screenHeight = $A.getViewportHeight();
    	var sl = document[Ext.isStrict&&!Ext.isWebKit?'documentElement':'body'].scrollLeft;
    	var st = document[Ext.isStrict&&!Ext.isWebKit?'documentElement':'body'].scrollTop;
    	var x = sl+Math.max((screenWidth - this.width)/2,0);
    	var y = st+Math.max((screenHeight - this.height-(Ext.isIE?26:23))/2,0);
//        this.shadow.setWidth(this.wrap.getWidth());
//        this.shadow.setHeight(this.wrap.getHeight());
        if(this.fullScreen){
        	x=sl;y=st;
            this.move(x,y,false);
        	this.shadow.moveTo(x,y)
        }else {
            this.move(x,y)
        }
//        this.wrap.moveTo(x,y);
        this.toFront();
        this.focus.defer(10,this);
    },
    /**
     * 移动窗口到指定位置.
     * 
     */
    move: function(x,y,m){
        this.wrap.moveTo(x,y);
        if(!m)this.shadow.moveTo(x+3,y+3)
    },
    hasVScrollBar : function(){
    	var body=document[Ext.isStrict?'documentElement':'body'];
    	return body.scrollTop>0||body.scrollHeight>body.clientHeight;
    },
    hasHScrollBar : function(){
    	var body=document[Ext.isStrict?'documentElement':'body'];
    	return body.scrollLeft>0||body.scrollWidth>body.clientWidth;
    },
    getShadowTemplate: function(){
    	return ['<DIV class="item-shadow"></DIV>']
    },
    getTemplate : function() {
        return [
            '<TABLE class="win-wrap" style="left:-1000px;top:-1000px;width:{width}px;" cellSpacing="0" cellPadding="0" border="0" {url}>',
			'<TBODY>',
			'<TR style="height:23px;" >',
				'<TD class="win-caption">',
					'<TABLE cellSpacing="0" unselectable="on"  onselectstart="return false;" style="height:23px;-moz-user-select:none;"  cellPadding="0" width="100%" border="0" unselectable="on">',
						'<TBODY>',
						'<TR>',
							'<TD unselectable="on" class="win-caption-label" atype="window.head" width="99%">',
								'<A atype="win.focus" href="#" class="win-fs" tabIndex="-1"></A><DIV unselectable="on" atype="window.title" unselectable="on">{title}</DIV>',
							'</TD>',
							'<TD unselectable="on" class="win-caption-button" noWrap>',
								'<DIV class="win-close" atype="window.close" unselectable="on"></DIV>',
							'</TD>',
							'<TD><DIV style="width:5px;"/></TD>',
						'</TR>',
						'</TBODY>',
					'</TABLE>',
				'</TD>',
			'</TR>',
			'<TR style="height:{height}px">',
				'<TD class="win-body" vAlign="top" unselectable="on">',
					'<DIV class="win-content" atype="window.body" style="position:relatvie;width:{bodywidth}px;height:{height}px;" unselectable="on"></DIV>',
				'</TD>',
			'</TR>',
			'</TBODY>',
		'</TABLE>'
        ];
    },
    /**
     * 窗口定位到最上层.
     * 
     */
    toFront : function(){ 
    	var myzindex = this.wrap.getStyle('z-index');
    	var zindex = $A.WindowManager.getZindex();
    	if(myzindex =='auto') myzindex = 0;
    	if(myzindex < zindex) {
	    	this.wrap.setStyle('z-index', zindex+5);
	    	this.shadow.setStyle('z-index', zindex+4);
	    	if(this.modal) $A.Cover.cover(this.wrap);
    	}
//    	$A.focusWindow = this;    	
    },
    onMouseDown : function(e){
    	var sf = this; 
    	//e.stopEvent();
    	sf.toFront();
    	var xy = sf.wrap.getXY();
    	sf.relativeX=xy[0]-e.getPageX();
		sf.relativeY=xy[1]-e.getPageY();
		sf.screenWidth = $A.getViewportWidth();
        sf.screenHeight = $A.getViewportHeight();
        if(!this.proxy) this.initProxy();
        this.proxy.show();
    	Ext.get(document.documentElement).on("mousemove", sf.onMouseMove, sf);
    	Ext.get(document.documentElement).on("mouseup", sf.onMouseUp, sf);
        sf.focus();
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
    	var sl = document[Ext.isStrict&&!Ext.isWebKit?'documentElement':'body'].scrollLeft;
    	var st = document[Ext.isStrict&&!Ext.isWebKit?'documentElement':'body'].scrollTop;
    	var sw = sl + this.screenWidth;
    	var sh = st + this.screenHeight;
    	var tx = e.getPageX()+this.relativeX;
    	var ty = e.getPageY()+this.relativeY;
//    	if(tx<=sl) tx =sl;
//    	if((tx+this.width)>= (sw-3)) tx = sw - this.width - 3;
//    	if(ty<=st) ty =st;
//    	if((ty+this.height)>= (sh-30)) ty = Math.max(sh - this.height - 30,0);
    	this.proxy.moveTo(tx,ty);
    },
    showLoading : function(){
    	this.body.update(_lang['window.loading']);
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
    	sf.proxy = Ext.get(Ext.DomHelper.insertFirst(Ext.getBody(),p));
//    	sf.proxy.hide();
    	var xy = sf.wrap.getXY();
    	sf.proxy.setWidth(sf.wrap.getWidth());
    	sf.proxy.setHeight(sf.wrap.getHeight());
    	sf.proxy.setLocation(xy[0], xy[1]);
    },
    onCloseClick : function(e){
        e.stopEvent();
    	this.close(); 	
    },
    onCloseOver : function(e){
        this.closeBtn.addClass("win-btn-over");
    },
    onCloseOut : function(e){
    	this.closeBtn.removeClass("win-btn-over");
    },
    onCloseDown : function(e){
    	this.closeBtn.removeClass("win-btn-over");
    	this.closeBtn.addClass("win-btn-down");
        Ext.get(document.documentElement).on("mouseup", this.onCloseUp, this);
    },
    onCloseUp : function(e){
    	this.closeBtn.removeClass("win-btn-down");
    	Ext.get(document.documentElement).un("mouseup", this.onCloseUp, this);
    },
    close : function(){
    	if(this.fireEvent('beforeclose',this)){
	    	$A.WindowManager.remove(this);
	    	this.destroy(); 
	    	this.fireEvent('close', this);
    	}
    },
    destroy : function(){
//    	$A.focusWindow = null;
    	var wrap = this.wrap;
    	if(!wrap)return;
    	if(this.proxy) this.proxy.remove();
    	if(this.modal) $A.Cover.uncover(this.wrap);
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
    	$A.Window.superclass.destroy.call(this);
    	delete this.title;
    	delete this.head;
    	delete this.body;
        delete this.closeBtn;
        delete this.proxy;
        wrap.remove();
        this.shadow.remove();
//        var sf = this;
//        setTimeout(function(){
//        	for(var key in sf.cmps){
//        		var cmp = sf.cmps[key];
//        		if(cmp.destroy){
//        			try{
//        				cmp.destroy();
//        			}catch(e){
//        				alert('销毁window出错: ' + e)
//        			}
//        		}
//        	}
//        },10)
    },
    /**
     * 窗口加载.
     * 
     * @param {String} url  加载的url
     * @param {Object} params  加载的参数
     */
    load : function(url,params){
//    	var cmps = $A.CmpManager.getAll();
//    	for(var key in cmps){
//    		this.oldcmps[key] = cmps[key];
//    	}
        
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
    setWidth : function(w){
    	w=$A.getViewportWidth()-(Ext.isIE||!this.hasVScrollBar()?0:17)-(Ext.isIE8?1:0);
    	$A.Window.superclass.setWidth.call(this,w);
    	this.body.setWidth(w-2);
    	this.shadow.setWidth(this.wrap.getWidth());
    },
    setHeight : function(h){
    	h=$A.getViewportHeight()-(Ext.isIE||!this.hasHScrollBar()?26:43);
    	Ext.fly(this.body.dom.parentNode.parentNode).setHeight(h);
    	this.body.setHeight(h);
        this.shadow.setHeight(this.wrap.getHeight());
    	var sl = document[Ext.isStrict?'documentElement':'body'].scrollLeft;
    	var st = document[Ext.isStrict?'documentElement':'body'].scrollTop;
        this.shadow.moveTo(sl,st);
        this.wrap.moveTo(sl,st);
    },
    onLoad : function(response, options){
    	if(!this.body) return;
    	this.clearLoading();
    	var html = response.responseText;
    	var res
    	try {
            res = Ext.decode(response.responseText);
        }catch(e){}
        if(res && res.success == false){
        	if(res.error){
                if(res.error.code  && res.error.code == 'session_expired'){
                            $A.showErrorMessage(_lang['ajax.error'],  _lang['session.expired']);
                }else{
            		$A.manager.fireEvent('ajaxfailed', $A.manager, options.url,options.para,res);
                    var st = res.error.stackTrace;
                    st = (st) ? st.replaceAll('\r\n','</br>') : '';
                    if(res.error.message) {
                        var h = (st=='') ? 150 : 250;
                        $A.showErrorMessage(_lang['window.error'], res.error.message+'</br>'+st,null,400,h);
                    }else{
                        $A.showErrorMessage(_lang['window.error'], st,null,400,250);
                    } 
                }
            }
            return;
        }
    	var sf = this
    	this.body.update(html,true,function(){
//	    	var cmps = $A.CmpManager.getAll();
//	    	for(var key in cmps){
//	    		if(sf.oldcmps[key]==null){	    			
//	    			sf.cmps[key] = cmps[key];
//	    		}
//	    	}
	    	sf.fireEvent('load',sf)
    	},this);
    }
});
/**
 * 
 * 显示提示信息窗口
 * 
 * @param {String} title 标题
 * @param {String} msg 内容
 * @param {Function} callback 回调函数
 * @param {int} width 宽度
 * @param {int} height 高度
 * @return {Window} 窗口对象
 */
$A.showMessage = function(title, msg,callback,width,height){
	return $A.showTypeMessage(title, msg, width||300, height||100,'win-info',callback);
}
/**
 * 显示带警告图标的窗口
 * 
 * @param {String} title 标题
 * @param {String} msg 内容
 * @param {Function} callback 回调函数
 * @param {int} width 宽度
 * @param {int} height 高度
 * @return {Window} 窗口对象
 */
$A.showWarningMessage = function(title, msg,callback,width,height){
	return $A.showTypeMessage(title, msg, width||300, height||100,'win-warning',callback);
}
/**
 * 显示带信息图标的窗口
 * 
 * @param {String} title 标题
 * @param {String} msg 内容
 * @param {Function} callback 回调函数
 * @param {int} width 宽度
 * @param {int} height 高度
 * @return {Window} 窗口对象
 */
$A.showInfoMessage = function(title, msg,callback,width,height){
	return $A.showTypeMessage(title, msg, width||300, height||100,'win-info',callback);
}
/**
 * 显示带错误图标的窗口
 * 
 * @param {String} title 标题
 * @param {String} msg 内容
 * @param {Function} callback 回调函数
 * @param {int} width 宽度
 * @param {int} height 高度
 * @return {Window} 窗口对象
 */
$A.showErrorMessage = function(title,msg,callback,width,height){
	return $A.showTypeMessage(title, msg, width||300, height||100,'win-error',callback);
}

$A.showTypeMessage = function(title, msg,width,height,css,callback){
	var msg = '<div class="win-icon '+css+'"><div class="win-type" style="width:'+(width-60)+'px;height:'+(height-62)+'px;">'+msg+'</div></div>';
	return $A.showOkWindow(title, msg, width, height,callback);	
} 
/**
 * 带图标的确定窗口.
 * 
 * @param {String} title 标题
 * @param {String} msg 内容
 * @param {Function} okfun 确定的callback
 * @param {Function} cancelfun 取消的callback
 * @param {int} width 宽度
 * @param {int} height 高度
 * @return {Window} 窗口对象
 */
$A.showConfirm = function(title, msg, okfun,cancelfun, width, height){
	width = width||300;
	height = height||100;
    var msg = '<div class="win-icon win-question"><div class="win-type" style="width:'+(width-60)+'px;height:'+(height-62)+'px;">'+msg+'</div></div>';
    return $A.showOkCancelWindow(title, msg, okfun,cancelfun, width, height);  	
}
//$A.hideWindow = function(){
//	var cmp = $A.CmpManager.get('aurora-msg')
//	if(cmp) cmp.close();
//}
//$A.showWindow = function(title, msg, width, height, cls){
//	cls = cls ||'';
//	var cmp = $A.CmpManager.get('aurora-msg')
//	if(cmp == null) {
//		cmp = new $A.Window({id:'aurora-msg',title:title, height:height,width:width});
//		if(msg){
//			cmp.body.update('<div class="'+cls+'" style="height:'+(height-68)+'px;">'+msg+'</div>');
//		}
//	}
//	return cmp;
//}
/**
 * 带确定取消按钮的窗口.
 * 
 * @param {String} title 标题
 * @param {String} msg 内容
 * @param {Function} okfun 确定的callback
 * @param {Function} cancelfun 取消的callback
 * @param {int} width 宽度
 * @param {int} height 高度
 * @return {Window} 窗口对象
 */
$A.showOkCancelWindow = function(title, msg, okfun,cancelfun,width, height){
    //var cmp = $A.CmpManager.get('aurora-msg-ok-cancel')
    //if(cmp == null) {
        var id = Ext.id(),okid = 'aurora-msg-ok'+id,cancelid = 'aurora-msg-cancel'+id,
        okbtnhtml = $A.Button.getTemplate(okid,_lang['window.button.ok']),
        cancelbtnhtml = $A.Button.getTemplate(cancelid,_lang['window.button.cancel']),
        cmp = new $A.Window({id:'aurora-msg-ok-cancel'+id,closeable:false,title:title, height:height||100,width:width||300});
        if(msg){
            cmp.body.update(msg+ '<center><table cellspacing="5"><tr><td>'+okbtnhtml+'</td><td>'+cancelbtnhtml+'</td><tr></table></center>',true,function(){
                var okbtn = $(okid);
                var cancelbtn = $(cancelid);
                cmp.cmps[okid] = okbtn;
                cmp.cmps[cancelid] = cancelbtn;
                okbtn.on('click',function(){
                	if(okfun && okfun.call(this,cmp) === false)return;
                	cmp.close();
                });
                cancelbtn.on('click',function(){
                	if(cancelfun && cancelfun.call(this,cmp) === false)return;
                	cmp.close();
                });
            });
        }
    //}
    return cmp;
}
/**
 * 带确定按钮的窗口.
 * 
 * @param {String} title 标题
 * @param {String} msg 内容
 * @param {Function} okfun 确定的callback
 * @param {Function} cancelfun 取消的callback
 * @param {int} width 宽度
 * @param {int} height 高度
 * @return {Window} 窗口对象
 */
$A.showOkWindow = function(title, msg, width, height,callback){
	//var cmp = $A.CmpManager.get('aurora-msg-ok');
	//if(cmp == null) {
		var id = Ext.id(),yesid = 'aurora-msg-yes'+id,
		btnhtml = $A.Button.getTemplate(yesid,_lang['window.button.ok']),
		cmp = new $A.Window({id:'aurora-msg-ok'+id,closeable:false,title:title, height:height,width:width});
		if(msg){
			cmp.body.update(msg+ '<center>'+btnhtml+'</center>',true,function(){
    			var btn = $(yesid);
                cmp.cmps[yesid] = btn;
                btn.on('click',function(){
                    if(callback && callback.call(this,cmp) === false)return;
                    cmp.close();
                });
                //btn.focus();
                btn.focus.defer(10,btn);
			});
		}
	//}
	return cmp;
}
/**
 * 上传附件窗口.
 * 
 * @param {String} path  当前的context路径
 * @param {String} title 上传窗口标题
 * @param {int} pkvalue  pkvalue
 * @param {String} source_type source_type
 * @param {int} max_size 最大上传大小(单位kb)  0表示不限制
 * @param {String} file_type 上传类型(*.doc,*.jpg)
 * @param {String} callback 回调函数的名字
 */
$A.showUploadWindow = function(path,title,source_type,pkvalue,max_size,file_type,callback){
    new Aurora.Window({id:'upload_window', url:path+'/upload.screen?callback='+callback+'&pkvalue='+pkvalue+'&source_type='+source_type+'&max_size='+(max_size||0)+'&file_type='+(file_type||'*.*'), title:title||_lang['window.upload.title'], height:330,width:595});
}