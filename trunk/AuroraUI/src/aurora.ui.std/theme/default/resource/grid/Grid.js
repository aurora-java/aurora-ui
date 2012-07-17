/**
 * @class Aurora.Grid
 * @extends Aurora.Component
 * <p>Grid 数据表格组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Grid = Ext.extend($A.Component,{
    cecls:'cell-editor',
    nbcls:'item-notBlank',
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
        	[ou]('click',this.focus,this);
        if(!(this.canwheel === false)){
        	this.wb[ou]('mousewheel',this.onMouseWheel,this);
        }
        this.fs[ou](Ext.isOpera ? "keypress" : "keydown", this.handleKeyDown,  this);
        this.ub[ou]('scroll',this.syncScroll, this)
        	[ou]('click',this.onClick, this)
        	[ou]('dblclick',this.onDblclick, this);
        this.uht[ou]('mousemove',this.onUnLockHeadMove, this);
        this.uh[ou]('mousedown', this.onHeadMouseDown,this)
        	[ou]('click', this.onHeadClick,this);
        if(this.lb){
            this.lb[ou]('click',this.onClick, this)
            	[ou]('dblclick',this.onDblclick, this);
        }
        if(this.lht) this.lht[ou]('mousemove',this.onLockHeadMove, this);
        if(this.lh)
        	this.lh[ou]('mousedown', this.onHeadMouseDown,this)
        		[ou]('click', this.onHeadClick,this);
        this[ou]('cellclick',this.onCellClick,this);
    },
    initEvents:function(){
        $A.Grid.superclass.initEvents.call(this);
        this.addEvents(
        /**
         * @event render
         * grid渲染出数据后触发该事件
         * @param {Aurora.Grid} grid 当前Grid组件.
         */
        'render',
        /**
         * @event keydown
         * 键盘按下事件.
         * @param {Aurora.Grid} grid 当前Grid组件.
         * @param {EventObject} e 鼠标事件对象.
         */
        'keydown',
        /**
         * @event dblclick
         * 鼠标双击事件.
         * @param {Aurora.Grid} grid 当前Grid组件.
         * @param {Aurora.Record} record 鼠标双击所在行的Record对象.
         * @param {Number} row 行号.
         * @param {String} 当前name.
         */
        'dblclick',
        /**
         * @event cellclick
         * 单元格点击事件.
         * @param {Aurora.Grid} grid 当前Grid组件.
         * @param {Number} row 行号.
         * @param {String} 当前name.
         * @param {Aurora.Record} record 鼠标点击所在单元格的Record对象.
         */
        'cellclick',
        /**
         * @event rowclick
         * 行点击事件.
         * @param {Aurora.Grid} grid 当前Grid组件.
         * @param {Number} row 行号.
         * @param {Aurora.Record} record 鼠标点击所在行的Record对象.
         */
        'rowclick',
        /**
         * @event editorShow
         * 编辑器显示后触发的事件.
         * @param {Aurora.Grid} grid 当前Grid组件.
         * @param {Editor} grid 当前Editor组件.
         * @param {Number} row 行号.
         * @param {String} 当前name.
         * @param {Aurora.Record} record 鼠标点击所在行的Record对象.
         */
        'editorshow',
        /**
         * @event nexteditorshow
         * 切换下一个编辑器的事件.
         * @param {Aurora.Grid} grid 当前Grid组件.
         * @param {Number} row 行号.
         * @param {String} 当前name.
         */
        'nexteditorshow');
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
                    if(values=='')return;
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
        this.fireEvent('keydown', this, e)
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
        if(typeof(ds)==='string'){
            ds = $(ds);
            if(!ds) return;
        }
//        var sf = this;
        this.dataset = ds;
        if(ds.autopagesize===true){
        	ds.pagesize=Math.round(((this.ub.getHeight()||parseFloat(this.ub.dom.style.height))-16)/25);
        }
        this.processDataSetLiestener('on');
        this.onLoad();
//        Ext.onReady(function(){
//            sf.onLoad();
//        })
    },
    initTemplate : function(){
        this.rowTdTpl = new Ext.Template('<td atype="{atype}" class="grid-rowbox" recordid="{recordid}">');
        this.rowNumTdTpl = new Ext.Template('<td style="text-align:{align}" class="grid-rownumber" atype="grid-rownumber" recordid="{recordid}">');
        this.rowNumCellTpl = new Ext.Template('<div style="width:{width}px">{text}</div>');
        this.tdTpl = new Ext.Template('<td style="visibility:{visibility};text-align:{align}" dataindex="{name}" atype="grid-cell" recordid="{recordid}">');
        this.cellTpl = new Ext.Template('<div class="grid-cell {cellcls}" style="width:{width}px" id="'+this.id+'_{name}_{recordid}" title="{title}"><span>{text}</span></div>');        
        this.cbTpl = new Ext.Template('<center><div class="{cellcls}" id="'+this.id+'_{name}_{recordid}"></div></center>');
    },
    getCheckBoxStatus: function(record, name ,readonly) {
        var field = this.dataset.getField(name),
        	cv = field.getPropertity('checkedvalue'),
        	uv = field.getPropertity('uncheckedvalue'),
        	value = record.data[name];
        return 'item-ckb-'+(readonly?'readonly-':'')+((value && value == cv) ? 'c' : 'u');
    },
    createTemplateData : function(col,record){
    	return {
            width:col.width-2,
            recordid:record.id,
            visibility: col.hidden === true ? 'hidden' : 'visible',
            name:col.name
        }
    },
    createCell : function(col,record,includTd){
        var data = this.createTemplateData(col,record),
       		cellTpl,
        	tdTpl = this.tdTpl,
        	cls = '', //col.editor ? this.cecls : 
        	xtype = col.type,
        	readonly,
        	editor = this.getEditor(col,record),
        	sb = [];
        if(editor!=''){
        	var edi = $A.CmpManager.get(editor);
        	//这里对于checkbox可能会存在问题
            if(edi && (edi instanceof $A.CheckBox)){
                xtype = 'cellcheck';
            }else{
                cls = this.cecls;
            }
        }else if(col.name && Ext.isDefined(record.getField(col.name).get('checkedvalue'))){
    		xtype = 'cellcheck';
    		readonly=true;
        }
        if(xtype == 'rowcheck' || xtype == 'rowradio'){
        	readonly = this.dataset.execSelectFunction(record)?'':'-readonly';
            tdTpl = this.rowTdTpl;
            data = Ext.apply(data,{
                align:'center',
                atype:xtype == 'rowcheck'?'grid.rowcheck':'grid.rowradio',
                cellcls: xtype == 'rowcheck'?'grid-ckb item-ckb'+readonly+'-u':'grid-radio item-radio-img'+readonly+'-u'
            })
            cellTpl = this.cbTpl;
        }else if(xtype == 'cellcheck'){
            data = Ext.apply(data,{
                align:'center',
                cellcls: 'grid-ckb ' + this.getCheckBoxStatus(record, col.name ,readonly) //+((cls=='') ? ' disabled ' : '' )
            })
            cellTpl = this.cbTpl;
        }else{
            var field = record.getMeta().getField(col.name);
            if(field && Ext.isEmpty(record.data[col.name]) && record.isNew == true && field.get('required') == true){
                cls = cls + ' ' + this.nbcls
            }
            var sp = (cls.indexOf(this.cecls)!=-1) ? 5 : 2,
            	t = this.renderText(record,col,record.data[col.name]);
            data = Ext.apply(data,{
                align:col.align||'left',
                cellcls: cls,
//                width:col.width-4,//-11
                width:data.width-sp,//-11
                text:t,
                title:String(t).replace(/<[^<>]*>/mg,'')
            })
            cellTpl =  this.cellTpl;
            if(xtype == 'rownumber') {
                tdTpl = this.rowNumTdTpl;
                cellTpl = this.rowNumCellTpl;
            }
        }
        if(includTd)sb.push(tdTpl.applyTemplate(data));
        sb.push(cellTpl.applyTemplate(data));
        if(includTd)sb.push('</td>')
        return sb.join('');
    },
    createRow : function(type, row, cols, item){
        var css=this.parseCss(this.renderRow(item,row)),
        	sb = ['<tr id="',this.id,'$',type,'-',item.id,'" class="',(row % 2==0 ? '' : 'row-alt'),css.cls,'"','style="',css.style,'">'];
        for(var i=0,l=cols.length;i<l;i++){
            sb.push(this.createCell(cols[i],item, true))           
        }
        sb.push('</tr>');
        return sb.join('');
    },
    parseCss:function(css){
    	var style="",cls="";
    	if(Ext.isArray(css)){
    		for(var i=0;i<css.length;i++){
    			var _css=this.parseCss(css[i]);
    			style+=";"+_css.style;
    			cls+=" "+_css.cls;
    		}
    	}else if(typeof css=="string"){
    		var isStyle=!!css.match(/^([^,:;]+:[^:;]+;)*[^,:;]+:[^:;]+;*$/);
    		cls=isStyle?"":css;
			style=isStyle?css:"";
    	}
    	return {style:style,cls:cls}
    	
    },
    renderText : function(record,col,value){        
    	var renderer = col.renderer;
        if(renderer){//&&!Ext.isEmpty(value)  去掉对value是否为空的判断
            var rder = $A.getRenderer(renderer);
            if(rder == null){
                alert("未找到"+renderer+"方法!")
                return value;
            }
            value = rder.call(window,value,record, col.name);
            return value == null ? '' : value;
        }
        return value == null ? '' : value;
    },
    renderRow : function(record,rowIndex){
    	var renderer = this.rowrenderer,css=null;
        if(renderer){
            var rder = $A.getRenderer(renderer);
            if(rder == null){
                alert("未找到"+renderer+"方法!")
                return css;
            }
            css = rder.call(window,record, rowIndex);
            return !css? '' : css;
        }
        return css ;
    },
    createTH : function(cols){
        var sb = ['<tr class="grid-hl">'];
        for(var i=0,l=cols.length;i<l;i++){
            var c = cols[i];
            sb.push('<th dataindex="',c.name,'" style="height:0px;width:',c.hidden === true?0:c.width,'px"></th>');
        }
        sb.push('</tr>');
        return sb.join('');
    },
    onBeforeRemove : function(){
        $A.Masker.mask(this.wb,_lang['grid.mask.remove']);
    },
    onBeforeLoad : function(){
    	this.ub.scrollTo('left',0);
    	this.uh.scrollTo('left',0);
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
        var cb = this.wrap.removeClass('grid-select-all').child('div[atype=grid.headcheck]');
        if(cb && this.selectable && this.selectionmodel=='multiple')this.setCheckBoxStatus(cb,false);
        if(this.lb)
        this.renderLockArea();
        this.renderUnLockAread();
//        if(focus !== false) this.focus.defer(10,this);//获取数据后的获得焦点,会引起其他编辑器无法编辑
        this.drawFootBar();
        $A.Masker.unmask(this.wb);
        this.fireEvent('render',this)
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
        	sb = ['<TABLE cellSpacing="0" atype="grid.lbt" cellPadding="0" border="0"  width="',this.lockWidth,'"><TBODY>',this.createTH(cols)];
//        var v = 0;
//        var columns = this.lockColumns;
//        for(var i=0,l=columns.length;i<l;i++){
//            cols.add(columns[i]);
//            if(columns[i].hidden !== true) v += columns[i].width;            
//        }
//        this.lockWidth = v;
        for(var i=0,l=this.dataset.data.length;i<l;i++){
            sb.push(this.createRow('l', i, cols, this.dataset.getAt(i)));
        }
        sb.push('</TBODY></TABLE><DIV style="height:17px"></DIV>');
        this.lb.update(sb.join(''));
        this.lbt = this.lb.child('table[atype=grid.lbt]'); 
    },
    renderUnLockAread : function(){
        var cols = this.unlockColumns,
        	sb = ['<TABLE cellSpacing="0" atype="grid.ubt" cellPadding="0" border="0" width="',this.unlockWidth,'"><TBODY>',this.createTH(cols)];
//        var v = 0;
//        var columns = this.unlockColumns;
//        for(var i=0,l=columns.length;i<l;i++){
//            cols.add(columns[i]);
//            if(columns[i].hidden !== true) v += columns[i].width;            
//        }
        for(var i=0,l=this.dataset.data.length;i<l;i++){
            sb.push(this.createRow('u', i, cols, this.dataset.getAt(i)));
        }
        sb.push('</TBODY></TABLE>');
        this.ub.update(sb.join(''));
        this.ubt = this.ub.child('table[atype=grid.ubt]'); 
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
        return t == 'rowcheck' || t == 'rowradio' || t == 'rownumber'
    },
    onAdd : function(ds,record,row){
//        if(this.lb)
//        var sb = [];var cols = [];
//        var v = 0;
        var columns = this.columns,
        	isAdd = row === this.dataset.data.length-1,
        	css = this.parseCss(this.renderRow(record,row)),
        	rowAlt = 'row-alt',
        	cls = (row % 2==0 ? '' : rowAlt+' ')+css.cls;
        if(this.lbt){
            var ltr = document.createElement("tr"),
            	ltb = this.lbt.dom.tBodies[0];
            ltr.id=this.id+'$l'+'-'+record.id;
            ltr.className=cls;
            Ext.fly(ltr).set({'style':css.style});
            Ext.each(columns,function(col){
                if(col.lock === true){
                    var td = document.createElement("td");
                    if(col.type == 'rowcheck') {
                        Ext.fly(td).set({'recordid':record.id,'atype':'grid.rowcheck'})
                        td.className = 'grid-rowbox';
                        if(this.isSelectAll){
                        	td.className += ' item-ckb-self';
                        }
                    }else if(col.type == 'rowradio'){
                    	Ext.fly(td).set({'recordid':record.id,'atype':'grid.rowradio'})
                        td.className = 'grid-rowbox';
                    }else{
                        if(col.hidden)td.style.visibility='hidden';
                        td.style.textAlign=col.align||'left';
                        if(!this.isFunctionCol(col.type)) td.dataindex=col.name;
                        var data = {'recordid':record.id,'atype':'grid-cell'};
                        if(col.type == 'rownumber') {
                            td.className = 'grid-rownumber';
                            data.atype = 'grid-rownumber';
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
	        	var trs = Ext.fly(ltb).query('tr[class!=grid-hl]');
	        	for(var i=row,l = trs.length;i<l;i++){
	        		var tr = Ext.fly(trs[i]).toggleClass(rowAlt);
					tr.select('.grid-rownumber div').each(function(div){
						div.update(Number(div.dom.innerHTML) + 1);
					});
					tr.select('.table-rowbox').each(function(td){
						this.setSelectStatus(this.dataset.findById(td.getAttributeNS('','recordid')));
					},this);
	        	}
	        	ltb.insertBefore(ltr,trs[row]);
	        }
        }
        
        var utr = document.createElement("tr"),
        	utb = this.ubt.dom.tBodies[0];
        utr.id=this.id+'$u'+'-'+record.id;
        utr.className=cls;
        Ext.fly(utr).set({'style':css.style});
        Ext.each(columns,function(col){
            if(col.lock !== true){
                var td = document.createElement("td");
                td.style.visibility=col.hidden === true ? 'hidden' : 'visible';
                td.style.textAlign=col.align||'left';
                Ext.fly(td).set({
                    'dataindex':col.name,
                    'recordid':record.id,
                    'atype':'grid-cell'
                })
                td.innerHTML = this.createCell(col,record,false);
                utr.appendChild(td);
            }
        },this)
        if(isAdd){
        	utb.appendChild(utr);
        }else{
        	var trs = Ext.fly(utb).query('tr[class!=grid-hl]');
        	for(var i=row,l = trs.length;i<l;i++){
				Ext.fly(trs[i]).toggleClass(rowAlt);    		
        	}
        	utb.insertBefore(utr,trs[row]);
        }
    	this.setSelectStatus(record);
    },
    renderEditor : function(div,record,c,editor){
    	var cell = this.createCell(c,record,false);
    	div.parent('td').update(cell);
    	
    	/*
    	if(editor == ''){    	
    		div.removeClass(this.cecls);
    	}else if(editor != '' || ($(editor) instanceof $A.CheckBox)){
    		var cell = this.createCell(c,record,false);
    		div.parent().update(cell)
    	}else{
            div.addClass(this.cecls);
    	}
        */
    },
    onUpdate : function(ds,record, name, value){
        this.setSelectStatus(record);
        var div = Ext.get([this.id,name,record.id].join('_'));
        if(div){
            var c = this.findColByName(name),
            	editor = this.getEditor(c,record);            
            if(editor!='' && ($(editor) instanceof $A.CheckBox)){
            	this.renderEditor(div,record,c,editor);
            }else{
            	//考虑当其他field的值发生变化的时候,动态执行其他带有renderer的
                div.update(this.renderText(record,c,value));
            }
        }
        Ext.each(this.columns,function(c){
            if(c.name != name) {
            	var ediv = Ext.get([this.id,c.name,record.id].join('_'));
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
            var div = Ext.get([this.id,name,record.id].join('_'));
            if(div) {
                if(valid == false){
                    div.addClass('item-invalid');
                }else{
                    div.removeClass([this.nbcls,'item-invalid']);
                }
            }
        }
    },
    onRemove : function(ds,record,index){
        var lrow = Ext.get(this.id+'$l-'+record.id),
        	urow = Ext.get(this.id+'$u-'+record.id);
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
        if(type == 'required'){
           var div = Ext.get([this.id,field.name,record.id].join('_'));
           if(div) {
               div[value==true?'addClass':'removeClass'](this.nbcls);
           }
        }
    },
//  onRowMouseOver : function(e){
//      if(Ext.fly(e.target).hasClass('grid-cell')){
//          var rid = Ext.fly(e.target).getAttributeNS("","recordid");
//          var row = this.getDataIndex(rid);
//          if(row == -1)return;
//          if(rid != this.overId)
//          if(this.overlockTr) this.overlockTr.setStyle(this.bgc, this.selectedId ==this.overId ? '#ffe3a8' : '');
//          if(this.overUnlockTr)  this.overUnlockTr.setStyle(this.bgc,this.selectedId ==this.overId ? '#ffe3a8' : '');
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
        var cb = Ext.get(this.id+'__'+record.id);
        cb.parent('.grid-rowbox').addClass('item-ckb-self');
        if(cb){
	        if(this.selectionmodel=='multiple') {
	            this.setCheckBoxStatus(cb, true);
	        }else{
	            this.setRadioStatus(cb,true);
	            this.dataset.locate((this.dataset.currentPage-1)*this.dataset.pagesize + this.dataset.indexOf(record) + 1)
	        }
            this.setSelectStatus(record);
        }
    },
    onUnSelect : function(ds,record,isSelectAll){
        if(!record||isSelectAll)return;
        var cb = Ext.get(this.id+'__'+record.id);
        cb.parent('.grid-rowbox').addClass('item-ckb-self');
        if(cb){
	        if(this.selectionmodel=='multiple') {
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
    	this.wrap.addClass('grid-select-all');
    },
    onUnSelectAll : function(){
    	this.clearChecked();
    	this.isSelectAll = false;
    	this.isUnSelectAll = true;
    	this.wrap.removeClass('grid-select-all');
    },
    clearChecked : function(){
    	var w = this.wrap;
		w.select('.item-ckb-self .item-ckb-c').replaceClass('item-ckb-c','item-ckb-u');
		w.select('.item-ckb-self').removeClass('item-ckb-self');
    },
    onDblclick : function(e,t){
        var target = Ext.fly(t).parent('td[atype=grid-cell]');
        if(target){
            var ds = this.dataset,
            	rid = target.getAttributeNS("","recordid"),
            	record = ds.findById(rid),
            	row = ds.indexOf(record),
            	name = target.getAttributeNS("","dataindex");
            this.fireEvent('dblclick', this, record, row, name)
        }
    },
    onClick : function(e,t) {
        var target = Ext.fly(t).parent('td');
        if(target){
            var atype = target.getAttributeNS("","atype"),
            	rid = target.getAttributeNS("","recordid"),
            	ds = this.dataset;
            if(atype=='grid-cell'){
                var record = ds.findById(rid),
                	row = ds.indexOf(record),
                	name = target.getAttributeNS("","dataindex");
                this.fireEvent('cellclick', this, row, name, record);
                //this.adjustColumn(name);
                //this.showEditor(row,name);
                this.fireEvent('rowclick', this, row, record);
            }else if (atype == 'grid-rownumber'){
                var record = ds.findById(rid),
                	row = ds.indexOf(record);
                if(record.id != this.selectedId) this.selectRow(row);
            }else if(atype=='grid.rowcheck'){               
                var cb = Ext.get(this.id+'__'+rid);
                if(cb.hasClass('item-ckb-readonly-u')||cb.hasClass('item-ckb-readonly-c'))return;
                if(this.isSelectAll && !cb.parent('.item-ckb-self')){
                	cb.replaceClass('item-ckb-u','item-ckb-c');	
                }else if(this.isUnselectAll && !cb.parent('.item-ckb-self')){
            		cb.replaceClass('item-ckb-c','item-ckb-u');	
                }
                cb.hasClass('item-ckb-c') ? ds.unSelect(rid) : ds.select(rid);
            }else if(atype=='grid.rowradio'){
            	var cb = Ext.get(this.id+'__'+rid);
                if(cb.hasClass('item-radio-img-readonly-u')||cb.hasClass('item-radio-img-readonly-c'))return;
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
    	var th = this.wrap.select('tr.grid-hl th[dataindex='+name+']'),
    		w = Ext.fly(th.elements[0]).getWidth(),
    		max = w,
    		margin = 12,
    		width = this.width - (this.selectable?23:0) - 20;
    	this.wrap.select('td[dataindex='+name+'] span').each(function(span){
			if(Ext.isIE || Ext.isIE9)span.parent().setStyle('text-overflow','clip');
    		max = Math.max(span.getWidth()+margin,max);
    		if(Ext.isIE || Ext.isIE9)span.parent().setStyle('text-overflow','');
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
    	this.wrap.select('td.grid-hc[dataindex='+name+'] div').update(prompt);
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
        	div = Ext.get([this.id,name,this.selectedId].join('_'));
        col.editor = editor;
        if(div){
            if(editor == ''){
            	div.removeClass(this.cecls);
            }else if(!$(editor) instanceof $A.CheckBox){
            	div.addClass(this.cecls);
            }
        }
    },
    getEditor : function(col,record){
        var ed = col.editor||'';
        if(col.editorfunction) {
            var ef = window[col.editorfunction];
            if(ef==null) {
                alert("未找到"+col.editorfunction+"方法!") ;
                return null;
            }
            ed = ef.call(window,record,col.name)||'';
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
        	sf.currentEditor.editor.el.un('keydown', sf.onEditorKeyDown,sf);
    		var d = sf.currentEditor.focusCheckBox;
    		if(d){
    			d.setStyle('outline','none');
    			sf.currentEditor.focusCheckBox = null;
    		}
    	}
        if(editor!=''){
        	var ed = $(editor);
            setTimeout(function(){
            	var v = record.get(name),
                	dom = Ext.get([sf.id,name,record.id].join('_')),
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
		        	ed.el.on('keydown', sf.onEditorKeyDown,sf);
		        	ed.onClick();
		        	sf.currentEditor.focusCheckBox = dom;
	        		dom.setStyle('outline','1px dotted blue');
//		            var field = sf.dataset.getField(name)
//		            var cv = field.getPropertity('checkedvalue');
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
                    ed.el.on('keydown', sf.onEditorKeyDown,sf);
                    ed.on('select',sf.onEditorSelect,sf);
                    Ext.get(document.documentElement).on("mousedown", sf.onEditorBlur, sf);
                    if(callback)callback.call(window,ed)
	                sf.fireEvent('editorshow', sf, ed, row, name, record);
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
		                    if(editor!=''){
		                        name =  col.name;
		                        break;
		                    }
	                    }
	                }
	                if(sf.currentEditor){
	                	sf.currentEditor.editor.el.un('keydown', sf.onEditorKeyDown,sf);
	        			var d= sf.currentEditor.focusCheckBox;
	        			if(d){
	        				d.setStyle('outline','none');
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
		                		var dom = Ext.get([sf.id,name,r.id].join('_')),
		                			xy = dom.getXY();
		                		ed.move(-1000,xy[1])
		                		ed.focus();
		                		ed.el.on('keydown', sf.onEditorKeyDown,sf);
		                		sf.currentEditor.focusCheckBox = dom;
		                		dom.setStyle('outline','1px dotted blue');
	                		},10)
	                	}else{
		                    sf.fireEvent('cellclick', sf, row, name, r ,callback);
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
	                            if(editor!=''){
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
					                		var dom = Ext.get([sf.id,name,nr.id].join('_')),
					                			xy = dom.getXY();
					                		ed.move(-1000,xy[1])
					                		ed.focus();
					                		ed.el.on('keydown', sf.onEditorKeyDown,sf);
					                		sf.currentEditor.focusCheckBox = dom;
					                		dom.setStyle('outline','1px dotted blue');
				                		},10)
				                	}else{
		                                sf.fireEvent('cellclick', sf, row+1, name, nr ,callback);
		                                //this.showEditor(row+1,name,callback);
				                	}
	                                break;
	                            }
	                        }
	                    }
	                }
	            }
	            sf.fireEvent('nexteditorshow',sf, row, name);
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
            ub.scrollTo('top',row*r-1)
        }else if((row+1)*r>(stop+h-sh)){//this.ub.dom.scrollHeight
            ub.scrollTo('top', (row+1)*r-h + sh);
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
            ub.scrollTo('left',ll);
        }else if((lr-sleft)>(this.width-lw)){
            ub.scrollTo('left',lr  - this.width + lw + (ub.dom.scrollHeight > ub.dom.clientHeight? 16 : 0));
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
	                ed.el.un('keydown', this.onEditorKeyDown,this);
	                ed.un('select',this.onEditorSelect,this);
	                Ext.get(document.documentElement).un("mousedown", this.onEditorBlur, this);
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
        if(this.isOverSplitLine(this.hmx)){
            this.lh.setStyle('cursor',"w-resize");          
        }else{
            this.lh.setStyle('cursor',"default");           
        }
    },
    onUnLockHeadMove : function(e){
//      if(this.draging)return;
        var uht = this.uht;
        this.hmx = e.xy[0] - (uht?uht.getXY()[0] + uht.getScroll().left:0) + this.lockWidth;
        if(this.isOverSplitLine(this.hmx)){
            this.uh.setStyle('cursor',"w-resize");          
        }else{
            this.uh.setStyle('cursor',"default");
        }       
    },
    onHeadMouseDown : function(e){
        this.dragWidth = -1;
        if(this.overColIndex == undefined || this.overColIndex == -1) return;
        this.dragIndex = this.overColIndex;
        this.dragStart = e.getXY()[0];
        this.sp.setHeight(this.wrap.getHeight())
        	.show()
        	.setStyle({"top":this.wrap.getXY()[1]+"px","left":e.xy[0]+"px"});
        Ext.get(document.documentElement)
        	.on("mousemove", this.onHeadMouseMove, this)
        	.on("mouseup", this.onHeadMouseUp, this);
    },
    onHeadClick : function(e,t){
        var target = Ext.fly(t).parent('td'),
        	ds = this.dataset,
        	atype;
        if(target) {
            atype = target.getAttributeNS("","atype");
        }
        if(atype=='grid.head'){
            var index = target.getAttributeNS("","dataindex"),
            	col = this.findColByName(index);
            if(col && col.sortable === true){
            	if(ds.isModified()){
                    $A.showInfoMessage('提示', '有未保存数据!');
                    return;
            	}
                var d = target.child('div'),
                	of = index,
                	ot = '';
//                this.dataset.setQueryParameter('ORDER_FIELD', index);
                if(this.currentSortTarget){
                    this.currentSortTarget.removeClass(['grid-asc','grid-desc']);
                }
                this.currentSortTarget = d;
                if(Ext.isEmpty(col.sorttype)) {
                    col.sorttype = 'desc'
                    d.removeClass('grid-asc').addClass('grid-desc');
                    ot = 'desc';
//                    this.dataset.setQueryParameter('ORDER_TYPE', 'desc');
                } else if(col.sorttype == 'desc'){
                    col.sorttype = 'asc';
                    d.removeClass('grid-desc').addClass('grid-asc');
                    ot = 'asc';
//                    this.dataset.setQueryParameter('ORDER_TYPE', 'asc');
                }else {
                    col.sorttype = '';
                    d.removeClass(['grid-desc','grid-asc']);
//                    delete this.dataset.qpara['ORDER_TYPE'];
                }
//                if(this.dataset.getAll().length!=0)this.dataset.query();
                ds.sort(of,ot);
            }
        }else if(atype=='grid.rowcheck'){
            var cb = target.child('div[atype=grid.headcheck]');
            if(cb){
                var checked = cb.hasClass('item-ckb-c');
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
            el.removeClass('item-radio-img-c').addClass('item-radio-img-u');
        }else{
            el.addClass('item-radio-img-c').removeClass('item-radio-img-u');
        }
    },
    setCheckBoxStatus: function(el, checked){
        if(!checked){
            el.removeClass('item-ckb-c').addClass('item-ckb-u');
        }else{
            el.addClass('item-ckb-c').removeClass('item-ckb-u');
        }
    },
    setSelectDisable:function(el,record){
    	var flag = this.dataset.selected.indexOf(record) == -1;
    	if(this.selectionmodel=='multiple'){
    		el.removeClass(['item-ckb-c','item-ckb-u'])
    			.addClass(flag?'item-ckb-readonly-u':'item-ckb-readonly-c');
    	}else{
    		el.removeClass(['item-radio-img-c','item-radio-img-u','item-radio-img-readonly-c','item-radio-img-readonly-u'])
            	.addClass(flag?'item-radio-img-readonly-u':'item-radio-img-readonly-c');
    	}
    },
    setSelectEnable:function(el,record){
    	var flag = this.dataset.selected.indexOf(record) == -1;
    	if(this.selectionmodel=='multiple'){
    		el.removeClass(['item-ckb-readonly-u','item-ckb-readonly-c'])
    			.addClass(flag?'item-ckb-u':'item-ckb-c');
    	}else{
            el.removeClass(['item-radio-img-u','item-radio-img-c','item-radio-img-readonly-u','item-radio-img-readonly-c'])
    			.addClass(flag?'item-radio-img-u':'item-radio-img-c');
    	}	
    },
    setSelectStatus:function(record){
    	if(this.dataset.selectfunction){
	    	var cb = Ext.get(this.id+'__'+record.id);
	    	if(!this.dataset.execSelectFunction(record)){
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
            this.sp.setStyle("left", e.xy[0]+"px")
        }
    },
    onHeadMouseUp: function(e){
//      this.draging = false;
        Ext.get(document.documentElement).un("mousemove", this.onHeadMouseMove, this)
        	.un("mouseup", this.onHeadMouseUp, this);      
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
        if(this.selectlockTr) this.selectlockTr.removeClass('row-selected');
        //if(this.selectUnlockTr) this.selectUnlockTr.setStyle(this.bgc,'');
        if(this.selectUnlockTr) this.selectUnlockTr.removeClass('row-selected');
        this.selectUnlockTr = Ext.get(this.id+'$u-'+record.id);
        if(this.selectUnlockTr)this.selectUnlockTr.addClass('row-selected');
        //if(this.selectUnlockTr)this.selectUnlockTr.setStyle(this.bgc,this.scor);
        
        this.selectlockTr = Ext.get(this.id+'$l-'+record.id);
        if(this.selectlockTr)this.selectlockTr.addClass('row-selected');
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
        var hth,bth,lw=0,uw=0,
        	wd = "width",px="px";
        Ext.each(this.columns,function(c){
            if(c.name && c.name === name){
                if(c.hidden === true) return;
                c.width = size;
                if(c.lock !== true){                    
                    hth = this.uh.child('th[dataindex='+name+']');
                    bth = this.ub.child('th[dataindex='+name+']');                  
                }else{                          
                    if(this.lh) hth = this.lh.child('th[dataindex='+name+']');
                    if(this.lb) bth = this.lb.child('th[dataindex='+name+']');
                    
                }
            }
            if(c.hidden !== true){
            	c.lock !== true ? (uw += c.width) : (lw += c.width);
            }
        },this)
        this.wrap.select('td[dataindex='+name+'] DIV.grid-cell').each(function(ce){
            ce.setStyle(wd, Math.max(size-(ce.hasClass(this.cecls) ? 7 : 4),0)+px);
        },this)
        
        this.unlockWidth = uw;
        this.lockWidth = lw;
        if(hth) hth.setStyle(wd, size+px);
        if(bth) bth.setStyle(wd, size+px);
        var mlw = Math.max(this.width - lw,0);
        if(this.fb){
            this.fb.child('th[dataindex='+name+']').setStyle(wd, size+px);
            this.uf.setStyle(wd,mlw+px);
            this.fb.child('table[atype=fb.ubt]').setStyle(wd,uw+px);
            var lft = this.fb.child('table[atype=fb.lbt]');
            if(lft){
                this.fb.child('div[atype=grid.lf]').setStyle(wd,(lw-1)+px);
                lft.setStyle(wd,lw+px);
            }
        }
        
        if(this.lc){
            var lcw = Math.max(lw-1,0);
            this.lc.setStyle({width:lcw+px,'display':lcw==0 ? 'none' : ''});
        }
        if(this.lht)this.lht.setStyle(wd,lw+px);
        if(this.lbt)this.lbt.setStyle(wd,lw+px);
        this.uc.setStyle(wd,mlw+px);
        this.uh.setStyle(wd,mlw+px);
        this.ub.setStyle(wd,mlw+px);
        this.uht.setStyle(wd,uw+px);
        if(this.ubt)this.ubt.setStyle(wd,uw+px);
        this.syncSize();
    },
    drawFootBar : function(objs){
    	if(!this.fb) return;
    	Ext.each([].concat(objs ? objs : this.columns), function(obj) {
    		var col = typeof(obj)==='string' ? this.findColByName(obj) : obj;
            if(col&&col.footerrenderer){
                var fder = $A.getRenderer(col.footerrenderer);
                if(fder == null){
                    alert("未找到"+col.footerrenderer+"方法!")
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
                this.wrap.select('td[dataindex='+name+']').show();
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
                this.wrap.select('td[dataindex='+name+']').hide();
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
    				selector.push('[dataindex='+lockNames[i]+']');
    			}
    			this.lht.setWidth(this.lockWidth).select(selector.join(',')).remove();
        		this.lc.setWidth(lw - 1); 
        		this.uc.setWidth(this.wrap.getWidth() - lw); 
    		}
    		if(unl){
    			var selector = [];
    			for(var i=0;i<unl;i++){
    				selector.push('[dataindex='+unLockNames[i]+']');
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
		var trs = parent.query('tr'),t = Ext.fly(trs[0]).child('th[width=20]'),tds;
		if(name)tds = parent.query('[dataindex='+name+']')[0];
		if (method == 'insertAfter'){
			tds = tds.nextSibling || null;
			index ++;
		}else if(method == 'append'){
			if(t) tds = t.dom;
			index = -1;	
		}
		Ext.each(cols,function(c){
			var	th = Ext.get(document.createElement('th')),
				td = Ext.get(trs[1].insertCell(index)),
				w = c.width,n = c.name;
			if(index > - 1)index++;
			td.addClass('grid-hc').set({'dataindex':n,'atype':'grid.head'}).update('<div>'+c.prompt+'</div>');
			if(tds)trs[0].insertBefore(th.dom,tds)
			else trs[0].appendChild(th.dom);
			th.setStyle('width',w+'px').set({'dataindex':n});
		});
    }:function(cols,method,name,parent){
    	var html = [],html2=[],
    		tds = parent.query(method != 'append'?'[dataindex='+name+']':'tr');
		Ext.each(cols,function(c){
			html.push('<th style="width:',c.width,'px;" dataindex="',c.name,'"></th>');
			html2.push('<td class="grid-hc" atype="grid.head" dataindex="',c.name,'"><div>',c.prompt,'</div></td>');
		});
		new Ext.Template(html.join(''))[method](tds[0],{});
		new Ext.Template(html2.join(''))[method](tds[1],{});
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
	        		index = (where == 'before'? 0 : 1) + cols.indexOf(column);
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
        		var method = where? (where == 'before'?'insertBefore':'insertAfter'):'append',
        			lmethod = umethod = method,
        			lname = uname = name,
        			wp = this.wrap;
        		if(oldLock){
        			umethod = 'insertBefore';
        			uname = this.unlockColumns[0].name;
        		}else{
        			lmethod = 'append';
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
			            this.lb['on']('click',this.onClick, this)
			            	['on']('dblclick',this.onDblclick, this);
				        this.lht['on']('mousemove',this.onLockHeadMove, this);
				        this.lh['on']('mousedown', this.onHeadMouseDown,this)
				        	['on']('click', this.onHeadClick,this);
	        		}
	        		this.createHead(lockCols,lmethod,lname,this.lht,oldIndex);
	        	}
	        	if(unLockCols.length){
	        		this.createHead(unLockCols,umethod,uname,this.uht,oldIndex);
	    		}
	    		if(this.lb)this.lb.update('');
	    		this.ub.update('');
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
    	this.addColumn(options,name,'before');
    },
    /**
     * 在指定列后插入列.
     * 
     * @param {Object/Array} options/columns 列的参数/一组列的参数;
     * @param {String} name 指定列的列名;
     */
    insertColumnAfter : function(name,options){
    	this.addColumn(options,name,'after');
    },
    setWidth: function(w){
    	if(this.width == w) return;
        this.width = w;
        this.wrap.setWidth(w);
        var tb = $A.CmpManager.get(this.id+'_tb')
        if(tb)tb.setWidth(w);
        var nb = $A.CmpManager.get(this.id+'_navbar')
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
        var tb = $A.CmpManager.get(this.id+'_tb');
        if(tb)h-=25;
        var nb = $A.CmpManager.get(this.id+'_navbar');
        if(nb)h-=25;
        if(this.fb)h-=25;
        this.wrap.setHeight(h);
        var bh = h - 25;
        if(this.lb)this.lb.setHeight(bh)
        this.ub.setHeight(bh)
    },
    deleteSelectRows: function(win){
        var selected = [].concat(this.dataset.getSelected());
        if(selected.length >0){
            this.dataset.remove(selected);
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
        var selected = this.dataset.getSelected();
    	while(selected[0]){
    		this.dataset.removeLocal(selected[0]);
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
					'<td class="export-hc" style="width:22px;" atype="export.rowcheck"><center><div atype="export.headcheck" class="grid-ckb item-ckb-','u','"></div></center></td>',
					'<td class="export-hc" style="width:222px;" atype="grid-type">',_lang['grid.export.column'],'</td>',
					'</tr></tbody></table></div>',
					'<div style="overflow:auto;height:200px;"><table cellSpacing="0" cellPadding="0" border="0"><tbody>'],
					exportall = true;
			Ext.each(this.columns,function(c,i){
				if(!this.isFunctionCol(c.type)){
					if(exportall)exportall = c.forexport !==false;
					msg.push('<tr',(n+i)%2==0?'':' class="row-alt"','><td class="grid-rowbox" style="width:22px;" rowid="',i,'" atype="export.rowcheck"><center><div id="',this.id,'__',i,'" class="grid-ckb item-ckb-',c.forexport === false?'u':'c','"></div></center></td><td><div class="grid-cell" style="width:220px">',c.prompt,'</div></td></tr>');	
				}else n++;
			},this);
			if(exportall)msg[6]='c';
			msg.push('</tbody></table></div></div>');
    	this.exportwindow = $A.showOkCancelWindow(_lang['grid.export.config'],msg.join(''),function(win2){
    		$A.showConfirm(_lang['grid.export.confirm'],_lang['grid.export.confirmMsg'],function(win){
		    	sf.doExport();
		       	win.close();
		       	win2.body.un('click',sf.onExportClick,sf);
		       	win2.close();
	    	});
	    	return false;
    	},null,null,300);
    	this.exportwindow.body.on('click',this.onExportClick,this);
    },
    initColumnPrompt : function(){
    	if(!this.isPromptInit){
    		Ext.each(this.columns,function(c){
    			if(!this.isFunctionCol(c.type)){
    				c.prompt = c.name?this.wrap.child('td.grid-hc[dataindex='+c.name+'] div').dom.innerHTML : (c.prompt||this.dataset.getField(c.name).pro["prompt"]);
    			}
    		},this);
    		this.isPromptInit = true;
    	}
    },
    onExportClick : function(e,t){
    	var target =Ext.fly(t).parent('td');
        if(target){
            var atype = target.getAttributeNS("","atype");
            if(atype=='export.rowcheck'){               
	            var rid =target.getAttributeNS("","rowid"),
	            	cb = target.child('div'),
                	checked = cb.hasClass('item-ckb-c'),
                	_atype = cb.getAttributeNS("","atype"),
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