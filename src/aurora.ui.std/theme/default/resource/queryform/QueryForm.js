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
	processListener: function(ou){
    	$A.QueryForm.superclass.processListener.call(this, ou);
    	Ext.fly(document)[ou]('click',this.formBlur,this);
    },
    formBlur : function(e,t){
    	if(!this.isEventFromComponent(t)){
    		this.close();
    	}
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
		if(sf.rds){
			if(!sf.isopen && input){
				var value = input.getValue(),
					qds = sf.qds;
				if(queryhook){
					queryhook(value,qds);
				}else if(queryfield)
					if(qds.getCurrentRecord())qds.getCurrentRecord().set(queryfield,value);
			}
			sf.rds.query();	
            sf.close();
		}
	},
	open : function(){
		var sf = this,body = sf.body;
		if(sf.isopen && sf.hasbody)return;
		sf.isopen = true;
        sf.bodyWrap.parent('TBODY').setStyle('display','block');
        if(sf.isopen)body.show()
        sf.bodyWrap.setHeight(body.getHeight()+10);
        sf.bodyWrap.fadeIn();
	},
	close : function(){
		var sf = this;
		if(sf.isopen && sf.hasbody){
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
		if(this.searchInput)this.searchInput.setValue('');
		this.qds.reset();
	}
});