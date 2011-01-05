/**
 * @class Aurora.DatePicker
 * @extends Aurora.TriggerField
 * <p>DatePicker组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.DatePicker = Ext.extend($A.TriggerField,{
	initComponent : function(config){ 
		$A.DatePicker.superclass.initComponent.call(this,config);
    	this.initDateField();
	},
    initDateField:function(){
    	this.format=this.format||"isoDate";
    	this.viewsize=(!this.viewsize||this.viewsize<1)?1:(this.viewsize>4?4:this.viewsize);
    	this.popup.setStyle({'width':150*this.viewsize+"px"})
    	if(!this.dateField){
    		var cfg = {id:this.id+'_df',container:this.popup,dayrenderer:this.dayrenderer,format:this.format,viewsize:this.viewsize,datestart:this.datestart,dateend:this.dateend,listeners:{"select": this.onSelect.createDelegate(this),"draw":this.onDraw.createDelegate(this)}}
	    	this.dateField = new $A.DateField(cfg);
    	}
    },
    initEvents : function(){
    	$A.DatePicker.superclass.initEvents.call(this);
        this.addEvents(
        /**
         * @event select
         * 选择事件.
         * @param {Aurora.DatePicker} datePicker 日期选择组件.
         * @param {Date} date 选择的日期.
         */
        'select');
    },
    onKeyUp: function(e){
    	$A.DatePicker.superclass.onKeyUp.call(this,e);
    	try{
    		this.dateField.selectDay=this.getRawValue().parseDate(this.format);
    		$A.Component.prototype.setValue.call(this,this.dateField.selectDay);
    		this.dateField.predraw(this.dateField.selectDay);
    	}catch(e){
    	}
    },
    onDraw : function(){
    	this.shadow.setWidth(this.popup.getWidth());
    	this.shadow.setHeight(this.popup.getHeight());
    },
    onSelect : function(dateField, date){
    	this.collapse();
    	this.setValue(date);
    	this.fireEvent('select',this, date);
    },
    onBlur : function(e){
		$A.DatePicker.superclass.onBlur.call(this,e);
		if(!this.isExpanded()){
			try{
				this.setValue(this.getRawValue().parseDate(this.format));
			}catch(e){alert(e.message);
				this.setValue(null);
			}
		}
    },
    formatValue : function(date){
    	if(date instanceof Date)return date.format(this.format);
    	return date;
    },
    expand : function(){
    	$A.DatePicker.superclass.expand.call(this);
    	this.dateField.selectDay = this.getValue();
		this.dateField.predraw(this.dateField.selectDay);
    	var xy=this.wrap.getXY(),
			W=this.popup.getWidth(),H=this.popup.getHeight(),
			PH=this.wrap.getHeight(),PW=this.wrap.getWidth(),
			BH=$A.getViewportHeight()-3,BW=$A.getViewportWidth()-3,
			x=(xy[0]+W)>BW?((BW-W)<0?xy[0]:(BW-W)):xy[0];
			y=(xy[1]+PH+H)>BH?((xy[1]-H)<0?(xy[1]+PH):(xy[1]-H)):(xy[1]+PH);
    	this.popup.moveTo(x,y);
    	this.shadow.moveTo(x+3,y+3);
    },
    destroy : function(){
    	$A.DatePicker.superclass.destroy.call(this);
    	delete this.format;
    	delete this.viewsize;
	}
});