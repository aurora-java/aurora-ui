/**
 * @class Aurora.Spinner
 * @extends Aurora.TextField
 * <p>微调范围输入组件.
 * @author huazhen.wu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Spinner = Ext.extend($A.NumberField,{
//	constructor: function(config) {
//        $A.Spinner.superclass.constructor.call(this, config);
//    },
    initComponent : function(config){
    	var sf = this;
    	$A.Spinner.superclass.initComponent.call(sf, config);
		var decimal = String(sf.step = Number(config.step||1)).split('.')[1];
		sf.decimalprecision = decimal?decimal.length:0;
    	sf.btn = sf.wrap.child('div.item-spinner-btn');
    },
    processListener: function(ou){
    	var sf = this;
    	$A.Spinner.superclass.processListener.call(sf, ou);
    	sf.btn[ou]('mouseover',sf.onBtnMouseOver,sf)
    		[ou]('mouseout',sf.onBtnMouseOut,sf)
    		[ou]('mousedown',sf.onBtnMouseDown,sf)
    		[ou]('mouseup',sf.onBtnMouseUp,sf);
    },
    onBtnMouseOver:function(e,t){
    	if(this.readonly)return;
    	Ext.fly(t).addClass('spinner-over');
    },
    onBtnMouseOut:function(e,t){
    	if(this.readonly)return;
    	Ext.fly(t).removeClass('spinner-over');
    	this.onBtnMouseUp(e,t);
    },
    onBtnMouseDown:function(e,t){
    	if(this.readonly)return;
    	var target = Ext.fly(t),
			isPlus = !!target.addClass('spinner-select').parent('.item-spinner-plus'),
			sf = this;
		sf.goStep(isPlus,function(){
	    	sf.intervalId = setInterval(function(){
		    	clearInterval(sf.intervalId);
	    		sf.intervalId = setInterval(function(){
	    			sf.goStep(isPlus,null,function(){
	    				clearInterval(sf.intervalId);
	    			});
	    		},40);
	    	},500);			
		});
    },
    onBtnMouseUp : function(e,t){
    	var sf = this;
    	if(sf.readonly)return;
    	Ext.fly(t).removeClass('spinner-select');
    	if(sf.intervalId){
	    	clearInterval(sf.intervalId);
    		sf.setValue(sf.getRawValue());
	    	delete sf.intervalId;
    	}
    },
    /**
     * 递增
     */
    plus : function(){
    	this.goStep(true,function(n){
    		this.setValue(n);
    	});
    },
    /**
     * 递减
     */
    minus : function(){
    	this.goStep(false,function(n){
    		this.setValue(n);
    	});
    },
    goStep : function(isPlus,callback,callback2){
    	if(this.readonly)return;
    	var sf = this,
    		step = sf.step,
    		min = sf.min,
    		max = sf.max,
    		raw = sf.getRawValue(),
    		n = raw?Number(raw)
				+ (isPlus ? step : -step):(0<min?min:(0>max?max:0)),
    		mod = sf.toFixed(sf.toFixed(n - min)%step);
    	n = sf.toFixed(n - (mod == step ? 0 : mod));
    	if(n <= max && n >= min){
    		sf.setRawValue(sf.formatValue(n));
    		if(callback)callback.call(sf,n);
    	}else{
    		if(callback2)callback2.call(sf,n)
    	}
    },
    toFixed : function(n){
    	return Number(n.toFixed(this.decimalprecision));
    }
});