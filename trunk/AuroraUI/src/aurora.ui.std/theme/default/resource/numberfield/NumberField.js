/**
 * @class Aurora.NumberField
 * @extends Aurora.TextField
 * <p>数字输入组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.NumberField = Ext.extend($A.TextField,{
	allowdecimals : true,
    allownegative : true,
    allowformat : true,
	baseChars : "0123456789",
    decimalSeparator : ".",
    decimalprecision : 2,
	constructor: function(config) {
        $A.NumberField.superclass.constructor.call(this, config);
    },
    initComponent : function(config){
    	var sf = this;
    	$A.NumberField.superclass.initComponent.call(sf, config); 
    	sf.max = Ext.isEmpty(config.max)?Number.MAX_VALUE:Number(config.max);
		sf.min = Ext.isEmpty(config.min)?-Number.MAX_VALUE:Number(config.min);
    	sf.restrict = sf.baseChars+'';
    	sf.restrictinfo = _lang['numberfield.only'];
        if(sf.allowdecimals){
            sf.restrict += sf.decimalSeparator;
        }
        if(sf.allownegative){
            sf.restrict += "-";
        }
    },
//    initEvents : function(){
//    	$A.NumberField.superclass.initEvents.call(this);
//    },
    onBlur : function(e){
    	$A.ToolTip.hide();
    	$A.NumberField.superclass.onBlur.call(this,e);
    },
    formatValue : function(v){
    	var sf = this,rv = $A.parseScientific(sf.fixPrecision(sf.parseValue(v)));
        if(sf.allowformat)rv = $A.formatNumber(rv);
        return $A.NumberField.superclass.formatValue.call(sf,rv);
    },
    processMaxLength : function(rv){
    	var s=$A.parseScientific(rv).split('.'),isNegative=false;
    	if(s[0].search(/-/)!=-1)isNegative=true;
    	return (isNegative?'-':'')+$A.NumberField.superclass.processMaxLength.call(this, s[0].replace(/[-,]/g,''))+(s[1]?'.'+s[1]:''); 
    },
    initMaxLength : function(maxlength){
    	if(maxlength && !this.allowdecimals)
    		this.el.dom.maxLength=maxlength;
    },
    processValue : function(v){
    	var sf = this,info;
    	v = sf.parseValue(v);
    	if(v>sf.max){
    		v = sf.max;
    		info = _lang['numberfield.max']+v;
    	}else if(v<sf.min){
    		v = sf.min
    		info = _lang['numberfield.min']+v;
    	}
    	if(info)$A.ToolTip.show(sf.id,info);
    	return v;
    },
    onFocus : function(e) {
    	var sf = this;
    	if(!sf.readonly && sf.allowformat) {
            sf.setRawValue($A.removeNumberFormat(sf.getRawValue()));
        }
    	$A.NumberField.superclass.onFocus.call(sf,e);
    },
    parseValue : function(value){
    	var sf = this;
    	value = String(value);
		if(value.indexOf(",")!=-1)value=value.replace(/,/g,"");
    	if(!sf.allownegative)value = value.replace('-','');
    	if(!sf.allowdecimals)value = value.indexOf(".")==-1?value:value.substring(0,value.indexOf("."));
        value = parseFloat(sf.fixPrecision(value.replace(sf.decimalSeparator, ".")));
        return isNaN(value) ? '' : value;
    },
    fixPrecision : function(value){
        var nan = isNaN(value);
        if(!this.allowdecimals || this.decimalprecision == -1 || nan || !value){
           return nan ? '' : value;
        }
        var vs = parseFloat(value).toFixed(this.decimalprecision);
        if(this.allowpad == false) vs = String(parseFloat(vs))
        return vs;
    }
})