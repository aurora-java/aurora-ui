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
				'<CAPTION class="item-dateField-caption">',
					'{preYearBtn}',
					'{nextYearBtn}',
					'{preMonthBtn}',
					'{nextMonthBtn}',
					'<SPAN>',
						'<SPAN atype="item-year-span" style="margin-right:5px;cursor:pointer"></SPAN>',
						'<SPAN atype="item-month-span" style="cursor:pointer"></SPAN>',
					'</SPAN>',
				'</CAPTION>',
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
	preMonthTpl:'<DIV class="item-dateField-pre" title="{preMonth}" onclick="$(\'{id}\').preMonth()"></DIV>',
	nextMonthTpl:'<DIV class="item-dateField-next" title="{nextMonth}" onclick="$(\'{id}\').nextMonth()"></DIV>',
	preYearTpl:'<DIV class="item-dateField-preYear" title="{preYear}" onclick="$(\'{id}\').preYear()"></DIV>',
	nextYearTpl:'<DIV class="item-dateField-nextYear" title="{nextYear}" onclick="$(\'{id}\').nextYear()"></DIV>',
	popupTpl:'<DIV class="item-popup" atype="date-popup" style="vertical-align: middle;background-color:#fff;visibility:hidden"></DIV>',
    initComponent : function(config){
    	$A.DateField.superclass.initComponent.call(this, config);
    	if(this.height)this.rowHeight=(this.height-18*(Ext.isIE?3:2))/6;
    	var data = {sun:_lang['datefield.sun'],mon:_lang['datefield.mon'],tues:_lang['datefield.tues'],wed:_lang['datefield.wed'],thur:_lang['datefield.thur'],fri:_lang['datefield.fri'],sat:_lang['datefield.sat']}
        if(this.enableyearbtn=="both"||this.enableyearbtn=="pre")
        	data.preYearBtn = new Ext.Template(this.preYearTpl).apply({preYear:_lang['datefield.preYear'],id:this.id});
    	if(this.enableyearbtn=="both"||this.enableyearbtn=="next")
    		data.nextYearBtn = new Ext.Template(this.nextYearTpl).apply({nextYear:_lang['datefield.nextYear'],id:this.id});
        if(this.enablemonthbtn=="both"||this.enablemonthbtn=="pre")
    		data.preMonthBtn = new Ext.Template(this.preMonthTpl).apply({preMonth:_lang['datefield.preMonth'],id:this.id});
    	if(this.enablemonthbtn=="both"||this.enablemonthbtn=="next")
    		data.nextMonthBtn = new Ext.Template(this.nextMonthTpl).apply({nextMonth:_lang['datefield.nextMonth'],id:this.id});
        this.body = new Ext.Template(this.bodyTpl).append(this.wrap.dom,data,true);
        this.yearSpan = this.body.child("span[atype=item-year-span]");
        this.monthSpan = this.body.child("span[atype=item-month-span]");
        this.popup = new Ext.Template(this.popupTpl).append(this.body.child('caption').dom,{},true);
        //this.popup = new Ext.Template(this.popupTpl).append(this.wrap.dom,true);
    },
    processListener: function(ou){
    	$A.DateField.superclass.processListener.call(this,ou);
    	this.body[ou]('mousewheel',this.onMouseWheel,this);	
    	this.body[ou]("mouseover", this.onMouseOver, this);
    	this.body[ou]("mouseout", this.onMouseOut, this);
    	this.body[ou]("click",this.onSelect,this);
    	this.yearSpan[ou]("click",this.onViewShow,this);
    	this.monthSpan[ou]("click",this.onViewShow,this);
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
    	t = t||this.body.last().child('td.item-day')
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
    	var sf = this,td = Ext.get(t),_date;
    	if(td.parent('div[atype="date-popup"]')){
    		sf.onViewClick(e,td);
    	}else{
    		_date =  td.getAttributeNS('','_date');
			if(_date && _date != '0'){
		    	sf.fireEvent("select",e,t,sf, new Date(Number(_date)));
			}
    	}
    },
	onSelectDay: function(o){
		if(!o.hasClass('onSelect'))o.addClass('onSelect');
	},
	onViewShow : function(e,t){
		var span = Ext.get(t);
		this.focusSpan = span;
		var head = this.body.child('thead'),xy = head.getXY();
		this.popup.moveTo(xy[0],xy[1]);
		this.popup.setWidth(head.getWidth());
		this.popup.setHeight(head.getHeight()+head.next().getHeight());
		if(span.getAttributeNS("","atype")=="item-year-span")
			this.initView(this.year,100,true);
		else
			this.initView(7,60);
		Ext.get(document.documentElement).on("mousedown", this.viewBlur, this);
		this.popup.show();
	},
	onViewHide : function(){
		Ext.get(document.documentElement).un("mousedown", this.viewBlur, this);
		this.popup.hide();
	},
	viewBlur : function(e,t){
		if(!this.popup.contains(t) && !(this.focusSpan.contains(t)||this.focusSpan.dom==t)){    		
    		this.onViewHide();
        }
	},
	onViewClick : function(e,t){
		if(t.hasClass('item-day')){
			if(this.focusSpan.getAttributeNS("","atype")=="item-year-span")
				this.year = t.getAttributeNS("",'_data');
			else
				this.month = t.getAttributeNS("",'_data');
			this.year -- ;
			this.nextYear();
			this.onViewHide();
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
		this.yearSpan.update(year+_lang['datefield.year']);
		this.monthSpan.update(month+_lang['datefield.month']);
		//用当月第一天在一周中的日期值作为当月离第一天的天数,用上个月的最后天数补齐
		for(var i = 1, firstDay = new Date(year, month - 1, 1).getDay(),lastDay = new Date(year, month - 1, 0).getDate(); i <= firstDay; i++){ 
			arr.push((this.enablebesidedays=="both"||this.enablebesidedays=="pre")?new Date(year, month - 2, lastDay-firstDay+i,hour,minute,second):null);
		}
		//用当月最后一天在一个月中的日期值作为当月的天数
		for(var i = 1, monthDay = new Date(year, month, 0).getDate(); i <= monthDay; i++){ 
			arr.push(new Date(year, month - 1, i,hour,minute,second)); 
		}
		//用下个月的前几天补齐6行
		for(var i=1, monthDay = new Date(year, month, 0).getDay(),besideDays=43-arr.length;i<besideDays;i++){
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
					}else cell.update('&#160;');
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
	initView : function(num,width,isYear){
		var html = ["<table cellspacing='0' cellpadding='0' width='100%'><tr><td width='45%'></td><td width='10%'></td><td width='45%'></td></tr>"];
		for(var i=0,rows = (isYear?5:6),year = num - rows,year2 = num;i<rows;i++){
			html.push("<tr><td class='item-day' _data='"+year+"'>"+year+"</td><td></td><td class='item-day' _data='"+year2+"'>"+year2+"</td></tr>");
			year += 1;year2 += 1;
		}
		html.push("");
		if(isYear){
			html.push("<tr><td><div class='item-dateField-pre' onclick='$(\""+this.id+"\").initView("+(num-10)+","+width+",true)'></div></td>");
			html.push("<td><div class='item-dateField-close' onclick='$(\""+this.id+"\").onViewHide()'></div></td>")
			html.push("<td><div class='item-dateField-next' onclick='$(\""+this.id+"\").initView("+(num+10)+","+width+",true)'></div></td></tr>");
		}else{
			html.push("<td colspan='3' align='center'><div class='item-dateField-close' onclick='$(\""+this.id+"\").onViewHide()'></div></td>")
		}
		html.push("</table>");
		this.popup.update(html.join(''));
	}
});