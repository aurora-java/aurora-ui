$A.Label = Ext.extend($A.Component,{
    onUpdate : function(ds, record, name, value){
    	if(this.binder.ds == ds && this.binder.name == name){
//    	if(this.binder.ds == ds && this.binder.name.toLowerCase() == name.toLowerCase()){
	    	this.update(record,name,value);
    	}
    },
    rerender : function(record){
    	this.record = record;
    	if(this.record) {
			var value = this.record.get(this.binder.name);
			this.update(this.record,this.binder.name,value);
    	}
    },
    update: function(record,name,value){
    	if(value){
	    	if(this.renderer){
	    		var rder = window[this.renderer]
	    		value = rder.call(window,value,record, name);
	    	}
	    	this.wrap.update(value);
    	}
    }
});