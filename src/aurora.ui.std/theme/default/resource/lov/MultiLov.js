/**
 * @class Aurora.MultiLov
 * @extends Aurora.Lov
 * <p>MultiLov 值列表组件.
 * @author huazhen.wu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.MultiLov = Ext.extend($A.MultiTextField,{
    constructor: function(config) {
        this.fetchremote = true;
        $A.MultiLov.superclass.constructor.call(this, config);        
    },
    initComponent : function(config){
    	var sf = this;
        $A.MultiLov.superclass.initComponent.call(sf,config);
        sf.trigger = sf.wrap.child('div[atype=triggerfield.trigger]');
    },
    initEvents : function(){
        $A.MultiLov.superclass.initEvents.call(this);
        this.addEvents(
        /**
         * @event beforetriggerclick
         * 点击弹出框按钮之前的事件。
         * @param {Aurora.Lov} lov 当前Lov组件.
         */
        'beforetriggerclick'
       );
    },
    processListener : function(ou){
    	var sf = this;
        $A.MultiLov.superclass.processListener.call(sf,ou);
        sf.trigger[ou]('mousedown',sf.onWrapFocus,sf, {preventDefault:true})
        	[ou]('click',sf.onTriggerClick, sf, {preventDefault:true});
    },
    onTriggerClick : function(e){
    	e.stopEvent();
    	var sf = this,view = sf.autocompleteview;
    	if(sf.fireEvent('beforetriggerclick',sf)){
    		sf.showLovWindow();
    	}
    },
    getLovPara : function(){
    	return this.getPara();
    },
    onWinClose: function(){
    	var sf = this;
        sf.isWinOpen = false;
        sf.win = null;
        if(!Ext.isIE6 && !Ext.isIE7){//TODO:不知什么地方会导致冲突,ie6 ie7 会死掉 
            sf.focus();
        }else{
        	(function(){sf.focus()}).defer(10);
        }
    },
    showLovWindow : function(){  
    	var sf = this;
        if(sf.fetching||sf.isWinOpen||sf.readonly) return;
        
        var v = sf.getRawValue(),
        	lovurl = sf.lovurl,
    		svc = sf.service,ctx = sf.context,
    		w = sf.lovwidth||600,
    		h = sf.lovheight||400,
			url;
        sf.blur();
        var url;
        if(!Ext.isEmpty(lovurl)){
            url = Ext.urlAppend(lovurl,Ext.urlEncode(sf.getFieldPara()));
        }else if(!Ext.isEmpty(svc)){
//              url = sf.context + 'sys_lov.screen?url='+encodeURIComponent(sf.context + 'sys_lov.svc?svc='+sf.lovservice + '&'+ Ext.urlEncode(sf.getLovPara()))+'&service='+sf.lovservice+'&';
            url = ctx + 'sys_multiLov.screen?url='+encodeURIComponent(Ext.urlAppend(ctx + 'autocrud/'+svc+'/query',Ext.urlEncode(sf.getLovPara())))+'&service='+svc;
    	}
        if(url) {
	        sf.isWinOpen = true;
            sf.win = new $A.Window({title:sf.title||'Lov', url:Ext.urlAppend(url,"lovid="+sf.id+"&key="+encodeURIComponent(v)+"&gridheight="+(sf.lovgridheight||260)+"&innerwidth="+(w-30)+"&innergridwidth="+Math.round((w-90)/2)+"&lovautoquery="+(Ext.isEmpty(sf.lovautoquery) ? 'true' : sf.lovautoquery)+"&lovlabelwidth="+(sf.lovlabelwidth||75)+"&lovpagesize="+(sf.lovpagesize||'')), height:h,width:w});
            sf.win.on('close',sf.onWinClose,sf);
        }
    }
});