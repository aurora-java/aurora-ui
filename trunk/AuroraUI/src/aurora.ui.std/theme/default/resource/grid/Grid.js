(function(){
var _ = '_',
	__ = '__',
	_O = '.',
	_S = ' ',
	_N = '',
	_K = ']',
	C = '-c',
	U = '-u',
	$L = '$l-',
	$U = '$u-',
    ON = 'on',
	PX = 'px',
	TR = 'tr',
	TD = 'td',
	TH = 'th',
    TB = '_tb',
	DIV = 'div',
	TOP = 'top',
	LEFT = 'left',
	NONE = 'none',
	WIDTH = 'width',
	CENTER = 'center',
	HIDDEN = 'hidden',
	CURSOR = 'cursor',
	VISIBLE = 'visible',
	DEFAULT = 'default',
	W_RESIZE = 'w-resize',
	OUTLINE = 'outline',
	OUTLINE_V = '1px dotted blue',
	ATYPE = 'atype',
    APPEND = 'append',
    INSERT_BEFORE = 'insertBefore',
    INSERT_AFTER = 'insertAfter',
    BEFORE = 'before',
    NAVBAR = '_navbar',
	TEXT_OVERFLOW = 'text-overflow',
	RECORD_ID = 'recordid',
	DATA_INDEX = 'dataindex',
	ROW_SELECT = 'row-selected',
	REQUIRED = 'required',
	ITEM_NOT_BLANK='item-notBlank',
    ITEM_INVALID = 'item-invalid',
    ROW_ALT = 'row-alt',
    GRID_ROWBOX = 'grid-rowbox',
    $GRID_ROWBOX = _O + GRID_ROWBOX,//'.grid-rowbox'
    GRID$ROWCHECK = 'grid.rowcheck',
    GRID$ROWRADIO = 'grid.rowradio',
    GRID$HEAD = 'grid.head',
	GRID_CKB = 'grid-ckb ',
    GRID_SELECT_ALL = 'grid-select-all',
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
    ITEM_RADIO_IMG_READONLY_U = ITEM_RADIO_IMG + READONLY + U,//'item-radio-img-readonly-u'
    $ITEM_CKB_SELF_S$ITEM_CKB_C = $ITEM_CKB_SELF+ _S + _O +ITEM_CKB_C,//'.item-ckb-self .item-ckb-c'
    GRID_CELL = 'grid-cell',
    CELL_EDITOR= 'cell-editor',
    CELL_CHECK = 'cellcheck',
    ROW_CHECK = 'rowcheck',
    ROW_RADIO = 'rowradio',
    ROW_NUMBER = 'rownumber',
    GRID = 'grid-',
    GRN_ROW_NUMBER	= GRID+ROW_NUMBER,//'grid-rownumber'
    DESC = 'desc',
    ASC = 'asc',
    GRID_DESC = GRID + DESC,//'grid-desc'
    GRID_ASC = GRID + ASC,//'grid-asc'
    EVT_CLICK = 'click',
    EVT_DBLCLICK = 'dblclick',
    EVT_CELL_CLICK = 'cellclick',
    EVT_RENDER = 'render',
    EVT_ROW_CLICK = 'rowclick',
    EVT_EDITOR_SHOW = 'editorshow',
    EVT_NEXT_EDITOR_SHOW = 'nexteditorshow',
    EVT_KEY_DOWN = 'keydown',
    EVT_SELECT = 'select',
    EVT_MOUSE_DOWN = 'mousedown',
    EVT_MOUSE_MOVE = 'mousemove',
    EVT_MOUSE_UP = 'mouseup',
    NOT_FOUND = '未找到',
    METHOD = '方法!',
    SELECT_TR_CLASS='tr[class!=grid-hl]',
    SELECT_DIV_ATYPE='div[atype=grid.headcheck]',
    SELECT_DATAINDEX = '['+DATA_INDEX+'=',//'[dataindex='
    SELECT_TH_DATAINDEX = TH+SELECT_DATAINDEX,//'th[dataindex='
    SELECT_TD_DATAINDEX = TD+SELECT_DATAINDEX;//'td[dataindex='

/**
 * @class Aurora.Grid
 * @extends Aurora.Component
 * <p>Grid 数据表格组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Grid = Ext.extend($A.Component,{
    constructor: function(config){
//        this.overId = null;
        this.selectedId = null;
        this.lockWidth = 0;
        this.autofocus = config.autofocus||true;
        this.defaultColumnOptions = {
    		autoadjust: true,
			forexport: true,
			hidden: false,
			lock: false,
			resizable: true,
			rowspan: 1,
			sortable: true,
			width: 100
    	}
        $A.Grid.superclass.constructor.call(this,config);
    },
    initComponent:function(config){
        $A.Grid.superclass.initComponent.call(this, config);
        var wp = this.wrap;
        this.wb = Ext.get(this.id+'_wrap');
        this.fb = this.wb.child('div[atype=grid.fb]');
        if(this.fb){
            this.uf = this.fb.child('div[atype=grid.uf]');
        }
        this.uc = wp.child('div[atype=grid.uc]');
        this.uh = wp.child('div[atype=grid.uh]');
        this.ub = wp.child('div[atype=grid.ub]'); 
        this.uht = wp.child('table[atype=grid.uht]'); 
        
        this.lc = wp.child('div[atype=grid.lc]'); 
        this.lh = wp.child('div[atype=grid.lh]');
        this.lb = wp.child('div[atype=grid.lb]');
        this.lht = wp.child('table[atype=grid.lht]'); 

        this.sp = wp.child('div[atype=grid.spliter]');
        Ext.getBody().insertFirst(this.sp)
        this.fs = wp.child('a[atype=grid.focus]');
        
        this.classfiyColumns();
        this.initTemplate();
    },
    processListener: function(ou){
    	$A.Grid.superclass.processListener.call(this, ou);
        this.wrap[ou]("mouseover", this.onMouseOver, this)
        	[ou]("mouseout", this.onMouseOut, this)
        	[ou](EVT_CLICK,this.focus,this);
        if(!(this.canwheel === false)){
        	this.wb[ou]('mousewheel',this.onMouseWheel,this);
        }
        this.fs[ou](Ext.isOpera ? "keypress" : EVT_KEY_DOWN, this.handleKeyDown,  this);
        this.ub[ou]('scroll',this.syncScroll, this)
        	[ou](EVT_CLICK,this.onClick, this)
        	[ou](EVT_DBLCLICK,this.onDblclick, this);
        this.uht[ou](EVT_MOUSE_MOVE,this.onUnLockHeadMove, this);
        this.uh[ou](EVT_MOUSE_DOWN, this.onHeadMouseDown,this)
        	[ou](EVT_CLICK, this.onHeadClick,this);
        if(this.lb){
            this.lb[ou](EVT_CLICK,this.onClick, this)
            	[ou](EVT_DBLCLICK,this.onDblclick, this);
        }
        if(this.lht) this.lht[ou](EVT_MOUSE_MOVE,this.onLockHeadMove, this);
        if(this.lh)
        	this.lh[ou](EVT_MOUSE_DOWN, this.onHeadMouseDown,this)
        		[ou](EVT_CLICK, this.onHeadClick,this);
        this[ou](EVT_CELL_CLICK,this.onCellClick,this);
    },
    initEvents:function(){
        $A.Grid.superclass.initEvents.call(this);
        this.addEvents(
        /**
         * @event render
         * grid渲染出数据后触发该事件
         * @param {Aurora.Grid} grid 当前Grid组件.
         */
        EVT_RENDER,
        /**
         * @event keydown
         * 键盘按下事件.
         * @param {Aurora.Grid} grid 当前Grid组件.
         * @param {EventObject} e 鼠标事件对象.
         */
        EVT_KEY_DOWN,
        /**
         * @event dblclick
         * 鼠标双击事件.
         * @param {Aurora.Grid} grid 当前Grid组件.
         * @param {Aurora.Record} record 鼠标双击所在行的Record对象.
         * @param {Number} row 行号.
         * @param {String} 当前name.
         */
        EVT_DBLCLICK,
        /**
         * @event cellclick
         * 单元格点击事件.
         * @param {Aurora.Grid} grid 当前Grid组件.
         * @param {Number} row 行号.
         * @param {String} 当前name.
         * @param {Aurora.Record} record 鼠标点击所在单元格的Record对象.
         */
        EVT_CELL_CLICK,
        /**
         * @event rowclick
         * 行点击事件.
         * @param {Aurora.Grid} grid 当前Grid组件.
         * @param {Number} row 行号.
         * @param {Aurora.Record} record 鼠标点击所在行的Record对象.
         */
        EVT_ROW_CLICK,
        /**
         * @event editorShow
         * 编辑器显示后触发的事件.
         * @param {Aurora.Grid} grid 当前Grid组件.
         * @param {Editor} grid 当前Editor组件.
         * @param {Number} row 行号.
         * @param {String} 当前name.
         * @param {Aurora.Record} record 鼠标点击所在行的Record对象.
         */
        EVT_EDITOR_SHOW,
        /**
         * @event nexteditorshow
         * 切换下一个编辑器的事件.
         * @param {Aurora.Grid} grid 当前Grid组件.
         * @param {Number} row 行号.
         * @param {String} 当前name.
         */
        EVT_NEXT_EDITOR_SHOW);
    },
    syncScroll : function(){
        this.hideEditor();
        this.uh.dom.scrollLeft = this.ub.dom.scrollLeft;
        if(this.lb) this.lb.dom.scrollTop = this.ub.dom.scrollTop;
        if(this.uf) this.uf.dom.scrollLeft = this.ub.dom.scrollLeft;
    },
    handleKeyDown : function(e){
        var key = e.getKey(),ds = this.dataset;
        if(e.ctrlKey&&e.keyCode == 86&&this.canpaste){
            var text = window.clipboardData.getData('text');
            if(text){
                Ext.each(text.split('\n'),function(row){
                    var	values = row.split('\t');
                    if(values==_N)return;
                    var data = {},v=0; 
                    Ext.each(this.columns,function(c){
                        if(this.isFunctionCol(c.type)) return;
                        if(c.hidden !== true) {
                            data[c.name] = values[v];
                            v++
                        }
                    },this)
                    ds.create(data);
                },this);
            }
        }else{
            if(key == 38 || key == 40 || key == 33 || key == 34) {
                if(ds.loading == true) return;
//                var row;
                switch(e.getKey()){
                    case 33:
                        ds.prePage();
                        break;
                    case 34:
                        ds.nextPage();
                        break;
                    case 38:
                        ds.pre();
                        break;
                    case 40:
                        ds.next();
                        break;
                }
            }
        }
        this.fireEvent(EVT_KEY_DOWN, this, e)
    },
    processDataSetLiestener: function(ou){
        var ds = this.dataset;
        if(ds){
        	ds[ou]('ajaxfailed', this.onAjaxFailed, this);
            ds[ou]('metachange', this.onRefresh, this);
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
            ds[ou]('refresh',this.onRefresh,this);
            ds[ou]('fieldchange', this.onFieldChange, this);
            ds[ou]('indexchange', this.onIndexChange, this);
            ds[ou]('select', this.onSelect, this);
            ds[ou]('unselect', this.onUnSelect, this);
            ds[ou]('selectall', this.onSelectAll, this);
            ds[ou]('unselectall', this.onUnSelectAll, this);
        }
    },
    bind : function(ds){
        if(Ext.isString(ds)){
            ds = $(ds);
            if(!ds) return;
        }
//        var sf = this;
        this.dataset = ds;
        if(ds.autopagesize===true){
        	ds.pagesize=Math.round(((this.ub.getHeight()||parseFloat(this.ub.dom.style.height))-16)/25);
        }
        this.processDataSetLiestener(ON);
        this.onLoad();
//        Ext.onReady(function(){
//            sf.onLoad();
//        })
    },
    initTemplate : function(){
        this.rowTdTpl = new Ext.Template(['<td ',ATYPE,'="{',ATYPE,'}" class="',GRID_ROWBOX,'" ',RECORD_ID,'="{',RECORD_ID,'}">']);
        this.rowNumTdTpl = new Ext.Template(['<td style="text-align:{align}" class="',GRN_ROW_NUMBER,'" ',ATYPE,'="',GRN_ROW_NUMBER,'" ',RECORD_ID,'="{',RECORD_ID,'}">']);
        this.rowNumCellTpl = new Ext.Template(['<div style="',WIDTH,':{',WIDTH,'}px">{text}</div>']);
        this.tdTpl = new Ext.Template(['<td style="visibility:{visibility};text-align:{align}" ',DATA_INDEX,'="{name}" ',ATYPE,'="',GRID_CELL,'" ',RECORD_ID,'="{',RECORD_ID,'}">']);
        this.cellTpl = new Ext.Template(['<div class="',GRID_CELL,' {cellcls}" style="',WIDTH,':{',WIDTH,'}px" id="',this.id,'_{name}_{recordid}" title="{title}"><span>{text}</span></div>']);        
        this.cbTpl = new Ext.Template(['<center><div class="{cellcls}" id="',this.id,'_{name}_{',RECORD_ID,'}"></div></center>']);
    },
    getCheckBoxStatus: function(record, name ,readonly) {
        var field = this.dataset.getField(name),
        	cv = field.getPropertity(CHECKED_VALUE),
//        	uv = field.getPropertity('uncheckedvalue'),
        	value = record.data[name];
        return ITEM_CKB+(readonly?READONLY:_N)+((value && value == cv) ? C : U);
    },
    createTemplateData : function(col,record){
    	return {
            width:col.width-2,
            recordid:record.id,
            visibility: col.hidden === true ? HIDDEN : VISIBLE,
            name:col.name
        }
    },
    createCell : function(col,record,includTd){
        var data = this.createTemplateData(col,record),
       		cellTpl,
        	tdTpl = this.tdTpl,
        	cls = _N, //col.editor ? CELL_EDITOR : 
        	xtype = col.type,
        	readonly,
        	editor = this.getEditor(col,record),
        	sb = [];
        if(editor!=_N){
        	var edi = $A.CmpManager.get(editor);
        	//这里对于checkbox可能会存在问题
            if(edi && (edi instanceof $A.CheckBox)){
                xtype = CELL_CHECK;
            }else{
                cls = CELL_EDITOR;
            }
        }else if(col.name && Ext.isDefined(record.getField(col.name).get(CHECKED_VALUE))){
    		xtype = CELL_CHECK;
    		readonly=true;
        }
        if(xtype == ROW_CHECK || xtype == ROW_RADIO){
        	readonly = this.dataset.execSelectFunction(record)?_N:READONLY;
            tdTpl = this.rowTdTpl;
            data = Ext.apply(data,{
                align:CENTER,
                atype:xtype == ROW_CHECK?GRID$ROWCHECK:GRID$ROWRADIO,
                cellcls: xtype == ROW_CHECK?GRID_CKB+ITEM_CKB+readonly+U:'grid-radio '+ITEM_RADIO_IMG+readonly+U
            })
            cellTpl = this.cbTpl;
        }else if(xtype == CELL_CHECK){
            data = Ext.apply(data,{
                align:CENTER,
                cellcls: GRID_CKB + this.getCheckBoxStatus(record, col.name ,readonly) //+((cls==_N) ? ' disabled ' : _N )
            })
            cellTpl = this.cbTpl;
        }else{
            var field = record.getMeta().getField(col.name);
            if(field && Ext.isEmpty(record.data[col.name]) && record.isNew == true && field.get(REQUIRED) == true){
                cls = cls + _S + ITEM_NOT_BLANK
            }
            var sp = (cls.indexOf(CELL_EDITOR)!=-1) ? 5 : 2,
            	t = this.renderText(record,col,record.data[col.name]);
            data = Ext.apply(data,{
                align:col.align||LEFT,
                cellcls: cls,
//                width:col.width-4,//-11
                width:data.width-sp,//-11
                text:t,
                title:String(t).replace(/<[^<>]*>/mg,_N)
            })
            cellTpl =  this.cellTpl;
            if(xtype == ROW_NUMBER) {
                tdTpl = this.rowNumTdTpl;
                cellTpl = this.rowNumCellTpl;
            }
        }
        if(includTd)sb.push(tdTpl.applyTemplate(data));
        sb.push(cellTpl.applyTemplate(data));
        if(includTd)sb.push('</td>')
        return sb.join(_N);
    },
    createRow : function(type, row, cols, item){
        var css=this.parseCss(this.renderRow(item,row)),
        	sb = ['<tr id="',this.id,type,item.id,'" class="',(row % 2==0 ? _N : ROW_ALT),css.cls,'"','style="',css.style,'">'];
        for(var i=0,l=cols.length;i<l;i++){
            sb.push(this.createCell(cols[i],item, true))           
        }
        sb.push('</tr>');
        return sb.join(_N);
    },
    parseCss:function(css){
    	var style=_N,cls=_N;
    	if(Ext.isArray(css)){
    		for(var i=0;i<css.length;i++){
    			var _css=this.parseCss(css[i]);
    			style+=";"+_css.style;
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
    createTH : function(cols){
        var sb = ['<tr class="grid-hl">'];
        for(var i=0,l=cols.length;i<l;i++){
            var c = cols[i];
            sb.push('<th ',DATA_INDEX,'="',c.name,'" style="height:0px;width:',c.hidden === true?0:c.width,PX,'"></th>');
        }
        sb.push('</tr>');
        return sb.join(_N);
    },
    onBeforeRemove : function(){
        $A.Masker.mask(this.wb,_lang['grid.mask.remove']);
    },
    onBeforeLoad : function(){
    	this.ub.scrollTo(LEFT,0);
    	this.uh.scrollTo(LEFT,0);
        $A.Masker.mask(this.wb,_lang['grid.mask.loading']);
    },
    onBeforSubmit : function(ds){
    	$A.Masker.mask(this.wb,_lang['grid.mask.submit']);
    },
    onAfterSuccess : function(){
        $A.Masker.unmask(this.wb);
    },
    preLoad : function(){},
    onLoad : function(){
    	this.isSelectAll = false;
    	this.clearDomRef();
    	this.preLoad();
        var cb = this.wrap.removeClass(GRID_SELECT_ALL).child(SELECT_DIV_ATYPE);
        if(cb && this.selectable && this.selectionmodel==MULTIPLE)this.setCheckBoxStatus(cb,false);
        if(this.lb)
        this.renderLockArea();
        this.renderUnLockAread();
//        if(focus !== false) this.focus.defer(10,this);//获取数据后的获得焦点,会引起其他编辑器无法编辑
        this.drawFootBar();
        $A.Masker.unmask(this.wb);
        this.fireEvent(EVT_RENDER,this)
    },
    clearDomRef : function(){
    	this.selectlockTr = null;
        this.selectUnlockTr = null;
    },
    onAjaxFailed : function(res,opt){
        $A.Masker.unmask(this.wb);
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
    focus: function(){    	
        this.fs.focus();
    },
    renderLockArea : function(){
        var cols = this.lockColumns,
        	sb = ['<TABLE cellSpacing="0" atype="grid.lbt" cellPadding="0" border="0"  ',WIDTH,'="',this.lockWidth,'"><TBODY>',this.createTH(cols)];
//        var v = 0;
//        var columns = this.lockColumns;
//        for(var i=0,l=columns.length;i<l;i++){
//            cols.add(columns[i]);
//            if(columns[i].hidden !== true) v += columns[i].width;            
//        }
//        this.lockWidth = v;
    	Ext.each(this.dataset.data,function(d,i){
    		sb.push(this.createRow($L, i, cols, d));
    	},this);
        sb.push('</TBODY></TABLE><DIV style="height:17px"></DIV>');
        this.lbt = this.lb.update(sb.join(_N)).child('table[atype=grid.lbt]'); 
    },
    renderUnLockAread : function(){
        var cols = this.unlockColumns,
        	sb = ['<TABLE cellSpacing="0" atype="grid.ubt" cellPadding="0" border="0" ',WIDTH,'="',this.unlockWidth,'"><TBODY>',this.createTH(cols)];
//        var v = 0;
//        var columns = this.unlockColumns;
//        for(var i=0,l=columns.length;i<l;i++){
//            cols.add(columns[i]);
//            if(columns[i].hidden !== true) v += columns[i].width;            
//        }
        Ext.each(this.dataset.data,function(d,i){
    		sb.push(this.createRow($U, i, cols, d));
    	},this);
        sb.push('</TBODY></TABLE>');
        this.ubt = this.ub.update(sb.join(_N)).child('table[atype=grid.ubt]'); 
    },
    isOverSplitLine : function(x){
        var v = 0,      
        	isOver = false;
        this.overColIndex = -1;
        Ext.each(this.columns,function(c,i){
            if(c.hidden !== true) v += c.width;
            if(x < v+3 && x > v-3 && c.resizable != false){
                isOver = true;
                this.overColIndex = i;
                return false;
            }
        },this);
        return isOver;
    },
    onRefresh : function(){
        this.onLoad(false);
        if(this.selectable)
        for(var i=0,ds=this.dataset,s=ds.selected,l=s.length;i<l;i++){
            this.onSelect(ds, s[i]);
        }
    },
    onIndexChange:function(ds, r){
        var index = this.getDataIndex(r.id);
        if(index == -1)return;
        //if(r != this.selectRecord){
            this.selectRow(index, false);
        //}
    },
    isFunctionCol: function(t){
        return t == ROW_CHECK || t == ROW_RADIO || t == ROW_NUMBER
    },
    onAdd : function(ds,record,row){
//        if(this.lb)
//        var sb = [];var cols = [];
//        var v = 0;
        var columns = this.columns,
        	isAdd = row === ds.data.length-1,
        	css = this.parseCss(this.renderRow(record,row)),
        	cls = (row % 2==0 ? _N : ROW_ALT+_S)+css.cls;
        if(this.lbt){
            var ltr = document.createElement(TR),
            	ltb = this.lbt.dom.tBodies[0];
            ltr.id=this.id+$L+record.id;
            ltr.className=cls;
            Ext.fly(ltr).set({style:css.style});
            Ext.each(columns,function(col){
                if(col.lock === true){
                    var td = document.createElement(TD);
                    if(col.type == ROW_CHECK) {
                        Ext.fly(td).set({recordid:record.id,atype:GRID$ROWCHECK})
                        td.className = GRID_ROWBOX;
                        if(this.isSelectAll){
                        	td.className += _S+ITEM_CKB_SELF;
                        }
                    }else if(col.type == ROW_RADIO){
                    	Ext.fly(td).set({recordid:record.id,atype:GRID$ROWRADIO})
                        td.className = GRID_ROWBOX;
                    }else{
                        if(col.hidden)td.style.visibility=HIDDEN;
                        td.style.textAlign=col.align||LEFT;
                        if(!this.isFunctionCol(col.type)) td.dataindex=col.name;
                        var data = {recordid:record.id,atype:GRID_CELL};
                        if(col.type == ROW_NUMBER) {
                            td.className = GRN_ROW_NUMBER;
                            data.atype = GRN_ROW_NUMBER;
                        }
                        Ext.fly(td).set(data); 
                    }
                    td.innerHTML = this.createCell(col,record, false);
                    ltr.appendChild(td);
                }
            },this);
            if(isAdd){
	        	ltb.appendChild(ltr);
	        }else{
	        	var trs = Ext.fly(ltb).query(SELECT_TR_CLASS);
	        	for(var i=row,l = trs.length;i<l;i++){
	        		var tr = Ext.fly(trs[i]).toggleClass(ROW_ALT);
					tr.select('.grid-rownumber div').each(function(div){
						div.update(Number(div.dom.innerHTML) + 1);
					});
					tr.select($GRID_ROWBOX).each(function(td){
						this.setSelectStatus(ds.findById(td.getAttributeNS(_N,RECORD_ID)));
					},this);
	        	}
	        	ltb.insertBefore(ltr,trs[row]);
	        }
        }
        
        var utr = document.createElement(TR),
        	utb = this.ubt.dom.tBodies[0];
        utr.id=this.id+$U+record.id;
        utr.className=cls;
        Ext.fly(utr).set({style:css.style});
        Ext.each(columns,function(col){
            if(col.lock !== true){
                var td = document.createElement(TD);
                td.style.visibility=col.hidden === true ? HIDDEN : VISIBLE;
                td.style.textAlign=col.align||LEFT;
                Ext.fly(td).set({
                    dataindex:col.name,
                    recordid:record.id,
                    atype:GRID_CELL
                })
                td.innerHTML = this.createCell(col,record,false);
                utr.appendChild(td);
            }
        },this)
        if(isAdd){
        	utb.appendChild(utr);
        }else{
        	var trs = Ext.fly(utb).query(SELECT_TR_CLASS);
        	for(var i=row,l = trs.length;i<l;i++){
				Ext.fly(trs[i]).toggleClass(ROW_ALT);    		
        	}
        	utb.insertBefore(utr,trs[row]);
        }
    	this.setSelectStatus(record);
    },
    renderEditor : function(div,record,c,editor){
    	div.parent(TD).update(this.createCell(c,record,false));
    	
    	/*
    	if(editor == _N){    	
    		div.removeClass(CELL_EDITOR);
    	}else if(editor != _N || ($(editor) instanceof $A.CheckBox)){
    		var cell = this.createCell(c,record,false);
    		div.parent().update(cell)
    	}else{
            div.addClass(CELL_EDITOR);
    	}
        */
    },
    onUpdate : function(ds,record, name, value){
        this.setSelectStatus(record);
        var div = Ext.get([this.id,name,record.id].join(_));
        if(div){
            var c = this.findColByName(name),
            	editor = this.getEditor(c,record);            
            if(editor!=_N && ($(editor) instanceof $A.CheckBox)){
            	this.renderEditor(div,record,c,editor);
            }else{
            	//考虑当其他field的值发生变化的时候,动态执行其他带有renderer的
                div.update(this.renderText(record,c,value));
            }
        }
        Ext.each(this.columns,function(c){
            if(c.name != name) {
            	var ediv = Ext.get([this.id,c.name,record.id].join(_));
            	if(ediv) {
            		if(c.editorfunction){
                        this.renderEditor(ediv,record, c, this.getEditor(c,record));
            		}
                    if(c.renderer){
                        ediv.update(this.renderText(record,c, record.get(c.name)));
                    }
                }
            }
        },this);
        this.drawFootBar(name);
    },
    onValid : function(ds, record, name, valid){
        var c = this.findColByName(name);
//      if(c&&c.editor){
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
    onRemove : function(ds,record,index){
        var lrow = Ext.get(this.id+$L+record.id),
        	urow = Ext.get(this.id+$U+record.id);
        if(lrow)lrow.remove();        
        if(urow)urow.remove();
        if(Ext.isIE||Ext.isIE9)this.syncScroll();
        this.clearDomRef();
        $A.Masker.unmask(this.wb);
        this.drawFootBar();
    },
    onClear : function(){
        
    },
    onFieldChange : function(ds, record, field, type, value){
        if(type == REQUIRED){
           var div = Ext.get([this.id,field.name,record.id].join(_));
           if(div) {
               div[value==true?'addClass':'removeClass'](ITEM_NOT_BLANK);
           }
        }
    },
//  onRowMouseOver : function(e){
//      if(Ext.fly(e.target).hasClass('grid-cell')){
//          var rid = Ext.fly(e.target).getAttributeNS("","recordid");
//          var row = this.getDataIndex(rid);
//          if(row == -1)return;
//          if(rid != this.overId)
//          if(this.overlockTr) this.overlockTr.setStyle(this.bgc, this.selectedId ==this.overId ? '#ffe3a8' : _N);
//          if(this.overUnlockTr)  this.overUnlockTr.setStyle(this.bgc,this.selectedId ==this.overId ? '#ffe3a8' : _N);
//          this.overId = rid;
//          this.overlockTr = Ext.get(document.getElementById(this.id+'$l-'+rid));
//          if(this.overlockTr)this.overlockTr.setStyle(this.bgc,'#d9e7ed');
//          this.overUnlockTr = Ext.get(document.getElementById(this.id+'$u-'+rid));
//          this.overUnlockTr.setStyle(this.bgc,'#d9e7ed');
//      }
//  },
    getDataIndex : function(rid){
        for(var i=0,data = this.dataset.data,l=data.length;i<l;i++){
            if(data[i].id == rid){
                return i;
            }
        }
        return -1;
    },
    onSelect : function(ds,record,isSelectAll){
        if(!record||isSelectAll)return;
        var cb = Ext.get(this.id+__+record.id);
        cb.parent($GRID_ROWBOX).addClass(ITEM_CKB_SELF);
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
        cb.parent($GRID_ROWBOX).addClass(ITEM_CKB_SELF);
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
    	this.wrap.addClass(GRID_SELECT_ALL);
    },
    onUnSelectAll : function(){
    	this.clearChecked();
    	this.isSelectAll = false;
    	this.isUnSelectAll = true;
    	this.wrap.removeClass(GRID_SELECT_ALL);
    },
    clearChecked : function(){
    	var w = this.wrap;
		w.select($ITEM_CKB_SELF_S$ITEM_CKB_C).replaceClass(ITEM_CKB_C,ITEM_CKB_U);
		w.select($ITEM_CKB_SELF).removeClass(ITEM_CKB_SELF);
    },
    onDblclick : function(e,t){
        var target = Ext.fly(t).parent('td[atype=grid-cell]');
        if(target){
            var ds = this.dataset,
            	rid = target.getAttributeNS(_N,RECORD_ID),
            	record = ds.findById(rid),
            	row = ds.indexOf(record),
            	name = target.getAttributeNS(_N,DATA_INDEX);
            this.fireEvent(EVT_DBLCLICK, this, record, row, name)
        }
    },
    onClick : function(e,t) {
        var target = Ext.fly(t).parent(TD);
        if(target){
            var atype = target.getAttributeNS(_N,ATYPE),
            	rid = target.getAttributeNS(_N,RECORD_ID),
            	ds = this.dataset;
            if(atype==GRID_CELL){
                var record = ds.findById(rid),
                	row = ds.indexOf(record),
                	name = target.getAttributeNS(_N,DATA_INDEX);
                this.fireEvent(EVT_CELL_CLICK, this, row, name, record);
                //this.adjustColumn(name);
                //this.showEditor(row,name);
                this.fireEvent(EVT_ROW_CLICK, this, row, record);
            }else if (atype == GRN_ROW_NUMBER){
                var record = ds.findById(rid),
                	row = ds.indexOf(record);
                if(record.id != this.selectedId) this.selectRow(row);
            }else if(atype==GRID$ROWCHECK){               
                var cb = Ext.get(this.id+__+rid);
                if(cb.hasClass(ITEM_CKB_READONLY_U)||cb.hasClass(ITEM_CKB_READONLY_C))return;
                if(this.isSelectAll && !cb.parent($ITEM_CKB_SELF)){
                	cb.replaceClass(ITEM_CKB_U,ITEM_CKB_C);	
                }else if(this.isUnselectAll && !cb.parent($ITEM_CKB_SELF)){
            		cb.replaceClass(ITEM_CKB_C,ITEM_CKB_U);	
                }
                cb.hasClass(ITEM_CKB_C) ? ds.unSelect(rid) : ds.select(rid);
            }else if(atype==GRID$ROWRADIO){
            	var cb = Ext.get(this.id+__+rid);
                if(cb.hasClass(ITEM_RADIO_IMG_READONLY_U)||cb.hasClass(ITEM_RADIO_IMG_READONLY_C))return;
                ds.select(rid);
            }
        }
    },
    onCellClick : function(grid,row,name,record,callback){
    	this.adjustColumn(name);
    	this.showEditor(row,name,callback);
    },
    adjustColumn:function(name){
    	var col = this.findColByName(name);
    	if(!col || !col.autoadjust)return;
    	var th = this.wrap.select('tr.grid-hl '+SELECT_TH_DATAINDEX+name+_K),
    		w = Ext.fly(th.elements[0]).getWidth(),
    		max = w,
    		margin = 12,
    		width = this.width - (this.selectable?23:0) - 20;
    	this.wrap.select(SELECT_TD_DATAINDEX+name+'] span').each(function(span){
			if(Ext.isIE || Ext.isIE9)span.parent().setStyle(TEXT_OVERFLOW,'clip');
    		max = Math.max(span.getWidth()+margin,max);
    		if(Ext.isIE || Ext.isIE9)span.parent().setStyle(TEXT_OVERFLOW,_N);
    		if(max > width){
    			max = width;
    			return false
    		}
    	});
    	if(max > w)this.setColumnSize(name,max);
    },
    /**
     * 设置指定name列的标题.
     * 
     * @param {String} name 列的name
     * @param {String} prompt 标题信息
     */
    setColumnPrompt: function(name,prompt){
    	this.wrap.select('td.grid-hc'+SELECT_DATAINDEX+name+'] div').update(prompt);
//        var tds = Ext.DomQuery.select('td.grid-hc',this.wrap.dom);
//        for(var i=0,l=tds.length;i<l;i++){
//            var td = tds[i];
//            var dataindex = Ext.fly(td).getAttributeNS("","dataindex");
//            if(dataindex==name){
//            	var div = Ext.fly(td).child('div');
//            	div.update(prompt)
//                break;
//            }
//        }
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
            if(editor == _N){
            	div.removeClass(CELL_EDITOR);
            }else if(!$(editor) instanceof $A.CheckBox){
            	div.addClass(CELL_EDITOR);
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
        var record = this.dataset.getAt(row);
        if(!record)return;
        if(record.id != this.selectedId) this.selectRow(row);
        else this.focusRow(row);
        this.focusColumn(name);
        var editor = this.getEditor(col,record);
        this.setEditor(name, editor);
        var sf = this;
        if(sf.currentEditor){
        	sf.currentEditor.editor.el.un(EVT_KEY_DOWN, sf.onEditorKeyDown,sf);
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
                	dom = Ext.get([sf.id,name,record.id].join(_)),
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
		        	ed.el.on(EVT_KEY_DOWN, sf.onEditorKeyDown,sf);
		        	ed.onClick();
		        	sf.currentEditor.focusCheckBox = dom;
	        		dom.setStyle(OUTLINE,OUTLINE_V);
//		            var field = sf.dataset.getField(name)
//		            var cv = field.getPropertity(CHECKED_VALUE);
//		            var uv = field.getPropertity('uncheckedvalue');
//		            var v = record.get(name);
//		            record.set(name, v == cv ? uv : cv);
	       		}else{
	       			var p = dom.parent();
	       			ed.move(xy[0],xy[1]);
                    ed.setHeight(p.getHeight()-5)
                    ed.setWidth(p.getWidth()-7);
                    ed.isEditor = true;
                    ed.isFireEvent = true;
                    ed.isHidden = false;
                    ed.focus();
       				sf.editing = true;
                    ed.el.on(EVT_KEY_DOWN, sf.onEditorKeyDown,sf);
                    ed.on(EVT_SELECT,sf.onEditorSelect,sf);
                    Ext.get(document.documentElement).on(EVT_MOUSE_DOWN, sf.onEditorBlur, sf);
                    if(callback)callback.call(window,ed)
	                sf.fireEvent(EVT_EDITOR_SHOW, sf, ed, row, name, record);
       			}
            },10)
        }           
    },
    onEditorSelect : function(){
		var sf =this;
		setTimeout(function(){sf.hideEditor()},1);
    },
    onEditorKeyDown : function(e){
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
	                	sf.currentEditor.editor.el.un(EVT_KEY_DOWN, sf.onEditorKeyDown,sf);
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
		                		var dom = Ext.get([sf.id,name,r.id].join(_)),
		                			xy = dom.getXY();
		                		ed.move(-1000,xy[1])
		                		ed.focus();
		                		ed.el.on(EVT_KEY_DOWN, sf.onEditorKeyDown,sf);
		                		sf.currentEditor.focusCheckBox = dom;
		                		dom.setStyle(OUTLINE,OUTLINE_V);
	                		},10)
	                	}else{
		                    sf.fireEvent(EVT_CELL_CLICK, sf, row, name, r ,callback);
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
					                		var dom = Ext.get([sf.id,name,nr.id].join(_)),
					                			xy = dom.getXY();
					                		ed.move(-1000,xy[1])
					                		ed.focus();
					                		ed.el.on(EVT_KEY_DOWN, sf.onEditorKeyDown,sf);
					                		sf.currentEditor.focusCheckBox = dom;
					                		dom.setStyle(OUTLINE,OUTLINE_V);
				                		},10)
				                	}else{
		                                sf.fireEvent(EVT_CELL_CLICK, sf, row+1, name, nr ,callback);
		                                //this.showEditor(row+1,name,callback);
				                	}
	                                break;
	                            }
	                        }
	                    }
	                }
	            }
	            sf.fireEvent(EVT_NEXT_EDITOR_SHOW,sf, row, name);
        	}
        }
    },
    /**
     * 指定行获取焦点.
     * @param {Number} row
     */
    focusRow : function(row){
        var r = 25,
        	ub = this.ub,
        	stop = ub.getScroll().top,
        	h = ub.getHeight(),
        	sh = ub.dom.scrollWidth > ub.dom.clientWidth? 16 : 0;
        if(row*r<stop){
            ub.scrollTo(TOP,row*r-1)
        }else if((row+1)*r>(stop+h-sh)){//this.ub.dom.scrollHeight
            ub.scrollTo(TOP, (row+1)*r-h + sh);
        }
        if(this.autofocus)
    	this.focus();
    },
    focusColumn: function(name){
        var r = 25,
        	ub = this.ub,
        	cols = this.columns,
        	sleft = ub.getScroll().left;
        var ll = 0, tw = 0, lw = 0 , lr;
        for(var i=0,l=cols.length;i<l;i++){
            var c = cols[i];
            if(c.name == name) {
//          if(c.name && c.name.toLowerCase() == name.toLowerCase()) {
                tw = c.width;
            }
            if(c.hidden !== true){
                if(c.lock === true){
                    lw += c.width;
                }else{
                    if(tw==0) ll += c.width;
                }
            }
        }
        lr = ll + tw;
        if(ll<sleft){
            ub.scrollTo(LEFT,ll);
        }else if((lr-sleft)>(this.width-lw)){
            ub.scrollTo(LEFT,lr  - this.width + lw + (ub.dom.scrollHeight > ub.dom.clientHeight? 16 : 0));
        }
        if(this.autofocus)
    	this.focus();
    },
    /**
     * 隐藏当前编辑器
     */
    hideEditor : function(){
        if(this.currentEditor && this.editing){
            var ed = this.currentEditor.editor;
            if(ed){
	            //ed.un('blur',this.onEditorBlur, this);
//	            var needHide = true;
//	            if(ed.canHide){
//	                needHide = ed.canHide();
//	            }
	            if(!ed.canHide || ed.canHide()) {
	                ed.el.un(EVT_KEY_DOWN, this.onEditorKeyDown,this);
	                ed.un(EVT_SELECT,this.onEditorSelect,this);
	                Ext.get(document.documentElement).un(EVT_MOUSE_DOWN, this.onEditorBlur, this);
//	                var ed = this.currentEditor.editor;
	                ed.move(-10000,-10000);
	                ed.onBlur();
	                ed.isFireEvent = false;
	                ed.isHidden = true;
	                this.editing = false;
	            }
            }
        }
    },
    onEditorBlur : function(e,t){
        if(this.currentEditor && !this.currentEditor.editor.isEventFromComponent(t)) {  
            this.hideEditor.defer(Ext.isIE9?10:0,this);
        }
    },
    onLockHeadMove : function(e){
//      if(this.draging)return;
        this.hmx = e.xy[0] - this.lht.getXY()[0];
        this.lh.setStyle(CURSOR,this.isOverSplitLine(this.hmx)?W_RESIZE:DEFAULT);          
    },
    onUnLockHeadMove : function(e){
//      if(this.draging)return;
        var uht = this.uht;
        this.hmx = e.xy[0] - (uht?uht.getXY()[0] + uht.getScroll().left:0) + this.lockWidth;
        this.uh.setStyle(CURSOR,this.isOverSplitLine(this.hmx)?W_RESIZE:DEFAULT);          
    },
    onHeadMouseDown : function(e){
        this.dragWidth = -1;
        if(this.overColIndex == undefined || this.overColIndex == -1) return;
        this.dragIndex = this.overColIndex;
        this.dragStart = e.getXY()[0];
        this.sp.setHeight(this.wrap.getHeight())
        	.show()
        	.setStyle({top:this.wrap.getXY()[1]+PX,left:e.xy[0]+PX});
        Ext.get(document.documentElement)
        	.on(EVT_MOUSE_MOVE, this.onHeadMouseMove, this)
        	.on(EVT_MOUSE_UP, this.onHeadMouseUp, this);
    },
    onHeadClick : function(e,t){
        var target = Ext.fly(t).parent(TD),
        	ds = this.dataset,
        	atype;
        if(target) {
            atype = target.getAttributeNS(_N,ATYPE);
        }
        if(atype==GRID$HEAD){
            var index = target.getAttributeNS(_N,DATA_INDEX),
            	col = this.findColByName(index);
            if(col && col.sortable === true){
            	if(ds.isModified()){
                    $A.showInfoMessage('提示', '有未保存数据!');
                    return;
            	}
                var d = target.child(DIV),
                	of = index,
                	ot = _N;
//                this.dataset.setQueryParameter('ORDER_FIELD', index);
                if(this.currentSortTarget){
                    this.currentSortTarget.removeClass([GRID_ASC,GRID_DESC]);
                }
                this.currentSortTarget = d;
                if(Ext.isEmpty(col.sorttype)) {
                    col.sorttype = DESC
                    d.removeClass(GRID_ASC).addClass(GRID_DESC);
                    ot = DESC;
//                    this.dataset.setQueryParameter('ORDER_TYPE', 'desc');
                } else if(col.sorttype == DESC){
                    col.sorttype = ASC;
                    d.removeClass(GRID_DESC).addClass(GRID_ASC);
                    ot = ASC;
//                    this.dataset.setQueryParameter('ORDER_TYPE', 'asc');
                }else {
                    col.sorttype = _N;
                    d.removeClass([GRID_DESC,GRID_ASC]);
//                    delete this.dataset.qpara['ORDER_TYPE'];
                }
//                if(this.dataset.getAll().length!=0)this.dataset.query();
                ds.sort(of,ot);
            }
        }else if(atype==GRID$ROWCHECK){
            var cb = target.child(SELECT_DIV_ATYPE);
            if(cb){
                var checked = cb.hasClass(ITEM_CKB_C);
                this.setCheckBoxStatus(cb,!checked);
                if(!checked){
                    ds.selectAll();
                }else{
                    ds.unSelectAll();
                }
            }
        }
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
    onHeadMouseMove: function(e){
//      this.draging = true
        e.stopEvent();
        this.dragEnd = e.getXY()[0];
        var move = this.dragEnd - this.dragStart,
        	c = this.columns[this.dragIndex],
        	w = c.width + move;
        if(w > 30 && w < this.width) {
            this.dragWidth = w;
            this.sp.setStyle(LEFT, e.xy[0]+PX)
        }
    },
    onHeadMouseUp: function(e){
//      this.draging = false;
        Ext.get(document.documentElement).un(EVT_MOUSE_MOVE, this.onHeadMouseMove, this)
        	.un(EVT_MOUSE_UP, this.onHeadMouseUp, this);      
        this.sp.hide();
        if(this.dragWidth != -1)
        this.setColumnSize(this.columns[this.dragIndex].name, this.dragWidth);
        this.syncScroll();
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
    /**
     * 选中高亮某行.
     * @param {Number} row 行号
     */
    selectRow : function(row, locate){
        var ds = this.dataset,record = ds.getAt(row),
        	r = (ds.currentPage-1)*ds.pagesize + row+1;
        this.selectedId = record.id;
        if(this.selectlockTr) this.selectlockTr.removeClass(ROW_SELECT);
        //if(this.selectUnlockTr) this.selectUnlockTr.setStyle(this.bgc,_N);
        if(this.selectUnlockTr) this.selectUnlockTr.removeClass(ROW_SELECT);
        this.selectUnlockTr = Ext.get(this.id+$U+record.id);
        if(this.selectUnlockTr)this.selectUnlockTr.addClass(ROW_SELECT);
        //if(this.selectUnlockTr)this.selectUnlockTr.setStyle(this.bgc,this.scor);
        
        this.selectlockTr = Ext.get(this.id+$L+record.id);
        if(this.selectlockTr)this.selectlockTr.addClass(ROW_SELECT);
        this.focusRow(row);
        this.selectRecord = record
        if(locate!==false && r != null) {
//          this.dataset.locate(r);
            ds.locate.defer(5, ds,[r,false]);
        }
    },
    /**
     * 设置某列的宽度.
     * @param {String} name 列的name
     * @param {Number} size 列的宽度
     */
    setColumnSize : function(name, size){
        var hth,bth,lw=0,uw=0;
        Ext.each(this.columns,function(c){
            if(c.name && c.name === name){
                if(c.hidden === true) return;
                c.width = size;
                if(c.lock !== true){                    
                    hth = this.uh.child(SELECT_TH_DATAINDEX+name+_K);
                    bth = this.ub.child(SELECT_TH_DATAINDEX+name+_K);                  
                }else{                          
                    if(this.lh) hth = this.lh.child(SELECT_TH_DATAINDEX+name+_K);
                    if(this.lb) bth = this.lb.child(SELECT_TH_DATAINDEX+name+_K);
                    
                }
            }
            if(c.hidden !== true){
            	c.lock !== true ? (uw += c.width) : (lw += c.width);
            }
        },this)
        this.wrap.select(SELECT_TD_DATAINDEX+name+'] DIV.grid-cell').each(function(ce){
            ce.setStyle(WIDTH, Math.max(size-(ce.hasClass(CELL_EDITOR) ? 7 : 4),0)+PX);
        },this)
        
        this.unlockWidth = uw;
        this.lockWidth = lw;
        if(hth) hth.setStyle(WIDTH, size+PX);
        if(bth) bth.setStyle(WIDTH, size+PX);
        var mlw = Math.max(this.width - lw,0);
        if(this.fb){
            this.fb.child(SELECT_TH_DATAINDEX+name+_K).setStyle(WIDTH, size+PX);
            this.uf.setStyle(WIDTH,mlw+PX);
            this.fb.child('table[atype=fb.ubt]').setStyle(WIDTH,uw+PX);
            var lft = this.fb.child('table[atype=fb.lbt]');
            if(lft){
                this.fb.child('div[atype=grid.lf]').setStyle(WIDTH,(lw-1)+PX);
                lft.setStyle(WIDTH,lw+PX);
            }
        }
        
        if(this.lc){
            var lcw = Math.max(lw-1,0);
            this.lc.setStyle({width:lcw+PX,display:lcw==0 ? NONE : _N});
        }
        if(this.lht)this.lht.setStyle(WIDTH,lw+PX);
        if(this.lbt)this.lbt.setStyle(WIDTH,lw+PX);
        this.uc.setStyle(WIDTH,mlw+PX);
        this.uh.setStyle(WIDTH,mlw+PX);
        this.ub.setStyle(WIDTH,mlw+PX);
        this.uht.setStyle(WIDTH,uw+PX);
        if(this.ubt)this.ubt.setStyle(WIDTH,uw+PX);
        this.syncSize();
    },
    drawFootBar : function(objs){
    	if(!this.fb) return;
    	Ext.each([].concat(objs ? objs : this.columns), function(obj) {
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
    syncSize : function(){
        var lw = 0;
        Ext.each(this.columns,function(c){
            if(c.hidden !== true){
                if(c.lock === true){
                    lw += c.width;
                }
            }
        });
        if(lw !=0){
            var us = this.width -lw;
            this.uc.setWidth(us);
            this.uh.setWidth(us);
            this.ub.setWidth(us);
        }
    },
    classfiyColumns : function(){
    	this.lockColumns =[],this.unlockColumns = [];
        this.lockWidth = 0,this.unlockWidth = 0;
        Ext.each(this.columns,function(c){
            if(c.lock === true){
                this.lockColumns.add(c);
                if(c.hidden !== true) this.lockWidth += c.width;
            }else{
                this.unlockColumns.add(c);
                if(c.hidden !== true) this.unlockWidth += c.width;
            }
        },this);
        this.columns = this.lockColumns.concat(this.unlockColumns);
    },
    /**
     * 显示某列.
     * 
     * @param {String} name 列的name
     */
    showColumn : function(name){
        var col = this.findColByName(name);
        if(col){
            if(col.hidden === true){
                delete col.hidden;
                this.setColumnSize(name, col.hiddenwidth||col.width);
                delete col.hiddenwidth;
//              if(!Ext.isIE){
                this.wrap.select(SELECT_TD_DATAINDEX+name+_K).show();
//                    var tds = Ext.DomQuery.select('td[dataindex='+name+']',this.wrap.dom);
//                    for(var i=0,l=tds.length;i<l;i++){
//                        var td = tds[i];
//                        Ext.fly(td).show();
//                    }
//              }
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
                col.hiddenwidth = col.width;
                this.setColumnSize(name, 0, false);
//              if(!Ext.isIE){
                this.wrap.select(SELECT_TD_DATAINDEX+name+_K).hide();
//                    var tds = Ext.DomQuery.select('td[dataindex='+name+']',this.wrap.dom);
//                    for(var i=0,l=tds.length;i<l;i++){
//                        var td = tds[i];
//                        Ext.fly(td).hide();
//                    }
//              }
                col.hidden = true;
            }
        }       
    },
    /**
     * 删除列.
     * 
     * @param {String/Array} name/names 列名/列名数组;
     */
    removeColumn : function(name){
    	var cols = this.columns,
    		lockNames = [],unLockNames=[];
		Ext.each(name,function(n){
    			col = this.findColByName(n);
    		if(!col)return;
    		if(col.lock)lockNames.push(n);
    		else unLockNames.push(n);
    		cols.splice(cols.indexOf(col),1);
		},this);
    	var lnl = lockNames.length,unl = unLockNames.length;
    	if(lnl||unl){
    		this.dataset.query();
    		this.classfiyColumns();
    		if(lnl){
    			var lw = this.lockWidth < 1 ?  1 : this.lockWidth,
    				selector = [];
    			for(var i=0;i<lnl;i++){
    				selector.push(SELECT_DATAINDEX+lockNames[i]+_K);
    			}
    			this.lht.setWidth(this.lockWidth).select(selector.join(',')).remove();
        		this.lc.setWidth(lw - 1); 
        		this.uc.setWidth(this.wrap.getWidth() - lw); 
    		}
    		if(unl){
    			var selector = [];
    			for(var i=0;i<unl;i++){
    				selector.push(SELECT_DATAINDEX+unLockNames[i]+_K);
    			}
    			this.uht.select(selector.join(',')).remove();
    		}
    		var ulw = this.unLockWidth;
    		this.uht.setWidth(ulw); 
    		this.uh.setWidth(ulw); 
    		this.ub.setWidth(ulw);
        }
    },
    createHead : Ext.isIE || Ext.isIE9 ?function(cols,method,name,parent,index){
		var trs = parent.query(TR),t = Ext.fly(trs[0]).child('th[width=20]'),tds;
		if(name)tds = parent.query(SELECT_DATAINDEX+name+_K)[0];
		if (method == INSERT_AFTER){
			tds = tds.nextSibling || null;
			index ++;
		}else if(method == APPEND){
			if(t) tds = t.dom;
			index = -1;	
		}
		Ext.each(cols,function(c){
			var	th = Ext.get(document.createElement(TH)),
				td = Ext.get(trs[1].insertCell(index)),
				w = c.width,n = c.name;
			if(index > - 1)index++;
			td.addClass('grid-hc').set({dataindex:n,atype:GRID$HEAD}).update('<div>'+c.prompt+'</div>');
			if(tds)trs[0].insertBefore(th.dom,tds)
			else trs[0].appendChild(th.dom);
			th.setStyle(WIDTH,w+PX).set({dataindex:n});
		});
    }:function(cols,method,name,parent){
    	var html = [],html2=[],
    		tds = parent.query(method != APPEND?SELECT_DATAINDEX+name+_K:TR);
		Ext.each(cols,function(c){
			html.push('<th style="width:',c.width,PX,';" ',DATA_INDEX,'="',c.name,'"></th>');
			html2.push('<td class="grid-hc" atype="grid.head" ',DATA_INDEX,'="',c.name,'"><div>',c.prompt,'</div></td>');
		});
		new Ext.Template(html.join(_N))[method](tds[0],{});
		new Ext.Template(html2.join(_N))[method](tds[1],{});
		var th = Ext.fly(tds[0]).child('th[width=20]');
		if(th)th.appendTo(Ext.fly(tds[0]));
    },
    /**
     * 增加列.
     * 
     * @param {Object/Array} options/columns 列的参数/一组列的参数;
     */
    addColumn : function(options,name,where){
    	if(this.dataset.isModified()){
            $A.showInfoMessage(_lang['grid.info'], _lang['grid.info.continue']);
        }else {
        	var cols = this.columns,
        		index = cols.length,
        		oldLock,oldIndex;
        	if(name && where){
        		var column = this.findColByName(name);
        		if(column){
	        		oldLock = column.lock;
	        		oldIndex = this[oldLock?'lockColumns':'unlockColumns'].indexOf(column);
	        		index = (where == BEFORE? 0 : 1) + cols.indexOf(column);
        		}else{
        			alert('未找到列'+name);
        			return;
        		}
        	}
        	var lockCols = [],unLockCols=[];
        	Ext.each(options,function(c){
	    		var opt = Ext.apply(Ext.apply({},this.defaultColumnOptions),c),
	    			col = this.findColByName(opt.name);
	    		if(col)return;
	    		if(opt.lock)lockCols.push(opt);
	    		else unLockCols.push(opt);
        	},this);
	    	var newCols = lockCols.concat(unLockCols);
	        if(newCols.length){
        		var method = where? (where == BEFORE?INSERT_BEFORE:INSERT_AFTER):APPEND,
        			lmethod = umethod = method,
        			lname = uname = name,
        			wp = this.wrap;
        		if(oldLock){
        			umethod = INSERT_BEFORE;
        			uname = this.unlockColumns[0].name;
        		}else{
        			lmethod = APPEND;
        			lname = null;
        		}
	        	this.columns = cols.slice(0,index).concat(newCols).concat(cols.slice(index));
	        	this.classfiyColumns();
	        	if(lockCols.length){
	        		if(!this.lht){
		        		this.lc = new Ext.Template("<DIV class='grid-la' atype='grid.lc' style='width:24px;'><DIV class='grid-lh' atype='grid.lh' unselectable='on' onselectstart='return false;' style='height:25px;'><TABLE cellSpacing='0' atype='grid.lht' cellPadding='0' border='0' style='width:25px'><TBODY><TR class='grid-hl'></TR><TR height=25></TR></TBODY></TABLE></DIV><DIV class='grid-lb' atype='grid.lb' style='width:100%;height:255px'></DIV></DIV>").insertAfter(this.fs.dom,{},true); 
				        this.lh = wp.child('div[atype=grid.lh]');
				        this.lb = wp.child('div[atype=grid.lb]');
				        this.lht = wp.child('table[atype=grid.lht]');
			            this.lb[ON](EVT_CLICK,this.onClick, this)
			            	[ON](EVT_DBLCLICK,this.onDblclick, this);
				        this.lht[ON](EVT_MOUSE_MOVE,this.onLockHeadMove, this);
				        this.lh[ON](EVT_MOUSE_DOWN, this.onHeadMouseDown,this)
				        	[ON](EVT_CLICK, this.onHeadClick,this);
	        		}
	        		this.createHead(lockCols,lmethod,lname,this.lht,oldIndex);
	        	}
	        	if(unLockCols.length){
	        		this.createHead(unLockCols,umethod,uname,this.uht,oldIndex);
	    		}
	    		if(this.lb)this.lb.update(_N);
	    		this.ub.update(_N);
	    		Ext.each(newCols,function(nc){
		        	this.setColumnSize(nc.name,nc.width)
	    		},this)
	    		this.dataset.query();
	        }
        }
    },
    /**
     * 在指定列前插入列.
     * 
     * @param {Object/Array} options/columns 列的参数/一组列的参数;
     * @param {Object} options 列的参数;
     */
    insertColumnBefore : function(name,options){
    	this.addColumn(options,name,BEFORE);
    },
    /**
     * 在指定列后插入列.
     * 
     * @param {Object/Array} options/columns 列的参数/一组列的参数;
     * @param {String} name 指定列的列名;
     */
    insertColumnAfter : function(name,options){
    	this.addColumn(options,name,1);
    },
    setWidth: function(w){
    	if(this.width == w) return;
        this.width = w;
        this.wrap.setWidth(w);
        var tb = $A.CmpManager.get(this.id+TB)
        if(tb)tb.setWidth(w);
        var nb = $A.CmpManager.get(this.id+NAVBAR)
        if(nb)nb.setWidth(w);
        if(this.fb) this.fb.setWidth(w);
        var bw = w-this.lockWidth
        this.uc.setWidth(bw);
        this.uh.setWidth(bw);
        this.ub.setWidth(bw);
        if(this.uf) this.uf.setWidth(bw);
    },
    setHeight: function(h){
    	if(this.height == h) return;
        this.height = h;
        var tb = $A.CmpManager.get(this.id+TB);
        if(tb)h-=25;
        var nb = $A.CmpManager.get(this.id+NAVBAR);
        if(nb)h-=25;
        if(this.fb)h-=25;
        this.wrap.setHeight(h);
        var bh = h - 25;
        if(this.lb)this.lb.setHeight(bh)
        this.ub.setHeight(bh)
    },
    deleteSelectRows: function(win){
        var ds = this.dataset,selected = [].concat(ds.getSelected());
        if(selected.length >0){
            ds.remove(selected);
//          for(var i=0;i<selected.length;i++){
//              var r = selected[i];
//              this.dataset.remove(r);
//          }
        }
        win.close();
    },
    remove: function(){
        var selected = this.dataset.getSelected();
        if(selected.length >0) $A.showConfirm(_lang['grid.remove.confirm'],_lang['grid.remove.confirmMsg'],this.deleteSelectRows.createDelegate(this));     
    },
    clear: function(){
        var ds = this.dataset,selected = ds.getSelected();
    	while(selected[0]){
    		ds.removeLocal(selected[0]);
    	}
    },
    _export : function(){
    	this.showExportConfirm();
    },
    showExportConfirm :function(){
    	this.initColumnPrompt();
    	var sf = this,n=0,id = this.id + '_export',
    		msg = ['<div class="item-export-wrap" style="margin:15px;width:270px" id="',id,'">',
    				'<div class="grid-uh" atype="grid.uh" style="width: 270px; -moz-user-select: none; text-align: left; height: 25px; cursor: default;" onselectstart="return false;" unselectable="on">',
    				'<table cellSpacing="0" cellPadding="0" border="0"><tbody><tr height="25px">',
					'<td class="export-hc" style="width:22px;" atype="export.rowcheck"><center><div atype="export.headcheck" class="',GRID_CKB,ITEM_CKB_U,'"></div></center></td>',
					'<td class="export-hc" style="width:222px;" atype="grid-type">',_lang['grid.export.column'],'</td>',
					'</tr></tbody></table></div>',
					'<div style="overflow:auto;height:200px;"><table cellSpacing="0" cellPadding="0" border="0"><tbody>'],
					exportall = true;
			Ext.each(this.columns,function(c,i){
				if(!this.isFunctionCol(c.type)){
					if(exportall)exportall = c.forexport !==false;
					msg.push('<tr',(n+i)%2==0?_N:' class="',ROW_ALT,'"','><td class="',GRID_ROWBOX,'" style="width:22px;" ',RECORD_ID,'="',i,'" atype="export.rowcheck"><center><div id="',this.id,__,i,'" class="',GRID_CKB,c.forexport === false?ITEM_CKB_U:ITEM_CKB_C,'"></div></center></td><td><div class="',GRID_CELL,'" style="width:220px">',c.prompt,'</div></td></tr>');	
				}else n++;
			},this);
			if(exportall)msg[7]=ITEM_CKB_C;
			msg.push('</tbody></table></div></div>');
    	this.exportwindow = $A.showOkCancelWindow(_lang['grid.export.config'],msg.join(_N),function(win2){
    		$A.showConfirm(_lang['grid.export.confirm'],_lang['grid.export.confirmMsg'],function(win){
		    	sf.doExport();
		       	win.close();
		       	win2.body.un(EVT_CLICK,sf.onExportClick,sf);
		       	win2.close();
	    	});
	    	return false;
    	},null,null,300);
    	this.exportwindow.body.on(EVT_CLICK,this.onExportClick,this);
    },
    initColumnPrompt : function(){
    	if(!this.isPromptInit){
    		Ext.each(this.columns,function(c){
    			if(!this.isFunctionCol(c.type)){
    				c.prompt = c.name?this.wrap.child('td.grid-hc'+SELECT_DATAINDEX+c.name+'] div').dom.innerHTML : (c.prompt||this.dataset.getField(c.name).pro["prompt"]);
    			}
    		},this);
    		this.isPromptInit = true;
    	}
    },
    onExportClick : function(e,t){
    	var target =Ext.fly(t).parent(TD);
        if(target){
            var atype = target.getAttributeNS(_N,ATYPE);
            if(atype=='export.rowcheck'){               
	            var rid =target.getAttributeNS(_N,RECORD_ID),
	            	cb = target.child(DIV),
                	checked = cb.hasClass(ITEM_CKB_C),
                	_atype = cb.getAttributeNS(_N,ATYPE),
                	cols = this.columns;
                this.setCheckBoxStatus(cb, !checked);
                if(_atype=='export.headcheck'){
                	var che = (this.isFunctionCol(cols[0].type) ? 1 : 0)
                		+ (this.isFunctionCol(cols[1].type) ? 1 : 0);
	            	this.exportwindow.body.select('td[atype=export.rowcheck] div[atype!=export.headcheck]')
	            		.each(function(cbs,o,i){
		            		this.setCheckBoxStatus(cbs, !checked);
		            		cols[i+che].forexport = !checked;
	            		},this);
                }else
                	cols[rid].forexport = !checked;
            }
        }
    },
    doExport : function(){
    	this.initColumnPrompt();
    	$A.doExport(this.dataset,this.columns)
    },
    destroy: function(){
        $A.Grid.superclass.destroy.call(this);
        this.processDataSetLiestener('un');
        this.sp.remove();
        delete this.sp;
    }
});
$A.Grid.revision='$Rev$';
})();