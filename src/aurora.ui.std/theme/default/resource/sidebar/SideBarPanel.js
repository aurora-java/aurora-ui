$A.SideBarPanel = Ext.extend($A.Component,{
    constructor: function(config) { 
        this.collapsible = true;
        this.cmps = {};
        $A.SideBarPanel.superclass.constructor.call(this,config);
    },
    initComponent : function(config){
        $A.SideBarPanel.superclass.initComponent.call(this, config);
        this.collapseBtn = this.wrap.child('.arrow');
        this.body = this.wrap.child('.bar-body');
        this.wrap.cmps = this.cmps;
        this.initSize();
        this.center();
        if(this.url){
            this.load(this.url)
        }
    },
    processListener: function(ou){
        $A.SideBarPanel.superclass.processListener.call(this,ou);
        if(this.collapsible) {
           this.collapseBtn[ou]("click", this.onCollapseBtnClick,  this); 
        }
    },
    initSize : function(){
        if(this.fullHeight){
            var screenHeight = $A.getViewportHeight();
            this.height = screenHeight;
            this.wrap.setHeight(screenHeight);
        }
        this.collapseBtn.setStyle('top',(this.height-35)/2+'px');
    },
    center: function(){
        var screenHeight = $A.getViewportHeight();
        var st = document[Ext.isStrict?'documentElement':'body'].scrollTop;
        var y = st+Math.max((screenHeight - this.height-(Ext.isIE?26:23))/2,0);
        this.wrap.setStyle('top',y+'px');
    },
    onCollapseBtnClick : function(){
        var w = this.wrap.getWidth()-2;
        if(w==0){
            this.wrap.setWidth(this.width,{
                duration:.35,
                easing:'easeOut',
                callback:function(){
                    this.body.setStyle('display','block');
                },
                scope:this
            });
        }else{
            this.body.setStyle('display','none');
            this.wrap.setWidth(0,true)
            
        }
        
    },
    showLoading : function(){
        this.body.update(_lang['window.loading']);
        this.body.setStyle('text-align','center');
        this.body.setStyle('line-height',5);
    },
    clearLoading : function(){
        this.body.update('');
        this.body.setStyle('text-align','');
        this.body.setStyle('line-height','');
    },
    clearBody : function(){
        for(var key in this.cmps){
            var cmp = this.cmps[key];
            if(cmp.destroy){
                try{
                    cmp.destroy();
                }catch(e){
                    alert('销毁sidebar出错: ' + e)
                }
            }
        }
    },
    load : function(url){
        this.clearBody();
        this.showLoading();       
        Ext.Ajax.request({
            url: url,
            success: this.onLoad.createDelegate(this)
        });     
    },
    onLoad : function(response, options){
        if(!this.body) return;
        this.clearLoading();
        var html = response.responseText;
        var res
        try {
            res = Ext.decode(response.responseText);
        }catch(e){}
        if(res && res.success == false){
            if(res.error){
                if(res.error.code  && res.error.code == 'session_expired' || res.error.code == 'login_required'){
                    if($A.manager.fireEvent('timeout', $A.manager))
                    $A.showErrorMessage(_lang['ajax.error'],  _lang['session.expired']);
                }else{
                    $A.manager.fireEvent('ajaxfailed', $A.manager, options.url,options.para,res);
                    var st = res.error.stackTrace;
                    st = (st) ? st.replaceAll('\r\n','</br>') : '';
                    if(res.error.message) {
                        var h = (st=='') ? 150 : 250;
                        $A.showErrorMessage(_lang['window.error'], res.error.message+'</br>'+st,null,400,h);
                    }else{
                        $A.showErrorMessage(_lang['window.error'], st,null,400,250);
                    } 
                }
            }
            return;
        }
        var sf = this;
        this.body.update(html,true,function(){
            var w = sf.wrap.getWidth()-2;
            if(w==0) sf.body.setStyle('display','none');
//          var cmps = $A.CmpManager.getAll();
//          for(var key in cmps){
//              if(sf.oldcmps[key]==null){                  
//                  sf.cmps[key] = cmps[key];
//              }
//          }
            sf.fireEvent('load',sf)
        },this.wrap);
    }
})