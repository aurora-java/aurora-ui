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
						'<TD>{sun}</TD>',
						'<TD>{fri}</TD>',
						'<TD>{sat}</TD>',
					'</TR>',
				'</THEAD>',
				'<TBODY>',
				'</TBODY>',
			'</TABLE>'],
	preMonthTpl:['<DIV class="item-dateField-pre" title="{pre}"></DIV>'],
	nextMonthTpl:['<DIV class="item-dateField-next" title="{next}"></DIV>'],
    initComponent : function(config){
    	$A.DateField.superclass.initComponent.call(this, config);
    	if(this.height)this.rowHeight=(this.height-18*2)/6;
        this.body = new Ext.Template(this.bodyTpl).append(this.wrap.dom,{sun:_lang['datefield.sun'],mon:_lang['datefield.mon'],tues:_lang['datefield.tues'],wed:_lang['datefield.wed'],sun:_lang['datefield.sun'],fri:_lang['datefield.fri'],sat:_lang['datefield.sat']},true);
        this.head=this.body.child(".item-dateField-caption").dom;
        if(this.enablemonthbtn=="both"||this.enablemonthbtn=="pre")
    		this.preMonthBtn = new Ext.Template(this.preMonthTpl).append(this.head,{pre:_lang['datefield.preMonth']},true);
    	if(this.enablemonthbtn=="both"||this.enablemonthbtn=="next")
    		this.nextMonthBtn = new Ext.Template(this.nextMonthTpl).append(this.head,{next:_lang['datefield.nextMonth']},true);
    	this.head.text=document.createElement('span');
    	this.head.appendChild(this.head.text);
    },
    processListener: function(ou){
    	$A.DateField.superclass.processListener.call(this,ou);
    	if(this.enablemonthbtn=="both"||this.enablemonthbtn=="pre")
    		this.preMonthBtn[ou]("click", this.preMonth, this);
    	if(this.enablemonthbtn=="both"||this.enablemonthbtn=="next")
    		this.nextMonthBtn[ou]("click", this.nextMonth, this);
    	this.body[ou]('mousewheel',this.onMouseWheel,this);	
    	this.body[ou]("mouseover", this.onMouseOver, this);
    	this.body[ou]("mouseout", this.onMouseOut, this);
    	this.body[ou]("mouseup",this.onSelect,this);
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
		var delta = e.getWheelDelta();
        if(delta > 0){
            this.preMonth();
            e.stopEvent();
        }
		if(delta < 0){
            this.nextMonth();
            e.stopEvent();
        }
	},
    onMouseOver: function(e){
    	if(this.overTd) Ext.fly(this.overTd).removeClass('dateover');
    	if((Ext.fly(e.target).hasClass('item-day')||Ext.fly(e.target).hasClass('onToday')) && Ext.fly(e.target).getAttribute('_date') != '0'){
    		this.overTd = e.target; 
    		Ext.fly(this.overTd).addClass('dateover');
    	}
    },
    onMouseOut: function(e){
    	if(this.overTd) Ext.fly(this.overTd).removeClass('dateover');
    },
    onSelect:function(e){
    	this.fireEvent("select",e);
    },
	onSelectDay: function(o){
		if(!Ext.fly(o).hasClass('onSelect'))Ext.fly(o).addClass('onSelect');
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
			if(this.enablebesidedays=="both"||this.enablebesidedays=="pre")
				arr.push([n=lastDay-firstDay+i,new Date(year, month - 2, n,hour,minute,second),"item-day item-day-besides"]);
			else arr.push([null,null,null]);
		}
		//用当月最后一天在一个月中的日期值作为当月的天数
		for(var i = 1, monthDay = new Date(year, month, 0).getDate(); i <= monthDay; i++){ 
			arr.push([i,new Date(year, month - 1, i,hour,minute,second),"item-day"]); 
		}
		//用下个月的前几天补齐6行
		for(var i=1, monthDay = new Date(year, month, 0).getDay(),besideDays=7+(arr.length>5*7?0:7);i<besideDays-monthDay;i++){
			if(this.enablebesidedays=="both"||this.enablebesidedays=="next")arr.push([i,new Date(year, month, i,hour,minute,second),"item-day item-day-besides"]);
			else arr.push([null,null,null]);
		}
		//先清空内容再插入(ie的table不能用innerHTML)
		while(this.body.dom.tBodies[0].firstChild)
			this.body.dom.tBodies[0].removeChild(this.body.dom.tBodies[0].firstChild);
		
		//插入日期
		var k=0;
		while(arr.length){
			//每个星期插入一个tr
			var row = document.createElement("tr");
			if(this.rowHeight)row.style.height=this.rowHeight+"px";
			if(k%2==0)row.className='week-alt';
			k++;
			//每个星期有7天
			for(var i = 1; i <= 7; i++){
				var d = arr.shift();
				if(d){
					var cell = document.createElement("td"); 
					if(d[1]){
						cell.className = d[2];
						cell.innerHTML =this.renderCell(cell,d[1],d[0])||d[0];
						if(cell.disabled){
							Ext.fly(cell).set({'_date':'0'});
							Ext.fly(cell).addClass("item-day-disabled");
						}else {
							Ext.fly(cell).set({'_date':(''+d[1].getTime())});
							if(this.format)Ext.fly(cell).set({'title':d[1].format(this.format)})
						}
						//判断是否今日
						if(this.isSame(d[1], new Date())) cell.className = "onToday";
						//判断是否选择日期
						if(this.selectDay && this.isSame(d[1], this.selectDay))this.onSelectDay(cell);
					}
				}
				row.appendChild(cell);
			}
			this.body.dom.tBodies[0].appendChild(row);
		}
	},
	renderCell:function(cell,date,text){
		if(this.dayrenderer)$A.getRenderer(this.dayrenderer).call(this,cell,date,text);
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