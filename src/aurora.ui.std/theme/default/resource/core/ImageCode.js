/**
 * @class Aurora.ImageCode
 * @extends Aurora.Component
 * <p>图片验证码组件.
 * @author njq.niu@hand-china.com
 * @constructor 
 */
$A.ImageCode = Ext.extend($A.Component,{
    processListener: function(ou){
        $A.ImageCode.superclass.processListener.call(this,ou);
        this.wrap[ou]("click", this.onClick,  this);
    },
    onClick : function(){
        this.wrap.dom.src = "imagecode?r="+Math.random();
    }
});