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
		if (this.lockColumns.length > 0) {
			var ltid = this.id + "_lb_tree",
				ltc = this.createTreeConfig(config, this.lockColumns, ltid, true,this);
			this.lb.set({id : ltid}).addClass('item-treegrid');
			var	lockTree = this.lockTree = new $A.Tree(ltc);
			lockTree.body = this.lb;
			lockTree.treegrid = this;
			lockTree.on('render', function() {
					this.processData();
					Ext.DomHelper.insertHtml("beforeEnd", this.lb.dom,
							'<div style="height:17px"></div>');
				}, this)
			lockTree.on('expand', function(tree, node) {
				this.unlockTree.getNodeById(node.id).expand();
			}, this);
			lockTree.on('collapse', function(tree, node) {
				this.unlockTree.getNodeById(node.id).collapse();
			}, this)
		}

		var utid = this.id + "_ub_tree",
			tc = this.createTreeConfig(config, this.unlockColumns, utid,this.lockColumns.length == 0, this);
		this.ub.set({id : utid}).addClass('item-treegrid');
		var unlockTree = this.unlockTree = new $A.Tree(tc);
		unlockTree.body = this.ub;
		unlockTree.treegrid = this;
		unlockTree.on('render', this.processData, this);
	},
	initTemplate : function() {
		$A.TreeGrid.superclass.initTemplate.call(this);
		this.cbTpl = new Ext.Template('<center style="width:{width}px"><div class="{cellcls}" style="height:13px;padding:0px;" id="'
				+ this.id + '_{name}_{recordid}"></div></center>');
	},
	createTemplateData : function(col, record) {
		return {
			width : col.width - 2,
			// cwidth:col.width-4,
			recordid : record.id,
			visibility : col.hidden === true ? 'hidden' : 'visible',
			name : col.name
		}
	},
	createTreeConfig : function(config, columns, id, showSkeleton, grid) {
		var c = columns[0],
			width = c? c.width : 150;
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
							if (c.name == node.ownerTree.displayfield)
								return;
							var name = c.name,
								td = node.els[name + '_td'] = document.createElement('td'),
								r = node.record,
								align = c.align;
							td['_type_'] = 'text';
							td['atype'] = 'grid-cell';
							td['dataindex'] = name;
							td['recordid'] = r.id;
							if (align)
								td.style.textAlign = align;

							// var div = document.createElement('div');
							// node.els[c.name+'_text']= div
							// Ext.fly(div).setWidth(c.width-4);
							// div.innerHTML =
							// grid.renderText(node.record,c,node.record.get(c.name));
							//                        
							Ext.fly(td).setWidth(c.width - 2).addClass('node-text');
							td.appendChild(node.els[name + '_text'] = Ext.DomHelper.insertHtml(
									"afterBegin", td, grid.createCell(c, r,
									false)));
							node.els['itemNodeTr'].appendChild(td);
						});
					},
					createTreeNode : function(item) {
						return new $A.Tree.TreeGridNode(item);
					},
					onNodeSelect : function(el) {
						el['itemNodeTable'].style.backgroundColor = '#dfeaf5';
					},
					onNodeUnSelect : function(el) {
						el['itemNodeTable'].style.backgroundColor = '';
					}
				});
	},
	processData : function(tree, root) {
		if (!root)
			return;
		var items = [];
		if (tree.showRoot) {
			this.processNode(items, root)
		} else {
			Ext.each(root.children,function(child){
				this.processNode(items, child);
			},this);
		}
		this.dataset.data = items;
		// this.onLoad();
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
		this.dataset = ds;
		this.processDataSetLiestener('on');
		if (this.lockTree)
			this.lockTree.bind(ds);
		this.unlockTree.bind(ds);
		this.drawFootBar();
	},
	setColumnSize : function(name, size) {
		$A.TreeGrid.superclass.setColumnSize.call(this, name, size);
		var c = this.findColByName(name),
			tree = c.lock == true ? this.lockTree : this.unlockTree;
		c.width = size;
		if (name == tree.displayfield) tree.width = size;
		tree.root.setWidth(name, size);// (name == tree.displayfield) ? size-2
										// :
	},
	renderLockArea : function() {
		var v = 0;
		Ext.each(this.columns,function(c){
			if (c.lock === true && c.hidden !== true) {
				v += c.width;
			}
		});
		this.lockWidth = v;
	},
	focusRow : function(row){
		var n=0,
			tree = this.unlockTree,
			hash = tree.nodeHash,
			datas = this.dataset.data;
        for(var i = 0 ; i<row ;i++){
        	if(tree.isAllParentExpand(hash[datas[i].id]))n++;
        }
        $A.TreeGrid.superclass.focusRow.call(this,n);
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
				var tree = this.getOwnerTree(),
					tc = tree.column,
					align = tc.align,
					r = this.record,
					td = this.els[df + '_td'];
				this.els[df + '_text'] = Ext.DomHelper.insertHtml("afterBegin", this.els[df
								+ '_td'], tree.treegrid.createCell(tc, r,
						false));
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
//			,
//			setWidth : function(n, w) {
//				$A.Tree.TreeGridNode.superclass.setWidth.call(this, n, w);
//			}
		});