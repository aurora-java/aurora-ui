Aurora.DatePicker = Ext.extend(Aurora.TriggerField,{
	constructor: function(config) {
        Aurora.DatePicker.superclass.constructor.call(this, config);        
    },
    initComponent : function(config){
    	Aurora.DatePicker.superclass.initComponent.call(this,config);
    	if(!this.dateField){
    		var cfg = {id:this.id+'_df',container:this.popup}
	    	this.dateField = new Aurora.DateField(cfg);
	    	this.dateField.on("select", this.onSelect, this);
    	}
    },
    initEvents : function(){
    	Aurora.DatePicker.superclass.initEvents.call(this);
        this.addEvents('select');
    },
    onSelect: function(dateField, date){
    	this.collapse();
    	this.setValue(date);
    	this.fireEvent('select',this, date);
    },
	onBlur : function(){
		Aurora.DatePicker.superclass.onBlur.call(this);
		if(!this.isExpanded()) {
			var raw = this.getRawValue();
			if(!isNaN(new Date(raw.replace(/-/g,"/")))){
				this.setValue(new Date(raw.replace(/-/g,"/")));
			}else {
				this.setValue('');
			}
		}
    },
    formatValue : function(date){
    	if(date instanceof Date) {
    		return Aurora.formateDate(date);
    	}else{
    		return date;
    	}
    },
    expand : function(){
    	Aurora.DatePicker.superclass.expand.call(this);
    	if(this.dateField.selectDay != this.getValue()) {
    		this.dateField.selectDay = this.getValue()
    		this.dateField.predraw(this.dateField.selectDay);
    		var w = this.popup.getWidth();
	    	var h = this.popup.getHeight();
	    	this.shadow.setWidth(w);
	    	this.shadow.setHeight(h);
    	}
    	var screenHeight = Aurora.getViewportHeight();
    	var h = this.popup.getHeight();
    	var y = this.popup.getY();
    	if(y+h > screenHeight) {
    		var xy = this.wrap.getXY();
	    	this.popup.moveTo(xy[0],xy[1]-h);
	    	this.shadow.moveTo(xy[0]+3,xy[1]-h+3);
    	}
    },
    destroy : function(){
    	Aurora.DatePicker.superclass.destroy.call(this);
	}
});