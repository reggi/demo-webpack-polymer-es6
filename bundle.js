/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Polymer = __webpack_require__(1)
	
	console.log(polymer)


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, module) {/**
	 * @license
	 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
	 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
	 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
	 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
	 * Code distributed by Google as part of the polymer project is also
	 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
	 */
	// @version 0.5.5
	window.PolymerGestures = {};
	
	(function(scope) {
	  var hasFullPath = false;
	
	  // test for full event path support
	  var pathTest = document.createElement('meta');
	  if (pathTest.createShadowRoot) {
	    var sr = pathTest.createShadowRoot();
	    var s = document.createElement('span');
	    sr.appendChild(s);
	    pathTest.addEventListener('testpath', function(ev) {
	      if (ev.path) {
	        // if the span is in the event path, then path[0] is the real source for all events
	        hasFullPath = ev.path[0] === s;
	      }
	      ev.stopPropagation();
	    });
	    var ev = new CustomEvent('testpath', {bubbles: true});
	    // must add node to DOM to trigger event listener
	    document.head.appendChild(pathTest);
	    s.dispatchEvent(ev);
	    pathTest.parentNode.removeChild(pathTest);
	    sr = s = null;
	  }
	  pathTest = null;
	
	  var target = {
	    shadow: function(inEl) {
	      if (inEl) {
	        return inEl.shadowRoot || inEl.webkitShadowRoot;
	      }
	    },
	    canTarget: function(shadow) {
	      return shadow && Boolean(shadow.elementFromPoint);
	    },
	    targetingShadow: function(inEl) {
	      var s = this.shadow(inEl);
	      if (this.canTarget(s)) {
	        return s;
	      }
	    },
	    olderShadow: function(shadow) {
	      var os = shadow.olderShadowRoot;
	      if (!os) {
	        var se = shadow.querySelector('shadow');
	        if (se) {
	          os = se.olderShadowRoot;
	        }
	      }
	      return os;
	    },
	    allShadows: function(element) {
	      var shadows = [], s = this.shadow(element);
	      while(s) {
	        shadows.push(s);
	        s = this.olderShadow(s);
	      }
	      return shadows;
	    },
	    searchRoot: function(inRoot, x, y) {
	      var t, st, sr, os;
	      if (inRoot) {
	        t = inRoot.elementFromPoint(x, y);
	        if (t) {
	          // found element, check if it has a ShadowRoot
	          sr = this.targetingShadow(t);
	        } else if (inRoot !== document) {
	          // check for sibling roots
	          sr = this.olderShadow(inRoot);
	        }
	        // search other roots, fall back to light dom element
	        return this.searchRoot(sr, x, y) || t;
	      }
	    },
	    owner: function(element) {
	      if (!element) {
	        return document;
	      }
	      var s = element;
	      // walk up until you hit the shadow root or document
	      while (s.parentNode) {
	        s = s.parentNode;
	      }
	      // the owner element is expected to be a Document or ShadowRoot
	      if (s.nodeType != Node.DOCUMENT_NODE && s.nodeType != Node.DOCUMENT_FRAGMENT_NODE) {
	        s = document;
	      }
	      return s;
	    },
	    findTarget: function(inEvent) {
	      if (hasFullPath && inEvent.path && inEvent.path.length) {
	        return inEvent.path[0];
	      }
	      var x = inEvent.clientX, y = inEvent.clientY;
	      // if the listener is in the shadow root, it is much faster to start there
	      var s = this.owner(inEvent.target);
	      // if x, y is not in this root, fall back to document search
	      if (!s.elementFromPoint(x, y)) {
	        s = document;
	      }
	      return this.searchRoot(s, x, y);
	    },
	    findTouchAction: function(inEvent) {
	      var n;
	      if (hasFullPath && inEvent.path && inEvent.path.length) {
	        var path = inEvent.path;
	        for (var i = 0; i < path.length; i++) {
	          n = path[i];
	          if (n.nodeType === Node.ELEMENT_NODE && n.hasAttribute('touch-action')) {
	            return n.getAttribute('touch-action');
	          }
	        }
	      } else {
	        n = inEvent.target;
	        while(n) {
	          if (n.nodeType === Node.ELEMENT_NODE && n.hasAttribute('touch-action')) {
	            return n.getAttribute('touch-action');
	          }
	          n = n.parentNode || n.host;
	        }
	      }
	      // auto is default
	      return "auto";
	    },
	    LCA: function(a, b) {
	      if (a === b) {
	        return a;
	      }
	      if (a && !b) {
	        return a;
	      }
	      if (b && !a) {
	        return b;
	      }
	      if (!b && !a) {
	        return document;
	      }
	      // fast case, a is a direct descendant of b or vice versa
	      if (a.contains && a.contains(b)) {
	        return a;
	      }
	      if (b.contains && b.contains(a)) {
	        return b;
	      }
	      var adepth = this.depth(a);
	      var bdepth = this.depth(b);
	      var d = adepth - bdepth;
	      if (d >= 0) {
	        a = this.walk(a, d);
	      } else {
	        b = this.walk(b, -d);
	      }
	      while (a && b && a !== b) {
	        a = a.parentNode || a.host;
	        b = b.parentNode || b.host;
	      }
	      return a;
	    },
	    walk: function(n, u) {
	      for (var i = 0; n && (i < u); i++) {
	        n = n.parentNode || n.host;
	      }
	      return n;
	    },
	    depth: function(n) {
	      var d = 0;
	      while(n) {
	        d++;
	        n = n.parentNode || n.host;
	      }
	      return d;
	    },
	    deepContains: function(a, b) {
	      var common = this.LCA(a, b);
	      // if a is the common ancestor, it must "deeply" contain b
	      return common === a;
	    },
	    insideNode: function(node, x, y) {
	      var rect = node.getBoundingClientRect();
	      return (rect.left <= x) && (x <= rect.right) && (rect.top <= y) && (y <= rect.bottom);
	    },
	    path: function(event) {
	      var p;
	      if (hasFullPath && event.path && event.path.length) {
	        p = event.path;
	      } else {
	        p = [];
	        var n = this.findTarget(event);
	        while (n) {
	          p.push(n);
	          n = n.parentNode || n.host;
	        }
	      }
	      return p;
	    }
	  };
	  scope.targetFinding = target;
	  /**
	   * Given an event, finds the "deepest" node that could have been the original target before ShadowDOM retargetting
	   *
	   * @param {Event} Event An event object with clientX and clientY properties
	   * @return {Element} The probable event origninator
	   */
	  scope.findTarget = target.findTarget.bind(target);
	  /**
	   * Determines if the "container" node deeply contains the "containee" node, including situations where the "containee" is contained by one or more ShadowDOM
	   * roots.
	   *
	   * @param {Node} container
	   * @param {Node} containee
	   * @return {Boolean}
	   */
	  scope.deepContains = target.deepContains.bind(target);
	
	  /**
	   * Determines if the x/y position is inside the given node.
	   *
	   * Example:
	   *
	   *     function upHandler(event) {
	   *       var innode = PolymerGestures.insideNode(event.target, event.clientX, event.clientY);
	   *       if (innode) {
	   *         // wait for tap?
	   *       } else {
	   *         // tap will never happen
	   *       }
	   *     }
	   *
	   * @param {Node} node
	   * @param {Number} x Screen X position
	   * @param {Number} y screen Y position
	   * @return {Boolean}
	   */
	  scope.insideNode = target.insideNode;
	
	})(window.PolymerGestures);
	
	(function() {
	  function shadowSelector(v) {
	    return 'html /deep/ ' + selector(v);
	  }
	  function selector(v) {
	    return '[touch-action="' + v + '"]';
	  }
	  function rule(v) {
	    return '{ -ms-touch-action: ' + v + '; touch-action: ' + v + ';}';
	  }
	  var attrib2css = [
	    'none',
	    'auto',
	    'pan-x',
	    'pan-y',
	    {
	      rule: 'pan-x pan-y',
	      selectors: [
	        'pan-x pan-y',
	        'pan-y pan-x'
	      ]
	    },
	    'manipulation'
	  ];
	  var styles = '';
	  // only install stylesheet if the browser has touch action support
	  var hasTouchAction = typeof document.head.style.touchAction === 'string';
	  // only add shadow selectors if shadowdom is supported
	  var hasShadowRoot = !window.ShadowDOMPolyfill && document.head.createShadowRoot;
	
	  if (hasTouchAction) {
	    attrib2css.forEach(function(r) {
	      if (String(r) === r) {
	        styles += selector(r) + rule(r) + '\n';
	        if (hasShadowRoot) {
	          styles += shadowSelector(r) + rule(r) + '\n';
	        }
	      } else {
	        styles += r.selectors.map(selector) + rule(r.rule) + '\n';
	        if (hasShadowRoot) {
	          styles += r.selectors.map(shadowSelector) + rule(r.rule) + '\n';
	        }
	      }
	    });
	
	    var el = document.createElement('style');
	    el.textContent = styles;
	    document.head.appendChild(el);
	  }
	})();
	
	/**
	 * This is the constructor for new PointerEvents.
	 *
	 * New Pointer Events must be given a type, and an optional dictionary of
	 * initialization properties.
	 *
	 * Due to certain platform requirements, events returned from the constructor
	 * identify as MouseEvents.
	 *
	 * @constructor
	 * @param {String} inType The type of the event to create.
	 * @param {Object} [inDict] An optional dictionary of initial event properties.
	 * @return {Event} A new PointerEvent of type `inType` and initialized with properties from `inDict`.
	 */
	(function(scope) {
	
	  var MOUSE_PROPS = [
	    'bubbles',
	    'cancelable',
	    'view',
	    'detail',
	    'screenX',
	    'screenY',
	    'clientX',
	    'clientY',
	    'ctrlKey',
	    'altKey',
	    'shiftKey',
	    'metaKey',
	    'button',
	    'relatedTarget',
	    'pageX',
	    'pageY'
	  ];
	
	  var MOUSE_DEFAULTS = [
	    false,
	    false,
	    null,
	    null,
	    0,
	    0,
	    0,
	    0,
	    false,
	    false,
	    false,
	    false,
	    0,
	    null,
	    0,
	    0
	  ];
	
	  var NOP_FACTORY = function(){ return function(){}; };
	
	  var eventFactory = {
	    // TODO(dfreedm): this is overridden by tap recognizer, needs review
	    preventTap: NOP_FACTORY,
	    makeBaseEvent: function(inType, inDict) {
	      var e = document.createEvent('Event');
	      e.initEvent(inType, inDict.bubbles || false, inDict.cancelable || false);
	      e.preventTap = eventFactory.preventTap(e);
	      return e;
	    },
	    makeGestureEvent: function(inType, inDict) {
	      inDict = inDict || Object.create(null);
	
	      var e = this.makeBaseEvent(inType, inDict);
	      for (var i = 0, keys = Object.keys(inDict), k; i < keys.length; i++) {
	        k = keys[i];
	        if( k !== 'bubbles' && k !== 'cancelable' ) {
	           e[k] = inDict[k];
	        }
	      }
	      return e;
	    },
	    makePointerEvent: function(inType, inDict) {
	      inDict = inDict || Object.create(null);
	
	      var e = this.makeBaseEvent(inType, inDict);
	      // define inherited MouseEvent properties
	      for(var i = 2, p; i < MOUSE_PROPS.length; i++) {
	        p = MOUSE_PROPS[i];
	        e[p] = inDict[p] || MOUSE_DEFAULTS[i];
	      }
	      e.buttons = inDict.buttons || 0;
	
	      // Spec requires that pointers without pressure specified use 0.5 for down
	      // state and 0 for up state.
	      var pressure = 0;
	      if (inDict.pressure) {
	        pressure = inDict.pressure;
	      } else {
	        pressure = e.buttons ? 0.5 : 0;
	      }
	
	      // add x/y properties aliased to clientX/Y
	      e.x = e.clientX;
	      e.y = e.clientY;
	
	      // define the properties of the PointerEvent interface
	      e.pointerId = inDict.pointerId || 0;
	      e.width = inDict.width || 0;
	      e.height = inDict.height || 0;
	      e.pressure = pressure;
	      e.tiltX = inDict.tiltX || 0;
	      e.tiltY = inDict.tiltY || 0;
	      e.pointerType = inDict.pointerType || '';
	      e.hwTimestamp = inDict.hwTimestamp || 0;
	      e.isPrimary = inDict.isPrimary || false;
	      e._source = inDict._source || '';
	      return e;
	    }
	  };
	
	  scope.eventFactory = eventFactory;
	})(window.PolymerGestures);
	
	/**
	 * This module implements an map of pointer states
	 */
	(function(scope) {
	  var USE_MAP = window.Map && window.Map.prototype.forEach;
	  var POINTERS_FN = function(){ return this.size; };
	  function PointerMap() {
	    if (USE_MAP) {
	      var m = new Map();
	      m.pointers = POINTERS_FN;
	      return m;
	    } else {
	      this.keys = [];
	      this.values = [];
	    }
	  }
	
	  PointerMap.prototype = {
	    set: function(inId, inEvent) {
	      var i = this.keys.indexOf(inId);
	      if (i > -1) {
	        this.values[i] = inEvent;
	      } else {
	        this.keys.push(inId);
	        this.values.push(inEvent);
	      }
	    },
	    has: function(inId) {
	      return this.keys.indexOf(inId) > -1;
	    },
	    'delete': function(inId) {
	      var i = this.keys.indexOf(inId);
	      if (i > -1) {
	        this.keys.splice(i, 1);
	        this.values.splice(i, 1);
	      }
	    },
	    get: function(inId) {
	      var i = this.keys.indexOf(inId);
	      return this.values[i];
	    },
	    clear: function() {
	      this.keys.length = 0;
	      this.values.length = 0;
	    },
	    // return value, key, map
	    forEach: function(callback, thisArg) {
	      this.values.forEach(function(v, i) {
	        callback.call(thisArg, v, this.keys[i], this);
	      }, this);
	    },
	    pointers: function() {
	      return this.keys.length;
	    }
	  };
	
	  scope.PointerMap = PointerMap;
	})(window.PolymerGestures);
	
	(function(scope) {
	  var CLONE_PROPS = [
	    // MouseEvent
	    'bubbles',
	    'cancelable',
	    'view',
	    'detail',
	    'screenX',
	    'screenY',
	    'clientX',
	    'clientY',
	    'ctrlKey',
	    'altKey',
	    'shiftKey',
	    'metaKey',
	    'button',
	    'relatedTarget',
	    // DOM Level 3
	    'buttons',
	    // PointerEvent
	    'pointerId',
	    'width',
	    'height',
	    'pressure',
	    'tiltX',
	    'tiltY',
	    'pointerType',
	    'hwTimestamp',
	    'isPrimary',
	    // event instance
	    'type',
	    'target',
	    'currentTarget',
	    'which',
	    'pageX',
	    'pageY',
	    'timeStamp',
	    // gesture addons
	    'preventTap',
	    'tapPrevented',
	    '_source'
	  ];
	
	  var CLONE_DEFAULTS = [
	    // MouseEvent
	    false,
	    false,
	    null,
	    null,
	    0,
	    0,
	    0,
	    0,
	    false,
	    false,
	    false,
	    false,
	    0,
	    null,
	    // DOM Level 3
	    0,
	    // PointerEvent
	    0,
	    0,
	    0,
	    0,
	    0,
	    0,
	    '',
	    0,
	    false,
	    // event instance
	    '',
	    null,
	    null,
	    0,
	    0,
	    0,
	    0,
	    function(){},
	    false
	  ];
	
	  var HAS_SVG_INSTANCE = (typeof SVGElementInstance !== 'undefined');
	
	  var eventFactory = scope.eventFactory;
	
	  // set of recognizers to run for the currently handled event
	  var currentGestures;
	
	  /**
	   * This module is for normalizing events. Mouse and Touch events will be
	   * collected here, and fire PointerEvents that have the same semantics, no
	   * matter the source.
	   * Events fired:
	   *   - pointerdown: a pointing is added
	   *   - pointerup: a pointer is removed
	   *   - pointermove: a pointer is moved
	   *   - pointerover: a pointer crosses into an element
	   *   - pointerout: a pointer leaves an element
	   *   - pointercancel: a pointer will no longer generate events
	   */
	  var dispatcher = {
	    IS_IOS: false,
	    pointermap: new scope.PointerMap(),
	    requiredGestures: new scope.PointerMap(),
	    eventMap: Object.create(null),
	    // Scope objects for native events.
	    // This exists for ease of testing.
	    eventSources: Object.create(null),
	    eventSourceList: [],
	    gestures: [],
	    // map gesture event -> {listeners: int, index: gestures[int]}
	    dependencyMap: {
	      // make sure down and up are in the map to trigger "register"
	      down: {listeners: 0, index: -1},
	      up: {listeners: 0, index: -1}
	    },
	    gestureQueue: [],
	    /**
	     * Add a new event source that will generate pointer events.
	     *
	     * `inSource` must contain an array of event names named `events`, and
	     * functions with the names specified in the `events` array.
	     * @param {string} name A name for the event source
	     * @param {Object} source A new source of platform events.
	     */
	    registerSource: function(name, source) {
	      var s = source;
	      var newEvents = s.events;
	      if (newEvents) {
	        newEvents.forEach(function(e) {
	          if (s[e]) {
	            this.eventMap[e] = s[e].bind(s);
	          }
	        }, this);
	        this.eventSources[name] = s;
	        this.eventSourceList.push(s);
	      }
	    },
	    registerGesture: function(name, source) {
	      var obj = Object.create(null);
	      obj.listeners = 0;
	      obj.index = this.gestures.length;
	      for (var i = 0, g; i < source.exposes.length; i++) {
	        g = source.exposes[i].toLowerCase();
	        this.dependencyMap[g] = obj;
	      }
	      this.gestures.push(source);
	    },
	    register: function(element, initial) {
	      var l = this.eventSourceList.length;
	      for (var i = 0, es; (i < l) && (es = this.eventSourceList[i]); i++) {
	        // call eventsource register
	        es.register.call(es, element, initial);
	      }
	    },
	    unregister: function(element) {
	      var l = this.eventSourceList.length;
	      for (var i = 0, es; (i < l) && (es = this.eventSourceList[i]); i++) {
	        // call eventsource register
	        es.unregister.call(es, element);
	      }
	    },
	    // EVENTS
	    down: function(inEvent) {
	      this.requiredGestures.set(inEvent.pointerId, currentGestures);
	      this.fireEvent('down', inEvent);
	    },
	    move: function(inEvent) {
	      // pipe move events into gesture queue directly
	      inEvent.type = 'move';
	      this.fillGestureQueue(inEvent);
	    },
	    up: function(inEvent) {
	      this.fireEvent('up', inEvent);
	      this.requiredGestures.delete(inEvent.pointerId);
	    },
	    cancel: function(inEvent) {
	      inEvent.tapPrevented = true;
	      this.fireEvent('up', inEvent);
	      this.requiredGestures.delete(inEvent.pointerId);
	    },
	    addGestureDependency: function(node, currentGestures) {
	      var gesturesWanted = node._pgEvents;
	      if (gesturesWanted && currentGestures) {
	        var gk = Object.keys(gesturesWanted);
	        for (var i = 0, r, ri, g; i < gk.length; i++) {
	          // gesture
	          g = gk[i];
	          if (gesturesWanted[g] > 0) {
	            // lookup gesture recognizer
	            r = this.dependencyMap[g];
	            // recognizer index
	            ri = r ? r.index : -1;
	            currentGestures[ri] = true;
	          }
	        }
	      }
	    },
	    // LISTENER LOGIC
	    eventHandler: function(inEvent) {
	      // This is used to prevent multiple dispatch of events from
	      // platform events. This can happen when two elements in different scopes
	      // are set up to create pointer events, which is relevant to Shadow DOM.
	
	      var type = inEvent.type;
	
	      // only generate the list of desired events on "down"
	      if (type === 'touchstart' || type === 'mousedown' || type === 'pointerdown' || type === 'MSPointerDown') {
	        if (!inEvent._handledByPG) {
	          currentGestures = {};
	        }
	
	        // in IOS mode, there is only a listener on the document, so this is not re-entrant
	        if (this.IS_IOS) {
	          var ev = inEvent;
	          if (type === 'touchstart') {
	            var ct = inEvent.changedTouches[0];
	            // set up a fake event to give to the path builder
	            ev = {target: inEvent.target, clientX: ct.clientX, clientY: ct.clientY, path: inEvent.path};
	          }
	          // use event path if available, otherwise build a path from target finding
	          var nodes = inEvent.path || scope.targetFinding.path(ev);
	          for (var i = 0, n; i < nodes.length; i++) {
	            n = nodes[i];
	            this.addGestureDependency(n, currentGestures);
	          }
	        } else {
	          this.addGestureDependency(inEvent.currentTarget, currentGestures);
	        }
	      }
	
	      if (inEvent._handledByPG) {
	        return;
	      }
	      var fn = this.eventMap && this.eventMap[type];
	      if (fn) {
	        fn(inEvent);
	      }
	      inEvent._handledByPG = true;
	    },
	    // set up event listeners
	    listen: function(target, events) {
	      for (var i = 0, l = events.length, e; (i < l) && (e = events[i]); i++) {
	        this.addEvent(target, e);
	      }
	    },
	    // remove event listeners
	    unlisten: function(target, events) {
	      for (var i = 0, l = events.length, e; (i < l) && (e = events[i]); i++) {
	        this.removeEvent(target, e);
	      }
	    },
	    addEvent: function(target, eventName) {
	      target.addEventListener(eventName, this.boundHandler);
	    },
	    removeEvent: function(target, eventName) {
	      target.removeEventListener(eventName, this.boundHandler);
	    },
	    // EVENT CREATION AND TRACKING
	    /**
	     * Creates a new Event of type `inType`, based on the information in
	     * `inEvent`.
	     *
	     * @param {string} inType A string representing the type of event to create
	     * @param {Event} inEvent A platform event with a target
	     * @return {Event} A PointerEvent of type `inType`
	     */
	    makeEvent: function(inType, inEvent) {
	      var e = eventFactory.makePointerEvent(inType, inEvent);
	      e.preventDefault = inEvent.preventDefault;
	      e.tapPrevented = inEvent.tapPrevented;
	      e._target = e._target || inEvent.target;
	      return e;
	    },
	    // make and dispatch an event in one call
	    fireEvent: function(inType, inEvent) {
	      var e = this.makeEvent(inType, inEvent);
	      return this.dispatchEvent(e);
	    },
	    /**
	     * Returns a snapshot of inEvent, with writable properties.
	     *
	     * @param {Event} inEvent An event that contains properties to copy.
	     * @return {Object} An object containing shallow copies of `inEvent`'s
	     *    properties.
	     */
	    cloneEvent: function(inEvent) {
	      var eventCopy = Object.create(null), p;
	      for (var i = 0; i < CLONE_PROPS.length; i++) {
	        p = CLONE_PROPS[i];
	        eventCopy[p] = inEvent[p] || CLONE_DEFAULTS[i];
	        // Work around SVGInstanceElement shadow tree
	        // Return the <use> element that is represented by the instance for Safari, Chrome, IE.
	        // This is the behavior implemented by Firefox.
	        if (p === 'target' || p === 'relatedTarget') {
	          if (HAS_SVG_INSTANCE && eventCopy[p] instanceof SVGElementInstance) {
	            eventCopy[p] = eventCopy[p].correspondingUseElement;
	          }
	        }
	      }
	      // keep the semantics of preventDefault
	      eventCopy.preventDefault = function() {
	        inEvent.preventDefault();
	      };
	      return eventCopy;
	    },
	    /**
	     * Dispatches the event to its target.
	     *
	     * @param {Event} inEvent The event to be dispatched.
	     * @return {Boolean} True if an event handler returns true, false otherwise.
	     */
	    dispatchEvent: function(inEvent) {
	      var t = inEvent._target;
	      if (t) {
	        t.dispatchEvent(inEvent);
	        // clone the event for the gesture system to process
	        // clone after dispatch to pick up gesture prevention code
	        var clone = this.cloneEvent(inEvent);
	        clone.target = t;
	        this.fillGestureQueue(clone);
	      }
	    },
	    gestureTrigger: function() {
	      // process the gesture queue
	      for (var i = 0, e, rg; i < this.gestureQueue.length; i++) {
	        e = this.gestureQueue[i];
	        rg = e._requiredGestures;
	        if (rg) {
	          for (var j = 0, g, fn; j < this.gestures.length; j++) {
	            // only run recognizer if an element in the source event's path is listening for those gestures
	            if (rg[j]) {
	              g = this.gestures[j];
	              fn = g[e.type];
	              if (fn) {
	                fn.call(g, e);
	              }
	            }
	          }
	        }
	      }
	      this.gestureQueue.length = 0;
	    },
	    fillGestureQueue: function(ev) {
	      // only trigger the gesture queue once
	      if (!this.gestureQueue.length) {
	        requestAnimationFrame(this.boundGestureTrigger);
	      }
	      ev._requiredGestures = this.requiredGestures.get(ev.pointerId);
	      this.gestureQueue.push(ev);
	    }
	  };
	  dispatcher.boundHandler = dispatcher.eventHandler.bind(dispatcher);
	  dispatcher.boundGestureTrigger = dispatcher.gestureTrigger.bind(dispatcher);
	  scope.dispatcher = dispatcher;
	
	  /**
	   * Listen for `gesture` on `node` with the `handler` function
	   *
	   * If `handler` is the first listener for `gesture`, the underlying gesture recognizer is then enabled.
	   *
	   * @param {Element} node
	   * @param {string} gesture
	   * @return Boolean `gesture` is a valid gesture
	   */
	  scope.activateGesture = function(node, gesture) {
	    var g = gesture.toLowerCase();
	    var dep = dispatcher.dependencyMap[g];
	    if (dep) {
	      var recognizer = dispatcher.gestures[dep.index];
	      if (!node._pgListeners) {
	        dispatcher.register(node);
	        node._pgListeners = 0;
	      }
	      // TODO(dfreedm): re-evaluate bookkeeping to avoid using attributes
	      if (recognizer) {
	        var touchAction = recognizer.defaultActions && recognizer.defaultActions[g];
	        var actionNode;
	        switch(node.nodeType) {
	          case Node.ELEMENT_NODE:
	            actionNode = node;
	          break;
	          case Node.DOCUMENT_FRAGMENT_NODE:
	            actionNode = node.host;
	          break;
	          default:
	            actionNode = null;
	          break;
	        }
	        if (touchAction && actionNode && !actionNode.hasAttribute('touch-action')) {
	          actionNode.setAttribute('touch-action', touchAction);
	        }
	      }
	      if (!node._pgEvents) {
	        node._pgEvents = {};
	      }
	      node._pgEvents[g] = (node._pgEvents[g] || 0) + 1;
	      node._pgListeners++;
	    }
	    return Boolean(dep);
	  };
	
	  /**
	   *
	   * Listen for `gesture` from `node` with `handler` function.
	   *
	   * @param {Element} node
	   * @param {string} gesture
	   * @param {Function} handler
	   * @param {Boolean} capture
	   */
	  scope.addEventListener = function(node, gesture, handler, capture) {
	    if (handler) {
	      scope.activateGesture(node, gesture);
	      node.addEventListener(gesture, handler, capture);
	    }
	  };
	
	  /**
	   * Tears down the gesture configuration for `node`
	   *
	   * If `handler` is the last listener for `gesture`, the underlying gesture recognizer is disabled.
	   *
	   * @param {Element} node
	   * @param {string} gesture
	   * @return Boolean `gesture` is a valid gesture
	   */
	  scope.deactivateGesture = function(node, gesture) {
	    var g = gesture.toLowerCase();
	    var dep = dispatcher.dependencyMap[g];
	    if (dep) {
	      if (node._pgListeners > 0) {
	        node._pgListeners--;
	      }
	      if (node._pgListeners === 0) {
	        dispatcher.unregister(node);
	      }
	      if (node._pgEvents) {
	        if (node._pgEvents[g] > 0) {
	          node._pgEvents[g]--;
	        } else {
	          node._pgEvents[g] = 0;
	        }
	      }
	    }
	    return Boolean(dep);
	  };
	
	  /**
	   * Stop listening for `gesture` from `node` with `handler` function.
	   *
	   * @param {Element} node
	   * @param {string} gesture
	   * @param {Function} handler
	   * @param {Boolean} capture
	   */
	  scope.removeEventListener = function(node, gesture, handler, capture) {
	    if (handler) {
	      scope.deactivateGesture(node, gesture);
	      node.removeEventListener(gesture, handler, capture);
	    }
	  };
	})(window.PolymerGestures);
	
	(function(scope) {
	  var dispatcher = scope.dispatcher;
	  var pointermap = dispatcher.pointermap;
	  // radius around touchend that swallows mouse events
	  var DEDUP_DIST = 25;
	
	  var WHICH_TO_BUTTONS = [0, 1, 4, 2];
	
	  var currentButtons = 0;
	
	  var FIREFOX_LINUX = /Linux.*Firefox\//i;
	
	  var HAS_BUTTONS = (function() {
	    // firefox on linux returns spec-incorrect values for mouseup.buttons
	    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent.buttons#See_also
	    // https://codereview.chromium.org/727593003/#msg16
	    if (FIREFOX_LINUX.test(navigator.userAgent)) {
	      return false;
	    }
	    try {
	      return new MouseEvent('test', {buttons: 1}).buttons === 1;
	    } catch (e) {
	      return false;
	    }
	  })();
	
	  // handler block for native mouse events
	  var mouseEvents = {
	    POINTER_ID: 1,
	    POINTER_TYPE: 'mouse',
	    events: [
	      'mousedown',
	      'mousemove',
	      'mouseup'
	    ],
	    exposes: [
	      'down',
	      'up',
	      'move'
	    ],
	    register: function(target) {
	      dispatcher.listen(target, this.events);
	    },
	    unregister: function(target) {
	      if (target.nodeType === Node.DOCUMENT_NODE) {
	        return;
	      }
	      dispatcher.unlisten(target, this.events);
	    },
	    lastTouches: [],
	    // collide with the global mouse listener
	    isEventSimulatedFromTouch: function(inEvent) {
	      var lts = this.lastTouches;
	      var x = inEvent.clientX, y = inEvent.clientY;
	      for (var i = 0, l = lts.length, t; i < l && (t = lts[i]); i++) {
	        // simulated mouse events will be swallowed near a primary touchend
	        var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
	        if (dx <= DEDUP_DIST && dy <= DEDUP_DIST) {
	          return true;
	        }
	      }
	    },
	    prepareEvent: function(inEvent) {
	      var e = dispatcher.cloneEvent(inEvent);
	      e.pointerId = this.POINTER_ID;
	      e.isPrimary = true;
	      e.pointerType = this.POINTER_TYPE;
	      e._source = 'mouse';
	      if (!HAS_BUTTONS) {
	        var type = inEvent.type;
	        var bit = WHICH_TO_BUTTONS[inEvent.which] || 0;
	        if (type === 'mousedown') {
	          currentButtons |= bit;
	        } else if (type === 'mouseup') {
	          currentButtons &= ~bit;
	        }
	        e.buttons = currentButtons;
	      }
	      return e;
	    },
	    mousedown: function(inEvent) {
	      if (!this.isEventSimulatedFromTouch(inEvent)) {
	        var p = pointermap.has(this.POINTER_ID);
	        var e = this.prepareEvent(inEvent);
	        e.target = scope.findTarget(inEvent);
	        pointermap.set(this.POINTER_ID, e.target);
	        dispatcher.down(e);
	      }
	    },
	    mousemove: function(inEvent) {
	      if (!this.isEventSimulatedFromTouch(inEvent)) {
	        var target = pointermap.get(this.POINTER_ID);
	        if (target) {
	          var e = this.prepareEvent(inEvent);
	          e.target = target;
	          // handle case where we missed a mouseup
	          if ((HAS_BUTTONS ? e.buttons : e.which) === 0) {
	            if (!HAS_BUTTONS) {
	              currentButtons = e.buttons = 0;
	            }
	            dispatcher.cancel(e);
	            this.cleanupMouse(e.buttons);
	          } else {
	            dispatcher.move(e);
	          }
	        }
	      }
	    },
	    mouseup: function(inEvent) {
	      if (!this.isEventSimulatedFromTouch(inEvent)) {
	        var e = this.prepareEvent(inEvent);
	        e.relatedTarget = scope.findTarget(inEvent);
	        e.target = pointermap.get(this.POINTER_ID);
	        dispatcher.up(e);
	        this.cleanupMouse(e.buttons);
	      }
	    },
	    cleanupMouse: function(buttons) {
	      if (buttons === 0) {
	        pointermap.delete(this.POINTER_ID);
	      }
	    }
	  };
	
	  scope.mouseEvents = mouseEvents;
	})(window.PolymerGestures);
	
	(function(scope) {
	  var dispatcher = scope.dispatcher;
	  var allShadows = scope.targetFinding.allShadows.bind(scope.targetFinding);
	  var pointermap = dispatcher.pointermap;
	  var touchMap = Array.prototype.map.call.bind(Array.prototype.map);
	  // This should be long enough to ignore compat mouse events made by touch
	  var DEDUP_TIMEOUT = 2500;
	  var DEDUP_DIST = 25;
	  var CLICK_COUNT_TIMEOUT = 200;
	  var HYSTERESIS = 20;
	  var ATTRIB = 'touch-action';
	  // TODO(dfreedm): disable until http://crbug.com/399765 is resolved
	  // var HAS_TOUCH_ACTION = ATTRIB in document.head.style;
	  var HAS_TOUCH_ACTION = false;
	
	  // handler block for native touch events
	  var touchEvents = {
	    IS_IOS: false,
	    events: [
	      'touchstart',
	      'touchmove',
	      'touchend',
	      'touchcancel'
	    ],
	    exposes: [
	      'down',
	      'up',
	      'move'
	    ],
	    register: function(target, initial) {
	      if (this.IS_IOS ? initial : !initial) {
	        dispatcher.listen(target, this.events);
	      }
	    },
	    unregister: function(target) {
	      if (!this.IS_IOS) {
	        dispatcher.unlisten(target, this.events);
	      }
	    },
	    scrollTypes: {
	      EMITTER: 'none',
	      XSCROLLER: 'pan-x',
	      YSCROLLER: 'pan-y',
	    },
	    touchActionToScrollType: function(touchAction) {
	      var t = touchAction;
	      var st = this.scrollTypes;
	      if (t === st.EMITTER) {
	        return 'none';
	      } else if (t === st.XSCROLLER) {
	        return 'X';
	      } else if (t === st.YSCROLLER) {
	        return 'Y';
	      } else {
	        return 'XY';
	      }
	    },
	    POINTER_TYPE: 'touch',
	    firstTouch: null,
	    isPrimaryTouch: function(inTouch) {
	      return this.firstTouch === inTouch.identifier;
	    },
	    setPrimaryTouch: function(inTouch) {
	      // set primary touch if there no pointers, or the only pointer is the mouse
	      if (pointermap.pointers() === 0 || (pointermap.pointers() === 1 && pointermap.has(1))) {
	        this.firstTouch = inTouch.identifier;
	        this.firstXY = {X: inTouch.clientX, Y: inTouch.clientY};
	        this.firstTarget = inTouch.target;
	        this.scrolling = null;
	        this.cancelResetClickCount();
	      }
	    },
	    removePrimaryPointer: function(inPointer) {
	      if (inPointer.isPrimary) {
	        this.firstTouch = null;
	        this.firstXY = null;
	        this.resetClickCount();
	      }
	    },
	    clickCount: 0,
	    resetId: null,
	    resetClickCount: function() {
	      var fn = function() {
	        this.clickCount = 0;
	        this.resetId = null;
	      }.bind(this);
	      this.resetId = setTimeout(fn, CLICK_COUNT_TIMEOUT);
	    },
	    cancelResetClickCount: function() {
	      if (this.resetId) {
	        clearTimeout(this.resetId);
	      }
	    },
	    typeToButtons: function(type) {
	      var ret = 0;
	      if (type === 'touchstart' || type === 'touchmove') {
	        ret = 1;
	      }
	      return ret;
	    },
	    findTarget: function(touch, id) {
	      if (this.currentTouchEvent.type === 'touchstart') {
	        if (this.isPrimaryTouch(touch)) {
	          var fastPath = {
	            clientX: touch.clientX,
	            clientY: touch.clientY,
	            path: this.currentTouchEvent.path,
	            target: this.currentTouchEvent.target
	          };
	          return scope.findTarget(fastPath);
	        } else {
	          return scope.findTarget(touch);
	        }
	      }
	      // reuse target we found in touchstart
	      return pointermap.get(id);
	    },
	    touchToPointer: function(inTouch) {
	      var cte = this.currentTouchEvent;
	      var e = dispatcher.cloneEvent(inTouch);
	      // Spec specifies that pointerId 1 is reserved for Mouse.
	      // Touch identifiers can start at 0.
	      // Add 2 to the touch identifier for compatibility.
	      var id = e.pointerId = inTouch.identifier + 2;
	      e.target = this.findTarget(inTouch, id);
	      e.bubbles = true;
	      e.cancelable = true;
	      e.detail = this.clickCount;
	      e.buttons = this.typeToButtons(cte.type);
	      e.width = inTouch.webkitRadiusX || inTouch.radiusX || 0;
	      e.height = inTouch.webkitRadiusY || inTouch.radiusY || 0;
	      e.pressure = inTouch.webkitForce || inTouch.force || 0.5;
	      e.isPrimary = this.isPrimaryTouch(inTouch);
	      e.pointerType = this.POINTER_TYPE;
	      e._source = 'touch';
	      // forward touch preventDefaults
	      var self = this;
	      e.preventDefault = function() {
	        self.scrolling = false;
	        self.firstXY = null;
	        cte.preventDefault();
	      };
	      return e;
	    },
	    processTouches: function(inEvent, inFunction) {
	      var tl = inEvent.changedTouches;
	      this.currentTouchEvent = inEvent;
	      for (var i = 0, t, p; i < tl.length; i++) {
	        t = tl[i];
	        p = this.touchToPointer(t);
	        if (inEvent.type === 'touchstart') {
	          pointermap.set(p.pointerId, p.target);
	        }
	        if (pointermap.has(p.pointerId)) {
	          inFunction.call(this, p);
	        }
	        if (inEvent.type === 'touchend' || inEvent._cancel) {
	          this.cleanUpPointer(p);
	        }
	      }
	    },
	    // For single axis scrollers, determines whether the element should emit
	    // pointer events or behave as a scroller
	    shouldScroll: function(inEvent) {
	      if (this.firstXY) {
	        var ret;
	        var touchAction = scope.targetFinding.findTouchAction(inEvent);
	        var scrollAxis = this.touchActionToScrollType(touchAction);
	        if (scrollAxis === 'none') {
	          // this element is a touch-action: none, should never scroll
	          ret = false;
	        } else if (scrollAxis === 'XY') {
	          // this element should always scroll
	          ret = true;
	        } else {
	          var t = inEvent.changedTouches[0];
	          // check the intended scroll axis, and other axis
	          var a = scrollAxis;
	          var oa = scrollAxis === 'Y' ? 'X' : 'Y';
	          var da = Math.abs(t['client' + a] - this.firstXY[a]);
	          var doa = Math.abs(t['client' + oa] - this.firstXY[oa]);
	          // if delta in the scroll axis > delta other axis, scroll instead of
	          // making events
	          ret = da >= doa;
	        }
	        return ret;
	      }
	    },
	    findTouch: function(inTL, inId) {
	      for (var i = 0, l = inTL.length, t; i < l && (t = inTL[i]); i++) {
	        if (t.identifier === inId) {
	          return true;
	        }
	      }
	    },
	    // In some instances, a touchstart can happen without a touchend. This
	    // leaves the pointermap in a broken state.
	    // Therefore, on every touchstart, we remove the touches that did not fire a
	    // touchend event.
	    // To keep state globally consistent, we fire a
	    // pointercancel for this "abandoned" touch
	    vacuumTouches: function(inEvent) {
	      var tl = inEvent.touches;
	      // pointermap.pointers() should be < tl.length here, as the touchstart has not
	      // been processed yet.
	      if (pointermap.pointers() >= tl.length) {
	        var d = [];
	        pointermap.forEach(function(value, key) {
	          // Never remove pointerId == 1, which is mouse.
	          // Touch identifiers are 2 smaller than their pointerId, which is the
	          // index in pointermap.
	          if (key !== 1 && !this.findTouch(tl, key - 2)) {
	            var p = value;
	            d.push(p);
	          }
	        }, this);
	        d.forEach(function(p) {
	          this.cancel(p);
	          pointermap.delete(p.pointerId);
	        }, this);
	      }
	    },
	    touchstart: function(inEvent) {
	      this.vacuumTouches(inEvent);
	      this.setPrimaryTouch(inEvent.changedTouches[0]);
	      this.dedupSynthMouse(inEvent);
	      if (!this.scrolling) {
	        this.clickCount++;
	        this.processTouches(inEvent, this.down);
	      }
	    },
	    down: function(inPointer) {
	      dispatcher.down(inPointer);
	    },
	    touchmove: function(inEvent) {
	      if (HAS_TOUCH_ACTION) {
	        // touchevent.cancelable == false is sent when the page is scrolling under native Touch Action in Chrome 36
	        // https://groups.google.com/a/chromium.org/d/msg/input-dev/wHnyukcYBcA/b9kmtwM1jJQJ
	        if (inEvent.cancelable) {
	          this.processTouches(inEvent, this.move);
	        }
	      } else {
	        if (!this.scrolling) {
	          if (this.scrolling === null && this.shouldScroll(inEvent)) {
	            this.scrolling = true;
	          } else {
	            this.scrolling = false;
	            inEvent.preventDefault();
	            this.processTouches(inEvent, this.move);
	          }
	        } else if (this.firstXY) {
	          var t = inEvent.changedTouches[0];
	          var dx = t.clientX - this.firstXY.X;
	          var dy = t.clientY - this.firstXY.Y;
	          var dd = Math.sqrt(dx * dx + dy * dy);
	          if (dd >= HYSTERESIS) {
	            this.touchcancel(inEvent);
	            this.scrolling = true;
	            this.firstXY = null;
	          }
	        }
	      }
	    },
	    move: function(inPointer) {
	      dispatcher.move(inPointer);
	    },
	    touchend: function(inEvent) {
	      this.dedupSynthMouse(inEvent);
	      this.processTouches(inEvent, this.up);
	    },
	    up: function(inPointer) {
	      inPointer.relatedTarget = scope.findTarget(inPointer);
	      dispatcher.up(inPointer);
	    },
	    cancel: function(inPointer) {
	      dispatcher.cancel(inPointer);
	    },
	    touchcancel: function(inEvent) {
	      inEvent._cancel = true;
	      this.processTouches(inEvent, this.cancel);
	    },
	    cleanUpPointer: function(inPointer) {
	      pointermap['delete'](inPointer.pointerId);
	      this.removePrimaryPointer(inPointer);
	    },
	    // prevent synth mouse events from creating pointer events
	    dedupSynthMouse: function(inEvent) {
	      var lts = scope.mouseEvents.lastTouches;
	      var t = inEvent.changedTouches[0];
	      // only the primary finger will synth mouse events
	      if (this.isPrimaryTouch(t)) {
	        // remember x/y of last touch
	        var lt = {x: t.clientX, y: t.clientY};
	        lts.push(lt);
	        var fn = (function(lts, lt){
	          var i = lts.indexOf(lt);
	          if (i > -1) {
	            lts.splice(i, 1);
	          }
	        }).bind(null, lts, lt);
	        setTimeout(fn, DEDUP_TIMEOUT);
	      }
	    }
	  };
	
	  // prevent "ghost clicks" that come from elements that were removed in a touch handler
	  var STOP_PROP_FN = Event.prototype.stopImmediatePropagation || Event.prototype.stopPropagation;
	  document.addEventListener('click', function(ev) {
	    var x = ev.clientX, y = ev.clientY;
	    // check if a click is within DEDUP_DIST px radius of the touchstart
	    var closeTo = function(touch) {
	      var dx = Math.abs(x - touch.x), dy = Math.abs(y - touch.y);
	      return (dx <= DEDUP_DIST && dy <= DEDUP_DIST);
	    };
	    // if click coordinates are close to touch coordinates, assume the click came from a touch
	    var wasTouched = scope.mouseEvents.lastTouches.some(closeTo);
	    // if the click came from touch, and the touchstart target is not in the path of the click event,
	    // then the touchstart target was probably removed, and the click should be "busted"
	    var path = scope.targetFinding.path(ev);
	    if (wasTouched) {
	      for (var i = 0; i < path.length; i++) {
	        if (path[i] === touchEvents.firstTarget) {
	          return;
	        }
	      }
	      ev.preventDefault();
	      STOP_PROP_FN.call(ev);
	    }
	  }, true);
	
	  scope.touchEvents = touchEvents;
	})(window.PolymerGestures);
	
	(function(scope) {
	  var dispatcher = scope.dispatcher;
	  var pointermap = dispatcher.pointermap;
	  var HAS_BITMAP_TYPE = window.MSPointerEvent && typeof window.MSPointerEvent.MSPOINTER_TYPE_MOUSE === 'number';
	  var msEvents = {
	    events: [
	      'MSPointerDown',
	      'MSPointerMove',
	      'MSPointerUp',
	      'MSPointerCancel',
	    ],
	    register: function(target) {
	      dispatcher.listen(target, this.events);
	    },
	    unregister: function(target) {
	      if (target.nodeType === Node.DOCUMENT_NODE) {
	        return;
	      }
	      dispatcher.unlisten(target, this.events);
	    },
	    POINTER_TYPES: [
	      '',
	      'unavailable',
	      'touch',
	      'pen',
	      'mouse'
	    ],
	    prepareEvent: function(inEvent) {
	      var e = inEvent;
	      e = dispatcher.cloneEvent(inEvent);
	      if (HAS_BITMAP_TYPE) {
	        e.pointerType = this.POINTER_TYPES[inEvent.pointerType];
	      }
	      e._source = 'ms';
	      return e;
	    },
	    cleanup: function(id) {
	      pointermap['delete'](id);
	    },
	    MSPointerDown: function(inEvent) {
	      var e = this.prepareEvent(inEvent);
	      e.target = scope.findTarget(inEvent);
	      pointermap.set(inEvent.pointerId, e.target);
	      dispatcher.down(e);
	    },
	    MSPointerMove: function(inEvent) {
	      var target = pointermap.get(inEvent.pointerId);
	      if (target) {
	        var e = this.prepareEvent(inEvent);
	        e.target = target;
	        dispatcher.move(e);
	      }
	    },
	    MSPointerUp: function(inEvent) {
	      var e = this.prepareEvent(inEvent);
	      e.relatedTarget = scope.findTarget(inEvent);
	      e.target = pointermap.get(e.pointerId);
	      dispatcher.up(e);
	      this.cleanup(inEvent.pointerId);
	    },
	    MSPointerCancel: function(inEvent) {
	      var e = this.prepareEvent(inEvent);
	      e.relatedTarget = scope.findTarget(inEvent);
	      e.target = pointermap.get(e.pointerId);
	      dispatcher.cancel(e);
	      this.cleanup(inEvent.pointerId);
	    }
	  };
	
	  scope.msEvents = msEvents;
	})(window.PolymerGestures);
	
	(function(scope) {
	  var dispatcher = scope.dispatcher;
	  var pointermap = dispatcher.pointermap;
	  var pointerEvents = {
	    events: [
	      'pointerdown',
	      'pointermove',
	      'pointerup',
	      'pointercancel'
	    ],
	    prepareEvent: function(inEvent) {
	      var e = dispatcher.cloneEvent(inEvent);
	      e._source = 'pointer';
	      return e;
	    },
	    register: function(target) {
	      dispatcher.listen(target, this.events);
	    },
	    unregister: function(target) {
	      if (target.nodeType === Node.DOCUMENT_NODE) {
	        return;
	      }
	      dispatcher.unlisten(target, this.events);
	    },
	    cleanup: function(id) {
	      pointermap['delete'](id);
	    },
	    pointerdown: function(inEvent) {
	      var e = this.prepareEvent(inEvent);
	      e.target = scope.findTarget(inEvent);
	      pointermap.set(e.pointerId, e.target);
	      dispatcher.down(e);
	    },
	    pointermove: function(inEvent) {
	      var target = pointermap.get(inEvent.pointerId);
	      if (target) {
	        var e = this.prepareEvent(inEvent);
	        e.target = target;
	        dispatcher.move(e);
	      }
	    },
	    pointerup: function(inEvent) {
	      var e = this.prepareEvent(inEvent);
	      e.relatedTarget = scope.findTarget(inEvent);
	      e.target = pointermap.get(e.pointerId);
	      dispatcher.up(e);
	      this.cleanup(inEvent.pointerId);
	    },
	    pointercancel: function(inEvent) {
	      var e = this.prepareEvent(inEvent);
	      e.relatedTarget = scope.findTarget(inEvent);
	      e.target = pointermap.get(e.pointerId);
	      dispatcher.cancel(e);
	      this.cleanup(inEvent.pointerId);
	    }
	  };
	
	  scope.pointerEvents = pointerEvents;
	})(window.PolymerGestures);
	
	/**
	 * This module contains the handlers for native platform events.
	 * From here, the dispatcher is called to create unified pointer events.
	 * Included are touch events (v1), mouse events, and MSPointerEvents.
	 */
	(function(scope) {
	
	  var dispatcher = scope.dispatcher;
	  var nav = window.navigator;
	
	  if (window.PointerEvent) {
	    dispatcher.registerSource('pointer', scope.pointerEvents);
	  } else if (nav.msPointerEnabled) {
	    dispatcher.registerSource('ms', scope.msEvents);
	  } else {
	    dispatcher.registerSource('mouse', scope.mouseEvents);
	    if (window.ontouchstart !== undefined) {
	      dispatcher.registerSource('touch', scope.touchEvents);
	    }
	  }
	
	  // Work around iOS bugs https://bugs.webkit.org/show_bug.cgi?id=135628 and https://bugs.webkit.org/show_bug.cgi?id=136506
	  var ua = navigator.userAgent;
	  var IS_IOS = ua.match(/iPad|iPhone|iPod/) && 'ontouchstart' in window;
	
	  dispatcher.IS_IOS = IS_IOS;
	  scope.touchEvents.IS_IOS = IS_IOS;
	
	  dispatcher.register(document, true);
	})(window.PolymerGestures);
	
	/**
	 * This event denotes the beginning of a series of tracking events.
	 *
	 * @module PointerGestures
	 * @submodule Events
	 * @class trackstart
	 */
	/**
	 * Pixels moved in the x direction since trackstart.
	 * @type Number
	 * @property dx
	 */
	/**
	 * Pixes moved in the y direction since trackstart.
	 * @type Number
	 * @property dy
	 */
	/**
	 * Pixels moved in the x direction since the last track.
	 * @type Number
	 * @property ddx
	 */
	/**
	 * Pixles moved in the y direction since the last track.
	 * @type Number
	 * @property ddy
	 */
	/**
	 * The clientX position of the track gesture.
	 * @type Number
	 * @property clientX
	 */
	/**
	 * The clientY position of the track gesture.
	 * @type Number
	 * @property clientY
	 */
	/**
	 * The pageX position of the track gesture.
	 * @type Number
	 * @property pageX
	 */
	/**
	 * The pageY position of the track gesture.
	 * @type Number
	 * @property pageY
	 */
	/**
	 * The screenX position of the track gesture.
	 * @type Number
	 * @property screenX
	 */
	/**
	 * The screenY position of the track gesture.
	 * @type Number
	 * @property screenY
	 */
	/**
	 * The last x axis direction of the pointer.
	 * @type Number
	 * @property xDirection
	 */
	/**
	 * The last y axis direction of the pointer.
	 * @type Number
	 * @property yDirection
	 */
	/**
	 * A shared object between all tracking events.
	 * @type Object
	 * @property trackInfo
	 */
	/**
	 * The element currently under the pointer.
	 * @type Element
	 * @property relatedTarget
	 */
	/**
	 * The type of pointer that make the track gesture.
	 * @type String
	 * @property pointerType
	 */
	/**
	 *
	 * This event fires for all pointer movement being tracked.
	 *
	 * @class track
	 * @extends trackstart
	 */
	/**
	 * This event fires when the pointer is no longer being tracked.
	 *
	 * @class trackend
	 * @extends trackstart
	 */
	
	 (function(scope) {
	   var dispatcher = scope.dispatcher;
	   var eventFactory = scope.eventFactory;
	   var pointermap = new scope.PointerMap();
	   var track = {
	     events: [
	       'down',
	       'move',
	       'up',
	     ],
	     exposes: [
	      'trackstart',
	      'track',
	      'trackx',
	      'tracky',
	      'trackend'
	     ],
	     defaultActions: {
	       'track': 'none',
	       'trackx': 'pan-y',
	       'tracky': 'pan-x'
	     },
	     WIGGLE_THRESHOLD: 4,
	     clampDir: function(inDelta) {
	       return inDelta > 0 ? 1 : -1;
	     },
	     calcPositionDelta: function(inA, inB) {
	       var x = 0, y = 0;
	       if (inA && inB) {
	         x = inB.pageX - inA.pageX;
	         y = inB.pageY - inA.pageY;
	       }
	       return {x: x, y: y};
	     },
	     fireTrack: function(inType, inEvent, inTrackingData) {
	       var t = inTrackingData;
	       var d = this.calcPositionDelta(t.downEvent, inEvent);
	       var dd = this.calcPositionDelta(t.lastMoveEvent, inEvent);
	       if (dd.x) {
	         t.xDirection = this.clampDir(dd.x);
	       } else if (inType === 'trackx') {
	         return;
	       }
	       if (dd.y) {
	         t.yDirection = this.clampDir(dd.y);
	       } else if (inType === 'tracky') {
	         return;
	       }
	       var gestureProto = {
	         bubbles: true,
	         cancelable: true,
	         trackInfo: t.trackInfo,
	         relatedTarget: inEvent.relatedTarget,
	         pointerType: inEvent.pointerType,
	         pointerId: inEvent.pointerId,
	         _source: 'track'
	       };
	       if (inType !== 'tracky') {
	         gestureProto.x = inEvent.x;
	         gestureProto.dx = d.x;
	         gestureProto.ddx = dd.x;
	         gestureProto.clientX = inEvent.clientX;
	         gestureProto.pageX = inEvent.pageX;
	         gestureProto.screenX = inEvent.screenX;
	         gestureProto.xDirection = t.xDirection;
	       }
	       if (inType !== 'trackx') {
	         gestureProto.dy = d.y;
	         gestureProto.ddy = dd.y;
	         gestureProto.y = inEvent.y;
	         gestureProto.clientY = inEvent.clientY;
	         gestureProto.pageY = inEvent.pageY;
	         gestureProto.screenY = inEvent.screenY;
	         gestureProto.yDirection = t.yDirection;
	       }
	       var e = eventFactory.makeGestureEvent(inType, gestureProto);
	       t.downTarget.dispatchEvent(e);
	     },
	     down: function(inEvent) {
	       if (inEvent.isPrimary && (inEvent.pointerType === 'mouse' ? inEvent.buttons === 1 : true)) {
	         var p = {
	           downEvent: inEvent,
	           downTarget: inEvent.target,
	           trackInfo: {},
	           lastMoveEvent: null,
	           xDirection: 0,
	           yDirection: 0,
	           tracking: false
	         };
	         pointermap.set(inEvent.pointerId, p);
	       }
	     },
	     move: function(inEvent) {
	       var p = pointermap.get(inEvent.pointerId);
	       if (p) {
	         if (!p.tracking) {
	           var d = this.calcPositionDelta(p.downEvent, inEvent);
	           var move = d.x * d.x + d.y * d.y;
	           // start tracking only if finger moves more than WIGGLE_THRESHOLD
	           if (move > this.WIGGLE_THRESHOLD) {
	             p.tracking = true;
	             p.lastMoveEvent = p.downEvent;
	             this.fireTrack('trackstart', inEvent, p);
	           }
	         }
	         if (p.tracking) {
	           this.fireTrack('track', inEvent, p);
	           this.fireTrack('trackx', inEvent, p);
	           this.fireTrack('tracky', inEvent, p);
	         }
	         p.lastMoveEvent = inEvent;
	       }
	     },
	     up: function(inEvent) {
	       var p = pointermap.get(inEvent.pointerId);
	       if (p) {
	         if (p.tracking) {
	           this.fireTrack('trackend', inEvent, p);
	         }
	         pointermap.delete(inEvent.pointerId);
	       }
	     }
	   };
	   dispatcher.registerGesture('track', track);
	 })(window.PolymerGestures);
	
	/**
	 * This event is fired when a pointer is held down for 200ms.
	 *
	 * @module PointerGestures
	 * @submodule Events
	 * @class hold
	 */
	/**
	 * Type of pointer that made the holding event.
	 * @type String
	 * @property pointerType
	 */
	/**
	 * Screen X axis position of the held pointer
	 * @type Number
	 * @property clientX
	 */
	/**
	 * Screen Y axis position of the held pointer
	 * @type Number
	 * @property clientY
	 */
	/**
	 * Type of pointer that made the holding event.
	 * @type String
	 * @property pointerType
	 */
	/**
	 * This event is fired every 200ms while a pointer is held down.
	 *
	 * @class holdpulse
	 * @extends hold
	 */
	/**
	 * Milliseconds pointer has been held down.
	 * @type Number
	 * @property holdTime
	 */
	/**
	 * This event is fired when a held pointer is released or moved.
	 *
	 * @class release
	 */
	
	(function(scope) {
	  var dispatcher = scope.dispatcher;
	  var eventFactory = scope.eventFactory;
	  var hold = {
	    // wait at least HOLD_DELAY ms between hold and pulse events
	    HOLD_DELAY: 200,
	    // pointer can move WIGGLE_THRESHOLD pixels before not counting as a hold
	    WIGGLE_THRESHOLD: 16,
	    events: [
	      'down',
	      'move',
	      'up',
	    ],
	    exposes: [
	      'hold',
	      'holdpulse',
	      'release'
	    ],
	    heldPointer: null,
	    holdJob: null,
	    pulse: function() {
	      var hold = Date.now() - this.heldPointer.timeStamp;
	      var type = this.held ? 'holdpulse' : 'hold';
	      this.fireHold(type, hold);
	      this.held = true;
	    },
	    cancel: function() {
	      clearInterval(this.holdJob);
	      if (this.held) {
	        this.fireHold('release');
	      }
	      this.held = false;
	      this.heldPointer = null;
	      this.target = null;
	      this.holdJob = null;
	    },
	    down: function(inEvent) {
	      if (inEvent.isPrimary && !this.heldPointer) {
	        this.heldPointer = inEvent;
	        this.target = inEvent.target;
	        this.holdJob = setInterval(this.pulse.bind(this), this.HOLD_DELAY);
	      }
	    },
	    up: function(inEvent) {
	      if (this.heldPointer && this.heldPointer.pointerId === inEvent.pointerId) {
	        this.cancel();
	      }
	    },
	    move: function(inEvent) {
	      if (this.heldPointer && this.heldPointer.pointerId === inEvent.pointerId) {
	        var x = inEvent.clientX - this.heldPointer.clientX;
	        var y = inEvent.clientY - this.heldPointer.clientY;
	        if ((x * x + y * y) > this.WIGGLE_THRESHOLD) {
	          this.cancel();
	        }
	      }
	    },
	    fireHold: function(inType, inHoldTime) {
	      var p = {
	        bubbles: true,
	        cancelable: true,
	        pointerType: this.heldPointer.pointerType,
	        pointerId: this.heldPointer.pointerId,
	        x: this.heldPointer.clientX,
	        y: this.heldPointer.clientY,
	        _source: 'hold'
	      };
	      if (inHoldTime) {
	        p.holdTime = inHoldTime;
	      }
	      var e = eventFactory.makeGestureEvent(inType, p);
	      this.target.dispatchEvent(e);
	    }
	  };
	  dispatcher.registerGesture('hold', hold);
	})(window.PolymerGestures);
	
	/**
	 * This event is fired when a pointer quickly goes down and up, and is used to
	 * denote activation.
	 *
	 * Any gesture event can prevent the tap event from being created by calling
	 * `event.preventTap`.
	 *
	 * Any pointer event can prevent the tap by setting the `tapPrevented` property
	 * on itself.
	 *
	 * @module PointerGestures
	 * @submodule Events
	 * @class tap
	 */
	/**
	 * X axis position of the tap.
	 * @property x
	 * @type Number
	 */
	/**
	 * Y axis position of the tap.
	 * @property y
	 * @type Number
	 */
	/**
	 * Type of the pointer that made the tap.
	 * @property pointerType
	 * @type String
	 */
	(function(scope) {
	  var dispatcher = scope.dispatcher;
	  var eventFactory = scope.eventFactory;
	  var pointermap = new scope.PointerMap();
	  var tap = {
	    events: [
	      'down',
	      'up'
	    ],
	    exposes: [
	      'tap'
	    ],
	    down: function(inEvent) {
	      if (inEvent.isPrimary && !inEvent.tapPrevented) {
	        pointermap.set(inEvent.pointerId, {
	          target: inEvent.target,
	          buttons: inEvent.buttons,
	          x: inEvent.clientX,
	          y: inEvent.clientY
	        });
	      }
	    },
	    shouldTap: function(e, downState) {
	      var tap = true;
	      if (e.pointerType === 'mouse') {
	        // only allow left click to tap for mouse
	        tap = (e.buttons ^ 1) && (downState.buttons & 1);
	      }
	      return tap && !e.tapPrevented;
	    },
	    up: function(inEvent) {
	      var start = pointermap.get(inEvent.pointerId);
	      if (start && this.shouldTap(inEvent, start)) {
	        // up.relatedTarget is target currently under finger
	        var t = scope.targetFinding.LCA(start.target, inEvent.relatedTarget);
	        if (t) {
	          var e = eventFactory.makeGestureEvent('tap', {
	            bubbles: true,
	            cancelable: true,
	            x: inEvent.clientX,
	            y: inEvent.clientY,
	            detail: inEvent.detail,
	            pointerType: inEvent.pointerType,
	            pointerId: inEvent.pointerId,
	            altKey: inEvent.altKey,
	            ctrlKey: inEvent.ctrlKey,
	            metaKey: inEvent.metaKey,
	            shiftKey: inEvent.shiftKey,
	            _source: 'tap'
	          });
	          t.dispatchEvent(e);
	        }
	      }
	      pointermap.delete(inEvent.pointerId);
	    }
	  };
	  // patch eventFactory to remove id from tap's pointermap for preventTap calls
	  eventFactory.preventTap = function(e) {
	    return function() {
	      e.tapPrevented = true;
	      pointermap.delete(e.pointerId);
	    };
	  };
	  dispatcher.registerGesture('tap', tap);
	})(window.PolymerGestures);
	
	/*
	 * Basic strategy: find the farthest apart points, use as diameter of circle
	 * react to size change and rotation of the chord
	 */
	
	/**
	 * @module pointer-gestures
	 * @submodule Events
	 * @class pinch
	 */
	/**
	 * Scale of the pinch zoom gesture
	 * @property scale
	 * @type Number
	 */
	/**
	 * Center X position of pointers causing pinch
	 * @property centerX
	 * @type Number
	 */
	/**
	 * Center Y position of pointers causing pinch
	 * @property centerY
	 * @type Number
	 */
	
	/**
	 * @module pointer-gestures
	 * @submodule Events
	 * @class rotate
	 */
	/**
	 * Angle (in degrees) of rotation. Measured from starting positions of pointers.
	 * @property angle
	 * @type Number
	 */
	/**
	 * Center X position of pointers causing rotation
	 * @property centerX
	 * @type Number
	 */
	/**
	 * Center Y position of pointers causing rotation
	 * @property centerY
	 * @type Number
	 */
	(function(scope) {
	  var dispatcher = scope.dispatcher;
	  var eventFactory = scope.eventFactory;
	  var pointermap = new scope.PointerMap();
	  var RAD_TO_DEG = 180 / Math.PI;
	  var pinch = {
	    events: [
	      'down',
	      'up',
	      'move',
	      'cancel'
	    ],
	    exposes: [
	      'pinchstart',
	      'pinch',
	      'pinchend',
	      'rotate'
	    ],
	    defaultActions: {
	      'pinch': 'none',
	      'rotate': 'none'
	    },
	    reference: {},
	    down: function(inEvent) {
	      pointermap.set(inEvent.pointerId, inEvent);
	      if (pointermap.pointers() == 2) {
	        var points = this.calcChord();
	        var angle = this.calcAngle(points);
	        this.reference = {
	          angle: angle,
	          diameter: points.diameter,
	          target: scope.targetFinding.LCA(points.a.target, points.b.target)
	        };
	
	        this.firePinch('pinchstart', points.diameter, points);
	      }
	    },
	    up: function(inEvent) {
	      var p = pointermap.get(inEvent.pointerId);
	      var num = pointermap.pointers();
	      if (p) {
	        if (num === 2) {
	          // fire 'pinchend' before deleting pointer
	          var points = this.calcChord();
	          this.firePinch('pinchend', points.diameter, points);
	        }
	        pointermap.delete(inEvent.pointerId);
	      }
	    },
	    move: function(inEvent) {
	      if (pointermap.has(inEvent.pointerId)) {
	        pointermap.set(inEvent.pointerId, inEvent);
	        if (pointermap.pointers() > 1) {
	          this.calcPinchRotate();
	        }
	      }
	    },
	    cancel: function(inEvent) {
	        this.up(inEvent);
	    },
	    firePinch: function(type, diameter, points) {
	      var zoom = diameter / this.reference.diameter;
	      var e = eventFactory.makeGestureEvent(type, {
	        bubbles: true,
	        cancelable: true,
	        scale: zoom,
	        centerX: points.center.x,
	        centerY: points.center.y,
	        _source: 'pinch'
	      });
	      this.reference.target.dispatchEvent(e);
	    },
	    fireRotate: function(angle, points) {
	      var diff = Math.round((angle - this.reference.angle) % 360);
	      var e = eventFactory.makeGestureEvent('rotate', {
	        bubbles: true,
	        cancelable: true,
	        angle: diff,
	        centerX: points.center.x,
	        centerY: points.center.y,
	        _source: 'pinch'
	      });
	      this.reference.target.dispatchEvent(e);
	    },
	    calcPinchRotate: function() {
	      var points = this.calcChord();
	      var diameter = points.diameter;
	      var angle = this.calcAngle(points);
	      if (diameter != this.reference.diameter) {
	        this.firePinch('pinch', diameter, points);
	      }
	      if (angle != this.reference.angle) {
	        this.fireRotate(angle, points);
	      }
	    },
	    calcChord: function() {
	      var pointers = [];
	      pointermap.forEach(function(p) {
	        pointers.push(p);
	      });
	      var dist = 0;
	      // start with at least two pointers
	      var points = {a: pointers[0], b: pointers[1]};
	      var x, y, d;
	      for (var i = 0; i < pointers.length; i++) {
	        var a = pointers[i];
	        for (var j = i + 1; j < pointers.length; j++) {
	          var b = pointers[j];
	          x = Math.abs(a.clientX - b.clientX);
	          y = Math.abs(a.clientY - b.clientY);
	          d = x + y;
	          if (d > dist) {
	            dist = d;
	            points = {a: a, b: b};
	          }
	        }
	      }
	      x = Math.abs(points.a.clientX + points.b.clientX) / 2;
	      y = Math.abs(points.a.clientY + points.b.clientY) / 2;
	      points.center = { x: x, y: y };
	      points.diameter = dist;
	      return points;
	    },
	    calcAngle: function(points) {
	      var x = points.a.clientX - points.b.clientX;
	      var y = points.a.clientY - points.b.clientY;
	      return (360 + Math.atan2(y, x) * RAD_TO_DEG) % 360;
	    }
	  };
	  dispatcher.registerGesture('pinch', pinch);
	})(window.PolymerGestures);
	
	(function (global) {
	    'use strict';
	
	    var Token,
	        TokenName,
	        Syntax,
	        Messages,
	        source,
	        index,
	        length,
	        delegate,
	        lookahead,
	        state;
	
	    Token = {
	        BooleanLiteral: 1,
	        EOF: 2,
	        Identifier: 3,
	        Keyword: 4,
	        NullLiteral: 5,
	        NumericLiteral: 6,
	        Punctuator: 7,
	        StringLiteral: 8
	    };
	
	    TokenName = {};
	    TokenName[Token.BooleanLiteral] = 'Boolean';
	    TokenName[Token.EOF] = '<end>';
	    TokenName[Token.Identifier] = 'Identifier';
	    TokenName[Token.Keyword] = 'Keyword';
	    TokenName[Token.NullLiteral] = 'Null';
	    TokenName[Token.NumericLiteral] = 'Numeric';
	    TokenName[Token.Punctuator] = 'Punctuator';
	    TokenName[Token.StringLiteral] = 'String';
	
	    Syntax = {
	        ArrayExpression: 'ArrayExpression',
	        BinaryExpression: 'BinaryExpression',
	        CallExpression: 'CallExpression',
	        ConditionalExpression: 'ConditionalExpression',
	        EmptyStatement: 'EmptyStatement',
	        ExpressionStatement: 'ExpressionStatement',
	        Identifier: 'Identifier',
	        Literal: 'Literal',
	        LabeledStatement: 'LabeledStatement',
	        LogicalExpression: 'LogicalExpression',
	        MemberExpression: 'MemberExpression',
	        ObjectExpression: 'ObjectExpression',
	        Program: 'Program',
	        Property: 'Property',
	        ThisExpression: 'ThisExpression',
	        UnaryExpression: 'UnaryExpression'
	    };
	
	    // Error messages should be identical to V8.
	    Messages = {
	        UnexpectedToken:  'Unexpected token %0',
	        UnknownLabel: 'Undefined label \'%0\'',
	        Redeclaration: '%0 \'%1\' has already been declared'
	    };
	
	    // Ensure the condition is true, otherwise throw an error.
	    // This is only to have a better contract semantic, i.e. another safety net
	    // to catch a logic error. The condition shall be fulfilled in normal case.
	    // Do NOT use this to enforce a certain condition on any user input.
	
	    function assert(condition, message) {
	        if (!condition) {
	            throw new Error('ASSERT: ' + message);
	        }
	    }
	
	    function isDecimalDigit(ch) {
	        return (ch >= 48 && ch <= 57);   // 0..9
	    }
	
	
	    // 7.2 White Space
	
	    function isWhiteSpace(ch) {
	        return (ch === 32) ||  // space
	            (ch === 9) ||      // tab
	            (ch === 0xB) ||
	            (ch === 0xC) ||
	            (ch === 0xA0) ||
	            (ch >= 0x1680 && '\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF'.indexOf(String.fromCharCode(ch)) > 0);
	    }
	
	    // 7.3 Line Terminators
	
	    function isLineTerminator(ch) {
	        return (ch === 10) || (ch === 13) || (ch === 0x2028) || (ch === 0x2029);
	    }
	
	    // 7.6 Identifier Names and Identifiers
	
	    function isIdentifierStart(ch) {
	        return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
	            (ch >= 65 && ch <= 90) ||         // A..Z
	            (ch >= 97 && ch <= 122);          // a..z
	    }
	
	    function isIdentifierPart(ch) {
	        return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
	            (ch >= 65 && ch <= 90) ||         // A..Z
	            (ch >= 97 && ch <= 122) ||        // a..z
	            (ch >= 48 && ch <= 57);           // 0..9
	    }
	
	    // 7.6.1.1 Keywords
	
	    function isKeyword(id) {
	        return (id === 'this')
	    }
	
	    // 7.4 Comments
	
	    function skipWhitespace() {
	        while (index < length && isWhiteSpace(source.charCodeAt(index))) {
	           ++index;
	        }
	    }
	
	    function getIdentifier() {
	        var start, ch;
	
	        start = index++;
	        while (index < length) {
	            ch = source.charCodeAt(index);
	            if (isIdentifierPart(ch)) {
	                ++index;
	            } else {
	                break;
	            }
	        }
	
	        return source.slice(start, index);
	    }
	
	    function scanIdentifier() {
	        var start, id, type;
	
	        start = index;
	
	        id = getIdentifier();
	
	        // There is no keyword or literal with only one character.
	        // Thus, it must be an identifier.
	        if (id.length === 1) {
	            type = Token.Identifier;
	        } else if (isKeyword(id)) {
	            type = Token.Keyword;
	        } else if (id === 'null') {
	            type = Token.NullLiteral;
	        } else if (id === 'true' || id === 'false') {
	            type = Token.BooleanLiteral;
	        } else {
	            type = Token.Identifier;
	        }
	
	        return {
	            type: type,
	            value: id,
	            range: [start, index]
	        };
	    }
	
	
	    // 7.7 Punctuators
	
	    function scanPunctuator() {
	        var start = index,
	            code = source.charCodeAt(index),
	            code2,
	            ch1 = source[index],
	            ch2;
	
	        switch (code) {
	
	        // Check for most common single-character punctuators.
	        case 46:   // . dot
	        case 40:   // ( open bracket
	        case 41:   // ) close bracket
	        case 59:   // ; semicolon
	        case 44:   // , comma
	        case 123:  // { open curly brace
	        case 125:  // } close curly brace
	        case 91:   // [
	        case 93:   // ]
	        case 58:   // :
	        case 63:   // ?
	            ++index;
	            return {
	                type: Token.Punctuator,
	                value: String.fromCharCode(code),
	                range: [start, index]
	            };
	
	        default:
	            code2 = source.charCodeAt(index + 1);
	
	            // '=' (char #61) marks an assignment or comparison operator.
	            if (code2 === 61) {
	                switch (code) {
	                case 37:  // %
	                case 38:  // &
	                case 42:  // *:
	                case 43:  // +
	                case 45:  // -
	                case 47:  // /
	                case 60:  // <
	                case 62:  // >
	                case 124: // |
	                    index += 2;
	                    return {
	                        type: Token.Punctuator,
	                        value: String.fromCharCode(code) + String.fromCharCode(code2),
	                        range: [start, index]
	                    };
	
	                case 33: // !
	                case 61: // =
	                    index += 2;
	
	                    // !== and ===
	                    if (source.charCodeAt(index) === 61) {
	                        ++index;
	                    }
	                    return {
	                        type: Token.Punctuator,
	                        value: source.slice(start, index),
	                        range: [start, index]
	                    };
	                default:
	                    break;
	                }
	            }
	            break;
	        }
	
	        // Peek more characters.
	
	        ch2 = source[index + 1];
	
	        // Other 2-character punctuators: && ||
	
	        if (ch1 === ch2 && ('&|'.indexOf(ch1) >= 0)) {
	            index += 2;
	            return {
	                type: Token.Punctuator,
	                value: ch1 + ch2,
	                range: [start, index]
	            };
	        }
	
	        if ('<>=!+-*%&|^/'.indexOf(ch1) >= 0) {
	            ++index;
	            return {
	                type: Token.Punctuator,
	                value: ch1,
	                range: [start, index]
	            };
	        }
	
	        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	    }
	
	    // 7.8.3 Numeric Literals
	    function scanNumericLiteral() {
	        var number, start, ch;
	
	        ch = source[index];
	        assert(isDecimalDigit(ch.charCodeAt(0)) || (ch === '.'),
	            'Numeric literal must start with a decimal digit or a decimal point');
	
	        start = index;
	        number = '';
	        if (ch !== '.') {
	            number = source[index++];
	            ch = source[index];
	
	            // Hex number starts with '0x'.
	            // Octal number starts with '0'.
	            if (number === '0') {
	                // decimal number starts with '0' such as '09' is illegal.
	                if (ch && isDecimalDigit(ch.charCodeAt(0))) {
	                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                }
	            }
	
	            while (isDecimalDigit(source.charCodeAt(index))) {
	                number += source[index++];
	            }
	            ch = source[index];
	        }
	
	        if (ch === '.') {
	            number += source[index++];
	            while (isDecimalDigit(source.charCodeAt(index))) {
	                number += source[index++];
	            }
	            ch = source[index];
	        }
	
	        if (ch === 'e' || ch === 'E') {
	            number += source[index++];
	
	            ch = source[index];
	            if (ch === '+' || ch === '-') {
	                number += source[index++];
	            }
	            if (isDecimalDigit(source.charCodeAt(index))) {
	                while (isDecimalDigit(source.charCodeAt(index))) {
	                    number += source[index++];
	                }
	            } else {
	                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	            }
	        }
	
	        if (isIdentifierStart(source.charCodeAt(index))) {
	            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	        }
	
	        return {
	            type: Token.NumericLiteral,
	            value: parseFloat(number),
	            range: [start, index]
	        };
	    }
	
	    // 7.8.4 String Literals
	
	    function scanStringLiteral() {
	        var str = '', quote, start, ch, octal = false;
	
	        quote = source[index];
	        assert((quote === '\'' || quote === '"'),
	            'String literal must starts with a quote');
	
	        start = index;
	        ++index;
	
	        while (index < length) {
	            ch = source[index++];
	
	            if (ch === quote) {
	                quote = '';
	                break;
	            } else if (ch === '\\') {
	                ch = source[index++];
	                if (!ch || !isLineTerminator(ch.charCodeAt(0))) {
	                    switch (ch) {
	                    case 'n':
	                        str += '\n';
	                        break;
	                    case 'r':
	                        str += '\r';
	                        break;
	                    case 't':
	                        str += '\t';
	                        break;
	                    case 'b':
	                        str += '\b';
	                        break;
	                    case 'f':
	                        str += '\f';
	                        break;
	                    case 'v':
	                        str += '\x0B';
	                        break;
	
	                    default:
	                        str += ch;
	                        break;
	                    }
	                } else {
	                    if (ch ===  '\r' && source[index] === '\n') {
	                        ++index;
	                    }
	                }
	            } else if (isLineTerminator(ch.charCodeAt(0))) {
	                break;
	            } else {
	                str += ch;
	            }
	        }
	
	        if (quote !== '') {
	            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	        }
	
	        return {
	            type: Token.StringLiteral,
	            value: str,
	            octal: octal,
	            range: [start, index]
	        };
	    }
	
	    function isIdentifierName(token) {
	        return token.type === Token.Identifier ||
	            token.type === Token.Keyword ||
	            token.type === Token.BooleanLiteral ||
	            token.type === Token.NullLiteral;
	    }
	
	    function advance() {
	        var ch;
	
	        skipWhitespace();
	
	        if (index >= length) {
	            return {
	                type: Token.EOF,
	                range: [index, index]
	            };
	        }
	
	        ch = source.charCodeAt(index);
	
	        // Very common: ( and ) and ;
	        if (ch === 40 || ch === 41 || ch === 58) {
	            return scanPunctuator();
	        }
	
	        // String literal starts with single quote (#39) or double quote (#34).
	        if (ch === 39 || ch === 34) {
	            return scanStringLiteral();
	        }
	
	        if (isIdentifierStart(ch)) {
	            return scanIdentifier();
	        }
	
	        // Dot (.) char #46 can also start a floating-point number, hence the need
	        // to check the next character.
	        if (ch === 46) {
	            if (isDecimalDigit(source.charCodeAt(index + 1))) {
	                return scanNumericLiteral();
	            }
	            return scanPunctuator();
	        }
	
	        if (isDecimalDigit(ch)) {
	            return scanNumericLiteral();
	        }
	
	        return scanPunctuator();
	    }
	
	    function lex() {
	        var token;
	
	        token = lookahead;
	        index = token.range[1];
	
	        lookahead = advance();
	
	        index = token.range[1];
	
	        return token;
	    }
	
	    function peek() {
	        var pos;
	
	        pos = index;
	        lookahead = advance();
	        index = pos;
	    }
	
	    // Throw an exception
	
	    function throwError(token, messageFormat) {
	        var error,
	            args = Array.prototype.slice.call(arguments, 2),
	            msg = messageFormat.replace(
	                /%(\d)/g,
	                function (whole, index) {
	                    assert(index < args.length, 'Message reference must be in range');
	                    return args[index];
	                }
	            );
	
	        error = new Error(msg);
	        error.index = index;
	        error.description = msg;
	        throw error;
	    }
	
	    // Throw an exception because of the token.
	
	    function throwUnexpected(token) {
	        throwError(token, Messages.UnexpectedToken, token.value);
	    }
	
	    // Expect the next token to match the specified punctuator.
	    // If not, an exception will be thrown.
	
	    function expect(value) {
	        var token = lex();
	        if (token.type !== Token.Punctuator || token.value !== value) {
	            throwUnexpected(token);
	        }
	    }
	
	    // Return true if the next token matches the specified punctuator.
	
	    function match(value) {
	        return lookahead.type === Token.Punctuator && lookahead.value === value;
	    }
	
	    // Return true if the next token matches the specified keyword
	
	    function matchKeyword(keyword) {
	        return lookahead.type === Token.Keyword && lookahead.value === keyword;
	    }
	
	    function consumeSemicolon() {
	        // Catch the very common case first: immediately a semicolon (char #59).
	        if (source.charCodeAt(index) === 59) {
	            lex();
	            return;
	        }
	
	        skipWhitespace();
	
	        if (match(';')) {
	            lex();
	            return;
	        }
	
	        if (lookahead.type !== Token.EOF && !match('}')) {
	            throwUnexpected(lookahead);
	        }
	    }
	
	    // 11.1.4 Array Initialiser
	
	    function parseArrayInitialiser() {
	        var elements = [];
	
	        expect('[');
	
	        while (!match(']')) {
	            if (match(',')) {
	                lex();
	                elements.push(null);
	            } else {
	                elements.push(parseExpression());
	
	                if (!match(']')) {
	                    expect(',');
	                }
	            }
	        }
	
	        expect(']');
	
	        return delegate.createArrayExpression(elements);
	    }
	
	    // 11.1.5 Object Initialiser
	
	    function parseObjectPropertyKey() {
	        var token;
	
	        skipWhitespace();
	        token = lex();
	
	        // Note: This function is called only from parseObjectProperty(), where
	        // EOF and Punctuator tokens are already filtered out.
	        if (token.type === Token.StringLiteral || token.type === Token.NumericLiteral) {
	            return delegate.createLiteral(token);
	        }
	
	        return delegate.createIdentifier(token.value);
	    }
	
	    function parseObjectProperty() {
	        var token, key;
	
	        token = lookahead;
	        skipWhitespace();
	
	        if (token.type === Token.EOF || token.type === Token.Punctuator) {
	            throwUnexpected(token);
	        }
	
	        key = parseObjectPropertyKey();
	        expect(':');
	        return delegate.createProperty('init', key, parseExpression());
	    }
	
	    function parseObjectInitialiser() {
	        var properties = [];
	
	        expect('{');
	
	        while (!match('}')) {
	            properties.push(parseObjectProperty());
	
	            if (!match('}')) {
	                expect(',');
	            }
	        }
	
	        expect('}');
	
	        return delegate.createObjectExpression(properties);
	    }
	
	    // 11.1.6 The Grouping Operator
	
	    function parseGroupExpression() {
	        var expr;
	
	        expect('(');
	
	        expr = parseExpression();
	
	        expect(')');
	
	        return expr;
	    }
	
	
	    // 11.1 Primary Expressions
	
	    function parsePrimaryExpression() {
	        var type, token, expr;
	
	        if (match('(')) {
	            return parseGroupExpression();
	        }
	
	        type = lookahead.type;
	
	        if (type === Token.Identifier) {
	            expr = delegate.createIdentifier(lex().value);
	        } else if (type === Token.StringLiteral || type === Token.NumericLiteral) {
	            expr = delegate.createLiteral(lex());
	        } else if (type === Token.Keyword) {
	            if (matchKeyword('this')) {
	                lex();
	                expr = delegate.createThisExpression();
	            }
	        } else if (type === Token.BooleanLiteral) {
	            token = lex();
	            token.value = (token.value === 'true');
	            expr = delegate.createLiteral(token);
	        } else if (type === Token.NullLiteral) {
	            token = lex();
	            token.value = null;
	            expr = delegate.createLiteral(token);
	        } else if (match('[')) {
	            expr = parseArrayInitialiser();
	        } else if (match('{')) {
	            expr = parseObjectInitialiser();
	        }
	
	        if (expr) {
	            return expr;
	        }
	
	        throwUnexpected(lex());
	    }
	
	    // 11.2 Left-Hand-Side Expressions
	
	    function parseArguments() {
	        var args = [];
	
	        expect('(');
	
	        if (!match(')')) {
	            while (index < length) {
	                args.push(parseExpression());
	                if (match(')')) {
	                    break;
	                }
	                expect(',');
	            }
	        }
	
	        expect(')');
	
	        return args;
	    }
	
	    function parseNonComputedProperty() {
	        var token;
	
	        token = lex();
	
	        if (!isIdentifierName(token)) {
	            throwUnexpected(token);
	        }
	
	        return delegate.createIdentifier(token.value);
	    }
	
	    function parseNonComputedMember() {
	        expect('.');
	
	        return parseNonComputedProperty();
	    }
	
	    function parseComputedMember() {
	        var expr;
	
	        expect('[');
	
	        expr = parseExpression();
	
	        expect(']');
	
	        return expr;
	    }
	
	    function parseLeftHandSideExpression() {
	        var expr, args, property;
	
	        expr = parsePrimaryExpression();
	
	        while (true) {
	            if (match('[')) {
	                property = parseComputedMember();
	                expr = delegate.createMemberExpression('[', expr, property);
	            } else if (match('.')) {
	                property = parseNonComputedMember();
	                expr = delegate.createMemberExpression('.', expr, property);
	            } else if (match('(')) {
	                args = parseArguments();
	                expr = delegate.createCallExpression(expr, args);
	            } else {
	                break;
	            }
	        }
	
	        return expr;
	    }
	
	    // 11.3 Postfix Expressions
	
	    var parsePostfixExpression = parseLeftHandSideExpression;
	
	    // 11.4 Unary Operators
	
	    function parseUnaryExpression() {
	        var token, expr;
	
	        if (lookahead.type !== Token.Punctuator && lookahead.type !== Token.Keyword) {
	            expr = parsePostfixExpression();
	        } else if (match('+') || match('-') || match('!')) {
	            token = lex();
	            expr = parseUnaryExpression();
	            expr = delegate.createUnaryExpression(token.value, expr);
	        } else if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
	            throwError({}, Messages.UnexpectedToken);
	        } else {
	            expr = parsePostfixExpression();
	        }
	
	        return expr;
	    }
	
	    function binaryPrecedence(token) {
	        var prec = 0;
	
	        if (token.type !== Token.Punctuator && token.type !== Token.Keyword) {
	            return 0;
	        }
	
	        switch (token.value) {
	        case '||':
	            prec = 1;
	            break;
	
	        case '&&':
	            prec = 2;
	            break;
	
	        case '==':
	        case '!=':
	        case '===':
	        case '!==':
	            prec = 6;
	            break;
	
	        case '<':
	        case '>':
	        case '<=':
	        case '>=':
	        case 'instanceof':
	            prec = 7;
	            break;
	
	        case 'in':
	            prec = 7;
	            break;
	
	        case '+':
	        case '-':
	            prec = 9;
	            break;
	
	        case '*':
	        case '/':
	        case '%':
	            prec = 11;
	            break;
	
	        default:
	            break;
	        }
	
	        return prec;
	    }
	
	    // 11.5 Multiplicative Operators
	    // 11.6 Additive Operators
	    // 11.7 Bitwise Shift Operators
	    // 11.8 Relational Operators
	    // 11.9 Equality Operators
	    // 11.10 Binary Bitwise Operators
	    // 11.11 Binary Logical Operators
	
	    function parseBinaryExpression() {
	        var expr, token, prec, stack, right, operator, left, i;
	
	        left = parseUnaryExpression();
	
	        token = lookahead;
	        prec = binaryPrecedence(token);
	        if (prec === 0) {
	            return left;
	        }
	        token.prec = prec;
	        lex();
	
	        right = parseUnaryExpression();
	
	        stack = [left, token, right];
	
	        while ((prec = binaryPrecedence(lookahead)) > 0) {
	
	            // Reduce: make a binary expression from the three topmost entries.
	            while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
	                right = stack.pop();
	                operator = stack.pop().value;
	                left = stack.pop();
	                expr = delegate.createBinaryExpression(operator, left, right);
	                stack.push(expr);
	            }
	
	            // Shift.
	            token = lex();
	            token.prec = prec;
	            stack.push(token);
	            expr = parseUnaryExpression();
	            stack.push(expr);
	        }
	
	        // Final reduce to clean-up the stack.
	        i = stack.length - 1;
	        expr = stack[i];
	        while (i > 1) {
	            expr = delegate.createBinaryExpression(stack[i - 1].value, stack[i - 2], expr);
	            i -= 2;
	        }
	
	        return expr;
	    }
	
	
	    // 11.12 Conditional Operator
	
	    function parseConditionalExpression() {
	        var expr, consequent, alternate;
	
	        expr = parseBinaryExpression();
	
	        if (match('?')) {
	            lex();
	            consequent = parseConditionalExpression();
	            expect(':');
	            alternate = parseConditionalExpression();
	
	            expr = delegate.createConditionalExpression(expr, consequent, alternate);
	        }
	
	        return expr;
	    }
	
	    // Simplification since we do not support AssignmentExpression.
	    var parseExpression = parseConditionalExpression;
	
	    // Polymer Syntax extensions
	
	    // Filter ::
	    //   Identifier
	    //   Identifier "(" ")"
	    //   Identifier "(" FilterArguments ")"
	
	    function parseFilter() {
	        var identifier, args;
	
	        identifier = lex();
	
	        if (identifier.type !== Token.Identifier) {
	            throwUnexpected(identifier);
	        }
	
	        args = match('(') ? parseArguments() : [];
	
	        return delegate.createFilter(identifier.value, args);
	    }
	
	    // Filters ::
	    //   "|" Filter
	    //   Filters "|" Filter
	
	    function parseFilters() {
	        while (match('|')) {
	            lex();
	            parseFilter();
	        }
	    }
	
	    // TopLevel ::
	    //   LabelledExpressions
	    //   AsExpression
	    //   InExpression
	    //   FilterExpression
	
	    // AsExpression ::
	    //   FilterExpression as Identifier
	
	    // InExpression ::
	    //   Identifier, Identifier in FilterExpression
	    //   Identifier in FilterExpression
	
	    // FilterExpression ::
	    //   Expression
	    //   Expression Filters
	
	    function parseTopLevel() {
	        skipWhitespace();
	        peek();
	
	        var expr = parseExpression();
	        if (expr) {
	            if (lookahead.value === ',' || lookahead.value == 'in' &&
	                       expr.type === Syntax.Identifier) {
	                parseInExpression(expr);
	            } else {
	                parseFilters();
	                if (lookahead.value === 'as') {
	                    parseAsExpression(expr);
	                } else {
	                    delegate.createTopLevel(expr);
	                }
	            }
	        }
	
	        if (lookahead.type !== Token.EOF) {
	            throwUnexpected(lookahead);
	        }
	    }
	
	    function parseAsExpression(expr) {
	        lex();  // as
	        var identifier = lex().value;
	        delegate.createAsExpression(expr, identifier);
	    }
	
	    function parseInExpression(identifier) {
	        var indexName;
	        if (lookahead.value === ',') {
	            lex();
	            if (lookahead.type !== Token.Identifier)
	                throwUnexpected(lookahead);
	            indexName = lex().value;
	        }
	
	        lex();  // in
	        var expr = parseExpression();
	        parseFilters();
	        delegate.createInExpression(identifier.name, indexName, expr);
	    }
	
	    function parse(code, inDelegate) {
	        delegate = inDelegate;
	        source = code;
	        index = 0;
	        length = source.length;
	        lookahead = null;
	        state = {
	            labelSet: {}
	        };
	
	        return parseTopLevel();
	    }
	
	    global.esprima = {
	        parse: parse
	    };
	})(this);
	
	// Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
	// This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
	// The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
	// The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
	// Code distributed by Google as part of the polymer project is also
	// subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
	
	(function (global) {
	  'use strict';
	
	  function prepareBinding(expressionText, name, node, filterRegistry) {
	    var expression;
	    try {
	      expression = getExpression(expressionText);
	      if (expression.scopeIdent &&
	          (node.nodeType !== Node.ELEMENT_NODE ||
	           node.tagName !== 'TEMPLATE' ||
	           (name !== 'bind' && name !== 'repeat'))) {
	        throw Error('as and in can only be used within <template bind/repeat>');
	      }
	    } catch (ex) {
	      console.error('Invalid expression syntax: ' + expressionText, ex);
	      return;
	    }
	
	    return function(model, node, oneTime) {
	      var binding = expression.getBinding(model, filterRegistry, oneTime);
	      if (expression.scopeIdent && binding) {
	        node.polymerExpressionScopeIdent_ = expression.scopeIdent;
	        if (expression.indexIdent)
	          node.polymerExpressionIndexIdent_ = expression.indexIdent;
	      }
	
	      return binding;
	    }
	  }
	
	  // TODO(rafaelw): Implement simple LRU.
	  var expressionParseCache = Object.create(null);
	
	  function getExpression(expressionText) {
	    var expression = expressionParseCache[expressionText];
	    if (!expression) {
	      var delegate = new ASTDelegate();
	      esprima.parse(expressionText, delegate);
	      expression = new Expression(delegate);
	      expressionParseCache[expressionText] = expression;
	    }
	    return expression;
	  }
	
	  function Literal(value) {
	    this.value = value;
	    this.valueFn_ = undefined;
	  }
	
	  Literal.prototype = {
	    valueFn: function() {
	      if (!this.valueFn_) {
	        var value = this.value;
	        this.valueFn_ = function() {
	          return value;
	        }
	      }
	
	      return this.valueFn_;
	    }
	  }
	
	  function IdentPath(name) {
	    this.name = name;
	    this.path = Path.get(name);
	  }
	
	  IdentPath.prototype = {
	    valueFn: function() {
	      if (!this.valueFn_) {
	        var name = this.name;
	        var path = this.path;
	        this.valueFn_ = function(model, observer) {
	          if (observer)
	            observer.addPath(model, path);
	
	          return path.getValueFrom(model);
	        }
	      }
	
	      return this.valueFn_;
	    },
	
	    setValue: function(model, newValue) {
	      if (this.path.length == 1)
	        model = findScope(model, this.path[0]);
	
	      return this.path.setValueFrom(model, newValue);
	    }
	  };
	
	  function MemberExpression(object, property, accessor) {
	    this.computed = accessor == '[';
	
	    this.dynamicDeps = typeof object == 'function' ||
	                       object.dynamicDeps ||
	                       (this.computed && !(property instanceof Literal));
	
	    this.simplePath =
	        !this.dynamicDeps &&
	        (property instanceof IdentPath || property instanceof Literal) &&
	        (object instanceof MemberExpression || object instanceof IdentPath);
	
	    this.object = this.simplePath ? object : getFn(object);
	    this.property = !this.computed || this.simplePath ?
	        property : getFn(property);
	  }
	
	  MemberExpression.prototype = {
	    get fullPath() {
	      if (!this.fullPath_) {
	
	        var parts = this.object instanceof MemberExpression ?
	            this.object.fullPath.slice() : [this.object.name];
	        parts.push(this.property instanceof IdentPath ?
	            this.property.name : this.property.value);
	        this.fullPath_ = Path.get(parts);
	      }
	
	      return this.fullPath_;
	    },
	
	    valueFn: function() {
	      if (!this.valueFn_) {
	        var object = this.object;
	
	        if (this.simplePath) {
	          var path = this.fullPath;
	
	          this.valueFn_ = function(model, observer) {
	            if (observer)
	              observer.addPath(model, path);
	
	            return path.getValueFrom(model);
	          };
	        } else if (!this.computed) {
	          var path = Path.get(this.property.name);
	
	          this.valueFn_ = function(model, observer, filterRegistry) {
	            var context = object(model, observer, filterRegistry);
	
	            if (observer)
	              observer.addPath(context, path);
	
	            return path.getValueFrom(context);
	          }
	        } else {
	          // Computed property.
	          var property = this.property;
	
	          this.valueFn_ = function(model, observer, filterRegistry) {
	            var context = object(model, observer, filterRegistry);
	            var propName = property(model, observer, filterRegistry);
	            if (observer)
	              observer.addPath(context, [propName]);
	
	            return context ? context[propName] : undefined;
	          };
	        }
	      }
	      return this.valueFn_;
	    },
	
	    setValue: function(model, newValue) {
	      if (this.simplePath) {
	        this.fullPath.setValueFrom(model, newValue);
	        return newValue;
	      }
	
	      var object = this.object(model);
	      var propName = this.property instanceof IdentPath ? this.property.name :
	          this.property(model);
	      return object[propName] = newValue;
	    }
	  };
	
	  function Filter(name, args) {
	    this.name = name;
	    this.args = [];
	    for (var i = 0; i < args.length; i++) {
	      this.args[i] = getFn(args[i]);
	    }
	  }
	
	  Filter.prototype = {
	    transform: function(model, observer, filterRegistry, toModelDirection,
	                        initialArgs) {
	      var context = model;
	      var fn = context[this.name];
	
	      if (!fn) {
	        fn = filterRegistry[this.name];
	        if (!fn) {
	          console.error('Cannot find function or filter: ' + this.name);
	          return;
	        }
	      }
	
	      // If toModelDirection is falsey, then the "normal" (dom-bound) direction
	      // is used. Otherwise, it looks for a 'toModel' property function on the
	      // object.
	      if (toModelDirection) {
	        fn = fn.toModel;
	      } else if (typeof fn.toDOM == 'function') {
	        fn = fn.toDOM;
	      }
	
	      if (typeof fn != 'function') {
	        console.error('Cannot find function or filter: ' + this.name);
	        return;
	      }
	
	      var args = initialArgs || [];
	      for (var i = 0; i < this.args.length; i++) {
	        args.push(getFn(this.args[i])(model, observer, filterRegistry));
	      }
	
	      return fn.apply(context, args);
	    }
	  };
	
	  function notImplemented() { throw Error('Not Implemented'); }
	
	  var unaryOperators = {
	    '+': function(v) { return +v; },
	    '-': function(v) { return -v; },
	    '!': function(v) { return !v; }
	  };
	
	  var binaryOperators = {
	    '+': function(l, r) { return l+r; },
	    '-': function(l, r) { return l-r; },
	    '*': function(l, r) { return l*r; },
	    '/': function(l, r) { return l/r; },
	    '%': function(l, r) { return l%r; },
	    '<': function(l, r) { return l<r; },
	    '>': function(l, r) { return l>r; },
	    '<=': function(l, r) { return l<=r; },
	    '>=': function(l, r) { return l>=r; },
	    '==': function(l, r) { return l==r; },
	    '!=': function(l, r) { return l!=r; },
	    '===': function(l, r) { return l===r; },
	    '!==': function(l, r) { return l!==r; },
	    '&&': function(l, r) { return l&&r; },
	    '||': function(l, r) { return l||r; },
	  };
	
	  function getFn(arg) {
	    return typeof arg == 'function' ? arg : arg.valueFn();
	  }
	
	  function ASTDelegate() {
	    this.expression = null;
	    this.filters = [];
	    this.deps = {};
	    this.currentPath = undefined;
	    this.scopeIdent = undefined;
	    this.indexIdent = undefined;
	    this.dynamicDeps = false;
	  }
	
	  ASTDelegate.prototype = {
	    createUnaryExpression: function(op, argument) {
	      if (!unaryOperators[op])
	        throw Error('Disallowed operator: ' + op);
	
	      argument = getFn(argument);
	
	      return function(model, observer, filterRegistry) {
	        return unaryOperators[op](argument(model, observer, filterRegistry));
	      };
	    },
	
	    createBinaryExpression: function(op, left, right) {
	      if (!binaryOperators[op])
	        throw Error('Disallowed operator: ' + op);
	
	      left = getFn(left);
	      right = getFn(right);
	
	      switch (op) {
	        case '||':
	          this.dynamicDeps = true;
	          return function(model, observer, filterRegistry) {
	            return left(model, observer, filterRegistry) ||
	                right(model, observer, filterRegistry);
	          };
	        case '&&':
	          this.dynamicDeps = true;
	          return function(model, observer, filterRegistry) {
	            return left(model, observer, filterRegistry) &&
	                right(model, observer, filterRegistry);
	          };
	      }
	
	      return function(model, observer, filterRegistry) {
	        return binaryOperators[op](left(model, observer, filterRegistry),
	                                   right(model, observer, filterRegistry));
	      };
	    },
	
	    createConditionalExpression: function(test, consequent, alternate) {
	      test = getFn(test);
	      consequent = getFn(consequent);
	      alternate = getFn(alternate);
	
	      this.dynamicDeps = true;
	
	      return function(model, observer, filterRegistry) {
	        return test(model, observer, filterRegistry) ?
	            consequent(model, observer, filterRegistry) :
	            alternate(model, observer, filterRegistry);
	      }
	    },
	
	    createIdentifier: function(name) {
	      var ident = new IdentPath(name);
	      ident.type = 'Identifier';
	      return ident;
	    },
	
	    createMemberExpression: function(accessor, object, property) {
	      var ex = new MemberExpression(object, property, accessor);
	      if (ex.dynamicDeps)
	        this.dynamicDeps = true;
	      return ex;
	    },
	
	    createCallExpression: function(expression, args) {
	      if (!(expression instanceof IdentPath))
	        throw Error('Only identifier function invocations are allowed');
	
	      var filter = new Filter(expression.name, args);
	
	      return function(model, observer, filterRegistry) {
	        return filter.transform(model, observer, filterRegistry, false);
	      };
	    },
	
	    createLiteral: function(token) {
	      return new Literal(token.value);
	    },
	
	    createArrayExpression: function(elements) {
	      for (var i = 0; i < elements.length; i++)
	        elements[i] = getFn(elements[i]);
	
	      return function(model, observer, filterRegistry) {
	        var arr = []
	        for (var i = 0; i < elements.length; i++)
	          arr.push(elements[i](model, observer, filterRegistry));
	        return arr;
	      }
	    },
	
	    createProperty: function(kind, key, value) {
	      return {
	        key: key instanceof IdentPath ? key.name : key.value,
	        value: value
	      };
	    },
	
	    createObjectExpression: function(properties) {
	      for (var i = 0; i < properties.length; i++)
	        properties[i].value = getFn(properties[i].value);
	
	      return function(model, observer, filterRegistry) {
	        var obj = {};
	        for (var i = 0; i < properties.length; i++)
	          obj[properties[i].key] =
	              properties[i].value(model, observer, filterRegistry);
	        return obj;
	      }
	    },
	
	    createFilter: function(name, args) {
	      this.filters.push(new Filter(name, args));
	    },
	
	    createAsExpression: function(expression, scopeIdent) {
	      this.expression = expression;
	      this.scopeIdent = scopeIdent;
	    },
	
	    createInExpression: function(scopeIdent, indexIdent, expression) {
	      this.expression = expression;
	      this.scopeIdent = scopeIdent;
	      this.indexIdent = indexIdent;
	    },
	
	    createTopLevel: function(expression) {
	      this.expression = expression;
	    },
	
	    createThisExpression: notImplemented
	  }
	
	  function ConstantObservable(value) {
	    this.value_ = value;
	  }
	
	  ConstantObservable.prototype = {
	    open: function() { return this.value_; },
	    discardChanges: function() { return this.value_; },
	    deliver: function() {},
	    close: function() {},
	  }
	
	  function Expression(delegate) {
	    this.scopeIdent = delegate.scopeIdent;
	    this.indexIdent = delegate.indexIdent;
	
	    if (!delegate.expression)
	      throw Error('No expression found.');
	
	    this.expression = delegate.expression;
	    getFn(this.expression); // forces enumeration of path dependencies
	
	    this.filters = delegate.filters;
	    this.dynamicDeps = delegate.dynamicDeps;
	  }
	
	  Expression.prototype = {
	    getBinding: function(model, filterRegistry, oneTime) {
	      if (oneTime)
	        return this.getValue(model, undefined, filterRegistry);
	
	      var observer = new CompoundObserver();
	      // captures deps.
	      var firstValue = this.getValue(model, observer, filterRegistry);
	      var firstTime = true;
	      var self = this;
	
	      function valueFn() {
	        // deps cannot have changed on first value retrieval.
	        if (firstTime) {
	          firstTime = false;
	          return firstValue;
	        }
	
	        if (self.dynamicDeps)
	          observer.startReset();
	
	        var value = self.getValue(model,
	                                  self.dynamicDeps ? observer : undefined,
	                                  filterRegistry);
	        if (self.dynamicDeps)
	          observer.finishReset();
	
	        return value;
	      }
	
	      function setValueFn(newValue) {
	        self.setValue(model, newValue, filterRegistry);
	        return newValue;
	      }
	
	      return new ObserverTransform(observer, valueFn, setValueFn, true);
	    },
	
	    getValue: function(model, observer, filterRegistry) {
	      var value = getFn(this.expression)(model, observer, filterRegistry);
	      for (var i = 0; i < this.filters.length; i++) {
	        value = this.filters[i].transform(model, observer, filterRegistry,
	            false, [value]);
	      }
	
	      return value;
	    },
	
	    setValue: function(model, newValue, filterRegistry) {
	      var count = this.filters ? this.filters.length : 0;
	      while (count-- > 0) {
	        newValue = this.filters[count].transform(model, undefined,
	            filterRegistry, true, [newValue]);
	      }
	
	      if (this.expression.setValue)
	        return this.expression.setValue(model, newValue);
	    }
	  }
	
	  /**
	   * Converts a style property name to a css property name. For example:
	   * "WebkitUserSelect" to "-webkit-user-select"
	   */
	  function convertStylePropertyName(name) {
	    return String(name).replace(/[A-Z]/g, function(c) {
	      return '-' + c.toLowerCase();
	    });
	  }
	
	  var parentScopeName = '@' + Math.random().toString(36).slice(2);
	
	  // Single ident paths must bind directly to the appropriate scope object.
	  // I.e. Pushed values in two-bindings need to be assigned to the actual model
	  // object.
	  function findScope(model, prop) {
	    while (model[parentScopeName] &&
	           !Object.prototype.hasOwnProperty.call(model, prop)) {
	      model = model[parentScopeName];
	    }
	
	    return model;
	  }
	
	  function isLiteralExpression(pathString) {
	    switch (pathString) {
	      case '':
	        return false;
	
	      case 'false':
	      case 'null':
	      case 'true':
	        return true;
	    }
	
	    if (!isNaN(Number(pathString)))
	      return true;
	
	    return false;
	  };
	
	  function PolymerExpressions() {}
	
	  PolymerExpressions.prototype = {
	    // "built-in" filters
	    styleObject: function(value) {
	      var parts = [];
	      for (var key in value) {
	        parts.push(convertStylePropertyName(key) + ': ' + value[key]);
	      }
	      return parts.join('; ');
	    },
	
	    tokenList: function(value) {
	      var tokens = [];
	      for (var key in value) {
	        if (value[key])
	          tokens.push(key);
	      }
	      return tokens.join(' ');
	    },
	
	    // binding delegate API
	    prepareInstancePositionChanged: function(template) {
	      var indexIdent = template.polymerExpressionIndexIdent_;
	      if (!indexIdent)
	        return;
	
	      return function(templateInstance, index) {
	        templateInstance.model[indexIdent] = index;
	      };
	    },
	
	    prepareBinding: function(pathString, name, node) {
	      var path = Path.get(pathString);
	
	      if (!isLiteralExpression(pathString) && path.valid) {
	        if (path.length == 1) {
	          return function(model, node, oneTime) {
	            if (oneTime)
	              return path.getValueFrom(model);
	
	            var scope = findScope(model, path[0]);
	            return new PathObserver(scope, path);
	          };
	        }
	        return; // bail out early if pathString is simple path.
	      }
	
	      return prepareBinding(pathString, name, node, this);
	    },
	
	    prepareInstanceModel: function(template) {
	      var scopeName = template.polymerExpressionScopeIdent_;
	      if (!scopeName)
	        return;
	
	      var parentScope = template.templateInstance ?
	          template.templateInstance.model :
	          template.model;
	
	      var indexName = template.polymerExpressionIndexIdent_;
	
	      return function(model) {
	        return createScopeObject(parentScope, model, scopeName, indexName);
	      };
	    }
	  };
	
	  var createScopeObject = ('__proto__' in {}) ?
	    function(parentScope, model, scopeName, indexName) {
	      var scope = {};
	      scope[scopeName] = model;
	      scope[indexName] = undefined;
	      scope[parentScopeName] = parentScope;
	      scope.__proto__ = parentScope;
	      return scope;
	    } :
	    function(parentScope, model, scopeName, indexName) {
	      var scope = Object.create(parentScope);
	      Object.defineProperty(scope, scopeName,
	          { value: model, configurable: true, writable: true });
	      Object.defineProperty(scope, indexName,
	          { value: undefined, configurable: true, writable: true });
	      Object.defineProperty(scope, parentScopeName,
	          { value: parentScope, configurable: true, writable: true });
	      return scope;
	    };
	
	  global.PolymerExpressions = PolymerExpressions;
	  PolymerExpressions.getExpression = getExpression;
	})(this);
	
	Polymer = {
	  version: '0.5.5'
	};
	
	// TODO(sorvell): this ensures Polymer is an object and not a function
	// Platform is currently defining it as a function to allow for async loading
	// of polymer; once we refine the loading process this likely goes away.
	if (typeof window.Polymer === 'function') {
	  Polymer = {};
	}
	
	
	(function(scope) {
	
	  function withDependencies(task, depends) {
	    depends = depends || [];
	    if (!depends.map) {
	      depends = [depends];
	    }
	    return task.apply(this, depends.map(marshal));
	  }
	
	  function module(name, dependsOrFactory, moduleFactory) {
	    var module;
	    switch (arguments.length) {
	      case 0:
	        return;
	      case 1:
	        module = null;
	        break;
	      case 2:
	        // dependsOrFactory is `factory` in this case
	        module = dependsOrFactory.apply(this);
	        break;
	      default:
	        // dependsOrFactory is `depends` in this case
	        module = withDependencies(moduleFactory, dependsOrFactory);
	        break;
	    }
	    modules[name] = module;
	  };
	
	  function marshal(name) {
	    return modules[name];
	  }
	
	  var modules = {};
	
	  function using(depends, task) {
	    HTMLImports.whenImportsReady(function() {
	      withDependencies(task, depends);
	    });
	  };
	
	  // exports
	
	  scope.marshal = marshal;
	  // `module` confuses commonjs detectors
	  scope.modularize = module;
	  scope.using = using;
	
	})(window);
	
	/*
		Build only script.
	
	  Ensures scripts needed for basic x-platform compatibility
	  will be run when platform.js is not loaded.
	 */
	if (!window.WebComponents) {
	
	/*
		On supported platforms, platform.js is not needed. To retain compatibility
		with the polyfills, we stub out minimal functionality.
	 */
	if (!window.WebComponents) {
	
	  WebComponents = {
	  	flush: function() {},
	    flags: {log: {}}
	  };
	
	  Platform = WebComponents;
	
	  CustomElements = {
	  	useNative: true,
	    ready: true,
	    takeRecords: function() {},
	    instanceof: function(obj, base) {
	      return obj instanceof base;
	    }
	  };
	
	  HTMLImports = {
	  	useNative: true
	  };
	
	
	  addEventListener('HTMLImportsLoaded', function() {
	    document.dispatchEvent(
	      new CustomEvent('WebComponentsReady', {bubbles: true})
	    );
	  });
	
	
	  // ShadowDOM
	  ShadowDOMPolyfill = null;
	  wrap = unwrap = function(n){
	    return n;
	  };
	
	}
	
	/*
	  Create polyfill scope and feature detect native support.
	*/
	window.HTMLImports = window.HTMLImports || {flags:{}};
	
	(function(scope) {
	
	/**
	  Basic setup and simple module executer. We collect modules and then execute
	  the code later, only if it's necessary for polyfilling.
	*/
	var IMPORT_LINK_TYPE = 'import';
	var useNative = Boolean(IMPORT_LINK_TYPE in document.createElement('link'));
	
	/**
	  Support `currentScript` on all browsers as `document._currentScript.`
	
	  NOTE: We cannot polyfill `document.currentScript` because it's not possible
	  both to override and maintain the ability to capture the native value.
	  Therefore we choose to expose `_currentScript` both when native imports
	  and the polyfill are in use.
	*/
	// NOTE: ShadowDOMPolyfill intrusion.
	var hasShadowDOMPolyfill = Boolean(window.ShadowDOMPolyfill);
	var wrap = function(node) {
	  return hasShadowDOMPolyfill ? ShadowDOMPolyfill.wrapIfNeeded(node) : node;
	};
	var rootDocument = wrap(document);
	
	var currentScriptDescriptor = {
	  get: function() {
	    var script = HTMLImports.currentScript || document.currentScript ||
	        // NOTE: only works when called in synchronously executing code.
	        // readyState should check if `loading` but IE10 is
	        // interactive when scripts run so we cheat.
	        (document.readyState !== 'complete' ?
	        document.scripts[document.scripts.length - 1] : null);
	    return wrap(script);
	  },
	  configurable: true
	};
	
	Object.defineProperty(document, '_currentScript', currentScriptDescriptor);
	Object.defineProperty(rootDocument, '_currentScript', currentScriptDescriptor);
	
	/**
	  Add support for the `HTMLImportsLoaded` event and the `HTMLImports.whenReady`
	  method. This api is necessary because unlike the native implementation,
	  script elements do not force imports to resolve. Instead, users should wrap
	  code in either an `HTMLImportsLoaded` hander or after load time in an
	  `HTMLImports.whenReady(callback)` call.
	
	  NOTE: This module also supports these apis under the native implementation.
	  Therefore, if this file is loaded, the same code can be used under both
	  the polyfill and native implementation.
	 */
	
	var isIE = /Trident/.test(navigator.userAgent);
	
	// call a callback when all HTMLImports in the document at call time
	// (or at least document ready) have loaded.
	// 1. ensure the document is in a ready state (has dom), then
	// 2. watch for loading of imports and call callback when done
	function whenReady(callback, doc) {
	  doc = doc || rootDocument;
	  // if document is loading, wait and try again
	  whenDocumentReady(function() {
	    watchImportsLoad(callback, doc);
	  }, doc);
	}
	
	// call the callback when the document is in a ready state (has dom)
	var requiredReadyState = isIE ? 'complete' : 'interactive';
	var READY_EVENT = 'readystatechange';
	function isDocumentReady(doc) {
	  return (doc.readyState === 'complete' ||
	      doc.readyState === requiredReadyState);
	}
	
	// call <callback> when we ensure the document is in a ready state
	function whenDocumentReady(callback, doc) {
	  if (!isDocumentReady(doc)) {
	    var checkReady = function() {
	      if (doc.readyState === 'complete' ||
	          doc.readyState === requiredReadyState) {
	        doc.removeEventListener(READY_EVENT, checkReady);
	        whenDocumentReady(callback, doc);
	      }
	    };
	    doc.addEventListener(READY_EVENT, checkReady);
	  } else if (callback) {
	    callback();
	  }
	}
	
	function markTargetLoaded(event) {
	  event.target.__loaded = true;
	}
	
	// call <callback> when we ensure all imports have loaded
	function watchImportsLoad(callback, doc) {
	  var imports = doc.querySelectorAll('link[rel=import]');
	  var loaded = 0, l = imports.length;
	  function checkDone(d) {
	    if ((loaded == l) && callback) {
	       callback();
	    }
	  }
	  function loadedImport(e) {
	    markTargetLoaded(e);
	    loaded++;
	    checkDone();
	  }
	  if (l) {
	    for (var i=0, imp; (i<l) && (imp=imports[i]); i++) {
	      if (isImportLoaded(imp)) {
	        loadedImport.call(imp, {target: imp});
	      } else {
	        imp.addEventListener('load', loadedImport);
	        imp.addEventListener('error', loadedImport);
	      }
	    }
	  } else {
	    checkDone();
	  }
	}
	
	// NOTE: test for native imports loading is based on explicitly watching
	// all imports (see below).
	// However, we cannot rely on this entirely without watching the entire document
	// for import links. For perf reasons, currently only head is watched.
	// Instead, we fallback to checking if the import property is available
	// and the document is not itself loading.
	function isImportLoaded(link) {
	  return useNative ? link.__loaded ||
	      (link.import && link.import.readyState !== 'loading') :
	      link.__importParsed;
	}
	
	// TODO(sorvell): Workaround for
	// https://www.w3.org/Bugs/Public/show_bug.cgi?id=25007, should be removed when
	// this bug is addressed.
	// (1) Install a mutation observer to see when HTMLImports have loaded
	// (2) if this script is run during document load it will watch any existing
	// imports for loading.
	//
	// NOTE: The workaround has restricted functionality: (1) it's only compatible
	// with imports that are added to document.head since the mutation observer
	// watches only head for perf reasons, (2) it requires this script
	// to run before any imports have completed loading.
	if (useNative) {
	  new MutationObserver(function(mxns) {
	    for (var i=0, l=mxns.length, m; (i < l) && (m=mxns[i]); i++) {
	      if (m.addedNodes) {
	        handleImports(m.addedNodes);
	      }
	    }
	  }).observe(document.head, {childList: true});
	
	  function handleImports(nodes) {
	    for (var i=0, l=nodes.length, n; (i<l) && (n=nodes[i]); i++) {
	      if (isImport(n)) {
	        handleImport(n);
	      }
	    }
	  }
	
	  function isImport(element) {
	    return element.localName === 'link' && element.rel === 'import';
	  }
	
	  function handleImport(element) {
	    var loaded = element.import;
	    if (loaded) {
	      markTargetLoaded({target: element});
	    } else {
	      element.addEventListener('load', markTargetLoaded);
	      element.addEventListener('error', markTargetLoaded);
	    }
	  }
	
	  // make sure to catch any imports that are in the process of loading
	  // when this script is run.
	  (function() {
	    if (document.readyState === 'loading') {
	      var imports = document.querySelectorAll('link[rel=import]');
	      for (var i=0, l=imports.length, imp; (i<l) && (imp=imports[i]); i++) {
	        handleImport(imp);
	      }
	    }
	  })();
	
	}
	
	// Fire the 'HTMLImportsLoaded' event when imports in document at load time
	// have loaded. This event is required to simulate the script blocking
	// behavior of native imports. A main document script that needs to be sure
	// imports have loaded should wait for this event.
	whenReady(function() {
	  HTMLImports.ready = true;
	  HTMLImports.readyTime = new Date().getTime();
	  rootDocument.dispatchEvent(
	    new CustomEvent('HTMLImportsLoaded', {bubbles: true})
	  );
	});
	
	// exports
	scope.IMPORT_LINK_TYPE = IMPORT_LINK_TYPE;
	scope.useNative = useNative;
	scope.rootDocument = rootDocument;
	scope.whenReady = whenReady;
	scope.isIE = isIE;
	
	})(HTMLImports);
	
	(function(scope) {
	
	  // TODO(sorvell): It's desireable to provide a default stylesheet
	  // that's convenient for styling unresolved elements, but
	  // it's cumbersome to have to include this manually in every page.
	  // It would make sense to put inside some HTMLImport but
	  // the HTMLImports polyfill does not allow loading of stylesheets
	  // that block rendering. Therefore this injection is tolerated here.
	  var style = document.createElement('style');
	  style.textContent = ''
	      + 'body {'
	      + 'transition: opacity ease-in 0.2s;'
	      + ' } \n'
	      + 'body[unresolved] {'
	      + 'opacity: 0; display: block; overflow: hidden;'
	      + ' } \n'
	      ;
	  var head = document.querySelector('head');
	  head.insertBefore(style, head.firstChild);
	
	})(Platform);
	
	/*
		Build only script.
	
	  Ensures scripts needed for basic x-platform compatibility
	  will be run when platform.js is not loaded.
	 */
	}
	(function(global) {
	  'use strict';
	
	  var testingExposeCycleCount = global.testingExposeCycleCount;
	
	  // Detect and do basic sanity checking on Object/Array.observe.
	  function detectObjectObserve() {
	    if (typeof Object.observe !== 'function' ||
	        typeof Array.observe !== 'function') {
	      return false;
	    }
	
	    var records = [];
	
	    function callback(recs) {
	      records = recs;
	    }
	
	    var test = {};
	    var arr = [];
	    Object.observe(test, callback);
	    Array.observe(arr, callback);
	    test.id = 1;
	    test.id = 2;
	    delete test.id;
	    arr.push(1, 2);
	    arr.length = 0;
	
	    Object.deliverChangeRecords(callback);
	    if (records.length !== 5)
	      return false;
	
	    if (records[0].type != 'add' ||
	        records[1].type != 'update' ||
	        records[2].type != 'delete' ||
	        records[3].type != 'splice' ||
	        records[4].type != 'splice') {
	      return false;
	    }
	
	    Object.unobserve(test, callback);
	    Array.unobserve(arr, callback);
	
	    return true;
	  }
	
	  var hasObserve = detectObjectObserve();
	
	  function detectEval() {
	    // Don't test for eval if we're running in a Chrome App environment.
	    // We check for APIs set that only exist in a Chrome App context.
	    if (typeof chrome !== 'undefined' && chrome.app && chrome.app.runtime) {
	      return false;
	    }
	
	    // Firefox OS Apps do not allow eval. This feature detection is very hacky
	    // but even if some other platform adds support for this function this code
	    // will continue to work.
	    if (typeof navigator != 'undefined' && navigator.getDeviceStorage) {
	      return false;
	    }
	
	    try {
	      var f = new Function('', 'return true;');
	      return f();
	    } catch (ex) {
	      return false;
	    }
	  }
	
	  var hasEval = detectEval();
	
	  function isIndex(s) {
	    return +s === s >>> 0 && s !== '';
	  }
	
	  function toNumber(s) {
	    return +s;
	  }
	
	  function isObject(obj) {
	    return obj === Object(obj);
	  }
	
	  var numberIsNaN = global.Number.isNaN || function(value) {
	    return typeof value === 'number' && global.isNaN(value);
	  }
	
	  function areSameValue(left, right) {
	    if (left === right)
	      return left !== 0 || 1 / left === 1 / right;
	    if (numberIsNaN(left) && numberIsNaN(right))
	      return true;
	
	    return left !== left && right !== right;
	  }
	
	  var createObject = ('__proto__' in {}) ?
	    function(obj) { return obj; } :
	    function(obj) {
	      var proto = obj.__proto__;
	      if (!proto)
	        return obj;
	      var newObject = Object.create(proto);
	      Object.getOwnPropertyNames(obj).forEach(function(name) {
	        Object.defineProperty(newObject, name,
	                             Object.getOwnPropertyDescriptor(obj, name));
	      });
	      return newObject;
	    };
	
	  var identStart = '[\$_a-zA-Z]';
	  var identPart = '[\$_a-zA-Z0-9]';
	  var identRegExp = new RegExp('^' + identStart + '+' + identPart + '*' + '$');
	
	  function getPathCharType(char) {
	    if (char === undefined)
	      return 'eof';
	
	    var code = char.charCodeAt(0);
	
	    switch(code) {
	      case 0x5B: // [
	      case 0x5D: // ]
	      case 0x2E: // .
	      case 0x22: // "
	      case 0x27: // '
	      case 0x30: // 0
	        return char;
	
	      case 0x5F: // _
	      case 0x24: // $
	        return 'ident';
	
	      case 0x20: // Space
	      case 0x09: // Tab
	      case 0x0A: // Newline
	      case 0x0D: // Return
	      case 0xA0:  // No-break space
	      case 0xFEFF:  // Byte Order Mark
	      case 0x2028:  // Line Separator
	      case 0x2029:  // Paragraph Separator
	        return 'ws';
	    }
	
	    // a-z, A-Z
	    if ((0x61 <= code && code <= 0x7A) || (0x41 <= code && code <= 0x5A))
	      return 'ident';
	
	    // 1-9
	    if (0x31 <= code && code <= 0x39)
	      return 'number';
	
	    return 'else';
	  }
	
	  var pathStateMachine = {
	    'beforePath': {
	      'ws': ['beforePath'],
	      'ident': ['inIdent', 'append'],
	      '[': ['beforeElement'],
	      'eof': ['afterPath']
	    },
	
	    'inPath': {
	      'ws': ['inPath'],
	      '.': ['beforeIdent'],
	      '[': ['beforeElement'],
	      'eof': ['afterPath']
	    },
	
	    'beforeIdent': {
	      'ws': ['beforeIdent'],
	      'ident': ['inIdent', 'append']
	    },
	
	    'inIdent': {
	      'ident': ['inIdent', 'append'],
	      '0': ['inIdent', 'append'],
	      'number': ['inIdent', 'append'],
	      'ws': ['inPath', 'push'],
	      '.': ['beforeIdent', 'push'],
	      '[': ['beforeElement', 'push'],
	      'eof': ['afterPath', 'push']
	    },
	
	    'beforeElement': {
	      'ws': ['beforeElement'],
	      '0': ['afterZero', 'append'],
	      'number': ['inIndex', 'append'],
	      "'": ['inSingleQuote', 'append', ''],
	      '"': ['inDoubleQuote', 'append', '']
	    },
	
	    'afterZero': {
	      'ws': ['afterElement', 'push'],
	      ']': ['inPath', 'push']
	    },
	
	    'inIndex': {
	      '0': ['inIndex', 'append'],
	      'number': ['inIndex', 'append'],
	      'ws': ['afterElement'],
	      ']': ['inPath', 'push']
	    },
	
	    'inSingleQuote': {
	      "'": ['afterElement'],
	      'eof': ['error'],
	      'else': ['inSingleQuote', 'append']
	    },
	
	    'inDoubleQuote': {
	      '"': ['afterElement'],
	      'eof': ['error'],
	      'else': ['inDoubleQuote', 'append']
	    },
	
	    'afterElement': {
	      'ws': ['afterElement'],
	      ']': ['inPath', 'push']
	    }
	  }
	
	  function noop() {}
	
	  function parsePath(path) {
	    var keys = [];
	    var index = -1;
	    var c, newChar, key, type, transition, action, typeMap, mode = 'beforePath';
	
	    var actions = {
	      push: function() {
	        if (key === undefined)
	          return;
	
	        keys.push(key);
	        key = undefined;
	      },
	
	      append: function() {
	        if (key === undefined)
	          key = newChar
	        else
	          key += newChar;
	      }
	    };
	
	    function maybeUnescapeQuote() {
	      if (index >= path.length)
	        return;
	
	      var nextChar = path[index + 1];
	      if ((mode == 'inSingleQuote' && nextChar == "'") ||
	          (mode == 'inDoubleQuote' && nextChar == '"')) {
	        index++;
	        newChar = nextChar;
	        actions.append();
	        return true;
	      }
	    }
	
	    while (mode) {
	      index++;
	      c = path[index];
	
	      if (c == '\\' && maybeUnescapeQuote(mode))
	        continue;
	
	      type = getPathCharType(c);
	      typeMap = pathStateMachine[mode];
	      transition = typeMap[type] || typeMap['else'] || 'error';
	
	      if (transition == 'error')
	        return; // parse error;
	
	      mode = transition[0];
	      action = actions[transition[1]] || noop;
	      newChar = transition[2] === undefined ? c : transition[2];
	      action();
	
	      if (mode === 'afterPath') {
	        return keys;
	      }
	    }
	
	    return; // parse error
	  }
	
	  function isIdent(s) {
	    return identRegExp.test(s);
	  }
	
	  var constructorIsPrivate = {};
	
	  function Path(parts, privateToken) {
	    if (privateToken !== constructorIsPrivate)
	      throw Error('Use Path.get to retrieve path objects');
	
	    for (var i = 0; i < parts.length; i++) {
	      this.push(String(parts[i]));
	    }
	
	    if (hasEval && this.length) {
	      this.getValueFrom = this.compiledGetValueFromFn();
	    }
	  }
	
	  // TODO(rafaelw): Make simple LRU cache
	  var pathCache = {};
	
	  function getPath(pathString) {
	    if (pathString instanceof Path)
	      return pathString;
	
	    if (pathString == null || pathString.length == 0)
	      pathString = '';
	
	    if (typeof pathString != 'string') {
	      if (isIndex(pathString.length)) {
	        // Constructed with array-like (pre-parsed) keys
	        return new Path(pathString, constructorIsPrivate);
	      }
	
	      pathString = String(pathString);
	    }
	
	    var path = pathCache[pathString];
	    if (path)
	      return path;
	
	    var parts = parsePath(pathString);
	    if (!parts)
	      return invalidPath;
	
	    var path = new Path(parts, constructorIsPrivate);
	    pathCache[pathString] = path;
	    return path;
	  }
	
	  Path.get = getPath;
	
	  function formatAccessor(key) {
	    if (isIndex(key)) {
	      return '[' + key + ']';
	    } else {
	      return '["' + key.replace(/"/g, '\\"') + '"]';
	    }
	  }
	
	  Path.prototype = createObject({
	    __proto__: [],
	    valid: true,
	
	    toString: function() {
	      var pathString = '';
	      for (var i = 0; i < this.length; i++) {
	        var key = this[i];
	        if (isIdent(key)) {
	          pathString += i ? '.' + key : key;
	        } else {
	          pathString += formatAccessor(key);
	        }
	      }
	
	      return pathString;
	    },
	
	    getValueFrom: function(obj, directObserver) {
	      for (var i = 0; i < this.length; i++) {
	        if (obj == null)
	          return;
	        obj = obj[this[i]];
	      }
	      return obj;
	    },
	
	    iterateObjects: function(obj, observe) {
	      for (var i = 0; i < this.length; i++) {
	        if (i)
	          obj = obj[this[i - 1]];
	        if (!isObject(obj))
	          return;
	        observe(obj, this[i]);
	      }
	    },
	
	    compiledGetValueFromFn: function() {
	      var str = '';
	      var pathString = 'obj';
	      str += 'if (obj != null';
	      var i = 0;
	      var key;
	      for (; i < (this.length - 1); i++) {
	        key = this[i];
	        pathString += isIdent(key) ? '.' + key : formatAccessor(key);
	        str += ' &&\n     ' + pathString + ' != null';
	      }
	      str += ')\n';
	
	      var key = this[i];
	      pathString += isIdent(key) ? '.' + key : formatAccessor(key);
	
	      str += '  return ' + pathString + ';\nelse\n  return undefined;';
	      return new Function('obj', str);
	    },
	
	    setValueFrom: function(obj, value) {
	      if (!this.length)
	        return false;
	
	      for (var i = 0; i < this.length - 1; i++) {
	        if (!isObject(obj))
	          return false;
	        obj = obj[this[i]];
	      }
	
	      if (!isObject(obj))
	        return false;
	
	      obj[this[i]] = value;
	      return true;
	    }
	  });
	
	  var invalidPath = new Path('', constructorIsPrivate);
	  invalidPath.valid = false;
	  invalidPath.getValueFrom = invalidPath.setValueFrom = function() {};
	
	  var MAX_DIRTY_CHECK_CYCLES = 1000;
	
	  function dirtyCheck(observer) {
	    var cycles = 0;
	    while (cycles < MAX_DIRTY_CHECK_CYCLES && observer.check_()) {
	      cycles++;
	    }
	    if (testingExposeCycleCount)
	      global.dirtyCheckCycleCount = cycles;
	
	    return cycles > 0;
	  }
	
	  function objectIsEmpty(object) {
	    for (var prop in object)
	      return false;
	    return true;
	  }
	
	  function diffIsEmpty(diff) {
	    return objectIsEmpty(diff.added) &&
	           objectIsEmpty(diff.removed) &&
	           objectIsEmpty(diff.changed);
	  }
	
	  function diffObjectFromOldObject(object, oldObject) {
	    var added = {};
	    var removed = {};
	    var changed = {};
	
	    for (var prop in oldObject) {
	      var newValue = object[prop];
	
	      if (newValue !== undefined && newValue === oldObject[prop])
	        continue;
	
	      if (!(prop in object)) {
	        removed[prop] = undefined;
	        continue;
	      }
	
	      if (newValue !== oldObject[prop])
	        changed[prop] = newValue;
	    }
	
	    for (var prop in object) {
	      if (prop in oldObject)
	        continue;
	
	      added[prop] = object[prop];
	    }
	
	    if (Array.isArray(object) && object.length !== oldObject.length)
	      changed.length = object.length;
	
	    return {
	      added: added,
	      removed: removed,
	      changed: changed
	    };
	  }
	
	  var eomTasks = [];
	  function runEOMTasks() {
	    if (!eomTasks.length)
	      return false;
	
	    for (var i = 0; i < eomTasks.length; i++) {
	      eomTasks[i]();
	    }
	    eomTasks.length = 0;
	    return true;
	  }
	
	  var runEOM = hasObserve ? (function(){
	    return function(fn) {
	      return Promise.resolve().then(fn);
	    }
	  })() :
	  (function() {
	    return function(fn) {
	      eomTasks.push(fn);
	    };
	  })();
	
	  var observedObjectCache = [];
	
	  function newObservedObject() {
	    var observer;
	    var object;
	    var discardRecords = false;
	    var first = true;
	
	    function callback(records) {
	      if (observer && observer.state_ === OPENED && !discardRecords)
	        observer.check_(records);
	    }
	
	    return {
	      open: function(obs) {
	        if (observer)
	          throw Error('ObservedObject in use');
	
	        if (!first)
	          Object.deliverChangeRecords(callback);
	
	        observer = obs;
	        first = false;
	      },
	      observe: function(obj, arrayObserve) {
	        object = obj;
	        if (arrayObserve)
	          Array.observe(object, callback);
	        else
	          Object.observe(object, callback);
	      },
	      deliver: function(discard) {
	        discardRecords = discard;
	        Object.deliverChangeRecords(callback);
	        discardRecords = false;
	      },
	      close: function() {
	        observer = undefined;
	        Object.unobserve(object, callback);
	        observedObjectCache.push(this);
	      }
	    };
	  }
	
	  /*
	   * The observedSet abstraction is a perf optimization which reduces the total
	   * number of Object.observe observations of a set of objects. The idea is that
	   * groups of Observers will have some object dependencies in common and this
	   * observed set ensures that each object in the transitive closure of
	   * dependencies is only observed once. The observedSet acts as a write barrier
	   * such that whenever any change comes through, all Observers are checked for
	   * changed values.
	   *
	   * Note that this optimization is explicitly moving work from setup-time to
	   * change-time.
	   *
	   * TODO(rafaelw): Implement "garbage collection". In order to move work off
	   * the critical path, when Observers are closed, their observed objects are
	   * not Object.unobserve(d). As a result, it's possible that if the observedSet
	   * is kept open, but some Observers have been closed, it could cause "leaks"
	   * (prevent otherwise collectable objects from being collected). At some
	   * point, we should implement incremental "gc" which keeps a list of
	   * observedSets which may need clean-up and does small amounts of cleanup on a
	   * timeout until all is clean.
	   */
	
	  function getObservedObject(observer, object, arrayObserve) {
	    var dir = observedObjectCache.pop() || newObservedObject();
	    dir.open(observer);
	    dir.observe(object, arrayObserve);
	    return dir;
	  }
	
	  var observedSetCache = [];
	
	  function newObservedSet() {
	    var observerCount = 0;
	    var observers = [];
	    var objects = [];
	    var rootObj;
	    var rootObjProps;
	
	    function observe(obj, prop) {
	      if (!obj)
	        return;
	
	      if (obj === rootObj)
	        rootObjProps[prop] = true;
	
	      if (objects.indexOf(obj) < 0) {
	        objects.push(obj);
	        Object.observe(obj, callback);
	      }
	
	      observe(Object.getPrototypeOf(obj), prop);
	    }
	
	    function allRootObjNonObservedProps(recs) {
	      for (var i = 0; i < recs.length; i++) {
	        var rec = recs[i];
	        if (rec.object !== rootObj ||
	            rootObjProps[rec.name] ||
	            rec.type === 'setPrototype') {
	          return false;
	        }
	      }
	      return true;
	    }
	
	    function callback(recs) {
	      if (allRootObjNonObservedProps(recs))
	        return;
	
	      var observer;
	      for (var i = 0; i < observers.length; i++) {
	        observer = observers[i];
	        if (observer.state_ == OPENED) {
	          observer.iterateObjects_(observe);
	        }
	      }
	
	      for (var i = 0; i < observers.length; i++) {
	        observer = observers[i];
	        if (observer.state_ == OPENED) {
	          observer.check_();
	        }
	      }
	    }
	
	    var record = {
	      objects: objects,
	      get rootObject() { return rootObj; },
	      set rootObject(value) {
	        rootObj = value;
	        rootObjProps = {};
	      },
	      open: function(obs, object) {
	        observers.push(obs);
	        observerCount++;
	        obs.iterateObjects_(observe);
	      },
	      close: function(obs) {
	        observerCount--;
	        if (observerCount > 0) {
	          return;
	        }
	
	        for (var i = 0; i < objects.length; i++) {
	          Object.unobserve(objects[i], callback);
	          Observer.unobservedCount++;
	        }
	
	        observers.length = 0;
	        objects.length = 0;
	        rootObj = undefined;
	        rootObjProps = undefined;
	        observedSetCache.push(this);
	        if (lastObservedSet === this)
	          lastObservedSet = null;
	      },
	    };
	
	    return record;
	  }
	
	  var lastObservedSet;
	
	  function getObservedSet(observer, obj) {
	    if (!lastObservedSet || lastObservedSet.rootObject !== obj) {
	      lastObservedSet = observedSetCache.pop() || newObservedSet();
	      lastObservedSet.rootObject = obj;
	    }
	    lastObservedSet.open(observer, obj);
	    return lastObservedSet;
	  }
	
	  var UNOPENED = 0;
	  var OPENED = 1;
	  var CLOSED = 2;
	  var RESETTING = 3;
	
	  var nextObserverId = 1;
	
	  function Observer() {
	    this.state_ = UNOPENED;
	    this.callback_ = undefined;
	    this.target_ = undefined; // TODO(rafaelw): Should be WeakRef
	    this.directObserver_ = undefined;
	    this.value_ = undefined;
	    this.id_ = nextObserverId++;
	  }
	
	  Observer.prototype = {
	    open: function(callback, target) {
	      if (this.state_ != UNOPENED)
	        throw Error('Observer has already been opened.');
	
	      addToAll(this);
	      this.callback_ = callback;
	      this.target_ = target;
	      this.connect_();
	      this.state_ = OPENED;
	      return this.value_;
	    },
	
	    close: function() {
	      if (this.state_ != OPENED)
	        return;
	
	      removeFromAll(this);
	      this.disconnect_();
	      this.value_ = undefined;
	      this.callback_ = undefined;
	      this.target_ = undefined;
	      this.state_ = CLOSED;
	    },
	
	    deliver: function() {
	      if (this.state_ != OPENED)
	        return;
	
	      dirtyCheck(this);
	    },
	
	    report_: function(changes) {
	      try {
	        this.callback_.apply(this.target_, changes);
	      } catch (ex) {
	        Observer._errorThrownDuringCallback = true;
	        console.error('Exception caught during observer callback: ' +
	                       (ex.stack || ex));
	      }
	    },
	
	    discardChanges: function() {
	      this.check_(undefined, true);
	      return this.value_;
	    }
	  }
	
	  var collectObservers = !hasObserve;
	  var allObservers;
	  Observer._allObserversCount = 0;
	
	  if (collectObservers) {
	    allObservers = [];
	  }
	
	  function addToAll(observer) {
	    Observer._allObserversCount++;
	    if (!collectObservers)
	      return;
	
	    allObservers.push(observer);
	  }
	
	  function removeFromAll(observer) {
	    Observer._allObserversCount--;
	  }
	
	  var runningMicrotaskCheckpoint = false;
	
	  global.Platform = global.Platform || {};
	
	  global.Platform.performMicrotaskCheckpoint = function() {
	    if (runningMicrotaskCheckpoint)
	      return;
	
	    if (!collectObservers)
	      return;
	
	    runningMicrotaskCheckpoint = true;
	
	    var cycles = 0;
	    var anyChanged, toCheck;
	
	    do {
	      cycles++;
	      toCheck = allObservers;
	      allObservers = [];
	      anyChanged = false;
	
	      for (var i = 0; i < toCheck.length; i++) {
	        var observer = toCheck[i];
	        if (observer.state_ != OPENED)
	          continue;
	
	        if (observer.check_())
	          anyChanged = true;
	
	        allObservers.push(observer);
	      }
	      if (runEOMTasks())
	        anyChanged = true;
	    } while (cycles < MAX_DIRTY_CHECK_CYCLES && anyChanged);
	
	    if (testingExposeCycleCount)
	      global.dirtyCheckCycleCount = cycles;
	
	    runningMicrotaskCheckpoint = false;
	  };
	
	  if (collectObservers) {
	    global.Platform.clearObservers = function() {
	      allObservers = [];
	    };
	  }
	
	  function ObjectObserver(object) {
	    Observer.call(this);
	    this.value_ = object;
	    this.oldObject_ = undefined;
	  }
	
	  ObjectObserver.prototype = createObject({
	    __proto__: Observer.prototype,
	
	    arrayObserve: false,
	
	    connect_: function(callback, target) {
	      if (hasObserve) {
	        this.directObserver_ = getObservedObject(this, this.value_,
	                                                 this.arrayObserve);
	      } else {
	        this.oldObject_ = this.copyObject(this.value_);
	      }
	
	    },
	
	    copyObject: function(object) {
	      var copy = Array.isArray(object) ? [] : {};
	      for (var prop in object) {
	        copy[prop] = object[prop];
	      };
	      if (Array.isArray(object))
	        copy.length = object.length;
	      return copy;
	    },
	
	    check_: function(changeRecords, skipChanges) {
	      var diff;
	      var oldValues;
	      if (hasObserve) {
	        if (!changeRecords)
	          return false;
	
	        oldValues = {};
	        diff = diffObjectFromChangeRecords(this.value_, changeRecords,
	                                           oldValues);
	      } else {
	        oldValues = this.oldObject_;
	        diff = diffObjectFromOldObject(this.value_, this.oldObject_);
	      }
	
	      if (diffIsEmpty(diff))
	        return false;
	
	      if (!hasObserve)
	        this.oldObject_ = this.copyObject(this.value_);
	
	      this.report_([
	        diff.added || {},
	        diff.removed || {},
	        diff.changed || {},
	        function(property) {
	          return oldValues[property];
	        }
	      ]);
	
	      return true;
	    },
	
	    disconnect_: function() {
	      if (hasObserve) {
	        this.directObserver_.close();
	        this.directObserver_ = undefined;
	      } else {
	        this.oldObject_ = undefined;
	      }
	    },
	
	    deliver: function() {
	      if (this.state_ != OPENED)
	        return;
	
	      if (hasObserve)
	        this.directObserver_.deliver(false);
	      else
	        dirtyCheck(this);
	    },
	
	    discardChanges: function() {
	      if (this.directObserver_)
	        this.directObserver_.deliver(true);
	      else
	        this.oldObject_ = this.copyObject(this.value_);
	
	      return this.value_;
	    }
	  });
	
	  function ArrayObserver(array) {
	    if (!Array.isArray(array))
	      throw Error('Provided object is not an Array');
	    ObjectObserver.call(this, array);
	  }
	
	  ArrayObserver.prototype = createObject({
	
	    __proto__: ObjectObserver.prototype,
	
	    arrayObserve: true,
	
	    copyObject: function(arr) {
	      return arr.slice();
	    },
	
	    check_: function(changeRecords) {
	      var splices;
	      if (hasObserve) {
	        if (!changeRecords)
	          return false;
	        splices = projectArraySplices(this.value_, changeRecords);
	      } else {
	        splices = calcSplices(this.value_, 0, this.value_.length,
	                              this.oldObject_, 0, this.oldObject_.length);
	      }
	
	      if (!splices || !splices.length)
	        return false;
	
	      if (!hasObserve)
	        this.oldObject_ = this.copyObject(this.value_);
	
	      this.report_([splices]);
	      return true;
	    }
	  });
	
	  ArrayObserver.applySplices = function(previous, current, splices) {
	    splices.forEach(function(splice) {
	      var spliceArgs = [splice.index, splice.removed.length];
	      var addIndex = splice.index;
	      while (addIndex < splice.index + splice.addedCount) {
	        spliceArgs.push(current[addIndex]);
	        addIndex++;
	      }
	
	      Array.prototype.splice.apply(previous, spliceArgs);
	    });
	  };
	
	  function PathObserver(object, path) {
	    Observer.call(this);
	
	    this.object_ = object;
	    this.path_ = getPath(path);
	    this.directObserver_ = undefined;
	  }
	
	  PathObserver.prototype = createObject({
	    __proto__: Observer.prototype,
	
	    get path() {
	      return this.path_;
	    },
	
	    connect_: function() {
	      if (hasObserve)
	        this.directObserver_ = getObservedSet(this, this.object_);
	
	      this.check_(undefined, true);
	    },
	
	    disconnect_: function() {
	      this.value_ = undefined;
	
	      if (this.directObserver_) {
	        this.directObserver_.close(this);
	        this.directObserver_ = undefined;
	      }
	    },
	
	    iterateObjects_: function(observe) {
	      this.path_.iterateObjects(this.object_, observe);
	    },
	
	    check_: function(changeRecords, skipChanges) {
	      var oldValue = this.value_;
	      this.value_ = this.path_.getValueFrom(this.object_);
	      if (skipChanges || areSameValue(this.value_, oldValue))
	        return false;
	
	      this.report_([this.value_, oldValue, this]);
	      return true;
	    },
	
	    setValue: function(newValue) {
	      if (this.path_)
	        this.path_.setValueFrom(this.object_, newValue);
	    }
	  });
	
	  function CompoundObserver(reportChangesOnOpen) {
	    Observer.call(this);
	
	    this.reportChangesOnOpen_ = reportChangesOnOpen;
	    this.value_ = [];
	    this.directObserver_ = undefined;
	    this.observed_ = [];
	  }
	
	  var observerSentinel = {};
	
	  CompoundObserver.prototype = createObject({
	    __proto__: Observer.prototype,
	
	    connect_: function() {
	      if (hasObserve) {
	        var object;
	        var needsDirectObserver = false;
	        for (var i = 0; i < this.observed_.length; i += 2) {
	          object = this.observed_[i]
	          if (object !== observerSentinel) {
	            needsDirectObserver = true;
	            break;
	          }
	        }
	
	        if (needsDirectObserver)
	          this.directObserver_ = getObservedSet(this, object);
	      }
	
	      this.check_(undefined, !this.reportChangesOnOpen_);
	    },
	
	    disconnect_: function() {
	      for (var i = 0; i < this.observed_.length; i += 2) {
	        if (this.observed_[i] === observerSentinel)
	          this.observed_[i + 1].close();
	      }
	      this.observed_.length = 0;
	      this.value_.length = 0;
	
	      if (this.directObserver_) {
	        this.directObserver_.close(this);
	        this.directObserver_ = undefined;
	      }
	    },
	
	    addPath: function(object, path) {
	      if (this.state_ != UNOPENED && this.state_ != RESETTING)
	        throw Error('Cannot add paths once started.');
	
	      var path = getPath(path);
	      this.observed_.push(object, path);
	      if (!this.reportChangesOnOpen_)
	        return;
	      var index = this.observed_.length / 2 - 1;
	      this.value_[index] = path.getValueFrom(object);
	    },
	
	    addObserver: function(observer) {
	      if (this.state_ != UNOPENED && this.state_ != RESETTING)
	        throw Error('Cannot add observers once started.');
	
	      this.observed_.push(observerSentinel, observer);
	      if (!this.reportChangesOnOpen_)
	        return;
	      var index = this.observed_.length / 2 - 1;
	      this.value_[index] = observer.open(this.deliver, this);
	    },
	
	    startReset: function() {
	      if (this.state_ != OPENED)
	        throw Error('Can only reset while open');
	
	      this.state_ = RESETTING;
	      this.disconnect_();
	    },
	
	    finishReset: function() {
	      if (this.state_ != RESETTING)
	        throw Error('Can only finishReset after startReset');
	      this.state_ = OPENED;
	      this.connect_();
	
	      return this.value_;
	    },
	
	    iterateObjects_: function(observe) {
	      var object;
	      for (var i = 0; i < this.observed_.length; i += 2) {
	        object = this.observed_[i]
	        if (object !== observerSentinel)
	          this.observed_[i + 1].iterateObjects(object, observe)
	      }
	    },
	
	    check_: function(changeRecords, skipChanges) {
	      var oldValues;
	      for (var i = 0; i < this.observed_.length; i += 2) {
	        var object = this.observed_[i];
	        var path = this.observed_[i+1];
	        var value;
	        if (object === observerSentinel) {
	          var observable = path;
	          value = this.state_ === UNOPENED ?
	              observable.open(this.deliver, this) :
	              observable.discardChanges();
	        } else {
	          value = path.getValueFrom(object);
	        }
	
	        if (skipChanges) {
	          this.value_[i / 2] = value;
	          continue;
	        }
	
	        if (areSameValue(value, this.value_[i / 2]))
	          continue;
	
	        oldValues = oldValues || [];
	        oldValues[i / 2] = this.value_[i / 2];
	        this.value_[i / 2] = value;
	      }
	
	      if (!oldValues)
	        return false;
	
	      // TODO(rafaelw): Having observed_ as the third callback arg here is
	      // pretty lame API. Fix.
	      this.report_([this.value_, oldValues, this.observed_]);
	      return true;
	    }
	  });
	
	  function identFn(value) { return value; }
	
	  function ObserverTransform(observable, getValueFn, setValueFn,
	                             dontPassThroughSet) {
	    this.callback_ = undefined;
	    this.target_ = undefined;
	    this.value_ = undefined;
	    this.observable_ = observable;
	    this.getValueFn_ = getValueFn || identFn;
	    this.setValueFn_ = setValueFn || identFn;
	    // TODO(rafaelw): This is a temporary hack. PolymerExpressions needs this
	    // at the moment because of a bug in it's dependency tracking.
	    this.dontPassThroughSet_ = dontPassThroughSet;
	  }
	
	  ObserverTransform.prototype = {
	    open: function(callback, target) {
	      this.callback_ = callback;
	      this.target_ = target;
	      this.value_ =
	          this.getValueFn_(this.observable_.open(this.observedCallback_, this));
	      return this.value_;
	    },
	
	    observedCallback_: function(value) {
	      value = this.getValueFn_(value);
	      if (areSameValue(value, this.value_))
	        return;
	      var oldValue = this.value_;
	      this.value_ = value;
	      this.callback_.call(this.target_, this.value_, oldValue);
	    },
	
	    discardChanges: function() {
	      this.value_ = this.getValueFn_(this.observable_.discardChanges());
	      return this.value_;
	    },
	
	    deliver: function() {
	      return this.observable_.deliver();
	    },
	
	    setValue: function(value) {
	      value = this.setValueFn_(value);
	      if (!this.dontPassThroughSet_ && this.observable_.setValue)
	        return this.observable_.setValue(value);
	    },
	
	    close: function() {
	      if (this.observable_)
	        this.observable_.close();
	      this.callback_ = undefined;
	      this.target_ = undefined;
	      this.observable_ = undefined;
	      this.value_ = undefined;
	      this.getValueFn_ = undefined;
	      this.setValueFn_ = undefined;
	    }
	  }
	
	  var expectedRecordTypes = {
	    add: true,
	    update: true,
	    delete: true
	  };
	
	  function diffObjectFromChangeRecords(object, changeRecords, oldValues) {
	    var added = {};
	    var removed = {};
	
	    for (var i = 0; i < changeRecords.length; i++) {
	      var record = changeRecords[i];
	      if (!expectedRecordTypes[record.type]) {
	        console.error('Unknown changeRecord type: ' + record.type);
	        console.error(record);
	        continue;
	      }
	
	      if (!(record.name in oldValues))
	        oldValues[record.name] = record.oldValue;
	
	      if (record.type == 'update')
	        continue;
	
	      if (record.type == 'add') {
	        if (record.name in removed)
	          delete removed[record.name];
	        else
	          added[record.name] = true;
	
	        continue;
	      }
	
	      // type = 'delete'
	      if (record.name in added) {
	        delete added[record.name];
	        delete oldValues[record.name];
	      } else {
	        removed[record.name] = true;
	      }
	    }
	
	    for (var prop in added)
	      added[prop] = object[prop];
	
	    for (var prop in removed)
	      removed[prop] = undefined;
	
	    var changed = {};
	    for (var prop in oldValues) {
	      if (prop in added || prop in removed)
	        continue;
	
	      var newValue = object[prop];
	      if (oldValues[prop] !== newValue)
	        changed[prop] = newValue;
	    }
	
	    return {
	      added: added,
	      removed: removed,
	      changed: changed
	    };
	  }
	
	  function newSplice(index, removed, addedCount) {
	    return {
	      index: index,
	      removed: removed,
	      addedCount: addedCount
	    };
	  }
	
	  var EDIT_LEAVE = 0;
	  var EDIT_UPDATE = 1;
	  var EDIT_ADD = 2;
	  var EDIT_DELETE = 3;
	
	  function ArraySplice() {}
	
	  ArraySplice.prototype = {
	
	    // Note: This function is *based* on the computation of the Levenshtein
	    // "edit" distance. The one change is that "updates" are treated as two
	    // edits - not one. With Array splices, an update is really a delete
	    // followed by an add. By retaining this, we optimize for "keeping" the
	    // maximum array items in the original array. For example:
	    //
	    //   'xxxx123' -> '123yyyy'
	    //
	    // With 1-edit updates, the shortest path would be just to update all seven
	    // characters. With 2-edit updates, we delete 4, leave 3, and add 4. This
	    // leaves the substring '123' intact.
	    calcEditDistances: function(current, currentStart, currentEnd,
	                                old, oldStart, oldEnd) {
	      // "Deletion" columns
	      var rowCount = oldEnd - oldStart + 1;
	      var columnCount = currentEnd - currentStart + 1;
	      var distances = new Array(rowCount);
	
	      // "Addition" rows. Initialize null column.
	      for (var i = 0; i < rowCount; i++) {
	        distances[i] = new Array(columnCount);
	        distances[i][0] = i;
	      }
	
	      // Initialize null row
	      for (var j = 0; j < columnCount; j++)
	        distances[0][j] = j;
	
	      for (var i = 1; i < rowCount; i++) {
	        for (var j = 1; j < columnCount; j++) {
	          if (this.equals(current[currentStart + j - 1], old[oldStart + i - 1]))
	            distances[i][j] = distances[i - 1][j - 1];
	          else {
	            var north = distances[i - 1][j] + 1;
	            var west = distances[i][j - 1] + 1;
	            distances[i][j] = north < west ? north : west;
	          }
	        }
	      }
	
	      return distances;
	    },
	
	    // This starts at the final weight, and walks "backward" by finding
	    // the minimum previous weight recursively until the origin of the weight
	    // matrix.
	    spliceOperationsFromEditDistances: function(distances) {
	      var i = distances.length - 1;
	      var j = distances[0].length - 1;
	      var current = distances[i][j];
	      var edits = [];
	      while (i > 0 || j > 0) {
	        if (i == 0) {
	          edits.push(EDIT_ADD);
	          j--;
	          continue;
	        }
	        if (j == 0) {
	          edits.push(EDIT_DELETE);
	          i--;
	          continue;
	        }
	        var northWest = distances[i - 1][j - 1];
	        var west = distances[i - 1][j];
	        var north = distances[i][j - 1];
	
	        var min;
	        if (west < north)
	          min = west < northWest ? west : northWest;
	        else
	          min = north < northWest ? north : northWest;
	
	        if (min == northWest) {
	          if (northWest == current) {
	            edits.push(EDIT_LEAVE);
	          } else {
	            edits.push(EDIT_UPDATE);
	            current = northWest;
	          }
	          i--;
	          j--;
	        } else if (min == west) {
	          edits.push(EDIT_DELETE);
	          i--;
	          current = west;
	        } else {
	          edits.push(EDIT_ADD);
	          j--;
	          current = north;
	        }
	      }
	
	      edits.reverse();
	      return edits;
	    },
	
	    /**
	     * Splice Projection functions:
	     *
	     * A splice map is a representation of how a previous array of items
	     * was transformed into a new array of items. Conceptually it is a list of
	     * tuples of
	     *
	     *   <index, removed, addedCount>
	     *
	     * which are kept in ascending index order of. The tuple represents that at
	     * the |index|, |removed| sequence of items were removed, and counting forward
	     * from |index|, |addedCount| items were added.
	     */
	
	    /**
	     * Lacking individual splice mutation information, the minimal set of
	     * splices can be synthesized given the previous state and final state of an
	     * array. The basic approach is to calculate the edit distance matrix and
	     * choose the shortest path through it.
	     *
	     * Complexity: O(l * p)
	     *   l: The length of the current array
	     *   p: The length of the old array
	     */
	    calcSplices: function(current, currentStart, currentEnd,
	                          old, oldStart, oldEnd) {
	      var prefixCount = 0;
	      var suffixCount = 0;
	
	      var minLength = Math.min(currentEnd - currentStart, oldEnd - oldStart);
	      if (currentStart == 0 && oldStart == 0)
	        prefixCount = this.sharedPrefix(current, old, minLength);
	
	      if (currentEnd == current.length && oldEnd == old.length)
	        suffixCount = this.sharedSuffix(current, old, minLength - prefixCount);
	
	      currentStart += prefixCount;
	      oldStart += prefixCount;
	      currentEnd -= suffixCount;
	      oldEnd -= suffixCount;
	
	      if (currentEnd - currentStart == 0 && oldEnd - oldStart == 0)
	        return [];
	
	      if (currentStart == currentEnd) {
	        var splice = newSplice(currentStart, [], 0);
	        while (oldStart < oldEnd)
	          splice.removed.push(old[oldStart++]);
	
	        return [ splice ];
	      } else if (oldStart == oldEnd)
	        return [ newSplice(currentStart, [], currentEnd - currentStart) ];
	
	      var ops = this.spliceOperationsFromEditDistances(
	          this.calcEditDistances(current, currentStart, currentEnd,
	                                 old, oldStart, oldEnd));
	
	      var splice = undefined;
	      var splices = [];
	      var index = currentStart;
	      var oldIndex = oldStart;
	      for (var i = 0; i < ops.length; i++) {
	        switch(ops[i]) {
	          case EDIT_LEAVE:
	            if (splice) {
	              splices.push(splice);
	              splice = undefined;
	            }
	
	            index++;
	            oldIndex++;
	            break;
	          case EDIT_UPDATE:
	            if (!splice)
	              splice = newSplice(index, [], 0);
	
	            splice.addedCount++;
	            index++;
	
	            splice.removed.push(old[oldIndex]);
	            oldIndex++;
	            break;
	          case EDIT_ADD:
	            if (!splice)
	              splice = newSplice(index, [], 0);
	
	            splice.addedCount++;
	            index++;
	            break;
	          case EDIT_DELETE:
	            if (!splice)
	              splice = newSplice(index, [], 0);
	
	            splice.removed.push(old[oldIndex]);
	            oldIndex++;
	            break;
	        }
	      }
	
	      if (splice) {
	        splices.push(splice);
	      }
	      return splices;
	    },
	
	    sharedPrefix: function(current, old, searchLength) {
	      for (var i = 0; i < searchLength; i++)
	        if (!this.equals(current[i], old[i]))
	          return i;
	      return searchLength;
	    },
	
	    sharedSuffix: function(current, old, searchLength) {
	      var index1 = current.length;
	      var index2 = old.length;
	      var count = 0;
	      while (count < searchLength && this.equals(current[--index1], old[--index2]))
	        count++;
	
	      return count;
	    },
	
	    calculateSplices: function(current, previous) {
	      return this.calcSplices(current, 0, current.length, previous, 0,
	                              previous.length);
	    },
	
	    equals: function(currentValue, previousValue) {
	      return currentValue === previousValue;
	    }
	  };
	
	  var arraySplice = new ArraySplice();
	
	  function calcSplices(current, currentStart, currentEnd,
	                       old, oldStart, oldEnd) {
	    return arraySplice.calcSplices(current, currentStart, currentEnd,
	                                   old, oldStart, oldEnd);
	  }
	
	  function intersect(start1, end1, start2, end2) {
	    // Disjoint
	    if (end1 < start2 || end2 < start1)
	      return -1;
	
	    // Adjacent
	    if (end1 == start2 || end2 == start1)
	      return 0;
	
	    // Non-zero intersect, span1 first
	    if (start1 < start2) {
	      if (end1 < end2)
	        return end1 - start2; // Overlap
	      else
	        return end2 - start2; // Contained
	    } else {
	      // Non-zero intersect, span2 first
	      if (end2 < end1)
	        return end2 - start1; // Overlap
	      else
	        return end1 - start1; // Contained
	    }
	  }
	
	  function mergeSplice(splices, index, removed, addedCount) {
	
	    var splice = newSplice(index, removed, addedCount);
	
	    var inserted = false;
	    var insertionOffset = 0;
	
	    for (var i = 0; i < splices.length; i++) {
	      var current = splices[i];
	      current.index += insertionOffset;
	
	      if (inserted)
	        continue;
	
	      var intersectCount = intersect(splice.index,
	                                     splice.index + splice.removed.length,
	                                     current.index,
	                                     current.index + current.addedCount);
	
	      if (intersectCount >= 0) {
	        // Merge the two splices
	
	        splices.splice(i, 1);
	        i--;
	
	        insertionOffset -= current.addedCount - current.removed.length;
	
	        splice.addedCount += current.addedCount - intersectCount;
	        var deleteCount = splice.removed.length +
	                          current.removed.length - intersectCount;
	
	        if (!splice.addedCount && !deleteCount) {
	          // merged splice is a noop. discard.
	          inserted = true;
	        } else {
	          var removed = current.removed;
	
	          if (splice.index < current.index) {
	            // some prefix of splice.removed is prepended to current.removed.
	            var prepend = splice.removed.slice(0, current.index - splice.index);
	            Array.prototype.push.apply(prepend, removed);
	            removed = prepend;
	          }
	
	          if (splice.index + splice.removed.length > current.index + current.addedCount) {
	            // some suffix of splice.removed is appended to current.removed.
	            var append = splice.removed.slice(current.index + current.addedCount - splice.index);
	            Array.prototype.push.apply(removed, append);
	          }
	
	          splice.removed = removed;
	          if (current.index < splice.index) {
	            splice.index = current.index;
	          }
	        }
	      } else if (splice.index < current.index) {
	        // Insert splice here.
	
	        inserted = true;
	
	        splices.splice(i, 0, splice);
	        i++;
	
	        var offset = splice.addedCount - splice.removed.length
	        current.index += offset;
	        insertionOffset += offset;
	      }
	    }
	
	    if (!inserted)
	      splices.push(splice);
	  }
	
	  function createInitialSplices(array, changeRecords) {
	    var splices = [];
	
	    for (var i = 0; i < changeRecords.length; i++) {
	      var record = changeRecords[i];
	      switch(record.type) {
	        case 'splice':
	          mergeSplice(splices, record.index, record.removed.slice(), record.addedCount);
	          break;
	        case 'add':
	        case 'update':
	        case 'delete':
	          if (!isIndex(record.name))
	            continue;
	          var index = toNumber(record.name);
	          if (index < 0)
	            continue;
	          mergeSplice(splices, index, [record.oldValue], 1);
	          break;
	        default:
	          console.error('Unexpected record type: ' + JSON.stringify(record));
	          break;
	      }
	    }
	
	    return splices;
	  }
	
	  function projectArraySplices(array, changeRecords) {
	    var splices = [];
	
	    createInitialSplices(array, changeRecords).forEach(function(splice) {
	      if (splice.addedCount == 1 && splice.removed.length == 1) {
	        if (splice.removed[0] !== array[splice.index])
	          splices.push(splice);
	
	        return
	      };
	
	      splices = splices.concat(calcSplices(array, splice.index, splice.index + splice.addedCount,
	                                           splice.removed, 0, splice.removed.length));
	    });
	
	    return splices;
	  }
	
	  // Export the observe-js object for **Node.js**, with backwards-compatibility
	  // for the old `require()` API. Also ensure `exports` is not a DOM Element.
	  // If we're in the browser, export as a global object.
	
	  var expose = global;
	
	  if (typeof exports !== 'undefined' && !exports.nodeType) {
	    if (typeof module !== 'undefined' && module.exports) {
	      exports = module.exports;
	    }
	    expose = exports;
	  }
	
	  expose.Observer = Observer;
	  expose.Observer.runEOM_ = runEOM;
	  expose.Observer.observerSentinel_ = observerSentinel; // for testing.
	  expose.Observer.hasObjectObserve = hasObserve;
	  expose.ArrayObserver = ArrayObserver;
	  expose.ArrayObserver.calculateSplices = function(current, previous) {
	    return arraySplice.calculateSplices(current, previous);
	  };
	
	  expose.ArraySplice = ArraySplice;
	  expose.ObjectObserver = ObjectObserver;
	  expose.PathObserver = PathObserver;
	  expose.CompoundObserver = CompoundObserver;
	  expose.Path = Path;
	  expose.ObserverTransform = ObserverTransform;
	
	})(typeof global !== 'undefined' && global && typeof module !== 'undefined' && module ? global : this || window);
	
	// Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
	// This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
	// The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
	// The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
	// Code distributed by Google as part of the polymer project is also
	// subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
	
	(function(global) {
	  'use strict';
	
	  var filter = Array.prototype.filter.call.bind(Array.prototype.filter);
	
	  function getTreeScope(node) {
	    while (node.parentNode) {
	      node = node.parentNode;
	    }
	
	    return typeof node.getElementById === 'function' ? node : null;
	  }
	
	  Node.prototype.bind = function(name, observable) {
	    console.error('Unhandled binding to Node: ', this, name, observable);
	  };
	
	  Node.prototype.bindFinished = function() {};
	
	  function updateBindings(node, name, binding) {
	    var bindings = node.bindings_;
	    if (!bindings)
	      bindings = node.bindings_ = {};
	
	    if (bindings[name])
	      binding[name].close();
	
	    return bindings[name] = binding;
	  }
	
	  function returnBinding(node, name, binding) {
	    return binding;
	  }
	
	  function sanitizeValue(value) {
	    return value == null ? '' : value;
	  }
	
	  function updateText(node, value) {
	    node.data = sanitizeValue(value);
	  }
	
	  function textBinding(node) {
	    return function(value) {
	      return updateText(node, value);
	    };
	  }
	
	  var maybeUpdateBindings = returnBinding;
	
	  Object.defineProperty(Platform, 'enableBindingsReflection', {
	    get: function() {
	      return maybeUpdateBindings === updateBindings;
	    },
	    set: function(enable) {
	      maybeUpdateBindings = enable ? updateBindings : returnBinding;
	      return enable;
	    },
	    configurable: true
	  });
	
	  Text.prototype.bind = function(name, value, oneTime) {
	    if (name !== 'textContent')
	      return Node.prototype.bind.call(this, name, value, oneTime);
	
	    if (oneTime)
	      return updateText(this, value);
	
	    var observable = value;
	    updateText(this, observable.open(textBinding(this)));
	    return maybeUpdateBindings(this, name, observable);
	  }
	
	  function updateAttribute(el, name, conditional, value) {
	    if (conditional) {
	      if (value)
	        el.setAttribute(name, '');
	      else
	        el.removeAttribute(name);
	      return;
	    }
	
	    el.setAttribute(name, sanitizeValue(value));
	  }
	
	  function attributeBinding(el, name, conditional) {
	    return function(value) {
	      updateAttribute(el, name, conditional, value);
	    };
	  }
	
	  Element.prototype.bind = function(name, value, oneTime) {
	    var conditional = name[name.length - 1] == '?';
	    if (conditional) {
	      this.removeAttribute(name);
	      name = name.slice(0, -1);
	    }
	
	    if (oneTime)
	      return updateAttribute(this, name, conditional, value);
	
	
	    var observable = value;
	    updateAttribute(this, name, conditional,
	        observable.open(attributeBinding(this, name, conditional)));
	
	    return maybeUpdateBindings(this, name, observable);
	  };
	
	  var checkboxEventType;
	  (function() {
	    // Attempt to feature-detect which event (change or click) is fired first
	    // for checkboxes.
	    var div = document.createElement('div');
	    var checkbox = div.appendChild(document.createElement('input'));
	    checkbox.setAttribute('type', 'checkbox');
	    var first;
	    var count = 0;
	    checkbox.addEventListener('click', function(e) {
	      count++;
	      first = first || 'click';
	    });
	    checkbox.addEventListener('change', function() {
	      count++;
	      first = first || 'change';
	    });
	
	    var event = document.createEvent('MouseEvent');
	    event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false,
	        false, false, false, 0, null);
	    checkbox.dispatchEvent(event);
	    // WebKit/Blink don't fire the change event if the element is outside the
	    // document, so assume 'change' for that case.
	    checkboxEventType = count == 1 ? 'change' : first;
	  })();
	
	  function getEventForInputType(element) {
	    switch (element.type) {
	      case 'checkbox':
	        return checkboxEventType;
	      case 'radio':
	      case 'select-multiple':
	      case 'select-one':
	        return 'change';
	      case 'range':
	        if (/Trident|MSIE/.test(navigator.userAgent))
	          return 'change';
	      default:
	        return 'input';
	    }
	  }
	
	  function updateInput(input, property, value, santizeFn) {
	    input[property] = (santizeFn || sanitizeValue)(value);
	  }
	
	  function inputBinding(input, property, santizeFn) {
	    return function(value) {
	      return updateInput(input, property, value, santizeFn);
	    }
	  }
	
	  function noop() {}
	
	  function bindInputEvent(input, property, observable, postEventFn) {
	    var eventType = getEventForInputType(input);
	
	    function eventHandler() {
	      var isNum = property == 'value' && input.type == 'number';
	      observable.setValue(isNum ? input.valueAsNumber : input[property]);
	      observable.discardChanges();
	      (postEventFn || noop)(input);
	      Platform.performMicrotaskCheckpoint();
	    }
	    input.addEventListener(eventType, eventHandler);
	
	    return {
	      close: function() {
	        input.removeEventListener(eventType, eventHandler);
	        observable.close();
	      },
	
	      observable_: observable
	    }
	  }
	
	  function booleanSanitize(value) {
	    return Boolean(value);
	  }
	
	  // |element| is assumed to be an HTMLInputElement with |type| == 'radio'.
	  // Returns an array containing all radio buttons other than |element| that
	  // have the same |name|, either in the form that |element| belongs to or,
	  // if no form, in the document tree to which |element| belongs.
	  //
	  // This implementation is based upon the HTML spec definition of a
	  // "radio button group":
	  //   http://www.whatwg.org/specs/web-apps/current-work/multipage/number-state.html#radio-button-group
	  //
	  function getAssociatedRadioButtons(element) {
	    if (element.form) {
	      return filter(element.form.elements, function(el) {
	        return el != element &&
	            el.tagName == 'INPUT' &&
	            el.type == 'radio' &&
	            el.name == element.name;
	      });
	    } else {
	      var treeScope = getTreeScope(element);
	      if (!treeScope)
	        return [];
	      var radios = treeScope.querySelectorAll(
	          'input[type="radio"][name="' + element.name + '"]');
	      return filter(radios, function(el) {
	        return el != element && !el.form;
	      });
	    }
	  }
	
	  function checkedPostEvent(input) {
	    // Only the radio button that is getting checked gets an event. We
	    // therefore find all the associated radio buttons and update their
	    // check binding manually.
	    if (input.tagName === 'INPUT' &&
	        input.type === 'radio') {
	      getAssociatedRadioButtons(input).forEach(function(radio) {
	        var checkedBinding = radio.bindings_.checked;
	        if (checkedBinding) {
	          // Set the value directly to avoid an infinite call stack.
	          checkedBinding.observable_.setValue(false);
	        }
	      });
	    }
	  }
	
	  HTMLInputElement.prototype.bind = function(name, value, oneTime) {
	    if (name !== 'value' && name !== 'checked')
	      return HTMLElement.prototype.bind.call(this, name, value, oneTime);
	
	    this.removeAttribute(name);
	    var sanitizeFn = name == 'checked' ? booleanSanitize : sanitizeValue;
	    var postEventFn = name == 'checked' ? checkedPostEvent : noop;
	
	    if (oneTime)
	      return updateInput(this, name, value, sanitizeFn);
	
	
	    var observable = value;
	    var binding = bindInputEvent(this, name, observable, postEventFn);
	    updateInput(this, name,
	                observable.open(inputBinding(this, name, sanitizeFn)),
	                sanitizeFn);
	
	    // Checkboxes may need to update bindings of other checkboxes.
	    return updateBindings(this, name, binding);
	  }
	
	  HTMLTextAreaElement.prototype.bind = function(name, value, oneTime) {
	    if (name !== 'value')
	      return HTMLElement.prototype.bind.call(this, name, value, oneTime);
	
	    this.removeAttribute('value');
	
	    if (oneTime)
	      return updateInput(this, 'value', value);
	
	    var observable = value;
	    var binding = bindInputEvent(this, 'value', observable);
	    updateInput(this, 'value',
	                observable.open(inputBinding(this, 'value', sanitizeValue)));
	    return maybeUpdateBindings(this, name, binding);
	  }
	
	  function updateOption(option, value) {
	    var parentNode = option.parentNode;;
	    var select;
	    var selectBinding;
	    var oldValue;
	    if (parentNode instanceof HTMLSelectElement &&
	        parentNode.bindings_ &&
	        parentNode.bindings_.value) {
	      select = parentNode;
	      selectBinding = select.bindings_.value;
	      oldValue = select.value;
	    }
	
	    option.value = sanitizeValue(value);
	
	    if (select && select.value != oldValue) {
	      selectBinding.observable_.setValue(select.value);
	      selectBinding.observable_.discardChanges();
	      Platform.performMicrotaskCheckpoint();
	    }
	  }
	
	  function optionBinding(option) {
	    return function(value) {
	      updateOption(option, value);
	    }
	  }
	
	  HTMLOptionElement.prototype.bind = function(name, value, oneTime) {
	    if (name !== 'value')
	      return HTMLElement.prototype.bind.call(this, name, value, oneTime);
	
	    this.removeAttribute('value');
	
	    if (oneTime)
	      return updateOption(this, value);
	
	    var observable = value;
	    var binding = bindInputEvent(this, 'value', observable);
	    updateOption(this, observable.open(optionBinding(this)));
	    return maybeUpdateBindings(this, name, binding);
	  }
	
	  HTMLSelectElement.prototype.bind = function(name, value, oneTime) {
	    if (name === 'selectedindex')
	      name = 'selectedIndex';
	
	    if (name !== 'selectedIndex' && name !== 'value')
	      return HTMLElement.prototype.bind.call(this, name, value, oneTime);
	
	    this.removeAttribute(name);
	
	    if (oneTime)
	      return updateInput(this, name, value);
	
	    var observable = value;
	    var binding = bindInputEvent(this, name, observable);
	    updateInput(this, name,
	                observable.open(inputBinding(this, name)));
	
	    // Option update events may need to access select bindings.
	    return updateBindings(this, name, binding);
	  }
	})(this);
	
	// Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
	// This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
	// The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
	// The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
	// Code distributed by Google as part of the polymer project is also
	// subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
	
	(function(global) {
	  'use strict';
	
	  function assert(v) {
	    if (!v)
	      throw new Error('Assertion failed');
	  }
	
	  var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);
	
	  function getFragmentRoot(node) {
	    var p;
	    while (p = node.parentNode) {
	      node = p;
	    }
	
	    return node;
	  }
	
	  function searchRefId(node, id) {
	    if (!id)
	      return;
	
	    var ref;
	    var selector = '#' + id;
	    while (!ref) {
	      node = getFragmentRoot(node);
	
	      if (node.protoContent_)
	        ref = node.protoContent_.querySelector(selector);
	      else if (node.getElementById)
	        ref = node.getElementById(id);
	
	      if (ref || !node.templateCreator_)
	        break
	
	      node = node.templateCreator_;
	    }
	
	    return ref;
	  }
	
	  function getInstanceRoot(node) {
	    while (node.parentNode) {
	      node = node.parentNode;
	    }
	    return node.templateCreator_ ? node : null;
	  }
	
	  var Map;
	  if (global.Map && typeof global.Map.prototype.forEach === 'function') {
	    Map = global.Map;
	  } else {
	    Map = function() {
	      this.keys = [];
	      this.values = [];
	    };
	
	    Map.prototype = {
	      set: function(key, value) {
	        var index = this.keys.indexOf(key);
	        if (index < 0) {
	          this.keys.push(key);
	          this.values.push(value);
	        } else {
	          this.values[index] = value;
	        }
	      },
	
	      get: function(key) {
	        var index = this.keys.indexOf(key);
	        if (index < 0)
	          return;
	
	        return this.values[index];
	      },
	
	      delete: function(key, value) {
	        var index = this.keys.indexOf(key);
	        if (index < 0)
	          return false;
	
	        this.keys.splice(index, 1);
	        this.values.splice(index, 1);
	        return true;
	      },
	
	      forEach: function(f, opt_this) {
	        for (var i = 0; i < this.keys.length; i++)
	          f.call(opt_this || this, this.values[i], this.keys[i], this);
	      }
	    };
	  }
	
	  // JScript does not have __proto__. We wrap all object literals with
	  // createObject which uses Object.create, Object.defineProperty and
	  // Object.getOwnPropertyDescriptor to create a new object that does the exact
	  // same thing. The main downside to this solution is that we have to extract
	  // all those property descriptors for IE.
	  var createObject = ('__proto__' in {}) ?
	      function(obj) { return obj; } :
	      function(obj) {
	        var proto = obj.__proto__;
	        if (!proto)
	          return obj;
	        var newObject = Object.create(proto);
	        Object.getOwnPropertyNames(obj).forEach(function(name) {
	          Object.defineProperty(newObject, name,
	                               Object.getOwnPropertyDescriptor(obj, name));
	        });
	        return newObject;
	      };
	
	  // IE does not support have Document.prototype.contains.
	  if (typeof document.contains != 'function') {
	    Document.prototype.contains = function(node) {
	      if (node === this || node.parentNode === this)
	        return true;
	      return this.documentElement.contains(node);
	    }
	  }
	
	  var BIND = 'bind';
	  var REPEAT = 'repeat';
	  var IF = 'if';
	
	  var templateAttributeDirectives = {
	    'template': true,
	    'repeat': true,
	    'bind': true,
	    'ref': true,
	    'if': true
	  };
	
	  var semanticTemplateElements = {
	    'THEAD': true,
	    'TBODY': true,
	    'TFOOT': true,
	    'TH': true,
	    'TR': true,
	    'TD': true,
	    'COLGROUP': true,
	    'COL': true,
	    'CAPTION': true,
	    'OPTION': true,
	    'OPTGROUP': true
	  };
	
	  var hasTemplateElement = typeof HTMLTemplateElement !== 'undefined';
	  if (hasTemplateElement) {
	    // TODO(rafaelw): Remove when fix for
	    // https://codereview.chromium.org/164803002/
	    // makes it to Chrome release.
	    (function() {
	      var t = document.createElement('template');
	      var d = t.content.ownerDocument;
	      var html = d.appendChild(d.createElement('html'));
	      var head = html.appendChild(d.createElement('head'));
	      var base = d.createElement('base');
	      base.href = document.baseURI;
	      head.appendChild(base);
	    })();
	  }
	
	  var allTemplatesSelectors = 'template, ' +
	      Object.keys(semanticTemplateElements).map(function(tagName) {
	        return tagName.toLowerCase() + '[template]';
	      }).join(', ');
	
	  function isSVGTemplate(el) {
	    return el.tagName == 'template' &&
	           el.namespaceURI == 'http://www.w3.org/2000/svg';
	  }
	
	  function isHTMLTemplate(el) {
	    return el.tagName == 'TEMPLATE' &&
	           el.namespaceURI == 'http://www.w3.org/1999/xhtml';
	  }
	
	  function isAttributeTemplate(el) {
	    return Boolean(semanticTemplateElements[el.tagName] &&
	                   el.hasAttribute('template'));
	  }
	
	  function isTemplate(el) {
	    if (el.isTemplate_ === undefined)
	      el.isTemplate_ = el.tagName == 'TEMPLATE' || isAttributeTemplate(el);
	
	    return el.isTemplate_;
	  }
	
	  // FIXME: Observe templates being added/removed from documents
	  // FIXME: Expose imperative API to decorate and observe templates in
	  // "disconnected tress" (e.g. ShadowRoot)
	  document.addEventListener('DOMContentLoaded', function(e) {
	    bootstrapTemplatesRecursivelyFrom(document);
	    // FIXME: Is this needed? Seems like it shouldn't be.
	    Platform.performMicrotaskCheckpoint();
	  }, false);
	
	  function forAllTemplatesFrom(node, fn) {
	    var subTemplates = node.querySelectorAll(allTemplatesSelectors);
	
	    if (isTemplate(node))
	      fn(node)
	    forEach(subTemplates, fn);
	  }
	
	  function bootstrapTemplatesRecursivelyFrom(node) {
	    function bootstrap(template) {
	      if (!HTMLTemplateElement.decorate(template))
	        bootstrapTemplatesRecursivelyFrom(template.content);
	    }
	
	    forAllTemplatesFrom(node, bootstrap);
	  }
	
	  if (!hasTemplateElement) {
	    /**
	     * This represents a <template> element.
	     * @constructor
	     * @extends {HTMLElement}
	     */
	    global.HTMLTemplateElement = function() {
	      throw TypeError('Illegal constructor');
	    };
	  }
	
	  var hasProto = '__proto__' in {};
	
	  function mixin(to, from) {
	    Object.getOwnPropertyNames(from).forEach(function(name) {
	      Object.defineProperty(to, name,
	                            Object.getOwnPropertyDescriptor(from, name));
	    });
	  }
	
	  // http://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/templates/index.html#dfn-template-contents-owner
	  function getOrCreateTemplateContentsOwner(template) {
	    var doc = template.ownerDocument
	    if (!doc.defaultView)
	      return doc;
	    var d = doc.templateContentsOwner_;
	    if (!d) {
	      // TODO(arv): This should either be a Document or HTMLDocument depending
	      // on doc.
	      d = doc.implementation.createHTMLDocument('');
	      while (d.lastChild) {
	        d.removeChild(d.lastChild);
	      }
	      doc.templateContentsOwner_ = d;
	    }
	    return d;
	  }
	
	  function getTemplateStagingDocument(template) {
	    if (!template.stagingDocument_) {
	      var owner = template.ownerDocument;
	      if (!owner.stagingDocument_) {
	        owner.stagingDocument_ = owner.implementation.createHTMLDocument('');
	        owner.stagingDocument_.isStagingDocument = true;
	        // TODO(rafaelw): Remove when fix for
	        // https://codereview.chromium.org/164803002/
	        // makes it to Chrome release.
	        var base = owner.stagingDocument_.createElement('base');
	        base.href = document.baseURI;
	        owner.stagingDocument_.head.appendChild(base);
	
	        owner.stagingDocument_.stagingDocument_ = owner.stagingDocument_;
	      }
	
	      template.stagingDocument_ = owner.stagingDocument_;
	    }
	
	    return template.stagingDocument_;
	  }
	
	  // For non-template browsers, the parser will disallow <template> in certain
	  // locations, so we allow "attribute templates" which combine the template
	  // element with the top-level container node of the content, e.g.
	  //
	  //   <tr template repeat="{{ foo }}"" class="bar"><td>Bar</td></tr>
	  //
	  // becomes
	  //
	  //   <template repeat="{{ foo }}">
	  //   + #document-fragment
	  //     + <tr class="bar">
	  //       + <td>Bar</td>
	  //
	  function extractTemplateFromAttributeTemplate(el) {
	    var template = el.ownerDocument.createElement('template');
	    el.parentNode.insertBefore(template, el);
	
	    var attribs = el.attributes;
	    var count = attribs.length;
	    while (count-- > 0) {
	      var attrib = attribs[count];
	      if (templateAttributeDirectives[attrib.name]) {
	        if (attrib.name !== 'template')
	          template.setAttribute(attrib.name, attrib.value);
	        el.removeAttribute(attrib.name);
	      }
	    }
	
	    return template;
	  }
	
	  function extractTemplateFromSVGTemplate(el) {
	    var template = el.ownerDocument.createElement('template');
	    el.parentNode.insertBefore(template, el);
	
	    var attribs = el.attributes;
	    var count = attribs.length;
	    while (count-- > 0) {
	      var attrib = attribs[count];
	      template.setAttribute(attrib.name, attrib.value);
	      el.removeAttribute(attrib.name);
	    }
	
	    el.parentNode.removeChild(el);
	    return template;
	  }
	
	  function liftNonNativeTemplateChildrenIntoContent(template, el, useRoot) {
	    var content = template.content;
	    if (useRoot) {
	      content.appendChild(el);
	      return;
	    }
	
	    var child;
	    while (child = el.firstChild) {
	      content.appendChild(child);
	    }
	  }
	
	  var templateObserver;
	  if (typeof MutationObserver == 'function') {
	    templateObserver = new MutationObserver(function(records) {
	      for (var i = 0; i < records.length; i++) {
	        records[i].target.refChanged_();
	      }
	    });
	  }
	
	  /**
	   * Ensures proper API and content model for template elements.
	   * @param {HTMLTemplateElement} opt_instanceRef The template element which
	   *     |el| template element will return as the value of its ref(), and whose
	   *     content will be used as source when createInstance() is invoked.
	   */
	  HTMLTemplateElement.decorate = function(el, opt_instanceRef) {
	    if (el.templateIsDecorated_)
	      return false;
	
	    var templateElement = el;
	    templateElement.templateIsDecorated_ = true;
	
	    var isNativeHTMLTemplate = isHTMLTemplate(templateElement) &&
	                               hasTemplateElement;
	    var bootstrapContents = isNativeHTMLTemplate;
	    var liftContents = !isNativeHTMLTemplate;
	    var liftRoot = false;
	
	    if (!isNativeHTMLTemplate) {
	      if (isAttributeTemplate(templateElement)) {
	        assert(!opt_instanceRef);
	        templateElement = extractTemplateFromAttributeTemplate(el);
	        templateElement.templateIsDecorated_ = true;
	        isNativeHTMLTemplate = hasTemplateElement;
	        liftRoot = true;
	      } else if (isSVGTemplate(templateElement)) {
	        templateElement = extractTemplateFromSVGTemplate(el);
	        templateElement.templateIsDecorated_ = true;
	        isNativeHTMLTemplate = hasTemplateElement;
	      }
	    }
	
	    if (!isNativeHTMLTemplate) {
	      fixTemplateElementPrototype(templateElement);
	      var doc = getOrCreateTemplateContentsOwner(templateElement);
	      templateElement.content_ = doc.createDocumentFragment();
	    }
	
	    if (opt_instanceRef) {
	      // template is contained within an instance, its direct content must be
	      // empty
	      templateElement.instanceRef_ = opt_instanceRef;
	    } else if (liftContents) {
	      liftNonNativeTemplateChildrenIntoContent(templateElement,
	                                               el,
	                                               liftRoot);
	    } else if (bootstrapContents) {
	      bootstrapTemplatesRecursivelyFrom(templateElement.content);
	    }
	
	    return true;
	  };
	
	  // TODO(rafaelw): This used to decorate recursively all templates from a given
	  // node. This happens by default on 'DOMContentLoaded', but may be needed
	  // in subtrees not descendent from document (e.g. ShadowRoot).
	  // Review whether this is the right public API.
	  HTMLTemplateElement.bootstrap = bootstrapTemplatesRecursivelyFrom;
	
	  var htmlElement = global.HTMLUnknownElement || HTMLElement;
	
	  var contentDescriptor = {
	    get: function() {
	      return this.content_;
	    },
	    enumerable: true,
	    configurable: true
	  };
	
	  if (!hasTemplateElement) {
	    // Gecko is more picky with the prototype than WebKit. Make sure to use the
	    // same prototype as created in the constructor.
	    HTMLTemplateElement.prototype = Object.create(htmlElement.prototype);
	
	    Object.defineProperty(HTMLTemplateElement.prototype, 'content',
	                          contentDescriptor);
	  }
	
	  function fixTemplateElementPrototype(el) {
	    if (hasProto)
	      el.__proto__ = HTMLTemplateElement.prototype;
	    else
	      mixin(el, HTMLTemplateElement.prototype);
	  }
	
	  function ensureSetModelScheduled(template) {
	    if (!template.setModelFn_) {
	      template.setModelFn_ = function() {
	        template.setModelFnScheduled_ = false;
	        var map = getBindings(template,
	            template.delegate_ && template.delegate_.prepareBinding);
	        processBindings(template, map, template.model_);
	      };
	    }
	
	    if (!template.setModelFnScheduled_) {
	      template.setModelFnScheduled_ = true;
	      Observer.runEOM_(template.setModelFn_);
	    }
	  }
	
	  mixin(HTMLTemplateElement.prototype, {
	    bind: function(name, value, oneTime) {
	      if (name != 'ref')
	        return Element.prototype.bind.call(this, name, value, oneTime);
	
	      var self = this;
	      var ref = oneTime ? value : value.open(function(ref) {
	        self.setAttribute('ref', ref);
	        self.refChanged_();
	      });
	
	      this.setAttribute('ref', ref);
	      this.refChanged_();
	      if (oneTime)
	        return;
	
	      if (!this.bindings_) {
	        this.bindings_ = { ref: value };
	      } else {
	        this.bindings_.ref = value;
	      }
	
	      return value;
	    },
	
	    processBindingDirectives_: function(directives) {
	      if (this.iterator_)
	        this.iterator_.closeDeps();
	
	      if (!directives.if && !directives.bind && !directives.repeat) {
	        if (this.iterator_) {
	          this.iterator_.close();
	          this.iterator_ = undefined;
	        }
	
	        return;
	      }
	
	      if (!this.iterator_) {
	        this.iterator_ = new TemplateIterator(this);
	      }
	
	      this.iterator_.updateDependencies(directives, this.model_);
	
	      if (templateObserver) {
	        templateObserver.observe(this, { attributes: true,
	                                         attributeFilter: ['ref'] });
	      }
	
	      return this.iterator_;
	    },
	
	    createInstance: function(model, bindingDelegate, delegate_) {
	      if (bindingDelegate)
	        delegate_ = this.newDelegate_(bindingDelegate);
	      else if (!delegate_)
	        delegate_ = this.delegate_;
	
	      if (!this.refContent_)
	        this.refContent_ = this.ref_.content;
	      var content = this.refContent_;
	      if (content.firstChild === null)
	        return emptyInstance;
	
	      var map = getInstanceBindingMap(content, delegate_);
	      var stagingDocument = getTemplateStagingDocument(this);
	      var instance = stagingDocument.createDocumentFragment();
	      instance.templateCreator_ = this;
	      instance.protoContent_ = content;
	      instance.bindings_ = [];
	      instance.terminator_ = null;
	      var instanceRecord = instance.templateInstance_ = {
	        firstNode: null,
	        lastNode: null,
	        model: model
	      };
	
	      var i = 0;
	      var collectTerminator = false;
	      for (var child = content.firstChild; child; child = child.nextSibling) {
	        // The terminator of the instance is the clone of the last child of the
	        // content. If the last child is an active template, it may produce
	        // instances as a result of production, so simply collecting the last
	        // child of the instance after it has finished producing may be wrong.
	        if (child.nextSibling === null)
	          collectTerminator = true;
	
	        var clone = cloneAndBindInstance(child, instance, stagingDocument,
	                                         map.children[i++],
	                                         model,
	                                         delegate_,
	                                         instance.bindings_);
	        clone.templateInstance_ = instanceRecord;
	        if (collectTerminator)
	          instance.terminator_ = clone;
	      }
	
	      instanceRecord.firstNode = instance.firstChild;
	      instanceRecord.lastNode = instance.lastChild;
	      instance.templateCreator_ = undefined;
	      instance.protoContent_ = undefined;
	      return instance;
	    },
	
	    get model() {
	      return this.model_;
	    },
	
	    set model(model) {
	      this.model_ = model;
	      ensureSetModelScheduled(this);
	    },
	
	    get bindingDelegate() {
	      return this.delegate_ && this.delegate_.raw;
	    },
	
	    refChanged_: function() {
	      if (!this.iterator_ || this.refContent_ === this.ref_.content)
	        return;
	
	      this.refContent_ = undefined;
	      this.iterator_.valueChanged();
	      this.iterator_.updateIteratedValue(this.iterator_.getUpdatedValue());
	    },
	
	    clear: function() {
	      this.model_ = undefined;
	      this.delegate_ = undefined;
	      if (this.bindings_ && this.bindings_.ref)
	        this.bindings_.ref.close()
	      this.refContent_ = undefined;
	      if (!this.iterator_)
	        return;
	      this.iterator_.valueChanged();
	      this.iterator_.close()
	      this.iterator_ = undefined;
	    },
	
	    setDelegate_: function(delegate) {
	      this.delegate_ = delegate;
	      this.bindingMap_ = undefined;
	      if (this.iterator_) {
	        this.iterator_.instancePositionChangedFn_ = undefined;
	        this.iterator_.instanceModelFn_ = undefined;
	      }
	    },
	
	    newDelegate_: function(bindingDelegate) {
	      if (!bindingDelegate)
	        return;
	
	      function delegateFn(name) {
	        var fn = bindingDelegate && bindingDelegate[name];
	        if (typeof fn != 'function')
	          return;
	
	        return function() {
	          return fn.apply(bindingDelegate, arguments);
	        };
	      }
	
	      return {
	        bindingMaps: {},
	        raw: bindingDelegate,
	        prepareBinding: delegateFn('prepareBinding'),
	        prepareInstanceModel: delegateFn('prepareInstanceModel'),
	        prepareInstancePositionChanged:
	            delegateFn('prepareInstancePositionChanged')
	      };
	    },
	
	    set bindingDelegate(bindingDelegate) {
	      if (this.delegate_) {
	        throw Error('Template must be cleared before a new bindingDelegate ' +
	                    'can be assigned');
	      }
	
	      this.setDelegate_(this.newDelegate_(bindingDelegate));
	    },
	
	    get ref_() {
	      var ref = searchRefId(this, this.getAttribute('ref'));
	      if (!ref)
	        ref = this.instanceRef_;
	
	      if (!ref)
	        return this;
	
	      var nextRef = ref.ref_;
	      return nextRef ? nextRef : ref;
	    }
	  });
	
	  // Returns
	  //   a) undefined if there are no mustaches.
	  //   b) [TEXT, (ONE_TIME?, PATH, DELEGATE_FN, TEXT)+] if there is at least one mustache.
	  function parseMustaches(s, name, node, prepareBindingFn) {
	    if (!s || !s.length)
	      return;
	
	    var tokens;
	    var length = s.length;
	    var startIndex = 0, lastIndex = 0, endIndex = 0;
	    var onlyOneTime = true;
	    while (lastIndex < length) {
	      var startIndex = s.indexOf('{{', lastIndex);
	      var oneTimeStart = s.indexOf('[[', lastIndex);
	      var oneTime = false;
	      var terminator = '}}';
	
	      if (oneTimeStart >= 0 &&
	          (startIndex < 0 || oneTimeStart < startIndex)) {
	        startIndex = oneTimeStart;
	        oneTime = true;
	        terminator = ']]';
	      }
	
	      endIndex = startIndex < 0 ? -1 : s.indexOf(terminator, startIndex + 2);
	
	      if (endIndex < 0) {
	        if (!tokens)
	          return;
	
	        tokens.push(s.slice(lastIndex)); // TEXT
	        break;
	      }
	
	      tokens = tokens || [];
	      tokens.push(s.slice(lastIndex, startIndex)); // TEXT
	      var pathString = s.slice(startIndex + 2, endIndex).trim();
	      tokens.push(oneTime); // ONE_TIME?
	      onlyOneTime = onlyOneTime && oneTime;
	      var delegateFn = prepareBindingFn &&
	                       prepareBindingFn(pathString, name, node);
	      // Don't try to parse the expression if there's a prepareBinding function
	      if (delegateFn == null) {
	        tokens.push(Path.get(pathString)); // PATH
	      } else {
	        tokens.push(null);
	      }
	      tokens.push(delegateFn); // DELEGATE_FN
	      lastIndex = endIndex + 2;
	    }
	
	    if (lastIndex === length)
	      tokens.push(''); // TEXT
	
	    tokens.hasOnePath = tokens.length === 5;
	    tokens.isSimplePath = tokens.hasOnePath &&
	                          tokens[0] == '' &&
	                          tokens[4] == '';
	    tokens.onlyOneTime = onlyOneTime;
	
	    tokens.combinator = function(values) {
	      var newValue = tokens[0];
	
	      for (var i = 1; i < tokens.length; i += 4) {
	        var value = tokens.hasOnePath ? values : values[(i - 1) / 4];
	        if (value !== undefined)
	          newValue += value;
	        newValue += tokens[i + 3];
	      }
	
	      return newValue;
	    }
	
	    return tokens;
	  };
	
	  function processOneTimeBinding(name, tokens, node, model) {
	    if (tokens.hasOnePath) {
	      var delegateFn = tokens[3];
	      var value = delegateFn ? delegateFn(model, node, true) :
	                               tokens[2].getValueFrom(model);
	      return tokens.isSimplePath ? value : tokens.combinator(value);
	    }
	
	    var values = [];
	    for (var i = 1; i < tokens.length; i += 4) {
	      var delegateFn = tokens[i + 2];
	      values[(i - 1) / 4] = delegateFn ? delegateFn(model, node) :
	          tokens[i + 1].getValueFrom(model);
	    }
	
	    return tokens.combinator(values);
	  }
	
	  function processSinglePathBinding(name, tokens, node, model) {
	    var delegateFn = tokens[3];
	    var observer = delegateFn ? delegateFn(model, node, false) :
	        new PathObserver(model, tokens[2]);
	
	    return tokens.isSimplePath ? observer :
	        new ObserverTransform(observer, tokens.combinator);
	  }
	
	  function processBinding(name, tokens, node, model) {
	    if (tokens.onlyOneTime)
	      return processOneTimeBinding(name, tokens, node, model);
	
	    if (tokens.hasOnePath)
	      return processSinglePathBinding(name, tokens, node, model);
	
	    var observer = new CompoundObserver();
	
	    for (var i = 1; i < tokens.length; i += 4) {
	      var oneTime = tokens[i];
	      var delegateFn = tokens[i + 2];
	
	      if (delegateFn) {
	        var value = delegateFn(model, node, oneTime);
	        if (oneTime)
	          observer.addPath(value)
	        else
	          observer.addObserver(value);
	        continue;
	      }
	
	      var path = tokens[i + 1];
	      if (oneTime)
	        observer.addPath(path.getValueFrom(model))
	      else
	        observer.addPath(model, path);
	    }
	
	    return new ObserverTransform(observer, tokens.combinator);
	  }
	
	  function processBindings(node, bindings, model, instanceBindings) {
	    for (var i = 0; i < bindings.length; i += 2) {
	      var name = bindings[i]
	      var tokens = bindings[i + 1];
	      var value = processBinding(name, tokens, node, model);
	      var binding = node.bind(name, value, tokens.onlyOneTime);
	      if (binding && instanceBindings)
	        instanceBindings.push(binding);
	    }
	
	    node.bindFinished();
	    if (!bindings.isTemplate)
	      return;
	
	    node.model_ = model;
	    var iter = node.processBindingDirectives_(bindings);
	    if (instanceBindings && iter)
	      instanceBindings.push(iter);
	  }
	
	  function parseWithDefault(el, name, prepareBindingFn) {
	    var v = el.getAttribute(name);
	    return parseMustaches(v == '' ? '{{}}' : v, name, el, prepareBindingFn);
	  }
	
	  function parseAttributeBindings(element, prepareBindingFn) {
	    assert(element);
	
	    var bindings = [];
	    var ifFound = false;
	    var bindFound = false;
	
	    for (var i = 0; i < element.attributes.length; i++) {
	      var attr = element.attributes[i];
	      var name = attr.name;
	      var value = attr.value;
	
	      // Allow bindings expressed in attributes to be prefixed with underbars.
	      // We do this to allow correct semantics for browsers that don't implement
	      // <template> where certain attributes might trigger side-effects -- and
	      // for IE which sanitizes certain attributes, disallowing mustache
	      // replacements in their text.
	      while (name[0] === '_') {
	        name = name.substring(1);
	      }
	
	      if (isTemplate(element) &&
	          (name === IF || name === BIND || name === REPEAT)) {
	        continue;
	      }
	
	      var tokens = parseMustaches(value, name, element,
	                                  prepareBindingFn);
	      if (!tokens)
	        continue;
	
	      bindings.push(name, tokens);
	    }
	
	    if (isTemplate(element)) {
	      bindings.isTemplate = true;
	      bindings.if = parseWithDefault(element, IF, prepareBindingFn);
	      bindings.bind = parseWithDefault(element, BIND, prepareBindingFn);
	      bindings.repeat = parseWithDefault(element, REPEAT, prepareBindingFn);
	
	      if (bindings.if && !bindings.bind && !bindings.repeat)
	        bindings.bind = parseMustaches('{{}}', BIND, element, prepareBindingFn);
	    }
	
	    return bindings;
	  }
	
	  function getBindings(node, prepareBindingFn) {
	    if (node.nodeType === Node.ELEMENT_NODE)
	      return parseAttributeBindings(node, prepareBindingFn);
	
	    if (node.nodeType === Node.TEXT_NODE) {
	      var tokens = parseMustaches(node.data, 'textContent', node,
	                                  prepareBindingFn);
	      if (tokens)
	        return ['textContent', tokens];
	    }
	
	    return [];
	  }
	
	  function cloneAndBindInstance(node, parent, stagingDocument, bindings, model,
	                                delegate,
	                                instanceBindings,
	                                instanceRecord) {
	    var clone = parent.appendChild(stagingDocument.importNode(node, false));
	
	    var i = 0;
	    for (var child = node.firstChild; child; child = child.nextSibling) {
	      cloneAndBindInstance(child, clone, stagingDocument,
	                            bindings.children[i++],
	                            model,
	                            delegate,
	                            instanceBindings);
	    }
	
	    if (bindings.isTemplate) {
	      HTMLTemplateElement.decorate(clone, node);
	      if (delegate)
	        clone.setDelegate_(delegate);
	    }
	
	    processBindings(clone, bindings, model, instanceBindings);
	    return clone;
	  }
	
	  function createInstanceBindingMap(node, prepareBindingFn) {
	    var map = getBindings(node, prepareBindingFn);
	    map.children = {};
	    var index = 0;
	    for (var child = node.firstChild; child; child = child.nextSibling) {
	      map.children[index++] = createInstanceBindingMap(child, prepareBindingFn);
	    }
	
	    return map;
	  }
	
	  var contentUidCounter = 1;
	
	  // TODO(rafaelw): Setup a MutationObserver on content which clears the id
	  // so that bindingMaps regenerate when the template.content changes.
	  function getContentUid(content) {
	    var id = content.id_;
	    if (!id)
	      id = content.id_ = contentUidCounter++;
	    return id;
	  }
	
	  // Each delegate is associated with a set of bindingMaps, one for each
	  // content which may be used by a template. The intent is that each binding
	  // delegate gets the opportunity to prepare the instance (via the prepare*
	  // delegate calls) once across all uses.
	  // TODO(rafaelw): Separate out the parse map from the binding map. In the
	  // current implementation, if two delegates need a binding map for the same
	  // content, the second will have to reparse.
	  function getInstanceBindingMap(content, delegate_) {
	    var contentId = getContentUid(content);
	    if (delegate_) {
	      var map = delegate_.bindingMaps[contentId];
	      if (!map) {
	        map = delegate_.bindingMaps[contentId] =
	            createInstanceBindingMap(content, delegate_.prepareBinding) || [];
	      }
	      return map;
	    }
	
	    var map = content.bindingMap_;
	    if (!map) {
	      map = content.bindingMap_ =
	          createInstanceBindingMap(content, undefined) || [];
	    }
	    return map;
	  }
	
	  Object.defineProperty(Node.prototype, 'templateInstance', {
	    get: function() {
	      var instance = this.templateInstance_;
	      return instance ? instance :
	          (this.parentNode ? this.parentNode.templateInstance : undefined);
	    }
	  });
	
	  var emptyInstance = document.createDocumentFragment();
	  emptyInstance.bindings_ = [];
	  emptyInstance.terminator_ = null;
	
	  function TemplateIterator(templateElement) {
	    this.closed = false;
	    this.templateElement_ = templateElement;
	    this.instances = [];
	    this.deps = undefined;
	    this.iteratedValue = [];
	    this.presentValue = undefined;
	    this.arrayObserver = undefined;
	  }
	
	  TemplateIterator.prototype = {
	    closeDeps: function() {
	      var deps = this.deps;
	      if (deps) {
	        if (deps.ifOneTime === false)
	          deps.ifValue.close();
	        if (deps.oneTime === false)
	          deps.value.close();
	      }
	    },
	
	    updateDependencies: function(directives, model) {
	      this.closeDeps();
	
	      var deps = this.deps = {};
	      var template = this.templateElement_;
	
	      var ifValue = true;
	      if (directives.if) {
	        deps.hasIf = true;
	        deps.ifOneTime = directives.if.onlyOneTime;
	        deps.ifValue = processBinding(IF, directives.if, template, model);
	
	        ifValue = deps.ifValue;
	
	        // oneTime if & predicate is false. nothing else to do.
	        if (deps.ifOneTime && !ifValue) {
	          this.valueChanged();
	          return;
	        }
	
	        if (!deps.ifOneTime)
	          ifValue = ifValue.open(this.updateIfValue, this);
	      }
	
	      if (directives.repeat) {
	        deps.repeat = true;
	        deps.oneTime = directives.repeat.onlyOneTime;
	        deps.value = processBinding(REPEAT, directives.repeat, template, model);
	      } else {
	        deps.repeat = false;
	        deps.oneTime = directives.bind.onlyOneTime;
	        deps.value = processBinding(BIND, directives.bind, template, model);
	      }
	
	      var value = deps.value;
	      if (!deps.oneTime)
	        value = value.open(this.updateIteratedValue, this);
	
	      if (!ifValue) {
	        this.valueChanged();
	        return;
	      }
	
	      this.updateValue(value);
	    },
	
	    /**
	     * Gets the updated value of the bind/repeat. This can potentially call
	     * user code (if a bindingDelegate is set up) so we try to avoid it if we
	     * already have the value in hand (from Observer.open).
	     */
	    getUpdatedValue: function() {
	      var value = this.deps.value;
	      if (!this.deps.oneTime)
	        value = value.discardChanges();
	      return value;
	    },
	
	    updateIfValue: function(ifValue) {
	      if (!ifValue) {
	        this.valueChanged();
	        return;
	      }
	
	      this.updateValue(this.getUpdatedValue());
	    },
	
	    updateIteratedValue: function(value) {
	      if (this.deps.hasIf) {
	        var ifValue = this.deps.ifValue;
	        if (!this.deps.ifOneTime)
	          ifValue = ifValue.discardChanges();
	        if (!ifValue) {
	          this.valueChanged();
	          return;
	        }
	      }
	
	      this.updateValue(value);
	    },
	
	    updateValue: function(value) {
	      if (!this.deps.repeat)
	        value = [value];
	      var observe = this.deps.repeat &&
	                    !this.deps.oneTime &&
	                    Array.isArray(value);
	      this.valueChanged(value, observe);
	    },
	
	    valueChanged: function(value, observeValue) {
	      if (!Array.isArray(value))
	        value = [];
	
	      if (value === this.iteratedValue)
	        return;
	
	      this.unobserve();
	      this.presentValue = value;
	      if (observeValue) {
	        this.arrayObserver = new ArrayObserver(this.presentValue);
	        this.arrayObserver.open(this.handleSplices, this);
	      }
	
	      this.handleSplices(ArrayObserver.calculateSplices(this.presentValue,
	                                                        this.iteratedValue));
	    },
	
	    getLastInstanceNode: function(index) {
	      if (index == -1)
	        return this.templateElement_;
	      var instance = this.instances[index];
	      var terminator = instance.terminator_;
	      if (!terminator)
	        return this.getLastInstanceNode(index - 1);
	
	      if (terminator.nodeType !== Node.ELEMENT_NODE ||
	          this.templateElement_ === terminator) {
	        return terminator;
	      }
	
	      var subtemplateIterator = terminator.iterator_;
	      if (!subtemplateIterator)
	        return terminator;
	
	      return subtemplateIterator.getLastTemplateNode();
	    },
	
	    getLastTemplateNode: function() {
	      return this.getLastInstanceNode(this.instances.length - 1);
	    },
	
	    insertInstanceAt: function(index, fragment) {
	      var previousInstanceLast = this.getLastInstanceNode(index - 1);
	      var parent = this.templateElement_.parentNode;
	      this.instances.splice(index, 0, fragment);
	
	      parent.insertBefore(fragment, previousInstanceLast.nextSibling);
	    },
	
	    extractInstanceAt: function(index) {
	      var previousInstanceLast = this.getLastInstanceNode(index - 1);
	      var lastNode = this.getLastInstanceNode(index);
	      var parent = this.templateElement_.parentNode;
	      var instance = this.instances.splice(index, 1)[0];
	
	      while (lastNode !== previousInstanceLast) {
	        var node = previousInstanceLast.nextSibling;
	        if (node == lastNode)
	          lastNode = previousInstanceLast;
	
	        instance.appendChild(parent.removeChild(node));
	      }
	
	      return instance;
	    },
	
	    getDelegateFn: function(fn) {
	      fn = fn && fn(this.templateElement_);
	      return typeof fn === 'function' ? fn : null;
	    },
	
	    handleSplices: function(splices) {
	      if (this.closed || !splices.length)
	        return;
	
	      var template = this.templateElement_;
	
	      if (!template.parentNode) {
	        this.close();
	        return;
	      }
	
	      ArrayObserver.applySplices(this.iteratedValue, this.presentValue,
	                                 splices);
	
	      var delegate = template.delegate_;
	      if (this.instanceModelFn_ === undefined) {
	        this.instanceModelFn_ =
	            this.getDelegateFn(delegate && delegate.prepareInstanceModel);
	      }
	
	      if (this.instancePositionChangedFn_ === undefined) {
	        this.instancePositionChangedFn_ =
	            this.getDelegateFn(delegate &&
	                               delegate.prepareInstancePositionChanged);
	      }
	
	      // Instance Removals
	      var instanceCache = new Map;
	      var removeDelta = 0;
	      for (var i = 0; i < splices.length; i++) {
	        var splice = splices[i];
	        var removed = splice.removed;
	        for (var j = 0; j < removed.length; j++) {
	          var model = removed[j];
	          var instance = this.extractInstanceAt(splice.index + removeDelta);
	          if (instance !== emptyInstance) {
	            instanceCache.set(model, instance);
	          }
	        }
	
	        removeDelta -= splice.addedCount;
	      }
	
	      // Instance Insertions
	      for (var i = 0; i < splices.length; i++) {
	        var splice = splices[i];
	        var addIndex = splice.index;
	        for (; addIndex < splice.index + splice.addedCount; addIndex++) {
	          var model = this.iteratedValue[addIndex];
	          var instance = instanceCache.get(model);
	          if (instance) {
	            instanceCache.delete(model);
	          } else {
	            if (this.instanceModelFn_) {
	              model = this.instanceModelFn_(model);
	            }
	
	            if (model === undefined) {
	              instance = emptyInstance;
	            } else {
	              instance = template.createInstance(model, undefined, delegate);
	            }
	          }
	
	          this.insertInstanceAt(addIndex, instance);
	        }
	      }
	
	      instanceCache.forEach(function(instance) {
	        this.closeInstanceBindings(instance);
	      }, this);
	
	      if (this.instancePositionChangedFn_)
	        this.reportInstancesMoved(splices);
	    },
	
	    reportInstanceMoved: function(index) {
	      var instance = this.instances[index];
	      if (instance === emptyInstance)
	        return;
	
	      this.instancePositionChangedFn_(instance.templateInstance_, index);
	    },
	
	    reportInstancesMoved: function(splices) {
	      var index = 0;
	      var offset = 0;
	      for (var i = 0; i < splices.length; i++) {
	        var splice = splices[i];
	        if (offset != 0) {
	          while (index < splice.index) {
	            this.reportInstanceMoved(index);
	            index++;
	          }
	        } else {
	          index = splice.index;
	        }
	
	        while (index < splice.index + splice.addedCount) {
	          this.reportInstanceMoved(index);
	          index++;
	        }
	
	        offset += splice.addedCount - splice.removed.length;
	      }
	
	      if (offset == 0)
	        return;
	
	      var length = this.instances.length;
	      while (index < length) {
	        this.reportInstanceMoved(index);
	        index++;
	      }
	    },
	
	    closeInstanceBindings: function(instance) {
	      var bindings = instance.bindings_;
	      for (var i = 0; i < bindings.length; i++) {
	        bindings[i].close();
	      }
	    },
	
	    unobserve: function() {
	      if (!this.arrayObserver)
	        return;
	
	      this.arrayObserver.close();
	      this.arrayObserver = undefined;
	    },
	
	    close: function() {
	      if (this.closed)
	        return;
	      this.unobserve();
	      for (var i = 0; i < this.instances.length; i++) {
	        this.closeInstanceBindings(this.instances[i]);
	      }
	
	      this.instances.length = 0;
	      this.closeDeps();
	      this.templateElement_.iterator_ = undefined;
	      this.closed = true;
	    }
	  };
	
	  // Polyfill-specific API.
	  HTMLTemplateElement.forAllTemplatesFrom_ = forAllTemplatesFrom;
	})(this);
	
	(function(scope) {
	  'use strict';
	
	  // feature detect for URL constructor
	  var hasWorkingUrl = false;
	  if (!scope.forceJURL) {
	    try {
	      var u = new URL('b', 'http://a');
	      u.pathname = 'c%20d';
	      hasWorkingUrl = u.href === 'http://a/c%20d';
	    } catch(e) {}
	  }
	
	  if (hasWorkingUrl)
	    return;
	
	  var relative = Object.create(null);
	  relative['ftp'] = 21;
	  relative['file'] = 0;
	  relative['gopher'] = 70;
	  relative['http'] = 80;
	  relative['https'] = 443;
	  relative['ws'] = 80;
	  relative['wss'] = 443;
	
	  var relativePathDotMapping = Object.create(null);
	  relativePathDotMapping['%2e'] = '.';
	  relativePathDotMapping['.%2e'] = '..';
	  relativePathDotMapping['%2e.'] = '..';
	  relativePathDotMapping['%2e%2e'] = '..';
	
	  function isRelativeScheme(scheme) {
	    return relative[scheme] !== undefined;
	  }
	
	  function invalid() {
	    clear.call(this);
	    this._isInvalid = true;
	  }
	
	  function IDNAToASCII(h) {
	    if ('' == h) {
	      invalid.call(this)
	    }
	    // XXX
	    return h.toLowerCase()
	  }
	
	  function percentEscape(c) {
	    var unicode = c.charCodeAt(0);
	    if (unicode > 0x20 &&
	       unicode < 0x7F &&
	       // " # < > ? `
	       [0x22, 0x23, 0x3C, 0x3E, 0x3F, 0x60].indexOf(unicode) == -1
	      ) {
	      return c;
	    }
	    return encodeURIComponent(c);
	  }
	
	  function percentEscapeQuery(c) {
	    // XXX This actually needs to encode c using encoding and then
	    // convert the bytes one-by-one.
	
	    var unicode = c.charCodeAt(0);
	    if (unicode > 0x20 &&
	       unicode < 0x7F &&
	       // " # < > ` (do not escape '?')
	       [0x22, 0x23, 0x3C, 0x3E, 0x60].indexOf(unicode) == -1
	      ) {
	      return c;
	    }
	    return encodeURIComponent(c);
	  }
	
	  var EOF = undefined,
	      ALPHA = /[a-zA-Z]/,
	      ALPHANUMERIC = /[a-zA-Z0-9\+\-\.]/;
	
	  function parse(input, stateOverride, base) {
	    function err(message) {
	      errors.push(message)
	    }
	
	    var state = stateOverride || 'scheme start',
	        cursor = 0,
	        buffer = '',
	        seenAt = false,
	        seenBracket = false,
	        errors = [];
	
	    loop: while ((input[cursor - 1] != EOF || cursor == 0) && !this._isInvalid) {
	      var c = input[cursor];
	      switch (state) {
	        case 'scheme start':
	          if (c && ALPHA.test(c)) {
	            buffer += c.toLowerCase(); // ASCII-safe
	            state = 'scheme';
	          } else if (!stateOverride) {
	            buffer = '';
	            state = 'no scheme';
	            continue;
	          } else {
	            err('Invalid scheme.');
	            break loop;
	          }
	          break;
	
	        case 'scheme':
	          if (c && ALPHANUMERIC.test(c)) {
	            buffer += c.toLowerCase(); // ASCII-safe
	          } else if (':' == c) {
	            this._scheme = buffer;
	            buffer = '';
	            if (stateOverride) {
	              break loop;
	            }
	            if (isRelativeScheme(this._scheme)) {
	              this._isRelative = true;
	            }
	            if ('file' == this._scheme) {
	              state = 'relative';
	            } else if (this._isRelative && base && base._scheme == this._scheme) {
	              state = 'relative or authority';
	            } else if (this._isRelative) {
	              state = 'authority first slash';
	            } else {
	              state = 'scheme data';
	            }
	          } else if (!stateOverride) {
	            buffer = '';
	            cursor = 0;
	            state = 'no scheme';
	            continue;
	          } else if (EOF == c) {
	            break loop;
	          } else {
	            err('Code point not allowed in scheme: ' + c)
	            break loop;
	          }
	          break;
	
	        case 'scheme data':
	          if ('?' == c) {
	            query = '?';
	            state = 'query';
	          } else if ('#' == c) {
	            this._fragment = '#';
	            state = 'fragment';
	          } else {
	            // XXX error handling
	            if (EOF != c && '\t' != c && '\n' != c && '\r' != c) {
	              this._schemeData += percentEscape(c);
	            }
	          }
	          break;
	
	        case 'no scheme':
	          if (!base || !(isRelativeScheme(base._scheme))) {
	            err('Missing scheme.');
	            invalid.call(this);
	          } else {
	            state = 'relative';
	            continue;
	          }
	          break;
	
	        case 'relative or authority':
	          if ('/' == c && '/' == input[cursor+1]) {
	            state = 'authority ignore slashes';
	          } else {
	            err('Expected /, got: ' + c);
	            state = 'relative';
	            continue
	          }
	          break;
	
	        case 'relative':
	          this._isRelative = true;
	          if ('file' != this._scheme)
	            this._scheme = base._scheme;
	          if (EOF == c) {
	            this._host = base._host;
	            this._port = base._port;
	            this._path = base._path.slice();
	            this._query = base._query;
	            break loop;
	          } else if ('/' == c || '\\' == c) {
	            if ('\\' == c)
	              err('\\ is an invalid code point.');
	            state = 'relative slash';
	          } else if ('?' == c) {
	            this._host = base._host;
	            this._port = base._port;
	            this._path = base._path.slice();
	            this._query = '?';
	            state = 'query';
	          } else if ('#' == c) {
	            this._host = base._host;
	            this._port = base._port;
	            this._path = base._path.slice();
	            this._query = base._query;
	            this._fragment = '#';
	            state = 'fragment';
	          } else {
	            var nextC = input[cursor+1]
	            var nextNextC = input[cursor+2]
	            if (
	              'file' != this._scheme || !ALPHA.test(c) ||
	              (nextC != ':' && nextC != '|') ||
	              (EOF != nextNextC && '/' != nextNextC && '\\' != nextNextC && '?' != nextNextC && '#' != nextNextC)) {
	              this._host = base._host;
	              this._port = base._port;
	              this._path = base._path.slice();
	              this._path.pop();
	            }
	            state = 'relative path';
	            continue;
	          }
	          break;
	
	        case 'relative slash':
	          if ('/' == c || '\\' == c) {
	            if ('\\' == c) {
	              err('\\ is an invalid code point.');
	            }
	            if ('file' == this._scheme) {
	              state = 'file host';
	            } else {
	              state = 'authority ignore slashes';
	            }
	          } else {
	            if ('file' != this._scheme) {
	              this._host = base._host;
	              this._port = base._port;
	            }
	            state = 'relative path';
	            continue;
	          }
	          break;
	
	        case 'authority first slash':
	          if ('/' == c) {
	            state = 'authority second slash';
	          } else {
	            err("Expected '/', got: " + c);
	            state = 'authority ignore slashes';
	            continue;
	          }
	          break;
	
	        case 'authority second slash':
	          state = 'authority ignore slashes';
	          if ('/' != c) {
	            err("Expected '/', got: " + c);
	            continue;
	          }
	          break;
	
	        case 'authority ignore slashes':
	          if ('/' != c && '\\' != c) {
	            state = 'authority';
	            continue;
	          } else {
	            err('Expected authority, got: ' + c);
	          }
	          break;
	
	        case 'authority':
	          if ('@' == c) {
	            if (seenAt) {
	              err('@ already seen.');
	              buffer += '%40';
	            }
	            seenAt = true;
	            for (var i = 0; i < buffer.length; i++) {
	              var cp = buffer[i];
	              if ('\t' == cp || '\n' == cp || '\r' == cp) {
	                err('Invalid whitespace in authority.');
	                continue;
	              }
	              // XXX check URL code points
	              if (':' == cp && null === this._password) {
	                this._password = '';
	                continue;
	              }
	              var tempC = percentEscape(cp);
	              (null !== this._password) ? this._password += tempC : this._username += tempC;
	            }
	            buffer = '';
	          } else if (EOF == c || '/' == c || '\\' == c || '?' == c || '#' == c) {
	            cursor -= buffer.length;
	            buffer = '';
	            state = 'host';
	            continue;
	          } else {
	            buffer += c;
	          }
	          break;
	
	        case 'file host':
	          if (EOF == c || '/' == c || '\\' == c || '?' == c || '#' == c) {
	            if (buffer.length == 2 && ALPHA.test(buffer[0]) && (buffer[1] == ':' || buffer[1] == '|')) {
	              state = 'relative path';
	            } else if (buffer.length == 0) {
	              state = 'relative path start';
	            } else {
	              this._host = IDNAToASCII.call(this, buffer);
	              buffer = '';
	              state = 'relative path start';
	            }
	            continue;
	          } else if ('\t' == c || '\n' == c || '\r' == c) {
	            err('Invalid whitespace in file host.');
	          } else {
	            buffer += c;
	          }
	          break;
	
	        case 'host':
	        case 'hostname':
	          if (':' == c && !seenBracket) {
	            // XXX host parsing
	            this._host = IDNAToASCII.call(this, buffer);
	            buffer = '';
	            state = 'port';
	            if ('hostname' == stateOverride) {
	              break loop;
	            }
	          } else if (EOF == c || '/' == c || '\\' == c || '?' == c || '#' == c) {
	            this._host = IDNAToASCII.call(this, buffer);
	            buffer = '';
	            state = 'relative path start';
	            if (stateOverride) {
	              break loop;
	            }
	            continue;
	          } else if ('\t' != c && '\n' != c && '\r' != c) {
	            if ('[' == c) {
	              seenBracket = true;
	            } else if (']' == c) {
	              seenBracket = false;
	            }
	            buffer += c;
	          } else {
	            err('Invalid code point in host/hostname: ' + c);
	          }
	          break;
	
	        case 'port':
	          if (/[0-9]/.test(c)) {
	            buffer += c;
	          } else if (EOF == c || '/' == c || '\\' == c || '?' == c || '#' == c || stateOverride) {
	            if ('' != buffer) {
	              var temp = parseInt(buffer, 10);
	              if (temp != relative[this._scheme]) {
	                this._port = temp + '';
	              }
	              buffer = '';
	            }
	            if (stateOverride) {
	              break loop;
	            }
	            state = 'relative path start';
	            continue;
	          } else if ('\t' == c || '\n' == c || '\r' == c) {
	            err('Invalid code point in port: ' + c);
	          } else {
	            invalid.call(this);
	          }
	          break;
	
	        case 'relative path start':
	          if ('\\' == c)
	            err("'\\' not allowed in path.");
	          state = 'relative path';
	          if ('/' != c && '\\' != c) {
	            continue;
	          }
	          break;
	
	        case 'relative path':
	          if (EOF == c || '/' == c || '\\' == c || (!stateOverride && ('?' == c || '#' == c))) {
	            if ('\\' == c) {
	              err('\\ not allowed in relative path.');
	            }
	            var tmp;
	            if (tmp = relativePathDotMapping[buffer.toLowerCase()]) {
	              buffer = tmp;
	            }
	            if ('..' == buffer) {
	              this._path.pop();
	              if ('/' != c && '\\' != c) {
	                this._path.push('');
	              }
	            } else if ('.' == buffer && '/' != c && '\\' != c) {
	              this._path.push('');
	            } else if ('.' != buffer) {
	              if ('file' == this._scheme && this._path.length == 0 && buffer.length == 2 && ALPHA.test(buffer[0]) && buffer[1] == '|') {
	                buffer = buffer[0] + ':';
	              }
	              this._path.push(buffer);
	            }
	            buffer = '';
	            if ('?' == c) {
	              this._query = '?';
	              state = 'query';
	            } else if ('#' == c) {
	              this._fragment = '#';
	              state = 'fragment';
	            }
	          } else if ('\t' != c && '\n' != c && '\r' != c) {
	            buffer += percentEscape(c);
	          }
	          break;
	
	        case 'query':
	          if (!stateOverride && '#' == c) {
	            this._fragment = '#';
	            state = 'fragment';
	          } else if (EOF != c && '\t' != c && '\n' != c && '\r' != c) {
	            this._query += percentEscapeQuery(c);
	          }
	          break;
	
	        case 'fragment':
	          if (EOF != c && '\t' != c && '\n' != c && '\r' != c) {
	            this._fragment += c;
	          }
	          break;
	      }
	
	      cursor++;
	    }
	  }
	
	  function clear() {
	    this._scheme = '';
	    this._schemeData = '';
	    this._username = '';
	    this._password = null;
	    this._host = '';
	    this._port = '';
	    this._path = [];
	    this._query = '';
	    this._fragment = '';
	    this._isInvalid = false;
	    this._isRelative = false;
	  }
	
	  // Does not process domain names or IP addresses.
	  // Does not handle encoding for the query parameter.
	  function jURL(url, base /* , encoding */) {
	    if (base !== undefined && !(base instanceof jURL))
	      base = new jURL(String(base));
	
	    this._url = url;
	    clear.call(this);
	
	    var input = url.replace(/^[ \t\r\n\f]+|[ \t\r\n\f]+$/g, '');
	    // encoding = encoding || 'utf-8'
	
	    parse.call(this, input, null, base);
	  }
	
	  jURL.prototype = {
	    get href() {
	      if (this._isInvalid)
	        return this._url;
	
	      var authority = '';
	      if ('' != this._username || null != this._password) {
	        authority = this._username +
	            (null != this._password ? ':' + this._password : '') + '@';
	      }
	
	      return this.protocol +
	          (this._isRelative ? '//' + authority + this.host : '') +
	          this.pathname + this._query + this._fragment;
	    },
	    set href(href) {
	      clear.call(this);
	      parse.call(this, href);
	    },
	
	    get protocol() {
	      return this._scheme + ':';
	    },
	    set protocol(protocol) {
	      if (this._isInvalid)
	        return;
	      parse.call(this, protocol + ':', 'scheme start');
	    },
	
	    get host() {
	      return this._isInvalid ? '' : this._port ?
	          this._host + ':' + this._port : this._host;
	    },
	    set host(host) {
	      if (this._isInvalid || !this._isRelative)
	        return;
	      parse.call(this, host, 'host');
	    },
	
	    get hostname() {
	      return this._host;
	    },
	    set hostname(hostname) {
	      if (this._isInvalid || !this._isRelative)
	        return;
	      parse.call(this, hostname, 'hostname');
	    },
	
	    get port() {
	      return this._port;
	    },
	    set port(port) {
	      if (this._isInvalid || !this._isRelative)
	        return;
	      parse.call(this, port, 'port');
	    },
	
	    get pathname() {
	      return this._isInvalid ? '' : this._isRelative ?
	          '/' + this._path.join('/') : this._schemeData;
	    },
	    set pathname(pathname) {
	      if (this._isInvalid || !this._isRelative)
	        return;
	      this._path = [];
	      parse.call(this, pathname, 'relative path start');
	    },
	
	    get search() {
	      return this._isInvalid || !this._query || '?' == this._query ?
	          '' : this._query;
	    },
	    set search(search) {
	      if (this._isInvalid || !this._isRelative)
	        return;
	      this._query = '?';
	      if ('?' == search[0])
	        search = search.slice(1);
	      parse.call(this, search, 'query');
	    },
	
	    get hash() {
	      return this._isInvalid || !this._fragment || '#' == this._fragment ?
	          '' : this._fragment;
	    },
	    set hash(hash) {
	      if (this._isInvalid)
	        return;
	      this._fragment = '#';
	      if ('#' == hash[0])
	        hash = hash.slice(1);
	      parse.call(this, hash, 'fragment');
	    },
	
	    get origin() {
	      var host;
	      if (this._isInvalid || !this._scheme) {
	        return '';
	      }
	      // javascript: Gecko returns String(""), WebKit/Blink String("null")
	      // Gecko throws error for "data://"
	      // data: Gecko returns "", Blink returns "data://", WebKit returns "null"
	      // Gecko returns String("") for file: mailto:
	      // WebKit/Blink returns String("SCHEME://") for file: mailto:
	      switch (this._scheme) {
	        case 'data':
	        case 'file':
	        case 'javascript':
	        case 'mailto':
	          return 'null';
	      }
	      host = this.host;
	      if (!host) {
	        return '';
	      }
	      return this._scheme + '://' + host;
	    }
	  };
	
	  // Copy over the static methods
	  var OriginalURL = scope.URL;
	  if (OriginalURL) {
	    jURL.createObjectURL = function(blob) {
	      // IE extension allows a second optional options argument.
	      // http://msdn.microsoft.com/en-us/library/ie/hh772302(v=vs.85).aspx
	      return OriginalURL.createObjectURL.apply(OriginalURL, arguments);
	    };
	    jURL.revokeObjectURL = function(url) {
	      OriginalURL.revokeObjectURL(url);
	    };
	  }
	
	  scope.URL = jURL;
	
	})(this);
	
	(function(scope) {
	
	var iterations = 0;
	var callbacks = [];
	var twiddle = document.createTextNode('');
	
	function endOfMicrotask(callback) {
	  twiddle.textContent = iterations++;
	  callbacks.push(callback);
	}
	
	function atEndOfMicrotask() {
	  while (callbacks.length) {
	    callbacks.shift()();
	  }
	}
	
	new (window.MutationObserver || JsMutationObserver)(atEndOfMicrotask)
	  .observe(twiddle, {characterData: true})
	  ;
	
	// exports
	scope.endOfMicrotask = endOfMicrotask;
	// bc
	Platform.endOfMicrotask = endOfMicrotask;
	
	})(Polymer);
	
	
	(function(scope) {
	
	/**
	 * @class Polymer
	 */
	
	// imports
	var endOfMicrotask = scope.endOfMicrotask;
	
	// logging
	var log = window.WebComponents ? WebComponents.flags.log : {};
	
	// inject style sheet
	var style = document.createElement('style');
	style.textContent = 'template {display: none !important;} /* injected by platform.js */';
	var head = document.querySelector('head');
	head.insertBefore(style, head.firstChild);
	
	
	/**
	 * Force any pending data changes to be observed before
	 * the next task. Data changes are processed asynchronously but are guaranteed
	 * to be processed, for example, before painting. This method should rarely be
	 * needed. It does nothing when Object.observe is available;
	 * when Object.observe is not available, Polymer automatically flushes data
	 * changes approximately every 1/10 second.
	 * Therefore, `flush` should only be used when a data mutation should be
	 * observed sooner than this.
	 *
	 * @method flush
	 */
	// flush (with logging)
	var flushing;
	function flush() {
	  if (!flushing) {
	    flushing = true;
	    endOfMicrotask(function() {
	      flushing = false;
	      log.data && console.group('flush');
	      Platform.performMicrotaskCheckpoint();
	      log.data && console.groupEnd();
	    });
	  }
	};
	
	// polling dirty checker
	// flush periodically if platform does not have object observe.
	if (typeof Observer !== "undefined" && !Observer.hasObjectObserve) {
	  var FLUSH_POLL_INTERVAL = 125;
	  window.addEventListener('WebComponentsReady', function() {
	    flush();
	    // watch document visiblity to toggle dirty-checking
	    var visibilityHandler = function() {
	      // only flush if the page is visibile
	      if (document.visibilityState === 'hidden') {
	        if (scope.flushPoll) {
	          clearInterval(scope.flushPoll);
	        }
	      } else {
	        scope.flushPoll = setInterval(flush, FLUSH_POLL_INTERVAL);
	      }
	    };
	    if (typeof document.visibilityState === 'string') {
	      document.addEventListener('visibilitychange', visibilityHandler);
	    }
	    visibilityHandler();
	  });
	} else {
	  // make flush a no-op when we have Object.observe
	  flush = function() {};
	}
	
	if (window.CustomElements && !CustomElements.useNative) {
	  var originalImportNode = Document.prototype.importNode;
	  Document.prototype.importNode = function(node, deep) {
	    var imported = originalImportNode.call(this, node, deep);
	    CustomElements.upgradeAll(imported);
	    return imported;
	  };
	}
	
	// exports
	scope.flush = flush;
	// bc
	Platform.flush = flush;
	
	})(window.Polymer);
	
	
	(function(scope) {
	
	var urlResolver = {
	  resolveDom: function(root, url) {
	    url = url || baseUrl(root);
	    this.resolveAttributes(root, url);
	    this.resolveStyles(root, url);
	    // handle template.content
	    var templates = root.querySelectorAll('template');
	    if (templates) {
	      for (var i = 0, l = templates.length, t; (i < l) && (t = templates[i]); i++) {
	        if (t.content) {
	          this.resolveDom(t.content, url);
	        }
	      }
	    }
	  },
	  resolveTemplate: function(template) {
	    this.resolveDom(template.content, baseUrl(template));
	  },
	  resolveStyles: function(root, url) {
	    var styles = root.querySelectorAll('style');
	    if (styles) {
	      for (var i = 0, l = styles.length, s; (i < l) && (s = styles[i]); i++) {
	        this.resolveStyle(s, url);
	      }
	    }
	  },
	  resolveStyle: function(style, url) {
	    url = url || baseUrl(style);
	    style.textContent = this.resolveCssText(style.textContent, url);
	  },
	  resolveCssText: function(cssText, baseUrl, keepAbsolute) {
	    cssText = replaceUrlsInCssText(cssText, baseUrl, keepAbsolute, CSS_URL_REGEXP);
	    return replaceUrlsInCssText(cssText, baseUrl, keepAbsolute, CSS_IMPORT_REGEXP);
	  },
	  resolveAttributes: function(root, url) {
	    if (root.hasAttributes && root.hasAttributes()) {
	      this.resolveElementAttributes(root, url);
	    }
	    // search for attributes that host urls
	    var nodes = root && root.querySelectorAll(URL_ATTRS_SELECTOR);
	    if (nodes) {
	      for (var i = 0, l = nodes.length, n; (i < l) && (n = nodes[i]); i++) {
	        this.resolveElementAttributes(n, url);
	      }
	    }
	  },
	  resolveElementAttributes: function(node, url) {
	    url = url || baseUrl(node);
	    URL_ATTRS.forEach(function(v) {
	      var attr = node.attributes[v];
	      var value = attr && attr.value;
	      var replacement;
	      if (value && value.search(URL_TEMPLATE_SEARCH) < 0) {
	        if (v === 'style') {
	          replacement = replaceUrlsInCssText(value, url, false, CSS_URL_REGEXP);
	        } else {
	          replacement = resolveRelativeUrl(url, value);
	        }
	        attr.value = replacement;
	      }
	    });
	  }
	};
	
	var CSS_URL_REGEXP = /(url\()([^)]*)(\))/g;
	var CSS_IMPORT_REGEXP = /(@import[\s]+(?!url\())([^;]*)(;)/g;
	var URL_ATTRS = ['href', 'src', 'action', 'style', 'url'];
	var URL_ATTRS_SELECTOR = '[' + URL_ATTRS.join('],[') + ']';
	var URL_TEMPLATE_SEARCH = '{{.*}}';
	var URL_HASH = '#';
	
	function baseUrl(node) {
	  var u = new URL(node.ownerDocument.baseURI);
	  u.search = '';
	  u.hash = '';
	  return u;
	}
	
	function replaceUrlsInCssText(cssText, baseUrl, keepAbsolute, regexp) {
	  return cssText.replace(regexp, function(m, pre, url, post) {
	    var urlPath = url.replace(/["']/g, '');
	    urlPath = resolveRelativeUrl(baseUrl, urlPath, keepAbsolute);
	    return pre + '\'' + urlPath + '\'' + post;
	  });
	}
	
	function resolveRelativeUrl(baseUrl, url, keepAbsolute) {
	  // do not resolve '/' absolute urls
	  if (url && url[0] === '/') {
	    return url;
	  }
	  // do not resolve '#' links, they are used for routing
	  if (url && url[0] === '#') {
	    return url;
	  }
	  var u = new URL(url, baseUrl);
	  return keepAbsolute ? u.href : makeDocumentRelPath(u.href);
	}
	
	function makeDocumentRelPath(url) {
	  var root = baseUrl(document.documentElement);
	  var u = new URL(url, root);
	  if (u.host === root.host && u.port === root.port &&
	      u.protocol === root.protocol) {
	    return makeRelPath(root, u);
	  } else {
	    return url;
	  }
	}
	
	// make a relative path from source to target
	function makeRelPath(sourceUrl, targetUrl) {
	  var source = sourceUrl.pathname;
	  var target = targetUrl.pathname;
	  var s = source.split('/');
	  var t = target.split('/');
	  while (s.length && s[0] === t[0]){
	    s.shift();
	    t.shift();
	  }
	  for (var i = 0, l = s.length - 1; i < l; i++) {
	    t.unshift('..');
	  }
	  // empty '#' is discarded but we need to preserve it.
	  var hash = (targetUrl.href.slice(-1) === URL_HASH) ? URL_HASH : targetUrl.hash;
	  return t.join('/') + targetUrl.search + hash;
	}
	
	// exports
	scope.urlResolver = urlResolver;
	
	})(Polymer);
	
	(function(scope) {
	  var endOfMicrotask = Polymer.endOfMicrotask;
	
	  // Generic url loader
	  function Loader(regex) {
	    this.cache = Object.create(null);
	    this.map = Object.create(null);
	    this.requests = 0;
	    this.regex = regex;
	  }
	  Loader.prototype = {
	
	    // TODO(dfreedm): there may be a better factoring here
	    // extract absolute urls from the text (full of relative urls)
	    extractUrls: function(text, base) {
	      var matches = [];
	      var matched, u;
	      while ((matched = this.regex.exec(text))) {
	        u = new URL(matched[1], base);
	        matches.push({matched: matched[0], url: u.href});
	      }
	      return matches;
	    },
	    // take a text blob, a root url, and a callback and load all the urls found within the text
	    // returns a map of absolute url to text
	    process: function(text, root, callback) {
	      var matches = this.extractUrls(text, root);
	
	      // every call to process returns all the text this loader has ever received
	      var done = callback.bind(null, this.map);
	      this.fetch(matches, done);
	    },
	    // build a mapping of url -> text from matches
	    fetch: function(matches, callback) {
	      var inflight = matches.length;
	
	      // return early if there is no fetching to be done
	      if (!inflight) {
	        return callback();
	      }
	
	      // wait for all subrequests to return
	      var done = function() {
	        if (--inflight === 0) {
	          callback();
	        }
	      };
	
	      // start fetching all subrequests
	      var m, req, url;
	      for (var i = 0; i < inflight; i++) {
	        m = matches[i];
	        url = m.url;
	        req = this.cache[url];
	        // if this url has already been requested, skip requesting it again
	        if (!req) {
	          req = this.xhr(url);
	          req.match = m;
	          this.cache[url] = req;
	        }
	        // wait for the request to process its subrequests
	        req.wait(done);
	      }
	    },
	    handleXhr: function(request) {
	      var match = request.match;
	      var url = match.url;
	
	      // handle errors with an empty string
	      var response = request.response || request.responseText || '';
	      this.map[url] = response;
	      this.fetch(this.extractUrls(response, url), request.resolve);
	    },
	    xhr: function(url) {
	      this.requests++;
	      var request = new XMLHttpRequest();
	      request.open('GET', url, true);
	      request.send();
	      request.onerror = request.onload = this.handleXhr.bind(this, request);
	
	      // queue of tasks to run after XHR returns
	      request.pending = [];
	      request.resolve = function() {
	        var pending = request.pending;
	        for(var i = 0; i < pending.length; i++) {
	          pending[i]();
	        }
	        request.pending = null;
	      };
	
	      // if we have already resolved, pending is null, async call the callback
	      request.wait = function(fn) {
	        if (request.pending) {
	          request.pending.push(fn);
	        } else {
	          endOfMicrotask(fn);
	        }
	      };
	
	      return request;
	    }
	  };
	
	  scope.Loader = Loader;
	})(Polymer);
	
	(function(scope) {
	
	var urlResolver = scope.urlResolver;
	var Loader = scope.Loader;
	
	function StyleResolver() {
	  this.loader = new Loader(this.regex);
	}
	StyleResolver.prototype = {
	  regex: /@import\s+(?:url)?["'\(]*([^'"\)]*)['"\)]*;/g,
	  // Recursively replace @imports with the text at that url
	  resolve: function(text, url, callback) {
	    var done = function(map) {
	      callback(this.flatten(text, url, map));
	    }.bind(this);
	    this.loader.process(text, url, done);
	  },
	  // resolve the textContent of a style node
	  resolveNode: function(style, url, callback) {
	    var text = style.textContent;
	    var done = function(text) {
	      style.textContent = text;
	      callback(style);
	    };
	    this.resolve(text, url, done);
	  },
	  // flatten all the @imports to text
	  flatten: function(text, base, map) {
	    var matches = this.loader.extractUrls(text, base);
	    var match, url, intermediate;
	    for (var i = 0; i < matches.length; i++) {
	      match = matches[i];
	      url = match.url;
	      // resolve any css text to be relative to the importer, keep absolute url
	      intermediate = urlResolver.resolveCssText(map[url], url, true);
	      // flatten intermediate @imports
	      intermediate = this.flatten(intermediate, base, map);
	      text = text.replace(match.matched, intermediate);
	    }
	    return text;
	  },
	  loadStyles: function(styles, base, callback) {
	    var loaded=0, l = styles.length;
	    // called in the context of the style
	    function loadedStyle(style) {
	      loaded++;
	      if (loaded === l && callback) {
	        callback();
	      }
	    }
	    for (var i=0, s; (i<l) && (s=styles[i]); i++) {
	      this.resolveNode(s, base, loadedStyle);
	    }
	  }
	};
	
	var styleResolver = new StyleResolver();
	
	// exports
	scope.styleResolver = styleResolver;
	
	})(Polymer);
	
	(function(scope) {
	
	  // copy own properties from 'api' to 'prototype, with name hinting for 'super'
	  function extend(prototype, api) {
	    if (prototype && api) {
	      // use only own properties of 'api'
	      Object.getOwnPropertyNames(api).forEach(function(n) {
	        // acquire property descriptor
	        var pd = Object.getOwnPropertyDescriptor(api, n);
	        if (pd) {
	          // clone property via descriptor
	          Object.defineProperty(prototype, n, pd);
	          // cache name-of-method for 'super' engine
	          if (typeof pd.value == 'function') {
	            // hint the 'super' engine
	            pd.value.nom = n;
	          }
	        }
	      });
	    }
	    return prototype;
	  }
	
	
	  // mixin
	
	  // copy all properties from inProps (et al) to inObj
	  function mixin(inObj/*, inProps, inMoreProps, ...*/) {
	    var obj = inObj || {};
	    for (var i = 1; i < arguments.length; i++) {
	      var p = arguments[i];
	      try {
	        for (var n in p) {
	          copyProperty(n, p, obj);
	        }
	      } catch(x) {
	      }
	    }
	    return obj;
	  }
	
	  // copy property inName from inSource object to inTarget object
	  function copyProperty(inName, inSource, inTarget) {
	    var pd = getPropertyDescriptor(inSource, inName);
	    Object.defineProperty(inTarget, inName, pd);
	  }
	
	  // get property descriptor for inName on inObject, even if
	  // inName exists on some link in inObject's prototype chain
	  function getPropertyDescriptor(inObject, inName) {
	    if (inObject) {
	      var pd = Object.getOwnPropertyDescriptor(inObject, inName);
	      return pd || getPropertyDescriptor(Object.getPrototypeOf(inObject), inName);
	    }
	  }
	
	  // exports
	
	  scope.extend = extend;
	  scope.mixin = mixin;
	
	  // for bc
	  Platform.mixin = mixin;
	
	})(Polymer);
	
	(function(scope) {
	
	  // usage
	
	  // invoke cb.call(this) in 100ms, unless the job is re-registered,
	  // which resets the timer
	  //
	  // this.myJob = this.job(this.myJob, cb, 100)
	  //
	  // returns a job handle which can be used to re-register a job
	
	  var Job = function(inContext) {
	    this.context = inContext;
	    this.boundComplete = this.complete.bind(this)
	  };
	  Job.prototype = {
	    go: function(callback, wait) {
	      this.callback = callback;
	      var h;
	      if (!wait) {
	        h = requestAnimationFrame(this.boundComplete);
	        this.handle = function() {
	          cancelAnimationFrame(h);
	        }
	      } else {
	        h = setTimeout(this.boundComplete, wait);
	        this.handle = function() {
	          clearTimeout(h);
	        }
	      }
	    },
	    stop: function() {
	      if (this.handle) {
	        this.handle();
	        this.handle = null;
	      }
	    },
	    complete: function() {
	      if (this.handle) {
	        this.stop();
	        this.callback.call(this.context);
	      }
	    }
	  };
	
	  function job(job, callback, wait) {
	    if (job) {
	      job.stop();
	    } else {
	      job = new Job(this);
	    }
	    job.go(callback, wait);
	    return job;
	  }
	
	  // exports
	
	  scope.job = job;
	
	})(Polymer);
	
	(function(scope) {
	
	  // dom polyfill, additions, and utility methods
	
	  var registry = {};
	
	  HTMLElement.register = function(tag, prototype) {
	    registry[tag] = prototype;
	  };
	
	  // get prototype mapped to node <tag>
	  HTMLElement.getPrototypeForTag = function(tag) {
	    var prototype = !tag ? HTMLElement.prototype : registry[tag];
	    // TODO(sjmiles): creating <tag> is likely to have wasteful side-effects
	    return prototype || Object.getPrototypeOf(document.createElement(tag));
	  };
	
	  // we have to flag propagation stoppage for the event dispatcher
	  var originalStopPropagation = Event.prototype.stopPropagation;
	  Event.prototype.stopPropagation = function() {
	    this.cancelBubble = true;
	    originalStopPropagation.apply(this, arguments);
	  };
	
	
	  // polyfill DOMTokenList
	  // * add/remove: allow these methods to take multiple classNames
	  // * toggle: add a 2nd argument which forces the given state rather
	  //  than toggling.
	
	  var add = DOMTokenList.prototype.add;
	  var remove = DOMTokenList.prototype.remove;
	  DOMTokenList.prototype.add = function() {
	    for (var i = 0; i < arguments.length; i++) {
	      add.call(this, arguments[i]);
	    }
	  };
	  DOMTokenList.prototype.remove = function() {
	    for (var i = 0; i < arguments.length; i++) {
	      remove.call(this, arguments[i]);
	    }
	  };
	  DOMTokenList.prototype.toggle = function(name, bool) {
	    if (arguments.length == 1) {
	      bool = !this.contains(name);
	    }
	    bool ? this.add(name) : this.remove(name);
	  };
	  DOMTokenList.prototype.switch = function(oldName, newName) {
	    oldName && this.remove(oldName);
	    newName && this.add(newName);
	  };
	
	  // add array() to NodeList, NamedNodeMap, HTMLCollection
	
	  var ArraySlice = function() {
	    return Array.prototype.slice.call(this);
	  };
	
	  var namedNodeMap = (window.NamedNodeMap || window.MozNamedAttrMap || {});
	
	  NodeList.prototype.array = ArraySlice;
	  namedNodeMap.prototype.array = ArraySlice;
	  HTMLCollection.prototype.array = ArraySlice;
	
	  // utility
	
	  function createDOM(inTagOrNode, inHTML, inAttrs) {
	    var dom = typeof inTagOrNode == 'string' ?
	        document.createElement(inTagOrNode) : inTagOrNode.cloneNode(true);
	    dom.innerHTML = inHTML;
	    if (inAttrs) {
	      for (var n in inAttrs) {
	        dom.setAttribute(n, inAttrs[n]);
	      }
	    }
	    return dom;
	  }
	
	  // exports
	
	  scope.createDOM = createDOM;
	
	})(Polymer);
	
	(function(scope) {
	    // super
	
	    // `arrayOfArgs` is an optional array of args like one might pass
	    // to `Function.apply`
	
	    // TODO(sjmiles):
	    //    $super must be installed on an instance or prototype chain
	    //    as `super`, and invoked via `this`, e.g.
	    //      `this.super();`
	
	    //    will not work if function objects are not unique, for example,
	    //    when using mixins.
	    //    The memoization strategy assumes each function exists on only one
	    //    prototype chain i.e. we use the function object for memoizing)
	    //    perhaps we can bookkeep on the prototype itself instead
	    function $super(arrayOfArgs) {
	      // since we are thunking a method call, performance is important here:
	      // memoize all lookups, once memoized the fast path calls no other
	      // functions
	      //
	      // find the caller (cannot be `strict` because of 'caller')
	      var caller = $super.caller;
	      // memoized 'name of method'
	      var nom = caller.nom;
	      // memoized next implementation prototype
	      var _super = caller._super;
	      if (!_super) {
	        if (!nom) {
	          nom = caller.nom = nameInThis.call(this, caller);
	        }
	        if (!nom) {
	          console.warn('called super() on a method not installed declaratively (has no .nom property)');
	        }
	        // super prototype is either cached or we have to find it
	        // by searching __proto__ (at the 'top')
	        // invariant: because we cache _super on fn below, we never reach
	        // here from inside a series of calls to super(), so it's ok to
	        // start searching from the prototype of 'this' (at the 'top')
	        // we must never memoize a null super for this reason
	        _super = memoizeSuper(caller, nom, getPrototypeOf(this));
	      }
	      // our super function
	      var fn = _super[nom];
	      if (fn) {
	        // memoize information so 'fn' can call 'super'
	        if (!fn._super) {
	          // must not memoize null, or we lose our invariant above
	          memoizeSuper(fn, nom, _super);
	        }
	        // invoke the inherited method
	        // if 'fn' is not function valued, this will throw
	        return fn.apply(this, arrayOfArgs || []);
	      }
	    }
	
	    function nameInThis(value) {
	      var p = this.__proto__;
	      while (p && p !== HTMLElement.prototype) {
	        // TODO(sjmiles): getOwnPropertyNames is absurdly expensive
	        var n$ = Object.getOwnPropertyNames(p);
	        for (var i=0, l=n$.length, n; i<l && (n=n$[i]); i++) {
	          var d = Object.getOwnPropertyDescriptor(p, n);
	          if (typeof d.value === 'function' && d.value === value) {
	            return n;
	          }
	        }
	        p = p.__proto__;
	      }
	    }
	
	    function memoizeSuper(method, name, proto) {
	      // find and cache next prototype containing `name`
	      // we need the prototype so we can do another lookup
	      // from here
	      var s = nextSuper(proto, name, method);
	      if (s[name]) {
	        // `s` is a prototype, the actual method is `s[name]`
	        // tag super method with it's name for quicker lookups
	        s[name].nom = name;
	      }
	      return method._super = s;
	    }
	
	    function nextSuper(proto, name, caller) {
	      // look for an inherited prototype that implements name
	      while (proto) {
	        if ((proto[name] !== caller) && proto[name]) {
	          return proto;
	        }
	        proto = getPrototypeOf(proto);
	      }
	      // must not return null, or we lose our invariant above
	      // in this case, a super() call was invoked where no superclass
	      // method exists
	      // TODO(sjmiles): thow an exception?
	      return Object;
	    }
	
	    // NOTE: In some platforms (IE10) the prototype chain is faked via
	    // __proto__. Therefore, always get prototype via __proto__ instead of
	    // the more standard Object.getPrototypeOf.
	    function getPrototypeOf(prototype) {
	      return prototype.__proto__;
	    }
	
	    // utility function to precompute name tags for functions
	    // in a (unchained) prototype
	    function hintSuper(prototype) {
	      // tag functions with their prototype name to optimize
	      // super call invocations
	      for (var n in prototype) {
	        var pd = Object.getOwnPropertyDescriptor(prototype, n);
	        if (pd && typeof pd.value === 'function') {
	          pd.value.nom = n;
	        }
	      }
	    }
	
	    // exports
	
	    scope.super = $super;
	
	})(Polymer);
	
	(function(scope) {
	
	  function noopHandler(value) {
	    return value;
	  }
	
	  // helper for deserializing properties of various types to strings
	  var typeHandlers = {
	    string: noopHandler,
	    'undefined': noopHandler,
	    date: function(value) {
	      return new Date(Date.parse(value) || Date.now());
	    },
	    boolean: function(value) {
	      if (value === '') {
	        return true;
	      }
	      return value === 'false' ? false : !!value;
	    },
	    number: function(value) {
	      var n = parseFloat(value);
	      // hex values like "0xFFFF" parseFloat as 0
	      if (n === 0) {
	        n = parseInt(value);
	      }
	      return isNaN(n) ? value : n;
	      // this code disabled because encoded values (like "0xFFFF")
	      // do not round trip to their original format
	      //return (String(floatVal) === value) ? floatVal : value;
	    },
	    object: function(value, currentValue) {
	      if (currentValue === null) {
	        return value;
	      }
	      try {
	        // If the string is an object, we can parse is with the JSON library.
	        // include convenience replace for single-quotes. If the author omits
	        // quotes altogether, parse will fail.
	        return JSON.parse(value.replace(/'/g, '"'));
	      } catch(e) {
	        // The object isn't valid JSON, return the raw value
	        return value;
	      }
	    },
	    // avoid deserialization of functions
	    'function': function(value, currentValue) {
	      return currentValue;
	    }
	  };
	
	  function deserializeValue(value, currentValue) {
	    // attempt to infer type from default value
	    var inferredType = typeof currentValue;
	    // invent 'date' type value for Date
	    if (currentValue instanceof Date) {
	      inferredType = 'date';
	    }
	    // delegate deserialization via type string
	    return typeHandlers[inferredType](value, currentValue);
	  }
	
	  // exports
	
	  scope.deserializeValue = deserializeValue;
	
	})(Polymer);
	
	(function(scope) {
	
	  // imports
	
	  var extend = scope.extend;
	
	  // module
	
	  var api = {};
	
	  api.declaration = {};
	  api.instance = {};
	
	  api.publish = function(apis, prototype) {
	    for (var n in apis) {
	      extend(prototype, apis[n]);
	    }
	  };
	
	  // exports
	
	  scope.api = api;
	
	})(Polymer);
	
	(function(scope) {
	
	  /**
	   * @class polymer-base
	   */
	
	  var utils = {
	
	    /**
	      * Invokes a function asynchronously. The context of the callback
	      * function is bound to 'this' automatically. Returns a handle which may
	      * be passed to <a href="#cancelAsync">cancelAsync</a> to cancel the
	      * asynchronous call.
	      *
	      * @method async
	      * @param {Function|String} method
	      * @param {any|Array} args
	      * @param {number} timeout
	      */
	    async: function(method, args, timeout) {
	      // when polyfilling Object.observe, ensure changes
	      // propagate before executing the async method
	      Polymer.flush();
	      // second argument to `apply` must be an array
	      args = (args && args.length) ? args : [args];
	      // function to invoke
	      var fn = function() {
	        (this[method] || method).apply(this, args);
	      }.bind(this);
	      // execute `fn` sooner or later
	      var handle = timeout ? setTimeout(fn, timeout) :
	          requestAnimationFrame(fn);
	      // NOTE: switch on inverting handle to determine which time is used.
	      return timeout ? handle : ~handle;
	    },
	
	    /**
	      * Cancels a pending callback that was scheduled via
	      * <a href="#async">async</a>.
	      *
	      * @method cancelAsync
	      * @param {handle} handle Handle of the `async` to cancel.
	      */
	    cancelAsync: function(handle) {
	      if (handle < 0) {
	        cancelAnimationFrame(~handle);
	      } else {
	        clearTimeout(handle);
	      }
	    },
	
	    /**
	      * Fire an event.
	      *
	      * @method fire
	      * @returns {Object} event
	      * @param {string} type An event name.
	      * @param {any} detail
	      * @param {Node} onNode Target node.
	      * @param {Boolean} bubbles Set false to prevent bubbling, defaults to true
	      * @param {Boolean} cancelable Set false to prevent cancellation, defaults to true
	      */
	    fire: function(type, detail, onNode, bubbles, cancelable) {
	      var node = onNode || this;
	      var detail = detail === null || detail === undefined ? {} : detail;
	      var event = new CustomEvent(type, {
	        bubbles: bubbles !== undefined ? bubbles : true,
	        cancelable: cancelable !== undefined ? cancelable : true,
	        detail: detail
	      });
	      node.dispatchEvent(event);
	      return event;
	    },
	
	    /**
	      * Fire an event asynchronously.
	      *
	      * @method asyncFire
	      * @param {string} type An event name.
	      * @param detail
	      * @param {Node} toNode Target node.
	      */
	    asyncFire: function(/*inType, inDetail*/) {
	      this.async("fire", arguments);
	    },
	
	    /**
	      * Remove class from old, add class to anew, if they exist.
	      *
	      * @param classFollows
	      * @param anew A node.
	      * @param old A node
	      * @param className
	      */
	    classFollows: function(anew, old, className) {
	      if (old) {
	        old.classList.remove(className);
	      }
	      if (anew) {
	        anew.classList.add(className);
	      }
	    },
	
	    /**
	      * Inject HTML which contains markup bound to this element into
	      * a target element (replacing target element content).
	      *
	      * @param String html to inject
	      * @param Element target element
	      */
	    injectBoundHTML: function(html, element) {
	      var template = document.createElement('template');
	      template.innerHTML = html;
	      var fragment = this.instanceTemplate(template);
	      if (element) {
	        element.textContent = '';
	        element.appendChild(fragment);
	      }
	      return fragment;
	    }
	  };
	
	  // no-operation function for handy stubs
	  var nop = function() {};
	
	  // null-object for handy stubs
	  var nob = {};
	
	  // deprecated
	
	  utils.asyncMethod = utils.async;
	
	  // exports
	
	  scope.api.instance.utils = utils;
	  scope.nop = nop;
	  scope.nob = nob;
	
	})(Polymer);
	
	(function(scope) {
	
	  // imports
	
	  var log = window.WebComponents ? WebComponents.flags.log : {};
	  var EVENT_PREFIX = 'on-';
	
	  // instance events api
	  var events = {
	    // read-only
	    EVENT_PREFIX: EVENT_PREFIX,
	    // event listeners on host
	    addHostListeners: function() {
	      var events = this.eventDelegates;
	      log.events && (Object.keys(events).length > 0) && console.log('[%s] addHostListeners:', this.localName, events);
	      // NOTE: host events look like bindings but really are not;
	      // (1) we don't want the attribute to be set and (2) we want to support
	      // multiple event listeners ('host' and 'instance') and Node.bind
	      // by default supports 1 thing being bound.
	      for (var type in events) {
	        var methodName = events[type];
	        PolymerGestures.addEventListener(this, type, this.element.getEventHandler(this, this, methodName));
	      }
	    },
	    // call 'method' or function method on 'obj' with 'args', if the method exists
	    dispatchMethod: function(obj, method, args) {
	      if (obj) {
	        log.events && console.group('[%s] dispatch [%s]', obj.localName, method);
	        var fn = typeof method === 'function' ? method : obj[method];
	        if (fn) {
	          fn[args ? 'apply' : 'call'](obj, args);
	        }
	        log.events && console.groupEnd();
	        // NOTE: dirty check right after calling method to ensure
	        // changes apply quickly; in a very complicated app using high
	        // frequency events, this can be a perf concern; in this case,
	        // imperative handlers can be used to avoid flushing.
	        Polymer.flush();
	      }
	    }
	  };
	
	  // exports
	
	  scope.api.instance.events = events;
	
	  /**
	   * @class Polymer
	   */
	
	  /**
	   * Add a gesture aware event handler to the given `node`. Can be used
	   * in place of `element.addEventListener` and ensures gestures will function
	   * as expected on mobile platforms. Please note that Polymer's declarative
	   * event handlers include this functionality by default.
	   *
	   * @method addEventListener
	   * @param {Node} node node on which to listen
	   * @param {String} eventType name of the event
	   * @param {Function} handlerFn event handler function
	   * @param {Boolean} capture set to true to invoke event capturing
	   * @type Function
	   */
	  // alias PolymerGestures event listener logic
	  scope.addEventListener = function(node, eventType, handlerFn, capture) {
	    PolymerGestures.addEventListener(wrap(node), eventType, handlerFn, capture);
	  };
	
	  /**
	   * Remove a gesture aware event handler on the given `node`. To remove an
	   * event listener, the exact same arguments are required that were passed
	   * to `Polymer.addEventListener`.
	   *
	   * @method removeEventListener
	   * @param {Node} node node on which to listen
	   * @param {String} eventType name of the event
	   * @param {Function} handlerFn event handler function
	   * @param {Boolean} capture set to true to invoke event capturing
	   * @type Function
	   */
	  scope.removeEventListener = function(node, eventType, handlerFn, capture) {
	    PolymerGestures.removeEventListener(wrap(node), eventType, handlerFn, capture);
	  };
	
	})(Polymer);
	
	(function(scope) {
	
	  // instance api for attributes
	
	  var attributes = {
	    // copy attributes defined in the element declaration to the instance
	    // e.g. <polymer-element name="x-foo" tabIndex="0"> tabIndex is copied
	    // to the element instance here.
	    copyInstanceAttributes: function () {
	      var a$ = this._instanceAttributes;
	      for (var k in a$) {
	        if (!this.hasAttribute(k)) {
	          this.setAttribute(k, a$[k]);
	        }
	      }
	    },
	    // for each attribute on this, deserialize value to property as needed
	    takeAttributes: function() {
	      // if we have no publish lookup table, we have no attributes to take
	      // TODO(sjmiles): ad hoc
	      if (this._publishLC) {
	        for (var i=0, a$=this.attributes, l=a$.length, a; (a=a$[i]) && i<l; i++) {
	          this.attributeToProperty(a.name, a.value);
	        }
	      }
	    },
	    // if attribute 'name' is mapped to a property, deserialize
	    // 'value' into that property
	    attributeToProperty: function(name, value) {
	      // try to match this attribute to a property (attributes are
	      // all lower-case, so this is case-insensitive search)
	      var name = this.propertyForAttribute(name);
	      if (name) {
	        // filter out 'mustached' values, these are to be
	        // replaced with bound-data and are not yet values
	        // themselves
	        if (value && value.search(scope.bindPattern) >= 0) {
	          return;
	        }
	        // get original value
	        var currentValue = this[name];
	        // deserialize Boolean or Number values from attribute
	        var value = this.deserializeValue(value, currentValue);
	        // only act if the value has changed
	        if (value !== currentValue) {
	          // install new value (has side-effects)
	          this[name] = value;
	        }
	      }
	    },
	    // return the published property matching name, or undefined
	    propertyForAttribute: function(name) {
	      var match = this._publishLC && this._publishLC[name];
	      return match;
	    },
	    // convert representation of `stringValue` based on type of `currentValue`
	    deserializeValue: function(stringValue, currentValue) {
	      return scope.deserializeValue(stringValue, currentValue);
	    },
	    // convert to a string value based on the type of `inferredType`
	    serializeValue: function(value, inferredType) {
	      if (inferredType === 'boolean') {
	        return value ? '' : undefined;
	      } else if (inferredType !== 'object' && inferredType !== 'function'
	          && value !== undefined) {
	        return value;
	      }
	    },
	    // serializes `name` property value and updates the corresponding attribute
	    // note that reflection is opt-in.
	    reflectPropertyToAttribute: function(name) {
	      var inferredType = typeof this[name];
	      // try to intelligently serialize property value
	      var serializedValue = this.serializeValue(this[name], inferredType);
	      // boolean properties must reflect as boolean attributes
	      if (serializedValue !== undefined) {
	        this.setAttribute(name, serializedValue);
	        // TODO(sorvell): we should remove attr for all properties
	        // that have undefined serialization; however, we will need to
	        // refine the attr reflection system to achieve this; pica, for example,
	        // relies on having inferredType object properties not removed as
	        // attrs.
	      } else if (inferredType === 'boolean') {
	        this.removeAttribute(name);
	      }
	    }
	  };
	
	  // exports
	
	  scope.api.instance.attributes = attributes;
	
	})(Polymer);
	
	(function(scope) {
	
	  /**
	   * @class polymer-base
	   */
	
	  // imports
	
	  var log = window.WebComponents ? WebComponents.flags.log : {};
	
	  // magic words
	
	  var OBSERVE_SUFFIX = 'Changed';
	
	  // element api
	
	  var empty = [];
	
	  var updateRecord = {
	    object: undefined,
	    type: 'update',
	    name: undefined,
	    oldValue: undefined
	  };
	
	  var numberIsNaN = Number.isNaN || function(value) {
	    return typeof value === 'number' && isNaN(value);
	  };
	
	  function areSameValue(left, right) {
	    if (left === right)
	      return left !== 0 || 1 / left === 1 / right;
	    if (numberIsNaN(left) && numberIsNaN(right))
	      return true;
	    return left !== left && right !== right;
	  }
	
	  // capture A's value if B's value is null or undefined,
	  // otherwise use B's value
	  function resolveBindingValue(oldValue, value) {
	    if (value === undefined && oldValue === null) {
	      return value;
	    }
	    return (value === null || value === undefined) ? oldValue : value;
	  }
	
	  var properties = {
	
	    // creates a CompoundObserver to observe property changes
	    // NOTE, this is only done there are any properties in the `observe` object
	    createPropertyObserver: function() {
	      var n$ = this._observeNames;
	      if (n$ && n$.length) {
	        var o = this._propertyObserver = new CompoundObserver(true);
	        this.registerObserver(o);
	        // TODO(sorvell): may not be kosher to access the value here (this[n]);
	        // previously we looked at the descriptor on the prototype
	        // this doesn't work for inheritance and not for accessors without
	        // a value property
	        for (var i=0, l=n$.length, n; (i<l) && (n=n$[i]); i++) {
	          o.addPath(this, n);
	          this.observeArrayValue(n, this[n], null);
	        }
	      }
	    },
	
	    // start observing property changes
	    openPropertyObserver: function() {
	      if (this._propertyObserver) {
	        this._propertyObserver.open(this.notifyPropertyChanges, this);
	      }
	    },
	
	    // handler for property changes; routes changes to observing methods
	    // note: array valued properties are observed for array splices
	    notifyPropertyChanges: function(newValues, oldValues, paths) {
	      var name, method, called = {};
	      for (var i in oldValues) {
	        // note: paths is of form [object, path, object, path]
	        name = paths[2 * i + 1];
	        method = this.observe[name];
	        if (method) {
	          var ov = oldValues[i], nv = newValues[i];
	          // observes the value if it is an array
	          this.observeArrayValue(name, nv, ov);
	          if (!called[method]) {
	            // only invoke change method if one of ov or nv is not (undefined | null)
	            if ((ov !== undefined && ov !== null) || (nv !== undefined && nv !== null)) {
	              called[method] = true;
	              // TODO(sorvell): call method with the set of values it's expecting;
	              // e.g. 'foo bar': 'invalidate' expects the new and old values for
	              // foo and bar. Currently we give only one of these and then
	              // deliver all the arguments.
	              this.invokeMethod(method, [ov, nv, arguments]);
	            }
	          }
	        }
	      }
	    },
	
	    // call method iff it exists.
	    invokeMethod: function(method, args) {
	      var fn = this[method] || method;
	      if (typeof fn === 'function') {
	        fn.apply(this, args);
	      }
	    },
	
	    /**
	     * Force any pending property changes to synchronously deliver to
	     * handlers specified in the `observe` object.
	     * Note, normally changes are processed at microtask time.
	     *
	     * @method deliverChanges
	     */
	    deliverChanges: function() {
	      if (this._propertyObserver) {
	        this._propertyObserver.deliver();
	      }
	    },
	
	    observeArrayValue: function(name, value, old) {
	      // we only care if there are registered side-effects
	      var callbackName = this.observe[name];
	      if (callbackName) {
	        // if we are observing the previous value, stop
	        if (Array.isArray(old)) {
	          log.observe && console.log('[%s] observeArrayValue: unregister observer [%s]', this.localName, name);
	          this.closeNamedObserver(name + '__array');
	        }
	        // if the new value is an array, being observing it
	        if (Array.isArray(value)) {
	          log.observe && console.log('[%s] observeArrayValue: register observer [%s]', this.localName, name, value);
	          var observer = new ArrayObserver(value);
	          observer.open(function(splices) {
	            this.invokeMethod(callbackName, [splices]);
	          }, this);
	          this.registerNamedObserver(name + '__array', observer);
	        }
	      }
	    },
	
	    emitPropertyChangeRecord: function(name, value, oldValue) {
	      var object = this;
	      if (areSameValue(value, oldValue)) {
	        return;
	      }
	      // invoke property change side effects
	      this._propertyChanged(name, value, oldValue);
	      // emit change record
	      if (!Observer.hasObjectObserve) {
	        return;
	      }
	      var notifier = this._objectNotifier;
	      if (!notifier) {
	        notifier = this._objectNotifier = Object.getNotifier(this);
	      }
	      updateRecord.object = this;
	      updateRecord.name = name;
	      updateRecord.oldValue = oldValue;
	      notifier.notify(updateRecord);
	    },
	
	    _propertyChanged: function(name, value, oldValue) {
	      if (this.reflect[name]) {
	        this.reflectPropertyToAttribute(name);
	      }
	    },
	
	    // creates a property binding (called via bind) to a published property.
	    bindProperty: function(property, observable, oneTime) {
	      if (oneTime) {
	        this[property] = observable;
	        return;
	      }
	      var computed = this.element.prototype.computed;
	      // Binding an "out-only" value to a computed property. Note that
	      // since this observer isn't opened, it doesn't need to be closed on
	      // cleanup.
	      if (computed && computed[property]) {
	        var privateComputedBoundValue = property + 'ComputedBoundObservable_';
	        this[privateComputedBoundValue] = observable;
	        return;
	      }
	      return this.bindToAccessor(property, observable, resolveBindingValue);
	    },
	
	    // NOTE property `name` must be published. This makes it an accessor.
	    bindToAccessor: function(name, observable, resolveFn) {
	      var privateName = name + '_';
	      var privateObservable  = name + 'Observable_';
	      // Present for properties which are computed and published and have a
	      // bound value.
	      var privateComputedBoundValue = name + 'ComputedBoundObservable_';
	      this[privateObservable] = observable;
	      var oldValue = this[privateName];
	      // observable callback
	      var self = this;
	      function updateValue(value, oldValue) {
	        self[privateName] = value;
	        var setObserveable = self[privateComputedBoundValue];
	        if (setObserveable && typeof setObserveable.setValue == 'function') {
	          setObserveable.setValue(value);
	        }
	        self.emitPropertyChangeRecord(name, value, oldValue);
	      }
	      // resolve initial value
	      var value = observable.open(updateValue);
	      if (resolveFn && !areSameValue(oldValue, value)) {
	        var resolvedValue = resolveFn(oldValue, value);
	        if (!areSameValue(value, resolvedValue)) {
	          value = resolvedValue;
	          if (observable.setValue) {
	            observable.setValue(value);
	          }
	        }
	      }
	      updateValue(value, oldValue);
	      // register and return observable
	      var observer = {
	        close: function() {
	          observable.close();
	          self[privateObservable] = undefined;
	          self[privateComputedBoundValue] = undefined;
	        }
	      };
	      this.registerObserver(observer);
	      return observer;
	    },
	
	    createComputedProperties: function() {
	      if (!this._computedNames) {
	        return;
	      }
	      for (var i = 0; i < this._computedNames.length; i++) {
	        var name = this._computedNames[i];
	        var expressionText = this.computed[name];
	        try {
	          var expression = PolymerExpressions.getExpression(expressionText);
	          var observable = expression.getBinding(this, this.element.syntax);
	          this.bindToAccessor(name, observable);
	        } catch (ex) {
	          console.error('Failed to create computed property', ex);
	        }
	      }
	    },
	
	    // property bookkeeping
	    registerObserver: function(observer) {
	      if (!this._observers) {
	        this._observers = [observer];
	        return;
	      }
	      this._observers.push(observer);
	    },
	
	    closeObservers: function() {
	      if (!this._observers) {
	        return;
	      }
	      // observer array items are arrays of observers.
	      var observers = this._observers;
	      for (var i = 0; i < observers.length; i++) {
	        var observer = observers[i];
	        if (observer && typeof observer.close == 'function') {
	          observer.close();
	        }
	      }
	      this._observers = [];
	    },
	
	    // bookkeeping observers for memory management
	    registerNamedObserver: function(name, observer) {
	      var o$ = this._namedObservers || (this._namedObservers = {});
	      o$[name] = observer;
	    },
	
	    closeNamedObserver: function(name) {
	      var o$ = this._namedObservers;
	      if (o$ && o$[name]) {
	        o$[name].close();
	        o$[name] = null;
	        return true;
	      }
	    },
	
	    closeNamedObservers: function() {
	      if (this._namedObservers) {
	        for (var i in this._namedObservers) {
	          this.closeNamedObserver(i);
	        }
	        this._namedObservers = {};
	      }
	    }
	
	  };
	
	  // logging
	  var LOG_OBSERVE = '[%s] watching [%s]';
	  var LOG_OBSERVED = '[%s#%s] watch: [%s] now [%s] was [%s]';
	  var LOG_CHANGED = '[%s#%s] propertyChanged: [%s] now [%s] was [%s]';
	
	  // exports
	
	  scope.api.instance.properties = properties;
	
	})(Polymer);
	
	(function(scope) {
	
	  /**
	   * @class polymer-base
	   */
	
	  // imports
	
	  var log = window.WebComponents ? WebComponents.flags.log : {};
	
	  // element api supporting mdv
	  var mdv = {
	
	    /**
	     * Creates dom cloned from the given template, instantiating bindings
	     * with this element as the template model and `PolymerExpressions` as the
	     * binding delegate.
	     *
	     * @method instanceTemplate
	     * @param {Template} template source template from which to create dom.
	     */
	    instanceTemplate: function(template) {
	      // ensure template is decorated (lets' things like <tr template ...> work)
	      HTMLTemplateElement.decorate(template);
	      // ensure a default bindingDelegate
	      var syntax = this.syntax || (!template.bindingDelegate &&
	          this.element.syntax);
	      var dom = template.createInstance(this, syntax);
	      var observers = dom.bindings_;
	      for (var i = 0; i < observers.length; i++) {
	        this.registerObserver(observers[i]);
	      }
	      return dom;
	    },
	
	    // Called by TemplateBinding/NodeBind to setup a binding to the given
	    // property. It's overridden here to support property bindings
	    // in addition to attribute bindings that are supported by default.
	    bind: function(name, observable, oneTime) {
	      var property = this.propertyForAttribute(name);
	      if (!property) {
	        // TODO(sjmiles): this mixin method must use the special form
	        // of `super` installed by `mixinMethod` in declaration/prototype.js
	        return this.mixinSuper(arguments);
	      } else {
	        // use n-way Polymer binding
	        var observer = this.bindProperty(property, observable, oneTime);
	        // NOTE: reflecting binding information is typically required only for
	        // tooling. It has a performance cost so it's opt-in in Node.bind.
	        if (Platform.enableBindingsReflection && observer) {
	          observer.path = observable.path_;
	          this._recordBinding(property, observer);
	        }
	        if (this.reflect[property]) {
	          this.reflectPropertyToAttribute(property);
	        }
	        return observer;
	      }
	    },
	
	    _recordBinding: function(name, observer) {
	      this.bindings_ = this.bindings_ || {};
	      this.bindings_[name] = observer;
	    },
	
	    // Called by TemplateBinding when all bindings on an element have been
	    // executed. This signals that all element inputs have been gathered
	    // and it's safe to ready the element, create shadow-root and start
	    // data-observation.
	    bindFinished: function() {
	      this.makeElementReady();
	    },
	
	    // called at detached time to signal that an element's bindings should be
	    // cleaned up. This is done asynchronously so that users have the chance
	    // to call `cancelUnbindAll` to prevent unbinding.
	    asyncUnbindAll: function() {
	      if (!this._unbound) {
	        log.unbind && console.log('[%s] asyncUnbindAll', this.localName);
	        this._unbindAllJob = this.job(this._unbindAllJob, this.unbindAll, 0);
	      }
	    },
	
	    /**
	     * This method should rarely be used and only if
	     * <a href="#cancelUnbindAll">`cancelUnbindAll`</a> has been called to
	     * prevent element unbinding. In this case, the element's bindings will
	     * not be automatically cleaned up and it cannot be garbage collected
	     * by the system. If memory pressure is a concern or a
	     * large amount of elements need to be managed in this way, `unbindAll`
	     * can be called to deactivate the element's bindings and allow its
	     * memory to be reclaimed.
	     *
	     * @method unbindAll
	     */
	    unbindAll: function() {
	      if (!this._unbound) {
	        this.closeObservers();
	        this.closeNamedObservers();
	        this._unbound = true;
	      }
	    },
	
	    /**
	     * Call in `detached` to prevent the element from unbinding when it is
	     * detached from the dom. The element is unbound as a cleanup step that
	     * allows its memory to be reclaimed.
	     * If `cancelUnbindAll` is used, consider calling
	     * <a href="#unbindAll">`unbindAll`</a> when the element is no longer
	     * needed. This will allow its memory to be reclaimed.
	     *
	     * @method cancelUnbindAll
	     */
	    cancelUnbindAll: function() {
	      if (this._unbound) {
	        log.unbind && console.warn('[%s] already unbound, cannot cancel unbindAll', this.localName);
	        return;
	      }
	      log.unbind && console.log('[%s] cancelUnbindAll', this.localName);
	      if (this._unbindAllJob) {
	        this._unbindAllJob = this._unbindAllJob.stop();
	      }
	    }
	
	  };
	
	  function unbindNodeTree(node) {
	    forNodeTree(node, _nodeUnbindAll);
	  }
	
	  function _nodeUnbindAll(node) {
	    node.unbindAll();
	  }
	
	  function forNodeTree(node, callback) {
	    if (node) {
	      callback(node);
	      for (var child = node.firstChild; child; child = child.nextSibling) {
	        forNodeTree(child, callback);
	      }
	    }
	  }
	
	  var mustachePattern = /\{\{([^{}]*)}}/;
	
	  // exports
	
	  scope.bindPattern = mustachePattern;
	  scope.api.instance.mdv = mdv;
	
	})(Polymer);
	
	(function(scope) {
	
	  /**
	   * Common prototype for all Polymer Elements.
	   *
	   * @class polymer-base
	   * @homepage polymer.github.io
	   */
	  var base = {
	    /**
	     * Tags this object as the canonical Base prototype.
	     *
	     * @property PolymerBase
	     * @type boolean
	     * @default true
	     */
	    PolymerBase: true,
	
	    /**
	     * Debounce signals.
	     *
	     * Call `job` to defer a named signal, and all subsequent matching signals,
	     * until a wait time has elapsed with no new signal.
	     *
	     *     debouncedClickAction: function(e) {
	     *       // processClick only when it's been 100ms since the last click
	     *       this.job('click', function() {
	     *        this.processClick;
	     *       }, 100);
	     *     }
	     *
	     * @method job
	     * @param String {String} job A string identifier for the job to debounce.
	     * @param Function {Function} callback A function that is called (with `this` context) when the wait time elapses.
	     * @param Number {Number} wait Time in milliseconds (ms) after the last signal that must elapse before invoking `callback`
	     * @type Handle
	     */
	    job: function(job, callback, wait) {
	      if (typeof job === 'string') {
	        var n = '___' + job;
	        this[n] = Polymer.job.call(this, this[n], callback, wait);
	      } else {
	        // TODO(sjmiles): suggest we deprecate this call signature
	        return Polymer.job.call(this, job, callback, wait);
	      }
	    },
	
	    /**
	     * Invoke a superclass method.
	     *
	     * Use `super()` to invoke the most recently overridden call to the
	     * currently executing function.
	     *
	     * To pass arguments through, use the literal `arguments` as the parameter
	     * to `super()`.
	     *
	     *     nextPageAction: function(e) {
	     *       // invoke the superclass version of `nextPageAction`
	     *       this.super(arguments);
	     *     }
	     *
	     * To pass custom arguments, arrange them in an array.
	     *
	     *     appendSerialNo: function(value, serial) {
	     *       // prefix the superclass serial number with our lot # before
	     *       // invoking the superlcass
	     *       return this.super([value, this.lotNo + serial])
	     *     }
	     *
	     * @method super
	     * @type Any
	     * @param {args) An array of arguments to use when calling the superclass method, or null.
	     */
	    super: Polymer.super,
	
	    /**
	     * Lifecycle method called when the element is instantiated.
	     *
	     * Override `created` to perform custom create-time tasks. No need to call
	     * super-class `created` unless you are extending another Polymer element.
	     * Created is called before the element creates `shadowRoot` or prepares
	     * data-observation.
	     *
	     * @method created
	     * @type void
	     */
	    created: function() {
	    },
	
	    /**
	     * Lifecycle method called when the element has populated it's `shadowRoot`,
	     * prepared data-observation, and made itself ready for API interaction.
	     *
	     * @method ready
	     * @type void
	     */
	    ready: function() {
	    },
	
	    /**
	     * Low-level lifecycle method called as part of standard Custom Elements
	     * operation. Polymer implements this method to provide basic default
	     * functionality. For custom create-time tasks, implement `created`
	     * instead, which is called immediately after `createdCallback`.
	     *
	     * @method createdCallback
	     */
	    createdCallback: function() {
	      if (this.templateInstance && this.templateInstance.model) {
	        console.warn('Attributes on ' + this.localName + ' were data bound ' +
	            'prior to Polymer upgrading the element. This may result in ' +
	            'incorrect binding types.');
	      }
	      this.created();
	      this.prepareElement();
	      if (!this.ownerDocument.isStagingDocument) {
	        this.makeElementReady();
	      }
	    },
	
	    // system entry point, do not override
	    prepareElement: function() {
	      if (this._elementPrepared) {
	        console.warn('Element already prepared', this.localName);
	        return;
	      }
	      this._elementPrepared = true;
	      // storage for shadowRoots info
	      this.shadowRoots = {};
	      // install property observers
	      this.createPropertyObserver();
	      this.openPropertyObserver();
	      // install boilerplate attributes
	      this.copyInstanceAttributes();
	      // process input attributes
	      this.takeAttributes();
	      // add event listeners
	      this.addHostListeners();
	    },
	
	    // system entry point, do not override
	    makeElementReady: function() {
	      if (this._readied) {
	        return;
	      }
	      this._readied = true;
	      this.createComputedProperties();
	      this.parseDeclarations(this.__proto__);
	      // NOTE: Support use of the `unresolved` attribute to help polyfill
	      // custom elements' `:unresolved` feature.
	      this.removeAttribute('unresolved');
	      // user entry point
	      this.ready();
	    },
	
	    /**
	     * Low-level lifecycle method called as part of standard Custom Elements
	     * operation. Polymer implements this method to provide basic default
	     * functionality. For custom tasks in your element, implement `attributeChanged`
	     * instead, which is called immediately after `attributeChangedCallback`.
	     *
	     * @method attributeChangedCallback
	     */
	    attributeChangedCallback: function(name, oldValue) {
	      // TODO(sjmiles): adhoc filter
	      if (name !== 'class' && name !== 'style') {
	        this.attributeToProperty(name, this.getAttribute(name));
	      }
	      if (this.attributeChanged) {
	        this.attributeChanged.apply(this, arguments);
	      }
	    },
	
	    /**
	     * Low-level lifecycle method called as part of standard Custom Elements
	     * operation. Polymer implements this method to provide basic default
	     * functionality. For custom create-time tasks, implement `attached`
	     * instead, which is called immediately after `attachedCallback`.
	     *
	     * @method attachedCallback
	     */
	     attachedCallback: function() {
	      // when the element is attached, prevent it from unbinding.
	      this.cancelUnbindAll();
	      // invoke user action
	      if (this.attached) {
	        this.attached();
	      }
	      if (!this.hasBeenAttached) {
	        this.hasBeenAttached = true;
	        if (this.domReady) {
	          this.async('domReady');
	        }
	      }
	    },
	
	     /**
	     * Implement to access custom elements in dom descendants, ancestors,
	     * or siblings. Because custom elements upgrade in document order,
	     * elements accessed in `ready` or `attached` may not be upgraded. When
	     * `domReady` is called, all registered custom elements are guaranteed
	     * to have been upgraded.
	     *
	     * @method domReady
	     */
	
	    /**
	     * Low-level lifecycle method called as part of standard Custom Elements
	     * operation. Polymer implements this method to provide basic default
	     * functionality. For custom create-time tasks, implement `detached`
	     * instead, which is called immediately after `detachedCallback`.
	     *
	     * @method detachedCallback
	     */
	    detachedCallback: function() {
	      if (!this.preventDispose) {
	        this.asyncUnbindAll();
	      }
	      // invoke user action
	      if (this.detached) {
	        this.detached();
	      }
	      // TODO(sorvell): bc
	      if (this.leftView) {
	        this.leftView();
	      }
	    },
	
	    /**
	     * Walks the prototype-chain of this element and allows specific
	     * classes a chance to process static declarations.
	     *
	     * In particular, each polymer-element has it's own `template`.
	     * `parseDeclarations` is used to accumulate all element `template`s
	     * from an inheritance chain.
	     *
	     * `parseDeclaration` static methods implemented in the chain are called
	     * recursively, oldest first, with the `<polymer-element>` associated
	     * with the current prototype passed as an argument.
	     *
	     * An element may override this method to customize shadow-root generation.
	     *
	     * @method parseDeclarations
	     */
	    parseDeclarations: function(p) {
	      if (p && p.element) {
	        this.parseDeclarations(p.__proto__);
	        p.parseDeclaration.call(this, p.element);
	      }
	    },
	
	    /**
	     * Perform init-time actions based on static information in the
	     * `<polymer-element>` instance argument.
	     *
	     * For example, the standard implementation locates the template associated
	     * with the given `<polymer-element>` and stamps it into a shadow-root to
	     * implement shadow inheritance.
	     *
	     * An element may override this method for custom behavior.
	     *
	     * @method parseDeclaration
	     */
	    parseDeclaration: function(elementElement) {
	      var template = this.fetchTemplate(elementElement);
	      if (template) {
	        var root = this.shadowFromTemplate(template);
	        this.shadowRoots[elementElement.name] = root;
	      }
	    },
	
	    /**
	     * Given a `<polymer-element>`, find an associated template (if any) to be
	     * used for shadow-root generation.
	     *
	     * An element may override this method for custom behavior.
	     *
	     * @method fetchTemplate
	     */
	    fetchTemplate: function(elementElement) {
	      return elementElement.querySelector('template');
	    },
	
	    /**
	     * Create a shadow-root in this host and stamp `template` as it's
	     * content.
	     *
	     * An element may override this method for custom behavior.
	     *
	     * @method shadowFromTemplate
	     */
	    shadowFromTemplate: function(template) {
	      if (template) {
	        // make a shadow root
	        var root = this.createShadowRoot();
	        // stamp template
	        // which includes parsing and applying MDV bindings before being
	        // inserted (to avoid {{}} in attribute values)
	        // e.g. to prevent <img src="images/{{icon}}"> from generating a 404.
	        var dom = this.instanceTemplate(template);
	        // append to shadow dom
	        root.appendChild(dom);
	        // perform post-construction initialization tasks on shadow root
	        this.shadowRootReady(root, template);
	        // return the created shadow root
	        return root;
	      }
	    },
	
	    // utility function that stamps a <template> into light-dom
	    lightFromTemplate: function(template, refNode) {
	      if (template) {
	        // TODO(sorvell): mark this element as an eventController so that
	        // event listeners on bound nodes inside it will be called on it.
	        // Note, the expectation here is that events on all descendants
	        // should be handled by this element.
	        this.eventController = this;
	        // stamp template
	        // which includes parsing and applying MDV bindings before being
	        // inserted (to avoid {{}} in attribute values)
	        // e.g. to prevent <img src="images/{{icon}}"> from generating a 404.
	        var dom = this.instanceTemplate(template);
	        // append to shadow dom
	        if (refNode) {
	          this.insertBefore(dom, refNode);
	        } else {
	          this.appendChild(dom);
	        }
	        // perform post-construction initialization tasks on ahem, light root
	        this.shadowRootReady(this);
	        // return the created shadow root
	        return dom;
	      }
	    },
	
	    shadowRootReady: function(root) {
	      // locate nodes with id and store references to them in this.$ hash
	      this.marshalNodeReferences(root);
	    },
	
	    // locate nodes with id and store references to them in this.$ hash
	    marshalNodeReferences: function(root) {
	      // establish $ instance variable
	      var $ = this.$ = this.$ || {};
	      // populate $ from nodes with ID from the LOCAL tree
	      if (root) {
	        var n$ = root.querySelectorAll("[id]");
	        for (var i=0, l=n$.length, n; (i<l) && (n=n$[i]); i++) {
	          $[n.id] = n;
	        };
	      }
	    },
	
	    /**
	     * Register a one-time callback when a child-list or sub-tree mutation
	     * occurs on node.
	     *
	     * For persistent callbacks, call onMutation from your listener.
	     *
	     * @method onMutation
	     * @param Node {Node} node Node to watch for mutations.
	     * @param Function {Function} listener Function to call on mutation. The function is invoked as `listener.call(this, observer, mutations);` where `observer` is the MutationObserver that triggered the notification, and `mutations` is the native mutation list.
	     */
	    onMutation: function(node, listener) {
	      var observer = new MutationObserver(function(mutations) {
	        listener.call(this, observer, mutations);
	        observer.disconnect();
	      }.bind(this));
	      observer.observe(node, {childList: true, subtree: true});
	    }
	  };
	
	  /**
	   * @class Polymer
	   */
	
	  /**
	   * Returns true if the object includes <a href="#polymer-base">polymer-base</a> in it's prototype chain.
	   *
	   * @method isBase
	   * @param Object {Object} object Object to test.
	   * @type Boolean
	   */
	  function isBase(object) {
	    return object.hasOwnProperty('PolymerBase')
	  }
	
	  // name a base constructor for dev tools
	
	  /**
	   * The Polymer base-class constructor.
	   *
	   * @property Base
	   * @type Function
	   */
	  function PolymerBase() {};
	  PolymerBase.prototype = base;
	  base.constructor = PolymerBase;
	
	  // exports
	
	  scope.Base = PolymerBase;
	  scope.isBase = isBase;
	  scope.api.instance.base = base;
	
	})(Polymer);
	
	(function(scope) {
	
	  // imports
	
	  var log = window.WebComponents ? WebComponents.flags.log : {};
	  var hasShadowDOMPolyfill = window.ShadowDOMPolyfill;
	
	  // magic words
	
	  var STYLE_SCOPE_ATTRIBUTE = 'element';
	  var STYLE_CONTROLLER_SCOPE = 'controller';
	
	  var styles = {
	    STYLE_SCOPE_ATTRIBUTE: STYLE_SCOPE_ATTRIBUTE,
	    /**
	     * Installs external stylesheets and <style> elements with the attribute
	     * polymer-scope='controller' into the scope of element. This is intended
	     * to be a called during custom element construction.
	    */
	    installControllerStyles: function() {
	      // apply controller styles, but only if they are not yet applied
	      var scope = this.findStyleScope();
	      if (scope && !this.scopeHasNamedStyle(scope, this.localName)) {
	        // allow inherited controller styles
	        var proto = getPrototypeOf(this), cssText = '';
	        while (proto && proto.element) {
	          cssText += proto.element.cssTextForScope(STYLE_CONTROLLER_SCOPE);
	          proto = getPrototypeOf(proto);
	        }
	        if (cssText) {
	          this.installScopeCssText(cssText, scope);
	        }
	      }
	    },
	    installScopeStyle: function(style, name, scope) {
	      var scope = scope || this.findStyleScope(), name = name || '';
	      if (scope && !this.scopeHasNamedStyle(scope, this.localName + name)) {
	        var cssText = '';
	        if (style instanceof Array) {
	          for (var i=0, l=style.length, s; (i<l) && (s=style[i]); i++) {
	            cssText += s.textContent + '\n\n';
	          }
	        } else {
	          cssText = style.textContent;
	        }
	        this.installScopeCssText(cssText, scope, name);
	      }
	    },
	    installScopeCssText: function(cssText, scope, name) {
	      scope = scope || this.findStyleScope();
	      name = name || '';
	      if (!scope) {
	        return;
	      }
	      if (hasShadowDOMPolyfill) {
	        cssText = shimCssText(cssText, scope.host);
	      }
	      var style = this.element.cssTextToScopeStyle(cssText,
	          STYLE_CONTROLLER_SCOPE);
	      Polymer.applyStyleToScope(style, scope);
	      // cache that this style has been applied
	      this.styleCacheForScope(scope)[this.localName + name] = true;
	    },
	    findStyleScope: function(node) {
	      // find the shadow root that contains this element
	      var n = node || this;
	      while (n.parentNode) {
	        n = n.parentNode;
	      }
	      return n;
	    },
	    scopeHasNamedStyle: function(scope, name) {
	      var cache = this.styleCacheForScope(scope);
	      return cache[name];
	    },
	    styleCacheForScope: function(scope) {
	      if (hasShadowDOMPolyfill) {
	        var scopeName = scope.host ? scope.host.localName : scope.localName;
	        return polyfillScopeStyleCache[scopeName] || (polyfillScopeStyleCache[scopeName] = {});
	      } else {
	        return scope._scopeStyles = (scope._scopeStyles || {});
	      }
	    }
	  };
	
	  var polyfillScopeStyleCache = {};
	
	  // NOTE: use raw prototype traversal so that we ensure correct traversal
	  // on platforms where the protoype chain is simulated via __proto__ (IE10)
	  function getPrototypeOf(prototype) {
	    return prototype.__proto__;
	  }
	
	  function shimCssText(cssText, host) {
	    var name = '', is = false;
	    if (host) {
	      name = host.localName;
	      is = host.hasAttribute('is');
	    }
	    var selector = WebComponents.ShadowCSS.makeScopeSelector(name, is);
	    return WebComponents.ShadowCSS.shimCssText(cssText, selector);
	  }
	
	  // exports
	
	  scope.api.instance.styles = styles;
	
	})(Polymer);
	
	(function(scope) {
	
	  // imports
	
	  var extend = scope.extend;
	  var api = scope.api;
	
	  // imperative implementation: Polymer()
	
	  // specify an 'own' prototype for tag `name`
	  function element(name, prototype) {
	    if (typeof name !== 'string') {
	      var script = prototype || document._currentScript;
	      prototype = name;
	      name = script && script.parentNode && script.parentNode.getAttribute ?
	          script.parentNode.getAttribute('name') : '';
	      if (!name) {
	        throw 'Element name could not be inferred.';
	      }
	    }
	    if (getRegisteredPrototype(name)) {
	      throw 'Already registered (Polymer) prototype for element ' + name;
	    }
	    // cache the prototype
	    registerPrototype(name, prototype);
	    // notify the registrar waiting for 'name', if any
	    notifyPrototype(name);
	  }
	
	  // async prototype source
	
	  function waitingForPrototype(name, client) {
	    waitPrototype[name] = client;
	  }
	
	  var waitPrototype = {};
	
	  function notifyPrototype(name) {
	    if (waitPrototype[name]) {
	      waitPrototype[name].registerWhenReady();
	      delete waitPrototype[name];
	    }
	  }
	
	  // utility and bookkeeping
	
	  // maps tag names to prototypes, as registered with
	  // Polymer. Prototypes associated with a tag name
	  // using document.registerElement are available from
	  // HTMLElement.getPrototypeForTag().
	  // If an element was fully registered by Polymer, then
	  // Polymer.getRegisteredPrototype(name) ===
	  //   HTMLElement.getPrototypeForTag(name)
	
	  var prototypesByName = {};
	
	  function registerPrototype(name, prototype) {
	    return prototypesByName[name] = prototype || {};
	  }
	
	  function getRegisteredPrototype(name) {
	    return prototypesByName[name];
	  }
	
	  function instanceOfType(element, type) {
	    if (typeof type !== 'string') {
	      return false;
	    }
	    var proto = HTMLElement.getPrototypeForTag(type);
	    var ctor = proto && proto.constructor;
	    if (!ctor) {
	      return false;
	    }
	    if (CustomElements.instanceof) {
	      return CustomElements.instanceof(element, ctor);
	    }
	    return element instanceof ctor;
	  }
	
	  // exports
	
	  scope.getRegisteredPrototype = getRegisteredPrototype;
	  scope.waitingForPrototype = waitingForPrototype;
	  scope.instanceOfType = instanceOfType;
	
	  // namespace shenanigans so we can expose our scope on the registration
	  // function
	
	  // make window.Polymer reference `element()`
	
	  window.Polymer = element;
	
	  // TODO(sjmiles): find a way to do this that is less terrible
	  // copy window.Polymer properties onto `element()`
	
	  extend(Polymer, scope);
	
	  // Under the HTMLImports polyfill, scripts in the main document
	  // do not block on imports; we want to allow calls to Polymer in the main
	  // document. WebComponents collects those calls until we can process them, which
	  // we do here.
	
	  if (WebComponents.consumeDeclarations) {
	    WebComponents.consumeDeclarations(function(declarations) {
	      if (declarations) {
	        for (var i=0, l=declarations.length, d; (i<l) && (d=declarations[i]); i++) {
	          element.apply(null, d);
	        }
	      }
	    });
	  }
	
	})(Polymer);
	
	(function(scope) {
	
	/**
	 * @class polymer-base
	 */
	
	 /**
	  * Resolve a url path to be relative to a `base` url. If unspecified, `base`
	  * defaults to the element's ownerDocument url. Can be used to resolve
	  * paths from element's in templates loaded in HTMLImports to be relative
	  * to the document containing the element. Polymer automatically does this for
	  * url attributes in element templates; however, if a url, for
	  * example, contains a binding, then `resolvePath` can be used to ensure it is
	  * relative to the element document. For example, in an element's template,
	  *
	  *     <a href="{{resolvePath(path)}}">Resolved</a>
	  *
	  * @method resolvePath
	  * @param {String} url Url path to resolve.
	  * @param {String} base Optional base url against which to resolve, defaults
	  * to the element's ownerDocument url.
	  * returns {String} resolved url.
	  */
	
	var path = {
	  resolveElementPaths: function(node) {
	    Polymer.urlResolver.resolveDom(node);
	  },
	  addResolvePathApi: function() {
	    // let assetpath attribute modify the resolve path
	    var assetPath = this.getAttribute('assetpath') || '';
	    var root = new URL(assetPath, this.ownerDocument.baseURI);
	    this.prototype.resolvePath = function(urlPath, base) {
	      var u = new URL(urlPath, base || root);
	      return u.href;
	    };
	  }
	};
	
	// exports
	scope.api.declaration.path = path;
	
	})(Polymer);
	
	(function(scope) {
	
	  // imports
	
	  var log = window.WebComponents ? WebComponents.flags.log : {};
	  var api = scope.api.instance.styles;
	  var STYLE_SCOPE_ATTRIBUTE = api.STYLE_SCOPE_ATTRIBUTE;
	
	  var hasShadowDOMPolyfill = window.ShadowDOMPolyfill;
	
	  // magic words
	
	  var STYLE_SELECTOR = 'style';
	  var STYLE_LOADABLE_MATCH = '@import';
	  var SHEET_SELECTOR = 'link[rel=stylesheet]';
	  var STYLE_GLOBAL_SCOPE = 'global';
	  var SCOPE_ATTR = 'polymer-scope';
	
	  var styles = {
	    // returns true if resources are loading
	    loadStyles: function(callback) {
	      var template = this.fetchTemplate();
	      var content = template && this.templateContent();
	      if (content) {
	        this.convertSheetsToStyles(content);
	        var styles = this.findLoadableStyles(content);
	        if (styles.length) {
	          var templateUrl = template.ownerDocument.baseURI;
	          return Polymer.styleResolver.loadStyles(styles, templateUrl, callback);
	        }
	      }
	      if (callback) {
	        callback();
	      }
	    },
	    convertSheetsToStyles: function(root) {
	      var s$ = root.querySelectorAll(SHEET_SELECTOR);
	      for (var i=0, l=s$.length, s, c; (i<l) && (s=s$[i]); i++) {
	        c = createStyleElement(importRuleForSheet(s, this.ownerDocument.baseURI),
	            this.ownerDocument);
	        this.copySheetAttributes(c, s);
	        s.parentNode.replaceChild(c, s);
	      }
	    },
	    copySheetAttributes: function(style, link) {
	      for (var i=0, a$=link.attributes, l=a$.length, a; (a=a$[i]) && i<l; i++) {
	        if (a.name !== 'rel' && a.name !== 'href') {
	          style.setAttribute(a.name, a.value);
	        }
	      }
	    },
	    findLoadableStyles: function(root) {
	      var loadables = [];
	      if (root) {
	        var s$ = root.querySelectorAll(STYLE_SELECTOR);
	        for (var i=0, l=s$.length, s; (i<l) && (s=s$[i]); i++) {
	          if (s.textContent.match(STYLE_LOADABLE_MATCH)) {
	            loadables.push(s);
	          }
	        }
	      }
	      return loadables;
	    },
	    /**
	     * Install external stylesheets loaded in <polymer-element> elements into the
	     * element's template.
	     * @param elementElement The <element> element to style.
	     */
	    installSheets: function() {
	      this.cacheSheets();
	      this.cacheStyles();
	      this.installLocalSheets();
	      this.installGlobalStyles();
	    },
	    /**
	     * Remove all sheets from element and store for later use.
	     */
	    cacheSheets: function() {
	      this.sheets = this.findNodes(SHEET_SELECTOR);
	      this.sheets.forEach(function(s) {
	        if (s.parentNode) {
	          s.parentNode.removeChild(s);
	        }
	      });
	    },
	    cacheStyles: function() {
	      this.styles = this.findNodes(STYLE_SELECTOR + '[' + SCOPE_ATTR + ']');
	      this.styles.forEach(function(s) {
	        if (s.parentNode) {
	          s.parentNode.removeChild(s);
	        }
	      });
	    },
	    /**
	     * Takes external stylesheets loaded in an <element> element and moves
	     * their content into a <style> element inside the <element>'s template.
	     * The sheet is then removed from the <element>. This is done only so
	     * that if the element is loaded in the main document, the sheet does
	     * not become active.
	     * Note, ignores sheets with the attribute 'polymer-scope'.
	     * @param elementElement The <element> element to style.
	     */
	    installLocalSheets: function () {
	      var sheets = this.sheets.filter(function(s) {
	        return !s.hasAttribute(SCOPE_ATTR);
	      });
	      var content = this.templateContent();
	      if (content) {
	        var cssText = '';
	        sheets.forEach(function(sheet) {
	          cssText += cssTextFromSheet(sheet) + '\n';
	        });
	        if (cssText) {
	          var style = createStyleElement(cssText, this.ownerDocument);
	          content.insertBefore(style, content.firstChild);
	        }
	      }
	    },
	    findNodes: function(selector, matcher) {
	      var nodes = this.querySelectorAll(selector).array();
	      var content = this.templateContent();
	      if (content) {
	        var templateNodes = content.querySelectorAll(selector).array();
	        nodes = nodes.concat(templateNodes);
	      }
	      return matcher ? nodes.filter(matcher) : nodes;
	    },
	    /**
	     * Promotes external stylesheets and <style> elements with the attribute
	     * polymer-scope='global' into global scope.
	     * This is particularly useful for defining @keyframe rules which
	     * currently do not function in scoped or shadow style elements.
	     * (See wkb.ug/72462)
	     * @param elementElement The <element> element to style.
	    */
	    // TODO(sorvell): remove when wkb.ug/72462 is addressed.
	    installGlobalStyles: function() {
	      var style = this.styleForScope(STYLE_GLOBAL_SCOPE);
	      applyStyleToScope(style, document.head);
	    },
	    cssTextForScope: function(scopeDescriptor) {
	      var cssText = '';
	      // handle stylesheets
	      var selector = '[' + SCOPE_ATTR + '=' + scopeDescriptor + ']';
	      var matcher = function(s) {
	        return matchesSelector(s, selector);
	      };
	      var sheets = this.sheets.filter(matcher);
	      sheets.forEach(function(sheet) {
	        cssText += cssTextFromSheet(sheet) + '\n\n';
	      });
	      // handle cached style elements
	      var styles = this.styles.filter(matcher);
	      styles.forEach(function(style) {
	        cssText += style.textContent + '\n\n';
	      });
	      return cssText;
	    },
	    styleForScope: function(scopeDescriptor) {
	      var cssText = this.cssTextForScope(scopeDescriptor);
	      return this.cssTextToScopeStyle(cssText, scopeDescriptor);
	    },
	    cssTextToScopeStyle: function(cssText, scopeDescriptor) {
	      if (cssText) {
	        var style = createStyleElement(cssText);
	        style.setAttribute(STYLE_SCOPE_ATTRIBUTE, this.getAttribute('name') +
	            '-' + scopeDescriptor);
	        return style;
	      }
	    }
	  };
	
	  function importRuleForSheet(sheet, baseUrl) {
	    var href = new URL(sheet.getAttribute('href'), baseUrl).href;
	    return '@import \'' + href + '\';';
	  }
	
	  function applyStyleToScope(style, scope) {
	    if (style) {
	      if (scope === document) {
	        scope = document.head;
	      }
	      if (hasShadowDOMPolyfill) {
	        scope = document.head;
	      }
	      // TODO(sorvell): necessary for IE
	      // see https://connect.microsoft.com/IE/feedback/details/790212/
	      // cloning-a-style-element-and-adding-to-document-produces
	      // -unexpected-result#details
	      // var clone = style.cloneNode(true);
	      var clone = createStyleElement(style.textContent);
	      var attr = style.getAttribute(STYLE_SCOPE_ATTRIBUTE);
	      if (attr) {
	        clone.setAttribute(STYLE_SCOPE_ATTRIBUTE, attr);
	      }
	      // TODO(sorvell): probably too brittle; try to figure out
	      // where to put the element.
	      var refNode = scope.firstElementChild;
	      if (scope === document.head) {
	        var selector = 'style[' + STYLE_SCOPE_ATTRIBUTE + ']';
	        var s$ = document.head.querySelectorAll(selector);
	        if (s$.length) {
	          refNode = s$[s$.length-1].nextElementSibling;
	        }
	      }
	      scope.insertBefore(clone, refNode);
	    }
	  }
	
	  function createStyleElement(cssText, scope) {
	    scope = scope || document;
	    scope = scope.createElement ? scope : scope.ownerDocument;
	    var style = scope.createElement('style');
	    style.textContent = cssText;
	    return style;
	  }
	
	  function cssTextFromSheet(sheet) {
	    return (sheet && sheet.__resource) || '';
	  }
	
	  function matchesSelector(node, inSelector) {
	    if (matches) {
	      return matches.call(node, inSelector);
	    }
	  }
	  var p = HTMLElement.prototype;
	  var matches = p.matches || p.matchesSelector || p.webkitMatchesSelector
	      || p.mozMatchesSelector;
	
	  // exports
	
	  scope.api.declaration.styles = styles;
	  scope.applyStyleToScope = applyStyleToScope;
	
	})(Polymer);
	
	(function(scope) {
	
	  // imports
	
	  var log = window.WebComponents ? WebComponents.flags.log : {};
	  var api = scope.api.instance.events;
	  var EVENT_PREFIX = api.EVENT_PREFIX;
	
	  var mixedCaseEventTypes = {};
	  [
	    'webkitAnimationStart',
	    'webkitAnimationEnd',
	    'webkitTransitionEnd',
	    'DOMFocusOut',
	    'DOMFocusIn',
	    'DOMMouseScroll'
	  ].forEach(function(e) {
	    mixedCaseEventTypes[e.toLowerCase()] = e;
	  });
	
	  // polymer-element declarative api: events feature
	  var events = {
	    parseHostEvents: function() {
	      // our delegates map
	      var delegates = this.prototype.eventDelegates;
	      // extract data from attributes into delegates
	      this.addAttributeDelegates(delegates);
	    },
	    addAttributeDelegates: function(delegates) {
	      // for each attribute
	      for (var i=0, a; a=this.attributes[i]; i++) {
	        // does it have magic marker identifying it as an event delegate?
	        if (this.hasEventPrefix(a.name)) {
	          // if so, add the info to delegates
	          delegates[this.removeEventPrefix(a.name)] = a.value.replace('{{', '')
	              .replace('}}', '').trim();
	        }
	      }
	    },
	    // starts with 'on-'
	    hasEventPrefix: function (n) {
	      return n && (n[0] === 'o') && (n[1] === 'n') && (n[2] === '-');
	    },
	    removeEventPrefix: function(n) {
	      return n.slice(prefixLength);
	    },
	    findController: function(node) {
	      while (node.parentNode) {
	        if (node.eventController) {
	          return node.eventController;
	        }
	        node = node.parentNode;
	      }
	      return node.host;
	    },
	    getEventHandler: function(controller, target, method) {
	      var events = this;
	      return function(e) {
	        if (!controller || !controller.PolymerBase) {
	          controller = events.findController(target);
	        }
	
	        var args = [e, e.detail, e.currentTarget];
	        controller.dispatchMethod(controller, method, args);
	      };
	    },
	    prepareEventBinding: function(pathString, name, node) {
	      if (!this.hasEventPrefix(name))
	        return;
	
	      var eventType = this.removeEventPrefix(name);
	      eventType = mixedCaseEventTypes[eventType] || eventType;
	
	      var events = this;
	
	      return function(model, node, oneTime) {
	        var handler = events.getEventHandler(undefined, node, pathString);
	        PolymerGestures.addEventListener(node, eventType, handler);
	
	        if (oneTime)
	          return;
	
	        // TODO(rafaelw): This is really pointless work. Aside from the cost
	        // of these allocations, NodeBind is going to setAttribute back to its
	        // current value. Fixing this would mean changing the TemplateBinding
	        // binding delegate API.
	        function bindingValue() {
	          return '{{ ' + pathString + ' }}';
	        }
	
	        return {
	          open: bindingValue,
	          discardChanges: bindingValue,
	          close: function() {
	            PolymerGestures.removeEventListener(node, eventType, handler);
	          }
	        };
	      };
	    }
	  };
	
	  var prefixLength = EVENT_PREFIX.length;
	
	  // exports
	  scope.api.declaration.events = events;
	
	})(Polymer);
	
	(function(scope) {
	
	  // element api
	
	  var observationBlacklist = ['attribute'];
	
	  var properties = {
	    inferObservers: function(prototype) {
	      // called before prototype.observe is chained to inherited object
	      var observe = prototype.observe, property;
	      for (var n in prototype) {
	        if (n.slice(-7) === 'Changed') {
	          property = n.slice(0, -7);
	          if (this.canObserveProperty(property)) {
	            if (!observe) {
	              observe  = (prototype.observe = {});
	            }
	            observe[property] = observe[property] || n;
	          }
	        }
	      }
	    },
	    canObserveProperty: function(property) {
	      return (observationBlacklist.indexOf(property) < 0);
	    },
	    explodeObservers: function(prototype) {
	      // called before prototype.observe is chained to inherited object
	      var o = prototype.observe;
	      if (o) {
	        var exploded = {};
	        for (var n in o) {
	          var names = n.split(' ');
	          for (var i=0, ni; ni=names[i]; i++) {
	            exploded[ni] = o[n];
	          }
	        }
	        prototype.observe = exploded;
	      }
	    },
	    optimizePropertyMaps: function(prototype) {
	      if (prototype.observe) {
	        // construct name list
	        var a = prototype._observeNames = [];
	        for (var n in prototype.observe) {
	          var names = n.split(' ');
	          for (var i=0, ni; ni=names[i]; i++) {
	            a.push(ni);
	          }
	        }
	      }
	      if (prototype.publish) {
	        // construct name list
	        var a = prototype._publishNames = [];
	        for (var n in prototype.publish) {
	          a.push(n);
	        }
	      }
	      if (prototype.computed) {
	        // construct name list
	        var a = prototype._computedNames = [];
	        for (var n in prototype.computed) {
	          a.push(n);
	        }
	      }
	    },
	    publishProperties: function(prototype, base) {
	      // if we have any properties to publish
	      var publish = prototype.publish;
	      if (publish) {
	        // transcribe `publish` entries onto own prototype
	        this.requireProperties(publish, prototype, base);
	        // warn and remove accessor names that are broken on some browsers
	        this.filterInvalidAccessorNames(publish);
	        // construct map of lower-cased property names
	        prototype._publishLC = this.lowerCaseMap(publish);
	      }
	      var computed = prototype.computed;
	      if (computed) {
	        // warn and remove accessor names that are broken on some browsers
	        this.filterInvalidAccessorNames(computed);
	      }
	    },
	    // Publishing/computing a property where the name might conflict with a
	    // browser property is not currently supported to help users of Polymer
	    // avoid browser bugs:
	    //
	    // https://code.google.com/p/chromium/issues/detail?id=43394
	    // https://bugs.webkit.org/show_bug.cgi?id=49739
	    //
	    // We can lift this restriction when those bugs are fixed.
	    filterInvalidAccessorNames: function(propertyNames) {
	      for (var name in propertyNames) {
	        // Check if the name is in our blacklist.
	        if (this.propertyNameBlacklist[name]) {
	          console.warn('Cannot define property "' + name + '" for element "' +
	            this.name + '" because it has the same name as an HTMLElement ' +
	            'property, and not all browsers support overriding that. ' +
	            'Consider giving it a different name.');
	          // Remove the invalid accessor from the list.
	          delete propertyNames[name];
	        }
	      }
	    },
	    //
	    // `name: value` entries in the `publish` object may need to generate
	    // matching properties on the prototype.
	    //
	    // Values that are objects may have a `reflect` property, which
	    // signals that the value describes property control metadata.
	    // In metadata objects, the prototype default value (if any)
	    // is encoded in the `value` property.
	    //
	    // publish: {
	    //   foo: 5,
	    //   bar: {value: true, reflect: true},
	    //   zot: {}
	    // }
	    //
	    // `reflect` metadata property controls whether changes to the property
	    // are reflected back to the attribute (default false).
	    //
	    // A value is stored on the prototype unless it's === `undefined`,
	    // in which case the base chain is checked for a value.
	    // If the basal value is also undefined, `null` is stored on the prototype.
	    //
	    // The reflection data is stored on another prototype object, `reflect`
	    // which also can be specified directly.
	    //
	    // reflect: {
	    //   foo: true
	    // }
	    //
	    requireProperties: function(propertyInfos, prototype, base) {
	      // per-prototype storage for reflected properties
	      prototype.reflect = prototype.reflect || {};
	      // ensure a prototype value for each property
	      // and update the property's reflect to attribute status
	      for (var n in propertyInfos) {
	        var value = propertyInfos[n];
	        // value has metadata if it has a `reflect` property
	        if (value && value.reflect !== undefined) {
	          prototype.reflect[n] = Boolean(value.reflect);
	          value = value.value;
	        }
	        // only set a value if one is specified
	        if (value !== undefined) {
	          prototype[n] = value;
	        }
	      }
	    },
	    lowerCaseMap: function(properties) {
	      var map = {};
	      for (var n in properties) {
	        map[n.toLowerCase()] = n;
	      }
	      return map;
	    },
	    createPropertyAccessor: function(name, ignoreWrites) {
	      var proto = this.prototype;
	
	      var privateName = name + '_';
	      var privateObservable  = name + 'Observable_';
	      proto[privateName] = proto[name];
	
	      Object.defineProperty(proto, name, {
	        get: function() {
	          var observable = this[privateObservable];
	          if (observable)
	            observable.deliver();
	
	          return this[privateName];
	        },
	        set: function(value) {
	          if (ignoreWrites) {
	            return this[privateName];
	          }
	
	          var observable = this[privateObservable];
	          if (observable) {
	            observable.setValue(value);
	            return;
	          }
	
	          var oldValue = this[privateName];
	          this[privateName] = value;
	          this.emitPropertyChangeRecord(name, value, oldValue);
	
	          return value;
	        },
	        configurable: true
	      });
	    },
	    createPropertyAccessors: function(prototype) {
	      var n$ = prototype._computedNames;
	      if (n$ && n$.length) {
	        for (var i=0, l=n$.length, n, fn; (i<l) && (n=n$[i]); i++) {
	          this.createPropertyAccessor(n, true);
	        }
	      }
	      var n$ = prototype._publishNames;
	      if (n$ && n$.length) {
	        for (var i=0, l=n$.length, n, fn; (i<l) && (n=n$[i]); i++) {
	          // If the property is computed and published, the accessor is created
	          // above.
	          if (!prototype.computed || !prototype.computed[n]) {
	            this.createPropertyAccessor(n);
	          }
	        }
	      }
	    },
	    // This list contains some property names that people commonly want to use,
	    // but won't work because of Chrome/Safari bugs. It isn't an exhaustive
	    // list. In particular it doesn't contain any property names found on
	    // subtypes of HTMLElement (e.g. name, value). Rather it attempts to catch
	    // some common cases.
	    propertyNameBlacklist: {
	      children: 1,
	      'class': 1,
	      id: 1,
	      hidden: 1,
	      style: 1,
	      title: 1,
	    }
	  };
	
	  // exports
	
	  scope.api.declaration.properties = properties;
	
	})(Polymer);
	
	(function(scope) {
	
	  // magic words
	
	  var ATTRIBUTES_ATTRIBUTE = 'attributes';
	  var ATTRIBUTES_REGEX = /\s|,/;
	
	  // attributes api
	
	  var attributes = {
	
	    inheritAttributesObjects: function(prototype) {
	      // chain our lower-cased publish map to the inherited version
	      this.inheritObject(prototype, 'publishLC');
	      // chain our instance attributes map to the inherited version
	      this.inheritObject(prototype, '_instanceAttributes');
	    },
	
	    publishAttributes: function(prototype, base) {
	      // merge names from 'attributes' attribute into the 'publish' object
	      var attributes = this.getAttribute(ATTRIBUTES_ATTRIBUTE);
	      if (attributes) {
	        // create a `publish` object if needed.
	        // the `publish` object is only relevant to this prototype, the
	        // publishing logic in `declaration/properties.js` is responsible for
	        // managing property values on the prototype chain.
	        // TODO(sjmiles): the `publish` object is later chained to it's
	        //                ancestor object, presumably this is only for
	        //                reflection or other non-library uses.
	        var publish = prototype.publish || (prototype.publish = {});
	        // names='a b c' or names='a,b,c'
	        var names = attributes.split(ATTRIBUTES_REGEX);
	        // record each name for publishing
	        for (var i=0, l=names.length, n; i<l; i++) {
	          // remove excess ws
	          n = names[i].trim();
	          // looks weird, but causes n to exist on `publish` if it does not;
	          // a more careful test would need expensive `in` operator
	          if (n && publish[n] === undefined) {
	            publish[n] = undefined;
	          }
	        }
	      }
	    },
	
	    // record clonable attributes from <element>
	    accumulateInstanceAttributes: function() {
	      // inherit instance attributes
	      var clonable = this.prototype._instanceAttributes;
	      // merge attributes from element
	      var a$ = this.attributes;
	      for (var i=0, l=a$.length, a; (i<l) && (a=a$[i]); i++) {
	        if (this.isInstanceAttribute(a.name)) {
	          clonable[a.name] = a.value;
	        }
	      }
	    },
	
	    isInstanceAttribute: function(name) {
	      return !this.blackList[name] && name.slice(0,3) !== 'on-';
	    },
	
	    // do not clone these attributes onto instances
	    blackList: {
	      name: 1,
	      'extends': 1,
	      constructor: 1,
	      noscript: 1,
	      assetpath: 1,
	      'cache-csstext': 1
	    }
	
	  };
	
	  // add ATTRIBUTES_ATTRIBUTE to the blacklist
	  attributes.blackList[ATTRIBUTES_ATTRIBUTE] = 1;
	
	  // exports
	
	  scope.api.declaration.attributes = attributes;
	
	})(Polymer);
	
	(function(scope) {
	
	  // imports
	  var events = scope.api.declaration.events;
	
	  var syntax = new PolymerExpressions();
	  var prepareBinding = syntax.prepareBinding;
	
	  // Polymer takes a first crack at the binding to see if it's a declarative
	  // event handler.
	  syntax.prepareBinding = function(pathString, name, node) {
	    return events.prepareEventBinding(pathString, name, node) ||
	           prepareBinding.call(syntax, pathString, name, node);
	  };
	
	  // declaration api supporting mdv
	  var mdv = {
	    syntax: syntax,
	    fetchTemplate: function() {
	      return this.querySelector('template');
	    },
	    templateContent: function() {
	      var template = this.fetchTemplate();
	      return template && template.content;
	    },
	    installBindingDelegate: function(template) {
	      if (template) {
	        template.bindingDelegate = this.syntax;
	      }
	    }
	  };
	
	  // exports
	  scope.api.declaration.mdv = mdv;
	
	})(Polymer);
	
	(function(scope) {
	
	  // imports
	
	  var api = scope.api;
	  var isBase = scope.isBase;
	  var extend = scope.extend;
	
	  var hasShadowDOMPolyfill = window.ShadowDOMPolyfill;
	
	  // prototype api
	
	  var prototype = {
	
	    register: function(name, extendeeName) {
	      // build prototype combining extendee, Polymer base, and named api
	      this.buildPrototype(name, extendeeName);
	      // register our custom element with the platform
	      this.registerPrototype(name, extendeeName);
	      // reference constructor in a global named by 'constructor' attribute
	      this.publishConstructor();
	    },
	
	    buildPrototype: function(name, extendeeName) {
	      // get our custom prototype (before chaining)
	      var extension = scope.getRegisteredPrototype(name);
	      // get basal prototype
	      var base = this.generateBasePrototype(extendeeName);
	      // implement declarative features
	      this.desugarBeforeChaining(extension, base);
	      // join prototypes
	      this.prototype = this.chainPrototypes(extension, base);
	      // more declarative features
	      this.desugarAfterChaining(name, extendeeName);
	    },
	
	    desugarBeforeChaining: function(prototype, base) {
	      // back reference declaration element
	      // TODO(sjmiles): replace `element` with `elementElement` or `declaration`
	      prototype.element = this;
	      // transcribe `attributes` declarations onto own prototype's `publish`
	      this.publishAttributes(prototype, base);
	      // `publish` properties to the prototype and to attribute watch
	      this.publishProperties(prototype, base);
	      // infer observers for `observe` list based on method names
	      this.inferObservers(prototype);
	      // desugar compound observer syntax, e.g. 'a b c'
	      this.explodeObservers(prototype);
	    },
	
	    chainPrototypes: function(prototype, base) {
	      // chain various meta-data objects to inherited versions
	      this.inheritMetaData(prototype, base);
	      // chain custom api to inherited
	      var chained = this.chainObject(prototype, base);
	      // x-platform fixup
	      ensurePrototypeTraversal(chained);
	      return chained;
	    },
	
	    inheritMetaData: function(prototype, base) {
	      // chain observe object to inherited
	      this.inheritObject('observe', prototype, base);
	      // chain publish object to inherited
	      this.inheritObject('publish', prototype, base);
	      // chain reflect object to inherited
	      this.inheritObject('reflect', prototype, base);
	      // chain our lower-cased publish map to the inherited version
	      this.inheritObject('_publishLC', prototype, base);
	      // chain our instance attributes map to the inherited version
	      this.inheritObject('_instanceAttributes', prototype, base);
	      // chain our event delegates map to the inherited version
	      this.inheritObject('eventDelegates', prototype, base);
	    },
	
	    // implement various declarative features
	    desugarAfterChaining: function(name, extendee) {
	      // build side-chained lists to optimize iterations
	      this.optimizePropertyMaps(this.prototype);
	      this.createPropertyAccessors(this.prototype);
	      // install mdv delegate on template
	      this.installBindingDelegate(this.fetchTemplate());
	      // install external stylesheets as if they are inline
	      this.installSheets();
	      // adjust any paths in dom from imports
	      this.resolveElementPaths(this);
	      // compile list of attributes to copy to instances
	      this.accumulateInstanceAttributes();
	      // parse on-* delegates declared on `this` element
	      this.parseHostEvents();
	      //
	      // install a helper method this.resolvePath to aid in
	      // setting resource urls. e.g.
	      // this.$.image.src = this.resolvePath('images/foo.png')
	      this.addResolvePathApi();
	      // under ShadowDOMPolyfill, transforms to approximate missing CSS features
	      if (hasShadowDOMPolyfill) {
	        WebComponents.ShadowCSS.shimStyling(this.templateContent(), name,
	          extendee);
	      }
	      // allow custom element access to the declarative context
	      if (this.prototype.registerCallback) {
	        this.prototype.registerCallback(this);
	      }
	    },
	
	    // if a named constructor is requested in element, map a reference
	    // to the constructor to the given symbol
	    publishConstructor: function() {
	      var symbol = this.getAttribute('constructor');
	      if (symbol) {
	        window[symbol] = this.ctor;
	      }
	    },
	
	    // build prototype combining extendee, Polymer base, and named api
	    generateBasePrototype: function(extnds) {
	      var prototype = this.findBasePrototype(extnds);
	      if (!prototype) {
	        // create a prototype based on tag-name extension
	        var prototype = HTMLElement.getPrototypeForTag(extnds);
	        // insert base api in inheritance chain (if needed)
	        prototype = this.ensureBaseApi(prototype);
	        // memoize this base
	        memoizedBases[extnds] = prototype;
	      }
	      return prototype;
	    },
	
	    findBasePrototype: function(name) {
	      return memoizedBases[name];
	    },
	
	    // install Polymer instance api into prototype chain, as needed
	    ensureBaseApi: function(prototype) {
	      if (prototype.PolymerBase) {
	        return prototype;
	      }
	      var extended = Object.create(prototype);
	      // we need a unique copy of base api for each base prototype
	      // therefore we 'extend' here instead of simply chaining
	      api.publish(api.instance, extended);
	      // TODO(sjmiles): sharing methods across prototype chains is
	      // not supported by 'super' implementation which optimizes
	      // by memoizing prototype relationships.
	      // Probably we should have a version of 'extend' that is
	      // share-aware: it could study the text of each function,
	      // look for usage of 'super', and wrap those functions in
	      // closures.
	      // As of now, there is only one problematic method, so
	      // we just patch it manually.
	      // To avoid re-entrancy problems, the special super method
	      // installed is called `mixinSuper` and the mixin method
	      // must use this method instead of the default `super`.
	      this.mixinMethod(extended, prototype, api.instance.mdv, 'bind');
	      // return buffed-up prototype
	      return extended;
	    },
	
	    mixinMethod: function(extended, prototype, api, name) {
	      var $super = function(args) {
	        return prototype[name].apply(this, args);
	      };
	      extended[name] = function() {
	        this.mixinSuper = $super;
	        return api[name].apply(this, arguments);
	      }
	    },
	
	    // ensure prototype[name] inherits from a prototype.prototype[name]
	    inheritObject: function(name, prototype, base) {
	      // require an object
	      var source = prototype[name] || {};
	      // chain inherited properties onto a new object
	      prototype[name] = this.chainObject(source, base[name]);
	    },
	
	    // register 'prototype' to custom element 'name', store constructor
	    registerPrototype: function(name, extendee) {
	      var info = {
	        prototype: this.prototype
	      }
	      // native element must be specified in extends
	      var typeExtension = this.findTypeExtension(extendee);
	      if (typeExtension) {
	        info.extends = typeExtension;
	      }
	      // register the prototype with HTMLElement for name lookup
	      HTMLElement.register(name, this.prototype);
	      // register the custom type
	      this.ctor = document.registerElement(name, info);
	    },
	
	    findTypeExtension: function(name) {
	      if (name && name.indexOf('-') < 0) {
	        return name;
	      } else {
	        var p = this.findBasePrototype(name);
	        if (p.element) {
	          return this.findTypeExtension(p.element.extends);
	        }
	      }
	    }
	
	  };
	
	  // memoize base prototypes
	  var memoizedBases = {};
	
	  // implementation of 'chainObject' depends on support for __proto__
	  if (Object.__proto__) {
	    prototype.chainObject = function(object, inherited) {
	      if (object && inherited && object !== inherited) {
	        object.__proto__ = inherited;
	      }
	      return object;
	    }
	  } else {
	    prototype.chainObject = function(object, inherited) {
	      if (object && inherited && object !== inherited) {
	        var chained = Object.create(inherited);
	        object = extend(chained, object);
	      }
	      return object;
	    }
	  }
	
	  // On platforms that do not support __proto__ (versions of IE), the prototype
	  // chain of a custom element is simulated via installation of __proto__.
	  // Although custom elements manages this, we install it here so it's
	  // available during desugaring.
	  function ensurePrototypeTraversal(prototype) {
	    if (!Object.__proto__) {
	      var ancestor = Object.getPrototypeOf(prototype);
	      prototype.__proto__ = ancestor;
	      if (isBase(ancestor)) {
	        ancestor.__proto__ = Object.getPrototypeOf(ancestor);
	      }
	    }
	  }
	
	  // exports
	
	  api.declaration.prototype = prototype;
	
	})(Polymer);
	
	(function(scope) {
	
	  /*
	
	    Elements are added to a registration queue so that they register in
	    the proper order at the appropriate time. We do this for a few reasons:
	
	    * to enable elements to load resources (like stylesheets)
	    asynchronously. We need to do this until the platform provides an efficient
	    alternative. One issue is that remote @import stylesheets are
	    re-fetched whenever stamped into a shadowRoot.
	
	    * to ensure elements loaded 'at the same time' (e.g. via some set of
	    imports) are registered as a batch. This allows elements to be enured from
	    upgrade ordering as long as they query the dom tree 1 task after
	    upgrade (aka domReady). This is a performance tradeoff. On the one hand,
	    elements that could register while imports are loading are prevented from
	    doing so. On the other, grouping upgrades into a single task means less
	    incremental work (for example style recalcs),  Also, we can ensure the
	    document is in a known state at the single quantum of time when
	    elements upgrade.
	
	  */
	  var queue = {
	
	    // tell the queue to wait for an element to be ready
	    wait: function(element) {
	      if (!element.__queue) {
	        element.__queue = {};
	        elements.push(element);
	      }
	    },
	
	    // enqueue an element to the next spot in the queue.
	    enqueue: function(element, check, go) {
	      var shouldAdd = element.__queue && !element.__queue.check;
	      if (shouldAdd) {
	        queueForElement(element).push(element);
	        element.__queue.check = check;
	        element.__queue.go = go;
	      }
	      return (this.indexOf(element) !== 0);
	    },
	
	    indexOf: function(element) {
	      var i = queueForElement(element).indexOf(element);
	      if (i >= 0 && document.contains(element)) {
	        i += (HTMLImports.useNative || HTMLImports.ready) ?
	          importQueue.length : 1e9;
	      }
	      return i;
	    },
	
	    // tell the queue an element is ready to be registered
	    go: function(element) {
	      var readied = this.remove(element);
	      if (readied) {
	        element.__queue.flushable = true;
	        this.addToFlushQueue(readied);
	        this.check();
	      }
	    },
	
	    remove: function(element) {
	      var i = this.indexOf(element);
	      if (i !== 0) {
	        //console.warn('queue order wrong', i);
	        return;
	      }
	      return queueForElement(element).shift();
	    },
	
	    check: function() {
	      // next
	      var element = this.nextElement();
	      if (element) {
	        element.__queue.check.call(element);
	      }
	      if (this.canReady()) {
	        this.ready();
	        return true;
	      }
	    },
	
	    nextElement: function() {
	      return nextQueued();
	    },
	
	    canReady: function() {
	      return !this.waitToReady && this.isEmpty();
	    },
	
	    isEmpty: function() {
	      for (var i=0, l=elements.length, e; (i<l) &&
	          (e=elements[i]); i++) {
	        if (e.__queue && !e.__queue.flushable) {
	          return;
	        }
	      }
	      return true;
	    },
	
	    addToFlushQueue: function(element) {
	      flushQueue.push(element);
	    },
	
	    flush: function() {
	      // prevent re-entrance
	      if (this.flushing) {
	        return;
	      }
	      this.flushing = true;
	      var element;
	      while (flushQueue.length) {
	        element = flushQueue.shift();
	        element.__queue.go.call(element);
	        element.__queue = null;
	      }
	      this.flushing = false;
	    },
	
	    ready: function() {
	      // TODO(sorvell): As an optimization, turn off CE polyfill upgrading
	      // while registering. This way we avoid having to upgrade each document
	      // piecemeal per registration and can instead register all elements
	      // and upgrade once in a batch. Without this optimization, upgrade time
	      // degrades significantly when SD polyfill is used. This is mainly because
	      // querying the document tree for elements is slow under the SD polyfill.
	      var polyfillWasReady = CustomElements.ready;
	      CustomElements.ready = false;
	      this.flush();
	      if (!CustomElements.useNative) {
	        CustomElements.upgradeDocumentTree(document);
	      }
	      CustomElements.ready = polyfillWasReady;
	      Polymer.flush();
	      requestAnimationFrame(this.flushReadyCallbacks);
	    },
	
	    addReadyCallback: function(callback) {
	      if (callback) {
	        readyCallbacks.push(callback);
	      }
	    },
	
	    flushReadyCallbacks: function() {
	      if (readyCallbacks) {
	        var fn;
	        while (readyCallbacks.length) {
	          fn = readyCallbacks.shift();
	          fn();
	        }
	      }
	    },
	
	    /**
	    Returns a list of elements that have had polymer-elements created but
	    are not yet ready to register. The list is an array of element definitions.
	    */
	    waitingFor: function() {
	      var e$ = [];
	      for (var i=0, l=elements.length, e; (i<l) &&
	          (e=elements[i]); i++) {
	        if (e.__queue && !e.__queue.flushable) {
	          e$.push(e);
	        }
	      }
	      return e$;
	    },
	
	    waitToReady: true
	
	  };
	
	  var elements = [];
	  var flushQueue = [];
	  var importQueue = [];
	  var mainQueue = [];
	  var readyCallbacks = [];
	
	  function queueForElement(element) {
	    return document.contains(element) ? mainQueue : importQueue;
	  }
	
	  function nextQueued() {
	    return importQueue.length ? importQueue[0] : mainQueue[0];
	  }
	
	  function whenReady(callback) {
	    queue.waitToReady = true;
	    Polymer.endOfMicrotask(function() {
	      HTMLImports.whenReady(function() {
	        queue.addReadyCallback(callback);
	        queue.waitToReady = false;
	        queue.check();
	    });
	    });
	  }
	
	  /**
	    Forces polymer to register any pending elements. Can be used to abort
	    waiting for elements that are partially defined.
	    @param timeout {Integer} Optional timeout in milliseconds
	  */
	  function forceReady(timeout) {
	    if (timeout === undefined) {
	      queue.ready();
	      return;
	    }
	    var handle = setTimeout(function() {
	      queue.ready();
	    }, timeout);
	    Polymer.whenReady(function() {
	      clearTimeout(handle);
	    });
	  }
	
	  // exports
	  scope.elements = elements;
	  scope.waitingFor = queue.waitingFor.bind(queue);
	  scope.forceReady = forceReady;
	  scope.queue = queue;
	  scope.whenReady = scope.whenPolymerReady = whenReady;
	})(Polymer);
	
	(function(scope) {
	
	  // imports
	
	  var extend = scope.extend;
	  var api = scope.api;
	  var queue = scope.queue;
	  var whenReady = scope.whenReady;
	  var getRegisteredPrototype = scope.getRegisteredPrototype;
	  var waitingForPrototype = scope.waitingForPrototype;
	
	  // declarative implementation: <polymer-element>
	
	  var prototype = extend(Object.create(HTMLElement.prototype), {
	
	    createdCallback: function() {
	      if (this.getAttribute('name')) {
	        this.init();
	      }
	    },
	
	    init: function() {
	      // fetch declared values
	      this.name = this.getAttribute('name');
	      this.extends = this.getAttribute('extends');
	      queue.wait(this);
	      // initiate any async resource fetches
	      this.loadResources();
	      // register when all constraints are met
	      this.registerWhenReady();
	    },
	
	    // TODO(sorvell): we currently queue in the order the prototypes are
	    // registered, but we should queue in the order that polymer-elements
	    // are registered. We are currently blocked from doing this based on
	    // crbug.com/395686.
	    registerWhenReady: function() {
	     if (this.registered
	       || this.waitingForPrototype(this.name)
	       || this.waitingForQueue()
	       || this.waitingForResources()) {
	          return;
	      }
	      queue.go(this);
	    },
	
	    _register: function() {
	      //console.log('registering', this.name);
	      // warn if extending from a custom element not registered via Polymer
	      if (isCustomTag(this.extends) && !isRegistered(this.extends)) {
	        console.warn('%s is attempting to extend %s, an unregistered element ' +
	            'or one that was not registered with Polymer.', this.name,
	            this.extends);
	      }
	      this.register(this.name, this.extends);
	      this.registered = true;
	    },
	
	    waitingForPrototype: function(name) {
	      if (!getRegisteredPrototype(name)) {
	        // then wait for a prototype
	        waitingForPrototype(name, this);
	        // emulate script if user is not supplying one
	        this.handleNoScript(name);
	        // prototype not ready yet
	        return true;
	      }
	    },
	
	    handleNoScript: function(name) {
	      // if explicitly marked as 'noscript'
	      if (this.hasAttribute('noscript') && !this.noscript) {
	        this.noscript = true;
	        // imperative element registration
	        Polymer(name);
	      }
	    },
	
	    waitingForResources: function() {
	      return this._needsResources;
	    },
	
	    // NOTE: Elements must be queued in proper order for inheritance/composition
	    // dependency resolution. Previously this was enforced for inheritance,
	    // and by rule for composition. It's now entirely by rule.
	    waitingForQueue: function() {
	      return queue.enqueue(this, this.registerWhenReady, this._register);
	    },
	
	    loadResources: function() {
	      this._needsResources = true;
	      this.loadStyles(function() {
	        this._needsResources = false;
	        this.registerWhenReady();
	      }.bind(this));
	    }
	
	  });
	
	  // semi-pluggable APIs
	
	  // TODO(sjmiles): should be fully pluggable (aka decoupled, currently
	  // the various plugins are allowed to depend on each other directly)
	  api.publish(api.declaration, prototype);
	
	  // utility and bookkeeping
	
	  function isRegistered(name) {
	    return Boolean(HTMLElement.getPrototypeForTag(name));
	  }
	
	  function isCustomTag(name) {
	    return (name && name.indexOf('-') >= 0);
	  }
	
	  // boot tasks
	
	  whenReady(function() {
	    document.body.removeAttribute('unresolved');
	    document.dispatchEvent(
	      new CustomEvent('polymer-ready', {bubbles: true})
	    );
	  });
	
	  // register polymer-element with document
	
	  document.registerElement('polymer-element', {prototype: prototype});
	
	})(Polymer);
	
	(function(scope) {
	
	/**
	 * @class Polymer
	 */
	
	var whenReady = scope.whenReady;
	
	/**
	 * Loads the set of HTMLImports contained in `node`. Notifies when all
	 * the imports have loaded by calling the `callback` function argument.
	 * This method can be used to lazily load imports. For example, given a
	 * template:
	 *
	 *     <template>
	 *       <link rel="import" href="my-import1.html">
	 *       <link rel="import" href="my-import2.html">
	 *     </template>
	 *
	 *     Polymer.importElements(template.content, function() {
	 *       console.log('imports lazily loaded');
	 *     });
	 *
	 * @method importElements
	 * @param {Node} node Node containing the HTMLImports to load.
	 * @param {Function} callback Callback called when all imports have loaded.
	 */
	function importElements(node, callback) {
	  if (node) {
	    document.head.appendChild(node);
	    whenReady(callback);
	  } else if (callback) {
	    callback();
	  }
	}
	
	/**
	 * Loads an HTMLImport for each url specified in the `urls` array.
	 * Notifies when all the imports have loaded by calling the `callback`
	 * function argument. This method can be used to lazily load imports.
	 * For example,
	 *
	 *     Polymer.import(['my-import1.html', 'my-import2.html'], function() {
	 *       console.log('imports lazily loaded');
	 *     });
	 *
	 * @method import
	 * @param {Array} urls Array of urls to load as HTMLImports.
	 * @param {Function} callback Callback called when all imports have loaded.
	 */
	function _import(urls, callback) {
	  if (urls && urls.length) {
	      var frag = document.createDocumentFragment();
	      for (var i=0, l=urls.length, url, link; (i<l) && (url=urls[i]); i++) {
	        link = document.createElement('link');
	        link.rel = 'import';
	        link.href = url;
	        frag.appendChild(link);
	      }
	      importElements(frag, callback);
	  } else if (callback) {
	    callback();
	  }
	}
	
	// exports
	scope.import = _import;
	scope.importElements = importElements;
	
	})(Polymer);
	
	/**
	 * The `auto-binding` element extends the template element. It provides a quick
	 * and easy way to do data binding without the need to setup a model.
	 * The `auto-binding` element itself serves as the model and controller for the
	 * elements it contains. Both data and event handlers can be bound.
	 *
	 * The `auto-binding` element acts just like a template that is bound to
	 * a model. It stamps its content in the dom adjacent to itself. When the
	 * content is stamped, the `template-bound` event is fired.
	 *
	 * Example:
	 *
	 *     <template is="auto-binding">
	 *       <div>Say something: <input value="{{value}}"></div>
	 *       <div>You said: {{value}}</div>
	 *       <button on-tap="{{buttonTap}}">Tap me!</button>
	 *     </template>
	 *     <script>
	 *       var template = document.querySelector('template');
	 *       template.value = 'something';
	 *       template.buttonTap = function() {
	 *         console.log('tap!');
	 *       };
	 *     </script>
	 *
	 * @module Polymer
	 * @status stable
	*/
	
	(function() {
	
	  var element = document.createElement('polymer-element');
	  element.setAttribute('name', 'auto-binding');
	  element.setAttribute('extends', 'template');
	  element.init();
	
	  Polymer('auto-binding', {
	
	    createdCallback: function() {
	      this.syntax = this.bindingDelegate = this.makeSyntax();
	      // delay stamping until polymer-ready so that auto-binding is not
	      // required to load last.
	      Polymer.whenPolymerReady(function() {
	        this.model = this;
	        this.setAttribute('bind', '');
	        // we don't bother with an explicit signal here, we could ust a MO
	        // if necessary
	        this.async(function() {
	          // note: this will marshall *all* the elements in the parentNode
	          // rather than just stamped ones. We'd need to use createInstance
	          // to fix this or something else fancier.
	          this.marshalNodeReferences(this.parentNode);
	          // template stamping is asynchronous so stamping isn't complete
	          // by polymer-ready; fire an event so users can use stamped elements
	          this.fire('template-bound');
	        });
	      }.bind(this));
	    },
	
	    makeSyntax: function() {
	      var events = Object.create(Polymer.api.declaration.events);
	      var self = this;
	      events.findController = function() { return self.model; };
	
	      var syntax = new PolymerExpressions();
	      var prepareBinding = syntax.prepareBinding;
	      syntax.prepareBinding = function(pathString, name, node) {
	        return events.prepareEventBinding(pathString, name, node) ||
	               prepareBinding.call(syntax, pathString, name, node);
	      };
	      return syntax;
	    }
	
	  });
	
	})();
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(2)(module)))

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ }
/******/ ])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNzU0MGI0ZTBhMTA5ZmQ2YTgxMWQiLCJ3ZWJwYWNrOi8vLy4vaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vYm93ZXJfY29tcG9uZW50cy9wb2x5bWVyL3BvbHltZXIuanMiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS9idWlsZGluL21vZHVsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSx3Qzs7Ozs7OztBQ3RDQTs7QUFFQTs7Ozs7OztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0wsMkNBQTBDLGNBQWM7QUFDeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF1QixpQkFBaUI7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBLHNCQUFxQixjQUFjO0FBQ25DO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWEsTUFBTTtBQUNuQixlQUFjLFFBQVE7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYSxLQUFLO0FBQ2xCLGNBQWEsS0FBSztBQUNsQixlQUFjO0FBQ2Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhLEtBQUs7QUFDbEIsY0FBYSxPQUFPO0FBQ3BCLGNBQWEsT0FBTztBQUNwQixlQUFjO0FBQ2Q7QUFDQTs7QUFFQSxFQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhLDZCQUE2QiwwQkFBMEI7QUFDcEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVcsT0FBTztBQUNsQixZQUFXLE9BQU87QUFDbEIsYUFBWSxNQUFNO0FBQ2xCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxnQ0FBK0IscUJBQXFCOztBQUVwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQSxxREFBb0QsaUJBQWlCO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQSx3QkFBdUIsd0JBQXdCO0FBQy9DO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEVBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUErQixrQkFBa0I7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEVBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFnQjtBQUNoQjtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBNkI7QUFDN0I7QUFDQTtBQUNBLGNBQWEsd0JBQXdCO0FBQ3JDLFlBQVc7QUFDWCxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWUsT0FBTztBQUN0QixnQkFBZSxPQUFPO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBd0IsMkJBQTJCO0FBQ25EO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQSwwQkFBeUIsMkNBQTJDO0FBQ3BFO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0EsMEJBQXlCLDJDQUEyQztBQUNwRTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQWtCO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBLDZCQUE0QixrQkFBa0I7QUFDOUM7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQSw0Q0FBMkMsNEJBQTRCO0FBQ3ZFO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBLDRDQUEyQyw0QkFBNEI7QUFDdkU7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFlLE9BQU87QUFDdEIsZ0JBQWUsTUFBTTtBQUNyQixpQkFBZ0IsTUFBTTtBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxnQkFBZSxNQUFNO0FBQ3JCLGlCQUFnQixPQUFPO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXFCLHdCQUF3QjtBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxnQkFBZSxNQUFNO0FBQ3JCLGlCQUFnQixRQUFRO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBLDZCQUE0Qiw4QkFBOEI7QUFDMUQ7QUFDQTtBQUNBO0FBQ0EsaUNBQWdDLDBCQUEwQjtBQUMxRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhLFFBQVE7QUFDckIsY0FBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhLFFBQVE7QUFDckIsY0FBYSxPQUFPO0FBQ3BCLGNBQWEsU0FBUztBQUN0QixjQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWEsUUFBUTtBQUNyQixjQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxjQUFhLFFBQVE7QUFDckIsY0FBYSxPQUFPO0FBQ3BCLGNBQWEsU0FBUztBQUN0QixjQUFhLFFBQVE7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNDQUFxQyxXQUFXO0FBQ2hELE1BQUs7QUFDTDtBQUNBO0FBQ0EsSUFBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5Q0FBd0MsdUJBQXVCO0FBQy9EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEVBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBLFFBQU87QUFDUDtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXdCO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSw0QkFBMkIsZUFBZTtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQSwwQ0FBeUMsd0JBQXdCO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxZQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQWtCO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBcUIsaUJBQWlCO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRzs7QUFFSDtBQUNBLEVBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsRUFBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxFQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLEVBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0EsT0FBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFlO0FBQ2YsT0FBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXdCO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUU7O0FBRUY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTCxrQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0EscUJBQW9CO0FBQ3BCO0FBQ0Esc0JBQXFCLHFCQUFxQjtBQUMxQztBQUNBLDRCQUEyQixxQkFBcUI7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXNCO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBdUI7QUFDdkI7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUM7O0FBRUQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsdUNBQXNDO0FBQ3RDOzs7QUFHQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxxQ0FBb0M7QUFDcEM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBbUM7QUFDbkM7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQSxVQUFTO0FBQ1Q7QUFDQSxVQUFTO0FBQ1Q7QUFDQSxVQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF1QjtBQUN2QjtBQUNBLHdCQUF1QjtBQUN2Qix3QkFBdUI7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsc0JBQXFCO0FBQ3JCOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWlDO0FBQ2pDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2IsOEJBQTZCO0FBQzdCO0FBQ0E7O0FBRUE7QUFDQSwwQkFBeUI7QUFDekI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDBCQUF5QjtBQUN6Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxxQkFBb0I7QUFDcEI7QUFDQTtBQUNBOztBQUVBLHNEQUFxRDtBQUNyRDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWE7QUFDYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsa0JBQWlCOztBQUVqQix5QkFBd0I7QUFDeEI7O0FBRUEsMEJBQXlCO0FBQ3pCO0FBQ0E7QUFDQTs7QUFFQSxrQkFBaUI7O0FBRWpCO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOzs7QUFHQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQSxVQUFTLGtCQUFrQjtBQUMzQjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2I7QUFDQTtBQUNBLGNBQWE7QUFDYjtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1QsMEJBQXlCO0FBQ3pCLFVBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7O0FBR0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSxrQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxlQUFjO0FBQ2Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsZUFBYztBQUNkO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEVBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsVUFBUztBQUNUOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxvQkFBbUIsaUJBQWlCO0FBQ3BDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNCQUFxQixzQkFBc0I7QUFDM0M7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsOEJBQTZCLGdDQUFnQzs7QUFFN0Q7QUFDQSx1QkFBc0IsV0FBVyxFQUFFO0FBQ25DLHVCQUFzQixXQUFXLEVBQUU7QUFDbkMsdUJBQXNCLFdBQVc7QUFDakM7O0FBRUE7QUFDQSwwQkFBeUIsWUFBWSxFQUFFO0FBQ3ZDLDBCQUF5QixZQUFZLEVBQUU7QUFDdkMsMEJBQXlCLFlBQVksRUFBRTtBQUN2QywwQkFBeUIsWUFBWSxFQUFFO0FBQ3ZDLDBCQUF5QixZQUFZLEVBQUU7QUFDdkMsMEJBQXlCLFlBQVksRUFBRTtBQUN2QywwQkFBeUIsWUFBWSxFQUFFO0FBQ3ZDLDJCQUEwQixhQUFhLEVBQUU7QUFDekMsMkJBQTBCLGFBQWEsRUFBRTtBQUN6QywyQkFBMEIsYUFBYSxFQUFFO0FBQ3pDLDJCQUEwQixhQUFhLEVBQUU7QUFDekMsNEJBQTJCLGNBQWMsRUFBRTtBQUMzQyw0QkFBMkIsY0FBYyxFQUFFO0FBQzNDLDJCQUEwQixhQUFhLEVBQUU7QUFDekMsMkJBQTBCLGFBQWEsRUFBRTtBQUN6Qzs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0Esc0JBQXFCLHFCQUFxQjtBQUMxQzs7QUFFQTtBQUNBO0FBQ0Esd0JBQXVCLHFCQUFxQjtBQUM1QztBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0Esc0JBQXFCLHVCQUF1QjtBQUM1Qzs7QUFFQTtBQUNBO0FBQ0Esd0JBQXVCLHVCQUF1QjtBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx1QkFBc0Isb0JBQW9CLEVBQUU7QUFDNUMsaUNBQWdDLG9CQUFvQixFQUFFO0FBQ3RELDJCQUEwQjtBQUMxQix5QkFBd0I7QUFDeEI7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSw0QkFBMkI7O0FBRTNCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBLHNCQUFxQix5QkFBeUI7QUFDOUM7QUFDQTtBQUNBOztBQUVBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTBCO0FBQzFCLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZTtBQUNmOztBQUVBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw2Q0FBNEM7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsWUFBVyxtREFBbUQ7QUFDOUQ7QUFDQSxZQUFXLHVEQUF1RDtBQUNsRTtBQUNBLFlBQVcseURBQXlEO0FBQ3BFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEVBQUM7O0FBRUQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxlQUFjO0FBQ2Q7QUFDQTtBQUNBOzs7QUFHQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLEVBQUM7O0FBRUQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esd0JBQXVCO0FBQ3ZCLGFBQVk7QUFDWjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSwrQkFBOEI7QUFDOUI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0EsOENBQTZDLGNBQWM7QUFDM0Q7QUFDQSxJQUFHOzs7QUFHSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLDZDQUE0Qzs7QUFFNUM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUFzQiwyQkFBMkI7QUFDakQ7QUFDQSxpQ0FBZ0MsWUFBWTtBQUM1QyxRQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBbUMsd0JBQXdCO0FBQzNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRywwQkFBMEIsZ0JBQWdCOztBQUU3QztBQUNBLHFDQUFvQyx1QkFBdUI7QUFDM0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EseUJBQXdCLGdCQUFnQjtBQUN4QyxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEwQywyQkFBMkI7QUFDckU7QUFDQTtBQUNBO0FBQ0EsSUFBRzs7QUFFSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTBDLGNBQWM7QUFDeEQ7QUFDQSxFQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxFQUFDOztBQUVEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZTtBQUNmLDJDQUEwQztBQUMxQyxZQUFXO0FBQ1gsNEJBQTJCO0FBQzNCLHFCQUFvQixnQkFBZ0Isa0JBQWtCO0FBQ3RELFlBQVc7QUFDWDtBQUNBO0FBQ0E7O0FBRUEsRUFBQzs7QUFFRDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw2Q0FBNEM7QUFDNUM7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsd0NBQXVDO0FBQ3ZDLG9CQUFtQixZQUFZLEVBQUU7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxRQUFPOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsZ0JBQWU7O0FBRWY7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsWUFBVztBQUNYOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsb0JBQW1CLGtCQUFrQjtBQUNyQztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNCQUFxQixpQkFBaUI7QUFDdEM7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLE1BQUs7O0FBRUw7QUFDQSxzQkFBcUIsaUJBQWlCO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0Esc0JBQXFCLGlCQUFpQjtBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQVksdUJBQXVCO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSwyQ0FBMEMsMkJBQTJCO0FBQ3JFO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7O0FBRUEsc0JBQXFCLHFCQUFxQjtBQUMxQztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUc7O0FBRUg7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsb0JBQW1CLHFCQUFxQjtBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRzs7QUFFSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLHNCQUFxQixpQkFBaUI7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNCQUFxQixzQkFBc0I7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxzQkFBcUIsc0JBQXNCO0FBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EseUJBQXdCLGdCQUFnQixFQUFFO0FBQzFDO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHdCQUF1QixvQkFBb0I7QUFDM0M7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSw4QkFBNkI7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxzQkFBcUIsb0JBQW9CO0FBQ3pDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLHlCQUF3QjtBQUN4QiwyQkFBMEI7QUFDMUIsMkJBQTBCO0FBQzFCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxNQUFLO0FBQ0w7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7O0FBRUg7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBdUIsMkJBQTJCO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxNQUFLOztBQUVMO0FBQ0Esc0JBQXFCLDJCQUEyQjtBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQSxzQkFBcUIsMkJBQTJCO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0Esc0JBQXFCLDJCQUEyQjtBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHOztBQUVILDRCQUEyQixjQUFjOztBQUV6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLG9CQUFtQiwwQkFBMEI7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNCQUFxQixjQUFjO0FBQ25DO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNCQUFxQixpQkFBaUI7QUFDdEM7O0FBRUEsc0JBQXFCLGNBQWM7QUFDbkMsd0JBQXVCLGlCQUFpQjtBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsUUFBTztBQUNQOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFxQixnQkFBZ0I7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQSxzQkFBcUIsa0JBQWtCO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLDhCQUE2QjtBQUM3QjtBQUNBLDhCQUE2QjtBQUM3QixNQUFLO0FBQ0w7QUFDQTtBQUNBLDhCQUE2QjtBQUM3QjtBQUNBLDhCQUE2QjtBQUM3QjtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUEsb0JBQW1CLG9CQUFvQjtBQUN2QztBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsb0JBQW1CLDBCQUEwQjtBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esd0RBQXVEO0FBQ3ZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLEVBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBLElBQUc7O0FBRUg7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTzs7QUFFUDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsRUFBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQSxRQUFPOztBQUVQO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsUUFBTzs7QUFFUDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxRQUFPOztBQUVQO0FBQ0Esd0JBQXVCLHNCQUFzQjtBQUM3QztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0NBQXVDO0FBQ3ZDLHNCQUFxQixZQUFZLEVBQUU7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFFBQU87O0FBRVA7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHOztBQUVIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQkFBOEIsT0FBTztBQUNyQztBQUNBO0FBQ0E7QUFDQSw0QkFBMkIsT0FBTztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esc0JBQXFCLG9CQUFvQjtBQUN6QztBQUNBO0FBQ0EsTUFBSztBQUNMOztBQUVBO0FBQ0E7QUFDQSxjQUFhLG9CQUFvQjtBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTzs7QUFFUDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDJCQUEwQjtBQUMxQixRQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSx5Q0FBd0M7QUFDeEMsb0VBQW1FO0FBQ25FOztBQUVBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSwyQ0FBMEMsT0FBTztBQUNqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHdCQUF1QjtBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFDQUFvQztBQUNwQztBQUNBO0FBQ0EsMkJBQTBCOztBQUUxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBLHlDQUF3QztBQUN4QztBQUNBOztBQUVBO0FBQ0EsbURBQWtEO0FBQ2xEO0FBQ0EsNEJBQTJCO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMEM7QUFDMUMsUUFBTztBQUNQO0FBQ0E7QUFDQSwrQkFBOEI7QUFDOUI7QUFDQTs7QUFFQTtBQUNBLHVCQUFzQjs7QUFFdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLHNCQUFxQixtQkFBbUI7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxvQkFBbUIsbUJBQW1CO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBLG9CQUFtQixtQkFBbUI7QUFDdEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0Esb0JBQW1CLHFCQUFxQjtBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsMENBQXlDO0FBQ3pDOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLG9CQUFtQiwrQkFBK0I7QUFDbEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsNkNBQTRDO0FBQzVDOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxzQ0FBcUMsT0FBTztBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBcUMsT0FBTztBQUM1QztBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7O0FBRUg7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esc0JBQXFCLG9CQUFvQjtBQUN6QztBQUNBO0FBQ0Esd0JBQXVCLG9CQUFvQjtBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLHNCQUFxQixvQkFBb0I7QUFDekM7QUFDQTtBQUNBLGVBQWMsNkNBQTZDO0FBQzNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVztBQUNYO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFFBQU87O0FBRVA7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBLHNCQUFxQixvQkFBb0I7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQSxzQkFBcUIscUJBQXFCO0FBQzFDO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFxQiwyQkFBMkI7QUFDaEQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEVBQUM7O0FBRUQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUNBQXNDO0FBQ3RDO0FBQ0EsWUFBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFlBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUNBQXNDO0FBQ3RDLFlBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWE7QUFDYjtBQUNBLGNBQWE7QUFDYjtBQUNBLGNBQWE7QUFDYjtBQUNBO0FBQ0EsWUFBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVztBQUNYO0FBQ0EsWUFBVztBQUNYO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVztBQUNYO0FBQ0E7QUFDQSxZQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVztBQUNYO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFlBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2I7QUFDQTtBQUNBLFlBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVztBQUNYO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUEyQixtQkFBbUI7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVc7QUFDWDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2I7QUFDQSxjQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVc7QUFDWDtBQUNBLFlBQVc7QUFDWDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXO0FBQ1g7QUFDQTtBQUNBLGNBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSxZQUFXO0FBQ1g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXO0FBQ1g7QUFDQSxZQUFXO0FBQ1g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWE7QUFDYjtBQUNBLGNBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsWUFBVztBQUNYO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVc7QUFDWDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUEsRUFBQzs7QUFFRDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNCQUFxQixvQkFBb0I7QUFDekM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsRUFBQzs7O0FBR0Q7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZ0NBQStCLDBCQUEwQjtBQUN6RDtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNILEVBQUM7QUFDRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxFQUFDOzs7QUFHRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0NBQThDLCtCQUErQjtBQUM3RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsNENBQTJDLDRCQUE0QjtBQUN2RTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEwQywyQkFBMkI7QUFDckU7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0EscURBQW9ELEtBQUs7QUFDekQ7QUFDQTtBQUNBLDhCQUE2QixJQUFJO0FBQ2pDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW1DLE9BQU87QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsRUFBQzs7QUFFRDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBc0IsaUNBQWlDO0FBQ3ZEO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNCQUFxQixjQUFjO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXNCLG9CQUFvQjtBQUMxQztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsRUFBQzs7QUFFRDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0RBQXFEO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBbUIsb0JBQW9CO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBb0Isd0JBQXdCO0FBQzVDO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUEsRUFBQzs7QUFFRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0E7OztBQUdBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG9CQUFtQixzQkFBc0I7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBLEVBQUM7O0FBRUQ7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxFQUFDOztBQUVEOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxvQkFBbUIsc0JBQXNCO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW1CLHNCQUFzQjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsMEVBQXlFOztBQUV6RTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxFQUFDOztBQUVEO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMEI7O0FBRTFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNDQUFxQyxrQkFBa0I7QUFDdkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBLEVBQUM7O0FBRUQ7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxFQUFDOztBQUVEOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxFQUFDOztBQUVEOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFnQixnQkFBZ0I7QUFDaEMsaUJBQWdCLFVBQVU7QUFDMUIsaUJBQWdCLE9BQU87QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFnQixPQUFPO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQWtCLE9BQU87QUFDekIsaUJBQWdCLE9BQU87QUFDdkIsaUJBQWdCLElBQUk7QUFDcEIsaUJBQWdCLEtBQUs7QUFDckIsaUJBQWdCLFFBQVE7QUFDeEIsaUJBQWdCLFFBQVE7QUFDeEI7QUFDQTtBQUNBO0FBQ0EsZ0VBQStEO0FBQy9EO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWdCLE9BQU87QUFDdkI7QUFDQSxpQkFBZ0IsS0FBSztBQUNyQjtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsRUFBQzs7QUFFRDs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWlDO0FBQ2pDLHlEQUF3RDtBQUN4RDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWEsS0FBSztBQUNsQixjQUFhLE9BQU87QUFDcEIsY0FBYSxTQUFTO0FBQ3RCLGNBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYSxLQUFLO0FBQ2xCLGNBQWEsT0FBTztBQUNwQixjQUFhLFNBQVM7QUFDdEIsY0FBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsRUFBQzs7QUFFRDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwREFBeUQsa0JBQWtCO0FBQzNFO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBNkM7QUFDN0MsOERBQTZEO0FBQzdEO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUEsRUFBQzs7QUFFRDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBcUMsb0JBQW9CO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTCxxQ0FBb0M7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXFCLGdDQUFnQztBQUNyRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXFCLHNCQUFzQjtBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQSxrRUFBaUU7QUFDakU7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBLEVBQUM7O0FBRUQ7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWUsU0FBUztBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBcUIsc0JBQXNCO0FBQzNDO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esd0NBQXVDLE9BQU87QUFDOUM7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsNEJBQTJCLEVBQUUsS0FBSyxLQUFLOztBQUV2Qzs7QUFFQTtBQUNBOztBQUVBLEVBQUM7O0FBRUQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBYztBQUNkO0FBQ0E7QUFDQTtBQUNBLHVCQUFzQixPQUFPO0FBQzdCLHlCQUF3QixTQUFTO0FBQ2pDLHVCQUFzQixPQUFPO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFlO0FBQ2Y7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQWtDO0FBQ2xDLCtDQUE4QyxNQUFNO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQWtDO0FBQ2xDLCtDQUE4QyxNQUFNO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0NBQXFDLG9CQUFvQjtBQUN6RDtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQW9CLEtBQUs7QUFDekIseUJBQXdCLFNBQVMsNkdBQTZHO0FBQzlJO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFPO0FBQ1AsK0JBQThCLCtCQUErQjtBQUM3RDtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFvQixPQUFPO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxFQUFDOztBQUVEOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEwQyx1QkFBdUI7QUFDakU7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSw4RkFBNkY7QUFDN0YsUUFBTztBQUNQLDhEQUE2RDtBQUM3RDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUEsRUFBQzs7QUFFRDs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSw4QkFBNkI7QUFDN0I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnREFBK0MsOEJBQThCO0FBQzdFO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDs7QUFFQSxFQUFDOztBQUVEOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUNBQXdDO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBLG9CQUFtQixtQkFBbUI7QUFDdEM7QUFDQTtBQUNBLGFBQVksT0FBTztBQUNuQixhQUFZLE9BQU87QUFDbkI7QUFDQSxjQUFhLE9BQU87QUFDcEI7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsRUFBQzs7QUFFRDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0EsdUNBQXNDLG9CQUFvQjtBQUMxRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0Esd0RBQXVELGtCQUFrQjtBQUN6RTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNDQUFxQyxvQkFBb0I7QUFDekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUCxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNDQUFxQztBQUNyQzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBNkM7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUEsRUFBQzs7QUFFRDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQSx1QkFBc0Isc0JBQXNCO0FBQzVDO0FBQ0E7QUFDQTtBQUNBLDBFQUF5RTtBQUN6RSwyQkFBMEI7QUFDMUI7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFvQixzQkFBc0I7QUFDMUM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQSxFQUFDOztBQUVEOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUFnRDtBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBMkIsYUFBYTtBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUEyQixhQUFhO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZSwyQkFBMkI7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxVQUFTO0FBQ1Q7QUFDQSxRQUFPO0FBQ1AsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLDBDQUF5QyxvQkFBb0I7QUFDN0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUF5QyxvQkFBb0I7QUFDN0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxFQUFDOztBQUVEOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1FQUFrRTtBQUNsRTtBQUNBO0FBQ0E7QUFDQSx5Q0FBd0MsS0FBSztBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFtQyxvQkFBb0I7QUFDdkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBLEVBQUM7O0FBRUQ7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxFQUFDOztBQUVEOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUEsRUFBQzs7QUFFRDs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBLDBDQUF5QztBQUN6QywyQkFBMEI7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMENBQXlDO0FBQ3pDLDJCQUEwQjtBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0wsTUFBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHFCQUFvQixRQUFRO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBLE1BQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDOztBQUVEOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQOztBQUVBLElBQUc7O0FBRUg7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EseUNBQXdDLGNBQWM7QUFDdEQ7QUFDQSxJQUFHOztBQUVIOztBQUVBLGdEQUErQyxxQkFBcUI7O0FBRXBFLEVBQUM7O0FBRUQ7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUTtBQUNSO0FBQ0E7QUFDQSxZQUFXLEtBQUs7QUFDaEIsWUFBVyxTQUFTO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFRO0FBQ1I7QUFDQTtBQUNBLFlBQVcsTUFBTTtBQUNqQixZQUFXLFNBQVM7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBNkMsd0JBQXdCO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLEVBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBNkMsT0FBTztBQUNwRCwyQkFBMEIsT0FBTztBQUNqQyw0QkFBMkIsV0FBVztBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQThCO0FBQzlCO0FBQ0EsVUFBUztBQUNULFFBQU87QUFDUCxNQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBLDJDQUEwQyxtQkFBbUI7O0FBRTdEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsSUFBRzs7QUFFSCxFQUFDOzs7Ozs7OztBQ2xsWEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL2Jvb3RzdHJhcCA3NTQwYjRlMGExMDlmZDZhODExZFxuICoqLyIsInZhciBQb2x5bWVyID0gcmVxdWlyZShcInBvbHltZXJcIilcblxuY29uc29sZS5sb2cocG9seW1lcilcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9pbmRleC5qc1xuICoqIG1vZHVsZSBpZCA9IDBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCAoYykgMjAxNCBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXQgaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0IGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuICogVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0IGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4gKiBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuICogc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdCBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcbiAqL1xuLy8gQHZlcnNpb24gMC41LjVcbndpbmRvdy5Qb2x5bWVyR2VzdHVyZXMgPSB7fTtcblxuKGZ1bmN0aW9uKHNjb3BlKSB7XG4gIHZhciBoYXNGdWxsUGF0aCA9IGZhbHNlO1xuXG4gIC8vIHRlc3QgZm9yIGZ1bGwgZXZlbnQgcGF0aCBzdXBwb3J0XG4gIHZhciBwYXRoVGVzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ21ldGEnKTtcbiAgaWYgKHBhdGhUZXN0LmNyZWF0ZVNoYWRvd1Jvb3QpIHtcbiAgICB2YXIgc3IgPSBwYXRoVGVzdC5jcmVhdGVTaGFkb3dSb290KCk7XG4gICAgdmFyIHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgc3IuYXBwZW5kQ2hpbGQocyk7XG4gICAgcGF0aFRlc3QuYWRkRXZlbnRMaXN0ZW5lcigndGVzdHBhdGgnLCBmdW5jdGlvbihldikge1xuICAgICAgaWYgKGV2LnBhdGgpIHtcbiAgICAgICAgLy8gaWYgdGhlIHNwYW4gaXMgaW4gdGhlIGV2ZW50IHBhdGgsIHRoZW4gcGF0aFswXSBpcyB0aGUgcmVhbCBzb3VyY2UgZm9yIGFsbCBldmVudHNcbiAgICAgICAgaGFzRnVsbFBhdGggPSBldi5wYXRoWzBdID09PSBzO1xuICAgICAgfVxuICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfSk7XG4gICAgdmFyIGV2ID0gbmV3IEN1c3RvbUV2ZW50KCd0ZXN0cGF0aCcsIHtidWJibGVzOiB0cnVlfSk7XG4gICAgLy8gbXVzdCBhZGQgbm9kZSB0byBET00gdG8gdHJpZ2dlciBldmVudCBsaXN0ZW5lclxuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQocGF0aFRlc3QpO1xuICAgIHMuZGlzcGF0Y2hFdmVudChldik7XG4gICAgcGF0aFRlc3QucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChwYXRoVGVzdCk7XG4gICAgc3IgPSBzID0gbnVsbDtcbiAgfVxuICBwYXRoVGVzdCA9IG51bGw7XG5cbiAgdmFyIHRhcmdldCA9IHtcbiAgICBzaGFkb3c6IGZ1bmN0aW9uKGluRWwpIHtcbiAgICAgIGlmIChpbkVsKSB7XG4gICAgICAgIHJldHVybiBpbkVsLnNoYWRvd1Jvb3QgfHwgaW5FbC53ZWJraXRTaGFkb3dSb290O1xuICAgICAgfVxuICAgIH0sXG4gICAgY2FuVGFyZ2V0OiBmdW5jdGlvbihzaGFkb3cpIHtcbiAgICAgIHJldHVybiBzaGFkb3cgJiYgQm9vbGVhbihzaGFkb3cuZWxlbWVudEZyb21Qb2ludCk7XG4gICAgfSxcbiAgICB0YXJnZXRpbmdTaGFkb3c6IGZ1bmN0aW9uKGluRWwpIHtcbiAgICAgIHZhciBzID0gdGhpcy5zaGFkb3coaW5FbCk7XG4gICAgICBpZiAodGhpcy5jYW5UYXJnZXQocykpIHtcbiAgICAgICAgcmV0dXJuIHM7XG4gICAgICB9XG4gICAgfSxcbiAgICBvbGRlclNoYWRvdzogZnVuY3Rpb24oc2hhZG93KSB7XG4gICAgICB2YXIgb3MgPSBzaGFkb3cub2xkZXJTaGFkb3dSb290O1xuICAgICAgaWYgKCFvcykge1xuICAgICAgICB2YXIgc2UgPSBzaGFkb3cucXVlcnlTZWxlY3Rvcignc2hhZG93Jyk7XG4gICAgICAgIGlmIChzZSkge1xuICAgICAgICAgIG9zID0gc2Uub2xkZXJTaGFkb3dSb290O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gb3M7XG4gICAgfSxcbiAgICBhbGxTaGFkb3dzOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICB2YXIgc2hhZG93cyA9IFtdLCBzID0gdGhpcy5zaGFkb3coZWxlbWVudCk7XG4gICAgICB3aGlsZShzKSB7XG4gICAgICAgIHNoYWRvd3MucHVzaChzKTtcbiAgICAgICAgcyA9IHRoaXMub2xkZXJTaGFkb3cocyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2hhZG93cztcbiAgICB9LFxuICAgIHNlYXJjaFJvb3Q6IGZ1bmN0aW9uKGluUm9vdCwgeCwgeSkge1xuICAgICAgdmFyIHQsIHN0LCBzciwgb3M7XG4gICAgICBpZiAoaW5Sb290KSB7XG4gICAgICAgIHQgPSBpblJvb3QuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcbiAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAvLyBmb3VuZCBlbGVtZW50LCBjaGVjayBpZiBpdCBoYXMgYSBTaGFkb3dSb290XG4gICAgICAgICAgc3IgPSB0aGlzLnRhcmdldGluZ1NoYWRvdyh0KTtcbiAgICAgICAgfSBlbHNlIGlmIChpblJvb3QgIT09IGRvY3VtZW50KSB7XG4gICAgICAgICAgLy8gY2hlY2sgZm9yIHNpYmxpbmcgcm9vdHNcbiAgICAgICAgICBzciA9IHRoaXMub2xkZXJTaGFkb3coaW5Sb290KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzZWFyY2ggb3RoZXIgcm9vdHMsIGZhbGwgYmFjayB0byBsaWdodCBkb20gZWxlbWVudFxuICAgICAgICByZXR1cm4gdGhpcy5zZWFyY2hSb290KHNyLCB4LCB5KSB8fCB0O1xuICAgICAgfVxuICAgIH0sXG4gICAgb3duZXI6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIGlmICghZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQ7XG4gICAgICB9XG4gICAgICB2YXIgcyA9IGVsZW1lbnQ7XG4gICAgICAvLyB3YWxrIHVwIHVudGlsIHlvdSBoaXQgdGhlIHNoYWRvdyByb290IG9yIGRvY3VtZW50XG4gICAgICB3aGlsZSAocy5wYXJlbnROb2RlKSB7XG4gICAgICAgIHMgPSBzLnBhcmVudE5vZGU7XG4gICAgICB9XG4gICAgICAvLyB0aGUgb3duZXIgZWxlbWVudCBpcyBleHBlY3RlZCB0byBiZSBhIERvY3VtZW50IG9yIFNoYWRvd1Jvb3RcbiAgICAgIGlmIChzLm5vZGVUeXBlICE9IE5vZGUuRE9DVU1FTlRfTk9ERSAmJiBzLm5vZGVUeXBlICE9IE5vZGUuRE9DVU1FTlRfRlJBR01FTlRfTk9ERSkge1xuICAgICAgICBzID0gZG9jdW1lbnQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gcztcbiAgICB9LFxuICAgIGZpbmRUYXJnZXQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGlmIChoYXNGdWxsUGF0aCAmJiBpbkV2ZW50LnBhdGggJiYgaW5FdmVudC5wYXRoLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gaW5FdmVudC5wYXRoWzBdO1xuICAgICAgfVxuICAgICAgdmFyIHggPSBpbkV2ZW50LmNsaWVudFgsIHkgPSBpbkV2ZW50LmNsaWVudFk7XG4gICAgICAvLyBpZiB0aGUgbGlzdGVuZXIgaXMgaW4gdGhlIHNoYWRvdyByb290LCBpdCBpcyBtdWNoIGZhc3RlciB0byBzdGFydCB0aGVyZVxuICAgICAgdmFyIHMgPSB0aGlzLm93bmVyKGluRXZlbnQudGFyZ2V0KTtcbiAgICAgIC8vIGlmIHgsIHkgaXMgbm90IGluIHRoaXMgcm9vdCwgZmFsbCBiYWNrIHRvIGRvY3VtZW50IHNlYXJjaFxuICAgICAgaWYgKCFzLmVsZW1lbnRGcm9tUG9pbnQoeCwgeSkpIHtcbiAgICAgICAgcyA9IGRvY3VtZW50O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuc2VhcmNoUm9vdChzLCB4LCB5KTtcbiAgICB9LFxuICAgIGZpbmRUb3VjaEFjdGlvbjogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIG47XG4gICAgICBpZiAoaGFzRnVsbFBhdGggJiYgaW5FdmVudC5wYXRoICYmIGluRXZlbnQucGF0aC5sZW5ndGgpIHtcbiAgICAgICAgdmFyIHBhdGggPSBpbkV2ZW50LnBhdGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGF0aC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIG4gPSBwYXRoW2ldO1xuICAgICAgICAgIGlmIChuLm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERSAmJiBuLmhhc0F0dHJpYnV0ZSgndG91Y2gtYWN0aW9uJykpIHtcbiAgICAgICAgICAgIHJldHVybiBuLmdldEF0dHJpYnV0ZSgndG91Y2gtYWN0aW9uJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuID0gaW5FdmVudC50YXJnZXQ7XG4gICAgICAgIHdoaWxlKG4pIHtcbiAgICAgICAgICBpZiAobi5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREUgJiYgbi5oYXNBdHRyaWJ1dGUoJ3RvdWNoLWFjdGlvbicpKSB7XG4gICAgICAgICAgICByZXR1cm4gbi5nZXRBdHRyaWJ1dGUoJ3RvdWNoLWFjdGlvbicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBuID0gbi5wYXJlbnROb2RlIHx8IG4uaG9zdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gYXV0byBpcyBkZWZhdWx0XG4gICAgICByZXR1cm4gXCJhdXRvXCI7XG4gICAgfSxcbiAgICBMQ0E6IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIGlmIChhID09PSBiKSB7XG4gICAgICAgIHJldHVybiBhO1xuICAgICAgfVxuICAgICAgaWYgKGEgJiYgIWIpIHtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgICB9XG4gICAgICBpZiAoYiAmJiAhYSkge1xuICAgICAgICByZXR1cm4gYjtcbiAgICAgIH1cbiAgICAgIGlmICghYiAmJiAhYSkge1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQ7XG4gICAgICB9XG4gICAgICAvLyBmYXN0IGNhc2UsIGEgaXMgYSBkaXJlY3QgZGVzY2VuZGFudCBvZiBiIG9yIHZpY2UgdmVyc2FcbiAgICAgIGlmIChhLmNvbnRhaW5zICYmIGEuY29udGFpbnMoYikpIHtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgICB9XG4gICAgICBpZiAoYi5jb250YWlucyAmJiBiLmNvbnRhaW5zKGEpKSB7XG4gICAgICAgIHJldHVybiBiO1xuICAgICAgfVxuICAgICAgdmFyIGFkZXB0aCA9IHRoaXMuZGVwdGgoYSk7XG4gICAgICB2YXIgYmRlcHRoID0gdGhpcy5kZXB0aChiKTtcbiAgICAgIHZhciBkID0gYWRlcHRoIC0gYmRlcHRoO1xuICAgICAgaWYgKGQgPj0gMCkge1xuICAgICAgICBhID0gdGhpcy53YWxrKGEsIGQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYiA9IHRoaXMud2FsayhiLCAtZCk7XG4gICAgICB9XG4gICAgICB3aGlsZSAoYSAmJiBiICYmIGEgIT09IGIpIHtcbiAgICAgICAgYSA9IGEucGFyZW50Tm9kZSB8fCBhLmhvc3Q7XG4gICAgICAgIGIgPSBiLnBhcmVudE5vZGUgfHwgYi5ob3N0O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGE7XG4gICAgfSxcbiAgICB3YWxrOiBmdW5jdGlvbihuLCB1KSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgbiAmJiAoaSA8IHUpOyBpKyspIHtcbiAgICAgICAgbiA9IG4ucGFyZW50Tm9kZSB8fCBuLmhvc3Q7XG4gICAgICB9XG4gICAgICByZXR1cm4gbjtcbiAgICB9LFxuICAgIGRlcHRoOiBmdW5jdGlvbihuKSB7XG4gICAgICB2YXIgZCA9IDA7XG4gICAgICB3aGlsZShuKSB7XG4gICAgICAgIGQrKztcbiAgICAgICAgbiA9IG4ucGFyZW50Tm9kZSB8fCBuLmhvc3Q7XG4gICAgICB9XG4gICAgICByZXR1cm4gZDtcbiAgICB9LFxuICAgIGRlZXBDb250YWluczogZnVuY3Rpb24oYSwgYikge1xuICAgICAgdmFyIGNvbW1vbiA9IHRoaXMuTENBKGEsIGIpO1xuICAgICAgLy8gaWYgYSBpcyB0aGUgY29tbW9uIGFuY2VzdG9yLCBpdCBtdXN0IFwiZGVlcGx5XCIgY29udGFpbiBiXG4gICAgICByZXR1cm4gY29tbW9uID09PSBhO1xuICAgIH0sXG4gICAgaW5zaWRlTm9kZTogZnVuY3Rpb24obm9kZSwgeCwgeSkge1xuICAgICAgdmFyIHJlY3QgPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgcmV0dXJuIChyZWN0LmxlZnQgPD0geCkgJiYgKHggPD0gcmVjdC5yaWdodCkgJiYgKHJlY3QudG9wIDw9IHkpICYmICh5IDw9IHJlY3QuYm90dG9tKTtcbiAgICB9LFxuICAgIHBhdGg6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB2YXIgcDtcbiAgICAgIGlmIChoYXNGdWxsUGF0aCAmJiBldmVudC5wYXRoICYmIGV2ZW50LnBhdGgubGVuZ3RoKSB7XG4gICAgICAgIHAgPSBldmVudC5wYXRoO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcCA9IFtdO1xuICAgICAgICB2YXIgbiA9IHRoaXMuZmluZFRhcmdldChldmVudCk7XG4gICAgICAgIHdoaWxlIChuKSB7XG4gICAgICAgICAgcC5wdXNoKG4pO1xuICAgICAgICAgIG4gPSBuLnBhcmVudE5vZGUgfHwgbi5ob3N0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcDtcbiAgICB9XG4gIH07XG4gIHNjb3BlLnRhcmdldEZpbmRpbmcgPSB0YXJnZXQ7XG4gIC8qKlxuICAgKiBHaXZlbiBhbiBldmVudCwgZmluZHMgdGhlIFwiZGVlcGVzdFwiIG5vZGUgdGhhdCBjb3VsZCBoYXZlIGJlZW4gdGhlIG9yaWdpbmFsIHRhcmdldCBiZWZvcmUgU2hhZG93RE9NIHJldGFyZ2V0dGluZ1xuICAgKlxuICAgKiBAcGFyYW0ge0V2ZW50fSBFdmVudCBBbiBldmVudCBvYmplY3Qgd2l0aCBjbGllbnRYIGFuZCBjbGllbnRZIHByb3BlcnRpZXNcbiAgICogQHJldHVybiB7RWxlbWVudH0gVGhlIHByb2JhYmxlIGV2ZW50IG9yaWduaW5hdG9yXG4gICAqL1xuICBzY29wZS5maW5kVGFyZ2V0ID0gdGFyZ2V0LmZpbmRUYXJnZXQuYmluZCh0YXJnZXQpO1xuICAvKipcbiAgICogRGV0ZXJtaW5lcyBpZiB0aGUgXCJjb250YWluZXJcIiBub2RlIGRlZXBseSBjb250YWlucyB0aGUgXCJjb250YWluZWVcIiBub2RlLCBpbmNsdWRpbmcgc2l0dWF0aW9ucyB3aGVyZSB0aGUgXCJjb250YWluZWVcIiBpcyBjb250YWluZWQgYnkgb25lIG9yIG1vcmUgU2hhZG93RE9NXG4gICAqIHJvb3RzLlxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IGNvbnRhaW5lclxuICAgKiBAcGFyYW0ge05vZGV9IGNvbnRhaW5lZVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cbiAgc2NvcGUuZGVlcENvbnRhaW5zID0gdGFyZ2V0LmRlZXBDb250YWlucy5iaW5kKHRhcmdldCk7XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgaWYgdGhlIHgveSBwb3NpdGlvbiBpcyBpbnNpZGUgdGhlIGdpdmVuIG5vZGUuXG4gICAqXG4gICAqIEV4YW1wbGU6XG4gICAqXG4gICAqICAgICBmdW5jdGlvbiB1cEhhbmRsZXIoZXZlbnQpIHtcbiAgICogICAgICAgdmFyIGlubm9kZSA9IFBvbHltZXJHZXN0dXJlcy5pbnNpZGVOb2RlKGV2ZW50LnRhcmdldCwgZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSk7XG4gICAqICAgICAgIGlmIChpbm5vZGUpIHtcbiAgICogICAgICAgICAvLyB3YWl0IGZvciB0YXA/XG4gICAqICAgICAgIH0gZWxzZSB7XG4gICAqICAgICAgICAgLy8gdGFwIHdpbGwgbmV2ZXIgaGFwcGVuXG4gICAqICAgICAgIH1cbiAgICogICAgIH1cbiAgICpcbiAgICogQHBhcmFtIHtOb2RlfSBub2RlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB4IFNjcmVlbiBYIHBvc2l0aW9uXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB5IHNjcmVlbiBZIHBvc2l0aW9uXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuICBzY29wZS5pbnNpZGVOb2RlID0gdGFyZ2V0Lmluc2lkZU5vZGU7XG5cbn0pKHdpbmRvdy5Qb2x5bWVyR2VzdHVyZXMpO1xuXG4oZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIHNoYWRvd1NlbGVjdG9yKHYpIHtcbiAgICByZXR1cm4gJ2h0bWwgL2RlZXAvICcgKyBzZWxlY3Rvcih2KTtcbiAgfVxuICBmdW5jdGlvbiBzZWxlY3Rvcih2KSB7XG4gICAgcmV0dXJuICdbdG91Y2gtYWN0aW9uPVwiJyArIHYgKyAnXCJdJztcbiAgfVxuICBmdW5jdGlvbiBydWxlKHYpIHtcbiAgICByZXR1cm4gJ3sgLW1zLXRvdWNoLWFjdGlvbjogJyArIHYgKyAnOyB0b3VjaC1hY3Rpb246ICcgKyB2ICsgJzt9JztcbiAgfVxuICB2YXIgYXR0cmliMmNzcyA9IFtcbiAgICAnbm9uZScsXG4gICAgJ2F1dG8nLFxuICAgICdwYW4teCcsXG4gICAgJ3Bhbi15JyxcbiAgICB7XG4gICAgICBydWxlOiAncGFuLXggcGFuLXknLFxuICAgICAgc2VsZWN0b3JzOiBbXG4gICAgICAgICdwYW4teCBwYW4teScsXG4gICAgICAgICdwYW4teSBwYW4teCdcbiAgICAgIF1cbiAgICB9LFxuICAgICdtYW5pcHVsYXRpb24nXG4gIF07XG4gIHZhciBzdHlsZXMgPSAnJztcbiAgLy8gb25seSBpbnN0YWxsIHN0eWxlc2hlZXQgaWYgdGhlIGJyb3dzZXIgaGFzIHRvdWNoIGFjdGlvbiBzdXBwb3J0XG4gIHZhciBoYXNUb3VjaEFjdGlvbiA9IHR5cGVvZiBkb2N1bWVudC5oZWFkLnN0eWxlLnRvdWNoQWN0aW9uID09PSAnc3RyaW5nJztcbiAgLy8gb25seSBhZGQgc2hhZG93IHNlbGVjdG9ycyBpZiBzaGFkb3dkb20gaXMgc3VwcG9ydGVkXG4gIHZhciBoYXNTaGFkb3dSb290ID0gIXdpbmRvdy5TaGFkb3dET01Qb2x5ZmlsbCAmJiBkb2N1bWVudC5oZWFkLmNyZWF0ZVNoYWRvd1Jvb3Q7XG5cbiAgaWYgKGhhc1RvdWNoQWN0aW9uKSB7XG4gICAgYXR0cmliMmNzcy5mb3JFYWNoKGZ1bmN0aW9uKHIpIHtcbiAgICAgIGlmIChTdHJpbmcocikgPT09IHIpIHtcbiAgICAgICAgc3R5bGVzICs9IHNlbGVjdG9yKHIpICsgcnVsZShyKSArICdcXG4nO1xuICAgICAgICBpZiAoaGFzU2hhZG93Um9vdCkge1xuICAgICAgICAgIHN0eWxlcyArPSBzaGFkb3dTZWxlY3RvcihyKSArIHJ1bGUocikgKyAnXFxuJztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3R5bGVzICs9IHIuc2VsZWN0b3JzLm1hcChzZWxlY3RvcikgKyBydWxlKHIucnVsZSkgKyAnXFxuJztcbiAgICAgICAgaWYgKGhhc1NoYWRvd1Jvb3QpIHtcbiAgICAgICAgICBzdHlsZXMgKz0gci5zZWxlY3RvcnMubWFwKHNoYWRvd1NlbGVjdG9yKSArIHJ1bGUoci5ydWxlKSArICdcXG4nO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIGVsLnRleHRDb250ZW50ID0gc3R5bGVzO1xuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoZWwpO1xuICB9XG59KSgpO1xuXG4vKipcbiAqIFRoaXMgaXMgdGhlIGNvbnN0cnVjdG9yIGZvciBuZXcgUG9pbnRlckV2ZW50cy5cbiAqXG4gKiBOZXcgUG9pbnRlciBFdmVudHMgbXVzdCBiZSBnaXZlbiBhIHR5cGUsIGFuZCBhbiBvcHRpb25hbCBkaWN0aW9uYXJ5IG9mXG4gKiBpbml0aWFsaXphdGlvbiBwcm9wZXJ0aWVzLlxuICpcbiAqIER1ZSB0byBjZXJ0YWluIHBsYXRmb3JtIHJlcXVpcmVtZW50cywgZXZlbnRzIHJldHVybmVkIGZyb20gdGhlIGNvbnN0cnVjdG9yXG4gKiBpZGVudGlmeSBhcyBNb3VzZUV2ZW50cy5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7U3RyaW5nfSBpblR5cGUgVGhlIHR5cGUgb2YgdGhlIGV2ZW50IHRvIGNyZWF0ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbaW5EaWN0XSBBbiBvcHRpb25hbCBkaWN0aW9uYXJ5IG9mIGluaXRpYWwgZXZlbnQgcHJvcGVydGllcy5cbiAqIEByZXR1cm4ge0V2ZW50fSBBIG5ldyBQb2ludGVyRXZlbnQgb2YgdHlwZSBgaW5UeXBlYCBhbmQgaW5pdGlhbGl6ZWQgd2l0aCBwcm9wZXJ0aWVzIGZyb20gYGluRGljdGAuXG4gKi9cbihmdW5jdGlvbihzY29wZSkge1xuXG4gIHZhciBNT1VTRV9QUk9QUyA9IFtcbiAgICAnYnViYmxlcycsXG4gICAgJ2NhbmNlbGFibGUnLFxuICAgICd2aWV3JyxcbiAgICAnZGV0YWlsJyxcbiAgICAnc2NyZWVuWCcsXG4gICAgJ3NjcmVlblknLFxuICAgICdjbGllbnRYJyxcbiAgICAnY2xpZW50WScsXG4gICAgJ2N0cmxLZXknLFxuICAgICdhbHRLZXknLFxuICAgICdzaGlmdEtleScsXG4gICAgJ21ldGFLZXknLFxuICAgICdidXR0b24nLFxuICAgICdyZWxhdGVkVGFyZ2V0JyxcbiAgICAncGFnZVgnLFxuICAgICdwYWdlWSdcbiAgXTtcblxuICB2YXIgTU9VU0VfREVGQVVMVFMgPSBbXG4gICAgZmFsc2UsXG4gICAgZmFsc2UsXG4gICAgbnVsbCxcbiAgICBudWxsLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgZmFsc2UsXG4gICAgZmFsc2UsXG4gICAgZmFsc2UsXG4gICAgZmFsc2UsXG4gICAgMCxcbiAgICBudWxsLFxuICAgIDAsXG4gICAgMFxuICBdO1xuXG4gIHZhciBOT1BfRkFDVE9SWSA9IGZ1bmN0aW9uKCl7IHJldHVybiBmdW5jdGlvbigpe307IH07XG5cbiAgdmFyIGV2ZW50RmFjdG9yeSA9IHtcbiAgICAvLyBUT0RPKGRmcmVlZG0pOiB0aGlzIGlzIG92ZXJyaWRkZW4gYnkgdGFwIHJlY29nbml6ZXIsIG5lZWRzIHJldmlld1xuICAgIHByZXZlbnRUYXA6IE5PUF9GQUNUT1JZLFxuICAgIG1ha2VCYXNlRXZlbnQ6IGZ1bmN0aW9uKGluVHlwZSwgaW5EaWN0KSB7XG4gICAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgICAgZS5pbml0RXZlbnQoaW5UeXBlLCBpbkRpY3QuYnViYmxlcyB8fCBmYWxzZSwgaW5EaWN0LmNhbmNlbGFibGUgfHwgZmFsc2UpO1xuICAgICAgZS5wcmV2ZW50VGFwID0gZXZlbnRGYWN0b3J5LnByZXZlbnRUYXAoZSk7XG4gICAgICByZXR1cm4gZTtcbiAgICB9LFxuICAgIG1ha2VHZXN0dXJlRXZlbnQ6IGZ1bmN0aW9uKGluVHlwZSwgaW5EaWN0KSB7XG4gICAgICBpbkRpY3QgPSBpbkRpY3QgfHwgT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICAgICAgdmFyIGUgPSB0aGlzLm1ha2VCYXNlRXZlbnQoaW5UeXBlLCBpbkRpY3QpO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGtleXMgPSBPYmplY3Qua2V5cyhpbkRpY3QpLCBrOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBrID0ga2V5c1tpXTtcbiAgICAgICAgaWYoIGsgIT09ICdidWJibGVzJyAmJiBrICE9PSAnY2FuY2VsYWJsZScgKSB7XG4gICAgICAgICAgIGVba10gPSBpbkRpY3Rba107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBlO1xuICAgIH0sXG4gICAgbWFrZVBvaW50ZXJFdmVudDogZnVuY3Rpb24oaW5UeXBlLCBpbkRpY3QpIHtcbiAgICAgIGluRGljdCA9IGluRGljdCB8fCBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gICAgICB2YXIgZSA9IHRoaXMubWFrZUJhc2VFdmVudChpblR5cGUsIGluRGljdCk7XG4gICAgICAvLyBkZWZpbmUgaW5oZXJpdGVkIE1vdXNlRXZlbnQgcHJvcGVydGllc1xuICAgICAgZm9yKHZhciBpID0gMiwgcDsgaSA8IE1PVVNFX1BST1BTLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHAgPSBNT1VTRV9QUk9QU1tpXTtcbiAgICAgICAgZVtwXSA9IGluRGljdFtwXSB8fCBNT1VTRV9ERUZBVUxUU1tpXTtcbiAgICAgIH1cbiAgICAgIGUuYnV0dG9ucyA9IGluRGljdC5idXR0b25zIHx8IDA7XG5cbiAgICAgIC8vIFNwZWMgcmVxdWlyZXMgdGhhdCBwb2ludGVycyB3aXRob3V0IHByZXNzdXJlIHNwZWNpZmllZCB1c2UgMC41IGZvciBkb3duXG4gICAgICAvLyBzdGF0ZSBhbmQgMCBmb3IgdXAgc3RhdGUuXG4gICAgICB2YXIgcHJlc3N1cmUgPSAwO1xuICAgICAgaWYgKGluRGljdC5wcmVzc3VyZSkge1xuICAgICAgICBwcmVzc3VyZSA9IGluRGljdC5wcmVzc3VyZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByZXNzdXJlID0gZS5idXR0b25zID8gMC41IDogMDtcbiAgICAgIH1cblxuICAgICAgLy8gYWRkIHgveSBwcm9wZXJ0aWVzIGFsaWFzZWQgdG8gY2xpZW50WC9ZXG4gICAgICBlLnggPSBlLmNsaWVudFg7XG4gICAgICBlLnkgPSBlLmNsaWVudFk7XG5cbiAgICAgIC8vIGRlZmluZSB0aGUgcHJvcGVydGllcyBvZiB0aGUgUG9pbnRlckV2ZW50IGludGVyZmFjZVxuICAgICAgZS5wb2ludGVySWQgPSBpbkRpY3QucG9pbnRlcklkIHx8IDA7XG4gICAgICBlLndpZHRoID0gaW5EaWN0LndpZHRoIHx8IDA7XG4gICAgICBlLmhlaWdodCA9IGluRGljdC5oZWlnaHQgfHwgMDtcbiAgICAgIGUucHJlc3N1cmUgPSBwcmVzc3VyZTtcbiAgICAgIGUudGlsdFggPSBpbkRpY3QudGlsdFggfHwgMDtcbiAgICAgIGUudGlsdFkgPSBpbkRpY3QudGlsdFkgfHwgMDtcbiAgICAgIGUucG9pbnRlclR5cGUgPSBpbkRpY3QucG9pbnRlclR5cGUgfHwgJyc7XG4gICAgICBlLmh3VGltZXN0YW1wID0gaW5EaWN0Lmh3VGltZXN0YW1wIHx8IDA7XG4gICAgICBlLmlzUHJpbWFyeSA9IGluRGljdC5pc1ByaW1hcnkgfHwgZmFsc2U7XG4gICAgICBlLl9zb3VyY2UgPSBpbkRpY3QuX3NvdXJjZSB8fCAnJztcbiAgICAgIHJldHVybiBlO1xuICAgIH1cbiAgfTtcblxuICBzY29wZS5ldmVudEZhY3RvcnkgPSBldmVudEZhY3Rvcnk7XG59KSh3aW5kb3cuUG9seW1lckdlc3R1cmVzKTtcblxuLyoqXG4gKiBUaGlzIG1vZHVsZSBpbXBsZW1lbnRzIGFuIG1hcCBvZiBwb2ludGVyIHN0YXRlc1xuICovXG4oZnVuY3Rpb24oc2NvcGUpIHtcbiAgdmFyIFVTRV9NQVAgPSB3aW5kb3cuTWFwICYmIHdpbmRvdy5NYXAucHJvdG90eXBlLmZvckVhY2g7XG4gIHZhciBQT0lOVEVSU19GTiA9IGZ1bmN0aW9uKCl7IHJldHVybiB0aGlzLnNpemU7IH07XG4gIGZ1bmN0aW9uIFBvaW50ZXJNYXAoKSB7XG4gICAgaWYgKFVTRV9NQVApIHtcbiAgICAgIHZhciBtID0gbmV3IE1hcCgpO1xuICAgICAgbS5wb2ludGVycyA9IFBPSU5URVJTX0ZOO1xuICAgICAgcmV0dXJuIG07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMua2V5cyA9IFtdO1xuICAgICAgdGhpcy52YWx1ZXMgPSBbXTtcbiAgICB9XG4gIH1cblxuICBQb2ludGVyTWFwLnByb3RvdHlwZSA9IHtcbiAgICBzZXQ6IGZ1bmN0aW9uKGluSWQsIGluRXZlbnQpIHtcbiAgICAgIHZhciBpID0gdGhpcy5rZXlzLmluZGV4T2YoaW5JZCk7XG4gICAgICBpZiAoaSA+IC0xKSB7XG4gICAgICAgIHRoaXMudmFsdWVzW2ldID0gaW5FdmVudDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMua2V5cy5wdXNoKGluSWQpO1xuICAgICAgICB0aGlzLnZhbHVlcy5wdXNoKGluRXZlbnQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgaGFzOiBmdW5jdGlvbihpbklkKSB7XG4gICAgICByZXR1cm4gdGhpcy5rZXlzLmluZGV4T2YoaW5JZCkgPiAtMTtcbiAgICB9LFxuICAgICdkZWxldGUnOiBmdW5jdGlvbihpbklkKSB7XG4gICAgICB2YXIgaSA9IHRoaXMua2V5cy5pbmRleE9mKGluSWQpO1xuICAgICAgaWYgKGkgPiAtMSkge1xuICAgICAgICB0aGlzLmtleXMuc3BsaWNlKGksIDEpO1xuICAgICAgICB0aGlzLnZhbHVlcy5zcGxpY2UoaSwgMSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBnZXQ6IGZ1bmN0aW9uKGluSWQpIHtcbiAgICAgIHZhciBpID0gdGhpcy5rZXlzLmluZGV4T2YoaW5JZCk7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZXNbaV07XG4gICAgfSxcbiAgICBjbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmtleXMubGVuZ3RoID0gMDtcbiAgICAgIHRoaXMudmFsdWVzLmxlbmd0aCA9IDA7XG4gICAgfSxcbiAgICAvLyByZXR1cm4gdmFsdWUsIGtleSwgbWFwXG4gICAgZm9yRWFjaDogZnVuY3Rpb24oY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIHRoaXMudmFsdWVzLmZvckVhY2goZnVuY3Rpb24odiwgaSkge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHYsIHRoaXMua2V5c1tpXSwgdGhpcyk7XG4gICAgICB9LCB0aGlzKTtcbiAgICB9LFxuICAgIHBvaW50ZXJzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmtleXMubGVuZ3RoO1xuICAgIH1cbiAgfTtcblxuICBzY29wZS5Qb2ludGVyTWFwID0gUG9pbnRlck1hcDtcbn0pKHdpbmRvdy5Qb2x5bWVyR2VzdHVyZXMpO1xuXG4oZnVuY3Rpb24oc2NvcGUpIHtcbiAgdmFyIENMT05FX1BST1BTID0gW1xuICAgIC8vIE1vdXNlRXZlbnRcbiAgICAnYnViYmxlcycsXG4gICAgJ2NhbmNlbGFibGUnLFxuICAgICd2aWV3JyxcbiAgICAnZGV0YWlsJyxcbiAgICAnc2NyZWVuWCcsXG4gICAgJ3NjcmVlblknLFxuICAgICdjbGllbnRYJyxcbiAgICAnY2xpZW50WScsXG4gICAgJ2N0cmxLZXknLFxuICAgICdhbHRLZXknLFxuICAgICdzaGlmdEtleScsXG4gICAgJ21ldGFLZXknLFxuICAgICdidXR0b24nLFxuICAgICdyZWxhdGVkVGFyZ2V0JyxcbiAgICAvLyBET00gTGV2ZWwgM1xuICAgICdidXR0b25zJyxcbiAgICAvLyBQb2ludGVyRXZlbnRcbiAgICAncG9pbnRlcklkJyxcbiAgICAnd2lkdGgnLFxuICAgICdoZWlnaHQnLFxuICAgICdwcmVzc3VyZScsXG4gICAgJ3RpbHRYJyxcbiAgICAndGlsdFknLFxuICAgICdwb2ludGVyVHlwZScsXG4gICAgJ2h3VGltZXN0YW1wJyxcbiAgICAnaXNQcmltYXJ5JyxcbiAgICAvLyBldmVudCBpbnN0YW5jZVxuICAgICd0eXBlJyxcbiAgICAndGFyZ2V0JyxcbiAgICAnY3VycmVudFRhcmdldCcsXG4gICAgJ3doaWNoJyxcbiAgICAncGFnZVgnLFxuICAgICdwYWdlWScsXG4gICAgJ3RpbWVTdGFtcCcsXG4gICAgLy8gZ2VzdHVyZSBhZGRvbnNcbiAgICAncHJldmVudFRhcCcsXG4gICAgJ3RhcFByZXZlbnRlZCcsXG4gICAgJ19zb3VyY2UnXG4gIF07XG5cbiAgdmFyIENMT05FX0RFRkFVTFRTID0gW1xuICAgIC8vIE1vdXNlRXZlbnRcbiAgICBmYWxzZSxcbiAgICBmYWxzZSxcbiAgICBudWxsLFxuICAgIG51bGwsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICBmYWxzZSxcbiAgICBmYWxzZSxcbiAgICBmYWxzZSxcbiAgICBmYWxzZSxcbiAgICAwLFxuICAgIG51bGwsXG4gICAgLy8gRE9NIExldmVsIDNcbiAgICAwLFxuICAgIC8vIFBvaW50ZXJFdmVudFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICAwLFxuICAgICcnLFxuICAgIDAsXG4gICAgZmFsc2UsXG4gICAgLy8gZXZlbnQgaW5zdGFuY2VcbiAgICAnJyxcbiAgICBudWxsLFxuICAgIG51bGwsXG4gICAgMCxcbiAgICAwLFxuICAgIDAsXG4gICAgMCxcbiAgICBmdW5jdGlvbigpe30sXG4gICAgZmFsc2VcbiAgXTtcblxuICB2YXIgSEFTX1NWR19JTlNUQU5DRSA9ICh0eXBlb2YgU1ZHRWxlbWVudEluc3RhbmNlICE9PSAndW5kZWZpbmVkJyk7XG5cbiAgdmFyIGV2ZW50RmFjdG9yeSA9IHNjb3BlLmV2ZW50RmFjdG9yeTtcblxuICAvLyBzZXQgb2YgcmVjb2duaXplcnMgdG8gcnVuIGZvciB0aGUgY3VycmVudGx5IGhhbmRsZWQgZXZlbnRcbiAgdmFyIGN1cnJlbnRHZXN0dXJlcztcblxuICAvKipcbiAgICogVGhpcyBtb2R1bGUgaXMgZm9yIG5vcm1hbGl6aW5nIGV2ZW50cy4gTW91c2UgYW5kIFRvdWNoIGV2ZW50cyB3aWxsIGJlXG4gICAqIGNvbGxlY3RlZCBoZXJlLCBhbmQgZmlyZSBQb2ludGVyRXZlbnRzIHRoYXQgaGF2ZSB0aGUgc2FtZSBzZW1hbnRpY3MsIG5vXG4gICAqIG1hdHRlciB0aGUgc291cmNlLlxuICAgKiBFdmVudHMgZmlyZWQ6XG4gICAqICAgLSBwb2ludGVyZG93bjogYSBwb2ludGluZyBpcyBhZGRlZFxuICAgKiAgIC0gcG9pbnRlcnVwOiBhIHBvaW50ZXIgaXMgcmVtb3ZlZFxuICAgKiAgIC0gcG9pbnRlcm1vdmU6IGEgcG9pbnRlciBpcyBtb3ZlZFxuICAgKiAgIC0gcG9pbnRlcm92ZXI6IGEgcG9pbnRlciBjcm9zc2VzIGludG8gYW4gZWxlbWVudFxuICAgKiAgIC0gcG9pbnRlcm91dDogYSBwb2ludGVyIGxlYXZlcyBhbiBlbGVtZW50XG4gICAqICAgLSBwb2ludGVyY2FuY2VsOiBhIHBvaW50ZXIgd2lsbCBubyBsb25nZXIgZ2VuZXJhdGUgZXZlbnRzXG4gICAqL1xuICB2YXIgZGlzcGF0Y2hlciA9IHtcbiAgICBJU19JT1M6IGZhbHNlLFxuICAgIHBvaW50ZXJtYXA6IG5ldyBzY29wZS5Qb2ludGVyTWFwKCksXG4gICAgcmVxdWlyZWRHZXN0dXJlczogbmV3IHNjb3BlLlBvaW50ZXJNYXAoKSxcbiAgICBldmVudE1hcDogT2JqZWN0LmNyZWF0ZShudWxsKSxcbiAgICAvLyBTY29wZSBvYmplY3RzIGZvciBuYXRpdmUgZXZlbnRzLlxuICAgIC8vIFRoaXMgZXhpc3RzIGZvciBlYXNlIG9mIHRlc3RpbmcuXG4gICAgZXZlbnRTb3VyY2VzOiBPYmplY3QuY3JlYXRlKG51bGwpLFxuICAgIGV2ZW50U291cmNlTGlzdDogW10sXG4gICAgZ2VzdHVyZXM6IFtdLFxuICAgIC8vIG1hcCBnZXN0dXJlIGV2ZW50IC0+IHtsaXN0ZW5lcnM6IGludCwgaW5kZXg6IGdlc3R1cmVzW2ludF19XG4gICAgZGVwZW5kZW5jeU1hcDoge1xuICAgICAgLy8gbWFrZSBzdXJlIGRvd24gYW5kIHVwIGFyZSBpbiB0aGUgbWFwIHRvIHRyaWdnZXIgXCJyZWdpc3RlclwiXG4gICAgICBkb3duOiB7bGlzdGVuZXJzOiAwLCBpbmRleDogLTF9LFxuICAgICAgdXA6IHtsaXN0ZW5lcnM6IDAsIGluZGV4OiAtMX1cbiAgICB9LFxuICAgIGdlc3R1cmVRdWV1ZTogW10sXG4gICAgLyoqXG4gICAgICogQWRkIGEgbmV3IGV2ZW50IHNvdXJjZSB0aGF0IHdpbGwgZ2VuZXJhdGUgcG9pbnRlciBldmVudHMuXG4gICAgICpcbiAgICAgKiBgaW5Tb3VyY2VgIG11c3QgY29udGFpbiBhbiBhcnJheSBvZiBldmVudCBuYW1lcyBuYW1lZCBgZXZlbnRzYCwgYW5kXG4gICAgICogZnVuY3Rpb25zIHdpdGggdGhlIG5hbWVzIHNwZWNpZmllZCBpbiB0aGUgYGV2ZW50c2AgYXJyYXkuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgQSBuYW1lIGZvciB0aGUgZXZlbnQgc291cmNlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBBIG5ldyBzb3VyY2Ugb2YgcGxhdGZvcm0gZXZlbnRzLlxuICAgICAqL1xuICAgIHJlZ2lzdGVyU291cmNlOiBmdW5jdGlvbihuYW1lLCBzb3VyY2UpIHtcbiAgICAgIHZhciBzID0gc291cmNlO1xuICAgICAgdmFyIG5ld0V2ZW50cyA9IHMuZXZlbnRzO1xuICAgICAgaWYgKG5ld0V2ZW50cykge1xuICAgICAgICBuZXdFdmVudHMuZm9yRWFjaChmdW5jdGlvbihlKSB7XG4gICAgICAgICAgaWYgKHNbZV0pIHtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRNYXBbZV0gPSBzW2VdLmJpbmQocyk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgdGhpcy5ldmVudFNvdXJjZXNbbmFtZV0gPSBzO1xuICAgICAgICB0aGlzLmV2ZW50U291cmNlTGlzdC5wdXNoKHMpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVnaXN0ZXJHZXN0dXJlOiBmdW5jdGlvbihuYW1lLCBzb3VyY2UpIHtcbiAgICAgIHZhciBvYmogPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgb2JqLmxpc3RlbmVycyA9IDA7XG4gICAgICBvYmouaW5kZXggPSB0aGlzLmdlc3R1cmVzLmxlbmd0aDtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBnOyBpIDwgc291cmNlLmV4cG9zZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZyA9IHNvdXJjZS5leHBvc2VzW2ldLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHRoaXMuZGVwZW5kZW5jeU1hcFtnXSA9IG9iajtcbiAgICAgIH1cbiAgICAgIHRoaXMuZ2VzdHVyZXMucHVzaChzb3VyY2UpO1xuICAgIH0sXG4gICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKGVsZW1lbnQsIGluaXRpYWwpIHtcbiAgICAgIHZhciBsID0gdGhpcy5ldmVudFNvdXJjZUxpc3QubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGVzOyAoaSA8IGwpICYmIChlcyA9IHRoaXMuZXZlbnRTb3VyY2VMaXN0W2ldKTsgaSsrKSB7XG4gICAgICAgIC8vIGNhbGwgZXZlbnRzb3VyY2UgcmVnaXN0ZXJcbiAgICAgICAgZXMucmVnaXN0ZXIuY2FsbChlcywgZWxlbWVudCwgaW5pdGlhbCk7XG4gICAgICB9XG4gICAgfSxcbiAgICB1bnJlZ2lzdGVyOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICB2YXIgbCA9IHRoaXMuZXZlbnRTb3VyY2VMaXN0Lmxlbmd0aDtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBlczsgKGkgPCBsKSAmJiAoZXMgPSB0aGlzLmV2ZW50U291cmNlTGlzdFtpXSk7IGkrKykge1xuICAgICAgICAvLyBjYWxsIGV2ZW50c291cmNlIHJlZ2lzdGVyXG4gICAgICAgIGVzLnVucmVnaXN0ZXIuY2FsbChlcywgZWxlbWVudCk7XG4gICAgICB9XG4gICAgfSxcbiAgICAvLyBFVkVOVFNcbiAgICBkb3duOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB0aGlzLnJlcXVpcmVkR2VzdHVyZXMuc2V0KGluRXZlbnQucG9pbnRlcklkLCBjdXJyZW50R2VzdHVyZXMpO1xuICAgICAgdGhpcy5maXJlRXZlbnQoJ2Rvd24nLCBpbkV2ZW50KTtcbiAgICB9LFxuICAgIG1vdmU6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIC8vIHBpcGUgbW92ZSBldmVudHMgaW50byBnZXN0dXJlIHF1ZXVlIGRpcmVjdGx5XG4gICAgICBpbkV2ZW50LnR5cGUgPSAnbW92ZSc7XG4gICAgICB0aGlzLmZpbGxHZXN0dXJlUXVldWUoaW5FdmVudCk7XG4gICAgfSxcbiAgICB1cDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdGhpcy5maXJlRXZlbnQoJ3VwJywgaW5FdmVudCk7XG4gICAgICB0aGlzLnJlcXVpcmVkR2VzdHVyZXMuZGVsZXRlKGluRXZlbnQucG9pbnRlcklkKTtcbiAgICB9LFxuICAgIGNhbmNlbDogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaW5FdmVudC50YXBQcmV2ZW50ZWQgPSB0cnVlO1xuICAgICAgdGhpcy5maXJlRXZlbnQoJ3VwJywgaW5FdmVudCk7XG4gICAgICB0aGlzLnJlcXVpcmVkR2VzdHVyZXMuZGVsZXRlKGluRXZlbnQucG9pbnRlcklkKTtcbiAgICB9LFxuICAgIGFkZEdlc3R1cmVEZXBlbmRlbmN5OiBmdW5jdGlvbihub2RlLCBjdXJyZW50R2VzdHVyZXMpIHtcbiAgICAgIHZhciBnZXN0dXJlc1dhbnRlZCA9IG5vZGUuX3BnRXZlbnRzO1xuICAgICAgaWYgKGdlc3R1cmVzV2FudGVkICYmIGN1cnJlbnRHZXN0dXJlcykge1xuICAgICAgICB2YXIgZ2sgPSBPYmplY3Qua2V5cyhnZXN0dXJlc1dhbnRlZCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCByLCByaSwgZzsgaSA8IGdrLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgLy8gZ2VzdHVyZVxuICAgICAgICAgIGcgPSBna1tpXTtcbiAgICAgICAgICBpZiAoZ2VzdHVyZXNXYW50ZWRbZ10gPiAwKSB7XG4gICAgICAgICAgICAvLyBsb29rdXAgZ2VzdHVyZSByZWNvZ25pemVyXG4gICAgICAgICAgICByID0gdGhpcy5kZXBlbmRlbmN5TWFwW2ddO1xuICAgICAgICAgICAgLy8gcmVjb2duaXplciBpbmRleFxuICAgICAgICAgICAgcmkgPSByID8gci5pbmRleCA6IC0xO1xuICAgICAgICAgICAgY3VycmVudEdlc3R1cmVzW3JpXSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICAvLyBMSVNURU5FUiBMT0dJQ1xuICAgIGV2ZW50SGFuZGxlcjogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgLy8gVGhpcyBpcyB1c2VkIHRvIHByZXZlbnQgbXVsdGlwbGUgZGlzcGF0Y2ggb2YgZXZlbnRzIGZyb21cbiAgICAgIC8vIHBsYXRmb3JtIGV2ZW50cy4gVGhpcyBjYW4gaGFwcGVuIHdoZW4gdHdvIGVsZW1lbnRzIGluIGRpZmZlcmVudCBzY29wZXNcbiAgICAgIC8vIGFyZSBzZXQgdXAgdG8gY3JlYXRlIHBvaW50ZXIgZXZlbnRzLCB3aGljaCBpcyByZWxldmFudCB0byBTaGFkb3cgRE9NLlxuXG4gICAgICB2YXIgdHlwZSA9IGluRXZlbnQudHlwZTtcblxuICAgICAgLy8gb25seSBnZW5lcmF0ZSB0aGUgbGlzdCBvZiBkZXNpcmVkIGV2ZW50cyBvbiBcImRvd25cIlxuICAgICAgaWYgKHR5cGUgPT09ICd0b3VjaHN0YXJ0JyB8fCB0eXBlID09PSAnbW91c2Vkb3duJyB8fCB0eXBlID09PSAncG9pbnRlcmRvd24nIHx8IHR5cGUgPT09ICdNU1BvaW50ZXJEb3duJykge1xuICAgICAgICBpZiAoIWluRXZlbnQuX2hhbmRsZWRCeVBHKSB7XG4gICAgICAgICAgY3VycmVudEdlc3R1cmVzID0ge307XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpbiBJT1MgbW9kZSwgdGhlcmUgaXMgb25seSBhIGxpc3RlbmVyIG9uIHRoZSBkb2N1bWVudCwgc28gdGhpcyBpcyBub3QgcmUtZW50cmFudFxuICAgICAgICBpZiAodGhpcy5JU19JT1MpIHtcbiAgICAgICAgICB2YXIgZXYgPSBpbkV2ZW50O1xuICAgICAgICAgIGlmICh0eXBlID09PSAndG91Y2hzdGFydCcpIHtcbiAgICAgICAgICAgIHZhciBjdCA9IGluRXZlbnQuY2hhbmdlZFRvdWNoZXNbMF07XG4gICAgICAgICAgICAvLyBzZXQgdXAgYSBmYWtlIGV2ZW50IHRvIGdpdmUgdG8gdGhlIHBhdGggYnVpbGRlclxuICAgICAgICAgICAgZXYgPSB7dGFyZ2V0OiBpbkV2ZW50LnRhcmdldCwgY2xpZW50WDogY3QuY2xpZW50WCwgY2xpZW50WTogY3QuY2xpZW50WSwgcGF0aDogaW5FdmVudC5wYXRofTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gdXNlIGV2ZW50IHBhdGggaWYgYXZhaWxhYmxlLCBvdGhlcndpc2UgYnVpbGQgYSBwYXRoIGZyb20gdGFyZ2V0IGZpbmRpbmdcbiAgICAgICAgICB2YXIgbm9kZXMgPSBpbkV2ZW50LnBhdGggfHwgc2NvcGUudGFyZ2V0RmluZGluZy5wYXRoKGV2KTtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbjsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBuID0gbm9kZXNbaV07XG4gICAgICAgICAgICB0aGlzLmFkZEdlc3R1cmVEZXBlbmRlbmN5KG4sIGN1cnJlbnRHZXN0dXJlcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuYWRkR2VzdHVyZURlcGVuZGVuY3koaW5FdmVudC5jdXJyZW50VGFyZ2V0LCBjdXJyZW50R2VzdHVyZXMpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChpbkV2ZW50Ll9oYW5kbGVkQnlQRykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgZm4gPSB0aGlzLmV2ZW50TWFwICYmIHRoaXMuZXZlbnRNYXBbdHlwZV07XG4gICAgICBpZiAoZm4pIHtcbiAgICAgICAgZm4oaW5FdmVudCk7XG4gICAgICB9XG4gICAgICBpbkV2ZW50Ll9oYW5kbGVkQnlQRyA9IHRydWU7XG4gICAgfSxcbiAgICAvLyBzZXQgdXAgZXZlbnQgbGlzdGVuZXJzXG4gICAgbGlzdGVuOiBmdW5jdGlvbih0YXJnZXQsIGV2ZW50cykge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBldmVudHMubGVuZ3RoLCBlOyAoaSA8IGwpICYmIChlID0gZXZlbnRzW2ldKTsgaSsrKSB7XG4gICAgICAgIHRoaXMuYWRkRXZlbnQodGFyZ2V0LCBlKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIC8vIHJlbW92ZSBldmVudCBsaXN0ZW5lcnNcbiAgICB1bmxpc3RlbjogZnVuY3Rpb24odGFyZ2V0LCBldmVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gZXZlbnRzLmxlbmd0aCwgZTsgKGkgPCBsKSAmJiAoZSA9IGV2ZW50c1tpXSk7IGkrKykge1xuICAgICAgICB0aGlzLnJlbW92ZUV2ZW50KHRhcmdldCwgZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBhZGRFdmVudDogZnVuY3Rpb24odGFyZ2V0LCBldmVudE5hbWUpIHtcbiAgICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgdGhpcy5ib3VuZEhhbmRsZXIpO1xuICAgIH0sXG4gICAgcmVtb3ZlRXZlbnQ6IGZ1bmN0aW9uKHRhcmdldCwgZXZlbnROYW1lKSB7XG4gICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHRoaXMuYm91bmRIYW5kbGVyKTtcbiAgICB9LFxuICAgIC8vIEVWRU5UIENSRUFUSU9OIEFORCBUUkFDS0lOR1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgRXZlbnQgb2YgdHlwZSBgaW5UeXBlYCwgYmFzZWQgb24gdGhlIGluZm9ybWF0aW9uIGluXG4gICAgICogYGluRXZlbnRgLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGluVHlwZSBBIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHR5cGUgb2YgZXZlbnQgdG8gY3JlYXRlXG4gICAgICogQHBhcmFtIHtFdmVudH0gaW5FdmVudCBBIHBsYXRmb3JtIGV2ZW50IHdpdGggYSB0YXJnZXRcbiAgICAgKiBAcmV0dXJuIHtFdmVudH0gQSBQb2ludGVyRXZlbnQgb2YgdHlwZSBgaW5UeXBlYFxuICAgICAqL1xuICAgIG1ha2VFdmVudDogZnVuY3Rpb24oaW5UeXBlLCBpbkV2ZW50KSB7XG4gICAgICB2YXIgZSA9IGV2ZW50RmFjdG9yeS5tYWtlUG9pbnRlckV2ZW50KGluVHlwZSwgaW5FdmVudCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0ID0gaW5FdmVudC5wcmV2ZW50RGVmYXVsdDtcbiAgICAgIGUudGFwUHJldmVudGVkID0gaW5FdmVudC50YXBQcmV2ZW50ZWQ7XG4gICAgICBlLl90YXJnZXQgPSBlLl90YXJnZXQgfHwgaW5FdmVudC50YXJnZXQ7XG4gICAgICByZXR1cm4gZTtcbiAgICB9LFxuICAgIC8vIG1ha2UgYW5kIGRpc3BhdGNoIGFuIGV2ZW50IGluIG9uZSBjYWxsXG4gICAgZmlyZUV2ZW50OiBmdW5jdGlvbihpblR5cGUsIGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gdGhpcy5tYWtlRXZlbnQoaW5UeXBlLCBpbkV2ZW50KTtcbiAgICAgIHJldHVybiB0aGlzLmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgc25hcHNob3Qgb2YgaW5FdmVudCwgd2l0aCB3cml0YWJsZSBwcm9wZXJ0aWVzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtFdmVudH0gaW5FdmVudCBBbiBldmVudCB0aGF0IGNvbnRhaW5zIHByb3BlcnRpZXMgdG8gY29weS5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IEFuIG9iamVjdCBjb250YWluaW5nIHNoYWxsb3cgY29waWVzIG9mIGBpbkV2ZW50YCdzXG4gICAgICogICAgcHJvcGVydGllcy5cbiAgICAgKi9cbiAgICBjbG9uZUV2ZW50OiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZXZlbnRDb3B5ID0gT2JqZWN0LmNyZWF0ZShudWxsKSwgcDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgQ0xPTkVfUFJPUFMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcCA9IENMT05FX1BST1BTW2ldO1xuICAgICAgICBldmVudENvcHlbcF0gPSBpbkV2ZW50W3BdIHx8IENMT05FX0RFRkFVTFRTW2ldO1xuICAgICAgICAvLyBXb3JrIGFyb3VuZCBTVkdJbnN0YW5jZUVsZW1lbnQgc2hhZG93IHRyZWVcbiAgICAgICAgLy8gUmV0dXJuIHRoZSA8dXNlPiBlbGVtZW50IHRoYXQgaXMgcmVwcmVzZW50ZWQgYnkgdGhlIGluc3RhbmNlIGZvciBTYWZhcmksIENocm9tZSwgSUUuXG4gICAgICAgIC8vIFRoaXMgaXMgdGhlIGJlaGF2aW9yIGltcGxlbWVudGVkIGJ5IEZpcmVmb3guXG4gICAgICAgIGlmIChwID09PSAndGFyZ2V0JyB8fCBwID09PSAncmVsYXRlZFRhcmdldCcpIHtcbiAgICAgICAgICBpZiAoSEFTX1NWR19JTlNUQU5DRSAmJiBldmVudENvcHlbcF0gaW5zdGFuY2VvZiBTVkdFbGVtZW50SW5zdGFuY2UpIHtcbiAgICAgICAgICAgIGV2ZW50Q29weVtwXSA9IGV2ZW50Q29weVtwXS5jb3JyZXNwb25kaW5nVXNlRWxlbWVudDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIGtlZXAgdGhlIHNlbWFudGljcyBvZiBwcmV2ZW50RGVmYXVsdFxuICAgICAgZXZlbnRDb3B5LnByZXZlbnREZWZhdWx0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGluRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH07XG4gICAgICByZXR1cm4gZXZlbnRDb3B5O1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogRGlzcGF0Y2hlcyB0aGUgZXZlbnQgdG8gaXRzIHRhcmdldC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGluRXZlbnQgVGhlIGV2ZW50IHRvIGJlIGRpc3BhdGNoZWQuXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn0gVHJ1ZSBpZiBhbiBldmVudCBoYW5kbGVyIHJldHVybnMgdHJ1ZSwgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIGRpc3BhdGNoRXZlbnQ6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciB0ID0gaW5FdmVudC5fdGFyZ2V0O1xuICAgICAgaWYgKHQpIHtcbiAgICAgICAgdC5kaXNwYXRjaEV2ZW50KGluRXZlbnQpO1xuICAgICAgICAvLyBjbG9uZSB0aGUgZXZlbnQgZm9yIHRoZSBnZXN0dXJlIHN5c3RlbSB0byBwcm9jZXNzXG4gICAgICAgIC8vIGNsb25lIGFmdGVyIGRpc3BhdGNoIHRvIHBpY2sgdXAgZ2VzdHVyZSBwcmV2ZW50aW9uIGNvZGVcbiAgICAgICAgdmFyIGNsb25lID0gdGhpcy5jbG9uZUV2ZW50KGluRXZlbnQpO1xuICAgICAgICBjbG9uZS50YXJnZXQgPSB0O1xuICAgICAgICB0aGlzLmZpbGxHZXN0dXJlUXVldWUoY2xvbmUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgZ2VzdHVyZVRyaWdnZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gcHJvY2VzcyB0aGUgZ2VzdHVyZSBxdWV1ZVxuICAgICAgZm9yICh2YXIgaSA9IDAsIGUsIHJnOyBpIDwgdGhpcy5nZXN0dXJlUXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZSA9IHRoaXMuZ2VzdHVyZVF1ZXVlW2ldO1xuICAgICAgICByZyA9IGUuX3JlcXVpcmVkR2VzdHVyZXM7XG4gICAgICAgIGlmIChyZykge1xuICAgICAgICAgIGZvciAodmFyIGogPSAwLCBnLCBmbjsgaiA8IHRoaXMuZ2VzdHVyZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIC8vIG9ubHkgcnVuIHJlY29nbml6ZXIgaWYgYW4gZWxlbWVudCBpbiB0aGUgc291cmNlIGV2ZW50J3MgcGF0aCBpcyBsaXN0ZW5pbmcgZm9yIHRob3NlIGdlc3R1cmVzXG4gICAgICAgICAgICBpZiAocmdbal0pIHtcbiAgICAgICAgICAgICAgZyA9IHRoaXMuZ2VzdHVyZXNbal07XG4gICAgICAgICAgICAgIGZuID0gZ1tlLnR5cGVdO1xuICAgICAgICAgICAgICBpZiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmbi5jYWxsKGcsIGUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmdlc3R1cmVRdWV1ZS5sZW5ndGggPSAwO1xuICAgIH0sXG4gICAgZmlsbEdlc3R1cmVRdWV1ZTogZnVuY3Rpb24oZXYpIHtcbiAgICAgIC8vIG9ubHkgdHJpZ2dlciB0aGUgZ2VzdHVyZSBxdWV1ZSBvbmNlXG4gICAgICBpZiAoIXRoaXMuZ2VzdHVyZVF1ZXVlLmxlbmd0aCkge1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5ib3VuZEdlc3R1cmVUcmlnZ2VyKTtcbiAgICAgIH1cbiAgICAgIGV2Ll9yZXF1aXJlZEdlc3R1cmVzID0gdGhpcy5yZXF1aXJlZEdlc3R1cmVzLmdldChldi5wb2ludGVySWQpO1xuICAgICAgdGhpcy5nZXN0dXJlUXVldWUucHVzaChldik7XG4gICAgfVxuICB9O1xuICBkaXNwYXRjaGVyLmJvdW5kSGFuZGxlciA9IGRpc3BhdGNoZXIuZXZlbnRIYW5kbGVyLmJpbmQoZGlzcGF0Y2hlcik7XG4gIGRpc3BhdGNoZXIuYm91bmRHZXN0dXJlVHJpZ2dlciA9IGRpc3BhdGNoZXIuZ2VzdHVyZVRyaWdnZXIuYmluZChkaXNwYXRjaGVyKTtcbiAgc2NvcGUuZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG5cbiAgLyoqXG4gICAqIExpc3RlbiBmb3IgYGdlc3R1cmVgIG9uIGBub2RlYCB3aXRoIHRoZSBgaGFuZGxlcmAgZnVuY3Rpb25cbiAgICpcbiAgICogSWYgYGhhbmRsZXJgIGlzIHRoZSBmaXJzdCBsaXN0ZW5lciBmb3IgYGdlc3R1cmVgLCB0aGUgdW5kZXJseWluZyBnZXN0dXJlIHJlY29nbml6ZXIgaXMgdGhlbiBlbmFibGVkLlxuICAgKlxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IG5vZGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IGdlc3R1cmVcbiAgICogQHJldHVybiBCb29sZWFuIGBnZXN0dXJlYCBpcyBhIHZhbGlkIGdlc3R1cmVcbiAgICovXG4gIHNjb3BlLmFjdGl2YXRlR2VzdHVyZSA9IGZ1bmN0aW9uKG5vZGUsIGdlc3R1cmUpIHtcbiAgICB2YXIgZyA9IGdlc3R1cmUudG9Mb3dlckNhc2UoKTtcbiAgICB2YXIgZGVwID0gZGlzcGF0Y2hlci5kZXBlbmRlbmN5TWFwW2ddO1xuICAgIGlmIChkZXApIHtcbiAgICAgIHZhciByZWNvZ25pemVyID0gZGlzcGF0Y2hlci5nZXN0dXJlc1tkZXAuaW5kZXhdO1xuICAgICAgaWYgKCFub2RlLl9wZ0xpc3RlbmVycykge1xuICAgICAgICBkaXNwYXRjaGVyLnJlZ2lzdGVyKG5vZGUpO1xuICAgICAgICBub2RlLl9wZ0xpc3RlbmVycyA9IDA7XG4gICAgICB9XG4gICAgICAvLyBUT0RPKGRmcmVlZG0pOiByZS1ldmFsdWF0ZSBib29ra2VlcGluZyB0byBhdm9pZCB1c2luZyBhdHRyaWJ1dGVzXG4gICAgICBpZiAocmVjb2duaXplcikge1xuICAgICAgICB2YXIgdG91Y2hBY3Rpb24gPSByZWNvZ25pemVyLmRlZmF1bHRBY3Rpb25zICYmIHJlY29nbml6ZXIuZGVmYXVsdEFjdGlvbnNbZ107XG4gICAgICAgIHZhciBhY3Rpb25Ob2RlO1xuICAgICAgICBzd2l0Y2gobm9kZS5ub2RlVHlwZSkge1xuICAgICAgICAgIGNhc2UgTm9kZS5FTEVNRU5UX05PREU6XG4gICAgICAgICAgICBhY3Rpb25Ob2RlID0gbm9kZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIE5vZGUuRE9DVU1FTlRfRlJBR01FTlRfTk9ERTpcbiAgICAgICAgICAgIGFjdGlvbk5vZGUgPSBub2RlLmhvc3Q7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGFjdGlvbk5vZGUgPSBudWxsO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0b3VjaEFjdGlvbiAmJiBhY3Rpb25Ob2RlICYmICFhY3Rpb25Ob2RlLmhhc0F0dHJpYnV0ZSgndG91Y2gtYWN0aW9uJykpIHtcbiAgICAgICAgICBhY3Rpb25Ob2RlLnNldEF0dHJpYnV0ZSgndG91Y2gtYWN0aW9uJywgdG91Y2hBY3Rpb24pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIW5vZGUuX3BnRXZlbnRzKSB7XG4gICAgICAgIG5vZGUuX3BnRXZlbnRzID0ge307XG4gICAgICB9XG4gICAgICBub2RlLl9wZ0V2ZW50c1tnXSA9IChub2RlLl9wZ0V2ZW50c1tnXSB8fCAwKSArIDE7XG4gICAgICBub2RlLl9wZ0xpc3RlbmVycysrO1xuICAgIH1cbiAgICByZXR1cm4gQm9vbGVhbihkZXApO1xuICB9O1xuXG4gIC8qKlxuICAgKlxuICAgKiBMaXN0ZW4gZm9yIGBnZXN0dXJlYCBmcm9tIGBub2RlYCB3aXRoIGBoYW5kbGVyYCBmdW5jdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtFbGVtZW50fSBub2RlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBnZXN0dXJlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXJcbiAgICogQHBhcmFtIHtCb29sZWFufSBjYXB0dXJlXG4gICAqL1xuICBzY29wZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24obm9kZSwgZ2VzdHVyZSwgaGFuZGxlciwgY2FwdHVyZSkge1xuICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICBzY29wZS5hY3RpdmF0ZUdlc3R1cmUobm9kZSwgZ2VzdHVyZSk7XG4gICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoZ2VzdHVyZSwgaGFuZGxlciwgY2FwdHVyZSk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBUZWFycyBkb3duIHRoZSBnZXN0dXJlIGNvbmZpZ3VyYXRpb24gZm9yIGBub2RlYFxuICAgKlxuICAgKiBJZiBgaGFuZGxlcmAgaXMgdGhlIGxhc3QgbGlzdGVuZXIgZm9yIGBnZXN0dXJlYCwgdGhlIHVuZGVybHlpbmcgZ2VzdHVyZSByZWNvZ25pemVyIGlzIGRpc2FibGVkLlxuICAgKlxuICAgKiBAcGFyYW0ge0VsZW1lbnR9IG5vZGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IGdlc3R1cmVcbiAgICogQHJldHVybiBCb29sZWFuIGBnZXN0dXJlYCBpcyBhIHZhbGlkIGdlc3R1cmVcbiAgICovXG4gIHNjb3BlLmRlYWN0aXZhdGVHZXN0dXJlID0gZnVuY3Rpb24obm9kZSwgZ2VzdHVyZSkge1xuICAgIHZhciBnID0gZ2VzdHVyZS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhciBkZXAgPSBkaXNwYXRjaGVyLmRlcGVuZGVuY3lNYXBbZ107XG4gICAgaWYgKGRlcCkge1xuICAgICAgaWYgKG5vZGUuX3BnTGlzdGVuZXJzID4gMCkge1xuICAgICAgICBub2RlLl9wZ0xpc3RlbmVycy0tO1xuICAgICAgfVxuICAgICAgaWYgKG5vZGUuX3BnTGlzdGVuZXJzID09PSAwKSB7XG4gICAgICAgIGRpc3BhdGNoZXIudW5yZWdpc3Rlcihub2RlKTtcbiAgICAgIH1cbiAgICAgIGlmIChub2RlLl9wZ0V2ZW50cykge1xuICAgICAgICBpZiAobm9kZS5fcGdFdmVudHNbZ10gPiAwKSB7XG4gICAgICAgICAgbm9kZS5fcGdFdmVudHNbZ10tLTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBub2RlLl9wZ0V2ZW50c1tnXSA9IDA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIEJvb2xlYW4oZGVwKTtcbiAgfTtcblxuICAvKipcbiAgICogU3RvcCBsaXN0ZW5pbmcgZm9yIGBnZXN0dXJlYCBmcm9tIGBub2RlYCB3aXRoIGBoYW5kbGVyYCBmdW5jdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtFbGVtZW50fSBub2RlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBnZXN0dXJlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXJcbiAgICogQHBhcmFtIHtCb29sZWFufSBjYXB0dXJlXG4gICAqL1xuICBzY29wZS5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24obm9kZSwgZ2VzdHVyZSwgaGFuZGxlciwgY2FwdHVyZSkge1xuICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICBzY29wZS5kZWFjdGl2YXRlR2VzdHVyZShub2RlLCBnZXN0dXJlKTtcbiAgICAgIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihnZXN0dXJlLCBoYW5kbGVyLCBjYXB0dXJlKTtcbiAgICB9XG4gIH07XG59KSh3aW5kb3cuUG9seW1lckdlc3R1cmVzKTtcblxuKGZ1bmN0aW9uKHNjb3BlKSB7XG4gIHZhciBkaXNwYXRjaGVyID0gc2NvcGUuZGlzcGF0Y2hlcjtcbiAgdmFyIHBvaW50ZXJtYXAgPSBkaXNwYXRjaGVyLnBvaW50ZXJtYXA7XG4gIC8vIHJhZGl1cyBhcm91bmQgdG91Y2hlbmQgdGhhdCBzd2FsbG93cyBtb3VzZSBldmVudHNcbiAgdmFyIERFRFVQX0RJU1QgPSAyNTtcblxuICB2YXIgV0hJQ0hfVE9fQlVUVE9OUyA9IFswLCAxLCA0LCAyXTtcblxuICB2YXIgY3VycmVudEJ1dHRvbnMgPSAwO1xuXG4gIHZhciBGSVJFRk9YX0xJTlVYID0gL0xpbnV4LipGaXJlZm94XFwvL2k7XG5cbiAgdmFyIEhBU19CVVRUT05TID0gKGZ1bmN0aW9uKCkge1xuICAgIC8vIGZpcmVmb3ggb24gbGludXggcmV0dXJucyBzcGVjLWluY29ycmVjdCB2YWx1ZXMgZm9yIG1vdXNldXAuYnV0dG9uc1xuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Nb3VzZUV2ZW50LmJ1dHRvbnMjU2VlX2Fsc29cbiAgICAvLyBodHRwczovL2NvZGVyZXZpZXcuY2hyb21pdW0ub3JnLzcyNzU5MzAwMy8jbXNnMTZcbiAgICBpZiAoRklSRUZPWF9MSU5VWC50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gbmV3IE1vdXNlRXZlbnQoJ3Rlc3QnLCB7YnV0dG9uczogMX0pLmJ1dHRvbnMgPT09IDE7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSkoKTtcblxuICAvLyBoYW5kbGVyIGJsb2NrIGZvciBuYXRpdmUgbW91c2UgZXZlbnRzXG4gIHZhciBtb3VzZUV2ZW50cyA9IHtcbiAgICBQT0lOVEVSX0lEOiAxLFxuICAgIFBPSU5URVJfVFlQRTogJ21vdXNlJyxcbiAgICBldmVudHM6IFtcbiAgICAgICdtb3VzZWRvd24nLFxuICAgICAgJ21vdXNlbW92ZScsXG4gICAgICAnbW91c2V1cCdcbiAgICBdLFxuICAgIGV4cG9zZXM6IFtcbiAgICAgICdkb3duJyxcbiAgICAgICd1cCcsXG4gICAgICAnbW92ZSdcbiAgICBdLFxuICAgIHJlZ2lzdGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIGRpc3BhdGNoZXIubGlzdGVuKHRhcmdldCwgdGhpcy5ldmVudHMpO1xuICAgIH0sXG4gICAgdW5yZWdpc3RlcjogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICBpZiAodGFyZ2V0Lm5vZGVUeXBlID09PSBOb2RlLkRPQ1VNRU5UX05PREUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZGlzcGF0Y2hlci51bmxpc3Rlbih0YXJnZXQsIHRoaXMuZXZlbnRzKTtcbiAgICB9LFxuICAgIGxhc3RUb3VjaGVzOiBbXSxcbiAgICAvLyBjb2xsaWRlIHdpdGggdGhlIGdsb2JhbCBtb3VzZSBsaXN0ZW5lclxuICAgIGlzRXZlbnRTaW11bGF0ZWRGcm9tVG91Y2g6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBsdHMgPSB0aGlzLmxhc3RUb3VjaGVzO1xuICAgICAgdmFyIHggPSBpbkV2ZW50LmNsaWVudFgsIHkgPSBpbkV2ZW50LmNsaWVudFk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGx0cy5sZW5ndGgsIHQ7IGkgPCBsICYmICh0ID0gbHRzW2ldKTsgaSsrKSB7XG4gICAgICAgIC8vIHNpbXVsYXRlZCBtb3VzZSBldmVudHMgd2lsbCBiZSBzd2FsbG93ZWQgbmVhciBhIHByaW1hcnkgdG91Y2hlbmRcbiAgICAgICAgdmFyIGR4ID0gTWF0aC5hYnMoeCAtIHQueCksIGR5ID0gTWF0aC5hYnMoeSAtIHQueSk7XG4gICAgICAgIGlmIChkeCA8PSBERURVUF9ESVNUICYmIGR5IDw9IERFRFVQX0RJU1QpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcHJlcGFyZUV2ZW50OiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZSA9IGRpc3BhdGNoZXIuY2xvbmVFdmVudChpbkV2ZW50KTtcbiAgICAgIGUucG9pbnRlcklkID0gdGhpcy5QT0lOVEVSX0lEO1xuICAgICAgZS5pc1ByaW1hcnkgPSB0cnVlO1xuICAgICAgZS5wb2ludGVyVHlwZSA9IHRoaXMuUE9JTlRFUl9UWVBFO1xuICAgICAgZS5fc291cmNlID0gJ21vdXNlJztcbiAgICAgIGlmICghSEFTX0JVVFRPTlMpIHtcbiAgICAgICAgdmFyIHR5cGUgPSBpbkV2ZW50LnR5cGU7XG4gICAgICAgIHZhciBiaXQgPSBXSElDSF9UT19CVVRUT05TW2luRXZlbnQud2hpY2hdIHx8IDA7XG4gICAgICAgIGlmICh0eXBlID09PSAnbW91c2Vkb3duJykge1xuICAgICAgICAgIGN1cnJlbnRCdXR0b25zIHw9IGJpdDtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnbW91c2V1cCcpIHtcbiAgICAgICAgICBjdXJyZW50QnV0dG9ucyAmPSB+Yml0O1xuICAgICAgICB9XG4gICAgICAgIGUuYnV0dG9ucyA9IGN1cnJlbnRCdXR0b25zO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGU7XG4gICAgfSxcbiAgICBtb3VzZWRvd246IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGlmICghdGhpcy5pc0V2ZW50U2ltdWxhdGVkRnJvbVRvdWNoKGluRXZlbnQpKSB7XG4gICAgICAgIHZhciBwID0gcG9pbnRlcm1hcC5oYXModGhpcy5QT0lOVEVSX0lEKTtcbiAgICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgICAgZS50YXJnZXQgPSBzY29wZS5maW5kVGFyZ2V0KGluRXZlbnQpO1xuICAgICAgICBwb2ludGVybWFwLnNldCh0aGlzLlBPSU5URVJfSUQsIGUudGFyZ2V0KTtcbiAgICAgICAgZGlzcGF0Y2hlci5kb3duKGUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgbW91c2Vtb3ZlOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpZiAoIXRoaXMuaXNFdmVudFNpbXVsYXRlZEZyb21Ub3VjaChpbkV2ZW50KSkge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gcG9pbnRlcm1hcC5nZXQodGhpcy5QT0lOVEVSX0lEKTtcbiAgICAgICAgaWYgKHRhcmdldCkge1xuICAgICAgICAgIHZhciBlID0gdGhpcy5wcmVwYXJlRXZlbnQoaW5FdmVudCk7XG4gICAgICAgICAgZS50YXJnZXQgPSB0YXJnZXQ7XG4gICAgICAgICAgLy8gaGFuZGxlIGNhc2Ugd2hlcmUgd2UgbWlzc2VkIGEgbW91c2V1cFxuICAgICAgICAgIGlmICgoSEFTX0JVVFRPTlMgPyBlLmJ1dHRvbnMgOiBlLndoaWNoKSA9PT0gMCkge1xuICAgICAgICAgICAgaWYgKCFIQVNfQlVUVE9OUykge1xuICAgICAgICAgICAgICBjdXJyZW50QnV0dG9ucyA9IGUuYnV0dG9ucyA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkaXNwYXRjaGVyLmNhbmNlbChlKTtcbiAgICAgICAgICAgIHRoaXMuY2xlYW51cE1vdXNlKGUuYnV0dG9ucyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRpc3BhdGNoZXIubW92ZShlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIG1vdXNldXA6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGlmICghdGhpcy5pc0V2ZW50U2ltdWxhdGVkRnJvbVRvdWNoKGluRXZlbnQpKSB7XG4gICAgICAgIHZhciBlID0gdGhpcy5wcmVwYXJlRXZlbnQoaW5FdmVudCk7XG4gICAgICAgIGUucmVsYXRlZFRhcmdldCA9IHNjb3BlLmZpbmRUYXJnZXQoaW5FdmVudCk7XG4gICAgICAgIGUudGFyZ2V0ID0gcG9pbnRlcm1hcC5nZXQodGhpcy5QT0lOVEVSX0lEKTtcbiAgICAgICAgZGlzcGF0Y2hlci51cChlKTtcbiAgICAgICAgdGhpcy5jbGVhbnVwTW91c2UoZS5idXR0b25zKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGNsZWFudXBNb3VzZTogZnVuY3Rpb24oYnV0dG9ucykge1xuICAgICAgaWYgKGJ1dHRvbnMgPT09IDApIHtcbiAgICAgICAgcG9pbnRlcm1hcC5kZWxldGUodGhpcy5QT0lOVEVSX0lEKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgc2NvcGUubW91c2VFdmVudHMgPSBtb3VzZUV2ZW50cztcbn0pKHdpbmRvdy5Qb2x5bWVyR2VzdHVyZXMpO1xuXG4oZnVuY3Rpb24oc2NvcGUpIHtcbiAgdmFyIGRpc3BhdGNoZXIgPSBzY29wZS5kaXNwYXRjaGVyO1xuICB2YXIgYWxsU2hhZG93cyA9IHNjb3BlLnRhcmdldEZpbmRpbmcuYWxsU2hhZG93cy5iaW5kKHNjb3BlLnRhcmdldEZpbmRpbmcpO1xuICB2YXIgcG9pbnRlcm1hcCA9IGRpc3BhdGNoZXIucG9pbnRlcm1hcDtcbiAgdmFyIHRvdWNoTWFwID0gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsLmJpbmQoQXJyYXkucHJvdG90eXBlLm1hcCk7XG4gIC8vIFRoaXMgc2hvdWxkIGJlIGxvbmcgZW5vdWdoIHRvIGlnbm9yZSBjb21wYXQgbW91c2UgZXZlbnRzIG1hZGUgYnkgdG91Y2hcbiAgdmFyIERFRFVQX1RJTUVPVVQgPSAyNTAwO1xuICB2YXIgREVEVVBfRElTVCA9IDI1O1xuICB2YXIgQ0xJQ0tfQ09VTlRfVElNRU9VVCA9IDIwMDtcbiAgdmFyIEhZU1RFUkVTSVMgPSAyMDtcbiAgdmFyIEFUVFJJQiA9ICd0b3VjaC1hY3Rpb24nO1xuICAvLyBUT0RPKGRmcmVlZG0pOiBkaXNhYmxlIHVudGlsIGh0dHA6Ly9jcmJ1Zy5jb20vMzk5NzY1IGlzIHJlc29sdmVkXG4gIC8vIHZhciBIQVNfVE9VQ0hfQUNUSU9OID0gQVRUUklCIGluIGRvY3VtZW50LmhlYWQuc3R5bGU7XG4gIHZhciBIQVNfVE9VQ0hfQUNUSU9OID0gZmFsc2U7XG5cbiAgLy8gaGFuZGxlciBibG9jayBmb3IgbmF0aXZlIHRvdWNoIGV2ZW50c1xuICB2YXIgdG91Y2hFdmVudHMgPSB7XG4gICAgSVNfSU9TOiBmYWxzZSxcbiAgICBldmVudHM6IFtcbiAgICAgICd0b3VjaHN0YXJ0JyxcbiAgICAgICd0b3VjaG1vdmUnLFxuICAgICAgJ3RvdWNoZW5kJyxcbiAgICAgICd0b3VjaGNhbmNlbCdcbiAgICBdLFxuICAgIGV4cG9zZXM6IFtcbiAgICAgICdkb3duJyxcbiAgICAgICd1cCcsXG4gICAgICAnbW92ZSdcbiAgICBdLFxuICAgIHJlZ2lzdGVyOiBmdW5jdGlvbih0YXJnZXQsIGluaXRpYWwpIHtcbiAgICAgIGlmICh0aGlzLklTX0lPUyA/IGluaXRpYWwgOiAhaW5pdGlhbCkge1xuICAgICAgICBkaXNwYXRjaGVyLmxpc3Rlbih0YXJnZXQsIHRoaXMuZXZlbnRzKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHVucmVnaXN0ZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgaWYgKCF0aGlzLklTX0lPUykge1xuICAgICAgICBkaXNwYXRjaGVyLnVubGlzdGVuKHRhcmdldCwgdGhpcy5ldmVudHMpO1xuICAgICAgfVxuICAgIH0sXG4gICAgc2Nyb2xsVHlwZXM6IHtcbiAgICAgIEVNSVRURVI6ICdub25lJyxcbiAgICAgIFhTQ1JPTExFUjogJ3Bhbi14JyxcbiAgICAgIFlTQ1JPTExFUjogJ3Bhbi15JyxcbiAgICB9LFxuICAgIHRvdWNoQWN0aW9uVG9TY3JvbGxUeXBlOiBmdW5jdGlvbih0b3VjaEFjdGlvbikge1xuICAgICAgdmFyIHQgPSB0b3VjaEFjdGlvbjtcbiAgICAgIHZhciBzdCA9IHRoaXMuc2Nyb2xsVHlwZXM7XG4gICAgICBpZiAodCA9PT0gc3QuRU1JVFRFUikge1xuICAgICAgICByZXR1cm4gJ25vbmUnO1xuICAgICAgfSBlbHNlIGlmICh0ID09PSBzdC5YU0NST0xMRVIpIHtcbiAgICAgICAgcmV0dXJuICdYJztcbiAgICAgIH0gZWxzZSBpZiAodCA9PT0gc3QuWVNDUk9MTEVSKSB7XG4gICAgICAgIHJldHVybiAnWSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gJ1hZJztcbiAgICAgIH1cbiAgICB9LFxuICAgIFBPSU5URVJfVFlQRTogJ3RvdWNoJyxcbiAgICBmaXJzdFRvdWNoOiBudWxsLFxuICAgIGlzUHJpbWFyeVRvdWNoOiBmdW5jdGlvbihpblRvdWNoKSB7XG4gICAgICByZXR1cm4gdGhpcy5maXJzdFRvdWNoID09PSBpblRvdWNoLmlkZW50aWZpZXI7XG4gICAgfSxcbiAgICBzZXRQcmltYXJ5VG91Y2g6IGZ1bmN0aW9uKGluVG91Y2gpIHtcbiAgICAgIC8vIHNldCBwcmltYXJ5IHRvdWNoIGlmIHRoZXJlIG5vIHBvaW50ZXJzLCBvciB0aGUgb25seSBwb2ludGVyIGlzIHRoZSBtb3VzZVxuICAgICAgaWYgKHBvaW50ZXJtYXAucG9pbnRlcnMoKSA9PT0gMCB8fCAocG9pbnRlcm1hcC5wb2ludGVycygpID09PSAxICYmIHBvaW50ZXJtYXAuaGFzKDEpKSkge1xuICAgICAgICB0aGlzLmZpcnN0VG91Y2ggPSBpblRvdWNoLmlkZW50aWZpZXI7XG4gICAgICAgIHRoaXMuZmlyc3RYWSA9IHtYOiBpblRvdWNoLmNsaWVudFgsIFk6IGluVG91Y2guY2xpZW50WX07XG4gICAgICAgIHRoaXMuZmlyc3RUYXJnZXQgPSBpblRvdWNoLnRhcmdldDtcbiAgICAgICAgdGhpcy5zY3JvbGxpbmcgPSBudWxsO1xuICAgICAgICB0aGlzLmNhbmNlbFJlc2V0Q2xpY2tDb3VudCgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVtb3ZlUHJpbWFyeVBvaW50ZXI6IGZ1bmN0aW9uKGluUG9pbnRlcikge1xuICAgICAgaWYgKGluUG9pbnRlci5pc1ByaW1hcnkpIHtcbiAgICAgICAgdGhpcy5maXJzdFRvdWNoID0gbnVsbDtcbiAgICAgICAgdGhpcy5maXJzdFhZID0gbnVsbDtcbiAgICAgICAgdGhpcy5yZXNldENsaWNrQ291bnQoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGNsaWNrQ291bnQ6IDAsXG4gICAgcmVzZXRJZDogbnVsbCxcbiAgICByZXNldENsaWNrQ291bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGZuID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuY2xpY2tDb3VudCA9IDA7XG4gICAgICAgIHRoaXMucmVzZXRJZCA9IG51bGw7XG4gICAgICB9LmJpbmQodGhpcyk7XG4gICAgICB0aGlzLnJlc2V0SWQgPSBzZXRUaW1lb3V0KGZuLCBDTElDS19DT1VOVF9USU1FT1VUKTtcbiAgICB9LFxuICAgIGNhbmNlbFJlc2V0Q2xpY2tDb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5yZXNldElkKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnJlc2V0SWQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgdHlwZVRvQnV0dG9uczogZnVuY3Rpb24odHlwZSkge1xuICAgICAgdmFyIHJldCA9IDA7XG4gICAgICBpZiAodHlwZSA9PT0gJ3RvdWNoc3RhcnQnIHx8IHR5cGUgPT09ICd0b3VjaG1vdmUnKSB7XG4gICAgICAgIHJldCA9IDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH0sXG4gICAgZmluZFRhcmdldDogZnVuY3Rpb24odG91Y2gsIGlkKSB7XG4gICAgICBpZiAodGhpcy5jdXJyZW50VG91Y2hFdmVudC50eXBlID09PSAndG91Y2hzdGFydCcpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNQcmltYXJ5VG91Y2godG91Y2gpKSB7XG4gICAgICAgICAgdmFyIGZhc3RQYXRoID0ge1xuICAgICAgICAgICAgY2xpZW50WDogdG91Y2guY2xpZW50WCxcbiAgICAgICAgICAgIGNsaWVudFk6IHRvdWNoLmNsaWVudFksXG4gICAgICAgICAgICBwYXRoOiB0aGlzLmN1cnJlbnRUb3VjaEV2ZW50LnBhdGgsXG4gICAgICAgICAgICB0YXJnZXQ6IHRoaXMuY3VycmVudFRvdWNoRXZlbnQudGFyZ2V0XG4gICAgICAgICAgfTtcbiAgICAgICAgICByZXR1cm4gc2NvcGUuZmluZFRhcmdldChmYXN0UGF0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHNjb3BlLmZpbmRUYXJnZXQodG91Y2gpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyByZXVzZSB0YXJnZXQgd2UgZm91bmQgaW4gdG91Y2hzdGFydFxuICAgICAgcmV0dXJuIHBvaW50ZXJtYXAuZ2V0KGlkKTtcbiAgICB9LFxuICAgIHRvdWNoVG9Qb2ludGVyOiBmdW5jdGlvbihpblRvdWNoKSB7XG4gICAgICB2YXIgY3RlID0gdGhpcy5jdXJyZW50VG91Y2hFdmVudDtcbiAgICAgIHZhciBlID0gZGlzcGF0Y2hlci5jbG9uZUV2ZW50KGluVG91Y2gpO1xuICAgICAgLy8gU3BlYyBzcGVjaWZpZXMgdGhhdCBwb2ludGVySWQgMSBpcyByZXNlcnZlZCBmb3IgTW91c2UuXG4gICAgICAvLyBUb3VjaCBpZGVudGlmaWVycyBjYW4gc3RhcnQgYXQgMC5cbiAgICAgIC8vIEFkZCAyIHRvIHRoZSB0b3VjaCBpZGVudGlmaWVyIGZvciBjb21wYXRpYmlsaXR5LlxuICAgICAgdmFyIGlkID0gZS5wb2ludGVySWQgPSBpblRvdWNoLmlkZW50aWZpZXIgKyAyO1xuICAgICAgZS50YXJnZXQgPSB0aGlzLmZpbmRUYXJnZXQoaW5Ub3VjaCwgaWQpO1xuICAgICAgZS5idWJibGVzID0gdHJ1ZTtcbiAgICAgIGUuY2FuY2VsYWJsZSA9IHRydWU7XG4gICAgICBlLmRldGFpbCA9IHRoaXMuY2xpY2tDb3VudDtcbiAgICAgIGUuYnV0dG9ucyA9IHRoaXMudHlwZVRvQnV0dG9ucyhjdGUudHlwZSk7XG4gICAgICBlLndpZHRoID0gaW5Ub3VjaC53ZWJraXRSYWRpdXNYIHx8IGluVG91Y2gucmFkaXVzWCB8fCAwO1xuICAgICAgZS5oZWlnaHQgPSBpblRvdWNoLndlYmtpdFJhZGl1c1kgfHwgaW5Ub3VjaC5yYWRpdXNZIHx8IDA7XG4gICAgICBlLnByZXNzdXJlID0gaW5Ub3VjaC53ZWJraXRGb3JjZSB8fCBpblRvdWNoLmZvcmNlIHx8IDAuNTtcbiAgICAgIGUuaXNQcmltYXJ5ID0gdGhpcy5pc1ByaW1hcnlUb3VjaChpblRvdWNoKTtcbiAgICAgIGUucG9pbnRlclR5cGUgPSB0aGlzLlBPSU5URVJfVFlQRTtcbiAgICAgIGUuX3NvdXJjZSA9ICd0b3VjaCc7XG4gICAgICAvLyBmb3J3YXJkIHRvdWNoIHByZXZlbnREZWZhdWx0c1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLnNjcm9sbGluZyA9IGZhbHNlO1xuICAgICAgICBzZWxmLmZpcnN0WFkgPSBudWxsO1xuICAgICAgICBjdGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH07XG4gICAgICByZXR1cm4gZTtcbiAgICB9LFxuICAgIHByb2Nlc3NUb3VjaGVzOiBmdW5jdGlvbihpbkV2ZW50LCBpbkZ1bmN0aW9uKSB7XG4gICAgICB2YXIgdGwgPSBpbkV2ZW50LmNoYW5nZWRUb3VjaGVzO1xuICAgICAgdGhpcy5jdXJyZW50VG91Y2hFdmVudCA9IGluRXZlbnQ7XG4gICAgICBmb3IgKHZhciBpID0gMCwgdCwgcDsgaSA8IHRsLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHQgPSB0bFtpXTtcbiAgICAgICAgcCA9IHRoaXMudG91Y2hUb1BvaW50ZXIodCk7XG4gICAgICAgIGlmIChpbkV2ZW50LnR5cGUgPT09ICd0b3VjaHN0YXJ0Jykge1xuICAgICAgICAgIHBvaW50ZXJtYXAuc2V0KHAucG9pbnRlcklkLCBwLnRhcmdldCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBvaW50ZXJtYXAuaGFzKHAucG9pbnRlcklkKSkge1xuICAgICAgICAgIGluRnVuY3Rpb24uY2FsbCh0aGlzLCBwKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5FdmVudC50eXBlID09PSAndG91Y2hlbmQnIHx8IGluRXZlbnQuX2NhbmNlbCkge1xuICAgICAgICAgIHRoaXMuY2xlYW5VcFBvaW50ZXIocCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIC8vIEZvciBzaW5nbGUgYXhpcyBzY3JvbGxlcnMsIGRldGVybWluZXMgd2hldGhlciB0aGUgZWxlbWVudCBzaG91bGQgZW1pdFxuICAgIC8vIHBvaW50ZXIgZXZlbnRzIG9yIGJlaGF2ZSBhcyBhIHNjcm9sbGVyXG4gICAgc2hvdWxkU2Nyb2xsOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpZiAodGhpcy5maXJzdFhZKSB7XG4gICAgICAgIHZhciByZXQ7XG4gICAgICAgIHZhciB0b3VjaEFjdGlvbiA9IHNjb3BlLnRhcmdldEZpbmRpbmcuZmluZFRvdWNoQWN0aW9uKGluRXZlbnQpO1xuICAgICAgICB2YXIgc2Nyb2xsQXhpcyA9IHRoaXMudG91Y2hBY3Rpb25Ub1Njcm9sbFR5cGUodG91Y2hBY3Rpb24pO1xuICAgICAgICBpZiAoc2Nyb2xsQXhpcyA9PT0gJ25vbmUnKSB7XG4gICAgICAgICAgLy8gdGhpcyBlbGVtZW50IGlzIGEgdG91Y2gtYWN0aW9uOiBub25lLCBzaG91bGQgbmV2ZXIgc2Nyb2xsXG4gICAgICAgICAgcmV0ID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAoc2Nyb2xsQXhpcyA9PT0gJ1hZJykge1xuICAgICAgICAgIC8vIHRoaXMgZWxlbWVudCBzaG91bGQgYWx3YXlzIHNjcm9sbFxuICAgICAgICAgIHJldCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHQgPSBpbkV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdO1xuICAgICAgICAgIC8vIGNoZWNrIHRoZSBpbnRlbmRlZCBzY3JvbGwgYXhpcywgYW5kIG90aGVyIGF4aXNcbiAgICAgICAgICB2YXIgYSA9IHNjcm9sbEF4aXM7XG4gICAgICAgICAgdmFyIG9hID0gc2Nyb2xsQXhpcyA9PT0gJ1knID8gJ1gnIDogJ1knO1xuICAgICAgICAgIHZhciBkYSA9IE1hdGguYWJzKHRbJ2NsaWVudCcgKyBhXSAtIHRoaXMuZmlyc3RYWVthXSk7XG4gICAgICAgICAgdmFyIGRvYSA9IE1hdGguYWJzKHRbJ2NsaWVudCcgKyBvYV0gLSB0aGlzLmZpcnN0WFlbb2FdKTtcbiAgICAgICAgICAvLyBpZiBkZWx0YSBpbiB0aGUgc2Nyb2xsIGF4aXMgPiBkZWx0YSBvdGhlciBheGlzLCBzY3JvbGwgaW5zdGVhZCBvZlxuICAgICAgICAgIC8vIG1ha2luZyBldmVudHNcbiAgICAgICAgICByZXQgPSBkYSA+PSBkb2E7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH1cbiAgICB9LFxuICAgIGZpbmRUb3VjaDogZnVuY3Rpb24oaW5UTCwgaW5JZCkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBpblRMLmxlbmd0aCwgdDsgaSA8IGwgJiYgKHQgPSBpblRMW2ldKTsgaSsrKSB7XG4gICAgICAgIGlmICh0LmlkZW50aWZpZXIgPT09IGluSWQpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgLy8gSW4gc29tZSBpbnN0YW5jZXMsIGEgdG91Y2hzdGFydCBjYW4gaGFwcGVuIHdpdGhvdXQgYSB0b3VjaGVuZC4gVGhpc1xuICAgIC8vIGxlYXZlcyB0aGUgcG9pbnRlcm1hcCBpbiBhIGJyb2tlbiBzdGF0ZS5cbiAgICAvLyBUaGVyZWZvcmUsIG9uIGV2ZXJ5IHRvdWNoc3RhcnQsIHdlIHJlbW92ZSB0aGUgdG91Y2hlcyB0aGF0IGRpZCBub3QgZmlyZSBhXG4gICAgLy8gdG91Y2hlbmQgZXZlbnQuXG4gICAgLy8gVG8ga2VlcCBzdGF0ZSBnbG9iYWxseSBjb25zaXN0ZW50LCB3ZSBmaXJlIGFcbiAgICAvLyBwb2ludGVyY2FuY2VsIGZvciB0aGlzIFwiYWJhbmRvbmVkXCIgdG91Y2hcbiAgICB2YWN1dW1Ub3VjaGVzOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgdGwgPSBpbkV2ZW50LnRvdWNoZXM7XG4gICAgICAvLyBwb2ludGVybWFwLnBvaW50ZXJzKCkgc2hvdWxkIGJlIDwgdGwubGVuZ3RoIGhlcmUsIGFzIHRoZSB0b3VjaHN0YXJ0IGhhcyBub3RcbiAgICAgIC8vIGJlZW4gcHJvY2Vzc2VkIHlldC5cbiAgICAgIGlmIChwb2ludGVybWFwLnBvaW50ZXJzKCkgPj0gdGwubGVuZ3RoKSB7XG4gICAgICAgIHZhciBkID0gW107XG4gICAgICAgIHBvaW50ZXJtYXAuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgLy8gTmV2ZXIgcmVtb3ZlIHBvaW50ZXJJZCA9PSAxLCB3aGljaCBpcyBtb3VzZS5cbiAgICAgICAgICAvLyBUb3VjaCBpZGVudGlmaWVycyBhcmUgMiBzbWFsbGVyIHRoYW4gdGhlaXIgcG9pbnRlcklkLCB3aGljaCBpcyB0aGVcbiAgICAgICAgICAvLyBpbmRleCBpbiBwb2ludGVybWFwLlxuICAgICAgICAgIGlmIChrZXkgIT09IDEgJiYgIXRoaXMuZmluZFRvdWNoKHRsLCBrZXkgLSAyKSkge1xuICAgICAgICAgICAgdmFyIHAgPSB2YWx1ZTtcbiAgICAgICAgICAgIGQucHVzaChwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMpO1xuICAgICAgICBkLmZvckVhY2goZnVuY3Rpb24ocCkge1xuICAgICAgICAgIHRoaXMuY2FuY2VsKHApO1xuICAgICAgICAgIHBvaW50ZXJtYXAuZGVsZXRlKHAucG9pbnRlcklkKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgICB9XG4gICAgfSxcbiAgICB0b3VjaHN0YXJ0OiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB0aGlzLnZhY3V1bVRvdWNoZXMoaW5FdmVudCk7XG4gICAgICB0aGlzLnNldFByaW1hcnlUb3VjaChpbkV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdKTtcbiAgICAgIHRoaXMuZGVkdXBTeW50aE1vdXNlKGluRXZlbnQpO1xuICAgICAgaWYgKCF0aGlzLnNjcm9sbGluZykge1xuICAgICAgICB0aGlzLmNsaWNrQ291bnQrKztcbiAgICAgICAgdGhpcy5wcm9jZXNzVG91Y2hlcyhpbkV2ZW50LCB0aGlzLmRvd24pO1xuICAgICAgfVxuICAgIH0sXG4gICAgZG93bjogZnVuY3Rpb24oaW5Qb2ludGVyKSB7XG4gICAgICBkaXNwYXRjaGVyLmRvd24oaW5Qb2ludGVyKTtcbiAgICB9LFxuICAgIHRvdWNobW92ZTogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaWYgKEhBU19UT1VDSF9BQ1RJT04pIHtcbiAgICAgICAgLy8gdG91Y2hldmVudC5jYW5jZWxhYmxlID09IGZhbHNlIGlzIHNlbnQgd2hlbiB0aGUgcGFnZSBpcyBzY3JvbGxpbmcgdW5kZXIgbmF0aXZlIFRvdWNoIEFjdGlvbiBpbiBDaHJvbWUgMzZcbiAgICAgICAgLy8gaHR0cHM6Ly9ncm91cHMuZ29vZ2xlLmNvbS9hL2Nocm9taXVtLm9yZy9kL21zZy9pbnB1dC1kZXYvd0hueXVrY1lCY0EvYjlrbXR3TTFqSlFKXG4gICAgICAgIGlmIChpbkV2ZW50LmNhbmNlbGFibGUpIHtcbiAgICAgICAgICB0aGlzLnByb2Nlc3NUb3VjaGVzKGluRXZlbnQsIHRoaXMubW92ZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghdGhpcy5zY3JvbGxpbmcpIHtcbiAgICAgICAgICBpZiAodGhpcy5zY3JvbGxpbmcgPT09IG51bGwgJiYgdGhpcy5zaG91bGRTY3JvbGwoaW5FdmVudCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsaW5nID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIGluRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc1RvdWNoZXMoaW5FdmVudCwgdGhpcy5tb3ZlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5maXJzdFhZKSB7XG4gICAgICAgICAgdmFyIHQgPSBpbkV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdO1xuICAgICAgICAgIHZhciBkeCA9IHQuY2xpZW50WCAtIHRoaXMuZmlyc3RYWS5YO1xuICAgICAgICAgIHZhciBkeSA9IHQuY2xpZW50WSAtIHRoaXMuZmlyc3RYWS5ZO1xuICAgICAgICAgIHZhciBkZCA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG4gICAgICAgICAgaWYgKGRkID49IEhZU1RFUkVTSVMpIHtcbiAgICAgICAgICAgIHRoaXMudG91Y2hjYW5jZWwoaW5FdmVudCk7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbGluZyA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmZpcnN0WFkgPSBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgbW92ZTogZnVuY3Rpb24oaW5Qb2ludGVyKSB7XG4gICAgICBkaXNwYXRjaGVyLm1vdmUoaW5Qb2ludGVyKTtcbiAgICB9LFxuICAgIHRvdWNoZW5kOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB0aGlzLmRlZHVwU3ludGhNb3VzZShpbkV2ZW50KTtcbiAgICAgIHRoaXMucHJvY2Vzc1RvdWNoZXMoaW5FdmVudCwgdGhpcy51cCk7XG4gICAgfSxcbiAgICB1cDogZnVuY3Rpb24oaW5Qb2ludGVyKSB7XG4gICAgICBpblBvaW50ZXIucmVsYXRlZFRhcmdldCA9IHNjb3BlLmZpbmRUYXJnZXQoaW5Qb2ludGVyKTtcbiAgICAgIGRpc3BhdGNoZXIudXAoaW5Qb2ludGVyKTtcbiAgICB9LFxuICAgIGNhbmNlbDogZnVuY3Rpb24oaW5Qb2ludGVyKSB7XG4gICAgICBkaXNwYXRjaGVyLmNhbmNlbChpblBvaW50ZXIpO1xuICAgIH0sXG4gICAgdG91Y2hjYW5jZWw6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGluRXZlbnQuX2NhbmNlbCA9IHRydWU7XG4gICAgICB0aGlzLnByb2Nlc3NUb3VjaGVzKGluRXZlbnQsIHRoaXMuY2FuY2VsKTtcbiAgICB9LFxuICAgIGNsZWFuVXBQb2ludGVyOiBmdW5jdGlvbihpblBvaW50ZXIpIHtcbiAgICAgIHBvaW50ZXJtYXBbJ2RlbGV0ZSddKGluUG9pbnRlci5wb2ludGVySWQpO1xuICAgICAgdGhpcy5yZW1vdmVQcmltYXJ5UG9pbnRlcihpblBvaW50ZXIpO1xuICAgIH0sXG4gICAgLy8gcHJldmVudCBzeW50aCBtb3VzZSBldmVudHMgZnJvbSBjcmVhdGluZyBwb2ludGVyIGV2ZW50c1xuICAgIGRlZHVwU3ludGhNb3VzZTogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIGx0cyA9IHNjb3BlLm1vdXNlRXZlbnRzLmxhc3RUb3VjaGVzO1xuICAgICAgdmFyIHQgPSBpbkV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdO1xuICAgICAgLy8gb25seSB0aGUgcHJpbWFyeSBmaW5nZXIgd2lsbCBzeW50aCBtb3VzZSBldmVudHNcbiAgICAgIGlmICh0aGlzLmlzUHJpbWFyeVRvdWNoKHQpKSB7XG4gICAgICAgIC8vIHJlbWVtYmVyIHgveSBvZiBsYXN0IHRvdWNoXG4gICAgICAgIHZhciBsdCA9IHt4OiB0LmNsaWVudFgsIHk6IHQuY2xpZW50WX07XG4gICAgICAgIGx0cy5wdXNoKGx0KTtcbiAgICAgICAgdmFyIGZuID0gKGZ1bmN0aW9uKGx0cywgbHQpe1xuICAgICAgICAgIHZhciBpID0gbHRzLmluZGV4T2YobHQpO1xuICAgICAgICAgIGlmIChpID4gLTEpIHtcbiAgICAgICAgICAgIGx0cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5iaW5kKG51bGwsIGx0cywgbHQpO1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCBERURVUF9USU1FT1VUKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLy8gcHJldmVudCBcImdob3N0IGNsaWNrc1wiIHRoYXQgY29tZSBmcm9tIGVsZW1lbnRzIHRoYXQgd2VyZSByZW1vdmVkIGluIGEgdG91Y2ggaGFuZGxlclxuICB2YXIgU1RPUF9QUk9QX0ZOID0gRXZlbnQucHJvdG90eXBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbiB8fCBFdmVudC5wcm90b3R5cGUuc3RvcFByb3BhZ2F0aW9uO1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2KSB7XG4gICAgdmFyIHggPSBldi5jbGllbnRYLCB5ID0gZXYuY2xpZW50WTtcbiAgICAvLyBjaGVjayBpZiBhIGNsaWNrIGlzIHdpdGhpbiBERURVUF9ESVNUIHB4IHJhZGl1cyBvZiB0aGUgdG91Y2hzdGFydFxuICAgIHZhciBjbG9zZVRvID0gZnVuY3Rpb24odG91Y2gpIHtcbiAgICAgIHZhciBkeCA9IE1hdGguYWJzKHggLSB0b3VjaC54KSwgZHkgPSBNYXRoLmFicyh5IC0gdG91Y2gueSk7XG4gICAgICByZXR1cm4gKGR4IDw9IERFRFVQX0RJU1QgJiYgZHkgPD0gREVEVVBfRElTVCk7XG4gICAgfTtcbiAgICAvLyBpZiBjbGljayBjb29yZGluYXRlcyBhcmUgY2xvc2UgdG8gdG91Y2ggY29vcmRpbmF0ZXMsIGFzc3VtZSB0aGUgY2xpY2sgY2FtZSBmcm9tIGEgdG91Y2hcbiAgICB2YXIgd2FzVG91Y2hlZCA9IHNjb3BlLm1vdXNlRXZlbnRzLmxhc3RUb3VjaGVzLnNvbWUoY2xvc2VUbyk7XG4gICAgLy8gaWYgdGhlIGNsaWNrIGNhbWUgZnJvbSB0b3VjaCwgYW5kIHRoZSB0b3VjaHN0YXJ0IHRhcmdldCBpcyBub3QgaW4gdGhlIHBhdGggb2YgdGhlIGNsaWNrIGV2ZW50LFxuICAgIC8vIHRoZW4gdGhlIHRvdWNoc3RhcnQgdGFyZ2V0IHdhcyBwcm9iYWJseSByZW1vdmVkLCBhbmQgdGhlIGNsaWNrIHNob3VsZCBiZSBcImJ1c3RlZFwiXG4gICAgdmFyIHBhdGggPSBzY29wZS50YXJnZXRGaW5kaW5nLnBhdGgoZXYpO1xuICAgIGlmICh3YXNUb3VjaGVkKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHBhdGhbaV0gPT09IHRvdWNoRXZlbnRzLmZpcnN0VGFyZ2V0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgU1RPUF9QUk9QX0ZOLmNhbGwoZXYpO1xuICAgIH1cbiAgfSwgdHJ1ZSk7XG5cbiAgc2NvcGUudG91Y2hFdmVudHMgPSB0b3VjaEV2ZW50cztcbn0pKHdpbmRvdy5Qb2x5bWVyR2VzdHVyZXMpO1xuXG4oZnVuY3Rpb24oc2NvcGUpIHtcbiAgdmFyIGRpc3BhdGNoZXIgPSBzY29wZS5kaXNwYXRjaGVyO1xuICB2YXIgcG9pbnRlcm1hcCA9IGRpc3BhdGNoZXIucG9pbnRlcm1hcDtcbiAgdmFyIEhBU19CSVRNQVBfVFlQRSA9IHdpbmRvdy5NU1BvaW50ZXJFdmVudCAmJiB0eXBlb2Ygd2luZG93Lk1TUG9pbnRlckV2ZW50Lk1TUE9JTlRFUl9UWVBFX01PVVNFID09PSAnbnVtYmVyJztcbiAgdmFyIG1zRXZlbnRzID0ge1xuICAgIGV2ZW50czogW1xuICAgICAgJ01TUG9pbnRlckRvd24nLFxuICAgICAgJ01TUG9pbnRlck1vdmUnLFxuICAgICAgJ01TUG9pbnRlclVwJyxcbiAgICAgICdNU1BvaW50ZXJDYW5jZWwnLFxuICAgIF0sXG4gICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgZGlzcGF0Y2hlci5saXN0ZW4odGFyZ2V0LCB0aGlzLmV2ZW50cyk7XG4gICAgfSxcbiAgICB1bnJlZ2lzdGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIGlmICh0YXJnZXQubm9kZVR5cGUgPT09IE5vZGUuRE9DVU1FTlRfTk9ERSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBkaXNwYXRjaGVyLnVubGlzdGVuKHRhcmdldCwgdGhpcy5ldmVudHMpO1xuICAgIH0sXG4gICAgUE9JTlRFUl9UWVBFUzogW1xuICAgICAgJycsXG4gICAgICAndW5hdmFpbGFibGUnLFxuICAgICAgJ3RvdWNoJyxcbiAgICAgICdwZW4nLFxuICAgICAgJ21vdXNlJ1xuICAgIF0sXG4gICAgcHJlcGFyZUV2ZW50OiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZSA9IGluRXZlbnQ7XG4gICAgICBlID0gZGlzcGF0Y2hlci5jbG9uZUV2ZW50KGluRXZlbnQpO1xuICAgICAgaWYgKEhBU19CSVRNQVBfVFlQRSkge1xuICAgICAgICBlLnBvaW50ZXJUeXBlID0gdGhpcy5QT0lOVEVSX1RZUEVTW2luRXZlbnQucG9pbnRlclR5cGVdO1xuICAgICAgfVxuICAgICAgZS5fc291cmNlID0gJ21zJztcbiAgICAgIHJldHVybiBlO1xuICAgIH0sXG4gICAgY2xlYW51cDogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHBvaW50ZXJtYXBbJ2RlbGV0ZSddKGlkKTtcbiAgICB9LFxuICAgIE1TUG9pbnRlckRvd246IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gdGhpcy5wcmVwYXJlRXZlbnQoaW5FdmVudCk7XG4gICAgICBlLnRhcmdldCA9IHNjb3BlLmZpbmRUYXJnZXQoaW5FdmVudCk7XG4gICAgICBwb2ludGVybWFwLnNldChpbkV2ZW50LnBvaW50ZXJJZCwgZS50YXJnZXQpO1xuICAgICAgZGlzcGF0Y2hlci5kb3duKGUpO1xuICAgIH0sXG4gICAgTVNQb2ludGVyTW92ZTogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgdmFyIHRhcmdldCA9IHBvaW50ZXJtYXAuZ2V0KGluRXZlbnQucG9pbnRlcklkKTtcbiAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgdmFyIGUgPSB0aGlzLnByZXBhcmVFdmVudChpbkV2ZW50KTtcbiAgICAgICAgZS50YXJnZXQgPSB0YXJnZXQ7XG4gICAgICAgIGRpc3BhdGNoZXIubW92ZShlKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIE1TUG9pbnRlclVwOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgZS5yZWxhdGVkVGFyZ2V0ID0gc2NvcGUuZmluZFRhcmdldChpbkV2ZW50KTtcbiAgICAgIGUudGFyZ2V0ID0gcG9pbnRlcm1hcC5nZXQoZS5wb2ludGVySWQpO1xuICAgICAgZGlzcGF0Y2hlci51cChlKTtcbiAgICAgIHRoaXMuY2xlYW51cChpbkV2ZW50LnBvaW50ZXJJZCk7XG4gICAgfSxcbiAgICBNU1BvaW50ZXJDYW5jZWw6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBlID0gdGhpcy5wcmVwYXJlRXZlbnQoaW5FdmVudCk7XG4gICAgICBlLnJlbGF0ZWRUYXJnZXQgPSBzY29wZS5maW5kVGFyZ2V0KGluRXZlbnQpO1xuICAgICAgZS50YXJnZXQgPSBwb2ludGVybWFwLmdldChlLnBvaW50ZXJJZCk7XG4gICAgICBkaXNwYXRjaGVyLmNhbmNlbChlKTtcbiAgICAgIHRoaXMuY2xlYW51cChpbkV2ZW50LnBvaW50ZXJJZCk7XG4gICAgfVxuICB9O1xuXG4gIHNjb3BlLm1zRXZlbnRzID0gbXNFdmVudHM7XG59KSh3aW5kb3cuUG9seW1lckdlc3R1cmVzKTtcblxuKGZ1bmN0aW9uKHNjb3BlKSB7XG4gIHZhciBkaXNwYXRjaGVyID0gc2NvcGUuZGlzcGF0Y2hlcjtcbiAgdmFyIHBvaW50ZXJtYXAgPSBkaXNwYXRjaGVyLnBvaW50ZXJtYXA7XG4gIHZhciBwb2ludGVyRXZlbnRzID0ge1xuICAgIGV2ZW50czogW1xuICAgICAgJ3BvaW50ZXJkb3duJyxcbiAgICAgICdwb2ludGVybW92ZScsXG4gICAgICAncG9pbnRlcnVwJyxcbiAgICAgICdwb2ludGVyY2FuY2VsJ1xuICAgIF0sXG4gICAgcHJlcGFyZUV2ZW50OiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZSA9IGRpc3BhdGNoZXIuY2xvbmVFdmVudChpbkV2ZW50KTtcbiAgICAgIGUuX3NvdXJjZSA9ICdwb2ludGVyJztcbiAgICAgIHJldHVybiBlO1xuICAgIH0sXG4gICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgZGlzcGF0Y2hlci5saXN0ZW4odGFyZ2V0LCB0aGlzLmV2ZW50cyk7XG4gICAgfSxcbiAgICB1bnJlZ2lzdGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIGlmICh0YXJnZXQubm9kZVR5cGUgPT09IE5vZGUuRE9DVU1FTlRfTk9ERSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBkaXNwYXRjaGVyLnVubGlzdGVuKHRhcmdldCwgdGhpcy5ldmVudHMpO1xuICAgIH0sXG4gICAgY2xlYW51cDogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHBvaW50ZXJtYXBbJ2RlbGV0ZSddKGlkKTtcbiAgICB9LFxuICAgIHBvaW50ZXJkb3duOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgZS50YXJnZXQgPSBzY29wZS5maW5kVGFyZ2V0KGluRXZlbnQpO1xuICAgICAgcG9pbnRlcm1hcC5zZXQoZS5wb2ludGVySWQsIGUudGFyZ2V0KTtcbiAgICAgIGRpc3BhdGNoZXIuZG93bihlKTtcbiAgICB9LFxuICAgIHBvaW50ZXJtb3ZlOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gcG9pbnRlcm1hcC5nZXQoaW5FdmVudC5wb2ludGVySWQpO1xuICAgICAgaWYgKHRhcmdldCkge1xuICAgICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgICBlLnRhcmdldCA9IHRhcmdldDtcbiAgICAgICAgZGlzcGF0Y2hlci5tb3ZlKGUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcG9pbnRlcnVwOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgZS5yZWxhdGVkVGFyZ2V0ID0gc2NvcGUuZmluZFRhcmdldChpbkV2ZW50KTtcbiAgICAgIGUudGFyZ2V0ID0gcG9pbnRlcm1hcC5nZXQoZS5wb2ludGVySWQpO1xuICAgICAgZGlzcGF0Y2hlci51cChlKTtcbiAgICAgIHRoaXMuY2xlYW51cChpbkV2ZW50LnBvaW50ZXJJZCk7XG4gICAgfSxcbiAgICBwb2ludGVyY2FuY2VsOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICB2YXIgZSA9IHRoaXMucHJlcGFyZUV2ZW50KGluRXZlbnQpO1xuICAgICAgZS5yZWxhdGVkVGFyZ2V0ID0gc2NvcGUuZmluZFRhcmdldChpbkV2ZW50KTtcbiAgICAgIGUudGFyZ2V0ID0gcG9pbnRlcm1hcC5nZXQoZS5wb2ludGVySWQpO1xuICAgICAgZGlzcGF0Y2hlci5jYW5jZWwoZSk7XG4gICAgICB0aGlzLmNsZWFudXAoaW5FdmVudC5wb2ludGVySWQpO1xuICAgIH1cbiAgfTtcblxuICBzY29wZS5wb2ludGVyRXZlbnRzID0gcG9pbnRlckV2ZW50cztcbn0pKHdpbmRvdy5Qb2x5bWVyR2VzdHVyZXMpO1xuXG4vKipcbiAqIFRoaXMgbW9kdWxlIGNvbnRhaW5zIHRoZSBoYW5kbGVycyBmb3IgbmF0aXZlIHBsYXRmb3JtIGV2ZW50cy5cbiAqIEZyb20gaGVyZSwgdGhlIGRpc3BhdGNoZXIgaXMgY2FsbGVkIHRvIGNyZWF0ZSB1bmlmaWVkIHBvaW50ZXIgZXZlbnRzLlxuICogSW5jbHVkZWQgYXJlIHRvdWNoIGV2ZW50cyAodjEpLCBtb3VzZSBldmVudHMsIGFuZCBNU1BvaW50ZXJFdmVudHMuXG4gKi9cbihmdW5jdGlvbihzY29wZSkge1xuXG4gIHZhciBkaXNwYXRjaGVyID0gc2NvcGUuZGlzcGF0Y2hlcjtcbiAgdmFyIG5hdiA9IHdpbmRvdy5uYXZpZ2F0b3I7XG5cbiAgaWYgKHdpbmRvdy5Qb2ludGVyRXZlbnQpIHtcbiAgICBkaXNwYXRjaGVyLnJlZ2lzdGVyU291cmNlKCdwb2ludGVyJywgc2NvcGUucG9pbnRlckV2ZW50cyk7XG4gIH0gZWxzZSBpZiAobmF2Lm1zUG9pbnRlckVuYWJsZWQpIHtcbiAgICBkaXNwYXRjaGVyLnJlZ2lzdGVyU291cmNlKCdtcycsIHNjb3BlLm1zRXZlbnRzKTtcbiAgfSBlbHNlIHtcbiAgICBkaXNwYXRjaGVyLnJlZ2lzdGVyU291cmNlKCdtb3VzZScsIHNjb3BlLm1vdXNlRXZlbnRzKTtcbiAgICBpZiAod2luZG93Lm9udG91Y2hzdGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBkaXNwYXRjaGVyLnJlZ2lzdGVyU291cmNlKCd0b3VjaCcsIHNjb3BlLnRvdWNoRXZlbnRzKTtcbiAgICB9XG4gIH1cblxuICAvLyBXb3JrIGFyb3VuZCBpT1MgYnVncyBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTM1NjI4IGFuZCBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTM2NTA2XG4gIHZhciB1YSA9IG5hdmlnYXRvci51c2VyQWdlbnQ7XG4gIHZhciBJU19JT1MgPSB1YS5tYXRjaCgvaVBhZHxpUGhvbmV8aVBvZC8pICYmICdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdztcblxuICBkaXNwYXRjaGVyLklTX0lPUyA9IElTX0lPUztcbiAgc2NvcGUudG91Y2hFdmVudHMuSVNfSU9TID0gSVNfSU9TO1xuXG4gIGRpc3BhdGNoZXIucmVnaXN0ZXIoZG9jdW1lbnQsIHRydWUpO1xufSkod2luZG93LlBvbHltZXJHZXN0dXJlcyk7XG5cbi8qKlxuICogVGhpcyBldmVudCBkZW5vdGVzIHRoZSBiZWdpbm5pbmcgb2YgYSBzZXJpZXMgb2YgdHJhY2tpbmcgZXZlbnRzLlxuICpcbiAqIEBtb2R1bGUgUG9pbnRlckdlc3R1cmVzXG4gKiBAc3VibW9kdWxlIEV2ZW50c1xuICogQGNsYXNzIHRyYWNrc3RhcnRcbiAqL1xuLyoqXG4gKiBQaXhlbHMgbW92ZWQgaW4gdGhlIHggZGlyZWN0aW9uIHNpbmNlIHRyYWNrc3RhcnQuXG4gKiBAdHlwZSBOdW1iZXJcbiAqIEBwcm9wZXJ0eSBkeFxuICovXG4vKipcbiAqIFBpeGVzIG1vdmVkIGluIHRoZSB5IGRpcmVjdGlvbiBzaW5jZSB0cmFja3N0YXJ0LlxuICogQHR5cGUgTnVtYmVyXG4gKiBAcHJvcGVydHkgZHlcbiAqL1xuLyoqXG4gKiBQaXhlbHMgbW92ZWQgaW4gdGhlIHggZGlyZWN0aW9uIHNpbmNlIHRoZSBsYXN0IHRyYWNrLlxuICogQHR5cGUgTnVtYmVyXG4gKiBAcHJvcGVydHkgZGR4XG4gKi9cbi8qKlxuICogUGl4bGVzIG1vdmVkIGluIHRoZSB5IGRpcmVjdGlvbiBzaW5jZSB0aGUgbGFzdCB0cmFjay5cbiAqIEB0eXBlIE51bWJlclxuICogQHByb3BlcnR5IGRkeVxuICovXG4vKipcbiAqIFRoZSBjbGllbnRYIHBvc2l0aW9uIG9mIHRoZSB0cmFjayBnZXN0dXJlLlxuICogQHR5cGUgTnVtYmVyXG4gKiBAcHJvcGVydHkgY2xpZW50WFxuICovXG4vKipcbiAqIFRoZSBjbGllbnRZIHBvc2l0aW9uIG9mIHRoZSB0cmFjayBnZXN0dXJlLlxuICogQHR5cGUgTnVtYmVyXG4gKiBAcHJvcGVydHkgY2xpZW50WVxuICovXG4vKipcbiAqIFRoZSBwYWdlWCBwb3NpdGlvbiBvZiB0aGUgdHJhY2sgZ2VzdHVyZS5cbiAqIEB0eXBlIE51bWJlclxuICogQHByb3BlcnR5IHBhZ2VYXG4gKi9cbi8qKlxuICogVGhlIHBhZ2VZIHBvc2l0aW9uIG9mIHRoZSB0cmFjayBnZXN0dXJlLlxuICogQHR5cGUgTnVtYmVyXG4gKiBAcHJvcGVydHkgcGFnZVlcbiAqL1xuLyoqXG4gKiBUaGUgc2NyZWVuWCBwb3NpdGlvbiBvZiB0aGUgdHJhY2sgZ2VzdHVyZS5cbiAqIEB0eXBlIE51bWJlclxuICogQHByb3BlcnR5IHNjcmVlblhcbiAqL1xuLyoqXG4gKiBUaGUgc2NyZWVuWSBwb3NpdGlvbiBvZiB0aGUgdHJhY2sgZ2VzdHVyZS5cbiAqIEB0eXBlIE51bWJlclxuICogQHByb3BlcnR5IHNjcmVlbllcbiAqL1xuLyoqXG4gKiBUaGUgbGFzdCB4IGF4aXMgZGlyZWN0aW9uIG9mIHRoZSBwb2ludGVyLlxuICogQHR5cGUgTnVtYmVyXG4gKiBAcHJvcGVydHkgeERpcmVjdGlvblxuICovXG4vKipcbiAqIFRoZSBsYXN0IHkgYXhpcyBkaXJlY3Rpb24gb2YgdGhlIHBvaW50ZXIuXG4gKiBAdHlwZSBOdW1iZXJcbiAqIEBwcm9wZXJ0eSB5RGlyZWN0aW9uXG4gKi9cbi8qKlxuICogQSBzaGFyZWQgb2JqZWN0IGJldHdlZW4gYWxsIHRyYWNraW5nIGV2ZW50cy5cbiAqIEB0eXBlIE9iamVjdFxuICogQHByb3BlcnR5IHRyYWNrSW5mb1xuICovXG4vKipcbiAqIFRoZSBlbGVtZW50IGN1cnJlbnRseSB1bmRlciB0aGUgcG9pbnRlci5cbiAqIEB0eXBlIEVsZW1lbnRcbiAqIEBwcm9wZXJ0eSByZWxhdGVkVGFyZ2V0XG4gKi9cbi8qKlxuICogVGhlIHR5cGUgb2YgcG9pbnRlciB0aGF0IG1ha2UgdGhlIHRyYWNrIGdlc3R1cmUuXG4gKiBAdHlwZSBTdHJpbmdcbiAqIEBwcm9wZXJ0eSBwb2ludGVyVHlwZVxuICovXG4vKipcbiAqXG4gKiBUaGlzIGV2ZW50IGZpcmVzIGZvciBhbGwgcG9pbnRlciBtb3ZlbWVudCBiZWluZyB0cmFja2VkLlxuICpcbiAqIEBjbGFzcyB0cmFja1xuICogQGV4dGVuZHMgdHJhY2tzdGFydFxuICovXG4vKipcbiAqIFRoaXMgZXZlbnQgZmlyZXMgd2hlbiB0aGUgcG9pbnRlciBpcyBubyBsb25nZXIgYmVpbmcgdHJhY2tlZC5cbiAqXG4gKiBAY2xhc3MgdHJhY2tlbmRcbiAqIEBleHRlbmRzIHRyYWNrc3RhcnRcbiAqL1xuXG4gKGZ1bmN0aW9uKHNjb3BlKSB7XG4gICB2YXIgZGlzcGF0Y2hlciA9IHNjb3BlLmRpc3BhdGNoZXI7XG4gICB2YXIgZXZlbnRGYWN0b3J5ID0gc2NvcGUuZXZlbnRGYWN0b3J5O1xuICAgdmFyIHBvaW50ZXJtYXAgPSBuZXcgc2NvcGUuUG9pbnRlck1hcCgpO1xuICAgdmFyIHRyYWNrID0ge1xuICAgICBldmVudHM6IFtcbiAgICAgICAnZG93bicsXG4gICAgICAgJ21vdmUnLFxuICAgICAgICd1cCcsXG4gICAgIF0sXG4gICAgIGV4cG9zZXM6IFtcbiAgICAgICd0cmFja3N0YXJ0JyxcbiAgICAgICd0cmFjaycsXG4gICAgICAndHJhY2t4JyxcbiAgICAgICd0cmFja3knLFxuICAgICAgJ3RyYWNrZW5kJ1xuICAgICBdLFxuICAgICBkZWZhdWx0QWN0aW9uczoge1xuICAgICAgICd0cmFjayc6ICdub25lJyxcbiAgICAgICAndHJhY2t4JzogJ3Bhbi15JyxcbiAgICAgICAndHJhY2t5JzogJ3Bhbi14J1xuICAgICB9LFxuICAgICBXSUdHTEVfVEhSRVNIT0xEOiA0LFxuICAgICBjbGFtcERpcjogZnVuY3Rpb24oaW5EZWx0YSkge1xuICAgICAgIHJldHVybiBpbkRlbHRhID4gMCA/IDEgOiAtMTtcbiAgICAgfSxcbiAgICAgY2FsY1Bvc2l0aW9uRGVsdGE6IGZ1bmN0aW9uKGluQSwgaW5CKSB7XG4gICAgICAgdmFyIHggPSAwLCB5ID0gMDtcbiAgICAgICBpZiAoaW5BICYmIGluQikge1xuICAgICAgICAgeCA9IGluQi5wYWdlWCAtIGluQS5wYWdlWDtcbiAgICAgICAgIHkgPSBpbkIucGFnZVkgLSBpbkEucGFnZVk7XG4gICAgICAgfVxuICAgICAgIHJldHVybiB7eDogeCwgeTogeX07XG4gICAgIH0sXG4gICAgIGZpcmVUcmFjazogZnVuY3Rpb24oaW5UeXBlLCBpbkV2ZW50LCBpblRyYWNraW5nRGF0YSkge1xuICAgICAgIHZhciB0ID0gaW5UcmFja2luZ0RhdGE7XG4gICAgICAgdmFyIGQgPSB0aGlzLmNhbGNQb3NpdGlvbkRlbHRhKHQuZG93bkV2ZW50LCBpbkV2ZW50KTtcbiAgICAgICB2YXIgZGQgPSB0aGlzLmNhbGNQb3NpdGlvbkRlbHRhKHQubGFzdE1vdmVFdmVudCwgaW5FdmVudCk7XG4gICAgICAgaWYgKGRkLngpIHtcbiAgICAgICAgIHQueERpcmVjdGlvbiA9IHRoaXMuY2xhbXBEaXIoZGQueCk7XG4gICAgICAgfSBlbHNlIGlmIChpblR5cGUgPT09ICd0cmFja3gnKSB7XG4gICAgICAgICByZXR1cm47XG4gICAgICAgfVxuICAgICAgIGlmIChkZC55KSB7XG4gICAgICAgICB0LnlEaXJlY3Rpb24gPSB0aGlzLmNsYW1wRGlyKGRkLnkpO1xuICAgICAgIH0gZWxzZSBpZiAoaW5UeXBlID09PSAndHJhY2t5Jykge1xuICAgICAgICAgcmV0dXJuO1xuICAgICAgIH1cbiAgICAgICB2YXIgZ2VzdHVyZVByb3RvID0ge1xuICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgICB0cmFja0luZm86IHQudHJhY2tJbmZvLFxuICAgICAgICAgcmVsYXRlZFRhcmdldDogaW5FdmVudC5yZWxhdGVkVGFyZ2V0LFxuICAgICAgICAgcG9pbnRlclR5cGU6IGluRXZlbnQucG9pbnRlclR5cGUsXG4gICAgICAgICBwb2ludGVySWQ6IGluRXZlbnQucG9pbnRlcklkLFxuICAgICAgICAgX3NvdXJjZTogJ3RyYWNrJ1xuICAgICAgIH07XG4gICAgICAgaWYgKGluVHlwZSAhPT0gJ3RyYWNreScpIHtcbiAgICAgICAgIGdlc3R1cmVQcm90by54ID0gaW5FdmVudC54O1xuICAgICAgICAgZ2VzdHVyZVByb3RvLmR4ID0gZC54O1xuICAgICAgICAgZ2VzdHVyZVByb3RvLmRkeCA9IGRkLng7XG4gICAgICAgICBnZXN0dXJlUHJvdG8uY2xpZW50WCA9IGluRXZlbnQuY2xpZW50WDtcbiAgICAgICAgIGdlc3R1cmVQcm90by5wYWdlWCA9IGluRXZlbnQucGFnZVg7XG4gICAgICAgICBnZXN0dXJlUHJvdG8uc2NyZWVuWCA9IGluRXZlbnQuc2NyZWVuWDtcbiAgICAgICAgIGdlc3R1cmVQcm90by54RGlyZWN0aW9uID0gdC54RGlyZWN0aW9uO1xuICAgICAgIH1cbiAgICAgICBpZiAoaW5UeXBlICE9PSAndHJhY2t4Jykge1xuICAgICAgICAgZ2VzdHVyZVByb3RvLmR5ID0gZC55O1xuICAgICAgICAgZ2VzdHVyZVByb3RvLmRkeSA9IGRkLnk7XG4gICAgICAgICBnZXN0dXJlUHJvdG8ueSA9IGluRXZlbnQueTtcbiAgICAgICAgIGdlc3R1cmVQcm90by5jbGllbnRZID0gaW5FdmVudC5jbGllbnRZO1xuICAgICAgICAgZ2VzdHVyZVByb3RvLnBhZ2VZID0gaW5FdmVudC5wYWdlWTtcbiAgICAgICAgIGdlc3R1cmVQcm90by5zY3JlZW5ZID0gaW5FdmVudC5zY3JlZW5ZO1xuICAgICAgICAgZ2VzdHVyZVByb3RvLnlEaXJlY3Rpb24gPSB0LnlEaXJlY3Rpb247XG4gICAgICAgfVxuICAgICAgIHZhciBlID0gZXZlbnRGYWN0b3J5Lm1ha2VHZXN0dXJlRXZlbnQoaW5UeXBlLCBnZXN0dXJlUHJvdG8pO1xuICAgICAgIHQuZG93blRhcmdldC5kaXNwYXRjaEV2ZW50KGUpO1xuICAgICB9LFxuICAgICBkb3duOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICAgaWYgKGluRXZlbnQuaXNQcmltYXJ5ICYmIChpbkV2ZW50LnBvaW50ZXJUeXBlID09PSAnbW91c2UnID8gaW5FdmVudC5idXR0b25zID09PSAxIDogdHJ1ZSkpIHtcbiAgICAgICAgIHZhciBwID0ge1xuICAgICAgICAgICBkb3duRXZlbnQ6IGluRXZlbnQsXG4gICAgICAgICAgIGRvd25UYXJnZXQ6IGluRXZlbnQudGFyZ2V0LFxuICAgICAgICAgICB0cmFja0luZm86IHt9LFxuICAgICAgICAgICBsYXN0TW92ZUV2ZW50OiBudWxsLFxuICAgICAgICAgICB4RGlyZWN0aW9uOiAwLFxuICAgICAgICAgICB5RGlyZWN0aW9uOiAwLFxuICAgICAgICAgICB0cmFja2luZzogZmFsc2VcbiAgICAgICAgIH07XG4gICAgICAgICBwb2ludGVybWFwLnNldChpbkV2ZW50LnBvaW50ZXJJZCwgcCk7XG4gICAgICAgfVxuICAgICB9LFxuICAgICBtb3ZlOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICAgdmFyIHAgPSBwb2ludGVybWFwLmdldChpbkV2ZW50LnBvaW50ZXJJZCk7XG4gICAgICAgaWYgKHApIHtcbiAgICAgICAgIGlmICghcC50cmFja2luZykge1xuICAgICAgICAgICB2YXIgZCA9IHRoaXMuY2FsY1Bvc2l0aW9uRGVsdGEocC5kb3duRXZlbnQsIGluRXZlbnQpO1xuICAgICAgICAgICB2YXIgbW92ZSA9IGQueCAqIGQueCArIGQueSAqIGQueTtcbiAgICAgICAgICAgLy8gc3RhcnQgdHJhY2tpbmcgb25seSBpZiBmaW5nZXIgbW92ZXMgbW9yZSB0aGFuIFdJR0dMRV9USFJFU0hPTERcbiAgICAgICAgICAgaWYgKG1vdmUgPiB0aGlzLldJR0dMRV9USFJFU0hPTEQpIHtcbiAgICAgICAgICAgICBwLnRyYWNraW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICBwLmxhc3RNb3ZlRXZlbnQgPSBwLmRvd25FdmVudDtcbiAgICAgICAgICAgICB0aGlzLmZpcmVUcmFjaygndHJhY2tzdGFydCcsIGluRXZlbnQsIHApO1xuICAgICAgICAgICB9XG4gICAgICAgICB9XG4gICAgICAgICBpZiAocC50cmFja2luZykge1xuICAgICAgICAgICB0aGlzLmZpcmVUcmFjaygndHJhY2snLCBpbkV2ZW50LCBwKTtcbiAgICAgICAgICAgdGhpcy5maXJlVHJhY2soJ3RyYWNreCcsIGluRXZlbnQsIHApO1xuICAgICAgICAgICB0aGlzLmZpcmVUcmFjaygndHJhY2t5JywgaW5FdmVudCwgcCk7XG4gICAgICAgICB9XG4gICAgICAgICBwLmxhc3RNb3ZlRXZlbnQgPSBpbkV2ZW50O1xuICAgICAgIH1cbiAgICAgfSxcbiAgICAgdXA6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgICB2YXIgcCA9IHBvaW50ZXJtYXAuZ2V0KGluRXZlbnQucG9pbnRlcklkKTtcbiAgICAgICBpZiAocCkge1xuICAgICAgICAgaWYgKHAudHJhY2tpbmcpIHtcbiAgICAgICAgICAgdGhpcy5maXJlVHJhY2soJ3RyYWNrZW5kJywgaW5FdmVudCwgcCk7XG4gICAgICAgICB9XG4gICAgICAgICBwb2ludGVybWFwLmRlbGV0ZShpbkV2ZW50LnBvaW50ZXJJZCk7XG4gICAgICAgfVxuICAgICB9XG4gICB9O1xuICAgZGlzcGF0Y2hlci5yZWdpc3Rlckdlc3R1cmUoJ3RyYWNrJywgdHJhY2spO1xuIH0pKHdpbmRvdy5Qb2x5bWVyR2VzdHVyZXMpO1xuXG4vKipcbiAqIFRoaXMgZXZlbnQgaXMgZmlyZWQgd2hlbiBhIHBvaW50ZXIgaXMgaGVsZCBkb3duIGZvciAyMDBtcy5cbiAqXG4gKiBAbW9kdWxlIFBvaW50ZXJHZXN0dXJlc1xuICogQHN1Ym1vZHVsZSBFdmVudHNcbiAqIEBjbGFzcyBob2xkXG4gKi9cbi8qKlxuICogVHlwZSBvZiBwb2ludGVyIHRoYXQgbWFkZSB0aGUgaG9sZGluZyBldmVudC5cbiAqIEB0eXBlIFN0cmluZ1xuICogQHByb3BlcnR5IHBvaW50ZXJUeXBlXG4gKi9cbi8qKlxuICogU2NyZWVuIFggYXhpcyBwb3NpdGlvbiBvZiB0aGUgaGVsZCBwb2ludGVyXG4gKiBAdHlwZSBOdW1iZXJcbiAqIEBwcm9wZXJ0eSBjbGllbnRYXG4gKi9cbi8qKlxuICogU2NyZWVuIFkgYXhpcyBwb3NpdGlvbiBvZiB0aGUgaGVsZCBwb2ludGVyXG4gKiBAdHlwZSBOdW1iZXJcbiAqIEBwcm9wZXJ0eSBjbGllbnRZXG4gKi9cbi8qKlxuICogVHlwZSBvZiBwb2ludGVyIHRoYXQgbWFkZSB0aGUgaG9sZGluZyBldmVudC5cbiAqIEB0eXBlIFN0cmluZ1xuICogQHByb3BlcnR5IHBvaW50ZXJUeXBlXG4gKi9cbi8qKlxuICogVGhpcyBldmVudCBpcyBmaXJlZCBldmVyeSAyMDBtcyB3aGlsZSBhIHBvaW50ZXIgaXMgaGVsZCBkb3duLlxuICpcbiAqIEBjbGFzcyBob2xkcHVsc2VcbiAqIEBleHRlbmRzIGhvbGRcbiAqL1xuLyoqXG4gKiBNaWxsaXNlY29uZHMgcG9pbnRlciBoYXMgYmVlbiBoZWxkIGRvd24uXG4gKiBAdHlwZSBOdW1iZXJcbiAqIEBwcm9wZXJ0eSBob2xkVGltZVxuICovXG4vKipcbiAqIFRoaXMgZXZlbnQgaXMgZmlyZWQgd2hlbiBhIGhlbGQgcG9pbnRlciBpcyByZWxlYXNlZCBvciBtb3ZlZC5cbiAqXG4gKiBAY2xhc3MgcmVsZWFzZVxuICovXG5cbihmdW5jdGlvbihzY29wZSkge1xuICB2YXIgZGlzcGF0Y2hlciA9IHNjb3BlLmRpc3BhdGNoZXI7XG4gIHZhciBldmVudEZhY3RvcnkgPSBzY29wZS5ldmVudEZhY3Rvcnk7XG4gIHZhciBob2xkID0ge1xuICAgIC8vIHdhaXQgYXQgbGVhc3QgSE9MRF9ERUxBWSBtcyBiZXR3ZWVuIGhvbGQgYW5kIHB1bHNlIGV2ZW50c1xuICAgIEhPTERfREVMQVk6IDIwMCxcbiAgICAvLyBwb2ludGVyIGNhbiBtb3ZlIFdJR0dMRV9USFJFU0hPTEQgcGl4ZWxzIGJlZm9yZSBub3QgY291bnRpbmcgYXMgYSBob2xkXG4gICAgV0lHR0xFX1RIUkVTSE9MRDogMTYsXG4gICAgZXZlbnRzOiBbXG4gICAgICAnZG93bicsXG4gICAgICAnbW92ZScsXG4gICAgICAndXAnLFxuICAgIF0sXG4gICAgZXhwb3NlczogW1xuICAgICAgJ2hvbGQnLFxuICAgICAgJ2hvbGRwdWxzZScsXG4gICAgICAncmVsZWFzZSdcbiAgICBdLFxuICAgIGhlbGRQb2ludGVyOiBudWxsLFxuICAgIGhvbGRKb2I6IG51bGwsXG4gICAgcHVsc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGhvbGQgPSBEYXRlLm5vdygpIC0gdGhpcy5oZWxkUG9pbnRlci50aW1lU3RhbXA7XG4gICAgICB2YXIgdHlwZSA9IHRoaXMuaGVsZCA/ICdob2xkcHVsc2UnIDogJ2hvbGQnO1xuICAgICAgdGhpcy5maXJlSG9sZCh0eXBlLCBob2xkKTtcbiAgICAgIHRoaXMuaGVsZCA9IHRydWU7XG4gICAgfSxcbiAgICBjYW5jZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmhvbGRKb2IpO1xuICAgICAgaWYgKHRoaXMuaGVsZCkge1xuICAgICAgICB0aGlzLmZpcmVIb2xkKCdyZWxlYXNlJyk7XG4gICAgICB9XG4gICAgICB0aGlzLmhlbGQgPSBmYWxzZTtcbiAgICAgIHRoaXMuaGVsZFBvaW50ZXIgPSBudWxsO1xuICAgICAgdGhpcy50YXJnZXQgPSBudWxsO1xuICAgICAgdGhpcy5ob2xkSm9iID0gbnVsbDtcbiAgICB9LFxuICAgIGRvd246IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGlmIChpbkV2ZW50LmlzUHJpbWFyeSAmJiAhdGhpcy5oZWxkUG9pbnRlcikge1xuICAgICAgICB0aGlzLmhlbGRQb2ludGVyID0gaW5FdmVudDtcbiAgICAgICAgdGhpcy50YXJnZXQgPSBpbkV2ZW50LnRhcmdldDtcbiAgICAgICAgdGhpcy5ob2xkSm9iID0gc2V0SW50ZXJ2YWwodGhpcy5wdWxzZS5iaW5kKHRoaXMpLCB0aGlzLkhPTERfREVMQVkpO1xuICAgICAgfVxuICAgIH0sXG4gICAgdXA6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIGlmICh0aGlzLmhlbGRQb2ludGVyICYmIHRoaXMuaGVsZFBvaW50ZXIucG9pbnRlcklkID09PSBpbkV2ZW50LnBvaW50ZXJJZCkge1xuICAgICAgICB0aGlzLmNhbmNlbCgpO1xuICAgICAgfVxuICAgIH0sXG4gICAgbW92ZTogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaWYgKHRoaXMuaGVsZFBvaW50ZXIgJiYgdGhpcy5oZWxkUG9pbnRlci5wb2ludGVySWQgPT09IGluRXZlbnQucG9pbnRlcklkKSB7XG4gICAgICAgIHZhciB4ID0gaW5FdmVudC5jbGllbnRYIC0gdGhpcy5oZWxkUG9pbnRlci5jbGllbnRYO1xuICAgICAgICB2YXIgeSA9IGluRXZlbnQuY2xpZW50WSAtIHRoaXMuaGVsZFBvaW50ZXIuY2xpZW50WTtcbiAgICAgICAgaWYgKCh4ICogeCArIHkgKiB5KSA+IHRoaXMuV0lHR0xFX1RIUkVTSE9MRCkge1xuICAgICAgICAgIHRoaXMuY2FuY2VsKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGZpcmVIb2xkOiBmdW5jdGlvbihpblR5cGUsIGluSG9sZFRpbWUpIHtcbiAgICAgIHZhciBwID0ge1xuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICBwb2ludGVyVHlwZTogdGhpcy5oZWxkUG9pbnRlci5wb2ludGVyVHlwZSxcbiAgICAgICAgcG9pbnRlcklkOiB0aGlzLmhlbGRQb2ludGVyLnBvaW50ZXJJZCxcbiAgICAgICAgeDogdGhpcy5oZWxkUG9pbnRlci5jbGllbnRYLFxuICAgICAgICB5OiB0aGlzLmhlbGRQb2ludGVyLmNsaWVudFksXG4gICAgICAgIF9zb3VyY2U6ICdob2xkJ1xuICAgICAgfTtcbiAgICAgIGlmIChpbkhvbGRUaW1lKSB7XG4gICAgICAgIHAuaG9sZFRpbWUgPSBpbkhvbGRUaW1lO1xuICAgICAgfVxuICAgICAgdmFyIGUgPSBldmVudEZhY3RvcnkubWFrZUdlc3R1cmVFdmVudChpblR5cGUsIHApO1xuICAgICAgdGhpcy50YXJnZXQuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9XG4gIH07XG4gIGRpc3BhdGNoZXIucmVnaXN0ZXJHZXN0dXJlKCdob2xkJywgaG9sZCk7XG59KSh3aW5kb3cuUG9seW1lckdlc3R1cmVzKTtcblxuLyoqXG4gKiBUaGlzIGV2ZW50IGlzIGZpcmVkIHdoZW4gYSBwb2ludGVyIHF1aWNrbHkgZ29lcyBkb3duIGFuZCB1cCwgYW5kIGlzIHVzZWQgdG9cbiAqIGRlbm90ZSBhY3RpdmF0aW9uLlxuICpcbiAqIEFueSBnZXN0dXJlIGV2ZW50IGNhbiBwcmV2ZW50IHRoZSB0YXAgZXZlbnQgZnJvbSBiZWluZyBjcmVhdGVkIGJ5IGNhbGxpbmdcbiAqIGBldmVudC5wcmV2ZW50VGFwYC5cbiAqXG4gKiBBbnkgcG9pbnRlciBldmVudCBjYW4gcHJldmVudCB0aGUgdGFwIGJ5IHNldHRpbmcgdGhlIGB0YXBQcmV2ZW50ZWRgIHByb3BlcnR5XG4gKiBvbiBpdHNlbGYuXG4gKlxuICogQG1vZHVsZSBQb2ludGVyR2VzdHVyZXNcbiAqIEBzdWJtb2R1bGUgRXZlbnRzXG4gKiBAY2xhc3MgdGFwXG4gKi9cbi8qKlxuICogWCBheGlzIHBvc2l0aW9uIG9mIHRoZSB0YXAuXG4gKiBAcHJvcGVydHkgeFxuICogQHR5cGUgTnVtYmVyXG4gKi9cbi8qKlxuICogWSBheGlzIHBvc2l0aW9uIG9mIHRoZSB0YXAuXG4gKiBAcHJvcGVydHkgeVxuICogQHR5cGUgTnVtYmVyXG4gKi9cbi8qKlxuICogVHlwZSBvZiB0aGUgcG9pbnRlciB0aGF0IG1hZGUgdGhlIHRhcC5cbiAqIEBwcm9wZXJ0eSBwb2ludGVyVHlwZVxuICogQHR5cGUgU3RyaW5nXG4gKi9cbihmdW5jdGlvbihzY29wZSkge1xuICB2YXIgZGlzcGF0Y2hlciA9IHNjb3BlLmRpc3BhdGNoZXI7XG4gIHZhciBldmVudEZhY3RvcnkgPSBzY29wZS5ldmVudEZhY3Rvcnk7XG4gIHZhciBwb2ludGVybWFwID0gbmV3IHNjb3BlLlBvaW50ZXJNYXAoKTtcbiAgdmFyIHRhcCA9IHtcbiAgICBldmVudHM6IFtcbiAgICAgICdkb3duJyxcbiAgICAgICd1cCdcbiAgICBdLFxuICAgIGV4cG9zZXM6IFtcbiAgICAgICd0YXAnXG4gICAgXSxcbiAgICBkb3duOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICBpZiAoaW5FdmVudC5pc1ByaW1hcnkgJiYgIWluRXZlbnQudGFwUHJldmVudGVkKSB7XG4gICAgICAgIHBvaW50ZXJtYXAuc2V0KGluRXZlbnQucG9pbnRlcklkLCB7XG4gICAgICAgICAgdGFyZ2V0OiBpbkV2ZW50LnRhcmdldCxcbiAgICAgICAgICBidXR0b25zOiBpbkV2ZW50LmJ1dHRvbnMsXG4gICAgICAgICAgeDogaW5FdmVudC5jbGllbnRYLFxuICAgICAgICAgIHk6IGluRXZlbnQuY2xpZW50WVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHNob3VsZFRhcDogZnVuY3Rpb24oZSwgZG93blN0YXRlKSB7XG4gICAgICB2YXIgdGFwID0gdHJ1ZTtcbiAgICAgIGlmIChlLnBvaW50ZXJUeXBlID09PSAnbW91c2UnKSB7XG4gICAgICAgIC8vIG9ubHkgYWxsb3cgbGVmdCBjbGljayB0byB0YXAgZm9yIG1vdXNlXG4gICAgICAgIHRhcCA9IChlLmJ1dHRvbnMgXiAxKSAmJiAoZG93blN0YXRlLmJ1dHRvbnMgJiAxKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0YXAgJiYgIWUudGFwUHJldmVudGVkO1xuICAgIH0sXG4gICAgdXA6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBzdGFydCA9IHBvaW50ZXJtYXAuZ2V0KGluRXZlbnQucG9pbnRlcklkKTtcbiAgICAgIGlmIChzdGFydCAmJiB0aGlzLnNob3VsZFRhcChpbkV2ZW50LCBzdGFydCkpIHtcbiAgICAgICAgLy8gdXAucmVsYXRlZFRhcmdldCBpcyB0YXJnZXQgY3VycmVudGx5IHVuZGVyIGZpbmdlclxuICAgICAgICB2YXIgdCA9IHNjb3BlLnRhcmdldEZpbmRpbmcuTENBKHN0YXJ0LnRhcmdldCwgaW5FdmVudC5yZWxhdGVkVGFyZ2V0KTtcbiAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICB2YXIgZSA9IGV2ZW50RmFjdG9yeS5tYWtlR2VzdHVyZUV2ZW50KCd0YXAnLCB7XG4gICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHg6IGluRXZlbnQuY2xpZW50WCxcbiAgICAgICAgICAgIHk6IGluRXZlbnQuY2xpZW50WSxcbiAgICAgICAgICAgIGRldGFpbDogaW5FdmVudC5kZXRhaWwsXG4gICAgICAgICAgICBwb2ludGVyVHlwZTogaW5FdmVudC5wb2ludGVyVHlwZSxcbiAgICAgICAgICAgIHBvaW50ZXJJZDogaW5FdmVudC5wb2ludGVySWQsXG4gICAgICAgICAgICBhbHRLZXk6IGluRXZlbnQuYWx0S2V5LFxuICAgICAgICAgICAgY3RybEtleTogaW5FdmVudC5jdHJsS2V5LFxuICAgICAgICAgICAgbWV0YUtleTogaW5FdmVudC5tZXRhS2V5LFxuICAgICAgICAgICAgc2hpZnRLZXk6IGluRXZlbnQuc2hpZnRLZXksXG4gICAgICAgICAgICBfc291cmNlOiAndGFwJ1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHQuZGlzcGF0Y2hFdmVudChlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcG9pbnRlcm1hcC5kZWxldGUoaW5FdmVudC5wb2ludGVySWQpO1xuICAgIH1cbiAgfTtcbiAgLy8gcGF0Y2ggZXZlbnRGYWN0b3J5IHRvIHJlbW92ZSBpZCBmcm9tIHRhcCdzIHBvaW50ZXJtYXAgZm9yIHByZXZlbnRUYXAgY2FsbHNcbiAgZXZlbnRGYWN0b3J5LnByZXZlbnRUYXAgPSBmdW5jdGlvbihlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgZS50YXBQcmV2ZW50ZWQgPSB0cnVlO1xuICAgICAgcG9pbnRlcm1hcC5kZWxldGUoZS5wb2ludGVySWQpO1xuICAgIH07XG4gIH07XG4gIGRpc3BhdGNoZXIucmVnaXN0ZXJHZXN0dXJlKCd0YXAnLCB0YXApO1xufSkod2luZG93LlBvbHltZXJHZXN0dXJlcyk7XG5cbi8qXG4gKiBCYXNpYyBzdHJhdGVneTogZmluZCB0aGUgZmFydGhlc3QgYXBhcnQgcG9pbnRzLCB1c2UgYXMgZGlhbWV0ZXIgb2YgY2lyY2xlXG4gKiByZWFjdCB0byBzaXplIGNoYW5nZSBhbmQgcm90YXRpb24gb2YgdGhlIGNob3JkXG4gKi9cblxuLyoqXG4gKiBAbW9kdWxlIHBvaW50ZXItZ2VzdHVyZXNcbiAqIEBzdWJtb2R1bGUgRXZlbnRzXG4gKiBAY2xhc3MgcGluY2hcbiAqL1xuLyoqXG4gKiBTY2FsZSBvZiB0aGUgcGluY2ggem9vbSBnZXN0dXJlXG4gKiBAcHJvcGVydHkgc2NhbGVcbiAqIEB0eXBlIE51bWJlclxuICovXG4vKipcbiAqIENlbnRlciBYIHBvc2l0aW9uIG9mIHBvaW50ZXJzIGNhdXNpbmcgcGluY2hcbiAqIEBwcm9wZXJ0eSBjZW50ZXJYXG4gKiBAdHlwZSBOdW1iZXJcbiAqL1xuLyoqXG4gKiBDZW50ZXIgWSBwb3NpdGlvbiBvZiBwb2ludGVycyBjYXVzaW5nIHBpbmNoXG4gKiBAcHJvcGVydHkgY2VudGVyWVxuICogQHR5cGUgTnVtYmVyXG4gKi9cblxuLyoqXG4gKiBAbW9kdWxlIHBvaW50ZXItZ2VzdHVyZXNcbiAqIEBzdWJtb2R1bGUgRXZlbnRzXG4gKiBAY2xhc3Mgcm90YXRlXG4gKi9cbi8qKlxuICogQW5nbGUgKGluIGRlZ3JlZXMpIG9mIHJvdGF0aW9uLiBNZWFzdXJlZCBmcm9tIHN0YXJ0aW5nIHBvc2l0aW9ucyBvZiBwb2ludGVycy5cbiAqIEBwcm9wZXJ0eSBhbmdsZVxuICogQHR5cGUgTnVtYmVyXG4gKi9cbi8qKlxuICogQ2VudGVyIFggcG9zaXRpb24gb2YgcG9pbnRlcnMgY2F1c2luZyByb3RhdGlvblxuICogQHByb3BlcnR5IGNlbnRlclhcbiAqIEB0eXBlIE51bWJlclxuICovXG4vKipcbiAqIENlbnRlciBZIHBvc2l0aW9uIG9mIHBvaW50ZXJzIGNhdXNpbmcgcm90YXRpb25cbiAqIEBwcm9wZXJ0eSBjZW50ZXJZXG4gKiBAdHlwZSBOdW1iZXJcbiAqL1xuKGZ1bmN0aW9uKHNjb3BlKSB7XG4gIHZhciBkaXNwYXRjaGVyID0gc2NvcGUuZGlzcGF0Y2hlcjtcbiAgdmFyIGV2ZW50RmFjdG9yeSA9IHNjb3BlLmV2ZW50RmFjdG9yeTtcbiAgdmFyIHBvaW50ZXJtYXAgPSBuZXcgc2NvcGUuUG9pbnRlck1hcCgpO1xuICB2YXIgUkFEX1RPX0RFRyA9IDE4MCAvIE1hdGguUEk7XG4gIHZhciBwaW5jaCA9IHtcbiAgICBldmVudHM6IFtcbiAgICAgICdkb3duJyxcbiAgICAgICd1cCcsXG4gICAgICAnbW92ZScsXG4gICAgICAnY2FuY2VsJ1xuICAgIF0sXG4gICAgZXhwb3NlczogW1xuICAgICAgJ3BpbmNoc3RhcnQnLFxuICAgICAgJ3BpbmNoJyxcbiAgICAgICdwaW5jaGVuZCcsXG4gICAgICAncm90YXRlJ1xuICAgIF0sXG4gICAgZGVmYXVsdEFjdGlvbnM6IHtcbiAgICAgICdwaW5jaCc6ICdub25lJyxcbiAgICAgICdyb3RhdGUnOiAnbm9uZSdcbiAgICB9LFxuICAgIHJlZmVyZW5jZToge30sXG4gICAgZG93bjogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgcG9pbnRlcm1hcC5zZXQoaW5FdmVudC5wb2ludGVySWQsIGluRXZlbnQpO1xuICAgICAgaWYgKHBvaW50ZXJtYXAucG9pbnRlcnMoKSA9PSAyKSB7XG4gICAgICAgIHZhciBwb2ludHMgPSB0aGlzLmNhbGNDaG9yZCgpO1xuICAgICAgICB2YXIgYW5nbGUgPSB0aGlzLmNhbGNBbmdsZShwb2ludHMpO1xuICAgICAgICB0aGlzLnJlZmVyZW5jZSA9IHtcbiAgICAgICAgICBhbmdsZTogYW5nbGUsXG4gICAgICAgICAgZGlhbWV0ZXI6IHBvaW50cy5kaWFtZXRlcixcbiAgICAgICAgICB0YXJnZXQ6IHNjb3BlLnRhcmdldEZpbmRpbmcuTENBKHBvaW50cy5hLnRhcmdldCwgcG9pbnRzLmIudGFyZ2V0KVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZmlyZVBpbmNoKCdwaW5jaHN0YXJ0JywgcG9pbnRzLmRpYW1ldGVyLCBwb2ludHMpO1xuICAgICAgfVxuICAgIH0sXG4gICAgdXA6IGZ1bmN0aW9uKGluRXZlbnQpIHtcbiAgICAgIHZhciBwID0gcG9pbnRlcm1hcC5nZXQoaW5FdmVudC5wb2ludGVySWQpO1xuICAgICAgdmFyIG51bSA9IHBvaW50ZXJtYXAucG9pbnRlcnMoKTtcbiAgICAgIGlmIChwKSB7XG4gICAgICAgIGlmIChudW0gPT09IDIpIHtcbiAgICAgICAgICAvLyBmaXJlICdwaW5jaGVuZCcgYmVmb3JlIGRlbGV0aW5nIHBvaW50ZXJcbiAgICAgICAgICB2YXIgcG9pbnRzID0gdGhpcy5jYWxjQ2hvcmQoKTtcbiAgICAgICAgICB0aGlzLmZpcmVQaW5jaCgncGluY2hlbmQnLCBwb2ludHMuZGlhbWV0ZXIsIHBvaW50cyk7XG4gICAgICAgIH1cbiAgICAgICAgcG9pbnRlcm1hcC5kZWxldGUoaW5FdmVudC5wb2ludGVySWQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgbW92ZTogZnVuY3Rpb24oaW5FdmVudCkge1xuICAgICAgaWYgKHBvaW50ZXJtYXAuaGFzKGluRXZlbnQucG9pbnRlcklkKSkge1xuICAgICAgICBwb2ludGVybWFwLnNldChpbkV2ZW50LnBvaW50ZXJJZCwgaW5FdmVudCk7XG4gICAgICAgIGlmIChwb2ludGVybWFwLnBvaW50ZXJzKCkgPiAxKSB7XG4gICAgICAgICAgdGhpcy5jYWxjUGluY2hSb3RhdGUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgY2FuY2VsOiBmdW5jdGlvbihpbkV2ZW50KSB7XG4gICAgICAgIHRoaXMudXAoaW5FdmVudCk7XG4gICAgfSxcbiAgICBmaXJlUGluY2g6IGZ1bmN0aW9uKHR5cGUsIGRpYW1ldGVyLCBwb2ludHMpIHtcbiAgICAgIHZhciB6b29tID0gZGlhbWV0ZXIgLyB0aGlzLnJlZmVyZW5jZS5kaWFtZXRlcjtcbiAgICAgIHZhciBlID0gZXZlbnRGYWN0b3J5Lm1ha2VHZXN0dXJlRXZlbnQodHlwZSwge1xuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICBzY2FsZTogem9vbSxcbiAgICAgICAgY2VudGVyWDogcG9pbnRzLmNlbnRlci54LFxuICAgICAgICBjZW50ZXJZOiBwb2ludHMuY2VudGVyLnksXG4gICAgICAgIF9zb3VyY2U6ICdwaW5jaCdcbiAgICAgIH0pO1xuICAgICAgdGhpcy5yZWZlcmVuY2UudGFyZ2V0LmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgfSxcbiAgICBmaXJlUm90YXRlOiBmdW5jdGlvbihhbmdsZSwgcG9pbnRzKSB7XG4gICAgICB2YXIgZGlmZiA9IE1hdGgucm91bmQoKGFuZ2xlIC0gdGhpcy5yZWZlcmVuY2UuYW5nbGUpICUgMzYwKTtcbiAgICAgIHZhciBlID0gZXZlbnRGYWN0b3J5Lm1ha2VHZXN0dXJlRXZlbnQoJ3JvdGF0ZScsIHtcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgYW5nbGU6IGRpZmYsXG4gICAgICAgIGNlbnRlclg6IHBvaW50cy5jZW50ZXIueCxcbiAgICAgICAgY2VudGVyWTogcG9pbnRzLmNlbnRlci55LFxuICAgICAgICBfc291cmNlOiAncGluY2gnXG4gICAgICB9KTtcbiAgICAgIHRoaXMucmVmZXJlbmNlLnRhcmdldC5kaXNwYXRjaEV2ZW50KGUpO1xuICAgIH0sXG4gICAgY2FsY1BpbmNoUm90YXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwb2ludHMgPSB0aGlzLmNhbGNDaG9yZCgpO1xuICAgICAgdmFyIGRpYW1ldGVyID0gcG9pbnRzLmRpYW1ldGVyO1xuICAgICAgdmFyIGFuZ2xlID0gdGhpcy5jYWxjQW5nbGUocG9pbnRzKTtcbiAgICAgIGlmIChkaWFtZXRlciAhPSB0aGlzLnJlZmVyZW5jZS5kaWFtZXRlcikge1xuICAgICAgICB0aGlzLmZpcmVQaW5jaCgncGluY2gnLCBkaWFtZXRlciwgcG9pbnRzKTtcbiAgICAgIH1cbiAgICAgIGlmIChhbmdsZSAhPSB0aGlzLnJlZmVyZW5jZS5hbmdsZSkge1xuICAgICAgICB0aGlzLmZpcmVSb3RhdGUoYW5nbGUsIHBvaW50cyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBjYWxjQ2hvcmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHBvaW50ZXJzID0gW107XG4gICAgICBwb2ludGVybWFwLmZvckVhY2goZnVuY3Rpb24ocCkge1xuICAgICAgICBwb2ludGVycy5wdXNoKHApO1xuICAgICAgfSk7XG4gICAgICB2YXIgZGlzdCA9IDA7XG4gICAgICAvLyBzdGFydCB3aXRoIGF0IGxlYXN0IHR3byBwb2ludGVyc1xuICAgICAgdmFyIHBvaW50cyA9IHthOiBwb2ludGVyc1swXSwgYjogcG9pbnRlcnNbMV19O1xuICAgICAgdmFyIHgsIHksIGQ7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvaW50ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBhID0gcG9pbnRlcnNbaV07XG4gICAgICAgIGZvciAodmFyIGogPSBpICsgMTsgaiA8IHBvaW50ZXJzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgdmFyIGIgPSBwb2ludGVyc1tqXTtcbiAgICAgICAgICB4ID0gTWF0aC5hYnMoYS5jbGllbnRYIC0gYi5jbGllbnRYKTtcbiAgICAgICAgICB5ID0gTWF0aC5hYnMoYS5jbGllbnRZIC0gYi5jbGllbnRZKTtcbiAgICAgICAgICBkID0geCArIHk7XG4gICAgICAgICAgaWYgKGQgPiBkaXN0KSB7XG4gICAgICAgICAgICBkaXN0ID0gZDtcbiAgICAgICAgICAgIHBvaW50cyA9IHthOiBhLCBiOiBifTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHggPSBNYXRoLmFicyhwb2ludHMuYS5jbGllbnRYICsgcG9pbnRzLmIuY2xpZW50WCkgLyAyO1xuICAgICAgeSA9IE1hdGguYWJzKHBvaW50cy5hLmNsaWVudFkgKyBwb2ludHMuYi5jbGllbnRZKSAvIDI7XG4gICAgICBwb2ludHMuY2VudGVyID0geyB4OiB4LCB5OiB5IH07XG4gICAgICBwb2ludHMuZGlhbWV0ZXIgPSBkaXN0O1xuICAgICAgcmV0dXJuIHBvaW50cztcbiAgICB9LFxuICAgIGNhbGNBbmdsZTogZnVuY3Rpb24ocG9pbnRzKSB7XG4gICAgICB2YXIgeCA9IHBvaW50cy5hLmNsaWVudFggLSBwb2ludHMuYi5jbGllbnRYO1xuICAgICAgdmFyIHkgPSBwb2ludHMuYS5jbGllbnRZIC0gcG9pbnRzLmIuY2xpZW50WTtcbiAgICAgIHJldHVybiAoMzYwICsgTWF0aC5hdGFuMih5LCB4KSAqIFJBRF9UT19ERUcpICUgMzYwO1xuICAgIH1cbiAgfTtcbiAgZGlzcGF0Y2hlci5yZWdpc3Rlckdlc3R1cmUoJ3BpbmNoJywgcGluY2gpO1xufSkod2luZG93LlBvbHltZXJHZXN0dXJlcyk7XG5cbihmdW5jdGlvbiAoZ2xvYmFsKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIFRva2VuLFxuICAgICAgICBUb2tlbk5hbWUsXG4gICAgICAgIFN5bnRheCxcbiAgICAgICAgTWVzc2FnZXMsXG4gICAgICAgIHNvdXJjZSxcbiAgICAgICAgaW5kZXgsXG4gICAgICAgIGxlbmd0aCxcbiAgICAgICAgZGVsZWdhdGUsXG4gICAgICAgIGxvb2thaGVhZCxcbiAgICAgICAgc3RhdGU7XG5cbiAgICBUb2tlbiA9IHtcbiAgICAgICAgQm9vbGVhbkxpdGVyYWw6IDEsXG4gICAgICAgIEVPRjogMixcbiAgICAgICAgSWRlbnRpZmllcjogMyxcbiAgICAgICAgS2V5d29yZDogNCxcbiAgICAgICAgTnVsbExpdGVyYWw6IDUsXG4gICAgICAgIE51bWVyaWNMaXRlcmFsOiA2LFxuICAgICAgICBQdW5jdHVhdG9yOiA3LFxuICAgICAgICBTdHJpbmdMaXRlcmFsOiA4XG4gICAgfTtcblxuICAgIFRva2VuTmFtZSA9IHt9O1xuICAgIFRva2VuTmFtZVtUb2tlbi5Cb29sZWFuTGl0ZXJhbF0gPSAnQm9vbGVhbic7XG4gICAgVG9rZW5OYW1lW1Rva2VuLkVPRl0gPSAnPGVuZD4nO1xuICAgIFRva2VuTmFtZVtUb2tlbi5JZGVudGlmaWVyXSA9ICdJZGVudGlmaWVyJztcbiAgICBUb2tlbk5hbWVbVG9rZW4uS2V5d29yZF0gPSAnS2V5d29yZCc7XG4gICAgVG9rZW5OYW1lW1Rva2VuLk51bGxMaXRlcmFsXSA9ICdOdWxsJztcbiAgICBUb2tlbk5hbWVbVG9rZW4uTnVtZXJpY0xpdGVyYWxdID0gJ051bWVyaWMnO1xuICAgIFRva2VuTmFtZVtUb2tlbi5QdW5jdHVhdG9yXSA9ICdQdW5jdHVhdG9yJztcbiAgICBUb2tlbk5hbWVbVG9rZW4uU3RyaW5nTGl0ZXJhbF0gPSAnU3RyaW5nJztcblxuICAgIFN5bnRheCA9IHtcbiAgICAgICAgQXJyYXlFeHByZXNzaW9uOiAnQXJyYXlFeHByZXNzaW9uJyxcbiAgICAgICAgQmluYXJ5RXhwcmVzc2lvbjogJ0JpbmFyeUV4cHJlc3Npb24nLFxuICAgICAgICBDYWxsRXhwcmVzc2lvbjogJ0NhbGxFeHByZXNzaW9uJyxcbiAgICAgICAgQ29uZGl0aW9uYWxFeHByZXNzaW9uOiAnQ29uZGl0aW9uYWxFeHByZXNzaW9uJyxcbiAgICAgICAgRW1wdHlTdGF0ZW1lbnQ6ICdFbXB0eVN0YXRlbWVudCcsXG4gICAgICAgIEV4cHJlc3Npb25TdGF0ZW1lbnQ6ICdFeHByZXNzaW9uU3RhdGVtZW50JyxcbiAgICAgICAgSWRlbnRpZmllcjogJ0lkZW50aWZpZXInLFxuICAgICAgICBMaXRlcmFsOiAnTGl0ZXJhbCcsXG4gICAgICAgIExhYmVsZWRTdGF0ZW1lbnQ6ICdMYWJlbGVkU3RhdGVtZW50JyxcbiAgICAgICAgTG9naWNhbEV4cHJlc3Npb246ICdMb2dpY2FsRXhwcmVzc2lvbicsXG4gICAgICAgIE1lbWJlckV4cHJlc3Npb246ICdNZW1iZXJFeHByZXNzaW9uJyxcbiAgICAgICAgT2JqZWN0RXhwcmVzc2lvbjogJ09iamVjdEV4cHJlc3Npb24nLFxuICAgICAgICBQcm9ncmFtOiAnUHJvZ3JhbScsXG4gICAgICAgIFByb3BlcnR5OiAnUHJvcGVydHknLFxuICAgICAgICBUaGlzRXhwcmVzc2lvbjogJ1RoaXNFeHByZXNzaW9uJyxcbiAgICAgICAgVW5hcnlFeHByZXNzaW9uOiAnVW5hcnlFeHByZXNzaW9uJ1xuICAgIH07XG5cbiAgICAvLyBFcnJvciBtZXNzYWdlcyBzaG91bGQgYmUgaWRlbnRpY2FsIHRvIFY4LlxuICAgIE1lc3NhZ2VzID0ge1xuICAgICAgICBVbmV4cGVjdGVkVG9rZW46ICAnVW5leHBlY3RlZCB0b2tlbiAlMCcsXG4gICAgICAgIFVua25vd25MYWJlbDogJ1VuZGVmaW5lZCBsYWJlbCBcXCclMFxcJycsXG4gICAgICAgIFJlZGVjbGFyYXRpb246ICclMCBcXCclMVxcJyBoYXMgYWxyZWFkeSBiZWVuIGRlY2xhcmVkJ1xuICAgIH07XG5cbiAgICAvLyBFbnN1cmUgdGhlIGNvbmRpdGlvbiBpcyB0cnVlLCBvdGhlcndpc2UgdGhyb3cgYW4gZXJyb3IuXG4gICAgLy8gVGhpcyBpcyBvbmx5IHRvIGhhdmUgYSBiZXR0ZXIgY29udHJhY3Qgc2VtYW50aWMsIGkuZS4gYW5vdGhlciBzYWZldHkgbmV0XG4gICAgLy8gdG8gY2F0Y2ggYSBsb2dpYyBlcnJvci4gVGhlIGNvbmRpdGlvbiBzaGFsbCBiZSBmdWxmaWxsZWQgaW4gbm9ybWFsIGNhc2UuXG4gICAgLy8gRG8gTk9UIHVzZSB0aGlzIHRvIGVuZm9yY2UgYSBjZXJ0YWluIGNvbmRpdGlvbiBvbiBhbnkgdXNlciBpbnB1dC5cblxuICAgIGZ1bmN0aW9uIGFzc2VydChjb25kaXRpb24sIG1lc3NhZ2UpIHtcbiAgICAgICAgaWYgKCFjb25kaXRpb24pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQVNTRVJUOiAnICsgbWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0RlY2ltYWxEaWdpdChjaCkge1xuICAgICAgICByZXR1cm4gKGNoID49IDQ4ICYmIGNoIDw9IDU3KTsgICAvLyAwLi45XG4gICAgfVxuXG5cbiAgICAvLyA3LjIgV2hpdGUgU3BhY2VcblxuICAgIGZ1bmN0aW9uIGlzV2hpdGVTcGFjZShjaCkge1xuICAgICAgICByZXR1cm4gKGNoID09PSAzMikgfHwgIC8vIHNwYWNlXG4gICAgICAgICAgICAoY2ggPT09IDkpIHx8ICAgICAgLy8gdGFiXG4gICAgICAgICAgICAoY2ggPT09IDB4QikgfHxcbiAgICAgICAgICAgIChjaCA9PT0gMHhDKSB8fFxuICAgICAgICAgICAgKGNoID09PSAweEEwKSB8fFxuICAgICAgICAgICAgKGNoID49IDB4MTY4MCAmJiAnXFx1MTY4MFxcdTE4MEVcXHUyMDAwXFx1MjAwMVxcdTIwMDJcXHUyMDAzXFx1MjAwNFxcdTIwMDVcXHUyMDA2XFx1MjAwN1xcdTIwMDhcXHUyMDA5XFx1MjAwQVxcdTIwMkZcXHUyMDVGXFx1MzAwMFxcdUZFRkYnLmluZGV4T2YoU3RyaW5nLmZyb21DaGFyQ29kZShjaCkpID4gMCk7XG4gICAgfVxuXG4gICAgLy8gNy4zIExpbmUgVGVybWluYXRvcnNcblxuICAgIGZ1bmN0aW9uIGlzTGluZVRlcm1pbmF0b3IoY2gpIHtcbiAgICAgICAgcmV0dXJuIChjaCA9PT0gMTApIHx8IChjaCA9PT0gMTMpIHx8IChjaCA9PT0gMHgyMDI4KSB8fCAoY2ggPT09IDB4MjAyOSk7XG4gICAgfVxuXG4gICAgLy8gNy42IElkZW50aWZpZXIgTmFtZXMgYW5kIElkZW50aWZpZXJzXG5cbiAgICBmdW5jdGlvbiBpc0lkZW50aWZpZXJTdGFydChjaCkge1xuICAgICAgICByZXR1cm4gKGNoID09PSAzNikgfHwgKGNoID09PSA5NSkgfHwgIC8vICQgKGRvbGxhcikgYW5kIF8gKHVuZGVyc2NvcmUpXG4gICAgICAgICAgICAoY2ggPj0gNjUgJiYgY2ggPD0gOTApIHx8ICAgICAgICAgLy8gQS4uWlxuICAgICAgICAgICAgKGNoID49IDk3ICYmIGNoIDw9IDEyMik7ICAgICAgICAgIC8vIGEuLnpcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0lkZW50aWZpZXJQYXJ0KGNoKSB7XG4gICAgICAgIHJldHVybiAoY2ggPT09IDM2KSB8fCAoY2ggPT09IDk1KSB8fCAgLy8gJCAoZG9sbGFyKSBhbmQgXyAodW5kZXJzY29yZSlcbiAgICAgICAgICAgIChjaCA+PSA2NSAmJiBjaCA8PSA5MCkgfHwgICAgICAgICAvLyBBLi5aXG4gICAgICAgICAgICAoY2ggPj0gOTcgJiYgY2ggPD0gMTIyKSB8fCAgICAgICAgLy8gYS4uelxuICAgICAgICAgICAgKGNoID49IDQ4ICYmIGNoIDw9IDU3KTsgICAgICAgICAgIC8vIDAuLjlcbiAgICB9XG5cbiAgICAvLyA3LjYuMS4xIEtleXdvcmRzXG5cbiAgICBmdW5jdGlvbiBpc0tleXdvcmQoaWQpIHtcbiAgICAgICAgcmV0dXJuIChpZCA9PT0gJ3RoaXMnKVxuICAgIH1cblxuICAgIC8vIDcuNCBDb21tZW50c1xuXG4gICAgZnVuY3Rpb24gc2tpcFdoaXRlc3BhY2UoKSB7XG4gICAgICAgIHdoaWxlIChpbmRleCA8IGxlbmd0aCAmJiBpc1doaXRlU3BhY2Uoc291cmNlLmNoYXJDb2RlQXQoaW5kZXgpKSkge1xuICAgICAgICAgICArK2luZGV4O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0SWRlbnRpZmllcigpIHtcbiAgICAgICAgdmFyIHN0YXJ0LCBjaDtcblxuICAgICAgICBzdGFydCA9IGluZGV4Kys7XG4gICAgICAgIHdoaWxlIChpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgY2ggPSBzb3VyY2UuY2hhckNvZGVBdChpbmRleCk7XG4gICAgICAgICAgICBpZiAoaXNJZGVudGlmaWVyUGFydChjaCkpIHtcbiAgICAgICAgICAgICAgICArK2luZGV4O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzb3VyY2Uuc2xpY2Uoc3RhcnQsIGluZGV4KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzY2FuSWRlbnRpZmllcigpIHtcbiAgICAgICAgdmFyIHN0YXJ0LCBpZCwgdHlwZTtcblxuICAgICAgICBzdGFydCA9IGluZGV4O1xuXG4gICAgICAgIGlkID0gZ2V0SWRlbnRpZmllcigpO1xuXG4gICAgICAgIC8vIFRoZXJlIGlzIG5vIGtleXdvcmQgb3IgbGl0ZXJhbCB3aXRoIG9ubHkgb25lIGNoYXJhY3Rlci5cbiAgICAgICAgLy8gVGh1cywgaXQgbXVzdCBiZSBhbiBpZGVudGlmaWVyLlxuICAgICAgICBpZiAoaWQubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICB0eXBlID0gVG9rZW4uSWRlbnRpZmllcjtcbiAgICAgICAgfSBlbHNlIGlmIChpc0tleXdvcmQoaWQpKSB7XG4gICAgICAgICAgICB0eXBlID0gVG9rZW4uS2V5d29yZDtcbiAgICAgICAgfSBlbHNlIGlmIChpZCA9PT0gJ251bGwnKSB7XG4gICAgICAgICAgICB0eXBlID0gVG9rZW4uTnVsbExpdGVyYWw7XG4gICAgICAgIH0gZWxzZSBpZiAoaWQgPT09ICd0cnVlJyB8fCBpZCA9PT0gJ2ZhbHNlJykge1xuICAgICAgICAgICAgdHlwZSA9IFRva2VuLkJvb2xlYW5MaXRlcmFsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHlwZSA9IFRva2VuLklkZW50aWZpZXI7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICAgIHZhbHVlOiBpZCxcbiAgICAgICAgICAgIHJhbmdlOiBbc3RhcnQsIGluZGV4XVxuICAgICAgICB9O1xuICAgIH1cblxuXG4gICAgLy8gNy43IFB1bmN0dWF0b3JzXG5cbiAgICBmdW5jdGlvbiBzY2FuUHVuY3R1YXRvcigpIHtcbiAgICAgICAgdmFyIHN0YXJ0ID0gaW5kZXgsXG4gICAgICAgICAgICBjb2RlID0gc291cmNlLmNoYXJDb2RlQXQoaW5kZXgpLFxuICAgICAgICAgICAgY29kZTIsXG4gICAgICAgICAgICBjaDEgPSBzb3VyY2VbaW5kZXhdLFxuICAgICAgICAgICAgY2gyO1xuXG4gICAgICAgIHN3aXRjaCAoY29kZSkge1xuXG4gICAgICAgIC8vIENoZWNrIGZvciBtb3N0IGNvbW1vbiBzaW5nbGUtY2hhcmFjdGVyIHB1bmN0dWF0b3JzLlxuICAgICAgICBjYXNlIDQ2OiAgIC8vIC4gZG90XG4gICAgICAgIGNhc2UgNDA6ICAgLy8gKCBvcGVuIGJyYWNrZXRcbiAgICAgICAgY2FzZSA0MTogICAvLyApIGNsb3NlIGJyYWNrZXRcbiAgICAgICAgY2FzZSA1OTogICAvLyA7IHNlbWljb2xvblxuICAgICAgICBjYXNlIDQ0OiAgIC8vICwgY29tbWFcbiAgICAgICAgY2FzZSAxMjM6ICAvLyB7IG9wZW4gY3VybHkgYnJhY2VcbiAgICAgICAgY2FzZSAxMjU6ICAvLyB9IGNsb3NlIGN1cmx5IGJyYWNlXG4gICAgICAgIGNhc2UgOTE6ICAgLy8gW1xuICAgICAgICBjYXNlIDkzOiAgIC8vIF1cbiAgICAgICAgY2FzZSA1ODogICAvLyA6XG4gICAgICAgIGNhc2UgNjM6ICAgLy8gP1xuICAgICAgICAgICAgKytpbmRleDtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogVG9rZW4uUHVuY3R1YXRvcixcbiAgICAgICAgICAgICAgICB2YWx1ZTogU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlKSxcbiAgICAgICAgICAgICAgICByYW5nZTogW3N0YXJ0LCBpbmRleF1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGNvZGUyID0gc291cmNlLmNoYXJDb2RlQXQoaW5kZXggKyAxKTtcblxuICAgICAgICAgICAgLy8gJz0nIChjaGFyICM2MSkgbWFya3MgYW4gYXNzaWdubWVudCBvciBjb21wYXJpc29uIG9wZXJhdG9yLlxuICAgICAgICAgICAgaWYgKGNvZGUyID09PSA2MSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoY29kZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMzc6ICAvLyAlXG4gICAgICAgICAgICAgICAgY2FzZSAzODogIC8vICZcbiAgICAgICAgICAgICAgICBjYXNlIDQyOiAgLy8gKjpcbiAgICAgICAgICAgICAgICBjYXNlIDQzOiAgLy8gK1xuICAgICAgICAgICAgICAgIGNhc2UgNDU6ICAvLyAtXG4gICAgICAgICAgICAgICAgY2FzZSA0NzogIC8vIC9cbiAgICAgICAgICAgICAgICBjYXNlIDYwOiAgLy8gPFxuICAgICAgICAgICAgICAgIGNhc2UgNjI6ICAvLyA+XG4gICAgICAgICAgICAgICAgY2FzZSAxMjQ6IC8vIHxcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gMjtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFRva2VuLlB1bmN0dWF0b3IsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlKSArIFN0cmluZy5mcm9tQ2hhckNvZGUoY29kZTIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmFuZ2U6IFtzdGFydCwgaW5kZXhdXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBjYXNlIDMzOiAvLyAhXG4gICAgICAgICAgICAgICAgY2FzZSA2MTogLy8gPVxuICAgICAgICAgICAgICAgICAgICBpbmRleCArPSAyO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vICE9PSBhbmQgPT09XG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VyY2UuY2hhckNvZGVBdChpbmRleCkgPT09IDYxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICArK2luZGV4O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBUb2tlbi5QdW5jdHVhdG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHNvdXJjZS5zbGljZShzdGFydCwgaW5kZXgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmFuZ2U6IFtzdGFydCwgaW5kZXhdXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQZWVrIG1vcmUgY2hhcmFjdGVycy5cblxuICAgICAgICBjaDIgPSBzb3VyY2VbaW5kZXggKyAxXTtcblxuICAgICAgICAvLyBPdGhlciAyLWNoYXJhY3RlciBwdW5jdHVhdG9yczogJiYgfHxcblxuICAgICAgICBpZiAoY2gxID09PSBjaDIgJiYgKCcmfCcuaW5kZXhPZihjaDEpID49IDApKSB7XG4gICAgICAgICAgICBpbmRleCArPSAyO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiBUb2tlbi5QdW5jdHVhdG9yLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBjaDEgKyBjaDIsXG4gICAgICAgICAgICAgICAgcmFuZ2U6IFtzdGFydCwgaW5kZXhdXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCc8Pj0hKy0qJSZ8Xi8nLmluZGV4T2YoY2gxKSA+PSAwKSB7XG4gICAgICAgICAgICArK2luZGV4O1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiBUb2tlbi5QdW5jdHVhdG9yLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBjaDEsXG4gICAgICAgICAgICAgICAgcmFuZ2U6IFtzdGFydCwgaW5kZXhdXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhyb3dFcnJvcih7fSwgTWVzc2FnZXMuVW5leHBlY3RlZFRva2VuLCAnSUxMRUdBTCcpO1xuICAgIH1cblxuICAgIC8vIDcuOC4zIE51bWVyaWMgTGl0ZXJhbHNcbiAgICBmdW5jdGlvbiBzY2FuTnVtZXJpY0xpdGVyYWwoKSB7XG4gICAgICAgIHZhciBudW1iZXIsIHN0YXJ0LCBjaDtcblxuICAgICAgICBjaCA9IHNvdXJjZVtpbmRleF07XG4gICAgICAgIGFzc2VydChpc0RlY2ltYWxEaWdpdChjaC5jaGFyQ29kZUF0KDApKSB8fCAoY2ggPT09ICcuJyksXG4gICAgICAgICAgICAnTnVtZXJpYyBsaXRlcmFsIG11c3Qgc3RhcnQgd2l0aCBhIGRlY2ltYWwgZGlnaXQgb3IgYSBkZWNpbWFsIHBvaW50Jyk7XG5cbiAgICAgICAgc3RhcnQgPSBpbmRleDtcbiAgICAgICAgbnVtYmVyID0gJyc7XG4gICAgICAgIGlmIChjaCAhPT0gJy4nKSB7XG4gICAgICAgICAgICBudW1iZXIgPSBzb3VyY2VbaW5kZXgrK107XG4gICAgICAgICAgICBjaCA9IHNvdXJjZVtpbmRleF07XG5cbiAgICAgICAgICAgIC8vIEhleCBudW1iZXIgc3RhcnRzIHdpdGggJzB4Jy5cbiAgICAgICAgICAgIC8vIE9jdGFsIG51bWJlciBzdGFydHMgd2l0aCAnMCcuXG4gICAgICAgICAgICBpZiAobnVtYmVyID09PSAnMCcpIHtcbiAgICAgICAgICAgICAgICAvLyBkZWNpbWFsIG51bWJlciBzdGFydHMgd2l0aCAnMCcgc3VjaCBhcyAnMDknIGlzIGlsbGVnYWwuXG4gICAgICAgICAgICAgICAgaWYgKGNoICYmIGlzRGVjaW1hbERpZ2l0KGNoLmNoYXJDb2RlQXQoMCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93RXJyb3Ioe30sIE1lc3NhZ2VzLlVuZXhwZWN0ZWRUb2tlbiwgJ0lMTEVHQUwnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdoaWxlIChpc0RlY2ltYWxEaWdpdChzb3VyY2UuY2hhckNvZGVBdChpbmRleCkpKSB7XG4gICAgICAgICAgICAgICAgbnVtYmVyICs9IHNvdXJjZVtpbmRleCsrXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNoID0gc291cmNlW2luZGV4XTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjaCA9PT0gJy4nKSB7XG4gICAgICAgICAgICBudW1iZXIgKz0gc291cmNlW2luZGV4KytdO1xuICAgICAgICAgICAgd2hpbGUgKGlzRGVjaW1hbERpZ2l0KHNvdXJjZS5jaGFyQ29kZUF0KGluZGV4KSkpIHtcbiAgICAgICAgICAgICAgICBudW1iZXIgKz0gc291cmNlW2luZGV4KytdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2ggPSBzb3VyY2VbaW5kZXhdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNoID09PSAnZScgfHwgY2ggPT09ICdFJykge1xuICAgICAgICAgICAgbnVtYmVyICs9IHNvdXJjZVtpbmRleCsrXTtcblxuICAgICAgICAgICAgY2ggPSBzb3VyY2VbaW5kZXhdO1xuICAgICAgICAgICAgaWYgKGNoID09PSAnKycgfHwgY2ggPT09ICctJykge1xuICAgICAgICAgICAgICAgIG51bWJlciArPSBzb3VyY2VbaW5kZXgrK107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNEZWNpbWFsRGlnaXQoc291cmNlLmNoYXJDb2RlQXQoaW5kZXgpKSkge1xuICAgICAgICAgICAgICAgIHdoaWxlIChpc0RlY2ltYWxEaWdpdChzb3VyY2UuY2hhckNvZGVBdChpbmRleCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIG51bWJlciArPSBzb3VyY2VbaW5kZXgrK107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvd0Vycm9yKHt9LCBNZXNzYWdlcy5VbmV4cGVjdGVkVG9rZW4sICdJTExFR0FMJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNJZGVudGlmaWVyU3RhcnQoc291cmNlLmNoYXJDb2RlQXQoaW5kZXgpKSkge1xuICAgICAgICAgICAgdGhyb3dFcnJvcih7fSwgTWVzc2FnZXMuVW5leHBlY3RlZFRva2VuLCAnSUxMRUdBTCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHR5cGU6IFRva2VuLk51bWVyaWNMaXRlcmFsLFxuICAgICAgICAgICAgdmFsdWU6IHBhcnNlRmxvYXQobnVtYmVyKSxcbiAgICAgICAgICAgIHJhbmdlOiBbc3RhcnQsIGluZGV4XVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIDcuOC40IFN0cmluZyBMaXRlcmFsc1xuXG4gICAgZnVuY3Rpb24gc2NhblN0cmluZ0xpdGVyYWwoKSB7XG4gICAgICAgIHZhciBzdHIgPSAnJywgcXVvdGUsIHN0YXJ0LCBjaCwgb2N0YWwgPSBmYWxzZTtcblxuICAgICAgICBxdW90ZSA9IHNvdXJjZVtpbmRleF07XG4gICAgICAgIGFzc2VydCgocXVvdGUgPT09ICdcXCcnIHx8IHF1b3RlID09PSAnXCInKSxcbiAgICAgICAgICAgICdTdHJpbmcgbGl0ZXJhbCBtdXN0IHN0YXJ0cyB3aXRoIGEgcXVvdGUnKTtcblxuICAgICAgICBzdGFydCA9IGluZGV4O1xuICAgICAgICArK2luZGV4O1xuXG4gICAgICAgIHdoaWxlIChpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgY2ggPSBzb3VyY2VbaW5kZXgrK107XG5cbiAgICAgICAgICAgIGlmIChjaCA9PT0gcXVvdGUpIHtcbiAgICAgICAgICAgICAgICBxdW90ZSA9ICcnO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjaCA9PT0gJ1xcXFwnKSB7XG4gICAgICAgICAgICAgICAgY2ggPSBzb3VyY2VbaW5kZXgrK107XG4gICAgICAgICAgICAgICAgaWYgKCFjaCB8fCAhaXNMaW5lVGVybWluYXRvcihjaC5jaGFyQ29kZUF0KDApKSkge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ24nOlxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXG4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3InOlxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXHInO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3QnOlxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXHQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2InOlxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXGInO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2YnOlxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXGYnO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3YnOlxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9ICdcXHgwQic7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyICs9IGNoO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICAnXFxyJyAmJiBzb3VyY2VbaW5kZXhdID09PSAnXFxuJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgKytpbmRleDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNMaW5lVGVybWluYXRvcihjaC5jaGFyQ29kZUF0KDApKSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdHIgKz0gY2g7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocXVvdGUgIT09ICcnKSB7XG4gICAgICAgICAgICB0aHJvd0Vycm9yKHt9LCBNZXNzYWdlcy5VbmV4cGVjdGVkVG9rZW4sICdJTExFR0FMJyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdHlwZTogVG9rZW4uU3RyaW5nTGl0ZXJhbCxcbiAgICAgICAgICAgIHZhbHVlOiBzdHIsXG4gICAgICAgICAgICBvY3RhbDogb2N0YWwsXG4gICAgICAgICAgICByYW5nZTogW3N0YXJ0LCBpbmRleF1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0lkZW50aWZpZXJOYW1lKHRva2VuKSB7XG4gICAgICAgIHJldHVybiB0b2tlbi50eXBlID09PSBUb2tlbi5JZGVudGlmaWVyIHx8XG4gICAgICAgICAgICB0b2tlbi50eXBlID09PSBUb2tlbi5LZXl3b3JkIHx8XG4gICAgICAgICAgICB0b2tlbi50eXBlID09PSBUb2tlbi5Cb29sZWFuTGl0ZXJhbCB8fFxuICAgICAgICAgICAgdG9rZW4udHlwZSA9PT0gVG9rZW4uTnVsbExpdGVyYWw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWR2YW5jZSgpIHtcbiAgICAgICAgdmFyIGNoO1xuXG4gICAgICAgIHNraXBXaGl0ZXNwYWNlKCk7XG5cbiAgICAgICAgaWYgKGluZGV4ID49IGxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiBUb2tlbi5FT0YsXG4gICAgICAgICAgICAgICAgcmFuZ2U6IFtpbmRleCwgaW5kZXhdXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY2ggPSBzb3VyY2UuY2hhckNvZGVBdChpbmRleCk7XG5cbiAgICAgICAgLy8gVmVyeSBjb21tb246ICggYW5kICkgYW5kIDtcbiAgICAgICAgaWYgKGNoID09PSA0MCB8fCBjaCA9PT0gNDEgfHwgY2ggPT09IDU4KSB7XG4gICAgICAgICAgICByZXR1cm4gc2NhblB1bmN0dWF0b3IoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFN0cmluZyBsaXRlcmFsIHN0YXJ0cyB3aXRoIHNpbmdsZSBxdW90ZSAoIzM5KSBvciBkb3VibGUgcXVvdGUgKCMzNCkuXG4gICAgICAgIGlmIChjaCA9PT0gMzkgfHwgY2ggPT09IDM0KSB7XG4gICAgICAgICAgICByZXR1cm4gc2NhblN0cmluZ0xpdGVyYWwoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc0lkZW50aWZpZXJTdGFydChjaCkpIHtcbiAgICAgICAgICAgIHJldHVybiBzY2FuSWRlbnRpZmllcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRG90ICguKSBjaGFyICM0NiBjYW4gYWxzbyBzdGFydCBhIGZsb2F0aW5nLXBvaW50IG51bWJlciwgaGVuY2UgdGhlIG5lZWRcbiAgICAgICAgLy8gdG8gY2hlY2sgdGhlIG5leHQgY2hhcmFjdGVyLlxuICAgICAgICBpZiAoY2ggPT09IDQ2KSB7XG4gICAgICAgICAgICBpZiAoaXNEZWNpbWFsRGlnaXQoc291cmNlLmNoYXJDb2RlQXQoaW5kZXggKyAxKSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2Nhbk51bWVyaWNMaXRlcmFsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc2NhblB1bmN0dWF0b3IoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc0RlY2ltYWxEaWdpdChjaCkpIHtcbiAgICAgICAgICAgIHJldHVybiBzY2FuTnVtZXJpY0xpdGVyYWwoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzY2FuUHVuY3R1YXRvcigpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxleCgpIHtcbiAgICAgICAgdmFyIHRva2VuO1xuXG4gICAgICAgIHRva2VuID0gbG9va2FoZWFkO1xuICAgICAgICBpbmRleCA9IHRva2VuLnJhbmdlWzFdO1xuXG4gICAgICAgIGxvb2thaGVhZCA9IGFkdmFuY2UoKTtcblxuICAgICAgICBpbmRleCA9IHRva2VuLnJhbmdlWzFdO1xuXG4gICAgICAgIHJldHVybiB0b2tlbjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwZWVrKCkge1xuICAgICAgICB2YXIgcG9zO1xuXG4gICAgICAgIHBvcyA9IGluZGV4O1xuICAgICAgICBsb29rYWhlYWQgPSBhZHZhbmNlKCk7XG4gICAgICAgIGluZGV4ID0gcG9zO1xuICAgIH1cblxuICAgIC8vIFRocm93IGFuIGV4Y2VwdGlvblxuXG4gICAgZnVuY3Rpb24gdGhyb3dFcnJvcih0b2tlbiwgbWVzc2FnZUZvcm1hdCkge1xuICAgICAgICB2YXIgZXJyb3IsXG4gICAgICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSxcbiAgICAgICAgICAgIG1zZyA9IG1lc3NhZ2VGb3JtYXQucmVwbGFjZShcbiAgICAgICAgICAgICAgICAvJShcXGQpL2csXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKHdob2xlLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBhc3NlcnQoaW5kZXggPCBhcmdzLmxlbmd0aCwgJ01lc3NhZ2UgcmVmZXJlbmNlIG11c3QgYmUgaW4gcmFuZ2UnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFyZ3NbaW5kZXhdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgZXJyb3IgPSBuZXcgRXJyb3IobXNnKTtcbiAgICAgICAgZXJyb3IuaW5kZXggPSBpbmRleDtcbiAgICAgICAgZXJyb3IuZGVzY3JpcHRpb24gPSBtc2c7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cblxuICAgIC8vIFRocm93IGFuIGV4Y2VwdGlvbiBiZWNhdXNlIG9mIHRoZSB0b2tlbi5cblxuICAgIGZ1bmN0aW9uIHRocm93VW5leHBlY3RlZCh0b2tlbikge1xuICAgICAgICB0aHJvd0Vycm9yKHRva2VuLCBNZXNzYWdlcy5VbmV4cGVjdGVkVG9rZW4sIHRva2VuLnZhbHVlKTtcbiAgICB9XG5cbiAgICAvLyBFeHBlY3QgdGhlIG5leHQgdG9rZW4gdG8gbWF0Y2ggdGhlIHNwZWNpZmllZCBwdW5jdHVhdG9yLlxuICAgIC8vIElmIG5vdCwgYW4gZXhjZXB0aW9uIHdpbGwgYmUgdGhyb3duLlxuXG4gICAgZnVuY3Rpb24gZXhwZWN0KHZhbHVlKSB7XG4gICAgICAgIHZhciB0b2tlbiA9IGxleCgpO1xuICAgICAgICBpZiAodG9rZW4udHlwZSAhPT0gVG9rZW4uUHVuY3R1YXRvciB8fCB0b2tlbi52YWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgIHRocm93VW5leHBlY3RlZCh0b2tlbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gdHJ1ZSBpZiB0aGUgbmV4dCB0b2tlbiBtYXRjaGVzIHRoZSBzcGVjaWZpZWQgcHVuY3R1YXRvci5cblxuICAgIGZ1bmN0aW9uIG1hdGNoKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBsb29rYWhlYWQudHlwZSA9PT0gVG9rZW4uUHVuY3R1YXRvciAmJiBsb29rYWhlYWQudmFsdWUgPT09IHZhbHVlO1xuICAgIH1cblxuICAgIC8vIFJldHVybiB0cnVlIGlmIHRoZSBuZXh0IHRva2VuIG1hdGNoZXMgdGhlIHNwZWNpZmllZCBrZXl3b3JkXG5cbiAgICBmdW5jdGlvbiBtYXRjaEtleXdvcmQoa2V5d29yZCkge1xuICAgICAgICByZXR1cm4gbG9va2FoZWFkLnR5cGUgPT09IFRva2VuLktleXdvcmQgJiYgbG9va2FoZWFkLnZhbHVlID09PSBrZXl3b3JkO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbnN1bWVTZW1pY29sb24oKSB7XG4gICAgICAgIC8vIENhdGNoIHRoZSB2ZXJ5IGNvbW1vbiBjYXNlIGZpcnN0OiBpbW1lZGlhdGVseSBhIHNlbWljb2xvbiAoY2hhciAjNTkpLlxuICAgICAgICBpZiAoc291cmNlLmNoYXJDb2RlQXQoaW5kZXgpID09PSA1OSkge1xuICAgICAgICAgICAgbGV4KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBza2lwV2hpdGVzcGFjZSgpO1xuXG4gICAgICAgIGlmIChtYXRjaCgnOycpKSB7XG4gICAgICAgICAgICBsZXgoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsb29rYWhlYWQudHlwZSAhPT0gVG9rZW4uRU9GICYmICFtYXRjaCgnfScpKSB7XG4gICAgICAgICAgICB0aHJvd1VuZXhwZWN0ZWQobG9va2FoZWFkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIDExLjEuNCBBcnJheSBJbml0aWFsaXNlclxuXG4gICAgZnVuY3Rpb24gcGFyc2VBcnJheUluaXRpYWxpc2VyKCkge1xuICAgICAgICB2YXIgZWxlbWVudHMgPSBbXTtcblxuICAgICAgICBleHBlY3QoJ1snKTtcblxuICAgICAgICB3aGlsZSAoIW1hdGNoKCddJykpIHtcbiAgICAgICAgICAgIGlmIChtYXRjaCgnLCcpKSB7XG4gICAgICAgICAgICAgICAgbGV4KCk7XG4gICAgICAgICAgICAgICAgZWxlbWVudHMucHVzaChudWxsKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudHMucHVzaChwYXJzZUV4cHJlc3Npb24oKSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIW1hdGNoKCddJykpIHtcbiAgICAgICAgICAgICAgICAgICAgZXhwZWN0KCcsJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZXhwZWN0KCddJyk7XG5cbiAgICAgICAgcmV0dXJuIGRlbGVnYXRlLmNyZWF0ZUFycmF5RXhwcmVzc2lvbihlbGVtZW50cyk7XG4gICAgfVxuXG4gICAgLy8gMTEuMS41IE9iamVjdCBJbml0aWFsaXNlclxuXG4gICAgZnVuY3Rpb24gcGFyc2VPYmplY3RQcm9wZXJ0eUtleSgpIHtcbiAgICAgICAgdmFyIHRva2VuO1xuXG4gICAgICAgIHNraXBXaGl0ZXNwYWNlKCk7XG4gICAgICAgIHRva2VuID0gbGV4KCk7XG5cbiAgICAgICAgLy8gTm90ZTogVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgb25seSBmcm9tIHBhcnNlT2JqZWN0UHJvcGVydHkoKSwgd2hlcmVcbiAgICAgICAgLy8gRU9GIGFuZCBQdW5jdHVhdG9yIHRva2VucyBhcmUgYWxyZWFkeSBmaWx0ZXJlZCBvdXQuXG4gICAgICAgIGlmICh0b2tlbi50eXBlID09PSBUb2tlbi5TdHJpbmdMaXRlcmFsIHx8IHRva2VuLnR5cGUgPT09IFRva2VuLk51bWVyaWNMaXRlcmFsKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVsZWdhdGUuY3JlYXRlTGl0ZXJhbCh0b2tlbik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGVsZWdhdGUuY3JlYXRlSWRlbnRpZmllcih0b2tlbi52YWx1ZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFyc2VPYmplY3RQcm9wZXJ0eSgpIHtcbiAgICAgICAgdmFyIHRva2VuLCBrZXk7XG5cbiAgICAgICAgdG9rZW4gPSBsb29rYWhlYWQ7XG4gICAgICAgIHNraXBXaGl0ZXNwYWNlKCk7XG5cbiAgICAgICAgaWYgKHRva2VuLnR5cGUgPT09IFRva2VuLkVPRiB8fCB0b2tlbi50eXBlID09PSBUb2tlbi5QdW5jdHVhdG9yKSB7XG4gICAgICAgICAgICB0aHJvd1VuZXhwZWN0ZWQodG9rZW4pO1xuICAgICAgICB9XG5cbiAgICAgICAga2V5ID0gcGFyc2VPYmplY3RQcm9wZXJ0eUtleSgpO1xuICAgICAgICBleHBlY3QoJzonKTtcbiAgICAgICAgcmV0dXJuIGRlbGVnYXRlLmNyZWF0ZVByb3BlcnR5KCdpbml0Jywga2V5LCBwYXJzZUV4cHJlc3Npb24oKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFyc2VPYmplY3RJbml0aWFsaXNlcigpIHtcbiAgICAgICAgdmFyIHByb3BlcnRpZXMgPSBbXTtcblxuICAgICAgICBleHBlY3QoJ3snKTtcblxuICAgICAgICB3aGlsZSAoIW1hdGNoKCd9JykpIHtcbiAgICAgICAgICAgIHByb3BlcnRpZXMucHVzaChwYXJzZU9iamVjdFByb3BlcnR5KCkpO1xuXG4gICAgICAgICAgICBpZiAoIW1hdGNoKCd9JykpIHtcbiAgICAgICAgICAgICAgICBleHBlY3QoJywnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGV4cGVjdCgnfScpO1xuXG4gICAgICAgIHJldHVybiBkZWxlZ2F0ZS5jcmVhdGVPYmplY3RFeHByZXNzaW9uKHByb3BlcnRpZXMpO1xuICAgIH1cblxuICAgIC8vIDExLjEuNiBUaGUgR3JvdXBpbmcgT3BlcmF0b3JcblxuICAgIGZ1bmN0aW9uIHBhcnNlR3JvdXBFeHByZXNzaW9uKCkge1xuICAgICAgICB2YXIgZXhwcjtcblxuICAgICAgICBleHBlY3QoJygnKTtcblxuICAgICAgICBleHByID0gcGFyc2VFeHByZXNzaW9uKCk7XG5cbiAgICAgICAgZXhwZWN0KCcpJyk7XG5cbiAgICAgICAgcmV0dXJuIGV4cHI7XG4gICAgfVxuXG5cbiAgICAvLyAxMS4xIFByaW1hcnkgRXhwcmVzc2lvbnNcblxuICAgIGZ1bmN0aW9uIHBhcnNlUHJpbWFyeUV4cHJlc3Npb24oKSB7XG4gICAgICAgIHZhciB0eXBlLCB0b2tlbiwgZXhwcjtcblxuICAgICAgICBpZiAobWF0Y2goJygnKSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlR3JvdXBFeHByZXNzaW9uKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0eXBlID0gbG9va2FoZWFkLnR5cGU7XG5cbiAgICAgICAgaWYgKHR5cGUgPT09IFRva2VuLklkZW50aWZpZXIpIHtcbiAgICAgICAgICAgIGV4cHIgPSBkZWxlZ2F0ZS5jcmVhdGVJZGVudGlmaWVyKGxleCgpLnZhbHVlKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBUb2tlbi5TdHJpbmdMaXRlcmFsIHx8IHR5cGUgPT09IFRva2VuLk51bWVyaWNMaXRlcmFsKSB7XG4gICAgICAgICAgICBleHByID0gZGVsZWdhdGUuY3JlYXRlTGl0ZXJhbChsZXgoKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gVG9rZW4uS2V5d29yZCkge1xuICAgICAgICAgICAgaWYgKG1hdGNoS2V5d29yZCgndGhpcycpKSB7XG4gICAgICAgICAgICAgICAgbGV4KCk7XG4gICAgICAgICAgICAgICAgZXhwciA9IGRlbGVnYXRlLmNyZWF0ZVRoaXNFeHByZXNzaW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gVG9rZW4uQm9vbGVhbkxpdGVyYWwpIHtcbiAgICAgICAgICAgIHRva2VuID0gbGV4KCk7XG4gICAgICAgICAgICB0b2tlbi52YWx1ZSA9ICh0b2tlbi52YWx1ZSA9PT0gJ3RydWUnKTtcbiAgICAgICAgICAgIGV4cHIgPSBkZWxlZ2F0ZS5jcmVhdGVMaXRlcmFsKHRva2VuKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBUb2tlbi5OdWxsTGl0ZXJhbCkge1xuICAgICAgICAgICAgdG9rZW4gPSBsZXgoKTtcbiAgICAgICAgICAgIHRva2VuLnZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgIGV4cHIgPSBkZWxlZ2F0ZS5jcmVhdGVMaXRlcmFsKHRva2VuKTtcbiAgICAgICAgfSBlbHNlIGlmIChtYXRjaCgnWycpKSB7XG4gICAgICAgICAgICBleHByID0gcGFyc2VBcnJheUluaXRpYWxpc2VyKCk7XG4gICAgICAgIH0gZWxzZSBpZiAobWF0Y2goJ3snKSkge1xuICAgICAgICAgICAgZXhwciA9IHBhcnNlT2JqZWN0SW5pdGlhbGlzZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChleHByKSB7XG4gICAgICAgICAgICByZXR1cm4gZXhwcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93VW5leHBlY3RlZChsZXgoKSk7XG4gICAgfVxuXG4gICAgLy8gMTEuMiBMZWZ0LUhhbmQtU2lkZSBFeHByZXNzaW9uc1xuXG4gICAgZnVuY3Rpb24gcGFyc2VBcmd1bWVudHMoKSB7XG4gICAgICAgIHZhciBhcmdzID0gW107XG5cbiAgICAgICAgZXhwZWN0KCcoJyk7XG5cbiAgICAgICAgaWYgKCFtYXRjaCgnKScpKSB7XG4gICAgICAgICAgICB3aGlsZSAoaW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2gocGFyc2VFeHByZXNzaW9uKCkpO1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaCgnKScpKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBleHBlY3QoJywnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGV4cGVjdCgnKScpO1xuXG4gICAgICAgIHJldHVybiBhcmdzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhcnNlTm9uQ29tcHV0ZWRQcm9wZXJ0eSgpIHtcbiAgICAgICAgdmFyIHRva2VuO1xuXG4gICAgICAgIHRva2VuID0gbGV4KCk7XG5cbiAgICAgICAgaWYgKCFpc0lkZW50aWZpZXJOYW1lKHRva2VuKSkge1xuICAgICAgICAgICAgdGhyb3dVbmV4cGVjdGVkKHRva2VuKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkZWxlZ2F0ZS5jcmVhdGVJZGVudGlmaWVyKHRva2VuLnZhbHVlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXJzZU5vbkNvbXB1dGVkTWVtYmVyKCkge1xuICAgICAgICBleHBlY3QoJy4nKTtcblxuICAgICAgICByZXR1cm4gcGFyc2VOb25Db21wdXRlZFByb3BlcnR5KCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFyc2VDb21wdXRlZE1lbWJlcigpIHtcbiAgICAgICAgdmFyIGV4cHI7XG5cbiAgICAgICAgZXhwZWN0KCdbJyk7XG5cbiAgICAgICAgZXhwciA9IHBhcnNlRXhwcmVzc2lvbigpO1xuXG4gICAgICAgIGV4cGVjdCgnXScpO1xuXG4gICAgICAgIHJldHVybiBleHByO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhcnNlTGVmdEhhbmRTaWRlRXhwcmVzc2lvbigpIHtcbiAgICAgICAgdmFyIGV4cHIsIGFyZ3MsIHByb3BlcnR5O1xuXG4gICAgICAgIGV4cHIgPSBwYXJzZVByaW1hcnlFeHByZXNzaW9uKCk7XG5cbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGlmIChtYXRjaCgnWycpKSB7XG4gICAgICAgICAgICAgICAgcHJvcGVydHkgPSBwYXJzZUNvbXB1dGVkTWVtYmVyKCk7XG4gICAgICAgICAgICAgICAgZXhwciA9IGRlbGVnYXRlLmNyZWF0ZU1lbWJlckV4cHJlc3Npb24oJ1snLCBleHByLCBwcm9wZXJ0eSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1hdGNoKCcuJykpIHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eSA9IHBhcnNlTm9uQ29tcHV0ZWRNZW1iZXIoKTtcbiAgICAgICAgICAgICAgICBleHByID0gZGVsZWdhdGUuY3JlYXRlTWVtYmVyRXhwcmVzc2lvbignLicsIGV4cHIsIHByb3BlcnR5KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobWF0Y2goJygnKSkge1xuICAgICAgICAgICAgICAgIGFyZ3MgPSBwYXJzZUFyZ3VtZW50cygpO1xuICAgICAgICAgICAgICAgIGV4cHIgPSBkZWxlZ2F0ZS5jcmVhdGVDYWxsRXhwcmVzc2lvbihleHByLCBhcmdzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZXhwcjtcbiAgICB9XG5cbiAgICAvLyAxMS4zIFBvc3RmaXggRXhwcmVzc2lvbnNcblxuICAgIHZhciBwYXJzZVBvc3RmaXhFeHByZXNzaW9uID0gcGFyc2VMZWZ0SGFuZFNpZGVFeHByZXNzaW9uO1xuXG4gICAgLy8gMTEuNCBVbmFyeSBPcGVyYXRvcnNcblxuICAgIGZ1bmN0aW9uIHBhcnNlVW5hcnlFeHByZXNzaW9uKCkge1xuICAgICAgICB2YXIgdG9rZW4sIGV4cHI7XG5cbiAgICAgICAgaWYgKGxvb2thaGVhZC50eXBlICE9PSBUb2tlbi5QdW5jdHVhdG9yICYmIGxvb2thaGVhZC50eXBlICE9PSBUb2tlbi5LZXl3b3JkKSB7XG4gICAgICAgICAgICBleHByID0gcGFyc2VQb3N0Zml4RXhwcmVzc2lvbigpO1xuICAgICAgICB9IGVsc2UgaWYgKG1hdGNoKCcrJykgfHwgbWF0Y2goJy0nKSB8fCBtYXRjaCgnIScpKSB7XG4gICAgICAgICAgICB0b2tlbiA9IGxleCgpO1xuICAgICAgICAgICAgZXhwciA9IHBhcnNlVW5hcnlFeHByZXNzaW9uKCk7XG4gICAgICAgICAgICBleHByID0gZGVsZWdhdGUuY3JlYXRlVW5hcnlFeHByZXNzaW9uKHRva2VuLnZhbHVlLCBleHByKTtcbiAgICAgICAgfSBlbHNlIGlmIChtYXRjaEtleXdvcmQoJ2RlbGV0ZScpIHx8IG1hdGNoS2V5d29yZCgndm9pZCcpIHx8IG1hdGNoS2V5d29yZCgndHlwZW9mJykpIHtcbiAgICAgICAgICAgIHRocm93RXJyb3Ioe30sIE1lc3NhZ2VzLlVuZXhwZWN0ZWRUb2tlbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBleHByID0gcGFyc2VQb3N0Zml4RXhwcmVzc2lvbigpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGV4cHI7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYmluYXJ5UHJlY2VkZW5jZSh0b2tlbikge1xuICAgICAgICB2YXIgcHJlYyA9IDA7XG5cbiAgICAgICAgaWYgKHRva2VuLnR5cGUgIT09IFRva2VuLlB1bmN0dWF0b3IgJiYgdG9rZW4udHlwZSAhPT0gVG9rZW4uS2V5d29yZCkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cblxuICAgICAgICBzd2l0Y2ggKHRva2VuLnZhbHVlKSB7XG4gICAgICAgIGNhc2UgJ3x8JzpcbiAgICAgICAgICAgIHByZWMgPSAxO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnJiYnOlxuICAgICAgICAgICAgcHJlYyA9IDI7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICc9PSc6XG4gICAgICAgIGNhc2UgJyE9JzpcbiAgICAgICAgY2FzZSAnPT09JzpcbiAgICAgICAgY2FzZSAnIT09JzpcbiAgICAgICAgICAgIHByZWMgPSA2O1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnPCc6XG4gICAgICAgIGNhc2UgJz4nOlxuICAgICAgICBjYXNlICc8PSc6XG4gICAgICAgIGNhc2UgJz49JzpcbiAgICAgICAgY2FzZSAnaW5zdGFuY2VvZic6XG4gICAgICAgICAgICBwcmVjID0gNztcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ2luJzpcbiAgICAgICAgICAgIHByZWMgPSA3O1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnKyc6XG4gICAgICAgIGNhc2UgJy0nOlxuICAgICAgICAgICAgcHJlYyA9IDk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICcqJzpcbiAgICAgICAgY2FzZSAnLyc6XG4gICAgICAgIGNhc2UgJyUnOlxuICAgICAgICAgICAgcHJlYyA9IDExO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHByZWM7XG4gICAgfVxuXG4gICAgLy8gMTEuNSBNdWx0aXBsaWNhdGl2ZSBPcGVyYXRvcnNcbiAgICAvLyAxMS42IEFkZGl0aXZlIE9wZXJhdG9yc1xuICAgIC8vIDExLjcgQml0d2lzZSBTaGlmdCBPcGVyYXRvcnNcbiAgICAvLyAxMS44IFJlbGF0aW9uYWwgT3BlcmF0b3JzXG4gICAgLy8gMTEuOSBFcXVhbGl0eSBPcGVyYXRvcnNcbiAgICAvLyAxMS4xMCBCaW5hcnkgQml0d2lzZSBPcGVyYXRvcnNcbiAgICAvLyAxMS4xMSBCaW5hcnkgTG9naWNhbCBPcGVyYXRvcnNcblxuICAgIGZ1bmN0aW9uIHBhcnNlQmluYXJ5RXhwcmVzc2lvbigpIHtcbiAgICAgICAgdmFyIGV4cHIsIHRva2VuLCBwcmVjLCBzdGFjaywgcmlnaHQsIG9wZXJhdG9yLCBsZWZ0LCBpO1xuXG4gICAgICAgIGxlZnQgPSBwYXJzZVVuYXJ5RXhwcmVzc2lvbigpO1xuXG4gICAgICAgIHRva2VuID0gbG9va2FoZWFkO1xuICAgICAgICBwcmVjID0gYmluYXJ5UHJlY2VkZW5jZSh0b2tlbik7XG4gICAgICAgIGlmIChwcmVjID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbGVmdDtcbiAgICAgICAgfVxuICAgICAgICB0b2tlbi5wcmVjID0gcHJlYztcbiAgICAgICAgbGV4KCk7XG5cbiAgICAgICAgcmlnaHQgPSBwYXJzZVVuYXJ5RXhwcmVzc2lvbigpO1xuXG4gICAgICAgIHN0YWNrID0gW2xlZnQsIHRva2VuLCByaWdodF07XG5cbiAgICAgICAgd2hpbGUgKChwcmVjID0gYmluYXJ5UHJlY2VkZW5jZShsb29rYWhlYWQpKSA+IDApIHtcblxuICAgICAgICAgICAgLy8gUmVkdWNlOiBtYWtlIGEgYmluYXJ5IGV4cHJlc3Npb24gZnJvbSB0aGUgdGhyZWUgdG9wbW9zdCBlbnRyaWVzLlxuICAgICAgICAgICAgd2hpbGUgKChzdGFjay5sZW5ndGggPiAyKSAmJiAocHJlYyA8PSBzdGFja1tzdGFjay5sZW5ndGggLSAyXS5wcmVjKSkge1xuICAgICAgICAgICAgICAgIHJpZ2h0ID0gc3RhY2sucG9wKCk7XG4gICAgICAgICAgICAgICAgb3BlcmF0b3IgPSBzdGFjay5wb3AoKS52YWx1ZTtcbiAgICAgICAgICAgICAgICBsZWZ0ID0gc3RhY2sucG9wKCk7XG4gICAgICAgICAgICAgICAgZXhwciA9IGRlbGVnYXRlLmNyZWF0ZUJpbmFyeUV4cHJlc3Npb24ob3BlcmF0b3IsIGxlZnQsIHJpZ2h0KTtcbiAgICAgICAgICAgICAgICBzdGFjay5wdXNoKGV4cHIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTaGlmdC5cbiAgICAgICAgICAgIHRva2VuID0gbGV4KCk7XG4gICAgICAgICAgICB0b2tlbi5wcmVjID0gcHJlYztcbiAgICAgICAgICAgIHN0YWNrLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgZXhwciA9IHBhcnNlVW5hcnlFeHByZXNzaW9uKCk7XG4gICAgICAgICAgICBzdGFjay5wdXNoKGV4cHIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmluYWwgcmVkdWNlIHRvIGNsZWFuLXVwIHRoZSBzdGFjay5cbiAgICAgICAgaSA9IHN0YWNrLmxlbmd0aCAtIDE7XG4gICAgICAgIGV4cHIgPSBzdGFja1tpXTtcbiAgICAgICAgd2hpbGUgKGkgPiAxKSB7XG4gICAgICAgICAgICBleHByID0gZGVsZWdhdGUuY3JlYXRlQmluYXJ5RXhwcmVzc2lvbihzdGFja1tpIC0gMV0udmFsdWUsIHN0YWNrW2kgLSAyXSwgZXhwcik7XG4gICAgICAgICAgICBpIC09IDI7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZXhwcjtcbiAgICB9XG5cblxuICAgIC8vIDExLjEyIENvbmRpdGlvbmFsIE9wZXJhdG9yXG5cbiAgICBmdW5jdGlvbiBwYXJzZUNvbmRpdGlvbmFsRXhwcmVzc2lvbigpIHtcbiAgICAgICAgdmFyIGV4cHIsIGNvbnNlcXVlbnQsIGFsdGVybmF0ZTtcblxuICAgICAgICBleHByID0gcGFyc2VCaW5hcnlFeHByZXNzaW9uKCk7XG5cbiAgICAgICAgaWYgKG1hdGNoKCc/JykpIHtcbiAgICAgICAgICAgIGxleCgpO1xuICAgICAgICAgICAgY29uc2VxdWVudCA9IHBhcnNlQ29uZGl0aW9uYWxFeHByZXNzaW9uKCk7XG4gICAgICAgICAgICBleHBlY3QoJzonKTtcbiAgICAgICAgICAgIGFsdGVybmF0ZSA9IHBhcnNlQ29uZGl0aW9uYWxFeHByZXNzaW9uKCk7XG5cbiAgICAgICAgICAgIGV4cHIgPSBkZWxlZ2F0ZS5jcmVhdGVDb25kaXRpb25hbEV4cHJlc3Npb24oZXhwciwgY29uc2VxdWVudCwgYWx0ZXJuYXRlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBleHByO1xuICAgIH1cblxuICAgIC8vIFNpbXBsaWZpY2F0aW9uIHNpbmNlIHdlIGRvIG5vdCBzdXBwb3J0IEFzc2lnbm1lbnRFeHByZXNzaW9uLlxuICAgIHZhciBwYXJzZUV4cHJlc3Npb24gPSBwYXJzZUNvbmRpdGlvbmFsRXhwcmVzc2lvbjtcblxuICAgIC8vIFBvbHltZXIgU3ludGF4IGV4dGVuc2lvbnNcblxuICAgIC8vIEZpbHRlciA6OlxuICAgIC8vICAgSWRlbnRpZmllclxuICAgIC8vICAgSWRlbnRpZmllciBcIihcIiBcIilcIlxuICAgIC8vICAgSWRlbnRpZmllciBcIihcIiBGaWx0ZXJBcmd1bWVudHMgXCIpXCJcblxuICAgIGZ1bmN0aW9uIHBhcnNlRmlsdGVyKCkge1xuICAgICAgICB2YXIgaWRlbnRpZmllciwgYXJncztcblxuICAgICAgICBpZGVudGlmaWVyID0gbGV4KCk7XG5cbiAgICAgICAgaWYgKGlkZW50aWZpZXIudHlwZSAhPT0gVG9rZW4uSWRlbnRpZmllcikge1xuICAgICAgICAgICAgdGhyb3dVbmV4cGVjdGVkKGlkZW50aWZpZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXJncyA9IG1hdGNoKCcoJykgPyBwYXJzZUFyZ3VtZW50cygpIDogW107XG5cbiAgICAgICAgcmV0dXJuIGRlbGVnYXRlLmNyZWF0ZUZpbHRlcihpZGVudGlmaWVyLnZhbHVlLCBhcmdzKTtcbiAgICB9XG5cbiAgICAvLyBGaWx0ZXJzIDo6XG4gICAgLy8gICBcInxcIiBGaWx0ZXJcbiAgICAvLyAgIEZpbHRlcnMgXCJ8XCIgRmlsdGVyXG5cbiAgICBmdW5jdGlvbiBwYXJzZUZpbHRlcnMoKSB7XG4gICAgICAgIHdoaWxlIChtYXRjaCgnfCcpKSB7XG4gICAgICAgICAgICBsZXgoKTtcbiAgICAgICAgICAgIHBhcnNlRmlsdGVyKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUb3BMZXZlbCA6OlxuICAgIC8vICAgTGFiZWxsZWRFeHByZXNzaW9uc1xuICAgIC8vICAgQXNFeHByZXNzaW9uXG4gICAgLy8gICBJbkV4cHJlc3Npb25cbiAgICAvLyAgIEZpbHRlckV4cHJlc3Npb25cblxuICAgIC8vIEFzRXhwcmVzc2lvbiA6OlxuICAgIC8vICAgRmlsdGVyRXhwcmVzc2lvbiBhcyBJZGVudGlmaWVyXG5cbiAgICAvLyBJbkV4cHJlc3Npb24gOjpcbiAgICAvLyAgIElkZW50aWZpZXIsIElkZW50aWZpZXIgaW4gRmlsdGVyRXhwcmVzc2lvblxuICAgIC8vICAgSWRlbnRpZmllciBpbiBGaWx0ZXJFeHByZXNzaW9uXG5cbiAgICAvLyBGaWx0ZXJFeHByZXNzaW9uIDo6XG4gICAgLy8gICBFeHByZXNzaW9uXG4gICAgLy8gICBFeHByZXNzaW9uIEZpbHRlcnNcblxuICAgIGZ1bmN0aW9uIHBhcnNlVG9wTGV2ZWwoKSB7XG4gICAgICAgIHNraXBXaGl0ZXNwYWNlKCk7XG4gICAgICAgIHBlZWsoKTtcblxuICAgICAgICB2YXIgZXhwciA9IHBhcnNlRXhwcmVzc2lvbigpO1xuICAgICAgICBpZiAoZXhwcikge1xuICAgICAgICAgICAgaWYgKGxvb2thaGVhZC52YWx1ZSA9PT0gJywnIHx8IGxvb2thaGVhZC52YWx1ZSA9PSAnaW4nICYmXG4gICAgICAgICAgICAgICAgICAgICAgIGV4cHIudHlwZSA9PT0gU3ludGF4LklkZW50aWZpZXIpIHtcbiAgICAgICAgICAgICAgICBwYXJzZUluRXhwcmVzc2lvbihleHByKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGFyc2VGaWx0ZXJzKCk7XG4gICAgICAgICAgICAgICAgaWYgKGxvb2thaGVhZC52YWx1ZSA9PT0gJ2FzJykge1xuICAgICAgICAgICAgICAgICAgICBwYXJzZUFzRXhwcmVzc2lvbihleHByKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkZWxlZ2F0ZS5jcmVhdGVUb3BMZXZlbChleHByKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobG9va2FoZWFkLnR5cGUgIT09IFRva2VuLkVPRikge1xuICAgICAgICAgICAgdGhyb3dVbmV4cGVjdGVkKGxvb2thaGVhZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXJzZUFzRXhwcmVzc2lvbihleHByKSB7XG4gICAgICAgIGxleCgpOyAgLy8gYXNcbiAgICAgICAgdmFyIGlkZW50aWZpZXIgPSBsZXgoKS52YWx1ZTtcbiAgICAgICAgZGVsZWdhdGUuY3JlYXRlQXNFeHByZXNzaW9uKGV4cHIsIGlkZW50aWZpZXIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhcnNlSW5FeHByZXNzaW9uKGlkZW50aWZpZXIpIHtcbiAgICAgICAgdmFyIGluZGV4TmFtZTtcbiAgICAgICAgaWYgKGxvb2thaGVhZC52YWx1ZSA9PT0gJywnKSB7XG4gICAgICAgICAgICBsZXgoKTtcbiAgICAgICAgICAgIGlmIChsb29rYWhlYWQudHlwZSAhPT0gVG9rZW4uSWRlbnRpZmllcilcbiAgICAgICAgICAgICAgICB0aHJvd1VuZXhwZWN0ZWQobG9va2FoZWFkKTtcbiAgICAgICAgICAgIGluZGV4TmFtZSA9IGxleCgpLnZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV4KCk7ICAvLyBpblxuICAgICAgICB2YXIgZXhwciA9IHBhcnNlRXhwcmVzc2lvbigpO1xuICAgICAgICBwYXJzZUZpbHRlcnMoKTtcbiAgICAgICAgZGVsZWdhdGUuY3JlYXRlSW5FeHByZXNzaW9uKGlkZW50aWZpZXIubmFtZSwgaW5kZXhOYW1lLCBleHByKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXJzZShjb2RlLCBpbkRlbGVnYXRlKSB7XG4gICAgICAgIGRlbGVnYXRlID0gaW5EZWxlZ2F0ZTtcbiAgICAgICAgc291cmNlID0gY29kZTtcbiAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICBsZW5ndGggPSBzb3VyY2UubGVuZ3RoO1xuICAgICAgICBsb29rYWhlYWQgPSBudWxsO1xuICAgICAgICBzdGF0ZSA9IHtcbiAgICAgICAgICAgIGxhYmVsU2V0OiB7fVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBwYXJzZVRvcExldmVsKCk7XG4gICAgfVxuXG4gICAgZ2xvYmFsLmVzcHJpbWEgPSB7XG4gICAgICAgIHBhcnNlOiBwYXJzZVxuICAgIH07XG59KSh0aGlzKTtcblxuLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdCBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbi8vIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXQgaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4vLyBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXQgaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbi8vIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4vLyBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0IGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuXG4oZnVuY3Rpb24gKGdsb2JhbCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgZnVuY3Rpb24gcHJlcGFyZUJpbmRpbmcoZXhwcmVzc2lvblRleHQsIG5hbWUsIG5vZGUsIGZpbHRlclJlZ2lzdHJ5KSB7XG4gICAgdmFyIGV4cHJlc3Npb247XG4gICAgdHJ5IHtcbiAgICAgIGV4cHJlc3Npb24gPSBnZXRFeHByZXNzaW9uKGV4cHJlc3Npb25UZXh0KTtcbiAgICAgIGlmIChleHByZXNzaW9uLnNjb3BlSWRlbnQgJiZcbiAgICAgICAgICAobm9kZS5ub2RlVHlwZSAhPT0gTm9kZS5FTEVNRU5UX05PREUgfHxcbiAgICAgICAgICAgbm9kZS50YWdOYW1lICE9PSAnVEVNUExBVEUnIHx8XG4gICAgICAgICAgIChuYW1lICE9PSAnYmluZCcgJiYgbmFtZSAhPT0gJ3JlcGVhdCcpKSkge1xuICAgICAgICB0aHJvdyBFcnJvcignYXMgYW5kIGluIGNhbiBvbmx5IGJlIHVzZWQgd2l0aGluIDx0ZW1wbGF0ZSBiaW5kL3JlcGVhdD4nKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChleCkge1xuICAgICAgY29uc29sZS5lcnJvcignSW52YWxpZCBleHByZXNzaW9uIHN5bnRheDogJyArIGV4cHJlc3Npb25UZXh0LCBleCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG1vZGVsLCBub2RlLCBvbmVUaW1lKSB7XG4gICAgICB2YXIgYmluZGluZyA9IGV4cHJlc3Npb24uZ2V0QmluZGluZyhtb2RlbCwgZmlsdGVyUmVnaXN0cnksIG9uZVRpbWUpO1xuICAgICAgaWYgKGV4cHJlc3Npb24uc2NvcGVJZGVudCAmJiBiaW5kaW5nKSB7XG4gICAgICAgIG5vZGUucG9seW1lckV4cHJlc3Npb25TY29wZUlkZW50XyA9IGV4cHJlc3Npb24uc2NvcGVJZGVudDtcbiAgICAgICAgaWYgKGV4cHJlc3Npb24uaW5kZXhJZGVudClcbiAgICAgICAgICBub2RlLnBvbHltZXJFeHByZXNzaW9uSW5kZXhJZGVudF8gPSBleHByZXNzaW9uLmluZGV4SWRlbnQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBiaW5kaW5nO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRPRE8ocmFmYWVsdyk6IEltcGxlbWVudCBzaW1wbGUgTFJVLlxuICB2YXIgZXhwcmVzc2lvblBhcnNlQ2FjaGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIGZ1bmN0aW9uIGdldEV4cHJlc3Npb24oZXhwcmVzc2lvblRleHQpIHtcbiAgICB2YXIgZXhwcmVzc2lvbiA9IGV4cHJlc3Npb25QYXJzZUNhY2hlW2V4cHJlc3Npb25UZXh0XTtcbiAgICBpZiAoIWV4cHJlc3Npb24pIHtcbiAgICAgIHZhciBkZWxlZ2F0ZSA9IG5ldyBBU1REZWxlZ2F0ZSgpO1xuICAgICAgZXNwcmltYS5wYXJzZShleHByZXNzaW9uVGV4dCwgZGVsZWdhdGUpO1xuICAgICAgZXhwcmVzc2lvbiA9IG5ldyBFeHByZXNzaW9uKGRlbGVnYXRlKTtcbiAgICAgIGV4cHJlc3Npb25QYXJzZUNhY2hlW2V4cHJlc3Npb25UZXh0XSA9IGV4cHJlc3Npb247XG4gICAgfVxuICAgIHJldHVybiBleHByZXNzaW9uO1xuICB9XG5cbiAgZnVuY3Rpb24gTGl0ZXJhbCh2YWx1ZSkge1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLnZhbHVlRm5fID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgTGl0ZXJhbC5wcm90b3R5cGUgPSB7XG4gICAgdmFsdWVGbjogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXRoaXMudmFsdWVGbl8pIHtcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy52YWx1ZTtcbiAgICAgICAgdGhpcy52YWx1ZUZuXyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy52YWx1ZUZuXztcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBJZGVudFBhdGgobmFtZSkge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5wYXRoID0gUGF0aC5nZXQobmFtZSk7XG4gIH1cblxuICBJZGVudFBhdGgucHJvdG90eXBlID0ge1xuICAgIHZhbHVlRm46IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCF0aGlzLnZhbHVlRm5fKSB7XG4gICAgICAgIHZhciBuYW1lID0gdGhpcy5uYW1lO1xuICAgICAgICB2YXIgcGF0aCA9IHRoaXMucGF0aDtcbiAgICAgICAgdGhpcy52YWx1ZUZuXyA9IGZ1bmN0aW9uKG1vZGVsLCBvYnNlcnZlcikge1xuICAgICAgICAgIGlmIChvYnNlcnZlcilcbiAgICAgICAgICAgIG9ic2VydmVyLmFkZFBhdGgobW9kZWwsIHBhdGgpO1xuXG4gICAgICAgICAgcmV0dXJuIHBhdGguZ2V0VmFsdWVGcm9tKG1vZGVsKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy52YWx1ZUZuXztcbiAgICB9LFxuXG4gICAgc2V0VmFsdWU6IGZ1bmN0aW9uKG1vZGVsLCBuZXdWYWx1ZSkge1xuICAgICAgaWYgKHRoaXMucGF0aC5sZW5ndGggPT0gMSlcbiAgICAgICAgbW9kZWwgPSBmaW5kU2NvcGUobW9kZWwsIHRoaXMucGF0aFswXSk7XG5cbiAgICAgIHJldHVybiB0aGlzLnBhdGguc2V0VmFsdWVGcm9tKG1vZGVsLCBuZXdWYWx1ZSk7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIE1lbWJlckV4cHJlc3Npb24ob2JqZWN0LCBwcm9wZXJ0eSwgYWNjZXNzb3IpIHtcbiAgICB0aGlzLmNvbXB1dGVkID0gYWNjZXNzb3IgPT0gJ1snO1xuXG4gICAgdGhpcy5keW5hbWljRGVwcyA9IHR5cGVvZiBvYmplY3QgPT0gJ2Z1bmN0aW9uJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICBvYmplY3QuZHluYW1pY0RlcHMgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgKHRoaXMuY29tcHV0ZWQgJiYgIShwcm9wZXJ0eSBpbnN0YW5jZW9mIExpdGVyYWwpKTtcblxuICAgIHRoaXMuc2ltcGxlUGF0aCA9XG4gICAgICAgICF0aGlzLmR5bmFtaWNEZXBzICYmXG4gICAgICAgIChwcm9wZXJ0eSBpbnN0YW5jZW9mIElkZW50UGF0aCB8fCBwcm9wZXJ0eSBpbnN0YW5jZW9mIExpdGVyYWwpICYmXG4gICAgICAgIChvYmplY3QgaW5zdGFuY2VvZiBNZW1iZXJFeHByZXNzaW9uIHx8IG9iamVjdCBpbnN0YW5jZW9mIElkZW50UGF0aCk7XG5cbiAgICB0aGlzLm9iamVjdCA9IHRoaXMuc2ltcGxlUGF0aCA/IG9iamVjdCA6IGdldEZuKG9iamVjdCk7XG4gICAgdGhpcy5wcm9wZXJ0eSA9ICF0aGlzLmNvbXB1dGVkIHx8IHRoaXMuc2ltcGxlUGF0aCA/XG4gICAgICAgIHByb3BlcnR5IDogZ2V0Rm4ocHJvcGVydHkpO1xuICB9XG5cbiAgTWVtYmVyRXhwcmVzc2lvbi5wcm90b3R5cGUgPSB7XG4gICAgZ2V0IGZ1bGxQYXRoKCkge1xuICAgICAgaWYgKCF0aGlzLmZ1bGxQYXRoXykge1xuXG4gICAgICAgIHZhciBwYXJ0cyA9IHRoaXMub2JqZWN0IGluc3RhbmNlb2YgTWVtYmVyRXhwcmVzc2lvbiA/XG4gICAgICAgICAgICB0aGlzLm9iamVjdC5mdWxsUGF0aC5zbGljZSgpIDogW3RoaXMub2JqZWN0Lm5hbWVdO1xuICAgICAgICBwYXJ0cy5wdXNoKHRoaXMucHJvcGVydHkgaW5zdGFuY2VvZiBJZGVudFBhdGggP1xuICAgICAgICAgICAgdGhpcy5wcm9wZXJ0eS5uYW1lIDogdGhpcy5wcm9wZXJ0eS52YWx1ZSk7XG4gICAgICAgIHRoaXMuZnVsbFBhdGhfID0gUGF0aC5nZXQocGFydHMpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5mdWxsUGF0aF87XG4gICAgfSxcblxuICAgIHZhbHVlRm46IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCF0aGlzLnZhbHVlRm5fKSB7XG4gICAgICAgIHZhciBvYmplY3QgPSB0aGlzLm9iamVjdDtcblxuICAgICAgICBpZiAodGhpcy5zaW1wbGVQYXRoKSB7XG4gICAgICAgICAgdmFyIHBhdGggPSB0aGlzLmZ1bGxQYXRoO1xuXG4gICAgICAgICAgdGhpcy52YWx1ZUZuXyA9IGZ1bmN0aW9uKG1vZGVsLCBvYnNlcnZlcikge1xuICAgICAgICAgICAgaWYgKG9ic2VydmVyKVxuICAgICAgICAgICAgICBvYnNlcnZlci5hZGRQYXRoKG1vZGVsLCBwYXRoKTtcblxuICAgICAgICAgICAgcmV0dXJuIHBhdGguZ2V0VmFsdWVGcm9tKG1vZGVsKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmNvbXB1dGVkKSB7XG4gICAgICAgICAgdmFyIHBhdGggPSBQYXRoLmdldCh0aGlzLnByb3BlcnR5Lm5hbWUpO1xuXG4gICAgICAgICAgdGhpcy52YWx1ZUZuXyA9IGZ1bmN0aW9uKG1vZGVsLCBvYnNlcnZlciwgZmlsdGVyUmVnaXN0cnkpIHtcbiAgICAgICAgICAgIHZhciBjb250ZXh0ID0gb2JqZWN0KG1vZGVsLCBvYnNlcnZlciwgZmlsdGVyUmVnaXN0cnkpO1xuXG4gICAgICAgICAgICBpZiAob2JzZXJ2ZXIpXG4gICAgICAgICAgICAgIG9ic2VydmVyLmFkZFBhdGgoY29udGV4dCwgcGF0aCk7XG5cbiAgICAgICAgICAgIHJldHVybiBwYXRoLmdldFZhbHVlRnJvbShjb250ZXh0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gQ29tcHV0ZWQgcHJvcGVydHkuXG4gICAgICAgICAgdmFyIHByb3BlcnR5ID0gdGhpcy5wcm9wZXJ0eTtcblxuICAgICAgICAgIHRoaXMudmFsdWVGbl8gPSBmdW5jdGlvbihtb2RlbCwgb2JzZXJ2ZXIsIGZpbHRlclJlZ2lzdHJ5KSB7XG4gICAgICAgICAgICB2YXIgY29udGV4dCA9IG9iamVjdChtb2RlbCwgb2JzZXJ2ZXIsIGZpbHRlclJlZ2lzdHJ5KTtcbiAgICAgICAgICAgIHZhciBwcm9wTmFtZSA9IHByb3BlcnR5KG1vZGVsLCBvYnNlcnZlciwgZmlsdGVyUmVnaXN0cnkpO1xuICAgICAgICAgICAgaWYgKG9ic2VydmVyKVxuICAgICAgICAgICAgICBvYnNlcnZlci5hZGRQYXRoKGNvbnRleHQsIFtwcm9wTmFtZV0pO1xuXG4gICAgICAgICAgICByZXR1cm4gY29udGV4dCA/IGNvbnRleHRbcHJvcE5hbWVdIDogdW5kZWZpbmVkO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnZhbHVlRm5fO1xuICAgIH0sXG5cbiAgICBzZXRWYWx1ZTogZnVuY3Rpb24obW9kZWwsIG5ld1ZhbHVlKSB7XG4gICAgICBpZiAodGhpcy5zaW1wbGVQYXRoKSB7XG4gICAgICAgIHRoaXMuZnVsbFBhdGguc2V0VmFsdWVGcm9tKG1vZGVsLCBuZXdWYWx1ZSk7XG4gICAgICAgIHJldHVybiBuZXdWYWx1ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIG9iamVjdCA9IHRoaXMub2JqZWN0KG1vZGVsKTtcbiAgICAgIHZhciBwcm9wTmFtZSA9IHRoaXMucHJvcGVydHkgaW5zdGFuY2VvZiBJZGVudFBhdGggPyB0aGlzLnByb3BlcnR5Lm5hbWUgOlxuICAgICAgICAgIHRoaXMucHJvcGVydHkobW9kZWwpO1xuICAgICAgcmV0dXJuIG9iamVjdFtwcm9wTmFtZV0gPSBuZXdWYWx1ZTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gRmlsdGVyKG5hbWUsIGFyZ3MpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMuYXJncyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5hcmdzW2ldID0gZ2V0Rm4oYXJnc1tpXSk7XG4gICAgfVxuICB9XG5cbiAgRmlsdGVyLnByb3RvdHlwZSA9IHtcbiAgICB0cmFuc2Zvcm06IGZ1bmN0aW9uKG1vZGVsLCBvYnNlcnZlciwgZmlsdGVyUmVnaXN0cnksIHRvTW9kZWxEaXJlY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsQXJncykge1xuICAgICAgdmFyIGNvbnRleHQgPSBtb2RlbDtcbiAgICAgIHZhciBmbiA9IGNvbnRleHRbdGhpcy5uYW1lXTtcblxuICAgICAgaWYgKCFmbikge1xuICAgICAgICBmbiA9IGZpbHRlclJlZ2lzdHJ5W3RoaXMubmFtZV07XG4gICAgICAgIGlmICghZm4pIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdDYW5ub3QgZmluZCBmdW5jdGlvbiBvciBmaWx0ZXI6ICcgKyB0aGlzLm5hbWUpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBJZiB0b01vZGVsRGlyZWN0aW9uIGlzIGZhbHNleSwgdGhlbiB0aGUgXCJub3JtYWxcIiAoZG9tLWJvdW5kKSBkaXJlY3Rpb25cbiAgICAgIC8vIGlzIHVzZWQuIE90aGVyd2lzZSwgaXQgbG9va3MgZm9yIGEgJ3RvTW9kZWwnIHByb3BlcnR5IGZ1bmN0aW9uIG9uIHRoZVxuICAgICAgLy8gb2JqZWN0LlxuICAgICAgaWYgKHRvTW9kZWxEaXJlY3Rpb24pIHtcbiAgICAgICAgZm4gPSBmbi50b01vZGVsO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZm4udG9ET00gPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBmbiA9IGZuLnRvRE9NO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGZuICE9ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignQ2Fubm90IGZpbmQgZnVuY3Rpb24gb3IgZmlsdGVyOiAnICsgdGhpcy5uYW1lKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgYXJncyA9IGluaXRpYWxBcmdzIHx8IFtdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYXJncy5wdXNoKGdldEZuKHRoaXMuYXJnc1tpXSkobW9kZWwsIG9ic2VydmVyLCBmaWx0ZXJSZWdpc3RyeSkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZm4uYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIG5vdEltcGxlbWVudGVkKCkgeyB0aHJvdyBFcnJvcignTm90IEltcGxlbWVudGVkJyk7IH1cblxuICB2YXIgdW5hcnlPcGVyYXRvcnMgPSB7XG4gICAgJysnOiBmdW5jdGlvbih2KSB7IHJldHVybiArdjsgfSxcbiAgICAnLSc6IGZ1bmN0aW9uKHYpIHsgcmV0dXJuIC12OyB9LFxuICAgICchJzogZnVuY3Rpb24odikgeyByZXR1cm4gIXY7IH1cbiAgfTtcblxuICB2YXIgYmluYXJ5T3BlcmF0b3JzID0ge1xuICAgICcrJzogZnVuY3Rpb24obCwgcikgeyByZXR1cm4gbCtyOyB9LFxuICAgICctJzogZnVuY3Rpb24obCwgcikgeyByZXR1cm4gbC1yOyB9LFxuICAgICcqJzogZnVuY3Rpb24obCwgcikgeyByZXR1cm4gbCpyOyB9LFxuICAgICcvJzogZnVuY3Rpb24obCwgcikgeyByZXR1cm4gbC9yOyB9LFxuICAgICclJzogZnVuY3Rpb24obCwgcikgeyByZXR1cm4gbCVyOyB9LFxuICAgICc8JzogZnVuY3Rpb24obCwgcikgeyByZXR1cm4gbDxyOyB9LFxuICAgICc+JzogZnVuY3Rpb24obCwgcikgeyByZXR1cm4gbD5yOyB9LFxuICAgICc8PSc6IGZ1bmN0aW9uKGwsIHIpIHsgcmV0dXJuIGw8PXI7IH0sXG4gICAgJz49JzogZnVuY3Rpb24obCwgcikgeyByZXR1cm4gbD49cjsgfSxcbiAgICAnPT0nOiBmdW5jdGlvbihsLCByKSB7IHJldHVybiBsPT1yOyB9LFxuICAgICchPSc6IGZ1bmN0aW9uKGwsIHIpIHsgcmV0dXJuIGwhPXI7IH0sXG4gICAgJz09PSc6IGZ1bmN0aW9uKGwsIHIpIHsgcmV0dXJuIGw9PT1yOyB9LFxuICAgICchPT0nOiBmdW5jdGlvbihsLCByKSB7IHJldHVybiBsIT09cjsgfSxcbiAgICAnJiYnOiBmdW5jdGlvbihsLCByKSB7IHJldHVybiBsJiZyOyB9LFxuICAgICd8fCc6IGZ1bmN0aW9uKGwsIHIpIHsgcmV0dXJuIGx8fHI7IH0sXG4gIH07XG5cbiAgZnVuY3Rpb24gZ2V0Rm4oYXJnKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBhcmcgPT0gJ2Z1bmN0aW9uJyA/IGFyZyA6IGFyZy52YWx1ZUZuKCk7XG4gIH1cblxuICBmdW5jdGlvbiBBU1REZWxlZ2F0ZSgpIHtcbiAgICB0aGlzLmV4cHJlc3Npb24gPSBudWxsO1xuICAgIHRoaXMuZmlsdGVycyA9IFtdO1xuICAgIHRoaXMuZGVwcyA9IHt9O1xuICAgIHRoaXMuY3VycmVudFBhdGggPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5zY29wZUlkZW50ID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuaW5kZXhJZGVudCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmR5bmFtaWNEZXBzID0gZmFsc2U7XG4gIH1cblxuICBBU1REZWxlZ2F0ZS5wcm90b3R5cGUgPSB7XG4gICAgY3JlYXRlVW5hcnlFeHByZXNzaW9uOiBmdW5jdGlvbihvcCwgYXJndW1lbnQpIHtcbiAgICAgIGlmICghdW5hcnlPcGVyYXRvcnNbb3BdKVxuICAgICAgICB0aHJvdyBFcnJvcignRGlzYWxsb3dlZCBvcGVyYXRvcjogJyArIG9wKTtcblxuICAgICAgYXJndW1lbnQgPSBnZXRGbihhcmd1bWVudCk7XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbihtb2RlbCwgb2JzZXJ2ZXIsIGZpbHRlclJlZ2lzdHJ5KSB7XG4gICAgICAgIHJldHVybiB1bmFyeU9wZXJhdG9yc1tvcF0oYXJndW1lbnQobW9kZWwsIG9ic2VydmVyLCBmaWx0ZXJSZWdpc3RyeSkpO1xuICAgICAgfTtcbiAgICB9LFxuXG4gICAgY3JlYXRlQmluYXJ5RXhwcmVzc2lvbjogZnVuY3Rpb24ob3AsIGxlZnQsIHJpZ2h0KSB7XG4gICAgICBpZiAoIWJpbmFyeU9wZXJhdG9yc1tvcF0pXG4gICAgICAgIHRocm93IEVycm9yKCdEaXNhbGxvd2VkIG9wZXJhdG9yOiAnICsgb3ApO1xuXG4gICAgICBsZWZ0ID0gZ2V0Rm4obGVmdCk7XG4gICAgICByaWdodCA9IGdldEZuKHJpZ2h0KTtcblxuICAgICAgc3dpdGNoIChvcCkge1xuICAgICAgICBjYXNlICd8fCc6XG4gICAgICAgICAgdGhpcy5keW5hbWljRGVwcyA9IHRydWU7XG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1vZGVsLCBvYnNlcnZlciwgZmlsdGVyUmVnaXN0cnkpIHtcbiAgICAgICAgICAgIHJldHVybiBsZWZ0KG1vZGVsLCBvYnNlcnZlciwgZmlsdGVyUmVnaXN0cnkpIHx8XG4gICAgICAgICAgICAgICAgcmlnaHQobW9kZWwsIG9ic2VydmVyLCBmaWx0ZXJSZWdpc3RyeSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgY2FzZSAnJiYnOlxuICAgICAgICAgIHRoaXMuZHluYW1pY0RlcHMgPSB0cnVlO1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbihtb2RlbCwgb2JzZXJ2ZXIsIGZpbHRlclJlZ2lzdHJ5KSB7XG4gICAgICAgICAgICByZXR1cm4gbGVmdChtb2RlbCwgb2JzZXJ2ZXIsIGZpbHRlclJlZ2lzdHJ5KSAmJlxuICAgICAgICAgICAgICAgIHJpZ2h0KG1vZGVsLCBvYnNlcnZlciwgZmlsdGVyUmVnaXN0cnkpO1xuICAgICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbihtb2RlbCwgb2JzZXJ2ZXIsIGZpbHRlclJlZ2lzdHJ5KSB7XG4gICAgICAgIHJldHVybiBiaW5hcnlPcGVyYXRvcnNbb3BdKGxlZnQobW9kZWwsIG9ic2VydmVyLCBmaWx0ZXJSZWdpc3RyeSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJpZ2h0KG1vZGVsLCBvYnNlcnZlciwgZmlsdGVyUmVnaXN0cnkpKTtcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGNyZWF0ZUNvbmRpdGlvbmFsRXhwcmVzc2lvbjogZnVuY3Rpb24odGVzdCwgY29uc2VxdWVudCwgYWx0ZXJuYXRlKSB7XG4gICAgICB0ZXN0ID0gZ2V0Rm4odGVzdCk7XG4gICAgICBjb25zZXF1ZW50ID0gZ2V0Rm4oY29uc2VxdWVudCk7XG4gICAgICBhbHRlcm5hdGUgPSBnZXRGbihhbHRlcm5hdGUpO1xuXG4gICAgICB0aGlzLmR5bmFtaWNEZXBzID0gdHJ1ZTtcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1vZGVsLCBvYnNlcnZlciwgZmlsdGVyUmVnaXN0cnkpIHtcbiAgICAgICAgcmV0dXJuIHRlc3QobW9kZWwsIG9ic2VydmVyLCBmaWx0ZXJSZWdpc3RyeSkgP1xuICAgICAgICAgICAgY29uc2VxdWVudChtb2RlbCwgb2JzZXJ2ZXIsIGZpbHRlclJlZ2lzdHJ5KSA6XG4gICAgICAgICAgICBhbHRlcm5hdGUobW9kZWwsIG9ic2VydmVyLCBmaWx0ZXJSZWdpc3RyeSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNyZWF0ZUlkZW50aWZpZXI6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHZhciBpZGVudCA9IG5ldyBJZGVudFBhdGgobmFtZSk7XG4gICAgICBpZGVudC50eXBlID0gJ0lkZW50aWZpZXInO1xuICAgICAgcmV0dXJuIGlkZW50O1xuICAgIH0sXG5cbiAgICBjcmVhdGVNZW1iZXJFeHByZXNzaW9uOiBmdW5jdGlvbihhY2Nlc3Nvciwgb2JqZWN0LCBwcm9wZXJ0eSkge1xuICAgICAgdmFyIGV4ID0gbmV3IE1lbWJlckV4cHJlc3Npb24ob2JqZWN0LCBwcm9wZXJ0eSwgYWNjZXNzb3IpO1xuICAgICAgaWYgKGV4LmR5bmFtaWNEZXBzKVxuICAgICAgICB0aGlzLmR5bmFtaWNEZXBzID0gdHJ1ZTtcbiAgICAgIHJldHVybiBleDtcbiAgICB9LFxuXG4gICAgY3JlYXRlQ2FsbEV4cHJlc3Npb246IGZ1bmN0aW9uKGV4cHJlc3Npb24sIGFyZ3MpIHtcbiAgICAgIGlmICghKGV4cHJlc3Npb24gaW5zdGFuY2VvZiBJZGVudFBhdGgpKVxuICAgICAgICB0aHJvdyBFcnJvcignT25seSBpZGVudGlmaWVyIGZ1bmN0aW9uIGludm9jYXRpb25zIGFyZSBhbGxvd2VkJyk7XG5cbiAgICAgIHZhciBmaWx0ZXIgPSBuZXcgRmlsdGVyKGV4cHJlc3Npb24ubmFtZSwgYXJncyk7XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbihtb2RlbCwgb2JzZXJ2ZXIsIGZpbHRlclJlZ2lzdHJ5KSB7XG4gICAgICAgIHJldHVybiBmaWx0ZXIudHJhbnNmb3JtKG1vZGVsLCBvYnNlcnZlciwgZmlsdGVyUmVnaXN0cnksIGZhbHNlKTtcbiAgICAgIH07XG4gICAgfSxcblxuICAgIGNyZWF0ZUxpdGVyYWw6IGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICByZXR1cm4gbmV3IExpdGVyYWwodG9rZW4udmFsdWUpO1xuICAgIH0sXG5cbiAgICBjcmVhdGVBcnJheUV4cHJlc3Npb246IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKVxuICAgICAgICBlbGVtZW50c1tpXSA9IGdldEZuKGVsZW1lbnRzW2ldKTtcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1vZGVsLCBvYnNlcnZlciwgZmlsdGVyUmVnaXN0cnkpIHtcbiAgICAgICAgdmFyIGFyciA9IFtdXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspXG4gICAgICAgICAgYXJyLnB1c2goZWxlbWVudHNbaV0obW9kZWwsIG9ic2VydmVyLCBmaWx0ZXJSZWdpc3RyeSkpO1xuICAgICAgICByZXR1cm4gYXJyO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBjcmVhdGVQcm9wZXJ0eTogZnVuY3Rpb24oa2luZCwga2V5LCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAga2V5OiBrZXkgaW5zdGFuY2VvZiBJZGVudFBhdGggPyBrZXkubmFtZSA6IGtleS52YWx1ZSxcbiAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBjcmVhdGVPYmplY3RFeHByZXNzaW9uOiBmdW5jdGlvbihwcm9wZXJ0aWVzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BlcnRpZXMubGVuZ3RoOyBpKyspXG4gICAgICAgIHByb3BlcnRpZXNbaV0udmFsdWUgPSBnZXRGbihwcm9wZXJ0aWVzW2ldLnZhbHVlKTtcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKG1vZGVsLCBvYnNlcnZlciwgZmlsdGVyUmVnaXN0cnkpIHtcbiAgICAgICAgdmFyIG9iaiA9IHt9O1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BlcnRpZXMubGVuZ3RoOyBpKyspXG4gICAgICAgICAgb2JqW3Byb3BlcnRpZXNbaV0ua2V5XSA9XG4gICAgICAgICAgICAgIHByb3BlcnRpZXNbaV0udmFsdWUobW9kZWwsIG9ic2VydmVyLCBmaWx0ZXJSZWdpc3RyeSk7XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNyZWF0ZUZpbHRlcjogZnVuY3Rpb24obmFtZSwgYXJncykge1xuICAgICAgdGhpcy5maWx0ZXJzLnB1c2gobmV3IEZpbHRlcihuYW1lLCBhcmdzKSk7XG4gICAgfSxcblxuICAgIGNyZWF0ZUFzRXhwcmVzc2lvbjogZnVuY3Rpb24oZXhwcmVzc2lvbiwgc2NvcGVJZGVudCkge1xuICAgICAgdGhpcy5leHByZXNzaW9uID0gZXhwcmVzc2lvbjtcbiAgICAgIHRoaXMuc2NvcGVJZGVudCA9IHNjb3BlSWRlbnQ7XG4gICAgfSxcblxuICAgIGNyZWF0ZUluRXhwcmVzc2lvbjogZnVuY3Rpb24oc2NvcGVJZGVudCwgaW5kZXhJZGVudCwgZXhwcmVzc2lvbikge1xuICAgICAgdGhpcy5leHByZXNzaW9uID0gZXhwcmVzc2lvbjtcbiAgICAgIHRoaXMuc2NvcGVJZGVudCA9IHNjb3BlSWRlbnQ7XG4gICAgICB0aGlzLmluZGV4SWRlbnQgPSBpbmRleElkZW50O1xuICAgIH0sXG5cbiAgICBjcmVhdGVUb3BMZXZlbDogZnVuY3Rpb24oZXhwcmVzc2lvbikge1xuICAgICAgdGhpcy5leHByZXNzaW9uID0gZXhwcmVzc2lvbjtcbiAgICB9LFxuXG4gICAgY3JlYXRlVGhpc0V4cHJlc3Npb246IG5vdEltcGxlbWVudGVkXG4gIH1cblxuICBmdW5jdGlvbiBDb25zdGFudE9ic2VydmFibGUodmFsdWUpIHtcbiAgICB0aGlzLnZhbHVlXyA9IHZhbHVlO1xuICB9XG5cbiAgQ29uc3RhbnRPYnNlcnZhYmxlLnByb3RvdHlwZSA9IHtcbiAgICBvcGVuOiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMudmFsdWVfOyB9LFxuICAgIGRpc2NhcmRDaGFuZ2VzOiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMudmFsdWVfOyB9LFxuICAgIGRlbGl2ZXI6IGZ1bmN0aW9uKCkge30sXG4gICAgY2xvc2U6IGZ1bmN0aW9uKCkge30sXG4gIH1cblxuICBmdW5jdGlvbiBFeHByZXNzaW9uKGRlbGVnYXRlKSB7XG4gICAgdGhpcy5zY29wZUlkZW50ID0gZGVsZWdhdGUuc2NvcGVJZGVudDtcbiAgICB0aGlzLmluZGV4SWRlbnQgPSBkZWxlZ2F0ZS5pbmRleElkZW50O1xuXG4gICAgaWYgKCFkZWxlZ2F0ZS5leHByZXNzaW9uKVxuICAgICAgdGhyb3cgRXJyb3IoJ05vIGV4cHJlc3Npb24gZm91bmQuJyk7XG5cbiAgICB0aGlzLmV4cHJlc3Npb24gPSBkZWxlZ2F0ZS5leHByZXNzaW9uO1xuICAgIGdldEZuKHRoaXMuZXhwcmVzc2lvbik7IC8vIGZvcmNlcyBlbnVtZXJhdGlvbiBvZiBwYXRoIGRlcGVuZGVuY2llc1xuXG4gICAgdGhpcy5maWx0ZXJzID0gZGVsZWdhdGUuZmlsdGVycztcbiAgICB0aGlzLmR5bmFtaWNEZXBzID0gZGVsZWdhdGUuZHluYW1pY0RlcHM7XG4gIH1cblxuICBFeHByZXNzaW9uLnByb3RvdHlwZSA9IHtcbiAgICBnZXRCaW5kaW5nOiBmdW5jdGlvbihtb2RlbCwgZmlsdGVyUmVnaXN0cnksIG9uZVRpbWUpIHtcbiAgICAgIGlmIChvbmVUaW1lKVxuICAgICAgICByZXR1cm4gdGhpcy5nZXRWYWx1ZShtb2RlbCwgdW5kZWZpbmVkLCBmaWx0ZXJSZWdpc3RyeSk7XG5cbiAgICAgIHZhciBvYnNlcnZlciA9IG5ldyBDb21wb3VuZE9ic2VydmVyKCk7XG4gICAgICAvLyBjYXB0dXJlcyBkZXBzLlxuICAgICAgdmFyIGZpcnN0VmFsdWUgPSB0aGlzLmdldFZhbHVlKG1vZGVsLCBvYnNlcnZlciwgZmlsdGVyUmVnaXN0cnkpO1xuICAgICAgdmFyIGZpcnN0VGltZSA9IHRydWU7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIGZ1bmN0aW9uIHZhbHVlRm4oKSB7XG4gICAgICAgIC8vIGRlcHMgY2Fubm90IGhhdmUgY2hhbmdlZCBvbiBmaXJzdCB2YWx1ZSByZXRyaWV2YWwuXG4gICAgICAgIGlmIChmaXJzdFRpbWUpIHtcbiAgICAgICAgICBmaXJzdFRpbWUgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gZmlyc3RWYWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZWxmLmR5bmFtaWNEZXBzKVxuICAgICAgICAgIG9ic2VydmVyLnN0YXJ0UmVzZXQoKTtcblxuICAgICAgICB2YXIgdmFsdWUgPSBzZWxmLmdldFZhbHVlKG1vZGVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZHluYW1pY0RlcHMgPyBvYnNlcnZlciA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJSZWdpc3RyeSk7XG4gICAgICAgIGlmIChzZWxmLmR5bmFtaWNEZXBzKVxuICAgICAgICAgIG9ic2VydmVyLmZpbmlzaFJlc2V0KCk7XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzZXRWYWx1ZUZuKG5ld1ZhbHVlKSB7XG4gICAgICAgIHNlbGYuc2V0VmFsdWUobW9kZWwsIG5ld1ZhbHVlLCBmaWx0ZXJSZWdpc3RyeSk7XG4gICAgICAgIHJldHVybiBuZXdWYWx1ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBPYnNlcnZlclRyYW5zZm9ybShvYnNlcnZlciwgdmFsdWVGbiwgc2V0VmFsdWVGbiwgdHJ1ZSk7XG4gICAgfSxcblxuICAgIGdldFZhbHVlOiBmdW5jdGlvbihtb2RlbCwgb2JzZXJ2ZXIsIGZpbHRlclJlZ2lzdHJ5KSB7XG4gICAgICB2YXIgdmFsdWUgPSBnZXRGbih0aGlzLmV4cHJlc3Npb24pKG1vZGVsLCBvYnNlcnZlciwgZmlsdGVyUmVnaXN0cnkpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmZpbHRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFsdWUgPSB0aGlzLmZpbHRlcnNbaV0udHJhbnNmb3JtKG1vZGVsLCBvYnNlcnZlciwgZmlsdGVyUmVnaXN0cnksXG4gICAgICAgICAgICBmYWxzZSwgW3ZhbHVlXSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuXG4gICAgc2V0VmFsdWU6IGZ1bmN0aW9uKG1vZGVsLCBuZXdWYWx1ZSwgZmlsdGVyUmVnaXN0cnkpIHtcbiAgICAgIHZhciBjb3VudCA9IHRoaXMuZmlsdGVycyA/IHRoaXMuZmlsdGVycy5sZW5ndGggOiAwO1xuICAgICAgd2hpbGUgKGNvdW50LS0gPiAwKSB7XG4gICAgICAgIG5ld1ZhbHVlID0gdGhpcy5maWx0ZXJzW2NvdW50XS50cmFuc2Zvcm0obW9kZWwsIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGZpbHRlclJlZ2lzdHJ5LCB0cnVlLCBbbmV3VmFsdWVdKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuZXhwcmVzc2lvbi5zZXRWYWx1ZSlcbiAgICAgICAgcmV0dXJuIHRoaXMuZXhwcmVzc2lvbi5zZXRWYWx1ZShtb2RlbCwgbmV3VmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIHN0eWxlIHByb3BlcnR5IG5hbWUgdG8gYSBjc3MgcHJvcGVydHkgbmFtZS4gRm9yIGV4YW1wbGU6XG4gICAqIFwiV2Via2l0VXNlclNlbGVjdFwiIHRvIFwiLXdlYmtpdC11c2VyLXNlbGVjdFwiXG4gICAqL1xuICBmdW5jdGlvbiBjb252ZXJ0U3R5bGVQcm9wZXJ0eU5hbWUobmFtZSkge1xuICAgIHJldHVybiBTdHJpbmcobmFtZSkucmVwbGFjZSgvW0EtWl0vZywgZnVuY3Rpb24oYykge1xuICAgICAgcmV0dXJuICctJyArIGMudG9Mb3dlckNhc2UoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciBwYXJlbnRTY29wZU5hbWUgPSAnQCcgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKTtcblxuICAvLyBTaW5nbGUgaWRlbnQgcGF0aHMgbXVzdCBiaW5kIGRpcmVjdGx5IHRvIHRoZSBhcHByb3ByaWF0ZSBzY29wZSBvYmplY3QuXG4gIC8vIEkuZS4gUHVzaGVkIHZhbHVlcyBpbiB0d28tYmluZGluZ3MgbmVlZCB0byBiZSBhc3NpZ25lZCB0byB0aGUgYWN0dWFsIG1vZGVsXG4gIC8vIG9iamVjdC5cbiAgZnVuY3Rpb24gZmluZFNjb3BlKG1vZGVsLCBwcm9wKSB7XG4gICAgd2hpbGUgKG1vZGVsW3BhcmVudFNjb3BlTmFtZV0gJiZcbiAgICAgICAgICAgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChtb2RlbCwgcHJvcCkpIHtcbiAgICAgIG1vZGVsID0gbW9kZWxbcGFyZW50U2NvcGVOYW1lXTtcbiAgICB9XG5cbiAgICByZXR1cm4gbW9kZWw7XG4gIH1cblxuICBmdW5jdGlvbiBpc0xpdGVyYWxFeHByZXNzaW9uKHBhdGhTdHJpbmcpIHtcbiAgICBzd2l0Y2ggKHBhdGhTdHJpbmcpIHtcbiAgICAgIGNhc2UgJyc6XG4gICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgY2FzZSAnZmFsc2UnOlxuICAgICAgY2FzZSAnbnVsbCc6XG4gICAgICBjYXNlICd0cnVlJzpcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKCFpc05hTihOdW1iZXIocGF0aFN0cmluZykpKVxuICAgICAgcmV0dXJuIHRydWU7XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgZnVuY3Rpb24gUG9seW1lckV4cHJlc3Npb25zKCkge31cblxuICBQb2x5bWVyRXhwcmVzc2lvbnMucHJvdG90eXBlID0ge1xuICAgIC8vIFwiYnVpbHQtaW5cIiBmaWx0ZXJzXG4gICAgc3R5bGVPYmplY3Q6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICB2YXIgcGFydHMgPSBbXTtcbiAgICAgIGZvciAodmFyIGtleSBpbiB2YWx1ZSkge1xuICAgICAgICBwYXJ0cy5wdXNoKGNvbnZlcnRTdHlsZVByb3BlcnR5TmFtZShrZXkpICsgJzogJyArIHZhbHVlW2tleV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBhcnRzLmpvaW4oJzsgJyk7XG4gICAgfSxcblxuICAgIHRva2VuTGlzdDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHZhciB0b2tlbnMgPSBbXTtcbiAgICAgIGZvciAodmFyIGtleSBpbiB2YWx1ZSkge1xuICAgICAgICBpZiAodmFsdWVba2V5XSlcbiAgICAgICAgICB0b2tlbnMucHVzaChrZXkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRva2Vucy5qb2luKCcgJyk7XG4gICAgfSxcblxuICAgIC8vIGJpbmRpbmcgZGVsZWdhdGUgQVBJXG4gICAgcHJlcGFyZUluc3RhbmNlUG9zaXRpb25DaGFuZ2VkOiBmdW5jdGlvbih0ZW1wbGF0ZSkge1xuICAgICAgdmFyIGluZGV4SWRlbnQgPSB0ZW1wbGF0ZS5wb2x5bWVyRXhwcmVzc2lvbkluZGV4SWRlbnRfO1xuICAgICAgaWYgKCFpbmRleElkZW50KVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbih0ZW1wbGF0ZUluc3RhbmNlLCBpbmRleCkge1xuICAgICAgICB0ZW1wbGF0ZUluc3RhbmNlLm1vZGVsW2luZGV4SWRlbnRdID0gaW5kZXg7XG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBwcmVwYXJlQmluZGluZzogZnVuY3Rpb24ocGF0aFN0cmluZywgbmFtZSwgbm9kZSkge1xuICAgICAgdmFyIHBhdGggPSBQYXRoLmdldChwYXRoU3RyaW5nKTtcblxuICAgICAgaWYgKCFpc0xpdGVyYWxFeHByZXNzaW9uKHBhdGhTdHJpbmcpICYmIHBhdGgudmFsaWQpIHtcbiAgICAgICAgaWYgKHBhdGgubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24obW9kZWwsIG5vZGUsIG9uZVRpbWUpIHtcbiAgICAgICAgICAgIGlmIChvbmVUaW1lKVxuICAgICAgICAgICAgICByZXR1cm4gcGF0aC5nZXRWYWx1ZUZyb20obW9kZWwpO1xuXG4gICAgICAgICAgICB2YXIgc2NvcGUgPSBmaW5kU2NvcGUobW9kZWwsIHBhdGhbMF0pO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQYXRoT2JzZXJ2ZXIoc2NvcGUsIHBhdGgpO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuOyAvLyBiYWlsIG91dCBlYXJseSBpZiBwYXRoU3RyaW5nIGlzIHNpbXBsZSBwYXRoLlxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJlcGFyZUJpbmRpbmcocGF0aFN0cmluZywgbmFtZSwgbm9kZSwgdGhpcyk7XG4gICAgfSxcblxuICAgIHByZXBhcmVJbnN0YW5jZU1vZGVsOiBmdW5jdGlvbih0ZW1wbGF0ZSkge1xuICAgICAgdmFyIHNjb3BlTmFtZSA9IHRlbXBsYXRlLnBvbHltZXJFeHByZXNzaW9uU2NvcGVJZGVudF87XG4gICAgICBpZiAoIXNjb3BlTmFtZSlcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICB2YXIgcGFyZW50U2NvcGUgPSB0ZW1wbGF0ZS50ZW1wbGF0ZUluc3RhbmNlID9cbiAgICAgICAgICB0ZW1wbGF0ZS50ZW1wbGF0ZUluc3RhbmNlLm1vZGVsIDpcbiAgICAgICAgICB0ZW1wbGF0ZS5tb2RlbDtcblxuICAgICAgdmFyIGluZGV4TmFtZSA9IHRlbXBsYXRlLnBvbHltZXJFeHByZXNzaW9uSW5kZXhJZGVudF87XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbihtb2RlbCkge1xuICAgICAgICByZXR1cm4gY3JlYXRlU2NvcGVPYmplY3QocGFyZW50U2NvcGUsIG1vZGVsLCBzY29wZU5hbWUsIGluZGV4TmFtZSk7XG4gICAgICB9O1xuICAgIH1cbiAgfTtcblxuICB2YXIgY3JlYXRlU2NvcGVPYmplY3QgPSAoJ19fcHJvdG9fXycgaW4ge30pID9cbiAgICBmdW5jdGlvbihwYXJlbnRTY29wZSwgbW9kZWwsIHNjb3BlTmFtZSwgaW5kZXhOYW1lKSB7XG4gICAgICB2YXIgc2NvcGUgPSB7fTtcbiAgICAgIHNjb3BlW3Njb3BlTmFtZV0gPSBtb2RlbDtcbiAgICAgIHNjb3BlW2luZGV4TmFtZV0gPSB1bmRlZmluZWQ7XG4gICAgICBzY29wZVtwYXJlbnRTY29wZU5hbWVdID0gcGFyZW50U2NvcGU7XG4gICAgICBzY29wZS5fX3Byb3RvX18gPSBwYXJlbnRTY29wZTtcbiAgICAgIHJldHVybiBzY29wZTtcbiAgICB9IDpcbiAgICBmdW5jdGlvbihwYXJlbnRTY29wZSwgbW9kZWwsIHNjb3BlTmFtZSwgaW5kZXhOYW1lKSB7XG4gICAgICB2YXIgc2NvcGUgPSBPYmplY3QuY3JlYXRlKHBhcmVudFNjb3BlKTtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzY29wZSwgc2NvcGVOYW1lLFxuICAgICAgICAgIHsgdmFsdWU6IG1vZGVsLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHNjb3BlLCBpbmRleE5hbWUsXG4gICAgICAgICAgeyB2YWx1ZTogdW5kZWZpbmVkLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHNjb3BlLCBwYXJlbnRTY29wZU5hbWUsXG4gICAgICAgICAgeyB2YWx1ZTogcGFyZW50U2NvcGUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7XG4gICAgICByZXR1cm4gc2NvcGU7XG4gICAgfTtcblxuICBnbG9iYWwuUG9seW1lckV4cHJlc3Npb25zID0gUG9seW1lckV4cHJlc3Npb25zO1xuICBQb2x5bWVyRXhwcmVzc2lvbnMuZ2V0RXhwcmVzc2lvbiA9IGdldEV4cHJlc3Npb247XG59KSh0aGlzKTtcblxuUG9seW1lciA9IHtcbiAgdmVyc2lvbjogJzAuNS41J1xufTtcblxuLy8gVE9ETyhzb3J2ZWxsKTogdGhpcyBlbnN1cmVzIFBvbHltZXIgaXMgYW4gb2JqZWN0IGFuZCBub3QgYSBmdW5jdGlvblxuLy8gUGxhdGZvcm0gaXMgY3VycmVudGx5IGRlZmluaW5nIGl0IGFzIGEgZnVuY3Rpb24gdG8gYWxsb3cgZm9yIGFzeW5jIGxvYWRpbmdcbi8vIG9mIHBvbHltZXI7IG9uY2Ugd2UgcmVmaW5lIHRoZSBsb2FkaW5nIHByb2Nlc3MgdGhpcyBsaWtlbHkgZ29lcyBhd2F5LlxuaWYgKHR5cGVvZiB3aW5kb3cuUG9seW1lciA9PT0gJ2Z1bmN0aW9uJykge1xuICBQb2x5bWVyID0ge307XG59XG5cblxuKGZ1bmN0aW9uKHNjb3BlKSB7XG5cbiAgZnVuY3Rpb24gd2l0aERlcGVuZGVuY2llcyh0YXNrLCBkZXBlbmRzKSB7XG4gICAgZGVwZW5kcyA9IGRlcGVuZHMgfHwgW107XG4gICAgaWYgKCFkZXBlbmRzLm1hcCkge1xuICAgICAgZGVwZW5kcyA9IFtkZXBlbmRzXTtcbiAgICB9XG4gICAgcmV0dXJuIHRhc2suYXBwbHkodGhpcywgZGVwZW5kcy5tYXAobWFyc2hhbCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gbW9kdWxlKG5hbWUsIGRlcGVuZHNPckZhY3RvcnksIG1vZHVsZUZhY3RvcnkpIHtcbiAgICB2YXIgbW9kdWxlO1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICByZXR1cm47XG4gICAgICBjYXNlIDE6XG4gICAgICAgIG1vZHVsZSA9IG51bGw7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICAvLyBkZXBlbmRzT3JGYWN0b3J5IGlzIGBmYWN0b3J5YCBpbiB0aGlzIGNhc2VcbiAgICAgICAgbW9kdWxlID0gZGVwZW5kc09yRmFjdG9yeS5hcHBseSh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvLyBkZXBlbmRzT3JGYWN0b3J5IGlzIGBkZXBlbmRzYCBpbiB0aGlzIGNhc2VcbiAgICAgICAgbW9kdWxlID0gd2l0aERlcGVuZGVuY2llcyhtb2R1bGVGYWN0b3J5LCBkZXBlbmRzT3JGYWN0b3J5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIG1vZHVsZXNbbmFtZV0gPSBtb2R1bGU7XG4gIH07XG5cbiAgZnVuY3Rpb24gbWFyc2hhbChuYW1lKSB7XG4gICAgcmV0dXJuIG1vZHVsZXNbbmFtZV07XG4gIH1cblxuICB2YXIgbW9kdWxlcyA9IHt9O1xuXG4gIGZ1bmN0aW9uIHVzaW5nKGRlcGVuZHMsIHRhc2spIHtcbiAgICBIVE1MSW1wb3J0cy53aGVuSW1wb3J0c1JlYWR5KGZ1bmN0aW9uKCkge1xuICAgICAgd2l0aERlcGVuZGVuY2llcyh0YXNrLCBkZXBlbmRzKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBleHBvcnRzXG5cbiAgc2NvcGUubWFyc2hhbCA9IG1hcnNoYWw7XG4gIC8vIGBtb2R1bGVgIGNvbmZ1c2VzIGNvbW1vbmpzIGRldGVjdG9yc1xuICBzY29wZS5tb2R1bGFyaXplID0gbW9kdWxlO1xuICBzY29wZS51c2luZyA9IHVzaW5nO1xuXG59KSh3aW5kb3cpO1xuXG4vKlxuXHRCdWlsZCBvbmx5IHNjcmlwdC5cblxuICBFbnN1cmVzIHNjcmlwdHMgbmVlZGVkIGZvciBiYXNpYyB4LXBsYXRmb3JtIGNvbXBhdGliaWxpdHlcbiAgd2lsbCBiZSBydW4gd2hlbiBwbGF0Zm9ybS5qcyBpcyBub3QgbG9hZGVkLlxuICovXG5pZiAoIXdpbmRvdy5XZWJDb21wb25lbnRzKSB7XG5cbi8qXG5cdE9uIHN1cHBvcnRlZCBwbGF0Zm9ybXMsIHBsYXRmb3JtLmpzIGlzIG5vdCBuZWVkZWQuIFRvIHJldGFpbiBjb21wYXRpYmlsaXR5XG5cdHdpdGggdGhlIHBvbHlmaWxscywgd2Ugc3R1YiBvdXQgbWluaW1hbCBmdW5jdGlvbmFsaXR5LlxuICovXG5pZiAoIXdpbmRvdy5XZWJDb21wb25lbnRzKSB7XG5cbiAgV2ViQ29tcG9uZW50cyA9IHtcbiAgXHRmbHVzaDogZnVuY3Rpb24oKSB7fSxcbiAgICBmbGFnczoge2xvZzoge319XG4gIH07XG5cbiAgUGxhdGZvcm0gPSBXZWJDb21wb25lbnRzO1xuXG4gIEN1c3RvbUVsZW1lbnRzID0ge1xuICBcdHVzZU5hdGl2ZTogdHJ1ZSxcbiAgICByZWFkeTogdHJ1ZSxcbiAgICB0YWtlUmVjb3JkczogZnVuY3Rpb24oKSB7fSxcbiAgICBpbnN0YW5jZW9mOiBmdW5jdGlvbihvYmosIGJhc2UpIHtcbiAgICAgIHJldHVybiBvYmogaW5zdGFuY2VvZiBiYXNlO1xuICAgIH1cbiAgfTtcblxuICBIVE1MSW1wb3J0cyA9IHtcbiAgXHR1c2VOYXRpdmU6IHRydWVcbiAgfTtcblxuXG4gIGFkZEV2ZW50TGlzdGVuZXIoJ0hUTUxJbXBvcnRzTG9hZGVkJywgZnVuY3Rpb24oKSB7XG4gICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChcbiAgICAgIG5ldyBDdXN0b21FdmVudCgnV2ViQ29tcG9uZW50c1JlYWR5Jywge2J1YmJsZXM6IHRydWV9KVxuICAgICk7XG4gIH0pO1xuXG5cbiAgLy8gU2hhZG93RE9NXG4gIFNoYWRvd0RPTVBvbHlmaWxsID0gbnVsbDtcbiAgd3JhcCA9IHVud3JhcCA9IGZ1bmN0aW9uKG4pe1xuICAgIHJldHVybiBuO1xuICB9O1xuXG59XG5cbi8qXG4gIENyZWF0ZSBwb2x5ZmlsbCBzY29wZSBhbmQgZmVhdHVyZSBkZXRlY3QgbmF0aXZlIHN1cHBvcnQuXG4qL1xud2luZG93LkhUTUxJbXBvcnRzID0gd2luZG93LkhUTUxJbXBvcnRzIHx8IHtmbGFnczp7fX07XG5cbihmdW5jdGlvbihzY29wZSkge1xuXG4vKipcbiAgQmFzaWMgc2V0dXAgYW5kIHNpbXBsZSBtb2R1bGUgZXhlY3V0ZXIuIFdlIGNvbGxlY3QgbW9kdWxlcyBhbmQgdGhlbiBleGVjdXRlXG4gIHRoZSBjb2RlIGxhdGVyLCBvbmx5IGlmIGl0J3MgbmVjZXNzYXJ5IGZvciBwb2x5ZmlsbGluZy5cbiovXG52YXIgSU1QT1JUX0xJTktfVFlQRSA9ICdpbXBvcnQnO1xudmFyIHVzZU5hdGl2ZSA9IEJvb2xlYW4oSU1QT1JUX0xJTktfVFlQRSBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJykpO1xuXG4vKipcbiAgU3VwcG9ydCBgY3VycmVudFNjcmlwdGAgb24gYWxsIGJyb3dzZXJzIGFzIGBkb2N1bWVudC5fY3VycmVudFNjcmlwdC5gXG5cbiAgTk9URTogV2UgY2Fubm90IHBvbHlmaWxsIGBkb2N1bWVudC5jdXJyZW50U2NyaXB0YCBiZWNhdXNlIGl0J3Mgbm90IHBvc3NpYmxlXG4gIGJvdGggdG8gb3ZlcnJpZGUgYW5kIG1haW50YWluIHRoZSBhYmlsaXR5IHRvIGNhcHR1cmUgdGhlIG5hdGl2ZSB2YWx1ZS5cbiAgVGhlcmVmb3JlIHdlIGNob29zZSB0byBleHBvc2UgYF9jdXJyZW50U2NyaXB0YCBib3RoIHdoZW4gbmF0aXZlIGltcG9ydHNcbiAgYW5kIHRoZSBwb2x5ZmlsbCBhcmUgaW4gdXNlLlxuKi9cbi8vIE5PVEU6IFNoYWRvd0RPTVBvbHlmaWxsIGludHJ1c2lvbi5cbnZhciBoYXNTaGFkb3dET01Qb2x5ZmlsbCA9IEJvb2xlYW4od2luZG93LlNoYWRvd0RPTVBvbHlmaWxsKTtcbnZhciB3cmFwID0gZnVuY3Rpb24obm9kZSkge1xuICByZXR1cm4gaGFzU2hhZG93RE9NUG9seWZpbGwgPyBTaGFkb3dET01Qb2x5ZmlsbC53cmFwSWZOZWVkZWQobm9kZSkgOiBub2RlO1xufTtcbnZhciByb290RG9jdW1lbnQgPSB3cmFwKGRvY3VtZW50KTtcblxudmFyIGN1cnJlbnRTY3JpcHREZXNjcmlwdG9yID0ge1xuICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzY3JpcHQgPSBIVE1MSW1wb3J0cy5jdXJyZW50U2NyaXB0IHx8IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQgfHxcbiAgICAgICAgLy8gTk9URTogb25seSB3b3JrcyB3aGVuIGNhbGxlZCBpbiBzeW5jaHJvbm91c2x5IGV4ZWN1dGluZyBjb2RlLlxuICAgICAgICAvLyByZWFkeVN0YXRlIHNob3VsZCBjaGVjayBpZiBgbG9hZGluZ2AgYnV0IElFMTAgaXNcbiAgICAgICAgLy8gaW50ZXJhY3RpdmUgd2hlbiBzY3JpcHRzIHJ1biBzbyB3ZSBjaGVhdC5cbiAgICAgICAgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdjb21wbGV0ZScgP1xuICAgICAgICBkb2N1bWVudC5zY3JpcHRzW2RvY3VtZW50LnNjcmlwdHMubGVuZ3RoIC0gMV0gOiBudWxsKTtcbiAgICByZXR1cm4gd3JhcChzY3JpcHQpO1xuICB9LFxuICBjb25maWd1cmFibGU6IHRydWVcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShkb2N1bWVudCwgJ19jdXJyZW50U2NyaXB0JywgY3VycmVudFNjcmlwdERlc2NyaXB0b3IpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHJvb3REb2N1bWVudCwgJ19jdXJyZW50U2NyaXB0JywgY3VycmVudFNjcmlwdERlc2NyaXB0b3IpO1xuXG4vKipcbiAgQWRkIHN1cHBvcnQgZm9yIHRoZSBgSFRNTEltcG9ydHNMb2FkZWRgIGV2ZW50IGFuZCB0aGUgYEhUTUxJbXBvcnRzLndoZW5SZWFkeWBcbiAgbWV0aG9kLiBUaGlzIGFwaSBpcyBuZWNlc3NhcnkgYmVjYXVzZSB1bmxpa2UgdGhlIG5hdGl2ZSBpbXBsZW1lbnRhdGlvbixcbiAgc2NyaXB0IGVsZW1lbnRzIGRvIG5vdCBmb3JjZSBpbXBvcnRzIHRvIHJlc29sdmUuIEluc3RlYWQsIHVzZXJzIHNob3VsZCB3cmFwXG4gIGNvZGUgaW4gZWl0aGVyIGFuIGBIVE1MSW1wb3J0c0xvYWRlZGAgaGFuZGVyIG9yIGFmdGVyIGxvYWQgdGltZSBpbiBhblxuICBgSFRNTEltcG9ydHMud2hlblJlYWR5KGNhbGxiYWNrKWAgY2FsbC5cblxuICBOT1RFOiBUaGlzIG1vZHVsZSBhbHNvIHN1cHBvcnRzIHRoZXNlIGFwaXMgdW5kZXIgdGhlIG5hdGl2ZSBpbXBsZW1lbnRhdGlvbi5cbiAgVGhlcmVmb3JlLCBpZiB0aGlzIGZpbGUgaXMgbG9hZGVkLCB0aGUgc2FtZSBjb2RlIGNhbiBiZSB1c2VkIHVuZGVyIGJvdGhcbiAgdGhlIHBvbHlmaWxsIGFuZCBuYXRpdmUgaW1wbGVtZW50YXRpb24uXG4gKi9cblxudmFyIGlzSUUgPSAvVHJpZGVudC8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcblxuLy8gY2FsbCBhIGNhbGxiYWNrIHdoZW4gYWxsIEhUTUxJbXBvcnRzIGluIHRoZSBkb2N1bWVudCBhdCBjYWxsIHRpbWVcbi8vIChvciBhdCBsZWFzdCBkb2N1bWVudCByZWFkeSkgaGF2ZSBsb2FkZWQuXG4vLyAxLiBlbnN1cmUgdGhlIGRvY3VtZW50IGlzIGluIGEgcmVhZHkgc3RhdGUgKGhhcyBkb20pLCB0aGVuXG4vLyAyLiB3YXRjaCBmb3IgbG9hZGluZyBvZiBpbXBvcnRzIGFuZCBjYWxsIGNhbGxiYWNrIHdoZW4gZG9uZVxuZnVuY3Rpb24gd2hlblJlYWR5KGNhbGxiYWNrLCBkb2MpIHtcbiAgZG9jID0gZG9jIHx8IHJvb3REb2N1bWVudDtcbiAgLy8gaWYgZG9jdW1lbnQgaXMgbG9hZGluZywgd2FpdCBhbmQgdHJ5IGFnYWluXG4gIHdoZW5Eb2N1bWVudFJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIHdhdGNoSW1wb3J0c0xvYWQoY2FsbGJhY2ssIGRvYyk7XG4gIH0sIGRvYyk7XG59XG5cbi8vIGNhbGwgdGhlIGNhbGxiYWNrIHdoZW4gdGhlIGRvY3VtZW50IGlzIGluIGEgcmVhZHkgc3RhdGUgKGhhcyBkb20pXG52YXIgcmVxdWlyZWRSZWFkeVN0YXRlID0gaXNJRSA/ICdjb21wbGV0ZScgOiAnaW50ZXJhY3RpdmUnO1xudmFyIFJFQURZX0VWRU5UID0gJ3JlYWR5c3RhdGVjaGFuZ2UnO1xuZnVuY3Rpb24gaXNEb2N1bWVudFJlYWR5KGRvYykge1xuICByZXR1cm4gKGRvYy5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnIHx8XG4gICAgICBkb2MucmVhZHlTdGF0ZSA9PT0gcmVxdWlyZWRSZWFkeVN0YXRlKTtcbn1cblxuLy8gY2FsbCA8Y2FsbGJhY2s+IHdoZW4gd2UgZW5zdXJlIHRoZSBkb2N1bWVudCBpcyBpbiBhIHJlYWR5IHN0YXRlXG5mdW5jdGlvbiB3aGVuRG9jdW1lbnRSZWFkeShjYWxsYmFjaywgZG9jKSB7XG4gIGlmICghaXNEb2N1bWVudFJlYWR5KGRvYykpIHtcbiAgICB2YXIgY2hlY2tSZWFkeSA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGRvYy5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnIHx8XG4gICAgICAgICAgZG9jLnJlYWR5U3RhdGUgPT09IHJlcXVpcmVkUmVhZHlTdGF0ZSkge1xuICAgICAgICBkb2MucmVtb3ZlRXZlbnRMaXN0ZW5lcihSRUFEWV9FVkVOVCwgY2hlY2tSZWFkeSk7XG4gICAgICAgIHdoZW5Eb2N1bWVudFJlYWR5KGNhbGxiYWNrLCBkb2MpO1xuICAgICAgfVxuICAgIH07XG4gICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoUkVBRFlfRVZFTlQsIGNoZWNrUmVhZHkpO1xuICB9IGVsc2UgaWYgKGNhbGxiYWNrKSB7XG4gICAgY2FsbGJhY2soKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtYXJrVGFyZ2V0TG9hZGVkKGV2ZW50KSB7XG4gIGV2ZW50LnRhcmdldC5fX2xvYWRlZCA9IHRydWU7XG59XG5cbi8vIGNhbGwgPGNhbGxiYWNrPiB3aGVuIHdlIGVuc3VyZSBhbGwgaW1wb3J0cyBoYXZlIGxvYWRlZFxuZnVuY3Rpb24gd2F0Y2hJbXBvcnRzTG9hZChjYWxsYmFjaywgZG9jKSB7XG4gIHZhciBpbXBvcnRzID0gZG9jLnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpbmtbcmVsPWltcG9ydF0nKTtcbiAgdmFyIGxvYWRlZCA9IDAsIGwgPSBpbXBvcnRzLmxlbmd0aDtcbiAgZnVuY3Rpb24gY2hlY2tEb25lKGQpIHtcbiAgICBpZiAoKGxvYWRlZCA9PSBsKSAmJiBjYWxsYmFjaykge1xuICAgICAgIGNhbGxiYWNrKCk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGxvYWRlZEltcG9ydChlKSB7XG4gICAgbWFya1RhcmdldExvYWRlZChlKTtcbiAgICBsb2FkZWQrKztcbiAgICBjaGVja0RvbmUoKTtcbiAgfVxuICBpZiAobCkge1xuICAgIGZvciAodmFyIGk9MCwgaW1wOyAoaTxsKSAmJiAoaW1wPWltcG9ydHNbaV0pOyBpKyspIHtcbiAgICAgIGlmIChpc0ltcG9ydExvYWRlZChpbXApKSB7XG4gICAgICAgIGxvYWRlZEltcG9ydC5jYWxsKGltcCwge3RhcmdldDogaW1wfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbXAuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGxvYWRlZEltcG9ydCk7XG4gICAgICAgIGltcC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGxvYWRlZEltcG9ydCk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNoZWNrRG9uZSgpO1xuICB9XG59XG5cbi8vIE5PVEU6IHRlc3QgZm9yIG5hdGl2ZSBpbXBvcnRzIGxvYWRpbmcgaXMgYmFzZWQgb24gZXhwbGljaXRseSB3YXRjaGluZ1xuLy8gYWxsIGltcG9ydHMgKHNlZSBiZWxvdykuXG4vLyBIb3dldmVyLCB3ZSBjYW5ub3QgcmVseSBvbiB0aGlzIGVudGlyZWx5IHdpdGhvdXQgd2F0Y2hpbmcgdGhlIGVudGlyZSBkb2N1bWVudFxuLy8gZm9yIGltcG9ydCBsaW5rcy4gRm9yIHBlcmYgcmVhc29ucywgY3VycmVudGx5IG9ubHkgaGVhZCBpcyB3YXRjaGVkLlxuLy8gSW5zdGVhZCwgd2UgZmFsbGJhY2sgdG8gY2hlY2tpbmcgaWYgdGhlIGltcG9ydCBwcm9wZXJ0eSBpcyBhdmFpbGFibGVcbi8vIGFuZCB0aGUgZG9jdW1lbnQgaXMgbm90IGl0c2VsZiBsb2FkaW5nLlxuZnVuY3Rpb24gaXNJbXBvcnRMb2FkZWQobGluaykge1xuICByZXR1cm4gdXNlTmF0aXZlID8gbGluay5fX2xvYWRlZCB8fFxuICAgICAgKGxpbmsuaW1wb3J0ICYmIGxpbmsuaW1wb3J0LnJlYWR5U3RhdGUgIT09ICdsb2FkaW5nJykgOlxuICAgICAgbGluay5fX2ltcG9ydFBhcnNlZDtcbn1cblxuLy8gVE9ETyhzb3J2ZWxsKTogV29ya2Fyb3VuZCBmb3Jcbi8vIGh0dHBzOi8vd3d3LnczLm9yZy9CdWdzL1B1YmxpYy9zaG93X2J1Zy5jZ2k/aWQ9MjUwMDcsIHNob3VsZCBiZSByZW1vdmVkIHdoZW5cbi8vIHRoaXMgYnVnIGlzIGFkZHJlc3NlZC5cbi8vICgxKSBJbnN0YWxsIGEgbXV0YXRpb24gb2JzZXJ2ZXIgdG8gc2VlIHdoZW4gSFRNTEltcG9ydHMgaGF2ZSBsb2FkZWRcbi8vICgyKSBpZiB0aGlzIHNjcmlwdCBpcyBydW4gZHVyaW5nIGRvY3VtZW50IGxvYWQgaXQgd2lsbCB3YXRjaCBhbnkgZXhpc3Rpbmdcbi8vIGltcG9ydHMgZm9yIGxvYWRpbmcuXG4vL1xuLy8gTk9URTogVGhlIHdvcmthcm91bmQgaGFzIHJlc3RyaWN0ZWQgZnVuY3Rpb25hbGl0eTogKDEpIGl0J3Mgb25seSBjb21wYXRpYmxlXG4vLyB3aXRoIGltcG9ydHMgdGhhdCBhcmUgYWRkZWQgdG8gZG9jdW1lbnQuaGVhZCBzaW5jZSB0aGUgbXV0YXRpb24gb2JzZXJ2ZXJcbi8vIHdhdGNoZXMgb25seSBoZWFkIGZvciBwZXJmIHJlYXNvbnMsICgyKSBpdCByZXF1aXJlcyB0aGlzIHNjcmlwdFxuLy8gdG8gcnVuIGJlZm9yZSBhbnkgaW1wb3J0cyBoYXZlIGNvbXBsZXRlZCBsb2FkaW5nLlxuaWYgKHVzZU5hdGl2ZSkge1xuICBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbihteG5zKSB7XG4gICAgZm9yICh2YXIgaT0wLCBsPW14bnMubGVuZ3RoLCBtOyAoaSA8IGwpICYmIChtPW14bnNbaV0pOyBpKyspIHtcbiAgICAgIGlmIChtLmFkZGVkTm9kZXMpIHtcbiAgICAgICAgaGFuZGxlSW1wb3J0cyhtLmFkZGVkTm9kZXMpO1xuICAgICAgfVxuICAgIH1cbiAgfSkub2JzZXJ2ZShkb2N1bWVudC5oZWFkLCB7Y2hpbGRMaXN0OiB0cnVlfSk7XG5cbiAgZnVuY3Rpb24gaGFuZGxlSW1wb3J0cyhub2Rlcykge1xuICAgIGZvciAodmFyIGk9MCwgbD1ub2Rlcy5sZW5ndGgsIG47IChpPGwpICYmIChuPW5vZGVzW2ldKTsgaSsrKSB7XG4gICAgICBpZiAoaXNJbXBvcnQobikpIHtcbiAgICAgICAgaGFuZGxlSW1wb3J0KG4pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGlzSW1wb3J0KGVsZW1lbnQpIHtcbiAgICByZXR1cm4gZWxlbWVudC5sb2NhbE5hbWUgPT09ICdsaW5rJyAmJiBlbGVtZW50LnJlbCA9PT0gJ2ltcG9ydCc7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVJbXBvcnQoZWxlbWVudCkge1xuICAgIHZhciBsb2FkZWQgPSBlbGVtZW50LmltcG9ydDtcbiAgICBpZiAobG9hZGVkKSB7XG4gICAgICBtYXJrVGFyZ2V0TG9hZGVkKHt0YXJnZXQ6IGVsZW1lbnR9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgbWFya1RhcmdldExvYWRlZCk7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgbWFya1RhcmdldExvYWRlZCk7XG4gICAgfVxuICB9XG5cbiAgLy8gbWFrZSBzdXJlIHRvIGNhdGNoIGFueSBpbXBvcnRzIHRoYXQgYXJlIGluIHRoZSBwcm9jZXNzIG9mIGxvYWRpbmdcbiAgLy8gd2hlbiB0aGlzIHNjcmlwdCBpcyBydW4uXG4gIChmdW5jdGlvbigpIHtcbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2xvYWRpbmcnKSB7XG4gICAgICB2YXIgaW1wb3J0cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpbmtbcmVsPWltcG9ydF0nKTtcbiAgICAgIGZvciAodmFyIGk9MCwgbD1pbXBvcnRzLmxlbmd0aCwgaW1wOyAoaTxsKSAmJiAoaW1wPWltcG9ydHNbaV0pOyBpKyspIHtcbiAgICAgICAgaGFuZGxlSW1wb3J0KGltcCk7XG4gICAgICB9XG4gICAgfVxuICB9KSgpO1xuXG59XG5cbi8vIEZpcmUgdGhlICdIVE1MSW1wb3J0c0xvYWRlZCcgZXZlbnQgd2hlbiBpbXBvcnRzIGluIGRvY3VtZW50IGF0IGxvYWQgdGltZVxuLy8gaGF2ZSBsb2FkZWQuIFRoaXMgZXZlbnQgaXMgcmVxdWlyZWQgdG8gc2ltdWxhdGUgdGhlIHNjcmlwdCBibG9ja2luZ1xuLy8gYmVoYXZpb3Igb2YgbmF0aXZlIGltcG9ydHMuIEEgbWFpbiBkb2N1bWVudCBzY3JpcHQgdGhhdCBuZWVkcyB0byBiZSBzdXJlXG4vLyBpbXBvcnRzIGhhdmUgbG9hZGVkIHNob3VsZCB3YWl0IGZvciB0aGlzIGV2ZW50Llxud2hlblJlYWR5KGZ1bmN0aW9uKCkge1xuICBIVE1MSW1wb3J0cy5yZWFkeSA9IHRydWU7XG4gIEhUTUxJbXBvcnRzLnJlYWR5VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICByb290RG9jdW1lbnQuZGlzcGF0Y2hFdmVudChcbiAgICBuZXcgQ3VzdG9tRXZlbnQoJ0hUTUxJbXBvcnRzTG9hZGVkJywge2J1YmJsZXM6IHRydWV9KVxuICApO1xufSk7XG5cbi8vIGV4cG9ydHNcbnNjb3BlLklNUE9SVF9MSU5LX1RZUEUgPSBJTVBPUlRfTElOS19UWVBFO1xuc2NvcGUudXNlTmF0aXZlID0gdXNlTmF0aXZlO1xuc2NvcGUucm9vdERvY3VtZW50ID0gcm9vdERvY3VtZW50O1xuc2NvcGUud2hlblJlYWR5ID0gd2hlblJlYWR5O1xuc2NvcGUuaXNJRSA9IGlzSUU7XG5cbn0pKEhUTUxJbXBvcnRzKTtcblxuKGZ1bmN0aW9uKHNjb3BlKSB7XG5cbiAgLy8gVE9ETyhzb3J2ZWxsKTogSXQncyBkZXNpcmVhYmxlIHRvIHByb3ZpZGUgYSBkZWZhdWx0IHN0eWxlc2hlZXRcbiAgLy8gdGhhdCdzIGNvbnZlbmllbnQgZm9yIHN0eWxpbmcgdW5yZXNvbHZlZCBlbGVtZW50cywgYnV0XG4gIC8vIGl0J3MgY3VtYmVyc29tZSB0byBoYXZlIHRvIGluY2x1ZGUgdGhpcyBtYW51YWxseSBpbiBldmVyeSBwYWdlLlxuICAvLyBJdCB3b3VsZCBtYWtlIHNlbnNlIHRvIHB1dCBpbnNpZGUgc29tZSBIVE1MSW1wb3J0IGJ1dFxuICAvLyB0aGUgSFRNTEltcG9ydHMgcG9seWZpbGwgZG9lcyBub3QgYWxsb3cgbG9hZGluZyBvZiBzdHlsZXNoZWV0c1xuICAvLyB0aGF0IGJsb2NrIHJlbmRlcmluZy4gVGhlcmVmb3JlIHRoaXMgaW5qZWN0aW9uIGlzIHRvbGVyYXRlZCBoZXJlLlxuICB2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICBzdHlsZS50ZXh0Q29udGVudCA9ICcnXG4gICAgICArICdib2R5IHsnXG4gICAgICArICd0cmFuc2l0aW9uOiBvcGFjaXR5IGVhc2UtaW4gMC4yczsnXG4gICAgICArICcgfSBcXG4nXG4gICAgICArICdib2R5W3VucmVzb2x2ZWRdIHsnXG4gICAgICArICdvcGFjaXR5OiAwOyBkaXNwbGF5OiBibG9jazsgb3ZlcmZsb3c6IGhpZGRlbjsnXG4gICAgICArICcgfSBcXG4nXG4gICAgICA7XG4gIHZhciBoZWFkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaGVhZCcpO1xuICBoZWFkLmluc2VydEJlZm9yZShzdHlsZSwgaGVhZC5maXJzdENoaWxkKTtcblxufSkoUGxhdGZvcm0pO1xuXG4vKlxuXHRCdWlsZCBvbmx5IHNjcmlwdC5cblxuICBFbnN1cmVzIHNjcmlwdHMgbmVlZGVkIGZvciBiYXNpYyB4LXBsYXRmb3JtIGNvbXBhdGliaWxpdHlcbiAgd2lsbCBiZSBydW4gd2hlbiBwbGF0Zm9ybS5qcyBpcyBub3QgbG9hZGVkLlxuICovXG59XG4oZnVuY3Rpb24oZ2xvYmFsKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgdGVzdGluZ0V4cG9zZUN5Y2xlQ291bnQgPSBnbG9iYWwudGVzdGluZ0V4cG9zZUN5Y2xlQ291bnQ7XG5cbiAgLy8gRGV0ZWN0IGFuZCBkbyBiYXNpYyBzYW5pdHkgY2hlY2tpbmcgb24gT2JqZWN0L0FycmF5Lm9ic2VydmUuXG4gIGZ1bmN0aW9uIGRldGVjdE9iamVjdE9ic2VydmUoKSB7XG4gICAgaWYgKHR5cGVvZiBPYmplY3Qub2JzZXJ2ZSAhPT0gJ2Z1bmN0aW9uJyB8fFxuICAgICAgICB0eXBlb2YgQXJyYXkub2JzZXJ2ZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciByZWNvcmRzID0gW107XG5cbiAgICBmdW5jdGlvbiBjYWxsYmFjayhyZWNzKSB7XG4gICAgICByZWNvcmRzID0gcmVjcztcbiAgICB9XG5cbiAgICB2YXIgdGVzdCA9IHt9O1xuICAgIHZhciBhcnIgPSBbXTtcbiAgICBPYmplY3Qub2JzZXJ2ZSh0ZXN0LCBjYWxsYmFjayk7XG4gICAgQXJyYXkub2JzZXJ2ZShhcnIsIGNhbGxiYWNrKTtcbiAgICB0ZXN0LmlkID0gMTtcbiAgICB0ZXN0LmlkID0gMjtcbiAgICBkZWxldGUgdGVzdC5pZDtcbiAgICBhcnIucHVzaCgxLCAyKTtcbiAgICBhcnIubGVuZ3RoID0gMDtcblxuICAgIE9iamVjdC5kZWxpdmVyQ2hhbmdlUmVjb3JkcyhjYWxsYmFjayk7XG4gICAgaWYgKHJlY29yZHMubGVuZ3RoICE9PSA1KVxuICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgaWYgKHJlY29yZHNbMF0udHlwZSAhPSAnYWRkJyB8fFxuICAgICAgICByZWNvcmRzWzFdLnR5cGUgIT0gJ3VwZGF0ZScgfHxcbiAgICAgICAgcmVjb3Jkc1syXS50eXBlICE9ICdkZWxldGUnIHx8XG4gICAgICAgIHJlY29yZHNbM10udHlwZSAhPSAnc3BsaWNlJyB8fFxuICAgICAgICByZWNvcmRzWzRdLnR5cGUgIT0gJ3NwbGljZScpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBPYmplY3QudW5vYnNlcnZlKHRlc3QsIGNhbGxiYWNrKTtcbiAgICBBcnJheS51bm9ic2VydmUoYXJyLCBjYWxsYmFjayk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHZhciBoYXNPYnNlcnZlID0gZGV0ZWN0T2JqZWN0T2JzZXJ2ZSgpO1xuXG4gIGZ1bmN0aW9uIGRldGVjdEV2YWwoKSB7XG4gICAgLy8gRG9uJ3QgdGVzdCBmb3IgZXZhbCBpZiB3ZSdyZSBydW5uaW5nIGluIGEgQ2hyb21lIEFwcCBlbnZpcm9ubWVudC5cbiAgICAvLyBXZSBjaGVjayBmb3IgQVBJcyBzZXQgdGhhdCBvbmx5IGV4aXN0IGluIGEgQ2hyb21lIEFwcCBjb250ZXh0LlxuICAgIGlmICh0eXBlb2YgY2hyb21lICE9PSAndW5kZWZpbmVkJyAmJiBjaHJvbWUuYXBwICYmIGNocm9tZS5hcHAucnVudGltZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIEZpcmVmb3ggT1MgQXBwcyBkbyBub3QgYWxsb3cgZXZhbC4gVGhpcyBmZWF0dXJlIGRldGVjdGlvbiBpcyB2ZXJ5IGhhY2t5XG4gICAgLy8gYnV0IGV2ZW4gaWYgc29tZSBvdGhlciBwbGF0Zm9ybSBhZGRzIHN1cHBvcnQgZm9yIHRoaXMgZnVuY3Rpb24gdGhpcyBjb2RlXG4gICAgLy8gd2lsbCBjb250aW51ZSB0byB3b3JrLlxuICAgIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9ICd1bmRlZmluZWQnICYmIG5hdmlnYXRvci5nZXREZXZpY2VTdG9yYWdlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHZhciBmID0gbmV3IEZ1bmN0aW9uKCcnLCAncmV0dXJuIHRydWU7Jyk7XG4gICAgICByZXR1cm4gZigpO1xuICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgdmFyIGhhc0V2YWwgPSBkZXRlY3RFdmFsKCk7XG5cbiAgZnVuY3Rpb24gaXNJbmRleChzKSB7XG4gICAgcmV0dXJuICtzID09PSBzID4+PiAwICYmIHMgIT09ICcnO1xuICB9XG5cbiAgZnVuY3Rpb24gdG9OdW1iZXIocykge1xuICAgIHJldHVybiArcztcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzT2JqZWN0KG9iaikge1xuICAgIHJldHVybiBvYmogPT09IE9iamVjdChvYmopO1xuICB9XG5cbiAgdmFyIG51bWJlcklzTmFOID0gZ2xvYmFsLk51bWJlci5pc05hTiB8fCBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIGdsb2JhbC5pc05hTih2YWx1ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBhcmVTYW1lVmFsdWUobGVmdCwgcmlnaHQpIHtcbiAgICBpZiAobGVmdCA9PT0gcmlnaHQpXG4gICAgICByZXR1cm4gbGVmdCAhPT0gMCB8fCAxIC8gbGVmdCA9PT0gMSAvIHJpZ2h0O1xuICAgIGlmIChudW1iZXJJc05hTihsZWZ0KSAmJiBudW1iZXJJc05hTihyaWdodCkpXG4gICAgICByZXR1cm4gdHJ1ZTtcblxuICAgIHJldHVybiBsZWZ0ICE9PSBsZWZ0ICYmIHJpZ2h0ICE9PSByaWdodDtcbiAgfVxuXG4gIHZhciBjcmVhdGVPYmplY3QgPSAoJ19fcHJvdG9fXycgaW4ge30pID9cbiAgICBmdW5jdGlvbihvYmopIHsgcmV0dXJuIG9iajsgfSA6XG4gICAgZnVuY3Rpb24ob2JqKSB7XG4gICAgICB2YXIgcHJvdG8gPSBvYmouX19wcm90b19fO1xuICAgICAgaWYgKCFwcm90bylcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIHZhciBuZXdPYmplY3QgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9iaikuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShuZXdPYmplY3QsIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqLCBuYW1lKSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBuZXdPYmplY3Q7XG4gICAgfTtcblxuICB2YXIgaWRlbnRTdGFydCA9ICdbXFwkX2EtekEtWl0nO1xuICB2YXIgaWRlbnRQYXJ0ID0gJ1tcXCRfYS16QS1aMC05XSc7XG4gIHZhciBpZGVudFJlZ0V4cCA9IG5ldyBSZWdFeHAoJ14nICsgaWRlbnRTdGFydCArICcrJyArIGlkZW50UGFydCArICcqJyArICckJyk7XG5cbiAgZnVuY3Rpb24gZ2V0UGF0aENoYXJUeXBlKGNoYXIpIHtcbiAgICBpZiAoY2hhciA9PT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuICdlb2YnO1xuXG4gICAgdmFyIGNvZGUgPSBjaGFyLmNoYXJDb2RlQXQoMCk7XG5cbiAgICBzd2l0Y2goY29kZSkge1xuICAgICAgY2FzZSAweDVCOiAvLyBbXG4gICAgICBjYXNlIDB4NUQ6IC8vIF1cbiAgICAgIGNhc2UgMHgyRTogLy8gLlxuICAgICAgY2FzZSAweDIyOiAvLyBcIlxuICAgICAgY2FzZSAweDI3OiAvLyAnXG4gICAgICBjYXNlIDB4MzA6IC8vIDBcbiAgICAgICAgcmV0dXJuIGNoYXI7XG5cbiAgICAgIGNhc2UgMHg1RjogLy8gX1xuICAgICAgY2FzZSAweDI0OiAvLyAkXG4gICAgICAgIHJldHVybiAnaWRlbnQnO1xuXG4gICAgICBjYXNlIDB4MjA6IC8vIFNwYWNlXG4gICAgICBjYXNlIDB4MDk6IC8vIFRhYlxuICAgICAgY2FzZSAweDBBOiAvLyBOZXdsaW5lXG4gICAgICBjYXNlIDB4MEQ6IC8vIFJldHVyblxuICAgICAgY2FzZSAweEEwOiAgLy8gTm8tYnJlYWsgc3BhY2VcbiAgICAgIGNhc2UgMHhGRUZGOiAgLy8gQnl0ZSBPcmRlciBNYXJrXG4gICAgICBjYXNlIDB4MjAyODogIC8vIExpbmUgU2VwYXJhdG9yXG4gICAgICBjYXNlIDB4MjAyOTogIC8vIFBhcmFncmFwaCBTZXBhcmF0b3JcbiAgICAgICAgcmV0dXJuICd3cyc7XG4gICAgfVxuXG4gICAgLy8gYS16LCBBLVpcbiAgICBpZiAoKDB4NjEgPD0gY29kZSAmJiBjb2RlIDw9IDB4N0EpIHx8ICgweDQxIDw9IGNvZGUgJiYgY29kZSA8PSAweDVBKSlcbiAgICAgIHJldHVybiAnaWRlbnQnO1xuXG4gICAgLy8gMS05XG4gICAgaWYgKDB4MzEgPD0gY29kZSAmJiBjb2RlIDw9IDB4MzkpXG4gICAgICByZXR1cm4gJ251bWJlcic7XG5cbiAgICByZXR1cm4gJ2Vsc2UnO1xuICB9XG5cbiAgdmFyIHBhdGhTdGF0ZU1hY2hpbmUgPSB7XG4gICAgJ2JlZm9yZVBhdGgnOiB7XG4gICAgICAnd3MnOiBbJ2JlZm9yZVBhdGgnXSxcbiAgICAgICdpZGVudCc6IFsnaW5JZGVudCcsICdhcHBlbmQnXSxcbiAgICAgICdbJzogWydiZWZvcmVFbGVtZW50J10sXG4gICAgICAnZW9mJzogWydhZnRlclBhdGgnXVxuICAgIH0sXG5cbiAgICAnaW5QYXRoJzoge1xuICAgICAgJ3dzJzogWydpblBhdGgnXSxcbiAgICAgICcuJzogWydiZWZvcmVJZGVudCddLFxuICAgICAgJ1snOiBbJ2JlZm9yZUVsZW1lbnQnXSxcbiAgICAgICdlb2YnOiBbJ2FmdGVyUGF0aCddXG4gICAgfSxcblxuICAgICdiZWZvcmVJZGVudCc6IHtcbiAgICAgICd3cyc6IFsnYmVmb3JlSWRlbnQnXSxcbiAgICAgICdpZGVudCc6IFsnaW5JZGVudCcsICdhcHBlbmQnXVxuICAgIH0sXG5cbiAgICAnaW5JZGVudCc6IHtcbiAgICAgICdpZGVudCc6IFsnaW5JZGVudCcsICdhcHBlbmQnXSxcbiAgICAgICcwJzogWydpbklkZW50JywgJ2FwcGVuZCddLFxuICAgICAgJ251bWJlcic6IFsnaW5JZGVudCcsICdhcHBlbmQnXSxcbiAgICAgICd3cyc6IFsnaW5QYXRoJywgJ3B1c2gnXSxcbiAgICAgICcuJzogWydiZWZvcmVJZGVudCcsICdwdXNoJ10sXG4gICAgICAnWyc6IFsnYmVmb3JlRWxlbWVudCcsICdwdXNoJ10sXG4gICAgICAnZW9mJzogWydhZnRlclBhdGgnLCAncHVzaCddXG4gICAgfSxcblxuICAgICdiZWZvcmVFbGVtZW50Jzoge1xuICAgICAgJ3dzJzogWydiZWZvcmVFbGVtZW50J10sXG4gICAgICAnMCc6IFsnYWZ0ZXJaZXJvJywgJ2FwcGVuZCddLFxuICAgICAgJ251bWJlcic6IFsnaW5JbmRleCcsICdhcHBlbmQnXSxcbiAgICAgIFwiJ1wiOiBbJ2luU2luZ2xlUXVvdGUnLCAnYXBwZW5kJywgJyddLFxuICAgICAgJ1wiJzogWydpbkRvdWJsZVF1b3RlJywgJ2FwcGVuZCcsICcnXVxuICAgIH0sXG5cbiAgICAnYWZ0ZXJaZXJvJzoge1xuICAgICAgJ3dzJzogWydhZnRlckVsZW1lbnQnLCAncHVzaCddLFxuICAgICAgJ10nOiBbJ2luUGF0aCcsICdwdXNoJ11cbiAgICB9LFxuXG4gICAgJ2luSW5kZXgnOiB7XG4gICAgICAnMCc6IFsnaW5JbmRleCcsICdhcHBlbmQnXSxcbiAgICAgICdudW1iZXInOiBbJ2luSW5kZXgnLCAnYXBwZW5kJ10sXG4gICAgICAnd3MnOiBbJ2FmdGVyRWxlbWVudCddLFxuICAgICAgJ10nOiBbJ2luUGF0aCcsICdwdXNoJ11cbiAgICB9LFxuXG4gICAgJ2luU2luZ2xlUXVvdGUnOiB7XG4gICAgICBcIidcIjogWydhZnRlckVsZW1lbnQnXSxcbiAgICAgICdlb2YnOiBbJ2Vycm9yJ10sXG4gICAgICAnZWxzZSc6IFsnaW5TaW5nbGVRdW90ZScsICdhcHBlbmQnXVxuICAgIH0sXG5cbiAgICAnaW5Eb3VibGVRdW90ZSc6IHtcbiAgICAgICdcIic6IFsnYWZ0ZXJFbGVtZW50J10sXG4gICAgICAnZW9mJzogWydlcnJvciddLFxuICAgICAgJ2Vsc2UnOiBbJ2luRG91YmxlUXVvdGUnLCAnYXBwZW5kJ11cbiAgICB9LFxuXG4gICAgJ2FmdGVyRWxlbWVudCc6IHtcbiAgICAgICd3cyc6IFsnYWZ0ZXJFbGVtZW50J10sXG4gICAgICAnXSc6IFsnaW5QYXRoJywgJ3B1c2gnXVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG5vb3AoKSB7fVxuXG4gIGZ1bmN0aW9uIHBhcnNlUGF0aChwYXRoKSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICB2YXIgaW5kZXggPSAtMTtcbiAgICB2YXIgYywgbmV3Q2hhciwga2V5LCB0eXBlLCB0cmFuc2l0aW9uLCBhY3Rpb24sIHR5cGVNYXAsIG1vZGUgPSAnYmVmb3JlUGF0aCc7XG5cbiAgICB2YXIgYWN0aW9ucyA9IHtcbiAgICAgIHB1c2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoa2V5ID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGtleXMucHVzaChrZXkpO1xuICAgICAgICBrZXkgPSB1bmRlZmluZWQ7XG4gICAgICB9LFxuXG4gICAgICBhcHBlbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoa2V5ID09PSB1bmRlZmluZWQpXG4gICAgICAgICAga2V5ID0gbmV3Q2hhclxuICAgICAgICBlbHNlXG4gICAgICAgICAga2V5ICs9IG5ld0NoYXI7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIG1heWJlVW5lc2NhcGVRdW90ZSgpIHtcbiAgICAgIGlmIChpbmRleCA+PSBwYXRoLmxlbmd0aClcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICB2YXIgbmV4dENoYXIgPSBwYXRoW2luZGV4ICsgMV07XG4gICAgICBpZiAoKG1vZGUgPT0gJ2luU2luZ2xlUXVvdGUnICYmIG5leHRDaGFyID09IFwiJ1wiKSB8fFxuICAgICAgICAgIChtb2RlID09ICdpbkRvdWJsZVF1b3RlJyAmJiBuZXh0Q2hhciA9PSAnXCInKSkge1xuICAgICAgICBpbmRleCsrO1xuICAgICAgICBuZXdDaGFyID0gbmV4dENoYXI7XG4gICAgICAgIGFjdGlvbnMuYXBwZW5kKCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHdoaWxlIChtb2RlKSB7XG4gICAgICBpbmRleCsrO1xuICAgICAgYyA9IHBhdGhbaW5kZXhdO1xuXG4gICAgICBpZiAoYyA9PSAnXFxcXCcgJiYgbWF5YmVVbmVzY2FwZVF1b3RlKG1vZGUpKVxuICAgICAgICBjb250aW51ZTtcblxuICAgICAgdHlwZSA9IGdldFBhdGhDaGFyVHlwZShjKTtcbiAgICAgIHR5cGVNYXAgPSBwYXRoU3RhdGVNYWNoaW5lW21vZGVdO1xuICAgICAgdHJhbnNpdGlvbiA9IHR5cGVNYXBbdHlwZV0gfHwgdHlwZU1hcFsnZWxzZSddIHx8ICdlcnJvcic7XG5cbiAgICAgIGlmICh0cmFuc2l0aW9uID09ICdlcnJvcicpXG4gICAgICAgIHJldHVybjsgLy8gcGFyc2UgZXJyb3I7XG5cbiAgICAgIG1vZGUgPSB0cmFuc2l0aW9uWzBdO1xuICAgICAgYWN0aW9uID0gYWN0aW9uc1t0cmFuc2l0aW9uWzFdXSB8fCBub29wO1xuICAgICAgbmV3Q2hhciA9IHRyYW5zaXRpb25bMl0gPT09IHVuZGVmaW5lZCA/IGMgOiB0cmFuc2l0aW9uWzJdO1xuICAgICAgYWN0aW9uKCk7XG5cbiAgICAgIGlmIChtb2RlID09PSAnYWZ0ZXJQYXRoJykge1xuICAgICAgICByZXR1cm4ga2V5cztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm47IC8vIHBhcnNlIGVycm9yXG4gIH1cblxuICBmdW5jdGlvbiBpc0lkZW50KHMpIHtcbiAgICByZXR1cm4gaWRlbnRSZWdFeHAudGVzdChzKTtcbiAgfVxuXG4gIHZhciBjb25zdHJ1Y3RvcklzUHJpdmF0ZSA9IHt9O1xuXG4gIGZ1bmN0aW9uIFBhdGgocGFydHMsIHByaXZhdGVUb2tlbikge1xuICAgIGlmIChwcml2YXRlVG9rZW4gIT09IGNvbnN0cnVjdG9ySXNQcml2YXRlKVxuICAgICAgdGhyb3cgRXJyb3IoJ1VzZSBQYXRoLmdldCB0byByZXRyaWV2ZSBwYXRoIG9iamVjdHMnKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMucHVzaChTdHJpbmcocGFydHNbaV0pKTtcbiAgICB9XG5cbiAgICBpZiAoaGFzRXZhbCAmJiB0aGlzLmxlbmd0aCkge1xuICAgICAgdGhpcy5nZXRWYWx1ZUZyb20gPSB0aGlzLmNvbXBpbGVkR2V0VmFsdWVGcm9tRm4oKTtcbiAgICB9XG4gIH1cblxuICAvLyBUT0RPKHJhZmFlbHcpOiBNYWtlIHNpbXBsZSBMUlUgY2FjaGVcbiAgdmFyIHBhdGhDYWNoZSA9IHt9O1xuXG4gIGZ1bmN0aW9uIGdldFBhdGgocGF0aFN0cmluZykge1xuICAgIGlmIChwYXRoU3RyaW5nIGluc3RhbmNlb2YgUGF0aClcbiAgICAgIHJldHVybiBwYXRoU3RyaW5nO1xuXG4gICAgaWYgKHBhdGhTdHJpbmcgPT0gbnVsbCB8fCBwYXRoU3RyaW5nLmxlbmd0aCA9PSAwKVxuICAgICAgcGF0aFN0cmluZyA9ICcnO1xuXG4gICAgaWYgKHR5cGVvZiBwYXRoU3RyaW5nICE9ICdzdHJpbmcnKSB7XG4gICAgICBpZiAoaXNJbmRleChwYXRoU3RyaW5nLmxlbmd0aCkpIHtcbiAgICAgICAgLy8gQ29uc3RydWN0ZWQgd2l0aCBhcnJheS1saWtlIChwcmUtcGFyc2VkKSBrZXlzXG4gICAgICAgIHJldHVybiBuZXcgUGF0aChwYXRoU3RyaW5nLCBjb25zdHJ1Y3RvcklzUHJpdmF0ZSk7XG4gICAgICB9XG5cbiAgICAgIHBhdGhTdHJpbmcgPSBTdHJpbmcocGF0aFN0cmluZyk7XG4gICAgfVxuXG4gICAgdmFyIHBhdGggPSBwYXRoQ2FjaGVbcGF0aFN0cmluZ107XG4gICAgaWYgKHBhdGgpXG4gICAgICByZXR1cm4gcGF0aDtcblxuICAgIHZhciBwYXJ0cyA9IHBhcnNlUGF0aChwYXRoU3RyaW5nKTtcbiAgICBpZiAoIXBhcnRzKVxuICAgICAgcmV0dXJuIGludmFsaWRQYXRoO1xuXG4gICAgdmFyIHBhdGggPSBuZXcgUGF0aChwYXJ0cywgY29uc3RydWN0b3JJc1ByaXZhdGUpO1xuICAgIHBhdGhDYWNoZVtwYXRoU3RyaW5nXSA9IHBhdGg7XG4gICAgcmV0dXJuIHBhdGg7XG4gIH1cblxuICBQYXRoLmdldCA9IGdldFBhdGg7XG5cbiAgZnVuY3Rpb24gZm9ybWF0QWNjZXNzb3Ioa2V5KSB7XG4gICAgaWYgKGlzSW5kZXgoa2V5KSkge1xuICAgICAgcmV0dXJuICdbJyArIGtleSArICddJztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICdbXCInICsga2V5LnJlcGxhY2UoL1wiL2csICdcXFxcXCInKSArICdcIl0nO1xuICAgIH1cbiAgfVxuXG4gIFBhdGgucHJvdG90eXBlID0gY3JlYXRlT2JqZWN0KHtcbiAgICBfX3Byb3RvX186IFtdLFxuICAgIHZhbGlkOiB0cnVlLFxuXG4gICAgdG9TdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHBhdGhTdHJpbmcgPSAnJztcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIga2V5ID0gdGhpc1tpXTtcbiAgICAgICAgaWYgKGlzSWRlbnQoa2V5KSkge1xuICAgICAgICAgIHBhdGhTdHJpbmcgKz0gaSA/ICcuJyArIGtleSA6IGtleTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYXRoU3RyaW5nICs9IGZvcm1hdEFjY2Vzc29yKGtleSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBhdGhTdHJpbmc7XG4gICAgfSxcblxuICAgIGdldFZhbHVlRnJvbTogZnVuY3Rpb24ob2JqLCBkaXJlY3RPYnNlcnZlcikge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChvYmogPT0gbnVsbClcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIG9iaiA9IG9ialt0aGlzW2ldXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfSxcblxuICAgIGl0ZXJhdGVPYmplY3RzOiBmdW5jdGlvbihvYmosIG9ic2VydmUpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoaSlcbiAgICAgICAgICBvYmogPSBvYmpbdGhpc1tpIC0gMV1dO1xuICAgICAgICBpZiAoIWlzT2JqZWN0KG9iaikpXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICBvYnNlcnZlKG9iaiwgdGhpc1tpXSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBpbGVkR2V0VmFsdWVGcm9tRm46IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHN0ciA9ICcnO1xuICAgICAgdmFyIHBhdGhTdHJpbmcgPSAnb2JqJztcbiAgICAgIHN0ciArPSAnaWYgKG9iaiAhPSBudWxsJztcbiAgICAgIHZhciBpID0gMDtcbiAgICAgIHZhciBrZXk7XG4gICAgICBmb3IgKDsgaSA8ICh0aGlzLmxlbmd0aCAtIDEpOyBpKyspIHtcbiAgICAgICAga2V5ID0gdGhpc1tpXTtcbiAgICAgICAgcGF0aFN0cmluZyArPSBpc0lkZW50KGtleSkgPyAnLicgKyBrZXkgOiBmb3JtYXRBY2Nlc3NvcihrZXkpO1xuICAgICAgICBzdHIgKz0gJyAmJlxcbiAgICAgJyArIHBhdGhTdHJpbmcgKyAnICE9IG51bGwnO1xuICAgICAgfVxuICAgICAgc3RyICs9ICcpXFxuJztcblxuICAgICAgdmFyIGtleSA9IHRoaXNbaV07XG4gICAgICBwYXRoU3RyaW5nICs9IGlzSWRlbnQoa2V5KSA/ICcuJyArIGtleSA6IGZvcm1hdEFjY2Vzc29yKGtleSk7XG5cbiAgICAgIHN0ciArPSAnICByZXR1cm4gJyArIHBhdGhTdHJpbmcgKyAnO1xcbmVsc2VcXG4gIHJldHVybiB1bmRlZmluZWQ7JztcbiAgICAgIHJldHVybiBuZXcgRnVuY3Rpb24oJ29iaicsIHN0cik7XG4gICAgfSxcblxuICAgIHNldFZhbHVlRnJvbTogZnVuY3Rpb24ob2JqLCB2YWx1ZSkge1xuICAgICAgaWYgKCF0aGlzLmxlbmd0aClcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgIGlmICghaXNPYmplY3Qob2JqKSlcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIG9iaiA9IG9ialt0aGlzW2ldXTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc09iamVjdChvYmopKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgIG9ialt0aGlzW2ldXSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9KTtcblxuICB2YXIgaW52YWxpZFBhdGggPSBuZXcgUGF0aCgnJywgY29uc3RydWN0b3JJc1ByaXZhdGUpO1xuICBpbnZhbGlkUGF0aC52YWxpZCA9IGZhbHNlO1xuICBpbnZhbGlkUGF0aC5nZXRWYWx1ZUZyb20gPSBpbnZhbGlkUGF0aC5zZXRWYWx1ZUZyb20gPSBmdW5jdGlvbigpIHt9O1xuXG4gIHZhciBNQVhfRElSVFlfQ0hFQ0tfQ1lDTEVTID0gMTAwMDtcblxuICBmdW5jdGlvbiBkaXJ0eUNoZWNrKG9ic2VydmVyKSB7XG4gICAgdmFyIGN5Y2xlcyA9IDA7XG4gICAgd2hpbGUgKGN5Y2xlcyA8IE1BWF9ESVJUWV9DSEVDS19DWUNMRVMgJiYgb2JzZXJ2ZXIuY2hlY2tfKCkpIHtcbiAgICAgIGN5Y2xlcysrO1xuICAgIH1cbiAgICBpZiAodGVzdGluZ0V4cG9zZUN5Y2xlQ291bnQpXG4gICAgICBnbG9iYWwuZGlydHlDaGVja0N5Y2xlQ291bnQgPSBjeWNsZXM7XG5cbiAgICByZXR1cm4gY3ljbGVzID4gMDtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9iamVjdElzRW1wdHkob2JqZWN0KSB7XG4gICAgZm9yICh2YXIgcHJvcCBpbiBvYmplY3QpXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBmdW5jdGlvbiBkaWZmSXNFbXB0eShkaWZmKSB7XG4gICAgcmV0dXJuIG9iamVjdElzRW1wdHkoZGlmZi5hZGRlZCkgJiZcbiAgICAgICAgICAgb2JqZWN0SXNFbXB0eShkaWZmLnJlbW92ZWQpICYmXG4gICAgICAgICAgIG9iamVjdElzRW1wdHkoZGlmZi5jaGFuZ2VkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRpZmZPYmplY3RGcm9tT2xkT2JqZWN0KG9iamVjdCwgb2xkT2JqZWN0KSB7XG4gICAgdmFyIGFkZGVkID0ge307XG4gICAgdmFyIHJlbW92ZWQgPSB7fTtcbiAgICB2YXIgY2hhbmdlZCA9IHt9O1xuXG4gICAgZm9yICh2YXIgcHJvcCBpbiBvbGRPYmplY3QpIHtcbiAgICAgIHZhciBuZXdWYWx1ZSA9IG9iamVjdFtwcm9wXTtcblxuICAgICAgaWYgKG5ld1ZhbHVlICE9PSB1bmRlZmluZWQgJiYgbmV3VmFsdWUgPT09IG9sZE9iamVjdFtwcm9wXSlcbiAgICAgICAgY29udGludWU7XG5cbiAgICAgIGlmICghKHByb3AgaW4gb2JqZWN0KSkge1xuICAgICAgICByZW1vdmVkW3Byb3BdID0gdW5kZWZpbmVkO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKG5ld1ZhbHVlICE9PSBvbGRPYmplY3RbcHJvcF0pXG4gICAgICAgIGNoYW5nZWRbcHJvcF0gPSBuZXdWYWx1ZTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBwcm9wIGluIG9iamVjdCkge1xuICAgICAgaWYgKHByb3AgaW4gb2xkT2JqZWN0KVxuICAgICAgICBjb250aW51ZTtcblxuICAgICAgYWRkZWRbcHJvcF0gPSBvYmplY3RbcHJvcF07XG4gICAgfVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkob2JqZWN0KSAmJiBvYmplY3QubGVuZ3RoICE9PSBvbGRPYmplY3QubGVuZ3RoKVxuICAgICAgY2hhbmdlZC5sZW5ndGggPSBvYmplY3QubGVuZ3RoO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGFkZGVkOiBhZGRlZCxcbiAgICAgIHJlbW92ZWQ6IHJlbW92ZWQsXG4gICAgICBjaGFuZ2VkOiBjaGFuZ2VkXG4gICAgfTtcbiAgfVxuXG4gIHZhciBlb21UYXNrcyA9IFtdO1xuICBmdW5jdGlvbiBydW5FT01UYXNrcygpIHtcbiAgICBpZiAoIWVvbVRhc2tzLmxlbmd0aClcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZW9tVGFza3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGVvbVRhc2tzW2ldKCk7XG4gICAgfVxuICAgIGVvbVRhc2tzLmxlbmd0aCA9IDA7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICB2YXIgcnVuRU9NID0gaGFzT2JzZXJ2ZSA/IChmdW5jdGlvbigpe1xuICAgIHJldHVybiBmdW5jdGlvbihmbikge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZm4pO1xuICAgIH1cbiAgfSkoKSA6XG4gIChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZm4pIHtcbiAgICAgIGVvbVRhc2tzLnB1c2goZm4pO1xuICAgIH07XG4gIH0pKCk7XG5cbiAgdmFyIG9ic2VydmVkT2JqZWN0Q2FjaGUgPSBbXTtcblxuICBmdW5jdGlvbiBuZXdPYnNlcnZlZE9iamVjdCgpIHtcbiAgICB2YXIgb2JzZXJ2ZXI7XG4gICAgdmFyIG9iamVjdDtcbiAgICB2YXIgZGlzY2FyZFJlY29yZHMgPSBmYWxzZTtcbiAgICB2YXIgZmlyc3QgPSB0cnVlO1xuXG4gICAgZnVuY3Rpb24gY2FsbGJhY2socmVjb3Jkcykge1xuICAgICAgaWYgKG9ic2VydmVyICYmIG9ic2VydmVyLnN0YXRlXyA9PT0gT1BFTkVEICYmICFkaXNjYXJkUmVjb3JkcylcbiAgICAgICAgb2JzZXJ2ZXIuY2hlY2tfKHJlY29yZHMpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBvcGVuOiBmdW5jdGlvbihvYnMpIHtcbiAgICAgICAgaWYgKG9ic2VydmVyKVxuICAgICAgICAgIHRocm93IEVycm9yKCdPYnNlcnZlZE9iamVjdCBpbiB1c2UnKTtcblxuICAgICAgICBpZiAoIWZpcnN0KVxuICAgICAgICAgIE9iamVjdC5kZWxpdmVyQ2hhbmdlUmVjb3JkcyhjYWxsYmFjayk7XG5cbiAgICAgICAgb2JzZXJ2ZXIgPSBvYnM7XG4gICAgICAgIGZpcnN0ID0gZmFsc2U7XG4gICAgICB9LFxuICAgICAgb2JzZXJ2ZTogZnVuY3Rpb24ob2JqLCBhcnJheU9ic2VydmUpIHtcbiAgICAgICAgb2JqZWN0ID0gb2JqO1xuICAgICAgICBpZiAoYXJyYXlPYnNlcnZlKVxuICAgICAgICAgIEFycmF5Lm9ic2VydmUob2JqZWN0LCBjYWxsYmFjayk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBPYmplY3Qub2JzZXJ2ZShvYmplY3QsIGNhbGxiYWNrKTtcbiAgICAgIH0sXG4gICAgICBkZWxpdmVyOiBmdW5jdGlvbihkaXNjYXJkKSB7XG4gICAgICAgIGRpc2NhcmRSZWNvcmRzID0gZGlzY2FyZDtcbiAgICAgICAgT2JqZWN0LmRlbGl2ZXJDaGFuZ2VSZWNvcmRzKGNhbGxiYWNrKTtcbiAgICAgICAgZGlzY2FyZFJlY29yZHMgPSBmYWxzZTtcbiAgICAgIH0sXG4gICAgICBjbG9zZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIG9ic2VydmVyID0gdW5kZWZpbmVkO1xuICAgICAgICBPYmplY3QudW5vYnNlcnZlKG9iamVjdCwgY2FsbGJhY2spO1xuICAgICAgICBvYnNlcnZlZE9iamVjdENhY2hlLnB1c2godGhpcyk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qXG4gICAqIFRoZSBvYnNlcnZlZFNldCBhYnN0cmFjdGlvbiBpcyBhIHBlcmYgb3B0aW1pemF0aW9uIHdoaWNoIHJlZHVjZXMgdGhlIHRvdGFsXG4gICAqIG51bWJlciBvZiBPYmplY3Qub2JzZXJ2ZSBvYnNlcnZhdGlvbnMgb2YgYSBzZXQgb2Ygb2JqZWN0cy4gVGhlIGlkZWEgaXMgdGhhdFxuICAgKiBncm91cHMgb2YgT2JzZXJ2ZXJzIHdpbGwgaGF2ZSBzb21lIG9iamVjdCBkZXBlbmRlbmNpZXMgaW4gY29tbW9uIGFuZCB0aGlzXG4gICAqIG9ic2VydmVkIHNldCBlbnN1cmVzIHRoYXQgZWFjaCBvYmplY3QgaW4gdGhlIHRyYW5zaXRpdmUgY2xvc3VyZSBvZlxuICAgKiBkZXBlbmRlbmNpZXMgaXMgb25seSBvYnNlcnZlZCBvbmNlLiBUaGUgb2JzZXJ2ZWRTZXQgYWN0cyBhcyBhIHdyaXRlIGJhcnJpZXJcbiAgICogc3VjaCB0aGF0IHdoZW5ldmVyIGFueSBjaGFuZ2UgY29tZXMgdGhyb3VnaCwgYWxsIE9ic2VydmVycyBhcmUgY2hlY2tlZCBmb3JcbiAgICogY2hhbmdlZCB2YWx1ZXMuXG4gICAqXG4gICAqIE5vdGUgdGhhdCB0aGlzIG9wdGltaXphdGlvbiBpcyBleHBsaWNpdGx5IG1vdmluZyB3b3JrIGZyb20gc2V0dXAtdGltZSB0b1xuICAgKiBjaGFuZ2UtdGltZS5cbiAgICpcbiAgICogVE9ETyhyYWZhZWx3KTogSW1wbGVtZW50IFwiZ2FyYmFnZSBjb2xsZWN0aW9uXCIuIEluIG9yZGVyIHRvIG1vdmUgd29yayBvZmZcbiAgICogdGhlIGNyaXRpY2FsIHBhdGgsIHdoZW4gT2JzZXJ2ZXJzIGFyZSBjbG9zZWQsIHRoZWlyIG9ic2VydmVkIG9iamVjdHMgYXJlXG4gICAqIG5vdCBPYmplY3QudW5vYnNlcnZlKGQpLiBBcyBhIHJlc3VsdCwgaXQncyBwb3NzaWJsZSB0aGF0IGlmIHRoZSBvYnNlcnZlZFNldFxuICAgKiBpcyBrZXB0IG9wZW4sIGJ1dCBzb21lIE9ic2VydmVycyBoYXZlIGJlZW4gY2xvc2VkLCBpdCBjb3VsZCBjYXVzZSBcImxlYWtzXCJcbiAgICogKHByZXZlbnQgb3RoZXJ3aXNlIGNvbGxlY3RhYmxlIG9iamVjdHMgZnJvbSBiZWluZyBjb2xsZWN0ZWQpLiBBdCBzb21lXG4gICAqIHBvaW50LCB3ZSBzaG91bGQgaW1wbGVtZW50IGluY3JlbWVudGFsIFwiZ2NcIiB3aGljaCBrZWVwcyBhIGxpc3Qgb2ZcbiAgICogb2JzZXJ2ZWRTZXRzIHdoaWNoIG1heSBuZWVkIGNsZWFuLXVwIGFuZCBkb2VzIHNtYWxsIGFtb3VudHMgb2YgY2xlYW51cCBvbiBhXG4gICAqIHRpbWVvdXQgdW50aWwgYWxsIGlzIGNsZWFuLlxuICAgKi9cblxuICBmdW5jdGlvbiBnZXRPYnNlcnZlZE9iamVjdChvYnNlcnZlciwgb2JqZWN0LCBhcnJheU9ic2VydmUpIHtcbiAgICB2YXIgZGlyID0gb2JzZXJ2ZWRPYmplY3RDYWNoZS5wb3AoKSB8fCBuZXdPYnNlcnZlZE9iamVjdCgpO1xuICAgIGRpci5vcGVuKG9ic2VydmVyKTtcbiAgICBkaXIub2JzZXJ2ZShvYmplY3QsIGFycmF5T2JzZXJ2ZSk7XG4gICAgcmV0dXJuIGRpcjtcbiAgfVxuXG4gIHZhciBvYnNlcnZlZFNldENhY2hlID0gW107XG5cbiAgZnVuY3Rpb24gbmV3T2JzZXJ2ZWRTZXQoKSB7XG4gICAgdmFyIG9ic2VydmVyQ291bnQgPSAwO1xuICAgIHZhciBvYnNlcnZlcnMgPSBbXTtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIHZhciByb290T2JqO1xuICAgIHZhciByb290T2JqUHJvcHM7XG5cbiAgICBmdW5jdGlvbiBvYnNlcnZlKG9iaiwgcHJvcCkge1xuICAgICAgaWYgKCFvYmopXG4gICAgICAgIHJldHVybjtcblxuICAgICAgaWYgKG9iaiA9PT0gcm9vdE9iailcbiAgICAgICAgcm9vdE9ialByb3BzW3Byb3BdID0gdHJ1ZTtcblxuICAgICAgaWYgKG9iamVjdHMuaW5kZXhPZihvYmopIDwgMCkge1xuICAgICAgICBvYmplY3RzLnB1c2gob2JqKTtcbiAgICAgICAgT2JqZWN0Lm9ic2VydmUob2JqLCBjYWxsYmFjayk7XG4gICAgICB9XG5cbiAgICAgIG9ic2VydmUoT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaiksIHByb3ApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFsbFJvb3RPYmpOb25PYnNlcnZlZFByb3BzKHJlY3MpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVjcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcmVjID0gcmVjc1tpXTtcbiAgICAgICAgaWYgKHJlYy5vYmplY3QgIT09IHJvb3RPYmogfHxcbiAgICAgICAgICAgIHJvb3RPYmpQcm9wc1tyZWMubmFtZV0gfHxcbiAgICAgICAgICAgIHJlYy50eXBlID09PSAnc2V0UHJvdG90eXBlJykge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FsbGJhY2socmVjcykge1xuICAgICAgaWYgKGFsbFJvb3RPYmpOb25PYnNlcnZlZFByb3BzKHJlY3MpKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIHZhciBvYnNlcnZlcjtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb2JzZXJ2ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG9ic2VydmVyID0gb2JzZXJ2ZXJzW2ldO1xuICAgICAgICBpZiAob2JzZXJ2ZXIuc3RhdGVfID09IE9QRU5FRCkge1xuICAgICAgICAgIG9ic2VydmVyLml0ZXJhdGVPYmplY3RzXyhvYnNlcnZlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9ic2VydmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBvYnNlcnZlciA9IG9ic2VydmVyc1tpXTtcbiAgICAgICAgaWYgKG9ic2VydmVyLnN0YXRlXyA9PSBPUEVORUQpIHtcbiAgICAgICAgICBvYnNlcnZlci5jaGVja18oKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciByZWNvcmQgPSB7XG4gICAgICBvYmplY3RzOiBvYmplY3RzLFxuICAgICAgZ2V0IHJvb3RPYmplY3QoKSB7IHJldHVybiByb290T2JqOyB9LFxuICAgICAgc2V0IHJvb3RPYmplY3QodmFsdWUpIHtcbiAgICAgICAgcm9vdE9iaiA9IHZhbHVlO1xuICAgICAgICByb290T2JqUHJvcHMgPSB7fTtcbiAgICAgIH0sXG4gICAgICBvcGVuOiBmdW5jdGlvbihvYnMsIG9iamVjdCkge1xuICAgICAgICBvYnNlcnZlcnMucHVzaChvYnMpO1xuICAgICAgICBvYnNlcnZlckNvdW50Kys7XG4gICAgICAgIG9icy5pdGVyYXRlT2JqZWN0c18ob2JzZXJ2ZSk7XG4gICAgICB9LFxuICAgICAgY2xvc2U6IGZ1bmN0aW9uKG9icykge1xuICAgICAgICBvYnNlcnZlckNvdW50LS07XG4gICAgICAgIGlmIChvYnNlcnZlckNvdW50ID4gMCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb2JqZWN0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIE9iamVjdC51bm9ic2VydmUob2JqZWN0c1tpXSwgY2FsbGJhY2spO1xuICAgICAgICAgIE9ic2VydmVyLnVub2JzZXJ2ZWRDb3VudCsrO1xuICAgICAgICB9XG5cbiAgICAgICAgb2JzZXJ2ZXJzLmxlbmd0aCA9IDA7XG4gICAgICAgIG9iamVjdHMubGVuZ3RoID0gMDtcbiAgICAgICAgcm9vdE9iaiA9IHVuZGVmaW5lZDtcbiAgICAgICAgcm9vdE9ialByb3BzID0gdW5kZWZpbmVkO1xuICAgICAgICBvYnNlcnZlZFNldENhY2hlLnB1c2godGhpcyk7XG4gICAgICAgIGlmIChsYXN0T2JzZXJ2ZWRTZXQgPT09IHRoaXMpXG4gICAgICAgICAgbGFzdE9ic2VydmVkU2V0ID0gbnVsbDtcbiAgICAgIH0sXG4gICAgfTtcblxuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cblxuICB2YXIgbGFzdE9ic2VydmVkU2V0O1xuXG4gIGZ1bmN0aW9uIGdldE9ic2VydmVkU2V0KG9ic2VydmVyLCBvYmopIHtcbiAgICBpZiAoIWxhc3RPYnNlcnZlZFNldCB8fCBsYXN0T2JzZXJ2ZWRTZXQucm9vdE9iamVjdCAhPT0gb2JqKSB7XG4gICAgICBsYXN0T2JzZXJ2ZWRTZXQgPSBvYnNlcnZlZFNldENhY2hlLnBvcCgpIHx8IG5ld09ic2VydmVkU2V0KCk7XG4gICAgICBsYXN0T2JzZXJ2ZWRTZXQucm9vdE9iamVjdCA9IG9iajtcbiAgICB9XG4gICAgbGFzdE9ic2VydmVkU2V0Lm9wZW4ob2JzZXJ2ZXIsIG9iaik7XG4gICAgcmV0dXJuIGxhc3RPYnNlcnZlZFNldDtcbiAgfVxuXG4gIHZhciBVTk9QRU5FRCA9IDA7XG4gIHZhciBPUEVORUQgPSAxO1xuICB2YXIgQ0xPU0VEID0gMjtcbiAgdmFyIFJFU0VUVElORyA9IDM7XG5cbiAgdmFyIG5leHRPYnNlcnZlcklkID0gMTtcblxuICBmdW5jdGlvbiBPYnNlcnZlcigpIHtcbiAgICB0aGlzLnN0YXRlXyA9IFVOT1BFTkVEO1xuICAgIHRoaXMuY2FsbGJhY2tfID0gdW5kZWZpbmVkO1xuICAgIHRoaXMudGFyZ2V0XyA9IHVuZGVmaW5lZDsgLy8gVE9ETyhyYWZhZWx3KTogU2hvdWxkIGJlIFdlYWtSZWZcbiAgICB0aGlzLmRpcmVjdE9ic2VydmVyXyA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnZhbHVlXyA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmlkXyA9IG5leHRPYnNlcnZlcklkKys7XG4gIH1cblxuICBPYnNlcnZlci5wcm90b3R5cGUgPSB7XG4gICAgb3BlbjogZnVuY3Rpb24oY2FsbGJhY2ssIHRhcmdldCkge1xuICAgICAgaWYgKHRoaXMuc3RhdGVfICE9IFVOT1BFTkVEKVxuICAgICAgICB0aHJvdyBFcnJvcignT2JzZXJ2ZXIgaGFzIGFscmVhZHkgYmVlbiBvcGVuZWQuJyk7XG5cbiAgICAgIGFkZFRvQWxsKHRoaXMpO1xuICAgICAgdGhpcy5jYWxsYmFja18gPSBjYWxsYmFjaztcbiAgICAgIHRoaXMudGFyZ2V0XyA9IHRhcmdldDtcbiAgICAgIHRoaXMuY29ubmVjdF8oKTtcbiAgICAgIHRoaXMuc3RhdGVfID0gT1BFTkVEO1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWVfO1xuICAgIH0sXG5cbiAgICBjbG9zZTogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZV8gIT0gT1BFTkVEKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIHJlbW92ZUZyb21BbGwodGhpcyk7XG4gICAgICB0aGlzLmRpc2Nvbm5lY3RfKCk7XG4gICAgICB0aGlzLnZhbHVlXyA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuY2FsbGJhY2tfID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy50YXJnZXRfID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5zdGF0ZV8gPSBDTE9TRUQ7XG4gICAgfSxcblxuICAgIGRlbGl2ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuc3RhdGVfICE9IE9QRU5FRClcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICBkaXJ0eUNoZWNrKHRoaXMpO1xuICAgIH0sXG5cbiAgICByZXBvcnRfOiBmdW5jdGlvbihjaGFuZ2VzKSB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLmNhbGxiYWNrXy5hcHBseSh0aGlzLnRhcmdldF8sIGNoYW5nZXMpO1xuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgT2JzZXJ2ZXIuX2Vycm9yVGhyb3duRHVyaW5nQ2FsbGJhY2sgPSB0cnVlO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFeGNlcHRpb24gY2F1Z2h0IGR1cmluZyBvYnNlcnZlciBjYWxsYmFjazogJyArXG4gICAgICAgICAgICAgICAgICAgICAgIChleC5zdGFjayB8fCBleCkpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBkaXNjYXJkQ2hhbmdlczogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmNoZWNrXyh1bmRlZmluZWQsIHRydWUpO1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWVfO1xuICAgIH1cbiAgfVxuXG4gIHZhciBjb2xsZWN0T2JzZXJ2ZXJzID0gIWhhc09ic2VydmU7XG4gIHZhciBhbGxPYnNlcnZlcnM7XG4gIE9ic2VydmVyLl9hbGxPYnNlcnZlcnNDb3VudCA9IDA7XG5cbiAgaWYgKGNvbGxlY3RPYnNlcnZlcnMpIHtcbiAgICBhbGxPYnNlcnZlcnMgPSBbXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFRvQWxsKG9ic2VydmVyKSB7XG4gICAgT2JzZXJ2ZXIuX2FsbE9ic2VydmVyc0NvdW50Kys7XG4gICAgaWYgKCFjb2xsZWN0T2JzZXJ2ZXJzKVxuICAgICAgcmV0dXJuO1xuXG4gICAgYWxsT2JzZXJ2ZXJzLnB1c2gob2JzZXJ2ZXIpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlRnJvbUFsbChvYnNlcnZlcikge1xuICAgIE9ic2VydmVyLl9hbGxPYnNlcnZlcnNDb3VudC0tO1xuICB9XG5cbiAgdmFyIHJ1bm5pbmdNaWNyb3Rhc2tDaGVja3BvaW50ID0gZmFsc2U7XG5cbiAgZ2xvYmFsLlBsYXRmb3JtID0gZ2xvYmFsLlBsYXRmb3JtIHx8IHt9O1xuXG4gIGdsb2JhbC5QbGF0Zm9ybS5wZXJmb3JtTWljcm90YXNrQ2hlY2twb2ludCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChydW5uaW5nTWljcm90YXNrQ2hlY2twb2ludClcbiAgICAgIHJldHVybjtcblxuICAgIGlmICghY29sbGVjdE9ic2VydmVycylcbiAgICAgIHJldHVybjtcblxuICAgIHJ1bm5pbmdNaWNyb3Rhc2tDaGVja3BvaW50ID0gdHJ1ZTtcblxuICAgIHZhciBjeWNsZXMgPSAwO1xuICAgIHZhciBhbnlDaGFuZ2VkLCB0b0NoZWNrO1xuXG4gICAgZG8ge1xuICAgICAgY3ljbGVzKys7XG4gICAgICB0b0NoZWNrID0gYWxsT2JzZXJ2ZXJzO1xuICAgICAgYWxsT2JzZXJ2ZXJzID0gW107XG4gICAgICBhbnlDaGFuZ2VkID0gZmFsc2U7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG9DaGVjay5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgb2JzZXJ2ZXIgPSB0b0NoZWNrW2ldO1xuICAgICAgICBpZiAob2JzZXJ2ZXIuc3RhdGVfICE9IE9QRU5FRClcbiAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICBpZiAob2JzZXJ2ZXIuY2hlY2tfKCkpXG4gICAgICAgICAgYW55Q2hhbmdlZCA9IHRydWU7XG5cbiAgICAgICAgYWxsT2JzZXJ2ZXJzLnB1c2gob2JzZXJ2ZXIpO1xuICAgICAgfVxuICAgICAgaWYgKHJ1bkVPTVRhc2tzKCkpXG4gICAgICAgIGFueUNoYW5nZWQgPSB0cnVlO1xuICAgIH0gd2hpbGUgKGN5Y2xlcyA8IE1BWF9ESVJUWV9DSEVDS19DWUNMRVMgJiYgYW55Q2hhbmdlZCk7XG5cbiAgICBpZiAodGVzdGluZ0V4cG9zZUN5Y2xlQ291bnQpXG4gICAgICBnbG9iYWwuZGlydHlDaGVja0N5Y2xlQ291bnQgPSBjeWNsZXM7XG5cbiAgICBydW5uaW5nTWljcm90YXNrQ2hlY2twb2ludCA9IGZhbHNlO1xuICB9O1xuXG4gIGlmIChjb2xsZWN0T2JzZXJ2ZXJzKSB7XG4gICAgZ2xvYmFsLlBsYXRmb3JtLmNsZWFyT2JzZXJ2ZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgICBhbGxPYnNlcnZlcnMgPSBbXTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gT2JqZWN0T2JzZXJ2ZXIob2JqZWN0KSB7XG4gICAgT2JzZXJ2ZXIuY2FsbCh0aGlzKTtcbiAgICB0aGlzLnZhbHVlXyA9IG9iamVjdDtcbiAgICB0aGlzLm9sZE9iamVjdF8gPSB1bmRlZmluZWQ7XG4gIH1cblxuICBPYmplY3RPYnNlcnZlci5wcm90b3R5cGUgPSBjcmVhdGVPYmplY3Qoe1xuICAgIF9fcHJvdG9fXzogT2JzZXJ2ZXIucHJvdG90eXBlLFxuXG4gICAgYXJyYXlPYnNlcnZlOiBmYWxzZSxcblxuICAgIGNvbm5lY3RfOiBmdW5jdGlvbihjYWxsYmFjaywgdGFyZ2V0KSB7XG4gICAgICBpZiAoaGFzT2JzZXJ2ZSkge1xuICAgICAgICB0aGlzLmRpcmVjdE9ic2VydmVyXyA9IGdldE9ic2VydmVkT2JqZWN0KHRoaXMsIHRoaXMudmFsdWVfLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYXJyYXlPYnNlcnZlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMub2xkT2JqZWN0XyA9IHRoaXMuY29weU9iamVjdCh0aGlzLnZhbHVlXyk7XG4gICAgICB9XG5cbiAgICB9LFxuXG4gICAgY29weU9iamVjdDogZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgICB2YXIgY29weSA9IEFycmF5LmlzQXJyYXkob2JqZWN0KSA/IFtdIDoge307XG4gICAgICBmb3IgKHZhciBwcm9wIGluIG9iamVjdCkge1xuICAgICAgICBjb3B5W3Byb3BdID0gb2JqZWN0W3Byb3BdO1xuICAgICAgfTtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KG9iamVjdCkpXG4gICAgICAgIGNvcHkubGVuZ3RoID0gb2JqZWN0Lmxlbmd0aDtcbiAgICAgIHJldHVybiBjb3B5O1xuICAgIH0sXG5cbiAgICBjaGVja186IGZ1bmN0aW9uKGNoYW5nZVJlY29yZHMsIHNraXBDaGFuZ2VzKSB7XG4gICAgICB2YXIgZGlmZjtcbiAgICAgIHZhciBvbGRWYWx1ZXM7XG4gICAgICBpZiAoaGFzT2JzZXJ2ZSkge1xuICAgICAgICBpZiAoIWNoYW5nZVJlY29yZHMpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIG9sZFZhbHVlcyA9IHt9O1xuICAgICAgICBkaWZmID0gZGlmZk9iamVjdEZyb21DaGFuZ2VSZWNvcmRzKHRoaXMudmFsdWVfLCBjaGFuZ2VSZWNvcmRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sZFZhbHVlcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvbGRWYWx1ZXMgPSB0aGlzLm9sZE9iamVjdF87XG4gICAgICAgIGRpZmYgPSBkaWZmT2JqZWN0RnJvbU9sZE9iamVjdCh0aGlzLnZhbHVlXywgdGhpcy5vbGRPYmplY3RfKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRpZmZJc0VtcHR5KGRpZmYpKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgIGlmICghaGFzT2JzZXJ2ZSlcbiAgICAgICAgdGhpcy5vbGRPYmplY3RfID0gdGhpcy5jb3B5T2JqZWN0KHRoaXMudmFsdWVfKTtcblxuICAgICAgdGhpcy5yZXBvcnRfKFtcbiAgICAgICAgZGlmZi5hZGRlZCB8fCB7fSxcbiAgICAgICAgZGlmZi5yZW1vdmVkIHx8IHt9LFxuICAgICAgICBkaWZmLmNoYW5nZWQgfHwge30sXG4gICAgICAgIGZ1bmN0aW9uKHByb3BlcnR5KSB7XG4gICAgICAgICAgcmV0dXJuIG9sZFZhbHVlc1twcm9wZXJ0eV07XG4gICAgICAgIH1cbiAgICAgIF0pO1xuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgZGlzY29ubmVjdF86IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGhhc09ic2VydmUpIHtcbiAgICAgICAgdGhpcy5kaXJlY3RPYnNlcnZlcl8uY2xvc2UoKTtcbiAgICAgICAgdGhpcy5kaXJlY3RPYnNlcnZlcl8gPSB1bmRlZmluZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm9sZE9iamVjdF8gPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGRlbGl2ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuc3RhdGVfICE9IE9QRU5FRClcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICBpZiAoaGFzT2JzZXJ2ZSlcbiAgICAgICAgdGhpcy5kaXJlY3RPYnNlcnZlcl8uZGVsaXZlcihmYWxzZSk7XG4gICAgICBlbHNlXG4gICAgICAgIGRpcnR5Q2hlY2sodGhpcyk7XG4gICAgfSxcblxuICAgIGRpc2NhcmRDaGFuZ2VzOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLmRpcmVjdE9ic2VydmVyXylcbiAgICAgICAgdGhpcy5kaXJlY3RPYnNlcnZlcl8uZGVsaXZlcih0cnVlKTtcbiAgICAgIGVsc2VcbiAgICAgICAgdGhpcy5vbGRPYmplY3RfID0gdGhpcy5jb3B5T2JqZWN0KHRoaXMudmFsdWVfKTtcblxuICAgICAgcmV0dXJuIHRoaXMudmFsdWVfO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gQXJyYXlPYnNlcnZlcihhcnJheSkge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShhcnJheSkpXG4gICAgICB0aHJvdyBFcnJvcignUHJvdmlkZWQgb2JqZWN0IGlzIG5vdCBhbiBBcnJheScpO1xuICAgIE9iamVjdE9ic2VydmVyLmNhbGwodGhpcywgYXJyYXkpO1xuICB9XG5cbiAgQXJyYXlPYnNlcnZlci5wcm90b3R5cGUgPSBjcmVhdGVPYmplY3Qoe1xuXG4gICAgX19wcm90b19fOiBPYmplY3RPYnNlcnZlci5wcm90b3R5cGUsXG5cbiAgICBhcnJheU9ic2VydmU6IHRydWUsXG5cbiAgICBjb3B5T2JqZWN0OiBmdW5jdGlvbihhcnIpIHtcbiAgICAgIHJldHVybiBhcnIuc2xpY2UoKTtcbiAgICB9LFxuXG4gICAgY2hlY2tfOiBmdW5jdGlvbihjaGFuZ2VSZWNvcmRzKSB7XG4gICAgICB2YXIgc3BsaWNlcztcbiAgICAgIGlmIChoYXNPYnNlcnZlKSB7XG4gICAgICAgIGlmICghY2hhbmdlUmVjb3JkcylcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIHNwbGljZXMgPSBwcm9qZWN0QXJyYXlTcGxpY2VzKHRoaXMudmFsdWVfLCBjaGFuZ2VSZWNvcmRzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNwbGljZXMgPSBjYWxjU3BsaWNlcyh0aGlzLnZhbHVlXywgMCwgdGhpcy52YWx1ZV8ubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRPYmplY3RfLCAwLCB0aGlzLm9sZE9iamVjdF8ubGVuZ3RoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFzcGxpY2VzIHx8ICFzcGxpY2VzLmxlbmd0aClcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICBpZiAoIWhhc09ic2VydmUpXG4gICAgICAgIHRoaXMub2xkT2JqZWN0XyA9IHRoaXMuY29weU9iamVjdCh0aGlzLnZhbHVlXyk7XG5cbiAgICAgIHRoaXMucmVwb3J0Xyhbc3BsaWNlc10pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9KTtcblxuICBBcnJheU9ic2VydmVyLmFwcGx5U3BsaWNlcyA9IGZ1bmN0aW9uKHByZXZpb3VzLCBjdXJyZW50LCBzcGxpY2VzKSB7XG4gICAgc3BsaWNlcy5mb3JFYWNoKGZ1bmN0aW9uKHNwbGljZSkge1xuICAgICAgdmFyIHNwbGljZUFyZ3MgPSBbc3BsaWNlLmluZGV4LCBzcGxpY2UucmVtb3ZlZC5sZW5ndGhdO1xuICAgICAgdmFyIGFkZEluZGV4ID0gc3BsaWNlLmluZGV4O1xuICAgICAgd2hpbGUgKGFkZEluZGV4IDwgc3BsaWNlLmluZGV4ICsgc3BsaWNlLmFkZGVkQ291bnQpIHtcbiAgICAgICAgc3BsaWNlQXJncy5wdXNoKGN1cnJlbnRbYWRkSW5kZXhdKTtcbiAgICAgICAgYWRkSW5kZXgrKztcbiAgICAgIH1cblxuICAgICAgQXJyYXkucHJvdG90eXBlLnNwbGljZS5hcHBseShwcmV2aW91cywgc3BsaWNlQXJncyk7XG4gICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gUGF0aE9ic2VydmVyKG9iamVjdCwgcGF0aCkge1xuICAgIE9ic2VydmVyLmNhbGwodGhpcyk7XG5cbiAgICB0aGlzLm9iamVjdF8gPSBvYmplY3Q7XG4gICAgdGhpcy5wYXRoXyA9IGdldFBhdGgocGF0aCk7XG4gICAgdGhpcy5kaXJlY3RPYnNlcnZlcl8gPSB1bmRlZmluZWQ7XG4gIH1cblxuICBQYXRoT2JzZXJ2ZXIucHJvdG90eXBlID0gY3JlYXRlT2JqZWN0KHtcbiAgICBfX3Byb3RvX186IE9ic2VydmVyLnByb3RvdHlwZSxcblxuICAgIGdldCBwYXRoKCkge1xuICAgICAgcmV0dXJuIHRoaXMucGF0aF87XG4gICAgfSxcblxuICAgIGNvbm5lY3RfOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChoYXNPYnNlcnZlKVxuICAgICAgICB0aGlzLmRpcmVjdE9ic2VydmVyXyA9IGdldE9ic2VydmVkU2V0KHRoaXMsIHRoaXMub2JqZWN0Xyk7XG5cbiAgICAgIHRoaXMuY2hlY2tfKHVuZGVmaW5lZCwgdHJ1ZSk7XG4gICAgfSxcblxuICAgIGRpc2Nvbm5lY3RfOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMudmFsdWVfID0gdW5kZWZpbmVkO1xuXG4gICAgICBpZiAodGhpcy5kaXJlY3RPYnNlcnZlcl8pIHtcbiAgICAgICAgdGhpcy5kaXJlY3RPYnNlcnZlcl8uY2xvc2UodGhpcyk7XG4gICAgICAgIHRoaXMuZGlyZWN0T2JzZXJ2ZXJfID0gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBpdGVyYXRlT2JqZWN0c186IGZ1bmN0aW9uKG9ic2VydmUpIHtcbiAgICAgIHRoaXMucGF0aF8uaXRlcmF0ZU9iamVjdHModGhpcy5vYmplY3RfLCBvYnNlcnZlKTtcbiAgICB9LFxuXG4gICAgY2hlY2tfOiBmdW5jdGlvbihjaGFuZ2VSZWNvcmRzLCBza2lwQ2hhbmdlcykge1xuICAgICAgdmFyIG9sZFZhbHVlID0gdGhpcy52YWx1ZV87XG4gICAgICB0aGlzLnZhbHVlXyA9IHRoaXMucGF0aF8uZ2V0VmFsdWVGcm9tKHRoaXMub2JqZWN0Xyk7XG4gICAgICBpZiAoc2tpcENoYW5nZXMgfHwgYXJlU2FtZVZhbHVlKHRoaXMudmFsdWVfLCBvbGRWYWx1ZSkpXG4gICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgdGhpcy5yZXBvcnRfKFt0aGlzLnZhbHVlXywgb2xkVmFsdWUsIHRoaXNdKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICBzZXRWYWx1ZTogZnVuY3Rpb24obmV3VmFsdWUpIHtcbiAgICAgIGlmICh0aGlzLnBhdGhfKVxuICAgICAgICB0aGlzLnBhdGhfLnNldFZhbHVlRnJvbSh0aGlzLm9iamVjdF8sIG5ld1ZhbHVlKTtcbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIENvbXBvdW5kT2JzZXJ2ZXIocmVwb3J0Q2hhbmdlc09uT3Blbikge1xuICAgIE9ic2VydmVyLmNhbGwodGhpcyk7XG5cbiAgICB0aGlzLnJlcG9ydENoYW5nZXNPbk9wZW5fID0gcmVwb3J0Q2hhbmdlc09uT3BlbjtcbiAgICB0aGlzLnZhbHVlXyA9IFtdO1xuICAgIHRoaXMuZGlyZWN0T2JzZXJ2ZXJfID0gdW5kZWZpbmVkO1xuICAgIHRoaXMub2JzZXJ2ZWRfID0gW107XG4gIH1cblxuICB2YXIgb2JzZXJ2ZXJTZW50aW5lbCA9IHt9O1xuXG4gIENvbXBvdW5kT2JzZXJ2ZXIucHJvdG90eXBlID0gY3JlYXRlT2JqZWN0KHtcbiAgICBfX3Byb3RvX186IE9ic2VydmVyLnByb3RvdHlwZSxcblxuICAgIGNvbm5lY3RfOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChoYXNPYnNlcnZlKSB7XG4gICAgICAgIHZhciBvYmplY3Q7XG4gICAgICAgIHZhciBuZWVkc0RpcmVjdE9ic2VydmVyID0gZmFsc2U7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5vYnNlcnZlZF8ubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgICBvYmplY3QgPSB0aGlzLm9ic2VydmVkX1tpXVxuICAgICAgICAgIGlmIChvYmplY3QgIT09IG9ic2VydmVyU2VudGluZWwpIHtcbiAgICAgICAgICAgIG5lZWRzRGlyZWN0T2JzZXJ2ZXIgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5lZWRzRGlyZWN0T2JzZXJ2ZXIpXG4gICAgICAgICAgdGhpcy5kaXJlY3RPYnNlcnZlcl8gPSBnZXRPYnNlcnZlZFNldCh0aGlzLCBvYmplY3QpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNoZWNrXyh1bmRlZmluZWQsICF0aGlzLnJlcG9ydENoYW5nZXNPbk9wZW5fKTtcbiAgICB9LFxuXG4gICAgZGlzY29ubmVjdF86IGZ1bmN0aW9uKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm9ic2VydmVkXy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICBpZiAodGhpcy5vYnNlcnZlZF9baV0gPT09IG9ic2VydmVyU2VudGluZWwpXG4gICAgICAgICAgdGhpcy5vYnNlcnZlZF9baSArIDFdLmNsb3NlKCk7XG4gICAgICB9XG4gICAgICB0aGlzLm9ic2VydmVkXy5sZW5ndGggPSAwO1xuICAgICAgdGhpcy52YWx1ZV8ubGVuZ3RoID0gMDtcblxuICAgICAgaWYgKHRoaXMuZGlyZWN0T2JzZXJ2ZXJfKSB7XG4gICAgICAgIHRoaXMuZGlyZWN0T2JzZXJ2ZXJfLmNsb3NlKHRoaXMpO1xuICAgICAgICB0aGlzLmRpcmVjdE9ic2VydmVyXyA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgYWRkUGF0aDogZnVuY3Rpb24ob2JqZWN0LCBwYXRoKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZV8gIT0gVU5PUEVORUQgJiYgdGhpcy5zdGF0ZV8gIT0gUkVTRVRUSU5HKVxuICAgICAgICB0aHJvdyBFcnJvcignQ2Fubm90IGFkZCBwYXRocyBvbmNlIHN0YXJ0ZWQuJyk7XG5cbiAgICAgIHZhciBwYXRoID0gZ2V0UGF0aChwYXRoKTtcbiAgICAgIHRoaXMub2JzZXJ2ZWRfLnB1c2gob2JqZWN0LCBwYXRoKTtcbiAgICAgIGlmICghdGhpcy5yZXBvcnRDaGFuZ2VzT25PcGVuXylcbiAgICAgICAgcmV0dXJuO1xuICAgICAgdmFyIGluZGV4ID0gdGhpcy5vYnNlcnZlZF8ubGVuZ3RoIC8gMiAtIDE7XG4gICAgICB0aGlzLnZhbHVlX1tpbmRleF0gPSBwYXRoLmdldFZhbHVlRnJvbShvYmplY3QpO1xuICAgIH0sXG5cbiAgICBhZGRPYnNlcnZlcjogZnVuY3Rpb24ob2JzZXJ2ZXIpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlXyAhPSBVTk9QRU5FRCAmJiB0aGlzLnN0YXRlXyAhPSBSRVNFVFRJTkcpXG4gICAgICAgIHRocm93IEVycm9yKCdDYW5ub3QgYWRkIG9ic2VydmVycyBvbmNlIHN0YXJ0ZWQuJyk7XG5cbiAgICAgIHRoaXMub2JzZXJ2ZWRfLnB1c2gob2JzZXJ2ZXJTZW50aW5lbCwgb2JzZXJ2ZXIpO1xuICAgICAgaWYgKCF0aGlzLnJlcG9ydENoYW5nZXNPbk9wZW5fKVxuICAgICAgICByZXR1cm47XG4gICAgICB2YXIgaW5kZXggPSB0aGlzLm9ic2VydmVkXy5sZW5ndGggLyAyIC0gMTtcbiAgICAgIHRoaXMudmFsdWVfW2luZGV4XSA9IG9ic2VydmVyLm9wZW4odGhpcy5kZWxpdmVyLCB0aGlzKTtcbiAgICB9LFxuXG4gICAgc3RhcnRSZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZV8gIT0gT1BFTkVEKVxuICAgICAgICB0aHJvdyBFcnJvcignQ2FuIG9ubHkgcmVzZXQgd2hpbGUgb3BlbicpO1xuXG4gICAgICB0aGlzLnN0YXRlXyA9IFJFU0VUVElORztcbiAgICAgIHRoaXMuZGlzY29ubmVjdF8oKTtcbiAgICB9LFxuXG4gICAgZmluaXNoUmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuc3RhdGVfICE9IFJFU0VUVElORylcbiAgICAgICAgdGhyb3cgRXJyb3IoJ0NhbiBvbmx5IGZpbmlzaFJlc2V0IGFmdGVyIHN0YXJ0UmVzZXQnKTtcbiAgICAgIHRoaXMuc3RhdGVfID0gT1BFTkVEO1xuICAgICAgdGhpcy5jb25uZWN0XygpO1xuXG4gICAgICByZXR1cm4gdGhpcy52YWx1ZV87XG4gICAgfSxcblxuICAgIGl0ZXJhdGVPYmplY3RzXzogZnVuY3Rpb24ob2JzZXJ2ZSkge1xuICAgICAgdmFyIG9iamVjdDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5vYnNlcnZlZF8ubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgb2JqZWN0ID0gdGhpcy5vYnNlcnZlZF9baV1cbiAgICAgICAgaWYgKG9iamVjdCAhPT0gb2JzZXJ2ZXJTZW50aW5lbClcbiAgICAgICAgICB0aGlzLm9ic2VydmVkX1tpICsgMV0uaXRlcmF0ZU9iamVjdHMob2JqZWN0LCBvYnNlcnZlKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBjaGVja186IGZ1bmN0aW9uKGNoYW5nZVJlY29yZHMsIHNraXBDaGFuZ2VzKSB7XG4gICAgICB2YXIgb2xkVmFsdWVzO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm9ic2VydmVkXy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICB2YXIgb2JqZWN0ID0gdGhpcy5vYnNlcnZlZF9baV07XG4gICAgICAgIHZhciBwYXRoID0gdGhpcy5vYnNlcnZlZF9baSsxXTtcbiAgICAgICAgdmFyIHZhbHVlO1xuICAgICAgICBpZiAob2JqZWN0ID09PSBvYnNlcnZlclNlbnRpbmVsKSB7XG4gICAgICAgICAgdmFyIG9ic2VydmFibGUgPSBwYXRoO1xuICAgICAgICAgIHZhbHVlID0gdGhpcy5zdGF0ZV8gPT09IFVOT1BFTkVEID9cbiAgICAgICAgICAgICAgb2JzZXJ2YWJsZS5vcGVuKHRoaXMuZGVsaXZlciwgdGhpcykgOlxuICAgICAgICAgICAgICBvYnNlcnZhYmxlLmRpc2NhcmRDaGFuZ2VzKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsdWUgPSBwYXRoLmdldFZhbHVlRnJvbShvYmplY3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNraXBDaGFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy52YWx1ZV9baSAvIDJdID0gdmFsdWU7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYXJlU2FtZVZhbHVlKHZhbHVlLCB0aGlzLnZhbHVlX1tpIC8gMl0pKVxuICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgIG9sZFZhbHVlcyA9IG9sZFZhbHVlcyB8fCBbXTtcbiAgICAgICAgb2xkVmFsdWVzW2kgLyAyXSA9IHRoaXMudmFsdWVfW2kgLyAyXTtcbiAgICAgICAgdGhpcy52YWx1ZV9baSAvIDJdID0gdmFsdWU7XG4gICAgICB9XG5cbiAgICAgIGlmICghb2xkVmFsdWVzKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgIC8vIFRPRE8ocmFmYWVsdyk6IEhhdmluZyBvYnNlcnZlZF8gYXMgdGhlIHRoaXJkIGNhbGxiYWNrIGFyZyBoZXJlIGlzXG4gICAgICAvLyBwcmV0dHkgbGFtZSBBUEkuIEZpeC5cbiAgICAgIHRoaXMucmVwb3J0XyhbdGhpcy52YWx1ZV8sIG9sZFZhbHVlcywgdGhpcy5vYnNlcnZlZF9dKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gaWRlbnRGbih2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH1cblxuICBmdW5jdGlvbiBPYnNlcnZlclRyYW5zZm9ybShvYnNlcnZhYmxlLCBnZXRWYWx1ZUZuLCBzZXRWYWx1ZUZuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb250UGFzc1Rocm91Z2hTZXQpIHtcbiAgICB0aGlzLmNhbGxiYWNrXyA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnRhcmdldF8gPSB1bmRlZmluZWQ7XG4gICAgdGhpcy52YWx1ZV8gPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5vYnNlcnZhYmxlXyA9IG9ic2VydmFibGU7XG4gICAgdGhpcy5nZXRWYWx1ZUZuXyA9IGdldFZhbHVlRm4gfHwgaWRlbnRGbjtcbiAgICB0aGlzLnNldFZhbHVlRm5fID0gc2V0VmFsdWVGbiB8fCBpZGVudEZuO1xuICAgIC8vIFRPRE8ocmFmYWVsdyk6IFRoaXMgaXMgYSB0ZW1wb3JhcnkgaGFjay4gUG9seW1lckV4cHJlc3Npb25zIG5lZWRzIHRoaXNcbiAgICAvLyBhdCB0aGUgbW9tZW50IGJlY2F1c2Ugb2YgYSBidWcgaW4gaXQncyBkZXBlbmRlbmN5IHRyYWNraW5nLlxuICAgIHRoaXMuZG9udFBhc3NUaHJvdWdoU2V0XyA9IGRvbnRQYXNzVGhyb3VnaFNldDtcbiAgfVxuXG4gIE9ic2VydmVyVHJhbnNmb3JtLnByb3RvdHlwZSA9IHtcbiAgICBvcGVuOiBmdW5jdGlvbihjYWxsYmFjaywgdGFyZ2V0KSB7XG4gICAgICB0aGlzLmNhbGxiYWNrXyA9IGNhbGxiYWNrO1xuICAgICAgdGhpcy50YXJnZXRfID0gdGFyZ2V0O1xuICAgICAgdGhpcy52YWx1ZV8gPVxuICAgICAgICAgIHRoaXMuZ2V0VmFsdWVGbl8odGhpcy5vYnNlcnZhYmxlXy5vcGVuKHRoaXMub2JzZXJ2ZWRDYWxsYmFja18sIHRoaXMpKTtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlXztcbiAgICB9LFxuXG4gICAgb2JzZXJ2ZWRDYWxsYmFja186IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWVGbl8odmFsdWUpO1xuICAgICAgaWYgKGFyZVNhbWVWYWx1ZSh2YWx1ZSwgdGhpcy52YWx1ZV8pKVxuICAgICAgICByZXR1cm47XG4gICAgICB2YXIgb2xkVmFsdWUgPSB0aGlzLnZhbHVlXztcbiAgICAgIHRoaXMudmFsdWVfID0gdmFsdWU7XG4gICAgICB0aGlzLmNhbGxiYWNrXy5jYWxsKHRoaXMudGFyZ2V0XywgdGhpcy52YWx1ZV8sIG9sZFZhbHVlKTtcbiAgICB9LFxuXG4gICAgZGlzY2FyZENoYW5nZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy52YWx1ZV8gPSB0aGlzLmdldFZhbHVlRm5fKHRoaXMub2JzZXJ2YWJsZV8uZGlzY2FyZENoYW5nZXMoKSk7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZV87XG4gICAgfSxcblxuICAgIGRlbGl2ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMub2JzZXJ2YWJsZV8uZGVsaXZlcigpO1xuICAgIH0sXG5cbiAgICBzZXRWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHZhbHVlID0gdGhpcy5zZXRWYWx1ZUZuXyh2YWx1ZSk7XG4gICAgICBpZiAoIXRoaXMuZG9udFBhc3NUaHJvdWdoU2V0XyAmJiB0aGlzLm9ic2VydmFibGVfLnNldFZhbHVlKVxuICAgICAgICByZXR1cm4gdGhpcy5vYnNlcnZhYmxlXy5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgfSxcblxuICAgIGNsb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLm9ic2VydmFibGVfKVxuICAgICAgICB0aGlzLm9ic2VydmFibGVfLmNsb3NlKCk7XG4gICAgICB0aGlzLmNhbGxiYWNrXyA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMudGFyZ2V0XyA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMub2JzZXJ2YWJsZV8gPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLnZhbHVlXyA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuZ2V0VmFsdWVGbl8gPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLnNldFZhbHVlRm5fID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIHZhciBleHBlY3RlZFJlY29yZFR5cGVzID0ge1xuICAgIGFkZDogdHJ1ZSxcbiAgICB1cGRhdGU6IHRydWUsXG4gICAgZGVsZXRlOiB0cnVlXG4gIH07XG5cbiAgZnVuY3Rpb24gZGlmZk9iamVjdEZyb21DaGFuZ2VSZWNvcmRzKG9iamVjdCwgY2hhbmdlUmVjb3Jkcywgb2xkVmFsdWVzKSB7XG4gICAgdmFyIGFkZGVkID0ge307XG4gICAgdmFyIHJlbW92ZWQgPSB7fTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hhbmdlUmVjb3Jkcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHJlY29yZCA9IGNoYW5nZVJlY29yZHNbaV07XG4gICAgICBpZiAoIWV4cGVjdGVkUmVjb3JkVHlwZXNbcmVjb3JkLnR5cGVdKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1Vua25vd24gY2hhbmdlUmVjb3JkIHR5cGU6ICcgKyByZWNvcmQudHlwZSk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IocmVjb3JkKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmICghKHJlY29yZC5uYW1lIGluIG9sZFZhbHVlcykpXG4gICAgICAgIG9sZFZhbHVlc1tyZWNvcmQubmFtZV0gPSByZWNvcmQub2xkVmFsdWU7XG5cbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PSAndXBkYXRlJylcbiAgICAgICAgY29udGludWU7XG5cbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PSAnYWRkJykge1xuICAgICAgICBpZiAocmVjb3JkLm5hbWUgaW4gcmVtb3ZlZClcbiAgICAgICAgICBkZWxldGUgcmVtb3ZlZFtyZWNvcmQubmFtZV07XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBhZGRlZFtyZWNvcmQubmFtZV0gPSB0cnVlO1xuXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyB0eXBlID0gJ2RlbGV0ZSdcbiAgICAgIGlmIChyZWNvcmQubmFtZSBpbiBhZGRlZCkge1xuICAgICAgICBkZWxldGUgYWRkZWRbcmVjb3JkLm5hbWVdO1xuICAgICAgICBkZWxldGUgb2xkVmFsdWVzW3JlY29yZC5uYW1lXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlbW92ZWRbcmVjb3JkLm5hbWVdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBwcm9wIGluIGFkZGVkKVxuICAgICAgYWRkZWRbcHJvcF0gPSBvYmplY3RbcHJvcF07XG5cbiAgICBmb3IgKHZhciBwcm9wIGluIHJlbW92ZWQpXG4gICAgICByZW1vdmVkW3Byb3BdID0gdW5kZWZpbmVkO1xuXG4gICAgdmFyIGNoYW5nZWQgPSB7fTtcbiAgICBmb3IgKHZhciBwcm9wIGluIG9sZFZhbHVlcykge1xuICAgICAgaWYgKHByb3AgaW4gYWRkZWQgfHwgcHJvcCBpbiByZW1vdmVkKVxuICAgICAgICBjb250aW51ZTtcblxuICAgICAgdmFyIG5ld1ZhbHVlID0gb2JqZWN0W3Byb3BdO1xuICAgICAgaWYgKG9sZFZhbHVlc1twcm9wXSAhPT0gbmV3VmFsdWUpXG4gICAgICAgIGNoYW5nZWRbcHJvcF0gPSBuZXdWYWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgYWRkZWQ6IGFkZGVkLFxuICAgICAgcmVtb3ZlZDogcmVtb3ZlZCxcbiAgICAgIGNoYW5nZWQ6IGNoYW5nZWRcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gbmV3U3BsaWNlKGluZGV4LCByZW1vdmVkLCBhZGRlZENvdW50KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgIHJlbW92ZWQ6IHJlbW92ZWQsXG4gICAgICBhZGRlZENvdW50OiBhZGRlZENvdW50XG4gICAgfTtcbiAgfVxuXG4gIHZhciBFRElUX0xFQVZFID0gMDtcbiAgdmFyIEVESVRfVVBEQVRFID0gMTtcbiAgdmFyIEVESVRfQUREID0gMjtcbiAgdmFyIEVESVRfREVMRVRFID0gMztcblxuICBmdW5jdGlvbiBBcnJheVNwbGljZSgpIHt9XG5cbiAgQXJyYXlTcGxpY2UucHJvdG90eXBlID0ge1xuXG4gICAgLy8gTm90ZTogVGhpcyBmdW5jdGlvbiBpcyAqYmFzZWQqIG9uIHRoZSBjb21wdXRhdGlvbiBvZiB0aGUgTGV2ZW5zaHRlaW5cbiAgICAvLyBcImVkaXRcIiBkaXN0YW5jZS4gVGhlIG9uZSBjaGFuZ2UgaXMgdGhhdCBcInVwZGF0ZXNcIiBhcmUgdHJlYXRlZCBhcyB0d29cbiAgICAvLyBlZGl0cyAtIG5vdCBvbmUuIFdpdGggQXJyYXkgc3BsaWNlcywgYW4gdXBkYXRlIGlzIHJlYWxseSBhIGRlbGV0ZVxuICAgIC8vIGZvbGxvd2VkIGJ5IGFuIGFkZC4gQnkgcmV0YWluaW5nIHRoaXMsIHdlIG9wdGltaXplIGZvciBcImtlZXBpbmdcIiB0aGVcbiAgICAvLyBtYXhpbXVtIGFycmF5IGl0ZW1zIGluIHRoZSBvcmlnaW5hbCBhcnJheS4gRm9yIGV4YW1wbGU6XG4gICAgLy9cbiAgICAvLyAgICd4eHh4MTIzJyAtPiAnMTIzeXl5eSdcbiAgICAvL1xuICAgIC8vIFdpdGggMS1lZGl0IHVwZGF0ZXMsIHRoZSBzaG9ydGVzdCBwYXRoIHdvdWxkIGJlIGp1c3QgdG8gdXBkYXRlIGFsbCBzZXZlblxuICAgIC8vIGNoYXJhY3RlcnMuIFdpdGggMi1lZGl0IHVwZGF0ZXMsIHdlIGRlbGV0ZSA0LCBsZWF2ZSAzLCBhbmQgYWRkIDQuIFRoaXNcbiAgICAvLyBsZWF2ZXMgdGhlIHN1YnN0cmluZyAnMTIzJyBpbnRhY3QuXG4gICAgY2FsY0VkaXREaXN0YW5jZXM6IGZ1bmN0aW9uKGN1cnJlbnQsIGN1cnJlbnRTdGFydCwgY3VycmVudEVuZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkLCBvbGRTdGFydCwgb2xkRW5kKSB7XG4gICAgICAvLyBcIkRlbGV0aW9uXCIgY29sdW1uc1xuICAgICAgdmFyIHJvd0NvdW50ID0gb2xkRW5kIC0gb2xkU3RhcnQgKyAxO1xuICAgICAgdmFyIGNvbHVtbkNvdW50ID0gY3VycmVudEVuZCAtIGN1cnJlbnRTdGFydCArIDE7XG4gICAgICB2YXIgZGlzdGFuY2VzID0gbmV3IEFycmF5KHJvd0NvdW50KTtcblxuICAgICAgLy8gXCJBZGRpdGlvblwiIHJvd3MuIEluaXRpYWxpemUgbnVsbCBjb2x1bW4uXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvd0NvdW50OyBpKyspIHtcbiAgICAgICAgZGlzdGFuY2VzW2ldID0gbmV3IEFycmF5KGNvbHVtbkNvdW50KTtcbiAgICAgICAgZGlzdGFuY2VzW2ldWzBdID0gaTtcbiAgICAgIH1cblxuICAgICAgLy8gSW5pdGlhbGl6ZSBudWxsIHJvd1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBjb2x1bW5Db3VudDsgaisrKVxuICAgICAgICBkaXN0YW5jZXNbMF1bal0gPSBqO1xuXG4gICAgICBmb3IgKHZhciBpID0gMTsgaSA8IHJvd0NvdW50OyBpKyspIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDE7IGogPCBjb2x1bW5Db3VudDsgaisrKSB7XG4gICAgICAgICAgaWYgKHRoaXMuZXF1YWxzKGN1cnJlbnRbY3VycmVudFN0YXJ0ICsgaiAtIDFdLCBvbGRbb2xkU3RhcnQgKyBpIC0gMV0pKVxuICAgICAgICAgICAgZGlzdGFuY2VzW2ldW2pdID0gZGlzdGFuY2VzW2kgLSAxXVtqIC0gMV07XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgbm9ydGggPSBkaXN0YW5jZXNbaSAtIDFdW2pdICsgMTtcbiAgICAgICAgICAgIHZhciB3ZXN0ID0gZGlzdGFuY2VzW2ldW2ogLSAxXSArIDE7XG4gICAgICAgICAgICBkaXN0YW5jZXNbaV1bal0gPSBub3J0aCA8IHdlc3QgPyBub3J0aCA6IHdlc3Q7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkaXN0YW5jZXM7XG4gICAgfSxcblxuICAgIC8vIFRoaXMgc3RhcnRzIGF0IHRoZSBmaW5hbCB3ZWlnaHQsIGFuZCB3YWxrcyBcImJhY2t3YXJkXCIgYnkgZmluZGluZ1xuICAgIC8vIHRoZSBtaW5pbXVtIHByZXZpb3VzIHdlaWdodCByZWN1cnNpdmVseSB1bnRpbCB0aGUgb3JpZ2luIG9mIHRoZSB3ZWlnaHRcbiAgICAvLyBtYXRyaXguXG4gICAgc3BsaWNlT3BlcmF0aW9uc0Zyb21FZGl0RGlzdGFuY2VzOiBmdW5jdGlvbihkaXN0YW5jZXMpIHtcbiAgICAgIHZhciBpID0gZGlzdGFuY2VzLmxlbmd0aCAtIDE7XG4gICAgICB2YXIgaiA9IGRpc3RhbmNlc1swXS5sZW5ndGggLSAxO1xuICAgICAgdmFyIGN1cnJlbnQgPSBkaXN0YW5jZXNbaV1bal07XG4gICAgICB2YXIgZWRpdHMgPSBbXTtcbiAgICAgIHdoaWxlIChpID4gMCB8fCBqID4gMCkge1xuICAgICAgICBpZiAoaSA9PSAwKSB7XG4gICAgICAgICAgZWRpdHMucHVzaChFRElUX0FERCk7XG4gICAgICAgICAgai0tO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChqID09IDApIHtcbiAgICAgICAgICBlZGl0cy5wdXNoKEVESVRfREVMRVRFKTtcbiAgICAgICAgICBpLS07XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5vcnRoV2VzdCA9IGRpc3RhbmNlc1tpIC0gMV1baiAtIDFdO1xuICAgICAgICB2YXIgd2VzdCA9IGRpc3RhbmNlc1tpIC0gMV1bal07XG4gICAgICAgIHZhciBub3J0aCA9IGRpc3RhbmNlc1tpXVtqIC0gMV07XG5cbiAgICAgICAgdmFyIG1pbjtcbiAgICAgICAgaWYgKHdlc3QgPCBub3J0aClcbiAgICAgICAgICBtaW4gPSB3ZXN0IDwgbm9ydGhXZXN0ID8gd2VzdCA6IG5vcnRoV2VzdDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG1pbiA9IG5vcnRoIDwgbm9ydGhXZXN0ID8gbm9ydGggOiBub3J0aFdlc3Q7XG5cbiAgICAgICAgaWYgKG1pbiA9PSBub3J0aFdlc3QpIHtcbiAgICAgICAgICBpZiAobm9ydGhXZXN0ID09IGN1cnJlbnQpIHtcbiAgICAgICAgICAgIGVkaXRzLnB1c2goRURJVF9MRUFWRSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVkaXRzLnB1c2goRURJVF9VUERBVEUpO1xuICAgICAgICAgICAgY3VycmVudCA9IG5vcnRoV2VzdDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaS0tO1xuICAgICAgICAgIGotLTtcbiAgICAgICAgfSBlbHNlIGlmIChtaW4gPT0gd2VzdCkge1xuICAgICAgICAgIGVkaXRzLnB1c2goRURJVF9ERUxFVEUpO1xuICAgICAgICAgIGktLTtcbiAgICAgICAgICBjdXJyZW50ID0gd2VzdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlZGl0cy5wdXNoKEVESVRfQUREKTtcbiAgICAgICAgICBqLS07XG4gICAgICAgICAgY3VycmVudCA9IG5vcnRoO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGVkaXRzLnJldmVyc2UoKTtcbiAgICAgIHJldHVybiBlZGl0cztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3BsaWNlIFByb2plY3Rpb24gZnVuY3Rpb25zOlxuICAgICAqXG4gICAgICogQSBzcGxpY2UgbWFwIGlzIGEgcmVwcmVzZW50YXRpb24gb2YgaG93IGEgcHJldmlvdXMgYXJyYXkgb2YgaXRlbXNcbiAgICAgKiB3YXMgdHJhbnNmb3JtZWQgaW50byBhIG5ldyBhcnJheSBvZiBpdGVtcy4gQ29uY2VwdHVhbGx5IGl0IGlzIGEgbGlzdCBvZlxuICAgICAqIHR1cGxlcyBvZlxuICAgICAqXG4gICAgICogICA8aW5kZXgsIHJlbW92ZWQsIGFkZGVkQ291bnQ+XG4gICAgICpcbiAgICAgKiB3aGljaCBhcmUga2VwdCBpbiBhc2NlbmRpbmcgaW5kZXggb3JkZXIgb2YuIFRoZSB0dXBsZSByZXByZXNlbnRzIHRoYXQgYXRcbiAgICAgKiB0aGUgfGluZGV4fCwgfHJlbW92ZWR8IHNlcXVlbmNlIG9mIGl0ZW1zIHdlcmUgcmVtb3ZlZCwgYW5kIGNvdW50aW5nIGZvcndhcmRcbiAgICAgKiBmcm9tIHxpbmRleHwsIHxhZGRlZENvdW50fCBpdGVtcyB3ZXJlIGFkZGVkLlxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogTGFja2luZyBpbmRpdmlkdWFsIHNwbGljZSBtdXRhdGlvbiBpbmZvcm1hdGlvbiwgdGhlIG1pbmltYWwgc2V0IG9mXG4gICAgICogc3BsaWNlcyBjYW4gYmUgc3ludGhlc2l6ZWQgZ2l2ZW4gdGhlIHByZXZpb3VzIHN0YXRlIGFuZCBmaW5hbCBzdGF0ZSBvZiBhblxuICAgICAqIGFycmF5LiBUaGUgYmFzaWMgYXBwcm9hY2ggaXMgdG8gY2FsY3VsYXRlIHRoZSBlZGl0IGRpc3RhbmNlIG1hdHJpeCBhbmRcbiAgICAgKiBjaG9vc2UgdGhlIHNob3J0ZXN0IHBhdGggdGhyb3VnaCBpdC5cbiAgICAgKlxuICAgICAqIENvbXBsZXhpdHk6IE8obCAqIHApXG4gICAgICogICBsOiBUaGUgbGVuZ3RoIG9mIHRoZSBjdXJyZW50IGFycmF5XG4gICAgICogICBwOiBUaGUgbGVuZ3RoIG9mIHRoZSBvbGQgYXJyYXlcbiAgICAgKi9cbiAgICBjYWxjU3BsaWNlczogZnVuY3Rpb24oY3VycmVudCwgY3VycmVudFN0YXJ0LCBjdXJyZW50RW5kLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbGQsIG9sZFN0YXJ0LCBvbGRFbmQpIHtcbiAgICAgIHZhciBwcmVmaXhDb3VudCA9IDA7XG4gICAgICB2YXIgc3VmZml4Q291bnQgPSAwO1xuXG4gICAgICB2YXIgbWluTGVuZ3RoID0gTWF0aC5taW4oY3VycmVudEVuZCAtIGN1cnJlbnRTdGFydCwgb2xkRW5kIC0gb2xkU3RhcnQpO1xuICAgICAgaWYgKGN1cnJlbnRTdGFydCA9PSAwICYmIG9sZFN0YXJ0ID09IDApXG4gICAgICAgIHByZWZpeENvdW50ID0gdGhpcy5zaGFyZWRQcmVmaXgoY3VycmVudCwgb2xkLCBtaW5MZW5ndGgpO1xuXG4gICAgICBpZiAoY3VycmVudEVuZCA9PSBjdXJyZW50Lmxlbmd0aCAmJiBvbGRFbmQgPT0gb2xkLmxlbmd0aClcbiAgICAgICAgc3VmZml4Q291bnQgPSB0aGlzLnNoYXJlZFN1ZmZpeChjdXJyZW50LCBvbGQsIG1pbkxlbmd0aCAtIHByZWZpeENvdW50KTtcblxuICAgICAgY3VycmVudFN0YXJ0ICs9IHByZWZpeENvdW50O1xuICAgICAgb2xkU3RhcnQgKz0gcHJlZml4Q291bnQ7XG4gICAgICBjdXJyZW50RW5kIC09IHN1ZmZpeENvdW50O1xuICAgICAgb2xkRW5kIC09IHN1ZmZpeENvdW50O1xuXG4gICAgICBpZiAoY3VycmVudEVuZCAtIGN1cnJlbnRTdGFydCA9PSAwICYmIG9sZEVuZCAtIG9sZFN0YXJ0ID09IDApXG4gICAgICAgIHJldHVybiBbXTtcblxuICAgICAgaWYgKGN1cnJlbnRTdGFydCA9PSBjdXJyZW50RW5kKSB7XG4gICAgICAgIHZhciBzcGxpY2UgPSBuZXdTcGxpY2UoY3VycmVudFN0YXJ0LCBbXSwgMCk7XG4gICAgICAgIHdoaWxlIChvbGRTdGFydCA8IG9sZEVuZClcbiAgICAgICAgICBzcGxpY2UucmVtb3ZlZC5wdXNoKG9sZFtvbGRTdGFydCsrXSk7XG5cbiAgICAgICAgcmV0dXJuIFsgc3BsaWNlIF07XG4gICAgICB9IGVsc2UgaWYgKG9sZFN0YXJ0ID09IG9sZEVuZClcbiAgICAgICAgcmV0dXJuIFsgbmV3U3BsaWNlKGN1cnJlbnRTdGFydCwgW10sIGN1cnJlbnRFbmQgLSBjdXJyZW50U3RhcnQpIF07XG5cbiAgICAgIHZhciBvcHMgPSB0aGlzLnNwbGljZU9wZXJhdGlvbnNGcm9tRWRpdERpc3RhbmNlcyhcbiAgICAgICAgICB0aGlzLmNhbGNFZGl0RGlzdGFuY2VzKGN1cnJlbnQsIGN1cnJlbnRTdGFydCwgY3VycmVudEVuZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sZCwgb2xkU3RhcnQsIG9sZEVuZCkpO1xuXG4gICAgICB2YXIgc3BsaWNlID0gdW5kZWZpbmVkO1xuICAgICAgdmFyIHNwbGljZXMgPSBbXTtcbiAgICAgIHZhciBpbmRleCA9IGN1cnJlbnRTdGFydDtcbiAgICAgIHZhciBvbGRJbmRleCA9IG9sZFN0YXJ0O1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc3dpdGNoKG9wc1tpXSkge1xuICAgICAgICAgIGNhc2UgRURJVF9MRUFWRTpcbiAgICAgICAgICAgIGlmIChzcGxpY2UpIHtcbiAgICAgICAgICAgICAgc3BsaWNlcy5wdXNoKHNwbGljZSk7XG4gICAgICAgICAgICAgIHNwbGljZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgIG9sZEluZGV4Kys7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEVESVRfVVBEQVRFOlxuICAgICAgICAgICAgaWYgKCFzcGxpY2UpXG4gICAgICAgICAgICAgIHNwbGljZSA9IG5ld1NwbGljZShpbmRleCwgW10sIDApO1xuXG4gICAgICAgICAgICBzcGxpY2UuYWRkZWRDb3VudCsrO1xuICAgICAgICAgICAgaW5kZXgrKztcblxuICAgICAgICAgICAgc3BsaWNlLnJlbW92ZWQucHVzaChvbGRbb2xkSW5kZXhdKTtcbiAgICAgICAgICAgIG9sZEluZGV4Kys7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEVESVRfQUREOlxuICAgICAgICAgICAgaWYgKCFzcGxpY2UpXG4gICAgICAgICAgICAgIHNwbGljZSA9IG5ld1NwbGljZShpbmRleCwgW10sIDApO1xuXG4gICAgICAgICAgICBzcGxpY2UuYWRkZWRDb3VudCsrO1xuICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgRURJVF9ERUxFVEU6XG4gICAgICAgICAgICBpZiAoIXNwbGljZSlcbiAgICAgICAgICAgICAgc3BsaWNlID0gbmV3U3BsaWNlKGluZGV4LCBbXSwgMCk7XG5cbiAgICAgICAgICAgIHNwbGljZS5yZW1vdmVkLnB1c2gob2xkW29sZEluZGV4XSk7XG4gICAgICAgICAgICBvbGRJbmRleCsrO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHNwbGljZSkge1xuICAgICAgICBzcGxpY2VzLnB1c2goc3BsaWNlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzcGxpY2VzO1xuICAgIH0sXG5cbiAgICBzaGFyZWRQcmVmaXg6IGZ1bmN0aW9uKGN1cnJlbnQsIG9sZCwgc2VhcmNoTGVuZ3RoKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlYXJjaExlbmd0aDsgaSsrKVxuICAgICAgICBpZiAoIXRoaXMuZXF1YWxzKGN1cnJlbnRbaV0sIG9sZFtpXSkpXG4gICAgICAgICAgcmV0dXJuIGk7XG4gICAgICByZXR1cm4gc2VhcmNoTGVuZ3RoO1xuICAgIH0sXG5cbiAgICBzaGFyZWRTdWZmaXg6IGZ1bmN0aW9uKGN1cnJlbnQsIG9sZCwgc2VhcmNoTGVuZ3RoKSB7XG4gICAgICB2YXIgaW5kZXgxID0gY3VycmVudC5sZW5ndGg7XG4gICAgICB2YXIgaW5kZXgyID0gb2xkLmxlbmd0aDtcbiAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICB3aGlsZSAoY291bnQgPCBzZWFyY2hMZW5ndGggJiYgdGhpcy5lcXVhbHMoY3VycmVudFstLWluZGV4MV0sIG9sZFstLWluZGV4Ml0pKVxuICAgICAgICBjb3VudCsrO1xuXG4gICAgICByZXR1cm4gY291bnQ7XG4gICAgfSxcblxuICAgIGNhbGN1bGF0ZVNwbGljZXM6IGZ1bmN0aW9uKGN1cnJlbnQsIHByZXZpb3VzKSB7XG4gICAgICByZXR1cm4gdGhpcy5jYWxjU3BsaWNlcyhjdXJyZW50LCAwLCBjdXJyZW50Lmxlbmd0aCwgcHJldmlvdXMsIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmV2aW91cy5sZW5ndGgpO1xuICAgIH0sXG5cbiAgICBlcXVhbHM6IGZ1bmN0aW9uKGN1cnJlbnRWYWx1ZSwgcHJldmlvdXNWYWx1ZSkge1xuICAgICAgcmV0dXJuIGN1cnJlbnRWYWx1ZSA9PT0gcHJldmlvdXNWYWx1ZTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIGFycmF5U3BsaWNlID0gbmV3IEFycmF5U3BsaWNlKCk7XG5cbiAgZnVuY3Rpb24gY2FsY1NwbGljZXMoY3VycmVudCwgY3VycmVudFN0YXJ0LCBjdXJyZW50RW5kLFxuICAgICAgICAgICAgICAgICAgICAgICBvbGQsIG9sZFN0YXJ0LCBvbGRFbmQpIHtcbiAgICByZXR1cm4gYXJyYXlTcGxpY2UuY2FsY1NwbGljZXMoY3VycmVudCwgY3VycmVudFN0YXJ0LCBjdXJyZW50RW5kLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGQsIG9sZFN0YXJ0LCBvbGRFbmQpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW50ZXJzZWN0KHN0YXJ0MSwgZW5kMSwgc3RhcnQyLCBlbmQyKSB7XG4gICAgLy8gRGlzam9pbnRcbiAgICBpZiAoZW5kMSA8IHN0YXJ0MiB8fCBlbmQyIDwgc3RhcnQxKVxuICAgICAgcmV0dXJuIC0xO1xuXG4gICAgLy8gQWRqYWNlbnRcbiAgICBpZiAoZW5kMSA9PSBzdGFydDIgfHwgZW5kMiA9PSBzdGFydDEpXG4gICAgICByZXR1cm4gMDtcblxuICAgIC8vIE5vbi16ZXJvIGludGVyc2VjdCwgc3BhbjEgZmlyc3RcbiAgICBpZiAoc3RhcnQxIDwgc3RhcnQyKSB7XG4gICAgICBpZiAoZW5kMSA8IGVuZDIpXG4gICAgICAgIHJldHVybiBlbmQxIC0gc3RhcnQyOyAvLyBPdmVybGFwXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiBlbmQyIC0gc3RhcnQyOyAvLyBDb250YWluZWRcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTm9uLXplcm8gaW50ZXJzZWN0LCBzcGFuMiBmaXJzdFxuICAgICAgaWYgKGVuZDIgPCBlbmQxKVxuICAgICAgICByZXR1cm4gZW5kMiAtIHN0YXJ0MTsgLy8gT3ZlcmxhcFxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gZW5kMSAtIHN0YXJ0MTsgLy8gQ29udGFpbmVkXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbWVyZ2VTcGxpY2Uoc3BsaWNlcywgaW5kZXgsIHJlbW92ZWQsIGFkZGVkQ291bnQpIHtcblxuICAgIHZhciBzcGxpY2UgPSBuZXdTcGxpY2UoaW5kZXgsIHJlbW92ZWQsIGFkZGVkQ291bnQpO1xuXG4gICAgdmFyIGluc2VydGVkID0gZmFsc2U7XG4gICAgdmFyIGluc2VydGlvbk9mZnNldCA9IDA7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNwbGljZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBjdXJyZW50ID0gc3BsaWNlc1tpXTtcbiAgICAgIGN1cnJlbnQuaW5kZXggKz0gaW5zZXJ0aW9uT2Zmc2V0O1xuXG4gICAgICBpZiAoaW5zZXJ0ZWQpXG4gICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICB2YXIgaW50ZXJzZWN0Q291bnQgPSBpbnRlcnNlY3Qoc3BsaWNlLmluZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwbGljZS5pbmRleCArIHNwbGljZS5yZW1vdmVkLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50LmluZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQuaW5kZXggKyBjdXJyZW50LmFkZGVkQ291bnQpO1xuXG4gICAgICBpZiAoaW50ZXJzZWN0Q291bnQgPj0gMCkge1xuICAgICAgICAvLyBNZXJnZSB0aGUgdHdvIHNwbGljZXNcblxuICAgICAgICBzcGxpY2VzLnNwbGljZShpLCAxKTtcbiAgICAgICAgaS0tO1xuXG4gICAgICAgIGluc2VydGlvbk9mZnNldCAtPSBjdXJyZW50LmFkZGVkQ291bnQgLSBjdXJyZW50LnJlbW92ZWQubGVuZ3RoO1xuXG4gICAgICAgIHNwbGljZS5hZGRlZENvdW50ICs9IGN1cnJlbnQuYWRkZWRDb3VudCAtIGludGVyc2VjdENvdW50O1xuICAgICAgICB2YXIgZGVsZXRlQ291bnQgPSBzcGxpY2UucmVtb3ZlZC5sZW5ndGggK1xuICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50LnJlbW92ZWQubGVuZ3RoIC0gaW50ZXJzZWN0Q291bnQ7XG5cbiAgICAgICAgaWYgKCFzcGxpY2UuYWRkZWRDb3VudCAmJiAhZGVsZXRlQ291bnQpIHtcbiAgICAgICAgICAvLyBtZXJnZWQgc3BsaWNlIGlzIGEgbm9vcC4gZGlzY2FyZC5cbiAgICAgICAgICBpbnNlcnRlZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHJlbW92ZWQgPSBjdXJyZW50LnJlbW92ZWQ7XG5cbiAgICAgICAgICBpZiAoc3BsaWNlLmluZGV4IDwgY3VycmVudC5pbmRleCkge1xuICAgICAgICAgICAgLy8gc29tZSBwcmVmaXggb2Ygc3BsaWNlLnJlbW92ZWQgaXMgcHJlcGVuZGVkIHRvIGN1cnJlbnQucmVtb3ZlZC5cbiAgICAgICAgICAgIHZhciBwcmVwZW5kID0gc3BsaWNlLnJlbW92ZWQuc2xpY2UoMCwgY3VycmVudC5pbmRleCAtIHNwbGljZS5pbmRleCk7XG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShwcmVwZW5kLCByZW1vdmVkKTtcbiAgICAgICAgICAgIHJlbW92ZWQgPSBwcmVwZW5kO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzcGxpY2UuaW5kZXggKyBzcGxpY2UucmVtb3ZlZC5sZW5ndGggPiBjdXJyZW50LmluZGV4ICsgY3VycmVudC5hZGRlZENvdW50KSB7XG4gICAgICAgICAgICAvLyBzb21lIHN1ZmZpeCBvZiBzcGxpY2UucmVtb3ZlZCBpcyBhcHBlbmRlZCB0byBjdXJyZW50LnJlbW92ZWQuXG4gICAgICAgICAgICB2YXIgYXBwZW5kID0gc3BsaWNlLnJlbW92ZWQuc2xpY2UoY3VycmVudC5pbmRleCArIGN1cnJlbnQuYWRkZWRDb3VudCAtIHNwbGljZS5pbmRleCk7XG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShyZW1vdmVkLCBhcHBlbmQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNwbGljZS5yZW1vdmVkID0gcmVtb3ZlZDtcbiAgICAgICAgICBpZiAoY3VycmVudC5pbmRleCA8IHNwbGljZS5pbmRleCkge1xuICAgICAgICAgICAgc3BsaWNlLmluZGV4ID0gY3VycmVudC5pbmRleDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoc3BsaWNlLmluZGV4IDwgY3VycmVudC5pbmRleCkge1xuICAgICAgICAvLyBJbnNlcnQgc3BsaWNlIGhlcmUuXG5cbiAgICAgICAgaW5zZXJ0ZWQgPSB0cnVlO1xuXG4gICAgICAgIHNwbGljZXMuc3BsaWNlKGksIDAsIHNwbGljZSk7XG4gICAgICAgIGkrKztcblxuICAgICAgICB2YXIgb2Zmc2V0ID0gc3BsaWNlLmFkZGVkQ291bnQgLSBzcGxpY2UucmVtb3ZlZC5sZW5ndGhcbiAgICAgICAgY3VycmVudC5pbmRleCArPSBvZmZzZXQ7XG4gICAgICAgIGluc2VydGlvbk9mZnNldCArPSBvZmZzZXQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFpbnNlcnRlZClcbiAgICAgIHNwbGljZXMucHVzaChzcGxpY2UpO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlSW5pdGlhbFNwbGljZXMoYXJyYXksIGNoYW5nZVJlY29yZHMpIHtcbiAgICB2YXIgc3BsaWNlcyA9IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGFuZ2VSZWNvcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcmVjb3JkID0gY2hhbmdlUmVjb3Jkc1tpXTtcbiAgICAgIHN3aXRjaChyZWNvcmQudHlwZSkge1xuICAgICAgICBjYXNlICdzcGxpY2UnOlxuICAgICAgICAgIG1lcmdlU3BsaWNlKHNwbGljZXMsIHJlY29yZC5pbmRleCwgcmVjb3JkLnJlbW92ZWQuc2xpY2UoKSwgcmVjb3JkLmFkZGVkQ291bnQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdhZGQnOlxuICAgICAgICBjYXNlICd1cGRhdGUnOlxuICAgICAgICBjYXNlICdkZWxldGUnOlxuICAgICAgICAgIGlmICghaXNJbmRleChyZWNvcmQubmFtZSkpXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB2YXIgaW5kZXggPSB0b051bWJlcihyZWNvcmQubmFtZSk7XG4gICAgICAgICAgaWYgKGluZGV4IDwgMClcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIG1lcmdlU3BsaWNlKHNwbGljZXMsIGluZGV4LCBbcmVjb3JkLm9sZFZhbHVlXSwgMSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29uc29sZS5lcnJvcignVW5leHBlY3RlZCByZWNvcmQgdHlwZTogJyArIEpTT04uc3RyaW5naWZ5KHJlY29yZCkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzcGxpY2VzO1xuICB9XG5cbiAgZnVuY3Rpb24gcHJvamVjdEFycmF5U3BsaWNlcyhhcnJheSwgY2hhbmdlUmVjb3Jkcykge1xuICAgIHZhciBzcGxpY2VzID0gW107XG5cbiAgICBjcmVhdGVJbml0aWFsU3BsaWNlcyhhcnJheSwgY2hhbmdlUmVjb3JkcykuZm9yRWFjaChmdW5jdGlvbihzcGxpY2UpIHtcbiAgICAgIGlmIChzcGxpY2UuYWRkZWRDb3VudCA9PSAxICYmIHNwbGljZS5yZW1vdmVkLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgIGlmIChzcGxpY2UucmVtb3ZlZFswXSAhPT0gYXJyYXlbc3BsaWNlLmluZGV4XSlcbiAgICAgICAgICBzcGxpY2VzLnB1c2goc3BsaWNlKTtcblxuICAgICAgICByZXR1cm5cbiAgICAgIH07XG5cbiAgICAgIHNwbGljZXMgPSBzcGxpY2VzLmNvbmNhdChjYWxjU3BsaWNlcyhhcnJheSwgc3BsaWNlLmluZGV4LCBzcGxpY2UuaW5kZXggKyBzcGxpY2UuYWRkZWRDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGxpY2UucmVtb3ZlZCwgMCwgc3BsaWNlLnJlbW92ZWQubGVuZ3RoKSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc3BsaWNlcztcbiAgfVxuXG4gIC8vIEV4cG9ydCB0aGUgb2JzZXJ2ZS1qcyBvYmplY3QgZm9yICoqTm9kZS5qcyoqLCB3aXRoIGJhY2t3YXJkcy1jb21wYXRpYmlsaXR5XG4gIC8vIGZvciB0aGUgb2xkIGByZXF1aXJlKClgIEFQSS4gQWxzbyBlbnN1cmUgYGV4cG9ydHNgIGlzIG5vdCBhIERPTSBFbGVtZW50LlxuICAvLyBJZiB3ZSdyZSBpbiB0aGUgYnJvd3NlciwgZXhwb3J0IGFzIGEgZ2xvYmFsIG9iamVjdC5cblxuICB2YXIgZXhwb3NlID0gZ2xvYmFsO1xuXG4gIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcgJiYgIWV4cG9ydHMubm9kZVR5cGUpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cztcbiAgICB9XG4gICAgZXhwb3NlID0gZXhwb3J0cztcbiAgfVxuXG4gIGV4cG9zZS5PYnNlcnZlciA9IE9ic2VydmVyO1xuICBleHBvc2UuT2JzZXJ2ZXIucnVuRU9NXyA9IHJ1bkVPTTtcbiAgZXhwb3NlLk9ic2VydmVyLm9ic2VydmVyU2VudGluZWxfID0gb2JzZXJ2ZXJTZW50aW5lbDsgLy8gZm9yIHRlc3RpbmcuXG4gIGV4cG9zZS5PYnNlcnZlci5oYXNPYmplY3RPYnNlcnZlID0gaGFzT2JzZXJ2ZTtcbiAgZXhwb3NlLkFycmF5T2JzZXJ2ZXIgPSBBcnJheU9ic2VydmVyO1xuICBleHBvc2UuQXJyYXlPYnNlcnZlci5jYWxjdWxhdGVTcGxpY2VzID0gZnVuY3Rpb24oY3VycmVudCwgcHJldmlvdXMpIHtcbiAgICByZXR1cm4gYXJyYXlTcGxpY2UuY2FsY3VsYXRlU3BsaWNlcyhjdXJyZW50LCBwcmV2aW91cyk7XG4gIH07XG5cbiAgZXhwb3NlLkFycmF5U3BsaWNlID0gQXJyYXlTcGxpY2U7XG4gIGV4cG9zZS5PYmplY3RPYnNlcnZlciA9IE9iamVjdE9ic2VydmVyO1xuICBleHBvc2UuUGF0aE9ic2VydmVyID0gUGF0aE9ic2VydmVyO1xuICBleHBvc2UuQ29tcG91bmRPYnNlcnZlciA9IENvbXBvdW5kT2JzZXJ2ZXI7XG4gIGV4cG9zZS5QYXRoID0gUGF0aDtcbiAgZXhwb3NlLk9ic2VydmVyVHJhbnNmb3JtID0gT2JzZXJ2ZXJUcmFuc2Zvcm07XG5cbn0pKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnICYmIGdsb2JhbCAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUgPyBnbG9iYWwgOiB0aGlzIHx8IHdpbmRvdyk7XG5cbi8vIENvcHlyaWdodCAoYykgMjAxNCBUaGUgUG9seW1lciBQcm9qZWN0IEF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBUaGlzIGNvZGUgbWF5IG9ubHkgYmUgdXNlZCB1bmRlciB0aGUgQlNEIHN0eWxlIGxpY2Vuc2UgZm91bmQgYXQgaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0xJQ0VOU0UudHh0XG4vLyBUaGUgY29tcGxldGUgc2V0IG9mIGF1dGhvcnMgbWF5IGJlIGZvdW5kIGF0IGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9BVVRIT1JTLnR4dFxuLy8gVGhlIGNvbXBsZXRlIHNldCBvZiBjb250cmlidXRvcnMgbWF5IGJlIGZvdW5kIGF0IGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9DT05UUklCVVRPUlMudHh0XG4vLyBDb2RlIGRpc3RyaWJ1dGVkIGJ5IEdvb2dsZSBhcyBwYXJ0IG9mIHRoZSBwb2x5bWVyIHByb2plY3QgaXMgYWxzb1xuLy8gc3ViamVjdCB0byBhbiBhZGRpdGlvbmFsIElQIHJpZ2h0cyBncmFudCBmb3VuZCBhdCBodHRwOi8vcG9seW1lci5naXRodWIuaW8vUEFURU5UUy50eHRcblxuKGZ1bmN0aW9uKGdsb2JhbCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIGZpbHRlciA9IEFycmF5LnByb3RvdHlwZS5maWx0ZXIuY2FsbC5iaW5kKEFycmF5LnByb3RvdHlwZS5maWx0ZXIpO1xuXG4gIGZ1bmN0aW9uIGdldFRyZWVTY29wZShub2RlKSB7XG4gICAgd2hpbGUgKG5vZGUucGFyZW50Tm9kZSkge1xuICAgICAgbm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHlwZW9mIG5vZGUuZ2V0RWxlbWVudEJ5SWQgPT09ICdmdW5jdGlvbicgPyBub2RlIDogbnVsbDtcbiAgfVxuXG4gIE5vZGUucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbihuYW1lLCBvYnNlcnZhYmxlKSB7XG4gICAgY29uc29sZS5lcnJvcignVW5oYW5kbGVkIGJpbmRpbmcgdG8gTm9kZTogJywgdGhpcywgbmFtZSwgb2JzZXJ2YWJsZSk7XG4gIH07XG5cbiAgTm9kZS5wcm90b3R5cGUuYmluZEZpbmlzaGVkID0gZnVuY3Rpb24oKSB7fTtcblxuICBmdW5jdGlvbiB1cGRhdGVCaW5kaW5ncyhub2RlLCBuYW1lLCBiaW5kaW5nKSB7XG4gICAgdmFyIGJpbmRpbmdzID0gbm9kZS5iaW5kaW5nc187XG4gICAgaWYgKCFiaW5kaW5ncylcbiAgICAgIGJpbmRpbmdzID0gbm9kZS5iaW5kaW5nc18gPSB7fTtcblxuICAgIGlmIChiaW5kaW5nc1tuYW1lXSlcbiAgICAgIGJpbmRpbmdbbmFtZV0uY2xvc2UoKTtcblxuICAgIHJldHVybiBiaW5kaW5nc1tuYW1lXSA9IGJpbmRpbmc7XG4gIH1cblxuICBmdW5jdGlvbiByZXR1cm5CaW5kaW5nKG5vZGUsIG5hbWUsIGJpbmRpbmcpIHtcbiAgICByZXR1cm4gYmluZGluZztcbiAgfVxuXG4gIGZ1bmN0aW9uIHNhbml0aXplVmFsdWUodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/ICcnIDogdmFsdWU7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVUZXh0KG5vZGUsIHZhbHVlKSB7XG4gICAgbm9kZS5kYXRhID0gc2FuaXRpemVWYWx1ZSh2YWx1ZSk7XG4gIH1cblxuICBmdW5jdGlvbiB0ZXh0QmluZGluZyhub2RlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdXBkYXRlVGV4dChub2RlLCB2YWx1ZSk7XG4gICAgfTtcbiAgfVxuXG4gIHZhciBtYXliZVVwZGF0ZUJpbmRpbmdzID0gcmV0dXJuQmluZGluZztcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUGxhdGZvcm0sICdlbmFibGVCaW5kaW5nc1JlZmxlY3Rpb24nLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBtYXliZVVwZGF0ZUJpbmRpbmdzID09PSB1cGRhdGVCaW5kaW5ncztcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24oZW5hYmxlKSB7XG4gICAgICBtYXliZVVwZGF0ZUJpbmRpbmdzID0gZW5hYmxlID8gdXBkYXRlQmluZGluZ3MgOiByZXR1cm5CaW5kaW5nO1xuICAgICAgcmV0dXJuIGVuYWJsZTtcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcblxuICBUZXh0LnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24obmFtZSwgdmFsdWUsIG9uZVRpbWUpIHtcbiAgICBpZiAobmFtZSAhPT0gJ3RleHRDb250ZW50JylcbiAgICAgIHJldHVybiBOb2RlLnByb3RvdHlwZS5iaW5kLmNhbGwodGhpcywgbmFtZSwgdmFsdWUsIG9uZVRpbWUpO1xuXG4gICAgaWYgKG9uZVRpbWUpXG4gICAgICByZXR1cm4gdXBkYXRlVGV4dCh0aGlzLCB2YWx1ZSk7XG5cbiAgICB2YXIgb2JzZXJ2YWJsZSA9IHZhbHVlO1xuICAgIHVwZGF0ZVRleHQodGhpcywgb2JzZXJ2YWJsZS5vcGVuKHRleHRCaW5kaW5nKHRoaXMpKSk7XG4gICAgcmV0dXJuIG1heWJlVXBkYXRlQmluZGluZ3ModGhpcywgbmFtZSwgb2JzZXJ2YWJsZSk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVBdHRyaWJ1dGUoZWwsIG5hbWUsIGNvbmRpdGlvbmFsLCB2YWx1ZSkge1xuICAgIGlmIChjb25kaXRpb25hbCkge1xuICAgICAgaWYgKHZhbHVlKVxuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUobmFtZSwgJycpO1xuICAgICAgZWxzZVxuICAgICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZWwuc2V0QXR0cmlidXRlKG5hbWUsIHNhbml0aXplVmFsdWUodmFsdWUpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGF0dHJpYnV0ZUJpbmRpbmcoZWwsIG5hbWUsIGNvbmRpdGlvbmFsKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICB1cGRhdGVBdHRyaWJ1dGUoZWwsIG5hbWUsIGNvbmRpdGlvbmFsLCB2YWx1ZSk7XG4gICAgfTtcbiAgfVxuXG4gIEVsZW1lbnQucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSwgb25lVGltZSkge1xuICAgIHZhciBjb25kaXRpb25hbCA9IG5hbWVbbmFtZS5sZW5ndGggLSAxXSA9PSAnPyc7XG4gICAgaWYgKGNvbmRpdGlvbmFsKSB7XG4gICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICAgIG5hbWUgPSBuYW1lLnNsaWNlKDAsIC0xKTtcbiAgICB9XG5cbiAgICBpZiAob25lVGltZSlcbiAgICAgIHJldHVybiB1cGRhdGVBdHRyaWJ1dGUodGhpcywgbmFtZSwgY29uZGl0aW9uYWwsIHZhbHVlKTtcblxuXG4gICAgdmFyIG9ic2VydmFibGUgPSB2YWx1ZTtcbiAgICB1cGRhdGVBdHRyaWJ1dGUodGhpcywgbmFtZSwgY29uZGl0aW9uYWwsXG4gICAgICAgIG9ic2VydmFibGUub3BlbihhdHRyaWJ1dGVCaW5kaW5nKHRoaXMsIG5hbWUsIGNvbmRpdGlvbmFsKSkpO1xuXG4gICAgcmV0dXJuIG1heWJlVXBkYXRlQmluZGluZ3ModGhpcywgbmFtZSwgb2JzZXJ2YWJsZSk7XG4gIH07XG5cbiAgdmFyIGNoZWNrYm94RXZlbnRUeXBlO1xuICAoZnVuY3Rpb24oKSB7XG4gICAgLy8gQXR0ZW1wdCB0byBmZWF0dXJlLWRldGVjdCB3aGljaCBldmVudCAoY2hhbmdlIG9yIGNsaWNrKSBpcyBmaXJlZCBmaXJzdFxuICAgIC8vIGZvciBjaGVja2JveGVzLlxuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB2YXIgY2hlY2tib3ggPSBkaXYuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKSk7XG4gICAgY2hlY2tib3guc2V0QXR0cmlidXRlKCd0eXBlJywgJ2NoZWNrYm94Jyk7XG4gICAgdmFyIGZpcnN0O1xuICAgIHZhciBjb3VudCA9IDA7XG4gICAgY2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICBjb3VudCsrO1xuICAgICAgZmlyc3QgPSBmaXJzdCB8fCAnY2xpY2snO1xuICAgIH0pO1xuICAgIGNoZWNrYm94LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgY291bnQrKztcbiAgICAgIGZpcnN0ID0gZmlyc3QgfHwgJ2NoYW5nZSc7XG4gICAgfSk7XG5cbiAgICB2YXIgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnTW91c2VFdmVudCcpO1xuICAgIGV2ZW50LmluaXRNb3VzZUV2ZW50KFwiY2xpY2tcIiwgdHJ1ZSwgdHJ1ZSwgd2luZG93LCAwLCAwLCAwLCAwLCAwLCBmYWxzZSxcbiAgICAgICAgZmFsc2UsIGZhbHNlLCBmYWxzZSwgMCwgbnVsbCk7XG4gICAgY2hlY2tib3guZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgLy8gV2ViS2l0L0JsaW5rIGRvbid0IGZpcmUgdGhlIGNoYW5nZSBldmVudCBpZiB0aGUgZWxlbWVudCBpcyBvdXRzaWRlIHRoZVxuICAgIC8vIGRvY3VtZW50LCBzbyBhc3N1bWUgJ2NoYW5nZScgZm9yIHRoYXQgY2FzZS5cbiAgICBjaGVja2JveEV2ZW50VHlwZSA9IGNvdW50ID09IDEgPyAnY2hhbmdlJyA6IGZpcnN0O1xuICB9KSgpO1xuXG4gIGZ1bmN0aW9uIGdldEV2ZW50Rm9ySW5wdXRUeXBlKGVsZW1lbnQpIHtcbiAgICBzd2l0Y2ggKGVsZW1lbnQudHlwZSkge1xuICAgICAgY2FzZSAnY2hlY2tib3gnOlxuICAgICAgICByZXR1cm4gY2hlY2tib3hFdmVudFR5cGU7XG4gICAgICBjYXNlICdyYWRpbyc6XG4gICAgICBjYXNlICdzZWxlY3QtbXVsdGlwbGUnOlxuICAgICAgY2FzZSAnc2VsZWN0LW9uZSc6XG4gICAgICAgIHJldHVybiAnY2hhbmdlJztcbiAgICAgIGNhc2UgJ3JhbmdlJzpcbiAgICAgICAgaWYgKC9UcmlkZW50fE1TSUUvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpXG4gICAgICAgICAgcmV0dXJuICdjaGFuZ2UnO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuICdpbnB1dCc7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlSW5wdXQoaW5wdXQsIHByb3BlcnR5LCB2YWx1ZSwgc2FudGl6ZUZuKSB7XG4gICAgaW5wdXRbcHJvcGVydHldID0gKHNhbnRpemVGbiB8fCBzYW5pdGl6ZVZhbHVlKSh2YWx1ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBpbnB1dEJpbmRpbmcoaW5wdXQsIHByb3BlcnR5LCBzYW50aXplRm4pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiB1cGRhdGVJbnB1dChpbnB1dCwgcHJvcGVydHksIHZhbHVlLCBzYW50aXplRm4pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG5vb3AoKSB7fVxuXG4gIGZ1bmN0aW9uIGJpbmRJbnB1dEV2ZW50KGlucHV0LCBwcm9wZXJ0eSwgb2JzZXJ2YWJsZSwgcG9zdEV2ZW50Rm4pIHtcbiAgICB2YXIgZXZlbnRUeXBlID0gZ2V0RXZlbnRGb3JJbnB1dFR5cGUoaW5wdXQpO1xuXG4gICAgZnVuY3Rpb24gZXZlbnRIYW5kbGVyKCkge1xuICAgICAgdmFyIGlzTnVtID0gcHJvcGVydHkgPT0gJ3ZhbHVlJyAmJiBpbnB1dC50eXBlID09ICdudW1iZXInO1xuICAgICAgb2JzZXJ2YWJsZS5zZXRWYWx1ZShpc051bSA/IGlucHV0LnZhbHVlQXNOdW1iZXIgOiBpbnB1dFtwcm9wZXJ0eV0pO1xuICAgICAgb2JzZXJ2YWJsZS5kaXNjYXJkQ2hhbmdlcygpO1xuICAgICAgKHBvc3RFdmVudEZuIHx8IG5vb3ApKGlucHV0KTtcbiAgICAgIFBsYXRmb3JtLnBlcmZvcm1NaWNyb3Rhc2tDaGVja3BvaW50KCk7XG4gICAgfVxuICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBldmVudEhhbmRsZXIpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNsb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaW5wdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGV2ZW50SGFuZGxlcik7XG4gICAgICAgIG9ic2VydmFibGUuY2xvc2UoKTtcbiAgICAgIH0sXG5cbiAgICAgIG9ic2VydmFibGVfOiBvYnNlcnZhYmxlXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYm9vbGVhblNhbml0aXplKHZhbHVlKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4odmFsdWUpO1xuICB9XG5cbiAgLy8gfGVsZW1lbnR8IGlzIGFzc3VtZWQgdG8gYmUgYW4gSFRNTElucHV0RWxlbWVudCB3aXRoIHx0eXBlfCA9PSAncmFkaW8nLlxuICAvLyBSZXR1cm5zIGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIHJhZGlvIGJ1dHRvbnMgb3RoZXIgdGhhbiB8ZWxlbWVudHwgdGhhdFxuICAvLyBoYXZlIHRoZSBzYW1lIHxuYW1lfCwgZWl0aGVyIGluIHRoZSBmb3JtIHRoYXQgfGVsZW1lbnR8IGJlbG9uZ3MgdG8gb3IsXG4gIC8vIGlmIG5vIGZvcm0sIGluIHRoZSBkb2N1bWVudCB0cmVlIHRvIHdoaWNoIHxlbGVtZW50fCBiZWxvbmdzLlxuICAvL1xuICAvLyBUaGlzIGltcGxlbWVudGF0aW9uIGlzIGJhc2VkIHVwb24gdGhlIEhUTUwgc3BlYyBkZWZpbml0aW9uIG9mIGFcbiAgLy8gXCJyYWRpbyBidXR0b24gZ3JvdXBcIjpcbiAgLy8gICBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS9udW1iZXItc3RhdGUuaHRtbCNyYWRpby1idXR0b24tZ3JvdXBcbiAgLy9cbiAgZnVuY3Rpb24gZ2V0QXNzb2NpYXRlZFJhZGlvQnV0dG9ucyhlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQuZm9ybSkge1xuICAgICAgcmV0dXJuIGZpbHRlcihlbGVtZW50LmZvcm0uZWxlbWVudHMsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgIHJldHVybiBlbCAhPSBlbGVtZW50ICYmXG4gICAgICAgICAgICBlbC50YWdOYW1lID09ICdJTlBVVCcgJiZcbiAgICAgICAgICAgIGVsLnR5cGUgPT0gJ3JhZGlvJyAmJlxuICAgICAgICAgICAgZWwubmFtZSA9PSBlbGVtZW50Lm5hbWU7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHRyZWVTY29wZSA9IGdldFRyZWVTY29wZShlbGVtZW50KTtcbiAgICAgIGlmICghdHJlZVNjb3BlKVxuICAgICAgICByZXR1cm4gW107XG4gICAgICB2YXIgcmFkaW9zID0gdHJlZVNjb3BlLnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgJ2lucHV0W3R5cGU9XCJyYWRpb1wiXVtuYW1lPVwiJyArIGVsZW1lbnQubmFtZSArICdcIl0nKTtcbiAgICAgIHJldHVybiBmaWx0ZXIocmFkaW9zLCBmdW5jdGlvbihlbCkge1xuICAgICAgICByZXR1cm4gZWwgIT0gZWxlbWVudCAmJiAhZWwuZm9ybTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNoZWNrZWRQb3N0RXZlbnQoaW5wdXQpIHtcbiAgICAvLyBPbmx5IHRoZSByYWRpbyBidXR0b24gdGhhdCBpcyBnZXR0aW5nIGNoZWNrZWQgZ2V0cyBhbiBldmVudC4gV2VcbiAgICAvLyB0aGVyZWZvcmUgZmluZCBhbGwgdGhlIGFzc29jaWF0ZWQgcmFkaW8gYnV0dG9ucyBhbmQgdXBkYXRlIHRoZWlyXG4gICAgLy8gY2hlY2sgYmluZGluZyBtYW51YWxseS5cbiAgICBpZiAoaW5wdXQudGFnTmFtZSA9PT0gJ0lOUFVUJyAmJlxuICAgICAgICBpbnB1dC50eXBlID09PSAncmFkaW8nKSB7XG4gICAgICBnZXRBc3NvY2lhdGVkUmFkaW9CdXR0b25zKGlucHV0KS5mb3JFYWNoKGZ1bmN0aW9uKHJhZGlvKSB7XG4gICAgICAgIHZhciBjaGVja2VkQmluZGluZyA9IHJhZGlvLmJpbmRpbmdzXy5jaGVja2VkO1xuICAgICAgICBpZiAoY2hlY2tlZEJpbmRpbmcpIHtcbiAgICAgICAgICAvLyBTZXQgdGhlIHZhbHVlIGRpcmVjdGx5IHRvIGF2b2lkIGFuIGluZmluaXRlIGNhbGwgc3RhY2suXG4gICAgICAgICAgY2hlY2tlZEJpbmRpbmcub2JzZXJ2YWJsZV8uc2V0VmFsdWUoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBIVE1MSW5wdXRFbGVtZW50LnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24obmFtZSwgdmFsdWUsIG9uZVRpbWUpIHtcbiAgICBpZiAobmFtZSAhPT0gJ3ZhbHVlJyAmJiBuYW1lICE9PSAnY2hlY2tlZCcpXG4gICAgICByZXR1cm4gSFRNTEVsZW1lbnQucHJvdG90eXBlLmJpbmQuY2FsbCh0aGlzLCBuYW1lLCB2YWx1ZSwgb25lVGltZSk7XG5cbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICB2YXIgc2FuaXRpemVGbiA9IG5hbWUgPT0gJ2NoZWNrZWQnID8gYm9vbGVhblNhbml0aXplIDogc2FuaXRpemVWYWx1ZTtcbiAgICB2YXIgcG9zdEV2ZW50Rm4gPSBuYW1lID09ICdjaGVja2VkJyA/IGNoZWNrZWRQb3N0RXZlbnQgOiBub29wO1xuXG4gICAgaWYgKG9uZVRpbWUpXG4gICAgICByZXR1cm4gdXBkYXRlSW5wdXQodGhpcywgbmFtZSwgdmFsdWUsIHNhbml0aXplRm4pO1xuXG5cbiAgICB2YXIgb2JzZXJ2YWJsZSA9IHZhbHVlO1xuICAgIHZhciBiaW5kaW5nID0gYmluZElucHV0RXZlbnQodGhpcywgbmFtZSwgb2JzZXJ2YWJsZSwgcG9zdEV2ZW50Rm4pO1xuICAgIHVwZGF0ZUlucHV0KHRoaXMsIG5hbWUsXG4gICAgICAgICAgICAgICAgb2JzZXJ2YWJsZS5vcGVuKGlucHV0QmluZGluZyh0aGlzLCBuYW1lLCBzYW5pdGl6ZUZuKSksXG4gICAgICAgICAgICAgICAgc2FuaXRpemVGbik7XG5cbiAgICAvLyBDaGVja2JveGVzIG1heSBuZWVkIHRvIHVwZGF0ZSBiaW5kaW5ncyBvZiBvdGhlciBjaGVja2JveGVzLlxuICAgIHJldHVybiB1cGRhdGVCaW5kaW5ncyh0aGlzLCBuYW1lLCBiaW5kaW5nKTtcbiAgfVxuXG4gIEhUTUxUZXh0QXJlYUVsZW1lbnQucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSwgb25lVGltZSkge1xuICAgIGlmIChuYW1lICE9PSAndmFsdWUnKVxuICAgICAgcmV0dXJuIEhUTUxFbGVtZW50LnByb3RvdHlwZS5iaW5kLmNhbGwodGhpcywgbmFtZSwgdmFsdWUsIG9uZVRpbWUpO1xuXG4gICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoJ3ZhbHVlJyk7XG5cbiAgICBpZiAob25lVGltZSlcbiAgICAgIHJldHVybiB1cGRhdGVJbnB1dCh0aGlzLCAndmFsdWUnLCB2YWx1ZSk7XG5cbiAgICB2YXIgb2JzZXJ2YWJsZSA9IHZhbHVlO1xuICAgIHZhciBiaW5kaW5nID0gYmluZElucHV0RXZlbnQodGhpcywgJ3ZhbHVlJywgb2JzZXJ2YWJsZSk7XG4gICAgdXBkYXRlSW5wdXQodGhpcywgJ3ZhbHVlJyxcbiAgICAgICAgICAgICAgICBvYnNlcnZhYmxlLm9wZW4oaW5wdXRCaW5kaW5nKHRoaXMsICd2YWx1ZScsIHNhbml0aXplVmFsdWUpKSk7XG4gICAgcmV0dXJuIG1heWJlVXBkYXRlQmluZGluZ3ModGhpcywgbmFtZSwgYmluZGluZyk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVPcHRpb24ob3B0aW9uLCB2YWx1ZSkge1xuICAgIHZhciBwYXJlbnROb2RlID0gb3B0aW9uLnBhcmVudE5vZGU7O1xuICAgIHZhciBzZWxlY3Q7XG4gICAgdmFyIHNlbGVjdEJpbmRpbmc7XG4gICAgdmFyIG9sZFZhbHVlO1xuICAgIGlmIChwYXJlbnROb2RlIGluc3RhbmNlb2YgSFRNTFNlbGVjdEVsZW1lbnQgJiZcbiAgICAgICAgcGFyZW50Tm9kZS5iaW5kaW5nc18gJiZcbiAgICAgICAgcGFyZW50Tm9kZS5iaW5kaW5nc18udmFsdWUpIHtcbiAgICAgIHNlbGVjdCA9IHBhcmVudE5vZGU7XG4gICAgICBzZWxlY3RCaW5kaW5nID0gc2VsZWN0LmJpbmRpbmdzXy52YWx1ZTtcbiAgICAgIG9sZFZhbHVlID0gc2VsZWN0LnZhbHVlO1xuICAgIH1cblxuICAgIG9wdGlvbi52YWx1ZSA9IHNhbml0aXplVmFsdWUodmFsdWUpO1xuXG4gICAgaWYgKHNlbGVjdCAmJiBzZWxlY3QudmFsdWUgIT0gb2xkVmFsdWUpIHtcbiAgICAgIHNlbGVjdEJpbmRpbmcub2JzZXJ2YWJsZV8uc2V0VmFsdWUoc2VsZWN0LnZhbHVlKTtcbiAgICAgIHNlbGVjdEJpbmRpbmcub2JzZXJ2YWJsZV8uZGlzY2FyZENoYW5nZXMoKTtcbiAgICAgIFBsYXRmb3JtLnBlcmZvcm1NaWNyb3Rhc2tDaGVja3BvaW50KCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb3B0aW9uQmluZGluZyhvcHRpb24pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHVwZGF0ZU9wdGlvbihvcHRpb24sIHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICBIVE1MT3B0aW9uRWxlbWVudC5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBvbmVUaW1lKSB7XG4gICAgaWYgKG5hbWUgIT09ICd2YWx1ZScpXG4gICAgICByZXR1cm4gSFRNTEVsZW1lbnQucHJvdG90eXBlLmJpbmQuY2FsbCh0aGlzLCBuYW1lLCB2YWx1ZSwgb25lVGltZSk7XG5cbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZSgndmFsdWUnKTtcblxuICAgIGlmIChvbmVUaW1lKVxuICAgICAgcmV0dXJuIHVwZGF0ZU9wdGlvbih0aGlzLCB2YWx1ZSk7XG5cbiAgICB2YXIgb2JzZXJ2YWJsZSA9IHZhbHVlO1xuICAgIHZhciBiaW5kaW5nID0gYmluZElucHV0RXZlbnQodGhpcywgJ3ZhbHVlJywgb2JzZXJ2YWJsZSk7XG4gICAgdXBkYXRlT3B0aW9uKHRoaXMsIG9ic2VydmFibGUub3BlbihvcHRpb25CaW5kaW5nKHRoaXMpKSk7XG4gICAgcmV0dXJuIG1heWJlVXBkYXRlQmluZGluZ3ModGhpcywgbmFtZSwgYmluZGluZyk7XG4gIH1cblxuICBIVE1MU2VsZWN0RWxlbWVudC5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBvbmVUaW1lKSB7XG4gICAgaWYgKG5hbWUgPT09ICdzZWxlY3RlZGluZGV4JylcbiAgICAgIG5hbWUgPSAnc2VsZWN0ZWRJbmRleCc7XG5cbiAgICBpZiAobmFtZSAhPT0gJ3NlbGVjdGVkSW5kZXgnICYmIG5hbWUgIT09ICd2YWx1ZScpXG4gICAgICByZXR1cm4gSFRNTEVsZW1lbnQucHJvdG90eXBlLmJpbmQuY2FsbCh0aGlzLCBuYW1lLCB2YWx1ZSwgb25lVGltZSk7XG5cbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcblxuICAgIGlmIChvbmVUaW1lKVxuICAgICAgcmV0dXJuIHVwZGF0ZUlucHV0KHRoaXMsIG5hbWUsIHZhbHVlKTtcblxuICAgIHZhciBvYnNlcnZhYmxlID0gdmFsdWU7XG4gICAgdmFyIGJpbmRpbmcgPSBiaW5kSW5wdXRFdmVudCh0aGlzLCBuYW1lLCBvYnNlcnZhYmxlKTtcbiAgICB1cGRhdGVJbnB1dCh0aGlzLCBuYW1lLFxuICAgICAgICAgICAgICAgIG9ic2VydmFibGUub3BlbihpbnB1dEJpbmRpbmcodGhpcywgbmFtZSkpKTtcblxuICAgIC8vIE9wdGlvbiB1cGRhdGUgZXZlbnRzIG1heSBuZWVkIHRvIGFjY2VzcyBzZWxlY3QgYmluZGluZ3MuXG4gICAgcmV0dXJuIHVwZGF0ZUJpbmRpbmdzKHRoaXMsIG5hbWUsIGJpbmRpbmcpO1xuICB9XG59KSh0aGlzKTtcblxuLy8gQ29weXJpZ2h0IChjKSAyMDE0IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdCBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbi8vIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXQgaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4vLyBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXQgaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbi8vIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4vLyBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0IGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuXG4oZnVuY3Rpb24oZ2xvYmFsKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBmdW5jdGlvbiBhc3NlcnQodikge1xuICAgIGlmICghdilcbiAgICAgIHRocm93IG5ldyBFcnJvcignQXNzZXJ0aW9uIGZhaWxlZCcpO1xuICB9XG5cbiAgdmFyIGZvckVhY2ggPSBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsLmJpbmQoQXJyYXkucHJvdG90eXBlLmZvckVhY2gpO1xuXG4gIGZ1bmN0aW9uIGdldEZyYWdtZW50Um9vdChub2RlKSB7XG4gICAgdmFyIHA7XG4gICAgd2hpbGUgKHAgPSBub2RlLnBhcmVudE5vZGUpIHtcbiAgICAgIG5vZGUgPSBwO1xuICAgIH1cblxuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgZnVuY3Rpb24gc2VhcmNoUmVmSWQobm9kZSwgaWQpIHtcbiAgICBpZiAoIWlkKVxuICAgICAgcmV0dXJuO1xuXG4gICAgdmFyIHJlZjtcbiAgICB2YXIgc2VsZWN0b3IgPSAnIycgKyBpZDtcbiAgICB3aGlsZSAoIXJlZikge1xuICAgICAgbm9kZSA9IGdldEZyYWdtZW50Um9vdChub2RlKTtcblxuICAgICAgaWYgKG5vZGUucHJvdG9Db250ZW50XylcbiAgICAgICAgcmVmID0gbm9kZS5wcm90b0NvbnRlbnRfLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgZWxzZSBpZiAobm9kZS5nZXRFbGVtZW50QnlJZClcbiAgICAgICAgcmVmID0gbm9kZS5nZXRFbGVtZW50QnlJZChpZCk7XG5cbiAgICAgIGlmIChyZWYgfHwgIW5vZGUudGVtcGxhdGVDcmVhdG9yXylcbiAgICAgICAgYnJlYWtcblxuICAgICAgbm9kZSA9IG5vZGUudGVtcGxhdGVDcmVhdG9yXztcbiAgICB9XG5cbiAgICByZXR1cm4gcmVmO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0SW5zdGFuY2VSb290KG5vZGUpIHtcbiAgICB3aGlsZSAobm9kZS5wYXJlbnROb2RlKSB7XG4gICAgICBub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZS50ZW1wbGF0ZUNyZWF0b3JfID8gbm9kZSA6IG51bGw7XG4gIH1cblxuICB2YXIgTWFwO1xuICBpZiAoZ2xvYmFsLk1hcCAmJiB0eXBlb2YgZ2xvYmFsLk1hcC5wcm90b3R5cGUuZm9yRWFjaCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIE1hcCA9IGdsb2JhbC5NYXA7XG4gIH0gZWxzZSB7XG4gICAgTWFwID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmtleXMgPSBbXTtcbiAgICAgIHRoaXMudmFsdWVzID0gW107XG4gICAgfTtcblxuICAgIE1hcC5wcm90b3R5cGUgPSB7XG4gICAgICBzZXQ6IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5rZXlzLmluZGV4T2Yoa2V5KTtcbiAgICAgICAgaWYgKGluZGV4IDwgMCkge1xuICAgICAgICAgIHRoaXMua2V5cy5wdXNoKGtleSk7XG4gICAgICAgICAgdGhpcy52YWx1ZXMucHVzaCh2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy52YWx1ZXNbaW5kZXhdID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIGdldDogZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMua2V5cy5pbmRleE9mKGtleSk7XG4gICAgICAgIGlmIChpbmRleCA8IDApXG4gICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlc1tpbmRleF07XG4gICAgICB9LFxuXG4gICAgICBkZWxldGU6IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5rZXlzLmluZGV4T2Yoa2V5KTtcbiAgICAgICAgaWYgKGluZGV4IDwgMClcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5rZXlzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHRoaXMudmFsdWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSxcblxuICAgICAgZm9yRWFjaDogZnVuY3Rpb24oZiwgb3B0X3RoaXMpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmtleXMubGVuZ3RoOyBpKyspXG4gICAgICAgICAgZi5jYWxsKG9wdF90aGlzIHx8IHRoaXMsIHRoaXMudmFsdWVzW2ldLCB0aGlzLmtleXNbaV0sIHRoaXMpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBKU2NyaXB0IGRvZXMgbm90IGhhdmUgX19wcm90b19fLiBXZSB3cmFwIGFsbCBvYmplY3QgbGl0ZXJhbHMgd2l0aFxuICAvLyBjcmVhdGVPYmplY3Qgd2hpY2ggdXNlcyBPYmplY3QuY3JlYXRlLCBPYmplY3QuZGVmaW5lUHJvcGVydHkgYW5kXG4gIC8vIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgdG8gY3JlYXRlIGEgbmV3IG9iamVjdCB0aGF0IGRvZXMgdGhlIGV4YWN0XG4gIC8vIHNhbWUgdGhpbmcuIFRoZSBtYWluIGRvd25zaWRlIHRvIHRoaXMgc29sdXRpb24gaXMgdGhhdCB3ZSBoYXZlIHRvIGV4dHJhY3RcbiAgLy8gYWxsIHRob3NlIHByb3BlcnR5IGRlc2NyaXB0b3JzIGZvciBJRS5cbiAgdmFyIGNyZWF0ZU9iamVjdCA9ICgnX19wcm90b19fJyBpbiB7fSkgP1xuICAgICAgZnVuY3Rpb24ob2JqKSB7IHJldHVybiBvYmo7IH0gOlxuICAgICAgZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgIHZhciBwcm90byA9IG9iai5fX3Byb3RvX187XG4gICAgICAgIGlmICghcHJvdG8pXG4gICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgdmFyIG5ld09iamVjdCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmopLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShuZXdPYmplY3QsIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmosIG5hbWUpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBuZXdPYmplY3Q7XG4gICAgICB9O1xuXG4gIC8vIElFIGRvZXMgbm90IHN1cHBvcnQgaGF2ZSBEb2N1bWVudC5wcm90b3R5cGUuY29udGFpbnMuXG4gIGlmICh0eXBlb2YgZG9jdW1lbnQuY29udGFpbnMgIT0gJ2Z1bmN0aW9uJykge1xuICAgIERvY3VtZW50LnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIGlmIChub2RlID09PSB0aGlzIHx8IG5vZGUucGFyZW50Tm9kZSA9PT0gdGhpcylcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICByZXR1cm4gdGhpcy5kb2N1bWVudEVsZW1lbnQuY29udGFpbnMobm9kZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIEJJTkQgPSAnYmluZCc7XG4gIHZhciBSRVBFQVQgPSAncmVwZWF0JztcbiAgdmFyIElGID0gJ2lmJztcblxuICB2YXIgdGVtcGxhdGVBdHRyaWJ1dGVEaXJlY3RpdmVzID0ge1xuICAgICd0ZW1wbGF0ZSc6IHRydWUsXG4gICAgJ3JlcGVhdCc6IHRydWUsXG4gICAgJ2JpbmQnOiB0cnVlLFxuICAgICdyZWYnOiB0cnVlLFxuICAgICdpZic6IHRydWVcbiAgfTtcblxuICB2YXIgc2VtYW50aWNUZW1wbGF0ZUVsZW1lbnRzID0ge1xuICAgICdUSEVBRCc6IHRydWUsXG4gICAgJ1RCT0RZJzogdHJ1ZSxcbiAgICAnVEZPT1QnOiB0cnVlLFxuICAgICdUSCc6IHRydWUsXG4gICAgJ1RSJzogdHJ1ZSxcbiAgICAnVEQnOiB0cnVlLFxuICAgICdDT0xHUk9VUCc6IHRydWUsXG4gICAgJ0NPTCc6IHRydWUsXG4gICAgJ0NBUFRJT04nOiB0cnVlLFxuICAgICdPUFRJT04nOiB0cnVlLFxuICAgICdPUFRHUk9VUCc6IHRydWVcbiAgfTtcblxuICB2YXIgaGFzVGVtcGxhdGVFbGVtZW50ID0gdHlwZW9mIEhUTUxUZW1wbGF0ZUVsZW1lbnQgIT09ICd1bmRlZmluZWQnO1xuICBpZiAoaGFzVGVtcGxhdGVFbGVtZW50KSB7XG4gICAgLy8gVE9ETyhyYWZhZWx3KTogUmVtb3ZlIHdoZW4gZml4IGZvclxuICAgIC8vIGh0dHBzOi8vY29kZXJldmlldy5jaHJvbWl1bS5vcmcvMTY0ODAzMDAyL1xuICAgIC8vIG1ha2VzIGl0IHRvIENocm9tZSByZWxlYXNlLlxuICAgIChmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKTtcbiAgICAgIHZhciBkID0gdC5jb250ZW50Lm93bmVyRG9jdW1lbnQ7XG4gICAgICB2YXIgaHRtbCA9IGQuYXBwZW5kQ2hpbGQoZC5jcmVhdGVFbGVtZW50KCdodG1sJykpO1xuICAgICAgdmFyIGhlYWQgPSBodG1sLmFwcGVuZENoaWxkKGQuY3JlYXRlRWxlbWVudCgnaGVhZCcpKTtcbiAgICAgIHZhciBiYXNlID0gZC5jcmVhdGVFbGVtZW50KCdiYXNlJyk7XG4gICAgICBiYXNlLmhyZWYgPSBkb2N1bWVudC5iYXNlVVJJO1xuICAgICAgaGVhZC5hcHBlbmRDaGlsZChiYXNlKTtcbiAgICB9KSgpO1xuICB9XG5cbiAgdmFyIGFsbFRlbXBsYXRlc1NlbGVjdG9ycyA9ICd0ZW1wbGF0ZSwgJyArXG4gICAgICBPYmplY3Qua2V5cyhzZW1hbnRpY1RlbXBsYXRlRWxlbWVudHMpLm1hcChmdW5jdGlvbih0YWdOYW1lKSB7XG4gICAgICAgIHJldHVybiB0YWdOYW1lLnRvTG93ZXJDYXNlKCkgKyAnW3RlbXBsYXRlXSc7XG4gICAgICB9KS5qb2luKCcsICcpO1xuXG4gIGZ1bmN0aW9uIGlzU1ZHVGVtcGxhdGUoZWwpIHtcbiAgICByZXR1cm4gZWwudGFnTmFtZSA9PSAndGVtcGxhdGUnICYmXG4gICAgICAgICAgIGVsLm5hbWVzcGFjZVVSSSA9PSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNIVE1MVGVtcGxhdGUoZWwpIHtcbiAgICByZXR1cm4gZWwudGFnTmFtZSA9PSAnVEVNUExBVEUnICYmXG4gICAgICAgICAgIGVsLm5hbWVzcGFjZVVSSSA9PSAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCc7XG4gIH1cblxuICBmdW5jdGlvbiBpc0F0dHJpYnV0ZVRlbXBsYXRlKGVsKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4oc2VtYW50aWNUZW1wbGF0ZUVsZW1lbnRzW2VsLnRhZ05hbWVdICYmXG4gICAgICAgICAgICAgICAgICAgZWwuaGFzQXR0cmlidXRlKCd0ZW1wbGF0ZScpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzVGVtcGxhdGUoZWwpIHtcbiAgICBpZiAoZWwuaXNUZW1wbGF0ZV8gPT09IHVuZGVmaW5lZClcbiAgICAgIGVsLmlzVGVtcGxhdGVfID0gZWwudGFnTmFtZSA9PSAnVEVNUExBVEUnIHx8IGlzQXR0cmlidXRlVGVtcGxhdGUoZWwpO1xuXG4gICAgcmV0dXJuIGVsLmlzVGVtcGxhdGVfO1xuICB9XG5cbiAgLy8gRklYTUU6IE9ic2VydmUgdGVtcGxhdGVzIGJlaW5nIGFkZGVkL3JlbW92ZWQgZnJvbSBkb2N1bWVudHNcbiAgLy8gRklYTUU6IEV4cG9zZSBpbXBlcmF0aXZlIEFQSSB0byBkZWNvcmF0ZSBhbmQgb2JzZXJ2ZSB0ZW1wbGF0ZXMgaW5cbiAgLy8gXCJkaXNjb25uZWN0ZWQgdHJlc3NcIiAoZS5nLiBTaGFkb3dSb290KVxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oZSkge1xuICAgIGJvb3RzdHJhcFRlbXBsYXRlc1JlY3Vyc2l2ZWx5RnJvbShkb2N1bWVudCk7XG4gICAgLy8gRklYTUU6IElzIHRoaXMgbmVlZGVkPyBTZWVtcyBsaWtlIGl0IHNob3VsZG4ndCBiZS5cbiAgICBQbGF0Zm9ybS5wZXJmb3JtTWljcm90YXNrQ2hlY2twb2ludCgpO1xuICB9LCBmYWxzZSk7XG5cbiAgZnVuY3Rpb24gZm9yQWxsVGVtcGxhdGVzRnJvbShub2RlLCBmbikge1xuICAgIHZhciBzdWJUZW1wbGF0ZXMgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoYWxsVGVtcGxhdGVzU2VsZWN0b3JzKTtcblxuICAgIGlmIChpc1RlbXBsYXRlKG5vZGUpKVxuICAgICAgZm4obm9kZSlcbiAgICBmb3JFYWNoKHN1YlRlbXBsYXRlcywgZm4pO1xuICB9XG5cbiAgZnVuY3Rpb24gYm9vdHN0cmFwVGVtcGxhdGVzUmVjdXJzaXZlbHlGcm9tKG5vZGUpIHtcbiAgICBmdW5jdGlvbiBib290c3RyYXAodGVtcGxhdGUpIHtcbiAgICAgIGlmICghSFRNTFRlbXBsYXRlRWxlbWVudC5kZWNvcmF0ZSh0ZW1wbGF0ZSkpXG4gICAgICAgIGJvb3RzdHJhcFRlbXBsYXRlc1JlY3Vyc2l2ZWx5RnJvbSh0ZW1wbGF0ZS5jb250ZW50KTtcbiAgICB9XG5cbiAgICBmb3JBbGxUZW1wbGF0ZXNGcm9tKG5vZGUsIGJvb3RzdHJhcCk7XG4gIH1cblxuICBpZiAoIWhhc1RlbXBsYXRlRWxlbWVudCkge1xuICAgIC8qKlxuICAgICAqIFRoaXMgcmVwcmVzZW50cyBhIDx0ZW1wbGF0ZT4gZWxlbWVudC5cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAZXh0ZW5kcyB7SFRNTEVsZW1lbnR9XG4gICAgICovXG4gICAgZ2xvYmFsLkhUTUxUZW1wbGF0ZUVsZW1lbnQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRocm93IFR5cGVFcnJvcignSWxsZWdhbCBjb25zdHJ1Y3RvcicpO1xuICAgIH07XG4gIH1cblxuICB2YXIgaGFzUHJvdG8gPSAnX19wcm90b19fJyBpbiB7fTtcblxuICBmdW5jdGlvbiBtaXhpbih0bywgZnJvbSkge1xuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGZyb20pLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRvLCBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZnJvbSwgbmFtZSkpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gaHR0cDovL2R2Y3MudzMub3JnL2hnL3dlYmNvbXBvbmVudHMvcmF3LWZpbGUvdGlwL3NwZWMvdGVtcGxhdGVzL2luZGV4Lmh0bWwjZGZuLXRlbXBsYXRlLWNvbnRlbnRzLW93bmVyXG4gIGZ1bmN0aW9uIGdldE9yQ3JlYXRlVGVtcGxhdGVDb250ZW50c093bmVyKHRlbXBsYXRlKSB7XG4gICAgdmFyIGRvYyA9IHRlbXBsYXRlLm93bmVyRG9jdW1lbnRcbiAgICBpZiAoIWRvYy5kZWZhdWx0VmlldylcbiAgICAgIHJldHVybiBkb2M7XG4gICAgdmFyIGQgPSBkb2MudGVtcGxhdGVDb250ZW50c093bmVyXztcbiAgICBpZiAoIWQpIHtcbiAgICAgIC8vIFRPRE8oYXJ2KTogVGhpcyBzaG91bGQgZWl0aGVyIGJlIGEgRG9jdW1lbnQgb3IgSFRNTERvY3VtZW50IGRlcGVuZGluZ1xuICAgICAgLy8gb24gZG9jLlxuICAgICAgZCA9IGRvYy5pbXBsZW1lbnRhdGlvbi5jcmVhdGVIVE1MRG9jdW1lbnQoJycpO1xuICAgICAgd2hpbGUgKGQubGFzdENoaWxkKSB7XG4gICAgICAgIGQucmVtb3ZlQ2hpbGQoZC5sYXN0Q2hpbGQpO1xuICAgICAgfVxuICAgICAgZG9jLnRlbXBsYXRlQ29udGVudHNPd25lcl8gPSBkO1xuICAgIH1cbiAgICByZXR1cm4gZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFRlbXBsYXRlU3RhZ2luZ0RvY3VtZW50KHRlbXBsYXRlKSB7XG4gICAgaWYgKCF0ZW1wbGF0ZS5zdGFnaW5nRG9jdW1lbnRfKSB7XG4gICAgICB2YXIgb3duZXIgPSB0ZW1wbGF0ZS5vd25lckRvY3VtZW50O1xuICAgICAgaWYgKCFvd25lci5zdGFnaW5nRG9jdW1lbnRfKSB7XG4gICAgICAgIG93bmVyLnN0YWdpbmdEb2N1bWVudF8gPSBvd25lci5pbXBsZW1lbnRhdGlvbi5jcmVhdGVIVE1MRG9jdW1lbnQoJycpO1xuICAgICAgICBvd25lci5zdGFnaW5nRG9jdW1lbnRfLmlzU3RhZ2luZ0RvY3VtZW50ID0gdHJ1ZTtcbiAgICAgICAgLy8gVE9ETyhyYWZhZWx3KTogUmVtb3ZlIHdoZW4gZml4IGZvclxuICAgICAgICAvLyBodHRwczovL2NvZGVyZXZpZXcuY2hyb21pdW0ub3JnLzE2NDgwMzAwMi9cbiAgICAgICAgLy8gbWFrZXMgaXQgdG8gQ2hyb21lIHJlbGVhc2UuXG4gICAgICAgIHZhciBiYXNlID0gb3duZXIuc3RhZ2luZ0RvY3VtZW50Xy5jcmVhdGVFbGVtZW50KCdiYXNlJyk7XG4gICAgICAgIGJhc2UuaHJlZiA9IGRvY3VtZW50LmJhc2VVUkk7XG4gICAgICAgIG93bmVyLnN0YWdpbmdEb2N1bWVudF8uaGVhZC5hcHBlbmRDaGlsZChiYXNlKTtcblxuICAgICAgICBvd25lci5zdGFnaW5nRG9jdW1lbnRfLnN0YWdpbmdEb2N1bWVudF8gPSBvd25lci5zdGFnaW5nRG9jdW1lbnRfO1xuICAgICAgfVxuXG4gICAgICB0ZW1wbGF0ZS5zdGFnaW5nRG9jdW1lbnRfID0gb3duZXIuc3RhZ2luZ0RvY3VtZW50XztcbiAgICB9XG5cbiAgICByZXR1cm4gdGVtcGxhdGUuc3RhZ2luZ0RvY3VtZW50XztcbiAgfVxuXG4gIC8vIEZvciBub24tdGVtcGxhdGUgYnJvd3NlcnMsIHRoZSBwYXJzZXIgd2lsbCBkaXNhbGxvdyA8dGVtcGxhdGU+IGluIGNlcnRhaW5cbiAgLy8gbG9jYXRpb25zLCBzbyB3ZSBhbGxvdyBcImF0dHJpYnV0ZSB0ZW1wbGF0ZXNcIiB3aGljaCBjb21iaW5lIHRoZSB0ZW1wbGF0ZVxuICAvLyBlbGVtZW50IHdpdGggdGhlIHRvcC1sZXZlbCBjb250YWluZXIgbm9kZSBvZiB0aGUgY29udGVudCwgZS5nLlxuICAvL1xuICAvLyAgIDx0ciB0ZW1wbGF0ZSByZXBlYXQ9XCJ7eyBmb28gfX1cIlwiIGNsYXNzPVwiYmFyXCI+PHRkPkJhcjwvdGQ+PC90cj5cbiAgLy9cbiAgLy8gYmVjb21lc1xuICAvL1xuICAvLyAgIDx0ZW1wbGF0ZSByZXBlYXQ9XCJ7eyBmb28gfX1cIj5cbiAgLy8gICArICNkb2N1bWVudC1mcmFnbWVudFxuICAvLyAgICAgKyA8dHIgY2xhc3M9XCJiYXJcIj5cbiAgLy8gICAgICAgKyA8dGQ+QmFyPC90ZD5cbiAgLy9cbiAgZnVuY3Rpb24gZXh0cmFjdFRlbXBsYXRlRnJvbUF0dHJpYnV0ZVRlbXBsYXRlKGVsKSB7XG4gICAgdmFyIHRlbXBsYXRlID0gZWwub3duZXJEb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuICAgIGVsLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRlbXBsYXRlLCBlbCk7XG5cbiAgICB2YXIgYXR0cmlicyA9IGVsLmF0dHJpYnV0ZXM7XG4gICAgdmFyIGNvdW50ID0gYXR0cmlicy5sZW5ndGg7XG4gICAgd2hpbGUgKGNvdW50LS0gPiAwKSB7XG4gICAgICB2YXIgYXR0cmliID0gYXR0cmlic1tjb3VudF07XG4gICAgICBpZiAodGVtcGxhdGVBdHRyaWJ1dGVEaXJlY3RpdmVzW2F0dHJpYi5uYW1lXSkge1xuICAgICAgICBpZiAoYXR0cmliLm5hbWUgIT09ICd0ZW1wbGF0ZScpXG4gICAgICAgICAgdGVtcGxhdGUuc2V0QXR0cmlidXRlKGF0dHJpYi5uYW1lLCBhdHRyaWIudmFsdWUpO1xuICAgICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoYXR0cmliLm5hbWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGV4dHJhY3RUZW1wbGF0ZUZyb21TVkdUZW1wbGF0ZShlbCkge1xuICAgIHZhciB0ZW1wbGF0ZSA9IGVsLm93bmVyRG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKTtcbiAgICBlbC5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0ZW1wbGF0ZSwgZWwpO1xuXG4gICAgdmFyIGF0dHJpYnMgPSBlbC5hdHRyaWJ1dGVzO1xuICAgIHZhciBjb3VudCA9IGF0dHJpYnMubGVuZ3RoO1xuICAgIHdoaWxlIChjb3VudC0tID4gMCkge1xuICAgICAgdmFyIGF0dHJpYiA9IGF0dHJpYnNbY291bnRdO1xuICAgICAgdGVtcGxhdGUuc2V0QXR0cmlidXRlKGF0dHJpYi5uYW1lLCBhdHRyaWIudmFsdWUpO1xuICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKGF0dHJpYi5uYW1lKTtcbiAgICB9XG5cbiAgICBlbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsKTtcbiAgICByZXR1cm4gdGVtcGxhdGU7XG4gIH1cblxuICBmdW5jdGlvbiBsaWZ0Tm9uTmF0aXZlVGVtcGxhdGVDaGlsZHJlbkludG9Db250ZW50KHRlbXBsYXRlLCBlbCwgdXNlUm9vdCkge1xuICAgIHZhciBjb250ZW50ID0gdGVtcGxhdGUuY29udGVudDtcbiAgICBpZiAodXNlUm9vdCkge1xuICAgICAgY29udGVudC5hcHBlbmRDaGlsZChlbCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGNoaWxkO1xuICAgIHdoaWxlIChjaGlsZCA9IGVsLmZpcnN0Q2hpbGQpIHtcbiAgICAgIGNvbnRlbnQuYXBwZW5kQ2hpbGQoY2hpbGQpO1xuICAgIH1cbiAgfVxuXG4gIHZhciB0ZW1wbGF0ZU9ic2VydmVyO1xuICBpZiAodHlwZW9mIE11dGF0aW9uT2JzZXJ2ZXIgPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRlbXBsYXRlT2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbihyZWNvcmRzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlY29yZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcmVjb3Jkc1tpXS50YXJnZXQucmVmQ2hhbmdlZF8oKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbnN1cmVzIHByb3BlciBBUEkgYW5kIGNvbnRlbnQgbW9kZWwgZm9yIHRlbXBsYXRlIGVsZW1lbnRzLlxuICAgKiBAcGFyYW0ge0hUTUxUZW1wbGF0ZUVsZW1lbnR9IG9wdF9pbnN0YW5jZVJlZiBUaGUgdGVtcGxhdGUgZWxlbWVudCB3aGljaFxuICAgKiAgICAgfGVsfCB0ZW1wbGF0ZSBlbGVtZW50IHdpbGwgcmV0dXJuIGFzIHRoZSB2YWx1ZSBvZiBpdHMgcmVmKCksIGFuZCB3aG9zZVxuICAgKiAgICAgY29udGVudCB3aWxsIGJlIHVzZWQgYXMgc291cmNlIHdoZW4gY3JlYXRlSW5zdGFuY2UoKSBpcyBpbnZva2VkLlxuICAgKi9cbiAgSFRNTFRlbXBsYXRlRWxlbWVudC5kZWNvcmF0ZSA9IGZ1bmN0aW9uKGVsLCBvcHRfaW5zdGFuY2VSZWYpIHtcbiAgICBpZiAoZWwudGVtcGxhdGVJc0RlY29yYXRlZF8pXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICB2YXIgdGVtcGxhdGVFbGVtZW50ID0gZWw7XG4gICAgdGVtcGxhdGVFbGVtZW50LnRlbXBsYXRlSXNEZWNvcmF0ZWRfID0gdHJ1ZTtcblxuICAgIHZhciBpc05hdGl2ZUhUTUxUZW1wbGF0ZSA9IGlzSFRNTFRlbXBsYXRlKHRlbXBsYXRlRWxlbWVudCkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNUZW1wbGF0ZUVsZW1lbnQ7XG4gICAgdmFyIGJvb3RzdHJhcENvbnRlbnRzID0gaXNOYXRpdmVIVE1MVGVtcGxhdGU7XG4gICAgdmFyIGxpZnRDb250ZW50cyA9ICFpc05hdGl2ZUhUTUxUZW1wbGF0ZTtcbiAgICB2YXIgbGlmdFJvb3QgPSBmYWxzZTtcblxuICAgIGlmICghaXNOYXRpdmVIVE1MVGVtcGxhdGUpIHtcbiAgICAgIGlmIChpc0F0dHJpYnV0ZVRlbXBsYXRlKHRlbXBsYXRlRWxlbWVudCkpIHtcbiAgICAgICAgYXNzZXJ0KCFvcHRfaW5zdGFuY2VSZWYpO1xuICAgICAgICB0ZW1wbGF0ZUVsZW1lbnQgPSBleHRyYWN0VGVtcGxhdGVGcm9tQXR0cmlidXRlVGVtcGxhdGUoZWwpO1xuICAgICAgICB0ZW1wbGF0ZUVsZW1lbnQudGVtcGxhdGVJc0RlY29yYXRlZF8gPSB0cnVlO1xuICAgICAgICBpc05hdGl2ZUhUTUxUZW1wbGF0ZSA9IGhhc1RlbXBsYXRlRWxlbWVudDtcbiAgICAgICAgbGlmdFJvb3QgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChpc1NWR1RlbXBsYXRlKHRlbXBsYXRlRWxlbWVudCkpIHtcbiAgICAgICAgdGVtcGxhdGVFbGVtZW50ID0gZXh0cmFjdFRlbXBsYXRlRnJvbVNWR1RlbXBsYXRlKGVsKTtcbiAgICAgICAgdGVtcGxhdGVFbGVtZW50LnRlbXBsYXRlSXNEZWNvcmF0ZWRfID0gdHJ1ZTtcbiAgICAgICAgaXNOYXRpdmVIVE1MVGVtcGxhdGUgPSBoYXNUZW1wbGF0ZUVsZW1lbnQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFpc05hdGl2ZUhUTUxUZW1wbGF0ZSkge1xuICAgICAgZml4VGVtcGxhdGVFbGVtZW50UHJvdG90eXBlKHRlbXBsYXRlRWxlbWVudCk7XG4gICAgICB2YXIgZG9jID0gZ2V0T3JDcmVhdGVUZW1wbGF0ZUNvbnRlbnRzT3duZXIodGVtcGxhdGVFbGVtZW50KTtcbiAgICAgIHRlbXBsYXRlRWxlbWVudC5jb250ZW50XyA9IGRvYy5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgfVxuXG4gICAgaWYgKG9wdF9pbnN0YW5jZVJlZikge1xuICAgICAgLy8gdGVtcGxhdGUgaXMgY29udGFpbmVkIHdpdGhpbiBhbiBpbnN0YW5jZSwgaXRzIGRpcmVjdCBjb250ZW50IG11c3QgYmVcbiAgICAgIC8vIGVtcHR5XG4gICAgICB0ZW1wbGF0ZUVsZW1lbnQuaW5zdGFuY2VSZWZfID0gb3B0X2luc3RhbmNlUmVmO1xuICAgIH0gZWxzZSBpZiAobGlmdENvbnRlbnRzKSB7XG4gICAgICBsaWZ0Tm9uTmF0aXZlVGVtcGxhdGVDaGlsZHJlbkludG9Db250ZW50KHRlbXBsYXRlRWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpZnRSb290KTtcbiAgICB9IGVsc2UgaWYgKGJvb3RzdHJhcENvbnRlbnRzKSB7XG4gICAgICBib290c3RyYXBUZW1wbGF0ZXNSZWN1cnNpdmVseUZyb20odGVtcGxhdGVFbGVtZW50LmNvbnRlbnQpO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8vIFRPRE8ocmFmYWVsdyk6IFRoaXMgdXNlZCB0byBkZWNvcmF0ZSByZWN1cnNpdmVseSBhbGwgdGVtcGxhdGVzIGZyb20gYSBnaXZlblxuICAvLyBub2RlLiBUaGlzIGhhcHBlbnMgYnkgZGVmYXVsdCBvbiAnRE9NQ29udGVudExvYWRlZCcsIGJ1dCBtYXkgYmUgbmVlZGVkXG4gIC8vIGluIHN1YnRyZWVzIG5vdCBkZXNjZW5kZW50IGZyb20gZG9jdW1lbnQgKGUuZy4gU2hhZG93Um9vdCkuXG4gIC8vIFJldmlldyB3aGV0aGVyIHRoaXMgaXMgdGhlIHJpZ2h0IHB1YmxpYyBBUEkuXG4gIEhUTUxUZW1wbGF0ZUVsZW1lbnQuYm9vdHN0cmFwID0gYm9vdHN0cmFwVGVtcGxhdGVzUmVjdXJzaXZlbHlGcm9tO1xuXG4gIHZhciBodG1sRWxlbWVudCA9IGdsb2JhbC5IVE1MVW5rbm93bkVsZW1lbnQgfHwgSFRNTEVsZW1lbnQ7XG5cbiAgdmFyIGNvbnRlbnREZXNjcmlwdG9yID0ge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb250ZW50XztcbiAgICB9LFxuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH07XG5cbiAgaWYgKCFoYXNUZW1wbGF0ZUVsZW1lbnQpIHtcbiAgICAvLyBHZWNrbyBpcyBtb3JlIHBpY2t5IHdpdGggdGhlIHByb3RvdHlwZSB0aGFuIFdlYktpdC4gTWFrZSBzdXJlIHRvIHVzZSB0aGVcbiAgICAvLyBzYW1lIHByb3RvdHlwZSBhcyBjcmVhdGVkIGluIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICBIVE1MVGVtcGxhdGVFbGVtZW50LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoaHRtbEVsZW1lbnQucHJvdG90eXBlKTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShIVE1MVGVtcGxhdGVFbGVtZW50LnByb3RvdHlwZSwgJ2NvbnRlbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50RGVzY3JpcHRvcik7XG4gIH1cblxuICBmdW5jdGlvbiBmaXhUZW1wbGF0ZUVsZW1lbnRQcm90b3R5cGUoZWwpIHtcbiAgICBpZiAoaGFzUHJvdG8pXG4gICAgICBlbC5fX3Byb3RvX18gPSBIVE1MVGVtcGxhdGVFbGVtZW50LnByb3RvdHlwZTtcbiAgICBlbHNlXG4gICAgICBtaXhpbihlbCwgSFRNTFRlbXBsYXRlRWxlbWVudC5wcm90b3R5cGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gZW5zdXJlU2V0TW9kZWxTY2hlZHVsZWQodGVtcGxhdGUpIHtcbiAgICBpZiAoIXRlbXBsYXRlLnNldE1vZGVsRm5fKSB7XG4gICAgICB0ZW1wbGF0ZS5zZXRNb2RlbEZuXyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0ZW1wbGF0ZS5zZXRNb2RlbEZuU2NoZWR1bGVkXyA9IGZhbHNlO1xuICAgICAgICB2YXIgbWFwID0gZ2V0QmluZGluZ3ModGVtcGxhdGUsXG4gICAgICAgICAgICB0ZW1wbGF0ZS5kZWxlZ2F0ZV8gJiYgdGVtcGxhdGUuZGVsZWdhdGVfLnByZXBhcmVCaW5kaW5nKTtcbiAgICAgICAgcHJvY2Vzc0JpbmRpbmdzKHRlbXBsYXRlLCBtYXAsIHRlbXBsYXRlLm1vZGVsXyk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmICghdGVtcGxhdGUuc2V0TW9kZWxGblNjaGVkdWxlZF8pIHtcbiAgICAgIHRlbXBsYXRlLnNldE1vZGVsRm5TY2hlZHVsZWRfID0gdHJ1ZTtcbiAgICAgIE9ic2VydmVyLnJ1bkVPTV8odGVtcGxhdGUuc2V0TW9kZWxGbl8pO1xuICAgIH1cbiAgfVxuXG4gIG1peGluKEhUTUxUZW1wbGF0ZUVsZW1lbnQucHJvdG90eXBlLCB7XG4gICAgYmluZDogZnVuY3Rpb24obmFtZSwgdmFsdWUsIG9uZVRpbWUpIHtcbiAgICAgIGlmIChuYW1lICE9ICdyZWYnKVxuICAgICAgICByZXR1cm4gRWxlbWVudC5wcm90b3R5cGUuYmluZC5jYWxsKHRoaXMsIG5hbWUsIHZhbHVlLCBvbmVUaW1lKTtcblxuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIHJlZiA9IG9uZVRpbWUgPyB2YWx1ZSA6IHZhbHVlLm9wZW4oZnVuY3Rpb24ocmVmKSB7XG4gICAgICAgIHNlbGYuc2V0QXR0cmlidXRlKCdyZWYnLCByZWYpO1xuICAgICAgICBzZWxmLnJlZkNoYW5nZWRfKCk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ3JlZicsIHJlZik7XG4gICAgICB0aGlzLnJlZkNoYW5nZWRfKCk7XG4gICAgICBpZiAob25lVGltZSlcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICBpZiAoIXRoaXMuYmluZGluZ3NfKSB7XG4gICAgICAgIHRoaXMuYmluZGluZ3NfID0geyByZWY6IHZhbHVlIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmJpbmRpbmdzXy5yZWYgPSB2YWx1ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICBwcm9jZXNzQmluZGluZ0RpcmVjdGl2ZXNfOiBmdW5jdGlvbihkaXJlY3RpdmVzKSB7XG4gICAgICBpZiAodGhpcy5pdGVyYXRvcl8pXG4gICAgICAgIHRoaXMuaXRlcmF0b3JfLmNsb3NlRGVwcygpO1xuXG4gICAgICBpZiAoIWRpcmVjdGl2ZXMuaWYgJiYgIWRpcmVjdGl2ZXMuYmluZCAmJiAhZGlyZWN0aXZlcy5yZXBlYXQpIHtcbiAgICAgICAgaWYgKHRoaXMuaXRlcmF0b3JfKSB7XG4gICAgICAgICAgdGhpcy5pdGVyYXRvcl8uY2xvc2UoKTtcbiAgICAgICAgICB0aGlzLml0ZXJhdG9yXyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLml0ZXJhdG9yXykge1xuICAgICAgICB0aGlzLml0ZXJhdG9yXyA9IG5ldyBUZW1wbGF0ZUl0ZXJhdG9yKHRoaXMpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLml0ZXJhdG9yXy51cGRhdGVEZXBlbmRlbmNpZXMoZGlyZWN0aXZlcywgdGhpcy5tb2RlbF8pO1xuXG4gICAgICBpZiAodGVtcGxhdGVPYnNlcnZlcikge1xuICAgICAgICB0ZW1wbGF0ZU9ic2VydmVyLm9ic2VydmUodGhpcywgeyBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVGaWx0ZXI6IFsncmVmJ10gfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLml0ZXJhdG9yXztcbiAgICB9LFxuXG4gICAgY3JlYXRlSW5zdGFuY2U6IGZ1bmN0aW9uKG1vZGVsLCBiaW5kaW5nRGVsZWdhdGUsIGRlbGVnYXRlXykge1xuICAgICAgaWYgKGJpbmRpbmdEZWxlZ2F0ZSlcbiAgICAgICAgZGVsZWdhdGVfID0gdGhpcy5uZXdEZWxlZ2F0ZV8oYmluZGluZ0RlbGVnYXRlKTtcbiAgICAgIGVsc2UgaWYgKCFkZWxlZ2F0ZV8pXG4gICAgICAgIGRlbGVnYXRlXyA9IHRoaXMuZGVsZWdhdGVfO1xuXG4gICAgICBpZiAoIXRoaXMucmVmQ29udGVudF8pXG4gICAgICAgIHRoaXMucmVmQ29udGVudF8gPSB0aGlzLnJlZl8uY29udGVudDtcbiAgICAgIHZhciBjb250ZW50ID0gdGhpcy5yZWZDb250ZW50XztcbiAgICAgIGlmIChjb250ZW50LmZpcnN0Q2hpbGQgPT09IG51bGwpXG4gICAgICAgIHJldHVybiBlbXB0eUluc3RhbmNlO1xuXG4gICAgICB2YXIgbWFwID0gZ2V0SW5zdGFuY2VCaW5kaW5nTWFwKGNvbnRlbnQsIGRlbGVnYXRlXyk7XG4gICAgICB2YXIgc3RhZ2luZ0RvY3VtZW50ID0gZ2V0VGVtcGxhdGVTdGFnaW5nRG9jdW1lbnQodGhpcyk7XG4gICAgICB2YXIgaW5zdGFuY2UgPSBzdGFnaW5nRG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICAgaW5zdGFuY2UudGVtcGxhdGVDcmVhdG9yXyA9IHRoaXM7XG4gICAgICBpbnN0YW5jZS5wcm90b0NvbnRlbnRfID0gY29udGVudDtcbiAgICAgIGluc3RhbmNlLmJpbmRpbmdzXyA9IFtdO1xuICAgICAgaW5zdGFuY2UudGVybWluYXRvcl8gPSBudWxsO1xuICAgICAgdmFyIGluc3RhbmNlUmVjb3JkID0gaW5zdGFuY2UudGVtcGxhdGVJbnN0YW5jZV8gPSB7XG4gICAgICAgIGZpcnN0Tm9kZTogbnVsbCxcbiAgICAgICAgbGFzdE5vZGU6IG51bGwsXG4gICAgICAgIG1vZGVsOiBtb2RlbFxuICAgICAgfTtcblxuICAgICAgdmFyIGkgPSAwO1xuICAgICAgdmFyIGNvbGxlY3RUZXJtaW5hdG9yID0gZmFsc2U7XG4gICAgICBmb3IgKHZhciBjaGlsZCA9IGNvbnRlbnQuZmlyc3RDaGlsZDsgY2hpbGQ7IGNoaWxkID0gY2hpbGQubmV4dFNpYmxpbmcpIHtcbiAgICAgICAgLy8gVGhlIHRlcm1pbmF0b3Igb2YgdGhlIGluc3RhbmNlIGlzIHRoZSBjbG9uZSBvZiB0aGUgbGFzdCBjaGlsZCBvZiB0aGVcbiAgICAgICAgLy8gY29udGVudC4gSWYgdGhlIGxhc3QgY2hpbGQgaXMgYW4gYWN0aXZlIHRlbXBsYXRlLCBpdCBtYXkgcHJvZHVjZVxuICAgICAgICAvLyBpbnN0YW5jZXMgYXMgYSByZXN1bHQgb2YgcHJvZHVjdGlvbiwgc28gc2ltcGx5IGNvbGxlY3RpbmcgdGhlIGxhc3RcbiAgICAgICAgLy8gY2hpbGQgb2YgdGhlIGluc3RhbmNlIGFmdGVyIGl0IGhhcyBmaW5pc2hlZCBwcm9kdWNpbmcgbWF5IGJlIHdyb25nLlxuICAgICAgICBpZiAoY2hpbGQubmV4dFNpYmxpbmcgPT09IG51bGwpXG4gICAgICAgICAgY29sbGVjdFRlcm1pbmF0b3IgPSB0cnVlO1xuXG4gICAgICAgIHZhciBjbG9uZSA9IGNsb25lQW5kQmluZEluc3RhbmNlKGNoaWxkLCBpbnN0YW5jZSwgc3RhZ2luZ0RvY3VtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXAuY2hpbGRyZW5baSsrXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGVnYXRlXyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UuYmluZGluZ3NfKTtcbiAgICAgICAgY2xvbmUudGVtcGxhdGVJbnN0YW5jZV8gPSBpbnN0YW5jZVJlY29yZDtcbiAgICAgICAgaWYgKGNvbGxlY3RUZXJtaW5hdG9yKVxuICAgICAgICAgIGluc3RhbmNlLnRlcm1pbmF0b3JfID0gY2xvbmU7XG4gICAgICB9XG5cbiAgICAgIGluc3RhbmNlUmVjb3JkLmZpcnN0Tm9kZSA9IGluc3RhbmNlLmZpcnN0Q2hpbGQ7XG4gICAgICBpbnN0YW5jZVJlY29yZC5sYXN0Tm9kZSA9IGluc3RhbmNlLmxhc3RDaGlsZDtcbiAgICAgIGluc3RhbmNlLnRlbXBsYXRlQ3JlYXRvcl8gPSB1bmRlZmluZWQ7XG4gICAgICBpbnN0YW5jZS5wcm90b0NvbnRlbnRfID0gdW5kZWZpbmVkO1xuICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgIH0sXG5cbiAgICBnZXQgbW9kZWwoKSB7XG4gICAgICByZXR1cm4gdGhpcy5tb2RlbF87XG4gICAgfSxcblxuICAgIHNldCBtb2RlbChtb2RlbCkge1xuICAgICAgdGhpcy5tb2RlbF8gPSBtb2RlbDtcbiAgICAgIGVuc3VyZVNldE1vZGVsU2NoZWR1bGVkKHRoaXMpO1xuICAgIH0sXG5cbiAgICBnZXQgYmluZGluZ0RlbGVnYXRlKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZGVsZWdhdGVfICYmIHRoaXMuZGVsZWdhdGVfLnJhdztcbiAgICB9LFxuXG4gICAgcmVmQ2hhbmdlZF86IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCF0aGlzLml0ZXJhdG9yXyB8fCB0aGlzLnJlZkNvbnRlbnRfID09PSB0aGlzLnJlZl8uY29udGVudClcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICB0aGlzLnJlZkNvbnRlbnRfID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5pdGVyYXRvcl8udmFsdWVDaGFuZ2VkKCk7XG4gICAgICB0aGlzLml0ZXJhdG9yXy51cGRhdGVJdGVyYXRlZFZhbHVlKHRoaXMuaXRlcmF0b3JfLmdldFVwZGF0ZWRWYWx1ZSgpKTtcbiAgICB9LFxuXG4gICAgY2xlYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5tb2RlbF8gPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLmRlbGVnYXRlXyA9IHVuZGVmaW5lZDtcbiAgICAgIGlmICh0aGlzLmJpbmRpbmdzXyAmJiB0aGlzLmJpbmRpbmdzXy5yZWYpXG4gICAgICAgIHRoaXMuYmluZGluZ3NfLnJlZi5jbG9zZSgpXG4gICAgICB0aGlzLnJlZkNvbnRlbnRfID0gdW5kZWZpbmVkO1xuICAgICAgaWYgKCF0aGlzLml0ZXJhdG9yXylcbiAgICAgICAgcmV0dXJuO1xuICAgICAgdGhpcy5pdGVyYXRvcl8udmFsdWVDaGFuZ2VkKCk7XG4gICAgICB0aGlzLml0ZXJhdG9yXy5jbG9zZSgpXG4gICAgICB0aGlzLml0ZXJhdG9yXyA9IHVuZGVmaW5lZDtcbiAgICB9LFxuXG4gICAgc2V0RGVsZWdhdGVfOiBmdW5jdGlvbihkZWxlZ2F0ZSkge1xuICAgICAgdGhpcy5kZWxlZ2F0ZV8gPSBkZWxlZ2F0ZTtcbiAgICAgIHRoaXMuYmluZGluZ01hcF8gPSB1bmRlZmluZWQ7XG4gICAgICBpZiAodGhpcy5pdGVyYXRvcl8pIHtcbiAgICAgICAgdGhpcy5pdGVyYXRvcl8uaW5zdGFuY2VQb3NpdGlvbkNoYW5nZWRGbl8gPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuaXRlcmF0b3JfLmluc3RhbmNlTW9kZWxGbl8gPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfSxcblxuICAgIG5ld0RlbGVnYXRlXzogZnVuY3Rpb24oYmluZGluZ0RlbGVnYXRlKSB7XG4gICAgICBpZiAoIWJpbmRpbmdEZWxlZ2F0ZSlcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICBmdW5jdGlvbiBkZWxlZ2F0ZUZuKG5hbWUpIHtcbiAgICAgICAgdmFyIGZuID0gYmluZGluZ0RlbGVnYXRlICYmIGJpbmRpbmdEZWxlZ2F0ZVtuYW1lXTtcbiAgICAgICAgaWYgKHR5cGVvZiBmbiAhPSAnZnVuY3Rpb24nKVxuICAgICAgICAgIHJldHVybjtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KGJpbmRpbmdEZWxlZ2F0ZSwgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYmluZGluZ01hcHM6IHt9LFxuICAgICAgICByYXc6IGJpbmRpbmdEZWxlZ2F0ZSxcbiAgICAgICAgcHJlcGFyZUJpbmRpbmc6IGRlbGVnYXRlRm4oJ3ByZXBhcmVCaW5kaW5nJyksXG4gICAgICAgIHByZXBhcmVJbnN0YW5jZU1vZGVsOiBkZWxlZ2F0ZUZuKCdwcmVwYXJlSW5zdGFuY2VNb2RlbCcpLFxuICAgICAgICBwcmVwYXJlSW5zdGFuY2VQb3NpdGlvbkNoYW5nZWQ6XG4gICAgICAgICAgICBkZWxlZ2F0ZUZuKCdwcmVwYXJlSW5zdGFuY2VQb3NpdGlvbkNoYW5nZWQnKVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgc2V0IGJpbmRpbmdEZWxlZ2F0ZShiaW5kaW5nRGVsZWdhdGUpIHtcbiAgICAgIGlmICh0aGlzLmRlbGVnYXRlXykge1xuICAgICAgICB0aHJvdyBFcnJvcignVGVtcGxhdGUgbXVzdCBiZSBjbGVhcmVkIGJlZm9yZSBhIG5ldyBiaW5kaW5nRGVsZWdhdGUgJyArXG4gICAgICAgICAgICAgICAgICAgICdjYW4gYmUgYXNzaWduZWQnKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXREZWxlZ2F0ZV8odGhpcy5uZXdEZWxlZ2F0ZV8oYmluZGluZ0RlbGVnYXRlKSk7XG4gICAgfSxcblxuICAgIGdldCByZWZfKCkge1xuICAgICAgdmFyIHJlZiA9IHNlYXJjaFJlZklkKHRoaXMsIHRoaXMuZ2V0QXR0cmlidXRlKCdyZWYnKSk7XG4gICAgICBpZiAoIXJlZilcbiAgICAgICAgcmVmID0gdGhpcy5pbnN0YW5jZVJlZl87XG5cbiAgICAgIGlmICghcmVmKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgdmFyIG5leHRSZWYgPSByZWYucmVmXztcbiAgICAgIHJldHVybiBuZXh0UmVmID8gbmV4dFJlZiA6IHJlZjtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIFJldHVybnNcbiAgLy8gICBhKSB1bmRlZmluZWQgaWYgdGhlcmUgYXJlIG5vIG11c3RhY2hlcy5cbiAgLy8gICBiKSBbVEVYVCwgKE9ORV9USU1FPywgUEFUSCwgREVMRUdBVEVfRk4sIFRFWFQpK10gaWYgdGhlcmUgaXMgYXQgbGVhc3Qgb25lIG11c3RhY2hlLlxuICBmdW5jdGlvbiBwYXJzZU11c3RhY2hlcyhzLCBuYW1lLCBub2RlLCBwcmVwYXJlQmluZGluZ0ZuKSB7XG4gICAgaWYgKCFzIHx8ICFzLmxlbmd0aClcbiAgICAgIHJldHVybjtcblxuICAgIHZhciB0b2tlbnM7XG4gICAgdmFyIGxlbmd0aCA9IHMubGVuZ3RoO1xuICAgIHZhciBzdGFydEluZGV4ID0gMCwgbGFzdEluZGV4ID0gMCwgZW5kSW5kZXggPSAwO1xuICAgIHZhciBvbmx5T25lVGltZSA9IHRydWU7XG4gICAgd2hpbGUgKGxhc3RJbmRleCA8IGxlbmd0aCkge1xuICAgICAgdmFyIHN0YXJ0SW5kZXggPSBzLmluZGV4T2YoJ3t7JywgbGFzdEluZGV4KTtcbiAgICAgIHZhciBvbmVUaW1lU3RhcnQgPSBzLmluZGV4T2YoJ1tbJywgbGFzdEluZGV4KTtcbiAgICAgIHZhciBvbmVUaW1lID0gZmFsc2U7XG4gICAgICB2YXIgdGVybWluYXRvciA9ICd9fSc7XG5cbiAgICAgIGlmIChvbmVUaW1lU3RhcnQgPj0gMCAmJlxuICAgICAgICAgIChzdGFydEluZGV4IDwgMCB8fCBvbmVUaW1lU3RhcnQgPCBzdGFydEluZGV4KSkge1xuICAgICAgICBzdGFydEluZGV4ID0gb25lVGltZVN0YXJ0O1xuICAgICAgICBvbmVUaW1lID0gdHJ1ZTtcbiAgICAgICAgdGVybWluYXRvciA9ICddXSc7XG4gICAgICB9XG5cbiAgICAgIGVuZEluZGV4ID0gc3RhcnRJbmRleCA8IDAgPyAtMSA6IHMuaW5kZXhPZih0ZXJtaW5hdG9yLCBzdGFydEluZGV4ICsgMik7XG5cbiAgICAgIGlmIChlbmRJbmRleCA8IDApIHtcbiAgICAgICAgaWYgKCF0b2tlbnMpXG4gICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHRva2Vucy5wdXNoKHMuc2xpY2UobGFzdEluZGV4KSk7IC8vIFRFWFRcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHRva2VucyA9IHRva2VucyB8fCBbXTtcbiAgICAgIHRva2Vucy5wdXNoKHMuc2xpY2UobGFzdEluZGV4LCBzdGFydEluZGV4KSk7IC8vIFRFWFRcbiAgICAgIHZhciBwYXRoU3RyaW5nID0gcy5zbGljZShzdGFydEluZGV4ICsgMiwgZW5kSW5kZXgpLnRyaW0oKTtcbiAgICAgIHRva2Vucy5wdXNoKG9uZVRpbWUpOyAvLyBPTkVfVElNRT9cbiAgICAgIG9ubHlPbmVUaW1lID0gb25seU9uZVRpbWUgJiYgb25lVGltZTtcbiAgICAgIHZhciBkZWxlZ2F0ZUZuID0gcHJlcGFyZUJpbmRpbmdGbiAmJlxuICAgICAgICAgICAgICAgICAgICAgICBwcmVwYXJlQmluZGluZ0ZuKHBhdGhTdHJpbmcsIG5hbWUsIG5vZGUpO1xuICAgICAgLy8gRG9uJ3QgdHJ5IHRvIHBhcnNlIHRoZSBleHByZXNzaW9uIGlmIHRoZXJlJ3MgYSBwcmVwYXJlQmluZGluZyBmdW5jdGlvblxuICAgICAgaWYgKGRlbGVnYXRlRm4gPT0gbnVsbCkge1xuICAgICAgICB0b2tlbnMucHVzaChQYXRoLmdldChwYXRoU3RyaW5nKSk7IC8vIFBBVEhcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRva2Vucy5wdXNoKG51bGwpO1xuICAgICAgfVxuICAgICAgdG9rZW5zLnB1c2goZGVsZWdhdGVGbik7IC8vIERFTEVHQVRFX0ZOXG4gICAgICBsYXN0SW5kZXggPSBlbmRJbmRleCArIDI7XG4gICAgfVxuXG4gICAgaWYgKGxhc3RJbmRleCA9PT0gbGVuZ3RoKVxuICAgICAgdG9rZW5zLnB1c2goJycpOyAvLyBURVhUXG5cbiAgICB0b2tlbnMuaGFzT25lUGF0aCA9IHRva2Vucy5sZW5ndGggPT09IDU7XG4gICAgdG9rZW5zLmlzU2ltcGxlUGF0aCA9IHRva2Vucy5oYXNPbmVQYXRoICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vuc1swXSA9PSAnJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICB0b2tlbnNbNF0gPT0gJyc7XG4gICAgdG9rZW5zLm9ubHlPbmVUaW1lID0gb25seU9uZVRpbWU7XG5cbiAgICB0b2tlbnMuY29tYmluYXRvciA9IGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgdmFyIG5ld1ZhbHVlID0gdG9rZW5zWzBdO1xuXG4gICAgICBmb3IgKHZhciBpID0gMTsgaSA8IHRva2Vucy5sZW5ndGg7IGkgKz0gNCkge1xuICAgICAgICB2YXIgdmFsdWUgPSB0b2tlbnMuaGFzT25lUGF0aCA/IHZhbHVlcyA6IHZhbHVlc1soaSAtIDEpIC8gNF07XG4gICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgIG5ld1ZhbHVlICs9IHZhbHVlO1xuICAgICAgICBuZXdWYWx1ZSArPSB0b2tlbnNbaSArIDNdO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3VmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRva2VucztcbiAgfTtcblxuICBmdW5jdGlvbiBwcm9jZXNzT25lVGltZUJpbmRpbmcobmFtZSwgdG9rZW5zLCBub2RlLCBtb2RlbCkge1xuICAgIGlmICh0b2tlbnMuaGFzT25lUGF0aCkge1xuICAgICAgdmFyIGRlbGVnYXRlRm4gPSB0b2tlbnNbM107XG4gICAgICB2YXIgdmFsdWUgPSBkZWxlZ2F0ZUZuID8gZGVsZWdhdGVGbihtb2RlbCwgbm9kZSwgdHJ1ZSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2Vuc1syXS5nZXRWYWx1ZUZyb20obW9kZWwpO1xuICAgICAgcmV0dXJuIHRva2Vucy5pc1NpbXBsZVBhdGggPyB2YWx1ZSA6IHRva2Vucy5jb21iaW5hdG9yKHZhbHVlKTtcbiAgICB9XG5cbiAgICB2YXIgdmFsdWVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCB0b2tlbnMubGVuZ3RoOyBpICs9IDQpIHtcbiAgICAgIHZhciBkZWxlZ2F0ZUZuID0gdG9rZW5zW2kgKyAyXTtcbiAgICAgIHZhbHVlc1soaSAtIDEpIC8gNF0gPSBkZWxlZ2F0ZUZuID8gZGVsZWdhdGVGbihtb2RlbCwgbm9kZSkgOlxuICAgICAgICAgIHRva2Vuc1tpICsgMV0uZ2V0VmFsdWVGcm9tKG1vZGVsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdG9rZW5zLmNvbWJpbmF0b3IodmFsdWVzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb2Nlc3NTaW5nbGVQYXRoQmluZGluZyhuYW1lLCB0b2tlbnMsIG5vZGUsIG1vZGVsKSB7XG4gICAgdmFyIGRlbGVnYXRlRm4gPSB0b2tlbnNbM107XG4gICAgdmFyIG9ic2VydmVyID0gZGVsZWdhdGVGbiA/IGRlbGVnYXRlRm4obW9kZWwsIG5vZGUsIGZhbHNlKSA6XG4gICAgICAgIG5ldyBQYXRoT2JzZXJ2ZXIobW9kZWwsIHRva2Vuc1syXSk7XG5cbiAgICByZXR1cm4gdG9rZW5zLmlzU2ltcGxlUGF0aCA/IG9ic2VydmVyIDpcbiAgICAgICAgbmV3IE9ic2VydmVyVHJhbnNmb3JtKG9ic2VydmVyLCB0b2tlbnMuY29tYmluYXRvcik7XG4gIH1cblxuICBmdW5jdGlvbiBwcm9jZXNzQmluZGluZyhuYW1lLCB0b2tlbnMsIG5vZGUsIG1vZGVsKSB7XG4gICAgaWYgKHRva2Vucy5vbmx5T25lVGltZSlcbiAgICAgIHJldHVybiBwcm9jZXNzT25lVGltZUJpbmRpbmcobmFtZSwgdG9rZW5zLCBub2RlLCBtb2RlbCk7XG5cbiAgICBpZiAodG9rZW5zLmhhc09uZVBhdGgpXG4gICAgICByZXR1cm4gcHJvY2Vzc1NpbmdsZVBhdGhCaW5kaW5nKG5hbWUsIHRva2Vucywgbm9kZSwgbW9kZWwpO1xuXG4gICAgdmFyIG9ic2VydmVyID0gbmV3IENvbXBvdW5kT2JzZXJ2ZXIoKTtcblxuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSArPSA0KSB7XG4gICAgICB2YXIgb25lVGltZSA9IHRva2Vuc1tpXTtcbiAgICAgIHZhciBkZWxlZ2F0ZUZuID0gdG9rZW5zW2kgKyAyXTtcblxuICAgICAgaWYgKGRlbGVnYXRlRm4pIHtcbiAgICAgICAgdmFyIHZhbHVlID0gZGVsZWdhdGVGbihtb2RlbCwgbm9kZSwgb25lVGltZSk7XG4gICAgICAgIGlmIChvbmVUaW1lKVxuICAgICAgICAgIG9ic2VydmVyLmFkZFBhdGgodmFsdWUpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBvYnNlcnZlci5hZGRPYnNlcnZlcih2YWx1ZSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgcGF0aCA9IHRva2Vuc1tpICsgMV07XG4gICAgICBpZiAob25lVGltZSlcbiAgICAgICAgb2JzZXJ2ZXIuYWRkUGF0aChwYXRoLmdldFZhbHVlRnJvbShtb2RlbCkpXG4gICAgICBlbHNlXG4gICAgICAgIG9ic2VydmVyLmFkZFBhdGgobW9kZWwsIHBhdGgpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgT2JzZXJ2ZXJUcmFuc2Zvcm0ob2JzZXJ2ZXIsIHRva2Vucy5jb21iaW5hdG9yKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb2Nlc3NCaW5kaW5ncyhub2RlLCBiaW5kaW5ncywgbW9kZWwsIGluc3RhbmNlQmluZGluZ3MpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJpbmRpbmdzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICB2YXIgbmFtZSA9IGJpbmRpbmdzW2ldXG4gICAgICB2YXIgdG9rZW5zID0gYmluZGluZ3NbaSArIDFdO1xuICAgICAgdmFyIHZhbHVlID0gcHJvY2Vzc0JpbmRpbmcobmFtZSwgdG9rZW5zLCBub2RlLCBtb2RlbCk7XG4gICAgICB2YXIgYmluZGluZyA9IG5vZGUuYmluZChuYW1lLCB2YWx1ZSwgdG9rZW5zLm9ubHlPbmVUaW1lKTtcbiAgICAgIGlmIChiaW5kaW5nICYmIGluc3RhbmNlQmluZGluZ3MpXG4gICAgICAgIGluc3RhbmNlQmluZGluZ3MucHVzaChiaW5kaW5nKTtcbiAgICB9XG5cbiAgICBub2RlLmJpbmRGaW5pc2hlZCgpO1xuICAgIGlmICghYmluZGluZ3MuaXNUZW1wbGF0ZSlcbiAgICAgIHJldHVybjtcblxuICAgIG5vZGUubW9kZWxfID0gbW9kZWw7XG4gICAgdmFyIGl0ZXIgPSBub2RlLnByb2Nlc3NCaW5kaW5nRGlyZWN0aXZlc18oYmluZGluZ3MpO1xuICAgIGlmIChpbnN0YW5jZUJpbmRpbmdzICYmIGl0ZXIpXG4gICAgICBpbnN0YW5jZUJpbmRpbmdzLnB1c2goaXRlcik7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVdpdGhEZWZhdWx0KGVsLCBuYW1lLCBwcmVwYXJlQmluZGluZ0ZuKSB7XG4gICAgdmFyIHYgPSBlbC5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gICAgcmV0dXJuIHBhcnNlTXVzdGFjaGVzKHYgPT0gJycgPyAne3t9fScgOiB2LCBuYW1lLCBlbCwgcHJlcGFyZUJpbmRpbmdGbik7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUF0dHJpYnV0ZUJpbmRpbmdzKGVsZW1lbnQsIHByZXBhcmVCaW5kaW5nRm4pIHtcbiAgICBhc3NlcnQoZWxlbWVudCk7XG5cbiAgICB2YXIgYmluZGluZ3MgPSBbXTtcbiAgICB2YXIgaWZGb3VuZCA9IGZhbHNlO1xuICAgIHZhciBiaW5kRm91bmQgPSBmYWxzZTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudC5hdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgYXR0ciA9IGVsZW1lbnQuYXR0cmlidXRlc1tpXTtcbiAgICAgIHZhciBuYW1lID0gYXR0ci5uYW1lO1xuICAgICAgdmFyIHZhbHVlID0gYXR0ci52YWx1ZTtcblxuICAgICAgLy8gQWxsb3cgYmluZGluZ3MgZXhwcmVzc2VkIGluIGF0dHJpYnV0ZXMgdG8gYmUgcHJlZml4ZWQgd2l0aCB1bmRlcmJhcnMuXG4gICAgICAvLyBXZSBkbyB0aGlzIHRvIGFsbG93IGNvcnJlY3Qgc2VtYW50aWNzIGZvciBicm93c2VycyB0aGF0IGRvbid0IGltcGxlbWVudFxuICAgICAgLy8gPHRlbXBsYXRlPiB3aGVyZSBjZXJ0YWluIGF0dHJpYnV0ZXMgbWlnaHQgdHJpZ2dlciBzaWRlLWVmZmVjdHMgLS0gYW5kXG4gICAgICAvLyBmb3IgSUUgd2hpY2ggc2FuaXRpemVzIGNlcnRhaW4gYXR0cmlidXRlcywgZGlzYWxsb3dpbmcgbXVzdGFjaGVcbiAgICAgIC8vIHJlcGxhY2VtZW50cyBpbiB0aGVpciB0ZXh0LlxuICAgICAgd2hpbGUgKG5hbWVbMF0gPT09ICdfJykge1xuICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc1RlbXBsYXRlKGVsZW1lbnQpICYmXG4gICAgICAgICAgKG5hbWUgPT09IElGIHx8IG5hbWUgPT09IEJJTkQgfHwgbmFtZSA9PT0gUkVQRUFUKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgdmFyIHRva2VucyA9IHBhcnNlTXVzdGFjaGVzKHZhbHVlLCBuYW1lLCBlbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXBhcmVCaW5kaW5nRm4pO1xuICAgICAgaWYgKCF0b2tlbnMpXG4gICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICBiaW5kaW5ncy5wdXNoKG5hbWUsIHRva2Vucyk7XG4gICAgfVxuXG4gICAgaWYgKGlzVGVtcGxhdGUoZWxlbWVudCkpIHtcbiAgICAgIGJpbmRpbmdzLmlzVGVtcGxhdGUgPSB0cnVlO1xuICAgICAgYmluZGluZ3MuaWYgPSBwYXJzZVdpdGhEZWZhdWx0KGVsZW1lbnQsIElGLCBwcmVwYXJlQmluZGluZ0ZuKTtcbiAgICAgIGJpbmRpbmdzLmJpbmQgPSBwYXJzZVdpdGhEZWZhdWx0KGVsZW1lbnQsIEJJTkQsIHByZXBhcmVCaW5kaW5nRm4pO1xuICAgICAgYmluZGluZ3MucmVwZWF0ID0gcGFyc2VXaXRoRGVmYXVsdChlbGVtZW50LCBSRVBFQVQsIHByZXBhcmVCaW5kaW5nRm4pO1xuXG4gICAgICBpZiAoYmluZGluZ3MuaWYgJiYgIWJpbmRpbmdzLmJpbmQgJiYgIWJpbmRpbmdzLnJlcGVhdClcbiAgICAgICAgYmluZGluZ3MuYmluZCA9IHBhcnNlTXVzdGFjaGVzKCd7e319JywgQklORCwgZWxlbWVudCwgcHJlcGFyZUJpbmRpbmdGbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJpbmRpbmdzO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0QmluZGluZ3Mobm9kZSwgcHJlcGFyZUJpbmRpbmdGbikge1xuICAgIGlmIChub2RlLm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERSlcbiAgICAgIHJldHVybiBwYXJzZUF0dHJpYnV0ZUJpbmRpbmdzKG5vZGUsIHByZXBhcmVCaW5kaW5nRm4pO1xuXG4gICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFKSB7XG4gICAgICB2YXIgdG9rZW5zID0gcGFyc2VNdXN0YWNoZXMobm9kZS5kYXRhLCAndGV4dENvbnRlbnQnLCBub2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXBhcmVCaW5kaW5nRm4pO1xuICAgICAgaWYgKHRva2VucylcbiAgICAgICAgcmV0dXJuIFsndGV4dENvbnRlbnQnLCB0b2tlbnNdO1xuICAgIH1cblxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb25lQW5kQmluZEluc3RhbmNlKG5vZGUsIHBhcmVudCwgc3RhZ2luZ0RvY3VtZW50LCBiaW5kaW5ncywgbW9kZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGVnYXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUJpbmRpbmdzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZVJlY29yZCkge1xuICAgIHZhciBjbG9uZSA9IHBhcmVudC5hcHBlbmRDaGlsZChzdGFnaW5nRG9jdW1lbnQuaW1wb3J0Tm9kZShub2RlLCBmYWxzZSkpO1xuXG4gICAgdmFyIGkgPSAwO1xuICAgIGZvciAodmFyIGNoaWxkID0gbm9kZS5maXJzdENoaWxkOyBjaGlsZDsgY2hpbGQgPSBjaGlsZC5uZXh0U2libGluZykge1xuICAgICAgY2xvbmVBbmRCaW5kSW5zdGFuY2UoY2hpbGQsIGNsb25lLCBzdGFnaW5nRG9jdW1lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmluZGluZ3MuY2hpbGRyZW5baSsrXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxlZ2F0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZUJpbmRpbmdzKTtcbiAgICB9XG5cbiAgICBpZiAoYmluZGluZ3MuaXNUZW1wbGF0ZSkge1xuICAgICAgSFRNTFRlbXBsYXRlRWxlbWVudC5kZWNvcmF0ZShjbG9uZSwgbm9kZSk7XG4gICAgICBpZiAoZGVsZWdhdGUpXG4gICAgICAgIGNsb25lLnNldERlbGVnYXRlXyhkZWxlZ2F0ZSk7XG4gICAgfVxuXG4gICAgcHJvY2Vzc0JpbmRpbmdzKGNsb25lLCBiaW5kaW5ncywgbW9kZWwsIGluc3RhbmNlQmluZGluZ3MpO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlQmluZGluZ01hcChub2RlLCBwcmVwYXJlQmluZGluZ0ZuKSB7XG4gICAgdmFyIG1hcCA9IGdldEJpbmRpbmdzKG5vZGUsIHByZXBhcmVCaW5kaW5nRm4pO1xuICAgIG1hcC5jaGlsZHJlbiA9IHt9O1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgZm9yICh2YXIgY2hpbGQgPSBub2RlLmZpcnN0Q2hpbGQ7IGNoaWxkOyBjaGlsZCA9IGNoaWxkLm5leHRTaWJsaW5nKSB7XG4gICAgICBtYXAuY2hpbGRyZW5baW5kZXgrK10gPSBjcmVhdGVJbnN0YW5jZUJpbmRpbmdNYXAoY2hpbGQsIHByZXBhcmVCaW5kaW5nRm4pO1xuICAgIH1cblxuICAgIHJldHVybiBtYXA7XG4gIH1cblxuICB2YXIgY29udGVudFVpZENvdW50ZXIgPSAxO1xuXG4gIC8vIFRPRE8ocmFmYWVsdyk6IFNldHVwIGEgTXV0YXRpb25PYnNlcnZlciBvbiBjb250ZW50IHdoaWNoIGNsZWFycyB0aGUgaWRcbiAgLy8gc28gdGhhdCBiaW5kaW5nTWFwcyByZWdlbmVyYXRlIHdoZW4gdGhlIHRlbXBsYXRlLmNvbnRlbnQgY2hhbmdlcy5cbiAgZnVuY3Rpb24gZ2V0Q29udGVudFVpZChjb250ZW50KSB7XG4gICAgdmFyIGlkID0gY29udGVudC5pZF87XG4gICAgaWYgKCFpZClcbiAgICAgIGlkID0gY29udGVudC5pZF8gPSBjb250ZW50VWlkQ291bnRlcisrO1xuICAgIHJldHVybiBpZDtcbiAgfVxuXG4gIC8vIEVhY2ggZGVsZWdhdGUgaXMgYXNzb2NpYXRlZCB3aXRoIGEgc2V0IG9mIGJpbmRpbmdNYXBzLCBvbmUgZm9yIGVhY2hcbiAgLy8gY29udGVudCB3aGljaCBtYXkgYmUgdXNlZCBieSBhIHRlbXBsYXRlLiBUaGUgaW50ZW50IGlzIHRoYXQgZWFjaCBiaW5kaW5nXG4gIC8vIGRlbGVnYXRlIGdldHMgdGhlIG9wcG9ydHVuaXR5IHRvIHByZXBhcmUgdGhlIGluc3RhbmNlICh2aWEgdGhlIHByZXBhcmUqXG4gIC8vIGRlbGVnYXRlIGNhbGxzKSBvbmNlIGFjcm9zcyBhbGwgdXNlcy5cbiAgLy8gVE9ETyhyYWZhZWx3KTogU2VwYXJhdGUgb3V0IHRoZSBwYXJzZSBtYXAgZnJvbSB0aGUgYmluZGluZyBtYXAuIEluIHRoZVxuICAvLyBjdXJyZW50IGltcGxlbWVudGF0aW9uLCBpZiB0d28gZGVsZWdhdGVzIG5lZWQgYSBiaW5kaW5nIG1hcCBmb3IgdGhlIHNhbWVcbiAgLy8gY29udGVudCwgdGhlIHNlY29uZCB3aWxsIGhhdmUgdG8gcmVwYXJzZS5cbiAgZnVuY3Rpb24gZ2V0SW5zdGFuY2VCaW5kaW5nTWFwKGNvbnRlbnQsIGRlbGVnYXRlXykge1xuICAgIHZhciBjb250ZW50SWQgPSBnZXRDb250ZW50VWlkKGNvbnRlbnQpO1xuICAgIGlmIChkZWxlZ2F0ZV8pIHtcbiAgICAgIHZhciBtYXAgPSBkZWxlZ2F0ZV8uYmluZGluZ01hcHNbY29udGVudElkXTtcbiAgICAgIGlmICghbWFwKSB7XG4gICAgICAgIG1hcCA9IGRlbGVnYXRlXy5iaW5kaW5nTWFwc1tjb250ZW50SWRdID1cbiAgICAgICAgICAgIGNyZWF0ZUluc3RhbmNlQmluZGluZ01hcChjb250ZW50LCBkZWxlZ2F0ZV8ucHJlcGFyZUJpbmRpbmcpIHx8IFtdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG5cbiAgICB2YXIgbWFwID0gY29udGVudC5iaW5kaW5nTWFwXztcbiAgICBpZiAoIW1hcCkge1xuICAgICAgbWFwID0gY29udGVudC5iaW5kaW5nTWFwXyA9XG4gICAgICAgICAgY3JlYXRlSW5zdGFuY2VCaW5kaW5nTWFwKGNvbnRlbnQsIHVuZGVmaW5lZCkgfHwgW107XG4gICAgfVxuICAgIHJldHVybiBtYXA7XG4gIH1cblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTm9kZS5wcm90b3R5cGUsICd0ZW1wbGF0ZUluc3RhbmNlJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaW5zdGFuY2UgPSB0aGlzLnRlbXBsYXRlSW5zdGFuY2VfO1xuICAgICAgcmV0dXJuIGluc3RhbmNlID8gaW5zdGFuY2UgOlxuICAgICAgICAgICh0aGlzLnBhcmVudE5vZGUgPyB0aGlzLnBhcmVudE5vZGUudGVtcGxhdGVJbnN0YW5jZSA6IHVuZGVmaW5lZCk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgZW1wdHlJbnN0YW5jZSA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgZW1wdHlJbnN0YW5jZS5iaW5kaW5nc18gPSBbXTtcbiAgZW1wdHlJbnN0YW5jZS50ZXJtaW5hdG9yXyA9IG51bGw7XG5cbiAgZnVuY3Rpb24gVGVtcGxhdGVJdGVyYXRvcih0ZW1wbGF0ZUVsZW1lbnQpIHtcbiAgICB0aGlzLmNsb3NlZCA9IGZhbHNlO1xuICAgIHRoaXMudGVtcGxhdGVFbGVtZW50XyA9IHRlbXBsYXRlRWxlbWVudDtcbiAgICB0aGlzLmluc3RhbmNlcyA9IFtdO1xuICAgIHRoaXMuZGVwcyA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLml0ZXJhdGVkVmFsdWUgPSBbXTtcbiAgICB0aGlzLnByZXNlbnRWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmFycmF5T2JzZXJ2ZXIgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBUZW1wbGF0ZUl0ZXJhdG9yLnByb3RvdHlwZSA9IHtcbiAgICBjbG9zZURlcHM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGRlcHMgPSB0aGlzLmRlcHM7XG4gICAgICBpZiAoZGVwcykge1xuICAgICAgICBpZiAoZGVwcy5pZk9uZVRpbWUgPT09IGZhbHNlKVxuICAgICAgICAgIGRlcHMuaWZWYWx1ZS5jbG9zZSgpO1xuICAgICAgICBpZiAoZGVwcy5vbmVUaW1lID09PSBmYWxzZSlcbiAgICAgICAgICBkZXBzLnZhbHVlLmNsb3NlKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHVwZGF0ZURlcGVuZGVuY2llczogZnVuY3Rpb24oZGlyZWN0aXZlcywgbW9kZWwpIHtcbiAgICAgIHRoaXMuY2xvc2VEZXBzKCk7XG5cbiAgICAgIHZhciBkZXBzID0gdGhpcy5kZXBzID0ge307XG4gICAgICB2YXIgdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlRWxlbWVudF87XG5cbiAgICAgIHZhciBpZlZhbHVlID0gdHJ1ZTtcbiAgICAgIGlmIChkaXJlY3RpdmVzLmlmKSB7XG4gICAgICAgIGRlcHMuaGFzSWYgPSB0cnVlO1xuICAgICAgICBkZXBzLmlmT25lVGltZSA9IGRpcmVjdGl2ZXMuaWYub25seU9uZVRpbWU7XG4gICAgICAgIGRlcHMuaWZWYWx1ZSA9IHByb2Nlc3NCaW5kaW5nKElGLCBkaXJlY3RpdmVzLmlmLCB0ZW1wbGF0ZSwgbW9kZWwpO1xuXG4gICAgICAgIGlmVmFsdWUgPSBkZXBzLmlmVmFsdWU7XG5cbiAgICAgICAgLy8gb25lVGltZSBpZiAmIHByZWRpY2F0ZSBpcyBmYWxzZS4gbm90aGluZyBlbHNlIHRvIGRvLlxuICAgICAgICBpZiAoZGVwcy5pZk9uZVRpbWUgJiYgIWlmVmFsdWUpIHtcbiAgICAgICAgICB0aGlzLnZhbHVlQ2hhbmdlZCgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZGVwcy5pZk9uZVRpbWUpXG4gICAgICAgICAgaWZWYWx1ZSA9IGlmVmFsdWUub3Blbih0aGlzLnVwZGF0ZUlmVmFsdWUsIHRoaXMpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGlyZWN0aXZlcy5yZXBlYXQpIHtcbiAgICAgICAgZGVwcy5yZXBlYXQgPSB0cnVlO1xuICAgICAgICBkZXBzLm9uZVRpbWUgPSBkaXJlY3RpdmVzLnJlcGVhdC5vbmx5T25lVGltZTtcbiAgICAgICAgZGVwcy52YWx1ZSA9IHByb2Nlc3NCaW5kaW5nKFJFUEVBVCwgZGlyZWN0aXZlcy5yZXBlYXQsIHRlbXBsYXRlLCBtb2RlbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZXBzLnJlcGVhdCA9IGZhbHNlO1xuICAgICAgICBkZXBzLm9uZVRpbWUgPSBkaXJlY3RpdmVzLmJpbmQub25seU9uZVRpbWU7XG4gICAgICAgIGRlcHMudmFsdWUgPSBwcm9jZXNzQmluZGluZyhCSU5ELCBkaXJlY3RpdmVzLmJpbmQsIHRlbXBsYXRlLCBtb2RlbCk7XG4gICAgICB9XG5cbiAgICAgIHZhciB2YWx1ZSA9IGRlcHMudmFsdWU7XG4gICAgICBpZiAoIWRlcHMub25lVGltZSlcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5vcGVuKHRoaXMudXBkYXRlSXRlcmF0ZWRWYWx1ZSwgdGhpcyk7XG5cbiAgICAgIGlmICghaWZWYWx1ZSkge1xuICAgICAgICB0aGlzLnZhbHVlQ2hhbmdlZCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMudXBkYXRlVmFsdWUodmFsdWUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSB1cGRhdGVkIHZhbHVlIG9mIHRoZSBiaW5kL3JlcGVhdC4gVGhpcyBjYW4gcG90ZW50aWFsbHkgY2FsbFxuICAgICAqIHVzZXIgY29kZSAoaWYgYSBiaW5kaW5nRGVsZWdhdGUgaXMgc2V0IHVwKSBzbyB3ZSB0cnkgdG8gYXZvaWQgaXQgaWYgd2VcbiAgICAgKiBhbHJlYWR5IGhhdmUgdGhlIHZhbHVlIGluIGhhbmQgKGZyb20gT2JzZXJ2ZXIub3BlbikuXG4gICAgICovXG4gICAgZ2V0VXBkYXRlZFZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2YWx1ZSA9IHRoaXMuZGVwcy52YWx1ZTtcbiAgICAgIGlmICghdGhpcy5kZXBzLm9uZVRpbWUpXG4gICAgICAgIHZhbHVlID0gdmFsdWUuZGlzY2FyZENoYW5nZXMoKTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuXG4gICAgdXBkYXRlSWZWYWx1ZTogZnVuY3Rpb24oaWZWYWx1ZSkge1xuICAgICAgaWYgKCFpZlZhbHVlKSB7XG4gICAgICAgIHRoaXMudmFsdWVDaGFuZ2VkKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy51cGRhdGVWYWx1ZSh0aGlzLmdldFVwZGF0ZWRWYWx1ZSgpKTtcbiAgICB9LFxuXG4gICAgdXBkYXRlSXRlcmF0ZWRWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmICh0aGlzLmRlcHMuaGFzSWYpIHtcbiAgICAgICAgdmFyIGlmVmFsdWUgPSB0aGlzLmRlcHMuaWZWYWx1ZTtcbiAgICAgICAgaWYgKCF0aGlzLmRlcHMuaWZPbmVUaW1lKVxuICAgICAgICAgIGlmVmFsdWUgPSBpZlZhbHVlLmRpc2NhcmRDaGFuZ2VzKCk7XG4gICAgICAgIGlmICghaWZWYWx1ZSkge1xuICAgICAgICAgIHRoaXMudmFsdWVDaGFuZ2VkKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMudXBkYXRlVmFsdWUodmFsdWUpO1xuICAgIH0sXG5cbiAgICB1cGRhdGVWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmICghdGhpcy5kZXBzLnJlcGVhdClcbiAgICAgICAgdmFsdWUgPSBbdmFsdWVdO1xuICAgICAgdmFyIG9ic2VydmUgPSB0aGlzLmRlcHMucmVwZWF0ICYmXG4gICAgICAgICAgICAgICAgICAgICF0aGlzLmRlcHMub25lVGltZSAmJlxuICAgICAgICAgICAgICAgICAgICBBcnJheS5pc0FycmF5KHZhbHVlKTtcbiAgICAgIHRoaXMudmFsdWVDaGFuZ2VkKHZhbHVlLCBvYnNlcnZlKTtcbiAgICB9LFxuXG4gICAgdmFsdWVDaGFuZ2VkOiBmdW5jdGlvbih2YWx1ZSwgb2JzZXJ2ZVZhbHVlKSB7XG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWUpKVxuICAgICAgICB2YWx1ZSA9IFtdO1xuXG4gICAgICBpZiAodmFsdWUgPT09IHRoaXMuaXRlcmF0ZWRWYWx1ZSlcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICB0aGlzLnVub2JzZXJ2ZSgpO1xuICAgICAgdGhpcy5wcmVzZW50VmFsdWUgPSB2YWx1ZTtcbiAgICAgIGlmIChvYnNlcnZlVmFsdWUpIHtcbiAgICAgICAgdGhpcy5hcnJheU9ic2VydmVyID0gbmV3IEFycmF5T2JzZXJ2ZXIodGhpcy5wcmVzZW50VmFsdWUpO1xuICAgICAgICB0aGlzLmFycmF5T2JzZXJ2ZXIub3Blbih0aGlzLmhhbmRsZVNwbGljZXMsIHRoaXMpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmhhbmRsZVNwbGljZXMoQXJyYXlPYnNlcnZlci5jYWxjdWxhdGVTcGxpY2VzKHRoaXMucHJlc2VudFZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZXJhdGVkVmFsdWUpKTtcbiAgICB9LFxuXG4gICAgZ2V0TGFzdEluc3RhbmNlTm9kZTogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgIGlmIChpbmRleCA9PSAtMSlcbiAgICAgICAgcmV0dXJuIHRoaXMudGVtcGxhdGVFbGVtZW50XztcbiAgICAgIHZhciBpbnN0YW5jZSA9IHRoaXMuaW5zdGFuY2VzW2luZGV4XTtcbiAgICAgIHZhciB0ZXJtaW5hdG9yID0gaW5zdGFuY2UudGVybWluYXRvcl87XG4gICAgICBpZiAoIXRlcm1pbmF0b3IpXG4gICAgICAgIHJldHVybiB0aGlzLmdldExhc3RJbnN0YW5jZU5vZGUoaW5kZXggLSAxKTtcblxuICAgICAgaWYgKHRlcm1pbmF0b3Iubm9kZVR5cGUgIT09IE5vZGUuRUxFTUVOVF9OT0RFIHx8XG4gICAgICAgICAgdGhpcy50ZW1wbGF0ZUVsZW1lbnRfID09PSB0ZXJtaW5hdG9yKSB7XG4gICAgICAgIHJldHVybiB0ZXJtaW5hdG9yO1xuICAgICAgfVxuXG4gICAgICB2YXIgc3VidGVtcGxhdGVJdGVyYXRvciA9IHRlcm1pbmF0b3IuaXRlcmF0b3JfO1xuICAgICAgaWYgKCFzdWJ0ZW1wbGF0ZUl0ZXJhdG9yKVxuICAgICAgICByZXR1cm4gdGVybWluYXRvcjtcblxuICAgICAgcmV0dXJuIHN1YnRlbXBsYXRlSXRlcmF0b3IuZ2V0TGFzdFRlbXBsYXRlTm9kZSgpO1xuICAgIH0sXG5cbiAgICBnZXRMYXN0VGVtcGxhdGVOb2RlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldExhc3RJbnN0YW5jZU5vZGUodGhpcy5pbnN0YW5jZXMubGVuZ3RoIC0gMSk7XG4gICAgfSxcblxuICAgIGluc2VydEluc3RhbmNlQXQ6IGZ1bmN0aW9uKGluZGV4LCBmcmFnbWVudCkge1xuICAgICAgdmFyIHByZXZpb3VzSW5zdGFuY2VMYXN0ID0gdGhpcy5nZXRMYXN0SW5zdGFuY2VOb2RlKGluZGV4IC0gMSk7XG4gICAgICB2YXIgcGFyZW50ID0gdGhpcy50ZW1wbGF0ZUVsZW1lbnRfLnBhcmVudE5vZGU7XG4gICAgICB0aGlzLmluc3RhbmNlcy5zcGxpY2UoaW5kZXgsIDAsIGZyYWdtZW50KTtcblxuICAgICAgcGFyZW50Lmluc2VydEJlZm9yZShmcmFnbWVudCwgcHJldmlvdXNJbnN0YW5jZUxhc3QubmV4dFNpYmxpbmcpO1xuICAgIH0sXG5cbiAgICBleHRyYWN0SW5zdGFuY2VBdDogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgIHZhciBwcmV2aW91c0luc3RhbmNlTGFzdCA9IHRoaXMuZ2V0TGFzdEluc3RhbmNlTm9kZShpbmRleCAtIDEpO1xuICAgICAgdmFyIGxhc3ROb2RlID0gdGhpcy5nZXRMYXN0SW5zdGFuY2VOb2RlKGluZGV4KTtcbiAgICAgIHZhciBwYXJlbnQgPSB0aGlzLnRlbXBsYXRlRWxlbWVudF8ucGFyZW50Tm9kZTtcbiAgICAgIHZhciBpbnN0YW5jZSA9IHRoaXMuaW5zdGFuY2VzLnNwbGljZShpbmRleCwgMSlbMF07XG5cbiAgICAgIHdoaWxlIChsYXN0Tm9kZSAhPT0gcHJldmlvdXNJbnN0YW5jZUxhc3QpIHtcbiAgICAgICAgdmFyIG5vZGUgPSBwcmV2aW91c0luc3RhbmNlTGFzdC5uZXh0U2libGluZztcbiAgICAgICAgaWYgKG5vZGUgPT0gbGFzdE5vZGUpXG4gICAgICAgICAgbGFzdE5vZGUgPSBwcmV2aW91c0luc3RhbmNlTGFzdDtcblxuICAgICAgICBpbnN0YW5jZS5hcHBlbmRDaGlsZChwYXJlbnQucmVtb3ZlQ2hpbGQobm9kZSkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgfSxcblxuICAgIGdldERlbGVnYXRlRm46IGZ1bmN0aW9uKGZuKSB7XG4gICAgICBmbiA9IGZuICYmIGZuKHRoaXMudGVtcGxhdGVFbGVtZW50Xyk7XG4gICAgICByZXR1cm4gdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nID8gZm4gOiBudWxsO1xuICAgIH0sXG5cbiAgICBoYW5kbGVTcGxpY2VzOiBmdW5jdGlvbihzcGxpY2VzKSB7XG4gICAgICBpZiAodGhpcy5jbG9zZWQgfHwgIXNwbGljZXMubGVuZ3RoKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIHZhciB0ZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGVFbGVtZW50XztcblxuICAgICAgaWYgKCF0ZW1wbGF0ZS5wYXJlbnROb2RlKSB7XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBBcnJheU9ic2VydmVyLmFwcGx5U3BsaWNlcyh0aGlzLml0ZXJhdGVkVmFsdWUsIHRoaXMucHJlc2VudFZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BsaWNlcyk7XG5cbiAgICAgIHZhciBkZWxlZ2F0ZSA9IHRlbXBsYXRlLmRlbGVnYXRlXztcbiAgICAgIGlmICh0aGlzLmluc3RhbmNlTW9kZWxGbl8gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLmluc3RhbmNlTW9kZWxGbl8gPVxuICAgICAgICAgICAgdGhpcy5nZXREZWxlZ2F0ZUZuKGRlbGVnYXRlICYmIGRlbGVnYXRlLnByZXBhcmVJbnN0YW5jZU1vZGVsKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuaW5zdGFuY2VQb3NpdGlvbkNoYW5nZWRGbl8gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLmluc3RhbmNlUG9zaXRpb25DaGFuZ2VkRm5fID1cbiAgICAgICAgICAgIHRoaXMuZ2V0RGVsZWdhdGVGbihkZWxlZ2F0ZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGVnYXRlLnByZXBhcmVJbnN0YW5jZVBvc2l0aW9uQ2hhbmdlZCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEluc3RhbmNlIFJlbW92YWxzXG4gICAgICB2YXIgaW5zdGFuY2VDYWNoZSA9IG5ldyBNYXA7XG4gICAgICB2YXIgcmVtb3ZlRGVsdGEgPSAwO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcGxpY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzcGxpY2UgPSBzcGxpY2VzW2ldO1xuICAgICAgICB2YXIgcmVtb3ZlZCA9IHNwbGljZS5yZW1vdmVkO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJlbW92ZWQubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICB2YXIgbW9kZWwgPSByZW1vdmVkW2pdO1xuICAgICAgICAgIHZhciBpbnN0YW5jZSA9IHRoaXMuZXh0cmFjdEluc3RhbmNlQXQoc3BsaWNlLmluZGV4ICsgcmVtb3ZlRGVsdGEpO1xuICAgICAgICAgIGlmIChpbnN0YW5jZSAhPT0gZW1wdHlJbnN0YW5jZSkge1xuICAgICAgICAgICAgaW5zdGFuY2VDYWNoZS5zZXQobW9kZWwsIGluc3RhbmNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZW1vdmVEZWx0YSAtPSBzcGxpY2UuYWRkZWRDb3VudDtcbiAgICAgIH1cblxuICAgICAgLy8gSW5zdGFuY2UgSW5zZXJ0aW9uc1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcGxpY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzcGxpY2UgPSBzcGxpY2VzW2ldO1xuICAgICAgICB2YXIgYWRkSW5kZXggPSBzcGxpY2UuaW5kZXg7XG4gICAgICAgIGZvciAoOyBhZGRJbmRleCA8IHNwbGljZS5pbmRleCArIHNwbGljZS5hZGRlZENvdW50OyBhZGRJbmRleCsrKSB7XG4gICAgICAgICAgdmFyIG1vZGVsID0gdGhpcy5pdGVyYXRlZFZhbHVlW2FkZEluZGV4XTtcbiAgICAgICAgICB2YXIgaW5zdGFuY2UgPSBpbnN0YW5jZUNhY2hlLmdldChtb2RlbCk7XG4gICAgICAgICAgaWYgKGluc3RhbmNlKSB7XG4gICAgICAgICAgICBpbnN0YW5jZUNhY2hlLmRlbGV0ZShtb2RlbCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmluc3RhbmNlTW9kZWxGbl8pIHtcbiAgICAgICAgICAgICAgbW9kZWwgPSB0aGlzLmluc3RhbmNlTW9kZWxGbl8obW9kZWwpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobW9kZWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICBpbnN0YW5jZSA9IGVtcHR5SW5zdGFuY2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpbnN0YW5jZSA9IHRlbXBsYXRlLmNyZWF0ZUluc3RhbmNlKG1vZGVsLCB1bmRlZmluZWQsIGRlbGVnYXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLmluc2VydEluc3RhbmNlQXQoYWRkSW5kZXgsIGluc3RhbmNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpbnN0YW5jZUNhY2hlLmZvckVhY2goZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgICAgICAgdGhpcy5jbG9zZUluc3RhbmNlQmluZGluZ3MoaW5zdGFuY2UpO1xuICAgICAgfSwgdGhpcyk7XG5cbiAgICAgIGlmICh0aGlzLmluc3RhbmNlUG9zaXRpb25DaGFuZ2VkRm5fKVxuICAgICAgICB0aGlzLnJlcG9ydEluc3RhbmNlc01vdmVkKHNwbGljZXMpO1xuICAgIH0sXG5cbiAgICByZXBvcnRJbnN0YW5jZU1vdmVkOiBmdW5jdGlvbihpbmRleCkge1xuICAgICAgdmFyIGluc3RhbmNlID0gdGhpcy5pbnN0YW5jZXNbaW5kZXhdO1xuICAgICAgaWYgKGluc3RhbmNlID09PSBlbXB0eUluc3RhbmNlKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIHRoaXMuaW5zdGFuY2VQb3NpdGlvbkNoYW5nZWRGbl8oaW5zdGFuY2UudGVtcGxhdGVJbnN0YW5jZV8sIGluZGV4KTtcbiAgICB9LFxuXG4gICAgcmVwb3J0SW5zdGFuY2VzTW92ZWQ6IGZ1bmN0aW9uKHNwbGljZXMpIHtcbiAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICB2YXIgb2Zmc2V0ID0gMDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3BsaWNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc3BsaWNlID0gc3BsaWNlc1tpXTtcbiAgICAgICAgaWYgKG9mZnNldCAhPSAwKSB7XG4gICAgICAgICAgd2hpbGUgKGluZGV4IDwgc3BsaWNlLmluZGV4KSB7XG4gICAgICAgICAgICB0aGlzLnJlcG9ydEluc3RhbmNlTW92ZWQoaW5kZXgpO1xuICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaW5kZXggPSBzcGxpY2UuaW5kZXg7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoaW5kZXggPCBzcGxpY2UuaW5kZXggKyBzcGxpY2UuYWRkZWRDb3VudCkge1xuICAgICAgICAgIHRoaXMucmVwb3J0SW5zdGFuY2VNb3ZlZChpbmRleCk7XG4gICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgfVxuXG4gICAgICAgIG9mZnNldCArPSBzcGxpY2UuYWRkZWRDb3VudCAtIHNwbGljZS5yZW1vdmVkLmxlbmd0aDtcbiAgICAgIH1cblxuICAgICAgaWYgKG9mZnNldCA9PSAwKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIHZhciBsZW5ndGggPSB0aGlzLmluc3RhbmNlcy5sZW5ndGg7XG4gICAgICB3aGlsZSAoaW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgdGhpcy5yZXBvcnRJbnN0YW5jZU1vdmVkKGluZGV4KTtcbiAgICAgICAgaW5kZXgrKztcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY2xvc2VJbnN0YW5jZUJpbmRpbmdzOiBmdW5jdGlvbihpbnN0YW5jZSkge1xuICAgICAgdmFyIGJpbmRpbmdzID0gaW5zdGFuY2UuYmluZGluZ3NfO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBiaW5kaW5ncy5sZW5ndGg7IGkrKykge1xuICAgICAgICBiaW5kaW5nc1tpXS5jbG9zZSgpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICB1bm9ic2VydmU6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCF0aGlzLmFycmF5T2JzZXJ2ZXIpXG4gICAgICAgIHJldHVybjtcblxuICAgICAgdGhpcy5hcnJheU9ic2VydmVyLmNsb3NlKCk7XG4gICAgICB0aGlzLmFycmF5T2JzZXJ2ZXIgPSB1bmRlZmluZWQ7XG4gICAgfSxcblxuICAgIGNsb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLmNsb3NlZClcbiAgICAgICAgcmV0dXJuO1xuICAgICAgdGhpcy51bm9ic2VydmUoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pbnN0YW5jZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5jbG9zZUluc3RhbmNlQmluZGluZ3ModGhpcy5pbnN0YW5jZXNbaV0pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmluc3RhbmNlcy5sZW5ndGggPSAwO1xuICAgICAgdGhpcy5jbG9zZURlcHMoKTtcbiAgICAgIHRoaXMudGVtcGxhdGVFbGVtZW50Xy5pdGVyYXRvcl8gPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLmNsb3NlZCA9IHRydWU7XG4gICAgfVxuICB9O1xuXG4gIC8vIFBvbHlmaWxsLXNwZWNpZmljIEFQSS5cbiAgSFRNTFRlbXBsYXRlRWxlbWVudC5mb3JBbGxUZW1wbGF0ZXNGcm9tXyA9IGZvckFsbFRlbXBsYXRlc0Zyb207XG59KSh0aGlzKTtcblxuKGZ1bmN0aW9uKHNjb3BlKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBmZWF0dXJlIGRldGVjdCBmb3IgVVJMIGNvbnN0cnVjdG9yXG4gIHZhciBoYXNXb3JraW5nVXJsID0gZmFsc2U7XG4gIGlmICghc2NvcGUuZm9yY2VKVVJMKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciB1ID0gbmV3IFVSTCgnYicsICdodHRwOi8vYScpO1xuICAgICAgdS5wYXRobmFtZSA9ICdjJTIwZCc7XG4gICAgICBoYXNXb3JraW5nVXJsID0gdS5ocmVmID09PSAnaHR0cDovL2EvYyUyMGQnO1xuICAgIH0gY2F0Y2goZSkge31cbiAgfVxuXG4gIGlmIChoYXNXb3JraW5nVXJsKVxuICAgIHJldHVybjtcblxuICB2YXIgcmVsYXRpdmUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICByZWxhdGl2ZVsnZnRwJ10gPSAyMTtcbiAgcmVsYXRpdmVbJ2ZpbGUnXSA9IDA7XG4gIHJlbGF0aXZlWydnb3BoZXInXSA9IDcwO1xuICByZWxhdGl2ZVsnaHR0cCddID0gODA7XG4gIHJlbGF0aXZlWydodHRwcyddID0gNDQzO1xuICByZWxhdGl2ZVsnd3MnXSA9IDgwO1xuICByZWxhdGl2ZVsnd3NzJ10gPSA0NDM7XG5cbiAgdmFyIHJlbGF0aXZlUGF0aERvdE1hcHBpbmcgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICByZWxhdGl2ZVBhdGhEb3RNYXBwaW5nWyclMmUnXSA9ICcuJztcbiAgcmVsYXRpdmVQYXRoRG90TWFwcGluZ1snLiUyZSddID0gJy4uJztcbiAgcmVsYXRpdmVQYXRoRG90TWFwcGluZ1snJTJlLiddID0gJy4uJztcbiAgcmVsYXRpdmVQYXRoRG90TWFwcGluZ1snJTJlJTJlJ10gPSAnLi4nO1xuXG4gIGZ1bmN0aW9uIGlzUmVsYXRpdmVTY2hlbWUoc2NoZW1lKSB7XG4gICAgcmV0dXJuIHJlbGF0aXZlW3NjaGVtZV0gIT09IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGludmFsaWQoKSB7XG4gICAgY2xlYXIuY2FsbCh0aGlzKTtcbiAgICB0aGlzLl9pc0ludmFsaWQgPSB0cnVlO1xuICB9XG5cbiAgZnVuY3Rpb24gSUROQVRvQVNDSUkoaCkge1xuICAgIGlmICgnJyA9PSBoKSB7XG4gICAgICBpbnZhbGlkLmNhbGwodGhpcylcbiAgICB9XG4gICAgLy8gWFhYXG4gICAgcmV0dXJuIGgudG9Mb3dlckNhc2UoKVxuICB9XG5cbiAgZnVuY3Rpb24gcGVyY2VudEVzY2FwZShjKSB7XG4gICAgdmFyIHVuaWNvZGUgPSBjLmNoYXJDb2RlQXQoMCk7XG4gICAgaWYgKHVuaWNvZGUgPiAweDIwICYmXG4gICAgICAgdW5pY29kZSA8IDB4N0YgJiZcbiAgICAgICAvLyBcIiAjIDwgPiA/IGBcbiAgICAgICBbMHgyMiwgMHgyMywgMHgzQywgMHgzRSwgMHgzRiwgMHg2MF0uaW5kZXhPZih1bmljb2RlKSA9PSAtMVxuICAgICAgKSB7XG4gICAgICByZXR1cm4gYztcbiAgICB9XG4gICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChjKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBlcmNlbnRFc2NhcGVRdWVyeShjKSB7XG4gICAgLy8gWFhYIFRoaXMgYWN0dWFsbHkgbmVlZHMgdG8gZW5jb2RlIGMgdXNpbmcgZW5jb2RpbmcgYW5kIHRoZW5cbiAgICAvLyBjb252ZXJ0IHRoZSBieXRlcyBvbmUtYnktb25lLlxuXG4gICAgdmFyIHVuaWNvZGUgPSBjLmNoYXJDb2RlQXQoMCk7XG4gICAgaWYgKHVuaWNvZGUgPiAweDIwICYmXG4gICAgICAgdW5pY29kZSA8IDB4N0YgJiZcbiAgICAgICAvLyBcIiAjIDwgPiBgIChkbyBub3QgZXNjYXBlICc/JylcbiAgICAgICBbMHgyMiwgMHgyMywgMHgzQywgMHgzRSwgMHg2MF0uaW5kZXhPZih1bmljb2RlKSA9PSAtMVxuICAgICAgKSB7XG4gICAgICByZXR1cm4gYztcbiAgICB9XG4gICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChjKTtcbiAgfVxuXG4gIHZhciBFT0YgPSB1bmRlZmluZWQsXG4gICAgICBBTFBIQSA9IC9bYS16QS1aXS8sXG4gICAgICBBTFBIQU5VTUVSSUMgPSAvW2EtekEtWjAtOVxcK1xcLVxcLl0vO1xuXG4gIGZ1bmN0aW9uIHBhcnNlKGlucHV0LCBzdGF0ZU92ZXJyaWRlLCBiYXNlKSB7XG4gICAgZnVuY3Rpb24gZXJyKG1lc3NhZ2UpIHtcbiAgICAgIGVycm9ycy5wdXNoKG1lc3NhZ2UpXG4gICAgfVxuXG4gICAgdmFyIHN0YXRlID0gc3RhdGVPdmVycmlkZSB8fCAnc2NoZW1lIHN0YXJ0JyxcbiAgICAgICAgY3Vyc29yID0gMCxcbiAgICAgICAgYnVmZmVyID0gJycsXG4gICAgICAgIHNlZW5BdCA9IGZhbHNlLFxuICAgICAgICBzZWVuQnJhY2tldCA9IGZhbHNlLFxuICAgICAgICBlcnJvcnMgPSBbXTtcblxuICAgIGxvb3A6IHdoaWxlICgoaW5wdXRbY3Vyc29yIC0gMV0gIT0gRU9GIHx8IGN1cnNvciA9PSAwKSAmJiAhdGhpcy5faXNJbnZhbGlkKSB7XG4gICAgICB2YXIgYyA9IGlucHV0W2N1cnNvcl07XG4gICAgICBzd2l0Y2ggKHN0YXRlKSB7XG4gICAgICAgIGNhc2UgJ3NjaGVtZSBzdGFydCc6XG4gICAgICAgICAgaWYgKGMgJiYgQUxQSEEudGVzdChjKSkge1xuICAgICAgICAgICAgYnVmZmVyICs9IGMudG9Mb3dlckNhc2UoKTsgLy8gQVNDSUktc2FmZVxuICAgICAgICAgICAgc3RhdGUgPSAnc2NoZW1lJztcbiAgICAgICAgICB9IGVsc2UgaWYgKCFzdGF0ZU92ZXJyaWRlKSB7XG4gICAgICAgICAgICBidWZmZXIgPSAnJztcbiAgICAgICAgICAgIHN0YXRlID0gJ25vIHNjaGVtZSc7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyKCdJbnZhbGlkIHNjaGVtZS4nKTtcbiAgICAgICAgICAgIGJyZWFrIGxvb3A7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3NjaGVtZSc6XG4gICAgICAgICAgaWYgKGMgJiYgQUxQSEFOVU1FUklDLnRlc3QoYykpIHtcbiAgICAgICAgICAgIGJ1ZmZlciArPSBjLnRvTG93ZXJDYXNlKCk7IC8vIEFTQ0lJLXNhZmVcbiAgICAgICAgICB9IGVsc2UgaWYgKCc6JyA9PSBjKSB7XG4gICAgICAgICAgICB0aGlzLl9zY2hlbWUgPSBidWZmZXI7XG4gICAgICAgICAgICBidWZmZXIgPSAnJztcbiAgICAgICAgICAgIGlmIChzdGF0ZU92ZXJyaWRlKSB7XG4gICAgICAgICAgICAgIGJyZWFrIGxvb3A7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNSZWxhdGl2ZVNjaGVtZSh0aGlzLl9zY2hlbWUpKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2lzUmVsYXRpdmUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCdmaWxlJyA9PSB0aGlzLl9zY2hlbWUpIHtcbiAgICAgICAgICAgICAgc3RhdGUgPSAncmVsYXRpdmUnO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9pc1JlbGF0aXZlICYmIGJhc2UgJiYgYmFzZS5fc2NoZW1lID09IHRoaXMuX3NjaGVtZSkge1xuICAgICAgICAgICAgICBzdGF0ZSA9ICdyZWxhdGl2ZSBvciBhdXRob3JpdHknO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9pc1JlbGF0aXZlKSB7XG4gICAgICAgICAgICAgIHN0YXRlID0gJ2F1dGhvcml0eSBmaXJzdCBzbGFzaCc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzdGF0ZSA9ICdzY2hlbWUgZGF0YSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmICghc3RhdGVPdmVycmlkZSkge1xuICAgICAgICAgICAgYnVmZmVyID0gJyc7XG4gICAgICAgICAgICBjdXJzb3IgPSAwO1xuICAgICAgICAgICAgc3RhdGUgPSAnbm8gc2NoZW1lJztcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH0gZWxzZSBpZiAoRU9GID09IGMpIHtcbiAgICAgICAgICAgIGJyZWFrIGxvb3A7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVycignQ29kZSBwb2ludCBub3QgYWxsb3dlZCBpbiBzY2hlbWU6ICcgKyBjKVxuICAgICAgICAgICAgYnJlYWsgbG9vcDtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnc2NoZW1lIGRhdGEnOlxuICAgICAgICAgIGlmICgnPycgPT0gYykge1xuICAgICAgICAgICAgcXVlcnkgPSAnPyc7XG4gICAgICAgICAgICBzdGF0ZSA9ICdxdWVyeSc7XG4gICAgICAgICAgfSBlbHNlIGlmICgnIycgPT0gYykge1xuICAgICAgICAgICAgdGhpcy5fZnJhZ21lbnQgPSAnIyc7XG4gICAgICAgICAgICBzdGF0ZSA9ICdmcmFnbWVudCc7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFhYWCBlcnJvciBoYW5kbGluZ1xuICAgICAgICAgICAgaWYgKEVPRiAhPSBjICYmICdcXHQnICE9IGMgJiYgJ1xcbicgIT0gYyAmJiAnXFxyJyAhPSBjKSB7XG4gICAgICAgICAgICAgIHRoaXMuX3NjaGVtZURhdGEgKz0gcGVyY2VudEVzY2FwZShjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnbm8gc2NoZW1lJzpcbiAgICAgICAgICBpZiAoIWJhc2UgfHwgIShpc1JlbGF0aXZlU2NoZW1lKGJhc2UuX3NjaGVtZSkpKSB7XG4gICAgICAgICAgICBlcnIoJ01pc3Npbmcgc2NoZW1lLicpO1xuICAgICAgICAgICAgaW52YWxpZC5jYWxsKHRoaXMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGF0ZSA9ICdyZWxhdGl2ZSc7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAncmVsYXRpdmUgb3IgYXV0aG9yaXR5JzpcbiAgICAgICAgICBpZiAoJy8nID09IGMgJiYgJy8nID09IGlucHV0W2N1cnNvcisxXSkge1xuICAgICAgICAgICAgc3RhdGUgPSAnYXV0aG9yaXR5IGlnbm9yZSBzbGFzaGVzJztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyKCdFeHBlY3RlZCAvLCBnb3Q6ICcgKyBjKTtcbiAgICAgICAgICAgIHN0YXRlID0gJ3JlbGF0aXZlJztcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3JlbGF0aXZlJzpcbiAgICAgICAgICB0aGlzLl9pc1JlbGF0aXZlID0gdHJ1ZTtcbiAgICAgICAgICBpZiAoJ2ZpbGUnICE9IHRoaXMuX3NjaGVtZSlcbiAgICAgICAgICAgIHRoaXMuX3NjaGVtZSA9IGJhc2UuX3NjaGVtZTtcbiAgICAgICAgICBpZiAoRU9GID09IGMpIHtcbiAgICAgICAgICAgIHRoaXMuX2hvc3QgPSBiYXNlLl9ob3N0O1xuICAgICAgICAgICAgdGhpcy5fcG9ydCA9IGJhc2UuX3BvcnQ7XG4gICAgICAgICAgICB0aGlzLl9wYXRoID0gYmFzZS5fcGF0aC5zbGljZSgpO1xuICAgICAgICAgICAgdGhpcy5fcXVlcnkgPSBiYXNlLl9xdWVyeTtcbiAgICAgICAgICAgIGJyZWFrIGxvb3A7XG4gICAgICAgICAgfSBlbHNlIGlmICgnLycgPT0gYyB8fCAnXFxcXCcgPT0gYykge1xuICAgICAgICAgICAgaWYgKCdcXFxcJyA9PSBjKVxuICAgICAgICAgICAgICBlcnIoJ1xcXFwgaXMgYW4gaW52YWxpZCBjb2RlIHBvaW50LicpO1xuICAgICAgICAgICAgc3RhdGUgPSAncmVsYXRpdmUgc2xhc2gnO1xuICAgICAgICAgIH0gZWxzZSBpZiAoJz8nID09IGMpIHtcbiAgICAgICAgICAgIHRoaXMuX2hvc3QgPSBiYXNlLl9ob3N0O1xuICAgICAgICAgICAgdGhpcy5fcG9ydCA9IGJhc2UuX3BvcnQ7XG4gICAgICAgICAgICB0aGlzLl9wYXRoID0gYmFzZS5fcGF0aC5zbGljZSgpO1xuICAgICAgICAgICAgdGhpcy5fcXVlcnkgPSAnPyc7XG4gICAgICAgICAgICBzdGF0ZSA9ICdxdWVyeSc7XG4gICAgICAgICAgfSBlbHNlIGlmICgnIycgPT0gYykge1xuICAgICAgICAgICAgdGhpcy5faG9zdCA9IGJhc2UuX2hvc3Q7XG4gICAgICAgICAgICB0aGlzLl9wb3J0ID0gYmFzZS5fcG9ydDtcbiAgICAgICAgICAgIHRoaXMuX3BhdGggPSBiYXNlLl9wYXRoLnNsaWNlKCk7XG4gICAgICAgICAgICB0aGlzLl9xdWVyeSA9IGJhc2UuX3F1ZXJ5O1xuICAgICAgICAgICAgdGhpcy5fZnJhZ21lbnQgPSAnIyc7XG4gICAgICAgICAgICBzdGF0ZSA9ICdmcmFnbWVudCc7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBuZXh0QyA9IGlucHV0W2N1cnNvcisxXVxuICAgICAgICAgICAgdmFyIG5leHROZXh0QyA9IGlucHV0W2N1cnNvcisyXVxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAnZmlsZScgIT0gdGhpcy5fc2NoZW1lIHx8ICFBTFBIQS50ZXN0KGMpIHx8XG4gICAgICAgICAgICAgIChuZXh0QyAhPSAnOicgJiYgbmV4dEMgIT0gJ3wnKSB8fFxuICAgICAgICAgICAgICAoRU9GICE9IG5leHROZXh0QyAmJiAnLycgIT0gbmV4dE5leHRDICYmICdcXFxcJyAhPSBuZXh0TmV4dEMgJiYgJz8nICE9IG5leHROZXh0QyAmJiAnIycgIT0gbmV4dE5leHRDKSkge1xuICAgICAgICAgICAgICB0aGlzLl9ob3N0ID0gYmFzZS5faG9zdDtcbiAgICAgICAgICAgICAgdGhpcy5fcG9ydCA9IGJhc2UuX3BvcnQ7XG4gICAgICAgICAgICAgIHRoaXMuX3BhdGggPSBiYXNlLl9wYXRoLnNsaWNlKCk7XG4gICAgICAgICAgICAgIHRoaXMuX3BhdGgucG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdGF0ZSA9ICdyZWxhdGl2ZSBwYXRoJztcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdyZWxhdGl2ZSBzbGFzaCc6XG4gICAgICAgICAgaWYgKCcvJyA9PSBjIHx8ICdcXFxcJyA9PSBjKSB7XG4gICAgICAgICAgICBpZiAoJ1xcXFwnID09IGMpIHtcbiAgICAgICAgICAgICAgZXJyKCdcXFxcIGlzIGFuIGludmFsaWQgY29kZSBwb2ludC4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgnZmlsZScgPT0gdGhpcy5fc2NoZW1lKSB7XG4gICAgICAgICAgICAgIHN0YXRlID0gJ2ZpbGUgaG9zdCc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzdGF0ZSA9ICdhdXRob3JpdHkgaWdub3JlIHNsYXNoZXMnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoJ2ZpbGUnICE9IHRoaXMuX3NjaGVtZSkge1xuICAgICAgICAgICAgICB0aGlzLl9ob3N0ID0gYmFzZS5faG9zdDtcbiAgICAgICAgICAgICAgdGhpcy5fcG9ydCA9IGJhc2UuX3BvcnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdGF0ZSA9ICdyZWxhdGl2ZSBwYXRoJztcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdhdXRob3JpdHkgZmlyc3Qgc2xhc2gnOlxuICAgICAgICAgIGlmICgnLycgPT0gYykge1xuICAgICAgICAgICAgc3RhdGUgPSAnYXV0aG9yaXR5IHNlY29uZCBzbGFzaCc7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVycihcIkV4cGVjdGVkICcvJywgZ290OiBcIiArIGMpO1xuICAgICAgICAgICAgc3RhdGUgPSAnYXV0aG9yaXR5IGlnbm9yZSBzbGFzaGVzJztcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdhdXRob3JpdHkgc2Vjb25kIHNsYXNoJzpcbiAgICAgICAgICBzdGF0ZSA9ICdhdXRob3JpdHkgaWdub3JlIHNsYXNoZXMnO1xuICAgICAgICAgIGlmICgnLycgIT0gYykge1xuICAgICAgICAgICAgZXJyKFwiRXhwZWN0ZWQgJy8nLCBnb3Q6IFwiICsgYyk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnYXV0aG9yaXR5IGlnbm9yZSBzbGFzaGVzJzpcbiAgICAgICAgICBpZiAoJy8nICE9IGMgJiYgJ1xcXFwnICE9IGMpIHtcbiAgICAgICAgICAgIHN0YXRlID0gJ2F1dGhvcml0eSc7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyKCdFeHBlY3RlZCBhdXRob3JpdHksIGdvdDogJyArIGMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdhdXRob3JpdHknOlxuICAgICAgICAgIGlmICgnQCcgPT0gYykge1xuICAgICAgICAgICAgaWYgKHNlZW5BdCkge1xuICAgICAgICAgICAgICBlcnIoJ0AgYWxyZWFkeSBzZWVuLicpO1xuICAgICAgICAgICAgICBidWZmZXIgKz0gJyU0MCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWVuQXQgPSB0cnVlO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBidWZmZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgdmFyIGNwID0gYnVmZmVyW2ldO1xuICAgICAgICAgICAgICBpZiAoJ1xcdCcgPT0gY3AgfHwgJ1xcbicgPT0gY3AgfHwgJ1xccicgPT0gY3ApIHtcbiAgICAgICAgICAgICAgICBlcnIoJ0ludmFsaWQgd2hpdGVzcGFjZSBpbiBhdXRob3JpdHkuJyk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gWFhYIGNoZWNrIFVSTCBjb2RlIHBvaW50c1xuICAgICAgICAgICAgICBpZiAoJzonID09IGNwICYmIG51bGwgPT09IHRoaXMuX3Bhc3N3b3JkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGFzc3dvcmQgPSAnJztcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB2YXIgdGVtcEMgPSBwZXJjZW50RXNjYXBlKGNwKTtcbiAgICAgICAgICAgICAgKG51bGwgIT09IHRoaXMuX3Bhc3N3b3JkKSA/IHRoaXMuX3Bhc3N3b3JkICs9IHRlbXBDIDogdGhpcy5fdXNlcm5hbWUgKz0gdGVtcEM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBidWZmZXIgPSAnJztcbiAgICAgICAgICB9IGVsc2UgaWYgKEVPRiA9PSBjIHx8ICcvJyA9PSBjIHx8ICdcXFxcJyA9PSBjIHx8ICc/JyA9PSBjIHx8ICcjJyA9PSBjKSB7XG4gICAgICAgICAgICBjdXJzb3IgLT0gYnVmZmVyLmxlbmd0aDtcbiAgICAgICAgICAgIGJ1ZmZlciA9ICcnO1xuICAgICAgICAgICAgc3RhdGUgPSAnaG9zdCc7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnVmZmVyICs9IGM7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ2ZpbGUgaG9zdCc6XG4gICAgICAgICAgaWYgKEVPRiA9PSBjIHx8ICcvJyA9PSBjIHx8ICdcXFxcJyA9PSBjIHx8ICc/JyA9PSBjIHx8ICcjJyA9PSBjKSB7XG4gICAgICAgICAgICBpZiAoYnVmZmVyLmxlbmd0aCA9PSAyICYmIEFMUEhBLnRlc3QoYnVmZmVyWzBdKSAmJiAoYnVmZmVyWzFdID09ICc6JyB8fCBidWZmZXJbMV0gPT0gJ3wnKSkge1xuICAgICAgICAgICAgICBzdGF0ZSA9ICdyZWxhdGl2ZSBwYXRoJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYnVmZmVyLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICAgIHN0YXRlID0gJ3JlbGF0aXZlIHBhdGggc3RhcnQnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5faG9zdCA9IElETkFUb0FTQ0lJLmNhbGwodGhpcywgYnVmZmVyKTtcbiAgICAgICAgICAgICAgYnVmZmVyID0gJyc7XG4gICAgICAgICAgICAgIHN0YXRlID0gJ3JlbGF0aXZlIHBhdGggc3RhcnQnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfSBlbHNlIGlmICgnXFx0JyA9PSBjIHx8ICdcXG4nID09IGMgfHwgJ1xccicgPT0gYykge1xuICAgICAgICAgICAgZXJyKCdJbnZhbGlkIHdoaXRlc3BhY2UgaW4gZmlsZSBob3N0LicpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBidWZmZXIgKz0gYztcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnaG9zdCc6XG4gICAgICAgIGNhc2UgJ2hvc3RuYW1lJzpcbiAgICAgICAgICBpZiAoJzonID09IGMgJiYgIXNlZW5CcmFja2V0KSB7XG4gICAgICAgICAgICAvLyBYWFggaG9zdCBwYXJzaW5nXG4gICAgICAgICAgICB0aGlzLl9ob3N0ID0gSUROQVRvQVNDSUkuY2FsbCh0aGlzLCBidWZmZXIpO1xuICAgICAgICAgICAgYnVmZmVyID0gJyc7XG4gICAgICAgICAgICBzdGF0ZSA9ICdwb3J0JztcbiAgICAgICAgICAgIGlmICgnaG9zdG5hbWUnID09IHN0YXRlT3ZlcnJpZGUpIHtcbiAgICAgICAgICAgICAgYnJlYWsgbG9vcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKEVPRiA9PSBjIHx8ICcvJyA9PSBjIHx8ICdcXFxcJyA9PSBjIHx8ICc/JyA9PSBjIHx8ICcjJyA9PSBjKSB7XG4gICAgICAgICAgICB0aGlzLl9ob3N0ID0gSUROQVRvQVNDSUkuY2FsbCh0aGlzLCBidWZmZXIpO1xuICAgICAgICAgICAgYnVmZmVyID0gJyc7XG4gICAgICAgICAgICBzdGF0ZSA9ICdyZWxhdGl2ZSBwYXRoIHN0YXJ0JztcbiAgICAgICAgICAgIGlmIChzdGF0ZU92ZXJyaWRlKSB7XG4gICAgICAgICAgICAgIGJyZWFrIGxvb3A7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKCdcXHQnICE9IGMgJiYgJ1xcbicgIT0gYyAmJiAnXFxyJyAhPSBjKSB7XG4gICAgICAgICAgICBpZiAoJ1snID09IGMpIHtcbiAgICAgICAgICAgICAgc2VlbkJyYWNrZXQgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgnXScgPT0gYykge1xuICAgICAgICAgICAgICBzZWVuQnJhY2tldCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnVmZmVyICs9IGM7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVycignSW52YWxpZCBjb2RlIHBvaW50IGluIGhvc3QvaG9zdG5hbWU6ICcgKyBjKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAncG9ydCc6XG4gICAgICAgICAgaWYgKC9bMC05XS8udGVzdChjKSkge1xuICAgICAgICAgICAgYnVmZmVyICs9IGM7XG4gICAgICAgICAgfSBlbHNlIGlmIChFT0YgPT0gYyB8fCAnLycgPT0gYyB8fCAnXFxcXCcgPT0gYyB8fCAnPycgPT0gYyB8fCAnIycgPT0gYyB8fCBzdGF0ZU92ZXJyaWRlKSB7XG4gICAgICAgICAgICBpZiAoJycgIT0gYnVmZmVyKSB7XG4gICAgICAgICAgICAgIHZhciB0ZW1wID0gcGFyc2VJbnQoYnVmZmVyLCAxMCk7XG4gICAgICAgICAgICAgIGlmICh0ZW1wICE9IHJlbGF0aXZlW3RoaXMuX3NjaGVtZV0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wb3J0ID0gdGVtcCArICcnO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJ1ZmZlciA9ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHN0YXRlT3ZlcnJpZGUpIHtcbiAgICAgICAgICAgICAgYnJlYWsgbG9vcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0YXRlID0gJ3JlbGF0aXZlIHBhdGggc3RhcnQnO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfSBlbHNlIGlmICgnXFx0JyA9PSBjIHx8ICdcXG4nID09IGMgfHwgJ1xccicgPT0gYykge1xuICAgICAgICAgICAgZXJyKCdJbnZhbGlkIGNvZGUgcG9pbnQgaW4gcG9ydDogJyArIGMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbnZhbGlkLmNhbGwodGhpcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3JlbGF0aXZlIHBhdGggc3RhcnQnOlxuICAgICAgICAgIGlmICgnXFxcXCcgPT0gYylcbiAgICAgICAgICAgIGVycihcIidcXFxcJyBub3QgYWxsb3dlZCBpbiBwYXRoLlwiKTtcbiAgICAgICAgICBzdGF0ZSA9ICdyZWxhdGl2ZSBwYXRoJztcbiAgICAgICAgICBpZiAoJy8nICE9IGMgJiYgJ1xcXFwnICE9IGMpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdyZWxhdGl2ZSBwYXRoJzpcbiAgICAgICAgICBpZiAoRU9GID09IGMgfHwgJy8nID09IGMgfHwgJ1xcXFwnID09IGMgfHwgKCFzdGF0ZU92ZXJyaWRlICYmICgnPycgPT0gYyB8fCAnIycgPT0gYykpKSB7XG4gICAgICAgICAgICBpZiAoJ1xcXFwnID09IGMpIHtcbiAgICAgICAgICAgICAgZXJyKCdcXFxcIG5vdCBhbGxvd2VkIGluIHJlbGF0aXZlIHBhdGguJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdG1wO1xuICAgICAgICAgICAgaWYgKHRtcCA9IHJlbGF0aXZlUGF0aERvdE1hcHBpbmdbYnVmZmVyLnRvTG93ZXJDYXNlKCldKSB7XG4gICAgICAgICAgICAgIGJ1ZmZlciA9IHRtcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgnLi4nID09IGJ1ZmZlcikge1xuICAgICAgICAgICAgICB0aGlzLl9wYXRoLnBvcCgpO1xuICAgICAgICAgICAgICBpZiAoJy8nICE9IGMgJiYgJ1xcXFwnICE9IGMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wYXRoLnB1c2goJycpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCcuJyA9PSBidWZmZXIgJiYgJy8nICE9IGMgJiYgJ1xcXFwnICE9IGMpIHtcbiAgICAgICAgICAgICAgdGhpcy5fcGF0aC5wdXNoKCcnKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoJy4nICE9IGJ1ZmZlcikge1xuICAgICAgICAgICAgICBpZiAoJ2ZpbGUnID09IHRoaXMuX3NjaGVtZSAmJiB0aGlzLl9wYXRoLmxlbmd0aCA9PSAwICYmIGJ1ZmZlci5sZW5ndGggPT0gMiAmJiBBTFBIQS50ZXN0KGJ1ZmZlclswXSkgJiYgYnVmZmVyWzFdID09ICd8Jykge1xuICAgICAgICAgICAgICAgIGJ1ZmZlciA9IGJ1ZmZlclswXSArICc6JztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB0aGlzLl9wYXRoLnB1c2goYnVmZmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJ1ZmZlciA9ICcnO1xuICAgICAgICAgICAgaWYgKCc/JyA9PSBjKSB7XG4gICAgICAgICAgICAgIHRoaXMuX3F1ZXJ5ID0gJz8nO1xuICAgICAgICAgICAgICBzdGF0ZSA9ICdxdWVyeSc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCcjJyA9PSBjKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2ZyYWdtZW50ID0gJyMnO1xuICAgICAgICAgICAgICBzdGF0ZSA9ICdmcmFnbWVudCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmICgnXFx0JyAhPSBjICYmICdcXG4nICE9IGMgJiYgJ1xccicgIT0gYykge1xuICAgICAgICAgICAgYnVmZmVyICs9IHBlcmNlbnRFc2NhcGUoYyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3F1ZXJ5JzpcbiAgICAgICAgICBpZiAoIXN0YXRlT3ZlcnJpZGUgJiYgJyMnID09IGMpIHtcbiAgICAgICAgICAgIHRoaXMuX2ZyYWdtZW50ID0gJyMnO1xuICAgICAgICAgICAgc3RhdGUgPSAnZnJhZ21lbnQnO1xuICAgICAgICAgIH0gZWxzZSBpZiAoRU9GICE9IGMgJiYgJ1xcdCcgIT0gYyAmJiAnXFxuJyAhPSBjICYmICdcXHInICE9IGMpIHtcbiAgICAgICAgICAgIHRoaXMuX3F1ZXJ5ICs9IHBlcmNlbnRFc2NhcGVRdWVyeShjKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnZnJhZ21lbnQnOlxuICAgICAgICAgIGlmIChFT0YgIT0gYyAmJiAnXFx0JyAhPSBjICYmICdcXG4nICE9IGMgJiYgJ1xccicgIT0gYykge1xuICAgICAgICAgICAgdGhpcy5fZnJhZ21lbnQgKz0gYztcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGN1cnNvcisrO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNsZWFyKCkge1xuICAgIHRoaXMuX3NjaGVtZSA9ICcnO1xuICAgIHRoaXMuX3NjaGVtZURhdGEgPSAnJztcbiAgICB0aGlzLl91c2VybmFtZSA9ICcnO1xuICAgIHRoaXMuX3Bhc3N3b3JkID0gbnVsbDtcbiAgICB0aGlzLl9ob3N0ID0gJyc7XG4gICAgdGhpcy5fcG9ydCA9ICcnO1xuICAgIHRoaXMuX3BhdGggPSBbXTtcbiAgICB0aGlzLl9xdWVyeSA9ICcnO1xuICAgIHRoaXMuX2ZyYWdtZW50ID0gJyc7XG4gICAgdGhpcy5faXNJbnZhbGlkID0gZmFsc2U7XG4gICAgdGhpcy5faXNSZWxhdGl2ZSA9IGZhbHNlO1xuICB9XG5cbiAgLy8gRG9lcyBub3QgcHJvY2VzcyBkb21haW4gbmFtZXMgb3IgSVAgYWRkcmVzc2VzLlxuICAvLyBEb2VzIG5vdCBoYW5kbGUgZW5jb2RpbmcgZm9yIHRoZSBxdWVyeSBwYXJhbWV0ZXIuXG4gIGZ1bmN0aW9uIGpVUkwodXJsLCBiYXNlIC8qICwgZW5jb2RpbmcgKi8pIHtcbiAgICBpZiAoYmFzZSAhPT0gdW5kZWZpbmVkICYmICEoYmFzZSBpbnN0YW5jZW9mIGpVUkwpKVxuICAgICAgYmFzZSA9IG5ldyBqVVJMKFN0cmluZyhiYXNlKSk7XG5cbiAgICB0aGlzLl91cmwgPSB1cmw7XG4gICAgY2xlYXIuY2FsbCh0aGlzKTtcblxuICAgIHZhciBpbnB1dCA9IHVybC5yZXBsYWNlKC9eWyBcXHRcXHJcXG5cXGZdK3xbIFxcdFxcclxcblxcZl0rJC9nLCAnJyk7XG4gICAgLy8gZW5jb2RpbmcgPSBlbmNvZGluZyB8fCAndXRmLTgnXG5cbiAgICBwYXJzZS5jYWxsKHRoaXMsIGlucHV0LCBudWxsLCBiYXNlKTtcbiAgfVxuXG4gIGpVUkwucHJvdG90eXBlID0ge1xuICAgIGdldCBocmVmKCkge1xuICAgICAgaWYgKHRoaXMuX2lzSW52YWxpZClcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VybDtcblxuICAgICAgdmFyIGF1dGhvcml0eSA9ICcnO1xuICAgICAgaWYgKCcnICE9IHRoaXMuX3VzZXJuYW1lIHx8IG51bGwgIT0gdGhpcy5fcGFzc3dvcmQpIHtcbiAgICAgICAgYXV0aG9yaXR5ID0gdGhpcy5fdXNlcm5hbWUgK1xuICAgICAgICAgICAgKG51bGwgIT0gdGhpcy5fcGFzc3dvcmQgPyAnOicgKyB0aGlzLl9wYXNzd29yZCA6ICcnKSArICdAJztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucHJvdG9jb2wgK1xuICAgICAgICAgICh0aGlzLl9pc1JlbGF0aXZlID8gJy8vJyArIGF1dGhvcml0eSArIHRoaXMuaG9zdCA6ICcnKSArXG4gICAgICAgICAgdGhpcy5wYXRobmFtZSArIHRoaXMuX3F1ZXJ5ICsgdGhpcy5fZnJhZ21lbnQ7XG4gICAgfSxcbiAgICBzZXQgaHJlZihocmVmKSB7XG4gICAgICBjbGVhci5jYWxsKHRoaXMpO1xuICAgICAgcGFyc2UuY2FsbCh0aGlzLCBocmVmKTtcbiAgICB9LFxuXG4gICAgZ2V0IHByb3RvY29sKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3NjaGVtZSArICc6JztcbiAgICB9LFxuICAgIHNldCBwcm90b2NvbChwcm90b2NvbCkge1xuICAgICAgaWYgKHRoaXMuX2lzSW52YWxpZClcbiAgICAgICAgcmV0dXJuO1xuICAgICAgcGFyc2UuY2FsbCh0aGlzLCBwcm90b2NvbCArICc6JywgJ3NjaGVtZSBzdGFydCcpO1xuICAgIH0sXG5cbiAgICBnZXQgaG9zdCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pc0ludmFsaWQgPyAnJyA6IHRoaXMuX3BvcnQgP1xuICAgICAgICAgIHRoaXMuX2hvc3QgKyAnOicgKyB0aGlzLl9wb3J0IDogdGhpcy5faG9zdDtcbiAgICB9LFxuICAgIHNldCBob3N0KGhvc3QpIHtcbiAgICAgIGlmICh0aGlzLl9pc0ludmFsaWQgfHwgIXRoaXMuX2lzUmVsYXRpdmUpXG4gICAgICAgIHJldHVybjtcbiAgICAgIHBhcnNlLmNhbGwodGhpcywgaG9zdCwgJ2hvc3QnKTtcbiAgICB9LFxuXG4gICAgZ2V0IGhvc3RuYW1lKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2hvc3Q7XG4gICAgfSxcbiAgICBzZXQgaG9zdG5hbWUoaG9zdG5hbWUpIHtcbiAgICAgIGlmICh0aGlzLl9pc0ludmFsaWQgfHwgIXRoaXMuX2lzUmVsYXRpdmUpXG4gICAgICAgIHJldHVybjtcbiAgICAgIHBhcnNlLmNhbGwodGhpcywgaG9zdG5hbWUsICdob3N0bmFtZScpO1xuICAgIH0sXG5cbiAgICBnZXQgcG9ydCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9wb3J0O1xuICAgIH0sXG4gICAgc2V0IHBvcnQocG9ydCkge1xuICAgICAgaWYgKHRoaXMuX2lzSW52YWxpZCB8fCAhdGhpcy5faXNSZWxhdGl2ZSlcbiAgICAgICAgcmV0dXJuO1xuICAgICAgcGFyc2UuY2FsbCh0aGlzLCBwb3J0LCAncG9ydCcpO1xuICAgIH0sXG5cbiAgICBnZXQgcGF0aG5hbWUoKSB7XG4gICAgICByZXR1cm4gdGhpcy5faXNJbnZhbGlkID8gJycgOiB0aGlzLl9pc1JlbGF0aXZlID9cbiAgICAgICAgICAnLycgKyB0aGlzLl9wYXRoLmpvaW4oJy8nKSA6IHRoaXMuX3NjaGVtZURhdGE7XG4gICAgfSxcbiAgICBzZXQgcGF0aG5hbWUocGF0aG5hbWUpIHtcbiAgICAgIGlmICh0aGlzLl9pc0ludmFsaWQgfHwgIXRoaXMuX2lzUmVsYXRpdmUpXG4gICAgICAgIHJldHVybjtcbiAgICAgIHRoaXMuX3BhdGggPSBbXTtcbiAgICAgIHBhcnNlLmNhbGwodGhpcywgcGF0aG5hbWUsICdyZWxhdGl2ZSBwYXRoIHN0YXJ0Jyk7XG4gICAgfSxcblxuICAgIGdldCBzZWFyY2goKSB7XG4gICAgICByZXR1cm4gdGhpcy5faXNJbnZhbGlkIHx8ICF0aGlzLl9xdWVyeSB8fCAnPycgPT0gdGhpcy5fcXVlcnkgP1xuICAgICAgICAgICcnIDogdGhpcy5fcXVlcnk7XG4gICAgfSxcbiAgICBzZXQgc2VhcmNoKHNlYXJjaCkge1xuICAgICAgaWYgKHRoaXMuX2lzSW52YWxpZCB8fCAhdGhpcy5faXNSZWxhdGl2ZSlcbiAgICAgICAgcmV0dXJuO1xuICAgICAgdGhpcy5fcXVlcnkgPSAnPyc7XG4gICAgICBpZiAoJz8nID09IHNlYXJjaFswXSlcbiAgICAgICAgc2VhcmNoID0gc2VhcmNoLnNsaWNlKDEpO1xuICAgICAgcGFyc2UuY2FsbCh0aGlzLCBzZWFyY2gsICdxdWVyeScpO1xuICAgIH0sXG5cbiAgICBnZXQgaGFzaCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pc0ludmFsaWQgfHwgIXRoaXMuX2ZyYWdtZW50IHx8ICcjJyA9PSB0aGlzLl9mcmFnbWVudCA/XG4gICAgICAgICAgJycgOiB0aGlzLl9mcmFnbWVudDtcbiAgICB9LFxuICAgIHNldCBoYXNoKGhhc2gpIHtcbiAgICAgIGlmICh0aGlzLl9pc0ludmFsaWQpXG4gICAgICAgIHJldHVybjtcbiAgICAgIHRoaXMuX2ZyYWdtZW50ID0gJyMnO1xuICAgICAgaWYgKCcjJyA9PSBoYXNoWzBdKVxuICAgICAgICBoYXNoID0gaGFzaC5zbGljZSgxKTtcbiAgICAgIHBhcnNlLmNhbGwodGhpcywgaGFzaCwgJ2ZyYWdtZW50Jyk7XG4gICAgfSxcblxuICAgIGdldCBvcmlnaW4oKSB7XG4gICAgICB2YXIgaG9zdDtcbiAgICAgIGlmICh0aGlzLl9pc0ludmFsaWQgfHwgIXRoaXMuX3NjaGVtZSkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG4gICAgICAvLyBqYXZhc2NyaXB0OiBHZWNrbyByZXR1cm5zIFN0cmluZyhcIlwiKSwgV2ViS2l0L0JsaW5rIFN0cmluZyhcIm51bGxcIilcbiAgICAgIC8vIEdlY2tvIHRocm93cyBlcnJvciBmb3IgXCJkYXRhOi8vXCJcbiAgICAgIC8vIGRhdGE6IEdlY2tvIHJldHVybnMgXCJcIiwgQmxpbmsgcmV0dXJucyBcImRhdGE6Ly9cIiwgV2ViS2l0IHJldHVybnMgXCJudWxsXCJcbiAgICAgIC8vIEdlY2tvIHJldHVybnMgU3RyaW5nKFwiXCIpIGZvciBmaWxlOiBtYWlsdG86XG4gICAgICAvLyBXZWJLaXQvQmxpbmsgcmV0dXJucyBTdHJpbmcoXCJTQ0hFTUU6Ly9cIikgZm9yIGZpbGU6IG1haWx0bzpcbiAgICAgIHN3aXRjaCAodGhpcy5fc2NoZW1lKSB7XG4gICAgICAgIGNhc2UgJ2RhdGEnOlxuICAgICAgICBjYXNlICdmaWxlJzpcbiAgICAgICAgY2FzZSAnamF2YXNjcmlwdCc6XG4gICAgICAgIGNhc2UgJ21haWx0byc6XG4gICAgICAgICAgcmV0dXJuICdudWxsJztcbiAgICAgIH1cbiAgICAgIGhvc3QgPSB0aGlzLmhvc3Q7XG4gICAgICBpZiAoIWhvc3QpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX3NjaGVtZSArICc6Ly8nICsgaG9zdDtcbiAgICB9XG4gIH07XG5cbiAgLy8gQ29weSBvdmVyIHRoZSBzdGF0aWMgbWV0aG9kc1xuICB2YXIgT3JpZ2luYWxVUkwgPSBzY29wZS5VUkw7XG4gIGlmIChPcmlnaW5hbFVSTCkge1xuICAgIGpVUkwuY3JlYXRlT2JqZWN0VVJMID0gZnVuY3Rpb24oYmxvYikge1xuICAgICAgLy8gSUUgZXh0ZW5zaW9uIGFsbG93cyBhIHNlY29uZCBvcHRpb25hbCBvcHRpb25zIGFyZ3VtZW50LlxuICAgICAgLy8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2llL2hoNzcyMzAyKHY9dnMuODUpLmFzcHhcbiAgICAgIHJldHVybiBPcmlnaW5hbFVSTC5jcmVhdGVPYmplY3RVUkwuYXBwbHkoT3JpZ2luYWxVUkwsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgICBqVVJMLnJldm9rZU9iamVjdFVSTCA9IGZ1bmN0aW9uKHVybCkge1xuICAgICAgT3JpZ2luYWxVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XG4gICAgfTtcbiAgfVxuXG4gIHNjb3BlLlVSTCA9IGpVUkw7XG5cbn0pKHRoaXMpO1xuXG4oZnVuY3Rpb24oc2NvcGUpIHtcblxudmFyIGl0ZXJhdGlvbnMgPSAwO1xudmFyIGNhbGxiYWNrcyA9IFtdO1xudmFyIHR3aWRkbGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG5cbmZ1bmN0aW9uIGVuZE9mTWljcm90YXNrKGNhbGxiYWNrKSB7XG4gIHR3aWRkbGUudGV4dENvbnRlbnQgPSBpdGVyYXRpb25zKys7XG4gIGNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbn1cblxuZnVuY3Rpb24gYXRFbmRPZk1pY3JvdGFzaygpIHtcbiAgd2hpbGUgKGNhbGxiYWNrcy5sZW5ndGgpIHtcbiAgICBjYWxsYmFja3Muc2hpZnQoKSgpO1xuICB9XG59XG5cbm5ldyAod2luZG93Lk11dGF0aW9uT2JzZXJ2ZXIgfHwgSnNNdXRhdGlvbk9ic2VydmVyKShhdEVuZE9mTWljcm90YXNrKVxuICAub2JzZXJ2ZSh0d2lkZGxlLCB7Y2hhcmFjdGVyRGF0YTogdHJ1ZX0pXG4gIDtcblxuLy8gZXhwb3J0c1xuc2NvcGUuZW5kT2ZNaWNyb3Rhc2sgPSBlbmRPZk1pY3JvdGFzaztcbi8vIGJjXG5QbGF0Zm9ybS5lbmRPZk1pY3JvdGFzayA9IGVuZE9mTWljcm90YXNrO1xuXG59KShQb2x5bWVyKTtcblxuXG4oZnVuY3Rpb24oc2NvcGUpIHtcblxuLyoqXG4gKiBAY2xhc3MgUG9seW1lclxuICovXG5cbi8vIGltcG9ydHNcbnZhciBlbmRPZk1pY3JvdGFzayA9IHNjb3BlLmVuZE9mTWljcm90YXNrO1xuXG4vLyBsb2dnaW5nXG52YXIgbG9nID0gd2luZG93LldlYkNvbXBvbmVudHMgPyBXZWJDb21wb25lbnRzLmZsYWdzLmxvZyA6IHt9O1xuXG4vLyBpbmplY3Qgc3R5bGUgc2hlZXRcbnZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG5zdHlsZS50ZXh0Q29udGVudCA9ICd0ZW1wbGF0ZSB7ZGlzcGxheTogbm9uZSAhaW1wb3J0YW50O30gLyogaW5qZWN0ZWQgYnkgcGxhdGZvcm0uanMgKi8nO1xudmFyIGhlYWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdoZWFkJyk7XG5oZWFkLmluc2VydEJlZm9yZShzdHlsZSwgaGVhZC5maXJzdENoaWxkKTtcblxuXG4vKipcbiAqIEZvcmNlIGFueSBwZW5kaW5nIGRhdGEgY2hhbmdlcyB0byBiZSBvYnNlcnZlZCBiZWZvcmVcbiAqIHRoZSBuZXh0IHRhc2suIERhdGEgY2hhbmdlcyBhcmUgcHJvY2Vzc2VkIGFzeW5jaHJvbm91c2x5IGJ1dCBhcmUgZ3VhcmFudGVlZFxuICogdG8gYmUgcHJvY2Vzc2VkLCBmb3IgZXhhbXBsZSwgYmVmb3JlIHBhaW50aW5nLiBUaGlzIG1ldGhvZCBzaG91bGQgcmFyZWx5IGJlXG4gKiBuZWVkZWQuIEl0IGRvZXMgbm90aGluZyB3aGVuIE9iamVjdC5vYnNlcnZlIGlzIGF2YWlsYWJsZTtcbiAqIHdoZW4gT2JqZWN0Lm9ic2VydmUgaXMgbm90IGF2YWlsYWJsZSwgUG9seW1lciBhdXRvbWF0aWNhbGx5IGZsdXNoZXMgZGF0YVxuICogY2hhbmdlcyBhcHByb3hpbWF0ZWx5IGV2ZXJ5IDEvMTAgc2Vjb25kLlxuICogVGhlcmVmb3JlLCBgZmx1c2hgIHNob3VsZCBvbmx5IGJlIHVzZWQgd2hlbiBhIGRhdGEgbXV0YXRpb24gc2hvdWxkIGJlXG4gKiBvYnNlcnZlZCBzb29uZXIgdGhhbiB0aGlzLlxuICpcbiAqIEBtZXRob2QgZmx1c2hcbiAqL1xuLy8gZmx1c2ggKHdpdGggbG9nZ2luZylcbnZhciBmbHVzaGluZztcbmZ1bmN0aW9uIGZsdXNoKCkge1xuICBpZiAoIWZsdXNoaW5nKSB7XG4gICAgZmx1c2hpbmcgPSB0cnVlO1xuICAgIGVuZE9mTWljcm90YXNrKGZ1bmN0aW9uKCkge1xuICAgICAgZmx1c2hpbmcgPSBmYWxzZTtcbiAgICAgIGxvZy5kYXRhICYmIGNvbnNvbGUuZ3JvdXAoJ2ZsdXNoJyk7XG4gICAgICBQbGF0Zm9ybS5wZXJmb3JtTWljcm90YXNrQ2hlY2twb2ludCgpO1xuICAgICAgbG9nLmRhdGEgJiYgY29uc29sZS5ncm91cEVuZCgpO1xuICAgIH0pO1xuICB9XG59O1xuXG4vLyBwb2xsaW5nIGRpcnR5IGNoZWNrZXJcbi8vIGZsdXNoIHBlcmlvZGljYWxseSBpZiBwbGF0Zm9ybSBkb2VzIG5vdCBoYXZlIG9iamVjdCBvYnNlcnZlLlxuaWYgKHR5cGVvZiBPYnNlcnZlciAhPT0gXCJ1bmRlZmluZWRcIiAmJiAhT2JzZXJ2ZXIuaGFzT2JqZWN0T2JzZXJ2ZSkge1xuICB2YXIgRkxVU0hfUE9MTF9JTlRFUlZBTCA9IDEyNTtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ1dlYkNvbXBvbmVudHNSZWFkeScsIGZ1bmN0aW9uKCkge1xuICAgIGZsdXNoKCk7XG4gICAgLy8gd2F0Y2ggZG9jdW1lbnQgdmlzaWJsaXR5IHRvIHRvZ2dsZSBkaXJ0eS1jaGVja2luZ1xuICAgIHZhciB2aXNpYmlsaXR5SGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gb25seSBmbHVzaCBpZiB0aGUgcGFnZSBpcyB2aXNpYmlsZVxuICAgICAgaWYgKGRvY3VtZW50LnZpc2liaWxpdHlTdGF0ZSA9PT0gJ2hpZGRlbicpIHtcbiAgICAgICAgaWYgKHNjb3BlLmZsdXNoUG9sbCkge1xuICAgICAgICAgIGNsZWFySW50ZXJ2YWwoc2NvcGUuZmx1c2hQb2xsKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2NvcGUuZmx1c2hQb2xsID0gc2V0SW50ZXJ2YWwoZmx1c2gsIEZMVVNIX1BPTExfSU5URVJWQUwpO1xuICAgICAgfVxuICAgIH07XG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudC52aXNpYmlsaXR5U3RhdGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd2aXNpYmlsaXR5Y2hhbmdlJywgdmlzaWJpbGl0eUhhbmRsZXIpO1xuICAgIH1cbiAgICB2aXNpYmlsaXR5SGFuZGxlcigpO1xuICB9KTtcbn0gZWxzZSB7XG4gIC8vIG1ha2UgZmx1c2ggYSBuby1vcCB3aGVuIHdlIGhhdmUgT2JqZWN0Lm9ic2VydmVcbiAgZmx1c2ggPSBmdW5jdGlvbigpIHt9O1xufVxuXG5pZiAod2luZG93LkN1c3RvbUVsZW1lbnRzICYmICFDdXN0b21FbGVtZW50cy51c2VOYXRpdmUpIHtcbiAgdmFyIG9yaWdpbmFsSW1wb3J0Tm9kZSA9IERvY3VtZW50LnByb3RvdHlwZS5pbXBvcnROb2RlO1xuICBEb2N1bWVudC5wcm90b3R5cGUuaW1wb3J0Tm9kZSA9IGZ1bmN0aW9uKG5vZGUsIGRlZXApIHtcbiAgICB2YXIgaW1wb3J0ZWQgPSBvcmlnaW5hbEltcG9ydE5vZGUuY2FsbCh0aGlzLCBub2RlLCBkZWVwKTtcbiAgICBDdXN0b21FbGVtZW50cy51cGdyYWRlQWxsKGltcG9ydGVkKTtcbiAgICByZXR1cm4gaW1wb3J0ZWQ7XG4gIH07XG59XG5cbi8vIGV4cG9ydHNcbnNjb3BlLmZsdXNoID0gZmx1c2g7XG4vLyBiY1xuUGxhdGZvcm0uZmx1c2ggPSBmbHVzaDtcblxufSkod2luZG93LlBvbHltZXIpO1xuXG5cbihmdW5jdGlvbihzY29wZSkge1xuXG52YXIgdXJsUmVzb2x2ZXIgPSB7XG4gIHJlc29sdmVEb206IGZ1bmN0aW9uKHJvb3QsIHVybCkge1xuICAgIHVybCA9IHVybCB8fCBiYXNlVXJsKHJvb3QpO1xuICAgIHRoaXMucmVzb2x2ZUF0dHJpYnV0ZXMocm9vdCwgdXJsKTtcbiAgICB0aGlzLnJlc29sdmVTdHlsZXMocm9vdCwgdXJsKTtcbiAgICAvLyBoYW5kbGUgdGVtcGxhdGUuY29udGVudFxuICAgIHZhciB0ZW1wbGF0ZXMgPSByb290LnF1ZXJ5U2VsZWN0b3JBbGwoJ3RlbXBsYXRlJyk7XG4gICAgaWYgKHRlbXBsYXRlcykge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0ZW1wbGF0ZXMubGVuZ3RoLCB0OyAoaSA8IGwpICYmICh0ID0gdGVtcGxhdGVzW2ldKTsgaSsrKSB7XG4gICAgICAgIGlmICh0LmNvbnRlbnQpIHtcbiAgICAgICAgICB0aGlzLnJlc29sdmVEb20odC5jb250ZW50LCB1cmwpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuICByZXNvbHZlVGVtcGxhdGU6IGZ1bmN0aW9uKHRlbXBsYXRlKSB7XG4gICAgdGhpcy5yZXNvbHZlRG9tKHRlbXBsYXRlLmNvbnRlbnQsIGJhc2VVcmwodGVtcGxhdGUpKTtcbiAgfSxcbiAgcmVzb2x2ZVN0eWxlczogZnVuY3Rpb24ocm9vdCwgdXJsKSB7XG4gICAgdmFyIHN0eWxlcyA9IHJvb3QucXVlcnlTZWxlY3RvckFsbCgnc3R5bGUnKTtcbiAgICBpZiAoc3R5bGVzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHN0eWxlcy5sZW5ndGgsIHM7IChpIDwgbCkgJiYgKHMgPSBzdHlsZXNbaV0pOyBpKyspIHtcbiAgICAgICAgdGhpcy5yZXNvbHZlU3R5bGUocywgdXJsKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHJlc29sdmVTdHlsZTogZnVuY3Rpb24oc3R5bGUsIHVybCkge1xuICAgIHVybCA9IHVybCB8fCBiYXNlVXJsKHN0eWxlKTtcbiAgICBzdHlsZS50ZXh0Q29udGVudCA9IHRoaXMucmVzb2x2ZUNzc1RleHQoc3R5bGUudGV4dENvbnRlbnQsIHVybCk7XG4gIH0sXG4gIHJlc29sdmVDc3NUZXh0OiBmdW5jdGlvbihjc3NUZXh0LCBiYXNlVXJsLCBrZWVwQWJzb2x1dGUpIHtcbiAgICBjc3NUZXh0ID0gcmVwbGFjZVVybHNJbkNzc1RleHQoY3NzVGV4dCwgYmFzZVVybCwga2VlcEFic29sdXRlLCBDU1NfVVJMX1JFR0VYUCk7XG4gICAgcmV0dXJuIHJlcGxhY2VVcmxzSW5Dc3NUZXh0KGNzc1RleHQsIGJhc2VVcmwsIGtlZXBBYnNvbHV0ZSwgQ1NTX0lNUE9SVF9SRUdFWFApO1xuICB9LFxuICByZXNvbHZlQXR0cmlidXRlczogZnVuY3Rpb24ocm9vdCwgdXJsKSB7XG4gICAgaWYgKHJvb3QuaGFzQXR0cmlidXRlcyAmJiByb290Lmhhc0F0dHJpYnV0ZXMoKSkge1xuICAgICAgdGhpcy5yZXNvbHZlRWxlbWVudEF0dHJpYnV0ZXMocm9vdCwgdXJsKTtcbiAgICB9XG4gICAgLy8gc2VhcmNoIGZvciBhdHRyaWJ1dGVzIHRoYXQgaG9zdCB1cmxzXG4gICAgdmFyIG5vZGVzID0gcm9vdCAmJiByb290LnF1ZXJ5U2VsZWN0b3JBbGwoVVJMX0FUVFJTX1NFTEVDVE9SKTtcbiAgICBpZiAobm9kZXMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbm9kZXMubGVuZ3RoLCBuOyAoaSA8IGwpICYmIChuID0gbm9kZXNbaV0pOyBpKyspIHtcbiAgICAgICAgdGhpcy5yZXNvbHZlRWxlbWVudEF0dHJpYnV0ZXMobiwgdXJsKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHJlc29sdmVFbGVtZW50QXR0cmlidXRlczogZnVuY3Rpb24obm9kZSwgdXJsKSB7XG4gICAgdXJsID0gdXJsIHx8IGJhc2VVcmwobm9kZSk7XG4gICAgVVJMX0FUVFJTLmZvckVhY2goZnVuY3Rpb24odikge1xuICAgICAgdmFyIGF0dHIgPSBub2RlLmF0dHJpYnV0ZXNbdl07XG4gICAgICB2YXIgdmFsdWUgPSBhdHRyICYmIGF0dHIudmFsdWU7XG4gICAgICB2YXIgcmVwbGFjZW1lbnQ7XG4gICAgICBpZiAodmFsdWUgJiYgdmFsdWUuc2VhcmNoKFVSTF9URU1QTEFURV9TRUFSQ0gpIDwgMCkge1xuICAgICAgICBpZiAodiA9PT0gJ3N0eWxlJykge1xuICAgICAgICAgIHJlcGxhY2VtZW50ID0gcmVwbGFjZVVybHNJbkNzc1RleHQodmFsdWUsIHVybCwgZmFsc2UsIENTU19VUkxfUkVHRVhQKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXBsYWNlbWVudCA9IHJlc29sdmVSZWxhdGl2ZVVybCh1cmwsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBhdHRyLnZhbHVlID0gcmVwbGFjZW1lbnQ7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn07XG5cbnZhciBDU1NfVVJMX1JFR0VYUCA9IC8odXJsXFwoKShbXildKikoXFwpKS9nO1xudmFyIENTU19JTVBPUlRfUkVHRVhQID0gLyhAaW1wb3J0W1xcc10rKD8hdXJsXFwoKSkoW147XSopKDspL2c7XG52YXIgVVJMX0FUVFJTID0gWydocmVmJywgJ3NyYycsICdhY3Rpb24nLCAnc3R5bGUnLCAndXJsJ107XG52YXIgVVJMX0FUVFJTX1NFTEVDVE9SID0gJ1snICsgVVJMX0FUVFJTLmpvaW4oJ10sWycpICsgJ10nO1xudmFyIFVSTF9URU1QTEFURV9TRUFSQ0ggPSAne3suKn19JztcbnZhciBVUkxfSEFTSCA9ICcjJztcblxuZnVuY3Rpb24gYmFzZVVybChub2RlKSB7XG4gIHZhciB1ID0gbmV3IFVSTChub2RlLm93bmVyRG9jdW1lbnQuYmFzZVVSSSk7XG4gIHUuc2VhcmNoID0gJyc7XG4gIHUuaGFzaCA9ICcnO1xuICByZXR1cm4gdTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZVVybHNJbkNzc1RleHQoY3NzVGV4dCwgYmFzZVVybCwga2VlcEFic29sdXRlLCByZWdleHApIHtcbiAgcmV0dXJuIGNzc1RleHQucmVwbGFjZShyZWdleHAsIGZ1bmN0aW9uKG0sIHByZSwgdXJsLCBwb3N0KSB7XG4gICAgdmFyIHVybFBhdGggPSB1cmwucmVwbGFjZSgvW1wiJ10vZywgJycpO1xuICAgIHVybFBhdGggPSByZXNvbHZlUmVsYXRpdmVVcmwoYmFzZVVybCwgdXJsUGF0aCwga2VlcEFic29sdXRlKTtcbiAgICByZXR1cm4gcHJlICsgJ1xcJycgKyB1cmxQYXRoICsgJ1xcJycgKyBwb3N0O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVJlbGF0aXZlVXJsKGJhc2VVcmwsIHVybCwga2VlcEFic29sdXRlKSB7XG4gIC8vIGRvIG5vdCByZXNvbHZlICcvJyBhYnNvbHV0ZSB1cmxzXG4gIGlmICh1cmwgJiYgdXJsWzBdID09PSAnLycpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG4gIC8vIGRvIG5vdCByZXNvbHZlICcjJyBsaW5rcywgdGhleSBhcmUgdXNlZCBmb3Igcm91dGluZ1xuICBpZiAodXJsICYmIHVybFswXSA9PT0gJyMnKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuICB2YXIgdSA9IG5ldyBVUkwodXJsLCBiYXNlVXJsKTtcbiAgcmV0dXJuIGtlZXBBYnNvbHV0ZSA/IHUuaHJlZiA6IG1ha2VEb2N1bWVudFJlbFBhdGgodS5ocmVmKTtcbn1cblxuZnVuY3Rpb24gbWFrZURvY3VtZW50UmVsUGF0aCh1cmwpIHtcbiAgdmFyIHJvb3QgPSBiYXNlVXJsKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCk7XG4gIHZhciB1ID0gbmV3IFVSTCh1cmwsIHJvb3QpO1xuICBpZiAodS5ob3N0ID09PSByb290Lmhvc3QgJiYgdS5wb3J0ID09PSByb290LnBvcnQgJiZcbiAgICAgIHUucHJvdG9jb2wgPT09IHJvb3QucHJvdG9jb2wpIHtcbiAgICByZXR1cm4gbWFrZVJlbFBhdGgocm9vdCwgdSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxufVxuXG4vLyBtYWtlIGEgcmVsYXRpdmUgcGF0aCBmcm9tIHNvdXJjZSB0byB0YXJnZXRcbmZ1bmN0aW9uIG1ha2VSZWxQYXRoKHNvdXJjZVVybCwgdGFyZ2V0VXJsKSB7XG4gIHZhciBzb3VyY2UgPSBzb3VyY2VVcmwucGF0aG5hbWU7XG4gIHZhciB0YXJnZXQgPSB0YXJnZXRVcmwucGF0aG5hbWU7XG4gIHZhciBzID0gc291cmNlLnNwbGl0KCcvJyk7XG4gIHZhciB0ID0gdGFyZ2V0LnNwbGl0KCcvJyk7XG4gIHdoaWxlIChzLmxlbmd0aCAmJiBzWzBdID09PSB0WzBdKXtcbiAgICBzLnNoaWZ0KCk7XG4gICAgdC5zaGlmdCgpO1xuICB9XG4gIGZvciAodmFyIGkgPSAwLCBsID0gcy5sZW5ndGggLSAxOyBpIDwgbDsgaSsrKSB7XG4gICAgdC51bnNoaWZ0KCcuLicpO1xuICB9XG4gIC8vIGVtcHR5ICcjJyBpcyBkaXNjYXJkZWQgYnV0IHdlIG5lZWQgdG8gcHJlc2VydmUgaXQuXG4gIHZhciBoYXNoID0gKHRhcmdldFVybC5ocmVmLnNsaWNlKC0xKSA9PT0gVVJMX0hBU0gpID8gVVJMX0hBU0ggOiB0YXJnZXRVcmwuaGFzaDtcbiAgcmV0dXJuIHQuam9pbignLycpICsgdGFyZ2V0VXJsLnNlYXJjaCArIGhhc2g7XG59XG5cbi8vIGV4cG9ydHNcbnNjb3BlLnVybFJlc29sdmVyID0gdXJsUmVzb2x2ZXI7XG5cbn0pKFBvbHltZXIpO1xuXG4oZnVuY3Rpb24oc2NvcGUpIHtcbiAgdmFyIGVuZE9mTWljcm90YXNrID0gUG9seW1lci5lbmRPZk1pY3JvdGFzaztcblxuICAvLyBHZW5lcmljIHVybCBsb2FkZXJcbiAgZnVuY3Rpb24gTG9hZGVyKHJlZ2V4KSB7XG4gICAgdGhpcy5jYWNoZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgdGhpcy5tYXAgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIHRoaXMucmVxdWVzdHMgPSAwO1xuICAgIHRoaXMucmVnZXggPSByZWdleDtcbiAgfVxuICBMb2FkZXIucHJvdG90eXBlID0ge1xuXG4gICAgLy8gVE9ETyhkZnJlZWRtKTogdGhlcmUgbWF5IGJlIGEgYmV0dGVyIGZhY3RvcmluZyBoZXJlXG4gICAgLy8gZXh0cmFjdCBhYnNvbHV0ZSB1cmxzIGZyb20gdGhlIHRleHQgKGZ1bGwgb2YgcmVsYXRpdmUgdXJscylcbiAgICBleHRyYWN0VXJsczogZnVuY3Rpb24odGV4dCwgYmFzZSkge1xuICAgICAgdmFyIG1hdGNoZXMgPSBbXTtcbiAgICAgIHZhciBtYXRjaGVkLCB1O1xuICAgICAgd2hpbGUgKChtYXRjaGVkID0gdGhpcy5yZWdleC5leGVjKHRleHQpKSkge1xuICAgICAgICB1ID0gbmV3IFVSTChtYXRjaGVkWzFdLCBiYXNlKTtcbiAgICAgICAgbWF0Y2hlcy5wdXNoKHttYXRjaGVkOiBtYXRjaGVkWzBdLCB1cmw6IHUuaHJlZn0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1hdGNoZXM7XG4gICAgfSxcbiAgICAvLyB0YWtlIGEgdGV4dCBibG9iLCBhIHJvb3QgdXJsLCBhbmQgYSBjYWxsYmFjayBhbmQgbG9hZCBhbGwgdGhlIHVybHMgZm91bmQgd2l0aGluIHRoZSB0ZXh0XG4gICAgLy8gcmV0dXJucyBhIG1hcCBvZiBhYnNvbHV0ZSB1cmwgdG8gdGV4dFxuICAgIHByb2Nlc3M6IGZ1bmN0aW9uKHRleHQsIHJvb3QsIGNhbGxiYWNrKSB7XG4gICAgICB2YXIgbWF0Y2hlcyA9IHRoaXMuZXh0cmFjdFVybHModGV4dCwgcm9vdCk7XG5cbiAgICAgIC8vIGV2ZXJ5IGNhbGwgdG8gcHJvY2VzcyByZXR1cm5zIGFsbCB0aGUgdGV4dCB0aGlzIGxvYWRlciBoYXMgZXZlciByZWNlaXZlZFxuICAgICAgdmFyIGRvbmUgPSBjYWxsYmFjay5iaW5kKG51bGwsIHRoaXMubWFwKTtcbiAgICAgIHRoaXMuZmV0Y2gobWF0Y2hlcywgZG9uZSk7XG4gICAgfSxcbiAgICAvLyBidWlsZCBhIG1hcHBpbmcgb2YgdXJsIC0+IHRleHQgZnJvbSBtYXRjaGVzXG4gICAgZmV0Y2g6IGZ1bmN0aW9uKG1hdGNoZXMsIGNhbGxiYWNrKSB7XG4gICAgICB2YXIgaW5mbGlnaHQgPSBtYXRjaGVzLmxlbmd0aDtcblxuICAgICAgLy8gcmV0dXJuIGVhcmx5IGlmIHRoZXJlIGlzIG5vIGZldGNoaW5nIHRvIGJlIGRvbmVcbiAgICAgIGlmICghaW5mbGlnaHQpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIHdhaXQgZm9yIGFsbCBzdWJyZXF1ZXN0cyB0byByZXR1cm5cbiAgICAgIHZhciBkb25lID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICgtLWluZmxpZ2h0ID09PSAwKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgLy8gc3RhcnQgZmV0Y2hpbmcgYWxsIHN1YnJlcXVlc3RzXG4gICAgICB2YXIgbSwgcmVxLCB1cmw7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluZmxpZ2h0OyBpKyspIHtcbiAgICAgICAgbSA9IG1hdGNoZXNbaV07XG4gICAgICAgIHVybCA9IG0udXJsO1xuICAgICAgICByZXEgPSB0aGlzLmNhY2hlW3VybF07XG4gICAgICAgIC8vIGlmIHRoaXMgdXJsIGhhcyBhbHJlYWR5IGJlZW4gcmVxdWVzdGVkLCBza2lwIHJlcXVlc3RpbmcgaXQgYWdhaW5cbiAgICAgICAgaWYgKCFyZXEpIHtcbiAgICAgICAgICByZXEgPSB0aGlzLnhocih1cmwpO1xuICAgICAgICAgIHJlcS5tYXRjaCA9IG07XG4gICAgICAgICAgdGhpcy5jYWNoZVt1cmxdID0gcmVxO1xuICAgICAgICB9XG4gICAgICAgIC8vIHdhaXQgZm9yIHRoZSByZXF1ZXN0IHRvIHByb2Nlc3MgaXRzIHN1YnJlcXVlc3RzXG4gICAgICAgIHJlcS53YWl0KGRvbmUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgaGFuZGxlWGhyOiBmdW5jdGlvbihyZXF1ZXN0KSB7XG4gICAgICB2YXIgbWF0Y2ggPSByZXF1ZXN0Lm1hdGNoO1xuICAgICAgdmFyIHVybCA9IG1hdGNoLnVybDtcblxuICAgICAgLy8gaGFuZGxlIGVycm9ycyB3aXRoIGFuIGVtcHR5IHN0cmluZ1xuICAgICAgdmFyIHJlc3BvbnNlID0gcmVxdWVzdC5yZXNwb25zZSB8fCByZXF1ZXN0LnJlc3BvbnNlVGV4dCB8fCAnJztcbiAgICAgIHRoaXMubWFwW3VybF0gPSByZXNwb25zZTtcbiAgICAgIHRoaXMuZmV0Y2godGhpcy5leHRyYWN0VXJscyhyZXNwb25zZSwgdXJsKSwgcmVxdWVzdC5yZXNvbHZlKTtcbiAgICB9LFxuICAgIHhocjogZnVuY3Rpb24odXJsKSB7XG4gICAgICB0aGlzLnJlcXVlc3RzKys7XG4gICAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgcmVxdWVzdC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xuICAgICAgcmVxdWVzdC5zZW5kKCk7XG4gICAgICByZXF1ZXN0Lm9uZXJyb3IgPSByZXF1ZXN0Lm9ubG9hZCA9IHRoaXMuaGFuZGxlWGhyLmJpbmQodGhpcywgcmVxdWVzdCk7XG5cbiAgICAgIC8vIHF1ZXVlIG9mIHRhc2tzIHRvIHJ1biBhZnRlciBYSFIgcmV0dXJuc1xuICAgICAgcmVxdWVzdC5wZW5kaW5nID0gW107XG4gICAgICByZXF1ZXN0LnJlc29sdmUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBlbmRpbmcgPSByZXF1ZXN0LnBlbmRpbmc7XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBwZW5kaW5nLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgcGVuZGluZ1tpXSgpO1xuICAgICAgICB9XG4gICAgICAgIHJlcXVlc3QucGVuZGluZyA9IG51bGw7XG4gICAgICB9O1xuXG4gICAgICAvLyBpZiB3ZSBoYXZlIGFscmVhZHkgcmVzb2x2ZWQsIHBlbmRpbmcgaXMgbnVsbCwgYXN5bmMgY2FsbCB0aGUgY2FsbGJhY2tcbiAgICAgIHJlcXVlc3Qud2FpdCA9IGZ1bmN0aW9uKGZuKSB7XG4gICAgICAgIGlmIChyZXF1ZXN0LnBlbmRpbmcpIHtcbiAgICAgICAgICByZXF1ZXN0LnBlbmRpbmcucHVzaChmbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZW5kT2ZNaWNyb3Rhc2soZm4pO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9XG4gIH07XG5cbiAgc2NvcGUuTG9hZGVyID0gTG9hZGVyO1xufSkoUG9seW1lcik7XG5cbihmdW5jdGlvbihzY29wZSkge1xuXG52YXIgdXJsUmVzb2x2ZXIgPSBzY29wZS51cmxSZXNvbHZlcjtcbnZhciBMb2FkZXIgPSBzY29wZS5Mb2FkZXI7XG5cbmZ1bmN0aW9uIFN0eWxlUmVzb2x2ZXIoKSB7XG4gIHRoaXMubG9hZGVyID0gbmV3IExvYWRlcih0aGlzLnJlZ2V4KTtcbn1cblN0eWxlUmVzb2x2ZXIucHJvdG90eXBlID0ge1xuICByZWdleDogL0BpbXBvcnRcXHMrKD86dXJsKT9bXCInXFwoXSooW14nXCJcXCldKilbJ1wiXFwpXSo7L2csXG4gIC8vIFJlY3Vyc2l2ZWx5IHJlcGxhY2UgQGltcG9ydHMgd2l0aCB0aGUgdGV4dCBhdCB0aGF0IHVybFxuICByZXNvbHZlOiBmdW5jdGlvbih0ZXh0LCB1cmwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGRvbmUgPSBmdW5jdGlvbihtYXApIHtcbiAgICAgIGNhbGxiYWNrKHRoaXMuZmxhdHRlbih0ZXh0LCB1cmwsIG1hcCkpO1xuICAgIH0uYmluZCh0aGlzKTtcbiAgICB0aGlzLmxvYWRlci5wcm9jZXNzKHRleHQsIHVybCwgZG9uZSk7XG4gIH0sXG4gIC8vIHJlc29sdmUgdGhlIHRleHRDb250ZW50IG9mIGEgc3R5bGUgbm9kZVxuICByZXNvbHZlTm9kZTogZnVuY3Rpb24oc3R5bGUsIHVybCwgY2FsbGJhY2spIHtcbiAgICB2YXIgdGV4dCA9IHN0eWxlLnRleHRDb250ZW50O1xuICAgIHZhciBkb25lID0gZnVuY3Rpb24odGV4dCkge1xuICAgICAgc3R5bGUudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgY2FsbGJhY2soc3R5bGUpO1xuICAgIH07XG4gICAgdGhpcy5yZXNvbHZlKHRleHQsIHVybCwgZG9uZSk7XG4gIH0sXG4gIC8vIGZsYXR0ZW4gYWxsIHRoZSBAaW1wb3J0cyB0byB0ZXh0XG4gIGZsYXR0ZW46IGZ1bmN0aW9uKHRleHQsIGJhc2UsIG1hcCkge1xuICAgIHZhciBtYXRjaGVzID0gdGhpcy5sb2FkZXIuZXh0cmFjdFVybHModGV4dCwgYmFzZSk7XG4gICAgdmFyIG1hdGNoLCB1cmwsIGludGVybWVkaWF0ZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1hdGNoZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG1hdGNoID0gbWF0Y2hlc1tpXTtcbiAgICAgIHVybCA9IG1hdGNoLnVybDtcbiAgICAgIC8vIHJlc29sdmUgYW55IGNzcyB0ZXh0IHRvIGJlIHJlbGF0aXZlIHRvIHRoZSBpbXBvcnRlciwga2VlcCBhYnNvbHV0ZSB1cmxcbiAgICAgIGludGVybWVkaWF0ZSA9IHVybFJlc29sdmVyLnJlc29sdmVDc3NUZXh0KG1hcFt1cmxdLCB1cmwsIHRydWUpO1xuICAgICAgLy8gZmxhdHRlbiBpbnRlcm1lZGlhdGUgQGltcG9ydHNcbiAgICAgIGludGVybWVkaWF0ZSA9IHRoaXMuZmxhdHRlbihpbnRlcm1lZGlhdGUsIGJhc2UsIG1hcCk7XG4gICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKG1hdGNoLm1hdGNoZWQsIGludGVybWVkaWF0ZSk7XG4gICAgfVxuICAgIHJldHVybiB0ZXh0O1xuICB9LFxuICBsb2FkU3R5bGVzOiBmdW5jdGlvbihzdHlsZXMsIGJhc2UsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGxvYWRlZD0wLCBsID0gc3R5bGVzLmxlbmd0aDtcbiAgICAvLyBjYWxsZWQgaW4gdGhlIGNvbnRleHQgb2YgdGhlIHN0eWxlXG4gICAgZnVuY3Rpb24gbG9hZGVkU3R5bGUoc3R5bGUpIHtcbiAgICAgIGxvYWRlZCsrO1xuICAgICAgaWYgKGxvYWRlZCA9PT0gbCAmJiBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKHZhciBpPTAsIHM7IChpPGwpICYmIChzPXN0eWxlc1tpXSk7IGkrKykge1xuICAgICAgdGhpcy5yZXNvbHZlTm9kZShzLCBiYXNlLCBsb2FkZWRTdHlsZSk7XG4gICAgfVxuICB9XG59O1xuXG52YXIgc3R5bGVSZXNvbHZlciA9IG5ldyBTdHlsZVJlc29sdmVyKCk7XG5cbi8vIGV4cG9ydHNcbnNjb3BlLnN0eWxlUmVzb2x2ZXIgPSBzdHlsZVJlc29sdmVyO1xuXG59KShQb2x5bWVyKTtcblxuKGZ1bmN0aW9uKHNjb3BlKSB7XG5cbiAgLy8gY29weSBvd24gcHJvcGVydGllcyBmcm9tICdhcGknIHRvICdwcm90b3R5cGUsIHdpdGggbmFtZSBoaW50aW5nIGZvciAnc3VwZXInXG4gIGZ1bmN0aW9uIGV4dGVuZChwcm90b3R5cGUsIGFwaSkge1xuICAgIGlmIChwcm90b3R5cGUgJiYgYXBpKSB7XG4gICAgICAvLyB1c2Ugb25seSBvd24gcHJvcGVydGllcyBvZiAnYXBpJ1xuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYXBpKS5mb3JFYWNoKGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgLy8gYWNxdWlyZSBwcm9wZXJ0eSBkZXNjcmlwdG9yXG4gICAgICAgIHZhciBwZCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoYXBpLCBuKTtcbiAgICAgICAgaWYgKHBkKSB7XG4gICAgICAgICAgLy8gY2xvbmUgcHJvcGVydHkgdmlhIGRlc2NyaXB0b3JcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG90eXBlLCBuLCBwZCk7XG4gICAgICAgICAgLy8gY2FjaGUgbmFtZS1vZi1tZXRob2QgZm9yICdzdXBlcicgZW5naW5lXG4gICAgICAgICAgaWYgKHR5cGVvZiBwZC52YWx1ZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAvLyBoaW50IHRoZSAnc3VwZXInIGVuZ2luZVxuICAgICAgICAgICAgcGQudmFsdWUubm9tID0gbjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcHJvdG90eXBlO1xuICB9XG5cblxuICAvLyBtaXhpblxuXG4gIC8vIGNvcHkgYWxsIHByb3BlcnRpZXMgZnJvbSBpblByb3BzIChldCBhbCkgdG8gaW5PYmpcbiAgZnVuY3Rpb24gbWl4aW4oaW5PYmovKiwgaW5Qcm9wcywgaW5Nb3JlUHJvcHMsIC4uLiovKSB7XG4gICAgdmFyIG9iaiA9IGluT2JqIHx8IHt9O1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcCA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIG4gaW4gcCkge1xuICAgICAgICAgIGNvcHlQcm9wZXJ0eShuLCBwLCBvYmopO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoKHgpIHtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG4gIC8vIGNvcHkgcHJvcGVydHkgaW5OYW1lIGZyb20gaW5Tb3VyY2Ugb2JqZWN0IHRvIGluVGFyZ2V0IG9iamVjdFxuICBmdW5jdGlvbiBjb3B5UHJvcGVydHkoaW5OYW1lLCBpblNvdXJjZSwgaW5UYXJnZXQpIHtcbiAgICB2YXIgcGQgPSBnZXRQcm9wZXJ0eURlc2NyaXB0b3IoaW5Tb3VyY2UsIGluTmFtZSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGluVGFyZ2V0LCBpbk5hbWUsIHBkKTtcbiAgfVxuXG4gIC8vIGdldCBwcm9wZXJ0eSBkZXNjcmlwdG9yIGZvciBpbk5hbWUgb24gaW5PYmplY3QsIGV2ZW4gaWZcbiAgLy8gaW5OYW1lIGV4aXN0cyBvbiBzb21lIGxpbmsgaW4gaW5PYmplY3QncyBwcm90b3R5cGUgY2hhaW5cbiAgZnVuY3Rpb24gZ2V0UHJvcGVydHlEZXNjcmlwdG9yKGluT2JqZWN0LCBpbk5hbWUpIHtcbiAgICBpZiAoaW5PYmplY3QpIHtcbiAgICAgIHZhciBwZCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoaW5PYmplY3QsIGluTmFtZSk7XG4gICAgICByZXR1cm4gcGQgfHwgZ2V0UHJvcGVydHlEZXNjcmlwdG9yKE9iamVjdC5nZXRQcm90b3R5cGVPZihpbk9iamVjdCksIGluTmFtZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gZXhwb3J0c1xuXG4gIHNjb3BlLmV4dGVuZCA9IGV4dGVuZDtcbiAgc2NvcGUubWl4aW4gPSBtaXhpbjtcblxuICAvLyBmb3IgYmNcbiAgUGxhdGZvcm0ubWl4aW4gPSBtaXhpbjtcblxufSkoUG9seW1lcik7XG5cbihmdW5jdGlvbihzY29wZSkge1xuXG4gIC8vIHVzYWdlXG5cbiAgLy8gaW52b2tlIGNiLmNhbGwodGhpcykgaW4gMTAwbXMsIHVubGVzcyB0aGUgam9iIGlzIHJlLXJlZ2lzdGVyZWQsXG4gIC8vIHdoaWNoIHJlc2V0cyB0aGUgdGltZXJcbiAgLy9cbiAgLy8gdGhpcy5teUpvYiA9IHRoaXMuam9iKHRoaXMubXlKb2IsIGNiLCAxMDApXG4gIC8vXG4gIC8vIHJldHVybnMgYSBqb2IgaGFuZGxlIHdoaWNoIGNhbiBiZSB1c2VkIHRvIHJlLXJlZ2lzdGVyIGEgam9iXG5cbiAgdmFyIEpvYiA9IGZ1bmN0aW9uKGluQ29udGV4dCkge1xuICAgIHRoaXMuY29udGV4dCA9IGluQ29udGV4dDtcbiAgICB0aGlzLmJvdW5kQ29tcGxldGUgPSB0aGlzLmNvbXBsZXRlLmJpbmQodGhpcylcbiAgfTtcbiAgSm9iLnByb3RvdHlwZSA9IHtcbiAgICBnbzogZnVuY3Rpb24oY2FsbGJhY2ssIHdhaXQpIHtcbiAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgIHZhciBoO1xuICAgICAgaWYgKCF3YWl0KSB7XG4gICAgICAgIGggPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5ib3VuZENvbXBsZXRlKTtcbiAgICAgICAgdGhpcy5oYW5kbGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaCA9IHNldFRpbWVvdXQodGhpcy5ib3VuZENvbXBsZXRlLCB3YWl0KTtcbiAgICAgICAgdGhpcy5oYW5kbGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoaCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuaGFuZGxlKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlKCk7XG4gICAgICAgIHRoaXMuaGFuZGxlID0gbnVsbDtcbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLmhhbmRsZSkge1xuICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgdGhpcy5jYWxsYmFjay5jYWxsKHRoaXMuY29udGV4dCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIGpvYihqb2IsIGNhbGxiYWNrLCB3YWl0KSB7XG4gICAgaWYgKGpvYikge1xuICAgICAgam9iLnN0b3AoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgam9iID0gbmV3IEpvYih0aGlzKTtcbiAgICB9XG4gICAgam9iLmdvKGNhbGxiYWNrLCB3YWl0KTtcbiAgICByZXR1cm4gam9iO1xuICB9XG5cbiAgLy8gZXhwb3J0c1xuXG4gIHNjb3BlLmpvYiA9IGpvYjtcblxufSkoUG9seW1lcik7XG5cbihmdW5jdGlvbihzY29wZSkge1xuXG4gIC8vIGRvbSBwb2x5ZmlsbCwgYWRkaXRpb25zLCBhbmQgdXRpbGl0eSBtZXRob2RzXG5cbiAgdmFyIHJlZ2lzdHJ5ID0ge307XG5cbiAgSFRNTEVsZW1lbnQucmVnaXN0ZXIgPSBmdW5jdGlvbih0YWcsIHByb3RvdHlwZSkge1xuICAgIHJlZ2lzdHJ5W3RhZ10gPSBwcm90b3R5cGU7XG4gIH07XG5cbiAgLy8gZ2V0IHByb3RvdHlwZSBtYXBwZWQgdG8gbm9kZSA8dGFnPlxuICBIVE1MRWxlbWVudC5nZXRQcm90b3R5cGVGb3JUYWcgPSBmdW5jdGlvbih0YWcpIHtcbiAgICB2YXIgcHJvdG90eXBlID0gIXRhZyA/IEhUTUxFbGVtZW50LnByb3RvdHlwZSA6IHJlZ2lzdHJ5W3RhZ107XG4gICAgLy8gVE9ETyhzam1pbGVzKTogY3JlYXRpbmcgPHRhZz4gaXMgbGlrZWx5IHRvIGhhdmUgd2FzdGVmdWwgc2lkZS1lZmZlY3RzXG4gICAgcmV0dXJuIHByb3RvdHlwZSB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpKTtcbiAgfTtcblxuICAvLyB3ZSBoYXZlIHRvIGZsYWcgcHJvcGFnYXRpb24gc3RvcHBhZ2UgZm9yIHRoZSBldmVudCBkaXNwYXRjaGVyXG4gIHZhciBvcmlnaW5hbFN0b3BQcm9wYWdhdGlvbiA9IEV2ZW50LnByb3RvdHlwZS5zdG9wUHJvcGFnYXRpb247XG4gIEV2ZW50LnByb3RvdHlwZS5zdG9wUHJvcGFnYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmNhbmNlbEJ1YmJsZSA9IHRydWU7XG4gICAgb3JpZ2luYWxTdG9wUHJvcGFnYXRpb24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcblxuXG4gIC8vIHBvbHlmaWxsIERPTVRva2VuTGlzdFxuICAvLyAqIGFkZC9yZW1vdmU6IGFsbG93IHRoZXNlIG1ldGhvZHMgdG8gdGFrZSBtdWx0aXBsZSBjbGFzc05hbWVzXG4gIC8vICogdG9nZ2xlOiBhZGQgYSAybmQgYXJndW1lbnQgd2hpY2ggZm9yY2VzIHRoZSBnaXZlbiBzdGF0ZSByYXRoZXJcbiAgLy8gIHRoYW4gdG9nZ2xpbmcuXG5cbiAgdmFyIGFkZCA9IERPTVRva2VuTGlzdC5wcm90b3R5cGUuYWRkO1xuICB2YXIgcmVtb3ZlID0gRE9NVG9rZW5MaXN0LnByb3RvdHlwZS5yZW1vdmU7XG4gIERPTVRva2VuTGlzdC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFkZC5jYWxsKHRoaXMsIGFyZ3VtZW50c1tpXSk7XG4gICAgfVxuICB9O1xuICBET01Ub2tlbkxpc3QucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICByZW1vdmUuY2FsbCh0aGlzLCBhcmd1bWVudHNbaV0pO1xuICAgIH1cbiAgfTtcbiAgRE9NVG9rZW5MaXN0LnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbihuYW1lLCBib29sKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMSkge1xuICAgICAgYm9vbCA9ICF0aGlzLmNvbnRhaW5zKG5hbWUpO1xuICAgIH1cbiAgICBib29sID8gdGhpcy5hZGQobmFtZSkgOiB0aGlzLnJlbW92ZShuYW1lKTtcbiAgfTtcbiAgRE9NVG9rZW5MaXN0LnByb3RvdHlwZS5zd2l0Y2ggPSBmdW5jdGlvbihvbGROYW1lLCBuZXdOYW1lKSB7XG4gICAgb2xkTmFtZSAmJiB0aGlzLnJlbW92ZShvbGROYW1lKTtcbiAgICBuZXdOYW1lICYmIHRoaXMuYWRkKG5ld05hbWUpO1xuICB9O1xuXG4gIC8vIGFkZCBhcnJheSgpIHRvIE5vZGVMaXN0LCBOYW1lZE5vZGVNYXAsIEhUTUxDb2xsZWN0aW9uXG5cbiAgdmFyIEFycmF5U2xpY2UgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcyk7XG4gIH07XG5cbiAgdmFyIG5hbWVkTm9kZU1hcCA9ICh3aW5kb3cuTmFtZWROb2RlTWFwIHx8IHdpbmRvdy5Nb3pOYW1lZEF0dHJNYXAgfHwge30pO1xuXG4gIE5vZGVMaXN0LnByb3RvdHlwZS5hcnJheSA9IEFycmF5U2xpY2U7XG4gIG5hbWVkTm9kZU1hcC5wcm90b3R5cGUuYXJyYXkgPSBBcnJheVNsaWNlO1xuICBIVE1MQ29sbGVjdGlvbi5wcm90b3R5cGUuYXJyYXkgPSBBcnJheVNsaWNlO1xuXG4gIC8vIHV0aWxpdHlcblxuICBmdW5jdGlvbiBjcmVhdGVET00oaW5UYWdPck5vZGUsIGluSFRNTCwgaW5BdHRycykge1xuICAgIHZhciBkb20gPSB0eXBlb2YgaW5UYWdPck5vZGUgPT0gJ3N0cmluZycgP1xuICAgICAgICBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGluVGFnT3JOb2RlKSA6IGluVGFnT3JOb2RlLmNsb25lTm9kZSh0cnVlKTtcbiAgICBkb20uaW5uZXJIVE1MID0gaW5IVE1MO1xuICAgIGlmIChpbkF0dHJzKSB7XG4gICAgICBmb3IgKHZhciBuIGluIGluQXR0cnMpIHtcbiAgICAgICAgZG9tLnNldEF0dHJpYnV0ZShuLCBpbkF0dHJzW25dKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRvbTtcbiAgfVxuXG4gIC8vIGV4cG9ydHNcblxuICBzY29wZS5jcmVhdGVET00gPSBjcmVhdGVET007XG5cbn0pKFBvbHltZXIpO1xuXG4oZnVuY3Rpb24oc2NvcGUpIHtcclxuICAgIC8vIHN1cGVyXHJcblxyXG4gICAgLy8gYGFycmF5T2ZBcmdzYCBpcyBhbiBvcHRpb25hbCBhcnJheSBvZiBhcmdzIGxpa2Ugb25lIG1pZ2h0IHBhc3NcclxuICAgIC8vIHRvIGBGdW5jdGlvbi5hcHBseWBcclxuXHJcbiAgICAvLyBUT0RPKHNqbWlsZXMpOlxyXG4gICAgLy8gICAgJHN1cGVyIG11c3QgYmUgaW5zdGFsbGVkIG9uIGFuIGluc3RhbmNlIG9yIHByb3RvdHlwZSBjaGFpblxyXG4gICAgLy8gICAgYXMgYHN1cGVyYCwgYW5kIGludm9rZWQgdmlhIGB0aGlzYCwgZS5nLlxyXG4gICAgLy8gICAgICBgdGhpcy5zdXBlcigpO2BcclxuXHJcbiAgICAvLyAgICB3aWxsIG5vdCB3b3JrIGlmIGZ1bmN0aW9uIG9iamVjdHMgYXJlIG5vdCB1bmlxdWUsIGZvciBleGFtcGxlLFxyXG4gICAgLy8gICAgd2hlbiB1c2luZyBtaXhpbnMuXHJcbiAgICAvLyAgICBUaGUgbWVtb2l6YXRpb24gc3RyYXRlZ3kgYXNzdW1lcyBlYWNoIGZ1bmN0aW9uIGV4aXN0cyBvbiBvbmx5IG9uZVxyXG4gICAgLy8gICAgcHJvdG90eXBlIGNoYWluIGkuZS4gd2UgdXNlIHRoZSBmdW5jdGlvbiBvYmplY3QgZm9yIG1lbW9pemluZylcclxuICAgIC8vICAgIHBlcmhhcHMgd2UgY2FuIGJvb2trZWVwIG9uIHRoZSBwcm90b3R5cGUgaXRzZWxmIGluc3RlYWRcclxuICAgIGZ1bmN0aW9uICRzdXBlcihhcnJheU9mQXJncykge1xyXG4gICAgICAvLyBzaW5jZSB3ZSBhcmUgdGh1bmtpbmcgYSBtZXRob2QgY2FsbCwgcGVyZm9ybWFuY2UgaXMgaW1wb3J0YW50IGhlcmU6XHJcbiAgICAgIC8vIG1lbW9pemUgYWxsIGxvb2t1cHMsIG9uY2UgbWVtb2l6ZWQgdGhlIGZhc3QgcGF0aCBjYWxscyBubyBvdGhlclxyXG4gICAgICAvLyBmdW5jdGlvbnNcclxuICAgICAgLy9cclxuICAgICAgLy8gZmluZCB0aGUgY2FsbGVyIChjYW5ub3QgYmUgYHN0cmljdGAgYmVjYXVzZSBvZiAnY2FsbGVyJylcclxuICAgICAgdmFyIGNhbGxlciA9ICRzdXBlci5jYWxsZXI7XHJcbiAgICAgIC8vIG1lbW9pemVkICduYW1lIG9mIG1ldGhvZCdcclxuICAgICAgdmFyIG5vbSA9IGNhbGxlci5ub207XHJcbiAgICAgIC8vIG1lbW9pemVkIG5leHQgaW1wbGVtZW50YXRpb24gcHJvdG90eXBlXHJcbiAgICAgIHZhciBfc3VwZXIgPSBjYWxsZXIuX3N1cGVyO1xyXG4gICAgICBpZiAoIV9zdXBlcikge1xyXG4gICAgICAgIGlmICghbm9tKSB7XHJcbiAgICAgICAgICBub20gPSBjYWxsZXIubm9tID0gbmFtZUluVGhpcy5jYWxsKHRoaXMsIGNhbGxlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghbm9tKSB7XHJcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ2NhbGxlZCBzdXBlcigpIG9uIGEgbWV0aG9kIG5vdCBpbnN0YWxsZWQgZGVjbGFyYXRpdmVseSAoaGFzIG5vIC5ub20gcHJvcGVydHkpJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHN1cGVyIHByb3RvdHlwZSBpcyBlaXRoZXIgY2FjaGVkIG9yIHdlIGhhdmUgdG8gZmluZCBpdFxyXG4gICAgICAgIC8vIGJ5IHNlYXJjaGluZyBfX3Byb3RvX18gKGF0IHRoZSAndG9wJylcclxuICAgICAgICAvLyBpbnZhcmlhbnQ6IGJlY2F1c2Ugd2UgY2FjaGUgX3N1cGVyIG9uIGZuIGJlbG93LCB3ZSBuZXZlciByZWFjaFxyXG4gICAgICAgIC8vIGhlcmUgZnJvbSBpbnNpZGUgYSBzZXJpZXMgb2YgY2FsbHMgdG8gc3VwZXIoKSwgc28gaXQncyBvayB0b1xyXG4gICAgICAgIC8vIHN0YXJ0IHNlYXJjaGluZyBmcm9tIHRoZSBwcm90b3R5cGUgb2YgJ3RoaXMnIChhdCB0aGUgJ3RvcCcpXHJcbiAgICAgICAgLy8gd2UgbXVzdCBuZXZlciBtZW1vaXplIGEgbnVsbCBzdXBlciBmb3IgdGhpcyByZWFzb25cclxuICAgICAgICBfc3VwZXIgPSBtZW1vaXplU3VwZXIoY2FsbGVyLCBub20sIGdldFByb3RvdHlwZU9mKHRoaXMpKTtcclxuICAgICAgfVxyXG4gICAgICAvLyBvdXIgc3VwZXIgZnVuY3Rpb25cclxuICAgICAgdmFyIGZuID0gX3N1cGVyW25vbV07XHJcbiAgICAgIGlmIChmbikge1xyXG4gICAgICAgIC8vIG1lbW9pemUgaW5mb3JtYXRpb24gc28gJ2ZuJyBjYW4gY2FsbCAnc3VwZXInXHJcbiAgICAgICAgaWYgKCFmbi5fc3VwZXIpIHtcclxuICAgICAgICAgIC8vIG11c3Qgbm90IG1lbW9pemUgbnVsbCwgb3Igd2UgbG9zZSBvdXIgaW52YXJpYW50IGFib3ZlXHJcbiAgICAgICAgICBtZW1vaXplU3VwZXIoZm4sIG5vbSwgX3N1cGVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gaW52b2tlIHRoZSBpbmhlcml0ZWQgbWV0aG9kXHJcbiAgICAgICAgLy8gaWYgJ2ZuJyBpcyBub3QgZnVuY3Rpb24gdmFsdWVkLCB0aGlzIHdpbGwgdGhyb3dcclxuICAgICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJyYXlPZkFyZ3MgfHwgW10pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbmFtZUluVGhpcyh2YWx1ZSkge1xyXG4gICAgICB2YXIgcCA9IHRoaXMuX19wcm90b19fO1xyXG4gICAgICB3aGlsZSAocCAmJiBwICE9PSBIVE1MRWxlbWVudC5wcm90b3R5cGUpIHtcclxuICAgICAgICAvLyBUT0RPKHNqbWlsZXMpOiBnZXRPd25Qcm9wZXJ0eU5hbWVzIGlzIGFic3VyZGx5IGV4cGVuc2l2ZVxyXG4gICAgICAgIHZhciBuJCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHApO1xyXG4gICAgICAgIGZvciAodmFyIGk9MCwgbD1uJC5sZW5ndGgsIG47IGk8bCAmJiAobj1uJFtpXSk7IGkrKykge1xyXG4gICAgICAgICAgdmFyIGQgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHAsIG4pO1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiBkLnZhbHVlID09PSAnZnVuY3Rpb24nICYmIGQudmFsdWUgPT09IHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBwID0gcC5fX3Byb3RvX187XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBtZW1vaXplU3VwZXIobWV0aG9kLCBuYW1lLCBwcm90bykge1xyXG4gICAgICAvLyBmaW5kIGFuZCBjYWNoZSBuZXh0IHByb3RvdHlwZSBjb250YWluaW5nIGBuYW1lYFxyXG4gICAgICAvLyB3ZSBuZWVkIHRoZSBwcm90b3R5cGUgc28gd2UgY2FuIGRvIGFub3RoZXIgbG9va3VwXHJcbiAgICAgIC8vIGZyb20gaGVyZVxyXG4gICAgICB2YXIgcyA9IG5leHRTdXBlcihwcm90bywgbmFtZSwgbWV0aG9kKTtcclxuICAgICAgaWYgKHNbbmFtZV0pIHtcclxuICAgICAgICAvLyBgc2AgaXMgYSBwcm90b3R5cGUsIHRoZSBhY3R1YWwgbWV0aG9kIGlzIGBzW25hbWVdYFxyXG4gICAgICAgIC8vIHRhZyBzdXBlciBtZXRob2Qgd2l0aCBpdCdzIG5hbWUgZm9yIHF1aWNrZXIgbG9va3Vwc1xyXG4gICAgICAgIHNbbmFtZV0ubm9tID0gbmFtZTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbWV0aG9kLl9zdXBlciA9IHM7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbmV4dFN1cGVyKHByb3RvLCBuYW1lLCBjYWxsZXIpIHtcclxuICAgICAgLy8gbG9vayBmb3IgYW4gaW5oZXJpdGVkIHByb3RvdHlwZSB0aGF0IGltcGxlbWVudHMgbmFtZVxyXG4gICAgICB3aGlsZSAocHJvdG8pIHtcclxuICAgICAgICBpZiAoKHByb3RvW25hbWVdICE9PSBjYWxsZXIpICYmIHByb3RvW25hbWVdKSB7XHJcbiAgICAgICAgICByZXR1cm4gcHJvdG87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3RvID0gZ2V0UHJvdG90eXBlT2YocHJvdG8pO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIG11c3Qgbm90IHJldHVybiBudWxsLCBvciB3ZSBsb3NlIG91ciBpbnZhcmlhbnQgYWJvdmVcclxuICAgICAgLy8gaW4gdGhpcyBjYXNlLCBhIHN1cGVyKCkgY2FsbCB3YXMgaW52b2tlZCB3aGVyZSBubyBzdXBlcmNsYXNzXHJcbiAgICAgIC8vIG1ldGhvZCBleGlzdHNcclxuICAgICAgLy8gVE9ETyhzam1pbGVzKTogdGhvdyBhbiBleGNlcHRpb24/XHJcbiAgICAgIHJldHVybiBPYmplY3Q7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTk9URTogSW4gc29tZSBwbGF0Zm9ybXMgKElFMTApIHRoZSBwcm90b3R5cGUgY2hhaW4gaXMgZmFrZWQgdmlhXHJcbiAgICAvLyBfX3Byb3RvX18uIFRoZXJlZm9yZSwgYWx3YXlzIGdldCBwcm90b3R5cGUgdmlhIF9fcHJvdG9fXyBpbnN0ZWFkIG9mXHJcbiAgICAvLyB0aGUgbW9yZSBzdGFuZGFyZCBPYmplY3QuZ2V0UHJvdG90eXBlT2YuXHJcbiAgICBmdW5jdGlvbiBnZXRQcm90b3R5cGVPZihwcm90b3R5cGUpIHtcclxuICAgICAgcmV0dXJuIHByb3RvdHlwZS5fX3Byb3RvX187XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdXRpbGl0eSBmdW5jdGlvbiB0byBwcmVjb21wdXRlIG5hbWUgdGFncyBmb3IgZnVuY3Rpb25zXHJcbiAgICAvLyBpbiBhICh1bmNoYWluZWQpIHByb3RvdHlwZVxyXG4gICAgZnVuY3Rpb24gaGludFN1cGVyKHByb3RvdHlwZSkge1xyXG4gICAgICAvLyB0YWcgZnVuY3Rpb25zIHdpdGggdGhlaXIgcHJvdG90eXBlIG5hbWUgdG8gb3B0aW1pemVcclxuICAgICAgLy8gc3VwZXIgY2FsbCBpbnZvY2F0aW9uc1xyXG4gICAgICBmb3IgKHZhciBuIGluIHByb3RvdHlwZSkge1xyXG4gICAgICAgIHZhciBwZCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IocHJvdG90eXBlLCBuKTtcclxuICAgICAgICBpZiAocGQgJiYgdHlwZW9mIHBkLnZhbHVlID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICBwZC52YWx1ZS5ub20gPSBuO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGV4cG9ydHNcclxuXHJcbiAgICBzY29wZS5zdXBlciA9ICRzdXBlcjtcclxuXHJcbn0pKFBvbHltZXIpO1xyXG5cbihmdW5jdGlvbihzY29wZSkge1xuXG4gIGZ1bmN0aW9uIG5vb3BIYW5kbGVyKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgLy8gaGVscGVyIGZvciBkZXNlcmlhbGl6aW5nIHByb3BlcnRpZXMgb2YgdmFyaW91cyB0eXBlcyB0byBzdHJpbmdzXG4gIHZhciB0eXBlSGFuZGxlcnMgPSB7XG4gICAgc3RyaW5nOiBub29wSGFuZGxlcixcbiAgICAndW5kZWZpbmVkJzogbm9vcEhhbmRsZXIsXG4gICAgZGF0ZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiBuZXcgRGF0ZShEYXRlLnBhcnNlKHZhbHVlKSB8fCBEYXRlLm5vdygpKTtcbiAgICB9LFxuICAgIGJvb2xlYW46IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAodmFsdWUgPT09ICcnKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlID09PSAnZmFsc2UnID8gZmFsc2UgOiAhIXZhbHVlO1xuICAgIH0sXG4gICAgbnVtYmVyOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgdmFyIG4gPSBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgICAgIC8vIGhleCB2YWx1ZXMgbGlrZSBcIjB4RkZGRlwiIHBhcnNlRmxvYXQgYXMgMFxuICAgICAgaWYgKG4gPT09IDApIHtcbiAgICAgICAgbiA9IHBhcnNlSW50KHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpc05hTihuKSA/IHZhbHVlIDogbjtcbiAgICAgIC8vIHRoaXMgY29kZSBkaXNhYmxlZCBiZWNhdXNlIGVuY29kZWQgdmFsdWVzIChsaWtlIFwiMHhGRkZGXCIpXG4gICAgICAvLyBkbyBub3Qgcm91bmQgdHJpcCB0byB0aGVpciBvcmlnaW5hbCBmb3JtYXRcbiAgICAgIC8vcmV0dXJuIChTdHJpbmcoZmxvYXRWYWwpID09PSB2YWx1ZSkgPyBmbG9hdFZhbCA6IHZhbHVlO1xuICAgIH0sXG4gICAgb2JqZWN0OiBmdW5jdGlvbih2YWx1ZSwgY3VycmVudFZhbHVlKSB7XG4gICAgICBpZiAoY3VycmVudFZhbHVlID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIElmIHRoZSBzdHJpbmcgaXMgYW4gb2JqZWN0LCB3ZSBjYW4gcGFyc2UgaXMgd2l0aCB0aGUgSlNPTiBsaWJyYXJ5LlxuICAgICAgICAvLyBpbmNsdWRlIGNvbnZlbmllbmNlIHJlcGxhY2UgZm9yIHNpbmdsZS1xdW90ZXMuIElmIHRoZSBhdXRob3Igb21pdHNcbiAgICAgICAgLy8gcXVvdGVzIGFsdG9nZXRoZXIsIHBhcnNlIHdpbGwgZmFpbC5cbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UodmFsdWUucmVwbGFjZSgvJy9nLCAnXCInKSk7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgLy8gVGhlIG9iamVjdCBpc24ndCB2YWxpZCBKU09OLCByZXR1cm4gdGhlIHJhdyB2YWx1ZVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9XG4gICAgfSxcbiAgICAvLyBhdm9pZCBkZXNlcmlhbGl6YXRpb24gb2YgZnVuY3Rpb25zXG4gICAgJ2Z1bmN0aW9uJzogZnVuY3Rpb24odmFsdWUsIGN1cnJlbnRWYWx1ZSkge1xuICAgICAgcmV0dXJuIGN1cnJlbnRWYWx1ZTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gZGVzZXJpYWxpemVWYWx1ZSh2YWx1ZSwgY3VycmVudFZhbHVlKSB7XG4gICAgLy8gYXR0ZW1wdCB0byBpbmZlciB0eXBlIGZyb20gZGVmYXVsdCB2YWx1ZVxuICAgIHZhciBpbmZlcnJlZFR5cGUgPSB0eXBlb2YgY3VycmVudFZhbHVlO1xuICAgIC8vIGludmVudCAnZGF0ZScgdHlwZSB2YWx1ZSBmb3IgRGF0ZVxuICAgIGlmIChjdXJyZW50VmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICBpbmZlcnJlZFR5cGUgPSAnZGF0ZSc7XG4gICAgfVxuICAgIC8vIGRlbGVnYXRlIGRlc2VyaWFsaXphdGlvbiB2aWEgdHlwZSBzdHJpbmdcbiAgICByZXR1cm4gdHlwZUhhbmRsZXJzW2luZmVycmVkVHlwZV0odmFsdWUsIGN1cnJlbnRWYWx1ZSk7XG4gIH1cblxuICAvLyBleHBvcnRzXG5cbiAgc2NvcGUuZGVzZXJpYWxpemVWYWx1ZSA9IGRlc2VyaWFsaXplVmFsdWU7XG5cbn0pKFBvbHltZXIpO1xuXG4oZnVuY3Rpb24oc2NvcGUpIHtcblxuICAvLyBpbXBvcnRzXG5cbiAgdmFyIGV4dGVuZCA9IHNjb3BlLmV4dGVuZDtcblxuICAvLyBtb2R1bGVcblxuICB2YXIgYXBpID0ge307XG5cbiAgYXBpLmRlY2xhcmF0aW9uID0ge307XG4gIGFwaS5pbnN0YW5jZSA9IHt9O1xuXG4gIGFwaS5wdWJsaXNoID0gZnVuY3Rpb24oYXBpcywgcHJvdG90eXBlKSB7XG4gICAgZm9yICh2YXIgbiBpbiBhcGlzKSB7XG4gICAgICBleHRlbmQocHJvdG90eXBlLCBhcGlzW25dKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gZXhwb3J0c1xuXG4gIHNjb3BlLmFwaSA9IGFwaTtcblxufSkoUG9seW1lcik7XG5cbihmdW5jdGlvbihzY29wZSkge1xuXG4gIC8qKlxuICAgKiBAY2xhc3MgcG9seW1lci1iYXNlXG4gICAqL1xuXG4gIHZhciB1dGlscyA9IHtcblxuICAgIC8qKlxuICAgICAgKiBJbnZva2VzIGEgZnVuY3Rpb24gYXN5bmNocm9ub3VzbHkuIFRoZSBjb250ZXh0IG9mIHRoZSBjYWxsYmFja1xuICAgICAgKiBmdW5jdGlvbiBpcyBib3VuZCB0byAndGhpcycgYXV0b21hdGljYWxseS4gUmV0dXJucyBhIGhhbmRsZSB3aGljaCBtYXlcbiAgICAgICogYmUgcGFzc2VkIHRvIDxhIGhyZWY9XCIjY2FuY2VsQXN5bmNcIj5jYW5jZWxBc3luYzwvYT4gdG8gY2FuY2VsIHRoZVxuICAgICAgKiBhc3luY2hyb25vdXMgY2FsbC5cbiAgICAgICpcbiAgICAgICogQG1ldGhvZCBhc3luY1xuICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufFN0cmluZ30gbWV0aG9kXG4gICAgICAqIEBwYXJhbSB7YW55fEFycmF5fSBhcmdzXG4gICAgICAqIEBwYXJhbSB7bnVtYmVyfSB0aW1lb3V0XG4gICAgICAqL1xuICAgIGFzeW5jOiBmdW5jdGlvbihtZXRob2QsIGFyZ3MsIHRpbWVvdXQpIHtcbiAgICAgIC8vIHdoZW4gcG9seWZpbGxpbmcgT2JqZWN0Lm9ic2VydmUsIGVuc3VyZSBjaGFuZ2VzXG4gICAgICAvLyBwcm9wYWdhdGUgYmVmb3JlIGV4ZWN1dGluZyB0aGUgYXN5bmMgbWV0aG9kXG4gICAgICBQb2x5bWVyLmZsdXNoKCk7XG4gICAgICAvLyBzZWNvbmQgYXJndW1lbnQgdG8gYGFwcGx5YCBtdXN0IGJlIGFuIGFycmF5XG4gICAgICBhcmdzID0gKGFyZ3MgJiYgYXJncy5sZW5ndGgpID8gYXJncyA6IFthcmdzXTtcbiAgICAgIC8vIGZ1bmN0aW9uIHRvIGludm9rZVxuICAgICAgdmFyIGZuID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICh0aGlzW21ldGhvZF0gfHwgbWV0aG9kKS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgIH0uYmluZCh0aGlzKTtcbiAgICAgIC8vIGV4ZWN1dGUgYGZuYCBzb29uZXIgb3IgbGF0ZXJcbiAgICAgIHZhciBoYW5kbGUgPSB0aW1lb3V0ID8gc2V0VGltZW91dChmbiwgdGltZW91dCkgOlxuICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmbik7XG4gICAgICAvLyBOT1RFOiBzd2l0Y2ggb24gaW52ZXJ0aW5nIGhhbmRsZSB0byBkZXRlcm1pbmUgd2hpY2ggdGltZSBpcyB1c2VkLlxuICAgICAgcmV0dXJuIHRpbWVvdXQgPyBoYW5kbGUgOiB+aGFuZGxlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgICogQ2FuY2VscyBhIHBlbmRpbmcgY2FsbGJhY2sgdGhhdCB3YXMgc2NoZWR1bGVkIHZpYVxuICAgICAgKiA8YSBocmVmPVwiI2FzeW5jXCI+YXN5bmM8L2E+LlxuICAgICAgKlxuICAgICAgKiBAbWV0aG9kIGNhbmNlbEFzeW5jXG4gICAgICAqIEBwYXJhbSB7aGFuZGxlfSBoYW5kbGUgSGFuZGxlIG9mIHRoZSBgYXN5bmNgIHRvIGNhbmNlbC5cbiAgICAgICovXG4gICAgY2FuY2VsQXN5bmM6IGZ1bmN0aW9uKGhhbmRsZSkge1xuICAgICAgaWYgKGhhbmRsZSA8IDApIHtcbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUofmhhbmRsZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjbGVhclRpbWVvdXQoaGFuZGxlKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICAqIEZpcmUgYW4gZXZlbnQuXG4gICAgICAqXG4gICAgICAqIEBtZXRob2QgZmlyZVxuICAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBldmVudFxuICAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBBbiBldmVudCBuYW1lLlxuICAgICAgKiBAcGFyYW0ge2FueX0gZGV0YWlsXG4gICAgICAqIEBwYXJhbSB7Tm9kZX0gb25Ob2RlIFRhcmdldCBub2RlLlxuICAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGJ1YmJsZXMgU2V0IGZhbHNlIHRvIHByZXZlbnQgYnViYmxpbmcsIGRlZmF1bHRzIHRvIHRydWVcbiAgICAgICogQHBhcmFtIHtCb29sZWFufSBjYW5jZWxhYmxlIFNldCBmYWxzZSB0byBwcmV2ZW50IGNhbmNlbGxhdGlvbiwgZGVmYXVsdHMgdG8gdHJ1ZVxuICAgICAgKi9cbiAgICBmaXJlOiBmdW5jdGlvbih0eXBlLCBkZXRhaWwsIG9uTm9kZSwgYnViYmxlcywgY2FuY2VsYWJsZSkge1xuICAgICAgdmFyIG5vZGUgPSBvbk5vZGUgfHwgdGhpcztcbiAgICAgIHZhciBkZXRhaWwgPSBkZXRhaWwgPT09IG51bGwgfHwgZGV0YWlsID09PSB1bmRlZmluZWQgPyB7fSA6IGRldGFpbDtcbiAgICAgIHZhciBldmVudCA9IG5ldyBDdXN0b21FdmVudCh0eXBlLCB7XG4gICAgICAgIGJ1YmJsZXM6IGJ1YmJsZXMgIT09IHVuZGVmaW5lZCA/IGJ1YmJsZXMgOiB0cnVlLFxuICAgICAgICBjYW5jZWxhYmxlOiBjYW5jZWxhYmxlICE9PSB1bmRlZmluZWQgPyBjYW5jZWxhYmxlIDogdHJ1ZSxcbiAgICAgICAgZGV0YWlsOiBkZXRhaWxcbiAgICAgIH0pO1xuICAgICAgbm9kZS5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICAqIEZpcmUgYW4gZXZlbnQgYXN5bmNocm9ub3VzbHkuXG4gICAgICAqXG4gICAgICAqIEBtZXRob2QgYXN5bmNGaXJlXG4gICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIEFuIGV2ZW50IG5hbWUuXG4gICAgICAqIEBwYXJhbSBkZXRhaWxcbiAgICAgICogQHBhcmFtIHtOb2RlfSB0b05vZGUgVGFyZ2V0IG5vZGUuXG4gICAgICAqL1xuICAgIGFzeW5jRmlyZTogZnVuY3Rpb24oLyppblR5cGUsIGluRGV0YWlsKi8pIHtcbiAgICAgIHRoaXMuYXN5bmMoXCJmaXJlXCIsIGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAgKiBSZW1vdmUgY2xhc3MgZnJvbSBvbGQsIGFkZCBjbGFzcyB0byBhbmV3LCBpZiB0aGV5IGV4aXN0LlxuICAgICAgKlxuICAgICAgKiBAcGFyYW0gY2xhc3NGb2xsb3dzXG4gICAgICAqIEBwYXJhbSBhbmV3IEEgbm9kZS5cbiAgICAgICogQHBhcmFtIG9sZCBBIG5vZGVcbiAgICAgICogQHBhcmFtIGNsYXNzTmFtZVxuICAgICAgKi9cbiAgICBjbGFzc0ZvbGxvd3M6IGZ1bmN0aW9uKGFuZXcsIG9sZCwgY2xhc3NOYW1lKSB7XG4gICAgICBpZiAob2xkKSB7XG4gICAgICAgIG9sZC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XG4gICAgICB9XG4gICAgICBpZiAoYW5ldykge1xuICAgICAgICBhbmV3LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICAqIEluamVjdCBIVE1MIHdoaWNoIGNvbnRhaW5zIG1hcmt1cCBib3VuZCB0byB0aGlzIGVsZW1lbnQgaW50b1xuICAgICAgKiBhIHRhcmdldCBlbGVtZW50IChyZXBsYWNpbmcgdGFyZ2V0IGVsZW1lbnQgY29udGVudCkuXG4gICAgICAqXG4gICAgICAqIEBwYXJhbSBTdHJpbmcgaHRtbCB0byBpbmplY3RcbiAgICAgICogQHBhcmFtIEVsZW1lbnQgdGFyZ2V0IGVsZW1lbnRcbiAgICAgICovXG4gICAgaW5qZWN0Qm91bmRIVE1MOiBmdW5jdGlvbihodG1sLCBlbGVtZW50KSB7XG4gICAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpO1xuICAgICAgdGVtcGxhdGUuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgIHZhciBmcmFnbWVudCA9IHRoaXMuaW5zdGFuY2VUZW1wbGF0ZSh0ZW1wbGF0ZSk7XG4gICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gJyc7XG4gICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoZnJhZ21lbnQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZyYWdtZW50O1xuICAgIH1cbiAgfTtcblxuICAvLyBuby1vcGVyYXRpb24gZnVuY3Rpb24gZm9yIGhhbmR5IHN0dWJzXG4gIHZhciBub3AgPSBmdW5jdGlvbigpIHt9O1xuXG4gIC8vIG51bGwtb2JqZWN0IGZvciBoYW5keSBzdHVic1xuICB2YXIgbm9iID0ge307XG5cbiAgLy8gZGVwcmVjYXRlZFxuXG4gIHV0aWxzLmFzeW5jTWV0aG9kID0gdXRpbHMuYXN5bmM7XG5cbiAgLy8gZXhwb3J0c1xuXG4gIHNjb3BlLmFwaS5pbnN0YW5jZS51dGlscyA9IHV0aWxzO1xuICBzY29wZS5ub3AgPSBub3A7XG4gIHNjb3BlLm5vYiA9IG5vYjtcblxufSkoUG9seW1lcik7XG5cbihmdW5jdGlvbihzY29wZSkge1xuXG4gIC8vIGltcG9ydHNcblxuICB2YXIgbG9nID0gd2luZG93LldlYkNvbXBvbmVudHMgPyBXZWJDb21wb25lbnRzLmZsYWdzLmxvZyA6IHt9O1xuICB2YXIgRVZFTlRfUFJFRklYID0gJ29uLSc7XG5cbiAgLy8gaW5zdGFuY2UgZXZlbnRzIGFwaVxuICB2YXIgZXZlbnRzID0ge1xuICAgIC8vIHJlYWQtb25seVxuICAgIEVWRU5UX1BSRUZJWDogRVZFTlRfUFJFRklYLFxuICAgIC8vIGV2ZW50IGxpc3RlbmVycyBvbiBob3N0XG4gICAgYWRkSG9zdExpc3RlbmVyczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZXZlbnRzID0gdGhpcy5ldmVudERlbGVnYXRlcztcbiAgICAgIGxvZy5ldmVudHMgJiYgKE9iamVjdC5rZXlzKGV2ZW50cykubGVuZ3RoID4gMCkgJiYgY29uc29sZS5sb2coJ1slc10gYWRkSG9zdExpc3RlbmVyczonLCB0aGlzLmxvY2FsTmFtZSwgZXZlbnRzKTtcbiAgICAgIC8vIE5PVEU6IGhvc3QgZXZlbnRzIGxvb2sgbGlrZSBiaW5kaW5ncyBidXQgcmVhbGx5IGFyZSBub3Q7XG4gICAgICAvLyAoMSkgd2UgZG9uJ3Qgd2FudCB0aGUgYXR0cmlidXRlIHRvIGJlIHNldCBhbmQgKDIpIHdlIHdhbnQgdG8gc3VwcG9ydFxuICAgICAgLy8gbXVsdGlwbGUgZXZlbnQgbGlzdGVuZXJzICgnaG9zdCcgYW5kICdpbnN0YW5jZScpIGFuZCBOb2RlLmJpbmRcbiAgICAgIC8vIGJ5IGRlZmF1bHQgc3VwcG9ydHMgMSB0aGluZyBiZWluZyBib3VuZC5cbiAgICAgIGZvciAodmFyIHR5cGUgaW4gZXZlbnRzKSB7XG4gICAgICAgIHZhciBtZXRob2ROYW1lID0gZXZlbnRzW3R5cGVdO1xuICAgICAgICBQb2x5bWVyR2VzdHVyZXMuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLCB0eXBlLCB0aGlzLmVsZW1lbnQuZ2V0RXZlbnRIYW5kbGVyKHRoaXMsIHRoaXMsIG1ldGhvZE5hbWUpKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIC8vIGNhbGwgJ21ldGhvZCcgb3IgZnVuY3Rpb24gbWV0aG9kIG9uICdvYmonIHdpdGggJ2FyZ3MnLCBpZiB0aGUgbWV0aG9kIGV4aXN0c1xuICAgIGRpc3BhdGNoTWV0aG9kOiBmdW5jdGlvbihvYmosIG1ldGhvZCwgYXJncykge1xuICAgICAgaWYgKG9iaikge1xuICAgICAgICBsb2cuZXZlbnRzICYmIGNvbnNvbGUuZ3JvdXAoJ1slc10gZGlzcGF0Y2ggWyVzXScsIG9iai5sb2NhbE5hbWUsIG1ldGhvZCk7XG4gICAgICAgIHZhciBmbiA9IHR5cGVvZiBtZXRob2QgPT09ICdmdW5jdGlvbicgPyBtZXRob2QgOiBvYmpbbWV0aG9kXTtcbiAgICAgICAgaWYgKGZuKSB7XG4gICAgICAgICAgZm5bYXJncyA/ICdhcHBseScgOiAnY2FsbCddKG9iaiwgYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgbG9nLmV2ZW50cyAmJiBjb25zb2xlLmdyb3VwRW5kKCk7XG4gICAgICAgIC8vIE5PVEU6IGRpcnR5IGNoZWNrIHJpZ2h0IGFmdGVyIGNhbGxpbmcgbWV0aG9kIHRvIGVuc3VyZVxuICAgICAgICAvLyBjaGFuZ2VzIGFwcGx5IHF1aWNrbHk7IGluIGEgdmVyeSBjb21wbGljYXRlZCBhcHAgdXNpbmcgaGlnaFxuICAgICAgICAvLyBmcmVxdWVuY3kgZXZlbnRzLCB0aGlzIGNhbiBiZSBhIHBlcmYgY29uY2VybjsgaW4gdGhpcyBjYXNlLFxuICAgICAgICAvLyBpbXBlcmF0aXZlIGhhbmRsZXJzIGNhbiBiZSB1c2VkIHRvIGF2b2lkIGZsdXNoaW5nLlxuICAgICAgICBQb2x5bWVyLmZsdXNoKCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8vIGV4cG9ydHNcblxuICBzY29wZS5hcGkuaW5zdGFuY2UuZXZlbnRzID0gZXZlbnRzO1xuXG4gIC8qKlxuICAgKiBAY2xhc3MgUG9seW1lclxuICAgKi9cblxuICAvKipcbiAgICogQWRkIGEgZ2VzdHVyZSBhd2FyZSBldmVudCBoYW5kbGVyIHRvIHRoZSBnaXZlbiBgbm9kZWAuIENhbiBiZSB1c2VkXG4gICAqIGluIHBsYWNlIG9mIGBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXJgIGFuZCBlbnN1cmVzIGdlc3R1cmVzIHdpbGwgZnVuY3Rpb25cbiAgICogYXMgZXhwZWN0ZWQgb24gbW9iaWxlIHBsYXRmb3Jtcy4gUGxlYXNlIG5vdGUgdGhhdCBQb2x5bWVyJ3MgZGVjbGFyYXRpdmVcbiAgICogZXZlbnQgaGFuZGxlcnMgaW5jbHVkZSB0aGlzIGZ1bmN0aW9uYWxpdHkgYnkgZGVmYXVsdC5cbiAgICpcbiAgICogQG1ldGhvZCBhZGRFdmVudExpc3RlbmVyXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZSBub2RlIG9uIHdoaWNoIHRvIGxpc3RlblxuICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRUeXBlIG5hbWUgb2YgdGhlIGV2ZW50XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXJGbiBldmVudCBoYW5kbGVyIGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZSBzZXQgdG8gdHJ1ZSB0byBpbnZva2UgZXZlbnQgY2FwdHVyaW5nXG4gICAqIEB0eXBlIEZ1bmN0aW9uXG4gICAqL1xuICAvLyBhbGlhcyBQb2x5bWVyR2VzdHVyZXMgZXZlbnQgbGlzdGVuZXIgbG9naWNcbiAgc2NvcGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKG5vZGUsIGV2ZW50VHlwZSwgaGFuZGxlckZuLCBjYXB0dXJlKSB7XG4gICAgUG9seW1lckdlc3R1cmVzLmFkZEV2ZW50TGlzdGVuZXIod3JhcChub2RlKSwgZXZlbnRUeXBlLCBoYW5kbGVyRm4sIGNhcHR1cmUpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBnZXN0dXJlIGF3YXJlIGV2ZW50IGhhbmRsZXIgb24gdGhlIGdpdmVuIGBub2RlYC4gVG8gcmVtb3ZlIGFuXG4gICAqIGV2ZW50IGxpc3RlbmVyLCB0aGUgZXhhY3Qgc2FtZSBhcmd1bWVudHMgYXJlIHJlcXVpcmVkIHRoYXQgd2VyZSBwYXNzZWRcbiAgICogdG8gYFBvbHltZXIuYWRkRXZlbnRMaXN0ZW5lcmAuXG4gICAqXG4gICAqIEBtZXRob2QgcmVtb3ZlRXZlbnRMaXN0ZW5lclxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGUgbm9kZSBvbiB3aGljaCB0byBsaXN0ZW5cbiAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50VHlwZSBuYW1lIG9mIHRoZSBldmVudFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYW5kbGVyRm4gZXZlbnQgaGFuZGxlciBmdW5jdGlvblxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGNhcHR1cmUgc2V0IHRvIHRydWUgdG8gaW52b2tlIGV2ZW50IGNhcHR1cmluZ1xuICAgKiBAdHlwZSBGdW5jdGlvblxuICAgKi9cbiAgc2NvcGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKG5vZGUsIGV2ZW50VHlwZSwgaGFuZGxlckZuLCBjYXB0dXJlKSB7XG4gICAgUG9seW1lckdlc3R1cmVzLnJlbW92ZUV2ZW50TGlzdGVuZXIod3JhcChub2RlKSwgZXZlbnRUeXBlLCBoYW5kbGVyRm4sIGNhcHR1cmUpO1xuICB9O1xuXG59KShQb2x5bWVyKTtcblxuKGZ1bmN0aW9uKHNjb3BlKSB7XHJcblxyXG4gIC8vIGluc3RhbmNlIGFwaSBmb3IgYXR0cmlidXRlc1xyXG5cclxuICB2YXIgYXR0cmlidXRlcyA9IHtcclxuICAgIC8vIGNvcHkgYXR0cmlidXRlcyBkZWZpbmVkIGluIHRoZSBlbGVtZW50IGRlY2xhcmF0aW9uIHRvIHRoZSBpbnN0YW5jZVxyXG4gICAgLy8gZS5nLiA8cG9seW1lci1lbGVtZW50IG5hbWU9XCJ4LWZvb1wiIHRhYkluZGV4PVwiMFwiPiB0YWJJbmRleCBpcyBjb3BpZWRcclxuICAgIC8vIHRvIHRoZSBlbGVtZW50IGluc3RhbmNlIGhlcmUuXHJcbiAgICBjb3B5SW5zdGFuY2VBdHRyaWJ1dGVzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciBhJCA9IHRoaXMuX2luc3RhbmNlQXR0cmlidXRlcztcclxuICAgICAgZm9yICh2YXIgayBpbiBhJCkge1xyXG4gICAgICAgIGlmICghdGhpcy5oYXNBdHRyaWJ1dGUoaykpIHtcclxuICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKGssIGEkW2tdKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyBmb3IgZWFjaCBhdHRyaWJ1dGUgb24gdGhpcywgZGVzZXJpYWxpemUgdmFsdWUgdG8gcHJvcGVydHkgYXMgbmVlZGVkXHJcbiAgICB0YWtlQXR0cmlidXRlczogZnVuY3Rpb24oKSB7XHJcbiAgICAgIC8vIGlmIHdlIGhhdmUgbm8gcHVibGlzaCBsb29rdXAgdGFibGUsIHdlIGhhdmUgbm8gYXR0cmlidXRlcyB0byB0YWtlXHJcbiAgICAgIC8vIFRPRE8oc2ptaWxlcyk6IGFkIGhvY1xyXG4gICAgICBpZiAodGhpcy5fcHVibGlzaExDKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaT0wLCBhJD10aGlzLmF0dHJpYnV0ZXMsIGw9YSQubGVuZ3RoLCBhOyAoYT1hJFtpXSkgJiYgaTxsOyBpKyspIHtcclxuICAgICAgICAgIHRoaXMuYXR0cmlidXRlVG9Qcm9wZXJ0eShhLm5hbWUsIGEudmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIGlmIGF0dHJpYnV0ZSAnbmFtZScgaXMgbWFwcGVkIHRvIGEgcHJvcGVydHksIGRlc2VyaWFsaXplXHJcbiAgICAvLyAndmFsdWUnIGludG8gdGhhdCBwcm9wZXJ0eVxyXG4gICAgYXR0cmlidXRlVG9Qcm9wZXJ0eTogZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcclxuICAgICAgLy8gdHJ5IHRvIG1hdGNoIHRoaXMgYXR0cmlidXRlIHRvIGEgcHJvcGVydHkgKGF0dHJpYnV0ZXMgYXJlXHJcbiAgICAgIC8vIGFsbCBsb3dlci1jYXNlLCBzbyB0aGlzIGlzIGNhc2UtaW5zZW5zaXRpdmUgc2VhcmNoKVxyXG4gICAgICB2YXIgbmFtZSA9IHRoaXMucHJvcGVydHlGb3JBdHRyaWJ1dGUobmFtZSk7XHJcbiAgICAgIGlmIChuYW1lKSB7XHJcbiAgICAgICAgLy8gZmlsdGVyIG91dCAnbXVzdGFjaGVkJyB2YWx1ZXMsIHRoZXNlIGFyZSB0byBiZVxyXG4gICAgICAgIC8vIHJlcGxhY2VkIHdpdGggYm91bmQtZGF0YSBhbmQgYXJlIG5vdCB5ZXQgdmFsdWVzXHJcbiAgICAgICAgLy8gdGhlbXNlbHZlc1xyXG4gICAgICAgIGlmICh2YWx1ZSAmJiB2YWx1ZS5zZWFyY2goc2NvcGUuYmluZFBhdHRlcm4pID49IDApIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZ2V0IG9yaWdpbmFsIHZhbHVlXHJcbiAgICAgICAgdmFyIGN1cnJlbnRWYWx1ZSA9IHRoaXNbbmFtZV07XHJcbiAgICAgICAgLy8gZGVzZXJpYWxpemUgQm9vbGVhbiBvciBOdW1iZXIgdmFsdWVzIGZyb20gYXR0cmlidXRlXHJcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5kZXNlcmlhbGl6ZVZhbHVlKHZhbHVlLCBjdXJyZW50VmFsdWUpO1xyXG4gICAgICAgIC8vIG9ubHkgYWN0IGlmIHRoZSB2YWx1ZSBoYXMgY2hhbmdlZFxyXG4gICAgICAgIGlmICh2YWx1ZSAhPT0gY3VycmVudFZhbHVlKSB7XHJcbiAgICAgICAgICAvLyBpbnN0YWxsIG5ldyB2YWx1ZSAoaGFzIHNpZGUtZWZmZWN0cylcclxuICAgICAgICAgIHRoaXNbbmFtZV0gPSB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyByZXR1cm4gdGhlIHB1Ymxpc2hlZCBwcm9wZXJ0eSBtYXRjaGluZyBuYW1lLCBvciB1bmRlZmluZWRcclxuICAgIHByb3BlcnR5Rm9yQXR0cmlidXRlOiBmdW5jdGlvbihuYW1lKSB7XHJcbiAgICAgIHZhciBtYXRjaCA9IHRoaXMuX3B1Ymxpc2hMQyAmJiB0aGlzLl9wdWJsaXNoTENbbmFtZV07XHJcbiAgICAgIHJldHVybiBtYXRjaDtcclxuICAgIH0sXHJcbiAgICAvLyBjb252ZXJ0IHJlcHJlc2VudGF0aW9uIG9mIGBzdHJpbmdWYWx1ZWAgYmFzZWQgb24gdHlwZSBvZiBgY3VycmVudFZhbHVlYFxyXG4gICAgZGVzZXJpYWxpemVWYWx1ZTogZnVuY3Rpb24oc3RyaW5nVmFsdWUsIGN1cnJlbnRWYWx1ZSkge1xyXG4gICAgICByZXR1cm4gc2NvcGUuZGVzZXJpYWxpemVWYWx1ZShzdHJpbmdWYWx1ZSwgY3VycmVudFZhbHVlKTtcclxuICAgIH0sXHJcbiAgICAvLyBjb252ZXJ0IHRvIGEgc3RyaW5nIHZhbHVlIGJhc2VkIG9uIHRoZSB0eXBlIG9mIGBpbmZlcnJlZFR5cGVgXHJcbiAgICBzZXJpYWxpemVWYWx1ZTogZnVuY3Rpb24odmFsdWUsIGluZmVycmVkVHlwZSkge1xyXG4gICAgICBpZiAoaW5mZXJyZWRUeXBlID09PSAnYm9vbGVhbicpIHtcclxuICAgICAgICByZXR1cm4gdmFsdWUgPyAnJyA6IHVuZGVmaW5lZDtcclxuICAgICAgfSBlbHNlIGlmIChpbmZlcnJlZFR5cGUgIT09ICdvYmplY3QnICYmIGluZmVycmVkVHlwZSAhPT0gJ2Z1bmN0aW9uJ1xyXG4gICAgICAgICAgJiYgdmFsdWUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIHNlcmlhbGl6ZXMgYG5hbWVgIHByb3BlcnR5IHZhbHVlIGFuZCB1cGRhdGVzIHRoZSBjb3JyZXNwb25kaW5nIGF0dHJpYnV0ZVxyXG4gICAgLy8gbm90ZSB0aGF0IHJlZmxlY3Rpb24gaXMgb3B0LWluLlxyXG4gICAgcmVmbGVjdFByb3BlcnR5VG9BdHRyaWJ1dGU6IGZ1bmN0aW9uKG5hbWUpIHtcclxuICAgICAgdmFyIGluZmVycmVkVHlwZSA9IHR5cGVvZiB0aGlzW25hbWVdO1xyXG4gICAgICAvLyB0cnkgdG8gaW50ZWxsaWdlbnRseSBzZXJpYWxpemUgcHJvcGVydHkgdmFsdWVcclxuICAgICAgdmFyIHNlcmlhbGl6ZWRWYWx1ZSA9IHRoaXMuc2VyaWFsaXplVmFsdWUodGhpc1tuYW1lXSwgaW5mZXJyZWRUeXBlKTtcclxuICAgICAgLy8gYm9vbGVhbiBwcm9wZXJ0aWVzIG11c3QgcmVmbGVjdCBhcyBib29sZWFuIGF0dHJpYnV0ZXNcclxuICAgICAgaWYgKHNlcmlhbGl6ZWRWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUobmFtZSwgc2VyaWFsaXplZFZhbHVlKTtcclxuICAgICAgICAvLyBUT0RPKHNvcnZlbGwpOiB3ZSBzaG91bGQgcmVtb3ZlIGF0dHIgZm9yIGFsbCBwcm9wZXJ0aWVzXHJcbiAgICAgICAgLy8gdGhhdCBoYXZlIHVuZGVmaW5lZCBzZXJpYWxpemF0aW9uOyBob3dldmVyLCB3ZSB3aWxsIG5lZWQgdG9cclxuICAgICAgICAvLyByZWZpbmUgdGhlIGF0dHIgcmVmbGVjdGlvbiBzeXN0ZW0gdG8gYWNoaWV2ZSB0aGlzOyBwaWNhLCBmb3IgZXhhbXBsZSxcclxuICAgICAgICAvLyByZWxpZXMgb24gaGF2aW5nIGluZmVycmVkVHlwZSBvYmplY3QgcHJvcGVydGllcyBub3QgcmVtb3ZlZCBhc1xyXG4gICAgICAgIC8vIGF0dHJzLlxyXG4gICAgICB9IGVsc2UgaWYgKGluZmVycmVkVHlwZSA9PT0gJ2Jvb2xlYW4nKSB7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvLyBleHBvcnRzXHJcblxyXG4gIHNjb3BlLmFwaS5pbnN0YW5jZS5hdHRyaWJ1dGVzID0gYXR0cmlidXRlcztcclxuXHJcbn0pKFBvbHltZXIpO1xyXG5cbihmdW5jdGlvbihzY29wZSkge1xuXG4gIC8qKlxuICAgKiBAY2xhc3MgcG9seW1lci1iYXNlXG4gICAqL1xuXG4gIC8vIGltcG9ydHNcblxuICB2YXIgbG9nID0gd2luZG93LldlYkNvbXBvbmVudHMgPyBXZWJDb21wb25lbnRzLmZsYWdzLmxvZyA6IHt9O1xuXG4gIC8vIG1hZ2ljIHdvcmRzXG5cbiAgdmFyIE9CU0VSVkVfU1VGRklYID0gJ0NoYW5nZWQnO1xuXG4gIC8vIGVsZW1lbnQgYXBpXG5cbiAgdmFyIGVtcHR5ID0gW107XG5cbiAgdmFyIHVwZGF0ZVJlY29yZCA9IHtcbiAgICBvYmplY3Q6IHVuZGVmaW5lZCxcbiAgICB0eXBlOiAndXBkYXRlJyxcbiAgICBuYW1lOiB1bmRlZmluZWQsXG4gICAgb2xkVmFsdWU6IHVuZGVmaW5lZFxuICB9O1xuXG4gIHZhciBudW1iZXJJc05hTiA9IE51bWJlci5pc05hTiB8fCBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIGlzTmFOKHZhbHVlKTtcbiAgfTtcblxuICBmdW5jdGlvbiBhcmVTYW1lVmFsdWUobGVmdCwgcmlnaHQpIHtcbiAgICBpZiAobGVmdCA9PT0gcmlnaHQpXG4gICAgICByZXR1cm4gbGVmdCAhPT0gMCB8fCAxIC8gbGVmdCA9PT0gMSAvIHJpZ2h0O1xuICAgIGlmIChudW1iZXJJc05hTihsZWZ0KSAmJiBudW1iZXJJc05hTihyaWdodCkpXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gbGVmdCAhPT0gbGVmdCAmJiByaWdodCAhPT0gcmlnaHQ7XG4gIH1cblxuICAvLyBjYXB0dXJlIEEncyB2YWx1ZSBpZiBCJ3MgdmFsdWUgaXMgbnVsbCBvciB1bmRlZmluZWQsXG4gIC8vIG90aGVyd2lzZSB1c2UgQidzIHZhbHVlXG4gIGZ1bmN0aW9uIHJlc29sdmVCaW5kaW5nVmFsdWUob2xkVmFsdWUsIHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgJiYgb2xkVmFsdWUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSA/IG9sZFZhbHVlIDogdmFsdWU7XG4gIH1cblxuICB2YXIgcHJvcGVydGllcyA9IHtcblxuICAgIC8vIGNyZWF0ZXMgYSBDb21wb3VuZE9ic2VydmVyIHRvIG9ic2VydmUgcHJvcGVydHkgY2hhbmdlc1xuICAgIC8vIE5PVEUsIHRoaXMgaXMgb25seSBkb25lIHRoZXJlIGFyZSBhbnkgcHJvcGVydGllcyBpbiB0aGUgYG9ic2VydmVgIG9iamVjdFxuICAgIGNyZWF0ZVByb3BlcnR5T2JzZXJ2ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG4kID0gdGhpcy5fb2JzZXJ2ZU5hbWVzO1xuICAgICAgaWYgKG4kICYmIG4kLmxlbmd0aCkge1xuICAgICAgICB2YXIgbyA9IHRoaXMuX3Byb3BlcnR5T2JzZXJ2ZXIgPSBuZXcgQ29tcG91bmRPYnNlcnZlcih0cnVlKTtcbiAgICAgICAgdGhpcy5yZWdpc3Rlck9ic2VydmVyKG8pO1xuICAgICAgICAvLyBUT0RPKHNvcnZlbGwpOiBtYXkgbm90IGJlIGtvc2hlciB0byBhY2Nlc3MgdGhlIHZhbHVlIGhlcmUgKHRoaXNbbl0pO1xuICAgICAgICAvLyBwcmV2aW91c2x5IHdlIGxvb2tlZCBhdCB0aGUgZGVzY3JpcHRvciBvbiB0aGUgcHJvdG90eXBlXG4gICAgICAgIC8vIHRoaXMgZG9lc24ndCB3b3JrIGZvciBpbmhlcml0YW5jZSBhbmQgbm90IGZvciBhY2Nlc3NvcnMgd2l0aG91dFxuICAgICAgICAvLyBhIHZhbHVlIHByb3BlcnR5XG4gICAgICAgIGZvciAodmFyIGk9MCwgbD1uJC5sZW5ndGgsIG47IChpPGwpICYmIChuPW4kW2ldKTsgaSsrKSB7XG4gICAgICAgICAgby5hZGRQYXRoKHRoaXMsIG4pO1xuICAgICAgICAgIHRoaXMub2JzZXJ2ZUFycmF5VmFsdWUobiwgdGhpc1tuXSwgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gc3RhcnQgb2JzZXJ2aW5nIHByb3BlcnR5IGNoYW5nZXNcbiAgICBvcGVuUHJvcGVydHlPYnNlcnZlcjogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5fcHJvcGVydHlPYnNlcnZlcikge1xuICAgICAgICB0aGlzLl9wcm9wZXJ0eU9ic2VydmVyLm9wZW4odGhpcy5ub3RpZnlQcm9wZXJ0eUNoYW5nZXMsIHRoaXMpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBoYW5kbGVyIGZvciBwcm9wZXJ0eSBjaGFuZ2VzOyByb3V0ZXMgY2hhbmdlcyB0byBvYnNlcnZpbmcgbWV0aG9kc1xuICAgIC8vIG5vdGU6IGFycmF5IHZhbHVlZCBwcm9wZXJ0aWVzIGFyZSBvYnNlcnZlZCBmb3IgYXJyYXkgc3BsaWNlc1xuICAgIG5vdGlmeVByb3BlcnR5Q2hhbmdlczogZnVuY3Rpb24obmV3VmFsdWVzLCBvbGRWYWx1ZXMsIHBhdGhzKSB7XG4gICAgICB2YXIgbmFtZSwgbWV0aG9kLCBjYWxsZWQgPSB7fTtcbiAgICAgIGZvciAodmFyIGkgaW4gb2xkVmFsdWVzKSB7XG4gICAgICAgIC8vIG5vdGU6IHBhdGhzIGlzIG9mIGZvcm0gW29iamVjdCwgcGF0aCwgb2JqZWN0LCBwYXRoXVxuICAgICAgICBuYW1lID0gcGF0aHNbMiAqIGkgKyAxXTtcbiAgICAgICAgbWV0aG9kID0gdGhpcy5vYnNlcnZlW25hbWVdO1xuICAgICAgICBpZiAobWV0aG9kKSB7XG4gICAgICAgICAgdmFyIG92ID0gb2xkVmFsdWVzW2ldLCBudiA9IG5ld1ZhbHVlc1tpXTtcbiAgICAgICAgICAvLyBvYnNlcnZlcyB0aGUgdmFsdWUgaWYgaXQgaXMgYW4gYXJyYXlcbiAgICAgICAgICB0aGlzLm9ic2VydmVBcnJheVZhbHVlKG5hbWUsIG52LCBvdik7XG4gICAgICAgICAgaWYgKCFjYWxsZWRbbWV0aG9kXSkge1xuICAgICAgICAgICAgLy8gb25seSBpbnZva2UgY2hhbmdlIG1ldGhvZCBpZiBvbmUgb2Ygb3Ygb3IgbnYgaXMgbm90ICh1bmRlZmluZWQgfCBudWxsKVxuICAgICAgICAgICAgaWYgKChvdiAhPT0gdW5kZWZpbmVkICYmIG92ICE9PSBudWxsKSB8fCAobnYgIT09IHVuZGVmaW5lZCAmJiBudiAhPT0gbnVsbCkpIHtcbiAgICAgICAgICAgICAgY2FsbGVkW21ldGhvZF0gPSB0cnVlO1xuICAgICAgICAgICAgICAvLyBUT0RPKHNvcnZlbGwpOiBjYWxsIG1ldGhvZCB3aXRoIHRoZSBzZXQgb2YgdmFsdWVzIGl0J3MgZXhwZWN0aW5nO1xuICAgICAgICAgICAgICAvLyBlLmcuICdmb28gYmFyJzogJ2ludmFsaWRhdGUnIGV4cGVjdHMgdGhlIG5ldyBhbmQgb2xkIHZhbHVlcyBmb3JcbiAgICAgICAgICAgICAgLy8gZm9vIGFuZCBiYXIuIEN1cnJlbnRseSB3ZSBnaXZlIG9ubHkgb25lIG9mIHRoZXNlIGFuZCB0aGVuXG4gICAgICAgICAgICAgIC8vIGRlbGl2ZXIgYWxsIHRoZSBhcmd1bWVudHMuXG4gICAgICAgICAgICAgIHRoaXMuaW52b2tlTWV0aG9kKG1ldGhvZCwgW292LCBudiwgYXJndW1lbnRzXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIGNhbGwgbWV0aG9kIGlmZiBpdCBleGlzdHMuXG4gICAgaW52b2tlTWV0aG9kOiBmdW5jdGlvbihtZXRob2QsIGFyZ3MpIHtcbiAgICAgIHZhciBmbiA9IHRoaXNbbWV0aG9kXSB8fCBtZXRob2Q7XG4gICAgICBpZiAodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGb3JjZSBhbnkgcGVuZGluZyBwcm9wZXJ0eSBjaGFuZ2VzIHRvIHN5bmNocm9ub3VzbHkgZGVsaXZlciB0b1xuICAgICAqIGhhbmRsZXJzIHNwZWNpZmllZCBpbiB0aGUgYG9ic2VydmVgIG9iamVjdC5cbiAgICAgKiBOb3RlLCBub3JtYWxseSBjaGFuZ2VzIGFyZSBwcm9jZXNzZWQgYXQgbWljcm90YXNrIHRpbWUuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIGRlbGl2ZXJDaGFuZ2VzXG4gICAgICovXG4gICAgZGVsaXZlckNoYW5nZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuX3Byb3BlcnR5T2JzZXJ2ZXIpIHtcbiAgICAgICAgdGhpcy5fcHJvcGVydHlPYnNlcnZlci5kZWxpdmVyKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIG9ic2VydmVBcnJheVZhbHVlOiBmdW5jdGlvbihuYW1lLCB2YWx1ZSwgb2xkKSB7XG4gICAgICAvLyB3ZSBvbmx5IGNhcmUgaWYgdGhlcmUgYXJlIHJlZ2lzdGVyZWQgc2lkZS1lZmZlY3RzXG4gICAgICB2YXIgY2FsbGJhY2tOYW1lID0gdGhpcy5vYnNlcnZlW25hbWVdO1xuICAgICAgaWYgKGNhbGxiYWNrTmFtZSkge1xuICAgICAgICAvLyBpZiB3ZSBhcmUgb2JzZXJ2aW5nIHRoZSBwcmV2aW91cyB2YWx1ZSwgc3RvcFxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShvbGQpKSB7XG4gICAgICAgICAgbG9nLm9ic2VydmUgJiYgY29uc29sZS5sb2coJ1slc10gb2JzZXJ2ZUFycmF5VmFsdWU6IHVucmVnaXN0ZXIgb2JzZXJ2ZXIgWyVzXScsIHRoaXMubG9jYWxOYW1lLCBuYW1lKTtcbiAgICAgICAgICB0aGlzLmNsb3NlTmFtZWRPYnNlcnZlcihuYW1lICsgJ19fYXJyYXknKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBpZiB0aGUgbmV3IHZhbHVlIGlzIGFuIGFycmF5LCBiZWluZyBvYnNlcnZpbmcgaXRcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgbG9nLm9ic2VydmUgJiYgY29uc29sZS5sb2coJ1slc10gb2JzZXJ2ZUFycmF5VmFsdWU6IHJlZ2lzdGVyIG9ic2VydmVyIFslc10nLCB0aGlzLmxvY2FsTmFtZSwgbmFtZSwgdmFsdWUpO1xuICAgICAgICAgIHZhciBvYnNlcnZlciA9IG5ldyBBcnJheU9ic2VydmVyKHZhbHVlKTtcbiAgICAgICAgICBvYnNlcnZlci5vcGVuKGZ1bmN0aW9uKHNwbGljZXMpIHtcbiAgICAgICAgICAgIHRoaXMuaW52b2tlTWV0aG9kKGNhbGxiYWNrTmFtZSwgW3NwbGljZXNdKTtcbiAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICB0aGlzLnJlZ2lzdGVyTmFtZWRPYnNlcnZlcihuYW1lICsgJ19fYXJyYXknLCBvYnNlcnZlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZW1pdFByb3BlcnR5Q2hhbmdlUmVjb3JkOiBmdW5jdGlvbihuYW1lLCB2YWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgIHZhciBvYmplY3QgPSB0aGlzO1xuICAgICAgaWYgKGFyZVNhbWVWYWx1ZSh2YWx1ZSwgb2xkVmFsdWUpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIGludm9rZSBwcm9wZXJ0eSBjaGFuZ2Ugc2lkZSBlZmZlY3RzXG4gICAgICB0aGlzLl9wcm9wZXJ0eUNoYW5nZWQobmFtZSwgdmFsdWUsIG9sZFZhbHVlKTtcbiAgICAgIC8vIGVtaXQgY2hhbmdlIHJlY29yZFxuICAgICAgaWYgKCFPYnNlcnZlci5oYXNPYmplY3RPYnNlcnZlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciBub3RpZmllciA9IHRoaXMuX29iamVjdE5vdGlmaWVyO1xuICAgICAgaWYgKCFub3RpZmllcikge1xuICAgICAgICBub3RpZmllciA9IHRoaXMuX29iamVjdE5vdGlmaWVyID0gT2JqZWN0LmdldE5vdGlmaWVyKHRoaXMpO1xuICAgICAgfVxuICAgICAgdXBkYXRlUmVjb3JkLm9iamVjdCA9IHRoaXM7XG4gICAgICB1cGRhdGVSZWNvcmQubmFtZSA9IG5hbWU7XG4gICAgICB1cGRhdGVSZWNvcmQub2xkVmFsdWUgPSBvbGRWYWx1ZTtcbiAgICAgIG5vdGlmaWVyLm5vdGlmeSh1cGRhdGVSZWNvcmQpO1xuICAgIH0sXG5cbiAgICBfcHJvcGVydHlDaGFuZ2VkOiBmdW5jdGlvbihuYW1lLCB2YWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgIGlmICh0aGlzLnJlZmxlY3RbbmFtZV0pIHtcbiAgICAgICAgdGhpcy5yZWZsZWN0UHJvcGVydHlUb0F0dHJpYnV0ZShuYW1lKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gY3JlYXRlcyBhIHByb3BlcnR5IGJpbmRpbmcgKGNhbGxlZCB2aWEgYmluZCkgdG8gYSBwdWJsaXNoZWQgcHJvcGVydHkuXG4gICAgYmluZFByb3BlcnR5OiBmdW5jdGlvbihwcm9wZXJ0eSwgb2JzZXJ2YWJsZSwgb25lVGltZSkge1xuICAgICAgaWYgKG9uZVRpbWUpIHtcbiAgICAgICAgdGhpc1twcm9wZXJ0eV0gPSBvYnNlcnZhYmxlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgY29tcHV0ZWQgPSB0aGlzLmVsZW1lbnQucHJvdG90eXBlLmNvbXB1dGVkO1xuICAgICAgLy8gQmluZGluZyBhbiBcIm91dC1vbmx5XCIgdmFsdWUgdG8gYSBjb21wdXRlZCBwcm9wZXJ0eS4gTm90ZSB0aGF0XG4gICAgICAvLyBzaW5jZSB0aGlzIG9ic2VydmVyIGlzbid0IG9wZW5lZCwgaXQgZG9lc24ndCBuZWVkIHRvIGJlIGNsb3NlZCBvblxuICAgICAgLy8gY2xlYW51cC5cbiAgICAgIGlmIChjb21wdXRlZCAmJiBjb21wdXRlZFtwcm9wZXJ0eV0pIHtcbiAgICAgICAgdmFyIHByaXZhdGVDb21wdXRlZEJvdW5kVmFsdWUgPSBwcm9wZXJ0eSArICdDb21wdXRlZEJvdW5kT2JzZXJ2YWJsZV8nO1xuICAgICAgICB0aGlzW3ByaXZhdGVDb21wdXRlZEJvdW5kVmFsdWVdID0gb2JzZXJ2YWJsZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuYmluZFRvQWNjZXNzb3IocHJvcGVydHksIG9ic2VydmFibGUsIHJlc29sdmVCaW5kaW5nVmFsdWUpO1xuICAgIH0sXG5cbiAgICAvLyBOT1RFIHByb3BlcnR5IGBuYW1lYCBtdXN0IGJlIHB1Ymxpc2hlZC4gVGhpcyBtYWtlcyBpdCBhbiBhY2Nlc3Nvci5cbiAgICBiaW5kVG9BY2Nlc3NvcjogZnVuY3Rpb24obmFtZSwgb2JzZXJ2YWJsZSwgcmVzb2x2ZUZuKSB7XG4gICAgICB2YXIgcHJpdmF0ZU5hbWUgPSBuYW1lICsgJ18nO1xuICAgICAgdmFyIHByaXZhdGVPYnNlcnZhYmxlICA9IG5hbWUgKyAnT2JzZXJ2YWJsZV8nO1xuICAgICAgLy8gUHJlc2VudCBmb3IgcHJvcGVydGllcyB3aGljaCBhcmUgY29tcHV0ZWQgYW5kIHB1Ymxpc2hlZCBhbmQgaGF2ZSBhXG4gICAgICAvLyBib3VuZCB2YWx1ZS5cbiAgICAgIHZhciBwcml2YXRlQ29tcHV0ZWRCb3VuZFZhbHVlID0gbmFtZSArICdDb21wdXRlZEJvdW5kT2JzZXJ2YWJsZV8nO1xuICAgICAgdGhpc1twcml2YXRlT2JzZXJ2YWJsZV0gPSBvYnNlcnZhYmxlO1xuICAgICAgdmFyIG9sZFZhbHVlID0gdGhpc1twcml2YXRlTmFtZV07XG4gICAgICAvLyBvYnNlcnZhYmxlIGNhbGxiYWNrXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICBmdW5jdGlvbiB1cGRhdGVWYWx1ZSh2YWx1ZSwgb2xkVmFsdWUpIHtcbiAgICAgICAgc2VsZltwcml2YXRlTmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgdmFyIHNldE9ic2VydmVhYmxlID0gc2VsZltwcml2YXRlQ29tcHV0ZWRCb3VuZFZhbHVlXTtcbiAgICAgICAgaWYgKHNldE9ic2VydmVhYmxlICYmIHR5cGVvZiBzZXRPYnNlcnZlYWJsZS5zZXRWYWx1ZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgc2V0T2JzZXJ2ZWFibGUuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYuZW1pdFByb3BlcnR5Q2hhbmdlUmVjb3JkKG5hbWUsIHZhbHVlLCBvbGRWYWx1ZSk7XG4gICAgICB9XG4gICAgICAvLyByZXNvbHZlIGluaXRpYWwgdmFsdWVcbiAgICAgIHZhciB2YWx1ZSA9IG9ic2VydmFibGUub3Blbih1cGRhdGVWYWx1ZSk7XG4gICAgICBpZiAocmVzb2x2ZUZuICYmICFhcmVTYW1lVmFsdWUob2xkVmFsdWUsIHZhbHVlKSkge1xuICAgICAgICB2YXIgcmVzb2x2ZWRWYWx1ZSA9IHJlc29sdmVGbihvbGRWYWx1ZSwgdmFsdWUpO1xuICAgICAgICBpZiAoIWFyZVNhbWVWYWx1ZSh2YWx1ZSwgcmVzb2x2ZWRWYWx1ZSkpIHtcbiAgICAgICAgICB2YWx1ZSA9IHJlc29sdmVkVmFsdWU7XG4gICAgICAgICAgaWYgKG9ic2VydmFibGUuc2V0VmFsdWUpIHtcbiAgICAgICAgICAgIG9ic2VydmFibGUuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdXBkYXRlVmFsdWUodmFsdWUsIG9sZFZhbHVlKTtcbiAgICAgIC8vIHJlZ2lzdGVyIGFuZCByZXR1cm4gb2JzZXJ2YWJsZVxuICAgICAgdmFyIG9ic2VydmVyID0ge1xuICAgICAgICBjbG9zZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgb2JzZXJ2YWJsZS5jbG9zZSgpO1xuICAgICAgICAgIHNlbGZbcHJpdmF0ZU9ic2VydmFibGVdID0gdW5kZWZpbmVkO1xuICAgICAgICAgIHNlbGZbcHJpdmF0ZUNvbXB1dGVkQm91bmRWYWx1ZV0gPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICB0aGlzLnJlZ2lzdGVyT2JzZXJ2ZXIob2JzZXJ2ZXIpO1xuICAgICAgcmV0dXJuIG9ic2VydmVyO1xuICAgIH0sXG5cbiAgICBjcmVhdGVDb21wdXRlZFByb3BlcnRpZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCF0aGlzLl9jb21wdXRlZE5hbWVzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fY29tcHV0ZWROYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbmFtZSA9IHRoaXMuX2NvbXB1dGVkTmFtZXNbaV07XG4gICAgICAgIHZhciBleHByZXNzaW9uVGV4dCA9IHRoaXMuY29tcHV0ZWRbbmFtZV07XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdmFyIGV4cHJlc3Npb24gPSBQb2x5bWVyRXhwcmVzc2lvbnMuZ2V0RXhwcmVzc2lvbihleHByZXNzaW9uVGV4dCk7XG4gICAgICAgICAgdmFyIG9ic2VydmFibGUgPSBleHByZXNzaW9uLmdldEJpbmRpbmcodGhpcywgdGhpcy5lbGVtZW50LnN5bnRheCk7XG4gICAgICAgICAgdGhpcy5iaW5kVG9BY2Nlc3NvcihuYW1lLCBvYnNlcnZhYmxlKTtcbiAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY3JlYXRlIGNvbXB1dGVkIHByb3BlcnR5JywgZXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIHByb3BlcnR5IGJvb2trZWVwaW5nXG4gICAgcmVnaXN0ZXJPYnNlcnZlcjogZnVuY3Rpb24ob2JzZXJ2ZXIpIHtcbiAgICAgIGlmICghdGhpcy5fb2JzZXJ2ZXJzKSB7XG4gICAgICAgIHRoaXMuX29ic2VydmVycyA9IFtvYnNlcnZlcl07XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuX29ic2VydmVycy5wdXNoKG9ic2VydmVyKTtcbiAgICB9LFxuXG4gICAgY2xvc2VPYnNlcnZlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCF0aGlzLl9vYnNlcnZlcnMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gb2JzZXJ2ZXIgYXJyYXkgaXRlbXMgYXJlIGFycmF5cyBvZiBvYnNlcnZlcnMuXG4gICAgICB2YXIgb2JzZXJ2ZXJzID0gdGhpcy5fb2JzZXJ2ZXJzO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvYnNlcnZlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIG9ic2VydmVyID0gb2JzZXJ2ZXJzW2ldO1xuICAgICAgICBpZiAob2JzZXJ2ZXIgJiYgdHlwZW9mIG9ic2VydmVyLmNsb3NlID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBvYnNlcnZlci5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl9vYnNlcnZlcnMgPSBbXTtcbiAgICB9LFxuXG4gICAgLy8gYm9va2tlZXBpbmcgb2JzZXJ2ZXJzIGZvciBtZW1vcnkgbWFuYWdlbWVudFxuICAgIHJlZ2lzdGVyTmFtZWRPYnNlcnZlcjogZnVuY3Rpb24obmFtZSwgb2JzZXJ2ZXIpIHtcbiAgICAgIHZhciBvJCA9IHRoaXMuX25hbWVkT2JzZXJ2ZXJzIHx8ICh0aGlzLl9uYW1lZE9ic2VydmVycyA9IHt9KTtcbiAgICAgIG8kW25hbWVdID0gb2JzZXJ2ZXI7XG4gICAgfSxcblxuICAgIGNsb3NlTmFtZWRPYnNlcnZlcjogZnVuY3Rpb24obmFtZSkge1xuICAgICAgdmFyIG8kID0gdGhpcy5fbmFtZWRPYnNlcnZlcnM7XG4gICAgICBpZiAobyQgJiYgbyRbbmFtZV0pIHtcbiAgICAgICAgbyRbbmFtZV0uY2xvc2UoKTtcbiAgICAgICAgbyRbbmFtZV0gPSBudWxsO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgY2xvc2VOYW1lZE9ic2VydmVyczogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5fbmFtZWRPYnNlcnZlcnMpIHtcbiAgICAgICAgZm9yICh2YXIgaSBpbiB0aGlzLl9uYW1lZE9ic2VydmVycykge1xuICAgICAgICAgIHRoaXMuY2xvc2VOYW1lZE9ic2VydmVyKGkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX25hbWVkT2JzZXJ2ZXJzID0ge307XG4gICAgICB9XG4gICAgfVxuXG4gIH07XG5cbiAgLy8gbG9nZ2luZ1xuICB2YXIgTE9HX09CU0VSVkUgPSAnWyVzXSB3YXRjaGluZyBbJXNdJztcbiAgdmFyIExPR19PQlNFUlZFRCA9ICdbJXMjJXNdIHdhdGNoOiBbJXNdIG5vdyBbJXNdIHdhcyBbJXNdJztcbiAgdmFyIExPR19DSEFOR0VEID0gJ1slcyMlc10gcHJvcGVydHlDaGFuZ2VkOiBbJXNdIG5vdyBbJXNdIHdhcyBbJXNdJztcblxuICAvLyBleHBvcnRzXG5cbiAgc2NvcGUuYXBpLmluc3RhbmNlLnByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzO1xuXG59KShQb2x5bWVyKTtcblxuKGZ1bmN0aW9uKHNjb3BlKSB7XG5cbiAgLyoqXG4gICAqIEBjbGFzcyBwb2x5bWVyLWJhc2VcbiAgICovXG5cbiAgLy8gaW1wb3J0c1xuXG4gIHZhciBsb2cgPSB3aW5kb3cuV2ViQ29tcG9uZW50cyA/IFdlYkNvbXBvbmVudHMuZmxhZ3MubG9nIDoge307XG5cbiAgLy8gZWxlbWVudCBhcGkgc3VwcG9ydGluZyBtZHZcbiAgdmFyIG1kdiA9IHtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgZG9tIGNsb25lZCBmcm9tIHRoZSBnaXZlbiB0ZW1wbGF0ZSwgaW5zdGFudGlhdGluZyBiaW5kaW5nc1xuICAgICAqIHdpdGggdGhpcyBlbGVtZW50IGFzIHRoZSB0ZW1wbGF0ZSBtb2RlbCBhbmQgYFBvbHltZXJFeHByZXNzaW9uc2AgYXMgdGhlXG4gICAgICogYmluZGluZyBkZWxlZ2F0ZS5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgaW5zdGFuY2VUZW1wbGF0ZVxuICAgICAqIEBwYXJhbSB7VGVtcGxhdGV9IHRlbXBsYXRlIHNvdXJjZSB0ZW1wbGF0ZSBmcm9tIHdoaWNoIHRvIGNyZWF0ZSBkb20uXG4gICAgICovXG4gICAgaW5zdGFuY2VUZW1wbGF0ZTogZnVuY3Rpb24odGVtcGxhdGUpIHtcbiAgICAgIC8vIGVuc3VyZSB0ZW1wbGF0ZSBpcyBkZWNvcmF0ZWQgKGxldHMnIHRoaW5ncyBsaWtlIDx0ciB0ZW1wbGF0ZSAuLi4+IHdvcmspXG4gICAgICBIVE1MVGVtcGxhdGVFbGVtZW50LmRlY29yYXRlKHRlbXBsYXRlKTtcbiAgICAgIC8vIGVuc3VyZSBhIGRlZmF1bHQgYmluZGluZ0RlbGVnYXRlXG4gICAgICB2YXIgc3ludGF4ID0gdGhpcy5zeW50YXggfHwgKCF0ZW1wbGF0ZS5iaW5kaW5nRGVsZWdhdGUgJiZcbiAgICAgICAgICB0aGlzLmVsZW1lbnQuc3ludGF4KTtcbiAgICAgIHZhciBkb20gPSB0ZW1wbGF0ZS5jcmVhdGVJbnN0YW5jZSh0aGlzLCBzeW50YXgpO1xuICAgICAgdmFyIG9ic2VydmVycyA9IGRvbS5iaW5kaW5nc187XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9ic2VydmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLnJlZ2lzdGVyT2JzZXJ2ZXIob2JzZXJ2ZXJzW2ldKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkb207XG4gICAgfSxcblxuICAgIC8vIENhbGxlZCBieSBUZW1wbGF0ZUJpbmRpbmcvTm9kZUJpbmQgdG8gc2V0dXAgYSBiaW5kaW5nIHRvIHRoZSBnaXZlblxuICAgIC8vIHByb3BlcnR5LiBJdCdzIG92ZXJyaWRkZW4gaGVyZSB0byBzdXBwb3J0IHByb3BlcnR5IGJpbmRpbmdzXG4gICAgLy8gaW4gYWRkaXRpb24gdG8gYXR0cmlidXRlIGJpbmRpbmdzIHRoYXQgYXJlIHN1cHBvcnRlZCBieSBkZWZhdWx0LlxuICAgIGJpbmQ6IGZ1bmN0aW9uKG5hbWUsIG9ic2VydmFibGUsIG9uZVRpbWUpIHtcbiAgICAgIHZhciBwcm9wZXJ0eSA9IHRoaXMucHJvcGVydHlGb3JBdHRyaWJ1dGUobmFtZSk7XG4gICAgICBpZiAoIXByb3BlcnR5KSB7XG4gICAgICAgIC8vIFRPRE8oc2ptaWxlcyk6IHRoaXMgbWl4aW4gbWV0aG9kIG11c3QgdXNlIHRoZSBzcGVjaWFsIGZvcm1cbiAgICAgICAgLy8gb2YgYHN1cGVyYCBpbnN0YWxsZWQgYnkgYG1peGluTWV0aG9kYCBpbiBkZWNsYXJhdGlvbi9wcm90b3R5cGUuanNcbiAgICAgICAgcmV0dXJuIHRoaXMubWl4aW5TdXBlcihhcmd1bWVudHMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gdXNlIG4td2F5IFBvbHltZXIgYmluZGluZ1xuICAgICAgICB2YXIgb2JzZXJ2ZXIgPSB0aGlzLmJpbmRQcm9wZXJ0eShwcm9wZXJ0eSwgb2JzZXJ2YWJsZSwgb25lVGltZSk7XG4gICAgICAgIC8vIE5PVEU6IHJlZmxlY3RpbmcgYmluZGluZyBpbmZvcm1hdGlvbiBpcyB0eXBpY2FsbHkgcmVxdWlyZWQgb25seSBmb3JcbiAgICAgICAgLy8gdG9vbGluZy4gSXQgaGFzIGEgcGVyZm9ybWFuY2UgY29zdCBzbyBpdCdzIG9wdC1pbiBpbiBOb2RlLmJpbmQuXG4gICAgICAgIGlmIChQbGF0Zm9ybS5lbmFibGVCaW5kaW5nc1JlZmxlY3Rpb24gJiYgb2JzZXJ2ZXIpIHtcbiAgICAgICAgICBvYnNlcnZlci5wYXRoID0gb2JzZXJ2YWJsZS5wYXRoXztcbiAgICAgICAgICB0aGlzLl9yZWNvcmRCaW5kaW5nKHByb3BlcnR5LCBvYnNlcnZlcik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucmVmbGVjdFtwcm9wZXJ0eV0pIHtcbiAgICAgICAgICB0aGlzLnJlZmxlY3RQcm9wZXJ0eVRvQXR0cmlidXRlKHByb3BlcnR5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JzZXJ2ZXI7XG4gICAgICB9XG4gICAgfSxcblxuICAgIF9yZWNvcmRCaW5kaW5nOiBmdW5jdGlvbihuYW1lLCBvYnNlcnZlcikge1xuICAgICAgdGhpcy5iaW5kaW5nc18gPSB0aGlzLmJpbmRpbmdzXyB8fCB7fTtcbiAgICAgIHRoaXMuYmluZGluZ3NfW25hbWVdID0gb2JzZXJ2ZXI7XG4gICAgfSxcblxuICAgIC8vIENhbGxlZCBieSBUZW1wbGF0ZUJpbmRpbmcgd2hlbiBhbGwgYmluZGluZ3Mgb24gYW4gZWxlbWVudCBoYXZlIGJlZW5cbiAgICAvLyBleGVjdXRlZC4gVGhpcyBzaWduYWxzIHRoYXQgYWxsIGVsZW1lbnQgaW5wdXRzIGhhdmUgYmVlbiBnYXRoZXJlZFxuICAgIC8vIGFuZCBpdCdzIHNhZmUgdG8gcmVhZHkgdGhlIGVsZW1lbnQsIGNyZWF0ZSBzaGFkb3ctcm9vdCBhbmQgc3RhcnRcbiAgICAvLyBkYXRhLW9ic2VydmF0aW9uLlxuICAgIGJpbmRGaW5pc2hlZDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLm1ha2VFbGVtZW50UmVhZHkoKTtcbiAgICB9LFxuXG4gICAgLy8gY2FsbGVkIGF0IGRldGFjaGVkIHRpbWUgdG8gc2lnbmFsIHRoYXQgYW4gZWxlbWVudCdzIGJpbmRpbmdzIHNob3VsZCBiZVxuICAgIC8vIGNsZWFuZWQgdXAuIFRoaXMgaXMgZG9uZSBhc3luY2hyb25vdXNseSBzbyB0aGF0IHVzZXJzIGhhdmUgdGhlIGNoYW5jZVxuICAgIC8vIHRvIGNhbGwgYGNhbmNlbFVuYmluZEFsbGAgdG8gcHJldmVudCB1bmJpbmRpbmcuXG4gICAgYXN5bmNVbmJpbmRBbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCF0aGlzLl91bmJvdW5kKSB7XG4gICAgICAgIGxvZy51bmJpbmQgJiYgY29uc29sZS5sb2coJ1slc10gYXN5bmNVbmJpbmRBbGwnLCB0aGlzLmxvY2FsTmFtZSk7XG4gICAgICAgIHRoaXMuX3VuYmluZEFsbEpvYiA9IHRoaXMuam9iKHRoaXMuX3VuYmluZEFsbEpvYiwgdGhpcy51bmJpbmRBbGwsIDApO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBzaG91bGQgcmFyZWx5IGJlIHVzZWQgYW5kIG9ubHkgaWZcbiAgICAgKiA8YSBocmVmPVwiI2NhbmNlbFVuYmluZEFsbFwiPmBjYW5jZWxVbmJpbmRBbGxgPC9hPiBoYXMgYmVlbiBjYWxsZWQgdG9cbiAgICAgKiBwcmV2ZW50IGVsZW1lbnQgdW5iaW5kaW5nLiBJbiB0aGlzIGNhc2UsIHRoZSBlbGVtZW50J3MgYmluZGluZ3Mgd2lsbFxuICAgICAqIG5vdCBiZSBhdXRvbWF0aWNhbGx5IGNsZWFuZWQgdXAgYW5kIGl0IGNhbm5vdCBiZSBnYXJiYWdlIGNvbGxlY3RlZFxuICAgICAqIGJ5IHRoZSBzeXN0ZW0uIElmIG1lbW9yeSBwcmVzc3VyZSBpcyBhIGNvbmNlcm4gb3IgYVxuICAgICAqIGxhcmdlIGFtb3VudCBvZiBlbGVtZW50cyBuZWVkIHRvIGJlIG1hbmFnZWQgaW4gdGhpcyB3YXksIGB1bmJpbmRBbGxgXG4gICAgICogY2FuIGJlIGNhbGxlZCB0byBkZWFjdGl2YXRlIHRoZSBlbGVtZW50J3MgYmluZGluZ3MgYW5kIGFsbG93IGl0c1xuICAgICAqIG1lbW9yeSB0byBiZSByZWNsYWltZWQuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIHVuYmluZEFsbFxuICAgICAqL1xuICAgIHVuYmluZEFsbDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXRoaXMuX3VuYm91bmQpIHtcbiAgICAgICAgdGhpcy5jbG9zZU9ic2VydmVycygpO1xuICAgICAgICB0aGlzLmNsb3NlTmFtZWRPYnNlcnZlcnMoKTtcbiAgICAgICAgdGhpcy5fdW5ib3VuZCA9IHRydWU7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGwgaW4gYGRldGFjaGVkYCB0byBwcmV2ZW50IHRoZSBlbGVtZW50IGZyb20gdW5iaW5kaW5nIHdoZW4gaXQgaXNcbiAgICAgKiBkZXRhY2hlZCBmcm9tIHRoZSBkb20uIFRoZSBlbGVtZW50IGlzIHVuYm91bmQgYXMgYSBjbGVhbnVwIHN0ZXAgdGhhdFxuICAgICAqIGFsbG93cyBpdHMgbWVtb3J5IHRvIGJlIHJlY2xhaW1lZC5cbiAgICAgKiBJZiBgY2FuY2VsVW5iaW5kQWxsYCBpcyB1c2VkLCBjb25zaWRlciBjYWxsaW5nXG4gICAgICogPGEgaHJlZj1cIiN1bmJpbmRBbGxcIj5gdW5iaW5kQWxsYDwvYT4gd2hlbiB0aGUgZWxlbWVudCBpcyBubyBsb25nZXJcbiAgICAgKiBuZWVkZWQuIFRoaXMgd2lsbCBhbGxvdyBpdHMgbWVtb3J5IHRvIGJlIHJlY2xhaW1lZC5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgY2FuY2VsVW5iaW5kQWxsXG4gICAgICovXG4gICAgY2FuY2VsVW5iaW5kQWxsOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLl91bmJvdW5kKSB7XG4gICAgICAgIGxvZy51bmJpbmQgJiYgY29uc29sZS53YXJuKCdbJXNdIGFscmVhZHkgdW5ib3VuZCwgY2Fubm90IGNhbmNlbCB1bmJpbmRBbGwnLCB0aGlzLmxvY2FsTmFtZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGxvZy51bmJpbmQgJiYgY29uc29sZS5sb2coJ1slc10gY2FuY2VsVW5iaW5kQWxsJywgdGhpcy5sb2NhbE5hbWUpO1xuICAgICAgaWYgKHRoaXMuX3VuYmluZEFsbEpvYikge1xuICAgICAgICB0aGlzLl91bmJpbmRBbGxKb2IgPSB0aGlzLl91bmJpbmRBbGxKb2Iuc3RvcCgpO1xuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIGZ1bmN0aW9uIHVuYmluZE5vZGVUcmVlKG5vZGUpIHtcbiAgICBmb3JOb2RlVHJlZShub2RlLCBfbm9kZVVuYmluZEFsbCk7XG4gIH1cblxuICBmdW5jdGlvbiBfbm9kZVVuYmluZEFsbChub2RlKSB7XG4gICAgbm9kZS51bmJpbmRBbGwoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvck5vZGVUcmVlKG5vZGUsIGNhbGxiYWNrKSB7XG4gICAgaWYgKG5vZGUpIHtcbiAgICAgIGNhbGxiYWNrKG5vZGUpO1xuICAgICAgZm9yICh2YXIgY2hpbGQgPSBub2RlLmZpcnN0Q2hpbGQ7IGNoaWxkOyBjaGlsZCA9IGNoaWxkLm5leHRTaWJsaW5nKSB7XG4gICAgICAgIGZvck5vZGVUcmVlKGNoaWxkLCBjYWxsYmFjayk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmFyIG11c3RhY2hlUGF0dGVybiA9IC9cXHtcXHsoW157fV0qKX19LztcblxuICAvLyBleHBvcnRzXG5cbiAgc2NvcGUuYmluZFBhdHRlcm4gPSBtdXN0YWNoZVBhdHRlcm47XG4gIHNjb3BlLmFwaS5pbnN0YW5jZS5tZHYgPSBtZHY7XG5cbn0pKFBvbHltZXIpO1xuXG4oZnVuY3Rpb24oc2NvcGUpIHtcblxuICAvKipcbiAgICogQ29tbW9uIHByb3RvdHlwZSBmb3IgYWxsIFBvbHltZXIgRWxlbWVudHMuXG4gICAqXG4gICAqIEBjbGFzcyBwb2x5bWVyLWJhc2VcbiAgICogQGhvbWVwYWdlIHBvbHltZXIuZ2l0aHViLmlvXG4gICAqL1xuICB2YXIgYmFzZSA9IHtcbiAgICAvKipcbiAgICAgKiBUYWdzIHRoaXMgb2JqZWN0IGFzIHRoZSBjYW5vbmljYWwgQmFzZSBwcm90b3R5cGUuXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkgUG9seW1lckJhc2VcbiAgICAgKiBAdHlwZSBib29sZWFuXG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqL1xuICAgIFBvbHltZXJCYXNlOiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogRGVib3VuY2Ugc2lnbmFscy5cbiAgICAgKlxuICAgICAqIENhbGwgYGpvYmAgdG8gZGVmZXIgYSBuYW1lZCBzaWduYWwsIGFuZCBhbGwgc3Vic2VxdWVudCBtYXRjaGluZyBzaWduYWxzLFxuICAgICAqIHVudGlsIGEgd2FpdCB0aW1lIGhhcyBlbGFwc2VkIHdpdGggbm8gbmV3IHNpZ25hbC5cbiAgICAgKlxuICAgICAqICAgICBkZWJvdW5jZWRDbGlja0FjdGlvbjogZnVuY3Rpb24oZSkge1xuICAgICAqICAgICAgIC8vIHByb2Nlc3NDbGljayBvbmx5IHdoZW4gaXQncyBiZWVuIDEwMG1zIHNpbmNlIHRoZSBsYXN0IGNsaWNrXG4gICAgICogICAgICAgdGhpcy5qb2IoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICogICAgICAgIHRoaXMucHJvY2Vzc0NsaWNrO1xuICAgICAqICAgICAgIH0sIDEwMCk7XG4gICAgICogICAgIH1cbiAgICAgKlxuICAgICAqIEBtZXRob2Qgam9iXG4gICAgICogQHBhcmFtIFN0cmluZyB7U3RyaW5nfSBqb2IgQSBzdHJpbmcgaWRlbnRpZmllciBmb3IgdGhlIGpvYiB0byBkZWJvdW5jZS5cbiAgICAgKiBAcGFyYW0gRnVuY3Rpb24ge0Z1bmN0aW9ufSBjYWxsYmFjayBBIGZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkICh3aXRoIGB0aGlzYCBjb250ZXh0KSB3aGVuIHRoZSB3YWl0IHRpbWUgZWxhcHNlcy5cbiAgICAgKiBAcGFyYW0gTnVtYmVyIHtOdW1iZXJ9IHdhaXQgVGltZSBpbiBtaWxsaXNlY29uZHMgKG1zKSBhZnRlciB0aGUgbGFzdCBzaWduYWwgdGhhdCBtdXN0IGVsYXBzZSBiZWZvcmUgaW52b2tpbmcgYGNhbGxiYWNrYFxuICAgICAqIEB0eXBlIEhhbmRsZVxuICAgICAqL1xuICAgIGpvYjogZnVuY3Rpb24oam9iLCBjYWxsYmFjaywgd2FpdCkge1xuICAgICAgaWYgKHR5cGVvZiBqb2IgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHZhciBuID0gJ19fXycgKyBqb2I7XG4gICAgICAgIHRoaXNbbl0gPSBQb2x5bWVyLmpvYi5jYWxsKHRoaXMsIHRoaXNbbl0sIGNhbGxiYWNrLCB3YWl0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRPRE8oc2ptaWxlcyk6IHN1Z2dlc3Qgd2UgZGVwcmVjYXRlIHRoaXMgY2FsbCBzaWduYXR1cmVcbiAgICAgICAgcmV0dXJuIFBvbHltZXIuam9iLmNhbGwodGhpcywgam9iLCBjYWxsYmFjaywgd2FpdCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEludm9rZSBhIHN1cGVyY2xhc3MgbWV0aG9kLlxuICAgICAqXG4gICAgICogVXNlIGBzdXBlcigpYCB0byBpbnZva2UgdGhlIG1vc3QgcmVjZW50bHkgb3ZlcnJpZGRlbiBjYWxsIHRvIHRoZVxuICAgICAqIGN1cnJlbnRseSBleGVjdXRpbmcgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBUbyBwYXNzIGFyZ3VtZW50cyB0aHJvdWdoLCB1c2UgdGhlIGxpdGVyYWwgYGFyZ3VtZW50c2AgYXMgdGhlIHBhcmFtZXRlclxuICAgICAqIHRvIGBzdXBlcigpYC5cbiAgICAgKlxuICAgICAqICAgICBuZXh0UGFnZUFjdGlvbjogZnVuY3Rpb24oZSkge1xuICAgICAqICAgICAgIC8vIGludm9rZSB0aGUgc3VwZXJjbGFzcyB2ZXJzaW9uIG9mIGBuZXh0UGFnZUFjdGlvbmBcbiAgICAgKiAgICAgICB0aGlzLnN1cGVyKGFyZ3VtZW50cyk7XG4gICAgICogICAgIH1cbiAgICAgKlxuICAgICAqIFRvIHBhc3MgY3VzdG9tIGFyZ3VtZW50cywgYXJyYW5nZSB0aGVtIGluIGFuIGFycmF5LlxuICAgICAqXG4gICAgICogICAgIGFwcGVuZFNlcmlhbE5vOiBmdW5jdGlvbih2YWx1ZSwgc2VyaWFsKSB7XG4gICAgICogICAgICAgLy8gcHJlZml4IHRoZSBzdXBlcmNsYXNzIHNlcmlhbCBudW1iZXIgd2l0aCBvdXIgbG90ICMgYmVmb3JlXG4gICAgICogICAgICAgLy8gaW52b2tpbmcgdGhlIHN1cGVybGNhc3NcbiAgICAgKiAgICAgICByZXR1cm4gdGhpcy5zdXBlcihbdmFsdWUsIHRoaXMubG90Tm8gKyBzZXJpYWxdKVxuICAgICAqICAgICB9XG4gICAgICpcbiAgICAgKiBAbWV0aG9kIHN1cGVyXG4gICAgICogQHR5cGUgQW55XG4gICAgICogQHBhcmFtIHthcmdzKSBBbiBhcnJheSBvZiBhcmd1bWVudHMgdG8gdXNlIHdoZW4gY2FsbGluZyB0aGUgc3VwZXJjbGFzcyBtZXRob2QsIG9yIG51bGwuXG4gICAgICovXG4gICAgc3VwZXI6IFBvbHltZXIuc3VwZXIsXG5cbiAgICAvKipcbiAgICAgKiBMaWZlY3ljbGUgbWV0aG9kIGNhbGxlZCB3aGVuIHRoZSBlbGVtZW50IGlzIGluc3RhbnRpYXRlZC5cbiAgICAgKlxuICAgICAqIE92ZXJyaWRlIGBjcmVhdGVkYCB0byBwZXJmb3JtIGN1c3RvbSBjcmVhdGUtdGltZSB0YXNrcy4gTm8gbmVlZCB0byBjYWxsXG4gICAgICogc3VwZXItY2xhc3MgYGNyZWF0ZWRgIHVubGVzcyB5b3UgYXJlIGV4dGVuZGluZyBhbm90aGVyIFBvbHltZXIgZWxlbWVudC5cbiAgICAgKiBDcmVhdGVkIGlzIGNhbGxlZCBiZWZvcmUgdGhlIGVsZW1lbnQgY3JlYXRlcyBgc2hhZG93Um9vdGAgb3IgcHJlcGFyZXNcbiAgICAgKiBkYXRhLW9ic2VydmF0aW9uLlxuICAgICAqXG4gICAgICogQG1ldGhvZCBjcmVhdGVkXG4gICAgICogQHR5cGUgdm9pZFxuICAgICAqL1xuICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKCkge1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBMaWZlY3ljbGUgbWV0aG9kIGNhbGxlZCB3aGVuIHRoZSBlbGVtZW50IGhhcyBwb3B1bGF0ZWQgaXQncyBgc2hhZG93Um9vdGAsXG4gICAgICogcHJlcGFyZWQgZGF0YS1vYnNlcnZhdGlvbiwgYW5kIG1hZGUgaXRzZWxmIHJlYWR5IGZvciBBUEkgaW50ZXJhY3Rpb24uXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIHJlYWR5XG4gICAgICogQHR5cGUgdm9pZFxuICAgICAqL1xuICAgIHJlYWR5OiBmdW5jdGlvbigpIHtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTG93LWxldmVsIGxpZmVjeWNsZSBtZXRob2QgY2FsbGVkIGFzIHBhcnQgb2Ygc3RhbmRhcmQgQ3VzdG9tIEVsZW1lbnRzXG4gICAgICogb3BlcmF0aW9uLiBQb2x5bWVyIGltcGxlbWVudHMgdGhpcyBtZXRob2QgdG8gcHJvdmlkZSBiYXNpYyBkZWZhdWx0XG4gICAgICogZnVuY3Rpb25hbGl0eS4gRm9yIGN1c3RvbSBjcmVhdGUtdGltZSB0YXNrcywgaW1wbGVtZW50IGBjcmVhdGVkYFxuICAgICAqIGluc3RlYWQsIHdoaWNoIGlzIGNhbGxlZCBpbW1lZGlhdGVseSBhZnRlciBgY3JlYXRlZENhbGxiYWNrYC5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgY3JlYXRlZENhbGxiYWNrXG4gICAgICovXG4gICAgY3JlYXRlZENhbGxiYWNrOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnRlbXBsYXRlSW5zdGFuY2UgJiYgdGhpcy50ZW1wbGF0ZUluc3RhbmNlLm1vZGVsKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignQXR0cmlidXRlcyBvbiAnICsgdGhpcy5sb2NhbE5hbWUgKyAnIHdlcmUgZGF0YSBib3VuZCAnICtcbiAgICAgICAgICAgICdwcmlvciB0byBQb2x5bWVyIHVwZ3JhZGluZyB0aGUgZWxlbWVudC4gVGhpcyBtYXkgcmVzdWx0IGluICcgK1xuICAgICAgICAgICAgJ2luY29ycmVjdCBiaW5kaW5nIHR5cGVzLicpO1xuICAgICAgfVxuICAgICAgdGhpcy5jcmVhdGVkKCk7XG4gICAgICB0aGlzLnByZXBhcmVFbGVtZW50KCk7XG4gICAgICBpZiAoIXRoaXMub3duZXJEb2N1bWVudC5pc1N0YWdpbmdEb2N1bWVudCkge1xuICAgICAgICB0aGlzLm1ha2VFbGVtZW50UmVhZHkoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gc3lzdGVtIGVudHJ5IHBvaW50LCBkbyBub3Qgb3ZlcnJpZGVcbiAgICBwcmVwYXJlRWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5fZWxlbWVudFByZXBhcmVkKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignRWxlbWVudCBhbHJlYWR5IHByZXBhcmVkJywgdGhpcy5sb2NhbE5hbWUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl9lbGVtZW50UHJlcGFyZWQgPSB0cnVlO1xuICAgICAgLy8gc3RvcmFnZSBmb3Igc2hhZG93Um9vdHMgaW5mb1xuICAgICAgdGhpcy5zaGFkb3dSb290cyA9IHt9O1xuICAgICAgLy8gaW5zdGFsbCBwcm9wZXJ0eSBvYnNlcnZlcnNcbiAgICAgIHRoaXMuY3JlYXRlUHJvcGVydHlPYnNlcnZlcigpO1xuICAgICAgdGhpcy5vcGVuUHJvcGVydHlPYnNlcnZlcigpO1xuICAgICAgLy8gaW5zdGFsbCBib2lsZXJwbGF0ZSBhdHRyaWJ1dGVzXG4gICAgICB0aGlzLmNvcHlJbnN0YW5jZUF0dHJpYnV0ZXMoKTtcbiAgICAgIC8vIHByb2Nlc3MgaW5wdXQgYXR0cmlidXRlc1xuICAgICAgdGhpcy50YWtlQXR0cmlidXRlcygpO1xuICAgICAgLy8gYWRkIGV2ZW50IGxpc3RlbmVyc1xuICAgICAgdGhpcy5hZGRIb3N0TGlzdGVuZXJzKCk7XG4gICAgfSxcblxuICAgIC8vIHN5c3RlbSBlbnRyeSBwb2ludCwgZG8gbm90IG92ZXJyaWRlXG4gICAgbWFrZUVsZW1lbnRSZWFkeTogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5fcmVhZGllZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLl9yZWFkaWVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuY3JlYXRlQ29tcHV0ZWRQcm9wZXJ0aWVzKCk7XG4gICAgICB0aGlzLnBhcnNlRGVjbGFyYXRpb25zKHRoaXMuX19wcm90b19fKTtcbiAgICAgIC8vIE5PVEU6IFN1cHBvcnQgdXNlIG9mIHRoZSBgdW5yZXNvbHZlZGAgYXR0cmlidXRlIHRvIGhlbHAgcG9seWZpbGxcbiAgICAgIC8vIGN1c3RvbSBlbGVtZW50cycgYDp1bnJlc29sdmVkYCBmZWF0dXJlLlxuICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoJ3VucmVzb2x2ZWQnKTtcbiAgICAgIC8vIHVzZXIgZW50cnkgcG9pbnRcbiAgICAgIHRoaXMucmVhZHkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTG93LWxldmVsIGxpZmVjeWNsZSBtZXRob2QgY2FsbGVkIGFzIHBhcnQgb2Ygc3RhbmRhcmQgQ3VzdG9tIEVsZW1lbnRzXG4gICAgICogb3BlcmF0aW9uLiBQb2x5bWVyIGltcGxlbWVudHMgdGhpcyBtZXRob2QgdG8gcHJvdmlkZSBiYXNpYyBkZWZhdWx0XG4gICAgICogZnVuY3Rpb25hbGl0eS4gRm9yIGN1c3RvbSB0YXNrcyBpbiB5b3VyIGVsZW1lbnQsIGltcGxlbWVudCBgYXR0cmlidXRlQ2hhbmdlZGBcbiAgICAgKiBpbnN0ZWFkLCB3aGljaCBpcyBjYWxsZWQgaW1tZWRpYXRlbHkgYWZ0ZXIgYGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFja2AuXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFja1xuICAgICAqL1xuICAgIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjazogZnVuY3Rpb24obmFtZSwgb2xkVmFsdWUpIHtcbiAgICAgIC8vIFRPRE8oc2ptaWxlcyk6IGFkaG9jIGZpbHRlclxuICAgICAgaWYgKG5hbWUgIT09ICdjbGFzcycgJiYgbmFtZSAhPT0gJ3N0eWxlJykge1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZVRvUHJvcGVydHkobmFtZSwgdGhpcy5nZXRBdHRyaWJ1dGUobmFtZSkpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuYXR0cmlidXRlQ2hhbmdlZCkge1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZUNoYW5nZWQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTG93LWxldmVsIGxpZmVjeWNsZSBtZXRob2QgY2FsbGVkIGFzIHBhcnQgb2Ygc3RhbmRhcmQgQ3VzdG9tIEVsZW1lbnRzXG4gICAgICogb3BlcmF0aW9uLiBQb2x5bWVyIGltcGxlbWVudHMgdGhpcyBtZXRob2QgdG8gcHJvdmlkZSBiYXNpYyBkZWZhdWx0XG4gICAgICogZnVuY3Rpb25hbGl0eS4gRm9yIGN1c3RvbSBjcmVhdGUtdGltZSB0YXNrcywgaW1wbGVtZW50IGBhdHRhY2hlZGBcbiAgICAgKiBpbnN0ZWFkLCB3aGljaCBpcyBjYWxsZWQgaW1tZWRpYXRlbHkgYWZ0ZXIgYGF0dGFjaGVkQ2FsbGJhY2tgLlxuICAgICAqXG4gICAgICogQG1ldGhvZCBhdHRhY2hlZENhbGxiYWNrXG4gICAgICovXG4gICAgIGF0dGFjaGVkQ2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gd2hlbiB0aGUgZWxlbWVudCBpcyBhdHRhY2hlZCwgcHJldmVudCBpdCBmcm9tIHVuYmluZGluZy5cbiAgICAgIHRoaXMuY2FuY2VsVW5iaW5kQWxsKCk7XG4gICAgICAvLyBpbnZva2UgdXNlciBhY3Rpb25cbiAgICAgIGlmICh0aGlzLmF0dGFjaGVkKSB7XG4gICAgICAgIHRoaXMuYXR0YWNoZWQoKTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5oYXNCZWVuQXR0YWNoZWQpIHtcbiAgICAgICAgdGhpcy5oYXNCZWVuQXR0YWNoZWQgPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5kb21SZWFkeSkge1xuICAgICAgICAgIHRoaXMuYXN5bmMoJ2RvbVJlYWR5Jyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgIC8qKlxuICAgICAqIEltcGxlbWVudCB0byBhY2Nlc3MgY3VzdG9tIGVsZW1lbnRzIGluIGRvbSBkZXNjZW5kYW50cywgYW5jZXN0b3JzLFxuICAgICAqIG9yIHNpYmxpbmdzLiBCZWNhdXNlIGN1c3RvbSBlbGVtZW50cyB1cGdyYWRlIGluIGRvY3VtZW50IG9yZGVyLFxuICAgICAqIGVsZW1lbnRzIGFjY2Vzc2VkIGluIGByZWFkeWAgb3IgYGF0dGFjaGVkYCBtYXkgbm90IGJlIHVwZ3JhZGVkLiBXaGVuXG4gICAgICogYGRvbVJlYWR5YCBpcyBjYWxsZWQsIGFsbCByZWdpc3RlcmVkIGN1c3RvbSBlbGVtZW50cyBhcmUgZ3VhcmFudGVlZFxuICAgICAqIHRvIGhhdmUgYmVlbiB1cGdyYWRlZC5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgZG9tUmVhZHlcbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIExvdy1sZXZlbCBsaWZlY3ljbGUgbWV0aG9kIGNhbGxlZCBhcyBwYXJ0IG9mIHN0YW5kYXJkIEN1c3RvbSBFbGVtZW50c1xuICAgICAqIG9wZXJhdGlvbi4gUG9seW1lciBpbXBsZW1lbnRzIHRoaXMgbWV0aG9kIHRvIHByb3ZpZGUgYmFzaWMgZGVmYXVsdFxuICAgICAqIGZ1bmN0aW9uYWxpdHkuIEZvciBjdXN0b20gY3JlYXRlLXRpbWUgdGFza3MsIGltcGxlbWVudCBgZGV0YWNoZWRgXG4gICAgICogaW5zdGVhZCwgd2hpY2ggaXMgY2FsbGVkIGltbWVkaWF0ZWx5IGFmdGVyIGBkZXRhY2hlZENhbGxiYWNrYC5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgZGV0YWNoZWRDYWxsYmFja1xuICAgICAqL1xuICAgIGRldGFjaGVkQ2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCF0aGlzLnByZXZlbnREaXNwb3NlKSB7XG4gICAgICAgIHRoaXMuYXN5bmNVbmJpbmRBbGwoKTtcbiAgICAgIH1cbiAgICAgIC8vIGludm9rZSB1c2VyIGFjdGlvblxuICAgICAgaWYgKHRoaXMuZGV0YWNoZWQpIHtcbiAgICAgICAgdGhpcy5kZXRhY2hlZCgpO1xuICAgICAgfVxuICAgICAgLy8gVE9ETyhzb3J2ZWxsKTogYmNcbiAgICAgIGlmICh0aGlzLmxlZnRWaWV3KSB7XG4gICAgICAgIHRoaXMubGVmdFZpZXcoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2Fsa3MgdGhlIHByb3RvdHlwZS1jaGFpbiBvZiB0aGlzIGVsZW1lbnQgYW5kIGFsbG93cyBzcGVjaWZpY1xuICAgICAqIGNsYXNzZXMgYSBjaGFuY2UgdG8gcHJvY2VzcyBzdGF0aWMgZGVjbGFyYXRpb25zLlxuICAgICAqXG4gICAgICogSW4gcGFydGljdWxhciwgZWFjaCBwb2x5bWVyLWVsZW1lbnQgaGFzIGl0J3Mgb3duIGB0ZW1wbGF0ZWAuXG4gICAgICogYHBhcnNlRGVjbGFyYXRpb25zYCBpcyB1c2VkIHRvIGFjY3VtdWxhdGUgYWxsIGVsZW1lbnQgYHRlbXBsYXRlYHNcbiAgICAgKiBmcm9tIGFuIGluaGVyaXRhbmNlIGNoYWluLlxuICAgICAqXG4gICAgICogYHBhcnNlRGVjbGFyYXRpb25gIHN0YXRpYyBtZXRob2RzIGltcGxlbWVudGVkIGluIHRoZSBjaGFpbiBhcmUgY2FsbGVkXG4gICAgICogcmVjdXJzaXZlbHksIG9sZGVzdCBmaXJzdCwgd2l0aCB0aGUgYDxwb2x5bWVyLWVsZW1lbnQ+YCBhc3NvY2lhdGVkXG4gICAgICogd2l0aCB0aGUgY3VycmVudCBwcm90b3R5cGUgcGFzc2VkIGFzIGFuIGFyZ3VtZW50LlxuICAgICAqXG4gICAgICogQW4gZWxlbWVudCBtYXkgb3ZlcnJpZGUgdGhpcyBtZXRob2QgdG8gY3VzdG9taXplIHNoYWRvdy1yb290IGdlbmVyYXRpb24uXG4gICAgICpcbiAgICAgKiBAbWV0aG9kIHBhcnNlRGVjbGFyYXRpb25zXG4gICAgICovXG4gICAgcGFyc2VEZWNsYXJhdGlvbnM6IGZ1bmN0aW9uKHApIHtcbiAgICAgIGlmIChwICYmIHAuZWxlbWVudCkge1xuICAgICAgICB0aGlzLnBhcnNlRGVjbGFyYXRpb25zKHAuX19wcm90b19fKTtcbiAgICAgICAgcC5wYXJzZURlY2xhcmF0aW9uLmNhbGwodGhpcywgcC5lbGVtZW50KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGVyZm9ybSBpbml0LXRpbWUgYWN0aW9ucyBiYXNlZCBvbiBzdGF0aWMgaW5mb3JtYXRpb24gaW4gdGhlXG4gICAgICogYDxwb2x5bWVyLWVsZW1lbnQ+YCBpbnN0YW5jZSBhcmd1bWVudC5cbiAgICAgKlxuICAgICAqIEZvciBleGFtcGxlLCB0aGUgc3RhbmRhcmQgaW1wbGVtZW50YXRpb24gbG9jYXRlcyB0aGUgdGVtcGxhdGUgYXNzb2NpYXRlZFxuICAgICAqIHdpdGggdGhlIGdpdmVuIGA8cG9seW1lci1lbGVtZW50PmAgYW5kIHN0YW1wcyBpdCBpbnRvIGEgc2hhZG93LXJvb3QgdG9cbiAgICAgKiBpbXBsZW1lbnQgc2hhZG93IGluaGVyaXRhbmNlLlxuICAgICAqXG4gICAgICogQW4gZWxlbWVudCBtYXkgb3ZlcnJpZGUgdGhpcyBtZXRob2QgZm9yIGN1c3RvbSBiZWhhdmlvci5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgcGFyc2VEZWNsYXJhdGlvblxuICAgICAqL1xuICAgIHBhcnNlRGVjbGFyYXRpb246IGZ1bmN0aW9uKGVsZW1lbnRFbGVtZW50KSB7XG4gICAgICB2YXIgdGVtcGxhdGUgPSB0aGlzLmZldGNoVGVtcGxhdGUoZWxlbWVudEVsZW1lbnQpO1xuICAgICAgaWYgKHRlbXBsYXRlKSB7XG4gICAgICAgIHZhciByb290ID0gdGhpcy5zaGFkb3dGcm9tVGVtcGxhdGUodGVtcGxhdGUpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3RzW2VsZW1lbnRFbGVtZW50Lm5hbWVdID0gcm9vdDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2l2ZW4gYSBgPHBvbHltZXItZWxlbWVudD5gLCBmaW5kIGFuIGFzc29jaWF0ZWQgdGVtcGxhdGUgKGlmIGFueSkgdG8gYmVcbiAgICAgKiB1c2VkIGZvciBzaGFkb3ctcm9vdCBnZW5lcmF0aW9uLlxuICAgICAqXG4gICAgICogQW4gZWxlbWVudCBtYXkgb3ZlcnJpZGUgdGhpcyBtZXRob2QgZm9yIGN1c3RvbSBiZWhhdmlvci5cbiAgICAgKlxuICAgICAqIEBtZXRob2QgZmV0Y2hUZW1wbGF0ZVxuICAgICAqL1xuICAgIGZldGNoVGVtcGxhdGU6IGZ1bmN0aW9uKGVsZW1lbnRFbGVtZW50KSB7XG4gICAgICByZXR1cm4gZWxlbWVudEVsZW1lbnQucXVlcnlTZWxlY3RvcigndGVtcGxhdGUnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgc2hhZG93LXJvb3QgaW4gdGhpcyBob3N0IGFuZCBzdGFtcCBgdGVtcGxhdGVgIGFzIGl0J3NcbiAgICAgKiBjb250ZW50LlxuICAgICAqXG4gICAgICogQW4gZWxlbWVudCBtYXkgb3ZlcnJpZGUgdGhpcyBtZXRob2QgZm9yIGN1c3RvbSBiZWhhdmlvci5cbiAgICAgKlxuICAgICAqIEBtZXRob2Qgc2hhZG93RnJvbVRlbXBsYXRlXG4gICAgICovXG4gICAgc2hhZG93RnJvbVRlbXBsYXRlOiBmdW5jdGlvbih0ZW1wbGF0ZSkge1xuICAgICAgaWYgKHRlbXBsYXRlKSB7XG4gICAgICAgIC8vIG1ha2UgYSBzaGFkb3cgcm9vdFxuICAgICAgICB2YXIgcm9vdCA9IHRoaXMuY3JlYXRlU2hhZG93Um9vdCgpO1xuICAgICAgICAvLyBzdGFtcCB0ZW1wbGF0ZVxuICAgICAgICAvLyB3aGljaCBpbmNsdWRlcyBwYXJzaW5nIGFuZCBhcHBseWluZyBNRFYgYmluZGluZ3MgYmVmb3JlIGJlaW5nXG4gICAgICAgIC8vIGluc2VydGVkICh0byBhdm9pZCB7e319IGluIGF0dHJpYnV0ZSB2YWx1ZXMpXG4gICAgICAgIC8vIGUuZy4gdG8gcHJldmVudCA8aW1nIHNyYz1cImltYWdlcy97e2ljb259fVwiPiBmcm9tIGdlbmVyYXRpbmcgYSA0MDQuXG4gICAgICAgIHZhciBkb20gPSB0aGlzLmluc3RhbmNlVGVtcGxhdGUodGVtcGxhdGUpO1xuICAgICAgICAvLyBhcHBlbmQgdG8gc2hhZG93IGRvbVxuICAgICAgICByb290LmFwcGVuZENoaWxkKGRvbSk7XG4gICAgICAgIC8vIHBlcmZvcm0gcG9zdC1jb25zdHJ1Y3Rpb24gaW5pdGlhbGl6YXRpb24gdGFza3Mgb24gc2hhZG93IHJvb3RcbiAgICAgICAgdGhpcy5zaGFkb3dSb290UmVhZHkocm9vdCwgdGVtcGxhdGUpO1xuICAgICAgICAvLyByZXR1cm4gdGhlIGNyZWF0ZWQgc2hhZG93IHJvb3RcbiAgICAgICAgcmV0dXJuIHJvb3Q7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIHV0aWxpdHkgZnVuY3Rpb24gdGhhdCBzdGFtcHMgYSA8dGVtcGxhdGU+IGludG8gbGlnaHQtZG9tXG4gICAgbGlnaHRGcm9tVGVtcGxhdGU6IGZ1bmN0aW9uKHRlbXBsYXRlLCByZWZOb2RlKSB7XG4gICAgICBpZiAodGVtcGxhdGUpIHtcbiAgICAgICAgLy8gVE9ETyhzb3J2ZWxsKTogbWFyayB0aGlzIGVsZW1lbnQgYXMgYW4gZXZlbnRDb250cm9sbGVyIHNvIHRoYXRcbiAgICAgICAgLy8gZXZlbnQgbGlzdGVuZXJzIG9uIGJvdW5kIG5vZGVzIGluc2lkZSBpdCB3aWxsIGJlIGNhbGxlZCBvbiBpdC5cbiAgICAgICAgLy8gTm90ZSwgdGhlIGV4cGVjdGF0aW9uIGhlcmUgaXMgdGhhdCBldmVudHMgb24gYWxsIGRlc2NlbmRhbnRzXG4gICAgICAgIC8vIHNob3VsZCBiZSBoYW5kbGVkIGJ5IHRoaXMgZWxlbWVudC5cbiAgICAgICAgdGhpcy5ldmVudENvbnRyb2xsZXIgPSB0aGlzO1xuICAgICAgICAvLyBzdGFtcCB0ZW1wbGF0ZVxuICAgICAgICAvLyB3aGljaCBpbmNsdWRlcyBwYXJzaW5nIGFuZCBhcHBseWluZyBNRFYgYmluZGluZ3MgYmVmb3JlIGJlaW5nXG4gICAgICAgIC8vIGluc2VydGVkICh0byBhdm9pZCB7e319IGluIGF0dHJpYnV0ZSB2YWx1ZXMpXG4gICAgICAgIC8vIGUuZy4gdG8gcHJldmVudCA8aW1nIHNyYz1cImltYWdlcy97e2ljb259fVwiPiBmcm9tIGdlbmVyYXRpbmcgYSA0MDQuXG4gICAgICAgIHZhciBkb20gPSB0aGlzLmluc3RhbmNlVGVtcGxhdGUodGVtcGxhdGUpO1xuICAgICAgICAvLyBhcHBlbmQgdG8gc2hhZG93IGRvbVxuICAgICAgICBpZiAocmVmTm9kZSkge1xuICAgICAgICAgIHRoaXMuaW5zZXJ0QmVmb3JlKGRvbSwgcmVmTm9kZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5hcHBlbmRDaGlsZChkb20pO1xuICAgICAgICB9XG4gICAgICAgIC8vIHBlcmZvcm0gcG9zdC1jb25zdHJ1Y3Rpb24gaW5pdGlhbGl6YXRpb24gdGFza3Mgb24gYWhlbSwgbGlnaHQgcm9vdFxuICAgICAgICB0aGlzLnNoYWRvd1Jvb3RSZWFkeSh0aGlzKTtcbiAgICAgICAgLy8gcmV0dXJuIHRoZSBjcmVhdGVkIHNoYWRvdyByb290XG4gICAgICAgIHJldHVybiBkb207XG4gICAgICB9XG4gICAgfSxcblxuICAgIHNoYWRvd1Jvb3RSZWFkeTogZnVuY3Rpb24ocm9vdCkge1xuICAgICAgLy8gbG9jYXRlIG5vZGVzIHdpdGggaWQgYW5kIHN0b3JlIHJlZmVyZW5jZXMgdG8gdGhlbSBpbiB0aGlzLiQgaGFzaFxuICAgICAgdGhpcy5tYXJzaGFsTm9kZVJlZmVyZW5jZXMocm9vdCk7XG4gICAgfSxcblxuICAgIC8vIGxvY2F0ZSBub2RlcyB3aXRoIGlkIGFuZCBzdG9yZSByZWZlcmVuY2VzIHRvIHRoZW0gaW4gdGhpcy4kIGhhc2hcbiAgICBtYXJzaGFsTm9kZVJlZmVyZW5jZXM6IGZ1bmN0aW9uKHJvb3QpIHtcbiAgICAgIC8vIGVzdGFibGlzaCAkIGluc3RhbmNlIHZhcmlhYmxlXG4gICAgICB2YXIgJCA9IHRoaXMuJCA9IHRoaXMuJCB8fCB7fTtcbiAgICAgIC8vIHBvcHVsYXRlICQgZnJvbSBub2RlcyB3aXRoIElEIGZyb20gdGhlIExPQ0FMIHRyZWVcbiAgICAgIGlmIChyb290KSB7XG4gICAgICAgIHZhciBuJCA9IHJvb3QucXVlcnlTZWxlY3RvckFsbChcIltpZF1cIik7XG4gICAgICAgIGZvciAodmFyIGk9MCwgbD1uJC5sZW5ndGgsIG47IChpPGwpICYmIChuPW4kW2ldKTsgaSsrKSB7XG4gICAgICAgICAgJFtuLmlkXSA9IG47XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGEgb25lLXRpbWUgY2FsbGJhY2sgd2hlbiBhIGNoaWxkLWxpc3Qgb3Igc3ViLXRyZWUgbXV0YXRpb25cbiAgICAgKiBvY2N1cnMgb24gbm9kZS5cbiAgICAgKlxuICAgICAqIEZvciBwZXJzaXN0ZW50IGNhbGxiYWNrcywgY2FsbCBvbk11dGF0aW9uIGZyb20geW91ciBsaXN0ZW5lci5cbiAgICAgKlxuICAgICAqIEBtZXRob2Qgb25NdXRhdGlvblxuICAgICAqIEBwYXJhbSBOb2RlIHtOb2RlfSBub2RlIE5vZGUgdG8gd2F0Y2ggZm9yIG11dGF0aW9ucy5cbiAgICAgKiBAcGFyYW0gRnVuY3Rpb24ge0Z1bmN0aW9ufSBsaXN0ZW5lciBGdW5jdGlvbiB0byBjYWxsIG9uIG11dGF0aW9uLiBUaGUgZnVuY3Rpb24gaXMgaW52b2tlZCBhcyBgbGlzdGVuZXIuY2FsbCh0aGlzLCBvYnNlcnZlciwgbXV0YXRpb25zKTtgIHdoZXJlIGBvYnNlcnZlcmAgaXMgdGhlIE11dGF0aW9uT2JzZXJ2ZXIgdGhhdCB0cmlnZ2VyZWQgdGhlIG5vdGlmaWNhdGlvbiwgYW5kIGBtdXRhdGlvbnNgIGlzIHRoZSBuYXRpdmUgbXV0YXRpb24gbGlzdC5cbiAgICAgKi9cbiAgICBvbk11dGF0aW9uOiBmdW5jdGlvbihub2RlLCBsaXN0ZW5lcikge1xuICAgICAgdmFyIG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24obXV0YXRpb25zKSB7XG4gICAgICAgIGxpc3RlbmVyLmNhbGwodGhpcywgb2JzZXJ2ZXIsIG11dGF0aW9ucyk7XG4gICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICBvYnNlcnZlci5vYnNlcnZlKG5vZGUsIHtjaGlsZExpc3Q6IHRydWUsIHN1YnRyZWU6IHRydWV9KTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEBjbGFzcyBQb2x5bWVyXG4gICAqL1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIG9iamVjdCBpbmNsdWRlcyA8YSBocmVmPVwiI3BvbHltZXItYmFzZVwiPnBvbHltZXItYmFzZTwvYT4gaW4gaXQncyBwcm90b3R5cGUgY2hhaW4uXG4gICAqXG4gICAqIEBtZXRob2QgaXNCYXNlXG4gICAqIEBwYXJhbSBPYmplY3Qge09iamVjdH0gb2JqZWN0IE9iamVjdCB0byB0ZXN0LlxuICAgKiBAdHlwZSBCb29sZWFuXG4gICAqL1xuICBmdW5jdGlvbiBpc0Jhc2Uob2JqZWN0KSB7XG4gICAgcmV0dXJuIG9iamVjdC5oYXNPd25Qcm9wZXJ0eSgnUG9seW1lckJhc2UnKVxuICB9XG5cbiAgLy8gbmFtZSBhIGJhc2UgY29uc3RydWN0b3IgZm9yIGRldiB0b29sc1xuXG4gIC8qKlxuICAgKiBUaGUgUG9seW1lciBiYXNlLWNsYXNzIGNvbnN0cnVjdG9yLlxuICAgKlxuICAgKiBAcHJvcGVydHkgQmFzZVxuICAgKiBAdHlwZSBGdW5jdGlvblxuICAgKi9cbiAgZnVuY3Rpb24gUG9seW1lckJhc2UoKSB7fTtcbiAgUG9seW1lckJhc2UucHJvdG90eXBlID0gYmFzZTtcbiAgYmFzZS5jb25zdHJ1Y3RvciA9IFBvbHltZXJCYXNlO1xuXG4gIC8vIGV4cG9ydHNcblxuICBzY29wZS5CYXNlID0gUG9seW1lckJhc2U7XG4gIHNjb3BlLmlzQmFzZSA9IGlzQmFzZTtcbiAgc2NvcGUuYXBpLmluc3RhbmNlLmJhc2UgPSBiYXNlO1xuXG59KShQb2x5bWVyKTtcblxuKGZ1bmN0aW9uKHNjb3BlKSB7XG5cbiAgLy8gaW1wb3J0c1xuXG4gIHZhciBsb2cgPSB3aW5kb3cuV2ViQ29tcG9uZW50cyA/IFdlYkNvbXBvbmVudHMuZmxhZ3MubG9nIDoge307XG4gIHZhciBoYXNTaGFkb3dET01Qb2x5ZmlsbCA9IHdpbmRvdy5TaGFkb3dET01Qb2x5ZmlsbDtcblxuICAvLyBtYWdpYyB3b3Jkc1xuXG4gIHZhciBTVFlMRV9TQ09QRV9BVFRSSUJVVEUgPSAnZWxlbWVudCc7XG4gIHZhciBTVFlMRV9DT05UUk9MTEVSX1NDT1BFID0gJ2NvbnRyb2xsZXInO1xuXG4gIHZhciBzdHlsZXMgPSB7XG4gICAgU1RZTEVfU0NPUEVfQVRUUklCVVRFOiBTVFlMRV9TQ09QRV9BVFRSSUJVVEUsXG4gICAgLyoqXG4gICAgICogSW5zdGFsbHMgZXh0ZXJuYWwgc3R5bGVzaGVldHMgYW5kIDxzdHlsZT4gZWxlbWVudHMgd2l0aCB0aGUgYXR0cmlidXRlXG4gICAgICogcG9seW1lci1zY29wZT0nY29udHJvbGxlcicgaW50byB0aGUgc2NvcGUgb2YgZWxlbWVudC4gVGhpcyBpcyBpbnRlbmRlZFxuICAgICAqIHRvIGJlIGEgY2FsbGVkIGR1cmluZyBjdXN0b20gZWxlbWVudCBjb25zdHJ1Y3Rpb24uXG4gICAgKi9cbiAgICBpbnN0YWxsQ29udHJvbGxlclN0eWxlczogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBhcHBseSBjb250cm9sbGVyIHN0eWxlcywgYnV0IG9ubHkgaWYgdGhleSBhcmUgbm90IHlldCBhcHBsaWVkXG4gICAgICB2YXIgc2NvcGUgPSB0aGlzLmZpbmRTdHlsZVNjb3BlKCk7XG4gICAgICBpZiAoc2NvcGUgJiYgIXRoaXMuc2NvcGVIYXNOYW1lZFN0eWxlKHNjb3BlLCB0aGlzLmxvY2FsTmFtZSkpIHtcbiAgICAgICAgLy8gYWxsb3cgaW5oZXJpdGVkIGNvbnRyb2xsZXIgc3R5bGVzXG4gICAgICAgIHZhciBwcm90byA9IGdldFByb3RvdHlwZU9mKHRoaXMpLCBjc3NUZXh0ID0gJyc7XG4gICAgICAgIHdoaWxlIChwcm90byAmJiBwcm90by5lbGVtZW50KSB7XG4gICAgICAgICAgY3NzVGV4dCArPSBwcm90by5lbGVtZW50LmNzc1RleHRGb3JTY29wZShTVFlMRV9DT05UUk9MTEVSX1NDT1BFKTtcbiAgICAgICAgICBwcm90byA9IGdldFByb3RvdHlwZU9mKHByb3RvKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY3NzVGV4dCkge1xuICAgICAgICAgIHRoaXMuaW5zdGFsbFNjb3BlQ3NzVGV4dChjc3NUZXh0LCBzY29wZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGluc3RhbGxTY29wZVN0eWxlOiBmdW5jdGlvbihzdHlsZSwgbmFtZSwgc2NvcGUpIHtcbiAgICAgIHZhciBzY29wZSA9IHNjb3BlIHx8IHRoaXMuZmluZFN0eWxlU2NvcGUoKSwgbmFtZSA9IG5hbWUgfHwgJyc7XG4gICAgICBpZiAoc2NvcGUgJiYgIXRoaXMuc2NvcGVIYXNOYW1lZFN0eWxlKHNjb3BlLCB0aGlzLmxvY2FsTmFtZSArIG5hbWUpKSB7XG4gICAgICAgIHZhciBjc3NUZXh0ID0gJyc7XG4gICAgICAgIGlmIChzdHlsZSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgZm9yICh2YXIgaT0wLCBsPXN0eWxlLmxlbmd0aCwgczsgKGk8bCkgJiYgKHM9c3R5bGVbaV0pOyBpKyspIHtcbiAgICAgICAgICAgIGNzc1RleHQgKz0gcy50ZXh0Q29udGVudCArICdcXG5cXG4nO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjc3NUZXh0ID0gc3R5bGUudGV4dENvbnRlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbnN0YWxsU2NvcGVDc3NUZXh0KGNzc1RleHQsIHNjb3BlLCBuYW1lKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGluc3RhbGxTY29wZUNzc1RleHQ6IGZ1bmN0aW9uKGNzc1RleHQsIHNjb3BlLCBuYW1lKSB7XG4gICAgICBzY29wZSA9IHNjb3BlIHx8IHRoaXMuZmluZFN0eWxlU2NvcGUoKTtcbiAgICAgIG5hbWUgPSBuYW1lIHx8ICcnO1xuICAgICAgaWYgKCFzY29wZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoaGFzU2hhZG93RE9NUG9seWZpbGwpIHtcbiAgICAgICAgY3NzVGV4dCA9IHNoaW1Dc3NUZXh0KGNzc1RleHQsIHNjb3BlLmhvc3QpO1xuICAgICAgfVxuICAgICAgdmFyIHN0eWxlID0gdGhpcy5lbGVtZW50LmNzc1RleHRUb1Njb3BlU3R5bGUoY3NzVGV4dCxcbiAgICAgICAgICBTVFlMRV9DT05UUk9MTEVSX1NDT1BFKTtcbiAgICAgIFBvbHltZXIuYXBwbHlTdHlsZVRvU2NvcGUoc3R5bGUsIHNjb3BlKTtcbiAgICAgIC8vIGNhY2hlIHRoYXQgdGhpcyBzdHlsZSBoYXMgYmVlbiBhcHBsaWVkXG4gICAgICB0aGlzLnN0eWxlQ2FjaGVGb3JTY29wZShzY29wZSlbdGhpcy5sb2NhbE5hbWUgKyBuYW1lXSA9IHRydWU7XG4gICAgfSxcbiAgICBmaW5kU3R5bGVTY29wZTogZnVuY3Rpb24obm9kZSkge1xuICAgICAgLy8gZmluZCB0aGUgc2hhZG93IHJvb3QgdGhhdCBjb250YWlucyB0aGlzIGVsZW1lbnRcbiAgICAgIHZhciBuID0gbm9kZSB8fCB0aGlzO1xuICAgICAgd2hpbGUgKG4ucGFyZW50Tm9kZSkge1xuICAgICAgICBuID0gbi5wYXJlbnROb2RlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG47XG4gICAgfSxcbiAgICBzY29wZUhhc05hbWVkU3R5bGU6IGZ1bmN0aW9uKHNjb3BlLCBuYW1lKSB7XG4gICAgICB2YXIgY2FjaGUgPSB0aGlzLnN0eWxlQ2FjaGVGb3JTY29wZShzY29wZSk7XG4gICAgICByZXR1cm4gY2FjaGVbbmFtZV07XG4gICAgfSxcbiAgICBzdHlsZUNhY2hlRm9yU2NvcGU6IGZ1bmN0aW9uKHNjb3BlKSB7XG4gICAgICBpZiAoaGFzU2hhZG93RE9NUG9seWZpbGwpIHtcbiAgICAgICAgdmFyIHNjb3BlTmFtZSA9IHNjb3BlLmhvc3QgPyBzY29wZS5ob3N0LmxvY2FsTmFtZSA6IHNjb3BlLmxvY2FsTmFtZTtcbiAgICAgICAgcmV0dXJuIHBvbHlmaWxsU2NvcGVTdHlsZUNhY2hlW3Njb3BlTmFtZV0gfHwgKHBvbHlmaWxsU2NvcGVTdHlsZUNhY2hlW3Njb3BlTmFtZV0gPSB7fSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc2NvcGUuX3Njb3BlU3R5bGVzID0gKHNjb3BlLl9zY29wZVN0eWxlcyB8fCB7fSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHZhciBwb2x5ZmlsbFNjb3BlU3R5bGVDYWNoZSA9IHt9O1xuXG4gIC8vIE5PVEU6IHVzZSByYXcgcHJvdG90eXBlIHRyYXZlcnNhbCBzbyB0aGF0IHdlIGVuc3VyZSBjb3JyZWN0IHRyYXZlcnNhbFxuICAvLyBvbiBwbGF0Zm9ybXMgd2hlcmUgdGhlIHByb3RveXBlIGNoYWluIGlzIHNpbXVsYXRlZCB2aWEgX19wcm90b19fIChJRTEwKVxuICBmdW5jdGlvbiBnZXRQcm90b3R5cGVPZihwcm90b3R5cGUpIHtcbiAgICByZXR1cm4gcHJvdG90eXBlLl9fcHJvdG9fXztcbiAgfVxuXG4gIGZ1bmN0aW9uIHNoaW1Dc3NUZXh0KGNzc1RleHQsIGhvc3QpIHtcbiAgICB2YXIgbmFtZSA9ICcnLCBpcyA9IGZhbHNlO1xuICAgIGlmIChob3N0KSB7XG4gICAgICBuYW1lID0gaG9zdC5sb2NhbE5hbWU7XG4gICAgICBpcyA9IGhvc3QuaGFzQXR0cmlidXRlKCdpcycpO1xuICAgIH1cbiAgICB2YXIgc2VsZWN0b3IgPSBXZWJDb21wb25lbnRzLlNoYWRvd0NTUy5tYWtlU2NvcGVTZWxlY3RvcihuYW1lLCBpcyk7XG4gICAgcmV0dXJuIFdlYkNvbXBvbmVudHMuU2hhZG93Q1NTLnNoaW1Dc3NUZXh0KGNzc1RleHQsIHNlbGVjdG9yKTtcbiAgfVxuXG4gIC8vIGV4cG9ydHNcblxuICBzY29wZS5hcGkuaW5zdGFuY2Uuc3R5bGVzID0gc3R5bGVzO1xuXG59KShQb2x5bWVyKTtcblxuKGZ1bmN0aW9uKHNjb3BlKSB7XG5cbiAgLy8gaW1wb3J0c1xuXG4gIHZhciBleHRlbmQgPSBzY29wZS5leHRlbmQ7XG4gIHZhciBhcGkgPSBzY29wZS5hcGk7XG5cbiAgLy8gaW1wZXJhdGl2ZSBpbXBsZW1lbnRhdGlvbjogUG9seW1lcigpXG5cbiAgLy8gc3BlY2lmeSBhbiAnb3duJyBwcm90b3R5cGUgZm9yIHRhZyBgbmFtZWBcbiAgZnVuY3Rpb24gZWxlbWVudChuYW1lLCBwcm90b3R5cGUpIHtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB2YXIgc2NyaXB0ID0gcHJvdG90eXBlIHx8IGRvY3VtZW50Ll9jdXJyZW50U2NyaXB0O1xuICAgICAgcHJvdG90eXBlID0gbmFtZTtcbiAgICAgIG5hbWUgPSBzY3JpcHQgJiYgc2NyaXB0LnBhcmVudE5vZGUgJiYgc2NyaXB0LnBhcmVudE5vZGUuZ2V0QXR0cmlidXRlID9cbiAgICAgICAgICBzY3JpcHQucGFyZW50Tm9kZS5nZXRBdHRyaWJ1dGUoJ25hbWUnKSA6ICcnO1xuICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgIHRocm93ICdFbGVtZW50IG5hbWUgY291bGQgbm90IGJlIGluZmVycmVkLic7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChnZXRSZWdpc3RlcmVkUHJvdG90eXBlKG5hbWUpKSB7XG4gICAgICB0aHJvdyAnQWxyZWFkeSByZWdpc3RlcmVkIChQb2x5bWVyKSBwcm90b3R5cGUgZm9yIGVsZW1lbnQgJyArIG5hbWU7XG4gICAgfVxuICAgIC8vIGNhY2hlIHRoZSBwcm90b3R5cGVcbiAgICByZWdpc3RlclByb3RvdHlwZShuYW1lLCBwcm90b3R5cGUpO1xuICAgIC8vIG5vdGlmeSB0aGUgcmVnaXN0cmFyIHdhaXRpbmcgZm9yICduYW1lJywgaWYgYW55XG4gICAgbm90aWZ5UHJvdG90eXBlKG5hbWUpO1xuICB9XG5cbiAgLy8gYXN5bmMgcHJvdG90eXBlIHNvdXJjZVxuXG4gIGZ1bmN0aW9uIHdhaXRpbmdGb3JQcm90b3R5cGUobmFtZSwgY2xpZW50KSB7XG4gICAgd2FpdFByb3RvdHlwZVtuYW1lXSA9IGNsaWVudDtcbiAgfVxuXG4gIHZhciB3YWl0UHJvdG90eXBlID0ge307XG5cbiAgZnVuY3Rpb24gbm90aWZ5UHJvdG90eXBlKG5hbWUpIHtcbiAgICBpZiAod2FpdFByb3RvdHlwZVtuYW1lXSkge1xuICAgICAgd2FpdFByb3RvdHlwZVtuYW1lXS5yZWdpc3RlcldoZW5SZWFkeSgpO1xuICAgICAgZGVsZXRlIHdhaXRQcm90b3R5cGVbbmFtZV07XG4gICAgfVxuICB9XG5cbiAgLy8gdXRpbGl0eSBhbmQgYm9va2tlZXBpbmdcblxuICAvLyBtYXBzIHRhZyBuYW1lcyB0byBwcm90b3R5cGVzLCBhcyByZWdpc3RlcmVkIHdpdGhcbiAgLy8gUG9seW1lci4gUHJvdG90eXBlcyBhc3NvY2lhdGVkIHdpdGggYSB0YWcgbmFtZVxuICAvLyB1c2luZyBkb2N1bWVudC5yZWdpc3RlckVsZW1lbnQgYXJlIGF2YWlsYWJsZSBmcm9tXG4gIC8vIEhUTUxFbGVtZW50LmdldFByb3RvdHlwZUZvclRhZygpLlxuICAvLyBJZiBhbiBlbGVtZW50IHdhcyBmdWxseSByZWdpc3RlcmVkIGJ5IFBvbHltZXIsIHRoZW5cbiAgLy8gUG9seW1lci5nZXRSZWdpc3RlcmVkUHJvdG90eXBlKG5hbWUpID09PVxuICAvLyAgIEhUTUxFbGVtZW50LmdldFByb3RvdHlwZUZvclRhZyhuYW1lKVxuXG4gIHZhciBwcm90b3R5cGVzQnlOYW1lID0ge307XG5cbiAgZnVuY3Rpb24gcmVnaXN0ZXJQcm90b3R5cGUobmFtZSwgcHJvdG90eXBlKSB7XG4gICAgcmV0dXJuIHByb3RvdHlwZXNCeU5hbWVbbmFtZV0gPSBwcm90b3R5cGUgfHwge307XG4gIH1cblxuICBmdW5jdGlvbiBnZXRSZWdpc3RlcmVkUHJvdG90eXBlKG5hbWUpIHtcbiAgICByZXR1cm4gcHJvdG90eXBlc0J5TmFtZVtuYW1lXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluc3RhbmNlT2ZUeXBlKGVsZW1lbnQsIHR5cGUpIHtcbiAgICBpZiAodHlwZW9mIHR5cGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciBwcm90byA9IEhUTUxFbGVtZW50LmdldFByb3RvdHlwZUZvclRhZyh0eXBlKTtcbiAgICB2YXIgY3RvciA9IHByb3RvICYmIHByb3RvLmNvbnN0cnVjdG9yO1xuICAgIGlmICghY3Rvcikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoQ3VzdG9tRWxlbWVudHMuaW5zdGFuY2VvZikge1xuICAgICAgcmV0dXJuIEN1c3RvbUVsZW1lbnRzLmluc3RhbmNlb2YoZWxlbWVudCwgY3Rvcik7XG4gICAgfVxuICAgIHJldHVybiBlbGVtZW50IGluc3RhbmNlb2YgY3RvcjtcbiAgfVxuXG4gIC8vIGV4cG9ydHNcblxuICBzY29wZS5nZXRSZWdpc3RlcmVkUHJvdG90eXBlID0gZ2V0UmVnaXN0ZXJlZFByb3RvdHlwZTtcbiAgc2NvcGUud2FpdGluZ0ZvclByb3RvdHlwZSA9IHdhaXRpbmdGb3JQcm90b3R5cGU7XG4gIHNjb3BlLmluc3RhbmNlT2ZUeXBlID0gaW5zdGFuY2VPZlR5cGU7XG5cbiAgLy8gbmFtZXNwYWNlIHNoZW5hbmlnYW5zIHNvIHdlIGNhbiBleHBvc2Ugb3VyIHNjb3BlIG9uIHRoZSByZWdpc3RyYXRpb25cbiAgLy8gZnVuY3Rpb25cblxuICAvLyBtYWtlIHdpbmRvdy5Qb2x5bWVyIHJlZmVyZW5jZSBgZWxlbWVudCgpYFxuXG4gIHdpbmRvdy5Qb2x5bWVyID0gZWxlbWVudDtcblxuICAvLyBUT0RPKHNqbWlsZXMpOiBmaW5kIGEgd2F5IHRvIGRvIHRoaXMgdGhhdCBpcyBsZXNzIHRlcnJpYmxlXG4gIC8vIGNvcHkgd2luZG93LlBvbHltZXIgcHJvcGVydGllcyBvbnRvIGBlbGVtZW50KClgXG5cbiAgZXh0ZW5kKFBvbHltZXIsIHNjb3BlKTtcblxuICAvLyBVbmRlciB0aGUgSFRNTEltcG9ydHMgcG9seWZpbGwsIHNjcmlwdHMgaW4gdGhlIG1haW4gZG9jdW1lbnRcbiAgLy8gZG8gbm90IGJsb2NrIG9uIGltcG9ydHM7IHdlIHdhbnQgdG8gYWxsb3cgY2FsbHMgdG8gUG9seW1lciBpbiB0aGUgbWFpblxuICAvLyBkb2N1bWVudC4gV2ViQ29tcG9uZW50cyBjb2xsZWN0cyB0aG9zZSBjYWxscyB1bnRpbCB3ZSBjYW4gcHJvY2VzcyB0aGVtLCB3aGljaFxuICAvLyB3ZSBkbyBoZXJlLlxuXG4gIGlmIChXZWJDb21wb25lbnRzLmNvbnN1bWVEZWNsYXJhdGlvbnMpIHtcbiAgICBXZWJDb21wb25lbnRzLmNvbnN1bWVEZWNsYXJhdGlvbnMoZnVuY3Rpb24oZGVjbGFyYXRpb25zKSB7XG4gICAgICBpZiAoZGVjbGFyYXRpb25zKSB7XG4gICAgICAgIGZvciAodmFyIGk9MCwgbD1kZWNsYXJhdGlvbnMubGVuZ3RoLCBkOyAoaTxsKSAmJiAoZD1kZWNsYXJhdGlvbnNbaV0pOyBpKyspIHtcbiAgICAgICAgICBlbGVtZW50LmFwcGx5KG51bGwsIGQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxufSkoUG9seW1lcik7XG5cbihmdW5jdGlvbihzY29wZSkge1xuXG4vKipcbiAqIEBjbGFzcyBwb2x5bWVyLWJhc2VcbiAqL1xuXG4gLyoqXG4gICogUmVzb2x2ZSBhIHVybCBwYXRoIHRvIGJlIHJlbGF0aXZlIHRvIGEgYGJhc2VgIHVybC4gSWYgdW5zcGVjaWZpZWQsIGBiYXNlYFxuICAqIGRlZmF1bHRzIHRvIHRoZSBlbGVtZW50J3Mgb3duZXJEb2N1bWVudCB1cmwuIENhbiBiZSB1c2VkIHRvIHJlc29sdmVcbiAgKiBwYXRocyBmcm9tIGVsZW1lbnQncyBpbiB0ZW1wbGF0ZXMgbG9hZGVkIGluIEhUTUxJbXBvcnRzIHRvIGJlIHJlbGF0aXZlXG4gICogdG8gdGhlIGRvY3VtZW50IGNvbnRhaW5pbmcgdGhlIGVsZW1lbnQuIFBvbHltZXIgYXV0b21hdGljYWxseSBkb2VzIHRoaXMgZm9yXG4gICogdXJsIGF0dHJpYnV0ZXMgaW4gZWxlbWVudCB0ZW1wbGF0ZXM7IGhvd2V2ZXIsIGlmIGEgdXJsLCBmb3JcbiAgKiBleGFtcGxlLCBjb250YWlucyBhIGJpbmRpbmcsIHRoZW4gYHJlc29sdmVQYXRoYCBjYW4gYmUgdXNlZCB0byBlbnN1cmUgaXQgaXNcbiAgKiByZWxhdGl2ZSB0byB0aGUgZWxlbWVudCBkb2N1bWVudC4gRm9yIGV4YW1wbGUsIGluIGFuIGVsZW1lbnQncyB0ZW1wbGF0ZSxcbiAgKlxuICAqICAgICA8YSBocmVmPVwie3tyZXNvbHZlUGF0aChwYXRoKX19XCI+UmVzb2x2ZWQ8L2E+XG4gICpcbiAgKiBAbWV0aG9kIHJlc29sdmVQYXRoXG4gICogQHBhcmFtIHtTdHJpbmd9IHVybCBVcmwgcGF0aCB0byByZXNvbHZlLlxuICAqIEBwYXJhbSB7U3RyaW5nfSBiYXNlIE9wdGlvbmFsIGJhc2UgdXJsIGFnYWluc3Qgd2hpY2ggdG8gcmVzb2x2ZSwgZGVmYXVsdHNcbiAgKiB0byB0aGUgZWxlbWVudCdzIG93bmVyRG9jdW1lbnQgdXJsLlxuICAqIHJldHVybnMge1N0cmluZ30gcmVzb2x2ZWQgdXJsLlxuICAqL1xuXG52YXIgcGF0aCA9IHtcbiAgcmVzb2x2ZUVsZW1lbnRQYXRoczogZnVuY3Rpb24obm9kZSkge1xuICAgIFBvbHltZXIudXJsUmVzb2x2ZXIucmVzb2x2ZURvbShub2RlKTtcbiAgfSxcbiAgYWRkUmVzb2x2ZVBhdGhBcGk6IGZ1bmN0aW9uKCkge1xuICAgIC8vIGxldCBhc3NldHBhdGggYXR0cmlidXRlIG1vZGlmeSB0aGUgcmVzb2x2ZSBwYXRoXG4gICAgdmFyIGFzc2V0UGF0aCA9IHRoaXMuZ2V0QXR0cmlidXRlKCdhc3NldHBhdGgnKSB8fCAnJztcbiAgICB2YXIgcm9vdCA9IG5ldyBVUkwoYXNzZXRQYXRoLCB0aGlzLm93bmVyRG9jdW1lbnQuYmFzZVVSSSk7XG4gICAgdGhpcy5wcm90b3R5cGUucmVzb2x2ZVBhdGggPSBmdW5jdGlvbih1cmxQYXRoLCBiYXNlKSB7XG4gICAgICB2YXIgdSA9IG5ldyBVUkwodXJsUGF0aCwgYmFzZSB8fCByb290KTtcbiAgICAgIHJldHVybiB1LmhyZWY7XG4gICAgfTtcbiAgfVxufTtcblxuLy8gZXhwb3J0c1xuc2NvcGUuYXBpLmRlY2xhcmF0aW9uLnBhdGggPSBwYXRoO1xuXG59KShQb2x5bWVyKTtcblxuKGZ1bmN0aW9uKHNjb3BlKSB7XG5cbiAgLy8gaW1wb3J0c1xuXG4gIHZhciBsb2cgPSB3aW5kb3cuV2ViQ29tcG9uZW50cyA/IFdlYkNvbXBvbmVudHMuZmxhZ3MubG9nIDoge307XG4gIHZhciBhcGkgPSBzY29wZS5hcGkuaW5zdGFuY2Uuc3R5bGVzO1xuICB2YXIgU1RZTEVfU0NPUEVfQVRUUklCVVRFID0gYXBpLlNUWUxFX1NDT1BFX0FUVFJJQlVURTtcblxuICB2YXIgaGFzU2hhZG93RE9NUG9seWZpbGwgPSB3aW5kb3cuU2hhZG93RE9NUG9seWZpbGw7XG5cbiAgLy8gbWFnaWMgd29yZHNcblxuICB2YXIgU1RZTEVfU0VMRUNUT1IgPSAnc3R5bGUnO1xuICB2YXIgU1RZTEVfTE9BREFCTEVfTUFUQ0ggPSAnQGltcG9ydCc7XG4gIHZhciBTSEVFVF9TRUxFQ1RPUiA9ICdsaW5rW3JlbD1zdHlsZXNoZWV0XSc7XG4gIHZhciBTVFlMRV9HTE9CQUxfU0NPUEUgPSAnZ2xvYmFsJztcbiAgdmFyIFNDT1BFX0FUVFIgPSAncG9seW1lci1zY29wZSc7XG5cbiAgdmFyIHN0eWxlcyA9IHtcbiAgICAvLyByZXR1cm5zIHRydWUgaWYgcmVzb3VyY2VzIGFyZSBsb2FkaW5nXG4gICAgbG9hZFN0eWxlczogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgIHZhciB0ZW1wbGF0ZSA9IHRoaXMuZmV0Y2hUZW1wbGF0ZSgpO1xuICAgICAgdmFyIGNvbnRlbnQgPSB0ZW1wbGF0ZSAmJiB0aGlzLnRlbXBsYXRlQ29udGVudCgpO1xuICAgICAgaWYgKGNvbnRlbnQpIHtcbiAgICAgICAgdGhpcy5jb252ZXJ0U2hlZXRzVG9TdHlsZXMoY29udGVudCk7XG4gICAgICAgIHZhciBzdHlsZXMgPSB0aGlzLmZpbmRMb2FkYWJsZVN0eWxlcyhjb250ZW50KTtcbiAgICAgICAgaWYgKHN0eWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICB2YXIgdGVtcGxhdGVVcmwgPSB0ZW1wbGF0ZS5vd25lckRvY3VtZW50LmJhc2VVUkk7XG4gICAgICAgICAgcmV0dXJuIFBvbHltZXIuc3R5bGVSZXNvbHZlci5sb2FkU3R5bGVzKHN0eWxlcywgdGVtcGxhdGVVcmwsIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBjb252ZXJ0U2hlZXRzVG9TdHlsZXM6IGZ1bmN0aW9uKHJvb3QpIHtcbiAgICAgIHZhciBzJCA9IHJvb3QucXVlcnlTZWxlY3RvckFsbChTSEVFVF9TRUxFQ1RPUik7XG4gICAgICBmb3IgKHZhciBpPTAsIGw9cyQubGVuZ3RoLCBzLCBjOyAoaTxsKSAmJiAocz1zJFtpXSk7IGkrKykge1xuICAgICAgICBjID0gY3JlYXRlU3R5bGVFbGVtZW50KGltcG9ydFJ1bGVGb3JTaGVldChzLCB0aGlzLm93bmVyRG9jdW1lbnQuYmFzZVVSSSksXG4gICAgICAgICAgICB0aGlzLm93bmVyRG9jdW1lbnQpO1xuICAgICAgICB0aGlzLmNvcHlTaGVldEF0dHJpYnV0ZXMoYywgcyk7XG4gICAgICAgIHMucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoYywgcyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBjb3B5U2hlZXRBdHRyaWJ1dGVzOiBmdW5jdGlvbihzdHlsZSwgbGluaykge1xuICAgICAgZm9yICh2YXIgaT0wLCBhJD1saW5rLmF0dHJpYnV0ZXMsIGw9YSQubGVuZ3RoLCBhOyAoYT1hJFtpXSkgJiYgaTxsOyBpKyspIHtcbiAgICAgICAgaWYgKGEubmFtZSAhPT0gJ3JlbCcgJiYgYS5uYW1lICE9PSAnaHJlZicpIHtcbiAgICAgICAgICBzdHlsZS5zZXRBdHRyaWJ1dGUoYS5uYW1lLCBhLnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgZmluZExvYWRhYmxlU3R5bGVzOiBmdW5jdGlvbihyb290KSB7XG4gICAgICB2YXIgbG9hZGFibGVzID0gW107XG4gICAgICBpZiAocm9vdCkge1xuICAgICAgICB2YXIgcyQgPSByb290LnF1ZXJ5U2VsZWN0b3JBbGwoU1RZTEVfU0VMRUNUT1IpO1xuICAgICAgICBmb3IgKHZhciBpPTAsIGw9cyQubGVuZ3RoLCBzOyAoaTxsKSAmJiAocz1zJFtpXSk7IGkrKykge1xuICAgICAgICAgIGlmIChzLnRleHRDb250ZW50Lm1hdGNoKFNUWUxFX0xPQURBQkxFX01BVENIKSkge1xuICAgICAgICAgICAgbG9hZGFibGVzLnB1c2gocyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbG9hZGFibGVzO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogSW5zdGFsbCBleHRlcm5hbCBzdHlsZXNoZWV0cyBsb2FkZWQgaW4gPHBvbHltZXItZWxlbWVudD4gZWxlbWVudHMgaW50byB0aGVcbiAgICAgKiBlbGVtZW50J3MgdGVtcGxhdGUuXG4gICAgICogQHBhcmFtIGVsZW1lbnRFbGVtZW50IFRoZSA8ZWxlbWVudD4gZWxlbWVudCB0byBzdHlsZS5cbiAgICAgKi9cbiAgICBpbnN0YWxsU2hlZXRzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuY2FjaGVTaGVldHMoKTtcbiAgICAgIHRoaXMuY2FjaGVTdHlsZXMoKTtcbiAgICAgIHRoaXMuaW5zdGFsbExvY2FsU2hlZXRzKCk7XG4gICAgICB0aGlzLmluc3RhbGxHbG9iYWxTdHlsZXMoKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhbGwgc2hlZXRzIGZyb20gZWxlbWVudCBhbmQgc3RvcmUgZm9yIGxhdGVyIHVzZS5cbiAgICAgKi9cbiAgICBjYWNoZVNoZWV0czogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNoZWV0cyA9IHRoaXMuZmluZE5vZGVzKFNIRUVUX1NFTEVDVE9SKTtcbiAgICAgIHRoaXMuc2hlZXRzLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgICBpZiAocy5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGNhY2hlU3R5bGVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc3R5bGVzID0gdGhpcy5maW5kTm9kZXMoU1RZTEVfU0VMRUNUT1IgKyAnWycgKyBTQ09QRV9BVFRSICsgJ10nKTtcbiAgICAgIHRoaXMuc3R5bGVzLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgICBpZiAocy5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFRha2VzIGV4dGVybmFsIHN0eWxlc2hlZXRzIGxvYWRlZCBpbiBhbiA8ZWxlbWVudD4gZWxlbWVudCBhbmQgbW92ZXNcbiAgICAgKiB0aGVpciBjb250ZW50IGludG8gYSA8c3R5bGU+IGVsZW1lbnQgaW5zaWRlIHRoZSA8ZWxlbWVudD4ncyB0ZW1wbGF0ZS5cbiAgICAgKiBUaGUgc2hlZXQgaXMgdGhlbiByZW1vdmVkIGZyb20gdGhlIDxlbGVtZW50Pi4gVGhpcyBpcyBkb25lIG9ubHkgc29cbiAgICAgKiB0aGF0IGlmIHRoZSBlbGVtZW50IGlzIGxvYWRlZCBpbiB0aGUgbWFpbiBkb2N1bWVudCwgdGhlIHNoZWV0IGRvZXNcbiAgICAgKiBub3QgYmVjb21lIGFjdGl2ZS5cbiAgICAgKiBOb3RlLCBpZ25vcmVzIHNoZWV0cyB3aXRoIHRoZSBhdHRyaWJ1dGUgJ3BvbHltZXItc2NvcGUnLlxuICAgICAqIEBwYXJhbSBlbGVtZW50RWxlbWVudCBUaGUgPGVsZW1lbnQ+IGVsZW1lbnQgdG8gc3R5bGUuXG4gICAgICovXG4gICAgaW5zdGFsbExvY2FsU2hlZXRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2hlZXRzID0gdGhpcy5zaGVldHMuZmlsdGVyKGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgcmV0dXJuICFzLmhhc0F0dHJpYnV0ZShTQ09QRV9BVFRSKTtcbiAgICAgIH0pO1xuICAgICAgdmFyIGNvbnRlbnQgPSB0aGlzLnRlbXBsYXRlQ29udGVudCgpO1xuICAgICAgaWYgKGNvbnRlbnQpIHtcbiAgICAgICAgdmFyIGNzc1RleHQgPSAnJztcbiAgICAgICAgc2hlZXRzLmZvckVhY2goZnVuY3Rpb24oc2hlZXQpIHtcbiAgICAgICAgICBjc3NUZXh0ICs9IGNzc1RleHRGcm9tU2hlZXQoc2hlZXQpICsgJ1xcbic7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoY3NzVGV4dCkge1xuICAgICAgICAgIHZhciBzdHlsZSA9IGNyZWF0ZVN0eWxlRWxlbWVudChjc3NUZXh0LCB0aGlzLm93bmVyRG9jdW1lbnQpO1xuICAgICAgICAgIGNvbnRlbnQuaW5zZXJ0QmVmb3JlKHN0eWxlLCBjb250ZW50LmZpcnN0Q2hpbGQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBmaW5kTm9kZXM6IGZ1bmN0aW9uKHNlbGVjdG9yLCBtYXRjaGVyKSB7XG4gICAgICB2YXIgbm9kZXMgPSB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpLmFycmF5KCk7XG4gICAgICB2YXIgY29udGVudCA9IHRoaXMudGVtcGxhdGVDb250ZW50KCk7XG4gICAgICBpZiAoY29udGVudCkge1xuICAgICAgICB2YXIgdGVtcGxhdGVOb2RlcyA9IGNvbnRlbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikuYXJyYXkoKTtcbiAgICAgICAgbm9kZXMgPSBub2Rlcy5jb25jYXQodGVtcGxhdGVOb2Rlcyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWF0Y2hlciA/IG5vZGVzLmZpbHRlcihtYXRjaGVyKSA6IG5vZGVzO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogUHJvbW90ZXMgZXh0ZXJuYWwgc3R5bGVzaGVldHMgYW5kIDxzdHlsZT4gZWxlbWVudHMgd2l0aCB0aGUgYXR0cmlidXRlXG4gICAgICogcG9seW1lci1zY29wZT0nZ2xvYmFsJyBpbnRvIGdsb2JhbCBzY29wZS5cbiAgICAgKiBUaGlzIGlzIHBhcnRpY3VsYXJseSB1c2VmdWwgZm9yIGRlZmluaW5nIEBrZXlmcmFtZSBydWxlcyB3aGljaFxuICAgICAqIGN1cnJlbnRseSBkbyBub3QgZnVuY3Rpb24gaW4gc2NvcGVkIG9yIHNoYWRvdyBzdHlsZSBlbGVtZW50cy5cbiAgICAgKiAoU2VlIHdrYi51Zy83MjQ2MilcbiAgICAgKiBAcGFyYW0gZWxlbWVudEVsZW1lbnQgVGhlIDxlbGVtZW50PiBlbGVtZW50IHRvIHN0eWxlLlxuICAgICovXG4gICAgLy8gVE9ETyhzb3J2ZWxsKTogcmVtb3ZlIHdoZW4gd2tiLnVnLzcyNDYyIGlzIGFkZHJlc3NlZC5cbiAgICBpbnN0YWxsR2xvYmFsU3R5bGVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzdHlsZSA9IHRoaXMuc3R5bGVGb3JTY29wZShTVFlMRV9HTE9CQUxfU0NPUEUpO1xuICAgICAgYXBwbHlTdHlsZVRvU2NvcGUoc3R5bGUsIGRvY3VtZW50LmhlYWQpO1xuICAgIH0sXG4gICAgY3NzVGV4dEZvclNjb3BlOiBmdW5jdGlvbihzY29wZURlc2NyaXB0b3IpIHtcbiAgICAgIHZhciBjc3NUZXh0ID0gJyc7XG4gICAgICAvLyBoYW5kbGUgc3R5bGVzaGVldHNcbiAgICAgIHZhciBzZWxlY3RvciA9ICdbJyArIFNDT1BFX0FUVFIgKyAnPScgKyBzY29wZURlc2NyaXB0b3IgKyAnXSc7XG4gICAgICB2YXIgbWF0Y2hlciA9IGZ1bmN0aW9uKHMpIHtcbiAgICAgICAgcmV0dXJuIG1hdGNoZXNTZWxlY3RvcihzLCBzZWxlY3Rvcik7XG4gICAgICB9O1xuICAgICAgdmFyIHNoZWV0cyA9IHRoaXMuc2hlZXRzLmZpbHRlcihtYXRjaGVyKTtcbiAgICAgIHNoZWV0cy5mb3JFYWNoKGZ1bmN0aW9uKHNoZWV0KSB7XG4gICAgICAgIGNzc1RleHQgKz0gY3NzVGV4dEZyb21TaGVldChzaGVldCkgKyAnXFxuXFxuJztcbiAgICAgIH0pO1xuICAgICAgLy8gaGFuZGxlIGNhY2hlZCBzdHlsZSBlbGVtZW50c1xuICAgICAgdmFyIHN0eWxlcyA9IHRoaXMuc3R5bGVzLmZpbHRlcihtYXRjaGVyKTtcbiAgICAgIHN0eWxlcy5mb3JFYWNoKGZ1bmN0aW9uKHN0eWxlKSB7XG4gICAgICAgIGNzc1RleHQgKz0gc3R5bGUudGV4dENvbnRlbnQgKyAnXFxuXFxuJztcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGNzc1RleHQ7XG4gICAgfSxcbiAgICBzdHlsZUZvclNjb3BlOiBmdW5jdGlvbihzY29wZURlc2NyaXB0b3IpIHtcbiAgICAgIHZhciBjc3NUZXh0ID0gdGhpcy5jc3NUZXh0Rm9yU2NvcGUoc2NvcGVEZXNjcmlwdG9yKTtcbiAgICAgIHJldHVybiB0aGlzLmNzc1RleHRUb1Njb3BlU3R5bGUoY3NzVGV4dCwgc2NvcGVEZXNjcmlwdG9yKTtcbiAgICB9LFxuICAgIGNzc1RleHRUb1Njb3BlU3R5bGU6IGZ1bmN0aW9uKGNzc1RleHQsIHNjb3BlRGVzY3JpcHRvcikge1xuICAgICAgaWYgKGNzc1RleHQpIHtcbiAgICAgICAgdmFyIHN0eWxlID0gY3JlYXRlU3R5bGVFbGVtZW50KGNzc1RleHQpO1xuICAgICAgICBzdHlsZS5zZXRBdHRyaWJ1dGUoU1RZTEVfU0NPUEVfQVRUUklCVVRFLCB0aGlzLmdldEF0dHJpYnV0ZSgnbmFtZScpICtcbiAgICAgICAgICAgICctJyArIHNjb3BlRGVzY3JpcHRvcik7XG4gICAgICAgIHJldHVybiBzdHlsZTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gaW1wb3J0UnVsZUZvclNoZWV0KHNoZWV0LCBiYXNlVXJsKSB7XG4gICAgdmFyIGhyZWYgPSBuZXcgVVJMKHNoZWV0LmdldEF0dHJpYnV0ZSgnaHJlZicpLCBiYXNlVXJsKS5ocmVmO1xuICAgIHJldHVybiAnQGltcG9ydCBcXCcnICsgaHJlZiArICdcXCc7JztcbiAgfVxuXG4gIGZ1bmN0aW9uIGFwcGx5U3R5bGVUb1Njb3BlKHN0eWxlLCBzY29wZSkge1xuICAgIGlmIChzdHlsZSkge1xuICAgICAgaWYgKHNjb3BlID09PSBkb2N1bWVudCkge1xuICAgICAgICBzY29wZSA9IGRvY3VtZW50LmhlYWQ7XG4gICAgICB9XG4gICAgICBpZiAoaGFzU2hhZG93RE9NUG9seWZpbGwpIHtcbiAgICAgICAgc2NvcGUgPSBkb2N1bWVudC5oZWFkO1xuICAgICAgfVxuICAgICAgLy8gVE9ETyhzb3J2ZWxsKTogbmVjZXNzYXJ5IGZvciBJRVxuICAgICAgLy8gc2VlIGh0dHBzOi8vY29ubmVjdC5taWNyb3NvZnQuY29tL0lFL2ZlZWRiYWNrL2RldGFpbHMvNzkwMjEyL1xuICAgICAgLy8gY2xvbmluZy1hLXN0eWxlLWVsZW1lbnQtYW5kLWFkZGluZy10by1kb2N1bWVudC1wcm9kdWNlc1xuICAgICAgLy8gLXVuZXhwZWN0ZWQtcmVzdWx0I2RldGFpbHNcbiAgICAgIC8vIHZhciBjbG9uZSA9IHN0eWxlLmNsb25lTm9kZSh0cnVlKTtcbiAgICAgIHZhciBjbG9uZSA9IGNyZWF0ZVN0eWxlRWxlbWVudChzdHlsZS50ZXh0Q29udGVudCk7XG4gICAgICB2YXIgYXR0ciA9IHN0eWxlLmdldEF0dHJpYnV0ZShTVFlMRV9TQ09QRV9BVFRSSUJVVEUpO1xuICAgICAgaWYgKGF0dHIpIHtcbiAgICAgICAgY2xvbmUuc2V0QXR0cmlidXRlKFNUWUxFX1NDT1BFX0FUVFJJQlVURSwgYXR0cik7XG4gICAgICB9XG4gICAgICAvLyBUT0RPKHNvcnZlbGwpOiBwcm9iYWJseSB0b28gYnJpdHRsZTsgdHJ5IHRvIGZpZ3VyZSBvdXRcbiAgICAgIC8vIHdoZXJlIHRvIHB1dCB0aGUgZWxlbWVudC5cbiAgICAgIHZhciByZWZOb2RlID0gc2NvcGUuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gICAgICBpZiAoc2NvcGUgPT09IGRvY3VtZW50LmhlYWQpIHtcbiAgICAgICAgdmFyIHNlbGVjdG9yID0gJ3N0eWxlWycgKyBTVFlMRV9TQ09QRV9BVFRSSUJVVEUgKyAnXSc7XG4gICAgICAgIHZhciBzJCA9IGRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICAgIGlmIChzJC5sZW5ndGgpIHtcbiAgICAgICAgICByZWZOb2RlID0gcyRbcyQubGVuZ3RoLTFdLm5leHRFbGVtZW50U2libGluZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc2NvcGUuaW5zZXJ0QmVmb3JlKGNsb25lLCByZWZOb2RlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVTdHlsZUVsZW1lbnQoY3NzVGV4dCwgc2NvcGUpIHtcbiAgICBzY29wZSA9IHNjb3BlIHx8IGRvY3VtZW50O1xuICAgIHNjb3BlID0gc2NvcGUuY3JlYXRlRWxlbWVudCA/IHNjb3BlIDogc2NvcGUub3duZXJEb2N1bWVudDtcbiAgICB2YXIgc3R5bGUgPSBzY29wZS5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIHN0eWxlLnRleHRDb250ZW50ID0gY3NzVGV4dDtcbiAgICByZXR1cm4gc3R5bGU7XG4gIH1cblxuICBmdW5jdGlvbiBjc3NUZXh0RnJvbVNoZWV0KHNoZWV0KSB7XG4gICAgcmV0dXJuIChzaGVldCAmJiBzaGVldC5fX3Jlc291cmNlKSB8fCAnJztcbiAgfVxuXG4gIGZ1bmN0aW9uIG1hdGNoZXNTZWxlY3Rvcihub2RlLCBpblNlbGVjdG9yKSB7XG4gICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgIHJldHVybiBtYXRjaGVzLmNhbGwobm9kZSwgaW5TZWxlY3Rvcik7XG4gICAgfVxuICB9XG4gIHZhciBwID0gSFRNTEVsZW1lbnQucHJvdG90eXBlO1xuICB2YXIgbWF0Y2hlcyA9IHAubWF0Y2hlcyB8fCBwLm1hdGNoZXNTZWxlY3RvciB8fCBwLndlYmtpdE1hdGNoZXNTZWxlY3RvclxuICAgICAgfHwgcC5tb3pNYXRjaGVzU2VsZWN0b3I7XG5cbiAgLy8gZXhwb3J0c1xuXG4gIHNjb3BlLmFwaS5kZWNsYXJhdGlvbi5zdHlsZXMgPSBzdHlsZXM7XG4gIHNjb3BlLmFwcGx5U3R5bGVUb1Njb3BlID0gYXBwbHlTdHlsZVRvU2NvcGU7XG5cbn0pKFBvbHltZXIpO1xuXG4oZnVuY3Rpb24oc2NvcGUpIHtcblxuICAvLyBpbXBvcnRzXG5cbiAgdmFyIGxvZyA9IHdpbmRvdy5XZWJDb21wb25lbnRzID8gV2ViQ29tcG9uZW50cy5mbGFncy5sb2cgOiB7fTtcbiAgdmFyIGFwaSA9IHNjb3BlLmFwaS5pbnN0YW5jZS5ldmVudHM7XG4gIHZhciBFVkVOVF9QUkVGSVggPSBhcGkuRVZFTlRfUFJFRklYO1xuXG4gIHZhciBtaXhlZENhc2VFdmVudFR5cGVzID0ge307XG4gIFtcbiAgICAnd2Via2l0QW5pbWF0aW9uU3RhcnQnLFxuICAgICd3ZWJraXRBbmltYXRpb25FbmQnLFxuICAgICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcbiAgICAnRE9NRm9jdXNPdXQnLFxuICAgICdET01Gb2N1c0luJyxcbiAgICAnRE9NTW91c2VTY3JvbGwnXG4gIF0uZm9yRWFjaChmdW5jdGlvbihlKSB7XG4gICAgbWl4ZWRDYXNlRXZlbnRUeXBlc1tlLnRvTG93ZXJDYXNlKCldID0gZTtcbiAgfSk7XG5cbiAgLy8gcG9seW1lci1lbGVtZW50IGRlY2xhcmF0aXZlIGFwaTogZXZlbnRzIGZlYXR1cmVcbiAgdmFyIGV2ZW50cyA9IHtcbiAgICBwYXJzZUhvc3RFdmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gb3VyIGRlbGVnYXRlcyBtYXBcbiAgICAgIHZhciBkZWxlZ2F0ZXMgPSB0aGlzLnByb3RvdHlwZS5ldmVudERlbGVnYXRlcztcbiAgICAgIC8vIGV4dHJhY3QgZGF0YSBmcm9tIGF0dHJpYnV0ZXMgaW50byBkZWxlZ2F0ZXNcbiAgICAgIHRoaXMuYWRkQXR0cmlidXRlRGVsZWdhdGVzKGRlbGVnYXRlcyk7XG4gICAgfSxcbiAgICBhZGRBdHRyaWJ1dGVEZWxlZ2F0ZXM6IGZ1bmN0aW9uKGRlbGVnYXRlcykge1xuICAgICAgLy8gZm9yIGVhY2ggYXR0cmlidXRlXG4gICAgICBmb3IgKHZhciBpPTAsIGE7IGE9dGhpcy5hdHRyaWJ1dGVzW2ldOyBpKyspIHtcbiAgICAgICAgLy8gZG9lcyBpdCBoYXZlIG1hZ2ljIG1hcmtlciBpZGVudGlmeWluZyBpdCBhcyBhbiBldmVudCBkZWxlZ2F0ZT9cbiAgICAgICAgaWYgKHRoaXMuaGFzRXZlbnRQcmVmaXgoYS5uYW1lKSkge1xuICAgICAgICAgIC8vIGlmIHNvLCBhZGQgdGhlIGluZm8gdG8gZGVsZWdhdGVzXG4gICAgICAgICAgZGVsZWdhdGVzW3RoaXMucmVtb3ZlRXZlbnRQcmVmaXgoYS5uYW1lKV0gPSBhLnZhbHVlLnJlcGxhY2UoJ3t7JywgJycpXG4gICAgICAgICAgICAgIC5yZXBsYWNlKCd9fScsICcnKS50cmltKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIC8vIHN0YXJ0cyB3aXRoICdvbi0nXG4gICAgaGFzRXZlbnRQcmVmaXg6IGZ1bmN0aW9uIChuKSB7XG4gICAgICByZXR1cm4gbiAmJiAoblswXSA9PT0gJ28nKSAmJiAoblsxXSA9PT0gJ24nKSAmJiAoblsyXSA9PT0gJy0nKTtcbiAgICB9LFxuICAgIHJlbW92ZUV2ZW50UHJlZml4OiBmdW5jdGlvbihuKSB7XG4gICAgICByZXR1cm4gbi5zbGljZShwcmVmaXhMZW5ndGgpO1xuICAgIH0sXG4gICAgZmluZENvbnRyb2xsZXI6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIHdoaWxlIChub2RlLnBhcmVudE5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUuZXZlbnRDb250cm9sbGVyKSB7XG4gICAgICAgICAgcmV0dXJuIG5vZGUuZXZlbnRDb250cm9sbGVyO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICB9XG4gICAgICByZXR1cm4gbm9kZS5ob3N0O1xuICAgIH0sXG4gICAgZ2V0RXZlbnRIYW5kbGVyOiBmdW5jdGlvbihjb250cm9sbGVyLCB0YXJnZXQsIG1ldGhvZCkge1xuICAgICAgdmFyIGV2ZW50cyA9IHRoaXM7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoIWNvbnRyb2xsZXIgfHwgIWNvbnRyb2xsZXIuUG9seW1lckJhc2UpIHtcbiAgICAgICAgICBjb250cm9sbGVyID0gZXZlbnRzLmZpbmRDb250cm9sbGVyKHRhcmdldCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYXJncyA9IFtlLCBlLmRldGFpbCwgZS5jdXJyZW50VGFyZ2V0XTtcbiAgICAgICAgY29udHJvbGxlci5kaXNwYXRjaE1ldGhvZChjb250cm9sbGVyLCBtZXRob2QsIGFyZ3MpO1xuICAgICAgfTtcbiAgICB9LFxuICAgIHByZXBhcmVFdmVudEJpbmRpbmc6IGZ1bmN0aW9uKHBhdGhTdHJpbmcsIG5hbWUsIG5vZGUpIHtcbiAgICAgIGlmICghdGhpcy5oYXNFdmVudFByZWZpeChuYW1lKSlcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICB2YXIgZXZlbnRUeXBlID0gdGhpcy5yZW1vdmVFdmVudFByZWZpeChuYW1lKTtcbiAgICAgIGV2ZW50VHlwZSA9IG1peGVkQ2FzZUV2ZW50VHlwZXNbZXZlbnRUeXBlXSB8fCBldmVudFR5cGU7XG5cbiAgICAgIHZhciBldmVudHMgPSB0aGlzO1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24obW9kZWwsIG5vZGUsIG9uZVRpbWUpIHtcbiAgICAgICAgdmFyIGhhbmRsZXIgPSBldmVudHMuZ2V0RXZlbnRIYW5kbGVyKHVuZGVmaW5lZCwgbm9kZSwgcGF0aFN0cmluZyk7XG4gICAgICAgIFBvbHltZXJHZXN0dXJlcy5hZGRFdmVudExpc3RlbmVyKG5vZGUsIGV2ZW50VHlwZSwgaGFuZGxlcik7XG5cbiAgICAgICAgaWYgKG9uZVRpbWUpXG4gICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIC8vIFRPRE8ocmFmYWVsdyk6IFRoaXMgaXMgcmVhbGx5IHBvaW50bGVzcyB3b3JrLiBBc2lkZSBmcm9tIHRoZSBjb3N0XG4gICAgICAgIC8vIG9mIHRoZXNlIGFsbG9jYXRpb25zLCBOb2RlQmluZCBpcyBnb2luZyB0byBzZXRBdHRyaWJ1dGUgYmFjayB0byBpdHNcbiAgICAgICAgLy8gY3VycmVudCB2YWx1ZS4gRml4aW5nIHRoaXMgd291bGQgbWVhbiBjaGFuZ2luZyB0aGUgVGVtcGxhdGVCaW5kaW5nXG4gICAgICAgIC8vIGJpbmRpbmcgZGVsZWdhdGUgQVBJLlxuICAgICAgICBmdW5jdGlvbiBiaW5kaW5nVmFsdWUoKSB7XG4gICAgICAgICAgcmV0dXJuICd7eyAnICsgcGF0aFN0cmluZyArICcgfX0nO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBvcGVuOiBiaW5kaW5nVmFsdWUsXG4gICAgICAgICAgZGlzY2FyZENoYW5nZXM6IGJpbmRpbmdWYWx1ZSxcbiAgICAgICAgICBjbG9zZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBQb2x5bWVyR2VzdHVyZXMucmVtb3ZlRXZlbnRMaXN0ZW5lcihub2RlLCBldmVudFR5cGUsIGhhbmRsZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH07XG4gICAgfVxuICB9O1xuXG4gIHZhciBwcmVmaXhMZW5ndGggPSBFVkVOVF9QUkVGSVgubGVuZ3RoO1xuXG4gIC8vIGV4cG9ydHNcbiAgc2NvcGUuYXBpLmRlY2xhcmF0aW9uLmV2ZW50cyA9IGV2ZW50cztcblxufSkoUG9seW1lcik7XG5cbihmdW5jdGlvbihzY29wZSkge1xuXG4gIC8vIGVsZW1lbnQgYXBpXG5cbiAgdmFyIG9ic2VydmF0aW9uQmxhY2tsaXN0ID0gWydhdHRyaWJ1dGUnXTtcblxuICB2YXIgcHJvcGVydGllcyA9IHtcbiAgICBpbmZlck9ic2VydmVyczogZnVuY3Rpb24ocHJvdG90eXBlKSB7XG4gICAgICAvLyBjYWxsZWQgYmVmb3JlIHByb3RvdHlwZS5vYnNlcnZlIGlzIGNoYWluZWQgdG8gaW5oZXJpdGVkIG9iamVjdFxuICAgICAgdmFyIG9ic2VydmUgPSBwcm90b3R5cGUub2JzZXJ2ZSwgcHJvcGVydHk7XG4gICAgICBmb3IgKHZhciBuIGluIHByb3RvdHlwZSkge1xuICAgICAgICBpZiAobi5zbGljZSgtNykgPT09ICdDaGFuZ2VkJykge1xuICAgICAgICAgIHByb3BlcnR5ID0gbi5zbGljZSgwLCAtNyk7XG4gICAgICAgICAgaWYgKHRoaXMuY2FuT2JzZXJ2ZVByb3BlcnR5KHByb3BlcnR5KSkge1xuICAgICAgICAgICAgaWYgKCFvYnNlcnZlKSB7XG4gICAgICAgICAgICAgIG9ic2VydmUgID0gKHByb3RvdHlwZS5vYnNlcnZlID0ge30pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2JzZXJ2ZVtwcm9wZXJ0eV0gPSBvYnNlcnZlW3Byb3BlcnR5XSB8fCBuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgY2FuT2JzZXJ2ZVByb3BlcnR5OiBmdW5jdGlvbihwcm9wZXJ0eSkge1xuICAgICAgcmV0dXJuIChvYnNlcnZhdGlvbkJsYWNrbGlzdC5pbmRleE9mKHByb3BlcnR5KSA8IDApO1xuICAgIH0sXG4gICAgZXhwbG9kZU9ic2VydmVyczogZnVuY3Rpb24ocHJvdG90eXBlKSB7XG4gICAgICAvLyBjYWxsZWQgYmVmb3JlIHByb3RvdHlwZS5vYnNlcnZlIGlzIGNoYWluZWQgdG8gaW5oZXJpdGVkIG9iamVjdFxuICAgICAgdmFyIG8gPSBwcm90b3R5cGUub2JzZXJ2ZTtcbiAgICAgIGlmIChvKSB7XG4gICAgICAgIHZhciBleHBsb2RlZCA9IHt9O1xuICAgICAgICBmb3IgKHZhciBuIGluIG8pIHtcbiAgICAgICAgICB2YXIgbmFtZXMgPSBuLnNwbGl0KCcgJyk7XG4gICAgICAgICAgZm9yICh2YXIgaT0wLCBuaTsgbmk9bmFtZXNbaV07IGkrKykge1xuICAgICAgICAgICAgZXhwbG9kZWRbbmldID0gb1tuXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHJvdG90eXBlLm9ic2VydmUgPSBleHBsb2RlZDtcbiAgICAgIH1cbiAgICB9LFxuICAgIG9wdGltaXplUHJvcGVydHlNYXBzOiBmdW5jdGlvbihwcm90b3R5cGUpIHtcbiAgICAgIGlmIChwcm90b3R5cGUub2JzZXJ2ZSkge1xuICAgICAgICAvLyBjb25zdHJ1Y3QgbmFtZSBsaXN0XG4gICAgICAgIHZhciBhID0gcHJvdG90eXBlLl9vYnNlcnZlTmFtZXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgbiBpbiBwcm90b3R5cGUub2JzZXJ2ZSkge1xuICAgICAgICAgIHZhciBuYW1lcyA9IG4uc3BsaXQoJyAnKTtcbiAgICAgICAgICBmb3IgKHZhciBpPTAsIG5pOyBuaT1uYW1lc1tpXTsgaSsrKSB7XG4gICAgICAgICAgICBhLnB1c2gobmkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHByb3RvdHlwZS5wdWJsaXNoKSB7XG4gICAgICAgIC8vIGNvbnN0cnVjdCBuYW1lIGxpc3RcbiAgICAgICAgdmFyIGEgPSBwcm90b3R5cGUuX3B1Ymxpc2hOYW1lcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBuIGluIHByb3RvdHlwZS5wdWJsaXNoKSB7XG4gICAgICAgICAgYS5wdXNoKG4pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAocHJvdG90eXBlLmNvbXB1dGVkKSB7XG4gICAgICAgIC8vIGNvbnN0cnVjdCBuYW1lIGxpc3RcbiAgICAgICAgdmFyIGEgPSBwcm90b3R5cGUuX2NvbXB1dGVkTmFtZXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgbiBpbiBwcm90b3R5cGUuY29tcHV0ZWQpIHtcbiAgICAgICAgICBhLnB1c2gobik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHB1Ymxpc2hQcm9wZXJ0aWVzOiBmdW5jdGlvbihwcm90b3R5cGUsIGJhc2UpIHtcbiAgICAgIC8vIGlmIHdlIGhhdmUgYW55IHByb3BlcnRpZXMgdG8gcHVibGlzaFxuICAgICAgdmFyIHB1Ymxpc2ggPSBwcm90b3R5cGUucHVibGlzaDtcbiAgICAgIGlmIChwdWJsaXNoKSB7XG4gICAgICAgIC8vIHRyYW5zY3JpYmUgYHB1Ymxpc2hgIGVudHJpZXMgb250byBvd24gcHJvdG90eXBlXG4gICAgICAgIHRoaXMucmVxdWlyZVByb3BlcnRpZXMocHVibGlzaCwgcHJvdG90eXBlLCBiYXNlKTtcbiAgICAgICAgLy8gd2FybiBhbmQgcmVtb3ZlIGFjY2Vzc29yIG5hbWVzIHRoYXQgYXJlIGJyb2tlbiBvbiBzb21lIGJyb3dzZXJzXG4gICAgICAgIHRoaXMuZmlsdGVySW52YWxpZEFjY2Vzc29yTmFtZXMocHVibGlzaCk7XG4gICAgICAgIC8vIGNvbnN0cnVjdCBtYXAgb2YgbG93ZXItY2FzZWQgcHJvcGVydHkgbmFtZXNcbiAgICAgICAgcHJvdG90eXBlLl9wdWJsaXNoTEMgPSB0aGlzLmxvd2VyQ2FzZU1hcChwdWJsaXNoKTtcbiAgICAgIH1cbiAgICAgIHZhciBjb21wdXRlZCA9IHByb3RvdHlwZS5jb21wdXRlZDtcbiAgICAgIGlmIChjb21wdXRlZCkge1xuICAgICAgICAvLyB3YXJuIGFuZCByZW1vdmUgYWNjZXNzb3IgbmFtZXMgdGhhdCBhcmUgYnJva2VuIG9uIHNvbWUgYnJvd3NlcnNcbiAgICAgICAgdGhpcy5maWx0ZXJJbnZhbGlkQWNjZXNzb3JOYW1lcyhjb21wdXRlZCk7XG4gICAgICB9XG4gICAgfSxcbiAgICAvLyBQdWJsaXNoaW5nL2NvbXB1dGluZyBhIHByb3BlcnR5IHdoZXJlIHRoZSBuYW1lIG1pZ2h0IGNvbmZsaWN0IHdpdGggYVxuICAgIC8vIGJyb3dzZXIgcHJvcGVydHkgaXMgbm90IGN1cnJlbnRseSBzdXBwb3J0ZWQgdG8gaGVscCB1c2VycyBvZiBQb2x5bWVyXG4gICAgLy8gYXZvaWQgYnJvd3NlciBidWdzOlxuICAgIC8vXG4gICAgLy8gaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTQzMzk0XG4gICAgLy8gaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTQ5NzM5XG4gICAgLy9cbiAgICAvLyBXZSBjYW4gbGlmdCB0aGlzIHJlc3RyaWN0aW9uIHdoZW4gdGhvc2UgYnVncyBhcmUgZml4ZWQuXG4gICAgZmlsdGVySW52YWxpZEFjY2Vzc29yTmFtZXM6IGZ1bmN0aW9uKHByb3BlcnR5TmFtZXMpIHtcbiAgICAgIGZvciAodmFyIG5hbWUgaW4gcHJvcGVydHlOYW1lcykge1xuICAgICAgICAvLyBDaGVjayBpZiB0aGUgbmFtZSBpcyBpbiBvdXIgYmxhY2tsaXN0LlxuICAgICAgICBpZiAodGhpcy5wcm9wZXJ0eU5hbWVCbGFja2xpc3RbbmFtZV0pIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ0Nhbm5vdCBkZWZpbmUgcHJvcGVydHkgXCInICsgbmFtZSArICdcIiBmb3IgZWxlbWVudCBcIicgK1xuICAgICAgICAgICAgdGhpcy5uYW1lICsgJ1wiIGJlY2F1c2UgaXQgaGFzIHRoZSBzYW1lIG5hbWUgYXMgYW4gSFRNTEVsZW1lbnQgJyArXG4gICAgICAgICAgICAncHJvcGVydHksIGFuZCBub3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgb3ZlcnJpZGluZyB0aGF0LiAnICtcbiAgICAgICAgICAgICdDb25zaWRlciBnaXZpbmcgaXQgYSBkaWZmZXJlbnQgbmFtZS4nKTtcbiAgICAgICAgICAvLyBSZW1vdmUgdGhlIGludmFsaWQgYWNjZXNzb3IgZnJvbSB0aGUgbGlzdC5cbiAgICAgICAgICBkZWxldGUgcHJvcGVydHlOYW1lc1tuYW1lXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgLy9cbiAgICAvLyBgbmFtZTogdmFsdWVgIGVudHJpZXMgaW4gdGhlIGBwdWJsaXNoYCBvYmplY3QgbWF5IG5lZWQgdG8gZ2VuZXJhdGVcbiAgICAvLyBtYXRjaGluZyBwcm9wZXJ0aWVzIG9uIHRoZSBwcm90b3R5cGUuXG4gICAgLy9cbiAgICAvLyBWYWx1ZXMgdGhhdCBhcmUgb2JqZWN0cyBtYXkgaGF2ZSBhIGByZWZsZWN0YCBwcm9wZXJ0eSwgd2hpY2hcbiAgICAvLyBzaWduYWxzIHRoYXQgdGhlIHZhbHVlIGRlc2NyaWJlcyBwcm9wZXJ0eSBjb250cm9sIG1ldGFkYXRhLlxuICAgIC8vIEluIG1ldGFkYXRhIG9iamVjdHMsIHRoZSBwcm90b3R5cGUgZGVmYXVsdCB2YWx1ZSAoaWYgYW55KVxuICAgIC8vIGlzIGVuY29kZWQgaW4gdGhlIGB2YWx1ZWAgcHJvcGVydHkuXG4gICAgLy9cbiAgICAvLyBwdWJsaXNoOiB7XG4gICAgLy8gICBmb286IDUsXG4gICAgLy8gICBiYXI6IHt2YWx1ZTogdHJ1ZSwgcmVmbGVjdDogdHJ1ZX0sXG4gICAgLy8gICB6b3Q6IHt9XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gYHJlZmxlY3RgIG1ldGFkYXRhIHByb3BlcnR5IGNvbnRyb2xzIHdoZXRoZXIgY2hhbmdlcyB0byB0aGUgcHJvcGVydHlcbiAgICAvLyBhcmUgcmVmbGVjdGVkIGJhY2sgdG8gdGhlIGF0dHJpYnV0ZSAoZGVmYXVsdCBmYWxzZSkuXG4gICAgLy9cbiAgICAvLyBBIHZhbHVlIGlzIHN0b3JlZCBvbiB0aGUgcHJvdG90eXBlIHVubGVzcyBpdCdzID09PSBgdW5kZWZpbmVkYCxcbiAgICAvLyBpbiB3aGljaCBjYXNlIHRoZSBiYXNlIGNoYWluIGlzIGNoZWNrZWQgZm9yIGEgdmFsdWUuXG4gICAgLy8gSWYgdGhlIGJhc2FsIHZhbHVlIGlzIGFsc28gdW5kZWZpbmVkLCBgbnVsbGAgaXMgc3RvcmVkIG9uIHRoZSBwcm90b3R5cGUuXG4gICAgLy9cbiAgICAvLyBUaGUgcmVmbGVjdGlvbiBkYXRhIGlzIHN0b3JlZCBvbiBhbm90aGVyIHByb3RvdHlwZSBvYmplY3QsIGByZWZsZWN0YFxuICAgIC8vIHdoaWNoIGFsc28gY2FuIGJlIHNwZWNpZmllZCBkaXJlY3RseS5cbiAgICAvL1xuICAgIC8vIHJlZmxlY3Q6IHtcbiAgICAvLyAgIGZvbzogdHJ1ZVxuICAgIC8vIH1cbiAgICAvL1xuICAgIHJlcXVpcmVQcm9wZXJ0aWVzOiBmdW5jdGlvbihwcm9wZXJ0eUluZm9zLCBwcm90b3R5cGUsIGJhc2UpIHtcbiAgICAgIC8vIHBlci1wcm90b3R5cGUgc3RvcmFnZSBmb3IgcmVmbGVjdGVkIHByb3BlcnRpZXNcbiAgICAgIHByb3RvdHlwZS5yZWZsZWN0ID0gcHJvdG90eXBlLnJlZmxlY3QgfHwge307XG4gICAgICAvLyBlbnN1cmUgYSBwcm90b3R5cGUgdmFsdWUgZm9yIGVhY2ggcHJvcGVydHlcbiAgICAgIC8vIGFuZCB1cGRhdGUgdGhlIHByb3BlcnR5J3MgcmVmbGVjdCB0byBhdHRyaWJ1dGUgc3RhdHVzXG4gICAgICBmb3IgKHZhciBuIGluIHByb3BlcnR5SW5mb3MpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gcHJvcGVydHlJbmZvc1tuXTtcbiAgICAgICAgLy8gdmFsdWUgaGFzIG1ldGFkYXRhIGlmIGl0IGhhcyBhIGByZWZsZWN0YCBwcm9wZXJ0eVxuICAgICAgICBpZiAodmFsdWUgJiYgdmFsdWUucmVmbGVjdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcHJvdG90eXBlLnJlZmxlY3Rbbl0gPSBCb29sZWFuKHZhbHVlLnJlZmxlY3QpO1xuICAgICAgICAgIHZhbHVlID0gdmFsdWUudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gb25seSBzZXQgYSB2YWx1ZSBpZiBvbmUgaXMgc3BlY2lmaWVkXG4gICAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcHJvdG90eXBlW25dID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGxvd2VyQ2FzZU1hcDogZnVuY3Rpb24ocHJvcGVydGllcykge1xuICAgICAgdmFyIG1hcCA9IHt9O1xuICAgICAgZm9yICh2YXIgbiBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICAgIG1hcFtuLnRvTG93ZXJDYXNlKCldID0gbjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXA7XG4gICAgfSxcbiAgICBjcmVhdGVQcm9wZXJ0eUFjY2Vzc29yOiBmdW5jdGlvbihuYW1lLCBpZ25vcmVXcml0ZXMpIHtcbiAgICAgIHZhciBwcm90byA9IHRoaXMucHJvdG90eXBlO1xuXG4gICAgICB2YXIgcHJpdmF0ZU5hbWUgPSBuYW1lICsgJ18nO1xuICAgICAgdmFyIHByaXZhdGVPYnNlcnZhYmxlICA9IG5hbWUgKyAnT2JzZXJ2YWJsZV8nO1xuICAgICAgcHJvdG9bcHJpdmF0ZU5hbWVdID0gcHJvdG9bbmFtZV07XG5cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90bywgbmFtZSwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBvYnNlcnZhYmxlID0gdGhpc1twcml2YXRlT2JzZXJ2YWJsZV07XG4gICAgICAgICAgaWYgKG9ic2VydmFibGUpXG4gICAgICAgICAgICBvYnNlcnZhYmxlLmRlbGl2ZXIoKTtcblxuICAgICAgICAgIHJldHVybiB0aGlzW3ByaXZhdGVOYW1lXTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGlmIChpZ25vcmVXcml0ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzW3ByaXZhdGVOYW1lXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgb2JzZXJ2YWJsZSA9IHRoaXNbcHJpdmF0ZU9ic2VydmFibGVdO1xuICAgICAgICAgIGlmIChvYnNlcnZhYmxlKSB7XG4gICAgICAgICAgICBvYnNlcnZhYmxlLnNldFZhbHVlKHZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgb2xkVmFsdWUgPSB0aGlzW3ByaXZhdGVOYW1lXTtcbiAgICAgICAgICB0aGlzW3ByaXZhdGVOYW1lXSA9IHZhbHVlO1xuICAgICAgICAgIHRoaXMuZW1pdFByb3BlcnR5Q2hhbmdlUmVjb3JkKG5hbWUsIHZhbHVlLCBvbGRWYWx1ZSk7XG5cbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfSxcbiAgICBjcmVhdGVQcm9wZXJ0eUFjY2Vzc29yczogZnVuY3Rpb24ocHJvdG90eXBlKSB7XG4gICAgICB2YXIgbiQgPSBwcm90b3R5cGUuX2NvbXB1dGVkTmFtZXM7XG4gICAgICBpZiAobiQgJiYgbiQubGVuZ3RoKSB7XG4gICAgICAgIGZvciAodmFyIGk9MCwgbD1uJC5sZW5ndGgsIG4sIGZuOyAoaTxsKSAmJiAobj1uJFtpXSk7IGkrKykge1xuICAgICAgICAgIHRoaXMuY3JlYXRlUHJvcGVydHlBY2Nlc3NvcihuLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIG4kID0gcHJvdG90eXBlLl9wdWJsaXNoTmFtZXM7XG4gICAgICBpZiAobiQgJiYgbiQubGVuZ3RoKSB7XG4gICAgICAgIGZvciAodmFyIGk9MCwgbD1uJC5sZW5ndGgsIG4sIGZuOyAoaTxsKSAmJiAobj1uJFtpXSk7IGkrKykge1xuICAgICAgICAgIC8vIElmIHRoZSBwcm9wZXJ0eSBpcyBjb21wdXRlZCBhbmQgcHVibGlzaGVkLCB0aGUgYWNjZXNzb3IgaXMgY3JlYXRlZFxuICAgICAgICAgIC8vIGFib3ZlLlxuICAgICAgICAgIGlmICghcHJvdG90eXBlLmNvbXB1dGVkIHx8ICFwcm90b3R5cGUuY29tcHV0ZWRbbl0pIHtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlUHJvcGVydHlBY2Nlc3NvcihuKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIC8vIFRoaXMgbGlzdCBjb250YWlucyBzb21lIHByb3BlcnR5IG5hbWVzIHRoYXQgcGVvcGxlIGNvbW1vbmx5IHdhbnQgdG8gdXNlLFxuICAgIC8vIGJ1dCB3b24ndCB3b3JrIGJlY2F1c2Ugb2YgQ2hyb21lL1NhZmFyaSBidWdzLiBJdCBpc24ndCBhbiBleGhhdXN0aXZlXG4gICAgLy8gbGlzdC4gSW4gcGFydGljdWxhciBpdCBkb2Vzbid0IGNvbnRhaW4gYW55IHByb3BlcnR5IG5hbWVzIGZvdW5kIG9uXG4gICAgLy8gc3VidHlwZXMgb2YgSFRNTEVsZW1lbnQgKGUuZy4gbmFtZSwgdmFsdWUpLiBSYXRoZXIgaXQgYXR0ZW1wdHMgdG8gY2F0Y2hcbiAgICAvLyBzb21lIGNvbW1vbiBjYXNlcy5cbiAgICBwcm9wZXJ0eU5hbWVCbGFja2xpc3Q6IHtcbiAgICAgIGNoaWxkcmVuOiAxLFxuICAgICAgJ2NsYXNzJzogMSxcbiAgICAgIGlkOiAxLFxuICAgICAgaGlkZGVuOiAxLFxuICAgICAgc3R5bGU6IDEsXG4gICAgICB0aXRsZTogMSxcbiAgICB9XG4gIH07XG5cbiAgLy8gZXhwb3J0c1xuXG4gIHNjb3BlLmFwaS5kZWNsYXJhdGlvbi5wcm9wZXJ0aWVzID0gcHJvcGVydGllcztcblxufSkoUG9seW1lcik7XG5cbihmdW5jdGlvbihzY29wZSkge1xuXG4gIC8vIG1hZ2ljIHdvcmRzXG5cbiAgdmFyIEFUVFJJQlVURVNfQVRUUklCVVRFID0gJ2F0dHJpYnV0ZXMnO1xuICB2YXIgQVRUUklCVVRFU19SRUdFWCA9IC9cXHN8LC87XG5cbiAgLy8gYXR0cmlidXRlcyBhcGlcblxuICB2YXIgYXR0cmlidXRlcyA9IHtcblxuICAgIGluaGVyaXRBdHRyaWJ1dGVzT2JqZWN0czogZnVuY3Rpb24ocHJvdG90eXBlKSB7XG4gICAgICAvLyBjaGFpbiBvdXIgbG93ZXItY2FzZWQgcHVibGlzaCBtYXAgdG8gdGhlIGluaGVyaXRlZCB2ZXJzaW9uXG4gICAgICB0aGlzLmluaGVyaXRPYmplY3QocHJvdG90eXBlLCAncHVibGlzaExDJyk7XG4gICAgICAvLyBjaGFpbiBvdXIgaW5zdGFuY2UgYXR0cmlidXRlcyBtYXAgdG8gdGhlIGluaGVyaXRlZCB2ZXJzaW9uXG4gICAgICB0aGlzLmluaGVyaXRPYmplY3QocHJvdG90eXBlLCAnX2luc3RhbmNlQXR0cmlidXRlcycpO1xuICAgIH0sXG5cbiAgICBwdWJsaXNoQXR0cmlidXRlczogZnVuY3Rpb24ocHJvdG90eXBlLCBiYXNlKSB7XG4gICAgICAvLyBtZXJnZSBuYW1lcyBmcm9tICdhdHRyaWJ1dGVzJyBhdHRyaWJ1dGUgaW50byB0aGUgJ3B1Ymxpc2gnIG9iamVjdFxuICAgICAgdmFyIGF0dHJpYnV0ZXMgPSB0aGlzLmdldEF0dHJpYnV0ZShBVFRSSUJVVEVTX0FUVFJJQlVURSk7XG4gICAgICBpZiAoYXR0cmlidXRlcykge1xuICAgICAgICAvLyBjcmVhdGUgYSBgcHVibGlzaGAgb2JqZWN0IGlmIG5lZWRlZC5cbiAgICAgICAgLy8gdGhlIGBwdWJsaXNoYCBvYmplY3QgaXMgb25seSByZWxldmFudCB0byB0aGlzIHByb3RvdHlwZSwgdGhlXG4gICAgICAgIC8vIHB1Ymxpc2hpbmcgbG9naWMgaW4gYGRlY2xhcmF0aW9uL3Byb3BlcnRpZXMuanNgIGlzIHJlc3BvbnNpYmxlIGZvclxuICAgICAgICAvLyBtYW5hZ2luZyBwcm9wZXJ0eSB2YWx1ZXMgb24gdGhlIHByb3RvdHlwZSBjaGFpbi5cbiAgICAgICAgLy8gVE9ETyhzam1pbGVzKTogdGhlIGBwdWJsaXNoYCBvYmplY3QgaXMgbGF0ZXIgY2hhaW5lZCB0byBpdCdzXG4gICAgICAgIC8vICAgICAgICAgICAgICAgIGFuY2VzdG9yIG9iamVjdCwgcHJlc3VtYWJseSB0aGlzIGlzIG9ubHkgZm9yXG4gICAgICAgIC8vICAgICAgICAgICAgICAgIHJlZmxlY3Rpb24gb3Igb3RoZXIgbm9uLWxpYnJhcnkgdXNlcy5cbiAgICAgICAgdmFyIHB1Ymxpc2ggPSBwcm90b3R5cGUucHVibGlzaCB8fCAocHJvdG90eXBlLnB1Ymxpc2ggPSB7fSk7XG4gICAgICAgIC8vIG5hbWVzPSdhIGIgYycgb3IgbmFtZXM9J2EsYixjJ1xuICAgICAgICB2YXIgbmFtZXMgPSBhdHRyaWJ1dGVzLnNwbGl0KEFUVFJJQlVURVNfUkVHRVgpO1xuICAgICAgICAvLyByZWNvcmQgZWFjaCBuYW1lIGZvciBwdWJsaXNoaW5nXG4gICAgICAgIGZvciAodmFyIGk9MCwgbD1uYW1lcy5sZW5ndGgsIG47IGk8bDsgaSsrKSB7XG4gICAgICAgICAgLy8gcmVtb3ZlIGV4Y2VzcyB3c1xuICAgICAgICAgIG4gPSBuYW1lc1tpXS50cmltKCk7XG4gICAgICAgICAgLy8gbG9va3Mgd2VpcmQsIGJ1dCBjYXVzZXMgbiB0byBleGlzdCBvbiBgcHVibGlzaGAgaWYgaXQgZG9lcyBub3Q7XG4gICAgICAgICAgLy8gYSBtb3JlIGNhcmVmdWwgdGVzdCB3b3VsZCBuZWVkIGV4cGVuc2l2ZSBgaW5gIG9wZXJhdG9yXG4gICAgICAgICAgaWYgKG4gJiYgcHVibGlzaFtuXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBwdWJsaXNoW25dID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyByZWNvcmQgY2xvbmFibGUgYXR0cmlidXRlcyBmcm9tIDxlbGVtZW50PlxuICAgIGFjY3VtdWxhdGVJbnN0YW5jZUF0dHJpYnV0ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gaW5oZXJpdCBpbnN0YW5jZSBhdHRyaWJ1dGVzXG4gICAgICB2YXIgY2xvbmFibGUgPSB0aGlzLnByb3RvdHlwZS5faW5zdGFuY2VBdHRyaWJ1dGVzO1xuICAgICAgLy8gbWVyZ2UgYXR0cmlidXRlcyBmcm9tIGVsZW1lbnRcbiAgICAgIHZhciBhJCA9IHRoaXMuYXR0cmlidXRlcztcbiAgICAgIGZvciAodmFyIGk9MCwgbD1hJC5sZW5ndGgsIGE7IChpPGwpICYmIChhPWEkW2ldKTsgaSsrKSB7XG4gICAgICAgIGlmICh0aGlzLmlzSW5zdGFuY2VBdHRyaWJ1dGUoYS5uYW1lKSkge1xuICAgICAgICAgIGNsb25hYmxlW2EubmFtZV0gPSBhLnZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGlzSW5zdGFuY2VBdHRyaWJ1dGU6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHJldHVybiAhdGhpcy5ibGFja0xpc3RbbmFtZV0gJiYgbmFtZS5zbGljZSgwLDMpICE9PSAnb24tJztcbiAgICB9LFxuXG4gICAgLy8gZG8gbm90IGNsb25lIHRoZXNlIGF0dHJpYnV0ZXMgb250byBpbnN0YW5jZXNcbiAgICBibGFja0xpc3Q6IHtcbiAgICAgIG5hbWU6IDEsXG4gICAgICAnZXh0ZW5kcyc6IDEsXG4gICAgICBjb25zdHJ1Y3RvcjogMSxcbiAgICAgIG5vc2NyaXB0OiAxLFxuICAgICAgYXNzZXRwYXRoOiAxLFxuICAgICAgJ2NhY2hlLWNzc3RleHQnOiAxXG4gICAgfVxuXG4gIH07XG5cbiAgLy8gYWRkIEFUVFJJQlVURVNfQVRUUklCVVRFIHRvIHRoZSBibGFja2xpc3RcbiAgYXR0cmlidXRlcy5ibGFja0xpc3RbQVRUUklCVVRFU19BVFRSSUJVVEVdID0gMTtcblxuICAvLyBleHBvcnRzXG5cbiAgc2NvcGUuYXBpLmRlY2xhcmF0aW9uLmF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzO1xuXG59KShQb2x5bWVyKTtcblxuKGZ1bmN0aW9uKHNjb3BlKSB7XG5cbiAgLy8gaW1wb3J0c1xuICB2YXIgZXZlbnRzID0gc2NvcGUuYXBpLmRlY2xhcmF0aW9uLmV2ZW50cztcblxuICB2YXIgc3ludGF4ID0gbmV3IFBvbHltZXJFeHByZXNzaW9ucygpO1xuICB2YXIgcHJlcGFyZUJpbmRpbmcgPSBzeW50YXgucHJlcGFyZUJpbmRpbmc7XG5cbiAgLy8gUG9seW1lciB0YWtlcyBhIGZpcnN0IGNyYWNrIGF0IHRoZSBiaW5kaW5nIHRvIHNlZSBpZiBpdCdzIGEgZGVjbGFyYXRpdmVcbiAgLy8gZXZlbnQgaGFuZGxlci5cbiAgc3ludGF4LnByZXBhcmVCaW5kaW5nID0gZnVuY3Rpb24ocGF0aFN0cmluZywgbmFtZSwgbm9kZSkge1xuICAgIHJldHVybiBldmVudHMucHJlcGFyZUV2ZW50QmluZGluZyhwYXRoU3RyaW5nLCBuYW1lLCBub2RlKSB8fFxuICAgICAgICAgICBwcmVwYXJlQmluZGluZy5jYWxsKHN5bnRheCwgcGF0aFN0cmluZywgbmFtZSwgbm9kZSk7XG4gIH07XG5cbiAgLy8gZGVjbGFyYXRpb24gYXBpIHN1cHBvcnRpbmcgbWR2XG4gIHZhciBtZHYgPSB7XG4gICAgc3ludGF4OiBzeW50YXgsXG4gICAgZmV0Y2hUZW1wbGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yKCd0ZW1wbGF0ZScpO1xuICAgIH0sXG4gICAgdGVtcGxhdGVDb250ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0ZW1wbGF0ZSA9IHRoaXMuZmV0Y2hUZW1wbGF0ZSgpO1xuICAgICAgcmV0dXJuIHRlbXBsYXRlICYmIHRlbXBsYXRlLmNvbnRlbnQ7XG4gICAgfSxcbiAgICBpbnN0YWxsQmluZGluZ0RlbGVnYXRlOiBmdW5jdGlvbih0ZW1wbGF0ZSkge1xuICAgICAgaWYgKHRlbXBsYXRlKSB7XG4gICAgICAgIHRlbXBsYXRlLmJpbmRpbmdEZWxlZ2F0ZSA9IHRoaXMuc3ludGF4O1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvLyBleHBvcnRzXG4gIHNjb3BlLmFwaS5kZWNsYXJhdGlvbi5tZHYgPSBtZHY7XG5cbn0pKFBvbHltZXIpO1xuXG4oZnVuY3Rpb24oc2NvcGUpIHtcblxuICAvLyBpbXBvcnRzXG5cbiAgdmFyIGFwaSA9IHNjb3BlLmFwaTtcbiAgdmFyIGlzQmFzZSA9IHNjb3BlLmlzQmFzZTtcbiAgdmFyIGV4dGVuZCA9IHNjb3BlLmV4dGVuZDtcblxuICB2YXIgaGFzU2hhZG93RE9NUG9seWZpbGwgPSB3aW5kb3cuU2hhZG93RE9NUG9seWZpbGw7XG5cbiAgLy8gcHJvdG90eXBlIGFwaVxuXG4gIHZhciBwcm90b3R5cGUgPSB7XG5cbiAgICByZWdpc3RlcjogZnVuY3Rpb24obmFtZSwgZXh0ZW5kZWVOYW1lKSB7XG4gICAgICAvLyBidWlsZCBwcm90b3R5cGUgY29tYmluaW5nIGV4dGVuZGVlLCBQb2x5bWVyIGJhc2UsIGFuZCBuYW1lZCBhcGlcbiAgICAgIHRoaXMuYnVpbGRQcm90b3R5cGUobmFtZSwgZXh0ZW5kZWVOYW1lKTtcbiAgICAgIC8vIHJlZ2lzdGVyIG91ciBjdXN0b20gZWxlbWVudCB3aXRoIHRoZSBwbGF0Zm9ybVxuICAgICAgdGhpcy5yZWdpc3RlclByb3RvdHlwZShuYW1lLCBleHRlbmRlZU5hbWUpO1xuICAgICAgLy8gcmVmZXJlbmNlIGNvbnN0cnVjdG9yIGluIGEgZ2xvYmFsIG5hbWVkIGJ5ICdjb25zdHJ1Y3RvcicgYXR0cmlidXRlXG4gICAgICB0aGlzLnB1Ymxpc2hDb25zdHJ1Y3RvcigpO1xuICAgIH0sXG5cbiAgICBidWlsZFByb3RvdHlwZTogZnVuY3Rpb24obmFtZSwgZXh0ZW5kZWVOYW1lKSB7XG4gICAgICAvLyBnZXQgb3VyIGN1c3RvbSBwcm90b3R5cGUgKGJlZm9yZSBjaGFpbmluZylcbiAgICAgIHZhciBleHRlbnNpb24gPSBzY29wZS5nZXRSZWdpc3RlcmVkUHJvdG90eXBlKG5hbWUpO1xuICAgICAgLy8gZ2V0IGJhc2FsIHByb3RvdHlwZVxuICAgICAgdmFyIGJhc2UgPSB0aGlzLmdlbmVyYXRlQmFzZVByb3RvdHlwZShleHRlbmRlZU5hbWUpO1xuICAgICAgLy8gaW1wbGVtZW50IGRlY2xhcmF0aXZlIGZlYXR1cmVzXG4gICAgICB0aGlzLmRlc3VnYXJCZWZvcmVDaGFpbmluZyhleHRlbnNpb24sIGJhc2UpO1xuICAgICAgLy8gam9pbiBwcm90b3R5cGVzXG4gICAgICB0aGlzLnByb3RvdHlwZSA9IHRoaXMuY2hhaW5Qcm90b3R5cGVzKGV4dGVuc2lvbiwgYmFzZSk7XG4gICAgICAvLyBtb3JlIGRlY2xhcmF0aXZlIGZlYXR1cmVzXG4gICAgICB0aGlzLmRlc3VnYXJBZnRlckNoYWluaW5nKG5hbWUsIGV4dGVuZGVlTmFtZSk7XG4gICAgfSxcblxuICAgIGRlc3VnYXJCZWZvcmVDaGFpbmluZzogZnVuY3Rpb24ocHJvdG90eXBlLCBiYXNlKSB7XG4gICAgICAvLyBiYWNrIHJlZmVyZW5jZSBkZWNsYXJhdGlvbiBlbGVtZW50XG4gICAgICAvLyBUT0RPKHNqbWlsZXMpOiByZXBsYWNlIGBlbGVtZW50YCB3aXRoIGBlbGVtZW50RWxlbWVudGAgb3IgYGRlY2xhcmF0aW9uYFxuICAgICAgcHJvdG90eXBlLmVsZW1lbnQgPSB0aGlzO1xuICAgICAgLy8gdHJhbnNjcmliZSBgYXR0cmlidXRlc2AgZGVjbGFyYXRpb25zIG9udG8gb3duIHByb3RvdHlwZSdzIGBwdWJsaXNoYFxuICAgICAgdGhpcy5wdWJsaXNoQXR0cmlidXRlcyhwcm90b3R5cGUsIGJhc2UpO1xuICAgICAgLy8gYHB1Ymxpc2hgIHByb3BlcnRpZXMgdG8gdGhlIHByb3RvdHlwZSBhbmQgdG8gYXR0cmlidXRlIHdhdGNoXG4gICAgICB0aGlzLnB1Ymxpc2hQcm9wZXJ0aWVzKHByb3RvdHlwZSwgYmFzZSk7XG4gICAgICAvLyBpbmZlciBvYnNlcnZlcnMgZm9yIGBvYnNlcnZlYCBsaXN0IGJhc2VkIG9uIG1ldGhvZCBuYW1lc1xuICAgICAgdGhpcy5pbmZlck9ic2VydmVycyhwcm90b3R5cGUpO1xuICAgICAgLy8gZGVzdWdhciBjb21wb3VuZCBvYnNlcnZlciBzeW50YXgsIGUuZy4gJ2EgYiBjJ1xuICAgICAgdGhpcy5leHBsb2RlT2JzZXJ2ZXJzKHByb3RvdHlwZSk7XG4gICAgfSxcblxuICAgIGNoYWluUHJvdG90eXBlczogZnVuY3Rpb24ocHJvdG90eXBlLCBiYXNlKSB7XG4gICAgICAvLyBjaGFpbiB2YXJpb3VzIG1ldGEtZGF0YSBvYmplY3RzIHRvIGluaGVyaXRlZCB2ZXJzaW9uc1xuICAgICAgdGhpcy5pbmhlcml0TWV0YURhdGEocHJvdG90eXBlLCBiYXNlKTtcbiAgICAgIC8vIGNoYWluIGN1c3RvbSBhcGkgdG8gaW5oZXJpdGVkXG4gICAgICB2YXIgY2hhaW5lZCA9IHRoaXMuY2hhaW5PYmplY3QocHJvdG90eXBlLCBiYXNlKTtcbiAgICAgIC8vIHgtcGxhdGZvcm0gZml4dXBcbiAgICAgIGVuc3VyZVByb3RvdHlwZVRyYXZlcnNhbChjaGFpbmVkKTtcbiAgICAgIHJldHVybiBjaGFpbmVkO1xuICAgIH0sXG5cbiAgICBpbmhlcml0TWV0YURhdGE6IGZ1bmN0aW9uKHByb3RvdHlwZSwgYmFzZSkge1xuICAgICAgLy8gY2hhaW4gb2JzZXJ2ZSBvYmplY3QgdG8gaW5oZXJpdGVkXG4gICAgICB0aGlzLmluaGVyaXRPYmplY3QoJ29ic2VydmUnLCBwcm90b3R5cGUsIGJhc2UpO1xuICAgICAgLy8gY2hhaW4gcHVibGlzaCBvYmplY3QgdG8gaW5oZXJpdGVkXG4gICAgICB0aGlzLmluaGVyaXRPYmplY3QoJ3B1Ymxpc2gnLCBwcm90b3R5cGUsIGJhc2UpO1xuICAgICAgLy8gY2hhaW4gcmVmbGVjdCBvYmplY3QgdG8gaW5oZXJpdGVkXG4gICAgICB0aGlzLmluaGVyaXRPYmplY3QoJ3JlZmxlY3QnLCBwcm90b3R5cGUsIGJhc2UpO1xuICAgICAgLy8gY2hhaW4gb3VyIGxvd2VyLWNhc2VkIHB1Ymxpc2ggbWFwIHRvIHRoZSBpbmhlcml0ZWQgdmVyc2lvblxuICAgICAgdGhpcy5pbmhlcml0T2JqZWN0KCdfcHVibGlzaExDJywgcHJvdG90eXBlLCBiYXNlKTtcbiAgICAgIC8vIGNoYWluIG91ciBpbnN0YW5jZSBhdHRyaWJ1dGVzIG1hcCB0byB0aGUgaW5oZXJpdGVkIHZlcnNpb25cbiAgICAgIHRoaXMuaW5oZXJpdE9iamVjdCgnX2luc3RhbmNlQXR0cmlidXRlcycsIHByb3RvdHlwZSwgYmFzZSk7XG4gICAgICAvLyBjaGFpbiBvdXIgZXZlbnQgZGVsZWdhdGVzIG1hcCB0byB0aGUgaW5oZXJpdGVkIHZlcnNpb25cbiAgICAgIHRoaXMuaW5oZXJpdE9iamVjdCgnZXZlbnREZWxlZ2F0ZXMnLCBwcm90b3R5cGUsIGJhc2UpO1xuICAgIH0sXG5cbiAgICAvLyBpbXBsZW1lbnQgdmFyaW91cyBkZWNsYXJhdGl2ZSBmZWF0dXJlc1xuICAgIGRlc3VnYXJBZnRlckNoYWluaW5nOiBmdW5jdGlvbihuYW1lLCBleHRlbmRlZSkge1xuICAgICAgLy8gYnVpbGQgc2lkZS1jaGFpbmVkIGxpc3RzIHRvIG9wdGltaXplIGl0ZXJhdGlvbnNcbiAgICAgIHRoaXMub3B0aW1pemVQcm9wZXJ0eU1hcHModGhpcy5wcm90b3R5cGUpO1xuICAgICAgdGhpcy5jcmVhdGVQcm9wZXJ0eUFjY2Vzc29ycyh0aGlzLnByb3RvdHlwZSk7XG4gICAgICAvLyBpbnN0YWxsIG1kdiBkZWxlZ2F0ZSBvbiB0ZW1wbGF0ZVxuICAgICAgdGhpcy5pbnN0YWxsQmluZGluZ0RlbGVnYXRlKHRoaXMuZmV0Y2hUZW1wbGF0ZSgpKTtcbiAgICAgIC8vIGluc3RhbGwgZXh0ZXJuYWwgc3R5bGVzaGVldHMgYXMgaWYgdGhleSBhcmUgaW5saW5lXG4gICAgICB0aGlzLmluc3RhbGxTaGVldHMoKTtcbiAgICAgIC8vIGFkanVzdCBhbnkgcGF0aHMgaW4gZG9tIGZyb20gaW1wb3J0c1xuICAgICAgdGhpcy5yZXNvbHZlRWxlbWVudFBhdGhzKHRoaXMpO1xuICAgICAgLy8gY29tcGlsZSBsaXN0IG9mIGF0dHJpYnV0ZXMgdG8gY29weSB0byBpbnN0YW5jZXNcbiAgICAgIHRoaXMuYWNjdW11bGF0ZUluc3RhbmNlQXR0cmlidXRlcygpO1xuICAgICAgLy8gcGFyc2Ugb24tKiBkZWxlZ2F0ZXMgZGVjbGFyZWQgb24gYHRoaXNgIGVsZW1lbnRcbiAgICAgIHRoaXMucGFyc2VIb3N0RXZlbnRzKCk7XG4gICAgICAvL1xuICAgICAgLy8gaW5zdGFsbCBhIGhlbHBlciBtZXRob2QgdGhpcy5yZXNvbHZlUGF0aCB0byBhaWQgaW5cbiAgICAgIC8vIHNldHRpbmcgcmVzb3VyY2UgdXJscy4gZS5nLlxuICAgICAgLy8gdGhpcy4kLmltYWdlLnNyYyA9IHRoaXMucmVzb2x2ZVBhdGgoJ2ltYWdlcy9mb28ucG5nJylcbiAgICAgIHRoaXMuYWRkUmVzb2x2ZVBhdGhBcGkoKTtcbiAgICAgIC8vIHVuZGVyIFNoYWRvd0RPTVBvbHlmaWxsLCB0cmFuc2Zvcm1zIHRvIGFwcHJveGltYXRlIG1pc3NpbmcgQ1NTIGZlYXR1cmVzXG4gICAgICBpZiAoaGFzU2hhZG93RE9NUG9seWZpbGwpIHtcbiAgICAgICAgV2ViQ29tcG9uZW50cy5TaGFkb3dDU1Muc2hpbVN0eWxpbmcodGhpcy50ZW1wbGF0ZUNvbnRlbnQoKSwgbmFtZSxcbiAgICAgICAgICBleHRlbmRlZSk7XG4gICAgICB9XG4gICAgICAvLyBhbGxvdyBjdXN0b20gZWxlbWVudCBhY2Nlc3MgdG8gdGhlIGRlY2xhcmF0aXZlIGNvbnRleHRcbiAgICAgIGlmICh0aGlzLnByb3RvdHlwZS5yZWdpc3RlckNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMucHJvdG90eXBlLnJlZ2lzdGVyQ2FsbGJhY2sodGhpcyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIGlmIGEgbmFtZWQgY29uc3RydWN0b3IgaXMgcmVxdWVzdGVkIGluIGVsZW1lbnQsIG1hcCBhIHJlZmVyZW5jZVxuICAgIC8vIHRvIHRoZSBjb25zdHJ1Y3RvciB0byB0aGUgZ2l2ZW4gc3ltYm9sXG4gICAgcHVibGlzaENvbnN0cnVjdG9yOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzeW1ib2wgPSB0aGlzLmdldEF0dHJpYnV0ZSgnY29uc3RydWN0b3InKTtcbiAgICAgIGlmIChzeW1ib2wpIHtcbiAgICAgICAgd2luZG93W3N5bWJvbF0gPSB0aGlzLmN0b3I7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIGJ1aWxkIHByb3RvdHlwZSBjb21iaW5pbmcgZXh0ZW5kZWUsIFBvbHltZXIgYmFzZSwgYW5kIG5hbWVkIGFwaVxuICAgIGdlbmVyYXRlQmFzZVByb3RvdHlwZTogZnVuY3Rpb24oZXh0bmRzKSB7XG4gICAgICB2YXIgcHJvdG90eXBlID0gdGhpcy5maW5kQmFzZVByb3RvdHlwZShleHRuZHMpO1xuICAgICAgaWYgKCFwcm90b3R5cGUpIHtcbiAgICAgICAgLy8gY3JlYXRlIGEgcHJvdG90eXBlIGJhc2VkIG9uIHRhZy1uYW1lIGV4dGVuc2lvblxuICAgICAgICB2YXIgcHJvdG90eXBlID0gSFRNTEVsZW1lbnQuZ2V0UHJvdG90eXBlRm9yVGFnKGV4dG5kcyk7XG4gICAgICAgIC8vIGluc2VydCBiYXNlIGFwaSBpbiBpbmhlcml0YW5jZSBjaGFpbiAoaWYgbmVlZGVkKVxuICAgICAgICBwcm90b3R5cGUgPSB0aGlzLmVuc3VyZUJhc2VBcGkocHJvdG90eXBlKTtcbiAgICAgICAgLy8gbWVtb2l6ZSB0aGlzIGJhc2VcbiAgICAgICAgbWVtb2l6ZWRCYXNlc1tleHRuZHNdID0gcHJvdG90eXBlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3RvdHlwZTtcbiAgICB9LFxuXG4gICAgZmluZEJhc2VQcm90b3R5cGU6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHJldHVybiBtZW1vaXplZEJhc2VzW25hbWVdO1xuICAgIH0sXG5cbiAgICAvLyBpbnN0YWxsIFBvbHltZXIgaW5zdGFuY2UgYXBpIGludG8gcHJvdG90eXBlIGNoYWluLCBhcyBuZWVkZWRcbiAgICBlbnN1cmVCYXNlQXBpOiBmdW5jdGlvbihwcm90b3R5cGUpIHtcbiAgICAgIGlmIChwcm90b3R5cGUuUG9seW1lckJhc2UpIHtcbiAgICAgICAgcmV0dXJuIHByb3RvdHlwZTtcbiAgICAgIH1cbiAgICAgIHZhciBleHRlbmRlZCA9IE9iamVjdC5jcmVhdGUocHJvdG90eXBlKTtcbiAgICAgIC8vIHdlIG5lZWQgYSB1bmlxdWUgY29weSBvZiBiYXNlIGFwaSBmb3IgZWFjaCBiYXNlIHByb3RvdHlwZVxuICAgICAgLy8gdGhlcmVmb3JlIHdlICdleHRlbmQnIGhlcmUgaW5zdGVhZCBvZiBzaW1wbHkgY2hhaW5pbmdcbiAgICAgIGFwaS5wdWJsaXNoKGFwaS5pbnN0YW5jZSwgZXh0ZW5kZWQpO1xuICAgICAgLy8gVE9ETyhzam1pbGVzKTogc2hhcmluZyBtZXRob2RzIGFjcm9zcyBwcm90b3R5cGUgY2hhaW5zIGlzXG4gICAgICAvLyBub3Qgc3VwcG9ydGVkIGJ5ICdzdXBlcicgaW1wbGVtZW50YXRpb24gd2hpY2ggb3B0aW1pemVzXG4gICAgICAvLyBieSBtZW1vaXppbmcgcHJvdG90eXBlIHJlbGF0aW9uc2hpcHMuXG4gICAgICAvLyBQcm9iYWJseSB3ZSBzaG91bGQgaGF2ZSBhIHZlcnNpb24gb2YgJ2V4dGVuZCcgdGhhdCBpc1xuICAgICAgLy8gc2hhcmUtYXdhcmU6IGl0IGNvdWxkIHN0dWR5IHRoZSB0ZXh0IG9mIGVhY2ggZnVuY3Rpb24sXG4gICAgICAvLyBsb29rIGZvciB1c2FnZSBvZiAnc3VwZXInLCBhbmQgd3JhcCB0aG9zZSBmdW5jdGlvbnMgaW5cbiAgICAgIC8vIGNsb3N1cmVzLlxuICAgICAgLy8gQXMgb2Ygbm93LCB0aGVyZSBpcyBvbmx5IG9uZSBwcm9ibGVtYXRpYyBtZXRob2QsIHNvXG4gICAgICAvLyB3ZSBqdXN0IHBhdGNoIGl0IG1hbnVhbGx5LlxuICAgICAgLy8gVG8gYXZvaWQgcmUtZW50cmFuY3kgcHJvYmxlbXMsIHRoZSBzcGVjaWFsIHN1cGVyIG1ldGhvZFxuICAgICAgLy8gaW5zdGFsbGVkIGlzIGNhbGxlZCBgbWl4aW5TdXBlcmAgYW5kIHRoZSBtaXhpbiBtZXRob2RcbiAgICAgIC8vIG11c3QgdXNlIHRoaXMgbWV0aG9kIGluc3RlYWQgb2YgdGhlIGRlZmF1bHQgYHN1cGVyYC5cbiAgICAgIHRoaXMubWl4aW5NZXRob2QoZXh0ZW5kZWQsIHByb3RvdHlwZSwgYXBpLmluc3RhbmNlLm1kdiwgJ2JpbmQnKTtcbiAgICAgIC8vIHJldHVybiBidWZmZWQtdXAgcHJvdG90eXBlXG4gICAgICByZXR1cm4gZXh0ZW5kZWQ7XG4gICAgfSxcblxuICAgIG1peGluTWV0aG9kOiBmdW5jdGlvbihleHRlbmRlZCwgcHJvdG90eXBlLCBhcGksIG5hbWUpIHtcbiAgICAgIHZhciAkc3VwZXIgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgIHJldHVybiBwcm90b3R5cGVbbmFtZV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICB9O1xuICAgICAgZXh0ZW5kZWRbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5taXhpblN1cGVyID0gJHN1cGVyO1xuICAgICAgICByZXR1cm4gYXBpW25hbWVdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIGVuc3VyZSBwcm90b3R5cGVbbmFtZV0gaW5oZXJpdHMgZnJvbSBhIHByb3RvdHlwZS5wcm90b3R5cGVbbmFtZV1cbiAgICBpbmhlcml0T2JqZWN0OiBmdW5jdGlvbihuYW1lLCBwcm90b3R5cGUsIGJhc2UpIHtcbiAgICAgIC8vIHJlcXVpcmUgYW4gb2JqZWN0XG4gICAgICB2YXIgc291cmNlID0gcHJvdG90eXBlW25hbWVdIHx8IHt9O1xuICAgICAgLy8gY2hhaW4gaW5oZXJpdGVkIHByb3BlcnRpZXMgb250byBhIG5ldyBvYmplY3RcbiAgICAgIHByb3RvdHlwZVtuYW1lXSA9IHRoaXMuY2hhaW5PYmplY3Qoc291cmNlLCBiYXNlW25hbWVdKTtcbiAgICB9LFxuXG4gICAgLy8gcmVnaXN0ZXIgJ3Byb3RvdHlwZScgdG8gY3VzdG9tIGVsZW1lbnQgJ25hbWUnLCBzdG9yZSBjb25zdHJ1Y3RvclxuICAgIHJlZ2lzdGVyUHJvdG90eXBlOiBmdW5jdGlvbihuYW1lLCBleHRlbmRlZSkge1xuICAgICAgdmFyIGluZm8gPSB7XG4gICAgICAgIHByb3RvdHlwZTogdGhpcy5wcm90b3R5cGVcbiAgICAgIH1cbiAgICAgIC8vIG5hdGl2ZSBlbGVtZW50IG11c3QgYmUgc3BlY2lmaWVkIGluIGV4dGVuZHNcbiAgICAgIHZhciB0eXBlRXh0ZW5zaW9uID0gdGhpcy5maW5kVHlwZUV4dGVuc2lvbihleHRlbmRlZSk7XG4gICAgICBpZiAodHlwZUV4dGVuc2lvbikge1xuICAgICAgICBpbmZvLmV4dGVuZHMgPSB0eXBlRXh0ZW5zaW9uO1xuICAgICAgfVxuICAgICAgLy8gcmVnaXN0ZXIgdGhlIHByb3RvdHlwZSB3aXRoIEhUTUxFbGVtZW50IGZvciBuYW1lIGxvb2t1cFxuICAgICAgSFRNTEVsZW1lbnQucmVnaXN0ZXIobmFtZSwgdGhpcy5wcm90b3R5cGUpO1xuICAgICAgLy8gcmVnaXN0ZXIgdGhlIGN1c3RvbSB0eXBlXG4gICAgICB0aGlzLmN0b3IgPSBkb2N1bWVudC5yZWdpc3RlckVsZW1lbnQobmFtZSwgaW5mbyk7XG4gICAgfSxcblxuICAgIGZpbmRUeXBlRXh0ZW5zaW9uOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICBpZiAobmFtZSAmJiBuYW1lLmluZGV4T2YoJy0nKSA8IDApIHtcbiAgICAgICAgcmV0dXJuIG5hbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcCA9IHRoaXMuZmluZEJhc2VQcm90b3R5cGUobmFtZSk7XG4gICAgICAgIGlmIChwLmVsZW1lbnQpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5maW5kVHlwZUV4dGVuc2lvbihwLmVsZW1lbnQuZXh0ZW5kcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgfTtcblxuICAvLyBtZW1vaXplIGJhc2UgcHJvdG90eXBlc1xuICB2YXIgbWVtb2l6ZWRCYXNlcyA9IHt9O1xuXG4gIC8vIGltcGxlbWVudGF0aW9uIG9mICdjaGFpbk9iamVjdCcgZGVwZW5kcyBvbiBzdXBwb3J0IGZvciBfX3Byb3RvX19cbiAgaWYgKE9iamVjdC5fX3Byb3RvX18pIHtcbiAgICBwcm90b3R5cGUuY2hhaW5PYmplY3QgPSBmdW5jdGlvbihvYmplY3QsIGluaGVyaXRlZCkge1xuICAgICAgaWYgKG9iamVjdCAmJiBpbmhlcml0ZWQgJiYgb2JqZWN0ICE9PSBpbmhlcml0ZWQpIHtcbiAgICAgICAgb2JqZWN0Ll9fcHJvdG9fXyA9IGluaGVyaXRlZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHByb3RvdHlwZS5jaGFpbk9iamVjdCA9IGZ1bmN0aW9uKG9iamVjdCwgaW5oZXJpdGVkKSB7XG4gICAgICBpZiAob2JqZWN0ICYmIGluaGVyaXRlZCAmJiBvYmplY3QgIT09IGluaGVyaXRlZCkge1xuICAgICAgICB2YXIgY2hhaW5lZCA9IE9iamVjdC5jcmVhdGUoaW5oZXJpdGVkKTtcbiAgICAgICAgb2JqZWN0ID0gZXh0ZW5kKGNoYWluZWQsIG9iamVjdCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqZWN0O1xuICAgIH1cbiAgfVxuXG4gIC8vIE9uIHBsYXRmb3JtcyB0aGF0IGRvIG5vdCBzdXBwb3J0IF9fcHJvdG9fXyAodmVyc2lvbnMgb2YgSUUpLCB0aGUgcHJvdG90eXBlXG4gIC8vIGNoYWluIG9mIGEgY3VzdG9tIGVsZW1lbnQgaXMgc2ltdWxhdGVkIHZpYSBpbnN0YWxsYXRpb24gb2YgX19wcm90b19fLlxuICAvLyBBbHRob3VnaCBjdXN0b20gZWxlbWVudHMgbWFuYWdlcyB0aGlzLCB3ZSBpbnN0YWxsIGl0IGhlcmUgc28gaXQnc1xuICAvLyBhdmFpbGFibGUgZHVyaW5nIGRlc3VnYXJpbmcuXG4gIGZ1bmN0aW9uIGVuc3VyZVByb3RvdHlwZVRyYXZlcnNhbChwcm90b3R5cGUpIHtcbiAgICBpZiAoIU9iamVjdC5fX3Byb3RvX18pIHtcbiAgICAgIHZhciBhbmNlc3RvciA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihwcm90b3R5cGUpO1xuICAgICAgcHJvdG90eXBlLl9fcHJvdG9fXyA9IGFuY2VzdG9yO1xuICAgICAgaWYgKGlzQmFzZShhbmNlc3RvcikpIHtcbiAgICAgICAgYW5jZXN0b3IuX19wcm90b19fID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGFuY2VzdG9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBleHBvcnRzXG5cbiAgYXBpLmRlY2xhcmF0aW9uLnByb3RvdHlwZSA9IHByb3RvdHlwZTtcblxufSkoUG9seW1lcik7XG5cbihmdW5jdGlvbihzY29wZSkge1xuXG4gIC8qXG5cbiAgICBFbGVtZW50cyBhcmUgYWRkZWQgdG8gYSByZWdpc3RyYXRpb24gcXVldWUgc28gdGhhdCB0aGV5IHJlZ2lzdGVyIGluXG4gICAgdGhlIHByb3BlciBvcmRlciBhdCB0aGUgYXBwcm9wcmlhdGUgdGltZS4gV2UgZG8gdGhpcyBmb3IgYSBmZXcgcmVhc29uczpcblxuICAgICogdG8gZW5hYmxlIGVsZW1lbnRzIHRvIGxvYWQgcmVzb3VyY2VzIChsaWtlIHN0eWxlc2hlZXRzKVxuICAgIGFzeW5jaHJvbm91c2x5LiBXZSBuZWVkIHRvIGRvIHRoaXMgdW50aWwgdGhlIHBsYXRmb3JtIHByb3ZpZGVzIGFuIGVmZmljaWVudFxuICAgIGFsdGVybmF0aXZlLiBPbmUgaXNzdWUgaXMgdGhhdCByZW1vdGUgQGltcG9ydCBzdHlsZXNoZWV0cyBhcmVcbiAgICByZS1mZXRjaGVkIHdoZW5ldmVyIHN0YW1wZWQgaW50byBhIHNoYWRvd1Jvb3QuXG5cbiAgICAqIHRvIGVuc3VyZSBlbGVtZW50cyBsb2FkZWQgJ2F0IHRoZSBzYW1lIHRpbWUnIChlLmcuIHZpYSBzb21lIHNldCBvZlxuICAgIGltcG9ydHMpIGFyZSByZWdpc3RlcmVkIGFzIGEgYmF0Y2guIFRoaXMgYWxsb3dzIGVsZW1lbnRzIHRvIGJlIGVudXJlZCBmcm9tXG4gICAgdXBncmFkZSBvcmRlcmluZyBhcyBsb25nIGFzIHRoZXkgcXVlcnkgdGhlIGRvbSB0cmVlIDEgdGFzayBhZnRlclxuICAgIHVwZ3JhZGUgKGFrYSBkb21SZWFkeSkuIFRoaXMgaXMgYSBwZXJmb3JtYW5jZSB0cmFkZW9mZi4gT24gdGhlIG9uZSBoYW5kLFxuICAgIGVsZW1lbnRzIHRoYXQgY291bGQgcmVnaXN0ZXIgd2hpbGUgaW1wb3J0cyBhcmUgbG9hZGluZyBhcmUgcHJldmVudGVkIGZyb21cbiAgICBkb2luZyBzby4gT24gdGhlIG90aGVyLCBncm91cGluZyB1cGdyYWRlcyBpbnRvIGEgc2luZ2xlIHRhc2sgbWVhbnMgbGVzc1xuICAgIGluY3JlbWVudGFsIHdvcmsgKGZvciBleGFtcGxlIHN0eWxlIHJlY2FsY3MpLCAgQWxzbywgd2UgY2FuIGVuc3VyZSB0aGVcbiAgICBkb2N1bWVudCBpcyBpbiBhIGtub3duIHN0YXRlIGF0IHRoZSBzaW5nbGUgcXVhbnR1bSBvZiB0aW1lIHdoZW5cbiAgICBlbGVtZW50cyB1cGdyYWRlLlxuXG4gICovXG4gIHZhciBxdWV1ZSA9IHtcblxuICAgIC8vIHRlbGwgdGhlIHF1ZXVlIHRvIHdhaXQgZm9yIGFuIGVsZW1lbnQgdG8gYmUgcmVhZHlcbiAgICB3YWl0OiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICBpZiAoIWVsZW1lbnQuX19xdWV1ZSkge1xuICAgICAgICBlbGVtZW50Ll9fcXVldWUgPSB7fTtcbiAgICAgICAgZWxlbWVudHMucHVzaChlbGVtZW50KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gZW5xdWV1ZSBhbiBlbGVtZW50IHRvIHRoZSBuZXh0IHNwb3QgaW4gdGhlIHF1ZXVlLlxuICAgIGVucXVldWU6IGZ1bmN0aW9uKGVsZW1lbnQsIGNoZWNrLCBnbykge1xuICAgICAgdmFyIHNob3VsZEFkZCA9IGVsZW1lbnQuX19xdWV1ZSAmJiAhZWxlbWVudC5fX3F1ZXVlLmNoZWNrO1xuICAgICAgaWYgKHNob3VsZEFkZCkge1xuICAgICAgICBxdWV1ZUZvckVsZW1lbnQoZWxlbWVudCkucHVzaChlbGVtZW50KTtcbiAgICAgICAgZWxlbWVudC5fX3F1ZXVlLmNoZWNrID0gY2hlY2s7XG4gICAgICAgIGVsZW1lbnQuX19xdWV1ZS5nbyA9IGdvO1xuICAgICAgfVxuICAgICAgcmV0dXJuICh0aGlzLmluZGV4T2YoZWxlbWVudCkgIT09IDApO1xuICAgIH0sXG5cbiAgICBpbmRleE9mOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICB2YXIgaSA9IHF1ZXVlRm9yRWxlbWVudChlbGVtZW50KS5pbmRleE9mKGVsZW1lbnQpO1xuICAgICAgaWYgKGkgPj0gMCAmJiBkb2N1bWVudC5jb250YWlucyhlbGVtZW50KSkge1xuICAgICAgICBpICs9IChIVE1MSW1wb3J0cy51c2VOYXRpdmUgfHwgSFRNTEltcG9ydHMucmVhZHkpID9cbiAgICAgICAgICBpbXBvcnRRdWV1ZS5sZW5ndGggOiAxZTk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaTtcbiAgICB9LFxuXG4gICAgLy8gdGVsbCB0aGUgcXVldWUgYW4gZWxlbWVudCBpcyByZWFkeSB0byBiZSByZWdpc3RlcmVkXG4gICAgZ286IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIHZhciByZWFkaWVkID0gdGhpcy5yZW1vdmUoZWxlbWVudCk7XG4gICAgICBpZiAocmVhZGllZCkge1xuICAgICAgICBlbGVtZW50Ll9fcXVldWUuZmx1c2hhYmxlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5hZGRUb0ZsdXNoUXVldWUocmVhZGllZCk7XG4gICAgICAgIHRoaXMuY2hlY2soKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICB2YXIgaSA9IHRoaXMuaW5kZXhPZihlbGVtZW50KTtcbiAgICAgIGlmIChpICE9PSAwKSB7XG4gICAgICAgIC8vY29uc29sZS53YXJuKCdxdWV1ZSBvcmRlciB3cm9uZycsIGkpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICByZXR1cm4gcXVldWVGb3JFbGVtZW50KGVsZW1lbnQpLnNoaWZ0KCk7XG4gICAgfSxcblxuICAgIGNoZWNrOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIG5leHRcbiAgICAgIHZhciBlbGVtZW50ID0gdGhpcy5uZXh0RWxlbWVudCgpO1xuICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgZWxlbWVudC5fX3F1ZXVlLmNoZWNrLmNhbGwoZWxlbWVudCk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5jYW5SZWFkeSgpKSB7XG4gICAgICAgIHRoaXMucmVhZHkoKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSxcblxuICAgIG5leHRFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXh0UXVldWVkKCk7XG4gICAgfSxcblxuICAgIGNhblJlYWR5OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAhdGhpcy53YWl0VG9SZWFkeSAmJiB0aGlzLmlzRW1wdHkoKTtcbiAgICB9LFxuXG4gICAgaXNFbXB0eTogZnVuY3Rpb24oKSB7XG4gICAgICBmb3IgKHZhciBpPTAsIGw9ZWxlbWVudHMubGVuZ3RoLCBlOyAoaTxsKSAmJlxuICAgICAgICAgIChlPWVsZW1lbnRzW2ldKTsgaSsrKSB7XG4gICAgICAgIGlmIChlLl9fcXVldWUgJiYgIWUuX19xdWV1ZS5mbHVzaGFibGUpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICBhZGRUb0ZsdXNoUXVldWU6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIGZsdXNoUXVldWUucHVzaChlbGVtZW50KTtcbiAgICB9LFxuXG4gICAgZmx1c2g6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gcHJldmVudCByZS1lbnRyYW5jZVxuICAgICAgaWYgKHRoaXMuZmx1c2hpbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5mbHVzaGluZyA9IHRydWU7XG4gICAgICB2YXIgZWxlbWVudDtcbiAgICAgIHdoaWxlIChmbHVzaFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBlbGVtZW50ID0gZmx1c2hRdWV1ZS5zaGlmdCgpO1xuICAgICAgICBlbGVtZW50Ll9fcXVldWUuZ28uY2FsbChlbGVtZW50KTtcbiAgICAgICAgZWxlbWVudC5fX3F1ZXVlID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHRoaXMuZmx1c2hpbmcgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gVE9ETyhzb3J2ZWxsKTogQXMgYW4gb3B0aW1pemF0aW9uLCB0dXJuIG9mZiBDRSBwb2x5ZmlsbCB1cGdyYWRpbmdcbiAgICAgIC8vIHdoaWxlIHJlZ2lzdGVyaW5nLiBUaGlzIHdheSB3ZSBhdm9pZCBoYXZpbmcgdG8gdXBncmFkZSBlYWNoIGRvY3VtZW50XG4gICAgICAvLyBwaWVjZW1lYWwgcGVyIHJlZ2lzdHJhdGlvbiBhbmQgY2FuIGluc3RlYWQgcmVnaXN0ZXIgYWxsIGVsZW1lbnRzXG4gICAgICAvLyBhbmQgdXBncmFkZSBvbmNlIGluIGEgYmF0Y2guIFdpdGhvdXQgdGhpcyBvcHRpbWl6YXRpb24sIHVwZ3JhZGUgdGltZVxuICAgICAgLy8gZGVncmFkZXMgc2lnbmlmaWNhbnRseSB3aGVuIFNEIHBvbHlmaWxsIGlzIHVzZWQuIFRoaXMgaXMgbWFpbmx5IGJlY2F1c2VcbiAgICAgIC8vIHF1ZXJ5aW5nIHRoZSBkb2N1bWVudCB0cmVlIGZvciBlbGVtZW50cyBpcyBzbG93IHVuZGVyIHRoZSBTRCBwb2x5ZmlsbC5cbiAgICAgIHZhciBwb2x5ZmlsbFdhc1JlYWR5ID0gQ3VzdG9tRWxlbWVudHMucmVhZHk7XG4gICAgICBDdXN0b21FbGVtZW50cy5yZWFkeSA9IGZhbHNlO1xuICAgICAgdGhpcy5mbHVzaCgpO1xuICAgICAgaWYgKCFDdXN0b21FbGVtZW50cy51c2VOYXRpdmUpIHtcbiAgICAgICAgQ3VzdG9tRWxlbWVudHMudXBncmFkZURvY3VtZW50VHJlZShkb2N1bWVudCk7XG4gICAgICB9XG4gICAgICBDdXN0b21FbGVtZW50cy5yZWFkeSA9IHBvbHlmaWxsV2FzUmVhZHk7XG4gICAgICBQb2x5bWVyLmZsdXNoKCk7XG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5mbHVzaFJlYWR5Q2FsbGJhY2tzKTtcbiAgICB9LFxuXG4gICAgYWRkUmVhZHlDYWxsYmFjazogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICByZWFkeUNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgZmx1c2hSZWFkeUNhbGxiYWNrczogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAocmVhZHlDYWxsYmFja3MpIHtcbiAgICAgICAgdmFyIGZuO1xuICAgICAgICB3aGlsZSAocmVhZHlDYWxsYmFja3MubGVuZ3RoKSB7XG4gICAgICAgICAgZm4gPSByZWFkeUNhbGxiYWNrcy5zaGlmdCgpO1xuICAgICAgICAgIGZuKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgUmV0dXJucyBhIGxpc3Qgb2YgZWxlbWVudHMgdGhhdCBoYXZlIGhhZCBwb2x5bWVyLWVsZW1lbnRzIGNyZWF0ZWQgYnV0XG4gICAgYXJlIG5vdCB5ZXQgcmVhZHkgdG8gcmVnaXN0ZXIuIFRoZSBsaXN0IGlzIGFuIGFycmF5IG9mIGVsZW1lbnQgZGVmaW5pdGlvbnMuXG4gICAgKi9cbiAgICB3YWl0aW5nRm9yOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBlJCA9IFtdO1xuICAgICAgZm9yICh2YXIgaT0wLCBsPWVsZW1lbnRzLmxlbmd0aCwgZTsgKGk8bCkgJiZcbiAgICAgICAgICAoZT1lbGVtZW50c1tpXSk7IGkrKykge1xuICAgICAgICBpZiAoZS5fX3F1ZXVlICYmICFlLl9fcXVldWUuZmx1c2hhYmxlKSB7XG4gICAgICAgICAgZSQucHVzaChlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGUkO1xuICAgIH0sXG5cbiAgICB3YWl0VG9SZWFkeTogdHJ1ZVxuXG4gIH07XG5cbiAgdmFyIGVsZW1lbnRzID0gW107XG4gIHZhciBmbHVzaFF1ZXVlID0gW107XG4gIHZhciBpbXBvcnRRdWV1ZSA9IFtdO1xuICB2YXIgbWFpblF1ZXVlID0gW107XG4gIHZhciByZWFkeUNhbGxiYWNrcyA9IFtdO1xuXG4gIGZ1bmN0aW9uIHF1ZXVlRm9yRWxlbWVudChlbGVtZW50KSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNvbnRhaW5zKGVsZW1lbnQpID8gbWFpblF1ZXVlIDogaW1wb3J0UXVldWU7XG4gIH1cblxuICBmdW5jdGlvbiBuZXh0UXVldWVkKCkge1xuICAgIHJldHVybiBpbXBvcnRRdWV1ZS5sZW5ndGggPyBpbXBvcnRRdWV1ZVswXSA6IG1haW5RdWV1ZVswXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHdoZW5SZWFkeShjYWxsYmFjaykge1xuICAgIHF1ZXVlLndhaXRUb1JlYWR5ID0gdHJ1ZTtcbiAgICBQb2x5bWVyLmVuZE9mTWljcm90YXNrKGZ1bmN0aW9uKCkge1xuICAgICAgSFRNTEltcG9ydHMud2hlblJlYWR5KGZ1bmN0aW9uKCkge1xuICAgICAgICBxdWV1ZS5hZGRSZWFkeUNhbGxiYWNrKGNhbGxiYWNrKTtcbiAgICAgICAgcXVldWUud2FpdFRvUmVhZHkgPSBmYWxzZTtcbiAgICAgICAgcXVldWUuY2hlY2soKTtcbiAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgIEZvcmNlcyBwb2x5bWVyIHRvIHJlZ2lzdGVyIGFueSBwZW5kaW5nIGVsZW1lbnRzLiBDYW4gYmUgdXNlZCB0byBhYm9ydFxuICAgIHdhaXRpbmcgZm9yIGVsZW1lbnRzIHRoYXQgYXJlIHBhcnRpYWxseSBkZWZpbmVkLlxuICAgIEBwYXJhbSB0aW1lb3V0IHtJbnRlZ2VyfSBPcHRpb25hbCB0aW1lb3V0IGluIG1pbGxpc2Vjb25kc1xuICAqL1xuICBmdW5jdGlvbiBmb3JjZVJlYWR5KHRpbWVvdXQpIHtcbiAgICBpZiAodGltZW91dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBxdWV1ZS5yZWFkeSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgaGFuZGxlID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHF1ZXVlLnJlYWR5KCk7XG4gICAgfSwgdGltZW91dCk7XG4gICAgUG9seW1lci53aGVuUmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgICBjbGVhclRpbWVvdXQoaGFuZGxlKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIGV4cG9ydHNcbiAgc2NvcGUuZWxlbWVudHMgPSBlbGVtZW50cztcbiAgc2NvcGUud2FpdGluZ0ZvciA9IHF1ZXVlLndhaXRpbmdGb3IuYmluZChxdWV1ZSk7XG4gIHNjb3BlLmZvcmNlUmVhZHkgPSBmb3JjZVJlYWR5O1xuICBzY29wZS5xdWV1ZSA9IHF1ZXVlO1xuICBzY29wZS53aGVuUmVhZHkgPSBzY29wZS53aGVuUG9seW1lclJlYWR5ID0gd2hlblJlYWR5O1xufSkoUG9seW1lcik7XG5cbihmdW5jdGlvbihzY29wZSkge1xuXG4gIC8vIGltcG9ydHNcblxuICB2YXIgZXh0ZW5kID0gc2NvcGUuZXh0ZW5kO1xuICB2YXIgYXBpID0gc2NvcGUuYXBpO1xuICB2YXIgcXVldWUgPSBzY29wZS5xdWV1ZTtcbiAgdmFyIHdoZW5SZWFkeSA9IHNjb3BlLndoZW5SZWFkeTtcbiAgdmFyIGdldFJlZ2lzdGVyZWRQcm90b3R5cGUgPSBzY29wZS5nZXRSZWdpc3RlcmVkUHJvdG90eXBlO1xuICB2YXIgd2FpdGluZ0ZvclByb3RvdHlwZSA9IHNjb3BlLndhaXRpbmdGb3JQcm90b3R5cGU7XG5cbiAgLy8gZGVjbGFyYXRpdmUgaW1wbGVtZW50YXRpb246IDxwb2x5bWVyLWVsZW1lbnQ+XG5cbiAgdmFyIHByb3RvdHlwZSA9IGV4dGVuZChPYmplY3QuY3JlYXRlKEhUTUxFbGVtZW50LnByb3RvdHlwZSksIHtcblxuICAgIGNyZWF0ZWRDYWxsYmFjazogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5nZXRBdHRyaWJ1dGUoJ25hbWUnKSkge1xuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBmZXRjaCBkZWNsYXJlZCB2YWx1ZXNcbiAgICAgIHRoaXMubmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCduYW1lJyk7XG4gICAgICB0aGlzLmV4dGVuZHMgPSB0aGlzLmdldEF0dHJpYnV0ZSgnZXh0ZW5kcycpO1xuICAgICAgcXVldWUud2FpdCh0aGlzKTtcbiAgICAgIC8vIGluaXRpYXRlIGFueSBhc3luYyByZXNvdXJjZSBmZXRjaGVzXG4gICAgICB0aGlzLmxvYWRSZXNvdXJjZXMoKTtcbiAgICAgIC8vIHJlZ2lzdGVyIHdoZW4gYWxsIGNvbnN0cmFpbnRzIGFyZSBtZXRcbiAgICAgIHRoaXMucmVnaXN0ZXJXaGVuUmVhZHkoKTtcbiAgICB9LFxuXG4gICAgLy8gVE9ETyhzb3J2ZWxsKTogd2UgY3VycmVudGx5IHF1ZXVlIGluIHRoZSBvcmRlciB0aGUgcHJvdG90eXBlcyBhcmVcbiAgICAvLyByZWdpc3RlcmVkLCBidXQgd2Ugc2hvdWxkIHF1ZXVlIGluIHRoZSBvcmRlciB0aGF0IHBvbHltZXItZWxlbWVudHNcbiAgICAvLyBhcmUgcmVnaXN0ZXJlZC4gV2UgYXJlIGN1cnJlbnRseSBibG9ja2VkIGZyb20gZG9pbmcgdGhpcyBiYXNlZCBvblxuICAgIC8vIGNyYnVnLmNvbS8zOTU2ODYuXG4gICAgcmVnaXN0ZXJXaGVuUmVhZHk6IGZ1bmN0aW9uKCkge1xuICAgICBpZiAodGhpcy5yZWdpc3RlcmVkXG4gICAgICAgfHwgdGhpcy53YWl0aW5nRm9yUHJvdG90eXBlKHRoaXMubmFtZSlcbiAgICAgICB8fCB0aGlzLndhaXRpbmdGb3JRdWV1ZSgpXG4gICAgICAgfHwgdGhpcy53YWl0aW5nRm9yUmVzb3VyY2VzKCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBxdWV1ZS5nbyh0aGlzKTtcbiAgICB9LFxuXG4gICAgX3JlZ2lzdGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vY29uc29sZS5sb2coJ3JlZ2lzdGVyaW5nJywgdGhpcy5uYW1lKTtcbiAgICAgIC8vIHdhcm4gaWYgZXh0ZW5kaW5nIGZyb20gYSBjdXN0b20gZWxlbWVudCBub3QgcmVnaXN0ZXJlZCB2aWEgUG9seW1lclxuICAgICAgaWYgKGlzQ3VzdG9tVGFnKHRoaXMuZXh0ZW5kcykgJiYgIWlzUmVnaXN0ZXJlZCh0aGlzLmV4dGVuZHMpKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignJXMgaXMgYXR0ZW1wdGluZyB0byBleHRlbmQgJXMsIGFuIHVucmVnaXN0ZXJlZCBlbGVtZW50ICcgK1xuICAgICAgICAgICAgJ29yIG9uZSB0aGF0IHdhcyBub3QgcmVnaXN0ZXJlZCB3aXRoIFBvbHltZXIuJywgdGhpcy5uYW1lLFxuICAgICAgICAgICAgdGhpcy5leHRlbmRzKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVnaXN0ZXIodGhpcy5uYW1lLCB0aGlzLmV4dGVuZHMpO1xuICAgICAgdGhpcy5yZWdpc3RlcmVkID0gdHJ1ZTtcbiAgICB9LFxuXG4gICAgd2FpdGluZ0ZvclByb3RvdHlwZTogZnVuY3Rpb24obmFtZSkge1xuICAgICAgaWYgKCFnZXRSZWdpc3RlcmVkUHJvdG90eXBlKG5hbWUpKSB7XG4gICAgICAgIC8vIHRoZW4gd2FpdCBmb3IgYSBwcm90b3R5cGVcbiAgICAgICAgd2FpdGluZ0ZvclByb3RvdHlwZShuYW1lLCB0aGlzKTtcbiAgICAgICAgLy8gZW11bGF0ZSBzY3JpcHQgaWYgdXNlciBpcyBub3Qgc3VwcGx5aW5nIG9uZVxuICAgICAgICB0aGlzLmhhbmRsZU5vU2NyaXB0KG5hbWUpO1xuICAgICAgICAvLyBwcm90b3R5cGUgbm90IHJlYWR5IHlldFxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgaGFuZGxlTm9TY3JpcHQ6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIC8vIGlmIGV4cGxpY2l0bHkgbWFya2VkIGFzICdub3NjcmlwdCdcbiAgICAgIGlmICh0aGlzLmhhc0F0dHJpYnV0ZSgnbm9zY3JpcHQnKSAmJiAhdGhpcy5ub3NjcmlwdCkge1xuICAgICAgICB0aGlzLm5vc2NyaXB0ID0gdHJ1ZTtcbiAgICAgICAgLy8gaW1wZXJhdGl2ZSBlbGVtZW50IHJlZ2lzdHJhdGlvblxuICAgICAgICBQb2x5bWVyKG5hbWUpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICB3YWl0aW5nRm9yUmVzb3VyY2VzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9uZWVkc1Jlc291cmNlcztcbiAgICB9LFxuXG4gICAgLy8gTk9URTogRWxlbWVudHMgbXVzdCBiZSBxdWV1ZWQgaW4gcHJvcGVyIG9yZGVyIGZvciBpbmhlcml0YW5jZS9jb21wb3NpdGlvblxuICAgIC8vIGRlcGVuZGVuY3kgcmVzb2x1dGlvbi4gUHJldmlvdXNseSB0aGlzIHdhcyBlbmZvcmNlZCBmb3IgaW5oZXJpdGFuY2UsXG4gICAgLy8gYW5kIGJ5IHJ1bGUgZm9yIGNvbXBvc2l0aW9uLiBJdCdzIG5vdyBlbnRpcmVseSBieSBydWxlLlxuICAgIHdhaXRpbmdGb3JRdWV1ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcXVldWUuZW5xdWV1ZSh0aGlzLCB0aGlzLnJlZ2lzdGVyV2hlblJlYWR5LCB0aGlzLl9yZWdpc3Rlcik7XG4gICAgfSxcblxuICAgIGxvYWRSZXNvdXJjZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fbmVlZHNSZXNvdXJjZXMgPSB0cnVlO1xuICAgICAgdGhpcy5sb2FkU3R5bGVzKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9uZWVkc1Jlc291cmNlcyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyV2hlblJlYWR5KCk7XG4gICAgICB9LmJpbmQodGhpcykpO1xuICAgIH1cblxuICB9KTtcblxuICAvLyBzZW1pLXBsdWdnYWJsZSBBUElzXG5cbiAgLy8gVE9ETyhzam1pbGVzKTogc2hvdWxkIGJlIGZ1bGx5IHBsdWdnYWJsZSAoYWthIGRlY291cGxlZCwgY3VycmVudGx5XG4gIC8vIHRoZSB2YXJpb3VzIHBsdWdpbnMgYXJlIGFsbG93ZWQgdG8gZGVwZW5kIG9uIGVhY2ggb3RoZXIgZGlyZWN0bHkpXG4gIGFwaS5wdWJsaXNoKGFwaS5kZWNsYXJhdGlvbiwgcHJvdG90eXBlKTtcblxuICAvLyB1dGlsaXR5IGFuZCBib29ra2VlcGluZ1xuXG4gIGZ1bmN0aW9uIGlzUmVnaXN0ZXJlZChuYW1lKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4oSFRNTEVsZW1lbnQuZ2V0UHJvdG90eXBlRm9yVGFnKG5hbWUpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzQ3VzdG9tVGFnKG5hbWUpIHtcbiAgICByZXR1cm4gKG5hbWUgJiYgbmFtZS5pbmRleE9mKCctJykgPj0gMCk7XG4gIH1cblxuICAvLyBib290IHRhc2tzXG5cbiAgd2hlblJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQXR0cmlidXRlKCd1bnJlc29sdmVkJyk7XG4gICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChcbiAgICAgIG5ldyBDdXN0b21FdmVudCgncG9seW1lci1yZWFkeScsIHtidWJibGVzOiB0cnVlfSlcbiAgICApO1xuICB9KTtcblxuICAvLyByZWdpc3RlciBwb2x5bWVyLWVsZW1lbnQgd2l0aCBkb2N1bWVudFxuXG4gIGRvY3VtZW50LnJlZ2lzdGVyRWxlbWVudCgncG9seW1lci1lbGVtZW50Jywge3Byb3RvdHlwZTogcHJvdG90eXBlfSk7XG5cbn0pKFBvbHltZXIpO1xuXG4oZnVuY3Rpb24oc2NvcGUpIHtcblxuLyoqXG4gKiBAY2xhc3MgUG9seW1lclxuICovXG5cbnZhciB3aGVuUmVhZHkgPSBzY29wZS53aGVuUmVhZHk7XG5cbi8qKlxuICogTG9hZHMgdGhlIHNldCBvZiBIVE1MSW1wb3J0cyBjb250YWluZWQgaW4gYG5vZGVgLiBOb3RpZmllcyB3aGVuIGFsbFxuICogdGhlIGltcG9ydHMgaGF2ZSBsb2FkZWQgYnkgY2FsbGluZyB0aGUgYGNhbGxiYWNrYCBmdW5jdGlvbiBhcmd1bWVudC5cbiAqIFRoaXMgbWV0aG9kIGNhbiBiZSB1c2VkIHRvIGxhemlseSBsb2FkIGltcG9ydHMuIEZvciBleGFtcGxlLCBnaXZlbiBhXG4gKiB0ZW1wbGF0ZTpcbiAqXG4gKiAgICAgPHRlbXBsYXRlPlxuICogICAgICAgPGxpbmsgcmVsPVwiaW1wb3J0XCIgaHJlZj1cIm15LWltcG9ydDEuaHRtbFwiPlxuICogICAgICAgPGxpbmsgcmVsPVwiaW1wb3J0XCIgaHJlZj1cIm15LWltcG9ydDIuaHRtbFwiPlxuICogICAgIDwvdGVtcGxhdGU+XG4gKlxuICogICAgIFBvbHltZXIuaW1wb3J0RWxlbWVudHModGVtcGxhdGUuY29udGVudCwgZnVuY3Rpb24oKSB7XG4gKiAgICAgICBjb25zb2xlLmxvZygnaW1wb3J0cyBsYXppbHkgbG9hZGVkJyk7XG4gKiAgICAgfSk7XG4gKlxuICogQG1ldGhvZCBpbXBvcnRFbGVtZW50c1xuICogQHBhcmFtIHtOb2RlfSBub2RlIE5vZGUgY29udGFpbmluZyB0aGUgSFRNTEltcG9ydHMgdG8gbG9hZC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIENhbGxiYWNrIGNhbGxlZCB3aGVuIGFsbCBpbXBvcnRzIGhhdmUgbG9hZGVkLlxuICovXG5mdW5jdGlvbiBpbXBvcnRFbGVtZW50cyhub2RlLCBjYWxsYmFjaykge1xuICBpZiAobm9kZSkge1xuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgd2hlblJlYWR5KGNhbGxiYWNrKTtcbiAgfSBlbHNlIGlmIChjYWxsYmFjaykge1xuICAgIGNhbGxiYWNrKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBMb2FkcyBhbiBIVE1MSW1wb3J0IGZvciBlYWNoIHVybCBzcGVjaWZpZWQgaW4gdGhlIGB1cmxzYCBhcnJheS5cbiAqIE5vdGlmaWVzIHdoZW4gYWxsIHRoZSBpbXBvcnRzIGhhdmUgbG9hZGVkIGJ5IGNhbGxpbmcgdGhlIGBjYWxsYmFja2BcbiAqIGZ1bmN0aW9uIGFyZ3VtZW50LiBUaGlzIG1ldGhvZCBjYW4gYmUgdXNlZCB0byBsYXppbHkgbG9hZCBpbXBvcnRzLlxuICogRm9yIGV4YW1wbGUsXG4gKlxuICogICAgIFBvbHltZXIuaW1wb3J0KFsnbXktaW1wb3J0MS5odG1sJywgJ215LWltcG9ydDIuaHRtbCddLCBmdW5jdGlvbigpIHtcbiAqICAgICAgIGNvbnNvbGUubG9nKCdpbXBvcnRzIGxhemlseSBsb2FkZWQnKTtcbiAqICAgICB9KTtcbiAqXG4gKiBAbWV0aG9kIGltcG9ydFxuICogQHBhcmFtIHtBcnJheX0gdXJscyBBcnJheSBvZiB1cmxzIHRvIGxvYWQgYXMgSFRNTEltcG9ydHMuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayBjYWxsZWQgd2hlbiBhbGwgaW1wb3J0cyBoYXZlIGxvYWRlZC5cbiAqL1xuZnVuY3Rpb24gX2ltcG9ydCh1cmxzLCBjYWxsYmFjaykge1xuICBpZiAodXJscyAmJiB1cmxzLmxlbmd0aCkge1xuICAgICAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgICBmb3IgKHZhciBpPTAsIGw9dXJscy5sZW5ndGgsIHVybCwgbGluazsgKGk8bCkgJiYgKHVybD11cmxzW2ldKTsgaSsrKSB7XG4gICAgICAgIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG4gICAgICAgIGxpbmsucmVsID0gJ2ltcG9ydCc7XG4gICAgICAgIGxpbmsuaHJlZiA9IHVybDtcbiAgICAgICAgZnJhZy5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICAgIH1cbiAgICAgIGltcG9ydEVsZW1lbnRzKGZyYWcsIGNhbGxiYWNrKTtcbiAgfSBlbHNlIGlmIChjYWxsYmFjaykge1xuICAgIGNhbGxiYWNrKCk7XG4gIH1cbn1cblxuLy8gZXhwb3J0c1xuc2NvcGUuaW1wb3J0ID0gX2ltcG9ydDtcbnNjb3BlLmltcG9ydEVsZW1lbnRzID0gaW1wb3J0RWxlbWVudHM7XG5cbn0pKFBvbHltZXIpO1xuXG4vKipcbiAqIFRoZSBgYXV0by1iaW5kaW5nYCBlbGVtZW50IGV4dGVuZHMgdGhlIHRlbXBsYXRlIGVsZW1lbnQuIEl0IHByb3ZpZGVzIGEgcXVpY2tcbiAqIGFuZCBlYXN5IHdheSB0byBkbyBkYXRhIGJpbmRpbmcgd2l0aG91dCB0aGUgbmVlZCB0byBzZXR1cCBhIG1vZGVsLlxuICogVGhlIGBhdXRvLWJpbmRpbmdgIGVsZW1lbnQgaXRzZWxmIHNlcnZlcyBhcyB0aGUgbW9kZWwgYW5kIGNvbnRyb2xsZXIgZm9yIHRoZVxuICogZWxlbWVudHMgaXQgY29udGFpbnMuIEJvdGggZGF0YSBhbmQgZXZlbnQgaGFuZGxlcnMgY2FuIGJlIGJvdW5kLlxuICpcbiAqIFRoZSBgYXV0by1iaW5kaW5nYCBlbGVtZW50IGFjdHMganVzdCBsaWtlIGEgdGVtcGxhdGUgdGhhdCBpcyBib3VuZCB0b1xuICogYSBtb2RlbC4gSXQgc3RhbXBzIGl0cyBjb250ZW50IGluIHRoZSBkb20gYWRqYWNlbnQgdG8gaXRzZWxmLiBXaGVuIHRoZVxuICogY29udGVudCBpcyBzdGFtcGVkLCB0aGUgYHRlbXBsYXRlLWJvdW5kYCBldmVudCBpcyBmaXJlZC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgICA8dGVtcGxhdGUgaXM9XCJhdXRvLWJpbmRpbmdcIj5cbiAqICAgICAgIDxkaXY+U2F5IHNvbWV0aGluZzogPGlucHV0IHZhbHVlPVwie3t2YWx1ZX19XCI+PC9kaXY+XG4gKiAgICAgICA8ZGl2PllvdSBzYWlkOiB7e3ZhbHVlfX08L2Rpdj5cbiAqICAgICAgIDxidXR0b24gb24tdGFwPVwie3tidXR0b25UYXB9fVwiPlRhcCBtZSE8L2J1dHRvbj5cbiAqICAgICA8L3RlbXBsYXRlPlxuICogICAgIDxzY3JpcHQ+XG4gKiAgICAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCd0ZW1wbGF0ZScpO1xuICogICAgICAgdGVtcGxhdGUudmFsdWUgPSAnc29tZXRoaW5nJztcbiAqICAgICAgIHRlbXBsYXRlLmJ1dHRvblRhcCA9IGZ1bmN0aW9uKCkge1xuICogICAgICAgICBjb25zb2xlLmxvZygndGFwIScpO1xuICogICAgICAgfTtcbiAqICAgICA8L3NjcmlwdD5cbiAqXG4gKiBAbW9kdWxlIFBvbHltZXJcbiAqIEBzdGF0dXMgc3RhYmxlXG4qL1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwb2x5bWVyLWVsZW1lbnQnKTtcbiAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ25hbWUnLCAnYXV0by1iaW5kaW5nJyk7XG4gIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdleHRlbmRzJywgJ3RlbXBsYXRlJyk7XG4gIGVsZW1lbnQuaW5pdCgpO1xuXG4gIFBvbHltZXIoJ2F1dG8tYmluZGluZycsIHtcblxuICAgIGNyZWF0ZWRDYWxsYmFjazogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnN5bnRheCA9IHRoaXMuYmluZGluZ0RlbGVnYXRlID0gdGhpcy5tYWtlU3ludGF4KCk7XG4gICAgICAvLyBkZWxheSBzdGFtcGluZyB1bnRpbCBwb2x5bWVyLXJlYWR5IHNvIHRoYXQgYXV0by1iaW5kaW5nIGlzIG5vdFxuICAgICAgLy8gcmVxdWlyZWQgdG8gbG9hZCBsYXN0LlxuICAgICAgUG9seW1lci53aGVuUG9seW1lclJlYWR5KGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLm1vZGVsID0gdGhpcztcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2JpbmQnLCAnJyk7XG4gICAgICAgIC8vIHdlIGRvbid0IGJvdGhlciB3aXRoIGFuIGV4cGxpY2l0IHNpZ25hbCBoZXJlLCB3ZSBjb3VsZCB1c3QgYSBNT1xuICAgICAgICAvLyBpZiBuZWNlc3NhcnlcbiAgICAgICAgdGhpcy5hc3luYyhmdW5jdGlvbigpIHtcbiAgICAgICAgICAvLyBub3RlOiB0aGlzIHdpbGwgbWFyc2hhbGwgKmFsbCogdGhlIGVsZW1lbnRzIGluIHRoZSBwYXJlbnROb2RlXG4gICAgICAgICAgLy8gcmF0aGVyIHRoYW4ganVzdCBzdGFtcGVkIG9uZXMuIFdlJ2QgbmVlZCB0byB1c2UgY3JlYXRlSW5zdGFuY2VcbiAgICAgICAgICAvLyB0byBmaXggdGhpcyBvciBzb21ldGhpbmcgZWxzZSBmYW5jaWVyLlxuICAgICAgICAgIHRoaXMubWFyc2hhbE5vZGVSZWZlcmVuY2VzKHRoaXMucGFyZW50Tm9kZSk7XG4gICAgICAgICAgLy8gdGVtcGxhdGUgc3RhbXBpbmcgaXMgYXN5bmNocm9ub3VzIHNvIHN0YW1waW5nIGlzbid0IGNvbXBsZXRlXG4gICAgICAgICAgLy8gYnkgcG9seW1lci1yZWFkeTsgZmlyZSBhbiBldmVudCBzbyB1c2VycyBjYW4gdXNlIHN0YW1wZWQgZWxlbWVudHNcbiAgICAgICAgICB0aGlzLmZpcmUoJ3RlbXBsYXRlLWJvdW5kJyk7XG4gICAgICAgIH0pO1xuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgbWFrZVN5bnRheDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShQb2x5bWVyLmFwaS5kZWNsYXJhdGlvbi5ldmVudHMpO1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgZXZlbnRzLmZpbmRDb250cm9sbGVyID0gZnVuY3Rpb24oKSB7IHJldHVybiBzZWxmLm1vZGVsOyB9O1xuXG4gICAgICB2YXIgc3ludGF4ID0gbmV3IFBvbHltZXJFeHByZXNzaW9ucygpO1xuICAgICAgdmFyIHByZXBhcmVCaW5kaW5nID0gc3ludGF4LnByZXBhcmVCaW5kaW5nO1xuICAgICAgc3ludGF4LnByZXBhcmVCaW5kaW5nID0gZnVuY3Rpb24ocGF0aFN0cmluZywgbmFtZSwgbm9kZSkge1xuICAgICAgICByZXR1cm4gZXZlbnRzLnByZXBhcmVFdmVudEJpbmRpbmcocGF0aFN0cmluZywgbmFtZSwgbm9kZSkgfHxcbiAgICAgICAgICAgICAgIHByZXBhcmVCaW5kaW5nLmNhbGwoc3ludGF4LCBwYXRoU3RyaW5nLCBuYW1lLCBub2RlKTtcbiAgICAgIH07XG4gICAgICByZXR1cm4gc3ludGF4O1xuICAgIH1cblxuICB9KTtcblxufSkoKTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9ib3dlcl9jb21wb25lbnRzL3BvbHltZXIvcG9seW1lci5qc1xuICoqIG1vZHVsZSBpZCA9IDFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obW9kdWxlKSB7XHJcblx0aWYoIW1vZHVsZS53ZWJwYWNrUG9seWZpbGwpIHtcclxuXHRcdG1vZHVsZS5kZXByZWNhdGUgPSBmdW5jdGlvbigpIHt9O1xyXG5cdFx0bW9kdWxlLnBhdGhzID0gW107XHJcblx0XHQvLyBtb2R1bGUucGFyZW50ID0gdW5kZWZpbmVkIGJ5IGRlZmF1bHRcclxuXHRcdG1vZHVsZS5jaGlsZHJlbiA9IFtdO1xyXG5cdFx0bW9kdWxlLndlYnBhY2tQb2x5ZmlsbCA9IDE7XHJcblx0fVxyXG5cdHJldHVybiBtb2R1bGU7XHJcbn1cclxuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAod2VicGFjaykvYnVpbGRpbi9tb2R1bGUuanNcbiAqKiBtb2R1bGUgaWQgPSAyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iXSwic291cmNlUm9vdCI6IiIsImZpbGUiOiJidW5kbGUuanMifQ==