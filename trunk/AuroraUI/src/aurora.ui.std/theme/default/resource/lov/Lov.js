/**
 * @class Aurora.Lov
 * @extends Aurora.TextField
 * <p>Lov 值列表组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Lov = Ext.extend($A.TextField,{
	constructor: function(config) {
		this.isWinOpen = false;
		this.fetching = false;
		this.context = config.context||'';
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
    	this.addEvents(
    	/**
         * @event commit
         * commit事件.
         * @param {Aurora.Lov} lov 当前Lov组件.
         * @param {Aurora.Record} r1 当前lov绑定的Record
         * @param {Aurora.Record} r2 选中的Record. 
         */
    	'commit');
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
//        this.setRawValue('')
        var record = lr ? lr : this.record;
        if(record){
            var mapping = this.getMapping();
            for(var i=0;i<mapping.length;i++){
                var map = mapping[i];
                record.set(map.to,r.get(map.from)||'');
            }
        }
        this.fireEvent('commit', this, record, r)
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
			url = this.context + 'sys_lov.svc?svc='+this.lovservice+'&pagesize=1&pagenum=1&_fetchall=false&_autocount=false';
		}else if(!Ext.isEmpty(this.lovmodel)){
			url = this.context + 'autocrud/'+this.lovmodel+'/query?pagesize=1&pagenum=1&_fetchall=false&_autocount=false';
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
		$A.slideBarEnable = $A.SideBar.enable;
        $A.SideBar.enable = false;
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
			$A.SideBar.enable = $A.slideBarEnable;
		}, this.onFetchFailed, this);
	},
	onFetchFailed: function(res){
		$A.SideBar.enable = $A.slideBarEnable;
		$A.showErrorMessage('错误', res.error.message);
	},
	onBlur : function(e){      
        if(!this.isEventFromComponent(e.target)){
        	$A.Lov.superclass.onBlur.call(this,e);
        }
    },
	showLovWindow : function(e){
		e.stopEvent();
		if(this.fetching||this.isWinOpen||this.readonly) return;
		this.isWinOpen = true;
		
		var v = this.getRawValue();
		this.blur();
		var url;
		if(!Ext.isEmpty(this.lovurl)){
			url = this.lovurl+'?';
		}else if(!Ext.isEmpty(this.lovservice)){
			url = this.context + 'sys_lov.screen?url='+encodeURIComponent(this.context + 'sys_lov.svc?svc='+this.lovservice)+'&service='+this.lovservice+'&';			
		}else {
			url = this.context + 'sys_lov.screen?url='+encodeURIComponent(this.context + 'autocrud/'+this.lovmodel+'/query')+'&service='+this.lovmodel+'&';
		}
    	this.win = new $A.Window({title:this.title||'Lov', url:url+"lovid="+this.id+"&key="+encodeURIComponent(v)+"&gridheight="+(this.lovgridheight||350)+"&innerwidth="+((this.lovwidth||400)-30), height:this.lovheight||400,width:this.lovwidth||400});
    	this.win.on('close',this.onWinClose,this);
    }
});