$A.AUTO_ID = 1000;
$A.DataSet = Ext.extend(Ext.util.Observable,{
	constructor: function(config) {//datas,fields, type
		$A.DataSet.superclass.constructor.call(this);
		config = config || {};
		this.pageid = config.pageid;
    	this.spara = {};
    	this.selected = [];
    	this.pageSize = config.pageSize || 10;
    	this.submitUrl = config.submitUrl || '';
    	this.queryUrl = config.queryUrl || '';
    	this.fetchAll = config.fetchAll;
    	this.selectable = config.selectable;
    	this.selectionmodel = config.selectionmodel;
    	this.autoCount = config.autoCount;
    	this.bindtarget = config.bindtarget;
    	this.bindname = config.bindname;
		this.loading = false;
    	this.qpara = {};
    	this.fields = {};
    	this.resetConfig();
		this.id = config.id || Ext.id();
        $A.CmpManager.put(this.id,this)	
        if(this.bindtarget&&this.bindname) $(this.bindtarget).bind(this.bindname,this);
    	this.qds = Ext.isEmpty(config.queryDataSet) ? null :$(config.queryDataSet);
    	if(this.qds != null && this.qds.getCurrentRecord() == null) this.qds.create();
    	this.initEvents();
    	if(config.fields)this.initFields(config.fields)
    	if(config.datas && config.datas.length != 0) {
    		this.loadData(config.datas);
    		//this.locate(this.currentIndex); //不确定有没有影响
    	}
    	if(config.autoQuery === true) this.query();
    },
    destroy : function(){
    	if(this.bindtarget&&this.bindname){
    	   var bd = $A.CmpManager.get(this.bindtarget)
    	   if(bd)bd.unbind(this.bindname);
    	}
    	$A.CmpManager.remove(this.id);
    	delete $A.invalidRecords[this.id]
    },
    reConfig : function(config){
    	this.resetConfig();
    	Ext.apply(this, config);
    },
    unbind : function(name){
        var ds = this.fields[name].pro['dataset'];
        if(ds)
        this.processBindDataSet(ds,'un');
        delete this.fields[name];
    },
    processBindDataSet : function(ds,ou){
        var bdp = this.bindDataSetPrototype
        ds[ou]('beforecreate', this.beforeCreate, this);
        ds[ou]('add', bdp, this);
        ds[ou]('remove', bdp, this);
        ds[ou]('update', bdp, this);
        ds[ou]('clear', bdp, this);
//        ds[ou]('load', bdp, this);
        ds[ou]('reject', bdp, this);
    },
    bind : function(name, ds){
    	if(this.fields[name]) {
    		alert('重复绑定 ' + name);
    		return;
    	}
    	this.processBindDataSet(ds,'un');
    	this.processBindDataSet(ds,'on');
    	var field = new $A.Record.Field({
    		name:name,
    		type:'dataset',
    		dataset:ds
    	});    	
	    this.fields[name] = field;
//	    this.processCurrentRow();
    },
   	bindDataSetPrototype: function(clear){
    	var record = this.getCurrentRecord();
    	if(!record)return;
    	for(var k in this.fields){
    		var field = this.fields[k];
    		if(field.type == 'dataset'){    			
    			var ds = field.pro['dataset'];
    			if(clear===true)ds.resetConfig()
    			record.set(field.name,ds.getConfig())
    		}
    	}
    },
    beforeCreate: function(ds, record, index){
    	if(this.data.length == 0){
    		this.create({},false)
//	    	this.bindDataSetPrototype(true);
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
//    	this.bindtarget = null;
//        this.bindname = null;
    },
    getConfig : function(){
    	var c = {};
//    	c.id = this.id;
    	c.xtype = 'dataset';
    	c.data = this.data;
    	c.selected = this.selected;
    	c.isValid = this.isValid;
//    	c.bindtarget = this.bindtarget;
//        c.bindname = this.bindname;
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
	        'select',
	        'unselect',
	        'reject',
	        'submitsuccess',
	        'submitfailed'
		);    	
    },
    initFields : function(fields){
    	for(var i = 0, len = fields.length; i < len; i++){
    		var field = new $A.Record.Field(fields[i]);
	        this.fields[field.name] = field;
        }
    },
    getField : function(name){
    	return this.fields[name];
    },
    loadData : function(datas, num){
        this.data = [];
        this.selected = [];
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
    			var dt = field.getPropertity('datatype');
    			dt = dt ? dt.toLowerCase() : '';
    			switch(dt){
    				case 'date':
    					data[key] = $A.parseDate(data[key]);
    					break;
    				case 'java.util.date':
    					data[key] = $A.parseDate(data[key]);
    					break;
    				case 'java.sql.date':
    					data[key] = $A.parseDate(data[key]);
    					break;
    				case 'int':
    					data[key] = parseInt(data[key]);
    					break;
    			}
    		}
    		var record = new $A.Record(data,datas[i].field);
            record.setDataSet(this);
	        this.data.add(record);
        }
        if(this.sortInfo) this.sort();
        this.fireEvent("load", this);
    },
    sort : function(f, direction){
    	//TODO:排序
    },
    /** ------------------数据操作------------------ **/ 
    create : function(data, valid){
    	this.fireEvent("beforecreate", this);
    	data = data||{}
//    	if(valid !== false) if(!this.validCurrent())return;
    	var dd = {};
    	for(var k in this.fields){
    		var field = this.fields[k];
    		var dv = field.getPropertity('defaultvalue');
    		if(dv && !data[field.name]){
    			dd[field.name] = dv;
    		}
    	}
    	var data = Ext.apply(data||{},dd);
    	var record = new $A.Record(data);
        this.add(record); 
//        var index = (this.currentPage-1)*this.pageSize + this.data.length;
//        this.locate(index, true);
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
        var index = (this.currentPage-1)*this.pageSize + this.data.length;
        this.locate(index, true);
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
    	var rs = [].concat(record);
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
    },
    removeRemote: function(rs){
    	if(this.submitUrl == '') return;
    	var p = [];
    	for(var k=0;k<rs.length;k++){
    		var r = rs[k]
        	var d = Ext.apply({}, r.data);
    		d['_id'] = r.id;
    		d['_status'] = 'delete';
            p[k] = Ext.apply(d,this.spara)
    	}
//    	var p = [d];
//    	for(var i=0;i<p.length;i++){
//    		p[i] = Ext.apply(p[i],this.spara)
//    	}
    	if(p.length > 0) {
	    	$A.request(this.submitUrl, p, this.onRemoveSuccess, this.onSubmitFailed, this);
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
    	$A.removeInvalidReocrd(this.id, record)
    	var index = this.data.indexOf(record);    	
    	if(index == -1)return;
        this.data.remove(record);
        this.selected.remove(record);
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
        this.selected = [];
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
    /** ------------------选择函数------------------ **/
    getSelected : function(){
    	return this.selected;
    },
    selectAll : function(){
    	for(var i=0,l=this.data.length;i<l;i++){
    		this.select(this.data[i]);
    	}
    },
    unSelectAll : function(){
    	for(var i=0,l=this.data.length;i<l;i++){
    		this.unSelect(this.data[i]);
    	}
    },
    select : function(r){
    	if(typeof(r) == 'string') r = this.findById(r);
    	if(this.selectable && this.selectionmodel == 'multiple'){
    		if(this.selected.indexOf(r) == -1) {
    			this.selected.add(r);
    			
    			this.fireEvent('select', this, r);
    		}
       	}else{
       		if(this.selected.indexOf(r) == -1) {
	       		var or = this.selected[0];
	       		this.unSelect(or);
	       		this.selected = []
	       		this.selected.add(r);
	       		this.fireEvent('select', this, r);
       		}
       	}
    },
    unSelect : function(r){
    	if(typeof(r) == 'string') r = this.findById(r);
    	if(this.selectable){
    		if(this.selected.indexOf(r) != -1) {
    			this.selected.remove(r);
    			this.fireEvent('unselect', this, r);
    		}
    	}
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
    			$A.showInfoMessage('提示', '有未保存数据!')
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
    firstPage : function(){
    	this.goPage(1);
    },
    prePage : function(){
    	this.goPage(this.currentPage -1);
    },
    nextPage : function(){
    	this.goPage(this.currentPage +1);
    },
    lastPage : function(){
    	this.goPage(this.totalPage);
    },
    validate : function(fire){
    	this.isValid = true;
//    	var current = this.getCurrentRecord();
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
					$A.addInValidReocrd(this.id, record);
				}else{
					$A.removeInvalidReocrd(this.id, record);
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
			$A.manager.fireEvent('valid', $A.manager, this, this.isValid);
		}
		if(!this.isValid) $A.showInfoMessage('提示', '验证不通过!');
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
    				  '&_fetchall='+this.fetchAll+
    				  '&_autocount='+this.autoCount
//    				  + '&_rootpath=list'
    	var url = '';
    	if(this.queryUrl.indexOf('?') == -1){
    		url = this.queryUrl + '?' + para;
    	}else{
    		url = this.queryUrl + '&' + para;
    	}
    	this.loading = true;
    	$A.request(url, q, this.onLoadSuccess, this.onLoadFailed, this);
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
//    isDataModified : function(){
//    	var modified = false;
//    	for(var i=0,l=this.data.length;i<l;i++){
//    		var r = this.data[i];    		
//    		if(r.dirty || r.isNew){
//    			modified = true;
//    			break;
//    		}
//    	}
//    	return modified;
//    },
    getJsonData : function(){
    	var datas = [];
    	for(var i=0,l=this.data.length;i<l;i++){
    		var r = this.data[i];
    		var isAdd = r.dirty || r.isNew
			var d = Ext.apply({}, r.data);
			d['_id'] = r.id;
			d['_status'] = r.isNew ? 'insert' : 'update';
			for(var k in r.data){
				var item = d[k]; 
				if(item && item.xtype == 'dataset'){
					var ds = new $A.DataSet({});//$(item.id);
					ds.reConfig(item)
					isAdd = isAdd == false ? ds.isModified() :isAdd;
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
    		return;
    	}
    	this.submitUrl = url||this.submitUrl;
    	if(this.submitUrl == '') return;
    	var p = this.getJsonData();
    	for(var i=0;i<p.length;i++){
    		p[i] = Ext.apply(p[i],this.spara)
    	}
    	
    	if(p.length > 0) {
	    	$A.request(this.submitUrl, p, this.onSubmitSuccess, this.onSubmitFailed, this);
    	}
    },
    
    /** ------------------事件函数------------------ **/
    afterEdit : function(record, name, value) {
        this.fireEvent("update", this, record, name, value);
    },
    afterReject : function(record, name, value){
    	this.fireEvent("reject", this, record, name, value);
    },
    onSubmitSuccess : function(res){
    	var datas = []
    	if(res.result.record){
    		datas = [].concat(res.result.record);
    		this.refreshRecord(datas)
    	}
    	this.fireEvent('submitsuccess', this, datas, res)
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
	    				if(k == kf){
//	    				if(k.toLowerCase() == kf.toLowerCase()){
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
					nv = $A.parseDate(nv)
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
    	$A.showWarningMessage('错误', res.error.message,350,150);
		this.fireEvent('submitfailed', this, res)   
    },
    onLoadSuccess : function(res){
    	if(res == null) return;
//    	if(!res.result.record) return;
    	if(!res.result.record) res.result.record = [];
    	var records = [].concat(res.result.record);
//    	var total = res.result.record.totalCount;
    	var total = res.result.totalCount;
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
    	this.loading = false;
    	this.loadData(datas, total);
    	this.locate(this.currentIndex,true);
	    
    },
    onLoadFailed : function(res){
    	$A.showWarningMessage('错误', res.error.message);
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


$A.Record = function(data, fields){
    this.id = ++$A.AUTO_ID;
    this.data = data;
    this.fields = {};
    this.valid = {};
    this.isValid = true;
    this.isNew = false;
	this.dirty = false;	
	this.editing = false;
	this.modified= null;
    this.meta = new $A.Record.Meta(this);
    if(fields)this.initFields(fields);
};
$A.Record.prototype = {
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
			names.add(k);
//			names.add(k.toLowerCase());
		}
		
		for(var k in rf){
			if(names.indexOf(k) == -1){
				if(rf[k].type !='dataset')
				names.add(k);
			}
		
//			if(names.indexOf(k.toLowerCase()) == -1){
//				names.add(k.toLowerCase());
//			}
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

$A.Record.Field = function(c){
    this.name = c.name;
    this.type = c.type;
    this.pro = c||{};
    this.record;
};
$A.Record.Field.prototype = {
	clear : function(){
		this.pro = {};
		this.record.onFieldClear(this.name);
	},
	setPropertity : function(type,value) {
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
		this.setPropertity('required',r);
	},
	setReadOnly : function(r){	
		this.setPropertity('readonly',r);
	},
	setOptions : function(r){
		this.setPropertity('options',r);
	},
	getOptions : function(){
		return this.getPropertity('options');
	},
	setMapping : function(m){
		this.setPropertity('mapping',m);
	},
	getMapping : function(){
        return this.getPropertity('mapping');
	},
	setTitle : function(t){
		this.setPropertity('title',t);
	},
	setLovWidth : function(w){
        this.setPropertity('lovwidth',w);
	},
	setLovHeight : function(h){
		this.setPropertity('lovheight',h);
	},
	setLovGridHeight : function(gh){
        this.setPropertity("lovgridheight",gh)
	},
	setLovModel : function(m){
        this.setPropertity("lovmodel",m) 
	},
	setLovService : function(m){
        this.setPropertity("lovservice",m) 
    },
    setLovUrl : function(m){
    	this.setPropertity("lovurl",m) 
    }
	
}