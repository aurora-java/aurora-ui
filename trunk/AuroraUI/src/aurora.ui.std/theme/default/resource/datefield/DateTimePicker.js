/**
 * @class Aurora.DatePicker
 * @extends Aurora.TriggerField
 * <p>DatePicker组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.DateTimePicker = Ext.extend($A.DatePicker,{
    initDateField:function(){
    	this.format=this.format||"yyyy-mm-dd HH:MM:ss";
    	this.viewsize=1;
    	this.popup.setStyle({'width':"150px"})
    	if(!this.dateField){
    		var cfg = {id:this.id+'_df',container:this.popup,dayrenderer:this.dayrenderer,format:this.format,viewsize:this.viewsize,datestart:this.datestart,dateend:this.dateend,listeners:{"select": this.onSelect.createDelegate(this),"draw":this.onDraw.createDelegate(this)}}
	    	this.dateField = new $A.DateField(cfg);
    	}
    },
    collapse : function(){
    	$A.DateTimePicker.superclass.collapse.call(this);
    	if(this.getRawValue()){
    		var d = this.dateField.selectDay
    		if(d){
	    		d.setHours((el=this.dateField.hourSpan.dom).value.match(/^[0-9]*$/)?el.value:el.oldValue);
	    		d.setMinutes((el=this.dateField.minuteSpan.dom).value.match(/^[0-9]*$/)?el.value:el.oldValue);
	    		d.setSeconds((el=this.dateField.secondSpan.dom).value.match(/^[0-9]*$/)?el.value:el.oldValue);
    		}
    		d.xtype = 'timestamp';
    		this.setValue(d);
    	}
    }
});