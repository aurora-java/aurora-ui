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
    },
    processListener : function(ou){
    	$A.TextField.superclass.processListener.call(this, ou);
    	if(this.typecase){
    		if(!window.clipboardData){
    			this.el[ou]("change", this.onChange, this);
    		}else if(this.typecase){
    			this.el[ou]("paste", this.onPaste, this);
    		}
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
            setTimeout(function(){window.clipboardData.setData('text',t);},1);
    	}
    },
    onChange : function(e){
        var str = this.getRawValue();
        if(this.isDbc(str)){
            str = this.dbc2sbc(str);
            this.setRawValue(str)
        }
    	if(this.typecase == 'upper'){
	    	this.setValue(this.getRawValue().toUpperCase());
        }else if(this.typecase == 'lower') {
        	this.setValue(this.getRawValue().toLowerCase());
        }
    },
    destroy : function(){
        $A.TextField.superclass.destroy.call(this);
    },
    isCapsLock: function(e){
        var keyCode  =  e.getKey();
        var isShift  =  e.shiftKey;
        if (((keyCode >= 65&&keyCode<=90)&&!isShift)||((keyCode>=97&&keyCode<=122)&&isShift)){
        	if(this.dcl!=true)
            $A.showWarningMessage(_lang['textfield.warn'], _lang['textfield.warn.capslock']);
        	this.dcl = true;
        }else{
            this.dcl = false;
        }
    }, 
    onKeyPress : function(e){
    	$A.TextField.superclass.onKeyPress.call(this,e);
    	if(this.detectCapsLock) this.isCapsLock(e);
		var keyCode = e.getKey();
		var code = keyCode;
		if(this.typecase&&!e.ctrlKey&&!this.readonly){
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
                var e = d.selectionEnd;
//                if(rv.length>=this.maxlength&&s==e)return;
                if(this.isOverMaxLength(rv) && s==e) return;
                rv = rv.substring(0,s) + v + rv.substring(e,rv.length);
                this.setRawValue(rv)
                d.selectionStart=s+1;
                d.selectionEnd=d.selectionStart;
            }
    	}
    },
    isDbc : function(s){
        var dbc = false;
        for(var i=0;i<s.length;i++){
            var c = s.charCodeAt(i);
            if((c>65248)||(c==12288)) {
                dbc = true
                break;
            }
        }
        return dbc;
    },
    dbc2sbc : function(str){
        var result = '';
        for(var i=0;i<str.length;i++){
            code = str.charCodeAt(i);//获取当前字符的unicode编码
            if (code >= 65281 && code <= 65373) {//在这个unicode编码范围中的是所有的英文字母已及各种字符
                result += String.fromCharCode(str.charCodeAt(i) - 65248);//把全角字符的unicode编码转换为对应半角字符的unicode码                
            } else if (code == 12288){//空格
                result += String.fromCharCode(str.charCodeAt(i) - 12288 + 32);
            } else {
                result += str.charAt(i);
            }
        }
        return result;
    }
})