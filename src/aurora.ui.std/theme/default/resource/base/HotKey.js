$A.HotKey = function(){
	var CTRL = 'CTRL',
		ALT = 'ALT',
		SHIFT = 'SHIFT',
		keys = {},
		doc = Ext.get(document),
		onKeyDown = function(e,t){
			var key = e.keyCode;
			if(key!=17 && key!=18 && key!=16){
				var handler,
				c = String.fromCharCode(key),
				bind = [];
				e.ctrlKey &&
					bind.push(CTRL);
				e.altKey &&
					bind.push(ALT);
				e.shiftKey &&
					bind.push(SHIFT);
				bind.push(c);
				handler = keys[bind.join('+').toUpperCase()];
				if(handler){
					e.stopEvent();
					handler();
				}
			}
		},on = function(){
			doc.on('keydown',onKeyDown);
		};
	on();
	return {
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
				keys[key.join('+')] = handler;
			}
		},
		on : on,
		off : function(){
			doc.un('keydown',onKeyDown);
			keys={};
		}
	}
}();