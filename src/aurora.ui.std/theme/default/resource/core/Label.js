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
    }
});