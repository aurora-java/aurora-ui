/**
 * @class Aurora.MultiLov
 * @extends Aurora.Lov
 * <p>MultiLov 值列表组件.
 * @author huazhen.wu@hand-china.com
 * @constructor
 * @param {Object} config 配置对象. 
 */
$A.MultiLov = Ext.extend($A.Lov,{
    constructor: function(config) {
    	this.quote="'";
    	this.localvalues=[];
        $A.MultiLov.superclass.constructor.call(this, config);        
    },
    processListener : function(ou){
        $A.MultiLov.superclass.processListener.call(this,ou);
        this.el[ou]('click',this.onClick, this)
    },
    initEvents : function(){
        $A.MultiLov.superclass.initEvents.call(this);
        /**
         * @event commit
         * commit事件.
         * @param {Aurora.Lov} lov 当前Lov组件.
         * @param {Aurora.Record} r 当前lov绑定的Record
         * @param {Aurora.Record} rs 选中的Record集合. 
         */
    },
    onChange : function(e){},
    onClick : function(e){
        var pos = this.getCursortPosition();
        var value = this.getRawValue();
        var strs = value.split(';')
        var start = 0;
        for(var i=0;i<strs.length;i++){
            var end = start + strs[i].length + 1;
            if(pos>start&&pos<end){
                if(this.start!=start||this.end!=end){
                	this.select(start,end);
                	if(Ext.isGecko||Ext.isOpera){
                		this.start=start;
                		this.end=end;
                	}
                }else this.start=this.end=0;
				break;
            }else{
                start +=strs[i].length + 1;
            }
        }
    },
    commit:function(ds,lr){
        if(this.win) this.win.close();
        var record = lr ? lr : this.record,
        	records=ds.getAll(),from="";
        if(record){
    		this.optionDataSet=ds;
	    	for(var j=0;j<records.length;j++){
	        	if(records[j].get(this.valuefield)){
	        		var v=records[j].get(this.valuefield);
	        		from+=this.quote+v+this.quote;
	        		if(j!=records.length-1)from+=","
	        	}
	        }
        	record.set(this.binder.name,from);
        }
        this.fireEvent('commit', this, record, records)
    },
    getCursortPosition : function() {
        var p = 0;
        if (document.selection) {
        	this.el.focus();
            var r = document.selection.createRange();
            r.moveStart('character', -this.el.dom.value.length);
            p = r.text.length;
        }else if (this.el.dom.selectionStart||this.el.dom.selectionStart=='0')
            p = this.el.dom.selectionStart;
        return p;
    },
    processValue : function(v){
    	this.localvalues=[];
    	if(!v)return '';
    	var values=v.split(';'),rv="",records=[];
    	for(var i=0;i<values.length;i++){
    		var vs=values[i].trim();
    		if(vs||vs=='0'){
    			var record=this.getRecordByDisplay(vs);
    			if(record){
    				vs=record.get(this.valuefield);
    				records.add(record);
    			}else{
    				this.localvalues.add(vs);
    			}
	    		rv+=this.quote+vs+this.quote+",";
    		}
    	}
    	if(this.optionDataSet){
	    	this.optionDataSet.removeAll();
    	}
    	for(var i=0;i<records.length;i++){
    		this.optionDataSet.add(records[i]);
    	}
    	return rv.match(/,$/)?rv.slice(0,rv.length-1):rv;
    },
    getRecordByDisplay: function(name){
    	if(!this.optionDataSet)return null;
    	var datas = this.optionDataSet.getAll();
		for(var i=0;i<datas.length;i++){
			var d = datas[i].get(this.displayfield);
			if(d == name){
				return datas[i];
			}
		}
		return null;
    },
    formatValue : function(v){
    	var rv="";
    	if(this.optionDataSet){
    		var datas=this.optionDataSet.getAll();
			for(var i=0;i<datas.length;i++){
				rv+=datas[i].get(this.displayfield)+";";
			}
    	}
		for(var i=0;i<this.localvalues.length;i++){
			rv+=this.localvalues[i]+";";
		}
    	return rv;
    },
    showLovWindow : function(){  
    	var sf = this;
        if(sf.fetching||sf.isWinOpen||sf.readonly) return;
        
        var v = sf.getRawValue(),
        	lovurl = sf.lovurl,
    		svc = sf.service,ctx = sf.context,
    		w = sf.lovwidth||400,
			url;
        sf.blur();
        var url;
        if(!Ext.isEmpty(lovurl)){
            url = Ext.urlAppend(lovurl,Ext.urlEncode(sf.getFieldPara()));
        }else if(!Ext.isEmpty(svc)){
//              url = sf.context + 'sys_lov.screen?url='+encodeURIComponent(sf.context + 'sys_lov.svc?svc='+sf.lovservice + '&'+ Ext.urlEncode(sf.getLovPara()))+'&service='+sf.lovservice+'&';
            url = ctx + 'sys_multiLov.screen?url='+encodeURIComponent(Ext.urlAppend(ctx + 'autocrud/'+svc+'/query',Ext.urlEncode(sf.getLovPara())))+'&service='+svc;
    	}
        if(url) {
	        sf.isWinOpen = true;
            sf.win = new $A.Window({title:sf.title||'Lov', url:Ext.urlAppend(url,"lovid="+sf.id+"&key="+encodeURIComponent(v)+"&gridheight="+(sf.lovgridheight||350)+"&innerwidth="+((sf.lovwidth||400)-30)+"&innergridwidth="+Math.round(((sf.lovwidth||400)-90)/2)+"&lovautoquery="+(Ext.isEmpty(sf.lovautoquery) ? 'true' : sf.lovautoquery)+"&lovlabelwidth="+(sf.lovlabelwidth||75)+"&lovpagesize="+(sf.lovpagesize||'')), height:sf.lovheight||400,width:w});
            sf.win.on('close',sf.onWinClose,sf);
        }
    },
    destroy : function(){
        $A.Lov.superclass.destroy.call(this);
    }
});