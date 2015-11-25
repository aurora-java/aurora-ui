(function(t){var u="",a="scroll-disabled",i="tab-scroll-left-over",k="tab-scroll-right-over",b="tab-scroll-left",y="tab-scroll-right",m="tab-close",e="tab-btn-over",n="tab-btn-down",c="tab-scroll",q="right",r="left",j="active",f="unactive",o="none",z="block",s="select",l="beforeopen",v="beforeselect",x="padding-left",g="strip",w="."+g,h="销毁Tab出错: ",p=['<div class="strip unactive"  unselectable="on" onselectstart="return false;">','<div class="strip-left"></div>','<div style="width:{stripwidth}px;" class="strip-center"><div class="tab-close"></div>{prompt}</div>','<div class="strip-right"></div>',"</div>"],d='<div  hideFocus style="height:{bodyheight}px" class="tab"></div>';IFRAME_TPL='<iframe frameborder="0" style="border:none;width:{bodywidth}px;height:{bodyheight}px;left:-10000px;top:-10000px;" class="tab"></iframe>';t.Tab=Ext.extend(t.Component,{constructor:function(A){t.Tab.superclass.constructor.call(this,A)},initComponent:function(B){t.Tab.superclass.initComponent.call(this,B);var E=this,A=E.wrap,D=E.head=A.child("div[atype=tab.strips]"),C=E.stripwrap=D.parent();E.stripwidth=B.stripwidth||60;E.body=A.child("div.item-tab-body");E.scrollLeft=A.child("div[atype=scroll-left]");E.scrollRight=A.child("div[atype=scroll-right]");E.sp=C.parent();E.selectTab(B.selected||0)},processListener:function(A){var B=this;t.Tab.superclass.processListener.call(B,A);B.sp[A]("mousedown",B.onMouseDown,B)[A]("mouseup",B.onMouseUp,B);B.stripwrap[A]("click",B.onClick,B)[A]("mousewheel",B.onMouseWheel,B)},initEvents:function(){t.Tab.superclass.initEvents.call(this);this.addEvents(s,l,v)},setURL:function(B,A){var D=this,C=D.getTab(B);if(C){B=C.index;if(B==D.selectedIndex){D.reloadTab(B,A)}else{C.body.loaded=false;D.items[B].ref=A}}},selectTab:function(I,M){var H=this,B=H.getTab(I);if(!B){return}var I=B.index,G=B.strip,N=B.body;if(G.hasClass(a)){H.selectTab(I+1);return}if(H.fireEvent(v,H,I,B)){H.selectedIndex=I;if(H.activeTab){H.activeTab.replaceClass(j,f)}H.activeTab=G;G.replaceClass(f,j);var C=H.stripwrap,F=H.scrollLeft,A=H.scrollRight,E=G.dom.offsetLeft,L=G.getWidth(),D=C.getScroll().left,K=C.getWidth(),J=H.head.getWidth();tr=E+L-D-K,tl=D-E;if(tr>0){A.removeClass(a);F.removeClass(a);C.scrollTo(r,D+tr)}else{if(tl>0){F.removeClass(a);C.scrollTo(r,D-tl);A.removeClass(a)}}if(K+C.getScroll().left>=J){C.scrollTo(r,J-K);A.addClass(a)}else{if(I==0){C.scrollTo(r,0);F.addClass(a)}}if(N){if(H.activeBody){H.activeBody.setStyle({left:"-10000px",top:"-10000px"})}H.activeBody=N.setStyle({left:0,top:0})}if(H.items[I].ref&&!N.loading&&(N.loaded!=true||M)){N.loading=true;H.load(H.items[I].ref,N,I)}else{H.fireEvent(s,H,I,B)}}},openTab:function(C,B){var I=this,F=0,J=I.items,E=J.length;for(;F<E;F++){var L=J[F];if(L.ref&&L.ref==C){I.selectTab(F);return}}if(I.fireEvent(l,I,E)!==false){J.push({ref:C,prompt:B});var G=Math.max(t.TextMetrics.measure(document.body,B).width+20,I.stripwidth),K=I.head,H=I.body,D=I.stripwrap,A=K.getWidth()+G+6;K.setWidth(A);if(A>D.getWidth()){I.scrollLeft.setStyle({display:z});I.scrollRight.setStyle({display:z});D.setStyle(x,"1px")}new Ext.Template(p).append(K.dom,{prompt:B,stripwidth:G});new Ext.Template(I.loadtype=="iframe"?IFRAME_TPL:d).append(H.dom,{id:I.id,bodywidth:H.getWidth()-H.getBorderWidth("lr"),bodyheight:H.getHeight()-H.getBorderWidth("tb")});I.selectTab(E)}},closeTab:function(C){var G=this,D=G.getTab(C);if(!D){return}var B=D.strip,F=D.body,H=D.index;if(!B.child("div."+m)){t.showWarningMessage("警告","该Tab页无法被关闭!");return}if(G.activeBody==D.body){G.activeBody=null;G.activeTab=null}G.items.splice(H,1);var I=G.head,E=G.stripwrap,A=I.getWidth()-B.getWidth();if(A<=E.getWidth()){G.scrollLeft.setStyle({display:o});G.scrollRight.setStyle({display:o});E.setStyle(x,"0")}B.remove();F.remove();delete F.loaded;(function(){Ext.iterate(F.cmps,function(J,K){if(K.destroy){try{K.destroy()}catch(L){alert(h+L)}}});I.setWidth(A)}).defer(10);if(H==G.selectedIndex){G.selectTab(H-1)}else{if(H<G.selectedIndex){G.selectedIndex--}}},destroy:function(){Ext.each(this.body.dom.children,function(A){Ext.iterate(Ext.get(A).cmps,function(B,C){if(C.destroy){try{C.destroy()}catch(D){alert(h+D)}}})});t.Tab.superclass.destroy.call(this)},setDisabled:function(A){var D=this,C=D.getTab(A);if(!C){return}if(D.items.length>1){var B=C.strip,A=C.index;if(D.activeTab==B){D.selectTab(A+(D.getTab(A+1)?1:-1))}B.addClass(a)}},setEnabled:function(A){var B=this.getTab(A);if(!B){return}B.strip.removeClass(a)},getTab:function(F){var E=this,B=E.body.query(">.tab"),D=E.head.query("div.strip"),C,A;if(Ext.isNumber(F)){if(F<0){F+=D.length}F=Math.round(F);if(D[F]){C=Ext.get(D[F]);A=Ext.get(B[F])}}else{F=Ext.get(F);F=Ext.each(D,function(H,G){if(H==F.dom){C=F;A=Ext.get(B[G]);return false}})}if(C){A.loaded=!(E.items[F].ref&&A.loaded!=true);return{strip:C,body:A,index:F}}else{return null}},scrollTo:function(D){var F=this,E=F.stripwrap,C=F.scrollRight,G=F.scrollLeft,B=E.getScroll().left,A=F.stripwidth;if(D==r){E.scrollTo(r,B-A);C.removeClass(a);if(E.getScroll().left<=0){G.addClass(a).replaceClass(i,b);F.stopScroll()}}else{if(D==q){E.scrollTo(r,B+A);G.removeClass(a);if(E.getScroll().left+E.getWidth()>=F.head.getWidth()){C.addClass(a).replaceClass(k,y);F.stopScroll()}}}},stopScroll:function(){if(this.scrollInterval){clearInterval(this.scrollInterval);delete this.scrollInterval}},onClick:function(C,A){var B=Ext.fly(A);if(B.hasClass(m)){this.closeTab(B.parent(w))}},onMouseWheel:function(A){var B=A.getWheelDelta();if(B>0){this.scrollTo(r);A.stopEvent()}else{if(B<0){this.scrollTo(q);A.stopEvent()}}},onMouseDown:function(E,A){var C=Ext.fly(A),B=C.parent(w),D=this;if(C.hasClass(m)){C.removeClass(e).addClass(n)}else{if(C.hasClass(c)&&!C.hasClass(a)){if(C.hasClass(i)){D.scrollTo(r)}else{D.scrollTo(q)}D.scrollInterval=setInterval(function(){if(C.hasClass(c)&&!C.hasClass(a)){if(C.hasClass(i)){D.scrollTo(r)}else{D.scrollTo(q)}if(C.hasClass(a)){clearInterval(D.scrollInterval)}}},100)}else{if(B&&B.hasClass(g)&&!B.hasClass(j)&&!B.hasClass(a)){D.selectTab(B)}}}},onMouseUp:function(A){this.stopScroll()},onMouseOver:function(E,B){var D=Ext.fly(B),C=D.parent(w);if(D.hasClass(c)&&!D.hasClass(a)){if(D.hasClass(b)){D.replaceClass(b,i)}else{if(D.hasClass(y)){D.replaceClass(y,k)}}}else{if(D.hasClass(m)){D.addClass(e)}}if(C){D=C.child("div."+m);if(D){var A=this.currentBtn;if(A){A.hide()}this.currentBtn=D;D.show()}}t.Tab.superclass.onMouseOver.call(this,E)},onMouseOut:function(D,A){var C=Ext.fly(A),B=C.parent(w);if(C.hasClass(c)&&!C.hasClass(a)){this.stopScroll();if(C.hasClass(i)){C.replaceClass(i,b)}else{if((C.hasClass(k))){C.replaceClass(k,y)}}}else{if(C.hasClass(m)){C.removeClass([e,n])}}if(B){C=B.child("div."+m);if(C){C.hide()}}t.Tab.superclass.onMouseOut.call(this,D)},showLoading:function(A){t.Masker.mask(A,_lang["tab.loading"])},clearLoading:function(A){t.Masker.unmask(A)},reloadTab:function(B,A){B=Ext.isEmpty(B)?this.selectedIndex:B;var D=this,C=D.getTab(B);if(!C){return}if(A){D.items[B].ref=A}D.selectTab(B,true)},load:function(C,E,B){var D=this,A=Ext.get(E);Ext.iterate(A.cmps,function(F,G){if(G.destroy){try{G.destroy()}catch(H){alert(h+H)}}});A.update(u);A.cmps={};if(A.dom.tagName.toLowerCase()=="iframe"){var C=Ext.urlAppend(C,Ext.urlEncode(Ext.apply({},{_sph:A.getHeight(),_spw:A.getWidth()})));A.dom.src=C}else{D.showLoading(A);Ext.Ajax.request({url:C,failure:function(F,G){D.clearLoading(A);var H=['<div style="text-align:center;line-height:30px">'];switch(F.status){case 404:H.push("<H2>",F.status,_lang["ajax.error"],"</H2>",_lang["ajax.error.404"]+'"'+F.statusText+'"');break;case 500:H.push("<H2>",F.status,_lang["ajax.error"],"</H2>",_lang["tab.internet.error"],"<a href=\"javascript:$('"+D.id+"').selectTab("+B+')">',_lang["tab.internet.refresh"],"</a>");break;case 0:break;default:H.push(_lang["ajax.error"],F.statusText);break}H.push("</div>");A.update(H.join(""));A.loading=false},success:function(F,H){var K;try{K=Ext.decode(F.responseText)}catch(L){}if(K&&K.success==false){if(K.error){if(K.error.code&&K.error.code=="session_expired"){t.showErrorMessage(_lang["ajax.error"],_lang["session.expired"])}else{t.manager.fireEvent("ajaxfailed",t.manager,H.url,H.para,K);var G=K.error.stackTrace,J=K.error.message;G=G?G.replaceAll("\r\n","</br>"):u;t.showErrorMessage(_lang["window.error"],J?J+"</br>"+G:G,null,400,J&&G==u?150:250)}}A.loading=false;return}var I=F.responseText;A.set({url:C});A.update(I,true,function(){D.clearLoading(A);A.loaded=true;A.loading=false;D.fireEvent(s,D,B)},A)}})}},setWidth:function(J){J=Math.max(J,2);var F=this;if(F.width==J){return}t.Tab.superclass.setWidth.call(F,J);var E=F.body,H=F.head,B=F.stripwrap,C=F.scrollLeft,A=F.scrollRight;B.setWidth(J-38);if(J-38<H.getWidth()){C.setStyle({display:u});A.setStyle({display:u});B.setStyle(x,"1px");var D=B.getScroll().left,I=B.getWidth(),G=H.getWidth();if(D<=0){C.addClass(a)}else{C.removeClass(a)}if(D+I>=G){if(!A.hasClass(a)){A.addClass(a)}else{B.scrollTo(r,G-I)}}else{A.removeClass(a)}}else{C.setStyle({display:o});A.setStyle({display:o});B.setStyle(x,"0").scrollTo(r,0)}},setHeight:function(A){A=Math.max(A,25);if(this.height==A){return}t.Tab.superclass.setHeight.call(this,A);this.body.setHeight(A-26)}})})($A);