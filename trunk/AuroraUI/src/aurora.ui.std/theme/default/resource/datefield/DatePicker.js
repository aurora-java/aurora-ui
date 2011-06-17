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
		this.initFormat();
	},
	initFormat : function(){
		this.format=this.format||$A.defaultDateFormat;
	},
    initDatePicker : function(){
        if(!this.inited){
            this.initDateField();
            this.initFooter();
            this.inited = true;
            this.processListener('un');
            this.processListener('on');
        }
    },
    initDateField:function(){
    	this.popup.setStyle({'width':150*this.viewsize+'px'})
    	if(this.dateFields.length==0){
    		for(var i=0;i<this.viewsize;i++){
	    		var cfg = {
	    			id:this.id+'_df'+i,
	    			height:130,
	    			enablemonthbtn:'none',
	    			enablebesidedays:'none',
	    			dayrenderer:this.dayrenderer,
	    			listeners:{
	    				"select":this.onSelect.createDelegate(this),
	    				"draw":this.onDraw.createDelegate(this),
	    				"mouseover":this.mouseOver.createDelegate(this),
	    				"mouseout":this.mouseOut.createDelegate(this)
	    			}
	    		}
		    	if(i==0){
		    		if(this.enablebesidedays=="both"||this.enablebesidedays=="pre")
		    			cfg.enablebesidedays="pre";
		    		if(this.enablemonthbtn=="both"||this.enablemonthbtn=="pre")
		    			cfg.enablemonthbtn="pre";
		    		if(this.enableyearbtn=="both"||this.enableyearbtn=="pre")
		    			cfg.enableyearbtn="pre";
		    	}
		    	if(i==this.viewsize-1){
		    		if(this.enablebesidedays=="both"||this.enablebesidedays=="next")
		    			cfg.enablebesidedays=cfg.enablebesidedays=="pre"?"both":"next";
		    		if(this.enablemonthbtn=="both"||this.enablemonthbtn=="next")
		    			cfg.enablemonthbtn=cfg.enablemonthbtn=="pre"?"both":"next";
		    		if(this.enableyearbtn=="both"||this.enableyearbtn=="next")
		    			cfg.enableyearbtn=cfg.enableyearbtn=="pre"?"both":"next";
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
    	this.el[ou]('click',this.mouseOut, this);
    	if(this.now)this.now[ou]("click", this.onSelect, this);
    },
    mouseOver: function(cmp,e){
    	if(this.focusField)this.focusField.out();
    	this.focusField = cmp
    },
    mouseOut: function(){
    	if(this.focusField)this.focusField.out();
    	this.focusField = null;
    },
    onKeyUp: function(e){
    	if(this.readonly)return;
    	$A.DatePicker.superclass.onKeyUp.call(this,e);
    	var c = e.keyCode;
    	if(!e.isSpecialKey()||c==8||c==46){
	    	try{
	    		this.selectDay=this.getRawValue().parseDate(this.format);
	    		$A.Component.prototype.setValue.call(this,this.selectDay);
	    		this.predraw(this.selectDay);
	    	}catch(e){
	    	}
    	}
    },
    onKeyDown: function(e){
    	if(this.readonly)return;
    	if(this.focusField){
	    	switch(e.keyCode){
	    		case 37:this.goLeft(e);break;
	    		case 38:this.goUp(e);break;
	    		case 39:this.goRight(e);break;
	    		case 40:this.goDown(e);break;
	    		case 13:this.onSelect(e,this.focusField.overTd);
	    		default:{
					if(this.focusField)this.focusField.out();
					this.focusField = null;
	    		}
	    	}
   		}else {
   			$A.DatePicker.superclass.onKeyDown.call(this,e);
   			if(e.keyCode == 40){
				this.focusField = this.dateFields[0];
				this.focusField.over();
   			}
   		}
    },
    goLeft : function(e){
    	var field = this.focusField;
		var td = field.overTd,prev = td.prev('.item-day');
		field.out();
    	if(prev) {
    		field.over(prev);
    	}else{
			var f = this.dateFields[this.dateFields.indexOf(field)-1],
			index = td.parent().getAttributeNS('','r_index')
			if(f){
				this.focusField = f;
			}else{
				field.preMonth();
				this.focusField = this.dateFields[this.dateFields.length-1];
			}
			var l = this.focusField.body.child('tr[r_index='+index+']').select('td.item-day')
			this.focusField.over(l.item(l.getCount()-1));
		}
		e.stopEvent();
    },
    goUp : function(e){
    	var field = this.focusField;
		var td = field.overTd,prev = td.parent().prev(),index = td.getAttributeNS('','c_index'),t;
		field.out();
		if(prev)t = prev.child('td[c_index='+index+']');
		if(t)field.over(t);
		else {
			var f = this.dateFields[this.dateFields.indexOf(field)-1];
			if(f){
				this.focusField = f;
			}else{
				field.preMonth();
				this.focusField = this.dateFields[0];
			}
			var l = this.focusField.body.select('td[c_index='+index+']')
			this.focusField.over(l.item(l.getCount()-1));
		}
    },
    goRight : function(e){
    	var field = this.focusField;
		var td = field.overTd,next = td.next('.item-day'),parent = td.parent();
		field.out();
    	if(next) {
    		field.over(next);
    	}else{
			var f = this.dateFields[this.dateFields.indexOf(field)+1];
			if(f){
				this.focusField = f;
			}else{
				field.nextMonth();
				this.focusField = this.dateFields[0];
			}
			this.focusField.over(this.focusField.body.child('tr[r_index='+parent.getAttributeNS('','r_index')+']').child('td.item-day'));
		}
		e.stopEvent();
    },
    goDown : function(e){
    	var field = this.focusField;
		var td = field.overTd,next = td.parent().next(),t,index = td.getAttributeNS('','c_index');
		field.out();
		if(next)t = next.child('td[c_index='+index+']');
		if(t)field.over(t);
		else {
			var f = this.dateFields[this.dateFields.indexOf(field)+1];
			if(f){
				this.focusField = f;
			}else{
				field.nextMonth();
				this.focusField = this.dateFields[this.dateFields.length-1];
			}
			this.focusField.over(this.focusField.body.child('td[c_index='+index+']'));
		}
    },
    onDraw : function(field){
    	if(this.dateFields.length>1)this.sysnDateField(field);
    	this.shadow.setWidth(this.popup.getWidth());
    	this.shadow.setHeight(this.popup.getHeight());
    },
    onSelect: function(e,t){
		if((Ext.fly(t).hasClass('item-day'))&& Ext.fly(t).getAttributeNS("",'_date') != '0'){
    		var date=new Date(parseInt(Ext.fly(t).getAttributeNS("",'_date')));
	    	this.collapse();
            this.processDate(date);
	    	this.setValue(date);
	    	this.fireEvent('select',this, date);
    	}
    },
    processDate : function(d){},
    onBlur : function(e){
    	if(this.readonly)return;
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
        this.initDatePicker();
    	this.selectDay = this.getValue();
		this.predraw(this.selectDay);
    	$A.DatePicker.superclass.expand.call(this);
    },
    collapse : function(){
    	$A.DatePicker.superclass.collapse.call(this);
    	this.focusField = null;
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
	}
});