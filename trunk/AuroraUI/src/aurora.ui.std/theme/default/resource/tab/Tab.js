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
		this.selectIndex = 1;
		this.loaded = {};
		$A.Tab.superclass.constructor.call(this,config);
	},
	initComponent:function(config){
		$A.Tab.superclass.initComponent.call(this, config);
		this.head = this.wrap.child('td[atype=tab.strips]'); 
		this.body = this.wrap.child('div[atype=tab.bodys]');
		this.selectTab(config.selected||0)
	},
	processListener: function(ou){
    	$A.Tab.superclass.processListener.call(this,ou);
    	this.head[ou]('click',this.onClick, this);
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
		'select');
		
	},
	/**
	 * 选中某个Tab页
	 * @param {Number} index TabItem序号
	 */
	selectTab:function(index){		
		if(index <0)index=0;
		var strips = Ext.DomQuery.select('div.strip',this.head.dom);
		var bodys = Ext.DomQuery.select('div.tab',this.body.dom)
		var activeStrip = strips[index];
		var activeBody = bodys[index];
		if(activeStrip){
			if(this.activeTab){
				this.activeTab.replaceClass('active','unactive');
			}
			this.activeTab = Ext.get(activeStrip);
			Ext.fly(activeStrip).replaceClass('unactive','active');
		}
		if(activeBody){
			if(this.activeBody){
//				this.activeBody.setXY([-1000,-1000]);//setDisplayed('none');
				this.activeBody.setLeft('-10000px');
				this.activeBody.setTop('-10000px');
			}
			this.activeBody = Ext.get(activeBody);
			Ext.fly(activeBody).setLeft('0px');
			Ext.fly(activeBody).setTop('0px');//setDisplayed('block');
		}
		if(this.items[index].ref && this.loaded['tab_'+index]!= true){
			this.load(this.items[index].ref,activeBody,index);
			this.loaded['tab_'+index] = true;
		}else{
            this.fireEvent('select', this, index)
		}
	},
	onClick:function(e){
		var strip = Ext.fly(e.target.parentNode);
		if(strip.hasClass('strip') && !strip.hasClass('active')){
			var strips = Ext.DomQuery.select('div.strip',this.head.dom);
			for(var i=0,l=strips.length;i<l;i++){
				var node = strips[i];
				if(node == e.target.parentNode){
					this.selectTab(i);
					break;
				}
			}
		}
	},
	showLoading : function(dom){
    	Ext.fly(dom).update(_lang['tab.loading']);
    	Ext.fly(dom).setStyle('text-align','center');
    	Ext.fly(dom).setStyle('line-height',5);
    },
    clearLoading : function(dom){
    	Ext.fly(dom).update('');
    	Ext.fly(dom).setStyle('text-align','');
    	Ext.fly(dom).setStyle('line-height','');
    },
	load : function(url,dom,index){
		if(url.indexOf('?') !=-1){
            url=url+'&_vw='+this.width+'&_vh='+(this.height-Ext.fly(this.head).getHeight());
		} else {
            url=url+'?_vw='+this.width+'&_vh='+(this.height-Ext.fly(this.head).getHeight());
		}
		this.showLoading(dom);
		var sf = this;
		//TODO:错误信息
    	Ext.Ajax.request({
			url: url,
		   	success: function(response, options){
		    	sf.clearLoading(dom);
		    	var html = response.responseText;		    	
		    	Ext.fly(dom).update(html,true,function(){
                    sf.fireEvent('select', sf, index)
		    	});
		    }
		});		
    },
    setWidth : function(w){
    	w = Math.max(w,2);
    	$A.Tab.superclass.setWidth.call(this, w);
    	if(this.width == w) return;
    	var wd = (w-2)+'px'
    	Ext.fly(this.body.dom).setStyle('width',wd);
    	var bodys = Ext.DomQuery.select('div.tab',this.body.dom);
    	for(var i=0;i<bodys.length;i++){
    		var body = bodys[i];
    		Ext.fly(body).setStyle('width',wd);
    	}
    },
    setHeight : function(h){
    	h = Math.max(h,25);
    	$A.Tab.superclass.setHeight.call(this, h);
    	if(this.height == h) return;
    	var hp = (h-25)+'px';
    	Ext.fly(this.body.dom).setStyle('height',hp);
    	var bodys = Ext.DomQuery.select('div.tab',this.body.dom);
    	for(var i=0;i<bodys.length;i++){
    		var body = bodys[i];
    		Ext.fly(body).setStyle('height',hp);
    	}
    }
});