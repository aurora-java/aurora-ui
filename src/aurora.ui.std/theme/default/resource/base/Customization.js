$A.Customization = Ext.extend(Ext.util.Observable,{
    constructor: function(config) {
        $A.Customization.superclass.constructor.call(this);
        this.id = config.id || Ext.id();
        $A.CmpManager.put(this.id,this)
        this.initConfig=config;
    },
    start : function(config){
        var sf = this;
        this.scanInterval = setInterval(function() {
            var cmps = $A.CmpManager.getAll();
            for(var key in cmps){
                var cmp = cmps[key];
                if(cmp.iscust == true){
                    cmp.on('mouseover',sf.onCmpOver,sf);
                }
            }
        }, 500);
    },
    mask : function(el){
        var w = el.getWidth();
        var h = el.getHeight();//leftp:0px;top:0px; 是否引起resize?
        var p = '<div title="点击设置个性化" style="border:2px solid #000;cursor:pointer;left:-1000px;top:-1000px;width:'+(w)+'px;height:'+(h)+'px;position: absolute;"><div style="width:100%;height:100%;filter: alpha(opacity=0);opacity: 0;mozopacity: 0;background-color:#ffffff;"> </div></div>';
        this.masker = Ext.get(Ext.DomHelper.insertFirst(Ext.getBody(),p));
        this.masker.setStyle('z-index', 10001);
        var xy = el.getXY();
        this.masker.setX(xy[0]-2);
        this.masker.setY(xy[1]-2);
        this.masker.on('click', this.onClick,this);
        this.cover.on('mouseover',this.onCmpOut,this);
    },
    onClick : function(){
        var path = window.location.pathname;
        var str = path.indexOf('modules');
        var screen_path = path.substring(str,path.length);
        var screen = screen_path.substring(screen_path.lastIndexOf('/')+1, screen_path.length);
        var parent = this.el.findParent('.win-wrap')
        if(parent) {
            var url = parent.getAttributeNS("","url");
            if(url){
                url = url.split('?')[0];
                var li = url.lastIndexOf('/');
                if(li != -1){
                    url = url.substring(li+1,url.length);
                }
                screen_path = screen_path.replaceAll(screen, url);
            }
        }
        var context_path = path.substring(0,str);
        new Aurora.Window({id:'sys_customization_window', url:context_path + 'modules/sys/sys_customization_window.screen?screen_path='+screen_path + '&id='+ this.cmp.id, title:'个性化设置',height:170,width:400});
        this.onCmpOut();
    },
    hideMask : function(){
        if(this.masker){
            Ext.fly(this.masker).remove();   
            this.masker = null;
        }
    },
    showCover : function(){
        var scrollWidth = Ext.isStrict ? document.documentElement.scrollWidth : document.body.scrollWidth;
        var scrollHeight = Ext.isStrict ? document.documentElement.scrollHeight : document.body.scrollHeight;
        var screenWidth = Math.max(scrollWidth,Aurora.getViewportWidth());
        var screenHeight = Math.max(scrollHeight,Aurora.getViewportHeight());
        var st = (Ext.isIE6 ? 'position:absolute;width:'+(screenWidth-1)+'px;height:'+(screenHeight-1)+'px;':'')
//        var p = '<DIV class="aurora-cover" style="'+st+'" unselectable="on"></DIV>';
        var p = '<DIV class="aurora-cover" style="'+st+'filter: alpha(opacity=0);background-color: #fff;opacity: 0;mozopacity: 0;" unselectable="on"></DIV>';
        this.cover = Ext.get(Ext.DomHelper.insertFirst(Ext.getBody(),p));
        this.cover.setStyle('z-index', 9999);
    },
    hideCover : function(){
        if(this.cover){
            this.cover.un('mouseover',this.onCmpOut,this);
            Ext.fly(this.cover).remove();
            this.cover = null;
        }
    },
    getEl : function(cmp){
        var el;
        if(Aurora.Grid && cmp instanceof Aurora.Grid) {
            el = cmp.wb;       
        }else{
            el = cmp.wrap;
        }
        
        return el;
    },
    onCmpOver : function(cmp, e){
        if(this.isInSpotlight) return;
        this.isInSpotlight = true;
        this.showCover();
        this.cmp = cmp;
        this.el = this.getEl(cmp);
        if(this.el){
//            this.backgroundcolor = this.el.getStyle('background-color');
//            this.currentPosition = this.el.getStyle('position');
            this.currentZIndex = this.el.getStyle('z-index');
//            this.el.setStyle('background-color','#fff')
//            this.el.setStyle('position','relative');
            this.el.setStyle('z-index', 10000);
        }
        this.mask(this.el)
    },
    onCmpOut : function(e){
        this.isInSpotlight = false;
        if(this.el){
//            this.el.setStyle('position',this.currentPosition||'')
            this.el.setStyle('z-index', this.currentZIndex);
//            this.el.setStyle('background-color', this.backgroundcolor||'');
            this.el = null;
        }
        this.hideMask();
        this.hideCover();
        this.cmp = null;
    },
    stop : function(){
        if(this.scanInterval) clearInterval(this.scanInterval)
        this.onCmpOut();
        var cmps = $A.CmpManager.getAll();
        for(var key in cmps){
            var cmp = cmps[key];
            if(cmp.iscust == true){
                cmp.un('mouseover',this.onCmpOver,this);
            }
        }
    }
});