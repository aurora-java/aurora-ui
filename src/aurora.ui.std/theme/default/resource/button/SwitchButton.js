$A.SwitchButton = Ext.extend($A.Component,{
    curCls:'cur',
    initComponent : function(config){
        $A.SwitchButton.superclass.initComponent.call(this, config);
    },
    processListener: function(ou){
        $A.SwitchButton.superclass.processListener.call(this,ou);
        this.wrap[ou]('click',this.onClick, this);
    },
    initEvents:function(){
        $A.SwitchButton.superclass.initEvents.call(this);   
        this.addEvents(
        /**
         * @event select
         * 选择事件.
         * @param {Aurora.Tab} tab Tab对象.
         * @param {String} newValue value1.
         * @param {String} oldValue value2.
         */
        'select'
        );
    },
    onClick : function(e){
        var li = Ext.fly(e.target).findParent('li');
        if(li)
        this.selectButton(Ext.fly(li).getAttributeNS("","code"));
    },
    selectButton:function(value){
        if(this.activeValue == value) return;
        var oli = this.wrap.child('li[code='+this.activeValue+']'),li = this.wrap.child('li[code='+value+']'),ov;
        if(li) {
            if(oli) {
                oli.removeClass(this.curCls);
                ov = Ext.fly(oli).getAttributeNS("","code");
            }
            li.addClass(this.curCls);
            this.activeValue = value;
            this.fireEvent('select', this, value,ov)
        }
    }
})