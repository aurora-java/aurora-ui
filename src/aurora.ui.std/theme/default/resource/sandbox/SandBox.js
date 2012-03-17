$A.SandBox = Ext.extend($A.Component, {
	initComponent : function(config) {
		$A.SandBox.superclass.initComponent.call(this, config);	
		this.txt = Ext.get(this.id + '_wrapcontent').dom;	
	},
	initScroll : function(){
		var txt = Ext.get(this.id + '_wrapcontent').dom;
		var content = Ext.get(this.id + '_tagcontent');
		if(content)
			txt.scrollTop = content.dom.offsetTop - txt.offsetTop;
	},
	send : function(){		
		var content = this.screenTpl.replace('{content}',this.txt.innerText);
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
	},
	screenTpl : "<a:screen xmlns:a='http://www.aurora-framework.org/application'><a:view template='sandbox'>{content}</a:view></a:screen>"
})
