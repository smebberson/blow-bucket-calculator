/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
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
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 18);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var extend = __webpack_require__(1);

var markoGlobal = extend(window.$MG, {
  uid: 0
});

window.$MG = markoGlobal;

var runtimeId = markoGlobal.uid++;

var componentLookup = {};

var defaultDocument = document;
var EMPTY_OBJECT = {};

function getComponentForEl(el, doc) {
    if (el) {
        var node = typeof el == 'string' ? (doc || defaultDocument).getElementById(el) : el;
        if (node) {
            var component = node._w;

            while(component) {
                var rootFor = component.___rootFor;
                if (rootFor)  {
                    component = rootFor;
                } else {
                    break;
                }
            }

            return component;
        }
    }
}

var lifecycleEventMethods = {};

[
    'create',
    'render',
    'update',
    'mount',
    'destroy'
].forEach(function(eventName) {
    lifecycleEventMethods[eventName] = 'on' + eventName[0].toUpperCase() + eventName.substring(1);
});

/**
 * This method handles invoking a component's event handler method
 * (if present) while also emitting the event through
 * the standard EventEmitter.prototype.emit method.
 *
 * Special events and their corresponding handler methods
 * include the following:
 *
 * beforeDestroy --> onBeforeDestroy
 * destroy       --> onDestroy
 * beforeUpdate  --> onBeforeUpdate
 * update        --> onUpdate
 * render        --> onRender
 */
function emitLifecycleEvent(component, eventType, eventArg1, eventArg2) {
    var listenerMethod = component[lifecycleEventMethods[eventType]];

    if (listenerMethod !== undefined) {
        listenerMethod.call(component, eventArg1, eventArg2);
    }

    component.emit(eventType, eventArg1, eventArg2);
}

function destroyComponentForEl(el) {
    var componentToDestroy = el._w;
    if (componentToDestroy) {
        componentToDestroy.___destroyShallow();
        el._w = null;

        while ((componentToDestroy = componentToDestroy.___rootFor)) {
            componentToDestroy.___rootFor = null;
            componentToDestroy.___destroyShallow();
        }
    }
}
function destroyElRecursive(el) {
    var curChild = el.firstChild;
    while(curChild) {
        if (curChild.nodeType === 1) {
            destroyComponentForEl(curChild);
            destroyElRecursive(curChild);
        }
        curChild = curChild.nextSibling;
    }
}

function nextComponentId() {
    // Each component will get an ID that is unique across all loaded
    // marko runtimes. This allows multiple instances of marko to be
    // loaded in the same window and they should all place nice
    // together
    return 'b' + ((markoGlobal.uid)++);
}

function nextComponentIdProvider(out) {
    return nextComponentId;
}

function getElementById(doc, id) {
    return doc.getElementById(id);
}

function attachBubblingEvent(componentDef, handlerMethodName, extraArgs) {
    if (handlerMethodName) {
        var id = componentDef.id;
        if (extraArgs) {
            var isRerenderInBrowser = componentDef.___globalComponentsContext.___isRerenderInBrowser;

            if (isRerenderInBrowser === true) {
                // If we are bootstrapping a page rendered on the server
                // we need to put the actual event args on the UI component
                // since we will not actually be updating the DOM
                var component = componentDef.___component;

                var bubblingDomEvents = component.___bubblingDomEvents ||
                    ( component.___bubblingDomEvents = [] );

                bubblingDomEvents.push(extraArgs);

                return;
            } else {
                return [handlerMethodName, id, extraArgs];
            }
        } else {
            return [handlerMethodName, id];
        }
    }
}

function getMarkoPropsFromEl(el) {
    var virtualProps = el._vprops;
    if (virtualProps === undefined) {
        virtualProps = el.getAttribute('data-marko');
        if (virtualProps) {
            virtualProps = JSON.parse(virtualProps);
        }
        el._vprops = virtualProps = virtualProps || EMPTY_OBJECT;
    }

    return virtualProps;
}

exports.___runtimeId = runtimeId;
exports.___componentLookup = componentLookup;
exports.___getComponentForEl = getComponentForEl;
exports.___emitLifecycleEvent = emitLifecycleEvent;
exports.___destroyComponentForEl = destroyComponentForEl;
exports.___destroyElRecursive = destroyElRecursive;
exports.___nextComponentIdProvider = nextComponentIdProvider;
exports.___getElementById = getElementById;
exports.___attachBubblingEvent = attachBubblingEvent;
exports.___getMarkoPropsFromEl = getMarkoPropsFromEl;


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = function extend(target, source) { //A simple function to copy properties from one object to another
    if (!target) { //Check if a target was provided, otherwise create a new empty object to return
        target = {};
    }

    if (source) {
        for (var propName in source) {
            if (source.hasOwnProperty(propName)) { //Only look at source properties that are not inherited
                target[propName] = source[propName]; //Copy the property
            }
        }
    }

    return target;
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var copyProps = __webpack_require__(12);

function inherit(ctor, superCtor, shouldCopyProps) {
    var oldProto = ctor.prototype;
    var newProto = ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
            value: ctor,
            writable: true,
            configurable: true
        }
    });
    if (oldProto && shouldCopyProps !== false) {
        copyProps(oldProto, newProto);
    }
    ctor.$super = superCtor;
    ctor.prototype = newProto;
    return ctor;
}


module.exports = inherit;
inherit._inherit = inherit;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

/* jshint newcap:false */
var specialElHandlers = __webpack_require__(11);

function VNode() {}

VNode.prototype = {
    ___VNode: function(finalChildCount) {
        this.___finalChildCount = finalChildCount;
        this.___childCount = 0;
        this.___firstChildInternal = null;
        this.___lastChild = null;
        this.___parentNode = null;
        this.___nextSiblingInternal = null;
    },

    get ___firstChild() {
        var firstChild = this.___firstChildInternal;

        if (firstChild && firstChild.___DocumentFragment) {
            var nestedFirstChild = firstChild.___firstChild;
            // The first child is a DocumentFragment node.
            // If the DocumentFragment node has a first child then we will return that.
            // Otherwise, the DocumentFragment node is not *really* the first child and
            // we need to skip to its next sibling
            return nestedFirstChild || firstChild.___nextSibling;
        }

        return firstChild;
    },

    get ___nextSibling() {
        var nextSibling = this.___nextSiblingInternal;

        if (nextSibling) {
            if (nextSibling.___DocumentFragment) {
                var firstChild = nextSibling.___firstChild;
                return firstChild || nextSibling.___nextSibling;
            }
        } else {
            var parentNode = this.___parentNode;
            if (parentNode && parentNode.___DocumentFragment) {
                return parentNode.___nextSibling;
            }
        }

        return nextSibling;
    },

    ___appendChild: function(child) {
        this.___childCount++;

        if (this.___isTextArea) {
            if (child.___Text) {
                var childValue = child.___nodeValue;
                this.___value = (this.___value || '') + childValue;
            } else {
                throw TypeError();
            }
        } else {
            var lastChild = this.___lastChild;

            child.___parentNode = this;

            if (lastChild) {
                lastChild.___nextSiblingInternal = child;
            } else {
                this.___firstChildInternal = child;
            }

            this.___lastChild = child;
        }

        return child;
    },

    ___finishChild: function finishChild() {
        if (this.___childCount == this.___finalChildCount && this.___parentNode) {
            return this.___parentNode.___finishChild();
        } else {
            return this;
        }
    },

    actualize: function(doc) {
        var actualNode = this.___actualize(doc);

        var curChild = this.___firstChild;

        while(curChild) {
            actualNode.appendChild(curChild.actualize(doc));
            curChild = curChild.___nextSibling;
        }

        if (this.___nodeType === 1) {
            var elHandler = specialElHandlers[this.___nodeName];
            if (elHandler !== undefined) {
                elHandler(actualNode, this);
            }
        }

        return actualNode;
    }

    // ,toJSON: function() {
    //     var clone = Object.assign({
    //         nodeType: this.nodeType
    //     }, this);
    //
    //     for (var k in clone) {
    //         if (k.startsWith('_')) {
    //             delete clone[k];
    //         }
    //     }
    //     delete clone._nextSibling;
    //     delete clone._lastChild;
    //     delete clone.parentNode;
    //     return clone;
    // }
};

module.exports = VNode;


/***/ }),
/* 4 */
/***/ (function(module, exports) {

var actualCreateOut;

function setCreateOut(createOutFunc) {
    actualCreateOut = createOutFunc;
}

function createOut(globalData) {
    return actualCreateOut(globalData);
}

createOut.___setCreateOut = setCreateOut;

module.exports = createOut;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var repeatedRegExp = /\[\]$/;
var componentUtil = __webpack_require__(0);
var attachBubblingEvent = componentUtil.___attachBubblingEvent;
var extend = __webpack_require__(1);

/**
 * A ComponentDef is used to hold the metadata collected at runtime for
 * a single component and this information is used to instantiate the component
 * later (after the rendered HTML has been added to the DOM)
 */
function ComponentDef(component, componentId, globalComponentsContext, componentStack, componentStackLen) {
    this.___globalComponentsContext = globalComponentsContext; // The AsyncWriter that this component is associated with
    this.___componentStack = componentStack;
    this.___componentStackLen = componentStackLen;
    this.___component = component;
    this.id = componentId;

    this.___roots =  null;            // IDs of root elements if there are multiple root elements
    this.___children = null;          // An array of nested ComponentDef instances
    this.___domEvents = undefined;         // An array of DOM events that need to be added (in sets of three)

    this.___isExisting = false;

    this.___willRerenderInBrowser = false;

    this.___nextIdIndex = 0; // The unique integer to use for the next scoped ID
}

ComponentDef.prototype = {
    ___end: function() {
        this.___componentStack.length = this.___componentStackLen;
    },

    /**
     * Register a nested component for this component. We maintain a tree of components
     * so that we can instantiate nested components before their parents.
     */
    ___addChild: function (componentDef) {
        var children = this.___children;

        if (children) {
            children.push(componentDef);
        } else {
            this.___children = [componentDef];
        }
    },
    /**
     * This helper method generates a unique and fully qualified DOM element ID
     * that is unique within the scope of the current component. This method prefixes
     * the the nestedId with the ID of the current component. If nestedId ends
     * with `[]` then it is treated as a repeated ID and we will generate
     * an ID with the current index for the current nestedId.
     * (e.g. "myParentId-foo[0]", "myParentId-foo[1]", etc.)
     */
    elId: function (nestedId) {
        var id = this.id;
        if (nestedId == null) {
            return id;
        } else {
            if (typeof nestedId == 'string' && repeatedRegExp.test(nestedId)) {
                return this.___globalComponentsContext.___nextRepeatedId(id, nestedId);
            } else {
                return id + '-' + nestedId;
            }
        }
    },
    /**
     * Registers a DOM event for a nested HTML element associated with the
     * component. This is only done for non-bubbling events that require
     * direct event listeners to be added.
     * @param  {String} type The DOM event type ("mouseover", "mousemove", etc.)
     * @param  {String} targetMethod The name of the method to invoke on the scoped component
     * @param  {String} elId The DOM element ID of the DOM element that the event listener needs to be added too
     */
     e: function(type, targetMethod, elId, extraArgs) {
        if (targetMethod) {
            // The event handler method is allowed to be conditional. At render time if the target
            // method is null then we do not attach any direct event listeners.
            (this.___domEvents || (this.___domEvents = [])).push([
                type,
                targetMethod,
                elId,
                extraArgs]);
        }
    },
    /**
     * Returns the next auto generated unique ID for a nested DOM element or nested DOM component
     */
    ___nextComponentId: function() {
        var id = this.id;

        return id === null ?
            this.___globalComponentsContext.___nextComponentId(this.___out) :
            id + '-c' + (this.___nextIdIndex++);
    },

    d: function(handlerMethodName, extraArgs) {
        return attachBubblingEvent(this, handlerMethodName, extraArgs);
    }
};

ComponentDef.___deserialize = function(o, types, globals, registry) {
    var id        = o[0];
    var typeName  = types[o[1]];
    var input     = o[2];
    var extra     = o[3];

    var state = extra.s;
    var componentProps = extra.w;

    var component = typeName /* legacy */ && registry.___createComponent(typeName, id);

    if (extra.b) {
        component.___bubblingDomEvents = extra.b;
    }

    // Preview newly created component from being queued for update since we area
    // just building it from the server info
    component.___updateQueued = true;

    if (state) {
        var undefinedPropNames = extra.u;
        if (undefinedPropNames) {
            undefinedPropNames.forEach(function(undefinedPropName) {
                state[undefinedPropName] = undefined;
            });
        }
        // We go through the setter here so that we convert the state object
        // to an instance of `State`
        component.state = state;
    }

    component.___input = input;

    if (componentProps) {
        extend(component, componentProps);
    }

    var scope = extra.p;
    var customEvents = extra.e;
    if (customEvents) {
        component.___setCustomEvents(customEvents, scope);
    }

    component.___global = globals;

    return {
        ___component: component,
        ___roots: extra.r,
        ___domEvents: extra.d,
        ___willRerenderInBrowser: extra._ === 1
    };
};

module.exports = ComponentDef;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var loadComponent = __webpack_require__(44);
var defineComponent = __webpack_require__(17);

var registered = {};
var loaded = {};
var componentTypes = {};

function register(typeName, def) {
    // We do this to kick off registering of nested components
    // but we don't use the return value just yet since there
    // is a good chance that it resulted in a circular dependency
    def();

    registered[typeName] = def;
    delete loaded[typeName];
    delete componentTypes[typeName];
    return typeName;
}

function load(typeName) {
    var target = loaded[typeName];
    if (!target) {
        target = registered[typeName];

        if (target) {
            target = target();
        } else {
            target = loadComponent(typeName); // Assume the typeName has been fully resolved already
        }

        if (!target) {
            throw Error('Not found: ' + typeName);
        }

        loaded[typeName] = target;
    }

    return target;
}

function getComponentClass(typeName) {
    var ComponentClass = componentTypes[typeName];

    if (ComponentClass) {
        return ComponentClass;
    }

    ComponentClass = load(typeName);

    ComponentClass = ComponentClass.Component || ComponentClass;

    if (!ComponentClass.___isComponent) {
        ComponentClass = defineComponent(ComponentClass, ComponentClass.renderer);
    }

    // Make the component "type" accessible on each component instance
    ComponentClass.prototype.___type = typeName;

    componentTypes[typeName] = ComponentClass;

    return ComponentClass;
}

function createComponent(typeName, id) {
    var ComponentClass = getComponentClass(typeName);
    return new ComponentClass(id);
}

exports.___register = register;
exports.___createComponent = createComponent;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ComponentDef = __webpack_require__(5);
var componentsUtil = __webpack_require__(0);

var beginComponent = __webpack_require__(47);

var EMPTY_OBJECT = {};

function GlobalComponentsContext(out) {
    this.___roots = [];
    this.___preserved = EMPTY_OBJECT;
    this.___preservedBodies = EMPTY_OBJECT;
    this.___componentsById = {};
    this.___out = out;
    this.___rerenderComponent = undefined;
    this.___nextIdLookup = null;
    this.___nextComponentId = componentsUtil.___nextComponentIdProvider(out);
}

GlobalComponentsContext.prototype = {
    ___initComponents: function(doc) {
        var topLevelComponentDefs = null;

        this.___roots.forEach(function(root) {
            var children = root.___children;
            if (children) {
                // NOTE: ComponentsContext.___initClientRendered is provided by
                //       index-browser.js to avoid a circular dependency
                ComponentsContext.___initClientRendered(children, doc);
                if (topLevelComponentDefs === null) {
                    topLevelComponentDefs = children;
                } else {
                    topLevelComponentDefs = topLevelComponentDefs.concat(children);
                }
            }
        });

        this.___roots = null;

        // Reset things stored in global since global is retained for
        // future renders
        this.___out.global.___components = undefined;

        return topLevelComponentDefs;
    },
    ___preserveDOMNode: function(elId, bodyOnly) {
        var preserved = bodyOnly === true ? this.___preservedBodies : this.___preserved;
        if (preserved === EMPTY_OBJECT) {
            if (bodyOnly === true) {
                preserved = this.___preservedBodies = {};
            } else {
                preserved = this.___preserved = {};
            }
        }
        preserved[elId] = true;
    },
    ___nextRepeatedId: function(parentId, id) {
        var nextIdLookup = this.___nextIdLookup || (this.___nextIdLookup = {});

        var indexLookupKey = parentId + '-' + id;
        var currentIndex = nextIdLookup[indexLookupKey];
        if (currentIndex == null) {
            currentIndex = nextIdLookup[indexLookupKey] = 0;
        } else {
            currentIndex = ++nextIdLookup[indexLookupKey];
        }

        return indexLookupKey.slice(0, -2) + '[' + currentIndex + ']';
    }
};

function ComponentsContext(out, parentComponentsContext, shouldAddGlobalRoot) {
    var root;

    var globalComponentsContext;

    if (parentComponentsContext === undefined) {
        globalComponentsContext = out.global.___components;
        if (globalComponentsContext === undefined) {
            out.global.___components = globalComponentsContext = new GlobalComponentsContext(out);
        }

        root = new ComponentDef(null, null, globalComponentsContext);

        if (shouldAddGlobalRoot !== false) {
            globalComponentsContext.___roots.push(root);
        }
    } else {
        globalComponentsContext = parentComponentsContext.___globalContext;
        var parentComponentStack = parentComponentsContext.___componentStack;
        root = parentComponentStack[parentComponentStack.length-1];
    }

    this.___globalContext = globalComponentsContext;
    this.___out = out;
    this.___componentStack = [root];
}

ComponentsContext.prototype = {
    ___createNestedComponentsContext: function(nestedOut) {
        return new ComponentsContext(nestedOut, this);
    },
    ___beginComponent: beginComponent,

    ___nextComponentId: function() {
        var componentStack = this.___componentStack;
        var parentComponentDef = componentStack[componentStack.length - 1];
        return parentComponentDef.___nextComponentId();
    }
};

function getComponentsContext(out) {
    return out.data.___components || (out.data.___components = new ComponentsContext(out));
}

module.exports = exports = ComponentsContext;

exports.___getComponentsContext = getComponentsContext;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(8);
// Compiled using marko@4.4.28 - DO NOT EDIT
"use strict";

var marko_template = module.exports = __webpack_require__(29).t(),
    marko_component = {
        onCreate: function() {
          this.state = this.calculateState(Cookie.get("income") || 1000);
        },
        onIncomeChange: function(evt, el) {
          var income = evt.target.value;

          Cookie.set("income", income, {
              expires: 365
            });

          this.state = this.calculateState(income);
        },
        onYourPercentChange: function(type, evt, el) {
          var typeValue = evt.target.value;

          Cookie.set(type + "PercentCustom", typeValue);

          this.state = this.calculateState(this.state.income);
        },
        calculateState: function(income) {
          var defaults = this.calculatorDefaults();

          Object.assign(defaults, {
              income: income,
              living: (income * defaults.livingPercent) / 100,
              splurge: (income * defaults.splurgePercent) / 100,
              smile: (income * defaults.smilePercent) / 100,
              fireExtinguisher: (income * defaults.fireExtinguisherPercent) / 100,
              livingCustom: (income * defaults.livingPercentCustom) / 100,
              splurgeCustom: (income * defaults.splurgePercentCustom) / 100,
              smileCustom: (income * defaults.smilePercentCustom) / 100,
              fireExtinguisherCustom: (income * defaults.fireExtinguisherPercentCustom) / 100
            });

          defaults.incomeCustom = ((defaults.livingCustom + defaults.smileCustom) + defaults.splurgeCustom) + defaults.fireExtinguisherCustom;

          defaults.customPercentTotal = ((Number(defaults.livingPercentCustom) + Number(defaults.smilePercentCustom)) + Number(defaults.splurgePercentCustom)) + Number(defaults.fireExtinguisherPercentCustom);

          return defaults;
        },
        calculatorDefaults: function() {
          var defaults = {
                  livingPercent: 60,
                  splurgePercent: 10,
                  smilePercent: 10,
                  fireExtinguisherPercent: 20
                };

          defaults.livingPercentCustom = Cookie.get("livingPercentCustom") || defaults.livingPercent;

          defaults.splurgePercentCustom = Cookie.get("splurgePercentCustom") || defaults.splurgePercent;

          defaults.smilePercentCustom = Cookie.get("smilePercentCustom") || defaults.smilePercent;

          defaults.fireExtinguisherPercentCustom = Cookie.get("fireExtinguisherPercentCustom") || defaults.fireExtinguisherPercent;

          return defaults;
        }
      },
    components_helpers = __webpack_require__(38),
    marko_registerComponent = components_helpers.rc,
    marko_componentType = marko_registerComponent("/blow-bucket-calculator$1.0.0/calculator.marko", function() {
      return module.exports;
    }),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c,
    marko_attrs0 = {
        "class": "row calc-income"
      },
    marko_attrs1 = {
        "class": "row calc-blow-bucket"
      },
    marko_helpers = __webpack_require__(53),
    marko_createElement = marko_helpers.e,
    marko_const = marko_helpers.const,
    marko_const_nextId = marko_const("4c1bad"),
    marko_node0 = marko_createElement("DIV", {
        "class": "col-xs-10 col-sm-7"
      }, 2, 0, {
        c: marko_const_nextId()
      })
      .e("H2", null, 1)
        .t("Income")
      .e("LABEL", {
          "class": "h5 income-help",
          "for": "income"
        }, 1)
        .t("Enter your weekly income, after tax."),
    marko_attrs2 = {
        "class": "col-xs-2 col-sm-5"
      },
    marko_attrs3 = {
        "class": "input-group input-group-lg"
      },
    marko_node1 = marko_createElement("SPAN", {
        "class": "input-group-addon dollars"
      }, 1, 0, {
        c: marko_const_nextId()
      })
      .t("$"),
    marko_node2 = marko_createElement("SPAN", {
        "class": "input-group-addon cents"
      }, 1, 0, {
        c: marko_const_nextId()
      })
      .t(".00"),
    marko_attrs4 = {
        "class": "col"
      },
    marko_attrs5 = {
        "class": "r-table"
      },
    marko_node3 = marko_createElement("DIV", {
        "class": "r-table-head"
      }, 1, 0, {
        c: marko_const_nextId()
      })
      .e("DIV", {
          "class": "r-table-row"
        }, 4)
        .e("DIV", {
            "class": "r-table-td"
          }, 1)
          .t("Category")
        .e("DIV", {
            "class": "r-table-td"
          }, 1)
          .t("%")
        .e("DIV", {
            "class": "r-table-td"
          }, 1)
          .t("Weekly")
        .e("DIV", {
            "class": "r-table-td"
          }, 1)
          .t("Yearly"),
    marko_attrs6 = {
        "class": "r-table-row"
      },
    marko_attrs7 = {
        "class": "r-table-row what-if"
      },
    marko_attrs8 = {
        "class": "r-table-row"
      },
    marko_attrs9 = {
        "class": "r-table-row what-if"
      },
    marko_attrs10 = {
        "class": "r-table-row"
      },
    marko_attrs11 = {
        "class": "r-table-row what-if"
      },
    marko_attrs12 = {
        "class": "r-table-row"
      },
    marko_attrs13 = {
        "class": "r-table-row what-if"
      },
    marko_attrs14 = {
        "class": "r-table-foot"
      },
    marko_node4 = marko_createElement("DIV", {
        "class": "r-table-td"
      }, 1, 0, {
        c: marko_const_nextId()
      })
      .t("Living"),
    marko_attrs15 = {
        "class": "r-table-td"
      },
    marko_attrs16 = {
        "class": "r-table-td"
      },
    marko_attrs17 = {
        "class": "r-table-td"
      },
    marko_node5 = marko_createElement("DIV", {
        "class": "r-table-td"
      }, 1, 0, {
        c: marko_const_nextId()
      })
      .t(" "),
    marko_attrs18 = {
        "class": "r-table-td"
      },
    marko_attrs19 = {
        "class": "r-table-td"
      },
    marko_attrs20 = {
        "class": "r-table-td"
      },
    marko_attrs21 = {
        "class": "input-group"
      },
    marko_node6 = marko_createElement("DIV", {
        "class": "input-group-addon"
      }, 1, 0, {
        c: marko_const_nextId()
      })
      .t("%"),
    marko_node7 = marko_createElement("DIV", {
        "class": "r-table-td"
      }, 1, 0, {
        c: marko_const_nextId()
      })
      .t("Splurge"),
    marko_attrs22 = {
        "class": "r-table-td"
      },
    marko_attrs23 = {
        "class": "r-table-td"
      },
    marko_attrs24 = {
        "class": "r-table-td"
      },
    marko_node8 = marko_createElement("DIV", {
        "class": "r-table-td"
      }, 1, 0, {
        c: marko_const_nextId()
      })
      .t(" "),
    marko_attrs25 = {
        "class": "r-table-td"
      },
    marko_attrs26 = {
        "class": "r-table-td"
      },
    marko_attrs27 = {
        "class": "r-table-td"
      },
    marko_attrs28 = {
        "class": "input-group"
      },
    marko_node9 = marko_createElement("DIV", {
        "class": "input-group-addon"
      }, 1, 0, {
        c: marko_const_nextId()
      })
      .t("%"),
    marko_node10 = marko_createElement("DIV", {
        "class": "r-table-td"
      }, 1, 0, {
        c: marko_const_nextId()
      })
      .t("Smile"),
    marko_attrs29 = {
        "class": "r-table-td"
      },
    marko_attrs30 = {
        "class": "r-table-td"
      },
    marko_attrs31 = {
        "class": "r-table-td"
      },
    marko_node11 = marko_createElement("DIV", {
        "class": "r-table-td"
      }, 1, 0, {
        c: marko_const_nextId()
      })
      .t(" "),
    marko_attrs32 = {
        "class": "r-table-td"
      },
    marko_attrs33 = {
        "class": "r-table-td"
      },
    marko_attrs34 = {
        "class": "r-table-td"
      },
    marko_attrs35 = {
        "class": "input-group"
      },
    marko_node12 = marko_createElement("DIV", {
        "class": "input-group-addon"
      }, 1, 0, {
        c: marko_const_nextId()
      })
      .t("%"),
    marko_node13 = marko_createElement("DIV", {
        "class": "r-table-td"
      }, 1, 0, {
        c: marko_const_nextId()
      })
      .t("Fire Ex."),
    marko_attrs36 = {
        "class": "r-table-td"
      },
    marko_attrs37 = {
        "class": "r-table-td"
      },
    marko_attrs38 = {
        "class": "r-table-td"
      },
    marko_node14 = marko_createElement("DIV", {
        "class": "r-table-td"
      }, 1, 0, {
        c: marko_const_nextId()
      })
      .t(" "),
    marko_attrs39 = {
        "class": "r-table-td"
      },
    marko_attrs40 = {
        "class": "r-table-td"
      },
    marko_attrs41 = {
        "class": "r-table-td"
      },
    marko_attrs42 = {
        "class": "input-group"
      },
    marko_node15 = marko_createElement("DIV", {
        "class": "input-group-addon"
      }, 1, 0, {
        c: marko_const_nextId()
      })
      .t("%"),
    marko_attrs43 = {
        "class": "r-table-row"
      },
    marko_attrs44 = {
        "class": "r-table-row what-if"
      },
    marko_node16 = marko_createElement("DIV", {
        "class": "r-table-td"
      }, 1, 0, {
        c: marko_const_nextId()
      })
      .t("Barefoot total"),
    marko_node17 = marko_createElement("DIV", {
        "class": "r-table-td"
      }, 1, 0, {
        c: marko_const_nextId()
      })
      .t("100 %"),
    marko_attrs45 = {
        "class": "r-table-td"
      },
    marko_attrs46 = {
        "class": "r-table-td"
      },
    marko_node18 = marko_createElement("DIV", {
        "class": "r-table-td"
      }, 1, 0, {
        c: marko_const_nextId()
      })
      .t("What if total"),
    marko_attrs47 = {
        "class": "r-table-td"
      },
    marko_attrs48 = {
        "class": "r-table-td"
      },
    marko_attrs49 = {
        "class": "r-table-td"
      };

var currency = function (amount) {

    amount = Number(amount);

    return amount.toLocaleString('en-AU', {
        currency: 'AUD',
        style: 'currency',
    }).replace(/\D\d\d$/, '');

};

function render(input, out, __component, component, state) {
  var data = input;

  out.e("DIV", {
      "class": "container",
      id: __component.id
    }, 2, 4)
    .e("DIV", marko_attrs0, 2)
      .n(marko_node0)
      .e("DIV", marko_attrs2, 1)
        .e("DIV", marko_attrs3, 3)
          .n(marko_node1)
          .e("INPUT", {
              type: "number",
              "class": "form-control",
              id: "income",
              placeholder: "1000",
              value: state.income
            }, 0, 0, {
              onchange: __component.d("onIncomeChange")
            })
          .n(marko_node2)
    .e("DIV", marko_attrs1, 1)
      .e("DIV", marko_attrs4, 1)
        .e("DIV", marko_attrs5, 10)
          .n(marko_node3)
          .e("DIV", marko_attrs6, 4)
            .n(marko_node4)
            .e("DIV", marko_attrs15, 1)
              .e("SPAN", null, 2)
                .t(state.livingPercent)
                .t(" %")
            .e("DIV", marko_attrs16, 1)
              .e("SPAN", null, 1)
                .t(currency(state.living))
            .e("DIV", marko_attrs17, 1)
              .e("SPAN", null, 1)
                .t(currency(state.living * 52))
          .e("DIV", marko_attrs7, 4)
            .n(marko_node5)
            .e("DIV", marko_attrs18, 1)
              .e("DIV", marko_attrs21, 2)
                .e("INPUT", {
                    type: "number",
                    "class": "form-control text-right your-percentage",
                    value: state.livingPercentCustom
                  }, 0, 0, {
                    onchange: __component.d("onYourPercentChange", [
                        "living"
                      ])
                  })
                .n(marko_node6)
            .e("DIV", marko_attrs19, 1)
              .e("SPAN", null, 1)
                .t(currency(state.livingCustom))
            .e("DIV", marko_attrs20, 1)
              .e("SPAN", null, 1)
                .t(currency(state.livingCustom * 52))
          .e("DIV", marko_attrs8, 4)
            .n(marko_node7)
            .e("DIV", marko_attrs22, 1)
              .e("SPAN", null, 2)
                .t(state.splurgePercent)
                .t(" %")
            .e("DIV", marko_attrs23, 1)
              .e("SPAN", null, 1)
                .t(currency(state.splurge))
            .e("DIV", marko_attrs24, 1)
              .e("SPAN", null, 1)
                .t(currency(state.splurge * 52))
          .e("DIV", marko_attrs9, 4)
            .n(marko_node8)
            .e("DIV", marko_attrs25, 1)
              .e("DIV", marko_attrs28, 2)
                .e("INPUT", {
                    type: "number",
                    "class": "form-control text-right your-percentage",
                    value: state.splurgePercentCustom
                  }, 0, 0, {
                    onchange: __component.d("onYourPercentChange", [
                        "splurge"
                      ])
                  })
                .n(marko_node9)
            .e("DIV", marko_attrs26, 1)
              .e("SPAN", null, 1)
                .t(currency(state.splurgeCustom))
            .e("DIV", marko_attrs27, 1)
              .e("SPAN", null, 1)
                .t(currency(state.splurgeCustom * 52))
          .e("DIV", marko_attrs10, 4)
            .n(marko_node10)
            .e("DIV", marko_attrs29, 1)
              .e("SPAN", null, 2)
                .t(state.smilePercent)
                .t(" %")
            .e("DIV", marko_attrs30, 1)
              .e("SPAN", null, 1)
                .t(currency(state.smile))
            .e("DIV", marko_attrs31, 1)
              .e("SPAN", null, 1)
                .t(currency(state.smile * 52))
          .e("DIV", marko_attrs11, 4)
            .n(marko_node11)
            .e("DIV", marko_attrs32, 1)
              .e("DIV", marko_attrs35, 2)
                .e("INPUT", {
                    type: "number",
                    "class": "form-control text-right your-percentage",
                    value: state.smilePercentCustom
                  }, 0, 0, {
                    onchange: __component.d("onYourPercentChange", [
                        "smile"
                      ])
                  })
                .n(marko_node12)
            .e("DIV", marko_attrs33, 1)
              .e("SPAN", null, 1)
                .t(currency(state.smileCustom))
            .e("DIV", marko_attrs34, 1)
              .e("SPAN", null, 1)
                .t(currency(state.smileCustom * 52))
          .e("DIV", marko_attrs12, 4)
            .n(marko_node13)
            .e("DIV", marko_attrs36, 1)
              .e("SPAN", null, 2)
                .t(state.fireExtinguisherPercent)
                .t(" %")
            .e("DIV", marko_attrs37, 1)
              .e("SPAN", null, 1)
                .t(currency(state.fireExtinguisher))
            .e("DIV", marko_attrs38, 1)
              .e("SPAN", null, 1)
                .t(currency(state.fireExtinguisher * 52))
          .e("DIV", marko_attrs13, 4)
            .n(marko_node14)
            .e("DIV", marko_attrs39, 1)
              .e("DIV", marko_attrs42, 2)
                .e("INPUT", {
                    type: "number",
                    "class": "form-control text-right your-percentage",
                    value: state.fireExtinguisherPercentCustom
                  }, 0, 0, {
                    onchange: __component.d("onYourPercentChange", [
                        "fireExtinguisher"
                      ])
                  })
                .n(marko_node15)
            .e("DIV", marko_attrs40, 1)
              .e("SPAN", null, 1)
                .t(currency(state.fireExtinguisherCustom))
            .e("DIV", marko_attrs41, 1)
              .e("SPAN", null, 1)
                .t(currency(state.fireExtinguisherCustom * 52))
          .e("DIV", marko_attrs14, 2)
            .e("DIV", marko_attrs43, 4)
              .n(marko_node16)
              .n(marko_node17)
              .e("DIV", marko_attrs45, 1)
                .e("SPAN", null, 1)
                  .t(currency(state.income))
              .e("DIV", marko_attrs46, 1)
                .e("SPAN", null, 1)
                  .t(currency(state.income * 52))
            .e("DIV", marko_attrs44, 4)
              .n(marko_node18)
              .e("DIV", marko_attrs47, 2)
                .t(state.customPercentTotal)
                .t(" %")
              .e("DIV", marko_attrs48, 1)
                .t(currency(state.incomeCustom))
              .e("DIV", marko_attrs49, 1)
                .e("SPAN", null, 1)
                  .t(currency(state.incomeCustom * 52));
}

marko_template._ = marko_renderer(render, {
    type: marko_componentType
  }, marko_component);

marko_template.Component = marko_defineComponent(marko_component, marko_template._);


/***/ }),
/* 9 */
/***/ (function(module, exports) {

/* jshint newcap:false */
var slice = Array.prototype.slice;

function isFunction(arg) {
    return typeof arg === 'function';
}

function checkListener(listener) {
    if (!isFunction(listener)) {
        throw TypeError('Invalid listener');
    }
}

function invokeListener(ee, listener, args) {
    switch (args.length) {
        // fast cases
        case 1:
            listener.call(ee);
            break;
        case 2:
            listener.call(ee, args[1]);
            break;
        case 3:
            listener.call(ee, args[1], args[2]);
            break;
            // slower
        default:
            listener.apply(ee, slice.call(args, 1));
    }
}

function addListener(eventEmitter, type, listener, prepend) {
    checkListener(listener);

    var events = eventEmitter.$e || (eventEmitter.$e = {});

    var listeners = events[type];
    if (listeners) {
        if (isFunction(listeners)) {
            events[type] = prepend ? [listener, listeners] : [listeners, listener];
        } else {
            if (prepend) {
                listeners.unshift(listener);
            } else {
                listeners.push(listener);
            }
        }

    } else {
        events[type] = listener;
    }
    return eventEmitter;
}

function EventEmitter() {
    this.$e = this.$e || {};
}

EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype = {
    $e: null,

    emit: function(type) {
        var args = arguments;

        var events = this.$e;
        if (!events) {
            return;
        }

        var listeners = events && events[type];
        if (!listeners) {
            // If there is no 'error' event listener then throw.
            if (type === 'error') {
                var error = args[1];
                if (!(error instanceof Error)) {
                    var context = error;
                    error = new Error('Error: ' + context);
                    error.context = context;
                }

                throw error; // Unhandled 'error' event
            }

            return false;
        }

        if (isFunction(listeners)) {
            invokeListener(this, listeners, args);
        } else {
            listeners = slice.call(listeners);

            for (var i=0, len=listeners.length; i<len; i++) {
                var listener = listeners[i];
                invokeListener(this, listener, args);
            }
        }

        return true;
    },

    on: function(type, listener) {
        return addListener(this, type, listener, false);
    },

    prependListener: function(type, listener) {
        return addListener(this, type, listener, true);
    },

    once: function(type, listener) {
        checkListener(listener);

        function g() {
            this.removeListener(type, g);

            if (listener) {
                listener.apply(this, arguments);
                listener = null;
            }
        }

        this.on(type, g);

        return this;
    },

    // emits a 'removeListener' event iff the listener was removed
    removeListener: function(type, listener) {
        checkListener(listener);

        var events = this.$e;
        var listeners;

        if (events && (listeners = events[type])) {
            if (isFunction(listeners)) {
                if (listeners === listener) {
                    delete events[type];
                }
            } else {
                for (var i=listeners.length-1; i>=0; i--) {
                    if (listeners[i] === listener) {
                        listeners.splice(i, 1);
                    }
                }
            }
        }

        return this;
    },

    removeAllListeners: function(type) {
        var events = this.$e;
        if (events) {
            delete events[type];
        }
    },

    listenerCount: function(type) {
        var events = this.$e;
        var listeners = events && events[type];
        return listeners ? (isFunction(listeners) ? 1 : listeners.length) : 0;
    }
};

module.exports = EventEmitter;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

var VNode = __webpack_require__(3);
var VComment = __webpack_require__(34);
var VDocumentFragment = __webpack_require__(35);
var VElement = __webpack_require__(13);
var VText = __webpack_require__(36);

var FLAG_IS_TEXTAREA = 2;
var defaultDocument = typeof document != 'undefined' && document;
var specialHtmlRegexp = /[&<]/;
var xmlnsRegExp = /^xmlns(:|$)/;
var virtualizedProps = { ___virtualized: true };

function virtualizeChildNodes(node, vdomParent) {
    var curChild = node.firstChild;
    while(curChild) {
        vdomParent.___appendChild(virtualize(curChild));
        curChild = curChild.nextSibling;
    }
}

function virtualize(node) {
    switch(node.nodeType) {
        case 1:
            var attributes = node.attributes;
            var attrCount = attributes.length;

            var attrs;

            if (attrCount) {
                attrs = {};
                for (var i=0; i<attrCount; i++) {
                    var attr = attributes[i];
                    var attrName = attr.name;
                    if (!xmlnsRegExp.test(attrName)) {
                        attrs[attrName] = attr.value;
                    }
                }
            }

            var flags = 0;

            var tagName = node.nodeName;
            if (tagName === 'TEXTAREA') {
                flags |= FLAG_IS_TEXTAREA;
            }

            var vdomEl = new VElement(tagName, attrs, null, flags, virtualizedProps);
            if (node.namespaceURI !== 'http://www.w3.org/1999/xhtml') {
                vdomEl.___namespaceURI = node.namespaceURI;
            }

            if (vdomEl.___isTextArea) {
                vdomEl.___value = node.value;
            } else {
                virtualizeChildNodes(node, vdomEl);
            }

            return vdomEl;
        case 3:
            return new VText(node.nodeValue);
        case 8:
            return new VComment(node.nodeValue);
        case 11:
            var vdomDocFragment = new VDocumentFragment();
            virtualizeChildNodes(node, vdomDocFragment);
            return vdomDocFragment;
    }
}

function virtualizeHTML(html, doc) {
    if (!specialHtmlRegexp.test(html)) {
        return new VText(html);
    }

    var container = doc.createElement('body');
    container.innerHTML = html;
    var vdomFragment = new VDocumentFragment();

    var curChild = container.firstChild;
    while(curChild) {
        vdomFragment.___appendChild(virtualize(curChild));
        curChild = curChild.nextSibling;
    }

    return vdomFragment;
}

var Node_prototype = VNode.prototype;

/**
 * Shorthand method for creating and appending a Text node with a given value
 * @param  {String} value The text value for the new Text node
 */
Node_prototype.t = function(value) {
    var type = typeof value;
    var vdomNode;

    if (type !== 'string') {
        if (value == null) {
            value = '';
        } else if (type === 'object') {
            if (value.toHTML) {
                vdomNode = virtualizeHTML(value.toHTML(), document);
            }
        }
    }

    this.___appendChild(vdomNode || new VText(value.toString()));
    return this.___finishChild();
};

/**
 * Shorthand method for creating and appending a Comment node with a given value
 * @param  {String} value The value for the new Comment node
 */
Node_prototype.c = function(value) {
    this.___appendChild(new VComment(value));
    return this.___finishChild();
};

Node_prototype.___appendDocumentFragment = function() {
    return this.___appendChild(new VDocumentFragment());
};

exports.___VComment = VComment;
exports.___VDocumentFragment = VDocumentFragment;
exports.___VElement = VElement;
exports.___VText = VText;
exports.___virtualize = virtualize;
exports.___virtualizeHTML = virtualizeHTML;
exports.___defaultDocument = defaultDocument;


/***/ }),
/* 11 */
/***/ (function(module, exports) {

function syncBooleanAttrProp(fromEl, toEl, name) {
    if (fromEl[name] !== toEl[name]) {
        fromEl[name] = toEl[name];
        if (fromEl[name]) {
            fromEl.setAttribute(name, '');
        } else {
            fromEl.removeAttribute(name, '');
        }
    }
}

module.exports = {
    /**
     * Needed for IE. Apparently IE doesn't think that "selected" is an
     * attribute when reading over the attributes using selectEl.attributes
     */
    OPTION: function(fromEl, toEl) {
        syncBooleanAttrProp(fromEl, toEl, 'selected');
    },
    /**
     * The "value" attribute is special for the <input> element since it sets
     * the initial value. Changing the "value" attribute without changing the
     * "value" property will have no effect since it is only used to the set the
     * initial value.  Similar for the "checked" attribute, and "disabled".
     */
    INPUT: function(fromEl, toEl) {
        syncBooleanAttrProp(fromEl, toEl, 'checked');
        syncBooleanAttrProp(fromEl, toEl, 'disabled');

        if (fromEl.value != toEl.value) {
            fromEl.value = toEl.value;
        }

        if (!toEl.___hasAttribute('value')) {
            fromEl.removeAttribute('value');
        }
    },

    TEXTAREA: function(fromEl, toEl) {
        var newValue = toEl.value;
        if (fromEl.value != newValue) {
            fromEl.value = newValue;
        }

        var firstChild = fromEl.firstChild;
        if (firstChild) {
            // Needed for IE. Apparently IE sets the placeholder as the
            // node value and vise versa. This ignores an empty update.
            var oldValue = firstChild.nodeValue;

            if (oldValue == newValue || (!newValue && oldValue == fromEl.placeholder)) {
                return;
            }

            firstChild.nodeValue = newValue;
        }
    },
    SELECT: function(fromEl, toEl) {
        if (!toEl.___hasAttribute('multiple')) {
            var selectedIndex = -1;
            var i = 0;
            var curChild = toEl.___firstChild;
            while(curChild) {
                if (curChild.___nodeName == 'OPTION') {
                    if (curChild.___hasAttribute('selected')) {
                        selectedIndex = i;
                        break;
                    }
                    i++;
                }
                curChild = curChild.___nextSibling;
            }

            fromEl.selectedIndex = i;
        }
    }
};


/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = function copyProps(from, to) {
    Object.getOwnPropertyNames(from).forEach(function(name) {
        var descriptor = Object.getOwnPropertyDescriptor(from, name);
        Object.defineProperty(to, name, descriptor);
    });
};

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

var VNode = __webpack_require__(3);
var inherit = __webpack_require__(2);

var NS_XLINK = 'http://www.w3.org/1999/xlink';
var ATTR_XLINK_HREF = 'xlink:href';
var toString = String;

var FLAG_IS_SVG = 1;
var FLAG_IS_TEXTAREA = 2;
var FLAG_SIMPLE_ATTRS = 4;

var defineProperty = Object.defineProperty;

var ATTR_HREF = 'href';
var EMPTY_OBJECT = Object.freeze({});

function convertAttrValue(type, value) {
    if (value === true) {
        return '';
    } else if (type == 'object') {
        return JSON.stringify(value);
    } else {
        return toString(value);
    }
}

function setAttribute(el, namespaceURI, name, value) {
    if (namespaceURI === null) {
        el.setAttribute(name, value);
    } else {
        el.setAttributeNS(namespaceURI, name, value);
    }
}

function removeAttribute(el, namespaceURI, name) {
    if (namespaceURI === null) {
        el.removeAttribute(name);
    } else {
        el.removeAttributeNS(namespaceURI, name);
    }
}

function VElementClone(other) {
    this.___firstChildInternal = other.___firstChildInternal;
    this.___parentNode = null;
    this.___nextSiblingInternal = null;

    this.___attributes = other.___attributes;
    this.___properties = other.___properties;
    this.___namespaceURI = other.___namespaceURI;
    this.___nodeName = other.___nodeName;
    this.___flags = other.___flags;
    this.___value = other.___value;
    this.___constId = other.___constId;
}

function VElement(tagName, attrs, childCount, flags, props) {
    this.___VNode(childCount);

    var constId, namespaceURI;

    if (props) {
        constId = props.c;
    }

    if ((this.___flags = flags || 0)) {
        if (flags & FLAG_IS_SVG) {
            namespaceURI = 'http://www.w3.org/2000/svg';
        }
    }

    this.___attributes = attrs || EMPTY_OBJECT;
    this.___properties = props || EMPTY_OBJECT;
    this.___namespaceURI = namespaceURI;
    this.___nodeName = tagName;
    this.___value = null;
    this.___constId = constId;
}

VElement.prototype = {
    ___VElement: true,

    ___nodeType: 1,

    ___cloneNode: function() {
        return new VElementClone(this);
    },

    /**
     * Shorthand method for creating and appending an HTML element
     *
     * @param  {String} tagName    The tag name (e.g. "div")
     * @param  {int|null} attrCount  The number of attributes (or `null` if not known)
     * @param  {int|null} childCount The number of child nodes (or `null` if not known)
     */
    e: function(tagName, attrs, childCount, flags, props) {
        var child = this.___appendChild(new VElement(tagName, attrs, childCount, flags, props));

        if (childCount === 0) {
            return this.___finishChild();
        } else {
            return child;
        }
    },

    /**
     * Shorthand method for creating and appending an HTML element with a dynamic namespace
     *
     * @param  {String} tagName    The tag name (e.g. "div")
     * @param  {int|null} attrCount  The number of attributes (or `null` if not known)
     * @param  {int|null} childCount The number of child nodes (or `null` if not known)
     */
    ed: function(tagName, attrs, childCount, flags, props) {
        var child = this.___appendChild(VElement.___createElementDynamicTag(tagName, attrs, childCount, flags, props));

        if (childCount === 0) {
            return this.___finishChild();
        } else {
            return child;
        }
    },

    /**
     * Shorthand method for creating and appending a static node. The provided node is automatically cloned
     * using a shallow clone since it will be mutated as a result of setting `nextSibling` and `parentNode`.
     *
     * @param  {String} value The value for the new Comment node
     */
    n: function(node) {
        this.___appendChild(node.___cloneNode());
        return this.___finishChild();
    },

    ___actualize: function(doc) {
        var namespaceURI = this.___namespaceURI;
        var tagName = this.___nodeName;

        var attributes = this.___attributes;
        var flags = this.___flags;

        var el = namespaceURI !== undefined ?
            doc.createElementNS(namespaceURI, tagName) :
            doc.createElement(tagName);

        for (var attrName in attributes) {
            var attrValue = attributes[attrName];

            if (attrValue !== false && attrValue != null) {
                var type = typeof attrValue;

                if (type !== 'string') {
                    // Special attributes aren't copied to the real DOM. They are only
                    // kept in the virtual attributes map
                    attrValue = convertAttrValue(type, attrValue);
                }

                if (attrName == ATTR_XLINK_HREF) {
                    setAttribute(el, NS_XLINK, ATTR_HREF, attrValue);
                } else {
                    el.setAttribute(attrName, attrValue);
                }
            }
        }

        if (flags & FLAG_IS_TEXTAREA) {
            el.value = this.___value;
        }

        el._vattrs = attributes;
        el._vprops = this.___properties;
        el._vflags = flags;

        return el;
    },

    ___hasAttribute: function(name) {
        // We don't care about the namespaces since the there
        // is no chance that attributes with the same name will have
        // different namespaces
        var value = this.___attributes[name];
        return value != null && value !== false;
    },
};

inherit(VElement, VNode);

var proto = VElementClone.prototype = VElement.prototype;

['checked', 'selected', 'disabled'].forEach(function(name) {
    defineProperty(proto, name, {
        get: function () {
            var value = this.___attributes[name];
            return value !== false && value != null;
        }
    });
});

defineProperty(proto, 'id', {
    get: function () {
        return this.___attributes.id;
    }
});

defineProperty(proto, 'value', {
    get: function () {
        var value = this.___value;
        if (value == null) {
            value = this.___attributes.value;
        }
        return value != null ? toString(value) : '';
    }
});

defineProperty(proto, '___isTextArea', {
    get: function () {
        return this.___flags & FLAG_IS_TEXTAREA;
    }
});

VElement.___createElementDynamicTag = function(tagName, attrs, childCount, flags, props) {
    var namespace = attrs && attrs.xmlns;
    tagName = namespace ? tagName : tagName.toUpperCase();
    var element = new VElement(tagName, attrs, childCount, flags, props);
    element.___namespaceURI = namespace;
    return element;
};

VElement.___removePreservedAttributes = function(attrs) {
    // By default this static method is a no-op, but if there are any
    // compiled components that have "no-update" attributes then
    // `preserve-attrs.js` will be imported and this method will be replaced
    // with a method that actually does something
    return attrs;
};

VElement.___morphAttrs = function(fromEl, toEl) {

    var removePreservedAttributes = VElement.___removePreservedAttributes;

    var attrs = toEl.___attributes;
    var props = fromEl._vprops = toEl.___properties;

    var attrName;
    var i;

    // We use expando properties to associate the previous HTML
    // attributes provided as part of the VDOM node with the
    // real VElement DOM node. When diffing attributes,
    // we only use our internal representation of the attributes.
    // When diffing for the first time it's possible that the
    // real VElement node will not have the expando property
    // so we build the attribute map from the expando property

    var oldAttrs = fromEl._vattrs;

    if (oldAttrs) {
        if (oldAttrs == attrs) {
            // For constant attributes the same object will be provided
            // every render and we can use that to our advantage to
            // not waste time diffing a constant, immutable attribute
            // map.
            return;
        } else {
            oldAttrs = removePreservedAttributes(oldAttrs, props, true);
        }
    } else {
        // We need to build the attribute map from the real attributes
        oldAttrs = {};

        var oldAttributesList = fromEl.attributes;
        for (i = oldAttributesList.length - 1; i >= 0; --i) {
            var attr = oldAttributesList[i];

            if (attr.specified !== false) {
                attrName = attr.name;
                if (attrName !== 'data-marko') {
                    var attrNamespaceURI = attr.namespaceURI;
                    if (attrNamespaceURI === NS_XLINK) {
                        oldAttrs[ATTR_XLINK_HREF] = attr.value;
                    } else {
                        oldAttrs[attrName] = attr.value;
                    }
                }
            }
        }

        // We don't want preserved attributes to show up in either the old
        // or new attribute map.
        removePreservedAttributes(oldAttrs, props, false);
    }

    fromEl._vattrs = attrs;

    var attrValue;

    var flags = toEl.___flags;
    var oldFlags;

    if (flags & FLAG_SIMPLE_ATTRS && ((oldFlags = fromEl._vflags) & FLAG_SIMPLE_ATTRS)) {
        if (oldAttrs['class'] !== (attrValue = attrs['class'])) {
            fromEl.className = attrValue;
        }
        if (oldAttrs.id !== (attrValue = attrs.id)) {
            fromEl.id = attrValue;
        }
        if (oldAttrs.style !== (attrValue = attrs.style)) {
            fromEl.style.cssText = attrValue;
        }
        return;
    }

    // In some cases we only want to set an attribute value for the first
    // render or we don't want certain attributes to be touched. To support
    // that use case we delete out all of the preserved attributes
    // so it's as if they never existed.
    attrs = removePreservedAttributes(attrs, props, true);

    var namespaceURI;

    // Loop over all of the attributes in the attribute map and compare
    // them to the value in the old map. However, if the value is
    // null/undefined/false then we want to remove the attribute
    for (attrName in attrs) {
        attrValue = attrs[attrName];
        namespaceURI = null;

        if (attrName === ATTR_XLINK_HREF) {
            namespaceURI = NS_XLINK;
            attrName = ATTR_HREF;
        }

        if (attrValue == null || attrValue === false) {
            removeAttribute(fromEl, namespaceURI, attrName);
        } else if (oldAttrs[attrName] !== attrValue) {
            var type = typeof attrValue;

            if (type !== 'string') {
                attrValue = convertAttrValue(type, attrValue);
            }

            setAttribute(fromEl, namespaceURI, attrName, attrValue);
        }
    }

    // If there are any old attributes that are not in the new set of attributes
    // then we need to remove those attributes from the target node
    //
    // NOTE: We can skip this if the the element is keyed because if the element
    //       is keyed then we know we already processed all of the attributes for
    //       both the target and original element since target VElement nodes will
    //       have all attributes declared. However, we can only skip if the node
    //       was not a virtualized node (i.e., a node that was not rendered by a
    //       Marko template, but rather a node that was created from an HTML
    //       string or a real DOM node).
    if (!attrs.id || props.___virtualized === true) {
        for (attrName in oldAttrs) {
            if (!(attrName in attrs)) {
                if (attrName === ATTR_XLINK_HREF) {
                    fromEl.removeAttributeNS(ATTR_XLINK_HREF, ATTR_HREF);
                } else {
                    fromEl.removeAttribute(attrName);
                }
            }
        }
    }
};

module.exports = VElement;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

var domInsert = __webpack_require__(15);

function getComponentDefs(result) {
    var componentDefs = result.___components;

    if (!componentDefs) {
        throw Error('No component');
    }
    return componentDefs;
}

function RenderResult(out) {
   this.out = this.___out = out;
   this.___components = undefined;
}

module.exports = RenderResult;

var proto = RenderResult.prototype = {
    getComponent: function() {
        return this.getComponents()[0];
    },
    getComponents: function(selector) {
        if (this.___components === undefined) {
            throw Error('Not added to DOM');
        }

        var componentDefs = getComponentDefs(this);

        var components = [];

        componentDefs.forEach(function(componentDef) {
            var component = componentDef.___component;
            if (!selector || selector(component)) {
                components.push(component);
            }
        });

        return components;
    },

    afterInsert: function(doc) {
        var out = this.___out;
        var globalComponentsContext = out.global.___components;
        if (globalComponentsContext) {
            this.___components = globalComponentsContext.___initComponents(doc);
        } else {
            this.___components = null;
        }

        return this;
    },
    getNode: function(doc) {
        return this.___out.___getNode(doc);
    },
    getOutput: function() {
        return this.___out.___getOutput();
    },
    toString: function() {
        return this.___out.toString();
    },
    document: typeof document != 'undefined' && document
};

// Add all of the following DOM methods to Component.prototype:
// - appendTo(referenceEl)
// - replace(referenceEl)
// - replaceChildrenOf(referenceEl)
// - insertBefore(referenceEl)
// - insertAfter(referenceEl)
// - prependTo(referenceEl)
domInsert(
    proto,
    function getEl(renderResult, referenceEl) {
        return renderResult.getNode(referenceEl.ownerDocument);
    },
    function afterInsert(renderResult, referenceEl) {
        return renderResult.afterInsert(referenceEl.ownerDocument);
    });


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

var extend = __webpack_require__(1);
var componentsUtil = __webpack_require__(0);
var destroyComponentForEl = componentsUtil.___destroyComponentForEl;
var destroyElRecursive = componentsUtil.___destroyElRecursive;

function resolveEl(el) {
    if (typeof el == 'string') {
        var elId = el;
        el = document.getElementById(elId);
        if (!el) {
            throw Error('Not found: ' + elId);
        }
    }
    return el;
}

function beforeRemove(referenceEl) {
    destroyElRecursive(referenceEl);
    destroyComponentForEl(referenceEl);
}

module.exports = function(target, getEl, afterInsert) {
    extend(target, {
        appendTo: function(referenceEl) {
            referenceEl = resolveEl(referenceEl);
            var el = getEl(this, referenceEl);
            referenceEl.appendChild(el);
            return afterInsert(this, referenceEl);
        },
        prependTo: function(referenceEl) {
            referenceEl = resolveEl(referenceEl);
            var el = getEl(this, referenceEl);
            referenceEl.insertBefore(el, referenceEl.firstChild || null);
            return afterInsert(this, referenceEl);
        },
        replace: function(referenceEl) {
            referenceEl = resolveEl(referenceEl);
            var el = getEl(this, referenceEl);
            beforeRemove(referenceEl);
            referenceEl.parentNode.replaceChild(el, referenceEl);
            return afterInsert(this, referenceEl);
        },
        replaceChildrenOf: function(referenceEl) {
            referenceEl = resolveEl(referenceEl);
            var el = getEl(this, referenceEl);

            var curChild = referenceEl.firstChild;
            while(curChild) {
                var nextSibling = curChild.nextSibling; // Just in case the DOM changes while removing
                if (curChild.nodeType == 1) {
                    beforeRemove(curChild);
                }
                curChild = nextSibling;
            }

            referenceEl.innerHTML = '';
            referenceEl.appendChild(el);
            return afterInsert(this, referenceEl);
        },
        insertBefore: function(referenceEl) {
            referenceEl = resolveEl(referenceEl);
            var el = getEl(this, referenceEl);
            referenceEl.parentNode.insertBefore(el, referenceEl);
            return afterInsert(this, referenceEl);
        },
        insertAfter: function(referenceEl) {
            referenceEl = resolveEl(referenceEl);
            var el = getEl(this, referenceEl);
            el = el;
            var nextSibling = referenceEl.nextSibling;
            var parentNode = referenceEl.parentNode;
            if (nextSibling) {
                parentNode.insertBefore(el, nextSibling);
            } else {
                parentNode.appendChild(el);
            }
            return afterInsert(this, referenceEl);
        }
    });
};


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

var componentsUtil = __webpack_require__(0);
var runtimeId = componentsUtil.___runtimeId;
var componentLookup = componentsUtil.___componentLookup;
var getMarkoPropsFromEl = componentsUtil.___getMarkoPropsFromEl;

// We make our best effort to allow multiple marko runtimes to be loaded in the
// same window. Each marko runtime will get its own unique runtime ID.
var listenersAttachedKey = '$MED' + runtimeId;

function getEventFromEl(el, eventName) {
    var virtualProps = getMarkoPropsFromEl(el);
    var eventInfo = virtualProps[eventName];
    if (typeof eventInfo === 'string') {
        eventInfo = eventInfo.split(' ');
        if (eventInfo.length == 3) {
            eventInfo[2] = parseInt(eventInfo[2], 10);
        }
    }

    return eventInfo;
}

function delegateEvent(node, target, event) {
    var targetMethod = target[0];
    var targetComponentId = target[1];
    var extraArgs = target[2];

    var targetComponent = componentLookup[targetComponentId];

    if (!targetComponent) {
        return;
    }

    var targetFunc = targetComponent[targetMethod];
    if (!targetFunc) {
        throw Error('Method not found: ' + targetMethod);
    }

    if (extraArgs != null) {
        if (typeof extraArgs === 'number') {
            extraArgs = targetComponent.___bubblingDomEvents[extraArgs];
        }
    }

    // Invoke the component method
    if (extraArgs) {
        targetFunc.apply(targetComponent, extraArgs.concat(event, node));
    } else {
        targetFunc.call(targetComponent, event, node);
    }
}

function attachBubbleEventListeners(doc) {
    var body = doc.body;
    // Here's where we handle event delegation using our own mechanism
    // for delegating events. For each event that we have white-listed
    // as supporting bubble, we will attach a listener to the root
    // document.body element. When we get notified of a triggered event,
    // we again walk up the tree starting at the target associated
    // with the event to find any mappings for event. Each mapping
    // is from a DOM event type to a method of a component.
    __webpack_require__(43).forEach(function addBubbleHandler(eventType) {
        body.addEventListener(eventType, function(event) {
            var propagationStopped = false;

            // Monkey-patch to fix #97
            var oldStopPropagation = event.stopPropagation;

            event.stopPropagation = function() {
                oldStopPropagation.call(event);
                propagationStopped = true;
            };

            var curNode = event.target;
            if (!curNode) {
                return;
            }

            // event.target of an SVGElementInstance does not have a
            // `getAttribute` function in IE 11.
            // See https://github.com/marko-js/marko/issues/796
            curNode = curNode.correspondingUseElement || curNode;

            // Search up the tree looking DOM events mapped to target
            // component methods
            var propName = 'on' + eventType;
            var target;

            // Attributes will have the following form:
            // on<event_type>("<target_method>|<component_id>")

            do {
                if ((target = getEventFromEl(curNode, propName))) {
                    delegateEvent(curNode, target, event);

                    if (propagationStopped) {
                        break;
                    }
                }
            } while((curNode = curNode.parentNode) && curNode.getAttribute);
        });
    });
}

function noop() {}

exports.___handleNodeAttach = noop;
exports.___handleNodeDetach = noop;
exports.___delegateEvent = delegateEvent;
exports.___getEventFromEl = getEventFromEl;

exports.___init = function(doc) {
    if (!doc[listenersAttachedKey]) {
        doc[listenersAttachedKey] = true;
        attachBubbleEventListeners(doc);
    }
};


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/* jshint newcap:false */

var BaseState = __webpack_require__(45);
var BaseComponent = __webpack_require__(46);
var inherit = __webpack_require__(2);

module.exports = function defineComponent(def, renderer) {
    if (def.___isComponent) {
        return def;
    }

    var ComponentClass = function() {};
    var proto;

    var type = typeof def;

    if (type == 'function') {
        proto = def.prototype;
    } else if (type == 'object') {
        proto = def;
    } else {
        throw TypeError();
    }

    ComponentClass.prototype = proto;

    // We don't use the constructor provided by the user
    // since we don't invoke their constructor until
    // we have had a chance to do our own initialization.
    // Instead, we store their constructor in the "initComponent"
    // property and that method gets called later inside
    // init-components-browser.js
    function Component(id) {
        BaseComponent.call(this, id);
    }

    if (!proto.___isComponent) {
        // Inherit from Component if they didn't already
        inherit(ComponentClass, BaseComponent);
    }

    // The same prototype will be used by our constructor after
    // we he have set up the prototype chain using the inherit function
    proto = Component.prototype = ComponentClass.prototype;

    // proto.constructor = def.constructor = Component;

    // Set a flag on the constructor function to make it clear this is
    // a component so that we can short-circuit this work later
    Component.___isComponent = true;

    function State(component) { BaseState.call(this, component); }
    inherit(State, BaseState);
    proto.___State = State;
    proto.___renderer = renderer;

    return Component;
};


/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__node_modules_bootstrap_dist_js_bootstrap_js__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__node_modules_bootstrap_dist_js_bootstrap_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__node_modules_bootstrap_dist_js_bootstrap_js__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_daemonite_material_js_material_js__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_daemonite_material_js_material_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__node_modules_daemonite_material_js_material_js__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__scss_index_scss__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__scss_index_scss___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__scss_index_scss__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__js_calculator_js__ = __webpack_require__(27);

// Node modules.



// CSS.


// JavaScript



/***/ }),
/* 19 */
/***/ (function(module, exports) {

/*!
 * Bootstrap v4.0.0-beta (https://getbootstrap.com)
 * Copyright 2011-2017 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */

if (typeof jQuery === 'undefined') {
  throw new Error('Bootstrap\'s JavaScript requires jQuery. jQuery must be included before Bootstrap\'s JavaScript.')
}

(function ($) {
  var version = $.fn.jquery.split(' ')[0].split('.')
  if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1) || (version[0] >= 4)) {
    throw new Error('Bootstrap\'s JavaScript requires at least jQuery v1.9.1 but less than v4.0.0')
  }
})(jQuery);

(function () {
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-beta): util.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Util = function ($) {

  /**
   * ------------------------------------------------------------------------
   * Private TransitionEnd Helpers
   * ------------------------------------------------------------------------
   */

  var transition = false;

  var MAX_UID = 1000000;

  var TransitionEndEvent = {
    WebkitTransition: 'webkitTransitionEnd',
    MozTransition: 'transitionend',
    OTransition: 'oTransitionEnd otransitionend',
    transition: 'transitionend'

    // shoutout AngusCroll (https://goo.gl/pxwQGp)
  };function toType(obj) {
    return {}.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
  }

  function isElement(obj) {
    return (obj[0] || obj).nodeType;
  }

  function getSpecialTransitionEndEvent() {
    return {
      bindType: transition.end,
      delegateType: transition.end,
      handle: function handle(event) {
        if ($(event.target).is(this)) {
          return event.handleObj.handler.apply(this, arguments); // eslint-disable-line prefer-rest-params
        }
        return undefined;
      }
    };
  }

  function transitionEndTest() {
    if (window.QUnit) {
      return false;
    }

    var el = document.createElement('bootstrap');

    for (var name in TransitionEndEvent) {
      if (el.style[name] !== undefined) {
        return {
          end: TransitionEndEvent[name]
        };
      }
    }

    return false;
  }

  function transitionEndEmulator(duration) {
    var _this = this;

    var called = false;

    $(this).one(Util.TRANSITION_END, function () {
      called = true;
    });

    setTimeout(function () {
      if (!called) {
        Util.triggerTransitionEnd(_this);
      }
    }, duration);

    return this;
  }

  function setTransitionEndSupport() {
    transition = transitionEndTest();

    $.fn.emulateTransitionEnd = transitionEndEmulator;

    if (Util.supportsTransitionEnd()) {
      $.event.special[Util.TRANSITION_END] = getSpecialTransitionEndEvent();
    }
  }

  /**
   * --------------------------------------------------------------------------
   * Public Util Api
   * --------------------------------------------------------------------------
   */

  var Util = {

    TRANSITION_END: 'bsTransitionEnd',

    getUID: function getUID(prefix) {
      do {
        // eslint-disable-next-line no-bitwise
        prefix += ~~(Math.random() * MAX_UID); // "~~" acts like a faster Math.floor() here
      } while (document.getElementById(prefix));
      return prefix;
    },
    getSelectorFromElement: function getSelectorFromElement(element) {
      var selector = element.getAttribute('data-target');
      if (!selector || selector === '#') {
        selector = element.getAttribute('href') || '';
      }

      try {
        var $selector = $(selector);
        return $selector.length > 0 ? selector : null;
      } catch (error) {
        return null;
      }
    },
    reflow: function reflow(element) {
      return element.offsetHeight;
    },
    triggerTransitionEnd: function triggerTransitionEnd(element) {
      $(element).trigger(transition.end);
    },
    supportsTransitionEnd: function supportsTransitionEnd() {
      return Boolean(transition);
    },
    typeCheckConfig: function typeCheckConfig(componentName, config, configTypes) {
      for (var property in configTypes) {
        if (configTypes.hasOwnProperty(property)) {
          var expectedTypes = configTypes[property];
          var value = config[property];
          var valueType = value && isElement(value) ? 'element' : toType(value);

          if (!new RegExp(expectedTypes).test(valueType)) {
            throw new Error(componentName.toUpperCase() + ': ' + ('Option "' + property + '" provided type "' + valueType + '" ') + ('but expected type "' + expectedTypes + '".'));
          }
        }
      }
    }
  };

  setTransitionEndSupport();

  return Util;
}(jQuery);

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-beta): alert.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Alert = function ($) {

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME = 'alert';
  var VERSION = '4.0.0-beta';
  var DATA_KEY = 'bs.alert';
  var EVENT_KEY = '.' + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var TRANSITION_DURATION = 150;

  var Selector = {
    DISMISS: '[data-dismiss="alert"]'
  };

  var Event = {
    CLOSE: 'close' + EVENT_KEY,
    CLOSED: 'closed' + EVENT_KEY,
    CLICK_DATA_API: 'click' + EVENT_KEY + DATA_API_KEY
  };

  var ClassName = {
    ALERT: 'alert',
    FADE: 'fade',
    SHOW: 'show'

    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };
  var Alert = function () {
    function Alert(element) {
      _classCallCheck(this, Alert);

      this._element = element;
    }

    // getters

    // public

    Alert.prototype.close = function close(element) {
      element = element || this._element;

      var rootElement = this._getRootElement(element);
      var customEvent = this._triggerCloseEvent(rootElement);

      if (customEvent.isDefaultPrevented()) {
        return;
      }

      this._removeElement(rootElement);
    };

    Alert.prototype.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY);
      this._element = null;
    };

    // private

    Alert.prototype._getRootElement = function _getRootElement(element) {
      var selector = Util.getSelectorFromElement(element);
      var parent = false;

      if (selector) {
        parent = $(selector)[0];
      }

      if (!parent) {
        parent = $(element).closest('.' + ClassName.ALERT)[0];
      }

      return parent;
    };

    Alert.prototype._triggerCloseEvent = function _triggerCloseEvent(element) {
      var closeEvent = $.Event(Event.CLOSE);

      $(element).trigger(closeEvent);
      return closeEvent;
    };

    Alert.prototype._removeElement = function _removeElement(element) {
      var _this2 = this;

      $(element).removeClass(ClassName.SHOW);

      if (!Util.supportsTransitionEnd() || !$(element).hasClass(ClassName.FADE)) {
        this._destroyElement(element);
        return;
      }

      $(element).one(Util.TRANSITION_END, function (event) {
        return _this2._destroyElement(element, event);
      }).emulateTransitionEnd(TRANSITION_DURATION);
    };

    Alert.prototype._destroyElement = function _destroyElement(element) {
      $(element).detach().trigger(Event.CLOSED).remove();
    };

    // static

    Alert._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var $element = $(this);
        var data = $element.data(DATA_KEY);

        if (!data) {
          data = new Alert(this);
          $element.data(DATA_KEY, data);
        }

        if (config === 'close') {
          data[config](this);
        }
      });
    };

    Alert._handleDismiss = function _handleDismiss(alertInstance) {
      return function (event) {
        if (event) {
          event.preventDefault();
        }

        alertInstance.close(this);
      };
    };

    _createClass(Alert, null, [{
      key: 'VERSION',
      get: function get() {
        return VERSION;
      }
    }]);

    return Alert;
  }();

  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  $(document).on(Event.CLICK_DATA_API, Selector.DISMISS, Alert._handleDismiss(new Alert()));

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME] = Alert._jQueryInterface;
  $.fn[NAME].Constructor = Alert;
  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Alert._jQueryInterface;
  };

  return Alert;
}(jQuery);

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-beta): button.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Button = function ($) {

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME = 'button';
  var VERSION = '4.0.0-beta';
  var DATA_KEY = 'bs.button';
  var EVENT_KEY = '.' + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $.fn[NAME];

  var ClassName = {
    ACTIVE: 'active',
    BUTTON: 'btn',
    FOCUS: 'focus'
  };

  var Selector = {
    DATA_TOGGLE_CARROT: '[data-toggle^="button"]',
    DATA_TOGGLE: '[data-toggle="buttons"]',
    INPUT: 'input',
    ACTIVE: '.active',
    BUTTON: '.btn'
  };

  var Event = {
    CLICK_DATA_API: 'click' + EVENT_KEY + DATA_API_KEY,
    FOCUS_BLUR_DATA_API: 'focus' + EVENT_KEY + DATA_API_KEY + ' ' + ('blur' + EVENT_KEY + DATA_API_KEY)

    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };
  var Button = function () {
    function Button(element) {
      _classCallCheck(this, Button);

      this._element = element;
    }

    // getters

    // public

    Button.prototype.toggle = function toggle() {
      var triggerChangeEvent = true;
      var addAriaPressed = true;
      var rootElement = $(this._element).closest(Selector.DATA_TOGGLE)[0];

      if (rootElement) {
        var input = $(this._element).find(Selector.INPUT)[0];

        if (input) {
          if (input.type === 'radio') {
            if (input.checked && $(this._element).hasClass(ClassName.ACTIVE)) {
              triggerChangeEvent = false;
            } else {
              var activeElement = $(rootElement).find(Selector.ACTIVE)[0];

              if (activeElement) {
                $(activeElement).removeClass(ClassName.ACTIVE);
              }
            }
          }

          if (triggerChangeEvent) {
            if (input.hasAttribute('disabled') || rootElement.hasAttribute('disabled') || input.classList.contains('disabled') || rootElement.classList.contains('disabled')) {
              return;
            }
            input.checked = !$(this._element).hasClass(ClassName.ACTIVE);
            $(input).trigger('change');
          }

          input.focus();
          addAriaPressed = false;
        }
      }

      if (addAriaPressed) {
        this._element.setAttribute('aria-pressed', !$(this._element).hasClass(ClassName.ACTIVE));
      }

      if (triggerChangeEvent) {
        $(this._element).toggleClass(ClassName.ACTIVE);
      }
    };

    Button.prototype.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY);
      this._element = null;
    };

    // static

    Button._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY);

        if (!data) {
          data = new Button(this);
          $(this).data(DATA_KEY, data);
        }

        if (config === 'toggle') {
          data[config]();
        }
      });
    };

    _createClass(Button, null, [{
      key: 'VERSION',
      get: function get() {
        return VERSION;
      }
    }]);

    return Button;
  }();

  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  $(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE_CARROT, function (event) {
    event.preventDefault();

    var button = event.target;

    if (!$(button).hasClass(ClassName.BUTTON)) {
      button = $(button).closest(Selector.BUTTON);
    }

    Button._jQueryInterface.call($(button), 'toggle');
  }).on(Event.FOCUS_BLUR_DATA_API, Selector.DATA_TOGGLE_CARROT, function (event) {
    var button = $(event.target).closest(Selector.BUTTON)[0];
    $(button).toggleClass(ClassName.FOCUS, /^focus(in)?$/.test(event.type));
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME] = Button._jQueryInterface;
  $.fn[NAME].Constructor = Button;
  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Button._jQueryInterface;
  };

  return Button;
}(jQuery);

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-beta): carousel.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Carousel = function ($) {

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME = 'carousel';
  var VERSION = '4.0.0-beta';
  var DATA_KEY = 'bs.carousel';
  var EVENT_KEY = '.' + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var TRANSITION_DURATION = 600;
  var ARROW_LEFT_KEYCODE = 37; // KeyboardEvent.which value for left arrow key
  var ARROW_RIGHT_KEYCODE = 39; // KeyboardEvent.which value for right arrow key
  var TOUCHEVENT_COMPAT_WAIT = 500; // Time for mouse compat events to fire after touch

  var Default = {
    interval: 5000,
    keyboard: true,
    slide: false,
    pause: 'hover',
    wrap: true
  };

  var DefaultType = {
    interval: '(number|boolean)',
    keyboard: 'boolean',
    slide: '(boolean|string)',
    pause: '(string|boolean)',
    wrap: 'boolean'
  };

  var Direction = {
    NEXT: 'next',
    PREV: 'prev',
    LEFT: 'left',
    RIGHT: 'right'
  };

  var Event = {
    SLIDE: 'slide' + EVENT_KEY,
    SLID: 'slid' + EVENT_KEY,
    KEYDOWN: 'keydown' + EVENT_KEY,
    MOUSEENTER: 'mouseenter' + EVENT_KEY,
    MOUSELEAVE: 'mouseleave' + EVENT_KEY,
    TOUCHEND: 'touchend' + EVENT_KEY,
    LOAD_DATA_API: 'load' + EVENT_KEY + DATA_API_KEY,
    CLICK_DATA_API: 'click' + EVENT_KEY + DATA_API_KEY
  };

  var ClassName = {
    CAROUSEL: 'carousel',
    ACTIVE: 'active',
    SLIDE: 'slide',
    RIGHT: 'carousel-item-right',
    LEFT: 'carousel-item-left',
    NEXT: 'carousel-item-next',
    PREV: 'carousel-item-prev',
    ITEM: 'carousel-item'
  };

  var Selector = {
    ACTIVE: '.active',
    ACTIVE_ITEM: '.active.carousel-item',
    ITEM: '.carousel-item',
    NEXT_PREV: '.carousel-item-next, .carousel-item-prev',
    INDICATORS: '.carousel-indicators',
    DATA_SLIDE: '[data-slide], [data-slide-to]',
    DATA_RIDE: '[data-ride="carousel"]'

    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };
  var Carousel = function () {
    function Carousel(element, config) {
      _classCallCheck(this, Carousel);

      this._items = null;
      this._interval = null;
      this._activeElement = null;

      this._isPaused = false;
      this._isSliding = false;

      this.touchTimeout = null;

      this._config = this._getConfig(config);
      this._element = $(element)[0];
      this._indicatorsElement = $(this._element).find(Selector.INDICATORS)[0];

      this._addEventListeners();
    }

    // getters

    // public

    Carousel.prototype.next = function next() {
      if (!this._isSliding) {
        this._slide(Direction.NEXT);
      }
    };

    Carousel.prototype.nextWhenVisible = function nextWhenVisible() {
      // Don't call next when the page isn't visible
      if (!document.hidden) {
        this.next();
      }
    };

    Carousel.prototype.prev = function prev() {
      if (!this._isSliding) {
        this._slide(Direction.PREV);
      }
    };

    Carousel.prototype.pause = function pause(event) {
      if (!event) {
        this._isPaused = true;
      }

      if ($(this._element).find(Selector.NEXT_PREV)[0] && Util.supportsTransitionEnd()) {
        Util.triggerTransitionEnd(this._element);
        this.cycle(true);
      }

      clearInterval(this._interval);
      this._interval = null;
    };

    Carousel.prototype.cycle = function cycle(event) {
      if (!event) {
        this._isPaused = false;
      }

      if (this._interval) {
        clearInterval(this._interval);
        this._interval = null;
      }

      if (this._config.interval && !this._isPaused) {
        this._interval = setInterval((document.visibilityState ? this.nextWhenVisible : this.next).bind(this), this._config.interval);
      }
    };

    Carousel.prototype.to = function to(index) {
      var _this3 = this;

      this._activeElement = $(this._element).find(Selector.ACTIVE_ITEM)[0];

      var activeIndex = this._getItemIndex(this._activeElement);

      if (index > this._items.length - 1 || index < 0) {
        return;
      }

      if (this._isSliding) {
        $(this._element).one(Event.SLID, function () {
          return _this3.to(index);
        });
        return;
      }

      if (activeIndex === index) {
        this.pause();
        this.cycle();
        return;
      }

      var direction = index > activeIndex ? Direction.NEXT : Direction.PREV;

      this._slide(direction, this._items[index]);
    };

    Carousel.prototype.dispose = function dispose() {
      $(this._element).off(EVENT_KEY);
      $.removeData(this._element, DATA_KEY);

      this._items = null;
      this._config = null;
      this._element = null;
      this._interval = null;
      this._isPaused = null;
      this._isSliding = null;
      this._activeElement = null;
      this._indicatorsElement = null;
    };

    // private

    Carousel.prototype._getConfig = function _getConfig(config) {
      config = $.extend({}, Default, config);
      Util.typeCheckConfig(NAME, config, DefaultType);
      return config;
    };

    Carousel.prototype._addEventListeners = function _addEventListeners() {
      var _this4 = this;

      if (this._config.keyboard) {
        $(this._element).on(Event.KEYDOWN, function (event) {
          return _this4._keydown(event);
        });
      }

      if (this._config.pause === 'hover') {
        $(this._element).on(Event.MOUSEENTER, function (event) {
          return _this4.pause(event);
        }).on(Event.MOUSELEAVE, function (event) {
          return _this4.cycle(event);
        });
        if ('ontouchstart' in document.documentElement) {
          // if it's a touch-enabled device, mouseenter/leave are fired as
          // part of the mouse compatibility events on first tap - the carousel
          // would stop cycling until user tapped out of it;
          // here, we listen for touchend, explicitly pause the carousel
          // (as if it's the second time we tap on it, mouseenter compat event
          // is NOT fired) and after a timeout (to allow for mouse compatibility
          // events to fire) we explicitly restart cycling
          $(this._element).on(Event.TOUCHEND, function () {
            _this4.pause();
            if (_this4.touchTimeout) {
              clearTimeout(_this4.touchTimeout);
            }
            _this4.touchTimeout = setTimeout(function (event) {
              return _this4.cycle(event);
            }, TOUCHEVENT_COMPAT_WAIT + _this4._config.interval);
          });
        }
      }
    };

    Carousel.prototype._keydown = function _keydown(event) {
      if (/input|textarea/i.test(event.target.tagName)) {
        return;
      }

      switch (event.which) {
        case ARROW_LEFT_KEYCODE:
          event.preventDefault();
          this.prev();
          break;
        case ARROW_RIGHT_KEYCODE:
          event.preventDefault();
          this.next();
          break;
        default:
          return;
      }
    };

    Carousel.prototype._getItemIndex = function _getItemIndex(element) {
      this._items = $.makeArray($(element).parent().find(Selector.ITEM));
      return this._items.indexOf(element);
    };

    Carousel.prototype._getItemByDirection = function _getItemByDirection(direction, activeElement) {
      var isNextDirection = direction === Direction.NEXT;
      var isPrevDirection = direction === Direction.PREV;
      var activeIndex = this._getItemIndex(activeElement);
      var lastItemIndex = this._items.length - 1;
      var isGoingToWrap = isPrevDirection && activeIndex === 0 || isNextDirection && activeIndex === lastItemIndex;

      if (isGoingToWrap && !this._config.wrap) {
        return activeElement;
      }

      var delta = direction === Direction.PREV ? -1 : 1;
      var itemIndex = (activeIndex + delta) % this._items.length;

      return itemIndex === -1 ? this._items[this._items.length - 1] : this._items[itemIndex];
    };

    Carousel.prototype._triggerSlideEvent = function _triggerSlideEvent(relatedTarget, eventDirectionName) {
      var targetIndex = this._getItemIndex(relatedTarget);
      var fromIndex = this._getItemIndex($(this._element).find(Selector.ACTIVE_ITEM)[0]);
      var slideEvent = $.Event(Event.SLIDE, {
        relatedTarget: relatedTarget,
        direction: eventDirectionName,
        from: fromIndex,
        to: targetIndex
      });

      $(this._element).trigger(slideEvent);

      return slideEvent;
    };

    Carousel.prototype._setActiveIndicatorElement = function _setActiveIndicatorElement(element) {
      if (this._indicatorsElement) {
        $(this._indicatorsElement).find(Selector.ACTIVE).removeClass(ClassName.ACTIVE);

        var nextIndicator = this._indicatorsElement.children[this._getItemIndex(element)];

        if (nextIndicator) {
          $(nextIndicator).addClass(ClassName.ACTIVE);
        }
      }
    };

    Carousel.prototype._slide = function _slide(direction, element) {
      var _this5 = this;

      var activeElement = $(this._element).find(Selector.ACTIVE_ITEM)[0];
      var activeElementIndex = this._getItemIndex(activeElement);
      var nextElement = element || activeElement && this._getItemByDirection(direction, activeElement);
      var nextElementIndex = this._getItemIndex(nextElement);
      var isCycling = Boolean(this._interval);

      var directionalClassName = void 0;
      var orderClassName = void 0;
      var eventDirectionName = void 0;

      if (direction === Direction.NEXT) {
        directionalClassName = ClassName.LEFT;
        orderClassName = ClassName.NEXT;
        eventDirectionName = Direction.LEFT;
      } else {
        directionalClassName = ClassName.RIGHT;
        orderClassName = ClassName.PREV;
        eventDirectionName = Direction.RIGHT;
      }

      if (nextElement && $(nextElement).hasClass(ClassName.ACTIVE)) {
        this._isSliding = false;
        return;
      }

      var slideEvent = this._triggerSlideEvent(nextElement, eventDirectionName);
      if (slideEvent.isDefaultPrevented()) {
        return;
      }

      if (!activeElement || !nextElement) {
        // some weirdness is happening, so we bail
        return;
      }

      this._isSliding = true;

      if (isCycling) {
        this.pause();
      }

      this._setActiveIndicatorElement(nextElement);

      var slidEvent = $.Event(Event.SLID, {
        relatedTarget: nextElement,
        direction: eventDirectionName,
        from: activeElementIndex,
        to: nextElementIndex
      });

      if (Util.supportsTransitionEnd() && $(this._element).hasClass(ClassName.SLIDE)) {

        $(nextElement).addClass(orderClassName);

        Util.reflow(nextElement);

        $(activeElement).addClass(directionalClassName);
        $(nextElement).addClass(directionalClassName);

        $(activeElement).one(Util.TRANSITION_END, function () {
          $(nextElement).removeClass(directionalClassName + ' ' + orderClassName).addClass(ClassName.ACTIVE);

          $(activeElement).removeClass(ClassName.ACTIVE + ' ' + orderClassName + ' ' + directionalClassName);

          _this5._isSliding = false;

          setTimeout(function () {
            return $(_this5._element).trigger(slidEvent);
          }, 0);
        }).emulateTransitionEnd(TRANSITION_DURATION);
      } else {
        $(activeElement).removeClass(ClassName.ACTIVE);
        $(nextElement).addClass(ClassName.ACTIVE);

        this._isSliding = false;
        $(this._element).trigger(slidEvent);
      }

      if (isCycling) {
        this.cycle();
      }
    };

    // static

    Carousel._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY);
        var _config = $.extend({}, Default, $(this).data());

        if ((typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object') {
          $.extend(_config, config);
        }

        var action = typeof config === 'string' ? config : _config.slide;

        if (!data) {
          data = new Carousel(this, _config);
          $(this).data(DATA_KEY, data);
        }

        if (typeof config === 'number') {
          data.to(config);
        } else if (typeof action === 'string') {
          if (data[action] === undefined) {
            throw new Error('No method named "' + action + '"');
          }
          data[action]();
        } else if (_config.interval) {
          data.pause();
          data.cycle();
        }
      });
    };

    Carousel._dataApiClickHandler = function _dataApiClickHandler(event) {
      var selector = Util.getSelectorFromElement(this);

      if (!selector) {
        return;
      }

      var target = $(selector)[0];

      if (!target || !$(target).hasClass(ClassName.CAROUSEL)) {
        return;
      }

      var config = $.extend({}, $(target).data(), $(this).data());
      var slideIndex = this.getAttribute('data-slide-to');

      if (slideIndex) {
        config.interval = false;
      }

      Carousel._jQueryInterface.call($(target), config);

      if (slideIndex) {
        $(target).data(DATA_KEY).to(slideIndex);
      }

      event.preventDefault();
    };

    _createClass(Carousel, null, [{
      key: 'VERSION',
      get: function get() {
        return VERSION;
      }
    }, {
      key: 'Default',
      get: function get() {
        return Default;
      }
    }]);

    return Carousel;
  }();

  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  $(document).on(Event.CLICK_DATA_API, Selector.DATA_SLIDE, Carousel._dataApiClickHandler);

  $(window).on(Event.LOAD_DATA_API, function () {
    $(Selector.DATA_RIDE).each(function () {
      var $carousel = $(this);
      Carousel._jQueryInterface.call($carousel, $carousel.data());
    });
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME] = Carousel._jQueryInterface;
  $.fn[NAME].Constructor = Carousel;
  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Carousel._jQueryInterface;
  };

  return Carousel;
}(jQuery);

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-beta): collapse.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Collapse = function ($) {

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME = 'collapse';
  var VERSION = '4.0.0-beta';
  var DATA_KEY = 'bs.collapse';
  var EVENT_KEY = '.' + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var TRANSITION_DURATION = 600;

  var Default = {
    toggle: true,
    parent: ''
  };

  var DefaultType = {
    toggle: 'boolean',
    parent: 'string'
  };

  var Event = {
    SHOW: 'show' + EVENT_KEY,
    SHOWN: 'shown' + EVENT_KEY,
    HIDE: 'hide' + EVENT_KEY,
    HIDDEN: 'hidden' + EVENT_KEY,
    CLICK_DATA_API: 'click' + EVENT_KEY + DATA_API_KEY
  };

  var ClassName = {
    SHOW: 'show',
    COLLAPSE: 'collapse',
    COLLAPSING: 'collapsing',
    COLLAPSED: 'collapsed'
  };

  var Dimension = {
    WIDTH: 'width',
    HEIGHT: 'height'
  };

  var Selector = {
    ACTIVES: '.show, .collapsing',
    DATA_TOGGLE: '[data-toggle="collapse"]'

    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };
  var Collapse = function () {
    function Collapse(element, config) {
      _classCallCheck(this, Collapse);

      this._isTransitioning = false;
      this._element = element;
      this._config = this._getConfig(config);
      this._triggerArray = $.makeArray($('[data-toggle="collapse"][href="#' + element.id + '"],' + ('[data-toggle="collapse"][data-target="#' + element.id + '"]')));
      var tabToggles = $(Selector.DATA_TOGGLE);
      for (var i = 0; i < tabToggles.length; i++) {
        var elem = tabToggles[i];
        var selector = Util.getSelectorFromElement(elem);
        if (selector !== null && $(selector).filter(element).length > 0) {
          this._triggerArray.push(elem);
        }
      }

      this._parent = this._config.parent ? this._getParent() : null;

      if (!this._config.parent) {
        this._addAriaAndCollapsedClass(this._element, this._triggerArray);
      }

      if (this._config.toggle) {
        this.toggle();
      }
    }

    // getters

    // public

    Collapse.prototype.toggle = function toggle() {
      if ($(this._element).hasClass(ClassName.SHOW)) {
        this.hide();
      } else {
        this.show();
      }
    };

    Collapse.prototype.show = function show() {
      var _this6 = this;

      if (this._isTransitioning || $(this._element).hasClass(ClassName.SHOW)) {
        return;
      }

      var actives = void 0;
      var activesData = void 0;

      if (this._parent) {
        actives = $.makeArray($(this._parent).children().children(Selector.ACTIVES));
        if (!actives.length) {
          actives = null;
        }
      }

      if (actives) {
        activesData = $(actives).data(DATA_KEY);
        if (activesData && activesData._isTransitioning) {
          return;
        }
      }

      var startEvent = $.Event(Event.SHOW);
      $(this._element).trigger(startEvent);
      if (startEvent.isDefaultPrevented()) {
        return;
      }

      if (actives) {
        Collapse._jQueryInterface.call($(actives), 'hide');
        if (!activesData) {
          $(actives).data(DATA_KEY, null);
        }
      }

      var dimension = this._getDimension();

      $(this._element).removeClass(ClassName.COLLAPSE).addClass(ClassName.COLLAPSING);

      this._element.style[dimension] = 0;

      if (this._triggerArray.length) {
        $(this._triggerArray).removeClass(ClassName.COLLAPSED).attr('aria-expanded', true);
      }

      this.setTransitioning(true);

      var complete = function complete() {
        $(_this6._element).removeClass(ClassName.COLLAPSING).addClass(ClassName.COLLAPSE).addClass(ClassName.SHOW);

        _this6._element.style[dimension] = '';

        _this6.setTransitioning(false);

        $(_this6._element).trigger(Event.SHOWN);
      };

      if (!Util.supportsTransitionEnd()) {
        complete();
        return;
      }

      var capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
      var scrollSize = 'scroll' + capitalizedDimension;

      $(this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(TRANSITION_DURATION);

      this._element.style[dimension] = this._element[scrollSize] + 'px';
    };

    Collapse.prototype.hide = function hide() {
      var _this7 = this;

      if (this._isTransitioning || !$(this._element).hasClass(ClassName.SHOW)) {
        return;
      }

      var startEvent = $.Event(Event.HIDE);
      $(this._element).trigger(startEvent);
      if (startEvent.isDefaultPrevented()) {
        return;
      }

      var dimension = this._getDimension();

      this._element.style[dimension] = this._element.getBoundingClientRect()[dimension] + 'px';

      Util.reflow(this._element);

      $(this._element).addClass(ClassName.COLLAPSING).removeClass(ClassName.COLLAPSE).removeClass(ClassName.SHOW);

      if (this._triggerArray.length) {
        for (var i = 0; i < this._triggerArray.length; i++) {
          var trigger = this._triggerArray[i];
          var selector = Util.getSelectorFromElement(trigger);
          if (selector !== null) {
            var $elem = $(selector);
            if (!$elem.hasClass(ClassName.SHOW)) {
              $(trigger).addClass(ClassName.COLLAPSED).attr('aria-expanded', false);
            }
          }
        }
      }

      this.setTransitioning(true);

      var complete = function complete() {
        _this7.setTransitioning(false);
        $(_this7._element).removeClass(ClassName.COLLAPSING).addClass(ClassName.COLLAPSE).trigger(Event.HIDDEN);
      };

      this._element.style[dimension] = '';

      if (!Util.supportsTransitionEnd()) {
        complete();
        return;
      }

      $(this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(TRANSITION_DURATION);
    };

    Collapse.prototype.setTransitioning = function setTransitioning(isTransitioning) {
      this._isTransitioning = isTransitioning;
    };

    Collapse.prototype.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY);

      this._config = null;
      this._parent = null;
      this._element = null;
      this._triggerArray = null;
      this._isTransitioning = null;
    };

    // private

    Collapse.prototype._getConfig = function _getConfig(config) {
      config = $.extend({}, Default, config);
      config.toggle = Boolean(config.toggle); // coerce string values
      Util.typeCheckConfig(NAME, config, DefaultType);
      return config;
    };

    Collapse.prototype._getDimension = function _getDimension() {
      var hasWidth = $(this._element).hasClass(Dimension.WIDTH);
      return hasWidth ? Dimension.WIDTH : Dimension.HEIGHT;
    };

    Collapse.prototype._getParent = function _getParent() {
      var _this8 = this;

      var parent = $(this._config.parent)[0];
      var selector = '[data-toggle="collapse"][data-parent="' + this._config.parent + '"]';

      $(parent).find(selector).each(function (i, element) {
        _this8._addAriaAndCollapsedClass(Collapse._getTargetFromElement(element), [element]);
      });

      return parent;
    };

    Collapse.prototype._addAriaAndCollapsedClass = function _addAriaAndCollapsedClass(element, triggerArray) {
      if (element) {
        var isOpen = $(element).hasClass(ClassName.SHOW);

        if (triggerArray.length) {
          $(triggerArray).toggleClass(ClassName.COLLAPSED, !isOpen).attr('aria-expanded', isOpen);
        }
      }
    };

    // static

    Collapse._getTargetFromElement = function _getTargetFromElement(element) {
      var selector = Util.getSelectorFromElement(element);
      return selector ? $(selector)[0] : null;
    };

    Collapse._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var $this = $(this);
        var data = $this.data(DATA_KEY);
        var _config = $.extend({}, Default, $this.data(), (typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object' && config);

        if (!data && _config.toggle && /show|hide/.test(config)) {
          _config.toggle = false;
        }

        if (!data) {
          data = new Collapse(this, _config);
          $this.data(DATA_KEY, data);
        }

        if (typeof config === 'string') {
          if (data[config] === undefined) {
            throw new Error('No method named "' + config + '"');
          }
          data[config]();
        }
      });
    };

    _createClass(Collapse, null, [{
      key: 'VERSION',
      get: function get() {
        return VERSION;
      }
    }, {
      key: 'Default',
      get: function get() {
        return Default;
      }
    }]);

    return Collapse;
  }();

  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  $(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
    if (!/input|textarea/i.test(event.target.tagName)) {
      event.preventDefault();
    }

    var $trigger = $(this);
    var selector = Util.getSelectorFromElement(this);
    $(selector).each(function () {
      var $target = $(this);
      var data = $target.data(DATA_KEY);
      var config = data ? 'toggle' : $trigger.data();
      Collapse._jQueryInterface.call($target, config);
    });
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME] = Collapse._jQueryInterface;
  $.fn[NAME].Constructor = Collapse;
  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Collapse._jQueryInterface;
  };

  return Collapse;
}(jQuery);

/* global Popper */

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-beta): dropdown.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Dropdown = function ($) {

  /**
   * Check for Popper dependency
   * Popper - https://popper.js.org
   */
  if (typeof Popper === 'undefined') {
    throw new Error('Bootstrap dropdown require Popper.js (https://popper.js.org)');
  }

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME = 'dropdown';
  var VERSION = '4.0.0-beta';
  var DATA_KEY = 'bs.dropdown';
  var EVENT_KEY = '.' + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var ESCAPE_KEYCODE = 27; // KeyboardEvent.which value for Escape (Esc) key
  var SPACE_KEYCODE = 32; // KeyboardEvent.which value for space key
  var TAB_KEYCODE = 9; // KeyboardEvent.which value for tab key
  var ARROW_UP_KEYCODE = 38; // KeyboardEvent.which value for up arrow key
  var ARROW_DOWN_KEYCODE = 40; // KeyboardEvent.which value for down arrow key
  var RIGHT_MOUSE_BUTTON_WHICH = 3; // MouseEvent.which value for the right button (assuming a right-handed mouse)
  var REGEXP_KEYDOWN = new RegExp(ARROW_UP_KEYCODE + '|' + ARROW_DOWN_KEYCODE + '|' + ESCAPE_KEYCODE);

  var Event = {
    HIDE: 'hide' + EVENT_KEY,
    HIDDEN: 'hidden' + EVENT_KEY,
    SHOW: 'show' + EVENT_KEY,
    SHOWN: 'shown' + EVENT_KEY,
    CLICK: 'click' + EVENT_KEY,
    CLICK_DATA_API: 'click' + EVENT_KEY + DATA_API_KEY,
    KEYDOWN_DATA_API: 'keydown' + EVENT_KEY + DATA_API_KEY,
    KEYUP_DATA_API: 'keyup' + EVENT_KEY + DATA_API_KEY
  };

  var ClassName = {
    DISABLED: 'disabled',
    SHOW: 'show',
    DROPUP: 'dropup',
    MENURIGHT: 'dropdown-menu-right',
    MENULEFT: 'dropdown-menu-left'
  };

  var Selector = {
    DATA_TOGGLE: '[data-toggle="dropdown"]',
    FORM_CHILD: '.dropdown form',
    MENU: '.dropdown-menu',
    NAVBAR_NAV: '.navbar-nav',
    VISIBLE_ITEMS: '.dropdown-menu .dropdown-item:not(.disabled)'
  };

  var AttachmentMap = {
    TOP: 'top-start',
    TOPEND: 'top-end',
    BOTTOM: 'bottom-start',
    BOTTOMEND: 'bottom-end'
  };

  var Default = {
    placement: AttachmentMap.BOTTOM,
    offset: 0,
    flip: true
  };

  var DefaultType = {
    placement: 'string',
    offset: '(number|string)',
    flip: 'boolean'

    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };
  var Dropdown = function () {
    function Dropdown(element, config) {
      _classCallCheck(this, Dropdown);

      this._element = element;
      this._popper = null;
      this._config = this._getConfig(config);
      this._menu = this._getMenuElement();
      this._inNavbar = this._detectNavbar();

      this._addEventListeners();
    }

    // getters

    // public

    Dropdown.prototype.toggle = function toggle() {
      if (this._element.disabled || $(this._element).hasClass(ClassName.DISABLED)) {
        return;
      }

      var parent = Dropdown._getParentFromElement(this._element);
      var isActive = $(this._menu).hasClass(ClassName.SHOW);

      Dropdown._clearMenus();

      if (isActive) {
        return;
      }

      var relatedTarget = {
        relatedTarget: this._element
      };
      var showEvent = $.Event(Event.SHOW, relatedTarget);

      $(parent).trigger(showEvent);

      if (showEvent.isDefaultPrevented()) {
        return;
      }

      var element = this._element;
      // for dropup with alignment we use the parent as popper container
      if ($(parent).hasClass(ClassName.DROPUP)) {
        if ($(this._menu).hasClass(ClassName.MENULEFT) || $(this._menu).hasClass(ClassName.MENURIGHT)) {
          element = parent;
        }
      }
      this._popper = new Popper(element, this._menu, this._getPopperConfig());

      // if this is a touch-enabled device we add extra
      // empty mouseover listeners to the body's immediate children;
      // only needed because of broken event delegation on iOS
      // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
      if ('ontouchstart' in document.documentElement && !$(parent).closest(Selector.NAVBAR_NAV).length) {
        $('body').children().on('mouseover', null, $.noop);
      }

      this._element.focus();
      this._element.setAttribute('aria-expanded', true);

      $(this._menu).toggleClass(ClassName.SHOW);
      $(parent).toggleClass(ClassName.SHOW).trigger($.Event(Event.SHOWN, relatedTarget));
    };

    Dropdown.prototype.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY);
      $(this._element).off(EVENT_KEY);
      this._element = null;
      this._menu = null;
      if (this._popper !== null) {
        this._popper.destroy();
      }
      this._popper = null;
    };

    Dropdown.prototype.update = function update() {
      this._inNavbar = this._detectNavbar();
      if (this._popper !== null) {
        this._popper.scheduleUpdate();
      }
    };

    // private

    Dropdown.prototype._addEventListeners = function _addEventListeners() {
      var _this9 = this;

      $(this._element).on(Event.CLICK, function (event) {
        event.preventDefault();
        event.stopPropagation();
        _this9.toggle();
      });
    };

    Dropdown.prototype._getConfig = function _getConfig(config) {
      var elementData = $(this._element).data();
      if (elementData.placement !== undefined) {
        elementData.placement = AttachmentMap[elementData.placement.toUpperCase()];
      }

      config = $.extend({}, this.constructor.Default, $(this._element).data(), config);

      Util.typeCheckConfig(NAME, config, this.constructor.DefaultType);

      return config;
    };

    Dropdown.prototype._getMenuElement = function _getMenuElement() {
      if (!this._menu) {
        var parent = Dropdown._getParentFromElement(this._element);
        this._menu = $(parent).find(Selector.MENU)[0];
      }
      return this._menu;
    };

    Dropdown.prototype._getPlacement = function _getPlacement() {
      var $parentDropdown = $(this._element).parent();
      var placement = this._config.placement;

      // Handle dropup
      if ($parentDropdown.hasClass(ClassName.DROPUP) || this._config.placement === AttachmentMap.TOP) {
        placement = AttachmentMap.TOP;
        if ($(this._menu).hasClass(ClassName.MENURIGHT)) {
          placement = AttachmentMap.TOPEND;
        }
      } else if ($(this._menu).hasClass(ClassName.MENURIGHT)) {
        placement = AttachmentMap.BOTTOMEND;
      }
      return placement;
    };

    Dropdown.prototype._detectNavbar = function _detectNavbar() {
      return $(this._element).closest('.navbar').length > 0;
    };

    Dropdown.prototype._getPopperConfig = function _getPopperConfig() {
      var popperConfig = {
        placement: this._getPlacement(),
        modifiers: {
          offset: {
            offset: this._config.offset
          },
          flip: {
            enabled: this._config.flip
          }
        }

        // Disable Popper.js for Dropdown in Navbar
      };if (this._inNavbar) {
        popperConfig.modifiers.applyStyle = {
          enabled: !this._inNavbar
        };
      }
      return popperConfig;
    };

    // static

    Dropdown._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY);
        var _config = (typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object' ? config : null;

        if (!data) {
          data = new Dropdown(this, _config);
          $(this).data(DATA_KEY, data);
        }

        if (typeof config === 'string') {
          if (data[config] === undefined) {
            throw new Error('No method named "' + config + '"');
          }
          data[config]();
        }
      });
    };

    Dropdown._clearMenus = function _clearMenus(event) {
      if (event && (event.which === RIGHT_MOUSE_BUTTON_WHICH || event.type === 'keyup' && event.which !== TAB_KEYCODE)) {
        return;
      }

      var toggles = $.makeArray($(Selector.DATA_TOGGLE));
      for (var i = 0; i < toggles.length; i++) {
        var parent = Dropdown._getParentFromElement(toggles[i]);
        var context = $(toggles[i]).data(DATA_KEY);
        var relatedTarget = {
          relatedTarget: toggles[i]
        };

        if (!context) {
          continue;
        }

        var dropdownMenu = context._menu;
        if (!$(parent).hasClass(ClassName.SHOW)) {
          continue;
        }

        if (event && (event.type === 'click' && /input|textarea/i.test(event.target.tagName) || event.type === 'keyup' && event.which === TAB_KEYCODE) && $.contains(parent, event.target)) {
          continue;
        }

        var hideEvent = $.Event(Event.HIDE, relatedTarget);
        $(parent).trigger(hideEvent);
        if (hideEvent.isDefaultPrevented()) {
          continue;
        }

        // if this is a touch-enabled device we remove the extra
        // empty mouseover listeners we added for iOS support
        if ('ontouchstart' in document.documentElement) {
          $('body').children().off('mouseover', null, $.noop);
        }

        toggles[i].setAttribute('aria-expanded', 'false');

        $(dropdownMenu).removeClass(ClassName.SHOW);
        $(parent).removeClass(ClassName.SHOW).trigger($.Event(Event.HIDDEN, relatedTarget));
      }
    };

    Dropdown._getParentFromElement = function _getParentFromElement(element) {
      var parent = void 0;
      var selector = Util.getSelectorFromElement(element);

      if (selector) {
        parent = $(selector)[0];
      }

      return parent || element.parentNode;
    };

    Dropdown._dataApiKeydownHandler = function _dataApiKeydownHandler(event) {
      if (!REGEXP_KEYDOWN.test(event.which) || /button/i.test(event.target.tagName) && event.which === SPACE_KEYCODE || /input|textarea/i.test(event.target.tagName)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (this.disabled || $(this).hasClass(ClassName.DISABLED)) {
        return;
      }

      var parent = Dropdown._getParentFromElement(this);
      var isActive = $(parent).hasClass(ClassName.SHOW);

      if (!isActive && (event.which !== ESCAPE_KEYCODE || event.which !== SPACE_KEYCODE) || isActive && (event.which === ESCAPE_KEYCODE || event.which === SPACE_KEYCODE)) {

        if (event.which === ESCAPE_KEYCODE) {
          var toggle = $(parent).find(Selector.DATA_TOGGLE)[0];
          $(toggle).trigger('focus');
        }

        $(this).trigger('click');
        return;
      }

      var items = $(parent).find(Selector.VISIBLE_ITEMS).get();

      if (!items.length) {
        return;
      }

      var index = items.indexOf(event.target);

      if (event.which === ARROW_UP_KEYCODE && index > 0) {
        // up
        index--;
      }

      if (event.which === ARROW_DOWN_KEYCODE && index < items.length - 1) {
        // down
        index++;
      }

      if (index < 0) {
        index = 0;
      }

      items[index].focus();
    };

    _createClass(Dropdown, null, [{
      key: 'VERSION',
      get: function get() {
        return VERSION;
      }
    }, {
      key: 'Default',
      get: function get() {
        return Default;
      }
    }, {
      key: 'DefaultType',
      get: function get() {
        return DefaultType;
      }
    }]);

    return Dropdown;
  }();

  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  $(document).on(Event.KEYDOWN_DATA_API, Selector.DATA_TOGGLE, Dropdown._dataApiKeydownHandler).on(Event.KEYDOWN_DATA_API, Selector.MENU, Dropdown._dataApiKeydownHandler).on(Event.CLICK_DATA_API + ' ' + Event.KEYUP_DATA_API, Dropdown._clearMenus).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
    event.preventDefault();
    event.stopPropagation();
    Dropdown._jQueryInterface.call($(this), 'toggle');
  }).on(Event.CLICK_DATA_API, Selector.FORM_CHILD, function (e) {
    e.stopPropagation();
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME] = Dropdown._jQueryInterface;
  $.fn[NAME].Constructor = Dropdown;
  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Dropdown._jQueryInterface;
  };

  return Dropdown;
}(jQuery);

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-beta): modal.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Modal = function ($) {

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME = 'modal';
  var VERSION = '4.0.0-beta';
  var DATA_KEY = 'bs.modal';
  var EVENT_KEY = '.' + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var TRANSITION_DURATION = 300;
  var BACKDROP_TRANSITION_DURATION = 150;
  var ESCAPE_KEYCODE = 27; // KeyboardEvent.which value for Escape (Esc) key

  var Default = {
    backdrop: true,
    keyboard: true,
    focus: true,
    show: true
  };

  var DefaultType = {
    backdrop: '(boolean|string)',
    keyboard: 'boolean',
    focus: 'boolean',
    show: 'boolean'
  };

  var Event = {
    HIDE: 'hide' + EVENT_KEY,
    HIDDEN: 'hidden' + EVENT_KEY,
    SHOW: 'show' + EVENT_KEY,
    SHOWN: 'shown' + EVENT_KEY,
    FOCUSIN: 'focusin' + EVENT_KEY,
    RESIZE: 'resize' + EVENT_KEY,
    CLICK_DISMISS: 'click.dismiss' + EVENT_KEY,
    KEYDOWN_DISMISS: 'keydown.dismiss' + EVENT_KEY,
    MOUSEUP_DISMISS: 'mouseup.dismiss' + EVENT_KEY,
    MOUSEDOWN_DISMISS: 'mousedown.dismiss' + EVENT_KEY,
    CLICK_DATA_API: 'click' + EVENT_KEY + DATA_API_KEY
  };

  var ClassName = {
    SCROLLBAR_MEASURER: 'modal-scrollbar-measure',
    BACKDROP: 'modal-backdrop',
    OPEN: 'modal-open',
    FADE: 'fade',
    SHOW: 'show'
  };

  var Selector = {
    DIALOG: '.modal-dialog',
    DATA_TOGGLE: '[data-toggle="modal"]',
    DATA_DISMISS: '[data-dismiss="modal"]',
    FIXED_CONTENT: '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top',
    NAVBAR_TOGGLER: '.navbar-toggler'

    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };
  var Modal = function () {
    function Modal(element, config) {
      _classCallCheck(this, Modal);

      this._config = this._getConfig(config);
      this._element = element;
      this._dialog = $(element).find(Selector.DIALOG)[0];
      this._backdrop = null;
      this._isShown = false;
      this._isBodyOverflowing = false;
      this._ignoreBackdropClick = false;
      this._originalBodyPadding = 0;
      this._scrollbarWidth = 0;
    }

    // getters

    // public

    Modal.prototype.toggle = function toggle(relatedTarget) {
      return this._isShown ? this.hide() : this.show(relatedTarget);
    };

    Modal.prototype.show = function show(relatedTarget) {
      var _this10 = this;

      if (this._isTransitioning) {
        return;
      }

      if (Util.supportsTransitionEnd() && $(this._element).hasClass(ClassName.FADE)) {
        this._isTransitioning = true;
      }

      var showEvent = $.Event(Event.SHOW, {
        relatedTarget: relatedTarget
      });

      $(this._element).trigger(showEvent);

      if (this._isShown || showEvent.isDefaultPrevented()) {
        return;
      }

      this._isShown = true;

      this._checkScrollbar();
      this._setScrollbar();

      $(document.body).addClass(ClassName.OPEN);

      this._setEscapeEvent();
      this._setResizeEvent();

      $(this._element).on(Event.CLICK_DISMISS, Selector.DATA_DISMISS, function (event) {
        return _this10.hide(event);
      });

      $(this._dialog).on(Event.MOUSEDOWN_DISMISS, function () {
        $(_this10._element).one(Event.MOUSEUP_DISMISS, function (event) {
          if ($(event.target).is(_this10._element)) {
            _this10._ignoreBackdropClick = true;
          }
        });
      });

      this._showBackdrop(function () {
        return _this10._showElement(relatedTarget);
      });
    };

    Modal.prototype.hide = function hide(event) {
      var _this11 = this;

      if (event) {
        event.preventDefault();
      }

      if (this._isTransitioning || !this._isShown) {
        return;
      }

      var transition = Util.supportsTransitionEnd() && $(this._element).hasClass(ClassName.FADE);

      if (transition) {
        this._isTransitioning = true;
      }

      var hideEvent = $.Event(Event.HIDE);

      $(this._element).trigger(hideEvent);

      if (!this._isShown || hideEvent.isDefaultPrevented()) {
        return;
      }

      this._isShown = false;

      this._setEscapeEvent();
      this._setResizeEvent();

      $(document).off(Event.FOCUSIN);

      $(this._element).removeClass(ClassName.SHOW);

      $(this._element).off(Event.CLICK_DISMISS);
      $(this._dialog).off(Event.MOUSEDOWN_DISMISS);

      if (transition) {

        $(this._element).one(Util.TRANSITION_END, function (event) {
          return _this11._hideModal(event);
        }).emulateTransitionEnd(TRANSITION_DURATION);
      } else {
        this._hideModal();
      }
    };

    Modal.prototype.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY);

      $(window, document, this._element, this._backdrop).off(EVENT_KEY);

      this._config = null;
      this._element = null;
      this._dialog = null;
      this._backdrop = null;
      this._isShown = null;
      this._isBodyOverflowing = null;
      this._ignoreBackdropClick = null;
      this._scrollbarWidth = null;
    };

    Modal.prototype.handleUpdate = function handleUpdate() {
      this._adjustDialog();
    };

    // private

    Modal.prototype._getConfig = function _getConfig(config) {
      config = $.extend({}, Default, config);
      Util.typeCheckConfig(NAME, config, DefaultType);
      return config;
    };

    Modal.prototype._showElement = function _showElement(relatedTarget) {
      var _this12 = this;

      var transition = Util.supportsTransitionEnd() && $(this._element).hasClass(ClassName.FADE);

      if (!this._element.parentNode || this._element.parentNode.nodeType !== Node.ELEMENT_NODE) {
        // don't move modals dom position
        document.body.appendChild(this._element);
      }

      this._element.style.display = 'block';
      this._element.removeAttribute('aria-hidden');
      this._element.scrollTop = 0;

      if (transition) {
        Util.reflow(this._element);
      }

      $(this._element).addClass(ClassName.SHOW);

      if (this._config.focus) {
        this._enforceFocus();
      }

      var shownEvent = $.Event(Event.SHOWN, {
        relatedTarget: relatedTarget
      });

      var transitionComplete = function transitionComplete() {
        if (_this12._config.focus) {
          _this12._element.focus();
        }
        _this12._isTransitioning = false;
        $(_this12._element).trigger(shownEvent);
      };

      if (transition) {
        $(this._dialog).one(Util.TRANSITION_END, transitionComplete).emulateTransitionEnd(TRANSITION_DURATION);
      } else {
        transitionComplete();
      }
    };

    Modal.prototype._enforceFocus = function _enforceFocus() {
      var _this13 = this;

      $(document).off(Event.FOCUSIN) // guard against infinite focus loop
      .on(Event.FOCUSIN, function (event) {
        if (document !== event.target && _this13._element !== event.target && !$(_this13._element).has(event.target).length) {
          _this13._element.focus();
        }
      });
    };

    Modal.prototype._setEscapeEvent = function _setEscapeEvent() {
      var _this14 = this;

      if (this._isShown && this._config.keyboard) {
        $(this._element).on(Event.KEYDOWN_DISMISS, function (event) {
          if (event.which === ESCAPE_KEYCODE) {
            event.preventDefault();
            _this14.hide();
          }
        });
      } else if (!this._isShown) {
        $(this._element).off(Event.KEYDOWN_DISMISS);
      }
    };

    Modal.prototype._setResizeEvent = function _setResizeEvent() {
      var _this15 = this;

      if (this._isShown) {
        $(window).on(Event.RESIZE, function (event) {
          return _this15.handleUpdate(event);
        });
      } else {
        $(window).off(Event.RESIZE);
      }
    };

    Modal.prototype._hideModal = function _hideModal() {
      var _this16 = this;

      this._element.style.display = 'none';
      this._element.setAttribute('aria-hidden', true);
      this._isTransitioning = false;
      this._showBackdrop(function () {
        $(document.body).removeClass(ClassName.OPEN);
        _this16._resetAdjustments();
        _this16._resetScrollbar();
        $(_this16._element).trigger(Event.HIDDEN);
      });
    };

    Modal.prototype._removeBackdrop = function _removeBackdrop() {
      if (this._backdrop) {
        $(this._backdrop).remove();
        this._backdrop = null;
      }
    };

    Modal.prototype._showBackdrop = function _showBackdrop(callback) {
      var _this17 = this;

      var animate = $(this._element).hasClass(ClassName.FADE) ? ClassName.FADE : '';

      if (this._isShown && this._config.backdrop) {
        var doAnimate = Util.supportsTransitionEnd() && animate;

        this._backdrop = document.createElement('div');
        this._backdrop.className = ClassName.BACKDROP;

        if (animate) {
          $(this._backdrop).addClass(animate);
        }

        $(this._backdrop).appendTo(document.body);

        $(this._element).on(Event.CLICK_DISMISS, function (event) {
          if (_this17._ignoreBackdropClick) {
            _this17._ignoreBackdropClick = false;
            return;
          }
          if (event.target !== event.currentTarget) {
            return;
          }
          if (_this17._config.backdrop === 'static') {
            _this17._element.focus();
          } else {
            _this17.hide();
          }
        });

        if (doAnimate) {
          Util.reflow(this._backdrop);
        }

        $(this._backdrop).addClass(ClassName.SHOW);

        if (!callback) {
          return;
        }

        if (!doAnimate) {
          callback();
          return;
        }

        $(this._backdrop).one(Util.TRANSITION_END, callback).emulateTransitionEnd(BACKDROP_TRANSITION_DURATION);
      } else if (!this._isShown && this._backdrop) {
        $(this._backdrop).removeClass(ClassName.SHOW);

        var callbackRemove = function callbackRemove() {
          _this17._removeBackdrop();
          if (callback) {
            callback();
          }
        };

        if (Util.supportsTransitionEnd() && $(this._element).hasClass(ClassName.FADE)) {
          $(this._backdrop).one(Util.TRANSITION_END, callbackRemove).emulateTransitionEnd(BACKDROP_TRANSITION_DURATION);
        } else {
          callbackRemove();
        }
      } else if (callback) {
        callback();
      }
    };

    // ----------------------------------------------------------------------
    // the following methods are used to handle overflowing modals
    // todo (fat): these should probably be refactored out of modal.js
    // ----------------------------------------------------------------------

    Modal.prototype._adjustDialog = function _adjustDialog() {
      var isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;

      if (!this._isBodyOverflowing && isModalOverflowing) {
        this._element.style.paddingLeft = this._scrollbarWidth + 'px';
      }

      if (this._isBodyOverflowing && !isModalOverflowing) {
        this._element.style.paddingRight = this._scrollbarWidth + 'px';
      }
    };

    Modal.prototype._resetAdjustments = function _resetAdjustments() {
      this._element.style.paddingLeft = '';
      this._element.style.paddingRight = '';
    };

    Modal.prototype._checkScrollbar = function _checkScrollbar() {
      this._isBodyOverflowing = document.body.clientWidth < window.innerWidth;
      this._scrollbarWidth = this._getScrollbarWidth();
    };

    Modal.prototype._setScrollbar = function _setScrollbar() {
      var _this18 = this;

      if (this._isBodyOverflowing) {
        // Note: DOMNode.style.paddingRight returns the actual value or '' if not set
        //   while $(DOMNode).css('padding-right') returns the calculated value or 0 if not set

        // Adjust fixed content padding
        $(Selector.FIXED_CONTENT).each(function (index, element) {
          var actualPadding = $(element)[0].style.paddingRight;
          var calculatedPadding = $(element).css('padding-right');
          $(element).data('padding-right', actualPadding).css('padding-right', parseFloat(calculatedPadding) + _this18._scrollbarWidth + 'px');
        });

        // Adjust navbar-toggler margin
        $(Selector.NAVBAR_TOGGLER).each(function (index, element) {
          var actualMargin = $(element)[0].style.marginRight;
          var calculatedMargin = $(element).css('margin-right');
          $(element).data('margin-right', actualMargin).css('margin-right', parseFloat(calculatedMargin) + _this18._scrollbarWidth + 'px');
        });

        // Adjust body padding
        var actualPadding = document.body.style.paddingRight;
        var calculatedPadding = $('body').css('padding-right');
        $('body').data('padding-right', actualPadding).css('padding-right', parseFloat(calculatedPadding) + this._scrollbarWidth + 'px');
      }
    };

    Modal.prototype._resetScrollbar = function _resetScrollbar() {
      // Restore fixed content padding
      $(Selector.FIXED_CONTENT).each(function (index, element) {
        var padding = $(element).data('padding-right');
        if (typeof padding !== 'undefined') {
          $(element).css('padding-right', padding).removeData('padding-right');
        }
      });

      // Restore navbar-toggler margin
      $(Selector.NAVBAR_TOGGLER).each(function (index, element) {
        var margin = $(element).data('margin-right');
        if (typeof margin !== 'undefined') {
          $(element).css('margin-right', margin).removeData('margin-right');
        }
      });

      // Restore body padding
      var padding = $('body').data('padding-right');
      if (typeof padding !== 'undefined') {
        $('body').css('padding-right', padding).removeData('padding-right');
      }
    };

    Modal.prototype._getScrollbarWidth = function _getScrollbarWidth() {
      // thx d.walsh
      var scrollDiv = document.createElement('div');
      scrollDiv.className = ClassName.SCROLLBAR_MEASURER;
      document.body.appendChild(scrollDiv);
      var scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
      return scrollbarWidth;
    };

    // static

    Modal._jQueryInterface = function _jQueryInterface(config, relatedTarget) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY);
        var _config = $.extend({}, Modal.Default, $(this).data(), (typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object' && config);

        if (!data) {
          data = new Modal(this, _config);
          $(this).data(DATA_KEY, data);
        }

        if (typeof config === 'string') {
          if (data[config] === undefined) {
            throw new Error('No method named "' + config + '"');
          }
          data[config](relatedTarget);
        } else if (_config.show) {
          data.show(relatedTarget);
        }
      });
    };

    _createClass(Modal, null, [{
      key: 'VERSION',
      get: function get() {
        return VERSION;
      }
    }, {
      key: 'Default',
      get: function get() {
        return Default;
      }
    }]);

    return Modal;
  }();

  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  $(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
    var _this19 = this;

    var target = void 0;
    var selector = Util.getSelectorFromElement(this);

    if (selector) {
      target = $(selector)[0];
    }

    var config = $(target).data(DATA_KEY) ? 'toggle' : $.extend({}, $(target).data(), $(this).data());

    if (this.tagName === 'A' || this.tagName === 'AREA') {
      event.preventDefault();
    }

    var $target = $(target).one(Event.SHOW, function (showEvent) {
      if (showEvent.isDefaultPrevented()) {
        // only register focus restorer if modal will actually get shown
        return;
      }

      $target.one(Event.HIDDEN, function () {
        if ($(_this19).is(':visible')) {
          _this19.focus();
        }
      });
    });

    Modal._jQueryInterface.call($(target), config, this);
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME] = Modal._jQueryInterface;
  $.fn[NAME].Constructor = Modal;
  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Modal._jQueryInterface;
  };

  return Modal;
}(jQuery);

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-beta): scrollspy.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var ScrollSpy = function ($) {

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME = 'scrollspy';
  var VERSION = '4.0.0-beta';
  var DATA_KEY = 'bs.scrollspy';
  var EVENT_KEY = '.' + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $.fn[NAME];

  var Default = {
    offset: 10,
    method: 'auto',
    target: ''
  };

  var DefaultType = {
    offset: 'number',
    method: 'string',
    target: '(string|element)'
  };

  var Event = {
    ACTIVATE: 'activate' + EVENT_KEY,
    SCROLL: 'scroll' + EVENT_KEY,
    LOAD_DATA_API: 'load' + EVENT_KEY + DATA_API_KEY
  };

  var ClassName = {
    DROPDOWN_ITEM: 'dropdown-item',
    DROPDOWN_MENU: 'dropdown-menu',
    ACTIVE: 'active'
  };

  var Selector = {
    DATA_SPY: '[data-spy="scroll"]',
    ACTIVE: '.active',
    NAV_LIST_GROUP: '.nav, .list-group',
    NAV_LINKS: '.nav-link',
    LIST_ITEMS: '.list-group-item',
    DROPDOWN: '.dropdown',
    DROPDOWN_ITEMS: '.dropdown-item',
    DROPDOWN_TOGGLE: '.dropdown-toggle'
  };

  var OffsetMethod = {
    OFFSET: 'offset',
    POSITION: 'position'

    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };
  var ScrollSpy = function () {
    function ScrollSpy(element, config) {
      var _this20 = this;

      _classCallCheck(this, ScrollSpy);

      this._element = element;
      this._scrollElement = element.tagName === 'BODY' ? window : element;
      this._config = this._getConfig(config);
      this._selector = this._config.target + ' ' + Selector.NAV_LINKS + ',' + (this._config.target + ' ' + Selector.LIST_ITEMS + ',') + (this._config.target + ' ' + Selector.DROPDOWN_ITEMS);
      this._offsets = [];
      this._targets = [];
      this._activeTarget = null;
      this._scrollHeight = 0;

      $(this._scrollElement).on(Event.SCROLL, function (event) {
        return _this20._process(event);
      });

      this.refresh();
      this._process();
    }

    // getters

    // public

    ScrollSpy.prototype.refresh = function refresh() {
      var _this21 = this;

      var autoMethod = this._scrollElement !== this._scrollElement.window ? OffsetMethod.POSITION : OffsetMethod.OFFSET;

      var offsetMethod = this._config.method === 'auto' ? autoMethod : this._config.method;

      var offsetBase = offsetMethod === OffsetMethod.POSITION ? this._getScrollTop() : 0;

      this._offsets = [];
      this._targets = [];

      this._scrollHeight = this._getScrollHeight();

      var targets = $.makeArray($(this._selector));

      targets.map(function (element) {
        var target = void 0;
        var targetSelector = Util.getSelectorFromElement(element);

        if (targetSelector) {
          target = $(targetSelector)[0];
        }

        if (target) {
          var targetBCR = target.getBoundingClientRect();
          if (targetBCR.width || targetBCR.height) {
            // todo (fat): remove sketch reliance on jQuery position/offset
            return [$(target)[offsetMethod]().top + offsetBase, targetSelector];
          }
        }
        return null;
      }).filter(function (item) {
        return item;
      }).sort(function (a, b) {
        return a[0] - b[0];
      }).forEach(function (item) {
        _this21._offsets.push(item[0]);
        _this21._targets.push(item[1]);
      });
    };

    ScrollSpy.prototype.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY);
      $(this._scrollElement).off(EVENT_KEY);

      this._element = null;
      this._scrollElement = null;
      this._config = null;
      this._selector = null;
      this._offsets = null;
      this._targets = null;
      this._activeTarget = null;
      this._scrollHeight = null;
    };

    // private

    ScrollSpy.prototype._getConfig = function _getConfig(config) {
      config = $.extend({}, Default, config);

      if (typeof config.target !== 'string') {
        var id = $(config.target).attr('id');
        if (!id) {
          id = Util.getUID(NAME);
          $(config.target).attr('id', id);
        }
        config.target = '#' + id;
      }

      Util.typeCheckConfig(NAME, config, DefaultType);

      return config;
    };

    ScrollSpy.prototype._getScrollTop = function _getScrollTop() {
      return this._scrollElement === window ? this._scrollElement.pageYOffset : this._scrollElement.scrollTop;
    };

    ScrollSpy.prototype._getScrollHeight = function _getScrollHeight() {
      return this._scrollElement.scrollHeight || Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    };

    ScrollSpy.prototype._getOffsetHeight = function _getOffsetHeight() {
      return this._scrollElement === window ? window.innerHeight : this._scrollElement.getBoundingClientRect().height;
    };

    ScrollSpy.prototype._process = function _process() {
      var scrollTop = this._getScrollTop() + this._config.offset;
      var scrollHeight = this._getScrollHeight();
      var maxScroll = this._config.offset + scrollHeight - this._getOffsetHeight();

      if (this._scrollHeight !== scrollHeight) {
        this.refresh();
      }

      if (scrollTop >= maxScroll) {
        var target = this._targets[this._targets.length - 1];

        if (this._activeTarget !== target) {
          this._activate(target);
        }
        return;
      }

      if (this._activeTarget && scrollTop < this._offsets[0] && this._offsets[0] > 0) {
        this._activeTarget = null;
        this._clear();
        return;
      }

      for (var i = this._offsets.length; i--;) {
        var isActiveTarget = this._activeTarget !== this._targets[i] && scrollTop >= this._offsets[i] && (this._offsets[i + 1] === undefined || scrollTop < this._offsets[i + 1]);

        if (isActiveTarget) {
          this._activate(this._targets[i]);
        }
      }
    };

    ScrollSpy.prototype._activate = function _activate(target) {
      this._activeTarget = target;

      this._clear();

      var queries = this._selector.split(',');
      queries = queries.map(function (selector) {
        return selector + '[data-target="' + target + '"],' + (selector + '[href="' + target + '"]');
      });

      var $link = $(queries.join(','));

      if ($link.hasClass(ClassName.DROPDOWN_ITEM)) {
        $link.closest(Selector.DROPDOWN).find(Selector.DROPDOWN_TOGGLE).addClass(ClassName.ACTIVE);
        $link.addClass(ClassName.ACTIVE);
      } else {
        // Set triggered link as active
        $link.addClass(ClassName.ACTIVE);
        // Set triggered links parents as active
        // With both <ul> and <nav> markup a parent is the previous sibling of any nav ancestor
        $link.parents(Selector.NAV_LIST_GROUP).prev(Selector.NAV_LINKS + ', ' + Selector.LIST_ITEMS).addClass(ClassName.ACTIVE);
      }

      $(this._scrollElement).trigger(Event.ACTIVATE, {
        relatedTarget: target
      });
    };

    ScrollSpy.prototype._clear = function _clear() {
      $(this._selector).filter(Selector.ACTIVE).removeClass(ClassName.ACTIVE);
    };

    // static

    ScrollSpy._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY);
        var _config = (typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object' && config;

        if (!data) {
          data = new ScrollSpy(this, _config);
          $(this).data(DATA_KEY, data);
        }

        if (typeof config === 'string') {
          if (data[config] === undefined) {
            throw new Error('No method named "' + config + '"');
          }
          data[config]();
        }
      });
    };

    _createClass(ScrollSpy, null, [{
      key: 'VERSION',
      get: function get() {
        return VERSION;
      }
    }, {
      key: 'Default',
      get: function get() {
        return Default;
      }
    }]);

    return ScrollSpy;
  }();

  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  $(window).on(Event.LOAD_DATA_API, function () {
    var scrollSpys = $.makeArray($(Selector.DATA_SPY));

    for (var i = scrollSpys.length; i--;) {
      var $spy = $(scrollSpys[i]);
      ScrollSpy._jQueryInterface.call($spy, $spy.data());
    }
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME] = ScrollSpy._jQueryInterface;
  $.fn[NAME].Constructor = ScrollSpy;
  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return ScrollSpy._jQueryInterface;
  };

  return ScrollSpy;
}(jQuery);

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-beta): tab.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Tab = function ($) {

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME = 'tab';
  var VERSION = '4.0.0-beta';
  var DATA_KEY = 'bs.tab';
  var EVENT_KEY = '.' + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var TRANSITION_DURATION = 150;

  var Event = {
    HIDE: 'hide' + EVENT_KEY,
    HIDDEN: 'hidden' + EVENT_KEY,
    SHOW: 'show' + EVENT_KEY,
    SHOWN: 'shown' + EVENT_KEY,
    CLICK_DATA_API: 'click' + EVENT_KEY + DATA_API_KEY
  };

  var ClassName = {
    DROPDOWN_MENU: 'dropdown-menu',
    ACTIVE: 'active',
    DISABLED: 'disabled',
    FADE: 'fade',
    SHOW: 'show'
  };

  var Selector = {
    DROPDOWN: '.dropdown',
    NAV_LIST_GROUP: '.nav, .list-group',
    ACTIVE: '.active',
    DATA_TOGGLE: '[data-toggle="tab"], [data-toggle="pill"], [data-toggle="list"]',
    DROPDOWN_TOGGLE: '.dropdown-toggle',
    DROPDOWN_ACTIVE_CHILD: '> .dropdown-menu .active'

    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };
  var Tab = function () {
    function Tab(element) {
      _classCallCheck(this, Tab);

      this._element = element;
    }

    // getters

    // public

    Tab.prototype.show = function show() {
      var _this22 = this;

      if (this._element.parentNode && this._element.parentNode.nodeType === Node.ELEMENT_NODE && $(this._element).hasClass(ClassName.ACTIVE) || $(this._element).hasClass(ClassName.DISABLED)) {
        return;
      }

      var target = void 0;
      var previous = void 0;
      var listElement = $(this._element).closest(Selector.NAV_LIST_GROUP)[0];
      var selector = Util.getSelectorFromElement(this._element);

      if (listElement) {
        previous = $.makeArray($(listElement).find(Selector.ACTIVE));
        previous = previous[previous.length - 1];
      }

      var hideEvent = $.Event(Event.HIDE, {
        relatedTarget: this._element
      });

      var showEvent = $.Event(Event.SHOW, {
        relatedTarget: previous
      });

      if (previous) {
        $(previous).trigger(hideEvent);
      }

      $(this._element).trigger(showEvent);

      if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) {
        return;
      }

      if (selector) {
        target = $(selector)[0];
      }

      this._activate(this._element, listElement);

      var complete = function complete() {
        var hiddenEvent = $.Event(Event.HIDDEN, {
          relatedTarget: _this22._element
        });

        var shownEvent = $.Event(Event.SHOWN, {
          relatedTarget: previous
        });

        $(previous).trigger(hiddenEvent);
        $(_this22._element).trigger(shownEvent);
      };

      if (target) {
        this._activate(target, target.parentNode, complete);
      } else {
        complete();
      }
    };

    Tab.prototype.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY);
      this._element = null;
    };

    // private

    Tab.prototype._activate = function _activate(element, container, callback) {
      var _this23 = this;

      var active = $(container).find(Selector.ACTIVE)[0];
      var isTransitioning = callback && Util.supportsTransitionEnd() && active && $(active).hasClass(ClassName.FADE);

      var complete = function complete() {
        return _this23._transitionComplete(element, active, isTransitioning, callback);
      };

      if (active && isTransitioning) {
        $(active).one(Util.TRANSITION_END, complete).emulateTransitionEnd(TRANSITION_DURATION);
      } else {
        complete();
      }

      if (active) {
        $(active).removeClass(ClassName.SHOW);
      }
    };

    Tab.prototype._transitionComplete = function _transitionComplete(element, active, isTransitioning, callback) {
      if (active) {
        $(active).removeClass(ClassName.ACTIVE);

        var dropdownChild = $(active.parentNode).find(Selector.DROPDOWN_ACTIVE_CHILD)[0];

        if (dropdownChild) {
          $(dropdownChild).removeClass(ClassName.ACTIVE);
        }

        active.setAttribute('aria-expanded', false);
      }

      $(element).addClass(ClassName.ACTIVE);
      element.setAttribute('aria-expanded', true);

      if (isTransitioning) {
        Util.reflow(element);
        $(element).addClass(ClassName.SHOW);
      } else {
        $(element).removeClass(ClassName.FADE);
      }

      if (element.parentNode && $(element.parentNode).hasClass(ClassName.DROPDOWN_MENU)) {

        var dropdownElement = $(element).closest(Selector.DROPDOWN)[0];
        if (dropdownElement) {
          $(dropdownElement).find(Selector.DROPDOWN_TOGGLE).addClass(ClassName.ACTIVE);
        }

        element.setAttribute('aria-expanded', true);
      }

      if (callback) {
        callback();
      }
    };

    // static

    Tab._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var $this = $(this);
        var data = $this.data(DATA_KEY);

        if (!data) {
          data = new Tab(this);
          $this.data(DATA_KEY, data);
        }

        if (typeof config === 'string') {
          if (data[config] === undefined) {
            throw new Error('No method named "' + config + '"');
          }
          data[config]();
        }
      });
    };

    _createClass(Tab, null, [{
      key: 'VERSION',
      get: function get() {
        return VERSION;
      }
    }]);

    return Tab;
  }();

  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */

  $(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
    event.preventDefault();
    Tab._jQueryInterface.call($(this), 'show');
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME] = Tab._jQueryInterface;
  $.fn[NAME].Constructor = Tab;
  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Tab._jQueryInterface;
  };

  return Tab;
}(jQuery);

/* global Popper */

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-beta): tooltip.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Tooltip = function ($) {

  /**
   * Check for Popper dependency
   * Popper - https://popper.js.org
   */
  if (typeof Popper === 'undefined') {
    throw new Error('Bootstrap tooltips require Popper.js (https://popper.js.org)');
  }

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME = 'tooltip';
  var VERSION = '4.0.0-beta';
  var DATA_KEY = 'bs.tooltip';
  var EVENT_KEY = '.' + DATA_KEY;
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var TRANSITION_DURATION = 150;
  var CLASS_PREFIX = 'bs-tooltip';
  var BSCLS_PREFIX_REGEX = new RegExp('(^|\\s)' + CLASS_PREFIX + '\\S+', 'g');

  var DefaultType = {
    animation: 'boolean',
    template: 'string',
    title: '(string|element|function)',
    trigger: 'string',
    delay: '(number|object)',
    html: 'boolean',
    selector: '(string|boolean)',
    placement: '(string|function)',
    offset: '(number|string)',
    container: '(string|element|boolean)',
    fallbackPlacement: '(string|array)'
  };

  var AttachmentMap = {
    AUTO: 'auto',
    TOP: 'top',
    RIGHT: 'right',
    BOTTOM: 'bottom',
    LEFT: 'left'
  };

  var Default = {
    animation: true,
    template: '<div class="tooltip" role="tooltip">' + '<div class="arrow"></div>' + '<div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    selector: false,
    placement: 'top',
    offset: 0,
    container: false,
    fallbackPlacement: 'flip'
  };

  var HoverState = {
    SHOW: 'show',
    OUT: 'out'
  };

  var Event = {
    HIDE: 'hide' + EVENT_KEY,
    HIDDEN: 'hidden' + EVENT_KEY,
    SHOW: 'show' + EVENT_KEY,
    SHOWN: 'shown' + EVENT_KEY,
    INSERTED: 'inserted' + EVENT_KEY,
    CLICK: 'click' + EVENT_KEY,
    FOCUSIN: 'focusin' + EVENT_KEY,
    FOCUSOUT: 'focusout' + EVENT_KEY,
    MOUSEENTER: 'mouseenter' + EVENT_KEY,
    MOUSELEAVE: 'mouseleave' + EVENT_KEY
  };

  var ClassName = {
    FADE: 'fade',
    SHOW: 'show'
  };

  var Selector = {
    TOOLTIP: '.tooltip',
    TOOLTIP_INNER: '.tooltip-inner',
    ARROW: '.arrow'
  };

  var Trigger = {
    HOVER: 'hover',
    FOCUS: 'focus',
    CLICK: 'click',
    MANUAL: 'manual'

    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };
  var Tooltip = function () {
    function Tooltip(element, config) {
      _classCallCheck(this, Tooltip);

      // private
      this._isEnabled = true;
      this._timeout = 0;
      this._hoverState = '';
      this._activeTrigger = {};
      this._popper = null;

      // protected
      this.element = element;
      this.config = this._getConfig(config);
      this.tip = null;

      this._setListeners();
    }

    // getters

    // public

    Tooltip.prototype.enable = function enable() {
      this._isEnabled = true;
    };

    Tooltip.prototype.disable = function disable() {
      this._isEnabled = false;
    };

    Tooltip.prototype.toggleEnabled = function toggleEnabled() {
      this._isEnabled = !this._isEnabled;
    };

    Tooltip.prototype.toggle = function toggle(event) {
      if (event) {
        var dataKey = this.constructor.DATA_KEY;
        var context = $(event.currentTarget).data(dataKey);

        if (!context) {
          context = new this.constructor(event.currentTarget, this._getDelegateConfig());
          $(event.currentTarget).data(dataKey, context);
        }

        context._activeTrigger.click = !context._activeTrigger.click;

        if (context._isWithActiveTrigger()) {
          context._enter(null, context);
        } else {
          context._leave(null, context);
        }
      } else {

        if ($(this.getTipElement()).hasClass(ClassName.SHOW)) {
          this._leave(null, this);
          return;
        }

        this._enter(null, this);
      }
    };

    Tooltip.prototype.dispose = function dispose() {
      clearTimeout(this._timeout);

      $.removeData(this.element, this.constructor.DATA_KEY);

      $(this.element).off(this.constructor.EVENT_KEY);
      $(this.element).closest('.modal').off('hide.bs.modal');

      if (this.tip) {
        $(this.tip).remove();
      }

      this._isEnabled = null;
      this._timeout = null;
      this._hoverState = null;
      this._activeTrigger = null;
      if (this._popper !== null) {
        this._popper.destroy();
      }
      this._popper = null;

      this.element = null;
      this.config = null;
      this.tip = null;
    };

    Tooltip.prototype.show = function show() {
      var _this24 = this;

      if ($(this.element).css('display') === 'none') {
        throw new Error('Please use show on visible elements');
      }

      var showEvent = $.Event(this.constructor.Event.SHOW);
      if (this.isWithContent() && this._isEnabled) {
        $(this.element).trigger(showEvent);

        var isInTheDom = $.contains(this.element.ownerDocument.documentElement, this.element);

        if (showEvent.isDefaultPrevented() || !isInTheDom) {
          return;
        }

        var tip = this.getTipElement();
        var tipId = Util.getUID(this.constructor.NAME);

        tip.setAttribute('id', tipId);
        this.element.setAttribute('aria-describedby', tipId);

        this.setContent();

        if (this.config.animation) {
          $(tip).addClass(ClassName.FADE);
        }

        var placement = typeof this.config.placement === 'function' ? this.config.placement.call(this, tip, this.element) : this.config.placement;

        var attachment = this._getAttachment(placement);
        this.addAttachmentClass(attachment);

        var container = this.config.container === false ? document.body : $(this.config.container);

        $(tip).data(this.constructor.DATA_KEY, this);

        if (!$.contains(this.element.ownerDocument.documentElement, this.tip)) {
          $(tip).appendTo(container);
        }

        $(this.element).trigger(this.constructor.Event.INSERTED);

        this._popper = new Popper(this.element, tip, {
          placement: attachment,
          modifiers: {
            offset: {
              offset: this.config.offset
            },
            flip: {
              behavior: this.config.fallbackPlacement
            },
            arrow: {
              element: Selector.ARROW
            }
          },
          onCreate: function onCreate(data) {
            if (data.originalPlacement !== data.placement) {
              _this24._handlePopperPlacementChange(data);
            }
          },
          onUpdate: function onUpdate(data) {
            _this24._handlePopperPlacementChange(data);
          }
        });

        $(tip).addClass(ClassName.SHOW);

        // if this is a touch-enabled device we add extra
        // empty mouseover listeners to the body's immediate children;
        // only needed because of broken event delegation on iOS
        // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
        if ('ontouchstart' in document.documentElement) {
          $('body').children().on('mouseover', null, $.noop);
        }

        var complete = function complete() {
          if (_this24.config.animation) {
            _this24._fixTransition();
          }
          var prevHoverState = _this24._hoverState;
          _this24._hoverState = null;

          $(_this24.element).trigger(_this24.constructor.Event.SHOWN);

          if (prevHoverState === HoverState.OUT) {
            _this24._leave(null, _this24);
          }
        };

        if (Util.supportsTransitionEnd() && $(this.tip).hasClass(ClassName.FADE)) {
          $(this.tip).one(Util.TRANSITION_END, complete).emulateTransitionEnd(Tooltip._TRANSITION_DURATION);
        } else {
          complete();
        }
      }
    };

    Tooltip.prototype.hide = function hide(callback) {
      var _this25 = this;

      var tip = this.getTipElement();
      var hideEvent = $.Event(this.constructor.Event.HIDE);
      var complete = function complete() {
        if (_this25._hoverState !== HoverState.SHOW && tip.parentNode) {
          tip.parentNode.removeChild(tip);
        }

        _this25._cleanTipClass();
        _this25.element.removeAttribute('aria-describedby');
        $(_this25.element).trigger(_this25.constructor.Event.HIDDEN);
        if (_this25._popper !== null) {
          _this25._popper.destroy();
        }

        if (callback) {
          callback();
        }
      };

      $(this.element).trigger(hideEvent);

      if (hideEvent.isDefaultPrevented()) {
        return;
      }

      $(tip).removeClass(ClassName.SHOW);

      // if this is a touch-enabled device we remove the extra
      // empty mouseover listeners we added for iOS support
      if ('ontouchstart' in document.documentElement) {
        $('body').children().off('mouseover', null, $.noop);
      }

      this._activeTrigger[Trigger.CLICK] = false;
      this._activeTrigger[Trigger.FOCUS] = false;
      this._activeTrigger[Trigger.HOVER] = false;

      if (Util.supportsTransitionEnd() && $(this.tip).hasClass(ClassName.FADE)) {

        $(tip).one(Util.TRANSITION_END, complete).emulateTransitionEnd(TRANSITION_DURATION);
      } else {
        complete();
      }

      this._hoverState = '';
    };

    Tooltip.prototype.update = function update() {
      if (this._popper !== null) {
        this._popper.scheduleUpdate();
      }
    };

    // protected

    Tooltip.prototype.isWithContent = function isWithContent() {
      return Boolean(this.getTitle());
    };

    Tooltip.prototype.addAttachmentClass = function addAttachmentClass(attachment) {
      $(this.getTipElement()).addClass(CLASS_PREFIX + '-' + attachment);
    };

    Tooltip.prototype.getTipElement = function getTipElement() {
      return this.tip = this.tip || $(this.config.template)[0];
    };

    Tooltip.prototype.setContent = function setContent() {
      var $tip = $(this.getTipElement());
      this.setElementContent($tip.find(Selector.TOOLTIP_INNER), this.getTitle());
      $tip.removeClass(ClassName.FADE + ' ' + ClassName.SHOW);
    };

    Tooltip.prototype.setElementContent = function setElementContent($element, content) {
      var html = this.config.html;
      if ((typeof content === 'undefined' ? 'undefined' : _typeof(content)) === 'object' && (content.nodeType || content.jquery)) {
        // content is a DOM node or a jQuery
        if (html) {
          if (!$(content).parent().is($element)) {
            $element.empty().append(content);
          }
        } else {
          $element.text($(content).text());
        }
      } else {
        $element[html ? 'html' : 'text'](content);
      }
    };

    Tooltip.prototype.getTitle = function getTitle() {
      var title = this.element.getAttribute('data-original-title');

      if (!title) {
        title = typeof this.config.title === 'function' ? this.config.title.call(this.element) : this.config.title;
      }

      return title;
    };

    // private

    Tooltip.prototype._getAttachment = function _getAttachment(placement) {
      return AttachmentMap[placement.toUpperCase()];
    };

    Tooltip.prototype._setListeners = function _setListeners() {
      var _this26 = this;

      var triggers = this.config.trigger.split(' ');

      triggers.forEach(function (trigger) {
        if (trigger === 'click') {
          $(_this26.element).on(_this26.constructor.Event.CLICK, _this26.config.selector, function (event) {
            return _this26.toggle(event);
          });
        } else if (trigger !== Trigger.MANUAL) {
          var eventIn = trigger === Trigger.HOVER ? _this26.constructor.Event.MOUSEENTER : _this26.constructor.Event.FOCUSIN;
          var eventOut = trigger === Trigger.HOVER ? _this26.constructor.Event.MOUSELEAVE : _this26.constructor.Event.FOCUSOUT;

          $(_this26.element).on(eventIn, _this26.config.selector, function (event) {
            return _this26._enter(event);
          }).on(eventOut, _this26.config.selector, function (event) {
            return _this26._leave(event);
          });
        }

        $(_this26.element).closest('.modal').on('hide.bs.modal', function () {
          return _this26.hide();
        });
      });

      if (this.config.selector) {
        this.config = $.extend({}, this.config, {
          trigger: 'manual',
          selector: ''
        });
      } else {
        this._fixTitle();
      }
    };

    Tooltip.prototype._fixTitle = function _fixTitle() {
      var titleType = _typeof(this.element.getAttribute('data-original-title'));
      if (this.element.getAttribute('title') || titleType !== 'string') {
        this.element.setAttribute('data-original-title', this.element.getAttribute('title') || '');
        this.element.setAttribute('title', '');
      }
    };

    Tooltip.prototype._enter = function _enter(event, context) {
      var dataKey = this.constructor.DATA_KEY;

      context = context || $(event.currentTarget).data(dataKey);

      if (!context) {
        context = new this.constructor(event.currentTarget, this._getDelegateConfig());
        $(event.currentTarget).data(dataKey, context);
      }

      if (event) {
        context._activeTrigger[event.type === 'focusin' ? Trigger.FOCUS : Trigger.HOVER] = true;
      }

      if ($(context.getTipElement()).hasClass(ClassName.SHOW) || context._hoverState === HoverState.SHOW) {
        context._hoverState = HoverState.SHOW;
        return;
      }

      clearTimeout(context._timeout);

      context._hoverState = HoverState.SHOW;

      if (!context.config.delay || !context.config.delay.show) {
        context.show();
        return;
      }

      context._timeout = setTimeout(function () {
        if (context._hoverState === HoverState.SHOW) {
          context.show();
        }
      }, context.config.delay.show);
    };

    Tooltip.prototype._leave = function _leave(event, context) {
      var dataKey = this.constructor.DATA_KEY;

      context = context || $(event.currentTarget).data(dataKey);

      if (!context) {
        context = new this.constructor(event.currentTarget, this._getDelegateConfig());
        $(event.currentTarget).data(dataKey, context);
      }

      if (event) {
        context._activeTrigger[event.type === 'focusout' ? Trigger.FOCUS : Trigger.HOVER] = false;
      }

      if (context._isWithActiveTrigger()) {
        return;
      }

      clearTimeout(context._timeout);

      context._hoverState = HoverState.OUT;

      if (!context.config.delay || !context.config.delay.hide) {
        context.hide();
        return;
      }

      context._timeout = setTimeout(function () {
        if (context._hoverState === HoverState.OUT) {
          context.hide();
        }
      }, context.config.delay.hide);
    };

    Tooltip.prototype._isWithActiveTrigger = function _isWithActiveTrigger() {
      for (var trigger in this._activeTrigger) {
        if (this._activeTrigger[trigger]) {
          return true;
        }
      }

      return false;
    };

    Tooltip.prototype._getConfig = function _getConfig(config) {
      config = $.extend({}, this.constructor.Default, $(this.element).data(), config);

      if (config.delay && typeof config.delay === 'number') {
        config.delay = {
          show: config.delay,
          hide: config.delay
        };
      }

      if (config.title && typeof config.title === 'number') {
        config.title = config.title.toString();
      }

      if (config.content && typeof config.content === 'number') {
        config.content = config.content.toString();
      }

      Util.typeCheckConfig(NAME, config, this.constructor.DefaultType);

      return config;
    };

    Tooltip.prototype._getDelegateConfig = function _getDelegateConfig() {
      var config = {};

      if (this.config) {
        for (var key in this.config) {
          if (this.constructor.Default[key] !== this.config[key]) {
            config[key] = this.config[key];
          }
        }
      }

      return config;
    };

    Tooltip.prototype._cleanTipClass = function _cleanTipClass() {
      var $tip = $(this.getTipElement());
      var tabClass = $tip.attr('class').match(BSCLS_PREFIX_REGEX);
      if (tabClass !== null && tabClass.length > 0) {
        $tip.removeClass(tabClass.join(''));
      }
    };

    Tooltip.prototype._handlePopperPlacementChange = function _handlePopperPlacementChange(data) {
      this._cleanTipClass();
      this.addAttachmentClass(this._getAttachment(data.placement));
    };

    Tooltip.prototype._fixTransition = function _fixTransition() {
      var tip = this.getTipElement();
      var initConfigAnimation = this.config.animation;
      if (tip.getAttribute('x-placement') !== null) {
        return;
      }
      $(tip).removeClass(ClassName.FADE);
      this.config.animation = false;
      this.hide();
      this.show();
      this.config.animation = initConfigAnimation;
    };

    // static

    Tooltip._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY);
        var _config = (typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object' && config;

        if (!data && /dispose|hide/.test(config)) {
          return;
        }

        if (!data) {
          data = new Tooltip(this, _config);
          $(this).data(DATA_KEY, data);
        }

        if (typeof config === 'string') {
          if (data[config] === undefined) {
            throw new Error('No method named "' + config + '"');
          }
          data[config]();
        }
      });
    };

    _createClass(Tooltip, null, [{
      key: 'VERSION',
      get: function get() {
        return VERSION;
      }
    }, {
      key: 'Default',
      get: function get() {
        return Default;
      }
    }, {
      key: 'NAME',
      get: function get() {
        return NAME;
      }
    }, {
      key: 'DATA_KEY',
      get: function get() {
        return DATA_KEY;
      }
    }, {
      key: 'Event',
      get: function get() {
        return Event;
      }
    }, {
      key: 'EVENT_KEY',
      get: function get() {
        return EVENT_KEY;
      }
    }, {
      key: 'DefaultType',
      get: function get() {
        return DefaultType;
      }
    }]);

    return Tooltip;
  }();

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME] = Tooltip._jQueryInterface;
  $.fn[NAME].Constructor = Tooltip;
  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Tooltip._jQueryInterface;
  };

  return Tooltip;
}(jQuery);

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-beta): popover.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Popover = function ($) {

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME = 'popover';
  var VERSION = '4.0.0-beta';
  var DATA_KEY = 'bs.popover';
  var EVENT_KEY = '.' + DATA_KEY;
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var CLASS_PREFIX = 'bs-popover';
  var BSCLS_PREFIX_REGEX = new RegExp('(^|\\s)' + CLASS_PREFIX + '\\S+', 'g');

  var Default = $.extend({}, Tooltip.Default, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip">' + '<div class="arrow"></div>' + '<h3 class="popover-header"></h3>' + '<div class="popover-body"></div></div>'
  });

  var DefaultType = $.extend({}, Tooltip.DefaultType, {
    content: '(string|element|function)'
  });

  var ClassName = {
    FADE: 'fade',
    SHOW: 'show'
  };

  var Selector = {
    TITLE: '.popover-header',
    CONTENT: '.popover-body'
  };

  var Event = {
    HIDE: 'hide' + EVENT_KEY,
    HIDDEN: 'hidden' + EVENT_KEY,
    SHOW: 'show' + EVENT_KEY,
    SHOWN: 'shown' + EVENT_KEY,
    INSERTED: 'inserted' + EVENT_KEY,
    CLICK: 'click' + EVENT_KEY,
    FOCUSIN: 'focusin' + EVENT_KEY,
    FOCUSOUT: 'focusout' + EVENT_KEY,
    MOUSEENTER: 'mouseenter' + EVENT_KEY,
    MOUSELEAVE: 'mouseleave' + EVENT_KEY

    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };
  var Popover = function (_Tooltip) {
    _inherits(Popover, _Tooltip);

    function Popover() {
      _classCallCheck(this, Popover);

      return _possibleConstructorReturn(this, _Tooltip.apply(this, arguments));
    }

    // overrides

    Popover.prototype.isWithContent = function isWithContent() {
      return this.getTitle() || this._getContent();
    };

    Popover.prototype.addAttachmentClass = function addAttachmentClass(attachment) {
      $(this.getTipElement()).addClass(CLASS_PREFIX + '-' + attachment);
    };

    Popover.prototype.getTipElement = function getTipElement() {
      return this.tip = this.tip || $(this.config.template)[0];
    };

    Popover.prototype.setContent = function setContent() {
      var $tip = $(this.getTipElement());

      // we use append for html objects to maintain js events
      this.setElementContent($tip.find(Selector.TITLE), this.getTitle());
      this.setElementContent($tip.find(Selector.CONTENT), this._getContent());

      $tip.removeClass(ClassName.FADE + ' ' + ClassName.SHOW);
    };

    // private

    Popover.prototype._getContent = function _getContent() {
      return this.element.getAttribute('data-content') || (typeof this.config.content === 'function' ? this.config.content.call(this.element) : this.config.content);
    };

    Popover.prototype._cleanTipClass = function _cleanTipClass() {
      var $tip = $(this.getTipElement());
      var tabClass = $tip.attr('class').match(BSCLS_PREFIX_REGEX);
      if (tabClass !== null && tabClass.length > 0) {
        $tip.removeClass(tabClass.join(''));
      }
    };

    // static

    Popover._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY);
        var _config = (typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object' ? config : null;

        if (!data && /destroy|hide/.test(config)) {
          return;
        }

        if (!data) {
          data = new Popover(this, _config);
          $(this).data(DATA_KEY, data);
        }

        if (typeof config === 'string') {
          if (data[config] === undefined) {
            throw new Error('No method named "' + config + '"');
          }
          data[config]();
        }
      });
    };

    _createClass(Popover, null, [{
      key: 'VERSION',


      // getters

      get: function get() {
        return VERSION;
      }
    }, {
      key: 'Default',
      get: function get() {
        return Default;
      }
    }, {
      key: 'NAME',
      get: function get() {
        return NAME;
      }
    }, {
      key: 'DATA_KEY',
      get: function get() {
        return DATA_KEY;
      }
    }, {
      key: 'Event',
      get: function get() {
        return Event;
      }
    }, {
      key: 'EVENT_KEY',
      get: function get() {
        return EVENT_KEY;
      }
    }, {
      key: 'DefaultType',
      get: function get() {
        return DefaultType;
      }
    }]);

    return Popover;
  }(Tooltip);

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME] = Popover._jQueryInterface;
  $.fn[NAME].Constructor = Popover;
  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Popover._jQueryInterface;
  };

  return Popover;
}(jQuery);


})();

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * Material v4.0.0-beta (http://daemonite.github.io/material/)
 * Copyright 2017 Daemon Pty Ltd
 * Licensed under MIT (https://github.com/Daemonite/material/blob/master/LICENSE)
 */

if (typeof jQuery === 'undefined') {
  throw new Error('Material\'s JavaScript requires jQuery')
}

+function ($) {
  var version = $.fn.jquery.split(' ')[0].split('.')
  if (version[0] < 3 || version[0] >= 4) {
    throw new Error('Material\'s JavaScript requires at least jQuery v3.0.0 but less than v4.0.0')
  }
}(jQuery);

!function(a){this.Picker=a(jQuery)}(function(a){function b(f,g,i,m){function n(){return b._.node("div",b._.node("div",b._.node("div",b._.node("div",B.component.nodes(w.open),y.box),y.wrap),y.frame),y.holder,'tabindex="-1"')}function o(){z.data(g,B).addClass(y.input).val(z.data("value")?B.get("select",x.format):f.value),x.editable||z.on("focus."+w.id+" click."+w.id,function(a){a.preventDefault(),B.open()}).on("keydown."+w.id,u),e(f,{haspopup:!0,expanded:!1,readonly:!1,owns:f.id+"_root"})}function p(){e(B.$root[0],"hidden",!0)}function q(){B.$holder.on({keydown:u,"focus.toOpen":t,blur:function(){z.removeClass(y.target)},focusin:function(a){B.$root.removeClass(y.focused),a.stopPropagation()},"mousedown click":function(b){var c=b.target;c!=B.$holder[0]&&(b.stopPropagation(),"mousedown"!=b.type||a(c).is("input, select, textarea, button, option")||(b.preventDefault(),B.$holder[0].focus()))}}).on("click","[data-pick], [data-nav], [data-clear], [data-close]",function(){var b=a(this),c=b.data(),d=b.hasClass(y.navDisabled)||b.hasClass(y.disabled),e=h();e=e&&(e.type||e.href),(d||e&&!a.contains(B.$root[0],e))&&B.$holder[0].focus(),!d&&c.nav?B.set("highlight",B.component.item.highlight,{nav:c.nav}):!d&&"pick"in c?(B.set("select",c.pick),x.closeOnSelect&&B.close(!0)):c.clear?(B.clear(),x.closeOnClear&&B.close(!0)):c.close&&B.close(!0)})}function r(){var b;x.hiddenName===!0?(b=f.name,f.name=""):(b=["string"==typeof x.hiddenPrefix?x.hiddenPrefix:"","string"==typeof x.hiddenSuffix?x.hiddenSuffix:"_submit"],b=b[0]+f.name+b[1]),B._hidden=a('<input type=hidden name="'+b+'"'+(z.data("value")||f.value?' value="'+B.get("select",x.formatSubmit)+'"':"")+">")[0],z.on("change."+w.id,function(){B._hidden.value=f.value?B.get("select",x.formatSubmit):""})}function s(){v&&l?B.$holder.find("."+y.frame).one("transitionend",function(){B.$holder[0].focus()}):B.$holder[0].focus()}function t(a){a.stopPropagation(),z.addClass(y.target),B.$root.addClass(y.focused),B.open()}function u(a){var b=a.keyCode,c=/^(8|46)$/.test(b);return 27==b?(B.close(!0),!1):void((32==b||c||!w.open&&B.component.key[b])&&(a.preventDefault(),a.stopPropagation(),c?B.clear().close():B.open()))}if(!f)return b;var v=!1,w={id:f.id||"P"+Math.abs(~~(Math.random()*new Date))},x=i?a.extend(!0,{},i.defaults,m):m||{},y=a.extend({},b.klasses(),x.klass),z=a(f),A=function(){return this.start()},B=A.prototype={constructor:A,$node:z,start:function(){return w&&w.start?B:(w.methods={},w.start=!0,w.open=!1,w.type=f.type,f.autofocus=f==h(),f.readOnly=!x.editable,f.id=f.id||w.id,"text"!=f.type&&(f.type="text"),B.component=new i(B,x),B.$root=a('<div class="'+y.picker+'" id="'+f.id+'_root" />'),p(),B.$holder=a(n()).appendTo(B.$root),q(),x.formatSubmit&&r(),o(),x.containerHidden?a(x.containerHidden).append(B._hidden):z.after(B._hidden),x.container?a(x.container).append(B.$root):z.after(B.$root),B.on({start:B.component.onStart,render:B.component.onRender,stop:B.component.onStop,open:B.component.onOpen,close:B.component.onClose,set:B.component.onSet}).on({start:x.onStart,render:x.onRender,stop:x.onStop,open:x.onOpen,close:x.onClose,set:x.onSet}),v=c(B.$holder[0]),f.autofocus&&B.open(),B.trigger("start").trigger("render"))},render:function(b){return b?(B.$holder=a(n()),q(),B.$root.html(B.$holder)):B.$root.find("."+y.box).html(B.component.nodes(w.open)),B.trigger("render")},stop:function(){return w.start?(B.close(),B._hidden&&B._hidden.parentNode.removeChild(B._hidden),B.$root.remove(),z.removeClass(y.input).removeData(g),setTimeout(function(){z.off("."+w.id)},0),f.type=w.type,f.readOnly=!1,B.trigger("stop"),w.methods={},w.start=!1,B):B},open:function(c){return w.open?B:(z.addClass(y.active),e(f,"expanded",!0),setTimeout(function(){B.$root.addClass(y.opened),e(B.$root[0],"hidden",!1)},0),c!==!1&&(w.open=!0,v&&k.css("overflow","hidden").css("padding-right","+="+d()),s(),j.on("click."+w.id+" focusin."+w.id,function(a){var b=a.target;b!=f&&b!=document&&3!=a.which&&B.close(b===B.$holder[0])}).on("keydown."+w.id,function(c){var d=c.keyCode,e=B.component.key[d],f=c.target;27==d?B.close(!0):f!=B.$holder[0]||!e&&13!=d?a.contains(B.$root[0],f)&&13==d&&(c.preventDefault(),f.click()):(c.preventDefault(),e?b._.trigger(B.component.key.go,B,[b._.trigger(e)]):B.$root.find("."+y.highlighted).hasClass(y.disabled)||(B.set("select",B.component.item.highlight),x.closeOnSelect&&B.close(!0)))})),B.trigger("open"))},close:function(a){return a&&(x.editable?f.focus():(B.$holder.off("focus.toOpen").focus(),setTimeout(function(){B.$holder.on("focus.toOpen",t)},0))),z.removeClass(y.active),e(f,"expanded",!1),setTimeout(function(){B.$root.removeClass(y.opened+" "+y.focused),e(B.$root[0],"hidden",!0)},0),w.open?(w.open=!1,v&&k.css("overflow","").css("padding-right","-="+d()),j.off("."+w.id),B.trigger("close")):B},clear:function(a){return B.set("clear",null,a)},set:function(b,c,d){var e,f,g=a.isPlainObject(b),h=g?b:{};if(d=g&&a.isPlainObject(c)?c:d||{},b){g||(h[b]=c);for(e in h)f=h[e],e in B.component.item&&(void 0===f&&(f=null),B.component.set(e,f,d)),("select"==e||"clear"==e)&&z.val("clear"==e?"":B.get(e,x.format)).trigger("change");B.render()}return d.muted?B:B.trigger("set",h)},get:function(a,c){if(a=a||"value",null!=w[a])return w[a];if("valueSubmit"==a){if(B._hidden)return B._hidden.value;a="value"}if("value"==a)return f.value;if(a in B.component.item){if("string"==typeof c){var d=B.component.get(a);return d?b._.trigger(B.component.formats.toString,B.component,[c,d]):""}return B.component.get(a)}},on:function(b,c,d){var e,f,g=a.isPlainObject(b),h=g?b:{};if(b){g||(h[b]=c);for(e in h)f=h[e],d&&(e="_"+e),w.methods[e]=w.methods[e]||[],w.methods[e].push(f)}return B},off:function(){var a,b,c=arguments;for(a=0,namesCount=c.length;a<namesCount;a+=1)b=c[a],b in w.methods&&delete w.methods[b];return B},trigger:function(a,c){var d=function(a){var d=w.methods[a];d&&d.map(function(a){b._.trigger(a,B,[c])})};return d("_"+a),d(a),B}};return new A}function c(a){var b,c="position";return a.currentStyle?b=a.currentStyle[c]:window.getComputedStyle&&(b=getComputedStyle(a)[c]),"fixed"==b}function d(){if(k.height()<=i.height())return 0;var b=a('<div style="visibility:hidden;width:100px" />').appendTo("body"),c=b[0].offsetWidth;b.css("overflow","scroll");var d=a('<div style="width:100%" />').appendTo(b),e=d[0].offsetWidth;return b.remove(),c-e}function e(b,c,d){if(a.isPlainObject(c))for(var e in c)f(b,e,c[e]);else f(b,c,d)}function f(a,b,c){a.setAttribute(("role"==b?"":"aria-")+b,c)}function g(b,c){a.isPlainObject(b)||(b={attribute:c}),c="";for(var d in b){var e=("role"==d?"":"aria-")+d,f=b[d];c+=null==f?"":e+'="'+b[d]+'"'}return c}function h(){try{return document.activeElement}catch(a){}}var i=a(window),j=a(document),k=a(document.documentElement),l=null!=document.documentElement.style.transition;return b.klasses=function(a){return a=a||"picker",{picker:a,opened:a+"--opened",focused:a+"--focused",input:a+"__input",active:a+"__input--active",target:a+"__input--target",holder:a+"__holder",frame:a+"__frame",wrap:a+"__wrap",box:a+"__box"}},b._={group:function(a){for(var c,d="",e=b._.trigger(a.min,a);e<=b._.trigger(a.max,a,[e]);e+=a.i)c=b._.trigger(a.item,a,[e]),d+=b._.node(a.node,c[0],c[1],c[2]);return d},node:function(b,c,d,e){return c?(c=a.isArray(c)?c.join(""):c,d=d?' class="'+d+'"':"",e=e?" "+e:"","<"+b+d+e+">"+c+"</"+b+">"):""},lead:function(a){return(10>a?"0":"")+a},trigger:function(a,b,c){return"function"==typeof a?a.apply(b,c||[]):a},digits:function(a){return/\d/.test(a[1])?2:1},isDate:function(a){return{}.toString.call(a).indexOf("Date")>-1&&this.isInteger(a.getDate())},isInteger:function(a){return{}.toString.call(a).indexOf("Number")>-1&&a%1===0},ariaAttr:g},b.extend=function(c,d){a.fn[c]=function(e,f){var g=this.data(c);return"picker"==e?g:g&&"string"==typeof e?b._.trigger(g[e],g,[f]):this.each(function(){var f=a(this);f.data(c)||new b(this,c,d,e)})},a.fn[c].defaults=d.defaults},b});
!function(a){a(Picker,jQuery)}(function(a,b){function c(a,b){var c=this,d=a.$node[0],e=d.value,f=a.$node.data("value"),g=f||e,h=f?b.formatSubmit:b.format,i=function(){return d.currentStyle?"rtl"==d.currentStyle.direction:"rtl"==getComputedStyle(a.$root[0]).direction};c.settings=b,c.$node=a.$node,c.queue={min:"measure create",max:"measure create",now:"now create",select:"parse create validate",highlight:"parse navigate create validate",view:"parse create validate viewset",disable:"deactivate",enable:"activate"},c.item={},c.item.clear=null,c.item.disable=(b.disable||[]).slice(0),c.item.enable=-function(a){return a[0]===!0?a.shift():-1}(c.item.disable),c.set("min",b.min).set("max",b.max).set("now"),g?c.set("select",g,{format:h,defaultValue:!0}):c.set("select",null).set("highlight",c.item.now),c.key={40:7,38:-7,39:function(){return i()?-1:1},37:function(){return i()?1:-1},go:function(a){var b=c.item.highlight,d=new Date(b.year,b.month,b.date+a);c.set("highlight",d,{interval:a}),this.render()}},a.on("render",function(){a.$root.find("."+b.klass.selectMonth).on("change",function(){var c=this.value;c&&(a.set("highlight",[a.get("view").year,c,a.get("highlight").date]),a.$root.find("."+b.klass.selectMonth).trigger("focus"))}),a.$root.find("."+b.klass.selectYear).on("change",function(){var c=this.value;c&&(a.set("highlight",[c,a.get("view").month,a.get("highlight").date]),a.$root.find("."+b.klass.selectYear).trigger("focus"))})},1).on("open",function(){var d="";c.disabled(c.get("now"))&&(d=":not(."+b.klass.buttonToday+")"),a.$root.find("button"+d+", select").attr("disabled",!1)},1).on("close",function(){a.$root.find("button, select").attr("disabled",!0)},1)}var d=7,e=6,f=a._;c.prototype.set=function(a,b,c){var d=this,e=d.item;return null===b?("clear"==a&&(a="select"),e[a]=b,d):(e["enable"==a?"disable":"flip"==a?"enable":a]=d.queue[a].split(" ").map(function(e){return b=d[e](a,b,c)}).pop(),"select"==a?d.set("highlight",e.select,c):"highlight"==a?d.set("view",e.highlight,c):a.match(/^(flip|min|max|disable|enable)$/)&&(e.select&&d.disabled(e.select)&&d.set("select",e.select,c),e.highlight&&d.disabled(e.highlight)&&d.set("highlight",e.highlight,c)),d)},c.prototype.get=function(a){return this.item[a]},c.prototype.create=function(a,c,d){var e,g=this;return c=void 0===c?a:c,c==-(1/0)||c==1/0?e=c:b.isPlainObject(c)&&f.isInteger(c.pick)?c=c.obj:b.isArray(c)?(c=new Date(c[0],c[1],c[2]),c=f.isDate(c)?c:g.create().obj):c=f.isInteger(c)||f.isDate(c)?g.normalize(new Date(c),d):g.now(a,c,d),{year:e||c.getFullYear(),month:e||c.getMonth(),date:e||c.getDate(),day:e||c.getDay(),obj:e||c,pick:e||c.getTime()}},c.prototype.createRange=function(a,c){var d=this,e=function(a){return a===!0||b.isArray(a)||f.isDate(a)?d.create(a):a};return f.isInteger(a)||(a=e(a)),f.isInteger(c)||(c=e(c)),f.isInteger(a)&&b.isPlainObject(c)?a=[c.year,c.month,c.date+a]:f.isInteger(c)&&b.isPlainObject(a)&&(c=[a.year,a.month,a.date+c]),{from:e(a),to:e(c)}},c.prototype.withinRange=function(a,b){return a=this.createRange(a.from,a.to),b.pick>=a.from.pick&&b.pick<=a.to.pick},c.prototype.overlapRanges=function(a,b){var c=this;return a=c.createRange(a.from,a.to),b=c.createRange(b.from,b.to),c.withinRange(a,b.from)||c.withinRange(a,b.to)||c.withinRange(b,a.from)||c.withinRange(b,a.to)},c.prototype.now=function(a,b,c){return b=new Date,c&&c.rel&&b.setDate(b.getDate()+c.rel),this.normalize(b,c)},c.prototype.navigate=function(a,c,d){var e,f,g,h,i=b.isArray(c),j=b.isPlainObject(c),k=this.item.view;if(i||j){for(j?(f=c.year,g=c.month,h=c.date):(f=+c[0],g=+c[1],h=+c[2]),d&&d.nav&&k&&k.month!==g&&(f=k.year,g=k.month),e=new Date(f,g+(d&&d.nav?d.nav:0),1),f=e.getFullYear(),g=e.getMonth();new Date(f,g,h).getMonth()!==g;)h-=1;c=[f,g,h]}return c},c.prototype.normalize=function(a){return a.setHours(0,0,0,0),a},c.prototype.measure=function(a,b){var c=this;return b?"string"==typeof b?b=c.parse(a,b):f.isInteger(b)&&(b=c.now(a,b,{rel:b})):b="min"==a?-(1/0):1/0,b},c.prototype.viewset=function(a,b){return this.create([b.year,b.month,1])},c.prototype.validate=function(a,c,d){var e,g,h,i,j=this,k=c,l=d&&d.interval?d.interval:1,m=-1===j.item.enable,n=j.item.min,o=j.item.max,p=m&&j.item.disable.filter(function(a){if(b.isArray(a)){var d=j.create(a).pick;d<c.pick?e=!0:d>c.pick&&(g=!0)}return f.isInteger(a)}).length;if((!d||!d.nav&&!d.defaultValue)&&(!m&&j.disabled(c)||m&&j.disabled(c)&&(p||e||g)||!m&&(c.pick<=n.pick||c.pick>=o.pick)))for(m&&!p&&(!g&&l>0||!e&&0>l)&&(l*=-1);j.disabled(c)&&(Math.abs(l)>1&&(c.month<k.month||c.month>k.month)&&(c=k,l=l>0?1:-1),c.pick<=n.pick?(h=!0,l=1,c=j.create([n.year,n.month,n.date+(c.pick===n.pick?0:-1)])):c.pick>=o.pick&&(i=!0,l=-1,c=j.create([o.year,o.month,o.date+(c.pick===o.pick?0:1)])),!h||!i);)c=j.create([c.year,c.month,c.date+l]);return c},c.prototype.disabled=function(a){var c=this,d=c.item.disable.filter(function(d){return f.isInteger(d)?a.day===(c.settings.firstDay?d:d-1)%7:b.isArray(d)||f.isDate(d)?a.pick===c.create(d).pick:b.isPlainObject(d)?c.withinRange(d,a):void 0});return d=d.length&&!d.filter(function(a){return b.isArray(a)&&"inverted"==a[3]||b.isPlainObject(a)&&a.inverted}).length,-1===c.item.enable?!d:d||a.pick<c.item.min.pick||a.pick>c.item.max.pick},c.prototype.parse=function(a,b,c){var d=this,e={};return b&&"string"==typeof b?(c&&c.format||(c=c||{},c.format=d.settings.format),d.formats.toArray(c.format).map(function(a){var c=d.formats[a],g=c?f.trigger(c,d,[b,e]):a.replace(/^!/,"").length;c&&(e[a]=b.substr(0,g)),b=b.substr(g)}),[e.yyyy||e.yy,+(e.mm||e.m)-1,e.dd||e.d]):b},c.prototype.formats=function(){function a(a,b,c){var d=a.match(/[^\x00-\x7F]+|\w+/)[0];return c.mm||c.m||(c.m=b.indexOf(d)+1),d.length}function b(a){return a.match(/\w+/)[0].length}return{d:function(a,b){return a?f.digits(a):b.date},dd:function(a,b){return a?2:f.lead(b.date)},ddd:function(a,c){return a?b(a):this.settings.weekdaysShort[c.day]},dddd:function(a,c){return a?b(a):this.settings.weekdaysFull[c.day]},m:function(a,b){return a?f.digits(a):b.month+1},mm:function(a,b){return a?2:f.lead(b.month+1)},mmm:function(b,c){var d=this.settings.monthsShort;return b?a(b,d,c):d[c.month]},mmmm:function(b,c){var d=this.settings.monthsFull;return b?a(b,d,c):d[c.month]},yy:function(a,b){return a?2:(""+b.year).slice(2)},yyyy:function(a,b){return a?4:b.year},toArray:function(a){return a.split(/(d{1,4}|m{1,4}|y{4}|yy|!.)/g)},toString:function(a,b){var c=this;return c.formats.toArray(a).map(function(a){return f.trigger(c.formats[a],c,[0,b])||a.replace(/^!/,"")}).join("")}}}(),c.prototype.isDateExact=function(a,c){var d=this;return f.isInteger(a)&&f.isInteger(c)||"boolean"==typeof a&&"boolean"==typeof c?a===c:(f.isDate(a)||b.isArray(a))&&(f.isDate(c)||b.isArray(c))?d.create(a).pick===d.create(c).pick:b.isPlainObject(a)&&b.isPlainObject(c)?d.isDateExact(a.from,c.from)&&d.isDateExact(a.to,c.to):!1},c.prototype.isDateOverlap=function(a,c){var d=this,e=d.settings.firstDay?1:0;return f.isInteger(a)&&(f.isDate(c)||b.isArray(c))?(a=a%7+e,a===d.create(c).day+1):f.isInteger(c)&&(f.isDate(a)||b.isArray(a))?(c=c%7+e,c===d.create(a).day+1):b.isPlainObject(a)&&b.isPlainObject(c)?d.overlapRanges(a,c):!1},c.prototype.flipEnable=function(a){var b=this.item;b.enable=a||(-1==b.enable?1:-1)},c.prototype.deactivate=function(a,c){var d=this,e=d.item.disable.slice(0);return"flip"==c?d.flipEnable():c===!1?(d.flipEnable(1),e=[]):c===!0?(d.flipEnable(-1),e=[]):c.map(function(a){for(var c,g=0;g<e.length;g+=1)if(d.isDateExact(a,e[g])){c=!0;break}c||(f.isInteger(a)||f.isDate(a)||b.isArray(a)||b.isPlainObject(a)&&a.from&&a.to)&&e.push(a)}),e},c.prototype.activate=function(a,c){var d=this,e=d.item.disable,g=e.length;return"flip"==c?d.flipEnable():c===!0?(d.flipEnable(1),e=[]):c===!1?(d.flipEnable(-1),e=[]):c.map(function(a){var c,h,i,j;for(i=0;g>i;i+=1){if(h=e[i],d.isDateExact(h,a)){c=e[i]=null,j=!0;break}if(d.isDateOverlap(h,a)){b.isPlainObject(a)?(a.inverted=!0,c=a):b.isArray(a)?(c=a,c[3]||c.push("inverted")):f.isDate(a)&&(c=[a.getFullYear(),a.getMonth(),a.getDate(),"inverted"]);break}}if(c)for(i=0;g>i;i+=1)if(d.isDateExact(e[i],a)){e[i]=null;break}if(j)for(i=0;g>i;i+=1)if(d.isDateOverlap(e[i],a)){e[i]=null;break}c&&e.push(c)}),e.filter(function(a){return null!=a})},c.prototype.nodes=function(a){var b=this,c=b.settings,g=b.item,h=g.now,i=g.select,j=g.highlight,k=g.view,l=g.disable,m=g.min,n=g.max,o=function(a,b){return c.firstDay&&(a.push(a.shift()),b.push(b.shift())),f.node("thead",f.node("tr",f.group({min:0,max:d-1,i:1,node:"th",item:function(d){return[a[d],c.klass.weekdays,'scope=col title="'+b[d]+'"']}})))}((c.showWeekdaysFull?c.weekdaysFull:c.weekdaysShort).slice(0),c.weekdaysFull.slice(0)),p=function(a){return f.node("div"," ",c.klass["nav"+(a?"Next":"Prev")]+(a&&k.year>=n.year&&k.month>=n.month||!a&&k.year<=m.year&&k.month<=m.month?" "+c.klass.navDisabled:""),"data-nav="+(a||-1)+" "+f.ariaAttr({role:"button",controls:b.$node[0].id+"_table"})+' title="'+(a?c.labelMonthNext:c.labelMonthPrev)+'"')},q=function(){var d=c.showMonthsShort?c.monthsShort:c.monthsFull;return c.selectMonths?f.node("select",f.group({min:0,max:11,i:1,node:"option",item:function(a){return[d[a],0,"value="+a+(k.month==a?" selected":"")+(k.year==m.year&&a<m.month||k.year==n.year&&a>n.month?" disabled":"")]}}),c.klass.selectMonth,(a?"":"disabled")+" "+f.ariaAttr({controls:b.$node[0].id+"_table"})+' title="'+c.labelMonthSelect+'"'):f.node("div",d[k.month],c.klass.month)},r=function(){var d=k.year,e=c.selectYears===!0?5:~~(c.selectYears/2);if(e){var g=m.year,h=n.year,i=d-e,j=d+e;if(g>i&&(j+=g-i,i=g),j>h){var l=i-g,o=j-h;i-=l>o?o:l,j=h}return f.node("select",f.group({min:i,max:j,i:1,node:"option",item:function(a){return[a,0,"value="+a+(d==a?" selected":"")]}}),c.klass.selectYear,(a?"":"disabled")+" "+f.ariaAttr({controls:b.$node[0].id+"_table"})+' title="'+c.labelYearSelect+'"')}return f.node("div",d,c.klass.year)};return f.node("div",(c.selectYears?r()+q():q()+r())+p()+p(1),c.klass.header)+f.node("table",o+f.node("tbody",f.group({min:0,max:e-1,i:1,node:"tr",item:function(a){var e=c.firstDay&&0===b.create([k.year,k.month,1]).day?-7:0;return[f.group({min:d*a-k.day+e+1,max:function(){return this.min+d-1},i:1,node:"td",item:function(a){a=b.create([k.year,k.month,a+(c.firstDay?1:0)]);var d=i&&i.pick==a.pick,e=j&&j.pick==a.pick,g=l&&b.disabled(a)||a.pick<m.pick||a.pick>n.pick,o=f.trigger(b.formats.toString,b,[c.format,a]);return[f.node("div",a.date,function(b){return b.push(k.month==a.month?c.klass.infocus:c.klass.outfocus),h.pick==a.pick&&b.push(c.klass.now),d&&b.push(c.klass.selected),e&&b.push(c.klass.highlighted),g&&b.push(c.klass.disabled),b.join(" ")}([c.klass.day]),"data-pick="+a.pick+" "+f.ariaAttr({role:"gridcell",label:o,selected:d&&b.$node.val()===o?!0:null,activedescendant:e?!0:null,disabled:g?!0:null})),"",f.ariaAttr({role:"presentation"})]}})]}})),c.klass.table,'id="'+b.$node[0].id+'_table" '+f.ariaAttr({role:"grid",controls:b.$node[0].id,readonly:!0}))+f.node("div",f.node("button",c.today,c.klass.buttonToday,"type=button data-pick="+h.pick+(a&&!b.disabled(h)?"":" disabled")+" "+f.ariaAttr({controls:b.$node[0].id}))+f.node("button",c.clear,c.klass.buttonClear,"type=button data-clear=1"+(a?"":" disabled")+" "+f.ariaAttr({controls:b.$node[0].id}))+f.node("button",c.close,c.klass.buttonClose,"type=button data-close=true "+(a?"":" disabled")+" "+f.ariaAttr({controls:b.$node[0].id})),c.klass.footer)},c.defaults=function(a){return{labelMonthNext:"Next month",labelMonthPrev:"Previous month",labelMonthSelect:"Select a month",labelYearSelect:"Select a year",monthsFull:["January","February","March","April","May","June","July","August","September","October","November","December"],monthsShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],weekdaysFull:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],weekdaysShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],today:"Today",clear:"Clear",close:"Close",closeOnSelect:!0,closeOnClear:!0,format:"d mmmm, yyyy",klass:{table:a+"table",header:a+"header",navPrev:a+"nav--prev",navNext:a+"nav--next",navDisabled:a+"nav--disabled",month:a+"month",year:a+"year",selectMonth:a+"select--month",selectYear:a+"select--year",weekdays:a+"weekday",day:a+"day",disabled:a+"day--disabled",selected:a+"day--selected",highlighted:a+"day--highlighted",now:a+"day--today",infocus:a+"day--infocus",outfocus:a+"day--outfocus",footer:a+"footer",buttonClear:a+"button--clear",buttonToday:a+"button--today",buttonClose:a+"button--close"}}}(a.klasses().picker+"__"),a.extend("pickadate",c)});
!function(a,b,c,d){function h(b,c){this.element=b,this.$element=a(b),this.init()}var e="textareaAutoSize",f="plugin_"+e,g=function(a){return a.replace(/\s/g,"").length>0};h.prototype={init:function(){var c=parseInt(this.$element.css("paddingBottom"))+parseInt(this.$element.css("paddingTop"))+parseInt(this.$element.css("borderTopWidth"))+parseInt(this.$element.css("borderBottomWidth"))||0;g(this.element.value)&&this.$element.height(this.element.scrollHeight-c),this.$element.on("input keyup",function(d){var e=a(b),f=e.scrollTop();a(this).height(0).height(this.scrollHeight-c),e.scrollTop(f)})}},a.fn[e]=function(b){return this.each(function(){a.data(this,f)||a.data(this,f,new h(this,b))}),this}}(jQuery,window,document);

!function(a,b){"use strict"; true?!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function(){return b.apply(a)}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)):"object"==typeof exports?module.exports=b.call(a):a.Waves=b.call(a)}("object"==typeof global?global:this,function(){"use strict";function e(a){return null!==a&&a===a.window}function f(a){return e(a)?a:9===a.nodeType&&a.defaultView}function g(a){var b=typeof a;return"function"===b||"object"===b&&!!a}function h(a){return g(a)&&a.nodeType>0}function i(a){var d=c.call(a);return"[object String]"===d?b(a):g(a)&&/^\[object (HTMLCollection|NodeList|Object)\]$/.test(d)&&a.hasOwnProperty("length")?a:h(a)?[a]:[]}function j(a){var b,c,d={top:0,left:0},e=a&&a.ownerDocument;return b=e.documentElement,"undefined"!=typeof a.getBoundingClientRect&&(d=a.getBoundingClientRect()),c=f(e),{top:d.top+c.pageYOffset-b.clientTop,left:d.left+c.pageXOffset-b.clientLeft}}function k(a){var b="";for(var c in a)a.hasOwnProperty(c)&&(b+=c+":"+a[c]+";");return b}function n(a,b,c,d){if(c){d.classList.remove("waves-wrapping"),c.classList.remove("waves-rippling");var e=c.getAttribute("data-x"),f=c.getAttribute("data-y"),g=c.getAttribute("data-scale"),h=c.getAttribute("data-translate"),i=Date.now()-Number(c.getAttribute("data-hold")),j=350-i;0>j&&(j=0),"mousemove"===a.type&&(j=150);var m="mousemove"===a.type?2500:l.duration;setTimeout(function(){var a={top:f+"px",left:e+"px",opacity:"0","-webkit-transition-duration":m+"ms","-moz-transition-duration":m+"ms","-o-transition-duration":m+"ms","transition-duration":m+"ms","-webkit-transform":g+" "+h,"-moz-transform":g+" "+h,"-ms-transform":g+" "+h,"-o-transform":g+" "+h,transform:g+" "+h};c.setAttribute("style",k(a)),setTimeout(function(){try{d.removeChild(c),b.removeChild(d)}catch(a){return!1}},m)},j)}}function p(a){if(o.allowEvent(a)===!1)return null;for(var b=null,c=a.target||a.srcElement;null!==c.parentElement;){if(c.classList.contains("waves-effect")&&!(c instanceof SVGElement)){b=c;break}c=c.parentElement}return b}function q(a){var b=p(a);if(null!==b){if(b.disabled||b.getAttribute("disabled")||b.classList.contains("disabled"))return;if(o.registerEvent(a),"touchstart"===a.type&&l.delay){var c=!1,e=setTimeout(function(){e=null,l.show(a,b)},l.delay),f=function(d){e&&(clearTimeout(e),e=null,l.show(a,b)),c||(c=!0,l.hide(d,b))},g=function(a){e&&(clearTimeout(e),e=null),f(a)};b.addEventListener("touchmove",g,!1),b.addEventListener("touchend",f,!1),b.addEventListener("touchcancel",f,!1)}else l.show(a,b),d&&(b.addEventListener("touchend",l.hide,!1),b.addEventListener("touchcancel",l.hide,!1)),b.addEventListener("mouseup",l.hide,!1),b.addEventListener("mouseleave",l.hide,!1)}}var a=a||{},b=document.querySelectorAll.bind(document),c=Object.prototype.toString,d="ontouchstart"in window,l={duration:750,delay:200,show:function(a,b,c){if(2===a.button)return!1;b=b||this;var d=document.createElement("div");d.className="waves-wrap waves-wrapping",b.appendChild(d);var e=document.createElement("div");e.className="waves-ripple waves-rippling",d.appendChild(e);var f=j(b),g=0,h=0;"touches"in a&&a.touches.length?(g=a.touches[0].pageY-f.top,h=a.touches[0].pageX-f.left):(g=a.pageY-f.top,h=a.pageX-f.left),h=h>=0?h:0,g=g>=0?g:0;var i="scale("+b.clientWidth/100*3+")",m="translate(0,0)";c&&(m="translate("+c.x+"px, "+c.y+"px)"),e.setAttribute("data-hold",Date.now()),e.setAttribute("data-x",h),e.setAttribute("data-y",g),e.setAttribute("data-scale",i),e.setAttribute("data-translate",m);var n={top:g+"px",left:h+"px"};e.classList.add("waves-notransition"),e.setAttribute("style",k(n)),e.classList.remove("waves-notransition"),n["-webkit-transform"]=i+" "+m,n["-moz-transform"]=i+" "+m,n["-ms-transform"]=i+" "+m,n["-o-transform"]=i+" "+m,n.transform=i+" "+m,n.opacity="1";var o="mousemove"===a.type?2500:l.duration;n["-webkit-transition-duration"]=o+"ms",n["-moz-transition-duration"]=o+"ms",n["-o-transition-duration"]=o+"ms",n["transition-duration"]=o+"ms",e.setAttribute("style",k(n))},hide:function(a,b){b=b||this;for(var c=b.getElementsByClassName("waves-wrapping"),d=b.getElementsByClassName("waves-rippling"),e=0,f=d.length;f>e;e++)n(a,b,d[e],c[e])}},m={input:function(a){var b=a.parentNode;if("i"!==b.tagName.toLowerCase()||!b.classList.contains("waves-effect")){var c=document.createElement("i");c.className=a.className+" waves-input-wrapper",a.className="waves-button-input",b.replaceChild(c,a),c.appendChild(a);var d=window.getComputedStyle(a,null),e=d.color,f=d.backgroundColor;c.setAttribute("style","color:"+e+";background:"+f),a.setAttribute("style","background-color:rgba(0,0,0,0);")}},img:function(a){var b=a.parentNode;if("i"!==b.tagName.toLowerCase()||!b.classList.contains("waves-effect")){var c=document.createElement("i");b.replaceChild(c,a),c.appendChild(a)}}},o={touches:0,allowEvent:function(a){var b=!0;return/^(mousedown|mousemove)$/.test(a.type)&&o.touches&&(b=!1),b},registerEvent:function(a){var b=a.type;"touchstart"===b?o.touches+=1:/^(touchend|touchcancel)$/.test(b)&&setTimeout(function(){o.touches&&(o.touches-=1)},500)}};return a.init=function(a){var b=document.body;a=a||{},"duration"in a&&(l.duration=a.duration),"delay"in a&&(l.delay=a.delay),d&&(b.addEventListener("touchstart",q,!1),b.addEventListener("touchcancel",o.registerEvent,!1),b.addEventListener("touchend",o.registerEvent,!1)),b.addEventListener("mousedown",q,!1)},a.attach=function(a,b){a=i(a),"[object Array]"===c.call(b)&&(b=b.join(" ")),b=b?" "+b:"";for(var d,e,f=0,g=a.length;g>f;f++)d=a[f],e=d.tagName.toLowerCase(),-1!==["input","img"].indexOf(e)&&(m[e](d),d=d.parentElement),-1===d.className.indexOf("waves-effect")&&(d.className+=" waves-effect"+b)},a.ripple=function(a,b){a=i(a);var c=a.length;if(b=b||{},b.wait=b.wait||0,b.position=b.position||null,c)for(var d,e,f,g={},h=0,k={type:"mousedown",button:1},m=function(a,b){return function(){l.hide(a,b)}};c>h;h++)if(d=a[h],e=b.position||{x:d.clientWidth/2,y:d.clientHeight/2},f=j(d),g.x=f.left+e.x,g.y=f.top+e.y,k.pageX=g.x,k.pageY=g.y,l.show(k,d),b.wait>=0&&null!==b.wait){var n={type:"mouseup",button:1};setTimeout(m(n,d),b.wait)}},a.calm=function(a){a=i(a);for(var b={type:"mouseup",button:1},c=0,d=a.length;d>c;c++)l.hide(b,a[c])},a.displayEffect=function(b){console.error("Waves.displayEffect() has been deprecated and will be removed in future version. Please use Waves.init() to initialize Waves effect"),a.init(b)},a});

+function ($) {

  'use strict'

  var Datepicker = function (element, options) {
    this._element = element
    this._options = options
  }

  if (typeof $.fn.pickadate === 'undefined') {
    throw new Error('Material\'s JavaScript requires pickadate.js')
  }

  Datepicker.DEFAULTS = {
    cancel        : 'Cancel',
    closeOnCancel : true,
    closeOnSelect : false,
    container     : 'body',
    disable       : [],
    firstDay      : 0,
    format        : 'd/m/yyyy',
    formatSubmit  : '',
    klass         : {
      // button
      buttonClear : 'btn btn-outline-primary picker-button-clear',
      buttonClose : 'btn btn-outline-primary picker-button-close',
      buttonToday : 'btn btn-outline-primary picker-button-today',

      // day
      day         : 'picker-day',
      disabled    : 'picker-day-disabled',
      highlighted : 'picker-day-highlighted',
      infocus     : 'picker-day-infocus',
      now         : 'picker-day-today',
      outfocus    : 'picker-day-outfocus',
      selected    : 'picker-day-selected',
      weekdays    : 'picker-weekday',

      // element
      box         : 'picker-box',
      footer      : 'picker-footer',
      frame       : 'picker-frame',
      header      : 'picker-header',
      holder      : 'picker-holder',
      table       : 'picker-table',
      wrap        : 'picker-wrap',

      // input element
      active      : 'picker-input-active',
      input       : 'picker-input',

      // month and year nav
      month       : 'picker-month',
      navDisabled : 'picker-nav-disabled',
      navNext     : 'material-icons picker-nav-next',
      navPrev     : 'material-icons picker-nav-prev',
      selectMonth : 'picker-select-month',
      selectYear  : 'picker-select-year',
      year        : 'picker-year',

      // root picker
      focused     : 'picker-focused',
      opened      : 'picker-opened',
      picker      : 'picker'
    },
    max           : false,
    min           : false,
    monthsFull    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthsShort   : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    ok            : 'OK',
    onClose       : false,
    onOpen        : false,
    onRender      : false,
    onSet         : false,
    onStart       : false,
    onStop        : false,
    selectMonths  : false,
    selectYears   : false,
    today         : '',
    weekdaysFull  : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    weekdaysShort : ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  }

  Datepicker.prototype.display = function (datepickerApi, datepickerRoot, datepickerValue) {
    $('.picker-date-display', datepickerRoot).remove()

    $('.picker-wrap', datepickerRoot).prepend('<div class="picker-date-display">' +
      '<div class="picker-date-display-top">' +
        '<span class="picker-year-display">' + datepickerApi.get(datepickerValue, 'yyyy') + '</span>' +
      '</div>' +
      '<div class="picker-date-display-bottom">' +
        '<span class="picker-weekday-display">' + datepickerApi.get(datepickerValue, 'dddd') + '</span>' +
        '<span class="picker-day-display">' + datepickerApi.get(datepickerValue, 'd') + '</span>' +
        '<span class="picker-month-display">' + datepickerApi.get(datepickerValue, 'mmm') + '</span>' +
      '</div>' +
    '</div>')
  }

  Datepicker.prototype.show = function () {
    var that = this

    $(this._element).pickadate({
      clear         : that._options.cancel,
      close         : that._options.ok,
      closeOnClear  : that._options.closeOnCancel,
      closeOnSelect : that._options.closeOnSelect,
      container     : that._options.container,
      disable       : that._options.disable,
      firstDay      : that._options.firstDay,
      format        : that._options.format,
      formatSubmit  : that._options.formatSubmit,
      klass         : that._options.klass,
      max           : that._options.max,
      min           : that._options.min,
      monthsFull    : that._options.monthsFull,
      monthsShort   : that._options.monthsShort,
      onClose       : that._options.onClose,
      onOpen        : that._options.onOpen,
      onRender      : that._options.onRender,
      onSet         : that._options.onSet,
      onStart       : that._options.onStart,
      onStop        : that._options.onStop,
      selectMonths  : that._options.selectMonths,
      selectYears   : that._options.selectYears,
      today         : that._options.today,
      weekdaysFull  : that._options.weekdaysFull,
      weekdaysShort : that._options.weekdaysShort
    })

    var datepickerApi  = $(this._element).pickadate('picker'),
        datepickerNode = datepickerApi.$node,
        datepickerRoot = datepickerApi.$root

    datepickerApi.on({
      close: function () {
        $(document.activeElement).blur()
      },
      open: function () {
        if (!$('.picker__date-display', datepickerRoot).length) {
          that.display(datepickerApi, datepickerRoot, 'highlight')
        }
      },
      set: function () {
        if (datepickerApi.get('select') !== null) {
          that.display(datepickerApi, datepickerRoot, 'select')
        }
      }
    })
  }

  function Plugin (option) {
    return this.each(function () {
      var data    = $(this).data('bs.pickdate')
      var options = $.extend({}, Datepicker.DEFAULTS, $(this).data(), typeof option == 'object' && option)

      if (!data) {
        $(this).data('bs.pickdate', (data = new Datepicker(this, options)))
      }

      data.show()
    })
  }

  var old = $.fn.pickdate

  $.fn.pickdate             = Plugin
  $.fn.pickdate.Constructor = Datepicker

  $.fn.pickdate.noConflict = function () {
    $.fn.pickdate = old
    return this
  }

}(jQuery)

$(function () {
  if ($('.textarea-autosize').length && (typeof $.fn.textareaAutoSize !== 'undefined')) {
    $('.textarea-autosize').textareaAutoSize()
  }
})

$(function () {
  if ($('.waves-attach').length && (typeof Waves !== 'undefined')) {
    Waves.attach('.waves-attach')
    Waves.init({
      duration: 300
    })
  }
})

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

+function () {
  /*
   * floating label:
   * when a user engages with the text input field,
   * the floating inline labels move to float above the field
   */

  var FloatingLabel = function ($) {

    // constants >>>
    var DATA_KEY = 'md.floatinglabel';
    var EVENT_KEY = '.' + DATA_KEY;
    var NAME = 'floatinglabel';
    var NO_CONFLICT = $.fn[NAME];

    var ClassName = {
      IS_FOCUSED: 'is-focused',
      HAS_VALUE: 'has-value'
    };

    var Event = {
      CHANGE: 'change' + EVENT_KEY,
      FOCUSIN: 'focusin' + EVENT_KEY,
      FOCUSOUT: 'focusout' + EVENT_KEY
    };

    var Selector = {
      DATA_PARENT: '.floating-label',
      DATA_TOGGLE: '.floating-label .form-control'
    };
    // <<< constants

    var FloatingLabel = function () {
      function FloatingLabel(element) {
        _classCallCheck(this, FloatingLabel);

        this._element = element;
      }

      FloatingLabel.prototype.change = function change(relatedTarget) {
        if ($(this._element).val() || $(this._element).is('select') && $('option:first-child', $(this._element)).html().replace(' ', '') !== '') {
          $(relatedTarget).addClass(ClassName.HAS_VALUE);
        } else {
          $(relatedTarget).removeClass(ClassName.HAS_VALUE);
        }
      };

      FloatingLabel.prototype.focusin = function focusin(relatedTarget) {
        $(relatedTarget).addClass(ClassName.IS_FOCUSED);
      };

      FloatingLabel.prototype.focusout = function focusout(relatedTarget) {
        $(relatedTarget).removeClass(ClassName.IS_FOCUSED);
      };

      FloatingLabel._jQueryInterface = function _jQueryInterface(event) {
        return this.each(function () {
          var _event = event ? event : 'change';
          var data = $(this).data(DATA_KEY);

          if (!data) {
            data = new FloatingLabel(this);
            $(this).data(DATA_KEY, data);
          }

          if (typeof _event === 'string') {
            if (data[_event] === undefined) {
              throw new Error('No method named "' + _event + '"');
            }

            data[_event]($(this).closest(Selector.DATA_PARENT));
          }
        });
      };

      return FloatingLabel;
    }();

    $(document).on(Event.CHANGE + ' ' + Event.FOCUSIN + ' ' + Event.FOCUSOUT, Selector.DATA_TOGGLE, function (event) {
      FloatingLabel._jQueryInterface.call($(this), event.type);
    });

    $.fn[NAME] = FloatingLabel._jQueryInterface;
    $.fn[NAME].Constructor = FloatingLabel;
    $.fn[NAME].noConflict = function () {
      $.fn[NAME] = NO_CONFLICT;
      return FloatingLabel._jQueryInterface;
    };

    return FloatingLabel;
  }(jQuery);

  /*
   * navigation drawer
   * based on bootstrap's (v4.0.0-beta) modal.js
   */

  var NavDrawer = function ($) {

    // constants >>>
    var DATA_API_KEY = '.data-api';
    var DATA_KEY = 'md.navdrawer';
    var ESCAPE_KEYCODE = 27;
    var EVENT_KEY = '.' + DATA_KEY;
    var NAME = 'navdrawer';
    var NO_CONFLICT = $.fn[NAME];
    var TRANSITION_DURATION = 292.5;
    var TRANSITION_DURATION_BACKDROP = 487.5;

    var ClassName = {
      BACKDROP: 'navdrawer-backdrop',
      OPEN: 'navdrawer-open',
      SHOW: 'show'
    };

    var Default = {
      breakpoint: 1280,
      keyboard: true,
      show: true,
      type: 'default'
    };

    var DefaultType = {
      keyboard: 'boolean',
      show: 'boolean',
      type: 'string'
    };

    var Event = {
      CLICK_DATA_API: 'click' + EVENT_KEY + DATA_API_KEY,
      CLICK_DISMISS: 'click.dismiss' + EVENT_KEY,
      FOCUSIN: 'focusin' + EVENT_KEY,
      HIDDEN: 'hidden' + EVENT_KEY,
      HIDE: 'hide' + EVENT_KEY,
      KEYDOWN_DISMISS: 'keydown.dismiss' + EVENT_KEY,
      MOUSEDOWN_DISMISS: 'mousedown.dismiss' + EVENT_KEY,
      MOUSEUP_DISMISS: 'mouseup.dismiss' + EVENT_KEY,
      SHOW: 'show' + EVENT_KEY,
      SHOWN: 'shown' + EVENT_KEY
    };

    var Selector = {
      CONTENT: '.navdrawer-content',
      DATA_DISMISS: '[data-dismiss="navdrawer"]',
      DATA_TOGGLE: '[data-toggle="navdrawer"]'
    };
    // <<< constants

    var NavDrawer = function () {
      function NavDrawer(element, config) {
        _classCallCheck(this, NavDrawer);

        this._backdrop = null;
        this._config = this._getConfig(config);
        this._content = $(element).find(Selector.CONTENT)[0];
        this._element = element;
        this._ignoreBackdropClick = false;
        this._isShown = false;
      }

      NavDrawer.prototype.hide = function hide(event) {
        if (event) {
          event.preventDefault();
        }

        var hideClassName = ClassName.OPEN + '-' + this._config.type;
        var hideEvent = $.Event(Event.HIDE);

        $(this._element).trigger(hideEvent);

        if (!this._isShown || hideEvent.isDefaultPrevented()) {
          return;
        }

        this._isShown = false;
        this._setEscapeEvent();
        $(document).off(Event.FOCUSIN);
        $(this._content).off(Event.MOUSEDOWN_DISMISS);

        $(this._element).off(Event.CLICK_DISMISS).removeClass(ClassName.SHOW);

        this._hideNavdrawer(hideClassName);
      };

      NavDrawer.prototype.show = function show(relatedTarget) {
        var _this = this;

        var showEvent = $.Event(Event.SHOW, {
          relatedTarget: relatedTarget
        });

        $(this._element).trigger(showEvent);

        if (this._isShown || showEvent.isDefaultPrevented()) {
          return;
        }

        this._isShown = true;
        $(document.body).addClass(ClassName.OPEN + '-' + this._config.type);
        this._setEscapeEvent();
        $(this._element).addClass(NAME + '-' + this._config.type);
        $(this._element).on(Event.CLICK_DISMISS, Selector.DATA_DISMISS, $.proxy(this.hide, this));

        $(this._content).on(Event.MOUSEDOWN_DISMISS, function () {
          $(_this._element).one(Event.MOUSEUP_DISMISS, function (event) {
            if ($(event.target).is(_this._element)) {
              _this._ignoreBackdropClick = true;
            }
          });
        });

        this._showBackdrop();
        this._showElement(relatedTarget);
      };

      NavDrawer.prototype.toggle = function toggle(relatedTarget) {
        return this._isShown ? this.hide() : this.show(relatedTarget);
      };

      NavDrawer.prototype._enforceFocus = function _enforceFocus() {
        var _this2 = this;

        $(document).off(Event.FOCUSIN).on(Event.FOCUSIN, function (event) {
          if (_this2._config.type === 'default' || $(window).width() <= _this2._config.breakpoint) {
            if (_this2._element !== event.target && !$(_this2._element).has(event.target).length) {
              _this2._element.focus();
            }
          }
        });
      };

      NavDrawer.prototype._getConfig = function _getConfig(config) {
        config = $.extend({}, Default, config);
        Util.typeCheckConfig(NAME, config, DefaultType);
        return config;
      };

      NavDrawer.prototype._hideNavdrawer = function _hideNavdrawer(className) {
        var _this3 = this;

        this._showBackdrop(function () {
          $(document.body).removeClass(className);

          _this3._element.setAttribute('aria-hidden', 'true');
          _this3._element.style.display = 'none';

          $(_this3._element).trigger(Event.HIDDEN);
        });
      };

      NavDrawer.prototype._removeBackdrop = function _removeBackdrop() {
        if (this._backdrop) {
          $(this._backdrop).remove();
          this._backdrop = null;
        }
      };

      NavDrawer.prototype._setEscapeEvent = function _setEscapeEvent() {
        var _this4 = this;

        if (this._isShown && this._config.keyboard) {
          $(this._element).on(Event.KEYDOWN_DISMISS, function (event) {
            if (event.which === ESCAPE_KEYCODE) {
              _this4.hide();
            }
          });
        } else if (!this._isShown) {
          $(this._element).off(Event.KEYDOWN_DISMISS);
        }
      };

      NavDrawer.prototype._showBackdrop = function _showBackdrop(callback) {
        var _this5 = this;

        var supportsTransition = Util.supportsTransitionEnd();

        if (this._isShown) {
          this._backdrop = document.createElement('div');

          $(this._backdrop).addClass(ClassName.BACKDROP).addClass(ClassName.BACKDROP + '-' + this._config.type).appendTo(document.body);

          $(this._element).on(Event.CLICK_DISMISS, function (event) {
            if (_this5._ignoreBackdropClick) {
              _this5._ignoreBackdropClick = false;
              return;
            }

            if (event.target !== event.currentTarget) {
              return;
            }

            _this5.hide();
          });

          if (supportsTransition) {
            Util.reflow(this._backdrop);
          }

          $(this._backdrop).addClass(ClassName.SHOW);

          if (!callback) {
            return;
          }

          if (!supportsTransition) {
            callback();
            return;
          }

          $(this._backdrop).one(Util.TRANSITION_END, callback).emulateTransitionEnd(TRANSITION_DURATION_BACKDROP);
        } else if (this._backdrop && !this._isShown) {
          $(this._backdrop).removeClass(ClassName.SHOW);

          var callbackRemove = function callbackRemove() {
            _this5._removeBackdrop();

            if (callback) {
              callback();
            }
          };

          if (supportsTransition) {
            $(this._backdrop).one(Util.TRANSITION_END, callbackRemove).emulateTransitionEnd(TRANSITION_DURATION_BACKDROP);
          } else {
            callbackRemove();
          }
        } else if (callback) {
          callback();
        }
      };

      NavDrawer.prototype._showElement = function _showElement(relatedTarget) {
        var _this6 = this;

        var supportsTransition = Util.supportsTransitionEnd();

        if (!this._element.parentNode || this._element.parentNode.nodeType !== Node.ELEMENT_NODE) {
          document.body.appendChild(this._element);
        }

        this._element.removeAttribute('aria-hidden');
        this._element.style.display = 'block';

        if (supportsTransition) {
          Util.reflow(this._element);
        }

        $(this._element).addClass(ClassName.SHOW);
        this._enforceFocus();

        var shownEvent = $.Event(Event.SHOWN, {
          relatedTarget: relatedTarget
        });

        var transitionComplete = function transitionComplete() {
          _this6._element.focus();
          $(_this6._element).trigger(shownEvent);
        };

        if (supportsTransition) {
          $(this._content).one(Util.TRANSITION_END, transitionComplete).emulateTransitionEnd(TRANSITION_DURATION);
        } else {
          transitionComplete();
        }
      };

      NavDrawer._jQueryInterface = function _jQueryInterface(config, relatedTarget) {
        return this.each(function () {
          var _config = $.extend({}, NavDrawer.Default, $(this).data(), (typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object' && config);

          var data = $(this).data(DATA_KEY);

          if (!data) {
            data = new NavDrawer(this, _config);
            $(this).data(DATA_KEY, data);
          }

          if (typeof config === 'string') {
            if (data[config] === undefined) {
              throw new Error('No method named "' + config + '"');
            }

            data[config](relatedTarget);
          } else if (_config.show) {
            data.show(relatedTarget);
          }
        });
      };

      _createClass(NavDrawer, null, [{
        key: 'Default',
        get: function get() {
          return Default;
        }
      }]);

      return NavDrawer;
    }();

    $(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
      var _this7 = this;

      var selector = Util.getSelectorFromElement(this);
      var target = void 0;

      if (selector) {
        target = $(selector)[0];
      }

      var config = $(target).data(DATA_KEY) ? 'toggle' : $.extend({}, $(target).data(), $(this).data());

      if (this.tagName === 'A') {
        event.preventDefault();
      }

      var $target = $(target).one(Event.SHOW, function (showEvent) {
        if (showEvent.isDefaultPrevented()) {
          return;
        }

        $target.one(Event.HIDDEN, function () {
          if ($(_this7).is(':visible')) {
            _this7.focus();
          }
        });
      });

      NavDrawer._jQueryInterface.call($(target), config, this);
    });

    $.fn[NAME] = NavDrawer._jQueryInterface;
    $.fn[NAME].Constructor = NavDrawer;
    $.fn[NAME].noConflict = function () {
      $.fn[NAME] = NO_CONFLICT;
      return NavDrawer._jQueryInterface;
    };

    return NavDrawer;
  }(jQuery);

  /*
   * selection control focus:
   * chrome persists the focus style on checkboxes/radio buttons
   * after clicking with the mouse
   */

  var ControlFocus = function ($) {

    // constants >>>
    var DATA_KEY = 'md.controlfocus';
    var EVENT_KEY = '.' + DATA_KEY;

    var ClassName = {
      FOCUS: 'focus'
    };

    var LastInteraction = {
      IS_MOUSEDOWN: false
    };

    var Event = {
      BLUR: 'blur' + EVENT_KEY,
      FOCUS: 'focus' + EVENT_KEY,
      MOUSEDOWN: 'mousedown' + EVENT_KEY,
      MOUSEUP: 'mouseup' + EVENT_KEY
    };

    var Selector = {
      CONTROL: '.custom-control',
      INPUT: '.custom-control-input'
    };
    // <<< constants

    $(document).on('' + Event.BLUR, Selector.INPUT, function (event) {
      $(event.target).removeClass(ClassName.FOCUS);
    }).on('' + Event.FOCUS, Selector.INPUT, function (event) {
      if (LastInteraction.IS_MOUSEDOWN === false) {
        $(event.target).addClass(ClassName.FOCUS);
      }
    }).on('' + Event.MOUSEDOWN, Selector.CONTROL, function () {
      LastInteraction.IS_MOUSEDOWN = true;
    }).on('' + Event.MOUSEUP, Selector.CONTROL, function () {
      setTimeout(function () {
        LastInteraction.IS_MOUSEDOWN = false;
      }, 1);
    });
  }(jQuery);

  /*
   * tab indicator animation
   * requires bootstrap's (v4.0.0-beta) tab.js
   */

  var TabSwitch = function ($) {

    // constants >>>
    var DATA_KEY = 'md.tabswitch';
    var NAME = 'tabswitch';
    var NO_CONFLICT = $.fn[NAME];
    var TRANSITION_DURATION = 390;

    var ClassName = {
      ANIMATE: 'animate',
      DROPDOWN_ITEM: 'dropdown-item',
      INDICATOR: 'nav-tabs-indicator',
      MATERIAL: 'nav-tabs-material',
      SCROLLABLE: 'nav-tabs-scrollable',
      SHOW: 'show'
    };

    var Event = {
      SHOW_BS_TAB: 'show.bs.tab'
    };

    var Selector = {
      DATA_TOGGLE: '.nav-tabs [data-toggle="tab"]',
      DROPDOWN: '.dropdown',
      NAV: '.nav-tabs'
    };
    // <<< constants

    var TabSwitch = function () {
      function TabSwitch(nav) {
        _classCallCheck(this, TabSwitch);

        if (typeof $.fn.tab === 'undefined') {
          throw new Error('Material\'s JavaScript requires Bootstrap\'s tab.js');
        }

        this._nav = nav;
        this._navindicator = null;
      }

      TabSwitch.prototype.switch = function _switch(element, relatedTarget) {
        var _this8 = this;

        var navLeft = $(this._nav).offset().left;
        var navScrollLeft = $(this._nav).scrollLeft();
        var navWidth = $(this._nav).outerWidth();
        var supportsTransition = Util.supportsTransitionEnd();

        if (!this._navindicator) {
          this._createIndicator(navLeft, navScrollLeft, navWidth, relatedTarget);
        }

        if ($(element).hasClass(ClassName.DROPDOWN_ITEM)) {
          element = $(element).closest(Selector.DROPDOWN);
        }

        var elLeft = $(element).offset().left;
        var elWidth = $(element).outerWidth();

        $(this._navindicator).addClass(ClassName.SHOW);
        Util.reflow(this._navindicator);

        if (supportsTransition) {
          $(this._nav).addClass(ClassName.ANIMATE);
        }

        $(this._navindicator).css({
          left: elLeft + navScrollLeft - navLeft,
          right: navWidth - (elLeft + navScrollLeft - navLeft + elWidth)
        });

        var complete = function complete() {
          $(_this8._nav).removeClass(ClassName.ANIMATE);
          $(_this8._navindicator).removeClass(ClassName.SHOW);
        };

        if (!supportsTransition) {
          complete();
          return;
        }

        $(this._navindicator).one(Util.TRANSITION_END, complete).emulateTransitionEnd(TRANSITION_DURATION);
      };

      TabSwitch.prototype._createIndicator = function _createIndicator(navLeft, navScrollLeft, navWidth, relatedTarget) {
        this._navindicator = document.createElement('div');

        $(this._navindicator).addClass(ClassName.INDICATOR).appendTo(this._nav);

        if (relatedTarget !== undefined) {
          if ($(relatedTarget).hasClass(ClassName.DROPDOWN_ITEM)) {
            relatedTarget = $(relatedTarget).closest(Selector.DROPDOWN);
          }

          var relatedLeft = $(relatedTarget).offset().left;
          var relatedWidth = $(relatedTarget).outerWidth();

          $(this._navindicator).css({
            left: relatedLeft + navScrollLeft - navLeft,
            right: navWidth - (relatedLeft + navScrollLeft - navLeft + relatedWidth)
          });
        }

        $(this._nav).addClass(ClassName.MATERIAL);
      };

      TabSwitch._jQueryInterface = function _jQueryInterface(relatedTarget) {
        return this.each(function () {
          var nav = $(this).closest(Selector.NAV)[0];

          if (!nav) {
            return;
          }

          var data = $(nav).data(DATA_KEY);

          if (!data) {
            data = new TabSwitch(nav);
            $(nav).data(DATA_KEY, data);
          }

          data.switch(this, relatedTarget);
        });
      };

      return TabSwitch;
    }();

    $(document).on(Event.SHOW_BS_TAB, Selector.DATA_TOGGLE, function (event) {
      TabSwitch._jQueryInterface.call($(event.target), event.relatedTarget);
    });

    $.fn[NAME] = TabSwitch._jQueryInterface;
    $.fn[NAME].Constructor = TabSwitch;
    $.fn[NAME].noConflict = function () {
      $.fn[NAME] = NO_CONFLICT;
      return TabSwitch._jQueryInterface;
    };

    return TabSwitch;
  }(jQuery);

  /*
   * global util js
   * based on bootstrap's (v4.0.0-beta) util.js
   */

  var Util = function ($) {

    var MAX_UID = 1000000;
    var transition = false;

    var TransitionEndEvent = {
      WebkitTransition: 'webkitTransitionEnd',
      MozTransition: 'transitionend',
      OTransition: 'oTransitionEnd otransitionend',
      transition: 'transitionend'
    };

    function getSpecialTransitionEndEvent() {
      return {
        bindType: transition.end,
        delegateType: transition.end,
        handle: function handle(event) {
          if ($(event.target).is(this)) {
            // eslint-disable-next-line prefer-rest-params
            return event.handleObj.handler.apply(this, arguments);
          }
          return undefined;
        }
      };
    }

    function isElement(obj) {
      return (obj[0] || obj).nodeType;
    }

    function setTransitionEndSupport() {
      transition = transitionEndTest();

      $.fn.emulateTransitionEnd = transitionEndEmulator;

      if (Util.supportsTransitionEnd()) {
        $.event.special[Util.TRANSITION_END] = getSpecialTransitionEndEvent();
      }
    }

    function toType(obj) {
      return {}.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    }

    function transitionEndEmulator(duration) {
      var _this9 = this;

      var called = false;

      $(this).one(Util.TRANSITION_END, function () {
        called = true;
      });

      setTimeout(function () {
        if (!called) {
          Util.triggerTransitionEnd(_this9);
        }
      }, duration);

      return this;
    }

    function transitionEndTest() {
      if (window.QUnit) {
        return false;
      }

      var el = document.createElement('material');

      for (var name in TransitionEndEvent) {
        if (el.style[name] !== undefined) {
          return {
            end: TransitionEndEvent[name]
          };
        }
      }

      return false;
    }

    var Util = {
      TRANSITION_END: 'mdTransitionEnd',

      getSelectorFromElement: function getSelectorFromElement(element) {
        var selector = element.getAttribute('data-target');

        if (!selector) {
          selector = element.getAttribute('href') || '';
          selector = /^#[a-z]/i.test(selector) ? selector : null;
        }

        return selector;
      },
      getUID: function getUID(prefix) {
        do {
          // eslint-disable-next-line no-bitwise
          prefix += ~~(Math.random() * MAX_UID);
        } while (document.getElementById(prefix));
        return prefix;
      },
      reflow: function reflow(element) {
        new Function('md', 'return md')(element.offsetHeight);
      },
      supportsTransitionEnd: function supportsTransitionEnd() {
        return Boolean(transition);
      },
      triggerTransitionEnd: function triggerTransitionEnd(element) {
        $(element).trigger(transition.end);
      },
      typeCheckConfig: function typeCheckConfig(componentName, config, configTypes) {
        for (var property in configTypes) {
          if (configTypes.hasOwnProperty(property)) {
            var expectedTypes = configTypes[property];
            var value = config[property];
            var valueType = value && isElement(value) ? 'element' : toType(value);

            if (!new RegExp(expectedTypes).test(valueType)) {
              throw new Error(componentName.toUpperCase() + ': ' + ('Option "' + property + '" provided type "' + valueType + '" ') + ('but expected type "' + expectedTypes + '".'));
            }
          }
        }
      }
    };

    setTransitionEndSupport();

    return Util;
  }(jQuery);
}();

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(21)))

/***/ }),
/* 21 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(23);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(25)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js??ref--2-1!../../node_modules/resolve-url-loader/index.js!../../node_modules/sass-loader/lib/loader.js!./index.scss", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js??ref--2-1!../../node_modules/resolve-url-loader/index.js!../../node_modules/sass-loader/lib/loader.js!./index.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(24)(undefined);
// imports


// module
exports.push([module.i, "*,\n*::after,\n*::before {\n  box-sizing: inherit;\n}\n\n@-ms-viewport {\n  width: device-width;\n}\n\narticle,\naside,\ndialog,\nfigcaption,\nfigure,\nfooter,\nheader,\nhgroup,\nmain,\nnav,\nsection {\n  display: block;\n}\n\nbody {\n  text-align: left;\n  text-align: start;\n  background-color: white;\n  color: rgba(0, 0, 0, 0.87);\n  font-family: Roboto, -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif;\n  font-size: 1rem;\n  font-weight: 400;\n  line-height: 1.42857;\n  margin: 0;\n}\n\n[dir='rtl'] body {\n  text-align: right;\n  text-align: start;\n}\n\nhtml {\n  box-sizing: border-box;\n  font-family: sans-serif;\n  line-height: 1.15;\n  text-size-adjust: 100%;\n  -ms-overflow-style: scrollbar;\n  -webkit-tap-highlight-color: transparent;\n}\n\n[tabindex='-1']:focus {\n  outline: 0 !important;\n}\n\na,\narea,\nbutton,\ninput,\nlabel,\nselect,\nsummary,\ntextarea,\n[role=\"button\"] {\n  touch-action: manipulation;\n}\n\ncode,\nkbd,\npre,\nsamp {\n  font-family: monospace, monospace;\n  font-size: 1em;\n}\n\npre {\n  margin-top: 0;\n  margin-bottom: 1rem;\n  overflow: auto;\n}\n\nfigure {\n  margin: 0 0 1rem;\n}\n\nhr {\n  box-sizing: content-box;\n  height: 0;\n  overflow: visible;\n}\n\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  font-family: inherit;\n  font-size: inherit;\n  line-height: inherit;\n  margin: 0;\n}\n\nbutton,\nhtml [type=\"button\"],\n[type=\"reset\"],\n[type=\"submit\"] {\n  -webkit-appearance: button;\n}\n\nbutton::-moz-focus-inner,\n[type=\"button\"]::-moz-focus-inner,\n[type=\"reset\"]::-moz-focus-inner,\n[type=\"submit\"]::-moz-focus-inner {\n  border-style: none;\n  padding: 0;\n}\n\nbutton,\ninput {\n  overflow: visible;\n}\n\nbutton,\nselect {\n  text-transform: none;\n}\n\nbutton:focus {\n  outline: 1px dotted;\n  outline: 5px auto -webkit-focus-ring-color;\n}\n\nfieldset {\n  border: 0;\n  margin: 0;\n  min-width: 0;\n  padding: 0;\n}\n\ninput[type=\"checkbox\"],\ninput[type=\"radio\"] {\n  box-sizing: border-box;\n  padding: 0;\n}\n\ninput[type=\"date\"],\ninput[type=\"datetime-local\"],\ninput[type=\"month\"],\ninput[type=\"time\"] {\n  -webkit-appearance: listbox;\n}\n\nlabel {\n  font-size: 0.75rem;\n  font-weight: 400;\n  letter-spacing: 0;\n  line-height: 1.5;\n  color: rgba(0, 0, 0, 0.38);\n  display: inline-block;\n}\n\nlegend {\n  font-size: 1.5rem;\n  font-weight: 400;\n  letter-spacing: 0;\n  line-height: 1.33333;\n  color: inherit;\n  display: block;\n  margin-bottom: 0.5rem;\n  max-width: 100%;\n  padding: 0;\n  white-space: normal;\n  width: 100%;\n}\n\noutput {\n  display: inline-block;\n}\n\nprogress {\n  vertical-align: baseline;\n}\n\nselect[multiple],\nselect[size] {\n  overflow: auto;\n}\n\ntextarea {\n  overflow: auto;\n  resize: vertical;\n}\n\n[type=\"number\"]::-webkit-inner-spin-button,\n[type=\"number\"]::-webkit-outer-spin-button {\n  height: auto;\n}\n\n[type=\"search\"] {\n  -webkit-appearance: none;\n  outline-offset: -2px;\n}\n\n[type=\"search\"]::-webkit-search-cancel-button,\n[type=\"search\"]::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n\n::-webkit-file-upload-button {\n  -webkit-appearance: button;\n  font: inherit;\n}\n\n[hidden] {\n  display: none !important;\n}\n\nimg {\n  border-style: none;\n  vertical-align: middle;\n}\n\nsvg:not(:root) {\n  overflow: hidden;\n}\n\nsummary {\n  display: list-item;\n}\n\na {\n  background-color: transparent;\n  color: #9c27b0;\n  text-decoration: none;\n  -webkit-text-decoration-skip: objects;\n}\n\na:active,\na:focus,\na:hover {\n  color: #7b1fa2;\n  text-decoration: none;\n}\n\na:not([href]):not([tabindex]) {\n  color: inherit;\n  text-decoration: none;\n}\n\na:not([href]):not([tabindex]):active,\na:not([href]):not([tabindex]):focus,\na:not([href]):not([tabindex]):hover {\n  color: inherit;\n  text-decoration: none;\n}\n\na:not([href]):not([tabindex]):focus {\n  outline: 0;\n}\n\ntemplate {\n  display: none;\n}\n\ncaption {\n  text-align: left;\n  text-align: start;\n  font-size: 0.75rem;\n  font-weight: 400;\n  letter-spacing: 0;\n  line-height: 1.5;\n  caption-side: bottom;\n  color: rgba(0, 0, 0, 0.38);\n  min-height: 3.5rem;\n  padding: 1.21429rem 1.5rem;\n}\n\n[dir='rtl'] caption {\n  text-align: right;\n  text-align: start;\n}\n\ntable {\n  border-collapse: collapse;\n}\n\nth {\n  text-align: inherit;\n}\n\nabbr[data-original-title],\nabbr[title] {\n  border-bottom: 0;\n  cursor: help;\n  text-decoration: underline dotted;\n}\n\naddress {\n  font-style: normal;\n  line-height: inherit;\n  margin-bottom: 1rem;\n}\n\nb,\nstrong {\n  font-weight: bolder;\n}\n\nblockquote {\n  margin: 0 0 1rem;\n}\n\ndd {\n  margin-bottom: 0.5rem;\n  margin-left: 0;\n}\n\ndfn {\n  font-style: italic;\n}\n\ndl,\nol,\nul {\n  margin-top: 0;\n  margin-bottom: 1rem;\n}\n\ndt {\n  font-weight: 500;\n}\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  margin-top: 0;\n  margin-bottom: 0.5rem;\n}\n\nmark {\n  background-color: #ffeb3b;\n  color: rgba(0, 0, 0, 0.87);\n}\n\nol ol,\nol ul,\nul ol,\nul ul {\n  margin-bottom: 0;\n}\n\np {\n  margin-top: 0;\n  margin-bottom: 1rem;\n}\n\nsmall {\n  font-size: 80%;\n}\n\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline;\n}\n\nsub {\n  bottom: -.25em;\n}\n\nsup {\n  top: -.5em;\n}\n\n.col-1,\n.col-2,\n.col-3,\n.col-4,\n.col-5,\n.col-6,\n.col-7,\n.col-8,\n.col-9,\n.col-10,\n.col-11,\n.col-12,\n.col,\n.col-auto,\n.col-sm-1,\n.col-sm-2,\n.col-sm-3,\n.col-sm-4,\n.col-sm-5,\n.col-sm-6,\n.col-sm-7,\n.col-sm-8,\n.col-sm-9,\n.col-sm-10,\n.col-sm-11,\n.col-sm-12,\n.col-sm,\n.col-sm-auto,\n.col-md-1,\n.col-md-2,\n.col-md-3,\n.col-md-4,\n.col-md-5,\n.col-md-6,\n.col-md-7,\n.col-md-8,\n.col-md-9,\n.col-md-10,\n.col-md-11,\n.col-md-12,\n.col-md,\n.col-md-auto,\n.col-lg-1,\n.col-lg-2,\n.col-lg-3,\n.col-lg-4,\n.col-lg-5,\n.col-lg-6,\n.col-lg-7,\n.col-lg-8,\n.col-lg-9,\n.col-lg-10,\n.col-lg-11,\n.col-lg-12,\n.col-lg,\n.col-lg-auto,\n.col-xl-1,\n.col-xl-2,\n.col-xl-3,\n.col-xl-4,\n.col-xl-5,\n.col-xl-6,\n.col-xl-7,\n.col-xl-8,\n.col-xl-9,\n.col-xl-10,\n.col-xl-11,\n.col-xl-12,\n.col-xl,\n.col-xl-auto {\n  padding-right: 8px;\n  padding-left: 8px;\n  min-height: 1px;\n  position: relative;\n  width: 100%;\n}\n\n@media (min-width: 600px) {\n  .col-1,\n  .col-2,\n  .col-3,\n  .col-4,\n  .col-5,\n  .col-6,\n  .col-7,\n  .col-8,\n  .col-9,\n  .col-10,\n  .col-11,\n  .col-12,\n  .col,\n  .col-auto,\n  .col-sm-1,\n  .col-sm-2,\n  .col-sm-3,\n  .col-sm-4,\n  .col-sm-5,\n  .col-sm-6,\n  .col-sm-7,\n  .col-sm-8,\n  .col-sm-9,\n  .col-sm-10,\n  .col-sm-11,\n  .col-sm-12,\n  .col-sm,\n  .col-sm-auto,\n  .col-md-1,\n  .col-md-2,\n  .col-md-3,\n  .col-md-4,\n  .col-md-5,\n  .col-md-6,\n  .col-md-7,\n  .col-md-8,\n  .col-md-9,\n  .col-md-10,\n  .col-md-11,\n  .col-md-12,\n  .col-md,\n  .col-md-auto,\n  .col-lg-1,\n  .col-lg-2,\n  .col-lg-3,\n  .col-lg-4,\n  .col-lg-5,\n  .col-lg-6,\n  .col-lg-7,\n  .col-lg-8,\n  .col-lg-9,\n  .col-lg-10,\n  .col-lg-11,\n  .col-lg-12,\n  .col-lg,\n  .col-lg-auto,\n  .col-xl-1,\n  .col-xl-2,\n  .col-xl-3,\n  .col-xl-4,\n  .col-xl-5,\n  .col-xl-6,\n  .col-xl-7,\n  .col-xl-8,\n  .col-xl-9,\n  .col-xl-10,\n  .col-xl-11,\n  .col-xl-12,\n  .col-xl,\n  .col-xl-auto {\n    padding-right: 8px;\n    padding-left: 8px;\n  }\n}\n\n@media (min-width: 960px) {\n  .col-1,\n  .col-2,\n  .col-3,\n  .col-4,\n  .col-5,\n  .col-6,\n  .col-7,\n  .col-8,\n  .col-9,\n  .col-10,\n  .col-11,\n  .col-12,\n  .col,\n  .col-auto,\n  .col-sm-1,\n  .col-sm-2,\n  .col-sm-3,\n  .col-sm-4,\n  .col-sm-5,\n  .col-sm-6,\n  .col-sm-7,\n  .col-sm-8,\n  .col-sm-9,\n  .col-sm-10,\n  .col-sm-11,\n  .col-sm-12,\n  .col-sm,\n  .col-sm-auto,\n  .col-md-1,\n  .col-md-2,\n  .col-md-3,\n  .col-md-4,\n  .col-md-5,\n  .col-md-6,\n  .col-md-7,\n  .col-md-8,\n  .col-md-9,\n  .col-md-10,\n  .col-md-11,\n  .col-md-12,\n  .col-md,\n  .col-md-auto,\n  .col-lg-1,\n  .col-lg-2,\n  .col-lg-3,\n  .col-lg-4,\n  .col-lg-5,\n  .col-lg-6,\n  .col-lg-7,\n  .col-lg-8,\n  .col-lg-9,\n  .col-lg-10,\n  .col-lg-11,\n  .col-lg-12,\n  .col-lg,\n  .col-lg-auto,\n  .col-xl-1,\n  .col-xl-2,\n  .col-xl-3,\n  .col-xl-4,\n  .col-xl-5,\n  .col-xl-6,\n  .col-xl-7,\n  .col-xl-8,\n  .col-xl-9,\n  .col-xl-10,\n  .col-xl-11,\n  .col-xl-12,\n  .col-xl,\n  .col-xl-auto {\n    padding-right: 12px;\n    padding-left: 12px;\n  }\n}\n\n@media (min-width: 1280px) {\n  .col-1,\n  .col-2,\n  .col-3,\n  .col-4,\n  .col-5,\n  .col-6,\n  .col-7,\n  .col-8,\n  .col-9,\n  .col-10,\n  .col-11,\n  .col-12,\n  .col,\n  .col-auto,\n  .col-sm-1,\n  .col-sm-2,\n  .col-sm-3,\n  .col-sm-4,\n  .col-sm-5,\n  .col-sm-6,\n  .col-sm-7,\n  .col-sm-8,\n  .col-sm-9,\n  .col-sm-10,\n  .col-sm-11,\n  .col-sm-12,\n  .col-sm,\n  .col-sm-auto,\n  .col-md-1,\n  .col-md-2,\n  .col-md-3,\n  .col-md-4,\n  .col-md-5,\n  .col-md-6,\n  .col-md-7,\n  .col-md-8,\n  .col-md-9,\n  .col-md-10,\n  .col-md-11,\n  .col-md-12,\n  .col-md,\n  .col-md-auto,\n  .col-lg-1,\n  .col-lg-2,\n  .col-lg-3,\n  .col-lg-4,\n  .col-lg-5,\n  .col-lg-6,\n  .col-lg-7,\n  .col-lg-8,\n  .col-lg-9,\n  .col-lg-10,\n  .col-lg-11,\n  .col-lg-12,\n  .col-lg,\n  .col-lg-auto,\n  .col-xl-1,\n  .col-xl-2,\n  .col-xl-3,\n  .col-xl-4,\n  .col-xl-5,\n  .col-xl-6,\n  .col-xl-7,\n  .col-xl-8,\n  .col-xl-9,\n  .col-xl-10,\n  .col-xl-11,\n  .col-xl-12,\n  .col-xl,\n  .col-xl-auto {\n    padding-right: 12px;\n    padding-left: 12px;\n  }\n}\n\n@media (min-width: 1920px) {\n  .col-1,\n  .col-2,\n  .col-3,\n  .col-4,\n  .col-5,\n  .col-6,\n  .col-7,\n  .col-8,\n  .col-9,\n  .col-10,\n  .col-11,\n  .col-12,\n  .col,\n  .col-auto,\n  .col-sm-1,\n  .col-sm-2,\n  .col-sm-3,\n  .col-sm-4,\n  .col-sm-5,\n  .col-sm-6,\n  .col-sm-7,\n  .col-sm-8,\n  .col-sm-9,\n  .col-sm-10,\n  .col-sm-11,\n  .col-sm-12,\n  .col-sm,\n  .col-sm-auto,\n  .col-md-1,\n  .col-md-2,\n  .col-md-3,\n  .col-md-4,\n  .col-md-5,\n  .col-md-6,\n  .col-md-7,\n  .col-md-8,\n  .col-md-9,\n  .col-md-10,\n  .col-md-11,\n  .col-md-12,\n  .col-md,\n  .col-md-auto,\n  .col-lg-1,\n  .col-lg-2,\n  .col-lg-3,\n  .col-lg-4,\n  .col-lg-5,\n  .col-lg-6,\n  .col-lg-7,\n  .col-lg-8,\n  .col-lg-9,\n  .col-lg-10,\n  .col-lg-11,\n  .col-lg-12,\n  .col-lg,\n  .col-lg-auto,\n  .col-xl-1,\n  .col-xl-2,\n  .col-xl-3,\n  .col-xl-4,\n  .col-xl-5,\n  .col-xl-6,\n  .col-xl-7,\n  .col-xl-8,\n  .col-xl-9,\n  .col-xl-10,\n  .col-xl-11,\n  .col-xl-12,\n  .col-xl,\n  .col-xl-auto {\n    padding-right: 12px;\n    padding-left: 12px;\n  }\n}\n\n.col {\n  flex-basis: 0;\n  flex-grow: 1;\n  max-width: 100%;\n}\n\n.col-auto {\n  flex: 0 0 auto;\n  max-width: none;\n  width: auto;\n}\n\n.col-1 {\n  flex: 0 0 8.33333%;\n  max-width: 8.33333%;\n}\n\n.col-2 {\n  flex: 0 0 16.66667%;\n  max-width: 16.66667%;\n}\n\n.col-3 {\n  flex: 0 0 25%;\n  max-width: 25%;\n}\n\n.col-4 {\n  flex: 0 0 33.33333%;\n  max-width: 33.33333%;\n}\n\n.col-5 {\n  flex: 0 0 41.66667%;\n  max-width: 41.66667%;\n}\n\n.col-6 {\n  flex: 0 0 50%;\n  max-width: 50%;\n}\n\n.col-7 {\n  flex: 0 0 58.33333%;\n  max-width: 58.33333%;\n}\n\n.col-8 {\n  flex: 0 0 66.66667%;\n  max-width: 66.66667%;\n}\n\n.col-9 {\n  flex: 0 0 75%;\n  max-width: 75%;\n}\n\n.col-10 {\n  flex: 0 0 83.33333%;\n  max-width: 83.33333%;\n}\n\n.col-11 {\n  flex: 0 0 91.66667%;\n  max-width: 91.66667%;\n}\n\n.col-12 {\n  flex: 0 0 100%;\n  max-width: 100%;\n}\n\n.order-1 {\n  order: 1;\n}\n\n.order-2 {\n  order: 2;\n}\n\n.order-3 {\n  order: 3;\n}\n\n.order-4 {\n  order: 4;\n}\n\n.order-5 {\n  order: 5;\n}\n\n.order-6 {\n  order: 6;\n}\n\n.order-7 {\n  order: 7;\n}\n\n.order-8 {\n  order: 8;\n}\n\n.order-9 {\n  order: 9;\n}\n\n.order-10 {\n  order: 10;\n}\n\n.order-11 {\n  order: 11;\n}\n\n.order-12 {\n  order: 12;\n}\n\n@media (min-width: 600px) {\n  .col-sm {\n    flex-basis: 0;\n    flex-grow: 1;\n    max-width: 100%;\n  }\n\n  .col-sm-auto {\n    flex: 0 0 auto;\n    max-width: none;\n    width: auto;\n  }\n\n  .col-sm-1 {\n    flex: 0 0 8.33333%;\n    max-width: 8.33333%;\n  }\n\n  .col-sm-2 {\n    flex: 0 0 16.66667%;\n    max-width: 16.66667%;\n  }\n\n  .col-sm-3 {\n    flex: 0 0 25%;\n    max-width: 25%;\n  }\n\n  .col-sm-4 {\n    flex: 0 0 33.33333%;\n    max-width: 33.33333%;\n  }\n\n  .col-sm-5 {\n    flex: 0 0 41.66667%;\n    max-width: 41.66667%;\n  }\n\n  .col-sm-6 {\n    flex: 0 0 50%;\n    max-width: 50%;\n  }\n\n  .col-sm-7 {\n    flex: 0 0 58.33333%;\n    max-width: 58.33333%;\n  }\n\n  .col-sm-8 {\n    flex: 0 0 66.66667%;\n    max-width: 66.66667%;\n  }\n\n  .col-sm-9 {\n    flex: 0 0 75%;\n    max-width: 75%;\n  }\n\n  .col-sm-10 {\n    flex: 0 0 83.33333%;\n    max-width: 83.33333%;\n  }\n\n  .col-sm-11 {\n    flex: 0 0 91.66667%;\n    max-width: 91.66667%;\n  }\n\n  .col-sm-12 {\n    flex: 0 0 100%;\n    max-width: 100%;\n  }\n\n  .order-sm-1 {\n    order: 1;\n  }\n\n  .order-sm-2 {\n    order: 2;\n  }\n\n  .order-sm-3 {\n    order: 3;\n  }\n\n  .order-sm-4 {\n    order: 4;\n  }\n\n  .order-sm-5 {\n    order: 5;\n  }\n\n  .order-sm-6 {\n    order: 6;\n  }\n\n  .order-sm-7 {\n    order: 7;\n  }\n\n  .order-sm-8 {\n    order: 8;\n  }\n\n  .order-sm-9 {\n    order: 9;\n  }\n\n  .order-sm-10 {\n    order: 10;\n  }\n\n  .order-sm-11 {\n    order: 11;\n  }\n\n  .order-sm-12 {\n    order: 12;\n  }\n}\n\n@media (min-width: 960px) {\n  .col-md {\n    flex-basis: 0;\n    flex-grow: 1;\n    max-width: 100%;\n  }\n\n  .col-md-auto {\n    flex: 0 0 auto;\n    max-width: none;\n    width: auto;\n  }\n\n  .col-md-1 {\n    flex: 0 0 8.33333%;\n    max-width: 8.33333%;\n  }\n\n  .col-md-2 {\n    flex: 0 0 16.66667%;\n    max-width: 16.66667%;\n  }\n\n  .col-md-3 {\n    flex: 0 0 25%;\n    max-width: 25%;\n  }\n\n  .col-md-4 {\n    flex: 0 0 33.33333%;\n    max-width: 33.33333%;\n  }\n\n  .col-md-5 {\n    flex: 0 0 41.66667%;\n    max-width: 41.66667%;\n  }\n\n  .col-md-6 {\n    flex: 0 0 50%;\n    max-width: 50%;\n  }\n\n  .col-md-7 {\n    flex: 0 0 58.33333%;\n    max-width: 58.33333%;\n  }\n\n  .col-md-8 {\n    flex: 0 0 66.66667%;\n    max-width: 66.66667%;\n  }\n\n  .col-md-9 {\n    flex: 0 0 75%;\n    max-width: 75%;\n  }\n\n  .col-md-10 {\n    flex: 0 0 83.33333%;\n    max-width: 83.33333%;\n  }\n\n  .col-md-11 {\n    flex: 0 0 91.66667%;\n    max-width: 91.66667%;\n  }\n\n  .col-md-12 {\n    flex: 0 0 100%;\n    max-width: 100%;\n  }\n\n  .order-md-1 {\n    order: 1;\n  }\n\n  .order-md-2 {\n    order: 2;\n  }\n\n  .order-md-3 {\n    order: 3;\n  }\n\n  .order-md-4 {\n    order: 4;\n  }\n\n  .order-md-5 {\n    order: 5;\n  }\n\n  .order-md-6 {\n    order: 6;\n  }\n\n  .order-md-7 {\n    order: 7;\n  }\n\n  .order-md-8 {\n    order: 8;\n  }\n\n  .order-md-9 {\n    order: 9;\n  }\n\n  .order-md-10 {\n    order: 10;\n  }\n\n  .order-md-11 {\n    order: 11;\n  }\n\n  .order-md-12 {\n    order: 12;\n  }\n}\n\n@media (min-width: 1280px) {\n  .col-lg {\n    flex-basis: 0;\n    flex-grow: 1;\n    max-width: 100%;\n  }\n\n  .col-lg-auto {\n    flex: 0 0 auto;\n    max-width: none;\n    width: auto;\n  }\n\n  .col-lg-1 {\n    flex: 0 0 8.33333%;\n    max-width: 8.33333%;\n  }\n\n  .col-lg-2 {\n    flex: 0 0 16.66667%;\n    max-width: 16.66667%;\n  }\n\n  .col-lg-3 {\n    flex: 0 0 25%;\n    max-width: 25%;\n  }\n\n  .col-lg-4 {\n    flex: 0 0 33.33333%;\n    max-width: 33.33333%;\n  }\n\n  .col-lg-5 {\n    flex: 0 0 41.66667%;\n    max-width: 41.66667%;\n  }\n\n  .col-lg-6 {\n    flex: 0 0 50%;\n    max-width: 50%;\n  }\n\n  .col-lg-7 {\n    flex: 0 0 58.33333%;\n    max-width: 58.33333%;\n  }\n\n  .col-lg-8 {\n    flex: 0 0 66.66667%;\n    max-width: 66.66667%;\n  }\n\n  .col-lg-9 {\n    flex: 0 0 75%;\n    max-width: 75%;\n  }\n\n  .col-lg-10 {\n    flex: 0 0 83.33333%;\n    max-width: 83.33333%;\n  }\n\n  .col-lg-11 {\n    flex: 0 0 91.66667%;\n    max-width: 91.66667%;\n  }\n\n  .col-lg-12 {\n    flex: 0 0 100%;\n    max-width: 100%;\n  }\n\n  .order-lg-1 {\n    order: 1;\n  }\n\n  .order-lg-2 {\n    order: 2;\n  }\n\n  .order-lg-3 {\n    order: 3;\n  }\n\n  .order-lg-4 {\n    order: 4;\n  }\n\n  .order-lg-5 {\n    order: 5;\n  }\n\n  .order-lg-6 {\n    order: 6;\n  }\n\n  .order-lg-7 {\n    order: 7;\n  }\n\n  .order-lg-8 {\n    order: 8;\n  }\n\n  .order-lg-9 {\n    order: 9;\n  }\n\n  .order-lg-10 {\n    order: 10;\n  }\n\n  .order-lg-11 {\n    order: 11;\n  }\n\n  .order-lg-12 {\n    order: 12;\n  }\n}\n\n@media (min-width: 1920px) {\n  .col-xl {\n    flex-basis: 0;\n    flex-grow: 1;\n    max-width: 100%;\n  }\n\n  .col-xl-auto {\n    flex: 0 0 auto;\n    max-width: none;\n    width: auto;\n  }\n\n  .col-xl-1 {\n    flex: 0 0 8.33333%;\n    max-width: 8.33333%;\n  }\n\n  .col-xl-2 {\n    flex: 0 0 16.66667%;\n    max-width: 16.66667%;\n  }\n\n  .col-xl-3 {\n    flex: 0 0 25%;\n    max-width: 25%;\n  }\n\n  .col-xl-4 {\n    flex: 0 0 33.33333%;\n    max-width: 33.33333%;\n  }\n\n  .col-xl-5 {\n    flex: 0 0 41.66667%;\n    max-width: 41.66667%;\n  }\n\n  .col-xl-6 {\n    flex: 0 0 50%;\n    max-width: 50%;\n  }\n\n  .col-xl-7 {\n    flex: 0 0 58.33333%;\n    max-width: 58.33333%;\n  }\n\n  .col-xl-8 {\n    flex: 0 0 66.66667%;\n    max-width: 66.66667%;\n  }\n\n  .col-xl-9 {\n    flex: 0 0 75%;\n    max-width: 75%;\n  }\n\n  .col-xl-10 {\n    flex: 0 0 83.33333%;\n    max-width: 83.33333%;\n  }\n\n  .col-xl-11 {\n    flex: 0 0 91.66667%;\n    max-width: 91.66667%;\n  }\n\n  .col-xl-12 {\n    flex: 0 0 100%;\n    max-width: 100%;\n  }\n\n  .order-xl-1 {\n    order: 1;\n  }\n\n  .order-xl-2 {\n    order: 2;\n  }\n\n  .order-xl-3 {\n    order: 3;\n  }\n\n  .order-xl-4 {\n    order: 4;\n  }\n\n  .order-xl-5 {\n    order: 5;\n  }\n\n  .order-xl-6 {\n    order: 6;\n  }\n\n  .order-xl-7 {\n    order: 7;\n  }\n\n  .order-xl-8 {\n    order: 8;\n  }\n\n  .order-xl-9 {\n    order: 9;\n  }\n\n  .order-xl-10 {\n    order: 10;\n  }\n\n  .order-xl-11 {\n    order: 11;\n  }\n\n  .order-xl-12 {\n    order: 12;\n  }\n}\n\n.container {\n  margin-right: auto;\n  margin-left: auto;\n  width: 100%;\n  padding-right: 8px;\n  padding-left: 8px;\n}\n\n@media (min-width: 600px) {\n  .container {\n    padding-right: 8px;\n    padding-left: 8px;\n  }\n}\n\n@media (min-width: 960px) {\n  .container {\n    padding-right: 12px;\n    padding-left: 12px;\n  }\n}\n\n@media (min-width: 1280px) {\n  .container {\n    padding-right: 12px;\n    padding-left: 12px;\n  }\n}\n\n@media (min-width: 1920px) {\n  .container {\n    padding-right: 12px;\n    padding-left: 12px;\n  }\n}\n\n@media (min-width: 600px) {\n  .container {\n    max-width: 600px;\n  }\n}\n\n@media (min-width: 960px) {\n  .container {\n    max-width: 840px;\n  }\n}\n\n@media (min-width: 1280px) {\n  .container {\n    max-width: 1024px;\n  }\n}\n\n@media (min-width: 1920px) {\n  .container {\n    max-width: 1600px;\n  }\n}\n\n.container-fluid {\n  margin-right: auto;\n  margin-left: auto;\n  width: 100%;\n  padding-right: 8px;\n  padding-left: 8px;\n}\n\n@media (min-width: 600px) {\n  .container-fluid {\n    padding-right: 8px;\n    padding-left: 8px;\n  }\n}\n\n@media (min-width: 960px) {\n  .container-fluid {\n    padding-right: 12px;\n    padding-left: 12px;\n  }\n}\n\n@media (min-width: 1280px) {\n  .container-fluid {\n    padding-right: 12px;\n    padding-left: 12px;\n  }\n}\n\n@media (min-width: 1920px) {\n  .container-fluid {\n    padding-right: 12px;\n    padding-left: 12px;\n  }\n}\n\n.row {\n  display: flex;\n  flex-wrap: wrap;\n  margin-right: -8px;\n  margin-left: -8px;\n}\n\n@media (min-width: 600px) {\n  .row {\n    margin-right: -8px;\n    margin-left: -8px;\n  }\n}\n\n@media (min-width: 960px) {\n  .row {\n    margin-right: -12px;\n    margin-left: -12px;\n  }\n}\n\n@media (min-width: 1280px) {\n  .row {\n    margin-right: -12px;\n    margin-left: -12px;\n  }\n}\n\n@media (min-width: 1920px) {\n  .row {\n    margin-right: -12px;\n    margin-left: -12px;\n  }\n}\n\n.no-gutters {\n  margin-right: 0;\n  margin-left: 0;\n}\n\n.no-gutters > .col,\n.no-gutters > [class*=\"col-\"] {\n  padding-right: 0;\n  padding-left: 0;\n}\n\n.blockquote {\n  font-size: 1.25rem;\n  font-weight: 500;\n  letter-spacing: 0.02em;\n  line-height: 1.4;\n  border-left: 0.3125rem solid #9c27b0;\n  margin-bottom: 1rem;\n  padding: 0 1rem;\n}\n\n.blockquote-footer {\n  font-size: 0.75rem;\n  font-weight: 400;\n  letter-spacing: 0;\n  line-height: 1.5;\n  color: rgba(0, 0, 0, 0.38);\n  display: block;\n  margin-top: 0.25rem;\n}\n\n.blockquote-footer::before {\n  content: '\\2014   \\A0';\n}\n\nmark,\n.mark {\n  background-color: #ffeb3b;\n  color: rgba(0, 0, 0, 0.87);\n  padding: 0.2em;\n}\n\nsmall,\n.small {\n  font-size: 80%;\n  font-weight: normal;\n}\n\n.initialism {\n  font-size: 90%;\n  text-transform: uppercase;\n}\n\n.typography-display-4 {\n  font-size: 7rem;\n  font-weight: 300;\n  letter-spacing: -0.04em;\n  line-height: 1;\n}\n\n.typography-display-3 {\n  font-size: 3.5rem;\n  font-weight: 400;\n  letter-spacing: -0.02em;\n  line-height: 1.03571;\n}\n\n.typography-display-2 {\n  font-size: 2.8125rem;\n  font-weight: 400;\n  letter-spacing: 0;\n  line-height: 1.06667;\n}\n\n.typography-display-1 {\n  font-size: 2.125rem;\n  font-weight: 400;\n  letter-spacing: 0;\n  line-height: 1.17647;\n}\n\n.typography-headline {\n  font-size: 1.5rem;\n  font-weight: 400;\n  letter-spacing: 0;\n  line-height: 1.33333;\n}\n\n.typography-title {\n  font-size: 1.25rem;\n  font-weight: 500;\n  letter-spacing: 0.02em;\n  line-height: 1.4;\n}\n\n.typography-subheading {\n  font-size: 1rem;\n  font-weight: 400;\n  letter-spacing: 0.04em;\n  line-height: 1.5;\n}\n\n.typography-body-2 {\n  font-size: 0.875rem;\n  font-weight: 500;\n  letter-spacing: 0;\n  line-height: 1.42857;\n}\n\n.typography-body-1 {\n  font-size: 0.875rem;\n  font-weight: 400;\n  letter-spacing: 0;\n  line-height: 1.42857;\n}\n\n.typography-caption {\n  font-size: 0.75rem;\n  font-weight: 400;\n  letter-spacing: 0;\n  line-height: 1.5;\n}\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\n.h1,\n.h2,\n.h3,\n.h4,\n.h5,\n.h6 {\n  color: inherit;\n  font-family: inherit;\n  margin-bottom: 0.5rem;\n}\n\nh1,\n.h1 {\n  font-size: 2.8125rem;\n  font-weight: 400;\n  letter-spacing: 0;\n  line-height: 1.06667;\n}\n\nh2,\n.h2 {\n  font-size: 2.125rem;\n  font-weight: 400;\n  letter-spacing: 0;\n  line-height: 1.17647;\n}\n\nh3,\n.h3 {\n  font-size: 1.5rem;\n  font-weight: 400;\n  letter-spacing: 0;\n  line-height: 1.33333;\n}\n\nh4,\n.h4 {\n  font-size: 1.25rem;\n  font-weight: 500;\n  letter-spacing: 0.02em;\n  line-height: 1.4;\n}\n\nh5,\n.h5 {\n  font-size: 1rem;\n  font-weight: 400;\n  letter-spacing: 0.04em;\n  line-height: 1.5;\n}\n\nh6,\n.h6 {\n  font-size: 0.875rem;\n  font-weight: 500;\n  letter-spacing: 0;\n  line-height: 1.42857;\n}\n\n.display-1 {\n  font-size: 7rem;\n  font-weight: 300;\n  letter-spacing: -0.04em;\n  line-height: 1;\n}\n\n.display-2 {\n  font-size: 3.5rem;\n  font-weight: 400;\n  letter-spacing: -0.02em;\n  line-height: 1.03571;\n}\n\n.display-3 {\n  font-size: 2.8125rem;\n  font-weight: 400;\n  letter-spacing: 0;\n  line-height: 1.06667;\n}\n\n.display-4 {\n  font-size: 2.125rem;\n  font-weight: 400;\n  letter-spacing: 0;\n  line-height: 1.17647;\n}\n\n.lead {\n  font-size: 1.25rem;\n  font-weight: 500;\n  letter-spacing: 0.02em;\n  line-height: 1.4;\n}\n\nhr {\n  border: 0;\n  border-top: 1px solid rgba(0, 0, 0, 0.12);\n  margin-top: 1rem;\n  margin-bottom: 1rem;\n}\n\n.list-inline {\n  list-style: none;\n  padding-left: 0;\n}\n\n.list-inline-item {\n  display: inline-block;\n}\n\n.list-inline-item:not(:last-child) {\n  margin-right: 0.5rem;\n}\n\n.list-unstyled {\n  list-style: none;\n  padding-left: 0;\n}\n\n.alert {\n  border-radius: 2px;\n  border: 0;\n  box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.14), 0 2px 2px 0 rgba(0, 0, 0, 0.12), 0 1px 3px 0 rgba(0, 0, 0, 0.2);\n  display: block;\n  margin-bottom: 1rem;\n  padding: 1rem 1rem;\n}\n\n.alert-primary {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #e1bee7;\n}\n\n.alert-primary .alert-link {\n  color: #7b1fa2;\n}\n\n.alert-secondary {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #ff80ab;\n}\n\n.alert-secondary .alert-link {\n  color: #f50057;\n}\n\n.alert-danger {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #ffcdd2;\n}\n\n.alert-danger .alert-link {\n  color: #d32f2f;\n}\n\n.alert-info {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #bbdefb;\n}\n\n.alert-info .alert-link {\n  color: #1976d2;\n}\n\n.alert-success {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #c8e6c9;\n}\n\n.alert-success .alert-link {\n  color: #388e3c;\n}\n\n.alert-warning {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #ffe0b2;\n}\n\n.alert-warning .alert-link {\n  color: #f57c00;\n}\n\n.alert-dark {\n  color: white;\n  background-color: #757575;\n}\n\n.alert-dark .alert-link {\n  color: #212121;\n}\n\n.alert-light {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #fafafa;\n}\n\n.alert-light .alert-link {\n  color: #e0e0e0;\n}\n\n.alert-dismissible .close {\n  padding: 0.6875rem 1rem;\n  position: relative;\n  top: -0.72321rem;\n  right: -1rem;\n}\n\n.alert-heading {\n  color: inherit;\n}\n\n.alert-link {\n  font-weight: 500;\n}\n\n.badge {\n  border-radius: 2px;\n  background-color: rgba(0, 0, 0, 0.12);\n  color: rgba(0, 0, 0, 0.87);\n  display: inline-block;\n  font-size: inherit;\n  font-weight: 500;\n  line-height: inherit;\n  padding: 0 0.5rem;\n  text-align: center;\n  vertical-align: baseline;\n  white-space: nowrap;\n}\n\n.badge:empty {\n  display: none;\n}\n\n.btn .badge {\n  margin-top: -1px;\n  margin-bottom: -1px;\n  padding-top: 1px;\n  padding-bottom: 1px;\n}\n\n.badge-primary {\n  color: white;\n  background-color: #9c27b0;\n}\n\n.badge-secondary {\n  color: white;\n  background-color: #ff4081;\n}\n\n.badge-danger {\n  color: white;\n  background-color: #f44336;\n}\n\n.badge-info {\n  color: white;\n  background-color: #2196f3;\n}\n\n.badge-success {\n  color: white;\n  background-color: #4caf50;\n}\n\n.badge-warning {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #ff9800;\n}\n\n.badge-dark {\n  color: white;\n  background-color: #424242;\n}\n\n.badge-light {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #f5f5f5;\n}\n\n.breadcrumb {\n  border-radius: 2px;\n  align-items: center;\n  background-color: #f5f5f5;\n  display: flex;\n  flex-wrap: wrap;\n  list-style: none;\n  margin-bottom: 1rem;\n  min-height: 3.5rem;\n  padding: 0.625rem 1rem;\n}\n\n.breadcrumb-item {\n  transition-duration: 0.3s;\n  transition-property: color;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  align-items: center;\n  color: rgba(0, 0, 0, 0.54);\n  display: flex;\n}\n\n@media (min-width: 600px) {\n  .breadcrumb-item {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .breadcrumb-item {\n    transition-duration: 0.2s;\n  }\n}\n\n.breadcrumb-item:active,\n.breadcrumb-item:focus,\n.breadcrumb-item:hover {\n  color: rgba(0, 0, 0, 0.87);\n}\n\n.breadcrumb-item.active {\n  color: rgba(0, 0, 0, 0.87);\n  font-weight: bolder;\n}\n\n.breadcrumb-item a {\n  color: inherit;\n  text-decoration: none;\n}\n\n.breadcrumb-item + .breadcrumb-item::before {\n  font-size: 1.5em;\n  line-height: 0.66667em;\n  vertical-align: -0.34537em;\n  font-family: 'Material Icons';\n  font-feature-settings: 'liga';\n  font-style: normal;\n  font-weight: normal;\n  letter-spacing: normal;\n  text-rendering: optimizeLegibility;\n  text-transform: none;\n  white-space: nowrap;\n  word-wrap: normal;\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-font-smoothing: antialiased;\n  color: rgba(0, 0, 0, 0.54);\n  content: \"chevron_right\";\n  display: inline-block;\n  margin-right: 0.5rem;\n  margin-left: 0.5rem;\n}\n\n.carousel {\n  position: relative;\n}\n\n.carousel:hover .carousel-control-next,\n.carousel:hover .carousel-control-prev {\n  opacity: 1;\n}\n\n.carousel-inner {\n  overflow: hidden;\n  position: relative;\n  width: 100%;\n}\n\n.carousel-item {\n  transition-duration: 0.375s;\n  transition-property: transform;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  align-items: center;\n  backface-visibility: hidden;\n  display: none;\n  perspective: 1000px;\n  position: relative;\n  width: 100%;\n}\n\n@media (min-width: 600px) {\n  .carousel-item {\n    transition-duration: 0.4875s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .carousel-item {\n    transition-duration: 0.25s;\n  }\n}\n\n.carousel-item.active,\n.carousel-item-next,\n.carousel-item-prev {\n  display: flex;\n}\n\n.carousel-item-left.active,\n.carousel-item-prev {\n  transform: translateX(-100%);\n}\n\n@supports (transform-style: preserve-3d) {\n  .carousel-item-left.active,\n  .carousel-item-prev {\n    transform: translate3d(-100%, 0, 0);\n  }\n}\n\n.carousel-item-left.carousel-item-next,\n.carousel-item-prev.carousel-item-right {\n  transform: translateX(0);\n}\n\n@supports (transform-style: preserve-3d) {\n  .carousel-item-left.carousel-item-next,\n  .carousel-item-prev.carousel-item-right {\n    transform: translate3d(0, 0, 0);\n  }\n}\n\n.carousel-item-next,\n.carousel-item-right.active {\n  transform: translateX(100%);\n}\n\n@supports (transform-style: preserve-3d) {\n  .carousel-item-next,\n  .carousel-item-right.active {\n    transform: translate3d(100%, 0, 0);\n  }\n}\n\n.carousel-item-next,\n.carousel-item-prev {\n  position: absolute;\n  top: 0;\n}\n\n.carousel-control-next,\n.carousel-control-prev {\n  align-items: center;\n  background-color: rgba(255, 255, 255, 0.12);\n  border-radius: 50%;\n  box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12), 0 3px 5px 0 rgba(0, 0, 0, 0.2);\n  color: white;\n  display: flex;\n  font-size: 0.8125rem;\n  height: 2.5rem;\n  justify-content: center;\n  line-height: 1;\n  margin-top: -1.25rem;\n  opacity: 0;\n  position: absolute;\n  top: 50%;\n  user-select: none;\n  width: 2.5rem;\n}\n\n.carousel-control-next:active,\n.carousel-control-next:focus,\n.carousel-control-next:hover,\n.carousel-control-prev:active,\n.carousel-control-prev:focus,\n.carousel-control-prev:hover {\n  background-color: rgba(204, 204, 204, 0.25);\n  color: white;\n  text-decoration: none;\n}\n\n.carousel-control-next:active,\n.carousel-control-prev:active {\n  box-shadow: 0 12px 17px 2px rgba(0, 0, 0, 0.14), 0 5px 22px 4px rgba(0, 0, 0, 0.12), 0 7px 8px 0 rgba(0, 0, 0, 0.2);\n}\n\n.carousel-control-next:focus,\n.carousel-control-prev:focus {\n  outline: 0;\n}\n\n.carousel-control-next {\n  right: 1.25rem;\n}\n\n.carousel-control-prev {\n  left: 1.25rem;\n}\n\n.carousel-control-next-icon,\n.carousel-control-prev-icon {\n  font-size: 1.5em;\n  line-height: 0.66667em;\n  vertical-align: -0.34537em;\n  font-family: 'Material Icons';\n  font-feature-settings: 'liga';\n  font-style: normal;\n  font-weight: normal;\n  letter-spacing: normal;\n  text-rendering: optimizeLegibility;\n  text-transform: none;\n  white-space: nowrap;\n  word-wrap: normal;\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-font-smoothing: antialiased;\n}\n\n.carousel-control-next-icon::before {\n  content: \"chevron_right\";\n}\n\n.carousel-control-prev-icon::before {\n  content: \"chevron_left\";\n}\n\n.carousel-caption {\n  color: white;\n  position: absolute;\n  right: 25%;\n  bottom: 1.5rem;\n  left: 25%;\n  text-align: center;\n  z-index: 1;\n}\n\n.carousel-indicators {\n  display: flex;\n  justify-content: center;\n  list-style: none;\n  margin-bottom: 0;\n  padding-left: 0;\n  position: absolute;\n  right: 5rem;\n  bottom: 0.5rem;\n  left: 5rem;\n  z-index: 1;\n}\n\n.carousel-indicators li {\n  background-color: transparent;\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  border-radius: 0.5rem;\n  flex: 0 0 auto;\n  height: 0.5rem;\n  margin-right: 1px;\n  margin-left: 1px;\n  overflow: hidden;\n  text-indent: 100%;\n  white-space: nowrap;\n  width: 0.5rem;\n}\n\n.carousel-indicators .active {\n  background-color: rgba(204, 204, 204, 0.25);\n}\n\n.close {\n  transition-duration: 0.3s;\n  transition-property: color;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  appearance: none;\n  background-color: transparent;\n  background-image: none;\n  border: 0;\n  color: rgba(0, 0, 0, 0.38);\n  float: right;\n  font-size: 1.5rem;\n  font-weight: 300;\n  line-height: 1;\n  padding: 0;\n}\n\n@media (min-width: 600px) {\n  .close {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .close {\n    transition-duration: 0.2s;\n  }\n}\n\n.close:active,\n.close:focus,\n.close:hover {\n  color: rgba(0, 0, 0, 0.87);\n  text-decoration: none;\n}\n\n.close:focus {\n  outline: 0;\n}\n\n.close span {\n  vertical-align: text-top;\n}\n\ncode,\nkbd,\npre,\nsamp {\n  font-family: \"Roboto Mono\", Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;\n}\n\ncode {\n  border-radius: 2px;\n  background-color: #f5f5f5;\n  color: #bd4147;\n  font-size: 87.5%;\n  padding: 0.2rem 0.4rem;\n}\n\nkbd {\n  border-radius: 2px;\n  background-color: rgba(0, 0, 0, 0.87);\n  color: white;\n  font-size: 87.5%;\n  padding: 0.2rem 0.4rem;\n}\n\nkbd kbd {\n  font-size: 100%;\n  font-weight: bolder;\n  padding: 0;\n}\n\npre {\n  border-radius: 2px;\n  color: rgba(0, 0, 0, 0.87);\n  display: block;\n  font-size: 87.5%;\n  margin-top: 0;\n  margin-bottom: 1rem;\n}\n\npre code {\n  background-color: transparent;\n  border-radius: 0;\n  color: inherit;\n  font-size: inherit;\n  padding: 0;\n}\n\n.pre-scrollable {\n  max-height: 340px;\n  overflow-y: scroll;\n}\n\n.custom-file {\n  display: inline-block;\n  height: 2.25rem;\n  max-width: 100%;\n  position: relative;\n}\n\n.custom-file-control {\n  font-size: 1rem;\n  height: 2.25rem;\n  line-height: 1.42857;\n  padding: 0.41071rem 0 0.34821rem;\n  transition-duration: 0.3s;\n  transition-property: border-color, box-shadow;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  align-items: center;\n  border-bottom: 1px solid rgba(0, 0, 0, 0.42);\n  color: rgba(0, 0, 0, 0.38);\n  display: flex;\n  justify-content: space-between;\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n}\n\n@media (min-width: 600px) {\n  .custom-file-control {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .custom-file-control {\n    transition-duration: 0.2s;\n  }\n}\n\n.custom-file-control:lang(en)::before {\n  content: \"Choose file...\";\n}\n\n.custom-file-control:hover {\n  border-bottom-color: rgba(0, 0, 0, 0.87);\n  box-shadow: inset 0 -2px 0 -1px rgba(0, 0, 0, 0.87);\n}\n\n.custom-file-control::after {\n  font-size: 1.5em;\n  line-height: 0.66667em;\n  vertical-align: -0.34537em;\n  font-family: 'Material Icons';\n  font-feature-settings: 'liga';\n  font-style: normal;\n  font-weight: normal;\n  letter-spacing: normal;\n  text-rendering: optimizeLegibility;\n  text-transform: none;\n  white-space: nowrap;\n  word-wrap: normal;\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-font-smoothing: antialiased;\n  content: \"attachment\";\n}\n\n.custom-file-control::before {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.custom-file-input {\n  margin: 0;\n  max-width: 100%;\n  min-width: 14rem;\n  opacity: 0;\n}\n\n.custom-file-input:focus ~ .custom-file-control {\n  border-bottom-color: #9c27b0;\n  box-shadow: inset 0 -2px 0 -1px #9c27b0;\n}\n\n.form-check {\n  display: block;\n  margin-bottom: 0.5rem;\n}\n\n.form-check.disabled .form-check-label {\n  color: rgba(0, 0, 0, 0.38);\n}\n\n.form-check-inline {\n  display: inline-block;\n  margin-bottom: 0;\n  vertical-align: middle;\n}\n\n.form-check-inline + .form-check-inline {\n  margin-left: 0.5rem;\n}\n\n.form-check-input {\n  flex-shrink: 0;\n  margin-right: 0.25rem;\n  position: relative;\n  top: 0.28571rem;\n}\n\n.form-check-label {\n  align-items: flex-start;\n  color: inherit;\n  display: inline-flex;\n  font-size: inherit;\n  line-height: inherit;\n}\n\n.form-group {\n  margin-bottom: 1rem;\n}\n\n.form-row {\n  display: flex;\n  flex-wrap: wrap;\n  margin-right: -0.5rem;\n  margin-left: -0.5rem;\n}\n\n.form-row > .col,\n.form-row > [class*='col-'] {\n  padding-right: 0.5rem;\n  padding-left: 0.5rem;\n}\n\n.form-inline {\n  align-items: center;\n  display: flex;\n  flex-flow: row wrap;\n}\n\n.form-inline label {\n  align-items: center;\n  display: flex;\n  justify-content: center;\n}\n\n.form-inline .form-check {\n  align-items: center;\n  display: flex;\n  justify-content: center;\n  margin-bottom: 0;\n  width: auto;\n}\n\n.form-inline .form-control {\n  display: inline-block;\n  vertical-align: middle;\n  width: auto;\n}\n\n.form-inline .form-control-plaintext {\n  display: inline-block;\n}\n\n.form-inline .form-group {\n  align-items: center;\n  display: flex;\n  flex: 0 0 auto;\n  flex-flow: row wrap;\n  margin-bottom: 0;\n}\n\n.form-inline .input-group {\n  width: auto;\n}\n\n.col-form-label {\n  color: inherit;\n  font-size: 1rem;\n  line-height: 1.42857;\n  padding-top: 0.41071rem;\n  padding-bottom: 0.41071rem;\n}\n\n.col-form-label-lg {\n  font-size: 2.125rem;\n  line-height: 1.17647;\n  padding-top: 0.625rem;\n  padding-bottom: 0.625rem;\n}\n\n.col-form-label-sm {\n  font-size: 0.8125rem;\n  line-height: 1.38461;\n  padding-top: 0.4375rem;\n  padding-bottom: 0.4375rem;\n}\n\n.col-form-legend {\n  font-size: 1rem;\n  line-height: 1.42857;\n  margin-bottom: 0;\n  padding-top: 0.41071rem;\n  padding-bottom: 0.41071rem;\n}\n\n.form-text {\n  font-size: 0.75rem;\n  font-weight: 400;\n  letter-spacing: 0;\n  line-height: 1.5;\n  color: rgba(0, 0, 0, 0.38);\n  display: block;\n  margin-top: 0.5rem;\n}\n\n.form-control-lg + .form-text {\n  margin-top: 0.75rem;\n}\n\n.form-control-sm + .form-text {\n  margin-top: 0.25rem;\n}\n\n.form-control-file,\n.form-control-range {\n  display: block;\n}\n\n.invalid-feedback {\n  font-size: 0.75rem;\n  font-weight: 400;\n  letter-spacing: 0;\n  line-height: 1.5;\n  color: #f44336;\n  display: none;\n  margin-top: 0.5rem;\n}\n\n.form-control-lg + .invalid-feedback {\n  margin-top: 0.75rem;\n}\n\n.form-control-sm + .invalid-feedback {\n  margin-top: 0.25rem;\n}\n\n.invalid-tooltip {\n  display: none;\n  position: absolute;\n  top: 100%;\n}\n\n.img-fluid {\n  height: auto;\n  max-width: 100%;\n}\n\n.img-thumbnail {\n  height: auto;\n  max-width: 100%;\n  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.14), 0 3px 4px 0 rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);\n}\n\n.figure {\n  display: inline-block;\n}\n\n.figure-caption {\n  font-size: 0.75rem;\n  font-weight: 400;\n  letter-spacing: 0;\n  line-height: 1.5;\n  color: rgba(0, 0, 0, 0.38);\n}\n\n.figure-img {\n  line-height: 1;\n  margin-bottom: 0.5rem;\n}\n\n.jumbotron {\n  border-radius: 2px;\n  background-color: white;\n  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.14), 0 3px 4px 0 rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);\n  color: rgba(0, 0, 0, 0.87);\n  padding: 3rem 2rem;\n}\n\n.jumbotron-fluid {\n  border-radius: 0;\n  padding-right: 0;\n  padding-left: 0;\n}\n\n.media {\n  align-items: flex-start;\n  display: flex;\n}\n\n.media-body {\n  flex: 1;\n}\n\n.nav {\n  display: flex;\n  flex-wrap: wrap;\n  list-style: none;\n  margin-bottom: 0;\n  padding-left: 0;\n}\n\n.nav-link {\n  display: block;\n  padding: 0.5rem 1rem;\n}\n\n.nav-link:active,\n.nav-link:focus,\n.nav-link:hover {\n  text-decoration: none;\n}\n\n.nav-link.disabled {\n  color: rgba(0, 0, 0, 0.38);\n  cursor: default;\n}\n\n.nav-fill .nav-item {\n  flex: 1 1 auto;\n  text-align: center;\n}\n\n.nav-justified .nav-item {\n  flex-basis: 0;\n  flex-grow: 1;\n  text-align: center;\n}\n\n.nav-pills .nav-link {\n  border-radius: 2px;\n  transition-duration: 0.3s;\n  transition-property: background-color, color, opacity;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  color: rgba(0, 0, 0, 0.87);\n  opacity: 0.7;\n}\n\n@media (min-width: 600px) {\n  .nav-pills .nav-link {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .nav-pills .nav-link {\n    transition-duration: 0.2s;\n  }\n}\n\n.nav-pills .nav-link:active,\n.nav-pills .nav-link:focus,\n.nav-pills .nav-link:hover {\n  background-color: rgba(0, 0, 0, 0.12);\n}\n\n.nav-pills .nav-link:active {\n  opacity: 1;\n}\n\n.nav-pills .nav-link.active {\n  color: #ff4081;\n  opacity: 1;\n}\n\n.nav-pills .nav-link.disabled {\n  background-color: transparent;\n  color: rgba(0, 0, 0, 0.38);\n  opacity: 1;\n}\n\n.nav-pills .show > .nav-link {\n  background-color: rgba(0, 0, 0, 0.12);\n  opacity: 1;\n}\n\n.tab-content > .tab-pane {\n  display: none;\n}\n\n.tab-content > .active {\n  display: block;\n}\n\n.pagination {\n  background-color: #f5f5f5;\n  display: flex;\n  list-style: none;\n  padding: 0.625rem 0.5rem;\n}\n\n.page-link {\n  border-radius: 2px;\n  transition-duration: 0.3s;\n  transition-property: color;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  color: rgba(0, 0, 0, 0.87);\n  display: block;\n  font-size: 0.875rem;\n  font-weight: 500;\n  line-height: 1;\n  margin-left: 1px;\n  padding: 0.6875rem 1rem;\n  position: relative;\n  text-align: center;\n  white-space: nowrap;\n}\n\n@media (min-width: 600px) {\n  .page-link {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .page-link {\n    transition-duration: 0.2s;\n  }\n}\n\n.page-link:active,\n.page-link:focus,\n.page-link:hover {\n  color: rgba(0, 0, 0, 0.87);\n  text-decoration: none;\n}\n\n.page-link:focus,\n.page-link:hover {\n  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.12));\n}\n\n.page-link:active,\n.page-link.active {\n  background-color: rgba(153, 153, 153, 0.4);\n  background-image: none;\n}\n\n.page-link:focus {\n  outline: 0;\n}\n\n.page-item:first-child .page-link {\n  margin-left: 0;\n}\n\n.page-item.active .page-link {\n  background-color: rgba(153, 153, 153, 0.4);\n}\n\n.page-item.disabled .page-link {\n  background-color: transparent;\n  color: rgba(0, 0, 0, 0.38);\n  pointer-events: none;\n}\n\n.pagination-lg .page-link {\n  font-size: 0.9375rem;\n  padding: 0.78125rem 1rem;\n}\n\n.pagination-sm .page-link {\n  font-size: 0.8125rem;\n  padding: 0.59375rem 1rem;\n}\n\n.popover {\n  text-align: left;\n  text-align: start;\n  font-family: Roboto, -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif;\n  font-style: normal;\n  font-weight: normal;\n  letter-spacing: normal;\n  line-break: auto;\n  line-height: 1.42857;\n  text-decoration: none;\n  text-shadow: none;\n  text-transform: none;\n  white-space: normal;\n  word-break: normal;\n  word-spacing: normal;\n  border-radius: 2px;\n  background-clip: padding-box;\n  background-color: #ffffff;\n  box-shadow: 0 24px 38px 3px rgba(0, 0, 0, 0.14), 0 9px 46px 8px rgba(0, 0, 0, 0.12), 0 11px 15px 0 rgba(0, 0, 0, 0.2);\n  display: block;\n  font-size: 1rem;\n  margin: 1.5rem;\n  max-width: 17.5rem;\n  position: absolute;\n  top: 0;\n  left: 0;\n  z-index: 240;\n}\n\n[dir='rtl'] .popover {\n  text-align: right;\n  text-align: start;\n}\n\n.popover-body {\n  padding: 1.25rem 1.5rem;\n}\n\n.popover-body > :last-child {\n  margin-bottom: 0;\n}\n\n.popover-header {\n  font-size: 1.25rem;\n  font-weight: 500;\n  letter-spacing: 0.02em;\n  line-height: 1.4;\n  margin-bottom: 0;\n  padding: 1.25rem 1.5rem 0;\n}\n\n.popover-header:empty {\n  display: none;\n}\n\n.popover-header:last-child {\n  padding-bottom: 1.25rem;\n}\n\n@media (min-width: 960px) {\n  .popover {\n    margin: 0.875rem;\n  }\n}\n\n.embed-responsive {\n  display: block;\n  overflow: hidden;\n  padding: 0;\n  position: relative;\n  width: 100%;\n}\n\n.embed-responsive::before {\n  content: '';\n  display: block;\n}\n\n.embed-responsive embed,\n.embed-responsive iframe,\n.embed-responsive object,\n.embed-responsive video,\n.embed-responsive .embed-responsive-item {\n  border: 0;\n  height: 100%;\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  width: 100%;\n}\n\n.embed-responsive-1by1::before {\n  padding-top: 100%;\n}\n\n.embed-responsive-4by3::before {\n  padding-top: 75%;\n}\n\n.embed-responsive-16by9::before {\n  padding-top: 56.25%;\n}\n\n.embed-responsive-21by9::before {\n  padding-top: 42.85714%;\n}\n\n.collapse {\n  display: none;\n}\n\n.collapse.show {\n  display: block;\n}\n\ntbody.collapse.show {\n  display: table-row-group;\n}\n\ntr.collapse.show {\n  display: table-row;\n}\n\n.collapsing {\n  transition-duration: 0.3s;\n  transition-property: height;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  height: 0;\n  overflow: hidden;\n  position: relative;\n}\n\n@media (min-width: 600px) {\n  .collapsing {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .collapsing {\n    transition-duration: 0.2s;\n  }\n}\n\n.fade {\n  transition-duration: 0.3s;\n  transition-property: opacity;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  opacity: 0;\n}\n\n@media (min-width: 600px) {\n  .fade {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .fade {\n    transition-duration: 0.2s;\n  }\n}\n\n.fade.show {\n  opacity: 1;\n}\n\n.btn {\n  border-radius: 2px;\n  transition-duration: 0.3s;\n  transition-property: box-shadow;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  background-color: transparent;\n  background-image: none;\n  border: 0;\n  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.14), 0 3px 4px 0 rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);\n  color: rgba(0, 0, 0, 0.87);\n  display: inline-block;\n  font-size: 0.875rem;\n  font-weight: 500;\n  line-height: 1;\n  margin: 0;\n  max-width: 100%;\n  min-width: 5.5rem;\n  padding: 0.6875rem 1rem;\n  position: relative;\n  text-align: center;\n  text-transform: uppercase;\n  user-select: none;\n  vertical-align: middle;\n  white-space: nowrap;\n}\n\n@media (min-width: 600px) {\n  .btn {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .btn {\n    transition-duration: 0.2s;\n  }\n}\n\n.btn:active,\n.btn:focus,\n.btn:hover {\n  color: rgba(0, 0, 0, 0.87);\n  text-decoration: none;\n}\n\n.btn:focus,\n.btn:hover {\n  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.12));\n}\n\n.btn:active,\n.btn.active {\n  background-color: rgba(153, 153, 153, 0.4);\n  background-image: none;\n  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 3px rgba(0, 0, 0, 0.12), 0 4px 15px 0 rgba(0, 0, 0, 0.2);\n}\n\n.btn:disabled,\n.btn.disabled {\n  background-color: rgba(0, 0, 0, 0.12);\n  background-image: none;\n  box-shadow: none;\n  color: rgba(0, 0, 0, 0.26);\n  opacity: 1;\n}\n\n.btn:disabled .waves-ripple,\n.btn.disabled .waves-ripple {\n  display: none;\n}\n\n.btn:focus {\n  outline: 0;\n}\n\n.show > .btn.dropdown-toggle {\n  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.12));\n}\n\na.btn.disabled {\n  pointer-events: none;\n}\n\nfieldset[disabled] a.btn {\n  pointer-events: none;\n}\n\n.btn-primary {\n  color: white;\n  background-color: #9c27b0;\n}\n\n.btn-primary:active,\n.btn-primary:focus,\n.btn-primary:hover {\n  color: white;\n}\n\n.btn-primary:active,\n.btn-primary.active {\n  background-color: #7b1fa2;\n}\n\n.btn-primary:disabled,\n.btn-primary.disabled {\n  background-color: rgba(0, 0, 0, 0.12);\n  color: rgba(0, 0, 0, 0.26);\n}\n\n.btn-secondary {\n  color: white;\n  background-color: #ff4081;\n}\n\n.btn-secondary:active,\n.btn-secondary:focus,\n.btn-secondary:hover {\n  color: white;\n}\n\n.btn-secondary:active,\n.btn-secondary.active {\n  background-color: #f50057;\n}\n\n.btn-secondary:disabled,\n.btn-secondary.disabled {\n  background-color: rgba(0, 0, 0, 0.12);\n  color: rgba(0, 0, 0, 0.26);\n}\n\n.btn-danger {\n  color: white;\n  background-color: #f44336;\n}\n\n.btn-danger:active,\n.btn-danger:focus,\n.btn-danger:hover {\n  color: white;\n}\n\n.btn-danger:active,\n.btn-danger.active {\n  background-color: #d32f2f;\n}\n\n.btn-danger:disabled,\n.btn-danger.disabled {\n  background-color: rgba(0, 0, 0, 0.12);\n  color: rgba(0, 0, 0, 0.26);\n}\n\n.btn-info {\n  color: white;\n  background-color: #2196f3;\n}\n\n.btn-info:active,\n.btn-info:focus,\n.btn-info:hover {\n  color: white;\n}\n\n.btn-info:active,\n.btn-info.active {\n  background-color: #1976d2;\n}\n\n.btn-info:disabled,\n.btn-info.disabled {\n  background-color: rgba(0, 0, 0, 0.12);\n  color: rgba(0, 0, 0, 0.26);\n}\n\n.btn-success {\n  color: white;\n  background-color: #4caf50;\n}\n\n.btn-success:active,\n.btn-success:focus,\n.btn-success:hover {\n  color: white;\n}\n\n.btn-success:active,\n.btn-success.active {\n  background-color: #388e3c;\n}\n\n.btn-success:disabled,\n.btn-success.disabled {\n  background-color: rgba(0, 0, 0, 0.12);\n  color: rgba(0, 0, 0, 0.26);\n}\n\n.btn-warning {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #ff9800;\n}\n\n.btn-warning:active,\n.btn-warning:focus,\n.btn-warning:hover {\n  color: rgba(0, 0, 0, 0.87);\n}\n\n.btn-warning:active,\n.btn-warning.active {\n  background-color: #f57c00;\n}\n\n.btn-warning:disabled,\n.btn-warning.disabled {\n  background-color: rgba(0, 0, 0, 0.12);\n  color: rgba(0, 0, 0, 0.26);\n}\n\n.btn-dark {\n  color: white;\n  background-color: #424242;\n}\n\n.btn-dark:active,\n.btn-dark:focus,\n.btn-dark:hover {\n  color: white;\n}\n\n.btn-dark:active,\n.btn-dark.active {\n  background-color: #212121;\n}\n\n.btn-dark:disabled,\n.btn-dark.disabled {\n  background-color: rgba(0, 0, 0, 0.12);\n  color: rgba(0, 0, 0, 0.26);\n}\n\n.btn-light {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #f5f5f5;\n}\n\n.btn-light:active,\n.btn-light:focus,\n.btn-light:hover {\n  color: rgba(0, 0, 0, 0.87);\n}\n\n.btn-light:active,\n.btn-light.active {\n  background-color: #e0e0e0;\n}\n\n.btn-light:disabled,\n.btn-light.disabled {\n  background-color: rgba(0, 0, 0, 0.12);\n  color: rgba(0, 0, 0, 0.26);\n}\n\n[class*='bg-dark'] :not([class*='bg-light']) .btn:disabled,\n[class*='bg-dark'] :not([class*='bg-light']) .btn.disabled {\n  background-color: rgba(255, 255, 255, 0.12);\n  color: rgba(255, 255, 255, 0.3);\n}\n\n.btn-lg,\n.btn-group-lg > .btn,\n.input-group-lg > .input-group-btn > .btn {\n  font-size: 0.9375rem;\n  padding: 0.78125rem 1rem;\n}\n\n.btn-sm,\n.btn-group-sm > .btn,\n.input-group-sm > .input-group-btn > .btn {\n  font-size: 0.8125rem;\n  padding: 0.59375rem 1rem;\n}\n\n.btn-block {\n  display: block;\n  width: 100%;\n}\n\n.btn-block + .btn-block {\n  margin-top: 0.25rem;\n}\n\n[type='button'].btn-block,\n[type='reset'].btn-block,\n[type='submit'].btn-block {\n  width: 100%;\n}\n\n.btn-link {\n  background-color: transparent;\n  border-radius: 0;\n  box-shadow: none;\n  color: #9c27b0;\n  font-weight: normal;\n  text-decoration: none;\n  text-transform: none;\n}\n\n.btn-link:active,\n.btn-link:focus,\n.btn-link:hover {\n  color: #7b1fa2;\n  text-decoration: none;\n}\n\n.btn-link:focus,\n.btn-link:hover {\n  background-image: none;\n}\n\n.btn-link:active,\n.btn-link.active {\n  background-color: transparent;\n  box-shadow: none;\n}\n\n.btn-link:disabled,\n.btn-link.disabled {\n  background-color: transparent;\n  color: rgba(0, 0, 0, 0.26);\n  text-decoration: none;\n}\n\n.btn-fluid {\n  min-width: 0;\n}\n\n[class*='btn-outline'] {\n  background-color: transparent;\n  box-shadow: none;\n}\n\n[class*='btn-outline']:active,\n[class*='btn-outline'].active {\n  box-shadow: none;\n}\n\n[class*='btn-outline']:disabled,\n[class*='btn-outline'].disabled {\n  background-color: transparent;\n}\n\n.btn-outline-primary,\n.btn-outline-primary:active,\n.btn-outline-primary:focus,\n.btn-outline-primary:hover {\n  color: #9c27b0;\n}\n\n.btn-outline-primary:disabled,\n.btn-outline-primary.disabled {\n  color: rgba(0, 0, 0, 0.26);\n}\n\n.btn-outline-secondary,\n.btn-outline-secondary:active,\n.btn-outline-secondary:focus,\n.btn-outline-secondary:hover {\n  color: #ff4081;\n}\n\n.btn-outline-secondary:disabled,\n.btn-outline-secondary.disabled {\n  color: rgba(0, 0, 0, 0.26);\n}\n\n.btn-outline-danger,\n.btn-outline-danger:active,\n.btn-outline-danger:focus,\n.btn-outline-danger:hover {\n  color: #f44336;\n}\n\n.btn-outline-danger:disabled,\n.btn-outline-danger.disabled {\n  color: rgba(0, 0, 0, 0.26);\n}\n\n.btn-outline-info,\n.btn-outline-info:active,\n.btn-outline-info:focus,\n.btn-outline-info:hover {\n  color: #2196f3;\n}\n\n.btn-outline-info:disabled,\n.btn-outline-info.disabled {\n  color: rgba(0, 0, 0, 0.26);\n}\n\n.btn-outline-success,\n.btn-outline-success:active,\n.btn-outline-success:focus,\n.btn-outline-success:hover {\n  color: #4caf50;\n}\n\n.btn-outline-success:disabled,\n.btn-outline-success.disabled {\n  color: rgba(0, 0, 0, 0.26);\n}\n\n.btn-outline-warning,\n.btn-outline-warning:active,\n.btn-outline-warning:focus,\n.btn-outline-warning:hover {\n  color: #ff9800;\n}\n\n.btn-outline-warning:disabled,\n.btn-outline-warning.disabled {\n  color: rgba(0, 0, 0, 0.26);\n}\n\n.btn-outline-dark,\n.btn-outline-dark:active,\n.btn-outline-dark:focus,\n.btn-outline-dark:hover {\n  color: #424242;\n}\n\n.btn-outline-dark:disabled,\n.btn-outline-dark.disabled {\n  color: rgba(0, 0, 0, 0.26);\n}\n\n.btn-outline-light,\n.btn-outline-light:active,\n.btn-outline-light:focus,\n.btn-outline-light:hover {\n  color: #f5f5f5;\n}\n\n.btn-outline-light:disabled,\n.btn-outline-light.disabled {\n  color: rgba(0, 0, 0, 0.26);\n}\n\n[class*='bg-dark'] [class*='btn-outline']:focus,\n[class*='bg-dark'] [class*='btn-outline']:hover,\n.btn-outline-light:focus,\n.btn-outline-light:hover {\n  background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.12));\n}\n\n[class*='bg-dark'] [class*='btn-outline']:active,\n[class*='bg-dark'] [class*='btn-outline'].active,\n.btn-outline-light:active,\n.btn-outline-light.active {\n  background-color: rgba(204, 204, 204, 0.25);\n}\n\n.btn-float {\n  border-radius: 50%;\n  box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12), 0 3px 5px 0 rgba(0, 0, 0, 0.2);\n  height: 3.5rem;\n  line-height: 3.5rem;\n  min-width: 0;\n  padding: 0;\n  width: 3.5rem;\n}\n\n.btn-float:active,\n.btn-float.active {\n  box-shadow: 0 12px 17px 2px rgba(0, 0, 0, 0.14), 0 5px 22px 4px rgba(0, 0, 0, 0.12), 0 7px 8px 0 rgba(0, 0, 0, 0.2);\n}\n\n.btn-float:disabled,\n.btn-float.disabled {\n  box-shadow: none;\n}\n\n.btn-float.btn-sm {\n  height: 2.5rem;\n  line-height: 2.5rem;\n  width: 2.5rem;\n}\n\n.btn-group,\n.btn-group-vertical {\n  border-radius: 2px;\n  background-color: white;\n  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.14), 0 3px 4px 0 rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);\n  display: inline-flex;\n  position: relative;\n  vertical-align: middle;\n}\n\n.btn-group > .btn,\n.btn-group-vertical > .btn {\n  transition-duration: 0.3s;\n  transition-property: border-color, opacity;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  box-shadow: none;\n  flex: 0 1 auto;\n  min-width: 0;\n}\n\n@media (min-width: 600px) {\n  .btn-group > .btn,\n  .btn-group-vertical > .btn {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .btn-group > .btn,\n  .btn-group-vertical > .btn {\n    transition-duration: 0.2s;\n  }\n}\n\n.btn-group > .btn:active,\n.btn-group > .btn.active,\n.btn-group-vertical > .btn:active,\n.btn-group-vertical > .btn.active {\n  box-shadow: none;\n}\n\n.btn-group > .btn:disabled,\n.btn-group > .btn.disabled,\n.btn-group-vertical > .btn:disabled,\n.btn-group-vertical > .btn.disabled {\n  opacity: 0.7;\n}\n\n.btn-group > .btn[class*='btn-outline'],\n.btn-group-vertical > .btn[class*='btn-outline'] {\n  opacity: 0.7;\n}\n\n.btn-group > .btn[class*='btn-outline']:active,\n.btn-group > .btn[class*='btn-outline'].active,\n.btn-group-vertical > .btn[class*='btn-outline']:active,\n.btn-group-vertical > .btn[class*='btn-outline'].active {\n  opacity: 1;\n}\n\n.btn-group > .btn[class*='btn-outline']:disabled,\n.btn-group > .btn[class*='btn-outline'].disabled,\n.btn-group-vertical > .btn[class*='btn-outline']:disabled,\n.btn-group-vertical > .btn[class*='btn-outline'].disabled {\n  opacity: 1;\n}\n\n.btn-group > .btn-primary:disabled,\n.btn-group > .btn-primary.disabled,\n.btn-group-vertical > .btn-primary:disabled,\n.btn-group-vertical > .btn-primary.disabled {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #e1bee7;\n}\n\n.btn-group > .btn-secondary:disabled,\n.btn-group > .btn-secondary.disabled,\n.btn-group-vertical > .btn-secondary:disabled,\n.btn-group-vertical > .btn-secondary.disabled {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #ff80ab;\n}\n\n.btn-group > .btn-danger:disabled,\n.btn-group > .btn-danger.disabled,\n.btn-group-vertical > .btn-danger:disabled,\n.btn-group-vertical > .btn-danger.disabled {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #ffcdd2;\n}\n\n.btn-group > .btn-info:disabled,\n.btn-group > .btn-info.disabled,\n.btn-group-vertical > .btn-info:disabled,\n.btn-group-vertical > .btn-info.disabled {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #bbdefb;\n}\n\n.btn-group > .btn-success:disabled,\n.btn-group > .btn-success.disabled,\n.btn-group-vertical > .btn-success:disabled,\n.btn-group-vertical > .btn-success.disabled {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #c8e6c9;\n}\n\n.btn-group > .btn-warning:disabled,\n.btn-group > .btn-warning.disabled,\n.btn-group-vertical > .btn-warning:disabled,\n.btn-group-vertical > .btn-warning.disabled {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #ffe0b2;\n}\n\n.btn-group > .btn-dark:disabled,\n.btn-group > .btn-dark.disabled,\n.btn-group-vertical > .btn-dark:disabled,\n.btn-group-vertical > .btn-dark.disabled {\n  color: white;\n  background-color: #757575;\n}\n\n.btn-group > .btn-light:disabled,\n.btn-group > .btn-light.disabled,\n.btn-group-vertical > .btn-light:disabled,\n.btn-group-vertical > .btn-light.disabled {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #fafafa;\n}\n\n.btn-group > .btn-group,\n.btn-group > .btn-group-vertical,\n.btn-group-vertical > .btn-group,\n.btn-group-vertical > .btn-group-vertical {\n  box-shadow: none;\n}\n\n.btn-group.show > .btn.dropdown-toggle {\n  box-shadow: none;\n}\n\n.btn-group > .btn {\n  border-left: 1px solid transparent;\n  margin-left: -1px;\n}\n\n.btn-group > .btn:disabled + .btn:disabled,\n.btn-group > .btn:disabled + .btn.disabled,\n.btn-group > .btn:disabled + .btn-group > .btn:disabled:first-child,\n.btn-group > .btn:disabled + .btn-group > .btn.disabled:first-child,\n.btn-group > .btn.disabled + .btn:disabled,\n.btn-group > .btn.disabled + .btn.disabled,\n.btn-group > .btn.disabled + .btn-group > .btn:disabled:first-child,\n.btn-group > .btn.disabled + .btn-group > .btn.disabled:first-child {\n  border-left-color: rgba(0, 0, 0, 0.12);\n}\n\n.btn-group > .btn.active + .btn.active,\n.btn-group > .btn.active + .btn-group > .btn.active:first-child {\n  border-left-color: rgba(0, 0, 0, 0.12);\n}\n\n.btn-group > .btn:first-child {\n  border-left-width: 0;\n  margin-left: 0;\n}\n\n.btn-group > .btn-group > .btn:first-child {\n  border-left-width: 1px;\n  margin-left: -1px;\n}\n\n.btn-group > .btn:first-child:not(:last-child):not(.dropdown-toggle) {\n  border-top-right-radius: 0;\n  border-bottom-right-radius: 0;\n}\n\n.btn-group > .btn:last-child:not(:first-child),\n.btn-group > .dropdown-toggle:not(:first-child) {\n  border-bottom-left-radius: 0;\n  border-top-left-radius: 0;\n}\n\n.btn-group > .btn:not(:first-child):not(:last-child):not(.dropdown-toggle) {\n  border-radius: 0;\n}\n\n.btn-group > .btn-group:first-child:not(:last-child) > .btn:last-child,\n.btn-group > .btn-group:first-child:not(:last-child) > .dropdown-toggle {\n  border-top-right-radius: 0;\n  border-bottom-right-radius: 0;\n}\n\n.btn-group > .btn-group:last-child:not(:first-child) > .btn:first-child {\n  border-bottom-left-radius: 0;\n  border-top-left-radius: 0;\n}\n\n.btn-group > .btn-group:not(:first-child):not(:last-child) > .btn {\n  border-radius: 0;\n}\n\n.btn-group-vertical {\n  align-items: flex-start;\n  flex-direction: column;\n  justify-content: center;\n}\n\n.btn-group-vertical > .btn,\n.btn-group-vertical > .btn-group {\n  width: 100%;\n}\n\n.btn-group-vertical > .btn {\n  border-top: 1px solid transparent;\n  margin-top: -1px;\n}\n\n.btn-group-vertical > .btn:disabled + .btn:disabled,\n.btn-group-vertical > .btn:disabled + .btn.disabled,\n.btn-group-vertical > .btn:disabled + .btn-group > .btn:disabled:first-child,\n.btn-group-vertical > .btn:disabled + .btn-group > .btn.disabled:first-child,\n.btn-group-vertical > .btn.disabled + .btn:disabled,\n.btn-group-vertical > .btn.disabled + .btn.disabled,\n.btn-group-vertical > .btn.disabled + .btn-group > .btn:disabled:first-child,\n.btn-group-vertical > .btn.disabled + .btn-group > .btn.disabled:first-child {\n  border-top-color: rgba(0, 0, 0, 0.12);\n}\n\n.btn-group-vertical > .btn.active + .btn.active,\n.btn-group-vertical > .btn.active + .btn-group > .btn.active:first-child {\n  border-top-color: rgba(0, 0, 0, 0.12);\n}\n\n.btn-group-vertical > .btn:first-child {\n  border-top-width: 0;\n  margin-top: 0;\n}\n\n.btn-group-vertical > .btn-group-vertical > .btn:first-child {\n  border-top-width: 1px;\n  margin-top: -1px;\n}\n\n.btn-group-vertical > .btn:first-child:not(:last-child) {\n  border-bottom-right-radius: 0;\n  border-bottom-left-radius: 0;\n}\n\n.btn-group-vertical > .btn:last-child:not(:first-child) {\n  border-top-left-radius: 0;\n  border-top-right-radius: 0;\n}\n\n.btn-group-vertical > .btn:not(:first-child):not(:last-child) {\n  border-radius: 0;\n}\n\n.btn-group-vertical > .btn-group:first-child:not(:last-child) > .btn:last-child,\n.btn-group-vertical > .btn-group:first-child:not(:last-child) > .dropdown-toggle {\n  border-bottom-right-radius: 0;\n  border-bottom-left-radius: 0;\n}\n\n.btn-group-vertical > .btn-group:last-child:not(:first-child) > .btn:first-child {\n  border-top-left-radius: 0;\n  border-top-right-radius: 0;\n}\n\n.btn-group-vertical > .btn-group:not(:first-child):not(:last-child) > .btn {\n  border-radius: 0;\n}\n\n.btn-group-fluid {\n  background-color: transparent;\n  box-shadow: none;\n}\n\n[data-toggle='buttons'] > .btn [type='checkbox'],\n[data-toggle='buttons'] > .btn [type='radio'],\n[data-toggle='buttons'] > .btn-group > .btn [type='checkbox'],\n[data-toggle='buttons'] > .btn-group > .btn [type='radio'] {\n  clip: rect(0, 0, 0, 0);\n  pointer-events: none;\n  position: absolute;\n}\n\n.btn + .dropdown-toggle-split {\n  padding-right: 0.5rem;\n  padding-left: 0.5rem;\n}\n\n.btn + .dropdown-toggle-split::after {\n  margin-left: -0.2em;\n}\n\n.btn-lg + .dropdown-toggle-split {\n  padding-right: 0.5rem;\n  padding-left: 0.5rem;\n}\n\n.btn-sm + .dropdown-toggle-split {\n  padding-right: 0.5rem;\n  padding-left: 0.5rem;\n}\n\n.btn-toolbar {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: flex-start;\n}\n\n.btn-toolbar .input-group {\n  width: auto;\n}\n\n.card {\n  border-radius: 2px;\n  background-clip: border-box;\n  background-color: #ffffff;\n  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.14), 0 3px 4px 0 rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n  position: relative;\n  word-wrap: break-word;\n}\n\n.card[href]:active,\n.card[href]:focus,\n.card[href]:hover,\n.card[tabindex]:active,\n.card[tabindex]:focus,\n.card[tabindex]:hover {\n  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 3px rgba(0, 0, 0, 0.12), 0 4px 15px 0 rgba(0, 0, 0, 0.2);\n  text-decoration: none;\n}\n\n.card[href]:focus,\n.card[tabindex]:focus {\n  outline: 0;\n}\n\n.card.border-primary {\n  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.14), 0 3px 4px 0 rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2), inset 0 0 0 1px #9c27b0;\n}\n\n.card.border-primary[href]:active,\n.card.border-primary[href]:focus,\n.card.border-primary[href]:hover,\n.card.border-primary[tabindex]:active,\n.card.border-primary[tabindex]:focus,\n.card.border-primary[tabindex]:hover {\n  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 3px rgba(0, 0, 0, 0.12), 0 4px 15px 0 rgba(0, 0, 0, 0.2), inset 0 0 0 1px #9c27b0;\n}\n\n.card.border-secondary {\n  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.14), 0 3px 4px 0 rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2), inset 0 0 0 1px #ff4081;\n}\n\n.card.border-secondary[href]:active,\n.card.border-secondary[href]:focus,\n.card.border-secondary[href]:hover,\n.card.border-secondary[tabindex]:active,\n.card.border-secondary[tabindex]:focus,\n.card.border-secondary[tabindex]:hover {\n  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 3px rgba(0, 0, 0, 0.12), 0 4px 15px 0 rgba(0, 0, 0, 0.2), inset 0 0 0 1px #ff4081;\n}\n\n.card.border-danger {\n  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.14), 0 3px 4px 0 rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2), inset 0 0 0 1px #f44336;\n}\n\n.card.border-danger[href]:active,\n.card.border-danger[href]:focus,\n.card.border-danger[href]:hover,\n.card.border-danger[tabindex]:active,\n.card.border-danger[tabindex]:focus,\n.card.border-danger[tabindex]:hover {\n  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 3px rgba(0, 0, 0, 0.12), 0 4px 15px 0 rgba(0, 0, 0, 0.2), inset 0 0 0 1px #f44336;\n}\n\n.card.border-info {\n  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.14), 0 3px 4px 0 rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2), inset 0 0 0 1px #2196f3;\n}\n\n.card.border-info[href]:active,\n.card.border-info[href]:focus,\n.card.border-info[href]:hover,\n.card.border-info[tabindex]:active,\n.card.border-info[tabindex]:focus,\n.card.border-info[tabindex]:hover {\n  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 3px rgba(0, 0, 0, 0.12), 0 4px 15px 0 rgba(0, 0, 0, 0.2), inset 0 0 0 1px #2196f3;\n}\n\n.card.border-success {\n  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.14), 0 3px 4px 0 rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2), inset 0 0 0 1px #4caf50;\n}\n\n.card.border-success[href]:active,\n.card.border-success[href]:focus,\n.card.border-success[href]:hover,\n.card.border-success[tabindex]:active,\n.card.border-success[tabindex]:focus,\n.card.border-success[tabindex]:hover {\n  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 3px rgba(0, 0, 0, 0.12), 0 4px 15px 0 rgba(0, 0, 0, 0.2), inset 0 0 0 1px #4caf50;\n}\n\n.card.border-warning {\n  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.14), 0 3px 4px 0 rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2), inset 0 0 0 1px #ff9800;\n}\n\n.card.border-warning[href]:active,\n.card.border-warning[href]:focus,\n.card.border-warning[href]:hover,\n.card.border-warning[tabindex]:active,\n.card.border-warning[tabindex]:focus,\n.card.border-warning[tabindex]:hover {\n  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 3px rgba(0, 0, 0, 0.12), 0 4px 15px 0 rgba(0, 0, 0, 0.2), inset 0 0 0 1px #ff9800;\n}\n\n.card.border-dark {\n  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.14), 0 3px 4px 0 rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2), inset 0 0 0 1px #424242;\n}\n\n.card.border-dark[href]:active,\n.card.border-dark[href]:focus,\n.card.border-dark[href]:hover,\n.card.border-dark[tabindex]:active,\n.card.border-dark[tabindex]:focus,\n.card.border-dark[tabindex]:hover {\n  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 3px rgba(0, 0, 0, 0.12), 0 4px 15px 0 rgba(0, 0, 0, 0.2), inset 0 0 0 1px #424242;\n}\n\n.card.border-light {\n  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.14), 0 3px 4px 0 rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2), inset 0 0 0 1px #f5f5f5;\n}\n\n.card.border-light[href]:active,\n.card.border-light[href]:focus,\n.card.border-light[href]:hover,\n.card.border-light[tabindex]:active,\n.card.border-light[tabindex]:focus,\n.card.border-light[tabindex]:hover {\n  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 3px rgba(0, 0, 0, 0.12), 0 4px 15px 0 rgba(0, 0, 0, 0.2), inset 0 0 0 1px #f5f5f5;\n}\n\n.card-actions {\n  align-items: flex-start;\n  display: flex;\n  padding: 0.25rem 0.25rem;\n}\n\n.card-actions:first-child {\n  border-top-left-radius: 2px;\n  border-top-right-radius: 2px;\n}\n\n.card-actions:last-child {\n  border-bottom-right-radius: 2px;\n  border-bottom-left-radius: 2px;\n}\n\n.card-actions .btn {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  flex: 0 1 auto;\n  margin: 0.25rem 0.25rem;\n  min-width: 0;\n  padding-right: 0.5rem;\n  padding-left: 0.5rem;\n}\n\n.card-body {\n  flex: 1 1 auto;\n  padding: 1rem 1rem;\n}\n\n.card-body:first-child,\n.card-header[class*='border-'] + .card-body,\n.card-img-top + .card-body,\n.list-group + .card-body {\n  padding-top: 1.5rem;\n}\n\n.card-body:first-child {\n  border-top-left-radius: 2px;\n  border-top-right-radius: 2px;\n}\n\n.card-body:last-child {\n  border-bottom-right-radius: 2px;\n  border-bottom-left-radius: 2px;\n  padding-bottom: 1.5rem;\n}\n\n.card-header:not([class*='border-']) + .card-body {\n  padding-top: 0;\n}\n\n.card-body > :last-child {\n  margin-bottom: 0;\n}\n\n.card-body + .card-img-bottom,\n.card-body + .list-group {\n  margin-top: 0.5rem;\n}\n\n.card-footer {\n  padding: 1rem 1rem;\n}\n\n.card-footer.border-primary {\n  border-top: 1px solid #9c27b0;\n}\n\n.card-footer.border-secondary {\n  border-top: 1px solid #ff4081;\n}\n\n.card-footer.border-danger {\n  border-top: 1px solid #f44336;\n}\n\n.card-footer.border-info {\n  border-top: 1px solid #2196f3;\n}\n\n.card-footer.border-success {\n  border-top: 1px solid #4caf50;\n}\n\n.card-footer.border-warning {\n  border-top: 1px solid #ff9800;\n}\n\n.card-footer.border-dark {\n  border-top: 1px solid #424242;\n}\n\n.card-footer.border-light {\n  border-top: 1px solid #f5f5f5;\n}\n\n.card-footer:first-child {\n  border-top-left-radius: 2px;\n  border-top-right-radius: 2px;\n  border-top: 0;\n}\n\n.card-footer:last-child {\n  border-bottom-right-radius: 2px;\n  border-bottom-left-radius: 2px;\n}\n\n.card-body + .card-footer:not[class*='border-'],\n.card-header + .card-footer:not[class*='border-'] {\n  padding-top: 0;\n}\n\n.card-body + .card-footer[class*='border-'],\n.card-header + .card-footer[class*='border-'] {\n  margin-top: 0.5rem;\n}\n\n.card-header[class*='border-'] + .card-footer[class*='border-'] {\n  margin-top: -1px;\n}\n\n.card-footer > :last-child {\n  margin-bottom: 0;\n}\n\n.card-header {\n  margin-bottom: 0;\n  padding: 1rem 1rem;\n}\n\n.card-header.border-primary {\n  border-bottom: 1px solid #9c27b0;\n}\n\n.card-header.border-secondary {\n  border-bottom: 1px solid #ff4081;\n}\n\n.card-header.border-danger {\n  border-bottom: 1px solid #f44336;\n}\n\n.card-header.border-info {\n  border-bottom: 1px solid #2196f3;\n}\n\n.card-header.border-success {\n  border-bottom: 1px solid #4caf50;\n}\n\n.card-header.border-warning {\n  border-bottom: 1px solid #ff9800;\n}\n\n.card-header.border-dark {\n  border-bottom: 1px solid #424242;\n}\n\n.card-header.border-light {\n  border-bottom: 1px solid #f5f5f5;\n}\n\n.card-header:first-child,\n.card-img-top + .card-header,\n.list-group + .card-header {\n  padding-top: 1.5rem;\n}\n\n.card-header:first-child {\n  border-top-left-radius: 2px;\n  border-top-right-radius: 2px;\n}\n\n.card-header:last-child {\n  border-bottom-right-radius: 2px;\n  border-bottom-left-radius: 2px;\n  border-bottom: 0;\n  padding-bottom: 1.5rem;\n}\n\n.card-header:not([class*='border-']) + .card-img-bottom,\n.card-header:not([class*='border-']) + .list-group {\n  margin-top: 0.5rem;\n}\n\n.card-header[class*='border-'] {\n  padding-top: 1.5rem;\n  padding-bottom: 1.5rem;\n}\n\n.card-header-pills {\n  margin: -1rem -1rem 0;\n  padding: 0.25rem 0.25rem;\n}\n\n.card-header:first-child .card-header-pills,\n.card-header[class*='border-'] .card-header-pills,\n.card-img-top + .card-header .card-header-pills {\n  margin-top: -1.5rem;\n}\n\n.card-header:last-child .card-header-pills,\n.card-header[class*='border-'] .card-header-pills {\n  margin-bottom: -1.5rem;\n}\n\n.card-header-pills .nav-link {\n  margin: 0.25rem 0.25rem;\n  padding-right: 0.5rem;\n  padding-left: 0.5rem;\n}\n\n.card-header-tabs {\n  margin-top: -1rem;\n  margin-right: -1rem;\n  margin-bottom: 0.5rem;\n  margin-left: -1rem;\n}\n\n.card-header:first-child .card-header-tabs,\n.card-header[class*='border-'] .card-header-tabs,\n.card-img-top + .card-header .card-header-tabs,\n.list-group + .card-header .card-header-tabs {\n  margin-top: -1.5rem;\n}\n\n.card-header[class*='border-'] .card-header-tabs,\n.card-header:last-child .card-header-tabs {\n  margin-bottom: -1.5rem;\n}\n\n.card-img {\n  border-radius: 2px;\n}\n\n.card-img-bottom {\n  border-bottom-right-radius: 2px;\n  border-bottom-left-radius: 2px;\n}\n\n.card-img-top {\n  border-top-left-radius: 2px;\n  border-top-right-radius: 2px;\n}\n\n.card-img-overlay {\n  max-height: 100%;\n  padding: 1.5rem 1rem;\n  position: absolute;\n  right: 0;\n  bottom: 0;\n  left: 0;\n}\n\n.card-columns {\n  column-count: 2;\n  column-gap: 0.5rem;\n  margin-top: -0.25rem;\n  margin-bottom: 0.25rem;\n}\n\n@media (min-width: 960px) {\n  .card-columns {\n    column-count: 3;\n  }\n}\n\n.card-columns .card {\n  display: inline-flex;\n  margin-top: 0.25rem;\n  margin-bottom: 0.25rem;\n  width: 100%;\n}\n\n@media (min-width: 600px) {\n  .card-deck {\n    display: flex;\n    flex-flow: row wrap;\n    margin-right: -0.25rem;\n    margin-left: -0.25rem;\n  }\n}\n\n.card-deck .card {\n  margin-bottom: 0.5rem;\n}\n\n@media (min-width: 600px) {\n  .card-deck .card {\n    flex: 1 0 0;\n    margin-right: 0.25rem;\n    margin-left: 0.25rem;\n  }\n}\n\n@media (min-width: 600px) {\n  .card-group {\n    display: flex;\n    flex-flow: row wrap;\n  }\n}\n\n.card-group .card {\n  box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.14), 0 2px 2px 0 rgba(0, 0, 0, 0.12), 0 1px 3px 0 rgba(0, 0, 0, 0.2);\n  margin-bottom: 0.5rem;\n}\n\n@media (min-width: 600px) {\n  .card-group .card {\n    flex: 1 0 0;\n  }\n\n  .card-group .card:first-child:not(:last-child) {\n    border-top-right-radius: 0;\n    border-bottom-right-radius: 0;\n  }\n\n  .card-group .card:first-child:not(:last-child) .card-actions,\n  .card-group .card:first-child:not(:last-child) .card-body,\n  .card-group .card:first-child:not(:last-child) .card-footer,\n  .card-group .card:first-child:not(:last-child) .card-header,\n  .card-group .card:first-child:not(:last-child) .card-img,\n  .card-group .card:first-child:not(:last-child) .card-img-bottom,\n  .card-group .card:first-child:not(:last-child) .card-img-top {\n    border-top-right-radius: 0;\n    border-bottom-right-radius: 0;\n  }\n\n  .card-group .card:last-child:not(:first-child) {\n    border-bottom-left-radius: 0;\n    border-top-left-radius: 0;\n  }\n\n  .card-group .card:last-child:not(:first-child) .card-actions,\n  .card-group .card:last-child:not(:first-child) .card-body,\n  .card-group .card:last-child:not(:first-child) .card-footer,\n  .card-group .card:last-child:not(:first-child) .card-header,\n  .card-group .card:last-child:not(:first-child) .card-img,\n  .card-group .card:last-child:not(:first-child) .card-img-bottom,\n  .card-group .card:last-child:not(:first-child) .card-img-top {\n    border-bottom-left-radius: 0;\n    border-top-left-radius: 0;\n  }\n\n  .card-group .card:not(:first-child):not(:last-child) {\n    border-radius: 0;\n  }\n\n  .card-group .card:not(:first-child):not(:last-child) .card-actions,\n  .card-group .card:not(:first-child):not(:last-child) .card-body,\n  .card-group .card:not(:first-child):not(:last-child) .card-footer,\n  .card-group .card:not(:first-child):not(:last-child) .card-header,\n  .card-group .card:not(:first-child):not(:last-child) .card-img,\n  .card-group .card:not(:first-child):not(:last-child) .card-img-bottom,\n  .card-group .card:not(:first-child):not(:last-child) .card-img-top {\n    border-radius: 0;\n  }\n}\n\n.card-link:active,\n.card-link:focus,\n.card-link:hover {\n  text-decoration: none;\n}\n\n.card-link + .card-link {\n  margin-left: 1rem;\n}\n\n.card-subtitle {\n  font-size: 0.875rem;\n  font-weight: 400;\n  letter-spacing: 0;\n  line-height: 1.42857;\n  margin-top: -1rem;\n  margin-bottom: 0;\n}\n\n.card-text:last-child {\n  margin-bottom: 0;\n}\n\n.card-title {\n  font-size: 1.5rem;\n  font-weight: 400;\n  letter-spacing: 0;\n  line-height: 1.33333;\n  margin-bottom: 1rem;\n}\n\n.card-title:last-child {\n  margin-bottom: 0;\n}\n\n.chip {\n  align-items: center;\n  background-color: #e0e0e0;\n  border: 0;\n  border-radius: 1rem;\n  color: rgba(0, 0, 0, 0.87);\n  display: inline-flex;\n  font-size: 0.875rem;\n  font-weight: 400;\n  height: 2rem;\n  justify-content: center;\n  line-height: 1;\n  padding-right: 0.75rem;\n  padding-left: 0.75rem;\n  position: relative;\n  text-align: center;\n  vertical-align: middle;\n  white-space: nowrap;\n}\n\n.chip:empty {\n  display: none;\n}\n\n.chip .close {\n  font-size: inherit;\n  line-height: inherit;\n  margin-right: -0.5rem;\n  margin-left: 0.25rem;\n  min-width: 1.5rem;\n  order: 1;\n}\n\n.chip-primary {\n  color: white;\n  background-color: #9c27b0;\n}\n\n.chip-secondary {\n  color: white;\n  background-color: #ff4081;\n}\n\n.chip-danger {\n  color: white;\n  background-color: #f44336;\n}\n\n.chip-info {\n  color: white;\n  background-color: #2196f3;\n}\n\n.chip-success {\n  color: white;\n  background-color: #4caf50;\n}\n\n.chip-warning {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #ff9800;\n}\n\n.chip-dark {\n  color: white;\n  background-color: #424242;\n}\n\n.chip-light {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #f5f5f5;\n}\n\n.chip-action {\n  transition-duration: 0.3s;\n  transition-property: background-color, box-shadow;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n@media (min-width: 600px) {\n  .chip-action {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .chip-action {\n    transition-duration: 0.2s;\n  }\n}\n\n.chip-action:active,\n.chip-action:focus,\n.chip-action:hover {\n  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.14), 0 3px 4px 0 rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);\n  color: rgba(0, 0, 0, 0.87);\n  text-decoration: none;\n}\n\n.chip-action:active {\n  background-color: #bdbdbd;\n}\n\n.chip-action:focus {\n  outline: 0;\n}\n\n.chip-icon {\n  color: white;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  align-items: center;\n  background-color: #ff4081;\n  border-radius: 1rem;\n  display: inline-flex;\n  flex-shrink: 0;\n  font-size: 1rem;\n  font-style: normal;\n  font-weight: normal;\n  height: 2rem;\n  justify-content: center;\n  margin-right: 0.5rem;\n  margin-left: -0.75rem;\n  order: -1;\n  text-align: center;\n  width: 2rem;\n}\n\n.chip-img {\n  border-radius: 1rem;\n  flex-shrink: 0;\n  height: 2rem;\n  margin-right: 0.5rem;\n  margin-left: -0.75rem;\n  order: -1;\n  width: auto;\n}\n\n.table {\n  background-color: #ffffff;\n  border: 0;\n  margin-bottom: 1rem;\n  max-width: 100%;\n  width: 100%;\n}\n\n.table td,\n.table th {\n  border-top: 1px solid #e1e1e1;\n  line-height: 1.42857;\n  padding-right: 1.75rem;\n  padding-left: 1.75rem;\n  vertical-align: top;\n}\n\n.table td:first-child,\n.table th:first-child {\n  padding-left: 1.5rem;\n}\n\n.table td:last-child,\n.table th:last-child {\n  padding-right: 1.5rem;\n}\n\n.table tbody td,\n.table tbody th {\n  color: rgba(0, 0, 0, 0.87);\n  font-size: 0.8125rem;\n  font-weight: 400;\n  height: 3rem;\n  padding-top: 0.91964rem;\n  padding-bottom: 0.91964rem;\n}\n\n.table tfoot td,\n.table tfoot th {\n  color: rgba(0, 0, 0, 0.54);\n  font-size: 0.75rem;\n  font-weight: 400;\n  height: 3.5rem;\n  padding-top: 1.21429rem;\n  padding-bottom: 1.21429rem;\n}\n\n.table thead td,\n.table thead th {\n  color: rgba(0, 0, 0, 0.54);\n  font-size: 0.75rem;\n  font-weight: 500;\n  height: 3.5rem;\n  padding-top: 1.21429rem;\n  padding-bottom: 1.21429rem;\n}\n\n.table > tbody:first-child > tr:first-child td,\n.table > tbody:first-child > tr:first-child th,\n.table > tfoot:first-child > tr:first-child td,\n.table > tfoot:first-child > tr:first-child th,\n.table > thead:first-child > tr:first-child td,\n.table > thead:first-child > tr:first-child th {\n  border-top: 0;\n}\n\n.table .table {\n  border-top: 1px solid #e1e1e1;\n}\n\n.table-bordered {\n  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.14), 0 3px 4px 0 rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);\n}\n\n.table-striped tbody tr:nth-of-type(odd) {\n  background-color: #f5f5f5;\n}\n\n.table-hover tbody tr:hover {\n  background-color: #eeeeee;\n}\n\n.table-sm td,\n.table-sm th {\n  padding-right: 1rem;\n  padding-left: 1rem;\n}\n\n.table-sm td:first-child,\n.table-sm th:first-child {\n  padding-left: 1rem;\n}\n\n.table-sm td:last-child,\n.table-sm th:last-child {\n  padding-right: 1rem;\n}\n\n.table-sm tbody td,\n.table-sm tbody th {\n  height: 2.25rem;\n  padding-top: 0.54464rem;\n  padding-bottom: 0.54464rem;\n}\n\n.table-sm tfoot td,\n.table-sm tfoot th {\n  padding-top: 0.71429rem;\n  padding-bottom: 0.71429rem;\n}\n\n.table-sm thead td,\n.table-sm thead th {\n  height: 2.5rem;\n  padding-top: 0.71429rem;\n  padding-bottom: 0.71429rem;\n}\n\n.table .table-primary,\n.table .table-primary > td,\n.table .table-primary > th {\n  color: white;\n  background-color: #9c27b0;\n}\n\n.table-hover .table-primary:hover,\n.table-hover .table-primary:hover > td,\n.table-hover .table-primary:hover > th {\n  color: white;\n  background-color: #7b1fa2;\n}\n\n.table .table-secondary,\n.table .table-secondary > td,\n.table .table-secondary > th {\n  color: white;\n  background-color: #ff4081;\n}\n\n.table-hover .table-secondary:hover,\n.table-hover .table-secondary:hover > td,\n.table-hover .table-secondary:hover > th {\n  color: white;\n  background-color: #f50057;\n}\n\n.table .table-danger,\n.table .table-danger > td,\n.table .table-danger > th {\n  color: white;\n  background-color: #f44336;\n}\n\n.table-hover .table-danger:hover,\n.table-hover .table-danger:hover > td,\n.table-hover .table-danger:hover > th {\n  color: white;\n  background-color: #d32f2f;\n}\n\n.table .table-info,\n.table .table-info > td,\n.table .table-info > th {\n  color: white;\n  background-color: #2196f3;\n}\n\n.table-hover .table-info:hover,\n.table-hover .table-info:hover > td,\n.table-hover .table-info:hover > th {\n  color: white;\n  background-color: #1976d2;\n}\n\n.table .table-success,\n.table .table-success > td,\n.table .table-success > th {\n  color: white;\n  background-color: #4caf50;\n}\n\n.table-hover .table-success:hover,\n.table-hover .table-success:hover > td,\n.table-hover .table-success:hover > th {\n  color: white;\n  background-color: #388e3c;\n}\n\n.table .table-warning,\n.table .table-warning > td,\n.table .table-warning > th {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #ff9800;\n}\n\n.table-hover .table-warning:hover,\n.table-hover .table-warning:hover > td,\n.table-hover .table-warning:hover > th {\n  color: white;\n  background-color: #f57c00;\n}\n\n.table .table-dark,\n.table .table-dark > td,\n.table .table-dark > th {\n  color: white;\n  background-color: #424242;\n}\n\n.table-hover .table-dark:hover,\n.table-hover .table-dark:hover > td,\n.table-hover .table-dark:hover > th {\n  color: white;\n  background-color: #212121;\n}\n\n.table .table-light,\n.table .table-light > td,\n.table .table-light > th {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #f5f5f5;\n}\n\n.table-hover .table-light:hover,\n.table-hover .table-light:hover > td,\n.table-hover .table-light:hover > th {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #e0e0e0;\n}\n\n.table .thead-dark td,\n.table .thead-dark th {\n  background-color: #424242;\n  color: white;\n}\n\n.table .thead-light td,\n.table .thead-light th {\n  background-color: #f5f5f5;\n  color: rgba(0, 0, 0, 0.54);\n}\n\n.table-dark {\n  background-color: #424242;\n  color: white;\n}\n\n.table-dark tbody td,\n.table-dark tbody th,\n.table-dark tfoot td,\n.table-dark tfoot th,\n.table-dark thead td,\n.table-dark thead th {\n  color: inherit;\n}\n\n.table-dark td,\n.table-dark th {\n  border-color: #303030;\n}\n\n.table-dark.table-striped tbody tr:nth-of-type(odd) {\n  background-color: #303030;\n}\n\n.table-dark.table-hover tbody tr:hover {\n  background-color: #212121;\n}\n\n.table-responsive {\n  display: block;\n  overflow-x: auto;\n  width: 100%;\n  -ms-overflow-style: -ms-autohiding-scrollbar;\n}\n\n.modal {\n  display: none;\n  outline: 0;\n  overflow: hidden;\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  text-align: center;\n  white-space: nowrap;\n  z-index: 240;\n}\n\n.modal::before {\n  content: '';\n  display: inline-block;\n  height: 100%;\n  margin-right: -.25em;\n  vertical-align: middle;\n  width: 1px;\n}\n\n.modal.fade {\n  transition-duration: 0.375s;\n  transition-property: opacity;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n@media (min-width: 600px) {\n  .modal.fade {\n    transition-duration: 0.4875s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .modal.fade {\n    transition-duration: 0.25s;\n  }\n}\n\n.modal.fade .modal-dialog {\n  transition-duration: 0.375s;\n  transition-property: transform;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transform: scale(0.87);\n}\n\n@media (min-width: 600px) {\n  .modal.fade .modal-dialog {\n    transition-duration: 0.4875s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .modal.fade .modal-dialog {\n    transition-duration: 0.25s;\n  }\n}\n\n.modal.show .modal-dialog {\n  transform: scale(1);\n}\n\n.modal-open {\n  overflow: hidden;\n}\n\n.modal-open .modal {\n  overflow-x: hidden;\n  overflow-y: auto;\n}\n\n.modal-backdrop {\n  background-color: rgba(0, 0, 0, 0.38);\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 239;\n}\n\n.modal-dialog {\n  text-align: left;\n  text-align: start;\n  display: inline-block;\n  margin: 1.5rem 1.5rem;\n  max-width: 35rem;\n  position: relative;\n  vertical-align: middle;\n  white-space: normal;\n  width: calc(100% - 1.5rem * 2);\n}\n\n[dir='rtl'] .modal-dialog {\n  text-align: right;\n  text-align: start;\n}\n\n.modal-lg {\n  max-width: 52.5rem;\n}\n\n.modal-sm {\n  max-width: 17.5rem;\n}\n\n.modal-body {\n  flex: 1 1 auto;\n  padding: 1.25rem 1.5rem;\n  position: relative;\n}\n\n.modal-header + .modal-body {\n  padding-top: 0;\n}\n\n.modal-body > :last-child {\n  margin-bottom: 0;\n}\n\n.modal-content {\n  border-radius: 2px;\n  background-clip: padding-box;\n  background-color: #ffffff;\n  box-shadow: 0 24px 38px 3px rgba(0, 0, 0, 0.14), 0 9px 46px 8px rgba(0, 0, 0, 0.12), 0 11px 15px 0 rgba(0, 0, 0, 0.2);\n  display: flex;\n  flex-direction: column;\n  outline: 0;\n  position: relative;\n  vertical-align: baseline;\n}\n\n.modal-footer {\n  align-items: center;\n  display: flex;\n  justify-content: flex-end;\n  padding: 0.5rem 0.25rem 0.5rem 1.25rem;\n}\n\n.modal-footer > * {\n  margin-right: 0.25rem;\n  margin-left: 0.25rem;\n}\n\n.modal-footer .btn {\n  background-color: transparent;\n  box-shadow: none;\n  min-width: 4rem;\n  padding-right: 0.5rem;\n  padding-left: 0.5rem;\n}\n\n.modal-footer .btn:active,\n.modal-footer .btn.active {\n  background-color: rgba(153, 153, 153, 0.4);\n  box-shadow: none;\n}\n\n.modal-footer .btn:disabled,\n.modal-footer .btn.disabled {\n  background-color: transparent;\n}\n\n.modal-footer .btn-primary,\n.modal-footer .btn-primary:active,\n.modal-footer .btn-primary:focus,\n.modal-footer .btn-primary:hover {\n  color: #9c27b0;\n}\n\n.modal-footer .btn-primary:disabled,\n.modal-footer .btn-primary.disabled {\n  color: rgba(0, 0, 0, 0.26);\n}\n\n.modal-footer .btn-secondary,\n.modal-footer .btn-secondary:active,\n.modal-footer .btn-secondary:focus,\n.modal-footer .btn-secondary:hover {\n  color: #ff4081;\n}\n\n.modal-footer .btn-secondary:disabled,\n.modal-footer .btn-secondary.disabled {\n  color: rgba(0, 0, 0, 0.26);\n}\n\n.modal-footer .btn-danger,\n.modal-footer .btn-danger:active,\n.modal-footer .btn-danger:focus,\n.modal-footer .btn-danger:hover {\n  color: #f44336;\n}\n\n.modal-footer .btn-danger:disabled,\n.modal-footer .btn-danger.disabled {\n  color: rgba(0, 0, 0, 0.26);\n}\n\n.modal-footer .btn-info,\n.modal-footer .btn-info:active,\n.modal-footer .btn-info:focus,\n.modal-footer .btn-info:hover {\n  color: #2196f3;\n}\n\n.modal-footer .btn-info:disabled,\n.modal-footer .btn-info.disabled {\n  color: rgba(0, 0, 0, 0.26);\n}\n\n.modal-footer .btn-success,\n.modal-footer .btn-success:active,\n.modal-footer .btn-success:focus,\n.modal-footer .btn-success:hover {\n  color: #4caf50;\n}\n\n.modal-footer .btn-success:disabled,\n.modal-footer .btn-success.disabled {\n  color: rgba(0, 0, 0, 0.26);\n}\n\n.modal-footer .btn-warning,\n.modal-footer .btn-warning:active,\n.modal-footer .btn-warning:focus,\n.modal-footer .btn-warning:hover {\n  color: #ff9800;\n}\n\n.modal-footer .btn-warning:disabled,\n.modal-footer .btn-warning.disabled {\n  color: rgba(0, 0, 0, 0.26);\n}\n\n.modal-footer .btn-dark,\n.modal-footer .btn-dark:active,\n.modal-footer .btn-dark:focus,\n.modal-footer .btn-dark:hover {\n  color: #424242;\n}\n\n.modal-footer .btn-dark:disabled,\n.modal-footer .btn-dark.disabled {\n  color: rgba(0, 0, 0, 0.26);\n}\n\n.modal-footer .btn-light,\n.modal-footer .btn-light:active,\n.modal-footer .btn-light:focus,\n.modal-footer .btn-light:hover {\n  color: #f5f5f5;\n}\n\n.modal-footer .btn-light:disabled,\n.modal-footer .btn-light.disabled {\n  color: rgba(0, 0, 0, 0.26);\n}\n\n.modal-header {\n  align-items: center;\n  display: flex;\n  justify-content: space-between;\n  padding: 1.25rem 1.5rem;\n}\n\n.modal-title {\n  font-size: 1.25rem;\n  font-weight: 500;\n  letter-spacing: 0.02em;\n  line-height: 1.4;\n  margin: 0;\n}\n\n.modal-scrollbar-measure {\n  height: 50px;\n  overflow: scroll;\n  position: absolute;\n  top: -99999px;\n  width: 50px;\n}\n\n.list-group {\n  display: flex;\n  flex-direction: column;\n  margin-bottom: 0;\n  padding-left: 0;\n}\n\n.list-group-item {\n  transition-duration: 0.3s;\n  transition-property: background-color, color;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  background-color: #ffffff;\n  border: 0;\n  box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.14), 0 2px 2px 0 rgba(0, 0, 0, 0.12), 0 1px 3px 0 rgba(0, 0, 0, 0.2);\n  color: rgba(0, 0, 0, 0.87);\n  display: block;\n  font-size: 0.9375rem;\n  line-height: 1.42857;\n  min-height: 3rem;\n  padding: 0.83036rem 1.5rem;\n  position: relative;\n}\n\n@media (min-width: 600px) {\n  .list-group-item {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .list-group-item {\n    transition-duration: 0.2s;\n  }\n}\n\n.list-group-item:active,\n.list-group-item:focus,\n.list-group-item:hover {\n  color: rgba(0, 0, 0, 0.87);\n  text-decoration: none;\n}\n\n.list-group-item:disabled,\n.list-group-item.disabled {\n  background-color: #ffffff;\n  color: rgba(0, 0, 0, 0.38);\n}\n\n.list-group-item:first-child {\n  border-top-left-radius: 2px;\n  border-top-right-radius: 2px;\n}\n\n.list-group-item:last-child {\n  border-bottom-right-radius: 2px;\n  border-bottom-left-radius: 2px;\n}\n\n.list-group-item.active {\n  background-color: #eeeeee;\n  color: rgba(0, 0, 0, 0.87);\n}\n\n.card .list-group-item {\n  padding-right: 1rem;\n  padding-left: 1rem;\n}\n\n.list-group-item-action {\n  color: rgba(0, 0, 0, 0.87);\n  text-align: inherit;\n  width: 100%;\n}\n\n.list-group-item-action:active,\n.list-group-item-action:focus,\n.list-group-item-action:hover {\n  background-color: #eeeeee;\n  color: rgba(0, 0, 0, 0.87);\n}\n\n.list-group-item-action:disabled,\n.list-group-item-action.disabled {\n  background-color: #ffffff;\n  color: rgba(0, 0, 0, 0.38);\n}\n\n.list-group-item-action:focus {\n  outline: 0;\n}\n\n.list-group-item-primary {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #e1bee7;\n}\n\n.list-group-item-primary.active {\n  color: white;\n  background-color: #9c27b0;\n}\n\n.list-group-item-primary.list-group-item-action:active,\n.list-group-item-primary.list-group-item-action:focus,\n.list-group-item-primary.list-group-item-action:hover {\n  color: white;\n  background-color: #9c27b0;\n}\n\n.list-group-item-secondary {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #ff80ab;\n}\n\n.list-group-item-secondary.active {\n  color: white;\n  background-color: #ff4081;\n}\n\n.list-group-item-secondary.list-group-item-action:active,\n.list-group-item-secondary.list-group-item-action:focus,\n.list-group-item-secondary.list-group-item-action:hover {\n  color: white;\n  background-color: #ff4081;\n}\n\n.list-group-item-danger {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #ffcdd2;\n}\n\n.list-group-item-danger.active {\n  color: white;\n  background-color: #f44336;\n}\n\n.list-group-item-danger.list-group-item-action:active,\n.list-group-item-danger.list-group-item-action:focus,\n.list-group-item-danger.list-group-item-action:hover {\n  color: white;\n  background-color: #f44336;\n}\n\n.list-group-item-info {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #bbdefb;\n}\n\n.list-group-item-info.active {\n  color: white;\n  background-color: #2196f3;\n}\n\n.list-group-item-info.list-group-item-action:active,\n.list-group-item-info.list-group-item-action:focus,\n.list-group-item-info.list-group-item-action:hover {\n  color: white;\n  background-color: #2196f3;\n}\n\n.list-group-item-success {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #c8e6c9;\n}\n\n.list-group-item-success.active {\n  color: white;\n  background-color: #4caf50;\n}\n\n.list-group-item-success.list-group-item-action:active,\n.list-group-item-success.list-group-item-action:focus,\n.list-group-item-success.list-group-item-action:hover {\n  color: white;\n  background-color: #4caf50;\n}\n\n.list-group-item-warning {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #ffe0b2;\n}\n\n.list-group-item-warning.active {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #ff9800;\n}\n\n.list-group-item-warning.list-group-item-action:active,\n.list-group-item-warning.list-group-item-action:focus,\n.list-group-item-warning.list-group-item-action:hover {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #ff9800;\n}\n\n.list-group-item-dark {\n  color: white;\n  background-color: #757575;\n}\n\n.list-group-item-dark.active {\n  color: white;\n  background-color: #424242;\n}\n\n.list-group-item-dark.list-group-item-action:active,\n.list-group-item-dark.list-group-item-action:focus,\n.list-group-item-dark.list-group-item-action:hover {\n  color: white;\n  background-color: #424242;\n}\n\n.list-group-item-light {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #fafafa;\n}\n\n.list-group-item-light.active {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #f5f5f5;\n}\n\n.list-group-item-light.list-group-item-action:active,\n.list-group-item-light.list-group-item-action:focus,\n.list-group-item-light.list-group-item-action:hover {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #f5f5f5;\n}\n\n.list-group-flush .list-group-item {\n  border-top: 1px solid rgba(0, 0, 0, 0.12);\n  border-radius: 0;\n  box-shadow: none;\n}\n\n.list-group-flush .list-group-item:last-child {\n  border-bottom: 1px solid rgba(0, 0, 0, 0.12);\n}\n\n.list-group-flush:first-child .list-group-item:first-child {\n  border-top: 0;\n}\n\n.list-group-flush:last-child .list-group-item:last-child {\n  border-bottom: 0;\n}\n\n.dropdown,\n.dropup {\n  position: relative;\n}\n\n.dropdown-menu {\n  border-bottom-right-radius: 2px;\n  border-bottom-left-radius: 2px;\n  text-align: left;\n  text-align: start;\n  background-color: transparent;\n  color: inherit;\n  display: none;\n  float: left;\n  font-size: 1rem;\n  line-height: 1.5rem;\n  list-style: none;\n  margin: 0;\n  min-width: 7rem;\n  padding: 0.5rem 0;\n  position: absolute;\n  z-index: 80;\n}\n\n[dir='rtl'] .dropdown-menu {\n  text-align: right;\n  text-align: start;\n}\n\n.dropdown-menu::before {\n  border-bottom-right-radius: 2px;\n  border-bottom-left-radius: 2px;\n  background-clip: padding-box;\n  background-color: #ffffff;\n  box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 3px rgba(0, 0, 0, 0.12), 0 4px 15px 0 rgba(0, 0, 0, 0.2);\n  content: '';\n  display: block;\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  transform-origin: 0 0;\n  z-index: -1;\n}\n\n.dropdown-menu.show {\n  display: block;\n}\n\n.dropdown-menu.show::before,\n.dropdown-menu.show > * {\n  animation-duration: 0.3s;\n  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n@media (min-width: 600px) {\n  .dropdown-menu.show::before,\n  .dropdown-menu.show > * {\n    animation-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .dropdown-menu.show::before,\n  .dropdown-menu.show > * {\n    animation-duration: 0.2s;\n  }\n}\n\n.dropdown-menu.show::before {\n  animation-name: dropdown-menu-show;\n}\n\n.dropdown-menu.show > * {\n  animation-name: dropdown-item-show;\n}\n\n.dropdown-menu.show > :nth-child(1) {\n  animation-name: dropdown-item-show-1;\n}\n\n.dropdown-menu.show > :nth-child(2) {\n  animation-name: dropdown-item-show-2;\n}\n\n.dropdown-menu.show > :nth-child(3) {\n  animation-name: dropdown-item-show-3;\n}\n\n.nav:not(.flex-column):not(.flex-column-reverse) .dropdown-menu {\n  min-width: 100%;\n}\n\n.menu {\n  border-radius: 2px;\n  margin-top: -2.75rem;\n}\n\n.menu::before {\n  border-radius: 2px;\n  transform-origin: 0 2rem;\n}\n\n.show > a {\n  outline: 0;\n}\n\n@keyframes dropdown-item-show {\n  0% {\n    opacity: 0;\n  }\n\n  99% {\n    opacity: 0;\n  }\n\n  100% {\n    opacity: 1;\n  }\n}\n\n@keyframes dropdown-item-show-1 {\n  0% {\n    opacity: 0;\n  }\n\n  40% {\n    opacity: 0;\n  }\n\n  100% {\n    opacity: 1;\n  }\n}\n\n@keyframes dropdown-item-show-2 {\n  0% {\n    opacity: 0;\n  }\n\n  60% {\n    opacity: 0;\n  }\n\n  100% {\n    opacity: 1;\n  }\n}\n\n@keyframes dropdown-item-show-3 {\n  0% {\n    opacity: 0;\n  }\n\n  80% {\n    opacity: 0;\n  }\n\n  100% {\n    opacity: 1;\n  }\n}\n\n@keyframes dropdown-menu-show {\n  0% {\n    transform: scale(0, 0);\n  }\n\n  20% {\n    transform: scale(0.33333, 0);\n  }\n\n  40% {\n    transform: scale(0.66667, 0.25);\n  }\n\n  60% {\n    transform: scale(1, 0.5);\n  }\n\n  80% {\n    transform: scale(1, 0.75);\n  }\n\n  100% {\n    transform: scale(1, 1);\n  }\n}\n\n@keyframes menu-animation {\n  0% {\n    margin-top: -3.5rem;\n  }\n\n  100% {\n    margin-top: 0;\n  }\n}\n\n.dropdown-menu[x-placement=\"bottom-end\"]::before {\n  transform-origin: 100% 0;\n}\n\n.dropdown-menu[x-placement=\"top-end\"],\n.dropdown-menu[x-placement=\"top-end\"]::before,\n.dropdown-menu[x-placement=\"top-start\"],\n.dropdown-menu[x-placement=\"top-start\"]::before {\n  border-top-left-radius: 2px;\n  border-top-right-radius: 2px;\n  border-bottom-right-radius: 0;\n  border-bottom-left-radius: 0;\n}\n\n.dropdown-menu[x-placement=\"top-end\"].show > :nth-child(1),\n.dropdown-menu[x-placement=\"top-end\"].show > :nth-child(2),\n.dropdown-menu[x-placement=\"top-end\"].show > :nth-child(3),\n.dropdown-menu[x-placement=\"top-start\"].show > :nth-child(1),\n.dropdown-menu[x-placement=\"top-start\"].show > :nth-child(2),\n.dropdown-menu[x-placement=\"top-start\"].show > :nth-child(3) {\n  animation-name: dropdown-item-show;\n}\n\n.dropdown-menu[x-placement=\"top-end\"].show > :nth-last-child(1),\n.dropdown-menu[x-placement=\"top-start\"].show > :nth-last-child(1) {\n  animation-name: dropdown-item-show-1;\n}\n\n.dropdown-menu[x-placement=\"top-end\"].show > :nth-last-child(2),\n.dropdown-menu[x-placement=\"top-start\"].show > :nth-last-child(2) {\n  animation-name: dropdown-item-show-2;\n}\n\n.dropdown-menu[x-placement=\"top-end\"].show > :nth-last-child(3),\n.dropdown-menu[x-placement=\"top-start\"].show > :nth-last-child(3) {\n  animation-name: dropdown-item-show-3;\n}\n\n.dropdown-menu[x-placement=\"top-end\"]::before {\n  transform-origin: 100% 100%;\n}\n\n.dropdown-menu[x-placement=\"top-start\"]::before {\n  transform-origin: 0 100%;\n}\n\n.menu[x-placement=\"bottom-end\"]::before {\n  transform-origin: 100% 2rem;\n}\n\n.menu[x-placement=\"top-end\"],\n.menu[x-placement=\"top-start\"] {\n  margin-top: 0;\n  margin-bottom: -2.75rem;\n}\n\n.menu[x-placement=\"top-end\"]::before {\n  transform-origin: 100% calc(100% - 2rem);\n}\n\n.menu[x-placement=\"top-start\"]::before {\n  transform-origin: 0 calc(100% - 2rem);\n}\n\n.dropdown-menu-sm,\n.menu-cascading {\n  font-size: 0.9375rem;\n  line-height: 1.5rem;\n  padding-top: 1rem;\n  padding-bottom: 1rem;\n}\n\n@media (min-width: 600px) {\n  .dropdown-menu-sm,\n  .menu-cascading {\n    min-width: 20rem;\n  }\n}\n\n.menu-cascading {\n  margin-top: -2.75rem;\n}\n\n.menu-cascading[x-placement=\"top-end\"],\n.menu-cascading[x-placement=\"top-start\"] {\n  margin-top: 0;\n  margin-bottom: -2.75rem;\n}\n\n.menu-cascading[x-placement=\"top-end\"]::before {\n  transform-origin: 100% calc(100% - 2rem);\n}\n\n.menu-cascading[x-placement=\"top-start\"]::before {\n  transform-origin: 0 calc(100% - 2rem);\n}\n\n.dropdown-item {\n  transition-duration: 0.3s;\n  transition-property: background-color, color;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  background: none;\n  border: 0;\n  clear: both;\n  color: rgba(0, 0, 0, 0.87);\n  display: block;\n  font-weight: normal;\n  padding: 0.75rem 1rem;\n  position: relative;\n  text-align: inherit;\n  transform-origin: 0 0;\n  white-space: nowrap;\n  width: 100%;\n}\n\n@media (min-width: 600px) {\n  .dropdown-item {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .dropdown-item {\n    transition-duration: 0.2s;\n  }\n}\n\n.dropdown-item:active,\n.dropdown-item:focus,\n.dropdown-item:hover {\n  background-color: #f5f5f5;\n  color: rgba(0, 0, 0, 0.87);\n  text-decoration: none;\n}\n\n.dropdown-item.active {\n  background-color: #f5f5f5;\n}\n\n.dropdown-item:disabled,\n.dropdown-item.disabled {\n  background-color: transparent;\n  color: rgba(0, 0, 0, 0.38);\n  pointer-events: none;\n}\n\n.dropdown-menu-sm .dropdown-item,\n.menu-cascading .dropdown-item {\n  padding: 0.25rem 1.5rem;\n}\n\n.dropdown-divider {\n  background-color: rgba(0, 0, 0, 0.12);\n  height: 1px;\n  margin: 0.5rem 0;\n  overflow: hidden;\n}\n\n.dropdown-header {\n  color: rgba(0, 0, 0, 0.87);\n  display: block;\n  font-size: 1rem;\n  font-weight: bolder;\n  line-height: 1.5rem;\n  margin: 0;\n  padding: 0.75rem 1rem;\n  white-space: nowrap;\n}\n\n.dropdown-menu-sm .dropdown-header,\n.menu-cascading .dropdown-header {\n  font-size: 0.9375rem;\n  line-height: 1.5rem;\n  padding: 0.25rem 1.5rem;\n}\n\n.dropdown-toggle::after {\n  font-size: 1.5em;\n  line-height: 0.66667em;\n  vertical-align: -0.34537em;\n  font-family: 'Material Icons';\n  font-feature-settings: 'liga';\n  font-style: normal;\n  font-weight: normal;\n  letter-spacing: normal;\n  text-rendering: optimizeLegibility;\n  text-transform: none;\n  white-space: nowrap;\n  word-wrap: normal;\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-font-smoothing: antialiased;\n  content: \"expand_more\";\n  display: inline-block;\n  margin-right: -0.2em;\n  margin-left: 0.2em;\n}\n\n.dropup .dropdown-toggle::after {\n  content: \"expand_less\";\n}\n\n.dropdown-toggle:empty::after {\n  margin-left: -0.2em;\n}\n\n.navdrawer {\n  display: none;\n  outline: 0;\n  overflow: hidden;\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 160;\n}\n\n.navdrawer-backdrop {\n  transition-duration: 0.375s;\n  transition-property: opacity;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  background-color: rgba(0, 0, 0, 0.38);\n  opacity: 0;\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 159;\n}\n\n@media (min-width: 600px) {\n  .navdrawer-backdrop {\n    transition-duration: 0.4875s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .navdrawer-backdrop {\n    transition-duration: 0.25s;\n  }\n}\n\n.navdrawer-backdrop.show {\n  opacity: 1;\n}\n\n.navdrawer-content {\n  transition-duration: 0.195s;\n  transition-property: transform;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.6, 1);\n  background-color: #ffffff;\n  box-shadow: 0 16px 24px 2px rgba(0, 0, 0, 0.14), 0 6px 30px 5px rgba(0, 0, 0, 0.12), 0 8px 10px 0 rgba(0, 0, 0, 0.2);\n  max-width: calc(100% - 3.5rem);\n  overflow-x: hidden;\n  overflow-y: auto;\n  position: fixed;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  transform: translate3d(-100%, 0, 0);\n  width: 17.5rem;\n}\n\n@media (min-width: 600px) {\n  .navdrawer-content {\n    transition-duration: 0.2535s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .navdrawer-content {\n    transition-duration: 0.13s;\n  }\n}\n\n.navdrawer-right .navdrawer-content {\n  right: 0;\n  left: auto;\n  transform: translate3d(100%, 0, 0);\n}\n\n.navdrawer.show .navdrawer-content {\n  transition-duration: 0.225s;\n  transition-property: transform;\n  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);\n  transform: translate3d(0, 0, 0);\n}\n\n@media (min-width: 600px) {\n  .navdrawer.show .navdrawer-content {\n    transition-duration: 0.2925s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .navdrawer.show .navdrawer-content {\n    transition-duration: 0.15s;\n  }\n}\n\n.navdrawer-body {\n  margin-bottom: 0.5rem;\n  padding-right: 1rem;\n  padding-left: 1rem;\n}\n\n.navdrawer-divider {\n  background-color: rgba(0, 0, 0, 0.12);\n  height: 1px;\n  margin: 0.5rem 0;\n  overflow: hidden;\n}\n\n.navdrawer-header {\n  background-color: #f5f5f5;\n  border-bottom: 1px solid rgba(0, 0, 0, 0.12);\n  display: block;\n  margin-bottom: 0.5rem;\n  padding: 0.625rem 1rem;\n}\n\n.navdrawer-subheader {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  color: rgba(0, 0, 0, 0.38);\n  display: block;\n  font-weight: 500;\n  height: 3rem;\n  line-height: 1;\n  margin-top: 0;\n  margin-bottom: 0;\n  padding: 1.0625rem 1rem;\n}\n\n.navdrawer-divider + .navdrawer-subheader {\n  margin-top: -0.5rem;\n}\n\n.navdrawer-nav {\n  display: flex;\n  flex-direction: column;\n  list-style: none;\n  margin-bottom: 0.5rem;\n  padding-left: 0;\n}\n\n.navdrawer-nav .nav-link {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  transition-duration: 0.3s;\n  transition-property: background-color, color;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  color: rgba(0, 0, 0, 0.87);\n  font-size: 0.875rem;\n  font-weight: 500;\n  line-height: 1;\n  padding: 1.0625rem 1rem;\n}\n\n@media (min-width: 600px) {\n  .navdrawer-nav .nav-link {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .navdrawer-nav .nav-link {\n    transition-duration: 0.2s;\n  }\n}\n\n.navdrawer-nav .nav-link:active,\n.navdrawer-nav .nav-link:focus,\n.navdrawer-nav .nav-link:hover {\n  background-color: #f5f5f5;\n}\n\n.navdrawer-nav .nav-link:active {\n  color: #9c27b0;\n}\n\n.navdrawer-nav .nav-link:focus {\n  outline: 0;\n}\n\n.navdrawer-nav .nav-link.active {\n  color: #9c27b0;\n}\n\n.navdrawer-nav .nav-link.disabled {\n  background-color: transparent;\n  color: rgba(0, 0, 0, 0.38);\n}\n\n.navdrawer-nav .active > .nav-link {\n  color: #9c27b0;\n}\n\n.navdrawer-nav-icon {\n  color: rgba(0, 0, 0, 0.54);\n  width: 3.5rem;\n}\n\n.nav-link:active .navdrawer-nav-icon,\n.nav-link.active .navdrawer-nav-icon {\n  color: #9c27b0;\n}\n\n.active > .nav-link .navdrawer-nav-icon {\n  color: #9c27b0;\n}\n\n@media (min-width: 1280px) {\n  .navdrawer-permanent {\n    border-right: 1px solid rgba(0, 0, 0, 0.12);\n    display: block !important;\n    right: auto;\n    width: 17.5rem;\n  }\n\n  .navdrawer-permanent .navdrawer-content {\n    box-shadow: none;\n    max-width: none;\n    position: absolute;\n    transform: translate3d(0, 0, 0);\n    width: 100%;\n  }\n\n  .navdrawer-permanent.navdrawer-right {\n    border-right: 0;\n    border-left: 1px solid rgba(0, 0, 0, 0.12);\n    right: 0;\n    left: auto;\n  }\n\n  .navdrawer-backdrop-permanent {\n    display: none;\n  }\n\n  .navdrawer-permanent-clipped,\n  .navdrawer-permanent-float {\n    top: 3.5rem;\n    z-index: 39;\n  }\n\n  .navdrawer-permanent-clipped {\n    border-top: 1px solid rgba(0, 0, 0, 0.12);\n    margin-top: -1px;\n  }\n\n  .navdrawer-permanent-float {\n    border-right: 0;\n  }\n\n  .navdrawer-permanent-float.navdrawer-right {\n    border-left: 0;\n  }\n\n  .navdrawer-permanent-float .navdrawer-content {\n    background-color: transparent;\n  }\n}\n\n@media (min-width: 1280px) {\n  .navdrawer-persistent {\n    right: auto;\n    width: 17.5rem;\n  }\n\n  .navdrawer-persistent .navdrawer-content {\n    border-right: 1px solid rgba(0, 0, 0, 0.12);\n    box-shadow: none;\n    max-width: none;\n    position: absolute;\n    width: 100%;\n  }\n\n  .navdrawer-persistent.navdrawer-right {\n    right: 0;\n    left: auto;\n  }\n\n  .navdrawer-persistent.navdrawer-right .navdrawer-content {\n    border-right: 0;\n    border-left: 1px solid rgba(0, 0, 0, 0.12);\n  }\n\n  .navdrawer-backdrop-persistent {\n    display: none;\n  }\n\n  .navdrawer-persistent-clipped {\n    border-top: 1px solid rgba(0, 0, 0, 0.12);\n    margin-top: -1px;\n    top: 3.5rem;\n    z-index: 39;\n  }\n}\n\n@media (min-width: 1280px) {\n  .navdrawer-temporary {\n    overflow: visible;\n    right: auto;\n    width: 17.5rem;\n  }\n\n  .navdrawer-temporary .navdrawer-content {\n    max-width: none;\n    position: absolute;\n    width: 100%;\n  }\n\n  .navdrawer-temporary.navdrawer-right {\n    right: 0;\n    left: auto;\n  }\n\n  .navdrawer-backdrop-temporary {\n    display: none;\n  }\n}\n\n.picker {\n  position: absolute;\n  user-select: none;\n  z-index: 240;\n}\n\n.picker-box {\n  border-bottom-right-radius: 2px;\n  border-bottom-left-radius: 2px;\n  background-color: #ffffff;\n  overflow: hidden;\n}\n\n.picker-frame {\n  transition-duration: 0.375s;\n  transition-property: opacity;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  background-color: rgba(0, 0, 0, 0.38);\n  opacity: 0;\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  text-align: center;\n  vertical-align: middle;\n  white-space: nowrap;\n}\n\n@media (min-width: 600px) {\n  .picker-frame {\n    transition-duration: 0.4875s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .picker-frame {\n    transition-duration: 0.25s;\n  }\n}\n\n.picker-frame::after {\n  content: '';\n  display: inline-block;\n  height: 100%;\n  vertical-align: middle;\n  width: 1px;\n}\n\n.picker-opened .picker-frame {\n  opacity: 1;\n}\n\n.picker-holder {\n  outline: 0;\n  overflow-x: hidden;\n  overflow-y: auto;\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  transform: translate3d(0, 100%, 0);\n  transition-delay: 0.375s;\n  transition-duration: 0;\n  transition-property: transform;\n}\n\n@media (min-width: 600px) {\n  .picker-holder {\n    transition-delay: 0.4875s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .picker-holder {\n    transition-delay: 0.25s;\n  }\n}\n\n.picker-opened .picker-holder {\n  opacity: 1;\n  overflow-x: hidden;\n  overflow-y: auto;\n  transform: translate3d(0, 0, 0);\n  transition: none;\n}\n\n.picker-opened .picker-holder::before {\n  opacity: 1;\n}\n\n.picker-input.form-control[readonly] {\n  border-bottom-style: solid;\n  color: inherit;\n  cursor: text;\n}\n\n.picker-input.picker-input-active {\n  border-bottom-color: #9c27b0;\n}\n\n.picker-wrap {\n  border-radius: 2px;\n  transition-duration: 0.375s;\n  transition-property: transform;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  box-shadow: 0 24px 38px 3px rgba(0, 0, 0, 0.14), 0 9px 46px 8px rgba(0, 0, 0, 0.12), 0 11px 15px 0 rgba(0, 0, 0, 0.2);\n  display: inline-block;\n  margin: 1.5rem 1.5rem;\n  max-width: 18.5rem;\n  outline: 0;\n  position: relative;\n  transform: scale(0.87);\n  vertical-align: middle;\n}\n\n@media (min-width: 600px) {\n  .picker-wrap {\n    transition-duration: 0.4875s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .picker-wrap {\n    transition-duration: 0.25s;\n  }\n}\n\n.picker-opened .picker-wrap {\n  transform: scale(1);\n}\n\n.picker-footer {\n  display: flex;\n  justify-content: flex-end;\n  padding: 0.5rem 0.5rem;\n}\n\n.picker-footer button {\n  flex: 0 1 auto;\n  margin-left: 0.5rem;\n  min-width: 0;\n}\n\n.picker-footer button:first-child {\n  margin-left: 0;\n}\n\n.picker-header {\n  height: 2.5rem;\n  line-height: 2.5rem;\n  margin-right: 0.5rem;\n  margin-left: 0.5rem;\n  position: relative;\n  vertical-align: middle;\n}\n\n.picker-month,\n.picker-year {\n  display: inline;\n  margin-left: 0.5rem;\n}\n\n.picker-month:first-child,\n.picker-year:first-child {\n  margin-left: 0;\n}\n\n.picker-nav-next,\n.picker-nav-prev {\n  height: 2.5rem;\n  margin-top: -1.25rem;\n  position: absolute;\n  top: 50%;\n  width: 2.5rem;\n}\n\n.picker-nav-next,\n.picker-nav-next.material-icons,\n.picker-nav-prev,\n.picker-nav-prev.material-icons {\n  line-height: 2.5rem;\n}\n\n.picker-nav-next {\n  right: 0;\n}\n\n.picker-nav-next::before {\n  content: \"keyboard_arrow_right\";\n}\n\n.picker-nav-prev {\n  left: 0;\n}\n\n.picker-nav-prev::before {\n  content: \"keyboard_arrow_left\";\n}\n\n.picker-date-display {\n  border-top-left-radius: 2px;\n  border-top-right-radius: 2px;\n  color: white;\n  text-align: left;\n  text-align: start;\n  background-color: #9c27b0;\n  padding: 1rem 1.5rem;\n}\n\n[dir='rtl'] .picker-date-display {\n  text-align: right;\n  text-align: start;\n}\n\n.picker-date-display-bottom {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  font-size: 2.125rem;\n  font-weight: 400;\n  letter-spacing: 0;\n  line-height: 1.17647;\n}\n\n.picker-day-display {\n  margin-right: 0.5rem;\n}\n\n.picker-weekday-display {\n  margin-right: 0.5rem;\n}\n\n.picker-weekday-display::after {\n  content: ',';\n}\n\n.picker-day {\n  border-radius: 50%;\n  cursor: default;\n  height: 2.5rem;\n  line-height: 2.5rem;\n  margin: auto;\n  vertical-align: middle;\n  width: 2.5rem;\n}\n\n.picker-day.picker-day-selected {\n  color: white;\n  background-color: #9c27b0;\n}\n\n.picker-day-disabled {\n  color: rgba(0, 0, 0, 0.38);\n}\n\n.picker-day-outfocus {\n  display: none;\n}\n\n.picker-day-today {\n  color: #9c27b0;\n  font-weight: bolder;\n}\n\n.picker-table {\n  border-collapse: collapse;\n  border-spacing: 0;\n  margin: 0 0.5rem;\n  table-layout: fixed;\n}\n\n.picker-table td,\n.picker-table th {\n  border: 0;\n  font-weight: normal;\n  padding: 0;\n  text-align: center;\n  vertical-align: middle;\n}\n\n.picker-weekday {\n  color: rgba(0, 0, 0, 0.38);\n  height: 2.5rem;\n  vertical-align: middle;\n  width: 2.5rem;\n}\n\n.progress {\n  display: flex;\n  overflow: hidden;\n  position: relative;\n}\n\n.progress-bar {\n  border-bottom: 0.25rem solid #3f51b5;\n}\n\n.progress-bar::after {\n  background-color: #c5cae9;\n  content: '';\n  display: block;\n  height: 0.25rem;\n  position: absolute;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: -1;\n}\n\n.progress-bar.bg-primary {\n  background-color: transparent !important;\n  border-bottom-color: #9c27b0;\n}\n\n.progress-bar.bg-primary::after {\n  background-color: #e1bee7;\n}\n\n.progress-bar.bg-primary::before {\n  background-image: repeating-radial-gradient(0.125rem 0.125rem, #e1bee7, #e1bee7 0.125rem, transparent 0.125rem, transparent 100%);\n  background-image: -webkit-repeating-radial-gradient(0.125rem 0.125rem, #e1bee7, #e1bee7 0.125rem, transparent 0.125rem, transparent 100%);\n}\n\n.progress-bar.bg-secondary {\n  background-color: transparent !important;\n  border-bottom-color: #ff4081;\n}\n\n.progress-bar.bg-secondary::after {\n  background-color: #ff80ab;\n}\n\n.progress-bar.bg-secondary::before {\n  background-image: repeating-radial-gradient(0.125rem 0.125rem, #ff80ab, #ff80ab 0.125rem, transparent 0.125rem, transparent 100%);\n  background-image: -webkit-repeating-radial-gradient(0.125rem 0.125rem, #ff80ab, #ff80ab 0.125rem, transparent 0.125rem, transparent 100%);\n}\n\n.progress-bar.bg-danger {\n  background-color: transparent !important;\n  border-bottom-color: #f44336;\n}\n\n.progress-bar.bg-danger::after {\n  background-color: #ffcdd2;\n}\n\n.progress-bar.bg-danger::before {\n  background-image: repeating-radial-gradient(0.125rem 0.125rem, #ffcdd2, #ffcdd2 0.125rem, transparent 0.125rem, transparent 100%);\n  background-image: -webkit-repeating-radial-gradient(0.125rem 0.125rem, #ffcdd2, #ffcdd2 0.125rem, transparent 0.125rem, transparent 100%);\n}\n\n.progress-bar.bg-info {\n  background-color: transparent !important;\n  border-bottom-color: #2196f3;\n}\n\n.progress-bar.bg-info::after {\n  background-color: #bbdefb;\n}\n\n.progress-bar.bg-info::before {\n  background-image: repeating-radial-gradient(0.125rem 0.125rem, #bbdefb, #bbdefb 0.125rem, transparent 0.125rem, transparent 100%);\n  background-image: -webkit-repeating-radial-gradient(0.125rem 0.125rem, #bbdefb, #bbdefb 0.125rem, transparent 0.125rem, transparent 100%);\n}\n\n.progress-bar.bg-success {\n  background-color: transparent !important;\n  border-bottom-color: #4caf50;\n}\n\n.progress-bar.bg-success::after {\n  background-color: #c8e6c9;\n}\n\n.progress-bar.bg-success::before {\n  background-image: repeating-radial-gradient(0.125rem 0.125rem, #c8e6c9, #c8e6c9 0.125rem, transparent 0.125rem, transparent 100%);\n  background-image: -webkit-repeating-radial-gradient(0.125rem 0.125rem, #c8e6c9, #c8e6c9 0.125rem, transparent 0.125rem, transparent 100%);\n}\n\n.progress-bar.bg-warning {\n  background-color: transparent !important;\n  border-bottom-color: #ff9800;\n}\n\n.progress-bar.bg-warning::after {\n  background-color: #ffe0b2;\n}\n\n.progress-bar.bg-warning::before {\n  background-image: repeating-radial-gradient(0.125rem 0.125rem, #ffe0b2, #ffe0b2 0.125rem, transparent 0.125rem, transparent 100%);\n  background-image: -webkit-repeating-radial-gradient(0.125rem 0.125rem, #ffe0b2, #ffe0b2 0.125rem, transparent 0.125rem, transparent 100%);\n}\n\n.progress-bar.bg-dark {\n  background-color: transparent !important;\n  border-bottom-color: #424242;\n}\n\n.progress-bar.bg-dark::after {\n  background-color: #757575;\n}\n\n.progress-bar.bg-dark::before {\n  background-image: repeating-radial-gradient(0.125rem 0.125rem, #757575, #757575 0.125rem, transparent 0.125rem, transparent 100%);\n  background-image: -webkit-repeating-radial-gradient(0.125rem 0.125rem, #757575, #757575 0.125rem, transparent 0.125rem, transparent 100%);\n}\n\n.progress-bar.bg-light {\n  background-color: transparent !important;\n  border-bottom-color: #f5f5f5;\n}\n\n.progress-bar.bg-light::after {\n  background-color: #fafafa;\n}\n\n.progress-bar.bg-light::before {\n  background-image: repeating-radial-gradient(0.125rem 0.125rem, #fafafa, #fafafa 0.125rem, transparent 0.125rem, transparent 100%);\n  background-image: -webkit-repeating-radial-gradient(0.125rem 0.125rem, #fafafa, #fafafa 0.125rem, transparent 0.125rem, transparent 100%);\n}\n\n.progress-bar-animated::before {\n  animation-direction: reverse;\n  animation-duration: 0.3s;\n  animation-iteration-count: infinite;\n  animation-name: progress-bar-animation;\n  animation-timing-function: linear;\n}\n\n@media (min-width: 600px) {\n  .progress-bar-animated::before {\n    animation-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .progress-bar-animated::before {\n    animation-duration: 0.2s;\n  }\n}\n\n.progress-bar-animated,\n.progress-bar-striped {\n  box-sizing: content-box;\n  position: relative;\n}\n\n.progress-bar-animated[style*=\"width:100%\"],\n.progress-bar-animated[style*=\"width: 100%\"],\n.progress-bar-striped[style*=\"width:100%\"],\n.progress-bar-striped[style*=\"width: 100%\"] {\n  border-right: 0;\n}\n\n.progress-bar-animated::after,\n.progress-bar-striped::after {\n  border-top-right-radius: 0.25rem;\n  border-bottom-right-radius: 0.25rem;\n  right: -1.5rem;\n  bottom: -0.25rem;\n}\n\n.progress-bar-animated::before,\n.progress-bar-striped::before {\n  background-image: repeating-radial-gradient(0.125rem 0.125rem, #c5cae9, #c5cae9 0.125rem, transparent 0.125rem, transparent 100%);\n  background-image: -webkit-repeating-radial-gradient(0.125rem 0.125rem, #c5cae9, #c5cae9 0.125rem, transparent 0.125rem, transparent 100%);\n  background-position: 0 0;\n  background-repeat: repeat-x;\n  background-size: 0.75rem 0.75rem;\n  content: '';\n  display: block;\n  height: 0.25rem;\n  position: absolute;\n  right: -100vw;\n  bottom: -0.25rem;\n  left: 0;\n  z-index: -1;\n}\n\n.progress-bar-animated.bg-primary::before,\n.progress-bar-striped.bg-primary::before {\n  background-image: repeating-radial-gradient(0.125rem 0.125rem, #e1bee7, #e1bee7 0.125rem, transparent 0.125rem, transparent 100%);\n  background-image: -webkit-repeating-radial-gradient(0.125rem 0.125rem, #e1bee7, #e1bee7 0.125rem, transparent 0.125rem, transparent 100%);\n}\n\n.progress-bar-animated.bg-secondary::before,\n.progress-bar-striped.bg-secondary::before {\n  background-image: repeating-radial-gradient(0.125rem 0.125rem, #ff80ab, #ff80ab 0.125rem, transparent 0.125rem, transparent 100%);\n  background-image: -webkit-repeating-radial-gradient(0.125rem 0.125rem, #ff80ab, #ff80ab 0.125rem, transparent 0.125rem, transparent 100%);\n}\n\n.progress-bar-animated.bg-danger::before,\n.progress-bar-striped.bg-danger::before {\n  background-image: repeating-radial-gradient(0.125rem 0.125rem, #ffcdd2, #ffcdd2 0.125rem, transparent 0.125rem, transparent 100%);\n  background-image: -webkit-repeating-radial-gradient(0.125rem 0.125rem, #ffcdd2, #ffcdd2 0.125rem, transparent 0.125rem, transparent 100%);\n}\n\n.progress-bar-animated.bg-info::before,\n.progress-bar-striped.bg-info::before {\n  background-image: repeating-radial-gradient(0.125rem 0.125rem, #bbdefb, #bbdefb 0.125rem, transparent 0.125rem, transparent 100%);\n  background-image: -webkit-repeating-radial-gradient(0.125rem 0.125rem, #bbdefb, #bbdefb 0.125rem, transparent 0.125rem, transparent 100%);\n}\n\n.progress-bar-animated.bg-success::before,\n.progress-bar-striped.bg-success::before {\n  background-image: repeating-radial-gradient(0.125rem 0.125rem, #c8e6c9, #c8e6c9 0.125rem, transparent 0.125rem, transparent 100%);\n  background-image: -webkit-repeating-radial-gradient(0.125rem 0.125rem, #c8e6c9, #c8e6c9 0.125rem, transparent 0.125rem, transparent 100%);\n}\n\n.progress-bar-animated.bg-warning::before,\n.progress-bar-striped.bg-warning::before {\n  background-image: repeating-radial-gradient(0.125rem 0.125rem, #ffe0b2, #ffe0b2 0.125rem, transparent 0.125rem, transparent 100%);\n  background-image: -webkit-repeating-radial-gradient(0.125rem 0.125rem, #ffe0b2, #ffe0b2 0.125rem, transparent 0.125rem, transparent 100%);\n}\n\n.progress-bar-animated.bg-dark::before,\n.progress-bar-striped.bg-dark::before {\n  background-image: repeating-radial-gradient(0.125rem 0.125rem, #757575, #757575 0.125rem, transparent 0.125rem, transparent 100%);\n  background-image: -webkit-repeating-radial-gradient(0.125rem 0.125rem, #757575, #757575 0.125rem, transparent 0.125rem, transparent 100%);\n}\n\n.progress-bar-animated.bg-light::before,\n.progress-bar-striped.bg-light::before {\n  background-image: repeating-radial-gradient(0.125rem 0.125rem, #fafafa, #fafafa 0.125rem, transparent 0.125rem, transparent 100%);\n  background-image: -webkit-repeating-radial-gradient(0.125rem 0.125rem, #fafafa, #fafafa 0.125rem, transparent 0.125rem, transparent 100%);\n}\n\n@keyframes progress-bar-animation {\n  from {\n    background-position: 0 0;\n  }\n\n  to {\n    background-position: 0.75rem 0;\n  }\n}\n\n.progress-bar-indeterminate {\n  border-bottom-color: #c5cae9;\n  position: relative;\n  width: 100%;\n}\n\n.progress-bar-indeterminate::after,\n.progress-bar-indeterminate::before {\n  border-radius: 2px;\n  animation-duration: 2s;\n  animation-iteration-count: infinite;\n  animation-timing-function: linear;\n  background-color: #3f51b5;\n  width: 0%;\n}\n\n.progress-bar-indeterminate::after {\n  animation-name: progress-bar-indeterminate-after;\n  bottom: -0.25rem;\n  z-index: 0;\n}\n\n.progress-bar-indeterminate::before {\n  animation-name: progress-bar-indeterminate-before;\n  content: '';\n  display: block;\n  height: 0.25rem;\n  position: absolute;\n  bottom: -0.25rem;\n  z-index: 0;\n}\n\n.progress-bar-indeterminate.bg-primary {\n  border-bottom-color: #e1bee7;\n}\n\n.progress-bar-indeterminate.bg-primary::after,\n.progress-bar-indeterminate.bg-primary::before {\n  background-color: #9c27b0;\n}\n\n.progress-bar-indeterminate.bg-primary::before {\n  background-image: none;\n}\n\n.progress-bar-indeterminate.bg-secondary {\n  border-bottom-color: #ff80ab;\n}\n\n.progress-bar-indeterminate.bg-secondary::after,\n.progress-bar-indeterminate.bg-secondary::before {\n  background-color: #ff4081;\n}\n\n.progress-bar-indeterminate.bg-secondary::before {\n  background-image: none;\n}\n\n.progress-bar-indeterminate.bg-danger {\n  border-bottom-color: #ffcdd2;\n}\n\n.progress-bar-indeterminate.bg-danger::after,\n.progress-bar-indeterminate.bg-danger::before {\n  background-color: #f44336;\n}\n\n.progress-bar-indeterminate.bg-danger::before {\n  background-image: none;\n}\n\n.progress-bar-indeterminate.bg-info {\n  border-bottom-color: #bbdefb;\n}\n\n.progress-bar-indeterminate.bg-info::after,\n.progress-bar-indeterminate.bg-info::before {\n  background-color: #2196f3;\n}\n\n.progress-bar-indeterminate.bg-info::before {\n  background-image: none;\n}\n\n.progress-bar-indeterminate.bg-success {\n  border-bottom-color: #c8e6c9;\n}\n\n.progress-bar-indeterminate.bg-success::after,\n.progress-bar-indeterminate.bg-success::before {\n  background-color: #4caf50;\n}\n\n.progress-bar-indeterminate.bg-success::before {\n  background-image: none;\n}\n\n.progress-bar-indeterminate.bg-warning {\n  border-bottom-color: #ffe0b2;\n}\n\n.progress-bar-indeterminate.bg-warning::after,\n.progress-bar-indeterminate.bg-warning::before {\n  background-color: #ff9800;\n}\n\n.progress-bar-indeterminate.bg-warning::before {\n  background-image: none;\n}\n\n.progress-bar-indeterminate.bg-dark {\n  border-bottom-color: #757575;\n}\n\n.progress-bar-indeterminate.bg-dark::after,\n.progress-bar-indeterminate.bg-dark::before {\n  background-color: #424242;\n}\n\n.progress-bar-indeterminate.bg-dark::before {\n  background-image: none;\n}\n\n.progress-bar-indeterminate.bg-light {\n  border-bottom-color: #fafafa;\n}\n\n.progress-bar-indeterminate.bg-light::after,\n.progress-bar-indeterminate.bg-light::before {\n  background-color: #f5f5f5;\n}\n\n.progress-bar-indeterminate.bg-light::before {\n  background-image: none;\n}\n\n@keyframes progress-bar-indeterminate-after {\n  0% {\n    left: 0%;\n    width: 0%;\n  }\n\n  50% {\n    left: 25%;\n    width: 75%;\n  }\n\n  75% {\n    left: 100%;\n    width: 0%;\n  }\n}\n\n@keyframes progress-bar-indeterminate-before {\n  0%, 62.5% {\n    left: 0%;\n    width: 0%;\n  }\n\n  71.875% {\n    left: 0%;\n    width: 25%;\n  }\n\n  81.25% {\n    left: 25%;\n    width: 50%;\n  }\n\n  100% {\n    left: 100%;\n    width: 25%;\n  }\n}\n\n.progress-circular {\n  height: 2.5rem;\n  position: relative;\n  width: 2.5rem;\n}\n\n.progress-circular-gap {\n  border-top: 0.125rem solid #3f51b5;\n  position: absolute;\n  top: 0;\n  right: 1.1875rem;\n  bottom: 0;\n  left: 1.1875rem;\n}\n\n.progress-circular-inner {\n  animation: progress-circular-inner-rotate 5.332s cubic-bezier(0.4, 0, 0.2, 1) infinite;\n  height: 2.5rem;\n  position: relative;\n  width: 2.5rem;\n}\n\n.progress-circular-left,\n.progress-circular-right {\n  height: 2.5rem;\n  overflow: hidden;\n  position: absolute;\n  top: 0;\n  width: 1.25rem;\n}\n\n.progress-circular-left {\n  left: 0;\n}\n\n.progress-circular-right {\n  right: 0;\n}\n\n.progress-circular-spinner {\n  border: 0.25rem solid #3f51b5;\n  border-bottom-color: transparent;\n  border-radius: 50%;\n  height: 2.5rem;\n  position: absolute;\n  top: 0;\n  width: 2.5rem;\n}\n\n.progress-circular-left .progress-circular-spinner {\n  animation: progress-circular-spinner-left 1.333s cubic-bezier(0.4, 0, 0.2, 1) infinite;\n  border-right-color: transparent;\n  left: 0;\n}\n\n.progress-circular-right .progress-circular-spinner {\n  animation: progress-circular-spinner-right 1.333s cubic-bezier(0.4, 0, 0.2, 1) infinite;\n  border-left-color: transparent;\n  right: 0;\n}\n\n.progress-circular-wrapper {\n  animation: progress-circular-wrapper-rotate 2.666s linear infinite;\n}\n\n@keyframes progress-circular-inner-rotate {\n  12.5% {\n    transform: rotate(135deg);\n  }\n\n  25% {\n    transform: rotate(270deg);\n  }\n\n  37.5% {\n    transform: rotate(405deg);\n  }\n\n  50% {\n    transform: rotate(540deg);\n  }\n\n  62.5% {\n    transform: rotate(675deg);\n  }\n\n  75% {\n    transform: rotate(810deg);\n  }\n\n  87.5% {\n    transform: rotate(945deg);\n  }\n\n  100% {\n    transform: rotate(1080deg);\n  }\n}\n\n@keyframes progress-circular-spinner-left {\n  0%, 100% {\n    transform: rotate(130deg);\n  }\n\n  50% {\n    transform: rotate(-5deg);\n  }\n}\n\n@keyframes progress-circular-spinner-right {\n  0%, 100% {\n    transform: rotate(-130deg);\n  }\n\n  50% {\n    transform: rotate(5deg);\n  }\n}\n\n@keyframes progress-circular-wrapper-rotate {\n  100% {\n    transform: rotate(360deg);\n  }\n}\n\n.progress-circular-primary .progress-circular-gap,\n.progress-circular-primary .progress-circular-spinner {\n  border-top-color: #9c27b0;\n}\n\n.progress-circular-primary .progress-circular-left .progress-circular-spinner {\n  border-left-color: #9c27b0;\n}\n\n.progress-circular-primary .progress-circular-right .progress-circular-spinner {\n  border-right-color: #9c27b0;\n}\n\n.progress-circular-secondary .progress-circular-gap,\n.progress-circular-secondary .progress-circular-spinner {\n  border-top-color: #ff4081;\n}\n\n.progress-circular-secondary .progress-circular-left .progress-circular-spinner {\n  border-left-color: #ff4081;\n}\n\n.progress-circular-secondary .progress-circular-right .progress-circular-spinner {\n  border-right-color: #ff4081;\n}\n\n.progress-circular-danger .progress-circular-gap,\n.progress-circular-danger .progress-circular-spinner {\n  border-top-color: #f44336;\n}\n\n.progress-circular-danger .progress-circular-left .progress-circular-spinner {\n  border-left-color: #f44336;\n}\n\n.progress-circular-danger .progress-circular-right .progress-circular-spinner {\n  border-right-color: #f44336;\n}\n\n.progress-circular-info .progress-circular-gap,\n.progress-circular-info .progress-circular-spinner {\n  border-top-color: #2196f3;\n}\n\n.progress-circular-info .progress-circular-left .progress-circular-spinner {\n  border-left-color: #2196f3;\n}\n\n.progress-circular-info .progress-circular-right .progress-circular-spinner {\n  border-right-color: #2196f3;\n}\n\n.progress-circular-success .progress-circular-gap,\n.progress-circular-success .progress-circular-spinner {\n  border-top-color: #4caf50;\n}\n\n.progress-circular-success .progress-circular-left .progress-circular-spinner {\n  border-left-color: #4caf50;\n}\n\n.progress-circular-success .progress-circular-right .progress-circular-spinner {\n  border-right-color: #4caf50;\n}\n\n.progress-circular-warning .progress-circular-gap,\n.progress-circular-warning .progress-circular-spinner {\n  border-top-color: #ff9800;\n}\n\n.progress-circular-warning .progress-circular-left .progress-circular-spinner {\n  border-left-color: #ff9800;\n}\n\n.progress-circular-warning .progress-circular-right .progress-circular-spinner {\n  border-right-color: #ff9800;\n}\n\n.progress-circular-dark .progress-circular-gap,\n.progress-circular-dark .progress-circular-spinner {\n  border-top-color: #424242;\n}\n\n.progress-circular-dark .progress-circular-left .progress-circular-spinner {\n  border-left-color: #424242;\n}\n\n.progress-circular-dark .progress-circular-right .progress-circular-spinner {\n  border-right-color: #424242;\n}\n\n.progress-circular-light .progress-circular-gap,\n.progress-circular-light .progress-circular-spinner {\n  border-top-color: #f5f5f5;\n}\n\n.progress-circular-light .progress-circular-left .progress-circular-spinner {\n  border-left-color: #f5f5f5;\n}\n\n.progress-circular-light .progress-circular-right .progress-circular-spinner {\n  border-right-color: #f5f5f5;\n}\n\n.custom-control {\n  color: inherit;\n  display: inline-flex;\n  font-size: 1rem;\n  margin-right: 1.5rem;\n  min-height: 1.42857rem;\n  padding-left: 2.25rem;\n  position: relative;\n}\n\n.custom-control-indicator {\n  align-items: center;\n  color: rgba(0, 0, 0, 0.54);\n  display: flex;\n  height: 1.5rem;\n  pointer-events: none;\n  position: absolute;\n  top: -0.03571rem;\n  left: 0;\n  user-select: none;\n  width: 2.25rem;\n}\n\n.custom-control-indicator::before {\n  transition-duration: 0.3s;\n  transition-property: background-color, opacity, transform;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  background-color: rgba(0, 0, 0, 0.12);\n  border-radius: 50%;\n  content: '';\n  display: block;\n  height: 3rem;\n  margin-top: -0.75rem;\n  margin-left: -0.75rem;\n  opacity: 0;\n  position: absolute;\n  top: 0;\n  left: 0;\n  transform: scale(0.87, 0.87) translateZ(0);\n  width: 3rem;\n}\n\n@media (min-width: 600px) {\n  .custom-control-indicator::before {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .custom-control-indicator::before {\n    transition-duration: 0.2s;\n  }\n}\n\n.custom-control-input {\n  opacity: 0;\n  position: absolute;\n  z-index: -1;\n}\n\n.custom-control-input:active ~ .custom-control-indicator::before,\n.custom-control-input.focus ~ .custom-control-indicator::before {\n  opacity: 1;\n  transform: scale(1, 1) translateZ(0);\n}\n\n.custom-control-input:checked ~ .custom-control-indicator {\n  color: #ff4081;\n}\n\n.custom-control-input:checked ~ .custom-control-indicator::before {\n  background-color: rgba(255, 64, 129, 0.12);\n}\n\n.custom-control-input:disabled ~ .custom-control-indicator,\n.custom-control-input:disabled ~ .custom-control-description {\n  color: rgba(0, 0, 0, 0.26);\n}\n\n.custom-control-input:disabled ~ .custom-control-indicator::before {\n  display: none;\n}\n\n.custom-controls-stacked {\n  display: flex;\n  flex-direction: column;\n}\n\n.custom-controls-stacked .custom-control {\n  display: flex;\n  margin-right: 0;\n  margin-bottom: 0.75rem;\n}\n\n.custom-checkbox .custom-control-indicator::after {\n  font-size: 1.5em;\n  line-height: 0.66667em;\n  vertical-align: -0.34537em;\n  font-family: 'Material Icons';\n  font-feature-settings: 'liga';\n  font-style: normal;\n  font-weight: normal;\n  letter-spacing: normal;\n  text-rendering: optimizeLegibility;\n  text-transform: none;\n  white-space: nowrap;\n  word-wrap: normal;\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-font-smoothing: antialiased;\n  content: \"check_box_outline_blank\";\n}\n\n.custom-checkbox .custom-control-input:checked ~ .custom-control-indicator::after {\n  content: \"check_box\";\n}\n\n.custom-checkbox .custom-control-input:indeterminate ~ .custom-control-indicator::after {\n  content: \"indeterminate_check_box\";\n}\n\n.custom-radio .custom-control-indicator::after {\n  font-size: 1.5em;\n  line-height: 0.66667em;\n  vertical-align: -0.34537em;\n  font-family: 'Material Icons';\n  font-feature-settings: 'liga';\n  font-style: normal;\n  font-weight: normal;\n  letter-spacing: normal;\n  text-rendering: optimizeLegibility;\n  text-transform: none;\n  white-space: nowrap;\n  word-wrap: normal;\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-font-smoothing: antialiased;\n  content: \"radio_button_unchecked\";\n}\n\n.custom-radio .custom-control-input:checked ~ .custom-control-indicator::after {\n  content: \"radio_button_checked\";\n}\n\n.custom-switch {\n  padding-left: 3.75rem;\n}\n\n.custom-switch .custom-control-indicator {\n  transition-duration: 0.3s;\n  transition-property: background-color;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  background-clip: content-box;\n  background-color: rgba(0, 0, 0, 0.38);\n  border: 0.25rem solid transparent;\n  border-radius: 1rem;\n  width: 3rem;\n}\n\n@media (min-width: 600px) {\n  .custom-switch .custom-control-indicator {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .custom-switch .custom-control-indicator {\n    transition-duration: 0.2s;\n  }\n}\n\n.custom-switch .custom-control-indicator::after,\n.custom-switch .custom-control-indicator::before {\n  top: -0.25rem;\n  left: -0.25rem;\n}\n\n.custom-switch .custom-control-indicator::after {\n  transition-duration: 0.3s;\n  transition-property: background-color, transform;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  background-color: #fafafa;\n  border-radius: 50%;\n  box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.54);\n  content: '';\n  display: block;\n  height: 1.5rem;\n  position: absolute;\n  width: 1.5rem;\n}\n\n@media (min-width: 600px) {\n  .custom-switch .custom-control-indicator::after {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .custom-switch .custom-control-indicator::after {\n    transition-duration: 0.2s;\n  }\n}\n\n.custom-switch .custom-control-input:checked ~ .custom-control-indicator {\n  background-color: rgba(255, 64, 129, 0.5);\n}\n\n.custom-switch .custom-control-input:checked ~ .custom-control-indicator::after,\n.custom-switch .custom-control-input:checked ~ .custom-control-indicator::before {\n  transform: translateX(1.5rem);\n}\n\n.custom-switch .custom-control-input:checked ~ .custom-control-indicator::after {\n  background-color: #ff4081;\n}\n\n.custom-switch .custom-control-input:disabled ~ .custom-control-indicator {\n  background-color: rgba(0, 0, 0, 0.12);\n}\n\n.custom-switch .custom-control-input:disabled ~ .custom-control-indicator::after {\n  background-color: #bdbdbd;\n}\n\n.stepper {\n  align-items: center;\n  background-color: #ffffff;\n  display: flex;\n  flex-shrink: 0;\n  overflow: hidden;\n  padding: 1.5rem 1.5rem;\n  position: relative;\n}\n\n.stepper::after,\n.stepper::before {\n  border-top: 1px solid #bdbdbd;\n  content: '';\n  display: block;\n  position: absolute;\n}\n\n.stepper:first-child::before {\n  display: none;\n}\n\n.stepper:last-child::after {\n  display: none;\n}\n\n.stepper-horiz {\n  background-color: #ffffff;\n  display: flex;\n  justify-content: space-between;\n  overflow-x: auto;\n  overflow-y: hidden;\n  position: relative;\n}\n\n.stepper-horiz::before {\n  border-top: 1px solid #bdbdbd;\n  content: '';\n  display: block;\n  position: absolute;\n  top: 50%;\n  right: 1.5rem;\n  left: 1.5rem;\n}\n\n.stepper-horiz .stepper::after,\n.stepper-horiz .stepper::before {\n  border-top: 1px solid #bdbdbd;\n  top: 50%;\n  width: 1rem;\n}\n\n.stepper-horiz .stepper::after {\n  right: 0;\n}\n\n.stepper-horiz .stepper::before {\n  left: 0;\n}\n\n.stepper-vert {\n  background-color: #ffffff;\n  position: relative;\n}\n\n.stepper-vert .stepper::after,\n.stepper-vert .stepper::before {\n  border-left: 1px solid #bdbdbd;\n  height: 1rem;\n  left: 2.25rem;\n}\n\n.stepper-vert .stepper::after {\n  bottom: 0;\n}\n\n.stepper-vert .stepper::before {\n  top: 0;\n}\n\n.stepper-icon {\n  background-color: rgba(0, 0, 0, 0.38);\n  border-radius: 50%;\n  color: white;\n  font-size: 0.75rem;\n  font-weight: 400;\n  height: 1.5rem;\n  line-height: 1.5rem;\n  margin-right: 0.5rem;\n  position: relative;\n  text-align: center;\n  vertical-align: middle;\n  width: 1.5rem;\n}\n\n.stepper.active .stepper-icon,\n.stepper.done .stepper-icon {\n  color: white;\n  background-color: #9c27b0;\n}\n\n.stepper-icon .material-icons {\n  font-size: 1.333em;\n}\n\n.stepper-text {\n  color: rgba(0, 0, 0, 0.38);\n  font-size: 0.875rem;\n  font-weight: 400;\n  position: relative;\n}\n\n.stepper.active .stepper-text,\n.stepper.done .stepper-text {\n  color: rgba(0, 0, 0, 0.87);\n}\n\n.stepper.active .stepper-text {\n  font-weight: bolder;\n}\n\n.stepper-text-sub {\n  font-weight: 400;\n}\n\n.nav-tabs {\n  box-shadow: inset 0 -2px 0 -1px rgba(0, 0, 0, 0.12);\n}\n\n.nav-tabs.border-0,\n.nav-tabs.border-bottom-0 {\n  box-shadow: none;\n}\n\n.nav-tabs .nav-link {\n  transition-duration: 0.3s;\n  transition-property: background-color, color, opacity;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  color: rgba(0, 0, 0, 0.87);\n  font-size: 0.875rem;\n  font-weight: 500;\n  line-height: 1;\n  min-height: 3rem;\n  opacity: 0.7;\n  padding: 1.0625rem 0.75rem;\n  position: relative;\n  text-transform: uppercase;\n}\n\n@media (min-width: 600px) {\n  .nav-tabs .nav-link {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .nav-tabs .nav-link {\n    transition-duration: 0.2s;\n  }\n}\n\n.nav-tabs .nav-link:active,\n.nav-tabs .nav-link:focus,\n.nav-tabs .nav-link:hover {\n  background-color: rgba(0, 0, 0, 0.12);\n}\n\n.nav-tabs .nav-link::before {\n  transition-duration: 0.3s;\n  transition-property: opacity;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  background-color: #ff4081;\n  content: '';\n  display: block;\n  height: 0.125rem;\n  opacity: 0;\n  position: absolute;\n  right: 0;\n  bottom: 0;\n  left: 0;\n}\n\n@media (min-width: 600px) {\n  .nav-tabs .nav-link::before {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .nav-tabs .nav-link::before {\n    transition-duration: 0.2s;\n  }\n}\n\n.nav-tabs .nav-link:active,\n.nav-tabs .nav-link.active {\n  opacity: 1;\n}\n\n.nav-tabs .nav-link.active {\n  color: #ff4081;\n}\n\n.nav-tabs .nav-link.active::before {\n  opacity: 1;\n}\n\n.nav-tabs .nav-link.disabled {\n  background-color: transparent;\n  color: rgba(0, 0, 0, 0.38);\n  opacity: 1;\n}\n\n.nav-tabs .nav-item.show .nav-link {\n  background-color: rgba(0, 0, 0, 0.12);\n  opacity: 1;\n}\n\n.nav-tabs-material {\n  position: relative;\n}\n\n.nav-tabs-material.animate .nav-link::before {\n  opacity: 0;\n}\n\n.nav-tabs-material.animate .nav-tabs-indicator {\n  transition-duration: 0.3s;\n  transition-property: left, right;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n@media (min-width: 600px) {\n  .nav-tabs-material.animate .nav-tabs-indicator {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .nav-tabs-material.animate .nav-tabs-indicator {\n    transition-duration: 0.2s;\n  }\n}\n\n.nav-tabs-material .nav-link::before {\n  transition: none;\n}\n\n.nav-tabs-material .nav-tabs-indicator {\n  background-color: #ff4081;\n  display: none;\n  height: 0.125rem;\n  position: absolute;\n  bottom: 0;\n}\n\n.nav-tabs-material .nav-tabs-indicator.show {\n  display: block;\n}\n\n.nav-tabs-scrollable {\n  box-shadow: inset 0 -2px 0 -1px rgba(0, 0, 0, 0.12);\n  height: 3rem;\n  overflow: hidden;\n}\n\n.nav-tabs-scrollable .nav-tabs {\n  box-shadow: none;\n  flex-wrap: nowrap;\n  overflow-x: auto;\n  overflow-y: hidden;\n  padding-bottom: 3rem;\n}\n\n.nav-tabs-scrollable .nav-tabs::-webkit-scrollbar {\n  display: none;\n}\n\n.form-control,\n.custom-select {\n  font-size: 1rem;\n  height: 2.25rem;\n  line-height: 1.42857;\n  padding: 0.41071rem 0 0.34821rem;\n  transition-duration: 0.3s;\n  transition-property: border-color, box-shadow;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  background-clip: padding-box;\n  background-color: transparent;\n  background-image: none;\n  border-color: rgba(0, 0, 0, 0.42);\n  border-radius: 0;\n  border-style: solid;\n  border-width: 0 0 1px;\n  box-shadow: none;\n  color: rgba(0, 0, 0, 0.87);\n  display: block;\n  width: 100%;\n}\n\n@media (min-width: 600px) {\n  .form-control,\n  .custom-select {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .form-control,\n  .custom-select {\n    transition-duration: 0.2s;\n  }\n}\n\n.form-control:hover,\n.custom-select:hover {\n  border-color: rgba(0, 0, 0, 0.87);\n  box-shadow: inset 0 -2px 0 -1px rgba(0, 0, 0, 0.87);\n}\n\n.form-control::-ms-expand,\n.custom-select::-ms-expand {\n  background-color: transparent;\n  border: 0;\n}\n\n.form-control::placeholder,\n.custom-select::placeholder {\n  color: rgba(0, 0, 0, 0.38);\n  opacity: 1;\n}\n\n.form-control:disabled,\n.form-control[readonly],\n.custom-select:disabled,\n[readonly].custom-select {\n  border-style: dotted;\n  color: rgba(0, 0, 0, 0.38);\n  opacity: 1;\n}\n\n.form-control:disabled:hover,\n.form-control[readonly]:hover,\n.custom-select:disabled:hover,\n[readonly].custom-select:hover {\n  border-color: rgba(0, 0, 0, 0.42);\n  box-shadow: none;\n}\n\n.form-control:disabled:focus,\n.form-control[readonly]:focus,\n.custom-select:disabled:focus,\n[readonly].custom-select:focus {\n  border-color: rgba(0, 0, 0, 0.42);\n  box-shadow: none;\n}\n\n.form-control:focus,\n.custom-select:focus {\n  border-color: #9c27b0;\n  box-shadow: inset 0 -2px 0 -1px #9c27b0;\n  outline: 0;\n}\n\n.form-control:invalid:required,\n.custom-select:invalid:required {\n  outline: 0;\n}\n\n.form-control-primary {\n  border-color: #9c27b0;\n}\n\n.form-control-primary:focus,\n.form-control-primary:hover {\n  border-color: #9c27b0;\n  box-shadow: inset 0 -2px 0 -1px #9c27b0;\n}\n\n.form-control-secondary {\n  border-color: #ff4081;\n}\n\n.form-control-secondary:focus,\n.form-control-secondary:hover {\n  border-color: #ff4081;\n  box-shadow: inset 0 -2px 0 -1px #ff4081;\n}\n\n.form-control-danger {\n  border-color: #f44336;\n}\n\n.form-control-danger:focus,\n.form-control-danger:hover {\n  border-color: #f44336;\n  box-shadow: inset 0 -2px 0 -1px #f44336;\n}\n\n.form-control-info {\n  border-color: #2196f3;\n}\n\n.form-control-info:focus,\n.form-control-info:hover {\n  border-color: #2196f3;\n  box-shadow: inset 0 -2px 0 -1px #2196f3;\n}\n\n.form-control-success {\n  border-color: #4caf50;\n}\n\n.form-control-success:focus,\n.form-control-success:hover {\n  border-color: #4caf50;\n  box-shadow: inset 0 -2px 0 -1px #4caf50;\n}\n\n.form-control-warning {\n  border-color: #ff9800;\n}\n\n.form-control-warning:focus,\n.form-control-warning:hover {\n  border-color: #ff9800;\n  box-shadow: inset 0 -2px 0 -1px #ff9800;\n}\n\n.form-control-dark {\n  border-color: #424242;\n}\n\n.form-control-dark:focus,\n.form-control-dark:hover {\n  border-color: #424242;\n  box-shadow: inset 0 -2px 0 -1px #424242;\n}\n\n.form-control-light {\n  border-color: #f5f5f5;\n}\n\n.form-control-light:focus,\n.form-control-light:hover {\n  border-color: #f5f5f5;\n  box-shadow: inset 0 -2px 0 -1px #f5f5f5;\n}\n\n.form-control-lg,\n.floating-label-lg > .form-control,\n.input-group-lg > .form-control {\n  font-size: 2.125rem;\n  height: 3.75rem;\n  line-height: 1.17647;\n  padding: 0.625rem 0 0.5625rem;\n}\n\n.form-control-sm,\n.floating-label-sm > .form-control,\n.input-group-sm > .form-control {\n  font-size: 0.8125rem;\n  height: 2rem;\n  line-height: 1.38461;\n  padding: 0.4375rem 0 0.375rem;\n}\n\nselect.form-control:not([multiple]):not([size]),\n.custom-select {\n  appearance: none;\n}\n\n@media screen and (-webkit-min-device-pixel-ratio: 0), screen and (min--moz-device-pixel-ratio: 0) {\n  select.form-control:not([multiple]):not([size]),\n  .custom-select {\n    background-image: url('data:image/svg+xml;charset=utf8,%3Csvg fill=\"%23000000\" fill-opacity=\"0.54\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M7 10l5 5 5-5z\"/%3E%3Cpath d=\"M0 0h24v24H0z\" fill=\"none\"/%3E%3C/svg%3E');\n    background-position: 100% 0.375rem;\n    background-repeat: no-repeat;\n    background-size: 1.5rem 1.5rem;\n    padding-right: 1.5rem;\n  }\n}\n\n@media screen and (-webkit-min-device-pixel-ratio: 0), screen and (min--moz-device-pixel-ratio: 0) {\n  select.form-control-lg.form-control:not([multiple]):not([size]),\n  .form-control-lg.custom-select {\n    background-position: 100% 0.28125rem;\n    background-size: 3.1875rem 3.1875rem;\n    padding-right: 3.1875rem;\n  }\n}\n\n@media screen and (-webkit-min-device-pixel-ratio: 0), screen and (min--moz-device-pixel-ratio: 0) {\n  select.form-control-sm.form-control:not([multiple]):not([size]),\n  .form-control-sm.custom-select {\n    background-position: 100% 0.39062rem;\n    background-size: 1.21875rem 1.21875rem;\n    padding-right: 1.21875rem;\n  }\n}\n\nselect.form-control[multiple],\nselect.form-control[size],\ntextarea.form-control:not(.textarea-autosize) {\n  border-radius: 4px;\n  border-width: 1px;\n  height: auto;\n  padding: 1.125rem 1rem;\n}\n\nselect.form-control[multiple]:hover,\nselect.form-control[size]:hover,\ntextarea.form-control:hover:not(.textarea-autosize) {\n  box-shadow: inset 2px 2px 0 -1px rgba(0, 0, 0, 0.87), inset -2px -2px 0 -1px rgba(0, 0, 0, 0.87);\n}\n\nselect.form-control[multiple]:focus,\nselect.form-control[size]:focus,\ntextarea.form-control:focus:not(.textarea-autosize) {\n  box-shadow: inset 2px 2px 0 -1px #9c27b0, inset -2px -2px 0 -1px #9c27b0;\n}\n\nselect.form-control-lg.form-control[multiple],\nselect.form-control-lg.form-control[size],\ntextarea.form-control-lg.form-control:not(.textarea-autosize) {\n  padding: 1.125rem 1rem;\n}\n\nselect.form-control-sm.form-control[multiple],\nselect.form-control-sm.form-control[size],\ntextarea.form-control-sm.form-control:not(.textarea-autosize) {\n  padding: 0.75rem 0.75rem;\n}\n\n.form-control-plaintext {\n  font-size: 1rem;\n  height: 2.25rem;\n  line-height: 1.42857;\n  padding: 0.41071rem 0 0.34821rem;\n  border-color: transparent;\n}\n\n.form-control-plaintext.form-control-lg {\n  font-size: 2.125rem;\n  height: 3.75rem;\n  line-height: 1.17647;\n  padding: 0.625rem 0 0.5625rem;\n}\n\n.form-control-plaintext.form-control-sm {\n  font-size: 0.8125rem;\n  height: 2rem;\n  line-height: 1.38461;\n  padding: 0.4375rem 0 0.375rem;\n}\n\n.was-validated .custom-control-input:invalid ~ .custom-control-indicator,\n.was-validated .custom-control-input:invalid ~ .custom-control-description,\n.custom-control-input.is-invalid ~ .custom-control-indicator,\n.custom-control-input.is-invalid ~ .custom-control-description {\n  color: #f44336;\n}\n\n.was-validated .custom-file-input:invalid:focus ~ .custom-file-control,\n.custom-file-input.is-invalid:focus ~ .custom-file-control {\n  border-bottom-color: #f44336;\n  box-shadow: inset 0 -2px 0 -1px #f44336;\n}\n\n.was-validated .custom-file-input:invalid ~ .custom-file-control,\n.custom-file-input.is-invalid ~ .custom-file-control {\n  border-color: #f44336;\n}\n\n.was-validated .custom-file-input:invalid ~ .custom-file-control:hover,\n.custom-file-input.is-invalid ~ .custom-file-control:hover {\n  border-bottom-color: #f44336;\n  box-shadow: inset 0 -2px 0 -1px #f44336;\n}\n\n.was-validated .custom-file-input:invalid ~ .invalid-feedback,\n.was-validated .custom-file-input:invalid ~ .invalid-tooltip,\n.custom-file-input.is-invalid ~ .invalid-feedback,\n.custom-file-input.is-invalid ~ .invalid-tooltip {\n  display: block;\n}\n\n.was-validated .custom-select:invalid,\n.custom-select.is-invalid,\n.was-validated\n.form-control:invalid,\n.form-control.is-invalid {\n  border-color: #f44336;\n}\n\n.was-validated .custom-select:invalid:focus,\n.was-validated .custom-select:invalid:hover,\n.custom-select.is-invalid:focus,\n.custom-select.is-invalid:hover,\n.was-validated\n  .form-control:invalid:focus,\n.was-validated\n  .form-control:invalid:hover,\n.form-control.is-invalid:focus,\n.form-control.is-invalid:hover {\n  border-color: #f44336;\n  box-shadow: inset 0 -2px 0 -1px #f44336;\n}\n\n.was-validated .custom-select:invalid ~ .invalid-feedback,\n.was-validated .custom-select:invalid ~ .invalid-tooltip,\n.custom-select.is-invalid ~ .invalid-feedback,\n.custom-select.is-invalid ~ .invalid-tooltip,\n.was-validated\n  .form-control:invalid ~ .invalid-feedback,\n.was-validated\n  .form-control:invalid ~ .invalid-tooltip,\n.form-control.is-invalid ~ .invalid-feedback,\n.form-control.is-invalid ~ .invalid-tooltip {\n  display: block;\n}\n\n.was-validated .form-check-input:invalid + .form-check-label,\n.form-check-input.is-invalid + .form-check-label {\n  color: #f44336;\n}\n\n.was-validated .custom-control-input:valid ~ .custom-control-indicator,\n.was-validated .custom-control-input:valid ~ .custom-control-description,\n.custom-control-input.is-valid ~ .custom-control-indicator,\n.custom-control-input.is-valid ~ .custom-control-description {\n  color: #4caf50;\n}\n\n.was-validated .custom-file-input:valid:focus ~ .custom-file-control,\n.custom-file-input.is-valid:focus ~ .custom-file-control {\n  border-bottom-color: #4caf50;\n  box-shadow: inset 0 -2px 0 -1px #4caf50;\n}\n\n.was-validated .custom-file-input:valid ~ .custom-file-control,\n.custom-file-input.is-valid ~ .custom-file-control {\n  border-color: #4caf50;\n}\n\n.was-validated .custom-file-input:valid ~ .custom-file-control:hover,\n.custom-file-input.is-valid ~ .custom-file-control:hover {\n  border-bottom-color: #4caf50;\n  box-shadow: inset 0 -2px 0 -1px #4caf50;\n}\n\n.was-validated .custom-file-input:valid ~ .valid-feedback,\n.was-validated .custom-file-input:valid ~ .valid-tooltip,\n.custom-file-input.is-valid ~ .valid-feedback,\n.custom-file-input.is-valid ~ .valid-tooltip {\n  display: block;\n}\n\n.was-validated .custom-select:valid,\n.custom-select.is-valid,\n.was-validated\n.form-control:valid,\n.form-control.is-valid {\n  border-color: #4caf50;\n}\n\n.was-validated .custom-select:valid:focus,\n.was-validated .custom-select:valid:hover,\n.custom-select.is-valid:focus,\n.custom-select.is-valid:hover,\n.was-validated\n  .form-control:valid:focus,\n.was-validated\n  .form-control:valid:hover,\n.form-control.is-valid:focus,\n.form-control.is-valid:hover {\n  border-color: #4caf50;\n  box-shadow: inset 0 -2px 0 -1px #4caf50;\n}\n\n.was-validated .custom-select:valid ~ .valid-feedback,\n.was-validated .custom-select:valid ~ .valid-tooltip,\n.custom-select.is-valid ~ .valid-feedback,\n.custom-select.is-valid ~ .valid-tooltip,\n.was-validated\n  .form-control:valid ~ .valid-feedback,\n.was-validated\n  .form-control:valid ~ .valid-tooltip,\n.form-control.is-valid ~ .valid-feedback,\n.form-control.is-valid ~ .valid-tooltip {\n  display: block;\n}\n\n.was-validated .form-check-input:valid + .form-check-label,\n.form-check-input.is-valid + .form-check-label {\n  color: #4caf50;\n}\n\n.custom-select {\n  display: inline-block;\n  vertical-align: middle;\n  width: auto;\n}\n\n.floating-label {\n  padding-top: 0.75rem;\n  position: relative;\n}\n\n.floating-label > label {\n  font-size: 1rem;\n  line-height: 1.42857;\n  top: 1.16071rem;\n}\n\n.floating-label.has-value > label,\n.floating-label.is-focused > label {\n  transform: scale(0.75);\n}\n\n.floating-label > label {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  transition-duration: 0.3s;\n  transition-property: color, line-height, top, transform;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  color: rgba(0, 0, 0, 0.38);\n  display: block;\n  font-weight: normal;\n  margin: 0;\n  padding: 0;\n  position: absolute;\n  left: 0;\n  transform-origin: 0 0;\n}\n\n@media (min-width: 600px) {\n  .floating-label > label {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .floating-label > label {\n    transition-duration: 0.2s;\n  }\n}\n\n.floating-label.has-value > label,\n.floating-label.is-focused > label {\n  line-height: 1;\n  top: 0;\n}\n\n.floating-label.is-focused > label {\n  color: #9c27b0;\n}\n\n.floating-label > .form-control {\n  position: relative;\n}\n\n.floating-label > .form-control:focus::placeholder {\n  color: rgba(0, 0, 0, 0.38);\n  opacity: 1;\n}\n\n.floating-label > .form-control::placeholder {\n  transition-duration: 0.3s;\n  transition-property: opacity;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  color: transparent;\n  opacity: 0;\n}\n\n@media (min-width: 600px) {\n  .floating-label > .form-control::placeholder {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .floating-label > .form-control::placeholder {\n    transition-duration: 0.2s;\n  }\n}\n\n.floating-label-lg > label {\n  font-size: 2.125rem;\n  line-height: 1.17647;\n  top: 1.375rem;\n}\n\n.floating-label-lg.has-value > label,\n.floating-label-lg.is-focused > label {\n  transform: scale(0.35294);\n}\n\n.floating-label-sm > label {\n  font-size: 0.8125rem;\n  line-height: 1.38461;\n  top: 1.1875rem;\n}\n\n.floating-label-sm.has-value > label,\n.floating-label-sm.is-focused > label {\n  transform: scale(0.92308);\n}\n\n.input-group {\n  align-items: center;\n  display: flex;\n  position: relative;\n  width: 100%;\n}\n\n.input-group .form-control {\n  flex: 1 1 auto;\n  width: 1%;\n}\n\n.input-group-addon {\n  align-items: center;\n  color: inherit;\n  display: flex;\n  font-size: 1rem;\n  justify-content: center;\n  line-height: 1.42857;\n  min-width: 2.25rem;\n  white-space: nowrap;\n}\n\n.input-group-addon + .form-control,\n.form-control + .input-group-addon {\n  margin-left: 1rem;\n}\n\n.input-group-btn {\n  border-radius: 2px;\n  align-items: center;\n  background-color: white;\n  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.14), 0 3px 4px 0 rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);\n  display: flex;\n  justify-content: center;\n  margin-right: 1rem;\n  margin-left: 1rem;\n}\n\n.input-group-btn:first-child {\n  margin-left: 0;\n}\n\n.input-group-btn:last-child {\n  margin-right: 0;\n}\n\n.input-group-btn > .btn {\n  border-left: 1px solid transparent;\n  box-shadow: none;\n  flex: 0 1 auto;\n  margin-left: -1px;\n  min-width: 0;\n}\n\n.input-group-btn > .btn:active,\n.input-group-btn > .btn.active {\n  box-shadow: none;\n}\n\n.input-group-btn > .btn:disabled + .btn:disabled,\n.input-group-btn > .btn:disabled + .btn.disabled,\n.input-group-btn > .btn.disabled + .btn:disabled,\n.input-group-btn > .btn.disabled + .btn.disabled {\n  border-left-color: rgba(0, 0, 0, 0.12);\n}\n\n.input-group-btn > .btn:first-child {\n  border-left-width: 0;\n  margin-left: 0;\n}\n\n.input-group-btn > .btn.active + .btn.active {\n  border-left-color: rgba(0, 0, 0, 0.12);\n}\n\n.input-group-btn > .btn-primary:disabled,\n.input-group-btn > .btn-primary.disabled {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #e1bee7;\n}\n\n.input-group-btn > .btn-secondary:disabled,\n.input-group-btn > .btn-secondary.disabled {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #ff80ab;\n}\n\n.input-group-btn > .btn-danger:disabled,\n.input-group-btn > .btn-danger.disabled {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #ffcdd2;\n}\n\n.input-group-btn > .btn-info:disabled,\n.input-group-btn > .btn-info.disabled {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #bbdefb;\n}\n\n.input-group-btn > .btn-success:disabled,\n.input-group-btn > .btn-success.disabled {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #c8e6c9;\n}\n\n.input-group-btn > .btn-warning:disabled,\n.input-group-btn > .btn-warning.disabled {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #ffe0b2;\n}\n\n.input-group-btn > .btn-dark:disabled,\n.input-group-btn > .btn-dark.disabled {\n  color: white;\n  background-color: #757575;\n}\n\n.input-group-btn > .btn-light:disabled,\n.input-group-btn > .btn-light.disabled {\n  color: rgba(0, 0, 0, 0.87);\n  background-color: #fafafa;\n}\n\n.input-group-btn > .btn:first-child:not(:last-child):not(.dropdown-toggle) {\n  border-top-right-radius: 0;\n  border-bottom-right-radius: 0;\n}\n\n.input-group-btn > .btn:last-child:not(:first-child),\n.input-group-btn > .dropdown-toggle:not(:first-child) {\n  border-bottom-left-radius: 0;\n  border-top-left-radius: 0;\n}\n\n.input-group-btn > .btn:not(:first-child):not(:last-child):not(.dropdown-toggle) {\n  border-radius: 0;\n}\n\n.input-group-btn > .dropdown-toggle:not(:last-child):not(:nth-last-child(2)) {\n  border-top-right-radius: 0;\n  border-bottom-right-radius: 0;\n}\n\n.input-group-lg > .input-group-addon {\n  font-size: 2.125rem;\n  line-height: 1.17647;\n  min-width: 3.75rem;\n}\n\n.input-group-sm > .input-group-addon {\n  font-size: 0.8125rem;\n  line-height: 1.38461;\n  min-width: 2rem;\n}\n\ntextarea.textarea-autosize {\n  height: 2.25rem;\n  min-height: 2.25rem;\n  resize: none;\n}\n\ntextarea.textarea-autosize.form-control-lg {\n  height: 3.75rem;\n  min-height: 3.75rem;\n}\n\ntextarea.textarea-autosize.form-control-sm {\n  height: 2rem;\n  min-height: 2rem;\n}\n\n.navbar {\n  align-items: center;\n  color: rgba(0, 0, 0, 0.87);\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: space-between;\n  min-height: 3.5rem;\n  padding: 0.625rem 1rem;\n  position: relative;\n}\n\n.navbar > .container {\n  align-items: center;\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: space-between;\n}\n\n.navbar .btn {\n  margin-top: 0rem;\n  margin-bottom: 0rem;\n}\n\n.navbar .btn-lg {\n  margin-top: -0.125rem;\n  margin-bottom: -0.125rem;\n}\n\n.navbar .btn-sm {\n  margin-top: 0.125rem;\n  margin-bottom: 0.125rem;\n}\n\n.navbar .form-control {\n  border-radius: 2px;\n  transition-duration: 0.3s;\n  transition-property: opacity;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  background-color: rgba(0, 0, 0, 0.12);\n  border: 0;\n  color: inherit;\n  height: 2.25rem;\n  opacity: 0.7;\n  padding: 0.41071rem 1rem;\n}\n\n@media (min-width: 600px) {\n  .navbar .form-control {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .navbar .form-control {\n    transition-duration: 0.2s;\n  }\n}\n\n.navbar .form-control:focus,\n.navbar .form-control:hover {\n  box-shadow: none;\n  opacity: 1;\n}\n\n.navbar .form-inline {\n  margin-left: 1rem;\n}\n\n.navbar .form-inline:first-child {\n  margin-left: 0;\n}\n\n.navbar .input-group {\n  border-radius: 2px;\n  transition-duration: 0.3s;\n  transition-property: opacity;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  background-color: rgba(0, 0, 0, 0.12);\n  opacity: 0.7;\n}\n\n@media (min-width: 600px) {\n  .navbar .input-group {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .navbar .input-group {\n    transition-duration: 0.2s;\n  }\n}\n\n.navbar .input-group:focus,\n.navbar .input-group:hover {\n  opacity: 1;\n}\n\n.navbar .input-group .form-control {\n  border-radius: 0;\n  background-color: transparent;\n  margin-left: 0;\n  opacity: 1;\n}\n\n.navbar .input-group .input-group-addon {\n  margin-left: 0;\n}\n\n.navbar .nav-tabs {\n  margin-top: -0.625rem;\n  margin-bottom: -0.625rem;\n}\n\n.navbar .nav-tabs .nav-link {\n  min-height: 3.5rem;\n  padding-top: 1.3125rem;\n  padding-bottom: 1.3125rem;\n}\n\n.navbar-dark {\n  color: white;\n}\n\n.navbar-dark .form-control,\n.navbar-dark .input-group,\n.navbar-dark .navbar-brand::before,\n.navbar-dark .navbar-nav .show > .nav-link,\n.navbar-dark .navbar-toggler::before {\n  background-color: rgba(255, 255, 255, 0.12);\n}\n\n.navbar-dark .form-control::placeholder,\n.navbar-dark .navbar-nav .nav-link.disabled {\n  color: rgba(255, 255, 255, 0.5);\n}\n\n.navbar-fixed-bottom,\n.navbar-fixed-top {\n  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.14), 0 4px 5px 0 rgba(0, 0, 0, 0.12), 0 1px 10px 0 rgba(0, 0, 0, 0.2);\n  position: fixed;\n  right: 0;\n  left: 0;\n  z-index: 40;\n}\n\n.navbar-fixed-bottom {\n  bottom: 0;\n}\n\n.navbar-fixed-top {\n  top: 0;\n}\n\n.navbar-full {\n  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.14), 0 4px 5px 0 rgba(0, 0, 0, 0.12), 0 1px 10px 0 rgba(0, 0, 0, 0.2);\n  z-index: 40;\n}\n\n.navbar-sticky-top {\n  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.14), 0 4px 5px 0 rgba(0, 0, 0, 0.12), 0 1px 10px 0 rgba(0, 0, 0, 0.2);\n  position: sticky;\n  top: 0;\n  width: 100%;\n  z-index: 40;\n}\n\n.toolbar-waterfall {\n  transition-duration: 0.3s;\n  transition-property: background-color, box-shadow;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  position: absolute;\n  top: 0;\n  right: 0;\n  left: 0;\n  z-index: 40;\n}\n\n@media (min-width: 600px) {\n  .toolbar-waterfall {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .toolbar-waterfall {\n    transition-duration: 0.2s;\n  }\n}\n\n.toolbar-waterfall.waterfall {\n  background-color: #9c27b0;\n  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.14), 0 4px 5px 0 rgba(0, 0, 0, 0.12), 0 1px 10px 0 rgba(0, 0, 0, 0.2);\n  position: fixed;\n}\n\n.navbar-brand {\n  font-size: 1.25rem;\n  font-weight: 500;\n  letter-spacing: 0.02em;\n  line-height: 1.4;\n  align-items: center;\n  color: inherit;\n  display: inline-flex;\n  height: 2.25rem;\n  margin-left: 1rem;\n  position: relative;\n  white-space: nowrap;\n}\n\n.navbar-brand:active,\n.navbar-brand:focus,\n.navbar-brand:hover {\n  color: inherit;\n  text-decoration: none;\n}\n\n.navbar-brand::before {\n  transition-duration: 0.3s;\n  transition-property: opacity;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  background-color: rgba(0, 0, 0, 0.12);\n  content: '';\n  display: block;\n  opacity: 0;\n  position: absolute;\n  top: 0;\n  right: -0.5rem;\n  bottom: 0;\n  left: -0.5rem;\n}\n\n@media (min-width: 600px) {\n  .navbar-brand::before {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .navbar-brand::before {\n    transition-duration: 0.2s;\n  }\n}\n\n.navbar-brand:first-child {\n  margin-left: 0;\n}\n\n.navbar-brand:focus {\n  outline: 0;\n}\n\n.navbar-brand:focus::before {\n  opacity: 1;\n}\n\n.navbar-text {\n  align-items: center;\n  color: inherit;\n  display: inline-flex;\n  flex-wrap: wrap;\n  height: 2.25rem;\n  margin-left: 1rem;\n}\n\n.navbar-text:first-child {\n  margin-left: 0;\n}\n\n.navbar-nav {\n  display: flex;\n  flex-wrap: wrap;\n  list-style: none;\n  margin-bottom: 0;\n  padding-left: 0;\n}\n\n.navbar-nav .nav-link {\n  border-radius: 2px;\n  transition-duration: 0.3s;\n  transition-property: background-color, opacity;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  color: inherit;\n  font-size: 1rem;\n  height: 2.25rem;\n  line-height: 1;\n  opacity: 0.7;\n  padding: 0.625rem 1rem;\n}\n\n@media (min-width: 600px) {\n  .navbar-nav .nav-link {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .navbar-nav .nav-link {\n    transition-duration: 0.2s;\n  }\n}\n\n.navbar-nav .nav-link:active,\n.navbar-nav .nav-link:focus,\n.navbar-nav .nav-link:hover {\n  background-color: rgba(0, 0, 0, 0.12);\n  opacity: 1;\n}\n\n.navbar-nav .nav-link:focus {\n  outline: 0;\n}\n\n.navbar-nav .nav-link.active,\n.navbar-nav .nav-link.disabled {\n  opacity: 1;\n}\n\n.navbar-nav .nav-link.disabled {\n  background-color: transparent;\n  color: rgba(0, 0, 0, 0.38);\n}\n\n.navbar-nav .active > .nav-link,\n.navbar-nav .show > .nav-link {\n  opacity: 1;\n}\n\n.navbar-nav .show > .nav-link {\n  background-color: rgba(0, 0, 0, 0.12);\n}\n\n.navbar-collapse {\n  align-items: center;\n  flex-basis: 100%;\n}\n\n@media (max-width: 599px) {\n  .navbar-expand-sm > .container,\n  .navbar-expand-sm > .container-fluid {\n    padding-right: 0;\n    padding-left: 0;\n  }\n\n  .navbar-expand-sm .navbar-collapse > :first-child {\n    margin-top: 1rem;\n  }\n\n  .navbar-expand-sm .navbar-collapse > :not(:last-child) {\n    margin-bottom: 1rem;\n  }\n\n  .navbar-expand-sm .navbar-collapse .form-inline,\n  .navbar-expand-sm .navbar-collapse .navbar-brand,\n  .navbar-expand-sm .navbar-collapse .navbar-text {\n    margin-left: 0;\n  }\n}\n\n@media (min-width: 600px) {\n  .navbar-expand-sm {\n    flex-direction: row;\n    flex-wrap: nowrap;\n    justify-content: flex-start;\n  }\n\n  .navbar-expand-sm > .container,\n  .navbar-expand-sm > .container-fluid {\n    flex-wrap: nowrap;\n  }\n\n  .navbar-expand-sm .navbar-collapse {\n    display: flex !important;\n  }\n\n  .navbar-expand-sm .navbar-nav {\n    flex-wrap: nowrap;\n  }\n\n  .navbar-expand-sm .navbar-toggler {\n    display: none;\n  }\n\n  .navbar-expand-sm .navbar-toggler + .form-inline,\n  .navbar-expand-sm .navbar-toggler + .navbar-brand,\n  .navbar-expand-sm .navbar-toggler + .navbar-text {\n    margin-left: 0;\n  }\n}\n\n@media (max-width: 959px) {\n  .navbar-expand-md > .container,\n  .navbar-expand-md > .container-fluid {\n    padding-right: 0;\n    padding-left: 0;\n  }\n\n  .navbar-expand-md .navbar-collapse > :first-child {\n    margin-top: 1rem;\n  }\n\n  .navbar-expand-md .navbar-collapse > :not(:last-child) {\n    margin-bottom: 1rem;\n  }\n\n  .navbar-expand-md .navbar-collapse .form-inline,\n  .navbar-expand-md .navbar-collapse .navbar-brand,\n  .navbar-expand-md .navbar-collapse .navbar-text {\n    margin-left: 0;\n  }\n}\n\n@media (min-width: 960px) {\n  .navbar-expand-md {\n    flex-direction: row;\n    flex-wrap: nowrap;\n    justify-content: flex-start;\n  }\n\n  .navbar-expand-md > .container,\n  .navbar-expand-md > .container-fluid {\n    flex-wrap: nowrap;\n  }\n\n  .navbar-expand-md .navbar-collapse {\n    display: flex !important;\n  }\n\n  .navbar-expand-md .navbar-nav {\n    flex-wrap: nowrap;\n  }\n\n  .navbar-expand-md .navbar-toggler {\n    display: none;\n  }\n\n  .navbar-expand-md .navbar-toggler + .form-inline,\n  .navbar-expand-md .navbar-toggler + .navbar-brand,\n  .navbar-expand-md .navbar-toggler + .navbar-text {\n    margin-left: 0;\n  }\n}\n\n@media (max-width: 1279px) {\n  .navbar-expand-lg > .container,\n  .navbar-expand-lg > .container-fluid {\n    padding-right: 0;\n    padding-left: 0;\n  }\n\n  .navbar-expand-lg .navbar-collapse > :first-child {\n    margin-top: 1rem;\n  }\n\n  .navbar-expand-lg .navbar-collapse > :not(:last-child) {\n    margin-bottom: 1rem;\n  }\n\n  .navbar-expand-lg .navbar-collapse .form-inline,\n  .navbar-expand-lg .navbar-collapse .navbar-brand,\n  .navbar-expand-lg .navbar-collapse .navbar-text {\n    margin-left: 0;\n  }\n}\n\n@media (min-width: 1280px) {\n  .navbar-expand-lg {\n    flex-direction: row;\n    flex-wrap: nowrap;\n    justify-content: flex-start;\n  }\n\n  .navbar-expand-lg > .container,\n  .navbar-expand-lg > .container-fluid {\n    flex-wrap: nowrap;\n  }\n\n  .navbar-expand-lg .navbar-collapse {\n    display: flex !important;\n  }\n\n  .navbar-expand-lg .navbar-nav {\n    flex-wrap: nowrap;\n  }\n\n  .navbar-expand-lg .navbar-toggler {\n    display: none;\n  }\n\n  .navbar-expand-lg .navbar-toggler + .form-inline,\n  .navbar-expand-lg .navbar-toggler + .navbar-brand,\n  .navbar-expand-lg .navbar-toggler + .navbar-text {\n    margin-left: 0;\n  }\n}\n\n@media (max-width: 1919px) {\n  .navbar-expand-xl > .container,\n  .navbar-expand-xl > .container-fluid {\n    padding-right: 0;\n    padding-left: 0;\n  }\n\n  .navbar-expand-xl .navbar-collapse > :first-child {\n    margin-top: 1rem;\n  }\n\n  .navbar-expand-xl .navbar-collapse > :not(:last-child) {\n    margin-bottom: 1rem;\n  }\n\n  .navbar-expand-xl .navbar-collapse .form-inline,\n  .navbar-expand-xl .navbar-collapse .navbar-brand,\n  .navbar-expand-xl .navbar-collapse .navbar-text {\n    margin-left: 0;\n  }\n}\n\n@media (min-width: 1920px) {\n  .navbar-expand-xl {\n    flex-direction: row;\n    flex-wrap: nowrap;\n    justify-content: flex-start;\n  }\n\n  .navbar-expand-xl > .container,\n  .navbar-expand-xl > .container-fluid {\n    flex-wrap: nowrap;\n  }\n\n  .navbar-expand-xl .navbar-collapse {\n    display: flex !important;\n  }\n\n  .navbar-expand-xl .navbar-nav {\n    flex-wrap: nowrap;\n  }\n\n  .navbar-expand-xl .navbar-toggler {\n    display: none;\n  }\n\n  .navbar-expand-xl .navbar-toggler + .form-inline,\n  .navbar-expand-xl .navbar-toggler + .navbar-brand,\n  .navbar-expand-xl .navbar-toggler + .navbar-text {\n    margin-left: 0;\n  }\n}\n\n.navbar-expand {\n  flex-direction: row;\n  flex-wrap: nowrap;\n  justify-content: flex-start;\n}\n\n.navbar-expand > .container,\n.navbar-expand > .container-fluid {\n  padding-right: 0;\n  padding-left: 0;\n}\n\n.navbar-expand .navbar-collapse > :first-child {\n  margin-top: 1rem;\n}\n\n.navbar-expand .navbar-collapse > :not(:last-child) {\n  margin-bottom: 1rem;\n}\n\n.navbar-expand .navbar-collapse .form-inline,\n.navbar-expand .navbar-collapse .navbar-brand,\n.navbar-expand .navbar-collapse .navbar-text {\n  margin-left: 0;\n}\n\n.navbar-expand > .container,\n.navbar-expand > .container-fluid {\n  flex-wrap: nowrap;\n}\n\n.navbar-expand .navbar-collapse {\n  display: flex !important;\n}\n\n.navbar-expand .navbar-nav {\n  flex-wrap: nowrap;\n}\n\n.navbar-expand .navbar-toggler {\n  display: none;\n}\n\n.navbar-expand .navbar-toggler + .form-inline,\n.navbar-expand .navbar-toggler + .navbar-brand,\n.navbar-expand .navbar-toggler + .navbar-text {\n  margin-left: 0;\n}\n\n.navbar-toggler {\n  align-items: center;\n  background-color: transparent;\n  border: 0;\n  border-radius: 50%;\n  color: inherit;\n  display: inline-flex;\n  height: 2.25rem;\n  line-height: 1;\n  margin-left: 1rem;\n  position: relative;\n  width: 2.25rem;\n}\n\n.navbar-toggler:active,\n.navbar-toggler:focus,\n.navbar-toggler:hover {\n  text-decoration: none;\n}\n\n.navbar-toggler:active::before,\n.navbar-toggler:focus::before,\n.navbar-toggler:hover::before {\n  opacity: 1;\n}\n\n.navbar-toggler::before {\n  transition-duration: 0.3s;\n  transition-property: opacity;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  background-color: rgba(0, 0, 0, 0.12);\n  border-radius: 50%;\n  content: '';\n  display: block;\n  opacity: 0;\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n}\n\n@media (min-width: 600px) {\n  .navbar-toggler::before {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .navbar-toggler::before {\n    transition-duration: 0.2s;\n  }\n}\n\n.navbar-toggler:first-child {\n  margin-left: 0;\n}\n\n.navbar-toggler:focus {\n  outline: 0;\n}\n\n.navbar-toggler-icon {\n  font-size: 1.5em;\n  line-height: 0.66667em;\n  vertical-align: -0.34537em;\n  font-family: 'Material Icons';\n  font-feature-settings: 'liga';\n  font-style: normal;\n  font-weight: normal;\n  letter-spacing: normal;\n  text-rendering: optimizeLegibility;\n  text-transform: none;\n  white-space: nowrap;\n  word-wrap: normal;\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-font-smoothing: antialiased;\n  display: block;\n  margin: auto;\n}\n\n.navbar-toggler-icon::before {\n  content: \"menu\";\n}\n\n.tooltip {\n  text-align: left;\n  text-align: start;\n  font-family: Roboto, -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Helvetica Neue\", Arial, sans-serif;\n  font-style: normal;\n  font-weight: normal;\n  letter-spacing: normal;\n  line-break: auto;\n  line-height: 1.42857;\n  text-decoration: none;\n  text-shadow: none;\n  text-transform: none;\n  white-space: normal;\n  word-break: normal;\n  word-spacing: normal;\n  display: block;\n  font-size: 0.875rem;\n  line-height: 1.42857;\n  margin: 1.5rem;\n  opacity: 0;\n  position: absolute;\n  word-break: break-word;\n  z-index: 240;\n}\n\n[dir='rtl'] .tooltip {\n  text-align: right;\n  text-align: start;\n}\n\n.tooltip.show {\n  opacity: 0.9;\n}\n\n.tooltip.show .tooltip-inner {\n  transform: scale(1);\n}\n\n.tooltip-inner {\n  border-radius: 2px;\n  transition-duration: 0.3s;\n  transition-property: transform;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  background-color: #616161;\n  color: white;\n  padding: 0.375rem 1rem;\n  text-align: center;\n  transform: scale(0.87);\n}\n\n@media (min-width: 600px) {\n  .tooltip-inner {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .tooltip-inner {\n    transition-duration: 0.2s;\n  }\n}\n\n@media (min-width: 960px) {\n  .tooltip {\n    font-size: 0.625rem;\n    margin: 0.875rem;\n  }\n\n  .tooltip-inner {\n    padding: 0.24107rem 0.5rem;\n  }\n}\n\n.align-top {\n  vertical-align: top !important;\n}\n\n.align-text-top {\n  vertical-align: text-top !important;\n}\n\n.align-middle {\n  vertical-align: middle !important;\n}\n\n.align-baseline {\n  vertical-align: baseline !important;\n}\n\n.align-text-bottom {\n  vertical-align: text-bottom !important;\n}\n\n.align-bottom {\n  vertical-align: bottom !important;\n}\n\n.border-0 {\n  border: 0 !important;\n}\n\n.border-top-0 {\n  border-top: 0 !important;\n}\n\n.border-right-0 {\n  border-right: 0 !important;\n}\n\n.border-bottom-0 {\n  border-bottom: 0 !important;\n}\n\n.border-left-0 {\n  border-left: 0 !important;\n}\n\n.border-black {\n  border-color: #000000 !important;\n}\n\n.border-black-primary {\n  border-color: rgba(0, 0, 0, 0.87) !important;\n}\n\n.border-black-secondary {\n  border-color: rgba(0, 0, 0, 0.54) !important;\n}\n\n.border-black-hint {\n  border-color: rgba(0, 0, 0, 0.38) !important;\n}\n\n.border-black-divider {\n  border-color: rgba(0, 0, 0, 0.12) !important;\n}\n\n.border-white {\n  border-color: #ffffff !important;\n}\n\n.border-white-primary {\n  border-color: white !important;\n}\n\n.border-white-secondary {\n  border-color: rgba(255, 255, 255, 0.7) !important;\n}\n\n.border-white-hint {\n  border-color: rgba(255, 255, 255, 0.5) !important;\n}\n\n.border-white-divider {\n  border-color: rgba(255, 255, 255, 0.12) !important;\n}\n\n.border-primary {\n  border-color: #9c27b0 !important;\n}\n\n.border-secondary {\n  border-color: #ff4081 !important;\n}\n\n.border-danger {\n  border-color: #f44336 !important;\n}\n\n.border-info {\n  border-color: #2196f3 !important;\n}\n\n.border-success {\n  border-color: #4caf50 !important;\n}\n\n.border-warning {\n  border-color: #ff9800 !important;\n}\n\n.border-dark {\n  border-color: #424242 !important;\n}\n\n.border-light {\n  border-color: #f5f5f5 !important;\n}\n\n.rounded {\n  border-radius: 2px;\n}\n\n.rounded-0 {\n  border-radius: 0;\n}\n\n.rounded-circle {\n  border-radius: 50%;\n}\n\n.rounded-top {\n  border-top-left-radius: 2px;\n  border-top-right-radius: 2px;\n}\n\n.rounded-right {\n  border-top-right-radius: 2px;\n  border-bottom-right-radius: 2px;\n}\n\n.rounded-bottom {\n  border-bottom-right-radius: 2px;\n  border-bottom-left-radius: 2px;\n}\n\n.rounded-left {\n  border-bottom-left-radius: 2px;\n  border-top-left-radius: 2px;\n}\n\n.bg-dark-1 {\n  background-color: #000000 !important;\n}\n\n.bg-dark-2 {\n  background-color: #212121 !important;\n}\n\n.bg-dark-3 {\n  background-color: #303030 !important;\n}\n\n.bg-dark-4 {\n  background-color: #424242 !important;\n}\n\n.bg-light-1 {\n  background-color: #e0e0e0 !important;\n}\n\n.bg-light-2 {\n  background-color: #f5f5f5 !important;\n}\n\n.bg-light-3 {\n  background-color: #fafafa !important;\n}\n\n.bg-light-4 {\n  background-color: #ffffff !important;\n}\n\n.bg-transparent {\n  background-color: transparent !important;\n}\n\n.bg-white {\n  background-color: #ffffff !important;\n}\n\n.bg-primary {\n  background-color: #9c27b0 !important;\n}\n\na.bg-primary:active,\na.bg-primary:focus,\na.bg-primary:hover {\n  background-color: #7b1fa2 !important;\n}\n\n.bg-secondary {\n  background-color: #ff4081 !important;\n}\n\na.bg-secondary:active,\na.bg-secondary:focus,\na.bg-secondary:hover {\n  background-color: #f50057 !important;\n}\n\n.bg-danger {\n  background-color: #f44336 !important;\n}\n\na.bg-danger:active,\na.bg-danger:focus,\na.bg-danger:hover {\n  background-color: #d32f2f !important;\n}\n\n.bg-info {\n  background-color: #2196f3 !important;\n}\n\na.bg-info:active,\na.bg-info:focus,\na.bg-info:hover {\n  background-color: #1976d2 !important;\n}\n\n.bg-success {\n  background-color: #4caf50 !important;\n}\n\na.bg-success:active,\na.bg-success:focus,\na.bg-success:hover {\n  background-color: #388e3c !important;\n}\n\n.bg-warning {\n  background-color: #ff9800 !important;\n}\n\na.bg-warning:active,\na.bg-warning:focus,\na.bg-warning:hover {\n  background-color: #f57c00 !important;\n}\n\n.bg-dark {\n  background-color: #424242 !important;\n}\n\na.bg-dark:active,\na.bg-dark:focus,\na.bg-dark:hover {\n  background-color: #212121 !important;\n}\n\n.bg-light {\n  background-color: #f5f5f5 !important;\n}\n\na.bg-light:active,\na.bg-light:focus,\na.bg-light:hover {\n  background-color: #e0e0e0 !important;\n}\n\n.clearfix::after {\n  clear: both;\n  content: '';\n  display: table;\n}\n\n.d-block {\n  display: block !important;\n}\n\n.d-flex {\n  display: flex !important;\n}\n\n.d-inline {\n  display: inline !important;\n}\n\n.d-inline-block {\n  display: inline-block !important;\n}\n\n.d-inline-flex {\n  display: inline-flex !important;\n}\n\n.d-none {\n  display: none !important;\n}\n\n.d-table {\n  display: table !important;\n}\n\n.d-table-cell {\n  display: table-cell !important;\n}\n\n@media (min-width: 600px) {\n  .d-sm-block {\n    display: block !important;\n  }\n\n  .d-sm-flex {\n    display: flex !important;\n  }\n\n  .d-sm-inline {\n    display: inline !important;\n  }\n\n  .d-sm-inline-block {\n    display: inline-block !important;\n  }\n\n  .d-sm-inline-flex {\n    display: inline-flex !important;\n  }\n\n  .d-sm-none {\n    display: none !important;\n  }\n\n  .d-sm-table {\n    display: table !important;\n  }\n\n  .d-sm-table-cell {\n    display: table-cell !important;\n  }\n}\n\n@media (min-width: 960px) {\n  .d-md-block {\n    display: block !important;\n  }\n\n  .d-md-flex {\n    display: flex !important;\n  }\n\n  .d-md-inline {\n    display: inline !important;\n  }\n\n  .d-md-inline-block {\n    display: inline-block !important;\n  }\n\n  .d-md-inline-flex {\n    display: inline-flex !important;\n  }\n\n  .d-md-none {\n    display: none !important;\n  }\n\n  .d-md-table {\n    display: table !important;\n  }\n\n  .d-md-table-cell {\n    display: table-cell !important;\n  }\n}\n\n@media (min-width: 1280px) {\n  .d-lg-block {\n    display: block !important;\n  }\n\n  .d-lg-flex {\n    display: flex !important;\n  }\n\n  .d-lg-inline {\n    display: inline !important;\n  }\n\n  .d-lg-inline-block {\n    display: inline-block !important;\n  }\n\n  .d-lg-inline-flex {\n    display: inline-flex !important;\n  }\n\n  .d-lg-none {\n    display: none !important;\n  }\n\n  .d-lg-table {\n    display: table !important;\n  }\n\n  .d-lg-table-cell {\n    display: table-cell !important;\n  }\n}\n\n@media (min-width: 1920px) {\n  .d-xl-block {\n    display: block !important;\n  }\n\n  .d-xl-flex {\n    display: flex !important;\n  }\n\n  .d-xl-inline {\n    display: inline !important;\n  }\n\n  .d-xl-inline-block {\n    display: inline-block !important;\n  }\n\n  .d-xl-inline-flex {\n    display: inline-flex !important;\n  }\n\n  .d-xl-none {\n    display: none !important;\n  }\n\n  .d-xl-table {\n    display: table !important;\n  }\n\n  .d-xl-table-cell {\n    display: table-cell !important;\n  }\n}\n\n.d-print-block {\n  display: none !important;\n}\n\n@media print {\n  .d-print-block {\n    display: block !important;\n  }\n}\n\n.d-print-inline {\n  display: none !important;\n}\n\n@media print {\n  .d-print-inline {\n    display: inline !important;\n  }\n}\n\n.d-print-inline-block {\n  display: none !important;\n}\n\n@media print {\n  .d-print-inline-block {\n    display: inline-block !important;\n  }\n}\n\n@media print {\n  .d-print-none {\n    display: none !important;\n  }\n}\n\n.align-content-around {\n  align-content: space-around !important;\n}\n\n.align-content-between {\n  align-content: space-between !important;\n}\n\n.align-content-center {\n  align-content: center !important;\n}\n\n.align-content-end {\n  align-content: flex-end !important;\n}\n\n.align-content-start {\n  align-content: flex-start !important;\n}\n\n.align-content-stretch {\n  align-content: stretch !important;\n}\n\n.align-items-baseline {\n  align-items: baseline !important;\n}\n\n.align-items-center {\n  align-items: center !important;\n}\n\n.align-items-start {\n  align-items: flex-start !important;\n}\n\n.align-items-end {\n  align-items: flex-end !important;\n}\n\n.align-items-stretch {\n  align-items: stretch !important;\n}\n\n.align-self-auto {\n  align-self: auto !important;\n}\n\n.align-self-baseline {\n  align-self: baseline !important;\n}\n\n.align-self-center {\n  align-self: center !important;\n}\n\n.align-self-end {\n  align-self: flex-end !important;\n}\n\n.align-self-start {\n  align-self: flex-start !important;\n}\n\n.align-self-stretch {\n  align-self: stretch !important;\n}\n\n.flex-column {\n  flex-direction: column !important;\n}\n\n.flex-column-reverse {\n  flex-direction: column-reverse !important;\n}\n\n.flex-row {\n  flex-direction: row !important;\n}\n\n.flex-row-reverse {\n  flex-direction: row-reverse !important;\n}\n\n.flex-nowrap {\n  flex-wrap: nowrap !important;\n}\n\n.flex-wrap {\n  flex-wrap: wrap !important;\n}\n\n.flex-wrap-reverse {\n  flex-wrap: wrap-reverse !important;\n}\n\n.justify-content-around {\n  justify-content: space-around !important;\n}\n\n.justify-content-between {\n  justify-content: space-between !important;\n}\n\n.justify-content-center {\n  justify-content: center !important;\n}\n\n.justify-content-end {\n  justify-content: flex-end !important;\n}\n\n.justify-content-start {\n  justify-content: flex-start !important;\n}\n\n.order-first {\n  order: -1;\n}\n\n.order-last {\n  order: 1;\n}\n\n.order-0 {\n  order: 0;\n}\n\n@media (min-width: 600px) {\n  .align-content-sm-around {\n    align-content: space-around !important;\n  }\n\n  .align-content-sm-between {\n    align-content: space-between !important;\n  }\n\n  .align-content-sm-center {\n    align-content: center !important;\n  }\n\n  .align-content-sm-end {\n    align-content: flex-end !important;\n  }\n\n  .align-content-sm-start {\n    align-content: flex-start !important;\n  }\n\n  .align-content-sm-stretch {\n    align-content: stretch !important;\n  }\n\n  .align-items-sm-baseline {\n    align-items: baseline !important;\n  }\n\n  .align-items-sm-center {\n    align-items: center !important;\n  }\n\n  .align-items-sm-start {\n    align-items: flex-start !important;\n  }\n\n  .align-items-sm-end {\n    align-items: flex-end !important;\n  }\n\n  .align-items-sm-stretch {\n    align-items: stretch !important;\n  }\n\n  .align-self-sm-auto {\n    align-self: auto !important;\n  }\n\n  .align-self-sm-baseline {\n    align-self: baseline !important;\n  }\n\n  .align-self-sm-center {\n    align-self: center !important;\n  }\n\n  .align-self-sm-end {\n    align-self: flex-end !important;\n  }\n\n  .align-self-sm-start {\n    align-self: flex-start !important;\n  }\n\n  .align-self-sm-stretch {\n    align-self: stretch !important;\n  }\n\n  .flex-sm-column {\n    flex-direction: column !important;\n  }\n\n  .flex-sm-column-reverse {\n    flex-direction: column-reverse !important;\n  }\n\n  .flex-sm-row {\n    flex-direction: row !important;\n  }\n\n  .flex-sm-row-reverse {\n    flex-direction: row-reverse !important;\n  }\n\n  .flex-sm-nowrap {\n    flex-wrap: nowrap !important;\n  }\n\n  .flex-sm-wrap {\n    flex-wrap: wrap !important;\n  }\n\n  .flex-sm-wrap-reverse {\n    flex-wrap: wrap-reverse !important;\n  }\n\n  .justify-content-sm-around {\n    justify-content: space-around !important;\n  }\n\n  .justify-content-sm-between {\n    justify-content: space-between !important;\n  }\n\n  .justify-content-sm-center {\n    justify-content: center !important;\n  }\n\n  .justify-content-sm-end {\n    justify-content: flex-end !important;\n  }\n\n  .justify-content-sm-start {\n    justify-content: flex-start !important;\n  }\n\n  .order-sm-first {\n    order: -1;\n  }\n\n  .order-sm-last {\n    order: 1;\n  }\n\n  .order-sm-0 {\n    order: 0;\n  }\n}\n\n@media (min-width: 960px) {\n  .align-content-md-around {\n    align-content: space-around !important;\n  }\n\n  .align-content-md-between {\n    align-content: space-between !important;\n  }\n\n  .align-content-md-center {\n    align-content: center !important;\n  }\n\n  .align-content-md-end {\n    align-content: flex-end !important;\n  }\n\n  .align-content-md-start {\n    align-content: flex-start !important;\n  }\n\n  .align-content-md-stretch {\n    align-content: stretch !important;\n  }\n\n  .align-items-md-baseline {\n    align-items: baseline !important;\n  }\n\n  .align-items-md-center {\n    align-items: center !important;\n  }\n\n  .align-items-md-start {\n    align-items: flex-start !important;\n  }\n\n  .align-items-md-end {\n    align-items: flex-end !important;\n  }\n\n  .align-items-md-stretch {\n    align-items: stretch !important;\n  }\n\n  .align-self-md-auto {\n    align-self: auto !important;\n  }\n\n  .align-self-md-baseline {\n    align-self: baseline !important;\n  }\n\n  .align-self-md-center {\n    align-self: center !important;\n  }\n\n  .align-self-md-end {\n    align-self: flex-end !important;\n  }\n\n  .align-self-md-start {\n    align-self: flex-start !important;\n  }\n\n  .align-self-md-stretch {\n    align-self: stretch !important;\n  }\n\n  .flex-md-column {\n    flex-direction: column !important;\n  }\n\n  .flex-md-column-reverse {\n    flex-direction: column-reverse !important;\n  }\n\n  .flex-md-row {\n    flex-direction: row !important;\n  }\n\n  .flex-md-row-reverse {\n    flex-direction: row-reverse !important;\n  }\n\n  .flex-md-nowrap {\n    flex-wrap: nowrap !important;\n  }\n\n  .flex-md-wrap {\n    flex-wrap: wrap !important;\n  }\n\n  .flex-md-wrap-reverse {\n    flex-wrap: wrap-reverse !important;\n  }\n\n  .justify-content-md-around {\n    justify-content: space-around !important;\n  }\n\n  .justify-content-md-between {\n    justify-content: space-between !important;\n  }\n\n  .justify-content-md-center {\n    justify-content: center !important;\n  }\n\n  .justify-content-md-end {\n    justify-content: flex-end !important;\n  }\n\n  .justify-content-md-start {\n    justify-content: flex-start !important;\n  }\n\n  .order-md-first {\n    order: -1;\n  }\n\n  .order-md-last {\n    order: 1;\n  }\n\n  .order-md-0 {\n    order: 0;\n  }\n}\n\n@media (min-width: 1280px) {\n  .align-content-lg-around {\n    align-content: space-around !important;\n  }\n\n  .align-content-lg-between {\n    align-content: space-between !important;\n  }\n\n  .align-content-lg-center {\n    align-content: center !important;\n  }\n\n  .align-content-lg-end {\n    align-content: flex-end !important;\n  }\n\n  .align-content-lg-start {\n    align-content: flex-start !important;\n  }\n\n  .align-content-lg-stretch {\n    align-content: stretch !important;\n  }\n\n  .align-items-lg-baseline {\n    align-items: baseline !important;\n  }\n\n  .align-items-lg-center {\n    align-items: center !important;\n  }\n\n  .align-items-lg-start {\n    align-items: flex-start !important;\n  }\n\n  .align-items-lg-end {\n    align-items: flex-end !important;\n  }\n\n  .align-items-lg-stretch {\n    align-items: stretch !important;\n  }\n\n  .align-self-lg-auto {\n    align-self: auto !important;\n  }\n\n  .align-self-lg-baseline {\n    align-self: baseline !important;\n  }\n\n  .align-self-lg-center {\n    align-self: center !important;\n  }\n\n  .align-self-lg-end {\n    align-self: flex-end !important;\n  }\n\n  .align-self-lg-start {\n    align-self: flex-start !important;\n  }\n\n  .align-self-lg-stretch {\n    align-self: stretch !important;\n  }\n\n  .flex-lg-column {\n    flex-direction: column !important;\n  }\n\n  .flex-lg-column-reverse {\n    flex-direction: column-reverse !important;\n  }\n\n  .flex-lg-row {\n    flex-direction: row !important;\n  }\n\n  .flex-lg-row-reverse {\n    flex-direction: row-reverse !important;\n  }\n\n  .flex-lg-nowrap {\n    flex-wrap: nowrap !important;\n  }\n\n  .flex-lg-wrap {\n    flex-wrap: wrap !important;\n  }\n\n  .flex-lg-wrap-reverse {\n    flex-wrap: wrap-reverse !important;\n  }\n\n  .justify-content-lg-around {\n    justify-content: space-around !important;\n  }\n\n  .justify-content-lg-between {\n    justify-content: space-between !important;\n  }\n\n  .justify-content-lg-center {\n    justify-content: center !important;\n  }\n\n  .justify-content-lg-end {\n    justify-content: flex-end !important;\n  }\n\n  .justify-content-lg-start {\n    justify-content: flex-start !important;\n  }\n\n  .order-lg-first {\n    order: -1;\n  }\n\n  .order-lg-last {\n    order: 1;\n  }\n\n  .order-lg-0 {\n    order: 0;\n  }\n}\n\n@media (min-width: 1920px) {\n  .align-content-xl-around {\n    align-content: space-around !important;\n  }\n\n  .align-content-xl-between {\n    align-content: space-between !important;\n  }\n\n  .align-content-xl-center {\n    align-content: center !important;\n  }\n\n  .align-content-xl-end {\n    align-content: flex-end !important;\n  }\n\n  .align-content-xl-start {\n    align-content: flex-start !important;\n  }\n\n  .align-content-xl-stretch {\n    align-content: stretch !important;\n  }\n\n  .align-items-xl-baseline {\n    align-items: baseline !important;\n  }\n\n  .align-items-xl-center {\n    align-items: center !important;\n  }\n\n  .align-items-xl-start {\n    align-items: flex-start !important;\n  }\n\n  .align-items-xl-end {\n    align-items: flex-end !important;\n  }\n\n  .align-items-xl-stretch {\n    align-items: stretch !important;\n  }\n\n  .align-self-xl-auto {\n    align-self: auto !important;\n  }\n\n  .align-self-xl-baseline {\n    align-self: baseline !important;\n  }\n\n  .align-self-xl-center {\n    align-self: center !important;\n  }\n\n  .align-self-xl-end {\n    align-self: flex-end !important;\n  }\n\n  .align-self-xl-start {\n    align-self: flex-start !important;\n  }\n\n  .align-self-xl-stretch {\n    align-self: stretch !important;\n  }\n\n  .flex-xl-column {\n    flex-direction: column !important;\n  }\n\n  .flex-xl-column-reverse {\n    flex-direction: column-reverse !important;\n  }\n\n  .flex-xl-row {\n    flex-direction: row !important;\n  }\n\n  .flex-xl-row-reverse {\n    flex-direction: row-reverse !important;\n  }\n\n  .flex-xl-nowrap {\n    flex-wrap: nowrap !important;\n  }\n\n  .flex-xl-wrap {\n    flex-wrap: wrap !important;\n  }\n\n  .flex-xl-wrap-reverse {\n    flex-wrap: wrap-reverse !important;\n  }\n\n  .justify-content-xl-around {\n    justify-content: space-around !important;\n  }\n\n  .justify-content-xl-between {\n    justify-content: space-between !important;\n  }\n\n  .justify-content-xl-center {\n    justify-content: center !important;\n  }\n\n  .justify-content-xl-end {\n    justify-content: flex-end !important;\n  }\n\n  .justify-content-xl-start {\n    justify-content: flex-start !important;\n  }\n\n  .order-xl-first {\n    order: -1;\n  }\n\n  .order-xl-last {\n    order: 1;\n  }\n\n  .order-xl-0 {\n    order: 0;\n  }\n}\n\n.float-left {\n  float: left !important;\n}\n\n.float-none {\n  float: none !important;\n}\n\n.float-right {\n  float: right !important;\n}\n\n@media (min-width: 600px) {\n  .float-sm-left {\n    float: left !important;\n  }\n\n  .float-sm-none {\n    float: none !important;\n  }\n\n  .float-sm-right {\n    float: right !important;\n  }\n}\n\n@media (min-width: 960px) {\n  .float-md-left {\n    float: left !important;\n  }\n\n  .float-md-none {\n    float: none !important;\n  }\n\n  .float-md-right {\n    float: right !important;\n  }\n}\n\n@media (min-width: 1280px) {\n  .float-lg-left {\n    float: left !important;\n  }\n\n  .float-lg-none {\n    float: none !important;\n  }\n\n  .float-lg-right {\n    float: right !important;\n  }\n}\n\n@media (min-width: 1920px) {\n  .float-xl-left {\n    float: left !important;\n  }\n\n  .float-xl-none {\n    float: none !important;\n  }\n\n  .float-xl-right {\n    float: right !important;\n  }\n}\n\n.fixed-bottom {\n  position: fixed;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 40;\n}\n\n.fixed-top {\n  position: fixed;\n  top: 0;\n  right: 0;\n  left: 0;\n  z-index: 40;\n}\n\n.sticky-top {\n  position: sticky;\n  top: 0;\n  z-index: 40;\n}\n\n.sr-only {\n  border: 0;\n  clip: rect(0, 0, 0, 0);\n  clip-path: inset(50%);\n  height: 1px;\n  padding: 0;\n  overflow: hidden;\n  position: absolute;\n  white-space: nowrap;\n  width: 1px;\n}\n\n.sr-only-focusable:active,\n.sr-only-focusable:focus {\n  clip: auto;\n  clip-path: none;\n  height: auto;\n  overflow: visible;\n  position: static;\n  white-space: normal;\n  width: auto;\n}\n\n.h-25 {\n  height: 25% !important;\n}\n\n.h-50 {\n  height: 50% !important;\n}\n\n.h-75 {\n  height: 75% !important;\n}\n\n.h-100 {\n  height: 100% !important;\n}\n\n.w-25 {\n  width: 25% !important;\n}\n\n.w-50 {\n  width: 50% !important;\n}\n\n.w-75 {\n  width: 75% !important;\n}\n\n.w-100 {\n  width: 100% !important;\n}\n\n.mh-100 {\n  max-height: 100% !important;\n}\n\n.mw-100 {\n  max-width: 100% !important;\n}\n\n.m-auto {\n  margin: auto !important;\n}\n\n.mt-auto {\n  margin-top: auto !important;\n}\n\n.mr-auto {\n  margin-right: auto !important;\n}\n\n.mb-auto {\n  margin-bottom: auto !important;\n}\n\n.ml-auto {\n  margin-left: auto !important;\n}\n\n.mx-auto {\n  margin-right: auto !important;\n  margin-left: auto !important;\n}\n\n.my-auto {\n  margin-top: auto !important;\n  margin-bottom: auto !important;\n}\n\n.m-0 {\n  margin: 0 !important;\n}\n\n.mt-0 {\n  margin-top: 0 !important;\n}\n\n.mr-0 {\n  margin-right: 0 !important;\n}\n\n.mb-0 {\n  margin-bottom: 0 !important;\n}\n\n.ml-0 {\n  margin-left: 0 !important;\n}\n\n.mx-0 {\n  margin-right: 0 !important;\n  margin-left: 0 !important;\n}\n\n.my-0 {\n  margin-top: 0 !important;\n  margin-bottom: 0 !important;\n}\n\n.m-no {\n  margin: 0 !important;\n}\n\n.mt-no {\n  margin-top: 0 !important;\n}\n\n.mr-no {\n  margin-right: 0 !important;\n}\n\n.mb-no {\n  margin-bottom: 0 !important;\n}\n\n.ml-no {\n  margin-left: 0 !important;\n}\n\n.mx-no {\n  margin-right: 0 !important;\n  margin-left: 0 !important;\n}\n\n.my-no {\n  margin-top: 0 !important;\n  margin-bottom: 0 !important;\n}\n\n.m-1 {\n  margin: 0.25rem !important;\n}\n\n.mt-1 {\n  margin-top: 0.25rem !important;\n}\n\n.mr-1 {\n  margin-right: 0.25rem !important;\n}\n\n.mb-1 {\n  margin-bottom: 0.25rem !important;\n}\n\n.ml-1 {\n  margin-left: 0.25rem !important;\n}\n\n.mx-1 {\n  margin-right: 0.25rem !important;\n  margin-left: 0.25rem !important;\n}\n\n.my-1 {\n  margin-top: 0.25rem !important;\n  margin-bottom: 0.25rem !important;\n}\n\n.m-xs {\n  margin: 0.25rem !important;\n}\n\n.mt-xs {\n  margin-top: 0.25rem !important;\n}\n\n.mr-xs {\n  margin-right: 0.25rem !important;\n}\n\n.mb-xs {\n  margin-bottom: 0.25rem !important;\n}\n\n.ml-xs {\n  margin-left: 0.25rem !important;\n}\n\n.mx-xs {\n  margin-right: 0.25rem !important;\n  margin-left: 0.25rem !important;\n}\n\n.my-xs {\n  margin-top: 0.25rem !important;\n  margin-bottom: 0.25rem !important;\n}\n\n.m-2 {\n  margin: 0.5rem !important;\n}\n\n.mt-2 {\n  margin-top: 0.5rem !important;\n}\n\n.mr-2 {\n  margin-right: 0.5rem !important;\n}\n\n.mb-2 {\n  margin-bottom: 0.5rem !important;\n}\n\n.ml-2 {\n  margin-left: 0.5rem !important;\n}\n\n.mx-2 {\n  margin-right: 0.5rem !important;\n  margin-left: 0.5rem !important;\n}\n\n.my-2 {\n  margin-top: 0.5rem !important;\n  margin-bottom: 0.5rem !important;\n}\n\n.m-sm {\n  margin: 0.5rem !important;\n}\n\n.mt-sm {\n  margin-top: 0.5rem !important;\n}\n\n.mr-sm {\n  margin-right: 0.5rem !important;\n}\n\n.mb-sm {\n  margin-bottom: 0.5rem !important;\n}\n\n.ml-sm {\n  margin-left: 0.5rem !important;\n}\n\n.mx-sm {\n  margin-right: 0.5rem !important;\n  margin-left: 0.5rem !important;\n}\n\n.my-sm {\n  margin-top: 0.5rem !important;\n  margin-bottom: 0.5rem !important;\n}\n\n.m-3 {\n  margin: 1rem !important;\n}\n\n.mt-3 {\n  margin-top: 1rem !important;\n}\n\n.mr-3 {\n  margin-right: 1rem !important;\n}\n\n.mb-3 {\n  margin-bottom: 1rem !important;\n}\n\n.ml-3 {\n  margin-left: 1rem !important;\n}\n\n.mx-3 {\n  margin-right: 1rem !important;\n  margin-left: 1rem !important;\n}\n\n.my-3 {\n  margin-top: 1rem !important;\n  margin-bottom: 1rem !important;\n}\n\n.m-md {\n  margin: 1rem !important;\n}\n\n.mt-md {\n  margin-top: 1rem !important;\n}\n\n.mr-md {\n  margin-right: 1rem !important;\n}\n\n.mb-md {\n  margin-bottom: 1rem !important;\n}\n\n.ml-md {\n  margin-left: 1rem !important;\n}\n\n.mx-md {\n  margin-right: 1rem !important;\n  margin-left: 1rem !important;\n}\n\n.my-md {\n  margin-top: 1rem !important;\n  margin-bottom: 1rem !important;\n}\n\n.m-4 {\n  margin: 1.5rem !important;\n}\n\n.mt-4 {\n  margin-top: 1.5rem !important;\n}\n\n.mr-4 {\n  margin-right: 1.5rem !important;\n}\n\n.mb-4 {\n  margin-bottom: 1.5rem !important;\n}\n\n.ml-4 {\n  margin-left: 1.5rem !important;\n}\n\n.mx-4 {\n  margin-right: 1.5rem !important;\n  margin-left: 1.5rem !important;\n}\n\n.my-4 {\n  margin-top: 1.5rem !important;\n  margin-bottom: 1.5rem !important;\n}\n\n.m-lg {\n  margin: 1.5rem !important;\n}\n\n.mt-lg {\n  margin-top: 1.5rem !important;\n}\n\n.mr-lg {\n  margin-right: 1.5rem !important;\n}\n\n.mb-lg {\n  margin-bottom: 1.5rem !important;\n}\n\n.ml-lg {\n  margin-left: 1.5rem !important;\n}\n\n.mx-lg {\n  margin-right: 1.5rem !important;\n  margin-left: 1.5rem !important;\n}\n\n.my-lg {\n  margin-top: 1.5rem !important;\n  margin-bottom: 1.5rem !important;\n}\n\n.m-5 {\n  margin: 3rem !important;\n}\n\n.mt-5 {\n  margin-top: 3rem !important;\n}\n\n.mr-5 {\n  margin-right: 3rem !important;\n}\n\n.mb-5 {\n  margin-bottom: 3rem !important;\n}\n\n.ml-5 {\n  margin-left: 3rem !important;\n}\n\n.mx-5 {\n  margin-right: 3rem !important;\n  margin-left: 3rem !important;\n}\n\n.my-5 {\n  margin-top: 3rem !important;\n  margin-bottom: 3rem !important;\n}\n\n.m-xl {\n  margin: 3rem !important;\n}\n\n.mt-xl {\n  margin-top: 3rem !important;\n}\n\n.mr-xl {\n  margin-right: 3rem !important;\n}\n\n.mb-xl {\n  margin-bottom: 3rem !important;\n}\n\n.ml-xl {\n  margin-left: 3rem !important;\n}\n\n.mx-xl {\n  margin-right: 3rem !important;\n  margin-left: 3rem !important;\n}\n\n.my-xl {\n  margin-top: 3rem !important;\n  margin-bottom: 3rem !important;\n}\n\n.p-0 {\n  padding: 0 !important;\n}\n\n.pt-0 {\n  padding-top: 0 !important;\n}\n\n.pr-0 {\n  padding-right: 0 !important;\n}\n\n.pb-0 {\n  padding-bottom: 0 !important;\n}\n\n.pl-0 {\n  padding-left: 0 !important;\n}\n\n.px-0 {\n  padding-right: 0 !important;\n  padding-left: 0 !important;\n}\n\n.py-0 {\n  padding-top: 0 !important;\n  padding-bottom: 0 !important;\n}\n\n.p-no {\n  padding: 0 !important;\n}\n\n.pt-no {\n  padding-top: 0 !important;\n}\n\n.pr-no {\n  padding-right: 0 !important;\n}\n\n.pb-no {\n  padding-bottom: 0 !important;\n}\n\n.pl-no {\n  padding-left: 0 !important;\n}\n\n.px-no {\n  padding-right: 0 !important;\n  padding-left: 0 !important;\n}\n\n.py-no {\n  padding-top: 0 !important;\n  padding-bottom: 0 !important;\n}\n\n.p-1 {\n  padding: 0.25rem !important;\n}\n\n.pt-1 {\n  padding-top: 0.25rem !important;\n}\n\n.pr-1 {\n  padding-right: 0.25rem !important;\n}\n\n.pb-1 {\n  padding-bottom: 0.25rem !important;\n}\n\n.pl-1 {\n  padding-left: 0.25rem !important;\n}\n\n.px-1 {\n  padding-right: 0.25rem !important;\n  padding-left: 0.25rem !important;\n}\n\n.py-1 {\n  padding-top: 0.25rem !important;\n  padding-bottom: 0.25rem !important;\n}\n\n.p-xs {\n  padding: 0.25rem !important;\n}\n\n.pt-xs {\n  padding-top: 0.25rem !important;\n}\n\n.pr-xs {\n  padding-right: 0.25rem !important;\n}\n\n.pb-xs {\n  padding-bottom: 0.25rem !important;\n}\n\n.pl-xs {\n  padding-left: 0.25rem !important;\n}\n\n.px-xs {\n  padding-right: 0.25rem !important;\n  padding-left: 0.25rem !important;\n}\n\n.py-xs {\n  padding-top: 0.25rem !important;\n  padding-bottom: 0.25rem !important;\n}\n\n.p-2 {\n  padding: 0.5rem !important;\n}\n\n.pt-2 {\n  padding-top: 0.5rem !important;\n}\n\n.pr-2 {\n  padding-right: 0.5rem !important;\n}\n\n.pb-2 {\n  padding-bottom: 0.5rem !important;\n}\n\n.pl-2 {\n  padding-left: 0.5rem !important;\n}\n\n.px-2 {\n  padding-right: 0.5rem !important;\n  padding-left: 0.5rem !important;\n}\n\n.py-2 {\n  padding-top: 0.5rem !important;\n  padding-bottom: 0.5rem !important;\n}\n\n.p-sm {\n  padding: 0.5rem !important;\n}\n\n.pt-sm {\n  padding-top: 0.5rem !important;\n}\n\n.pr-sm {\n  padding-right: 0.5rem !important;\n}\n\n.pb-sm {\n  padding-bottom: 0.5rem !important;\n}\n\n.pl-sm {\n  padding-left: 0.5rem !important;\n}\n\n.px-sm {\n  padding-right: 0.5rem !important;\n  padding-left: 0.5rem !important;\n}\n\n.py-sm {\n  padding-top: 0.5rem !important;\n  padding-bottom: 0.5rem !important;\n}\n\n.p-3 {\n  padding: 1rem !important;\n}\n\n.pt-3 {\n  padding-top: 1rem !important;\n}\n\n.pr-3 {\n  padding-right: 1rem !important;\n}\n\n.pb-3 {\n  padding-bottom: 1rem !important;\n}\n\n.pl-3 {\n  padding-left: 1rem !important;\n}\n\n.px-3 {\n  padding-right: 1rem !important;\n  padding-left: 1rem !important;\n}\n\n.py-3 {\n  padding-top: 1rem !important;\n  padding-bottom: 1rem !important;\n}\n\n.p-md {\n  padding: 1rem !important;\n}\n\n.pt-md {\n  padding-top: 1rem !important;\n}\n\n.pr-md {\n  padding-right: 1rem !important;\n}\n\n.pb-md {\n  padding-bottom: 1rem !important;\n}\n\n.pl-md {\n  padding-left: 1rem !important;\n}\n\n.px-md {\n  padding-right: 1rem !important;\n  padding-left: 1rem !important;\n}\n\n.py-md {\n  padding-top: 1rem !important;\n  padding-bottom: 1rem !important;\n}\n\n.p-4 {\n  padding: 1.5rem !important;\n}\n\n.pt-4 {\n  padding-top: 1.5rem !important;\n}\n\n.pr-4 {\n  padding-right: 1.5rem !important;\n}\n\n.pb-4 {\n  padding-bottom: 1.5rem !important;\n}\n\n.pl-4 {\n  padding-left: 1.5rem !important;\n}\n\n.px-4 {\n  padding-right: 1.5rem !important;\n  padding-left: 1.5rem !important;\n}\n\n.py-4 {\n  padding-top: 1.5rem !important;\n  padding-bottom: 1.5rem !important;\n}\n\n.p-lg {\n  padding: 1.5rem !important;\n}\n\n.pt-lg {\n  padding-top: 1.5rem !important;\n}\n\n.pr-lg {\n  padding-right: 1.5rem !important;\n}\n\n.pb-lg {\n  padding-bottom: 1.5rem !important;\n}\n\n.pl-lg {\n  padding-left: 1.5rem !important;\n}\n\n.px-lg {\n  padding-right: 1.5rem !important;\n  padding-left: 1.5rem !important;\n}\n\n.py-lg {\n  padding-top: 1.5rem !important;\n  padding-bottom: 1.5rem !important;\n}\n\n.p-5 {\n  padding: 3rem !important;\n}\n\n.pt-5 {\n  padding-top: 3rem !important;\n}\n\n.pr-5 {\n  padding-right: 3rem !important;\n}\n\n.pb-5 {\n  padding-bottom: 3rem !important;\n}\n\n.pl-5 {\n  padding-left: 3rem !important;\n}\n\n.px-5 {\n  padding-right: 3rem !important;\n  padding-left: 3rem !important;\n}\n\n.py-5 {\n  padding-top: 3rem !important;\n  padding-bottom: 3rem !important;\n}\n\n.p-xl {\n  padding: 3rem !important;\n}\n\n.pt-xl {\n  padding-top: 3rem !important;\n}\n\n.pr-xl {\n  padding-right: 3rem !important;\n}\n\n.pb-xl {\n  padding-bottom: 3rem !important;\n}\n\n.pl-xl {\n  padding-left: 3rem !important;\n}\n\n.px-xl {\n  padding-right: 3rem !important;\n  padding-left: 3rem !important;\n}\n\n.py-xl {\n  padding-top: 3rem !important;\n  padding-bottom: 3rem !important;\n}\n\n@media (min-width: 600px) {\n  .m-sm-auto {\n    margin: auto !important;\n  }\n\n  .mt-sm-auto {\n    margin-top: auto !important;\n  }\n\n  .mr-sm-auto {\n    margin-right: auto !important;\n  }\n\n  .mb-sm-auto {\n    margin-bottom: auto !important;\n  }\n\n  .ml-sm-auto {\n    margin-left: auto !important;\n  }\n\n  .mx-sm-auto {\n    margin-right: auto !important;\n    margin-left: auto !important;\n  }\n\n  .my-sm-auto {\n    margin-top: auto !important;\n    margin-bottom: auto !important;\n  }\n\n  .m-sm-0 {\n    margin: 0 !important;\n  }\n\n  .mt-sm-0 {\n    margin-top: 0 !important;\n  }\n\n  .mr-sm-0 {\n    margin-right: 0 !important;\n  }\n\n  .mb-sm-0 {\n    margin-bottom: 0 !important;\n  }\n\n  .ml-sm-0 {\n    margin-left: 0 !important;\n  }\n\n  .mx-sm-0 {\n    margin-right: 0 !important;\n    margin-left: 0 !important;\n  }\n\n  .my-sm-0 {\n    margin-top: 0 !important;\n    margin-bottom: 0 !important;\n  }\n\n  .m-sm-no {\n    margin: 0 !important;\n  }\n\n  .mt-sm-no {\n    margin-top: 0 !important;\n  }\n\n  .mr-sm-no {\n    margin-right: 0 !important;\n  }\n\n  .mb-sm-no {\n    margin-bottom: 0 !important;\n  }\n\n  .ml-sm-no {\n    margin-left: 0 !important;\n  }\n\n  .mx-sm-no {\n    margin-right: 0 !important;\n    margin-left: 0 !important;\n  }\n\n  .my-sm-no {\n    margin-top: 0 !important;\n    margin-bottom: 0 !important;\n  }\n\n  .m-sm-1 {\n    margin: 0.25rem !important;\n  }\n\n  .mt-sm-1 {\n    margin-top: 0.25rem !important;\n  }\n\n  .mr-sm-1 {\n    margin-right: 0.25rem !important;\n  }\n\n  .mb-sm-1 {\n    margin-bottom: 0.25rem !important;\n  }\n\n  .ml-sm-1 {\n    margin-left: 0.25rem !important;\n  }\n\n  .mx-sm-1 {\n    margin-right: 0.25rem !important;\n    margin-left: 0.25rem !important;\n  }\n\n  .my-sm-1 {\n    margin-top: 0.25rem !important;\n    margin-bottom: 0.25rem !important;\n  }\n\n  .m-sm-xs {\n    margin: 0.25rem !important;\n  }\n\n  .mt-sm-xs {\n    margin-top: 0.25rem !important;\n  }\n\n  .mr-sm-xs {\n    margin-right: 0.25rem !important;\n  }\n\n  .mb-sm-xs {\n    margin-bottom: 0.25rem !important;\n  }\n\n  .ml-sm-xs {\n    margin-left: 0.25rem !important;\n  }\n\n  .mx-sm-xs {\n    margin-right: 0.25rem !important;\n    margin-left: 0.25rem !important;\n  }\n\n  .my-sm-xs {\n    margin-top: 0.25rem !important;\n    margin-bottom: 0.25rem !important;\n  }\n\n  .m-sm-2 {\n    margin: 0.5rem !important;\n  }\n\n  .mt-sm-2 {\n    margin-top: 0.5rem !important;\n  }\n\n  .mr-sm-2 {\n    margin-right: 0.5rem !important;\n  }\n\n  .mb-sm-2 {\n    margin-bottom: 0.5rem !important;\n  }\n\n  .ml-sm-2 {\n    margin-left: 0.5rem !important;\n  }\n\n  .mx-sm-2 {\n    margin-right: 0.5rem !important;\n    margin-left: 0.5rem !important;\n  }\n\n  .my-sm-2 {\n    margin-top: 0.5rem !important;\n    margin-bottom: 0.5rem !important;\n  }\n\n  .m-sm-sm {\n    margin: 0.5rem !important;\n  }\n\n  .mt-sm-sm {\n    margin-top: 0.5rem !important;\n  }\n\n  .mr-sm-sm {\n    margin-right: 0.5rem !important;\n  }\n\n  .mb-sm-sm {\n    margin-bottom: 0.5rem !important;\n  }\n\n  .ml-sm-sm {\n    margin-left: 0.5rem !important;\n  }\n\n  .mx-sm-sm {\n    margin-right: 0.5rem !important;\n    margin-left: 0.5rem !important;\n  }\n\n  .my-sm-sm {\n    margin-top: 0.5rem !important;\n    margin-bottom: 0.5rem !important;\n  }\n\n  .m-sm-3 {\n    margin: 1rem !important;\n  }\n\n  .mt-sm-3 {\n    margin-top: 1rem !important;\n  }\n\n  .mr-sm-3 {\n    margin-right: 1rem !important;\n  }\n\n  .mb-sm-3 {\n    margin-bottom: 1rem !important;\n  }\n\n  .ml-sm-3 {\n    margin-left: 1rem !important;\n  }\n\n  .mx-sm-3 {\n    margin-right: 1rem !important;\n    margin-left: 1rem !important;\n  }\n\n  .my-sm-3 {\n    margin-top: 1rem !important;\n    margin-bottom: 1rem !important;\n  }\n\n  .m-sm-md {\n    margin: 1rem !important;\n  }\n\n  .mt-sm-md {\n    margin-top: 1rem !important;\n  }\n\n  .mr-sm-md {\n    margin-right: 1rem !important;\n  }\n\n  .mb-sm-md {\n    margin-bottom: 1rem !important;\n  }\n\n  .ml-sm-md {\n    margin-left: 1rem !important;\n  }\n\n  .mx-sm-md {\n    margin-right: 1rem !important;\n    margin-left: 1rem !important;\n  }\n\n  .my-sm-md {\n    margin-top: 1rem !important;\n    margin-bottom: 1rem !important;\n  }\n\n  .m-sm-4 {\n    margin: 1.5rem !important;\n  }\n\n  .mt-sm-4 {\n    margin-top: 1.5rem !important;\n  }\n\n  .mr-sm-4 {\n    margin-right: 1.5rem !important;\n  }\n\n  .mb-sm-4 {\n    margin-bottom: 1.5rem !important;\n  }\n\n  .ml-sm-4 {\n    margin-left: 1.5rem !important;\n  }\n\n  .mx-sm-4 {\n    margin-right: 1.5rem !important;\n    margin-left: 1.5rem !important;\n  }\n\n  .my-sm-4 {\n    margin-top: 1.5rem !important;\n    margin-bottom: 1.5rem !important;\n  }\n\n  .m-sm-lg {\n    margin: 1.5rem !important;\n  }\n\n  .mt-sm-lg {\n    margin-top: 1.5rem !important;\n  }\n\n  .mr-sm-lg {\n    margin-right: 1.5rem !important;\n  }\n\n  .mb-sm-lg {\n    margin-bottom: 1.5rem !important;\n  }\n\n  .ml-sm-lg {\n    margin-left: 1.5rem !important;\n  }\n\n  .mx-sm-lg {\n    margin-right: 1.5rem !important;\n    margin-left: 1.5rem !important;\n  }\n\n  .my-sm-lg {\n    margin-top: 1.5rem !important;\n    margin-bottom: 1.5rem !important;\n  }\n\n  .m-sm-5 {\n    margin: 3rem !important;\n  }\n\n  .mt-sm-5 {\n    margin-top: 3rem !important;\n  }\n\n  .mr-sm-5 {\n    margin-right: 3rem !important;\n  }\n\n  .mb-sm-5 {\n    margin-bottom: 3rem !important;\n  }\n\n  .ml-sm-5 {\n    margin-left: 3rem !important;\n  }\n\n  .mx-sm-5 {\n    margin-right: 3rem !important;\n    margin-left: 3rem !important;\n  }\n\n  .my-sm-5 {\n    margin-top: 3rem !important;\n    margin-bottom: 3rem !important;\n  }\n\n  .m-sm-xl {\n    margin: 3rem !important;\n  }\n\n  .mt-sm-xl {\n    margin-top: 3rem !important;\n  }\n\n  .mr-sm-xl {\n    margin-right: 3rem !important;\n  }\n\n  .mb-sm-xl {\n    margin-bottom: 3rem !important;\n  }\n\n  .ml-sm-xl {\n    margin-left: 3rem !important;\n  }\n\n  .mx-sm-xl {\n    margin-right: 3rem !important;\n    margin-left: 3rem !important;\n  }\n\n  .my-sm-xl {\n    margin-top: 3rem !important;\n    margin-bottom: 3rem !important;\n  }\n\n  .p-sm-0 {\n    padding: 0 !important;\n  }\n\n  .pt-sm-0 {\n    padding-top: 0 !important;\n  }\n\n  .pr-sm-0 {\n    padding-right: 0 !important;\n  }\n\n  .pb-sm-0 {\n    padding-bottom: 0 !important;\n  }\n\n  .pl-sm-0 {\n    padding-left: 0 !important;\n  }\n\n  .px-sm-0 {\n    padding-right: 0 !important;\n    padding-left: 0 !important;\n  }\n\n  .py-sm-0 {\n    padding-top: 0 !important;\n    padding-bottom: 0 !important;\n  }\n\n  .p-sm-no {\n    padding: 0 !important;\n  }\n\n  .pt-sm-no {\n    padding-top: 0 !important;\n  }\n\n  .pr-sm-no {\n    padding-right: 0 !important;\n  }\n\n  .pb-sm-no {\n    padding-bottom: 0 !important;\n  }\n\n  .pl-sm-no {\n    padding-left: 0 !important;\n  }\n\n  .px-sm-no {\n    padding-right: 0 !important;\n    padding-left: 0 !important;\n  }\n\n  .py-sm-no {\n    padding-top: 0 !important;\n    padding-bottom: 0 !important;\n  }\n\n  .p-sm-1 {\n    padding: 0.25rem !important;\n  }\n\n  .pt-sm-1 {\n    padding-top: 0.25rem !important;\n  }\n\n  .pr-sm-1 {\n    padding-right: 0.25rem !important;\n  }\n\n  .pb-sm-1 {\n    padding-bottom: 0.25rem !important;\n  }\n\n  .pl-sm-1 {\n    padding-left: 0.25rem !important;\n  }\n\n  .px-sm-1 {\n    padding-right: 0.25rem !important;\n    padding-left: 0.25rem !important;\n  }\n\n  .py-sm-1 {\n    padding-top: 0.25rem !important;\n    padding-bottom: 0.25rem !important;\n  }\n\n  .p-sm-xs {\n    padding: 0.25rem !important;\n  }\n\n  .pt-sm-xs {\n    padding-top: 0.25rem !important;\n  }\n\n  .pr-sm-xs {\n    padding-right: 0.25rem !important;\n  }\n\n  .pb-sm-xs {\n    padding-bottom: 0.25rem !important;\n  }\n\n  .pl-sm-xs {\n    padding-left: 0.25rem !important;\n  }\n\n  .px-sm-xs {\n    padding-right: 0.25rem !important;\n    padding-left: 0.25rem !important;\n  }\n\n  .py-sm-xs {\n    padding-top: 0.25rem !important;\n    padding-bottom: 0.25rem !important;\n  }\n\n  .p-sm-2 {\n    padding: 0.5rem !important;\n  }\n\n  .pt-sm-2 {\n    padding-top: 0.5rem !important;\n  }\n\n  .pr-sm-2 {\n    padding-right: 0.5rem !important;\n  }\n\n  .pb-sm-2 {\n    padding-bottom: 0.5rem !important;\n  }\n\n  .pl-sm-2 {\n    padding-left: 0.5rem !important;\n  }\n\n  .px-sm-2 {\n    padding-right: 0.5rem !important;\n    padding-left: 0.5rem !important;\n  }\n\n  .py-sm-2 {\n    padding-top: 0.5rem !important;\n    padding-bottom: 0.5rem !important;\n  }\n\n  .p-sm-sm {\n    padding: 0.5rem !important;\n  }\n\n  .pt-sm-sm {\n    padding-top: 0.5rem !important;\n  }\n\n  .pr-sm-sm {\n    padding-right: 0.5rem !important;\n  }\n\n  .pb-sm-sm {\n    padding-bottom: 0.5rem !important;\n  }\n\n  .pl-sm-sm {\n    padding-left: 0.5rem !important;\n  }\n\n  .px-sm-sm {\n    padding-right: 0.5rem !important;\n    padding-left: 0.5rem !important;\n  }\n\n  .py-sm-sm {\n    padding-top: 0.5rem !important;\n    padding-bottom: 0.5rem !important;\n  }\n\n  .p-sm-3 {\n    padding: 1rem !important;\n  }\n\n  .pt-sm-3 {\n    padding-top: 1rem !important;\n  }\n\n  .pr-sm-3 {\n    padding-right: 1rem !important;\n  }\n\n  .pb-sm-3 {\n    padding-bottom: 1rem !important;\n  }\n\n  .pl-sm-3 {\n    padding-left: 1rem !important;\n  }\n\n  .px-sm-3 {\n    padding-right: 1rem !important;\n    padding-left: 1rem !important;\n  }\n\n  .py-sm-3 {\n    padding-top: 1rem !important;\n    padding-bottom: 1rem !important;\n  }\n\n  .p-sm-md {\n    padding: 1rem !important;\n  }\n\n  .pt-sm-md {\n    padding-top: 1rem !important;\n  }\n\n  .pr-sm-md {\n    padding-right: 1rem !important;\n  }\n\n  .pb-sm-md {\n    padding-bottom: 1rem !important;\n  }\n\n  .pl-sm-md {\n    padding-left: 1rem !important;\n  }\n\n  .px-sm-md {\n    padding-right: 1rem !important;\n    padding-left: 1rem !important;\n  }\n\n  .py-sm-md {\n    padding-top: 1rem !important;\n    padding-bottom: 1rem !important;\n  }\n\n  .p-sm-4 {\n    padding: 1.5rem !important;\n  }\n\n  .pt-sm-4 {\n    padding-top: 1.5rem !important;\n  }\n\n  .pr-sm-4 {\n    padding-right: 1.5rem !important;\n  }\n\n  .pb-sm-4 {\n    padding-bottom: 1.5rem !important;\n  }\n\n  .pl-sm-4 {\n    padding-left: 1.5rem !important;\n  }\n\n  .px-sm-4 {\n    padding-right: 1.5rem !important;\n    padding-left: 1.5rem !important;\n  }\n\n  .py-sm-4 {\n    padding-top: 1.5rem !important;\n    padding-bottom: 1.5rem !important;\n  }\n\n  .p-sm-lg {\n    padding: 1.5rem !important;\n  }\n\n  .pt-sm-lg {\n    padding-top: 1.5rem !important;\n  }\n\n  .pr-sm-lg {\n    padding-right: 1.5rem !important;\n  }\n\n  .pb-sm-lg {\n    padding-bottom: 1.5rem !important;\n  }\n\n  .pl-sm-lg {\n    padding-left: 1.5rem !important;\n  }\n\n  .px-sm-lg {\n    padding-right: 1.5rem !important;\n    padding-left: 1.5rem !important;\n  }\n\n  .py-sm-lg {\n    padding-top: 1.5rem !important;\n    padding-bottom: 1.5rem !important;\n  }\n\n  .p-sm-5 {\n    padding: 3rem !important;\n  }\n\n  .pt-sm-5 {\n    padding-top: 3rem !important;\n  }\n\n  .pr-sm-5 {\n    padding-right: 3rem !important;\n  }\n\n  .pb-sm-5 {\n    padding-bottom: 3rem !important;\n  }\n\n  .pl-sm-5 {\n    padding-left: 3rem !important;\n  }\n\n  .px-sm-5 {\n    padding-right: 3rem !important;\n    padding-left: 3rem !important;\n  }\n\n  .py-sm-5 {\n    padding-top: 3rem !important;\n    padding-bottom: 3rem !important;\n  }\n\n  .p-sm-xl {\n    padding: 3rem !important;\n  }\n\n  .pt-sm-xl {\n    padding-top: 3rem !important;\n  }\n\n  .pr-sm-xl {\n    padding-right: 3rem !important;\n  }\n\n  .pb-sm-xl {\n    padding-bottom: 3rem !important;\n  }\n\n  .pl-sm-xl {\n    padding-left: 3rem !important;\n  }\n\n  .px-sm-xl {\n    padding-right: 3rem !important;\n    padding-left: 3rem !important;\n  }\n\n  .py-sm-xl {\n    padding-top: 3rem !important;\n    padding-bottom: 3rem !important;\n  }\n}\n\n@media (min-width: 960px) {\n  .m-md-auto {\n    margin: auto !important;\n  }\n\n  .mt-md-auto {\n    margin-top: auto !important;\n  }\n\n  .mr-md-auto {\n    margin-right: auto !important;\n  }\n\n  .mb-md-auto {\n    margin-bottom: auto !important;\n  }\n\n  .ml-md-auto {\n    margin-left: auto !important;\n  }\n\n  .mx-md-auto {\n    margin-right: auto !important;\n    margin-left: auto !important;\n  }\n\n  .my-md-auto {\n    margin-top: auto !important;\n    margin-bottom: auto !important;\n  }\n\n  .m-md-0 {\n    margin: 0 !important;\n  }\n\n  .mt-md-0 {\n    margin-top: 0 !important;\n  }\n\n  .mr-md-0 {\n    margin-right: 0 !important;\n  }\n\n  .mb-md-0 {\n    margin-bottom: 0 !important;\n  }\n\n  .ml-md-0 {\n    margin-left: 0 !important;\n  }\n\n  .mx-md-0 {\n    margin-right: 0 !important;\n    margin-left: 0 !important;\n  }\n\n  .my-md-0 {\n    margin-top: 0 !important;\n    margin-bottom: 0 !important;\n  }\n\n  .m-md-no {\n    margin: 0 !important;\n  }\n\n  .mt-md-no {\n    margin-top: 0 !important;\n  }\n\n  .mr-md-no {\n    margin-right: 0 !important;\n  }\n\n  .mb-md-no {\n    margin-bottom: 0 !important;\n  }\n\n  .ml-md-no {\n    margin-left: 0 !important;\n  }\n\n  .mx-md-no {\n    margin-right: 0 !important;\n    margin-left: 0 !important;\n  }\n\n  .my-md-no {\n    margin-top: 0 !important;\n    margin-bottom: 0 !important;\n  }\n\n  .m-md-1 {\n    margin: 0.25rem !important;\n  }\n\n  .mt-md-1 {\n    margin-top: 0.25rem !important;\n  }\n\n  .mr-md-1 {\n    margin-right: 0.25rem !important;\n  }\n\n  .mb-md-1 {\n    margin-bottom: 0.25rem !important;\n  }\n\n  .ml-md-1 {\n    margin-left: 0.25rem !important;\n  }\n\n  .mx-md-1 {\n    margin-right: 0.25rem !important;\n    margin-left: 0.25rem !important;\n  }\n\n  .my-md-1 {\n    margin-top: 0.25rem !important;\n    margin-bottom: 0.25rem !important;\n  }\n\n  .m-md-xs {\n    margin: 0.25rem !important;\n  }\n\n  .mt-md-xs {\n    margin-top: 0.25rem !important;\n  }\n\n  .mr-md-xs {\n    margin-right: 0.25rem !important;\n  }\n\n  .mb-md-xs {\n    margin-bottom: 0.25rem !important;\n  }\n\n  .ml-md-xs {\n    margin-left: 0.25rem !important;\n  }\n\n  .mx-md-xs {\n    margin-right: 0.25rem !important;\n    margin-left: 0.25rem !important;\n  }\n\n  .my-md-xs {\n    margin-top: 0.25rem !important;\n    margin-bottom: 0.25rem !important;\n  }\n\n  .m-md-2 {\n    margin: 0.5rem !important;\n  }\n\n  .mt-md-2 {\n    margin-top: 0.5rem !important;\n  }\n\n  .mr-md-2 {\n    margin-right: 0.5rem !important;\n  }\n\n  .mb-md-2 {\n    margin-bottom: 0.5rem !important;\n  }\n\n  .ml-md-2 {\n    margin-left: 0.5rem !important;\n  }\n\n  .mx-md-2 {\n    margin-right: 0.5rem !important;\n    margin-left: 0.5rem !important;\n  }\n\n  .my-md-2 {\n    margin-top: 0.5rem !important;\n    margin-bottom: 0.5rem !important;\n  }\n\n  .m-md-sm {\n    margin: 0.5rem !important;\n  }\n\n  .mt-md-sm {\n    margin-top: 0.5rem !important;\n  }\n\n  .mr-md-sm {\n    margin-right: 0.5rem !important;\n  }\n\n  .mb-md-sm {\n    margin-bottom: 0.5rem !important;\n  }\n\n  .ml-md-sm {\n    margin-left: 0.5rem !important;\n  }\n\n  .mx-md-sm {\n    margin-right: 0.5rem !important;\n    margin-left: 0.5rem !important;\n  }\n\n  .my-md-sm {\n    margin-top: 0.5rem !important;\n    margin-bottom: 0.5rem !important;\n  }\n\n  .m-md-3 {\n    margin: 1rem !important;\n  }\n\n  .mt-md-3 {\n    margin-top: 1rem !important;\n  }\n\n  .mr-md-3 {\n    margin-right: 1rem !important;\n  }\n\n  .mb-md-3 {\n    margin-bottom: 1rem !important;\n  }\n\n  .ml-md-3 {\n    margin-left: 1rem !important;\n  }\n\n  .mx-md-3 {\n    margin-right: 1rem !important;\n    margin-left: 1rem !important;\n  }\n\n  .my-md-3 {\n    margin-top: 1rem !important;\n    margin-bottom: 1rem !important;\n  }\n\n  .m-md-md {\n    margin: 1rem !important;\n  }\n\n  .mt-md-md {\n    margin-top: 1rem !important;\n  }\n\n  .mr-md-md {\n    margin-right: 1rem !important;\n  }\n\n  .mb-md-md {\n    margin-bottom: 1rem !important;\n  }\n\n  .ml-md-md {\n    margin-left: 1rem !important;\n  }\n\n  .mx-md-md {\n    margin-right: 1rem !important;\n    margin-left: 1rem !important;\n  }\n\n  .my-md-md {\n    margin-top: 1rem !important;\n    margin-bottom: 1rem !important;\n  }\n\n  .m-md-4 {\n    margin: 1.5rem !important;\n  }\n\n  .mt-md-4 {\n    margin-top: 1.5rem !important;\n  }\n\n  .mr-md-4 {\n    margin-right: 1.5rem !important;\n  }\n\n  .mb-md-4 {\n    margin-bottom: 1.5rem !important;\n  }\n\n  .ml-md-4 {\n    margin-left: 1.5rem !important;\n  }\n\n  .mx-md-4 {\n    margin-right: 1.5rem !important;\n    margin-left: 1.5rem !important;\n  }\n\n  .my-md-4 {\n    margin-top: 1.5rem !important;\n    margin-bottom: 1.5rem !important;\n  }\n\n  .m-md-lg {\n    margin: 1.5rem !important;\n  }\n\n  .mt-md-lg {\n    margin-top: 1.5rem !important;\n  }\n\n  .mr-md-lg {\n    margin-right: 1.5rem !important;\n  }\n\n  .mb-md-lg {\n    margin-bottom: 1.5rem !important;\n  }\n\n  .ml-md-lg {\n    margin-left: 1.5rem !important;\n  }\n\n  .mx-md-lg {\n    margin-right: 1.5rem !important;\n    margin-left: 1.5rem !important;\n  }\n\n  .my-md-lg {\n    margin-top: 1.5rem !important;\n    margin-bottom: 1.5rem !important;\n  }\n\n  .m-md-5 {\n    margin: 3rem !important;\n  }\n\n  .mt-md-5 {\n    margin-top: 3rem !important;\n  }\n\n  .mr-md-5 {\n    margin-right: 3rem !important;\n  }\n\n  .mb-md-5 {\n    margin-bottom: 3rem !important;\n  }\n\n  .ml-md-5 {\n    margin-left: 3rem !important;\n  }\n\n  .mx-md-5 {\n    margin-right: 3rem !important;\n    margin-left: 3rem !important;\n  }\n\n  .my-md-5 {\n    margin-top: 3rem !important;\n    margin-bottom: 3rem !important;\n  }\n\n  .m-md-xl {\n    margin: 3rem !important;\n  }\n\n  .mt-md-xl {\n    margin-top: 3rem !important;\n  }\n\n  .mr-md-xl {\n    margin-right: 3rem !important;\n  }\n\n  .mb-md-xl {\n    margin-bottom: 3rem !important;\n  }\n\n  .ml-md-xl {\n    margin-left: 3rem !important;\n  }\n\n  .mx-md-xl {\n    margin-right: 3rem !important;\n    margin-left: 3rem !important;\n  }\n\n  .my-md-xl {\n    margin-top: 3rem !important;\n    margin-bottom: 3rem !important;\n  }\n\n  .p-md-0 {\n    padding: 0 !important;\n  }\n\n  .pt-md-0 {\n    padding-top: 0 !important;\n  }\n\n  .pr-md-0 {\n    padding-right: 0 !important;\n  }\n\n  .pb-md-0 {\n    padding-bottom: 0 !important;\n  }\n\n  .pl-md-0 {\n    padding-left: 0 !important;\n  }\n\n  .px-md-0 {\n    padding-right: 0 !important;\n    padding-left: 0 !important;\n  }\n\n  .py-md-0 {\n    padding-top: 0 !important;\n    padding-bottom: 0 !important;\n  }\n\n  .p-md-no {\n    padding: 0 !important;\n  }\n\n  .pt-md-no {\n    padding-top: 0 !important;\n  }\n\n  .pr-md-no {\n    padding-right: 0 !important;\n  }\n\n  .pb-md-no {\n    padding-bottom: 0 !important;\n  }\n\n  .pl-md-no {\n    padding-left: 0 !important;\n  }\n\n  .px-md-no {\n    padding-right: 0 !important;\n    padding-left: 0 !important;\n  }\n\n  .py-md-no {\n    padding-top: 0 !important;\n    padding-bottom: 0 !important;\n  }\n\n  .p-md-1 {\n    padding: 0.25rem !important;\n  }\n\n  .pt-md-1 {\n    padding-top: 0.25rem !important;\n  }\n\n  .pr-md-1 {\n    padding-right: 0.25rem !important;\n  }\n\n  .pb-md-1 {\n    padding-bottom: 0.25rem !important;\n  }\n\n  .pl-md-1 {\n    padding-left: 0.25rem !important;\n  }\n\n  .px-md-1 {\n    padding-right: 0.25rem !important;\n    padding-left: 0.25rem !important;\n  }\n\n  .py-md-1 {\n    padding-top: 0.25rem !important;\n    padding-bottom: 0.25rem !important;\n  }\n\n  .p-md-xs {\n    padding: 0.25rem !important;\n  }\n\n  .pt-md-xs {\n    padding-top: 0.25rem !important;\n  }\n\n  .pr-md-xs {\n    padding-right: 0.25rem !important;\n  }\n\n  .pb-md-xs {\n    padding-bottom: 0.25rem !important;\n  }\n\n  .pl-md-xs {\n    padding-left: 0.25rem !important;\n  }\n\n  .px-md-xs {\n    padding-right: 0.25rem !important;\n    padding-left: 0.25rem !important;\n  }\n\n  .py-md-xs {\n    padding-top: 0.25rem !important;\n    padding-bottom: 0.25rem !important;\n  }\n\n  .p-md-2 {\n    padding: 0.5rem !important;\n  }\n\n  .pt-md-2 {\n    padding-top: 0.5rem !important;\n  }\n\n  .pr-md-2 {\n    padding-right: 0.5rem !important;\n  }\n\n  .pb-md-2 {\n    padding-bottom: 0.5rem !important;\n  }\n\n  .pl-md-2 {\n    padding-left: 0.5rem !important;\n  }\n\n  .px-md-2 {\n    padding-right: 0.5rem !important;\n    padding-left: 0.5rem !important;\n  }\n\n  .py-md-2 {\n    padding-top: 0.5rem !important;\n    padding-bottom: 0.5rem !important;\n  }\n\n  .p-md-sm {\n    padding: 0.5rem !important;\n  }\n\n  .pt-md-sm {\n    padding-top: 0.5rem !important;\n  }\n\n  .pr-md-sm {\n    padding-right: 0.5rem !important;\n  }\n\n  .pb-md-sm {\n    padding-bottom: 0.5rem !important;\n  }\n\n  .pl-md-sm {\n    padding-left: 0.5rem !important;\n  }\n\n  .px-md-sm {\n    padding-right: 0.5rem !important;\n    padding-left: 0.5rem !important;\n  }\n\n  .py-md-sm {\n    padding-top: 0.5rem !important;\n    padding-bottom: 0.5rem !important;\n  }\n\n  .p-md-3 {\n    padding: 1rem !important;\n  }\n\n  .pt-md-3 {\n    padding-top: 1rem !important;\n  }\n\n  .pr-md-3 {\n    padding-right: 1rem !important;\n  }\n\n  .pb-md-3 {\n    padding-bottom: 1rem !important;\n  }\n\n  .pl-md-3 {\n    padding-left: 1rem !important;\n  }\n\n  .px-md-3 {\n    padding-right: 1rem !important;\n    padding-left: 1rem !important;\n  }\n\n  .py-md-3 {\n    padding-top: 1rem !important;\n    padding-bottom: 1rem !important;\n  }\n\n  .p-md-md {\n    padding: 1rem !important;\n  }\n\n  .pt-md-md {\n    padding-top: 1rem !important;\n  }\n\n  .pr-md-md {\n    padding-right: 1rem !important;\n  }\n\n  .pb-md-md {\n    padding-bottom: 1rem !important;\n  }\n\n  .pl-md-md {\n    padding-left: 1rem !important;\n  }\n\n  .px-md-md {\n    padding-right: 1rem !important;\n    padding-left: 1rem !important;\n  }\n\n  .py-md-md {\n    padding-top: 1rem !important;\n    padding-bottom: 1rem !important;\n  }\n\n  .p-md-4 {\n    padding: 1.5rem !important;\n  }\n\n  .pt-md-4 {\n    padding-top: 1.5rem !important;\n  }\n\n  .pr-md-4 {\n    padding-right: 1.5rem !important;\n  }\n\n  .pb-md-4 {\n    padding-bottom: 1.5rem !important;\n  }\n\n  .pl-md-4 {\n    padding-left: 1.5rem !important;\n  }\n\n  .px-md-4 {\n    padding-right: 1.5rem !important;\n    padding-left: 1.5rem !important;\n  }\n\n  .py-md-4 {\n    padding-top: 1.5rem !important;\n    padding-bottom: 1.5rem !important;\n  }\n\n  .p-md-lg {\n    padding: 1.5rem !important;\n  }\n\n  .pt-md-lg {\n    padding-top: 1.5rem !important;\n  }\n\n  .pr-md-lg {\n    padding-right: 1.5rem !important;\n  }\n\n  .pb-md-lg {\n    padding-bottom: 1.5rem !important;\n  }\n\n  .pl-md-lg {\n    padding-left: 1.5rem !important;\n  }\n\n  .px-md-lg {\n    padding-right: 1.5rem !important;\n    padding-left: 1.5rem !important;\n  }\n\n  .py-md-lg {\n    padding-top: 1.5rem !important;\n    padding-bottom: 1.5rem !important;\n  }\n\n  .p-md-5 {\n    padding: 3rem !important;\n  }\n\n  .pt-md-5 {\n    padding-top: 3rem !important;\n  }\n\n  .pr-md-5 {\n    padding-right: 3rem !important;\n  }\n\n  .pb-md-5 {\n    padding-bottom: 3rem !important;\n  }\n\n  .pl-md-5 {\n    padding-left: 3rem !important;\n  }\n\n  .px-md-5 {\n    padding-right: 3rem !important;\n    padding-left: 3rem !important;\n  }\n\n  .py-md-5 {\n    padding-top: 3rem !important;\n    padding-bottom: 3rem !important;\n  }\n\n  .p-md-xl {\n    padding: 3rem !important;\n  }\n\n  .pt-md-xl {\n    padding-top: 3rem !important;\n  }\n\n  .pr-md-xl {\n    padding-right: 3rem !important;\n  }\n\n  .pb-md-xl {\n    padding-bottom: 3rem !important;\n  }\n\n  .pl-md-xl {\n    padding-left: 3rem !important;\n  }\n\n  .px-md-xl {\n    padding-right: 3rem !important;\n    padding-left: 3rem !important;\n  }\n\n  .py-md-xl {\n    padding-top: 3rem !important;\n    padding-bottom: 3rem !important;\n  }\n}\n\n@media (min-width: 1280px) {\n  .m-lg-auto {\n    margin: auto !important;\n  }\n\n  .mt-lg-auto {\n    margin-top: auto !important;\n  }\n\n  .mr-lg-auto {\n    margin-right: auto !important;\n  }\n\n  .mb-lg-auto {\n    margin-bottom: auto !important;\n  }\n\n  .ml-lg-auto {\n    margin-left: auto !important;\n  }\n\n  .mx-lg-auto {\n    margin-right: auto !important;\n    margin-left: auto !important;\n  }\n\n  .my-lg-auto {\n    margin-top: auto !important;\n    margin-bottom: auto !important;\n  }\n\n  .m-lg-0 {\n    margin: 0 !important;\n  }\n\n  .mt-lg-0 {\n    margin-top: 0 !important;\n  }\n\n  .mr-lg-0 {\n    margin-right: 0 !important;\n  }\n\n  .mb-lg-0 {\n    margin-bottom: 0 !important;\n  }\n\n  .ml-lg-0 {\n    margin-left: 0 !important;\n  }\n\n  .mx-lg-0 {\n    margin-right: 0 !important;\n    margin-left: 0 !important;\n  }\n\n  .my-lg-0 {\n    margin-top: 0 !important;\n    margin-bottom: 0 !important;\n  }\n\n  .m-lg-no {\n    margin: 0 !important;\n  }\n\n  .mt-lg-no {\n    margin-top: 0 !important;\n  }\n\n  .mr-lg-no {\n    margin-right: 0 !important;\n  }\n\n  .mb-lg-no {\n    margin-bottom: 0 !important;\n  }\n\n  .ml-lg-no {\n    margin-left: 0 !important;\n  }\n\n  .mx-lg-no {\n    margin-right: 0 !important;\n    margin-left: 0 !important;\n  }\n\n  .my-lg-no {\n    margin-top: 0 !important;\n    margin-bottom: 0 !important;\n  }\n\n  .m-lg-1 {\n    margin: 0.25rem !important;\n  }\n\n  .mt-lg-1 {\n    margin-top: 0.25rem !important;\n  }\n\n  .mr-lg-1 {\n    margin-right: 0.25rem !important;\n  }\n\n  .mb-lg-1 {\n    margin-bottom: 0.25rem !important;\n  }\n\n  .ml-lg-1 {\n    margin-left: 0.25rem !important;\n  }\n\n  .mx-lg-1 {\n    margin-right: 0.25rem !important;\n    margin-left: 0.25rem !important;\n  }\n\n  .my-lg-1 {\n    margin-top: 0.25rem !important;\n    margin-bottom: 0.25rem !important;\n  }\n\n  .m-lg-xs {\n    margin: 0.25rem !important;\n  }\n\n  .mt-lg-xs {\n    margin-top: 0.25rem !important;\n  }\n\n  .mr-lg-xs {\n    margin-right: 0.25rem !important;\n  }\n\n  .mb-lg-xs {\n    margin-bottom: 0.25rem !important;\n  }\n\n  .ml-lg-xs {\n    margin-left: 0.25rem !important;\n  }\n\n  .mx-lg-xs {\n    margin-right: 0.25rem !important;\n    margin-left: 0.25rem !important;\n  }\n\n  .my-lg-xs {\n    margin-top: 0.25rem !important;\n    margin-bottom: 0.25rem !important;\n  }\n\n  .m-lg-2 {\n    margin: 0.5rem !important;\n  }\n\n  .mt-lg-2 {\n    margin-top: 0.5rem !important;\n  }\n\n  .mr-lg-2 {\n    margin-right: 0.5rem !important;\n  }\n\n  .mb-lg-2 {\n    margin-bottom: 0.5rem !important;\n  }\n\n  .ml-lg-2 {\n    margin-left: 0.5rem !important;\n  }\n\n  .mx-lg-2 {\n    margin-right: 0.5rem !important;\n    margin-left: 0.5rem !important;\n  }\n\n  .my-lg-2 {\n    margin-top: 0.5rem !important;\n    margin-bottom: 0.5rem !important;\n  }\n\n  .m-lg-sm {\n    margin: 0.5rem !important;\n  }\n\n  .mt-lg-sm {\n    margin-top: 0.5rem !important;\n  }\n\n  .mr-lg-sm {\n    margin-right: 0.5rem !important;\n  }\n\n  .mb-lg-sm {\n    margin-bottom: 0.5rem !important;\n  }\n\n  .ml-lg-sm {\n    margin-left: 0.5rem !important;\n  }\n\n  .mx-lg-sm {\n    margin-right: 0.5rem !important;\n    margin-left: 0.5rem !important;\n  }\n\n  .my-lg-sm {\n    margin-top: 0.5rem !important;\n    margin-bottom: 0.5rem !important;\n  }\n\n  .m-lg-3 {\n    margin: 1rem !important;\n  }\n\n  .mt-lg-3 {\n    margin-top: 1rem !important;\n  }\n\n  .mr-lg-3 {\n    margin-right: 1rem !important;\n  }\n\n  .mb-lg-3 {\n    margin-bottom: 1rem !important;\n  }\n\n  .ml-lg-3 {\n    margin-left: 1rem !important;\n  }\n\n  .mx-lg-3 {\n    margin-right: 1rem !important;\n    margin-left: 1rem !important;\n  }\n\n  .my-lg-3 {\n    margin-top: 1rem !important;\n    margin-bottom: 1rem !important;\n  }\n\n  .m-lg-md {\n    margin: 1rem !important;\n  }\n\n  .mt-lg-md {\n    margin-top: 1rem !important;\n  }\n\n  .mr-lg-md {\n    margin-right: 1rem !important;\n  }\n\n  .mb-lg-md {\n    margin-bottom: 1rem !important;\n  }\n\n  .ml-lg-md {\n    margin-left: 1rem !important;\n  }\n\n  .mx-lg-md {\n    margin-right: 1rem !important;\n    margin-left: 1rem !important;\n  }\n\n  .my-lg-md {\n    margin-top: 1rem !important;\n    margin-bottom: 1rem !important;\n  }\n\n  .m-lg-4 {\n    margin: 1.5rem !important;\n  }\n\n  .mt-lg-4 {\n    margin-top: 1.5rem !important;\n  }\n\n  .mr-lg-4 {\n    margin-right: 1.5rem !important;\n  }\n\n  .mb-lg-4 {\n    margin-bottom: 1.5rem !important;\n  }\n\n  .ml-lg-4 {\n    margin-left: 1.5rem !important;\n  }\n\n  .mx-lg-4 {\n    margin-right: 1.5rem !important;\n    margin-left: 1.5rem !important;\n  }\n\n  .my-lg-4 {\n    margin-top: 1.5rem !important;\n    margin-bottom: 1.5rem !important;\n  }\n\n  .m-lg-lg {\n    margin: 1.5rem !important;\n  }\n\n  .mt-lg-lg {\n    margin-top: 1.5rem !important;\n  }\n\n  .mr-lg-lg {\n    margin-right: 1.5rem !important;\n  }\n\n  .mb-lg-lg {\n    margin-bottom: 1.5rem !important;\n  }\n\n  .ml-lg-lg {\n    margin-left: 1.5rem !important;\n  }\n\n  .mx-lg-lg {\n    margin-right: 1.5rem !important;\n    margin-left: 1.5rem !important;\n  }\n\n  .my-lg-lg {\n    margin-top: 1.5rem !important;\n    margin-bottom: 1.5rem !important;\n  }\n\n  .m-lg-5 {\n    margin: 3rem !important;\n  }\n\n  .mt-lg-5 {\n    margin-top: 3rem !important;\n  }\n\n  .mr-lg-5 {\n    margin-right: 3rem !important;\n  }\n\n  .mb-lg-5 {\n    margin-bottom: 3rem !important;\n  }\n\n  .ml-lg-5 {\n    margin-left: 3rem !important;\n  }\n\n  .mx-lg-5 {\n    margin-right: 3rem !important;\n    margin-left: 3rem !important;\n  }\n\n  .my-lg-5 {\n    margin-top: 3rem !important;\n    margin-bottom: 3rem !important;\n  }\n\n  .m-lg-xl {\n    margin: 3rem !important;\n  }\n\n  .mt-lg-xl {\n    margin-top: 3rem !important;\n  }\n\n  .mr-lg-xl {\n    margin-right: 3rem !important;\n  }\n\n  .mb-lg-xl {\n    margin-bottom: 3rem !important;\n  }\n\n  .ml-lg-xl {\n    margin-left: 3rem !important;\n  }\n\n  .mx-lg-xl {\n    margin-right: 3rem !important;\n    margin-left: 3rem !important;\n  }\n\n  .my-lg-xl {\n    margin-top: 3rem !important;\n    margin-bottom: 3rem !important;\n  }\n\n  .p-lg-0 {\n    padding: 0 !important;\n  }\n\n  .pt-lg-0 {\n    padding-top: 0 !important;\n  }\n\n  .pr-lg-0 {\n    padding-right: 0 !important;\n  }\n\n  .pb-lg-0 {\n    padding-bottom: 0 !important;\n  }\n\n  .pl-lg-0 {\n    padding-left: 0 !important;\n  }\n\n  .px-lg-0 {\n    padding-right: 0 !important;\n    padding-left: 0 !important;\n  }\n\n  .py-lg-0 {\n    padding-top: 0 !important;\n    padding-bottom: 0 !important;\n  }\n\n  .p-lg-no {\n    padding: 0 !important;\n  }\n\n  .pt-lg-no {\n    padding-top: 0 !important;\n  }\n\n  .pr-lg-no {\n    padding-right: 0 !important;\n  }\n\n  .pb-lg-no {\n    padding-bottom: 0 !important;\n  }\n\n  .pl-lg-no {\n    padding-left: 0 !important;\n  }\n\n  .px-lg-no {\n    padding-right: 0 !important;\n    padding-left: 0 !important;\n  }\n\n  .py-lg-no {\n    padding-top: 0 !important;\n    padding-bottom: 0 !important;\n  }\n\n  .p-lg-1 {\n    padding: 0.25rem !important;\n  }\n\n  .pt-lg-1 {\n    padding-top: 0.25rem !important;\n  }\n\n  .pr-lg-1 {\n    padding-right: 0.25rem !important;\n  }\n\n  .pb-lg-1 {\n    padding-bottom: 0.25rem !important;\n  }\n\n  .pl-lg-1 {\n    padding-left: 0.25rem !important;\n  }\n\n  .px-lg-1 {\n    padding-right: 0.25rem !important;\n    padding-left: 0.25rem !important;\n  }\n\n  .py-lg-1 {\n    padding-top: 0.25rem !important;\n    padding-bottom: 0.25rem !important;\n  }\n\n  .p-lg-xs {\n    padding: 0.25rem !important;\n  }\n\n  .pt-lg-xs {\n    padding-top: 0.25rem !important;\n  }\n\n  .pr-lg-xs {\n    padding-right: 0.25rem !important;\n  }\n\n  .pb-lg-xs {\n    padding-bottom: 0.25rem !important;\n  }\n\n  .pl-lg-xs {\n    padding-left: 0.25rem !important;\n  }\n\n  .px-lg-xs {\n    padding-right: 0.25rem !important;\n    padding-left: 0.25rem !important;\n  }\n\n  .py-lg-xs {\n    padding-top: 0.25rem !important;\n    padding-bottom: 0.25rem !important;\n  }\n\n  .p-lg-2 {\n    padding: 0.5rem !important;\n  }\n\n  .pt-lg-2 {\n    padding-top: 0.5rem !important;\n  }\n\n  .pr-lg-2 {\n    padding-right: 0.5rem !important;\n  }\n\n  .pb-lg-2 {\n    padding-bottom: 0.5rem !important;\n  }\n\n  .pl-lg-2 {\n    padding-left: 0.5rem !important;\n  }\n\n  .px-lg-2 {\n    padding-right: 0.5rem !important;\n    padding-left: 0.5rem !important;\n  }\n\n  .py-lg-2 {\n    padding-top: 0.5rem !important;\n    padding-bottom: 0.5rem !important;\n  }\n\n  .p-lg-sm {\n    padding: 0.5rem !important;\n  }\n\n  .pt-lg-sm {\n    padding-top: 0.5rem !important;\n  }\n\n  .pr-lg-sm {\n    padding-right: 0.5rem !important;\n  }\n\n  .pb-lg-sm {\n    padding-bottom: 0.5rem !important;\n  }\n\n  .pl-lg-sm {\n    padding-left: 0.5rem !important;\n  }\n\n  .px-lg-sm {\n    padding-right: 0.5rem !important;\n    padding-left: 0.5rem !important;\n  }\n\n  .py-lg-sm {\n    padding-top: 0.5rem !important;\n    padding-bottom: 0.5rem !important;\n  }\n\n  .p-lg-3 {\n    padding: 1rem !important;\n  }\n\n  .pt-lg-3 {\n    padding-top: 1rem !important;\n  }\n\n  .pr-lg-3 {\n    padding-right: 1rem !important;\n  }\n\n  .pb-lg-3 {\n    padding-bottom: 1rem !important;\n  }\n\n  .pl-lg-3 {\n    padding-left: 1rem !important;\n  }\n\n  .px-lg-3 {\n    padding-right: 1rem !important;\n    padding-left: 1rem !important;\n  }\n\n  .py-lg-3 {\n    padding-top: 1rem !important;\n    padding-bottom: 1rem !important;\n  }\n\n  .p-lg-md {\n    padding: 1rem !important;\n  }\n\n  .pt-lg-md {\n    padding-top: 1rem !important;\n  }\n\n  .pr-lg-md {\n    padding-right: 1rem !important;\n  }\n\n  .pb-lg-md {\n    padding-bottom: 1rem !important;\n  }\n\n  .pl-lg-md {\n    padding-left: 1rem !important;\n  }\n\n  .px-lg-md {\n    padding-right: 1rem !important;\n    padding-left: 1rem !important;\n  }\n\n  .py-lg-md {\n    padding-top: 1rem !important;\n    padding-bottom: 1rem !important;\n  }\n\n  .p-lg-4 {\n    padding: 1.5rem !important;\n  }\n\n  .pt-lg-4 {\n    padding-top: 1.5rem !important;\n  }\n\n  .pr-lg-4 {\n    padding-right: 1.5rem !important;\n  }\n\n  .pb-lg-4 {\n    padding-bottom: 1.5rem !important;\n  }\n\n  .pl-lg-4 {\n    padding-left: 1.5rem !important;\n  }\n\n  .px-lg-4 {\n    padding-right: 1.5rem !important;\n    padding-left: 1.5rem !important;\n  }\n\n  .py-lg-4 {\n    padding-top: 1.5rem !important;\n    padding-bottom: 1.5rem !important;\n  }\n\n  .p-lg-lg {\n    padding: 1.5rem !important;\n  }\n\n  .pt-lg-lg {\n    padding-top: 1.5rem !important;\n  }\n\n  .pr-lg-lg {\n    padding-right: 1.5rem !important;\n  }\n\n  .pb-lg-lg {\n    padding-bottom: 1.5rem !important;\n  }\n\n  .pl-lg-lg {\n    padding-left: 1.5rem !important;\n  }\n\n  .px-lg-lg {\n    padding-right: 1.5rem !important;\n    padding-left: 1.5rem !important;\n  }\n\n  .py-lg-lg {\n    padding-top: 1.5rem !important;\n    padding-bottom: 1.5rem !important;\n  }\n\n  .p-lg-5 {\n    padding: 3rem !important;\n  }\n\n  .pt-lg-5 {\n    padding-top: 3rem !important;\n  }\n\n  .pr-lg-5 {\n    padding-right: 3rem !important;\n  }\n\n  .pb-lg-5 {\n    padding-bottom: 3rem !important;\n  }\n\n  .pl-lg-5 {\n    padding-left: 3rem !important;\n  }\n\n  .px-lg-5 {\n    padding-right: 3rem !important;\n    padding-left: 3rem !important;\n  }\n\n  .py-lg-5 {\n    padding-top: 3rem !important;\n    padding-bottom: 3rem !important;\n  }\n\n  .p-lg-xl {\n    padding: 3rem !important;\n  }\n\n  .pt-lg-xl {\n    padding-top: 3rem !important;\n  }\n\n  .pr-lg-xl {\n    padding-right: 3rem !important;\n  }\n\n  .pb-lg-xl {\n    padding-bottom: 3rem !important;\n  }\n\n  .pl-lg-xl {\n    padding-left: 3rem !important;\n  }\n\n  .px-lg-xl {\n    padding-right: 3rem !important;\n    padding-left: 3rem !important;\n  }\n\n  .py-lg-xl {\n    padding-top: 3rem !important;\n    padding-bottom: 3rem !important;\n  }\n}\n\n@media (min-width: 1920px) {\n  .m-xl-auto {\n    margin: auto !important;\n  }\n\n  .mt-xl-auto {\n    margin-top: auto !important;\n  }\n\n  .mr-xl-auto {\n    margin-right: auto !important;\n  }\n\n  .mb-xl-auto {\n    margin-bottom: auto !important;\n  }\n\n  .ml-xl-auto {\n    margin-left: auto !important;\n  }\n\n  .mx-xl-auto {\n    margin-right: auto !important;\n    margin-left: auto !important;\n  }\n\n  .my-xl-auto {\n    margin-top: auto !important;\n    margin-bottom: auto !important;\n  }\n\n  .m-xl-0 {\n    margin: 0 !important;\n  }\n\n  .mt-xl-0 {\n    margin-top: 0 !important;\n  }\n\n  .mr-xl-0 {\n    margin-right: 0 !important;\n  }\n\n  .mb-xl-0 {\n    margin-bottom: 0 !important;\n  }\n\n  .ml-xl-0 {\n    margin-left: 0 !important;\n  }\n\n  .mx-xl-0 {\n    margin-right: 0 !important;\n    margin-left: 0 !important;\n  }\n\n  .my-xl-0 {\n    margin-top: 0 !important;\n    margin-bottom: 0 !important;\n  }\n\n  .m-xl-no {\n    margin: 0 !important;\n  }\n\n  .mt-xl-no {\n    margin-top: 0 !important;\n  }\n\n  .mr-xl-no {\n    margin-right: 0 !important;\n  }\n\n  .mb-xl-no {\n    margin-bottom: 0 !important;\n  }\n\n  .ml-xl-no {\n    margin-left: 0 !important;\n  }\n\n  .mx-xl-no {\n    margin-right: 0 !important;\n    margin-left: 0 !important;\n  }\n\n  .my-xl-no {\n    margin-top: 0 !important;\n    margin-bottom: 0 !important;\n  }\n\n  .m-xl-1 {\n    margin: 0.25rem !important;\n  }\n\n  .mt-xl-1 {\n    margin-top: 0.25rem !important;\n  }\n\n  .mr-xl-1 {\n    margin-right: 0.25rem !important;\n  }\n\n  .mb-xl-1 {\n    margin-bottom: 0.25rem !important;\n  }\n\n  .ml-xl-1 {\n    margin-left: 0.25rem !important;\n  }\n\n  .mx-xl-1 {\n    margin-right: 0.25rem !important;\n    margin-left: 0.25rem !important;\n  }\n\n  .my-xl-1 {\n    margin-top: 0.25rem !important;\n    margin-bottom: 0.25rem !important;\n  }\n\n  .m-xl-xs {\n    margin: 0.25rem !important;\n  }\n\n  .mt-xl-xs {\n    margin-top: 0.25rem !important;\n  }\n\n  .mr-xl-xs {\n    margin-right: 0.25rem !important;\n  }\n\n  .mb-xl-xs {\n    margin-bottom: 0.25rem !important;\n  }\n\n  .ml-xl-xs {\n    margin-left: 0.25rem !important;\n  }\n\n  .mx-xl-xs {\n    margin-right: 0.25rem !important;\n    margin-left: 0.25rem !important;\n  }\n\n  .my-xl-xs {\n    margin-top: 0.25rem !important;\n    margin-bottom: 0.25rem !important;\n  }\n\n  .m-xl-2 {\n    margin: 0.5rem !important;\n  }\n\n  .mt-xl-2 {\n    margin-top: 0.5rem !important;\n  }\n\n  .mr-xl-2 {\n    margin-right: 0.5rem !important;\n  }\n\n  .mb-xl-2 {\n    margin-bottom: 0.5rem !important;\n  }\n\n  .ml-xl-2 {\n    margin-left: 0.5rem !important;\n  }\n\n  .mx-xl-2 {\n    margin-right: 0.5rem !important;\n    margin-left: 0.5rem !important;\n  }\n\n  .my-xl-2 {\n    margin-top: 0.5rem !important;\n    margin-bottom: 0.5rem !important;\n  }\n\n  .m-xl-sm {\n    margin: 0.5rem !important;\n  }\n\n  .mt-xl-sm {\n    margin-top: 0.5rem !important;\n  }\n\n  .mr-xl-sm {\n    margin-right: 0.5rem !important;\n  }\n\n  .mb-xl-sm {\n    margin-bottom: 0.5rem !important;\n  }\n\n  .ml-xl-sm {\n    margin-left: 0.5rem !important;\n  }\n\n  .mx-xl-sm {\n    margin-right: 0.5rem !important;\n    margin-left: 0.5rem !important;\n  }\n\n  .my-xl-sm {\n    margin-top: 0.5rem !important;\n    margin-bottom: 0.5rem !important;\n  }\n\n  .m-xl-3 {\n    margin: 1rem !important;\n  }\n\n  .mt-xl-3 {\n    margin-top: 1rem !important;\n  }\n\n  .mr-xl-3 {\n    margin-right: 1rem !important;\n  }\n\n  .mb-xl-3 {\n    margin-bottom: 1rem !important;\n  }\n\n  .ml-xl-3 {\n    margin-left: 1rem !important;\n  }\n\n  .mx-xl-3 {\n    margin-right: 1rem !important;\n    margin-left: 1rem !important;\n  }\n\n  .my-xl-3 {\n    margin-top: 1rem !important;\n    margin-bottom: 1rem !important;\n  }\n\n  .m-xl-md {\n    margin: 1rem !important;\n  }\n\n  .mt-xl-md {\n    margin-top: 1rem !important;\n  }\n\n  .mr-xl-md {\n    margin-right: 1rem !important;\n  }\n\n  .mb-xl-md {\n    margin-bottom: 1rem !important;\n  }\n\n  .ml-xl-md {\n    margin-left: 1rem !important;\n  }\n\n  .mx-xl-md {\n    margin-right: 1rem !important;\n    margin-left: 1rem !important;\n  }\n\n  .my-xl-md {\n    margin-top: 1rem !important;\n    margin-bottom: 1rem !important;\n  }\n\n  .m-xl-4 {\n    margin: 1.5rem !important;\n  }\n\n  .mt-xl-4 {\n    margin-top: 1.5rem !important;\n  }\n\n  .mr-xl-4 {\n    margin-right: 1.5rem !important;\n  }\n\n  .mb-xl-4 {\n    margin-bottom: 1.5rem !important;\n  }\n\n  .ml-xl-4 {\n    margin-left: 1.5rem !important;\n  }\n\n  .mx-xl-4 {\n    margin-right: 1.5rem !important;\n    margin-left: 1.5rem !important;\n  }\n\n  .my-xl-4 {\n    margin-top: 1.5rem !important;\n    margin-bottom: 1.5rem !important;\n  }\n\n  .m-xl-lg {\n    margin: 1.5rem !important;\n  }\n\n  .mt-xl-lg {\n    margin-top: 1.5rem !important;\n  }\n\n  .mr-xl-lg {\n    margin-right: 1.5rem !important;\n  }\n\n  .mb-xl-lg {\n    margin-bottom: 1.5rem !important;\n  }\n\n  .ml-xl-lg {\n    margin-left: 1.5rem !important;\n  }\n\n  .mx-xl-lg {\n    margin-right: 1.5rem !important;\n    margin-left: 1.5rem !important;\n  }\n\n  .my-xl-lg {\n    margin-top: 1.5rem !important;\n    margin-bottom: 1.5rem !important;\n  }\n\n  .m-xl-5 {\n    margin: 3rem !important;\n  }\n\n  .mt-xl-5 {\n    margin-top: 3rem !important;\n  }\n\n  .mr-xl-5 {\n    margin-right: 3rem !important;\n  }\n\n  .mb-xl-5 {\n    margin-bottom: 3rem !important;\n  }\n\n  .ml-xl-5 {\n    margin-left: 3rem !important;\n  }\n\n  .mx-xl-5 {\n    margin-right: 3rem !important;\n    margin-left: 3rem !important;\n  }\n\n  .my-xl-5 {\n    margin-top: 3rem !important;\n    margin-bottom: 3rem !important;\n  }\n\n  .m-xl-xl {\n    margin: 3rem !important;\n  }\n\n  .mt-xl-xl {\n    margin-top: 3rem !important;\n  }\n\n  .mr-xl-xl {\n    margin-right: 3rem !important;\n  }\n\n  .mb-xl-xl {\n    margin-bottom: 3rem !important;\n  }\n\n  .ml-xl-xl {\n    margin-left: 3rem !important;\n  }\n\n  .mx-xl-xl {\n    margin-right: 3rem !important;\n    margin-left: 3rem !important;\n  }\n\n  .my-xl-xl {\n    margin-top: 3rem !important;\n    margin-bottom: 3rem !important;\n  }\n\n  .p-xl-0 {\n    padding: 0 !important;\n  }\n\n  .pt-xl-0 {\n    padding-top: 0 !important;\n  }\n\n  .pr-xl-0 {\n    padding-right: 0 !important;\n  }\n\n  .pb-xl-0 {\n    padding-bottom: 0 !important;\n  }\n\n  .pl-xl-0 {\n    padding-left: 0 !important;\n  }\n\n  .px-xl-0 {\n    padding-right: 0 !important;\n    padding-left: 0 !important;\n  }\n\n  .py-xl-0 {\n    padding-top: 0 !important;\n    padding-bottom: 0 !important;\n  }\n\n  .p-xl-no {\n    padding: 0 !important;\n  }\n\n  .pt-xl-no {\n    padding-top: 0 !important;\n  }\n\n  .pr-xl-no {\n    padding-right: 0 !important;\n  }\n\n  .pb-xl-no {\n    padding-bottom: 0 !important;\n  }\n\n  .pl-xl-no {\n    padding-left: 0 !important;\n  }\n\n  .px-xl-no {\n    padding-right: 0 !important;\n    padding-left: 0 !important;\n  }\n\n  .py-xl-no {\n    padding-top: 0 !important;\n    padding-bottom: 0 !important;\n  }\n\n  .p-xl-1 {\n    padding: 0.25rem !important;\n  }\n\n  .pt-xl-1 {\n    padding-top: 0.25rem !important;\n  }\n\n  .pr-xl-1 {\n    padding-right: 0.25rem !important;\n  }\n\n  .pb-xl-1 {\n    padding-bottom: 0.25rem !important;\n  }\n\n  .pl-xl-1 {\n    padding-left: 0.25rem !important;\n  }\n\n  .px-xl-1 {\n    padding-right: 0.25rem !important;\n    padding-left: 0.25rem !important;\n  }\n\n  .py-xl-1 {\n    padding-top: 0.25rem !important;\n    padding-bottom: 0.25rem !important;\n  }\n\n  .p-xl-xs {\n    padding: 0.25rem !important;\n  }\n\n  .pt-xl-xs {\n    padding-top: 0.25rem !important;\n  }\n\n  .pr-xl-xs {\n    padding-right: 0.25rem !important;\n  }\n\n  .pb-xl-xs {\n    padding-bottom: 0.25rem !important;\n  }\n\n  .pl-xl-xs {\n    padding-left: 0.25rem !important;\n  }\n\n  .px-xl-xs {\n    padding-right: 0.25rem !important;\n    padding-left: 0.25rem !important;\n  }\n\n  .py-xl-xs {\n    padding-top: 0.25rem !important;\n    padding-bottom: 0.25rem !important;\n  }\n\n  .p-xl-2 {\n    padding: 0.5rem !important;\n  }\n\n  .pt-xl-2 {\n    padding-top: 0.5rem !important;\n  }\n\n  .pr-xl-2 {\n    padding-right: 0.5rem !important;\n  }\n\n  .pb-xl-2 {\n    padding-bottom: 0.5rem !important;\n  }\n\n  .pl-xl-2 {\n    padding-left: 0.5rem !important;\n  }\n\n  .px-xl-2 {\n    padding-right: 0.5rem !important;\n    padding-left: 0.5rem !important;\n  }\n\n  .py-xl-2 {\n    padding-top: 0.5rem !important;\n    padding-bottom: 0.5rem !important;\n  }\n\n  .p-xl-sm {\n    padding: 0.5rem !important;\n  }\n\n  .pt-xl-sm {\n    padding-top: 0.5rem !important;\n  }\n\n  .pr-xl-sm {\n    padding-right: 0.5rem !important;\n  }\n\n  .pb-xl-sm {\n    padding-bottom: 0.5rem !important;\n  }\n\n  .pl-xl-sm {\n    padding-left: 0.5rem !important;\n  }\n\n  .px-xl-sm {\n    padding-right: 0.5rem !important;\n    padding-left: 0.5rem !important;\n  }\n\n  .py-xl-sm {\n    padding-top: 0.5rem !important;\n    padding-bottom: 0.5rem !important;\n  }\n\n  .p-xl-3 {\n    padding: 1rem !important;\n  }\n\n  .pt-xl-3 {\n    padding-top: 1rem !important;\n  }\n\n  .pr-xl-3 {\n    padding-right: 1rem !important;\n  }\n\n  .pb-xl-3 {\n    padding-bottom: 1rem !important;\n  }\n\n  .pl-xl-3 {\n    padding-left: 1rem !important;\n  }\n\n  .px-xl-3 {\n    padding-right: 1rem !important;\n    padding-left: 1rem !important;\n  }\n\n  .py-xl-3 {\n    padding-top: 1rem !important;\n    padding-bottom: 1rem !important;\n  }\n\n  .p-xl-md {\n    padding: 1rem !important;\n  }\n\n  .pt-xl-md {\n    padding-top: 1rem !important;\n  }\n\n  .pr-xl-md {\n    padding-right: 1rem !important;\n  }\n\n  .pb-xl-md {\n    padding-bottom: 1rem !important;\n  }\n\n  .pl-xl-md {\n    padding-left: 1rem !important;\n  }\n\n  .px-xl-md {\n    padding-right: 1rem !important;\n    padding-left: 1rem !important;\n  }\n\n  .py-xl-md {\n    padding-top: 1rem !important;\n    padding-bottom: 1rem !important;\n  }\n\n  .p-xl-4 {\n    padding: 1.5rem !important;\n  }\n\n  .pt-xl-4 {\n    padding-top: 1.5rem !important;\n  }\n\n  .pr-xl-4 {\n    padding-right: 1.5rem !important;\n  }\n\n  .pb-xl-4 {\n    padding-bottom: 1.5rem !important;\n  }\n\n  .pl-xl-4 {\n    padding-left: 1.5rem !important;\n  }\n\n  .px-xl-4 {\n    padding-right: 1.5rem !important;\n    padding-left: 1.5rem !important;\n  }\n\n  .py-xl-4 {\n    padding-top: 1.5rem !important;\n    padding-bottom: 1.5rem !important;\n  }\n\n  .p-xl-lg {\n    padding: 1.5rem !important;\n  }\n\n  .pt-xl-lg {\n    padding-top: 1.5rem !important;\n  }\n\n  .pr-xl-lg {\n    padding-right: 1.5rem !important;\n  }\n\n  .pb-xl-lg {\n    padding-bottom: 1.5rem !important;\n  }\n\n  .pl-xl-lg {\n    padding-left: 1.5rem !important;\n  }\n\n  .px-xl-lg {\n    padding-right: 1.5rem !important;\n    padding-left: 1.5rem !important;\n  }\n\n  .py-xl-lg {\n    padding-top: 1.5rem !important;\n    padding-bottom: 1.5rem !important;\n  }\n\n  .p-xl-5 {\n    padding: 3rem !important;\n  }\n\n  .pt-xl-5 {\n    padding-top: 3rem !important;\n  }\n\n  .pr-xl-5 {\n    padding-right: 3rem !important;\n  }\n\n  .pb-xl-5 {\n    padding-bottom: 3rem !important;\n  }\n\n  .pl-xl-5 {\n    padding-left: 3rem !important;\n  }\n\n  .px-xl-5 {\n    padding-right: 3rem !important;\n    padding-left: 3rem !important;\n  }\n\n  .py-xl-5 {\n    padding-top: 3rem !important;\n    padding-bottom: 3rem !important;\n  }\n\n  .p-xl-xl {\n    padding: 3rem !important;\n  }\n\n  .pt-xl-xl {\n    padding-top: 3rem !important;\n  }\n\n  .pr-xl-xl {\n    padding-right: 3rem !important;\n  }\n\n  .pb-xl-xl {\n    padding-bottom: 3rem !important;\n  }\n\n  .pl-xl-xl {\n    padding-left: 3rem !important;\n  }\n\n  .px-xl-xl {\n    padding-right: 3rem !important;\n    padding-left: 3rem !important;\n  }\n\n  .py-xl-xl {\n    padding-top: 3rem !important;\n    padding-bottom: 3rem !important;\n  }\n}\n\n.text-justify {\n  text-align: justify !important;\n}\n\n.text-nowrap {\n  white-space: nowrap !important;\n}\n\n.text-truncate {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.text-center {\n  text-align: center !important;\n}\n\n.text-left {\n  text-align: left !important;\n}\n\n.text-right {\n  text-align: right !important;\n}\n\n@media (min-width: 600px) {\n  .text-sm-center {\n    text-align: center !important;\n  }\n\n  .text-sm-left {\n    text-align: left !important;\n  }\n\n  .text-sm-right {\n    text-align: right !important;\n  }\n}\n\n@media (min-width: 960px) {\n  .text-md-center {\n    text-align: center !important;\n  }\n\n  .text-md-left {\n    text-align: left !important;\n  }\n\n  .text-md-right {\n    text-align: right !important;\n  }\n}\n\n@media (min-width: 1280px) {\n  .text-lg-center {\n    text-align: center !important;\n  }\n\n  .text-lg-left {\n    text-align: left !important;\n  }\n\n  .text-lg-right {\n    text-align: right !important;\n  }\n}\n\n@media (min-width: 1920px) {\n  .text-xl-center {\n    text-align: center !important;\n  }\n\n  .text-xl-left {\n    text-align: left !important;\n  }\n\n  .text-xl-right {\n    text-align: right !important;\n  }\n}\n\n.text-black {\n  color: #000000 !important;\n}\n\n.text-black-primary {\n  color: rgba(0, 0, 0, 0.87) !important;\n}\n\n.text-black-secondary {\n  color: rgba(0, 0, 0, 0.54) !important;\n}\n\n.text-black-hint {\n  color: rgba(0, 0, 0, 0.38) !important;\n}\n\n.text-black-divider {\n  color: rgba(0, 0, 0, 0.12) !important;\n}\n\n.text-white {\n  color: #ffffff !important;\n}\n\n.text-white-primary {\n  color: white !important;\n}\n\n.text-white-secondary {\n  color: rgba(255, 255, 255, 0.7) !important;\n}\n\n.text-white-hint {\n  color: rgba(255, 255, 255, 0.5) !important;\n}\n\n.text-white-divider {\n  color: rgba(255, 255, 255, 0.12) !important;\n}\n\n.text-muted {\n  color: rgba(0, 0, 0, 0.38) !important;\n}\n\n.text-primary {\n  color: #9c27b0 !important;\n}\n\na.text-primary:active,\na.text-primary:focus,\na.text-primary:hover {\n  color: #7b1fa2 !important;\n}\n\n.text-secondary {\n  color: #ff4081 !important;\n}\n\na.text-secondary:active,\na.text-secondary:focus,\na.text-secondary:hover {\n  color: #f50057 !important;\n}\n\n.text-danger {\n  color: #f44336 !important;\n}\n\na.text-danger:active,\na.text-danger:focus,\na.text-danger:hover {\n  color: #d32f2f !important;\n}\n\n.text-info {\n  color: #2196f3 !important;\n}\n\na.text-info:active,\na.text-info:focus,\na.text-info:hover {\n  color: #1976d2 !important;\n}\n\n.text-success {\n  color: #4caf50 !important;\n}\n\na.text-success:active,\na.text-success:focus,\na.text-success:hover {\n  color: #388e3c !important;\n}\n\n.text-warning {\n  color: #ff9800 !important;\n}\n\na.text-warning:active,\na.text-warning:focus,\na.text-warning:hover {\n  color: #f57c00 !important;\n}\n\n.text-dark {\n  color: #424242 !important;\n}\n\na.text-dark:active,\na.text-dark:focus,\na.text-dark:hover {\n  color: #212121 !important;\n}\n\n.text-light {\n  color: #f5f5f5 !important;\n}\n\na.text-light:active,\na.text-light:focus,\na.text-light:hover {\n  color: #e0e0e0 !important;\n}\n\n.font-italic {\n  font-style: italic;\n}\n\n.font-weight-bold,\n.font-weight-medium {\n  font-weight: 500;\n}\n\n.font-weight-light {\n  font-weight: 300;\n}\n\n.font-weight-normal,\n.font-weight-regular {\n  font-weight: 400;\n}\n\n.text-hide {\n  background-color: transparent;\n  border: 0;\n  color: transparent;\n  font: 0/0 a;\n  text-shadow: none;\n}\n\n.text-capitalize {\n  text-transform: capitalize !important;\n}\n\n.text-lowercase {\n  text-transform: lowercase !important;\n}\n\n.text-uppercase {\n  text-transform: uppercase !important;\n}\n\n.invisible {\n  visibility: hidden !important;\n}\n\n.visible {\n  visibility: visible !important;\n}\n\n.material-icons {\n  font-size: 1.5em;\n  line-height: 0.66667em;\n  vertical-align: -0.34537em;\n}\n\n.material-icons-inline {\n  font-size: inherit;\n  line-height: 1;\n}\n\n.waves-effect {\n  position: relative;\n  -webkit-tap-highlight-color: transparent;\n}\n\n.waves-effect .waves-ripple {\n  transition-duration: 0.3s;\n  transition-property: opacity, transform;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  background-clip: content-box;\n  background-color: rgba(0, 0, 0, 0.12);\n  border-radius: 50%;\n  height: 4rem;\n  margin-top: -2rem;\n  margin-left: -2rem;\n  opacity: 0;\n  position: absolute;\n  transform: scale(0) translate(0, 0);\n  width: 4rem;\n}\n\n@media (min-width: 600px) {\n  .waves-effect .waves-ripple {\n    transition-duration: 0.39s;\n  }\n}\n\n@media (min-width: 1280px) {\n  .waves-effect .waves-ripple {\n    transition-duration: 0.2s;\n  }\n}\n\n.waves-effect.waves-light .waves-ripple {\n  background-color: rgba(255, 255, 255, 0.12);\n}\n\n.waves-wrap {\n  overflow: hidden;\n  pointer-events: none;\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  user-select: none;\n}\n\n.waves-circle > .waves-wrap {\n  border-radius: 50%;\n  mask: url('data:image/svg+xml;charset=utf8,%3Csvg xmlns=\"http://www.w3.org/2000/svg\"%3E%3Ccircle fill=\"none\" r=\"0\" stroke-width=\"0\" /%3E%3C/svg%3E');\n  mask-image: radial-gradient(circle, #ffffff 100%, #000000 100%);\n  transform: translateZ(0);\n}\n\n@media print {\n  *,\n  *::after,\n  *::before {\n    box-shadow: none !important;\n    text-shadow: none !important;\n  }\n\n  a,\n  a:visited {\n    text-decoration: underline;\n  }\n\n  abbr[title]::after {\n    content: ' (\" attr(title) \") ';\n  }\n\n  blockquote {\n    page-break-inside: avoid;\n  }\n\n  h2,\n  h3,\n  p {\n    orphans: 3;\n    widows: 3;\n  }\n\n  h2,\n  h3 {\n    page-break-inside: avoid;\n  }\n\n  img {\n    page-break-inside: avoid;\n  }\n\n  pre {\n    page-break-inside: avoid;\n    white-space: pre-wrap !important;\n  }\n\n  thead {\n    display: table-header-group;\n  }\n\n  tr {\n    page-break-inside: avoid;\n  }\n\n  .card {\n    border: 1px solid #e1e1e1;\n  }\n\n  .dropdown-menu {\n    border: 1px solid #e1e1e1;\n  }\n\n  .list-group-item {\n    border: 1px solid #e1e1e1;\n    margin-bottom: -1px;\n  }\n\n  .list-group-item:last-child {\n    margin-bottom: 0;\n  }\n\n  .list-group-flush:first-child .list-group-item:first-child {\n    border-top: 0;\n  }\n\n  .list-group-flush:last-child .list-group-item:last-child {\n    border-bottom: 0;\n  }\n\n  .list-group-flush .list-group-item {\n    border-right: 0;\n    border-left: 0;\n  }\n\n  .nav-tabs {\n    border-bottom: 1px solid #e1e1e1;\n  }\n\n  .navbar {\n    display: none;\n  }\n\n  .popover {\n    border: 1px solid #e1e1e1;\n  }\n\n  .table-bordered {\n    border: 1px solid #e1e1e1;\n  }\n}\n\n.jumbotron-banner {\n  color: white;\n  background: #4278B8 url(\"./dist/bg.png\") center center !important;\n}\n\n.form-control:hover,\n.form-control:focus {\n  box-shadow: none;\n}\n\n.form-control:focus {\n  border-color: #4278B8;\n}\n\n.form-control#income {\n  text-align: right;\n}\n\n.row.calc-income {\n  margin-top: 2rem;\n}\n\n.row.calc-blow-bucket {\n  margin-top: 2rem;\n}\n\n.row.calc-result {\n  margin-top: 1rem;\n  padding-bottom: 1rem;\n  border-bottom: 1px solid #DDD;\n}\n\n.dollars,\n.cents {\n  color: #999;\n}\n\n.income-help {\n  letter-spacing: 0;\n}\n\n.table tbody td,\n.table tfoot td {\n  font-size: 1rem;\n}\n\n.your-percentage {\n  width: 40px !important;\n}\n\n.input-group-addon,\n.input-group-lg > .input-group-addon {\n  min-width: auto;\n}\n\n.form-control + .input-group-addon {\n  margin-left: .2rem;\n}\n\n.r-table {\n  width: 100%;\n  display: table;\n}\n\n.r-table > .r-table-row.what-if > .r-table-td,\n.r-table > .r-table-head > .r-table-row > .r-table-td {\n  border-bottom: 1px solid #DDD;\n}\n\n.r-table > .r-table-row.what-if > .r-table-td {\n  background-color: #FFFFDD;\n}\n\n.r-table > .r-table-row.what-if > .r-table-td:nth-child(1) {\n  background-color: #ffffff;\n}\n\n.r-table-head {\n  display: table-header-group;\n}\n\n.r-table-head .r-table-td {\n  font-size: .75rem;\n  text-transform: uppercase;\n  color: rgba(0, 0, 0, 0.5);\n}\n\n.r-table-row {\n  display: table-row;\n}\n\n.r-table-row .r-table-td:nth-child(2),\n.r-table-row .r-table-td:nth-child(3),\n.r-table-row .r-table-td:nth-child(4) {\n  text-align: right;\n  color: rgba(0, 0, 0, 0.5);\n}\n\n.r-table-row.what-if .r-table-td:nth-child(2),\n.r-table-row.what-if .r-table-td:nth-child(3),\n.r-table-row.what-if .r-table-td:nth-child(4) {\n  color: black;\n}\n\n.r-table-td {\n  display: table-cell;\n  padding: 1rem;\n}\n\n.r-table-foot {\n  display: table-footer-group;\n}\n\n.r-table-foot > .r-table-row:nth-child(1) > .r-table-td {\n  border-top: 1px solid #DDD;\n}\n\n.r-table-foot .r-table-td:nth-child(1) {\n  color: black;\n}\n\n.r-table-foot .r-table-row .r-table-td {\n  color: black;\n  font-weight: bold;\n}\n\n.r-table-foot .r-table-row.what-if > .r-table-td {\n  background-color: #FFFFDD;\n}\n\n.r-table-foot .r-table-row.what-if > .r-table-td:nth-child(1) {\n  background-color: #ffffff;\n}", ""]);

// exports


/***/ }),
/* 24 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			memo[selector] = fn.call(this, selector);
		}

		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(26);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 26 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 27 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_js_cookie__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_js_cookie___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_js_cookie__);




// Store the Cookie class for later use.
window.Cookie = __WEBPACK_IMPORTED_MODULE_0_js_cookie___default.a;

var calculator = __webpack_require__(8);

calculator.renderSync().appendTo(document.body);


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * JavaScript Cookie v2.1.4
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;(function (factory) {
	var registeredInModuleLoader = false;
	if (true) {
		!(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		registeredInModuleLoader = true;
	}
	if (true) {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;
			if (typeof document === 'undefined') {
				return;
			}

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				// We're using "expires" because "max-age" is not supported by IE
				attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				if (!converter.write) {
					value = encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
				} else {
					value = converter.write(value, key);
				}

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				var stringifiedAttributes = '';

				for (var attributeName in attributes) {
					if (!attributes[attributeName]) {
						continue;
					}
					stringifiedAttributes += '; ' + attributeName;
					if (attributes[attributeName] === true) {
						continue;
					}
					stringifiedAttributes += '=' + attributes[attributeName];
				}
				return (document.cookie = key + '=' + value + stringifiedAttributes);
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = parts[0].replace(rdecode, decodeURIComponent);
					cookie = converter.read ?
						converter.read(cookie, name) : converter(cookie, name) ||
						cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.set = api;
		api.get = function (key) {
			return api.call(api, key);
		};
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(30);


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

__webpack_require__(31);

// helpers provide a core set of various utility methods
// that are available in every template
var AsyncVDOMBuilder = __webpack_require__(33);
var makeRenderable = __webpack_require__(37);

/**
 * Method is for internal usage only. This method
 * is invoked by code in a compiled Marko template and
 * it is used to create a new Template instance.
 * @private
 */
exports.t = function createTemplate(path) {
     return new Template(path);
};

function Template(path, func) {
    this.path = path;
    this._ = func;
    this.meta = undefined;
}

function createOut(globalData, parent, state) {
    return new AsyncVDOMBuilder(globalData, parent, state);
}

var Template_prototype = Template.prototype = {
    createOut: createOut
};

makeRenderable(Template_prototype);

exports.Template = Template;
exports.___createOut = createOut;

__webpack_require__(4).___setCreateOut(createOut);


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.createOut = __webpack_require__(4);
exports.load = __webpack_require__(32);


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

module.exports = function load(templatePath) {
    throw Error('Not found: ' + templatePath);
};

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

var EventEmitter = __webpack_require__(9);
var vdom = __webpack_require__(10);
var VElement = vdom.___VElement;
var VDocumentFragment = vdom.___VDocumentFragment;
var VComment = vdom.___VComment;
var VText = vdom.___VText;
var virtualizeHTML = vdom.___virtualizeHTML;
var RenderResult = __webpack_require__(14);
var defaultDocument = vdom.___defaultDocument;

var FLAG_FINISHED = 1;
var FLAG_LAST_FIRED = 2;

var EVENT_UPDATE = 'update';
var EVENT_FINISH = 'finish';

function State(tree) {
    this.___remaining = 1;
    this.___events = new EventEmitter();
    this.___tree = tree;
    this.___last = null;
    this.___lastCount = 0;
    this.___flags = 0;
}

function AsyncVDOMBuilder(globalData, parentNode, state) {
    if (!parentNode) {
        parentNode = new VDocumentFragment();
    }

    if (state) {
        state.___remaining++;
    } else {
        state = new State(parentNode);
    }

    this.data = {};
    this.___state = state;
    this.___parent = parentNode;
    this.global = globalData || {};
    this.___stack = [parentNode];
    this.___sync = false;
    this.___vnode = undefined;
    this.___componentArgs = null; // Component args
}

var proto = AsyncVDOMBuilder.prototype = {
    ___isOut: true,
    ___document: defaultDocument,

    ___elementNode: function(element, childCount, pushToStack) {
        var parent = this.___parent;
        if (parent !== undefined) {
            parent.___appendChild(element);
            if (pushToStack === true) {
                this.___stack.push(element);
                this.___parent = element;
            }
        }
        return childCount === 0 ? this : element;
    },

    element: function(tagName, attrs, childCount, flags, props) {
        var element = new VElement(tagName, attrs, childCount, flags, props);
        return this.___elementNode(element, childCount);
    },

    ___elementDynamicTag: function(tagName, attrs, childCount, flags, props) {
        var element = VElement.___createElementDynamicTag(tagName, attrs, childCount, flags, props);
        return this.___elementNode(element, childCount);
    },

    n: function(node) {
        // NOTE: We do a shallow clone since we assume the node is being reused
        //       and a node can only have one parent node.
        return this.node(node.___cloneNode());
    },

    node: function(node) {
        var parent = this.___parent;
        if (parent !== undefined) {
            parent.___appendChild(node);
        }
        return this;
    },

    text: function(text) {
        var type = typeof text;

        if (type != 'string') {
            if (text == null) {
                return;
            } else if (type === 'object') {
                if (text.toHTML) {
                    return this.h(text.toHTML());
                }
            }

            text = text.toString();
        }

        var parent = this.___parent;
        if (parent !== undefined) {
            var lastChild = parent.lastChild;
            if (lastChild && lastChild.___Text) {
                lastChild.___nodeValue += text;
            } else {
                parent.___appendChild(new VText(text));
            }
        }
        return this;
    },

    comment: function(comment) {
        return this.node(new VComment(comment));
    },

    html: function(html) {
        if (html != null) {
            var vdomNode = virtualizeHTML(html, this.___document || document);
            this.node(vdomNode);
        }

        return this;
    },

    beginElement: function(tagName, attrs, childCount, flags, props) {
        var element = new VElement(tagName, attrs, childCount, flags, props);
        this.___elementNode(element, childCount, true);
        return this;
    },

    ___beginElementDynamicTag: function(tagName, attrs, childCount, flags, props) {
        var element = VElement.___createElementDynamicTag(tagName, attrs, childCount, flags, props);
        this.___elementNode(element, childCount, true);
        return this;
    },

    endElement: function() {
        var stack = this.___stack;
        stack.pop();
        this.___parent = stack[stack.length-1];
    },

    end: function() {
        var state = this.___state;

        this.___parent = undefined;

        var remaining = --state.___remaining;

        if (!(state.___flags & FLAG_LAST_FIRED) && (remaining - state.___lastCount === 0)) {
            state.___flags |= FLAG_LAST_FIRED;
            state.___lastCount = 0;
            state.___events.emit('last');
        }

        if (remaining === 0) {
            state.___flags |= FLAG_FINISHED;
            state.___events.emit(EVENT_FINISH, this.___getResult());
        }

        return this;
    },

    error: function(e) {
        try {
            this.emit('error', e);
        } finally {
            // If there is no listener for the error event then it will
            // throw a new Error here. In order to ensure that the async fragment
            // is still properly ended we need to put the end() in a `finally`
            // block
            this.end();
        }

        return this;
    },

    beginAsync: function(options) {
        if (this.___sync) {
            throw Error('Not allowed');
        }

        var state = this.___state;

        if (options) {
            if (options.last) {
                state.___lastCount++;
            }
        }

        var documentFragment = this.___parent.___appendDocumentFragment();
        var asyncOut = new AsyncVDOMBuilder(this.global, documentFragment, state);

        state.___events.emit('beginAsync', {
           out: asyncOut,
           parentOut: this
       });

       return asyncOut;
    },

    createOut: function(callback) {
        return new AsyncVDOMBuilder(this.global);
    },

    flush: function() {
        var events = this.___state.___events;

        if (events.listenerCount(EVENT_UPDATE)) {
            events.emit(EVENT_UPDATE, new RenderResult(this));
        }
    },

    ___getOutput: function() {
        return this.___state.___tree;
    },

    ___getResult: function() {
        return this.___result || (this.___result = new RenderResult(this));
    },

    on: function(event, callback) {
        var state = this.___state;

        if (event === EVENT_FINISH && (state.___flags & FLAG_FINISHED)) {
            callback(this.___getResult());
        } else {
            state.___events.on(event, callback);
        }

        return this;
    },

    once: function(event, callback) {
        var state = this.___state;

        if (event === EVENT_FINISH && (state.___flags & FLAG_FINISHED)) {
            callback(this.___getResult());
            return this;
        }

        state.___events.once(event, callback);
        return this;
    },

    emit: function(type, arg) {
        var events = this.___state.___events;
        switch(arguments.length) {
            case 1:
                events.emit(type);
                break;
            case 2:
                events.emit(type, arg);
                break;
            default:
                events.emit.apply(events, arguments);
                break;
        }
        return this;
    },

    removeListener: function() {
        var events = this.___state.___events;
        events.removeListener.apply(events, arguments);
        return this;
    },

    sync: function() {
        this.___sync = true;
    },

    isSync: function() {
        return this.___sync;
    },

    onLast: function(callback) {
        var state = this.___state;

        var lastArray = state.___last;

        if (!lastArray) {
            lastArray = state.___last = [];
            var i = 0;
            var next = function() {
                if (i === lastArray.length) {
                    return;
                }
                var _next = lastArray[i++];
                _next(next);
            };

            this.once('last', function() {
                next();
            });
        }

        lastArray.push(callback);
        return this;
    },

    ___getNode: function(doc) {
        var node = this.___vnode;
        if (!node) {
            var vdomTree = this.___getOutput();

            node = this.___vnode = vdomTree.actualize(doc || this.___document || document);
        }
        return node;
    },

    toString: function() {
        var docFragment = this.___getNode();
        var html = '';

        if (docFragment.hasChildNodes()) {
            var children = docFragment.childNodes;
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                // get outerHTML if exists, otherwise default to nodeValue
                html += child.outerHTML || child.nodeValue;
            }
        }

        return html;
    },

    then: function(fn, fnErr) {
        var out = this;
        var promise = new Promise(function(resolve, reject) {
            out.on('error', reject)
                .on(EVENT_FINISH, function(result) {
                    resolve(result);
                });
        });

        return Promise.resolve(promise).then(fn, fnErr);
    },

    catch: function(fnErr) {
        return this.then(undefined, fnErr);
    },

    isVDOM: true,

    c: function(componentArgs) {
        this.___componentArgs = componentArgs;
    }
};

proto.e = proto.element;
proto.ed = proto.___elementDynamicTag;
proto.be = proto.beginElement;
proto.bed = proto.___beginElementDynamicTag;
proto.ee = proto.endElement;
proto.t = proto.text;
proto.h = proto.w = proto.write = proto.html;

module.exports = AsyncVDOMBuilder;


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

var VNode = __webpack_require__(3);
var inherit = __webpack_require__(2);

function VComment(value) {
    this.___VNode(-1 /* no children */);
    this.___nodeValue = value;
}

VComment.prototype = {
    ___nodeType: 8,

    ___actualize: function(doc) {
        return doc.createComment(this.___nodeValue);
    },

    ___cloneNode: function() {
        return new VComment(this.___nodeValue);
    }
};

inherit(VComment, VNode);

module.exports = VComment;


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

var VNode = __webpack_require__(3);
var inherit = __webpack_require__(2);
var extend = __webpack_require__(1);

function VDocumentFragmentClone(other) {
    extend(this, other);
    this.___parentNode = null;
    this.___nextSiblingInternal = null;
}

function VDocumentFragment(documentFragment) {
    this.___VNode(null /* childCount */);
}

VDocumentFragment.prototype = {
    ___nodeType: 11,

    ___DocumentFragment: true,

    ___cloneNode: function() {
        return new VDocumentFragmentClone(this);
    },

    ___actualize: function(doc) {
        return doc.createDocumentFragment();
    }
};

inherit(VDocumentFragment, VNode);

VDocumentFragmentClone.prototype = VDocumentFragment.prototype;

module.exports = VDocumentFragment;


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

var VNode = __webpack_require__(3);
var inherit = __webpack_require__(2);

function VText(value) {
    this.___VNode(-1 /* no children */);
    this.___nodeValue = value;
}

VText.prototype = {
    ___Text: true,

    ___nodeType: 3,

    ___actualize: function(doc) {
        return doc.createTextNode(this.___nodeValue);
    },

    ___cloneNode: function() {
        return new VText(this.___nodeValue);
    }
};

inherit(VText, VNode);

module.exports = VText;


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

var defaultCreateOut = __webpack_require__(4);
var extend = __webpack_require__(1);

function safeRender(renderFunc, finalData, finalOut, shouldEnd) {
    try {
        renderFunc(finalData, finalOut);

        if (shouldEnd) {
            finalOut.end();
        }
    } catch(err) {
        var actualEnd = finalOut.end;
        finalOut.end = function() {};

        setTimeout(function() {
            finalOut.end = actualEnd;
            finalOut.error(err);
        }, 0);
    }
    return finalOut;
}

module.exports = function(target, renderer) {
    var renderFunc = renderer && (renderer.renderer || renderer.render || renderer);
    var createOut = target.createOut || renderer.createOut || defaultCreateOut;

    return extend(target, {
        createOut: createOut,

        renderToString: function(data, callback) {
            var localData = data || {};
            var render = renderFunc || this._;
            var globalData = localData.$global;
            var out = createOut(globalData);

            out.global.template = this;

            if (globalData) {
                localData.$global = undefined;
            }

            if (callback) {
                out.on('finish', function() {
                       callback(null, out.toString(), out);
                   })
                   .once('error', callback);

                return safeRender(render, localData, out, true);
            } else {
                out.sync();
                render(localData, out);
                return out.toString();
            }
        },

        renderSync: function(data) {
            var localData = data || {};
            var render = renderFunc || this._;
            var globalData = localData.$global;
            var out = createOut(globalData);
            out.sync();

            out.global.template = this;

            if (globalData) {
                localData.$global = undefined;
            }

            render(localData, out);
            return out.___getResult();
        },

        /**
         * Renders a template to either a stream (if the last
         * argument is a Stream instance) or
         * provides the output to a callback function (if the last
         * argument is a Function).
         *
         * Supported signatures:
         *
         * render(data)
         * render(data, out)
         * render(data, stream)
         * render(data, callback)
         *
         * @param  {Object} data The view model data for the template
         * @param  {AsyncStream/AsyncVDOMBuilder} out A Stream, an AsyncStream/AsyncVDOMBuilder instance, or a callback function
         * @return {AsyncStream/AsyncVDOMBuilder} Returns the AsyncStream/AsyncVDOMBuilder instance that the template is rendered to
         */
        render: function(data, out) {
            var callback;
            var finalOut;
            var finalData;
            var globalData;
            var render = renderFunc || this._;
            var shouldBuffer = this.___shouldBuffer;
            var shouldEnd = true;

            if (data) {
                finalData = data;
                if ((globalData = data.$global)) {
                    finalData.$global = undefined;
                }
            } else {
                finalData = {};
            }

            if (out && out.___isOut) {
                finalOut = out;
                shouldEnd = false;
                extend(out.global, globalData);
            } else if (typeof out == 'function') {
                finalOut = createOut(globalData);
                callback = out;
            } else {
                finalOut = createOut(
                    globalData, // global
                    out, // writer(AsyncStream) or parentNode(AsyncVDOMBuilder)
                    null, // state
                    shouldBuffer // ignored by AsyncVDOMBuilder
                );
            }

            if (callback) {
                finalOut
                    .on('finish', function() {
                        callback(null, finalOut.___getResult());
                    })
                    .once('error', callback);
            }

            globalData = finalOut.global;

            globalData.template = globalData.template || this;

            return safeRender(render, finalData, finalOut, shouldEnd);
        }
    });
};


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(39);

exports.c = __webpack_require__(17); // Referenced by compiled templates
exports.r = __webpack_require__(52); // Referenced by compiled templates
exports.rc = __webpack_require__(6).___register;  // Referenced by compiled templates


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

var componentsUtil = __webpack_require__(0);
var initComponents = __webpack_require__(40);

__webpack_require__(7).___initClientRendered = initComponents.___initClientRendered;

exports.getComponentForEl = componentsUtil.___getComponentForEl;
exports.init = initComponents.___initServerRendered;


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var warp10Finalize = __webpack_require__(41);
var eventDelegation = __webpack_require__(16);
var win = window;
var defaultDocument = document;
var componentsUtil = __webpack_require__(0);
var componentLookup = componentsUtil.___componentLookup;
var getElementById = componentsUtil.___getElementById;
var ComponentDef = __webpack_require__(5);
var registry = __webpack_require__(6);
var serverRenderedGlobals = {};

function invokeComponentEventHandler(component, targetMethodName, args) {
    var method = component[targetMethodName];
    if (!method) {
        throw Error('Method not found: ' + targetMethodName);
    }

    method.apply(component, args);
}

function addEventListenerHelper(el, eventType, listener) {
    el.addEventListener(eventType, listener, false);
    return function remove() {
        el.removeEventListener(eventType, listener);
    };
}

function addDOMEventListeners(component, el, eventType, targetMethodName, extraArgs, handles) {
    var removeListener = addEventListenerHelper(el, eventType, function(event) {
        var args = [event, el];
        if (extraArgs) {
            args = extraArgs.concat(args);
        }

        invokeComponentEventHandler(component, targetMethodName, args);
    });
    handles.push(removeListener);
}

function initComponent(componentDef, doc) {
    var component = componentDef.___component;

    if (!component || !component.___isComponent) {
        return; // legacy
    }

    component.___reset();
    component.___document = doc;

    var isExisting = componentDef.___isExisting;
    var id = component.id;

    var rootIds = componentDef.___roots;

    if (rootIds) {
        var rootComponents;

        var els = [];

        rootIds.forEach(function(rootId) {
            var nestedId = id + '-' + rootId;
            var rootComponent = componentLookup[nestedId];
            if (rootComponent) {
                rootComponent.___rootFor = component;
                if (rootComponents) {
                    rootComponents.push(rootComponent);
                } else {
                    rootComponents = component.___rootComponents = [rootComponent];
                }
            } else {
                var rootEl = getElementById(doc, nestedId);
                if (rootEl) {
                    rootEl._w = component;
                    els.push(rootEl);
                }
            }
        });

        component.el = els[0];
        component.els = els;
        componentLookup[id] = component;
    } else if (!isExisting) {
        var el = getElementById(doc, id);
        el._w = component;
        component.el = el;
        component.els = [el];
        componentLookup[id] = component;
    }

    if (componentDef.___willRerenderInBrowser) {
        component.___rerender(true);
        return;
    }

    if (isExisting) {
        component.___removeDOMEventListeners();
    }

    var domEvents = componentDef.___domEvents;
    if (domEvents) {
        var eventListenerHandles = [];

        domEvents.forEach(function(domEventArgs) {
            // The event mapping is for a direct DOM event (not a custom event and not for bubblign dom events)

            var eventType = domEventArgs[0];
            var targetMethodName = domEventArgs[1];
            var eventEl = getElementById(doc, domEventArgs[2]);
            var extraArgs = domEventArgs[3];

            addDOMEventListeners(component, eventEl, eventType, targetMethodName, extraArgs, eventListenerHandles);
        });

        if (eventListenerHandles.length) {
            component.___domEventListenerHandles = eventListenerHandles;
        }
    }

    if (component.___mounted) {
        component.___emitLifecycleEvent('update');
    } else {
        component.___mounted = true;
        component.___emitLifecycleEvent('mount');
    }
}

/**
 * This method is used to initialized components associated with UI components
 * rendered in the browser. While rendering UI components a "components context"
 * is added to the rendering context to keep up with which components are rendered.
 * When ready, the components can then be initialized by walking the component tree
 * in the components context (nested components are initialized before ancestor components).
 * @param  {Array<marko-components/lib/ComponentDef>} componentDefs An array of ComponentDef instances
 */
function initClientRendered(componentDefs, doc) {
    // Ensure that event handlers to handle delegating events are
    // always attached before initializing any components
    eventDelegation.___init(doc);

    doc = doc || defaultDocument;
    for (var i=0,len=componentDefs.length; i<len; i++) {
        var componentDef = componentDefs[i];

        if (componentDef.___children) {
            initClientRendered(componentDef.___children, doc);
        }

        initComponent(
            componentDef,
            doc);
    }
}

/**
 * This method initializes all components that were rendered on the server by iterating over all
 * of the component IDs.
 */
function initServerRendered(renderedComponents, doc) {
    if (!renderedComponents) {
        renderedComponents = win.$components;

        if (renderedComponents && renderedComponents.forEach) {
            renderedComponents.forEach(function(renderedComponent) {
                initServerRendered(renderedComponent, doc);
            });
        }

        win.$components = {
            concat: initServerRendered
        };

        return;
    }
    // Ensure that event handlers to handle delegating events are
    // always attached before initializing any components
    eventDelegation.___init(doc || defaultDocument);

    renderedComponents = warp10Finalize(renderedComponents);

    var componentDefs = renderedComponents.w;
    var typesArray = renderedComponents.t;
    var globals = window.$MG;
    if (globals) {
        serverRenderedGlobals = warp10Finalize(globals);
        delete window.$MG;
    }

    componentDefs.forEach(function(componentDef) {
        componentDef = ComponentDef.___deserialize(componentDef, typesArray, serverRenderedGlobals, registry);
        initComponent(componentDef, doc || defaultDocument);
    });
}

exports.___initClientRendered = initClientRendered;
exports.___initServerRendered = initServerRendered;


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(42);

/***/ }),
/* 42 */
/***/ (function(module, exports) {

var isArray = Array.isArray;

function resolve(object, path, len) {
    var current = object;
    for (var i=0; i<len; i++) {
        current = current[path[i]];
    }

    return current;
}

function resolveType(info) {
    if (info.type === 'Date') {
        return new Date(info.value);
    } else {
        throw new Error('Bad type');
    }
}

module.exports = function finalize(outer) {
    if (!outer) {
        return outer;
    }

    var assignments = outer.$$;
    if (assignments) {
        var object = outer.o;
        var len;

        if (assignments && (len=assignments.length)) {
            for (var i=0; i<len; i++) {
                var assignment = assignments[i];

                var rhs = assignment.r;
                var rhsValue;

                if (isArray(rhs)) {
                    rhsValue = resolve(object, rhs, rhs.length);
                } else {
                    rhsValue = resolveType(rhs);
                }

                var lhs = assignment.l;
                var lhsLast = lhs.length-1;

                if (lhsLast === -1) {
                    object = outer.o = rhsValue;
                    break;
                } else {
                    var lhsParent = resolve(object, lhs, lhsLast);
                    lhsParent[lhs[lhsLast]] = rhsValue;
                }
            }
        }

        assignments.length = 0; // Assignments have been applied, do not reapply

        return object == null ? null : object;
    } else {
        return outer;
    }

};

/***/ }),
/* 43 */
/***/ (function(module, exports) {

module.exports = [
    /* Mouse Events */
    'click',
    'dblclick',
    'mousedown',
    'mouseup',
    // 'mouseover',
    // 'mousemove',
    // 'mouseout',
    'dragstart',
    'drag',
    // 'dragenter',
    // 'dragleave',
    // 'dragover',
    'drop',
    'dragend',

    /* Keyboard Events */
    'keydown',
    'keypress',
    'keyup',

    /* Form Events */
    'select',
    'change',
    'submit',
    'reset',
    'input',

    'attach', // Pseudo event supported by Marko
    'detach'  // Pseudo event supported by Marko

    // 'focus', <-- Does not bubble
    // 'blur', <-- Does not bubble
    // 'focusin', <-- Not supported in all browsers
    // 'focusout' <-- Not supported in all browsers
];

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

module.exports = function load(typeName) {
    throw new Error('Not found: ' + typeName);
};

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

var extend = __webpack_require__(1);

function ensure(state, propertyName) {
    var proto = state.constructor.prototype;
    if (!(propertyName in proto)) {
        Object.defineProperty(proto, propertyName, {
            get: function() {
                return this.___raw[propertyName];
            },
            set: function(value) {
                this.___set(propertyName, value, false /* ensure:false */);
            }
        });
    }
}

function State(component) {
    this.___component = component;
    this.___raw = {};

    this.___dirty = false;
    this.___old = null;
    this.___changes = null;
    this.___forced = null; // An object that we use to keep tracking of state properties that were forced to be dirty

    Object.seal(this);
}

State.prototype = {
    ___reset: function() {
        var self = this;

        self.___dirty = false;
        self.___old = null;
        self.___changes = null;
        self.___forced = null;
    },

    ___replace: function(newState) {
        var state = this;
        var key;

        var rawState = this.___raw;

        for (key in rawState) {
            if (!(key in newState)) {
                state.___set(key, undefined, false /* ensure:false */, false /* forceDirty:false */);
            }
        }

        for (key in newState) {
            state.___set(key, newState[key], true /* ensure:true */, false /* forceDirty:false */);
        }
    },
    ___set: function(name, value, shouldEnsure, forceDirty) {
        var rawState = this.___raw;

        if (shouldEnsure) {
            ensure(this, name);
        }

        if (forceDirty) {
            var forcedDirtyState = this.___forced || (this.___forced = {});
            forcedDirtyState[name] = true;
        } else if (rawState[name] === value) {
            return;
        }

        if (!this.___dirty) {
            // This is the first time we are modifying the component state
            // so introduce some properties to do some tracking of
            // changes to the state
            this.___dirty = true; // Mark the component state as dirty (i.e. modified)
            this.___old = rawState;
            this.___raw = rawState = extend({}, rawState);
            this.___changes = {};
            this.___component.___queueUpdate();
        }

        this.___changes[name] = value;

        if (value === undefined) {
            // Don't store state properties with an undefined or null value
            delete rawState[name];
        } else {
            // Otherwise, store the new value in the component state
            rawState[name] = value;
        }
    },
    toJSON: function() {
        return this.___raw;
    }
};

module.exports = State;


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/* jshint newcap:false */

var domInsert = __webpack_require__(15);
var defaultCreateOut = __webpack_require__(4);
var getComponentsContext = __webpack_require__(7).___getComponentsContext;
var componentsUtil = __webpack_require__(0);
var componentLookup = componentsUtil.___componentLookup;
var emitLifecycleEvent = componentsUtil.___emitLifecycleEvent;
var destroyComponentForEl = componentsUtil.___destroyComponentForEl;
var destroyElRecursive = componentsUtil.___destroyElRecursive;
var getElementById = componentsUtil.___getElementById;
var EventEmitter = __webpack_require__(9);
var RenderResult = __webpack_require__(14);
var SubscriptionTracker = __webpack_require__(48);
var inherit = __webpack_require__(2);
var updateManager = __webpack_require__(49);
var morphdom = __webpack_require__(51);
var eventDelegation = __webpack_require__(16);

var slice = Array.prototype.slice;

var MORPHDOM_SKIP = true;

var COMPONENT_SUBSCRIBE_TO_OPTIONS;
var NON_COMPONENT_SUBSCRIBE_TO_OPTIONS = {
    addDestroyListener: false
};

function outNoop() { /* jshint -W040 */ return this; }

var emit = EventEmitter.prototype.emit;

function removeListener(removeEventListenerHandle) {
    removeEventListenerHandle();
}

function checkCompatibleComponent(globalComponentsContext, el) {
    var component = el._w;
    while(component) {
        var id = component.id;
        var newComponentDef = globalComponentsContext.___componentsById[id];
        if (newComponentDef && component.___type == newComponentDef.___component.___type) {
            break;
        }

        var rootFor = component.___rootFor;
        if (rootFor)  {
            component = rootFor;
        } else {
            component.___destroyShallow();
            break;
        }
    }
}

function handleCustomEventWithMethodListener(component, targetMethodName, args, extraArgs) {
    // Remove the "eventType" argument
    args.push(component);

    if (extraArgs) {
        args = extraArgs.concat(args);
    }


    var targetComponent = componentLookup[component.___scope];
    var targetMethod = targetComponent[targetMethodName];
    if (!targetMethod) {
        throw Error('Method not found: ' + targetMethodName);
    }

    targetMethod.apply(targetComponent, args);
}

function getElIdHelper(component, componentElId, index) {
    var id = component.id;

    var elId = componentElId != null ? id + '-' + componentElId : id;

    if (index != null) {
        elId += '[' + index + ']';
    }

    return elId;
}

/**
 * This method is used to process "update_<stateName>" handler functions.
 * If all of the modified state properties have a user provided update handler
 * then a rerender will be bypassed and, instead, the DOM will be updated
 * looping over and invoking the custom update handlers.
 * @return {boolean} Returns true if if the DOM was updated. False, otherwise.
 */
function processUpdateHandlers(component, stateChanges, oldState) {
    var handlerMethod;
    var handlers;

    for (var propName in stateChanges) {
        if (stateChanges.hasOwnProperty(propName)) {
            var handlerMethodName = 'update_' + propName;

            handlerMethod = component[handlerMethodName];
            if (handlerMethod) {
                (handlers || (handlers=[])).push([propName, handlerMethod]);
            } else {
                // This state change does not have a state handler so return false
                // to force a rerender
                return;
            }
        }
    }

    // If we got here then all of the changed state properties have
    // an update handler or there are no state properties that actually
    // changed.
    if (handlers) {
        // Otherwise, there are handlers for all of the changed properties
        // so apply the updates using those handlers

        handlers.forEach(function(handler, i) {
            var propertyName = handler[0];
            handlerMethod = handler[1];

            var newValue = stateChanges[propertyName];
            var oldValue = oldState[propertyName];
            handlerMethod.call(component, newValue, oldValue);
        });

        emitLifecycleEvent(component, 'update');

        component.___reset();
    }

    return true;
}

function checkInputChanged(existingComponent, oldInput, newInput) {
    if (oldInput != newInput) {
        if (oldInput == null || newInput == null) {
            return true;
        }

        var oldKeys = Object.keys(oldInput);
        var newKeys = Object.keys(newInput);
        var len = oldKeys.length;
        if (len !== newKeys.length) {
            return true;
        }

        for (var i=0; i<len; i++) {
            var key = oldKeys[i];
            if (oldInput[key] !== newInput[key]) {
                return true;
            }
        }
    }

    return false;
}

function onNodeDiscarded(node) {
    if (node.nodeType === 1) {
        destroyComponentForEl(node);
    }
}

function onBeforeNodeDiscarded(node) {
    return eventDelegation.___handleNodeDetach(node);
}

function onBeforeElUpdated(fromEl, key, globalComponentsContext) {
    if (key) {
        var preserved = globalComponentsContext.___preserved[key];

        if (preserved === true) {
            // Don't morph elements that are associated with components that are being
            // reused or elements that are being preserved. For components being reused,
            // the morphing will take place when the reused component updates.
            return MORPHDOM_SKIP;
        } else {
            // We may need to destroy a Component associated with the current element
            // if a new UI component was rendered to the same element and the types
            // do not match
            checkCompatibleComponent(globalComponentsContext, fromEl);
        }
    }
}

function onBeforeElChildrenUpdated(el, key, globalComponentsContext) {
    if (key) {
        var preserved = globalComponentsContext.___preservedBodies[key];
        if (preserved === true) {
            // Don't morph the children since they are preserved
            return MORPHDOM_SKIP;
        }
    }
}

function onNodeAdded(node, globalComponentsContext) {
    eventDelegation.___handleNodeAttach(node, globalComponentsContext.___out);
}

var componentProto;

/**
 * Base component type.
 *
 * NOTE: Any methods that are prefixed with an underscore should be considered private!
 */
function Component(id) {
    EventEmitter.call(this);
    this.id = id;
    this.el = null;
    this.___state = null;
    this.___roots = null;
    this.___subscriptions = null;
    this.___domEventListenerHandles = null;
    this.___bubblingDomEvents = null; // Used to keep track of bubbling DOM events for components rendered on the server
    this.___customEvents = null;
    this.___scope = null;
    this.___renderInput = null;
    this.___input = undefined;
    this.___mounted = false;
    this.___global = undefined;

    this.___destroyed = false;
    this.___updateQueued = false;
    this.___dirty = false;
    this.___settingInput = false;

    this.___document = undefined;
}

Component.prototype = componentProto = {
    ___isComponent: true,

    subscribeTo: function(target) {
        if (!target) {
            throw TypeError();
        }

        var subscriptions = this.___subscriptions || (this.___subscriptions = new SubscriptionTracker());

        var subscribeToOptions = target.___isComponent ?
            COMPONENT_SUBSCRIBE_TO_OPTIONS :
            NON_COMPONENT_SUBSCRIBE_TO_OPTIONS;

        return subscriptions.subscribeTo(target, subscribeToOptions);
    },

    emit: function(eventType) {
        var customEvents = this.___customEvents;
        var target;

        if (customEvents && (target = customEvents[eventType])) {
            var targetMethodName = target[0];
            var extraArgs = target[1];
            var args = slice.call(arguments, 1);

            handleCustomEventWithMethodListener(this, targetMethodName, args, extraArgs);
        }

        if (this.listenerCount(eventType)) {
            return emit.apply(this, arguments);
        }
    },
    getElId: function (componentElId, index) {
        return getElIdHelper(this, componentElId, index);
    },
    getEl: function (componentElId, index) {
        var doc = this.___document;

        if (componentElId != null) {
            return getElementById(doc, getElIdHelper(this, componentElId, index));
        } else {
            return this.el || getElementById(doc, getElIdHelper(this));
        }
    },
    getEls: function(id) {
        var els = [];
        var i = 0;
        var el;
        while((el = this.getEl(id, i))) {
            els.push(el);
            i++;
        }
        return els;
    },
    getComponent: function(id, index) {
        return componentLookup[getElIdHelper(this, id, index)];
    },
    getComponents: function(id) {
        var components = [];
        var i = 0;
        var component;
        while((component = componentLookup[getElIdHelper(this, id, i)])) {
            components.push(component);
            i++;
        }
        return components;
    },
    destroy: function() {
        if (this.___destroyed) {
            return;
        }

        var els = this.els;

        this.___destroyShallow();

        var rootComponents = this.___rootComponents;
        if (rootComponents) {
            rootComponents.forEach(function(rootComponent) {
                rootComponent.___destroy();
            });
        }

        els.forEach(function(el) {
            destroyElRecursive(el);

            var parentNode = el.parentNode;
            if (parentNode) {
                parentNode.removeChild(el);
            }
        });
    },

    ___destroyShallow: function() {
        if (this.___destroyed) {
            return;
        }

        emitLifecycleEvent(this, 'destroy');
        this.___destroyed = true;

        this.el = null;

        // Unsubscribe from all DOM events
        this.___removeDOMEventListeners();

        var subscriptions = this.___subscriptions;
        if (subscriptions) {
            subscriptions.removeAllListeners();
            this.___subscriptions = null;
        }

        delete componentLookup[this.id];
    },

    isDestroyed: function() {
        return this.___destroyed;
    },
    get state() {
        return this.___state;
    },
    set state(newState) {
        var state = this.___state;
        if (!state && !newState) {
            return;
        }

        if (!state) {
            state = this.___state = new this.___State(this);
        }

        state.___replace(newState || {});

        if (state.___dirty) {
            this.___queueUpdate();
        }

        if (!newState) {
            this.___state = null;
        }
    },
    setState: function(name, value) {
        var state = this.___state;

        if (typeof name == 'object') {
            // Merge in the new state with the old state
            var newState = name;
            for (var k in newState) {
                if (newState.hasOwnProperty(k)) {
                    state.___set(k, newState[k], true /* ensure:true */);
                }
            }
        } else {
            state.___set(name, value, true /* ensure:true */);
        }
    },

    setStateDirty: function(name, value) {
        var state = this.___state;

        if (arguments.length == 1) {
            value = state[name];
        }

        state.___set(name, value, true /* ensure:true */, true /* forceDirty:true */);
    },

    replaceState: function(newState) {
        this.___state.___replace(newState);
    },

    get input() {
        return this.___input;
    },
    set input(newInput) {
        if (this.___settingInput) {
            this.___input = newInput;
        } else {
            this.___setInput(newInput);
        }
    },

    ___setInput: function(newInput, onInput, out) {
        onInput = onInput || this.onInput;
        var updatedInput;

        var oldInput = this.___input;
        this.___input = undefined;

        if (onInput) {
            // We need to set a flag to preview `this.input = foo` inside
            // onInput causing infinite recursion
            this.___settingInput = true;
            updatedInput = onInput.call(this, newInput || {}, out);
            this.___settingInput = false;
        }

        newInput = this.___renderInput = updatedInput || newInput;

        if ((this.___dirty = checkInputChanged(this, oldInput, newInput))) {
            this.___queueUpdate();
        }

        if (this.___input === undefined) {
            this.___input = newInput;
            if (newInput && newInput.$global) {
                this.___global = newInput.$global;
            }
        }

        return newInput;
    },

    forceUpdate: function() {
        this.___dirty = true;
        this.___queueUpdate();
    },

    ___queueUpdate: function() {
        if (!this.___updateQueued) {
            updateManager.___queueComponentUpdate(this);
        }
    },

    update: function() {
        if (this.___destroyed === true || this.___isDirty === false) {
            return;
        }

        var input = this.___input;
        var state = this.___state;

        if (this.___dirty === false && state !== null && state.___dirty === true) {
            if (processUpdateHandlers(this, state.___changes, state.___old, state)) {
                state.___dirty = false;
            }
        }

        if (this.___isDirty === true) {
            // The UI component is still dirty after process state handlers
            // then we should rerender

            if (this.shouldUpdate(input, state) !== false) {
                this.___rerender(false);
            }
        }

        this.___reset();
    },


    get ___isDirty() {
        return this.___dirty === true || (this.___state !== null && this.___state.___dirty === true);
    },

    ___reset: function() {
        this.___dirty = false;
        this.___updateQueued = false;
        this.___renderInput = null;
        var state = this.___state;
        if (state) {
            state.___reset();
        }
    },

    shouldUpdate: function(newState, newProps) {
        return true;
    },

    ___emitLifecycleEvent: function(eventType, eventArg1, eventArg2) {
        emitLifecycleEvent(this, eventType, eventArg1, eventArg2);
    },

    ___rerender: function(isRerenderInBrowser) {
        var self = this;
        var renderer = self.___renderer;

        if (!renderer) {
            throw TypeError();
        }
        var fromEls = self.___getRootEls({});
        var doc = self.___document;
        var input = this.___renderInput || this.___input;
        var globalData = this.___global;

        updateManager.___batchUpdate(function() {
            var createOut = renderer.createOut || defaultCreateOut;
            var out = createOut(globalData);
            out.sync();
            out.___document = self.___document;

            if (isRerenderInBrowser === true) {
                out.e =
                    out.be =
                    out.ee =
                    out.t =
                    out.h =
                    out.w =
                    out.write =
                    out.html =
                    outNoop;
            }

            var componentsContext = getComponentsContext(out);
            var globalComponentsContext = componentsContext.___globalContext;
            globalComponentsContext.___rerenderComponent = self;
            globalComponentsContext.___isRerenderInBrowser = isRerenderInBrowser;

            renderer(input, out);

            var result = new RenderResult(out);

            if (isRerenderInBrowser !== true) {
                var targetNode = out.___getOutput();

                var fromEl;

                var targetEl = targetNode.___firstChild;
                while (targetEl) {
                    var nodeName = targetEl.___nodeName;

                    if (nodeName === 'HTML') {
                        fromEl = document.documentElement;
                    } else if (nodeName === 'BODY') {
                        fromEl = document.body;
                    } else if (nodeName === 'HEAD') {
                        fromEl = document.head;
                    } else {
                        fromEl = fromEls[targetEl.id];
                    }

                    if (fromEl) {
                        morphdom(
                            fromEl,
                            targetEl,
                            globalComponentsContext,
                            onNodeAdded,
                            onBeforeElUpdated,
                            onBeforeNodeDiscarded,
                            onNodeDiscarded,
                            onBeforeElChildrenUpdated);
                    }

                    targetEl = targetEl.___nextSibling;
                }
            }

            result.afterInsert(doc);

            out.emit('___componentsInitialized');
        });

        this.___reset();
    },

    ___getRootEls: function(rootEls) {
        var i, len;

        var componentEls = this.els;

        for (i=0, len=componentEls.length; i<len; i++) {
            var componentEl = componentEls[i];
            rootEls[componentEl.id] = componentEl;
        }

        var rootComponents = this.___rootComponents;
        if (rootComponents) {
            for (i=0, len=rootComponents.length; i<len; i++) {
                var rootComponent = rootComponents[i];
                rootComponent.___getRootEls(rootEls);
            }
        }

        return rootEls;
    },

    ___removeDOMEventListeners: function() {
        var eventListenerHandles = this.___domEventListenerHandles;
        if (eventListenerHandles) {
            eventListenerHandles.forEach(removeListener);
            this.___domEventListenerHandles = null;
        }
    },

    get ___rawState() {
        var state = this.___state;
        return state && state.___raw;
    },

    ___setCustomEvents: function(customEvents, scope) {
        var finalCustomEvents = this.___customEvents = {};
        this.___scope = scope;

        customEvents.forEach(function(customEvent) {
            var eventType = customEvent[0];
            var targetMethodName = customEvent[1];
            var extraArgs = customEvent[2];

            finalCustomEvents[eventType] = [targetMethodName, extraArgs];
        });
    }
};

componentProto.elId = componentProto.getElId;
componentProto.___update = componentProto.update;
componentProto.___destroy = componentProto.destroy;

// Add all of the following DOM methods to Component.prototype:
// - appendTo(referenceEl)
// - replace(referenceEl)
// - replaceChildrenOf(referenceEl)
// - insertBefore(referenceEl)
// - insertAfter(referenceEl)
// - prependTo(referenceEl)
domInsert(
    componentProto,
    function getEl(component) {
        var els = this.els;
        var elCount = els.length;
        if (elCount > 1) {
            var fragment = component.___document.createDocumentFragment();
            els.forEach(function(el) {
                fragment.appendChild(el);
            });
            return fragment;
        } else {
            return els[0];
        }
    },
    function afterInsert(component) {
        return component;
    });

inherit(Component, EventEmitter);

module.exports = Component;


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

var ComponentDef = __webpack_require__(5);

module.exports = function(component, isSplitComponent) {
    var componentStack = this.___componentStack;
    var origLength = componentStack.length;
    var parentComponentDef = componentStack[origLength - 1];

    var componentId = component.id;

    var componentDef = new ComponentDef(component, componentId, this.___globalContext, componentStack, origLength);
    parentComponentDef.___addChild(componentDef);
    this.___globalContext.___componentsById[componentId] = componentDef;

    componentStack.push(componentDef);

    return componentDef;
};


/***/ }),
/* 48 */
/***/ (function(module, exports) {

var INDEX_EVENT = 0;
var INDEX_USER_LISTENER = 1;
var INDEX_WRAPPED_LISTENER = 2;
var DESTROY = "destroy";

function isNonEventEmitter(target) {
  return !target.once;
}

function EventEmitterWrapper(target) {
    this.$__target = target;
    this.$__listeners = [];
    this.$__subscribeTo = null;
}

EventEmitterWrapper.prototype = {
    $__remove: function(test, testWrapped) {
        var target = this.$__target;
        var listeners = this.$__listeners;

        this.$__listeners = listeners.filter(function(curListener) {
            var curEvent = curListener[INDEX_EVENT];
            var curListenerFunc = curListener[INDEX_USER_LISTENER];
            var curWrappedListenerFunc = curListener[INDEX_WRAPPED_LISTENER];

            if (testWrapped) {
                // If the user used `once` to attach an event listener then we had to
                // wrap their listener function with a new function that does some extra
                // cleanup to avoid a memory leak. If the `testWrapped` flag is set to true
                // then we are attempting to remove based on a function that we had to
                // wrap (not the user listener function)
                if (curWrappedListenerFunc && test(curEvent, curWrappedListenerFunc)) {
                    target.removeListener(curEvent, curWrappedListenerFunc);

                    return false;
                }
            } else if (test(curEvent, curListenerFunc)) {
                // If the listener function was wrapped due to it being a `once` listener
                // then we should remove from the target EventEmitter using wrapped
                // listener function. Otherwise, we remove the listener using the user-provided
                // listener function.
                target.removeListener(curEvent, curWrappedListenerFunc || curListenerFunc);

                return false;
            }

            return true;
        });

        // Fixes https://github.com/raptorjs/listener-tracker/issues/2
        // If all of the listeners stored with a wrapped EventEmitter
        // have been removed then we should unregister the wrapped
        // EventEmitter in the parent SubscriptionTracker
        var subscribeTo = this.$__subscribeTo;

        if (!this.$__listeners.length && subscribeTo) {
            var self = this;
            var subscribeToList = subscribeTo.$__subscribeToList;
            subscribeTo.$__subscribeToList = subscribeToList.filter(function(cur) {
                return cur !== self;
            });
        }
    },

    on: function(event, listener) {
        this.$__target.on(event, listener);
        this.$__listeners.push([event, listener]);
        return this;
    },

    once: function(event, listener) {
        var self = this;

        // Handling a `once` event listener is a little tricky since we need to also
        // do our own cleanup if the `once` event is emitted. Therefore, we need
        // to wrap the user's listener function with our own listener function.
        var wrappedListener = function() {
            self.$__remove(function(event, listenerFunc) {
                return wrappedListener === listenerFunc;
            }, true /* We are removing the wrapped listener */);

            listener.apply(this, arguments);
        };

        this.$__target.once(event, wrappedListener);
        this.$__listeners.push([event, listener, wrappedListener]);
        return this;
    },

    removeListener: function(event, listener) {
        if (typeof event === 'function') {
            listener = event;
            event = null;
        }

        if (listener && event) {
            this.$__remove(function(curEvent, curListener) {
                return event === curEvent && listener === curListener;
            });
        } else if (listener) {
            this.$__remove(function(curEvent, curListener) {
                return listener === curListener;
            });
        } else if (event) {
            this.removeAllListeners(event);
        }

        return this;
    },

    removeAllListeners: function(event) {

        var listeners = this.$__listeners;
        var target = this.$__target;

        if (event) {
            this.$__remove(function(curEvent, curListener) {
                return event === curEvent;
            });
        } else {
            for (var i = listeners.length - 1; i >= 0; i--) {
                var cur = listeners[i];
                target.removeListener(cur[INDEX_EVENT], cur[INDEX_USER_LISTENER]);
            }
            this.$__listeners.length = 0;
        }

        return this;
    }
};

function EventEmitterAdapter(target) {
    this.$__target = target;
}

EventEmitterAdapter.prototype = {
    on: function(event, listener) {
        this.$__target.addEventListener(event, listener);
        return this;
    },

    once: function(event, listener) {
        var self = this;

        // need to save this so we can remove it below
        var onceListener = function() {
          self.$__target.removeEventListener(event, onceListener);
          listener();
        };
        this.$__target.addEventListener(event, onceListener);
        return this;
    },

    removeListener: function(event, listener) {
        this.$__target.removeEventListener(event, listener);
        return this;
    }
};

function SubscriptionTracker() {
    this.$__subscribeToList = [];
}

SubscriptionTracker.prototype = {

    subscribeTo: function(target, options) {
        var addDestroyListener = !options || options.addDestroyListener !== false;
        var wrapper;
        var nonEE;
        var subscribeToList = this.$__subscribeToList;

        for (var i=0, len=subscribeToList.length; i<len; i++) {
            var cur = subscribeToList[i];
            if (cur.$__target === target) {
                wrapper = cur;
                break;
            }
        }

        if (!wrapper) {
            if (isNonEventEmitter(target)) {
              nonEE = new EventEmitterAdapter(target);
            }

            wrapper = new EventEmitterWrapper(nonEE || target);
            if (addDestroyListener && !nonEE) {
                wrapper.once(DESTROY, function() {
                    wrapper.removeAllListeners();

                    for (var i = subscribeToList.length - 1; i >= 0; i--) {
                        if (subscribeToList[i].$__target === target) {
                            subscribeToList.splice(i, 1);
                            break;
                        }
                    }
                });
            }

            // Store a reference to the parent SubscriptionTracker so that we can do cleanup
            // if the EventEmitterWrapper instance becomes empty (i.e., no active listeners)
            wrapper.$__subscribeTo = this;
            subscribeToList.push(wrapper);
        }

        return wrapper;
    },

    removeAllListeners: function(target, event) {
        var subscribeToList = this.$__subscribeToList;
        var i;

        if (target) {
            for (i = subscribeToList.length - 1; i >= 0; i--) {
                var cur = subscribeToList[i];
                if (cur.$__target === target) {
                    cur.removeAllListeners(event);

                    if (!cur.$__listeners.length) {
                        // Do some cleanup if we removed all
                        // listeners for the target event emitter
                        subscribeToList.splice(i, 1);
                    }

                    break;
                }
            }
        } else {
            for (i = subscribeToList.length - 1; i >= 0; i--) {
                subscribeToList[i].removeAllListeners();
            }
            subscribeToList.length = 0;
        }
    }
};

exports = module.exports = SubscriptionTracker;

exports.wrap = function(targetEventEmitter) {
    var nonEE;
    var wrapper;

    if (isNonEventEmitter(targetEventEmitter)) {
      nonEE = new EventEmitterAdapter(targetEventEmitter);
    }

    wrapper = new EventEmitterWrapper(nonEE || targetEventEmitter);
    if (!nonEE) {
      // we don't set this for non EE types
      targetEventEmitter.once(DESTROY, function() {
          wrapper.$__listeners.length = 0;
      });
    }

    return wrapper;
};

exports.createTracker = function() {
    return new SubscriptionTracker();
};


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var updatesScheduled = false;
var batchStack = []; // A stack of batched updates
var unbatchedQueue = []; // Used for scheduled batched updates

var nextTick = __webpack_require__(50);

/**
 * This function is called when we schedule the update of "unbatched"
 * updates to components.
 */
function updateUnbatchedComponents() {
    if (unbatchedQueue.length) {
        try {
            updateComponents(unbatchedQueue);
        } finally {
            // Reset the flag now that this scheduled batch update
            // is complete so that we can later schedule another
            // batched update if needed
            updatesScheduled = false;
        }
    }
}

function scheduleUpdates() {
    if (updatesScheduled) {
        // We have already scheduled a batched update for the
        // process.nextTick so nothing to do
        return;
    }

    updatesScheduled = true;

    nextTick(updateUnbatchedComponents);
}

function updateComponents(queue) {
    // Loop over the components in the queue and update them.
    // NOTE: It is okay if the queue grows during the iteration
    //       since we will still get to them at the end
    for (var i=0; i<queue.length; i++) {
        var component = queue[i];
        component.___update(); // Do the actual component update
    }

    // Clear out the queue by setting the length to zero
    queue.length = 0;
}

function batchUpdate(func) {
    // If the batched update stack is empty then this
    // is the outer batched update. After the outer
    // batched update completes we invoke the "afterUpdate"
    // event listeners.
    var batch = {
        ___queue: null
    };

    batchStack.push(batch);

    try {
        func();
    } finally {
        try {
            // Update all of the components that where queued up
            // in this batch (if any)
            if (batch.___queue) {
                updateComponents(batch.___queue);
            }
        } finally {
            // Now that we have completed the update of all the components
            // in this batch we need to remove it off the top of the stack
            batchStack.length--;
        }
    }
}

function queueComponentUpdate(component) {
    var batchStackLen = batchStack.length;

    if (batchStackLen) {
        // When a batch update is started we push a new batch on to a stack.
        // If the stack has a non-zero length then we know that a batch has
        // been started so we can just queue the component on the top batch. When
        // the batch is ended this component will be updated.
        var batch = batchStack[batchStackLen-1];

        // We default the batch queue to null to avoid creating an Array instance
        // unnecessarily. If it is null then we create a new Array, otherwise
        // we push it onto the existing Array queue
        if (batch.___queue) {
            batch.___queue.push(component);
        } else {
            batch.___queue = [component];
        }
    } else {
        // We are not within a batched update. We need to schedule a batch update
        // for the process.nextTick (if that hasn't been done already) and we will
        // add the component to the unbatched queued
        scheduleUpdates();
        unbatchedQueue.push(component);
    }
}

exports.___queueComponentUpdate = queueComponentUpdate;
exports.___batchUpdate = batchUpdate;


/***/ }),
/* 50 */
/***/ (function(module, exports) {

/* globals window */

var win = window;
var setImmediate = win.setImmediate;

if (!setImmediate) {
    if (win.postMessage) {
        var queue = [];
        var messageName = 'si';
        win.addEventListener('message', function (event) {
            var source = event.source;
            if (source == win || !source && event.data === messageName) {
                event.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        setImmediate = function(fn) {
            queue.push(fn);
            win.postMessage(messageName, '*');
        };
    } else {
        setImmediate = setTimeout;
    }
}

module.exports = setImmediate;


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var defaultDoc = typeof document == 'undefined' ? undefined : document;
var specialElHandlers = __webpack_require__(11);

var morphAttrs = __webpack_require__(13).___morphAttrs;

var ELEMENT_NODE = 1;
var TEXT_NODE = 3;
var COMMENT_NODE = 8;

function compareNodeNames(fromEl, toEl) {
    return fromEl.nodeName === toEl.___nodeName;
}


function getElementById(doc, id) {
    return doc.getElementById(id);
}

function morphdom(
        fromNode,
        toNode,
        context,
        onNodeAdded,
        onBeforeElUpdated,
        onBeforeNodeDiscarded,
        onNodeDiscarded,
        onBeforeElChildrenUpdated
    ) {

    var doc = fromNode.ownerDocument || defaultDoc;

    // This object is used as a lookup to quickly find all keyed elements in the original DOM tree.
    var removalList = [];
    var foundKeys = {};

    function walkDiscardedChildNodes(node) {
        onNodeDiscarded(node);
        var curChild = node.firstChild;

        while (curChild) {
            walkDiscardedChildNodes(curChild);
            curChild = curChild.nextSibling;
        }
    }


    function addVirtualNode(vEl, parentEl) {
        var realEl = vEl.___actualize(doc);

        if (parentEl) {
            parentEl.appendChild(realEl);
        }

        onNodeAdded(realEl, context);

        var vCurChild = vEl.___firstChild;
        while (vCurChild) {
            var realCurChild = null;

            var key = vCurChild.id;
            if (key) {
                var unmatchedFromEl = getElementById(doc, key);
                if (unmatchedFromEl && compareNodeNames(vCurChild, unmatchedFromEl)) {
                    morphEl(unmatchedFromEl, vCurChild, false);
                    realEl.appendChild(realCurChild = unmatchedFromEl);
                }
            }

            if (!realCurChild) {
                addVirtualNode(vCurChild, realEl);
            }

            vCurChild = vCurChild.___nextSibling;
        }

        if (vEl.___nodeType === 1) {
            var elHandler = specialElHandlers[vEl.nodeName];
            if (elHandler !== undefined) {
                elHandler(realEl, vEl);
            }
        }

        return realEl;
    }

    function morphEl(fromEl, toEl, childrenOnly) {
        var toElKey = toEl.id;
        var nodeName = toEl.___nodeName;

        if (childrenOnly === false) {
            if (toElKey) {
                // If an element with an ID is being morphed then it is will be in the final
                // DOM so clear it out of the saved elements collection
                foundKeys[toElKey] = true;
            }

            var constId = toEl.___constId;
            if (constId !== undefined) {
                var otherProps = fromEl._vprops;
                if (otherProps !== undefined && constId === otherProps.c) {
                    return;
                }
            }

            if (onBeforeElUpdated(fromEl, toElKey, context) === true) {
                return;
            }

            morphAttrs(fromEl, toEl);
        }


        if (onBeforeElChildrenUpdated(fromEl, toElKey, context) === true) {
            return;
        }

        if (nodeName !== 'TEXTAREA') {
            var curToNodeChild = toEl.___firstChild;
            var curFromNodeChild = fromEl.firstChild;
            var curToNodeKey;
            var curFromNodeKey;

            var fromNextSibling;
            var toNextSibling;
            var matchingFromEl;

            outer: while (curToNodeChild) {
                toNextSibling = curToNodeChild.___nextSibling;
                curToNodeKey = curToNodeChild.id;

                while (curFromNodeChild) {
                    fromNextSibling = curFromNodeChild.nextSibling;

                    curFromNodeKey = curFromNodeChild.id;

                    var curFromNodeType = curFromNodeChild.nodeType;

                    var isCompatible = undefined;

                    if (curFromNodeType === curToNodeChild.___nodeType) {
                        if (curFromNodeType === ELEMENT_NODE) {
                            // Both nodes being compared are Element nodes

                            if (curToNodeKey) {
                                // The target node has a key so we want to match it up with the correct element
                                // in the original DOM tree
                                if (curToNodeKey !== curFromNodeKey) {
                                    // The current element in the original DOM tree does not have a matching key so
                                    // let's check our lookup to see if there is a matching element in the original
                                    // DOM tree
                                    if ((matchingFromEl = getElementById(doc, curToNodeKey))) {
                                        if (curFromNodeChild.nextSibling === matchingFromEl) {
                                            // Special case for single element removals. To avoid removing the original
                                            // DOM node out of the tree (since that can break CSS transitions, etc.),
                                            // we will instead discard the current node and wait until the next
                                            // iteration to properly match up the keyed target element with its matching
                                            // element in the original tree
                                            isCompatible = false;
                                        } else {
                                            // We found a matching keyed element somewhere in the original DOM tree.
                                            // Let's moving the original DOM node into the current position and morph
                                            // it.

                                            // NOTE: We use insertBefore instead of replaceChild because we want to go through
                                            // the `removeNode()` function for the node that is being discarded so that
                                            // all lifecycle hooks are correctly invoked


                                            fromEl.insertBefore(matchingFromEl, curFromNodeChild);

                                            fromNextSibling = curFromNodeChild.nextSibling;
                                            removalList.push(curFromNodeChild);

                                            curFromNodeChild = matchingFromEl;
                                        }
                                    } else {
                                        // The nodes are not compatible since the "to" node has a key and there
                                        // is no matching keyed node in the source tree
                                        isCompatible = false;
                                    }
                                }
                            } else if (curFromNodeKey) {
                                // The original has a key
                                isCompatible = false;
                            }

                            isCompatible = isCompatible !== false && compareNodeNames(curFromNodeChild, curToNodeChild) === true;

                            if (isCompatible === true) {
                                // We found compatible DOM elements so transform
                                // the current "from" node to match the current
                                // target DOM node.
                                morphEl(curFromNodeChild, curToNodeChild, false);
                            }

                        } else if (curFromNodeType === TEXT_NODE || curFromNodeType === COMMENT_NODE) {
                            // Both nodes being compared are Text or Comment nodes
                            isCompatible = true;
                            // Simply update nodeValue on the original node to
                            // change the text value
                            curFromNodeChild.nodeValue = curToNodeChild.___nodeValue;
                        }
                    }

                    if (isCompatible === true) {
                        // Advance both the "to" child and the "from" child since we found a match
                        curToNodeChild = toNextSibling;
                        curFromNodeChild = fromNextSibling;
                        continue outer;
                    }

                    // No compatible match so remove the old node from the DOM and continue trying to find a
                    // match in the original DOM. However, we only do this if the from node is not keyed
                    // since it is possible that a keyed node might match up with a node somewhere else in the
                    // target tree and we don't want to discard it just yet since it still might find a
                    // home in the final DOM tree. After everything is done we will remove any keyed nodes
                    // that didn't find a home
                    removalList.push(curFromNodeChild);

                    curFromNodeChild = fromNextSibling;
                }

                // If we got this far then we did not find a candidate match for
                // our "to node" and we exhausted all of the children "from"
                // nodes. Therefore, we will just append the current "to" node
                // to the end
                if (curToNodeKey && (matchingFromEl = getElementById(doc, curToNodeKey)) && compareNodeNames(matchingFromEl, curToNodeChild)) {
                    fromEl.appendChild(matchingFromEl);
                    morphEl(matchingFromEl, curToNodeChild, false);
                } else {
                    addVirtualNode(curToNodeChild, fromEl);
                }

                curToNodeChild = toNextSibling;
                curFromNodeChild = fromNextSibling;
            }

            // We have processed all of the "to nodes". If curFromNodeChild is
            // non-null then we still have some from nodes left over that need
            // to be removed
            while (curFromNodeChild) {
                removalList.push(curFromNodeChild);
                curFromNodeChild = curFromNodeChild.nextSibling;
            }
        }

        var specialElHandler = specialElHandlers[nodeName];
        if (specialElHandler) {
            specialElHandler(fromEl, toEl);
        }
    } // END: morphEl(...)

    var morphedNode = fromNode;
    var fromNodeType = morphedNode.nodeType;
    var toNodeType = toNode.___nodeType;
    var morphChildrenOnly = false;
    var shouldMorphEl = true;
    var newNode;

    // Handle the case where we are given two DOM nodes that are not
    // compatible (e.g. <div> --> <span> or <div> --> TEXT)
    if (fromNodeType == ELEMENT_NODE) {
        if (toNodeType == ELEMENT_NODE) {
            if (!compareNodeNames(fromNode, toNode)) {
                newNode = toNode.___actualize(doc);
                morphChildrenOnly = true;
                removalList.push(fromNode);
            }
        } else {
            // Going from an element node to a text or comment node
            removalList.push(fromNode);
            newNode = toNode.___actualize(doc);
            shouldMorphEl = false;
        }
    } else if (fromNodeType == TEXT_NODE || fromNodeType == COMMENT_NODE) { // Text or comment node
        if (toNodeType == fromNodeType) {
            morphedNode.nodeValue = toNode.___nodeValue;
            return morphedNode;
        } else {
            // Text node to something else
            removalList.push(fromNode);
            newNode = addVirtualNode(toNode);
            shouldMorphEl = false;
        }
    }

    if (shouldMorphEl === true) {
        morphEl(newNode || morphedNode, toNode, morphChildrenOnly);
    }

    if (newNode) {
        if (fromNode.parentNode) {
            fromNode.parentNode.replaceChild(newNode, fromNode);
        }
    }

    // We now need to loop over any keyed nodes that might need to be
    // removed. We only do the removal if we know that the keyed node
    // never found a match. When a keyed node is matched up we remove
    // it out of fromNodesLookup and we use fromNodesLookup to determine
    // if a keyed node has been matched up or not
    for (var i=0, len=removalList.length; i<len; i++) {
        var node = removalList[i];
        var key = node.id;
        if (!key || foundKeys[key] === undefined) {
            var parentNode = node.parentNode;
            if (parentNode !== null || node === fromNode) {
                if (onBeforeNodeDiscarded(node) == false) {
                    continue;
                }

                if (parentNode !== null) {
                    parentNode.removeChild(node);
                }

                walkDiscardedChildNodes(node);
            }
        }
    }

    return newNode || morphedNode;
}

module.exports = morphdom;


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

var componentsUtil = __webpack_require__(0);
var componentLookup = componentsUtil.___componentLookup;
var emitLifecycleEvent = componentsUtil.___emitLifecycleEvent;

var ComponentsContext = __webpack_require__(7);
var getComponentsContext = ComponentsContext.___getComponentsContext;
var repeatedRegExp = /\[\]$/;
var registry = __webpack_require__(6);
var copyProps = __webpack_require__(12);
var isServer = componentsUtil.___isServer === true;

var COMPONENT_BEGIN_ASYNC_ADDED_KEY = '$wa';

function resolveComponentKey(globalComponentsContext, key, scope) {
    if (key[0] == '#') {
        return key.substring(1);
    } else {
        var resolvedId;

        if (repeatedRegExp.test(key)) {
            resolvedId = globalComponentsContext.___nextRepeatedId(scope, key);
        } else {
            resolvedId = scope + '-' + key;
        }

        return resolvedId;
    }
}

function preserveComponentEls(existingComponent, out, globalComponentsContext) {
    var rootEls = existingComponent.___getRootEls({});

    for (var elId in rootEls) {
        var el = rootEls[elId];

        // We put a placeholder element in the output stream to ensure that the existing
        // DOM node is matched up correctly when using morphdom.
        out.element(el.tagName, { id: elId });

        globalComponentsContext.___preserveDOMNode(elId); // Mark the element as being preserved (for morphdom)
    }

    existingComponent.___reset(); // The component is no longer dirty so reset internal flags
    return true;
}

function handleBeginAsync(event) {
    var parentOut = event.parentOut;
    var asyncOut = event.out;
    var componentsContext = parentOut.data.___components;

    if (componentsContext !== undefined) {
        // All of the components in this async block should be
        // initialized after the components in the parent. Therefore,
        // we will create a new ComponentsContext for the nested
        // async block and will create a new component stack where the current
        // component in the parent block is the only component in the nested
        // stack (to begin with). This will result in top-level components
        // of the async block being added as children of the component in the
        // parent block.
        var nestedComponentsContext = componentsContext.___createNestedComponentsContext(asyncOut);
        asyncOut.data.___components = nestedComponentsContext;
    }
    // Carry along the component arguments
    asyncOut.___componentArgs = parentOut.___componentArgs;
}

function createRendererFunc(templateRenderFunc, componentProps, renderingLogic) {
    renderingLogic = renderingLogic || {};
    var onInput = renderingLogic.onInput;
    var typeName = componentProps.type;
    var roots = componentProps.roots;
    var assignedId = componentProps.id;
    var isSplit = componentProps.split === true;
    var shouldApplySplitMixins = isSplit;

    return function renderer(input, out) {
        var outGlobal = out.global;

        if (out.isSync() === false) {
            if (!outGlobal[COMPONENT_BEGIN_ASYNC_ADDED_KEY]) {
                outGlobal[COMPONENT_BEGIN_ASYNC_ADDED_KEY] = true;
                out.on('beginAsync', handleBeginAsync);
            }
        }

        var componentsContext = getComponentsContext(out);
        var globalComponentsContext = componentsContext.___globalContext;

        var component = globalComponentsContext.___rerenderComponent;
        var isRerender = component !== undefined;
        var id = assignedId;
        var isExisting;
        var customEvents;
        var scope;

        if (component) {
            id = component.id;
            isExisting = true;
            globalComponentsContext.___rerenderComponent = null;
        } else {
            var componentArgs = out.___componentArgs;

            if (componentArgs) {
                out.___componentArgs = null;

                scope = componentArgs[0];

                if (scope) {
                    scope = scope.id;
                }

                var key = componentArgs[1];
                if (key != null) {
                    key = key.toString();
                }
                id = id || resolveComponentKey(globalComponentsContext, key, scope);
                customEvents = componentArgs[2];
            }
        }

        id = id || componentsContext.___nextComponentId();

        if (isServer) {
            component = registry.___createComponent(
                renderingLogic,
                id,
                input,
                out,
                typeName,
                customEvents,
                scope);
            input = component.___updatedInput;
            component.___updatedInput = undefined; // We don't want ___updatedInput to be serialized to the browser
        } else {
            if (!component) {
                if (isRerender) {
                    // Look in in the DOM to see if a component with the same ID and type already exists.
                    component = componentLookup[id];
                    if (component && component.___type !== typeName) {
                        component = undefined;
                    }
                }

                if (component) {
                    isExisting = true;
                } else {
                    isExisting = false;
                    // We need to create a new instance of the component
                    component = registry.___createComponent(typeName, id);

                    if (shouldApplySplitMixins === true) {
                        shouldApplySplitMixins = false;

                        var renderingLogicProps = typeof renderingLogic == 'function' ?
                            renderingLogic.prototype :
                            renderingLogic;

                        copyProps(renderingLogicProps, component.constructor.prototype);
                    }
                }

                // Set this flag to prevent the component from being queued for update
                // based on the new input. The component is about to be rerendered
                // so we don't want to queue it up as a result of calling `setInput()`
                component.___updateQueued = true;

                if (customEvents !== undefined) {
                    component.___setCustomEvents(customEvents, scope);
                }


                if (isExisting === false) {
                    emitLifecycleEvent(component, 'create', input, out);
                }

                input = component.___setInput(input, onInput, out);

                if (isExisting === true) {
                    if (component.___isDirty === false || component.shouldUpdate(input, component.___state) === false) {
                        preserveComponentEls(component, out, globalComponentsContext);
                        return;
                    }
                }
            }

            component.___global = outGlobal;

            emitLifecycleEvent(component, 'render', out);
        }

        var componentDef = componentsContext.___beginComponent(component, isSplit);
        componentDef.___roots = roots;
        componentDef.___isExisting = isExisting;

        // Render the template associated with the component using the final template
        // data that we constructed
        templateRenderFunc(input, out, componentDef, component, component.___rawState);

        componentDef.___end();
    };
}

module.exports = createRendererFunc;

// exports used by the legacy renderer
createRendererFunc.___resolveComponentKey = resolveComponentKey;
createRendererFunc.___preserveComponentEls = preserveComponentEls;
createRendererFunc.___handleBeginAsync = handleBeginAsync;


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var vdom = __webpack_require__(10);
var VElement = vdom.___VElement;
var VText = vdom.___VText;

var commonHelpers = __webpack_require__(54);
var extend = __webpack_require__(1);

var classList = commonHelpers.cl;

var helpers = extend({
    e: function(tagName, attrs, childCount, flags, props) {
        return new VElement(tagName, attrs, childCount, flags, props);
    },

    t: function(value) {
        return new VText(value);
    },

    const: function(id) {
        var i=0;
        return function() {
            return id + (i++);
        };
    },

    /**
     * Internal helper method to handle the "class" attribute. The value can either
     * be a string, an array or an object. For example:
     *
     * ca('foo bar') ==> ' class="foo bar"'
     * ca({foo: true, bar: false, baz: true}) ==> ' class="foo baz"'
     * ca(['foo', 'bar']) ==> ' class="foo bar"'
     */
    ca: function(classNames) {
        if (!classNames) {
            return null;
        }

        if (typeof classNames === 'string') {
            return classNames;
        } else {
            return classList(classNames);
        }
    }
}, commonHelpers);

module.exports = helpers;


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var isArray = Array.isArray;

function isFunction(arg) {
    return typeof arg == 'function';
}

function classList(arg, classNames) {
    var len;

    if (arg) {
        if (typeof arg == 'string') {
            if (arg) {
                classNames.push(arg);
            }
        } else if (typeof (len = arg.length) == 'number') {
            for (var i=0; i<len; i++) {
                classList(arg[i], classNames);
            }
        } else if (typeof arg == 'object') {
            for (var name in arg) {
                if (arg.hasOwnProperty(name)) {
                    var value = arg[name];
                    if (value) {
                        classNames.push(name);
                    }
                }
            }
        }
    }
}

function createDeferredRenderer(handler) {
    function deferredRenderer(input, out) {
        deferredRenderer.renderer(input, out);
    }

    // This is the initial function that will do the rendering. We replace
    // the renderer with the actual renderer func on the first render
    deferredRenderer.renderer = function(input, out) {
        var rendererFunc = handler.renderer || handler._ || handler.render;
        if (!isFunction(rendererFunc)) {
            throw Error('Invalid renderer');
        }
        // Use the actual renderer from now on
        deferredRenderer.renderer = rendererFunc;
        rendererFunc(input, out);
    };

    return deferredRenderer;
}

function resolveRenderer(handler) {
    var renderer = handler.renderer || handler._;

    if (renderer) {
        return renderer;
    }

    if (isFunction(handler)) {
        return handler;
    }

    // If the user code has a circular function then the renderer function
    // may not be available on the module. Since we can't get a reference
    // to the actual renderer(input, out) function right now we lazily
    // try to get access to it later.
    return createDeferredRenderer(handler);
}

var helpers = {
    /**
     * Internal helper method to prevent null/undefined from being written out
     * when writing text that resolves to null/undefined
     * @private
     */
    s: function strHelper(str) {
        return (str == null) ? '' : str.toString();
    },

    /**
     * Internal helper method to handle loops without a status variable
     * @private
     */
    f: function forEachHelper(array, callback) {
        if (isArray(array)) {
            for (var i=0; i<array.length; i++) {
                callback(array[i]);
            }
        } else if (isFunction(array)) {
            // Also allow the first argument to be a custom iterator function
            array(callback);
        }
    },

    /**
     * Helper to load a custom tag
     */
    t: function loadTagHelper(renderer, targetProperty, isRepeated) {
        if (renderer) {
            renderer = resolveRenderer(renderer);
        }

        return renderer;
    },

    /**
     * classList(a, b, c, ...)
     * Joines a list of class names with spaces. Empty class names are omitted.
     *
     * classList('a', undefined, 'b') --> 'a b'
     *
     */
    cl: function classListHelper() {
        var classNames = [];
        classList(arguments, classNames);
        return classNames.join(' ');
    }
};

module.exports = helpers;


/***/ })
/******/ ]);