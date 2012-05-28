(function(){var d=Math.sin,f=Math.cos,a=Math.min,i=Math.sqrt,c=Math.PI,b=function(m,k){var j=new Ext.Template('<span style="font-size:{fontSize}">{text}</span>').append(document.body,{fontSize:k,text:m},true),l=j.getWidth();j.remove();return l},e=function(j){switch(j){case"left":case"top":return -1;case"right":case"bottom":return 1;default:return 0}},h=function(k,j){switch(j){case -1:return 0;case 0:return k/2;case 1:return k}},g=function(){function l(m){var n=function(){};n.prototype=m;return new n()}function k(n,m,o){if(Ext.isObject(o)){if(Ext.isObject(n[m])){j(n[m],o)}else{n[m]=l(o)}}else{if(Ext.isArray(o)){n[m]=[].concat(o)}else{n[m]=o}}return n}function j(s,o,n){if(Ext.isString(o)){return k(s,o,n)}for(var r=1,m=arguments.length;r<m;r++){var p=arguments[r];for(var q in p){k(s,q,p[q])}}return s}return function(){var n=[{}],o=arguments.length,m;while(o--){if(!Ext.isBoolean(arguments[o])){n[o+1]=arguments[o]}}m=j.apply(null,n);return m}}();$A.Dashboard=Ext.extend($A.Graphics,{options:{align:"center",verticalalign:"middle",padding:10,max:1,min:0,board:{fillcolor:"gradient(linear,-50% 0,50% 0,color-stop(0,rgba(0,255,255,1)),color-stop(50%,rgba(255,255,0,1)),color-stop(100%,rgba(255,0,0,1)))",fillopacity:0.5,bordercolor:"#000",borderwidth:1,startangle:0,endangle:180,labeld:{enabled:false,x:0,y:0}},pointer:{fillcolor:"rgba(135,135,135,0.8)",fillopacity:1,bordercolor:"#000",borderwidth:1,width:8,dist:10},title:{text:"Dashboard title",align:"center",verticalalign:"top",margin:15,x:0,y:0,style:{color:"#3E576F",fontSize:"16px"}}},constructor:function(j){$A.Dashboard.superclass.constructor.call(this,j);this.setOptions(j)},processDataListener:function(j){var k=this.binder&&this.binder.ds;if(k){k[j]("update",this.renderPointer,this)}},bind:function(k,j){if(typeof(k)=="string"){k=$(k)}if(!k){return}this.binder={ds:k,name:j};this.record=k.getCurrentRecord();this.processDataListener("on");this.onLoad()},setOptions:function(j){this.options=g(this.options,j)},onLoad:function(){this.redraw()},redraw:function(){if(!this.record){return}this.clear();this.group=this.createGElement("group");this.renderBoard();this.renderPointer();this.renderCenter();this.renderTitle()},setTitle:function(j){g(this.options.title,j);this.redraw()},clear:function(){var j=this.top.cmps;while(j.length){j.pop().destroy()}},renderTitle:function(){var w=this.options.title,t=w.text;if(!t){return}var o=e(w.align),n=e(w.verticalalign),k=this.width,u=this.height,m=w.margin,s=w.x,r=w.y,j=w.style,v=j.fontSize,l=j.color,p=b(t,v),q=parseInt(v);this.createGElement("text",{root:this.group.wrap,text:t,color:l,size:q,dx:s+m+h(k-m*2-p,o),dy:r+m+h(u-m*2-q,n)})},renderBoard:function(){var m=this.options,M=m.title,J=M.verticalalign,v=m.board,D=m.padding,G=m.marginLeft||0,p=m.marginRight||0,k=m.marginTop||(M.text&&J=="top"?M.y+M.margin*2:0),s=m.marginBottom||(M.text&&J=="bottom"?M.y+M.margin*2:0),F=(m.width||300)-D*2-G-p,E=(m.height||300)-D*2-k-s,H=e(m.align||"center"),C=e(m.verticalalign||"middle"),j={},n,B,A,z,w,u=(v.startangle%360+360)%360,t=(v.endangle%360+360)%360,o=u*c/180,l=t*c/180,r=d(o),q=d(l),L=f(o),K=f(l),I=function(R,y,O,N){n=a(R,y);var x={xR:O*n,yR:N*n},S,P,T,Q;if(y<=R){Q=F*(1-n/R);S="x";P="y";T=H}else{Q=E*(1-n/y);S="y";P="x",T=C}x[S]=D+x[S+"R"]+h(Q,T);x[P]=D+x[P+"R"];B=x.x+G;A=x.y+k};if(r>=0){if(L>=0){if(q>=0){if(K>L){I(F/2,E/2,1,1)}else{if(K>=0){I(F/L,E/q,0,q)}else{I(F/(L-K),E,-K,1)}}}else{if(K>L){I(F/(1+K),E/2,1,1)}else{if(K>=0){I(F/(1+L),E/2,1,1)}else{I(F/(1+L),E/(1-q),1,1)}}}}else{if(K<=0){if(q>r){I(F/2,E/2,1,1)}else{if(q>=0){I(F/-K,E/r,-K,r)}else{I(F,E/(r-q),1,r)}}}else{if(q>r){I(F/2,E/(1+q),1,q)}else{if(q>=0){I(F/2,E/(1+r),1,r)}else{I(F,E/(r-q),1,r)}}}}}else{if(L<=0){if(q<=0){if(K<L){I(F/2,E/2,1,1)}else{if(K<=0){I(F/-L,E/-q,-L,0)}else{I(F/(K-L),E,-L,0)}}}else{if(K<L){I(F/(1-K),E/2,1,1)}else{if(K<=0){I(F/(1+L),E/2,1,1)}else{I(F/(1-L),E/(1+q),1,q)}}}}else{if(K>=0){if(q<r){I(F/2,E/2,1,1)}else{if(q<=0){I(F/K,E/-r,0,0)}else{I(F,E/(q-r),0,q)}}}else{if(q<r){I(F/2,E/(1-q),1,1)}else{if(q<=0){I(F/2,E/(1-r),1,1)}else{I(F/(1-K),E/(1-r),-K,1)}}}}}this.createGElement("arc",{root:this.group.wrap,x:B,y:A,r:n,innerR:n-(v.dashwidth||a(E,F)/4),start:o,end:l,cursor:"default",fillcolor:v.fillcolor,fillopacity:v.fillopacity,strokecolor:v.bordercolor,strokewidth:v.borderwidth});Ext.apply(m.pointer,{center:[B,A],start:o,end:l,radius:n-m.pointer.dist})},renderPointer:function(){if(this.pointerEl){var x=this.top.cmps;x.splice(x.indexOf(this.pointerEl),1);this.pointerEl.destroy()}var r=this.record.get(this.binder.name),k=/\%/.test(r),m=this.options.pointer,y=this.options.max,w=this.options.min;if(k){r=parseInt(r)/100;y=1;w=0}else{r=y-r}var u=m.width,o=m.radius,B=m.center,p=m.start,n=m.end,z=(n-p)/(y-w)*r+p,s=z+135/180*c,q=z-135/180*c,j=d(z),l=f(z),t=u*o*i(2)/(2*o-u),A=["M",B[0],B[1],"L",B[0]+t*f(s),B[1]-t*d(s),B[0]+o*l,B[1]-o*j,B[0]+t*f(q),B[1]-t*d(q),"Z"];this.pointerEl=this.createGElement("path",{root:this.group.wrap,d:A.join(" "),strokecolor:m.bordercolor,strokewidth:m.borderwidth,fillcolor:m.fillcolor,fillopacity:m.fillopacity})},renderCenter:function(){var k=this.options.pointer,j=k.center,l=k.width;this.createGElement("arc",{root:this.group.wrap,x:j[0],y:j[1],r:l,innerR:l-2,start:k.start,end:k.end,cursor:"default",strokecolor:k.bordercolor,strokewidth:k.borderwidth})}})})();