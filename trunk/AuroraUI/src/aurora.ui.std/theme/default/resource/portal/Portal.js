(function(A){
var relativeX,relativeY,portalList,
	MARGIN_RIGHT = 'margin-right',
	CLS_DIV$PORTAL_PROXY = 'div.portal-proxy',
	CLS_TABLE$PORTAL_ITEM_WRAP = 'table.portal-item-wrap',
	CLS_PORTAL_ITEM_BTN_OVER = 'portal-item-btn-over',
	CLS_PORTAL_ITEM_BTN_DOWN = 'portal-item-btn-down',
	EVT_MOUSE_MOVE = 'mousemove',
	EVT_MOUSE_DOWN = 'mousedown',
	EVT_MOUSE_UP = 'mouseup',
	EVT_BEFORE_CLOSE = 'beforeclose',
	EVT_CLOSE = 'close',
	EVT_ITEM_CLOSE = 'itemclose',
	EVT_DRAG = 'drag',
	EVT_DROP = 'drop';
/**
 * @class Aurora.Portal
 * @extends Aurora.Component
 * <p>Accordion组件.
 * @author huazhen.wu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
A.Portal = Ext.extend(A.Component,{
	portals : [],
	initComponent:function(config){
		A.Portal.superclass.initComponent.call(this, config);
		var sf = this,
			wrap = sf.wrap;
		sf.proxy = wrap.child(CLS_DIV$PORTAL_PROXY);
		wrap.select(CLS_TABLE$PORTAL_ITEM_WRAP).each(function(portal,self,i,ps){
			sf.createPortalItem(Ext.get(portal.dom).id,sf.items[i]);
		});
	},
	initEvents:function(){
		A.Portal.superclass.initEvents.call(this);   
		this.addEvents(
		/**
         * @event itemclose
         * 窗口关闭事件.
         * @param {Aurora.PortalPanel} portalPanel portal_panel面板对象
         * @param {Aurora.Portal} portal portal对象
         * @param {Number} index 索引
         */
		EVT_ITEM_CLOSE);
		
	},
	createPortalItem : function(id,config){
		var sf = this,portals = sf.portals;
		portals.push(new A.PortalItem(Ext.apply(config||{},{
			id:id,
			closeable:true,
			proxy : sf.proxy,
			listeners:{
				close : function(p){
					var index = portals.indexOf(p)
					portals.splice(index,1);
					sf.fireEvent(EVT_ITEM_CLOSE,sf,p,index);					
				},
				drop : function(p,index){
					portals.splice(portals.indexOf(p),1);
					portals.splice(index,0,p);
				}
			}
		})));
	},
    destroy : function(){
    	var sf = this,wrap = sf.wrap;
		A.Portal.superclass.destroy.call(sf); 
		Ext.each(sf.portals,function(portal){
			portal.destroy();
		});
	}
});


A.PortalItem = Ext.extend(A.Component,{
	constructor: function(config){
		A.Portal.superclass.constructor.call(this,config);
	},
	initComponent:function(config){
		A.PortalItem.superclass.initComponent.call(this, config);
		var sf = this,wrap = sf.wrap //|| new Ext.Template(sf.htmlTpl).append(sf.panel);
		sf.cellspacing = parseFloat(wrap.getStyle(MARGIN_RIGHT));
		sf.head = wrap.child('td.portal-item-caption-label');
		sf.body = wrap.child('div.portal-item-content');
		sf.closeBtn = sf.wrap.child('div.portal-item-close');
	},
	processListener: function(ou){
		var sf = this;
    	A.PortalItem.superclass.processListener.call(sf,ou);
    	if(sf.closeable) {
           sf.closeBtn[ou]('click', sf.onCloseClick,  sf)
   					[ou]('mouseover', sf.onCloseOver,  sf)
           			[ou]('mouseout', sf.onCloseOut,  sf)
           			[ou](EVT_MOUSE_DOWN, sf.onCloseDown,  sf);
        }
        sf.head[ou](EVT_MOUSE_DOWN,sf.onMouseDown,sf);
    },
    initEvents:function(){
		A.PortalItem.superclass.initEvents.call(this);   
		this.addEvents(
		/**
         * @event drag
         * 拖起事件.
         * @param {Aurora.Portal} portal portal对象
         * @param {Number} index 索引
         */
		EVT_DRAG,
		/**
         * @event drop
         * 放下事件.
         * @param {Aurora.Portal} portal portal对象
         * @param {Number} index 索引
         */
		EVT_DROP,
		/**
         * @event beforeclose
         * 关闭前事件.
         * @param {Aurora.Portal} portal portal对象
         */
		EVT_BEFORE_CLOSE,
		/**
         * @event close
         * 关闭事件.
         * @param {Aurora.Portal} portal portal对象
         */
		EVT_CLOSE);
		
	},
    close : function(){
    	var sf = this;
        if(sf.fireEvent(EVT_BEFORE_CLOSE,sf)){
            sf.fireEvent(EVT_CLOSE, sf);
            sf.destroy();
        }
    },
    onMouseDown : function(e){
    	var sf = this,pos = e.xy,wrap = sf.wrap,xy = wrap.getXY();
    	wrap.setStyle({margin:''}).setOpacity(0.9).position('absolute',null,xy[0],xy[1]);
    	sf.body.hide();
    	relativeX = pos[0] - xy[0];
    	relativeY = pos[1] - xy[1];
    	sf.proxy.insertBefore(wrap).setStyle({display:''});
    	portalList = wrap.parent().query(CLS_TABLE$PORTAL_ITEM_WRAP);
    	Ext.fly(document).on(EVT_MOUSE_MOVE,sf.onMouseMove,sf)
			.on(EVT_MOUSE_UP,sf.onMouseUp,sf);
		sf.fireEvent(EVT_DRAG,sf,portalList.indexOf(wrap.dom));
    },
    onMouseMove : function(e){
    	var sf = this,pos = e.xy,x = pos[0],y = pos[1],wrap = sf.wrap,
    		c = sf.cellspacing/2,index = portalList.indexOf(wrap.dom);
    	wrap.moveTo(x - relativeX , y - relativeY);
    	Ext.each(portalList,function(portal,i){
    		if(portal != wrap.dom){
    			portal = Ext.fly(portal);
    			var xy = portal.getXY(),width = portal.getWidth(),height = portal.getHeight();
    			if(x > xy[0] - c && x < xy[0] + width + c && y > xy[1] - c && y < xy[1] + height + c){
    				if(portal.prev(CLS_DIV$PORTAL_PROXY)){
	    				if(index > i) i+=1;
    					sf.proxy.insertAfter(portal);
    				}else{
    					sf.proxy.insertBefore(portal);
	    				if(index < i) i-=1;
    				}
					sf.proxy.index = i;
    				return false;
    			}
    		}
    	});
    },
    onMouseUp : function(e){
    	var sf = this,c = sf.cellspacing;
    	sf.wrap.setXY(sf.proxy.getXY(),{
    		callback : function(){
	    		sf.wrap.insertBefore(sf.proxy.setStyle({display:'none'})).clearPositioning().clearOpacity().setStyle({margin:c + 'px ' +c + 'px 0 0'});
		    	sf.body.show();
		    	Ext.fly(document).un(EVT_MOUSE_MOVE,sf.onMouseMove,sf)
					.un(EVT_MOUSE_UP,sf.onMouseUp,sf);
				sf.fireEvent(EVT_DROP,sf,sf.proxy.index);
				portalList = null;
				sf.proxy.index = null;
    		},
    		duration : .15
    	});
    },
    onCloseClick : function(e){
        e.stopEvent();
        this.close();   
    },
    onCloseOver : function(e){
        this.closeBtn.addClass(CLS_PORTAL_ITEM_BTN_OVER);
    },
    onCloseOut : function(e){
        this.closeBtn.removeClass(CLS_PORTAL_ITEM_BTN_OVER);
    },
    onCloseDown : function(e){
    	var sf= this;
        sf.closeBtn.removeClass(CLS_PORTAL_ITEM_BTN_OVER)
				.addClass(CLS_PORTAL_ITEM_BTN_DOWN);
        Ext.get(document.documentElement).on(EVT_MOUSE_UP, sf.onCloseUp, sf);
    },
    onCloseUp : function(e){
    	var sf= this;
        sf.closeBtn.removeClass(CLS_PORTAL_ITEM_BTN_DOWN);
        Ext.get(document.documentElement).un(EVT_MOUSE_UP, sf.onCloseUp, sf);
    },
    clearBody : function(){
    	Ext.iterate(this.body.cmps,function(key,cmp){
    		if(cmp.destroy){
                try{
                    cmp.destroy();
                }catch(e){
                    alert('销毁portal出错: ' + e);
                }
            }
    	});
    	
    },
    destroy : function(){
    	var sf = this,
    		wrap = sf.wrap;
    	A.PortalItem.superclass.destroy.call(sf);
    	sf.clearBody();
    	wrap.setOpacity(0,{
    		callback:function(){
				wrap.setStyle(MARGIN_RIGHT,0);
	    		wrap.setWidth(3,{
	    			callback:function(){
	    				wrap.remove();
	    			}
	    		});
	    	}
    	});
    }
});
})($A);