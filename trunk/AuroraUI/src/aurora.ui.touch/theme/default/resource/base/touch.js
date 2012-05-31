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
			if(isFunction(p[key])){
				data[key] = eval(p[key]);
			}else{
				data[key] = p[key];
			}
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