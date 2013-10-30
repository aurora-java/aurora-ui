$A.uploadcmps = [];

$A.HTML5Uploader = Ext.extend($A.Component,{
    types:[],
    map:{},
    initComponent : function(config){
        $A.HTML5Uploader.superclass.initComponent.call(this, config);
        this.le = this.wrap.child('#'+this.id+'_list');
        this.text = this.wrap.child('#'+this.id+'_text');
        this.cv = this.wrap.child('#'+this.id+"_cv");
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
    checkFileType : function(files) {
        var checkType = true,checkSize = true,checkTotal = true,checkTotalCount = true,totalUploadSize = 0;
        for (var i = 0; i < files.length; i++) {  
            var name = files[i].name;
            var size = files[i].size;
            totalUploadSize += size;
            var sp = name.trim().split('.');
            var ft = sp[sp.length-1];
            if(this.filetype.trim() != '*.*' && this.types.indexOf(ft)==-1){
                checkType = false;
                break;
            }
            if(this.filesize !=0 && (size/1024) > this.filesize) {
                checkSize = false;
                break;
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
            $A.showInfoMessage('格式不正确', '不能上传此文件类型! <br/>(仅限于 '+ this.filetype + ')',null,350,100);
        }else if(!checkSize) {
            $A.showInfoMessage('大小不正确', '文件大小超出限制! (单个文件不能超过' + formatFileSize(this.filesize*1024)+ ')',null,350,100);
        }else if(!checkTotal) {
            $A.showErrorMessage('错误', '超出总上传文件大小限制! (总大小不能超过 ' + formatFileSize(1024 *this.totalfilesize)+')',null,350,100);
        }else if(!checkTotalCount) {
            $A.showErrorMessage('错误', '上传文件数量超出限制! (总数量不能超过 ' + this.totalcount+'个)',null,350,100);
        }
        return checkType&&checkSize&&checkTotal&&checkTotalCount;
    },
    uploadFiles : function(files){
        if(!this.showupload) {
            $A.showInfoMessage('警告', '上传功能被禁用!');
            this.clearDragTip();
            return;
        }
        if(!this.checkFileType(files)) {
            this.clearDragTip();
            return;
        }
        this.clearDragTip();
        var jsid = Aurora.getCookie('JSID');
        if(jsid)this.uploadurl = this.uploadurl + ((this.uploadurl.indexOf('?') == -1) ? '?' : '&') + 'JSID='+jsid;
        for (var i = 0; i < files.length; i++) {  
            var file = files[i]; 
            var fid = 'f_'+Ext.id();
            var record = new Aurora.Record({
                file_id : fid,
                file_name : file.name,
                file_size : file.size,
                table_name: this.sourcetype,
                table_pk_value : this.pkvalue,
                percent: 0
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
                alert(ex)
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
                $A.showErrorMessage('错误', res.error.message||res.error.stackTrace,null,400,200);
                $(this.id+'_ds').remove(record);
            }else {
                $A.showErrorMessage('错误', '未知错误!');
                $(this.id+'_ds').remove(record);
            }
        }else {
            $A.showErrorMessage('错误', evt.target.response||evt.target.responseText,null,500,300);
            $(this.id+'_ds').remove(record);
        }
    },
    uploadFailed: function(evt) {
        alert("There was an error attempting to upload the file.");
        this.clearDragTip();
    },
    uploadCanceled: function(evt) {
        alert("The upload has been canceled by the user or the browser dropped the connection.");
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
        $A.uploadcmps.remove(this);
    }
    
})