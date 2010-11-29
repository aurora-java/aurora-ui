/**
 * @class Aurora.DateField
 * @extends Aurora.Component
 * <p>日期组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.DateField = Ext.extend($A.Component, {
	constructor: function(config) {
        $A.DateField.superclass.constructor.call(this,config);
    },
    initComponent : function(config){
    	$A.DateField.superclass.initComponent.call(this, config);
    	this.wrap = typeof(config.container) == "string" ? Ext.get(config.container) : config.container;
        this.body = this.wrap.child("table.item-dateField-body");
        this.tables=[];
    	this.preMonthBtn = this.wrap.child("div.item-dateField-pre");
    	this.nextMonthBtn = this.wrap.child("div.item-dateField-next");
    	this.preYearBtn = this.wrap.child("div.item-dateField-preYear");
    	this.nextYearBtn = this.wrap.child("div.item-dateField-nextYear");
    	this.yearSpan = this.wrap.child("input[atype=field.year]");
    	this.monthSpan = this.wrap.child("input[atype=field.month]");
    	this.hourSpan = this.wrap.child("input[atype=field.hour]");
    	this.minuteSpan = this.wrap.child("input[atype=field.minute]");
    	this.secondSpan = this.wrap.child("input[atype=field.second]");
        var tableTpl=this.body.dom.rows[0].cells[0];
		for(var i=0;i<this.viewsize;i++){
			var clone=i==0?tableTpl:tableTpl.cloneNode(true);
        	this.tables[i]=Ext.fly(clone).child("table").dom;
        	var tr=Ext.fly(this.tables[i]).child("tr.item-dateField-head").dom;
        	this.tables[i].head=tr.cells[1];
        	this.tables[i].pre=tr.cells[0];
        	this.tables[i].next=tr.cells[2];
        	if(i!=this.viewsize-1)clone.style.cssText="border-right:1px solid #BABABA";
        	else clone.style.cssText="";
        	this.body.dom.rows[0].appendChild(clone);
        }
        this.tables[0].pre.appendChild(this.preMonthBtn.dom);
        this.tables[0].head.appendChild(this.monthSpan.dom.parentNode);
        this.tables[this.viewsize-1].next.appendChild(this.nextMonthBtn.dom);
        if(!$A.dateFormat.hasHour(this.format))this.hourSpan.dom.readOnly=true;
        if(!$A.dateFormat.hasMinute(this.format))this.minuteSpan.dom.readOnly=true;
        if(!$A.dateFormat.hasSecond(this.format))this.secondSpan.dom.readOnly=true;
    },
    processListener: function(ou){
    	$A.DateField.superclass.processListener.call(this,ou);
    	this.preMonthBtn[ou]("click", this.preMonth, this);
    	this.nextMonthBtn[ou]("click", this.nextMonth, this);
    	this.preYearBtn[ou]("click", this.preYear, this);
		this.nextYearBtn[ou]("click", this.nextYear, this);
		this.yearSpan[ou]("focus", this.onDateFocus, this);
		this.yearSpan[ou]("blur", this.onDateBlur, this);
		this.yearSpan[ou]("keydown", this.onKeyDown, this);
		this.monthSpan[ou]("focus", this.onDateFocus, this);
		this.monthSpan[ou]("blur", this.onDateBlur, this);
		this.monthSpan[ou]("keydown", this.onKeyDown, this);
		this.hourSpan[ou]("focus", this.onDateFocus, this);
		this.hourSpan[ou]("blur", this.onDateBlur, this);
		this.hourSpan[ou]("keydown", this.onKeyDown, this);
		this.minuteSpan[ou]("focus", this.onDateFocus, this);
		this.minuteSpan[ou]("blur", this.onDateBlur, this);
		this.minuteSpan[ou]("keydown", this.onKeyDown, this);
		this.secondSpan[ou]("focus", this.onDateFocus, this);
		this.secondSpan[ou]("blur", this.onDateBlur, this);
		this.secondSpan[ou]("keydown", this.onKeyDown, this);
    	this.body[ou]("mouseup", this.onSelect, this);
    	this.body[ou]("mouseover", this.mouseOver, this);
    	this.body[ou]("mouseout", this.mouseOut, this)
    },
    initEvents : function(){
    	$A.DateField.superclass.initEvents.call(this);   	
    	this.addEvents(
    	/**
         * @event select
         * 选择事件.
         * @param {Aurora.DateField} dateField 日期组件.
         * @param {Date} date 选择的日期.
         */
    	'select',
    	/**
         * @event draw
         * 绘制事件.
         * @param {Aurora.DateField} dateField 日期组件.
         */
    	'draw');
    },
    destroy : function(){
    	$A.DateField.superclass.destroy.call(this);
		delete this.preYearBtn;
		delete this.nextYearBtn;
		delete this.preMonthBtn;
    	delete this.nextMonthBtn;
    	delete this.yearSpan;
    	delete this.monthSpan; 
    	delete this.hourSpan; 
    	delete this.minuteSpan; 
    	delete this.secondSpan; 
    	delete this.body;        
        delete this.tables;
	},
    mouseOut: function(e){
    	if(this.overTd) Ext.fly(this.overTd).removeClass('dateover');
    },
    mouseOver: function(e){
    	if(this.overTd) Ext.fly(this.overTd).removeClass('dateover');
    	if((Ext.fly(e.target).hasClass('item-day')||Ext.fly(e.target).hasClass('onToday')) && Ext.fly(e.target).getAttribute('_date') != '0'){
    		this.overTd = e.target; 
    		Ext.fly(this.overTd).addClass('dateover');
    	}
    	
    },
    onSelect: function(e){
    	if(this.singleSelect !== false){
    		if(this.selectedDay) Ext.fly(this.selectedDay).removeClass('onSelect');
    		if((Ext.fly(e.target).hasClass('item-day')||Ext.fly(e.target).hasClass('onToday')) && Ext.fly(e.target).getAttribute('_date') != '0'){
	    		this.selectedDay = e.target; 
	    		this.onSelectDay(this.selectedDay);
	    		this.fireEvent('select', this, new Date(parseInt(Ext.fly(e.target).getAttribute('_date'))));
	    	}
    	}
    },
	onSelectDay: function(o){
		if(!Ext.fly(o).hasClass('onSelect'))Ext.fly(o).addClass('onSelect');
	},
	onToday: function(o){
		o.className = "onToday";
	},
	onKeyDown : function(e) {
		var c = e.keyCode, el = e.target;
		if (c == 13) {
			el.blur();
		} else if (c == 27) {
			el.value = el.oldValue || "";
			el.blur();
		} else if (c!=9 && c != 8 && c != 46 && (c < 48 || c > 57 || e.shiftKey)) {
			e.stopEvent();
			return;
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
		else this.predraw(new Date(this.yearSpan.dom.value,this.monthSpan.dom.value - 1, 1,this.hourSpan.dom.value,this.minuteSpan.dom.value,this.secondSpan.dom.value));
	},
    /**
     * 当前月
     */
	nowMonth: function() {
		this.predraw(new Date());
	},
	/**
	 * 上一月
	 */
	preMonth: function() {
		this.predraw(new Date(this.year, this.month - 2, 1,this.hours,this.minutes,this.seconds));
	},
	/**
	 * 下一月
	 */
	nextMonth: function() {
		this.predraw(new Date(this.year, this.month, 1,this.hours,this.minutes,this.seconds));
	},
	/**
	 * 上一年
	 */
	preYear: function() {
		this.predraw(new Date(this.year - 1, this.month - 1, 1,this.hours,this.minutes,this.seconds));
	},
	/**
	 * 下一年
	 */
	nextYear: function() {
		this.predraw(new Date(this.year + 1, this.month - 1, 1,this.hours,this.minutes,this.seconds));
	},
  	/**
  	 * 根据日期画日历
  	 * @param {Date} date 当前日期
  	 */
  	predraw: function(date) {
  		this.hours=0;this.minutes=0;this.seconds=0;
  		if(date=='' || !date.getFullYear)date = new Date();
  		else{
  			this.hours=date.getHours();this.minutes=date.getMinutes();this.seconds=date.getSeconds();
  		}
		this.year = date.getFullYear(); this.month = date.getMonth() + 1;
  		for(var i=0;i<this.viewsize;i++){
			this.draw(this.year,this.month+i,this.hours,this.minutes,this.seconds,i);
			if(i!=0)this.tables[i].head.innerHTML=((this.month+i)%12||12)+"月"
        }
        this.yearSpan.dom.oldValue = this.yearSpan.dom.value = this.year;
		this.monthSpan.dom.oldValue = this.monthSpan.dom.value = this.month;
		this.hourSpan.dom.oldValue = this.hourSpan.dom.value = $A.dateFormat.pad(this.hours);
		this.minuteSpan.dom.oldValue = this.minuteSpan.dom.value = $A.dateFormat.pad(this.minutes);
		this.secondSpan.dom.oldValue = this.secondSpan.dom.value = $A.dateFormat.pad(this.seconds);
		this.fireEvent("draw",this);
  	},
  	/**
  	 * 渲染日历
  	 */
	draw: function(year,month,hour,minute,second,index) {
		//用来保存日期列表
		var arr = [];
		//用当月第一天在一周中的日期值作为当月离第一天的天数,用上个月的最后天数补齐
		for(var i = 1, firstDay = new Date(year, month - 1, 1).getDay(),lastDay = new Date(year, month - 1, 0).getDate(); i <= firstDay; i++){ 
			if(index==0)arr.push([n=lastDay-firstDay+i,new Date(year, month - 2, n,hour,minute,second),"item-day item-day-besides"]);
			else arr.push([null,null,null]);
		}
		//用当月最后一天在一个月中的日期值作为当月的天数
		for(var i = 1, monthDay = new Date(year, month, 0).getDate(); i <= monthDay; i++){ 
			arr.push([i,new Date(year, month - 1, i,hour,minute,second),"item-day"]); 
		}
		//用下个月的前几天补齐
		for(var i=1, monthDay = new Date(year, month, 0).getDay();i<7-monthDay;i++){
			if(index==this.viewsize-1)arr.push([i,new Date(year, month, i,hour,minute,second),"item-day item-day-besides"]);
			else arr.push([null,null,null]); 
		}
		//先清空内容再插入(ie的table不能用innerHTML)
		while(this.tables[index].tBodies[0].hasChildNodes()){ 
			this.tables[index].tBodies[0].removeChild(this.tables[index].tBodies[0].firstChild); 
		}
		
		//插入日期
		var k=0;
		while(arr.length){
			//每个星期插入一个tr
			var row = document.createElement("tr");
			if(k%2!=0)row.className='week-alt';
			k++;
			//每个星期有7天
			for(var i = 1; i <= 7; i++){
				if(arr.length){
					var d = arr.shift();
					if(d){
						var cell = document.createElement("td"); 
						if(d[1]){
							cell.innerHTML = d[0];
							cell.className = d[2];
							cell.title=d[1].format(this.format);
							this.renderCell(cell,d[1]);
							Ext.fly(cell).set({'_date':cell.disabled?'0':''+d[1].getTime()});
							//判断是否今日
							if(this.isSame(d[1], new Date())) this.onToday(cell);
							//判断是否选择日期
							if(this.selectDay && this.isSame(d[1], this.selectDay))this.onSelectDay(cell);
						}
					}
				}
				row.appendChild(cell);
			}
			this.tables[index].tBodies[0].appendChild(row);
		}
	},
	renderCell:function(cell,date){
		if(this.dayrenderer)$A.getRenderer(this.dayrenderer).call(this,cell,date);
	},
	/**
	 * 判断是否同一日
	 * @param {Date} d1 日期1
	 * @param {Date} d2 日期2
	 * @return {Boolean} 是否同一天
	 */
	isSame: function(d1, d2) {
		if(!d2.getFullYear||!d1.getFullYear)return false;
		return (d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate());
	}
});