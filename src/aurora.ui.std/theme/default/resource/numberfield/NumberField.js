$A.NumberField = Ext.extend($A.TextField,{
	//TODO:code
	constructor: function(config) {
        $A.NumberField.superclass.constructor.call(this, config);        
    },
    initComponent : function(config){
    	$A.NumberField.superclass.initComponent.call(this, config);    	
    },
    initEvents : function(){
    	$A.NumberField.superclass.initEvents.call(this);    	
    }
})