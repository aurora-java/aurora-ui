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
	constructor: function(config) {
        $A.Component.superclass.constructor.call(this);
        this.id = config.id || Ext.id();
        $A.CmpManager.put(this.id,this)
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
        if(this.listeners){
            this.on(this.listeners);
        }
    },
    processListener: function(ou){
    	this.processMouseOverOut(ou)
        if(this.marginwidth||this.marginheight) {
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
        if(this.marginheight){
            ht = Aurora.getViewportHeight();
            this.setHeight(ht-this.marginheight);           
        }
        if(this.marginwidth){
            wd = Aurora.getViewportWidth();
            this.setWidth(wd-this.marginwidth);
        }
    },
    isEventFromComponent:function(el){
    	return this.wrap.contains(el)||this.wrap.dom === (el.dom?el.dom:el);
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
    clearInvalid : function(){},
    markInvalid : function(){},
    clearValue : function(){},
    initMeta : function(){},
    setDefault : function(){},
    setRequired : function(){},
    onDataChange : function(){},
    setWidth : function(w){
    	this.wrap.setStyle('width',w+'px');
    },
    setHeight : function(h){
    	this.wrap.setStyle('height',h+'px');
    }
});