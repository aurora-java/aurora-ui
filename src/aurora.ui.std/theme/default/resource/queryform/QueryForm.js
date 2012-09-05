$A.QueryForm = Ext.extend($A.Component,{
	initComponent:function(config){
		$A.QueryForm.superclass.initComponent(config);
		var sf = this,wrap= sf.bodyWrap = sf.wrap.child('.form_body_wrap');
		sf.body = wrap.first();
		if(!sf.isopen)sf.body.hide();
	},
	open : function(){
		var sf = this,body = sf.body;
		if(sf.isopen)return;
		sf.isopen = true;
		sf.bodyWrap.setHeight(body.getHeight(),{
			callback:function(){body.show();}
		});
	},
	close : function(){
		var sf = this;
		if(!sf.isopen)return;
		sf.isopen = false;
		sf.body.hide();
		sf.bodyWrap.setHeight(0,true);
	},
	trigger : function(){
		this[this.isopen?'close':'open']();
	}
});