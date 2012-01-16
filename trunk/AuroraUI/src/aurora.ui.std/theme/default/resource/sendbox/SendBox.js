$A.SendBox = Ext.extend($A.Component, {
	initComponent : function(config) {
		$A.SendBox.superclass.initComponent.call(this, config);
		this.txt = $(this.id + "_view");
	},
	send : function(){
		var content = this.screenTpl.replace('{content}',this.txt.value);
		new $A.Window({'title':'生成的页面','url':this.context+'/sendbox?content='+encodeURIComponent(content),fullScreen:true});
		//window.open(this.context+'/sendbox?content='+content)
	},
	screenTpl : "<a:screen xmlns:a='http://www.aurora-framework.org/application'><a:view template='sendbox'>{content}</a:view></a:screen>"
})