$A.TreeGrid = Ext.extend($A.Grid,{
	initComponent:function(config){
        $A.TreeGrid.superclass.initComponent.call(this, config);
        if(!this.tree){
        	var c = config.columns[0];
        	var w = (c) ? c.width : 150;
        	this.lb.set({id:this.id+"_tree"})
        	var tc = Ext.apply(config.treeconfig,{
        		id:this.id+"_tree",
        		width: w,
                onNodeSelect : function(el){
                    el['itemNodeTable'].style.backgroundColor='#dfeaf5';
                },
                onNodeUnSelect : function(el){
                   el['itemNodeTable'].style.backgroundColor='';
                }
        	});
        	
            this.tree = new $A.Tree(tc);
            this.lb.addClass('item-treegrid');
            this.tree.body = this.lb;
            this.tree.on('render',this.processData,this)
            this.tree.on('expand',function(node){
                //alert('expand ' + node)             
            })
        }
	},
	processData : function(tree,root){
		if(!root) return;
        var items = [];
        var datas = this.dataset.data;
        if(this.tree.showRoot){
        	this.processNode(items, root)
        }else{
        	var children = root.children;
        	for(var i=0;i<children.length;i++){
                this.processNode(items,children[i])
        	}
        }
        this.dataset.data = items;
        this.onLoad();
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
		this.tree.bind(ds);
//        this.onLoad();
    },
    setColumnSize : function(name, size){
    	$A.TreeGrid.superclass.setColumnSize.call(this, name,size);
        if(name=='id'){
            this.tree.width = size;
            this.tree.syncSize();
        }
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
    	this.tree.destroy();
        $A.TreeGrid.superclass.destroy.call(this);
    }
});