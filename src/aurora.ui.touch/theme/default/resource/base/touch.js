var Touch = {};
(function(T,undefined){
    var cmpCache = {},
        hasTouch = 'ontouchstart' in window,
        START_EV = hasTouch ? 'touchstart' : 'mousedown',
        MOVE_EV = hasTouch ? 'touchmove' : 'mousemove',
        END_EV = hasTouch ? 'touchend' : 'mouseup',
        CANCEL_EV = hasTouch ? 'touchcancel' : 'mouseup',
        PX = 'px',_ = '#',
        funpro = Function.prototype,
        slice = Array.prototype.slice;
if(!funpro.bind){
    funpro.bind = function(context){
        if (arguments.length < 2 && arguments[0] === undefined) return this;
        var __method = this, args = slice.call(arguments, 1);
        return function() {
            var a = args.concat(slice.call(arguments,0));
            return __method.apply(context, a);
        }
    }
}
$.isEmpty = function(v, allowBlank){
    return v === null || v === undefined || (($.isArray(v) && !v.length)) || (!allowBlank ? v === '' : false);
}
T.get = function(id){
    return cmpCache[id];
}
T.Masker = function(){
    var container = {};
    return {
        mask : function(el,msg){
            var el = $(el),
                w = el.width(),
                h = el.height(),
                spanHtml = msg?'<span>'+msg+'</span>':'',
                masker = container[el.selector],sp;
            if(masker){
                sp = masker.children('span');
                if(msg){
                    if(!sp || !sp.length){
                        sp = $(spanHtml).appendTo(masker);
                    }else
                        sp.html(msg)
                }else if(sp){
                    sp.remove();
                }
            }else {
                var isBody = !el.parent('body').length,
                    wrap = isBody?el:el.parent(),
                    offset = el.offset(),
                    opt = {'z-index': el.css('z-index') == 'auto' ? 0 : el.css('z-index') + 1},
                    p = ['<div class="touch-mask"  style="position: absolute;"><div unselectable="on"></div>'];
                if(msg)p.push(spanHtml);
                p.push('</div>');
                $.extend(opt,isBody?{
                    'top':0,'bottom':0,'left':0,'right':0
                }:{
                    'top':offset.top + PX,
                    'left':offset.left + PX,
                    'width':w + PX,
                    'height':h + PX
                })
                masker = $(p.join('')).appendTo(wrap)
                    .css(opt);
                sp = masker.children('span');
                container[el.selector] = masker;
            }
            sp.css({'left':(w - sp.width())/2 + PX,'top':masker.height()/2 - 11 + PX});
        },
        unmask : function(el){
            var el = $(el),
                masker = container[el.selector];
            if(masker) {
                masker.remove();
                container[el.selector] = null;
                delete container[el.selector];
            }
        }
    }
}()
T.Ajax = function(config){
    cmpCache[config.id] = this;
    delete config.id;
    $.extend(this.options,config);
}
T.Ajax.timeout = 0;
$.extend(T.Ajax.prototype,{
    options : {
      type: 'POST',
      dataType: 'json',
      timeout: T.Ajax.timeout,
      parameters : {}
    },
    addParameter : function(key,value){
        if($.isObject(key)){
            for(var c in key){
                this.addParameter(c,key[c]);
            }
        }else
            this.options.parameters[key]={'value':value};
        return this;
    },
    removeParameter : function(key){
        delete this.options.parameters[key];
        return this;
    },
    setUrl : function(url){
        this.options.url = url;
        return this;
    },
    request : function(){
        var data = {},p = this.options.parameters;
        for(var key in p){
            var v = p[key],bind = v.bind;
            data[key] = bind?$(_+bind).val():v.value;
        }
        this.options.data = {
            _request_data: JSON.stringify({
                'parameter': data
            })
        }
        this.xhr = $.ajax(this.options);
        return this;
    }
})

T.DateField = function(config){
    cmpCache[config.id] = this;
    $.extend(this,config);
    var now = new Date(),
        year = config.year || now.getFullYear(),
        month = config.month || now.getMonth() + 1;
    this.defaultDate = new Date(year,month - 1);
    this.wrap = $(_ + config.id);
    this.initComponent();
    this.processListener('on');
    this.buildViews();
}
$.extend(T.DateField.prototype,{
    initComponent : function(){
        this.head = this.wrap.children('.datefield-head');
        this.content = this.wrap.children('.datefield-scroller')
            .width(this.wrap.width() * 12);
        this.title = this.head.children('.datefield-date').children('div');
        this.preBtn = this.head.children('button.pre');
        this.nextBtn = this.head.children('button.next');
        var sf = this,isUnbind = false,isClick = false,time;
        this.iscroll = new iScroll(this.id, {
            snap: true,
            momentum: false,
            hScrollbar: false,
            onScrollStart : function(){
                sf.wrap.trigger('scrollstart'); 
            },
            onBeforeScrollStart : function(e){
                isClick = true;
            },
            onBeforeScrollEnd : function(e){
                if(this.moved){
                    isUnbind = true;
                    this._unbind(START_EV);
                }else if(isClick){
                    var el = $(e.target),
                    d = el.attr('_date')||((el = el.parent('[_date]')).length && el.attr('_date'));
                    if(d)sf.wrap.trigger('itemclick',new Date(Number(d)));
                }
                isClick = false;
            },
            onScrollEnd: function(){
                if(isUnbind){
                    this._bind(START_EV);
                    isUnbind = false;
                }
                sf.reViews();
                sf.reflashHead();
            }
         });
    },
    processListener : function(ou){
        if(this.listeners)this.wrap[ou](this.listeners);
    },
    reViews : function(){
        var iscroll = this.iscroll,
            currPageX = iscroll.currPageX,
            date = this.date = new Date(this.months[currPageX]),
            month = date.getMonth() + 1,
            year = date.getFullYear(),
            views = this.views,
            pdate = new Date(year,month-3);
        if(!views[pdate]){
            views[pdate] = new T.DateField.View(pdate,this,true);
            views[new Date(year,month+9)].destroy();
            iscroll.scrollToPage(currPageX + 1,null,0)
        }else{
            var ndate = new Date(year,month+1);
            if(!views[ndate]){
                views[ndate] = new T.DateField.View(ndate,this);
                views[new Date(year,month-11)].destroy();
                iscroll.scrollToPage(currPageX - 1,null,0)
            }
        }
    },
    clearViews : function(){
        if(this.views){
            for(var c in this.views){
                this.views[c].destroy() 
            }
        }
        this.views = {};
        this.months = [];
    },
    buildViews : function(d){
        this.clearViews();
        d = d || this.defaultDate;
        for(var m = 0;m < 12;m++){
            var date = new Date(d.getFullYear(),m);
            this.views[date] = new T.DateField.View(date,this);
        }
        this.goToDate(d);
    },
    reflashHead : function(){
        this.wrap.trigger('refresh',this.date);
    },
    preMonth : function(){
        this.goToDate(new Date(this.date.getFullYear(),this.date.getMonth() - 1),200);
    },
    nextMonth : function(){
        this.goToDate(new Date(this.date.getFullYear(),this.date.getMonth() + 1),200);
    },
    goToDate : function(date,duration){
        date = new Date(date.getFullYear(),date.getMonth());
        if(date.getTime() == (this.date && this.date.getTime()))return;
        if(this.views[date]){
            this.iscroll.scrollToPage(this.months.indexOf(date.getTime()),null,duration||0);
        }else this.buildViews(date);
    },
    redraw : function(data){
        var view = this.views[this.date];
        view.data = data;
        view.isAjax = !!data;
        view.draw();
    },
    isAjax : function(date){
        var view = this.views[date];
        return !!view && view.isAjax;
    }
})

T.DateField.View = function(date,options,insertFirst){
    options.months[insertFirst?'unshift':'push'](date.getTime());
    this.date = date;
    this.options = options;
    this.el = $(this.tpl.join('')).width(options.wrap.width())[insertFirst?'prependTo':'appendTo'](options.content);
    this.body = this.el.children('tbody')
    this.draw();
}
$.extend(T.DateField.View.prototype,{
    tpl : ['<table class="datefield-view" cellspacing="0"><thead><tr height="20',PX,'"><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr></thead><tbody></tbody></table>'],
    offset : function(){
        return this.el[0].offsetLeft;
    },
    draw : function(){
        //用来保存日期列表
        var arr = [],date = this.date,year=date.getFullYear(),month=date.getMonth()+1,that = this.options
//      ,hour=date.getHours(),minute=date.getMinutes(),second=date.getSeconds();
        //用当月第一天在一周中的日期值作为当月离第一天的天数,用上个月的最后天数补齐
        for(var i = 1, firstDay = new Date(year, month - 1, 1).getDay(),lastDay = new Date(year, month - 1, 0).getDate(); i <= firstDay; i++){ 
            arr.push(
//          (this.enablebesidedays=="both"||this.enablebesidedays=="pre")?new Date(year, month - 2, lastDay-firstDay+i,hour,minute,second):
            null);
        }
        //用当月最后一天在一个月中的日期值作为当月的天数
        for(var i = 1, monthDay = new Date(year, month, 0).getDate(); i <= monthDay; i++){ 
            arr.push(new Date(year, month - 1, i
//          ,hour,minute,second
            )); 
        }
        //用下个月的前几天补齐6行
        for(var i=1, monthDay = new Date(year, month, 0).getDay(),besideDays=43-arr.length;i<besideDays;i++){
            arr.push(
//          (this.enablebesidedays=="both"||this.enablebesidedays=="next")?new Date(year, month, i,hour,minute,second):
            null);
        }
        //先清空内容再插入
        this.body.text('');
        //插入日期
        var k=0;
        while(arr.length){
            //每个星期插入一个tr
            var row = $(this.body[0].insertRow(-1));
            row.attr({'r_index':k
//          ,'vAlign':'top'
            });
            if(k%2==0)row.addClass('week-alt');
            k++;
            //每个星期有7天
            for(var i = 1; i <= 7; i++){
                var d = arr.shift();
                if(d !== undefined){
                    var cell = $(row[0].insertCell(-1)); 
                    if(d){
                        cell.attr({'c_index':i-1});
//                      cell.addClass(date.getMonth()==d.getMonth()?"item-day":"item-day item-day-besides");
                        var weekday = d.getDay(),
                            thisdate = d.getDate(),
                            renderer = that.dayrenderer;
                        if(weekday == 0 || weekday == 6)thisdate = '<span style="color:red">'+thisdate+'</span>';
                        cell.html(renderer && renderer.call(that,cell,d,thisdate,this.data)|| thisdate);
//                      cell.update(this.renderCell(cell,d,d.getDate(),month)||d.getDate());
//                      if(cell.disabled){
//                          cell.attr({'_date':'0'});
//                          cell.addClass("item-day-disabled");
//                      }else {
                            cell.attr({'_date':(''+d.getTime())});
//                          if(this.format)cell.set({'title':d.format(this.format)})
//                      }
                        //判断是否今日
//                      if(this.isSame(d, new Date())) cell.addClass("onToday");
                        //判断是否选择日期
//                      if(this.selectDay && this.isSame(d, this.selectDay))this.onSelectDay(cell);
                    }else cell.html('&#160;');
                }
            }
        }
    },
    destroy : function(){
        this.el.remove();
        this.options.months.splice(this.options.months.indexOf(this.date.getTime()),1);
        delete this.options.views[this.date];
    }
});

T.SwitchButton = function(config){
    cmpCache[config.id] = this;
    var opt = this.options;
    $.extend(opt , config);
    this.wrap = $(_ + config.id);
    opt.defaultvalue = opt.defaultstatus == 'off'? opt.offvalue : opt.onvalue;
    this.wrap.val(config.value || opt.defaultvalue);
    this.initComponent();
    this.refresh();
    this.processListener();
}
$.extend(T.SwitchButton.prototype,{
    options : {
        on: '开',
        off: '关',
        onvalue: 'Y',
        offvalue: 'N',
        defaultstatus:'off'
    },
    initComponent : function(){
        this.btn = this.wrap.children('.switch-btn');
    },
    refresh : function(){
        var opt = this.options,
            wrap = this.wrap,
            rightside = wrap.width() - this.btn.width() - 2,
            x = (this.status = wrap.val() == opt.onvalue) ? rightside : 0;
        this.rightside = rightside;
        this._pos(x);
    },
    processListener : function(){
        var touch = {},
            _start = function(e){
                touch.x = (hasTouch?e.touches[0]:e).pageX;
                touch.startX = this.x;
                $(document).on(MOVE_EV,_move);
                $(document).on(END_EV,_end);
            }.bind(this),
            _move = function(e){
                touch.moved = true;
                var pageX = (hasTouch?e.touches[0]:e).pageX,
                    newX = this.x + pageX - touch.x,
                    r = this.rightside;
                if(newX < 0) newX = 0;  
                else if(newX > r) newX = r;
                else touch.x = pageX;
                this._pos(newX)
            }.bind(this),
            _end = function(e){
                $(document).off(MOVE_EV,_move);
                $(document).off(END_EV,_end);
                if(this.x != touch.startX || !touch.moved)
                    this.trigger();
                touch = {};
            }.bind(this);
        this.wrap.on(START_EV,_start)
    },
    _pos : function(x,time){
        this.x = $.isEmpty(x)?this.x||0:x;
        this.btn.animate({'translate3d':[this.x+PX,0,0].join(',')},time||0);
    },
    on : function(){
        this.status = true;
        this.wrap.val(this.options.onvalue);
        this._pos(this.rightside,100);
    },
    off : function(){
        this.status = false;
        this.wrap.val(this.options.offvalue);
        this._pos(0,100);
    },
    trigger : function(){
        this[this.status?'off':'on']();
    }
});

/** Touch.List **/
T.List = function(config){
    var bid  = config.bind;
    this.id = config.id;
    this.renderer = config.renderer;
    this.total = 0;
    this.pageSize = config.size||10;
    this.currentPage = 1;
    var ax = T.get(bid);
    this.ajax = ax;
    cmpCache[config.id] = this;
    var sf = this;
    $(document).on('ajaxSuccess', function(e, xhr, options){
        if(xhr == ax.xhr){
            var data = JSON.parse(xhr.responseText);
            if(data && data.success){
                sf.total = data.result.totalCount || 0;
                sf.totalPage = Math.ceil(sf.total/sf.pageSize) || 0;
                if(data.result.totalCount > 0 ){
                    var ls = ['<ul>'];
                    var records = [].concat(data.result.record);
                    var rc = window[sf.renderer];
                    for(var i=0;i<records.length;i++){
                        var record = records[i];
                        ls[ls.length] = '<li>';
                        if(rc){
                            ls[ls.length] = rc.call(window,record); 
                        }else{
                            ls[ls.length] = record;
                        }
                        ls[ls.length] = '</li>'
                    }
                    ls[ls.length] = '</ul>'
                    if(config.showpagebar){
                        var bar = ['<table width="100%" border="0" cellspacing="3">',
                                '<tr>',
                                    '<td width="40%">',
                                        '<button type="button" id="'+config.id+'_pre" class="btn gray" style="float:right;font-size:16px;height:30px;">上一页</button>',
                                    '</td>',
                                    '<td width="20%" id="'+config.id+'_info" style="text-align:center;font-size:16px;">'+sf.currentPage+'/'+sf.totalPage+'</td>',
                                    '<td width="40%">',                                                
                                        '<button type="button" id="'+config.id+'_next" class="btn gray" style="float:right;font-size:16px;height:30px;">下一页</button>',
                                    '</td>',
                                '</tr>',
                            '</table>'];
                            ls[ls.length] = bar.join('');
                    }
                    
                    $('#'+config.id).html(ls.join(''));
                    $('#'+config.id+'_pre').on("click",function(){Touch.get(config.id).pre()});
                    $('#'+config.id+'_next').on("click",function(){Touch.get(config.id).next()});
                }else {
                    $('#'+config.id).html('未找到任何数据!');
                }
                if(config.callback) window[config.callback].call(window);
                
            }
        }
    })
    
    this.url = this.ajax.options.url;
    this.prefix = this.url.indexOf('?') == -1 ? '?' : '&' 
    this.ajax.options.url = this.url + this.prefix + 'pagenum=' + this.currentPage + '&pagesize='+this.pageSize;
    if(config.autoquery == true){
        this.ajax.request(); 
    }
}
$.extend(T.List.prototype,{
    loading: function(){
        $('#'+this.id).html('正在查询...');
    },
    query:function(){
        this.loading();
        this.currentPage = 1;
        this.ajax.options.url = this.url + this.prefix + 'pagenum=' + this.currentPage + '&pagesize='+this.pageSize;
        this.ajax.request();    
    },
    pre:function(){
        this.loading();
        if(this.currentPage -1 <=0)return;
        this.currentPage--;
        this.ajax.options.url = this.url + this.prefix + 'pagenum=' + this.currentPage + '&pagesize='+this.pageSize;
        this.ajax.request();    
    },
    next:function(){
        this.loading();
        if(this.currentPage+1> this.totalPage)return;
        this.currentPage++;
        this.ajax.options.url = this.url + this.prefix + 'pagenum=' + this.currentPage + '&pagesize='+this.pageSize;
        this.ajax.request(); 
    }
})

Date.prototype.format = function(format)
{
    var o =
    {
        "M+" : this.getMonth()+1, //month
        "d+" : this.getDate(),    //day
        "h+" : this.getHours(),   //hour
        "m+" : this.getMinutes(), //minute
        "s+" : this.getSeconds(), //second
        "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
        "S" : this.getMilliseconds() //millisecond
    }
    if(/(y+)/.test(format))
    format=format.replace(RegExp.$1,(this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
    if(new RegExp("("+ k +")").test(format))
    format = format.replace(RegExp.$1,RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
    return format;
}

})(Touch)