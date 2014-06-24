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
		indexs = Ext.isArray(arguments[0])?arguments[0]:Ext.toArray(arguments);
		this.wrap.select(SELECTOR).each(function(body,all,index){
			body.setStyle({display:indexs.indexOf(index)==-1?'none':''});
		});
	},
	load : function(body){
		var sf = this;
		body = Ext.get(body);
		body.cmps={};
		sf.showLoading(body);
		Ext.Ajax.request({
			url: Ext.urlAppend(body.getAttributeNS('','url'),'_vw='+A.getViewportWidth()+'&_vh='+A.getViewportHeight()),
		   	success: function(response, options){
		    	sf.clearLoading(body);
	    		body.set({'url':''});
		    	body.update(response.responseText,true,function(){
		    	},body);
		    },
		    failure : function(response){
		    	body.update(response.responseText);
		    }
		});		
	},
	showByValue : function(value){
		var sf = this,wrap = sf.wrap;
		wrap.select(SELECTOR+'[case='+value+']')
			.setStyle({display:''})
			.filter('[url]')
			.each(sf.load,sf);
		wrap.select(SELECTOR+'[case!='+value+']').setStyle({display:'none'});
	},
	bind : function(ds,name){
		if(Ext.isString(ds)){
			ds = $(ds);
			if(!ds)return;
		}
		var sf = this;
		sf.binder = {
			ds : ds,
			name:name
		}
		sf.processDatasetListener('on');
		sf.showByValue(ds.getCurrentRecord().get(name));
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
		A.SwitchCard.superclass.destroy.call(sf);
		wrap.select('.switchcard-body').each(function(body){
			Ext.iterate(Ext.get(body).cmps,function(key,cmp){
				try{
    				cmp.destroy && cmp.destroy();
    			}catch(e){
    				alert('销毁SwitchPanel出错: ' + e);
    			}
			});
		});
	}
});
A.SwitchCard.revision='$Rev$';
})($A);