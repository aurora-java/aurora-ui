function formatFileSize(size) {
	if (size < 1024) {
		return size + " bytes";
	} else if (size < 1048576) {
		return (Math.round(((size * 10) / 1024)) / 10) + " KB";
	} else {
		return (Math.round(((size * 10) / 1048576)) / 10) + " MB";
	}
}
function deleteFileRecord(did,id) {
    
	var ds = $(did);
	var record = ds.findById(id);
    Aurora.showConfirm(_lang['window.button.ok'],_lang['upload.delete.sure'],function(win){
        win.close();
        ds.remove(record);
        var upload = did.substring(0,did.indexOf('_ds'));
        $(upload).fireEvent("delete", this);
    })
}

function upFileRecord(did,id) {
    var ds = $(did),record = ds.findById(id),i = ds.data.indexOf(record);    
    if(i!=-1&& i!=0){
        for(var l=0;l<ds.data.length;l++){
            var r = ds.data[l],s = l+1;
            if(l==i-1){
                s = s+1;
            }else if(l==i){
                s = s -1;
            }
            r.set('sequence',s);
        }
        $A.request({url:window.window._context_path + '/atm_reorder.svc', para:ds.getJsonData(), success:function(res){
            ds.onSubmitSuccess(res);
            ds.sort('sequence')
        }, error:ds.onSubmitError, scope:ds,failure:ds.onAjaxFailed});
    }
}
function downFileRecord(did,id) {
    var ds = $(did),record = ds.findById(id),i = ds.data.indexOf(record);    
    if(i!=-1&& i!=ds.data.length-1){
        for(var l=0;l<ds.data.length;l++){
            var r = ds.data[l],s = l+1;
            if(l==i){
                s = s+1;
            }else if(l==i+1){
                s = s -1;
            }
            r.set('sequence',s);
        }
        $A.request({url:window.window._context_path + '/atm_reorder.svc', para:ds.getJsonData(), success:function(res){
            ds.onSubmitSuccess(res);
            ds.sort('sequence')
        }, error:ds.onSubmitError, scope:ds,failure:ds.onAjaxFailed});
    }
}

function cancelUpload(did,id) {
	var ds = $(did);
    var upid = did.replaceAll('_ds','');
	var record = ds.findById(id);
	if (record) {
        if($A.uploadcmps && $A.uploadcmps.length >0){
            Ext.each($A.uploadcmps,function(uploader){
                var xhr = uploader.map[record.get('file_id')];
                if(xhr){
                    try{
                    xhr.abort();
                    }catch(e){}
                }
            })
        }else {
            window[upid].cancelUpload(record.get('file_id'));
        }
		record.set('percent', -1);
	}

}
function processPercent(record,canDelete,reorder) {
    var ds = record.ds;
    var id = ds.id;
	var percent = record.get('percent');
	var status = record.get('status');
	var html = '';
	if (Ext.isEmpty(percent) || status == 1) {
		html += '<div style="float:left;margin-left:10px;color:#808080">'
				+ formatFileSize(record.get('file_size'))
                + '</div>'
                + '<div style="float:left;margin-left:10px;color:#808080">'
                + Aurora.formatDateTime(record.get('creation_time'))
				+ '</div>'
                + ((canDelete != false) ? '<a style="margin-left:5px;text-decoration:underline" href="javascript:deleteFileRecord(\''+id +'\','+ record.id + ')">['+_lang['upload.delete']+']</a>' : '')
                 + ((reorder == true) ? '<a title="上移" href="javascript:upFileRecord(\''+id +'\','+record.id+')"><div class="up_btn"></div></a><a title="下移" href="javascript:downFileRecord(\''+id +'\','+record.id+')"><div class="down_btn"></div></a>' : '');
	} else if (percent == -1) {
		html += '<div style="float:left;margin-left:10px;color:#FD99A8">'+_lang['upload.canceled']+'</div>';
	} else if (percent >=100) {
        html += '';
    } else {
		html += '<div style="float:left;margin-left:10px;color:#808080">'
				+ formatFileSize(record.get('file_size')) + '</div>';
		html += '<div style="float:left;margin-top:3px;margin-left:10px;border:1px solid #ccc;height:9px;width:102px;">';
		html += '<div style="height:7px;margin:1px;width:' + percent
				+ 'px;background-color:#4ec745"></div></div>';
		html += '<a style="margin-left:5px;text-decoration:underline" href="javascript:cancelUpload(\''
				+ id + '\',' + record.id + ')">['+_lang['upload.cancel']+']</a>';
	}
	return html;
}
function fileSizeRenderer(value, record, name) {
	return formatFileSize(value)
}
function atmRenderer(value, record, name, canDelete, deleteControl,reorder) {
    var percent = record.get('percent');
    var ds = record.ds;
    var id = ds.id;
    var upid = id.replaceAll('_ds','');
	var c = 'status_upload';
	var a = '<div class="atm2"> </div>';
	var st = record.get('status');
	if (st == 1) {
		c = 'status_success';
		a = '<div class="atm3"> </div>'
	} else if (st == 0) {
		c = 'status_error';
		a = '<div class="atm1"> </div>'
	}
    if(deleteControl) canDelete = record.get('is_delete') === 1;    
    
	var html = '<div class="' + c + '">' + a + '<div style="float:left">' + (percent == -1 ? value :'<a target="_self" '+(atmTypeRef(record.get("file_name")) ? 'ref="img"' : '') +' href="'+window[upid+'_download_path']+'?attachment_id='+record.get('attachment_id')+'&table_name='+record.get('table_name')+'&table_pk_value='+record.get('table_pk_value')+'\">'
            + value + '</a>') + '</div>' + processPercent(record,canDelete,reorder) + '</div>';
	return html;
}
function atmReorderRenderer(value, record, name) {
    return atmRenderer(value, record, name,null,null,true)
}
function atmNotDeleteReorderRenderer(value, record, name) {
    return atmRenderer(value,record,name,false,false,true)
}

function atmDeleteControlReorderRenderer(value, record, name){
    return atmRenderer(value,record,name,true,true,true)
}
function atmNotDeleteRenderer(value, record, name) {
    return atmRenderer(value,record,name,false)
}

function atmDeleteControlRenderer(value, record, name){
    return atmRenderer(value,record,name,true,true)
}
function atmTypeRef(name){
    return /\.(jpg|png|gif|bmp|jpeg)$/i.test(name)
}
$A.UploadList = Ext.extend($A.Component,{
    initComponent : function(config){
        $A.UploadList.superclass.initComponent.call(this, config);
        this.drawList();
    },
    processListener: function(ou){
        $A.UploadList.superclass.processListener.call(this,ou);
        var sf = this,bt = sf.bindtarget,ds = $A.CmpManager.get(bt)
        if(ds){
            ds[ou]('update', sf.onUpdate, sf);
            ds[ou]('add', sf.onAdd, sf);
            ds[ou]('remove', sf.onRemove, sf);
            ds[ou]('load', sf.drawList, sf);
            ds[ou]('refresh', sf.drawList, sf);
        }
    },
    onUpdate : function(ds,record, name, value){
        if(name=='percent' || name == 'status') {
            var percent = record.get('percent'),status = record.get('status');
            if (Ext.isEmpty(percent) || status == 1) {
                var html = [];
                if(this.showdelete) {
                   html.push('<a href="javascript:deleteFileRecord(\''+this.bindtarget +'\','+ record.id + ')">'+_lang['upload.delete']+'</a>');
                }
                if(this.reorder) {
                    html.push('</br><a title="上移" href="javascript:upFileRecord(\''+this.bindtarget +'\','+record.id+')"><div class="up_btn"></div></a>');
                    html.push('<a title="下移" href="javascript:downFileRecord(\''+this.bindtarget +'\','+record.id+')"><div class="down_btn"></div></a>')
                }
                this.wrap.child("#atm_"+record.id).child('.l').update(html.join(''));
                this.wrap.child("#atm_"+record.id).child('.j').update('<a target="_self" '+(atmTypeRef(record.get("file_name")) ? 'ref="img"' : '') +' href="'+this.downloadurl+'?attachment_id='+record.get('attachment_id')+'&table_name='+record.get('table_name')+'&table_pk_value='+record.get('table_pk_value')+'\" title="'+record.get("file_name")+'">'+record.get('file_name')+'</a>');
                this.wrap.child("#atm_"+record.id).child('.k').update(formatFileSize(record.get('file_size'))+'<span class="d">'+Aurora.formatDateTime(record.get('creation_time'))+'</span>');
            } else if (percent == -1) {
                this.wrap.child("#atm_"+record.id).child('.l').update('');
                this.wrap.child("#atm_"+record.id).child('.k').update('<div style="color:#FD99A8">'+_lang['upload.canceled']+'</div>');
            } else if (percent == 100) {
                this.wrap.child("#atm_"+record.id).child('.l').update('');
                this.wrap.child("#atm_"+record.id).child('.pbar').setStyle('width','100px');
            } else {
                this.wrap.child("#atm_"+record.id).child('.pbar').setStyle('width',percent+'px');
            }
        }
    },
    onAdd: function(ds,record,row){
        var html = [];
        var tys = (record.get('file_name')||'').split('.');
        var type = tys[tys.length-1];
        html.push('<div class="up_card" id="atm_'+record.id+'">');
        html.push('<div class="icon icon-'+type+'"> </div>');
        html.push('<div class="j">'+record.get('file_name')+'</div>');
        html.push('<div class="l"><a href="javascript:cancelUpload(\''+ ds.id + '\',' + record.id + ')">'+_lang['upload.cancel']+'</a></div>');
        html.push('<div class="k"><div style="margin-top:3px;border:1px solid #ccc;height:9px;width:102px;"><div class="pbar" style="height:7px;margin:1px;width:0px;background-color:#4ec745"></div></div></div>');
        html.push('</div><div class="clear_line"/>');        
        this.wrap.last().remove();
        Ext.DomHelper.insertHtml("beforeEnd", this.wrap.dom, html.join(''));
    },

    drawList: function(){
        var ds = $(this.bindtarget);
        var html = [];
        Ext.each(ds.getAll(),function(record){
            var tys = record.get('file_name').split('.');
            var type = tys[tys.length-1];
            html.push('<div class="up_card" id="atm_'+record.id+'">');
            html.push('<div class="icon icon-'+type+'"> </div>');
            html.push('<div class="j"><a target="_self" '+(atmTypeRef(record.get("file_name")) ? 'ref="img"' : '') +' href="'+this.downloadurl+'?attachment_id='+record.get('attachment_id')+'&table_name='+record.get('table_name')+'&table_pk_value='+record.get('table_pk_value')+'\" title="'+record.get("file_name")+'">'+record.get('file_name')+'</a></div>');

            html.push('<div class="l">');
            if(!this.showdelete||(this.deletecontrol&&record.get('is_delete') === 0)) {
            }else {
                html.push('<a href="javascript:deleteFileRecord(\''+this.bindtarget +'\','+ record.id + ')">'+_lang['upload.delete']+'</a>');
            }
            if(this.reorder) {
                html.push('</br><a title="上移" href="javascript:upFileRecord(\''+this.bindtarget +'\','+record.id+')"><div class="up_btn"></div></a>');
                html.push('<a title="下移" href="javascript:downFileRecord(\''+this.bindtarget +'\','+record.id+')"><div class="down_btn"></div></a>')
            }
            html.push('</div>');
            
            html.push('<div class="k">'+formatFileSize(record.get('file_size'))+'<span class="d">'+Aurora.formatDateTime(record.get('creation_time'))+'</span></div>');
            html.push('</div>')            
        },this)
        html.push('<div class="clear_line"/>');
        this.wrap.update(html.join(''))
    },
    onRemove: function(ds,record,index){
        var e = Ext.get("atm_"+record.id)
        if(e) e.remove();
    }
});