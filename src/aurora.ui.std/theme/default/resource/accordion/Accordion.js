(function(A){
var SELECTED = 'selected',
	ITEM_ACCORDION_BTN = 'item-accordion-btn',
	STRIP_OVER = 'strip-over',
	EVT_SELECT = 'select';
/**
 * @class Aurora.Accordion
 * @extends Aurora.Component
 * <p>Accordion组件.
 * @author huazhen.wu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
A.Accordion = Ext.extend(A.Component,{
	constructor: function(config){
		A.Accordion.superclass.constructor.call(this,config);
	},
	initComponent:function(config){
		A.Accordion.superclass.initComponent.call(this, config);
		var sf = this,wrap = sf.wrap;
		sf.selectedItems=[];
		sf.frequency=sf.frequency||20;
		sf.actionTimes=sf.actionTimes||2;
		sf.currentTime=1;
		sf.accordions=wrap.query('div.item-accordion');
		sf.strips = wrap.query('div.accordion-strip');
		sf.bodys = wrap.query('div.item-accordion-body');
		sf.stripheight=sf.stripheight||25;
		Ext.each(sf.accordions,function(accordion,i){
			accordion=Ext.get(accordion);
			if(accordion.hasClass(SELECTED)){
				sf.selectedItems.push(accordion);
				sf.load.call(sf,i);
			}
		});
	},
	processListener: function(ou){
		var sf = this;
    	A.Accordion.superclass.processListener.call(sf,ou);
    	sf.wrap[ou]('click',sf.onClick, sf);
    },
	initEvents:function(){
		A.Accordion.superclass.initEvents.call(this);   
		this.addEvents(
		/**
         * @event select
         * 选择事件.
         * @param {Aurora.Accordion} tab Accordion对象.
         * @param {Number} index 序号.
         */
		EVT_SELECT);
		
	},
	/**
	 * 选中某个Accordion页
	 * @param {Number} index AccordionItem序号
	 */
	selectAccordionIndex:function(index){
		var sf = this,accordion = Ext.get(sf.accordions[index]);
		if(!accordion)return;
		if(accordion.hasClass(SELECTED)){
			sf.close(accordion,index);
		}else{
			sf.singlemode && Ext.each(sf.selectedItems,function(accordion){
				sf.close(accordion,sf.accordions.indexOf(accordion.dom));
			},sf);
			var body = Ext.fly(sf.bodys[index]),hasChild =false;
			body.select('*').each(function(c){
				if(c.getHeight())hasChild=true;
			})
			sf.selectedItems.push(accordion.addClass(SELECTED).setHeight(sf.stripheight+(hasChild?body.show().getHeight():0),{
			    duration : .2, 
			    callback: function(){
			    	hasChild && accordion.setStyle({height:''});
			    	sf.load(index);
		    	}
			}));
		}
		//sf.intervalId=setInterval(sf.go.createDelegate(sf,[index]),sf.frequency);
		//sf.go.call(sf,index);
	},
	close : function(accordion,index){
		var sf = this;
		accordion.removeClass(SELECTED).setHeight(sf.stripheight,{
		    duration : .2,
		    callback:function(){
		    	Ext.fly(sf.bodys[index]).hide();
		    }
		});
		sf.selectedItems.remove(accordion);
	},
//	go:function(index){
//		for(var i=0;i<this.accordions.length;i++){
//			var accordion=Ext.get(this.accordions[i]);
//			if(accordion.hasClass(SELECTED)){
//				if(this.singlemode||i==index)accordion.setHeight(this.stripheight+Ext.fly(this.bodys[i]).getHeight()*(1-this.currentTime/this.actionTimes));
//			}else if(i==index) accordion.setHeight(this.stripheight+Ext.fly(this.bodys[i]).getHeight()*(this.currentTime/this.actionTimes));
//		}
//		if(this.actionTimes==this.currentTime){
//			for(var i=0;i<this.accordions.length;i++){
//				var accordion=Ext.get(this.accordions[i]);
//				if(accordion.hasClass(SELECTED)){
//					if(this.singlemode||i==index){
//						accordion.removeClass(SELECTED);
//						Ext.fly(this.bodys[i]).hide();
//						this.selectedItems.remove(accordion);
//					}
//				}else if(i==index){
//					accordion.addClass(SELECTED);
//					Ext.fly(this.bodys[i]).show();
//					this.load(index);
//				}
//			}
//			clearInterval(this.intervalId);
//			this.currentTime=1;
//		}else this.currentTime++;
//	},
	onClick:function(e,t){
		t = (t = Ext.fly(t)).hasClass('accordion-strip')?t:t.parent('.accordion-strip');
		if(t){
			Ext.each(this.strips,function(strip,i){
				if(t.dom==strip){
					this.selectAccordionIndex(i);
					return false;
				}
			},this);
		}
	},
	onMouseOver : function(e,t){
		(t = Ext.fly(t)).hasClass(ITEM_ACCORDION_BTN) && t.parent().addClass(STRIP_OVER);
    	A.Accordion.superclass.onMouseOver.call(this,e,t);   
    },
    onMouseOut : function(e,t){
		(t = Ext.fly(t)).hasClass(ITEM_ACCORDION_BTN) && t.parent().removeClass(STRIP_OVER);
    	A.Accordion.superclass.onMouseOut.call(this,e,t);   
    },
	showLoading : function(dom){
    	dom.update(_lang['accordion.loading'])
			.setStyle({'text-align':'center','line-height':5});
    },
    clearLoading : function(dom){
    	dom.update('')
    		.setStyle({'text-align':'','line-height':''});
    },
	load : function(index){
		var sf = this,url=sf.items[index].ref, dom=Ext.get(sf.bodys[index]);
		if(!url||dom.isLoaded){
			sf.fireEvent(EVT_SELECT, sf, index);
			return;
		}
		dom.isLoaded=true;
		dom.cmps={};
		sf.showLoading(dom);
    	Ext.Ajax.request({
			url: Ext.urlAppend(url,'_vw='+sf.width+'&_vh='+(sf.height-Ext.fly(sf.strips[0]).getHeight())),
		   	success: function(response, options){
		    	sf.clearLoading(dom);
		    	dom.update(response.responseText,true,function(){
                    sf.fireEvent(EVT_SELECT, sf, index);
		    	},dom);
		    }
		});		
    },
    setHeight : function(h){
    	if(this.height == h) return;
    	var sf = this,bodys = sf.bodys,
    		l = bodys.length,
    		stripheight = sf.stripheight,
    		h = Math.max(h,stripheight*l),
    		singlemode = sf.singlemode;
    	sf.height=h;
    	Ext.each(bodys,function(body){
    		Ext.fly(body).setHeight((h-stripheight*l)/(singlemode?1:l));
    	});
    	Ext.each(sf.selectedItems,function(item){
	    	item.setHeight(singlemode?(h-stripheight*(l-1)):(h/l));
    	});
    },
    destroy : function(){
    	Ext.each(this.bodys,function(body){
    		Ext.iterate(Ext.get(body).cmps,function(key,cmp){
    			try{
    				cmp.destroy && cmp.destroy();
    			}catch(e){
    				alert('销毁Accordion出错: ' + e)
    			}
    		});
    	});
		A.Accordion.superclass.destroy.call(this); 
	}
});
})($A);