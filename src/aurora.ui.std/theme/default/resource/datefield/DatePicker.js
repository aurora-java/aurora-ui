/**
 * @class Aurora.DatePicker
 * @extends Aurora.TriggerField
 * <p>DatePicker组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.DatePicker = Ext.extend($A.TriggerField,{
	nowTpl:['<DIV class="item-day" style="cursor:pointer" title="{title}">{now}</DIV>'],
	constructor: function(config) {
		this.dateFields = [];
        $A.DatePicker.superclass.constructor.call(this,config);
    },
	initComponent : function(config){
		$A.DatePicker.superclass.initComponent.call(this,config);
    	this.initDateField();
    	this.initFooter();
	},
    initDateField:function(){
    	this.format=this.format||$A.defaultDateFormat;
    	this.popup.setStyle({'width':150*this.viewsize+'px'})
    	if(this.dateFields.length==0){
    		for(var i=0;i<this.viewsize;i++){
	    		var cfg = {id:this.id+'_df'+i,height:130,enablemonthbtn:'none',enablebesidedays:'none',dayrenderer:this.dayrenderer,listeners:{"select":this.onSelect.createDelegate(this),"draw":this.onDraw.createDelegate(this)}}
		    	if(i==0){
		    		if(this.enablebesidedays=="both"||this.enablebesidedays=="pre")
		    			cfg.enablebesidedays="pre";
		    		if(this.enablemonthbtn=="both"||this.enablemonthbtn=="pre")
		    			cfg.enablemonthbtn="pre";
		    	}
		    	if(i==this.viewsize-1){
		    		if(this.enablebesidedays=="both"||this.enablebesidedays=="next")
		    			cfg.enablebesidedays=cfg.enablebesidedays=="pre"?"both":"next";
		    		if(this.enablemonthbtn=="both"||this.enablemonthbtn=="next")
		    			cfg.enablemonthbtn=cfg.enablemonthbtn=="pre"?"both":"next";
		    	}else Ext.fly(this.id+'_df'+i).dom.style.cssText="border-right:1px solid #BABABA";
		    	this.dateFields.add(new $A.DateField(cfg));
    		}
    	}
    },
    initFooter : function(){
    	if(!this.now)this.now=new Ext.Template(this.nowTpl).append(this.popup.child("div.item-dateField-foot").dom,{now:_lang['datepicker.today'],title:new Date().format(this.format)},true);;
    	this.now.set({"_date":new Date().getTime()});
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
    processListener : function(ou){
    	$A.DatePicker.superclass.processListener.call(this,ou);
    	if(this.now)this.now[ou]("click", this.onSelect, this);
    },
    onKeyUp: function(e){
    	$A.DatePicker.superclass.onKeyUp.call(this,e);
    	try{
    		this.selectDay=this.getRawValue().parseDate(this.format);
    		$A.Component.prototype.setValue.call(this,this.selectDay);
    		this.predraw(this.selectDay);
    	}catch(e){
    	}
    },
    onDraw : function(field){
    	if(this.dateFields.length>1)this.sysnDateField(field);
    	this.shadow.setWidth(this.popup.getWidth());
    	this.shadow.setHeight(this.popup.getHeight());
    },
    onSelect: function(e){
		if((Ext.fly(e.target).hasClass('item-day')||Ext.fly(e.target).hasClass('onToday')) && Ext.fly(e.target).getAttributeNS("",'_date') != '0'){
    		var date=new Date(parseInt(Ext.fly(e.target).getAttributeNS("",'_date')));
	    	this.collapse();
            this.processDate(date);
	    	this.setValue(date);
	    	this.fireEvent('select',this, date);
    	}
    },
    processDate : function(d){},
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
    	this.selectDay = this.getValue();
		this.predraw(this.selectDay);
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
	},
	predraw : function(date){
		if(date && date instanceof Date){
			this.selectDay=new Date(date);
		}else {
			date=new Date();
			date.setHours(0);
			date.setMinutes(0);
			date.setSeconds(0);
			date.setMilliseconds(0);
		}
		this.draw(date);
	},
	draw: function(date){
		this.dateFields[0].selectDay=this.selectDay;
		this.dateFields[0].format=this.format;
		this.dateFields[0].predraw(date);
	},
	sysnDateField : function(field){
		var date=new Date(field.date);
		for(var i=0;i<this.viewsize;i++){
			if(field==this.dateFields[i])date.setMonth(date.getMonth()-i);
		}
		for(var i=0;i<this.viewsize;i++){
			this.dateFields[i].selectDay=this.selectDay;
			if(i!=0)date.setMonth(date.getMonth()+1);
			this.dateFields[i].format=this.format;
			if(field!=this.dateFields[i])
			this.dateFields[i].predraw(date,true);
		}
	},
	preMonth : function(){
		this.dateFields[0].preMonth();
	},
	nextMonth : function(){
		this.dateFields[0].nextMonth();
	},
	onMouseWheel:function(e){
		var delta = e.getWheelDelta();
        if(delta > 0&&(this.enablemonthbtn=="both"||this.enablemonthbtn=="pre")){
            this.preMonth();
            e.stopEvent();
        }
		if(delta < 0&&(this.enablemonthbtn=="both"||this.enablemonthbtn=="next")){
            this.nextMonth();
            e.stopEvent();
        }
	}
});