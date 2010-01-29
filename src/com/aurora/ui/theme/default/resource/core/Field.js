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
    initComponent : function(config){
    	$A.Field.superclass.initComponent.call(this, config);
        this.el = this.wrap.child('input[atype=field.input]'); 
    	this.originalValue = this.getValue();
    	this.applyEmptyText();
    	this.initStatus();
    	if(this.hidden == true){
    		this.setVisible(false)
    	}
    },
    processListener: function(ou){
//    	this.el[ou](Ext.isIE || Ext.isSafari3 ? "keydown" : "keypress", this.fireKey,  this);
    	this.el[ou]("focus", this.onFocus,  this);
    	this.el[ou]("blur", this.onBlur,  this);
    	this.el[ou]("change", this.onChange, this);
    	this.el[ou]("keyup", this.onKeyUp, this);
        this.el[ou]("keydown", this.onKeyDown, this);
        this.el[ou]("keypress", this.onKeyPress, this);
//        this.el.on("mouseover", this.onMouseOver, this);
//        this.el.on("mouseout", this.onMouseOut, this);
    },
    initEvents : function(){
    	$A.Field.superclass.initEvents.call(this);
        this.addEvents('keydown','keyup','keypress');
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
		this.el.setStyle("height",(h-1)+"px");
	},
	setVisible: function(v){
		if(v==true)
			this.wrap.show();
		else
			this.wrap.hide();
	},
    initStatus : function(){
    	this.clearInvalid();
    	this.setRequired(this.required);
    	this.setReadOnly(this.readonly);
    },
//    onMouseOver : function(e){
//    	$A.ToolTip.show(this.id, "测试");
//    },
//    onMouseOut : function(e){
//    	$A.ToolTip.hide();
//    },
    onChange : function(e){
//    	this.setValue(this.getValue());    
    },
    onKeyUp : function(e){
        this.fireEvent('keyup', this, e);
    },
    onKeyDown : function(e){
        this.fireEvent('keydown', this, e);
        if(e.keyCode == 13 || e.keyCode == 27) {
        	this.blur();
        }
    },
    onKeyPress : function(e){
        this.fireEvent('keypress', this, e);
    },
//    fireKey : function(e){
//      this.fireEvent("keydown", this, e);
//    },
    onFocus : function(e){
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
            this.select();
            this.fireEvent("focus", this);
        }
    },
    processValue : function(v){
    	return v;
    },
    onBlur : function(e){
    	if(this.readonly) return;
    	if(this.hasFocus){
	        this.hasFocus = false;
	        var rv = this.getRawValue();
	        rv = this.processValue(rv);
	        if(String(rv) !== String(this.startValue)){
	            this.fireEvent('change', this, rv, this.startValue);
	        } 
	        this.setValue(rv);
	        this.wrap.removeClass(this.focusCss);
	        this.fireEvent("blur", this);
    	}
    },
    setValue : function(v, silent){
    	$A.Field.superclass.setValue.call(this,v, silent);
    	if(this.emptytext && this.el && v !== undefined && v !== null && v !== ''){
            this.wrap.removeClass(this.emptyTextCss);
        }
        this.setRawValue(this.formatValue((v === null || v === undefined ? '' : v)));
        this.applyEmptyText();
    },
    formatValue : function(v){
    	return v;
    },
    getRawValue : function(){
        var v = this.el.getValue();
        if(v === this.emptytext || v === undefined){
            v = '';
        }
        return v;
    },
    getValue : function(){
    	var v= this.value;
		v=(v === null || v === undefined ? '' : v);
		return v;
    },
    setRequired : function(required){
    	if(this.crrentRequired == required)return;
		this.clearInvalid();    	
    	this.crrentRequired = required;
    	if(required){
    		this.wrap.addClass(this.requiredCss);
    	}else{
    		this.wrap.removeClass(this.requiredCss);
    	}
    },
    setReadOnly : function(readonly){
    	if(this.currentReadOnly == readonly)return;
    	this.currentReadOnly = readonly;
    	this.el.dom.readOnly = readonly;
    	if(readonly){
    		this.wrap.addClass(this.readOnlyCss);
    	}else{
    		this.wrap.removeClass(this.readOnlyCss);
    	}
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
//    	this.fireEvent('invalid', this, msg);
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
    },
    setRawValue : function(v){
//    	if(this.binder.name=='mgr_name') alert(v)
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
    },
    blur : function(){
    	if(this.readonly) return;
    	this.el.blur();
    },
    clearValue : function(){
    	this.setValue('', true);
    	this.clearInvalid();
        this.applyEmptyText();
    }
})