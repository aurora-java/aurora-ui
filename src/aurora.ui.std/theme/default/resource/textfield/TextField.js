/**
 * @class Aurora.TextField
 * @extends Aurora.Field
 * <p>文本输入组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.TextField = Ext.extend($A.Field,{
	constructor: function(config) {
        $A.TextField.superclass.constructor.call(this, config);        
    },
    initComponent : function(config){
    	$A.TextField.superclass.initComponent.call(this, config);    	
    },
    initEvents : function(){
    	$A.TextField.superclass.initEvents.call(this);   
    	if(this.typecase){
    		this.el.on("paste", this.onPaste, this);
    	}
    },
    onPaste : function(e){	
    	if(window.clipboardData){
            var t = window.clipboardData.getData('text');
            if(this.typecase == 'upper'){
                window.clipboardData.setData('text',t.toUpperCase());
            }else if(this.typecase == 'lower') {
            	window.clipboardData.setData('text',t.toLowerCase());
            }
    	}else{
            e.stopEvent();
    	}
    },
    destroy : function(){
    	if(this.typecase){
            this.el.un("paste", this.onPaste, this);
        }
        $A.TextField.superclass.destroy.call(this);
    },
    isCapsLock: function(e){
        var keyCode  =  e.getKey();
        var isShift  =  e.shiftKey;
        if (((keyCode >= 65&&keyCode<=90)&&!isShift)||((keyCode>=97&&keyCode<=122)&&isShift)){
        	if(this.dcl!=true)
            $A.showWarningMessage('警告', '大些锁定打开!');
        	this.dcl = true;
        }else{
            this.dcl = false;
        }
    }, 
    onKeyPress : function(e){
    	$A.TextField.superclass.onKeyPress.call(this,e);
    	if(this.detectCapsLock) this.isCapsLock(e);
		var keyCode = e.getKey(),code;
		if(this.typecase){
        	if(this.typecase == 'upper'){
                if(keyCode>=97 && keyCode<=122) code = keyCode - 32;
            }else if(this.typecase == 'lower') {
            	if(keyCode>=65 && keyCode<=90) code = keyCode + 32;
            }
            if(Ext.isIE) {
                e.browserEvent.keyCode = code;
            }else if((keyCode>=97 && keyCode<=122)||(keyCode>=65 && keyCode<=90)){
                var v = String.fromCharCode(code);
                e.stopEvent();
                var d = this.el.dom
                var rv = this.getRawValue();
                var s = d.selectionStart;
                var e = d.selectionEnd
                rv = rv.substring(0,s) + v + rv.substring(e,rv.length);
                this.setRawValue(rv)
                d.selectionStart=s+1;
                d.selectionEnd=d.selectionStart;
            }
    	}
    }
})