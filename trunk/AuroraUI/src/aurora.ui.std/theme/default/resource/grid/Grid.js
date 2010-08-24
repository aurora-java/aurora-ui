/**
 * @class Aurora.Grid
 * @extends Aurora.Component
 * <p>Grid 数据表格组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Grid = Ext.extend($A.Component,{
    bgc:'background-color',
    scor:'#dfeaf5',//'#d9e7ed',
    ocor:'#ffe3a8',
    cecls:'cell-editor',
    nbcls:'item-notBlank',
    constructor: function(config){
        this.overId = null;
        this.selectedId = null;
        this.lockWidth = 0;
        $A.Grid.superclass.constructor.call(this,config);
    },
    initComponent:function(config){
        $A.Grid.superclass.initComponent.call(this, config);
        this.wb = Ext.get(this.id+'_wrap');
        this.uc = this.wrap.child('div[atype=grid.uc]');
        this.uh = this.wrap.child('div[atype=grid.uh]');
        this.ub = this.wrap.child('div[atype=grid.ub]'); 
        this.uht = this.wrap.child('table[atype=grid.uht]'); 
        
        this.lc = this.wrap.child('div[atype=grid.lc]'); 
        this.lh = this.wrap.child('div[atype=grid.lh]');
        this.lb = this.wrap.child('div[atype=grid.lb]');
        this.lht = this.wrap.child('table[atype=grid.lht]'); 

        this.sp = this.wrap.child('div[atype=grid.spliter]');
        Ext.getBody().insertFirst(this.sp)
        this.fs = this.wrap.child('a[atype=grid.focus]');
        
        var lock =[],unlock = [],columns=[];
        for(var i=0,l=this.columns.length;i<l;i++){
            var c = this.columns[i];
            if(c.lock === true){
                lock.add(c);
            }else{
                unlock.add(c);
            }
        }
        this.columns = lock.concat(unlock);
        this.initTemplate();
    },
    processListener: function(ou){
//      $A.Grid.superclass.initComponent.call(this, ou);//???
        this.wrap[ou]("mouseover", this.onMouseOver, this);
        this.wrap[ou]("mouseout", this.onMouseOut, this);
        this.wrap[ou]('click',this.focus,this);
        this.fs[ou](Ext.isOpera ? "keypress" : "keydown", this.handleKeyDown,  this);
        this.ub[ou]('scroll',this.syncScroll, this);
        this.ub[ou]('click',this.onClick, this);
        this.ub[ou]('dblclick',this.onDblclick, this);
        this.uht[ou]('mousemove',this.onUnLockHeadMove, this);
        this.uh[ou]('mousedown', this.onHeadMouseDown,this);
        this.uh[ou]('click', this.onHeadClick,this);
        if(this.lb){
            this.lb[ou]('click',this.onClick, this);
            this.lb[ou]('dblclick',this.onDblclick, this);
        }
        if(this.lht) this.lht[ou]('mousemove',this.onLockHeadMove, this);
        if(this.lh) this.lh[ou]('mousedown', this.onHeadMouseDown,this);
        if(this.lh) this.lh[ou]('click', this.onHeadClick,this);
    },
    initEvents:function(){
        $A.Grid.superclass.initEvents.call(this);
        this.addEvents(
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
        'rowclick');
    },
    syncScroll : function(){
        this.hideEditor();
        this.uh.dom.scrollLeft = this.ub.dom.scrollLeft;
        if(this.lb) this.lb.dom.scrollTop = this.ub.dom.scrollTop;
    },
    handleKeyDown : function(e){
        var key = e.getKey();
        if(e.ctrlKey&&e.keyCode == 86){
            var text = window.clipboardData.getData('text');
            if(text){
                var columns = this.columns;
                var rows = text.split('\n');
                for(var i=0,l=rows.length;i<l;i++){
                    var row = rows[i];
                    var values = row.split('\t');
                    if(values=='')continue;
                    var data = {}; 
                    for(var j=0,v=0,k=this.columns.length;j<k;j++){
                        var c = this.columns[j];
                        if(this.isFunctionCol(c)) continue;
                        if(c.hidden !== true) {
                            data[c.name] = values[v];
                            v++
                        }
                    }
                    this.dataset.create(data);
                }
            }
        }else{
            if(key == 38 || key == 40 || key == 33 || key == 34) {
                if(this.dataset.loading == true) return;
                var row;
                switch(e.getKey()){
                    case 33:
                        this.dataset.prePage();
                        break;
                    case 34:
                        this.dataset.nextPage();
                        break;
                    case 38:
                        this.dataset.pre();
                        break;
                    case 40:
                        this.dataset.next();
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
            ds[ou]('beforeload', this.onBeforLoad, this);
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
        }
    },
    bind : function(ds){
        if(typeof(ds)==='string'){
            ds = $(ds);
            if(!ds) return;
        }
        this.dataset = ds;
        this.processDataSetLiestener('on');
        this.onLoad();
    },
    initTemplate : function(){
        this.rowTdTpl = new Ext.Template('<TD atype="{atype}" class="grid-rowbox" recordid="{recordid}">');
        this.tdTpl = new Ext.Template('<TD style="visibility:{visibility};text-align:{align}" dataindex="{name}" atype="grid-cell" recordid="{recordid}">');
        this.cellTpl = new Ext.Template('<div class="grid-cell {cellcls}" style="width:{width}px" id="'+this.id+'_{name}_{recordid}">{text}</div>');        
        this.cbTpl = new Ext.Template('<center><div class="{cellcls}" id="'+this.id+'_{name}_{recordid}"></div></center>');
    },
    getCheckBoxStatus: function(record, name) {
        var field = this.dataset.getField(name)
        var cv = field.getPropertity('checkedvalue');
        var uv = field.getPropertity('uncheckedvalue');
        var value = record.data[name];
//      return (value && value.trim() == cv.trim()) ? 'item-ckb-c' : 'item-ckb-u';
        return (value && value == cv) ? 'item-ckb-c' : 'item-ckb-u';
    },
    createCell : function(col,record,includTd){

        var data = {
            width:col.width,
            recordid:record.id,
            visibility: col.hidden === true ? 'hidden' : 'visible',
            name:col.name
        }
        var cellTpl;
        var tdTpl = this.tdTpl;
        if(col.type == 'rowcheck'){
            tdTpl = this.rowTdTpl;
            data = Ext.apply(data,{
                align:'center',
                atype:'grid.rowcheck',
                cellcls: 'grid-ckb item-ckb-u'
            })
            cellTpl =  this.cbTpl;
        }else if(col.type == 'rowradio'){
            tdTpl = this.rowTdTpl;
            data = Ext.apply(data,{
                align:'center',
                atype:'grid.rowradio',
                cellcls: 'grid-radio item-radio-img-u'
            })
            cellTpl =  this.cbTpl;
        }else if(col.type == 'cellcheck'){
            data = Ext.apply(data,{
                align:'center',
                cellcls: 'grid-ckb ' + this.getCheckBoxStatus(record, col.name)
            })
            cellTpl =  this.cbTpl;
        }else{
            var cls = col.editor ? this.cecls : '';
            if(col.editorfunction) {
                var ef = window[col.editorfunction];
                if(ef) {
                    cls = ef.call(window,record,col.name)!='' ? this.cecls : '';
                }
            }
            var field = record.getMeta().getField(col.name);
            if(field && Ext.isEmpty(record.data[col.name]) && record.isNew == true && field.get('required') == true){
                cls = cls + ' ' + this.nbcls
            }
            data = Ext.apply(data,{
                align:col.align||'left',
                cellcls: cls,
                width:col.width-11,
                text:this.renderText(record,col,record.data[col.name])
            })
            cellTpl =  this.cellTpl;
        }
        var sb = [];
        if(includTd)sb.add(tdTpl.applyTemplate(data));
        sb.add(cellTpl.applyTemplate(data));
        if(includTd)sb.add('</TD>')
        return sb.join('');
    },
    createRow : function(type, row, cols, item){
        var sb = [];
        sb.add('<TR id="'+this.id+'$'+type+'-'+item.id+'" class="'+(row % 2==0 ? '' : 'row-alt')+'">');
        for(var i=0,l=cols.length;i<l;i++){
            var c = cols[i];
            sb.add(this.createCell(c,item, true))           
        }
        sb.add('</TR>');
        return sb.join('');
    },
    renderText : function(record,col,value){
        var renderer = col.renderer;
        if(renderer&&!Ext.isEmpty(value)){
            var rder;
            if(renderer.indexOf('Aurora.') != -1){
                rder = $A[renderer.substr(7,renderer.length)]
            }else{
                rder = window[renderer];
            }
            if(rder == null){
                alert("未找到"+renderer+"方法!")
                return value;
            }
            value = rder.call(window,value,record, col.name);
            return value == null ? '' : value;
        }
        return value == null ? '' : value;
    },
    createTH : function(cols){
        var sb = [];
        sb.add('<TR class="grid-hl">');
        for(var i=0,l=cols.length;i<l;i++){
            var w = cols[i].width;
            if(cols[i].hidden === true) w = 0;
            sb.add('<TH dataindex="'+cols[i].name+'" style="height:0px;width:'+w+'px"></TH>');
        }
        sb.add('</TR>');
        return sb.join('');
    },
    onBeforeRemove : function(){
        $A.Masker.mask(this.wb,'正在删除数据...');
    },
    onBeforLoad : function(){
        $A.Masker.mask(this.wb,'正在查询数据...');
    },
    onLoad : function(focus){
        var cb = Ext.fly(this.wrap).child('div[atype=grid.headcheck]');
        if(this.selectable && this.selectionmodel=='multiple')this.setCheckBoxStatus(cb,false);
        if(this.lb)
        this.renderLockArea();
        this.renderUnLockAread();
        if(focus !== false) this.focus.defer(10,this);
        $A.Masker.unmask(this.wb);
    },
    onAjaxFailed : function(res,opt){
        $A.Masker.unmask(this.wb);
    },
    focus: function(){
        this.fs.focus();
    },
    renderLockArea : function(){
        var sb = [];var cols = [];
        var v = 0;
        var columns = this.columns;
        for(var i=0,l=columns.length;i<l;i++){
            if(columns[i].lock === true){
                cols.add(columns[i]);
                if(columns[i].hidden !== true) v += columns[i].width;
            }
        }
        this.lockWidth = v;
        sb.add('<TABLE cellSpacing="0" atype="grid.lbt" cellPadding="0" border="0"  width="'+v+'"><TBODY>');
        sb.add(this.createTH(cols));
        for(var i=0,l=this.dataset.data.length;i<l;i++){
            sb.add(this.createRow('l', i, cols, this.dataset.getAt(i)));
        }
        sb.add('</TBODY></TABLE>');
        sb.add('<DIV style="height:17px"></DIV>');
        this.lb.update(sb.join(''));
        this.lbt = this.lb.child('table[atype=grid.lbt]'); 
    },
    renderUnLockAread : function(){
        var sb = [];var cols = [];
        var v = 0;
        var columns = this.columns;
        for(var i=0,l=columns.length;i<l;i++){
            if(columns[i].lock !== true){
                cols.add(columns[i]);
                if(columns[i].hidden !== true) v += columns[i].width;
            }
        }
        sb.add('<TABLE cellSpacing="0" atype="grid.ubt" cellPadding="0" border="0" width="'+v+'"><TBODY>');
        sb.add(this.createTH(cols));
        for(var i=0,l=this.dataset.data.length;i<l;i++){
            sb.add(this.createRow('u', i, cols, this.dataset.getAt(i)));
        }
        sb.add('</TBODY></TABLE>');
        this.ub.update(sb.join(''));
        this.ubt = this.ub.child('table[atype=grid.ubt]'); 
    },
    isOverSplitLine : function(x){
        var v = 0;      
        var isOver = false;
        this.overColIndex = -1;
        var columns = this.columns;
        for(var i=0,l=columns.length;i<l;i++){
            var c = columns[i];
            if(c.hidden !== true) v += c.width;
            if(x < v+3 && x > v-3 && c.resizable != false){
                isOver = true;
                this.overColIndex = i;
                break;
            }
        }
        return isOver;
    },
    onRefresh : function(){
        this.onLoad(false)
    },
    onIndexChange:function(ds, r){
        var index = this.getDataIndex(r.id);
        if(index == -1)return;
        if(r != this.selectRecord){
            this.selectRow(index, false);
        }
    },
    isFunctionCol: function(c){
        return c.type == 'rowcheck' || c.type == 'rowradio'
    },
    onAdd : function(ds,record,index){
        if(this.lb)
        var sb = [];var cols = [];
        var v = 0;
        var columns = this.columns;
        var row = this.dataset.data.length-1;
        if(this.lbt){
            var ltr = document.createElement("TR");
            ltr.id=this.id+'$l'+'-'+record.id;
            ltr.className=(row % 2==0 ? '' : 'row-alt');
            for(var i=0,l=columns.length;i<l;i++){
                var col = columns[i];
                if(col.lock === true){
                    var td = document.createElement("TD");
                    td.recordid=''+record.id;
                    if(col.type == 'rowcheck') {
                        Ext.fly(td).set({'atype':'grid.rowcheck'})
                        td.className = 'grid-rowbox';
                    }else{
                        td.style.visibility=col.hidden === true ? 'hidden' : 'visible';
                        td.style.textAlign=col.align||'left';
                        if(!this.isFunctionCol(col)) td.dataindex=col.name;
                        Ext.fly(td).set({'atype':'grid-cell'});           
                    }
                    var cell = this.createCell(col,record, false);
                    td.innerHTML = cell;
                    ltr.appendChild(td);
                }
            }
            this.lbt.dom.tBodies[0].appendChild(ltr);
        }
        
        var utr = document.createElement("TR");
        utr.id=this.id+'$u'+'-'+record.id;
        utr.className=(row % 2==0 ? '' : 'row-alt');
        for(var i=0,l=columns.length;i<l;i++){
            var col = columns[i];
            if(col.lock !== true){
                var td = document.createElement("TD");
                td.style.visibility=col.hidden === true ? 'hidden' : 'visible';
                td.style.textAlign=col.align||'left';
                Ext.fly(td).set({
                    'dataindex':col.name,
                    'recordid':record.id,
                    'atype':'grid-cell'
                })
                var cell = this.createCell(col,record,false);
                td.innerHTML = cell;
                utr.appendChild(td);
            }
        }
        this.ubt.dom.tBodies[0].appendChild(utr);
    },
    onUpdate : function(ds,record, name, value){
        var div = Ext.get(this.id+'_'+name+'_'+record.id);
        if(div){
            var c = this.findColByName(name);
            if(c&&c.type=='cellcheck'){
                div.removeClass('item-ckb-c');
                div.removeClass('item-ckb-u')
                var cls = this.getCheckBoxStatus(record, name);
                div.addClass(cls)
            }else{
                var text =  this.renderText(record,c, value);
                div.update(text);
            }
        }
        var cls = this.columns;
        for(var i=0,l=cls.length;i<l;i++){
            var c = cls[i];
            if(c.name != name && c.editorfunction){
                var ef = window[c.editorfunction];
                if(ef) {
                    var editor = ef.call(window,record,c.name);
                    var ediv = Ext.get(this.id+'_'+c.name+'_'+record.id);
                    if(ediv){
                        (editor == '') ? ediv.removeClass(this.cecls) : ediv.addClass(this.cecls);
                    }
                }
            }
        }
    },
    onValid : function(ds, record, name, valid){
        var c = this.findColByName(name);
//      if(c&&c.editor){
        if(c){
            var div = Ext.get(this.id+'_'+name+'_'+record.id);
            if(div) {
                if(valid == false){
                    div.addClass('item-invalid');
                }else{
                    div.removeClass('item-invalid');
                    div.removeClass(this.nbcls);
                }
            }
        }
    },
    onRemove : function(ds,record,index){
        var lrow = Ext.get(this.id+'$l-'+record.id);
        if(lrow)lrow.remove();
        
        var urow = Ext.get(this.id+'$u-'+record.id);
        if(urow)urow.remove();
        $A.Masker.unmask(this.wb);
    },
    onClear : function(){
        
    },
    onFieldChange : function(ds, record, field, type, value){
        switch(type){
           case 'required':
               var div = Ext.get(this.id+'_'+field.name+'_'+record.id);
               if(div) {
                   (value==true) ? div.addClass(this.nbcls) : div.removeClass(this.nbcls);
               }
               break;
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
        var index = -1;
        for(var i=0,l=this.dataset.data.length;i<l;i++){
            var item = this.dataset.getAt(i);
            if(item.id == rid){
                index = i;
                break;
            }
        }
        return index;
    },
    onSelect : function(ds,record){
        var cb = Ext.get(this.id+'__'+record.id);
        if(cb && this.selectable && this.selectionmodel=='multiple') {
            this.setCheckBoxStatus(cb, true);
        }else{
            this.setRadioStatus(cb,true);
        }
    },
    onUnSelect : function(ds,record){
        var cb = Ext.get(this.id+'__'+record.id);
        if(cb && this.selectable && this.selectionmodel=='multiple') {
            this.setCheckBoxStatus(cb, false);
        }else{
            this.setRadioStatus(cb,false);
        }
    },
    onDblclick : function(e){
        var target = Ext.fly(e.target).findParent('td[atype=grid-cell]');
        if(target){
            var rid = Ext.fly(target).getAttributeNS("","recordid");
            var record = this.dataset.findById(rid);
            var row = this.dataset.indexOf(record);
            var name = Ext.fly(target).getAttributeNS("","dataindex");
            this.fireEvent('dblclick', this, record, row, name)
        }
    },
    onClick : function(e) {
        var target = Ext.fly(e.target).findParent('td');
        if(target){
            var atype = Ext.fly(target).getAttributeNS("","atype");
            var rid = Ext.fly(target).getAttributeNS("","recordid");
            if(atype=='grid-cell'){
                var record = this.dataset.findById(rid);
                var row = this.dataset.indexOf(record);
                var name = Ext.fly(target).getAttributeNS("","dataindex");
                this.fireEvent('cellclick', this, row, name, record);
                this.showEditor(row,name);
                this.fireEvent('rowclick', this, row, record);
            }else if(atype=='grid.rowcheck'){               
                var cb = Ext.get(this.id+'__'+rid);
                var checked = cb.hasClass('item-ckb-c');
                (checked) ? this.dataset.unSelect(rid) : this.dataset.select(rid);
            }else if(atype=='grid.rowradio'){
                this.dataset.select(rid);
            }
        }
    },
    /**
     * 设置当前行的编辑器.
     * 
     * @param {String} name 当前列的name.
     * @param {String} editor 编辑器的id. ''空表示没有编辑器.
     */
    setEditor: function(name,editor){
        var col = this.findColByName(name);
        col.editor = editor;
        var div = Ext.get(this.id+'_'+name+'_'+this.selectRecord.id)
        if(div){
            (editor == '') ? div.removeClass(this.cecls) : div.addClass(this.cecls)
        }
    },
    /**
     * 显示编辑器.
     * @param {Number} row 行号
     * @param {String} name 当前列的name.
     */
    showEditor : function(row, name){       
        if(row == -1)return;
        var col = this.findColByName(name);
        if(!col)return;
        var record = this.dataset.getAt(row);
        if(!record)return;
        if(record.id != this.selectedId);
        this.selectRow(row);
        this.focusColumn(name);
        
        if(col.editorfunction) {
            var ef = window[col.editorfunction];
            if(ef==null) {
                alert("未找到"+col.editorfunction+"方法!") ;
                return;
            }
            var editor = ef.call(window,record,name)
            this.setEditor(name, editor);
        }
        var editor = col.editor;
        if(col.type == 'cellcheck'){
            var field = this.dataset.getField(name)
            var cv = field.getPropertity('checkedvalue');
            var uv = field.getPropertity('uncheckedvalue');
            var v = record.get(name);
            record.set(name, v == cv ? uv : cv);
        } else if(editor){
            var dom = document.getElementById(this.id+'_'+name+'_'+record.id);
            var xy = Ext.fly(dom).getXY();
            var sf = this;
            setTimeout(function(){
                var v = record.get(name)
                sf.currentEditor = {
                    record:record,
                    ov:v,
                    name:name,
                    editor:$(editor)
                };
                var ed = sf.currentEditor.editor;
                if(ed){
                    ed.setHeight(Ext.fly(dom.parentNode).getHeight()-5)
                    ed.setWidth(Ext.fly(dom.parentNode).getWidth()-7);
                    ed.isFireEvent = true;
                    ed.isHidden = false;
                    ed.move(xy[0],xy[1])
                    ed.bind(sf.dataset, name);
                    ed.render(record);
                    ed.focus();
                    ed.on('blur',sf.onEditorBlur, sf);
                    Ext.get(document.documentElement).on("mousedown", sf.onEditorBlur, sf);
                }
            },1)
        }           
    },
    /**
     * 指定行获取焦点.
     * @param {Number} row
     */
    focusRow : function(row){
        var r = 25;
        var stop = this.ub.getScroll().top;
        if(row*r<stop){
            this.ub.scrollTo('top',row*r-1)
        }
        if((row+1)*r>(stop+this.ub.getHeight())){//this.ub.dom.scrollHeight
            var st = this.ub.dom.scrollWidth > this.ub.dom.clientWidth ? (row+1)*r-this.ub.getHeight() + 16 : (row+1)*r-this.ub.getHeight();
            this.ub.scrollTo('top',st)
        }
        this.focus();
    },
    focusColumn: function(name){
        var r = 25;
        var sleft = this.ub.getScroll().left;
        var ll = lr = lw = tw = 0;
        for(var i=0,l=this.columns.length;i<l;i++){
            var c = this.columns[i];
            if(c.name && c.name == name) {
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
            this.ub.scrollTo('left',ll)
        }
        if((lr-sleft)>(this.width-lw)){
            this.ub.scrollTo('left',lr  - this.width + lw)
        }
        this.focus();
    },
    /**
     * 隐藏当前编辑器
     */
    hideEditor : function(){
        if(this.currentEditor && this.currentEditor.editor){
            var ed = this.currentEditor.editor;
            ed.un('blur',this.onEditorBlur, this);
            var needHide = true;
            if(ed.canHide){
                needHide = ed.canHide();
            }
            if(needHide) {
                Ext.get(document.documentElement).un("mousedown", this.onEditorBlur, this);
                var ed = this.currentEditor.editor;
                ed.move(-10000,-10000);
                ed.isFireEvent = false;
                ed.isHidden = true;
            }
        }
    },
    onEditorBlur : function(e){
        if(this.currentEditor && !this.currentEditor.editor.isEventFromComponent(e.target)) {           
            this.hideEditor();
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
        var lw = 0;
        if(this.uht){
            lw = this.uht.getXY()[0] + this.uht.getScroll().left;
        }
        this.hmx = e.xy[0] - lw + this.lockWidth;
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
        this.sp.setHeight(this.height);
        this.sp.setVisible(true);
        this.sp.setStyle("top", this.wrap.getXY()[1]+"px")
        this.sp.setStyle("left", e.xy[0]+"px")
        Ext.get(document.documentElement).on("mousemove", this.onHeadMouseMove, this);
        Ext.get(document.documentElement).on("mouseup", this.onHeadMouseUp, this);
    },
    onHeadClick : function(e){
        var target = Ext.fly(e.target).findParent('td');
        var atype;
        if(target) {
            target = Ext.fly(target)
            atype = target.getAttributeNS("","atype");
        }
        if(atype=='grid.head'){
            var index = target.getAttributeNS("","dataindex");
            var col = this.findColByName(index);
            if(col.sortable === true){
                var d = target.child('div');
                this.dataset.setQueryParameter('ORDER_FIELD', index);
                if(this.currentSortTarget){
                    var cst = Ext.fly(this.currentSortTarget)
                    cst.removeClass('grid-desc');
                    cst.removeClass('grid-asc');
                }
                this.currentSortTarget = d;
                if(col.sorttype == 'asc') {
                    col.sorttype = 'desc'
                    d.removeClass('grid-asc');
                    d.addClass('grid-desc');
                    this.dataset.setQueryParameter('ORDER_TYPE', 'desc');
                }else{
                    col.sorttype = 'asc';
                    d.removeClass('grid-desc');
                    d.addClass('grid-asc');
                    this.dataset.setQueryParameter('ORDER_TYPE', 'asc');
                }
                if(this.dataset.getAll().length!=0)this.dataset.query();
            }
        }else if(atype=='grid.rowcheck'){
            var cb = target.child('div[atype=grid.headcheck]');
            var checked = cb.hasClass('item-ckb-c');
            this.setCheckBoxStatus(cb,!checked);
            if(!checked){
                this.dataset.selectAll();
            }else{
                this.dataset.unSelectAll();
            }
        }
    },
    setRadioStatus: function(el, checked){
        if(!checked){
            el.removeClass('item-radio-img-c');
            el.addClass('item-radio-img-u');
        }else{
            el.addClass('item-radio-img-c');
            el.removeClass('item-radio-img-u');
        }
    },
    setCheckBoxStatus: function(el, checked){
        if(!checked){
            el.removeClass('item-ckb-c');
            el.addClass('item-ckb-u');
        }else{
            el.addClass('item-ckb-c');
            el.removeClass('item-ckb-u');
        }
    },
    onHeadMouseMove: function(e){
//      this.draging = true
        e.stopEvent();
        this.dragEnd = e.getXY()[0];
        var move = this.dragEnd - this.dragStart;
        var c = this.columns[this.dragIndex];
        var w = c.width + move;
        if(w > 30 && w < this.width) {
            this.dragWidth = w;
            this.sp.setStyle("left", e.xy[0]+"px")
        }
    },
    onHeadMouseUp: function(e){
//      this.draging = false;
        Ext.get(document.documentElement).un("mousemove", this.onHeadMouseMove, this);
        Ext.get(document.documentElement).un("mouseup", this.onHeadMouseUp, this);      
        this.sp.setVisible(false);
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
        var col;
        for(var i=0,l=this.columns.length;i<l;i++){
            var c = this.columns[i];
            if(c.name && c.name.toLowerCase() === name.toLowerCase()){
                col = c;
                break;
            }
        }
        return col;
    }, 
    /**
     * 选中高亮某行.
     * @param {Number} row 行号
     */
    selectRow : function(row, locate){
        var record = this.dataset.getAt(row) 
        this.selectedId = record.id;
        if(this.selectlockTr) this.selectlockTr.setStyle(this.bgc,'');
        //if(this.selectUnlockTr) this.selectUnlockTr.setStyle(this.bgc,'');
        if(this.selectUnlockTr) this.selectUnlockTr.removeClass('row-selected');
        this.selectUnlockTr = Ext.get(this.id+'$u-'+record.id);
        if(this.selectUnlockTr)this.selectUnlockTr.addClass('row-selected');
        //if(this.selectUnlockTr)this.selectUnlockTr.setStyle(this.bgc,this.scor);
        
        this.selectlockTr = Ext.get(this.id+'$l-'+record.id);
        if(this.selectlockTr)this.selectlockTr.setStyle(this.bgc,this.scor);
        this.focusRow(row)
        
        var r = (this.dataset.currentPage-1)*this.dataset.pageSize + row+1;
        this.selectRecord = record
        if(locate!==false && r != null) {
//          this.dataset.locate(r);
            this.dataset.locate.defer(5, this.dataset,[r,false]);
        }
    },
    /**
     * 设置某列的宽度.
     * @param {String} name 列的name
     * @param {Number} size 列的宽度
     */
    setColumnSize : function(name, size){
        var columns = this.columns;
        var hth,bth,lw=0,uw=0;
        for(var i=0,l=columns.length;i<l;i++){
            var c = columns[i];
            if(c.name && c.name === name){
                if(c.hidden === true) return;
                c.width = size;
                if(c.lock !== true){                    
                    hth = this.uh.child('TH[dataindex='+name+']');
                    bth = this.ub.child('TH[dataindex='+name+']');                  
                }else{                          
                    if(this.lh) hth = this.lh.child('TH[dataindex='+name+']');
                    if(this.lb) bth = this.lb.child('TH[dataindex='+name+']');
                    
                }
            }
            c.lock !== true ? (uw += c.width) : (lw += c.width);
        }
        var tds = Ext.DomQuery.select('TD[dataindex='+name+']',this.wrap.dom);
        for(var i=0,l=tds.length;i<l;i++){
            var td = tds[i];
            var ce = Ext.fly(td).child('DIV.grid-cell');
            if(ce)Ext.fly(ce).setStyle("width", Math.max(size-11,0)+"px");
        }
        
        
        this.lockWidth = lw;
        if(hth) hth.setStyle("width", size+"px");
        if(bth) bth.setStyle("width", size+"px");
        if(this.lc){
            var lcw = Math.max(lw-1,0);
            this.lc.setStyle("width",lcw+"px");
            this.lc.setStyle('display',lcw==0 ? 'none' : '');
        }
        if(this.lht)this.lht.setStyle("width",lw+"px");
        if(this.lbt)this.lbt.setStyle("width",lw+"px");
        this.uc.setStyle("width", Math.max(this.width - lw,0)+"px");
        this.uh.setStyle("width",Math.max(this.width - lw,0)+"px");
        this.ub.setStyle("width",Math.max(this.width - lw,0)+"px");
        this.uht.setStyle("width",uw+"px");
        this.ubt.setStyle("width",uw+"px");
        this.syncSize();
    },
    syncSize : function(){
        var lw = 0;
        for(var i=0,l=this.columns.length;i<l;i++){
            var c = this.columns[i];
            if(c.hidden !== true){
                if(c.lock === true){
                    lw += c.width;
                }
            }
        }
        if(lw !=0){
            var us = this.width -lw;
            this.uc.setWidth(us);
            this.uh.setWidth(us);
            this.ub.setWidth(us);
        }
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
                this.setColumnSize(name, col.hiddenWidth);
                delete col.hiddenWidth;
//              if(!Ext.isIE){
                    var tds = Ext.DomQuery.select('TD[dataindex='+name+']',this.wrap.dom);
                    for(var i=0,l=tds.length;i<l;i++){
                        var td = tds[i];
                        Ext.fly(td).show();
                    }
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
                col.hiddenWidth = col.width;
                this.setColumnSize(name, 0, false);
//              if(!Ext.isIE){
                    var tds = Ext.DomQuery.select('TD[dataindex='+name+']',this.wrap.dom);
                    for(var i=0,l=tds.length;i<l;i++){
                        var td = tds[i];
                        Ext.fly(td).hide();
                    }
//              }
                col.hidden = true;
            }
        }       
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
        if(selected.length >0) $A.showComfirm('确认','确认删除选择记录?',this.deleteSelectRows.createDelegate(this));     
    },
    destroy: function(){
        $A.Grid.superclass.destroy.call(this);
        this.processDataSetLiestener('un');
        this.sp.remove();
        delete this.sp;
    }
});
$A.Grid.revision='$Rev$';