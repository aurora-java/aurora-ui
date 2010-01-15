Aurora.Lov = Ext.extend(Aurora.TextField,{
	constructor: function(config) {
		this.isWinOpen = false
        Aurora.Lov.superclass.constructor.call(this, config);        
    },
    initComponent : function(config){
    	Aurora.Lov.superclass.initComponent.call(this,config);
    	this.trigger = this.wrap.child('div[atype=triggerfield.trigger]'); 
    },
    initEvents : function(){
    	Aurora.TriggerField.superclass.initEvents.call(this);
    	this.addEvents('commit');
    	this.trigger.on('click',this.showLovWindow, this, {preventDefault:true})
    },
    destroy : function(){
    	Aurora.Lov.superclass.destroy.call(this);
	},
	setWidth: function(w){
		this.wrap.setStyle("width",(w+3)+"px");
		this.el.setStyle("width",(w-20)+"px");
	},
	onBlur : function(e){
		if(this.readonly) return;
		var vf = this.record ? this.record.get(this.valuefield) : null;
        var r = this.getRawValue();
        var v = this.getValue();
        var t = this.text;
        var needLookup = true;
        if(r == ''){        
        	needLookup = false;
        }else{
	        if(!Ext.isEmpty(vf) && r == t){
	        	needLookup = false;
	        }
	        else if(!this.record){
	        	needLookup = false;
	        }
	        
        }
        if(needLookup){
        	this.showLovWindow();
        }else{
        	Aurora.Lov.superclass.onBlur.call(this,e); 
        	if(r == '' && this.record)
        	this.record.set(this.valuefield,'');
        }
//        if(r !='' && (v=='' || r != t)){
////			this.hasFocus = false;
////			this.wrap.removeClass(this.focusCss);
////	        this.fireEvent("blur", this);
////        	if(!this.attachGrid)
//        	this.showLovWindow();
//        }else {
//        	Aurora.Lov.superclass.onBlur.call(this,e); 
//        	if(r == '' && this.record)
//        	this.record.set(this.valuefield,'');
//        }
	},
	onKeyDown : function(e){
        if(e.getKey() == 13) {
        	this.showLovWindow();
        }else {
        	Aurora.TriggerField.superclass.onKeyDown.call(this,e);
        }
    },
    canHide : function(){
    	return this.isWinOpen == false
    },
	commitValue:function(v, t, r){
		this.win.close();
        this.setValue(t)
        if(this.record)
		this.record.set(this.valuefield, v);
		this.fireEvent('commit', this, v, t, r)
	},
	setValue: function(v, silent){
		Aurora.Lov.superclass.setValue.call(this, v, silent);
		this.text = v;
		this.setRawValue(this.text);
	},
	onWinClose: function(){
		this.isWinOpen = false;
		this.win = null;
		this.focus();
	},
	showLovWindow : function(){
		if(this.isWinOpen == true) return;
		if(this.readonly == true) return;
		if(this.ref == "" || Ext.isEmpty(this.ref))return;
		this.isWinOpen = true;
		var v = '';
		var rv = this.getRawValue();
		var t = this.text;
		if(rv==t){
			if(this.record)
			v = this.record.get(this.valuefield);
			if(!v) v = '';
		}else{
			v = rv;
		}
		this.blur();
    	this.win = new Aurora.Window({title:this.title||'Lov', url:(this.ref) + "?lovid="+this.id+"&key="+v, height:this.winheight||400,width:this.winwidth||400});
    	this.win.on('close',this.onWinClose,this);
    }
});