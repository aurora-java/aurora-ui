/**
 * @class Aurora.DynamicTreeGrid
 * @extends Aurora.TreeGrid
 * <p>树形表格组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.DynamicTreeGrid = Ext.extend($A.TreeGrid, {
	createTreeConfig : function(config, columns, id, showSkeleton, grid) {
        var config = $A.DynamicTreeGrid.superclass.createTreeConfig.call(this, config,columns,id,showSkeleton,grid);
		config['createTreeNode']= function(item) {
			return new $A.DynamicTreeGrid.TreeNode(item);
		}
        return config;
	}
    
});
$A.DynamicTreeGrid.TreeNode = Ext.extend($A.DynamicTree.TreeNode, {
			createNode : function(item) {
				return new $A.DynamicTreeGrid.TreeNode(item);
			},
			createCellEl : function(df) {
				var sf = this,tree = sf.getOwnerTree(),
					tc = tree.column,
					align = tc.align,
					r = sf.record,
					td = sf.els[df + '_td'];
				sf.els[df + '_text'] = Ext.DomHelper.insertHtml("afterBegin", sf.els[df
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
				$A.DynamicTreeGrid.TreeNode.superclass.render.call(this);
				var tree = this.getOwnerTree();
				this.setWidth(tree.displayfield, tree.width);
			}
		});