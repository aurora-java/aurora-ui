/**
 * @class Aurora.Tab
 * @extends Aurora.Component
 * Tab组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Tab = Ext.extend($A.Component,{
    sd:'scroll-disabled',
    tslo:'tab-scroll-left-over',
    tsro:'tab-scroll-right-over',
    tsl:'tab-scroll-left',
    tsr:'tab-scroll-right',
    tc:'tab-close',
    tbo:'tab-btn-over',
    tbd:'tab-btn-down',
    ts:'tab-scroll',
	constructor: function(config){
		this.intervalIds=[];
		$A.Tab.superclass.constructor.call(this,config);
	},
	initComponent:function(config){
		$A.Tab.superclass.initComponent.call(this, config);
		this.scriptwidth = config.scriptwidth||60;
		var w = this.wrap,
			h = this.head = w.child('div[atype=tab.strips]'), 
			s = this.script = h.parent();
		this.body = w.child('div.item-tab-body');
		this.scrollLeft = w.child('div[atype=scroll-left]');
		this.scrollRight = w.child('div[atype=scroll-right]');
		this.sp = s.parent();
		this.selectTab(config.selected||0)
	},
	processListener: function(ou){
    	$A.Tab.superclass.processListener.call(this,ou);
    	this.sp[ou]('mousedown',this.onMouseDown, this)
    		[ou]('mouseup',this.onMouseUp, this)
    		[ou]('mouseover',this.onMouseOver, this)
    		[ou]('mouseout',this.onMouseOut, this);
    	this.script[ou]('click',this.onClick, this)
    		[ou]('mousewheel',this.onMouseWheel, this);
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
		/**
         * @event beforeopen
         * 选择事件.
         * @param {Aurora.Tab} tab Tab对象.
         * @param {Number} index 序号. 
         */
        'beforeopen'
		);
		
	},
	/**
	 * 选中某个Tab页
	 * @param {Number} index TabItem序号。当index<0时，TabItem序号等于TabItem的个数加上index。
	 */
	selectTab:function(index,needRefresh){		
		var tab=this.getTab(index);
		if(!tab)return;
		var sd = this.sd,
			index=tab.index,
			activeStrip = tab.strip,
			activeBody = tab.body;		
		if(activeStrip.hasClass(sd)){
			this.selectTab(index+1);
			return;
		}
		this.selectedIndex=index;			
		if(this.activeTab)this.activeTab.replaceClass('active','unactive');
		this.activeTab = activeStrip;
		activeStrip.replaceClass('unactive','active');
		var script = this.script,
			scrollLeft = this.scrollLeft,
			scrollRight = this.scrollRight,
			l=activeStrip.dom.offsetLeft,w=activeStrip.getWidth(),
			sl=script.getScroll().left,sw=script.getWidth(),hw=this.head.getWidth();
			tr=l+w-sl-sw,tl=sl-l;
		if(tr>0){
			scrollRight.removeClass(sd);
			scrollLeft.removeClass(sd);
			script.scrollTo('left',sl+tr);
		}else if(tl>0){
			scrollLeft.removeClass(sd);
			script.scrollTo('left',sl-tl);
			scrollRight.removeClass(sd);
		}
		if(sw+script.getScroll().left>=hw){
			script.scrollTo('left',hw-sw);
			scrollRight.addClass(sd);
		}else if(index==0){
			script.scrollTo('left',0);
			scrollLeft.addClass(sd);
		}
		if(activeBody){
			if(this.activeBody){
				this.activeBody.setLeft('-10000px').setTop('-10000px');
			}
			this.activeBody = activeBody;
			activeBody.setLeft('0px').setTop('0px');
		}
		if(this.items[index].ref && (activeBody.loaded!= true||needRefresh)){
			this.load(this.items[index].ref,activeBody,index);
			activeBody.loaded = true;
		}else{
            this.fireEvent('select', this, index);
		}
	},	
	stripTpl:['<div class="strip unactive"  unselectable="on" onselectstart="return false;"><div style="height:26px;width:{stripwidth2}px">'
				,'<div class="strip-left"></div>',
				'<div style="width:{stripwidth}px;" class="strip-center"><div class="tab-close"></div>{prompt}</div>',
				'<div class="strip-right"></div>',
			'</div></div>'],
	bodyTpl:'<div style="width:{bodywidth}px;height:{bodyheight}px;left:-10000px;top:-10000px;" class="tab"></div>',
	/**
	 * 打开一个指定引用地址的Tab页，如果该指定的引用地址的页面已经被打开，则选中该Tab页
	 * @param {String} ref Tab页面的引用地址
	 * @param {String} prompt Tab的标题
	 */
	openTab : function(ref,prompt){
		var i=0,
			items = this.items,l = items.length;
		for(;i<l;i++){
			var item = items[i];
			if(item.ref&&item.ref==ref){
				this.selectTab(i);return;
			}
		}
		if(this.fireEvent('beforeopen',this,l)!==false){
			items.push({'ref':ref});
			var stripwidth=Math.max($A.TextMetrics.measure(document.body,prompt).width+20,this.scriptwidth),
				head = this.head,
				body = this.body,
				script = this.script,
				width = head.getWidth()+stripwidth+6;
			head.setWidth(width);
			if(width>script.getWidth()){
				this.scrollLeft.setStyle({'display':'block'});
				this.scrollRight.setStyle({'display':'block'});
				script.setStyle('padding-left','1px');
			}
			new Ext.Template(this.stripTpl).append(head.dom,{'prompt':prompt,'stripwidth':stripwidth,'stripwidth2':stripwidth+6});
			new Ext.Template(this.bodyTpl).append(body.dom,{'bodywidth':body.getWidth(),'bodyheight':body.getHeight()});
			this.selectTab(l);
		}
	},
	/**
	 * 关闭某个Tab页
	 * @param {Integer} index TabItem序号。当index<0时，TabItem序号等于TabItem的个数加上index。
	 */
	closeTab : function(o){
		var tab=this.getTab(o);
		if(!tab)return;
		var strip=tab.strip,body=tab.body,index=tab.index;
		if(!strip.child('div.'+this.tc)){
			$A.showWarningMessage('警告','该Tab页无法被关闭!')
			return;
		}
        if(this.activeBody == tab.body){
            this.activeBody=null;
            this.activeTab=null;
        }
		this.items.splice(index,1);
		var head = this.head,
			script = this.script,
			width= head.getWidth()-strip.getWidth();
		head.setWidth(width);
		if(width <= script.getWidth()){
			this.scrollLeft.setStyle({'display':'none'});
			this.scrollRight.setStyle({'display':'none'});
			script.setStyle('padding-left','0');
		}
		strip.remove();
		body.remove();
        
		delete body.loaded;
		setTimeout(function(){
			Ext.iterate(body.cmps,function(key,cmp){
				if(cmp.destroy){
        			try{
        				cmp.destroy();
        			}catch(e){
        				alert('销毁Tab出错: ' + e)
        			}
        		}
			});
        },10)
		this.selectTab(index);
	},
	destroy : function(){
//		var bodys = Ext.DomQuery.select('div.tab',this.body.dom);
        Ext.each(this.body.dom.children,function(body){
        	Ext.iterate(Ext.fly(body).cmps,function(key,cmp){
        		if(cmp.destroy){
        			try{
        				cmp.destroy();
        			}catch(e){
        				alert('销毁Tab出错: ' + e)
        			}
        		}
        	});
        });
		$A.Tab.superclass.destroy.call(this); 
	},
	/**
	 * 将某个Tab页设为不可用。当TabItem有且仅有1个时，该方法无效果。
	 * @param {Integer} index TabItem序号。当index<0时，TabItem序号等于TabItem的个数加上index。
	 */
	setDisabled : function(index){
		var tab = this.getTab(index);
		if(!tab)return;
		if(this.items.length > 1){
			var strip = tab.strip,index = tab.index;
			if(this.activeTab==strip){
				this.selectTab(index+(this.getTab(index+1)?1:-1))
			}
			strip.addClass(this.sd);
		}
	},
	/**
	 * 将某个Tab页设为可用
	 * @param {Integer} index TabItem序号。当index<0时，TabItem序号等于TabItem的个数加上index。
	 */
	setEnabled : function(index){
		var tab = this.getTab(index);
		if(!tab)return;
		tab.strip.removeClass(this.sd);
	},
	getTab : function(o){
		var bodys = this.body.dom.children,//Ext.DomQuery.select('div.tab',this.body.dom),
        	strips = this.head.dom.children,//Ext.DomQuery.select('div.strip',this.head.dom),
        	strip,body;
		if(Ext.isNumber(o)){
			if(o<0)o+=strips.length;
			o=Math.round(o);
			if(strips[o]){
				strip=Ext.get(strips[o]);
				body=Ext.get(bodys[o]);
			}
		}else {
			o=Ext.get(o);
			o=Ext.each(strips,function(s,i){
				if(s == o.dom){
					strip=o;
					body=Ext.get(bodys[i]);
					return false;
				}
			});
		}
		return strip?{'strip':strip,'body':body,'index':o}:null;
	},
	scrollTo : function(lr){
		var script = this.script,
			scrollRight = this.scrollRight,
			scrollLeft = this.scrollLeft,
			sl = script.getScroll().left,
			sw = this.scriptwidth,
			sd = this.sd;
		if(lr=='left'){
			script.scrollTo('left',sl-sw);
			scrollRight.removeClass(sd);
			if(script.getScroll().left<=0){
				scrollLeft.addClass(sd).replaceClass(this.tslo,this.tsl);
				this.stopScroll();
			}
		}else if(lr=='right'){
			script.scrollTo('left',sl+sw);
			scrollLeft.removeClass(sd);
			if(script.getScroll().left+script.getWidth()>=this.head.getWidth()){
				scrollRight.addClass(sd).replaceClass(this.tsro,this.tsr);
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
	onClick : function(e,t){
		var el=Ext.fly(t);
		if(el.hasClass(this.tc))this.closeTab(el.parent('.strip'));
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
	onMouseDown : function(e,t){
		var el=Ext.fly(t),strip = el.parent('.strip'),sf=this;
		if(el.hasClass(sf.tc)){
			el.removeClass(sf.tbo).addClass(sf.tbd);
		}else if(el.hasClass(sf.ts) && !el.hasClass(sf.sd)){
			if(el.hasClass(sf.tslo))sf.scrollTo('left');
			else sf.scrollTo('right');
			sf.scrollInterval=setInterval(function(){
				if(el.hasClass(sf.ts)&&!el.hasClass(sf.sd)){
					if(el.hasClass(sf.tslo))sf.scrollTo('left');
					else sf.scrollTo('right');
					if(el.hasClass(sf.sd))clearInterval(sf.scrollInterval);
				}
			},100);
		}else if(strip && strip.hasClass('strip') && !strip.hasClass('active') && !strip.hasClass(sf.sd)){
			sf.selectTab(strip);
		}
	},
	onMouseUp : function(e){
		this.stopScroll();
	},
	onMouseOver : function(e,t){
		var el=Ext.fly(t),strip = el.parent('.strip'),
			tsl = this.tsl,tsr = this.tsr,tc = this.tc;
        if(el.hasClass(this.ts)&&!el.hasClass(this.sd)){
            if(el.hasClass(tsl))el.replaceClass(tsl,this.tslo);
            else if(el.hasClass(tsr))el.replaceClass(tsr,this.tsro);
        } else if(el.hasClass(tc)){
            el.addClass(this.tbo);
        }
        if(strip){
        	el = strip.child('div.'+tc);
            if(el){
            	var b = this.currentBtn;
                if(b)b.hide();
                this.currentBtn=el;
                el.show();
            }            
        }
	},
	onMouseOut : function(e,t){
		var el=Ext.fly(t),strip = el.parent('.strip'),
			tslo = this.tslo,tsro = this.tsro,tc = this.tc;
        if(el.hasClass(this.ts)&&!el.hasClass(this.sd)){
            this.stopScroll();
            if(el.hasClass(tslo))el.replaceClass(tslo,this.tsl);
            else if((el.hasClass(tsro)))el.replaceClass(tsro,this.tsr);
        }else if(el.hasClass(tc)){
            el.removeClass([this.tbo,this.tbd]);
        }
        if(strip){
            el = strip.child('div.'+tc);
            if(el){
                el.hide();
            }            
        }
	},
	showLoading : function(dom){
    	dom.setStyle({'text-align':'center','line-height':5}).update(_lang['tab.loading']);
    },
    clearLoading : function(dom){
    	dom.setStyle({'text-align':'','line-height':''}).update('');
    },
    reloadTab : function(index,url){
    	index = Ext.isEmpty(index) ? this.selectedIndex:index;
    	var tab=this.getTab(index);
    	if(!tab)return;
    	if(url) this.items[index].ref = url;
    	Ext.iterate(tab.body.cmps,function(key,cmp){
    		if(cmp.destroy){
    			try{
    				cmp.destroy();
    			}catch(e){
    				alert('销毁Tab出错: ' + e)
    			}
    		}
    	});
    	this.selectTab(index,true);
    },
	load : function(url,dom,index){
        var sf = this,body = Ext.get(dom);
		body.cmps={};
		sf.showLoading(body);
		//TODO:错误信息
    	Ext.Ajax.request({
			url: Ext.urlAppend(url,'_vw='+this.width+'&_vh='+(this.height-this.head.getHeight())),
		   	success: function(response, options){
                var res;
                try {
                    res = Ext.decode(response.responseText);
                }catch(e){}            
                if(res && res.success == false){
                    if(res.error){
                        if(res.error.code  && res.error.code == 'session_expired'){
                            $A.showErrorMessage(_lang['ajax.error'],  _lang['session.expired']);
                        }else{
                            $A.manager.fireEvent('ajaxfailed', $A.manager, options.url,options.para,res);
                            var st = res.error.stackTrace,
                            	em = res.error.message;
                            st = st ? st.replaceAll('\r\n','</br>') : '';
                            $A.showErrorMessage(_lang['window.error'], em?em+'</br>'+st:st,null,400,em && st=='' ? 150 : 250);
                        }
                    }
                    return;
                }
		    	var html = response.responseText;
//	    		sf.intervalIds[index]=setInterval(function(){
//	    			if(!$A.focusTab){
//				    	clearInterval(sf.intervalIds[index]);
				    	sf.clearLoading(body);
//						$A.focusTab=body;
//						try{
					    	body.update(html,true,function(){
//					    		$A.focusTab=null;
			                    sf.fireEvent('select', sf, index)
					    	},body);
//						}catch(e){
//							$A.focusTab=null;
//						}
//	    			}
//		    	},10)
		    }
		});		
    },
    setWidth : function(w){
    	w = Math.max(w,2);
    	if(this.width==w)return;
    	$A.Tab.superclass.setWidth.call(this, w);
    	var body = this.body,head = this.head,script = this.script,
    		scrollLeft = this.scrollLeft,scrollRight= this.scrollRight,
    		sd = this.sd;
    	body.setWidth(w-2);
    	script.setWidth(w-38);
    	if(w-38<head.getWidth()){
			scrollLeft.setStyle({'display':'block'});
			scrollRight.setStyle({'display':'block'});
			script.setStyle('padding-left','1px');
			var sl=script.getScroll().left,sw=script.getWidth(),hw=head.getWidth();
			if(sl<=0)scrollLeft.addClass(sd);
			else scrollLeft.removeClass(sd);
			if(sl+sw>=hw){
				if(!scrollRight.hasClass(sd))scrollRight.addClass(sd);
				else script.scrollTo('left',hw-sw);
			}else scrollRight.removeClass(sd);
    	}else{
			scrollLeft.setStyle({'display':'none'});
			scrollRight.setStyle({'display':'none'});
			script.setStyle('padding-left','0').scrollTo('left',0);
    	}
//    	var bodys = Ext.DomQuery.select('div.tab',this.body.dom);
    	Ext.each(body.dom.children,function(b){
    		Ext.fly(b).setWidth(w-4);
    	});
    },
    setHeight : function(h){
    	h = Math.max(h,25);
    	if(this.height==h)return;
    	$A.Tab.superclass.setHeight.call(this, h);
    	var body = this.body;
    	body.setHeight(h-26);
//    	var bodys = Ext.DomQuery.select('div.tab',this.body.dom);
    	Ext.each(body.dom.children,function(b){
    		Ext.fly(b).setHeight(h-28);
    	});
    }
});