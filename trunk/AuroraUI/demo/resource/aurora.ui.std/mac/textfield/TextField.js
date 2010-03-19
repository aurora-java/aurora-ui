$A.TextField = Ext.extend($A.Field,{
	constructor: function(config) {
        $A.TextField.superclass.constructor.call(this, config);        
    },
    initComponent : function(config){
    	$A.TextField.superclass.initComponent.call(this, config);    	
    },
    initEvents : function(){
    	$A.TextField.superclass.initEvents.call(this);    	
    }
//    ,getValue : function(){
//    	return this.getRawValue();
//    }
})