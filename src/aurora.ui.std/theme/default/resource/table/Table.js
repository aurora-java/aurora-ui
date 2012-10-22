(function(){
var	DOC_EL = document.documentElement,
	_ = '_',
	__ = '__',
	___ = '-',
	_O = '.',
	_S = ' ',
	_N = '',
	_K = ']',
	C = '-c',
	U = '-u',
	TD = 'td',
    NONE = 'none',
	LEFT = 'left',
	DISPLAY = 'display',
	OUTLINE = 'outline',
	OUTLINE_V = '1px dotted blue',
	RECORD_ID = 'recordid',
	ROW_SELECT = 'row-selected',
	REQUIRED = 'required',
	ITEM_NOT_BLANK='item-notBlank',
    ITEM_INVALID = 'item-invalid',
    ROW_ALT = 'table-row-alt',
    TABLE_ROWBOX = 'table-rowbox',
    $TABLE_ROWBOX = _O + TABLE_ROWBOX,//'.table-rowbox'
    TABLE$ROWCHECK = 'table.rowcheck',
    TABLE$ROWRADIO = 'table.rowradio',
    TABLE_CKB = 'table-ckb ',
    TABLE_SELECT_ALL = 'table-select-all',
    MULTIPLE = 'multiple',
    CHECKED_VALUE = 'checkedvalue',
	READONLY = '-readonly',
	ITEM_CKB = 'item-ckb',
    ITEM_CKB_SELF = ITEM_CKB + '-self',//'item-ckb-self'
    $ITEM_CKB_SELF = _O + ITEM_CKB_SELF,//'.item-ckb-self'
    ITEM_CKB_U = ITEM_CKB + U,//'item-ckb-u'
    ITEM_CKB_C = ITEM_CKB + C,//'item-ckb-c'
    ITEM_CKB_READONLY_U = ITEM_CKB + READONLY + U,//'item-ckb-readonly-u'
    ITEM_CKB_READONLY_C	= ITEM_CKB + READONLY + C,//'item-ckb-readonly-c'
    ITEM_RADIO_IMG = 'item-radio-img',
    ITEM_RADIO_IMG_C = ITEM_RADIO_IMG + C,//'item-radio-img-c'
    ITEM_RADIO_IMG_U = ITEM_RADIO_IMG + U,//'item-radio-img-u'
    ITEM_RADIO_IMG_READONLY_C = ITEM_RADIO_IMG + READONLY + C,//'item-radio-img-readonly-c'
    ITEM_RADIO_IMG_READONLY_U = ITEM_RADIO_IMG + READONLY + U,//'item-radio-img-readonly-c'
    $ITEM_CKB_SELF_S$ITEM_CKB_C = $ITEM_CKB_SELF+ _S + _O +ITEM_CKB_C,//'.item-ckb-self .item-ckb-c'
    TABLE_CELL = 'table-cell',
    TABLE_CELL_EDITOR=TABLE_CELL+'-editor',//'table-cell-editor'
    CELL_CHECK = 'cellcheck',
    ROW_CHECK = 'rowcheck',
    EVT_CLICK = 'click',
    EVT_CELL_CLICK = 'cellclick',
    EVT_RENDER = 'render',
    EVT_ROW_CLICK = 'rowclick',
    EVT_EDITOR_SHOW = 'editorshow',
    EVT_NEXT_EDITOR_SHOW = 'nexteditorshow',
    EVT_KEY_DOWN = 'keydown',
    EVT_SELECT = 'select',
    EVT_MOUSE_DOWN = 'mousedown',
    EVT_RESIZE = 'resize',
    NOT_FOUND = '未找到',
    METHOD = '方法!',
    SELECT_DIV_ATYPE = 'div[atype=table.headcheck]',
    SELECT_TD_DATAINDEX = 'td[dataindex=';
	
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
		this.cb = wrap.child(SELECT_DIV_ATYPE);
		this.tbody=wrap.child('tbody');
		this.fb=wrap.child('tfoot');
		this.initTemplate();
	},
	processListener:function(ou){
		$A.Table.superclass.processListener.call(this,ou);
		this.tbody[ou](EVT_CLICK,this.onClick, this);
		if(this.canwheel){
			this.tbody[ou]('mousewheel',this.onMouseWheel,this);
		}
		if(this.cb)this.cb[ou](EVT_CLICK,this.onHeadClick,this);
		this[ou](EVT_CELL_CLICK,this.onCellClick,this);
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
            ds[ou]('select', this.onSelect, this);
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
        EVT_RENDER,
        /**
         * @event cellclick
         * 单元格点击事件.
         * @param {Aurora.Table} table 当前Table组件.
         * @param {Number} row 行号.
         * @param {String} 当前name.
         * @param {Aurora.Record} record 鼠标点击所在单元格的Record对象.
         */
        EVT_CELL_CLICK,
        /**
         * @event rowclick
         * 行点击事件.
         * @param {Aurora.Table} table 当前Table组件.
         * @param {Number} row 行号.
         * @param {Aurora.Record} record 鼠标点击所在行的Record对象.
         */
        EVT_ROW_CLICK,
        /**
         * @event editorShow
         * 编辑器显示后触发的事件.
         * @param {Aurora.Table} table 当前Table组件.
         * @param {Editor} grid 当前Editor组件.
         * @param {Number} row 行号.
         * @param {String} 当前name.
         * @param {Aurora.Record} record 鼠标点击所在行的Record对象.
         */
        EVT_EDITOR_SHOW,
        /**
         * @event nexteditorshow
         * 切换下一个编辑器的事件.
         * @param {Aurora.Table} table 当前table组件.
         * @param {Number} row 行号.
         * @param {String} 当前name.
         */
        EVT_NEXT_EDITOR_SHOW);
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
        this.cellTpl = new Ext.Template(['<div class="',TABLE_CELL,' {cellcls}" id="',this.id,'_{name}_{',RECORD_ID,'}">{text}</div>']);        
    	this.cbTpl = new Ext.Template(['<center><div class="{cellcls}" id="',this.id,'_{name}_{',RECORD_ID,'}"></div></center>']);
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
		tr.id=this.id+___+record.id;
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
				.set({atype:TABLE_CELL,dataindex:col.name})
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
        return ITEM_CKB+(readonly?READONLY:_N)+((value && value == cv) ? C : U);
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
                xtype = CELL_CHECK;
            }else{
                cls = TABLE_CELL_EDITOR;
            }
        }else if(xname && Ext.isDefined(record.getField(xname).get(CHECKED_VALUE))){
    		xtype = CELL_CHECK;
    		readonly=true;
        }
		if(xtype == ROW_CHECK||xtype == 'rowradio'){
			readonly = this.dataset.execSelectFunction(record)?_N:READONLY;
	    	Ext.fly(td).set({atype:xtype == ROW_CHECK?TABLE$ROWCHECK:TABLE$ROWRADIO,recordid:record.id})
	    		.addClass(TABLE_ROWBOX);
	        td.innerHTML=this.cbTpl.applyTemplate({cellcls:xtype == ROW_CHECK?TABLE_CKB+ITEM_CKB+readonly+U:'table-radio '+ITEM_RADIO_IMG+readonly+U,name:xname,recordid:record.id});
	    }else{
			Ext.fly(td).set({atype:TABLE_CELL,recordid:record.id,dataindex:xname})
				.setStyle({'text-align':col.align||LEFT,dLEFT:col.hidden?NONE:_N});
			if(xtype == CELL_CHECK){
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
        cb.parent($TABLE_ROWBOX).addClass(ITEM_CKB_SELF);
        if(cb){
	        if(this.selectionmodel==MULTIPLE) {
	            this.setCheckBoxStatus(cb, true);
	        }else{
	            this.setRadioStatus(cb,true);
	            ds.locate((ds.currentPage-1)*ds.pagesize + ds.indexOf(record) + 1)
	        }
            this.setSelectStatus(record);
        }
    },
    onUnSelect : function(ds,record,isSelectAll){
        if(!record||isSelectAll)return;
        var cb = Ext.get(this.id+__+record.id);
        cb.parent($TABLE_ROWBOX).addClass(ITEM_CKB_SELF);
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
		w.select($ITEM_CKB_SELF_S$ITEM_CKB_C).replaceClass(ITEM_CKB_C,ITEM_CKB_U);
		w.select($ITEM_CKB_SELF).removeClass(ITEM_CKB_SELF);
    },
    setRadioStatus: function(el, checked){
        if(!checked){
            el.removeClass(ITEM_RADIO_IMG_C).addClass(ITEM_RADIO_IMG_U);
        }else{
            el.addClass(ITEM_RADIO_IMG_C).removeClass(ITEM_RADIO_IMG_U);
        }
    },
    setCheckBoxStatus: function(el, checked){
        if(!checked){
            el.removeClass(ITEM_CKB_C).addClass(ITEM_CKB_U);
        }else{
            el.addClass(ITEM_CKB_C).removeClass(ITEM_CKB_U);
        }
    },
    setSelectDisable:function(el,record){
    	var flag = this.dataset.selected.indexOf(record) == -1;
    	if(this.selectionmodel==MULTIPLE){
    		el.removeClass([ITEM_CKB_C,ITEM_CKB_U])
    			.addClass(flag?ITEM_CKB_READONLY_U:ITEM_CKB_READONLY_C);
    	}else{
    		el.removeClass([ITEM_RADIO_IMG_C,ITEM_RADIO_IMG_U,ITEM_RADIO_IMG_READONLY_C,ITEM_RADIO_IMG_READONLY_U])
            	.addClass(flag?ITEM_RADIO_IMG_READONLY_U:ITEM_RADIO_IMG_READONLY_C);
    	}
    },
    setSelectEnable:function(el,record){
    	var flag = this.dataset.selected.indexOf(record) == -1;
    	if(this.selectionmodel==MULTIPLE){
    		el.removeClass([ITEM_CKB_READONLY_U,ITEM_CKB_READONLY_C])
    			.addClass(flag?ITEM_CKB_U:ITEM_CKB_C);
    	}else{
            el.removeClass([ITEM_RADIO_IMG_U,ITEM_RADIO_IMG_C,ITEM_RADIO_IMG_READONLY_U,ITEM_RADIO_IMG_READONLY_C])
    			.addClass(flag?ITEM_RADIO_IMG_U:ITEM_RADIO_IMG_C);
    	}	
    },
    setSelectStatus:function(record){
    	var ds = this.dataset;
    	if(ds.selectfunction){
	    	var cb = Ext.get(this.id+__+record.id);
	    	if(!ds.execSelectFunction(record)){
	    		 this.setSelectDisable(cb,record)
	    	}else{
	    		 this.setSelectEnable(cb,record);
	    	}
    	}
    },
    onHeadClick : function(e){
        var cb = this.cb,
        	ds = this.dataset,
        	checked = cb.hasClass(ITEM_CKB_C);
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
        	div = Ext.get([this.id,name,this.selectedId].join(_));
        col.editor = editor;
        if(div){
        	this.focusdiv = div;
        	if(editor == _N){
            	div.removeClass(TABLE_CELL_EDITOR)
            }else if(!$(editor) instanceof $A.CheckBox){
            	div.addClass(TABLE_CELL_EDITOR)
            }
        }
    },
	getEditor : function(col,record){
        var ed = col.editor||_N;
        if(col.editorfunction) {
            var ef = window[col.editorfunction];
            if(ef==null) {
                alert(NOT_FOUND+col.editorfunction+METHOD) ;
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
        var ds = this.dataset,record = ds.getAt(row);
        if(!record)return;
        if(record.id != this.selectedId) this.selectRow(row);
        var editor = this.getEditor(col,record);
        this.setEditor(name, editor);
        if(editor!=_N){
        	var ed = $(editor);
            (function(){
            	var v = record.get(name),
                	dom = Ext.get([this.id,name,record.id].join(_)),
                	xy = dom.getXY(),ced;
                ed.bind(ds, name);
                ed.render(record);
        		ed.el.on(EVT_KEY_DOWN, this.onEditorKeyDown,this);
                Ext.fly(DOC_EL).on(EVT_MOUSE_DOWN, this.onEditorBlur, this);
                ced = this.currentEditor = {
                    record:record,
                    ov:v,
                    name:name,
                    editor:ed
                };
                if(ed instanceof $A.CheckBox){
	        		ed.move(-1000,xy[1]+5);
		        	if(callback)
		        		ed.focus()
		        	else
		        		ed.onClick();
		        	ced.focusCheckBox = dom;
	        		dom.setStyle(OUTLINE,OUTLINE_V);
	       		}else{
	       			this.positionEditor();
                    ed.isEditor = true;
                    ed.isFireEvent = true;
                    ed.isHidden = false;
                    ed.focus();
       				this.editing = true;
                    ed.on(EVT_SELECT,this.onEditorSelect,this);
                    Ext.fly(window).on(EVT_RESIZE, this.positionEditor, this);
                    if(callback)callback.call(window,ed)
	                this.fireEvent(EVT_EDITOR_SHOW, this, ed, row, name, record);
       			}
            }).defer(10,this)
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
        var ced = this.currentEditor;
        if(ced){
        	var ed = ced.editor;
        	if(ed){
	            var callback = function(e){
	                if(e instanceof $A.Lov){
	                    e.showLovWindow();
	                }
	            },
            	ds = this.dataset,
                fname = ed.binder.name,r = ed.record,
                row = ds.data.indexOf(r),name=null;
	            if(row!=-1){
	                var cls = this.columns,
	                	find = false,
	                	editor;
	                Ext.each(cls,function(col,i){
	                	if(find){
	                		if(col.hidden !=true){
			                    editor = this.getEditor(col,r);
			                    if(editor!=_N){
			                        name =  col.name;
			                        return false;
			                    }
		                    }
	                	}else{
		                	if(col.name == fname){
		                		find = true
		                    }
	                	}
	                },this);
	                if(name){
	                    this.fireEvent(EVT_CELL_CLICK, this, row, name, r ,callback);
	                }else{
	                    var nr = ds.getAt(row+1);
	                    if(!nr && this.autoappend !== false){
			            	ds.create();
			            	nr = ds.getAt(row+1);
			            }
	                    if(nr){
	                    	this.selectRow(row+1);
	                    	Ext.each(cls,function(col){
	                    		if(this.getEditor(col,nr)!=_N){
	                                this.fireEvent(EVT_CELL_CLICK, this, row+1, col.name, nr ,callback);
	                                return false;
	                            }
	                    	},this);
	                    }
	                }
	            }
	            this.fireEvent(EVT_NEXT_EDITOR_SHOW,this, row, name);
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
    	var ced = this.currentEditor;
        if(ced){
            var ed = ced.editor;
            if(ed){
	            if(!ed.canHide || ed.canHide()) {
	        		var d = ced.focusCheckBox;
		    		if(d){
		    			d.setStyle(OUTLINE,NONE);
		    			ced.focusCheckBox = null;
		    		}
	                ed.el.un(EVT_KEY_DOWN, this.onEditorKeyDown,this);
	                ed.un(EVT_SELECT,this.onEditorSelect,this);
	                Ext.fly(DOC_EL).un(EVT_MOUSE_DOWN, this.onEditorBlur, this);
	                Ext.fly(window).un(EVT_RESIZE, this.positionEditor, this);
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
        this.selectTr = Ext.get(this.id+___+record.id);
        if(this.selectTr)this.selectTr.addClass(ROW_SELECT);
        //this.focusRow(row);
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
                    alert(NOT_FOUND+col.footerrenderer+METHOD)
                    return;
                }
                var name = col.name,
                	v = fder.call(window,this.dataset.data, name);
                if(!Ext.isEmpty(v)){
	                this.fb.child(SELECT_TD_DATAINDEX+name+_K).update(v)
                }
            }
    	},this);
    },
    showColumn : function(name){
        var col = this.findColByName(name);
        if(col){
            if(col.hidden === true){
                delete col.hidden;
                this.wrap.select(SELECT_TD_DATAINDEX+name+_K).setStyle(DISPLAY,_N);
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
            	this.wrap.select(SELECT_TD_DATAINDEX+name+_K).setStyle(DISPLAY,NONE);
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
                alert(NOT_FOUND+renderer+METHOD)
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
                alert(NOT_FOUND+renderer+METHOD)
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
            if(atype==TABLE_CELL){
                var record = ds.findById(rid),
                	row = ds.indexOf(record),
                	name = target.getAttributeNS(_N,'dataindex');
                this.fireEvent(EVT_CELL_CLICK, this, row, name, record);
//                this.showEditor(row,name);
                this.fireEvent(EVT_ROW_CLICK, this, row, record);
            }else if(atype==TABLE$ROWCHECK){               
                var cb = Ext.get(this.id+__+rid);
                if(cb.hasClass(ITEM_CKB_READONLY_U)||cb.hasClass(ITEM_CKB_READONLY_C))return;
                if(this.isSelectAll && !cb.parent($ITEM_CKB_SELF)){
                	cb.replaceClass(ITEM_CKB_U,ITEM_CKB_C);	
                }else if(this.isUnselectAll && !cb.parent($ITEM_CKB_SELF)){
            		cb.replaceClass(ITEM_CKB_C,ITEM_CKB_U);	
                }
                cb.hasClass(ITEM_CKB_C) ? ds.unSelect(rid) : ds.select(rid);
            }else if(atype==TABLE$ROWRADIO){
            	var cb = Ext.get(this.id+__+rid);
                if(cb.hasClass(ITEM_RADIO_IMG_READONLY_U)||cb.hasClass(ITEM_RADIO_IMG_READONLY_C))return;
                ds.select(rid);
            }
        }
    },
    onCellClick : function(grid,row,name,record,callback){
    	this.showEditor(row,name,callback);
    },
    onUpdate : function(ds,record, name, value){
        this.setSelectStatus(record);
    	var div=Ext.get([this.id,name,record.id].join(_));
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
            	var ediv = Ext.get([this.id,c.name,record.id].join(_));
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
        var cb = w.removeClass(TABLE_SELECT_ALL).child(SELECT_DIV_ATYPE);
        if(cb && this.selectable && this.selectionmodel==MULTIPLE)this.setCheckBoxStatus(cb,false);
    	var l=data.length;
    	if(l==0)this.createEmptyRow();
		else for(var i=0;i<l;i++){
            this.createRow(data[i],i);
        }
        this.drawFootBar();
        $A.Masker.unmask(w);
        this.fireEvent(EVT_RENDER,this)
	},
	onValid : function(ds, record, name, valid){
        var c = this.findColByName(name);
        if(c){
            var div = Ext.get([this.id,name,record.id].join(_));
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
        var row = Ext.get(this.id+___+record.id);
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
        this.selectRow(index, false);
    },
    onFieldChange : function(ds, record, field, type, value){
        if(type == REQUIRED){
           var div = Ext.get([this.id,field.name,record.id].join(_));
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