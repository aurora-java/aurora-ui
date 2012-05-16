/**
 * HighchartsAdapter -> AuroraAdapter
 * 
 */
(function () {

var win = window,
	doc = document,
	mooVersion = win.MooTools.version.substring(0, 3), // Get the first three characters of the version number
	legacy = mooVersion === '1.2' || mooVersion === '1.1', // 1.1 && 1.2 considered legacy, 1.3 is not.
	legacyEvent = legacy || mooVersion === '1.3', // In versions 1.1 - 1.3 the event class is named Event, in newer versions it is named DOMEvent.
	$extend = win.$extend || function () {
		return Object.append.apply(Object, arguments);
	},
	capitalize = function(w){
    	return w.replace(/^./,w.charAt(0).toUpperCase());
    };
	
win.AuroraAdapter = {
	/**
	 * Initialize the adapter. This is run once as Highcharts is first run.
	 * @param {Object} pathAnim The helper object to do animations across adapters.
	 */
	init: function (pathAnim) {
		var fxProto = Fx.prototype,
			fxStart = fxProto.start,
			morphProto = Fx.Morph.prototype,
			morphCompute = morphProto.compute;

		// override Fx.start to allow animation of SVG element wrappers
		/*jslint unparam: true*//* allow unused parameters in fx functions */
		fxProto.start = function (from, to) {
			var fx = this,
				elem = fx.element;

			// special for animating paths
			if (from.d) {
				//this.fromD = this.element.d.split(' ');
				fx.paths = pathAnim.init(
					elem,
					elem.d,
					fx.toD
				);
			}
			fxStart.apply(fx, arguments);

			return this; // chainable
		};

		// override Fx.step to allow animation of SVG element wrappers
		morphProto.compute = function (from, to, delta) {
			var fx = this,
				paths = fx.paths;

			if (paths) {
				fx.element.attr(
					'd',
					pathAnim.step(paths[0], paths[1], delta, fx.toD)
				);
			} else {
				return morphCompute.apply(fx, arguments);
			}
		};
		/*jslint unparam: false*/
	},

	/**
	 * Downloads a script and executes a callback when done.
	 * @param {String} scriptLocation
	 * @param {Function} callback
	 */
	getScript: function (scriptLocation, callback) {
		// We cannot assume that Assets class from mootools-more is available so instead insert a script tag to download script.
		var head = doc.getElementsByTagName('head')[0];
		var script = doc.createElement('script');

		script.type = 'text/javascript';
		script.src = scriptLocation;
		script.onload = callback;

		head.appendChild(script);
	},

	/**
	 * Animate a HTML element or SVG element wrapper
	 * @param {Object} el
	 * @param {Object} params
	 * @param {Object} options jQuery-like animation options: duration, easing, callback
	 */
	animate: function (el, params, options) {
		var isSVGElement = el.attr,
			effect,
			complete = options && options.complete;

		if (isSVGElement && !el.setStyle) {
			// add setStyle and getStyle methods for internal use in Moo
			el.getStyle = el.attr;
			el.setStyle = function () { // property value is given as array in Moo - break it down
				var args = arguments;
				el.attr.call(el, args[0], args[1][0]);
			};
			// dirty hack to trick Moo into handling el as an element wrapper
			el.$family = function () { return true; };
		}

		// stop running animations
		win.AuroraAdapter.stop(el);

		// define and run the effect
		effect = new Fx.Morph(
			isSVGElement ? el : $_(el),
			$extend({
				transition: Fx.Transitions.Quad.easeInOut
			}, options)
		);

		// Make sure that the element reference is set when animating svg elements
		if (isSVGElement) {
			effect.element = el;
		}

		// special treatment for paths
		if (params.d) {
			effect.toD = params.d;
		}

		// jQuery-like events
		if (complete) {
			effect.addEvent('complete', complete);
		}

		// run
		effect.start(params);

		// record for use in stop method
		el.fx = effect;
	},

	/**
	 * MooTool's each function
	 *
	 */
	each: function (arr, fn) {
		return legacy ?
			$each(arr, fn) :
			Array.each(arr, fn);
	},

	/**
	 * Map an array
	 * @param {Array} arr
	 * @param {Function} fn
	 */
	map: function (arr, fn) {
		return arr.map(fn);
	},

	/**
	 * Grep or filter an array
	 * @param {Array} arr
	 * @param {Function} fn
	 */
	grep: function (arr, fn) {
		return arr.filter(fn);
	},

	/**
	 * Deep merge two objects and return a third
	 */
	merge: function () {
		var args = arguments,
			args13 = [{}], // MooTools 1.3+
			i = args.length,
			ret;

		if (legacy) {
			ret = $merge.apply(null, args);
		} else {
			while (i--) {
				// Boolean argumens should not be merged.
				// JQuery explicitly skips this, so we do it here as well.
				if (typeof args[i] !== 'boolean') {
					args13[i + 1] = args[i];
				}
			}
			ret = Object.merge.apply(Object, args13);
		}

		return ret;
	},

	/**
	 * Get the offset of an element relative to the top left corner of the web page
	 */
	offset: function (el) {
		var offsets = $_(el).getOffsets();
		return {
			left: offsets.x,
			top: offsets.y
		};
	},

	/**
	 * Extends an object with Events, if its not done
	 */
	extendWithEvents: function (el) {
		// if the addEvent method is not defined, el is a custom Highcharts object
		// like series or point
		if (!el.addEvent) {
			if (el.nodeName) {
				el = $_(el); // a dynamically generated node
			} else {
				$extend(el, new Events()); // a custom object
			}
		}
	},

	/**
	 * Add an event listener
	 * @param {Object} el HTML element or custom object
	 * @param {String} type Event type
	 * @param {Function} fn Event handler
	 */
	addEvent: function(el, event, fn) {
		var xel = Ext.get(el);
		if (xel) {
			xel.addListener(event, fn)
		} else {
			if (!el.addListener) {
				Ext.apply(el, new Ext.util.Observable());
			}
			el.addListener(event, fn)
		}
	}, 

	removeEvent: function(el, event, fn) {
        if (el.removeListener && el.purgeListeners) {
            if (event && fn) {
                el.removeListener(event, fn)
            }
            else {
                el.purgeListeners();
            }
        }
        else {
            var xel = Ext.get(el);
            if (xel) {
                if (event && fn) {
                    xel.removeListener(event, fn)
                }
                else {
                    xel.purgeAllListeners();
                }
            }
        }
    },

	fireEvent: function(el, event, eventArguments, defaultFunction) {
        var o = {
            type: event,
            target: el
        }
        if(Ext.isArray(eventArguments) && eventArguments.length){
        	Ext.apply(o, eventArguments[0])
        }else{
        	Ext.apply(o, eventArguments)
        }
        // if fireEvent is not available on the object, there hasn't been added
        // any events to it above
        if (el.fireEvent) {
            var fire = 'el.fireEvent(event, o';
            if(eventArguments){
	            for(var i = 1 ,l = eventArguments.length;i<l;i++){
	            	fire += ',eventArguments['+i+']';
	            }
            }
            fire+=')';
            eval(fire);
        }

        // fire the default if it is passed and it is not prevented above
        if (defaultFunction) defaultFunction(o);
    },

	/**
	 * Stop running animations on the object
	 */
	stop: function (el) {
		if (el.fx) {
			el.fx.cancel();
		}
	},
	adapterRun : function (el, method) {
		return Ext.get(el)['get'+capitalize(method)]();
	},
	washMouseEvent : function (e) {
		e.pageX = e.xy?e.xy[0]:e.page.x;
		e.pageY = e.xy?e.xy[1]:e.page.y;
		return e;
	}
};
}());