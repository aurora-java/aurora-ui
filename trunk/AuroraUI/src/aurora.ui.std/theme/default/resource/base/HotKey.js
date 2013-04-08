$A.HotKey = function(){
	var CTRL = 'CTRL',
		ALT = 'ALT',
		SHIFT = 'SHIFT',
		hosts = {},
		enable = true,
		onKeyDown = function(e,t){
			var key = e.keyCode,bind = [],handler,sf = this;
			if(key!=16 && key!=17 && key!=18 ){
				e.ctrlKey &&
					bind.push(CTRL);
				e.altKey &&
					bind.push(ALT);
				e.shiftKey &&
					bind.push(SHIFT);
				bind.push(String.fromCharCode(key));
				handler = hosts[sf.id][bind.join('+').toUpperCase()];
				if(handler){
					e.stopEvent();
					if(enable){
						enable = false;
						var focuser = Ext.get(t),
							tagName = t.tagName.toLowerCase(),
							fns = function(e){
								Ext.each(handler,function(fn){
									return fn();
								});
								focuser.un('focus',fns);
							}
						if(tagName=='input' || tagName=='textarea')
							focuser.on('focus',fns).blur().focus();
						else
							fns();
					}
				}
			}
		},
		onKeyUp = function(){
			enable = true;
		},
		on = function(host){
			host.on('keydown',onKeyDown,host,{stopPropagation:true})
				.on('keyup',onKeyUp);
		},
		pub = {
			addHandler : function(bind,handler){
				var binds = bind.toUpperCase().split('+'),key=[],
					host = window['__host']||Ext.getBody(),
					id = host.id,
					keys = hosts[id];
				if(!keys){
					hosts[id] = keys = {};
					on(host);
				}
				binds.indexOf(CTRL)!=-1 &&
					key.push(CTRL);
				binds.indexOf(ALT)!=-1 &&
					key.push(ALT);
				binds.indexOf(SHIFT)!=-1 &&
					key.push(SHIFT);
				if(key.length < binds.length){
					key.push(binds.pop());
					key = key.join('+');
					(keys[key]||(keys[key] = [])).add(handler);
				}
			}
		};
	return pub;
}();