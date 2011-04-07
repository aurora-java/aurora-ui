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
    	this.currentPage = this.wrap.child('div[atype=currentPage]');
    	this.pageInfo = this.wrap.child('div[atype=pageInfo]');//Ext.get(this.pageId);
    	this.navInfo = this.wrap.child('div[atype=displayInfo]');//Ext.get(this.infoId);

    	if(this.comboBoxId){
    		this.pageSizeInput = $(this.comboBoxId);
    		this.pageSizeInfo = this.wrap.child('div[atype=pageSizeInfo]');
    		this.pageSizeInfo2 = this.wrap.child('div[atype=pageSizeInfo2]');
    		this.pageSizeInfo.update(_lang['toolbar.pageSize']);
    		this.pageSizeInfo2.update(_lang['toolbar.pageSize2']);
    	}
    	this.pageInfo.update(_lang['toolbar.total'] + '&#160;&#160;' + _lang['toolbar.page']);
    	this.currentPage.update(_lang['toolbar.ctPage']);
    },
    processListener: function(ou){
    	$A.NavBar.superclass.processListener.call(this,ou);
    	this.dataSet[ou]('load', this.onLoad,this);
    	this.pageInput[ou]('keydown', this.onInputKeyPress, this);
    	if(this.pageSizeInput){
    		this.pageSizeInput[ou]('select', this.onInputSelect, this);
    	}
    },
    initEvents : function(){
    	$A.NavBar.superclass.initEvents.call(this);    	
    },
    onLoad : function(){
    	this.pageInput.setValue(this.dataSet.currentPage);
    	this.pageInfo.update(_lang['toolbar.total'] + this.dataSet.totalPage + _lang['toolbar.page']);
    	this.navInfo.update(this.creatNavInfo());
    	if(this.pageSizeInput&&!this.pageSizeInput.optionDataSet){
    		var pageSize=[10,20,50,100];
    		if(pageSize.indexOf(this.dataSet.pagesize)==-1){
    			pageSize.unshift(this.dataSet.pagesize);
    			pageSize.sort(function(a,b){return a-b});
    		}
    		var datas=[];
    		while(Ext.isDefined(pageSize[0])){
    			var ps=pageSize.shift();
    			datas.push({'code':ps,'name':ps});
    		}
    		var dataset=new $A.DataSet({'datas':datas});
	    	this.pageSizeInput.setOptions(dataset);
	    	this.pageSizeInput.setValue(this.dataSet.pagesize);

    	}
    },
    creatNavInfo : function(){
    	var from = ((this.dataSet.currentPage-1)*this.dataSet.pagesize+1);
    	var to = this.dataSet.currentPage*this.dataSet.pagesize;
    	if(to>this.dataSet.totalCount) to = this.dataSet.totalCount;
    	if(to==0) from =0;
    	return _lang['toolbar.visible'] + from + ' - ' + to + ' '+ _lang['toolbar.total'] + this.dataSet.totalCount + _lang['toolbar.item'];
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
    },
    onInputSelect : function(combo,value){
    	this.dataSet.pagesize=value;
    	this.dataSet.query();
    }
})