/**
 * @class Aurora.DynamicTree
 * @extends Aurora.Tree
 * <p>动态树形组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.DynamicTree = Ext.extend($A.Tree,{
    createTreeNode : function(item){
        return new $A.DynamicTree.TreeNode(item);
    }
})
/**
 * @class Aurora.DynamicTree.TreeNode
 * @extends Aurora.Tree.TreeNode
 * <p>动态树节点对象.
 * @author njq.niu@hand-china.com
 * @constructor 
 */
$A.DynamicTree.TreeNode = Ext.extend($A.Tree.TreeNode,{
    createNode : function(item){
        return new $A.DynamicTree.TreeNode(item);
    },
    expand : function(){
        if(this.childNodes.length>0){
            if(!this.isRoot())
            this.record.set(this.getOwnerTree().expandfield,"Y",true);
            this.isExpand=true;
            this.paintChildren();
            this.els['child'].style.display='block';
            this.paintIconImg();
            this.paintClipIcoImg();
            this.refreshDom();
        } else if(!this.isLoaded){
            var tree = this.getOwnerTree();
            var ds = tree.dataset;
            this.els['icon'].className = 'node-icon icon-loading';
            $A.request({
						url : ds.queryurl,
						para : this.data.record.data,
						success : function(res) {
                            this.isLoaded = true;
                            if(!res.result.record) res.result.record = [];
                            var records = [].concat(res.result.record);
                            if(records.length==0){
                                this.els['icon'].className = 'node-icon icon-node';
                                this.paintClipIcoImg();
                            }
                            var m = Number.MAX_VALUE;
                            records.sort(function(a, b){
                                return parseFloat(a[tree.sequencefield]||m) - parseFloat(b[tree.sequencefield]||m);
                            });
                            for(var i=0;i<records.length;i++){
                                ds.create(records[i]);                                
                            }
						},
						scope : this
					});
        }
        
    },
    isLeaf : function(){
        return this.isLoaded ? this.childNodes.length===0 : false
    }
});