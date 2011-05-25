function formatFileSize(size) {
	if (size < 1024) {
		return size + " bytes";
	} else if (size < 1048576) {
		return (Math.round(((size * 10) / 1024)) / 10) + " KB";
	} else {
		return (Math.round(((size * 10) / 1048576)) / 10) + " MB";
	}
}
function deleteFileRecord(id) {
	var ds = $('upload_ds');
	var record = ds.findById(id);
	ds.remove(record);
}

function cancelUpload(id) {
	var ds = $('upload_ds');
	var record = ds.findById(id);
	if (record) {
		record.set('percent', -1);
		setTimeout(function() {
			window.swfUpload.cancelUpload(record.get('file_id'));
		}, 10)
	}

}
function processPercent(record) {
	var percent = record.get('percent');
	var status = record.get('status');
	var html = '';
	if (Ext.isEmpty(percent) || status == 1) {
		html += '<div style="float:left;margin-left:10px;color:#808080">'
				+ formatFileSize(record.get('file_size'))
				+ '</div><a style="margin-left:5px;text-decoration:underline" href="javascript:deleteFileRecord('
				+ record.id + ')">[删除]</a>';
	} else if (percent == -1) {
		html += '<div style="float:left;margin-left:10px;color:#FD99A8">已取消</div>';
	} else {
		html += '<div style="float:left;margin-left:10px;color:#808080">'
				+ formatFileSize(record.get('file_size')) + '</div>';
		html += '<div style="float:left;margin-top:3px;margin-left:10px;border:1px solid #ccc;height:9px;width:102px;">';
		html += '<div style="height:7px;margin:1px;width:' + percent
				+ 'px;background-color:#4ec745"></div></div>';
		html += '<a style="margin-left:5px;text-decoration:underline" href="javascript:cancelUpload('
				+ record.id + ')">[取消上传]</a>';
	}
	return html;
}
function fileSizeRenderer(value, record, name) {
	return formatFileSize(value)
}
function atmRenderer(value, record, name) {
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
	var html = '<div class="' + c + '">' + a + '<div style="float:left">'
			+ value + '</div>' + processPercent(record) + '</div>';
	return html;
}

// ------------------------------------
/**/
function fileQueued(file) {
	$('upload_ds').create({
		file_id : file.id,
		file_name : file.name,
		file_size : file.size,
		percent : 0
	})
}

function uploadSuccess(file, serverData) {
	try {
		var record = $('upload_ds').find('file_id', file.id);
		if (record) {
			record.set('status', 1);
		}

	} catch (ex) {
		this.debug(ex);
	}
}

function fileQueuedError(file, code, message) {
	try {
		var msg;
		switch (code) {
			case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED :
				msg = '超出上传文件数量限制';
				break;
			case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT :
				msg = '超出上传文件大小限制! (不能超过'
						+ window.formatFileSize(1024
								* window.swfUpload.settings.file_size_limit)
						+ ')';
				break;
			case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE :
				msg = '文件不能为空';
				break;
			case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE :
				msg = '不能上传此文件类型!<br/>(仅限于 '
						+ window.swfUpload.settings.file_types + ')';
				break;
			default :
				if (file !== null) {
					alert("Unhandled Error");
				}
				break;
		}
		if (msg) {
			Aurora.showErrorMessage('错误', msg);
		}
	} catch (e) {
	}
}

function fileDialogComplete(numFilesSelected, numFilesQueued) {
	try {
		this.startUpload();
	} catch (ex) {
		this.debug(ex);
	}
}

function uploadProgress(file, bytesLoaded, bytesTotal) {
	try {
		var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
		var record = $('upload_ds').find('file_id', file.id);
		if (record) {
			record.set('percent', percent);
		}
	} catch (ex) {
		alert(ex)
	}
}

function uploadError(file, code, message) {
	var msg;
	switch (code) {
		case SWFUpload.UPLOAD_ERROR.HTTP_ERROR :
			switch (message) {
				case '404' :
					msg = "上传地址不正确";
					break;
				case '500' :
					msg = "服务端发生错误";
					break;
				default :
					msg = "网络连接失败";
					break;
			}
			break;
		case SWFUpload.UPLOAD_ERROR.MISSING_UPLOAD_URL :
			msg = "上传地址错误";
			break;
		case SWFUpload.UPLOAD_ERROR.IO_ERROR :
			msg = "IO错误";
			break;
		case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR :
			msg = "安全错误";
			break;
		case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED :
			msg = "网络连接失败";
			break;
		case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED :
			msg = "上传失败";
			break;
		case SWFUpload.UPLOAD_ERROR.SPECIFIED_FILE_ID_NOT_FOUND :
			msg = "文件ID没有找到";
			break;
		case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED :
			msg = "文件大小或类型出错";
			break;
		case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED :
			msg = "文件停止上传";
			break;
	}
	if (msg) {
		Aurora.showErrorMessage('错误', msg);
		var record = $('upload_ds').find('file_id', file.id);
		if (record) {
			record.set('status', 0);
		}
	}
}