Aurora = {version: '3.0'};
Aurora.fireWindowResize = function(){
	Aurora.Mask.resizeMask();
}
Ext.fly(window).on("resize", Aurora.fireWindowResize, this);
Aurora.cache = {};
Aurora.cmps = {};

Aurora.CmpManager = function(){
    return {
        put : function(id, cmp){
        	if(!this.cache) this.cache = {};
        	if(this.cache[id] != null) {
	        	alert("错误: ID为' " + id +" '的组件已经存在!");
	        	return;
	        }
        	this.cache[id]=cmp;
        	cmp.on('mouseover',Aurora.CmpManager.onCmpOver,Aurora.CmpManager);
        	cmp.on('mouseout',Aurora.CmpManager.onCmpOut,Aurora.CmpManager);
        },
        onCmpOver: function(cmp, e){
        	if(Aurora.validInfoType != 'tip') return;
        	if(cmp instanceof Aurora.Grid){
        		var ds = cmp.dataset;
        		if(!ds||ds.isValid == true)return;
        		if(Ext.fly(e.target).hasClass('grid-cell')){
        			var rid = Ext.fly(e.target).getAttributeNS("","recordid");
        			var record = ds.findById(rid);
        			var name = Ext.fly(e.target).getAttributeNS("","dataindex");        			
					var msg = record.valid[name];
	        		if(msg===true)return;
	        		Aurora.ToolTip.show(e.target, msg);
        		}
        	}else{
	        	if(cmp.binder){
	        		var ds = cmp.binder.ds;
	        		if(!ds || ds.isValid == true)return;
	        		var record = cmp.record;
	        		if(!record)return;
	        		var msg = record.valid[cmp.binder.name];
	        		if(msg===true)return;
	        		Aurora.ToolTip.show(cmp.id, msg);
	        	}
        	}
        },
        onCmpOut: function(cmp,e){
        	if(Aurora.validInfoType != 'tip') return;
        	Aurora.ToolTip.hide();
        },
        getAll : function(){
        	return this.cache;
        },
        remove : function(id){
        	var cmp = this.cache[id];
        	cmp.un('mouseover',Aurora.CmpManager.onCmpOver,Aurora.CmpManager);
        	cmp.un('mouseout',Aurora.CmpManager.onCmpOut,Aurora.CmpManager);
        	delete this.cache[id];
        },
        get : function(id){
        	if(!this.cache) return null;
        	return this.cache[id];
        }
    };
}();
Ext.Ajax.on("requestexception", function(conn, response, options) {
	Aurora.manager.fireEvent('ajaxerror', Aurora.manager, response.status, response);
	switch(response.status){
		case 404:
			Aurora.showMessage('错误', '状态 404: 未找到"'+ response.statusText+'"');
//			alert('状态 404: 未找到"'+ response.statusText+'"');
			break;
		default:
			Aurora.showMessage('错误', '状态 '+ response.status + ' 服务器端错误!');
//			alert('状态 '+ response.status + ' 服务器端错误!');
			break;
	}	
}, this);
$ = Aurora.getCmp = function(id){
	var cmp = Aurora.CmpManager.get(id)
	if(cmp == null) {
		alert('未找到组件:' + id)
	}
	return cmp;
}
Aurora.getViewportHeight = function(){
    if(Ext.isIE){
        return Ext.isStrict ? document.documentElement.clientHeight :
                 document.body.clientHeight;
    }else{
        return self.innerHeight;
    }
}
Aurora.getViewportWidth = function() {
    if(Ext.isIE){
        return Ext.isStrict ? document.documentElement.clientWidth :
                 document.body.clientWidth;
    }else{
        return self.innerWidth;
    }
}
Aurora.request = function(url, para, success, failed, scope){
	Aurora.manager.fireEvent('ajaxstart', url, para);
	Ext.Ajax.request({
			url: url,
			method: 'POST',
			params:{_request_data:Ext.util.JSON.encode({parameter:para})},
			success: function(response){
				Aurora.manager.fireEvent('ajaxcomplete', url, para,response);
				if(response && response.responseText){
					var res = null;
					try {
						res = Ext.decode(response.responseText);
					}catch(e){
						Aurora.showMessage('错误', '返回格式不正确!');
//						alert('返回格式不正确!')
					}
					if(res && !res.success){
						Aurora.manager.fireEvent('ajaxfailed', Aurora.manager, url,para,res);
						if(res.error){//								
							if(failed)failed.call(scope, res);
						}								    						    
					} else {
						Aurora.manager.fireEvent('ajaxsuccess', Aurora.manager, url,para,res);
						if(success)success.call(scope,res);
					}
				}
			},
			scope: scope
		});
}
Ext.applyIf(String.prototype, {
	trim : function(){
		return this.replace(/(^\s*)|(\s*$)/g, "");
	}
});
Ext.applyIf(Array.prototype, {
	add : function(o){
		if(this.indexOf(o) == -1)
		this[this.length] = o;
	}
});

Aurora.TextMetrics = function(){
    var shared;
    return {
        measure : function(el, text, fixedWidth){
            if(!shared){
                shared = Aurora.TextMetrics.Instance(el, fixedWidth);
            }
            shared.bind(el);
            shared.setFixedWidth(fixedWidth || 'auto');
            return shared.getSize(text);
        }
    };
}();
Aurora.TextMetrics.Instance = function(bindTo, fixedWidth){
    var ml = new Ext.Element(document.createElement('div'));
    document.body.appendChild(ml.dom);
    ml.position('absolute');
    ml.setLeft(-1000);
    ml.setTop(-1000);    
    ml.hide();
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
Aurora.ToolTip = function(){
	q = {
		init: function(){
			var sf = this;
			Ext.onReady(function(){
				var qdom = Ext.DomHelper.append(
				    Ext.getBody(),
				    {
					    tag: 'div',
					    cls: 'tip-wrap',
					    children: [{tag: 'div', cls:'tip-body'}]
				    }
				);
				var sdom = Ext.DomHelper.append(Ext.getBody(),{tag:'div',cls: 'item-shadow'});
				sf.tip = Ext.get(qdom);
				sf.shadow = Ext.get(sdom);
				sf.body = sf.tip.first("div.tip-body");
			})
			
		},
		show: function(el, text){
			if(this.tip == null){
				this.init();
				return;
			}
			this.tip.show();
			this.shadow.show();
			this.body.update(text)
			var ele;
			if(typeof(el)=="string"){
				var cmp = Aurora.CmpManager.get(el)
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
			var screenWidth = Aurora.getViewportWidth();
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
			if(this.tip != null) this.tip.hide();
			if(this.shadow != null) this.shadow.hide();
		}
	}
	return q
}();
Aurora.Mask = function(){
	var m = {
		container: {},
		mask : function(el){
			var screenWidth = Aurora.getViewportWidth();
    		var screenHeight = Aurora.getViewportHeight();
//			if(!window._mask) {
				var p = '<DIV class="aurora-mask" style="left:0px;top:0px;width:'+screenWidth+'px;height:'+screenHeight+'px;POSITION: absolute;FILTER: alpha(opacity=30);BACKGROUND-COLOR: #000000; opacity: 0.3; MozOpacity: 0.3" unselectable="on"></DIV>';
				var mask = Ext.get(Ext.DomHelper.append(Ext.getBody(),p));
//			}
	    	mask.setStyle('z-index', Ext.fly(el).getStyle('z-index') - 1);
	    	Aurora.Mask.container[el.id] = mask;
		},
		unmask : function(el){
			var mask = Aurora.Mask.container[el.id];
			if(mask) {
				Ext.fly(mask).remove();
				Aurora.Mask.container[el.id] = null;
				delete Aurora.Mask.container[el.id];
			}
		},
		resizeMask : function(){
			var screenWidth = Aurora.getViewportWidth();
    		var screenHeight = Aurora.getViewportHeight();
			for(key in Aurora.Mask.container){
				var mask = Aurora.Mask.container[key];
				Ext.fly(mask).setWidth(screenWidth);
				Ext.fly(mask).setHeight(screenHeight);
			}		
		}
	}
	return m;
}();
Ext.Element.prototype.update = function(html, loadScripts, callback){
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
    var dom = this.dom;

    html += '<span id="' + id + '"></span>';
    Ext.lib.Event.onAvailable(id, function(){
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
        for(var i = 0,l=jslink.length;i<l;i++){
        	var js = jslink[i];
        	var s = document.createElement("script");
            s.src = js.src;
            s.type = js.type;
            s[Ext.isIE ? "onreadystatechange" : "onload"] = function(){
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
	            	}
            	}
            };
			hd.appendChild(s);
        }
        if(jslink.length ==0) {
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
        }        
        var el = document.getElementById(id);
        if(el){Ext.removeNode(el);}        
        Ext.fly(dom).setStyle('display', 'block');
    });
    Ext.fly(dom).setStyle('display', 'none');
    dom.innerHTML = html.replace(/(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)/ig, "").replace(/(?:<link.*?>)((\n|\r|.)*?)/ig, "");
    return this;
}
Aurora.parseDate = function(str){
	if(typeof str == 'string'){  
		//TODO:临时, 需要服务端解决
		if(str.indexOf('.0') !=-1) str = str.substr(0,str.length-2);
		
		var results = str.match(/^ *(\d{4})-(\d{1,2})-(\d{1,2}) *$/);      
		if(results && results.length>3)      
	  		return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]));       
		results = str.match(/^ *(\d{4})-(\d{1,2})-(\d{1,2}) +(\d{1,2}):(\d{1,2}):(\d{1,2}) *$/);      
	    if(results && results.length>6)      
    	return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]),parseInt(results[4]),parseInt(results[5]),parseInt(results[6]));       
	}      
  	return null;      
}
Aurora.formateDate = function(date){
	if(!date)return '';
	if(date.getFullYear){
		return date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate()
	}else{
		return date
	}
}
Aurora.formateDateTime = function(date){
	if(!date)return '';
	if(date.getFullYear){
		return date.getFullYear() + 
		"-" + (date.getMonth()+1) + 
		"-" + date.getDate() + 
		" " + date.getHours() + 
		":" + date.getMinutes() + 
		":" + date.getSeconds();
		
	}else{
		return date
	}
}
Aurora.EventManager = Ext.extend(Ext.util.Observable,{
	constructor: function() {
		Aurora.EventManager.superclass.constructor.call(this);
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
Aurora.manager = new Aurora.EventManager();
Aurora.regEvent = function(name, hanlder){
	Aurora.manager.on(name, hanlder);
}

Aurora.validInfoType = 'area';
Aurora.validInfoTypeObj = '';
Aurora.setValidInfoType = function(type, obj){
	Aurora.validInfoType = type;
	Aurora.validInfoTypeObj = obj;
}

Aurora.invalidRecords = {};
Aurora.addInValidReocrd = function(id, record){
	var rs = Aurora.invalidRecords[id];
	if(!rs){
		Aurora.invalidRecords[id] = rs = [];
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
Aurora.removeInvalidReocrd = function(id,record){
	var rs = Aurora.invalidRecords[id];
	if(!rs) return;
	for(var i=0;i<rs.length;i++){
		var r = rs[i];
		if(r.id == record.id){
			rs.remove(r)
			break;
		}
	}
}
Aurora.getInvalidRecords = function(pageid){
	var records = [];
	for(var key in Aurora.invalidRecords){
		var ds = Aurora.CmpManager.get(key)
		if(ds.pageid == pageid){
			var rs = Aurora.invalidRecords[key];
			records = records.concat(rs);
		}
	}
	return records;
}
Aurora.isInValidReocrdEmpty = function(pageid){
	var isEmpty = true;
	for(var key in Aurora.invalidRecords){
		var ds = Aurora.CmpManager.get(key)
		if(ds.pageid == pageid){
			var rs = Aurora.invalidRecords[key];
			if(rs.length != 0){
				isEmpty = false;
				break;
			}
		}
	}
	return isEmpty;
}
Aurora.manager.on('valid',function(manager, ds, valid){
	switch(Aurora.validInfoType){
		case 'area':
			Aurora.showValidTopMsg(ds);
			break;
		case 'message':
			Aurora.showValidWindowMsg(ds);
			break;
	}
})
Aurora.showValidWindowMsg = function(ds) {
	var empty = Aurora.isInValidReocrdEmpty(ds.pageid);
	if(empty == true){
		if(Aurora.validWindow)Aurora.validWindow.close();
	}
	if(!Aurora.validWindow && empty == false){
		Aurora.validWindow = Aurora.showWindow('校验失败','',400,200);
		Aurora.validWindow.on('close',function(){
			Aurora.validWindow = null;			
		})
	}
	var sb =[];
	var rs = Aurora.getInvalidRecords(ds.pageid);
	for(var i=0;i<rs.length;i++){
		var r = rs[i];
		var index = r.ds.data.indexOf(r)+1
		sb[sb.length] ='记录<a href="#" onclick="$(\''+r.ds.id+'\').locate('+index+')">('+r.id+')</a>:';

		for(var k in r.valid){
			sb[sb.length] = r.valid[k]+';'
		}
		sb[sb.length]='<br/>';
	}
	if(Aurora.validWindow)Aurora.validWindow.body.child('div').update(sb.join(''))
}
Aurora.pageids = [];
Aurora.showValidTopMsg = function(ds) {
	var empty = Aurora.isInValidReocrdEmpty(ds.pageid);
	if(empty == true){
		var d = Ext.get(ds.pageid+'_msg');
		if(d){
			d.hide();
			d.setStyle('display','none')
			d.update('');
		}
		return;
	}
	var rs = Aurora.getInvalidRecords(ds.pageid);
	var sb = [];
	for(var i=0;i<rs.length;i++){
		var r = rs[i];
		var index = r.ds.data.indexOf(r)+1
		sb[sb.length] ='记录<a href="#" onclick="$(\''+r.ds.id+'\').locate('+index+')">('+r.id+')</a>:';

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
Aurora.AUTO_ID = 1000;
Aurora.DataSet = Ext.extend(Ext.util.Observable,{
	constructor: function(config) {//datas,fields, type
		Aurora.DataSet.superclass.constructor.call(this);
		config = config || {};
		this.pageid = config.pageid;
    	this.spara = {};
    	this.pageSize = config.pageSize || 10;
    	this.submitUrl = config.submitUrl || '';
    	this.queryUrl = config.queryUrl || '';
    	this.fetchAll = config.fetchAll;
    	this.autoCount = config.autoCount;
		this.loading = false;
    	this.qpara = {};
    	this.fields = {};
		
    	this.resetConfig();
    	
		this.id = config.id || Ext.id();
        Aurora.CmpManager.put(this.id,this)		
    	this.qds = config.queryDataSet == "" ? null :$(config.queryDataSet);
    	if(this.qds != null && this.qds.getCurrentRecord() == null) this.qds.create();
    	this.initEvents();
    	if(config.fields)this.initFields(config.fields)
    	if(config.datas && config.datas.length != 0) {
    		this.loadData(config.datas);
    		//this.locate(this.currentIndex); //不确定有没有影响
    	}
    },
    destroy : function(){
    	Aurora.CmpManager.remove(this.id);
    	delete Aurora.invalidRecords[this.id]
    },
    reConfig : function(config){
    	this.resetConfig();
    	Ext.apply(this, config);
    },
    bind : function(name, ds){
    	if(this.fields[name]) {
    		alert('重复绑定 ' + name);
    		return;
    	}
    	ds.un('beforecreate', this.beforeCreate, this);
    	ds.un('add', this.bindDataSetPrototype, this);
    	ds.un('remove', this.bindDataSetPrototype, this);
    	ds.un('update', this.bindDataSetPrototype, this);
		ds.un('clear', this.bindDataSetPrototype, this);
		ds.un('load', this.bindDataSetPrototype, this);
		ds.un('reject', this.bindDataSetPrototype, this);
    	
    	ds.on('beforecreate', this.beforeCreate, this);
    	ds.on('add', this.bindDataSetPrototype, this);
    	ds.on('remove', this.bindDataSetPrototype, this);
    	ds.on('update', this.bindDataSetPrototype, this);
		ds.on('clear', this.bindDataSetPrototype, this);
		ds.on('load', this.bindDataSetPrototype, this);
		ds.on('reject', this.bindDataSetPrototype, this);
    	
    	var field = new Aurora.Record.Field({
    		name:name,
    		type:'dataset',
    		dataset:ds
    	});    	
	    this.fields[field.name] = field;
    },
   	bindDataSetPrototype: function(clear){
    	var record = this.getCurrentRecord();
    	if(!record)return;
    	for(var k in this.fields){
    		var field = this.fields[k];
    		if(field.type == 'dataset'){    			
    			var ds = field.pro['dataset'];
    			if(clear===true)ds.resetConfig()
    			record.data[field.name] = ds.getConfig();    			
    		}
    	}
    },
    beforeCreate: function(ds, record, index){
    	if(this.data.length == 0){
    		this.create({},false)
	    	this.bindDataSetPrototype(true);
    	}
    },
    resetConfig : function(){
    	this.data = [];
    	this.gotoPage = 1;
    	this.currentPage = 1;
    	this.currentIndex = 1;
    	this.totalCount = 0;
    	this.totalPage = 0;
    	this.isValid = true;
    },
    getConfig : function(){
    	var c = {};
    	c.id = this.id;
    	c.xtype = 'dataset';
    	c.data = this.data;
    	c.isValid = this.isValid;
    	c.gotoPage = this.gotoPage;
    	c.currentPage = this.currentPage;
    	c.currentIndex = this.currentIndex;
    	c.totalCount = this.totalCount;
    	c.totalPage = this.totalPage;
    	return c;
    },
    initEvents : function(){
    	this.addEvents(
    		'beforecreate',
	        'metachange',
	        'fieldchange',
	        'add',
	        'remove',
	        'update',
	        'clear',
	        'load',
	        'refresh',
	        'valid',
	        'indexchange',
	        'reject',
	        'submitsuccess',
	        'submitfailed'
		);    	
    },
    initFields : function(fields){
    	for(var i = 0, len = fields.length; i < len; i++){
    		var field = new Aurora.Record.Field(fields[i]);
	        this.fields[field.name] = field;
        }
    },
    getField : function(name){
    	return this.fields[name];
    },
    loadData : function(datas, num){
        this.data = [];
        if(num) {
        	this.totalCount = num;
        }else{
        	this.totalCount = datas.length;
        }
    	this.totalPage = Math.ceil(this.totalCount/this.pageSize)
    	for(var i = 0, len = datas.length; i < len; i++){
    		var data = datas[i].data||datas[i];
    		for(var key in this.fields){
    			var field = this.fields[key];
    			var datatype = field.getPropertity('datatype');
    			switch(datatype){
    				case 'date':
    					data[key] = Aurora.parseDate(data[key]);
    					break;
    				case 'int':
    					data[key] = parseInt(data[key]);
    					break;
    			}
    		}
    		var record = new Aurora.Record(data,datas[i].field);
            record.setDataSet(this);
	        this.data.add(record);
        }
        this.fireEvent("load", this);
    },
    
    /** ------------------数据操作------------------ **/ 
    create : function(data, valid){
    	this.fireEvent("beforecreate", this);
//    	if(valid !== false) if(!this.validCurrent())return;
    	var record = new Aurora.Record(data||{});
        this.add(record); 
        var index = (this.currentPage-1)*this.pageSize + this.data.length;
        this.locate(index, true);
        return record;
    },
    getNewRecrods: function(){
        var records = this.getAll();
        var news = [];
       	for(var k = 0,l=records.length;k<l;k++){
			var record = records[k];
			if(record.isNewRecord == true){
				news.add(record);
			}
		}
		return news;
    },
//    validCurrent : function(){
//    	var c = this.getCurrentRecord();
//    	if(c==null)return true;
//    	return c.validateRecord();
//    },
    add : function(record){
    	record.isNew = true;
    	record.isNewRecord = true;
        record.setDataSet(this);
        var index = this.data.length;
        this.data.add(record);
//        for(var k in this.fields){
//    		var field = this.fields[k];
//    		if(field.type == 'dataset'){    			
//    			var ds = field.pro['dataset'];
//    			ds.resetConfig()   			
//    		}
//    	}
        this.fireEvent("add", this, record, index);
    },

    getCurrentRecord : function(){
    	if(this.data.length ==0) return null;
    	return this.data[this.currentIndex - (this.currentPage-1)*this.pageSize -1];
    },
    insert : function(index, records){
        records = [].concat(records);
        var splice = this.data.splice(index,this.data.length);
        for(var i = 0, len = records.length; i < len; i++){
            records[i].setDataSet(this);
            this.data.add(records[i]);
        }
        this.data = this.data.concat(splice);
        this.fireEvent("add", this, records, index);
    },
    remove : function(record){  
    	if(!record){
    		record = this.getCurrentRecord();
    	}
    	if(!record)return;
    	if(record.isNew){
    		this.removeLocal(record);
    	}else{
    		this.removeRemote(record);
    	}
    },
    removeRemote: function(r){
    	if(this.submitUrl == '') return;
    	
    	var d = Ext.apply({}, r.data);
		d['_id'] = r.id;
		d['_status'] = 'delete';
    	var p = [d];
    	for(var i=0;i<p.length;i++){
    		p[i] = Ext.apply(p[i],this.spara)
    	}
    	if(p.length > 0) {
	    	Aurora.request(this.submitUrl, p, this.onRemoveSuccess, this.onSubmitFailed, this);
    	}
    
    },
    onRemoveSuccess: function(res){
    	if(res.result.record){
    		var datas = [].concat(res.result.record);
    		for(var i=0;i<datas.length;i++){
    			var data = datas[i];
	    		var r = this.findById(data['_id']);
	    		this.removeLocal(r);
    		}
    	}
    },
    removeLocal: function(record){
    	Aurora.removeInvalidReocrd(this.id, record)
    	var index = this.data.indexOf(record);    	
    	if(index == -1)return;
        this.data.remove(record);
        if(this.data.length == 0){
        	this.removeAll();
        	return;
        }
        var lindex = this.currentIndex - (this.currentPage-1)*this.pageSize;
        if(lindex<0)return;
        if(lindex<=this.data.length){
        	this.locate(this.currentIndex,true);
        }else{
        	this.pre();
        }
//        if(this.currentIndex<=this.data.length){
////        	this.next();
//        	this.locate(this.currentIndex,true);
//        }else{
////        	this.pre();
//        	var index = this.currentIndex-1;
//        	if(index>=0)
//        	this.locate(index,true);
//        }
        this.fireEvent("remove", this, record, index);    	
    },
    getAll : function(){
    	return this.data;    	
    },
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
    removeAll : function(){
    	this.currentIndex = 1;
        this.data = [];
        this.fireEvent("clear", this);
    },
    indexOf : function(record){
        return this.data.indexOf(record);
    },
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
    			ds.fireEvent('refresh',ds)
    			ds.processCurrentRow();
    		}
    	}
    	if(r) this.fireEvent("indexchange", this, r);
    },
    /** ------------------导航函数------------------ **/
    locate : function(index, force){
    	if(this.currentIndex == index && force !== true) return;
//    	if(valid !== false) if(!this.validCurrent())return;
    	if(index <=0 || (index > this.totalCount + this.getNewRecrods().length))return;
    	var lindex = index - (this.currentPage-1)*this.pageSize;
    	if(this.data[lindex - 1]){
	    	this.currentIndex = index;
    	}else{
    		if(this.isModified()){
    			Aurora.showMessage('提示', '有未保存数据!')
    		}else{
				this.currentIndex = index;
				this.currentPage =  Math.ceil(index/this.pageSize);
				this.query(this.currentPage);
				return;
    		}
    	}
    	this.processCurrentRow();
    },    
    goPage : function(page){
    	if(page >0) {
    		this.gotoPage = page;
	    	var go = (page-1)*this.pageSize + this.getNewRecrods().length +1;
//	    	var go = Math.max(0,page-2)*this.pageSize + this.data.length + 1;
	    	this.locate(go);
    	}
    },
    first : function(){
    	this.locate(1);
    },
    pre : function(){
    	this.locate(this.currentIndex-1);    	
    },
    next : function(){
    	this.locate(this.currentIndex+1);
    },
    prePage : function(){
    	this.goPage(this.currentPage -1);
    },
    nextPage : function(){
    	this.goPage(this.currentPage +1);
    },
    validate : function(fire){
    	this.isValid = true;
    	var current = this.getCurrentRecord();
    	var records = this.getAll();
		var dmap = {};
		var hassub = false;
		var unvalidRecord = null;
					
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
			if(record.dirty == true || record.isNew == true) {
				if(!record.validateRecord()){
					this.isValid = false;
					unvalidRecord = record;
					Aurora.addInValidReocrd(this.id, record);
				}else{
					Aurora.removeInvalidReocrd(this.id, record);
				}
				if(this.isValid == false) {
					if(hassub)break;
				}else {
					for(key in dmap){
						var ds = dmap[key];
						ds.reConfig(record.data[key]);
						if(!ds.validate(false)) {
							this.isValid = false;
							unvalidRecord = record;
						}
					}
					if(this.isValid == false) {
						break;
					}
									
				}
			}
		}
		if(unvalidRecord != null){
			var r = this.indexOf(unvalidRecord);
			if(r!=-1)this.locate(r+1);
		}
		if(fire !== false) {
			Aurora.manager.fireEvent('valid', Aurora.manager, this, this.isValid);
		}
		return this.isValid;
    },
    /** ------------------ajax函数------------------ **/
    setQueryUrl : function(url){
    	this.queryUrl = url;
    },
    setQueryParameter : function(para, value){
        this.qpara[para] = value;
    },
    setQueryDataSet : function(ds){ 
    	this.qds = ds;
    	if(this.qds.getCurrentRecord() == null) this.qds.create();
    },
    setSubmitUrl : function(url){
    	this.submitUrl = url;
    },
    setSubmitParameter : function(para, value){
        this.spara[para] = value;
    },
    query : function(page){
    	var r;
    	if(this.qds) {
    		if(this.qds.getCurrentRecord() == null) this.qds.create();
    		if(!this.qds.validate()) return;
    		r = this.qds.getCurrentRecord();
    	}
    	if(!this.queryUrl) return;
    	if(!page) this.currentIndex = 1;
    	this.currentPage = page || 1;
    	
    	var q = {};
    	if(r != null) Ext.apply(q, r.data);
    	Ext.apply(q, this.qpara);
    	var para = 'pagesize='+this.pageSize + 
    				  '&pagenum='+this.currentPage+
    				  '&_fecthall='+this.fetchAll+
    				  '&_autocount='+this.autoCount+
    				  '&_rootpath=list'
    	var url = '';
    	if(this.queryUrl.indexOf('?') == -1){
    		url = this.queryUrl + '?' + para;
    	}else{
    		url = this.queryUrl + '&' + para;
    	}
    	this.loading = true;
    	Aurora.request(url, q, this.onLoadSuccess, this.onLoadFailed, this);
    },
    isModified : function(){
    	var modified = false;
    	var records = this.getAll();
		for(var k = 0,l=records.length;k<l;k++){
			var record = records[k];
			if(record.dirty == true || record.isNew == true) {
				modified = true;
				break;
			}       			
		}
		return modified;
    },
    isDataModified : function(){
    	var modified = false;
    	for(var i=0,l=this.data.length;i<l;i++){
    		var r = this.data[i];    		
    		if(r.dirty || r.isNew){
    			modified = true;
    			break;
    		}
    	}
    	return modified;
    },
    getJsonData : function(){
    	var datas = [];
    	for(var i=0,l=this.data.length;i<l;i++){
    		var r = this.data[i];
    		var isAdd = r.dirty || r.isNew
			var d = Ext.apply({}, r.data);
			d['_id'] = r.id;
			d['_status'] = r.isNew ? 'new' : 'update';
			for(var k in r.data){
				var item = d[k]; 
				if(item && item.xtype == 'dataset'){
					var ds =$(item.id);
					ds.reConfig(item)
					isAdd = isAdd == false ? ds.isDataModified() :isAdd;
					d[k] = ds.getJsonData();
				}
			}
    		if(isAdd){
	    		datas.push(d);    			
			}
    	}
    	
    	return datas;
    },
    submit : function(url){
    	if(!this.validate()){
//    		Aurora.showMessage('提示', '验证不通过!');
    		return;
    	}
    	this.submitUrl = url||this.submitUrl;
    	if(this.submitUrl == '') return;
    	var p = this.getJsonData();
    	for(var i=0;i<p.length;i++){
    		p[i] = Ext.apply(p[i],this.spara)
    	}
    	if(p.length > 0) {
	    	Aurora.request(this.submitUrl, p, this.onSubmitSuccess, this.onSubmitFailed, this);
    	}
    },
    
    /** ------------------事件函数------------------ **/
    afterEdit : function(record, name, value) {
        this.fireEvent("update", this, record, name, value);
    },
    afterReject : function(record){
    	this.fireEvent("reject", this, record);
    },
    onSubmitSuccess : function(res){
    	if(res.result.record){
    		var datas = [].concat(res.result.record);
    		this.refreshRecord(datas)
    	}
    	this.fireEvent('submitsuccess', this, res)
    },
    refreshRecord : function(datas){
    	//this.resetConfig();
    	for(var i=0,l=datas.length;i<l;i++){
    		var data = datas[i];
	    	var r = this.findById(data['_id']);
	    	if(!r) return;	    	
	    	for(var k in data){
	    		var field = k;
	    		if(!this.fields[k]){
	    			for(var kf in this.fields){
	    				if(k.toLowerCase() == kf.toLowerCase()){
	    					field = kf;
	    				}
	    			}
	    		}
				var f = this.fields[field];
				if(f && f.type == 'dataset'){
					var ds = f.pro['dataset'];
					if(r){
	    				ds.reConfig(r.data[f.name]);
	    			}
	    			if(data[k].record)
					ds.refreshRecord([].concat(data[k].record))
				}else{
					var ov = r.get(field);
					var nv = data[k]
					if(field == '_id' || field == '_status'||field=='__parameter_parsed__') continue;
					if(f && f.getPropertity('datatype') == 'date') 
					nv = Aurora.parseDate(nv)
					if(ov != nv) {
						r.set(field,nv);
					}
				}
	       	}
	       	r.clear();
    	}
//    	this.fireEvent("indexchange", this, this.getCurrentRecord());
    },
    onSubmitFailed : function(res){
//    	alert(res.error.message);
    	Aurora.showMessage('错误', res.error.message);
		this.fireEvent('submitfailed', this, res)   
    },
    onLoadSuccess : function(res){
    	if(res == null) return;
//    	if(!res.result.list.record) return;
    	if(!res.result.list.record) res.result.list.record = [];
    	var records = [].concat(res.result.list.record);
    	var total = res.result.list.totalCount;
    	var datas = [];
    	if(records.length > 0){
    		for(var i=0,l=records.length;i<l;i++){
	    		var item = {
	    			data:records[i]	    		
	    		}
    			datas.push(item);
    		}
    	}else if(records.length == 0){
    		this.currentIndex  = 1
    	}
    	this.loadData(datas, total);
    	this.locate(this.currentIndex,true);
	    this.loading = false;
    },
    onLoadFailed : function(res){
    	Aurora.showMessage('错误', res.error.message);
//    	alert(res.error.message)
    	this.loading = false;
    },
    onFieldChange : function(record,field,type,value) {
    	this.fireEvent('fieldchange', this, record, field, type, value)
    },
    onMetaChange : function(record,meta,type,value) {
    	this.fireEvent('metachange', this, record, meta, type, value)
    },
    onRecordValid : function(record, name, valid){
    	this.fireEvent('valid', this, record, name, valid)
    }
});


Aurora.Record = function(data, fields){
    this.id = ++Aurora.AUTO_ID;
    this.data = data;
    this.fields = {};
    this.valid = {};
    this.isValid = true;
    this.isNew = false;
	this.dirty = false;	
	this.editing = false;
	this.modified= null;
    this.meta = new Aurora.Record.Meta(this);
    if(fields)this.initFields(fields);
};
Aurora.Record.prototype = {
	clear : function() {
		this.editing = false;
		this.valid = {};
		this.isValid = true;
		this.isNew = false;
		this.dirty = false;
		this.modified = null;
	},
	initFields : function(fields){
		for(var i=0,l=fields.length;i<l;i++){
			var f = new Aurora.Record.Field(fields[i]);
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
			names.add(k.toLowerCase());
		}
		for(var k in rf){
			if(names.indexOf(k.toLowerCase()) == -1){
				names.add(k.toLowerCase());
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
		var v = this.get(name);
		var field = this.getMeta().getField(name)
//		if(!v && field.snap.required == true){
		if(!v && field.get('required') == true){
			this.valid[name] = name +　'不能为空';
			valid =  false;
		}else{
			var validator = field.snap.validator;
			var isvalid = true;
			if(validator){
				validator = window[validator];
				isvalid = validator.call(window,this, name, v);
				if(isvalid !== true){
					valid =	false;	
					this.valid[name] = isvalid;
				}
			}
		}
		if(valid==true) delete this.valid[name];
		this.ds.onRecordValid(this,name,valid)
		return valid;
	},
    setDataSet : function(ds){
        this.ds = ds;
    },
    getMeta : function(){
    	return this.meta;
    },    
	set : function(name, value){
        if(this.data[name] == value){
            return;
        }
        this.dirty = true;
        if(!this.modified){
            this.modified = {};
        }
        if(typeof this.modified[name] == 'undefined'){
            this.modified[name] = this.data[name];
        }
        this.data[name] = value;
        if(!this.editing && this.ds){
           this.ds.afterEdit(this, name, value);
        }        
        this.validate(name)
    },
    get : function(name){
        return this.data[name];
    },
    reject : function(silent){
        var m = this.modified;
        for(var n in m){
            if(typeof m[n] != "function"){
                this.data[n] = m[n];
            }
        }
        delete this.modified;
        this.editing = false;
        if(this.dirty && this.ds){
            this.ds.afterReject(this);
        }
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
    }
}
Aurora.Record.Meta = function(r){
	this.record = r;
	this.pro = {};
}
Aurora.Record.Meta.prototype = {
	clear : function(){
		this.pro = {};
		this.record.onMetaClear(this);
	},
	getField : function(name){
    	var f = this.record.fields[name];
		var df = this.record.ds.fields[name];
		var rf;
    	if(!f){
    		if(df){
    			f = new Aurora.Record.Field({name:df.name,type:df.type});
    		}else{
    			f = new Aurora.Record.Field({name:name,type:'string'});//
    		}
			f.record = this.record;
			this.record.fields[f.name]=f;
    	}
    	
    	var pro = {};
    	if(df) pro = Ext.apply(pro, df.pro);
    	pro = Ext.apply(pro, this.pro);
    	pro = Ext.apply(pro, f.pro);
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

Aurora.Record.Field = function(c){
    this.name = c.name;
    this.type = c.type;
    this.pro = c||{};
    this.record;
};
Aurora.Record.Field.prototype = {
	clear : function(){
		this.pro = {};
		this.record.onFieldClear(this.name);
	},
	setPropertity : function(value,type) {
		var op = this.pro[type];
		if(op !== value){
			this.pro[type] = value;
			this.record.onFieldChange(this.name, type, value);
		}
	},
	get : function(name){
		var v = null;
		if(this.snap){
			v = this.snap[name];
		}
		return v;
	},
	getPropertity : function(name){
		return this.pro[name]
	},
	setRequired : function(r){
		this.setPropertity(r, 'required');
	},
	setReadOnly : function(r){	
		this.setPropertity(r, 'readonly');
	},
	setOptions : function(r){
		this.setPropertity(r, 'options');
	},
	getOptions : function(){
		return this.getPropertity('options');
	}
}
Aurora.Component = Ext.extend(Ext.util.Observable,{
	constructor: function(config) {
        Aurora.Component.superclass.constructor.call(this);
        this.id = config.id || Ext.id();
        Aurora.CmpManager.put(this.id,this)
		this.initConfig=config;
		this.isHidden = false;
		this.isFireEvent = false;
		this.initComponent(config);
        this.initEvents();
    },
    initComponent : function(config){ 
		config = config || {};
        Ext.apply(this, config);
        this.wrap = Ext.get(this.id);
    },
    initEvents : function(){
    	this.addEvents('focus','blur','change','invalid','valid','mouseover','mouseout');  
    	this.wrap.on("mouseover", this.onMouseOver, this);
        this.wrap.on("mouseout", this.onMouseOut, this);
    },
    isEventFromComponent:function(el){
    	return this.wrap.contains(el)
    },
    move: function(x,y){
		this.wrap.setX(x);
		this.wrap.setY(y);
	},
	getBindName: function(){
		return this.binder ? this.binder.name : null;
	},
	getBindDataSet: function(){
		return this.binder ? this.binder.ds : null;
	},
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
    	ds.on('fieldchange', this.onFieldChange, this);
    	ds.on('indexchange', this.onRefresh, this);
    	this.onRefresh(ds)
    },
    clearBind : function(){
    	if(this.binder) {
    		var bds = this.binder.ds;
    		bds.un('metachange', this.onRefresh, this);
	    	bds.un('valid', this.onValid, this);
	    	bds.un('remove', this.onRemove, this);
	    	bds.un('clear', this.onClear, this);
	    	bds.un('update', this.onUpdate, this);
	    	bds.un('fieldchange', this.onFieldChange, this);
	    	bds.un('indexchange', this.onRefresh, this);
    	} 
		this.binder = null; 
		this.record = null;
    },
    destroy : function(){
    	this.wrap.un("mouseover", this.onMouseOver, this);
        this.wrap.un("mouseout", this.onMouseOut, this);
    	Aurora.CmpManager.remove(this.id);
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
//    	this.fireEvent('valid', this, this.record, this.binder.name)
    },
    onRefresh : function(ds){
    	
    	if(this.isFireEvent == true || this.isHidden == true) return;
//    	if(this.isHidden == true) return; 
    	this.clearInvalid();
		this.rerender(ds.getCurrentRecord());
    },
    rerender : function(record){
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
//			Ext.get('console').update(Ext.get('console').dom.innerHTML + ' | ' + this.record.id + ' onRefresh')
			
			if(this.value == value) return;
			this.setValue(value,true);
		}else{
			this.setValue('',true);
		}
    },
    onValid : function(ds, record, name, valid){
    	if(this.binder.ds == ds && this.binder.name.toLowerCase() == name.toLowerCase() && this.record == record){
	    	if(valid){
	    		this.fireEvent('valid', this, this.record, this.binder.name)
    			this.clearInvalid();
	    	}else{
	    		this.fireEvent('invalid', this, this.record, this.binder.name);
	    		this.markInvalid();
	    	}
    	}    	
    },
    onUpdate : function(ds, record, name, value){
    	if(this.binder.ds == ds && this.binder.name.toLowerCase() == name.toLowerCase()){
	    	this.setValue(value, true);
    	}
    },
    onFieldChange : function(ds, record, field){
    	if(this.binder.ds == ds && this.binder.name == field.name){
	    	this.onRefresh(ds);   	
    	}
    },
    onClear : function(ds){
    	this.clearValue();    
    },    
    setValue : function(v, silent){
    	this.value = v;
    	if(silent === true)return;
    	if(this.binder){
    		this.record = this.binder.ds.getCurrentRecord();
    		if(this.record == null){    			
    			//TODO:应该先create()再编辑
    			var data = {};
    			data[this.binder.name] = v;
    			this.record = this.binder.ds.create(data,false);
    			this.record.validate(this.binder.name);
    		}else{
    			this.record.set(this.binder.name,v);
	    		if(v=='') delete this.record.data[this.binder.name];	    		
    		}
    	}
    },
    clearInvalid : function(){},
    markInvalid : function(){},
    clearValue : function(){},
    initMeta : function(){},
    setDefault : function(){},
    setRequired : function(){},
    onDataChange : function(){}
});

Aurora.Field = Ext.extend(Aurora.Component,{	
	validators: [],
	requiredCss:'item-notBlank',
	focusCss:'item-focus',
	readOnlyCss:'item-readOnly',
	emptyTextCss:'item-emptyText',
	invalidCss:'item-invalid',
	constructor: function(config) {
		config.required = config.required || false;
		config.readonly = config.readonly || false;
        Aurora.Field.superclass.constructor.call(this, config);
    },
    initComponent : function(config){
    	Aurora.Field.superclass.initComponent.call(this, config);
        this.el = this.wrap.child('input[atype=field.input]'); 
    	this.originalValue = this.getValue();
    	this.applyEmptyText();
    	this.initStatus();
    	if(this.hidden == true){
    		this.setVisible(false)
    	}
    },
    initEvents : function(){
    	Aurora.Field.superclass.initEvents.call(this);
        this.addEvents('keydown','keyup','keypress');
//    	this.el.on(Ext.isIE || Ext.isSafari3 ? "keydown" : "keypress", this.fireKey,  this);
    	this.el.on("focus", this.onFocus,  this);
    	this.el.on("blur", this.onBlur,  this);
    	this.el.on("change", this.onChange, this);
    	this.el.on("keyup", this.onKeyUp, this);
        this.el.on("keydown", this.onKeyDown, this);
        this.el.on("keypress", this.onKeyPress, this);
//        this.el.on("mouseover", this.onMouseOver, this);
//        this.el.on("mouseout", this.onMouseOut, this);
    },
    destroy : function(){
    	Aurora.Field.superclass.destroy.call(this);
//    	this.el.un(Ext.isIE || Ext.isSafari3 ? "keydown" : "keypress", this.fireKey,  this);
    	this.el.un("focus", this.onFocus,  this);
    	this.el.un("blur", this.onBlur,  this);
    	this.el.un("change", this.onChange, this);
    	this.el.un("keyup", this.onKeyUp, this);
        this.el.un("keydown", this.onKeyDown, this);
        this.el.un("keypress", this.onKeyPress, this);
//        this.el.un("mouseover", this.onMouseOver, this);
//        this.el.un("mouseout", this.onMouseOut, this);
    	delete this.el;
    },
	setWidth: function(w){
		this.wrap.setStyle("width",(w+3)+"px");
		this.el.setStyle("width",w+"px");
	},
	setHeight: function(h){
		this.wrap.setStyle("height",h+"px");
		this.el.setStyle("height",(h-1)+"px");
	},
	setVisible: function(v){
		if(v==true)
			this.wrap.show();
		else
			this.wrap.hide();
	},
    initStatus : function(){
    	this.clearInvalid();
    	this.setRequired(this.required);
    	this.setReadOnly(this.readonly);
    },
//    onMouseOver : function(e){
//    	Aurora.ToolTip.show(this.id, "测试");
//    },
//    onMouseOut : function(e){
//    	Aurora.ToolTip.hide();
//    },
    onChange : function(e){
//    	this.setValue(this.getValue());    
    },
    onKeyUp : function(e){
        this.fireEvent('keyup', this, e);
    },
    onKeyDown : function(e){
        this.fireEvent('keydown', this, e);
        if(e.keyCode == 13 || e.keyCode == 27) {
        	this.blur();
        }
    },
    onKeyPress : function(e){
        this.fireEvent('keypress', this, e);
    },
//    fireKey : function(e){
//      this.fireEvent("keydown", this, e);
//    },
    onFocus : function(e){
    	if(this.readonly) return;
        if(!this.hasFocus){
            this.hasFocus = true;
            this.startValue = this.getValue();
            if(this.emptytext){
	            if(this.el.dom.value == this.emptytext){
	                this.setRawValue('');
	            }
	            this.wrap.removeClass(this.emptyTextCss);
	        }
	        this.wrap.addClass(this.focusCss);
            this.select();
            this.fireEvent("focus", this);
        }
    },
    processValue : function(v){
    	return v;
    },
    onBlur : function(e){
    	if(this.readonly) return;
    	if(this.hasFocus){
	        this.hasFocus = false;
	//        this.validate();
	        var rv = this.getRawValue();
	        rv = this.processValue(rv);
	        if(String(rv) !== String(this.startValue)){
	            this.fireEvent('change', this, rv, this.startValue);
	        }
	//        this.applyEmptyText();
	        
	        this.setValue(rv);
	        this.wrap.removeClass(this.focusCss);
	        this.fireEvent("blur", this);
    	}
    },
    setValue : function(v, silent){
    	Aurora.Field.superclass.setValue.call(this,v, silent);
    	if(this.emptytext && this.el && v !== undefined && v !== null && v !== ''){
            this.wrap.removeClass(this.emptyTextCss);
        }
        this.setRawValue(this.formatValue((v === null || v === undefined ? '' : v)));
//        this.el.dom.value = this.formatValue((v === null || v === undefined ? '' : v));
        this.applyEmptyText();
    },
    formatValue : function(v){
    	return v;
    },
    getRawValue : function(){
        var v = this.el.getValue();
        if(v === this.emptytext || v === undefined){
            v = '';
        }
        return v;
    },
    getValue : function(){
    	var v= this.value;
		v=(v === null || v === undefined ? '' : v);
		return v;
    },
    setRequired : function(required){
    	if(this.crrentRequired == required)return;
		this.clearInvalid();    	
    	this.crrentRequired = required;
    	if(required){
    		this.wrap.addClass(this.requiredCss);
    	}else{
    		this.wrap.removeClass(this.requiredCss);
    	}
    },
    setReadOnly : function(readonly){
    	if(this.currentReadOnly == readonly)return;
    	this.currentReadOnly = readonly;
    	this.el.dom.readOnly = readonly;
    	if(readonly){
    		this.wrap.addClass(this.readOnlyCss);
    	}else{
    		this.wrap.removeClass(this.readOnlyCss);
    	}
    },
    applyEmptyText : function(){
        if(this.emptytext && this.getRawValue().length < 1){
            this.setRawValue(this.emptytext);
            this.wrap.addClass(this.emptyTextCss);
        }
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
//    	this.fireEvent('invalid', this, msg);
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
    	var v = this.getRawValue();
        if(v.length > 0){
            start = start === undefined ? 0 : start;
            end = end === undefined ? v.length : end;
            var d = this.el.dom;
            if(d.setSelectionRange){  
                d.setSelectionRange(start, end);
            }else if(d.createTextRange){
                var range = d.createTextRange();
                range.moveStart("character", start);
                range.moveEnd("character", end-v.length);
                range.select();
            }
        }
    },
    setRawValue : function(v){
//    	if(this.id='empno')debugger
        return this.el.dom.value = (v === null || v === undefined ? '' : v);
    },
    reset : function(){
    	this.setValue(this.originalValue);
        this.clearInvalid();
        this.applyEmptyText();
    },
    focus : function(){
    	if(this.readonly) return;
    	this.el.dom.focus();
    },
    blur : function(){
    	if(this.readonly) return;
    	this.el.blur();
    },
    clearValue : function(){
    	this.setValue('', true);
    	this.clearInvalid();
        this.applyEmptyText();
    }
})
Aurora.Box = Ext.extend(Aurora.Component,{
	constructor: function(config) {
        this.errors = [];
        Aurora.Box.superclass.constructor.call(this,config);
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
    onValid : function(cmp, record, name){
    	this.clearError(cmp.id);
    },
    onInvalid : function(cmp, record, name){
    	var error = record.errors[name];
    	if(error){
    		this.showError(cmp.id,error.message)
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
Aurora.Button = Ext.extend(Aurora.Component,{
	disableCss:'item-btn-disabled',
	overCss:'item-btn-over',
	pressCss:'item-btn-pressed',
	constructor: function(config) {
        Aurora.Button.superclass.constructor.call(this, config);
    },
	initComponent : function(config){
    	Aurora.Button.superclass.initComponent.call(this, config);
    	this.el = this.wrap.child('button[atype=btn]');
    	if(this.hidden == true){
    		this.setVisible(false)
    	}
    },
    initEvents : function(){
    	Aurora.Button.superclass.initEvents.call(this);
    	this.addEvents('click');  
        this.el.on("click", this.onClick,  this);
        this.el.on("mousedown", this.onMouseDown,  this);
    },
    setVisible: function(v){
		if(v==true)
			this.wrap.show();
		else
			this.wrap.hide();
	},
    destroy : function(){
    	Aurora.Button.superclass.destroy.call(this);
    	this.el.un("click", this.onClick,  this);
    	delete this.el;
    },
    disable: function(){
    	this.wrap.addClass(this.disableCss);
    	this.el.dom.disabled = true;
    },
    enable: function(){
    	this.wrap.removeClass(this.disableCss);
    	this.el.dom.disabled = false;
    },
    onMouseDown: function(e){
    	this.wrap.addClass(this.pressCss);
    	Ext.get(document.documentElement).on("mouseup", this.onMouseUp, this);
    },
    onMouseUp: function(e){
    	Ext.get(document.documentElement).un("mouseup", this.onMouseUp, this);
    	this.wrap.removeClass(this.pressCss);
    },
    onClick: function(e){
    	this.fireEvent("click", this);
    },
    onMouseOver: function(e){
    	this.wrap.addClass(this.overCss);
    },
    onMouseOut: function(e){
    	this.wrap.removeClass(this.overCss);
    }
});
Aurora.TextField = Ext.extend(Aurora.Field,{
	constructor: function(config) {
        Aurora.TextField.superclass.constructor.call(this, config);        
    },
    initComponent : function(config){
    	Aurora.TextField.superclass.initComponent.call(this, config);    	
    },
    initEvents : function(){
    	Aurora.TextField.superclass.initEvents.call(this);    	
    }
//    ,getValue : function(){
//    	return this.getRawValue();
//    }
})
Aurora.TriggerField = Ext.extend(Aurora.TextField,{
	constructor: function(config) {
        Aurora.TriggerField.superclass.constructor.call(this, config);
    },
    initComponent : function(config){
    	Aurora.TriggerField.superclass.initComponent.call(this, config);
    	this.trigger = this.wrap.child('div[atype=triggerfield.trigger]'); 
    	this.initPopup();
    },
    initPopup: function(){
    	if(this.initpopuped == true) return;
    	this.popup = this.wrap.child('div[atype=triggerfield.popup]');
    	this.shadow = this.wrap.child('div[atype=triggerfield.shadow]');
//    	var sf = this;
    	Ext.getBody().insertFirst(this.popup)
    	Ext.getBody().insertFirst(this.shadow)    	
//    	Ext.onReady(function(){
//    		Ext.getBody().appendChild(sf.popup);
//    		Ext.getBody().appendChild(sf.shadow)
//    	})
		
    	this.initpopuped = true
    },
    initEvents : function(){
    	Aurora.TriggerField.superclass.initEvents.call(this);    
    	this.trigger.on('click',this.onTriggerClick, this, {preventDefault:true})
    },
    isExpanded : function(){ 
    	var xy = this.popup.getXY();
    	return !(xy[0]==-1000||xy[1]==-1000)
//        return this.popup && this.popup.isVisible();
    },
    setWidth: function(w){
		this.wrap.setStyle("width",(w+3)+"px");
		this.el.setStyle("width",(w-20)+"px");
	},
    onFocus : function(){
    	if(this.readonly) return;
        Aurora.TriggerField.superclass.onFocus.call(this);
        if(!this.isExpanded())this.expand();
    },
    onBlur : function(){
//    	if(!this.isExpanded()){
	    	this.hasFocus = false;
	        this.wrap.removeClass(this.focusCss);
	        this.fireEvent("blur", this);
//    	}
    },
    onKeyDown: function(e){
    	Aurora.TriggerField.superclass.onKeyDown.call(this,e);
    	if(e.browserEvent.keyCode == 9 || e.keyCode == 27) {
        	if(this.isExpanded()){
	    		this.collapse();
	    	}
        }
    },
    isEventFromComponent:function(el){
    	var isfrom = Aurora.TriggerField.superclass.isEventFromComponent.call(this,el);
    	return isfrom || this.popup.contains(el);
    },
	destroy : function(){
		if(this.isExpanded()){
    		this.collapse();
    	}
    	this.trigger.un('click',this.onTriggerClick, this)
    	delete this.trigger;
    	delete this.popup;
    	Aurora.TriggerField.superclass.destroy.call(this);
	},
    triggerBlur : function(e){
    	if(!this.popup.contains(e.target) && !this.wrap.contains(e.target)){    		
            if(this.isExpanded()){
	    		this.collapse();
	    	}	    	
        }
    },
    setVisible : function(v){
    	Aurora.TriggerField.superclass.setVisible.call(this,v);
    	if(v == false && this.isExpanded()){
    		this.collapse();
    	}
    },
    collapse : function(){
    	Ext.get(document.documentElement).un("mousedown", this.triggerBlur, this);
    	this.popup.moveTo(-1000,-1000);
    	this.shadow.moveTo(-1000,-1000);
    },
    expand : function(){
//    	Ext.get(document.documentElement).on("mousedown", this.triggerBlur, this, {delay: 10});
    	Ext.get(document.documentElement).on("mousedown", this.triggerBlur, this);
    	var xy = this.wrap.getXY();
    	this.popup.moveTo(xy[0],xy[1]+23);
    	this.shadow.moveTo(xy[0]+3,xy[1]+26);
    },
    onTriggerClick : function(){
    	if(this.readonly) return;
    	if(this.isExpanded()){
    		this.collapse();
    	}else{
	    	this.el.focus();
    		this.expand();
    	}
    }
});
Aurora.ComboBox = Ext.extend(Aurora.TriggerField, {	
	maxHeight:200,
	blankOption:true,
	rendered:false,
	selectedClass:'item-comboBox-selected',	
	currentNodeClass:'item-comboBox-current',
	constructor : function(config) {
		Aurora.ComboBox.superclass.constructor.call(this, config);		
	},
	initComponent:function(config){
		Aurora.ComboBox.superclass.initComponent.call(this, config);
		//if(config.options) 
		this.setOptions(config.options);		
	},
	initEvents:function(){
		Aurora.ComboBox.superclass.initEvents.call(this);
		this.addEvents('select');
	},
	onTriggerClick : function() {
		this.doQuery('',true);
		Aurora.ComboBox.superclass.onTriggerClick.call(this);		
	},
	onBlur : function(){
		Aurora.ComboBox.superclass.onBlur.call(this);
		if(!this.isExpanded()) {
			var raw = this.getRawValue();
			var record = this.getRecordByDisplay(raw);
			if(record != null){
				this.setValue(record.get(this.valuefield));
			}else {
				this.setValue('');
			}
		}
    },
    getRecordByDisplay: function(name){
    	if(!this.optionDataSet)return null;
    	var datas = this.optionDataSet.getAll();
		var l=datas.length;
		var record = null;
		for(var i=0;i<l;i++){
			var r = datas[i];
			var d = r.get(this.displayfield);
			if(d == name){
				record = r;
				break;
			}
		}
		return record;
    },
	expand:function(){
		if(!this.optionDataSet)return;
		if(this.rendered===false)this.initQuery();
		this.popup.setStyle('width',this.wrap.getStyle('width'));
		Aurora.ComboBox.superclass.expand.call(this);
		var v=this.getValue();
		this.currentIndex = this.getIndex(v);
		if(!this.currentIndex) return;
		if (!Ext.isEmpty(v)) {				
			if(this.selectedIndex)Ext.fly(this.getNode(this.selectedIndex)).removeClass(this.selectedClass);
			Ext.fly(this.getNode(this.currentIndex)).addClass(this.currentNodeClass);
			this.selectedIndex = this.currentIndex;
		}		
	},
	collapse:function(){
		Aurora.ComboBox.superclass.collapse.call(this);
		if(this.currentIndex!==undefined)
		Ext.fly(this.getNode(this.currentIndex)).removeClass(this.currentNodeClass);		
	},
	setOptions : function(name){
		var ds = name
		if(typeof(name)==='string'){
			ds = $(name);
		}
		if(this.currentOptions != ds){
			this.optionDataSet = ds;
			this.rendered = false;
			this.currentOptions = ds;
		}
		if(!Ext.isEmpty(this.value))this.setValue(this.value, true)
	},
	onRender:function(){			
        if(!this.view){
        	this.popup.update('<ul></ul>');
			this.view=this.popup.child('ul');
			this.view.on('click', this.onViewClick,this);
//			this.view.on('mouseover',this.onViewOver,this);
			this.view.on('mousemove',this.onViewMove,this);
        }
        
        if(this.rendered===false && this.optionDataSet){
			this.initList();
			var l = this.optionDataSet.getAll().length;
			var widthArray = [];
			for(var i=0;i<l;i++){
				var li=this.view.dom.childNodes[i];
				var width=Aurora.TextMetrics.measure(li,li.innerHTML).width;
				widthArray.push(width);
			}		
			if(l==0){				
//				this.popup.setHeight(this.miniHeight);
//				this.popup.setWidth(this.wrap.getWidth());
			}else{
				widthArray=widthArray.sort(function(a,b){return a-b});
				var maxWdith=widthArray[l-1]+20;			
				this.popup.setWidth(Math.max(this.wrap.getWidth(),maxWdith));
				if(this.popup.getHeight()>this.maxHeight){				
					this.popup.setHeight(this.maxHeight);
				}
				var w = this.popup.getWidth();
		    	var h = this.popup.getHeight();
		    	this.shadow.setWidth(w);
		    	this.shadow.setHeight(h);
			}
			this.rendered = true;
		}       
	},
	onViewClick:function(e,t){
		if(t.tagName!='LI'){
		    return;
		}		
		this.onSelect(t);
		this.collapse();		
	},	
	onViewOver:function(e,t){
		this.inKeyMode = false;
	},
	onViewMove:function(e,t){
		if(this.inKeyMode){ // prevent key nav and mouse over conflicts
            return;
        }
        var index = t.tabIndex;        
        this.selectItem(index);        
	},
	onSelect:function(target){
//		var value =target.attributes['itemValue'].value;
		var index = target.tabIndex
		var value = this.optionDataSet.getAt(index).get(this.valuefield);
		this.setValue(value);
		this.fireEvent('select',this, value);
//		this.focus()
	},
	initQuery:function(){//事件定义中调用
		this.doQuery(this.getText());
	},
	doQuery : function(q,forceAll) {		
		if(q === undefined || q === null){
			q = '';
	    }		
//		if(forceAll){
//            this.store.clearFilter();
//        }else{
//            this.store.filter(this.displayField, q);
//        }
        
		//值过滤先不添加
		this.onRender();	
	},
	initList: function(){	
		this.refresh();
		this.litp=new Ext.Template('<li tabIndex="{index}" itemValue="{'+this.valuefield+'}">{'+this.displayfield+'}&#160;</li>');
		var datas = this.optionDataSet.getAll();
		var l=datas.length;
		var sb = [];
		for(var i=0;i<l;i++){
			var d = Ext.apply(datas[i].data, {index:i})
			sb.add(this.litp.applyTemplate(d));	//等数据源明确以后再修改		
		}
		if(l!=0){
			this.view.update(sb.join(''));			
		}
	},
	refresh:function(){
		this.view.update('');
		this.selectedIndex = null;
	},
	selectItem:function(index){
		if(Ext.isEmpty(index)){
			return;
		}	
		var node = this.getNode(index);			
		if(node.tabIndex!=this.selectedIndex){
			if(!Ext.isEmpty(this.selectedIndex)){							
				Ext.fly(this.getNode(this.selectedIndex)).removeClass(this.selectedClass);
			}
			this.selectedIndex=node.tabIndex;			
			Ext.fly(node).addClass(this.selectedClass);					
		}			
	},
	getNode:function(index){		
		return this.view.dom.childNodes[index];
	},	
	destroy : function(){
		if(this.view){
			this.view.un('click', this.onViewClick,this);
			this.view.un('mouseover',this.onViewOver,this);
			this.view.un('mousemove',this.onViewMove,this);
		}
		delete this.view;
    	Aurora.ComboBox.superclass.destroy.call(this);
	},
	getText : function() {		
		return this.text;
	},
	processValue : function(rv){
		var r = this.optionDataSet == null ? null : this.optionDataSet.find(this.displayfield, rv);
		if(r != null){
			return r.get(this.valuefield);
		}else{
			return this.value;
		}
	},
	formatValue : function(){
		var v = this.getValue();
		var r = this.optionDataSet == null ? null : this.optionDataSet.find(this.valuefield, v);
		this.text = '';
		if(r != null){
			this.text = r.get(this.displayfield);
		}else{
//			this.text = v;
		}
		return this.text;
	},
//	setValue:function(v,silent){
//        Aurora.ComboBox.superclass.setValue.call(this, v, silent);
//	},
	getIndex:function(v){
		var datas = this.optionDataSet.getAll();		
		var l=datas.length;
		for(var i=0;i<l;i++){
			if(datas[i].data[this.valuefield]==v){				
				return i;
			}
		}
	}
});
Aurora.DateField = Ext.extend(Aurora.Component, {
	constructor: function(config) {
        Aurora.DateField.superclass.constructor.call(this,config); 
		this.draw();
    },
    initComponent : function(config){
    	Aurora.DateField.superclass.initComponent.call(this, config);
    	this.wrap = typeof(config.container) == "string" ? Ext.get(config.container) : config.container;
        this.table = this.wrap.child("table");        
        this.tbody = this.wrap.child("tbody").dom;
    	this.days = [];
    	this.selectDays = this.selectDays||[];
    	this.date = this.date||new Date();
		this.year = this.date.getFullYear();
		this.month = this.date.getMonth() + 1;
    	this.preMonthBtn = this.wrap.child("div.item-dateField-pre");
    	this.nextMonthBtn = this.wrap.child("div.item-dateField-next");
    	this.yearSpan = this.wrap.child("span.item-dateField-year");
    	this.monthSpan = this.wrap.child("span.item-dateField-month");
    },
    initEvents : function(){
    	Aurora.DateField.superclass.initEvents.call(this);    
    	this.preMonthBtn.on("click", this.preMonth, this);
    	this.nextMonthBtn.on("click", this.nextMonth, this);
    	this.table.on("click", this.onSelect, this);
    	this.table.on("mouseover", this.mouseOver, this);
    	this.table.on("mouseout", this.mouseOut, this)
    	this.addEvents('select');
    },
    destroy : function(){
    	this.preMonthBtn.un("click", this.preMonth, this);
    	this.nextMonthBtn.un("click", this.nextMonth, this);
    	this.table.un("click", this.onSelect, this);
    	this.table.un("mouseover", this.mouseOver, this);
    	this.table.un("mouseout", this.mouseOut, this)
		delete this.preMonthBtn;
    	delete this.nextMonthBtn;
    	delete this.yearSpan;
    	delete this.monthSpan; 
    	delete this.table;        
        delete this.tbody;
    	Aurora.DateField.superclass.destroy.call(this);
	},
    mouseOut: function(e){
    	if(this.overTd) Ext.fly(this.overTd).removeClass('dateover');
    },
    mouseOver: function(e){
    	if(this.overTd) Ext.fly(this.overTd).removeClass('dateover');
    	if(Ext.fly(e.target).hasClass('item-day') && e.target.date != 0){
    		this.overTd = e.target; 
    		Ext.fly(this.overTd).addClass('dateover');
    	}
    	
    },
    onSelect: function(e){
    	if(this.singleSelect === false){
    		
    	}else{
    		if(this.selectedDay) Ext.fly(this.selectedDay).removeClass('onSelect');
    		if(Ext.fly(e.target).hasClass('item-day') && e.target.date != 0){
	    		this.selectedDay = e.target; 
	    		this.onSelectDay(this.selectedDay);
	    		this.fireEvent('select', this, this.selectedDay.date);
	    	}
    	}
    },
	onSelectDay: function(o){
		if(!Ext.fly(o).hasClass('onSelect'))Ext.fly(o).addClass('onSelect');
	},
	//在选择日期触发
	onToday: function(o){
		o.className = "onToday";
	},//在当天日期触发
	afterFinish: function(){
		for(var i=0;i<this.selectDays.length;i++){
			var d = this.selectDays[i];
			if(d.getFullYear() == this.year && d.getMonth()+1 == this.month){
				this.onSelectDay(this.days[d.getDate()]);
			}
		}		
	},
    //当前月
	nowMonth: function() {
		this.predraw(new Date());
	},
	//上一月
	preMonth: function() {
		this.predraw(new Date(this.year, this.month - 2, 1));
	},
	//下一月
	nextMonth: function() {
		this.predraw(new Date(this.year, this.month, 1));
	},
	//上一年
	preYear: function() {
		this.predraw(new Date(this.year - 1, this.month - 1, 1));
	},
	//下一年
	nextYear: function() {
		this.predraw(new Date(this.year + 1, this.month - 1, 1));
	},
  	//根据日期画日历
  	predraw: function(date) {
  		if(date=='') date = new Date();
		//再设置属性
		this.year = date.getFullYear(); this.month = date.getMonth() + 1;
		//重新画日历
		this.draw();
  	},
  	//画日历
	draw: function() {
		//用来保存日期列表
		var arr = [];
		//用当月第一天在一周中的日期值作为当月离第一天的天数
		for(var i = 1, firstDay = new Date(this.year, this.month - 1, 1).getDay(); i <= firstDay; i++){ 
			arr.push(0); 
		}
		//用当月最后一天在一个月中的日期值作为当月的天数
		for(var i = 1, monthDay = new Date(this.year, this.month, 0).getDate(); i <= monthDay; i++){ 
			arr.push(i); 
		}
		//清空原来的日期对象列表
		this.days = [];
		//先清空内容再插入(ie的table不能用innerHTML)
		while(this.tbody.hasChildNodes()){ 
			this.tbody.removeChild(this.tbody.firstChild); 
		}
		
		//插入日期
//		if(!this.tbody) this.tbody = document.createElement("TBODY");
		while(arr.length){
			//每个星期插入一个tr
			var row = document.createElement("tr");
			//每个星期有7天
			for(var i = 1; i <= 7; i++){
				var cell = document.createElement("td"); 
				cell.className = "item-day";
				cell.innerHTML = "&nbsp;";
				cell.date=0;
				if(arr.length){
					var d = arr.shift();
					if(d){
						cell.innerHTML = d;
						this.days[d] = cell;
						var on = new Date(this.year, this.month - 1, d);
						cell.date=on;
						//判断是否今日
						this.isSame(on, new Date()) && this.onToday(cell);
						//判断是否选择日期
						this.selectDay && this.isSame(on, this.selectDay) && this.onSelectDay(cell);
					}
				}
				row.appendChild(cell);
			}
			this.tbody.appendChild(row);
		}
		
		
		this.yearSpan.dom.innerHTML = this.year; 
		this.monthSpan.dom.innerHTML = this.month;
		this.afterFinish();
	},
	//判断是否同一日
	isSame: function(d1, d2) {
		return (d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate());
	}
});
Aurora.DatePicker = Ext.extend(Aurora.TriggerField,{
	constructor: function(config) {
        Aurora.DatePicker.superclass.constructor.call(this, config);        
    },
    initComponent : function(config){
    	Aurora.DatePicker.superclass.initComponent.call(this,config);
    	if(!this.dateField){
    		var cfg = {id:this.id+'_df',container:this.popup}
	    	this.dateField = new Aurora.DateField(cfg);
	    	this.dateField.on("select", this.onSelect, this);
    	}
    },
    initEvents : function(){
    	Aurora.DatePicker.superclass.initEvents.call(this);
        this.addEvents('select');
    },
    onSelect: function(dateField, date){
    	this.collapse();
    	this.setValue(date);
    	this.fireEvent('select',this, date);
    },
	onBlur : function(){
		Aurora.DatePicker.superclass.onBlur.call(this);
		if(!this.isExpanded()) {
			var raw = this.getRawValue();
			if(!isNaN(new Date(raw.replace(/-/g,"/")))){
				this.setValue(new Date(raw.replace(/-/g,"/")));
			}else {
				this.setValue('');
			}
		}
    },
    formatValue : function(date){
    	if(date instanceof Date) {
    		return Aurora.formateDate(date);
    	}else{
    		return date;
    	}
    },
    expand : function(){
    	Aurora.DatePicker.superclass.expand.call(this);
    	if(this.dateField.selectDay != this.getValue()) {
    		this.dateField.selectDay = this.getValue()
    		this.dateField.predraw(this.dateField.selectDay);
    		var w = this.popup.getWidth();
	    	var h = this.popup.getHeight();
	    	this.shadow.setWidth(w);
	    	this.shadow.setHeight(h);
    	}
    	var screenHeight = Aurora.getViewportHeight();
    	var h = this.popup.getHeight();
    	var y = this.popup.getY();
    	if(y+h > screenHeight) {
    		var xy = this.wrap.getXY();
	    	this.popup.moveTo(xy[0],xy[1]-h);
	    	this.shadow.moveTo(xy[0]+3,xy[1]-h+3);
    	}
    },
    destroy : function(){
    	Aurora.DatePicker.superclass.destroy.call(this);
	}
});
Aurora.WindowManager = function(){
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

Aurora.Window = Ext.extend(Aurora.Component,{
	constructor: function(config) { 
		if(Aurora.WindowManager.get(config.id))return;
        this.draggable = true;
        this.closeable = true;
        this.modal = true;
        this.oldcmps = {};
        this.cmps = {};
        Aurora.Window.superclass.constructor.call(this,config);
    },
    initComponent : function(config){
    	Aurora.Window.superclass.initComponent.call(this, config);
    	var sf = this; 
    	Aurora.WindowManager.put(sf);
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
        	sf.load(sf.url)
        }
        sf.center();
    },
    initEvents : function(){
    	this.addEvents('close','load');
    	if(this.closeable) this.closeBtn.on("click", this.onClose,  this); 
    	this.wrap.on("click", this.toFront, this);
    	this.focusEl.on("keydown", this.handleKeyDown,  this);
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
    	this.head.on('mousedown', this.onMouseDown,this);
    },
    focus: function(){
		this.focusEl.focus();
	},
    center: function(){
    	var screenWidth = Aurora.getViewportWidth();
    	var screenHeight = Aurora.getViewportHeight();
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
			'<TR style="height:21px;" >',
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
    	var zindex = Aurora.WindowManager.getZindex();
    	if(myzindex =='auto') myzindex = 0;
    	if(myzindex < zindex) {
	    	this.wrap.setStyle('z-index', zindex+5);
	    	this.shadow.setStyle('z-index', zindex+4);
	    	if(this.modal) Aurora.Mask.mask(this.wrap);
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
    	Aurora.WindowManager.remove(this);
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
    				alert(e)
    			}
    		}
    	}
    	var wrap = this.wrap;
    	if(!wrap)return;
    	if(this.proxy) this.proxy.remove();
    	if(this.modal) Aurora.Mask.unmask(this.wrap);
    	this.wrap.un("click", this.toFront, this);
    	this.head.un('mousedown', this.onMouseDown,this);
    	this.closeBtn.un("click", this.onClose,  this);
    	delete this.title;
    	delete this.head;
    	delete this.body;
        delete this.closeBtn;
        delete this.proxy;
    	Aurora.Window.superclass.destroy.call(this);
        wrap.remove();
        this.shadow.remove();
    },
    load : function(url){
    	var cmps = Aurora.CmpManager.getAll();
    	for(var key in cmps){
    		this.oldcmps[key] = cmps[key];
    	}
    	Ext.Ajax.request({
			url: url,
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
	    	var cmps = Aurora.CmpManager.getAll();
	    	for(var key in cmps){
	    		if(sf.oldcmps[key]==null){	    			
	    			sf.cmps[key] = cmps[key];
	    		}
	    	}
	    	sf.fireEvent('load',sf)
    	});
    }
});
Aurora.showMessage = function(title, msg){
	return Aurora.showWindow(title, msg, 300, 100, 'win-alert');
}
Aurora.hideWindow = function(){
	var cmp = Aurora.CmpManager.get('aurora-msg')
	if(cmp) cmp.close();
}
Aurora.showWindow = function(title, msg, width, height, cls){
	cls = cls ||'';
	var cmp = Aurora.CmpManager.get('aurora-msg')
	if(cmp == null) {
		cmp = new Aurora.Window({id:'aurora-msg',title:title, height:height,width:width});
//		cmp.body.update('<div style="width:100%;height:100%;text-align:center;line-height:'+(height)+'px">'+msg+'</div>');
		cmp.body.update('<div class="'+cls+'">'+msg+'</div>');
	}
	return cmp;
}
Aurora.Lov = Ext.extend(Aurora.TextField,{
	constructor: function(config) {
		this.isWinOpen = false
        Aurora.Lov.superclass.constructor.call(this, config);        
    },
    initComponent : function(config){
    	Aurora.Lov.superclass.initComponent.call(this,config);
    	this.trigger = this.wrap.child('div[atype=triggerfield.trigger]'); 
    },
    initEvents : function(){
    	Aurora.TriggerField.superclass.initEvents.call(this);
    	this.addEvents('commit');
    	this.trigger.on('click',this.showLovWindow, this, {preventDefault:true})
    },
    destroy : function(){
    	Aurora.Lov.superclass.destroy.call(this);
	},
	setWidth: function(w){
		this.wrap.setStyle("width",(w+3)+"px");
		this.el.setStyle("width",(w-20)+"px");
	},
	onBlur : function(e){
		if(this.readonly) return;
		var vf = this.record ? this.record.get(this.valuefield) : null;
        var r = this.getRawValue();
        var v = this.getValue();
        var t = this.text;
        var needLookup = true;
        if(r == ''){        
        	needLookup = false;
        }else{
	        if(!Ext.isEmpty(vf) && r == t){
	        	needLookup = false;
	        }
	        else if(!this.record){
	        	needLookup = false;
	        }
	        
        }
        if(needLookup){
        	this.showLovWindow();
        }else{
        	Aurora.Lov.superclass.onBlur.call(this,e); 
        	if(r == '' && this.record)
        	this.record.set(this.valuefield,'');
        }
//        if(r !='' && (v=='' || r != t)){
////			this.hasFocus = false;
////			this.wrap.removeClass(this.focusCss);
////	        this.fireEvent("blur", this);
////        	if(!this.attachGrid)
//        	this.showLovWindow();
//        }else {
//        	Aurora.Lov.superclass.onBlur.call(this,e); 
//        	if(r == '' && this.record)
//        	this.record.set(this.valuefield,'');
//        }
	},
	onKeyDown : function(e){
        if(e.getKey() == 13) {
        	this.showLovWindow();
        }else {
        	Aurora.TriggerField.superclass.onKeyDown.call(this,e);
        }
    },
    canHide : function(){
    	return this.isWinOpen == false
    },
	commitValue:function(v, t, r){
		this.win.close();
        this.setValue(t)
        if(this.record)
		this.record.set(this.valuefield, v);
		this.fireEvent('commit', this, v, t, r)
	},
	setValue: function(v, silent){
		Aurora.Lov.superclass.setValue.call(this, v, silent);
		this.text = v;
		this.setRawValue(this.text);
	},
	onWinClose: function(){
		this.isWinOpen = false;
		this.win = null;
		this.focus();
	},
	showLovWindow : function(){
		if(this.isWinOpen == true) return;
		if(this.readonly == true) return;
		if(this.ref == "" || Ext.isEmpty(this.ref))return;
		this.isWinOpen = true;
		var v = '';
		var rv = this.getRawValue();
		var t = this.text;
		if(rv==t){
			if(this.record)
			v = this.record.get(this.valuefield);
			if(!v) v = '';
		}else{
			v = rv;
		}
		this.blur();
    	this.win = new Aurora.Window({title:this.title||'Lov', url:(this.ref) + "?lovid="+this.id+"&key="+v, height:this.winheight||400,width:this.winwidth||400});
    	this.win.on('close',this.onWinClose,this);
    }
});
