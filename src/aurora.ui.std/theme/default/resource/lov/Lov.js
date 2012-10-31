/**
 * @class Aurora.Lov
 * @extends Aurora.TextField
 * <p>Lov 值列表组件.
 * @author njq.niu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.Lov = Ext.extend($A.TextField,{
	selectedClass:'autocomplete-selected',
	viewClass:'item-comboBox-view',
    constructor: function(config) {
        this.isWinOpen = false;
        this.fetching = false;
        this.fetchremote = true;
        this.needFetch = true;
        this.autocompletesize = 2;
        this.autocompletedelay = 500;
        this.autocompletepagesize = 10;
        this.maxHeight = 240;
        this.context = config.context||'';
        $A.Lov.superclass.constructor.call(this, config);        
    },
    initComponent : function(config){
        $A.Lov.superclass.initComponent.call(this,config);
        this.para = {};
        if(!Ext.isEmpty(this.lovservice)){
            this.lovservice = this.processParmater(this.lovservice);           
        }else if(!Ext.isEmpty(this.lovmodel)){
            this.lovmodel = this.processParmater(this.lovmodel);
        }
        if(this.autocomplete = this.autocomplete == "true"){
        	if(!this.autocompletefield){
        		var maps = this.getMapping(),name = this.binder.name;
        		for(var i=0;i<maps.length;i++){
        			if(maps[i].to == name)this.autocompletefield = maps[i].from;
        		}
        	}
        	this.fetchremote = false;
        	this.autocompleteview = new $A.Popup({});
        	if(!this.optionDataSet)this.optionDataSet = new $A.DataSet({id:this.id+"_autocomplete_ds",autocount:false})
        }
        this.trigger = this.wrap.child('div[atype=triggerfield.trigger]');
    },
    processParmater:function(url){
        var li = url.indexOf('?')
        if(li!=-1){
            this.para = Ext.urlDecode(url.substring(li+1,url.length));
            return url.substring(0,li);
        } 
        return url;
    },
    processListener: function(ou){
        $A.Lov.superclass.processListener.call(this,ou);
        this.trigger[ou]('click',this.onTriggerClick, this, {preventDefault:true})
    },
    initEvents : function(){
        $A.Lov.superclass.initEvents.call(this);
        this.addEvents(
        /**
         * @event commit
         * commit事件.
         * @param {Aurora.Lov} lov 当前Lov组件.
         * @param {Aurora.Record} r1 当前lov绑定的Record
         * @param {Aurora.Record} r2 选中的Record. 
         */
        'commit',
        /**
         * @event beforetriggerclick
         * 点击弹出框按钮之前的事件。
         * @param {Aurora.Lov} lov 当前Lov组件.
         */
        'beforetriggerclick');
    },
    onTriggerClick : function(e){
    	e.stopEvent();
    	var sf = this,view = sf.autocompleteview;
    	if(sf.fireEvent('beforetriggerclick',sf)){
    		if(view.isShow){
    			view.hide();
    			sf.fetchRecord();
    		}
    		sf.showLovWindow();
    	}
    },
    destroy : function(){
    	if(this.qtId){
    		Ext.Ajax.abort(this.qtId);
    	}
    	if(this.optionDataSet){
    		this.optionDataSet.destroy();
    	}
        $A.Lov.superclass.destroy.call(this);
    },
    setWidth: function(w){
        this.wrap.setStyle("width",(w+3)+"px");
        this.el.setStyle("width",(w-20)+"px");
    },
    onChange : function(e){
    	var sf = this;
    	A.Lov.superclass.onChange.call(sf);
    	if(sf.fetchremote||(sf.autocomplete&&sf.needFetch))
			sf.fetchRecord();
    },
    onKeyUp : function(e){
        this.fireEvent('keyup', this, e);
        if(this.autocomplete && !Ext.isEmpty(this.lovservice||this.lovmodel)){
        	var v=this.getRawValue(),view=this.autocompleteview,code = e.keyCode;
        	//if((code > 47 && code < 58) || (code > 64 && code < 91) || code == 8 || code == 46 || code == 13 || code == 32 || code == 16 || code == 17){
	        if((code < 37 || code > 40)&&code != 13 && code !=27 && code != 9 && code!=17){
        		if(v.length >= this.autocompletesize){
	        		var sf=this;
	        		if(this.showCompleteId)clearTimeout(this.showCompleteId);
	        		this.showCompleteId=setTimeout(function(){
	        			var url;
                        var lp = Ext.urlEncode(sf.getLovPara())
			        	if(!Ext.isEmpty(sf.lovservice)){
//				            url = sf.context + 'sys_lov.svc?svc='+sf.lovservice +'&'+ Ext.urlEncode(sf.getLovPara());
                            url = sf.context + 'autocrud/'+sf.lovservice+'/query' + (!Ext.isEmpty(lp) ? '?' + lp : '');
				        }else if(!Ext.isEmpty(sf.lovmodel)){
				            url = sf.context + 'autocrud/'+sf.lovmodel+'/query' + (!Ext.isEmpty(lp) ? '?' + lp : '');
				        }
				        sf.optionDataSet.setQueryUrl(url);
				       	sf.pagesize=sf.autocompletepagesize;
	        			sf.optionDataSet.setQueryParameter(sf.autocompletefield,'%'+v.trim()+'%');
	        			view.show();
	        			sf.optionDataSet.query();
	        			delete sf.showCompleteId;
	        		},this.autocompletedelay);
	        	}else{
	        		if(this.showCompleteId){
	        			clearTimeout(this.showCompleteId);
	        			delete this.showCompleteId;
	        		}
	        		if(view.isShow){
	        			view.hide();
	        			view.on('show',this.autoCompleteShow,this);
	        		}
	        	}
        	}
        }
    },
    onKeyDown : function(e){
        if(this.isWinOpen)return;       
        var keyCode = e.keyCode;
        if(this.autocomplete && this.autocompleteview && this.autocompleteview.isShow){
            if(keyCode == 13 ) {
    	    	if(this.selectedIndex != null){
    	    		this.blur();
        			this.onSelect(this.selectedIndex);
    				this.autocompleteview.hide();
        			this.focus();
        		}else{
        			this.autocompleteview.hide();
    	    		var sf = this;
    	    		setTimeout(function(){
    	    			sf.fireEvent('enterdown', sf, e)
    	    		},5);
        		}
            }else if(keyCode == 27 || keyCode == 9){
            	this.autocompleteview.hide();
            	this.blur();
            }else if(this.optionDataSet.getAll().length > 0){
    	        if(keyCode == 38){
    	        	this.selectItem(this.selectedIndex == null ? -1 : this.selectedIndex - 1);
    	        }else if(keyCode == 40){
    	        	this.selectItem(this.selectedIndex == null ? 0 : this.selectedIndex + 1);
    	        }
            }
        }else{
        	if(!e.ctrlKey && keyCode == 40){
        		e.stopEvent();
        		this.showLovWindow();
        	}
            $A.Lov.superclass.onKeyDown.call(this,e);
        }
    },
    onFocus : function(e){
    	if(this.autocomplete){
    		this.autocompleteview.bind(this.optionDataSet,this);
    		//this.wrap.appendChild(this.autocompleteview.wrap);
    		this.autocompleteview.on('show',this.autoCompleteShow,this);
    	}
    	$A.Lov.superclass.onFocus.call(this,e);
    },
    onBlur : function(e){
    	if(this.autocomplete){
    		if(this.showCompleteId){
    			clearTimeout(this.showCompleteId);
    			delete this.showCompleteId;
    		}
    		(this.tempview||this.autocompleteview).un('show',this.autoCompleteShow,this);
    	}
    	$A.Lov.superclass.onBlur.call(this,e);
    },
    autoCompleteShow : function(){
    	this.autoCompletePosition();
    	var view = this.autocompleteview;
    	view.addClass(this.viewClass);
		view.update('');
		view.wrap.on('click', this.onViewClick,this);
    	view.on('beforerender',this.onQuery,this);
		view.on('render',this.onRender,this);
    	view.on('hide',this.autoCompleteHide,this);
    },
    autoCompleteHide : function(){
    	this.needFetch = true;
		Ext.Ajax.abort(this.optionDataSet.qtId);
    	var view = this.autocompleteview;
    	view.wrap.un('click', this.onViewClick,this);
		view.wrap.un('mousemove',this.onViewMove,this);
    	view.un('show',this.autoCompleteShow,this);
    	view.un('beforerender',this.onQuery,this);
    	view.un('render',this.onRender,this);
    	view.un('hide',this.autoCompleteHide,this);
    },
    autoCompletePosition:function(){
    	var xy = this.wrap.getXY(),
			W=this.autocompleteview.getWidth(),H=this.autocompleteview.getHeight(),
			PH=this.wrap.getHeight(),PW=this.wrap.getWidth(),
			BH=$A.getViewportHeight()-3,BW=$A.getViewportWidth()-3,
			x=(xy[0]+W)>BW?((BW-W)<0?xy[0]:(BW-W)):xy[0];
			y=(xy[1]+PH+H)>BH?((xy[1]-H)<0?(xy[1]+PH):(xy[1]-H)):(xy[1]+PH);
    	this.autocompleteview.moveTo(x,y);
    },
    onViewClick:function(e,t){
    	t = Ext.fly(t);
		t = (t.parent('TR')||t).dom;
		if(t.tagName!='TR'){
		    return;
		}		
		this.onSelect(t);
		this.autocompleteview.hide();
		this.focus();
	},	
	onViewMove:function(e,t){
		t = Ext.fly(t);
		t = t.parent('TR')||t;
        this.selectItem(t.dom.tabIndex);        
	},
	onSelect : function(target){
		var index = Ext.isNumber(target)?target:target.tabIndex;
		if(index<-1){
			if(!this.needFetch)this.fetchRecord();
			return;
		}
		var record = this.optionDataSet.getAt(index);
		this.commit(record);
	},
    onQuery : function(){
    	var view = this.autocompleteview;
    	view.update('<table cellspacing="0" cellpadding="2"><tr tabIndex="-2"><td>'+_lang['lov.query']+'</td></tr></table>');
    	view.wrap.un('mousemove',this.onViewMove,this);
    	this.correctViewSize();
    },
    onRender : function(){
    	var datas = this.optionDataSet.getAll();
		var l=datas.length,view = this.autocompleteview;
		var sb = ['<table class="autocomplete" cellspacing="0" cellpadding="2">'];
		this.selectedIndex = null;
		if(l==0){
			sb.add('<tr tabIndex="-2"><td>'+_lang['lov.notfound']+'</td></tr></table>');
			view.update(sb.join(''));
		}else{
			var displayFields = this.binder.ds.getField(this.binder.name).getPropertity('displayFields');
            if(displayFields && displayFields.length){
            	sb.add('<tr tabIndex="-2" class="autocomplete-head">');
            	for(var i = 0,ll = displayFields.length;i < ll;i++){
            		sb.add('<td>'+displayFields[i].prompt+'</td>');
            	}
				sb.add('</tr>');
            }
			for(var i=0;i<l;i++){
				var text = this.getRenderText(datas[i],displayFields);
				sb.add('<tr tabIndex="'+i+'"'+(i%2==1?' class="autocomplete-row-alt"':'')+'>'+text+'</tr>');	//this.litp.applyTemplate(d)等数据源明确以后再修改		
			}
			sb.add('</table>');
			view.update(sb.join(''));	
			view.wrap.on('mousemove',this.onViewMove,this);
			this.needFetch=false;
		}
		this.correctViewSize();
    },
    correctViewSize: function(){
		var widthArray = [],view = this.autocompleteview,table = view.wrap.child('table');
		if(table.getWidth() < 150)table.setWidth(150);
		var lh = Math.min(table.getHeight()+2,this.maxHeight); 
		view.setHeight(lh<20?20:lh);
		var mw = view.wrap.getWidth();
    	view.setWidth(mw);
		this.autoCompletePosition();
	},
    selectItem:function(index){
		if(Ext.isEmpty(index)||index < -1){
			return;
		}	
		var node = this.getNode(index);	
		if(node && node.tabIndex!=this.selectedIndex){
			if(!Ext.isEmpty(this.selectedIndex)){							
				Ext.fly(this.getNode(this.selectedIndex)).removeClass(this.selectedClass);
			}
			this.selectedIndex=node.tabIndex;			
			Ext.fly(node).addClass(this.selectedClass);					
		}			
	},
	getNode:function(index){
		var nodes = this.autocompleteview.wrap.select('tr[tabindex!=-2]').elements,l = nodes.length;
		if(index >= l) index =  index % l;
		else if (index < 0) index = l + index % l;
		return nodes[index];
	},
    getRenderText : function(record,displayFields){
        var rder = $A.getRenderer(this.autocompleterenderer);
        var text = '&#160;';
        if(rder){
            text = rder.call(window,this,record);
        }else{
        	if(displayFields){
            	text = '';
            	for(var i = 0,l = displayFields.length;i < l;i++){
            		var v = record.get(displayFields[i].name);
            		text += '<td>'+(Ext.isEmpty(v)?'&#160;':v)+'</td>';
            	}
            }else{
            	var v = record.get(this.autocompletefield);
            	text = '<td>'+(Ext.isEmpty(v)?'&#160;':v)+'</td>';
            }
        }
		return text;
	},
//  onKeyDown : function(e){
//        if(e.getKey() == 13) {
//          this.showLovWindow();
//        }else {
//          $A.TriggerField.superclass.onKeyDown.call(this,e);
//        }
//    },
    canHide : function(){
        return this.isWinOpen == false
    },
    commit:function(r,lr,mapping){
        if(this.win) this.win.close();
//        this.setRawValue('')
        var record = lr ? lr : this.record;
        if(record && r){
            var mapping = mapping || this.getMapping();
            for(var i=0;i<mapping.length;i++){
                var map = mapping[i], from = r.get(map.from);
                record.set(map.to,Ext.isEmpty(from)?'':from);
            }
        }
//        else{
//          this.setValue()
//        }
        
        this.fireEvent('commit', this, record, r)
    },
    getMapping: function(){
        var mapping
        if(this.record){
            var field = this.record.getMeta().getField(this.binder.name);
            if(field){
                mapping = field.get('mapping');
            }
        }
        return mapping ? mapping : [{from:this.binder.name,to:this.binder.name}];
    },
//  setValue: function(v, silent){
//      $A.Lov.superclass.setValue.call(this, v, silent);
//      if(this.record && this.dataRecord && silent !== true){
//          var mapping = this.getMapping();
//          for(var i=0;i<mapping.length;i++){
//              var map = mapping[i];
//              this.record.set(map.to,this.dataRecord.get(map.from));
//          }       
//      }
//  },
    onWinClose: function(){
        this.isWinOpen = false;
        this.win = null;
        if(!Ext.isIE6 && !Ext.isIE7){//TODO:不知什么地方会导致冲突,ie6 ie7 会死掉 
            this.focus();
        }else{
        	var sf = this;
        	setTimeout(function(){sf.focus()},10)	
        }
    },
    getLovPara : function(){
        return Ext.apply({},this.getFieldPara(),this.para);
    },
    getFieldPara : function(obj){
		return (obj = this.record) 
			&& (obj = obj.getMeta().getField(this.binder.name))
			&& Ext.apply({},obj.get('lovpara'));
    },
    fetchRecord : function(){
        if(this.readonly == true) return;
        this.fetching = true;
        var v = this.getRawValue(),url;
        
        if(!Ext.isEmpty(this.lovservice)){
//            url = this.context + 'sys_lov.svc?svc='+this.lovservice+'&pagesize=1&pagenum=1&_fetchall=false&_autocount=false&'+ Ext.urlEncode(this.getLovPara());
            url = this.context + 'autocrud/'+this.lovservice+'/query?pagenum=1&_fetchall=false&_autocount=false&'+ Ext.urlEncode(this.getLovPara());
        }else if(!Ext.isEmpty(this.lovmodel)){
            url = this.context + 'autocrud/'+this.lovmodel+'/query?pagenum=1&_fetchall=false&_autocount=false&'+ Ext.urlEncode(this.getLovPara());
        }
        var record = this.record;
        if(record == null && this.binder)
        	record = this.binder.ds.create({},false);
        record.isReady=false;
        var p = {};
        var mapping = this.getMapping();
        for(var i=0;i<mapping.length;i++){
            var map = mapping[i];           
            if(this.binder.name == map.to){
                p[map.from]=v;
            }
            record.set(map.to,'');          
        }
        $A.slideBarEnable = $A.SideBar.enable;
        $A.SideBar.enable = false;
        if(Ext.isEmpty(v) || (Ext.isEmpty(this.lovservice)&&Ext.isEmpty(this.lovmodel))) {
            this.fetching = false;
            record.isReady=true;
            $A.SideBar.enable = $A.slideBarEnable;
            return;
        }
        this.setRawValue(_lang['lov.query'])
        this.qtId = $A.request({url:url, para:p, success:function(res){
            var r = new $A.Record({});
            if(res.result.record){
                var datas = [].concat(res.result.record),l = datas.length;
                if(l>0){
                	if(this.fetchsingle && l>1){
                		var sb=['<table class="autocomplete" cellspacing="0" cellpadding="2">'],
                			displayFields = this.binder.ds.getField(this.binder.name).getPropertity('displayFields');
            			if(displayFields && displayFields.length){
            				sb.add('<tr tabIndex="-2" class="autocomplete-head">');
			            	for(var i = 0,ll = displayFields.length;i < ll;i++){
			            		sb.add('<td>'+displayFields[i].prompt+'</td>');
			            	}
							sb.add('</tr>');
            			}
            			for(var i=0;i<l;i++){
							var text = this.getRenderText(new $A.Record(datas[i]),displayFields);
							sb.add('<tr tabIndex="'+i+'"'+(i%2==1?' class="autocomplete-row-alt"':'')+'>'+text+'</tr>');	//this.litp.applyTemplate(d)等数据源明确以后再修改		
						}
						sb.add('</table>');
						var div = new Ext.Template('<div style="position:absolute;left:0;top:0">{sb}</div>').append(document.body,{'sb':sb.join('')},true),
                			cmp = new $A.Window({id:this.id+'_fetchmulti',closeable:true,title:'请选择', height:Math.max(div.getHeight(),300),width:Math.max(div.getWidth(),200)});
                		cmp.on('close',function(){
                			if(this.tempview){
	                			this.autocompleteview = this.tempview;
	                			delete this.tempview;
                			}else this.autocompleteview = null;
                		},this);
                		if(this.autocompleteview)this.tempview = this.autocompleteview;
            			this.autocompleteview = {};
                		(this.autocompleteview.wrap = cmp.body).update(sb.join(''));
                		div.remove();
                		cmp.body.child('table').setWidth('100%')
                		cmp.body.on('mousemove',this.onViewMove,this);
                		cmp.body.on('dblclick',function(e,t){
							t = Ext.fly(t).parent('TR');
							var index = t.dom.tabIndex;
							if(index<-1)return;
							var r2 = new $A.Record(datas[index]);
							this.commit(r2,record,mapping);
							cmp.close();
                		},this);
                	}else{
	                    var data = datas[0];
	                    r = new $A.Record(data);
                	}
                }
            }
            this.fetching = false;
            this.setRawValue('');
            this.commit(r,record,mapping);
            record.isReady=true;
            $A.SideBar.enable = $A.slideBarEnable;
        }, error:this.onFetchFailed, scope:this});
    },
    onFetchFailed: function(res){
        this.fetching = false;
        $A.SideBar.enable = $A.slideBarEnable;
    },    
//  onBlur : function(e){
////        if(this.isEventFromComponent(e.target)) return;
////        var sf = this;
////        setTimeout(function(){
////            if(!this.isWinOpen){
////            }
////        })
//      if(!this.fetching)
//        $A.Lov.superclass.onBlur.call(this,e);
//    },
    showLovWindow : function(){        
        if(this.fetching||this.isWinOpen||this.readonly) return;
        
        var v = this.getRawValue();
        this.blur();
        var url;
        var lp = Ext.urlEncode(this.getLovPara())
        if(!Ext.isEmpty(this.lovurl)){
        	var fp = Ext.urlEncode(this.getFieldPara());
            url = this.lovurl + (this.lovurl.indexOf('?') === -1 ? '?' : '&')+(!Ext.isEmpty(fp)?fp + '&':'');
        }else if(!Ext.isEmpty(this.lovservice)){
            
//            url = this.context + 'sys_lov.screen?url='+encodeURIComponent(this.context + 'sys_lov.svc?svc='+this.lovservice + '&'+ Ext.urlEncode(this.getLovPara()))+'&service='+this.lovservice+'&';
            url = this.context + 'sys_lov.screen?url='+encodeURIComponent(this.context + 'autocrud/'+this.lovservice+'/query'+ (!Ext.isEmpty(lp) ? '?' + lp : ''))+'&service='+this.lovservice+'&';
        }else if(!Ext.isEmpty(this.lovmodel)){
            url = this.context + 'sys_lov.screen?url='+encodeURIComponent(this.context + 'autocrud/'+this.lovmodel+'/query'+ (!Ext.isEmpty(lp) ? '?' + lp : ''))+'&service='+this.lovmodel+'&';
        }
        if(url) {
	        this.isWinOpen = true;
	        //alert(this.lovlabelwidth+' '+this.lovgridheight)
            this.win = new $A.Window({title:this.title||'Lov', url:url+"lovid="+this.id+"&key="+encodeURIComponent(v)+"&gridheight="+(this.lovgridheight||350)+"&innerwidth="+((this.lovwidth||400)-30)+"&lovautoquery="+this.lovautoquery+"&lovlabelwidth="+this.lovlabelwidth, height:this.lovheight||400,width:this.lovwidth||400});
            this.win.on('close',this.onWinClose,this);
        }
    },
    isEventFromComponent:function(el){
    	var popup = this.autocompleteview;
    	return $A.Lov.superclass.isEventFromComponent.call(this,el) || (popup && popup.wrap.contains(el));
    }
});

$A.Popup = Ext.extend($A.Component,{
	constructor : function(config) {
		var id = 'aurora-item-popup',popup = $A.CmpManager.get(id);
		if(popup)return popup;
		config.id=id;
        $A.Popup.superclass.constructor.call(this, config);
    },
    initComponent : function(config){
        $A.Popup.superclass.initComponent.call(this,config);
    	this.wrap = new Ext.Template(this.tpl).insertFirst(document.body,{width:this.width,height:this.height},true);
    	this.shadow = new Ext.Template(this.shadowtpl).insertFirst(document.body,{width:this.width,height:this.height},true);
    },
    initEvents : function(){
        $A.Popup.superclass.initEvents.call(this);
        this.addEvents(
        	'show',
        	'hide',
        	'beforerender',
        	'render'
        );
    },
    processDataSet: function(ou){
		if(this.optionDataSet){
            this.optionDataSet[ou]('load', this.onDataSetLoad, this);
            this.optionDataSet[ou]('query', this.onDataSetQuery, this);
		}
	},
	
	onDataSetQuery : function(){
		this.fireEvent('beforerender',this)
	},
	onDataSetLoad : function(){
		this.fireEvent('render',this)
	},
	update : function(){
		this.wrap.update.apply(this.wrap,Ext.toArray(arguments));
	},
    show : function(){
    	if(!this.isShow){
    		this.isShow=true;
	    	this.fireEvent('show',this);
	    	this.wrap.show();
	    	this.shadow.show();
	    	Ext.get(document).on('mousedown',this.trigger,this);
    	}
    },
    trigger : function(e){
    	if(!this.wrap.contains(e.target) && !this.wrap.contains(e.target) &&(!this.owner||!this.owner.wrap.contains(e.target))){ 
    		this.hide();
    	}
    },
    hide : function(e){
    	if(this.isShow){
    		this.isShow=false;
	    	this.fireEvent('hide',this)
	    	Ext.get(document).un('mousedown',this.trigger,this)
	    	this.wrap.hide();
	    	this.shadow.hide();
    	}
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
    	//this.wrap.setWidth(w);
    	this.shadow.setWidth(w);
    },
    getHeight : function(){
    	return this.wrap.getHeight();
    },
    getWidth : function(){
    	return this.wrap.getWidth();
    },
    addClass : function(className){
		if(this.customClass == className)return;
    	if(this.customClass)this.wrap.removeClass(this.customClass);
    	this.customClass = className;
    	this.wrap.addClass(this.customClass);
    },
    bind : function(ds,cmp){
    	this.owner = cmp;
    	if(this.optionDataSet != ds){
    		this.processDataSet('un');
    		this.optionDataSet = ds;
			this.processDataSet('on');
    	}
    },
    destroy : function(){
    	$A.Popup.superclass.destroy.call(this);
    	this.processDataSet('un');
    	delete this.shadow;
    },
    tpl : ['<div tabIndex="-2" class="item-popup" style="visibility:hidden;background-color:#fff;">','</div>'],
    shadowtpl : ['<div class="item-shadow" style="visibility:hidden;">','</div>']
});