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
$A = Aurora = {version: '1.0',revision:'$Rev$'};
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
$A.onReady = Ext.onReady;
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
$A.CmpManager = function(){
    return {
        put : function(id, cmp){
        	if(!this.cache) this.cache = {};
        	if(this.cache[id] != null) {
	        	alert("错误: ID为' " + id +" '的组件已经存在!");
	        	return;
	        }
            if(window['__host'])window['__host'].cmps[id] = cmp;
//        	if($A.focusWindow) $A.focusWindow.cmps[id] = cmp;
//        	if($A.focusTab) $A.focusTab.cmps[id] = cmp;
        	this.cache[id]=cmp;
        	cmp.on('mouseover',$A.CmpManager.onCmpOver,$A.CmpManager);
        	cmp.on('mouseout',$A.CmpManager.onCmpOut,$A.CmpManager);
        },
        onCmpOver: function(cmp, e){
        	if($A.validInfoType != 'tip') return;
        	if(($A.Grid && cmp instanceof $A.Grid)||($A.Table && cmp instanceof $A.Table)){
        		var ds = cmp.dataset;
        		if(!ds||ds.isValid == true||!e.target)return;
        		var target = Ext.fly(e.target).findParent('td');
                if(target){
                    var atype = Ext.fly(target).getAttributeNS("","atype");
            		if(atype == 'grid-cell'||atype == 'table-cell'){
            			var rid = Ext.fly(target).getAttributeNS("","recordid");
            			var record = ds.findById(rid);
            			if(record){
                			var name = Ext.fly(target).getAttributeNS("","dataindex");        			
        					var msg = record.valid[name];
        	        		if(Ext.isEmpty(msg))return;
        	        		$A.ToolTip.show(target, msg);
            			}
                    }
        		}
        	}else{
	        	if(cmp.binder){
	        		var ds = cmp.binder.ds;
	        		if(!ds || ds.isValid == true)return;
	        		var record = cmp.record;
	        		if(!record)return;
	        		var msg = record.valid[cmp.binder.name];
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
		alert('未找到组件:' + id)
	}
	return cmp;
}

/**
 * 设置cookie
 * @param {String} name cookie名
 * @param {String} value cookie值
 */
$A.setCookie = function(name,value){
    document.cookie = name + "="+ escape (value);
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
    if(Ext.isIE){
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
 */
$A.post = function(action,data){
    var form = Ext.getBody().createChild({style:'display:none',tag:'form',method:'post',action:action});
    for(var key in data){
    	var v = data[key]
    	if(v) {
    		if(v instanceof Date) v = v.format('isoDate');//TODO:时分秒如何处理?
            form.createChild({tag:"input",type:"hidden",name:key,value:v});
    	}
    }
    form.dom.submit();
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
 * </ul></div></p>
 * @param {Object} opt 参数对象
 */
$A.request = function(opt){
	var url = opt.url,para = opt.para,successCall = opt.success,errorCall = opt.error,scope = opt.scope,failureCall = opt.failure;
	var opts = Ext.apply({},opt.opts);
	$A.manager.fireEvent('ajaxstart', url, para);
	if($A.logWindow){
		$A['_startTime'] = new Date();
		$('HTTPWATCH_DATASET').create({'url':url,'request':Ext.util.JSON.encode({parameter:para})})
	}
	var data = Ext.apply({parameter:para},opt.ext);
	Ext.Ajax.request({
		url: url,
		method: 'POST',
		params:{_request_data:Ext.util.JSON.encode(data)},
		opts:opts,
        sync:opt.sync,
		success: function(response,options){
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
						var st = res.error.stackTrace;
						st = (st) ? st.replaceAll('\r\n','</br>') : '';
						if(res.error.message) {
							var h = (st=='') ? 150 : 250;
						    $A.showErrorMessage(_lang['ajax.error'], res.error.message+'</br>'+st,null,400,h);
						}else{
						    $A.showErrorMessage(_lang['ajax.error'], st,null,400,250);
						}
						if(errorCall)
                        errorCall.call(scope, res, options);	
					}								    						    
				} else {
					$A.manager.fireEvent('ajaxsuccess', $A.manager, url,para,res);
					if(successCall)successCall.call(scope,res, options);
				}
			}
		},
		failure : function(response, options){
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
        		else if(numbers.length == 1)value=parseInt(string.slice(index,index+=arr[i].length));
        		else value=parseInt(string.slice(index=mask.search(arr[i]),index+arr[i].length));
        		switch(arr[i]){
        			case "mm":;
        			case "m":value=value-1;break;
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
            shared.bind(el);
            shared.setFixedWidth(fixedWidth || 'auto');
            return shared.getSize(text);
        }
    };
}();
$A.TextMetrics.Instance = function(bindTo, fixedWidth){
	var p = '<div style="left:-1000px;top:-1000px;position:absolute;visibility:hidden"></div>';
	var ml = Ext.get(Ext.DomHelper.append(Ext.get(bindTo),p));
//    var ml = new Ext.Element(document.createElement('div'));
//    document.body.appendChild(ml.dom);
//    ml.position('absolute');
//    ml.setLeft(-1000);
//    ml.setTop(-1000);    
//    ml.hide();
    if(fixedWidth){
        ml.setWidth(fixedWidth);
    }
    var instance = {      
        getSize : function(text){
            ml.update(text);            
            var s=new Object();
            s.width=ml.getWidth();
            s.height=ml.getHeight();
            ml.update('');
            return s;
        },       
        bind : function(el){
        	var a=new Array('font-size','font-style', 'font-weight', 'font-family','line-height', 'text-transform', 'letter-spacing');	
        	var len = a.length, r = {};
        	for(var i = 0; i < len; i++){
                r[a[i]] = Ext.fly(el).getStyle(a[i]);
            }
            ml.setStyle(r);           
        },       
        setFixedWidth : function(width){
            ml.setWidth(width);
        }       
    };
    instance.bind(bindTo);
    return instance;
};
$A.ToolTip = function(){
	q = {
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
        show : function(msg){
        	if(!this.enable)return;
//            this.hide();
            var sf = this;
            if(parent.showSideBar){
                parent.showSideBar(msg)
            }else{
            	this.hide();
                var p = '<div class="item-slideBar">'+msg+'</div>';
                this.bar = Ext.get(Ext.DomHelper.insertFirst(Ext.getBody(),p));
                this.bar.setStyle('z-index', 999999);
                this.bar.animate({height: {to: 50, from: 0}},0.35,function(){
                    setTimeout(function(){
                       sf.hide();
                    }, 2000);            
                },'easeOut','run');
            }
        },
        hide : function(){
        	if(parent.hideSideBar){
                parent.hideSideBar()
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
//			if(!$A.Cover.bodyOverflow)$A.Cover.bodyOverflow = Ext.getBody().getStyle('overflow');		
			var scrollWidth = Ext.isStrict ? document.documentElement.scrollWidth : document.body.scrollWidth;
    		var scrollHeight = Ext.isStrict ? document.documentElement.scrollHeight : document.body.scrollHeight;
    		var screenWidth = Math.max(scrollWidth,$A.getViewportWidth());
    		var screenHeight = Math.max(scrollHeight,$A.getViewportHeight());
			var p = '<DIV class="aurora-cover"'+(Ext.isIE6?' style="position:absolute;width:'+(screenWidth-1)+'px;height:'+(screenHeight-1)+'px;':'')+'" unselectable="on"></DIV>';
			var cover = Ext.get(Ext.DomHelper.insertFirst(Ext.getBody(),p));
	    	cover.setStyle('z-index', Ext.fly(el).getStyle('z-index') - 1);
//	    	Ext.getBody().setStyle('overflow','hidden');
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
            var p = '<div class="aurora-mask"  style="left:-1000px;top:-1000px;width:'+w+'px;height:'+h+'px;position: absolute;"><div unselectable="on"></div><span style="top:'+(h/2-11)+'px">'+msg+'</span></div>';
            var masker = Ext.get(Ext.DomHelper.append(el.parent(),p));
            var zi = el.getStyle('z-index') == 'auto' ? 0 : el.getStyle('z-index');
            masker.setStyle('z-index', zi + 1);
            masker.setXY(el.getXY());
            var sp = masker.child('span');
            var size = $A.TextMetrics.measure(sp,msg);
            sp.setLeft((w-size.width - 45)/2)
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
        return;
    }
    var sf = o.sf, html=o.html, loadScripts=o.loadScripts, callback=o.callback, host=o.host;
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
    
    var onReadOnLoad = function(){
        var isready = Ext.isIE ? (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") : true;
        if(isready) {
            loaded ++;
            if(loaded==jslink.length) {
                for(j=0,k=jsscript.length;j<k;j++){
                    var jst = jsscript[j];
                    if(window.execScript) {
                        window.execScript(jst);
                    } else {
                        window.eval(jst);
                    }
                }
                if(typeof callback == "function"){
                    callback();
                }
                var el = document.getElementById(id);
                if(el){Ext.removeNode(el);} 
                Ext.fly(dom).setStyle('display', 'block');
                $A.doEvalScript();
            }else{
                var js = jslink[loaded];
                var s = document.createElement("script");
                s.src = js.src;
                s.type = js.type;
                s[Ext.isIE ? "onreadystatechange" : "onload"] = onReadOnLoad;
                hd.appendChild(s);
            }
        }
    }
    
    if(jslink.length > 0){
        var js = jslink[0];
        var s = document.createElement("script");
        s.src = js.src;
        s.type = js.type;
        s[Ext.isIE ? "onreadystatechange" : "onload"] = onReadOnLoad;
        hd.appendChild(s);
    } else if(jslink.length ==0) {
        for(j=0,k=jsscript.length;j<k;j++){
            var jst = jsscript[j];
            if(window.execScript) {
               window.execScript(jst);
            } else {
               window.eval(jst);
            }
        }
        if(typeof callback == "function"){
                callback();
        }
        var el = document.getElementById(id);
        if(el){Ext.removeNode(el);} 
        Ext.fly(dom).setStyle('display', 'block');
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
            sf:sf
        });
        if(!$A.evaling)
        $A.doEvalScript() 
    });
    
    Ext.fly(dom).setStyle('display', 'none');
    dom.innerHTML = html.replace(/(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)/ig, "").replace(/(?:<link.*?>)((\n|\r|.)*?)/ig, "");
    return this;
}

Ext.EventObjectImpl.prototype['isSpecialKey'] = function(){
    var k = this.keyCode;
    return (this.type == 'keypress' && this.ctrlKey) || k==8 || k== 46 || k == 9 || k == 13  || k == 40 || k == 27 || k == 44 ||
    (k == 16) || (k == 17) ||
    (k >= 18 && k <= 20) ||
    (k >= 33 && k <= 35) ||
    (k >= 36 && k <= 39);
}
Ext.removeNode = Ext.isIE && !Ext.isIE8 ? function(){
    var d;
    return function(n){
        if(n && n.tagName != 'BODY'){
            (Ext.enableNestedListenerRemoval) ? Ext.EventManager.purgeElement(n, true) : Ext.EventManager.removeAll(n);
            d = d || document.createElement('<div id="_removenode" style="position:absolute;display:none;left:-1000px;top:-1000px">');
            if(!d.parentNode)document.appendChild(d);
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
//		if(str.indexOf('.0') !=-1) str = str.substr(0,str.length-2);
		
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
	if(value!==0&&(!value||isNaN(value)))return '';
	if(decimalprecision||decimalprecision===0) value=Number(value).toFixed(decimalprecision);
    var ps = String(value).split('.');
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
	        'timeout'
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
$A.manager.on('ajaxsuccess',function(){
    $A.SideBar.show(_lang['eventmanager.success'])
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
//Ext.get(document.documentElement).on('keydown',function(e){
//	if(e.altKey&&e.keyCode == 76){
//		if(!$A.logWindow) {
//			$A.logWindow = new $A.Window({modal:false, url:'log.screen',title:'AjaxWatch', height:550,width:530});	
//			$A.logWindow.on('close',function(){
//				delete 	$A.logWindow;		
//			})
//		}
//	}
//})
$A.setValidInfoType('tip'); 