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
		$A.DataSet.superclass.constructor.call(this);
		config = config || {};
		if(config.listeners){
            this.on(config.listeners);
        }
		this.pageid = config.pageid;
    	this.spara = {};
    	this.selected = [];
    	this.pagesize = config.pagesize || 10;
    	this.submiturl = config.submiturl || '';
    	this.queryurl = config.queryurl || '';
    	this.fetchall = config.fetchall||false;
    	this.selectable = config.selectable||false;
    	this.selectionmodel = config.selectionmodel||'multiple';
    	this.autocount = config.autocount;
    	this.bindtarget = config.bindtarget;
    	this.bindname = config.bindname;
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
    		this.loadData(config.datas);
    		//this.locate(this.currentIndex); //不确定有没有影响
    	}
    	if(config.autoquery === true) {
            var sf = this;
            Ext.onReady(function(){
               sf.query(); 
            });
    	}
    	if(config.autocreate==true) {
            if(this.data.length == 0)
            this.create();
    	}
    },
    destroy : function(){
    	if(this.bindtarget&&this.bindname){
            var bd = $A.CmpManager.get(this.bindtarget)
            if(bd)bd.clearBind();
    	}
    	$A.CmpManager.remove(this.id);
    	delete $A.invalidRecords[this.id]
    },
    reConfig : function(config){
    	this.resetConfig();
    	Ext.apply(this, config);
    },
    /**
     * 取消绑定.
     */
    clearBind : function(){
    	var name = this.bindname;
        var ds = this.fields[name].pro['dataset'];
        if(ds)
        ds.processBindDataSetListener(this,'un');
        delete this.fields[name];
    },
    processBindDataSetListener : function(ds,ou){
        var bdp = this.onDataSetMoify;
//        this[ou]('beforecreate', this.beforeCreate, this);//TODO:有待测试
        this[ou]('add', bdp, this);
        this[ou]('remove', bdp, this);
        this[ou]('update', bdp, this);
        this[ou]('clear', bdp, this);
        this[ou]('load', this.onDataSetLoad, this);
        this[ou]('reject', bdp, this);
        ds[ou]('indexchange',this.onDataSetIndexChange, this);
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
    onDataSetIndexChange : function(ds, record){
    	if(!record.get(this.bindname) && record.isNew != true){
    		this.qpara = {};
            Ext.apply(this.qpara,record.data);
            this.query(1,{record:record});
    	} 	
    },
    onDataSetMoify : function(){
    	var bt = $A.CmpManager.get(this.bindtarget);
    	if(bt){
            this.refreshBindDataSet(bt.getCurrentRecord(),this.getConfig())
    	}
    },
    onDataSetLoad : function(ds,options){
    	this.refreshBindDataSet(options.opts.record,ds.getConfig())
    },
   	refreshBindDataSet: function(record,config){
    	if(!record)return;
    	record.set(this.bindname,config,true)//this.getConfig()
//    	for(var k in this.fields){
//    		var field = this.fields[k];
//    		if(field.type == 'dataset'){  
//    			var ds = field.pro['dataset'];
////    			if(ds && clear==true)ds.resetConfig();
//    			record.set(field.name,ds.getConfig(),true)
//    		}
//    	}
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
            /**
             * @event ajaxfailed
             * ajax调用失败.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */
            'ajaxfailed',
    	    /**
             * @event beforecreate
             * 数据创建前事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
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
             * 数据删除前.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */
            'beforeremove',
	        /**
             * @event update
             * 数据更新事件.
             * "update", this, record, name, value
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Aurora.Record} record 更新的record.
             * @param {String} name 更新的field.
             * @param {Object} value 更新的值.
             */
	        'update',
	        /**
             * @event clear
             * 清除数据事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */
	        'clear',
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
             * @event select
             * 选择数据事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Aurora.Record} record 选择的record.
             */ 
	        'select',
	        /**
             * @event select
             * 取消选择数据事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             * @param {Aurora.Record} record 取消选择的record.
             */
	        'unselect',
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
             * @event submit
             * 数据提交事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */
	        'submit',
	        /**
             * @event submitsuccess
             * 数据提交成功事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */
            'submitsuccess',
	        /**
             * @event submitfailed
             * 数据提交失败事件.
             * @param {Aurora.DataSet} dataSet 当前DataSet.
             */
	        'submitfailed'
		);    	
    },
    initFields : function(fields){
    	for(var i = 0, len = fields.length; i < len; i++){
    		var field = new $A.Record.Field(fields[i]);
	        this.fields[field.name] = field;
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
    loadData : function(datas, num, options){
        this.data = [];
        this.selected = [];
        if(num) {
        	this.totalCount = num;
        }else{
        	this.totalCount = datas.length;
        }
    	this.totalPage = Math.ceil(this.totalCount/this.pagesize)
    	for(var i = 0, len = datas.length; i < len; i++){
    		var data = datas[i].data||datas[i];
    		for(var key in this.fields){
    			var field = this.fields[key];
    			if(field){
                    data[key] = this.processData(data[key],field)
    			}
    		}
    		var record = new $A.Record(data,datas[i].field);
            record.setDataSet(this);
	        this.data.add(record);
        }
        if(this.sortInfo) this.sort();
        
        var needFire = true;
        if(this.bindtarget){
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
    	//TODO:grid已经实现服务端排序
    },
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
//        var index = (this.currentPage-1)*this.pagesize + this.data.length;
//        this.locate(index, true);
        return record;
    },
    /**
     * 获取所有新创建的数据. 
     * @return {Array} 所有新创建的records
     */
    getNewRecrods: function(){
        var records = this.getAll();
        var news = [];
       	for(var k = 0,l=records.length;k<l;k++){
			var record = records[k];
			if(record.isNew == true){
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
    /**
     * 新增数据. 
     * @param {Aurora.Record} record 需要新增的Record对象. 
     */
    add : function(record){
    	record.isNew = true;
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
        var index = (this.currentPage-1)*this.pagesize + this.data.length;
        this.currentIndex = index;
        this.fireEvent("add", this, record, index);
        this.locate(index, true);
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
     * 插入数据. 
     * @param {Number} index  指定位置. 
     * @param {Array} records 需要新增的Record对象集合.
     */
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
    /**
     * 移除数据.  
     * @param {Aurora.Record} record 需要移除的Record.
     */
    remove : function(record){  
    	if(!record){
    		record = this.getCurrentRecord();
    	}
    	if(!record)return;
    	this.fireEvent("beforeremove", this);
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
            p[k] = Ext.apply(d,this.spara)
    	}
//    	var p = [d];
//    	for(var i=0;i<p.length;i++){
//    		p[i] = Ext.apply(p[i],this.spara)
//    	}
    	if(p.length > 0) {
    		var opts;
    		if(this.bindtarget){
                var bd = $A.CmpManager.get(this.bindtarget);
                opts = {record:bd.getCurrentRecord(),dataSet:this};
    		}
	    	$A.request({url:this.submiturl, para:p, success:this.onRemoveSuccess, error:this.onSubmitError, scope:this, failure:this.onAjaxFailed,opts:opts});
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
    	}
    },
    removeLocal: function(record,count){
    	$A.removeInvalidReocrd(this.id, record)
    	var index = this.data.indexOf(record);    	
    	if(index == -1)return;
        this.data.remove(record);
        if(count) this.totalCount --;
        this.selected.remove(record);
        if(this.data.length == 0){
        	this.removeAll();
        	return;
        }
        var lindex = this.currentIndex - (this.currentPage-1)*this.pagesize;
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
     * @param {String} id id.
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
        this.data = [];
        this.selected = [];
        this.fireEvent("clear", this);
    },
    /**
     * 返回指定record的位置
     * @return {Number} record所在的位置
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
    			ds.fireEvent('refresh',ds)
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
    	for(var i=0,l=this.data.length;i<l;i++){
    		this.select(this.data[i]);
    	}
    },
    /**
     * 取消所有选择.
     */
    unSelectAll : function(){
    	for(var i=0,l=this.data.length;i<l;i++){
    		this.unSelect(this.data[i]);
    	}
    },
    /**
     * 选择某个record.
     * @param {Aurora.Record} record 需要选择的record.
     */
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
    /**
     * 取消选择某个record.
     * @param {Aurora.Record} record 需要取消选择的record.
     */
    unSelect : function(r){
    	if(typeof(r) == 'string') r = this.findById(r);
    	if(this.selectable){
    		if(this.selected.indexOf(r) != -1) {
    			this.selected.remove(r);
    			this.fireEvent('unselect', this, r);
    		}
    	}
    },
    /**
     * 定位到某个指针位置.
     * @param {Number} index 指针位置.
     */
    locate : function(index, force){
    	if(this.currentIndex == index && force !== true) return;
//    	if(valid !== false) if(!this.validCurrent())return;
    	if(index <=0 || (index > this.totalCount + this.getNewRecrods().length))return;
    	var lindex = index - (this.currentPage-1)*this.pagesize;
    	if(this.data[lindex - 1]){
	    	this.currentIndex = index;
    	}else{
    		if(this.isModified()){
    			$A.showInfoMessage('提示', '有未保存数据!')
    		}else{
				this.currentIndex = index;
				this.currentPage =  Math.ceil(index/this.pagesize);
				this.query(this.currentPage);
				return;
    		}
    	}
    	this.processCurrentRow();
    },
    /**
     * 定位到某页.
     * @param {Number} page 页数.
     */
    goPage : function(page){
    	if(page >0) {
    		this.gotoPage = page;
	    	var go = (page-1)*this.pagesize + this.getNewRecrods().length +1;
//	    	var go = Math.max(0,page-2)*this.pagesize + this.data.length + 1;
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
     * 对当前数据集进行校验.
     * @return {Boolean} valid 校验结果.
     */
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
			//有些项目是虚拟的字段,例如密码修改
//			if(record.dirty == true || record.isNew == true) {
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
						if(record.data[key]){
    						ds.reConfig(record.data[key]);
    						if(!ds.validate(false)) {
    							this.isValid = false;
    							unvalidRecord = record;
    						}
    						ds.reConfig(current.data[key]);//循环校验完毕后,重新定位到当前行
						}
					}
					
					if(this.isValid == false) {
						break;
					}
									
//				}
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
    /**
     * 查询数据.
     * @param {Number} page(可选) 查询的页数.
     */
    query : function(page,opts){
    	$A.slideBarEnable = $A.SideBar.enable;
    	$A.SideBar.enable = false;
    	var r;
    	if(this.qds) {
    		if(this.qds.getCurrentRecord() == null) this.qds.create();
    		if(!this.qds.validate()) return;
    		r = this.qds.getCurrentRecord();
    	}
    	if(!this.queryurl) return;
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
//    				  + '&_rootpath=list'
    	var url = '';
    	if(this.queryurl.indexOf('?') == -1){
    		url = this.queryurl + '?' + para;
    	}else{
    		url = this.queryurl + '&' + para;
    	}
    	this.loading = true;
//    	this.fireEvent("beforeload", this);
    	this.fireBindDataSetEvent("beforeload", this);
    	$A.request({url:url, para:q, success:this.onLoadSuccess, error:this.onLoadError, scope:this,failure:this.onAjaxFailed,opts:opts});
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
    /**
     * 以json格式返回当前数据集.
     * @return {Object} json 返回的json对象.
     */
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
    /**
     * 提交操作.
     * @return {String} url(可选) 提交的url.
     */
    submit : function(url){
    	if(!this.validate()){    		
    		return;
    	}
    	this.submiturl = url||this.submiturl;
    	if(this.submiturl == '') return;
    	var p = this.getJsonData();
    	for(var i=0;i<p.length;i++){
    		var data = p[i]
    		for(var key in data){
    			var f = this.fields[key];
                if(f && f.type != 'dataset' && data[key]=='')data[key]=null;
    		}
    		p[i] = Ext.apply(p[i],this.spara)
    	}
    	
    	//if(p.length > 0) {
//            this.fireEvent("submit", this);
            this.fireBindDataSetEvent("submit");
            $A.request({url:this.submiturl, para:p, success:this.onSubmitSuccess, error:this.onSubmitError, scope:this,failure:this.onAjaxFailed});
    	//}
    },
    fireBindDataSetEvent : function(event){
    	this.fireEvent(event,this);
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
    afterEdit : function(record, name, value) {
        this.fireEvent("update", this, record, name, value);
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
    	this.fireBindDataSetEvent('submitsuccess');
    },
    commitRecords : function(datas,fire){
    	//this.resetConfig();
    	for(var i=0,l=datas.length;i<l;i++){
    		var data = datas[i];
	    	var r = this.findById(data['_id']);
	    	if(r.isNew) this.totalCount ++;
	    	if(!r) return;
	    	r.commit();
	    	for(var k in data){
	    		var field = k;
				var f = this.fields[field];
				if(f && f.type == 'dataset'){
					var ds = f.pro['dataset'];
					ds.reConfig(r.data[f.name]);
	    			if(data[k].record) {
                        ds.commitRecords([].concat(data[k].record), this.getCurrentRecord() == r);                     
	    			}
				}else{
					var ov = r.get(field);
					var nv = data[k]
					if(field == '_id' || field == '_status'||field=='__parameter_parsed__') continue;
					if(f){
					   nv = this.processData(nv,f);
					}
					if(ov != nv) {
						if(fire){
							//由于commit放到上面,这个时候不改变状态,防止重复提交
                            r.set(field,nv, true);
						}else{
                            r.data[field] = nv;
						}
					}
				}
	       	}
//	       	r.commit();//挪到上面了,record.set的时候会触发update事件,重新渲染.有可能去判断isNew的状态
    	}
    },
    processData: function(value,field){
        var dt = field.getPropertity('datatype');
        dt = dt ? dt.toLowerCase() : '';
        var v = value;
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
            case 'int':
                v = parseInt(v);
                break;
        }
        return v;
    },    
    onSubmitError : function(res){
//    	$A.showErrorMessage('错误', res.error.message||res.error.stackTrace,null,400,200);
    	this.fireBindDataSetEvent('submitfailed');
    },
    onLoadSuccess : function(res, options){
    	if(res == null) return;
    	if(!res.result.record) res.result.record = [];
    	var records = [].concat(res.result.record);
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
    	this.loadData(datas, total, options);
    	this.locate(this.currentIndex,true);
    	
        $A.SideBar.enable = $A.slideBarEnable;
	    
    },
    onAjaxFailed : function(res,opt){
    	this.fireBindDataSetEvent('ajaxfailed');
    },
    onLoadError : function(res,opt){
    	this.fireBindDataSetEvent('loadfailed', this);
//    	$A.showWarningMessage('错误', res.error.message||res.error.stackTrace,null,350,150);
    	this.loading = false;
    	$A.SideBar.enable = $A.slideBarEnable;
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
			names.add(k);
		}
		
		for(var k in rf){
			if(names.indexOf(k) == -1){
				if(rf[k].type !='dataset')
				names.add(k);
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
        var validator = field.get('validator');
		if(Ext.isEmpty(v) && field.get('required') == true){
			this.valid[name] = '当前字段不能为空!';
			valid =  false;
		}else{
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
		this.ds.onRecordValid(this,name,valid);
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
    /**
     * 设置值.
     * @param {String} name 设定值的名字.
     * @param {Object} value 设定的值.
     * @param {Boolean} notDirty true 不改变record的dirty状态.
     */
	set : function(name, value, notDirty){
        if(this.data[name] != value){
            if(!notDirty){
                this.dirty = true;
                if(!this.modified){
                    this.modified = {};
                }
                if(typeof this.modified[name] == 'undefined'){
                    this.modified[name] = this.data[name];
                }
            }
            this.data[name] = value;
            if(!this.editing && this.ds) {
                this.ds.afterEdit(this, name, value);
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
			this.record.onFieldChange(this.name, type, value);
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
	},
	/**
	 * 当前Field是否必输.
	 * @return {Boolean} required  是否必输.
	 */
    isRequired : function(){
        return this.getPropertity('required');
    },
	/**
	 * 设置当前Field是否只读.
	 * @param {Boolean} readonly 是否只读
	 */
	setReadOnly : function(r){	
		this.setPropertity('readonly',r);
	},
	/**
	 * 当前Field是否只读.
	 * @return {Boolean} readonly 是否只读
	 */
	isReadOnly : function(){
        return this.getPropertity('readonly');
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
		return this.getPropertity('options');
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
        return this.getPropertity('mapping');
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
    }
	
}