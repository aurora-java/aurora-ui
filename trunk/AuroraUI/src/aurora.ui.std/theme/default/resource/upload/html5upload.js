$A.uploadcmps = [];

$A.HTML5Uploader = Ext.extend($A.Component,{
    types:[],
    map:{},
    sequence:1,
    initComponent : function(config){
        $A.HTML5Uploader.superclass.initComponent.call(this, config);
        this.le = this.wrap.child('#'+this.id+'_list');
        this.text = this.wrap.child('#'+this.id+'_text');
        this.cv = this.wrap.child('#'+this.id+"_cv");
        this.cv.update(_lang['upload.error.drag_upload']);
        this.btn = this.wrap.child('#'+this.id+"_btn");
        this.btn.setWidth(this.text.getWidth());
        $A.uploadcmps.add(this);
        var tps = this.filetype.trim().split(';');
        for (var k = 0; k < tps.length; k++) {  
            var vt = tps[k];
            this.types.add(vt.split('.')[1])
        }
    },
    processListener: function(ou){
        $A.HTML5Uploader.superclass.processListener.call(this,ou);
        Ext.get(document.documentElement)[ou]("dragenter", this.onDocDragEnter,this);
        Ext.get(document.documentElement)[ou]("dragleave", this.onDocDragLeave,this);
        Ext.get(document.documentElement)[ou]("drop", this.onDocDrop,this);
        this.btn[ou]("change", this.onFileSelect,this);
        this.le[ou]("dragenter", this.onListDragEnter,this);
        this.le[ou]("drop", this.onListDrop,this);
        this.le[ou]("dragover", this.onListDragOver,this);
        this.le[ou]("dragleave", this.onListDragLeave,this);
    },
    initEvents: function(){
        $A.HTML5Uploader.superclass.initEvents.call(this);
        this.addEvents( 
            /**
             * @event upload
             * 上传完毕.
             */
            'upload',
            /**
             * @event delete
             * 删除完毕.
             */
            'delete'
        );
    },
    checkFile : function(files) {
        var checkType = true,checkSize = true,checkTotal = true,checkTotalCount = true,totalUploadSize = 0, fl = 0;
        for (var i = 0; i < files.length; i++) {  
            var name = files[i].name,size = files[i].size,fts = this.filetype.split(';'), fss = this.filesize.split(';');
            totalUploadSize += size;
            var sp = name.trim().split('.');
            var ft = sp[sp.length-1].toLowerCase();
            if(this.filetype.trim() != '*.*' && this.types.indexOf(ft)==-1){
                checkType = false;
                break;
            }
            if(this.filesize!='0'){
                var index = this.filetype.trim() == '*.*' ? 0 : fts.indexOf("*."+ft);
                if(index!=-1) fl = fss[index]||fss[0];
                if(size > Number(fl)*1024){
                    checkSize = false;
                    break;
                }
            }
        }
        var ds = $(this.id+'_ds');
        if(this.totalfilesize!=0){
            var all = ds.getAll(),uploadedSize = 0;
            for(var i=0;i<all.length;i++){
                uploadedSize =uploadedSize+ all[i].get('file_size');
            }
            checkTotal = (totalUploadSize+uploadedSize) <=  1024*this.totalfilesize
        }
        if(this.totalcount!=0){
            checkTotalCount = ds.getAll().length < this.totalcount;
        }
        
        
        if(!checkType) {
            $A.showInfoMessage(_lang['upload.error'], _lang['upload.error.invalid_file_type']+' <br/>('+ this.filetype + ')',null,350,100);
        }else if(!checkSize) {
            $A.showInfoMessage(_lang['upload.error'], _lang['upload.error.size_exceed']+'('+formatFileSize(fl*1024)+ ')',null,350,100);
        }else if(!checkTotal) {
            $A.showErrorMessage(_lang['upload.error'], _lang['upload.limit_exceeded']+'('+formatFileSize(1024 *this.totalfilesize)+')',null,350,100);
        }else if(!checkTotalCount) {
            $A.showErrorMessage(_lang['upload.error'], _lang['upload.error.number_exceed']+'(' + this.totalcount+')',null,350,100);
        }
        return checkType&&checkSize&&checkTotal&&checkTotalCount;
    },
    uploadFiles : function(files){
        if(!this.showupload) {
            $A.showInfoMessage(_lang['upload.error'], _lang['upload.disabled']);
            this.clearDragTip();
            return;
        }
        if(!this.checkFile(files)) {
            this.clearDragTip();
            return;
        }
        this.clearDragTip();
        var jsid = Aurora.getCookie('JSID');
        if(jsid)this.uploadurl = this.uploadurl + ((this.uploadurl.indexOf('?') == -1) ? '?' : '&') + 'JSID='+jsid;
        for (var i = 0; i < files.length; i++) {  
            var file = files[i]; 
            var fid = 'f_'+Ext.id();
            
            Ext.each($(this.id+'_ds').data,function(item){
                var s = item.get('sequence');
                if(s>this.sequence) this.sequence = s;
            },this);
            var _s = ++this.sequence;
            var record = new Aurora.Record({
                file_id : fid,
                file_name : file.name,
                file_size : file.size,
                table_name: this.sourcetype,
                table_pk_value : this.pkvalue,
                percent: 0,
                sequence:_s
            });
            $(this.id+'_ds').add(record,0);
            var xhr = new XMLHttpRequest();
            this.map[fid] = xhr;
            xhr.timeout = -1;
            xhr.open('post', this.uploadurl,true);
            xhr.upload.addEventListener("progress", this.uploadProgress.createDelegate(this,[fid],true), this);
            xhr.addEventListener("load", this.uploadComplete.createDelegate(this,[fid],true), false);
            xhr.addEventListener("error", this.uploadFailed.createDelegate(this,[fid],true), false);
            xhr.addEventListener("abort", this.uploadCanceled.createDelegate(this,[fid],true), false);
            var fd = new FormData(); 
            fd.append('sequence',_s);
            fd.append('fileToUpload', file); 
            fd.append("pkvalue", this.pkvalue); 
            fd.append("source_type", this.sourcetype); 
            xhr.send(fd);                         
        }  
    },
    uploadProgress: function(evt,fid) {
        if (evt.lengthComputable) {
            try {
                var percent = Math.ceil((evt.loaded / evt.total) * 100);
                var record = $(this.id+'_ds').find('file_id', fid);
                if (record) {
                    record.set('percent', percent);
                }
            } catch (ex) {
                //alert(ex)
            }
        }
    },
    uploadComplete: function(evt, fid) {
        if(evt.target.status == '200') {
        var serverData = evt.target.responseText;
        var res = Ext.decode(serverData);
            var record = $(this.id+'_ds').find('file_id', fid);
            if(!isNaN(res)){
                if (record) {
                    if(serverData != '') record.set('attachment_id',serverData);
                    record.set('status', 1);
                    record.set('creation_time',new Date())
                    record.commit();
                }
                this.fireEvent("upload", this, this.pkvalue,this.sourcetype, serverData);
            } else if(!res.success) {
                $A.showErrorMessage(_lang['upload.error'], res.error.message||res.error.stackTrace,null,400,200);
                $(this.id+'_ds').remove(record);
            }else {
                $A.showErrorMessage(_lang['upload.error'], _lang['upload.error.unknown']);
                $(this.id+'_ds').remove(record);
            }
        }else {
            $A.showErrorMessage(_lang['upload.error'], evt.target.response||evt.target.responseText,null,500,300);
            $(this.id+'_ds').remove(record);
        }
    },
    uploadFailed: function(evt) {
        alert("There was an error attempting to upload the file.");
        this.clearDragTip();
    },
    uploadCanceled: function(evt) {
        //alert("The upload has been canceled by the user or the browser dropped the connection.");
        this.clearDragTip();
    },
    showDragTip: function(){
        this.cv.show();
        this.cv.setWidth(this.le.getWidth()-4);
        this.cv.setHeight(this.le.getHeight()-4);
        this.cv.setStyle('line-height',(this.le.getHeight()-4)+"px");
    },
    clearTip : function(){
        this.le.setStyle('border-color',"silver");
        this.cv.hide();
    },
    clearDragTip: function(){
        this.clearTip();
        this.clearOtherUpload();
    },
    clearOtherUpload: function(e){
        var sf = this;
        Ext.each($A.uploadcmps, function(uploader){
            if(uploader != sf) uploader.clearTip();
        })
    },
    onFileSelect: function(e){
        this.uploadFiles(this.btn.dom.files);
    },
    onDocDragEnter: function(e){
        this.showDragTip();
        e.stopEvent();
    },  
    onDocDragLeave: function(e) {
        var x = e.xy[0];
        var y = e.xy[1];
        if(x<=0||y<=0)
        this.clearDragTip();
    },
    onDocDrop: function(e){
        e.stopEvent(); 
        this.clearDragTip();
    },
    onListDragEnter: function(e){
        e.stopEvent();
        this.le.setStyle('border-color',"#0033CC");
    },
    onListDragOver : function(e){
        e.stopEvent();
    },
    onListDragLeave : function(e){
        e.stopEvent();
        this.le.setStyle('border-color',"silver");
    },
    onListDrop: function(e){
        e.stopEvent(); 
        this.isOver = false;
        this.uploadFiles(e.browserEvent.dataTransfer.files); 
    },
    destroy : function(){
        $A.HTML5Uploader.superclass.destroy.call(this);
        for(var key in this.map){
            var xhr = this.map[key]
            if(xhr){
                try{
                    xhr.abort();
                }catch(e){}
            }
        }
        $A.uploadcmps.remove(this);
    }
    
})