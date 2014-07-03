(function(A){
var TRUE = true,
	FALSE = false,
	NONE = 'none',
	TD = 'td',
	DIV = 'div',
	ICON = 'icon',
	TEXT = 'text',
	LINE = 'line',
	CLIP = 'clip',
	CHECKBOX = 'checkbox',
	ELEMENT = 'element',
	CHILD = 'child',
	CHECKED = 'checked',
	_TYPE_ = '_type_',
	_ROOT = '_root',
	_TEXT = '_text',
	_TD = '_td',
	EVT_CLICK = 'click',
	EVT_DBLCLICK = 'dblclick',
	EVT_RENDER = 'render',
	EVT_COLLAPSE = 'collapse',
	EVT_EXPAND = 'expand',
	DIV$ITEM_NODE = 'div.item-node';

function _getRegExp(key){
	return new RegExp(key.replace(/[+?*.^$\[\](){}\\|]/g,function(v){
			return '\\'+v;
	}));
}

function _createElement(name){
	return document.createElement(name);
}
/**
 * @class Aurora.Tree
 * @extends Aurora.Component
 * <p>树形组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
A.Tree = Ext.extend(A.Component,{
	showSkeleton: TRUE,
	sw:18,
	constructor: function(config){
		A.Tree.superclass.constructor.call(this,config);
		this.context = config.context||'';
	},
	initComponent:function(config){
		var sf = this;
		sf.nodeHash = {};
		A.Tree.superclass.initComponent.call(sf, config);
		sf.body = sf.wrap.child('div[atype=tree.body]');
		if(sf.searchfield){
			sf.searchInput = $(sf.id+'_search_field');
		}
	},
	processListener: function(ou){
		var sf = this;
    	A.Tree.superclass.processListener.call(sf,ou);
    	sf.wrap[ou](EVT_CLICK, sf.onClick, sf)
    		[ou](EVT_DBLCLICK, sf.onDblclick, sf);
    	if(sf.searchInput){
    		sf.searchInput[ou]('change',sf.onSearch,sf);//blur
    		sf.searchInput[ou]('keyup',sf.onSearch,sf);
    	}
    },
	initEvents:function(){
		A.Tree.superclass.initEvents.call(this);
		this.addEvents(
		/**
         * @event render
         * tree渲染事件.
         */
		EVT_RENDER,
		/**
         * @event collapse
         * 节点折叠事件.
         */
        EVT_COLLAPSE,
        /**
         * @event expand
         * 节点展开事件.
         */
        EVT_EXPAND,
		/**
         * @event click
         * 点击事件.
         * @param {Aurora.Tree} Tree对象
         * @param {Aurora.Record} record 选中的Record对象
         * @param {Aurora.Tree.TreeNode} node 节点对象
         */
		EVT_CLICK,
		/**
         * @event dblclick
         * 双击事件.
         * @param {Aurora.Tree} Tree对象
         * @param {Aurora.Record} record 选中的Record对象
         * @param {Aurora.Tree.TreeNode} node 节点对象
         */
		EVT_DBLCLICK);
	},
//	destroy : function(){
//		A.Tree.superclass.destroy.call(this);
//    },
	processDataSetLiestener: function(ou){
		var sf = this,ds = sf.dataset;
		if(ds){
			ds[ou]('update', sf.onUpdate, sf);
	    	ds[ou]('load', sf.onLoad, sf);
	    	ds[ou]('indexchange', sf.onIndexChange, sf);
//			ds[ou]('metachange', sf.onRefresh, sf);
	    	ds[ou]('add', sf.onAdd, sf);
//	    	ds[ou]('valid', sf.onValid, sf);
	    	ds[ou]('remove', sf.onRemove, sf);
//	    	ds[ou]('clear', sf.onLoad, sf);
//	    	ds[ou]('refresh',sf.onRefresh,sf);
//	    	ds[ou]('fieldchange', sf.onFieldChange, sf);
		}
	},
	bind: function(ds){
		if(Ext.isString(ds)){
			ds = $(ds);
			if(!ds) return;
		}
		var sf = this;
		sf.dataset = ds;
		sf.processDataSetLiestener('on');
//        if(ds.data.length >0)
    	A.onReady(function(){
            sf.onLoad();
        })
	},
	onSearch : function(tf,e){
		var sf = this,
			ds = sf.dataset,
			code = e && e.keyCode,
			value = tf.getRawValue().trim(),
			intervalId = sf.searchInterval;
		if(!Ext.isDefined(code) || code > 40 || (code < 37 && code != 13 && code !=27 && code != 9 && code!=17)){
        		if(intervalId)clearTimeout(intervalId);
        		sf.searchInterval=function(){
		    		if(value.length >0){
	        			var reg = _getRegExp(value),
							field = sf.searchfield,
							df = sf.displayfield;
				        ds.filter(function(r,nd){
				        	var node = sf.getNodeById(r.id);
				        	if(!node){
				        		if(reg.test(r.get(field))){
				        			nd.push(r);
				        		}
				        	}else if(!node.childNodes.length && reg.test(node.record.get(field))){
			        			node.bubble(function(p,r){
			        				(r = p.record).get(df)!=_ROOT &&
			        					nd.add(r);
			        			});
				        	}
				        	return FALSE;
				        },sf);
				        sf.filterKey = value;
		    		}else{
		    			ds.clearFilter();
		    			delete sf.filterKey;
		    		}
			        sf.onLoad();
        			delete sf.searchInterval;
        		}.defer(500);
    	}
	},
	onAdd : function(ds,record){
		var sf = this,
			records = sf.dataset.getAll(),
			pid = record.get(sf.parentfield),
			pnode,sequencefield = sf.sequencefield,
			seq = record.get(sequencefield),
			refnode;
		if(!Ext.isEmpty(pid)){
			for(var i = 0,l=records.length;i<l;i++){
				var r = records[i];
				if(r.get(sf.idfield) === pid){
					pnode = sf.getNodeById(r.id);
					break;
				}
			}
		}
		if(!pnode){
			if(sf.showRoot){
				sf.onLoad();
				sf.root.firstChild.expand();
				return;
			}else{
				pnode = sf.root;
			}
		}
		Ext.each(pnode.childNodes,function(node){
			var tseq = node.record.get(sequencefield)
			if(tseq && tseq>seq){
				refnode = node;
				return FALSE;
			}
		});
		pnode.insertBefore(sf.createTreeNode(sf.createNode(record)),refnode);
	},
    onRemove : function(ds,record){
        var sf = this,id = record.id,node = sf.getNodeById(id)
        if(node){
            var parent = node.parentNode,
            	pnode = node.previousSibling,
            	nnode = node.nextSibling;
            if(parent){
                //sf.focusNode = (sf.focusNode == parent ? null : sf.focusNode);
                sf.unregisterNode(node,TRUE);
                parent.removeChild(node);
                if(!sf.focusNode || sf.focusNode === node){
	                var index = -1,
	                	pc = parent.data.children;
	                Ext.each(pc,function(item,i){
	                	if(item.record.id == id){
	                        index = i;
	                        return FALSE;
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
		var sf = this,
			node = sf.nodeHash[record.id];
		if(sf.parentfield == name || name == sf.sequencefield){
			sf.onLoad();
			ds.locate(ds.indexOf(record)+1);
		}else{
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
		var elem = Ext.fly(t).findParent(TD);
		if(!elem)return;
		var _type = elem[_TYPE_];
		if(!Ext.isDefined(_type)){
			return;
		}
		elem = Ext.fly(t).findParent(DIV$ITEM_NODE);
		var sf = this,node = sf.nodeHash[elem.indexId];
		if(_type == CLIP){
			if(node){
				if(node.isExpand){
					node.collapse();
					sf.fireEvent(EVT_COLLAPSE, sf, node);
				}else{
					node.expand();
					sf.fireEvent(EVT_EXPAND, sf, node);
				}
			}
		}else if(_type == ICON || _type == TEXT){
//			sf.dataset.locate.defer(5, sf.dataset,[sf.dataset.indexOf(node.record)+1,FALSE]);
			var ds = sf.dataset,r = node.record;
			if(sf.fireEvent(EVT_CLICK, sf, r, node) !== FALSE){
				sf.setFocusNode(node);
				ds.locate(ds.indexOf(r)+1,TRUE);
			}
		}else if(_type == CHECKED){
			node.onCheck();
		}
	},
	onDblclick : function(event,t){
		var elem = Ext.fly(t).findParent(TD);
		if(!elem)return;
		var sf = this,_type = elem[_TYPE_];
		if(!Ext.isDefined(_type)){
			return;
		}
		elem = Ext.fly(t).findParent(DIV$ITEM_NODE);
		if(_type == ICON || _type == TEXT){
			var node = sf.nodeHash[elem.indexId];
			if(node && node.childNodes.length){
				if(node.isExpand){
					node.collapse();
					sf.fireEvent(EVT_COLLAPSE, sf, node);
				}else{
					node.expand();
					sf.fireEvent(EVT_EXPAND, sf, node);
				}
			}
			sf.setFocusNode(node);
			var ds = sf.dataset,r = node.record;
			ds.locate(ds.indexOf(r)+1,TRUE);
			sf.fireEvent(EVT_DBLCLICK, sf, r, node);
		}
	},
	getRootNode : function(){
		return this.root;
	},
	setRootNode : function(node){
		var sf = node.ownerTree = this;
		sf.root = node;
		sf.registerNode(node);
		node.cascade((function(node){
			sf.registerNode(node);
		}));
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
		var sf = this;
		delete sf.nodeHash[node.id];
        if(unRegisterChildren){
        	Ext.each(node.childNodes,function(node){
                sf.unregisterNode(node,unRegisterChildren);
        	})
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
		var sf = this,
			array = [],
			map1 = {},
			map2 = {},
			i = 1,
			ds = sf.dataset,
			rtnode;
		function process(item){
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
		}
		Ext.each(ds.data,function(record){
			var id = record.get(sf.idfield),
				node = sf.createNode(record);
			if(Ext.isEmpty(id))id = 'EMPTY_'+i++;
			node.checked = (record.get(sf.checkfield) == "Y") ? 1 : 0;
            node.expanded = record.get(sf.expandfield) == "Y";
			map1[id] = node;
			map2[id] = node;
		});
		for(var key in map2){
			var node = map2[key],
				parent = map2[node.record.get(sf.parentfield)];
			if(parent){
				parent.children.push(node);
				delete map1[key];
			}
		}
		for(var key in map1){
			array.push(map2[key]);
		}
		if(!(A.DynamicTree && this instanceof A.DynamicTree) && array.length == 1){
			sf.showRoot = TRUE;
			rtnode = array[0];
		}else{
			var data = {};
			data[sf.displayfield] = _ROOT;
			var record =  new A.Record(data),
				root = sf.createNode(record);
			record.setDataSet(ds);
			Ext.each(array,function(c){
				root.children.push(c);
			});
			sf.showRoot = FALSE;
			rtnode = root;
		}
		Ext.each(array,function(node){
			if(node.children.length){
        		process(node);
			}
		})
		
		sf.sortChildren(rtnode.children,sf.sequencefield);
		return rtnode;
	},
	sortChildren : function(children,sequence){
        if(sequence){
        	var m = Number.MAX_VALUE;
            children.sort(function(a, b){
            	a = a.record.get(sequence)||m;
            	b = b.record.get(sequence)||m;
            	if(isNaN(a)||isNaN(b)){
            		return a > b?1:-1;
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
		return new A.Tree.TreeNode(item);
	},
	onLoad : function(){
		var sf = this,root = sf.buildTree();
		if(!root) {
			return;
		}
		sf.setRootNode(sf.createTreeNode(root));		
		sf.body.update('');
//		if(sf.dataset.data.length>0)
		sf.root.render();
		sf.fireEvent(EVT_RENDER, sf,root);
	},
//	syncSize : function(){
//		this.root.syncSize();
//	},
	getIconByType : function(type){
		return type;
	},
	onNodeSelect : function(el){
		if(el)el[this.displayfield+_TEXT].style.backgroundColor='#dfeaf5';
	},
	onNodeUnSelect : function(el){
		if(el)el[this.displayfield+_TEXT].style.backgroundColor='';
	},
	initColumns : function(node){}
});
/**
 * @class Aurora.Tree.TreeNode
 * @extends Aurora.Component
 * <p>树节点对象.
 * @author njq.niu@hand-china.com
 * @constructor 
 */
A.Tree.TreeNode = function(data) {
	this.init(data)
}
A.Tree.TreeNode.prototype={
	init : function(data){
		var sf = this;
		sf.data = data;
        sf.record = data.record;
        sf.id = sf.record.id;
        sf.els = sf.parentNode = sf.lastChild = sf.firstChild = sf.previousSibling = sf.nextSibling = null;
        sf.childNodes = [];
        sf.childrenRendered = FALSE;
        sf.isExpand = data.expanded;//false;    
        sf.checked = data.checked;
    	Ext.each(data.children,function(node){
            sf.appendChild(sf.createNode(node));
    	});
	},
	createNode : function(item){
		return new A.Tree.TreeNode(item);
	},
	createCellEl : function(df){
		var els = this.els;
        els[df+_TD].appendChild(els[df+_TEXT] = _createElement(DIV));		
	},
	initEl : function(){
		var sf = this,
			tree = sf.getOwnerTree(),
			df = tree.displayfield,
			text = sf.record.get(df),
			div = _createElement(DIV),
			child = _createElement(DIV),
			table = _createElement('table'),
			tbody = _createElement('tbody'),
			tr = _createElement('tr'),
			checkbox,els = sf.els = {
				element:div,
				itemNodeTable:table,
				itemNodeTbody:tbody,
				itemNodeTr:tr,
				child:child
			};
		div.className = 'item-node';
		table.border=table.cellSpacing=table.cellPadding=0;
		tbody.appendChild(tr);
		table.appendChild(tbody);
		div.appendChild(table);
		if(tree.showSkeleton){
    		var line = tr.insertCell(-1),
    			clip = tr.insertCell(-1),
    			icon = _createElement(sf.icon?'img':DIV),
    			iconTd = tr.insertCell(-1);
 			checkbox = tr.insertCell(-1);
     		line[_TYPE_] =LINE;
    		line.className =LINE;
    		clip[_TYPE_] =CLIP;
    		clip.innerHTML = '&#160';
    		iconTd[_TYPE_] =ICON;
    		checkbox[_TYPE_] =CHECKED;
    		checkbox.innerHTML = '&#160';	
    		Ext.fly(iconTd).setWidth(18);
    		iconTd.appendChild(icon);
    		Ext.apply(els,{
    			line:line,
    			clip:clip,
    			icon:icon,
    			iconTd:iconTd,
    			checkbox:checkbox
			});
		}
		var td = tr.insertCell(-1);
		els[df + _TD] = td;
		sf.createCellEl(df);
//		els[df+_TEXT]= _createElement(DIV);
//		els[df+_TD].appendChild(sf.els[df+_TEXT]);
		td.className='node-text'
		tree.initColumns(sf);
		
		div.noWrap='true';
		td[_TYPE_] =TEXT;
		if(tree.showcheckbox === FALSE && checkbox) {
			checkbox.style.display=NONE;
		}
		if(sf.isRoot() && text==_ROOT){
			table.style.display=NONE;
		}
		div.appendChild(child);
		child.className= 'item-child';
		child.style.display=NONE;
	},
	render : function(){
		var sf = this,tree = sf.getOwnerTree();
		sf.icon = sf.record.get(tree.iconfield);
		if(!sf.els){
			sf.initEl();
		}
		var els = sf.els,
			el = els[ELEMENT];
		if(sf.isRoot()){
			tree.body.appendChild(el);
			if(tree.showRoot == FALSE && tree.showSkeleton)
			els[ICON].style.display=els[CHECKBOX].style.display=els[tree.displayfield+_TEXT].style.display=NONE;
			sf.expand();
		}else{
			sf.parentNode.els[CHILD].appendChild(el);
			if(tree.filterKey || sf.isExpand)
				sf.expand();
		}
		sf.paintPrefix();
		el.indexId = sf.id;
		sf.paintCheckboxImg();
//		if(sf.checked == TRUE)
//		sf.setCheck(TRUE);
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
		var sf = this;
		if(sf.width == w) return;
        sf.width = w;
		sf.doSetWidth(name,w);
        if(sf.childrenRendered) {
        	Ext.each(sf.childNodes,function(node){
				node.setWidth(name,w);
        	});
        }
	},
	doSetWidth : function(name,w){
		if(!w)return;
		var sf = this;
		if(sf.isRoot() && sf.getOwnerTree().showRoot == FALSE) return;
		var els = sf.els,
			tree = sf.getOwnerTree(),
			left = w-(name == tree.displayfield && tree.showSkeleton ? 
				((tree.showcheckbox ? 1 : 0) +sf.getPathNodes().length)*tree.sw
				: 0);
		Ext.fly(els[name+_TD]).setWidth(Math.max(left,0));
        (Ext.fly(els[name+_TEXT].id)||Ext.fly(els[name+_TEXT])).setWidth(Math.max((left-1),0));
	},
	paintPrefix : function(){
		var sf = this;
		sf.paintLine();
		sf.paintClipIcoImg();
		sf.paintCheckboxImg();
		sf.paintIconImg();
		sf.paintText();
	},
	paintLine : function(){
		var sf = this,ownerTree = sf.getOwnerTree();
		if(!ownerTree.showSkeleton) return;
		var pathNodes = sf.getPathNodes(),
			w = (pathNodes.length-2)*ownerTree.sw,
			line = sf.els[LINE],
			c = _createElement(DIV);
		line.innerHTML = '';
		Ext.fly(line).setWidth(w);
		if(w==0){
			line.style.display=NONE;
		}
		Ext.fly(c).setWidth(w);
		for(var i = 1 ,count = pathNodes.length-1 ; i < count ; i++){
			var node = pathNodes[i],
				ld = _createElement(DIV);
			ld.className = node.isLast()?'node-empty':'node-line';
			Ext.fly(ld).setWidth(ownerTree.sw);
			c.appendChild(ld);
		}
		line.appendChild(c);
	},
	paintClipIcoImg : function(){
		var sf = this,ownerTree = sf.getOwnerTree();
		if(!ownerTree.showSkeleton) return;
		var clip = sf.els[CLIP],
			prefix = 'empty',
			icon;
		if(sf.isRoot()){
			clip.style.display=NONE;//不显示根节点的clip
			return;
		}else{
//		if(!sf.isRoot()){
//			icon = sf.isExpand ? 'nlMinus':'nlPlus';
//		}else{
			prefix = sf.isLeaf()&&'join'||sf.isExpand&&'minus'||'plus';
			icon = sf.isLast()&&'Bottom'||sf.isFirst()&&'Top'||'';
		}
//		clip.src = ownerTree.getIcon(icon);
		clip.className = 'node-clip clip-' + prefix + icon;
        clip.innerHTML = '<DIV class="tree_s"> </DIV>';
	},
	paintIconImg : function(){
		var sf = this,ownerTree = sf.getOwnerTree();
		if(!ownerTree.showSkeleton) return;
		var data = sf.data,icon = data.icon,
			eicon = sf.els[ICON];
		if(sf.icon) {
			eicon.className = 'node-icon';
			eicon.src = ownerTree.context + sf.icon;
		}else{
			if(!icon && !(icon = ownerTree.getIconByType(data.type))){
				if(sf.isRoot()){
					icon = 'root';
				}else if(sf.isLeaf()){
					icon = 'node';
				}else if(sf.isExpand){
					icon = 'folderOpen';
				}else{
					icon = 'folder';
				}
			}
			eicon.className = 'node-icon icon-' + icon;//ownerTree.getIcon(icon);
		}
//        eicon.style.width = 18;
//        eicon.style.height = 18;
		//eicon.style.width = eicon.style.height = 18+'px'
	},
	paintCheckboxImg : function(){
		var sf = this,els = sf.els;
		if(!els || !sf.getOwnerTree().showSkeleton) return;
		var ck = els[CHECKBOX];
		ck.className = CHECKBOX+(sf.checked||0);
        ck.innerHTML = '<DIV class="tree_s"> </DIV>';
	},	
	paintText : function(){
		var sf = this,els = sf.els;
		if(!els) return;
		var ownerTree = sf.getOwnerTree(),
			r = sf.record,
			df = ownerTree.displayfield,
			renderer = ownerTree.renderer,
			key = ownerTree.filterKey,
			text = r.get(df);
		if(!Ext.isEmpty(renderer) && (renderer = window[renderer])){
			text = renderer.call(sf, text, r, sf);
		}
		els[df+_TEXT].innerHTML=key?text.replace(_getRegExp(key),function(v){
			return '<span style="background:yellow">'+v+'</span>'
		}):text;
	},
	paintChildren : function(){
		var sf = this;
//		var sequence = sf.getOwnerTree().sequence;
		if(!sf.childrenRendered){
//			sf.els[CHILD].innerHTML = '';
			sf.childrenRendered = TRUE;			
//			sf.childNodes.sort(function(a, b){
//	        	var n1 = a.record.get(sequence)||Number.MAX_VALUE;
//				var n2 = b.record.get(sequence)||Number.MAX_VALUE;
//	            return parseFloat(n1)-parseFloat(n2);
//	        });
			Ext.each(sf.childNodes,function(node){
				node.render();
			});
		};
	},
	/**
	 * 折叠收起
	 */
	collapse : function(){
		var sf = this;
		sf.isExpand=FALSE;
		if(!sf.isRoot())
		sf.record.set(sf.getOwnerTree().expandfield,"N",TRUE);
		sf.els[CHILD].style.display=NONE;
		sf.paintIconImg();
		sf.paintClipIcoImg();
        sf.refreshDom();
	},
	/**
	 * 展开
	 */
	expand : function(){
		var sf = this,p = sf.parentNode;
		if(p&&p.isExpand == FALSE)p.expand();
		if(!sf.isLeaf()&&sf.childNodes.length){
			if(!sf.isRoot())
				sf.record.set(sf.getOwnerTree().expandfield,"Y",TRUE);
			sf.isExpand=TRUE;
			sf.paintChildren();
			sf.els[CHILD].style.display='block';
		}
		sf.paintIconImg();
		sf.paintClipIcoImg();
        sf.refreshDom();
	},
    refreshDom : function(){
        this.getOwnerTree().wrap.addClass('a').removeClass('a');
    },
	/**
	 * 选中节点
	 */
	select : function(){
		var sf = this,ownerTree = sf.getOwnerTree();
		sf.isSelect = TRUE;
		ownerTree &&
			ownerTree.onNodeSelect(this.els);
//		this.els[TEXT].style.backgroundColor='#dfeaf5';
	},
	/**
	 * 取消选择
	 */
	unselect : function(){
		var sf = this,ownerTree = sf.getOwnerTree();
		sf.isSelect = FALSE;
        ownerTree &&
			ownerTree.onNodeUnSelect(sf.els);
//		this.els[TEXT].style.backgroundColor='';
	},
	getEl :  function(){
		return this.els;
	},
	setCheckStatus : function(checked){
		var sf = this,c;
		if(checked==2||checked==3){
			var childNodes = sf.childNodes,
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
		sf.checked = c;
		if(!sf.isRoot() || sf.showRoot != FALSE){
            sf.record.set(sf.getOwnerTree().checkfield, c==1||c==2 ? "Y" : "N");
        }
		sf.paintCheckboxImg();
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
		//return this.leaf === TRUE;
  	},
  	/**
  	 * 是否是最后一个节点.
  	 * @return {Boolean} islast 是否是最后.
  	 */
	isLast : function(){
		var p = this.parentNode;
		return !p ? TRUE : p.childNodes[p.childNodes.length-1] == this;
//		return (!this.parentNode ? TRUE : this.parentNode.lastChild == this);
	},
	/**
	 * 是否是第一个
	 * @return {Boolean} isfirst 是否是第一个.
	 */
	isFirst : function(){
		var tree = this.getOwnerTree(),
			p = this.parentNode;
		return p== tree.getRootNode()&&!tree.showRoot&&p.childNodes[0] == this;
//		return (!this.parentNode ? TRUE : this.parentNode.firstChild == this);
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
		var sf = this,tree = sf.getOwnerTree();
		Ext.each(node,function(node){
			var oldParent = node.parentNode,
				childs = sf.childNodes,
				index = childs.length,
				ps = childs[index-1];
  			oldParent &&
				oldParent.removeChild(node);
      		!index &&
				sf.setFirstChild(node);
			childs.push(node);
			node.parentNode = sf;
			//
			if(ps){
				node.previousSibling = ps;
				ps.nextSibling = node;
			}else{
				node.previousSibling = null;
			}
			node.nextSibling = null;
      		sf.setLastChild(node);
			node.setOwnerTree(tree);
			//>>append
			//if(oldParent) >>move

			sf.childrenRendered &&
				node.render();
			sf.els &&
				sf.cascade(function(n){
					n.paintPrefix()
					if(!n.childrenRendered)
						return FALSE;
				});
		});
		return node;
	},
	removeChild : function(node){
		var sf = this,childs = sf.childNodes,index = childs.indexOf(node);
		if(index == -1){
			return FALSE;
		}
		//>>beforeremove
		childs.splice(index, 1);
		var p = node.previousSibling,
			n = node.nextSiblin,
			els,div;
		if(p){
	  		p.nextSibling = n;
		}
		if(n){
	  		n.previousSibling = p;
		}
		sf.firstChild == node &&
	  		sf.setFirstChild(n);
		sf.lastChild == node &&
	  		sf.setLastChild(p);
		node.setOwnerTree(null);
		//clear
		node.parentNode = node.previousSibling = node.nextSibling = null;
		//>>remove UI
		if(sf.childrenRendered){
			(els = node.els) &&
				(div = els[ELEMENT]) &&
					sf.els[CHILD].removeChild(div);	
			!childs.length &&
				sf.collapse();
		}
	    sf.els &&
	    	sf.cascade(function(node){
				node.paintPrefix()
				if(!node.childrenRendered)
					return FALSE;
			});
		return node;
	},
	insertBefore : function(node, refNode){
		if(!refNode){
			return this.appendChild(node);
		}
		//移动位置是自身位置(不需要移动)
		if(node == refNode){
			return FALSE;
		}
		var sf = this,childs = sf.childNodes,
			refIndex = childs.indexOf(refNode),
			oldParent = node.parentNode;
		//是子节点，并且是向后移动
		if(oldParent == sf && childs.indexOf(node) < refIndex){
			refIndex--;
		}
		oldParent &&
			oldParent.removeChild(node);
		//设置节点间关系
		!refIndex &&
			sf.setFirstChild(node);
		childs.splice(refIndex, 0, node);
		node.parentNode = sf;
		var ps = childs[refIndex-1];
		if(ps){
			node.previousSibling = ps;
			ps.nextSibling = node;
		}else{
			node.previousSibling = null;
		}
		node.nextSibling = refNode;
		refNode.previousSibling = node;
		node.setOwnerTree(sf.getOwnerTree());
		if(sf.childrenRendered){
			sf.childrenRendered = FALSE;
			sf.paintChildren();
		}
		sf.els &&
			sf.paintPrefix()
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
		var sf = this;
		if(!sf.ownerTree){
			sf.bubble(function(p){
				if(p.ownerTree){
					sf.ownerTree = p.ownerTree;
					return FALSE;
				}
			});
		}
		return sf.ownerTree;
	},
//	getDepth : function(){
//  		var depth = 0;
//  		this.bubble(function(){depth++});
//		return depth;
//	},
	setOwnerTree : function(tree){
		var sf = this,ownerTree = sf.ownerTree;
		if(tree != ownerTree){
			ownerTree &&
				ownerTree.unregisterNode(sf);
			sf.ownerTree = tree;
			Ext.each(sf.childNodes,function(c){
				c.setOwnerTree(tree);
			});
			tree &&
				tree.registerNode(sf);
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
			if(fn.call(scope || p, args || p) === FALSE){
	    		break;
			}
	    	p = p.parentNode;
		}
	},
	cascade : function(fn, scope, args){
		if(fn.call(scope || this, args || this) !== FALSE){
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
      			return FALSE;
     		}
		});
		return c;
	},
  	findChildBy : function(fn, scope){
  		var c = null;
		Ext.each(this.childNodes,function(cs){
			if(fn.call(scope||cs, cs) === TRUE){
				c = cs;
      			return FALSE;
     		}
		});
		return c;
  	},
	sort : function(fn, scope){
		var cs = this.childNodes,
			len = cs.length;
    	if(len){
			cs.sort(scope?fn.createDelegate(scope):fn);
			Ext.each(cs,function(n,i){
		        n.previousSibling = cs[i-1];
		        n.nextSibling = cs[i+1];
		        !i &&
		        	sf.setFirstChild(n);
		        i == len-1 &&
         			sf.setLastChild(n);
			});
		}
	},
//  	contains : function(node){
//		var p = node.parentNode,r = FALSE;
//		p.bubble(function(p){
//			if(p == this){
//				r = TRUE;
//				return FALSE;
//			}
//		},this);
//		return r;
//	},
	toString : function(){
		return "[Node"+(this.id?" "+this.id:"")+"]";
	}
};
A.Tree.revision='$Rev: 8095 $';
})($A);