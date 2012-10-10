$A.HotKey = function(){
	var CTRL = 'CTRL',
		ALT = 'ALT',
		SHIFT = 'SHIFT',
		keys = {},
		doc = Ext.get(document),
		enable = true;
		onKeyDown = function(e,t){
			var key = e.keyCode,bind = [],handler;
			if(key!=16 && key!=17 && key!=18 ){
				e.ctrlKey &&
					bind.push(CTRL);
				e.altKey &&
					bind.push(ALT);
				e.shiftKey &&
					bind.push(SHIFT);
				bind.push(String.fromCharCode(key));
				handler = keys[bind.join('+').toUpperCase()];
				if(handler){
					e.stopEvent();
					if(enable){
						enable = false;
						Ext.each(handler,function(fn){
							return fn();
						});
					}
				}
			}
		},
		onKeyUp = function(){
			enable = true;
		},
		pub = {
			addHandler : function(bind,handler){
				var binds = bind.toUpperCase().split('+'),key=[];
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
			},
			on : function(){
				doc.on('keydown',onKeyDown)
					.on('keyup',onKeyUp);
			},
			off : function(){
				doc.un('keydown',onKeyDown)
					.un('keyup',onKeyUp);
				keys={};
			}
		};
	pub.on();
	return pub;
}();