/**
 * @class Aurora.DateTimePicker
 * @extends Aurora.DatePicker
 * <p>DatePicker组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.DateTimePicker = Ext.extend($A.DatePicker,{
	initFormat : function(){
		this.format=this.format||$A.defaultDateTimeFormat;
	},
	initFooter : function(){
		this.hourSpan = this.popup.child("input[atype=field.hour]");
    	this.minuteSpan = this.popup.child("input[atype=field.minute]");
    	this.secondSpan = this.popup.child("input[atype=field.second]");
    },
    processListener : function(ou){
    	$A.DateTimePicker.superclass.processListener.call(this,ou);
    	if(this.hourSpan){
	    	this.hourSpan[ou]("focus", this.onDateFocus, this);
			this.hourSpan[ou]("blur", this.onDateBlur, this);
			this.minuteSpan[ou]("focus", this.onDateFocus, this);
			this.minuteSpan[ou]("blur", this.onDateBlur, this);
			this.secondSpan[ou]("focus", this.onDateFocus, this);
			this.secondSpan[ou]("blur", this.onDateBlur, this);
			this.hourSpan.parent()[ou]("keydown", this.onDateKeyDown, this);
			this.hourSpan.parent()[ou]("keyup", this.onDateKeyUp, this);
    	}
    },
    onDateKeyDown : function(e) {
		var c = e.keyCode, el = e.target;
		if (c == 13) {
			el.blur();
		} else if (c == 27) {
			el.value = el.oldValue || "";
			el.blur();
		} else if (c != 8 && c!=9 && c!=37 && c!=39 && c != 46 && (c < 48 || c > 57 || e.shiftKey)) {
			e.stopEvent();
			return;
		}
	},
	onDateKeyUp : function(e){
		var c = e.keyCode, el = e.target;
		if (c != 8 && c!=9 && c!=37 && c!=39 && c != 46 && (c < 48 || c > 57 || e.shiftKey)) {
			e.stopEvent();
			return;
		} else if(this.value&&this.value instanceof Date){
			var date=new Date(this.value.getTime());
			this.processDate(date);
	    	this.setValue(date);
	    	this.fireEvent('select',this, date);
		}
	},
    onDateFocus : function(e) {
		Ext.fly(e.target.parentNode).addClass("item-dateField-input-focus");
		e.target.select();
	},
	onDateBlur : function(e) {
		var el=e.target;
		Ext.fly(el.parentNode).removeClass("item-dateField-input-focus");
		if(!el.value.match(/^[0-9]*$/))el.value=el.oldValue||"";
		else this.draw(new Date(this.dateFields[0].year,this.dateFields[0].month - 1, 1,this.hourSpan.dom.value,this.minuteSpan.dom.value,this.secondSpan.dom.value));
	},
	predraw : function(date,noSelect){
		$A.DateTimePicker.superclass.predraw.call(this,date,noSelect);
		this.hourSpan.dom.oldValue = this.hourSpan.dom.value = $A.dateFormat.pad(this.dateFields[0].hours);
		this.minuteSpan.dom.oldValue = this.minuteSpan.dom.value = $A.dateFormat.pad(this.dateFields[0].minutes);
		this.secondSpan.dom.oldValue = this.secondSpan.dom.value = $A.dateFormat.pad(this.dateFields[0].seconds);
	},
    processDate : function(d){
        if(d){
            d.setHours((el=this.hourSpan.dom).value.match(/^[0-9]*$/)?el.value:el.oldValue);
            d.setMinutes((el=this.minuteSpan.dom).value.match(/^[0-9]*$/)?el.value:el.oldValue);
            d.setSeconds((el=this.secondSpan.dom).value.match(/^[0-9]*$/)?el.value:el.oldValue);
        }
        wrapDate(d)
    },
    wrapDate : function(d){
        d.xtype = 'timestamp';
    }
//    ,collapse : function(){
//    	$A.DateTimePicker.superclass.collapse.call(this);
//    	if(this.getRawValue()){
//    		var d = this.selectDay;
//    		if(d){
//	    		d.setHours((el=this.hourSpan.dom).value.match(/^[0-9]*$/)?el.value:el.oldValue);
//	    		d.setMinutes((el=this.minuteSpan.dom).value.match(/^[0-9]*$/)?el.value:el.oldValue);
//	    		d.setSeconds((el=this.secondSpan.dom).value.match(/^[0-9]*$/)?el.value:el.oldValue);
//    		}
//    		d.xtype = 'timestamp';
//    		this.setValue(d);
//    	}
//    }
});