(function(A){
var PERCENT100 = '100%',
	SELECTED = 'selected',
	ITEM_ACCORDION_BTN = 'item-accordion-btn',
	STRIP_OVER = 'strip-over',
	EVT_SELECT = 'select',
	EVT_BEFORE_SELECT = 'beforeselect';
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
		sf.accordions=wrap.select('div.item-accordion');
		sf.strips = wrap.select('div.accordion-strip');
		sf.bodys = wrap.select('div.item-accordion-body');
		sf.stripheight=sf.stripheight||25;
		sf.accordions.each(function(accordion,self,i,as){
			Ext.isIE6 && accordion.setWidth(PERCENT100)
			if(accordion.hasClass(SELECTED)){
				sf.selectAccordionIndex(i);
			}
		});
		Ext.isIE6 && sf.bodys.setWidth(PERCENT100);
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
         * @event beforeselect
         * 选择事件.
         * @param {Aurora.Accordion} tab Accordion对象.
         * @param {Number} index 序号.
         */
		EVT_BEFORE_SELECT,
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
		var sf = this,accordion = Ext.get(sf.accordions.elements[index]);
		if(sf.fireEvent(EVT_BEFORE_SELECT,sf,index) != false){
			if(!accordion)return;
			if(sf.selectedItems.indexOf(accordion) != -1){
				sf.close(accordion,index);
			}else{
				sf.singlemode && Ext.each(sf.selectedItems,function(accordion){
					sf.close(accordion,sf.accordions.elements.indexOf(accordion.dom));
				},sf);
				var body = sf.bodys.item(index),hasChild =!!body.dom.style.height,
					children = body.select('*');
				if(children.elements.length == 0 && body.dom.innerHTML)hasChild=true;
				children.each(function(c){
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
		}
	},
	close : function(accordion,index){
		var sf = this;
		accordion.removeClass(SELECTED).setHeight(sf.stripheight,{
		    duration : .2,
		    callback:function(){
		    	sf.bodys.item(index).hide();
		    }
		});
		sf.selectedItems.remove(accordion);
	},
	onClick:function(e,t){
		t = (t = Ext.fly(t)).hasClass('accordion-strip')?t:t.parent('.accordion-strip');
		if(t){
			this.strips.each(function(strip,self,i){
				if(t.dom==strip.dom){
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
		var sf = this,url=sf.items[index].ref, dom=Ext.get(sf.bodys.elements[index]);
		if(!url||dom.isLoaded){
			sf.fireEvent(EVT_SELECT, sf, index);
			return;
		}
		dom.isLoaded=true;
		dom.cmps={};
		sf.showLoading(dom);
    	Ext.Ajax.request({
			url: Ext.urlAppend(url,'_vw='+sf.width+'&_vh='+(sf.height-sf.strips.item(0).getHeight())),
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
    		l = bodys.elements.length,
    		stripheight = sf.stripheight,
    		h = Math.max(h,stripheight*l),
    		singlemode = sf.singlemode;
    	sf.height=h;
    	bodys.setHeight((h-stripheight*l)/(singlemode?1:l))
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