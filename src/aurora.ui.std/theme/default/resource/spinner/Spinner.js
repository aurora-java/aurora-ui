/**
 * @class Aurora.Spinner
 * @extends Aurora.TextField
 * <p>微调范围输入组件.
 * @author huazhen.wu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Spinner = Ext.extend($A.TextField,{
	constructor: function(config) {
        $A.Spinner.superclass.constructor.call(this, config);
    },
    initComponent : function(config){
    	$A.Spinner.superclass.initComponent.call(this, config);
    	this.step = Number(config.step||1);
		this.max = Ext.isEmpty(config.max)?Number.MAX_VALUE:Number(config.max);
		this.min = Ext.isEmpty(config.min)?-Number.MAX_VALUE:Number(config.min);
		var decimal = String(this.step).split('.')[1];
		this.decimalprecision = decimal?decimal.length:0;
    	this.btn = this.wrap.child('div.item-spinner-btn');
    },
    processListener: function(ou){
    	$A.Spinner.superclass.processListener.call(this, ou);
    	this.btn[ou]('mouseover',this.onBtnMouseOver,this);
    	this.btn[ou]('mouseout',this.onBtnMouseOut,this);
    	this.btn[ou]('mousedown',this.onBtnMouseDown,this);
    	this.btn[ou]('mouseup',this.onBtnMouseUp,this);
    },
    onBtnMouseOver:function(e,t){
    	Ext.fly(t).addClass('spinner-over');
    },
    onBtnMouseOut:function(e,t){
    	Ext.fly(t).removeClass('spinner-over');
    	this.onBtnMouseUp(e,t);
    },
    onBtnMouseDown:function(e,t){
    	var target = Ext.fly(t);
    	target.addClass('spinner-select');
		var rv = Number(this.getValue()),
			isPlus = target.hasClass('item-spinner-plus'),
    		sf = this;
		if(isNaN(rv))rv = 0;
		rv = this.goStep(rv,isPlus);
		if(rv <= this.max && rv >= this.min){
	    	this.setRawValue(rv);
	    	this.tempValue = rv;
	    	this.intervalId = setInterval(function(){
		    	clearInterval(sf.intervalId);
	    		sf.intervalId = setInterval(function(){
	    			rv = sf.goStep(rv,isPlus);
	    			if(rv <= sf.max && rv >= sf.min){
		    			sf.setRawValue(rv);
		    			sf.tempValue = rv;
	    			}else{
				    	clearInterval(sf.intervalId);
	    			}
	    		},40);
	    	},500);
		}
    },
    onBtnMouseUp : function(e,t){
    	clearInterval(this.intervalId);
    	Ext.fly(t).removeClass('spinner-select');
    	this.setValue(this.tempValue);
    	delete this.intervalId;
    },
    goStep : function(n,isPlus){
    	n += isPlus ? this.step : -this.step;
    	var mod = this.toFixed(this.toFixed(n - this.min)%this.step);
    	return this.toFixed(n - (mod == this.step ? 0 : mod));
    },
    toFixed : function(n){
    	return Number(n.toFixed(this.decimalprecision));
    },
    processValue : function(v){
    	if(Ext.isEmpty(v)||isNaN(v))return '';
    	if(v > this.max)v = this.max;
    	else if(v < this.min)v = this.min;
    	//else v -= v%this.step;
        return v;
    }
})