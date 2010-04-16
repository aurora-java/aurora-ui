$A.Lov = Ext.extend($A.TextField,{
	constructor: function(config) {
		this.isWinOpen = false
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
	onBlur : function(e){
		if(this.readonly) return;
		var vf = this.record ? this.record.get(this.binder.name) : null;
        var r = this.getRawValue();
        var v = this.getValue();
        var needLookup = true;
        if(r == ''){        
        	needLookup = false;
        }else{
        	if(r == v){
        		needLookup = false;
        	}
        }
        if(needLookup){
        	this.showLovWindow();
        }else{
        	$A.Lov.superclass.onBlur.call(this,e); 
        }
	},
	onKeyDown : function(e){
        if(e.getKey() == 13) {
        	this.showLovWindow();
        }else {
        	$A.TriggerField.superclass.onKeyDown.call(this,e);
        }
    },
    canHide : function(){
    	return this.isWinOpen == false
    },
    commit:function(r){
		this.win.close();
		this.dataRecord = r;
		var mapping = this.getMapping();
		for(var i=0;i<mapping.length;i++){
			var map = mapping[i];
			if(this.binder.name == map.to){
				this.setValue(r.get(map.from));
				break;
			}
		}
		this.dataRecord = null;
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
	setValue: function(v, silent){
		$A.Lov.superclass.setValue.call(this, v, silent);
		if(this.record && this.dataRecord && silent !== true){
			var mapping = this.getMapping();
			for(var i=0;i<mapping.length;i++){
				var map = mapping[i];
				this.record.set(map.to,this.dataRecord.get(map.from));
			}		
		}
	},
	onWinClose: function(){
		this.isWinOpen = false;
		this.win = null;
		this.focus();
	},
	showLovWindow : function(){
		if(this.isWinOpen == true) return;
		if(this.readonly == true) return;
//		if(this.ref == "" || Ext.isEmpty(this.ref))return;
		this.isWinOpen = true;
		
		var v = '';
		var rv = this.getRawValue();
		var t = this.getValue();
		if(rv!=t){
			v = rv;
		}		
		this.blur();
		var lovurl = (this.lovmodel !='') ? 'sys_lov.screen' : this.ref;
    	this.win = new $A.Window({title:this.title||'Lov', url:lovurl + "?service="+this.lovmodel+"&lovid="+this.id+"&key="+encodeURIComponent(v)+"&gridheight="+(this.lovgridheight||350)+"&innerwidth="+((this.lovwidth||400)-30), height:this.lovheight||400,width:this.lovwidth||400});
    	this.win.on('close',this.onWinClose,this);
    }
});