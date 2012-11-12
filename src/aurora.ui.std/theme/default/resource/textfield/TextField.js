/**
 * @class Aurora.TextField
 * @extends Aurora.Field
 * <p>文本输入组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.TextField = Ext.extend($A.Field,{
    initComponent : function(config){
    	$A.TextField.superclass.initComponent.call(this, config);
    	var sf = this,
    		restrict = sf.restrict,
    		typecase = sf.typecase;
    	if(restrict){
    		sf.restrict = restrict.replace(/^\[|\]$/mg,'');
    	}
    	typecase &&
	    	sf.el.setStyle('text-transform',typecase+'case');
    },
    isCapsLock: function(e){
        var keyCode  =  e.getKey(),
        	isShift  =  e.shiftKey;
        if (((keyCode >= 65&&keyCode<=90)&&!isShift)||((keyCode>=97&&keyCode<=122)&&isShift)){
        	if(this.dcl!=true)
            $A.showWarningMessage(_lang['textfield.warn'], _lang['textfield.warn.capslock']);
        	this.dcl = true;
        }else{
            this.dcl = false;
        }
    }, 
    onKeyPress : function(e){
    	var sf = this,k = e.getCharCode(),
    		restrict = sf.restrict,
    		restrictinfo = sf.restrictinfo;
        if((Ext.isGecko || Ext.isOpera) && (e.isSpecialKey() || k == 8 || k == 46)){//BACKSPACE or DELETE
            return;
        }
    	if(restrict && !new RegExp('['+restrict+']').test(String.fromCharCode(k))){
    		if(restrictinfo)$A.ToolTip.show(sf.id,restrictinfo);
            e.stopEvent();
            return;
    	}
    	$A.TextField.superclass.onKeyPress.call(sf,e);
    	if(sf.detectCapsLock) sf.isCapsLock(e);
    },
    processValue : function(v){
    	var sf = this,
    		restrict = sf.restrict,
    		restrictinfo = sf.restrictinfo,
    		vv = v;
    	if(restrict){
    		v = String(v).replace(new RegExp('[^'+restrict+']','mg'),'');
    		if(restrictinfo && v != vv)$A.ToolTip.show(sf.id,restrictinfo);
    	}
        return v;
    }
})