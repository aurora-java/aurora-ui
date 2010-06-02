/**
 * @class Aurora.Box
 * @extends Aurora.Component
 * <p>Box组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Box = Ext.extend($A.Component,{
	constructor: function(config) {
        this.errors = [];
        $A.Box.superclass.constructor.call(this,config);
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
    onValid : function(cmp, record, name, isvalid){
    	if(isvalid){
    	   this.clearError(cmp.id);
    	}else{
            var error = record.errors[name];
            if(error){
                this.showError(cmp.id,error.message)
            }    		
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