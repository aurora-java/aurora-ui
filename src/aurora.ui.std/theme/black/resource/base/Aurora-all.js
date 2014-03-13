/*
 * Aurora UI Library.
 * Copyright(c) 2010, Hand China Co.,Ltd.
 * 
 * http://www.hand-china.com
 */

/**
 * @class Aurora
 * Aurora UI 核心工具类.
 * @author 牛佳庆
 * @singleton
 */
 
Ext.Ajax.timeout = 1800000;

$A = Aurora = {version: '1.0',revision:'$Rev:$'};
//$A.firstFire = false;
$A.fireWindowResize = function(){
    if($A.winWidth != $A.getViewportWidth() || $A.winHeight != $A.getViewportHeight()){
        $A.winHeight = $A.getViewportHeight();
        $A.winWidth = $A.getViewportWidth();
        $A.Cover.resizeCover();
    }
}
if(Ext.isIE6)Ext.EventManager.on(window, "resize", $A.fireWindowResize, this);



$A.cache = {};
$A.cmps = {};
$A.onReady = function(fn, scope, options){
    if(window['__host']){
        if(!$A.loadEvent)$A.loadEvent = new Ext.util.Event();
        $A.loadEvent.addListener(fn, scope, options);
    }else{
        Ext.onReady(fn, scope, options);
    }
}//Ext.onReady;

$A.get = Ext.get;
//$A.focusWindow;
//$A.focusTab;
$A.defaultDateFormat="isoDate";
$A.defaultDateTimeFormat="yyyy-mm-dd HH:MM:ss";
$A.defaultChineseLength = 2;

/**
 * 页面地址重定向
 * @param {String} url
 */
$A.go=function(url){
    if(!url)return;
    var r=Math.random();
    location.href=url+(url.indexOf('?')==-1?'?':'&')+'__r__='+r;
}

/**
 * 将对象居中
 * @param {Object/String} el Aurora组件对象或者是DOM对象或者是对象的ID字符串
 */
$A.center = function(el){
    var ele;
    if(typeof(el)=="string"){
        var cmp = $A.CmpManager.get(el)
        if(cmp){
            if(cmp.wrap){
                ele = cmp.wrap;
            }
        }else{
             ele = Ext.get(el);
        }             
    }else{
        ele = Ext.get(el);
    }
    var screenWidth = $A.getViewportWidth();
    var screenHeight = $A.getViewportHeight();
    var x = Math.max(0,(screenWidth - ele.getWidth())/2);
    var y = Math.max(0,(screenHeight - ele.getHeight())/2);
    ele.setStyle('position','absolute');
    ele.moveTo(x,y);
}

/**
 * 设置主题
 * @param {String} theme 主题名
 */
$A.setTheme = function(theme){
    if(theme) {
        var exp  = new Date();   
        exp.setTime(exp.getTime() + 24*3600*1000);
        document.cookie = "app_theme="+ escape (theme) + ";expires=" + exp.toGMTString(); 
        window.location.reload();
    }
}
$A.getTheme = function(){
    return this.getCookie("app_theme");
}
$A.CmpManager = function(){
    return {
        put : function(id, cmp){
            if(!this.cache) this.cache = {};
            if(this.cache[id] != null) {
                alert("错误: ID为' " + id +" '的组件已经存在!");
                return;
            }
            if(window['__host']){
                    window['__host'].cmps[id] = cmp;
                    cmp['__host'] = window['__host'];
            }
//          if($A.focusWindow) $A.focusWindow.cmps[id] = cmp;
//          if($A.focusTab) $A.focusTab.cmps[id] = cmp;
            this.cache[id]=cmp;
            cmp.on('mouseover',$A.CmpManager.onCmpOver,$A.CmpManager);
            cmp.on('mouseout',$A.CmpManager.onCmpOut,$A.CmpManager);
        },
        onCmpOver: function(cmp, e){
            if($A.validInfoType != 'tip') return;
            if(($A.Grid && cmp instanceof $A.Grid)||($A.Table && cmp instanceof $A.Table)){
                var ds = cmp.dataset;
                if(!ds ||!e.target)return;
                var target = Ext.fly(e.target).findParent('td');
                if(target){
                    var atype = Ext.fly(target).getAttributeNS("","atype");
                    if(atype == 'grid-cell'||atype == 'table-cell'){
                        var rid = Ext.fly(target).getAttributeNS("","recordid");
                        var record = ds.findById(rid);
                        if(record){
                            var name = Ext.fly(target).getAttributeNS("","dataindex"); 
                            var field = record.getMeta().getField(name)
                            if(!field)return;
                            var msg = record.valid[name] || field.get('tooltip');                           
                            if(Ext.isEmpty(msg))return;
                            $A.ToolTip.show(target, msg);
                        }
                    }
                }
            }else{
                if(cmp.binder){
                    var ds = cmp.binder.ds;
                    if(!ds)return;
                    var record = cmp.record;
                    if(!record)return;
                    var field = record.getMeta().getField(cmp.binder.name)
                    var msg = record.valid[cmp.binder.name] || field.get('tooltip');                
                    if(Ext.isEmpty(msg))return;
                    $A.ToolTip.show(cmp.id, msg);
                }
            }
        },
        onCmpOut: function(cmp,e){
            if($A.validInfoType != 'tip') return;
            $A.ToolTip.hide();
        },
        getAll : function(){
            return this.cache;
        },
        remove : function(id){
            var cmp = this.cache[id];
            if(cmp['__host'] && cmp['__host'].cmps){
                delete cmp['__host'].cmps[id];        
            }
            cmp.un('mouseover',$A.CmpManager.onCmpOver,$A.CmpManager);
            cmp.un('mouseout',$A.CmpManager.onCmpOut,$A.CmpManager);
            delete this.cache[id];
        },
        get : function(id){
            if(!this.cache) return null;
            return this.cache[id];
        }
    };
}();
Ext.Ajax.on("requestexception", function(conn, response, options) {
    if($A.slideBarEnable)$A.SideBar.enable = $A.slideBarEnable;
    $A.manager.fireEvent('ajaxerror', $A.manager, response.status, response);
    if($A.logWindow){
        var record = $('HTTPWATCH_DATASET').getCurrentRecord();
        var st = $A['_startTime'];
        var ed = new Date();                    
        record.set('spend',ed-st);
        record.set('status',response.status);
        record.set('result',response.statusText);
        record.set('response',response.statusText);
    }
    switch(response.status){
        case 404:
            $A.showErrorMessage(response.status + _lang['ajax.error'], _lang['ajax.error.404']+'"'+ response.statusText+'"',null,400,150);
            break;
        case 500:
            $A.showErrorMessage(response.status + _lang['ajax.error'], response.responseText,null,500,300);
            break;
        case 0:
            break;
        default:
            $A.showErrorMessage(_lang['ajax.error'], response.statusText);
            break;
    }   
}, this);

/**
 * 获取Aurora控件的对象，可以使用简写方式的$()方法
 * @param {String} id Aurora控件的id
 */
$ = $A.getCmp = function(id){
    var cmp = $A.CmpManager.get(id)
    if(cmp == null) {
//        alert('未找到组件:' + id)
        window.console && console.error('未找到组件:' + id);
    }
    return cmp;
}

/**
 * 设置cookie
 * @param {String} name cookie名
 * @param {String} value cookie值
 * @param {Number} days 有效期(单位是天),默认是sessions
 */
$A.setCookie = function(name,value,days){
    var pathname = location.pathname;
    pathname = pathname.substring(0, pathname.lastIndexOf('/') + 1);
    var exp = null;
    if(days){
        exp  = new Date();
        exp.setTime(exp.getTime() + days*24*60*60*1000);
    }
    document.cookie = name + "="+ escape (value) +';path = ' + pathname + ((exp) ? (';expires=' + exp.toGMTString()) : '');
}

/**
 * 根据cookie名获取cookie值
 * @param {String} name cookie名
 */
$A.getCookie = function(name){
    var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
     if(arr != null) return unescape(arr[2]); return null;

}

/**
 * 获取页面可视高度
 * @return {Number} 页面可视高度
 */
$A.getViewportHeight = function(){
    if(Ext.isIE){
        return Ext.isStrict ? document.documentElement.clientHeight :
                 document.body.clientHeight;
    }else{
        return self.innerHeight;
    }
}
/**
 * 获取页面可视宽度
 * @return {Number} 页面可视宽度
 */
$A.getViewportWidth = function() {
    if(Ext.isIE||Ext.isIE9||Ext.isIE10){
        return Ext.isStrict ? document.documentElement.clientWidth :
                 document.body.clientWidth;
    }else{
        return self.innerWidth;
    }
}
//$A.recordSize = function(){
//    var w = $A.getViewportWidth();
//    var h = $A.getViewportHeight();
//    document.cookie = "vw="+w;
//    document.cookie = "vh="+h;
//}
//$A.recordSize();
/**
 * post的方式提交数据，同{@link Aurora.DataSet#post}
 * @param {String} action 提交的url地址
 * @param {Object} data 数据集合
 * @param {String} target 提交目标
 */
$A.post = function(action,data,target){
    var form = Ext.getBody().createChild({style:'display:none',tag:'form',method:'post',action:action,target:target||'_self'});
    for(var key in data){
        var v = data[key]
        if(v) {
            if(v instanceof Date) v = v.format('isoDate');//TODO:时分秒如何处理?
            form.createChild({tag:"input",type:"hidden",name:key,value:v});
        }
    }
    form.dom.submit();
    form.remove();
}
/**
 * POST方式的Ajax请求
 * <p>
 * opt对象的属性:
 * <div class="mdetail-params"><ul>
 * <li><code>url</code>
 * <div class="sub-desc">提交的url地址</div></li>
 * <li><code>para</code>
 * <div class="sub-desc">提交的参数</div></li>
 * <li><code>scope</code>
 * <div class="sub-desc">作用域</div></li>
 * <li><code>sync</code>
 * <div class="sub-desc">是否同步,默认false</div></li> 
 * <li><code>success</code>
 * <div class="sub-desc">成功的回调函数</div></li>
 * <li><code>error</code>
 * <div class="sub-desc">错误的回调函数</div></li>
 * <li><code>failure</code>
 * <div class="sub-desc">ajax调用失败的回调函数</div></li>
 * <li><code>lockMessage</code>
 * <div class="sub-desc">锁屏消息</div></li>
 * </ul></div></p>
 * @param {Object} opt 参数对象
 */
$A.request = function(opt){
    var url = opt.url,
        para = opt.para,
        successCall = opt.success,
        errorCall = opt.error,
        scope = opt.scope,
        failureCall = opt.failure,
        lockMessage = opt.lockMessage,
        body = Ext.getBody(),
        opts = Ext.apply({},opt.opts);
    if(!Ext.isEmpty(lockMessage)){
        $A.Masker.mask(body,lockMessage);
    }
    $A.manager.fireEvent('ajaxstart', url, para);
    if($A.logWindow){
        $A['_startTime'] = new Date();
        $('HTTPWATCH_DATASET').create({'url':url,'request':Ext.util.JSON.encode({parameter:para})})
    }
    var data = Ext.apply({parameter:para},opt.ext);
    return Ext.Ajax.request({
        url: url,
        method: 'POST',
        params:{_request_data:Ext.util.JSON.encode(data)},
        opts:opts,
        sync:opt.sync,
        success: function(response,options){
            if(!Ext.isEmpty(lockMessage)){
                $A.Masker.unmask(body);
            }
            if($A.logWindow){
                var st = $A['_startTime'];
                var ed = new Date();                    
                var record = $('HTTPWATCH_DATASET').getCurrentRecord();
                record.set('spend',ed-st);
                record.set('result',response.statusText);
                record.set('status',response.status);
                record.set('response',response.responseText);
            }
            $A.manager.fireEvent('ajaxcomplete', url, para,response);
            if(response){
                var res = null;
                try {
                    res = Ext.decode(response.responseText);
                }catch(e){
                    $A.showErrorMessage(_lang['ajax.error'], _lang['ajax.error.format']);
                    return;
                }
                
                if(res && !res.success){
                    $A.manager.fireEvent('ajaxfailed', $A.manager, url,para,res);
                    if(res.error){
                        if(res.error.code  && (res.error.code == 'session_expired' || res.error.code == 'login_required')){
                            if($A.manager.fireEvent('timeout', $A.manager))
                            $A.showErrorMessage(_lang['ajax.error'],  _lang['session.expired']);
                        }else{
                            var st = res.error.stackTrace;
                            st = (st) ? st.replaceAll('\r\n','</br>') : '';
                            if(res.error.message) {
                                var h = (st=='') ? 150 : 250;
                                $A.showErrorMessage(_lang['ajax.error'], res.error.message+'</br>'+st,null,400,h);
                            }else{
                                $A.showErrorMessage(_lang['ajax.error'], st,null,400,250);
                            }
                        }
                        if(errorCall)
                        errorCall.call(scope, res, options);
                    }                                                               
                } else {                    
                    if(successCall) {
                        successCall.call(scope,res, options);
                        opt.showSuccessTip = opt.showSuccessTip || false;
                    }
                    if(opt.showSuccessTip){
                        $A.manager.fireEvent('ajaxsuccess', opt.successTip);
                    }
                }
            }
        },
        failure : function(response, options){
            if(!Ext.isEmpty(lockMessage)){
                $A.Masker.unmask(body);
            }
            if(failureCall)failureCall.call(scope, response, options);
        },
        scope: scope
    });
}
Aurora.dateFormat = function () { 
    var masks = {  
        "default":      "ddd mmm dd yyyy HH:MM:ss",  
        shortDate:      "m/d/yy",  
        mediumDate:     "mmm d, yyyy",  
        longDate:       "mmmm d, yyyy",  
        fullDate:       "dddd, mmmm d, yyyy",  
        shortTime:      "h:MM TT",  
        mediumTime:     "h:MM:ss TT",  
        longTime:       "h:MM:ss TT Z",  
        isoDate:        "yyyy-mm-dd",  
        isoTime:        "HH:MM:ss",  
        isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",  
        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"  
    };
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,  
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,  
        timezoneClip = /[^-+\dA-Z]/g,  
        pad = function (val, len) {  
            val = String(val);  
            len = len || 2;  
            while (val.length < len) val = "0" + val;  
            return val;  
        },
        hasTimeStamp = function(mask,token){
            return !!String(masks[mask] || mask || masks["default"]).match(token);
        },
        _parseDate=function(string,mask,fun){
            for(var i=0,arr=mask.match(token),numbers=string.match(/\d+/g),value,index=0;i<arr.length;i++){
                if(numbers.length==arr.length)value=numbers[i];
                else if(numbers.length == 1)value=parseInt(string.slice(index,index+=arr[i].length),10);
                else value=parseInt(string.slice(index=mask.search(arr[i]),index+arr[i].length));
                switch(arr[i]){
                    case "mm":;
                    case "m":value--;break;
                }
                fun(arr[i],value);
            }
        }; 
    return {
        pad:pad,
        parseDate:function(string,mask,utc){
            if(typeof string!="string"||string=="")return null;
            mask = String(masks[mask] || mask || masks["default"]); 
            if (mask.slice(0, 4) == "UTC:") {  
                mask = mask.slice(4);  
                utc = true;  
            }
            var date=new Date(1970,1,2,0,0,0),
                _ = utc ? "setUTC" : "set",  
                d = date[_ + "Date"],  
                m = date[_ + "Month"],  
                yy = date[_ + "FullYear"], 
                y = date[_ + "Year"], 
                H = date[_ + "Hours"],  
                M = date[_ + "Minutes"],  
                s = date[_ + "Seconds"],  
                L = date[_ + "Milliseconds"],  
                //o = utc ? 0 : date.getTimezoneOffset();
                flags = {  
                    d:    d,  
                    dd:   d,
                    m:    m,  
                    mm:   m,  
                    yy:   y,  
                    yyyy: yy,  
                    h:    H,  
                    hh:   H,  
                    H:    H,  
                    HH:   H,  
                    M:    M,  
                    MM:   M,  
                    s:    s,  
                    ss:   s,  
                    l:    L,  
                    L:    L
                }; 
                try{
                    _parseDate(string,mask,function($0,value){
                        flags[$0].call(date,value);
                    });
                }catch(e){throw new SyntaxError("invalid date");}
                if (isNaN(date)) throw new SyntaxError("invalid date"); 
                return date;
        },
        format:function (date, mask, utc) {    
            if (arguments.length == 1 && (typeof date == "string" || date instanceof String) && !/\d/.test(date)) {  
                mask = date;  
                date = undefined;  
            }   
            date = date ? new Date(date) : new Date();  
            if (isNaN(date)) throw new SyntaxError("invalid date");  
      
            mask = String(masks[mask] || mask || masks["default"]);  
            if (mask.slice(0, 4) == "UTC:") {  
                mask = mask.slice(4);  
                utc = true;  
            }  
      
            var _ = utc ? "getUTC" : "get",  
                d = date[_ + "Date"](),  
                D = date[_ + "Day"](),  
                m = date[_ + "Month"](),  
                y = date[_ + "FullYear"](),  
                H = date[_ + "Hours"](),  
                M = date[_ + "Minutes"](),  
                s = date[_ + "Seconds"](),  
                L = date[_ + "Milliseconds"](),  
                o = utc ? 0 : date.getTimezoneOffset(),  
                flags = {  
                    d:    d,  
                    dd:   pad(d),
                    m:    m + 1,  
                    mm:   pad(m + 1),  
                    yy:   String(y).slice(2),  
                    yyyy: y,  
                    h:    H % 12 || 12,  
                    hh:   pad(H % 12 || 12),  
                    H:    H,  
                    HH:   pad(H),  
                    M:    M,  
                    MM:   pad(M),  
                    s:    s,  
                    ss:   pad(s),  
                    l:    pad(L, 3),  
                    L:    pad(L > 99 ? Math.round(L / 10) : L),  
                    t:    H < 12 ? "a"  : "p",  
                    tt:   H < 12 ? "am" : "pm",  
                    T:    H < 12 ? "A"  : "P",  
                    TT:   H < 12 ? "AM" : "PM",  
                    Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),  
                    o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),  
                    S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]  
                }; 
            return mask.replace(token, function ($0) {  
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);  
            });  
        },
        isDateTime:function(mask){
            return hasTimeStamp(mask,/([HhMs])\1?/);
        }
    };  
}();

Ext.applyIf(String.prototype, {
    trim : function(){
        return this.replace(/(^\s*)|(\s*$)/g, "");
    }
});
Ext.applyIf(Date.prototype, {
    format : function(mask, utc){
        return Aurora.dateFormat.format(this, mask, utc);  
    }
});
Ext.applyIf(Array.prototype, {
    add : function(o){
        if(this.indexOf(o) == -1)
        this[this.length] = o;
    },
    find : function(property, value){
        var r = null;
        for(var i=0;i<this.length;i++){
            var item = this[i];
            if(item[property] == value) {
                r = item;
                break;
            }
        }
        return r;
    }
});
Ext.applyIf(String.prototype, {
    replaceAll : function(s1,s2){
        return this.replace(new RegExp(s1,"gm"),s2);  
    }
}); 
Ext.applyIf(String.prototype, {
    parseDate : function(mask,utc){
        return Aurora.dateFormat.parseDate(this.toString(),mask,utc);  
    }
}); 
$A.TextMetrics = function(){
    //var shared;
    return {
        measure : function(el, text, fixedWidth){
            //if(!shared){
              var shared = $A.TextMetrics.Instance(el, fixedWidth);
            //}
            //shared.bind(el);
            //shared.setFixedWidth(fixedWidth || 'auto');
            return shared.getSize(text);
        }
    };
}();
$A.TextMetrics.Instance = function(bindTo, fixedWidth){
    var p = '<div style="left:-10000px;top:-10000px;position:absolute;visibility:hidden"></div>',
        ml = Ext.get(Ext.DomHelper.append(Ext.get(bindTo),p)),
//    var ml = new Ext.Element(document.createElement('div'));
//    document.body.appendChild(ml.dom);
//    ml.position('absolute');
//    ml.setLeft(-1000);
//    ml.setTop(-1000);    
//    ml.hide();
        instance = {      
            getSize : function(text){
                ml.update(text);            
                var s={
                    width : ml.getWidth(),
                    height : ml.getHeight()
                };
                ml.remove();
                return s;
            },       
            bind : function(el){
                var a=['padding','font-size','font-style', 'font-weight', 'font-family','line-height', 'text-transform', 'letter-spacing'],
                    len = a.length, r = {};
                for(var i = 0; i < len; i++){
                    r[a[i]] = Ext.fly(el).getStyle(a[i]);
                }
                ml.setStyle(r);           
            },       
            setFixedWidth : function(width){
                ml.setWidth(width);
            }       
        };
    if(fixedWidth){
        ml.setWidth(fixedWidth);
    }
    instance.bind(bindTo);
    return instance;
};
$A.ToolTip = function(){
    var q = {
        init: function(){
            var sf = this;
            Ext.onReady(function(){
                var qdom = Ext.DomHelper.insertFirst(
                    Ext.getBody(),
                    {
                        tag: 'div',
                        cls: 'tip-wrap',
                        children: [{tag: 'div', cls:'tip-body'}]
                    }
                );
                var sdom = Ext.DomHelper.insertFirst(Ext.getBody(),{tag:'div',cls: 'item-shadow'});
                sf.tip = Ext.get(qdom);
                sf.shadow = Ext.get(sdom);
                sf.body = sf.tip.first("div.tip-body");
            })
            
        },
        show: function(el, text){
            if(this.tip == null){
                this.init();
                //return;
            }
            this.tip.show();
            this.shadow.show();
            this.body.update(text)
            var ele;
            if(typeof(el)=="string"){
                if(this.sid==el) return;
                this.sid = el;
                var cmp = $A.CmpManager.get(el)
                if(cmp){
                    if(cmp.wrap){
                        ele = cmp.wrap;
                    }
                }               
            }else{
                ele = Ext.get(el);
            }
            this.shadow.setWidth(this.tip.getWidth())
            this.shadow.setHeight(this.tip.getHeight())
            this.correctPosition(ele);
        },
        correctPosition: function(ele){
            var screenWidth = $A.getViewportWidth();
            var x = ele.getX()+ele.getWidth() + 5;
            var sx = ele.getX()+ele.getWidth() + 7;
            if(x+this.tip.getWidth() > screenWidth){
                x = ele.getX() - this.tip.getWidth() - 5;
                sx = ele.getX() - this.tip.getWidth() - 3;
            }
            this.tip.setX(x);
            this.tip.setY(ele.getY());
            this.shadow.setX(sx);
            this.shadow.setY(this.tip.getY()+ 2)
        },
        hide: function(){
            this.sid = null;
            if(this.tip != null) this.tip.hide();
            if(this.shadow != null) this.shadow.hide();
        }
    }
    return q
}();
$A.SideBar = function(){
    var m = {
        enable:true,
        bar:null,
        show : function(obj){
            var msg = obj.msg;
            if(!this.enable)return;
//            this.hide();
            var sf = this;
            if(parent.showSideBar){
                parent.showSideBar(msg||'')
            }else{
                this.hide();
                var p;
                if(msg){
                    p = '<div class="item-slideBar"><div class="inner">'+msg+'</div></div>';
                }else{
                    p = obj.html;
                }
                this.bar = Ext.get(Ext.DomHelper.insertFirst(Ext.getBody(),p));
                this.bar.setStyle('z-index', 999999);
                var screenWidth = $A.getViewportWidth();
                var screenHeight = $A.getViewportHeight();
                var x = Math.max(0,(screenWidth - this.bar.getWidth())/2);
                var y = Math.max(0,(screenHeight - this.bar.getHeight())/2);
                this.bar.setY(y);
                this.bar.setX(x);
                this.bar.fadeIn();
//                this.bar.animate({height: {to: 50, from: 0}},0.35,function(){
                    setTimeout(function(){
                       sf.hide();
                    }, obj.duration||2000);            
//                },'easeOut','run');
            }
        },
        hide : function(){
            if(parent.hideSideBar){
                parent.hideSideBar()
            }else{
                if(this.bar) {
                    Ext.fly(this.bar).fadeOut();
                    Ext.fly(this.bar).remove();
                    this.bar = null;
                }
            }
        }
    }
    return m;
}();
$A.Status = function(){
    var m = {
        bar:null,
        enable:true,
        show : function(msg){
            if(!this.enable)return;
            this.hide();
            if(parent.showStatus) {
               parent.showStatus(msg);
            }else{
                var p = '<div class="item-statusBar" unselectable="on">'+msg+'</div>';
                this.bar = Ext.get(Ext.DomHelper.insertFirst(Ext.getBody(),p));
                this.bar.setStyle('z-index', 999998);
            }
        },
        hide : function(){
            if(parent.hideStatus){
                parent.hideStatus();
            }else{
                if(this.bar) {
                    Ext.fly(this.bar).remove();
                    this.bar = null;
                }
            }
        }
    }
    return m;
}();
$A.Cover = function(){
    var m = {
        bodyOverflow:null,
        sw:null,
        sh:null,
        container: {},
        cover : function(el){
//          if(!$A.Cover.bodyOverflow)$A.Cover.bodyOverflow = Ext.getBody().getStyle('overflow');       
            var scrollWidth = Ext.isStrict ? document.documentElement.scrollWidth : document.body.scrollWidth;
            var scrollHeight = Ext.isStrict ? document.documentElement.scrollHeight : document.body.scrollHeight;
            var screenWidth = Math.max(scrollWidth,$A.getViewportWidth());
            var screenHeight = Math.max(scrollHeight,$A.getViewportHeight());
            var p = '<DIV tabIndex="-1" class="aurora-cover"'+(Ext.isIE6?' style="position:absolute;width:'+(screenWidth-1)+'px;height:'+(screenHeight-1)+'px;':'')+'" unselectable="on" hideFocus></DIV>';
            var cover = Ext.get(Ext.DomHelper.insertFirst(Ext.getBody(),p));
            cover.on('focus',function(e){e.stopPropagation(); Ext.fly(el).focus()});
            cover.setStyle('z-index', Ext.fly(el).getStyle('z-index') - 1);
//          Ext.getBody().setStyle('overflow','hidden');
            $A.Cover.container[el.id] = cover;
        },
        uncover : function(el){
            var cover = $A.Cover.container[el.id];
            if(cover) {
                Ext.fly(cover).remove();
                $A.Cover.container[el.id] = null;
                delete $A.Cover.container[el.id];
            }
            var reset = true;
            for(key in $A.Cover.container){
                if($A.Cover.container[key]) {
                    reset = false;  
                    break;
                }
            }
//            if(reset&&$A.Cover.bodyOverflow)Ext.getBody().setStyle('overflow',$A.Cover.bodyOverflow);
        },
        resizeCover : function(){
            for(key in $A.Cover.container){
                var cover = $A.Cover.container[key];
                Ext.fly(cover).setStyle('display','none');
            }
            setTimeout(function(){
                var scrollWidth = Ext.isStrict ? document.documentElement.scrollWidth : document.body.scrollWidth;
                var scrollHeight = Ext.isStrict ? document.documentElement.scrollHeight : document.body.scrollHeight;
                var screenWidth = Math.max(scrollWidth,$A.getViewportWidth()) -1;
                var screenHeight = Math.max(scrollHeight,$A.getViewportHeight()) -1;
                for(key in $A.Cover.container){
                    var cover = $A.Cover.container[key];
                    Ext.fly(cover).setWidth(screenWidth);
                    Ext.fly(cover).setHeight(screenHeight);
                    Ext.fly(cover).setStyle('display','');
                }       
            },1)
        }
    }
    return m;
}();
$A.Masker = function(){
    var m = {
        container: {},
        mask : function(el,msg){
            if($A.Masker.container[el.id]){
               return;
            }
            msg = msg||_lang['mask.loading'];
            var el = Ext.get(el);
            var w = el.getWidth();
            var h = el.getHeight();//leftp:0px;top:0px; 是否引起resize?
            var vh = Math.min(h-2,30);
            var p = '<div class="aurora-mask"  style="left:-10000px;top:-10000px;width:'+w+'px;height:'+h+'px;position: absolute;"><div unselectable="on"></div><span style="top:'+(h/2-11)+'px;height:'+vh+'px;line-height:'+(vh-2)+'px">'+msg+'</span></div>';
            var wrap = el.parent('body')?el.parent():el.child('body')||el;
            var masker = new Ext.Template(p).insertFirst(wrap.dom,{},true);
            var zi = el.getStyle('z-index') == 'auto' ? 0 : Number(el.getStyle('z-index'));
            masker.setStyle('z-index', zi + 1);
            masker.setXY(el.getXY());
            var sp = masker.child('span');
            //var size = $A.TextMetrics.measure(sp,msg);
            //sp.setLeft((w-size.width - 45)/2)
            sp.setLeft((w-sp.getWidth() - 45)/2)
            $A.Masker.container[el.id] = masker;
        },
        unmask : function(el){
            var masker = $A.Masker.container[el.id];
            if(masker) {
                Ext.fly(masker).remove();
                $A.Masker.container[el.id] = null;
                delete $A.Masker.container[el.id];
            }
        }
    }
    return m;
}();
Ext.util.JSON.encodeDate = function(o){
    var pad = function(n) {
        return n < 10 ? "0" + n : n;
    };
    var r = '"' + o.getFullYear() + "-" +
            pad(o.getMonth() + 1) + "-" +
            pad(o.getDate());
    if(o.xtype == 'timestamp') {
        r = r + " " +
            pad(o.getHours()) + ":" +
            pad(o.getMinutes()) + ":" +
            pad(o.getSeconds())     
    }
    r += '"';
    return r
};
$A.evalList = [];
$A.evaling = false;
$A.doEvalScript = function(){
    $A.evaling = true;
    var list = $A.evalList;
    var o = list.shift();
    if(!o) {
        window['__host'] = null;
        $A.evaling = false;
        if($A.loadEvent){
            $A.loadEvent.fire();
            $A.loadEvent = null;
        }
        return;
    }
    var sf = o.sf, html=o.html, loadScripts=o.loadScripts, callback=o.callback, host=o.host,id=o.id;
    var dom = sf.dom;
    
    if(host) window['__host'] = host;
    var links = [];
    var scripts = [];
    var hd = document.getElementsByTagName("head")[0];
    for(var i=0;i<hd.childNodes.length;i++){
        var he = hd.childNodes[i];
        if(he.tagName == 'LINK') {
            links.push(he.href);
        }else if(he.tagName == 'SCRIPT'){
            scripts.push(he.src);
        }
    }
    var jsre = /(?:<script([^>]*)?>)((\n|\r|.)*?)(?:<\/script>)/ig;
    var jsSrcRe = /\ssrc=([\'\"])(.*?)\1/i;
    
    var cssre = /(?:<link([^>]*)?>)((\n|\r|.)*?)/ig;
    var cssHreRe = /\shref=([\'\"])(.*?)\1/i;
    
    var cssm;
    while(cssm = cssre.exec(html)){
        var attrs = cssm[1];
        var srcMatch = attrs ? attrs.match(cssHreRe) : false;
        if(srcMatch && srcMatch[2]){
            var included = false;
            for(var i=0;i<links.length;i++){
                var link = links[i];
                if(link.indexOf(srcMatch[2]) != -1){
                    included = true;
                    break;
                }
            }
            if(!included) {
                var s = document.createElement("link");
                s.type = 'text/css';
                s.rel = 'stylesheet';
                s.href = srcMatch[2];
                hd.appendChild(s);
            }
        }
    }
    var match;
    var jslink = [];
    var jsscript = [];
    while(match = jsre.exec(html)){
        var attrs = match[1];
        var srcMatch = attrs ? attrs.match(jsSrcRe) : false;
        if(srcMatch && srcMatch[2]){
            var included = false;
            for(var i=0;i<scripts.length;i++){
                var script = scripts[i];
                if(script.indexOf(srcMatch[2]) != -1){
                    included = true;
                    break;
                }
            }
            if(!included) {
                jslink[jslink.length] = {
                    src:srcMatch[2],
                    type:'text/javascript'
                }
            } 
        }else if(match[2] && match[2].length > 0){
            jsscript[jsscript.length] = match[2];
        }
    }
    var loaded = 0;
    
    var finishLoad = function(){
        try {
        for(j=0,k=jsscript.length;j<k;j++){
            var jst = jsscript[j];
            if(o.destroying === true) break;
            try {
                if(window.execScript) {
                    window.execScript(jst);
                } else {
                    window.eval(jst);
                }
            }catch (e){
            	window.console && console.error("执行代码: " + jst +'\n'+e.stack);
            }
        }
        }catch(e){}
        var el = document.getElementById(id);
        if(el){Ext.removeNode(el);} 
//        Ext.fly(dom).setStyle('display', 'block');
        Ext.fly(dom).show();
        if(typeof callback == "function"){
            callback();
        }
        $A.doEvalScript();
    }
    
    var continueLoad = function(){
        var js = jslink[loaded];
        var s = document.createElement("script");
        s.src = js.src;
        s.type = js.type;
        s[Ext.isIE ? "onreadystatechange" : "onload"] = onReadOnLoad;
        s["onerror"] = onErrorLoad;
        hd.appendChild(s);        
    }    
    
    var onReadOnLoad = function(){        
        var isready = Ext.isIE ? (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") : true;
        if(isready) {
            loaded ++;
            if(loaded==jslink.length) {
                finishLoad();
            }else{
                continueLoad();
            }
        }
    }
    
    var onErrorLoad = function(evt){
        loaded++;
        alert('无法加载脚本:' + evt.target.src);
        if(loaded==jslink.length) {
            finishLoad();
        }else {
            continueLoad();
        }
    }
    
    if(jslink.length > 0){
        continueLoad();
    } else if(jslink.length ==0) {
        for(j=0,k=jsscript.length;j<k;j++){
            var jst = jsscript[j];
            if(o.destroying === true) break;
            try {
                if(window.execScript) {
                   window.execScript(jst);
                } else {
                   window.eval(jst);
                }
            }catch (e){
                window.console && console.error("执行代码: " + jst+'\n'+e.stack);
            }
        }
        var el = document.getElementById(id);
        if(el){Ext.removeNode(el);} 
//        Ext.fly(dom).setStyle('display', 'block');
        Ext.fly(dom).show();
        if(typeof callback == "function"){
                callback();
        }
        $A.doEvalScript();
    } 
}
Ext.Element.prototype.update = function(html, loadScripts, callback,host){
    if(typeof html == "undefined"){
        html = "";
    }
    if(loadScripts !== true){
        this.dom.innerHTML = html;
        if(typeof callback == "function"){
            callback();
        }
        return this;
    }
    
    var id = Ext.id();
    var sf = this;
    var dom = this.dom;
    html += '<span id="' + id + '"></span>';
    Ext.lib.Event.onAvailable(id, function(){
        $A.evalList.push({
            html:html,
            loadScripts:loadScripts,
            callback:callback,
            host:host,
            id:id,
            sf:sf
        });
        if(!$A.evaling)
        $A.doEvalScript() 
    });
    
//    Ext.fly(dom).setStyle('display', 'none');
    Ext.fly(dom).hide();
    dom.innerHTML = html.replace(/(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)/ig, "").replace(/(?:<link.*?>)((\n|\r|.)*?)/ig, "");
    return this;
}

Ext.EventObjectImpl.prototype['isSpecialKey'] = function(){
    var k = this.keyCode;
//    return (this.type == 'keypress' && this.ctrlKey) || k==8 || k== 46 || k == 9 || k == 13  || k == 40 || k == 27 || k == 44 ||
     return (this.type == 'keypress' && this.ctrlKey) || k == 9 || k == 13  || k == 40 || k == 27 ||
    (k == 16) || (k == 17) ||
    (k >= 18 && k <= 20) ||
    (k >= 33 && k <= 35) ||
    (k >= 36 && k <= 39) ||
    (k >= 44 && k <= 45);
}
Ext.removeNode = Ext.isIE && !Ext.isIE8 ? function(){
    var d;
    return function(n){
        if(n && n.tagName != 'BODY'){
            (Ext.enableNestedListenerRemoval) ? Ext.EventManager.purgeElement(n, true) : Ext.EventManager.removeAll(n);
            if(!d){
                d = document.createElement('div');
                d.id = '_removenode';
                d.style.cssText = 'position:absolute;display:none;left:-10000px;top:-10000px';
            }
//            d = d || document.createElement('<div id="_removenode" style="position:absolute;display:none;left:-10000px;top:-10000px">');
            if(!d.parentNode)document.body.appendChild(d);
            d.appendChild(n);
            d.innerHTML = '';
            delete Ext.elCache[n.id];
        }
    }
}() : function(n){
    if(n && n.parentNode && n.tagName != 'BODY'){
        (Ext.enableNestedListenerRemoval) ? Ext.EventManager.purgeElement(n, true) : Ext.EventManager.removeAll(n);
        n.parentNode.removeChild(n);
        delete Ext.elCache[n.id];
    }
}
$A.parseDate = function(str){
    if(typeof str == 'string'){  
        
        //TODO:临时, 需要服务端解决
//      if(str.indexOf('.0') !=-1) str = str.substr(0,str.length-2);
        
        var results = str.match(/^ *(\d{4})-(\d{1,2})-(\d{1,2}) *$/);      
        if(results && results.length>3)      
            return new Date(parseInt(results[1]),parseInt(results[2],10) -1,parseInt(results[3],10));       
        results = str.match(/^ *(\d{4})-(\d{1,2})-(\d{1,2}) +(\d{1,2}):(\d{1,2}):(\d{1,2}) *$/);  
        if(results && results.length>6)      
        return new Date(parseInt(results[1]),parseInt(results[2],10) -1,parseInt(results[3],10),parseInt(results[4],10),parseInt(results[5],10),parseInt(results[6],10));       
    }      
    return null;      
}
$A.getRenderer = function(renderer){
    if(!renderer) return null;
    var rder;
    if(renderer.indexOf('Aurora.') != -1){
        rder = $A[renderer.substr(7,renderer.length)]
    }else{
        rder = window[renderer];
    }
    return rder;
}
$A.RowNumberRenderer = function(value,record,name){
    if(record && record.ds){
        var ds = record.ds;
        return (ds.currentPage-1)*ds.pagesize + ds.indexOf(record) + 1;
    }
}
/**
 * 将日期转换成默认格式的字符串，默认格式是根据Aurora.defaultDateFormat来定义的.如果没有特殊指定,默认格式为yyyy-mm-dd
 * @param {Date} date 转换的日期
 * @return {String}
 */
$A.formatDate = function(date){
    if(!date)return '';
    if(date.format)return date.format($A.defaultDateFormat);
    return date;
}
/**
 * 将日期转换成yyyy-mm-dd HH:MM:ss格式的字符串
 * @param {Date} date 需要转换的日期
 * @return {String} 转换后的字符串
 */
$A.formatDateTime = function(date){
    if(!date)return '';
    if(date.format)return date.format($A.defaultDateTimeFormat);
    return date;
}
/**
 * 将数值根据精度转换成带有千分位的字符串
 * 
 * @param {Number} value 数值
 * @param {Number} decimalprecision 小数点位数
 * @return {String}
 */
$A.formatNumber = function(value,decimalprecision){
    if(Ext.isEmpty(value))return '';
    value = String(value).replace(/,/g,'');
    if(isNaN(value))return '';
    if(!isNaN(decimalprecision)) value=Number(value).toFixed(decimalprecision);
    var ps = $A.parseScientific(value).split('.');
    var sub = (ps.length==2)?'.'+ps[1]:'';
    var whole = ps[0];
    var r = /(\d+)(\d{3})/;
    while (r.test(whole)) {
        whole = whole.replace(r, '$1' + ',' + '$2');
    }
    v = whole + sub;
    return v;   
}
/**
 * 将数值转换成带有千分位的字符串，并保留两位小数
 * 
 * @param {Number} value 数值
 * @return {String}
 */
$A.formatMoney = function(v){
    return $A.formatNumber(v,2)
}
/**
 * 将科学技术法的数值转换成普通数值字符串
 * 
 * @param {Number} value 数值
 * @return {String}
 */
$A.parseScientific = function(v){
	if((v = String(v)).search(/e/i)==-1){
		return v;	
	}else{
		var re = v.split(/e/i),
			doubleStr=re[0],
			negative = doubleStr.match(/-/)||'',
			inf = doubleStr.indexOf('.'),
			str = doubleStr.replace(/[-.]/g,''),
			eStr=parseInt(re[1]) - (inf == -1?0:str.length - inf);
		if(eStr>0){
			for(var i=0;i<eStr;i++){
				str+='0';
			}
		}else{
			eStr = str.length + eStr;
			if(eStr>0){
				str = str.substring(0,eStr)+'.'+str.substring(eStr)
			}else{
				var prex = '0.';
				for(var i=0;i>eStr;i--){
					prex+='0';
				}
				str = prex + str;
			}
		}
		return negative + str;
	}
}
/**
 * 将字符串的千分位去除
 * @param {Number} value 数值
 * @param {String} rv 带有千分位的数值字符串
 * @return {Number} 数值
 */
$A.removeNumberFormat = function(rv){
    rv = String(rv||'');
    while (rv.indexOf(',')!=-1) {
        rv = rv.replace(',', '');
    }
    return isNaN(rv) ? parseFloat(rv) : rv;
}

$A.EventManager = Ext.extend(Ext.util.Observable,{
    constructor: function() {
        $A.EventManager.superclass.constructor.call(this);
        this.initEvents();
    },
    initEvents : function(){
        this.addEvents(
            'ajaxerror',
            'ajaxsuccess',
            'ajaxfailed',
            'ajaxstart',
            'ajaxcomplete',
            'valid',
            'timeout',
            'beforeunload'
        );      
    }
});
$A.manager = new $A.EventManager();
$A.manager.on('ajaxstart',function(){
    $A.Status.show(_lang['eventmanager.start']);   
})
$A.manager.on('timeout',function(){
    $A.Status.hide();
})
$A.manager.on('ajaxerror',function(){
    $A.Status.hide();
})
$A.manager.on('ajaxcomplete',function(){
    $A.Status.hide();
})
$A.manager.on('ajaxsuccess',function(tip){
    $A.SideBar.show({msg:tip||_lang['eventmanager.success']})
})

$A.regEvent = function(name, hanlder){
    $A.manager.on(name, hanlder);
}

$A.validInfoType = 'area';
$A.validInfoTypeObj = '';
$A.setValidInfoType = function(type, obj){
    $A.validInfoType = type;
    $A.validInfoTypeObj = obj;
}

$A.invalidRecords = {};
$A.addInValidReocrd = function(id, record){
    var rs = $A.invalidRecords[id];
    if(!rs){
        $A.invalidRecords[id] = rs = [];
    }
    var has = false;
    for(var i=0;i<rs.length;i++){
        var r = rs[i];
        if(r.id == record.id){
            has = true;
            break;
        }
    }
    if(!has) {
        rs.add(record)
    }
}
$A.removeInvalidReocrd = function(id,record){
    var rs = $A.invalidRecords[id];
    if(!rs) return;
    for(var i=0;i<rs.length;i++){
        var r = rs[i];
        if(r.id == record.id){
            rs.remove(r)
            break;
        }
    }
}
$A.getInvalidRecords = function(pageid){
    var records = [];
    for(var key in $A.invalidRecords){
        var ds = $A.CmpManager.get(key)
        if(ds.pageid == pageid){
            var rs = $A.invalidRecords[key];
            records = records.concat(rs);
        }
    }
    return records;
}
$A.isInValidReocrdEmpty = function(pageid){
    var isEmpty = true;
    for(var key in $A.invalidRecords){
        var ds = $A.CmpManager.get(key)
        if(ds.pageid == pageid){
            var rs = $A.invalidRecords[key];
            if(rs.length != 0){
                isEmpty = false;
                break;
            }
        }
    }
    return isEmpty;
}
$A.manager.on('valid',function(manager, ds, valid){
    switch($A.validInfoType){
        case 'area':
            $A.showValidTopMsg(ds);
            break;
        case 'message':
            $A.showValidWindowMsg(ds);
            break;
    }
})
$A.showValidWindowMsg = function(ds) {
    var empty = $A.isInValidReocrdEmpty(ds.pageid);
    if(empty == true){
        if($A.validWindow)$A.validWindow.close();
    }
    if(!$A.validWindow && empty == false){
        $A.validWindow = $A.showWarningMessage(_lang['valid.fail'],'',400,200);
        $A.validWindow.on('close',function(){
            $A.validWindow = null;          
        })
    }
    var sb =[];
    var rs = $A.getInvalidRecords(ds.pageid);
    for(var i=0;i<rs.length;i++){
        var r = rs[i];
        var index = r.ds.data.indexOf(r)+1
        sb[sb.length] =_lang['valid.fail.note']+'<a href="#" onclick="$(\''+r.ds.id+'\').locate('+index+')">('+r.id+')</a>:';

        for(var k in r.valid){
            sb[sb.length] = r.valid[k]+';'
        }
        sb[sb.length]='<br/>';
    }
    if($A.validWindow)$A.validWindow.body.child('div').update(sb.join(''))
}
$A.pageids = [];
$A.showValidTopMsg = function(ds) {
    var empty = $A.isInValidReocrdEmpty(ds.pageid);
    if(empty == true){
        var d = Ext.get(ds.pageid+'_msg');
        if(d){
            d.hide();
            d.setStyle('display','none')
            d.update('');
        }
        return;
    }
    var rs = $A.getInvalidRecords(ds.pageid);
    var sb = [];
    for(var i=0;i<rs.length;i++){
        var r = rs[i];
        var index = r.ds.data.indexOf(r)+1
        sb[sb.length] =_lang['valid.fail.note']+'<a href="#" onclick="$(\''+r.ds.id+'\').locate('+index+')">('+r.id+')</a>:';

        for(var k in r.valid){
            sb[sb.length] = r.valid[k]+';'
        }
        sb[sb.length]='<br/>';      
    }
    var d = Ext.get(ds.pageid+'_msg');
    if(d){
        d.update(sb.join(''));
        d.show(true);
    }                   
}
Ext.fly(document.documentElement).on('keydown',function(e,t){
//  if(e.altKey&&e.keyCode == 76){
//      if(!$A.logWindow) {
//          $A.logWindow = new $A.Window({modal:false, url:'log.screen',title:'AjaxWatch', height:550,width:530});  
//          $A.logWindow.on('close',function(){
//              delete  $A.logWindow;       
//          })
//      }
//  }
    var tagName = t.tagName.toUpperCase();
    e.keyCode == 8 && tagName != 'INPUT' && tagName != 'TEXTAREA' && e.stopEvent();
})
$A.startCustomization = function(){
    var cust = $A.CmpManager.get('_customization');
    if(cust==null){
        cust = new $A.Customization({id:'_customization'});    
    }
    cust.start();
}
$A.stopCustomization = function(){
    var cust = $A.CmpManager.get('_customization');
    if(cust!=null){
        cust.stop();
        $A.CmpManager.remove('_customization');
    }
}
/**
 * 将数字金额转换成大写金额.
 * 
 * @param {Number} amount 金额
 * @return {String} 大写金额
 */
$A.convertMoney = function(mnum){
    mnum = Math.abs(mnum);
    var unitArray = [["元", "万", "亿"], ["仟", "", "拾", "佰"],["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"]];
    totalarray = new Array();

    totalarray = mnum.toString().split(".");
    if (totalarray.length == 1) {
        totalarray[1] = "00"
    } else if (totalarray[1].length == 1) {
        totalarray[1] += '0';
    }
    integerpart = new Array();
    decimalpart = new Array();
    var strout = "";
    for (var i = 0; i < totalarray[0].length; i++) {
        integerpart[i] = totalarray[0].charAt(i);
    }
    for (var i = 0; i < totalarray[1].length; i++) {
        decimalpart[i] = totalarray[1].charAt(i);
    }
    for (var i = 0; i < integerpart.length; i++) {
        var strTemp = (integerpart.length - i - 1) % 4 == 0
                ? unitArray[0][parseInt((integerpart.length - i) / 4)]
                : (integerpart[i] == 0)
                        ? ""
                        : unitArray[1][((integerpart.length - i) % 4)]
        strout = strout + unitArray[2][integerpart[i]] + strTemp;
    }
    strout = strout.replace(new RegExp(/零+/g), "零");
    strout = strout.replace("零万", "万");
    strout = strout.replace("零亿", "亿");
    strout = strout.replace("零元", "元");
    strout = strout.replace("亿万", "亿");
    var strdec = ""
    if (decimalpart[0] == 0 && decimalpart[1] == 0) {
        strdec = "整";
    } else {
        if (decimalpart[0] == 0) {
            strdec = "零"
        } else {
            strdec = unitArray[2][decimalpart[0]] + '角';
        }
        if (decimalpart[1] != 0) {
            strdec += unitArray[2][decimalpart[1]] + '分';
        }
    }
    strout += strdec;
    if (mnum < 0)
        strout = "负" + strout;
    return strout;
}
$A.setValidInfoType('tip'); 

$A.escapeHtml = function(str){
    if(Ext.isEmpty(str) || !Ext.isString(str))
        return str;
    return String(str).replace(/&/gm,'&amp;').replace(/\"/gm,'&quot;').replace(/\(/gm,'&#40;').replace(/\)/gm,'&#41;').replace(/\+/gm,'&#43;').replace(/\%/gm,'&#37;')
    .replace(/</gm,'&lt;').replace(/>/gm,'&gt;');
}
$A.unescapeHtml = function(str){
    if(Ext.isEmpty(str) || !Ext.isString(str))
        return str;
    return String(str).replace(/&amp;/gm,'&').replace(/&quot;/gm,'"').replace(/&#40;/gm,'(').replace(/&#41;/gm,')').replace(/&#43;/gm,'+').replace(/&#37;/gm,'%')
    .replace(/&lt;/gm,'<').replace(/&gt;/gm,'>');
}
$A.doExport=function(dataset,cols,mergeCols,type,separator,filename,generate_state){
    var p={"parameter":{"_column_config_":{}}},columns=[],parentMap={},
        _parentColumn=function(pcl,cl){
            if(!(Ext.isDefined(pcl.forexport)?pcl.forexport:true))return null;
            var json=Ext.encode(pcl);
            var c=parentMap[json];
            if(!c)c={prompt:pcl.prompt};
            parentMap[json]=c;
            (c["column"]=c["column"]||[]).add(cl);
            if(pcl._parent){
                return _parentColumn(pcl._parent,c)
            }
            return c;
        };
        for(var i=0;i<cols.length;i++){
            var column=cols[i],forExport=Ext.isDefined(column.forexport)?column.forexport:true;
            if(column.type != 'rowcheck' && column.type!= 'rowradio' && column.type!= 'rownumber' && forExport){
                var c={prompt:column.prompt}
                if(column.width)c.width=column.width;
                if(column.name)c.name=column.exportfield||column.name;
                if(column.exportdatatype)c.datatype = column.exportdatatype;
                if(column.exportdataformat)c.dataformat = column.exportdataformat;
                c.align=column.align||"left";
                var o=column._parent?_parentColumn(column._parent,c):c;
                if(o)columns.add(o);
            }
        }
        p["parameter"]["_column_config_"]["column"]=columns;
        p["_generate_state"]=Ext.isEmpty(generate_state)?true:generate_state;
        p["_format"]=type||"xlsx";
        if(separator)p["separator"]=separator;
        if(filename)p["_file_name_"]=filename;
        if(mergeCols){
            var _merge_column_ = [];
            Ext.each(mergeCols,function(item){
                _merge_column_.push({name:item});
            });
            p["parameter"]["_merge_column_"] = _merge_column_;
        }
        var r,q = {};
        if(dataset.qds)r = dataset.qds.getCurrentRecord();
        if(r) Ext.apply(q, r.data);
        Ext.apply(q, dataset.qpara);
        for(var k in q){
           if(Ext.isEmpty(q[k],false)) delete q[k];
        }
        Ext.apply(p.parameter,q)
        var form = document.createElement("form");
        form.target = "_export_window";
        form.method="post";
        var url = dataset.queryurl;
        if(url)form.action = url + (url.indexOf('?') == -1 ? '?' : '&')+'r='+Math.random();
        var iframe = Ext.get('_export_window')||new Ext.Template('<iframe id ="_export_window" name="_export_window" style="position:absolute;left:-10000px;top:-10000px;width:1px;height:1px;display:none"></iframe>').insertFirst(document.body,{},true)
        var s = document.createElement("input");
        s.id = "_request_data";
        s.type = 'hidden';
        s.name = '_request_data';
        s.value = Ext.encode(p);
        form.appendChild(s);
        document.body.appendChild(form);
        form.submit();
        Ext.fly(form).remove(); 
}


$A.isChinese = function(value){
    return /^[\u4E00-\u9FA5_%]+$/.test(value.trim());
}
$A.isLetter = function(value){
    return /^[a-zA-Z_%]+$/.test(value.trim());
}
$A.isUpperCase = function(value){
    return /^[A-Z_%]+$/.test(value.trim());
}
$A.isLowerCase = function(value){
    return /^[a-z_%]+$/.test(value.trim());
}
$A.isNumber = function(value){
    return Ext.isNumber(Number(value));
}
$A.isDate = function(){
    var formats = [
        'mm/dd/yyyy',
        'yyyy-mm-dd'
    ];
    return function(value){
        if(!Ext.isString(value))return false;
        for(var i = formats.length;i--;){
            try{
                value.parseDate(formats[i]);
                return true;
            }catch(e){
            }
        }
        return false;
    }
}();
$A.isEmpty = Ext.isEmpty; 
$A.checkNotification = function(cmps){
    var result = null;
    if(Ext.isObject(cmps)){
        for(var key in cmps){
            var cmp = cmps[key];
            if(cmp.cmps){
                result = $A.checkNotification(cmp.cmps)
            }else if(!result && cmp instanceof Aurora.DataSet){
                result = (cmp.notification && cmp.isModified()) ? cmp.notification : null;
            }
            if(result)break;
        }        
    }
    return result;
}

window.onbeforeunload = function(){
    var message = [];
    $A.manager.fireEvent('beforeunload', message);
    if(message.length != 0 ) return message[0];
}
if(Ext.isIE){//for fix IE event's order bug
(function(){
    var elProto = Ext.Element.prototype,
        on = elProto.on,
        un = elProto.un,
        objs={};
    elProto.on = elProto.addListener = function(eventName, handler, scope, opt){
        var sf = this,listeners = objs[sf.id]||(objs[sf.id] = []);
        sf.un(eventName, handler, scope);
        on.call(sf,eventName,handler, scope, opt);
        Ext.each(listeners,function(obj){
            var _e = obj.eventName,
                _h = obj.handler,
                _s = obj.scope;
            un.call(sf,_e, _h, _s);
            on.call(sf,_e, _h, _s, obj.opt);
        });
        listeners.unshift({
            eventName:eventName,
            handler:handler,
            scope:scope,
            opt:opt
        });
        return sf;
    }
    elProto.un = elProto.removeListener = function(eventName, handler, scope){
        var sf = this,listeners = objs[sf.id],
            index = Ext.each(listeners,function(obj){
            if(obj.eventName === eventName && obj.handler == handler && obj.scope == scope){
                return false;
            }
        });
        if(Ext.isDefined(index)){
            listeners.splice(index,1);
        }
        un.call(sf,eventName, handler, scope);
        return sf;
    }
})();
};

$A.FixMath = (function(){
var POW = Math.pow,
    mul = function(a,b) { 
        var m=0,s1=String(a),s2=String(b),
            l1 = s1.indexOf('.'),
            l2 = s2.indexOf('.'),
            e1 = s1.indexOf('e'),
            e2 = s2.indexOf('e');
        if(e1!=-1){
            m-=Number(s1.substr(e1+1));
            s1 = s1.substr(0,e1);
        }
        if(e2!=-1){
            m-=Number(s2.substr(e2+1));
            s2 = s2.substr(0,e2);
        }
        if(l1!=-1)m+=s1.length - l1 -1;
        if(l2!=-1)m+=s2.length - l2 -1;
        return Number(s1.replace('.',''))*Number(s2.replace('.',''))/POW(10,m);
    },
    div = function(a,b){
        var re = String(a/b),
            i = re.indexOf('.');
        if(i!=-1){
            re = Number(re).toFixed(16-i-1)
        }
        return Number(re);
    },
    plus = function(a,b) { 
        var m1=0,m2=0,m3,
            s1=String(a),s2=String(b),
            l1 = s1.indexOf('.'),
            l2 = s2.indexOf('.'),
            e1 = s1.indexOf('e'),
            e2 = s2.indexOf('e');
        if(e1!=-1){
            m1-=Number(s1.substr(e1+1));
            s1 = s1.substr(0,e1);
        }
        if(e2!=-1){
            m2-=Number(s2.substr(e2+1));
            s2 = s2.substr(0,e2);
        }
        if(l1!=-1)m1+=s1.length - l1 -1;
        if(l2!=-1)m2+=s2.length - l2 -1;
        if(m2>m1){
            m3 = m2;
            m1 = m2-m1;
            m2 = 0;
        }else if(m1>m2){
            m3 = m1;
            m2 = m1-m2;
            m1 = 0;
        }else{
            m3 = m1;
            m1 = m2 = 0;
        }
        return (Number(s1.replace('.',''))*POW(10,m1)+Number(s2.replace('.',''))*POW(10,m2))/POW(10,m3);
    },
    minus = function(a,b){
        return plus(a,-b);
    },
    pow = function(a,b){
        var re = String(POW(a,b)),
            i = re.indexOf('.');
        if(i!=-1){
            re = Number(re).toFixed(16-i-1)
        }
        return Number(re);
    };
    return {
        pow:pow,
        minus:minus,
        plus:plus,
        div:div,
        mul:mul
    }
})();

$A.merge = function(){
	function clone(object){
		var _clone = function(){};
		_clone.prototype = object
		return new _clone();
	}
	function mergeOne(source, key, current){
		if(Ext.isObject(current)){
			if (Ext.isObject(source[key])) _merge(source[key], current);
			else source[key] = clone(current);
		}else if(Ext.isArray(current)){
			source[key] = [].concat(current);
		}else{
			source[key] = current;
		}
		return source;
	}
	function _merge(source, k, v){
		if (Ext.isString(k)) return mergeOne(source, k, v);
		for (var i = 1, l = arguments.length; i < l; i++){
			var object = arguments[i];
			for (var key in object) mergeOne(source, key, object[key]);
		}
		return source;
	}
	
	return function(){
		var args = [{}],
			i = arguments.length,
			ret;
		while (i--) {
			if (!Ext.isBoolean(arguments[i])) {
				args[i + 1] = arguments[i];
			}
		}
		ret = _merge.apply(null, args);
		return ret;
	}
}();
/**
 * @class Aurora.DataSet
 * @extends Ext.util.Observable
 * <p>DataSet是一个数据源，也是一个数据集合，它封装了所有数据的操作，校验，提交等操作.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.AUTO_ID = 1000;
$A.DataSet = Ext.extend(Ext.util.Observable,{
    constructor: function(config) {//datas,fields, type
        var sf = this;
        $A.DataSet.superclass.constructor.call(this);
        config = config || {};
        if(config.listeners){
            this.on(config.listeners);
        }
        this.validateEnable = true;
        this.pageid = config.pageid;
        this.spara = {};
        this.notification = config.notification;
        this.selected = [];
        this.sorttype = config.sorttype||'remote';
        this.maxpagesize = config.maxpagesize || 1000;
        this.pagesize = config.pagesize || 10;
        if(this.pagesize > this.maxpagesize) 
        	this.pagesize = this.maxpagesize;
        this.submiturl = config.submiturl || '';
        this.queryurl = config.queryurl || '';
        this.fetchall = config.fetchall||false;
        this.totalcountfield = config.totalcountfield || 'totalCount';
        this.selectable = config.selectable||false;
        this.selectionmodel = config.selectionmodel||'multiple';
        this.selectfunction = config.selectfunction;
        this.autocount = config.autocount;
        this.autopagesize = config.autopagesize;
        this.bindtarget = config.bindtarget;
        this.bindname = config.bindname;
        this.processfunction = config.processfunction;
        this.modifiedcheck = config.modifiedcheck;
        this.loading = false;
        this.qpara = {};
        this.fields = {};
        this.resetConfig();
        this.id = config.id || Ext.id();
        $A.CmpManager.put(this.id,this) 
        if(this.bindtarget&&this.bindname) this.bind($(this.bindtarget),this.bindname);//$(this.bindtarget).bind(this.bindname,this);
        this.qds = Ext.isEmpty(config.querydataset) ? null :$(config.querydataset);
        if(this.qds != null && this.qds.getCurrentRecord() == null) this.qds.create();
        this.initEvents();
        if(config.fields)this.initFields(config.fields)
        if(config.datas && config.datas.length != 0) {
            var datas=config.datahead?this.convertData(config.datahead,config.datas):config.datas;
            this.autocount = false;
            this.loadData(datas);
//            $A.onReady(function(){
//				sf.locate(sf.currentIndex,true); //不确定有没有影响
//            });
        }
        if(config.autoquery === true) {
            $A.onReady(function(){
				sf.query(); 
            });
        }
        if(config.autocreate==true) {
            if(this.data.length == 0)
            this.create();
        }
    },
    convertData : function(head,datas){
        var nds=[];
        for(var i=0;i<datas.length;i++){
            var d=datas[i],nd={};
            for(var j=0;j<head.length;j++){
                if(!Ext.isEmpty(d[j], true))
                nd[head[j]]=d[j];
            }
            nds.push(nd);
        }
        return nds;
    },
    destroy : function(){
    	var sf = this,id = sf.id,o = sf.qtId,
    		bindtarget = sf.bindtarget,
    		bindname = sf.bindname,
    		manager = $A.CmpManager;
        sf.processListener('un');
    	o &&
			Ext.Ajax.abort(o);
        bindtarget && bindname && (o = manager.get(bindtarget)) &&
            o.clearBind(bindname);
        Ext.iterate(sf.fields,function(key,field){
        	field.type == 'dataset' &&
				sf.clearBind(key);
        });
        manager.remove(id);
        delete $A.invalidRecords[id]
    },
    reConfig : function(config){
        this.resetConfig();
        Ext.apply(this, config);
    },
    /**
     * 取消绑定.
     */
    clearBind : function(name){
        var sf = this,fields = sf.fields,
        	ds = fields[name].pro['dataset'];
        ds &&
        	ds.processBindDataSetListener(sf,'un');
        delete fields[name];
    },
    processBindDataSetListener : function(ds,ou){
        var bdp = this.onDataSetModify;
//        this[ou]('beforecreate', this.beforeCreate, this);//TODO:有待测试
        this[ou]('add', bdp, this);
        this[ou]('remove', bdp, this);
        this[ou]('select', this.onDataSetSelect, this);
        this[ou]('update', bdp, this);
        this[ou]('indexchange', bdp, this);
        this[ou]('clear', bdp, this);
        this[ou]('load', this.onDataSetLoad, this);
        this[ou]('reject', bdp, this);
        ds[ou]('indexchange',this.onDataSetIndexChange, this);
        ds[ou]('load',this.onBindDataSetLoad, this);
        ds[ou]('remove',this.onBindDataSetLoad, this);
        ds[ou]('clear',this.removeAll, this);
    },
    /**
     * 将组件绑定到某个DataSet的某个Field上.
     * @param {Aurora.DataSet} dataSet 绑定的DataSet.
     * @param {String} name Field的name. 
     * 
     */
    bind : function(ds, name){
        if(ds.fields[name]) {
            alert('重复绑定 ' + name);
            return;
        }
        this.processBindDataSetListener(ds,'un');
        this.processBindDataSetListener(ds,'on');
        var field = new $A.Record.Field({
            name:name,
            type:'dataset',
            dataset:this
        });
        ds.fields[name] = field;
    },
    onBindDataSetLoad : function(ds,options){
        if(ds.getAll().length == 0) this.removeAll();
    },
    onDataSetIndexChange : function(ds, record){
        if(!record.get(this.bindname) && record.isNew != true){
            this.qpara = {};
            Ext.apply(this.qpara,record.data);
            this.query(1,{record:record});
        }   
    },
    onDataSetModify : function(){
        var bt = $A.CmpManager.get(this.bindtarget);
        if(bt){
            this.refreshBindDataSet(bt.getCurrentRecord(),this.getConfig())
        }
    },
    onDataSetSelect : function(ds,record){
        var bt = $A.CmpManager.get(this.bindtarget);
        if(bt){
            var datas = bt.data;
            var found = false;
            for(var i = 0;i<datas.length;i++){
                var dr = datas[i];
                var dc = dr.get(this.bindname);
                if(dc){
                    for(var j = 0;j<dc.data.length;j++){
                        var r = dc.data[j];
                        if(r.id == record.id){
                            dc.selected = this.selected;
                            found = true;
                            break;
                        }
                    }
                    if(found) break;
                }
            }
        }
    },
    onDataSetLoad : function(ds,options){
        var record;
        if(options && options.opts && options.opts.record){
            record = options.opts.record;
        }else{
            var bt = $A.CmpManager.get(this.bindtarget);
            if(bt) record = bt.getCurrentRecord();          
        }
        if(record)
        this.refreshBindDataSet(record,ds.getConfig())
    },
    refreshBindDataSet: function(record,config){
        if(!record)return;
        //record.set(this.bindname,config,true)//this.getConfig()
        record.data[this.bindname] = config;

//      for(var k in this.fields){
//          var field = this.fields[k];
//          if(field.type == 'dataset'){  
//              var ds = field.pro['dataset'];
////                if(ds && clear==true)ds.resetConfig();
//              record.set(field.name,ds.getConfig(),true)
//          }
//      }
    },
    beforeCreate: function(ds, record, index){
        if(this.data.length == 0){
            this.create({},false);
        }
    },
    resetConfig : function(){
        this.data = [];
        this.selected = [];
        this.gotoPage = 1;
        this.currentPage = 1;
        this.currentIndex = 1;
        this.totalCount = 0;
        this.totalPage = 0;
        this.isValid = true;
//      this.bindtarget = null;
//        this.bindname = null;
    },
    getConfig : function(){
        var c = {};
//      c.id = this.id;
        c.xtype = 'dataset';
        c.data = this.data;
        c.selected = this.selected;
        c.isValid = this.isValid;
//      c.bindtarget = this.bindtarget;
//        c.bindname = this.bindname;
        c.gotoPage = this.gotoPage;
        c.currentPage = this.currentPage;
        c.currentIndex = this.currentIndex;
        c.totalCount = this.totalCount;
        c.totalPage = this.totalPage;
        c.fields = this.fields;
        return c;
    },
    processListener: function(ou){
        if(this.notification){
            $A.manager[ou]('beforeunload',this.onBeforeUnload,this)
        }
    },
    onBeforeUnload : function(ms){
        if(this.isModified()){
            ms.add(this.notification);
        }
    },
    initEvents : function(){
        this.addEvents( 
            /**
             * @event ajaxfailed
             * ajax调用失败.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Object} res res.
             * @param {Object} opt opt.
             */
            'ajaxfailed',
            /**
             * @event beforecreate
             * 数据创建前事件.返回true则新增一条记录,false则不新增直接返回
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Object} object 新增的数据对象.
             */
            'beforecreate',
            /**
             * @event metachange
             * meta配置改变事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Aurora.Record} record 当前的record.
             * @param {Aurora.Record.Meta} meta meta配置对象.
             * @param {String} type 类型.
             * @param {Object} value 值.
             */
            'metachange',
            /**
             * @event fieldchange
             * field配置改变事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Aurora.Record} record 当前的record.
             * @param {Aurora.Record.Field} field Field配置对象.
             * @param {String} type 类型.
             * @param {Object} value 值.
             */
            'fieldchange',
            /**
             * @event add
             * 数据增加事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Aurora.Record} record 增加的record.
             * @param {Number} index 指针.
             */
            'add',
            /**
             * @event remove
             * 数据删除事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Aurora.Record} record 删除的record.
             * @param {Number} index 指针.
             */
            'remove',
            /**
             * @event beforeremove
             * 数据删除前.如果为true则删除一条记录,false则不删除直接返回
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Array} records 将要删除的数据集合
             */
            'beforeremove',
            /**
             * @event afterremove
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */
            'afterremove',
            /**
             * @event update
             * 数据更新事件.
             * "update", this, record, name, value
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Aurora.Record} record 更新的record.
             * @param {String} name 更新的field.
             * @param {Object} value 更新的值.
             * @param {Object} oldvalue 更新前的值.
             */
            'update',
            /**
             * @event clear
             * 清除数据事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */
            'clear',
            /**
             * @event query
             * 查询事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Object} queryParam 参数.
             * @param {Object} options 选项.
             */ 
            'query',
            /**
             * @event beforeload
             * 准备加载数据事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */ 
            'beforeload',
            /**
             * @event load
             * 加载数据事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */ 
            'load',
            /**
             * @event loadfailed
             * 加载数据失败.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Object} res res.
             * @param {Object} opt opt.
             */ 
            'loadfailed',
            /**
             * @event refresh
             * 刷新事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */ 
            'refresh',
            /**
             * @event valid
             * DataSet校验事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Aurora.Record} record 校验的record.
             * @param {String} name 校验的field.
             * @param {Boolean} valid 校验结果. true 校验成功  false 校验失败
             */ 
            'valid',
            /**
             * @event indexchange
             * DataSet当前指针改变事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Aurora.Record} record 当前record.
             */ 
            'indexchange',
            /**
             * @event beforeselect
             * 选择数据前事件. 返回true表示可以选中,false表示不能选中
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Aurora.Record} record 选择的record.
             */ 
            'beforeselect',
            /**
             * @event select
             * 选择数据事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Aurora.Record} record 选择的record.
             */ 
            'select',
            /**
             * @event unselect
             * 取消选择数据事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Aurora.Record} record 取消选择的record.
             */
            'unselect',
            /**
             * @event selectall
             * 选择数据事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */ 
            'selectall',
            /**
             * @event unselectall
             * 取消选择数据事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */
            'unselectall',
            /**
             * @event reject
             * 数据重置事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Aurora.Record} record 取消选择的record.
             * @param {String} name 重置的field.
             * @param {Object} value 重置的值.
             */
            'reject',
            /**
             * @event wait
             * 等待数据准备事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */
            'wait',
            /**
             * @event afterwait
             * 等待数据准备完毕事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */
            'afterwait',
            /**
             * @event beforesubmit
             * 数据提交前事件.如果为false则中断提交请求
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */
            'beforesubmit',
            /**
             * @event submit
             * 数据提交事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {String} url 提交的url.
             * @param {Array} datas 提交的数据.
             */
            'submit',
            /**
             * @event submitsuccess
             * 数据提交成功事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Object} res 返回结果res.
             */
            'submitsuccess',
            /**
             * @event submitfailed
             * 数据提交失败事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Object} res 返回结果res.
             */
            'submitfailed'
        );
        this.processListener('on');
    },
    addField : function(fd,notCheck){
        if(notCheck !== true){
        	var rf = fd.returnfield,
        		vf = fd.valuefield;
        	if(rf && vf){
        		var mapping = fd.mapping || [],has = false;
        		for(var i=0,l=mapping.length;i<l;i++){
        			var m = mapping[i];
        			if(m.from == vf && m.to == rf){
        				has = true
        				break;	
        			}
        		}
        		if(!has){
        			mapping.push({from:vf,to:rf});
        			fd.mapping = mapping;
        		}
        	}
        }
        var field = new $A.Record.Field(fd);
        this.fields[field.name] = field;
    },
    removeField : function(name){
    	this.fields[name] = null;
    	delete this.fields[name];
    },
    initFields : function(fields){
        for(var i = 0, len = fields.length; i < len; i++){
            this.addField(fields[i],true);
        }
    },
    /**
     * 获取Field配置.
     * @param {String} name Field的name. 
     * @return {Aurora.Record.Field} field配置对象
     */
    getField : function(name){
        return this.fields[name];
    },
    beforeLoadData : function(datas){
        if(this.processfunction) {
            var fun = $A.getRenderer(this.processfunction);
            if(fun){
                return fun.call(window,datas);
            }
        }
        return datas;
    },
    clearFilter : function(){
    	if(this.backup){
    		this.data = this.backup;
    		delete this.backup;
    	}
    },
    filter : function(callback,scope){
    	var d = this.backup||this.data,nd = [];
		this.backup = d;
		Ext.each(d,function(o){
			if(callback.call(scope||this,o,nd)!==false){
				nd.push(o);	
			}
		},this)
		this.data = nd;
    },
    loadData : function(datas, num, options){
    	this.clearFilter();
        datas = this.beforeLoadData(datas);
        this.data = [];
        this.selected = [];
        if(num && this.fetchall == false) {
            this.totalCount = num;
            this.totalPage = Math.ceil(this.totalCount/this.pagesize);
        }else{
            this.totalCount = datas.length;
            this.totalPage = 1;
        }
        
        
        for(var i = 0, len = datas.length; i < len; i++){
            var data = datas[i].data||datas[i];
            for(var key in this.fields){
                var field = this.fields[key];
                if(field){
                    data[key] = this.processData(data,key,field)
                }
            }
            var record = new $A.Record(data,datas[i].field);
            record.setDataSet(this);
            this.data.push(record);
        }
//        if(this.sortInfo) this.sort();
        
        this.fireEvent("beforeload", this, this.data);
        
        var needFire = true;
        if(this.bindtarget && options){
           var cr = $A.CmpManager.get(this.bindtarget).getCurrentRecord();
           if(options.opts.record && cr!=options.opts.record){
               this.refreshBindDataSet(options.opts.record,this.getConfig());
               needFire = false;
           }
        }
        if(needFire)
        this.fireEvent("load", this, options);
    },
    sort : function(f, direction){
        if(this.getAll().length==0)return;
        if(this.sorttype == 'remote'){
            if(direction=='') {
                delete this.qpara['ORDER_FIELD'];
                delete this.qpara['ORDER_TYPE'];
            }else{
                this.setQueryParameter('ORDER_FIELD', f);
                this.setQueryParameter('ORDER_TYPE', direction);            
            }
            this.query();
        }else{
            this.data.sort(function(a, b){
                var rs = a.get(f) > b.get(f)
                return (direction == 'desc' ? (rs ? -1 : 1) : (rs ? 1 : -1));
            })
            this.fireEvent('refresh',this);
        }
    },
    /**
     * 创建一条记录
     * @param {Object} data 数据对象
     * @param {Number} index 指定位置.若不指定则添加到最后.
     * @return {Aurora.Record} record 返回创建的record对象
     */
    create : function(data, index){
    	if(Ext.isNumber(data)){
    		index = data;
    		data = null;
    	}
//    	var dirty = !!data;//MAS云新增特性
    	data = data||{}
        if(this.fireEvent("beforecreate", this, data)){
    //      if(valid !== false) if(!this.validCurrent())return;
            var dd = {};
            for(var k in this.fields){
                var field = this.fields[k];
                var dv = field.getPropertity('defaultvalue');
                if(dv && !data[field.name]){
                    dd[field.name] = dv;
                }else {
                    dd[field.name] = this.processValueListField(dd,data[field.name],field);
                }
            }
            var data = Ext.apply(data||{},dd);
            var record = new $A.Record(data);
//            if(dirty)record.dirty = true;//MAS云新增特性
            this.add(record,index)
    //        var index = (this.currentPage-1)*this.pagesize + this.data.length;
    //        this.locate(index, true);
            return record;
        }
    },
    /**
     * 获取所有新创建的数据. 
     * @return {Array} 所有新创建的records
     */
    getNewRecords: function(){
        var records = this.getAll();
        var news = [];
        for(var k = 0,l=records.length;k<l;k++){
            var record = records[k];
            if(record.isNew == true){
                news.push(record);
            }
        }
        return news;
    },
//    validCurrent : function(){
//      var c = this.getCurrentRecord();
//      if(c==null)return true;
//      return c.validateRecord();
//    },
    /**
     * 新增数据. 
     * @param {Aurora.Record} record 需要新增的Record对象. 
     * @param {Number} index 指定位置.若不指定则添加到最后. 
     */
    add : function(record,index){
    	var d = this.data;
    	if(d.indexOf(record) != -1)return;
    	if(Ext.isEmpty(index)||index > d.length)index = d.length;
        record.isNew = true;
        record.setDataSet(this);
//        var index = this.data.length;
        d.splice(index,0,record);
//        for(var k in this.fields){
//          var field = this.fields[k];
//          if(field.type == 'dataset'){                
//              var ds = field.pro['dataset'];
//              ds.resetConfig()            
//          }
//      }
        this.currentIndex = (this.currentPage-1)*this.pagesize + index + 1;
        this.fireEvent("add", this, record, index);
        this.locate(this.currentIndex, true);
    },
    /**
     * 获取当前Record的数据对象
     * @return {Object}
     */
    getCurrentObject : function(){
        return this.getCurrentRecord().getObject();
    },
    /**
     * 获取当前指针的Record. 
     * @return {Aurora.Record} 当前指针所处的Record
     */
    getCurrentRecord : function(){
        if(this.data.length ==0) return null;
        return this.data[this.currentIndex - (this.currentPage-1)*this.pagesize -1];
    },
    /**
     * 移除数据.  
     * @param {Aurora.Record} record 需要移除的Record.
     */
    remove : function(record){
        if(!record){
            record = this.getCurrentRecord();
        }
        if(!record)return;
        var rs = [].concat(record);
        if(this.fireEvent("beforeremove", this, rs)){
            var rrs = [];
            for(var i=0;i<rs.length;i++){
                var r = rs[i]
                if(r.isNew){
                    this.removeLocal(r);
                }else{          
                    rrs[rrs.length] = r;
                }
            }
            this.removeRemote(rrs);
        }
    },
    removeRemote: function(rs){     
        if(this.submiturl == '') return;
        var p = [];
        for(var k=0;k<rs.length;k++){
            var r = rs[k]
            for(var key in this.fields){
                var f = this.fields[key];
                if(f && f.type == 'dataset') delete r.data[key];
            }
            var d = Ext.apply({}, r.data);
            d['_id'] = r.id;
            d['_status'] = 'delete';
            p[k] = d
        }
//      var p = [d];
//      for(var i=0;i<p.length;i++){
//          p[i] = Ext.apply(p[i],this.spara)
//      }
        if(p.length > 0) {
            var opts;
            if(this.bindtarget){
                var bd = $A.CmpManager.get(this.bindtarget);
                opts = {record:bd.getCurrentRecord(),dataSet:this};
            }
            $A.request({url:this.submiturl, para:p, ext:this.spara,success:this.onRemoveSuccess, error:this.onSubmitError, scope:this, failure:this.onAjaxFailed,opts:opts});
        }
    
    },
    onRemoveSuccess: function(res,options){
        if(res.result.record){
            var datas = [].concat(res.result.record);
            if(this.bindtarget){
                var bd = $A.CmpManager.get(this.bindtarget);
                if(bd.getCurrentRecord()==options.opts.record){
                    for(var i=0;i<datas.length;i++){
                        var data = datas[i];
                        this.removeLocal(this.findById(data['_id']),true); 
                    }
                }else{
                    var config = options.opts.record.get(this.bindname);
                    var ds = new $A.DataSet({});
                    ds.reConfig(config);
                    for(var i=0;i<datas.length;i++){
                        var data = datas[i];
                        ds.removeLocal(ds.findById(data['_id']),true);
                    }
                    this.refreshBindDataSet(options.opts.record,ds.getConfig())
                    delete ds;
                }
            }else{
                for(var i=0;i<datas.length;i++){
                    var data = datas[i];
                    this.removeLocal(this.findById(data['_id']),true); 
                }
            }
            this.fireEvent('afterremove',this);
        }
    },
    removeLocal: function(record,count,notLocate){
        $A.removeInvalidReocrd(this.id, record)
        var index = this.data.indexOf(record);      
        if(index == -1)return;
        this.data.remove(record);
        if(count) this.totalCount --;
        this.selected.remove(record);
//        if(this.data.length == 0){
//          this.removeAll();
//          return;
//        }
        if(!notLocate)
        if(this.data.length != 0){
            var lindex = this.currentIndex - (this.currentPage-1)*this.pagesize;
            if(lindex<0)return;
            if(lindex<=this.data.length){
                this.locate(this.currentIndex,true);
            }else{
                this.pre();
            }
        }
        this.fireEvent("remove", this, record, index);    
        if(!this.selected.length){
        	this.fireEvent('unselectall', this , this.selected);
        }
    },
    /**
     * 获取当前数据集下的所有数据.  
     * @return {Array} records 当前数据集的所有Record.
     */
    getAll : function(){
        return this.data;       
    },
    /**
     * 查找数据.  
     * @param {String} property 查找的属性.
     * @param {Object} value 查找的属性的值.
     * @return {Aurora.Record} 符合查找条件的第一个record
     */
    find : function(property, value){
        var r = null;
        this.each(function(record){
            var v = record.get(property);
            if(v ==value){
                r = record;
                return false;               
            }
        }, this)
        return r;
    },
    /**
     * 根据id查找数据.  
     * @param {Number} id id.
     * @return {Aurora.Record} 查找的record
     */
    findById : function(id){
        var find = null;
        for(var i = 0,len = this.data.length; i < len; i++){
            if(this.data[i].id == id){
                find = this.data[i]
                break;
            }
        }
        return find;
    },
    /**
     * 删除所有数据.
     */
    removeAll : function(){
        this.currentIndex = 1;
        this.totalCount = 0;
        this.data = [];
        this.selected = [];
        this.fireEvent("clear", this);
    },
    /**
     * 返回指定record的位置
     * @param {Aurora.Record} record
     * @return {int}
     */
    indexOf : function(record){
        return this.data.indexOf(record);
    },
    /**
     * 获取指定位置的record
     * @param {Number} 位置
     */
    getAt : function(index){
        return this.data[index];
    },
    each : function(fn, scope){
        var items = [].concat(this.data); // each safe for removal
        for(var i = 0, len = items.length; i < len; i++){
            if(fn.call(scope || items[i], items[i], i, len) === false){
                break;
            }
        }
    },
    processCurrentRow : function(){
        var r = this.getCurrentRecord();
        for(var k in this.fields){
            var field = this.fields[k];
            if(field.type == 'dataset'){
                var ds = field.pro['dataset'];
                if(r && r.data[field.name]){
                    ds.reConfig(r.data[field.name]);
                }else{
                    ds.resetConfig();
                }
                ds.fireEvent('refresh',ds);
                ds.processCurrentRow();
            }
        }
        if(r) this.fireEvent("indexchange", this, r);
    },
    /**
     * 获取所有选择的数据.
     * @return {Array} 所有选择数据.
     */
    getSelected : function(){
        return this.selected;
    },
    /**
     * 选择所有数据.
     */
    selectAll : function(){
    	if(!this.selectable)return;
        for(var i=0,l=this.data.length;i<l;i++){
            if(!this.execSelectFunction(this.data[i]))continue;
            this.select(this.data[i],true);
        }
        this.fireEvent('selectall', this , this.selected);
    },
    /**
     * 取消所有选择.
     */
    unSelectAll : function(){
    	if(!this.selectable)return;
        for(var i=0,l=this.data.length;i<l;i++){
            if(!this.execSelectFunction(this.data[i]))continue;
            this.unSelect(this.data[i],true);
        }
        this.fireEvent('unselectall', this , this.selected);
    },
    /**
     * 选择某个record.
     * @param {Aurora.Record} record 需要选择的record.
     */
    select : function(r,isSelectAll){
        if(!this.selectable)return;
        if(typeof(r) == 'string'||typeof(r) == 'number') r = this.findById(r);
        if(!r) return;
        if(this.selected.indexOf(r) != -1)return;
//        if(!this.execSelectFunction(r))return;
        if(this.fireEvent("beforeselect",this,r)){
        	r.isSelected = true;
            if(this.selectionmodel == 'multiple'){
                this.selected.add(r);
                this.fireEvent('select', this, r , isSelectAll);
            }else{
                var or = this.selected[0];
                this.unSelect(or);
                this.selected = []
                this.selected.push(r);
                this.fireEvent('select', this, r);
            }
        }
    },
    /**
     * 取消选择某个record.
     * @param {Aurora.Record} record 需要取消选择的record.
     */
    unSelect : function(r,isSelectAll){
        if(!this.selectable)return;
        if(typeof(r) == 'string'||typeof(r) == 'number') r = this.findById(r);
        if(!r) return;
        if(this.selected.indexOf(r) == -1) return;
        this.selected.remove(r);
        r.isSelected = false;
        this.fireEvent('unselect', this, r , isSelectAll);
    },
    execSelectFunction:function(r){
        if(this.selectfunction){
            var selfun = $A.getRenderer(this.selectfunction);
            if(selfun == null){
                alert("未找到"+this.selectfunction+"方法!")
            }else{
                var b=selfun.call(window,r);
                if(Ext.isDefined(b))return b;
            }
        }
        return true;
    },
    /**
     * 定位到某个指针位置.
     * @param {Number} index 指针位置.
     */
    locate : function(index, force){
        if(this.currentIndex === index && force !== true) return;
        if(this.fetchall == true && index > ((this.currentPage-1)*this.pagesize + this.data.length)) return;
        //对于没有autcount的,判断最后一页
        if(!this.autocount && index > ((this.currentPage-1)*this.pagesize + this.data.length) && this.data.length < this.pagesize) return;
//      if(valid !== false) if(!this.validCurrent())return;
        if(index<=0)return;
        if(index <=0 || (this.autocount && (index > this.totalCount + this.getNewRecords().length)))return;
        var lindex = index - (this.currentPage-1)*this.pagesize;
        if(this.data[lindex - 1]){
            this.currentIndex = index;
        }else{
            if(this.modifiedcheck && this.isModified()){
                $A.showInfoMessage(_lang['dataset.info'], _lang['dataset.info.locate'])
            }else{
                this.currentIndex = index;
                this.currentPage =  Math.ceil(index/this.pagesize);
                this.query(this.currentPage);
                return;
            }
        }
        this.processCurrentRow();
        if(this.selectionmodel == 'single'){
        	var r = this.getAt(index - this.pagesize*(this.currentPage-1)-1)
        	if(this.execSelectFunction(r))
        		this.select(r);
        }
    },
    /**
     * 定位到某页.
     * @param {Number} page 页数.
     */
    goPage : function(page){
        if(page >0) {
            this.gotoPage = page;
            var go = (page-1)*this.pagesize + 1;
            var news = this.getAll().length-this.pagesize;
            if(this.currentPage < page && news > 0)go+=news;
//          var go = Math.max(0,page-2)*this.pagesize + this.data.length + 1;
            this.locate(go);
        }
    },
    /**
     * 定位到所有数据的第一条位置.
     */
    first : function(){
        this.locate(1);
    },
    /**
     * 向前移动一个指针位置.
     */
    pre : function(){
        this.locate(this.currentIndex-1);       
    },
    /**
     * 向后移动一个指针位置.
     */
    next : function(){
        this.locate(this.currentIndex+1);
    },
    /**
     * 定位到第一页.
     */
    firstPage : function(){
        this.goPage(1);
    },
    /**
     * 向前移动一页.
     */
    prePage : function(){
        this.goPage(this.currentPage -1);
    },
    /**
     * 向后移动一页.
     */
    nextPage : function(){        
        this.goPage(this.currentPage +1);
    },
    /**
     * 定位到最后一页.
     */
    lastPage : function(){
        this.goPage(this.totalPage);
    },
    /**
     * 仅对dataset本身进行校验,不校验绑定的子dataset.
     * @param {Boolean} selected 校验选中的记录.
     * @return {Boolean} valid 校验结果.
     */
    validateSelf : function(selected){
        return this.validate(selected,true,false)
    },
    /**
     * 设置dataset是否进行校验
     * @return {Boolean} enable 是否校验.
     */
    setValidateEnable : function(enable){
        this.validateEnable = enable;
    },
    
    /**
     * 对当前数据集进行校验.
     * @param {Boolean} selected 校验选中的记录.
     * @return {Boolean} valid 校验结果.
     */
    validate : function(selected,fire,vc){
    	if(!this.validateEnable)return true;
        this.isValid = true;
        var current = this.getCurrentRecord();
        if(!current)return true;
        var records = selected?this.getSelected():this.getAll();
        var dmap = {};
        var hassub = false;
        var unvalidRecord = null;
        var issubValid = true;
        if(vc !== false)
        for(var k in this.fields){
            var field = this.fields[k];
            if(field.type == 'dataset'){
                hassub = true;
                var d = field.pro['dataset'];
                dmap[field.name] = d;
            }
        }
        for(var k = 0,l=records.length;k<l;k++){
            var record = records[k];
            //有些项目是虚拟的字段,例如密码修改
//          if(record.dirty == true || record.isNew == true) {
                if(!record.validateRecord()){
                    this.isValid = false;
                    unvalidRecord = record;
                    $A.addInValidReocrd(this.id, record);
                }else{
                    $A.removeInvalidReocrd(this.id, record);
                }
                if(this.isValid == false) {
                    if(hassub)break;
                } else {
                    for(var key in dmap){
                        var ds = dmap[key];
                        if(record.data[key]){
                            ds.reConfig(record.data[key]);
                            if(!ds.validate()) {
                                issubValid = this.isValid = false;
                                unvalidRecord = record;
                            }else
                            	ds.reConfig(current.data[key]);//循环校验完毕后,重新定位到当前行
                        }
                    }
                    
                    if(this.isValid == false) {
                        break;
                    }
                                    
//              }
            }
        }
        
        if(unvalidRecord != null){
            var r = this.indexOf(unvalidRecord);
            if(r!=-1)this.locate(r+1);
        }
        if(fire !== false && issubValid !== false) {
            $A.manager.fireEvent('valid', $A.manager, this, this.isValid);
            if(!this.isValid) {
	            var valid = unvalidRecord.valid,unvalidMessage;
	            for(var key in valid){
            		unvalidMessage = valid[key];
            		break;
	            }
	            $A.showInfoMessage(_lang['dataset.info'], unvalidMessage||_lang['dataset.info.validate']);
            }
        }
        return this.isValid;
    },
    /**
     * 设置查询的Url.
     * @param {String} url 查询的Url.
     */
    setQueryUrl : function(url){
        this.queryurl = url;
    },
    /**
     * 设置查询的参数.
     * @param {String} para 参数名.
     * @param {Object} value 参数值.
     */
    setQueryParameter : function(para, value){
        this.qpara[para] = value;
    },
    /**
     * 设置查询的DataSet.
     * @param {Aurora.DataSet} ds DataSet.
     */
    setQueryDataSet : function(ds){ 
        this.qds = ds;
        if(this.qds.getCurrentRecord() == null) this.qds.create();
    },
    /**
     * 设置提交的Url.
     * @param {String} url 提交的Url.
     */
    setSubmitUrl : function(url){
        this.submiturl = url;
    },
    /**
     * 设置提交的参数.
     * @param {String} para 参数名.
     * @param {Object} value 参数值.
     */
    setSubmitParameter : function(para, value){
        this.spara[para] = value;
    },
    isAllReady : function(isSelected){
        var sf = this,records = isSelected ? sf.getSelected():sf.getAll(),isReady = true;
        for(var i = 0,l = records.length;i < l;i++){
            var r = records[i];
            if(!r.isReady) {
                isReady = false;
                break;
            }
            Ext.iterate(r.data,function(name,item){
                if(item && item.xtype == 'dataset'){
                    var field = sf.fields[name];
                    var ds = field.pro['dataset'];
                    ds.reConfig(item);
                    if(!ds.isAllReady(isSelected)) {
                        isReady = false;
                        return false;
                    }
                }
            });
        }
        return isReady;
    },    
	/**
	 * 等待ds中的所有record都ready后执行回调函数
	 * @param {String} isAll 判断所有的record还是选中的record
	 * @param {Function} callback 回调函数
	 * @param {Object} scope 回调函数的作用域
	 */
    wait : function(isAll,callback,scope){
    	var sf = this,records = isAll ? sf.getAll() : sf.getSelected();
    	sf.fireBindDataSetEvent('wait');
    	for(var i = 0,r;r = records[i];i++){
	    	Ext.iterate(r.data,function(name,item){
	    		if(item && item.xtype == 'dataset'){
	    			records = records.concat(item.data);
	    		}
	    	});
    	}
		var	intervalId = setInterval(function(){
		        for(var i = 0,l = records.length;i < l;i++){
		            if(!records[i].isReady)return;
		        }
		        clearInterval(intervalId);
		        sf.fireBindDataSetEvent('afterwait');
		        if(callback)callback.call(scope||window);
		    },10);
    },
    /**
     * 查询数据.
     * @param {Number} page(可选) 查询的页数.
     */
    query : function(page,opts){
        $A.slideBarEnable = $A.SideBar.enable;
//        $A.SideBar.enable = false;
        if(!this.queryurl) return;
        if(this.qds) {
            if(this.qds.getCurrentRecord() == null) this.qds.create();
            this.qds.wait(true,function(){
	    		if(!this.qds.validate()) return;
                this.doQuery(page,opts);
	    	},this);
        }else{
            this.doQuery(page,opts);
        }
    },
    doQuery:function(page,opts){
        var r;
        if(this.qds)r = this.qds.getCurrentRecord();
        if(!page) this.currentIndex = 1;
        this.currentPage = page || 1;
        var q = {};
        if(r != null) Ext.apply(q, r.data);
        Ext.apply(q, this.qpara);
        for(var k in q){
           var v = q[k];
           if(Ext.isEmpty(v,false)) delete q[k];
        }
        var para = 'pagesize='+this.pagesize + 
                      '&pagenum='+this.currentPage+
                      '&_fetchall='+this.fetchall+
                      '&_autocount='+this.autocount
//                    + '&_rootpath=list'
        var url = this.queryurl +(this.queryurl.indexOf('?') == -1?'?':'&') + para;
        this.loading = true;
        this.fireEvent("query", this,q,opts);
//      this.fireBindDataSetEvent("beforeload", this);//主dataset无数据,子dataset一直loading
        if(this.qtId) Ext.Ajax.abort(this.qtId);
        this.qtId = $A.request({url:url, para:q, success:this.onLoadSuccess, error:this.onLoadError, scope:this,failure:this.onAjaxFailed,opts:opts,ext:opts?opts.ext:null});
    },
    /**
     * 判断当前数据集是否发生改变.
     * @return {Boolean} modified 是否发生改变.
     */
    isModified : function(){
        var modified = false;
        var records = this.getAll();
        for(var k = 0,l=records.length;k<l;k++){
            var record = records[k];
            if(record.dirty == true || record.isNew == true) {
                modified = true;
                break;
            }else{
                for(var key in this.fields){
                    var field = this.fields[key];
                    if(field.type == 'dataset'){                
                        var ds = field.pro['dataset'];
                        ds.reConfig(record.data[field.name]);
                        if(ds.isModified()){
                            modified = true;
                            break;
                        }
                    }
                }
            }
        }
        return modified;
    },
//    isDataModified : function(){
//      var modified = false;
//      for(var i=0,l=this.data.length;i<l;i++){
//          var r = this.data[i];           
//          if(r.dirty || r.isNew){
//              modified = true;
//              break;
//          }
//      }
//      return modified;
//    },
    /**
     * 以json格式返回当前数据集.
     * @return {Object} json 返回的json对象.
     */
    getJsonData : function(selected,fields){
        var datas = [];
        var items = this.data;
        if(selected) items = this.getSelected();
        for(var i=0,l=items.length;i<l;i++){
            var r = items[i];
//            var isAdd = r.dirty; //MAS云新增特性
            var isAdd = r.dirty || r.isNew;
            
            var d = Ext.apply({}, r.data);
            d['_id'] = r.id;
            d['_status'] = r.isNew ? 'insert' : 'update';
            for(var k in r.data){
            	if(fields && fields.indexOf(k)==-1){
            		delete d[k];
            	}else{
	                var item = d[k];
	                if(item && item.xtype == 'dataset'){
	                	//if(item.data.length > 0){
		                    var ds = new $A.DataSet({});//$(item.id);
		                    //ds.fields = item.data[0].ds.fields;
	                    	ds.reConfig(item)
		                    isAdd = isAdd == false ? ds.isModified() :isAdd;
		                    d[k] = ds.getJsonData();
	                	//}
	                }
            	}
            }
            
            if(isAdd||selected){
                datas.push(d);              
            }
        }
        
        return datas;
    },
    checkEmptyData : function(items){
    	var sf = this;
    	Ext.each(items,function(data){
    		Ext.iterate(data,function(key,d,f){
                if((f = sf.fields[key]) && f.type == 'dataset'){
            		sf.checkEmptyData(d);
                }else if(d ===''){
                	data[key]=null;
                }
    		})
    	});
    },
    doSubmit : function(url, items){
    	var sf = this;
        sf.fireBindDataSetEvent("submit",url,items);
        if((sf.submiturl = url||sf.submiturl) == '') return;
//        var p = items;//sf.getJsonData();
        sf.checkEmptyData(items);
//        for(var i=0;i<p.length;i++){
//            var data = p[i]
//            for(var key in data){
//                var f = sf.fields[key];
//                if(f && f.type != 'dataset' && data[key]==='')data[key]=null;
//            }
////            p[i] = Ext.apply(p[i],sf.spara)
//        }
        
        //if(p.length > 0) {
//            sf.fireEvent("submit", sf);
            $A.request({showSuccessTip:true,url:sf.submiturl, para:items, ext:sf.spara,success:sf.onSubmitSuccess, error:sf.onSubmitError, scope:sf,failure:sf.onAjaxFailed});
        //}
    },
    /**
     * 提交选中数据.
     * @param {String} url(可选) 提交的url.
     * @param {Array} fields(可选) 根据选定的fields提交.
     */
    submitSelected : function(url,fields){
    	this.submit(url,fields,true);
    },
    /**
     * 提交数据.
     * @param {String} url(可选) 提交的url.
     * @param {Array} fields(可选) 根据选定的fields提交.
     */
    submit : function(url,fields,selected){
    	var sf = this;
    	sf.wait(!selected,function(){
    		sf.fireEvent("beforesubmit",sf)
    			&& sf.validate(selected)
	               &&  sf.doSubmit(url,sf.getJsonData(selected,fields));
    	});
    },
    /**
     * post方式提交数据.
     * @param {String} url(可选) 提交的url.
     */
    post : function(url){
        var sf = this,r=sf.getCurrentRecord();
        r && sf.wait(true,function(){
            sf.validate() && $A.post(url,r.data);
    	});
    },
    /**
     * 重置数据.
     */
    reset : function(){
        var record=this.getCurrentRecord();
        if(!record || !record.fields)return;
        for(var c in record.fields){
            var v=record.fields[c].get('defaultvalue');
            if(v!=record.get(c))
                record.set(c,v==undefined||v==null?"":v);
        }
    },
    fireBindDataSetEvent : function(){//event
        var a = Ext.toArray(arguments);
        var event = a[0];
        a[0] = this;
        this.fireEvent.apply(this,[event].concat(a))
//      this.fireEvent(event,this);
        for(var k in this.fields){
            var field = this.fields[k];
            if(field.type == 'dataset'){  
                var ds = field.pro['dataset'];
                if(ds) {
                    ds.fireBindDataSetEvent(event)
                }
            }
        }
    },
    afterEdit : function(record, name, value,oldvalue) {
        this.fireEvent("update", this, record, name, value,oldvalue);
    },
    afterReject : function(record, name, value) {
        this.fireEvent("reject", this, record, name, value);
    },
    onSubmitSuccess : function(res){
        var datas = []
        if(res.result.record){
            datas = [].concat(res.result.record);
            this.commitRecords(datas,true)
        }
        this.fireBindDataSetEvent('submitsuccess',res);
    },
    commitRecords : function(datas,fire,record){
        //this.resetConfig();
        for(var i=0,l=datas.length;i<l;i++){
            var data = datas[i];
            var r = this.findById(data['_id']);
            if(!r) continue;
            if(r.isNew) this.totalCount ++;
            r.commit();
            var haschange = false;
            for(var k in data){
                var field = k;
                var f = this.fields[field];
                if(f && f.type == 'dataset'){
                    var ds = f.pro['dataset'];
                    ds.reConfig(r.data[f.name]);
                    if(data[k].record) {
                        ds.commitRecords([].concat(data[k].record),this.getCurrentRecord() === r && fire, r);                     
                    }
                }else if(f && f.type == 'hidden'){
                	continue
                }else{
                    var ov = r.get(field);
                    var nv = data[k]
                    if(field == '_id' || field == '_status'||field=='__parameter_parsed__') continue;
                    if(f){
                       nv = this.processData(data,k,f);
                    }
                    if(ov != nv) {
                    	haschange = true;
                        if(fire){
                            //由于commit放到上面,这个时候不改变状态,防止重复提交
                            r.set(field,nv, true);
                        }else{
                            r.data[field] = nv;
	                    	if(record)record.data[this.bindname]=this.getConfig();
                        }
                    }
                }
            }
            //提交后，如果没有sequence，就不会有值改变，所以手动触发一下update。
            if(!haschange && fire){
				 r.set('__for_update__',true,true);
				 delete r.data['__for_update__'];
				 r.commit();
            }
//          r.commit();//挪到上面了,record.set的时候会触发update事件,重新渲染.有可能去判断isNew的状态
        }
    },
    processData: function(data,key,field){
        var v = data[key];
        if(v){
            var dt = field.getPropertity('datatype');
            dt = dt ? dt.toLowerCase() : '';
            switch(dt){
                case 'date':
                    v = $A.parseDate(v);
                    break;
                case 'java.util.date':
                    v = $A.parseDate(v);
                    break;
                case 'java.sql.date':
                    v = $A.parseDate(v);
                    break;
                case 'java.sql.timestamp':
                    v = $A.parseDate(v);
                    v.xtype = 'timestamp';
                    break;
                case 'int':
                    v = parseInt(v);
                    break;
                case 'float':
                    v = parseFloat(v);
                    break;
                case 'boolean':
                    v = v=="true";
                    break;
            }
        }
        //TODO:处理options的displayField
        return this.processValueListField(data,v,field);
    }, 
    processValueListField : function(data,v, field){
        var op = field.getPropertity('options');
        var df = field.getPropertity('displayfield');
        var vf = field.getPropertity('valuefield');
        var mp = field.getPropertity('mapping')
        if(df && vf && op && mp && !v){
            var rf;
            for(var i=0;i<mp.length;i++){
                var map = mp[i];
                if(vf == map.from){
                    rf = map.to;
                    break;
                }
            }
            var rv = data[rf];
            var options = $(op);
            if(options && !Ext.isEmpty(rv)){
                var r = options.find(vf,rv);
                if(r){
                    v = r.get(df);
                }
            }
        }
        return v;
    },
    onSubmitError : function(res){
//      $A.showErrorMessage('错误', res.error.message||res.error.stackTrace,null,400,200);
        this.fireBindDataSetEvent('submitfailed', res);
    },
    onLoadSuccess : function(res, options){
        try {
            if(res == null) return;
            if(!res.result.record) res.result.record = [];
            var records = [].concat(res.result.record);
            //var total = res.result.totalCount;
            var total = res.result[this.totalcountfield]
            var datas = [];
            if(records.length > 0){
                for(var i=0,l=records.length;i<l;i++){
                    var item = {
                        data:records[i]             
                    }
                    datas.push(item);
                }
            }else if(records.length == 0){
                this.currentIndex  = 0
            }       
            this.loading = false;
            this.loadData(datas, total, options);
            if(datas.length != 0)
            this.locate(this.currentIndex,true);
            $A.SideBar.enable = $A.slideBarEnable;
            this.qtId = null;
        }catch(e){
        	window.console && console.error(e.stack);
        }
    },
    onAjaxFailed : function(res,opt){
        this.fireBindDataSetEvent('ajaxfailed',res,opt);
        this.qtId = null;
    },
    onLoadError : function(res,opt){
        this.fireBindDataSetEvent('loadfailed', res,opt);
//      $A.showWarningMessage('错误', res.error.message||res.error.stackTrace,null,350,150);
        this.loading = false;
        $A.SideBar.enable = $A.slideBarEnable;
        this.qtId = null;
    },
    onFieldChange : function(record,field,type,value) {
        this.fireEvent('fieldchange', this, record, field, type, value)
    },
    onMetaChange : function(record,meta,type,value) {
        this.fireEvent('metachange', this, record, meta, type, value)
    },
    onRecordValid : function(record, name, valid){
        if(valid==false && this.isValid !== false) this.isValid = false;
        this.fireEvent('valid', this, record, name, valid)
    }
});

/**
 * @class Aurora.Record
 * <p>Record是一个数据对象.
 * @constructor
 * @param {Object} data 数据对象. 
 * @param {Array} fields 配置对象. 
 */
$A.Record = function(data, fields){
    /**
     * Record的id. (只读).
     * @type Number
     * @property
     */
    this.id = ++$A.AUTO_ID;
    /**
     * Record的数据 (只读).
     * @type Object
     * @property
     */
    this.data = data;
    /**
     * Record的Fields (只读).
     * @type Object
     * @property
     */
    this.fields = {};
    /**
     * Record的验证信息 (只读).
     * @type Object
     * @property
     */
    this.valid = {};
    /**
     * Record的验证结果 (只读).
     * @type Boolean
     * @property
     */
    this.isValid = true; 
    /**
     * 是否是新数据 (只读).
     * @type Boolean
     * @property
     */
    this.isNew = false;
    /**
     * 是否发生改变 (只读).
     * @type Boolean
     * @property
     */
    this.dirty = false; 
    /**
     * 编辑状态 (只读).
     * @type Boolean
     * @property
     */
    this.editing = false;
    /**
     * 编辑信息对象 (只读).
     * @type Object
     * @property
     */
    this.modified= null;
    /**
     * 是否是已就绪数据 (只读).
     * @type Boolean
     * @property
     */
    this.isReady=true;
    /**
     * 是否被选中
     * @type Boolean
     * @property
     */
    this.isSelected = false;
    this.meta = new $A.Record.Meta(this);
    if(fields)this.initFields(fields);
};
$A.Record.prototype = {
    commit : function() {
        this.editing = false;
        this.valid = {};
        this.isValid = true;
        this.isNew = false;
        this.dirty = false;
        this.modified = null;
    },
    initFields : function(fields){
        for(var i=0,l=fields.length;i<l;i++){
            var f = new $A.Record.Field(fields[i]);
            f.record = this;
            this.fields[f.name] = f;
        }
    },
    validateRecord : function() {
        this.isValid = true;
        this.valid = {};
        var df = this.ds.fields;
        var rf = this.fields;
        var names = [];
        for(var k in df){
            if(df[k].type !='dataset')
            names.push(k);
        }
        
        for(var k in rf){
            if(names.indexOf(k) == -1){
                if(rf[k].type !='dataset')
                names.push(k);
            }
        }
        for(var i=0,l=names.length;i<l;i++){
            if(this.isValid == true) {
                this.isValid = this.validate(names[i]);
            } else {
                this.validate(names[i]);
            }
        }
        return this.isValid;
    },
    validate : function(name){
        var valid = true;
        var oldValid = this.valid[name];
        var v = this.get(name);
        var field = this.getMeta().getField(name)
        var validator = field.get('validator');
        var vv = v;
        if(v&&v.trim) vv = v.trim();
        if(Ext.isEmpty(vv) && field.get('required') == true){
            this.valid[name] = field.get('requiredmessage') || _lang['dataset.validate.required'];
            valid =  false;
        }
        if(valid == true){
            var isvalid = true;
            if(validator){
                var vc = window[validator];
                if(vc){
                    isvalid = vc.call(window,this, name, v);
                    if(isvalid !== true){
                        valid = false;  
                        this.valid[name] = isvalid;
                    }
                }else {
                    alert('未找到函数' + validator)
                }
            }
        }
        if(valid==true)delete this.valid[name];
        if((oldValid||this.valid[name])&& oldValid != this.valid[name])this.ds.onRecordValid(this,name,valid);
        return valid;
    },
    setDataSet : function(ds){
        this.ds = ds;
    },
    /**
     * 获取field对象
     * @param {String} name
     * @return {Aurora.Record.Field}
     */
    getField : function(name){
        return this.getMeta().getField(name);
    },
    getMeta : function(){
        return this.meta;
    },
    copy : function(record){
        if(record == this){
            alert('不能copy自身!');
            return;
        }
        if(record.dirty){
            for(var n in record.modified){
                this.set(n,record.get(n))
            }
        }
    },
    /**
     * 设置值.
     * @param {String} name 设定值的名字.
     * @param {Object} value 设定的值.
     * @param {Boolean} notDirty true 不改变record的dirty状态.
     */
    set : function(name, value, notDirty){
        var old = this.data[name];
        if(!(old === value||(Ext.isEmpty(old)&&Ext.isEmpty(value))||(Ext.isDate(old)&&Ext.isDate(value)&&old.getTime()==value.getTime()))){
            if(!notDirty){
                this.dirty = true;
                if(!this.modified){
                    this.modified = {};
                }
                if(typeof this.modified[name] == 'undefined'){
                    this.modified[name] = old;
                }
            }
            this.data[name] = value;
            if(!this.editing && this.ds) {
                this.ds.afterEdit(this, name, value, old);
            }
        }
        this.validate(name)
    },
    /**
     * 设置值.
     * @param {String} name 名字.
     * @return {Object} value 值.
     */
    get : function(name){
        return this.data[name];
    },
    /**
     * 返回record的data对象.
     * 可以通过obj.xx的方式获取数据
     * @return {Object}
     */
    getObject : function(){
        return Ext.apply({},this.data);
    },
    /**
     * 更新data数据.
     * @param {Object} o
     */
    setObject : function(o){
        for(var key in o){
            this.set(key,o[key]);
        }
    },
    reject : function(silent){
        var m = this.modified;
        for(var n in m){
            if(typeof m[n] != "function"){
                this.data[n] = m[n];
                this.ds.afterReject(this,n,m[n]);
            }
        }
        delete this.modified;
        this.editing = false;
        this.dirty = false;
    },
//    beginEdit : function(){
//        this.editing = true;
//        this.modified = {};
//    },
//    cancelEdit : function(){
//        this.editing = false;
//        delete this.modified;
//    },
//    endEdit : function(){
//        delete this.modified;
//        this.editing = false;
//        if(this.dirty && this.ds){
//            this.ds.afterEdit(this);//name,value怎么处理?
//        }        
//    },
    onFieldChange : function(name, type, value){
        var field = this.getMeta().getField(name);
        this.ds.onFieldChange(this, field, type, value);
    },
    onFieldClear : function(name){
        var field = this.getMeta().getField(name);
        this.ds.onFieldChange(this, field);
    },
    onMetaChange : function(meta, type, value){
        this.ds.onMetaChange(this,meta, type, value);
    },
    onMetaClear : function(meta){
        this.ds.onMetaChange(this,meta);
    },
    setDirty : function(dirty){
        this.dirty = dirty;
    }
}
$A.Record.Meta = function(r){
    this.record = r;
    this.pro = {};
}
$A.Record.Meta.prototype = {
    clear : function(){
        this.pro = {};
        this.record.onMetaClear(this);
    },
    getField : function(name){
        if(!name)return null;
        var f = this.record.fields[name];
        var df = this.record.ds.fields[name];
        var rf;
        if(!f){
            if(df){
                f = new $A.Record.Field({name:df.name,type:df.type||'string'});
            }else{
                f = new $A.Record.Field({name:name,type:'string'});//
            }
            f.record = this.record;
            this.record.fields[f.name]=f;
        }
        
        var pro = {};
        if(df) pro = Ext.apply(pro, df.pro);
        pro = $A.merge(pro, this.pro);
        pro = $A.merge(pro, f.pro);
        delete pro.name;
        delete pro.type;
        f.snap = pro;
        return f;
    },
    setRequired : function(r){
        var op = this.pro['required'];
        if(op !== r){
            this.pro['required'] = r;
            this.record.onMetaChange(this, 'required', r);
        }
    },
    setReadOnly : function(r){
        var op = this.pro['readonly'];
        if(op !== r){
            this.pro['readonly'] = r;
            this.record.onMetaChange(this,'readonly', r);
        }
    }
}
/**
 * @class Aurora.Record.Field
 * <p>Field是一个配置对象，主要配置指定列的一些附加属性，例如非空，只读，值列表等信息.
 * @constructor
 * @param {Object} data 数据对象. 
 */
$A.Record.Field = function(c){
    this.name = c.name;
    this.type = c.type;
    this.pro = c||{};
    this.record;
};
$A.Record.Field.prototype = {
    /**
     * 清除所有配置信息.
     */
    clear : function(){
        this.pro = {};
        this.record.onFieldClear(this.name);
    },
    setPropertity : function(type,value) {
        var op = this.pro[type];
        if(op !== value){
            this.pro[type] = value;
            if(this.snap)this.snap[type] = value;
            if(this.record)this.record.onFieldChange(this.name, type, value);
        }
    },
    /**
     * 获取配置信息
     * @param {String} name 配置名
     * @return {Object} value 配置值
     */
    get : function(name){
        var v = null;
        if(this.snap){
            v = this.snap[name];
        }else if(this.pro){
        	v = this.pro[name];
        }
        return v;
    },
    getPropertity : function(name){
        return this.pro[name]
    },
    /**
     * 设置当前Field是否必输
     * @param {Boolean} required  是否必输.
     */
    setRequired : function(r){
        this.setPropertity('required',r);
        if(!r && this.record)this.record.validate(this.name);
    },
    /**
     * 当前Field是否必输.
     * @return {Boolean} required  是否必输.
     */
    isRequired : function(){
        return this.get('required');
    },
    /**
     * 设置当前Field是否只读.
     * @param {Boolean} readonly 是否只读
     */
    setReadOnly : function(r){  
        if(r && this.record)delete this.record.valid[this.name];
        this.setPropertity('readonly',r);
    },
    /**
     * 当前Field是否只读.
     * @return {Boolean} readonly 是否只读
     */
    isReadOnly : function(){
        return this.get('readonly');
    },
    /**
     * 设置当前Field的数据集.
     * @param {Object} r 数据集
     */
    setOptions : function(r){
        this.setPropertity('options',r);
    },
    /**
     * 获取当前的数据集.
     * @return {Object} r 数据集
     */
    getOptions : function(){
        return this.get('options');
    },
    /**
     * 设置当前Field的映射.
     * 例如：<p>
       var mapping = [{from:'name', to: 'code'},{from:'service', to: 'name'}];</p>
       field.setMapping(mapping);
     * @return {Array} mapping 映射列表.
     * 
     */
    setMapping : function(m){
        this.setPropertity('mapping',m);
    },
    /**
     * 获取当前的映射.
     * @return {Array} array 映射集合
     */
    getMapping : function(){
        return this.get('mapping');
    },
    /**
     * 设置Lov弹出窗口的Title.
     * @param {String} title lov弹出窗口的Tile
     */
    setTitle : function(t){
        this.setPropertity('title',t);
    },
    /**
     * 设置Lov弹出窗口的宽度.
     * @param {Number} width lov弹出窗口的Width
     */
    setLovWidth : function(w){
        this.setPropertity('lovwidth',w);
    },
    /**
     * 设置Lov弹出窗口的高度.
     * @param {Number} height lov弹出窗口的Height
     */
    setLovHeight : function(h){
        this.setPropertity('lovheight',h);
    },
    /**
     * 设置Lov弹出窗口中grid的高度.
     * 配置这个主要是由于查询条件可能存在多个，导致查询的form过高.
     * @param {Number} height lov弹出窗口的grid组件的Height
     */
    setLovGridHeight : function(gh){
        this.setPropertity("lovgridheight",gh)
    },
    /**
     * 设置Lov的Model对象.
     * Lov的配置可以通过三种方式.(1)model (2)service (3)url.
     * @param {String} model lov配置的model.
     */
    setLovModel : function(m){
        this.setPropertity("lovmodel",m) 
    },
    /**
     * 设置Lov的Service对象.
     * Lov的配置可以通过三种方式.(1)model (2)service (3)url.
     * @param {String} service lov配置的service.
     */
    setLovService : function(m){
        this.setPropertity("lovservice",m) 
    },
    /**
     * 设置Lov的Url地址.
     * Lov的配置可以通过三种方式.(1)model (2)service (3)url.
     * 通过url打开的lov，可以不用调用setLovGridHeight
     * @param {String} url lov打开的url.
     */
    setLovUrl : function(m){
        this.setPropertity("lovurl",m) 
    },
    /**
     * 设置Lov的查询参数
     * @param {String} name
     * @param {Object} value
     */
    setLovPara : function(name,value){
        var p = this.get('lovpara')||{};
        if(value==null){
            delete p[name]
        }else{
            p[name] = value;
        }
        this.setPropertity("lovpara",p) 
    }
    
}
/**
 * @class Aurora.Component
 * @extends Ext.util.Observable
 * <p>所有组件对象的父类.
 * <p>所有的子类将自动继承Component的所有属性和方法.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Component = Ext.extend(Ext.util.Observable,{
	focusCss:'item-focus',
	constructor: function(config) {
        $A.Component.superclass.constructor.call(this);
        this.id = config.id || Ext.id();
        $A.CmpManager.put(this.id,this)
		this.initConfig=config;
		this.isHidden = false;
		this.isFireEvent = false;
        this.hasFocus = false;
		this.initComponent(config);
        this.initEvents();
        this.hidden && this.setVisible(false);
    },
    initComponent : function(config){ 
		config = config || {};
        Ext.apply(this, config);
        this.wrap = Ext.get(this.id);
        if(this.listeners){
            this.on(this.listeners);
        }
    },
    processListener: function(ou){
    	this.processMouseOverOut(ou)
        if(this.clientresize && (this.marginwidth||this.marginheight)) {
//        	this.windowResizeListener();//TODO:以后修改服务端component,去掉自身尺寸的判断
            Ext.EventManager[ou](window, "resize", this.windowResizeListener,this);
        }
    },
    processMouseOverOut : function(ou){
        if(this.wrap){
            this.wrap[ou]("mouseover", this.onMouseOver, this);
            this.wrap[ou]("mouseout", this.onMouseOut, this);
        }
    },
    initEvents : function(){
    	this.addEvents(
        /**
         * @event focus
         * 获取焦点事件
         * @param {Component} this 当前组件.
         */
    	'focus',
        /**
         * @event blur
         * 失去焦点事件
         * @param {Component} this 当前组件.
         */
    	'blur',
    	/**
         * @event change
         * 组件值改变事件.
         * @param {Component} this 当前组件.
         * @param {Object} value 新的值.
         * @param {Object} oldValue 旧的值.
         */
    	'change',
    	/**
         * @event valid
         * 组件验证事件.
         * @param {Component} this 当前组件.
         * @param {Aurora.Record} record record对象.
         * @param {String} name 对象绑定的Name.
         * @param {Boolean} isValid 验证是否通过.
         */
    	'valid',
    	/**
         * @event mouseover
         * 鼠标经过组件事件.
         * @param {Component} this 当前组件.
         * @param {EventObject} e 鼠标事件对象.
         */
    	'mouseover',
    	/**
         * @event mouseout
         * 鼠标离开组件事件.
         * @param {Component} this 当前组件.
         * @param {EventObject} e 鼠标事件对象.
         */
    	'mouseout');
    	this.processListener('on');
    },
    windowResizeListener : function(){
    	var ht,wd;
        var _rc = 'refresh';
        Ext.getBody().addClass(_rc);
//        Ext.getBody().setStyle('overflow','hidden')
        if(!Ext.isEmpty(this.marginheight)){
            ht = Aurora.getViewportHeight();
            this.setHeight(ht-this.marginheight);           
        }
        if(!Ext.isEmpty(this.marginwidth)){
            wd = Aurora.getViewportWidth();
            var v = wd-this.marginwidth;
            this.setWidth(v);
            //非标准做法,中集特殊要求！
            //this.setWidth(v < this.initConfig.width ? v : this.initConfig.width);
        }
        
        Ext.getBody().removeClass(_rc);
//        Ext.getBody().setStyle('overflow','auto');
    },
    isEventFromComponent:function(el){
    	return this.wrap.contains(el)||this.wrap.dom === (el.dom?el.dom:el);
    },
    move: function(x,y){
		if(!Ext.isEmpty(x))this.wrap.setX(x);
		if(!Ext.isEmpty(y))this.wrap.setY(y);
	},
	getBindName: function(){
		return this.binder ? this.binder.name : null;
	},
	getBindDataSet: function(){
		return this.binder ? this.binder.ds : null;
	},
	/**
     * 将组件绑定到某个DataSet的某个Field上.
     * @param {String/Aurora.DataSet} dataSet 绑定的DataSet. 可以是具体某个DataSet对象，也可以是某个DataSet的id.
     * @param {String} name Field的name. 
     */
    bind : function(ds, name){
    	this.clearBind();
    	if(typeof(ds) == 'string'){
    		ds = $(ds);
    	}
    	if(!ds)return;
    	this.binder = {
    		ds: ds,
    		name:name
    	}
    	this.record = ds.getCurrentRecord();
    	var field =  ds.fields[this.binder.name];
    	if(field) {
			var config={};
			Ext.apply(config,this.initConfig);
			Ext.apply(config, field.pro);
			delete config.name;
			delete config.type;
			this.initComponent(config);
			
    	}
    	ds.on('metachange', this.onRefresh, this);
    	ds.on('valid', this.onValid, this);
    	ds.on('remove', this.onRemove, this);
    	ds.on('clear', this.onClear, this);
    	ds.on('update', this.onUpdate, this);
    	ds.on('reject', this.onUpdate, this);
    	ds.on('fieldchange', this.onFieldChange, this);
    	ds.on('indexchange', this.onRefresh, this);
    	this.onRefresh(ds)
    },
    /**
     * 清除组件的绑定信息.
     * <p>删除所有绑定的事件信息.
     */
    clearBind : function(){
    	if(this.binder) {
    		var bds = this.binder.ds;
    		bds.un('metachange', this.onRefresh, this);
	    	bds.un('valid', this.onValid, this);
	    	bds.un('remove', this.onRemove, this);
	    	bds.un('clear', this.onClear, this);
	    	bds.un('update', this.onUpdate, this);
	    	bds.un('reject', this.onUpdate, this);
	    	bds.un('fieldchange', this.onFieldChange, this);
	    	bds.un('indexchange', this.onRefresh, this);
    	} 
		this.binder = null; 
		this.record = null;
		this.value = null;
    },
    /**
     * <p>销毁组件对象.</p>
     * <p>1.删除所有绑定的事件.</p>
     * <p>2.从对象管理器中删除注册信息.</p>
     * <p>3.删除dom节点.</p>
     */
    destroy : function(){
    	this.processListener('un');
    	$A.CmpManager.remove(this.id);
    	this.clearBind();
    	delete this.wrap;
    },
    onMouseOver : function(e){
    	this.fireEvent('mouseover', this, e);
    },
    onMouseOut : function(e){
    	this.fireEvent('mouseout', this, e);
    },
    onRemove : function(ds, record){
    	if(this.binder.ds == ds && this.record == record){
    		this.clearValue();
    	}
    },
    onCreate : function(ds, record){
    	this.clearInvalid();
    	this.record = ds.getCurrentRecord();
		this.setValue('',true);	
    },
    onRefresh : function(ds){
    	if(this.isFireEvent == true || this.isHidden == true) return;
    	this.clearInvalid();
		this.render(ds.getCurrentRecord());
    },
    render : function(record){
    	this.record = record;
    	if(this.record) {
			var value = this.record.get(this.binder.name);
			var field = this.record.getMeta().getField(this.binder.name);		
			var config={};
			Ext.apply(config,this.initConfig);
			Ext.apply(config, field.snap);
			this.initComponent(config);
			if(this.record.valid[this.binder.name]){
				this.markInvalid();
			}
			//TODO:和lov的设值有问题
//			if(this.value == value) return;
			if(!Ext.isEmpty(value,true)) {
                this.setValue(value,true);
			}else{
                this.clearValue();
			}
		} else {
			this.setValue('',true);
		}
    },
    onValid : function(ds, record, name, valid){
    	if(this.binder.ds == ds && this.binder.name == name && this.record == record){
	    	if(valid){
	    		this.fireEvent('valid', this, this.record, this.binder.name, true)
    			this.clearInvalid();
	    	}else{
	    		this.fireEvent('valid', this, this.record, this.binder.name, false);
	    		this.markInvalid();
	    	}
    	}    	
    },
    onUpdate : function(ds, record, name, value){
    	if(this.binder.ds == ds && this.record == record && this.binder.name == name && this.getValue() !== value){
	    	this.setValue(value, true);
    	}
    },
    onFieldChange : function(ds, record, field){
    	if(this.binder.ds == ds && this.record == record && this.binder.name == field.name){
	    	this.onRefresh(ds);   	
    	}
    },
    onClear : function(ds){
    	this.clearValue();    
    },
    /**
     * 设置当前的值.
     * @param {Object} value 值对象
     * @param {Boolean} silent 是否更新到dataSet中
     */
    setValue : function(v, silent){
    	var ov = this.value;
    	this.value = v;
    	if(silent === true)return;
    	if(this.binder){
    		this.record = this.binder.ds.getCurrentRecord();
    		if(this.record == null){
                this.record = this.binder.ds.create({},false);                
            }
            this.record.set(this.binder.name,v);
            if(Ext.isEmpty(v,true)) delete this.record.data[this.binder.name];
    	}
    	//if(ov!=v){
    	if(!(ov === v||(Ext.isEmpty(ov)&&Ext.isEmpty(v)))){
            this.fireEvent('change', this, v, ov);
    	}
    },
    /**
     * 返回当前值
     * @return {Object} value 返回值.
     */
    getValue : function(){
        var v= this.value;
        v=(v === null || v === undefined ? '' : v);
        return v;
    },
    setWidth: function(w){
    	if(this.width == w) return;
    	this.width = w;
    	this.wrap.setWidth(w);
    },
    setHeight: function(h){
    	if(this.height == h) return;
    	this.height = h;
    	this.wrap.setHeight(h);
    },
    /**
     * 显示组件
     */
    show : function(){
    	this.wrap.show();
    },
    /**
     * 隐藏组件
     */
    hide : function(){
    	this.wrap.hide();
    },
    setVisible : function(v){
    	this[v?'show':'hide']();
    },
    clearInvalid : function(){},
    markInvalid : function(){},
    clearValue : function(){},
    initMeta : function(){},
    setDefault : function(){},
    setRequired : function(){},
    onDataChange : function(){}
});
/**
 * @class Aurora.Field
 * @extends Aurora.Component
 * <p>带有input标记的输入类的组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Field = Ext.extend($A.Component,{	
	autoselect : true,
	transformcharacter : true,
	validators: [],
	requiredCss:'item-notBlank',
	readOnlyCss:'item-readOnly',
	emptyTextCss:'item-emptyText',
	invalidCss:'item-invalid',
	constructor: function(config) {
		config.required = config.required || false;
		config.readonly = config.readonly || false;
		config.autocomplete = config.autocomplete || false;
		config.autocompletefield = config.autocompletefield || null;
		config.autocompletesize = config.autocompletesize||2;
        config.autocompletepagesize = config.autocompletepagesize || 10;
        this.context = config.context||'';
		$A.Field.superclass.constructor.call(this, config);
    },
    initElements : function(){
    	this.el = this.wrap.child('input[atype=field.input]'); 
    },
    initComponent : function(config){
    	var sf = this;
    	$A.Field.superclass.initComponent.call(sf, config);
    	sf.service = sf.autocompleteservice || sf.lovservice || sf.lovmodel;
    	sf.para = {}
    	sf.initElements();
    	sf.originalValue = sf.getValue();
    	sf.applyEmptyText();
    	sf.initStatus();
//    	sf.hidden && sf.setVisible(false);
    	sf.initService()
    	sf.initAutoComplete();
    },
    processListener: function(ou){
    	var sf = this;
    	$A.Field.superclass.processListener.call(sf, ou);
//    	sf.el[ou](Ext.isIE || Ext.isSafari3 ? "keydown" : "keypress", sf.fireKey,  sf);
    	sf.el[ou]("focus", sf.onFocus,  sf)
    		[ou]("blur", sf.onBlur,  sf)
    		[ou]("change", sf.onChange, sf)
    		[ou]("keyup", sf.onKeyUp, sf)
        	[ou]("keydown", sf.onKeyDown, sf)
        	[ou]("keypress", sf.onKeyPress, sf);
//        	[ou]("mouseup", sf.onMouseUp, sf)
//        	[ou]("mouseover", sf.onMouseOver, sf)
//        	[ou]("mouseout", sf.onMouseOut, sf);
    },
    processMouseOverOut : function(ou){
    	var sf = this;
        sf.el[ou]("mouseover", sf.onMouseOver, sf)
        	[ou]("mouseout", sf.onMouseOut, sf);
    },
    initEvents : function(){
    	$A.Field.superclass.initEvents.call(this);
        this.addEvents(
        /**
         * @event keydown
         * 键盘按下事件.
         * @param {Aurora.Field} field field对象.
         * @param {EventObject} e 键盘事件对象.
         */
        'keydown',
        /**
         * @event keyup
         * 键盘抬起事件.
         * @param {Aurora.Field} field field对象.
         * @param {EventObject} e 键盘事件对象.
         */
        'keyup',
        /**
         * @event keypress
         * 键盘敲击事件.
         * @param {Aurora.Field} field field对象.
         * @param {EventObject} e 键盘事件对象.
         */
        'keypress',
        /**
         * @event enterdown
         * 回车键事件.
         * @param {Aurora.Field} field field对象.
         * @param {EventObject} e 键盘事件对象.
         */
        'enterdown');
    },
    destroy : function(){
    	var sf = this,view = sf.autocompleteview;
    	$A.Field.superclass.destroy.call(sf);
    	if(view){
    		view.destroy();
    		view.un('select',sf.onViewSelect,sf);
    		delete sf.autocompleteview;
        }
    	delete this.el;
    },
	setWidth: function(w){
		this.wrap.setStyle("width",(w+3)+"px");
		//this.el.setStyle("width",w+"px");
	},
	setHeight: function(h){
		this.wrap.setStyle("height",h+"px");
		this.el.setStyle("height",(h-2)+"px");
	},
//	setVisible: function(v){
//		this.wrap[v?'show':'hide']();
////		if(v==true)
////			this.wrap.show();
////		else
////			this.wrap.hide();
//	},
    initStatus : function(){
    	var sf = this;
    	sf.clearInvalid();
    	sf.initRequired(sf.required);
    	sf.initReadOnly(sf.readonly);
    	sf.initEditable(sf.editable);
    	sf.initMaxLength(sf.maxlength);
    },
//    onMouseOver : function(e){
//    	$A.ToolTip.show(this.id, "测试");
//    },
//    onMouseOut : function(e){
//    	$A.ToolTip.hide();
//    },
    onChange : function(e){},
    onKeyUp : function(e){
        this.fireEvent('keyup', this, e);
    },
    onKeyDown : function(e){
        var sf = this,keyCode = e.keyCode;
        sf.fireEvent('keydown', sf, e);  
        if((sf.isEditor==true && keyCode == 9) ||((sf.readonly||!sf.editable)&&keyCode == 8)) e.stopEvent();//9:tab  8:backspace
        if(keyCode == 13 || keyCode == 27) {//13:enter  27:esc
        	sf.blur();//为了获取到新的值
        	if(keyCode == 13) {
        		(function(){
        			sf.fireEvent('enterdown', sf, e);
        		}).defer(5);
        	}
        }
    },
    onKeyPress : function(e){
        this.fireEvent('keypress', this, e);
    },
//    fireKey : function(e){
//      this.fireEvent("keydown", this, e);
//    },
    onFocus : function(e){
        //(Ext.isGecko||Ext.isGecko2||Ext.isGecko3) ? this.select() : this.select.defer(10,this);
    	var sf = this;
    	sf.autoselect && sf.select.defer(1,sf);
        if(!sf.hasFocus){
            sf.hasFocus = true;
            sf.startValue = sf.getValue();
            if(sf.emptytext && !sf.readonly){
	            sf.el.dom.value == sf.emptytext && sf.setRawValue('');
	            sf.wrap.removeClass(sf.emptyTextCss);
	        }
	        sf.wrap.addClass(sf.focusCss);
            sf.fireEvent("focus", sf);
        }
    },
//    onMouseUp : function(e){
//    	this.isSelect && e.stopEvent();
//    	this.isSelect = false;
//    },
    processValue : function(v){
    	return v;
    },
    onBlur : function(e){
    	var sf = this;
    	if(sf.hasFocus){
	        sf.hasFocus = false;
//	        var rv = sf.getRawValue();
//           	rv = sf.processMaxLength(rv);
//	        rv = sf.processValue(rv);
//	        if(String(rv) !== String(sf.startValue)){
//	            sf.fireEvent('change', sf, rv, sf.startValue);
//	        } 
            
	        !sf.readonly && sf.setValue(sf.processValue(sf.processMaxLength(sf.getRawValue())));
	        sf.wrap.removeClass(sf.focusCss);
	        sf.fireEvent("blur", sf);
    	}
    },
    processMaxLength : function(rv){
    	var sb = [],cLength = $A.defaultChineseLength;
        if(this.isOverMaxLength(rv)){
            for (var i = 0,k=0; i < rv.length;i++) {
                var cr = rv.charAt(i),
                	cl = cr.match(/[^\x00-\xff]/g);
                k+=cl !=null && cl.length>0?cLength:1;
                if(k<=this.maxlength) {
                	sb.push(cr);
                }else{
                    break;
                }
            }
            return sb.join('');
        }
        return rv;
    },
    setValue : function(v, silent){
    	var sf = this;
    	if(sf.emptytext && sf.el && !Ext.isEmpty(v)){
            sf.wrap.removeClass(sf.emptyTextCss);
        }
        sf.setRawValue(sf.formatValue(Ext.isEmpty(v)? '' : v));
        sf.applyEmptyText();
    	$A.Field.superclass.setValue.call(sf,v, silent);
    },
    formatValue : function(v){
        var sf = this,rder = sf.renderer?$A.getRenderer(sf.renderer):null,
        	binder = sf.binder;
        return rder!=null ? rder(v,sf.record,binder && binder.name) : v;
    },
    getRawValue : function(){
        var sf = this,v = sf.el.getValue(),typecase = sf.typecase;
        v = v === sf.emptytext || v === undefined?'':v;
        if(sf.isDbc(v)){
            v = sf.dbc2sbc(v);
        }
        if(typecase){
	    	if(typecase == 'upper'){
		    	v = v.toUpperCase();
	        }else if(typecase == 'lower') {
	        	v = v.toLowerCase();
	        }
    	}
        return v;
    },
//    getValue : function(){
//    	var v= this.value;
//		v=(v === null || v === undefined ? '' : v);
//		return v;
//    },
    initRequired : function(required){
    	var sf = this;
    	if(sf.currentRequired == required)return;
		sf.clearInvalid();    	
    	sf.currentRequired = sf.required = required;
    	sf.wrap[required?'addClass':'removeClass'](sf.requiredCss);
    },
    initEditable : function(editable){
    	var sf = this;
    	if(sf.currentEditable == editable)return;
    	sf.currentEditable = sf.editable = editable;
    	sf.el.dom.readOnly = sf.readonly? true :(editable === false);
    },
    initReadOnly : function(readonly){
    	var sf = this;
    	if(sf.currentReadonly == readonly)return;
    	sf.currentReadonly = sf.readonly = readonly;
    	sf.el.dom.readOnly = readonly;
    	sf.wrap[readonly?'addClass':'removeClass'](sf.readOnlyCss);
    },
    isOverMaxLength : function(str){
        if(!this.maxlength) return false;
        var c = 0,i = 0,cLength = $A.defaultChineseLength;
        for (; i < str.length; i++) {
            var cl = str.charAt(i).match(/[^\x00-\xff]/g);
//            var st = escape(str.charAt(i));
            c+=cl !=null && cl.length>0?cLength:1;
        }
        return c > this.maxlength;
    },
    initMaxLength : function(maxlength){
    	if(maxlength)
    	this.el.dom.maxLength=maxlength;
    },
    initService : function(){
    	var sf = this,svc = sf.service;
    	if(svc){
    		sf.service = sf.processParmater(svc);
    	}
    },
    initAutoComplete : function(){
    	var sf = this,
    		svc = sf.service,
        	view = sf.autocompleteview,
    		field = sf.autocompletefield,
    		name = sf.binder && sf.binder.name;
    	if(sf.autocomplete && svc){
        	if(!view){
	        	view = sf.autocompleteview = new $A.AutoCompleteView({
	        		id:sf.id,
					el:sf.el,
					fuzzyfetch:sf.fuzzyfetch,
	        		cmp:sf
	        	});
        		view.on('select',sf.onViewSelect,sf);
        	}else if(!view.active){
        		view.processListener('on');
        	}
			view.active = true;	
        	if(!field){
        		Ext.each(sf.getMapping(),function(map){
        			if(map.to == name) field = sf.autocompletefield = map.from;
        		});
        		if(!field)field = name;
        	}
        	view.bind({
        		url:sf.context + 'autocrud/'+svc+'/query',
        		name:field,
        		size:sf.autocompletesize,
        		pagesize:sf.autocompletepagesize,
        		renderer:sf.autocompleterenderer,
				binder:sf.binder,
				fetchremote:sf.fetchremote === false?false:true
        	});
        }else if(view){
    		view.processListener('un');
    		view.active = false;
        }
    },
    onViewSelect : function(r){
    	var sf = this,record = sf.record;
    	Ext.each(r && sf.getMapping(),function(map){
    		var from = r.get(map.from);
            record.set(map.to,Ext.isEmpty(from)?'':from);
    	});
    },
    getMapping: function(){
        var mapping,r = this.record,name = this.binder.name;
        if(r){
            var field = r.getMeta().getField(name);
            if(field){
                mapping = field.get('mapping');
            }
        }
        return mapping ? mapping : [{from:name,to:name}];
    },
    applyEmptyText : function(){
    	var sf = this,emptytext = sf.emptytext;
        if(emptytext && sf.getRawValue().length < 1){
            sf.setRawValue(emptytext);
            sf.wrap.addClass(sf.emptyTextCss);
        }
    },
    processParmater:function(url){
        var li = url.indexOf('?')
        if(li!=-1){
            this.para = Ext.urlDecode(url.substring(li+1,url.length));
            return url.substring(0,li);
        } 
        return url;
    },
    getPara : function(){
    	return Ext.apply({},this.getFieldPara(),this.para);
    },
    getFieldPara : function(obj){
		return (obj = this.record) 
			&& (obj = obj.getMeta().getField(this.binder.name))
			&& Ext.apply({},obj.get('lovpara'));
    },
//    validate : function(){
//        if(this.readonly || this.validateValue(this.getValue())){
//            this.clearInvalid();
//            return true;
//        }
//        return false;
//    },
    clearInvalid : function(){
    	this.invalidMsg = null;
    	this.wrap.removeClass(this.invalidCss);
//    	this.fireEvent('valid', this);
    },
    markInvalid : function(msg){
    	this.invalidMsg = msg;
    	this.wrap.addClass(this.invalidCss);
    },
//    validateValue : function(value){    
//    	if(value.length < 1 || value === this.emptyText){ // if it's blank
//        	if(!this.required){
//                this.clearInvalid();
//                return true;
//        	}else{
//                this.markInvalid('字段费控');//TODO:测试
//        		return false;
//        	}
//        }
//    	Ext.each(this.validators.each, function(validator){
//    		var vr = validator.validate(value)
//    		if(vr !== true){
//    			//TODO:
//    			return false;
//    		}    		
//    	})
//        return true;
//    },
    select : function(start, end){
    	if(!this.hasFocus)return;
    	var v = this.getRawValue();
        if(v.length > 0){
            start = start === undefined ? 0 : start;
            end = end === undefined ? v.length : end;
            var d = this.el.dom;
            if(start === 0 && end === v.length && d.select){
            	d.select();
            }else{
	            if(d.setSelectionRange){  
	                d.setSelectionRange(start, end);
	            }else if(d.createTextRange){
	                var range = d.createTextRange();
	                range.moveStart("character", start);
	                range.moveEnd("character", end-v.length);
	                range.select();
	            }
            }
        }
//        this.isSelect = true;
    },
    setRawValue : function(v){
    	var dom = this.el.dom;
        if(dom.value === (v = Ext.isEmpty(v)?'':v)) return;
        return dom.value = v;
    },
    reset : function(){
    	var sf = this;
    	sf.setValue(sf.originalValue);
        sf.clearInvalid();
        sf.applyEmptyText();
    },
    /**
     * 组件获得焦点
     */
    focus : function(){
    	this.el.dom.focus();
    	this.fireEvent('focus', this);
    },
    /**
     * 组件失去焦点
     */
    blur : function(){
    	this.el.blur();
    	this.fireEvent('blur', this);
    },
    clearValue : function(){
    	this.setValue('', true);
    	this.clearInvalid();
        this.applyEmptyText();
    },
    /**
     * 设置prompt
     * @param {String} text prompt.
     */
    setPrompt : function(text){
		var prompt = Ext.fly(this.id+'_prompt');
		if(prompt){
			prompt.update(text);
		}
    },
    show : function(){
    	$A.Field.superclass.show.call(this);
    	var prompt = Ext.fly(this.id+'_prompt');
		if(prompt){
			prompt.show();
		}
    },
    hide : function(){
    	$A.Field.superclass.hide.call(this);
    	var prompt = Ext.fly(this.id+'_prompt');
		if(prompt){
			prompt.hide();
		}
    },
    isDbc : function(s){
        if(!this.transformcharacter) return false;
        var dbc = false;
        for(var i=0;i<s.length;i++){
            var c = s.charCodeAt(i);
            if((c>65248)||(c==12288)) {
                dbc = true
                break;
            }
        }
        return dbc;
    },
    dbc2sbc : function(str){
        var result = [];
        for(var i=0;i<str.length;i++){
            var code = str.charCodeAt(i);//获取当前字符的unicode编码
            if (code >= 65281 && code <= 65373) {//在这个unicode编码范围中的是所有的英文字母已及各种字符
                result.push(String.fromCharCode(code - 65248));//把全角字符的unicode编码转换为对应半角字符的unicode码                
            } else if (code == 12288){//空格
                result.push(' ');
            } else {
                result.push(str.charAt(i));
            }
        }
        return result.join('');
    }
});
/**
 * @class Aurora.Box
 * @extends Aurora.Component
 * <p>Box组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Box = Ext.extend($A.Component,{
	constructor: function(config) {
        this.errors = [];
        $A.Box.superclass.constructor.call(this,config);
    },
//    initComponent : function(config){ 
//		config = config || {};
//        Ext.apply(this, config); 
        //TODO:所有的组件?
//        for(var i=0;i<this.cmps.length;i++){
//    		var cmp = $(this.cmps[i]);
//    		if(cmp){
//	    		cmp.on('valid', this.onValid, this)
//	    		cmp.on('invalid', this.onInvalid,this)
//    		}
//    	}
//    },
    initEvents : function(){
//    	this.addEvents('focus','blur','change','invalid','valid');    	
    },
    onValid : function(cmp, record, name, isvalid){
    	if(isvalid){
    	   this.clearError(cmp.id);
    	}else{
            var error = record.errors[name];
            if(error){
                this.showError(cmp.id,error.message)
            }    		
    	}
    },
    showError : function(id, msg){
    	Ext.fly(id+'_vmsg').update(msg)
    },
    clearError : function(id){
    	Ext.fly(id+'_vmsg').update('')
    },
    clearAllError : function(){
    	for(var i=0;i<this.errors.length;i++){
    		this.clearError(this.errors[i])
    	}
    }
});
/**
 * @class Aurora.ImageCode
 * @extends Aurora.Component
 * <p>图片验证码组件.
 * @author njq.niu@hand-china.com
 * @constructor 
 */
$A.ImageCode = Ext.extend($A.Component,{
    processListener: function(ou){
        $A.ImageCode.superclass.processListener.call(this,ou);
        this.wrap[ou]("click", this.onClick,  this);
    },
    onClick : function(){
        if(this.enable == true)
    	this.refresh();
    },
    setEnable : function(isEnable){
        if(isEnable == true){
            this.enable = true;
            this.refresh();
        }else{
            this.enable = false;
            this.wrap.dom.src = "";
        }
    },
    /**
     * 重新加载验证码
     * 
     */
    refresh : function(){
        this.wrap.dom.src = "imagecode?r="+Math.random();
    }
});
/**
 * @class Aurora.Label
 * @extends Aurora.Component
 * <p>Label组件.
 * @author njq.niu@hand-china.com
 * @constructor 
 */
$A.Label = Ext.extend($A.Component,{
    onUpdate : function(ds, record, name, value){
    	if(this.binder.ds == ds && this.binder.name == name){
	    	this.updateLabel(record,name,value);
    	}
    },
    /**
     * 绘制Label
     * @param {Aurora.Record} record record对象
     */
    render : function(record){
    	this.record = record;
    	if(this.record) {
			var value = this.record.get(this.binder.name);
			this.updateLabel(this.record,this.binder.name,value);
    	}
    },
    updateLabel: function(record,name,value){
        var rder = $A.getRenderer(this.renderer);
	    if(rder!=null){
    		value = rder.call(window,value,record, name);
	    }
	    this.wrap.update(value);
    },
    setPrompt : function(text){
		var prompt = Ext.fly(this.id+'_prompt');
		if(prompt){
			prompt.update(text);
		}
    }
});
/**
 * @class Aurora.Link
 * @extends Aurora.Component
 * <p>Link组件.
 * @author njq.niu@hand-china.com
 * @constructor 
 */
$A.Link = Ext.extend($A.Component,{
    params: {},
    constructor: function(config) {
        this.url = config.url || "";
        $A.Link.superclass.constructor.call(this, config);
    },
    processListener: function(ou){
    },
    reset : function(){
        this.params = {};
    },
    /**
     * 增加参数值
     * @param {String} name 参数名
     * @param {Object} value 参数值
     */
    set : function(name,value){
        this.params[name]=value;
    },
    /**
     * 返回参数值
     * 
     * @param {String} name 参数名
     * @return {Object} obj 返回值
     */
    get : function(name){
        return this.params[name];
    },
    /**
     * 返回生成的URL
     * 
     * @return {String} url  
     */
    getUrl : function(){
        var url;
        var pr = Ext.urlEncode(this.params);
        if(Ext.isEmpty(pr)){
            url = this.url;
        }else{
            url = this.url +(this.url.indexOf('?') == -1?'?':'&') + Ext.urlEncode(this.params);
        } 
        return url;
    }
});
$A.HotKey = function(){
	var CTRL = 'CTRL',
		ALT = 'ALT',
		SHIFT = 'SHIFT',
		hosts = {},
		enable = true,
		onKeyDown = function(e,t){
			var key = e.keyCode,bind = [],handler,sf = this;
			if(key!=16 && key!=17 && key!=18 ){
				e.ctrlKey &&
					bind.push(CTRL);
				e.altKey &&
					bind.push(ALT);
				e.shiftKey &&
					bind.push(SHIFT);
				bind.push(String.fromCharCode(key));
				handler = hosts[sf.id][bind.join('+').toUpperCase()];
				if(handler){
					e.stopEvent();
					if(enable){
						enable = false;
						var focuser = Ext.get(t),
							tagName = t.tagName.toLowerCase(),
							fns = function(e){
								Ext.each(handler,function(fn){
									return fn();
								});
								focuser.un('focus',fns);
							}
						if(tagName=='input' || tagName=='textarea')
							focuser.on('focus',fns).blur().focus();
						else
							fns();
					}
				}
			}
		},
		onKeyUp = function(){
			enable = true;
		},
		on = function(host){
			host.on('keydown',onKeyDown,host,{stopPropagation:true})
				.on('keyup',onKeyUp);
		},
		pub = {
			addHandler : function(bind,handler){
				var binds = bind.toUpperCase().split('+'),key=[],
					host = window['__host']||Ext.getBody(),
					id = host.id,
					keys = hosts[id];
				if(!keys){
					hosts[id] = keys = {};
					on(host);
				}
				binds.indexOf(CTRL)!=-1 &&
					key.push(CTRL);
				binds.indexOf(ALT)!=-1 &&
					key.push(ALT);
				binds.indexOf(SHIFT)!=-1 &&
					key.push(SHIFT);
				if(key.length < binds.length){
					key.push(binds.pop());
					key = key.join('+');
					(keys[key]||(keys[key] = [])).add(handler);
				}
			}
		};
	return pub;
}();
(function(A){
var TR = 'TR',
	SELECTED_CLS = 'autocomplete-selected',
	EVT_CLICK = 'click',
	EVT_MOUSE_MOVE = 'mousemove',
	EVT_MOUSE_DOWN = 'mousedown',
	TEMPLATE = ['<div id="{id}" tabIndex="-2" class="item-popup" style="visibility:hidden;background-color:#fff;">','</div>'],
    SHADOW_TEMPLATE = ['<div id="{id}" class="item-shadow" style="visibility:hidden;">','</div>'],
    AUTO_COMPLATE_TABLE_START = '<table class="autocomplete" cellspacing="0" cellpadding="2">';
A.AutoCompleteView = Ext.extend($A.Component,{	
	constructor: function(config) {
		var sf = this;
		config.id = config.id + '_autocomplete';
		sf.isLoaded = false;
		sf.maxHeight = 250;
        sf.delay = 500;
        $A.AutoCompleteView.superclass.constructor.call(sf, config);
    },
    initComponent : function(config){
    	var sf = this;
    	$A.AutoCompleteView.superclass.initComponent.call(this, config);
    	sf.wrap = new Ext.Template(TEMPLATE).insertFirst(document.body,{width:sf.width,height:sf.height,id:sf.id},true);
    	sf.shadow = new Ext.Template(SHADOW_TEMPLATE).insertFirst(document.body,{width:sf.width,height:sf.height,id:sf.id+'_shadow'},true);
    	sf.ds = new A.DataSet({id:sf.id+"_ds",autocount:false});
    },
    processListener: function(ou){
    	$A.AutoCompleteView.superclass.processListener.call(this, ou);
    	var sf = this,
    		ds = sf.ds;
    	sf.el[ou]('keyup',sf.onKeyUp,sf)
    		[ou]('keydown',sf.onKeyDown,sf)
    		[ou]('blur',sf.onBlur,sf);
    	ds[ou]('load', sf.onLoad, sf);
            ds[ou]('query', sf.onQuery, sf);
		sf.wrap[ou](EVT_CLICK, sf.onClick,sf)
			[ou]('mousedown',sf.onMouseDown,sf,{preventDefault:true})
    },
    initEvents : function(){
    	$A.AutoCompleteView.superclass.initEvents.call(this);
        this.addEvents(
        /**
         * @event select
         * 选择记录.
         * @param {Aurora.Record} r 选择的记录.
         */
        'select',
        EVT_CLICK);
    },
    bind : function(obj){
    	Ext.apply(this,obj);
    },
    destroy : function(){
    	var sf = this,wrap = sf.wrap;
    	sf.ds.destroy();
    	sf.shadow.remove();
    	$A.AutoCompleteView.superclass.destroy.call(sf);
    	wrap.remove();
    	delete sf.ds;
    	delete sf.shadow;
    },
    onQuery : function(){
    	var sf = this;
    	sf.wrap.update('<table cellspacing="0" cellpadding="2"><tr tabIndex="-2"><td>'+_lang['lov.query']+'</td></tr></table>')
    		.un(EVT_MOUSE_MOVE,sf.onMove,sf);
    	sf.correctViewSize();
    },
	onLoad : function(){
		var sf = this,
    		datas = sf.ds.getAll(),
			l=datas.length,view = sf.wrap,
			sb;
		sf.selectedIndex = null;
		if(l==0){
			sb = [AUTO_COMPLATE_TABLE_START,'<tr tabIndex="-2"><td>',_lang['lov.notfound'],'</td></tr></table>'];
		}else{
			sb = sf.createListView(datas,sf.binder);
			view.on(EVT_MOUSE_MOVE,sf.onMove,sf);
		}
		sf.isLoaded = true;
		view.update(sb.join(''));
		sf.correctViewSize();
	},
	onKeyDown : function(e){
		if(this.isShow){
			var sf = this,
				keyCode = e.keyCode,
				index = sf.selectedIndex;
            if(keyCode == 13) {
    	    	if(index != null){
    	    		sf.el.blur();
    	    		(function(){
	        			sf.onSelect(index);
	    				sf.hide();
    	    		}).defer(10,sf);
        		}else{
        			sf.hide();
        		}
            }else if(keyCode == 27 || keyCode == 9){
            	sf.hide();
//            	sf.el.blur();
            }else if(sf.ds.getAll().length > 0){
    	        if(keyCode == 38){
    	        	sf.selectItem(index == null ? -1 : index - 1,true);
    	        }else if(keyCode == 40){
    	        	sf.selectItem(index == null ? 0 : index + 1,true);
    	        }
            }
		}
	},
    onKeyUp : function(e){
    	var sf = this,svc = sf.url,
    		cmp = sf.cmp,
    		v=(cmp?cmp.getRawValue():sf.el.getValue()).trim(),
    		code = e.keyCode;
        sf.fireEvent('keyup', sf, e);
        if(code > 40 || (code < 37 && code != 13 && code !=27 && code != 9 && code!=17)){
    		if(v.length >= sf.size){
        		if(sf.showCompleteId)clearTimeout(sf.showCompleteId);
        		sf.showCompleteId=function(){
        			var ds = sf.ds;
			        ds.setQueryUrl(Ext.urlAppend(svc , Ext.urlEncode(cmp?cmp.getPara():sf.para)));
			       	ds.setQueryParameter(sf.name,sf.fuzzyfetch?v+'%':v);
        			ds.pagesize = sf.pagesize;
        			sf.show();
        			ds.query();
        			delete sf.showCompleteId;
        		}.defer(sf.delay);
        	}else{
        		if(sf.showCompleteId){
        			clearTimeout(sf.showCompleteId);
        			delete sf.showCompleteId;
        		}
    			sf.hide();
        	}
    	}
    },
    onBlur : function(e){
    	var sf = this;
		if(sf.showCompleteId){
			clearTimeout(sf.showCompleteId);
			delete sf.showCompleteId;
		}
    },
    onMove:function(e,t){
        this.selectItem((Ext.fly(t).findParent(TR)||t).tabIndex);        
	},
    onClick:function(e,t){
    	t = Ext.fly(t).findParent(TR)||t;
		if(t.tagName!=TR){
		    return;
		}		
		this.onSelect(t);
		this.hide();
	},
	onMouseDown:function(){
		var sf = this;
		(function(){
			sf.el.focus();
		}).defer(Ext.isIE?1:0,sf);
	},
	onSelect : function(target){
		var sf = this,r,
			index = Ext.isNumber(target)?target:target.tabIndex;
		if(index>-1){
			r = sf.ds.getAt(index);
		}
		sf.fireEvent('select',r);
		sf.el.focus();
	},
	selectItem:function(index,focus){
		if(Ext.isEmpty(index)||index < -1){
			return;
		}	
		var sf = this,node = sf.getNode(index),selectedIndex = sf.selectedIndex;
		if(node && (index = node.tabIndex)!=selectedIndex){
			if(!Ext.isEmpty(selectedIndex)){							
				Ext.fly(sf.getNode(selectedIndex)).removeClass(SELECTED_CLS);
			}
			sf.selectedIndex=index;			
			if(focus)sf.focusRow(index);			
			Ext.fly(node).addClass(SELECTED_CLS);					
		}			
	},
	focusRow : function(row){
        var binder = this.binder,
        	displayFields = binder?binder.ds.getField(binder.name).getPropertity('displayFields'):null,
        	head = displayFields && displayFields.length?23:0,
        	r = 22,
            ub = this.wrap,
            stop = ub.getScroll().top,
            h = ub.getHeight(),
            sh = ub.dom.scrollWidth > ub.dom.clientWidth? 16 : 0;
        if(row*r<stop){
            ub.scrollTo('top',row*r-1)
        }else if((row+1)*r + head>(stop+h-sh)){//this.ub.dom.scrollHeight
            ub.scrollTo('top', (row+1)*r-h + sh+head);
        }
    },
	getNode:function(index){
		var nodes = this.wrap.query('tr[tabindex!=-2]'),l = nodes.length;
		if(index >= l) index =  index % l;
		else if (index < 0) index = l + index % l;
		return nodes[index];
	},
    show : function(){
    	var sf = this,view;
    	if(!sf.isShow){
    		sf.isShow=true;
    		view = sf.wrap;
	    	sf.position();
	    	view.dom.className = 'item-popup item-comboBox-view';
			view.update('');
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
    		sf.isLoaded = false;
	    	Ext.get(document).un(EVT_MOUSE_DOWN,sf.trigger,sf)
	    	sf.wrap.hide();
	    	sf.shadow.hide();
    	}
    },
    position:function(){
    	var sf = this,
    		wrap = sf.cmp ? sf.cmp.wrap : sf.el,
    		xy = wrap.getXY(),
			W=sf.getWidth(),H=sf.getHeight(),
			PH=wrap.getHeight(),
			BH=A.getViewportHeight()-3,BW=A.getViewportWidth()-3,
			x=(xy[0]+W)>BW?((BW-W)<0?xy[0]:(BW-W)):xy[0];
			y=(xy[1]+PH+H)>BH?((xy[1]-H)<0?(xy[1]+PH):(xy[1]-H)):(xy[1]+PH);
    	sf.moveTo(x,y);
    },
    createListView : function(datas,binder){
    	var sb = [AUTO_COMPLATE_TABLE_START],
    		displayFields;
        if(binder){
        	displayFields = binder.ds.getField(binder.name).getPropertity('displayFields');
        	if(displayFields && displayFields.length){
	        	sb.push('<tr tabIndex="-2" class="autocomplete-head">');
	        	Ext.each(displayFields,function(field){
	        		sb.push('<td>',field.prompt,'</td>');
	        	});
				sb.push('</tr>');
        	}
        }
		for(var i=0,l=datas.length;i<l;i++){
			var d = datas[i];
			sb.push('<tr tabIndex="',i,'"',i%2==1?' class="autocomplete-row-alt"':'','>',this.getRenderText(d,displayFields),'</tr>');	//sf.litp.applyTemplate(d)等数据源明确以后再修改		
		}
		sb.push('</table>');
		return sb;
    },
    getRenderText : function(record,displayFields){
        var sf = this,
        	rder = A.getRenderer(sf.renderer),
        	text = [],
        	fn = function(t){
        		var v = record.get(t);
        		text.push('<td>',Ext.isEmpty(v)?'&#160;':v,'</td>');
        	};
        if(rder){
            text.push(rder.call(window,sf,record));
        }else if(displayFields && displayFields.length){
        	Ext.each(displayFields,function(field){
        		fn(field.name);
        	});
        }else{
        	fn(sf.name)
        }
		return text.join('');
	},
    correctViewSize: function(){
		var sf = this,
			table = sf.wrap.child('table');
		if(table.getWidth() < 150)table.setWidth(150);
		sf.setHeight(Math.max(Math.min(table.getHeight()+2,sf.maxHeight),20));
    	sf.setWidth(sf.wrap.getWidth());
		sf.position();
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
//    	this.wrap.setWidth(w);
    	this.shadow.setWidth(w);
    },
    getHeight : function(){
    	return this.wrap.getHeight();
    },
    getWidth : function(){
    	return this.wrap.getWidth();
    }
});


	
})($A);
/**
 * @class Aurora.Button
 * @extends Aurora.Component
 * <p>按钮组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Button = Ext.extend($A.Component,{
	disableCss:'item-btn-disabled',
	overCss:'item-btn-over',
	pressCss:'item-btn-pressed',
	disabled:false,
	constructor: function(config) {
        $A.Button.superclass.constructor.call(this, config);
    },
	initComponent : function(config){
    	$A.Button.superclass.initComponent.call(this, config);
    	this.el = this.wrap.child('button[atype=btn]');
    	this.textEl = this.el.child('div');
    	if(this.hidden == true)this.setVisible(false)
    	if(this.disabled == true)this.disable();
    },
    processListener: function(ou){
    	$A.Button.superclass.processListener.call(this,ou);
    	this.wrap[ou]("click", this.onClick,  this);
        this.wrap[ou]("mousedown", this.onMouseDown,  this);
        this.el[ou]("focus",this.onFocus,this);
        this.el[ou]("blur",this.onBlur,this);
        this.el[ou]("keydown",this.onKeyDown,this);
    },
    initEvents : function(){
    	$A.Button.superclass.initEvents.call(this);
    	this.addEvents(
    	/**
         * @event click
         * 鼠标点击事件.
         * @param {Aurora.Button} button 按钮对象.
         * @param {EventObject} e 键盘事件对象.
         */
    	'click');
    },
    /**
     * 点击按钮
     */
    click : function(){
    	this.el.dom.click();
    },
    destroy : function(){
		$A.Button.superclass.destroy.call(this);
    	delete this.el;
    },
    /**
     * 设置按钮是否可见.
     * @param {Boolean} visiable  是否可见.
     */
//    setVisible: function(v){
//		if(v==true)
//			this.wrap.show();
//		else
//			this.wrap.hide();
//	},
//    destroy : function(){
//    	$A.Button.superclass.destroy.call(this);
//    	this.el.un("click", this.onClick,  this);
//    	delete this.el;
//    },
	/**
	 * 获取焦点
	 */
	focus: function(){
		if(this.disabled)return;
		this.el.dom.focus();
	},
	/**
	 * 失去焦点
	 */	
	blur : function(){
    	if(this.disabled) return;
    	this.el.dom.blur();
    },
    /**
     * 设置不可用状态
     */
    disable: function(){
    	this.disabled = true;
    	this.wrap.addClass(this.disableCss);
    	this.el.dom.disabled = true;
    },
    /**
     * 设置可用状态
     */
    enable: function(){
    	this.disabled = false;
    	this.wrap.removeClass(this.disableCss);
    	this.el.dom.disabled = false;
    },
    onMouseDown: function(e){
    	if(!this.disabled){
        	this.wrap.addClass(this.pressCss);
        	Ext.get(document.documentElement).on("mouseup", this.onMouseUp, this);
    	}
    },
    onMouseUp: function(e){
    	if(!this.disabled){
        	Ext.get(document.documentElement).un("mouseup", this.onMouseUp, this);
        	this.wrap.removeClass(this.pressCss);
    	}
    },
    onKeyDown: function(e){
    	if(!this.disabled && e.keyCode == 13){
        	this.wrap.addClass(this.pressCss);
        	Ext.get(document.documentElement).on("keyup", this.onKeyUp, this);
    	}
    },
    onKeyUp: function(e){
    	if(!this.disabled && e.keyCode == 13){
        	Ext.get(document.documentElement).un("keyup", this.onKeyUp, this);
        	if(this.wrap)this.wrap.removeClass(this.pressCss);
    	}
    },
    onClick: function(e){
    	if(!this.disabled){
        	e.stopEvent();
        	this.fireEvent("click", this, e);
    	}
    },
    onFocus : function(e){
        this.hasFocus = true;
        this.onMouseOver(e);
    },
    onBlur : function(e){
        this.hasFocus = false;
        this.onMouseOut(e)
    },
    onMouseOver: function(e){
    	if(!this.disabled)
    	this.wrap.addClass(this.overCss);
        $A.Button.superclass.onMouseOver.call(this,e);
    },
    onMouseOut: function(e){
    	if(!this.disabled)
    	this.wrap.removeClass(this.overCss);
        $A.Button.superclass.onMouseOut.call(this,e);
    },
    /**
     * 设置按钮的文本.
     * @param {String} text  文本.
     */
    setText : function(text){
    	this.textEl.update(text);
    }
});
$A.Button.getTemplate = function(id,text,width){
    return '<TABLE class="item-btn " id="'+id+'" style="WIDTH: '+(width||60)+'px" cellSpacing="0"><TBODY><TR><TD class="item-btn-tl"><I></I></TD><TD class="item-btn-tc"></TD><TD class="item-btn-tr"><I></I></TD></TR><TR><TD class="item-btn-ml"><I></I></TD><TD class="item-btn-mc"><BUTTON hideFocus style="HEIGHT: 17px" atype="btn"><div>'+text+'</div></BUTTON></TD><TD class="item-btn-mr"><I></I></TD></TR><TR><TD class="item-btn-bl"><I></I></TD><TD class="item-btn-bc"></TD><TD class="item-btn-br"><I></I></TD></TR></TBODY></TABLE><script>new Aurora.Button({"id":"'+id+'"});</script>';
}
/**
 * @class Aurora.CheckBox
 * @extends Aurora.Component
 * <p>可选组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.CheckBox = Ext.extend($A.Component,{
	checkedCss:'item-ckb-c',
	uncheckedCss:'item-ckb-u',
	readonyCheckedCss:'item-ckb-readonly-c',
	readonlyUncheckedCss:'item-ckb-readonly-u',
	constructor: function(config){
		config.checked = config.checked || false;
		config.readonly = config.readonly || false;
		$A.CheckBox.superclass.constructor.call(this,config);
	},
	initComponent:function(config){
		this.checkedvalue = 'Y';
		this.uncheckedvalue = 'N';
		$A.CheckBox.superclass.initComponent.call(this, config);
		this.wrap=Ext.get(this.id);
		this.el=this.wrap.child('div[atype=checkbox]');
	},
	processListener: function(ou){
    	this.wrap
    		[ou]('mousedown',this.onMouseDown,this)
    		[ou]('click',this.onClick,this);
    	this.el[ou]('keydown',this.onKeyDown,this);
    	this.el[ou]('focus',this.onFocus,this)
    	this.el[ou]('blur',this.onBlur,this)
    },
	initEvents:function(){
		$A.CheckBox.superclass.initEvents.call(this);  	
		this.addEvents(
		/**
         * @event click
         * 鼠标点击事件.
         * @param {Aurora.CheckBox} checkBox 可选组件.
         * @param {Boolean} checked 选择状态.
         */
		'click');    
	},
	destroy : function(){
    	$A.CheckBox.superclass.destroy.call(this);
    	delete this.el;
    },
    onKeyDown : function(e){
    	var keyCode = e.keyCode;
    	if(keyCode == 32){
    		this.onClick.call(this,e);
    		e.stopEvent();
    	}
    },
    onMouseDown : function(e){
    	var sf = this;
    	sf.hasFocus && e.stopEvent();
    	sf.focus.defer(Ext.isIE?1:0,sf);
    },
	onClick: function(event){
		if(!this.readonly){
			this.checked = this.checked ? false : true;	
			this.setValue(this.checked);
			this.fireEvent('click', this, this.checked);
			this.focus();
		}
	},
	focus : function(){
		this.el.focus();
	},
	blur : function(){
		this.el.blur();		
	},
	onFocus : function(){
		var sf = this;
		if(!sf.hasFocus){
	        sf.hasFocus = true;
			sf.el.addClass(sf.focusCss);
			sf.fireEvent('focus',sf);
		}
	},
	onBlur : function(){
		var sf = this;
		if(sf.hasFocus){
	        sf.hasFocus = false;
			sf.el.removeClass(sf.focusCss);
			sf.fireEvent('blur',sf);
		}
	},
	setValue:function(v, silent){
		if(typeof(v)==='boolean'){
			this.checked=v?true:false;			
		}else{
			this.checked = (''+v == ''+this.checkedvalue)
//			this.checked = v === this.checkedvalue ? true : false;
		}
		this.initStatus();
		var value = this.checked==true ? this.checkedvalue : this.uncheckedvalue;		
		$A.CheckBox.superclass.setValue.call(this,value, silent);
	},
	getValue : function(){
    	var v= this.value;
		v=(v === null || v === undefined ? '' : v);
		return v;
    },
//	setReadOnly:function(b){
//		if(typeof(b)==='boolean'){
//			this.readonly=b?true:false;	
//			this.initStatus();		
//		}		
//	},
	initStatus:function(){
		this.el.removeClass(this.checkedCss);
		this.el.removeClass(this.uncheckedCss);
		this.el.removeClass(this.readonyCheckedCss);
		this.el.removeClass(this.readonlyUncheckedCss);
		if (this.readonly) {				
			this.el.addClass(this.checked ? this.readonyCheckedCss : this.readonlyUncheckedCss);			
		}else{
			this.el.addClass(this.checked ? this.checkedCss : this.uncheckedCss);
		}		
	}			
});
/**
 * @class Aurora.Radio
 * @extends Aurora.Component
 * <p>单选框组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Radio = Ext.extend($A.Component, {
	ccs:'item-radio-img-c',
	ucs:'item-radio-img-u',
	rcc:'item-radio-img-readonly-c',
	ruc:'item-radio-img-readonly-u',
//	optionCss:'item-radio-option',
	imgCss:'item-radio-img',
	valueField:'value',
	constructor: function(config){
		config.checked = config.checked || false;
		config.readonly = config.readonly || false;
		$A.Radio.superclass.constructor.call(this,config);		
	},
	initComponent:function(config){
		$A.Radio.superclass.initComponent.call(this, config);
		this.wrap=Ext.get(this.id);	
		this.nodes = Ext.DomQuery.select('.item-radio-option',this.wrap.dom);
		this.initStatus();
//		this.select(this.selectIndex);
	},	
	processListener: function(ou){
        $A.Radio.superclass.processListener.call(this, ou);
    	this.wrap[ou]('click',this.onClick,this);
    	this.wrap[ou]("keydown", this.onKeyDown, this);
    	this.wrap[ou]('focus', this.onFocus, this);
    	this.wrap[ou]('blur', this.onBlur, this);
    },
    focus : function(){
    	this.wrap.focus();
    },
    blur : function(){
    	this.wrap.blur();
    },
    onFocus : function(){
		this.fireEvent('focus',this);
	},
	onBlur : function(){
		this.fireEvent('blur',this);
	},
	onKeyDown:function(e){
        var sf = this,keyCode = e.keyCode,
        	options = sf.options,
        	valueField = sf.valueField;
        sf.fireEvent('keydown', sf, e);
        if(keyCode == 13)  {
            (function(){
                sf.fireEvent('enterdown', sf, e);
            }).defer(5);
        }else{
        	var i = options.indexOf(sf.getValueItem());
        	if(keyCode==40 || keyCode==39){
	            ++i < options.length && sf.setValue(options[i][valueField]);
	            e.stopEvent();
	        }else if(keyCode==38 || keyCode==37){
	            --i >=0 && sf.setValue(options[i][valueField]);
	            e.stopEvent();
	        }
        }
    },
	initEvents:function(){
		$A.Radio.superclass.initEvents.call(this); 	
		this.addEvents(
		/**
         * @event click
         * 点击事件.
         * @param {Aurora.Tree} Radio对象
         * @param {Object} 当前选中的值
         */
		'click',
		/**
         * @event keydown
         * 键盘事件.
         * @param {Aurora.Tree} Radio对象
         * @param {Event} 键盘事件对象
         */
		'keydown',
		/**
         * @event enterdown
         * 回车事件.
         * @param {Aurora.Tree} Radio对象
         * @param {Event} 键盘事件对象
         */
		'enterdown');    
	},
	setValue:function(value,silent){
		if(value=='')return;
		$A.Radio.superclass.setValue.call(this,value, silent);
		this.initStatus();
		this.focus();
	},
	getItem: function(){
		var item = this.getValueItem();
		if(item!=null){
            item = new $A.Record(item);
		}
		return item;
	},
	getValueItem: function(){
	   var v = this.getValue();
	   var l = this.options.length;
	   var r = null;
	   for(var i=0;i<l;i++){
	       var o = this.options[i];
	       if(o[this.valueField]==v){
	           r = o;
	           break;
	       }
	   }	   
	   return r;
	},
	select : function(i){
		var v = this.getItemValue(i);
		if(v){
			this.setValue(v);
		}
	},
	getValue : function(){
    	var v = this.value;
		v=(v === null || v === undefined ? '' : v);
		return v;
    },
//	setReadOnly:function(b){
//		if(typeof(b)==='boolean'){
//			this.readonly=b?true:false;	
//			this.initStatus();		
//		}
//	},
	initStatus:function(){
		var l=this.nodes.length;
		for (var i = 0; i < l; i++) {
			var node=Ext.fly(this.nodes[i]).child('.'+this.imgCss);		
			node.removeClass(this.ccs);
			node.removeClass(this.ucs);
			node.removeClass(this.rcc);
			node.removeClass(this.ruc);
			var value = Ext.fly(this.nodes[i]).getAttributeNS("","itemvalue");
			//if((i==0 && !this.value) || value === this.value){
			if(value == this.value){
				this.readonly?node.addClass(this.rcc):node.addClass(this.ccs);				
			}else{
				this.readonly?node.addClass(this.ruc):node.addClass(this.ucs);		
			}
		}
	},
	getItemValue:function(i){
	   var node = Ext.fly(this.nodes[i]);
	   if(!node)return null;
	   var v = node.getAttributeNS("","itemvalue");
	   return v;
	},
	onClick:function(e) {
		if(!this.readonly){
			var l=this.nodes.length;
			for (var i = 0; i < l; i++) {
				var node = Ext.fly(this.nodes[i]);
				if(node.contains(e.target)){
					var v = node.getAttributeNS("","itemvalue");
					this.setValue(v);
					this.fireEvent('click',this,v);
					break;
				}
			}
			
		}		
	}	
});
/**
 * @class Aurora.TextField
 * @extends Aurora.Field
 * <p>文本输入组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.TextField = Ext.extend($A.Field,{
    initComponent : function(config){
    	$A.TextField.superclass.initComponent.call(this, config);
    	var sf = this,
    		restrict = sf.restrict,
    		typecase = sf.typecase;
    	if(restrict){
    		sf.restrict = restrict.replace(/^\[|\]$/mg,'');
    	}
    	typecase &&
	    	sf.el.setStyle('text-transform',typecase+'case');
    },
    isCapsLock: function(e){
        var keyCode  =  e.getKey(),
        	isShift  =  e.shiftKey;
        if (((keyCode >= 65&&keyCode<=90)&&!isShift)||((keyCode>=97&&keyCode<=122)&&isShift)){
        	if(this.dcl!=true)
            $A.showWarningMessage(_lang['textfield.warn'], _lang['textfield.warn.capslock']);
        	this.dcl = true;
        }else{
            this.dcl = false;
        }
    }, 
    onKeyPress : function(e){
    	var sf = this,k = e.getCharCode(),
    		restrict = sf.restrict,
    		restrictinfo = sf.restrictinfo;
        if((Ext.isGecko || Ext.isOpera) && (e.isSpecialKey() || k == 8 || k == 46)){//BACKSPACE or DELETE
            return;
        }
    	if(restrict && !new RegExp('['+restrict+']').test(String.fromCharCode(k))){
    		if(restrictinfo)$A.ToolTip.show(sf.id,restrictinfo);
            e.stopEvent();
            return;
    	}
    	$A.TextField.superclass.onKeyPress.call(sf,e);
    	if(sf.detectCapsLock) sf.isCapsLock(e);
    },
    processValue : function(v){
    	var sf = this,
    		restrict = sf.restrict,
    		restrictinfo = sf.restrictinfo,
    		vv = v;
    	if(restrict){
    		v = String(v).replace(new RegExp('[^'+restrict+']','mg'),'');
    		if(restrictinfo && v != vv)$A.ToolTip.show(sf.id,restrictinfo);
    	}
        return v;
    }
})
/**
 * @class Aurora.NumberField
 * @extends Aurora.TextField
 * <p>数字输入组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.NumberField = Ext.extend($A.TextField,{
	allowdecimals : true,
    allownegative : true,
    allowformat : true,
	baseChars : "0123456789",
    decimalSeparator : ".",
    decimalprecision : 2,
	constructor: function(config) {
        $A.NumberField.superclass.constructor.call(this, config);
    },
    initComponent : function(config){
    	var sf = this;
    	$A.NumberField.superclass.initComponent.call(sf, config); 
    	sf.max = Ext.isEmpty(config.max)?Number.MAX_VALUE:Number(config.max);
		sf.min = Ext.isEmpty(config.min)?-Number.MAX_VALUE:Number(config.min);
    	sf.restrict = sf.baseChars+'';
    	sf.restrictinfo = _lang['numberfield.only'];
        if(sf.allowdecimals){
            sf.restrict += sf.decimalSeparator;
        }
        if(sf.allownegative){
            sf.restrict += "-";
        }
    },
//    initEvents : function(){
//    	$A.NumberField.superclass.initEvents.call(this);
//    },
    onBlur : function(e){
    	$A.ToolTip.hide();
    	$A.NumberField.superclass.onBlur.call(this,e);
    },
    formatValue : function(v){
    	var sf = this,rv = $A.parseScientific(sf.fixPrecision(sf.parseValue(v)));
        if(sf.allowformat)rv = $A.formatNumber(rv);
        return $A.NumberField.superclass.formatValue.call(sf,rv);
    },
    processMaxLength : function(rv){
    	var s=$A.parseScientific(rv).split('.'),isNegative=false;
    	if(s[0].search(/-/)!=-1)isNegative=true;
    	return (isNegative?'-':'')+$A.NumberField.superclass.processMaxLength.call(this, s[0].replace(/[-,]/g,''))+(s[1]?'.'+s[1]:''); 
    },
    initMaxLength : function(maxlength){
    	if(maxlength && !this.allowdecimals)
    		this.el.dom.maxLength=maxlength;
    },
    processValue : function(v){
    	var sf = this,info;
    	v = sf.parseValue(v);
    	if(v>sf.max){
    		v = sf.max;
    		info = _lang['numberfield.max']+v;
    	}else if(v<sf.min){
    		v = sf.min
    		info = _lang['numberfield.min']+v;
    	}
    	if(info)$A.ToolTip.show(sf.id,info);
    	return v;
    },
    onFocus : function(e) {
    	var sf = this;
    	if(!sf.readonly && sf.allowformat) {
            sf.setRawValue($A.removeNumberFormat(sf.getRawValue()));
        }
    	$A.NumberField.superclass.onFocus.call(sf,e);
    },
    parseValue : function(value){
    	var sf = this;
    	value = String(value);
		if(value.indexOf(",")!=-1)value=value.replace(/,/g,"");
    	if(!sf.allownegative)value = value.replace('-','');
    	if(!sf.allowdecimals)value = value.indexOf(".")==-1?value:value.substring(0,value.indexOf("."));
        value = parseFloat(sf.fixPrecision(value.replace(sf.decimalSeparator, ".")));
        return isNaN(value) ? '' : value;
    },
    fixPrecision : function(value){
        var nan = isNaN(value);
        if(!this.allowdecimals || this.decimalprecision == -1 || nan || !value){
           return nan ? '' : value;
        }
        var vs = parseFloat(value).toFixed(this.decimalprecision);
        if(this.allowpad == false) vs = String(parseFloat(vs))
        return vs;
    }
})
/**
 * @class Aurora.Spinner
 * @extends Aurora.TextField
 * <p>微调范围输入组件.
 * @author huazhen.wu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Spinner = Ext.extend($A.NumberField,{
//	constructor: function(config) {
//        $A.Spinner.superclass.constructor.call(this, config);
//    },
    initComponent : function(config){
    	var sf = this;
    	$A.Spinner.superclass.initComponent.call(sf, config);
		var decimal = String(sf.step = Number(config.step||1)).split('.')[1];
		sf.decimalprecision = decimal?decimal.length:0;
    	sf.btn = sf.wrap.child('div.item-spinner-btn');
    },
    processListener: function(ou){
    	var sf = this;
    	$A.Spinner.superclass.processListener.call(sf, ou);
    	sf.btn[ou]('mouseover',sf.onBtnMouseOver,sf)
    		[ou]('mouseout',sf.onBtnMouseOut,sf)
    		[ou]('mousedown',sf.onBtnMouseDown,sf)
    		[ou]('mouseup',sf.onBtnMouseUp,sf);
    },
    onBtnMouseOver:function(e,t){
    	if(this.readonly)return;
    	Ext.fly(t).addClass('spinner-over');
    },
    onBtnMouseOut:function(e,t){
    	if(this.readonly)return;
    	Ext.fly(t).removeClass('spinner-over');
    	this.onBtnMouseUp(e,t);
    },
    onBtnMouseDown:function(e,t){
    	if(this.readonly)return;
    	var target = Ext.fly(t),
			isPlus = !!target.addClass('spinner-select').parent('.item-spinner-plus'),
			sf = this;
		sf.goStep(isPlus,function(){
	    	sf.intervalId = setInterval(function(){
		    	clearInterval(sf.intervalId);
	    		sf.intervalId = setInterval(function(){
	    			sf.goStep(isPlus,null,function(){
	    				clearInterval(sf.intervalId);
	    			});
	    		},40);
	    	},500);			
		});
    },
    onBtnMouseUp : function(e,t){
    	var sf = this;
    	if(sf.readonly)return;
    	Ext.fly(t).removeClass('spinner-select');
    	if(sf.intervalId){
	    	clearInterval(sf.intervalId);
    		sf.setValue(sf.getRawValue());
	    	delete sf.intervalId;
    	}
    },
    /**
     * 递增
     */
    plus : function(){
    	this.goStep(true,function(n){
    		this.setValue(n);
    	});
    },
    /**
     * 递减
     */
    minus : function(){
    	this.goStep(false,function(n){
    		this.setValue(n);
    	});
    },
    goStep : function(isPlus,callback,callback2){
    	if(this.readonly)return;
    	var sf = this,
    		step = sf.step,
    		min = sf.min,
    		max = sf.max,
    		raw = sf.getRawValue(),
    		n = raw?Number(raw)
				+ (isPlus ? step : -step):(0<min?min:(0>max?max:0)),
    		mod = sf.toFixed(sf.toFixed(n - min)%step);
    	n = sf.toFixed(n - (mod == step ? 0 : mod));
    	if(n <= max && n >= min){
    		sf.setRawValue(sf.formatValue(n));
    		if(callback)callback.call(sf,n);
    	}else{
    		if(callback2)callback2.call(sf,n)
    	}
    },
    toFixed : function(n){
    	return Number(n.toFixed(this.decimalprecision));
    }
});
/**
 * @class Aurora.TriggerField
 * @extends Aurora.TextField
 * <p>触发类组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.TriggerField = Ext.extend($A.TextField,{
	constructor: function(config) {
        $A.TriggerField.superclass.constructor.call(this, config);
    },
    initComponent : function(config){
    	$A.TriggerField.superclass.initComponent.call(this, config);
    	this.trigger = this.wrap.child('div[atype=triggerfield.trigger]'); 
    	this.initPopup();
    },
    initPopup: function(){
    	if(this.initpopuped == true) return;
    	this.popup = this.wrap.child('div[atype=triggerfield.popup]');
    	this.shadow = this.wrap.child('div[atype=triggerfield.shadow]');
    	Ext.getBody().insertFirst(this.popup);
    	Ext.getBody().insertFirst(this.shadow);
    	this.initpopuped = true
    },
    initEvents:function(){
		$A.TriggerField.superclass.initEvents.call(this);
		this.addEvents(
		/**
         * @event expand
         * 展开事件.
         * @param {Aurora.TriggerField} triggerField 所有可展开控件对象.
         */
		'expand',
		/**
         * @event collapse
         * 收缩事件.
         * @param {Aurora.TriggerField} triggerField 所有可展开控件对象.
         */
		'collapse'
		);
	},
    processListener: function(ou){
    	$A.TriggerField.superclass.processListener.call(this, ou);
    	this.trigger[ou]('click',this.onTriggerClick, this, {preventDefault:true})
    	this.popup[ou]('click',this.onPopupClick, this,{stopPropagation:true})
    },
    /**
     * 判断当时弹出面板是否展开
     * @return {Boolean} isexpanded 是否展开
     */
    isExpanded : function(){ 
    	var xy = this.popup.getXY();
    	return !(xy[0]<-500||xy[1]<-500)
    },
    setWidth: function(w){
		this.wrap.setStyle("width",(w+3)+"px");
		//this.el.setStyle("width",(w-20)+"px");
	},
	onPopupClick : function(){
		this.hasExpanded = true;
		this.el.focus();	
	},
    onFocus : function(){
        $A.TriggerField.superclass.onFocus.call(this);
        if(!this.readonly && !this.isExpanded() && !this.hasExpanded)this.expand();
        this.hasExpanded = false;
    },
    onBlur : function(e){
//        if(this.isEventFromComponent(e.target)) return;
//    	if(!this.isExpanded()){
	    	this.hasFocus = false;
	        this.wrap.removeClass(this.focusCss);
	        this.fireEvent("blur", this);
//    	}
    },
    onKeyDown: function(e){
		switch(e.keyCode){
    		case 9:
    		case 13:
    		case 27:if(this.isExpanded())this.collapse();break;
    		case 40:if(!this.isExpanded() && !this.readonly)this.expand();
		}
    	$A.TriggerField.superclass.onKeyDown.call(this,e);
    },
    isEventFromComponent:function(el){
    	return $A.TriggerField.superclass.isEventFromComponent.call(this,el) || this.popup.dom == el || this.popup.contains(el);
    },
	destroy : function(){
		if(this.isExpanded()){
    		this.collapse();
    	}
    	this.shadow.remove();
    	this.popup.remove();
    	$A.TriggerField.superclass.destroy.call(this);
    	delete this.popup;
    	delete this.shadow;
	},
    triggerBlur : function(e,t){
    	if(!this.isEventFromComponent(t)){    		
            if(this.isExpanded()){
	    		this.collapse();
	    	}	    	
        }
    },
    setVisible : function(v){
    	$A.TriggerField.superclass.setVisible.call(this,v);
    	if(v == false && this.isExpanded()){
    		this.collapse();
    	}
    },
    /**
     * 折叠弹出面板
     */
    collapse : function(){
    	Ext.get(document.documentElement).un("mousedown", this.triggerBlur, this);
    	this.popup.moveTo(-1000,-1000);
    	this.shadow.moveTo(-1000,-1000);
    	this.fireEvent("collapse", this);
    },
    /**
     * 展开弹出面板
     */
    expand : function(){
//    	Ext.get(document.documentElement).on("mousedown", this.triggerBlur, this, {delay: 10});
        //对于某些行上的cb，如果是二级关联的情况下，会expand多次，导致多次绑定事件
        Ext.get(document.documentElement).un("mousedown", this.triggerBlur, this);
    	Ext.get(document.documentElement).on("mousedown", this.triggerBlur, this);
    	this.syncPopup();
    	this.fireEvent("expand", this);
    },
    syncPopup:function(){
    	var sl = document[Ext.isStrict?'documentElement':'body'].scrollLeft,
    		st = document[Ext.isStrict?'documentElement':'body'].scrollTop,
    		xy = this.wrap.getXY(),
    		_x = xy[0] - sl,
    		_y = xy[1] - st,
			W=this.popup.getWidth(),H=this.popup.getHeight(),
			PH=this.wrap.getHeight(),PW=this.wrap.getWidth(),
			BH=$A.getViewportHeight()-3,BW=$A.getViewportWidth()-3,
			x=((_x+W)>BW?((BW-W)<0?_x:(BW-W)):_x)+sl;
			y=((_y+PH+H)>BH?((_y-H)<0?(_y+PH):(_y-H)):(_y+PH))+st;
    	this.popup.moveTo(x,y);
    	this.shadow.moveTo(x+3,y+3);
    },
    onTriggerClick : function(){
    	if(this.readonly) return;
    	if(this.isExpanded()){
    		this.collapse();
    	}else{
    		this.expand();
	    	this.el.focus();
    	}
    }
});
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
				if(raw != this.value){
					if(this.fetchrecord===false){
						this.setValue(raw)
					}else{
						var record = this.getRecordByDisplay(raw);
						this.setValue(record && this.getRenderText(record)||'');
					}
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
		!this.isExpanded() && $A.ComboBox.superclass.expand.call(this);
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
			this.processDataSet('un');
			this.optionDataSet = ds;
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
            ds[ou]('query', loadFn, this);
           	ds[ou]('add', loadFn, this);
            ds[ou]('update', loadFn, this);
            ds[ou]('remove', loadFn, this);
            ds[ou]('clear', loadFn, this);
            ds[ou]('reject', loadFn, this);
		}
	},	
	onDataSetLoad: function(){
		this.rendered=false;
		if(this.isExpanded()){
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
		var sf = this,value=null,display='',record=null;
		if(sf.blankoption){
			index--;	
		}
		if(index!=-1){
			record = sf.optionDataSet.getAt(index);
			value = record.get(sf.valuefield);
			display = sf.getRenderText(record);//record.get(this.displayfield);
		}
		sf.setValue(display,null,record);
		sf.fireEvent('select',sf, value, display, record);
        
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
			var sb = [],n=0;
			if(this.blankoption){
				sb.push('<li tabIndex="0"></li>');
				n=1;
			}
			Ext.each(ds.getAll(),function(d,i){
//				var d = Ext.apply(datas[i].data, {index:i})
//				var rder = $A.getRenderer(this.renderer);
//				var text = this.getRenderText(datas[i]);
				sb.push('<li tabIndex="',i+n,'">',this.getRenderText(d),'</li>');
			},this);
//			if(sb.length){
				v.update(sb.join(''));			
//			}
		}
	},
	getRenderText : function(record){
        var rder = $A.getRenderer(this.displayrenderer);
        if(rder){
            return rder(this,record);
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
        if(r && !silent){
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
//    						if(silent){
//                                r.data[map.to] = vl;
//    						}else{
    						    r.set(map.to,vl);						
//    						}
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
/**
 * @class Aurora.DateField
 * @extends Aurora.Component
 * <p>日期组件.
 * @author huazhen.wu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.DateField = Ext.extend($A.Component, {
	bodyTpl:['<TABLE cellspacing="0">',
				'<CAPTION class="item-dateField-caption">',
					'{preYearBtn}',
					'{nextYearBtn}',
					'{preMonthBtn}',
					'{nextMonthBtn}',
					'<SPAN>',
						'<SPAN atype="item-year-span" style="margin-right:5px;cursor:pointer"></SPAN>',
						'<SPAN atype="item-month-span" style="cursor:pointer"></SPAN>',
					'</SPAN>',
				'</CAPTION>',
				'<THEAD class="item-dateField-head">',
					'<TR>',
						'<TD>{sun}</TD>',
						'<TD>{mon}</TD>',
						'<TD>{tues}</TD>',
						'<TD>{wed}</TD>',
						'<TD>{thur}</TD>',
						'<TD>{fri}</TD>',
						'<TD>{sat}</TD>',
					'</TR>',
				'</THEAD>',
				'<TBODY>',
				'</TBODY>',
			'</TABLE>'],
	preMonthTpl:'<DIV class="item-dateField-pre" title="{preMonth}" onclick="$(\'{id}\').preMonth()"></DIV>',
	nextMonthTpl:'<DIV class="item-dateField-next" title="{nextMonth}" onclick="$(\'{id}\').nextMonth()"></DIV>',
	preYearTpl:'<DIV class="item-dateField-preYear" title="{preYear}" onclick="$(\'{id}\').preYear()"></DIV>',
	nextYearTpl:'<DIV class="item-dateField-nextYear" title="{nextYear}" onclick="$(\'{id}\').nextYear()"></DIV>',
	popupTpl:'<DIV class="item-popup" atype="date-popup" style="vertical-align: middle;background-color:#fff;visibility:hidden"></DIV>',
    initComponent : function(config){
    	$A.DateField.superclass.initComponent.call(this, config);
    	if(this.height)this.rowHeight=(this.height-18*(Ext.isIE?3:2))/6;
    	var data = {sun:_lang['datefield.sun'],mon:_lang['datefield.mon'],tues:_lang['datefield.tues'],wed:_lang['datefield.wed'],thur:_lang['datefield.thur'],fri:_lang['datefield.fri'],sat:_lang['datefield.sat']}
        if(this.enableyearbtn=="both"||this.enableyearbtn=="pre")
        	data.preYearBtn = new Ext.Template(this.preYearTpl).apply({preYear:_lang['datefield.preYear'],id:this.id});
    	if(this.enableyearbtn=="both"||this.enableyearbtn=="next")
    		data.nextYearBtn = new Ext.Template(this.nextYearTpl).apply({nextYear:_lang['datefield.nextYear'],id:this.id});
        if(this.enablemonthbtn=="both"||this.enablemonthbtn=="pre")
    		data.preMonthBtn = new Ext.Template(this.preMonthTpl).apply({preMonth:_lang['datefield.preMonth'],id:this.id});
    	if(this.enablemonthbtn=="both"||this.enablemonthbtn=="next")
    		data.nextMonthBtn = new Ext.Template(this.nextMonthTpl).apply({nextMonth:_lang['datefield.nextMonth'],id:this.id});
        this.body = new Ext.Template(this.bodyTpl).append(this.wrap.dom,data,true);
        this.yearSpan = this.body.child("span[atype=item-year-span]");
        this.monthSpan = this.body.child("span[atype=item-month-span]");
        this.popup = new Ext.Template(this.popupTpl).append(this.body.child('caption').dom,{},true);
        //this.popup = new Ext.Template(this.popupTpl).append(this.wrap.dom,true);
    },
    processListener: function(ou){
    	$A.DateField.superclass.processListener.call(this,ou);
    	this.body[ou]('mousewheel',this.onMouseWheel,this);	
    	this.body[ou]("mouseover", this.onMouseOver, this);
    	this.body[ou]("mouseout", this.onMouseOut, this);
    	this.body[ou]("click",this.onSelect,this);
    	this.yearSpan[ou]("click",this.onViewShow,this);
    	this.monthSpan[ou]("click",this.onViewShow,this);
    	//this.body[ou]("keydown",this.onKeyDown,this);
    },
    initEvents : function(){
    	$A.DateField.superclass.initEvents.call(this);   	
    	this.addEvents(
    	/**
         * @event select
         * 选择事件.
         * @param {Aurora.DateField} dateField 日期组件.
         * @param {Date} date 选择的日期.
         */
    	'select',
    	/**
         * @event draw
         * 绘制事件.
         * @param {Aurora.DateField} dateField 日期组件.
         */
    	'draw');
    },
    destroy : function(){
    	$A.DateField.superclass.destroy.call(this);
		delete this.preMonthBtn;
    	delete this.nextMonthBtn;
    	delete this.body;
	},
	onMouseWheel:function(e){
        this[(e.getWheelDelta()>0?'pre':'next')+(e.ctrlKey?'Year':'Month')]();
        e.stopEvent();
	},
    onMouseOver: function(e,t){
    	this.out();
    	if(((t = Ext.fly(t)).hasClass('item-day')||(t = t.parent('.item-day'))) && t.getAttributeNS("",'_date') != '0'){
    		$A.DateField.superclass.onMouseOver.call(this,e);
			this.over(t);
    	}
    },
    onMouseOut: function(e){
    	$A.DateField.superclass.onMouseOut.call(this,e);
    	this.out();
    },
    over : function(t){
    	t = t||this.body.last().child('td.item-day')
    	this.overTd = t; 
		t.addClass('dateover');
    },
    out : function(){
    	if(this.overTd) {
    		this.overTd.removeClass('dateover');
    		this.overTd=null;
    	}
    },
    onSelect:function(e,t){
    	var sf = this,td = Ext.get(t),_date;
    	if(td.parent('div[atype="date-popup"]')){
    		sf.onViewClick(e,td);
    	}else{
    		_date =  td.getAttributeNS('','_date');
			if(_date && _date != '0'){
		    	sf.fireEvent("select",e,t,sf, new Date(Number(_date)));
			}
    	}
    },
	onSelectDay: function(o){
		if(!o.hasClass('onSelect'))o.addClass('onSelect');
	},
	onViewShow : function(e,t){
		var span = Ext.get(t);
		this.focusSpan = span;
		var head = this.body.child('thead'),xy = head.getXY();
		this.popup.moveTo(xy[0],xy[1]);
		this.popup.setWidth(head.getWidth());
		this.popup.setHeight(head.getHeight()+head.next().getHeight());
		if(span.getAttributeNS("","atype")=="item-year-span")
			this.initView(this.year,100,true);
		else
			this.initView(7,60);
		Ext.get(document.documentElement).on("mousedown", this.viewBlur, this);
		this.popup.show();
	},
	onViewHide : function(){
		Ext.get(document.documentElement).un("mousedown", this.viewBlur, this);
		this.popup.hide();
	},
	viewBlur : function(e,t){
		if(!this.popup.contains(t) && !(this.focusSpan.contains(t)||this.focusSpan.dom==t)){    		
    		this.onViewHide();
        }
	},
	onViewClick : function(e,t){
		if(t.hasClass('item-day')){
			if(this.focusSpan.getAttributeNS("","atype")=="item-year-span")
				this.year = t.getAttributeNS("",'_data');
			else
				this.month = t.getAttributeNS("",'_data');
			this.year -- ;
			this.nextYear();
			this.onViewHide();
		}
	},
    /**
     * 当前月
     */
	nowMonth: function() {
		this.predraw(new Date());
	},
	/**
	 * 上一月
	 */
	preMonth: function() {
		this.predraw(new Date(this.year, this.month - 2, 1,this.hours,this.minutes,this.seconds));
	},
	/**
	 * 下一月
	 */
	nextMonth: function() {
		this.predraw(new Date(this.year, this.month, 1,this.hours,this.minutes,this.seconds));
	},
	/**
	 * 上一年
	 */
	preYear: function() {
		this.predraw(new Date(this.year - 1, this.month - 1, 1,this.hours,this.minutes,this.seconds));
	},
	/**
	 * 下一年
	 */
	nextYear: function() {
		this.predraw(new Date(this.year + 1, this.month - 1, 1,this.hours,this.minutes,this.seconds));
	},
  	/**
  	 * 根据日期画日历
  	 * @param {Date} date 当前日期
  	 */
  	predraw: function(date,notFire) {
  		if(!date || !date instanceof Date)date = new Date();
  		this.date=date;
  		this.hours=date.getHours();this.minutes=date.getMinutes();this.seconds=date.getSeconds();
		this.year = date.getFullYear(); this.month = date.getMonth() + 1;
		this.draw(new Date(this.year,this.month-1,1,this.hours,this.minutes,this.seconds));
		if(!notFire)this.fireEvent("draw",this);
  	},
  	/**
  	 * 渲染日历
  	 */
	draw: function(date) {
		//用来保存日期列表
		var arr = [],year=date.getFullYear(),month=date.getMonth()+1,hour=date.getHours(),minute=date.getMinutes(),second=date.getSeconds();
		this.yearSpan.update(year+_lang['datefield.year']);
		this.monthSpan.update(month+_lang['datefield.month']);
		//用当月第一天在一周中的日期值作为当月离第一天的天数,用上个月的最后天数补齐
		for(var i = 1, firstDay = new Date(year, month - 1, 1).getDay(),lastDay = new Date(year, month - 1, 0).getDate(); i <= firstDay; i++){ 
			arr.push((this.enablebesidedays=="both"||this.enablebesidedays=="pre")?new Date(year, month - 2, lastDay-firstDay+i,hour,minute,second):null);
		}
		//用当月最后一天在一个月中的日期值作为当月的天数
		for(var i = 1, monthDay = new Date(year, month, 0).getDate(); i <= monthDay; i++){ 
			arr.push(new Date(year, month - 1, i,hour,minute,second)); 
		}
		//用下个月的前几天补齐6行
		for(var i=1, monthDay = new Date(year, month, 0).getDay(),besideDays=43-arr.length;i<besideDays;i++){
			arr.push((this.enablebesidedays=="both"||this.enablebesidedays=="next")?new Date(year, month, i,hour,minute,second):null);
		}
		//先清空内容再插入(ie的table不能用innerHTML)
		var body = this.body.dom.tBodies[0];
		while(body.firstChild){
			Ext.fly(body.firstChild).remove();
		}
		//插入日期
		var k=0;
		while(arr.length){
			//每个星期插入一个tr
			var row = Ext.get(body.insertRow(-1));
			row.set({'r_index':k});
			if(k%2==0)row.addClass('week-alt');
			if(this.rowHeight)row.setHeight(this.rowHeight);
			k++;
			//每个星期有7天
			for(var i = 1; i <= 7; i++){
				var d = arr.shift();
				if(Ext.isDefined(d)){
					var cell = Ext.get(row.dom.insertCell(-1)); 
					if(d){
						cell.set({'c_index':i-1});
						cell.addClass(date.getMonth()==d.getMonth()?"item-day":"item-day item-day-besides");
						cell.update(this.renderCell(cell,d,d.getDate(),month)||d.getDate());
						if(cell.disabled){
							cell.set({'_date':'0'});
							cell.addClass("item-day-disabled");
						}else {
							cell.set({'_date':(''+d.getTime())});
							if(this.format)cell.set({'title':d.format(this.format)})
						}
						//判断是否今日
						if(this.isSame(d, new Date())) cell.addClass("onToday");
						//判断是否选择日期
						if(this.selectDay && this.isSame(d, this.selectDay))this.onSelectDay(cell);
					}else cell.update('&#160;');
				}
			}
		}
	},
	renderCell:function(cell,date,day,currentMonth){
		if(this.dayrenderer)
			return $A.getRenderer(this.dayrenderer).call(this,cell,date,day,currentMonth);
	},
	/**
	 * 判断是否同一日
	 * @param {Date} d1 日期1
	 * @param {Date} d2 日期2
	 * @return {Boolean} 是否同一天
	 */
	isSame: function(d1, d2) {
		if(!d2.getFullYear||!d1.getFullYear)return false;
		return (d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate());
	},
	initView : function(num,width,isYear){
		var html = ["<table cellspacing='0' cellpadding='0' width='100%'><tr><td width='45%'></td><td width='10%'></td><td width='45%'></td></tr>"];
		for(var i=0,rows = (isYear?5:6),year = num - rows,year2 = num;i<rows;i++){
			html.push("<tr><td class='item-day' _data='"+year+"'>"+year+"</td><td></td><td class='item-day' _data='"+year2+"'>"+year2+"</td></tr>");
			year += 1;year2 += 1;
		}
		html.push("");
		if(isYear){
			html.push("<tr><td><div class='item-dateField-pre' onclick='$(\""+this.id+"\").initView("+(num-10)+","+width+",true)'></div></td>");
			html.push("<td><div class='item-dateField-close' onclick='$(\""+this.id+"\").onViewHide()'></div></td>")
			html.push("<td><div class='item-dateField-next' onclick='$(\""+this.id+"\").initView("+(num+10)+","+width+",true)'></div></td></tr>");
		}else{
			html.push("<td colspan='3' align='center'><div class='item-dateField-close' onclick='$(\""+this.id+"\").onViewHide()'></div></td>")
		}
		html.push("</table>");
		this.popup.update(html.join(''));
	}
});
/**
 * @class Aurora.DatePicker
 * @extends Aurora.TriggerField
 * <p>DatePicker组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.DatePicker = Ext.extend($A.TriggerField,{
	nowTpl:['<DIV class="item-day" style="cursor:pointer" title="{title}">{now}</DIV>'],
	constructor: function(config) {
		this.dateFields = [];
		this.cmps = {};
        $A.DatePicker.superclass.constructor.call(this,config);
    },
	initComponent : function(config){
		$A.DatePicker.superclass.initComponent.call(this,config);
		this.initFormat();
		this.initDatePicker();
	},
	initFormat : function(){
		this.format=this.format||$A.defaultDateFormat;
	},
    initDatePicker : function(){
        if(!this.inited){
            this.initDateField();
            this.initFooter();
            this.inited = true;
//            this.processListener('un');
//            this.processListener('on');
        }
    },
    initDateField:function(){
    	this.popup.setStyle({'width':150*this.viewsize+'px'})
    	if(this.dateFields.length==0){
//    		window['__host']=this;
    		for(var i=0;i<this.viewsize;i++){
	    		var cfg = {
	    			id:this.id+'_df'+i,
	    			height:130,
	    			enablemonthbtn:'none',
	    			enablebesidedays:'none',
	    			dayrenderer:this.dayrenderer,
	    			listeners:{
//	    				"select":this.onSelect.createDelegate(this),
	    				"draw":this.onDraw.createDelegate(this),
	    				"mouseover":this.mouseOver.createDelegate(this),
	    				"mouseout":this.mouseOut.createDelegate(this)
	    			}
	    		}
		    	if(i==0){
		    		if(this.enablebesidedays=="both"||this.enablebesidedays=="pre")
		    			cfg.enablebesidedays="pre";
		    		if(this.enablemonthbtn=="both"||this.enablemonthbtn=="pre")
		    			cfg.enablemonthbtn="pre";
		    		if(this.enableyearbtn=="both"||this.enableyearbtn=="pre")
		    			cfg.enableyearbtn="pre";
		    	}
		    	if(i==this.viewsize-1){
		    		if(this.enablebesidedays=="both"||this.enablebesidedays=="next")
		    			cfg.enablebesidedays=cfg.enablebesidedays=="pre"?"both":"next";
		    		if(this.enablemonthbtn=="both"||this.enablemonthbtn=="next")
		    			cfg.enablemonthbtn=cfg.enablemonthbtn=="pre"?"both":"next";
		    		if(this.enableyearbtn=="both"||this.enableyearbtn=="next")
		    			cfg.enableyearbtn=cfg.enableyearbtn=="pre"?"both":"next";
		    	}else Ext.fly(this.id+'_df'+i).dom.style.cssText="border-right:1px solid #BABABA";
		    	this.dateFields.add(new $A.DateField(cfg));
    		}
//    		window['__host']=null;
    	}
    },
    initFooter : function(){
    	if(!this.now)this.now=new Ext.Template(this.nowTpl).append(this.popup.child("div.item-dateField-foot").dom,{now:_lang['datepicker.today'],title:new Date().format(this.format)},true);
    	var now = new Date(),
    		cell = this.now,
    		dr = this.dayrenderer;
    	dr && $A.getRenderer(dr).call(this,cell,now,now.getDate());
    	if(cell.disabled){
			cell.set({'_date':'0'});
			cell.addClass("item-day-disabled");
		}else {
			cell.set({"_date":new Date(now.getFullYear(),now.getMonth(),now.getDate(),0,0,0).getTime()});
		}
    },
    initEvents : function(){
    	$A.DatePicker.superclass.initEvents.call(this);
        this.addEvents(
        /**
         * @event select
         * 选择事件.
         * @param {Aurora.DatePicker} datePicker 日期选择组件.
         * @param {Date} date 选择的日期.
         */
        'select');
    },
    processListener : function(ou){
    	$A.DatePicker.superclass.processListener.call(this,ou);
    	this.el[ou]('click',this.mouseOut, this);
    	this.popup[ou]("click", this.onSelect, this);
    },
    mouseOver: function(cmp,e){
    	if(this.focusField)this.focusField.out();
    	this.focusField = cmp
    },
    mouseOut: function(){
    	if(this.focusField)this.focusField.out();
    	this.focusField = null;
    },
    onKeyUp: function(e){
    	if(this.readonly)return;
    	$A.DatePicker.superclass.onKeyUp.call(this,e);
    	var c = e.keyCode;
    	if(!e.isSpecialKey()||c==8||c==46){
	    	try{
	    		this.selectDay=this.getRawValue().parseDate(this.format);
                this.wrapDate(this.selectDay);
	    		$A.Component.prototype.setValue.call(this,this.selectDay||"");
	    		this.predraw(this.selectDay);
	    	}catch(e){
	    	}
    	}
    },
    onKeyDown: function(e){
    	if(this.readonly)return;
    	if(this.focusField){
	    	switch(e.keyCode){
	    		case 37:this.goLeft(e);break;
	    		case 38:this.goUp(e);break;
	    		case 39:this.goRight(e);break;
	    		case 40:this.goDown(e);break;
	    		case 13:this.onSelect(e,this.focusField.overTd);
	    		default:{
					if(this.focusField)this.focusField.out();
					this.focusField = null;
	    		}
	    	}
   		}else {
   			$A.DatePicker.superclass.onKeyDown.call(this,e);
   			if(e.keyCode == 40){
				this.focusField = this.dateFields[0];
				this.focusField.over();
   			}
   		}
    },
    goLeft : function(e){
    	var field = this.focusField;
		var td = field.overTd,prev = td.prev('.item-day');
		field.out();
    	if(prev) {
    		field.over(prev);
    	}else{
			var f = this.dateFields[this.dateFields.indexOf(field)-1],
			index = td.parent().getAttributeNS('','r_index')
			if(f){
				this.focusField = f;
			}else{
				field.preMonth();
				this.focusField = this.dateFields[this.dateFields.length-1];
			}
			var l = this.focusField.body.child('tr[r_index='+index+']').select('td.item-day')
			this.focusField.over(l.item(l.getCount()-1));
		}
		e.stopEvent();
    },
    goUp : function(e){
    	var field = this.focusField;
		var td = field.overTd,prev = td.parent().prev(),index = td.getAttributeNS('','c_index'),t;
		field.out();
		if(prev)t = prev.child('td[c_index='+index+']');
		if(t)field.over(t);
		else {
			var f = this.dateFields[this.dateFields.indexOf(field)-1];
			if(f){
				this.focusField = f;
			}else{
				field.preMonth();
				this.focusField = this.dateFields[0];
			}
			var l = this.focusField.body.select('td[c_index='+index+']')
			this.focusField.over(l.item(l.getCount()-1));
		}
    },
    goRight : function(e){
    	var field = this.focusField;
		var td = field.overTd,next = td.next('.item-day'),parent = td.parent();
		field.out();
    	if(next) {
    		field.over(next);
    	}else{
			var f = this.dateFields[this.dateFields.indexOf(field)+1];
			if(f){
				this.focusField = f;
			}else{
				field.nextMonth();
				this.focusField = this.dateFields[0];
			}
			this.focusField.over(this.focusField.body.child('tr[r_index='+parent.getAttributeNS('','r_index')+']').child('td.item-day'));
		}
		e.stopEvent();
    },
    goDown : function(e){
    	var field = this.focusField;
		var td = field.overTd,next = td.parent().next(),t,index = td.getAttributeNS('','c_index');
		field.out();
		if(next)t = next.child('td[c_index='+index+']');
		if(t)field.over(t);
		else {
			var f = this.dateFields[this.dateFields.indexOf(field)+1];
			if(f){
				this.focusField = f;
			}else{
				field.nextMonth();
				this.focusField = this.dateFields[this.dateFields.length-1];
			}
			this.focusField.over(this.focusField.body.child('td[c_index='+index+']'));
		}
    },
    onDraw : function(field){
    	if(this.dateFields.length>1)this.sysnDateField(field);
    	this.shadow.setWidth(this.popup.getWidth());
    	this.shadow.setHeight(this.popup.getHeight());
    },
    onSelect: function(e,t){
//    	if(((t =Ext.fly(t)).hasClass('item-day'))){
			var _date =  Ext.fly(t).getAttributeNS('','_date');
			if(_date && _date != '0'){
	    		var sf = this,date=new Date(Number(_date));
		    	sf.collapse();
	            sf.processDate(date);            
		    	sf.setValue(date);
		    	sf.fireEvent("select",sf, date);
			}
//    	}
    },
    wrapDate : function(d){},
    processDate : function(d){},
    onBlur : function(e){
    	if(this.hasFocus){
			$A.DatePicker.superclass.onBlur.call(this,e);
			if(!this.readonly && !this.isExpanded()){
				try{
	                var d = this.getRawValue().parseDate(this.format)
	                this.wrapDate(d);
					this.setValue(d||"");
				}catch(e){
	                //alert(e.message);
					this.setValue("");
				}
			}
    	}
    },
    formatValue : function(date){
    	if(date instanceof Date)return date.format(this.format);
    	return date;
    },
    expand : function(){
        this.selectDay = this.getValue();
		this.predraw(this.selectDay);
    	$A.DatePicker.superclass.expand.call(this);
    },
    collapse : function(){
    	$A.DatePicker.superclass.collapse.call(this);
    	this.focusField = null;
    },
    destroy : function(){
    	$A.DatePicker.superclass.destroy.call(this);
    	var sf = this;
        Ext.each(this.dateFields,function(cmp){
            try{
                  cmp.destroy();
              }catch(e){
                  alert('销毁datePicker出错: ' + e)
              };
        })
    	delete this.format;
    	delete this.viewsize;
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
	predraw : function(date){
		if(date && date instanceof Date){
			this.selectDay=new Date(date);
		}else {
			date=new Date();
			date.setHours(this.hour||0);
			date.setMinutes(this.minute||0);
			date.setSeconds(this.second||0);
			date.setMilliseconds(0);
		}
		this.draw(date);
	},
	draw: function(date){
		this.dateFields[0].selectDay=this.selectDay;
		this.dateFields[0].format=this.format;
		this.dateFields[0].predraw(date);
	},
	sysnDateField : function(field){
		var date=new Date(field.date);
		for(var i=0;i<this.viewsize;i++){
			if(field==this.dateFields[i])date.setMonth(date.getMonth()-i);
		}
		for(var i=0;i<this.viewsize;i++){
			this.dateFields[i].selectDay=this.selectDay;
			if(i!=0)date.setMonth(date.getMonth()+1);
			this.dateFields[i].format=this.format;
			if(field!=this.dateFields[i])
			this.dateFields[i].predraw(date,true);
		}
	}
});
/**
 * @class Aurora.DateTimePicker
 * @extends Aurora.DatePicker
 * <p>DatePicker组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.DateTimePicker = Ext.extend($A.DatePicker,{
	initFormat : function(){
		this.format=this.format||$A.defaultDateTimeFormat;
	},
	initFooter : function(){
		this.hourSpan = this.popup.child("input[atype=field.hour]");
    	this.minuteSpan = this.popup.child("input[atype=field.minute]");
    	this.secondSpan = this.popup.child("input[atype=field.second]");
    	this.hourSpanParent = this.hourSpan.parent();
    },
    processListener : function(ou){
    	$A.DateTimePicker.superclass.processListener.call(this,ou);
    	if(this.hourSpan){
	    	this.hourSpan[ou]("click", this.onDateClick, this,{stopPropagation:true});
	    	this.hourSpan[ou]("focus", this.onDateFocus, this);
			this.hourSpan[ou]("blur", this.onDateBlur, this);
			this.minuteSpan[ou]("focus", this.onDateFocus, this);
			this.minuteSpan[ou]("blur", this.onDateBlur, this);
	    	this.minuteSpan[ou]("click", this.onDateClick, this,{stopPropagation:true});
			this.secondSpan[ou]("focus", this.onDateFocus, this);
			this.secondSpan[ou]("blur", this.onDateBlur, this);
	    	this.secondSpan[ou]("click", this.onDateClick, this,{stopPropagation:true});
			this.hourSpanParent[ou]("keydown", this.onDateKeyDown, this);
			this.hourSpanParent[ou]("keyup", this.onDateKeyUp, this);
    	}
    },
    onDateKeyDown : function(e) {
		var c = e.keyCode, el = e.target;
		if (c == 13) {
			el.blur();
		} else if (c == 27) {
			el.value = el.oldValue || "";
			el.blur();
		} else if (c != 8 && c!=9 && c!=37 && c!=39 && c != 46 && (c < 48 || c > 57 || e.shiftKey)) {
			e.stopEvent();
			return;
		}
	},
	onDateKeyUp : function(e){
		var c = e.keyCode, el = e.target;
		if (c != 8 && c!=9 && c!=37 && c!=39 && c != 46 && (c < 48 || c > 57 || e.shiftKey)) {
			e.stopEvent();
			return;
		} else{
			if(this.value&&this.value instanceof Date){
				var date=new Date(this.value.getTime());
				this.processDate(date);
		    	this.setValue(date);
		    	//this.fireEvent('select',this, date);
			}
			this.draw(new Date(this.dateFields[0].year,this.dateFields[0].month - 1, 1,this.hourSpan.dom.value,this.minuteSpan.dom.value,this.secondSpan.dom.value));
		}
	},
	onDateClick : function(){},
    onDateFocus : function(e) {
		Ext.fly(e.target.parentNode).addClass("item-dateField-input-focus");
		e.target.select();
	},
	onDateBlur : function(e) {
		var el=e.target;
		Ext.fly(el.parentNode).removeClass("item-dateField-input-focus");
		if(!el.value.match(/^[0-9]*$/))el.value=el.oldValue||"";
	},
	predraw : function(date,noSelect){
		$A.DateTimePicker.superclass.predraw.call(this,date,noSelect);
		this.hourSpan.dom.oldValue = this.hourSpan.dom.value = $A.dateFormat.pad(this.dateFields[0].hours);
		this.minuteSpan.dom.oldValue = this.minuteSpan.dom.value = $A.dateFormat.pad(this.dateFields[0].minutes);
		this.secondSpan.dom.oldValue = this.secondSpan.dom.value = $A.dateFormat.pad(this.dateFields[0].seconds);
	},
    processDate : function(d){
        if(d){
            d.setHours((el=this.hourSpan.dom).value.match(/^[0-9]*$/)?el.value:el.oldValue);
            d.setMinutes((el=this.minuteSpan.dom).value.match(/^[0-9]*$/)?el.value:el.oldValue);
            d.setSeconds((el=this.secondSpan.dom).value.match(/^[0-9]*$/)?el.value:el.oldValue);
            this.wrapDate(d)
        }
    },
    wrapDate : function(d){
        if(d)
        d.xtype = 'timestamp';
    }
//    ,collapse : function(){
//    	$A.DateTimePicker.superclass.collapse.call(this);
//    	if(this.getRawValue()){
//    		var d = this.selectDay;
//    		if(d){
//	    		d.setHours((el=this.hourSpan.dom).value.match(/^[0-9]*$/)?el.value:el.oldValue);
//	    		d.setMinutes((el=this.minuteSpan.dom).value.match(/^[0-9]*$/)?el.value:el.oldValue);
//	    		d.setSeconds((el=this.secondSpan.dom).value.match(/^[0-9]*$/)?el.value:el.oldValue);
//    		}
//    		d.xtype = 'timestamp';
//    		this.setValue(d);
//    	}
//    }
});
$A.ToolBar = Ext.extend($A.Component,{
	constructor: function(config) {
        $A.ToolBar.superclass.constructor.call(this, config);        
    },
    initComponent : function(config){
    	$A.ToolBar.superclass.initComponent.call(this, config);    	
    },
    initEvents : function(){
    	$A.ToolBar.superclass.initEvents.call(this); 
    }
})
$A.NavBar = Ext.extend($A.ToolBar,{
	constructor: function(config) {
        $A.NavBar.superclass.constructor.call(this, config);        
    },
    initComponent : function(config){
    	$A.NavBar.superclass.initComponent.call(this, config);
    	this.dataSet = $(this.dataSet);
    	this.navInfo = this.wrap.child('div[atype=displayInfo]');//Ext.get(this.infoId);
    	if(this.type != "simple" && this.type != "tiny"){
	    	this.pageInput = $(this.inputId);
	    	this.currentPage = this.wrap.child('div[atype=currentPage]');
	    	this.pageInfo = this.wrap.child('div[atype=pageInfo]');//Ext.get(this.pageId);
	
	    	if(this.comboBoxId){
	    		this.pageSizeInput = $(this.comboBoxId);
	    		this.pageSizeInfo = this.wrap.child('div[atype=pageSizeInfo]');
	    		this.pageSizeInfo2 = this.wrap.child('div[atype=pageSizeInfo2]');
	    		this.pageSizeInfo.update(_lang['toolbar.pageSize']);
	    		this.pageSizeInfo2.update(_lang['toolbar.pageSize2']);
	    	}
	    	this.pageInfo.update(_lang['toolbar.total'] + '&#160;&#160;' + _lang['toolbar.page']);
	    	this.currentPage.update(_lang['toolbar.ctPage']);
    	}
    },
    processListener: function(ou){
    	$A.NavBar.superclass.processListener.call(this,ou);
    	this.dataSet[ou]('load', this.onLoad,this);
    	if(this.type != "simple" && this.type != "tiny"){
    		this.pageInput[ou]('change', this.onPageChange, this);
    		if(this.pageSizeInput){
    			this.pageSizeInput[ou]('change', this.onPageSizeChange, this);
    		}
    	}
    },
    initEvents : function(){
    	$A.NavBar.superclass.initEvents.call(this);    	
    },
    onLoad : function(){
    	var sf = this,ds = sf.dataSet,
    		pagesize = ds.pagesize,
    		input = sf.pageSizeInput;
    	sf.navInfo.update(sf.creatNavInfo());
    	if(sf.type != "simple" && sf.type != "tiny"){
	    	sf.pageInput.setValue(ds.currentPage,true);
	    	sf.pageInfo.update(_lang['toolbar.total'] + ds.totalPage + _lang['toolbar.page']);
	    	if(input&&!input.optionDataSet){
	    		if(ds.fetchall){
	    			pagesize = ds.totalCount;
	    			input.initReadOnly(true);
	    		}
	    		var pageSize=[10,20,50,100];
	    		if(pageSize.indexOf(pagesize)==-1){
	    			pageSize.unshift(pagesize);
	    			pageSize.sort(function(a,b){return a-b});
	    		}
	    		var datas=[];
	    		while(Ext.isDefined(pageSize[0])){
	    			var ps=pageSize.shift();
	    			datas.push({'code':ps,'name':ps});
	    		}
	    		var dataset=new $A.DataSet({'datas':datas});
	    		input.valuefield = 'code';
	    		input.displayfield = 'name';
		    	input.setOptions(dataset);
		    	input.setValue(pagesize,true);
	    	}
    	}
    },
    creatNavInfo : function(){
    	var sf = this,
    		ds = sf.dataSet,
    		currentPage = ds.currentPage,
    		totalPage = ds.totalPage,
    		totalCount = ds.totalCount,
    		pagesize = ds.pagesize;
    	if(ds.fetchall) pagesize = totalCount;
    	if(sf.type == "simple"){
    		var html=[];
    		if(totalPage){
    			html.push('<span>共'+totalPage+'页</span>');
    			html.push(currentPage == 1 ? '<span>'+_lang['toolbar.firstPage']+'</span>' : sf.createAnchor(_lang['toolbar.firstPage'],1));
    			html.push(currentPage == 1 ? '<span>'+_lang['toolbar.prePage']+'</span>' : sf.createAnchor(_lang['toolbar.prePage'],currentPage-1));
    			for(var i = 1 ; i < 4 && i <= totalPage ; i++){
    				html.push(i == currentPage ? '<b>' + currentPage + '</b>' : sf.createAnchor(i,i));
    			}
    			if(totalPage > sf.maxPageCount){
    				if(currentPage > 5)sf.createSplit(html);
    				for(var i = currentPage - 1;i < currentPage + 2 ;i++){
    					if(i > 3 && i < totalPage - 2){
    						html.push(i == currentPage ? '<b>' + currentPage + '</b>' : this.createAnchor(i,i));
    					}
    				}
    				if(currentPage < totalPage - 4)this.createSplit(html);
    			}else if(totalPage > 6){
    				for(var i = 4; i < totalPage - 2 ;i++){
    					html.push(i == currentPage ? '<b>' + currentPage + '</b>' : this.createAnchor(i,i));
    				}
    			}
	    		for(var i = totalPage - 2 ; i < totalPage + 1; i++){
	    			if(i > 3){
    					html.push(i == currentPage ? '<b>' + currentPage + '</b>' : this.createAnchor(i,i));
	    			}
    			}
	    		html.push(currentPage == totalPage ? '<span>'+_lang['toolbar.nextPage']+'</span>' : this.createAnchor(_lang['toolbar.nextPage'],currentPage+1));
    			html.push(currentPage == totalPage ? '<span>'+_lang['toolbar.lastPage']+'</span>' : this.createAnchor(_lang['toolbar.lastPage'],totalPage));
    		}
    		return html.join('');
    	}else if(sf.type == 'tiny'){
    		var html=[];
    		html.push(currentPage == 1 ? '<span>'+_lang['toolbar.firstPage']+'</span>' : this.createAnchor(_lang['toolbar.firstPage'],1));
			html.push(currentPage == 1 ? '<span>'+_lang['toolbar.prePage']+'</span>' : this.createAnchor(_lang['toolbar.prePage'],currentPage-1));
    		html.push(currentPage == totalPage ? '<span>'+_lang['toolbar.nextPage']+'</span>' :sf.createAnchor(_lang['toolbar.nextPage'],currentPage+1));
    		html.push('<span>第'+currentPage+'页</span>');
    		return html.join('');
    	}else{
	    	var from = ((currentPage-1)*pagesize+1),
	    		to = currentPage*pagesize,
	    		theme = $A.getTheme();
	    	if(to>totalCount && totalCount > from) to = totalCount;
	    	if(to==0) from =0;
            if(theme == 'mac')
                return _lang['toolbar.visible'] + ' ' + from + ' - ' + to ;                
            else 
                return _lang['toolbar.visible'] + ' ' +  from + ' - ' + to + ' '+ _lang['toolbar.total'] + totalCount + _lang['toolbar.item'];
    	}
    },
    createAnchor : function(text,page){
    	return '<a href="javascript:$(\''+this.dataSet.id+'\').goPage('+page+')">'+text+'</a>';
    },
    createSplit : function(html){
    	html.push('<span>···</span>');
    },
    onPageChange : function(el,value,oldvalue){
    	var ds = this.dataSet;
        if(isNaN(value) || value<=0 ||value>ds.totalPage){
            el.setValue(oldvalue,true);
        }else{
            ds.goPage(value);
        }
    },
    
//    onPageChange : function(el,value,oldvalue){
//    	if(this.dataSet.totalPage == 0){
//    		el.setValue(1);
//    	}else if(isNaN(value) || value<=0 || value>this.dataSet.totalPage){
//    		el.setValue(oldvalue)
//    	}else if(this.dataSet.currentPage!=value){
//	    	this.dataSet.goPage(value);
//    	}
//    },
    onPageSizeChange : function(el,value,oldvalue){
    	var max = this.dataSet.maxpagesize;
    	if(isNaN(value) || value<0){
    		el.setValue(oldvalue,true);
    	}else if(value > max){
			$A.showMessage(_lang['toolbar.errormsg'],_lang['toolbar.maxPageSize']+max+_lang['toolbar.item'],null,240);
			el.setValue(oldvalue,true);
		}else{
	    	this.dataSet.pagesize=Math.round(value);
	    	this.dataSet.query();
    	}
    }
})
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
            var style = document.documentElement.style;
            sf.overFlow = style.overflow;
            style.overflow = "hidden";
            sf.width=$A.getViewportWidth();
            sf.height=$A.getViewportHeight()-26;
            sf.draggable = false;
            sf.marginheight=1;
            sf.marginwidth=1;
        }
        var urlAtt = '';
        if(sf.url){
            urlAtt = 'url="'+sf.url+'"';
        }
        sf.wrap = windowTpl.insertFirst(document.body, {id:sf.id,title:sf.title,width:sf.width,bodywidth:sf.width-2,height:sf.height,url:urlAtt,clz:(sf.fullScreen ? 'full-window ' : '')+sf.className||''}, true);
        sf.wrap.cmps = sf.cmps;
        sf.shadow = shadowTpl.insertFirst(document.body, {}, true);
        sf.shadow.setWidth(sf.wrap.getWidth());
        sf.shadow.setHeight(sf.wrap.getHeight());
        sf.title = sf.wrap.child('div[atype=window.title]');
        sf.head = sf.wrap.child('td[atype=window.head]');
        sf.body = sf.wrap.child('div[atype=window.body]');
        sf.closeBtn = sf.wrap.child('div[atype=window.close]');
        if(sf.draggable) sf.initDraggable();
        if(!sf.closeable)sf.closeBtn.hide();
        if(Ext.isEmpty(config.x)||Ext.isEmpty(config.y)||sf.fullScreen){
            sf.center();
        }else{
            sf.move(config.x,config.y);
            this.toFront();
            this.focus.defer(10,this);
        }
        if(sf.url){
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
        this.wrap[ou]("click", this.onClick, this,{stopPropagation:true});
        this.wrap[ou]("keydown", this.onKeyDown,  this);
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
    onClick : function(e){
    	if(!this.modal)this.toFront();
    },
    onKeyDown : function(e){
        var key = e.getKey();
        if(key == 9){
            var fk,lk,ck,cmp
            for(var k in this.cmps){
                cmp = this.cmps[k];
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
                fk && this.cmps[fk].focus();
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
        var screenWidth = $A.getViewportWidth();
        var screenHeight = $A.getViewportHeight();
        var sl = document[Ext.isStrict?'documentElement':'body'].scrollLeft;
        var st = document[Ext.isStrict?'documentElement':'body'].scrollTop;
        var x = sl+Math.max((screenWidth - this.width)/2,0);
        var y = st+Math.max((screenHeight - this.height-(Ext.isIE?26:23))/2,0);
//        this.shadow.setWidth(this.wrap.getWidth());
//        this.shadow.setHeight(this.wrap.getHeight());
        if(this.fullScreen){
            x=sl;y=st;
            this.move(x,y,true);
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
        return ['<DIV class="win-shadow item-shadow"></DIV>']
    },
    getTemplate : function() {
        return [
            '<TABLE id="{id}" class="win-wrap {clz}" style="left:-10000px;top:-10000px;width:{width}px;outline:none" cellSpacing="0" cellPadding="0" hideFocus tabIndex="-1" border="0" {url}>',
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
        
        //去除下面window遮盖的透明度
        var alls = $A.WindowManager.getAll()
        for(var i=0;i<alls.length;i++){
            var pw = alls[i];
            if(pw != this){
                var cover = $A.Cover.container[pw.wrap.id];
                if(cover)cover.setStyle({
                    filter: 'alpha(opacity=0)',
                    opacity: '0',
                    mozopacity: '0'
                })
            }
        }
        
        
//      $A.focusWindow = this;      
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
//        sf.focus();
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
            $A.showConfirm(_lang['dataset.info'], r, function(){
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
            $A.WindowManager.remove(this);
            if(this.fullScreen){
                Ext.fly(document.documentElement).setStyle({'overflow':this.overFlow})
            }
            this.destroy();
            this.fireEvent('close', this);
        }
        
        //去除下面window遮盖的透明度
        var alls = $A.WindowManager.getAll()
        for(var i=0;i<alls.length-1;i++){
            var pw = alls[i];
            if(pw != this){
                var cover = $A.Cover.container[pw.wrap.id];
                if(cover)cover.setStyle({
                    filter: 'alpha(opacity=0)',
                    opacity: '0',
                    mozopacity: '0'
                })
            }
        }
        
        
        var cw = alls[alls.length-1];
        if(cw){
            var cover = $A.Cover.container[cw.wrap.id];
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
//      $A.focusWindow = null;
        var wrap = this.wrap;
        if(!wrap)return;
        if(this.proxy) this.proxy.remove();
        if(this.modal) $A.Cover.uncover(this.wrap);
        $A.Window.superclass.destroy.call(this);
        this.clearBody();
        delete this.title;
        delete this.head;
        delete this.body;
        delete this.closeBtn;
        delete this.proxy;
        wrap.remove();
        this.shadow.remove();
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
//      var cmps = $A.CmpManager.getAll();
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
        w=$A.getViewportWidth();
        $A.Window.superclass.setWidth.call(this,w);
        this.body.setWidth(w-2);
        this.shadow.setWidth(this.wrap.getWidth());
    },
    setHeight : function(h){
        h=$A.getViewportHeight()-26;
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
                if(res.error.code  && res.error.code == 'session_expired' || res.error.code == 'login_required'){
                    if($A.manager.fireEvent('timeout', $A.manager))
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
//          var cmps = $A.CmpManager.getAll();
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
    var msg = '<div class="win-icon '+css+'"><div class="win-type" style="width:'+(width-70)+'px;height:'+(height-62)+'px;">'+msg+'</div></div>';
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
    var msg = '<div class="win-icon win-question"><div class="win-type" style="width:'+(width-70)+'px;height:'+(height-62)+'px;">'+msg+'</div></div>';
    return $A.showOkCancelWindow(title, msg, okfun,cancelfun, width, height);   
}
//$A.hideWindow = function(){
//  var cmp = $A.CmpManager.get('aurora-msg')
//  if(cmp) cmp.close();
//}
//$A.showWindow = function(title, msg, width, height, cls){
//  cls = cls ||'';
//  var cmp = $A.CmpManager.get('aurora-msg')
//  if(cmp == null) {
//      cmp = new $A.Window({id:'aurora-msg',title:title, height:height,width:width});
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
$A.showOkCancelWindow = function(title, msg, okfun,cancelfun,width, height){
    //var cmp = $A.CmpManager.get('aurora-msg-ok-cancel')
    //if(cmp == null) {
        var id = Ext.id(),okid = 'aurora-msg-ok'+id,cancelid = 'aurora-msg-cancel'+id,
        okbtnhtml = $A.Button.getTemplate(okid,_lang['window.button.ok']),
        cancelbtnhtml = $A.Button.getTemplate(cancelid,_lang['window.button.cancel']),
        cmp = new $A.Window({id:'aurora-msg-ok-cancel'+id,closeable:true,title:title, height:height||100,width:width||300});
        if(!Ext.isEmpty(msg,true)){
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
$A.showYesNoCancelWindow = function(title, msg, yesfun,nofun,width, height){
    //var cmp = $A.CmpManager.get('aurora-msg-ok-cancel')
    //if(cmp == null) {
        var id = Ext.id(),
        	yesid = 'aurora-msg-yes'+id,
        	noid = 'aurora-msg-no'+id,
        	cancelid = 'aurora-msg-cancel'+id,
	        yesbtnhtml = $A.Button.getTemplate(yesid,_lang['window.button.yes']),
	        nobtnhtml = $A.Button.getTemplate(noid,_lang['window.button.no']),
	        cancelbtnhtml = $A.Button.getTemplate(cancelid,_lang['window.button.cancel']),
        	cmp = new $A.Window({id:'aurora-msg-yes-no-cancel'+id,closeable:true,title:title, height:height||100,width:width||300});
        if(!Ext.isEmpty(msg,true)){
            cmp.body.update(msg+ '<center><table cellspacing="5"><tr><td>'+yesbtnhtml+'</td><td>'+nobtnhtml+'</td><td>'+cancelbtnhtml+'</td><tr></table></center>',true,function(){
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
$A.showOkWindow = function(title, msg, width, height,callback){
    //var cmp = $A.CmpManager.get('aurora-msg-ok');
    //if(cmp == null) {
        var id = Ext.id(),yesid = 'aurora-msg-yes'+id,
        btnhtml = $A.Button.getTemplate(yesid,_lang['window.button.ok']),
        cmp = new $A.Window({id:'aurora-msg-ok'+id,closeable:true,title:title, height:height,width:width});
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
$A.showUploadWindow = function(path,title,source_type,pkvalue,max_size,file_type,callback){
    new Aurora.Window({id:'upload_window', url:path+'/upload.screen?callback='+callback+'&pkvalue='+pkvalue+'&source_type='+source_type+'&max_size='+(max_size||0)+'&file_type='+(file_type||'*.*'), title:title||_lang['window.upload.title'], height:330,width:595});
};
(function(A){
var _N = '',
	TR$TABINDEX = 'tr[tabindex]',
	WIDTH = 'width',
	PX = 'px',
	SELECTED_CLS = 'autocomplete-selected',
	EVT_CLICK = 'click',
	EVT_MOUSE_MOVE = 'mousemove',
	EVT_BEFORE_COMMIT = 'beforecommit',
	EVT_COMMIT = 'commit',
	EVT_BEFORE_TRIGGER_CLICK = 'beforetriggerclick',
	EVT_FETCHING = 'fetching',
	EVT_FETCHED = 'fetched';

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
        sf.trigger[ou]('mousedown',sf.onWrapFocus,sf, {preventDefault:true})
        	[ou](EVT_CLICK,sf.onTriggerClick, sf, {preventDefault:true});
    },
    initEvents : function(){
        A.Lov.superclass.initEvents.call(this);
        this.addEvents(
        /**
         * @event beforecommit
         * commit之前事件.
         * @param {Aurora.Lov} lov 当前Lov组件.
         * @param {Aurora.Record} r1 当前lov绑定的Record
         * @param {Aurora.Record} r2 选中的Record. 
         */
        EVT_BEFORE_COMMIT,
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
        EVT_BEFORE_TRIGGER_CLICK,
        /**
         * @event fetching
         * 正在获取记录的事件
         * @param {Aurora.Lov} lov 当前Lov组件.
         */
        EVT_FETCHING,
        /**
         * @event fetched
         * 获得记录的事件
         * @param {Aurora.Lov} lov 当前Lov组件.
         */
        EVT_FETCHED);
    },
    onWrapFocus : function(e,t){
    	var sf = this;
    	e.stopEvent();
		sf.focus.defer(Ext.isIE?1:0,sf);
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
//        this.el.setStyle(WIDTH,(w-20)+PX);
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
			sf.setValue('');
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
        if(sf.fireEvent(EVT_BEFORE_COMMIT, sf, record, r)!==false){
	        if(sf.win) sf.win.close();
//        	sf.setRawValue(_N)
	        
	        if(record && r){
	        	Ext.each(mapping || sf.getMapping(),function(map){
	        		var from = r.get(map.from);
	                record.set(map.to,Ext.isEmpty(from)?_N:from);
	        	});
	        }
//        	else{
//          	sf.setValue()
//        	}
	        
	        sf.fireEvent(EVT_COMMIT, sf, record, r)
        }
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
        if(!Ext.isEmpty(v)&&sf.fuzzyfetch){
        	v+='%';
        }
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
        $A.Masker.mask(sf.wrap,_lang['lov.query']);
//        sf.setRawValue(_lang['lov.query'])
        sf.fireEvent(EVT_FETCHING,sf);
        sf.qtId = A.request({url:url, para:p, success:function(res){
            var r = new A.Record({});
            if(res.result.record){
                var datas = [].concat(res.result.record),l = datas.length;
                if(l>0){
                	if(sf.fetchsingle && l>1){
                		var sb = sf.createListView(datas,binder).join(_N),
							div = new Ext.Template('<div style="position:absolute;left:0;top:0">{sb}</div>').append(document.body,{'sb':sb},true),
                			xy = sf.wrap.getXY(),
                			cmp = sf.fetchSingleWindow =  new A.Window({id:sf.id+'_fetchmulti',closeable:true,title:'请选择', height:Math.min(div.getHeight(),sf.maxHeight),width:Math.max(div.getWidth(),200),x:xy[0],y:xy[1]+sf.wrap.getHeight()});
                		div.remove();
                		cmp.on('close',function(){
                			sf.focus();
                		});
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
            $A.Masker.unmask(sf.wrap);
//            sf.setRawValue(_N);
            sf.commit(r,record,mapping);
            record.isReady=true;
            sidebar.enable = A.slideBarEnable;
            sf.fireEvent(EVT_FETCHED,sf);
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
    	var sf = this;
        sf.fetching = false;
        A.SideBar.enable = A.slideBarEnable;
        sf.fireEvent(EVT_FETCHED,sf);
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
/**
 * @class Aurora.MultiLov
 * @extends Aurora.Lov
 * <p>MultiLov 值列表组件.
 * @author huazhen.wu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.MultiLov = Ext.extend($A.Lov,{
    constructor: function(config) {
    	this.quote="'";
    	this.localvalues=[];
        $A.MultiLov.superclass.constructor.call(this, config);        
    },
    processListener : function(ou){
        $A.MultiLov.superclass.processListener.call(this,ou);
        this.el[ou]('click',this.onClick, this)
    },
    initEvents : function(){
        $A.MultiLov.superclass.initEvents.call(this);
        /**
         * @event commit
         * commit事件.
         * @param {Aurora.Lov} lov 当前Lov组件.
         * @param {Aurora.Record} r 当前lov绑定的Record
         * @param {Aurora.Record} rs 选中的Record集合. 
         */
    },
    onChange : function(e){},
    onClick : function(e){
        var pos = this.getCursortPosition();
        var value = this.getRawValue();
        var strs = value.split(';')
        var start = 0;
        for(var i=0;i<strs.length;i++){
            var end = start + strs[i].length + 1;
            if(pos>start&&pos<end){
                if(this.start!=start||this.end!=end){
                	this.select(start,end);
                	if(Ext.isGecko||Ext.isOpera){
                		this.start=start;
                		this.end=end;
                	}
                }else this.start=this.end=0;
				break;
            }else{
                start +=strs[i].length + 1;
            }
        }
    },
    commit:function(ds,lr){
        if(this.win) this.win.close();
        var record = lr ? lr : this.record,
        	records=ds.getAll(),from="";
        if(record){
    		this.optionDataSet=ds;
	    	for(var j=0;j<records.length;j++){
	        	if(records[j].get(this.valuefield)){
	        		var v=records[j].get(this.valuefield);
	        		from+=this.quote+v+this.quote;
	        		if(j!=records.length-1)from+=","
	        	}
	        }
        	record.set(this.binder.name,from);
        }
        this.fireEvent('commit', this, record, records)
    },
    getCursortPosition : function() {
        var p = 0;
        if (document.selection) {
        	this.el.focus();
            var r = document.selection.createRange();
            r.moveStart('character', -this.el.dom.value.length);
            p = r.text.length;
        }else if (this.el.dom.selectionStart||this.el.dom.selectionStart=='0')
            p = this.el.dom.selectionStart;
        return p;
    },
    processValue : function(v){
    	this.localvalues=[];
    	if(!v)return '';
    	var values=v.split(';'),rv="",records=[];
    	for(var i=0;i<values.length;i++){
    		var vs=values[i].trim();
    		if(vs||vs=='0'){
    			var record=this.getRecordByDisplay(vs);
    			if(record){
    				vs=record.get(this.valuefield);
    				records.add(record);
    			}else{
    				this.localvalues.add(vs);
    			}
	    		rv+=this.quote+vs+this.quote+",";
    		}
    	}
    	if(this.optionDataSet){
	    	this.optionDataSet.removeAll();
    	}
    	for(var i=0;i<records.length;i++){
    		this.optionDataSet.add(records[i]);
    	}
    	return rv.match(/,$/)?rv.slice(0,rv.length-1):rv;
    },
    getRecordByDisplay: function(name){
    	if(!this.optionDataSet)return null;
    	var datas = this.optionDataSet.getAll();
		for(var i=0;i<datas.length;i++){
			var d = datas[i].get(this.displayfield);
			if(d == name){
				return datas[i];
			}
		}
		return null;
    },
    formatValue : function(v){
    	var rv="";
    	if(this.optionDataSet){
    		var datas=this.optionDataSet.getAll();
			for(var i=0;i<datas.length;i++){
				rv+=datas[i].get(this.displayfield)+";";
			}
    	}
		for(var i=0;i<this.localvalues.length;i++){
			rv+=this.localvalues[i]+";";
		}
    	return rv;
    },
    showLovWindow : function(){        
        if(this.fetching||this.isWinOpen||this.readonly) return;
        
        var v = this.getRawValue();
        this.blur();
        var url;
        if(!Ext.isEmpty(this.lovurl)){
            url = this.lovurl+'?' + Ext.urlEncode(this.getLovPara()) + '&';
        }else if(!Ext.isEmpty(this.lovservice)){
            url = this.context + 'sys_multiLov.screen?url='+encodeURIComponent(this.context + 'sys_lov.svc?svc='+this.lovservice + '&'+ Ext.urlEncode(this.getLovPara()))+'&service='+this.lovservice+'&';           
        }else if(!Ext.isEmpty(this.lovmodel)){
            url = this.context + 'sys_multiLov.screen?url='+encodeURIComponent(this.context + 'autocrud/'+this.lovmodel+'/query?'+ Ext.urlEncode(this.getLovPara()))+'&service='+this.lovmodel+'&';
        }
        if(url) {
	        this.isWinOpen = true;
            this.win = new $A.Window({title:this.title||'Lov', url:url+"lovid="+this.id+"&key="+encodeURIComponent(v)+"&gridheight="+(this.lovgridheight||350)+"&innerwidth="+((this.lovwidth||400)-30)+"&innergridwidth="+Math.round(((this.lovwidth||400)-90)/2)+"&lovautoquery="+this.lovautoquery+"&lovlabelwidth="+this.lovlabelwidth, height:this.lovheight||400,width:this.lovwidth||400});
            this.win.on('close',this.onWinClose,this);
        }
    },
    destroy : function(){
        $A.Lov.superclass.destroy.call(this);
    }
});
/**
 * @class Aurora.TextArea
 * @extends Aurora.Field
 * <p>TextArea组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.TextArea = Ext.extend($A.Field,{
	constructor: function(config) {
        $A.TextArea.superclass.constructor.call(this, config);        
    },
    initComponent : function(config){
    	$A.TextArea.superclass.initComponent.call(this, config); 		
    },
    initEvents : function(){
    	$A.TextArea.superclass.initEvents.call(this);    	
    },
    initElements : function(){
    	this.el= this.wrap;
    },
    onKeyDown : function(e){}
//    ,setRawValue : function(v){
//        this.el.update(v === null || v === undefined ? '' : v);
//    }
//    ,getRawValue : function(){
//        var v = this.el.dom.innerHTML;
//        if(v === this.emptytext || v === undefined){
//            v = '';
//        }
//        return v;
//    }
})
$A.Customization = Ext.extend(Ext.util.Observable,{
    constructor: function(config) {
        $A.Customization.superclass.constructor.call(this);
        this.id = config.id || Ext.id();
        $A.CmpManager.put(this.id,this)
        this.initConfig=config;
    },
    start : function(config){
        var sf = this;
        this.scanInterval = setInterval(function() {
            var cmps = $A.CmpManager.getAll();
            for(var key in cmps){
                var cmp = cmps[key];
                if(cmp.iscust == true){
                    cmp.on('mouseover',sf.onCmpOver,sf);
                }
            }
        }, 500);
    },
    mask : function(el){
        var w = el.getWidth();
        var h = el.getHeight();//leftp:0px;top:0px; 是否引起resize?
        var p = '<div title="点击设置个性化" style="border:2px solid #000;cursor:pointer;left:-10000px;top:-10000px;width:'+(w)+'px;height:'+(h)+'px;position: absolute;"><div style="width:100%;height:100%;filter: alpha(opacity=0);opacity: 0;mozopacity: 0;background-color:#ffffff;"> </div></div>';
        this.masker = Ext.get(Ext.DomHelper.insertFirst(Ext.getBody(),p));
        this.masker.setStyle('z-index', 10001);
        var xy = el.getXY();
        this.masker.setX(xy[0]-2);
        this.masker.setY(xy[1]-2);
        this.masker.on('click', this.onClick,this);
        this.cover.on('mouseover',this.onCmpOut,this);
    },
    onClick : function(){
        var path = window.location.pathname;
        var str = path.indexOf('modules');
        var screen_path = path.substring(str,path.length);
        var screen = screen_path.substring(screen_path.lastIndexOf('/')+1, screen_path.length);
        var context_path = path.substring(0,str);
        var parent = this.el.parent('[url]');
        if(parent) {
            var url = parent.getAttributeNS("","url");
            if(url){
                url = url.split('?')[0];
                if(url.indexOf(context_path) == -1) {
                    var li = url.lastIndexOf('/');
                    if(li != -1){
                        url = url.substring(li+1,url.length);
                    }
                    screen_path = screen_path.replaceAll(screen, url);
                }else {
                    screen_path = url.substring(url.indexOf(context_path) + new String(context_path).length,url.length);
                }
            }
        }
        
        new Aurora.Window({id:'sys_customization_window', url:context_path + 'modules/sys/sys_customization_window.screen?screen_path='+screen_path + '&id='+ this.cmp.id, title:'个性化设置',height:170,width:400});
        this.onCmpOut();
    },
    hideMask : function(){
        if(this.masker){
            Ext.fly(this.masker).remove();   
            this.masker = null;
        }
    },
    showCover : function(){
        var scrollWidth = Ext.isStrict ? document.documentElement.scrollWidth : document.body.scrollWidth;
        var scrollHeight = Ext.isStrict ? document.documentElement.scrollHeight : document.body.scrollHeight;
        var screenWidth = Math.max(scrollWidth,Aurora.getViewportWidth());
        var screenHeight = Math.max(scrollHeight,Aurora.getViewportHeight());
        var st = (Ext.isIE6 ? 'position:absolute;width:'+(screenWidth-1)+'px;height:'+(screenHeight-1)+'px;':'')
//        var p = '<DIV class="aurora-cover" style="'+st+'" unselectable="on"></DIV>';
        var p = '<DIV class="aurora-cover" style="'+st+'filter: alpha(opacity=0);background-color: #fff;opacity: 0;mozopacity: 0;" unselectable="on"></DIV>';
        this.cover = Ext.get(Ext.DomHelper.insertFirst(Ext.getBody(),p));
        this.cover.setStyle('z-index', 9999);
    },
    hideCover : function(){
        if(this.cover){
            this.cover.un('mouseover',this.onCmpOut,this);
            Ext.fly(this.cover).remove();
            this.cover = null;
        }
    },
    getEl : function(cmp){
        var el;
        if(Aurora.Grid && cmp instanceof Aurora.Grid) {
            el = cmp.wb;       
        }else{
            el = cmp.wrap;
        }
        
        return el;
    },
    onCmpOver : function(cmp, e){
        if(this.isInSpotlight) return;
        this.isInSpotlight = true;
        this.showCover();
        this.cmp = cmp;
        this.el = this.getEl(cmp);
        if(this.el){
//            this.backgroundcolor = this.el.getStyle('background-color');
//            this.currentPosition = this.el.getStyle('position');
            this.currentZIndex = this.el.getStyle('z-index');
//            this.el.setStyle('background-color','#fff')
//            this.el.setStyle('position','relative');
            this.el.setStyle('z-index', 10000);
        }
        this.mask(this.el)
    },
    onCmpOut : function(e){
        this.isInSpotlight = false;
        if(this.el){
//            this.el.setStyle('position',this.currentPosition||'')
            this.el.setStyle('z-index', this.currentZIndex);
//            this.el.setStyle('background-color', this.backgroundcolor||'');
            this.el = null;
        }
        this.hideMask();
        this.hideCover();
        this.cmp = null;
    },
    stop : function(){
        if(this.scanInterval) clearInterval(this.scanInterval)
        this.onCmpOut();
        var cmps = $A.CmpManager.getAll();
        for(var key in cmps){
            var cmp = cmps[key];
            if(cmp.iscust == true){
                cmp.un('mouseover',this.onCmpOver,this);
            }
        }
    }
});
$A.QueryForm = Ext.extend($A.Component,{
	initComponent:function(config){
		$A.QueryForm.superclass.initComponent.call(this,config);
		var sf = this,wrap= sf.bodyWrap = sf.wrap.child('.form_body_wrap');
		if(wrap){
			sf.body = wrap.first();
			sf.hasbody = true;
			if(!sf.isopen)sf.body.hide();
		}
		sf.searchInput = $A.CmpManager.get(sf.id + '_query');
		sf.rds = $A.CmpManager.get(sf.resulttarget);
	},
	processListener: function(ou){
    	$A.QueryForm.superclass.processListener.call(this, ou);
    	Ext.fly(document)[ou]('click',this.formBlur,this);
    },
    formBlur : function(e,t){
    	if(!this.isEventFromComponent(t)){
    		this.close();
    	}
    },
	bind : function(ds){
		if(Ext.isString(ds)){
			ds = $(ds);
		}
		this.qds = ds;
	},
	doSearch : function(){
		var sf = this,
			input = sf.searchInput,
			queryhook = sf.queryhook,
			queryfield = sf.queryfield;
		if(sf.rds){
			if(!sf.isopen && input){
				var value = input.getValue(),
					qds = sf.qds;
				if(queryhook){
					queryhook(value,qds);
				}else if(queryfield)
					if(qds.getCurrentRecord())qds.getCurrentRecord().set(queryfield,value);
			}
			sf.rds.query();	
            sf.close();
		}
	},
	open : function(){
		var sf = this,body = sf.body;
		if(sf.isopen && sf.hasbody)return;
		sf.isopen = true;
        sf.bodyWrap.parent('TBODY').setStyle('display','block');
        if(sf.isopen)body.show()
        sf.bodyWrap.setHeight(body.getHeight()+10);
        sf.bodyWrap.fadeIn();
	},
	close : function(){
		var sf = this;
		if(sf.isopen && sf.hasbody){
			sf.isopen = false;
			sf.body.hide();
            sf.bodyWrap.parent('TBODY').setStyle('display','none');
			sf.bodyWrap.setHeight(0,true);
		}
	},
	trigger : function(){
		this[this.isopen?'close':'open']();
	},
	reset : function(){
		if(this.searchInput)this.searchInput.setValue('');
		this.qds.reset();
	}
});
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
/**
 * @class Aurora.PercentField
 * @extends Aurora.NumberField
 * <p>百分数输入组件.</p>
 * @author huazhen.wu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.PercentField = Ext.extend($A.NumberField,{
    formatValue : function(v){
    	if(Ext.isEmpty(v))return '';
        return $A.PercentField.superclass.formatValue.call(this,$A.FixMath.mul(v,100));
    },
    processValue : function(v){
    	if(Ext.isEmpty(v))return '';
        return $A.FixMath.div($A.PercentField.superclass.processValue.call(this,v),100);
    }
});
