// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../node_modules/regenerator-runtime/runtime.js":[function(require,module,exports) {
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

},{}],"../node_modules/@babel/runtime/regenerator/index.js":[function(require,module,exports) {
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":"../node_modules/regenerator-runtime/runtime.js"}],"../node_modules/@babel/runtime/helpers/asyncToGenerator.js":[function(require,module,exports) {
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

module.exports = _asyncToGenerator;
},{}],"../node_modules/contentful-ui-extensions-sdk/dist/cf-extension-api.js":[function(require,module,exports) {
var define;
parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"pBGv":[function(require,module,exports) {

var t,e,n=module.exports={};function r(){throw new Error("setTimeout has not been defined")}function o(){throw new Error("clearTimeout has not been defined")}function i(e){if(t===setTimeout)return setTimeout(e,0);if((t===r||!t)&&setTimeout)return t=setTimeout,setTimeout(e,0);try{return t(e,0)}catch(n){try{return t.call(null,e,0)}catch(n){return t.call(this,e,0)}}}function u(t){if(e===clearTimeout)return clearTimeout(t);if((e===o||!e)&&clearTimeout)return e=clearTimeout,clearTimeout(t);try{return e(t)}catch(n){try{return e.call(null,t)}catch(n){return e.call(this,t)}}}!function(){try{t="function"==typeof setTimeout?setTimeout:r}catch(n){t=r}try{e="function"==typeof clearTimeout?clearTimeout:o}catch(n){e=o}}();var c,s=[],l=!1,a=-1;function f(){l&&c&&(l=!1,c.length?s=c.concat(s):a=-1,s.length&&h())}function h(){if(!l){var t=i(f);l=!0;for(var e=s.length;e;){for(c=s,s=[];++a<e;)c&&c[a].run();a=-1,e=s.length}c=null,l=!1,u(t)}}function m(t,e){this.fun=t,this.array=e}function p(){}n.nextTick=function(t){var e=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)e[n-1]=arguments[n];s.push(new m(t,e)),1!==s.length||l||i(h)},m.prototype.run=function(){this.fun.apply(null,this.array)},n.title="browser",n.env={},n.argv=[],n.version="",n.versions={},n.on=p,n.addListener=p,n.once=p,n.off=p,n.removeListener=p,n.removeAllListeners=p,n.emit=p,n.prependListener=p,n.prependOnceListener=p,n.listeners=function(t){return[]},n.binding=function(t){throw new Error("process.binding is not supported")},n.cwd=function(){return"/"},n.chdir=function(t){throw new Error("process.chdir is not supported")},n.umask=function(){return 0};
},{}],"Zt7E":[function(require,module,exports) {
var define;
var global = arguments[3];
var process = require("process");
var t,e=arguments[3],r=require("process");!function(e,r){"object"==typeof exports&&"undefined"!=typeof module?module.exports=r():"function"==typeof t&&t.amd?t(r):e.ES6Promise=r()}(this,function(){"use strict";function t(t){return"function"==typeof t}var n=Array.isArray?Array.isArray:function(t){return"[object Array]"===Object.prototype.toString.call(t)},o=0,i=void 0,s=void 0,u=function(t,e){p[o]=t,p[o+1]=e,2===(o+=2)&&(s?s(_):w())};var c="undefined"!=typeof window?window:void 0,a=c||{},f=a.MutationObserver||a.WebKitMutationObserver,l="undefined"==typeof self&&void 0!==r&&"[object process]"==={}.toString.call(r),h="undefined"!=typeof Uint8ClampedArray&&"undefined"!=typeof importScripts&&"undefined"!=typeof MessageChannel;function v(){var t=setTimeout;return function(){return t(_,1)}}var p=new Array(1e3);function _(){for(var t=0;t<o;t+=2){(0,p[t])(p[t+1]),p[t]=void 0,p[t+1]=void 0}o=0}var d,y,m,b,w=void 0;function g(t,e){var r=this,n=new this.constructor(S);void 0===n[j]&&N(n);var o=r._state;if(o){var i=arguments[o-1];u(function(){return K(o,n,i,r._result)})}else k(r,n,t,e);return n}function A(t){if(t&&"object"==typeof t&&t.constructor===this)return t;var e=new this(S);return O(e,t),e}l?w=function(){return r.nextTick(_)}:f?(y=0,m=new f(_),b=document.createTextNode(""),m.observe(b,{characterData:!0}),w=function(){b.data=y=++y%2}):h?((d=new MessageChannel).port1.onmessage=_,w=function(){return d.port2.postMessage(0)}):w=void 0===c&&"function"==typeof require?function(){try{var t=Function("return this")().require("vertx");return void 0!==(i=t.runOnLoop||t.runOnContext)?function(){i(_)}:v()}catch(e){return v()}}():v();var j=Math.random().toString(36).substring(2);function S(){}var E=void 0,T=1,M=2,P={error:null};function x(t){try{return t.then}catch(e){return P.error=e,P}}function C(e,r,n){r.constructor===e.constructor&&n===g&&r.constructor.resolve===A?function(t,e){e._state===T?F(t,e._result):e._state===M?Y(t,e._result):k(e,void 0,function(e){return O(t,e)},function(e){return Y(t,e)})}(e,r):n===P?(Y(e,P.error),P.error=null):void 0===n?F(e,r):t(n)?function(t,e,r){u(function(t){var n=!1,o=function(t,e,r,n){try{t.call(e,r,n)}catch(o){return o}}(r,e,function(r){n||(n=!0,e!==r?O(t,r):F(t,r))},function(e){n||(n=!0,Y(t,e))},t._label);!n&&o&&(n=!0,Y(t,o))},t)}(e,r,n):F(e,r)}function O(t,e){var r,n;t===e?Y(t,new TypeError("You cannot resolve a promise with itself")):(n=typeof(r=e),null===r||"object"!==n&&"function"!==n?F(t,e):C(t,e,x(e)))}function q(t){t._onerror&&t._onerror(t._result),D(t)}function F(t,e){t._state===E&&(t._result=e,t._state=T,0!==t._subscribers.length&&u(D,t))}function Y(t,e){t._state===E&&(t._state=M,t._result=e,u(q,t))}function k(t,e,r,n){var o=t._subscribers,i=o.length;t._onerror=null,o[i]=e,o[i+T]=r,o[i+M]=n,0===i&&t._state&&u(D,t)}function D(t){var e=t._subscribers,r=t._state;if(0!==e.length){for(var n=void 0,o=void 0,i=t._result,s=0;s<e.length;s+=3)n=e[s],o=e[s+r],n?K(r,n,o,i):o(i);t._subscribers.length=0}}function K(e,r,n,o){var i=t(n),s=void 0,u=void 0,c=void 0,a=void 0;if(i){if((s=function(t,e){try{return t(e)}catch(r){return P.error=r,P}}(n,o))===P?(a=!0,u=s.error,s.error=null):c=!0,r===s)return void Y(r,new TypeError("A promises callback cannot return that same promise."))}else s=o,c=!0;r._state!==E||(i&&c?O(r,s):a?Y(r,u):e===T?F(r,s):e===M&&Y(r,s))}var L=0;function N(t){t[j]=L++,t._state=void 0,t._result=void 0,t._subscribers=[]}var U=function(){function t(t,e){this._instanceConstructor=t,this.promise=new t(S),this.promise[j]||N(this.promise),n(e)?(this.length=e.length,this._remaining=e.length,this._result=new Array(this.length),0===this.length?F(this.promise,this._result):(this.length=this.length||0,this._enumerate(e),0===this._remaining&&F(this.promise,this._result))):Y(this.promise,new Error("Array Methods must be provided an Array"))}return t.prototype._enumerate=function(t){for(var e=0;this._state===E&&e<t.length;e++)this._eachEntry(t[e],e)},t.prototype._eachEntry=function(t,e){var r=this._instanceConstructor,n=r.resolve;if(n===A){var o=x(t);if(o===g&&t._state!==E)this._settledAt(t._state,e,t._result);else if("function"!=typeof o)this._remaining--,this._result[e]=t;else if(r===W){var i=new r(S);C(i,t,o),this._willSettleAt(i,e)}else this._willSettleAt(new r(function(e){return e(t)}),e)}else this._willSettleAt(n(t),e)},t.prototype._settledAt=function(t,e,r){var n=this.promise;n._state===E&&(this._remaining--,t===M?Y(n,r):this._result[e]=r),0===this._remaining&&F(n,this._result)},t.prototype._willSettleAt=function(t,e){var r=this;k(t,void 0,function(t){return r._settledAt(T,e,t)},function(t){return r._settledAt(M,e,t)})},t}();var W=function(){function e(t){this[j]=L++,this._result=this._state=void 0,this._subscribers=[],S!==t&&("function"!=typeof t&&function(){throw new TypeError("You must pass a resolver function as the first argument to the promise constructor")}(),this instanceof e?function(t,e){try{e(function(e){O(t,e)},function(e){Y(t,e)})}catch(r){Y(t,r)}}(this,t):function(){throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.")}())}return e.prototype.catch=function(t){return this.then(null,t)},e.prototype.finally=function(e){var r=this.constructor;return t(e)?this.then(function(t){return r.resolve(e()).then(function(){return t})},function(t){return r.resolve(e()).then(function(){throw t})}):this.then(e,e)},e}();return W.prototype.then=g,W.all=function(t){return new U(this,t).promise},W.race=function(t){var e=this;return n(t)?new e(function(r,n){for(var o=t.length,i=0;i<o;i++)e.resolve(t[i]).then(r,n)}):new e(function(t,e){return e(new TypeError("You must pass an array to race."))})},W.resolve=A,W.reject=function(t){var e=new this(S);return Y(e,t),e},W._setScheduler=function(t){s=t},W._setAsap=function(t){u=t},W._asap=u,W.polyfill=function(){var t=void 0;if(void 0!==e)t=e;else if("undefined"!=typeof self)t=self;else try{t=Function("return this")()}catch(o){throw new Error("polyfill failed because global object is unavailable in this environment")}var r=t.Promise;if(r){var n=null;try{n=Object.prototype.toString.call(r.resolve())}catch(o){}if("[object Promise]"===n&&!r.cast)return}t.Promise=W},W.Promise=W,W});
},{"process":"pBGv"}],"HrMX":[function(require,module,exports) {
function t(e){return(t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(e)}function e(t){return o(t)||r(t)||n()}function n(){throw new TypeError("Invalid attempt to spread non-iterable instance")}function r(t){if(Symbol.iterator in Object(t)||"[object Arguments]"===Object.prototype.toString.call(t))return Array.from(t)}function o(t){if(Array.isArray(t)){for(var e=0,n=new Array(t.length);e<t.length;e++)n[e]=t[e];return n}}function i(e,n){return!n||"object"!==t(n)&&"function"!=typeof n?u(e):n}function u(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function c(t,e,n){return(c="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(t,e,n){var r=a(t,e);if(r){var o=Object.getOwnPropertyDescriptor(r,e);return o.get?o.get.call(n):o.value}})(t,e,n||t)}function a(t,e){for(;!Object.prototype.hasOwnProperty.call(t,e)&&null!==(t=f(t)););return t}function f(t){return(f=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function l(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&s(t,e)}function s(t,e){return(s=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function p(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function y(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function h(t,e,n){return e&&y(t.prototype,e),n&&y(t,n),t}var b=function(){function t(){p(this,t),this._id=0,this._listeners={}}return h(t,[{key:"dispatch",value:function(){for(var t in this._listeners){var e;(e=this._listeners)[t].apply(e,arguments)}}},{key:"attach",value:function(t){var e=this;if("function"!=typeof t)throw new Error("listener function expected");var n=this._id++;return this._listeners[n]=t,function(){return delete e._listeners[n]}}}]),t}(),v="__private__memoized__arguments__",_=function(t){function n(){var t;p(this,n);for(var e=arguments.length,r=new Array(e),o=0;o<e;o++)r[o]=arguments[o];if(!r.length)throw new Error("Initial value to be memoized expected");return(t=i(this,f(n).call(this)))[v]=r,t}return l(n,b),h(n,[{key:"dispatch",value:function(){for(var t,e=arguments.length,r=new Array(e),o=0;o<e;o++)r[o]=arguments[o];this[v]=r,(t=c(f(n.prototype),"dispatch",this)).call.apply(t,[this].concat(r))}},{key:"attach",value:function(t){var r=c(f(n.prototype),"attach",this).call(this,t);return t.apply(void 0,e(this[v])),r}}]),n}();module.exports={Signal:b,MemoizedSignal:_};
},{}],"sCMk":[function(require,module,exports) {
function e(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}function n(e,n){for(var r=0;r<n.length;r++){var t=n[r];t.enumerable=t.enumerable||!1,t.configurable=!0,"value"in t&&(t.writable=!0),Object.defineProperty(e,t.key,t)}}function r(e,r,t){return r&&n(e.prototype,r),t&&n(e,t),e}function t(e){return i(e)||s(e)||a()}function a(){throw new TypeError("Invalid attempt to spread non-iterable instance")}function s(e){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e))return Array.from(e)}function i(e){if(Array.isArray(e)){for(var n=0,r=new Array(e.length);n<e.length;n++)r[n]=e[n];return r}}var o=require("es6-promise"),l=o.Promise,u=require("./signal"),c=u.Signal;function d(e,n){e.addEventListener("message",function r(a){var s=a.data;"connect"===s.method&&(e.removeEventListener("message",r),n.apply(void 0,t(s.params)))})}module.exports=function(e,n){d(e,function(r,t){var a=new f(r.id,e);n(a,r,t)})};var f=function(){function n(r,t){var a=this;e(this,n),this._messageHandlers={},this._responseHandlers={},this._send=h(r,t.parent),t.addEventListener("message",function(e){a._handleMessage(e.data)})}return r(n,[{key:"call",value:function(e){for(var n=this,r=arguments.length,t=new Array(r>1?r-1:0),a=1;a<r;a++)t[a-1]=arguments[a];var s=this._send(e,t);return new l(function(e,r){n._responseHandlers[s]={resolve:e,reject:r}})}},{key:"send",value:function(e){for(var n=arguments.length,r=new Array(n>1?n-1:0),t=1;t<n;t++)r[t-1]=arguments[t];this._send(e,r)}},{key:"addHandler",value:function(e,n){return e in this._messageHandlers||(this._messageHandlers[e]=new c),this._messageHandlers[e].attach(n)}},{key:"_handleMessage",value:function(e){if(e.method){var n=e.method,r=e.params,a=this._messageHandlers[n];a&&a.dispatch.apply(a,t(r))}else{var s=e.id,i=this._responseHandlers[s];if(!i)return;"result"in e?i.resolve(e.result):"error"in e&&i.reject(e.error),delete this._responseHandlers[s]}}}]),n}();function h(e,n){var r=0;return function(t,a){var s=r++;return n.postMessage({source:e,id:s,method:t,params:a},"*"),s}}
},{"es6-promise":"Zt7E","./signal":"HrMX"}],"Mq5l":[function(require,module,exports) {
var e=require("es6-promise"),n=e.Promise,r=require("./channel");function t(){var e={};return e.promise=new n(function(n){e.resolve=n}),e}module.exports=function(e,n){var o=t(),i=t();return i.promise.then(function(n){var r=e.document;r.addEventListener("focus",function(){return n.send("setActive",!0)},!0),r.addEventListener("blur",function(){return n.send("setActive",!1)},!0)}),r(e,function(r,t,s){i.resolve(r);var u=n(r,t,e);s.forEach(function(e){r._handleMessage(e)}),o.resolve(u)}),function(e){o.promise.then(e)}};
},{"es6-promise":"Zt7E","./channel":"sCMk"}],"GnXy":[function(require,module,exports) {
function e(e,a){if(!(e instanceof a))throw new TypeError("Cannot call a class as a function")}function a(e,a){for(var n=0;n<a.length;n++){var i=a[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}function n(e,n,i){return n&&a(e.prototype,n),i&&a(e,i),e}var i=require("./signal"),l=i.MemoizedSignal,t=["id","locale","type","required","validations","items"];module.exports=function(){function a(n,i){var r=this;e(this,a),t.forEach(function(e){void 0!==i[e]&&(r[e]=i[e])}),this._value=i.value,this._valueSignal=new l(this._value),this._isDisabledSignal=new l(void 0),this._schemaErrorsChangedSignal=new l(void 0),this._channel=n,n.addHandler("valueChanged",function(e,a,n){e!==r.id||a&&a!==r.locale||(r._value=n,r._valueSignal.dispatch(n))}),n.addHandler("isDisabledChanged",function(e){r._isDisabledSignal.dispatch(e)}),n.addHandler("schemaErrorsChanged",function(e){r._schemaErrorsChangedSignal.dispatch(e)})}return n(a,[{key:"getValue",value:function(){return this._value}},{key:"setValue",value:function(e){return this._value=e,this._valueSignal.dispatch(e),this._channel.call("setValue",this.id,this.locale,e)}},{key:"removeValue",value:function(){return this._value=void 0,this._channel.call("removeValue",this.id,this.locale)}},{key:"setInvalid",value:function(e){return this._channel.call("setInvalid",e,this.locale)}},{key:"onValueChanged",value:function(e){return this._valueSignal.attach(e)}},{key:"onIsDisabledChanged",value:function(e){return this._isDisabledSignal.attach(e)}},{key:"onSchemaErrorsChanged",value:function(e){return this._schemaErrorsChangedSignal.attach(e)}}]),a}();
},{"./signal":"HrMX"}],"daBI":[function(require,module,exports) {
function e(e){for(var n=1;n<arguments.length;n++){var o=null!=arguments[n]?arguments[n]:{},l=Object.keys(o);"function"==typeof Object.getOwnPropertySymbols&&(l=l.concat(Object.getOwnPropertySymbols(o).filter(function(e){return Object.getOwnPropertyDescriptor(o,e).enumerable}))),l.forEach(function(n){t(e,n,o[n])})}return e}function t(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function l(e,t,n){return t&&o(e.prototype,t),n&&o(e,n),e}var r=require("./field-locale"),i=["id","locales","type","required","validations","items"];function a(e,t){if(!e._fieldLocales[t])throw new Error('Unknown locale "'.concat(t,'" for field "').concat(e.id,'"'))}module.exports=function(){function o(l,u,c){var f=this;n(this,o),i.forEach(function(e){void 0!==u[e]&&(f[e]=u[e])}),this._defaultLocale=c,this._fieldLocales=u.locales.reduce(function(n,o){return e({},n,t({},o,new r(l,{id:u.id,locale:o,value:u.values[o]})))},{}),a(this,c)}return l(o,[{key:"getValue",value:function(e){return this._getFieldLocale(e).getValue()}},{key:"setValue",value:function(e,t){return this._getFieldLocale(t).setValue(e)}},{key:"removeValue",value:function(e){return this.setValue(void 0,e)}},{key:"onValueChanged",value:function(e,t){return t||(t=e,e=void 0),this._getFieldLocale(e).onValueChanged(t)}},{key:"onIsDisabledChanged",value:function(e,t){return t||(t=e,e=void 0),this._getFieldLocale(e).onIsDisabledChanged(t)}},{key:"_getFieldLocale",value:function(e){return a(this,e=e||this._defaultLocale),this._fieldLocales[e]}}]),o}();
},{"./field-locale":"GnXy"}],"XV20":[function(require,module,exports) {
module.exports=function(e,t){var n=e.document,i=e.MutationObserver,r=function(){c.updateHeight()},u=new i(r),o=null,s=!1,c={startAutoResizer:function(){if(c.updateHeight(),s)return;s=!0,u.observe(n.body,{attributes:!0,childList:!0,subtree:!0,characterData:!0}),e.addEventListener("resize",r)},stopAutoResizer:function(){if(!s)return;s=!1,u.disconnect(),e.removeEventListener("resize",r)},updateHeight:function(e){null==e&&(e=Math.ceil(n.documentElement.getBoundingClientRect().height));e!==o&&(t.send("setHeight",e),o=e)}};return c};
},{}],"97BZ":[function(require,module,exports) {
var n=require("./signal"),e=n.MemoizedSignal;module.exports=function(n,r,t,i){var u=r.sys,a=new e(u);return n.addHandler("sysChanged",function(n){u=n,a.dispatch(u)}),{getSys:function(){return u},onSysChanged:function(n){return a.attach(n)},fields:t.reduce(function(n,e){return n[e.id]=i(e),n},{})}};
},{"./signal":"HrMX"}],"iabO":[function(require,module,exports) {
var e=["getContentType","getEntry","getEntrySnapshots","getAsset","getEditorInterface","getPublishedEntries","getPublishedAssets","getContentTypes","getEntries","getAssets","createContentType","createEntry","createAsset","updateContentType","updateEntry","updateAsset","deleteContentType","deleteEntry","deleteAsset","publishEntry","publishAsset","unpublishEntry","unpublishAsset","archiveEntry","archiveAsset","unarchiveEntry","unarchiveAsset","createUpload","processAsset","waitUntilAssetProcessed","getUsers"];module.exports=function(t){var s={};return e.forEach(function(e){s[e]=function(){for(var s=arguments.length,n=new Array(s),r=0;r<s;r++)n[r]=arguments[r];return t.call("callSpaceMethod",e,n)}}),s};
},{}],"6GEt":[function(require,module,exports) {
function n(e){return(n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(n){return typeof n}:function(n){return n&&"function"==typeof Symbol&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n})(e)}function e(n){for(var e=1;e<arguments.length;e++){var o=null!=arguments[e]?arguments[e]:{},r=Object.keys(o);"function"==typeof Object.getOwnPropertySymbols&&(r=r.concat(Object.getOwnPropertySymbols(o).filter(function(n){return Object.getOwnPropertyDescriptor(o,n).enumerable}))),r.forEach(function(e){t(n,e,o[e])})}return n}function t(n,e,t){return e in n?Object.defineProperty(n,e,{value:t,enumerable:!0,configurable:!0,writable:!0}):n[e]=t,n}module.exports=function(t,o){return{openAlert:r.bind(null,"alert"),openConfirm:r.bind(null,"confirm"),openPrompt:r.bind(null,"prompt"),openExtension:function(n){return t.call("openDialog","extension",e({id:o},i(n)))}.bind(null),selectSingleEntry:l.bind(null,"Entry",!1),selectSingleAsset:l.bind(null,"Asset",!1),selectMultipleEntries:l.bind(null,"Entry",!0),selectMultipleAssets:l.bind(null,"Asset",!0)};function r(n,e){return t.call("openDialog",n,i(e))}function l(n,e,o){return(o=i(o)).entityType=n,o.multiple=e,t.call("openDialog","entitySelector",o)}function i(e){return"object"===n(e)&&null!==e&&!Array.isArray(e)?e:{}}};
},{}],"fqJo":[function(require,module,exports) {
var e=require("./signal"),n=e.MemoizedSignal;module.exports=function(e,a){var d=new n(void 0),t=new n(void 0);return e.addHandler("localeSettingsChanged",function(e){d.dispatch(e)}),e.addHandler("showDisabledFieldsChanged",function(e){t.dispatch(e)}),{editorInterface:a,onLocaleSettingsChanged:function(e){return d.attach(e)},onShowDisabledFieldsChanged:function(e){return t.attach(e)}}};
},{"./signal":"HrMX"}],"Y2Q9":[function(require,module,exports) {
function n(n){for(var e=1;e<arguments.length;e++){var o=null!=arguments[e]?arguments[e]:{},r=Object.keys(o);"function"==typeof Object.getOwnPropertySymbols&&(r=r.concat(Object.getOwnPropertySymbols(o).filter(function(n){return Object.getOwnPropertyDescriptor(o,n).enumerable}))),r.forEach(function(e){t(n,e,o[e])})}return n}function t(n,t,e){return t in n?Object.defineProperty(n,t,{value:e,enumerable:!0,configurable:!0,writable:!0}):n[t]=e,n}module.exports=function(t,e){return{openEntry:function(e,o){return t.call("navigateToContentEntity",n({},o,{entityType:"Entry",id:e}))},openNewEntry:function(e,o){return t.call("navigateToContentEntity",n({},o,{entityType:"Entry",id:null,contentTypeId:e}))},openAsset:function(e,o){return t.call("navigateToContentEntity",n({},o,{entityType:"Asset",id:e}))},openNewAsset:function(e){return t.call("navigateToContentEntity",n({},e,{entityType:"Asset",id:null}))},openPageExtension:function(o){return t.call("navigateToPageExtension",n({id:e},o))}}};
},{}],"A2T1":[function(require,module,exports) {
function t(t,n,r){return n in t?Object.defineProperty(t,n,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[n]=r,t}function n(t){return(n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}var r="preInstall",e="postInstall",o=function(t){return"object"===n(t)&&null!==t&&!Array.isArray(t)},u=function(t){return"function"==typeof t},l=function(t){return o(t)&&u(t.then)},a=function(t){if(!u(t))return Promise.resolve({});var n;try{n=t()}catch(e){return Promise.resolve(!1)}var r=n;return l(r)||(r=Promise.resolve(r)),r.then(function(t){return!(t instanceof Error||!1===t)&&(o(t)?t:{})},function(){return!1}).catch(function(){return!1})};module.exports=function(n){var o,l=(t(o={},r,null),t(o,e,null),o);return n.addHandler("appHook",function(t){var r=t.stage,e=t.installationRequestId;return a(l[r]).then(function(t){n.send("appHookResult",{stage:r,installationRequestId:e,result:t})})}),{isInstalled:function(){return n.call("callAppMethod","isInstalled")},getParameters:function(){return n.call("callAppMethod","getParameters")},getCurrentState:function(){return n.call("callAppMethod","getCurrentState")},onConfigure:function(t){!function(t,n){if(l[t])throw new Error("Cannot register a handler twice.");if(!u(n))throw new Error("Handler must be a function.");l[t]=n}(r,t)}}};
},{}],"CHnp":[function(require,module,exports) {
module.exports={LOCATION_ENTRY_FIELD:"entry-field",LOCATION_ENTRY_FIELD_SIDEBAR:"entry-field-sidebar",LOCATION_ENTRY_SIDEBAR:"entry-sidebar",LOCATION_DIALOG:"dialog",LOCATION_ENTRY_EDITOR:"entry-editor",LOCATION_PAGE:"page",LOCATION_APP:"app"};
},{}],"LVu9":[function(require,module,exports) {
var e;function r(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{},o=Object.keys(t);"function"==typeof Object.getOwnPropertySymbols&&(o=o.concat(Object.getOwnPropertySymbols(t).filter(function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),o.forEach(function(r){n(e,r,t[r])})}return e}function n(e,r,n){return r in e?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,e}var t=require("./field"),o=require("./field-locale"),i=require("./window"),u=require("./entry"),a=require("./space"),c=require("./dialogs"),l=require("./editor"),f=require("./navigator"),s=require("./app"),O=require("./locations"),d=[y,A,_,T,I],p=(n(e={},O.LOCATION_ENTRY_FIELD,d),n(e,O.LOCATION_ENTRY_FIELD_SIDEBAR,d),n(e,O.LOCATION_ENTRY_SIDEBAR,[y,A,T,I]),n(e,O.LOCATION_ENTRY_EDITOR,[y,A,T]),n(e,O.LOCATION_DIALOG,[y,b,I]),n(e,O.LOCATION_PAGE,[y]),n(e,O.LOCATION_APP,[y,v]),e);function y(e,r){var n=r.user,t=r.parameters,o=r.locales,i=r.ids;return{location:{is:function(e){return(r.location||O.LOCATION_ENTRY_FIELD)===e}},user:n,parameters:t,locales:{available:o.available,default:o.default,names:o.names},space:a(e),dialogs:c(e,i.extension),navigator:f(e,i.extension),notifier:{success:function(r){return e.send("notify",{type:"success",message:r})},error:function(r){return e.send("notify",{type:"error",message:r})}},ids:i}}function I(e,r,n){return{window:i(n,e)}}function T(e,r){var n=r.editorInterface;return{editor:l(e,n)}}function A(e,r){var n=r.locales,o=r.contentType,i=r.entry,a=r.fieldInfo;return{contentType:o,entry:u(e,i,a,function(r){return new t(e,r,n.default)})}}function _(e,r){var n=r.field;return{field:new o(e,n)}}function b(e){return{close:function(r){return e.send("closeDialog",r)}}}function v(e){return{platformAlpha:{app:s(e)}}}module.exports=function(e,n,t){return(p[n.location]||d).reduce(function(o,i){return r({},o,i(e,n,t))},{})};
},{"./field":"daBI","./field-locale":"GnXy","./window":"XV20","./entry":"97BZ","./space":"iabO","./dialogs":"6GEt","./editor":"fqJo","./navigator":"Y2Q9","./app":"A2T1","./locations":"CHnp"}],"Focm":[function(require,module,exports) {
var i=require("./initialize"),e=require("./api"),r=require("./locations");module.exports={init:i(window,e),locations:r};
},{"./initialize":"Mq5l","./api":"LVu9","./locations":"CHnp"}]},{},["Focm"], "contentfulExtension")
},{}],"log.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.log = log;

function log(str) {
  if (window) {
    var ce = new CustomEvent('deepcopylog', {
      detail: {
        log: str
      }
    });
    window.dispatchEvent(ce);
  }

  if (console) {
    console.log('DeepCopy: ' + str);
  }
}
},{}],"deep-copy2.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.recursiveClone = recursiveClone;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _log = require("./log");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var references = {};
var referenceCount = 0;
var newReferenceCount = 0;
var updatedReferenceCount = 0;
var statusUpdateTimeout = 3000;
var waitTime = 100;

function wait(_x) {
  return _wait.apply(this, arguments);
}

function _wait() {
  _wait = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(ms) {
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", new Promise(function (resolve) {
              setTimeout(resolve, ms);
            }));

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _wait.apply(this, arguments);
}

function updateEntry(_x2, _x3) {
  return _updateEntry.apply(this, arguments);
}

function _updateEntry() {
  _updateEntry = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee2(space, entry) {
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return wait(waitTime);

          case 2:
            _context2.next = 4;
            return space.updateEntry(entry);

          case 4:
            return _context2.abrupt("return", _context2.sent);

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _updateEntry.apply(this, arguments);
}

function createEntry(_x4, _x5, _x6) {
  return _createEntry.apply(this, arguments);
}

function _createEntry() {
  _createEntry = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee3(space, type, data) {
    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return wait(waitTime);

          case 2:
            _context3.next = 4;
            return space.createEntry(type, data);

          case 4:
            return _context3.abrupt("return", _context3.sent);

          case 5:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _createEntry.apply(this, arguments);
}

function getEntry(_x7, _x8) {
  return _getEntry.apply(this, arguments);
}

function _getEntry() {
  _getEntry = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee4(space, entryId) {
    return _regenerator.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return wait(waitTime);

          case 2:
            _context4.next = 4;
            return space.getEntry(entryId);

          case 4:
            return _context4.abrupt("return", _context4.sent);

          case 5:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _getEntry.apply(this, arguments);
}

function inspectField(_x9, _x10) {
  return _inspectField.apply(this, arguments);
}

function _inspectField() {
  _inspectField = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee6(space, field) {
    return _regenerator.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            if (!(field && Array.isArray(field))) {
              _context6.next = 4;
              break;
            }

            _context6.next = 3;
            return Promise.all(field.map(
            /*#__PURE__*/
            function () {
              var _ref = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee5(f) {
                return _regenerator.default.wrap(function _callee5$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        _context5.next = 2;
                        return inspectField(space, f);

                      case 2:
                        return _context5.abrupt("return", _context5.sent);

                      case 3:
                      case "end":
                        return _context5.stop();
                    }
                  }
                }, _callee5);
              }));

              return function (_x22) {
                return _ref.apply(this, arguments);
              };
            }()));

          case 3:
            return _context6.abrupt("return", _context6.sent);

          case 4:
            if (!(field && field.sys && field.sys.type === 'Link' && field.sys.linkType === 'Entry')) {
              _context6.next = 7;
              break;
            }

            _context6.next = 7;
            return findReferences(space, field.sys.id);

          case 7:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return _inspectField.apply(this, arguments);
}

function findReferences(_x11, _x12) {
  return _findReferences.apply(this, arguments);
}

function _findReferences() {
  _findReferences = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee7(space, entryId) {
    var entry, fieldName, field, lang, langField;
    return _regenerator.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            if (!references[entryId]) {
              _context7.next = 2;
              break;
            }

            return _context7.abrupt("return");

          case 2:
            _context7.next = 4;
            return getEntry(space, entryId);

          case 4:
            entry = _context7.sent;
            referenceCount++;
            references[entryId] = entry;
            _context7.t0 = _regenerator.default.keys(entry.fields);

          case 8:
            if ((_context7.t1 = _context7.t0()).done) {
              _context7.next = 21;
              break;
            }

            fieldName = _context7.t1.value;
            field = entry.fields[fieldName];
            _context7.t2 = _regenerator.default.keys(field);

          case 12:
            if ((_context7.t3 = _context7.t2()).done) {
              _context7.next = 19;
              break;
            }

            lang = _context7.t3.value;
            langField = field[lang];
            _context7.next = 17;
            return inspectField(space, langField);

          case 17:
            _context7.next = 12;
            break;

          case 19:
            _context7.next = 8;
            break;

          case 21:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));
  return _findReferences.apply(this, arguments);
}

function createNewEntriesFromReferences(_x13, _x14) {
  return _createNewEntriesFromReferences.apply(this, arguments);
}

function _createNewEntriesFromReferences() {
  _createNewEntriesFromReferences = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee8(space, tag) {
    var newEntries, entryId, entry, newEntry;
    return _regenerator.default.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            newEntries = {};
            _context8.t0 = _regenerator.default.keys(references);

          case 2:
            if ((_context8.t1 = _context8.t0()).done) {
              _context8.next = 13;
              break;
            }

            entryId = _context8.t1.value;
            entry = references[entryId];
            if (entry.fields.title && entry.fields.title['en-US']) entry.fields.title['en-US'] = entry.fields.title['en-US'] + ' ' + tag;
            _context8.next = 8;
            return createEntry(space, entry.sys.contentType.sys.id, {
              fields: entry.fields
            });

          case 8:
            newEntry = _context8.sent;
            newReferenceCount++;
            newEntries[entryId] = newEntry;
            _context8.next = 2;
            break;

          case 13:
            return _context8.abrupt("return", newEntries);

          case 14:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));
  return _createNewEntriesFromReferences.apply(this, arguments);
}

function updateReferencesOnField(_x15, _x16) {
  return _updateReferencesOnField.apply(this, arguments);
}

function _updateReferencesOnField() {
  _updateReferencesOnField = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee10(field, newReferences) {
    var oldReference, newReference;
    return _regenerator.default.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            if (!(field && Array.isArray(field))) {
              _context10.next = 4;
              break;
            }

            _context10.next = 3;
            return Promise.all(field.map(
            /*#__PURE__*/
            function () {
              var _ref2 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee9(f) {
                return _regenerator.default.wrap(function _callee9$(_context9) {
                  while (1) {
                    switch (_context9.prev = _context9.next) {
                      case 0:
                        _context9.next = 2;
                        return updateReferencesOnField(f, newReferences);

                      case 2:
                        return _context9.abrupt("return", _context9.sent);

                      case 3:
                      case "end":
                        return _context9.stop();
                    }
                  }
                }, _callee9);
              }));

              return function (_x23) {
                return _ref2.apply(this, arguments);
              };
            }()));

          case 3:
            return _context10.abrupt("return", _context10.sent);

          case 4:
            if (field && field.sys && field.sys.type === 'Link' && field.sys.linkType === 'Entry') {
              oldReference = references[field.sys.id];
              newReference = newReferences[field.sys.id];
              field.sys.id = newReference.sys.id;
            }

          case 5:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));
  return _updateReferencesOnField.apply(this, arguments);
}

function updateReferenceTree(_x17, _x18) {
  return _updateReferenceTree.apply(this, arguments);
}

function _updateReferenceTree() {
  _updateReferenceTree = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee11(space, newReferences) {
    var entryId, entry, fieldName, field, lang, langField;
    return _regenerator.default.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.t0 = _regenerator.default.keys(newReferences);

          case 1:
            if ((_context11.t1 = _context11.t0()).done) {
              _context11.next = 23;
              break;
            }

            entryId = _context11.t1.value;
            entry = newReferences[entryId];
            _context11.t2 = _regenerator.default.keys(entry.fields);

          case 5:
            if ((_context11.t3 = _context11.t2()).done) {
              _context11.next = 18;
              break;
            }

            fieldName = _context11.t3.value;
            field = entry.fields[fieldName];
            _context11.t4 = _regenerator.default.keys(field);

          case 9:
            if ((_context11.t5 = _context11.t4()).done) {
              _context11.next = 16;
              break;
            }

            lang = _context11.t5.value;
            langField = field[lang];
            _context11.next = 14;
            return updateReferencesOnField(langField, newReferences);

          case 14:
            _context11.next = 9;
            break;

          case 16:
            _context11.next = 5;
            break;

          case 18:
            _context11.next = 20;
            return updateEntry(space, entry);

          case 20:
            updatedReferenceCount++;
            _context11.next = 1;
            break;

          case 23:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11);
  }));
  return _updateReferenceTree.apply(this, arguments);
}

function recursiveClone(_x19, _x20, _x21) {
  return _recursiveClone.apply(this, arguments);
}

function _recursiveClone() {
  _recursiveClone = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee12(space, entryId, tag) {
    var statusUpdateTimer, newReferences;
    return _regenerator.default.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            references = {};
            referenceCount = 0;
            newReferenceCount = 0;
            updatedReferenceCount = 0;
            (0, _log.log)("Starting clone...");
            statusUpdateTimer = null;
            (0, _log.log)('');
            (0, _log.log)("Finding references recursively...");
            statusUpdateTimer = setInterval(function () {
              (0, _log.log)(" - found ".concat(referenceCount, " entries so far..."));
            }, statusUpdateTimeout);
            _context12.next = 11;
            return findReferences(space, entryId);

          case 11:
            clearInterval(statusUpdateTimer);
            (0, _log.log)(" -- Found ".concat(referenceCount, " reference(s) in total"));
            (0, _log.log)('');
            (0, _log.log)("Creating new entries...");
            statusUpdateTimer = setInterval(function () {
              (0, _log.log)(" - created ".concat(newReferenceCount, "/").concat(referenceCount, " - ").concat(Math.round(newReferenceCount / referenceCount * 100), "%"));
            }, statusUpdateTimeout);
            _context12.next = 18;
            return createNewEntriesFromReferences(space, tag);

          case 18:
            newReferences = _context12.sent;
            clearInterval(statusUpdateTimer);
            (0, _log.log)(" -- Created ".concat(newReferenceCount, " reference(s)"));
            (0, _log.log)('');
            (0, _log.log)("Updating reference-tree...");
            statusUpdateTimer = setInterval(function () {
              (0, _log.log)(" - updated ".concat(updatedReferenceCount, "/").concat(referenceCount, " - ").concat(Math.round(updatedReferenceCount / referenceCount * 100), "%"));
            }, statusUpdateTimeout);
            _context12.next = 26;
            return updateReferenceTree(space, newReferences);

          case 26:
            clearInterval(statusUpdateTimer);
            (0, _log.log)('');
            (0, _log.log)("Updating done.");
            return _context12.abrupt("return", newReferences[entryId]);

          case 30:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12);
  }));
  return _recursiveClone.apply(this, arguments);
}
},{"@babel/runtime/regenerator":"../node_modules/@babel/runtime/regenerator/index.js","@babel/runtime/helpers/asyncToGenerator":"../node_modules/@babel/runtime/helpers/asyncToGenerator.js","./log":"log.js"}],"app.js":[function(require,module,exports) {
"use strict";

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _contentfulUiExtensionsSdk = require("contentful-ui-extensions-sdk");

var _deepCopy = require("./deep-copy2");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var space = null;
var entry = null;
var extension = null;
var state = 'idle';
var activationButton = document.querySelector('button');
var logWindow = document.querySelector('.log-window');
(0, _contentfulUiExtensionsSdk.init)(function (getExtension) {
  space = getExtension.space;
  entry = getExtension.entry;
  extension = getExtension;
  if (extension.window.updateHeight) extension.window.updateHeight();
});

function addToLog(str) {
  logWindow.innerHTML += "<p>".concat(str, "</p>");
  logWindow.scrollTo(0, 999999999);
}

window.addEventListener('deepcopylog', function (event) {
  addToLog(event.detail.log);
});
window.doTheDeepCopy =
/*#__PURE__*/
(0, _asyncToGenerator2.default)(
/*#__PURE__*/
_regenerator.default.mark(function _callee() {
  var tag, sys, clonedEntry;
  return _regenerator.default.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!(state != 'idle')) {
            _context.next = 2;
            break;
          }

          return _context.abrupt("return");

        case 2:
          state = 'cloning';
          activationButton.classList.add('cf-is-loading');
          activationButton.disabled = true;
          logWindow.style.display = 'block';
          tag = document.querySelector('.clone-tag').value;
          if (extension.window.updateHeight) extension.window.updateHeight();
          sys = entry.getSys();
          _context.next = 11;
          return (0, _deepCopy.recursiveClone)(space, sys.id, tag);

        case 11:
          clonedEntry = _context.sent;
          addToLog('');
          addToLog('<strong>Clone successful!<strong>');
          addToLog('New entry at:');
          addToLog("<a target=\"_top\" href=\"https://app.contentful.com/spaces/".concat(sys.space.sys.id, "/entries/").concat(clonedEntry.sys.id, "\">https://app.contentful.com/spaces/").concat(sys.space.sys.id, "/entries/").concat(sys.id, "</a>"));
          activationButton.classList.remove('cf-is-loading');

        case 17:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
}));
document.querySelector('.clone-tag').value = "(".concat(new Date().toUTCString(), ")");

window.toggleConfirmModal = function (flag) {
  document.querySelector('.confirm').style.display = flag ? 'flex' : 'none';
};
},{"@babel/runtime/regenerator":"../node_modules/@babel/runtime/regenerator/index.js","@babel/runtime/helpers/asyncToGenerator":"../node_modules/@babel/runtime/helpers/asyncToGenerator.js","contentful-ui-extensions-sdk":"../node_modules/contentful-ui-extensions-sdk/dist/cf-extension-api.js","./deep-copy2":"deep-copy2.js"}]},{},["app.js"], null)
//# sourceMappingURL=/app.c328ef1a.js.map