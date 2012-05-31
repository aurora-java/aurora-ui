var Touch = {};
(function(t,undefined){
	var cmpCache = {};
	
	function isFunction(v){
		return /\(.*\)/.test(v);
	}
	
t.get = function(id){
	return cmpCache[id];
}
t.Ajax = function(config){
	cmpCache[config.id] = this;
	delete config.id;
	$.extend(this.options,config);
}
t.Ajax.timeout = 0;
$.extend(t.Ajax.prototype,{
	options : {
	  type: 'POST',
	  dataType: 'json',
	  timeout: t.Ajax.timeout
	},
	request : function(){
		var data = {},p = this.options.parameters;
		for(var key in p){
			var v = p[key],bind = v.bind;
			data[key] = bind?$('#'+bind).val():v.value;
		}
		this.options.data = {
			_request_data: JSON.stringify({
				'parameter': data
			})
		}
		$.ajax(this.options)
	}
})
})(Touch)