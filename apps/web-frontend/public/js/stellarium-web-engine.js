// This code implements the `-sMODULARIZE` settings by taking the generated
// JS program code (INNER_JS_CODE) and wrapping it in a factory function.

// Single threaded MINIMAL_RUNTIME programs do not need access to
// document.currentScript, so a simple export declaration is enough.
var StelWebEngine = (() => {
  // When MODULARIZE this JS may be executed later,
  // after document.currentScript is gone, so we save it.
  // In EXPORT_ES6 mode we can just use 'import.meta.url'.
  var _scriptName = globalThis.document?.currentScript?.src;
  return async function(moduleArg = {}) {
    var moduleRtn;

// include: shell.js
// include: minimum_runtime_check.js
(function() {
  // "30.0.0" -> 300000
  function humanReadableVersionToPacked(str) {
    str = str.split("-")[0];
    // Remove any trailing part from e.g. "12.53.3-alpha"
    var vers = str.split(".").slice(0, 3);
    while (vers.length < 3) vers.push("00");
    vers = vers.map((n, i, arr) => n.padStart(2, "0"));
    return vers.join("");
  }
  // 300000 -> "30.0.0"
  var packedVersionToHumanReadable = n => [ n / 1e4 | 0, (n / 100 | 0) % 100, n % 100 ].join(".");
  var TARGET_NOT_SUPPORTED = 2147483647;
  // Note: We use a typeof check here instead of optional chaining using
  // globalThis because older browsers might not have globalThis defined.
  var currentNodeVersion = typeof process !== "undefined" && process.versions?.node ? humanReadableVersionToPacked(process.versions.node) : TARGET_NOT_SUPPORTED;
  if (currentNodeVersion < 16e4) {
    throw new Error(`This emscripten-generated code requires node v${packedVersionToHumanReadable(16e4)} (detected v${packedVersionToHumanReadable(currentNodeVersion)})`);
  }
  var userAgent = typeof navigator !== "undefined" && navigator.userAgent;
  if (!userAgent) {
    return;
  }
  var currentSafariVersion = userAgent.includes("Safari/") && !userAgent.includes("Chrome/") && userAgent.match(/Version\/(\d+\.?\d*\.?\d*)/) ? humanReadableVersionToPacked(userAgent.match(/Version\/(\d+\.?\d*\.?\d*)/)[1]) : TARGET_NOT_SUPPORTED;
  if (currentSafariVersion < 15e4) {
    throw new Error(`This emscripten-generated code requires Safari v${packedVersionToHumanReadable(15e4)} (detected v${currentSafariVersion})`);
  }
  var currentFirefoxVersion = userAgent.match(/Firefox\/(\d+(?:\.\d+)?)/) ? parseFloat(userAgent.match(/Firefox\/(\d+(?:\.\d+)?)/)[1]) : TARGET_NOT_SUPPORTED;
  if (currentFirefoxVersion < 79) {
    throw new Error(`This emscripten-generated code requires Firefox v79 (detected v${currentFirefoxVersion})`);
  }
  var currentChromeVersion = userAgent.match(/Chrome\/(\d+(?:\.\d+)?)/) ? parseFloat(userAgent.match(/Chrome\/(\d+(?:\.\d+)?)/)[1]) : TARGET_NOT_SUPPORTED;
  if (currentChromeVersion < 85) {
    throw new Error(`This emscripten-generated code requires Chrome v85 (detected v${currentChromeVersion})`);
  }
})();

// end include: minimum_runtime_check.js
// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(moduleArg) => Promise<Module>
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = moduleArg;

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).
// Attempt to auto-detect the environment
var ENVIRONMENT_IS_WEB = !!globalThis.window;

var ENVIRONMENT_IS_WORKER = !!globalThis.WorkerGlobalScope;

// N.b. Electron.js environment is simultaneously a NODE-environment, but
// also a web environment.
var ENVIRONMENT_IS_NODE = globalThis.process?.versions?.node && globalThis.process?.type != "renderer";

var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)
// include: src/js/pre.js
/* Stellarium Web Engine - Copyright (c) 2022 - Stellarium Labs SRL
 *
 * This program is licensed under the terms of the GNU AGPL v3, or
 * alternatively under a commercial licence.
 *
 * The terms of the AGPL v3 license can be found in the main directory of this
 * repository.
 */ // Allow to set the memory file path in 'memFile' argument.
Module["locateFile"] = function(path) {
  if (path === "stellarium-web-engine.wasm") return Module.wasmFile;
  return path;
};

Module["onRuntimeInitialized"] = function() {
  // Init OpenGL context.
  if (Module.canvasElement) Module.canvas = Module.canvasElement;
  if (Module.canvas) {
    var contextAttributes = {};
    contextAttributes.alpha = false;
    contextAttributes.depth = true;
    contextAttributes.stencil = true;
    contextAttributes.antialias = true;
    contextAttributes.premultipliedAlpha = true;
    contextAttributes.preserveDrawingBuffer = false;
    contextAttributes.preferLowPowerToHighPerformance = false;
    contextAttributes.failIfMajorPerformanceCaveat = false;
    contextAttributes.majorVersion = 1;
    contextAttributes.minorVersion = 0;
    var ctx = Module.GL.createContext(Module.canvas, contextAttributes);
    Module.GL.makeContextCurrent(ctx);
  }
  // Since we are going to redefine the setValue and getValue methods,
  // I put the old one in new attributes so that we can still use them.
  Module["_setValue"] = Module["setValue"];
  Module["_getValue"] = Module["getValue"];
  // Call all the functions registered with Module.afterInit(f)
  for (var i in Module.extendFns) {
    Module.extendFns[i]();
  }
  Module._core_init(0, 0, 1);
  Module.core = Module.getModule("core");
  Module.observer = Module.core.observer;
  // Setup the translation function provided by the client if any.
  if (Module.translateFn) {
    Module.translationsCache = {};
    let callback = Module.addFunction(function(user, domain, str) {
      domain = Module.UTF8ToString(domain);
      str = Module.UTF8ToString(str);
      str = Module.translateFn(domain, str);
      let value = Module.translationsCache[str];
      if (value) return value;
      let size = Module.lengthBytesUTF8(str) + 1;
      value = Module._malloc(size);
      Module.stringToUTF8(str, value, size);
      Module.translationsCache[str] = value;
      return value;
    }, "iiii");
    Module._sys_set_translate_function(callback);
  }
  if (Module.onReady) Module.onReady(Module);
};

// All to register functions that will be called only after the runtime
// is initialized.
Module["extendFns"] = [];

Module["afterInit"] = function(f) {
  Module.extendFns.push(f);
};

// Add some methods to the module
Module["D2R"] = Math.PI / 180;

Module["R2D"] = 180 / Math.PI;

// Expose the frame enum.
// Make sure that correspond to the values in frames.h!
Module["FRAME_ASTROM"] = 0;

Module["FRAME_ICRF"] = 1;

Module["FRAME_CIRS"] = 2;

Module["FRAME_JNOW"] = 3;

Module["FRAME_OBSERVED_GEOM"] = 4;

Module["FRAME_OBSERVED"] = 5;

Module["FRAME_MOUNT"] = 6;

Module["FRAME_VIEW"] = 7;

Module["FRAME_ECLIPTIC"] = 8;

Module["MJD2date"] = function(v) {
  return new Date(Math.round((v + 2400000.5 - 2440587.5) * 864e5));
};

Module["date2MJD"] = function(date) {
  return date / 864e5 - 2400000.5 + 2440587.5;
};

/*
 * Function: a2tf
 * Decompose radians into hours, minutes, seconds, fraction.
 *
 * This is a direct wrapping of erfaA2tf.
 *
 * Parameters:
 *   angle      - Angle in radians.
 *   resolution - Number of decimal (see erfa doc for full explanation).
 *                default to 0 (no decimals).
 *
 * Return:
 *   an object with the following attributes:
 *     sign ('+' or '-')
 *     hours
 *     minutes
 *     seconds
 *     fraction
 */ Module["a2tf"] = function(angle, resolution) {
  resolution = resolution || 0;
  var a2tf_json = Module.cwrap("a2tf_json", "number", [ "number", "number" ]);
  var cret = a2tf_json(resolution, angle);
  var ret = Module.UTF8ToString(cret);
  Module._free(cret);
  ret = JSON.parse(ret);
  return ret;
};

/*
 * Function: a2af
 * Decompose radians into degrees, arcminutes, arcseconds, fraction.
 *
 * This is a direct wrapping of erfaA2af.
 *
 * Parameters:
 *   angle      - Angle in radians.
 *   resolution - Number of decimal (see erfa doc for full explanation).
 *                default to 0 (no decimals).
 *
 * Return:
 *   an object with the following attributes:
 *     sign ('+' or '-')
 *     degrees
 *     arcminutes
 *     arcseconds
 *     fraction
 */ Module["a2af"] = function(angle, resolution) {
  resolution = resolution || 0;
  var a2af_json = Module.cwrap("a2af_json", "number", [ "number", "number" ]);
  var cret = a2af_json(resolution, angle);
  var ret = Module.UTF8ToString(cret);
  Module._free(cret);
  ret = JSON.parse(ret);
  return ret;
};

/*
 * Function: calendar
 * Compute calendar events.
 *
 * Parameters:
 *   settings - Plain object with attributes:
 *     start    - start time (Date)
 *     end      - end time (Date)
 *     onEvent  - callback called for each calendar event, passed a plain
 *                object with attributes:
 *                  time  - time of the event (Date)
 *                  type  - type of event (string)
 *                  desc  - a small descrption (string)
 *                  o1    - first object of the event (or null)
 *                  o2    - second object of the event (or null)
 *     iterator - if set to true, then instead of computing all the events
 *                the function returns an itertor object that we have to
 *                call until it returns 0 in order to get all the events.
 *                eg:
 *
 *                var cal = stel.calendar({
 *                  start: new Date(2017, 1, 1),
 *                  end: new Date(2017, 1, 8),
 *                  onEvent: onEvent,
 *                  iterator: true
 *                });
 *                while (cal()) {}
 *
 *                This allows to split the computation into different frames
 *                of a loop so that we don't block too long.
 */ Module["calendar"] = function(args) {
  // Old signature: (start, end, callback)
  if (arguments.length == 3) {
    args = {
      start: arguments[0],
      end: arguments[1],
      onEvent: function(ev) {
        arguments[2](ev.time, ev.type, ev.desc, ev.flags, ev.o1, ev.o2);
      }
    };
  }
  var start = args.start / 864e5 + 2440587.5 - 2400000.5;
  var end = args.end / 864e5 + 2440587.5 - 2400000.5;
  var getCallback = function() {
    return Module.addFunction(function(time, type, desc, flags, o1, o2, user) {
      var ev = {
        time: Module.MJD2date(time),
        type: Module.UTF8ToString(type),
        desc: Module.UTF8ToString(desc),
        o1: o1 ? new Module.SweObj(o1) : null,
        o2: o2 ? new Module.SweObj(o2) : null
      };
      args.onEvent(ev);
    }, "idiiiiii");
  };
  // Return an iterator function that the client needs to call as
  // long as it doesn't return 0.
  if (args.iterator) {
    var cal = Module._calendar_create(this.observer.v, start, end, 1);
    return function() {
      var ret = Module._calendar_compute(cal);
      if (!ret) {
        var callback = getCallback();
        Module._calendar_get_results_callback(cal, 0, callback);
        Module.removeFunction(callback);
        Module._calendar_delete(cal);
      }
      return ret;
    };
  }
  var callback = getCallback();
  Module._calendar_get(this.observer.v, start, end, 1, 0, callback);
  Module.removeFunction(callback);
};

/*
 * Function: designationCleanup
 * Create a printable version of a designation
 *
 * This can be used for example to compute the label to render for an object.
 *
 * Parameters:
 *   d     - the designation string.
 *   flags - formatting flags
 *
 * Return:
 *   A human-friendly designation.
 */ Module["designationCleanup"] = function(d, flags) {
  const designation_cleanup = Module.cwrap("designation_cleanup", null, [ "string", "number", "number", "number" ]);
  const cbuf = Module._malloc(256);
  designation_cleanup(d, cbuf, 256, flags);
  const ret = Module.UTF8ToString(cbuf);
  Module._free(out);
  return ret;
};

Module["c2s"] = function(v) {
  var x = v[0];
  var y = v[1];
  var z = v[2];
  var d2 = x * x + y * y;
  var theta = (d2 == 0) ? 0 : Math.atan2(y, x);
  var phi = (z === 0) ? 0 : Math.atan2(z, Math.sqrt(d2));
  return [ theta, phi ];
};

Module["s2c"] = function(theta, phi) {
  var cp = Math.cos(phi);
  return [ Math.cos(theta) * cp, Math.sin(theta) * cp, Math.sin(phi) ];
};

// Normalize angle into the range 0 <= a < 2pi.
Module["anp"] = function(a) {
  var v = a % (2 * Math.PI);
  if (v < 0) v += 2 * Math.PI;
  return v;
};

// Normalize angle into the range -pi <= a < +pi.
Module["anpm"] = function(a) {
  var v = a % (2 * Math.PI);
  if (Math.abs(v) >= Math.PI) v -= 2 * Math.PI * Math.sign(a);
  return v;
};

const asFrame = function(f) {
  if (f === "ASTROM") return Module.FRAME_ASTROM;
  if (f === "ICRF") return Module.FRAME_ICRF;
  if (f === "CIRS") return Module.FRAME_CIRS;
  if (f === "JNOW") return Module.FRAME_JNOW;
  if (f === "OBSERVED") return Module.FRAME_OBSERVED;
  if (f === "OBSERVED_GEOM") return Module.FRAME_OBSERVED_GEOM;
  if (f === "MOUNT") return Module.FRAME_MOUNT;
  if (f === "VIEW") return Module.FRAME_VIEW;
  assert(typeof (f) === "number");
  return f;
};

/*
 * Function: convertFrame
 * Rotate the passed apparent coordinate vector from a Reference Frame to
 * another.
 *
 * Check the 4th component of the input vector
 * to know if the source is at infinity. If in[3] == 0.0, the source is at
 * infinity and the vector must be normalized, otherwise assume the vector to
 * contain the real object's distance in AU.
 *
 * The vector represents the apparent position/direction of the source as seen
 * by the observer in his reference system (usually GCRS for earth observation).
 * This means that effects such as space motion, light deflection or annual
 * aberration must already be taken into account before calling this function.
 *
 * Parameters:
 *   obs    - The observer.
 *   origin - Origin frame ('ASTROM', 'ICRF', 'CIRS', 'JNOW', 'OBSERVED',
 *            'OBSERVED_GEOM', 'VIEW').
 *   dest   - Destination frame (same as origin).
 *   v      - A 4d vector.
 *
 * Return:
 *   A 4d vector.
 */ Module["convertFrame"] = function(obs, origin, dest, v) {
  origin = asFrame(origin);
  dest = asFrame(dest);
  var v4 = [ v[0], v[1], v[2], v[3] || 0 ];
  var ptr = Module._malloc(8 * 8);
  var i;
  for (i = 0; i < 4; i++) Module._setValue(ptr + i * 8, v4[i], "double");
  Module._convert_framev4(obs.v, origin, dest, ptr, ptr + 4 * 8);
  var ret = new Array(4);
  for (i = 0; i < 4; i++) ret[i] = Module._getValue(ptr + (4 + i) * 8, "double");
  Module._free(ptr);
  return ret;
};

/*
 * Function: lookAt
 * Move view direction to the given position.
 *
 * For example this can be used after core_get_point_for_mag to estimate the
 * angular size a circle should have to exactly fit the object.
 *
 * Parameters:
 *   pos      - The wanted pointing 3D direction in the OBSERVED frame.
 *   duration - Movement duration in sec.
 */ Module["lookAt"] = function(pos, duration) {
  if (duration === undefined) duration = 1;
  var v = Module._malloc(3 * 8);
  var i;
  for (i = 0; i < 3; i++) Module._setValue(v + i * 8, pos[i], "double");
  Module._core_lookat(v, duration);
  Module._free(v);
};

/*
 * Function: pointAndLock
 * Move view direction to the given object and lock on it.
 *
 * Parameters:
 *   target   - The target object.
 *   duration - Movement duration in sec.
 */ Module["pointAndLock"] = function(target, duration) {
  if (duration === undefined) duration = 1;
  Module._core_point_and_lock(target.v, duration);
};

/*
 * Function: zoomTo
 * Change FOV to the passed value.
 *
 * Parameters:
 *   fov      - The target FOV diameter in rad.
 *   duration - Movement duration in sec.
 */ Module["zoomTo"] = function(fov, duration) {
  if (duration === undefined) duration = 1;
  Module._core_zoomto(fov, duration);
};

/*
 * Function: otypeToStr
 * Get the name for an object's otype.
 *
 * Parameters:
 *   otype    - The input 1-4 chars otype code.
 *
 * Return:
 *   The english name for an otype.
 */ Module["otypeToStr"] = function(otype) {
  var otype_to_str = Module.cwrap("otype_to_str", "number", [ "string" ]);
  var cret = otype_to_str(otype);
  return Module.UTF8ToString(cret);
};

let onClickCallback;

let onClickFn;

let onRectCallback;

let onRectFn;

/*
 * Function: on
 * Allow to listen to events on the sky map
 *
 * For the moment we only support the 'click' and 'rect' event.
 */ Module["on"] = function(eventName, callback) {
  if (eventName === "click") {
    if (!onClickFn) {
      onClickFn = Module.addFunction(function(x, y) {
        return onClickCallback({
          point: {
            x,
            y
          }
        });
      }, "idd");
    }
    onClickCallback = callback;
    Module.core.on_click = onClickFn;
  }
  if (eventName === "rectSelection") {
    onRectFn = Module.addFunction(function(x1, y1, x2, y2) {
      return onRectCallback({
        rect: [ {
          x: x1,
          y: y1
        }, {
          x: x2,
          y: y2
        } ]
      });
    }, "idddd");
    onRectCallback = callback;
    Module.core.on_rect = onRectFn;
  }
};

/*
 * Function: setFont
 * Load a font from a url and add it into the engine.
 *
 * If we add several fonts to the same face ('regular' or 'bold'), the
 * former are used as fallback.
 *
 * Parameters:
 *   font   - One of 'regular' or 'bold'
 *   url    - Url to a ttf font.
 *
 * Return:
 *   A promise that can be used to be notified once the font has been loaded.
 */ Module["setFont"] = function(font, url) {
  return fetch(url).then(function(response) {
    if (!response.ok) throw new Error(`Cannot get ${url}`);
    return response.arrayBuffer();
  }).then(function(data) {
    data = new Uint8Array(data);
    let ptr = Module._malloc(data.length);
    Module.writeArrayToMemory(data, ptr);
    Module.ccall("core_add_font", null, [ "number", "string", "string", "number", "number", "number" ], [ 0, font, null, ptr, data.length ]);
    // Also add the internal fallback font.
    let url = (font === "regular") ? "asset://font/NotoSans-Regular.ttf" : "asset://font/NotoSans-Bold.ttf";
    Module.ccall("core_add_font", null, [ "number", "string", "string", "number", "number", "number" ], [ 0, font, url, 0, 0 ]);
  });
};

// end include: src/js/pre.js
// include: src/js/obj.js
/* Stellarium Web Engine - Copyright (c) 2022 - Stellarium Labs SRL
 *
 * This program is licensed under the terms of the GNU AGPL v3, or
 * alternatively under a commercial licence.
 *
 * The terms of the AGPL v3 license can be found in the main directory of this
 * repository.
 */ Module.afterInit(function() {
  // Init C function wrappers.
  var obj_call_json_str = Module.cwrap("obj_call_json_str", "number", [ "number", "string", "string" ]);
  var core_search = Module.cwrap("core_search", "number", [ "string" ]);
  var obj_get_id = Module.cwrap("obj_get_id", "string", [ "number" ]);
  var module_add = Module.cwrap("module_add", null, [ "number", "number" ]);
  var module_remove = Module.cwrap("module_remove", null, [ "number", "number" ]);
  var module_get_tree = Module.cwrap("module_get_tree", "number", [ "number", "number" ]);
  var module_get_path = Module.cwrap("module_get_path", "number", [ "number", "number" ]);
  var obj_create_str = Module.cwrap("obj_create_str", "number", [ "string", "string" ]);
  var module_get_child = Module.cwrap("module_get_child", "number", [ "number", "string" ]);
  var core_get_module = Module.cwrap("core_get_module", "number", [ "string" ]);
  var obj_get_info_json = Module.cwrap("obj_get_info_json", "number", [ "number", "number", "string" ]);
  var obj_get_json_data_str = Module.cwrap("obj_get_json_data_str", "number", [ "number" ]);
  // List of {obj, attr, callback}
  var g_listeners = [];
  let g_ret;
  // Global var used to pass back C callback values.
  // Predefine all the js function that will be used as C callbacks.
  // Is there a cleaner way?
  let g_obj_foreach_attr_callback = Module.addFunction(function(attr, isProp, user) {
    g_ret.push([ attr, isProp ]);
  }, "viii");
  let g_obj_foreach_child_callback = Module.addFunction(function(id) {
    g_ret.push(id);
  }, "vi");
  let g_obj_get_designations_callback = Module.addFunction(function(o, u, v) {
    g_ret.push(v);
  }, "viii");
  let g_module_list_obj2 = Module.addFunction(function(user, obj) {
    g_ret.push(obj);
    return 0;
  }, "iii");
  var SweObj = function(v) {
    assert(typeof (v) === "number");
    this.v = v;
    this.swe_ = 1;
    var that = this;
    // Create all the dynamic attributes of the object.
    g_ret = [];
    Module._obj_foreach_attr(this.v, 0, g_obj_foreach_attr_callback);
    for (let i = 0; i < g_ret.length; i++) {
      let attr = g_ret[i][0];
      let isProp = g_ret[i][1];
      let name = Module.UTF8ToString(attr);
      if (!isProp) {
        that[name] = function(args) {
          return that._call(name, args);
        };
      } else {
        Object.defineProperty(that, name, {
          configurable: true,
          enumerable: true,
          get: function() {
            return that._call(name);
          },
          set: function(v) {
            return that._call(name, v);
          }
        });
      }
    }
    // Also add the children as properties
    g_ret = [];
    Module._obj_foreach_child(this.v, g_obj_foreach_child_callback);
    for (let i = 0; i < g_ret.length; i++) {
      let id = Module.UTF8ToString(g_ret[i]);
      if (!id) return;
      // Child with no id?
      Object.defineProperty(that, id, {
        enumerable: true,
        get: function() {
          var obj = module_get_child(that.v, id);
          return obj ? new SweObj(obj) : null;
        }
      });
    }
  };
  // Swe objects return their values as id string.
  SweObj.prototype.valueOf = function() {
    return this.id;
  };
  SweObj.prototype.update = function() {
    Module._module_update(this.v, 0);
  };
  SweObj.prototype.getInfo = function(info, obs) {
    if (obs === undefined) obs = Module.observer;
    Module._observer_update(obs.v, true);
    var cret = obj_get_info_json(this.v, obs.v, info);
    if (cret === 0) return undefined;
    var ret = Module.UTF8ToString(cret);
    Module._free(cret);
    ret = JSON.parse(ret);
    if (!ret.swe_) return ret;
    return ret.v;
  };
  SweObj.prototype.clone = function() {
    return new SweObj(Module._obj_clone(this.v));
  };
  SweObj.prototype.destroy = function() {
    Module._obj_release(this.v);
  };
  SweObj.prototype.retain = function() {
    Module._obj_retain(this.v);
  };
  SweObj.prototype.change = function(attr, callback, context) {
    g_listeners.push({
      "obj": this.v,
      "ctx": context ? context : this,
      "attr": attr,
      "callback": callback
    });
  };
  // Add an object as a child to an object.
  // Can be called in two ways:
  // - obj.add(type, args): create an object of type 'type' with data
  //                        'args', add it to the parent object.
  // - obj.add(child): add an already created object as a child.
  SweObj.prototype.add = function(type, args) {
    if (args === undefined) {
      var obj = type;
      module_add(this.v, obj.v);
      return obj;
    } else {
      // Probably need to deprecate that.
      let obj = Module.createObj(type, args);
      this.add(obj);
      return obj;
    }
  };
  /*
   * Methode: remove
   * Remove a previously added child from a layer
   */ SweObj.prototype.remove = function(obj) {
    module_remove(this.v, obj.v);
  };
  SweObj.prototype.designations = function() {
    g_ret = [];
    Module._obj_get_designations(this.v, 0, g_obj_get_designations_callback);
    let ret = g_ret.map(function(v) {
      return Module.UTF8ToString(v);
    });
    // Remove duplicates.
    // This should be done in the C code, but for the moment it's simpler
    // here.
    ret = ret.filter(function(item, pos, self) {
      return self.indexOf(item) == pos;
    });
    return ret;
  };
  /*
   * Function: culturalDesignations
   *
   * Return an array of objects with attributes:
   *   'name_native', 'name_english', 'name_pronounce', 'name_translated',
   *   'user_prefer_native'.
   */ SweObj.prototype.culturalDesignations = function() {
    let ret = Module._skycultures_get_cultural_names_json(this.v);
    ret = Module.UTF8ToString(ret);
    Module._free(ret);
    ret = JSON.parse(ret);
    return ret;
  };
  /*
   * Function: listObjs
   * Return a list of SweObject for a given module.
   *
   * Arguments:
   *   obs      - An observer.
   *   maxMag   - The maximum magnitude above which objects are discarded.
   *   filter   - a function called for each object returning false if the
   *              object must be filtered out.
   *
   * Return:
   *   An array SweObject. It is the responsibility of the caller to properly
   *   destroy all the objects of the list when they are not needed, by calling
  *    obj.destroy() on each of them.
   *
   */ SweObj.prototype.listObjs = function(obs, maxMag, filter) {
    let ret = [];
    g_ret = [];
    Module._module_list_objs2(this.v, obs.v, maxMag, 0, g_module_list_obj2);
    for (let i = 0; i < g_ret.length; i++) {
      let obj = new SweObj(g_ret[i]);
      if (filter(obj)) {
        obj.retain();
        ret.push(obj);
      }
    }
    return ret;
  };
  // XXX: deprecated.
  SweObj.prototype.getTree = function(detailed) {
    detailed = (detailed !== undefined) ? detailed : false;
    var cret = module_get_tree(this.v, detailed);
    var ret = Module.UTF8ToString(cret);
    Module._free(cret);
    ret = JSON.parse(ret);
    return ret;
  };
  /*
   * Function: computeVisibility
   *
   * Arguments:
   *   obs      - An observer.  If not set use current core observer.
   *   starTime - TT MJD starting time.  If not set use 12 hours before
   *              observer time.
   *   endTime  - TT MJD end time.  If not set use 12 hours after
   *              observer time.
   *
   * Return:
   *   A an array of dicts of the form:
   *   [{rise: <riseTime>, set: <setTime>}]
   *
   */ SweObj.prototype.computeVisibility = function(args) {
    args = args || {};
    var obs = args.obs || Module.core.observer;
    var startTime = args.startTime || obs.tt - 1 / 2;
    var endTime = args.endTime || obs.tt + 1 / 2;
    var precision = 1 / 24 / 60 / 2;
    var rise = Module._compute_event(obs.v, this.v, 1, startTime, endTime, precision) || null;
    var set = Module._compute_event(obs.v, this.v, 2, startTime, endTime, precision) || null;
    // Check if the object is never visible:
    if (rise === null && set === null) {
      var p = this.getInfo("radec", obs);
      p = Module.convertFrame(obs, "ICRF", "OBSERVED", p);
      if (p[2] < 0) return [];
    }
    return [ {
      "rise": rise,
      "set": set
    } ];
  };
  // Add id property
  Object.defineProperty(SweObj.prototype, "id", {
    get: function() {
      var ret = obj_get_id(this.v);
      if (ret) return ret;
      // XXX: fallback to first designation.  Should probably be removed!
      return this.designations()[0];
    }
  });
  // Add path property to the objects.
  Object.defineProperty(SweObj.prototype, "path", {
    get: function() {
      if (this.v === Module.core.v) return "core";
      var cret = module_get_path(this.v, Module.core.v);
      var ret = Module.UTF8ToString(cret);
      Module._free(cret);
      return "core." + ret;
    }
  });
  Object.defineProperty(SweObj.prototype, "jsonData", {
    get: function() {
      var cret = obj_get_json_data_str(this.v);
      var ret = Module.UTF8ToString(cret);
      Module._free(cret);
      return ret ? JSON.parse(ret) : undefined;
    }
  });
  // Add icrs, same as radec for the moment!
  Object.defineProperty(SweObj.prototype, "icrs", {
    get: function() {
      return this.radec;
    }
  });
  SweObj.prototype._call = function(attr, arg) {
    // Replace null and undefined to 0.
    if (arg === undefined || arg === null) arg = 0; else arg = JSON.stringify(arg);
    var cret = obj_call_json_str(this.v, attr, arg);
    var ret = Module.UTF8ToString(cret);
    Module._free(cret);
    if (!ret) return null;
    ret = JSON.parse(ret);
    if (!ret.swe_) return ret;
    if (ret.type === "obj") {
      let v = parseInt(ret.v);
      return v ? new SweObj(v) : null;
    }
    return ret.v;
  };
  SweObj.prototype.addDataSource = function(args) {
    var add_data_source = Module.cwrap("module_add_data_source", "number", [ "number", "string", "string" ]);
    add_data_source(this.v, args.url, args.key || 0);
  };
  Module["getModule"] = function(name) {
    var obj = core_get_module(name);
    return obj ? new SweObj(obj) : null;
  };
  // Return a child object by identifier.
  // Inputs:
  //  name      String
  Module["getObj"] = function(name) {
    assert(typeof (name) == "string");
    var obj = core_search(name);
    return obj ? new SweObj(obj) : null;
  };
  Module["change"] = function(callback, context) {
    g_listeners.push({
      "obj": null,
      "ctx": context ? context : null,
      "attr": null,
      "callback": callback
    });
  };
  Module["getTree"] = function(detailed) {
    return Module.core.getTree(detailed);
  };
  // Create a new layer.
  Module["createLayer"] = function(data) {
    return Module.core.add("layer", data);
  };
  // Conveniance function to convert a js string into an allocated C string.
  function stringToC(str) {
    let size = Module.lengthBytesUTF8(str);
    let ptr = Module._malloc(size + 1);
    // For speed, we only support ascii strings for the moment.
    Module.writeAsciiToMemory(str, ptr, false);
    return ptr;
  }
  // Create a new unparented object.
  Module["createObj"] = function(type, args) {
    // Don't use the emscripten wrapped version of obj_create_str, since
    // it seems to crash with large strings!
    args = args ? stringToC(JSON.stringify(args)) : 0;
    const ctype = stringToC(type);
    let ret = Module._obj_create_str(ctype, args);
    Module._free(type);
    Module._free(args);
    ret = ret ? new SweObj(ret) : null;
    // Add special geojson object methods.
    if (type === "geojson") Module.onGeojsonObj(ret);
    if (type === "geojson-survey") Module.onGeojsonSurveyObj(ret);
    return ret;
  };
  var onObjChanged = Module.addFunction(function(objPtr, attr) {
    attr = Module.UTF8ToString(attr);
    for (var i = 0; i < g_listeners.length; i++) {
      var listener = g_listeners[i];
      if ((listener.obj === null || listener.obj === objPtr) && (listener.attr === null || listener.attr === attr)) {
        var obj = new SweObj(objPtr);
        listener.callback.apply(listener.ctx, [ obj, attr ]);
      }
    }
  }, "vii");
  Module._module_add_global_listener(onObjChanged);
  // Add some convenience functions to access swe values directly as a
  // tree of attributes.
  Module["getTree"] = function() {
    // TODO: remove obj.getTree and only do it here.
    return Module.core.getTree();
  };
  Module["getValue"] = function(path) {
    var elems = path.split(".");
    var attr = elems.pop();
    var objPath = elems.join(".");
    let obj = Module.core[objPath] || Module.getModule("core." + objPath);
    var value = obj[attr];
    if (value && typeof (value) === "object" && value.swe_) value = value.v;
    return value;
  };
  Module["_setValue"] = Module.setValue;
  // So that we can still use it!
  Module["setValue"] = function(path, value) {
    var elems = path.split(".");
    var attr = elems.pop();
    var objPath = elems.join(".");
    let obj = Module.core[objPath] || Module.getModule("core." + objPath);
    obj[attr] = value;
  };
  Module["onValueChanged"] = function(callback) {
    Module.change(function(obj, attr) {
      var path = obj.path + "." + attr;
      var value = obj[attr];
      if (value && typeof (value) === "object" && value.swe_) value = value.v;
      path = path.substr(5);
      // Remove the initial 'core.'
      callback(path, value);
    });
  };
  // Just so that we can use SweObj in pre.js.
  Module["SweObj"] = SweObj;
});

// end include: src/js/obj.js
// include: src/js/geojson.js
/*
 * Stellarium Web Engine - Copyright (c) 2022 - Stellarium Labs SRL
 *
 * This program is licensed under the terms of the GNU AGPL v3, or
 * alternatively under a commercial licence.
 *
 * The terms of the AGPL v3 license can be found in the main directory of this
 * repository.
 */ // Some special methods for geojson objects.
//  setData   - fast way to set the geojson data.
//  filterAll - filter and change the properties of the geojson features.
function fillColorPtr(color, ptr) {
  Module._geojson_set_color_ptr_(ptr, color[0], color[1], color[2], color[3]);
}

function fillBoolPtr(value, ptr) {
  Module._geojson_set_bool_ptr_(ptr, value);
}

/*
 * Method: setData
 * Set the geojson data of a geojson object.
 *
 * This method is to be used for very fast geojson creation, by skipping
 * passing the geojson to the core as a string, and also skipping parsing
 * the geojson.
 *
 * For the moment we assume a simple geojson with only single ring polygons!
 */ function setData(obj, data) {
  Module._geojson_remove_all_features(obj.v);
  obj._features = data.features;
  // Keep it for the filter function.
  for (const feature of data.features) {
    const geo = feature.geometry;
    if (geo.type !== "Polygon") {
      console.error("Only support polygon geometry");
      continue;
    }
    if (geo.coordinates.length != 1) {
      console.error("Only support single ring polygons");
      continue;
    }
    const coordinates = geo.coordinates[0];
    const size = coordinates.length;
    const ptr = Module._malloc(size * 16);
    for (let i = 0; i < size; i++) {
      Module._setValue(ptr + i * 16 + 0, coordinates[i][0], "double");
      Module._setValue(ptr + i * 16 + 8, coordinates[i][1], "double");
    }
    Module._geojson_add_poly_feature(obj.v, size, ptr);
    Module._free(ptr);
  }
}

/*
 * Method: filterAll
 * Deprecated.
 *
 * Apply a filter function to all the features of the geojson.
 *
 * The callback function takes as input the index of a feature and
 * return a dict of values:
 *
 *      fill    - Array of 4 float values.
 *      stroke  - Array of 4 float values.
 *      visible - Boolean (default to true).
 *      blink   - Boolean
 *      hidden  - Boolean
 */ function filterAll(obj, callback) {
  const features = obj._features;
  const fn = Module.addFunction(function(idx, fillPtr, strokePtr) {
    const r = callback(idx, features[idx]);
    if (r === false) return 0;
    if (r === true) return 1;
    if (r.fill) fillColorPtr(r.fill, fillPtr);
    if (r.stroke) fillColorPtr(r.stroke, strokePtr);
    let ret = r.visible === false ? 0 : 1;
    if (r.blink === true) ret |= 2;
    return ret;
  }, "iiii");
  Module._geojson_filter_all(obj.v, fn);
  Module.removeFunction(fn);
}

function queryRenderedFeatureIds(obj, point) {
  if (typeof (point) === "object") {
    point = [ point.x, point.y ];
  }
  const pointPtr = Module._malloc(16);
  Module._setValue(pointPtr + 0, point[0], "double");
  Module._setValue(pointPtr + 8, point[1], "double");
  const size = 128;
  // Max number of results.
  const retPtr = Module._malloc(4 * size);
  const nb = Module._geojson_query_rendered_features(obj.v, pointPtr, size, retPtr);
  let ret = [];
  for (let i = 0; i < nb; i++) {
    ret.push(Module._getValue(retPtr + i * 4, "i32"));
  }
  Module._free(pointPtr);
  Module._free(retPtr);
  return ret;
}

Module["onGeojsonObj"] = function(obj) {
  /*
   * Experimental support for the 'filter' attribute of geojson objects.
   *
   * The special filter attribute can be set to a function that takes as
   * input the index of a feature and can return either:
   *
   *  - false, to hide the feature.
   *  - true, to show the feature unchanged.
   *  - A dict of values to change colors:
   *      fill    - Array of 4 float values.
   *      stroke  - Array of 4 float values.
   *      visible - Boolean (default to true).
   */ let filterFn = null;
  Object.defineProperty(obj, "filter", {
    set: function(filter) {
      if (filterFn) Module.removeFunction(filterFn);
      filterFn = Module.addFunction(function(img, id, fillPtr, strokePtr, blinkPtr, hiddenPtr) {
        const r = filter(id);
        if (r.fill) fillColorPtr(r.fill, fillPtr);
        if (r.stroke) fillColorPtr(r.stroke, strokePtr);
        if (r.stroke) fillColorPtr(r.stroke, strokePtr);
        if (r.blink !== undefined) fillBoolPtr(r.blink, blinkPtr);
        if (r.hidden !== undefined) fillBoolPtr(r.hidden, hiddenPtr);
      }, "viiiiii");
      obj._call("filter", filterFn);
    }
  });
  obj.setData = function(data) {
    setData(obj, data);
  };
  obj.filterAll = function(callback) {
    filterAll(obj, callback);
  };
  obj.queryRenderedFeatureIds = function(point) {
    return queryRenderedFeatureIds(obj, point);
  };
};

// Map of survey tile -> features list.
let g_tiles = {};

function asBox(box) {
  if (!(box instanceof Array)) {
    return [ [ box.x, box.y ], [ box.x, box.y ] ];
  }
  assert(box instanceof Array);
  return box.map(function(v) {
    if (!(v instanceof Array)) {
      return [ v.x, v.y ];
    }
    return v;
  });
}

function surveyQueryRenderedFeatures(obj, box) {
  box = asBox(box);
  const boxPtr = Module._malloc(32);
  Module._setValue(boxPtr + 0, box[0][0], "double");
  Module._setValue(boxPtr + 8, box[0][1], "double");
  Module._setValue(boxPtr + 16, box[1][0], "double");
  Module._setValue(boxPtr + 24, box[1][1], "double");
  const size = 1024;
  // Max number of results.
  const tilesPtr = Module._malloc(4 * size);
  const indexPtr = Module._malloc(4 * size);
  const nb = Module._geojson_survey_query_rendered_features(obj.v, boxPtr, size, tilesPtr, indexPtr);
  let ret = [];
  for (let i = 0; i < nb; i++) {
    const tile = Module._getValue(tilesPtr + i * 4, "i32*");
    const idx = Module._getValue(indexPtr + i * 4, "i32");
    ret.push(g_tiles[tile][idx]);
  }
  Module._free(boxPtr);
  Module._free(indexPtr);
  Module._free(tilesPtr);
  return ret;
}

// Called each time a new geojson tile of a survey is loaded.
let onNewTile = function(img, json) {
  json = Module.UTF8ToString(json);
  json = JSON.parse(json);
  g_tiles[img] = json.features;
};

let onNewTileSet = false;

/*
 * Same for Geojson surveys
 */ Module["onGeojsonSurveyObj"] = function(obj) {
  if (!onNewTileSet) {
    Module._geojson_set_on_new_tile_callback(Module.addFunction(onNewTile, "vii"));
    onNewTileSet = true;
  }
  Object.defineProperty(obj, "filter", {
    set: function(filter) {
      if (obj._filterFn) Module.removeFunction(obj._filterFn);
      obj._filterFn = Module.addFunction(function(img, id, fillPtr, strokePtr, blinkPtr, hiddenPtr) {
        let features = g_tiles[img];
        const r = filter(features[id]);
        if (r.fill) fillColorPtr(r.fill, fillPtr);
        if (r.stroke) fillColorPtr(r.stroke, strokePtr);
        if (r.blink !== undefined) fillBoolPtr(r.blink, blinkPtr);
        if (r.hidden !== undefined) fillBoolPtr(r.hidden, hiddenPtr);
      }, "viiiiii");
      obj._call("filter", obj._filterFn);
    }
  });
  obj.queryRenderedFeatures = function(point) {
    return surveyQueryRenderedFeatures(obj, point);
  };
};

// end include: src/js/geojson.js
// include: src/js/canvas.js
/* Stellarium Web Engine - Copyright (c) 2022 - Stellarium Labs SRL
 *
 * This program is licensed under the terms of the GNU AGPL v3, or
 * alternatively under a commercial licence.
 *
 * The terms of the AGPL v3 license can be found in the main directory of this
 * repository.
 */ Module.afterInit(function() {
  if (!Module.canvas) return;
  // XXX: remove this I guess.
  var mouseDown = false;
  var mouseButtons = 0;
  var mousePos;
  // Function called at each frame
  var render = function(timestamp) {
    if (mouseDown) Module._core_on_mouse(0, 1, mousePos.x, mousePos.y, mouseButtons);
    // Check for canvas resize
    var canvas = Module.canvas;
    // Get the device pixel ratio, falling back to 1.
    var dpr = window.devicePixelRatio || 1;
    // Get the size of the canvas in CSS pixels.
    var rect = canvas.getBoundingClientRect();
    var displayWidth = rect.width;
    var displayHeight = rect.height;
    var sizeChanged = (canvas.width !== displayWidth) || (canvas.height !== displayHeight);
    if (sizeChanged) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }
    // TODO: manage paning and flicking here
    Module._core_update();
    Module._core_render(displayWidth, displayHeight, dpr);
    window.requestAnimationFrame(render);
  };
  var fixPageXY = function(e) {
    if (e.pageX == null && e.clientX != null) {
      var html = document.documentElement;
      var body = document.body;
      e.pageX = e.clientX + (html.scrollLeft || body && body.scrollLeft || 0);
      e.pageX -= html.clientLeft || 0;
      e.pageY = e.clientY + (html.scrollTop || body && body.scrollTop || 0);
      e.pageY -= html.clientTop || 0;
    }
  };
  var setupMouse = function() {
    var canvas = Module.canvas;
    function getMousePos(evt) {
      var rect = canvas.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
      };
    }
    canvas.addEventListener("mousedown", function(e) {
      var that = this;
      e = e || event;
      fixPageXY(e);
      mouseDown = true;
      mousePos = getMousePos(e);
      mouseButtons = e.buttons;
      document.onmouseup = function(e) {
        e = e || event;
        fixPageXY(e);
        mouseDown = false;
        mousePos = getMousePos(e);
        Module._core_on_mouse(0, 0, mousePos.x, mousePos.y, mouseButtons);
      };
      document.onmouseleave = function(e) {
        mouseDown = false;
      };
      document.onmousemove = function(e) {
        e = e || event;
        fixPageXY(e);
        mousePos = getMousePos(e);
      };
    });
    canvas.addEventListener("touchstart", function(e) {
      var rect = canvas.getBoundingClientRect();
      for (var i = 0; i < e.changedTouches.length; i++) {
        var id = e.changedTouches[i].identifier;
        var relX = e.changedTouches[i].pageX - rect.left;
        var relY = e.changedTouches[i].pageY - rect.top;
        Module._core_on_mouse(id, 1, relX, relY, 1);
      }
    }, {
      passive: true
    });
    canvas.addEventListener("touchmove", function(e) {
      e.preventDefault();
      var rect = canvas.getBoundingClientRect();
      for (var i = 0; i < e.changedTouches.length; i++) {
        var id = e.changedTouches[i].identifier;
        var relX = e.changedTouches[i].pageX - rect.left;
        var relY = e.changedTouches[i].pageY - rect.top;
        Module._core_on_mouse(id, -1, relX, relY, 1);
      }
    }, {
      passive: false
    });
    canvas.addEventListener("touchend", function(e) {
      var rect = canvas.getBoundingClientRect();
      for (var i = 0; i < e.changedTouches.length; i++) {
        var id = e.changedTouches[i].identifier;
        var relX = e.changedTouches[i].pageX - rect.left;
        var relY = e.changedTouches[i].pageY - rect.top;
        Module._core_on_mouse(id, 0, relX, relY, 1);
      }
    });
    function getMouseWheelDelta(event) {
      var delta = 0;
      switch (event.type) {
       case "DOMMouseScroll":
        delta = -event.detail;
        break;

       case "mousewheel":
        delta = event.wheelDelta / 120;
        break;

       default:
        throw "unrecognized mouse wheel event: " + event.type;
      }
      return delta;
    }
    var onWheelEvent = function(e) {
      e.preventDefault();
      fixPageXY(e);
      var pos = getMousePos(e);
      var zoom_factor = 1.05;
      var delta = getMouseWheelDelta(e) * 2;
      Module._core_on_zoom(Math.pow(zoom_factor, delta), pos.x, pos.y);
      return false;
    };
    canvas.addEventListener("mousewheel", onWheelEvent, {
      passive: false
    });
    canvas.addEventListener("DOMMouseScroll", onWheelEvent, {
      passive: false
    });
    canvas.oncontextmenu = function(e) {
      e.preventDefault();
      e.stopPropagation();
    };
  };
  setupMouse();
  // Kickoff rendering at max FPS, normally 60 FPS on a browser.
  window.requestAnimationFrame(render);
});

// end include: src/js/canvas.js
var arguments_ = [];

var thisProgram = "./this.program";

var quit_ = (status, toThrow) => {
  throw toThrow;
};

if (typeof __filename != "undefined") {
  // Node
  _scriptName = __filename;
} else if (ENVIRONMENT_IS_WORKER) {
  _scriptName = self.location.href;
}

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = "";

function locateFile(path) {
  if (Module["locateFile"]) {
    return Module["locateFile"](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var readAsync, readBinary;

if (ENVIRONMENT_IS_NODE) {
  const isNode = globalThis.process?.versions?.node && globalThis.process?.type != "renderer";
  if (!isNode) throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
  // These modules will usually be used on Node.js. Load them eagerly to avoid
  // the complexity of lazy-loading.
  var fs = require("node:fs");
  scriptDirectory = __dirname + "/";
  // include: node_shell_read.js
  readBinary = filename => {
    // We need to re-wrap `file://` strings to URLs.
    filename = isFileURI(filename) ? new URL(filename) : filename;
    var ret = fs.readFileSync(filename);
    assert(Buffer.isBuffer(ret));
    return ret;
  };
  readAsync = async (filename, binary = true) => {
    // See the comment in the `readBinary` function.
    filename = isFileURI(filename) ? new URL(filename) : filename;
    var ret = fs.readFileSync(filename, binary ? undefined : "utf8");
    assert(binary ? Buffer.isBuffer(ret) : typeof ret == "string");
    return ret;
  };
  // end include: node_shell_read.js
  if (process.argv.length > 1) {
    thisProgram = process.argv[1].replace(/\\/g, "/");
  }
  arguments_ = process.argv.slice(2);
  quit_ = (status, toThrow) => {
    process.exitCode = status;
    throw toThrow;
  };
} else if (ENVIRONMENT_IS_SHELL) {} else // Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  try {
    scriptDirectory = new URL(".", _scriptName).href;
  } catch {}
  if (!(globalThis.window || globalThis.WorkerGlobalScope)) throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
  {
    // include: web_or_worker_shell_read.js
    if (ENVIRONMENT_IS_WORKER) {
      readBinary = url => {
        var xhr = new XMLHttpRequest;
        xhr.open("GET", url, false);
        xhr.responseType = "arraybuffer";
        xhr.send(null);
        return new Uint8Array(/** @type{!ArrayBuffer} */ (xhr.response));
      };
    }
    readAsync = async url => {
      // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
      // See https://github.com/github/fetch/pull/92#issuecomment-140665932
      // Cordova or Electron apps are typically loaded from a file:// url.
      // So use XHR on webview if URL is a file URL.
      if (isFileURI(url)) {
        return new Promise((resolve, reject) => {
          var xhr = new XMLHttpRequest;
          xhr.open("GET", url, true);
          xhr.responseType = "arraybuffer";
          xhr.onload = () => {
            if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
              // file URLs can return 0
              resolve(xhr.response);
              return;
            }
            reject(xhr.status);
          };
          xhr.onerror = reject;
          xhr.send(null);
        });
      }
      var response = await fetch(url, {
        credentials: "same-origin"
      });
      if (response.ok) {
        return response.arrayBuffer();
      }
      throw new Error(response.status + " : " + response.url);
    };
  }
} else {
  throw new Error("environment detection error");
}

var out = console.log.bind(console);

var err = console.error.bind(console);

// perform assertions in shell.js after we set up out() and err(), as otherwise
// if an assertion fails it cannot print the message
assert(!ENVIRONMENT_IS_SHELL, "shell environment detected but not enabled at build time.  Add `shell` to `-sENVIRONMENT` to enable.");

// end include: shell.js
// include: preamble.js
// === Preamble library stuff ===
// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html
var wasmBinary;

if (!globalThis.WebAssembly) {
  err("no native wasm support detected");
}

// Wasm globals
//========================================
// Runtime essentials
//========================================
// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

// In STRICT mode, we only define assert() when ASSERTIONS is set.  i.e. we
// don't define it at all in release modes.  This matches the behaviour of
// MINIMAL_RUNTIME.
// TODO(sbc): Make this the default even without STRICT enabled.
/** @type {function(*, string=)} */ function assert(condition, text) {
  if (!condition) {
    abort("Assertion failed" + (text ? ": " + text : ""));
  }
}

// We used to include malloc/free by default in the past. Show a helpful error in
// builds with assertions.
/**
 * Indicates whether filename is delivered via file protocol (as opposed to http/https)
 * @noinline
 */ var isFileURI = filename => filename.startsWith("file://");

// include: runtime_common.js
// include: runtime_stack_check.js
// Initializes the stack cookie. Called at the startup of main and at the startup of each thread in pthreads mode.
function writeStackCookie() {
  var max = _emscripten_stack_get_end();
  assert((max & 3) == 0);
  // If the stack ends at address zero we write our cookies 4 bytes into the
  // stack.  This prevents interference with SAFE_HEAP and ASAN which also
  // monitor writes to address zero.
  if (max == 0) {
    max += 4;
  }
  // The stack grow downwards towards _emscripten_stack_get_end.
  // We write cookies to the final two words in the stack and detect if they are
  // ever overwritten.
  HEAPU32[SAFE_HEAP_INDEX(HEAPU32, ((max) >> 2), "storing")] = 34821223;
  HEAPU32[SAFE_HEAP_INDEX(HEAPU32, (((max) + (4)) >> 2), "storing")] = 2310721022;
}

function checkStackCookie() {
  if (ABORT) return;
  var max = _emscripten_stack_get_end();
  // See writeStackCookie().
  if (max == 0) {
    max += 4;
  }
  var cookie1 = HEAPU32[SAFE_HEAP_INDEX(HEAPU32, ((max) >> 2), "loading")];
  var cookie2 = HEAPU32[SAFE_HEAP_INDEX(HEAPU32, (((max) + (4)) >> 2), "loading")];
  if (cookie1 != 34821223 || cookie2 != 2310721022) {
    abort(`Stack overflow! Stack cookie has been overwritten at ${ptrToString(max)}, expected hex dwords 0x89BACDFE and 0x2135467, but received ${ptrToString(cookie2)} ${ptrToString(cookie1)}`);
  }
}

// end include: runtime_stack_check.js
// include: runtime_exceptions.js
// end include: runtime_exceptions.js
// include: runtime_debug.js
var runtimeDebug = true;

// Endianness check
(() => {
  var h16 = new Int16Array(1);
  var h8 = new Int8Array(h16.buffer);
  h16[0] = 25459;
  if (h8[0] !== 115 || h8[1] !== 99) abort("Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)");
})();

function consumedModuleProp(prop) {
  if (!Object.getOwnPropertyDescriptor(Module, prop)) {
    Object.defineProperty(Module, prop, {
      configurable: true,
      set() {
        abort(`Attempt to set \`Module.${prop}\` after it has already been processed.  This can happen, for example, when code is injected via '--post-js' rather than '--pre-js'`);
      }
    });
  }
}

function makeInvalidEarlyAccess(name) {
  return () => assert(false, `call to '${name}' via reference taken before Wasm module initialization`);
}

function ignoredModuleProp(prop) {
  if (Object.getOwnPropertyDescriptor(Module, prop)) {
    abort(`\`Module.${prop}\` was supplied but \`${prop}\` not included in INCOMING_MODULE_JS_API`);
  }
}

// forcing the filesystem exports a few things by default
function isExportedByForceFilesystem(name) {
  return name === "FS_createPath" || name === "FS_createDataFile" || name === "FS_createPreloadedFile" || name === "FS_preloadFile" || name === "FS_unlink" || name === "addRunDependency" || // The old FS has some functionality that WasmFS lacks.
  name === "FS_createLazyFile" || name === "FS_createDevice" || name === "removeRunDependency";
}

function missingLibrarySymbol(sym) {
  // Any symbol that is not included from the JS library is also (by definition)
  // not exported on the Module object.
  unexportedRuntimeSymbol(sym);
}

function unexportedRuntimeSymbol(sym) {
  if (!Object.getOwnPropertyDescriptor(Module, sym)) {
    Object.defineProperty(Module, sym, {
      configurable: true,
      get() {
        var msg = `'${sym}' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the Emscripten FAQ)`;
        if (isExportedByForceFilesystem(sym)) {
          msg += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you";
        }
        abort(msg);
      }
    });
  }
}

// end include: runtime_debug.js
// include: runtime_safe_heap.js
function SAFE_HEAP_INDEX(arr, idx, action) {
  const bytes = arr.BYTES_PER_ELEMENT;
  const dest = idx * bytes;
  if (idx <= 0) abort(`segmentation fault ${action} ${bytes} bytes at address ${dest}`);
  if (runtimeInitialized) {
    var brk = _sbrk(0);
    if (dest + bytes > brk) abort(`segmentation fault, exceeded the top of the available dynamic heap when ${action} ${bytes} bytes at address ${dest}. DYNAMICTOP=${brk}`);
    if (brk < _emscripten_stack_get_base()) abort(`brk >= _emscripten_stack_get_base() (brk=${brk}, _emscripten_stack_get_base()=${_emscripten_stack_get_base()})`);
    // sbrk-managed memory must be above the stack
    if (brk > wasmMemory.buffer.byteLength) abort(`brk <= wasmMemory.buffer.byteLength (brk=${brk}, wasmMemory.buffer.byteLength=${wasmMemory.buffer.byteLength})`);
  }
  return idx;
}

function segfault() {
  abort("segmentation fault");
}

function alignfault() {
  abort("alignment fault");
}

// end include: runtime_safe_heap.js
var readyPromiseResolve, readyPromiseReject;

// Memory management
var runtimeInitialized = false;

function updateMemoryViews() {
  var b = wasmMemory.buffer;
  HEAP8 = new Int8Array(b);
  HEAP16 = new Int16Array(b);
  HEAPU8 = new Uint8Array(b);
  HEAPU16 = new Uint16Array(b);
  HEAP32 = new Int32Array(b);
  HEAPU32 = new Uint32Array(b);
  HEAPF32 = new Float32Array(b);
  HEAPF64 = new Float64Array(b);
  HEAP64 = new BigInt64Array(b);
  HEAPU64 = new BigUint64Array(b);
}

// include: memoryprofiler.js
// end include: memoryprofiler.js
// end include: runtime_common.js
assert(globalThis.Int32Array && globalThis.Float64Array && Int32Array.prototype.subarray && Int32Array.prototype.set, "JS engine does not provide full typed array support");

function preRun() {
  if (Module["preRun"]) {
    if (typeof Module["preRun"] == "function") Module["preRun"] = [ Module["preRun"] ];
    while (Module["preRun"].length) {
      addOnPreRun(Module["preRun"].shift());
    }
  }
  consumedModuleProp("preRun");
  // Begin ATPRERUNS hooks
  callRuntimeCallbacks(onPreRuns);
}

function initRuntime() {
  assert(!runtimeInitialized);
  runtimeInitialized = true;
  checkStackCookie();
  // No ATINITS hooks
  wasmExports["__wasm_call_ctors"]();
}

function postRun() {
  checkStackCookie();
  // PThreads reuse the runtime from the main thread.
  if (Module["postRun"]) {
    if (typeof Module["postRun"] == "function") Module["postRun"] = [ Module["postRun"] ];
    while (Module["postRun"].length) {
      addOnPostRun(Module["postRun"].shift());
    }
  }
  consumedModuleProp("postRun");
  // Begin ATPOSTRUNS hooks
  callRuntimeCallbacks(onPostRuns);
}

/** @param {string|number=} what */ function abort(what) {
  Module["onAbort"]?.(what);
  what = "Aborted(" + what + ")";
  // TODO(sbc): Should we remove printing and leave it up to whoever
  // catches the exception?
  err(what);
  ABORT = true;
  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  // FIXME This approach does not work in Wasm EH because it currently does not assume
  // all RuntimeErrors are from traps; it decides whether a RuntimeError is from
  // a trap or not based on a hidden field within the object. So at the moment
  // we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
  // allows this in the wasm spec.
  // Suppress closure compiler warning here. Closure compiler's builtin extern
  // definition for WebAssembly.RuntimeError claims it takes no arguments even
  // though it can.
  // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
  /** @suppress {checkTypes} */ var e = new WebAssembly.RuntimeError(what);
  readyPromiseReject?.(e);
  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

// show errors on likely calls to FS when it was not included
var FS = {
  error() {
    abort("Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with -sFORCE_FILESYSTEM");
  },
  init() {
    FS.error();
  },
  createDataFile() {
    FS.error();
  },
  createPreloadedFile() {
    FS.error();
  },
  createLazyFile() {
    FS.error();
  },
  open() {
    FS.error();
  },
  mkdev() {
    FS.error();
  },
  registerDevice() {
    FS.error();
  },
  analyzePath() {
    FS.error();
  },
  ErrnoError() {
    FS.error();
  }
};

function createExportWrapper(name, nargs) {
  return (...args) => {
    assert(runtimeInitialized, `native function \`${name}\` called before runtime initialization`);
    var f = wasmExports[name];
    assert(f, `exported native function \`${name}\` not found`);
    // Only assert for too many arguments. Too few can be valid since the missing arguments will be zero filled.
    assert(args.length <= nargs, `native function \`${name}\` called with ${args.length} args but expects ${nargs}`);
    return f(...args);
  };
}

var wasmBinaryFile;

function findWasmBinary() {
  return locateFile("stellarium-web-engine.wasm");
}

function getBinarySync(file) {
  if (file == wasmBinaryFile && wasmBinary) {
    return new Uint8Array(wasmBinary);
  }
  if (readBinary) {
    return readBinary(file);
  }
  // Throwing a plain string here, even though it not normally advisable since
  // this gets turning into an `abort` in instantiateArrayBuffer.
  throw "both async and sync fetching of the wasm failed";
}

async function getWasmBinary(binaryFile) {
  // If we don't have the binary yet, load it asynchronously using readAsync.
  if (!wasmBinary) {
    // Fetch the binary using readAsync
    try {
      var response = await readAsync(binaryFile);
      return new Uint8Array(response);
    } catch {}
  }
  // Otherwise, getBinarySync should be able to get it synchronously
  return getBinarySync(binaryFile);
}

async function instantiateArrayBuffer(binaryFile, imports) {
  try {
    var binary = await getWasmBinary(binaryFile);
    var instance = await WebAssembly.instantiate(binary, imports);
    return instance;
  } catch (reason) {
    err(`failed to asynchronously prepare wasm: ${reason}`);
    // Warn on some common problems.
    if (isFileURI(binaryFile)) {
      err(`warning: Loading from a file URI (${binaryFile}) is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing`);
    }
    abort(reason);
  }
}

async function instantiateAsync(binary, binaryFile, imports) {
  if (!binary && !isFileURI(binaryFile) && !ENVIRONMENT_IS_NODE) {
    try {
      var response = fetch(binaryFile, {
        credentials: "same-origin"
      });
      var instantiationResult = await WebAssembly.instantiateStreaming(response, imports);
      return instantiationResult;
    } catch (reason) {
      // We expect the most common failure cause to be a bad MIME type for the binary,
      // in which case falling back to ArrayBuffer instantiation should work.
      err(`wasm streaming compile failed: ${reason}`);
      err("falling back to ArrayBuffer instantiation");
    }
  }
  return instantiateArrayBuffer(binaryFile, imports);
}

function getWasmImports() {
  // prepare imports
  var imports = {
    "env": wasmImports,
    "wasi_snapshot_preview1": wasmImports
  };
  return imports;
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
async function createWasm() {
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  /** @param {WebAssembly.Module=} module*/ function receiveInstance(instance, module) {
    wasmExports = instance.exports;
    assignWasmExports(wasmExports);
    updateMemoryViews();
    return wasmExports;
  }
  // Prefer streaming instantiation if available.
  // Async compilation can be confusing when an error on the page overwrites Module
  // (for example, if the order of elements is wrong, and the one defining Module is
  // later), so we save Module and check it later.
  var trueModule = Module;
  function receiveInstantiationResult(result) {
    // 'result' is a ResultObject object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    assert(Module === trueModule, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");
    trueModule = null;
    // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
    // When the regression is fixed, can restore the above PTHREADS-enabled path.
    return receiveInstance(result["instance"]);
  }
  var info = getWasmImports();
  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to
  // run the instantiation parallel to any other async startup actions they are
  // performing.
  // Also pthreads and wasm workers initialize the wasm instance through this
  // path.
  if (Module["instantiateWasm"]) {
    return new Promise((resolve, reject) => {
      try {
        Module["instantiateWasm"](info, (inst, mod) => {
          resolve(receiveInstance(inst, mod));
        });
      } catch (e) {
        err(`Module.instantiateWasm callback failed with error: ${e}`);
        reject(e);
      }
    });
  }
  wasmBinaryFile ??= findWasmBinary();
  var result = await instantiateAsync(wasmBinary, wasmBinaryFile, info);
  var exports = receiveInstantiationResult(result);
  return exports;
}

// end include: preamble.js
// Begin JS library code
class ExitStatus {
  name="ExitStatus";
  constructor(status) {
    this.message = `Program terminated with exit(${status})`;
    this.status = status;
  }
}

/** @type {!Int16Array} */ var HEAP16;

/** @type {!Int32Array} */ var HEAP32;

/** not-@type {!BigInt64Array} */ var HEAP64;

/** @type {!Int8Array} */ var HEAP8;

/** @type {!Float32Array} */ var HEAPF32;

/** @type {!Float64Array} */ var HEAPF64;

/** @type {!Uint16Array} */ var HEAPU16;

/** @type {!Uint32Array} */ var HEAPU32;

/** not-@type {!BigUint64Array} */ var HEAPU64;

/** @type {!Uint8Array} */ var HEAPU8;

var callRuntimeCallbacks = callbacks => {
  while (callbacks.length > 0) {
    // Pass the module as the first argument.
    callbacks.shift()(Module);
  }
};

var onPostRuns = [];

var addOnPostRun = cb => onPostRuns.push(cb);

var onPreRuns = [];

var addOnPreRun = cb => onPreRuns.push(cb);

/**
   * @param {number} ptr
   * @param {string} type
   */ function getValue(ptr, type = "i8") {
  if (type.endsWith("*")) type = "*";
  switch (type) {
   case "i1":
    return HEAP8[SAFE_HEAP_INDEX(HEAP8, ptr, "loading")];

   case "i8":
    return HEAP8[SAFE_HEAP_INDEX(HEAP8, ptr, "loading")];

   case "i16":
    return HEAP16[SAFE_HEAP_INDEX(HEAP16, ((ptr) >> 1), "loading")];

   case "i32":
    return HEAP32[SAFE_HEAP_INDEX(HEAP32, ((ptr) >> 2), "loading")];

   case "i64":
    return HEAP64[SAFE_HEAP_INDEX(HEAP64, ((ptr) >> 3), "loading")];

   case "float":
    return HEAPF32[SAFE_HEAP_INDEX(HEAPF32, ((ptr) >> 2), "loading")];

   case "double":
    return HEAPF64[SAFE_HEAP_INDEX(HEAPF64, ((ptr) >> 3), "loading")];

   case "*":
    return HEAPU32[SAFE_HEAP_INDEX(HEAPU32, ((ptr) >> 2), "loading")];

   default:
    abort(`invalid type for getValue: ${type}`);
  }
}

var noExitRuntime = true;

function ptrToString(ptr) {
  assert(typeof ptr === "number", `ptrToString expects a number, got ${typeof ptr}`);
  // Convert to 32-bit unsigned value
  ptr >>>= 0;
  return "0x" + ptr.toString(16).padStart(8, "0");
}

/**
   * @param {number} ptr
   * @param {number} value
   * @param {string} type
   */ function setValue(ptr, value, type = "i8") {
  if (type.endsWith("*")) type = "*";
  switch (type) {
   case "i1":
    HEAP8[SAFE_HEAP_INDEX(HEAP8, ptr, "storing")] = value;
    break;

   case "i8":
    HEAP8[SAFE_HEAP_INDEX(HEAP8, ptr, "storing")] = value;
    break;

   case "i16":
    HEAP16[SAFE_HEAP_INDEX(HEAP16, ((ptr) >> 1), "storing")] = value;
    break;

   case "i32":
    HEAP32[SAFE_HEAP_INDEX(HEAP32, ((ptr) >> 2), "storing")] = value;
    break;

   case "i64":
    HEAP64[SAFE_HEAP_INDEX(HEAP64, ((ptr) >> 3), "storing")] = BigInt(value);
    break;

   case "float":
    HEAPF32[SAFE_HEAP_INDEX(HEAPF32, ((ptr) >> 2), "storing")] = value;
    break;

   case "double":
    HEAPF64[SAFE_HEAP_INDEX(HEAPF64, ((ptr) >> 3), "storing")] = value;
    break;

   case "*":
    HEAPU32[SAFE_HEAP_INDEX(HEAPU32, ((ptr) >> 2), "storing")] = value;
    break;

   default:
    abort(`invalid type for setValue: ${type}`);
  }
}

var stackRestore = val => __emscripten_stack_restore(val);

var stackSave = () => _emscripten_stack_get_current();

var warnOnce = text => {
  warnOnce.shown ||= {};
  if (!warnOnce.shown[text]) {
    warnOnce.shown[text] = 1;
    if (ENVIRONMENT_IS_NODE) text = "warning: " + text;
    err(text);
  }
};

var UTF8Decoder = globalThis.TextDecoder && new TextDecoder;

var findStringEnd = (heapOrArray, idx, maxBytesToRead, ignoreNul) => {
  var maxIdx = idx + maxBytesToRead;
  if (ignoreNul) return maxIdx;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on
  // null terminator by itself.
  // As a tiny code save trick, compare idx against maxIdx using a negation,
  // so that maxBytesToRead=undefined/NaN means Infinity.
  while (heapOrArray[idx] && !(idx >= maxIdx)) ++idx;
  return idx;
};

/**
   * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
   * array that contains uint8 values, returns a copy of that string as a
   * Javascript String object.
   * heapOrArray is either a regular array, or a JavaScript typed array view.
   * @param {number=} idx
   * @param {number=} maxBytesToRead
   * @param {boolean=} ignoreNul - If true, the function will not stop on a NUL character.
   * @return {string}
   */ var UTF8ArrayToString = (heapOrArray, idx = 0, maxBytesToRead, ignoreNul) => {
  var endPtr = findStringEnd(heapOrArray, idx, maxBytesToRead, ignoreNul);
  // When using conditional TextDecoder, skip it for short strings as the overhead of the native call is not worth it.
  if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
    return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
  }
  var str = "";
  while (idx < endPtr) {
    // For UTF8 byte structure, see:
    // http://en.wikipedia.org/wiki/UTF-8#Description
    // https://www.ietf.org/rfc/rfc2279.txt
    // https://tools.ietf.org/html/rfc3629
    var u0 = heapOrArray[idx++];
    if (!(u0 & 128)) {
      str += String.fromCharCode(u0);
      continue;
    }
    var u1 = heapOrArray[idx++] & 63;
    if ((u0 & 224) == 192) {
      str += String.fromCharCode(((u0 & 31) << 6) | u1);
      continue;
    }
    var u2 = heapOrArray[idx++] & 63;
    if ((u0 & 240) == 224) {
      u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
    } else {
      if ((u0 & 248) != 240) warnOnce("Invalid UTF-8 leading byte " + ptrToString(u0) + " encountered when deserializing a UTF-8 string in wasm memory to a JS string!");
      u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
    }
    if (u0 < 65536) {
      str += String.fromCharCode(u0);
    } else {
      var ch = u0 - 65536;
      str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
    }
  }
  return str;
};

/**
   * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
   * emscripten HEAP, returns a copy of that string as a Javascript String object.
   *
   * @param {number} ptr
   * @param {number=} maxBytesToRead - An optional length that specifies the
   *   maximum number of bytes to read. You can omit this parameter to scan the
   *   string until the first 0 byte. If maxBytesToRead is passed, and the string
   *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
   *   string will cut short at that byte index.
   * @param {boolean=} ignoreNul - If true, the function will not stop on a NUL character.
   * @return {string}
   */ var UTF8ToString = (ptr, maxBytesToRead, ignoreNul) => {
  assert(typeof ptr == "number", `UTF8ToString expects a number (got ${typeof ptr})`);
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead, ignoreNul) : "";
};

var ___assert_fail = (condition, filename, line, func) => abort(`Assertion failed: ${UTF8ToString(condition)}, at: ` + [ filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function" ]);

var __abort_js = () => abort("native code called abort()");

var __emscripten_throw_longjmp = () => {
  throw Infinity;
};

var wget = {
  wgetRequests: {},
  nextWgetRequestHandle: 0,
  getNextWgetRequestHandle() {
    var handle = wget.nextWgetRequestHandle;
    wget.nextWgetRequestHandle++;
    return handle;
  }
};

var _emscripten_async_wget2_abort = handle => {
  var http = wget.wgetRequests[handle];
  http?.abort();
};

var lengthBytesUTF8 = str => {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
    // unit, not a Unicode code point of the character! So decode
    // UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var c = str.charCodeAt(i);
    // possibly a lead surrogate
    if (c <= 127) {
      len++;
    } else if (c <= 2047) {
      len += 2;
    } else if (c >= 55296 && c <= 57343) {
      len += 4;
      ++i;
    } else {
      len += 3;
    }
  }
  return len;
};

var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
  assert(typeof str === "string", `stringToUTF8Array expects a string (got ${typeof str})`);
  // Parameter maxBytesToWrite is not optional. Negative values, 0, null,
  // undefined and false each don't write out any bytes.
  if (!(maxBytesToWrite > 0)) return 0;
  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1;
  // -1 for string null terminator.
  for (var i = 0; i < str.length; ++i) {
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description
    // and https://www.ietf.org/rfc/rfc2279.txt
    // and https://tools.ietf.org/html/rfc3629
    var u = str.codePointAt(i);
    if (u <= 127) {
      if (outIdx >= endIdx) break;
      heap[outIdx++] = u;
    } else if (u <= 2047) {
      if (outIdx + 1 >= endIdx) break;
      heap[outIdx++] = 192 | (u >> 6);
      heap[outIdx++] = 128 | (u & 63);
    } else if (u <= 65535) {
      if (outIdx + 2 >= endIdx) break;
      heap[outIdx++] = 224 | (u >> 12);
      heap[outIdx++] = 128 | ((u >> 6) & 63);
      heap[outIdx++] = 128 | (u & 63);
    } else {
      if (outIdx + 3 >= endIdx) break;
      if (u > 1114111) warnOnce("Invalid Unicode code point " + ptrToString(u) + " encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).");
      heap[outIdx++] = 240 | (u >> 18);
      heap[outIdx++] = 128 | ((u >> 12) & 63);
      heap[outIdx++] = 128 | ((u >> 6) & 63);
      heap[outIdx++] = 128 | (u & 63);
      // Gotcha: if codePoint is over 0xFFFF, it is represented as a surrogate pair in UTF-16.
      // We need to manually skip over the second code unit for correct iteration.
      i++;
    }
  }
  // Null-terminate the pointer to the buffer.
  heap[outIdx] = 0;
  return outIdx - startIdx;
};

var stringToUTF8 = (str, outPtr, maxBytesToWrite) => {
  assert(typeof maxBytesToWrite == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
  return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
};

var stackAlloc = sz => __emscripten_stack_alloc(sz);

var stringToUTF8OnStack = str => {
  var size = lengthBytesUTF8(str) + 1;
  var ret = stackAlloc(size);
  stringToUTF8(str, ret, size);
  return ret;
};

var wasmTableMirror = [];

var getWasmTableEntry = funcPtr => {
  var func = wasmTableMirror[funcPtr];
  if (!func) {
    /** @suppress {checkTypes} */ wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
  }
  /** @suppress {checkTypes} */ assert(wasmTable.get(funcPtr) == func, "JavaScript-side Wasm function table mirror is out of date!");
  return func;
};

var _emscripten_async_wget2_data = (url, request, param, userdata, free, onload, onerror, onprogress) => {
  var _url = UTF8ToString(url);
  var _request = UTF8ToString(request);
  var _param = UTF8ToString(param);
  var http = new XMLHttpRequest;
  http.open(_request, _url, true);
  http.responseType = "arraybuffer";
  var handle = wget.getNextWgetRequestHandle();
  function onerrorjs() {
    if (onerror) {
      var sp = stackSave();
      var statusText = 0;
      if (http.statusText) {
        statusText = stringToUTF8OnStack(http.statusText);
      }
      getWasmTableEntry(onerror)(handle, userdata, http.status, statusText);
      stackRestore(sp);
    }
  }
  // LOAD
  http.onload = e => {
    if (http.status >= 200 && http.status < 300 || (http.status === 0 && _url.slice(0, 4).toLowerCase() != "http")) {
      var byteArray = new Uint8Array(/** @type{ArrayBuffer} */ (http.response));
      var buffer = _malloc(byteArray.length);
      HEAPU8.set(byteArray, buffer);
      if (onload) getWasmTableEntry(onload)(handle, userdata, buffer, byteArray.length);
      if (free) _free(buffer);
    } else {
      onerrorjs();
    }
    delete wget.wgetRequests[handle];
  };
  // ERROR
  http.onerror = e => {
    onerrorjs();
    delete wget.wgetRequests[handle];
  };
  // PROGRESS
  http.onprogress = e => {
    if (onprogress) getWasmTableEntry(onprogress)(handle, userdata, e.loaded, e.lengthComputable || e.lengthComputable === undefined ? e.total : 0);
  };
  // ABORT
  http.onabort = e => {
    delete wget.wgetRequests[handle];
  };
  if (_request == "POST") {
    // Send the proper header information along with the request
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    http.send(_param);
  } else {
    http.send(null);
  }
  wget.wgetRequests[handle] = http;
  return handle;
};

var _emscripten_date_now = () => Date.now();

var getHeapMax = () => // Stay one Wasm page short of 4GB: while e.g. Chrome is able to allocate
// full 4GB Wasm memories, the size will wrap back to 0 bytes in Wasm side
// for any code that deals with heap sizes, which would require special
// casing all heap size related code to treat 0 specially.
2147483648;

var alignMemory = (size, alignment) => {
  assert(alignment, "alignment argument is required");
  return Math.ceil(size / alignment) * alignment;
};

var growMemory = size => {
  var oldHeapSize = wasmMemory.buffer.byteLength;
  var pages = ((size - oldHeapSize + 65535) / 65536) | 0;
  try {
    // round size grow request up to wasm page size (fixed 64KB per spec)
    wasmMemory.grow(pages);
    // .grow() takes a delta compared to the previous size
    updateMemoryViews();
    return 1;
  } catch (e) {
    err(`growMemory: Attempted to grow heap from ${oldHeapSize} bytes to ${size} bytes, but got error: ${e}`);
  }
};

var _emscripten_resize_heap = requestedSize => {
  var oldSize = HEAPU8.length;
  // With CAN_ADDRESS_2GB or MEMORY64, pointers are already unsigned.
  requestedSize >>>= 0;
  // With multithreaded builds, races can happen (another thread might increase the size
  // in between), so return a failure, and let the caller retry.
  assert(requestedSize > oldSize);
  // Memory resize rules:
  // 1.  Always increase heap size to at least the requested size, rounded up
  //     to next page multiple.
  // 2a. If MEMORY_GROWTH_LINEAR_STEP == -1, excessively resize the heap
  //     geometrically: increase the heap size according to
  //     MEMORY_GROWTH_GEOMETRIC_STEP factor (default +20%), At most
  //     overreserve by MEMORY_GROWTH_GEOMETRIC_CAP bytes (default 96MB).
  // 2b. If MEMORY_GROWTH_LINEAR_STEP != -1, excessively resize the heap
  //     linearly: increase the heap size by at least
  //     MEMORY_GROWTH_LINEAR_STEP bytes.
  // 3.  Max size for the heap is capped at 2048MB-WASM_PAGE_SIZE, or by
  //     MAXIMUM_MEMORY, or by ASAN limit, depending on which is smallest
  // 4.  If we were unable to allocate as much memory, it may be due to
  //     over-eager decision to excessively reserve due to (3) above.
  //     Hence if an allocation fails, cut down on the amount of excess
  //     growth, in an attempt to succeed to perform a smaller allocation.
  // A limit is set for how much we can grow. We should not exceed that
  // (the wasm binary specifies it, so if we tried, we'd fail anyhow).
  var maxHeapSize = getHeapMax();
  if (requestedSize > maxHeapSize) {
    err(`Cannot enlarge memory, requested ${requestedSize} bytes, but the limit is ${maxHeapSize} bytes!`);
    return false;
  }
  // Loop through potential heap size increases. If we attempt a too eager
  // reservation that fails, cut down on the attempted size and reserve a
  // smaller bump instead. (max 3 times, chosen somewhat arbitrarily)
  for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
    var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
    // ensure geometric growth
    // but limit overreserving (default to capping at +96MB overgrowth at most)
    overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
    var newSize = Math.min(maxHeapSize, alignMemory(Math.max(requestedSize, overGrownHeapSize), 65536));
    var replacement = growMemory(newSize);
    if (replacement) {
      return true;
    }
  }
  err(`Failed to grow the heap from ${oldSize} bytes to ${newSize} bytes, not enough memory!`);
  return false;
};

var runtimeKeepaliveCounter = 0;

var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;

var _proc_exit = code => {
  EXITSTATUS = code;
  if (!keepRuntimeAlive()) {
    Module["onExit"]?.(code);
    ABORT = true;
  }
  quit_(code, new ExitStatus(code));
};

/** @param {boolean|number=} implicit */ var exitJS = (status, implicit) => {
  EXITSTATUS = status;
  checkUnflushedContent();
  // if exit() was called explicitly, warn the user if the runtime isn't actually being shut down
  if (keepRuntimeAlive() && !implicit) {
    var msg = `program exited (with status: ${status}), but keepRuntimeAlive() is set (counter=${runtimeKeepaliveCounter}) due to an async operation, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)`;
    readyPromiseReject?.(msg);
    err(msg);
  }
  _proc_exit(status);
};

var _exit = exitJS;

var _fd_close = fd => {
  abort("fd_close called without SYSCALLS_REQUIRE_FILESYSTEM");
};

var _fd_read = (fd, iov, iovcnt, pnum) => {
  abort("fd_read called without SYSCALLS_REQUIRE_FILESYSTEM");
};

var INT53_MAX = 9007199254740992;

var INT53_MIN = -9007199254740992;

var bigintToI53Checked = num => (num < INT53_MIN || num > INT53_MAX) ? NaN : Number(num);

function _fd_seek(fd, offset, whence, newOffset) {
  offset = bigintToI53Checked(offset);
  return 70;
}

var printCharBuffers = [ null, [], [] ];

var printChar = (stream, curr) => {
  var buffer = printCharBuffers[stream];
  assert(buffer);
  if (curr === 0 || curr === 10) {
    (stream === 1 ? out : err)(UTF8ArrayToString(buffer));
    buffer.length = 0;
  } else {
    buffer.push(curr);
  }
};

var flush_NO_FILESYSTEM = () => {
  // flush anything remaining in the buffers during shutdown
  _fflush(0);
  if (printCharBuffers[1].length) printChar(1, 10);
  if (printCharBuffers[2].length) printChar(2, 10);
};

var _fd_write = (fd, iov, iovcnt, pnum) => {
  // hack to support printf in SYSCALLS_REQUIRE_FILESYSTEM=0
  var num = 0;
  for (var i = 0; i < iovcnt; i++) {
    var ptr = HEAPU32[SAFE_HEAP_INDEX(HEAPU32, ((iov) >> 2), "loading")];
    var len = HEAPU32[SAFE_HEAP_INDEX(HEAPU32, (((iov) + (4)) >> 2), "loading")];
    iov += 8;
    for (var j = 0; j < len; j++) {
      printChar(fd, HEAPU8[SAFE_HEAP_INDEX(HEAPU8, ptr + j, "loading")]);
    }
    num += len;
  }
  HEAPU32[SAFE_HEAP_INDEX(HEAPU32, ((pnum) >> 2), "storing")] = num;
  return 0;
};

var GLctx;

var webgl_enable_ANGLE_instanced_arrays = ctx => {
  // Extension available in WebGL 1 from Firefox 26 and Google Chrome 30 onwards. Core feature in WebGL 2.
  var ext = ctx.getExtension("ANGLE_instanced_arrays");
  // Because this extension is a core function in WebGL 2, assign the extension entry points in place of
  // where the core functions will reside in WebGL 2. This way the calling code can call these without
  // having to dynamically branch depending if running against WebGL 1 or WebGL 2.
  if (ext) {
    ctx["vertexAttribDivisor"] = (index, divisor) => ext["vertexAttribDivisorANGLE"](index, divisor);
    ctx["drawArraysInstanced"] = (mode, first, count, primcount) => ext["drawArraysInstancedANGLE"](mode, first, count, primcount);
    ctx["drawElementsInstanced"] = (mode, count, type, indices, primcount) => ext["drawElementsInstancedANGLE"](mode, count, type, indices, primcount);
    return 1;
  }
};

var webgl_enable_OES_vertex_array_object = ctx => {
  // Extension available in WebGL 1 from Firefox 25 and WebKit 536.28/desktop Safari 6.0.3 onwards. Core feature in WebGL 2.
  var ext = ctx.getExtension("OES_vertex_array_object");
  if (ext) {
    ctx["createVertexArray"] = () => ext["createVertexArrayOES"]();
    ctx["deleteVertexArray"] = vao => ext["deleteVertexArrayOES"](vao);
    ctx["bindVertexArray"] = vao => ext["bindVertexArrayOES"](vao);
    ctx["isVertexArray"] = vao => ext["isVertexArrayOES"](vao);
    return 1;
  }
};

var webgl_enable_WEBGL_draw_buffers = ctx => {
  // Extension available in WebGL 1 from Firefox 28 onwards. Core feature in WebGL 2.
  var ext = ctx.getExtension("WEBGL_draw_buffers");
  if (ext) {
    ctx["drawBuffers"] = (n, bufs) => ext["drawBuffersWEBGL"](n, bufs);
    return 1;
  }
};

var webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance = ctx => // Closure is expected to be allowed to minify the '.dibvbi' property, so not accessing it quoted.
!!(ctx.dibvbi = ctx.getExtension("WEBGL_draw_instanced_base_vertex_base_instance"));

var webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance = ctx => !!(ctx.mdibvbi = ctx.getExtension("WEBGL_multi_draw_instanced_base_vertex_base_instance"));

var webgl_enable_EXT_polygon_offset_clamp = ctx => !!(ctx.extPolygonOffsetClamp = ctx.getExtension("EXT_polygon_offset_clamp"));

var webgl_enable_EXT_clip_control = ctx => !!(ctx.extClipControl = ctx.getExtension("EXT_clip_control"));

var webgl_enable_WEBGL_polygon_mode = ctx => !!(ctx.webglPolygonMode = ctx.getExtension("WEBGL_polygon_mode"));

var webgl_enable_WEBGL_multi_draw = ctx => // Closure is expected to be allowed to minify the '.multiDrawWebgl' property, so not accessing it quoted.
!!(ctx.multiDrawWebgl = ctx.getExtension("WEBGL_multi_draw"));

var getEmscriptenSupportedExtensions = ctx => {
  // Restrict the list of advertised extensions to those that we actually
  // support.
  var supportedExtensions = [ // WebGL 1 extensions
  "ANGLE_instanced_arrays", "EXT_blend_minmax", "EXT_disjoint_timer_query", "EXT_frag_depth", "EXT_shader_texture_lod", "EXT_sRGB", "OES_element_index_uint", "OES_fbo_render_mipmap", "OES_standard_derivatives", "OES_texture_float", "OES_texture_half_float", "OES_texture_half_float_linear", "OES_vertex_array_object", "WEBGL_color_buffer_float", "WEBGL_depth_texture", "WEBGL_draw_buffers", // WebGL 2 extensions
  "EXT_color_buffer_float", "EXT_conservative_depth", "EXT_disjoint_timer_query_webgl2", "EXT_texture_norm16", "NV_shader_noperspective_interpolation", "WEBGL_clip_cull_distance", // WebGL 1 and WebGL 2 extensions
  "EXT_clip_control", "EXT_color_buffer_half_float", "EXT_depth_clamp", "EXT_float_blend", "EXT_polygon_offset_clamp", "EXT_texture_compression_bptc", "EXT_texture_compression_rgtc", "EXT_texture_filter_anisotropic", "KHR_parallel_shader_compile", "OES_texture_float_linear", "WEBGL_blend_func_extended", "WEBGL_compressed_texture_astc", "WEBGL_compressed_texture_etc", "WEBGL_compressed_texture_etc1", "WEBGL_compressed_texture_s3tc", "WEBGL_compressed_texture_s3tc_srgb", "WEBGL_debug_renderer_info", "WEBGL_debug_shaders", "WEBGL_lose_context", "WEBGL_multi_draw", "WEBGL_polygon_mode" ];
  // .getSupportedExtensions() can return null if context is lost, so coerce to empty array.
  return (ctx.getSupportedExtensions() || []).filter(ext => supportedExtensions.includes(ext));
};

var GL = {
  counter: 1,
  buffers: [],
  programs: [],
  framebuffers: [],
  renderbuffers: [],
  textures: [],
  shaders: [],
  vaos: [],
  contexts: [],
  offscreenCanvases: {},
  queries: [],
  samplers: [],
  transformFeedbacks: [],
  syncs: [],
  stringCache: {},
  stringiCache: {},
  unpackAlignment: 4,
  unpackRowLength: 0,
  recordError: errorCode => {
    if (!GL.lastError) {
      GL.lastError = errorCode;
    }
  },
  getNewId: table => {
    var ret = GL.counter++;
    for (var i = table.length; i < ret; i++) {
      table[i] = null;
    }
    return ret;
  },
  genObject: (n, buffers, createFunction, objectTable) => {
    for (var i = 0; i < n; i++) {
      var buffer = GLctx[createFunction]();
      var id = buffer && GL.getNewId(objectTable);
      if (buffer) {
        buffer.name = id;
        objectTable[id] = buffer;
      } else {
        GL.recordError(1282);
      }
      HEAP32[SAFE_HEAP_INDEX(HEAP32, (((buffers) + (i * 4)) >> 2), "storing")] = id;
    }
  },
  getSource: (shader, count, string, length) => {
    var source = "";
    for (var i = 0; i < count; ++i) {
      var len = length ? HEAPU32[SAFE_HEAP_INDEX(HEAPU32, (((length) + (i * 4)) >> 2), "loading")] : undefined;
      source += UTF8ToString(HEAPU32[SAFE_HEAP_INDEX(HEAPU32, (((string) + (i * 4)) >> 2), "loading")], len);
    }
    return source;
  },
  createContext: (/** @type {HTMLCanvasElement} */ canvas, webGLContextAttributes) => {
    // BUG: Workaround Safari WebGL issue: After successfully acquiring WebGL
    // context on a canvas, calling .getContext() will always return that
    // context independent of which 'webgl' or 'webgl2'
    // context version was passed. See:
    //   https://webkit.org/b/222758
    // and:
    //   https://github.com/emscripten-core/emscripten/issues/13295.
    // TODO: Once the bug is fixed and shipped in Safari, adjust the Safari
    // version field in above check.
    if (!canvas.getContextSafariWebGL2Fixed) {
      canvas.getContextSafariWebGL2Fixed = canvas.getContext;
      /** @type {function(this:HTMLCanvasElement, string, (Object|null)=): (Object|null)} */ function fixedGetContext(ver, attrs) {
        var gl = canvas.getContextSafariWebGL2Fixed(ver, attrs);
        return ((ver == "webgl") == (gl instanceof WebGLRenderingContext)) ? gl : null;
      }
      canvas.getContext = fixedGetContext;
    }
    var ctx = (webGLContextAttributes.majorVersion > 1) ? canvas.getContext("webgl2", webGLContextAttributes) : canvas.getContext("webgl", webGLContextAttributes);
    if (!ctx) return 0;
    var handle = GL.registerContext(ctx, webGLContextAttributes);
    return handle;
  },
  registerContext: (ctx, webGLContextAttributes) => {
    // without pthreads a context is just an integer ID
    var handle = GL.getNewId(GL.contexts);
    var context = {
      handle,
      attributes: webGLContextAttributes,
      version: webGLContextAttributes.majorVersion,
      GLctx: ctx
    };
    // Store the created context object so that we can access the context
    // given a canvas without having to pass the parameters again.
    if (ctx.canvas) ctx.canvas.GLctxObject = context;
    GL.contexts[handle] = context;
    if (typeof webGLContextAttributes.enableExtensionsByDefault == "undefined" || webGLContextAttributes.enableExtensionsByDefault) {
      GL.initExtensions(context);
    }
    return handle;
  },
  makeContextCurrent: contextHandle => {
    // Active Emscripten GL layer context object.
    GL.currentContext = GL.contexts[contextHandle];
    // Active WebGL context object.
    Module["ctx"] = GLctx = GL.currentContext?.GLctx;
    return !(contextHandle && !GLctx);
  },
  getContext: contextHandle => GL.contexts[contextHandle],
  deleteContext: contextHandle => {
    if (GL.currentContext === GL.contexts[contextHandle]) {
      GL.currentContext = null;
    }
    if (typeof JSEvents == "object") {
      // Release all JS event handlers on the DOM element that the GL context is
      // associated with since the context is now deleted.
      JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas);
    }
    // Make sure the canvas object no longer refers to the context object so
    // there are no GC surprises.
    if (GL.contexts[contextHandle]?.GLctx.canvas) {
      GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined;
    }
    GL.contexts[contextHandle] = null;
  },
  initExtensions: context => {
    // If this function is called without a specific context object, init the
    // extensions of the currently active context.
    context ||= GL.currentContext;
    if (context.initExtensionsDone) return;
    context.initExtensionsDone = true;
    var GLctx = context.GLctx;
    // Detect the presence of a few extensions manually, since the GL interop
    // layer itself will need to know if they exist.
    // Extensions that are available in both WebGL 1 and WebGL 2
    webgl_enable_WEBGL_multi_draw(GLctx);
    webgl_enable_EXT_polygon_offset_clamp(GLctx);
    webgl_enable_EXT_clip_control(GLctx);
    webgl_enable_WEBGL_polygon_mode(GLctx);
    // Extensions that are only available in WebGL 1 (the calls will be no-ops
    // if called on a WebGL 2 context active)
    webgl_enable_ANGLE_instanced_arrays(GLctx);
    webgl_enable_OES_vertex_array_object(GLctx);
    webgl_enable_WEBGL_draw_buffers(GLctx);
    // Extensions that are available from WebGL >= 2 (no-op if called on a WebGL 1 context active)
    webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance(GLctx);
    webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance(GLctx);
    // On WebGL 2, EXT_disjoint_timer_query is replaced with an alternative
    // that's based on core APIs, and exposes only the queryCounterEXT()
    // entrypoint.
    if (context.version >= 2) {
      GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query_webgl2");
    }
    // However, Firefox exposes the WebGL 1 version on WebGL 2 as well and
    // thus we look for the WebGL 1 version again if the WebGL 2 version
    // isn't present. https://bugzil.la/1328882
    if (context.version < 2 || !GLctx.disjointTimerQueryExt) {
      GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query");
    }
    for (var ext of getEmscriptenSupportedExtensions(GLctx)) {
      // WEBGL_lose_context, WEBGL_debug_renderer_info and WEBGL_debug_shaders
      // are not enabled by default.
      if (!ext.includes("lose_context") && !ext.includes("debug")) {
        // Call .getExtension() to enable that extension permanently.
        GLctx.getExtension(ext);
      }
    }
  }
};

var _emscripten_glActiveTexture = x0 => GLctx.activeTexture(x0);

var _glActiveTexture = _emscripten_glActiveTexture;

var _emscripten_glAttachShader = (program, shader) => {
  GLctx.attachShader(GL.programs[program], GL.shaders[shader]);
};

var _glAttachShader = _emscripten_glAttachShader;

var _emscripten_glBindAttribLocation = (program, index, name) => {
  GLctx.bindAttribLocation(GL.programs[program], index, UTF8ToString(name));
};

var _glBindAttribLocation = _emscripten_glBindAttribLocation;

var _emscripten_glBindBuffer = (target, buffer) => {
  if (target == 35051) {
    // In WebGL 2 glReadPixels entry point, we need to use a different WebGL 2
    // API function call when a buffer is bound to
    // GL_PIXEL_PACK_BUFFER_BINDING point, so must keep track whether that
    // binding point is non-null to know what is the proper API function to
    // call.
    GLctx.currentPixelPackBufferBinding = buffer;
  } else if (target == 35052) {
    // In WebGL 2 gl(Compressed)Tex(Sub)Image[23]D entry points, we need to
    // use a different WebGL 2 API function call when a buffer is bound to
    // GL_PIXEL_UNPACK_BUFFER_BINDING point, so must keep track whether that
    // binding point is non-null to know what is the proper API function to
    // call.
    GLctx.currentPixelUnpackBufferBinding = buffer;
  }
  GLctx.bindBuffer(target, GL.buffers[buffer]);
};

var _glBindBuffer = _emscripten_glBindBuffer;

var _emscripten_glBindTexture = (target, texture) => {
  GLctx.bindTexture(target, GL.textures[texture]);
};

var _glBindTexture = _emscripten_glBindTexture;

var _emscripten_glBlendColor = (x0, x1, x2, x3) => GLctx.blendColor(x0, x1, x2, x3);

var _glBlendColor = _emscripten_glBlendColor;

var _emscripten_glBlendFunc = (x0, x1) => GLctx.blendFunc(x0, x1);

var _glBlendFunc = _emscripten_glBlendFunc;

var _emscripten_glBlendFuncSeparate = (x0, x1, x2, x3) => GLctx.blendFuncSeparate(x0, x1, x2, x3);

var _glBlendFuncSeparate = _emscripten_glBlendFuncSeparate;

var _emscripten_glBufferData = (target, size, data, usage) => {
  if (GL.currentContext.version >= 2) {
    // If size is zero, WebGL would interpret uploading the whole input
    // arraybuffer (starting from given offset), which would not make sense in
    // WebAssembly, so avoid uploading if size is zero. However we must still
    // call bufferData to establish a backing storage of zero bytes.
    if (data && size) {
      GLctx.bufferData(target, HEAPU8, usage, data, size);
    } else {
      GLctx.bufferData(target, size, usage);
    }
    return;
  }
  // N.b. here first form specifies a heap subarray, second form an integer
  // size, so the ?: code here is polymorphic. It is advised to avoid
  // randomly mixing both uses in calling code, to avoid any potential JS
  // engine JIT issues.
  GLctx.bufferData(target, data ? HEAPU8.subarray(data, data + size) : size, usage);
};

var _glBufferData = _emscripten_glBufferData;

var _emscripten_glClear = x0 => GLctx.clear(x0);

var _glClear = _emscripten_glClear;

var _emscripten_glClearColor = (x0, x1, x2, x3) => GLctx.clearColor(x0, x1, x2, x3);

var _glClearColor = _emscripten_glClearColor;

var _emscripten_glColorMask = (red, green, blue, alpha) => {
  GLctx.colorMask(!!red, !!green, !!blue, !!alpha);
};

var _glColorMask = _emscripten_glColorMask;

var _emscripten_glCompileShader = shader => {
  GLctx.compileShader(GL.shaders[shader]);
};

var _glCompileShader = _emscripten_glCompileShader;

var _emscripten_glCreateProgram = () => {
  var id = GL.getNewId(GL.programs);
  var program = GLctx.createProgram();
  // Store additional information needed for each shader program:
  program.name = id;
  // Lazy cache results of
  // glGetProgramiv(GL_ACTIVE_UNIFORM_MAX_LENGTH/GL_ACTIVE_ATTRIBUTE_MAX_LENGTH/GL_ACTIVE_UNIFORM_BLOCK_MAX_NAME_LENGTH)
  program.maxUniformLength = program.maxAttributeLength = program.maxUniformBlockNameLength = 0;
  program.uniformIdCounter = 1;
  GL.programs[id] = program;
  return id;
};

var _glCreateProgram = _emscripten_glCreateProgram;

var _emscripten_glCreateShader = shaderType => {
  var id = GL.getNewId(GL.shaders);
  GL.shaders[id] = GLctx.createShader(shaderType);
  return id;
};

var _glCreateShader = _emscripten_glCreateShader;

var _emscripten_glCullFace = x0 => GLctx.cullFace(x0);

var _glCullFace = _emscripten_glCullFace;

var _emscripten_glDeleteBuffers = (n, buffers) => {
  for (var i = 0; i < n; i++) {
    var id = HEAP32[SAFE_HEAP_INDEX(HEAP32, (((buffers) + (i * 4)) >> 2), "loading")];
    var buffer = GL.buffers[id];
    // From spec: "glDeleteBuffers silently ignores 0's and names that do not
    // correspond to existing buffer objects."
    if (!buffer) continue;
    GLctx.deleteBuffer(buffer);
    buffer.name = 0;
    GL.buffers[id] = null;
    if (id == GLctx.currentPixelPackBufferBinding) GLctx.currentPixelPackBufferBinding = 0;
    if (id == GLctx.currentPixelUnpackBufferBinding) GLctx.currentPixelUnpackBufferBinding = 0;
  }
};

var _glDeleteBuffers = _emscripten_glDeleteBuffers;

var _emscripten_glDeleteProgram = id => {
  if (!id) return;
  var program = GL.programs[id];
  if (!program) {
    // glDeleteProgram actually signals an error when deleting a nonexisting
    // object, unlike some other GL delete functions.
    GL.recordError(1281);
    return;
  }
  GLctx.deleteProgram(program);
  program.name = 0;
  GL.programs[id] = null;
};

var _glDeleteProgram = _emscripten_glDeleteProgram;

var _emscripten_glDeleteShader = id => {
  if (!id) return;
  var shader = GL.shaders[id];
  if (!shader) {
    // glDeleteShader actually signals an error when deleting a nonexisting
    // object, unlike some other GL delete functions.
    GL.recordError(1281);
    return;
  }
  GLctx.deleteShader(shader);
  GL.shaders[id] = null;
};

var _glDeleteShader = _emscripten_glDeleteShader;

var _emscripten_glDeleteTextures = (n, textures) => {
  for (var i = 0; i < n; i++) {
    var id = HEAP32[SAFE_HEAP_INDEX(HEAP32, (((textures) + (i * 4)) >> 2), "loading")];
    var texture = GL.textures[id];
    // GL spec: "glDeleteTextures silently ignores 0s and names that do not
    // correspond to existing textures".
    if (!texture) continue;
    GLctx.deleteTexture(texture);
    texture.name = 0;
    GL.textures[id] = null;
  }
};

var _glDeleteTextures = _emscripten_glDeleteTextures;

var _emscripten_glDepthFunc = x0 => GLctx.depthFunc(x0);

var _glDepthFunc = _emscripten_glDepthFunc;

var _emscripten_glDepthMask = flag => {
  GLctx.depthMask(!!flag);
};

var _glDepthMask = _emscripten_glDepthMask;

var _emscripten_glDisable = x0 => GLctx.disable(x0);

var _glDisable = _emscripten_glDisable;

var _emscripten_glDisableVertexAttribArray = index => {
  GLctx.disableVertexAttribArray(index);
};

var _glDisableVertexAttribArray = _emscripten_glDisableVertexAttribArray;

var _emscripten_glDrawArrays = (mode, first, count) => {
  GLctx.drawArrays(mode, first, count);
};

var _glDrawArrays = _emscripten_glDrawArrays;

var _emscripten_glDrawElements = (mode, count, type, indices) => {
  GLctx.drawElements(mode, count, type, indices);
};

var _glDrawElements = _emscripten_glDrawElements;

var _emscripten_glEnable = x0 => GLctx.enable(x0);

var _glEnable = _emscripten_glEnable;

var _emscripten_glEnableVertexAttribArray = index => {
  GLctx.enableVertexAttribArray(index);
};

var _glEnableVertexAttribArray = _emscripten_glEnableVertexAttribArray;

var _emscripten_glFinish = () => GLctx.finish();

var _glFinish = _emscripten_glFinish;

var _emscripten_glFrontFace = x0 => GLctx.frontFace(x0);

var _glFrontFace = _emscripten_glFrontFace;

var _emscripten_glGenBuffers = (n, buffers) => {
  GL.genObject(n, buffers, "createBuffer", GL.buffers);
};

var _glGenBuffers = _emscripten_glGenBuffers;

var _emscripten_glGenTextures = (n, textures) => {
  GL.genObject(n, textures, "createTexture", GL.textures);
};

var _glGenTextures = _emscripten_glGenTextures;

var _emscripten_glGenerateMipmap = x0 => GLctx.generateMipmap(x0);

var _glGenerateMipmap = _emscripten_glGenerateMipmap;

var __glGetActiveAttribOrUniform = (funcName, program, index, bufSize, length, size, type, name) => {
  program = GL.programs[program];
  var info = GLctx[funcName](program, index);
  if (info) {
    // If an error occurs, nothing will be written to length, size and type and name.
    var numBytesWrittenExclNull = name && stringToUTF8(info.name, name, bufSize);
    if (length) HEAP32[SAFE_HEAP_INDEX(HEAP32, ((length) >> 2), "storing")] = numBytesWrittenExclNull;
    if (size) HEAP32[SAFE_HEAP_INDEX(HEAP32, ((size) >> 2), "storing")] = info.size;
    if (type) HEAP32[SAFE_HEAP_INDEX(HEAP32, ((type) >> 2), "storing")] = info.type;
  }
};

var _emscripten_glGetActiveUniform = (program, index, bufSize, length, size, type, name) => __glGetActiveAttribOrUniform("getActiveUniform", program, index, bufSize, length, size, type, name);

var _glGetActiveUniform = _emscripten_glGetActiveUniform;

var _emscripten_glGetError = () => {
  var error = GLctx.getError() || GL.lastError;
  GL.lastError = 0;
  return error;
};

var _glGetError = _emscripten_glGetError;

var readI53FromI64 = ptr => HEAPU32[SAFE_HEAP_INDEX(HEAPU32, ((ptr) >> 2), "loading")] + HEAP32[SAFE_HEAP_INDEX(HEAP32, (((ptr) + (4)) >> 2), "loading")] * 4294967296;

var readI53FromU64 = ptr => HEAPU32[SAFE_HEAP_INDEX(HEAPU32, ((ptr) >> 2), "loading")] + HEAPU32[SAFE_HEAP_INDEX(HEAPU32, (((ptr) + (4)) >> 2), "loading")] * 4294967296;

var writeI53ToI64 = (ptr, num) => {
  HEAPU32[SAFE_HEAP_INDEX(HEAPU32, ((ptr) >> 2), "storing")] = num;
  var lower = HEAPU32[SAFE_HEAP_INDEX(HEAPU32, ((ptr) >> 2), "loading")];
  HEAPU32[SAFE_HEAP_INDEX(HEAPU32, (((ptr) + (4)) >> 2), "storing")] = (num - lower) / 4294967296;
  var deserialized = (num >= 0) ? readI53FromU64(ptr) : readI53FromI64(ptr);
  var offset = ((ptr) >> 2);
  if (deserialized != num) warnOnce(`writeI53ToI64() out of range: serialized JS Number ${num} to Wasm heap as bytes lo=${ptrToString(HEAPU32[SAFE_HEAP_INDEX(HEAPU32, offset, "loading")])}, hi=${ptrToString(HEAPU32[SAFE_HEAP_INDEX(HEAPU32, offset + 1, "loading")])}, which deserializes back to ${deserialized} instead!`);
};

var webglGetExtensions = () => {
  var exts = getEmscriptenSupportedExtensions(GLctx);
  exts = exts.concat(exts.map(e => "GL_" + e));
  return exts;
};

var emscriptenWebGLGet = (name_, p, type) => {
  // Guard against user passing a null pointer.
  // Note that GLES2 spec does not say anything about how passing a null
  // pointer should be treated.  Testing on desktop core GL 3, the application
  // crashes on glGetIntegerv to a null pointer, but better to report an error
  // instead of doing anything random.
  if (!p) {
    GL.recordError(1281);
    return;
  }
  var ret = undefined;
  switch (name_) {
   // Handle a few trivial GLES values
    case 36346:
    // GL_SHADER_COMPILER
    ret = 1;
    break;

   case 36344:
    // GL_SHADER_BINARY_FORMATS
    if (type != 0 && type != 1) {
      GL.recordError(1280);
    }
    // Do not write anything to the out pointer, since no binary formats are
    // supported.
    return;

   case 34814:
   // GL_NUM_PROGRAM_BINARY_FORMATS
    case 36345:
    // GL_NUM_SHADER_BINARY_FORMATS
    ret = 0;
    break;

   case 34466:
    // GL_NUM_COMPRESSED_TEXTURE_FORMATS
    // WebGL doesn't have GL_NUM_COMPRESSED_TEXTURE_FORMATS (it's obsolete
    // since GL_COMPRESSED_TEXTURE_FORMATS returns a JS array that can be
    // queried for length), so implement it ourselves to allow C++ GLES2
    // code to get the length.
    var formats = GLctx.getParameter(34467);
    ret = formats ? formats.length : 0;
    break;

   case 33309:
    // GL_NUM_EXTENSIONS
    if (GL.currentContext.version < 2) {
      // Calling GLES3/WebGL2 function with a GLES2/WebGL1 context
      GL.recordError(1282);
      return;
    }
    ret = webglGetExtensions().length;
    break;

   case 33307:
   // GL_MAJOR_VERSION
    case 33308:
    // GL_MINOR_VERSION
    if (GL.currentContext.version < 2) {
      GL.recordError(1280);
      // GL_INVALID_ENUM
      return;
    }
    ret = name_ == 33307 ? 3 : 0;
    // return version 3.0
    break;
  }
  if (ret === undefined) {
    var result = GLctx.getParameter(name_);
    switch (typeof result) {
     case "number":
      ret = result;
      break;

     case "boolean":
      ret = result ? 1 : 0;
      break;

     case "string":
      GL.recordError(1280);
      // GL_INVALID_ENUM
      return;

     case "object":
      if (result === null) {
        // null is a valid result for some (e.g., which buffer is bound -
        // perhaps nothing is bound), but otherwise can mean an invalid
        // name_, which we need to report as an error
        switch (name_) {
         case 34964:
         // ARRAY_BUFFER_BINDING
          case 35725:
         // CURRENT_PROGRAM
          case 34965:
         // ELEMENT_ARRAY_BUFFER_BINDING
          case 36006:
         // FRAMEBUFFER_BINDING or DRAW_FRAMEBUFFER_BINDING
          case 36007:
         // RENDERBUFFER_BINDING
          case 32873:
         // TEXTURE_BINDING_2D
          case 34229:
         // WebGL 2 GL_VERTEX_ARRAY_BINDING, or WebGL 1 extension OES_vertex_array_object GL_VERTEX_ARRAY_BINDING_OES
          case 36662:
         // COPY_READ_BUFFER_BINDING or COPY_READ_BUFFER
          case 36663:
         // COPY_WRITE_BUFFER_BINDING or COPY_WRITE_BUFFER
          case 35053:
         // PIXEL_PACK_BUFFER_BINDING
          case 35055:
         // PIXEL_UNPACK_BUFFER_BINDING
          case 36010:
         // READ_FRAMEBUFFER_BINDING
          case 35097:
         // SAMPLER_BINDING
          case 35869:
         // TEXTURE_BINDING_2D_ARRAY
          case 32874:
         // TEXTURE_BINDING_3D
          case 36389:
         // TRANSFORM_FEEDBACK_BINDING
          case 35983:
         // TRANSFORM_FEEDBACK_BUFFER_BINDING
          case 35368:
         // UNIFORM_BUFFER_BINDING
          case 34068:
          {
            // TEXTURE_BINDING_CUBE_MAP
            ret = 0;
            break;
          }

         default:
          {
            GL.recordError(1280);
            // GL_INVALID_ENUM
            return;
          }
        }
      } else if (result instanceof Float32Array || result instanceof Uint32Array || result instanceof Int32Array || result instanceof Array) {
        for (var i = 0; i < result.length; ++i) {
          switch (type) {
           case 0:
            HEAP32[SAFE_HEAP_INDEX(HEAP32, (((p) + (i * 4)) >> 2), "storing")] = result[i];
            break;

           case 2:
            HEAPF32[SAFE_HEAP_INDEX(HEAPF32, (((p) + (i * 4)) >> 2), "storing")] = result[i];
            break;

           case 4:
            HEAP8[SAFE_HEAP_INDEX(HEAP8, (p) + (i), "storing")] = result[i] ? 1 : 0;
            break;
          }
        }
        return;
      } else {
        try {
          ret = result.name | 0;
        } catch (e) {
          GL.recordError(1280);
          // GL_INVALID_ENUM
          err(`GL_INVALID_ENUM in glGet${type}v: Unknown object returned from WebGL getParameter(${name_})! (error: ${e})`);
          return;
        }
      }
      break;

     default:
      GL.recordError(1280);
      // GL_INVALID_ENUM
      err(`GL_INVALID_ENUM in glGet${type}v: Native code calling glGet${type}v(${name_}) and it returns ${result} of type ${typeof (result)}!`);
      return;
    }
  }
  switch (type) {
   case 1:
    writeI53ToI64(p, ret);
    break;

   case 0:
    HEAP32[SAFE_HEAP_INDEX(HEAP32, ((p) >> 2), "storing")] = ret;
    break;

   case 2:
    HEAPF32[SAFE_HEAP_INDEX(HEAPF32, ((p) >> 2), "storing")] = ret;
    break;

   case 4:
    HEAP8[SAFE_HEAP_INDEX(HEAP8, p, "storing")] = ret ? 1 : 0;
    break;
  }
};

var _emscripten_glGetIntegerv = (name_, p) => emscriptenWebGLGet(name_, p, 0);

var _glGetIntegerv = _emscripten_glGetIntegerv;

var _emscripten_glGetProgramInfoLog = (program, maxLength, length, infoLog) => {
  var log = GLctx.getProgramInfoLog(GL.programs[program]);
  if (log === null) log = "(unknown error)";
  var numBytesWrittenExclNull = (maxLength > 0 && infoLog) ? stringToUTF8(log, infoLog, maxLength) : 0;
  if (length) HEAP32[SAFE_HEAP_INDEX(HEAP32, ((length) >> 2), "storing")] = numBytesWrittenExclNull;
};

var _glGetProgramInfoLog = _emscripten_glGetProgramInfoLog;

var _emscripten_glGetProgramiv = (program, pname, p) => {
  if (!p) {
    // GLES2 specification does not specify how to behave if p is a null
    // pointer. Since calling this function does not make sense if p == null,
    // issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  if (program >= GL.counter) {
    GL.recordError(1281);
    return;
  }
  program = GL.programs[program];
  if (pname == 35716) {
    // GL_INFO_LOG_LENGTH
    var log = GLctx.getProgramInfoLog(program);
    if (log === null) log = "(unknown error)";
    HEAP32[SAFE_HEAP_INDEX(HEAP32, ((p) >> 2), "storing")] = log.length + 1;
  } else if (pname == 35719) {
    if (!program.maxUniformLength) {
      var numActiveUniforms = GLctx.getProgramParameter(program, 35718);
      for (var i = 0; i < numActiveUniforms; ++i) {
        program.maxUniformLength = Math.max(program.maxUniformLength, GLctx.getActiveUniform(program, i).name.length + 1);
      }
    }
    HEAP32[SAFE_HEAP_INDEX(HEAP32, ((p) >> 2), "storing")] = program.maxUniformLength;
  } else if (pname == 35722) {
    if (!program.maxAttributeLength) {
      var numActiveAttributes = GLctx.getProgramParameter(program, 35721);
      for (var i = 0; i < numActiveAttributes; ++i) {
        program.maxAttributeLength = Math.max(program.maxAttributeLength, GLctx.getActiveAttrib(program, i).name.length + 1);
      }
    }
    HEAP32[SAFE_HEAP_INDEX(HEAP32, ((p) >> 2), "storing")] = program.maxAttributeLength;
  } else if (pname == 35381) {
    if (!program.maxUniformBlockNameLength) {
      var numActiveUniformBlocks = GLctx.getProgramParameter(program, 35382);
      for (var i = 0; i < numActiveUniformBlocks; ++i) {
        program.maxUniformBlockNameLength = Math.max(program.maxUniformBlockNameLength, GLctx.getActiveUniformBlockName(program, i).length + 1);
      }
    }
    HEAP32[SAFE_HEAP_INDEX(HEAP32, ((p) >> 2), "storing")] = program.maxUniformBlockNameLength;
  } else {
    HEAP32[SAFE_HEAP_INDEX(HEAP32, ((p) >> 2), "storing")] = GLctx.getProgramParameter(program, pname);
  }
};

var _glGetProgramiv = _emscripten_glGetProgramiv;

var _emscripten_glGetShaderInfoLog = (shader, maxLength, length, infoLog) => {
  var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
  if (log === null) log = "(unknown error)";
  var numBytesWrittenExclNull = (maxLength > 0 && infoLog) ? stringToUTF8(log, infoLog, maxLength) : 0;
  if (length) HEAP32[SAFE_HEAP_INDEX(HEAP32, ((length) >> 2), "storing")] = numBytesWrittenExclNull;
};

var _glGetShaderInfoLog = _emscripten_glGetShaderInfoLog;

var _emscripten_glGetShaderiv = (shader, pname, p) => {
  if (!p) {
    // GLES2 specification does not specify how to behave if p is a null
    // pointer. Since calling this function does not make sense if p == null,
    // issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  if (pname == 35716) {
    // GL_INFO_LOG_LENGTH
    var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
    if (log === null) log = "(unknown error)";
    // The GLES2 specification says that if the shader has an empty info log,
    // a value of 0 is returned. Otherwise the log has a null char appended.
    // (An empty string is falsey, so we can just check that instead of
    // looking at log.length.)
    var logLength = log ? log.length + 1 : 0;
    HEAP32[SAFE_HEAP_INDEX(HEAP32, ((p) >> 2), "storing")] = logLength;
  } else if (pname == 35720) {
    // GL_SHADER_SOURCE_LENGTH
    var source = GLctx.getShaderSource(GL.shaders[shader]);
    // source may be a null, or the empty string, both of which are falsey
    // values that we report a 0 length for.
    var sourceLength = source ? source.length + 1 : 0;
    HEAP32[SAFE_HEAP_INDEX(HEAP32, ((p) >> 2), "storing")] = sourceLength;
  } else {
    HEAP32[SAFE_HEAP_INDEX(HEAP32, ((p) >> 2), "storing")] = GLctx.getShaderParameter(GL.shaders[shader], pname);
  }
};

var _glGetShaderiv = _emscripten_glGetShaderiv;

/** @suppress {checkTypes} */ var jstoi_q = str => parseInt(str);

/** @noinline */ var webglGetLeftBracePos = name => name.slice(-1) == "]" && name.lastIndexOf("[");

var webglPrepareUniformLocationsBeforeFirstUse = program => {
  var uniformLocsById = program.uniformLocsById, // Maps GLuint -> WebGLUniformLocation
  uniformSizeAndIdsByName = program.uniformSizeAndIdsByName, // Maps name -> [uniform array length, GLuint]
  i, j;
  // On the first time invocation of glGetUniformLocation on this shader program:
  // initialize cache data structures and discover which uniforms are arrays.
  if (!uniformLocsById) {
    // maps GLint integer locations to WebGLUniformLocations
    program.uniformLocsById = uniformLocsById = {};
    // maps integer locations back to uniform name strings, so that we can lazily fetch uniform array locations
    program.uniformArrayNamesById = {};
    var numActiveUniforms = GLctx.getProgramParameter(program, 35718);
    for (i = 0; i < numActiveUniforms; ++i) {
      var u = GLctx.getActiveUniform(program, i);
      var nm = u.name;
      var sz = u.size;
      var lb = webglGetLeftBracePos(nm);
      var arrayName = lb > 0 ? nm.slice(0, lb) : nm;
      // Assign a new location.
      var id = program.uniformIdCounter;
      program.uniformIdCounter += sz;
      // Eagerly get the location of the uniformArray[0] base element.
      // The remaining indices >0 will be left for lazy evaluation to
      // improve performance. Those may never be needed to fetch, if the
      // application fills arrays always in full starting from the first
      // element of the array.
      uniformSizeAndIdsByName[arrayName] = [ sz, id ];
      // Store placeholder integers in place that highlight that these
      // >0 index locations are array indices pending population.
      for (j = 0; j < sz; ++j) {
        uniformLocsById[id] = j;
        program.uniformArrayNamesById[id++] = arrayName;
      }
    }
  }
};

var _emscripten_glGetUniformLocation = (program, name) => {
  name = UTF8ToString(name);
  if (program = GL.programs[program]) {
    webglPrepareUniformLocationsBeforeFirstUse(program);
    var uniformLocsById = program.uniformLocsById;
    // Maps GLuint -> WebGLUniformLocation
    var arrayIndex = 0;
    var uniformBaseName = name;
    // Invariant: when populating integer IDs for uniform locations, we must
    // maintain the precondition that arrays reside in contiguous addresses,
    // i.e. for a 'vec4 colors[10];', colors[4] must be at location
    // colors[0]+4.  However, user might call glGetUniformLocation(program,
    // "colors") for an array, so we cannot discover based on the user input
    // arguments whether the uniform we are dealing with is an array. The only
    // way to discover which uniforms are arrays is to enumerate over all the
    // active uniforms in the program.
    var leftBrace = webglGetLeftBracePos(name);
    // If user passed an array accessor "[index]", parse the array index off the accessor.
    if (leftBrace > 0) {
      arrayIndex = jstoi_q(name.slice(leftBrace + 1)) >>> 0;
      // "index]", coerce parseInt(']') with >>>0 to treat "foo[]" as "foo[0]" and foo[-1] as unsigned out-of-bounds.
      uniformBaseName = name.slice(0, leftBrace);
    }
    // Have we cached the location of this uniform before?
    // A pair [array length, GLint of the uniform location]
    var sizeAndId = program.uniformSizeAndIdsByName[uniformBaseName];
    // If a uniform with this name exists, and if its index is within the
    // array limits (if it's even an array), query the WebGLlocation, or
    // return an existing cached location.
    if (sizeAndId && arrayIndex < sizeAndId[0]) {
      arrayIndex += sizeAndId[1];
      // Add the base location of the uniform to the array index offset.
      if ((uniformLocsById[arrayIndex] = uniformLocsById[arrayIndex] || GLctx.getUniformLocation(program, name))) {
        return arrayIndex;
      }
    }
  } else {
    // N.b. we are currently unable to distinguish between GL program IDs that
    // never existed vs GL program IDs that have been deleted, so report
    // GL_INVALID_VALUE in both cases.
    GL.recordError(1281);
  }
  return -1;
};

var _glGetUniformLocation = _emscripten_glGetUniformLocation;

var _emscripten_glLineWidth = x0 => GLctx.lineWidth(x0);

var _glLineWidth = _emscripten_glLineWidth;

var _emscripten_glLinkProgram = program => {
  program = GL.programs[program];
  GLctx.linkProgram(program);
  // Invalidate earlier computed uniform->ID mappings, those have now become stale
  program.uniformLocsById = 0;
  // Mark as null-like so that glGetUniformLocation() knows to populate this again.
  program.uniformSizeAndIdsByName = {};
};

var _glLinkProgram = _emscripten_glLinkProgram;

var _emscripten_glPixelStorei = (pname, param) => {
  if (pname == 3317) {
    GL.unpackAlignment = param;
  } else if (pname == 3314) {
    GL.unpackRowLength = param;
  }
  GLctx.pixelStorei(pname, param);
};

var _glPixelStorei = _emscripten_glPixelStorei;

var _emscripten_glShaderSource = (shader, count, string, length) => {
  var source = GL.getSource(shader, count, string, length);
  GLctx.shaderSource(GL.shaders[shader], source);
};

var _glShaderSource = _emscripten_glShaderSource;

var _emscripten_glStencilFunc = (x0, x1, x2) => GLctx.stencilFunc(x0, x1, x2);

var _glStencilFunc = _emscripten_glStencilFunc;

var _emscripten_glStencilMask = x0 => GLctx.stencilMask(x0);

var _glStencilMask = _emscripten_glStencilMask;

var _emscripten_glStencilOp = (x0, x1, x2) => GLctx.stencilOp(x0, x1, x2);

var _glStencilOp = _emscripten_glStencilOp;

var _emscripten_glStencilOpSeparate = (x0, x1, x2, x3) => GLctx.stencilOpSeparate(x0, x1, x2, x3);

var _glStencilOpSeparate = _emscripten_glStencilOpSeparate;

var computeUnpackAlignedImageSize = (width, height, sizePerPixel) => {
  function roundedToNextMultipleOf(x, y) {
    return (x + y - 1) & -y;
  }
  var plainRowSize = (GL.unpackRowLength || width) * sizePerPixel;
  var alignedRowSize = roundedToNextMultipleOf(plainRowSize, GL.unpackAlignment);
  return height * alignedRowSize;
};

var colorChannelsInGlTextureFormat = format => {
  // Micro-optimizations for size: map format to size by subtracting smallest
  // enum value (0x1902) from all values first.  Also omit the most common
  // size value (1) from the list, which is assumed by formats not on the
  // list.
  var colorChannels = {
    // 0x1902 /* GL_DEPTH_COMPONENT */ - 0x1902: 1,
    // 0x1906 /* GL_ALPHA */ - 0x1902: 1,
    5: 3,
    6: 4,
    // 0x1909 /* GL_LUMINANCE */ - 0x1902: 1,
    8: 2,
    29502: 3,
    29504: 4,
    // 0x1903 /* GL_RED */ - 0x1902: 1,
    26917: 2,
    26918: 2,
    // 0x8D94 /* GL_RED_INTEGER */ - 0x1902: 1,
    29846: 3,
    29847: 4
  };
  return colorChannels[format - 6402] || 1;
};

var heapObjectForWebGLType = type => {
  // Micro-optimization for size: Subtract lowest GL enum number (0x1400/* GL_BYTE */) from type to compare
  // smaller values for the heap, for shorter generated code size.
  // Also the type HEAPU16 is not tested for explicitly, but any unrecognized type will return out HEAPU16.
  // (since most types are HEAPU16)
  type -= 5120;
  if (type == 0) return HEAP8;
  if (type == 1) return HEAPU8;
  if (type == 2) return HEAP16;
  if (type == 4) return HEAP32;
  if (type == 6) return HEAPF32;
  if (type == 5 || type == 28922 || type == 28520 || type == 30779 || type == 30782) return HEAPU32;
  return HEAPU16;
};

var toTypedArrayIndex = (pointer, heap) => pointer >>> (31 - Math.clz32(heap.BYTES_PER_ELEMENT));

var emscriptenWebGLGetTexPixelData = (type, format, width, height, pixels, internalFormat) => {
  var heap = heapObjectForWebGLType(type);
  var sizePerPixel = colorChannelsInGlTextureFormat(format) * heap.BYTES_PER_ELEMENT;
  var bytes = computeUnpackAlignedImageSize(width, height, sizePerPixel);
  return heap.subarray(toTypedArrayIndex(pixels, heap), toTypedArrayIndex(pixels + bytes, heap));
};

var _emscripten_glTexImage2D = (target, level, internalFormat, width, height, border, format, type, pixels) => {
  if (GL.currentContext.version >= 2) {
    if (GLctx.currentPixelUnpackBufferBinding) {
      GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels);
      return;
    }
    if (pixels) {
      var heap = heapObjectForWebGLType(type);
      var index = toTypedArrayIndex(pixels, heap);
      GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, heap, index);
      return;
    }
  }
  var pixelData = pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) : null;
  GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixelData);
};

var _glTexImage2D = _emscripten_glTexImage2D;

var _emscripten_glTexParameterf = (x0, x1, x2) => GLctx.texParameterf(x0, x1, x2);

var _glTexParameterf = _emscripten_glTexParameterf;

var _emscripten_glTexParameteri = (x0, x1, x2) => GLctx.texParameteri(x0, x1, x2);

var _glTexParameteri = _emscripten_glTexParameteri;

var _emscripten_glTexSubImage2D = (target, level, xoffset, yoffset, width, height, format, type, pixels) => {
  if (GL.currentContext.version >= 2) {
    if (GLctx.currentPixelUnpackBufferBinding) {
      GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels);
      return;
    }
    if (pixels) {
      var heap = heapObjectForWebGLType(type);
      GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, heap, toTypedArrayIndex(pixels, heap));
      return;
    }
  }
  var pixelData = pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, 0) : null;
  GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixelData);
};

var _glTexSubImage2D = _emscripten_glTexSubImage2D;

var webglGetUniformLocation = location => {
  var p = GLctx.currentProgram;
  if (p) {
    var webglLoc = p.uniformLocsById[location];
    // p.uniformLocsById[location] stores either an integer, or a
    // WebGLUniformLocation.
    // If an integer, we have not yet bound the location, so do it now. The
    // integer value specifies the array index we should bind to.
    if (typeof webglLoc == "number") {
      p.uniformLocsById[location] = webglLoc = GLctx.getUniformLocation(p, p.uniformArrayNamesById[location] + (webglLoc > 0 ? `[${webglLoc}]` : ""));
    }
    // Else an already cached WebGLUniformLocation, return it.
    return webglLoc;
  } else {
    GL.recordError(1282);
  }
};

var _emscripten_glUniform1f = (location, v0) => {
  GLctx.uniform1f(webglGetUniformLocation(location), v0);
};

var _glUniform1f = _emscripten_glUniform1f;

var miniTempWebGLFloatBuffers = [];

var _emscripten_glUniform1fv = (location, count, value) => {
  if (GL.currentContext.version >= 2) {
    count && GLctx.uniform1fv(webglGetUniformLocation(location), HEAPF32, ((value) >> 2), count);
    return;
  }
  if (count <= 288) {
    // avoid allocation when uploading few enough uniforms
    var view = miniTempWebGLFloatBuffers[count];
    for (var i = 0; i < count; ++i) {
      view[i] = HEAPF32[SAFE_HEAP_INDEX(HEAPF32, (((value) + (4 * i)) >> 2), "loading")];
    }
  } else {
    var view = HEAPF32.subarray((((value) >> 2)), ((value + count * 4) >> 2));
  }
  GLctx.uniform1fv(webglGetUniformLocation(location), view);
};

var _glUniform1fv = _emscripten_glUniform1fv;

var _emscripten_glUniform1i = (location, v0) => {
  GLctx.uniform1i(webglGetUniformLocation(location), v0);
};

var _glUniform1i = _emscripten_glUniform1i;

var _emscripten_glUniform2fv = (location, count, value) => {
  if (GL.currentContext.version >= 2) {
    count && GLctx.uniform2fv(webglGetUniformLocation(location), HEAPF32, ((value) >> 2), count * 2);
    return;
  }
  if (count <= 144) {
    // avoid allocation when uploading few enough uniforms
    count *= 2;
    var view = miniTempWebGLFloatBuffers[count];
    for (var i = 0; i < count; i += 2) {
      view[i] = HEAPF32[SAFE_HEAP_INDEX(HEAPF32, (((value) + (4 * i)) >> 2), "loading")];
      view[i + 1] = HEAPF32[SAFE_HEAP_INDEX(HEAPF32, (((value) + (4 * i + 4)) >> 2), "loading")];
    }
  } else {
    var view = HEAPF32.subarray((((value) >> 2)), ((value + count * 8) >> 2));
  }
  GLctx.uniform2fv(webglGetUniformLocation(location), view);
};

var _glUniform2fv = _emscripten_glUniform2fv;

var _emscripten_glUniform3fv = (location, count, value) => {
  if (GL.currentContext.version >= 2) {
    count && GLctx.uniform3fv(webglGetUniformLocation(location), HEAPF32, ((value) >> 2), count * 3);
    return;
  }
  if (count <= 96) {
    // avoid allocation when uploading few enough uniforms
    count *= 3;
    var view = miniTempWebGLFloatBuffers[count];
    for (var i = 0; i < count; i += 3) {
      view[i] = HEAPF32[SAFE_HEAP_INDEX(HEAPF32, (((value) + (4 * i)) >> 2), "loading")];
      view[i + 1] = HEAPF32[SAFE_HEAP_INDEX(HEAPF32, (((value) + (4 * i + 4)) >> 2), "loading")];
      view[i + 2] = HEAPF32[SAFE_HEAP_INDEX(HEAPF32, (((value) + (4 * i + 8)) >> 2), "loading")];
    }
  } else {
    var view = HEAPF32.subarray((((value) >> 2)), ((value + count * 12) >> 2));
  }
  GLctx.uniform3fv(webglGetUniformLocation(location), view);
};

var _glUniform3fv = _emscripten_glUniform3fv;

var _emscripten_glUniform4fv = (location, count, value) => {
  if (GL.currentContext.version >= 2) {
    count && GLctx.uniform4fv(webglGetUniformLocation(location), HEAPF32, ((value) >> 2), count * 4);
    return;
  }
  if (count <= 72) {
    // avoid allocation when uploading few enough uniforms
    var view = miniTempWebGLFloatBuffers[4 * count];
    // hoist the heap out of the loop for size and for pthreads+growth.
    var heap = HEAPF32;
    value = ((value) >> 2);
    count *= 4;
    for (var i = 0; i < count; i += 4) {
      var dst = value + i;
      view[i] = heap[dst];
      view[i + 1] = heap[dst + 1];
      view[i + 2] = heap[dst + 2];
      view[i + 3] = heap[dst + 3];
    }
  } else {
    var view = HEAPF32.subarray((((value) >> 2)), ((value + count * 16) >> 2));
  }
  GLctx.uniform4fv(webglGetUniformLocation(location), view);
};

var _glUniform4fv = _emscripten_glUniform4fv;

var _emscripten_glUniformMatrix3fv = (location, count, transpose, value) => {
  if (GL.currentContext.version >= 2) {
    count && GLctx.uniformMatrix3fv(webglGetUniformLocation(location), !!transpose, HEAPF32, ((value) >> 2), count * 9);
    return;
  }
  if (count <= 32) {
    // avoid allocation when uploading few enough uniforms
    count *= 9;
    var view = miniTempWebGLFloatBuffers[count];
    for (var i = 0; i < count; i += 9) {
      view[i] = HEAPF32[SAFE_HEAP_INDEX(HEAPF32, (((value) + (4 * i)) >> 2), "loading")];
      view[i + 1] = HEAPF32[SAFE_HEAP_INDEX(HEAPF32, (((value) + (4 * i + 4)) >> 2), "loading")];
      view[i + 2] = HEAPF32[SAFE_HEAP_INDEX(HEAPF32, (((value) + (4 * i + 8)) >> 2), "loading")];
      view[i + 3] = HEAPF32[SAFE_HEAP_INDEX(HEAPF32, (((value) + (4 * i + 12)) >> 2), "loading")];
      view[i + 4] = HEAPF32[SAFE_HEAP_INDEX(HEAPF32, (((value) + (4 * i + 16)) >> 2), "loading")];
      view[i + 5] = HEAPF32[SAFE_HEAP_INDEX(HEAPF32, (((value) + (4 * i + 20)) >> 2), "loading")];
      view[i + 6] = HEAPF32[SAFE_HEAP_INDEX(HEAPF32, (((value) + (4 * i + 24)) >> 2), "loading")];
      view[i + 7] = HEAPF32[SAFE_HEAP_INDEX(HEAPF32, (((value) + (4 * i + 28)) >> 2), "loading")];
      view[i + 8] = HEAPF32[SAFE_HEAP_INDEX(HEAPF32, (((value) + (4 * i + 32)) >> 2), "loading")];
    }
  } else {
    var view = HEAPF32.subarray((((value) >> 2)), ((value + count * 36) >> 2));
  }
  GLctx.uniformMatrix3fv(webglGetUniformLocation(location), !!transpose, view);
};

var _glUniformMatrix3fv = _emscripten_glUniformMatrix3fv;

var _emscripten_glUniformMatrix4fv = (location, count, transpose, value) => {
  if (GL.currentContext.version >= 2) {
    count && GLctx.uniformMatrix4fv(webglGetUniformLocation(location), !!transpose, HEAPF32, ((value) >> 2), count * 16);
    return;
  }
  if (count <= 18) {
    // avoid allocation when uploading few enough uniforms
    var view = miniTempWebGLFloatBuffers[16 * count];
    // hoist the heap out of the loop for size and for pthreads+growth.
    var heap = HEAPF32;
    value = ((value) >> 2);
    count *= 16;
    for (var i = 0; i < count; i += 16) {
      var dst = value + i;
      view[i] = heap[dst];
      view[i + 1] = heap[dst + 1];
      view[i + 2] = heap[dst + 2];
      view[i + 3] = heap[dst + 3];
      view[i + 4] = heap[dst + 4];
      view[i + 5] = heap[dst + 5];
      view[i + 6] = heap[dst + 6];
      view[i + 7] = heap[dst + 7];
      view[i + 8] = heap[dst + 8];
      view[i + 9] = heap[dst + 9];
      view[i + 10] = heap[dst + 10];
      view[i + 11] = heap[dst + 11];
      view[i + 12] = heap[dst + 12];
      view[i + 13] = heap[dst + 13];
      view[i + 14] = heap[dst + 14];
      view[i + 15] = heap[dst + 15];
    }
  } else {
    var view = HEAPF32.subarray((((value) >> 2)), ((value + count * 64) >> 2));
  }
  GLctx.uniformMatrix4fv(webglGetUniformLocation(location), !!transpose, view);
};

var _glUniformMatrix4fv = _emscripten_glUniformMatrix4fv;

var _emscripten_glUseProgram = program => {
  program = GL.programs[program];
  GLctx.useProgram(program);
  // Record the currently active program so that we can access the uniform
  // mapping table of that program.
  GLctx.currentProgram = program;
};

var _glUseProgram = _emscripten_glUseProgram;

var _emscripten_glVertexAttribPointer = (index, size, type, normalized, stride, ptr) => {
  GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr);
};

var _glVertexAttribPointer = _emscripten_glVertexAttribPointer;

var _emscripten_glViewport = (x0, x1, x2, x3) => GLctx.viewport(x0, x1, x2, x3);

var _glViewport = _emscripten_glViewport;

var ALLOC_NORMAL = 0;

var updateTableMap = (offset, count) => {
  if (functionsInTableMap) {
    for (var i = offset; i < offset + count; i++) {
      var item = getWasmTableEntry(i);
      // Ignore null values.
      if (item) {
        functionsInTableMap.set(item, i);
      }
    }
  }
};

var functionsInTableMap;

var getFunctionAddress = func => {
  // First, create the map if this is the first use.
  if (!functionsInTableMap) {
    functionsInTableMap = new WeakMap;
    updateTableMap(0, wasmTable.length);
  }
  return functionsInTableMap.get(func) || 0;
};

var freeTableIndexes = [];

var getEmptyTableSlot = () => {
  // Reuse a free index if there is one, otherwise grow.
  if (freeTableIndexes.length) {
    return freeTableIndexes.pop();
  }
  try {
    // Grow the table
    return wasmTable["grow"](1);
  } catch (err) {
    if (!(err instanceof RangeError)) {
      throw err;
    }
    abort("Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.");
  }
};

var setWasmTableEntry = (idx, func) => {
  /** @suppress {checkTypes} */ wasmTable.set(idx, func);
  // With ABORT_ON_WASM_EXCEPTIONS wasmTable.get is overridden to return wrapped
  // functions so we need to call it here to retrieve the potential wrapper correctly
  // instead of just storing 'func' directly into wasmTableMirror
  /** @suppress {checkTypes} */ wasmTableMirror[idx] = wasmTable.get(idx);
};

var uleb128EncodeWithLen = arr => {
  const n = arr.length;
  assert(n < 16384);
  // Note: this LEB128 length encoding produces extra byte for n < 128,
  // but we don't care as it's only used in a temporary representation.
  return [ (n % 128) | 128, n >> 7, ...arr ];
};

var wasmTypeCodes = {
  "i": 127,
  // i32
  "p": 127,
  // i32
  "j": 126,
  // i64
  "f": 125,
  // f32
  "d": 124,
  // f64
  "e": 111
};

var generateTypePack = types => uleb128EncodeWithLen(Array.from(types, type => {
  var code = wasmTypeCodes[type];
  assert(code, `invalid signature char: ${type}`);
  return code;
}));

var convertJsFunctionToWasm = (func, sig) => {
  // Rest of the module is static
  var bytes = Uint8Array.of(0, 97, 115, 109, // magic ("\0asm")
  1, 0, 0, 0, // version: 1
  1, // Type section code
  // The module is static, with the exception of the type section, which is
  // generated based on the signature passed in.
  ...uleb128EncodeWithLen([ 1, // count: 1
  96, // param types
  ...generateTypePack(sig.slice(1)), // return types (for now only supporting [] if `void` and single [T] otherwise)
  ...generateTypePack(sig[0] === "v" ? "" : sig[0]) ]), // The rest of the module is static
  2, 7, // import section
  // (import "e" "f" (func 0 (type 0)))
  1, 1, 101, 1, 102, 0, 0, 7, 5, // export section
  // (export "f" (func 0 (type 0)))
  1, 1, 102, 0, 0);
  // We can compile this wasm module synchronously because it is very small.
  // This accepts an import (at "e.f"), that it reroutes to an export (at "f")
  var module = new WebAssembly.Module(bytes);
  var instance = new WebAssembly.Instance(module, {
    "e": {
      "f": func
    }
  });
  var wrappedFunc = instance.exports["f"];
  return wrappedFunc;
};

/** @param {string=} sig */ var addFunction = (func, sig) => {
  assert(typeof func != "undefined");
  // Check if the function is already in the table, to ensure each function
  // gets a unique index.
  var rtn = getFunctionAddress(func);
  if (rtn) {
    return rtn;
  }
  // It's not in the table, add it now.
  var ret = getEmptyTableSlot();
  // Set the new value.
  try {
    // Attempting to call this with JS function will cause table.set() to fail
    setWasmTableEntry(ret, func);
  } catch (err) {
    if (!(err instanceof TypeError)) {
      throw err;
    }
    assert(typeof sig != "undefined", "Missing signature argument to addFunction: " + func);
    var wrapped = convertJsFunctionToWasm(func, sig);
    setWasmTableEntry(ret, wrapped);
  }
  functionsInTableMap.set(func, ret);
  return ret;
};

var ALLOC_STACK = 1;

var allocate = (slab, allocator) => {
  var ret;
  assert(typeof allocator == "number", "allocate no longer takes a type argument");
  assert(typeof slab != "number", "allocate no longer takes a number as arg0");
  if (allocator == ALLOC_STACK) {
    ret = stackAlloc(slab.length);
  } else {
    ret = _malloc(slab.length);
  }
  if (!slab.subarray && !slab.slice) {
    slab = new Uint8Array(slab);
  }
  HEAPU8.set(slab, ret);
  return ret;
};

var getCFunc = ident => {
  var func = Module["_" + ident];
  // closure exported function
  assert(func, "Cannot call unknown function " + ident + ", make sure it is exported");
  return func;
};

var writeArrayToMemory = (array, buffer) => {
  assert(array.length >= 0, "writeArrayToMemory array must have a length (should be an array or typed array)");
  HEAP8.set(array, buffer);
};

/**
   * @param {string|null=} returnType
   * @param {Array=} argTypes
   * @param {Array=} args
   * @param {Object=} opts
   */ var ccall = (ident, returnType, argTypes, args, opts) => {
  // For fast lookup of conversion functions
  var toC = {
    "string": str => {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) {
        // null string
        ret = stringToUTF8OnStack(str);
      }
      return ret;
    },
    "array": arr => {
      var ret = stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    }
  };
  function convertReturnValue(ret) {
    if (returnType === "string") {
      return UTF8ToString(ret);
    }
    if (returnType === "boolean") return Boolean(ret);
    return ret;
  }
  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  assert(returnType !== "array", 'Return type should not be "array".');
  if (args) {
    for (var i = 0; i < args.length; i++) {
      var converter = toC[argTypes[i]];
      if (converter) {
        if (stack === 0) stack = stackSave();
        cArgs[i] = converter(args[i]);
      } else {
        cArgs[i] = args[i];
      }
    }
  }
  var ret = func(...cArgs);
  function onDone(ret) {
    if (stack !== 0) stackRestore(stack);
    return convertReturnValue(ret);
  }
  ret = onDone(ret);
  return ret;
};

/**
   * @param {string=} returnType
   * @param {Array=} argTypes
   * @param {Object=} opts
   */ var cwrap = (ident, returnType, argTypes, opts) => (...args) => ccall(ident, returnType, argTypes, args, opts);

/** @type {function(string, boolean=, number=)} */ var intArrayFromString = (stringy, dontAddNull, length) => {
  var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
};

var removeFunction = index => {
  functionsInTableMap.delete(getWasmTableEntry(index));
  setWasmTableEntry(index, null);
  freeTableIndexes.push(index);
};

/** @param {boolean=} dontAddNull */ var writeAsciiToMemory = (str, buffer, dontAddNull) => {
  for (var i = 0; i < str.length; ++i) {
    assert(str.charCodeAt(i) === (str.charCodeAt(i) & 255));
    HEAP8[SAFE_HEAP_INDEX(HEAP8, buffer++, "storing")] = str.charCodeAt(i);
  }
  // Null-terminate the string
  if (!dontAddNull) HEAP8[SAFE_HEAP_INDEX(HEAP8, buffer, "storing")] = 0;
};

var miniTempWebGLFloatBuffersStorage = new Float32Array(288);

// Create GL_POOL_TEMP_BUFFERS_SIZE+1 temporary buffers, for uploads of size 0 through GL_POOL_TEMP_BUFFERS_SIZE inclusive
for (/**@suppress{duplicate}*/ var i = 0; i <= 288; ++i) {
  miniTempWebGLFloatBuffers[i] = miniTempWebGLFloatBuffersStorage.subarray(0, i);
}

// End JS library code
// include: postlibrary.js
// This file is included after the automatically-generated JS library code
// but before the wasm module is created.
{
  // Begin ATMODULES hooks
  if (Module["noExitRuntime"]) noExitRuntime = Module["noExitRuntime"];
  if (Module["print"]) out = Module["print"];
  if (Module["printErr"]) err = Module["printErr"];
  if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
  Module["FS_createDataFile"] = FS.createDataFile;
  Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
  // End ATMODULES hooks
  checkIncomingModuleAPI();
  if (Module["arguments"]) arguments_ = Module["arguments"];
  if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
  // Assertions on removed incoming Module JS APIs.
  assert(typeof Module["memoryInitializerPrefixURL"] == "undefined", "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead");
  assert(typeof Module["pthreadMainPrefixURL"] == "undefined", "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead");
  assert(typeof Module["cdInitializerPrefixURL"] == "undefined", "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead");
  assert(typeof Module["filePackagePrefixURL"] == "undefined", "Module.filePackagePrefixURL option was removed, use Module.locateFile instead");
  assert(typeof Module["read"] == "undefined", "Module.read option was removed");
  assert(typeof Module["readAsync"] == "undefined", "Module.readAsync option was removed (modify readAsync in JS)");
  assert(typeof Module["readBinary"] == "undefined", "Module.readBinary option was removed (modify readBinary in JS)");
  assert(typeof Module["setWindowTitle"] == "undefined", "Module.setWindowTitle option was removed (modify emscripten_set_window_title in JS)");
  assert(typeof Module["TOTAL_MEMORY"] == "undefined", "Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY");
  assert(typeof Module["ENVIRONMENT"] == "undefined", "Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)");
  assert(typeof Module["STACK_SIZE"] == "undefined", "STACK_SIZE can no longer be set at runtime.  Use -sSTACK_SIZE at link time");
  // If memory is defined in wasm, the user can't provide it, or set INITIAL_MEMORY
  assert(typeof Module["wasmMemory"] == "undefined", "Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally");
  assert(typeof Module["INITIAL_MEMORY"] == "undefined", "Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically");
  if (Module["preInit"]) {
    if (typeof Module["preInit"] == "function") Module["preInit"] = [ Module["preInit"] ];
    while (Module["preInit"].length > 0) {
      Module["preInit"].shift()();
    }
  }
  consumedModuleProp("preInit");
}

// Begin runtime exports
Module["ccall"] = ccall;

Module["cwrap"] = cwrap;

Module["addFunction"] = addFunction;

Module["removeFunction"] = removeFunction;

Module["setValue"] = setValue;

Module["getValue"] = getValue;

Module["UTF8ToString"] = UTF8ToString;

Module["stringToUTF8"] = stringToUTF8;

Module["lengthBytesUTF8"] = lengthBytesUTF8;

Module["intArrayFromString"] = intArrayFromString;

Module["writeArrayToMemory"] = writeArrayToMemory;

Module["GL"] = GL;

Module["ALLOC_NORMAL"] = ALLOC_NORMAL;

Module["allocate"] = allocate;

Module["writeAsciiToMemory"] = writeAsciiToMemory;

var missingLibrarySymbols = [ "writeI53ToI64Clamped", "writeI53ToI64Signaling", "writeI53ToU64Clamped", "writeI53ToU64Signaling", "convertI32PairToI53", "convertI32PairToI53Checked", "convertU32PairToI53", "getTempRet0", "setTempRet0", "createNamedFunction", "zeroMemory", "withStackSave", "strError", "inetPton4", "inetNtop4", "inetPton6", "inetNtop6", "readSockaddr", "writeSockaddr", "readEmAsmArgs", "getExecutableName", "autoResumeAudioContext", "getDynCaller", "dynCall", "handleException", "runtimeKeepalivePush", "runtimeKeepalivePop", "callUserCallback", "maybeExit", "asyncLoad", "asmjsMangle", "mmapAlloc", "HandleAllocator", "getUniqueRunDependency", "addRunDependency", "removeRunDependency", "addOnInit", "addOnPostCtor", "addOnPreMain", "addOnExit", "STACK_SIZE", "STACK_ALIGN", "POINTER_SIZE", "ASSERTIONS", "intArrayToString", "AsciiToString", "stringToAscii", "UTF16ToString", "stringToUTF16", "lengthBytesUTF16", "UTF32ToString", "stringToUTF32", "lengthBytesUTF32", "stringToNewUTF8", "registerKeyEventCallback", "maybeCStringToJsString", "findEventTarget", "getBoundingClientRect", "fillMouseEventData", "registerMouseEventCallback", "registerWheelEventCallback", "registerUiEventCallback", "registerFocusEventCallback", "fillDeviceOrientationEventData", "registerDeviceOrientationEventCallback", "fillDeviceMotionEventData", "registerDeviceMotionEventCallback", "screenOrientation", "fillOrientationChangeEventData", "registerOrientationChangeEventCallback", "fillFullscreenChangeEventData", "registerFullscreenChangeEventCallback", "JSEvents_requestFullscreen", "JSEvents_resizeCanvasForFullscreen", "registerRestoreOldStyle", "hideEverythingExceptGivenElement", "restoreHiddenElements", "setLetterbox", "softFullscreenResizeWebGLRenderTarget", "doRequestFullscreen", "fillPointerlockChangeEventData", "registerPointerlockChangeEventCallback", "registerPointerlockErrorEventCallback", "requestPointerLock", "fillVisibilityChangeEventData", "registerVisibilityChangeEventCallback", "registerTouchEventCallback", "fillGamepadEventData", "registerGamepadEventCallback", "registerBeforeUnloadEventCallback", "fillBatteryEventData", "registerBatteryEventCallback", "setCanvasElementSize", "getCanvasElementSize", "jsStackTrace", "getCallstack", "convertPCtoSourceLocation", "getEnvStrings", "checkWasiClock", "wasiRightsToMuslOFlags", "wasiOFlagsToMuslOFlags", "initRandomFill", "randomFill", "safeSetTimeout", "setImmediateWrapped", "safeRequestAnimationFrame", "clearImmediateWrapped", "registerPostMainLoop", "registerPreMainLoop", "getPromise", "makePromise", "idsToPromises", "makePromiseCallback", "ExceptionInfo", "findMatchingCatch", "Browser_asyncPrepareDataCounter", "isLeapYear", "ydayFromDate", "arraySum", "addDays", "getSocketFromFD", "getSocketAddress", "emscriptenWebGLGetUniform", "emscriptenWebGLGetVertexAttrib", "writeGLArray", "registerWebGlEventCallback", "runAndAbortIfError", "emscriptenWebGLGetIndexed", "writeStringToMemory", "allocateUTF8", "allocateUTF8OnStack", "demangle", "stackTrace", "getNativeTypeSize" ];

missingLibrarySymbols.forEach(missingLibrarySymbol);

var unexportedSymbols = [ "run", "out", "err", "callMain", "abort", "wasmExports", "writeStackCookie", "checkStackCookie", "writeI53ToI64", "readI53FromI64", "readI53FromU64", "INT53_MAX", "INT53_MIN", "bigintToI53Checked", "HEAP8", "HEAPU8", "HEAP16", "HEAPU16", "HEAP32", "HEAPU32", "HEAPF32", "HEAPF64", "HEAP64", "HEAPU64", "stackSave", "stackRestore", "stackAlloc", "ptrToString", "exitJS", "getHeapMax", "growMemory", "ENV", "ERRNO_CODES", "DNS", "Protocols", "Sockets", "timers", "warnOnce", "readEmAsmArgsArray", "jstoi_q", "keepRuntimeAlive", "alignMemory", "wasmTable", "wasmMemory", "noExitRuntime", "addOnPreRun", "addOnPostRun", "convertJsFunctionToWasm", "freeTableIndexes", "functionsInTableMap", "getEmptyTableSlot", "updateTableMap", "getFunctionAddress", "PATH", "PATH_FS", "UTF8Decoder", "UTF8ArrayToString", "stringToUTF8Array", "UTF16Decoder", "stringToUTF8OnStack", "JSEvents", "specialHTMLTargets", "findCanvasEventTarget", "currentFullscreenStrategy", "restoreOldWindowedStyle", "UNWIND_CACHE", "ExitStatus", "flush_NO_FILESYSTEM", "emSetImmediate", "emClearImmediate_deps", "emClearImmediate", "promiseMap", "uncaughtExceptionCount", "exceptionLast", "exceptionCaught", "Browser", "requestFullscreen", "requestFullScreen", "setCanvasSize", "getUserMedia", "createContext", "getPreloadedImageData__data", "wget", "MONTH_DAYS_REGULAR", "MONTH_DAYS_LEAP", "MONTH_DAYS_REGULAR_CUMULATIVE", "MONTH_DAYS_LEAP_CUMULATIVE", "SYSCALLS", "tempFixedLengthArray", "miniTempWebGLFloatBuffers", "miniTempWebGLIntBuffers", "heapObjectForWebGLType", "toTypedArrayIndex", "webgl_enable_ANGLE_instanced_arrays", "webgl_enable_OES_vertex_array_object", "webgl_enable_WEBGL_draw_buffers", "webgl_enable_WEBGL_multi_draw", "webgl_enable_EXT_polygon_offset_clamp", "webgl_enable_EXT_clip_control", "webgl_enable_WEBGL_polygon_mode", "emscriptenWebGLGet", "computeUnpackAlignedImageSize", "colorChannelsInGlTextureFormat", "emscriptenWebGLGetTexPixelData", "webglGetUniformLocation", "webglPrepareUniformLocationsBeforeFirstUse", "webglGetLeftBracePos", "__glGetActiveAttribOrUniform", "AL", "GLUT", "EGL", "GLEW", "IDBStore", "SDL", "SDL_gfx", "webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance", "webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance", "ALLOC_STACK", "print", "printErr", "jstoi_s" ];

unexportedSymbols.forEach(unexportedRuntimeSymbol);

// End runtime exports
// Begin JS library exports
// End JS library exports
// end include: postlibrary.js
function checkIncomingModuleAPI() {
  ignoredModuleProp("fetchSettings");
  ignoredModuleProp("logReadFiles");
  ignoredModuleProp("loadSplitModule");
  ignoredModuleProp("onMalloc");
  ignoredModuleProp("onRealloc");
  ignoredModuleProp("onFree");
  ignoredModuleProp("onSbrkGrow");
}

// Imports from the Wasm binary.
var _malloc = Module["_malloc"] = makeInvalidEarlyAccess("_malloc");

var _obj_retain = Module["_obj_retain"] = makeInvalidEarlyAccess("_obj_retain");

var _obj_release = Module["_obj_release"] = makeInvalidEarlyAccess("_obj_release");

var _free = Module["_free"] = makeInvalidEarlyAccess("_free");

var _core_get_module = Module["_core_get_module"] = makeInvalidEarlyAccess("_core_get_module");

var _core_init = Module["_core_init"] = makeInvalidEarlyAccess("_core_init");

var _module_add_new = Module["_module_add_new"] = makeInvalidEarlyAccess("_module_add_new");

var _observer_update = Module["_observer_update"] = makeInvalidEarlyAccess("_observer_update");

var _core_update = Module["_core_update"] = makeInvalidEarlyAccess("_core_update");

var _core_render = Module["_core_render"] = makeInvalidEarlyAccess("_core_render");

var _convert_frame = Module["_convert_frame"] = makeInvalidEarlyAccess("_convert_frame");

var _core_on_mouse = Module["_core_on_mouse"] = makeInvalidEarlyAccess("_core_on_mouse");

var _core_on_pinch = Module["_core_on_pinch"] = makeInvalidEarlyAccess("_core_on_pinch");

var _core_on_key = Module["_core_on_key"] = makeInvalidEarlyAccess("_core_on_key");

var _core_on_zoom = Module["_core_on_zoom"] = makeInvalidEarlyAccess("_core_on_zoom");

var _core_lookat = Module["_core_lookat"] = makeInvalidEarlyAccess("_core_lookat");

var _core_point_and_lock = Module["_core_point_and_lock"] = makeInvalidEarlyAccess("_core_point_and_lock");

var _core_zoomto = Module["_core_zoomto"] = makeInvalidEarlyAccess("_core_zoomto");

var _core_set_time = Module["_core_set_time"] = makeInvalidEarlyAccess("_core_set_time");

var _otype_to_str = Module["_otype_to_str"] = makeInvalidEarlyAccess("_otype_to_str");

var _core_search = Module["_core_search"] = makeInvalidEarlyAccess("_core_search");

var _obj_get_designations = Module["_obj_get_designations"] = makeInvalidEarlyAccess("_obj_get_designations");

var _designation_cleanup = Module["_designation_cleanup"] = makeInvalidEarlyAccess("_designation_cleanup");

var _compute_event = Module["_compute_event"] = makeInvalidEarlyAccess("_compute_event");

var _convert_framev4 = Module["_convert_framev4"] = makeInvalidEarlyAccess("_convert_framev4");

var _module_update = Module["_module_update"] = makeInvalidEarlyAccess("_module_update");

var _module_list_objs2 = Module["_module_list_objs2"] = makeInvalidEarlyAccess("_module_list_objs2");

var _module_add_data_source = Module["_module_add_data_source"] = makeInvalidEarlyAccess("_module_add_data_source");

var _module_add_global_listener = Module["_module_add_global_listener"] = makeInvalidEarlyAccess("_module_add_global_listener");

var _module_add = Module["_module_add"] = makeInvalidEarlyAccess("_module_add");

var _module_remove = Module["_module_remove"] = makeInvalidEarlyAccess("_module_remove");

var _module_get_child = Module["_module_get_child"] = makeInvalidEarlyAccess("_module_get_child");

var _module_get_tree = Module["_module_get_tree"] = makeInvalidEarlyAccess("_module_get_tree");

var _module_get_path = Module["_module_get_path"] = makeInvalidEarlyAccess("_module_get_path");

var _obj_create_str = Module["_obj_create_str"] = makeInvalidEarlyAccess("_obj_create_str");

var _obj_clone = Module["_obj_clone"] = makeInvalidEarlyAccess("_obj_clone");

var _obj_get_info_json = Module["_obj_get_info_json"] = makeInvalidEarlyAccess("_obj_get_info_json");

var _obj_get_id = Module["_obj_get_id"] = makeInvalidEarlyAccess("_obj_get_id");

var _obj_get_json_data_str = Module["_obj_get_json_data_str"] = makeInvalidEarlyAccess("_obj_get_json_data_str");

var _obj_get_attr_ = Module["_obj_get_attr_"] = makeInvalidEarlyAccess("_obj_get_attr_");

var _obj_foreach_attr = Module["_obj_foreach_attr"] = makeInvalidEarlyAccess("_obj_foreach_attr");

var _obj_foreach_child = Module["_obj_foreach_child"] = makeInvalidEarlyAccess("_obj_foreach_child");

var _obj_call_json_str = Module["_obj_call_json_str"] = makeInvalidEarlyAccess("_obj_call_json_str");

var _core_add_font = Module["_core_add_font"] = makeInvalidEarlyAccess("_core_add_font");

var _fflush = makeInvalidEarlyAccess("_fflush");

var _get_compiler_str = Module["_get_compiler_str"] = makeInvalidEarlyAccess("_get_compiler_str");

var _a2tf_json = Module["_a2tf_json"] = makeInvalidEarlyAccess("_a2tf_json");

var _a2af_json = Module["_a2af_json"] = makeInvalidEarlyAccess("_a2af_json");

var _sys_set_translate_function = Module["_sys_set_translate_function"] = makeInvalidEarlyAccess("_sys_set_translate_function");

var _tests_run = Module["_tests_run"] = makeInvalidEarlyAccess("_tests_run");

var _geojson_set_bool_ptr_ = Module["_geojson_set_bool_ptr_"] = makeInvalidEarlyAccess("_geojson_set_bool_ptr_");

var _geojson_set_color_ptr_ = Module["_geojson_set_color_ptr_"] = makeInvalidEarlyAccess("_geojson_set_color_ptr_");

var _geojson_remove_all_features = Module["_geojson_remove_all_features"] = makeInvalidEarlyAccess("_geojson_remove_all_features");

var _geojson_filter_all = Module["_geojson_filter_all"] = makeInvalidEarlyAccess("_geojson_filter_all");

var _geojson_add_poly_feature = Module["_geojson_add_poly_feature"] = makeInvalidEarlyAccess("_geojson_add_poly_feature");

var _geojson_query_rendered_features = Module["_geojson_query_rendered_features"] = makeInvalidEarlyAccess("_geojson_query_rendered_features");

var _geojson_set_on_new_tile_callback = Module["_geojson_set_on_new_tile_callback"] = makeInvalidEarlyAccess("_geojson_set_on_new_tile_callback");

var _geojson_survey_query_rendered_features = Module["_geojson_survey_query_rendered_features"] = makeInvalidEarlyAccess("_geojson_survey_query_rendered_features");

var _skycultures_get_designations = Module["_skycultures_get_designations"] = makeInvalidEarlyAccess("_skycultures_get_designations");

var _skycultures_get_cultural_names_json = Module["_skycultures_get_cultural_names_json"] = makeInvalidEarlyAccess("_skycultures_get_cultural_names_json");

var _sbrk = makeInvalidEarlyAccess("_sbrk");

var _emscripten_get_sbrk_ptr = makeInvalidEarlyAccess("_emscripten_get_sbrk_ptr");

var _setThrew = makeInvalidEarlyAccess("_setThrew");

var _emscripten_stack_init = makeInvalidEarlyAccess("_emscripten_stack_init");

var _emscripten_stack_get_free = makeInvalidEarlyAccess("_emscripten_stack_get_free");

var _emscripten_stack_get_base = makeInvalidEarlyAccess("_emscripten_stack_get_base");

var _emscripten_stack_get_end = makeInvalidEarlyAccess("_emscripten_stack_get_end");

var __emscripten_stack_restore = makeInvalidEarlyAccess("__emscripten_stack_restore");

var __emscripten_stack_alloc = makeInvalidEarlyAccess("__emscripten_stack_alloc");

var _emscripten_stack_get_current = makeInvalidEarlyAccess("_emscripten_stack_get_current");

var memory = makeInvalidEarlyAccess("memory");

var __indirect_function_table = makeInvalidEarlyAccess("__indirect_function_table");

var wasmMemory = makeInvalidEarlyAccess("wasmMemory");

var wasmTable = makeInvalidEarlyAccess("wasmTable");

function assignWasmExports(wasmExports) {
  assert(typeof wasmExports["malloc"] != "undefined", "missing Wasm export: malloc");
  assert(typeof wasmExports["obj_retain"] != "undefined", "missing Wasm export: obj_retain");
  assert(typeof wasmExports["obj_release"] != "undefined", "missing Wasm export: obj_release");
  assert(typeof wasmExports["free"] != "undefined", "missing Wasm export: free");
  assert(typeof wasmExports["core_get_module"] != "undefined", "missing Wasm export: core_get_module");
  assert(typeof wasmExports["core_init"] != "undefined", "missing Wasm export: core_init");
  assert(typeof wasmExports["module_add_new"] != "undefined", "missing Wasm export: module_add_new");
  assert(typeof wasmExports["observer_update"] != "undefined", "missing Wasm export: observer_update");
  assert(typeof wasmExports["core_update"] != "undefined", "missing Wasm export: core_update");
  assert(typeof wasmExports["core_render"] != "undefined", "missing Wasm export: core_render");
  assert(typeof wasmExports["convert_frame"] != "undefined", "missing Wasm export: convert_frame");
  assert(typeof wasmExports["core_on_mouse"] != "undefined", "missing Wasm export: core_on_mouse");
  assert(typeof wasmExports["core_on_pinch"] != "undefined", "missing Wasm export: core_on_pinch");
  assert(typeof wasmExports["core_on_key"] != "undefined", "missing Wasm export: core_on_key");
  assert(typeof wasmExports["core_on_zoom"] != "undefined", "missing Wasm export: core_on_zoom");
  assert(typeof wasmExports["core_lookat"] != "undefined", "missing Wasm export: core_lookat");
  assert(typeof wasmExports["core_point_and_lock"] != "undefined", "missing Wasm export: core_point_and_lock");
  assert(typeof wasmExports["core_zoomto"] != "undefined", "missing Wasm export: core_zoomto");
  assert(typeof wasmExports["core_set_time"] != "undefined", "missing Wasm export: core_set_time");
  assert(typeof wasmExports["otype_to_str"] != "undefined", "missing Wasm export: otype_to_str");
  assert(typeof wasmExports["core_search"] != "undefined", "missing Wasm export: core_search");
  assert(typeof wasmExports["obj_get_designations"] != "undefined", "missing Wasm export: obj_get_designations");
  assert(typeof wasmExports["designation_cleanup"] != "undefined", "missing Wasm export: designation_cleanup");
  assert(typeof wasmExports["compute_event"] != "undefined", "missing Wasm export: compute_event");
  assert(typeof wasmExports["convert_framev4"] != "undefined", "missing Wasm export: convert_framev4");
  assert(typeof wasmExports["module_update"] != "undefined", "missing Wasm export: module_update");
  assert(typeof wasmExports["module_list_objs2"] != "undefined", "missing Wasm export: module_list_objs2");
  assert(typeof wasmExports["module_add_data_source"] != "undefined", "missing Wasm export: module_add_data_source");
  assert(typeof wasmExports["module_add_global_listener"] != "undefined", "missing Wasm export: module_add_global_listener");
  assert(typeof wasmExports["module_add"] != "undefined", "missing Wasm export: module_add");
  assert(typeof wasmExports["module_remove"] != "undefined", "missing Wasm export: module_remove");
  assert(typeof wasmExports["module_get_child"] != "undefined", "missing Wasm export: module_get_child");
  assert(typeof wasmExports["module_get_tree"] != "undefined", "missing Wasm export: module_get_tree");
  assert(typeof wasmExports["module_get_path"] != "undefined", "missing Wasm export: module_get_path");
  assert(typeof wasmExports["obj_create_str"] != "undefined", "missing Wasm export: obj_create_str");
  assert(typeof wasmExports["obj_clone"] != "undefined", "missing Wasm export: obj_clone");
  assert(typeof wasmExports["obj_get_info_json"] != "undefined", "missing Wasm export: obj_get_info_json");
  assert(typeof wasmExports["obj_get_id"] != "undefined", "missing Wasm export: obj_get_id");
  assert(typeof wasmExports["obj_get_json_data_str"] != "undefined", "missing Wasm export: obj_get_json_data_str");
  assert(typeof wasmExports["obj_get_attr_"] != "undefined", "missing Wasm export: obj_get_attr_");
  assert(typeof wasmExports["obj_foreach_attr"] != "undefined", "missing Wasm export: obj_foreach_attr");
  assert(typeof wasmExports["obj_foreach_child"] != "undefined", "missing Wasm export: obj_foreach_child");
  assert(typeof wasmExports["obj_call_json_str"] != "undefined", "missing Wasm export: obj_call_json_str");
  assert(typeof wasmExports["core_add_font"] != "undefined", "missing Wasm export: core_add_font");
  assert(typeof wasmExports["fflush"] != "undefined", "missing Wasm export: fflush");
  assert(typeof wasmExports["get_compiler_str"] != "undefined", "missing Wasm export: get_compiler_str");
  assert(typeof wasmExports["a2tf_json"] != "undefined", "missing Wasm export: a2tf_json");
  assert(typeof wasmExports["a2af_json"] != "undefined", "missing Wasm export: a2af_json");
  assert(typeof wasmExports["sys_set_translate_function"] != "undefined", "missing Wasm export: sys_set_translate_function");
  assert(typeof wasmExports["tests_run"] != "undefined", "missing Wasm export: tests_run");
  assert(typeof wasmExports["geojson_set_bool_ptr_"] != "undefined", "missing Wasm export: geojson_set_bool_ptr_");
  assert(typeof wasmExports["geojson_set_color_ptr_"] != "undefined", "missing Wasm export: geojson_set_color_ptr_");
  assert(typeof wasmExports["geojson_remove_all_features"] != "undefined", "missing Wasm export: geojson_remove_all_features");
  assert(typeof wasmExports["geojson_filter_all"] != "undefined", "missing Wasm export: geojson_filter_all");
  assert(typeof wasmExports["geojson_add_poly_feature"] != "undefined", "missing Wasm export: geojson_add_poly_feature");
  assert(typeof wasmExports["geojson_query_rendered_features"] != "undefined", "missing Wasm export: geojson_query_rendered_features");
  assert(typeof wasmExports["geojson_set_on_new_tile_callback"] != "undefined", "missing Wasm export: geojson_set_on_new_tile_callback");
  assert(typeof wasmExports["geojson_survey_query_rendered_features"] != "undefined", "missing Wasm export: geojson_survey_query_rendered_features");
  assert(typeof wasmExports["skycultures_get_designations"] != "undefined", "missing Wasm export: skycultures_get_designations");
  assert(typeof wasmExports["skycultures_get_cultural_names_json"] != "undefined", "missing Wasm export: skycultures_get_cultural_names_json");
  assert(typeof wasmExports["sbrk"] != "undefined", "missing Wasm export: sbrk");
  assert(typeof wasmExports["emscripten_get_sbrk_ptr"] != "undefined", "missing Wasm export: emscripten_get_sbrk_ptr");
  assert(typeof wasmExports["setThrew"] != "undefined", "missing Wasm export: setThrew");
  assert(typeof wasmExports["emscripten_stack_init"] != "undefined", "missing Wasm export: emscripten_stack_init");
  assert(typeof wasmExports["emscripten_stack_get_free"] != "undefined", "missing Wasm export: emscripten_stack_get_free");
  assert(typeof wasmExports["emscripten_stack_get_base"] != "undefined", "missing Wasm export: emscripten_stack_get_base");
  assert(typeof wasmExports["emscripten_stack_get_end"] != "undefined", "missing Wasm export: emscripten_stack_get_end");
  assert(typeof wasmExports["_emscripten_stack_restore"] != "undefined", "missing Wasm export: _emscripten_stack_restore");
  assert(typeof wasmExports["_emscripten_stack_alloc"] != "undefined", "missing Wasm export: _emscripten_stack_alloc");
  assert(typeof wasmExports["emscripten_stack_get_current"] != "undefined", "missing Wasm export: emscripten_stack_get_current");
  assert(typeof wasmExports["memory"] != "undefined", "missing Wasm export: memory");
  assert(typeof wasmExports["__indirect_function_table"] != "undefined", "missing Wasm export: __indirect_function_table");
  _malloc = Module["_malloc"] = createExportWrapper("malloc", 1);
  _obj_retain = Module["_obj_retain"] = createExportWrapper("obj_retain", 1);
  _obj_release = Module["_obj_release"] = createExportWrapper("obj_release", 1);
  _free = Module["_free"] = createExportWrapper("free", 1);
  _core_get_module = Module["_core_get_module"] = createExportWrapper("core_get_module", 1);
  _core_init = Module["_core_init"] = createExportWrapper("core_init", 3);
  _module_add_new = Module["_module_add_new"] = createExportWrapper("module_add_new", 3);
  _observer_update = Module["_observer_update"] = createExportWrapper("observer_update", 2);
  _core_update = Module["_core_update"] = createExportWrapper("core_update", 0);
  _core_render = Module["_core_render"] = createExportWrapper("core_render", 3);
  _convert_frame = Module["_convert_frame"] = createExportWrapper("convert_frame", 6);
  _core_on_mouse = Module["_core_on_mouse"] = createExportWrapper("core_on_mouse", 5);
  _core_on_pinch = Module["_core_on_pinch"] = createExportWrapper("core_on_pinch", 5);
  _core_on_key = Module["_core_on_key"] = createExportWrapper("core_on_key", 2);
  _core_on_zoom = Module["_core_on_zoom"] = createExportWrapper("core_on_zoom", 3);
  _core_lookat = Module["_core_lookat"] = createExportWrapper("core_lookat", 2);
  _core_point_and_lock = Module["_core_point_and_lock"] = createExportWrapper("core_point_and_lock", 2);
  _core_zoomto = Module["_core_zoomto"] = createExportWrapper("core_zoomto", 2);
  _core_set_time = Module["_core_set_time"] = createExportWrapper("core_set_time", 2);
  _otype_to_str = Module["_otype_to_str"] = createExportWrapper("otype_to_str", 1);
  _core_search = Module["_core_search"] = createExportWrapper("core_search", 1);
  _obj_get_designations = Module["_obj_get_designations"] = createExportWrapper("obj_get_designations", 3);
  _designation_cleanup = Module["_designation_cleanup"] = createExportWrapper("designation_cleanup", 4);
  _compute_event = Module["_compute_event"] = createExportWrapper("compute_event", 6);
  _convert_framev4 = Module["_convert_framev4"] = createExportWrapper("convert_framev4", 5);
  _module_update = Module["_module_update"] = createExportWrapper("module_update", 2);
  _module_list_objs2 = Module["_module_list_objs2"] = createExportWrapper("module_list_objs2", 5);
  _module_add_data_source = Module["_module_add_data_source"] = createExportWrapper("module_add_data_source", 3);
  _module_add_global_listener = Module["_module_add_global_listener"] = createExportWrapper("module_add_global_listener", 1);
  _module_add = Module["_module_add"] = createExportWrapper("module_add", 2);
  _module_remove = Module["_module_remove"] = createExportWrapper("module_remove", 2);
  _module_get_child = Module["_module_get_child"] = createExportWrapper("module_get_child", 2);
  _module_get_tree = Module["_module_get_tree"] = createExportWrapper("module_get_tree", 2);
  _module_get_path = Module["_module_get_path"] = createExportWrapper("module_get_path", 2);
  _obj_create_str = Module["_obj_create_str"] = createExportWrapper("obj_create_str", 2);
  _obj_clone = Module["_obj_clone"] = createExportWrapper("obj_clone", 1);
  _obj_get_info_json = Module["_obj_get_info_json"] = createExportWrapper("obj_get_info_json", 3);
  _obj_get_id = Module["_obj_get_id"] = createExportWrapper("obj_get_id", 1);
  _obj_get_json_data_str = Module["_obj_get_json_data_str"] = createExportWrapper("obj_get_json_data_str", 1);
  _obj_get_attr_ = Module["_obj_get_attr_"] = createExportWrapper("obj_get_attr_", 2);
  _obj_foreach_attr = Module["_obj_foreach_attr"] = createExportWrapper("obj_foreach_attr", 3);
  _obj_foreach_child = Module["_obj_foreach_child"] = createExportWrapper("obj_foreach_child", 2);
  _obj_call_json_str = Module["_obj_call_json_str"] = createExportWrapper("obj_call_json_str", 3);
  _core_add_font = Module["_core_add_font"] = createExportWrapper("core_add_font", 5);
  _fflush = createExportWrapper("fflush", 1);
  _get_compiler_str = Module["_get_compiler_str"] = createExportWrapper("get_compiler_str", 0);
  _a2tf_json = Module["_a2tf_json"] = createExportWrapper("a2tf_json", 2);
  _a2af_json = Module["_a2af_json"] = createExportWrapper("a2af_json", 2);
  _sys_set_translate_function = Module["_sys_set_translate_function"] = createExportWrapper("sys_set_translate_function", 1);
  _tests_run = Module["_tests_run"] = createExportWrapper("tests_run", 1);
  _geojson_set_bool_ptr_ = Module["_geojson_set_bool_ptr_"] = createExportWrapper("geojson_set_bool_ptr_", 2);
  _geojson_set_color_ptr_ = Module["_geojson_set_color_ptr_"] = createExportWrapper("geojson_set_color_ptr_", 5);
  _geojson_remove_all_features = Module["_geojson_remove_all_features"] = createExportWrapper("geojson_remove_all_features", 1);
  _geojson_filter_all = Module["_geojson_filter_all"] = createExportWrapper("geojson_filter_all", 2);
  _geojson_add_poly_feature = Module["_geojson_add_poly_feature"] = createExportWrapper("geojson_add_poly_feature", 3);
  _geojson_query_rendered_features = Module["_geojson_query_rendered_features"] = createExportWrapper("geojson_query_rendered_features", 4);
  _geojson_set_on_new_tile_callback = Module["_geojson_set_on_new_tile_callback"] = createExportWrapper("geojson_set_on_new_tile_callback", 1);
  _geojson_survey_query_rendered_features = Module["_geojson_survey_query_rendered_features"] = createExportWrapper("geojson_survey_query_rendered_features", 5);
  _skycultures_get_designations = Module["_skycultures_get_designations"] = createExportWrapper("skycultures_get_designations", 3);
  _skycultures_get_cultural_names_json = Module["_skycultures_get_cultural_names_json"] = createExportWrapper("skycultures_get_cultural_names_json", 1);
  _sbrk = createExportWrapper("sbrk", 1);
  _emscripten_get_sbrk_ptr = wasmExports["emscripten_get_sbrk_ptr"];
  _setThrew = createExportWrapper("setThrew", 2);
  _emscripten_stack_init = wasmExports["emscripten_stack_init"];
  _emscripten_stack_get_free = wasmExports["emscripten_stack_get_free"];
  _emscripten_stack_get_base = wasmExports["emscripten_stack_get_base"];
  _emscripten_stack_get_end = wasmExports["emscripten_stack_get_end"];
  __emscripten_stack_restore = wasmExports["_emscripten_stack_restore"];
  __emscripten_stack_alloc = wasmExports["_emscripten_stack_alloc"];
  _emscripten_stack_get_current = wasmExports["emscripten_stack_get_current"];
  memory = wasmMemory = wasmExports["memory"];
  __indirect_function_table = wasmTable = wasmExports["__indirect_function_table"];
}

var wasmImports = {
  /** @export */ __assert_fail: ___assert_fail,
  /** @export */ _abort_js: __abort_js,
  /** @export */ _emscripten_throw_longjmp: __emscripten_throw_longjmp,
  /** @export */ alignfault,
  /** @export */ emscripten_async_wget2_abort: _emscripten_async_wget2_abort,
  /** @export */ emscripten_async_wget2_data: _emscripten_async_wget2_data,
  /** @export */ emscripten_date_now: _emscripten_date_now,
  /** @export */ emscripten_resize_heap: _emscripten_resize_heap,
  /** @export */ exit: _exit,
  /** @export */ fd_close: _fd_close,
  /** @export */ fd_read: _fd_read,
  /** @export */ fd_seek: _fd_seek,
  /** @export */ fd_write: _fd_write,
  /** @export */ glActiveTexture: _glActiveTexture,
  /** @export */ glAttachShader: _glAttachShader,
  /** @export */ glBindAttribLocation: _glBindAttribLocation,
  /** @export */ glBindBuffer: _glBindBuffer,
  /** @export */ glBindTexture: _glBindTexture,
  /** @export */ glBlendColor: _glBlendColor,
  /** @export */ glBlendFunc: _glBlendFunc,
  /** @export */ glBlendFuncSeparate: _glBlendFuncSeparate,
  /** @export */ glBufferData: _glBufferData,
  /** @export */ glClear: _glClear,
  /** @export */ glClearColor: _glClearColor,
  /** @export */ glColorMask: _glColorMask,
  /** @export */ glCompileShader: _glCompileShader,
  /** @export */ glCreateProgram: _glCreateProgram,
  /** @export */ glCreateShader: _glCreateShader,
  /** @export */ glCullFace: _glCullFace,
  /** @export */ glDeleteBuffers: _glDeleteBuffers,
  /** @export */ glDeleteProgram: _glDeleteProgram,
  /** @export */ glDeleteShader: _glDeleteShader,
  /** @export */ glDeleteTextures: _glDeleteTextures,
  /** @export */ glDepthFunc: _glDepthFunc,
  /** @export */ glDepthMask: _glDepthMask,
  /** @export */ glDisable: _glDisable,
  /** @export */ glDisableVertexAttribArray: _glDisableVertexAttribArray,
  /** @export */ glDrawArrays: _glDrawArrays,
  /** @export */ glDrawElements: _glDrawElements,
  /** @export */ glEnable: _glEnable,
  /** @export */ glEnableVertexAttribArray: _glEnableVertexAttribArray,
  /** @export */ glFinish: _glFinish,
  /** @export */ glFrontFace: _glFrontFace,
  /** @export */ glGenBuffers: _glGenBuffers,
  /** @export */ glGenTextures: _glGenTextures,
  /** @export */ glGenerateMipmap: _glGenerateMipmap,
  /** @export */ glGetActiveUniform: _glGetActiveUniform,
  /** @export */ glGetError: _glGetError,
  /** @export */ glGetIntegerv: _glGetIntegerv,
  /** @export */ glGetProgramInfoLog: _glGetProgramInfoLog,
  /** @export */ glGetProgramiv: _glGetProgramiv,
  /** @export */ glGetShaderInfoLog: _glGetShaderInfoLog,
  /** @export */ glGetShaderiv: _glGetShaderiv,
  /** @export */ glGetUniformLocation: _glGetUniformLocation,
  /** @export */ glLineWidth: _glLineWidth,
  /** @export */ glLinkProgram: _glLinkProgram,
  /** @export */ glPixelStorei: _glPixelStorei,
  /** @export */ glShaderSource: _glShaderSource,
  /** @export */ glStencilFunc: _glStencilFunc,
  /** @export */ glStencilMask: _glStencilMask,
  /** @export */ glStencilOp: _glStencilOp,
  /** @export */ glStencilOpSeparate: _glStencilOpSeparate,
  /** @export */ glTexImage2D: _glTexImage2D,
  /** @export */ glTexParameterf: _glTexParameterf,
  /** @export */ glTexParameteri: _glTexParameteri,
  /** @export */ glTexSubImage2D: _glTexSubImage2D,
  /** @export */ glUniform1f: _glUniform1f,
  /** @export */ glUniform1fv: _glUniform1fv,
  /** @export */ glUniform1i: _glUniform1i,
  /** @export */ glUniform2fv: _glUniform2fv,
  /** @export */ glUniform3fv: _glUniform3fv,
  /** @export */ glUniform4fv: _glUniform4fv,
  /** @export */ glUniformMatrix3fv: _glUniformMatrix3fv,
  /** @export */ glUniformMatrix4fv: _glUniformMatrix4fv,
  /** @export */ glUseProgram: _glUseProgram,
  /** @export */ glVertexAttribPointer: _glVertexAttribPointer,
  /** @export */ glViewport: _glViewport,
  /** @export */ invoke_ii,
  /** @export */ invoke_iiii,
  /** @export */ invoke_vi,
  /** @export */ invoke_vii,
  /** @export */ invoke_viii,
  /** @export */ invoke_viiiii,
  /** @export */ segfault
};

function invoke_vii(index, a1, a2) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_vi(index, a1) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_ii(index, a1) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiii(index, a1, a2, a3) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1, a2, a3);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viii(index, a1, a2, a3) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiiii(index, a1, a2, a3, a4, a5) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5);
  } catch (e) {
    stackRestore(sp);
    if (e !== e + 0) throw e;
    _setThrew(1, 0);
  }
}

// include: postamble.js
// === Auto-generated postamble setup entry stuff ===
var calledRun;

function stackCheckInit() {
  // This is normally called automatically during __wasm_call_ctors but need to
  // get these values before even running any of the ctors so we call it redundantly
  // here.
  _emscripten_stack_init();
  // TODO(sbc): Move writeStackCookie to native to to avoid this.
  writeStackCookie();
}

function run() {
  stackCheckInit();
  preRun();
  function doRun() {
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    assert(!calledRun);
    calledRun = true;
    Module["calledRun"] = true;
    if (ABORT) return;
    initRuntime();
    readyPromiseResolve?.(Module);
    Module["onRuntimeInitialized"]?.();
    consumedModuleProp("onRuntimeInitialized");
    assert(!Module["_main"], 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]');
    postRun();
  }
  if (Module["setStatus"]) {
    Module["setStatus"]("Running...");
    setTimeout(() => {
      setTimeout(() => Module["setStatus"](""), 1);
      doRun();
    }, 1);
  } else {
    doRun();
  }
  checkStackCookie();
}

function checkUnflushedContent() {
  // Compiler settings do not allow exiting the runtime, so flushing
  // the streams is not possible. but in ASSERTIONS mode we check
  // if there was something to flush, and if so tell the user they
  // should request that the runtime be exitable.
  // Normally we would not even include flush() at all, but in ASSERTIONS
  // builds we do so just for this check, and here we see if there is any
  // content to flush, that is, we check if there would have been
  // something a non-ASSERTIONS build would have not seen.
  // How we flush the streams depends on whether we are in SYSCALLS_REQUIRE_FILESYSTEM=0
  // mode (which has its own special function for this; otherwise, all
  // the code is inside libc)
  var oldOut = out;
  var oldErr = err;
  var has = false;
  out = err = x => {
    has = true;
  };
  try {
    // it doesn't matter if it fails
    flush_NO_FILESYSTEM();
  } catch (e) {}
  out = oldOut;
  err = oldErr;
  if (has) {
    warnOnce("stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the Emscripten FAQ), or make sure to emit a newline when you printf etc.");
    warnOnce("(this may also be due to not including full filesystem support - try building with -sFORCE_FILESYSTEM)");
  }
}

var wasmExports;

// In modularize mode the generated code is within a factory function so we
// can use await here (since it's not top-level-await).
wasmExports = await (createWasm());

run();

// end include: postamble.js
// include: postamble_modularize.js
// In MODULARIZE mode we wrap the generated code in a factory function
// and return either the Module itself, or a promise of the module.
// We assign to the `moduleRtn` global here and configure closure to see
// this as an extern so it won't get minified.
if (runtimeInitialized) {
  moduleRtn = Module;
} else {
  // Set up the promise that indicates the Module is initialized
  moduleRtn = new Promise((resolve, reject) => {
    readyPromiseResolve = resolve;
    readyPromiseReject = reject;
  });
}

// Assertion for attempting to access module properties on the incoming
// moduleArg.  In the past we used this object as the prototype of the module
// and assigned properties to it, but now we return a distinct object.  This
// keeps the instance private until it is ready (i.e the promise has been
// resolved).
for (const prop of Object.keys(Module)) {
  if (!(prop in moduleArg)) {
    Object.defineProperty(moduleArg, prop, {
      configurable: true,
      get() {
        abort(`Access to module property ('${prop}') is no longer possible via the module constructor argument; Instead, use the result of the module constructor.`);
      }
    });
  }
}


    return moduleRtn;
  };
})();

// Export using a UMD style export, or ES6 exports if selected
if (typeof exports === 'object' && typeof module === 'object') {
  module.exports = StelWebEngine;
  // This default export looks redundant, but it allows TS to import this
  // commonjs style module.
  module.exports.default = StelWebEngine;
} else if (typeof define === 'function' && define['amd'])
  define([], () => StelWebEngine);

