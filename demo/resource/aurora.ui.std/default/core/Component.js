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
    },    
	//TODO:其他组件也改成如下方式
    processListener: function(ou){
    	this.wrap[ou]("mouseover", this.onMouseOver, this);
        this.wrap[ou]("mouseout", this.onMouseOut, this);
    },
    initEvents : function(){
    	this.addEvents('focus','blur','change','invalid','valid','mouseover','mouseout');  
    	this.processListener('on');
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
//    	this.fireEvent('valid', this, this.record, this.binder.name)
    },
    onRefresh : function(ds){
    	if(this.isFireEvent == true || this.isHidden == true) return;
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
    	if(this.binder.ds == ds && this.binder.name.toLowerCase() == name.toLowerCase() && this.getValue() != value){
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
    setWidth: function(w){
    	this.width = w;
    	this.wrap.setWidth(w);
    },
    setHeight: function(h){
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