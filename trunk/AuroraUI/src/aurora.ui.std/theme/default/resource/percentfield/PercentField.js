/**
 * @class Aurora.PercentField
 * @extends Aurora.NumberField
 * <p>百分数输入组件.</p>
 * @author huazhen.wu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.PercentField = Ext.extend($A.NumberField,{
    formatValue : function(v){
    	if(Ext.isEmpty(v))return '';
        return $A.PercentField.superclass.formatValue.call(this,$A.FixMath.mul(v,100));
    },
    processValue : function(v){
    	if(Ext.isEmpty(v))return '';
        return $A.FixMath.div($A.PercentField.superclass.processValue.call(this,v),100);
    }
});