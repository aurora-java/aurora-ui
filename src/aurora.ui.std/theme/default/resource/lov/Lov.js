$A.Lov = Ext.extend($A.TextField,{
	constructor: function(config) {
		this.isWinOpen = false;
		this.fetching = false;
        $A.Lov.superclass.constructor.call(this, config);        
    },
    initComponent : function(config){
    	$A.Lov.superclass.initComponent.call(this,config);
    	this.trigger = this.wrap.child('div[atype=triggerfield.trigger]'); 
    },
    processListener: function(ou){
    	$A.Lov.superclass.processListener.call(this,ou);
    	this.trigger[ou]('click',this.showLovWindow, this, {preventDefault:true})
    },
    initEvents : function(){
    	$A.Lov.superclass.initEvents.call(this);
    	this.addEvents('commit');
    },
    destroy : function(){
    	$A.Lov.superclass.destroy.call(this);
	},
	setWidth: function(w){
		this.wrap.setStyle("width",(w+3)+"px");
		this.el.setStyle("width",(w-20)+"px");
	},
	onChange : function(e){
        this.fetchRecord();
	},
//	onKeyDown : function(e){
//        if(e.getKey() == 13) {
//        	this.showLovWindow();
//        }else {
//        	$A.TriggerField.superclass.onKeyDown.call(this,e);
//        }
//    },
    canHide : function(){
    	return this.isWinOpen == false
    },
    commit:function(r,lr){
		if(this.win) this.win.close();
		var record = lr ? lr : this.record;
		if(record){
			var mapping = this.getMapping();
			for(var i=0;i<mapping.length;i++){
				var map = mapping[i];
				record.set(map.to,r.get(map.from));
			}
		}
	},
	getMapping: function(){
		var mapping
		if(this.record){
			var field = this.record.getMeta().getField(this.binder.name);
			if(field){
				mapping = field.get('mapping');
			}
		}
		return mapping ? mapping : [{from:this.binder.name,to:this.binder.name}];
	},
//	setValue: function(v, silent){
//		$A.Lov.superclass.setValue.call(this, v, silent);
//		if(this.record && this.dataRecord && silent !== true){
//			var mapping = this.getMapping();
//			for(var i=0;i<mapping.length;i++){
//				var map = mapping[i];
//				this.record.set(map.to,this.dataRecord.get(map.from));
//			}		
//		}
//	},
	onWinClose: function(){
		this.isWinOpen = false;
		this.win = null;
		this.focus();
	},
	fetchRecord : function(){
		if(this.readonly == true) return;
		if(!Ext.isEmpty(this.lovurl)){
			this.showLovWindow();
			return;
		}
		this.fetching = true;
		var v = this.getRawValue();
		if(!Ext.isEmpty(this.lovservice)){
			url = 'sys_lov.svc?svc='+this.lovservice+'&pagesize=1&pagenum=1&_fetchall=false&_autocount=false';
		}else if(!Ext.isEmpty(this.lovmodel)){
			url = 'autocrud/'+this.lovmodel+'/query?pagesize=1&pagenum=1&_fetchall=false&_autocount=false';
		}
		var p = {};
		var mapping = this.getMapping();
		for(var i=0;i<mapping.length;i++){
			var map = mapping[i];
			if(this.binder.name == map.to){
				p[map.from]=v;
				break;
			}
		}
		var record = this.record;
		$A.request(url, p, function(res){
			var r = new $A.Record({});
			if(res.result.record){
	    		var datas = [].concat(res.result.record);
	    		if(datas.length>0){
	    			var data = datas[0];
	    			r = new $A.Record(data);
	    		}
	    	}
	    	this.fetching = false;
			this.commit(r,record);
		}, this.onFetchFailed, this);
	},
	onFetchFailed: function(res){
		$A.showMessage('错误', res.error.message);
	},
	showLovWindow : function(){
		if(this.fetching||this.isWinOpen||this.readonly) return;
		this.isWinOpen = true;
		
		var v = this.getRawValue();
		this.blur();
		var url;
		if(!Ext.isEmpty(this.lovurl)){
			url = this.lovurl+'?';
		}else if(!Ext.isEmpty(this.lovservice)){
			url = 'sys_lov.screen?url='+encodeURIComponent('sys_lov.svc?svc='+this.lovservice)+'&service='+this.lovservice+'&';			
		}else {
			url = 'sys_lov.screen?url='+encodeURIComponent('autocrud/'+this.lovmodel+'/query')+'&service='+this.lovmodel+'&';
		}
    	this.win = new $A.Window({title:this.title||'Lov', url:url+"lovid="+this.id+"&key="+encodeURIComponent(v)+"&gridheight="+(this.lovgridheight||350)+"&innerwidth="+((this.lovwidth||400)-30), height:this.lovheight||400,width:this.lovwidth||400});
    	this.win.on('close',this.onWinClose,this);
    }
});