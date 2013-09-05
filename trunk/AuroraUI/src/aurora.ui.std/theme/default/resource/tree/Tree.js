/**
 * @class Aurora.Tree
 * @extends Aurora.Component
 * <p>树形组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Tree = Ext.extend($A.Component,{
	showSkeleton: true,
	sw:18,
	constructor: function(config){
		$A.Tree.superclass.constructor.call(this,config);
		this.context = config.context||'';
	},
	initComponent:function(config){
		this.nodeHash = {};
		$A.Tree.superclass.initComponent.call(this, config);
		this.body = this.wrap.child('div[atype=tree.body]');
	},
	processListener: function(ou){
    	$A.Tree.superclass.processListener.call(this,ou);
    	this.wrap[ou]('click', this.onClick, this)
    		[ou]('dblclick', this.onDblclick, this);
    },
	initEvents:function(){
		$A.Tree.superclass.initEvents.call(this);
		this.addEvents(
		/**
         * @event render
         * tree渲染事件.
         */
		'render',
		/**
         * @event collapse
         * 节点折叠事件.
         */
        'collapse',
        /**
         * @event expand
         * 节点展开事件.
         */
        'expand',
		/**
         * @event click
         * 点击事件.
         * @param {Aurora.Tree} Tree对象
         * @param {Aurora.Record} record 选中的Record对象
         * @param {Aurora.Tree.TreeNode} node 节点对象
         */
		'click',
		/**
         * @event dblclick
         * 双击事件.
         * @param {Aurora.Tree} Tree对象
         * @param {Aurora.Record} record 选中的Record对象
         * @param {Aurora.Tree.TreeNode} node 节点对象
         */
		'dblclick');
	},
	destroy : function(){
		$A.Tree.superclass.destroy.call(this);
    },
	processDataSetLiestener: function(ou){
		var ds = this.dataset;
		if(ds){
			ds[ou]('update', this.onUpdate, this);
	    	ds[ou]('load', this.onLoad, this);
	    	ds[ou]('indexchange', this.onIndexChange, this);
//			ds[ou]('metachange', this.onRefresh, this);
	    	ds[ou]('add', this.onAdd, this);
//	    	ds[ou]('valid', this.onValid, this);
	    	ds[ou]('remove', this.onRemove, this);
//	    	ds[ou]('clear', this.onLoad, this);
//	    	ds[ou]('refresh',this.onRefresh,this);
//	    	ds[ou]('fieldchange', this.onFieldChange, this);
		}
	},
	bind: function(ds){
		if(typeof(ds)==='string'){
			ds = $(ds);
			if(!ds) return;
		}
		var sf = this;
		sf.dataset = ds;
		sf.processDataSetLiestener('on');
//        if(ds.data.length >0)
    	$A.onReady(function(){
            sf.onLoad();
        })
	},
	onAdd : function(ds,record){
		var records = this.dataset.getAll(),
			pid = record.get(this.parentfield),
			pnode,sequencefield = this.sequencefield,
			seq = record.get(sequencefield),
			refnode;
		if(!Ext.isEmpty(pid)){
			for(var i = 0,l=records.length;i<l;i++){
				var r = records[i];
				if(r.get(this.idfield) === pid){
					pnode = this.getNodeById(r.id);
					break;
				}
			}
		}
		if(!pnode){
			if(this.showRoot){
				this.onLoad();
				this.root.firstChild.expand();
				return;
			}else{
				pnode = this.root;
			}
		}
		Ext.each(pnode.childNodes,function(node){
			var tseq = node.record.get(sequencefield)
			if(tseq && tseq>seq){
				refnode = node;
				return false;
			}
		});
		pnode.insertBefore(this.createTreeNode(this.createNode(record)),refnode);
	},
    onRemove : function(ds,record){
        var id = record.id,node = this.getNodeById(id)
        if(node){
            var parent = node.parentNode,
            	pnode = node.previousSibling,
            	nnode = node.nextSibling;
            if(parent){
                //this.focusNode = (this.focusNode == parent ? null : this.focusNode);
                this.unregisterNode(node,true);
                parent.removeChild(node);
                if(!this.focusNode || this.focusNode === node){
	                var index = -1,
	                	pc = parent.data.children;
	                Ext.each(pc,function(item,i){
	                	if(item.record.id == id){
	                        index = i;
	                        return false;
	                    }
	                });
	                if(index != -1){
	                    var ds = record.ds,n;
	                    pc.remove(pc[index]);
	                    ds.locate(ds.indexOf(
	                    	(n = pc[index-1])&&n.record
	                    	||(n = pc[index])&&n.record
	                    	||parent.record)+1);
	                }
                }
            }
        }
    },
	onUpdate : function(ds, record, name, value){
		if(this.parentfield == name || name == this.sequencefield){
			this.onLoad();
			ds.locate(ds.indexOf(record)+1);
		}else{
			var node = this.nodeHash[record.id];
			node && node.paintText();
		}
	},
	onIndexChange:function(ds, record){
		var node = this.nodeHash[record.id];
		if(node)this.setFocusNode(node);
	},
	/*onIndexChange:function(ds, record , isNext){
		var node = this.nodeHash[record.id];
		if(node){
			if(node.parentNode&&this.isAllParentExpand(node))
				this.setFocusNode(node);
			else{
				var p = node.parentNode,record = this['get'+(isNext?'Next':'Previous')+'ExpandedNode'](p).record;
				ds.locate(ds.getAll().indexOf(record)+1);
			}
		}
	},
	getNextExpandedNode:function(node){
		return node.nextSibling||this.getNextExpandedNode(node.parentNode);
	},
	getPreviousExpandedNode:function(node){
		return this.isAllParentExpand(node)?node:this.getPreviousExpandedNode(node.parentNode);
	},
	isAllParentExpand:function(node){
		var p=node.parentNode;
		return 	!p||(p.isExpand&&this.isAllParentExpand(p))
	},*/
	onClick : function(event,t){
		var elem = Ext.fly(t).findParent('td');
		if(!elem)return;
		var _type = elem['_type_'];
		if(_type === undefined){
			return;
		}
		elem = Ext.fly(t).findParent('div.item-node');
		var node = this.nodeHash[elem.indexId];
		if(_type == 'clip'){
			if(node){
				if(node.isExpand){
					node.collapse();
					this.fireEvent('collapse', this, node);
				}else{
					node.expand();
					this.fireEvent('expand', this, node);
				}
			}
		}else if(_type == 'icon' || _type == 'text'){
			this.setFocusNode(node);
//			this.dataset.locate.defer(5, this.dataset,[this.dataset.indexOf(node.record)+1,false]);
			var ds = this.dataset,r = node.record;
			ds.locate(ds.indexOf(r)+1,true);
			this.fireEvent('click', this, r, node);
		}else if(_type == 'checked'){
			node.onCheck();
		}
	},
	onDblclick : function(event,t){
		var elem = Ext.fly(t).findParent('td');
		if(!elem)return;
		var _type = elem['_type_'];
		if(typeof(_type) === undefined){
			return;
		}
		elem = Ext.fly(t).findParent('div.item-node');
		if(_type == 'icon' || _type == 'text'){
			var node = this.nodeHash[elem.indexId];
			if(node && node.childNodes.length){
				if(node.isExpand){
					node.collapse();
					this.fireEvent('collapse', this, node);
				}else{
					node.expand();
					this.fireEvent('expand', this, node);
				}
			}
			this.setFocusNode(node);
			var ds = this.dataset,r = node.record;
			ds.locate(ds.indexOf(r)+1,true);
			this.fireEvent('dblclick', this, r, node);
		}
	},
	getRootNode : function(){
		return this.root;
	},
	setRootNode : function(node){
		this.root = node;
		node.ownerTree = this;
		this.registerNode(node);
		node.cascade((function(node){
			this.registerNode(node);
		}),this);
	},
	/**
	 * 根据id获取节点对象
	 * @param {Number} id 节点id
	 * @return {Aurora.Tree.TreeNode} node 节点对象
	 */
	getNodeById : function(id){
		return this.nodeHash[id];
	},
	registerNode : function(node){
		this.nodeHash[node.id] = node;
	},
	unregisterNode : function(node, unRegisterChildren){
		delete this.nodeHash[node.id];
        if(unRegisterChildren){
        	Ext.each(node.childNodes,function(node){
                this.unregisterNode(node,unRegisterChildren);
        	},this)
        }
	},
	/**
	 * 设置节点焦点
	 * @param {Aurora.Tree.TreeNode} node 节点对象.
	 */
	setFocusNode : function(node){
		var f = this.focusNode,
			p = node.parentNode;
		if(f)f.unselect();
		this.focusNode = node;
		if(p && !p.isExpand)p.expand();
		node.select();
	},
	createNode: function(record){
		return {
			record:record,
			children:[]
		}
	},
	buildTree: function(){
		var array = [],
			map1 = {},
			map2 = {},
			i = 1,
			ds = this.dataset,
			rtnode,
			process = function(item){
				var children = item.children,
					checked1 = 0,
					checked2 = 0;
				Ext.each(children,function(node){
	                if(node.children.length >0){
	                    process(node);
	                } 
				});
	            Ext.each(children,function(node){
	                if(node.checked==2){
	                	checked2=1;
	                }else if(node.checked==1){
	                    checked1++;
	                    checked2=1
	                }
	            });
	            if(checked1==0&&checked2==0){
	            	item.checked = 0;
	            }else if(children.length==checked1){
	                item.checked = 1;
	            }else if(checked2!=0){
	                item.checked = 2;
	            }
			};
		Ext.each(ds.data,function(record){
			var id = record.get(this.idfield),
				node = this.createNode(record);
			if(Ext.isEmpty(id))id = 'EMPTY_'+i++;
			node.checked = (record.get(this.checkfield) == "Y") ? 1 : 0;
            node.expanded = record.get(this.expandfield) == "Y";
			map1[id] = node;
			map2[id] = node;
		},this);
		for(var key in map2){
			var node = map2[key],
				parent = map2[node.record.get(this.parentfield)];
			if(parent){
				parent.children.add(node);
				delete map1[key];
			}
		}
		for(var key in map1){
			array.push(map2[key]);
		}
		if(array.length == 1){
			this.showRoot = true;
			rtnode = array[0];
		}else{
			var data = {};
			data[this.displayfield] = '_root';
			var record =  new Aurora.Record(data),
				root = { 
				'record':record,
			    'children':[]
			}
			record.setDataSet(ds);
			Ext.each(array,function(c){
				root['children'].push(c);
			});
			this.showRoot = false;
			rtnode = root;
		}
		Ext.each(array,function(node){
			if(node.children.length >0){
        		process(node);
			}
		})
		
		this.sortChildren(rtnode.children,this.sequencefield);
		return rtnode;
	},
	sortChildren : function(children,sequence){
        if(sequence){
        	var m = Number.MAX_VALUE;
            children.sort(function(a, b){
            	a = a.record.get(sequence)||m;
            	b = b.record.get(sequence)||m;
            	if(isNaN(a)||isNaN(b)){
            		return a > b;
            	}else{
            		return a - b;
            	}
            });
        }else{
            children.sort();
        }
        Ext.each(children,function(n){
       	    this.sortChildren(n.children,sequence)
        },this);
	},
	createTreeNode : function(item){
		return new $A.Tree.TreeNode(item);
	},
	onLoad : function(){
		var root = this.buildTree();
		if(!root) {
			return;
		}
		var node = this.createTreeNode(root);
		this.setRootNode(node);		
		this.body.update('');
//		if(this.dataset.data.length>0)
		this.root.render();
		this.fireEvent('render', this,root);
	},
//	syncSize : function(){
//		this.root.syncSize();
//	},
	getIconByType : function(type){
		return type;
	},
	onNodeSelect : function(el){
		if(el)el[this.displayfield+'_text'].style.backgroundColor='#dfeaf5';
	},
	onNodeUnSelect : function(el){
	   if(el)el[this.displayfield+'_text'].style.backgroundColor='';
	},
	initColumns : function(node){}
})
/**
 * @class Aurora.Tree.TreeNode
 * @extends Aurora.Component
 * <p>树节点对象.
 * @author njq.niu@hand-china.com
 * @constructor 
 */
$A.Tree.TreeNode = function(data) {
	this.init(data)
}
$A.Tree.TreeNode.prototype={
	init : function(data){
		this.data = data;
        this.record = data.record;
        this.els = null;
        this.id = this.record.id;
        this.parentNode = null;
        this.childNodes = [];
        this.lastChild = null;
        this.firstChild = null;
        this.previousSibling = null;
        this.nextSibling = null;
        this.childrenRendered = false;
        this.isExpand = data.expanded;//false;    
        this.checked = data.checked;
    	Ext.each(data.children,function(node){
            this.appendChild(this.createNode(node));
    	},this);
	},
	createNode : function(item){
		return new $A.Tree.TreeNode(item);
	},
	createCellEl : function(df){
        var text = this.els[df+'_text']= document.createElement('div');
        this.els[df+'_td'].appendChild(text);		
	},
	initEl : function(){
		var tree = this.getOwnerTree(),
			df = tree.displayfield,
			text = this.record.get(df),
			div = document.createElement('div'),
			child = document.createElement('div'),
			table = document.createElement('table'),
			tbody = document.createElement('tbody'),
			tr = document.createElement('tr'),checkbox;
		div.className = 'item-node';
		table.border=0;
		table.cellSpacing=0;
		table.cellPadding=0;
		this.els = {element:div,itemNodeTable:table,itemNodeTbody:tbody,itemNodeTr:tr,child:child};
		tbody.appendChild(tr);
		table.appendChild(tbody);
		div.appendChild(table);
		if(tree.showSkeleton){
    		var line = tr.insertCell(-1),
    			clip = tr.insertCell(-1),
    			icon = this.icon? document.createElement('img') : document.createElement('div'),
    			iconTd = tr.insertCell(-1);
 			checkbox = tr.insertCell(-1);
     		line['_type_'] ='line';
    		line.className ='line';
    		clip['_type_'] ='clip';
    		clip.innerHTML = '&#160';
    		iconTd['_type_'] ='icon';
    		checkbox['_type_'] ='checked';
    		checkbox.innerHTML = '&#160';	
    		Ext.fly(iconTd).setWidth(18);
    		iconTd.appendChild(icon);
    		Ext.apply(this.els,{line:line,clip:clip,icon:icon,iconTd:iconTd,checkbox:checkbox})
		}
		var td = tr.insertCell(-1);
		this.els[df + '_td'] = td;
		this.createCellEl(df);
//		this.els[df+'_text']= document.createElement('div');
//		this.els[df+'_td'].appendChild(this.els[df+'_text']);
		td.className='node-text'
		tree.initColumns(this);
		
		div.noWrap='true';
		td['_type_'] ='text';
		if(tree.showcheckbox === false && checkbox) {
			checkbox.style.display='none';
		}
		if(this.isRoot() && text=='_root'){
			table.style.display='none';
		}
		div.appendChild(child);
		child.className= 'item-child';
		child.style.display='none';
		
	},
	render : function(){
		var tree = this.getOwnerTree();
		this.icon = this.record.get(tree.iconfield);
		if(!this.els){
			this.initEl();
		}
		var els = this.els,
			el = els['element'];
		if(this.isRoot()){
			tree.body.appendChild(el);
			if(tree.showRoot == false && tree.showSkeleton)
			els['icon'].style.display=els['checkbox'].style.display=els[tree.displayfield+'_text'].style.display='none';
			this.expand();
		}else{
			this.parentNode.els['child'].appendChild(el);
			if(this.isExpand)
			this.expand();
		}
		this.paintPrefix();
		el.indexId = this.id;
		this.paintCheckboxImg();
//		if(this.checked == true)
//		this.setCheck(true);
	},
//	syncSize : function(){
//        this.resize();
//        if(this.childrenRendered) {
//            var pathNodes = this.childNodes;
//            for(var i=0;i<pathNodes.length;i++){
//            	var node = pathNodes[i];
//            	node.syncSize();
//            }
//        }
//	},
	setWidth : function(name,w){
		if(this.width == w) return;
        this.width = w;
		this.doSetWidth(name,w);
        if(this.childrenRendered) {
        	Ext.each(this.childNodes,function(node){
				node.setWidth(name,w);
        	});
        }
	},
	doSetWidth : function(name,w){
		if(!w)return;
		if(this.isRoot() && this.getOwnerTree().showRoot == false) return;
		var els = this.els,
			tree = this.getOwnerTree(),
			left = w-(name == tree.displayfield && tree.showSkeleton ? 
				((tree.showcheckbox ? 1 : 0) +this.getPathNodes().length)*tree.sw
				: 0);
		Ext.fly(els[name+'_td']).setWidth(Math.max((left),0));
        (Ext.fly(els[name+'_text'].id)||Ext.fly(els[name+'_text'])).setWidth(Math.max((left-2),0));
	},
	paintPrefix : function(){
		this.paintLine();
		this.paintClipIcoImg();
		this.paintCheckboxImg();
		this.paintIconImg();
		this.paintText();
	},
	paintLine : function(){
		var ownerTree = this.getOwnerTree();
		if(!ownerTree.showSkeleton) return;
		var pathNodes = this.getPathNodes(),
			w = (pathNodes.length-2)*ownerTree.sw,
			line = this.els['line'],
			c = document.createElement('div');
		line.innerHTML = '';
		Ext.fly(line).setWidth(w);
		if(w==0){
			line.style.display='none';
		}
		Ext.fly(c).setWidth(w);
		for(var i = 1 ,count = pathNodes.length-1 ; i < count ; i++){
			var node = pathNodes[i],
				ld = document.createElement('div');
			ld.className = node.isLast()?'node-empty':'node-line';
			Ext.fly(ld).setWidth(ownerTree.sw);
			c.appendChild(ld);
		}
		line.appendChild(c);
	},
	paintClipIcoImg : function(){
		var ownerTree = this.getOwnerTree();
		if(!ownerTree.showSkeleton) return;
		var clip = this.els['clip'],
			prefix = 'empty',
			icon;
		if(this.isRoot()){
			clip.style.display='none';//不显示根节点的clip
			return;
		}else{
//		if(!this.isRoot()){
//			icon = this.isExpand ? 'nlMinus':'nlPlus';
//		}else{
			prefix = this.isLeaf()&&'join'||this.isExpand&&'minus'||'plus';
			icon = this.isLast()&&'Bottom'||this.isFirst()&&'Top'||'';
		}
//		clip.src = ownerTree.getIcon(icon);
		clip.className = 'node-clip clip-' + prefix + icon;
        clip.innerHTML = '<DIV class="tree_s"> </DIV>';
	},
	paintIconImg : function(){
		var ownerTree = this.getOwnerTree();
		if(!ownerTree.showSkeleton) return;
		var data = this.data,icon = data.icon,
			eicon = this.els['icon'];
		if(!icon){
			var type = data.type;
			if(type){
				icon = ownerTree.getIconByType(type);
			}
			if(!icon){
				if(this.isRoot()){
					icon = 'root';
				}else if(this.isLeaf()){
					icon = 'node';
				}else if(this.isExpand){
					icon = 'folderOpen';
				}else{
					icon = 'folder';
				}
			}
		}
		if(this.icon) {
			eicon.className = 'node-icon';
			eicon.src = ownerTree.context + this.icon;
		}else{
			eicon.className = 'node-icon icon-' + icon;//ownerTree.getIcon(icon);
		}
        eicon.style.width = 18;
        eicon.style.height = 18;
	},
	paintCheckboxImg : function(){
		if(!this.els || !this.getOwnerTree().showSkeleton) return;
		var checked = this.checked;
		this.els['checkbox'].className = checked==2?'checkbox2':checked==1?'checkbox1':'checkbox0';
        this.els['checkbox'].innerHTML = '<DIV class="_s"> </DIV>';
	},	
	paintText : function(){
		if(!this.els) return;
		var ownerTree = this.getOwnerTree(),
			r = this.record,
			df = ownerTree.displayfield,
			renderer = ownerTree.renderer,
			text = r.get(df);
		if(!Ext.isEmpty(renderer)){
			renderer = window[renderer];
			if(renderer)
				text = renderer.call(this, text, r, this);
		}
		this.els[df+'_text'].innerHTML=text;
	},
	paintChildren : function(){
//		var sequence = this.getOwnerTree().sequence;
		if(!this.childrenRendered){
//			this.els['child'].innerHTML = '';
			this.childrenRendered = true;			
//			this.childNodes.sort(function(a, b){
//	        	var n1 = a.record.get(sequence)||Number.MAX_VALUE;
//				var n2 = b.record.get(sequence)||Number.MAX_VALUE;
//	            return parseFloat(n1)-parseFloat(n2);
//	        });
			Ext.each(this.childNodes,function(node){
				node.render();
			});
		};
	},
	/**
	 * 折叠收起
	 */
	collapse : function(){
		this.isExpand=false;
		if(!this.isRoot())
		this.record.set(this.getOwnerTree().expandfield,"N",true);
		this.els['child'].style.display='none';
		this.paintIconImg();
		this.paintClipIcoImg();
        this.refreshDom();
	},
	/**
	 * 展开
	 */
	expand : function(){
		var p = this.parentNode;
		if(p&&p.isExpand == false)p.expand();
		if(!this.isLeaf()&&this.childNodes.length>0){
			if(!this.isRoot())
			this.record.set(this.getOwnerTree().expandfield,"Y",true);
			this.isExpand=true;
			this.paintChildren();
			this.els['child'].style.display='block';
		}
		this.paintIconImg();
		this.paintClipIcoImg();
        this.refreshDom();
	},
    refreshDom : function(){
        this.getOwnerTree().wrap.addClass('a');
        this.getOwnerTree().wrap.removeClass('a');
    },
	/**
	 * 选中节点
	 */
	select : function(){
		this.isSelect = true;
		this.getOwnerTree().onNodeSelect(this.els);
//		this.els['text'].style.backgroundColor='#dfeaf5';
	},
	/**
	 * 取消选择
	 */
	unselect : function(){
		this.isSelect = false;
        if(this.getOwnerTree())
		this.getOwnerTree().onNodeUnSelect(this.els);
//		this.els['text'].style.backgroundColor='';
	},
	getEl :  function(){
		return this.els;
	},
	setCheckStatus : function(checked){
		var c;
		if(checked==2||checked==3){
			var childNodes = this.childNodes,
				count = childNodes.length;
			if(count==0){
				c=checked==2?0:1;
			}else{
				var checked1 = 0,
					checked2 = 0;
				for(var i=0;i<count;i++){
					var checked = childNodes[i].checked;
					if(checked==1){
						checked1++;
					}else if(checked==2){
						checked2++;
					}
				}
				c = (childNodes.length==checked1) ? 1 : (checked1>0||checked2>0) ? 2 : 0;
			}
		}else{
			c=checked;
		}
		this.checked = c;
		if(!this.isRoot() || this.showRoot != false){
            this.record.set(this.getOwnerTree().checkfield, (c==1||c==2) ? "Y" : "N");
        }
		this.paintCheckboxImg();
	},
	setCheck : function(cked){
		var a = cked?1:0,b=a+2;
		this.cascade(function(node){
			node.setCheckStatus(a);
		});
		this.bubble(function(node){
			node.setCheckStatus(b);
		});
	},
	onCheck : function(){
		this.setCheck(this.checked == 0)
	},
	/**
	 * 是否是根节点
	 * @return {Boolean} isroot 是否根节点.
	 */
	isRoot : function(){
		return this.ownerTree && this.ownerTree.root === this;
	},
	/**
	 * 是否叶子节点
	 * @return {Boolean} isleaf 是否叶子节点.
	 */
	isLeaf : function(){
		return this.childNodes.length===0;
		//return this.leaf === true;
  	},
  	/**
  	 * 是否是最后一个节点.
  	 * @return {Boolean} islast 是否是最后.
  	 */
	isLast : function(){
		var p = this.parentNode;
		return !p ? true : p.childNodes[p.childNodes.length-1] == this;
//		return (!this.parentNode ? true : this.parentNode.lastChild == this);
	},
	/**
	 * 是否是第一个
	 * @return {Boolean} isfirst 是否是第一个.
	 */
	isFirst : function(){
		var tree = this.getOwnerTree(),
			p = this.parentNode;
		return p== tree.getRootNode()&&!tree.showRoot&&p.childNodes[0] == this;
//		return (!this.parentNode ? true : this.parentNode.firstChild == this);
	},
	hasChildNodes : function(){
		return this.childNodes.length > 0;
	},
	setFirstChild : function(node){
		this.firstChild = node;
	},
	setLastChild : function(node){
		this.lastChild = node;
	},
	appendChild : function(node){
		if(!Ext.isArray(node) && arguments.length > 1)node = arguments;
		var tree = this.getOwnerTree();
		Ext.each(node,function(node){
			//>>beforeappend
			var oldParent = node.parentNode;
  			//>>beforemove
  			if(oldParent){
				oldParent.removeChild(node);
			}
			var childs = this.childNodes,
				index = childs.length,
				ps = childs[index-1];
      		if(index == 0){
				this.setFirstChild(node);
      		}
			childs.push(node);
			node.parentNode = this;
			//
			if(ps){
				node.previousSibling = ps;
				ps.nextSibling = node;
			}else{
				node.previousSibling = null;
			}
			node.nextSibling = null;
      		this.setLastChild(node);
			node.setOwnerTree(tree);
			//>>append
			//if(oldParent) >>move

			if(this.childrenRendered){
				node.render();
			}
			if(this.els){
				this.cascade(function(n){
					n.paintPrefix()
					if(!n.childrenRendered)
						return false;
				});
			}
		},this);
		return node;
	},
	removeChild : function(node){
//		Ext.each(node.childNodes,function(cnode){
//			var record = cnode.record;
//			if(record){
//				record.ds.remove(record);
//			}
//		});
		var childs = this.childNodes,index = childs.indexOf(node);
		if(index == -1){
			return false;
		}
		//>>beforeremove
		childs.splice(index, 1);
		var p = node.previousSibling,
			n = node.nextSiblin,
			els = node.els;
		if(p){
	  		p.nextSibling = n;
		}
		if(n){
	  		n.previousSibling = p;
		}
		if(this.firstChild == node){
	  		this.setFirstChild(n);
		}
		if(this.lastChild == node){
	  		this.setLastChild(p);
		}
		node.setOwnerTree(null);
		//clear
		node.parentNode = null;
		node.previousSibling = null;
		node.nextSibling = null;
		//>>remove UI
		if(this.childrenRendered){
			if(els){
				var div = els['element'];
				if(div)this.els['child'].removeChild(div);	
			}
			if(childs.length==0){
				this.collapse();
			}
		}
	    if(this.els){
	    	this.cascade(function(node){
				node.paintPrefix()
				if(!node.childrenRendered)
					return false;
			});
	    }
		return node;
	},
	insertBefore : function(node, refNode){
		if(!refNode){
			return this.appendChild(node);
		}
		//移动位置是自身位置(不需要移动)
		if(node == refNode){
			return false;
		}
		var childs = this.childNodes,
			refIndex = childs.indexOf(refNode),
			oldParent = node.parentNode;
		//是子节点，并且是向后移动
		if(oldParent == this && childs.indexOf(node) < refIndex){
			refIndex--;
		}
		if(oldParent){
			oldParent.removeChild(node);
		}
		//设置节点间关系
		if(refIndex == 0){
			this.setFirstChild(node);
		}
		childs.splice(refIndex, 0, node);
		node.parentNode = this;
		var ps = childs[refIndex-1];
		if(ps){
			node.previousSibling = ps;
			ps.nextSibling = node;
		}else{
			node.previousSibling = null;
		}
		node.nextSibling = refNode;
		refNode.previousSibling = node;
		node.setOwnerTree(this.getOwnerTree());
		if(this.childrenRendered){
			this.childrenRendered = false;
			this.paintChildren();
		}
		if(this.els){
			this.paintPrefix()
		}
		return node;
	},
	replaceChild : function(newChild, oldChild){
		this.insertBefore(newChild, oldChild);
		this.removeChild(oldChild);
		return oldChild;
	},
	indexOf : function(child){
		return this.childNodes.indexOf(child);
	},
	getOwnerTree : function(){
		if(!this.ownerTree){
			this.bubble(function(p){
				if(p.ownerTree){
					this.ownerTree = p.ownerTree;
					return false;
				}
			},this);
		}
		return this.ownerTree;
	},
//	getDepth : function(){
//  		var depth = 0;
//  		this.bubble(function(){depth++});
//		return depth;
//	},
	setOwnerTree : function(tree){
		var ownerTree = this.ownerTree;
		if(tree != ownerTree){
			if(ownerTree){
				ownerTree.unregisterNode(this);
			}
			this.ownerTree = tree;
			Ext.each(this.childNodes,function(c){
				c.setOwnerTree(tree);
			});
			if(tree){
				tree.registerNode(this);
			}
		}
	},
	getPathNodes : function(){
		var nodes = [];
		this.bubble(function(){nodes.unshift(this)});
		return nodes;
	},
//	getPath : function(attr){
//		attr = attr || "id";
//		var p = this.parentNode,
//			sep = this.getOwnerTree().pathSeparator||',',
//			b = [this[attr]];
//		p.bubble(function(){
//			b.unshift(this[attr]);
//		})
//		return sep + b.join(sep);
//	},
	bubble : function(fn, scope, args){
  		var p = this;
		while(p){
			if(fn.call(scope || p, args || p) === false){
	    		break;
			}
	    	p = p.parentNode;
		}
	},
	cascade : function(fn, scope, args){
		if(fn.call(scope || this, args || this) !== false){
			var cs = this.childNodes;
			for(var i = 0, len = cs.length; i < len; i++) {
				cs[i].cascade(fn, scope, args);
			}
    	}
	},
	findChild : function(attribute, value){
		var c = null;
		Ext.each(this.childNodes,function(cs){
			if(cs.attributes[attribute] == value){
				c = cs;
      			return false;
     		}
		});
		return c;
	},
  	findChildBy : function(fn, scope){
  		var c = null;
		Ext.each(this.childNodes,function(cs){
			if(fn.call(scope||cs, cs) === true){
				c = cs;
      			return false;
     		}
		});
		return c;
  	},
	sort : function(fn, scope){
		var cs = this.childNodes,
			len = cs.length;
    	if(len > 0){
			cs.sort(scope?fn.createDelegate(scope):fn);
			for(var i = 0; i < len; i++){
				var n = cs[i];
		        n.previousSibling = cs[i-1];
		        n.nextSibling = cs[i+1];
		        if(i == 0){
		        	this.setFirstChild(n);
		        }
		        if(i == len-1){
         			this.setLastChild(n);
				}
			}
		}
	},
//  	contains : function(node){
//		var p = node.parentNode,r = false;
//		p.bubble(function(p){
//			if(p == this){
//				r = true;
//				return false;
//			}
//		},this);
//		return r;
//	},
	toString : function(){
		return "[Node"+(this.id?" "+this.id:"")+"]";
	}
};