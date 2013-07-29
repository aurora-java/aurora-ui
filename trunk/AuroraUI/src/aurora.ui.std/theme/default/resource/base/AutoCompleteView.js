(function(A){
var TR = 'TR',
	SELECTED_CLS = 'autocomplete-selected',
	EVT_CLICK = 'click',
	EVT_MOUSE_MOVE = 'mousemove',
	EVT_MOUSE_DOWN = 'mousedown',
	TEMPLATE = ['<div id="{id}" tabIndex="-2" class="item-popup" style="visibility:hidden;background-color:#fff;">','</div>'],
    SHADOW_TEMPLATE = ['<div id="{id}" class="item-shadow" style="visibility:hidden;">','</div>'],
    AUTO_COMPLATE_TABLE_START = '<table class="autocomplete" cellspacing="0" cellpadding="2">';
A.AutoCompleteView = Ext.extend($A.Component,{	
	constructor: function(config) {
		var sf = this;
		config.id = config.id + '_autocomplete';
		sf.isLoaded = false;
		sf.maxHeight = 250;
        sf.delay = 500;
        $A.AutoCompleteView.superclass.constructor.call(sf, config);
    },
    initComponent : function(config){
    	var sf = this;
    	$A.AutoCompleteView.superclass.initComponent.call(this, config);
    	sf.wrap = new Ext.Template(TEMPLATE).insertFirst(document.body,{width:sf.width,height:sf.height,id:sf.id},true);
    	sf.shadow = new Ext.Template(SHADOW_TEMPLATE).insertFirst(document.body,{width:sf.width,height:sf.height,id:sf.id+'_shadow'},true);
    	sf.ds = new A.DataSet({id:sf.id+"_ds",autocount:false});
    },
    processListener: function(ou){
    	$A.AutoCompleteView.superclass.processListener.call(this, ou);
    	var sf = this,
    		ds = sf.ds;
    	sf.el[ou]('keyup',sf.onKeyUp,sf)
    		[ou]('keydown',sf.onKeyDown,sf)
    		[ou]('blur',sf.onBlur,sf);
    	ds[ou]('load', sf.onLoad, sf);
            ds[ou]('query', sf.onQuery, sf);
		sf.wrap[ou](EVT_CLICK, sf.onClick,sf)
			[ou]('mousedown',sf.onMouseDown,sf,{preventDefault:true})
    },
    initEvents : function(){
    	$A.AutoCompleteView.superclass.initEvents.call(this);
        this.addEvents(
        /**
         * @event select
         * 选择记录.
         * @param {Aurora.Record} r 选择的记录.
         */
        'select',
        EVT_CLICK);
    },
    bind : function(obj){
    	Ext.apply(this,obj);
    },
    destroy : function(){
    	var sf = this,wrap = sf.wrap;
    	sf.ds.destroy();
    	sf.shadow.remove();
    	$A.AutoCompleteView.superclass.destroy.call(sf);
    	wrap.remove();
    	delete sf.ds;
    	delete sf.shadow;
    },
    onQuery : function(){
    	var sf = this;
    	sf.wrap.update('<table cellspacing="0" cellpadding="2"><tr tabIndex="-2"><td>'+_lang['lov.query']+'</td></tr></table>')
    		.un(EVT_MOUSE_MOVE,sf.onMove,sf);
    	sf.correctViewSize();
    },
	onLoad : function(){
		var sf = this,
    		datas = sf.ds.getAll(),
			l=datas.length,view = sf.wrap,
			sb;
		sf.selectedIndex = null;
		if(l==0){
			sb = [AUTO_COMPLATE_TABLE_START,'<tr tabIndex="-2"><td>',_lang['lov.notfound'],'</td></tr></table>'];
		}else{
			sb = sf.createListView(datas,sf.binder);
			view.on(EVT_MOUSE_MOVE,sf.onMove,sf);
		}
		sf.isLoaded = true;
		view.update(sb.join(''));
		sf.correctViewSize();
	},
	onKeyDown : function(e){
		if(this.isShow){
			var sf = this,
				keyCode = e.keyCode,
				index = sf.selectedIndex;
            if(keyCode == 13) {
    	    	if(index != null){
    	    		sf.el.blur();
    	    		(function(){
	        			sf.onSelect(index);
	    				sf.hide();
    	    		}).defer(10,sf);
        		}else{
        			sf.hide();
        		}
            }else if(keyCode == 27 || keyCode == 9){
            	sf.hide();
//            	sf.el.blur();
            }else if(sf.ds.getAll().length > 0){
    	        if(keyCode == 38){
    	        	sf.selectItem(index == null ? -1 : index - 1,true);
    	        }else if(keyCode == 40){
    	        	sf.selectItem(index == null ? 0 : index + 1,true);
    	        }
            }
		}
	},
    onKeyUp : function(e){
    	var sf = this,svc = sf.url,
    		cmp = sf.cmp,
    		v=(cmp?cmp.getRawValue():sf.el.getValue()).trim(),
    		code = e.keyCode;
        sf.fireEvent('keyup', sf, e);
        if(code > 40 || (code < 37 && code != 13 && code !=27 && code != 9 && code!=17)){
    		if(v.length >= sf.size){
        		if(sf.showCompleteId)clearTimeout(sf.showCompleteId);
        		sf.showCompleteId=function(){
        			var ds = sf.ds;
			        ds.setQueryUrl(Ext.urlAppend(svc , Ext.urlEncode(cmp?cmp.getPara():sf.para)));
			       	ds.setQueryParameter(sf.name,sf.fuzzyfetch?v+'%':v);
        			ds.pagesize = sf.pagesize;
        			sf.show();
        			ds.query();
        			delete sf.showCompleteId;
        		}.defer(sf.delay);
        	}else{
        		if(sf.showCompleteId){
        			clearTimeout(sf.showCompleteId);
        			delete sf.showCompleteId;
        		}
    			sf.hide();
        	}
    	}
    },
    onBlur : function(e){
    	var sf = this;
		if(sf.showCompleteId){
			clearTimeout(sf.showCompleteId);
			delete sf.showCompleteId;
		}
    },
    onMove:function(e,t){
        this.selectItem((Ext.fly(t).findParent(TR)||t).tabIndex);        
	},
    onClick:function(e,t){
    	t = Ext.fly(t).findParent(TR)||t;
		if(t.tagName!=TR){
		    return;
		}		
		this.onSelect(t);
		this.hide();
	},
	onMouseDown:function(){
		var sf = this;
		(function(){
			sf.el.focus();
		}).defer(Ext.isIE?1:0,sf);
	},
	onSelect : function(target){
		var sf = this,r,
			index = Ext.isNumber(target)?target:target.tabIndex;
		if(index>-1){
			r = sf.ds.getAt(index);
		}
		sf.fireEvent('select',r);
		sf.el.focus();
	},
	selectItem:function(index,focus){
		if(Ext.isEmpty(index)||index < -1){
			return;
		}	
		var sf = this,node = sf.getNode(index),selectedIndex = sf.selectedIndex;
		if(node && (index = node.tabIndex)!=selectedIndex){
			if(!Ext.isEmpty(selectedIndex)){							
				Ext.fly(sf.getNode(selectedIndex)).removeClass(SELECTED_CLS);
			}
			sf.selectedIndex=index;			
			if(focus)sf.focusRow(index);			
			Ext.fly(node).addClass(SELECTED_CLS);					
		}			
	},
	focusRow : function(row){
        var binder = this.binder,
        	displayFields = binder?binder.ds.getField(binder.name).getPropertity('displayFields'):null,
        	head = displayFields && displayFields.length?23:0,
        	r = 22,
            ub = this.wrap,
            stop = ub.getScroll().top,
            h = ub.getHeight(),
            sh = ub.dom.scrollWidth > ub.dom.clientWidth? 16 : 0;
        if(row*r<stop){
            ub.scrollTo('top',row*r-1)
        }else if((row+1)*r + head>(stop+h-sh)){//this.ub.dom.scrollHeight
            ub.scrollTo('top', (row+1)*r-h + sh+head);
        }
    },
	getNode:function(index){
		var nodes = this.wrap.query('tr[tabindex!=-2]'),l = nodes.length;
		if(index >= l) index =  index % l;
		else if (index < 0) index = l + index % l;
		return nodes[index];
	},
    show : function(){
    	var sf = this,view;
    	if(!sf.isShow){
    		sf.isShow=true;
    		view = sf.wrap;
	    	sf.position();
	    	view.dom.className = 'item-popup item-comboBox-view';
			view.update('');
	    	sf.wrap.show();
	    	sf.shadow.show();
	    	Ext.get(document).on(EVT_MOUSE_DOWN,sf.trigger,sf);
    	}
    },
    trigger : function(e){
    	var sf = this;
    	if(!sf.wrap.contains(e.target) &&(!sf.owner||!sf.owner.wrap.contains(e.target))){ 
    		sf.hide();
    	}
    },
    hide : function(e){
    	var sf = this;
    	if(sf.isShow){
    		sf.isShow=false;
    		sf.isLoaded = false;
	    	Ext.get(document).un(EVT_MOUSE_DOWN,sf.trigger,sf)
	    	sf.wrap.hide();
	    	sf.shadow.hide();
    	}
    },
    position:function(){
    	var sf = this,
    		wrap = sf.cmp ? sf.cmp.wrap : sf.el,
    		xy = wrap.getXY(),
			W=sf.getWidth(),H=sf.getHeight(),
			PH=wrap.getHeight(),
			BH=A.getViewportHeight()-3,BW=A.getViewportWidth()-3,
			x=(xy[0]+W)>BW?((BW-W)<0?xy[0]:(BW-W)):xy[0];
			y=(xy[1]+PH+H)>BH?((xy[1]-H)<0?(xy[1]+PH):(xy[1]-H)):(xy[1]+PH);
    	sf.moveTo(x,y);
    },
    createListView : function(datas,binder){
    	var sb = [AUTO_COMPLATE_TABLE_START],
    		displayFields;
        if(binder){
        	displayFields = binder.ds.getField(binder.name).getPropertity('displayFields');
        	if(displayFields && displayFields.length){
	        	sb.push('<tr tabIndex="-2" class="autocomplete-head">');
	        	Ext.each(displayFields,function(field){
	        		sb.push('<td>',field.prompt,'</td>');
	        	});
				sb.push('</tr>');
        	}
        }
		for(var i=0,l=datas.length;i<l;i++){
			var d = datas[i];
			sb.push('<tr tabIndex="',i,'"',i%2==1?' class="autocomplete-row-alt"':'','>',this.getRenderText(d,displayFields),'</tr>');	//sf.litp.applyTemplate(d)等数据源明确以后再修改		
		}
		sb.push('</table>');
		return sb;
    },
    getRenderText : function(record,displayFields){
        var sf = this,
        	rder = A.getRenderer(sf.renderer),
        	text = [],
        	fn = function(t){
        		var v = record.get(t);
        		text.push('<td>',Ext.isEmpty(v)?'&#160;':v,'</td>');
        	};
        if(rder){
            text.push(rder.call(window,sf,record));
        }else if(displayFields && displayFields.length){
        	Ext.each(displayFields,function(field){
        		fn(field.name);
        	});
        }else{
        	fn(sf.name)
        }
		return text.join('');
	},
    correctViewSize: function(){
		var sf = this,
			table = sf.wrap.child('table');
		if(table.getWidth() < 150)table.setWidth(150);
		sf.setHeight(Math.max(Math.min(table.getHeight()+2,sf.maxHeight),20));
    	sf.setWidth(sf.wrap.getWidth());
		sf.position();
	},
	moveTo : function(x,y){
    	this.wrap.moveTo(x,y);
    	this.shadow.moveTo(x+3,y+3);
    },
    setHeight : function(h){
    	this.wrap.setHeight(h);
    	this.shadow.setHeight(h);
    },
    setWidth : function(w){
//    	this.wrap.setWidth(w);
    	this.shadow.setWidth(w);
    },
    getHeight : function(){
    	return this.wrap.getHeight();
    },
    getWidth : function(){
    	return this.wrap.getWidth();
    }
});


	
})($A);