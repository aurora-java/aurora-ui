$A.QueryForm = Ext.extend($A.Component,{
	initComponent:function(config){
		$A.QueryForm.superclass.initComponent(config);
		var sf = this,wrap= sf.bodyWrap = sf.wrap.child('.form_body_wrap');
		sf.body = wrap.first();
		sf.searchField = $(sf.id + '_query');
		if(!sf.isopen)sf.body.hide();
	},
	bind : function(ds){
		if(Ext.isString(ds)){
			ds = $(ds);
		}
		this.queryDataset = ds;
	},
	doSearch : function(){
		//TODO
		this.queryDataset.query();	
		this.open();
	},
	open : function(){
		var sf = this,body = sf.body;
		if(sf.isopen)return;
		sf.isopen = true;
		sf.bodyWrap.setHeight(body.getHeight(),{
			callback:function(){if(sf.isopen)body.show();}
		});
	},
	close : function(){
		var sf = this;
		if(sf.isopen){
			sf.isopen = false;
			sf.body.hide();
			sf.bodyWrap.setHeight(0,true);
		}
	},
	trigger : function(){
		this[this.isopen?'close':'open']();
	},
	setSearchMapping : function(mapping){
		this.mapping = mapping;
	}
});