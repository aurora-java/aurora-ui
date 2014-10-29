(function(A){
var SELECTOR = '.switchcard-body';
A.SwitchCard = Ext.extend(A.Component,{
	initComponent:function(config){
		var sf = this;
		A.SwitchCard.superclass.initComponent.call(sf, config);
		sf.wrap.select(SELECTOR+'[url]{display!=none}').each(sf.load,sf);
	},
	processDatasetListener : function(ou){
		var sf = this,
			binder = sf.binder;
		if(binder){
			var ds = binder.ds;
			ds[ou]('update',sf.onUpdate,sf);
			ds[ou]('indexchange',sf.onIndexChange,sf);
		}
	},
	initEvents : function(){
		A.SwitchCard.superclass.addEvents.call(this);
    	this.addEvents(
    	/**
         * @event cardhide
         * 卡片隐藏事件.
         * @param {SwitchCard} this 当前组件.
         * @param {Array} cmps 组件集合对象.
         */
    	'cardhide',
    	/**
         * @event cardshow
         * 卡片显示事件.
         * @param {SwitchCard} this 当前组件.
         * @param {Array} cmps 组件集合对象.
         */
    	'cardshow');
    	this.processListener('on');
    },
	onUpdate : function(ds,record,name,v){
		if(this.binder && this.binder.name == name){
			this.showByValue(v);
		}
	},
	onIndexChange : function(ds,record,name){
		if(this.binder && (name = this.binder.name)){
			this.showByValue(record.get(name));
		}
	},
	showByIndexs : function(){
		var sf = this,
			indexs = Ext.isArray(arguments[0])?arguments[0]:Ext.toArray(arguments);
		sf.wrap.select(SELECTOR).each(function(body,all,index){
			var ishide = indexs.indexOf(index)==-1;
			if(ishide){
				if(!body.isStyle('display','none')){
					body.setStyle({display:'none'});
					sf.fireEvent('cardhide',sf,Ext.get(body.dom).cmps);
				}
			}else{
				sf.load(body);
			}
		});
	},
	load : function(body){
		body = Ext.get(body.dom);
		var sf = this,
			url = body.getAttributeNS('','url');
		if(Ext.isEmpty(url)){
			if(body.isStyle('display','none')){
				body.setStyle({display:''});
				sf.fireEvent('cardshow',sf,body.cmps);
			}
		}else{
			body.setStyle({display:''});
			body.cmps={};
			sf.showLoading(body);
			Ext.Ajax.request({
				url: Ext.urlAppend(body.getAttributeNS('','url'),'_vw='+A.getViewportWidth()+'&_vh='+A.getViewportHeight()),
			   	success: function(response, options){
			    	sf.clearLoading(body);
		    		body.set({'url':''});
			    	body.update(response.responseText,true,function(){
			    		sf.fireEvent('cardshow',sf,body.cmps);
			    	},body);
			    },
			    failure : function(response){
			    	body.update(response.responseText);
			    }
			});	
		}	
	},
	showByValue : function(value){
		var sf = this,wrap = sf.wrap;
		wrap.select(SELECTOR+'[case!='+value+']').each(function(body){
			if(!body.isStyle('display','none')){
				body.setStyle({display:'none'});
				sf.fireEvent('cardhide',sf,Ext.get(body.dom).cmps);
			}
		},sf);
		wrap.select(SELECTOR+'[case='+value+']')
			.each(sf.load,sf);
	},
	bind : function(ds,name){
		if(Ext.isString(ds)){
			ds = $(ds);
			if(!ds)return;
		}
		var sf = this,
			r = ds.getCurrentRecord();
		sf.binder = {
			ds : ds,
			name:name
		}
		sf.processDatasetListener('on');
		r && sf.showByValue(r.get(name));
	},
	showLoading : function(dom){
    	dom.update(_lang['switchcard.loading'])
			.setStyle({'text-align':'center','line-height':5});
    },
    clearLoading : function(dom){
    	dom.update('')
    		.setStyle({'text-align':'','line-height':''});
    },
	destroy : function(){
		var sf = this,wrap = sf.wrap;
		Ext.each(wrap.query('.switchcard-body'),function(body){
			Ext.iterate(Ext.get(body).cmps,function(key,cmp){
				try{
    				cmp.destroy && cmp.destroy();
    			}catch(e){
    				alert('销毁SwitchCard出错: ' + e);
    			}
			});
		});
		A.SwitchCard.superclass.destroy.call(sf);
	}
});
A.SwitchCard.revision='$Rev$';
})($A);