(function(A){
function sortChildren(children,sequence){
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
   	    sortChildren(n.children,sequence);
    });
}
A.MenuTree=Ext.extend(A.Component,{
	initComponent: function(config) {
		var sf = this;
		A.MenuTree.superclass.initComponent.call(sf, config);
		sf.body = sf.wrap.child('.menu-tree-body');
	},
    processDataSetLiestener: function(ou){
		var sf = this,
			ds = sf.dataset;
		if(ds){
			ds[ou]('update', sf.onUpdate, sf);
			ds[ou]('load', sf.onLoad, sf);
		}
	},
    bind : function(ds){
    	if(Ext.isString(ds)){
			ds = $(ds);
			if(!ds) return;
		}
		var sf = this;
		sf.dataset = ds;
		sf.processDataSetLiestener('on');
    	sf.onLoad();
    },
    onLoad : function(){
		var sf = this,list = sf.buildMenuTree();
		if(!list.length) {
			return;
		}
		sf.body.update(sf.render(list));
	},
	buildMenuTree: function(){
		var sf = this,
			array = [],
			map1 = {},
			map2 = {},
			i = 1,
			ds = sf.dataset;
		Ext.each(ds.data,function(record){
			var id = record.get(sf.idfield);
			if(Ext.isEmpty(id))id = 'EMPTY_'+i++;
			map1[id] = map2[id] = {
				record:record,
				children:[]
			};
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
		sortChildren(array,sf.sequencefield);
		return array;
	},
	render:function(list){
		var sf = this,
			lastIndex = list.length - 1;
		return list.map(function(item,index){
			var record = item.record,
				children = item.children,
				len = children.length-1;
			return [
				'<table cellpadding="0" cellspacing="0" border="0" style="" class="',(index == lastIndex?'':'notlast'),'">',
					'<tr height="25">',
						'<td class="menu-tree-line-top" width="25">&#160;</td>',
						'<td class="menu-tree-line-top-right" width="180">&#160;</td>',
						'<td width="180"></td>',
					'</tr>',
					'<tr>',
						'<td></td>',
						'<td colspan="2" align="center">',
							'<table height="15" cellpadding="0" cellspacing="0" border="0" class="menu-tree-node"><tr><td class="menu-tree-node-head">',sf.renderText(record),'</td></tr></table>',
						'</td>',
					'</tr>',
					'<tr height="25">',
						'<td width="25"></td>',
						'<td class="menu-tree-line-right">&#160;</td>',
						'<td></td>',
					'</tr>',
					'<tr>',
						'<td width="25"></td>',
						'<td colspan="2">',
							'<table cellpadding="0" cellspacing="0" border="0" width="100%">',
								'<tr height="25">',
									children.map(function(child,index){
										switch(index){
											case 0:return '<td width="45" class="menu-tree-line-right">&#160;</td><td width="45" class="menu-tree-line-top">&#160;</td>';
											case len:return '<td width="45" class="menu-tree-line-top-right">&#160;</td><td width="45"></td>';
											default:return'<td width="45" class="menu-tree-line-top-right">&#160;</td><td width="45" class="menu-tree-line-top">&#160;</td>';
										}
									}).join(''),
								'</tr>',
								'<tr>',
									children.map(function(child){
										var _children = child.children;
										return ['<td colspan="2" style="padding:0 5px" valign="top">',
											'<table width="100%" cellpadding="0" cellspacing="0" border="0" class="menu-tree-node">',
												'<tr>',
													'<td class="menu-tree-node-head">',sf.renderText(child.record),'</td>',
												'</tr>',
												'<tr>',
													'<td class="menu-tree-node-body">',
														'<ul>',
															_children && _children.length ? _children.map(function(c){
																return ['<li>',sf.renderText(c.record),'</li>'].join('');
															}).join(''):'<li></li>',
														'</ul>',
													'</td>',
												'</tr>',
											'</table>',
										'</td>'].join('');
									}).join(''),
								'</tr>',
							'</table>',
						'</td>',
					'</tr>',
					'<tr height="25"></tr>',
				'</table>'
			].join('');
		}).join('');
	},
	renderText : function(data){
    	var sf = this,
    		text = data.get(sf.displayfield),
    		renderer = sf.renderer && A.getRenderer(sf.renderer);
    	return renderer?renderer(text,data):text;
    }
});

A.MenuTree.revision='$Rev$';
})($A);