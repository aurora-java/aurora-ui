$A.SandBox = Ext.extend($A.Component, {
	initComponent : function(config) {
		$A.SandBox.superclass.initComponent.call(this, config);
		this.txt = $(this.id + "_view");
		this.txt.setValue(this.content);
	},
	send : function(){
		var content = this.screenTpl.replace('{content}',this.txt.value);
		//new $A.Window({'title':'生成的页面','url':this.context+'/sandbox?content='+encodeURIComponent(content),fullScreen:true});
		var form = document.createElement("form");
		form.method = "post";
		form.target = "_blank";
		form.action = this.context+'/sandbox';
		var s = document.createElement("input");
		s.id = "content";
		s.type = 'hidden';
		s.name = 'content';
		s.value = content;
		form.appendChild(s);
		document.body.appendChild(form);
		form.submit();
		Ext.fly(form).remove();
		//window.open(this.context+'/sandbox?content='+encodeURIComponent(content));
	},
	screenTpl : "<a:screen xmlns:a='http://www.aurora-framework.org/application'><a:view template='sandbox'>{content}</a:view></a:screen>"
})