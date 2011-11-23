/**
 * @class Aurora.Field
 * @extends Aurora.Component
 * <p>带有input标记的输入类的组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Field = Ext.extend($A.Component,{	
	validators: [],
	requiredCss:'item-notBlank',
	focusCss:'item-focus',
	readOnlyCss:'item-readOnly',
	emptyTextCss:'item-emptyText',
	invalidCss:'item-invalid',
	constructor: function(config) {
		config.required = config.required || false;
		config.readonly = config.readonly || false;
        $A.Field.superclass.constructor.call(this, config);
    },
    initElements : function(){
    	this.el = this.wrap.child('input[atype=field.input]'); 
    },
    initComponent : function(config){
    	$A.Field.superclass.initComponent.call(this, config);
    	this.initElements();
    	this.originalValue = this.getValue();
    	this.applyEmptyText();
    	this.initStatus();
    	if(this.hidden == true){
    		this.setVisible(false)
    	}
    },
    processListener: function(ou){
    	$A.Field.superclass.processListener.call(this, ou);
//    	this.el[ou](Ext.isIE || Ext.isSafari3 ? "keydown" : "keypress", this.fireKey,  this);
    	this.el[ou]("focus", this.onFocus,  this);
    	this.el[ou]("blur", this.onBlur,  this);
    	this.el[ou]("change", this.onChange, this);
    	this.el[ou]("keyup", this.onKeyUp, this);
        this.el[ou]("keydown", this.onKeyDown, this);
        this.el[ou]("keypress", this.onKeyPress, this);
        this.el[ou]("mouseup", this.onMouseUp, this);
//        this.el[ou]("mouseover", this.onMouseOver, this);
//        this.el[ou]("mouseout", this.onMouseOut, this);
    },
    processMouseOverOut : function(ou){
        this.el[ou]("mouseover", this.onMouseOver, this);
        this.el[ou]("mouseout", this.onMouseOut, this);
    },
    initEvents : function(){
    	$A.Field.superclass.initEvents.call(this);
        this.addEvents(
        /**
         * @event keydown
         * 键盘按下事件.
         * @param {Aurora.Field} field field对象.
         * @param {EventObject} e 键盘事件对象.
         */
        'keydown',
        /**
         * @event keyup
         * 键盘抬起事件.
         * @param {Aurora.Field} field field对象.
         * @param {EventObject} e 键盘事件对象.
         */
        'keyup',
        /**
         * @event keypress
         * 键盘敲击事件.
         * @param {Aurora.Field} field field对象.
         * @param {EventObject} e 键盘事件对象.
         */
        'keypress',
        /**
         * @event enterdown
         * 回车键事件.
         * @param {Aurora.Field} field field对象.
         * @param {EventObject} e 键盘事件对象.
         */
        'enterdown');
    },
    destroy : function(){
    	$A.Field.superclass.destroy.call(this);
    	delete this.el;
    },
	setWidth: function(w){
		this.wrap.setStyle("width",(w+3)+"px");
		this.el.setStyle("width",w+"px");
	},
	setHeight: function(h){
		this.wrap.setStyle("height",h+"px");
		this.el.setStyle("height",(h-2)+"px");
	},
	setVisible: function(v){
		if(v==true)
			this.wrap.show();
		else
			this.wrap.hide();
	},
    initStatus : function(){
    	this.clearInvalid();
    	this.initRequired(this.required);
    	this.initEditable(this.editable);
    	this.initReadOnly(this.readonly);
    	this.initMaxLength(this.maxlength);
    },
//    onMouseOver : function(e){
//    	$A.ToolTip.show(this.id, "测试");
//    },
//    onMouseOut : function(e){
//    	$A.ToolTip.hide();
//    },
    onChange : function(e){},
    onKeyUp : function(e){
        this.fireEvent('keyup', this, e);
    },
    onKeyDown : function(e){
        this.fireEvent('keydown', this, e);        
        var keyCode = e.keyCode;
        if(this.isEditor==true && keyCode == 9) e.stopEvent();
        if(keyCode == 13 || keyCode == 27) {//13:enter  27:esc
        	this.blur();//为了获取到新的值
        	if(keyCode == 13) {
        		var sf = this;
        		setTimeout(function(){
        			sf.fireEvent('enterdown', sf, e)
        		},5);
        	}
        }
    },
    onKeyPress : function(e){
        this.fireEvent('keypress', this, e);
    },
//    fireKey : function(e){
//      this.fireEvent("keydown", this, e);
//    },
    onFocus : function(e){
        //(Ext.isGecko||Ext.isGecko2||Ext.isGecko3) ? this.select() : this.select.defer(10,this);
    	this.select();
    	if(this.readonly) return;
        if(!this.hasFocus){
            this.hasFocus = true;
            this.startValue = this.getValue();
            if(this.emptytext){
	            if(this.el.dom.value == this.emptytext){
	                this.setRawValue('');
	            }
	            this.wrap.removeClass(this.emptyTextCss);
	        }
	        this.wrap.addClass(this.focusCss);
            this.fireEvent("focus", this);
        }
    },
    onMouseUp : function(e){
    	if(this.isSelect)
    		e.stopEvent();
    	this.isSelect = false;
    },
    processValue : function(v){
    	return v;
    },
    onBlur : function(e){
    	if(this.readonly) return;
    	if(this.hasFocus){
	        this.hasFocus = false;
	        var rv = this.getRawValue();
           	rv = this.processMaxLength(rv);
	        rv = this.processValue(rv);
//	        if(String(rv) !== String(this.startValue)){
//	            this.fireEvent('change', this, rv, this.startValue);
//	        } 
            
	        this.setValue(rv);
	        this.wrap.removeClass(this.focusCss);
	        this.fireEvent("blur", this);
    	}
    },
    processMaxLength : function(rv){
    	var sb = [];
        if(this.isOverMaxLength(rv)){
            for (i = 0,k=0; i < rv.length;i++) {
                var cr = rv.charAt(i);
                var cl = cr.match(/[^\x00-\xff]/g);
                if (cl !=null && cl.length>0) {
                    k=k+$A.defaultChineseLength;
                } else {
                    k=k+1
                }
                if(k<=this.maxlength) {
                    sb[sb.length] = cr
                }else{
                    break;
                }
            }
            return sb.join('');
        }
        return rv;
    },
    setValue : function(v, silent){
    	if(this.emptytext && this.el && v !== undefined && v !== null && v !== ''){
            this.wrap.removeClass(this.emptyTextCss);
        }
        this.setRawValue(this.formatValue((v === null || v === undefined ? '' : v)));
        this.applyEmptyText();
    	$A.Field.superclass.setValue.call(this,v, silent);
    },
    formatValue : function(v){
        var rder = null;
        if(this.renderer) rder = $A.getRenderer(this.renderer);
        return (rder!=null) ? rder.call(window,v) : v;
    },
    getRawValue : function(){
        var v = this.el.getValue();
        if(v === this.emptytext || v === undefined){
            v = '';
        }
        return v;
    },   
//    getValue : function(){
//    	var v= this.value;
//		v=(v === null || v === undefined ? '' : v);
//		return v;
//    },
    initRequired : function(required){
    	if(this.crrentRequired == required)return;
		this.clearInvalid();    	
    	this.crrentRequired = required;
    	if(required){
    		this.wrap.addClass(this.requiredCss);
    	}else{
    		this.wrap.removeClass(this.requiredCss);
    	}
    },
    initEditable : function(editable){
    	this.el.dom.readOnly = editable === false;
    },
    initReadOnly : function(readonly){
    	if(this.currentReadOnly == readonly)return;
    	this.currentReadOnly = readonly;
    	this.el.dom.readOnly = readonly;
    	if(readonly){
    		this.wrap.addClass(this.readOnlyCss);
    	}else{
    		this.wrap.removeClass(this.readOnlyCss);
    	}
    },
    isOverMaxLength : function(str){
        if(!this.maxlength) return false;
        var c = 0;
        for (i = 0; i < str.length; i++) {
            var cr = str.charAt(i);
            var cl = cr.match(/[^\x00-\xff]/g);
//            var st = escape(str.charAt(i));
            if (cl !=null &&cl.length >0) {
                c=c+$A.defaultChineseLength;
            } else {
                c=c+1;
            }
        }
        return c > this.maxlength;
    },
    initMaxLength : function(maxlength){
    	if(maxlength)
    	this.el.dom.maxLength=maxlength;
    },
    applyEmptyText : function(){
        if(this.emptytext && this.getRawValue().length < 1){
            this.setRawValue(this.emptytext);
            this.wrap.addClass(this.emptyTextCss);
        }
    },
//    validate : function(){
//        if(this.readonly || this.validateValue(this.getValue())){
//            this.clearInvalid();
//            return true;
//        }
//        return false;
//    },
    clearInvalid : function(){
    	this.invalidMsg = null;
    	this.wrap.removeClass(this.invalidCss);
//    	this.fireEvent('valid', this);
    },
    markInvalid : function(msg){
    	this.invalidMsg = msg;
    	this.wrap.addClass(this.invalidCss);
    },
//    validateValue : function(value){    
//    	if(value.length < 1 || value === this.emptyText){ // if it's blank
//        	if(!this.required){
//                this.clearInvalid();
//                return true;
//        	}else{
//                this.markInvalid('字段费控');//TODO:测试
//        		return false;
//        	}
//        }
//    	Ext.each(this.validators.each, function(validator){
//    		var vr = validator.validate(value)
//    		if(vr !== true){
//    			//TODO:
//    			return false;
//    		}    		
//    	})
//        return true;
//    },
    select : function(start, end){
    	var v = this.getRawValue();
        if(v.length > 0){
            start = start === undefined ? 0 : start;
            end = end === undefined ? v.length : end;
            var d = this.el.dom;
            if(d.setSelectionRange){  
                d.setSelectionRange(start, end);
            }else if(d.createTextRange){
                var range = d.createTextRange();
                range.moveStart("character", start);
                range.moveEnd("character", end-v.length);
                range.select();
            }
        }
        this.isSelect = true;
    },
    setRawValue : function(v){
        if(this.el.dom.value === (v === null || v === undefined ? '' : v)) return;
        return this.el.dom.value = (v === null || v === undefined ? '' : v);
    },
    reset : function(){
    	this.setValue(this.originalValue);
        this.clearInvalid();
        this.applyEmptyText();
    },
    focus : function(){
    	if(this.readonly) return;
    	this.el.dom.focus();
    	this.fireEvent('focus', this);
    },
    blur : function(){
    	if(this.readonly) return;
    	this.el.blur();
    	this.fireEvent('blur', this);
    },
    clearValue : function(){
    	this.setValue('', true);
    	this.clearInvalid();
        this.applyEmptyText();
    }
})