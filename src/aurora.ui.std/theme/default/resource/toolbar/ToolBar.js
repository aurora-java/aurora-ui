$A.ToolBar = Ext.extend($A.Component,{
	constructor: function(config) {
        $A.ToolBar.superclass.constructor.call(this, config);        
    },
    initComponent : function(config){
    	$A.ToolBar.superclass.initComponent.call(this, config);    	
    },
    initEvents : function(){
    	$A.ToolBar.superclass.initEvents.call(this); 
    }
})
$A.NavBar = Ext.extend($A.ToolBar,{
	constructor: function(config) {
        $A.NavBar.superclass.constructor.call(this, config);        
    },
    initComponent : function(config){
    	$A.NavBar.superclass.initComponent.call(this, config);
    	this.dataSet = $(this.dataSet);
    	this.pageInput = $(this.inputId);
    	this.pageInfo = Ext.get(this.pageId);
    	this.navInfo = Ext.get(this.infoId);
    	this.pageInput.setValue(1)
    },
    processListener: function(ou){
    	$A.NavBar.superclass.processListener.call(this,ou);
    	this.dataSet[ou]('load', this.onLoad,this);
    	this.pageInput[ou]('keydown', this.onInputKeyPress, this);
    },
    initEvents : function(){
    	$A.NavBar.superclass.initEvents.call(this);    	
    },
    onLoad : function(){
    	this.pageInput.setValue(this.dataSet.currentPage);
    	this.pageInfo.update(_lang['toolbar.total'] + this.dataSet.totalPage + _lang['toolbar.page']);
    	this.navInfo.update(this.creatNavInfo());
    },
    creatNavInfo : function(){
    	var from = ((this.dataSet.currentPage-1)*this.dataSet.pagesize+1);
    	var to = this.dataSet.currentPage*this.dataSet.pagesize;
    	if(to>this.dataSet.totalCount) to = this.dataSet.totalCount;
    	if(to==0) from =0;
    	return _lang['toolbar.visible'] + from + ' - ' + to + ','+ _lang['toolbar.total'] + this.dataSet.totalCount + _lang['toolbar.item'];
    },
    onInputKeyPress : function(input, e){
    	if(e.keyCode == 13){
    		var page = parseInt(input.getRawValue());
    		if(isNaN(page)){
    			input.setValue(this.dataSet.currentPage);
    		}else{
    			if(page>0 && page<=this.dataSet.totalPage) {
    				this.dataSet.goPage(page);
    			}else{
    				input.setValue(this.dataSet.currentPage);
    			}
    		}
    	}    	
    }
})