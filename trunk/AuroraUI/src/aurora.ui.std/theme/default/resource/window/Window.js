(function(A){
var cache = [],
	WINDOW_MANAGER =  A.WindowManager = {
	    put : function(win){
	        cache.add(win)
	    },
	    getAll : function(){
	        return cache;
	    },
	    remove : function(win){
	        cache.remove(win);
	    },
	    get : function(id){
	        var win = null;
	        Ext.each(cache,function(w){
	        	if(w.id == id){
	        		win = w;
					return false;            	
	        	}
	        });
	        return win;
	    },
	    getZindex: function(){
	        var zindex = 40;
	        Ext.each(cache,function(win){
	        	zindex = Math.max(Number(win.wrap.getStyle('z-index'))||0,zindex);
	        });
	        return zindex;
	    }
	}
/**
 * @class Aurora.Window
 * @extends Aurora.Component
 * <p>窗口组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
A.Window = Ext.extend(A.Component,{
    constructor: function(config) { 
        if(WINDOW_MANAGER.get(config.id))return;
        var sf = this;
        sf.draggable = true;
        sf.closeable = true;
        sf.fullScreen = false;
        sf.modal = config.modal||true;
        sf.cmps = {};
//        A.focusWindow = null;
        A.Window.superclass.constructor.call(sf,config);
    },
    initComponent : function(config){
        var sf = this;
        A.Window.superclass.initComponent.call(sf, config);
        WINDOW_MANAGER.put(sf);
        sf.width = 1*(sf.width||350);
        sf.height= 1*(sf.height||400);
        if(sf.fullScreen){
            var style = document.documentElement.style;
            sf.overFlow = style.overflow;
            style.overflow = "hidden";
            sf.width=A.getViewportWidth();
            sf.height=A.getViewportHeight()-26;
            sf.draggable = false;
            sf.marginheight=1;
            sf.marginwidth=1;
        }
        var url = sf.url,
        	isIE = Ext.isIE,
        	wrap = sf.wrap = new Ext.Template(sf.getTemplate()).insertFirst(document.body, {
        	id:sf.id,
        	title:sf.title,
        	width:sf.width,
        	bodywidth:sf.width-2,
        	height:sf.height,
        	url:url?'url="'+url+'"':'',
        	clz:(sf.fullScreen ? 'full-window ' : '')+(sf.className||''),
        	shadow:isIE?'<DIV class="item-ie-shadow"></DIV>':''
    	}, true);
        wrap.cmps = sf.cmps;
        sf.title = wrap.child('div[atype=window.title]');
        sf.head = wrap.child('td[atype=window.head]');
        sf.body = wrap.child('div[atype=window.body]');
        sf.closeBtn = wrap.child('div[atype=window.close]');
        if(sf.draggable) sf.initDraggable();
        if(!sf.closeable)sf.closeBtn.hide();
        if(Ext.isEmpty(config.x)||Ext.isEmpty(config.y)||sf.fullScreen){
            sf.center();
        }else{
            sf.move(config.x,config.y);
            sf.toFront();
            sf.focus.defer(10,sf);
        }
        url && sf.load(url,config.params);
    },
    processListener: function(ou){
    	var sf = this;
        A.Window.superclass.processListener.call(sf,ou);
        sf.closeable &&
			sf.closeBtn[ou]("click", sf.onCloseClick,  sf) 
           	[ou]("mouseover", sf.onCloseOver,  sf)
           	[ou]("mouseout", sf.onCloseOut,  sf)
			[ou]("mousedown", sf.onCloseDown,  sf);
        sf.wrap[ou]("click", sf.onClick, sf,{stopPropagation:true})
        	[ou]("keydown", sf.onKeyDown,  sf);
    	sf.draggable && sf.head[ou]('mousedown', sf.onMouseDown,sf);
    },
    initEvents : function(){
        A.Window.superclass.initEvents.call(this);
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
    onClick : function(e){
    	if(!this.modal)this.toFront();
    },
    onKeyDown : function(e){
        var key = e.getKey();
        if(key == 9){
            var fk,lk,ck,cmp,cmps = this.cmps;
            for(var k in cmps){
                cmp = cmps[k];
                if(cmp.focus){
                    if(!fk)fk=k;
	                lk=k;
                }
                if(cmp.hasFocus){
                    ck = k;
                }
            }
            if(e.shiftKey){
                var temp = lk;
                lk = fk;
                fk = temp;
            }
            if(ck==lk){
                e.stopEvent();
                if(cmp && cmp.blur)cmp.blur();
                fk && cmps[fk].focus();
            }
        }else if(key == 27){
            e.stopEvent();
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
        this.wrap.focus();
    },
    /**
     * 窗口居中.
     * 
     */
    center: function(){
        var sf = this,
        	screenWidth = A.getViewportWidth(),
        	screenHeight = A.getViewportHeight(),
        	scroll = Ext.getBody().getScroll(),
        	sl = scroll.left,
        	st = scroll.top,
        	x = sl+Math.max((screenWidth - sf.width)/2,0),
        	y = st+Math.max((screenHeight - sf.height-(Ext.isIE?26:23))/2,0);
//        sf.shadow.setWidth(sf.wrap.getWidth());
//        sf.shadow.setHeight(sf.wrap.getHeight());
        if(sf.fullScreen){
            x=sl;y=st;
            sf.move(x,y,true);
        }else {
            sf.move(x,y)
        }
//        sf.wrap.moveTo(x,y);
        sf.toFront();
        sf.focus.defer(10,sf);
    },
    /**
     * 移动窗口到指定位置.
     * 
     */
    move: function(x,y,m){
        this.wrap.moveTo(x,y);
    },
    getTemplate : function() {
        return [
            '<DIV id="{id}" class="win-wrap item-shadow {clz}" style="left:-10000px;top:-10000px;width:{width}px;outline:none" hideFocus tabIndex="-1" {url}>',
            	'{shadow}',
	            '<TABLE cellSpacing="0" cellPadding="0" border="0" width="100%">',
	            '<TBODY>',
	            '<TR style="height:23px;" >',
	                '<TD class="win-caption">',
	                    '<TABLE cellSpacing="0" class="win-cap" unselectable="on"  onselectstart="return false;" style="height:23px;-moz-user-select:none;"  cellPadding="0" width="100%" border="0" unselectable="on">',
	                        '<TBODY>',
	                        '<TR>',
	                            '<TD unselectable="on" class="win-caption-label" atype="window.head" width="99%">',
	                                '<DIV unselectable="on" atype="window.title" unselectable="on">{title}</DIV>',
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
	        '</TABLE>',
        '</DIV>'
        ];
    },
    /**
     * 窗口定位到最上层.
     * 
     */
    toFront : function(){ 
        var myzindex = this.wrap.getStyle('z-index');
        var zindex = WINDOW_MANAGER.getZindex();
        if(myzindex =='auto') myzindex = 0;
        if(myzindex < zindex) {
            this.wrap.setStyle('z-index', zindex+5);
            if(this.modal) A.Cover.cover(this.wrap);
        }
        
        //去除下面window遮盖的透明度
        var alls = WINDOW_MANAGER.getAll()
        for(var i=0;i<alls.length;i++){
            var pw = alls[i];
            if(pw != this){
                var cover = A.Cover.container[pw.wrap.id];
                if(cover)cover.setStyle({
                    filter: 'alpha(opacity=0)',
                    opacity: '0',
                    mozopacity: '0'
                })
            }
        }
        
        
//      A.focusWindow = this;      
    },
    onMouseDown : function(e){
        var sf = this; 
        //e.stopEvent();
        sf.toFront();
        var xy = sf.wrap.getXY();
        sf.relativeX=xy[0]-e.getPageX();
        sf.relativeY=xy[1]-e.getPageY();
        sf.screenWidth = A.getViewportWidth();
        sf.screenHeight = A.getViewportHeight();
        if(!this.proxy) this.initProxy();
        this.proxy.show();
        Ext.get(document.documentElement).on("click", sf.stopClick, sf);
        Ext.get(document.documentElement).on("mousemove", sf.onMouseMove, sf);
        Ext.get(document.documentElement).on("mouseup", sf.onMouseUp, sf);
//        sf.focus();
    },
    stopClick :function(e){
        e.stopEvent();
        Ext.get(document.documentElement).un("click", this.stopClick, this);
    },
    onMouseUp : function(e){
        e.stopEvent();
        var sf = this; 
        Ext.get(document.documentElement).un("mousemove", sf.onMouseMove, sf);
        Ext.get(document.documentElement).un("mouseup", sf.onMouseUp, sf);
        if(sf.proxy){
            sf.wrap.moveTo(sf.proxy.getX(),sf.proxy.getY());
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
//      if(tx<=sl) tx =sl;
//      if((tx+this.width)>= (sw-3)) tx = sw - this.width - 3;
//      if(ty<=st) ty =st;
//      if((ty+this.height)>= (sh-30)) ty = Math.max(sh - this.height - 30,0);
        this.proxy.moveTo(tx,ty);
    },
    checkDataSetNotification : function (){
        var r = Aurora.checkNotification(this.cmps);
        if(r){
            var sf = this;
            A.showConfirm(_lang['dataset.info'], r, function(){
                sf.close(true);                
            })
            return false;
        }
        return true;
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
        var p = '<DIV style="border:1px dashed black;Z-INDEX: 10000; LEFT: 0px; WIDTH: 100%; CURSOR: move; POSITION: absolute; TOP: 0px; HEIGHT: 621px;-moz-user-select:none;" unselectable="on"  onselectstart="return false;"></DIV>'
        sf.proxy = Ext.get(Ext.DomHelper.insertFirst(Ext.getBody(),p));
//      sf.proxy.hide();
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
    close : function(nocheck){
        if(!nocheck && !this.checkDataSetNotification()) return;
        if(this.fireEvent('beforeclose',this)){
            if(this.wrap)this.wrap.destroying = true;
            WINDOW_MANAGER.remove(this);
            if(this.fullScreen){
                Ext.fly(document.documentElement).setStyle({'overflow':this.overFlow})
            }
            this.destroy();
            this.fireEvent('close', this);
        }
        
        //去除下面window遮盖的透明度
        var alls = WINDOW_MANAGER.getAll()
        for(var i=0;i<alls.length-1;i++){
            var pw = alls[i];
            if(pw != this){
                var cover = A.Cover.container[pw.wrap.id];
                if(cover)cover.setStyle({
                    filter: 'alpha(opacity=0)',
                    opacity: '0',
                    mozopacity: '0'
                })
            }
        }
        
        
        var cw = alls[alls.length-1];
        if(cw){
            var cover = A.Cover.container[cw.wrap.id];
            if(cover){
	            cover.setStyle({
	                opacity: '',
	                mozopacity: ''
	            })
            	cover.dom.style.cssText = cover.dom.style.cssText.replace(/filter[^;]*/i,'');
            }
        }
    },
    clearBody : function(){
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
    },
    destroy : function(){
//      A.focusWindow = null;
        var wrap = this.wrap;
        if(!wrap)return;
        if(this.proxy) this.proxy.remove();
        if(this.modal) A.Cover.uncover(this.wrap);
        A.Window.superclass.destroy.call(this);
        this.clearBody();
        delete this.title;
        delete this.head;
        delete this.body;
        delete this.closeBtn;
        delete this.proxy;
        wrap.remove();
//        var sf = this;
//        setTimeout(function(){
//          for(var key in sf.cmps){
//              var cmp = sf.cmps[key];
//              if(cmp.destroy){
//                  try{
//                      cmp.destroy();
//                  }catch(e){
//                      alert('销毁window出错: ' + e)
//                  }
//              }
//          }
//        },10)
    },
    /**
     * 窗口加载.
     * 
     * @param {String} url  加载的url
     * @param {Object} params  加载的参数
     */
    load : function(url,params){
//      var cmps = A.CmpManager.getAll();
//      for(var key in cmps){
//          this.oldcmps[key] = cmps[key];
//      }
        this.clearBody();
        this.showLoading();       
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
        w=A.getViewportWidth();
        A.Window.superclass.setWidth.call(this,w);
        this.body.setWidth(w-2);
    },
    setHeight : function(h){
        var sf = this,
        	scroll = Ext.getBody().getScroll(),
        	sl = scroll.left,
        	st = scroll.top;
        h=A.getViewportHeight()-26;
        Ext.fly(sf.body.dom.parentNode.parentNode).setHeight(h);
        sf.body.setHeight(h);
        sf.wrap.moveTo(sl,st);
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
                if(res.error.code  && res.error.code == 'session_expired' || res.error.code == 'login_required'){
                    if(A.manager.fireEvent('timeout', A.manager))
                    A.showErrorMessage(_lang['ajax.error'],  _lang['session.expired']);
                }else{
                    A.manager.fireEvent('ajaxfailed', A.manager, options.url,options.para,res);
                    var st = res.error.stackTrace;
                    st = (st) ? st.replaceAll('\r\n','</br>') : '';
                    if(res.error.message) {
                        var h = (st=='') ? 150 : 250;
                        A.showErrorMessage(_lang['window.error'], res.error.message+'</br>'+st,null,400,h);
                    }else{
                        A.showErrorMessage(_lang['window.error'], st,null,400,250);
                    } 
                }
            }
            return;
        }
        var sf = this
        this.body.update(html,true,function(){
//          var cmps = A.CmpManager.getAll();
//          for(var key in cmps){
//              if(sf.oldcmps[key]==null){                  
//                  sf.cmps[key] = cmps[key];
//              }
//          }
            sf.fireEvent('load',sf)
        },this.wrap);
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
A.showMessage = function(title, msg,callback,width,height){
    return A.showTypeMessage(title, msg, width||300, height||100,'win-info',callback);
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
A.showWarningMessage = function(title, msg,callback,width,height){
    return A.showTypeMessage(title, msg, width||300, height||100,'win-warning',callback);
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
A.showInfoMessage = function(title, msg,callback,width,height){
    return A.showTypeMessage(title, msg, width||300, height||100,'win-info',callback);
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
A.showErrorMessage = function(title,msg,callback,width,height){
    return A.showTypeMessage(title, msg, width||300, height||100,'win-error',callback);
}

A.showTypeMessage = function(title, msg,width,height,css,callback){
    var msg = '<div class="win-icon '+css+'"><div class="win-type" style="width:'+(width-70)+'px;height:'+(height-62)+'px;">'+msg+'</div></div>';
    return A.showOkWindow(title, msg, width, height,callback); 
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
A.showConfirm = function(title, msg, okfun,cancelfun, width, height){
    return A.showOkCancelWindow(title, msg, okfun,cancelfun, width, height);   
}
//A.hideWindow = function(){
//  var cmp = A.CmpManager.get('aurora-msg')
//  if(cmp) cmp.close();
//}
//A.showWindow = function(title, msg, width, height, cls){
//  cls = cls ||'';
//  var cmp = A.CmpManager.get('aurora-msg')
//  if(cmp == null) {
//      cmp = new A.Window({id:'aurora-msg',title:title, height:height,width:width});
//      if(msg){
//          cmp.body.update('<div class="'+cls+'" style="height:'+(height-68)+'px;">'+msg+'</div>');
//      }
//  }
//  return cmp;
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
A.showOkCancelWindow = function(title, msg, okfun,cancelfun,width, height){
    //var cmp = A.CmpManager.get('aurora-msg-ok-cancel')
    //if(cmp == null) {
        width = width||300;
        height = height||100;
        var id = Ext.id(),okid = 'aurora-msg-ok'+id,cancelid = 'aurora-msg-cancel'+id,
        okbtnhtml = A.Button.getTemplate(okid,_lang['window.button.ok']),
        cancelbtnhtml = A.Button.getTemplate(cancelid,_lang['window.button.cancel']),
        cmp = new A.Window({id:'aurora-msg-ok-cancel'+id,closeable:true,title:title, height:height||100,width:width||300});
        if(!Ext.isEmpty(msg,true)){
            msg = '<div class="win-icon win-question"><div class="win-type" style="width:'+(width-70)+'px;height:'+(height-62)+'px;">'+msg+'</div></div>';
            cmp.body.update(msg+ '<center><table cellspacing="5"><tr><td>'+okbtnhtml+'</td><td>'+cancelbtnhtml+'</td></tr></table></center>',true,function(){
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
A.showYesNoCancelWindow = function(title, msg, yesfun,nofun,width, height){
    //var cmp = A.CmpManager.get('aurora-msg-ok-cancel')
    //if(cmp == null) {
        width = width||300;
        height = height||100;
        var id = Ext.id(),
        	yesid = 'aurora-msg-yes'+id,
        	noid = 'aurora-msg-no'+id,
        	cancelid = 'aurora-msg-cancel'+id,
	        yesbtnhtml = A.Button.getTemplate(yesid,_lang['window.button.yes']),
	        nobtnhtml = A.Button.getTemplate(noid,_lang['window.button.no']),
	        cancelbtnhtml = A.Button.getTemplate(cancelid,_lang['window.button.cancel']),
        	cmp = new A.Window({id:'aurora-msg-yes-no-cancel'+id,closeable:true,title:title, height:height||100,width:width||300});
        if(!Ext.isEmpty(msg,true)){
            msg = '<div class="win-icon win-question"><div class="win-type" style="width:'+(width-70)+'px;height:'+(height-62)+'px;">'+msg+'</div></div>';
            cmp.body.update(msg+ '<center><table cellspacing="5"><tr><td>'+yesbtnhtml+'</td><td>'+nobtnhtml+'</td><td>'+cancelbtnhtml+'</td></tr></table></center>',true,function(){
                var yesbtn = $(yesid),
                	nobtn = $(noid),
                	cancelbtn = $(cancelid);
                cmp.cmps[yesid] = yesbtn;
                cmp.cmps[noid] = nobtn;
                cmp.cmps[cancelid] = cancelbtn;
                yesbtn.on('click',function(){
                    if(yesfun && yesfun.call(this,cmp) === false)return;
                    cmp.close();
                });
                nobtn.on('click',function(){
                    if(nofun && nofun.call(this,cmp) === false)return;
                    cmp.close();
                });
                cancelbtn.on('click',function(){
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
A.showOkWindow = function(title, msg, width, height,callback){
    //var cmp = A.CmpManager.get('aurora-msg-ok');
    //if(cmp == null) {
        var id = Ext.id(),yesid = 'aurora-msg-yes'+id,
        btnhtml = A.Button.getTemplate(yesid,_lang['window.button.ok']),
        cmp = new A.Window({id:'aurora-msg-ok'+id,closeable:true,title:title, height:height,width:width});
        if(!Ext.isEmpty(msg,true)){
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
A.showUploadWindow = function(path,title,source_type,pkvalue,max_size,file_type,callback){
    new Aurora.Window({id:'upload_window', url:path+'/upload.screen?callback='+callback+'&pkvalue='+pkvalue+'&source_type='+source_type+'&max_size='+(max_size||0)+'&file_type='+(file_type||'*.*'), title:title||_lang['window.upload.title'], height:330,width:595});
};
})($A);