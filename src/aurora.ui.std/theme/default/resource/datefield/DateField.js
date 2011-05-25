/**
 * @class Aurora.DateField
 * @extends Aurora.Component
 * <p>日期组件.
 * @author huazhen.wu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.DateField = Ext.extend($A.Component, {
	bodyTpl:['<TABLE cellspacing="0">',
				'<CAPTION class="item-dateField-caption"></CAPTION>',
				'<THEAD class="item-dateField-head">',
					'<TR>',
						'<TD>{sun}</TD>',
						'<TD>{mon}</TD>',
						'<TD>{tues}</TD>',
						'<TD>{wed}</TD>',
						'<TD>{thur}</TD>',
						'<TD>{fri}</TD>',
						'<TD>{sat}</TD>',
					'</TR>',
				'</THEAD>',
				'<TBODY>',
				'</TBODY>',
			'</TABLE>'],
	preMonthTpl:['<DIV class="item-dateField-pre" title="{title}" onclick="$(\'{id}\').preMonth()"></DIV>'],
	nextMonthTpl:['<DIV class="item-dateField-next" title="{title}" onclick="$(\'{id}\').nextMonth()"></DIV>'],
	preYearTpl:['<DIV class="item-dateField-preYear" title="{title}" onclick="$(\'{id}\').preYear()"></DIV>'],
	nextYearTpl:['<DIV class="item-dateField-nextYear" title="{title}" onclick="$(\'{id}\').nextYear()"></DIV>'],
    initComponent : function(config){
    	$A.DateField.superclass.initComponent.call(this, config);
    	if(this.height)this.rowHeight=(this.height-18*(Ext.isIE?3:2))/6;
        this.body = new Ext.Template(this.bodyTpl).append(this.wrap.dom,{sun:_lang['datefield.sun'],mon:_lang['datefield.mon'],tues:_lang['datefield.tues'],wed:_lang['datefield.wed'],thur:_lang['datefield.thur'],fri:_lang['datefield.fri'],sat:_lang['datefield.sat']},true);
        this.head=this.body.child(".item-dateField-caption").dom;
        if(this.enableyearbtn=="both"||this.enableyearbtn=="pre")
    		this.preMonthBtn = new Ext.Template(this.preYearTpl).append(this.head,{title:_lang['datefield.preYear'],id:this.id},true);
    	if(this.enableyearbtn=="both"||this.enableyearbtn=="next")
    		this.nextMonthBtn = new Ext.Template(this.nextYearTpl).append(this.head,{title:_lang['datefield.nextYear'],id:this.id},true);
        if(this.enablemonthbtn=="both"||this.enablemonthbtn=="pre")
    		this.preMonthBtn = new Ext.Template(this.preMonthTpl).append(this.head,{title:_lang['datefield.preMonth'],id:this.id},true);
    	if(this.enablemonthbtn=="both"||this.enablemonthbtn=="next")
    		this.nextMonthBtn = new Ext.Template(this.nextMonthTpl).append(this.head,{title:_lang['datefield.nextMonth'],id:this.id},true);
    	this.head.text=document.createElement('span');
    	this.head.appendChild(this.head.text);
    },
    processListener: function(ou){
    	$A.DateField.superclass.processListener.call(this,ou);
    	this.body[ou]('mousewheel',this.onMouseWheel,this);	
    	this.body[ou]("mouseover", this.onMouseOver, this);
    	this.body[ou]("mouseout", this.onMouseOut, this);
    	this.body[ou]("mouseup",this.onSelect,this);
    	//this.body[ou]("keydown",this.onKeyDown,this);
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
    	delete this.body;
    	delete this.head;
	},
	onMouseWheel:function(e){
        this[(e.getWheelDelta()>0?'pre':'next')+(e.ctrlKey?'Year':'Month')]();
        e.stopEvent();
	},
    onMouseOver: function(e,t){
    	this.out();
    	if(((t = Ext.fly(t)).hasClass('item-day')||(t = t.parent('.item-day'))) && t.getAttributeNS("",'_date') != '0'){
    		$A.DateField.superclass.onMouseOver.call(this,e);
			this.over(t);
    	}
    },
    onMouseOut: function(e){
    	$A.DateField.superclass.onMouseOut.call(this,e);
    	this.out();
    },
    over : function(t){
    	t = t||this.body.child('td.item-day')
    	this.overTd = t; 
		t.addClass('dateover');
    },
    out : function(){
    	if(this.overTd) {
    		this.overTd.removeClass('dateover');
    		this.overTd=null;
    	}
    },
    onSelect:function(e,t){
    	this.fireEvent("select",e,t);
    },
	onSelectDay: function(o){
		if(!o.hasClass('onSelect'))o.addClass('onSelect');
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
  	predraw: function(date,notFire) {
  		if(!date || !date instanceof Date)date = new Date();
  		this.date=date;
  		this.hours=date.getHours();this.minutes=date.getMinutes();this.seconds=date.getSeconds();
		this.year = date.getFullYear(); this.month = date.getMonth() + 1;
		this.draw(new Date(this.year,this.month-1,1,this.hours,this.minutes,this.seconds));
		if(!notFire)this.fireEvent("draw",this);
  	},
  	/**
  	 * 渲染日历
  	 */
	draw: function(date) {
		//用来保存日期列表
		var arr = [],year=date.getFullYear(),month=date.getMonth()+1,hour=date.getHours(),minute=date.getMinutes(),second=date.getSeconds();
		this.head.text.innerHTML=year + _lang['datefield.year'] + month + _lang['datefield.month'];
		//用当月第一天在一周中的日期值作为当月离第一天的天数,用上个月的最后天数补齐
		for(var i = 1, firstDay = new Date(year, month - 1, 1).getDay(),lastDay = new Date(year, month - 1, 0).getDate(); i <= firstDay; i++){ 
			arr.push((this.enablebesidedays=="both"||this.enablebesidedays=="pre")?new Date(year, month - 2, lastDay-firstDay+i,hour,minute,second):null);
		}
		//用当月最后一天在一个月中的日期值作为当月的天数
		for(var i = 1, monthDay = new Date(year, month, 0).getDate(); i <= monthDay; i++){ 
			arr.push(new Date(year, month - 1, i,hour,minute,second)); 
		}
		//用下个月的前几天补齐6行
		for(var i=1, monthDay = new Date(year, month, 0).getDay(),besideDays=7+(arr.length>5*7?0:7);i<besideDays-monthDay;i++){
			arr.push((this.enablebesidedays=="both"||this.enablebesidedays=="next")?new Date(year, month, i,hour,minute,second):null);
		}
		//先清空内容再插入(ie的table不能用innerHTML)
		var body = this.body.dom.tBodies[0];
		while(body.firstChild){
			Ext.fly(body.firstChild).remove();
		}
		//插入日期
		var k=0;
		while(arr.length){
			//每个星期插入一个tr
			var row = Ext.get(body.insertRow(-1));
			row.set({'r_index':k});
			if(k%2==0)row.addClass('week-alt');
			if(this.rowHeight)row.setHeight(this.rowHeight);
			k++;
			//每个星期有7天
			for(var i = 1; i <= 7; i++){
				var d = arr.shift();
				if(Ext.isDefined(d)){
					var cell = Ext.get(row.dom.insertCell(-1)); 
					if(d){
						cell.set({'c_index':i-1});
						cell.addClass(date.getMonth()==d.getMonth()?"item-day":"item-day item-day-besides");
						cell.update(this.renderCell(cell,d,d.getDate(),month)||d.getDate());
						if(cell.disabled){
							cell.set({'_date':'0'});
							cell.addClass("item-day-disabled");
						}else {
							cell.set({'_date':(''+d.getTime())});
							if(this.format)cell.set({'title':d.format(this.format)})
						}
						//判断是否今日
						if(this.isSame(d, new Date())) cell.addClass("onToday");
						//判断是否选择日期
						if(this.selectDay && this.isSame(d, this.selectDay))this.onSelectDay(cell);
					}
				}
			}
		}
	},
	renderCell:function(cell,date,day,currentMonth){
		if(this.dayrenderer)
			return $A.getRenderer(this.dayrenderer).call(this,cell,date,day,currentMonth);
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
	},
	focus : function(){
		this.body.focus();	
	}
});