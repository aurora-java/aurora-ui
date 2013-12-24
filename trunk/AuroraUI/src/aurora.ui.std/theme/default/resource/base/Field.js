/**
 * @class Aurora.Field
 * @extends Aurora.Component
 * <p>带有input标记的输入类的组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Field = Ext.extend($A.Component,{	
	autoselect : true,
	transformcharacter : true,
	validators: [],
	requiredCss:'item-notBlank',
	readOnlyCss:'item-readOnly',
	emptyTextCss:'item-emptyText',
	invalidCss:'item-invalid',
	constructor: function(config) {
		config.required = config.required || false;
		config.readonly = config.readonly || false;
		config.autocomplete = config.autocomplete || false;
		config.autocompletefield = config.autocompletefield || null;
		config.autocompletesize = config.autocompletesize||2;
        config.autocompletepagesize = config.autocompletepagesize || 10;
        this.context = config.context||'';
		$A.Field.superclass.constructor.call(this, config);
    },
    initElements : function(){
    	this.el = this.wrap.child('input[atype=field.input]'); 
    },
    initComponent : function(config){
    	var sf = this;
    	$A.Field.superclass.initComponent.call(sf, config);
    	sf.service = sf.autocompleteservice || sf.lovservice || sf.lovmodel;
    	sf.para = {}
    	sf.initElements();
    	sf.originalValue = sf.getValue();
    	sf.applyEmptyText();
    	sf.initStatus();
//    	sf.hidden && sf.setVisible(false);
    	sf.initService()
    	sf.initAutoComplete();
    },
    processListener: function(ou){
    	var sf = this;
    	$A.Field.superclass.processListener.call(sf, ou);
//    	sf.el[ou](Ext.isIE || Ext.isSafari3 ? "keydown" : "keypress", sf.fireKey,  sf);
    	sf.el[ou]("focus", sf.onFocus,  sf)
    		[ou]("blur", sf.onBlur,  sf)
    		[ou]("change", sf.onChange, sf)
    		[ou]("keyup", sf.onKeyUp, sf)
        	[ou]("keydown", sf.onKeyDown, sf)
        	[ou]("keypress", sf.onKeyPress, sf);
//        	[ou]("mouseup", sf.onMouseUp, sf)
//        	[ou]("mouseover", sf.onMouseOver, sf)
//        	[ou]("mouseout", sf.onMouseOut, sf);
    },
    processMouseOverOut : function(ou){
    	var sf = this;
        sf.el[ou]("mouseover", sf.onMouseOver, sf)
        	[ou]("mouseout", sf.onMouseOut, sf);
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
    	var sf = this,view = sf.autocompleteview;
    	$A.Field.superclass.destroy.call(sf);
    	if(view){
    		view.destroy();
    		view.un('select',sf.onViewSelect,sf);
    		delete sf.autocompleteview;
        }
    	delete this.el;
    },
	setWidth: function(w){
		this.wrap.setStyle("width",(w+3)+"px");
		//this.el.setStyle("width",w+"px");
	},
	setHeight: function(h){
		this.wrap.setStyle("height",h+"px");
		this.el.setStyle("height",(h-2)+"px");
	},
//	setVisible: function(v){
//		this.wrap[v?'show':'hide']();
////		if(v==true)
////			this.wrap.show();
////		else
////			this.wrap.hide();
//	},
    initStatus : function(){
    	var sf = this;
    	sf.clearInvalid();
    	sf.initRequired(sf.required);
    	sf.initReadOnly(sf.readonly);
    	sf.initEditable(sf.editable);
    	sf.initMaxLength(sf.maxlength);
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
        var sf = this,keyCode = e.keyCode;
        sf.fireEvent('keydown', sf, e);  
        if((sf.isEditor==true && keyCode == 9) ||((sf.readonly||!sf.editable)&&keyCode == 8)) e.stopEvent();//9:tab  8:backspace
        if(keyCode == 13 || keyCode == 27) {//13:enter  27:esc
        	sf.blur();//为了获取到新的值
        	if(keyCode == 13) {
        		(function(){
        			sf.fireEvent('enterdown', sf, e);
        		}).defer(5);
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
    	var sf = this;
    	sf.autoselect && sf.select.defer(1,sf);
        if(!sf.hasFocus){
            sf.hasFocus = true;
            sf.startValue = sf.getValue();
            if(sf.emptytext && !sf.readonly){
	            sf.el.dom.value == sf.emptytext && sf.setRawValue('');
	            sf.wrap.removeClass(sf.emptyTextCss);
	        }
	        sf.wrap.addClass(sf.focusCss);
            sf.fireEvent("focus", sf);
        }
    },
//    onMouseUp : function(e){
//    	this.isSelect && e.stopEvent();
//    	this.isSelect = false;
//    },
    processValue : function(v){
    	return v;
    },
    onBlur : function(e){
    	var sf = this;
    	if(sf.hasFocus){
	        sf.hasFocus = false;
//	        var rv = sf.getRawValue();
//           	rv = sf.processMaxLength(rv);
//	        rv = sf.processValue(rv);
//	        if(String(rv) !== String(sf.startValue)){
//	            sf.fireEvent('change', sf, rv, sf.startValue);
//	        } 
            
	        !sf.readonly && sf.setValue(sf.processValue(sf.processMaxLength(sf.getRawValue())));
	        sf.wrap.removeClass(sf.focusCss);
	        sf.fireEvent("blur", sf);
    	}
    },
    processMaxLength : function(rv){
    	var sb = [],cLength = $A.defaultChineseLength;
        if(this.isOverMaxLength(rv)){
            for (var i = 0,k=0; i < rv.length;i++) {
                var cr = rv.charAt(i),
                	cl = cr.match(/[^\x00-\xff]/g);
                k+=cl !=null && cl.length>0?cLength:1;
                if(k<=this.maxlength) {
                	sb.push(cr);
                }else{
                    break;
                }
            }
            return sb.join('');
        }
        return rv;
    },
    setValue : function(v, silent){
    	var sf = this;
    	if(sf.emptytext && sf.el && !Ext.isEmpty(v)){
            sf.wrap.removeClass(sf.emptyTextCss);
        }
        sf.setRawValue(sf.formatValue(Ext.isEmpty(v)? '' : v));
        sf.applyEmptyText();
    	$A.Field.superclass.setValue.call(sf,v, silent);
    },
    formatValue : function(v){
        var sf = this,rder = sf.renderer?$A.getRenderer(sf.renderer):null,
        	binder = sf.binder;
        return rder!=null ? rder(v,sf.record,binder && binder.name) : v;
    },
    getRawValue : function(){
        var sf = this,v = sf.el.getValue(),typecase = sf.typecase;
        v = v === sf.emptytext || v === undefined?'':v;
        if(sf.isDbc(v)){
            v = sf.dbc2sbc(v);
        }
        if(typecase){
	    	if(typecase == 'upper'){
		    	v = v.toUpperCase();
	        }else if(typecase == 'lower') {
	        	v = v.toLowerCase();
	        }
    	}
        return v;
    },
//    getValue : function(){
//    	var v= this.value;
//		v=(v === null || v === undefined ? '' : v);
//		return v;
//    },
    initRequired : function(required){
    	var sf = this;
    	if(sf.currentRequired == required)return;
		sf.clearInvalid();    	
    	sf.currentRequired = sf.required = required;
    	sf.wrap[required?'addClass':'removeClass'](sf.requiredCss);
    },
    initEditable : function(editable){
    	var sf = this;
    	if(sf.currentEditable == editable)return;
    	sf.currentEditable = sf.editable = editable;
    	sf.el.dom.readOnly = sf.readonly? true :(editable === false);
    },
    initReadOnly : function(readonly){
    	var sf = this;
    	if(sf.currentReadonly == readonly)return;
    	sf.currentReadonly = sf.readonly = readonly;
    	sf.el.dom.readOnly = readonly;
    	sf.wrap[readonly?'addClass':'removeClass'](sf.readOnlyCss);
    },
    isOverMaxLength : function(str){
        if(!this.maxlength) return false;
        var c = 0,i = 0,cLength = $A.defaultChineseLength;
        for (; i < str.length; i++) {
            var cl = str.charAt(i).match(/[^\x00-\xff]/g);
//            var st = escape(str.charAt(i));
            c+=cl !=null && cl.length>0?cLength:1;
        }
        return c > this.maxlength;
    },
    initMaxLength : function(maxlength){
    	if(maxlength)
    	this.el.dom.maxLength=maxlength;
    },
    initService : function(){
    	var sf = this,svc = sf.service;
    	if(svc){
    		sf.service = sf.processParmater(svc);
    	}
    },
    initAutoComplete : function(){
    	var sf = this,
    		svc = sf.service,
        	view = sf.autocompleteview,
    		field = sf.autocompletefield,
    		name = sf.binder && sf.binder.name;
    	if(sf.autocomplete && svc){
        	if(!view){
	        	view = sf.autocompleteview = new $A.AutoCompleteView({
	        		id:sf.id,
					el:sf.el,
					fuzzyfetch:sf.fuzzyfetch,
	        		cmp:sf
	        	});
        		view.on('select',sf.onViewSelect,sf);
        	}else if(!view.active){
        		view.processListener('on');
        	}
			view.active = true;	
        	if(!field){
        		Ext.each(sf.getMapping(),function(map){
        			if(map.to == name) field = sf.autocompletefield = map.from;
        		});
        		if(!field)field = name;
        	}
        	view.bind({
        		url:sf.context + 'autocrud/'+svc+'/query',
        		name:field,
        		size:sf.autocompletesize,
        		pagesize:sf.autocompletepagesize,
        		renderer:sf.autocompleterenderer,
				binder:sf.binder,
				fetchremote:sf.fetchremote === false?false:true
        	});
        }else if(view){
    		view.processListener('un');
    		view.active = false;
        }
    },
    onViewSelect : function(r){
    	var sf = this,record = sf.record;
    	Ext.each(r && sf.getMapping(),function(map){
    		var from = r.get(map.from);
            record.set(map.to,Ext.isEmpty(from)?'':from);
    	});
    },
    getMapping: function(){
        var mapping,r = this.record,name = this.binder.name;
        if(r){
            var field = r.getMeta().getField(name);
            if(field){
                mapping = field.get('mapping');
            }
        }
        return mapping ? mapping : [{from:name,to:name}];
    },
    applyEmptyText : function(){
    	var sf = this,emptytext = sf.emptytext;
        if(emptytext && sf.getRawValue().length < 1){
            sf.setRawValue(emptytext);
            sf.wrap.addClass(sf.emptyTextCss);
        }
    },
    processParmater:function(url){
        var li = url.indexOf('?')
        if(li!=-1){
            this.para = Ext.urlDecode(url.substring(li+1,url.length));
            return url.substring(0,li);
        } 
        return url;
    },
    getPara : function(){
    	return Ext.apply({},this.getFieldPara(),this.para);
    },
    getFieldPara : function(obj){
		return (obj = this.record) 
			&& (obj = obj.getMeta().getField(this.binder.name))
			&& Ext.apply({},obj.get('lovpara'));
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
    	if(!this.hasFocus)return;
    	var v = this.getRawValue();
        if(v.length > 0){
            start = start === undefined ? 0 : start;
            end = end === undefined ? v.length : end;
            var d = this.el.dom;
            if(start === 0 && end === v.length && d.select){
            	d.select();
            }else{
	            if(d.setSelectionRange){  
	                d.setSelectionRange(start, end);
	            }else if(d.createTextRange){
	                var range = d.createTextRange();
	                range.moveStart("character", start);
	                range.moveEnd("character", end-v.length);
	                range.select();
	            }
            }
        }
//        this.isSelect = true;
    },
    setRawValue : function(v){
    	var dom = this.el.dom;
        if(dom.value === (v = Ext.isEmpty(v)?'':v)) return;
        return dom.value = v;
    },
    reset : function(){
    	var sf = this;
    	sf.setValue(sf.originalValue);
        sf.clearInvalid();
        sf.applyEmptyText();
    },
    /**
     * 组件获得焦点
     */
    focus : function(){
    	this.el.dom.focus();
    	this.fireEvent('focus', this);
    },
    /**
     * 组件失去焦点
     */
    blur : function(){
    	this.el.blur();
    	this.fireEvent('blur', this);
    },
    clearValue : function(){
    	this.setValue('', true);
    	this.clearInvalid();
        this.applyEmptyText();
    },
    /**
     * 设置prompt
     * @param {String} text prompt.
     */
    setPrompt : function(text){
		var prompt = Ext.fly(this.id+'_prompt');
		if(prompt){
			prompt.update(text);
		}
    },
    show : function(){
    	$A.Field.superclass.show.call(this);
    	var prompt = Ext.fly(this.id+'_prompt');
		if(prompt){
			prompt.show();
		}
    },
    hide : function(){
    	$A.Field.superclass.hide.call(this);
    	var prompt = Ext.fly(this.id+'_prompt');
		if(prompt){
			prompt.hide();
		}
    },
    isDbc : function(s){
        if(!this.transformcharacter) return false;
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
        var result = [];
        for(var i=0;i<str.length;i++){
            var code = str.charCodeAt(i);//获取当前字符的unicode编码
            if (code >= 65281 && code <= 65373) {//在这个unicode编码范围中的是所有的英文字母已及各种字符
                result.push(String.fromCharCode(code - 65248));//把全角字符的unicode编码转换为对应半角字符的unicode码                
            } else if (code == 12288){//空格
                result.push(' ');
            } else {
                result.push(str.charAt(i));
            }
        }
        return result.join('');
    }
});