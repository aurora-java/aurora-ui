(function(aC){var aE=document,a6=aE.documentElement,ai=Ext.each,ak=Ext.isEmpty,L=false,ag=true,az=null,a2=aC.CheckBox,ah="_",k="__",w=".",r=" ",x="",E="]",aA="-c",ap="-u",aN="$l-",aG="$u-",aO="on",ao="px",a3="tr",a="td",a8="th",b="_tb",ar="div",n="top",c="left",am="none",T="width",O="center",av="hidden",aR="cursor",aq="",aB="default",aa="w-resize",g="outline",aS="1px dotted blue",aT="atype",e="append",aM="insertBefore",aY="insertAfter",f="before",l="_navbar",a0="text-overflow",D="recordid",R="dataindex",ad="row-selected",Q="required",aI="item-notBlank",au="item-invalid",d="row-alt",F="grid-rowbox",aW=w+F,u="grid.rowcheck",B="grid.rowradio",G="grid.head",a4="grid-ckb ",af="grid-select-all",al="multiple",ax="checkedvalue",y="-readonly",I="item-ckb",X=I+"-self",a5=w+X,aF=I+ap,aP=I+aA,N=I+y+ap,W=I+y+aA,Y="item-radio-img",aX=Y+aA,aK=Y+ap,S=Y+y+aA,H=Y+y+ap,a1=a5+r+w+aP,q="grid-cell",h="cell-editor",M="cellcheck",Z="rowcheck",ab="rowradio",at="rownumber",j="grid-",ba=j+at,aQ="desc",o="asc",i=j+aQ,aH=j+o,p="click",a7="dblclick",K="cellclick",v="render",aZ="rowclick",aw="editorshow",V="nexteditorshow",aU="keydown",an="select",z="mousedown",ay="mousemove",aj="mouseup",t="createrow",J="addrow",ac="未找到",aJ="方法!",P="tr[class!=grid-hl]",s="div[atype=grid.headcheck]",aV="["+R+"=",a9=a8+aV,ae=a+aV,m={autoadjust:ag,forexport:ag,hidden:L,lock:L,resizable:ag,rowspan:1,sortable:ag,width:100},aL=function(A){return !!A.getBorderWidth("t r b l")},aD=function(C,A){if(!C||A){return C}return aL(C)?C:C.parent()};aC.Grid=Ext.extend(aC.Component,{constructor:function(A){var C=this;C.selectedId=az;C.lockWidth=0;C.autofocus=ag;aC.Grid.superclass.constructor.call(C,A);aC.onReady(function(){C.autofocus&&C.focus()})},initComponent:function(A){aC.Grid.superclass.initComponent.call(this,A);var U=this,C=U.wrap,bb=U.wb=Ext.get(U.id+"_wrap");U.fb=bb.child("div[atype=grid.fb]");if(U.fb){U.uf=U.fb.child("div[atype=grid.uf]")}U.uc=C.child("div[atype=grid.uc]");U.uh=C.child("div[atype=grid.uh]");U.ub=C.child("div[atype=grid.ub]");U.uht=C.child("table[atype=grid.uht]");U.lc=C.child("div[atype=grid.lc]");U.lh=C.child("div[atype=grid.lh]");U.lb=C.child("div[atype=grid.lb]");U.lht=C.child("table[atype=grid.lht]");U.sp=C.child("div[atype=grid.spliter]");Ext.getBody().insertFirst(U.sp);U.classfiyColumns();U.initTemplate()},processListener:function(A){var C=this;aC.Grid.superclass.processListener.call(C,A);C.wrap[A](z,C.onMouseDown,C);if(C.canwheel!==L){C.wb[A]("mousewheel",C.onMouseWheel,C)}C.wb[A](Ext.isOpera?"keypress":aU,C.handleKeyDown,C)[A]("keyup",C.handleKeyUp,C)[A]("focus",C.onFocus,C)[A]("blur",C.onBlur,C);C.ub[A]("scroll",C.syncScroll,C)[A](p,C.onClick,C)[A](a7,C.onDblclick,C);C.uht[A](ay,C.onUnLockHeadMove,C);C.uh[A](z,C.onHeadMouseDown,C)[A](p,C.onHeadClick,C);if(C.lb){C.lb[A]("scroll",C.syncScroll,C)[A](p,C.onClick,C)[A](a7,C.onDblclick,C)}if(C.lht){C.lht[A](ay,C.onLockHeadMove,C)}if(C.lh){C.lh[A](z,C.onHeadMouseDown,C)[A](p,C.onHeadClick,C)}C[A](K,C.onCellClick,C)},initEvents:function(){aC.Grid.superclass.initEvents.call(this);this.addEvents(v,aU,a7,K,aZ,aw,V),t},syncScroll:function(U,A){var C=this;C.hideEditor();C.uh.dom.scrollLeft=C.ub.dom.scrollLeft;if(C.lb){if(C.lb.dom===A){C.ub.dom.scrollTop=C.lb.dom.scrollTop}else{C.lb.dom.scrollTop=C.ub.dom.scrollTop}}if(C.uf){C.uf.dom.scrollLeft=C.ub.dom.scrollLeft}},handleKeyUp:function(A){if(A.getKey()==9){this.showEditorByRecord()}},handleKeyDown:function(bb){var C=this,A=bb.getKey(),U=C.dataset;if(bb.ctrlKey&&bb.keyCode==86&&C.canpaste){var bc=window.clipboardData.getData("text");if(bc){ai(bc.split("\n"),function(bg){var be=bg.split("\t");if(be==x){return}var bf={},bd=0;ai(C.columns,function(bh){if(C.isFunctionCol(bh.type)){return}if(bh.hidden!==ag){bf[bh.name]=be[bd];bd++}});U.create(bf)})}}else{if(A==9){C.showEditorByRecord()}else{if(A==38||A==40||A==33||A==34){if(U.loading==ag){return}switch(bb.getKey()){case 33:U.prePage();break;case 34:U.nextPage();break;case 38:if(!bb.ctrlKey){U.pre()}break;case 40:if(!bb.ctrlKey){U.next()}break}bb.stopEvent()}}}C.fireEvent(aU,C,bb)},processDataSetLiestener:function(A){var C=this,U=C.dataset;if(U){U[A]("ajaxfailed",C.onAjaxFailed,C);U[A]("metachange",C.onRefresh,C);U[A]("update",C.onUpdate,C);U[A]("reject",C.onUpdate,C);U[A]("add",C.onAdd,C);U[A]("submit",C.onBeforSubmit,C);U[A]("submitfailed",C.onAfterSuccess,C);U[A]("submitsuccess",C.onAfterSuccess,C);U[A]("query",C.onBeforeLoad,C);U[A]("load",C.onLoad,C);U[A]("loadfailed",C.onAjaxFailed,C);U[A]("valid",C.onValid,C);U[A]("beforeremove",C.onBeforeRemove,C);U[A]("remove",C.onRemove,C);U[A]("clear",C.onLoad,C);U[A]("refresh",C.onRefresh,C);U[A]("fieldchange",C.onFieldChange,C);U[A]("indexchange",C.onIndexChange,C);U[A]("select",C.onSelect,C);U[A]("unselect",C.onUnSelect,C);U[A]("selectall",C.onSelectAll,C);U[A]("unselectall",C.onUnSelectAll,C);U[A]("wait",C.onWait,C);U[A]("afterwait",C.onAfterSuccess,C)}},bind:function(C){if(Ext.isString(C)){C=$(C);if(!C){return}}var A=this;A.dataset=C;A.processDataSetLiestener(aO);if(C.autopagesize===ag){C.pagesize=Math.floor((A.ub.getHeight()||parseFloat(A.ub.dom.style.height))/25);if(isNaN(C.pagesize)||C.pagesize==0){C.pagesize=1}if(C.getAll().length||C.qtId){C.query();return}}$A.onReady(function(){A.onLoad()})},initTemplate:function(){var A=this;A.rowTdTpl=new Ext.Template(["<td {rowSpan} ",aT,'="{',aT,'}" class="',F,'" ',D,'="{',D,'}">']);A.rowNumTdTpl=new Ext.Template(['<td {rowSpan} style="text-align:{align}" class="',ba,'" ',aT,'="',ba,'" ',D,'="{',D,'}">']);A.rowNumCellTpl=new Ext.Template(['<div style="',T,":{",T,'}px">{text}</div>']);A.tdTpl=new Ext.Template(['<td class="{celltdcls}" {rowSpan} style="visibility:{visibility};text-align:{align}" ',R,'="{name}" ',aT,'="',q,'" ',D,'="{',D,'}">']);A.cellTpl=new Ext.Template(['<div class="',q,' {cellcls}" style="',T,":{",T,'}px" id="',A.id,'_{name}_{recordid}" title="{title}"><span>{text}</span></div>']);A.cbTpl=new Ext.Template(['<center><div class="{cellcls}" id="',A.id,"_{name}_{",D,'}"></div></center>'])},getCheckBoxStatus:function(A,bb,U){var bd=A.getField(bb),C=bd.get(ax),bc=A.data[bb];return I+(U?y:x)+((bc&&bc==C)?aA:ap)},createTemplateData:function(C,A){return{width:C.width-2,recordid:A.id,visibility:C.hidden===ag?av:aq,name:C.name}},createCell:function(bf,bb,bg,bc){var bp=this,bq=bp.createTemplateData(bf,bb),bh,bn=bp.tdTpl,C=x,bm=x,be=bf.type,bj,bd=bp.getEditor(bf,bb),A=[];if(bd!=x){var bk=aC.CmpManager.get(bd);if(bk&&(bk instanceof a2)){be=M}else{C=h}}else{if(bf.name&&!ak(bb.getField(bf.name).get(ax))){be=M;bj=ag}}if(be==Z||be==ab){bj=bp.dataset.execSelectFunction(bb)?x:y;bn=bp.rowTdTpl;bq=Ext.apply(bq,{align:O,atype:be==Z?u:B,cellcls:be==Z?a4+I+bj+ap:"grid-radio "+Y+bj+ap});bh=bp.cbTpl}else{if(be==M){bq=Ext.apply(bq,{align:O,cellcls:a4+bp.getCheckBoxStatus(bb,bf.name,bj)});bh=bp.cbTpl}else{var U=bb.getMeta().getField(bf.name);if(U&&ak(bb.data[bf.name])&&bb.isNew==ag&&U.get(Q)==ag){var bo=new Ext.Template('<div class="'+C+'" style="visibility:hidden;position:absolute;top:-10000px;left:-10000px"></div>').append(document.body,{},true);if(!aL(bo)){bm=aI}else{C=C+r+aI}bo.remove()}var bl=(C.indexOf(h)!=-1)?5:2,bi=bp.renderText(bb,bf,bb.data[bf.name]);bq=Ext.apply(bq,{align:bf.align||c,cellcls:C,celltdcls:bm,width:bq.width-bl,text:bi,title:bf.showtitle?$A.unescapeHtml(String(bi).replace(/<[^<>]+>/mg,x)):""});bh=bp.cellTpl;if(be==at){bn=bp.rowNumTdTpl;bh=bp.rowNumCellTpl}}}if(bc){bq.rowSpan="rowSpan="+bc}if(!bg){A.push(bn.applyTemplate(bq))}else{if(bg!=ag&&bm){Ext.fly(bg).addClass(bm)}}A.push(bh.applyTemplate(bq));if(!bg){A.push("</td>")}return A.join(x)},createRow:function(bd,bi,bg,bh){var bc=this,U={},be=az,bj=L,bb=bc.parseCss(bc.renderRow(bh,bi));bc.fireEvent(t,bc,bi,bh,U,bg);if(U.height){bb.style=bb.style=";height:"+U.height+"px;"}var bf=['<tr id="',bc.id,bd,bh.id,'"  _row="'+bh.id+'" class="',(bi%2==0?x:d),bb.cls,'"','style="',bb.style,'">'];for(var C=0,A=bg.length;C<A;C++){if(bg[C].hidden&&bg[C].visiable==false){continue}if(U.name&&!U.height&&!bj){be=az;if(bg[C].name==U.name){bj=ag}else{be=2}}bf.push(bc.createCell(bg[C],bh,az,be))}bf.push("</tr>");bf.push(U.html||"");return bf.join(x)},parseCss:function(U){var bc=x,A=x;if(Ext.isArray(U)){for(var C=0;C<U.length;C++){var bb=this.parseCss(U[C]);bc+=";"+bb.style;A+=r+bb.cls}}else{if(Ext.isString(U)){var bd=!!U.match(/^([^,:;]+:[^:;]+;)*[^,:;]+:[^:;]+;*$/);A=bd?x:U;bc=bd?U:x}}return{style:bc,cls:A}},renderText:function(A,C,bc){var bb=C.renderer,bc=$A.escapeHtml(bc);if(bb){var U=aC.getRenderer(bb);if(U==az){alert(ac+bb+aJ);return bc}bc=U(bc,A,C.name);return bc==az?x:bc}return bc==az?x:bc},renderRow:function(A,bc){var bb=this.rowrenderer,C=az;if(bb){var U=aC.getRenderer(bb);if(U==az){alert(ac+bb+aJ);return C}C=U(A,bc);return !C?x:C}return C},createTH:function(U){var bc=['<tr class="grid-hl">'];for(var C=0,A=U.length;C<A;C++){var bb=U[C];if(bb.hidden&&bb.visiable==false){continue}bc.push("<th ",R,'="',bb.name,'" style="height:0px;width:',bb.width,ao,'"></th>')}bc.push("</tr>");return bc.join(x)},onBeforeRemove:function(){aC.Masker.mask(this.wb,_lang["grid.mask.remove"])},onWait:function(){aC.Masker.mask(this.wb,_lang["grid.mask.waiting"])},onBeforeLoad:function(){this.ub.scrollTo(c,0);this.uh.scrollTo(c,0);aC.Masker.mask(this.wb,_lang["grid.mask.loading"])},onBeforSubmit:function(A){if(this.submask==true){aC.Masker.mask(this.wb,_lang["grid.mask.submit"])}},onAfterSuccess:function(){aC.Masker.unmask(this.wb)},preLoad:function(){},onLoad:function(){var A=this;A.isSelectAll=L;A.clearDomRef();A.preLoad();A.wrap.removeClass(af);A.initHeadCheckStatus(L);if(A.lb){A.renderLockArea()}A.renderUnLockAread();A.drawFootBar();aC.Masker.unmask(A.wb);A.fireEvent(v,A)},initHeadCheckStatus:function(C){var U=this,A=U.wrap.child(s);if(A&&U.selectable&&U.selectionmodel==al){U.setCheckBoxStatus(A,C)}},clearDomRef:function(){this.selectlockTr=az;this.selectUnlockTr=az},customize:function(bf){var bg=location.pathname,U=bg.indexOf("modules");if(U==-1){U=bg.indexOf(bf)+bf.length+1}var bd=bg.substring(U,bg.length),be=bd.substring(bd.lastIndexOf("/")+1,bd.length),C=bg.substring(0,U),bb=this.wrap.parent("[url]");if(bb){var A=bb.getAttributeNS("","url");if(A){A=A.split("?")[0];if(A.indexOf(C)==-1){var bc=A.lastIndexOf("/");if(bc!=-1){A=A.substring(bc+1,A.length)}bd=bd.replaceAll(be,A)}else{bd=A.substring(A.indexOf(C)+new String(C).length,A.length)}}}new Aurora.Window({id:"sys_customization_grid",url:C+"modules/sys/sys_customization_grid.screen?source_file="+bd+"&id="+this.id+"&did="+this.dataset.id,title:"个性化设置",height:530,width:560})},onAjaxFailed:function(C,A){aC.Masker.unmask(this.wb)},onMouseWheel:function(C){C.stopEvent();if(this.editing==ag){return}var U=C.getWheelDelta(),A=this.dataset;if(U>0){A.pre()}else{if(U<0){A.next()}}},onMouseDown:function(bc,U){U=(U=Ext.fly(U)).is(a)?U:U.parent(a);var bb=this,C=U.getAttribute(aT),A;if((A=bb.currentEditor)&&A.editor instanceof a2&&C==q&&U.getAttribute(R)==A.name){if(bc.shiftKey){bb._begin=A.record;bc.stopEvent()}else{if(U.child(".grid-ckb")){bc.stopEvent();A.editor.focus.defer(Ext.isIE?1:0,A.editor)}}}},focus:function(){this.wb.focus()},onFocus:function(){this.hasFocus=ag},blur:function(){this.wb.blur()},onBlur:function(){this.hasFocus=L},renderLockArea:function(){var A=this,C=A.lockColumns,U=['<TABLE cellSpacing="0" atype="grid.lbt" cellPadding="0" border="0"  ',T,'="',A.lockWidth,'"><TBODY>',A.createTH(C)];ai(A.dataset.data,function(bc,bb){U.push(A.createRow(aN,bb,C,bc))},A);U.push('</TBODY></TABLE><DIV style="height:17px"></DIV>');A.lbt=A.lb.update(U.join(x)).child("table[atype=grid.lbt]")},renderUnLockAread:function(){var A=this,C=A.unlockColumns,U=['<TABLE cellSpacing="0" atype="grid.ubt" cellPadding="0" border="0" ',T,'="',A.unlockWidth,'"><TBODY>',A.createTH(C)];ai(A.dataset.data,function(bc,bb){U.push(A.createRow(aG,bb,C,bc))},A);U.push("</TBODY></TABLE>");A.ubt=A.ub.update(U.join(x)).child("table[atype=grid.ubt]")},isOverSplitLine:function(A){var U=this,C=0,bb=L;U.overColIndex=-1;ai(U.columns,function(bd,bc){if(bd.hidden!==ag){C+=bd.width}if(A<C+3&&A>C-3&&bd.resizable!=L){bb=ag;U.overColIndex=bc;return L}});return bb},onRefresh:function(){var A=this;A.onLoad();if(A.selectable){var C=A.dataset;ai(C.selected,function(U){A.onSelect(C,U)})}},onIndexChange:function(U,C){var A=this.getDataIndex(C.id);if(A==-1){return}this.selectRow(A,L)},isFunctionCol:function(A){return A==Z||A==ab||A==at},onAdd:function(U,be,bn){var bh=this,bc=bh.columns,bl=bn===U.data.length-1,bf=bh.parseCss(bh.renderRow(be,bn)),bm=(bn%2==0?x:d+r)+bf.cls;if(bh.lbt){var C=aE.createElement(a3),bk=bh.lbt.dom.tBodies[0];C.id=bh.id+aN+be.id;C.className=bm;Ext.fly(C).set({style:bf.style,_row:be.id});ai(bc,function(bo){if(bo.lock===ag){if(bo.hidden&&bo.visiable==false){return ag}var bq=aE.createElement(a);if(bo.type==Z){Ext.fly(bq).set({recordid:be.id,atype:u});bq.className=F;if(bh.isSelectAll){bq.className+=r+X}}else{if(bo.type==ab){Ext.fly(bq).set({recordid:be.id,atype:B});bq.className=F}else{if(bo.hidden){bq.style.visibility=av}bq.style.textAlign=bo.align||c;if(!bh.isFunctionCol(bo.type)){bq.dataindex=bo.name}var bp={recordid:be.id,atype:q};if(bo.type==at){bq.className=ba;bp.atype=ba}Ext.fly(bq).set(bp)}}bq.innerHTML=bh.createCell(bo,be,bq);C.appendChild(bq)}});if(bl){bk.appendChild(C)}else{var bg=Ext.fly(bk).query(P);for(var bd=bn,bb=bg.length;bd<bb;bd++){var bi=Ext.fly(bg[bd]).toggleClass(d);bi.select(".grid-rownumber div").each(function(bo){bo.update(Number(bo.dom.innerHTML)+1)});bi.select(aW).each(function(bo){bh.setSelectStatus(U.findById(bo.getAttributeNS(x,D)))})}bk.insertBefore(C,bg[bn])}}var A=aE.createElement(a3),bj=bh.ubt.dom.tBodies[0];A.id=bh.id+aG+be.id;A.className=bm;Ext.fly(A).set({style:bf.style,_row:be.id});ai(bc,function(bo){if(bo.lock!==ag){if(bo.hidden&&bo.visiable==false){return ag}var bp=aE.createElement(a);bp.style.visibility=bo.hidden===ag?av:aq;bp.style.textAlign=bo.align||c;Ext.fly(bp).set({dataindex:bo.name,recordid:be.id,atype:q});bp.innerHTML=bh.createCell(bo,be,bp);A.appendChild(bp)}});if(bl){bj.appendChild(A)}else{var bg=Ext.fly(bj).query(P);for(var bd=bn,bb=bg.length;bd<bb;bd++){Ext.fly(bg[bd]).toggleClass(d)}bj.insertBefore(A,bg[bn])}bh.setSelectStatus(be);bh.drawFootBar();bh.fireEvent(J,bh,be)},renderEditor:function(bc,A,bb,C){var U=bc.parent(a);U.update(this.createCell(bb,A,U.dom))},onUpdate:function(U,bb,C,bg){var bd=this,A,bf,bh;bd.setSelectStatus(bb);if(A=Ext.get([bd.id,C,bb.id].join(ah))){var be=bd.findColByName(C),bc=bd.getEditor(be,bb);if(bc!=x?($(bc) instanceof a2):(C&&!ak(bb.getField(C).get(ax)))){bd.renderEditor(A,bb,be,bc)}else{A.update(bh=bd.renderText(bb,be,bg));be.showtitle&&A.set({title:$A.unescapeHtml(String(bh).replace(/<[^<>]+>/mg,x))})}}ai(bd.columns,function(bi){if(bi.name!=C&&(bf=Ext.get([bd.id,bi.name,bb.id].join(ah)))){if(bi.editorfunction){bd.renderEditor(bf,bb,bi,bd.getEditor(bi,bb))}if(bi.renderer){bf.update(bh=bd.renderText(bb,bi,bb.get(bi.name)));bi.showtitle&&bf.set({title:$A.unescapeHtml(String(bh).replace(/<[^<>]+>/mg,x))})}}});bd.drawFootBar(C)},onValid:function(bb,A,C,U){var bd=this.findColByName(C);if(bd){var bc=aD(Ext.get([this.id,C,A.id].join(ah)));if(bc){if(U==L){bc.addClass(au)}else{bc.removeClass([aI,au])}}}},onRemove:function(bc,A,C){var bb=this,U=Ext.get(bb.id+aN+A.id),bd=Ext.get(bb.id+aG+A.id);if(U){U.remove()}if(bd){bd.remove()}ai(bb.columns,function(be){if(be.name){bb.removeCompositeEditor(be.name,A)}});if(Ext.isIE||Ext.isIE9){bb.syncScroll()}bb.clearDomRef();aC.Masker.unmask(bb.wb);bb.drawFootBar()},onClear:function(){},onFieldChange:function(bb,A,bc,C,U){if(C==Q){var bd=aD(Ext.get([this.id,bc.name,A.id].join(ah)));if(bd){bd[U==ag?"addClass":"removeClass"](aI)}}},getDataIndex:function(U){for(var C=0,bb=this.dataset.data,A=bb.length;C<A;C++){if(bb[C].id==U){return C}}return -1},onSelect:function(bb,C,bc){if(!C||bc){return}var U=this,A=Ext.get(U.id+k+C.id);A.parent(aW).addClass(X);if(A){if(U.selectionmodel==al){U.setCheckBoxStatus(A,ag);if(bb.selected.length==bb.data.length){U.initHeadCheckStatus(ag)}}else{U.setRadioStatus(A,ag);bb.locate((bb.currentPage-1)*bb.pagesize+bb.indexOf(C)+1)}U.setSelectStatus(C)}},onUnSelect:function(bb,C,bc){if(!C||bc){return}var U=this,A=Ext.get(U.id+k+C.id);A.parent(aW).addClass(X);if(A){if(U.selectionmodel==al){U.setCheckBoxStatus(A,L);U.initHeadCheckStatus(L)}else{U.setRadioStatus(A,L)}U.setSelectStatus(C)}},onSelectAll:function(){var A=this;A.clearChecked();A.isSelectAll=ag;A.isUnSelectAll=L;A.wrap.addClass(af);A.initHeadCheckStatus(ag)},onUnSelectAll:function(){var A=this;A.clearChecked();A.isSelectAll=L;A.isUnSelectAll=ag;A.wrap.removeClass(af);A.initHeadCheckStatus(L)},clearChecked:function(){var A=this.wrap;A.select(a1).replaceClass(aP,aF);A.select(a5).removeClass(X)},onDblclick:function(bc,C){if(C=Ext.fly(C).parent("td[atype=grid-cell]")){var U=this,bb=U.dataset,A=bb.findById(C.getAttributeNS(x,D));U.fireEvent(a7,U,A,bb.indexOf(A),C.getAttributeNS(x,R))}},onClick:function(be,bh){var bf=(bh=Ext.fly(bh)).is(a)?bh:bh.parent(a);if(bf){var bd=this,U=bf.getAttributeNS(x,aT),bg=bf.getAttributeNS(x,D),C=bd.dataset;if(U==q){var bc=C.findById(bg),bi=C.indexOf(bc),A=bf.getAttributeNS(x,R);bd.fireEvent(K,bd,bi,A,bc,!bh.hasClass("grid-ckb"));bd.fireEvent(aZ,bd,bi,bc)}else{if(U==ba){var bc=C.findById(bg),bi=C.indexOf(bc);if(bc.id!=bd.selectedId){bd.selectRow(bi)}}else{if(U==u){var bb=Ext.get(bd.id+k+bg);if(bb.hasClass(N)||bb.hasClass(W)){return}if(bd.isSelectAll&&!bb.parent(a5)){bb.replaceClass(aF,aP)}else{if(bd.isUnselectAll&&!bb.parent(a5)){bb.replaceClass(aP,aF)}}bb.hasClass(aP)?C.unSelect(bg):C.select(bg)}else{if(U==B){var bb=Ext.get(bd.id+k+bg);if(bb.hasClass(H)||bb.hasClass(S)){return}C.select(bg)}}}}}},onCellClick:function(U,bb,C,A,bc){this.adjustColumn(C);this.showEditor(bb,C,bc)},adjustColumn:function(bb){var be=this,U=be.findColByName(bb);if(!U||!U.autoadjust||U.hidden){return}var bd=be.wrap.select("tr.grid-hl "+a9+bb+E),C=parseInt(bd.elements[0].style.width),A=C,bf=12,bc=Math.min(be.width-(be.selectable?23:0)-20,U.maxadjustwidth||Number.MAX_VALUE);be.wrap.select(ae+bb+"] span").each(function(bg){if(Ext.isIE||Ext.isIE9){bg.parent().setStyle(a0,"clip")}A=Math.max(bg.getWidth()+bf,A);if(Ext.isIE||Ext.isIE9){bg.parent().setStyle(a0,x)}if(A>bc){A=bc;return L}});A>C&&be.setColumnSize(bb,A)},setColumnPrompt:function(C,A){this.wrap.select("td.grid-hc"+aV+C+"] div").update(A)},setEditor:function(C,U){var A=this.findColByName(C),bb=Ext.get([this.id,C,this.selectedId].join(ah));A.editor=U;if(bb){if(U==x){bb.removeClass(h)}else{if(!$(U) instanceof a2){bb.addClass(h)}}}},getEditor:function(bb,C){var U=bb.editor||x;if(bb.editorfunction){var A=window[bb.editorfunction];if(A==az){alert(ac+bb.editorfunction+aJ);return az}U=A(C,bb.name)||x}return U},positionEditor:function(){var bb=this,U=bb.currentEditor,C=U.editor,A=C instanceof a2,bd=aD(Ext.get([bb.id,U.name,U.record.id].join(ah)),A),bc=bd.getXY();if(A){C.move(bc[0],bc[1]-4)}else{C.move(bc[0],bc[1])}},showEditor:function(bg,A,bf){if(bg==-1){return}var bd=this,U=bd.findColByName(A);if(!U){return}var C=bd.dataset,bb=C.getAt(bg);if(!bb){return}if(bb.id!=bd.selectedId){bd.selectRow(bg)}else{bd.focusRow(bg)}bd.focusColumn(A);var be=bd.getEditor(U,bb);bd.setEditor(A,be);if(be!=x){var bc=$(be);(function(){var bj=bb.get(A),bn=aD(Ext.get([bd.id,A,bb.id].join(ah))),bi;bc.bind(C,A);bc.render(bb);bc.el.on(aU,bd.onEditorKeyDown,bd);Ext.fly(a6).on(z,bd.onEditorBlur,bd);bi=bd.currentEditor={record:bb,ov:bj,name:A,editor:bc};bd.positionEditor();if(bc instanceof a2){var bh=bd._begin;if(bd._begin){var bm=C.indexOf(bh),bl=C.indexOf(bb);if(bm>bl){var bk=bl;bl=bm;bm=bk}bl++;for(;bm<bl;bm++){C.getAt(bm).set(A,bh.get(A))}delete bd._begin}else{if(bf){bc.focus()}else{bc.onClick()}}}else{if(bc instanceof aC.Field&&!bc instanceof aC.TextArea){bc.el.setStyle("text-align",U.align||c)}if(!(bc instanceof aC.TextArea)){bc.setHeight(bn.getHeight()-2)}bc.setWidth(bn.getWidth()-5);bc.isEditor=ag;bc.isFireEvent=ag;bc.isHidden=L;bc.focus();bc.on(an,bd.onEditorSelect,bd);if(Ext.isFunction(bf)){bf(bc)}bd.fireEvent(aw,bd,bc,bg,A,bb)}bd.editing=ag}).defer(10)}},showEditorByRecord:function(A){var C=this,U=C.dataset,bb=A?U.indexOf(A):0;A=A||U.getAt(0);if(!A&&C.autoappend){A=U.create()}if(A){ai(C.columns,function(bc){if(bc.hidden!=ag&&C.getEditor(bc,A)!=x){C.fireEvent(K,C,bb,bc.name,A,function(){});C.fireEvent(aZ,C,bb,A);return L}})}},onEditorSelect:function(){(function(){this.hideEditor()}).defer(1,this)},onEditorKeyDown:function(bc){var U=this,bb=bc.keyCode,C=U.currentEditor;if(bb==27){if(C){var A=C.editor;if(A){A.clearInvalid();A.render(A.binder.ds.getCurrentRecord())}}U.hideEditor()}else{if(bb==13){if(!(C&&C.editor&&C.editor instanceof aC.TextArea)){U.showEditorBy(39)}}else{if(bb==9){bc.stopEvent();U.showEditorBy(bc.shiftKey?37:39)}else{if(bc.ctrlKey&&(bb==37||bb==38||bb==39||bb==40)){U.showEditorBy(bb);bc.stopEvent()}}}}},findEditorBy:function(be){var bh=this,C,bg;if((C=bh.currentEditor)&&(bg=C.editor)){var bk=bh.columns,bi=L,bd=bh.dataset,bc=bg.binder.name,A=bg.record,bm=bd.data.indexOf(A),U=az,bj=L,bf=ag,bl=L,bb;if(bm!=-1){if(be==37||be==38){bk=[].concat(bk).reverse();bf=L}if(be==38||be==40){bl=ag;bb=bh.findColByName(bc)}while(A){if(!bl){ai(bk,function(bn){if(bi){if(bn.hidden!=ag&&bh.getEditor(bn,A)!=x){U=bn.name;return L}}else{if(bn.name==bc){bi=ag}}})}if(U){return{row:bm,name:U,record:A}}A=bd.getAt(bf?++bm:--bm);if(bf&&!A&&!bj&&bh.autoappend!==L){bh.hideEditor();bd.create();A=bd.getAt(bm);bj=ag}if(bl&&A&&bh.getEditor(bb,A)!=x){U=bc}}}}return az},showEditorBy:function(U){var bb=this,bd=true,C=bb.findEditorBy(U);if(C){bb.hideEditor();var bc=C.row,A=C.record;bb.fireEvent(K,bb,bc,C.name,A,bd);bb.fireEvent(aZ,bb,bc,A)}},focusRow:function(bd){var bc=25,A=this.ub,U=A.getScroll().top,bb=A.getHeight(),C=A.dom.scrollWidth>A.dom.clientWidth?16:0;if(bd*bc<U){A.scrollTo(n,bd*bc-1)}else{if((bd+1)*bc>(U+bb-C)){A.scrollTo(n,(bd+1)*bc-bb+C)}}},focusColumn:function(U){var bf=this,A=25,C=bf.ub,bc=C.getScroll().left,bg=0,be=0,bb=0,bd;ai(bf.columns,function(bh){if(bh.name==U){be=bh.width}if(bh.hidden!==ag){if(bh.lock===ag){bb+=bh.width}else{if(be==0){bg+=bh.width}}}});bd=bg+be;if(bg<bc){C.scrollTo(c,bg)}else{if((bd-bc)>(bf.width-bb)){C.scrollTo(c,bd-bf.width+bb+(C.dom.scrollHeight>C.dom.clientHeight?16:0))}}},hideEditor:function(){var bb=this,U=bb.currentEditor;if(U){var C=U.editor;if(C){if(!C.canHide||C.canHide()){C.el.un(aU,bb.onEditorKeyDown,bb);C.un(an,bb.onEditorSelect,bb);Ext.fly(a6).un(z,bb.onEditorBlur,bb);C.move(-10000,-10000);var A=C.autocompleteview;if(A){A.hide()}bb.editing=L;C.blur();C.onBlur();C.isFireEvent=L;C.isHidden=ag;if(C.collapse){C.collapse()}delete bb.currentEditor}}}},onEditorBlur:function(bb,C){var U=this,A=U.currentEditor;if(A&&!A.editor.isEventFromComponent(C)){U.hideEditor.defer(Ext.isIE||Ext.isIE9?10:0,U)}},onLockHeadMove:function(C){var A=this;A.hmx=C.xy[0]-A.lht.getXY()[0];A.lh.setStyle(aR,A.isOverSplitLine(A.hmx)?aa:aB)},onUnLockHeadMove:function(U){var A=this;var C=A.uht;A.hmx=U.xy[0]-(C?C.getXY()[0]+C.getScroll().left:0)+A.lockWidth;A.uh.setStyle(aR,A.isOverSplitLine(A.hmx)?aa:aB)},onHeadMouseDown:function(C){var A=this;A.dragWidth=-1;if(A.overColIndex==undefined||A.overColIndex==-1){return}A.dragIndex=A.overColIndex;A.dragStart=C.getXY()[0];A.sp.setHeight(A.wrap.getHeight()).show().setStyle({top:A.wrap.getXY()[1]+ao,left:C.xy[0]+ao});Ext.get(a6).on(ay,A.onHeadMouseMove,A).on(aj,A.onHeadMouseUp,A);C.stopEvent()},onHeadClick:function(bf,bj){var bd=this,bg=Ext.fly(bj).parent(a),A=bd.dataset,U;if(bg){U=bg.getAttributeNS(x,aT)}if(U==G){var be=bg.getAttributeNS(x,R),C=bd.findColByName(be);if(C&&C.sortable===ag){if(A.isModified()){aC.showInfoMessage("提示","有未保存数据!");return}var bh=bg.child(ar),bc=x;if(bd.currentSortTarget){bd.currentSortTarget.removeClass([aH,i])}bd.currentSortTarget=bh;if(ak(C.sorttype)){C.sorttype=aQ;bh.removeClass(aH).addClass(i);bc=aQ}else{if(C.sorttype==aQ){C.sorttype=o;bh.removeClass(i).addClass(aH);bc=o}else{C.sorttype=x;bh.removeClass([i,aH])}}A.sort(be,bc)}}else{if(U==u){var bb=bg.child(s);if(bb){var bi=bb.hasClass(aP);if(!bi){A.selectAll()}else{A.unSelectAll()}}}}},setRadioStatus:function(A,C){if(!C){A.removeClass(aX).addClass(aK)}else{A.addClass(aX).removeClass(aK)}},setCheckBoxStatus:function(A,C){if(!C){A.removeClass(aP).addClass(aF)}else{A.addClass(aP).removeClass(aF)}},setSelectDisable:function(U,C){var A=this.dataset.selected.indexOf(C)==-1;if(this.selectionmodel==al){U.removeClass([aP,aF]).addClass(A?N:W)}else{U.removeClass([aX,aK,S,H]).addClass(A?H:S)}},setSelectEnable:function(U,C){var A=this.dataset.selected.indexOf(C)==-1;if(this.selectionmodel==al){U.removeClass([N,W]).addClass(A?aF:aP)}else{U.removeClass([aK,aX,H,S]).addClass(A?aK:aX)}},setSelectStatus:function(C){var U=this,bb=U.dataset;if(bb.selectfunction){var A=Ext.get(U.id+k+C.id);if(!bb.execSelectFunction(C)){U.setSelectDisable(A,C)}else{U.setSelectEnable(A,C)}}},onHeadMouseMove:function(bb){var U=this;bb.stopEvent();U.dragEnd=bb.getXY()[0];var C=U.dragEnd-U.dragStart,bc=U.columns[U.dragIndex],A=bc.width+C;if(A>30&&A<U.width){U.dragWidth=A;U.sp.setStyle(c,bb.xy[0]+ao)}},onHeadMouseUp:function(C){var A=this;Ext.get(a6).un(ay,A.onHeadMouseMove,A).un(aj,A.onHeadMouseUp,A);A.sp.hide();if(A.dragWidth!=-1){A.setColumnSize(A.columns[A.dragIndex].name,A.dragWidth)}A.syncScroll()},findColByName:function(A){var C;if(A){ai(this.columns,function(U){if(U.name&&U.name.toLowerCase()===A.toLowerCase()){C=U;return L}})}return C},selectRow:function(bd,C){var bb=this,bc=bb.dataset,A=bc.getAt(bd),U=(bc.currentPage-1)*bc.pagesize+bd+1;bb.selectedId=A.id;if(bb.selectlockTr){bb.selectlockTr.removeClass(ad)}if(bb.selectUnlockTr){bb.selectUnlockTr.removeClass(ad)}bb.selectUnlockTr=Ext.get(bb.id+aG+A.id);if(bb.selectUnlockTr){bb.selectUnlockTr.addClass(ad)}bb.selectlockTr=Ext.get(bb.id+aN+A.id);if(bb.selectlockTr){bb.selectlockTr.addClass(ad)}bb.focusRow(bd);if(C!==L&&U!=az){bc.locate.defer(5,bc,[U,L])}},setColumnSize:function(A,bh){var bc=this,bd,bb,U=0,C=0;ai(bc.columns,function(bi){if(bi.name&&bi.name===A){if(bi.hidden===ag){return}bi.width=bh;if(bi.lock!==ag){bd=bc.uh.child(a9+A+E);bb=bc.ub.child(a9+A+E)}else{if(bc.lh){bd=bc.lh.child(a9+A+E)}if(bc.lb){bb=bc.lb.child(a9+A+E)}}}if(bi.hidden!==ag){bi.lock!==ag?(C+=bi.width):(U+=bi.width)}});bc.wrap.select(ae+A+"] DIV.grid-cell").each(function(bi){bi.setStyle(T,Math.max(bh-(bi.hasClass(h)?7:4),0)+ao)});bc.unlockWidth=C;bc.lockWidth=U;if(bd){bd.setStyle(T,bh+ao)}if(bb){bb.setStyle(T,bh+ao)}var bg=Math.max(bc.width-U,0);if(bc.fb){bc.fb.child(a9+A+E).setStyle(T,bh+ao);bc.uf.setStyle(T,bg+ao);bc.fb.child("table[atype=fb.ubt]").setStyle(T,C+ao);var bf=bc.fb.child("table[atype=fb.lbt]");if(bf){bc.fb.child("div[atype=grid.lf]").setStyle(T,(U-1)+ao);bf.setStyle(T,U+ao)}}if(bc.lc){var be=Math.max(U-1,0);bc.lc.setStyle({width:be+ao,display:be==0?am:x})}if(bc.lht){bc.lht.setStyle(T,U+ao)}if(bc.lbt){bc.lbt.setStyle(T,U+ao)}bc.uc.setStyle(T,bg+ao);bc.uh.setStyle(T,bg+ao);bc.ub.setStyle(T,bg+ao);bc.uht.setStyle(T,C+ao);if(bc.ubt){bc.ubt.setStyle(T,C+ao)}bc.syncSize()},drawFootBar:function(C){var A=this;if(!A.fb){return}ai([].concat(C?C:A.columns),function(be){var bc=Ext.isString(be)?A.findColByName(be):be;if(bc&&bc.footerrenderer){var bd=aC.getRenderer(bc.footerrenderer);if(bd==az){alert(ac+bc.footerrenderer+aJ);return}var bb=bc.name,U=bd(A.dataset.data,bb);if(!ak(U)){A.fb.child(ae+bb+E).update(U)}}})},syncSize:function(){var A=this,U=0;ai(A.columns,function(bb){if(bb.hidden!==ag){if(bb.lock===ag){U+=bb.width}}});if(U!=0){var C=A.width-U;A.uc.setWidth(C);A.uh.setWidth(C);A.ub.setWidth(C)}},classfiyColumns:function(){var A=this;A.lockColumns=[],A.unlockColumns=[];A.lockWidth=0,A.unlockWidth=0;ai(A.columns,function(C){if(C.lock===ag){A.lockColumns.add(C);if(C.hidden!==ag){A.lockWidth+=C.width}}else{A.unlockColumns.add(C);if(C.hidden!==ag){A.unlockWidth+=C.width}}});A.columns=A.lockColumns.concat(A.unlockColumns)},showColumn:function(C){var A=this.findColByName(C);if(A&&A.visiable!=false){if(A.hidden===ag){delete A.hidden;A.forexport=ag;this.setColumnSize(C,A.hiddenwidth||A.width);delete A.hiddenwidth;this.wrap.select(ae+C+E).show()}}},hideColumn:function(C){var A=this.findColByName(C);if(A&&A.visiable!=false){if(A.hidden!==ag){A.hiddenwidth=A.width;this.setColumnSize(C,0,L);this.wrap.select(ae+C+E).hide();A.hidden=ag;A.forexport=L}}},removeColumn:function(A){var bf=this,bh=bf.columns,bi=[],be=[];ai(A,function(bk){col=bf.findColByName(bk);if(!col){return}if(col.lock){bi.push(bk)}else{be.push(bk)}bh.splice(bh.indexOf(col),1)});var bd=bi.length,bc=be.length,U=[];if(bd||bc){bf.classfiyColumns();if(bd){var C=bf.lockWidth,bj=bf.wrap.getWidth()-C;for(var bb=0;bb<bd;bb++){U.push(aV+bi[bb]+E)}if(C){bf.lht.setWidth(C);bf.lc.setWidth(C);bf.lbt.dom.width=C}else{bf.lc.remove()}bf.uc.setWidth(bj);bf.uh.setWidth(bj);bf.ub.setWidth(bj)}for(var bb=0;bb<bc;bb++){U.push(aV+be[bb]+E)}bf.wrap.select(U.join(",")).remove();var bg=bf.unlockWidth;bf.uht.setWidth(bg);bf.ubt.setWidth(bg)}},createHead:Ext.isIE||Ext.isIE9?function(be,bf,U,bd,C){var A=bd.query(a3),bb=Ext.fly(A[0]).child("th[width=20]"),bc;if(U){bc=bd.query(aV+U+E)[0]}if(bf==aY){bc=bc.nextSibling||az;C++}else{if(bf==e){if(bb){bc=bb.dom}C=-1}}ai(be,function(bk){var bh=Ext.get(aE.createElement(a8)),bj=Ext.get(A[1].insertCell(C)),bg=bk.width,bi=bk.name;if(C>-1){C++}bj.addClass("grid-hc").set({dataindex:bi,atype:G}).update("<div>"+bk.prompt+"</div>");if(bc){A[0].insertBefore(bh.dom,bc)}else{A[0].appendChild(bh.dom)}bh.setStyle(T,bg+ao).set({dataindex:bi})})}:function(be,bf,A,bc){var C=[],bb=[],U=bc.query(bf!=e?aV+A+E:a3);ai(be,function(bg){C.push('<th style="width:',bg.width,ao,';" ',R,'="',bg.name,'"></th>');bb.push('<td class="grid-hc" atype="grid.head" ',R,'="',bg.name,'"><div>',bg.prompt,"</div></td>")});new Ext.Template(C.join(x))[bf](U[0],{});new Ext.Template(bb.join(x))[bf](U[1],{});var bd=Ext.fly(U[0]).child("th[width=20]");if(bd){bd.appendTo(Ext.fly(U[0]))}},addColumn:function(bn,C,bd){var be=this;if(be.dataset.isModified()){aC.showInfoMessage(_lang["grid.info"],_lang["grid.info.continue"])}else{var bj=be.columns,bf=bj.length,bm,bk;if(C&&bd){var bb=be.findColByName(C);if(bb){bm=bb.lock;bk=be[bm?"lockColumns":"unlockColumns"].indexOf(bb);bf=(bd==f?0:1)+bj.indexOf(bb)}else{alert("未找到列"+C);return}}var bl=[],bc=[];ai(bn,function(bq){var bp=Ext.apply(Ext.apply({},m),bq),bo=be.findColByName(bp.name);if(bo){return}if(bp.lock){bl.push(bp)}else{bc.push(bp)}});var U=bl.concat(bc);if(U.length){var A=bd?(bd==f?aM:aY):e,bi=umethod=A,bg=uname=C,bh=be.wrap;if(bm){umethod=aM;uname=be.unlockColumns[0].name}else{bi=e;bg=az}be.columns=bj.slice(0,bf).concat(U).concat(bj.slice(bf));be.classfiyColumns();if(bl.length){if(!be.lht){be.lc=new Ext.Template("<DIV class='grid-la' atype='grid.lc' style='width:24px;'><DIV class='grid-lh' atype='grid.lh' unselectable='on' onselectstart='return false;' style='height:25px;'><TABLE cellSpacing='0' atype='grid.lht' cellPadding='0' border='0' style='width:25px'><TBODY><TR class='grid-hl'></TR><TR height=25></TR></TBODY></TABLE></DIV><DIV class='grid-lb' atype='grid.lb' style='width:100%;height:255px'></DIV></DIV>").insertFirst(be.wrap.dom,{},ag);be.lh=bh.child("div[atype=grid.lh]");be.lb=bh.child("div[atype=grid.lb]");be.lht=bh.child("table[atype=grid.lht]");be.lb[aO](p,be.onClick,be)[aO](a7,be.onDblclick,be);be.lht[aO](ay,be.onLockHeadMove,be);be.lh[aO](z,be.onHeadMouseDown,be)[aO](p,be.onHeadClick,be)}be.createHead(bl,bi,bg,be.lht,bk)}if(bc.length){be.createHead(bc,umethod,uname,be.uht,bk)}if(be.lb){be.lb.update(x)}be.ub.update(x);ai(U,function(bo){be.setColumnSize(bo.name,bo.width)});be.dataset.query()}}},insertColumnBefore:function(C,A){this.addColumn(A,C,f)},insertColumnAfter:function(C,A){this.addColumn(A,C,1)},setWidth:function(U){var bb=this;if(bb.width==U){return}bb.width=U;bb.wrap.setWidth(U);var C=aC.CmpManager.get(bb.id+b);if(C){C.setWidth(U)}var A=aC.CmpManager.get(bb.id+l);if(A){A.setWidth(U)}if(bb.fb){bb.fb.setWidth(U)}var bc=U-bb.lockWidth;bb.uc.setWidth(bc);bb.uh.setWidth(bc);bb.ub.setWidth(bc);if(bb.uf){bb.uf.setWidth(bc)}},setHeight:function(bb){var bc=this;if(bc.height==bb){return}bc.height=bb;var C=aC.CmpManager.get(bc.id+b);if(C){bb-=25}var A=aC.CmpManager.get(bc.id+l);if(A){bb-=25}if(bc.fb){bb-=25}bc.wrap.setHeight(bb);var U=bb-25;if(bc.lb){bc.lb.setHeight(U)}bc.ub.setHeight(U)},deleteSelectRows:function(U){var C=this.dataset,A=[].concat(C.getSelected());if(A.length>0){C.remove(A)}},remove:function(){var A=this.dataset.getSelected();if(A.length>0){aC.showConfirm(_lang["grid.remove.confirm"],_lang["grid.remove.confirmMsg"],this.deleteSelectRows.createDelegate(this))}},clear:function(){var C=this.dataset,A=C.getSelected();while(A[0]){C.removeLocal(A[0])}},_export:function(C,A,U){this.exportOptions={type:C||"xls",filename:A,separator:U};this.showExportConfirm()},showExportConfirm:function(){var bb=this,bf=0,be=bb.id+"_export",bd=['<div class="item-export-wrap" style="margin:15px;width:270px" id="',be,'">','<div class="grid-uh" atype="grid.uh" style="width: 270px; -moz-user-select: none; text-align: left; height: 25px; cursor: default;" onselectstart="return false;" unselectable="on">','<table cellSpacing="0" cellPadding="0" border="0"><tbody><tr height="25px">','<td class="export-hc" style="width:22px;" atype="export.rowcheck"><center><div atype="export.headcheck" class="',a4,aF,'"></div></center></td>','<td class="export-hc" style="width:222px;" atype="grid-type">',_lang["grid.export.column"],"</td>","</tr></tbody></table></div>",'<div style="overflow:auto;height:200px;"><table cellSpacing="0" cellPadding="0" border="0"><tbody>'],U=ag,A=350,bc=bb.exportOptions||(bb.exportOptions={}),C=bc&&bc.type;ai(bb.columns,function(bh,bg){if(!bb.isFunctionCol(bh.type)){if(U){U=bh.forexport!==L}bd.push("<tr",(bf+bg)%2==0?x:' class="',d,'"','><td class="',F,'" style="width:22px;" ',D,'="',bg,'" atype="export.rowcheck"><center><div id="',bb.id,k,bg,'" class="',a4,bh.forexport===L?aF:aP,'"></div></center></td><td><div class="',q,'" style="width:220px">',bh.prompt,bh.hidden?'<div style="float:right;color:red">&lt;隐藏列&gt;</div>':x,"</div></td></tr>")}else{bf++}});if(U){bd[7]=aP}bd.push("</tbody></table></div></div>");if(C=="xls"||C=="xlsx"){A+=30;bd.push('<div class="item-radio" class="item-radio" style="margin:15px;width:270px;height:30px">','<div class="item-radio-option" style="width:128px;float:left" itemvalue="xls">','<div class="item-radio-img  item-radio-img-',C=="xls"?"c":"u",'"></div>','<label class="item-radio-lb">excel2003</label>',"</div>",'<div class="item-radio-option" style="width:128px;float:left" itemvalue="xlsx">','<div class="item-radio-img  item-radio-img-',C=="xlsx"?"c":"u",'"></div>','<label class="item-radio-lb">excel2007</label>',"</div>","</div>")}bd.push('<div style="margin:15px;width:270px;color:red">',_lang["grid.export.confirmMsg"],"</div>");bb.exportwindow=aC.showOkCancelWindow(_lang["grid.export.config"],bd.join(x),function(bg){bb.doExport();bg.body.un(p,bb.onExportClick,bb)},az,az,A);bb.exportwindow.body.on(p,bb.onExportClick,bb)},onExportClick:function(bd,bj){bj=Ext.fly(bj);var bc=this,bf=bj.parent("td.grid-rowbox")||bj.parent("td.export-hc"),A=bj.hasClass("item-radio-option")?bj:bj.parent("div.item-radio-option");if(bf){var C=bf.getAttributeNS(x,aT);if(C=="export.rowcheck"){var bh=bf.getAttributeNS(x,D),U=bf.child(ar),bg=U.hasClass(aP),bb=U.getAttributeNS(x,aT),be=bc.columns;bc.setCheckBoxStatus(U,!bg);if(bb=="export.headcheck"){var bi=(bc.isFunctionCol(be[0].type)?1:0)+(bc.isFunctionCol(be[1].type)?1:0);bc.exportwindow.body.select("td[atype=export.rowcheck] div[atype!=export.headcheck]").each(function(bk,bm,bl){bc.setCheckBoxStatus(bk,!bg);be[bl+bi].forexport=!bg})}else{be[bh].forexport=!bg}}}else{if(A){bc.setRadioStatus(A.child("div"),ag);bc.setRadioStatus((A.prev()||A.next()).child("div"),L);bc.exportOptions.type=A.getAttributeNS(x,"itemvalue")}}},doExport:function(){var C=this,A=C.exportOptions||{};aC.doExport(C.dataset,C.columns,az,A.type,A.separator,A.filename);delete C.exportOptions},destroy:function(){aC.Grid.superclass.destroy.call(this);this.processDataSetLiestener("un");this.sp.remove();delete this.sp},createCompositeEditor:function(br,bb,bd,bh){var bq=this,bk=bq.id,bj=bq.dataset,bl=bd.id,be=bq.findColByName(br),bp=be.lock,U=Ext.get(bk+(bp?aN:aG)+bl),bi=Ext.get(bk+(bp?aG:aN)+bl),bo=bp?bq.lbt:bq.ubt,bf=this.dataset.indexOf(bd);if(bq.currentEditor&&bq.currentEditor.editor instanceof a2){bq.hideEditor()}var bn=bo.dom,bc=bn.tBodies[0],bm=document.createElement(a3),bg=document.createElement(a);bm.id=bk+"_cmp_"+br+ah+bl;Ext.fly(bm).addClass(bf%2==0?x:d);Ext.fly(bm).set({_row:bd.id});bg.colSpan=bb;bg.innerHTML=bh.html;bm.appendChild(bg);if(bj.indexOf(bd)>=bj.data.length-1){bc.appendChild(bm)}else{var A=bj.getAt(bj.indexOf(bd)+1);var C=Ext.get(bk+(bp?aN:aG)+A.id);bc.insertBefore(bm,C.dom)}if(bi){bi.setHeight(bh.height)}Ext.each(U.dom.childNodes,function(bt){var bs=Ext.get(bt).getAttributeNS(x,R);if(bs==br){return L}bt.rowSpan=2});this.hideEditor()},createCompositeRow:function(C,bd,bc,bf,A,bb){var U=[];bd.name=C;if(bb.find("name",C)){var be=this.dataset.indexOf(A);U.push('<tr id="',this.id,"_cmp_",C,ah,A.id,'" class="'+(be%2==0?x:d)+'" _row="'+A.id+'"><td colSpan="',bf,'">');U.push(bc.html);U.push("</td></tr>");bd.html=U.join("")}else{bd.height=bc.height}},removeCompositeEditor:function(A,bc){var bd=this,C=bd.id,bh=bc.id,bb=bd.findColByName(A),bg=bb.lock,U=Ext.get(C+(bg?aN:aG)+bh),bf=Ext.get(C+(bg?aG:aN)+bh);if(bd.currentEditor&&bd.currentEditor.editor instanceof a2){bd.hideEditor()}if(bf){bf.setHeight(22)}Ext.each(U&&U.dom.childNodes,function(bi){if(Ext.get(bi).getAttributeNS(x,R)==A){return L}bi.rowSpan=1});var be=Ext.get(C+"_cmp_"+A+ah+bh);if(be){be.remove()}},show:function(){aC.Grid.superclass.show.call(this);this.wb.show()},hide:function(){aC.Grid.superclass.hide.call(this);this.wb.hide()}});aC.Grid.revision="$Rev$"})($A);