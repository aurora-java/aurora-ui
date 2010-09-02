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
		this.draw();
    },
    initComponent : function(config){
    	$A.DateField.superclass.initComponent.call(this, config);
    	this.wrap = typeof(config.container) == "string" ? Ext.get(config.container) : config.container;
        this.table = this.wrap.child("table");        
        this.tbody = this.wrap.child("tbody").dom;
    	this.days = [];
    	this.selectDays = this.selectDays||[];
    	this.date = this.date||new Date();
		this.year = this.date.getFullYear();
		this.month = this.date.getMonth() + 1;
    	this.preMonthBtn = this.wrap.child("div.item-dateField-pre");
    	this.nextMonthBtn = this.wrap.child("div.item-dateField-next");
    	this.yearSpan = this.wrap.child("span.item-dateField-year");
    	this.monthSpan = this.wrap.child("span.item-dateField-month");
    },
    processListener: function(ou){
    	$A.DateField.superclass.processListener.call(this,ou);
    	this.preMonthBtn[ou]("click", this.preMonth, this);
    	this.nextMonthBtn[ou]("click", this.nextMonth, this);
    	this.table[ou]("click", this.onSelect, this);
    	this.table[ou]("mouseover", this.mouseOver, this);
    	this.table[ou]("mouseout", this.mouseOut, this)
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
		delete this.preMonthBtn;
    	delete this.nextMonthBtn;
    	delete this.yearSpan;
    	delete this.monthSpan; 
    	delete this.table;        
        delete this.tbody;
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
    	if(this.singleSelect === false){
    		
    	}else{
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
	afterFinish: function(){
		for(var i=0;i<this.selectDays.length;i++){
			var d = this.selectDays[i];
			if(d.getFullYear() == this.year && d.getMonth()+1 == this.month){
				this.onSelectDay(this.days[d.getDate()]);
			}
		}		
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
		this.predraw(new Date(this.year, this.month - 2, 1));
	},
	/**
	 * 下一月
	 */
	nextMonth: function() {
		this.predraw(new Date(this.year, this.month, 1));
	},
	/**
	 * 上一年
	 */
	preYear: function() {
		this.predraw(new Date(this.year - 1, this.month - 1, 1));
	},
	/**
	 * 下一年
	 */
	nextYear: function() {
		this.predraw(new Date(this.year + 1, this.month - 1, 1));
	},
  	/**
  	 * 根据日期画日历
  	 * @param {Date} date 当前日期
  	 */
  	predraw: function(date) {
  		if(date=='' || !date.getFullYear) date = new Date();
		this.year = date.getFullYear(); this.month = date.getMonth() + 1;
		this.draw();
		this.fireEvent('draw', this);
  	},
  	/**
  	 * 渲染日历
  	 */
	draw: function() {
		//用来保存日期列表
		var arr = [];
		//用当月第一天在一周中的日期值作为当月离第一天的天数
		for(var i = 1, firstDay = new Date(this.year, this.month - 1, 1).getDay(); i <= firstDay; i++){ 
			arr.push(0); 
		}
		//用当月最后一天在一个月中的日期值作为当月的天数
		for(var i = 1, monthDay = new Date(this.year, this.month, 0).getDate(); i <= monthDay; i++){ 
			arr.push(i); 
		}
		//清空原来的日期对象列表
		this.days = [];
		//先清空内容再插入(ie的table不能用innerHTML)
		while(this.tbody.hasChildNodes()){ 
			this.tbody.removeChild(this.tbody.firstChild); 
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
				var cell = document.createElement("td"); 
				cell.className = "item-day";
				cell.innerHTML = "&nbsp;";
				Ext.fly(cell).set({'_date':'0'});
				if(arr.length){
					var d = arr.shift();
					if(d){
						cell.innerHTML = d;
						this.days[d] = cell;
						var on = new Date(this.year, this.month - 1, d);
						Ext.fly(cell).set({'_date':''+on.getTime()});
						//判断是否今日
						this.isSame(on, new Date()) && this.onToday(cell);
						//判断是否选择日期
						this.selectDay && this.isSame(on, this.selectDay) && this.onSelectDay(cell);
					}
				}
				row.appendChild(cell);
			}
			this.tbody.appendChild(row);
		}
		
		
		this.yearSpan.dom.innerHTML = this.year; 
		this.monthSpan.dom.innerHTML = this.month;
		this.afterFinish();
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