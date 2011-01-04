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
    	$A.NumberField.superclass.initComponent.call(this, config); 
    	this.allowed = this.baseChars+'';
        if(this.allowdecimals){
            this.allowed += this.decimalSeparator;
        }
        if(this.allownegative){
            this.allowed += "-";
        }
    },
    initEvents : function(){
    	$A.NumberField.superclass.initEvents.call(this);    	
    },
    onKeyPress : function(e){
        var k = e.getKey();
        //!Ext.isIE && (e.isSpecialKey() ||
        if(e.isSpecialKey()){
            return;
        }
        var c = e.getCharCode();
        if(this.allowed.indexOf(String.fromCharCode(c)) === -1){
            e.stopEvent();
            return;
        }
        $A.NumberField.superclass.onKeyPress.call(this, e); 
    },
    formatValue : function(v){
    	var rv = this.fixPrecision(this.parseValue(v))        
        if(this.allowformat)rv = $A.formatNumber(rv,this.decimalprecision);
        return rv;
    },
    processValue : function(v){
    	return this.fixPrecision(this.parseValue(v));
    },
    onFocus : function(e) {
    	if(this.allowformat) {
            this.setRawValue($A.removeNumberFormat(this.getRawValue()));
        }
    	$A.NumberField.superclass.onFocus.call(this,e);
    },
    parseValue : function(value){
    	value = String(value) 
    	if(!this.allownegative)value = value.replace('-','');
    	if(!this.allowdecimals)value = value.indexOf(".")==-1?value:value.substring(0,value.indexOf("."));
        value = parseFloat(value.replace(this.decimalSeparator, "."));
        return isNaN(value) ? '' : value;
    },
    fixPrecision : function(value){
        var nan = isNaN(value);
        if(!this.allowdecimals || this.decimalprecision == -1 || nan || !value){
           return nan ? '' : value;
        }
        return parseFloat(parseFloat(value).toFixed(this.decimalprecision));
    }
})