(function(A){
var DOC_EL = document.documentElement,
	IS_EMPTY = Ext.isEmpty,
    EACH = Ext.each,
	FALSE = false,
    TRUE = true,
    NULL = null,
    _N = '',
    _ = '_',
    _S = ' ',
    C = '-c',
    U = '-u',
	CHECKED_VALUE = 'checkedvalue',
	CELL_CHECK = 'cellcheck',
    READONLY = '-readonly',
	ITEM_CKB = 'item-ckb',
    REQUIRED = 'required',
	ITEM_NOT_BLANK='item-notBlank',
    ITEM_INVALID = 'item-invalid',
    EVT_CELL_CLICK = 'cellclick',
//    EVT_RENDER = 'render',
    EVT_ROW_CLICK = 'rowclick',
    EVT_KEY_DOWN = 'keydown',
    EVT_SELECT = 'select',
    EVT_MOUSE_DOWN = 'mousedown',
    EVT_EDITOR_SHOW = 'editorshow',
    EVT_NEXT_EDITOR_SHOW = 'nexteditorshow',
    NOT_FOUND = '未找到',
    METHOD = '方法!';

A.GridBox = Ext.extend(A.Component,{
	constructor : function(config){
		A.GridBox.superclass.constructor.call(this,config);
	},
	initComponent : function(config){
		var sf = this;
		A.GridBox.superclass.initComponent.call(sf,config);
		var wrap = sf.wrap,
			isfield = sf.isfield,
			tbody = sf.tbody = isfield?wrap.parent('tbody'):wrap.child('tbody'),
			tr = sf.tr = isfield?wrap.parent('tr').addClass('gridbox-row-end'):tbody.first(),
			btn = sf.btn = wrap.child('.gridbox-button'),
			count=0,column = sf.column,rows=1;
		EACH(sf.columns,function(col){
			var colspan = Number(col.colspan)||1;
			if(colspan > 1 && count < column && count+colspan > column){
				col.colspan = colspan = column - count;
			}
			count+=colspan;
			if(count>column){
				rows++;
				count = Number(col.colspan)||1;
			}
		});
		sf.rows = rows;
		btn.dom.tabIndex = sf.tabindex;
		btn.setStyle({outline:'none'});
		sf.rowposition = tbody.query('tr').indexOf(tr.dom);
		sf.initTemplate();
	},
	processDataSetLiestener: function(ou){
        var sf = this,ds = sf.dataset;
        if(ds){
//	       	ds[ou]('ajaxfailed', sf.onAjaxFailed, sf);
            ds[ou]('metachange', sf.onLoad, sf);
            ds[ou]('update', sf.onUpdate, sf);
            ds[ou]('reject', sf.onUpdate, sf);
            ds[ou]('add', sf.onAdd, sf);
//            ds[ou]('submit', sf.onBeforSubmit, sf);
//            ds[ou]('submitfailed', sf.onAfterSuccess, sf);
//            ds[ou]('submitsuccess', sf.onAfterSuccess, sf);
//            ds[ou]('query', sf.onBeforeLoad, sf);
			ds[ou]('load', sf.onLoad, sf);
//			ds[ou]('loadfailed', sf.onAjaxFailed, sf);
            ds[ou]('valid', sf.onValid, sf);
//            ds[ou]('beforeremove', sf.onBeforeRemove, sf); 
            ds[ou]('remove', sf.onRemove, sf);
            ds[ou]('clear', sf.onLoad, sf);
            ds[ou]('refresh',sf.onLoad,sf);
//            ds[ou]('fieldchange', sf.onFieldChange, sf);
            ds[ou]('indexchange', sf.onIndexChange, sf);
//            ds[ou]('select', sf.onSelect, sf);
//            ds[ou]('unselect', sf.onUnSelect, sf);
//            ds[ou]('selectall', sf.onSelectAll, sf);
//            ds[ou]('unselectall', sf.onUnSelectAll, sf);
        }
    },
	processListener : function(ou){
		var sf = this;
		A.GridBox.superclass.processListener.call(sf,ou);
		sf.tbody[ou]('click',sf.onClick,sf);
		sf.btn[ou](Ext.isOpera ? "keypress" : EVT_KEY_DOWN, sf.handleKeyDown,  sf)
            [ou]("keyup", sf.handleKeyUp,  sf)
            [ou]("focus",sf.onFocus,sf)
            [ou]("blur",sf.onBlur,sf)
		sf[ou](EVT_CELL_CLICK,sf.onCellClick,sf);
	},
	processMouseOverOut : function(ou){
		var sf = this;
        if(sf.isfield){
            sf.wrap.parent('table')[ou]("mouseover", sf.onMouseOver, sf)
            	[ou]("mouseout", sf.onMouseOut, sf);
        }else{
        	A.GridBox.superclass.processMouseOverOut.call(sf,ou);
        }
    },
	bind : function(ds){
		if(Ext.isString(ds)){
			ds = $(ds);
			if(!ds) return;
		}
		var sf = this;
		sf.dataset = ds;
		sf.processDataSetLiestener('on');
		sf.onLoad();
	},
	handleKeyDown : function(e){
        var sf = this,key = e.getKey(),ds = sf.dataset;
        if(e.ctrlKey&&e.keyCode == 86&&sf.canpaste){
            var text = window.clipboardData.getData('text');
            if(text){
                EACH(text.split('\n'),function(row){
                    var values = row.split('\t');
                    if(values==_N)return;
                    var data = {},v=0; 
                    EACH(sf.columns,function(c){
                        if(sf.isFunctionCol(c.type)) return;
                        if(c.hidden !== TRUE) {
                            data[c.name] = values[v];
                            v++
                        }
                    });
                    ds.create(data);
                });
            }
        }else{
            if(key == 9){
                sf.showEditorByRecord();
            }else if(key == 38 || key == 40 || key == 33 || key == 34) {
                if(ds.loading == TRUE) return;
//                var row;
                switch(e.getKey()){
                    case 33:
                        ds.prePage();
                        break;
                    case 34:
                        ds.nextPage();
                        break;
                    case 38:
                        if(!e.ctrlKey) ds.pre();
                        break;
                    case 40:
                        if(!e.ctrlKey) ds.next();
                        break;
                }
                e.stopEvent();
            }
        }
        sf.fireEvent(EVT_KEY_DOWN, sf, e)
    },
	handleKeyUp : function(e){
        if(e.getKey() == 9){
            this.showEditorByRecord();
        }
    },
    onFocus : function(){
        this.hasFocus = TRUE;
    },
    onBlur : function(){
        this.hasFocus = FALSE;
    },
	onValid : function(ds, record, name, valid){
        var c = this.findColByName(name);
        if(c){
            var div = Ext.get([this.id,name,record.id].join(_));
            if(div) {
                if(valid == FALSE){
                    div.addClass(ITEM_INVALID);
                }else{
                    div.removeClass([ITEM_NOT_BLANK,ITEM_INVALID]);
                }
            }
        }
    },
    getDataIndex : function(rid){
        for(var i=0,data = this.dataset.data,l=data.length;i<l;i++){
            if(data[i].id == rid){
                return i;
            }
        }
        return -1;
    },
    onIndexChange:function(ds, r){
        var index = this.getDataIndex(r.id);
        if(index == -1)return;
        this.selectRow(index, FALSE);
    },
    onAdd : function(ds,record,index){
    	var sf = this;
    	sf.createRow(record,index*(sf.rows||1));
    },
	onRemove : function(ds,record,index){
		this.tr.parent().select('[_row='+record.id+']').remove();
    },
	onUpdate : function(ds,record, name, value){
//        this.setSelectStatus(record);
    	var sf = this,
    		div=Ext.get([sf.id,name,record.id].join(_));
        if(div){
            var c = sf.findColByName(name),
            	editor = sf.getEditor(c,record);            
            if(editor!=_N && ($(editor) instanceof A.CheckBox)){
            	sf.renderEditor(div,record,c,editor);
            }else{
            	//考虑当其他field的值发生变化的时候,动态执行其他带有renderer的
                div.update(sf.renderText(record,c, value));
            }
        }
        EACH(sf.columns,function(c){
        	if(c.name != name) {
            	var ediv = Ext.get([sf.id,c.name,record.id].join(_));
            	if(ediv) {
            		if(c.editorfunction){
                        sf.renderEditor(ediv,record, c, sf.getEditor(c,record));
            		}
                    if(c.renderer){
                        ediv.update(sf.renderText(record,c, record.get(c.name)));
                    }
                }
                
            }
        });
//        sf.drawFootBar(name);
    },
	onLoad : function(){
		var sf = this,
			ds = sf.dataset;
		sf.clear();
		sf.render();
	},
	clear : function(){
		this.tr.parent().select('[_id='+this.id+']').remove();
	},
	initTemplate : function(){
        this.cellTpl = new Ext.Template(['<div class="gridbox-cell {cellcls}" id="',this.id,'_{name}_{recordid}" style="width:{width}px">{text}</div>']);        
    	this.cbTpl = new Ext.Template(['<div class="gridbox-ckb-wrap" style="height:20px;width:{width}px"><div style="margin-top:3px" class="{cellcls}" id="',this.id,'_{name}_{recordid}"></div></div>']);
    },
	render : function(){
		var sf = this;
		EACH(sf.dataset.getAll(),function(r,i){
			sf.createRow(r,i*sf.rows);
		});
	},
	renderPrompt : function(record,col,value){
		var renderer = col.promptrenderer;
        if(renderer){//&&!IS_EMPTY(value)  去掉对value是否为空的判断
            var rder = A.getRenderer(renderer);
            if(rder == NULL){
                alert(NOT_FOUND+renderer+METHOD)
                return value;
            }
            value = rder(value,record, col.name);
            return value == NULL ? _N : value;
        }
        return value == NULL ? _N : value;
	},
	renderEditor : function(div,record,c,editor){
    	this.createCell(div.dom,c,record);
    	//div.parent().update(cell);
    },
	renderText : function(record,col,value){
        var renderer = col.renderer;
        if(renderer){//&&!IS_EMPTY(value)  去掉对value是否为空的判断
            var rder = A.getRenderer(renderer);
            if(rder == NULL){
                alert(NOT_FOUND+renderer+METHOD)
                return value;
            }
            value = rder(value,record, col.name);
            return value == NULL ? _N : value;
        }
        return value == NULL ? _N : value;
    },
	createRow : function(record,index){
		var sf = this,
			column = sf.column,
			pos = sf.rowposition,
			count=0,
			tr = sf.tbody.dom.insertRow(index+pos+1),
			td,
			nr = 1,
			createCloseBtn = false;
		Ext.fly(tr).set({
			'_row':record.id,
			'_id':sf.id
		},true);
		EACH(sf.columns,function(col,_index){
			count+=Number(col.colspan)||1;
			if(count>column){
				if(!createCloseBtn){
					sf.createCloseBtn(td,record);
					createCloseBtn = true;
				}
				tr = sf.tbody.dom.insertRow(index+nr+pos+1);
				Ext.fly(tr).set({
					'_row':record.id,
					'_id':sf.id
				},true);
				count=Number(col.colspan)||1;
				nr++;
			}
			td = sf.createCell(tr,col,record);
			if(_index == sf.columns.length-1){
				for(var i=0,len = column - count;i<len;i++){
					sf.createEmptyCell(tr);
				}
			}
		});
		tr.className = 'gridbox-row-end';
		if(!createCloseBtn){
			sf.createCloseBtn(td,record);
		}
	},
	createEmptyCell : function(tr){
		var th = document.createElement('th'),
			td = document.createElement('td');
		tr.appendChild(th);
		tr.appendChild(td);
		th.innerHTML = '&#160;';
		td.innerHTML = '&#160;';
	},
	createCloseBtn : function(td,record){
		new Ext.Template('<div class="gridbox-close-button" recordid="{recordid}"></div>').append(td,{
			recordid:record.id
		});
		td.addClass('gridbox-close-botton-wrap');
	},
	createCell:function(tr,col,record){
		var sf = this,
			th = document.createElement('th'),
			td,
			hasCloseBtn = FALSE;
		th.className = 'layout-th';
		if(col){
			var prompt = sf.renderPrompt(record,col,col.prompt);
			th.innerHTML = '<div>'+prompt+(IS_EMPTY(prompt)?_N:sf.labelseparator)+'</div>';
		}
		th.width = col.labelwidth;
		tr.appendChild(th);
		if(tr.tagName.toLowerCase()=='tr'){
			td = document.createElement('td');
			tr.appendChild(td);
			td=Ext.fly(td);
		}else {
			td=Ext.fly(tr).parent('td');
			if(td.hasClass('gridbox-close-botton-wrap')){
				hasCloseBtn = TRUE;
			}
		}
		td.addClass('layout-td-cell')
				.setStyle({padding: this.padding + 'px'});
		if(col){
			if(col.colspan){
				td.dom.colSpan = col.colspan*2-1;
			}
			var editor = sf.getEditor(col,record),
				xtype = col.type,
				xname = col.name,
				readonly,cls=_N;
			if(editor!=_N){
	        	var edi = A.CmpManager.get(editor);
	            if(edi && (edi instanceof A.CheckBox)){
	                xtype = CELL_CHECK;
	            }else{
	                cls = 'item-tf item-wrap';
	            }
	        }else if(xname && Ext.isDefined(record.getField(xname).get(CHECKED_VALUE))){
	    		xtype = CELL_CHECK;
	    		readonly=TRUE;
	        }else{
	        	cls = 'item-tf item-wrap item-readOnly'
	        }
	//		if(xtype == ROW_CHECK||xtype == 'rowradio'){
	//			readonly = sf.dataset.execSelectFunction(record)?_N:READONLY;
	//	    	td.set({atype:xtype == ROW_CHECK?TABLE$ROWCHECK:TABLE$ROWRADIO,recordid:record.id})
	//	    		.addClass(TABLE_ROWBOX);
	//	        td.update(sf.cbTpl.applyTemplate({cellcls:xtype == ROW_CHECK?TABLE_CKB+ITEM_CKB+readonly+U:'table-radio '+ITEM_RADIO_IMG+readonly+U,name:xname,recordid:record.id}));
	//	    }else{
				td.set({
					atype:'gridbox-cell',
					recordid:record.id,
					dataindex:xname
				}).setStyle({
					'text-align':col.align||'left'
				});
				if(xtype == CELL_CHECK){
					td.update(sf.cbTpl.applyTemplate({
						cellcls:'gridbox-ckb ' + sf.getCheckBoxStatus(record, xname ,readonly),
						name:xname,
						recordid:record.id,
						width:col.width||-1
					}));
				}else{
					var field = record.getMeta().getField(xname);
			        if(field && IS_EMPTY(record.data[xname]) && field.get(REQUIRED) == TRUE){
			            cls = cls + _S + ITEM_NOT_BLANK
			        }
					td.update(xname?sf.cellTpl.applyTemplate({
						text:sf.renderText(record,col,record.data[xname]),
						cellcls:cls,
						name:xname,
						recordid:record.id,
						width:col.width||150
					}):'&#160;');
				}
				if(hasCloseBtn){
					sf.createCloseBtn(td,record);
				}
	//		}
		}
		return td;
	},
	getCheckBoxStatus: function(record, name ,readonly) {
        var field = this.dataset.getField(name),
        	cv = field.getPropertity(CHECKED_VALUE),
        	value = record.data[name];
        return ITEM_CKB+(readonly?READONLY:_N)+((value && value == cv) ? C : U);
    },
	/*createCell : function(tr,col,record){
		var th = document.createElement('th');
		th.className = 'layout-th';
		if(col)
			th.innerHTML = '<div>'+col.prompt+':</div>';
		tr.appendChild(th);
		var td = Ext.fly(tr.insertCell(-1));
		td.addClass('layout-td-cell')
			.setStyle({padding: this.padding + 'px'});
		if(col){
			col.colspan && td.set({colspan:col.colspan*2-1});
			td.update(['<div id="',[this.id,col.name,record.id].join('_'),'", atype="gridbox-cell" dataindex="',
				col.name,'" recordid="',
				record.id,'" class="item-tf item-wrap gridbox-cell" style="width:',
				col.width||150,'px;">',record.get(col.name),
				'</div>'].join(_N));
		}
	},*/
	onClick : function(e,t) {
        var sf = this,
        	target = t = Ext.fly(t),
        	ds = sf.dataset,
        	record;
        if(target.is('div.gridbox-close-button')){
    		record = ds.findById(target.getAttributeNS(_N,'recordid'));
    		A.showConfirm('提示','确认删除？',function(){
    			ds.remove(record);
    		});
        }else if(target.is('div.gridbox-cell')||target.is('div.gridbox-ckb-wrap')||target.parent('div.gridbox-ckb-wrap')){
//            var atype = target.getAttributeNS(_N,'atype');
//            if(atype=='gridbox-cell'){
        		target = target.parent('td');
            	record = ds.findById(target.getAttributeNS(_N,'recordid'));
                var	row = ds.indexOf(record),
                	name = target.getAttributeNS(_N,'dataindex');
                sf.fireEvent(EVT_CELL_CLICK, sf, row, name, record,!t.hasClass('gridbox-ckb'));
//                sf.showEditor(row,name);
                sf.fireEvent(EVT_ROW_CLICK, sf, row, record);
//            }else if(atype==TABLE$ROWCHECK){               
//                var cb = Ext.get(sf.id+__+rid);
//                if(cb.hasClass(ITEM_CKB_READONLY_U)||cb.hasClass(ITEM_CKB_READONLY_C))return;
//                if(sf.isSelectAll && !cb.parent($ITEM_CKB_SELF)){
//                	cb.replaceClass(ITEM_CKB_U,ITEM_CKB_C);	
//                }else if(sf.isUnselectAll && !cb.parent($ITEM_CKB_SELF)){
//            		cb.replaceClass(ITEM_CKB_C,ITEM_CKB_U);	
//                }
//                cb.hasClass(ITEM_CKB_C) ? ds.unSelect(rid) : ds.select(rid);
//            }else if(atype==TABLE$ROWRADIO){
//            	var cb = Ext.get(sf.id+__+rid);
//                if(cb.hasClass(ITEM_RADIO_IMG_READONLY_U)||cb.hasClass(ITEM_RADIO_IMG_READONLY_C))return;
//                ds.select(rid);
//            }
        }
    },
    onCellClick : function(grid,row,name,record,callback){
    	this.showEditor(row,name,callback);
    },
    setEditor: function(name,editor){
        var sf = this,col = sf.findColByName(name),
        	div = Ext.get([sf.id,name,sf.selectedId].join(_));
        col.editor = editor;
        /*if(div){
        	//sf.focusdiv = div;
        	if(editor == _N){
            	div.addClass('item-readOnly')
            }else if(!$(editor) instanceof A.CheckBox){
            	div.removeClass('item-readOnly')
            }
        }*/
    },
    getEditor : function(col,record){
        var ed = col.editor||_N;
        if(col.editorfunction) {
            var ef = window[col.editorfunction];
            if(ef==NULL) {
                alert(NOT_FOUND+col.editorfunction+METHOD) ;
                return NULL;
            }
            ed = ef.call(window,record,col.name)||_N;
        }
        return ed;
    },
    positionEditor:function(){
    	var sf = this,
    		ced = sf.currentEditor,
    		ed=ced.editor,dom=Ext.get([sf.id,ced.name,ced.record.id].join(_)),xy = dom.getXY();
		if(ed instanceof A.CheckBox){
    		ed.move(xy[0],xy[1]-4);
		}else{
	        ed.setHeight(dom.getHeight()-2);
	        ed.setWidth(dom.getWidth()-5<22?22:(dom.getWidth()-5));
	        ed.move(xy[0],xy[1]);
		}
        if(ed.isExpanded&&ed.isExpanded()){
        	if(Ext.isIE){
        		if(sf.t)clearTimeout(sf.t);
	        	sf.t=(function(){
	        		ed.syncPopup();
	        	}).defer(1);
        	}else{
        		ed.syncPopup();	
        	}
        }
    },
    hideEditor : function(){
    	var sf = this,ced = sf.currentEditor;
        if(ced){
            var ed = ced.editor;
            if(ed){
	            if(!ed.canHide || ed.canHide()) {
	                ed.el.un(EVT_KEY_DOWN, sf.onEditorKeyDown,sf);
	                ed.un(EVT_SELECT,sf.onEditorSelect,sf);
	                Ext.fly(DOC_EL).un(EVT_MOUSE_DOWN, sf.onEditorBlur, sf);
//	                Ext.fly(window).un(EVT_RESIZE, sf.positionEditor, sf);
	                ed.move(-10000,-10000);
	                var view = ed.autocompleteview;
                    if(view)view.hide();
                    ed.blur();
                    ed.onBlur();
	                ed.isFireEvent = FALSE;
	                ed.isHidden = TRUE;
	                sf.editing = FALSE;
	                if(ed.collapse)ed.collapse();
	            }
            }
        }
    },
    showEditor : function(row, name,callback){
    	if(row == -1)return;
        var sf = this,col = sf.findColByName(name);
        if(!col)return;
        var ds = sf.dataset,record = ds.getAt(row);
        if(!record)return;
        if(record.id != sf.selectedId) sf.selectRow(row);
        var editor = sf.getEditor(col,record);
        sf.setEditor(name, editor);
        if(editor!=_N){
        	var ed = $(editor);
            (function(){
            	var v = record.get(name),
                	dom = Ext.get([sf.id,name,record.id].join(_)),
                	xy = dom.getXY(),ced;
                ed.bind(ds, name);
                ed.render(record);
//                if(Ext.isIE)ed.processListener('un');
        		ed.el.on(EVT_KEY_DOWN, sf.onEditorKeyDown,sf);
//        		if(Ext.isIE)ed.processListener('on');
                Ext.fly(DOC_EL).on(EVT_MOUSE_DOWN, sf.onEditorBlur, sf);
                ced = sf.currentEditor = {
                    record:record,
                    ov:v,
                    name:name,
                    editor:ed
                };
       			sf.positionEditor();
                if(ed instanceof A.CheckBox){
//	        		ed.move(xy[0],xy[1]-4);
//                	var _begin = sf._begin;
//                	if(_begin){
//                		var _begin_index = ds.indexOf(_begin),_end_index = ds.indexOf(record);
//                		if(_begin_index > _end_index){
//                			var t = _end_index;
//                			_end_index = _begin_index;
//                			_begin_index = t;
//                		}
//            			_end_index++
//                		for(;_begin_index<_end_index;_begin_index++){
//                			ds.getAt(_begin_index).set(name,_begin.get(name));
//                		}
//                		delete sf._begin;
//                	}else{
			        	if(callback)
			        		ed.focus()
			        	else
			        		ed.onClick();
//                	}
//		        	ced.focusCheckBox = dom;
//	        		dom.setStyle(OUTLINE,OUTLINE_V);
	       		}else{
	       			if(ed instanceof A.Field && !ed instanceof A.TextArea){
                        ed.el.setStyle('text-align',col.align||'left')
                    }else if(ed instanceof A.Lov){
                    	ed.on('fetching',sf.onFetching,sf);
                    }
                    ed.isEditor = TRUE;
                    ed.isFireEvent = TRUE;
                    ed.isHidden = FALSE;
                    ed.focus();
                    ed.on(EVT_SELECT,sf.onEditorSelect,sf);
                    if(Ext.isFunction(callback))callback(ed);
	                sf.fireEvent(EVT_EDITOR_SHOW, sf, ed, row, name, record);
       			}
   				sf.editing = TRUE;
//                Ext.fly(window).on(EVT_RESIZE, sf.positionEditor, sf);
            }).defer(10);
        }           
    },
    showEditorByRecord : function(record){
        var sf = this,
            ds = sf.dataset,
            row = record?ds.indexOf(record):0;
        record = record||ds.getAt(0);
        if(!record && sf.autoappend) record = ds.create();
        if(record)
        EACH(sf.columns,function(col){
            if(col.hidden !=TRUE && sf.getEditor(col,record)!=_N){
                sf.fireEvent(EVT_CELL_CLICK, sf, row, col.name, record,function(){});
                sf.fireEvent(EVT_ROW_CLICK, sf, row, record);
                return FALSE;
            }
        });
    },
    onEditorBlur : function(e,t){
    	var sf = this,ced = sf.currentEditor;
        if(ced && !ced.editor.isEventFromComponent(t)) {  
            sf.hideEditor.defer(Ext.isIE9?10:0,sf);
        }
    },
    onEditorSelect : function(){
		(function(){this.hideEditor()}).defer(1,this);
    },
    onEditorKeyDown : function(e,editor){
        var sf = this,
        	keyCode = e.keyCode
        	ced = sf.currentEditor;
        //esc
        if(keyCode == 27) {
            if(ced){
                var ed = ced.editor;
                if(ed){
	                ed.clearInvalid();
	                ed.render(ed.binder.ds.getCurrentRecord());
                }
            }
            sf.hideEditor();
        }else
        //enter
        if(keyCode == 13) {
        	if(!(ced && ced.editor && ced.editor instanceof A.TextArea)){
	            sf.showEditorBy(39);
        	}
        }else
        //tab
        if(keyCode == 9){
            e.stopEvent();
            sf.showEditorBy(e.shiftKey?37:39);
        }else
        //37-->left 38-->up 39-->right 40-->down
        if(e.ctrlKey && (keyCode == 37||keyCode == 38 || keyCode == 39 || keyCode == 40)){
            sf.showEditorBy(keyCode);
            e.stopEvent();
        }
    },
    showEditorBy : function(dir){
        var sf = this,
            callback = TRUE,
//            function(e){
//                  if(e instanceof A.Lov){
//                      e.showLovWindow();
//                  }
//            },
            ed = sf.findEditorBy(dir);
        if(ed){
            sf.hideEditor();
            var row = ed.row,record = ed.record;
            sf.fireEvent(EVT_CELL_CLICK, sf, row, ed.name, record ,callback);   
            sf.fireEvent(EVT_ROW_CLICK, sf, row, record);
        }
    },
    findColByName : function(name){
    	var r;
    	if(name){
    		EACH(this.columns,function(c){
    			if(c.name && c.name.toLowerCase() === name.toLowerCase()){
	                r = c;
	                return FALSE;
	            }
    		});
    	}
        return r;
    },
    findEditorBy : function(dir){
        var sf = this,ced,ed;
        if((ced = sf.currentEditor) && (ed = ced.editor)){
            var cls = sf.columns,
                find = FALSE,
                ds = sf.dataset,
                fname = ed.binder.name,r = ed.record,
                row = ds.data.indexOf(r),
                name=NULL,hasAutoAppend = FALSE,
                forward = TRUE,updown = FALSE,col;
            if(row!=-1){
                if(dir == 37 || dir == 38){
                    cls = [].concat(cls).reverse();
                    forward = FALSE;
                }
                if(dir == 38 || dir == 40){
                    updown = TRUE;
                    col = sf.findColByName(fname);
                }
                while(r){
                    if(!updown){
                        EACH(cls,function(col){
                            if(find){
                                if(col.hidden !=TRUE && sf.getEditor(col,r)!=_N){
                                    name = col.name;
                                    return FALSE;
                                }
                            }else{
                                if(col.name == fname){
                                    find = TRUE
                                }
                            }
                        });
                    }
                    if(name){
                        return {
                            row : row,
                            name : name,
                            record : r
                        }   
                    }
                    r = ds.getAt(forward?++row:--row);
                    if(forward && !r && !hasAutoAppend && sf.autoappend){
                        sf.hideEditor();
                        ds.create();
                        r = ds.getAt(row);
                        hasAutoAppend = TRUE;
                    }
                    if(updown && r && sf.getEditor(col,r)!=_N){
                        name = fname;
                    }
                }
            }
        }
        return NULL;
    },
    selectRow : function(row, locate){
        var sf = this,
            ds = sf.dataset,record = ds.getAt(row),
            r = (ds.currentPage-1)*ds.pagesize + row+1;
        sf.selectedId = record.id;
        if(locate!==FALSE && r != NULL) {
            ds.locate.defer(5, ds,[r,FALSE]);
        }
    }
});
A.GridBox.revision='$Rev$';
})($A);