$A.TreeGrid = Ext.extend($A.Grid,{
    initComponent:function(config){
        $A.TreeGrid.superclass.initComponent.call(this, config);
        if(this.lockColumns.length >0){
            var ltid = this.id+"_lb_tree"
            this.lb.set({id:ltid});
            var ltc = this.createTreeConfig(config,this.lockColumns,ltid,true,this);
            this.lockTree = new $A.Tree(ltc);
            this.lb.addClass('item-treegrid');
            this.lockTree.body = this.lb;
            this.lockTree.on('render',this.processData,this)
            this.lockTree.on('expand',function(node){
                //alert('expand ' + node)             
            })
        }
        
        var utid = this.id+"_ub_tree"
        this.ub.set({id:utid});
        var tc = this.createTreeConfig(config,this.unlockColumns,utid,this.lockColumns.length==0,this);
        this.unlockTree = new $A.Tree(tc);
        this.ub.addClass('item-treegrid');
        this.unlockTree.body = this.ub;
        this.unlockTree.on('render',this.processData,this)
        this.unlockTree.on('expand',function(node){
            //alert('expand ' + node)             
        })
    },
    createTreeConfig : function(config,columns,id,showSkeleton,grid){
    	var c = columns[0];
        var width = (c) ? c.width : 150;
        return Ext.apply(config,{
            id:id,
            showSkeleton:showSkeleton,
            width: width,
            displayfield: c.name,
            renderer:c.renderer,
            initColumns : function(node){
                if(!node.isRoot()){
                    for(var i=0;i<columns.length;i++){
                        var c = columns[i];
                        if(c.name == node.ownerTree.displayfield) continue;
                        var td = document.createElement('td');
                        td['_type_'] ='text';
                        node.els[c.name+'_td'] = td;
                        
//                        var div = document.createElement('div');
//                        node.els[c.name+'_text']= div
//                        Ext.fly(div).setWidth(c.width-4);
//                        div.innerHTML = grid.renderText(node.record,c,node.record.get(c.name));
//                        
                        
                        var html = grid.createCell(c,node.record,false);
                        node.els[c.name+'_text'] = Ext.DomHelper.insertHtml("afterBegin",td,html);
                        
                        td.appendChild(node.els[c.name+'_text']);
                        td.className='node-text';
                        td.style.textAlign=c.align||'left';
                        node.els['itemNodeTr'].appendChild(node.els[c.name+'_td']);
                    }
               }    
            },
            createTreeNode : function(item){
                return new $A.Tree.TreeGridNode(item);
            },
            onNodeSelect : function(el){
                el['itemNodeTable'].style.backgroundColor='#dfeaf5';
            },
            onNodeUnSelect : function(el){
               el['itemNodeTable'].style.backgroundColor='';
            }
        });
    },
    processData : function(tree,root){
        if(!root) return;
        var items = [];
        var datas = this.dataset.data;
        if(tree.showRoot){
            this.processNode(items, root)
        }else{
            var children = root.children;
            for(var i=0;i<children.length;i++){
                this.processNode(items,children[i])
            }
        }
        this.dataset.data = items;
//        this.onLoad();
    },
    processNode : function(items,node){
        items.add(node.record);
        var children = node.children;
        for(var i=0;i<children.length;i++){
            this.processNode(items,children[i])
        }
    },
    bind : function(ds){
        if(typeof(ds)==='string'){
            ds = $A.CmpManager.get(ds);
            if(!ds) return;
        }
        this.dataset = ds;
        this.processDataSetLiestener('on');  
        if(this.lockTree)this.lockTree.bind(ds);
        this.unlockTree.bind(ds);
        this.drawFootBar();
    },
    setColumnSize : function(name, size){
        $A.TreeGrid.superclass.setColumnSize.call(this, name,size);
        var c = this.findColByName(name);
        var tree = (c.lock == true) ? this.lockTree : this.unlockTree;
        tree.root.setWidth(name,size-2);//(name == tree.displayfield) ? size-2 : 
    },
    renderLockArea : function(){
        var v = 0;
        var columns = this.columns;
        for(var i=0,l=columns.length;i<l;i++){
            if(columns[i].lock === true){;
                if(columns[i].hidden !== true) v += columns[i].width;
            }
        }
        this.lockWidth = v;
    },
    destroy: function(){
        if(this.lockTree) this.lockTree.destroy();
        this.unlockTree.destroy();
        $A.TreeGrid.superclass.destroy.call(this);
    }
});
$A.Tree.TreeGridNode = Ext.extend($A.Tree.TreeNode,{
    createNode : function(item){
        return new $A.Tree.TreeGridNode(item);
    },
    render : function(){
        $A.Tree.TreeGridNode.superclass.render.call(this);
        var tree = this.getOwnerTree();
        this.setWidth(tree.displayfield, tree.width-2);
    },
    setWidth : function(n,w){
        $A.Tree.TreeGridNode.superclass.setWidth.call(this, n,w);
    }
});