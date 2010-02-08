//某年某月某人在某棵树上写下了: Oh,shit!
$A.Tree = Ext.extend($A.Component,{
	constructor: function(config){
		$A.Tree.superclass.constructor.call(this,config);
	},
	initComponent:function(config){
		this.nodeHash = {};
		$A.Tree.superclass.initComponent.call(this, config);
	},
	processListener: function(ou){
    	$A.Tree.superclass.processListener.call(this,ou);
    	this.wrap[ou]('click', this.onClick, this);
    },
	initEvents:function(){
		$A.Tree.superclass.initEvents.call(this);
		this.addEvents('click');
	},
	processDataSetLiestener: function(ou){
		var ds = this.dataset;
		if(ds){
//			ds[ou]('metachange', this.onRefresh, this);
//			ds[ou]('update', this.onUpdate, this);
//	    	ds[ou]('add', this.onAdd, this);
	    	ds[ou]('load', this.onLoad, this);
//	    	ds[ou]('valid', this.onValid, this);
//	    	ds[ou]('remove', this.onRemove, this);
//	    	ds[ou]('clear', this.onLoad, this);
//	    	ds[ou]('refresh',this.onRefresh,this);
//	    	ds[ou]('fieldchange', this.onFieldChange, this);
//	    	ds[ou]('indexchange', this.onIndexChange, this);
		}
	},
	bind: function(ds){
		if(typeof(ds)==='string'){
			ds = $(ds);
			if(!ds) return;
		}
		this.dataset = ds;
		this.processDataSetLiestener('on');
    	this.onLoad();
//		if(this.autoQuery == true)
//		ds.query();
	},
	onClick : function(event){
		var elem = event.target;
		var _type = elem['_type_'];
		if(typeof(_type) === undefined){
			return;
		}
		elem = elem.parentNode || elem.parentElement;
		if(_type == 'clip'){
			if(elem.indexId!=null){
				var node = this.nodeHash[ elem.indexId ];
				if(node.isExpand){
					node.collapse();
				}else{
					node.expand();
				}
			}
			//TODO:找到祖宗中_type == iocn or text
		}else if(_type == 'icon' || _type == 'text'){
			var node = this.nodeHash[elem.indexId];
			this.setFocusNode(node);
			this.fireEvent('click', this, node.record, node);
		}else if(_type == 'checked'){
			var node = this.nodeHash[elem.indexId];
			node.onCheck();
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
	getNodeById : function(id){
		return this.nodeHash[id];
	},
	registerNode : function(node){
		this.nodeHash[node.id] = node;
	},
	unregisterNode : function(node){
		delete this.nodeHash[node.id];
	},
	setFocusNode : function(node){
		if(this.focusNode){
			this.focusNode.unselect();
		}
		this.focusNode = node;
		if(node.parentNode){
			node.parentNode.expand();
		}
		node.select();
	},
	createNode: function(record){
		return {
			record:record,
			children:[]
		}
	},
	buildTree: function(){
		var array = [];
		var map1 = {};
		var map2 = {};
		var datas = this.dataset.data;
		var l = datas.length;
		for(var i=0;i<l;i++){
			var record = datas[i];
			var id = record.get(this.idfield);
			var node = this.createNode(record);
			map1[id] = node;
			map2[id] = node;
		}
		for(var key in map2){
			var node = map2[key];
			var record = node.record;
			var pid = record.get(this.parentfield);
			var parent = map2[pid];
			if(parent){
				parent.children.add(node);
				delete map1[key];
			}
		}
		for(var key in map1){
			var node = map2[key];
			array.add(node);
		}
		if(array.length == 1){
			return array[0];
		}else{
			var data = {};
			data[this.displayfield] = ' ';
			var root = { 
				'record': new Aurora.Record(data), 
			    'children':[]
			}
			for(var i=0;i<array.length;i++){
				root['children'].add(array[i]);
			}
			return root;
		}
	},
	onLoad : function(){
		var root = this.buildTree();
		if(!root) {
			//alert("数据结果不正确!")
			return;
		}
		var node = new $A.Tree.TreeNode(root);
		this.setRootNode(node);		
		this.wrap.update('');
		this.root.render();
	},
	getIconByType : function(type){
		return type;
	}
})

$A.Tree.TreeNode = function(data) {
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
	this.childrenRendered = false
	this.isExpand = false;
	
	//TODO:根据某个field来判断
//	this.checked = this['attributes']['checked'];
	this.checked = this.checked==null ? false : this.checked;

//	this.leaf = this.attributes.leaf;
	var children = data.children || [];
	for(var i=0,j=children.length;i<j;i++){
		var node = new $A.Tree.TreeNode(children[i]);
		this.appendChild(node);
	}
}
$A.Tree.TreeNode.prototype={
	initEl : function(){
		this.els = {};
		this.els['element'] = document.createElement('div');
		this.els['element'].className = 'item-node';
		this.els['line']= document.createElement('span');
		this.els['clip']= document.createElement('div');
		this.els['icon']= document.createElement('div');
		this.els['text']= document.createElement('div');
 		this.els['checkbox'] = document.createElement('div');
		this.els['child'] = document.createElement('div');
		this.els['element'].appendChild(this.els['line']);
		this.els['element'].appendChild(this.els['clip']);
		this.els['element'].appendChild(this.els['icon']);
		this.els['element'].appendChild(this.els['checkbox']);	
		this.els['element'].appendChild(this.els['text']);
		this.els['element'].appendChild(this.els['child']);
		this.els['text'].className='node-text'
		this.els['element'].noWrap='true';
		this.els['line']['_type_'] ='line';
		this.els['clip']['_type_'] ='clip';
		this.els['icon']['_type_'] ='icon';
		this.els['text']['_type_'] ='text';
		this.els['checkbox']['_type_'] ='checked';
		this.els['child'].className= 'item-child';
		this.els['child'].style.display='none';
		if(this.checked===false){
			this.els['checkbox'].style.display='none';
		}
	},
	render : function(){
		if(!this.els){
			this.initEl();
		}
		if(this.isRoot()){
			this.ownerTree.wrap.appendChild(this.els['element']);
			this.expand();
		}else{
			this.parentNode.els['child'].appendChild(this.els['element']);
//			this.expand();
		}
		this.paintPrefix();
		this.els['element'].indexId = this.id;
		
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
		this.els['line'].innerHTML = '';
		var pathNodes = this.getPathNodes();
		for(var i = 1 ,count = pathNodes.length-1 ; i < count ; i++){
				var node = pathNodes[i];
				var ld = document.createElement('div');
				if( node.parentNode==null  ){
					ld.className = 'node-empty'
//					img.src = ownerTree.getIcon('empty');
				}else{
					ld.className = 'node-line'
//					img.src = ownerTree.getIcon('line');
				}
				this.els['line'].appendChild(ld);
		}
	},
	paintClipIcoImg : function(){
		if(this.isRoot()){
			this.els['clip'].style.display='none';//不显示根节点的clip
			return;
		}
		var ownerTree = this.getOwnerTree();
		var icon = 'empty';
		if(this.isRoot()){
			icon = this.isExpand ? 'nlMinus':'nlPlus';
		}else{
			if(this.isLeaf()){
				if(this.isLast()){
					icon = 'joinBottom';
				}else{
					icon = 'join';
				}
			}else{
				if(this.isExpand){
					if(this.isLast()){
						icon = 'minusBottom';
					}else{
						icon = 'minus';
					}
				}else{
					if(this.isLast()){
						icon = 'plusBottom';
					}else{
						icon = 'plus';
					}
				}
			}
		};
//		this.els['clip'].src = ownerTree.getIcon(icon);
		this.els['clip'].className = 'node-clip clip-' + icon;
	},
	paintIconImg : function(){
		var ownerTree = this.getOwnerTree();
		var icon = this.data.icon;
		if(!icon){
			var type = this.data.type;
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
//		this.els['icon'].src = ownerTree.getIcon(icon);
		this.els['icon'].className = 'node-icon icon-' + icon;//ownerTree.getIcon(icon);
	},
	paintCheckboxImg : function(){
		var ownerTree = this.getOwnerTree();
		var checked = this.checked;
		if(this.els){
//			this.els['checkbox'].src = ownerTree.getIcon(((checked==2)?'checkbox2':(checked==1)?'checkbox1':'checkbox0'));
			this.els['checkbox'].className = ((checked==2)?'checkbox2':(checked==1)?'checkbox1':'checkbox0');
		}
	},	
	paintText : function(){
		var text;
		if(!Ext.isEmpty(this.ownerTree.renderer)){
			text = window[this.ownerTree.renderer].call(this, this.record);
		}else{
			text = this.record.get(this.ownerTree.displayfield);
		}
		this.els['text'].style.cursor='hand'
		this.els['text'].innerHTML=text;
	},
	paintChildren : function(){
		if(!this.childrenRendered){
			this.els['child'].innerHTML = '';
			this.childrenRendered = true;
			var childNodes = this.childNodes;
			for(var i=0;i < childNodes.length;i++){
				childNodes[i].render();
			}
		};
	},
	collapse : function(){
		this.isExpand=false;
		this.els['child'].style.display='none';
		this.paintIconImg();
		this.paintClipIcoImg();
	},
	expand : function(){
		if(!this.isLeaf()&&this.childNodes.length>0){
			this.isExpand=true;
			this.paintChildren();
			this.els['child'].style.display='block';
		}
		this.paintIconImg();
		this.paintClipIcoImg();
	},
	select : function(){
		this.isSelect = true;
		this.els['text'].style.backgroundColor='#CCCCFF';
	},
	unselect : function(){
		this.isSelect = false;
		this.els['text'].style.backgroundColor='';
	},
	getEl :  function(){
		return this.els;
	},
	setCheck : function(checked){
		if(checked==2||checked==3){
			var childNodes = this.childNodes;
			var count = childNodes.length;
			if(count==0){
				this.checked=checked==2?0:1;
			}else{
				var checked1 = 0;
				var checked2 = 0;
				for(var i=0;i<count;i++){
				var checked = childNodes[i].checked;
					if(checked==1){
						checked1++;
					}else if(checked==2){
						checked2++;
					}
				}
				this.checked = (childNodes.length==checked1) ? 1 : (checked1>0||checked2>0) ? 2 : 0;
			}
		}else{
			this.checked=checked;
		}
		this.paintCheckboxImg();
	},
	onCheck : function(){
		if(this.checked!==false){
			if(this.checked==1){
				this.cascade((function(checked){
					this.setCheck(checked);
				}),null,0);
				this.bubble((function(checked){
					this.setCheck(checked);
				}),null,2);
			}else{
				this.cascade((function(checked){
					this.setCheck(checked);
				}),null,1);
				this.bubble((function(checked){
					this.setCheck(checked);
				}),null,3);
			}
		}
	},

	isRoot : function(){
		return (this.ownerTree!=null) && (this.ownerTree.root === this);
	},
	isLeaf : function(){
		return this.childNodes.length===0;
		//return this.leaf === true;
  	},
	isLast : function(){
		return (!this.parentNode ? true : this.parentNode.lastChild == this);
	},
	isFirst : function(){
		return (!this.parentNode ? true : this.parentNode.firstChild == this);
	},
	hasChildNodes : function(){
		return !this.isLeaf() && this.childNodes.length > 0;
	},
	setFirstChild : function(node){
		this.firstChild = node;
	},
	setLastChild : function(node){
		this.lastChild = node;
	},
	appendChild : function(node){
		var multi = false;
		if(node instanceof Array){
			multi = node;
		}else if(arguments.length > 1){
			multi = arguments;
		}
		if(multi){
    	for(var i = 0, len = multi.length; i < len; i++) {
				this.appendChild(multi[i]);
			}
		}else{
			//>>beforeappend
			var oldParent = node.parentNode;
  			//>>beforemove
  			if(oldParent){
				oldParent.removeChild(node);
			}
			var index = this.childNodes.length;
      		if(index == 0){
				this.setFirstChild(node);
      		}
			this.childNodes.push(node);
			node.parentNode = this;
			//
			var ps = this.childNodes[index-1];
			if(ps){
				node.previousSibling = ps;
				ps.nextSibling = node;
			}else{
				node.previousSibling = null;
			}
			node.nextSibling = null;
      		this.setLastChild(node);
			node.setOwnerTree(this.getOwnerTree());
			//>>append
			//if(oldParent) >>move

			if(node && this.childrenRendered){
				node.render();
				if(node.previousSibling){
					node.previousSibling.paintPrefix();//paintLine();
				}
			}
			if(this.els){
				this.paintPrefix();
			}
			return node;//true
		}
	},
	removeChild : function(node){
		var index = this.childNodes.indexOf(node);
		if(index == -1){
			return false;
		}
		//>>beforeremove
		this.childNodes.splice(index, 1);
		if(node.previousSibling){
	  		node.previousSibling.nextSibling = node.nextSibling;
		}
		if(node.nextSibling){
	  		node.nextSibling.previousSibling = node.previousSibling;
		}
		if(this.firstChild == node){
	  		this.setFirstChild(node.nextSibling);
		}
		if(this.lastChild == node){
	  		this.setLastChild(node.previousSibling);
		}
		node.setOwnerTree(null);
		//clear
		node.parentNode = null;
		node.previousSibling = null;
		node.nextSibling = null;
		//>>remove UI
		if(this.childrenRendered){
			if(node.els&&node.els['element']){
				this.els['child'].removeChild(node.els['element'])	
			}
			if(this.childNodes.length==0){
				this.collapse();
			}
		}
	    if(this.els){
	    	this.paintPrefix();
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
		var index = this.childNodes.indexOf(refNode);
		var oldParent = node.parentNode;
		var refIndex = index;
		//是子节点，并且是向后移动
		if(oldParent == this && this.childNodes.indexOf(node) < index){
			refIndex--;
		}
		if(oldParent){
			oldParent.removeChild(node);
		}
		//设置节点间关系
		if(refIndex == 0){
			this.setFirstChild(node);
		}
		this.childNodes.splice(refIndex, 0, node);
		node.parentNode = this;
		var ps = this.childNodes[refIndex-1];
		if(ps){
			node.previousSibling = ps;
			ps.nextSibling = node;
		}else{
			node.previousSibling = null;
		}
		node.nextSibling = refNode;
		refNode.previousSibling = node;
		node.setOwnerTree(this.getOwnerTree());
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
			var p = this;
			while(p){
				if(p.ownerTree){
					this.ownerTree = p.ownerTree;
					break;
				}
				p = p.parentNode;
			}
		}
		return this.ownerTree;
	},
	//获得节点深度
	getDepth : function(){
  		var depth = 0;
		var p = this;
		while(p.parentNode){
			depth++;
			p = p.parentNode;
		}
		return depth;
	},
	setOwnerTree : function(tree){
		if(tree != this.ownerTree){
			if(this.ownerTree){
				this.ownerTree.unregisterNode(this);
			}
			this.ownerTree = tree;
			var cs = this.childNodes;
			for(var i = 0, len = cs.length; i < len; i++) {
				cs[i].setOwnerTree(tree);
			}
			if(tree){
				tree.registerNode(this);
			}
		}
	},
	getPathNodes : function(){
		var nodes = [];
		for(var parent=this; parent!=null; parent=parent.parentNode){nodes.push(parent);};
		return nodes.reverse();
	},
	getPath : function(attr){
		attr = attr || "id";
		var p = this.parentNode;
		var b = [this.data[attr]];
		while(p){
			b.unshift(p.attributes[attr]);
			p = p.parentNode;
    }
		var sep = this.getOwnerTree().pathSeparator;
		return sep + b.join(sep);
	},
	//冒泡(遍历所有父节点)
	bubble : function(fn, scope, args){
  		var p = this;
		while(p){
			if(fn.call(scope || p, args || p) === false){
	    	break;
			}
	    p = p.parentNode;
		}
	},
	//瀑布(遍历所有子节点)
	cascade : function(fn, scope, args){
		if(fn.call(scope || this, args || this) !== false){
			var cs = this.childNodes;
			for(var i = 0, len = cs.length; i < len; i++) {
				cs[i].cascade(fn, scope, args);
			}
    	}
	},
	//查找
	findChild : function(attribute, value){
		var cs = this.childNodes;
    	for(var i = 0, len = cs.length; i < len; i++) {
			if(cs[i].attributes[attribute] == value){
      			return cs[i];
     		}
		}
		return null;
	},
  	findChildBy : function(fn, scope){
    	var cs = this.childNodes;
      	for(var i = 0, len = cs.length; i < len; i++) {
	      	if(fn.call(scope||cs[i], cs[i]) === true){
	      	    return cs[i];
	      	}
		}
      	return null;
  	},
	sort : function(fn, scope){
		var cs = this.childNodes;
		var len = cs.length;
    	if(len > 0){
			var sortFn = scope ? function(){fn.apply(scope, arguments);} : fn;
			cs.sort(sortFn);
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
  	contains : function(node){
		var p = node.parentNode;
		while(p){
          if(p == this){
              return true;
          }
          p = p.parentNode;
		}
		return false;
	},
	toString : function(){
		return "[Node"+(this.id?" "+this.id:"")+"]";
	}
};