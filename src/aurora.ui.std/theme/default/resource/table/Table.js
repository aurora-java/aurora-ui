(function(){
var _ = '-',
	__ = '__',
	___ = '_',
	_O = '.',
	_S = ' ',
	_N = '',
	NONE = 'none',
	OUTLINE = 'outline',
	LEFT = 'left',
	TD = 'td',
	RECORD_ID = 'recordid',
	ROW_SELECT = 'row-selected',
	REQUIRED = 'required',
	ITEM_NOT_BLANK='item-notBlank',
    ITEM_INVALID = 'item-invalid',
    ROW_ALT = 'table-row-alt',
    TABLE_ROWBOX = 'table-rowbox',
    $TABLE_ROWBOX = _O + TABLE_ROWBOX,
    TABLE$ROWCHECK = 'table.rowcheck',
    TABLE$ROWRADIO = 'table.rowradio',
    TABLE_CKB = 'table-ckb ',
    TABLE_SELECT_ALL = 'table-select-all',
    MULTIPLE = 'multiple',
    CHECKED_VALUE = 'checkedvalue',
	R = '-readonly'
	C = '-c',
	U = '-u',
    IC = 'item-ckb',
    ICS = IC + '-self',
    $ICS = _O + ICS,
    ICU = IC + U,
    ICC = IC + C,
    ICRU = IC + R + U,
    ICRC	= IC + R + C,
    IR = 'item-radio-img',
    IRC = IR + C,
    IRU = IR + U,
    IRRC = IR + R + C,
    IRRU = IR + R + U,
    X = $ICS+ _S + _O +ICC,
    TC = 'table-cell',
    TCE=TC+'-editor',
    CC = 'cellcheck',
    RC = 'rowcheck',
    EC = 'click',
    ECC = 'cellclick',
    ER = 'render',
    ERC = 'rowclick',
    EES = 'editorshow',
    ENES = 'nexteditorshow',
    EKD = 'keydown',
    ES = 'select'
    EMD = 'mousedown',
    ERS = 'resize',
    NF = '未找到',
    M = '方法!';
	
/**
 * @class Aurora.Table
 * @extends Aurora.Component
 * <p>Table 数据表格布局.
 * @author huazhen.wu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Table = Ext.extend($A.Component,{
    initComponent:function(config){
		$A.Table.superclass.initComponent.call(this,config);
		var wrap=this.wrap;
		this.cb = wrap.child('div[atype=table.headcheck]');
		this.tbody=wrap.child('tbody');
		this.fb=wrap.child('tfoot');
		this.initTemplate();
	},
	processListener:function(ou){
		$A.Table.superclass.processListener.call(this,ou);
		this.tbody[ou](EC,this.onClick, this);
		if(this.canwheel){
			this.tbody[ou]('mousewheel',this.onMouseWheel,this);
		}
		if(this.cb)this.cb[ou](EC,this.onHeadClick,this);
		this[ou](ECC,this.onCellClick,this);
	},
	processDataSetLiestener: function(ou){
        var ds = this.dataset;
        if(ds){
	       	ds[ou]('ajaxfailed', this.onAjaxFailed, this);
            ds[ou]('metachange', this.onLoad, this);
            ds[ou]('update', this.onUpdate, this);
            ds[ou]('reject', this.onUpdate, this);
            ds[ou]('add', this.onAdd, this);
            ds[ou]('submit', this.onBeforSubmit, this);
            ds[ou]('submitfailed', this.onAfterSuccess, this);
            ds[ou]('submitsuccess', this.onAfterSuccess, this);
            ds[ou]('query', this.onBeforeLoad, this);
			ds[ou]('load', this.onLoad, this);
			ds[ou]('loadfailed', this.onAjaxFailed, this);
            ds[ou]('valid', this.onValid, this);
            ds[ou]('beforeremove', this.onBeforeRemove, this); 
            ds[ou]('remove', this.onRemove, this);
            ds[ou]('clear', this.onLoad, this);
            ds[ou]('refresh',this.onLoad,this);
            ds[ou]('fieldchange', this.onFieldChange, this);
            ds[ou]('indexchange', this.onIndexChange, this);
            ds[ou](ES, this.onSelect, this);
            ds[ou]('unselect', this.onUnSelect, this);
            ds[ou]('selectall', this.onSelectAll, this);
            ds[ou]('unselectall', this.onUnSelectAll, this);
        }
    },
    initEvents:function(){
        $A.Table.superclass.initEvents.call(this);
        this.addEvents(
        /**
         * @event render
         * table渲染出数据后触发该事件
         * @param {Aurora.Table} table 当前Table组件.
         */
        ER,
        /**
         * @event cellclick
         * 单元格点击事件.
         * @param {Aurora.Table} table 当前Table组件.
         * @param {Number} row 行号.
         * @param {String} 当前name.
         * @param {Aurora.Record} record 鼠标点击所在单元格的Record对象.
         */
        ECC,
        /**
         * @event rowclick
         * 行点击事件.
         * @param {Aurora.Table} table 当前Table组件.
         * @param {Number} row 行号.
         * @param {Aurora.Record} record 鼠标点击所在行的Record对象.
         */
        ERC,
        /**
         * @event editorShow
         * 编辑器显示后触发的事件.
         * @param {Aurora.Table} table 当前Table组件.
         * @param {Editor} grid 当前Editor组件.
         * @param {Number} row 行号.
         * @param {String} 当前name.
         * @param {Aurora.Record} record 鼠标点击所在行的Record对象.
         */
        EES,
        /**
         * @event nexteditorshow
         * 切换下一个编辑器的事件.
         * @param {Aurora.Table} table 当前table组件.
         * @param {Number} row 行号.
         * @param {String} 当前name.
         */
        ENES);
    },
	bind:function(ds){
		if(Ext.isString(ds)){
            ds = $(ds);
            if(!ds) return;
        }
        this.dataset = ds;
        this.processDataSetLiestener('on');
        this.onLoad();
	},
	initTemplate : function(){
        this.cellTpl = new Ext.Template(['<div class="table-cell {cellcls}" id="',this.id,'_{name}_{recordid}">{text}</div>']);        
    	this.cbTpl = new Ext.Template(['<center><div class="{cellcls}" id="',this.id,'_{name}_{recordid}"></div></center>']);
    },
	createRow:function(record,index,isInsert){
		if(isInsert){
			var trs = this.wrap.query('tbody tr');
	        	for(var i=index,l = trs.length;i<l;i++){
					Ext.fly(trs[i]).toggleClass(ROW_ALT)
						.select($TABLE_ROWBOX).each(function(td){
							this.setSelectStatus(this.dataset.findById(td.getAttributeNS(_N,RECORD_ID)));
						},this);
	        	}
		}
		var tr=this.tbody.dom.insertRow(index),
			css=this.parseCss(this.renderRow(record,index));
		tr.id=this.id+_+record.id;
		tr.style.cssText=css.style;
		tr.className=(index%2==1?ROW_ALT+_S:_N)+css.cls;
		Ext.each(this.columns,function(c){
			this.createCell(tr,c,record);
		},this);
	},
	createEmptyRow:function(){
		this.emptyRow=this.tbody.dom.insertRow(-1);
		Ext.each(this.columns,function(col){
			Ext.fly(this.emptyRow.insertCell(-1))
				.set({atype:TC,dataindex:col.name})
				.setStyle({'text-align':col.align||LEFT,display:col.hidden?NONE:_N})
				.update('&#160;');
		},this);
	},
	removeEmptyRow:function(){
		if(this.emptyRow){
			this.tbody.dom.removeChild(this.emptyRow);
			this.emptyRow=null;
		}
	},
	getCheckBoxStatus: function(record, name ,readonly) {
        var field = this.dataset.getField(name),
        	cv = field.getPropertity(CHECKED_VALUE),
        	value = record.data[name];
        return IC+(readonly?R:_N)+((value && value == cv) ? C : U);
    },
	createCell:function(tr,col,record){
		var editor = this.getEditor(col,record),
			xtype = col.type,
			xname = col.name,
			readonly,cls=_N,td;
		if(tr.tagName.toLowerCase()=='tr')td=tr.insertCell(-1);
		else td=Ext.fly(tr).parent(TD).dom
		if(editor!=_N){
        	var edi = $A.CmpManager.get(editor);
            if(edi && (edi instanceof $A.CheckBox)){
                xtype = CC;
            }else{
                cls = TCE;
            }
        }else if(xname && Ext.isDefined(record.getField(xname).get(CHECKED_VALUE))){
    		xtype = CC;
    		readonly=true;
        }
		if(xtype == RC||xtype == 'rowradio'){
			readonly = this.dataset.execSelectFunction(record)?_N:R;
	    	Ext.fly(td).set({atype:xtype == RC?TABLE$ROWCHECK:TABLE$ROWRADIO,recordid:record.id})
	    		.addClass(TABLE_ROWBOX);
	        td.innerHTML=this.cbTpl.applyTemplate({cellcls:xtype == RC?TABLE_CKB+IC+readonly+U:'table-radio '+IR+readonly+U,name:xname,recordid:record.id});
	    }else{
			Ext.fly(td).set({atype:TC,recordid:record.id,dataindex:xname})
				.setStyle({'text-align':col.align||LEFT,dLEFT:col.hidden?NONE:_N});
			if(xtype == CC){
				td.innerHTML=this.cbTpl.applyTemplate({cellcls:TABLE_CKB + this.getCheckBoxStatus(record, xname ,readonly),name:xname,recordid:record.id});
			}else{
				var field = record.getMeta().getField(xname);
		        if(field && Ext.isEmpty(record.data[xname]) && record.isNew == true && field.get(REQUIRED) == true){
		            cls = cls + _S + ITEM_NOT_BLANK
		        }
				td.innerHTML=this.cellTpl.applyTemplate({text:this.renderText(record,col,record.data[xname]),cellcls:cls,name:xname,recordid:record.id});
			}
		}
	},
    onSelect : function(ds,record,isSelectAll){
        if(!record||isSelectAll)return;
        var cb = Ext.get(this.id+__+record.id);
        cb.parent($TABLE_ROWBOX).addClass(ICS);
        if(cb){
	        if(this.selectionmodel==MULTIPLE) {
	            this.setCheckBoxStatus(cb, true);
	        }else{
	            this.setRadioStatus(cb,true);
	            var ds = this.dataset;
	            ds.locate((ds.currentPage-1)*ds.pagesize + ds.indexOf(record) + 1)
	        }
            this.setSelectStatus(record);
        }
    },
    onUnSelect : function(ds,record,isSelectAll){
        if(!record||isSelectAll)return;
        var cb = Ext.get(this.id+__+record.id);
        cb.parent($TABLE_ROWBOX).addClass(ICS);
        if(cb){
	        if(this.selectionmodel==MULTIPLE) {
	            this.setCheckBoxStatus(cb, false);
	        }else{
	            this.setRadioStatus(cb,false);
	        }
            this.setSelectStatus(record);
        }
    },
    onSelectAll : function(){
    	this.clearChecked();
    	this.isSelectAll = true;
    	this.isUnSelectAll = false;
    	this.wrap.addClass(TABLE_SELECT_ALL);
    },
    onUnSelectAll : function(){
    	this.clearChecked();
    	this.isSelectAll = false;
    	this.isUnSelectAll = true;
    	this.wrap.removeClass(TABLE_SELECT_ALL);
    },
    clearChecked : function(){
    	var w = this.wrap;
		w.select(X).replaceClass(ICC,ICU);
		w.select($ICS).removeClass(ICS);
    },
    setRadioStatus: function(el, checked){
        if(!checked){
            el.removeClass(IRC).addClass(IRU);
        }else{
            el.addClass(IRC).removeClass(IRU);
        }
    },
    setCheckBoxStatus: function(el, checked){
        if(!checked){
            el.removeClass(ICC).addClass(ICU);
        }else{
            el.addClass(ICC).removeClass(ICU);
        }
    },
    setSelectDisable:function(el,record){
    	var flag = this.dataset.selected.indexOf(record) == -1;
    	if(this.selectionmodel==MULTIPLE){
    		el.removeClass([ICC,ICU])
    			.addClass(flag?ICRU:ICRC);
    	}else{
    		el.removeClass([IRC,IRU,IRRC,IRRU])
            	.addClass(flag?IRRU:IRRC);
    	}
    },
    setSelectEnable:function(el,record){
    	var flag = this.dataset.selected.indexOf(record) == -1;
    	if(this.selectionmodel==MULTIPLE){
    		el.removeClass([ICRU,ICRC])
    			.addClass(flag?ICU:ICC);
    	}else{
            el.removeClass([IRU,IRC,IRRU,IRRC])
    			.addClass(flag?IRU:IRC);
    	}	
    },
    setSelectStatus:function(record){
    	if(this.dataset.selectfunction){
	    	var cb = Ext.get(this.id+__+record.id);
	    	if(!this.dataset.execSelectFunction(record)){
	    		 this.setSelectDisable(cb,record)
	    	}else{
	    		 this.setSelectEnable(cb,record);
	    	}
    	}
    },
    onHeadClick : function(e){
        var cb = this.cb,
        	ds = this.dataset,
        	checked = cb.hasClass(ICC);
        this.setCheckBoxStatus(cb,!checked);
        if(!checked){
            ds.selectAll();
        }else{
            ds.unSelectAll();
        }
    },
	/**
     * 设置当前行的编辑器.
     * 
     * @param {String} name 列的name.
     * @param {String} editor 编辑器的id. ''空表示没有编辑器.
     */
    setEditor: function(name,editor){
        var col = this.findColByName(name),
        	div = Ext.get([this.id,name,this.selectedId].join(___));
        col.editor = editor;
        if(div){
        	this.focusdiv = div;
        	if(editor == _N){
            	div.removeClass(TCE)
            }else if(!$(editor) instanceof $A.CheckBox){
            	div.addClass(TCE)
            }
        }
    },
	getEditor : function(col,record){
        var ed = col.editor||_N;
        if(col.editorfunction) {
            var ef = window[col.editorfunction];
            if(ef==null) {
                alert(NF+col.editorfunction+M) ;
                return null;
            }
            ed = ef.call(window,record,col.name)||_N;
        }
        return ed;
    },
     /**
     * 显示编辑器.
     * @param {Number} row 行号
     * @param {String} name 当前列的name.
     */
    showEditor : function(row, name,callback){     
        if(row == -1)return;
        var col = this.findColByName(name);
        if(!col)return;
        var record = this.dataset.getAt(row);
        if(!record)return;
        if(record.id != this.selectedId) this.selectRow(row);
        var editor = this.getEditor(col,record);
        this.setEditor(name, editor);
        var sf = this;
        if(sf.currentEditor){
        	sf.currentEditor.editor.el.un(EKD, sf.onEditorKeyDown,sf);
    		var d = sf.currentEditor.focusCheckBox;
    		if(d){
    			d.setStyle(OUTLINE,NONE);
    			sf.currentEditor.focusCheckBox = null;
    		}
    	}
        if(editor!=_N){
        	var ed = $(editor);
            setTimeout(function(){
                var v = record.get(name),
                	dom = Ext.get([sf.id,name,record.id].join(___)),
                	xy = dom.getXY();
                sf.currentEditor = {
                    record:record,
                    ov:v,
                    name:name,
                    editor:ed
                };
                ed.bind(sf.dataset, name);
                ed.render(record);
	        	if(ed instanceof $A.CheckBox){
	        		ed.move(-1000,xy[1]+5);
		        	ed.el.on(EKD, sf.onEditorKeyDown,sf);
		        	ed.onClick();
		        	sf.currentEditor.focusCheckBox = dom;
	        		dom.setStyle(OUTLINE,'1px dotted blue');
		        } else if(editor){
           			sf.positionEditor();
                    ed.isEditor = true;
                    ed.isFireEvent = true;
                    ed.isHidden = false;
                    ed.focus();
                    sf.editing = true;
                    ed.el.on(EKD, sf.onEditorKeyDown,sf);
                    ed.on(ES,sf.onEditorSelect,sf);
                    Ext.fly(document.documentElement).on(EMD, sf.onEditorBlur, sf);
                    Ext.fly(window).on(ERS, sf.positionEditor, sf);
                    if(callback)callback.call(window,ed)
	                sf.fireEvent(EES, sf, ed, row, name, record);
		        }
            },10)
        }           
    },
    onEditorSelect : function(){
		var sf =this;
		setTimeout(function(){sf.hideEditor()},1);
    },
    onEditorKeyDown : function(e,editor){
        var keyCode = e.keyCode;
        //esc
        if(keyCode == 27) {
            if(this.currentEditor){
                var ed = this.currentEditor.editor;
                if(ed){
	                ed.clearInvalid();
	                ed.render(ed.binder.ds.getCurrentRecord());
                }
            }
            this.hideEditor();
        }else
        //enter
        if(keyCode == 13) {
        	if(!(this.currentEditor && this.currentEditor.editor && this.currentEditor.editor instanceof $A.TextArea)){
	            this.showNextEditor();
        	}
        }else
        //tab
        if(keyCode == 9){
            e.stopEvent();
            this.showNextEditor();
        }
    },
    showNextEditor : function(){
        this.hideEditor();
        var sf = this;
        if(sf.currentEditor){
        	var ed = sf.currentEditor.editor;
        	if(ed){
	            var callback = function(e){
	                if(e instanceof $A.Lov){
	                    e.showLovWindow();
	                }
	            },
            	ds = sf.dataset,
                fname = ed.binder.name,r = ed.record,
                row = ds.data.indexOf(r),name=null;
	            if(row!=-1){
	                var cls = sf.columns,
	                	start = 0,
	                	editor;
	                for(var i = 0,l = cls.length; i<l; i++){
	                    if(cls[i].name == fname){
	                        start = i+1;
	                        break;
	                    }
	                }
	                for(var i = start,l = cls.length; i<l; i++){
	                    var col = cls[i];
	                    if(col.hidden !=true){
		                    editor = sf.getEditor(col,r);
		                    if(editor!=_N){
		                        name =  col.name;
		                        break;
		                    }
	                    }
	                }
	                if(sf.currentEditor){
	        			var d= sf.currentEditor.focusCheckBox;
	        			if(d){
	        				d.setStyle(OUTLINE,NONE);
	        				sf.currentEditor.focusCheckBox = null;
	        			}
	        		}
	                if(name){
	                	var ed = $(editor);
	                	if(ed instanceof $A.CheckBox){
	                		sf.currentEditor = {
			                    record:r,
			                    ov:r.get(name),
			                    name:name,
			                    editor:ed
			                };
	                		setTimeout(function(){
		                		ed.bind(ds,name);
		                		ed.render(r);
		                		var dom = Ext.get([sf.id,name,r.id].join(___)),
		                			xy = dom.getXY();
		                		ed.move(-1000,xy[1])
		                		ed.focus();
		                		ed.el.on(EKD, sf.onEditorKeyDown,sf);
		                		sf.currentEditor.focusCheckBox = dom;
		                		dom.setStyle(OUTLINE,'1px dotted blue');
	                		},10)
	                	}else{
		                    sf.fireEvent(ECC, sf, row, name, r ,callback);
		                    //this.showEditor(row,name,callback);
	                	}
	                }else{
	                    var nr = ds.getAt(row+1);
	                    if(!nr && sf.autoappend !== false){
			            	ds.create();
			            	nr = ds.getAt(row+1);
			            }
	                    if(nr){
	                    	sf.selectRow(row+1);
	                        for(var i = 0,l = cls.length; i<l; i++){
	                            var col = cls[i],
	                            	editor = sf.getEditor(col,nr);
	                            if(editor!=_N){
	                            	var ed = $(editor),name = col.name;
	                            	if(ed instanceof $A.CheckBox){
				                		sf.currentEditor = {
						                    record:nr,
						                    ov:nr.get(name),
						                    name:name,
						                    editor:ed
						                };
				                		setTimeout(function(){
					                		ed.bind(ds,name);
					                		ed.render(nr);
					                		var dom = Ext.get([sf.id,name,nr.id].join(___)),
					                			xy = dom.getXY();
					                		ed.move(-1000,xy[1])
					                		ed.focus();
					                		ed.el.on(EKD, sf.onEditorKeyDown,sf);
					                		sf.currentEditor.focusCheckBox = dom;
					                		dom.setStyle(OUTLINE,'1px dotted blue');
				                		},10)
				                	}else{
		                                sf.fireEvent(ECC, sf, row+1, name, nr ,callback);
		                                //this.showEditor(row+1,name,callback);
				                	}
	                                break;
	                            }
	                        }
	                    }
	                }
	            }
	            sf.fireEvent(ENES,sf, row, name);
        	}
        }
    },
    positionEditor:function(){
    	var ed=this.currentEditor.editor,dom=this.focusdiv,xy = dom.getXY();
        ed.setHeight(dom.getHeight()-2);
        ed.setWidth(dom.getWidth()-5<22?22:(dom.getWidth()-5));
        ed.move(xy[0],xy[1]);
        if(ed.isExpanded&&ed.isExpanded()){
        	if(Ext.isIE){
        		if(this.t)clearTimeout(this.t);
	        	this.t=setTimeout(function(){
	        		ed.syncPopup();
	        	},1)
        	}else{
        		ed.syncPopup();	
        	}
        }
    },
    /**
     * 隐藏当前编辑器
     */
    hideEditor : function(){
        if(this.currentEditor && this.editing){
            var ed = this.currentEditor.editor;
            if(ed){
	            if(!ed.canHide || ed.canHide()) {
	            	ed.el.un(EKD, this.onEditorKeyDown,this);
	            	ed.un(ES,this.onEditorSelect,this);
	                Ext.fly(document.documentElement).un(EMD, this.onEditorBlur, this);
	                Ext.fly(window).un(ERS, this.positionEditor, this);
	                ed.move(-10000,-10000);
	                ed.onBlur();
	                ed.isFireEvent = false;
	                ed.isHidden = true;
		            this.editing = false;
	            }
            }
        }
    },
        /**
     * 选中高亮某行.
     * @param {Number} row 行号
     */
    selectRow : function(row, locate){
        var ds = this.dataset,record = ds.getAt(row),
        	r = (ds.currentPage-1)*ds.pagesize + row+1;
        this.selectedId = record.id;
        if(this.selectTr)this.selectTr.removeClass(ROW_SELECT);
        this.selectTr = Ext.get(this.id+_+record.id);
        if(this.selectTr)this.selectTr.addClass(ROW_SELECT);
        //this.focusRow(row);
        this.selectRecord = record
        if(locate!==false && r != null) {
//          this.dataset.locate(r);
            ds.locate.defer(5, ds,[r,false]);
        }
    },
     drawFootBar : function(objs){
    	if(!this.fb) return;
    	Ext.each([].concat((objs) ? objs : this.columns), function(obj) {
    		var col = Ext.isString(obj) ? this.findColByName(obj) : obj;
            if(col&&col.footerrenderer){
                var fder = $A.getRenderer(col.footerrenderer);
                if(fder == null){
                    alert(NF+col.footerrenderer+M)
                    return;
                }
                var name = col.name,
                	v = fder.call(window,this.dataset.data, name);
                if(!Ext.isEmpty(v)){
	                this.fb.child('td[dataindex='+name+']').update(v)
                }
            }
    	},this);
    },
    showColumn : function(name){
        var col = this.findColByName(name);
        if(col){
            if(col.hidden === true){
                delete col.hidden;
                this.wrap.select('td[dataindex='+name+']').setStyle('display',_N);
            }
        }   
    },
    /**
     * 隐藏某列.
     * 
     * @param {String} name 列的name;
     */
    hideColumn : function(name){
        var col = this.findColByName(name);
        if(col){
            if(col.hidden !== true){
            	this.wrap.select('td[dataindex='+name+']').setStyle('display',NONE);
                col.hidden = true;
            }
        }       
    },
    /**
     * 根据列的name获取列配置.
     * 
     * @param {String} name 列的name
     * @return {Object} col 列配置对象.
     */
    findColByName : function(name){
    	if(name){
    		var cols = this.columns;
	        for(var i=0,l=cols.length;i<l;i++){
	            var c = cols[i];
	            if(c.name && c.name.toLowerCase() === name.toLowerCase()){
	                return c;
	            }
	        }
    	}
        return;
    }, 
    parseCss:function(css){
    	var style=_N,cls=_N;
    	if(Ext.isArray(css)){
    		for(var i=0;i<css.length;i++){
    			var _css=this.parseCss(css[i]);
    			style+=';'+_css.style;
    			cls+=_S+_css.cls;
    		}
    	}else if(Ext.isString(css)){
    		var isStyle=!!css.match(/^([^,:;]+:[^:;]+;)*[^,:;]+:[^:;]+;*$/);
    		cls=isStyle?_N:css;
			style=isStyle?css:_N;
    	}
    	return {style:style,cls:cls}
    	
    },
	renderText : function(record,col,value){
        var renderer = col.renderer;
        if(renderer){//&&!Ext.isEmpty(value)  去掉对value是否为空的判断
            var rder = $A.getRenderer(renderer);
            if(rder == null){
                alert(NF+renderer+M)
                return value;
            }
            value = rder.call(window,value,record, col.name);
            return value == null ? _N : value;
        }
        return value == null ? _N : value;
    },
    renderRow : function(record,rowIndex){
    	var renderer = this.rowrenderer,css=null;
        if(renderer){
            var rder = $A.getRenderer(renderer);
            if(rder == null){
                alert(NF+renderer+M)
                return css;
            }
            css = rder.call(window,record, rowIndex);
            return !css? _N : css;
        }
        return css ;
    },
    renderEditor : function(div,record,c,editor){
    	this.createCell(div.dom,c,record);
    	//div.parent().update(cell);
    },
    onClick : function(e,t) {
        var isTd = t.tagName.toLowerCase() == TD ,
        	target = isTd?Ext.fly(t):Ext.fly(t).parent(TD);
        if(target){
            var atype = target.getAttributeNS(_N,'atype'),
            	rid = target.getAttributeNS(_N,RECORD_ID),
            	ds = this.dataset;
            if(atype==TC){
                var record = ds.findById(rid),
                	row = ds.indexOf(record),
                	name = target.getAttributeNS(_N,'dataindex');
                this.fireEvent(ECC, this, row, name, record);
//                this.showEditor(row,name);
                this.fireEvent(ERC, this, row, record);
            }else if(atype==TABLE$ROWCHECK){               
                var cb = Ext.get(this.id+__+rid);
                if(cb.hasClass(ICRU)||cb.hasClass(ICRC))return;
                if(this.isSelectAll && !cb.parent($ICS)){
                	cb.replaceClass(ICU,ICC);	
                }else if(this.isUnselectAll && !cb.parent($ICS)){
            		cb.replaceClass(ICC,ICU);	
                }
                cb.hasClass(ICC) ? ds.unSelect(rid) : ds.select(rid);
            }else if(atype==TABLE$ROWRADIO){
            	var cb = Ext.get(this.id+__+rid);
                if(cb.hasClass(IRRU)||cb.hasClass(IRRC))return;
                ds.select(rid);
            }
        }
    },
    onCellClick : function(grid,row,name,record,callback){
    	this.showEditor(row,name,callback);
    },
    onUpdate : function(ds,record, name, value){
        this.setSelectStatus(record);
    	var div=Ext.get([this.id,name,record.id].join(___));
        if(div){
            var c = this.findColByName(name);
            var editor = this.getEditor(c,record);            
            if(editor!=_N && ($(editor) instanceof $A.CheckBox)){
            	this.renderEditor(div,record,c,editor);
            }else{
            	//考虑当其他field的值发生变化的时候,动态执行其他带有renderer的
                var text =  this.renderText(record,c, value);
                div.update(text);
            }
        }
        var cls = this.columns;
        for(var i=0,l=cls.length;i<l;i++){
            var c = cls[i];
            if(c.name != name) {
            	var ediv = Ext.get([this.id,c.name,record.id].join(___));
            	if(ediv) {
            		if(c.editorfunction){
                		var editor = this.getEditor(c,record);
                        this.renderEditor(ediv,record, c, editor);
            		}
                    if(c.renderer){
                        var text =  this.renderText(record,c, record.get(c.name));
                        ediv.update(text);
                    }
                }
                
            }
        }
        this.drawFootBar(name);
    },
    onLoad:function(){
    	var w = this.wrap,
    		data = this.dataset.data;
    	this.clearBody();
        var cb = w.removeClass(TABLE_SELECT_ALL).child('div[atype=table.headcheck]');
        if(cb && this.selectable && this.selectionmodel==MULTIPLE)this.setCheckBoxStatus(cb,false);
    	var l=data.length;
    	if(l==0)this.createEmptyRow();
		else for(var i=0;i<l;i++){
            this.createRow(data[i],i);
        }
        this.drawFootBar();
        $A.Masker.unmask(w);
        this.fireEvent(ER,this)
	},
	onValid : function(ds, record, name, valid){
        var c = this.findColByName(name);
        if(c){
            var div = Ext.get([this.id,name,record.id].join(___));
            if(div) {
                if(valid == false){
                    div.addClass(ITEM_INVALID);
                }else{
                    div.removeClass([ITEM_NOT_BLANK,ITEM_INVALID]);
                }
            }
        }
    },
    onAdd : function(ds,record,index){
    	this.removeEmptyRow();
        this.createRow(record,index,index !== this.dataset.data.length-1);
        this.selectRow(this.dataset.indexOf(record));
        this.setSelectStatus(record);
    },
    onRemove : function(ds,record,index){
        var row = Ext.get(this.id+_+record.id);
        if(row)row.remove();
        this.selectTr=null;
        $A.Masker.unmask(this.wrap);
        this.drawFootBar();
    },
	clearBody:function(){
		while(this.tbody.dom.childNodes.length){
			this.tbody.dom.removeChild(this.tbody.dom.firstChild);
		}
		this.emptyRow = null;
	},
	getDataIndex : function(rid){
        for(var i=0,data = this.dataset.data,l=data.length;i<l;i++){
            if(data[i].id == rid){
                return i;
            }
        }
        return -1;
    },
    onEditorBlur : function(e,t){
        if(this.currentEditor && !this.currentEditor.editor.isEventFromComponent(t)) {  
            this.hideEditor.defer(Ext.isIE9?10:0,this);
        }
    },
    onMouseWheel : function(e){
        e.stopEvent();
        if(this.editing == true) return;
    	var delta = e.getWheelDelta(),
    		ds = this.dataset;
        if(delta > 0){
            ds.pre();
        } else if(delta < 0){
            ds.next();
        }
    },
    onIndexChange:function(ds, r){
        var index = this.getDataIndex(r.id);
        if(index == -1)return;
//        if(r != this.selectRecord){
            this.selectRow(index, false);
//        }
    },
    onFieldChange : function(ds, record, field, type, value){
        if(type == REQUIRED){
           var div = Ext.get([this.id,field.name,record.id].join(___));
           if(div) {
               div[value==true?'addClass':'removeClass'](ITEM_NOT_BLANK);
           }
        }
    },
    onBeforeRemove : function(){
        $A.Masker.mask(this.wrap,_lang['grid.mask.remove']);
    },
    onBeforeLoad : function(){
        $A.Masker.mask(this.wrap,_lang['grid.mask.loading']);
    },
    onAfterSuccess : function(){
        $A.Masker.unmask(this.wrap);
    },
    onBeforSubmit : function(ds){
    	$A.Masker.mask(this.wrap,_lang['grid.mask.submit']);
    },
    onAjaxFailed : function(res,opt){
        $A.Masker.unmask(this.wrap);
    }
})
})();