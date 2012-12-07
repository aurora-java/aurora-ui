$A.QueryForm = Ext.extend($A.Component,{
	initComponent:function(config){
		$A.QueryForm.superclass.initComponent.call(this,config);
		var sf = this,wrap= sf.bodyWrap = sf.wrap.child('.form_body_wrap');
		if(wrap){
			sf.body = wrap.first();
			sf.hasbody = true;
			if(!sf.isopen)sf.body.hide();
		}
		sf.searchInput = $A.CmpManager.get(sf.id + '_query');
		sf.rds = $A.CmpManager.get(sf.resulttarget);
	},
	bind : function(ds){
		if(Ext.isString(ds)){
			ds = $(ds);
		}
		this.qds = ds;
	},
	doSearch : function(){
		var sf = this,
			input = sf.searchInput,
			queryhook = sf.queryhook,
			queryfield = sf.queryfield;
		if(sf.rds && (queryhook || queryfield)){
			if(!sf.isopen && input){
				var value = input.getValue(),
					qds = sf.qds;
				if(queryhook){
					queryhook(value,qds);
	//				Ext.iterate(queryhook(value),function(key,v){
	//					qds.setQueryParameter(key,v);
	//				});
				}else
					if(qds.getCurrentRecord())qds.getCurrentRecord().set(queryfield,value);
			}
			sf.rds.query();	
		}
	},
	open : function(){
		var sf = this,body = sf.body,input = sf.searchInput;
		if(sf.isopen && sf.hasbody)return;
		if(input){
			input.readonly = true;
			input.setValue('');
			input.initStatus();
		}
//		sf.qds.reset();
		sf.isopen = true;
        sf.bodyWrap.parent('TBODY').setStyle('display','block');
		sf.bodyWrap.setHeight(body.getHeight(),{
			callback:function(){if(sf.isopen)body.show();}
		});
	},
	close : function(){
		var sf = this,input = sf.searchInput;
		if(sf.isopen && sf.hasbody){
			input.readonly = false;
			input.initStatus();
			sf.qds.reset();
			sf.isopen = false;
			sf.body.hide();
            sf.bodyWrap.parent('TBODY').setStyle('display','none');
			sf.bodyWrap.setHeight(0,true);
		}
	},
	trigger : function(){
		this[this.isopen?'close':'open']();
	},
	reset : function(){
		this.searchInput.setValue('');
		this.qds.reset();
	}
//	,
//	setSearchMapping : function(mapping){
//		this.mapping = mapping;
//	}
});