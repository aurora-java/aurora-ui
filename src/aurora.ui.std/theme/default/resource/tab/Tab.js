/**
 * @class Aurora.Tab
 * @extends Aurora.Component
 * <p>Tab组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Tab = Ext.extend($A.Component,{
	constructor: function(config){
		$A.Tab.superclass.constructor.call(this,config);
	},
	initComponent:function(config){
		$A.Tab.superclass.initComponent.call(this, config);
		this.scriptwidth = config.scriptwidth||60;
		this.head = this.wrap.child('div[atype=tab.strips]'); 
		this.body = this.wrap.child('div.item-tab-body');
		this.scrollLeft = this.wrap.child('div[atype=scroll-left]');
		this.scrollRight = this.wrap.child('div[atype=scroll-right]');
		this.script = this.head.parent();
		this.selectTab(config.selected||0)
	},
	processListener: function(ou){
    	$A.Tab.superclass.processListener.call(this,ou);
    	this.script.parent()[ou]('mousedown',this.onMouseDown, this);
    	this.script.parent()[ou]('mouseup',this.onMouseUp, this);
    	this.script.parent()[ou]('mouseover',this.onMouseOver, this);
    	this.script.parent()[ou]('mouseout',this.onMouseOut, this);
    	this.script[ou]('click',this.onClick, this);
    	this.script[ou]('mousewheel',this.onMouseWheel, this);
    },
	initEvents:function(){
		$A.Tab.superclass.initEvents.call(this);   
		this.addEvents(
		/**
         * @event select
         * 选择事件.
         * @param {Aurora.Tab} tab Tab对象.
         * @param {Number} index 序号.
         */
		'select',
		'beforeadd'
		);
		
	},
	/**
	 * 选中某个Tab页
	 * @param {Number} index TabItem序号
	 */
	selectTab:function(index){		
		var tab=this.getTab(index);
		if(!tab)return;
		var activeStrip = tab.strip,activeBody = tab.body;
		index=tab.index;
		if(activeStrip){
			if(this.activeTab)this.activeTab.replaceClass('active','unactive');
			this.activeTab = activeStrip;
			activeStrip.replaceClass('unactive','active');
			var l=activeStrip.dom.offsetLeft,w=activeStrip.getWidth(),
				sl=this.script.getScroll().left,sw=this.script.getWidth(),hw=this.head.getWidth();
				tr=l+w-sl-sw,tl=sl-l;
			if(tr>0){
				this.scrollRight.removeClass('scroll-disabled');
				this.scrollLeft.removeClass('scroll-disabled');
				this.script.scrollTo('left',sl+tr);
			}else if(tl>0){
				this.scrollLeft.removeClass('scroll-disabled');
				this.script.scrollTo('left',sl-tl);
				this.scrollRight.removeClass('scroll-disabled');
			}
			if(sw+this.script.getScroll().left>=hw){
				this.script.scrollTo('left',hw-sw);
				this.scrollRight.addClass('scroll-disabled');
			}else if(index==0){
				this.script.scrollTo('left',0);
				this.scrollLeft.addClass('scroll-disabled');
			}
		}
		if(activeBody){
			if(this.activeBody){
				this.activeBody.setLeft('-10000px');
				this.activeBody.setTop('-10000px');
			}
			this.activeBody = activeBody;
			activeBody.setLeft('0px');
			activeBody.setTop('0px');
		}
		if(this.items[index].ref && activeBody.loaded!= true){
			this.load(this.items[index].ref,activeBody,index);
			activeBody.loaded = true;
		}else{
            this.fireEvent('select', this, index)
		}
	},
	stripTpl:['<div class="strip unactive"  unselectable="on" onselectstart="return false;">'
				,'<div class="strip-left"></div>',
				'<div style="width:{stripwidth}px;" class="strip-center"><div class="tab-close"></div>{prompt}</div>',
				'<div class="strip-right"></div>',
			'</div>'],
	bodyTpl:'<div style="width:{bodywidth}px;height:{bodyheight}px;left:-10000px;top:-10000px;" class="tab"></div>',
	/**
	 * 打开一个指定引用地址的Tab页，如果该指定的引用地址的页面已经被打开，则选中该Tab页
	 * @param {String} ref Tab页面的引用地址
	 * @param {String} prompt Tab的标题
	 */
	openTab : function(ref,prompt){
		var i=0;
		for(;i<this.items.length;i++){
			if(this.items[i].ref&&this.items[i].ref==ref){
				this.selectTab(i);return;
			}
		}
		var returnValue=this.fireEvent('beforeadd',this,i);
		if(returnValue!=false){
			this.items.push({'ref':ref});
			var stripwidth=$A.TextMetrics.measure(document.body,prompt).width+20;
			stripwidth=stripwidth<this.scriptwidth?this.scriptwidth:stripwidth;
			var width=this.head.getWidth()+stripwidth+6;
			this.head.setWidth(width);
			if(width>this.script.getWidth()){
				this.scrollLeft.setStyle({'display':'block'});
				this.scrollRight.setStyle({'display':'block'});
			}
			new Ext.Template(this.stripTpl).append(this.head.dom,{'prompt':prompt,'stripwidth':stripwidth});
			new Ext.Template(this.bodyTpl).append(this.body.dom,{'bodywidth':this.body.getWidth(),'bodyheight':this.body.getHeight()});
			this.selectTab(i);
		}
	},
	/**
	 * 关闭某个Tab页
	 * @param {Integer} index TabItem序号
	 */
	closeTab : function(o){
		var tab=this.getTab(o);
		if(!tab)return;
		var strip=tab.strip,body=tab.body,index=tab.index;
		if(!strip.child('div.tab-close')){
			alert('该Tab页无法被关闭')
			return;
		}
		this.items.splice(index,1);
		var width=this.head.getWidth()-strip.getWidth(),cmps=body.cmps;
		this.head.setWidth(width);
		if(width <= this.script.getWidth()){
			this.scrollLeft.setStyle({'display':'none'});
			this.scrollRight.setStyle({'display':'none'});
		}
		strip.remove();
		body.remove();
		this.activeBody=null;
		this.activeTab=null;
		delete body.loaded;
		setTimeout(function(){
        	for(var key in cmps){
        		var cmp = cmps[key];
        		if(cmp.destroy){
        			try{
        				cmp.destroy();
        			}catch(e){
        				alert('销毁window出错: ' + e)
        			}
        		}
        	}
        },10)
		this.selectTab(index);
	},
	getTab : function(o){
		var bodys = Ext.DomQuery.select('div.tab',this.body.dom),strips = Ext.DomQuery.select('div.strip',this.head.dom),strip,body;
		if(Ext.isNumber(o)){
			if(o<0)o=0;
			else o=Math.round(o);
			if(!strips[o])o=strips.length-1;
			strip=Ext.get(strips[o]);
			body=Ext.get(bodys[o]);
		}else {
			o=Ext.get(o);
			for(var i=0,l=strips.length;i<l;i++){
				if(Ext.get(strips[i]) == o){
					strip=o;
					body=Ext.get(bodys[i]);
					o=i;
					break;
				}
			}
		}
		return strip?{'strip':strip,'body':body,'index':o}:null;
	},
	scrollTo : function(lr){
		if(lr=='left'){
			this.script.scrollTo('left',this.script.getScroll().left-this.scriptwidth);
			this.scrollRight.removeClass('scroll-disabled');
			if(this.script.getScroll().left<=0){
				this.scrollLeft.addClass('scroll-disabled');
				this.scrollLeft.replaceClass('tab-scroll-left-over','tab-scroll-left');
				this.stopScroll();
			}
		}else if(lr=='right'){
			this.script.scrollTo('left',this.script.getScroll().left+this.scriptwidth);
			this.scrollLeft.removeClass('scroll-disabled');
			if(this.script.getScroll().left+this.script.getWidth()>=this.head.getWidth()){
				this.scrollRight.addClass('scroll-disabled');
				this.scrollRight.replaceClass('tab-scroll-right-over','tab-scroll-right');
				this.stopScroll();
			}
		}
	},
	stopScroll : function(){
		if(this.scrollInterval){
			clearInterval(this.scrollInterval);
			delete this.scrollInterval;
		}
	},
	onClick : function(e){
		var el=Ext.get(e.target);
		if(el.hasClass('tab-close'))this.closeTab(el.parent().parent());
	},
	onMouseWheel : function(e){
		var delta = e.getWheelDelta();
        if(delta > 0){
            this.scrollTo('left');
            e.stopEvent();
        }else{
            this.scrollTo('right');
            e.stopEvent();
        }
	},
	onMouseDown : function(e){
		var el=Ext.get(e.target),strip = Ext.get(e.target.parentNode),sf=this;
		if(el.hasClass('tab-close')){
			el.removeClass('tab-btn-over');
			el.addClass('tab-btn-down');
		}else if(el.hasClass('tab-scroll')&&!el.hasClass('scroll-disabled')){
			if(el.hasClass('tab-scroll-left-over'))sf.scrollTo('left');
			else sf.scrollTo('right');
			sf.scrollInterval=setInterval(function(){
				if(el.hasClass('tab-scroll')&&!el.hasClass('scroll-disabled')){
					if(el.hasClass('tab-scroll-left-over'))sf.scrollTo('left');
					else sf.scrollTo('right');
					if(el.hasClass('scroll-disabled'))clearInterval(sf.scrollInterval)
				}
			},100);
		}else if(strip.hasClass('strip') && !strip.hasClass('active')){
			sf.selectTab(strip)
		}
	},
	onMouseUp : function(e){
		this.stopScroll();
	},
	onMouseOver : function(e){
		var el=Ext.get(e.target),strip = Ext.get(e.target.parentNode);
		if(el.hasClass('tab-close')){
			el.show();
			el.addClass('tab-btn-over');
		}else if(el.hasClass('tab-scroll')&&!el.hasClass('scroll-disabled')){
			if(el.hasClass('tab-scroll-left'))el.replaceClass('tab-scroll-left','tab-scroll-left-over');
			else if(el.hasClass('tab-scroll-right'))el.replaceClass('tab-scroll-right','tab-scroll-right-over');
		}else if(strip.hasClass('strip')){
			el = strip.child('div.tab-close');
			if(el)el.show();
		}
	},
	onMouseOut : function(e){
		var el=Ext.get(e.target),strip = Ext.get(e.target.parentNode);
		if(el.hasClass('tab-close')){
			el.removeClass('tab-btn-over');
			el.removeClass('tab-btn-down');
		}else if(el.hasClass('tab-scroll')&&!el.hasClass('scroll-disabled')){
			this.stopScroll();
			if(el.hasClass('tab-scroll-left-over'))el.replaceClass('tab-scroll-left-over','tab-scroll-left');
			else if((el.hasClass('tab-scroll-right-over')))el.replaceClass('tab-scroll-right-over','tab-scroll-right');
		}else if(strip.hasClass('strip')){
			el = strip.child('div.tab-close');
			if(el)el.hide();
		}
	},
	showLoading : function(dom){
    	dom.update(_lang['tab.loading']);
    	dom.setStyle('text-align','center');
    	dom.setStyle('line-height',5);
    },
    clearLoading : function(dom){
    	dom.update('');
    	dom.setStyle('text-align','');
    	dom.setStyle('line-height','');
    },
	load : function(url,dom,index){
        url=url+(url.indexOf('?') !=-1?'&':'?')+'_vw='+this.width+'&_vh='+(this.height-Ext.fly(this.head).getHeight());
		var sf = this,body = Ext.get(dom);
		body.cmps={};
		sf.showLoading(body);
		//TODO:错误信息
    	Ext.Ajax.request({
			url: url,
		   	success: function(response, options){
		    	var html = response.responseText;
	    		sf.intervalId=setInterval(function(){
	    			if(!$A.focusTab){
				    	sf.clearLoading(body);
						$A.focusTab=body;
				    	body.update(html,true,function(){
				    		$A.focusTab=null;
		                    sf.fireEvent('select', sf, index)
				    	});
				    	clearInterval(sf.intervalId);
	    			}
		    	},10)
		    }
		});		
    },
    setWidth : function(w){
    	w = Math.max(w,2);
    	if(this.width==w)return;
    	$A.Tab.superclass.setWidth.call(this, w);
    	this.body.setWidth(w-2);
    	this.script.setWidth(w-38);
    	if(w-38<this.head.getWidth()){
			this.scrollLeft.setStyle({'display':'block'});
			this.scrollRight.setStyle({'display':'block'});
			var sl=this.script.getScroll().left,sw=this.script.getWidth(),hw=this.head.getWidth();
			if(sl<=0)this.scrollLeft.addClass('scroll-disabled');
			else this.scrollLeft.removeClass('scroll-disabled');
			if(sl+sw>=hw){
				if(!this.scrollRight.hasClass('scroll-disabled'))this.scrollRight.addClass('scroll-disabled');
				else this.script.scrollTo('left',hw-sw);
			}else this.scrollRight.removeClass('scroll-disabled');
    	}else{
			this.scrollLeft.setStyle({'display':'none'});
			this.scrollRight.setStyle({'display':'none'});
			this.script.scrollTo('left',0);
    	}
    	var bodys = Ext.DomQuery.select('div.tab',this.body.dom);
    	for(var i=0;i<bodys.length;i++){
    		var body = bodys[i];
    		Ext.fly(body).setWidth(w-4);
    	}
    },
    setHeight : function(h){
    	h = Math.max(h,25);
    	if(this.height==h)return;
    	$A.Tab.superclass.setHeight.call(this, h);
    	this.body.setHeight(h-26);
    	var bodys = Ext.DomQuery.select('div.tab',this.body.dom);
    	for(var i=0;i<bodys.length;i++){
    		var body = bodys[i];
    		Ext.fly(body).setHeight(h-28);
    	}
    }
});