$A.Grid=Ext.extend($A.Component,{bgc:"background-color",scor:"#dfeaf5",ocor:"#ffe3a8",cecls:"cell-editor",constructor:function(a){this.overId=null;this.selectedId=null;this.lockWidth=0;$A.Grid.superclass.constructor.call(this,a)},initComponent:function(b){$A.Grid.superclass.initComponent.call(this,b);this.uc=this.wrap.child("div[atype=grid.uc]");this.uh=this.wrap.child("div[atype=grid.uh]");this.ub=this.wrap.child("div[atype=grid.ub]");this.uht=this.wrap.child("table[atype=grid.uht]");this.lc=this.wrap.child("div[atype=grid.lc]");this.lh=this.wrap.child("div[atype=grid.lh]");this.lb=this.wrap.child("div[atype=grid.lb]");this.lht=this.wrap.child("table[atype=grid.lht]");this.sp=this.wrap.child("div[atype=grid.spliter]");Ext.getBody().insertFirst(this.sp);this.fs=this.wrap.child("a[atype=grid.focus]");var f=[],h=[],e=[];for(var d=0,a=this.columns.length;d<a;d++){var g=this.columns[d];if(g.lock==true){f.add(g)}else{h.add(g)}}this.columns=f.concat(h);this.initTemplate()},processListener:function(a){this.wrap[a]("mouseover",this.onMouseOver,this);this.wrap[a]("mouseout",this.onMouseOut,this);this.wrap[a]("click",this.focus,this);this.fs[a](Ext.isOpera?"keypress":"keydown",this.handleKeyDown,this);this.ub[a]("scroll",this.syncScroll,this);this.ub[a]("click",this.onClick,this);this.ub[a]("dblclick",this.onDblclick,this);this.uht[a]("mousemove",this.onUnLockHeadMove,this);this.uh[a]("mousedown",this.onHeadMouseDown,this);this.uh[a]("click",this.onHeadClick,this);if(this.lb){this.lb[a]("click",this.onClick,this);this.lb[a]("dblclick",this.onDblclick,this)}if(this.lht){this.lht[a]("mousemove",this.onLockHeadMove,this)}if(this.lh){this.lh[a]("mousedown",this.onHeadMouseDown,this)}if(this.lh){this.lh[a]("click",this.onHeadClick,this)}},initEvents:function(){$A.Grid.superclass.initEvents.call(this)},syncScroll:function(){this.hideEditor();this.uh.dom.scrollLeft=this.ub.dom.scrollLeft;if(this.lb){this.lb.dom.scrollTop=this.ub.dom.scrollTop}},handleKeyDown:function(m){var q=m.getKey();if(m.ctrlKey&&m.keyCode==86){var r=window.clipboardData.getData("text");if(r){var a=this.columns;var t=r.split("\n");for(var h=0,b=t.length;h<b;h++){var s=t[h];var p=s.split("\t");if(p==""){continue}var g={};for(var f=0,o=0,d=this.columns.length;f<d;f++){var n=this.columns[f];if(this.isFunctionCol(n)){continue}if(n.hidden!=true){g[n.dataindex]=p[o];o++}}this.dataset.create(g)}}}else{if(q==38||q==40||q==33||q==34){if(this.dataset.loading==true){return}var s;switch(m.getKey()){case 33:this.dataset.prePage();break;case 34:this.dataset.nextPage();break;case 38:this.dataset.pre();break;case 40:this.dataset.next();break}}}this.fireEvent("keydown",this,m)},processDataSetLiestener:function(a){var b=this.dataset;if(b){b[a]("metachange",this.onRefresh,this);b[a]("update",this.onUpdate,this);b[a]("reject",this.onUpdate,this);b[a]("add",this.onAdd,this);b[a]("load",this.onLoad,this);b[a]("valid",this.onValid,this);b[a]("remove",this.onRemove,this);b[a]("clear",this.onLoad,this);b[a]("refresh",this.onRefresh,this);b[a]("fieldchange",this.onFieldChange,this);b[a]("indexchange",this.onIndexChange,this);b[a]("select",this.onSelect,this);b[a]("unselect",this.onUnSelect,this)}},bind:function(a){if(typeof(a)==="string"){a=$(a);if(!a){return}}this.dataset=a;this.processDataSetLiestener("on");this.onLoad()},initTemplate:function(){this.rowTdTpl=new Ext.Template('<TD atype="{atype}" class="grid-rowbox" recordid="{recordid}">');this.tdTpl=new Ext.Template('<TD style="visibility:{visibility};text-align:{align}" dataindex="{dataindex}" atype="grid-cell" recordid="{recordid}">');this.cellTpl=new Ext.Template('<div class="grid-cell {cellcls}" style="width:{width}px" id="'+this.id+'_{dataindex}_{recordid}">{text}</div>');this.cbTpl=new Ext.Template('<center><div class="{cellcls}" id="'+this.id+'_{dataindex}_{recordid}"></div></center>')},getCheckBoxStatus:function(a,c){var f=this.dataset.getField(c);var b=f.getPropertity("checkedvalue");var d=f.getPropertity("uncheckedvalue");var e=a.data[c];return(e&&e==b)?"item-ckb-c":"item-ckb-u"},createCell:function(a,e,f){var i=e.getMeta().getField(a.dataindex);var d={width:a.width,recordid:e.id,visibility:a.hidden==true?"hidden":"visible",dataindex:a.dataindex};var h;var c=this.tdTpl;if(a.type=="rowcheck"){c=this.rowTdTpl;d=Ext.apply(d,{align:"center",atype:"grid.rowcheck",cellcls:"grid-ckb item-ckb-u"});h=this.cbTpl}else{if(a.type=="rowradio"){c=this.rowTdTpl;d=Ext.apply(d,{align:"center",atype:"grid.rowradio",cellcls:"grid-radio item-radio-img-u"});h=this.cbTpl}else{if(a.type=="cellcheck"){d=Ext.apply(d,{align:"center",cellcls:"grid-ckb "+this.getCheckBoxStatus(e,a.dataindex)});h=this.cbTpl}else{var j=a.editor?this.cecls:"";if(a.editorfunction){var b=window[a.editorfunction];if(b){j=b.call(window,e)!=""?this.cecls:""}}if(Ext.isEmpty(e.data[a.dataindex])&&e.isNew==true&&i.get("required")==true){j=j+" item-notBlank"}d=Ext.apply(d,{align:a.align||"left",cellcls:j,width:a.width-10,text:this.renderText(e,a,e.data[a.dataindex])});h=this.cellTpl}}}var g=[];if(f){g.add(c.applyTemplate(d))}g.add(h.applyTemplate(d));if(f){g.add("</TD>")}return g.join("")},createRow:function(d,g,f,e){var j=[];j.add('<TR id="'+this.id+"$"+d+"-"+e.id+'" class="'+(g%2==0?"":"row-alt")+'">');for(var b=0,a=f.length;b<a;b++){var h=f[b];j.add(this.createCell(h,e,true))}j.add("</TR>");return j.join("")},renderText:function(a,b,e){var d=b.renderer;if(d){var c;if(d.indexOf("Aurora.")!=-1){c=$A[d.substr(7,d.length)]}else{c=window[d]}if(c==null){alert("未找到"+d+"方法!");return e}e=c.call(window,e,a,b.dataindex);return e==null?"":e}return e==null?"":e},createTH:function(d){var e=[];e.add('<TR class="grid-hl">');for(var c=0,b=d.length;c<b;c++){var a=d[c].width;if(d[c].hidden==true){a=0}e.add('<TH dataindex="'+d[c].dataindex+'" style="height:0px;width:'+a+'px"></TH>')}e.add("</TR>");return e.join("")},onLoad:function(b){var a=Ext.fly(this.wrap).child("div[atype=grid.headcheck]");if(this.selectable&&this.selectionmodel=="multiple"){this.setCheckBoxStatus(a,false)}if(this.lb){this.renderLockArea()}this.renderUnLockAread();if(b!==false){this.focus.defer(10,this)}},focus:function(){this.fs.focus()},renderLockArea:function(){var f=[];var e=[];var b=0;var d=this.columns;for(var c=0,a=d.length;c<a;c++){if(d[c].lock===true){e.add(d[c]);if(d[c].hidden!==true){b+=d[c].width}}}this.lockWidth=b;f.add('<TABLE cellSpacing="0" atype="grid.lbt" cellPadding="0" border="0"  width="'+b+'"><TBODY>');f.add(this.createTH(e));for(var c=0,a=this.dataset.data.length;c<a;c++){f.add(this.createRow("l",c,e,this.dataset.getAt(c)))}f.add("</TBODY></TABLE>");f.add('<DIV style="height:17px"></DIV>');this.lb.update(f.join(""));this.lbt=this.lb.child("table[atype=grid.lbt]")},renderUnLockAread:function(){var f=[];var e=[];var b=0;var d=this.columns;for(var c=0,a=d.length;c<a;c++){if(d[c].lock!==true){e.add(d[c]);if(d[c].hidden!==true){b+=d[c].width}}}f.add('<TABLE cellSpacing="0" atype="grid.ubt" cellPadding="0" border="0" width="'+b+'"><TBODY>');f.add(this.createTH(e));for(var c=0,a=this.dataset.data.length;c<a;c++){f.add(this.createRow("u",c,e,this.dataset.getAt(c)))}f.add("</TBODY></TABLE>");this.ub.update(f.join(""));this.ubt=this.ub.child("table[atype=grid.ubt]")},isOverSplitLine:function(a){var d=0;var g=false;this.overColIndex=-1;var f=this.columns;for(var e=0,b=f.length;e<b;e++){var h=f[e];if(h.hidden!==true){d+=h.width}if(a<d+3&&a>d-3&&h.resizable==true){g=true;this.overColIndex=e;break}}return g},onRefresh:function(){this.onLoad(false)},onIndexChange:function(c,b){var a=this.getDataIndex(b.id);if(a==-1){return}if(b!=this.selectRecord){this.selectRow(a,false)}},isFunctionCol:function(a){return a.type=="rowcheck"||a.type=="rowradio"},onAdd:function(d,j,k){if(this.lb){var m=[]}var n=[];var p=0;var g=this.columns;var q=this.dataset.data.length-1;if(this.lbt){var b=document.createElement("TR");b.id=this.id+"$l-"+j.id;b.className=(q%2==0?"":"row-alt");for(var h=0,f=g.length;h<f;h++){var c=g[h];if(c.lock==true){var e=document.createElement("TD");e.recordid=""+j.id;if(c.type=="rowcheck"){e.atype="grid.rowcheck";e.className="grid-rowbox"}else{e.style.visibility=c.hidden==true?"hidden":"visible";e.style.textAlign=c.align||"left";if(!this.isFunctionCol(c)){e.dataindex=c.dataindex}e.atype="grid-cell"}var o=this.createCell(c,j,false);e.innerHTML=o;b.appendChild(e)}}this.lbt.dom.tBodies[0].appendChild(b)}var a=document.createElement("TR");a.id=this.id+"$u-"+j.id;a.className=(q%2==0?"":"row-alt");for(var h=0,f=g.length;h<f;h++){var c=g[h];if(c.lock!==true){var e=document.createElement("TD");e.style.visibility=c.hidden==true?"hidden":"visible";e.style.textAlign=c.align||"left";e.dataindex=c.dataindex;e.recordid=j.id;e.atype="grid-cell";var o=this.createCell(c,j,false);e.innerHTML=o;a.appendChild(e)}}this.ubt.dom.tBodies[0].appendChild(a)},onUpdate:function(f,b,d,e){var i=Ext.get(this.id+"_"+d+"_"+b.id);if(i){var h=this.findColByDataIndex(d);if(h&&h.type=="cellcheck"){i.removeClass("item-ckb-c");i.removeClass("item-ckb-u");var a=this.getCheckBoxStatus(b,d);i.addClass(a)}else{var g=this.renderText(b,h,e);i.update(g)}}},onValid:function(e,a,b,d){var g=this.findColByDataIndex(b);if(g){var f=Ext.get(this.id+"_"+b+"_"+a.id);if(f){if(d==false){f.addClass("item-invalid")}else{f.removeClass("item-invalid");f.removeClass("item-notBlank")}}}},onRemove:function(d,a,b){var c=Ext.get(this.id+"$l-"+a.id);if(c){c.remove()}var e=Ext.get(this.id+"$u-"+a.id);if(e){e.remove()}},onClear:function(){},onFieldChange:function(){},getDataIndex:function(d){var b=-1;for(var c=0,a=this.dataset.data.length;c<a;c++){var e=this.dataset.getAt(c);if(e.id==d){b=c;break}}return b},onSelect:function(c,b){var a=Ext.get(this.id+"__"+b.id);if(a&&this.selectable&&this.selectionmodel=="multiple"){this.setCheckBoxStatus(a,true)}else{this.setRadioStatus(a,true)}},onUnSelect:function(c,b){var a=Ext.get(this.id+"__"+b.id);if(a&&this.selectable&&this.selectionmodel=="multiple"){this.setCheckBoxStatus(a,false)}else{this.setRadioStatus(a,false)}},onDblclick:function(d){var c=Ext.fly(d.target).findParent("td[atype=grid-cell]");if(c){var b=Ext.fly(c).getAttributeNS("","recordid");var a=this.dataset.findById(b);var g=this.dataset.indexOf(a);var f=Ext.fly(c).getAttributeNS("","dataindex");this.fireEvent("dblclick",this,a,g,f)}},onClick:function(d){var f=Ext.fly(d.target).findParent("td");if(f){var a=Ext.fly(f).getAttributeNS("","atype");var h=Ext.fly(f).getAttributeNS("","recordid");if(a=="grid-cell"){var c=this.dataset.findById(h);var i=this.dataset.indexOf(c);var j=Ext.fly(f).getAttributeNS("","dataindex");this.fireEvent("cellclick",this,i,j,c);this.showEditor(i,j);this.fireEvent("rowclick",this,i,c)}else{if(a=="grid.rowcheck"){var b=Ext.get(this.id+"__"+h);var g=b.hasClass("item-ckb-c");(g)?this.dataset.unSelect(h):this.dataset.select(h)}else{if(a=="grid.rowradio"){this.dataset.select(h)}}}}},setEditor:function(c,b){var a=this.findColByDataIndex(c);a.editor=b;var d=Ext.get(this.id+"_"+c+"_"+this.selectRecord.id);if(b==""){d.removeClass(this.cecls)}else{if(!d.hasClass(this.cecls)){Ext.fly(d).addClass(this.cecls)}}},showEditor:function(l,m){if(l==-1){return}var b=this.findColByDataIndex(m);if(!b){return}var f=this.dataset.getAt(l);if(!f){return}if(f.id!=this.selectedId){}this.selectRow(l);this.focusColumn(m);if(b.editorfunction){var e=window[b.editorfunction];if(e==null){alert("未找到"+b.editorfunction+"方法!");return}var h=e.call(window,f);this.setEditor(m,h)}var h=b.editor;if(b.type=="cellcheck"){var i=this.dataset.getField(m);var d=i.getPropertity("checkedvalue");var a=i.getPropertity("uncheckedvalue");var j=f.get(m);f.set(m,j==d?a:d)}else{if(h){var c=document.getElementById(this.id+"_"+m+"_"+f.id);var k=Ext.fly(c).getXY();var g=this;setTimeout(function(){var o=f.get(m);g.currentEditor={record:f,ov:o,dataindex:m,editor:$(h)};var n=g.currentEditor.editor;if(n){n.setHeight(Ext.fly(c.parentNode).getHeight()-5);n.setWidth(Ext.fly(c.parentNode).getWidth()-7);n.isFireEvent=true;n.isHidden=false;n.move(k[0],k[1]);n.bind(g.dataset,m);n.rerender(f);n.focus();Ext.get(document.documentElement).on("mousedown",g.onEditorBlur,g)}},1)}}},focusRow:function(c){var b=25;var a=this.ub.getScroll().top;if(c*b<a){this.ub.scrollTo("top",c*b-1)}if((c+1)*b>(a+this.ub.getHeight())){this.ub.scrollTo("top",(c+1)*b-this.ub.getHeight())}this.focus()},focusColumn:function(d){var f=25;var e=this.ub.getScroll().left;var g=lr=lw=tw=0;for(var b=0,a=this.columns.length;b<a;b++){var h=this.columns[b];if(h.dataindex&&h.dataindex==d){tw=h.width}if(h.hidden!==true){if(h.lock===true){lw+=h.width}else{if(tw==0){g+=h.width}}}}lr=g+tw;if(g<e){this.ub.scrollTo("left",g)}if((lr-e)>(this.width-lw)){this.ub.scrollTo("left",lr-this.width+lw)}this.focus()},hideEditor:function(){if(this.currentEditor&&this.currentEditor.editor){var a=this.currentEditor.editor;var b=true;if(a.canHide){b=a.canHide()}if(b){Ext.get(document.documentElement).un("mousedown",this.onEditorBlur,this);var a=this.currentEditor.editor;a.move(-10000,-10000);a.isFireEvent=false;a.isHidden=true}}},onEditorBlur:function(a){if(this.currentEditor&&!this.currentEditor.editor.isEventFromComponent(a.target)){this.hideEditor()}},onLockHeadMove:function(a){this.hmx=a.xy[0]-this.lht.getXY()[0];if(this.isOverSplitLine(this.hmx)){this.lh.setStyle("cursor","w-resize")}else{this.lh.setStyle("cursor","default")}},onUnLockHeadMove:function(b){var a=0;if(this.uht){a=this.uht.getXY()[0]+this.uht.getScroll().left}this.hmx=b.xy[0]-a+this.lockWidth;if(this.isOverSplitLine(this.hmx)){this.uh.setStyle("cursor","w-resize")}else{this.uh.setStyle("cursor","default")}},onHeadMouseDown:function(a){this.dragWidth=-1;if(this.overColIndex==undefined||this.overColIndex==-1){return}this.dragIndex=this.overColIndex;this.dragStart=a.getXY()[0];this.sp.setHeight(this.height);this.sp.setVisible(true);this.sp.setStyle("top",this.wrap.getXY()[1]+"px");this.sp.setStyle("left",a.xy[0]+"px");Ext.get(document.documentElement).on("mousemove",this.onHeadMouseMove,this);Ext.get(document.documentElement).on("mouseup",this.onHeadMouseUp,this)},onHeadClick:function(f){var d=Ext.fly(f.target).findParent("td");var b;if(d){b=Ext.fly(d).getAttributeNS("","atype")}if(b=="grid-cell"){}else{if(b=="grid.rowcheck"){var a=Ext.fly(d).child("div[atype=grid.headcheck]");var c=a.hasClass("item-ckb-c");this.setCheckBoxStatus(a,!c);if(!c){this.dataset.selectAll()}else{this.dataset.unSelectAll()}}}},setRadioStatus:function(a,b){if(!b){a.removeClass("item-radio-img-c");a.addClass("item-radio-img-u")}else{a.addClass("item-radio-img-c");a.removeClass("item-radio-img-u")}},setCheckBoxStatus:function(a,b){if(!b){a.removeClass("item-ckb-c");a.addClass("item-ckb-u")}else{a.addClass("item-ckb-c");a.removeClass("item-ckb-u")}},onHeadMouseMove:function(d){d.stopEvent();this.dragEnd=d.getXY()[0];var b=this.dragEnd-this.dragStart;var f=this.columns[this.dragIndex];var a=f.width+b;if(a>30&&a<this.width){this.dragWidth=a;this.sp.setStyle("left",d.xy[0]+"px")}},onHeadMouseUp:function(a){Ext.get(document.documentElement).un("mousemove",this.onHeadMouseMove,this);Ext.get(document.documentElement).un("mouseup",this.onHeadMouseUp,this);this.sp.setVisible(false);if(this.dragWidth!=-1){this.setColumnSize(this.columns[this.dragIndex].dataindex,this.dragWidth)}},findColByDataIndex:function(e){var b;for(var d=0,a=this.columns.length;d<a;d++){var f=this.columns[d];if(f.dataindex&&f.dataindex.toLowerCase()===e.toLowerCase()){b=f;break}}return b},selectRow:function(d,b){var a=this.dataset.getAt(d);this.selectedId=a.id;if(this.selectlockTr){this.selectlockTr.setStyle(this.bgc,"")}if(this.selectUnlockTr){this.selectUnlockTr.removeClass("row-selected")}this.selectUnlockTr=Ext.get(this.id+"$u-"+a.id);if(this.selectUnlockTr){this.selectUnlockTr.addClass("row-selected")}this.selectlockTr=Ext.get(this.id+"$l-"+a.id);if(this.selectlockTr){this.selectlockTr.setStyle(this.bgc,this.scor)}this.focusRow(d);var c=(this.dataset.currentPage-1)*this.dataset.pageSize+d+1;this.selectRecord=a;if(b!==false&&c!=null){this.dataset.locate.defer(5,this.dataset,[c,false])}},setColumnSize:function(p,q){var g=this.columns;var n,j,d=0,a=0;for(var k=0,f=g.length;k<f;k++){var m=g[k];if(m.dataindex&&m.dataindex===p){if(m.hidden==true){return}m.width=q;if(m.lock!==true){n=this.uh.child("TH[dataindex="+p+"]");j=this.ub.child("TH[dataindex="+p+"]")}else{if(this.lh){n=this.lh.child("TH[dataindex="+p+"]")}if(this.lb){j=this.lb.child("TH[dataindex="+p+"]")}}}m.lock!=true?(a+=m.width):(d+=m.width)}var h=Ext.DomQuery.select("TD[dataindex="+p+"]",this.wrap.dom);for(var k=0,f=h.length;k<f;k++){var e=h[k];var b=Ext.fly(e).child("DIV.grid-cell");if(b){Ext.fly(b).setStyle("width",(q-10)+"px")}}this.lockWidth=d;if(n){n.setStyle("width",q+"px")}if(j){j.setStyle("width",q+"px")}if(this.lc){var o=Math.max(d-1,0);this.lc.setStyle("width",o+"px");this.lc.setStyle("display",o==0?"none":"")}if(this.lht){this.lht.setStyle("width",d+"px")}if(this.lbt){this.lbt.setStyle("width",d+"px")}this.uc.setStyle("width",Math.max(this.width-d,0)+"px");this.uh.setStyle("width",Math.max(this.width-d,0)+"px");this.ub.setStyle("width",Math.max(this.width-d,0)+"px");this.uht.setStyle("width",a+"px");this.ubt.setStyle("width",a+"px");this.syncSize()},syncSize:function(){var e=0;for(var b=0,a=this.columns.length;b<a;b++){var f=this.columns[b];if(f.hidden!==true){if(f.lock===true){e+=f.width}}}if(e!=0){var d=this.width-e;this.uc.setWidth(d);this.uh.setWidth(d);this.ub.setWidth(d)}},showColumn:function(e){var b=this.findColByDataIndex(e);if(b){if(b.hidden===true){delete b.hidden;this.setColumnSize(e,b.hiddenWidth);delete b.hiddenWidth;if(!Ext.isIE){var d=Ext.DomQuery.select("TD[dataindex="+e+"]",this.wrap.dom);for(var c=0,a=d.length;c<a;c++){var f=d[c];Ext.fly(f).show()}}}}},hideColumn:function(e){var b=this.findColByDataIndex(e);if(b){if(b.hidden!==true){b.hiddenWidth=b.width;this.setColumnSize(e,0,false);if(!Ext.isIE){var d=Ext.DomQuery.select("TD[dataindex="+e+"]",this.wrap.dom);for(var c=0,a=d.length;c<a;c++){var f=d[c];Ext.fly(f).hide()}}b.hidden=true}}},deleteSelectRows:function(d){var b=[].concat(this.dataset.getSelected());if(b.length>0){for(var a=0;a<b.length;a++){var c=b[a];this.dataset.remove(c)}}d.close()},remove:function(){var a=this.dataset.getSelected();if(a.length>0){$A.showComfirm("确认","确认删除选择记录?",this.deleteSelectRows.createDelegate(this))}},destroy:function(){$A.Grid.superclass.destroy.call(this);this.processDataSetLiestener("un");this.sp.remove();delete this.sp}});