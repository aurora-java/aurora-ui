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
});
$A.NavBar = Ext.extend($A.ToolBar,{
    initComponent : function(config){
    	$A.NavBar.superclass.initComponent.call(this, config);
    	var sf = this,
    		type = sf.type,
    		wrap = sf.wrap;
    	sf.dataSet = $(sf.dataSet);
    	sf.navInfo = wrap.child('div[atype=displayInfo]');//Ext.get(sf.infoId);
    	if(sf.type != "simple" && sf.type != "tiny" &&  sf.type != "nocount"){
	    	sf.pageInput = $(sf.inputId);
	    	sf.currentPage = wrap.child('div[atype=currentPage]');
	    	sf.pageInfo = wrap.child('div[atype=pageInfo]');//Ext.get(sf.pageId);
	
	    	if(sf.comboBoxId){
	    		sf.pageSizeInput = $(sf.comboBoxId);
	    		sf.pageSizeInfo = wrap.child('div[atype=pageSizeInfo]');
	    		sf.pageSizeInfo2 = wrap.child('div[atype=pageSizeInfo2]');
	    		sf.pageSizeInfo.update(_lang['toolbar.pageSize']);
	    		sf.pageSizeInfo2.update(_lang['toolbar.pageSize2']);
	    	}
	    	sf.pageInfo.update(_lang['toolbar.total'] + '&#160;&#160;' + _lang['toolbar.page']);
	    	sf.currentPage.update(_lang['toolbar.ctPage']);
    	}
    },
    processListener: function(ou){
    	var sf = this;
    	$A.NavBar.superclass.processListener.call(sf,ou);
    	sf.dataSet[ou]('load', sf.onLoad,sf);
    	if(sf.type != "simple" && sf.type != "tiny" &&  sf.type != "nocount"){
    		sf.pageInput[ou]('change', sf.onPageChange, sf);
    		if(sf.pageSizeInput){
    			sf.pageSizeInput[ou]('change', sf.onPageSizeChange, sf);
    		}
    	}
    },
    onLoad : function(){
    	var sf = this,ds = sf.dataSet,
    		pagesize = ds.pagesize,
    		input = sf.pageSizeInput;
    	sf.navInfo.update(sf.creatNavInfo());
    	if(sf.type != "simple" && sf.type != "tiny" &&  sf.type != "nocount"){
	    	sf.pageInput.setValue(ds.currentPage,true);
	    	sf.pageInfo.update(_lang['toolbar.total'] + ds.totalPage + _lang['toolbar.page']);
	    	if(input&&!input.optionDataSet){
	    		if(ds.fetchall){
	    			pagesize = ds.totalCount;
	    			input.initReadOnly(true);
	    		}
	    		var pageSize=[10,20,50,100];
	    		if(pageSize.indexOf(pagesize)==-1){
	    			pageSize.unshift(pagesize);
	    			pageSize.sort(function(a,b){return a-b});
	    		}
	    		var datas=[];
	    		while(Ext.isDefined(pageSize[0])){
	    			var ps=pageSize.shift();
	    			datas.push({'code':ps,'name':ps});
	    		}
	    		var dataset=new $A.DataSet({'datas':datas});
	    		input.valuefield = 'code';
	    		input.displayfield = 'name';
		    	input.setOptions(dataset);
		    	input.setValue(pagesize,true);
	    	}
    	}
    },
    creatNavInfo : function(){
    	var sf = this,
    		ds = sf.dataSet,
    		currentPage = ds.currentPage,
    		totalPage = ds.totalPage,
    		totalCount = ds.totalCount,
    		pagesize = ds.pagesize,
    		type = sf.type,
    		html=[];
    	if(ds.fetchall) pagesize = totalCount;
    	//Hybris
    	if(ds.dtoname && ds.autocount == false)type='nocount';
    	if(type == "simple"){
    		if(totalPage){
    			html.push('<span>共'+totalPage+'页</span>');
    			html.push(currentPage == 1 ? '<span>'+_lang['toolbar.firstPage']+'</span>' : sf.createAnchor(_lang['toolbar.firstPage'],1));
    			html.push(currentPage == 1 ? '<span>'+_lang['toolbar.prePage']+'</span>' : sf.createAnchor(_lang['toolbar.prePage'],currentPage-1));
    			for(var i = 1 ; i < 4 && i <= totalPage ; i++){
    				html.push(i == currentPage ? '<b>' + currentPage + '</b>' : sf.createAnchor(i,i));
    			}
    			if(totalPage > sf.maxPageCount){
    				if(currentPage > 5)sf.createSplit(html);
    				for(var i = currentPage - 1;i < currentPage + 2 ;i++){
    					if(i > 3 && i < totalPage - 2){
    						html.push(i == currentPage ? '<b>' + currentPage + '</b>' : this.createAnchor(i,i));
    					}
    				}
    				if(currentPage < totalPage - 4)this.createSplit(html);
    			}else if(totalPage > 6){
    				for(var i = 4; i < totalPage - 2 ;i++){
    					html.push(i == currentPage ? '<b>' + currentPage + '</b>' : this.createAnchor(i,i));
    				}
    			}
	    		for(var i = totalPage - 2 ; i < totalPage + 1; i++){
	    			if(i > 3){
    					html.push(i == currentPage ? '<b>' + currentPage + '</b>' : this.createAnchor(i,i));
	    			}
    			}
	    		html.push(currentPage == totalPage ? '<span>'+_lang['toolbar.nextPage']+'</span>' : this.createAnchor(_lang['toolbar.nextPage'],currentPage+1));
    			html.push(currentPage == totalPage ? '<span>'+_lang['toolbar.lastPage']+'</span>' : this.createAnchor(_lang['toolbar.lastPage'],totalPage));
    		}
    	}else if(type == 'tiny'){
    		html.push(currentPage == 1 ? '<span>'+_lang['toolbar.firstPage']+'</span>' : this.createAnchor(_lang['toolbar.firstPage'],1));
			html.push(currentPage == 1 ? '<span>'+_lang['toolbar.prePage']+'</span>' : this.createAnchor(_lang['toolbar.prePage'],currentPage-1));
    		html.push(currentPage == totalPage ? '<span>'+_lang['toolbar.nextPage']+'</span>' :sf.createAnchor(_lang['toolbar.nextPage'],currentPage+1));
    		html.push('<span>第'+currentPage+'页</span>');
    	}else if(type == 'nocount'){
    		//Hybris
    		html.push(currentPage == 1 ? '<span>'+_lang['toolbar.firstPage']+'</span>' : this.createAnchor(_lang['toolbar.firstPage'],1));
			html.push(currentPage == 1 ? '<span>'+_lang['toolbar.prePage']+'</span>' : this.createAnchor(_lang['toolbar.prePage'],currentPage-1));
    		html.push(sf.createAnchor(_lang['toolbar.nextPage'],currentPage+1));
    		html.push('<span>第'+currentPage+'页</span>');
    	}else{
	    	var from = ((currentPage-1)*pagesize+1),
	    		to = currentPage*pagesize,
	    		theme = $A.getTheme();
	    	if(to>totalCount && totalCount > from) to = totalCount;
	    	if(to==0) from =0;
	    	html.push(_lang['toolbar.visible'] , ' ' , from , ' - ' , to);
            if(theme != 'mac')
            	html.push(' ', _lang['toolbar.total'] , totalCount , _lang['toolbar.item']);
    	}
    	return html.join('');
    },
    createAnchor : function(text,page){
    	return '<a href="javascript:$(\''+this.dataSet.id+'\').goPage('+page+')">'+text+'</a>';
    },
    createSplit : function(html){
    	html.push('<span>···</span>');
    },
    onPageChange : function(el,value,oldvalue){
    	var ds = this.dataSet;
        if(isNaN(value) || value<=0 ||value>ds.totalPage){
            el.setValue(oldvalue,true);
        }else{
            ds.goPage(value);
        }
    },
    
//    onPageChange : function(el,value,oldvalue){
//    	if(this.dataSet.totalPage == 0){
//    		el.setValue(1);
//    	}else if(isNaN(value) || value<=0 || value>this.dataSet.totalPage){
//    		el.setValue(oldvalue)
//    	}else if(this.dataSet.currentPage!=value){
//	    	this.dataSet.goPage(value);
//    	}
//    },
    onPageSizeChange : function(el,value,oldvalue){
    	var max = this.dataSet.maxpagesize;
    	if(isNaN(value) || value<0){
    		el.setValue(oldvalue,true);
    	}else if(value > max){
			$A.showMessage(_lang['toolbar.errormsg'],_lang['toolbar.maxPageSize']+max+_lang['toolbar.item'],null,240);
			el.setValue(oldvalue,true);
		}else{
	    	this.dataSet.pagesize=Math.round(value);
	    	this.dataSet.query();
    	}
    }
});