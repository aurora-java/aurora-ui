/**
 * @class Aurora.TreeGrid
 * @extends Aurora.Grid
 * <p>树形表格组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.TreeGrid = Ext.extend($A.Grid, {
    initComponent : function(config) {
        $A.TreeGrid.superclass.initComponent.call(this, config);
        delete config.marginheight;
        delete config.marginwidth;
        var showSkeleton = (this.selectable && this.lockColumns.length == 1) || this.lockColumns.length == 0;
        var lockTree;
        if (this.lockColumns.length > 0) {
            var ltid = this.id + "_lb_tree";
            this.lb.set({id : ltid}).addClass('item-treegrid');
            lockTree = this.lockTree = new $A.Tree(this.createTreeConfig(config, this.lockColumns, ltid, !showSkeleton,this));
            lockTree.body = this.lb;
            lockTree.treegrid = this;
        }

        var utid = this.id + "_ub_tree";
        this.ub.set({id : utid}).addClass('item-treegrid');
        var unlockTree = this.unlockTree = new $A.Tree(this.createTreeConfig(config, this.unlockColumns, utid,showSkeleton, this));
        unlockTree.body = this.ub;
        unlockTree.treegrid = this;
        this.initTreeLisener(lockTree,unlockTree)
    },
    initTreeLisener : function(lockTree,unlockTree){
        if(lockTree){
            lockTree.on('render', function() {
                this.processData();
                Ext.DomHelper.insertHtml("beforeEnd", this.lb.dom,'<div style="height:17px"></div>');
            }, this)
            lockTree.on('expand', function(tree, node) {
                this.unlockTree.getNodeById(node.id).expand();
            }, this);
            lockTree.on('collapse', function(tree, node) {
                this.unlockTree.getNodeById(node.id).collapse();
            }, this);
        }
        unlockTree.on('render', this.processData, this);
        if(lockTree){
            unlockTree.on('expand', function(tree, node) {                
                this.lockTree.getNodeById(node.id).expand();
            }, this);
            unlockTree.on('collapse', function(tree, node) {
                this.lockTree.getNodeById(node.id).collapse();
            }, this);
        }
    },
    initTemplate : function() {
        $A.TreeGrid.superclass.initTemplate.call(this);
        this.cbTpl = new Ext.Template('<center style="width:{width}px"><div class="{cellcls}" style="height:13px;padding:0px;" id="'
                + this.id + '_{name}_{recordid}"></div></center>');
    },
    createTemplateData : function(col, record) {
    	var editor = this.getEditor(col,record),sp=
	    	(editor!='' &&
	            (editor = $A.CmpManager.get(editor)) && !(editor instanceof $A.CheckBox))?2:3;
        return {
            width : col.width - sp,
            // cwidth:col.width-4,
            recordid : record.id,
            visibility : col.hidden === true ? 'hidden' : 'visible',
            name : col.name
        }
    },
    createTreeConfig : function(config, columns, id, showSkeleton, grid) {
        var c = columns[0];
        if((c.type == 'rowcheck' || c.type == 'rowradio')&&columns.length>1){
            c = columns[1];
        }
        var width = c? c.width : 150;
        return Ext.apply(config, {
                    sw : 20,
                    id : id,
                    showSkeleton : showSkeleton,
                    width : width,
                    column : c,
                    displayfield : c.name,
                    renderer : c.renderer,
                    initColumns : function(node) {
                        if (node.isRoot() && node.ownerTree.showRoot == false) return;
                        Ext.each(columns,function(c){
                            var name = c.name,
                                r = node.record;
                            if(c.type == 'rowcheck' || c.type == 'rowradio'){
                                new Ext.Template(grid.createCell(c,r,null)).insertFirst(node.els['itemNodeTr'],{},true)//.setStyle({'border-right':'1px solid #ccc'});
                            }else if(name == node.ownerTree.displayfield){
                                return
                            }else{
                                var td = document.createElement('td'),
                                    align = c.align;
                                node.els[name + '_td'] = td;
                                if (align)
                                    td.style.textAlign = align;
                                td['recordid'] = r.id;
                                td['_type_'] = 'text';
                                td['atype'] = 'grid-cell';
                                td['dataindex'] = name;
                                td.appendChild(node.els[name + '_text'] = Ext.DomHelper.insertHtml(
                                    "afterBegin", td, grid.createCell(c, r,
                                    true)));
                                node.els['itemNodeTr'].appendChild(td);
                                Ext.fly(td).setWidth(c.width - 3).addClass('node-text');
                            }
                        });
                    },
                    createTreeNode : function(item) {
                        return new $A.Tree.TreeGridNode(item);
                    },
                    onNodeSelect : function(el) {
                        if(el)el['itemNodeTable'].style.backgroundColor = '#dfeaf5';
                    },
                    onNodeUnSelect : function(el) {
                        if(el)el['itemNodeTable'].style.backgroundColor = '';
                    }
                });
    },
    processData : function(tree, root) {
        if (!root)
            return;
        var sf = this,items = [];
        if (tree.showRoot) {
            sf.processNode(items, root)
        } else {
            Ext.each(root.children,function(child){
                sf.processNode(items, child);
            });
        }
        sf.dataset.data = items;
        sf.editing &&
            sf.positionEditor();
        
    },
    onLoad : function(){
        this.drawFootBar();
        $A.Masker.unmask(this.wb);
    },
    processNode : function(items, node) {
        items.add(node.record);
        Ext.each(node.children,function(child){
            this.processNode(items, child);
        },this);
    },
    bind : function(ds) {
        if (typeof(ds) === 'string') {
            ds = $A.CmpManager.get(ds);
            if (!ds)
                return;
        }
        var sf = this;
        sf.dataset = ds;
        sf.processDataSetLiestener('on');
        if (sf.lockTree)
            sf.lockTree.bind(ds);
        sf.unlockTree.bind(ds);
        sf.drawFootBar();
    },
    setColumnSize : function(name, size) {
        $A.TreeGrid.superclass.setColumnSize.call(this, name, size);
        var sf = this,c = sf.findColByName(name),
            tree = c.lock == true ? sf.lockTree : sf.unlockTree;
        c.width = size;
        if (name == tree.displayfield) tree.width = size;
        tree.root.setWidth(name, size);// (name == tree.displayfield) ? size-2
                                        // :
    },
    renderLockArea : function() {
        var sf = this,v = 0;
        Ext.each(sf.columns,function(c){
            if (c.lock === true && c.hidden !== true) {
                v += c.width;
            }
        });
        sf.lockWidth = v;
    },
    focusRow : function(row){
        var sf = this,record = sf.dataset.getAt(row),
            node = sf.unlockTree.getNodeById(record.id),
            els = node?node.els:null;
        if(!els)return;
        var ub = sf.ub,
            stop = ub.getScroll().top,
            height = Ext.fly(els.element).getTop()-ub.getTop()+stop;
            r = 25,
            h = ub.getHeight(),
            sh = ub.dom.scrollWidth > ub.dom.clientWidth? 16 : 0;
       (function(){
	        if(height<stop){
	            ub.scrollTo('top',height-1)
	        }else if(height+r>(stop+h-sh)){
	            ub.scrollTo('top', height+r-h + sh);
	        }
       }).defer(1);
    },
    onUpdate : function(ds,record, name, value){
        $A.TreeGrid.superclass.onUpdate.call(this,ds,record, name, value);
        var sf = this,c = ((sf.selectable && sf.lockColumns.length == 1) || sf.lockColumns.length == 0)?sf.unlockTree:sf.lockTree,
            node = c.getNodeById(record.id),
            tree = node.getOwnerTree();
            node.els && node.doSetWidth(tree.displayfield, tree.width);
    },
    onMouseWheel : function(e){
    },
    onAdd : function(){}
    
});
$A.Tree.TreeGridNode = Ext.extend($A.Tree.TreeNode, {
            createNode : function(item) {
                return new $A.Tree.TreeGridNode(item);
            },
            createCellEl : function(df) {
                var sf = this,tree = sf.getOwnerTree(),
                    tc = tree.column,
                    align = tc.align,
                    r = sf.record,
                    td = sf.els[df + '_td'];
                sf.els[df + '_text'] = Ext.DomHelper.insertHtml("afterBegin", td, tree.treegrid.createCell(tc, r,
                        true));
                td['dataindex'] = df;
                td['atype'] = 'grid-cell';
                td['recordid'] = r.id;
                if (align)
                    td.style.textAlign = align;
            },
            paintText : function() {
            },
            render : function() {
                $A.Tree.TreeGridNode.superclass.render.call(this);
                var tree = this.getOwnerTree();
                this.setWidth(tree.displayfield, tree.width);
            }
//          ,
//          setWidth : function(n, w) {
//              $A.Tree.TreeGridNode.superclass.setWidth.call(this, n, w);
//          }
        });
$A.TreeGrid.revision='$Rev$';