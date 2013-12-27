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