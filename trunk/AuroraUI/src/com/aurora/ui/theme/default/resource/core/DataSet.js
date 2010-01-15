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
    	Aurora.showMessage('成功', '操作成功!');
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