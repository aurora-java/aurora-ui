(function(){var d=Math.sin,f=Math.cos,a=Math.min,j=Math.sqrt,c=Math.PI,g=c/180,b=function(n,l){var k=new Ext.Template('<span style="font-size:{fontSize}">{text}</span>').append(document.body,{fontSize:l,text:n},true),m=k.getWidth();k.remove();return m},e=function(k){switch(k){case"left":case"top":return -1;case"right":case"bottom":return 1;default:return 0}},i=function(l,k){switch(k){case -1:return 0;case 0:return l/2;case 1:return l}},h=function(){function m(n){var o=function(){};o.prototype=n;return new o()}function l(o,n,p){if(Ext.isObject(p)){if(Ext.isObject(o[n])){k(o[n],p)}else{o[n]=m(p)}}else{if(Ext.isArray(p)){o[n]=[].concat(p)}else{o[n]=p}}return o}function k(t,p,o){if(Ext.isString(p)){return l(t,p,o)}for(var s=1,n=arguments.length;s<n;s++){var q=arguments[s];for(var r in q){l(t,r,q[r])}}return t}return function(){var o=[{}],p=arguments.length,n;while(p--){if(!Ext.isBoolean(arguments[p])){o[p+1]=arguments[p]}}n=k.apply(null,o);return n}}();$A.Dashboard=Ext.extend($A.Graphics,{options:{align:"center",verticalAlign:"middle",padding:10,max:100,min:0,borderWidth:4,borderColor:"#4572A7",borderRadius:5,style:{fontFamily:'"Lucida Grande", "Lucida Sans Unicode", Verdana, Arial, Helvetica, sans-serif',fontSize:"11px",color:"#000"},board:{allowDecimals:true,dashWidth:0,fillColor:"gradient(linear,-50% 0,50% 0,color-stop(0,rgba(0,255,255,1)),color-stop(50%,rgba(255,255,0,1)),color-stop(100%,rgba(255,0,0,1)))",fillOpacity:0.5,borderColor:"#000",borderWidth:1,startAngle:0,endAngle:180,tickColor:"#000",tickLength:"25%",tickPosition:"inside",tickInterval:null,tickAngleInterval:45,tickWidth:1,minorTickColor:"#A0A0A0",minorTickLength:2,minorTickPosition:"inside",minorTickWidth:0,marginalTickLength:"50%",marginalTickWidth:1,marginalTickColor:"#000",startOntick:true,showFirstLabel:true,showLastLabel:true,labels:{enabled:true,x:5,y:5,style:{color:"#666",fontSize:"11px",lineHeight:"14px"}}},pointer:{fillColor:"rgba(135,135,135,0.8)",fillOpacity:1,borderColor:"#000",borderWidth:1,width:8,dist:10,labels:{enabled:true,x:5,y:15,style:{color:"rgb(145,45,0)",fontSize:"11px",lineHeight:"14px"}}},title:{text:"Dashboard title",align:"center",verticalAlign:"top",margin:15,x:0,y:0,style:{color:"#3E576F",fontSize:"16px"}}},constructor:function(k){$A.Dashboard.superclass.constructor.call(this,k);this.setOptions(k)},processDataListener:function(k){var l=this.binder&&this.binder.ds;if(l){l[k]("update",this.redraw,this)}},bind:function(l,k){if(typeof(l)=="string"){l=$(l)}if(!l){return}this.binder={ds:l,name:k};this.record=l.getCurrentRecord();this.processDataListener("on");this.onLoad()},setOptions:function(k,l){this.options=h(this.options,k);if(l){this.redraw()}},onLoad:function(){var k=this;if(!this.hasSVG){$A.onReady(function(){k.redraw()})}else{k.redraw()}},redraw:function(){if(!this.record){return}this.clear();this.group=this.createGElement("group");this.renderBoard();this.renderCenter();this.renderTitle();this.renderPointer()},setTitle:function(k){this.options.title=h(this.options.title,k);this.redraw()},clear:function(){var k=this.top.cmps;while(k.length){k.pop().destroy()}this.pointerEl=null},renderTitle:function(){var z=this.options.title,u=z.text;if(!u){return}var p=e(z.align),o=e(z.verticalAlign),l=this.width,v=this.height,n=z.margin,t=z.x,s=z.y,k=z.style,w=k.fontSize,m=k.color,q=b(u,w),r=parseInt(w);this.titleEl=this.createGElement("text",{root:this.group.wrap,text:u,color:m,size:r,dx:t+n+i(l-n*2-q,p),dy:s+n+i(v-n*2-r,o)})},renderBoard:function(){var I=this.options,Q=I.title,s=Q.verticalAlign,v=I.board,ae=I.padding,r=I.borderWidth,S=I.borderColor,m=I.borderRadius,u=(Ext.isEmpty(I.marginLeft)?0:I.marginLeft)+r,aj=(Ext.isEmpty(I.marginRight)?0:I.marginRight)+r,Y=(Ext.isEmpty(I.marginTop)?(Q.text&&s=="top"?Q.y+Q.margin*2:0):I.marginTop)+r,R=(Ext.isEmpty(I.marginBottom)?(Q.text&&s=="bottom"?Q.y+Q.margin*2:0):I.marginBottom)+r,l=(I.width||300)-ae*2-u-aj,n=(I.height||300)-ae*2-Y-R,ad=e(I.align||"center"),K=e(I.verticalAlign||"middle"),B={},aa,X,W,q,o,U=(v.startAngle%360+360)%360,C=(v.endAngle%360+360)%360,C=C>U?C:C+360,E=I.max,ai=I.min,ag=v.dashWidth||a(n,l)/4,Z=v.tickAngleInterval,V=v.startOntick?U:10,p=this.normalizeTickInterval(v.tickInterval?v.tickInterval:(E-ai)*Z/(C-V),v),T=Math.ceil((E-ai)/p),Z=(C-V)/T,V=g*V,ac=g*(E-ai)*Z/p+V,Z=g*Z,J=g*U,z=g*(C%360),G=d(J),D=d(z),N=f(J),L=f(z),t=function(ao,y,al,ak){aa=a(ao,y);var x={xR:al*aa,yR:ak*aa},ap,am,aq,an;if(y<=ao){an=l*(1-aa/ao);ap="x";am="y";aq=ad}else{an=n*(1-aa/y);ap="y";am="x",aq=K}x[ap]=ae+x[ap+"R"]+i(an,aq);x[am]=ae+x[am+"R"];X=x.x+u;W=x.y+Y};if(G>=0){if(N>=0){if(D>=0){if(L>N){t(l/2,n/2,1,1)}else{if(L>=0){t(l/N,n/D,0,D)}else{t(l/(N-L),n,-L,1)}}}else{if(L>N){t(l/(1+L),n/2,1,1)}else{if(L>=0){t(l/(1+N),n/2,1,1)}else{t(l/(1+N),n/(1-D),1,1)}}}}else{if(L<=0){if(D>G){t(l/2,n/2,1,1)}else{if(D>=0){t(l/-L,n/G,-L,G)}else{t(l,n/(G-D),1,G)}}}else{if(D>G){t(l/2,n/(1+D),1,D)}else{if(D>=0){t(l/2,n/(1+G),1,G)}else{t(l,n/(G-D),1,G)}}}}}else{if(N<=0){if(D<=0){if(L<N){t(l/2,n/2,1,1)}else{if(L<=0){t(l/-N,n/-D,-N,0)}else{t(l/(L-N),n,-N,0)}}}else{if(L<N){t(l/(1-L),n/2,1,1)}else{if(L<=0){t(l/(1+N),n/2,1,1)}else{t(l/(1-N),n/(1+D),1,D)}}}}else{if(L>=0){if(D<G){t(l/2,n/2,1,1)}else{if(D<=0){t(l/L,n/-G,0,0)}else{t(l,n/(D-G),0,D)}}}else{if(D<G){t(l/2,n/(1-D),1,1)}else{if(D<=0){t(l/2,n/(1-G),1,1)}else{t(l/(1-L),n/(1-G),-L,1)}}}}}this.createGElement("rect",{root:this.group.wrap,x:0+r,y:0+r,width:this.width-r*2,height:this.height-r*2,rx:m,ry:m,strokecolor:S,strokewidth:r,fillcolor:"transparent"}).createGElement("arc",{root:this.group.wrap,x:X,y:W,r:aa,innerR:aa-ag,start:J,end:z,cursor:"default",fillcolor:v.fillColor,fillopacity:v.fillOpacity,strokecolor:v.borderColor,strokewidth:v.borderWidth});var A=V,ab=ai,w=v.labels,k=w.style,P=k.color||I.style.color,H;v.dashWidth=ag;for(var af=0;af<=T;af++){var B=this.getTickOptions(v,(af==0||af==T)?"marginal":""),O=B.length,M=f(A),F=d(A),ah=[X+aa*M,W-aa*F,X+(aa-O)*M,W-(aa-O)*F];H=!w.enabled||(!v.showFirstLabel&&af==0)||(!v.showLastLabel&&af==T);alert(A==J);this.createGElement("line",{root:this.group.wrap,points:ah.join(" "),strokewidth:(A==J||A==z)?0:B.width,strokecolor:B.color,title:H?"":(ab+""),titlesize:parseInt(k.fontSize||I.style.fontSize),titlecolor:k.color||I.style.color,titlex:w.x,titley:w.y,titlerotation:90-A/g,titlefontfamily:k.fontFamily||I.style.fontFamily});if(af==T-1){ab=E;A=ac}else{ab+=p;A+=Z}}Ext.apply(I.pointer,{center:[X,W],start:J,end:z,minAngle:V,maxAngle:ac,radius:aa-I.pointer.dist})},getTickOptions:function(k,l){l=l?l+"T":"t";var m=k[l+"ickLength"];if(/\%/.test(m)){m=parseInt(m)/100*k.dashWidth}return{length:m,width:k[l+"ickWidth"],color:k[l+"ickColor"]}},renderPointer:function(){var w=this.record.get(this.binder.name),D=this.options.max,C=this.options.min;if(/\%/.test(w)){w=(D-C)*parseInt(w)/100+C}var n=this.options.pointer,H=n.labels,E=this.options.style,l=H.style,B=n.width,p=n.radius,I=n.center,q=n.minAngle,o=n.maxAngle<q?n.maxAngle+c*2:n.maxAngle,F=(o-q)/(D-C)*(w-C)+q,r=g*135,z=F+r,t=F-r,k=d(F),m=f(F),A=B*p*j(2)/(2*p-B),u=I[0]+p*m,s=I[1]-p*k,G=["M",I[0]-u,I[1]-s,"L",I[0]+A*f(z)-u,I[1]-A*d(z)-s,0,0,I[0]+A*f(t)-u,I[1]-A*d(t)-s,"Z"];this.pointerEl=this.createGElement("path",{root:this.group.wrap,d:G.join(" "),x:u,y:s,strokecolor:n.borderColor,strokewidth:n.borderWidth,fillcolor:n.fillColor,fillopacity:n.fillOpacity,title:H.enabled?w:"",titlesize:parseInt(l.fontSize||E.fontSize),titlecolor:l.color||E.color,titlex:H.x,titley:H.y,titlerotation:90-F/g,titlefontfamily:l.fontFamily||E.fontFamily});this.setTopCmp(this.centerEl.wrap);this.setTopCmp(this.titleEl.wrap)},renderCenter:function(){var l=this.options.pointer,k=l.center,m=l.width;this.centerEl=this.createGElement("arc",{root:this.group.wrap,x:k[0],y:k[1],r:m,innerR:m-2,start:l.start,end:l.end,cursor:"default",strokecolor:l.borderColor,strokewidth:l.borderWidth})},normalizeTickInterval:function(k,l){var n=Math.pow(10,Math.floor(Math.log(k)/Math.LN10)),o=k/n,p=[1,2,2.5,5,10];if(l&&l.allowDecimals===false){if(n===1){p=[1,2,5,10]}else{if(n<=0.1){p=[1/n]}}}for(var m=0;m<p.length;m++){k=p[m];if(o<=(p[m]+(p[m+1]||p[m]))/2){break}}k*=n;return k}})})();