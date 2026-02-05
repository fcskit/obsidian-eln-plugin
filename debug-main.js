"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/moment/moment.js
var require_moment = __commonJS({
  "node_modules/moment/moment.js"(exports, module2) {
    (function(global, factory) {
      typeof exports === "object" && typeof module2 !== "undefined" ? module2.exports = factory() : typeof define === "function" && define.amd ? define(factory) : global.moment = factory();
    })(exports, function() {
      "use strict";
      var hookCallback;
      function hooks() {
        return hookCallback.apply(null, arguments);
      }
      function setHookCallback(callback) {
        hookCallback = callback;
      }
      function isArray(input) {
        return input instanceof Array || Object.prototype.toString.call(input) === "[object Array]";
      }
      function isObject(input) {
        return input != null && Object.prototype.toString.call(input) === "[object Object]";
      }
      function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
      }
      function isObjectEmpty(obj) {
        if (Object.getOwnPropertyNames) {
          return Object.getOwnPropertyNames(obj).length === 0;
        } else {
          var k;
          for (k in obj) {
            if (hasOwnProp(obj, k)) {
              return false;
            }
          }
          return true;
        }
      }
      function isUndefined(input) {
        return input === void 0;
      }
      function isNumber(input) {
        return typeof input === "number" || Object.prototype.toString.call(input) === "[object Number]";
      }
      function isDate(input) {
        return input instanceof Date || Object.prototype.toString.call(input) === "[object Date]";
      }
      function map(arr, fn) {
        var res = [], i, arrLen = arr.length;
        for (i = 0; i < arrLen; ++i) {
          res.push(fn(arr[i], i));
        }
        return res;
      }
      function extend(a, b) {
        for (var i in b) {
          if (hasOwnProp(b, i)) {
            a[i] = b[i];
          }
        }
        if (hasOwnProp(b, "toString")) {
          a.toString = b.toString;
        }
        if (hasOwnProp(b, "valueOf")) {
          a.valueOf = b.valueOf;
        }
        return a;
      }
      function createUTC(input, format2, locale2, strict) {
        return createLocalOrUTC(input, format2, locale2, strict, true).utc();
      }
      function defaultParsingFlags() {
        return {
          empty: false,
          unusedTokens: [],
          unusedInput: [],
          overflow: -2,
          charsLeftOver: 0,
          nullInput: false,
          invalidEra: null,
          invalidMonth: null,
          invalidFormat: false,
          userInvalidated: false,
          iso: false,
          parsedDateParts: [],
          era: null,
          meridiem: null,
          rfc2822: false,
          weekdayMismatch: false
        };
      }
      function getParsingFlags(m) {
        if (m._pf == null) {
          m._pf = defaultParsingFlags();
        }
        return m._pf;
      }
      var some;
      if (Array.prototype.some) {
        some = Array.prototype.some;
      } else {
        some = function(fun) {
          var t = Object(this), len = t.length >>> 0, i;
          for (i = 0; i < len; i++) {
            if (i in t && fun.call(this, t[i], i, t)) {
              return true;
            }
          }
          return false;
        };
      }
      function isValid(m) {
        var flags = null, parsedParts = false, isNowValid = m._d && !isNaN(m._d.getTime());
        if (isNowValid) {
          flags = getParsingFlags(m);
          parsedParts = some.call(flags.parsedDateParts, function(i) {
            return i != null;
          });
          isNowValid = flags.overflow < 0 && !flags.empty && !flags.invalidEra && !flags.invalidMonth && !flags.invalidWeekday && !flags.weekdayMismatch && !flags.nullInput && !flags.invalidFormat && !flags.userInvalidated && (!flags.meridiem || flags.meridiem && parsedParts);
          if (m._strict) {
            isNowValid = isNowValid && flags.charsLeftOver === 0 && flags.unusedTokens.length === 0 && flags.bigHour === void 0;
          }
        }
        if (Object.isFrozen == null || !Object.isFrozen(m)) {
          m._isValid = isNowValid;
        } else {
          return isNowValid;
        }
        return m._isValid;
      }
      function createInvalid(flags) {
        var m = createUTC(NaN);
        if (flags != null) {
          extend(getParsingFlags(m), flags);
        } else {
          getParsingFlags(m).userInvalidated = true;
        }
        return m;
      }
      var momentProperties = hooks.momentProperties = [], updateInProgress = false;
      function copyConfig(to2, from2) {
        var i, prop, val, momentPropertiesLen = momentProperties.length;
        if (!isUndefined(from2._isAMomentObject)) {
          to2._isAMomentObject = from2._isAMomentObject;
        }
        if (!isUndefined(from2._i)) {
          to2._i = from2._i;
        }
        if (!isUndefined(from2._f)) {
          to2._f = from2._f;
        }
        if (!isUndefined(from2._l)) {
          to2._l = from2._l;
        }
        if (!isUndefined(from2._strict)) {
          to2._strict = from2._strict;
        }
        if (!isUndefined(from2._tzm)) {
          to2._tzm = from2._tzm;
        }
        if (!isUndefined(from2._isUTC)) {
          to2._isUTC = from2._isUTC;
        }
        if (!isUndefined(from2._offset)) {
          to2._offset = from2._offset;
        }
        if (!isUndefined(from2._pf)) {
          to2._pf = getParsingFlags(from2);
        }
        if (!isUndefined(from2._locale)) {
          to2._locale = from2._locale;
        }
        if (momentPropertiesLen > 0) {
          for (i = 0; i < momentPropertiesLen; i++) {
            prop = momentProperties[i];
            val = from2[prop];
            if (!isUndefined(val)) {
              to2[prop] = val;
            }
          }
        }
        return to2;
      }
      function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        if (!this.isValid()) {
          this._d = /* @__PURE__ */ new Date(NaN);
        }
        if (updateInProgress === false) {
          updateInProgress = true;
          hooks.updateOffset(this);
          updateInProgress = false;
        }
      }
      function isMoment(obj) {
        return obj instanceof Moment || obj != null && obj._isAMomentObject != null;
      }
      function warn(msg) {
        if (hooks.suppressDeprecationWarnings === false && typeof console !== "undefined" && console.warn) {
          console.warn("Deprecation warning: " + msg);
        }
      }
      function deprecate(msg, fn) {
        var firstTime = true;
        return extend(function() {
          if (hooks.deprecationHandler != null) {
            hooks.deprecationHandler(null, msg);
          }
          if (firstTime) {
            var args = [], arg, i, key, argLen = arguments.length;
            for (i = 0; i < argLen; i++) {
              arg = "";
              if (typeof arguments[i] === "object") {
                arg += "\n[" + i + "] ";
                for (key in arguments[0]) {
                  if (hasOwnProp(arguments[0], key)) {
                    arg += key + ": " + arguments[0][key] + ", ";
                  }
                }
                arg = arg.slice(0, -2);
              } else {
                arg = arguments[i];
              }
              args.push(arg);
            }
            warn(
              msg + "\nArguments: " + Array.prototype.slice.call(args).join("") + "\n" + new Error().stack
            );
            firstTime = false;
          }
          return fn.apply(this, arguments);
        }, fn);
      }
      var deprecations = {};
      function deprecateSimple(name, msg) {
        if (hooks.deprecationHandler != null) {
          hooks.deprecationHandler(name, msg);
        }
        if (!deprecations[name]) {
          warn(msg);
          deprecations[name] = true;
        }
      }
      hooks.suppressDeprecationWarnings = false;
      hooks.deprecationHandler = null;
      function isFunction(input) {
        return typeof Function !== "undefined" && input instanceof Function || Object.prototype.toString.call(input) === "[object Function]";
      }
      function set(config) {
        var prop, i;
        for (i in config) {
          if (hasOwnProp(config, i)) {
            prop = config[i];
            if (isFunction(prop)) {
              this[i] = prop;
            } else {
              this["_" + i] = prop;
            }
          }
        }
        this._config = config;
        this._dayOfMonthOrdinalParseLenient = new RegExp(
          (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) + "|" + /\d{1,2}/.source
        );
      }
      function mergeConfigs(parentConfig, childConfig) {
        var res = extend({}, parentConfig), prop;
        for (prop in childConfig) {
          if (hasOwnProp(childConfig, prop)) {
            if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
              res[prop] = {};
              extend(res[prop], parentConfig[prop]);
              extend(res[prop], childConfig[prop]);
            } else if (childConfig[prop] != null) {
              res[prop] = childConfig[prop];
            } else {
              delete res[prop];
            }
          }
        }
        for (prop in parentConfig) {
          if (hasOwnProp(parentConfig, prop) && !hasOwnProp(childConfig, prop) && isObject(parentConfig[prop])) {
            res[prop] = extend({}, res[prop]);
          }
        }
        return res;
      }
      function Locale(config) {
        if (config != null) {
          this.set(config);
        }
      }
      var keys;
      if (Object.keys) {
        keys = Object.keys;
      } else {
        keys = function(obj) {
          var i, res = [];
          for (i in obj) {
            if (hasOwnProp(obj, i)) {
              res.push(i);
            }
          }
          return res;
        };
      }
      var defaultCalendar = {
        sameDay: "[Today at] LT",
        nextDay: "[Tomorrow at] LT",
        nextWeek: "dddd [at] LT",
        lastDay: "[Yesterday at] LT",
        lastWeek: "[Last] dddd [at] LT",
        sameElse: "L"
      };
      function calendar(key, mom, now2) {
        var output = this._calendar[key] || this._calendar["sameElse"];
        return isFunction(output) ? output.call(mom, now2) : output;
      }
      function zeroFill(number, targetLength, forceSign) {
        var absNumber = "" + Math.abs(number), zerosToFill = targetLength - absNumber.length, sign2 = number >= 0;
        return (sign2 ? forceSign ? "+" : "" : "-") + Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
      }
      var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g, localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, formatFunctions = {}, formatTokenFunctions = {};
      function addFormatToken(token2, padded, ordinal2, callback) {
        var func = callback;
        if (typeof callback === "string") {
          func = function() {
            return this[callback]();
          };
        }
        if (token2) {
          formatTokenFunctions[token2] = func;
        }
        if (padded) {
          formatTokenFunctions[padded[0]] = function() {
            return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
          };
        }
        if (ordinal2) {
          formatTokenFunctions[ordinal2] = function() {
            return this.localeData().ordinal(
              func.apply(this, arguments),
              token2
            );
          };
        }
      }
      function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
          return input.replace(/^\[|\]$/g, "");
        }
        return input.replace(/\\/g, "");
      }
      function makeFormatFunction(format2) {
        var array = format2.match(formattingTokens), i, length;
        for (i = 0, length = array.length; i < length; i++) {
          if (formatTokenFunctions[array[i]]) {
            array[i] = formatTokenFunctions[array[i]];
          } else {
            array[i] = removeFormattingTokens(array[i]);
          }
        }
        return function(mom) {
          var output = "", i2;
          for (i2 = 0; i2 < length; i2++) {
            output += isFunction(array[i2]) ? array[i2].call(mom, format2) : array[i2];
          }
          return output;
        };
      }
      function formatMoment(m, format2) {
        if (!m.isValid()) {
          return m.localeData().invalidDate();
        }
        format2 = expandFormat(format2, m.localeData());
        formatFunctions[format2] = formatFunctions[format2] || makeFormatFunction(format2);
        return formatFunctions[format2](m);
      }
      function expandFormat(format2, locale2) {
        var i = 5;
        function replaceLongDateFormatTokens(input) {
          return locale2.longDateFormat(input) || input;
        }
        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format2)) {
          format2 = format2.replace(
            localFormattingTokens,
            replaceLongDateFormatTokens
          );
          localFormattingTokens.lastIndex = 0;
          i -= 1;
        }
        return format2;
      }
      var defaultLongDateFormat = {
        LTS: "h:mm:ss A",
        LT: "h:mm A",
        L: "MM/DD/YYYY",
        LL: "MMMM D, YYYY",
        LLL: "MMMM D, YYYY h:mm A",
        LLLL: "dddd, MMMM D, YYYY h:mm A"
      };
      function longDateFormat(key) {
        var format2 = this._longDateFormat[key], formatUpper = this._longDateFormat[key.toUpperCase()];
        if (format2 || !formatUpper) {
          return format2;
        }
        this._longDateFormat[key] = formatUpper.match(formattingTokens).map(function(tok) {
          if (tok === "MMMM" || tok === "MM" || tok === "DD" || tok === "dddd") {
            return tok.slice(1);
          }
          return tok;
        }).join("");
        return this._longDateFormat[key];
      }
      var defaultInvalidDate = "Invalid date";
      function invalidDate() {
        return this._invalidDate;
      }
      var defaultOrdinal = "%d", defaultDayOfMonthOrdinalParse = /\d{1,2}/;
      function ordinal(number) {
        return this._ordinal.replace("%d", number);
      }
      var defaultRelativeTime = {
        future: "in %s",
        past: "%s ago",
        s: "a few seconds",
        ss: "%d seconds",
        m: "a minute",
        mm: "%d minutes",
        h: "an hour",
        hh: "%d hours",
        d: "a day",
        dd: "%d days",
        w: "a week",
        ww: "%d weeks",
        M: "a month",
        MM: "%d months",
        y: "a year",
        yy: "%d years"
      };
      function relativeTime(number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return isFunction(output) ? output(number, withoutSuffix, string, isFuture) : output.replace(/%d/i, number);
      }
      function pastFuture(diff2, output) {
        var format2 = this._relativeTime[diff2 > 0 ? "future" : "past"];
        return isFunction(format2) ? format2(output) : format2.replace(/%s/i, output);
      }
      var aliases = {
        D: "date",
        dates: "date",
        date: "date",
        d: "day",
        days: "day",
        day: "day",
        e: "weekday",
        weekdays: "weekday",
        weekday: "weekday",
        E: "isoWeekday",
        isoweekdays: "isoWeekday",
        isoweekday: "isoWeekday",
        DDD: "dayOfYear",
        dayofyears: "dayOfYear",
        dayofyear: "dayOfYear",
        h: "hour",
        hours: "hour",
        hour: "hour",
        ms: "millisecond",
        milliseconds: "millisecond",
        millisecond: "millisecond",
        m: "minute",
        minutes: "minute",
        minute: "minute",
        M: "month",
        months: "month",
        month: "month",
        Q: "quarter",
        quarters: "quarter",
        quarter: "quarter",
        s: "second",
        seconds: "second",
        second: "second",
        gg: "weekYear",
        weekyears: "weekYear",
        weekyear: "weekYear",
        GG: "isoWeekYear",
        isoweekyears: "isoWeekYear",
        isoweekyear: "isoWeekYear",
        w: "week",
        weeks: "week",
        week: "week",
        W: "isoWeek",
        isoweeks: "isoWeek",
        isoweek: "isoWeek",
        y: "year",
        years: "year",
        year: "year"
      };
      function normalizeUnits(units) {
        return typeof units === "string" ? aliases[units] || aliases[units.toLowerCase()] : void 0;
      }
      function normalizeObjectUnits(inputObject) {
        var normalizedInput = {}, normalizedProp, prop;
        for (prop in inputObject) {
          if (hasOwnProp(inputObject, prop)) {
            normalizedProp = normalizeUnits(prop);
            if (normalizedProp) {
              normalizedInput[normalizedProp] = inputObject[prop];
            }
          }
        }
        return normalizedInput;
      }
      var priorities = {
        date: 9,
        day: 11,
        weekday: 11,
        isoWeekday: 11,
        dayOfYear: 4,
        hour: 13,
        millisecond: 16,
        minute: 14,
        month: 8,
        quarter: 7,
        second: 15,
        weekYear: 1,
        isoWeekYear: 1,
        week: 5,
        isoWeek: 5,
        year: 1
      };
      function getPrioritizedUnits(unitsObj) {
        var units = [], u;
        for (u in unitsObj) {
          if (hasOwnProp(unitsObj, u)) {
            units.push({ unit: u, priority: priorities[u] });
          }
        }
        units.sort(function(a, b) {
          return a.priority - b.priority;
        });
        return units;
      }
      var match1 = /\d/, match2 = /\d\d/, match3 = /\d{3}/, match4 = /\d{4}/, match6 = /[+-]?\d{6}/, match1to2 = /\d\d?/, match3to4 = /\d\d\d\d?/, match5to6 = /\d\d\d\d\d\d?/, match1to3 = /\d{1,3}/, match1to4 = /\d{1,4}/, match1to6 = /[+-]?\d{1,6}/, matchUnsigned = /\d+/, matchSigned = /[+-]?\d+/, matchOffset = /Z|[+-]\d\d:?\d\d/gi, matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi, matchTimestamp = /[+-]?\d+(\.\d{1,3})?/, matchWord = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i, match1to2NoLeadingZero = /^[1-9]\d?/, match1to2HasZero = /^([1-9]\d|\d)/, regexes;
      regexes = {};
      function addRegexToken(token2, regex, strictRegex) {
        regexes[token2] = isFunction(regex) ? regex : function(isStrict, localeData2) {
          return isStrict && strictRegex ? strictRegex : regex;
        };
      }
      function getParseRegexForToken(token2, config) {
        if (!hasOwnProp(regexes, token2)) {
          return new RegExp(unescapeFormat(token2));
        }
        return regexes[token2](config._strict, config._locale);
      }
      function unescapeFormat(s) {
        return regexEscape(
          s.replace("\\", "").replace(
            /\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,
            function(matched, p1, p2, p3, p4) {
              return p1 || p2 || p3 || p4;
            }
          )
        );
      }
      function regexEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      }
      function absFloor(number) {
        if (number < 0) {
          return Math.ceil(number) || 0;
        } else {
          return Math.floor(number);
        }
      }
      function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion, value = 0;
        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
          value = absFloor(coercedNumber);
        }
        return value;
      }
      var tokens = {};
      function addParseToken(token2, callback) {
        var i, func = callback, tokenLen;
        if (typeof token2 === "string") {
          token2 = [token2];
        }
        if (isNumber(callback)) {
          func = function(input, array) {
            array[callback] = toInt(input);
          };
        }
        tokenLen = token2.length;
        for (i = 0; i < tokenLen; i++) {
          tokens[token2[i]] = func;
        }
      }
      function addWeekParseToken(token2, callback) {
        addParseToken(token2, function(input, array, config, token3) {
          config._w = config._w || {};
          callback(input, config._w, config, token3);
        });
      }
      function addTimeToArrayFromToken(token2, input, config) {
        if (input != null && hasOwnProp(tokens, token2)) {
          tokens[token2](input, config._a, config, token2);
        }
      }
      function isLeapYear(year) {
        return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
      }
      var YEAR = 0, MONTH = 1, DATE = 2, HOUR = 3, MINUTE = 4, SECOND = 5, MILLISECOND = 6, WEEK = 7, WEEKDAY = 8;
      addFormatToken("Y", 0, 0, function() {
        var y = this.year();
        return y <= 9999 ? zeroFill(y, 4) : "+" + y;
      });
      addFormatToken(0, ["YY", 2], 0, function() {
        return this.year() % 100;
      });
      addFormatToken(0, ["YYYY", 4], 0, "year");
      addFormatToken(0, ["YYYYY", 5], 0, "year");
      addFormatToken(0, ["YYYYYY", 6, true], 0, "year");
      addRegexToken("Y", matchSigned);
      addRegexToken("YY", match1to2, match2);
      addRegexToken("YYYY", match1to4, match4);
      addRegexToken("YYYYY", match1to6, match6);
      addRegexToken("YYYYYY", match1to6, match6);
      addParseToken(["YYYYY", "YYYYYY"], YEAR);
      addParseToken("YYYY", function(input, array) {
        array[YEAR] = input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
      });
      addParseToken("YY", function(input, array) {
        array[YEAR] = hooks.parseTwoDigitYear(input);
      });
      addParseToken("Y", function(input, array) {
        array[YEAR] = parseInt(input, 10);
      });
      function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
      }
      hooks.parseTwoDigitYear = function(input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2e3);
      };
      var getSetYear = makeGetSet("FullYear", true);
      function getIsLeapYear() {
        return isLeapYear(this.year());
      }
      function makeGetSet(unit, keepTime) {
        return function(value) {
          if (value != null) {
            set$1(this, unit, value);
            hooks.updateOffset(this, keepTime);
            return this;
          } else {
            return get(this, unit);
          }
        };
      }
      function get(mom, unit) {
        if (!mom.isValid()) {
          return NaN;
        }
        var d = mom._d, isUTC = mom._isUTC;
        switch (unit) {
          case "Milliseconds":
            return isUTC ? d.getUTCMilliseconds() : d.getMilliseconds();
          case "Seconds":
            return isUTC ? d.getUTCSeconds() : d.getSeconds();
          case "Minutes":
            return isUTC ? d.getUTCMinutes() : d.getMinutes();
          case "Hours":
            return isUTC ? d.getUTCHours() : d.getHours();
          case "Date":
            return isUTC ? d.getUTCDate() : d.getDate();
          case "Day":
            return isUTC ? d.getUTCDay() : d.getDay();
          case "Month":
            return isUTC ? d.getUTCMonth() : d.getMonth();
          case "FullYear":
            return isUTC ? d.getUTCFullYear() : d.getFullYear();
          default:
            return NaN;
        }
      }
      function set$1(mom, unit, value) {
        var d, isUTC, year, month, date;
        if (!mom.isValid() || isNaN(value)) {
          return;
        }
        d = mom._d;
        isUTC = mom._isUTC;
        switch (unit) {
          case "Milliseconds":
            return void (isUTC ? d.setUTCMilliseconds(value) : d.setMilliseconds(value));
          case "Seconds":
            return void (isUTC ? d.setUTCSeconds(value) : d.setSeconds(value));
          case "Minutes":
            return void (isUTC ? d.setUTCMinutes(value) : d.setMinutes(value));
          case "Hours":
            return void (isUTC ? d.setUTCHours(value) : d.setHours(value));
          case "Date":
            return void (isUTC ? d.setUTCDate(value) : d.setDate(value));
          // case 'Day': // Not real
          //    return void (isUTC ? d.setUTCDay(value) : d.setDay(value));
          // case 'Month': // Not used because we need to pass two variables
          //     return void (isUTC ? d.setUTCMonth(value) : d.setMonth(value));
          case "FullYear":
            break;
          // See below ...
          default:
            return;
        }
        year = value;
        month = mom.month();
        date = mom.date();
        date = date === 29 && month === 1 && !isLeapYear(year) ? 28 : date;
        void (isUTC ? d.setUTCFullYear(year, month, date) : d.setFullYear(year, month, date));
      }
      function stringGet(units) {
        units = normalizeUnits(units);
        if (isFunction(this[units])) {
          return this[units]();
        }
        return this;
      }
      function stringSet(units, value) {
        if (typeof units === "object") {
          units = normalizeObjectUnits(units);
          var prioritized = getPrioritizedUnits(units), i, prioritizedLen = prioritized.length;
          for (i = 0; i < prioritizedLen; i++) {
            this[prioritized[i].unit](units[prioritized[i].unit]);
          }
        } else {
          units = normalizeUnits(units);
          if (isFunction(this[units])) {
            return this[units](value);
          }
        }
        return this;
      }
      function mod(n, x) {
        return (n % x + x) % x;
      }
      var indexOf;
      if (Array.prototype.indexOf) {
        indexOf = Array.prototype.indexOf;
      } else {
        indexOf = function(o) {
          var i;
          for (i = 0; i < this.length; ++i) {
            if (this[i] === o) {
              return i;
            }
          }
          return -1;
        };
      }
      function daysInMonth(year, month) {
        if (isNaN(year) || isNaN(month)) {
          return NaN;
        }
        var modMonth = mod(month, 12);
        year += (month - modMonth) / 12;
        return modMonth === 1 ? isLeapYear(year) ? 29 : 28 : 31 - modMonth % 7 % 2;
      }
      addFormatToken("M", ["MM", 2], "Mo", function() {
        return this.month() + 1;
      });
      addFormatToken("MMM", 0, 0, function(format2) {
        return this.localeData().monthsShort(this, format2);
      });
      addFormatToken("MMMM", 0, 0, function(format2) {
        return this.localeData().months(this, format2);
      });
      addRegexToken("M", match1to2, match1to2NoLeadingZero);
      addRegexToken("MM", match1to2, match2);
      addRegexToken("MMM", function(isStrict, locale2) {
        return locale2.monthsShortRegex(isStrict);
      });
      addRegexToken("MMMM", function(isStrict, locale2) {
        return locale2.monthsRegex(isStrict);
      });
      addParseToken(["M", "MM"], function(input, array) {
        array[MONTH] = toInt(input) - 1;
      });
      addParseToken(["MMM", "MMMM"], function(input, array, config, token2) {
        var month = config._locale.monthsParse(input, token2, config._strict);
        if (month != null) {
          array[MONTH] = month;
        } else {
          getParsingFlags(config).invalidMonth = input;
        }
      });
      var defaultLocaleMonths = "January_February_March_April_May_June_July_August_September_October_November_December".split(
        "_"
      ), defaultLocaleMonthsShort = "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"), MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/, defaultMonthsShortRegex = matchWord, defaultMonthsRegex = matchWord;
      function localeMonths(m, format2) {
        if (!m) {
          return isArray(this._months) ? this._months : this._months["standalone"];
        }
        return isArray(this._months) ? this._months[m.month()] : this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format2) ? "format" : "standalone"][m.month()];
      }
      function localeMonthsShort(m, format2) {
        if (!m) {
          return isArray(this._monthsShort) ? this._monthsShort : this._monthsShort["standalone"];
        }
        return isArray(this._monthsShort) ? this._monthsShort[m.month()] : this._monthsShort[MONTHS_IN_FORMAT.test(format2) ? "format" : "standalone"][m.month()];
      }
      function handleStrictParse(monthName, format2, strict) {
        var i, ii, mom, llc = monthName.toLocaleLowerCase();
        if (!this._monthsParse) {
          this._monthsParse = [];
          this._longMonthsParse = [];
          this._shortMonthsParse = [];
          for (i = 0; i < 12; ++i) {
            mom = createUTC([2e3, i]);
            this._shortMonthsParse[i] = this.monthsShort(
              mom,
              ""
            ).toLocaleLowerCase();
            this._longMonthsParse[i] = this.months(mom, "").toLocaleLowerCase();
          }
        }
        if (strict) {
          if (format2 === "MMM") {
            ii = indexOf.call(this._shortMonthsParse, llc);
            return ii !== -1 ? ii : null;
          } else {
            ii = indexOf.call(this._longMonthsParse, llc);
            return ii !== -1 ? ii : null;
          }
        } else {
          if (format2 === "MMM") {
            ii = indexOf.call(this._shortMonthsParse, llc);
            if (ii !== -1) {
              return ii;
            }
            ii = indexOf.call(this._longMonthsParse, llc);
            return ii !== -1 ? ii : null;
          } else {
            ii = indexOf.call(this._longMonthsParse, llc);
            if (ii !== -1) {
              return ii;
            }
            ii = indexOf.call(this._shortMonthsParse, llc);
            return ii !== -1 ? ii : null;
          }
        }
      }
      function localeMonthsParse(monthName, format2, strict) {
        var i, mom, regex;
        if (this._monthsParseExact) {
          return handleStrictParse.call(this, monthName, format2, strict);
        }
        if (!this._monthsParse) {
          this._monthsParse = [];
          this._longMonthsParse = [];
          this._shortMonthsParse = [];
        }
        for (i = 0; i < 12; i++) {
          mom = createUTC([2e3, i]);
          if (strict && !this._longMonthsParse[i]) {
            this._longMonthsParse[i] = new RegExp(
              "^" + this.months(mom, "").replace(".", "") + "$",
              "i"
            );
            this._shortMonthsParse[i] = new RegExp(
              "^" + this.monthsShort(mom, "").replace(".", "") + "$",
              "i"
            );
          }
          if (!strict && !this._monthsParse[i]) {
            regex = "^" + this.months(mom, "") + "|^" + this.monthsShort(mom, "");
            this._monthsParse[i] = new RegExp(regex.replace(".", ""), "i");
          }
          if (strict && format2 === "MMMM" && this._longMonthsParse[i].test(monthName)) {
            return i;
          } else if (strict && format2 === "MMM" && this._shortMonthsParse[i].test(monthName)) {
            return i;
          } else if (!strict && this._monthsParse[i].test(monthName)) {
            return i;
          }
        }
      }
      function setMonth(mom, value) {
        if (!mom.isValid()) {
          return mom;
        }
        if (typeof value === "string") {
          if (/^\d+$/.test(value)) {
            value = toInt(value);
          } else {
            value = mom.localeData().monthsParse(value);
            if (!isNumber(value)) {
              return mom;
            }
          }
        }
        var month = value, date = mom.date();
        date = date < 29 ? date : Math.min(date, daysInMonth(mom.year(), month));
        void (mom._isUTC ? mom._d.setUTCMonth(month, date) : mom._d.setMonth(month, date));
        return mom;
      }
      function getSetMonth(value) {
        if (value != null) {
          setMonth(this, value);
          hooks.updateOffset(this, true);
          return this;
        } else {
          return get(this, "Month");
        }
      }
      function getDaysInMonth() {
        return daysInMonth(this.year(), this.month());
      }
      function monthsShortRegex(isStrict) {
        if (this._monthsParseExact) {
          if (!hasOwnProp(this, "_monthsRegex")) {
            computeMonthsParse.call(this);
          }
          if (isStrict) {
            return this._monthsShortStrictRegex;
          } else {
            return this._monthsShortRegex;
          }
        } else {
          if (!hasOwnProp(this, "_monthsShortRegex")) {
            this._monthsShortRegex = defaultMonthsShortRegex;
          }
          return this._monthsShortStrictRegex && isStrict ? this._monthsShortStrictRegex : this._monthsShortRegex;
        }
      }
      function monthsRegex(isStrict) {
        if (this._monthsParseExact) {
          if (!hasOwnProp(this, "_monthsRegex")) {
            computeMonthsParse.call(this);
          }
          if (isStrict) {
            return this._monthsStrictRegex;
          } else {
            return this._monthsRegex;
          }
        } else {
          if (!hasOwnProp(this, "_monthsRegex")) {
            this._monthsRegex = defaultMonthsRegex;
          }
          return this._monthsStrictRegex && isStrict ? this._monthsStrictRegex : this._monthsRegex;
        }
      }
      function computeMonthsParse() {
        function cmpLenRev(a, b) {
          return b.length - a.length;
        }
        var shortPieces = [], longPieces = [], mixedPieces = [], i, mom, shortP, longP;
        for (i = 0; i < 12; i++) {
          mom = createUTC([2e3, i]);
          shortP = regexEscape(this.monthsShort(mom, ""));
          longP = regexEscape(this.months(mom, ""));
          shortPieces.push(shortP);
          longPieces.push(longP);
          mixedPieces.push(longP);
          mixedPieces.push(shortP);
        }
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        this._monthsRegex = new RegExp("^(" + mixedPieces.join("|") + ")", "i");
        this._monthsShortRegex = this._monthsRegex;
        this._monthsStrictRegex = new RegExp(
          "^(" + longPieces.join("|") + ")",
          "i"
        );
        this._monthsShortStrictRegex = new RegExp(
          "^(" + shortPieces.join("|") + ")",
          "i"
        );
      }
      function createDate(y, m, d, h, M, s, ms) {
        var date;
        if (y < 100 && y >= 0) {
          date = new Date(y + 400, m, d, h, M, s, ms);
          if (isFinite(date.getFullYear())) {
            date.setFullYear(y);
          }
        } else {
          date = new Date(y, m, d, h, M, s, ms);
        }
        return date;
      }
      function createUTCDate(y) {
        var date, args;
        if (y < 100 && y >= 0) {
          args = Array.prototype.slice.call(arguments);
          args[0] = y + 400;
          date = new Date(Date.UTC.apply(null, args));
          if (isFinite(date.getUTCFullYear())) {
            date.setUTCFullYear(y);
          }
        } else {
          date = new Date(Date.UTC.apply(null, arguments));
        }
        return date;
      }
      function firstWeekOffset(year, dow, doy) {
        var fwd = 7 + dow - doy, fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;
        return -fwdlw + fwd - 1;
      }
      function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
        var localWeekday = (7 + weekday - dow) % 7, weekOffset = firstWeekOffset(year, dow, doy), dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset, resYear, resDayOfYear;
        if (dayOfYear <= 0) {
          resYear = year - 1;
          resDayOfYear = daysInYear(resYear) + dayOfYear;
        } else if (dayOfYear > daysInYear(year)) {
          resYear = year + 1;
          resDayOfYear = dayOfYear - daysInYear(year);
        } else {
          resYear = year;
          resDayOfYear = dayOfYear;
        }
        return {
          year: resYear,
          dayOfYear: resDayOfYear
        };
      }
      function weekOfYear(mom, dow, doy) {
        var weekOffset = firstWeekOffset(mom.year(), dow, doy), week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1, resWeek, resYear;
        if (week < 1) {
          resYear = mom.year() - 1;
          resWeek = week + weeksInYear(resYear, dow, doy);
        } else if (week > weeksInYear(mom.year(), dow, doy)) {
          resWeek = week - weeksInYear(mom.year(), dow, doy);
          resYear = mom.year() + 1;
        } else {
          resYear = mom.year();
          resWeek = week;
        }
        return {
          week: resWeek,
          year: resYear
        };
      }
      function weeksInYear(year, dow, doy) {
        var weekOffset = firstWeekOffset(year, dow, doy), weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
        return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
      }
      addFormatToken("w", ["ww", 2], "wo", "week");
      addFormatToken("W", ["WW", 2], "Wo", "isoWeek");
      addRegexToken("w", match1to2, match1to2NoLeadingZero);
      addRegexToken("ww", match1to2, match2);
      addRegexToken("W", match1to2, match1to2NoLeadingZero);
      addRegexToken("WW", match1to2, match2);
      addWeekParseToken(
        ["w", "ww", "W", "WW"],
        function(input, week, config, token2) {
          week[token2.substr(0, 1)] = toInt(input);
        }
      );
      function localeWeek(mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
      }
      var defaultLocaleWeek = {
        dow: 0,
        // Sunday is the first day of the week.
        doy: 6
        // The week that contains Jan 6th is the first week of the year.
      };
      function localeFirstDayOfWeek() {
        return this._week.dow;
      }
      function localeFirstDayOfYear() {
        return this._week.doy;
      }
      function getSetWeek(input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, "d");
      }
      function getSetISOWeek(input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, "d");
      }
      addFormatToken("d", 0, "do", "day");
      addFormatToken("dd", 0, 0, function(format2) {
        return this.localeData().weekdaysMin(this, format2);
      });
      addFormatToken("ddd", 0, 0, function(format2) {
        return this.localeData().weekdaysShort(this, format2);
      });
      addFormatToken("dddd", 0, 0, function(format2) {
        return this.localeData().weekdays(this, format2);
      });
      addFormatToken("e", 0, 0, "weekday");
      addFormatToken("E", 0, 0, "isoWeekday");
      addRegexToken("d", match1to2);
      addRegexToken("e", match1to2);
      addRegexToken("E", match1to2);
      addRegexToken("dd", function(isStrict, locale2) {
        return locale2.weekdaysMinRegex(isStrict);
      });
      addRegexToken("ddd", function(isStrict, locale2) {
        return locale2.weekdaysShortRegex(isStrict);
      });
      addRegexToken("dddd", function(isStrict, locale2) {
        return locale2.weekdaysRegex(isStrict);
      });
      addWeekParseToken(["dd", "ddd", "dddd"], function(input, week, config, token2) {
        var weekday = config._locale.weekdaysParse(input, token2, config._strict);
        if (weekday != null) {
          week.d = weekday;
        } else {
          getParsingFlags(config).invalidWeekday = input;
        }
      });
      addWeekParseToken(["d", "e", "E"], function(input, week, config, token2) {
        week[token2] = toInt(input);
      });
      function parseWeekday(input, locale2) {
        if (typeof input !== "string") {
          return input;
        }
        if (!isNaN(input)) {
          return parseInt(input, 10);
        }
        input = locale2.weekdaysParse(input);
        if (typeof input === "number") {
          return input;
        }
        return null;
      }
      function parseIsoWeekday(input, locale2) {
        if (typeof input === "string") {
          return locale2.weekdaysParse(input) % 7 || 7;
        }
        return isNaN(input) ? null : input;
      }
      function shiftWeekdays(ws, n) {
        return ws.slice(n, 7).concat(ws.slice(0, n));
      }
      var defaultLocaleWeekdays = "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), defaultLocaleWeekdaysShort = "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"), defaultLocaleWeekdaysMin = "Su_Mo_Tu_We_Th_Fr_Sa".split("_"), defaultWeekdaysRegex = matchWord, defaultWeekdaysShortRegex = matchWord, defaultWeekdaysMinRegex = matchWord;
      function localeWeekdays(m, format2) {
        var weekdays = isArray(this._weekdays) ? this._weekdays : this._weekdays[m && m !== true && this._weekdays.isFormat.test(format2) ? "format" : "standalone"];
        return m === true ? shiftWeekdays(weekdays, this._week.dow) : m ? weekdays[m.day()] : weekdays;
      }
      function localeWeekdaysShort(m) {
        return m === true ? shiftWeekdays(this._weekdaysShort, this._week.dow) : m ? this._weekdaysShort[m.day()] : this._weekdaysShort;
      }
      function localeWeekdaysMin(m) {
        return m === true ? shiftWeekdays(this._weekdaysMin, this._week.dow) : m ? this._weekdaysMin[m.day()] : this._weekdaysMin;
      }
      function handleStrictParse$1(weekdayName, format2, strict) {
        var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
        if (!this._weekdaysParse) {
          this._weekdaysParse = [];
          this._shortWeekdaysParse = [];
          this._minWeekdaysParse = [];
          for (i = 0; i < 7; ++i) {
            mom = createUTC([2e3, 1]).day(i);
            this._minWeekdaysParse[i] = this.weekdaysMin(
              mom,
              ""
            ).toLocaleLowerCase();
            this._shortWeekdaysParse[i] = this.weekdaysShort(
              mom,
              ""
            ).toLocaleLowerCase();
            this._weekdaysParse[i] = this.weekdays(mom, "").toLocaleLowerCase();
          }
        }
        if (strict) {
          if (format2 === "dddd") {
            ii = indexOf.call(this._weekdaysParse, llc);
            return ii !== -1 ? ii : null;
          } else if (format2 === "ddd") {
            ii = indexOf.call(this._shortWeekdaysParse, llc);
            return ii !== -1 ? ii : null;
          } else {
            ii = indexOf.call(this._minWeekdaysParse, llc);
            return ii !== -1 ? ii : null;
          }
        } else {
          if (format2 === "dddd") {
            ii = indexOf.call(this._weekdaysParse, llc);
            if (ii !== -1) {
              return ii;
            }
            ii = indexOf.call(this._shortWeekdaysParse, llc);
            if (ii !== -1) {
              return ii;
            }
            ii = indexOf.call(this._minWeekdaysParse, llc);
            return ii !== -1 ? ii : null;
          } else if (format2 === "ddd") {
            ii = indexOf.call(this._shortWeekdaysParse, llc);
            if (ii !== -1) {
              return ii;
            }
            ii = indexOf.call(this._weekdaysParse, llc);
            if (ii !== -1) {
              return ii;
            }
            ii = indexOf.call(this._minWeekdaysParse, llc);
            return ii !== -1 ? ii : null;
          } else {
            ii = indexOf.call(this._minWeekdaysParse, llc);
            if (ii !== -1) {
              return ii;
            }
            ii = indexOf.call(this._weekdaysParse, llc);
            if (ii !== -1) {
              return ii;
            }
            ii = indexOf.call(this._shortWeekdaysParse, llc);
            return ii !== -1 ? ii : null;
          }
        }
      }
      function localeWeekdaysParse(weekdayName, format2, strict) {
        var i, mom, regex;
        if (this._weekdaysParseExact) {
          return handleStrictParse$1.call(this, weekdayName, format2, strict);
        }
        if (!this._weekdaysParse) {
          this._weekdaysParse = [];
          this._minWeekdaysParse = [];
          this._shortWeekdaysParse = [];
          this._fullWeekdaysParse = [];
        }
        for (i = 0; i < 7; i++) {
          mom = createUTC([2e3, 1]).day(i);
          if (strict && !this._fullWeekdaysParse[i]) {
            this._fullWeekdaysParse[i] = new RegExp(
              "^" + this.weekdays(mom, "").replace(".", "\\.?") + "$",
              "i"
            );
            this._shortWeekdaysParse[i] = new RegExp(
              "^" + this.weekdaysShort(mom, "").replace(".", "\\.?") + "$",
              "i"
            );
            this._minWeekdaysParse[i] = new RegExp(
              "^" + this.weekdaysMin(mom, "").replace(".", "\\.?") + "$",
              "i"
            );
          }
          if (!this._weekdaysParse[i]) {
            regex = "^" + this.weekdays(mom, "") + "|^" + this.weekdaysShort(mom, "") + "|^" + this.weekdaysMin(mom, "");
            this._weekdaysParse[i] = new RegExp(regex.replace(".", ""), "i");
          }
          if (strict && format2 === "dddd" && this._fullWeekdaysParse[i].test(weekdayName)) {
            return i;
          } else if (strict && format2 === "ddd" && this._shortWeekdaysParse[i].test(weekdayName)) {
            return i;
          } else if (strict && format2 === "dd" && this._minWeekdaysParse[i].test(weekdayName)) {
            return i;
          } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
            return i;
          }
        }
      }
      function getSetDayOfWeek(input) {
        if (!this.isValid()) {
          return input != null ? this : NaN;
        }
        var day = get(this, "Day");
        if (input != null) {
          input = parseWeekday(input, this.localeData());
          return this.add(input - day, "d");
        } else {
          return day;
        }
      }
      function getSetLocaleDayOfWeek(input) {
        if (!this.isValid()) {
          return input != null ? this : NaN;
        }
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, "d");
      }
      function getSetISODayOfWeek(input) {
        if (!this.isValid()) {
          return input != null ? this : NaN;
        }
        if (input != null) {
          var weekday = parseIsoWeekday(input, this.localeData());
          return this.day(this.day() % 7 ? weekday : weekday - 7);
        } else {
          return this.day() || 7;
        }
      }
      function weekdaysRegex(isStrict) {
        if (this._weekdaysParseExact) {
          if (!hasOwnProp(this, "_weekdaysRegex")) {
            computeWeekdaysParse.call(this);
          }
          if (isStrict) {
            return this._weekdaysStrictRegex;
          } else {
            return this._weekdaysRegex;
          }
        } else {
          if (!hasOwnProp(this, "_weekdaysRegex")) {
            this._weekdaysRegex = defaultWeekdaysRegex;
          }
          return this._weekdaysStrictRegex && isStrict ? this._weekdaysStrictRegex : this._weekdaysRegex;
        }
      }
      function weekdaysShortRegex(isStrict) {
        if (this._weekdaysParseExact) {
          if (!hasOwnProp(this, "_weekdaysRegex")) {
            computeWeekdaysParse.call(this);
          }
          if (isStrict) {
            return this._weekdaysShortStrictRegex;
          } else {
            return this._weekdaysShortRegex;
          }
        } else {
          if (!hasOwnProp(this, "_weekdaysShortRegex")) {
            this._weekdaysShortRegex = defaultWeekdaysShortRegex;
          }
          return this._weekdaysShortStrictRegex && isStrict ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
        }
      }
      function weekdaysMinRegex(isStrict) {
        if (this._weekdaysParseExact) {
          if (!hasOwnProp(this, "_weekdaysRegex")) {
            computeWeekdaysParse.call(this);
          }
          if (isStrict) {
            return this._weekdaysMinStrictRegex;
          } else {
            return this._weekdaysMinRegex;
          }
        } else {
          if (!hasOwnProp(this, "_weekdaysMinRegex")) {
            this._weekdaysMinRegex = defaultWeekdaysMinRegex;
          }
          return this._weekdaysMinStrictRegex && isStrict ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
        }
      }
      function computeWeekdaysParse() {
        function cmpLenRev(a, b) {
          return b.length - a.length;
        }
        var minPieces = [], shortPieces = [], longPieces = [], mixedPieces = [], i, mom, minp, shortp, longp;
        for (i = 0; i < 7; i++) {
          mom = createUTC([2e3, 1]).day(i);
          minp = regexEscape(this.weekdaysMin(mom, ""));
          shortp = regexEscape(this.weekdaysShort(mom, ""));
          longp = regexEscape(this.weekdays(mom, ""));
          minPieces.push(minp);
          shortPieces.push(shortp);
          longPieces.push(longp);
          mixedPieces.push(minp);
          mixedPieces.push(shortp);
          mixedPieces.push(longp);
        }
        minPieces.sort(cmpLenRev);
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        this._weekdaysRegex = new RegExp("^(" + mixedPieces.join("|") + ")", "i");
        this._weekdaysShortRegex = this._weekdaysRegex;
        this._weekdaysMinRegex = this._weekdaysRegex;
        this._weekdaysStrictRegex = new RegExp(
          "^(" + longPieces.join("|") + ")",
          "i"
        );
        this._weekdaysShortStrictRegex = new RegExp(
          "^(" + shortPieces.join("|") + ")",
          "i"
        );
        this._weekdaysMinStrictRegex = new RegExp(
          "^(" + minPieces.join("|") + ")",
          "i"
        );
      }
      function hFormat() {
        return this.hours() % 12 || 12;
      }
      function kFormat() {
        return this.hours() || 24;
      }
      addFormatToken("H", ["HH", 2], 0, "hour");
      addFormatToken("h", ["hh", 2], 0, hFormat);
      addFormatToken("k", ["kk", 2], 0, kFormat);
      addFormatToken("hmm", 0, 0, function() {
        return "" + hFormat.apply(this) + zeroFill(this.minutes(), 2);
      });
      addFormatToken("hmmss", 0, 0, function() {
        return "" + hFormat.apply(this) + zeroFill(this.minutes(), 2) + zeroFill(this.seconds(), 2);
      });
      addFormatToken("Hmm", 0, 0, function() {
        return "" + this.hours() + zeroFill(this.minutes(), 2);
      });
      addFormatToken("Hmmss", 0, 0, function() {
        return "" + this.hours() + zeroFill(this.minutes(), 2) + zeroFill(this.seconds(), 2);
      });
      function meridiem(token2, lowercase) {
        addFormatToken(token2, 0, 0, function() {
          return this.localeData().meridiem(
            this.hours(),
            this.minutes(),
            lowercase
          );
        });
      }
      meridiem("a", true);
      meridiem("A", false);
      function matchMeridiem(isStrict, locale2) {
        return locale2._meridiemParse;
      }
      addRegexToken("a", matchMeridiem);
      addRegexToken("A", matchMeridiem);
      addRegexToken("H", match1to2, match1to2HasZero);
      addRegexToken("h", match1to2, match1to2NoLeadingZero);
      addRegexToken("k", match1to2, match1to2NoLeadingZero);
      addRegexToken("HH", match1to2, match2);
      addRegexToken("hh", match1to2, match2);
      addRegexToken("kk", match1to2, match2);
      addRegexToken("hmm", match3to4);
      addRegexToken("hmmss", match5to6);
      addRegexToken("Hmm", match3to4);
      addRegexToken("Hmmss", match5to6);
      addParseToken(["H", "HH"], HOUR);
      addParseToken(["k", "kk"], function(input, array, config) {
        var kInput = toInt(input);
        array[HOUR] = kInput === 24 ? 0 : kInput;
      });
      addParseToken(["a", "A"], function(input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
      });
      addParseToken(["h", "hh"], function(input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
      });
      addParseToken("hmm", function(input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
        getParsingFlags(config).bigHour = true;
      });
      addParseToken("hmmss", function(input, array, config) {
        var pos1 = input.length - 4, pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
        getParsingFlags(config).bigHour = true;
      });
      addParseToken("Hmm", function(input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
      });
      addParseToken("Hmmss", function(input, array, config) {
        var pos1 = input.length - 4, pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
      });
      function localeIsPM(input) {
        return (input + "").toLowerCase().charAt(0) === "p";
      }
      var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i, getSetHour = makeGetSet("Hours", true);
      function localeMeridiem(hours2, minutes2, isLower) {
        if (hours2 > 11) {
          return isLower ? "pm" : "PM";
        } else {
          return isLower ? "am" : "AM";
        }
      }
      var baseConfig = {
        calendar: defaultCalendar,
        longDateFormat: defaultLongDateFormat,
        invalidDate: defaultInvalidDate,
        ordinal: defaultOrdinal,
        dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
        relativeTime: defaultRelativeTime,
        months: defaultLocaleMonths,
        monthsShort: defaultLocaleMonthsShort,
        week: defaultLocaleWeek,
        weekdays: defaultLocaleWeekdays,
        weekdaysMin: defaultLocaleWeekdaysMin,
        weekdaysShort: defaultLocaleWeekdaysShort,
        meridiemParse: defaultLocaleMeridiemParse
      };
      var locales = {}, localeFamilies = {}, globalLocale;
      function commonPrefix(arr1, arr2) {
        var i, minl = Math.min(arr1.length, arr2.length);
        for (i = 0; i < minl; i += 1) {
          if (arr1[i] !== arr2[i]) {
            return i;
          }
        }
        return minl;
      }
      function normalizeLocale(key) {
        return key ? key.toLowerCase().replace("_", "-") : key;
      }
      function chooseLocale(names) {
        var i = 0, j, next, locale2, split;
        while (i < names.length) {
          split = normalizeLocale(names[i]).split("-");
          j = split.length;
          next = normalizeLocale(names[i + 1]);
          next = next ? next.split("-") : null;
          while (j > 0) {
            locale2 = loadLocale(split.slice(0, j).join("-"));
            if (locale2) {
              return locale2;
            }
            if (next && next.length >= j && commonPrefix(split, next) >= j - 1) {
              break;
            }
            j--;
          }
          i++;
        }
        return globalLocale;
      }
      function isLocaleNameSane(name) {
        return !!(name && name.match("^[^/\\\\]*$"));
      }
      function loadLocale(name) {
        var oldLocale = null, aliasedRequire;
        if (locales[name] === void 0 && typeof module2 !== "undefined" && module2 && module2.exports && isLocaleNameSane(name)) {
          try {
            oldLocale = globalLocale._abbr;
            aliasedRequire = require;
            aliasedRequire("./locale/" + name);
            getSetGlobalLocale(oldLocale);
          } catch (e) {
            locales[name] = null;
          }
        }
        return locales[name];
      }
      function getSetGlobalLocale(key, values) {
        var data;
        if (key) {
          if (isUndefined(values)) {
            data = getLocale(key);
          } else {
            data = defineLocale(key, values);
          }
          if (data) {
            globalLocale = data;
          } else {
            if (typeof console !== "undefined" && console.warn) {
              console.warn(
                "Locale " + key + " not found. Did you forget to load it?"
              );
            }
          }
        }
        return globalLocale._abbr;
      }
      function defineLocale(name, config) {
        if (config !== null) {
          var locale2, parentConfig = baseConfig;
          config.abbr = name;
          if (locales[name] != null) {
            deprecateSimple(
              "defineLocaleOverride",
              "use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."
            );
            parentConfig = locales[name]._config;
          } else if (config.parentLocale != null) {
            if (locales[config.parentLocale] != null) {
              parentConfig = locales[config.parentLocale]._config;
            } else {
              locale2 = loadLocale(config.parentLocale);
              if (locale2 != null) {
                parentConfig = locale2._config;
              } else {
                if (!localeFamilies[config.parentLocale]) {
                  localeFamilies[config.parentLocale] = [];
                }
                localeFamilies[config.parentLocale].push({
                  name,
                  config
                });
                return null;
              }
            }
          }
          locales[name] = new Locale(mergeConfigs(parentConfig, config));
          if (localeFamilies[name]) {
            localeFamilies[name].forEach(function(x) {
              defineLocale(x.name, x.config);
            });
          }
          getSetGlobalLocale(name);
          return locales[name];
        } else {
          delete locales[name];
          return null;
        }
      }
      function updateLocale(name, config) {
        if (config != null) {
          var locale2, tmpLocale, parentConfig = baseConfig;
          if (locales[name] != null && locales[name].parentLocale != null) {
            locales[name].set(mergeConfigs(locales[name]._config, config));
          } else {
            tmpLocale = loadLocale(name);
            if (tmpLocale != null) {
              parentConfig = tmpLocale._config;
            }
            config = mergeConfigs(parentConfig, config);
            if (tmpLocale == null) {
              config.abbr = name;
            }
            locale2 = new Locale(config);
            locale2.parentLocale = locales[name];
            locales[name] = locale2;
          }
          getSetGlobalLocale(name);
        } else {
          if (locales[name] != null) {
            if (locales[name].parentLocale != null) {
              locales[name] = locales[name].parentLocale;
              if (name === getSetGlobalLocale()) {
                getSetGlobalLocale(name);
              }
            } else if (locales[name] != null) {
              delete locales[name];
            }
          }
        }
        return locales[name];
      }
      function getLocale(key) {
        var locale2;
        if (key && key._locale && key._locale._abbr) {
          key = key._locale._abbr;
        }
        if (!key) {
          return globalLocale;
        }
        if (!isArray(key)) {
          locale2 = loadLocale(key);
          if (locale2) {
            return locale2;
          }
          key = [key];
        }
        return chooseLocale(key);
      }
      function listLocales() {
        return keys(locales);
      }
      function checkOverflow(m) {
        var overflow, a = m._a;
        if (a && getParsingFlags(m).overflow === -2) {
          overflow = a[MONTH] < 0 || a[MONTH] > 11 ? MONTH : a[DATE] < 1 || a[DATE] > daysInMonth(a[YEAR], a[MONTH]) ? DATE : a[HOUR] < 0 || a[HOUR] > 24 || a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0) ? HOUR : a[MINUTE] < 0 || a[MINUTE] > 59 ? MINUTE : a[SECOND] < 0 || a[SECOND] > 59 ? SECOND : a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND : -1;
          if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
            overflow = DATE;
          }
          if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
            overflow = WEEK;
          }
          if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
            overflow = WEEKDAY;
          }
          getParsingFlags(m).overflow = overflow;
        }
        return m;
      }
      var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/, basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d|))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/, tzRegex = /Z|[+-]\d\d(?::?\d\d)?/, isoDates = [
        ["YYYYYY-MM-DD", /[+-]\d{6}-\d\d-\d\d/],
        ["YYYY-MM-DD", /\d{4}-\d\d-\d\d/],
        ["GGGG-[W]WW-E", /\d{4}-W\d\d-\d/],
        ["GGGG-[W]WW", /\d{4}-W\d\d/, false],
        ["YYYY-DDD", /\d{4}-\d{3}/],
        ["YYYY-MM", /\d{4}-\d\d/, false],
        ["YYYYYYMMDD", /[+-]\d{10}/],
        ["YYYYMMDD", /\d{8}/],
        ["GGGG[W]WWE", /\d{4}W\d{3}/],
        ["GGGG[W]WW", /\d{4}W\d{2}/, false],
        ["YYYYDDD", /\d{7}/],
        ["YYYYMM", /\d{6}/, false],
        ["YYYY", /\d{4}/, false]
      ], isoTimes = [
        ["HH:mm:ss.SSSS", /\d\d:\d\d:\d\d\.\d+/],
        ["HH:mm:ss,SSSS", /\d\d:\d\d:\d\d,\d+/],
        ["HH:mm:ss", /\d\d:\d\d:\d\d/],
        ["HH:mm", /\d\d:\d\d/],
        ["HHmmss.SSSS", /\d\d\d\d\d\d\.\d+/],
        ["HHmmss,SSSS", /\d\d\d\d\d\d,\d+/],
        ["HHmmss", /\d\d\d\d\d\d/],
        ["HHmm", /\d\d\d\d/],
        ["HH", /\d\d/]
      ], aspNetJsonRegex = /^\/?Date\((-?\d+)/i, rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/, obsOffsets = {
        UT: 0,
        GMT: 0,
        EDT: -4 * 60,
        EST: -5 * 60,
        CDT: -5 * 60,
        CST: -6 * 60,
        MDT: -6 * 60,
        MST: -7 * 60,
        PDT: -7 * 60,
        PST: -8 * 60
      };
      function configFromISO(config) {
        var i, l, string = config._i, match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string), allowTime, dateFormat, timeFormat, tzFormat, isoDatesLen = isoDates.length, isoTimesLen = isoTimes.length;
        if (match) {
          getParsingFlags(config).iso = true;
          for (i = 0, l = isoDatesLen; i < l; i++) {
            if (isoDates[i][1].exec(match[1])) {
              dateFormat = isoDates[i][0];
              allowTime = isoDates[i][2] !== false;
              break;
            }
          }
          if (dateFormat == null) {
            config._isValid = false;
            return;
          }
          if (match[3]) {
            for (i = 0, l = isoTimesLen; i < l; i++) {
              if (isoTimes[i][1].exec(match[3])) {
                timeFormat = (match[2] || " ") + isoTimes[i][0];
                break;
              }
            }
            if (timeFormat == null) {
              config._isValid = false;
              return;
            }
          }
          if (!allowTime && timeFormat != null) {
            config._isValid = false;
            return;
          }
          if (match[4]) {
            if (tzRegex.exec(match[4])) {
              tzFormat = "Z";
            } else {
              config._isValid = false;
              return;
            }
          }
          config._f = dateFormat + (timeFormat || "") + (tzFormat || "");
          configFromStringAndFormat(config);
        } else {
          config._isValid = false;
        }
      }
      function extractFromRFC2822Strings(yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
        var result = [
          untruncateYear(yearStr),
          defaultLocaleMonthsShort.indexOf(monthStr),
          parseInt(dayStr, 10),
          parseInt(hourStr, 10),
          parseInt(minuteStr, 10)
        ];
        if (secondStr) {
          result.push(parseInt(secondStr, 10));
        }
        return result;
      }
      function untruncateYear(yearStr) {
        var year = parseInt(yearStr, 10);
        if (year <= 49) {
          return 2e3 + year;
        } else if (year <= 999) {
          return 1900 + year;
        }
        return year;
      }
      function preprocessRFC2822(s) {
        return s.replace(/\([^()]*\)|[\n\t]/g, " ").replace(/(\s\s+)/g, " ").replace(/^\s\s*/, "").replace(/\s\s*$/, "");
      }
      function checkWeekday(weekdayStr, parsedInput, config) {
        if (weekdayStr) {
          var weekdayProvided = defaultLocaleWeekdaysShort.indexOf(weekdayStr), weekdayActual = new Date(
            parsedInput[0],
            parsedInput[1],
            parsedInput[2]
          ).getDay();
          if (weekdayProvided !== weekdayActual) {
            getParsingFlags(config).weekdayMismatch = true;
            config._isValid = false;
            return false;
          }
        }
        return true;
      }
      function calculateOffset(obsOffset, militaryOffset, numOffset) {
        if (obsOffset) {
          return obsOffsets[obsOffset];
        } else if (militaryOffset) {
          return 0;
        } else {
          var hm = parseInt(numOffset, 10), m = hm % 100, h = (hm - m) / 100;
          return h * 60 + m;
        }
      }
      function configFromRFC2822(config) {
        var match = rfc2822.exec(preprocessRFC2822(config._i)), parsedArray;
        if (match) {
          parsedArray = extractFromRFC2822Strings(
            match[4],
            match[3],
            match[2],
            match[5],
            match[6],
            match[7]
          );
          if (!checkWeekday(match[1], parsedArray, config)) {
            return;
          }
          config._a = parsedArray;
          config._tzm = calculateOffset(match[8], match[9], match[10]);
          config._d = createUTCDate.apply(null, config._a);
          config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
          getParsingFlags(config).rfc2822 = true;
        } else {
          config._isValid = false;
        }
      }
      function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);
        if (matched !== null) {
          config._d = /* @__PURE__ */ new Date(+matched[1]);
          return;
        }
        configFromISO(config);
        if (config._isValid === false) {
          delete config._isValid;
        } else {
          return;
        }
        configFromRFC2822(config);
        if (config._isValid === false) {
          delete config._isValid;
        } else {
          return;
        }
        if (config._strict) {
          config._isValid = false;
        } else {
          hooks.createFromInputFallback(config);
        }
      }
      hooks.createFromInputFallback = deprecate(
        "value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are discouraged. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.",
        function(config) {
          config._d = /* @__PURE__ */ new Date(config._i + (config._useUTC ? " UTC" : ""));
        }
      );
      function defaults(a, b, c) {
        if (a != null) {
          return a;
        }
        if (b != null) {
          return b;
        }
        return c;
      }
      function currentDateArray(config) {
        var nowValue = new Date(hooks.now());
        if (config._useUTC) {
          return [
            nowValue.getUTCFullYear(),
            nowValue.getUTCMonth(),
            nowValue.getUTCDate()
          ];
        }
        return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
      }
      function configFromArray(config) {
        var i, date, input = [], currentDate, expectedWeekday, yearToUse;
        if (config._d) {
          return;
        }
        currentDate = currentDateArray(config);
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
          dayOfYearFromWeekInfo(config);
        }
        if (config._dayOfYear != null) {
          yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);
          if (config._dayOfYear > daysInYear(yearToUse) || config._dayOfYear === 0) {
            getParsingFlags(config)._overflowDayOfYear = true;
          }
          date = createUTCDate(yearToUse, 0, config._dayOfYear);
          config._a[MONTH] = date.getUTCMonth();
          config._a[DATE] = date.getUTCDate();
        }
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
          config._a[i] = input[i] = currentDate[i];
        }
        for (; i < 7; i++) {
          config._a[i] = input[i] = config._a[i] == null ? i === 2 ? 1 : 0 : config._a[i];
        }
        if (config._a[HOUR] === 24 && config._a[MINUTE] === 0 && config._a[SECOND] === 0 && config._a[MILLISECOND] === 0) {
          config._nextDay = true;
          config._a[HOUR] = 0;
        }
        config._d = (config._useUTC ? createUTCDate : createDate).apply(
          null,
          input
        );
        expectedWeekday = config._useUTC ? config._d.getUTCDay() : config._d.getDay();
        if (config._tzm != null) {
          config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }
        if (config._nextDay) {
          config._a[HOUR] = 24;
        }
        if (config._w && typeof config._w.d !== "undefined" && config._w.d !== expectedWeekday) {
          getParsingFlags(config).weekdayMismatch = true;
        }
      }
      function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow, curWeek;
        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
          dow = 1;
          doy = 4;
          weekYear = defaults(
            w.GG,
            config._a[YEAR],
            weekOfYear(createLocal(), 1, 4).year
          );
          week = defaults(w.W, 1);
          weekday = defaults(w.E, 1);
          if (weekday < 1 || weekday > 7) {
            weekdayOverflow = true;
          }
        } else {
          dow = config._locale._week.dow;
          doy = config._locale._week.doy;
          curWeek = weekOfYear(createLocal(), dow, doy);
          weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);
          week = defaults(w.w, curWeek.week);
          if (w.d != null) {
            weekday = w.d;
            if (weekday < 0 || weekday > 6) {
              weekdayOverflow = true;
            }
          } else if (w.e != null) {
            weekday = w.e + dow;
            if (w.e < 0 || w.e > 6) {
              weekdayOverflow = true;
            }
          } else {
            weekday = dow;
          }
        }
        if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
          getParsingFlags(config)._overflowWeeks = true;
        } else if (weekdayOverflow != null) {
          getParsingFlags(config)._overflowWeekday = true;
        } else {
          temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
          config._a[YEAR] = temp.year;
          config._dayOfYear = temp.dayOfYear;
        }
      }
      hooks.ISO_8601 = function() {
      };
      hooks.RFC_2822 = function() {
      };
      function configFromStringAndFormat(config) {
        if (config._f === hooks.ISO_8601) {
          configFromISO(config);
          return;
        }
        if (config._f === hooks.RFC_2822) {
          configFromRFC2822(config);
          return;
        }
        config._a = [];
        getParsingFlags(config).empty = true;
        var string = "" + config._i, i, parsedInput, tokens2, token2, skipped, stringLength = string.length, totalParsedInputLength = 0, era, tokenLen;
        tokens2 = expandFormat(config._f, config._locale).match(formattingTokens) || [];
        tokenLen = tokens2.length;
        for (i = 0; i < tokenLen; i++) {
          token2 = tokens2[i];
          parsedInput = (string.match(getParseRegexForToken(token2, config)) || [])[0];
          if (parsedInput) {
            skipped = string.substr(0, string.indexOf(parsedInput));
            if (skipped.length > 0) {
              getParsingFlags(config).unusedInput.push(skipped);
            }
            string = string.slice(
              string.indexOf(parsedInput) + parsedInput.length
            );
            totalParsedInputLength += parsedInput.length;
          }
          if (formatTokenFunctions[token2]) {
            if (parsedInput) {
              getParsingFlags(config).empty = false;
            } else {
              getParsingFlags(config).unusedTokens.push(token2);
            }
            addTimeToArrayFromToken(token2, parsedInput, config);
          } else if (config._strict && !parsedInput) {
            getParsingFlags(config).unusedTokens.push(token2);
          }
        }
        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
          getParsingFlags(config).unusedInput.push(string);
        }
        if (config._a[HOUR] <= 12 && getParsingFlags(config).bigHour === true && config._a[HOUR] > 0) {
          getParsingFlags(config).bigHour = void 0;
        }
        getParsingFlags(config).parsedDateParts = config._a.slice(0);
        getParsingFlags(config).meridiem = config._meridiem;
        config._a[HOUR] = meridiemFixWrap(
          config._locale,
          config._a[HOUR],
          config._meridiem
        );
        era = getParsingFlags(config).era;
        if (era !== null) {
          config._a[YEAR] = config._locale.erasConvertYear(era, config._a[YEAR]);
        }
        configFromArray(config);
        checkOverflow(config);
      }
      function meridiemFixWrap(locale2, hour, meridiem2) {
        var isPm;
        if (meridiem2 == null) {
          return hour;
        }
        if (locale2.meridiemHour != null) {
          return locale2.meridiemHour(hour, meridiem2);
        } else if (locale2.isPM != null) {
          isPm = locale2.isPM(meridiem2);
          if (isPm && hour < 12) {
            hour += 12;
          }
          if (!isPm && hour === 12) {
            hour = 0;
          }
          return hour;
        } else {
          return hour;
        }
      }
      function configFromStringAndArray(config) {
        var tempConfig, bestMoment, scoreToBeat, i, currentScore, validFormatFound, bestFormatIsValid = false, configfLen = config._f.length;
        if (configfLen === 0) {
          getParsingFlags(config).invalidFormat = true;
          config._d = /* @__PURE__ */ new Date(NaN);
          return;
        }
        for (i = 0; i < configfLen; i++) {
          currentScore = 0;
          validFormatFound = false;
          tempConfig = copyConfig({}, config);
          if (config._useUTC != null) {
            tempConfig._useUTC = config._useUTC;
          }
          tempConfig._f = config._f[i];
          configFromStringAndFormat(tempConfig);
          if (isValid(tempConfig)) {
            validFormatFound = true;
          }
          currentScore += getParsingFlags(tempConfig).charsLeftOver;
          currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;
          getParsingFlags(tempConfig).score = currentScore;
          if (!bestFormatIsValid) {
            if (scoreToBeat == null || currentScore < scoreToBeat || validFormatFound) {
              scoreToBeat = currentScore;
              bestMoment = tempConfig;
              if (validFormatFound) {
                bestFormatIsValid = true;
              }
            }
          } else {
            if (currentScore < scoreToBeat) {
              scoreToBeat = currentScore;
              bestMoment = tempConfig;
            }
          }
        }
        extend(config, bestMoment || tempConfig);
      }
      function configFromObject(config) {
        if (config._d) {
          return;
        }
        var i = normalizeObjectUnits(config._i), dayOrDate = i.day === void 0 ? i.date : i.day;
        config._a = map(
          [i.year, i.month, dayOrDate, i.hour, i.minute, i.second, i.millisecond],
          function(obj) {
            return obj && parseInt(obj, 10);
          }
        );
        configFromArray(config);
      }
      function createFromConfig(config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
          res.add(1, "d");
          res._nextDay = void 0;
        }
        return res;
      }
      function prepareConfig(config) {
        var input = config._i, format2 = config._f;
        config._locale = config._locale || getLocale(config._l);
        if (input === null || format2 === void 0 && input === "") {
          return createInvalid({ nullInput: true });
        }
        if (typeof input === "string") {
          config._i = input = config._locale.preparse(input);
        }
        if (isMoment(input)) {
          return new Moment(checkOverflow(input));
        } else if (isDate(input)) {
          config._d = input;
        } else if (isArray(format2)) {
          configFromStringAndArray(config);
        } else if (format2) {
          configFromStringAndFormat(config);
        } else {
          configFromInput(config);
        }
        if (!isValid(config)) {
          config._d = null;
        }
        return config;
      }
      function configFromInput(config) {
        var input = config._i;
        if (isUndefined(input)) {
          config._d = new Date(hooks.now());
        } else if (isDate(input)) {
          config._d = new Date(input.valueOf());
        } else if (typeof input === "string") {
          configFromString(config);
        } else if (isArray(input)) {
          config._a = map(input.slice(0), function(obj) {
            return parseInt(obj, 10);
          });
          configFromArray(config);
        } else if (isObject(input)) {
          configFromObject(config);
        } else if (isNumber(input)) {
          config._d = new Date(input);
        } else {
          hooks.createFromInputFallback(config);
        }
      }
      function createLocalOrUTC(input, format2, locale2, strict, isUTC) {
        var c = {};
        if (format2 === true || format2 === false) {
          strict = format2;
          format2 = void 0;
        }
        if (locale2 === true || locale2 === false) {
          strict = locale2;
          locale2 = void 0;
        }
        if (isObject(input) && isObjectEmpty(input) || isArray(input) && input.length === 0) {
          input = void 0;
        }
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale2;
        c._i = input;
        c._f = format2;
        c._strict = strict;
        return createFromConfig(c);
      }
      function createLocal(input, format2, locale2, strict) {
        return createLocalOrUTC(input, format2, locale2, strict, false);
      }
      var prototypeMin = deprecate(
        "moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/",
        function() {
          var other = createLocal.apply(null, arguments);
          if (this.isValid() && other.isValid()) {
            return other < this ? this : other;
          } else {
            return createInvalid();
          }
        }
      ), prototypeMax = deprecate(
        "moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/",
        function() {
          var other = createLocal.apply(null, arguments);
          if (this.isValid() && other.isValid()) {
            return other > this ? this : other;
          } else {
            return createInvalid();
          }
        }
      );
      function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
          moments = moments[0];
        }
        if (!moments.length) {
          return createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
          if (!moments[i].isValid() || moments[i][fn](res)) {
            res = moments[i];
          }
        }
        return res;
      }
      function min() {
        var args = [].slice.call(arguments, 0);
        return pickBy("isBefore", args);
      }
      function max() {
        var args = [].slice.call(arguments, 0);
        return pickBy("isAfter", args);
      }
      var now = function() {
        return Date.now ? Date.now() : +/* @__PURE__ */ new Date();
      };
      var ordering = [
        "year",
        "quarter",
        "month",
        "week",
        "day",
        "hour",
        "minute",
        "second",
        "millisecond"
      ];
      function isDurationValid(m) {
        var key, unitHasDecimal = false, i, orderLen = ordering.length;
        for (key in m) {
          if (hasOwnProp(m, key) && !(indexOf.call(ordering, key) !== -1 && (m[key] == null || !isNaN(m[key])))) {
            return false;
          }
        }
        for (i = 0; i < orderLen; ++i) {
          if (m[ordering[i]]) {
            if (unitHasDecimal) {
              return false;
            }
            if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
              unitHasDecimal = true;
            }
          }
        }
        return true;
      }
      function isValid$1() {
        return this._isValid;
      }
      function createInvalid$1() {
        return createDuration(NaN);
      }
      function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration), years2 = normalizedInput.year || 0, quarters = normalizedInput.quarter || 0, months2 = normalizedInput.month || 0, weeks2 = normalizedInput.week || normalizedInput.isoWeek || 0, days2 = normalizedInput.day || 0, hours2 = normalizedInput.hour || 0, minutes2 = normalizedInput.minute || 0, seconds2 = normalizedInput.second || 0, milliseconds2 = normalizedInput.millisecond || 0;
        this._isValid = isDurationValid(normalizedInput);
        this._milliseconds = +milliseconds2 + seconds2 * 1e3 + // 1000
        minutes2 * 6e4 + // 1000 * 60
        hours2 * 1e3 * 60 * 60;
        this._days = +days2 + weeks2 * 7;
        this._months = +months2 + quarters * 3 + years2 * 12;
        this._data = {};
        this._locale = getLocale();
        this._bubble();
      }
      function isDuration(obj) {
        return obj instanceof Duration;
      }
      function absRound(number) {
        if (number < 0) {
          return Math.round(-1 * number) * -1;
        } else {
          return Math.round(number);
        }
      }
      function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length), lengthDiff = Math.abs(array1.length - array2.length), diffs = 0, i;
        for (i = 0; i < len; i++) {
          if (dontConvert && array1[i] !== array2[i] || !dontConvert && toInt(array1[i]) !== toInt(array2[i])) {
            diffs++;
          }
        }
        return diffs + lengthDiff;
      }
      function offset(token2, separator) {
        addFormatToken(token2, 0, 0, function() {
          var offset2 = this.utcOffset(), sign2 = "+";
          if (offset2 < 0) {
            offset2 = -offset2;
            sign2 = "-";
          }
          return sign2 + zeroFill(~~(offset2 / 60), 2) + separator + zeroFill(~~offset2 % 60, 2);
        });
      }
      offset("Z", ":");
      offset("ZZ", "");
      addRegexToken("Z", matchShortOffset);
      addRegexToken("ZZ", matchShortOffset);
      addParseToken(["Z", "ZZ"], function(input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(matchShortOffset, input);
      });
      var chunkOffset = /([\+\-]|\d\d)/gi;
      function offsetFromString(matcher, string) {
        var matches = (string || "").match(matcher), chunk, parts, minutes2;
        if (matches === null) {
          return null;
        }
        chunk = matches[matches.length - 1] || [];
        parts = (chunk + "").match(chunkOffset) || ["-", 0, 0];
        minutes2 = +(parts[1] * 60) + toInt(parts[2]);
        return minutes2 === 0 ? 0 : parts[0] === "+" ? minutes2 : -minutes2;
      }
      function cloneWithOffset(input, model) {
        var res, diff2;
        if (model._isUTC) {
          res = model.clone();
          diff2 = (isMoment(input) || isDate(input) ? input.valueOf() : createLocal(input).valueOf()) - res.valueOf();
          res._d.setTime(res._d.valueOf() + diff2);
          hooks.updateOffset(res, false);
          return res;
        } else {
          return createLocal(input).local();
        }
      }
      function getDateOffset(m) {
        return -Math.round(m._d.getTimezoneOffset());
      }
      hooks.updateOffset = function() {
      };
      function getSetOffset(input, keepLocalTime, keepMinutes) {
        var offset2 = this._offset || 0, localAdjust;
        if (!this.isValid()) {
          return input != null ? this : NaN;
        }
        if (input != null) {
          if (typeof input === "string") {
            input = offsetFromString(matchShortOffset, input);
            if (input === null) {
              return this;
            }
          } else if (Math.abs(input) < 16 && !keepMinutes) {
            input = input * 60;
          }
          if (!this._isUTC && keepLocalTime) {
            localAdjust = getDateOffset(this);
          }
          this._offset = input;
          this._isUTC = true;
          if (localAdjust != null) {
            this.add(localAdjust, "m");
          }
          if (offset2 !== input) {
            if (!keepLocalTime || this._changeInProgress) {
              addSubtract(
                this,
                createDuration(input - offset2, "m"),
                1,
                false
              );
            } else if (!this._changeInProgress) {
              this._changeInProgress = true;
              hooks.updateOffset(this, true);
              this._changeInProgress = null;
            }
          }
          return this;
        } else {
          return this._isUTC ? offset2 : getDateOffset(this);
        }
      }
      function getSetZone(input, keepLocalTime) {
        if (input != null) {
          if (typeof input !== "string") {
            input = -input;
          }
          this.utcOffset(input, keepLocalTime);
          return this;
        } else {
          return -this.utcOffset();
        }
      }
      function setOffsetToUTC(keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
      }
      function setOffsetToLocal(keepLocalTime) {
        if (this._isUTC) {
          this.utcOffset(0, keepLocalTime);
          this._isUTC = false;
          if (keepLocalTime) {
            this.subtract(getDateOffset(this), "m");
          }
        }
        return this;
      }
      function setOffsetToParsedOffset() {
        if (this._tzm != null) {
          this.utcOffset(this._tzm, false, true);
        } else if (typeof this._i === "string") {
          var tZone = offsetFromString(matchOffset, this._i);
          if (tZone != null) {
            this.utcOffset(tZone);
          } else {
            this.utcOffset(0, true);
          }
        }
        return this;
      }
      function hasAlignedHourOffset(input) {
        if (!this.isValid()) {
          return false;
        }
        input = input ? createLocal(input).utcOffset() : 0;
        return (this.utcOffset() - input) % 60 === 0;
      }
      function isDaylightSavingTime() {
        return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset();
      }
      function isDaylightSavingTimeShifted() {
        if (!isUndefined(this._isDSTShifted)) {
          return this._isDSTShifted;
        }
        var c = {}, other;
        copyConfig(c, this);
        c = prepareConfig(c);
        if (c._a) {
          other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
          this._isDSTShifted = this.isValid() && compareArrays(c._a, other.toArray()) > 0;
        } else {
          this._isDSTShifted = false;
        }
        return this._isDSTShifted;
      }
      function isLocal() {
        return this.isValid() ? !this._isUTC : false;
      }
      function isUtcOffset() {
        return this.isValid() ? this._isUTC : false;
      }
      function isUtc() {
        return this.isValid() ? this._isUTC && this._offset === 0 : false;
      }
      var aspNetRegex = /^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/, isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;
      function createDuration(input, key) {
        var duration = input, match = null, sign2, ret, diffRes;
        if (isDuration(input)) {
          duration = {
            ms: input._milliseconds,
            d: input._days,
            M: input._months
          };
        } else if (isNumber(input) || !isNaN(+input)) {
          duration = {};
          if (key) {
            duration[key] = +input;
          } else {
            duration.milliseconds = +input;
          }
        } else if (match = aspNetRegex.exec(input)) {
          sign2 = match[1] === "-" ? -1 : 1;
          duration = {
            y: 0,
            d: toInt(match[DATE]) * sign2,
            h: toInt(match[HOUR]) * sign2,
            m: toInt(match[MINUTE]) * sign2,
            s: toInt(match[SECOND]) * sign2,
            ms: toInt(absRound(match[MILLISECOND] * 1e3)) * sign2
            // the millisecond decimal point is included in the match
          };
        } else if (match = isoRegex.exec(input)) {
          sign2 = match[1] === "-" ? -1 : 1;
          duration = {
            y: parseIso(match[2], sign2),
            M: parseIso(match[3], sign2),
            w: parseIso(match[4], sign2),
            d: parseIso(match[5], sign2),
            h: parseIso(match[6], sign2),
            m: parseIso(match[7], sign2),
            s: parseIso(match[8], sign2)
          };
        } else if (duration == null) {
          duration = {};
        } else if (typeof duration === "object" && ("from" in duration || "to" in duration)) {
          diffRes = momentsDifference(
            createLocal(duration.from),
            createLocal(duration.to)
          );
          duration = {};
          duration.ms = diffRes.milliseconds;
          duration.M = diffRes.months;
        }
        ret = new Duration(duration);
        if (isDuration(input) && hasOwnProp(input, "_locale")) {
          ret._locale = input._locale;
        }
        if (isDuration(input) && hasOwnProp(input, "_isValid")) {
          ret._isValid = input._isValid;
        }
        return ret;
      }
      createDuration.fn = Duration.prototype;
      createDuration.invalid = createInvalid$1;
      function parseIso(inp, sign2) {
        var res = inp && parseFloat(inp.replace(",", "."));
        return (isNaN(res) ? 0 : res) * sign2;
      }
      function positiveMomentsDifference(base, other) {
        var res = {};
        res.months = other.month() - base.month() + (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, "M").isAfter(other)) {
          --res.months;
        }
        res.milliseconds = +other - +base.clone().add(res.months, "M");
        return res;
      }
      function momentsDifference(base, other) {
        var res;
        if (!(base.isValid() && other.isValid())) {
          return { milliseconds: 0, months: 0 };
        }
        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
          res = positiveMomentsDifference(base, other);
        } else {
          res = positiveMomentsDifference(other, base);
          res.milliseconds = -res.milliseconds;
          res.months = -res.months;
        }
        return res;
      }
      function createAdder(direction, name) {
        return function(val, period) {
          var dur, tmp;
          if (period !== null && !isNaN(+period)) {
            deprecateSimple(
              name,
              "moment()." + name + "(period, number) is deprecated. Please use moment()." + name + "(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."
            );
            tmp = val;
            val = period;
            period = tmp;
          }
          dur = createDuration(val, period);
          addSubtract(this, dur, direction);
          return this;
        };
      }
      function addSubtract(mom, duration, isAdding, updateOffset) {
        var milliseconds2 = duration._milliseconds, days2 = absRound(duration._days), months2 = absRound(duration._months);
        if (!mom.isValid()) {
          return;
        }
        updateOffset = updateOffset == null ? true : updateOffset;
        if (months2) {
          setMonth(mom, get(mom, "Month") + months2 * isAdding);
        }
        if (days2) {
          set$1(mom, "Date", get(mom, "Date") + days2 * isAdding);
        }
        if (milliseconds2) {
          mom._d.setTime(mom._d.valueOf() + milliseconds2 * isAdding);
        }
        if (updateOffset) {
          hooks.updateOffset(mom, days2 || months2);
        }
      }
      var add = createAdder(1, "add"), subtract = createAdder(-1, "subtract");
      function isString(input) {
        return typeof input === "string" || input instanceof String;
      }
      function isMomentInput(input) {
        return isMoment(input) || isDate(input) || isString(input) || isNumber(input) || isNumberOrStringArray(input) || isMomentInputObject(input) || input === null || input === void 0;
      }
      function isMomentInputObject(input) {
        var objectTest = isObject(input) && !isObjectEmpty(input), propertyTest = false, properties = [
          "years",
          "year",
          "y",
          "months",
          "month",
          "M",
          "days",
          "day",
          "d",
          "dates",
          "date",
          "D",
          "hours",
          "hour",
          "h",
          "minutes",
          "minute",
          "m",
          "seconds",
          "second",
          "s",
          "milliseconds",
          "millisecond",
          "ms"
        ], i, property, propertyLen = properties.length;
        for (i = 0; i < propertyLen; i += 1) {
          property = properties[i];
          propertyTest = propertyTest || hasOwnProp(input, property);
        }
        return objectTest && propertyTest;
      }
      function isNumberOrStringArray(input) {
        var arrayTest = isArray(input), dataTypeTest = false;
        if (arrayTest) {
          dataTypeTest = input.filter(function(item) {
            return !isNumber(item) && isString(input);
          }).length === 0;
        }
        return arrayTest && dataTypeTest;
      }
      function isCalendarSpec(input) {
        var objectTest = isObject(input) && !isObjectEmpty(input), propertyTest = false, properties = [
          "sameDay",
          "nextDay",
          "lastDay",
          "nextWeek",
          "lastWeek",
          "sameElse"
        ], i, property;
        for (i = 0; i < properties.length; i += 1) {
          property = properties[i];
          propertyTest = propertyTest || hasOwnProp(input, property);
        }
        return objectTest && propertyTest;
      }
      function getCalendarFormat(myMoment, now2) {
        var diff2 = myMoment.diff(now2, "days", true);
        return diff2 < -6 ? "sameElse" : diff2 < -1 ? "lastWeek" : diff2 < 0 ? "lastDay" : diff2 < 1 ? "sameDay" : diff2 < 2 ? "nextDay" : diff2 < 7 ? "nextWeek" : "sameElse";
      }
      function calendar$1(time, formats) {
        if (arguments.length === 1) {
          if (!arguments[0]) {
            time = void 0;
            formats = void 0;
          } else if (isMomentInput(arguments[0])) {
            time = arguments[0];
            formats = void 0;
          } else if (isCalendarSpec(arguments[0])) {
            formats = arguments[0];
            time = void 0;
          }
        }
        var now2 = time || createLocal(), sod = cloneWithOffset(now2, this).startOf("day"), format2 = hooks.calendarFormat(this, sod) || "sameElse", output = formats && (isFunction(formats[format2]) ? formats[format2].call(this, now2) : formats[format2]);
        return this.format(
          output || this.localeData().calendar(format2, this, createLocal(now2))
        );
      }
      function clone() {
        return new Moment(this);
      }
      function isAfter(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
          return false;
        }
        units = normalizeUnits(units) || "millisecond";
        if (units === "millisecond") {
          return this.valueOf() > localInput.valueOf();
        } else {
          return localInput.valueOf() < this.clone().startOf(units).valueOf();
        }
      }
      function isBefore(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
          return false;
        }
        units = normalizeUnits(units) || "millisecond";
        if (units === "millisecond") {
          return this.valueOf() < localInput.valueOf();
        } else {
          return this.clone().endOf(units).valueOf() < localInput.valueOf();
        }
      }
      function isBetween(from2, to2, units, inclusivity) {
        var localFrom = isMoment(from2) ? from2 : createLocal(from2), localTo = isMoment(to2) ? to2 : createLocal(to2);
        if (!(this.isValid() && localFrom.isValid() && localTo.isValid())) {
          return false;
        }
        inclusivity = inclusivity || "()";
        return (inclusivity[0] === "(" ? this.isAfter(localFrom, units) : !this.isBefore(localFrom, units)) && (inclusivity[1] === ")" ? this.isBefore(localTo, units) : !this.isAfter(localTo, units));
      }
      function isSame(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input), inputMs;
        if (!(this.isValid() && localInput.isValid())) {
          return false;
        }
        units = normalizeUnits(units) || "millisecond";
        if (units === "millisecond") {
          return this.valueOf() === localInput.valueOf();
        } else {
          inputMs = localInput.valueOf();
          return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
        }
      }
      function isSameOrAfter(input, units) {
        return this.isSame(input, units) || this.isAfter(input, units);
      }
      function isSameOrBefore(input, units) {
        return this.isSame(input, units) || this.isBefore(input, units);
      }
      function diff(input, units, asFloat) {
        var that, zoneDelta, output;
        if (!this.isValid()) {
          return NaN;
        }
        that = cloneWithOffset(input, this);
        if (!that.isValid()) {
          return NaN;
        }
        zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;
        units = normalizeUnits(units);
        switch (units) {
          case "year":
            output = monthDiff(this, that) / 12;
            break;
          case "month":
            output = monthDiff(this, that);
            break;
          case "quarter":
            output = monthDiff(this, that) / 3;
            break;
          case "second":
            output = (this - that) / 1e3;
            break;
          // 1000
          case "minute":
            output = (this - that) / 6e4;
            break;
          // 1000 * 60
          case "hour":
            output = (this - that) / 36e5;
            break;
          // 1000 * 60 * 60
          case "day":
            output = (this - that - zoneDelta) / 864e5;
            break;
          // 1000 * 60 * 60 * 24, negate dst
          case "week":
            output = (this - that - zoneDelta) / 6048e5;
            break;
          // 1000 * 60 * 60 * 24 * 7, negate dst
          default:
            output = this - that;
        }
        return asFloat ? output : absFloor(output);
      }
      function monthDiff(a, b) {
        if (a.date() < b.date()) {
          return -monthDiff(b, a);
        }
        var wholeMonthDiff = (b.year() - a.year()) * 12 + (b.month() - a.month()), anchor = a.clone().add(wholeMonthDiff, "months"), anchor2, adjust;
        if (b - anchor < 0) {
          anchor2 = a.clone().add(wholeMonthDiff - 1, "months");
          adjust = (b - anchor) / (anchor - anchor2);
        } else {
          anchor2 = a.clone().add(wholeMonthDiff + 1, "months");
          adjust = (b - anchor) / (anchor2 - anchor);
        }
        return -(wholeMonthDiff + adjust) || 0;
      }
      hooks.defaultFormat = "YYYY-MM-DDTHH:mm:ssZ";
      hooks.defaultFormatUtc = "YYYY-MM-DDTHH:mm:ss[Z]";
      function toString() {
        return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
      }
      function toISOString(keepOffset) {
        if (!this.isValid()) {
          return null;
        }
        var utc = keepOffset !== true, m = utc ? this.clone().utc() : this;
        if (m.year() < 0 || m.year() > 9999) {
          return formatMoment(
            m,
            utc ? "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]" : "YYYYYY-MM-DD[T]HH:mm:ss.SSSZ"
          );
        }
        if (isFunction(Date.prototype.toISOString)) {
          if (utc) {
            return this.toDate().toISOString();
          } else {
            return new Date(this.valueOf() + this.utcOffset() * 60 * 1e3).toISOString().replace("Z", formatMoment(m, "Z"));
          }
        }
        return formatMoment(
          m,
          utc ? "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]" : "YYYY-MM-DD[T]HH:mm:ss.SSSZ"
        );
      }
      function inspect() {
        if (!this.isValid()) {
          return "moment.invalid(/* " + this._i + " */)";
        }
        var func = "moment", zone = "", prefix, year, datetime, suffix;
        if (!this.isLocal()) {
          func = this.utcOffset() === 0 ? "moment.utc" : "moment.parseZone";
          zone = "Z";
        }
        prefix = "[" + func + '("]';
        year = 0 <= this.year() && this.year() <= 9999 ? "YYYY" : "YYYYYY";
        datetime = "-MM-DD[T]HH:mm:ss.SSS";
        suffix = zone + '[")]';
        return this.format(prefix + year + datetime + suffix);
      }
      function format(inputString) {
        if (!inputString) {
          inputString = this.isUtc() ? hooks.defaultFormatUtc : hooks.defaultFormat;
        }
        var output = formatMoment(this, inputString);
        return this.localeData().postformat(output);
      }
      function from(time, withoutSuffix) {
        if (this.isValid() && (isMoment(time) && time.isValid() || createLocal(time).isValid())) {
          return createDuration({ to: this, from: time }).locale(this.locale()).humanize(!withoutSuffix);
        } else {
          return this.localeData().invalidDate();
        }
      }
      function fromNow(withoutSuffix) {
        return this.from(createLocal(), withoutSuffix);
      }
      function to(time, withoutSuffix) {
        if (this.isValid() && (isMoment(time) && time.isValid() || createLocal(time).isValid())) {
          return createDuration({ from: this, to: time }).locale(this.locale()).humanize(!withoutSuffix);
        } else {
          return this.localeData().invalidDate();
        }
      }
      function toNow(withoutSuffix) {
        return this.to(createLocal(), withoutSuffix);
      }
      function locale(key) {
        var newLocaleData;
        if (key === void 0) {
          return this._locale._abbr;
        } else {
          newLocaleData = getLocale(key);
          if (newLocaleData != null) {
            this._locale = newLocaleData;
          }
          return this;
        }
      }
      var lang = deprecate(
        "moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",
        function(key) {
          if (key === void 0) {
            return this.localeData();
          } else {
            return this.locale(key);
          }
        }
      );
      function localeData() {
        return this._locale;
      }
      var MS_PER_SECOND = 1e3, MS_PER_MINUTE = 60 * MS_PER_SECOND, MS_PER_HOUR = 60 * MS_PER_MINUTE, MS_PER_400_YEARS = (365 * 400 + 97) * 24 * MS_PER_HOUR;
      function mod$1(dividend, divisor) {
        return (dividend % divisor + divisor) % divisor;
      }
      function localStartOfDate(y, m, d) {
        if (y < 100 && y >= 0) {
          return new Date(y + 400, m, d) - MS_PER_400_YEARS;
        } else {
          return new Date(y, m, d).valueOf();
        }
      }
      function utcStartOfDate(y, m, d) {
        if (y < 100 && y >= 0) {
          return Date.UTC(y + 400, m, d) - MS_PER_400_YEARS;
        } else {
          return Date.UTC(y, m, d);
        }
      }
      function startOf(units) {
        var time, startOfDate;
        units = normalizeUnits(units);
        if (units === void 0 || units === "millisecond" || !this.isValid()) {
          return this;
        }
        startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;
        switch (units) {
          case "year":
            time = startOfDate(this.year(), 0, 1);
            break;
          case "quarter":
            time = startOfDate(
              this.year(),
              this.month() - this.month() % 3,
              1
            );
            break;
          case "month":
            time = startOfDate(this.year(), this.month(), 1);
            break;
          case "week":
            time = startOfDate(
              this.year(),
              this.month(),
              this.date() - this.weekday()
            );
            break;
          case "isoWeek":
            time = startOfDate(
              this.year(),
              this.month(),
              this.date() - (this.isoWeekday() - 1)
            );
            break;
          case "day":
          case "date":
            time = startOfDate(this.year(), this.month(), this.date());
            break;
          case "hour":
            time = this._d.valueOf();
            time -= mod$1(
              time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE),
              MS_PER_HOUR
            );
            break;
          case "minute":
            time = this._d.valueOf();
            time -= mod$1(time, MS_PER_MINUTE);
            break;
          case "second":
            time = this._d.valueOf();
            time -= mod$1(time, MS_PER_SECOND);
            break;
        }
        this._d.setTime(time);
        hooks.updateOffset(this, true);
        return this;
      }
      function endOf(units) {
        var time, startOfDate;
        units = normalizeUnits(units);
        if (units === void 0 || units === "millisecond" || !this.isValid()) {
          return this;
        }
        startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;
        switch (units) {
          case "year":
            time = startOfDate(this.year() + 1, 0, 1) - 1;
            break;
          case "quarter":
            time = startOfDate(
              this.year(),
              this.month() - this.month() % 3 + 3,
              1
            ) - 1;
            break;
          case "month":
            time = startOfDate(this.year(), this.month() + 1, 1) - 1;
            break;
          case "week":
            time = startOfDate(
              this.year(),
              this.month(),
              this.date() - this.weekday() + 7
            ) - 1;
            break;
          case "isoWeek":
            time = startOfDate(
              this.year(),
              this.month(),
              this.date() - (this.isoWeekday() - 1) + 7
            ) - 1;
            break;
          case "day":
          case "date":
            time = startOfDate(this.year(), this.month(), this.date() + 1) - 1;
            break;
          case "hour":
            time = this._d.valueOf();
            time += MS_PER_HOUR - mod$1(
              time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE),
              MS_PER_HOUR
            ) - 1;
            break;
          case "minute":
            time = this._d.valueOf();
            time += MS_PER_MINUTE - mod$1(time, MS_PER_MINUTE) - 1;
            break;
          case "second":
            time = this._d.valueOf();
            time += MS_PER_SECOND - mod$1(time, MS_PER_SECOND) - 1;
            break;
        }
        this._d.setTime(time);
        hooks.updateOffset(this, true);
        return this;
      }
      function valueOf() {
        return this._d.valueOf() - (this._offset || 0) * 6e4;
      }
      function unix() {
        return Math.floor(this.valueOf() / 1e3);
      }
      function toDate() {
        return new Date(this.valueOf());
      }
      function toArray() {
        var m = this;
        return [
          m.year(),
          m.month(),
          m.date(),
          m.hour(),
          m.minute(),
          m.second(),
          m.millisecond()
        ];
      }
      function toObject() {
        var m = this;
        return {
          years: m.year(),
          months: m.month(),
          date: m.date(),
          hours: m.hours(),
          minutes: m.minutes(),
          seconds: m.seconds(),
          milliseconds: m.milliseconds()
        };
      }
      function toJSON() {
        return this.isValid() ? this.toISOString() : null;
      }
      function isValid$2() {
        return isValid(this);
      }
      function parsingFlags() {
        return extend({}, getParsingFlags(this));
      }
      function invalidAt() {
        return getParsingFlags(this).overflow;
      }
      function creationData() {
        return {
          input: this._i,
          format: this._f,
          locale: this._locale,
          isUTC: this._isUTC,
          strict: this._strict
        };
      }
      addFormatToken("N", 0, 0, "eraAbbr");
      addFormatToken("NN", 0, 0, "eraAbbr");
      addFormatToken("NNN", 0, 0, "eraAbbr");
      addFormatToken("NNNN", 0, 0, "eraName");
      addFormatToken("NNNNN", 0, 0, "eraNarrow");
      addFormatToken("y", ["y", 1], "yo", "eraYear");
      addFormatToken("y", ["yy", 2], 0, "eraYear");
      addFormatToken("y", ["yyy", 3], 0, "eraYear");
      addFormatToken("y", ["yyyy", 4], 0, "eraYear");
      addRegexToken("N", matchEraAbbr);
      addRegexToken("NN", matchEraAbbr);
      addRegexToken("NNN", matchEraAbbr);
      addRegexToken("NNNN", matchEraName);
      addRegexToken("NNNNN", matchEraNarrow);
      addParseToken(
        ["N", "NN", "NNN", "NNNN", "NNNNN"],
        function(input, array, config, token2) {
          var era = config._locale.erasParse(input, token2, config._strict);
          if (era) {
            getParsingFlags(config).era = era;
          } else {
            getParsingFlags(config).invalidEra = input;
          }
        }
      );
      addRegexToken("y", matchUnsigned);
      addRegexToken("yy", matchUnsigned);
      addRegexToken("yyy", matchUnsigned);
      addRegexToken("yyyy", matchUnsigned);
      addRegexToken("yo", matchEraYearOrdinal);
      addParseToken(["y", "yy", "yyy", "yyyy"], YEAR);
      addParseToken(["yo"], function(input, array, config, token2) {
        var match;
        if (config._locale._eraYearOrdinalRegex) {
          match = input.match(config._locale._eraYearOrdinalRegex);
        }
        if (config._locale.eraYearOrdinalParse) {
          array[YEAR] = config._locale.eraYearOrdinalParse(input, match);
        } else {
          array[YEAR] = parseInt(input, 10);
        }
      });
      function localeEras(m, format2) {
        var i, l, date, eras = this._eras || getLocale("en")._eras;
        for (i = 0, l = eras.length; i < l; ++i) {
          switch (typeof eras[i].since) {
            case "string":
              date = hooks(eras[i].since).startOf("day");
              eras[i].since = date.valueOf();
              break;
          }
          switch (typeof eras[i].until) {
            case "undefined":
              eras[i].until = Infinity;
              break;
            case "string":
              date = hooks(eras[i].until).startOf("day").valueOf();
              eras[i].until = date.valueOf();
              break;
          }
        }
        return eras;
      }
      function localeErasParse(eraName, format2, strict) {
        var i, l, eras = this.eras(), name, abbr, narrow;
        eraName = eraName.toUpperCase();
        for (i = 0, l = eras.length; i < l; ++i) {
          name = eras[i].name.toUpperCase();
          abbr = eras[i].abbr.toUpperCase();
          narrow = eras[i].narrow.toUpperCase();
          if (strict) {
            switch (format2) {
              case "N":
              case "NN":
              case "NNN":
                if (abbr === eraName) {
                  return eras[i];
                }
                break;
              case "NNNN":
                if (name === eraName) {
                  return eras[i];
                }
                break;
              case "NNNNN":
                if (narrow === eraName) {
                  return eras[i];
                }
                break;
            }
          } else if ([name, abbr, narrow].indexOf(eraName) >= 0) {
            return eras[i];
          }
        }
      }
      function localeErasConvertYear(era, year) {
        var dir = era.since <= era.until ? 1 : -1;
        if (year === void 0) {
          return hooks(era.since).year();
        } else {
          return hooks(era.since).year() + (year - era.offset) * dir;
        }
      }
      function getEraName() {
        var i, l, val, eras = this.localeData().eras();
        for (i = 0, l = eras.length; i < l; ++i) {
          val = this.clone().startOf("day").valueOf();
          if (eras[i].since <= val && val <= eras[i].until) {
            return eras[i].name;
          }
          if (eras[i].until <= val && val <= eras[i].since) {
            return eras[i].name;
          }
        }
        return "";
      }
      function getEraNarrow() {
        var i, l, val, eras = this.localeData().eras();
        for (i = 0, l = eras.length; i < l; ++i) {
          val = this.clone().startOf("day").valueOf();
          if (eras[i].since <= val && val <= eras[i].until) {
            return eras[i].narrow;
          }
          if (eras[i].until <= val && val <= eras[i].since) {
            return eras[i].narrow;
          }
        }
        return "";
      }
      function getEraAbbr() {
        var i, l, val, eras = this.localeData().eras();
        for (i = 0, l = eras.length; i < l; ++i) {
          val = this.clone().startOf("day").valueOf();
          if (eras[i].since <= val && val <= eras[i].until) {
            return eras[i].abbr;
          }
          if (eras[i].until <= val && val <= eras[i].since) {
            return eras[i].abbr;
          }
        }
        return "";
      }
      function getEraYear() {
        var i, l, dir, val, eras = this.localeData().eras();
        for (i = 0, l = eras.length; i < l; ++i) {
          dir = eras[i].since <= eras[i].until ? 1 : -1;
          val = this.clone().startOf("day").valueOf();
          if (eras[i].since <= val && val <= eras[i].until || eras[i].until <= val && val <= eras[i].since) {
            return (this.year() - hooks(eras[i].since).year()) * dir + eras[i].offset;
          }
        }
        return this.year();
      }
      function erasNameRegex(isStrict) {
        if (!hasOwnProp(this, "_erasNameRegex")) {
          computeErasParse.call(this);
        }
        return isStrict ? this._erasNameRegex : this._erasRegex;
      }
      function erasAbbrRegex(isStrict) {
        if (!hasOwnProp(this, "_erasAbbrRegex")) {
          computeErasParse.call(this);
        }
        return isStrict ? this._erasAbbrRegex : this._erasRegex;
      }
      function erasNarrowRegex(isStrict) {
        if (!hasOwnProp(this, "_erasNarrowRegex")) {
          computeErasParse.call(this);
        }
        return isStrict ? this._erasNarrowRegex : this._erasRegex;
      }
      function matchEraAbbr(isStrict, locale2) {
        return locale2.erasAbbrRegex(isStrict);
      }
      function matchEraName(isStrict, locale2) {
        return locale2.erasNameRegex(isStrict);
      }
      function matchEraNarrow(isStrict, locale2) {
        return locale2.erasNarrowRegex(isStrict);
      }
      function matchEraYearOrdinal(isStrict, locale2) {
        return locale2._eraYearOrdinalRegex || matchUnsigned;
      }
      function computeErasParse() {
        var abbrPieces = [], namePieces = [], narrowPieces = [], mixedPieces = [], i, l, erasName, erasAbbr, erasNarrow, eras = this.eras();
        for (i = 0, l = eras.length; i < l; ++i) {
          erasName = regexEscape(eras[i].name);
          erasAbbr = regexEscape(eras[i].abbr);
          erasNarrow = regexEscape(eras[i].narrow);
          namePieces.push(erasName);
          abbrPieces.push(erasAbbr);
          narrowPieces.push(erasNarrow);
          mixedPieces.push(erasName);
          mixedPieces.push(erasAbbr);
          mixedPieces.push(erasNarrow);
        }
        this._erasRegex = new RegExp("^(" + mixedPieces.join("|") + ")", "i");
        this._erasNameRegex = new RegExp("^(" + namePieces.join("|") + ")", "i");
        this._erasAbbrRegex = new RegExp("^(" + abbrPieces.join("|") + ")", "i");
        this._erasNarrowRegex = new RegExp(
          "^(" + narrowPieces.join("|") + ")",
          "i"
        );
      }
      addFormatToken(0, ["gg", 2], 0, function() {
        return this.weekYear() % 100;
      });
      addFormatToken(0, ["GG", 2], 0, function() {
        return this.isoWeekYear() % 100;
      });
      function addWeekYearFormatToken(token2, getter) {
        addFormatToken(0, [token2, token2.length], 0, getter);
      }
      addWeekYearFormatToken("gggg", "weekYear");
      addWeekYearFormatToken("ggggg", "weekYear");
      addWeekYearFormatToken("GGGG", "isoWeekYear");
      addWeekYearFormatToken("GGGGG", "isoWeekYear");
      addRegexToken("G", matchSigned);
      addRegexToken("g", matchSigned);
      addRegexToken("GG", match1to2, match2);
      addRegexToken("gg", match1to2, match2);
      addRegexToken("GGGG", match1to4, match4);
      addRegexToken("gggg", match1to4, match4);
      addRegexToken("GGGGG", match1to6, match6);
      addRegexToken("ggggg", match1to6, match6);
      addWeekParseToken(
        ["gggg", "ggggg", "GGGG", "GGGGG"],
        function(input, week, config, token2) {
          week[token2.substr(0, 2)] = toInt(input);
        }
      );
      addWeekParseToken(["gg", "GG"], function(input, week, config, token2) {
        week[token2] = hooks.parseTwoDigitYear(input);
      });
      function getSetWeekYear(input) {
        return getSetWeekYearHelper.call(
          this,
          input,
          this.week(),
          this.weekday() + this.localeData()._week.dow,
          this.localeData()._week.dow,
          this.localeData()._week.doy
        );
      }
      function getSetISOWeekYear(input) {
        return getSetWeekYearHelper.call(
          this,
          input,
          this.isoWeek(),
          this.isoWeekday(),
          1,
          4
        );
      }
      function getISOWeeksInYear() {
        return weeksInYear(this.year(), 1, 4);
      }
      function getISOWeeksInISOWeekYear() {
        return weeksInYear(this.isoWeekYear(), 1, 4);
      }
      function getWeeksInYear() {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
      }
      function getWeeksInWeekYear() {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.weekYear(), weekInfo.dow, weekInfo.doy);
      }
      function getSetWeekYearHelper(input, week, weekday, dow, doy) {
        var weeksTarget;
        if (input == null) {
          return weekOfYear(this, dow, doy).year;
        } else {
          weeksTarget = weeksInYear(input, dow, doy);
          if (week > weeksTarget) {
            week = weeksTarget;
          }
          return setWeekAll.call(this, input, week, weekday, dow, doy);
        }
      }
      function setWeekAll(weekYear, week, weekday, dow, doy) {
        var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy), date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);
        this.year(date.getUTCFullYear());
        this.month(date.getUTCMonth());
        this.date(date.getUTCDate());
        return this;
      }
      addFormatToken("Q", 0, "Qo", "quarter");
      addRegexToken("Q", match1);
      addParseToken("Q", function(input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
      });
      function getSetQuarter(input) {
        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
      }
      addFormatToken("D", ["DD", 2], "Do", "date");
      addRegexToken("D", match1to2, match1to2NoLeadingZero);
      addRegexToken("DD", match1to2, match2);
      addRegexToken("Do", function(isStrict, locale2) {
        return isStrict ? locale2._dayOfMonthOrdinalParse || locale2._ordinalParse : locale2._dayOfMonthOrdinalParseLenient;
      });
      addParseToken(["D", "DD"], DATE);
      addParseToken("Do", function(input, array) {
        array[DATE] = toInt(input.match(match1to2)[0]);
      });
      var getSetDayOfMonth = makeGetSet("Date", true);
      addFormatToken("DDD", ["DDDD", 3], "DDDo", "dayOfYear");
      addRegexToken("DDD", match1to3);
      addRegexToken("DDDD", match3);
      addParseToken(["DDD", "DDDD"], function(input, array, config) {
        config._dayOfYear = toInt(input);
      });
      function getSetDayOfYear(input) {
        var dayOfYear = Math.round(
          (this.clone().startOf("day") - this.clone().startOf("year")) / 864e5
        ) + 1;
        return input == null ? dayOfYear : this.add(input - dayOfYear, "d");
      }
      addFormatToken("m", ["mm", 2], 0, "minute");
      addRegexToken("m", match1to2, match1to2HasZero);
      addRegexToken("mm", match1to2, match2);
      addParseToken(["m", "mm"], MINUTE);
      var getSetMinute = makeGetSet("Minutes", false);
      addFormatToken("s", ["ss", 2], 0, "second");
      addRegexToken("s", match1to2, match1to2HasZero);
      addRegexToken("ss", match1to2, match2);
      addParseToken(["s", "ss"], SECOND);
      var getSetSecond = makeGetSet("Seconds", false);
      addFormatToken("S", 0, 0, function() {
        return ~~(this.millisecond() / 100);
      });
      addFormatToken(0, ["SS", 2], 0, function() {
        return ~~(this.millisecond() / 10);
      });
      addFormatToken(0, ["SSS", 3], 0, "millisecond");
      addFormatToken(0, ["SSSS", 4], 0, function() {
        return this.millisecond() * 10;
      });
      addFormatToken(0, ["SSSSS", 5], 0, function() {
        return this.millisecond() * 100;
      });
      addFormatToken(0, ["SSSSSS", 6], 0, function() {
        return this.millisecond() * 1e3;
      });
      addFormatToken(0, ["SSSSSSS", 7], 0, function() {
        return this.millisecond() * 1e4;
      });
      addFormatToken(0, ["SSSSSSSS", 8], 0, function() {
        return this.millisecond() * 1e5;
      });
      addFormatToken(0, ["SSSSSSSSS", 9], 0, function() {
        return this.millisecond() * 1e6;
      });
      addRegexToken("S", match1to3, match1);
      addRegexToken("SS", match1to3, match2);
      addRegexToken("SSS", match1to3, match3);
      var token, getSetMillisecond;
      for (token = "SSSS"; token.length <= 9; token += "S") {
        addRegexToken(token, matchUnsigned);
      }
      function parseMs(input, array) {
        array[MILLISECOND] = toInt(("0." + input) * 1e3);
      }
      for (token = "S"; token.length <= 9; token += "S") {
        addParseToken(token, parseMs);
      }
      getSetMillisecond = makeGetSet("Milliseconds", false);
      addFormatToken("z", 0, 0, "zoneAbbr");
      addFormatToken("zz", 0, 0, "zoneName");
      function getZoneAbbr() {
        return this._isUTC ? "UTC" : "";
      }
      function getZoneName() {
        return this._isUTC ? "Coordinated Universal Time" : "";
      }
      var proto = Moment.prototype;
      proto.add = add;
      proto.calendar = calendar$1;
      proto.clone = clone;
      proto.diff = diff;
      proto.endOf = endOf;
      proto.format = format;
      proto.from = from;
      proto.fromNow = fromNow;
      proto.to = to;
      proto.toNow = toNow;
      proto.get = stringGet;
      proto.invalidAt = invalidAt;
      proto.isAfter = isAfter;
      proto.isBefore = isBefore;
      proto.isBetween = isBetween;
      proto.isSame = isSame;
      proto.isSameOrAfter = isSameOrAfter;
      proto.isSameOrBefore = isSameOrBefore;
      proto.isValid = isValid$2;
      proto.lang = lang;
      proto.locale = locale;
      proto.localeData = localeData;
      proto.max = prototypeMax;
      proto.min = prototypeMin;
      proto.parsingFlags = parsingFlags;
      proto.set = stringSet;
      proto.startOf = startOf;
      proto.subtract = subtract;
      proto.toArray = toArray;
      proto.toObject = toObject;
      proto.toDate = toDate;
      proto.toISOString = toISOString;
      proto.inspect = inspect;
      if (typeof Symbol !== "undefined" && Symbol.for != null) {
        proto[Symbol.for("nodejs.util.inspect.custom")] = function() {
          return "Moment<" + this.format() + ">";
        };
      }
      proto.toJSON = toJSON;
      proto.toString = toString;
      proto.unix = unix;
      proto.valueOf = valueOf;
      proto.creationData = creationData;
      proto.eraName = getEraName;
      proto.eraNarrow = getEraNarrow;
      proto.eraAbbr = getEraAbbr;
      proto.eraYear = getEraYear;
      proto.year = getSetYear;
      proto.isLeapYear = getIsLeapYear;
      proto.weekYear = getSetWeekYear;
      proto.isoWeekYear = getSetISOWeekYear;
      proto.quarter = proto.quarters = getSetQuarter;
      proto.month = getSetMonth;
      proto.daysInMonth = getDaysInMonth;
      proto.week = proto.weeks = getSetWeek;
      proto.isoWeek = proto.isoWeeks = getSetISOWeek;
      proto.weeksInYear = getWeeksInYear;
      proto.weeksInWeekYear = getWeeksInWeekYear;
      proto.isoWeeksInYear = getISOWeeksInYear;
      proto.isoWeeksInISOWeekYear = getISOWeeksInISOWeekYear;
      proto.date = getSetDayOfMonth;
      proto.day = proto.days = getSetDayOfWeek;
      proto.weekday = getSetLocaleDayOfWeek;
      proto.isoWeekday = getSetISODayOfWeek;
      proto.dayOfYear = getSetDayOfYear;
      proto.hour = proto.hours = getSetHour;
      proto.minute = proto.minutes = getSetMinute;
      proto.second = proto.seconds = getSetSecond;
      proto.millisecond = proto.milliseconds = getSetMillisecond;
      proto.utcOffset = getSetOffset;
      proto.utc = setOffsetToUTC;
      proto.local = setOffsetToLocal;
      proto.parseZone = setOffsetToParsedOffset;
      proto.hasAlignedHourOffset = hasAlignedHourOffset;
      proto.isDST = isDaylightSavingTime;
      proto.isLocal = isLocal;
      proto.isUtcOffset = isUtcOffset;
      proto.isUtc = isUtc;
      proto.isUTC = isUtc;
      proto.zoneAbbr = getZoneAbbr;
      proto.zoneName = getZoneName;
      proto.dates = deprecate(
        "dates accessor is deprecated. Use date instead.",
        getSetDayOfMonth
      );
      proto.months = deprecate(
        "months accessor is deprecated. Use month instead",
        getSetMonth
      );
      proto.years = deprecate(
        "years accessor is deprecated. Use year instead",
        getSetYear
      );
      proto.zone = deprecate(
        "moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/",
        getSetZone
      );
      proto.isDSTShifted = deprecate(
        "isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information",
        isDaylightSavingTimeShifted
      );
      function createUnix(input) {
        return createLocal(input * 1e3);
      }
      function createInZone() {
        return createLocal.apply(null, arguments).parseZone();
      }
      function preParsePostFormat(string) {
        return string;
      }
      var proto$1 = Locale.prototype;
      proto$1.calendar = calendar;
      proto$1.longDateFormat = longDateFormat;
      proto$1.invalidDate = invalidDate;
      proto$1.ordinal = ordinal;
      proto$1.preparse = preParsePostFormat;
      proto$1.postformat = preParsePostFormat;
      proto$1.relativeTime = relativeTime;
      proto$1.pastFuture = pastFuture;
      proto$1.set = set;
      proto$1.eras = localeEras;
      proto$1.erasParse = localeErasParse;
      proto$1.erasConvertYear = localeErasConvertYear;
      proto$1.erasAbbrRegex = erasAbbrRegex;
      proto$1.erasNameRegex = erasNameRegex;
      proto$1.erasNarrowRegex = erasNarrowRegex;
      proto$1.months = localeMonths;
      proto$1.monthsShort = localeMonthsShort;
      proto$1.monthsParse = localeMonthsParse;
      proto$1.monthsRegex = monthsRegex;
      proto$1.monthsShortRegex = monthsShortRegex;
      proto$1.week = localeWeek;
      proto$1.firstDayOfYear = localeFirstDayOfYear;
      proto$1.firstDayOfWeek = localeFirstDayOfWeek;
      proto$1.weekdays = localeWeekdays;
      proto$1.weekdaysMin = localeWeekdaysMin;
      proto$1.weekdaysShort = localeWeekdaysShort;
      proto$1.weekdaysParse = localeWeekdaysParse;
      proto$1.weekdaysRegex = weekdaysRegex;
      proto$1.weekdaysShortRegex = weekdaysShortRegex;
      proto$1.weekdaysMinRegex = weekdaysMinRegex;
      proto$1.isPM = localeIsPM;
      proto$1.meridiem = localeMeridiem;
      function get$1(format2, index, field, setter) {
        var locale2 = getLocale(), utc = createUTC().set(setter, index);
        return locale2[field](utc, format2);
      }
      function listMonthsImpl(format2, index, field) {
        if (isNumber(format2)) {
          index = format2;
          format2 = void 0;
        }
        format2 = format2 || "";
        if (index != null) {
          return get$1(format2, index, field, "month");
        }
        var i, out = [];
        for (i = 0; i < 12; i++) {
          out[i] = get$1(format2, i, field, "month");
        }
        return out;
      }
      function listWeekdaysImpl(localeSorted, format2, index, field) {
        if (typeof localeSorted === "boolean") {
          if (isNumber(format2)) {
            index = format2;
            format2 = void 0;
          }
          format2 = format2 || "";
        } else {
          format2 = localeSorted;
          index = format2;
          localeSorted = false;
          if (isNumber(format2)) {
            index = format2;
            format2 = void 0;
          }
          format2 = format2 || "";
        }
        var locale2 = getLocale(), shift = localeSorted ? locale2._week.dow : 0, i, out = [];
        if (index != null) {
          return get$1(format2, (index + shift) % 7, field, "day");
        }
        for (i = 0; i < 7; i++) {
          out[i] = get$1(format2, (i + shift) % 7, field, "day");
        }
        return out;
      }
      function listMonths(format2, index) {
        return listMonthsImpl(format2, index, "months");
      }
      function listMonthsShort(format2, index) {
        return listMonthsImpl(format2, index, "monthsShort");
      }
      function listWeekdays(localeSorted, format2, index) {
        return listWeekdaysImpl(localeSorted, format2, index, "weekdays");
      }
      function listWeekdaysShort(localeSorted, format2, index) {
        return listWeekdaysImpl(localeSorted, format2, index, "weekdaysShort");
      }
      function listWeekdaysMin(localeSorted, format2, index) {
        return listWeekdaysImpl(localeSorted, format2, index, "weekdaysMin");
      }
      getSetGlobalLocale("en", {
        eras: [
          {
            since: "0001-01-01",
            until: Infinity,
            offset: 1,
            name: "Anno Domini",
            narrow: "AD",
            abbr: "AD"
          },
          {
            since: "0000-12-31",
            until: -Infinity,
            offset: 1,
            name: "Before Christ",
            narrow: "BC",
            abbr: "BC"
          }
        ],
        dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal: function(number) {
          var b = number % 10, output = toInt(number % 100 / 10) === 1 ? "th" : b === 1 ? "st" : b === 2 ? "nd" : b === 3 ? "rd" : "th";
          return number + output;
        }
      });
      hooks.lang = deprecate(
        "moment.lang is deprecated. Use moment.locale instead.",
        getSetGlobalLocale
      );
      hooks.langData = deprecate(
        "moment.langData is deprecated. Use moment.localeData instead.",
        getLocale
      );
      var mathAbs = Math.abs;
      function abs() {
        var data = this._data;
        this._milliseconds = mathAbs(this._milliseconds);
        this._days = mathAbs(this._days);
        this._months = mathAbs(this._months);
        data.milliseconds = mathAbs(data.milliseconds);
        data.seconds = mathAbs(data.seconds);
        data.minutes = mathAbs(data.minutes);
        data.hours = mathAbs(data.hours);
        data.months = mathAbs(data.months);
        data.years = mathAbs(data.years);
        return this;
      }
      function addSubtract$1(duration, input, value, direction) {
        var other = createDuration(input, value);
        duration._milliseconds += direction * other._milliseconds;
        duration._days += direction * other._days;
        duration._months += direction * other._months;
        return duration._bubble();
      }
      function add$1(input, value) {
        return addSubtract$1(this, input, value, 1);
      }
      function subtract$1(input, value) {
        return addSubtract$1(this, input, value, -1);
      }
      function absCeil(number) {
        if (number < 0) {
          return Math.floor(number);
        } else {
          return Math.ceil(number);
        }
      }
      function bubble() {
        var milliseconds2 = this._milliseconds, days2 = this._days, months2 = this._months, data = this._data, seconds2, minutes2, hours2, years2, monthsFromDays;
        if (!(milliseconds2 >= 0 && days2 >= 0 && months2 >= 0 || milliseconds2 <= 0 && days2 <= 0 && months2 <= 0)) {
          milliseconds2 += absCeil(monthsToDays(months2) + days2) * 864e5;
          days2 = 0;
          months2 = 0;
        }
        data.milliseconds = milliseconds2 % 1e3;
        seconds2 = absFloor(milliseconds2 / 1e3);
        data.seconds = seconds2 % 60;
        minutes2 = absFloor(seconds2 / 60);
        data.minutes = minutes2 % 60;
        hours2 = absFloor(minutes2 / 60);
        data.hours = hours2 % 24;
        days2 += absFloor(hours2 / 24);
        monthsFromDays = absFloor(daysToMonths(days2));
        months2 += monthsFromDays;
        days2 -= absCeil(monthsToDays(monthsFromDays));
        years2 = absFloor(months2 / 12);
        months2 %= 12;
        data.days = days2;
        data.months = months2;
        data.years = years2;
        return this;
      }
      function daysToMonths(days2) {
        return days2 * 4800 / 146097;
      }
      function monthsToDays(months2) {
        return months2 * 146097 / 4800;
      }
      function as(units) {
        if (!this.isValid()) {
          return NaN;
        }
        var days2, months2, milliseconds2 = this._milliseconds;
        units = normalizeUnits(units);
        if (units === "month" || units === "quarter" || units === "year") {
          days2 = this._days + milliseconds2 / 864e5;
          months2 = this._months + daysToMonths(days2);
          switch (units) {
            case "month":
              return months2;
            case "quarter":
              return months2 / 3;
            case "year":
              return months2 / 12;
          }
        } else {
          days2 = this._days + Math.round(monthsToDays(this._months));
          switch (units) {
            case "week":
              return days2 / 7 + milliseconds2 / 6048e5;
            case "day":
              return days2 + milliseconds2 / 864e5;
            case "hour":
              return days2 * 24 + milliseconds2 / 36e5;
            case "minute":
              return days2 * 1440 + milliseconds2 / 6e4;
            case "second":
              return days2 * 86400 + milliseconds2 / 1e3;
            // Math.floor prevents floating point math errors here
            case "millisecond":
              return Math.floor(days2 * 864e5) + milliseconds2;
            default:
              throw new Error("Unknown unit " + units);
          }
        }
      }
      function makeAs(alias) {
        return function() {
          return this.as(alias);
        };
      }
      var asMilliseconds = makeAs("ms"), asSeconds = makeAs("s"), asMinutes = makeAs("m"), asHours = makeAs("h"), asDays = makeAs("d"), asWeeks = makeAs("w"), asMonths = makeAs("M"), asQuarters = makeAs("Q"), asYears = makeAs("y"), valueOf$1 = asMilliseconds;
      function clone$1() {
        return createDuration(this);
      }
      function get$2(units) {
        units = normalizeUnits(units);
        return this.isValid() ? this[units + "s"]() : NaN;
      }
      function makeGetter(name) {
        return function() {
          return this.isValid() ? this._data[name] : NaN;
        };
      }
      var milliseconds = makeGetter("milliseconds"), seconds = makeGetter("seconds"), minutes = makeGetter("minutes"), hours = makeGetter("hours"), days = makeGetter("days"), months = makeGetter("months"), years = makeGetter("years");
      function weeks() {
        return absFloor(this.days() / 7);
      }
      var round = Math.round, thresholds = {
        ss: 44,
        // a few seconds to seconds
        s: 45,
        // seconds to minute
        m: 45,
        // minutes to hour
        h: 22,
        // hours to day
        d: 26,
        // days to month/week
        w: null,
        // weeks to month
        M: 11
        // months to year
      };
      function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale2) {
        return locale2.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
      }
      function relativeTime$1(posNegDuration, withoutSuffix, thresholds2, locale2) {
        var duration = createDuration(posNegDuration).abs(), seconds2 = round(duration.as("s")), minutes2 = round(duration.as("m")), hours2 = round(duration.as("h")), days2 = round(duration.as("d")), months2 = round(duration.as("M")), weeks2 = round(duration.as("w")), years2 = round(duration.as("y")), a = seconds2 <= thresholds2.ss && ["s", seconds2] || seconds2 < thresholds2.s && ["ss", seconds2] || minutes2 <= 1 && ["m"] || minutes2 < thresholds2.m && ["mm", minutes2] || hours2 <= 1 && ["h"] || hours2 < thresholds2.h && ["hh", hours2] || days2 <= 1 && ["d"] || days2 < thresholds2.d && ["dd", days2];
        if (thresholds2.w != null) {
          a = a || weeks2 <= 1 && ["w"] || weeks2 < thresholds2.w && ["ww", weeks2];
        }
        a = a || months2 <= 1 && ["M"] || months2 < thresholds2.M && ["MM", months2] || years2 <= 1 && ["y"] || ["yy", years2];
        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale2;
        return substituteTimeAgo.apply(null, a);
      }
      function getSetRelativeTimeRounding(roundingFunction) {
        if (roundingFunction === void 0) {
          return round;
        }
        if (typeof roundingFunction === "function") {
          round = roundingFunction;
          return true;
        }
        return false;
      }
      function getSetRelativeTimeThreshold(threshold, limit) {
        if (thresholds[threshold] === void 0) {
          return false;
        }
        if (limit === void 0) {
          return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        if (threshold === "s") {
          thresholds.ss = limit - 1;
        }
        return true;
      }
      function humanize(argWithSuffix, argThresholds) {
        if (!this.isValid()) {
          return this.localeData().invalidDate();
        }
        var withSuffix = false, th = thresholds, locale2, output;
        if (typeof argWithSuffix === "object") {
          argThresholds = argWithSuffix;
          argWithSuffix = false;
        }
        if (typeof argWithSuffix === "boolean") {
          withSuffix = argWithSuffix;
        }
        if (typeof argThresholds === "object") {
          th = Object.assign({}, thresholds, argThresholds);
          if (argThresholds.s != null && argThresholds.ss == null) {
            th.ss = argThresholds.s - 1;
          }
        }
        locale2 = this.localeData();
        output = relativeTime$1(this, !withSuffix, th, locale2);
        if (withSuffix) {
          output = locale2.pastFuture(+this, output);
        }
        return locale2.postformat(output);
      }
      var abs$1 = Math.abs;
      function sign(x) {
        return (x > 0) - (x < 0) || +x;
      }
      function toISOString$1() {
        if (!this.isValid()) {
          return this.localeData().invalidDate();
        }
        var seconds2 = abs$1(this._milliseconds) / 1e3, days2 = abs$1(this._days), months2 = abs$1(this._months), minutes2, hours2, years2, s, total = this.asSeconds(), totalSign, ymSign, daysSign, hmsSign;
        if (!total) {
          return "P0D";
        }
        minutes2 = absFloor(seconds2 / 60);
        hours2 = absFloor(minutes2 / 60);
        seconds2 %= 60;
        minutes2 %= 60;
        years2 = absFloor(months2 / 12);
        months2 %= 12;
        s = seconds2 ? seconds2.toFixed(3).replace(/\.?0+$/, "") : "";
        totalSign = total < 0 ? "-" : "";
        ymSign = sign(this._months) !== sign(total) ? "-" : "";
        daysSign = sign(this._days) !== sign(total) ? "-" : "";
        hmsSign = sign(this._milliseconds) !== sign(total) ? "-" : "";
        return totalSign + "P" + (years2 ? ymSign + years2 + "Y" : "") + (months2 ? ymSign + months2 + "M" : "") + (days2 ? daysSign + days2 + "D" : "") + (hours2 || minutes2 || seconds2 ? "T" : "") + (hours2 ? hmsSign + hours2 + "H" : "") + (minutes2 ? hmsSign + minutes2 + "M" : "") + (seconds2 ? hmsSign + s + "S" : "");
      }
      var proto$2 = Duration.prototype;
      proto$2.isValid = isValid$1;
      proto$2.abs = abs;
      proto$2.add = add$1;
      proto$2.subtract = subtract$1;
      proto$2.as = as;
      proto$2.asMilliseconds = asMilliseconds;
      proto$2.asSeconds = asSeconds;
      proto$2.asMinutes = asMinutes;
      proto$2.asHours = asHours;
      proto$2.asDays = asDays;
      proto$2.asWeeks = asWeeks;
      proto$2.asMonths = asMonths;
      proto$2.asQuarters = asQuarters;
      proto$2.asYears = asYears;
      proto$2.valueOf = valueOf$1;
      proto$2._bubble = bubble;
      proto$2.clone = clone$1;
      proto$2.get = get$2;
      proto$2.milliseconds = milliseconds;
      proto$2.seconds = seconds;
      proto$2.minutes = minutes;
      proto$2.hours = hours;
      proto$2.days = days;
      proto$2.weeks = weeks;
      proto$2.months = months;
      proto$2.years = years;
      proto$2.humanize = humanize;
      proto$2.toISOString = toISOString$1;
      proto$2.toString = toISOString$1;
      proto$2.toJSON = toISOString$1;
      proto$2.locale = locale;
      proto$2.localeData = localeData;
      proto$2.toIsoString = deprecate(
        "toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",
        toISOString$1
      );
      proto$2.lang = lang;
      addFormatToken("X", 0, 0, "unix");
      addFormatToken("x", 0, 0, "valueOf");
      addRegexToken("x", matchSigned);
      addRegexToken("X", matchTimestamp);
      addParseToken("X", function(input, array, config) {
        config._d = new Date(parseFloat(input) * 1e3);
      });
      addParseToken("x", function(input, array, config) {
        config._d = new Date(toInt(input));
      });
      hooks.version = "2.30.1";
      setHookCallback(createLocal);
      hooks.fn = proto;
      hooks.min = min;
      hooks.max = max;
      hooks.now = now;
      hooks.utc = createUTC;
      hooks.unix = createUnix;
      hooks.months = listMonths;
      hooks.isDate = isDate;
      hooks.locale = getSetGlobalLocale;
      hooks.invalid = createInvalid;
      hooks.duration = createDuration;
      hooks.isMoment = isMoment;
      hooks.weekdays = listWeekdays;
      hooks.parseZone = createInZone;
      hooks.localeData = getLocale;
      hooks.isDuration = isDuration;
      hooks.monthsShort = listMonthsShort;
      hooks.weekdaysMin = listWeekdaysMin;
      hooks.defineLocale = defineLocale;
      hooks.updateLocale = updateLocale;
      hooks.locales = listLocales;
      hooks.weekdaysShort = listWeekdaysShort;
      hooks.normalizeUnits = normalizeUnits;
      hooks.relativeTimeRounding = getSetRelativeTimeRounding;
      hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
      hooks.calendarFormat = getCalendarFormat;
      hooks.prototype = proto;
      hooks.HTML5_FMT = {
        DATETIME_LOCAL: "YYYY-MM-DDTHH:mm",
        // <input type="datetime-local" />
        DATETIME_LOCAL_SECONDS: "YYYY-MM-DDTHH:mm:ss",
        // <input type="datetime-local" step="1" />
        DATETIME_LOCAL_MS: "YYYY-MM-DDTHH:mm:ss.SSS",
        // <input type="datetime-local" step="0.001" />
        DATE: "YYYY-MM-DD",
        // <input type="date" />
        TIME: "HH:mm",
        // <input type="time" />
        TIME_SECONDS: "HH:mm:ss",
        // <input type="time" step="1" />
        TIME_MS: "HH:mm:ss.SSS",
        // <input type="time" step="0.001" />
        WEEK: "GGGG-[W]WW",
        // <input type="week" />
        MONTH: "YYYY-MM"
        // <input type="month" />
      };
      return hooks;
    });
  }
});

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ElnPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian44 = require("obsidian");

// src/ui/renderer/npe/core/renderFrontMatter.ts
var import_obsidian12 = require("obsidian");

// src/ui/renderer/npe/core/renderObjectArray.ts
var import_obsidian6 = require("obsidian");

// src/ui/renderer/npe/helpers/getPropertyIcon.ts
function getPropertyIcon(key, dataType) {
  const specialKeyIcons = {
    alias: "forward",
    aliases: "forward",
    tag: "tags",
    tags: "tags",
    cssclass: "paintbrush",
    cssclasses: "paintbrush",
    "ELN version": "file-digit",
    time: "clock",
    "given name": "id-card",
    "family name": "id-card",
    work: "briefcase-business",
    private: "shield-user",
    location: "map-pin",
    building: "building",
    room: "door-closed",
    email: "mail",
    phone: "phone",
    mobile: "smartphone",
    fax: "printer",
    website: "globe",
    address: "map-pinned",
    city: "map-pinned",
    street: "map-pinned",
    country: "earth",
    participants: "users",
    title: "type-outline",
    contributor: "user",
    author: "user-pen",
    smiles: "hexagon",
    width: "ruler-dimension-line",
    height: "ruler-dimension-line",
    depth: "ruler-dimension-line",
    density: "scale",
    temperature: "thermometer",
    "heating rate": "triangle-right",
    "melting point": "thermometer",
    "boiling point": "thermometer",
    "molecular weight": "weight",
    "molar mass": "weight",
    series: "gallery-vertical-end",
    batch: "qr-code",
    CAS: "barcode",
    supplier: "truck",
    quantity: "scale",
    manufacturer: "factory",
    safety: "shield-x",
    "h-statements": "briefcase-medical",
    "p-statements": "shield-alert",
    toxicity: "skull",
    sample: "atom",
    process: "route",
    project: "badge-check",
    analysis: "search",
    meeting: "users",
    chemical: "flask-conical",
    contact: "contact",
    device: "pocket-knife",
    instrument: "microscope"
  };
  const dataTypeIcons = {
    string: "text",
    number: "binary",
    boolean: "square-check",
    list: "list",
    object: "box",
    objectArray: "boxes",
    unknown: "circle-help",
    link: "link",
    externalLink: "link",
    date: "calendar",
    latex: "sigma"
  };
  if (key in specialKeyIcons) {
    return specialKeyIcons[key];
  } else if (dataType in dataTypeIcons) {
    return dataTypeIcons[dataType];
  } else {
    return "help-circle";
  }
}

// src/ui/renderer/npe/helpers/addToggleEvent.ts
function addToggleEvent(view, iconContainer, keyDiv, targetContainer) {
  const toggleContainer = () => {
    targetContainer.classList.toggle("hidden");
  };
  view.registerDomEvent(iconContainer, "click", toggleContainer);
  view.registerDomEvent(keyDiv, "click", toggleContainer);
}

// src/ui/renderer/npe/utils/changeKeyName.ts
function renameObjectKey(oldObject, oldKey, newKey) {
  const keys = Object.keys(oldObject != null ? oldObject : {});
  const newObject = keys.reduce((acc, currentKey) => {
    if (currentKey === oldKey) {
      acc[newKey] = oldObject[oldKey];
    } else {
      acc[currentKey] = oldObject[currentKey];
    }
    return acc;
  }, {});
  return newObject;
}
async function changeKeyName(app, file, key, newKey) {
  await app.fileManager.processFrontMatter(file, (frontmatter) => {
    const keys = key.split(".");
    let obj = frontmatter;
    const lastKey = keys[keys.length - 1];
    let targetObject;
    if (keys.length > 1) {
      for (let i = 0; i < keys.length - 2; i++) {
        if (!obj[keys[i]]) {
          obj[keys[i]] = {};
        }
        obj = obj[keys[i]];
      }
      const targetKey = keys[keys.length - 2];
      targetObject = obj[targetKey];
    } else {
      targetObject = obj;
    }
    if (targetObject) {
      const renamed = renameObjectKey(targetObject, lastKey, newKey);
      if (keys.length > 1) {
        const targetKey = keys[keys.length - 2];
        obj[targetKey] = renamed;
      } else {
        for (const k of Object.keys(obj)) {
          delete obj[k];
        }
        Object.assign(obj, renamed);
      }
    }
  });
}

// src/ui/renderer/npe/utils/updateProperties.ts
async function updateProperties(app, file, key, value, dataType = "string") {
  if (!file) return;
  if (!app.vault.getAbstractFileByPath(file.path)) {
    console.warn(`NPE: Cannot update properties - file ${file.path} no longer exists`);
    return;
  }
  switch (dataType) {
    case "string":
      value = value != null ? value.toString() : "";
      break;
    case "link":
      value = value != null ? `[[${value}]]` : "";
      break;
    case "external-link":
      value = value != null ? value.toString() : "";
      break;
    case "number":
      value = Number(value);
      break;
    case "boolean":
      break;
    case "latex":
      value = value != null ? `$${value}$` : "";
      break;
    default:
      break;
  }
  if (typeof value === "number" && isNaN(value) || value === null || JSON.stringify(value) === "{}") {
    value = void 0;
  }
  await app.fileManager.processFrontMatter(file, (frontmatter) => {
    const keys = key.split(".");
    let obj = frontmatter;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) {
        obj[keys[i]] = {};
      }
      obj = obj[keys[i]];
    }
    if (value === void 0) {
      if (Array.isArray(obj)) {
        obj.splice(Number(keys[keys.length - 1]), 1);
      } else {
        delete obj[keys[keys.length - 1]];
      }
    } else {
      obj[keys[keys.length - 1]] = value;
    }
  });
}

// src/ui/renderer/npe/helpers/getFrontmatterValue.ts
function getFrontmatterValue(app, fullKey) {
  var _a;
  const currentFile = app.workspace.getActiveFile();
  if (!currentFile) return void 0;
  const frontmatter = (_a = app.metadataCache.getFileCache(currentFile)) == null ? void 0 : _a.frontmatter;
  if (!frontmatter) return void 0;
  const keys = fullKey.split(".");
  let value = frontmatter;
  for (const key of keys) {
    if (value && typeof value === "object" && !Array.isArray(value) && key in value) {
      value = value[key];
    } else {
      return void 0;
    }
  }
  return value;
}

// src/ui/renderer/npe/core/renderPrimitive.ts
var import_obsidian3 = require("obsidian");

// src/ui/renderer/npe/helpers/getPropertyInputType.ts
function getPropertyInputType(dataType) {
  const dataTypeInputTypes = {
    string: "text",
    number: "number",
    boolean: "checkbox",
    list: "list",
    object: "object",
    objectArray: "objectArray",
    unknown: "text",
    link: "text",
    "external-link": "url",
    date: "date",
    latex: "text"
  };
  return dataTypeInputTypes[dataType] || "text";
}

// src/ui/renderer/npe/elements/createInternalLinkElement.ts
function createInternalLinkElement(view, internalLink, parent, fullKey) {
  const app = view.app;
  const file = view.currentFile;
  const linkDiv = parent.createDiv({ cls: "npe-editable-link" });
  const link = linkDiv.createEl("a", {
    attr: {
      "data-href": internalLink,
      target: "_blank",
      rel: "noopener nofollow"
    },
    href: internalLink,
    cls: "internal-link",
    text: internalLink
  });
  const editableDiv = linkDiv.createDiv({ cls: "npe-make-editable" });
  view.registerDomEvent(editableDiv, "click", () => {
    link.contentEditable = "true";
    link.focus();
    const range = document.createRange();
    range.selectNodeContents(link);
    range.collapse(false);
    const selection = window.getSelection();
    selection == null ? void 0 : selection.removeAllRanges();
    selection == null ? void 0 : selection.addRange(range);
  });
  view.registerDomEvent(link, "blur", () => {
    updateProperties(app, file, fullKey, link.textContent || "", "link");
    link.setAttribute("href", link.textContent || "");
    link.setAttribute("data-href", link.textContent || "");
    link.contentEditable = "false";
  });
}

// src/ui/renderer/npe/elements/createExternalLinkElement.ts
function createExternalLinkElement(view, value, parent, fullKey) {
  var _a, _b;
  if (typeof value !== "string") {
    value = "[example link](https://example.com)";
  }
  const linkText = ((_a = value.match(/\[(.*?)\]/)) == null ? void 0 : _a[1]) || "example";
  const linkUrl = ((_b = value.match(/\((.*?)\)/)) == null ? void 0 : _b[1]) || "https://example.com";
  const linkDiv = parent.createDiv({ cls: "npe-editable-link" });
  const link = linkDiv.createEl("a", {
    attr: {
      href: linkUrl,
      target: "_blank",
      rel: "noopener nofollow"
    },
    text: linkText
  });
  const editableDiv = linkDiv.createDiv({ cls: "npe-make-editable" });
  view.registerDomEvent(editableDiv, "click", () => {
    link.contentEditable = "true";
    link.focus();
    const range = document.createRange();
    range.selectNodeContents(link);
    range.collapse(false);
    const selection = window.getSelection();
    selection == null ? void 0 : selection.removeAllRanges();
    selection == null ? void 0 : selection.addRange(range);
  });
  view.registerDomEvent(link, "blur", () => {
    var _a2, _b2;
    const newValue = link.textContent || "";
    const newLinkText = ((_a2 = newValue.match(/\[(.*?)\]/)) == null ? void 0 : _a2[1]) || "";
    const newLinkUrl = ((_b2 = newValue.match(/\((.*?)\)/)) == null ? void 0 : _b2[1]) || "";
    updateProperties(view.app, view.currentFile, fullKey, newValue, "external-link");
    link.setAttribute("href", newLinkUrl);
    link.textContent = newLinkText;
    link.contentEditable = "false";
  });
}

// src/ui/renderer/components/latexToHTML.ts
function latexToHTML(latex) {
  const greekLetters = {
    alpha: "&alpha;",
    beta: "&beta;",
    gamma: "&gamma;",
    delta: "&delta;",
    epsilon: "&epsilon;",
    zeta: "&zeta;",
    eta: "&eta;",
    theta: "&theta;",
    iota: "&iota;",
    kappa: "&kappa;",
    lambda: "&lambda;",
    mu: "&mu;",
    nu: "&nu;",
    xi: "&xi;",
    omicron: "&omicron;",
    pi: "&pi;",
    rho: "&rho;",
    sigma: "&sigma;",
    tau: "&tau;",
    upsilon: "&upsilon;",
    phi: "&phi;",
    chi: "&chi;",
    psi: "&psi;",
    omega: "&omega;",
    Alpha: "&Alpha;",
    Beta: "&Beta;",
    Gamma: "&Gamma;",
    Delta: "&Delta;",
    Epsilon: "&Epsilon;",
    Zeta: "&Zeta;",
    Eta: "&Eta;",
    Theta: "&Theta;",
    Iota: "&Iota;",
    Kappa: "&Kappa;",
    Lambda: "&Lambda;",
    Mu: "&Mu;",
    Nu: "&Nu;",
    Xi: "&Xi;",
    Omicron: "&Omicron;",
    Pi: "&Pi;",
    Rho: "&Rho;",
    Sigma: "&Sigma;",
    Tau: "&Tau;",
    Upsilon: "&Upsilon;",
    Phi: "&Phi;",
    Chi: "&Chi;",
    Psi: "&Psi;",
    Omega: "&Omega;"
  };
  const subSup = {
    "^": "sup",
    "_": "sub"
  };
  let html = latex;
  for (const [key, value] of Object.entries(greekLetters)) {
    html = html.replace(new RegExp(`\\\\${key}`, "g"), value);
  }
  for (const [key, tag] of Object.entries(subSup)) {
    html = html.replace(new RegExp(`\\${key}\\{([^}]*)\\}`, "g"), `<${tag}>$1</${tag}>`);
    html = html.replace(new RegExp(`\\${key}([^}])`, "g"), `<${tag}>$1</${tag}>`);
  }
  return html;
}

// src/ui/renderer/npe/helpers/showTypeSwitchMenu.ts
var import_obsidian2 = require("obsidian");

// src/ui/renderer/npe/core/renderObjectContainer.ts
var import_obsidian = require("obsidian");

// src/ui/renderer/npe/helpers/addKeyWrapperResizeHandle.ts
function addKeyWrapperResizeHandle(view, keyWrapper, npeViewContainer) {
  var _a;
  if (keyWrapper.nextElementSibling && keyWrapper.nextElementSibling.classList.contains("npe-key-resize-handle")) return;
  const handle = (_a = keyWrapper.parentElement) == null ? void 0 : _a.createDiv({ cls: "npe-key-resize-handle" });
  if (!handle) return;
  keyWrapper.insertAdjacentElement("afterend", handle);
  let isResizing = false;
  let startX = 0;
  let startWidth = 0;
  view.registerDomEvent(handle, "mousedown", (e) => {
    e.preventDefault();
    isResizing = true;
    startX = e.clientX;
    const style = getComputedStyle(npeViewContainer);
    const widthValue = style.getPropertyValue("--npe-key-width").trim();
    startWidth = widthValue.endsWith("%") ? keyWrapper.offsetWidth : parseInt(widthValue) || keyWrapper.offsetWidth;
    handle.classList.add("resizing");
    document.body.style.cursor = "ew-resize";
  });
  view.registerDomEvent(handle, "mouseenter", () => {
    npeViewContainer.classList.add("npe-key-resize-handle-hovering");
  });
  view.registerDomEvent(handle, "mouseleave", () => {
    npeViewContainer.classList.remove("npe-key-resize-handle-hovering");
  });
  const onMouseMove = (e) => {
    if (!isResizing) return;
    const dx = e.clientX - startX;
    let newWidth = startWidth + dx;
    newWidth = Math.max(50, Math.min(newWidth, 600));
    npeViewContainer.style.setProperty("--npe-key-width", `${newWidth}px`);
  };
  const onMouseUp = () => {
    if (isResizing) {
      isResizing = false;
      handle.classList.remove("resizing");
      document.body.style.cursor = "";
    }
  };
  view.registerDomEvent(document, "mousemove", onMouseMove);
  view.registerDomEvent(document, "mouseup", onMouseUp);
}

// src/ui/renderer/npe/core/renderObjectContainer.ts
function renderObjectContainer(view, key, value, parent, level, fullKey, filterKeys, isArrayItem = false) {
  const app = view.app;
  const icon = getPropertyIcon(key, "object");
  const container = parent.createDiv({
    cls: "npe-object-container",
    attr: { "data-level": level, "data-key": fullKey }
  });
  const keyContainer = container.createDiv({
    cls: "npe-object-key-container",
    attr: { "style": `--npe-data-level: ${level};` }
  });
  const keyWrapper = keyContainer.createDiv({ cls: "npe-key-wrapper npe-object" });
  keyWrapper.style.setProperty("--npe-data-level", level.toString());
  const keyDiv = keyWrapper.createDiv({ cls: "npe-object-key" });
  const iconContainer = keyDiv.createDiv({ cls: "npe-icon-container" });
  (0, import_obsidian.setIcon)(iconContainer, icon);
  const keyLabelDiv = keyDiv.createDiv({ cls: "npe-key-label npe-object", text: key });
  const editableDiv = keyDiv.createDiv({ cls: "npe-make-editable" });
  view.registerDomEvent(editableDiv, "click", (evt) => {
    keyLabelDiv.contentEditable = "true";
    keyLabelDiv.focus();
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(keyLabelDiv);
    range.collapse(false);
    selection == null ? void 0 : selection.removeAllRanges();
    selection == null ? void 0 : selection.addRange(range);
  });
  view.registerDomEvent(keyLabelDiv, "blur", async () => {
    var _a;
    const newKey = (_a = keyLabelDiv.textContent) == null ? void 0 : _a.trim();
    if (newKey && newKey !== key) {
      const oldFullKey = container.getAttribute("data-key") || fullKey;
      fullKey = oldFullKey.split(".").slice(0, -1).concat(newKey).join(".");
      await changeKeyName(app, view.currentFile, oldFullKey, newKey);
      key = newKey;
      container.setAttribute("data-key", fullKey);
      const childElements = container.querySelectorAll("[data-key]");
      childElements.forEach((el) => {
        const childKey = el.getAttribute("data-key");
        if (childKey) {
          const newChildKey = childKey.replace(oldFullKey, fullKey);
          el.setAttribute("data-key", newChildKey);
        }
      });
    }
    keyLabelDiv.contentEditable = "false";
  });
  const addButton = keyWrapper.createDiv({ cls: "npe-button npe-button--add", text: "+" });
  view.registerDomEvent(addButton, "click", () => {
    const newKey = "new key";
    const newValue = "new value";
    value[newKey] = newValue;
    propertiesContainer.empty();
    renderObject(view, value, propertiesContainer, filterKeys, level + 1, fullKey);
    updateProperties(view.app, view.currentFile, fullKey, value, "object");
  });
  keyContainer.createDiv({ cls: "npe-object-value-spacer" });
  const npeViewContainer = container.closest(".npe-view-container");
  if (npeViewContainer) {
    addKeyWrapperResizeHandle(view, keyWrapper, npeViewContainer);
  }
  const removeButton = keyContainer.createDiv({ cls: "npe-button npe-button--remove", text: "\xD7" });
  view.registerDomEvent(removeButton, "click", () => {
    updateProperties(view.app, view.currentFile, fullKey, void 0, "undefined");
    container.remove();
  });
  const propertiesContainer = container.createDiv({ cls: "npe-object-properties-container" });
  if (level > 0) {
    propertiesContainer.addClass("hidden");
  }
  addToggleEvent(view, iconContainer, keyLabelDiv, propertiesContainer);
  renderObject(view, value, propertiesContainer, filterKeys, level + 1, fullKey, isArrayItem);
}

// src/ui/renderer/npe/helpers/showTypeSwitchMenu.ts
function showTypeSwitchMenu(view, container, key, fullKey, level, isKeyOfArrayObject) {
  const app = view.app;
  const dataTypes = ["text", "number", "boolean", "link", "object", "list"];
  const defaultValues = {
    "text": "new text",
    "number": 0,
    "boolean": false,
    "link": "new link",
    "object": { newKey: "new value" },
    "array": ["item1", "item2"]
  };
  const menu = new import_obsidian2.Menu();
  dataTypes.forEach((newDataType) => {
    menu.addItem((item) => {
      item.setTitle(newDataType).onClick(() => {
        let newValue = defaultValues[newDataType];
        let newInputValue = newValue;
        if (newDataType !== container.getAttribute("data-type")) {
          const value = getFrontmatterValue(app, fullKey);
          if (newDataType === "object") {
            if (value) newValue = { key: value };
            else newValue = defaultValues["object"];
            container.innerHTML = "";
            container.setAttribute("data-type", newDataType);
            container.className = "npe-object-container";
            renderObjectContainer(view, key, newValue, container, level, fullKey, [], isKeyOfArrayObject);
            updateProperties(view.app, view.currentFile, fullKey, newValue, newDataType);
          } else if (newDataType === "list") {
            newValue = value ? [value] : defaultValues["array"];
            container.innerHTML = "";
            container.setAttribute("data-type", newDataType);
            container.className = "npe-array-container npe-primitive-array";
            renderArray(view, key, newValue, container, level, fullKey, [], true);
            updateProperties(view.app, view.currentFile, fullKey, newValue, newDataType);
          } else {
            if (value) {
              if (newDataType === "link" && container.getAttribute("data-type") === "text") {
                newValue = `[[${value}]]`;
                newInputValue = value;
              } else if (newDataType === "text" && container.getAttribute("data-type") === "link") {
                const stringValue = typeof value === "string" ? value : String(value);
                newValue = stringValue.slice(2, -2);
                newInputValue = newValue;
              }
            }
            container.innerHTML = "";
            container.setAttribute("data-type", newDataType);
            const update = true;
            renderPrimitive(view, key, newInputValue, container, level, fullKey, isKeyOfArrayObject, update);
            updateProperties(view.app, view.currentFile, fullKey, newInputValue, newDataType);
          }
        }
      });
    });
  });
  menu.showAtMouseEvent({
    // @ts-ignore
    clientX: container.getBoundingClientRect().left + 20,
    clientY: container.getBoundingClientRect().top + 20,
    preventDefault: () => {
    },
    stopPropagation: () => {
    }
  });
}

// src/ui/renderer/npe/core/renderPrimitive.ts
function renderPrimitive(view, key, value, parent, level, fullKey, isKeyOfArrayObject = false, update = false) {
  const app = view.app;
  const file = view.currentFile;
  if (!file) return;
  const { dataType, inputType, inputValue, icon, callback } = getPrimitiveDetails(key, value);
  const container = update ? parent : parent.createDiv({ cls: "npe-key-value-container" });
  container.setAttribute("data-level", level.toString());
  container.setAttribute("data-key", fullKey);
  container.setAttribute("data-type", dataType);
  const keyWrapper = container.createDiv({ cls: "npe-primitive npe-key-wrapper" });
  keyWrapper.style.setProperty("--npe-data-level", level.toString());
  const keyDiv = keyWrapper.createDiv({ cls: "npe-key npe-primitive" });
  if (icon) {
    const iconDiv = keyDiv.createDiv({ cls: "npe-key-icon" });
    (0, import_obsidian3.setIcon)(iconDiv, icon);
  }
  const keyLabelDiv = keyDiv.createDiv({ cls: "npe-key-label npe-primitive npe-editable-key", text: key });
  keyLabelDiv.style.setProperty("--npe-data-level", level.toString());
  keyLabelDiv.contentEditable = "true";
  view.registerDomEvent(keyLabelDiv, "blur", async () => {
    var _a;
    const newKey = (_a = keyLabelDiv.textContent) == null ? void 0 : _a.trim();
    if (newKey && newKey !== key) {
      const oldFullKey = container.getAttribute("data-key") || fullKey;
      fullKey = oldFullKey.split(".").slice(0, -1).concat(newKey).join(".");
      await changeKeyName(app, file, oldFullKey, newKey);
      key = newKey;
      container.setAttribute("data-key", fullKey);
    }
  });
  const npeViewContainer = container.closest(".npe-view-container");
  if (npeViewContainer) {
    addKeyWrapperResizeHandle(view, keyWrapper, npeViewContainer);
  }
  const valueDiv = container.createDiv({ cls: "npe-value" });
  valueDiv.setAttribute("data-type", dataType);
  if (dataType === "external-link") {
    createExternalLinkElement(view, inputValue, valueDiv, fullKey);
  } else if (dataType === "link") {
    createInternalLinkElement(view, inputValue, valueDiv, fullKey);
  } else if (dataType === "latex") {
    const latexDiv = valueDiv.createDiv({ cls: "npe-latex" });
    latexDiv.innerHTML = latexToHTML(inputValue);
    fullKey = container.getAttribute("data-key") || fullKey;
    view.registerDomEvent(latexDiv, "click", () => {
      const val = getFrontmatterValue(app, fullKey);
      let stringVal = "";
      if (typeof val === "string") {
        stringVal = val.startsWith("$") && val.endsWith("$") ? val.slice(1, -1) : val;
      } else if (val != null) {
        stringVal = String(val);
      }
      latexDiv.innerHTML = stringVal;
      latexDiv.contentEditable = "true";
      latexDiv.focus();
    });
    view.registerDomEvent(latexDiv, "blur", () => {
      const newValue = latexDiv.textContent || "";
      fullKey = container.getAttribute("data-key") || fullKey;
      if (view.currentFile) {
        updateProperties(view.app, view.currentFile, fullKey, newValue, "latex");
      }
      latexDiv.innerHTML = latexToHTML(newValue);
      latexDiv.contentEditable = "false";
    });
  } else if (inputType) {
    const input = valueDiv.createEl("input", {
      type: inputType,
      value: inputType === "checkbox" ? void 0 : String(inputValue),
      attr: { "data-key": fullKey, "data-type": dataType }
    });
    if (inputType === "checkbox") input.checked = !!inputValue;
    view.registerDomEvent(input, "blur", () => {
      if (callback) {
        callback(inputType === "checkbox" ? input.checked : input.value);
      }
      fullKey = container.getAttribute("data-key") || fullKey;
      if (view.currentFile) {
        updateProperties(view.app, view.currentFile, fullKey, inputType === "checkbox" ? input.checked : input.value, dataType);
      }
      if (isKeyOfArrayObject && key === "name") {
        const objectFullKey = fullKey.split(".").slice(0, -1).join(".");
        const objectItemContainer = parent.closest(`.npe-object-container[data-key="${objectFullKey}"]`);
        const objectKeyLabelDiv = objectItemContainer == null ? void 0 : objectItemContainer.querySelector(".npe-key-label.npe-object");
        if (objectKeyLabelDiv) objectKeyLabelDiv.textContent = input.value;
      }
    });
  } else {
    valueDiv.textContent = value !== null ? value.toString() : "";
  }
  const removeButton = container.createDiv({ cls: "npe-button npe-button--remove", text: "\xD7" });
  view.registerDomEvent(removeButton, "click", () => {
    if (view.currentFile) {
      updateProperties(view.app, view.currentFile, fullKey, void 0, "undefined");
    }
    container.remove();
  });
  const optionsButton = keyWrapper.createDiv({ cls: "npe-button npe-button--options" });
  (0, import_obsidian3.setIcon)(optionsButton, "ellipsis");
  view.registerDomEvent(optionsButton, "click", () => {
    showTypeSwitchMenu(view, container, key, fullKey, level, isKeyOfArrayObject);
  });
}
function getPrimitiveDetails(key, value) {
  let dataType = typeof value;
  if (dataType === "string") {
    dataType = detectStringType(value);
  }
  const inputType = getPropertyInputType(dataType);
  let inputValue = parsePrimitiveValue(dataType, value);
  if (inputValue === null) {
    inputValue = "";
  }
  const icon = getPropertyIcon(key, dataType);
  const callback = (input) => {
    if (dataType === "boolean") {
      inputValue = input ? "checked" : "";
    } else if (dataType === "number") {
      inputValue = parseFloat(input);
    } else if (dataType === "string" || dataType === "link" || dataType === "external-link" || dataType === "date" || dataType === "latex") {
      inputValue = input;
    } else {
      console.warn(`Unknown data type: ${dataType}. Input not processed.`);
    }
  };
  return { dataType, inputType, inputValue, icon, callback };
}
function parsePrimitiveValue(dataType, value) {
  const valueTransform = {
    string: (v) => String(v != null ? v : ""),
    number: (v) => typeof v === "string" ? parseFloat(v) : Number(v != null ? v : 0),
    boolean: (v) => Boolean(v),
    link: (v) => {
      const str = String(v != null ? v : "");
      return str.startsWith("[[") && str.endsWith("]]") ? str.slice(2, -2) : str;
    },
    "external-link": (v) => String(v != null ? v : ""),
    date: (v) => String(v != null ? v : ""),
    latex: (v) => {
      const str = String(v != null ? v : "");
      return str.startsWith("$") && str.endsWith("$") ? str.slice(1, -1) : str;
    },
    unknown: (v) => String(v != null ? v : "")
  };
  if (dataType in valueTransform) {
    return valueTransform[dataType](value);
  } else {
    console.warn(`Unknown data type: ${dataType}. Returning value as is.`);
    return value;
  }
}
function detectStringType(value) {
  let strType;
  if (value.startsWith("[[") && value.endsWith("]]")) {
    strType = "link";
    value = value.slice(2, -2);
  } else if (/^\[.*\]\(.*\)$/.test(value)) {
    strType = "external-link";
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    strType = "date";
  } else if (/^\$.*\$$/.test(value)) {
    strType = "latex";
    value = value.slice(1, -1);
  } else {
    strType = "string";
  }
  return strType;
}

// src/ui/renderer/npe/core/renderPrimitiveArray.ts
var import_obsidian4 = require("obsidian");

// src/ui/renderer/npe/helpers/getDataType.ts
function getDataType(value) {
  if (typeof value === "string") {
    return detectStringType2(value);
  } else if (typeof value === "number") {
    return "number";
  } else if (typeof value === "boolean") {
    return "boolean";
  } else {
    return "unknown";
  }
}
function detectStringType2(value) {
  let strType;
  if (value.startsWith("[[") && value.endsWith("]]")) {
    strType = "link";
    value = value.slice(2, -2);
  } else if (/^\[.*\]\(.*\)$/.test(value)) {
    strType = "external-link";
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    strType = "date";
  } else if (/^\$.*\$$/.test(value)) {
    strType = "latex";
    value = value.slice(1, -1);
  } else {
    strType = "string";
  }
  return strType;
}

// src/ui/renderer/npe/core/renderArrayValueContainer.ts
function renderArrayValueContainer(view, valueContainer, array, fullKey) {
  const app = view.app;
  const key = fullKey.split(".").pop();
  array.forEach((item, index) => {
    const itemDataType = getDataType(item);
    const itemContainer = valueContainer.createDiv({ cls: "npe-list-item" });
    if (key === "tags" || key === "tag") {
      itemContainer.addClass("npe-tag-item");
    }
    if (itemDataType === "link") {
      const linkValue = typeof item === "string" ? item.slice(2, -2) : String(item);
      createInternalLinkElement(view, linkValue, itemContainer, `${fullKey}.${index}`);
    } else if (itemDataType === "external-link") {
      const linkValue = typeof item === "string" ? item : String(item);
      createExternalLinkElement(view, linkValue, itemContainer, `${fullKey}.${index}`);
    } else if (itemDataType === "string" || itemDataType === "number") {
      const input = itemContainer.createDiv({ cls: "npe-list-item-value", text: String(item) });
      input.contentEditable = "true";
      view.registerDomEvent(input, "blur", () => {
        updateProperties(view.app, view.currentFile, `${fullKey}.${index}`, input.textContent, itemDataType);
      });
    } else {
      let inputType;
      switch (itemDataType) {
        case "date":
          inputType = "date";
          break;
        case "boolean":
          inputType = "checkbox";
          break;
        default:
          inputType = "text";
      }
      const input = itemContainer.createEl("input", {
        type: inputType,
        value: typeof item === "string" || typeof item === "number" ? String(item) : "",
        attr: { "data-key": `${fullKey}.${index}`, "data-type": itemDataType }
      });
      input.oninput = () => {
        updateProperties(view.app, view.currentFile, `${fullKey}.${index}`, input.value, itemDataType);
        array[index] = input.value;
      };
    }
    const removeButton = itemContainer.createDiv({ cls: "npe-button npe-button--remove", text: "\xD7" });
    view.registerDomEvent(removeButton, "click", () => {
      const arr = getFrontmatterValue(app, fullKey);
      if (Array.isArray(arr)) {
        arr.splice(index, 1);
        valueContainer.innerHTML = "";
        renderArrayValueContainer(view, valueContainer, arr, fullKey);
        updateProperties(view.app, view.currentFile, fullKey, arr, "array");
      }
    });
  });
  const addButton = valueContainer.createDiv({ cls: "npe-button npe-button--add", text: "+" });
  view.registerDomEvent(addButton, "click", () => {
    const arr = getFrontmatterValue(app, fullKey);
    if (Array.isArray(arr)) {
      arr.push("new item");
      valueContainer.innerHTML = "";
      renderArrayValueContainer(view, valueContainer, arr, fullKey);
      updateProperties(view.app, view.currentFile, fullKey, arr, "array");
    }
  });
}

// src/ui/renderer/npe/core/renderPrimitiveArray.ts
function renderPrimitiveArray(view, key, array, container, level, parentKey, filterKeys, update = false) {
  const app = view.app;
  const fullKey = parentKey;
  const icon = getPropertyIcon(key, "list");
  const arrayContainer = update ? container : container.createDiv({
    cls: "npe-array-container npe-primitive-array",
    attr: { "data-key": fullKey, "data-level": level }
  });
  const keyWrapper = arrayContainer.createDiv({
    cls: "npe-key-wrapper npe-array",
    attr: { "style": `--npe-data-level: ${level};` }
  });
  const keyContainer = keyWrapper.createDiv({ cls: "npe-key npe-array" });
  const iconContainer = keyContainer.createDiv({ cls: "npe-key-icon" });
  (0, import_obsidian4.setIcon)(iconContainer, icon);
  const keyLabelDiv = keyContainer.createDiv({ cls: "npe-key-label npe-array", text: key });
  keyLabelDiv.contentEditable = "true";
  view.registerDomEvent(keyLabelDiv, "blur", async () => {
    var _a;
    const newKey = (_a = keyLabelDiv.textContent) == null ? void 0 : _a.trim();
    if (newKey && newKey !== key) {
      await changeKeyName(app, view.currentFile, fullKey, newKey);
      updateDataKeys(arrayContainer, fullKey, newKey);
    }
  });
  const optionsButton = keyWrapper.createDiv({ cls: "npe-button npe-button--options" });
  (0, import_obsidian4.setIcon)(optionsButton, "ellipsis");
  view.registerDomEvent(optionsButton, "click", () => {
    showTypeSwitchMenu(view, arrayContainer, key, fullKey, level, false);
  });
  const npeViewContainer = arrayContainer.closest(".npe-view-container");
  if (npeViewContainer) {
    addKeyWrapperResizeHandle(view, keyWrapper, npeViewContainer);
  }
  const valueContainer = arrayContainer.createDiv({ cls: "npe-array-value-container", attr: { "style": `--npe-data-level: ${level};` } });
  renderArrayValueContainer(view, valueContainer, array, fullKey);
  const removeButton = arrayContainer.createDiv({ cls: "npe-button npe-button--remove", text: "\xD7" });
  view.registerDomEvent(removeButton, "click", () => {
    if (view.currentFile) {
      updateProperties(view.app, view.currentFile, fullKey, void 0, "undefined");
    }
    arrayContainer.remove();
  });
}
function updateDataKeys(element, oldKey, newKey) {
  const keybase = oldKey.split(".").slice(0, -1).join(".");
  const newFullKey = `${keybase}.${newKey}`;
  element.setAttribute("data-key", newFullKey);
  const children = element.querySelectorAll("[data-key]");
  children.forEach((child) => {
    const fullKey = child.getAttribute("data-key");
    if (fullKey) {
      const newFullKeyChild = fullKey.replace(oldKey, newFullKey);
      child.setAttribute("data-key", newFullKeyChild);
    }
  });
}

// src/ui/renderer/npe/core/renderObjectOfArray.ts
var import_obsidian5 = require("obsidian");
function renderObjectOfArray(view, key, item, index, parent, level, fullKey, filterKeys) {
  const itemContainer = parent.createDiv({
    cls: "npe-array npe-object-container",
    attr: { "data-key": fullKey }
  });
  const keyContainer = itemContainer.createDiv({
    cls: "npe-object-key-container",
    attr: { style: `--npe-data-level: ${level + 1};` }
  });
  const keyWrapper = keyContainer.createDiv({
    cls: "npe-key-wrapper npe-object",
    attr: { "style": `--npe-data-level: ${level + 1};` }
  });
  const keyDiv = keyWrapper.createDiv({ cls: "npe-key npe-object" });
  const icon = getPropertyIcon(key, "object");
  const iconDiv = keyDiv.createDiv({ cls: "npe-key-icon" });
  (0, import_obsidian5.setIcon)(iconDiv, icon);
  const keyLabelDiv = keyDiv.createDiv({ cls: "npe-key-label npe-object", text: key });
  keyLabelDiv.createSpan({ text: ` #${index + 1}`, cls: "npe-array-index" });
  const addPropertyButton = keyWrapper.createDiv({ cls: "npe-button npe-button--add", text: "+" });
  view.registerDomEvent(addPropertyButton, "click", () => {
    const newKey = `new key`;
    const newValue = "new value";
    const newFullKey = `${fullKey}.${newKey}`;
    if (view.currentFile) {
      updateProperties(view.app, view.currentFile, newFullKey, newValue, "string");
    }
    renderPrimitive(view, newKey, newValue, propertiesContainer, level + 2, newFullKey, true);
  });
  const npeViewContainer = parent.closest(".npe-view-container");
  if (npeViewContainer) {
    addKeyWrapperResizeHandle(view, keyWrapper, npeViewContainer);
  }
  const removeButton = keyContainer.createDiv({ cls: "npe-button npe-button--remove", text: "\xD7" });
  view.registerDomEvent(removeButton, "click", () => {
    itemContainer.remove();
    if (view.currentFile) {
      updateProperties(view.app, view.currentFile, fullKey, void 0, "undefined");
    }
  });
  const propertiesContainer = itemContainer.createDiv({ cls: "npe-object-properties-container hidden" });
  addToggleEvent(view, iconDiv, keyLabelDiv, propertiesContainer);
  renderObject(view, item, propertiesContainer, filterKeys, level + 2, fullKey);
}

// src/utils/Logger.ts
var DEFAULT_CONFIG = {
  main: "info",
  npe: "warn",
  // NPE is stable, only show warnings/errors
  modal: "debug",
  // Modals are being worked on
  api: "info",
  // API calls are generally stable
  template: "debug",
  // Template processing is being worked on
  note: "debug",
  // Note creation is being worked on
  path: "info",
  // Path parsing is stable
  metadata: "debug",
  // Metadata processing is being worked on
  settings: "warn",
  // Settings UI has issues, show warnings
  ui: "info",
  // General UI is mostly stable
  events: "info",
  // Events are stable
  navbar: "info",
  // Navbar is stable
  view: "info",
  // Views are stable
  general: "info"
  // General logging
};
var Logger = class {
  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.enabled = true;
  }
  /**
   * Update the logging configuration
   */
  setConfig(config) {
    this.config = { ...this.config, ...config };
  }
  /**
   * Enable or disable all logging
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }
  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Check if a log level should be output for a component
   */
  shouldLog(component, level) {
    if (!this.enabled) return false;
    const componentLevel = this.config[component];
    const levels = ["debug", "info", "warn", "error"];
    const componentLevelIndex = levels.indexOf(componentLevel);
    const requestedLevelIndex = levels.indexOf(level);
    return requestedLevelIndex >= componentLevelIndex;
  }
  /**
   * Format log message with component prefix
   */
  formatMessage(component, message) {
    return `[${component.toUpperCase()}] ${message}`;
  }
  /**
   * Debug logging
   */
  debug(component, message, ...args) {
    if (this.shouldLog(component, "debug")) {
      console.debug(this.formatMessage(component, message), ...args);
    }
  }
  /**
   * Info logging
   */
  info(component, message, ...args) {
    if (this.shouldLog(component, "info")) {
      console.info(this.formatMessage(component, message), ...args);
    }
  }
  /**
   * Warning logging
   */
  warn(component, message, ...args) {
    if (this.shouldLog(component, "warn")) {
      console.warn(this.formatMessage(component, message), ...args);
    }
  }
  /**
   * Error logging
   */
  error(component, message, ...args) {
    if (this.shouldLog(component, "error")) {
      console.error(this.formatMessage(component, message), ...args);
    }
  }
  /**
   * Set log level for a specific component
   */
  setComponentLevel(component, level) {
    this.config[component] = level;
  }
  /**
   * Enable debug logging for a component (useful for debugging)
   */
  enableDebugFor(component) {
    this.setComponentLevel(component, "debug");
  }
  /**
   * Disable debug logging for a component (only show warnings/errors)
   */
  quietComponent(component) {
    this.setComponentLevel(component, "warn");
  }
  /**
   * Create a component-specific logger that automatically prefixes the component
   */
  createComponentLogger(component) {
    return {
      debug: (message, ...args) => this.debug(component, message, ...args),
      info: (message, ...args) => this.info(component, message, ...args),
      warn: (message, ...args) => this.warn(component, message, ...args),
      error: (message, ...args) => this.error(component, message, ...args)
    };
  }
};
var logger = new Logger();
function createLogger(component) {
  return logger.createComponentLogger(component);
}

// src/ui/renderer/npe/core/renderObjectArray.ts
var logger2 = createLogger("npe");
var specialKeys = [
  "tags",
  "tag",
  "cssclass",
  "cssclasses",
  "author",
  "series",
  "project",
  "sample",
  "process",
  "analysis"
];
function renderObjectArray(view, key, array, container, level, parentKey, filterKeys) {
  const app = view.app;
  container.className = "npe-array-container npe-object-array";
  let fullKey = parentKey;
  let icon = "boxes";
  if (specialKeys.includes(key)) {
    icon = getPropertyIcon(key, "array");
  }
  const keyContainer = container.createDiv({
    cls: "npe-object-key-container",
    attr: { style: `--npe-data-level: ${level};` }
  });
  const keyWrapper = keyContainer.createDiv({
    cls: "npe-key-wrapper npe-object",
    attr: { "style": `--npe-data-level: ${level};` }
  });
  const keyDiv = keyWrapper.createDiv({ cls: "npe-object-key" });
  const iconContainer = keyDiv.createDiv({ cls: "npe-icon-container" });
  (0, import_obsidian6.setIcon)(iconContainer, icon);
  const keyLabelDiv = keyDiv.createDiv({ cls: "npe-key-label npe-object", text: key });
  const editableDiv = keyDiv.createDiv({ cls: "npe-make-editable" });
  view.registerDomEvent(editableDiv, "click", (evt) => {
    keyLabelDiv.contentEditable = "true";
    keyLabelDiv.focus();
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(keyLabelDiv);
    range.collapse(false);
    selection == null ? void 0 : selection.removeAllRanges();
    selection == null ? void 0 : selection.addRange(range);
  });
  view.registerDomEvent(keyLabelDiv, "blur", async () => {
    var _a;
    const newKey = (_a = keyLabelDiv.textContent) == null ? void 0 : _a.trim();
    if (newKey && newKey !== key) {
      const oldFullKey = container.getAttribute("data-key") || fullKey;
      fullKey = oldFullKey.split(".").slice(0, -1).concat(newKey).join(".");
      await changeKeyName(app, view.currentFile, oldFullKey, newKey);
      keyLabelDiv.setAttribute("data-key", newKey);
      key = newKey;
      container.setAttribute("data-key", fullKey);
      const childElements = container.querySelectorAll("[data-key]");
      childElements.forEach((el) => {
        const childKey = el.getAttribute("data-key");
        if (childKey) {
          const newChildKey = childKey.replace(oldFullKey, fullKey);
          el.setAttribute("data-key", newChildKey);
        }
      });
    }
  });
  const arrayObjectsContainer = container.createDiv({ cls: "npe-array-objects-container" });
  if (level > 0) arrayObjectsContainer.classList.add("hidden");
  addToggleEvent(view, iconContainer, keyLabelDiv, arrayObjectsContainer);
  const addButton = keyWrapper.createDiv({ cls: "npe-button npe-button--add", text: "+" });
  view.registerDomEvent(addButton, "click", () => {
    const arr = getFrontmatterValue(app, fullKey);
    if (arr.length === 0) {
      arr.push({});
    } else {
      const keys = Object.keys(arr[0]);
      const newObj = {};
      keys.forEach((k) => {
        newObj[k] = "~~";
      });
      arr.push(newObj);
    }
    renderObjectOfArray(view, key, arr[arr.length - 1], arr.length - 1, arrayObjectsContainer, level, `${fullKey}.${arr.length - 1}`, filterKeys);
    if (view.currentFile) {
      updateProperties(view.app, view.currentFile, fullKey, arr, "array");
    }
  });
  const npeViewContainer = container.closest(".npe-view-container");
  if (npeViewContainer) {
    addKeyWrapperResizeHandle(view, keyWrapper, npeViewContainer);
  }
  keyContainer.createDiv({ cls: "npe-object-value-spacer" });
  const removeButton = keyContainer.createDiv({ cls: "npe-button npe-button--remove", text: "\xD7" });
  view.registerDomEvent(removeButton, "click", () => {
    if (view.currentFile) {
      updateProperties(view.app, view.currentFile, fullKey, void 0, "undefined");
    }
    container.remove();
  });
  array.forEach((item, index) => {
    if (Array.isArray(item) && item.every((value) => typeof value !== "object" || value === null)) {
      logger2.debug(`renderObjectArray: Rendering primitive array for key: ${key}, index: ${index}`);
      renderPrimitiveArray(view, `${key} #${index + 1}`, item, arrayObjectsContainer, level + 1, `${fullKey}.${index}`, filterKeys, false);
    } else if (Array.isArray(item) && item.every((value) => Array.isArray(value))) {
      logger2.debug(`renderObjectArray: Rendering nested array for key: ${key}, index: ${index}`);
      renderArray(view, `${key} #${index + 1}`, item, arrayObjectsContainer, level + 1, `${parentKey}.${index}`, filterKeys, false);
    } else {
      if (typeof item === "object" && item !== null) {
        logger2.debug(`renderObjectArray: Rendering object of array for key: ${key}, index: ${index}`);
        renderObjectOfArray(view, key, item, index, arrayObjectsContainer, level, `${fullKey}.${index}`, filterKeys);
      } else if (Array.isArray(item)) {
        logger2.debug(`renderObjectArray: Rendering nested array for key: ${key}, index: ${index}`);
        renderArray(view, `${key} #${index + 1}`, item, arrayObjectsContainer, level + 1, `${parentKey}.${index}`, filterKeys, false);
      } else if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") {
        logger2.debug(`renderObjectArray: Rendering primitive for key: ${key}, index: ${index}`);
        renderPrimitive(view, `${key} #${index + 1}`, item, arrayObjectsContainer, level + 1, `${fullKey}.${index}`, false);
      } else {
        logger2.warn(`renderObjectArray: Unsupported item type ${typeof item} for key: ${key}, index: ${index}`, item);
      }
    }
  });
}

// src/ui/renderer/npe/core/renderArray.ts
function renderArray(view, key, array, container, level, parentKey, filterKeys, update = false) {
  const fullKey = parentKey;
  const arrayType = array.some((item) => typeof item === "object" && item !== null && !Array.isArray(item)) ? "object" : "primitive";
  if (arrayType === "primitive") {
    const primitiveArray = array.filter(
      (item) => typeof item === "string" || typeof item === "number" || typeof item === "boolean" || item === null
    );
    renderPrimitiveArray(view, key, primitiveArray, container, level, fullKey, filterKeys, update);
  } else {
    const objectArray = array.filter(
      (item) => typeof item === "object" && item !== null && !Array.isArray(item)
    );
    const arrayContainer = update ? container : container.createDiv({
      cls: "npe-array-container npe-object-array",
      attr: { "data-key": fullKey, "data-level": level }
    });
    renderObjectArray(view, key, objectArray, arrayContainer, level, fullKey, filterKeys);
  }
}

// src/ui/renderer/npe/core/renderObject.ts
function renderObject(view, obj, parent, filterKeys = [], level = 0, parentKey = "", isArrayItem = false) {
  if (!obj || typeof obj !== "object") {
    return;
  }
  Object.entries(obj).forEach(([key, value]) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    if (filterKeys.includes(fullKey)) {
      return;
    }
    if (Array.isArray(value)) {
      renderArray(view, key, value, parent, level, fullKey, filterKeys);
    } else if (typeof value === "object" && value !== null) {
      renderObjectContainer(view, key, value, parent, level, fullKey, filterKeys);
    } else {
      renderPrimitive(view, key, value, parent, level, fullKey);
    }
  });
}

// src/ui/renderer/npe/buttons/createToggleButton.ts
var import_obsidian7 = require("obsidian");
function createToggleButton(view, buttonContainer, propertiesContainer) {
  const toggleButton = buttonContainer.createDiv({ cls: "clickable-icon" });
  toggleButton.setAttribute("aria-label", "Collapse All");
  (0, import_obsidian7.setIcon)(toggleButton, "chevrons-down-up");
  let allCollapsed = true;
  const toggleAll = () => {
    const allPropertiesContainers = propertiesContainer.querySelectorAll(
      ".npe-object-properties-container, .npe-array-objects-container"
    );
    allPropertiesContainers.forEach((container) => {
      container.classList.toggle("hidden", allCollapsed);
    });
    allCollapsed = !allCollapsed;
    (0, import_obsidian7.setIcon)(toggleButton, allCollapsed ? "chevrons-down-up" : "chevrons-up-down");
    toggleButton.setAttribute("aria-label", allCollapsed ? "Collapse All" : "Expand All");
  };
  view.registerDomEvent(toggleButton, "click", toggleAll);
}

// src/ui/renderer/npe/buttons/createReloadButton.ts
var import_obsidian8 = require("obsidian");
function createReloadButton(view, buttonContainer, propertiesContainer, parentKey, filterKeys) {
  const reloadButton = buttonContainer.createDiv({ cls: "clickable-icon" });
  reloadButton.setAttribute("aria-label", "Reload Frontmatter");
  (0, import_obsidian8.setIcon)(reloadButton, "refresh-cw");
  view.registerDomEvent(reloadButton, "click", async () => {
    const activeFile = view.app.workspace.getActiveFile();
    if (!activeFile) return;
    const fileCache = view.app.metadataCache.getFileCache(activeFile);
    let frontmatter = fileCache == null ? void 0 : fileCache.frontmatter;
    if (parentKey) {
      parentKey.split(".").forEach((key) => {
        frontmatter = frontmatter == null ? void 0 : frontmatter[key];
      });
    }
    propertiesContainer.innerHTML = "";
    if (frontmatter) {
      renderObject(view, frontmatter, propertiesContainer, filterKeys, 0, parentKey);
    }
  });
  return reloadButton;
}

// src/ui/renderer/npe/buttons/createAddPropertyButton.ts
var import_obsidian9 = require("obsidian");

// src/ui/renderer/npe/helpers/addProperty.ts
async function addProperty(app, file, key, value, dataType = "string") {
  var _a, _b;
  if (file.extension !== "md") return;
  switch (dataType) {
    case "string":
      value = (_a = value == null ? void 0 : value.toString()) != null ? _a : "";
      break;
    case "link":
      value = `[[${value != null ? value : ""}]]`;
      break;
    case "external-link":
      value = (_b = value == null ? void 0 : value.toString()) != null ? _b : "";
      break;
    case "number":
      value = Number(value);
      break;
    case "boolean":
      break;
    default:
      break;
  }
  await app.fileManager.processFrontMatter(file, (frontmatter) => {
    const keys = key.split(".");
    let obj = frontmatter;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) {
        obj[keys[i]] = {};
      }
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
  });
}

// src/ui/renderer/npe/buttons/createAddPropertyButton.ts
function createAddPropertyButton(view, buttonContainer, propertiesContainer) {
  const app = view.app;
  const newPropertyKey = "new key";
  let newKey = newPropertyKey;
  const newPropertyValue = "new item";
  const plusBtn = buttonContainer.createDiv({ cls: "clickable-icon" });
  plusBtn.setAttribute("aria-label", "Add new property");
  (0, import_obsidian9.setIcon)(plusBtn, "plus");
  view.registerDomEvent(plusBtn, "click", async (evt) => {
    var _a;
    const file = view.currentFile;
    if (file) {
      const frontmatter = (_a = app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter;
      if (frontmatter && frontmatter[newPropertyKey]) {
        let i = 1;
        newKey = `${newPropertyKey} ${i}`;
        while (frontmatter[newKey]) {
          i++;
          newKey = `${newPropertyKey} ${i}`;
        }
      }
      await addProperty(app, file, newKey, newPropertyValue, "string");
      renderPrimitive(
        view,
        newKey,
        newPropertyValue,
        propertiesContainer,
        0,
        newKey,
        false,
        false
      );
    }
  });
  return plusBtn;
}

// src/ui/renderer/npe/buttons/createFixDepricatedPropertiesButton.ts
var import_obsidian10 = require("obsidian");

// src/ui/renderer/npe/utils/fixDeprecatedKey.ts
var deprecatedToPlural = {
  tag: "tags",
  cssclass: "cssclasses",
  alias: "aliases"
  // Add more mappings as needed
};
function convertToArray(value) {
  if (Array.isArray(value)) {
    return value.map((v) => typeof v === "string" ? v.trim() : v);
  } else if (typeof value === "string") {
    if (value.includes(",")) {
      return value.split(",").map((v) => v.trim()).filter((v) => v.length > 0);
    } else {
      return [value.trim()];
    }
  }
  return [];
}
async function fixAllDeprecatedKeysInVault(app) {
  const files = app.vault.getMarkdownFiles();
  for (const file of files) {
    for (const [deprecatedKey, pluralKey] of Object.entries(deprecatedToPlural)) {
      console.debug(`Fixing deprecated key in file ${file.path}: ${deprecatedKey} -> ${pluralKey}`);
      await fixDeprecatedKey(app, file, deprecatedKey, pluralKey);
    }
  }
}
async function fixDeprecatedKey(app, file, deprecatedKey, pluralKey) {
  var _a;
  const frontmatter = (_a = app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter;
  if (!frontmatter) return;
  const hasSingular = Object.prototype.hasOwnProperty.call(frontmatter, deprecatedKey);
  const hasPlural = Object.prototype.hasOwnProperty.call(frontmatter, pluralKey);
  let pluralValue = [];
  if (hasPlural) {
    pluralValue = convertToArray(frontmatter[pluralKey]);
  }
  let singularValue = [];
  if (hasSingular) {
    singularValue = convertToArray(frontmatter[deprecatedKey]);
  }
  const cleanTags = (values, isTagField) => {
    if (!isTagField) return values;
    return values.map((v) => typeof v === "string" && v.startsWith("#") ? v.slice(1) : v);
  };
  if (hasSingular && hasPlural) {
    const merged = Array.from(/* @__PURE__ */ new Set([...pluralValue, ...singularValue]));
    const cleaned = cleanTags(merged, deprecatedKey === "tag" || pluralKey === "tags");
    await updateProperties(app, file, pluralKey, cleaned, "array");
    await updateProperties(app, file, deprecatedKey, void 0, "undefined");
  } else if (hasSingular && !hasPlural) {
    const cleaned = cleanTags(singularValue, deprecatedKey === "tag");
    await changeKeyName(app, file, deprecatedKey, pluralKey);
    await updateProperties(app, file, pluralKey, cleaned, "array");
  } else if (hasPlural && !hasSingular) {
    const cleaned = cleanTags(pluralValue, pluralKey === "tags");
    await updateProperties(app, file, pluralKey, cleaned, "array");
  }
}

// src/ui/renderer/npe/buttons/createFixDepricatedPropertiesButton.ts
function createFixDepricatedPropertiesButton(view, buttonContainer, propertiesContainer, parentKey, excludeKeys) {
  const btn = buttonContainer.createDiv({ cls: "clickable-icon" });
  btn.setAttribute("aria-label", "Fix deprecated properties (tag, cssclass, alias)");
  (0, import_obsidian10.setIcon)(btn, "wrench");
  view.registerDomEvent(btn, "click", async () => {
    var _a;
    let changed = false;
    const app = view.app;
    const file = view.currentFile;
    if (!file) return;
    const frontmatter = (_a = app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter;
    if (!frontmatter) return;
    for (const [deprecatedKey, pluralKey] of Object.entries(deprecatedToPlural)) {
      console.debug(`Fixing deprecated key: ${deprecatedKey} -> ${pluralKey}`);
      await fixDeprecatedKey(app, file, deprecatedKey, pluralKey);
      changed = true;
    }
    if (changed) {
      propertiesContainer.empty();
      renderObject(view, frontmatter, propertiesContainer, excludeKeys, 0, parentKey);
    }
  });
  return btn;
}

// src/ui/renderer/npe/buttons/createOptionsMenuButton.ts
var import_obsidian11 = require("obsidian");
function createOptionsMenuButton(app, buttonContainer, options) {
  const btn = buttonContainer.createDiv({ cls: "clickable-icon npe-options-menu-btn" });
  btn.setAttribute("aria-label", "Options");
  (0, import_obsidian11.setIcon)(btn, "ellipsis");
  btn.onclick = (e) => {
    e.stopPropagation();
    const menu = new import_obsidian11.Menu();
    if (options && options.length > 0) {
      for (const opt of options) {
        menu.addItem((item) => {
          item.setTitle(opt.label);
          if (opt.icon) item.setIcon(opt.icon);
          item.onClick(opt.callback);
        });
      }
    }
    menu.showAtMouseEvent(e);
  };
  return btn;
}

// src/ui/renderer/npe/core/renderFrontMatter.ts
function renderFrontMatter(view, subKey = "", excludeKeys = [], actionButtons = true, cssclasses = []) {
  var _a;
  const app = view.app;
  const container = view.contentEl.createDiv({ cls: "npe-view-container" });
  cssclasses.forEach((cls) => container.classList.add(cls));
  let buttonContainer = null;
  if (actionButtons) {
    buttonContainer = container.createDiv({ cls: "npe-button-container" });
  }
  const propertiesContainer = container.createDiv({ cls: "npe-properties-container" });
  if (view.currentFile && view.currentFile.extension === "md") {
    if (!view.app.vault.getAbstractFileByPath(view.currentFile.path)) {
      const infoContainer = propertiesContainer.createDiv({ cls: "npe-info-container" });
      const infoMessage = infoContainer.createDiv({ cls: "npe-info-message" });
      infoMessage.textContent = "The current file no longer exists.";
      return container;
    }
    const frontMatter = (_a = app.metadataCache.getFileCache(view.currentFile)) == null ? void 0 : _a.frontmatter;
    let parentKey = "";
    let fm = frontMatter;
    if (frontMatter && typeof frontMatter === "object" && subKey !== "") {
      subKey.split(".").forEach((key) => fm = fm[key]);
      parentKey = subKey;
    }
    if (buttonContainer) {
      createAddPropertyButton(view, buttonContainer, propertiesContainer);
      createToggleButton(view, buttonContainer, propertiesContainer);
      createReloadButton(view, buttonContainer, propertiesContainer, parentKey, excludeKeys);
      createFixDepricatedPropertiesButton(view, buttonContainer, propertiesContainer, parentKey, excludeKeys);
      createOptionsMenuButton(app, buttonContainer, [
        {
          label: "Fix all deprecated keys in vault",
          callback: async () => {
            await fixAllDeprecatedKeysInVault(app);
            new import_obsidian12.Notice("All deprecated keys in vault have been fixed.");
          }
        }
      ]);
    }
    renderObject(view, fm, propertiesContainer, excludeKeys, 0, parentKey);
  } else {
    const infoContainer = propertiesContainer.createDiv({ cls: "npe-info-container" });
    const infoIcon = infoContainer.createDiv({ cls: "npe-info-icon" });
    (0, import_obsidian12.setIcon)(infoIcon, "info");
    const infoMessage = infoContainer.createDiv({ cls: "npe-info-message" });
    infoMessage.textContent = `The current file is not a valid markdown file. Please open a markdown file to view and edit its frontmatter.`;
  }
  return container;
}

// src/core/api/ELNApi.ts
var ELNApi = class {
  constructor() {
    this.renderFrontMatter = renderFrontMatter;
  }
  // Add more public API methods here as needed
};

// src/data/templates/metadata/analysis.ts
var analysisMetadataTemplate = {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": { type: "function", value: "this.manifest.version" }
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["analysis"]
  },
  "date created": {
    "query": false,
    "inputType": "date",
    "default": { type: "function", value: "new Date().toISOString().split('T')[0]" }
  },
  "author": {
    "query": true,
    "inputType": "dropdown",
    "options": { type: "function", value: "this.settings.authors.map((item) => item.name)" }
  },
  "note type": {
    "query": false,
    "inputType": "text",
    "default": "analysis"
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": ["analysis"]
  }
  // Add the rest of the JSON content here...
};
var analysis_default = analysisMetadataTemplate;

// src/data/templates/metadata/chemical.ts
var chemicalMetadataTemplate = {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": { type: "function", value: "this.manifest.version" }
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["chemical"]
  },
  "date created": {
    "query": false,
    "inputType": "date",
    "default": { type: "function", value: "new Date().toISOString().split('T')[0]" }
  },
  "author": {
    "query": true,
    "inputType": "dropdown",
    "options": { type: "function", value: "this.settings.authors.map((item) => item.name)" }
  },
  "note type": {
    "query": false,
    "inputType": "text",
    "default": "chemical"
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": {
      type: "function",
      userInputs: ["chemical.type"],
      value: "chemical.type ? [`chemical/${chemical.type.replace(/\\s/g, '_')}`] : ['chemical/unknown']"
    }
  },
  "chemical": {
    "type": {
      "query": true,
      "inputType": "subclass",
      "options": { type: "function", value: "this.settings.note.chemical.type.map((item) => item.name)" }
    },
    "field of use": {
      "query": true,
      "inputType": "multiselect",
      "options": { type: "function", value: "this.settings.chemicalFieldOfUse" }
    },
    "name": {
      "query": true,
      "inputType": "actiontext",
      "default": "",
      "callback": { type: "function", value: "(value) => value.trim()" },
      "action": { type: "function", value: "(value, formData, updateField) => this.chemicalLookup.resolveChemicalIdentifier(value, formData, updateField)" },
      "icon": "search-check",
      "tooltip": "Lookup name in database"
    },
    "IUPAC name": {
      "query": true,
      "inputType": "text",
      "default": ""
    },
    "CAS": {
      "query": true,
      "inputType": "actiontext",
      "default": "",
      "callback": { type: "function", value: "(value) => value.trim()" },
      "action": { type: "function", value: "(value, formData, updateField) => this.chemicalLookup.resolveChemicalIdentifierCAS(value, formData, updateField)" },
      "icon": "search-check",
      "tooltip": "Lookup CAS in database"
    },
    "formula": {
      "query": true,
      "inputType": "text",
      "default": "",
      "callback": { type: "function", value: "(value) => `$${value.trim()}$`" }
    },
    "smiles": {
      "query": true,
      "inputType": "text",
      "default": ""
    },
    "properties": {
      "molar mass": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["g/mol"],
        "defaultUnit": "g/mol"
      },
      "density": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["g/cm\xB3", "g/mL"],
        "defaultUnit": "g/cm\xB3"
      },
      "melting point": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["\xB0C", "K"],
        "defaultUnit": "K"
      },
      "boiling point": {
        "query": true,
        "inputType": "text",
        "default": "",
        "units": ["\xB0C", "K"],
        "defaultUnit": "K"
      },
      "solubility in water": {
        "query": true,
        "inputType": "text",
        "default": "",
        "units": ["g/L", "mg/L", "mol/L"],
        "defaultUnit": "g/L"
      }
    },
    "batch": {
      "grade": {
        "query": true,
        "inputType": "text",
        "default": ""
      },
      "supplier": {
        "query": true,
        "inputType": "dropdown",
        "options": { type: "function", value: "this.settings.chemicalSupplier.map((item) => item.name)" },
        "callback": { type: "function", value: "(value) => value.trim()" }
      },
      "manufacturer": {
        "query": true,
        "inputType": "dropdown",
        "options": { type: "function", value: "this.settings.chemicalManufacturer.map((item) => item.name)" }
      },
      "product name": {
        "query": true,
        "inputType": "text",
        "default": ""
      },
      "delivery date": {
        "query": true,
        "inputType": "date",
        "default": { type: "function", value: "new Date().toISOString().split('T')[0]" }
      },
      "batch number": {
        "query": true,
        "inputType": "number",
        "default": 1
      },
      "quantity": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["mg", "g", "kg", "mL", "L"],
        "defaultUnit": "g"
      },
      "url": {
        "query": true,
        "inputType": "text",
        "default": "https://",
        "callback": { type: "function", value: "(value) => `[link to product](${value.trim()})`" }
      }
    },
    "safety": {
      "safety data sheet": {
        "query": false,
        "inputType": "text",
        "default": "msds-dummy.pdf",
        "callback": { type: "function", value: "(value) => `[[${value.trim()}|MSDS]]`" }
      },
      "h-statements": {
        "query": true,
        "inputType": "text",
        "default": "Hxxx, Hyyy",
        "callback": { type: "function", value: "(value) => (value ? value.replace(/\\s*\\+\\s*/, '+').split(/\\s*,\\s*|\\s*-\\s*/).map((item) => `[[${item}]]`) : [])" }
      },
      "p-statements": {
        "query": true,
        "inputType": "text",
        "default": "Pxxx, Pyyy",
        "callback": { type: "function", value: "(value) => (value ? value.replace(/\\s*\\+\\s*/, '+').split(/\\s*,\\s*|\\s*-\\s*/).map((item) => `[[${item}]]`) : [])" }
      },
      "threshold limit value": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["mg/m\xB3", "ppm"],
        "defaultUnit": "mg/m\xB3"
      },
      "toxicity": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["mg/kg", "g/kg", "mg\xB7kg\u207B\xB9", "g\xB7kg\u207B\xB9"],
        "defaultUnit": "mg\xB7kg\u207B\xB9"
      }
    }
  }
};
var chemical_default = chemicalMetadataTemplate;

// src/data/templates/metadata/contact.ts
var contactMetadataTemplate = {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": ""
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["contact"]
  },
  "date created": {
    "query": false,
    "inputType": "date",
    "default": { type: "function", value: "new Date().toISOString().split('T')[0]" }
  },
  "author": {
    "query": true,
    "inputType": "dropdown",
    "options": { type: "function", value: "this.settings.authors.map((item) => item.name)" }
  },
  "note type": {
    "query": false,
    "inputType": "text",
    "default": "contact"
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": ["contact"]
  },
  "name": {
    "title": {
      "query": true,
      "inputType": "text",
      "default": ""
    },
    "given name": {
      "query": true,
      "inputType": "text",
      "default": ""
    },
    "family name": {
      "query": true,
      "inputType": "text",
      "default": ""
    }
  },
  "contact": {
    "work": {
      "email": {
        "query": true,
        "inputType": "text",
        "default": "name@domain.edu"
      },
      "phone": {
        "query": true,
        "inputType": "text",
        "default": "+49 xxx xxx xxxx"
      },
      "mobile": {
        "query": true,
        "inputType": "text",
        "default": "+49 xxx xxx xxxx"
      },
      "fax": {
        "query": true,
        "inputType": "text",
        "default": "+49 xxx xxx xxxx"
      }
    }
  },
  "address": {
    "work": {
      "affiliation": {
        "query": true,
        "inputType": "text",
        "default": ""
      },
      "division": {
        "query": true,
        "inputType": "text",
        "default": ""
      },
      "street": {
        "query": true,
        "inputType": "text",
        "default": ""
      },
      "building": {
        "query": true,
        "inputType": "text",
        "default": ""
      },
      "room": {
        "query": true,
        "inputType": "text",
        "default": ""
      },
      "city": {
        "query": true,
        "inputType": "text",
        "default": ""
      },
      "zip code": {
        "query": true,
        "inputType": "text",
        "default": ""
      },
      "country": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    }
  },
  "job position": {
    "query": true,
    "inputType": "text",
    "default": ""
  },
  "group": {
    "query": true,
    "inputType": "text",
    "default": ""
  }
};
var contact_default = contactMetadataTemplate;

// src/data/templates/metadata/dailynote.ts
var dailyNoteMetadataTemplate = {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": { type: "function", value: "this.manifest.version" }
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["daily-note"]
  },
  "banner": {
    "query": false,
    "inputType": "text",
    "default": "![[obsidian-eln-banner.png]]"
  },
  "banner_y": {
    "query": false,
    "inputType": "text",
    "default": 0.336
  },
  "date created": {
    "query": false,
    "inputType": "date",
    "default": { type: "function", value: "new Date().toISOString().split('T')[0]" }
  },
  "author": {
    "query": true,
    "inputType": "dropdown",
    "options": { type: "function", value: "this.settings.authors.map((item) => item.name)" }
  },
  "note type": {
    "query": false,
    "inputType": "text",
    "default": "daily-note"
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": ["daily-note"]
  },
  "dailynote date": {
    "query": true,
    "inputType": "date",
    "info": "Select the date for this daily note.",
    "default": { type: "function", value: "new Date().toISOString().split('T')[0]" }
  }
};
var dailynote_default = dailyNoteMetadataTemplate;

// src/data/templates/metadata/default.ts
var defaultMetadataTemplate = {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": { type: "function", value: "this.manifest.version" }
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["note"]
  },
  "date created": {
    "query": false,
    "inputType": "date",
    "default": { type: "function", value: "new Date().toISOString().split('T')[0]" }
  },
  "author": {
    "query": true,
    "inputType": "dropdown",
    "options": { type: "function", value: "this.settings.authors.map((item) => item.name)" }
  },
  "note type": {
    "query": false,
    "inputType": "text",
    "default": "contact"
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": ["note"]
  }
};
var default_default = defaultMetadataTemplate;

// src/data/templates/metadata/device.ts
var deviceMetadataTemplate = {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": { type: "function", value: "this.manifest.version" }
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["device"]
  },
  "date created": {
    "query": false,
    "inputType": "date",
    "default": { type: "function", value: "new Date().toISOString().split('T')[0]" }
  },
  "author": {
    "query": true,
    "inputType": "dropdown",
    "options": { type: "function", value: "this.settings.authors.map((item) => item.name)" }
  },
  "note type": {
    "query": false,
    "inputType": "text",
    "default": "device"
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": {
      type: "function",
      userInputs: ["device.type"],
      value: "device.type ? [`device/${device.type.replace(/\\s/g, '_')}`] : ['device/unknown']"
    }
  },
  "device": {
    "name": {
      "query": true,
      "inputType": "text",
      "default": ""
    },
    "type": {
      "query": true,
      "inputType": "dropdown",
      "options": { type: "function", value: "this.settings.deviceType.map((item) => item.name)" }
    },
    "manufacturer": {
      "query": true,
      "inputType": "text",
      "default": ""
    },
    "model": {
      "query": true,
      "inputType": "text",
      "default": ""
    },
    "location": {
      "building": {
        "query": true,
        "inputType": "text",
        "default": ""
      },
      "room": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    },
    "info": {
      // "dynamic": true,
      "query": true,
      "inputType": "dynamic",
      "default": {}
    },
    "parameters": {
      // "dynamic": true,
      "query": true,
      "inputType": "dynamic",
      "default": {}
    }
  }
};
var device_default = deviceMetadataTemplate;

// src/data/templates/metadata/instrument.ts
var instrumentMetadataTemplate = {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": { type: "function", value: "this.manifest.version" }
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["device"]
  },
  "date created": {
    "query": false,
    "inputType": "date",
    "default": { type: "function", value: "new Date().toISOString().split('T')[0]" }
  },
  "author": {
    "query": true,
    "inputType": "dropdown",
    "options": { type: "function", value: "this.settings.authors.map((item) => item.name)" }
  },
  "note type": {
    "query": false,
    "inputType": "text",
    "default": "device"
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": {
      type: "function",
      userInputs: ["instrument.type"],
      value: "instrument.type ? [`instrument/${instrument.type.replace(/\\s/g, '_')}`] : ['instrument/unknown']"
    }
  },
  "instrument": {
    "name": {
      "query": true,
      "inputType": "text",
      "default": ""
    },
    "type": {
      "query": true,
      "inputType": "dropdown",
      "options": "this.settings.deviceType.map((item) => item.name)"
    },
    "manufacturer": {
      "query": true,
      "inputType": "text",
      "default": ""
    },
    "model": {
      "query": true,
      "inputType": "text",
      "default": ""
    },
    "location": {
      "building": {
        "query": true,
        "inputType": "text",
        "default": ""
      },
      "room": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    },
    "info": {
      // "dynamic": true,
      "query": true,
      "inputType": "dynamic",
      "default": {}
    },
    "parameters": {
      // "dynamic": true,
      "query": true,
      "inputType": "dynamic",
      "default": {}
    }
  }
};
var instrument_default = instrumentMetadataTemplate;

// src/data/templates/metadata/meeting.ts
var meetingMetadataTemplate = {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": { type: "function", value: "this.manifest.version" }
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["meeting"]
  },
  "date created": {
    "query": false,
    "inputType": "date",
    "default": { type: "function", value: "new Date().toISOString().split('T')[0]" },
    "callback": { type: "function", value: "(value) => value" }
  },
  "author": {
    "query": true,
    "inputType": "dropdown",
    "options": { type: "function", value: "this.settings.authors.map((item) => item.name)" }
  },
  "note type": {
    "query": false,
    "inputType": "text",
    "default": "meeting"
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": ["meeting"]
  },
  "meeting": {
    "title": {
      "query": true,
      "inputType": "text",
      "default": ""
    },
    "type": {
      "query": true,
      "inputType": "dropdown",
      "options": ["team meeting", "project meeting", "client meeting", "workshop", "conference", "other"]
    },
    "date": {
      "query": true,
      "inputType": "date",
      "default": { type: "function", value: "new Date().toISOString().split('T')[0]" },
      "callback": { type: "function", value: "(value) => value" }
    },
    "time": {
      "query": true,
      "inputType": "text",
      "default": "(new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })"
    },
    "location": {
      "query": true,
      "inputType": "text",
      "default": ""
    },
    "participants": {
      "query": true,
      "inputType": "multiselect",
      "options": "this.settings.authors.map((author) => author.name)",
      "callback": { type: "function", value: "(value) => value" }
    },
    "topics": {
      "query": true,
      "inputType": "list",
      "default": [
        {
          "time": "(new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })",
          "title": "1st Topic",
          "contributor": ""
        },
        {
          "time": "(new Date(new Date().getTime() + 15 * 60000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })",
          "title": "2nd Topic",
          "contributor": ""
        },
        {
          "time": "(new Date(new Date().getTime() + 30 * 60000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })",
          "title": "3rd Topic",
          "contributor": ""
        }
      ],
      "callback": { type: "function", value: "(value) => value" }
    }
  },
  "project": {
    "name": {
      "query": true,
      "inputType": "text",
      "default": ""
    }
  }
};
var meeting_default = meetingMetadataTemplate;

// src/data/templates/metadata/process.ts
var processMetadataTemplate = {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": { type: "function", value: "this.manifest.version" }
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["meeting"]
  },
  "date created": {
    "query": false,
    "inputType": "date",
    "default": { type: "function", value: "new Date().toISOString().split('T')[0]" }
  },
  "author": {
    "query": true,
    "inputType": "dropdown",
    "options": { type: "function", value: "this.settings.authors.map((item) => item.name)" }
  },
  "note type": {
    "query": false,
    "inputType": "text",
    "default": "meeting"
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": {
      type: "function",
      userInputs: ["process.type"],
      value: "process.type ? [`process/${process.type.replace(/\\s/g, '_')}`] : ['process/unknown']"
    }
  },
  "process": {
    "title": {
      "query": true,
      "inputType": "text",
      "default": ""
    }
  }
};
var process_default = processMetadataTemplate;

// src/data/templates/metadata/project.ts
var projectMetadataTemplate = {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": { type: "function", value: "this.manifest.version" }
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["project", "dashboard", "wide-page"]
  },
  "banner": {
    "query": false,
    "inputType": "text",
    "default": "![[obsidian-eln-banner.png]]"
  },
  "banner_y": {
    "query": false,
    "inputType": "number",
    "default": 0.5
  },
  "author": {
    "query": true,
    "inputType": "dropdown",
    "options": { type: "function", value: "this.settings.authors.map((item) => item.name)" }
  },
  "date created": {
    "query": false,
    "inputType": "date",
    "default": { type: "function", value: "new Date().toISOString().split('T')[0]" }
  },
  "note type": {
    "query": false,
    "inputType": "text",
    "default": "project"
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": {
      type: "function",
      userInputs: ["project.type"],
      value: "project.type ? [`project/${project.name.replace(/\\s/g, '_')}`] : ['project/unknown']"
    }
  },
  "project": {
    "name": {
      "query": true,
      "inputType": "text",
      "default": ""
    },
    "abbreviation": {
      "query": true,
      "inputType": "text",
      "default": ""
    },
    "type": {
      "query": true,
      "inputType": "subclass",
      "options": "this.settings.note.project.type.map((item) => item.name)"
    },
    // "category": {
    //     "query": true,
    //     "inputType": "dropdown",
    //     "options": "(userInput) => this.settings.note.project.type.find((type) => type.name === userInput['project.type'])?.category || []",
    //  
    // },
    "description": {
      "query": true,
      "inputType": "text",
      "default": ""
    },
    "status": {
      "query": true,
      "inputType": "dropdown",
      "options": ["active", "completed", "on hold", "cancelled"]
    },
    "start": {
      "query": true,
      "inputType": "date",
      "default": { type: "function", value: "new Date().toISOString().split('T')[0]" }
    },
    "end": {
      "query": true,
      "inputType": "date",
      "default": ""
    }
  }
};
var project_default = projectMetadataTemplate;

// src/data/templates/metadata/sample.ts
var sampleMetadataTemplate = {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": { type: "function", value: "this.manifest.version" }
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["sample"]
  },
  "date created": {
    "query": false,
    "inputType": "date",
    "default": { type: "function", value: "new Date().toISOString().split('T')[0]" }
  },
  "author": {
    "query": true,
    "inputType": "dropdown",
    "options": { type: "function", value: "this.settings.authors.map((item) => item.name)" }
  },
  "note type": {
    "query": false,
    "inputType": "text",
    "default": "sample"
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": {
      type: "function",
      userInputs: ["sample.type"],
      value: "sample.type ? [`sample/${sample.type.replace(/\\s/g, '_')}`] : ['sample/unknown']"
    }
  },
  "project": {
    "query": true,
    "inputType": "queryDropdown",
    "search": "project",
    "where": [
      {
        "field": "note type",
        "is": "project"
      }
    ]
  },
  "sample": {
    "name": {
      "query": true,
      "inputType": "text",
      "default": ""
    },
    "type": {
      "query": true,
      "inputType": "subclass",
      "options": { type: "function", value: "this.settings.note.sample.type.map((item) => item.name)" }
    },
    "description": {
      "query": true,
      "inputType": "text",
      "default": ""
    }
  }
};
var sample_default = sampleMetadataTemplate;

// src/data/templates/metadata/samplelist.ts
var sampleListMetadataTemplate = {
  "ELN version": {
    "query": false,
    "inputType": "text",
    "default": { type: "function", value: "this.manifest.version" }
  },
  "cssclasses": {
    "query": false,
    "inputType": "list",
    "default": ["wide-page", "sample-list"]
  },
  "date created": {
    "query": false,
    "inputType": "date",
    "default": { type: "function", value: "new Date().toISOString().split('T')[0]" }
  },
  "author": {
    "query": true,
    "inputType": "dropdown",
    "options": { type: "function", value: "this.settings.authors.map((item) => item.name)" }
  },
  "note type": {
    "query": false,
    "inputType": "text",
    "default": "sample-list"
  },
  "tags": {
    "query": false,
    "inputType": "list",
    "default": ["list/samples"]
  },
  "project": {
    "name": {
      "query": true,
      "inputType": "queryDropdown",
      "search": "project"
    }
  }
};
var samplelist_default = sampleListMetadataTemplate;

// src/data/templates/metadata/chemtypes/acid.ts
var acidSubclassMetadataTemplate = {
  "add": [
    {
      "fullKey": "chemical.properties.concentration",
      "insertAfter": "chemical.properties.density",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": "mol/L",
        "defaultUnit": "mol/L",
        "callback": { type: "function", value: "(value) => value.trim()" }
      }
    },
    {
      "fullKey": "chemical.properties.pH",
      "insertAfter": "chemical.properties.concentration",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": "",
        "defaultUnit": "",
        "callback": { type: "function", value: "(value) => value.trim()" }
      }
    }
  ],
  "remove": [
    "chemical.properties.solubility in water"
  ],
  "replace": [
    {
      "fullKey": "chemical.properties.melting point",
      "newKey": "chemical.properties.pKs",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "callback": { type: "function", value: "(value) => value.trim()" }
      }
    }
  ]
};

// src/data/templates/metadata/chemtypes/activeMaterial.ts
var activeMaterialSubclassMetadataTemplate = {
  "add": [
    {
      "fullKey": "chemical.properties.theoretical capacity",
      "insertAfter": "chemical.properties.density",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["mAh/g", "Ah/kg"],
        "defaultUnit": "mAh/g",
        "callback": { type: "function", value: "(value) => value.trim()" }
      }
    },
    {
      "fullKey": "chemical.properties.storage mechanism",
      "insertAfter": "chemical.properties.theoretical capacity",
      "input": {
        "query": true,
        "inputType": "dropdown",
        "options": [
          { label: "Intercalation", value: "intercalation" },
          { label: "Conversion", value: "conversion" },
          { label: "Alloying", value: "alloying" },
          { label: "Other", value: "other" }
        ],
        "default": "intercalation"
      }
    }
  ],
  "remove": [
    "chemical.properties.solubility in water"
  ],
  "replace": [
    {
      "fullKey": "chemical.properties.melting point",
      "newKey": "chemical.properties.voltage range",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "0-1",
        "units": ["V", "mV"],
        "defaultUnit": "V"
      }
    }
  ]
};

// src/data/templates/metadata/chemtypes/binder.ts
var binderSubclassMetadataTemplate = {
  "add": [
    {
      "fullKey": "chemical.properties.binder type",
      "insertAfter": "chemical.properties.density",
      "input": {
        "query": true,
        "inputType": "dropdown",
        "options": ["soluble", "dispersion"]
      }
    }
  ],
  "replace": [
    {
      "fullKey": "chemical.properties.molar mass",
      "newKey": "chemical.properties.mean molecular weight",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "defaultUnit": "g/mol"
      }
    },
    {
      "fullKey": "chemical.properties.solubility in water",
      "newKey": "chemical.properties.soluble in",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    }
  ]
};

// src/data/templates/metadata/chemtypes/conductiveAdditive.ts
var conductiveAdditiveSubclassMetadataTemplate = {
  "add": [
    {
      "fullKey": "chemical.properties.particle size",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["\xB5m", "nm"],
        "defaultUnit": "\xB5m"
      }
    },
    {
      "fullKey": "chemical.properties.BET surface area",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["m\xB2/g", "cm\xB2/g"],
        "defaultUnit": "m\xB2/g"
      }
    },
    {
      "fullKey": "chemical.properties.coductivity",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["S/m"],
        "defaultUnit": "S/m"
      }
    }
  ],
  "remove": [
    "chemical.properties.solubility in water"
  ]
};

// src/data/templates/metadata/chemtypes/currentCollector.ts
var currentCollectorSubclassMetadataTemplate = {
  "add": [
    {
      "fullKey": "chemical.properties.thickness",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": "\xB5m",
        "defaultUnit": "\xB5m"
      }
    },
    {
      "fullKey": "chemical.properties.coating",
      "input": {
        "query": true,
        "inputType": "boolean",
        "default": false
      }
    }
  ],
  "remove": [
    "chemical.properties.solubility in water"
  ]
};

// src/data/templates/metadata/chemtypes/electrolyte.ts
var electrolyteSubclassMetadataTemplate = {
  "add": [
    {
      "fullKey": "chemical.properties.composition.solvents",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    },
    {
      "fullKey": "chemical.properties.composition.salts",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    },
    {
      "fullKey": "chemical.properties.composition.additives",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    },
    {
      "fullKey": "chemical.properties.composition.molarity",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["mol/L", "mmol/L"],
        "defaultUnit": "mol/L"
      }
    },
    {
      "fullKey": "chemical.properties.conductivity",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["S/m", "mS/m"],
        "defaultUnit": "S/m"
      }
    },
    {
      "fullKey": "chemical.properties.viscosity",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["mPa\xB7s", "cP"],
        "defaultUnit": "mPa\xB7s"
      }
    }
  ],
  "remove": [
    "chemical.properties.molar mass",
    "chemical.properties.solubility in water"
  ]
};

// src/data/templates/metadata/chemtypes/inorganicCompound.ts
var inorganicCompoundSubclassMetadataTemplate = {
  "add": [
    {
      "fullKey": "chemical.properties.shape",
      "insertAfter": "chemical.properties.density",
      "input": {
        "query": true,
        "inputType": "dropdown",
        "options": ["powder", "rod", "sheet", "mesh", "granule", "other"]
      }
    },
    {
      "fullKey": "chemical.properties.particle size",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["\xB5m", "nm"],
        "defaultUnit": "\xB5m"
      }
    },
    {
      "fullKey": "chemical.properties.crystal structure",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    }
  ]
};

// src/data/templates/metadata/chemtypes/metal.ts
var metalSubclassMetadataTemplate = {
  "add": [
    {
      "fullKey": "chemical.properties.shape",
      "input": {
        "query": true,
        "inputType": "dropdown",
        "options": ["powder", "rod", "foil", "sheet", "mesh", "granule", "wire", "other"]
      }
    },
    {
      "fullKey": "chemical.properties.alloy",
      "input": {
        "query": true,
        "inputType": "boolean",
        "default": false
      }
    }
  ],
  "remove": [
    "chemical.properties.solubility in water"
  ]
};

// src/data/templates/metadata/chemtypes/organicCompound.ts
var organicCompoundSubclassMetadataTemplate = {
  "add": [
    {
      "fullKey": "chemical.properties.flash point",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["\xB0C", "K"],
        "defaultUnit": "\xB0C"
      }
    },
    {
      "fullKey": "chemical.properties.functional groups",
      "input": {
        "query": true,
        "inputType": "multiselect",
        "options": [
          "alcohol",
          "aldehyde",
          "amine",
          "carboxylic acid",
          "ester",
          "ether",
          "ketone",
          "nitrile",
          "phenol",
          "sulfide",
          "thiol",
          "other"
        ],
        "default": []
      }
    }
  ],
  "replace": [
    {
      "fullKey": "chemical.properties.solubility in water",
      "newKey": "chemical.properties.soluble in",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    }
  ]
};

// src/data/templates/metadata/chemtypes/polymer.ts
var polymerSubclassMetadataTemplate = {
  "add": [
    {
      "fullKey": "chemical.properties.polymer type",
      "insertAfter": "chemical.properties.density",
      "input": {
        "query": true,
        "inputType": "dropdown",
        "options": [
          "homo polymer",
          "block copolymer",
          "alternating copolymer",
          "periodic copolymer",
          "statistical copolymer",
          "stereoblock copolymer",
          "gradient copolymer"
        ]
      }
    }
  ],
  "replace": [
    {
      "fullKey": "chemical.properties.molar mass",
      "newKey": "chemical.properties.mean molecular weight",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "defaultUnit": "g/mol"
      }
    },
    {
      "fullKey": "chemical.properties.solubility in water",
      "newKey": "chemical.properties.soluble in",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    }
  ]
};

// src/data/templates/metadata/chemtypes/semiconductor.ts
var semiconductorSubclassMetadataTemplate = {
  "add": [
    {
      "fullKey": "chemical.properties.shape",
      "input": {
        "query": true,
        "inputType": "dropdown",
        "options": ["powder", "wafer", "single crystal", "other"]
      }
    },
    {
      "fullKey": "chemical.properties.semiconductor type",
      "input": {
        "query": true,
        "inputType": "dropdown",
        "options": ["group IV", "group III-V", "group II-VI", "organic", "other"]
      }
    },
    {
      "fullKey": "chemical.properties.doping",
      "input": {
        "query": true,
        "inputType": "dropdown",
        "options": ["n-type", "p-type", "none", "other"]
      }
    },
    {
      "fullKey": "chemical.properties.doping level",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["cm\u207B\xB3", "m\u207B\xB3"],
        "defaultUnit": "cm\u207B\xB3"
      }
    },
    {
      "fullKey": "chemical.properties.band gap",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["eV", "meV"],
        "defaultUnit": "eV"
      }
    },
    {
      "fullKey": "chemical.properties.band gap type",
      "input": {
        "query": true,
        "inputType": "dropdown",
        "options": ["direct", "indirect"]
      }
    },
    {
      "fullKey": "chemical.properties.mobility",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "units": ["cm\xB2/(V\xB7s)", "m\xB2/(V\xB7s)"],
        "defaultUnit": "cm\xB2/(V\xB7s)"
      }
    }
  ],
  "remove": [
    "chemical.properties.solubility in water"
  ]
};

// src/data/templates/metadata/chemtypes/separator.ts
var separatorSubclassMetadataTemplate = {
  "add": [
    {
      "fullKey": "chemical.properties.separator type",
      "input": {
        "query": true,
        "inputType": "dropdown",
        "options": [
          "polymer separator",
          "ceramic separator",
          "composite separator",
          "glass separator",
          "other"
        ]
      }
    },
    {
      "fullKey": "chemical.properties.materials",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    },
    {
      "fullKey": "chemical.properties.layers",
      "input": {
        "query": true,
        "inputType": "number",
        "default": 1
      }
    },
    {
      "fullKey": "chemical.properties.permeability",
      "input": {
        "query": true,
        "inputType": "number",
        "default": 0,
        "units": ["gurley (s)", "L/m\xB2\xB7s"],
        "defaultUnit": "gurley (s)"
      }
    },
    {
      "fullKey": "chemical.properties.thickness",
      "input": {
        "query": true,
        "inputType": "number",
        "default": 0,
        "units": ["\xB5m", "mm"],
        "defaultUnit": "\xB5m"
      }
    },
    {
      "fullKey": "chemical.properties.porosity",
      "input": {
        "query": true,
        "inputType": "number",
        "default": 0,
        "units": ["%"],
        "defaultUnit": "%"
      }
    },
    {
      "fullKey": "chemical.properties.tensile strength",
      "input": {
        "query": true,
        "inputType": "number",
        "default": 0,
        "units": ["MPa", "psi"],
        "defaultUnit": "MPa"
      }
    },
    {
      "fullKey": "chemical.properties.thermal stability",
      "input": {
        "query": true,
        "inputType": "number",
        "default": 0,
        "units": ["\xB0C", "K"],
        "defaultUnit": "\xB0C"
      }
    },
    {
      "fullKey": "chemical.properties.shutdown temperature",
      "input": {
        "query": true,
        "inputType": "number",
        "default": 0,
        "units": ["\xB0C", "K"],
        "defaultUnit": "\xB0C"
      }
    },
    {
      "fullKey": "chemical.properties.wetting angle",
      "input": {
        "query": true,
        "inputType": "number",
        "default": 0,
        "units": ["\xB0"],
        "defaultUnit": "\xB0"
      }
    }
  ],
  "remove": [
    "chemical.properties.solubility in water"
  ]
};

// src/data/templates/metadata/chemtypes/solvent.ts
var solventSubclassMetadataTemplate = {
  "add": [
    {
      "fullKey": "chemical.properties.vapor pressure",
      "input": {
        "query": true,
        "inputType": "number",
        "default": 0,
        "units": ["Pa", "kPa", "atm"],
        "defaultUnit": "kPa"
      }
    },
    {
      "fullKey": "chemical.properties.dielectric constant",
      "input": {
        "query": true,
        "inputType": "number",
        "default": 0
      }
    },
    {
      "fullKey": "chemical.properties.flash point",
      "input": {
        "query": true,
        "inputType": "number",
        "default": 0,
        "units": ["\xB0C", "K"],
        "defaultUnit": "\xB0C"
      }
    }
  ],
  "remove": [
    "chemical.properties.solubility in water"
  ]
};

// src/data/templates/metadata/chemtypes/chemtypes.ts
var chemTypesMetadataTemplates = {
  "acid": acidSubclassMetadataTemplate,
  "active material": activeMaterialSubclassMetadataTemplate,
  "binder": binderSubclassMetadataTemplate,
  "conductive additive": conductiveAdditiveSubclassMetadataTemplate,
  "current collector": currentCollectorSubclassMetadataTemplate,
  "electrolyte": electrolyteSubclassMetadataTemplate,
  "inorganic compound": inorganicCompoundSubclassMetadataTemplate,
  "metal": metalSubclassMetadataTemplate,
  "organic compound": organicCompoundSubclassMetadataTemplate,
  "polymer": polymerSubclassMetadataTemplate,
  "semiconductor": semiconductorSubclassMetadataTemplate,
  "separator": separatorSubclassMetadataTemplate,
  "solvent": solventSubclassMetadataTemplate
};

// src/data/templates/metadata/projecttypes/research.ts
var researchSubclassMetadataTemplate = {
  "add": [
    {
      "fullKey": "project.funding agency",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    },
    {
      "fullKey": "project.funding code",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    },
    {
      "fullKey": "project.title",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    },
    {
      "fullKey": "project.subproject",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    },
    {
      "fullKey": "project.acronym",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    },
    {
      "fullKey": "project.project coordinator science",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    },
    {
      "fullKey": "project.project manager administration",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    }
  ]
};

// src/data/templates/metadata/projecttypes/development.ts
var developmentSubclassMetadataTemplate = {
  "add": [
    {
      "fullKey": "project.funding agency",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    },
    {
      "fullKey": "project.funding code",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    },
    {
      "fullKey": "project.title",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    },
    {
      "fullKey": "project.subproject",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    },
    {
      "fullKey": "project.acronym",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    },
    {
      "fullKey": "project.project coordinator science",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    },
    {
      "fullKey": "project.project manager administration",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    }
  ]
};

// src/data/templates/metadata/projecttypes/programming.ts
var programmingSubclassMetadataTemplate = {
  "add": [
    {
      "fullKey": "project.language",
      "input": {
        "query": true,
        "inputType": "dropdown",
        "options": ["Python", "JavaScript", "Java", "C++", "Ruby", "Go", "Rust", "Swift", "Kotlin", "PHP"],
        "default": "Python",
        "callback": { type: "function", value: "(value) => value" }
      }
    },
    {
      "fullKey": "project.framework",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    },
    // {
    //     "fullKey": "project.libraries",
    //     "input": {
    //         "query": true,
    //         "inputType": "list",
    //         "default": [],
    //         "callback": { type: "function", value: "(value) => value.map(lib => lib.trim()).filter(lib => lib !== '')" },
    //     },
    // },
    {
      "fullKey": "project.version control",
      "input": {
        "query": true,
        "inputType": "dropdown",
        "options": ["Git", "SVN", "Mercurial", "None"],
        "default": "Git",
        "callback": { type: "function", value: "(value) => value" }
      }
    },
    {
      "fullKey": "project.documentation",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    }
    // {
    //     "fullKey": "project.repository",
    //     "input": {
    //         "query": true,
    //         "inputType": "external-link",
    //         "default": "",
    //     },
    // },
    // {
    //     "fullKey": "project.contributors",
    //     "input": {
    //         "query": true,
    //         "inputType": "list",
    //         "default": [],
    //         "callback": { type: "function", value: "(value) => value.map(contributor => contributor.trim()).filter(contributor => contributor !== '')" },
    //     },
    // },
  ]
};

// src/data/templates/metadata/projecttypes/meeting.ts
var meetingSubclassMetadataTemplate = {
  "add": [
    {
      "fullKey": "project.location",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    },
    {
      "fullKey": "project.catering",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    },
    // {
    //     "fullKey": "project.sponsors",
    //     "input": {
    //         "query": true,
    //         "inputType": "list",
    //         "default": "",
    //     },
    // },
    {
      "fullKey": "project.agenda",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    }
  ]
};

// src/data/templates/metadata/projecttypes/projecttypes.ts
var projectTypesMetadataTemplates = {
  "research": researchSubclassMetadataTemplate,
  "development": developmentSubclassMetadataTemplate,
  "programming": programmingSubclassMetadataTemplate,
  "meeting": meetingSubclassMetadataTemplate
};

// src/data/templates/metadata/sampletypes/compound.ts
var compoundSubclassMetadataTemplate = {
  "add": [
    {
      "fullKey": "sample.chemical formula",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    },
    {
      "fullKey": "sample.smiles",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    },
    {
      "fullKey": "sample.molar mass",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "defaultUnit": "g/mol",
        "units": ["g/mol"]
      }
    },
    {
      "fullKey": "sample.educts",
      "input": {
        "query": true,
        "inputType": "objectList",
        "object": [
          {
            "query": true,
            "key": "name",
            "inputType": "queryDropdown",
            "search": [
              {
                "tag": "chemical",
                "where": [
                  {
                    "field": "chemical.field of use",
                    "is": "synthesis"
                  }
                ]
              },
              {
                "tag": "sample",
                "where": [
                  {
                    "field": "project.name",
                    "is": "this.project.name"
                  }
                ]
              }
            ]
          },
          {
            "query": true,
            "key": "mass",
            "inputType": "number",
            "default": "0",
            "defaultUnit": "mg",
            "units": ["mg", "g", "kg"]
          }
        ]
      }
    },
    {
      "fullKey": "sample.side products",
      "input": {
        "query": true,
        "inputType": "text",
        "default": ""
      }
    }
  ]
};

// src/data/templates/metadata/sampletypes/electrode.ts
var electrodeSubclassMetadataTemplate = {
  "add": [
    {
      "fullKey": "sample.active material.name",
      "input": {
        "query": true,
        "inputType": "queryDropdown",
        "search": "chemical",
        "where": [
          {
            "field": "chemical.type",
            "is": "active material"
          },
          {
            "field": "chemical.field of use",
            "contains": "electrode"
          }
        ]
      }
    },
    {
      "fullKey": "sample.active material.mass",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "defaultUnit": "mg",
        "units": ["mg", "g", "kg"]
      }
    },
    {
      "fullKey": "sample.active material.loading",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "defaultUnit": "mg/cm2",
        "units": ["mg/cm2", "g/cm2"]
      }
    },
    {
      "fullKey": "sample.binder.name",
      "input": {
        "query": true,
        "inputType": "queryDropdown",
        "search": "chemical",
        "where": [
          {
            "field": "chemical.type",
            "is": "binder"
          },
          {
            "field": "chemical.field of use",
            "contains": "electrode"
          }
        ]
      }
    },
    {
      "fullKey": "sample.binder.mass",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "defaultUnit": "mg",
        "units": ["mg", "g", "kg"]
      }
    },
    {
      "fullKey": "sample.conductive additive.name",
      "input": {
        "query": true,
        "inputType": "queryDropdown",
        "search": "chemical",
        "where": [
          {
            "field": "chemical.type",
            "is": "conductive additive"
          },
          {
            "field": "chemical.field of use",
            "contains": "electrode"
          }
        ]
      }
    },
    {
      "fullKey": "sample.conductive additive.mass",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "defaultUnit": "mg",
        "units": ["mg", "g", "kg"]
      }
    },
    {
      "fullKey": "sample.solvent.name",
      "input": {
        "query": true,
        "inputType": "queryDropdown",
        "search": "chemical",
        "where": [
          {
            "field": "chemical.type",
            "is": "solvent"
          },
          {
            "field": "chemical.field of use",
            "contains": "electrode"
          }
        ]
      }
    },
    {
      "fullKey": "sample.solvent.volume",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "defaultUnit": "ml",
        "units": ["ml", "l", "\xB5l"]
      }
    },
    {
      "fullKey": "sample.current collector.name",
      "input": {
        "query": true,
        "inputType": "queryDropdown",
        "search": "chemical",
        "where": [
          {
            "field": "chemical.type",
            "is": "current collector"
          },
          {
            "field": "chemical.field of use",
            "contains": "electrode"
          }
        ]
      }
    },
    {
      "fullKey": "sample.current collector.thickness",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "defaultUnit": "\xB5m",
        "units": ["\xB5m", "mm", "cm"]
      }
    },
    {
      "fullKey": "sample.current collector.width",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "defaultUnit": "cm",
        "units": ["cm", "mm", "m"]
      }
    },
    {
      "fullKey": "sample.current collector.length",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "defaultUnit": "cm",
        "units": ["cm", "mm", "m"]
      }
    },
    {
      "fullKey": "sample.dry thickness",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "defaultUnit": "\xB5m",
        "units": ["\xB5m", "mm", "cm"]
      }
    },
    {
      "fullKey": "sample.porosity",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "defaultUnit": "%",
        "units": ["%"]
      }
    }
  ]
};

// src/data/templates/metadata/sampletypes/electrochemCell.ts
var electrochemCellSubclassMetadataTemplate = {
  "add": [
    {
      "fullKey": "sample.cell",
      "input": {
        "query": true,
        "inputType": "query",
        "search": "#electrochemical cell",
        "default": "",
        "return": ["electrochemical cell.name", "electrochemical cell.type"]
      }
    },
    {
      "fullKey": "sample.working electrode",
      "input": {
        "query": true,
        "inputType": "query",
        "search": "#sample",
        "where": "sample.type = 'electrode'",
        "default": "",
        "return": ["sample.name"]
      }
    },
    {
      "fullKey": "sample.working electrode.active material mass",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "defaultUnit": "mg",
        "units": ["mg", "g", "kg"]
      }
    },
    {
      "fullKey": "sample.working electrode.total mass",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "defaultUnit": "mg",
        "units": ["mg", "g", "kg"]
      }
    },
    {
      "fullKey": "sample.working electrode.area",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "defaultUnit": "cm2",
        "units": ["cm2", "m2"]
      }
    },
    {
      "fullKey": "sample.counter electrode",
      "input": {
        "query": true,
        "inputType": "query",
        "search": "#electrode/standard",
        "default": "",
        "return": ["electrode.name"]
      }
    },
    {
      "fullKey": "sample.reference electrode",
      "input": {
        "query": true,
        "inputType": "query",
        "search": "#electrode/reference",
        "default": "",
        "return": ["electrode.name"]
      }
    },
    {
      "fullKey": "sample.electrolyte",
      "input": {
        "query": true,
        "inputType": "query",
        "search": "#chemical",
        "where": "chemical.type = 'electrolyte'",
        "default": "",
        "return": ["chemical.name"]
      }
    },
    {
      "fullKey": "sample.electrolyte.volume",
      "input": {
        "query": true,
        "inputType": "number",
        "default": "",
        "defaultUnit": "mL",
        "units": ["mL", "L", "\xB5L"]
      }
    },
    {
      "fullKey": "sample.separator",
      "input": {
        "query": true,
        "inputType": "query",
        "search": "#chemical",
        "where": "chemical.type = 'separator'",
        "default": "",
        "return": ["chemical.name"]
      }
    },
    {
      "fullKey": "sample.separator.layers",
      "input": {
        "query": true,
        "inputType": "number",
        "default": ""
      }
    }
  ]
};

// src/data/templates/metadata/sampletypes/sampletypes.ts
var sampleTypesMetadataTemplates = {
  "compound": compoundSubclassMetadataTemplate,
  "electrode": electrodeSubclassMetadataTemplate,
  "electrochemical cell": electrochemCellSubclassMetadataTemplate
};

// src/data/templates/metadataTemplates.ts
var metadataTemplates = {
  analysis: analysis_default,
  chemical: chemical_default,
  contact: contact_default,
  dailyNote: dailynote_default,
  default: default_default,
  device: device_default,
  instrument: instrument_default,
  meeting: meeting_default,
  process: process_default,
  project: project_default,
  sample: sample_default,
  sampleList: samplelist_default
};
var subClassMetadataTemplates = {
  chemical: chemTypesMetadataTemplates,
  project: projectTypesMetadataTemplates,
  sample: sampleTypesMetadataTemplates
};

// src/data/templates/markdownTemplates.ts
var import_obsidian13 = require("obsidian");

// src/data/templates/markdown/analysis.ts
var analysisMarkdownTemplate = `
\`\`\`eln-properties
key: analysis
actionButtons: true
cssclasses: analysis
\`\`\`

\`\`\`image-viewer
folder: Experiments/Analyses/Dummy Sample/Dummy Analysis/plots
bgColor: #f5f5f5
size: 800
shuffle: manual
shuffleOrder: random
interval: 5
thumbnails: true
\`\`\`

`;
var analysis_default2 = analysisMarkdownTemplate;

// src/data/templates/markdown/chemical.ts
var chemicalMarkdownTemplate = `
\`\`\`smiles
=this.chemical.smiles
\`\`\`

\`\`\`dataviewjs
await dv.view("/assets/javascript/dataview/views/chemical", {obsidian: obsidian});
\`\`\`

\`\`\`dataviewjs
  await dv.view("/assets/javascript/dataview/views/chem_links", {});
\`\`\`

`;
var chemical_default2 = chemicalMarkdownTemplate;

// src/data/templates/markdown/contact.ts
var contactMarkdownTemplate = `
\`\`\`dataviewjs
await dv.view("/assets/javascript/dataview/views/contact", {obsidian: obsidian});
\`\`\`

`;
var contact_default2 = contactMarkdownTemplate;

// src/data/templates/markdown/dailynote.ts
var contactMarkdownTemplate2 = `
\`\`\`daily-note-nav
\`\`\`

# Daily Note - {{title}}

  - ### Tasks
    - [ ] Today 1
    - [ ] Today 2
    - [ ] Today 3


- ### 
  \`\`\`image-viewer
  folder: assets/images/Motivation/
  size: 300
  shuffle: auto
  shuffleOrder: random
  interval: 60
  \`\`\`

- ### Progress
  \`\`\`circular-progress
  color:rgb(152, 115, 247)
  taskLabel: completed;
  \`\`\`

# Notes


`;
var dailynote_default2 = contactMarkdownTemplate2;

// src/data/templates/markdown/default.ts
var defaultMarkdownTemplate = `

`;
var default_default2 = defaultMarkdownTemplate;

// src/data/templates/markdown/device.ts
var deviceMarkdownTemplate = `
![[dummy-image-device.png]]

\`\`\`dataviewjs
await dv.view("/assets/javascript/dataview/views/device", {obsidian: obsidian});
\`\`\`
`;
var device_default2 = deviceMarkdownTemplate;

// src/data/templates/markdown/instrument.ts
var instrumentMarkdownTemplate = `
![[dummy-image-instrument.png]]

\`\`\`dataviewjs
await dv.view("/assets/javascript/dataview/views/instrument", {obsidian: obsidian});
\`\`\`
`;
var instrument_default2 = instrumentMarkdownTemplate;

// src/data/templates/markdown/meeting.ts
var meetingMarkdownTemplate = `

## Meeting Info

\`\`\`dataviewjs
await dv.view("/assets/javascript/dataview/views/meeting", {obsidian: obsidian});
\`\`\`


## Agenda & Minutes

\`\`\`dataviewjs
await dv.view("/assets/javascript/dataview/views/meeting_topics", {  });
\`\`\`


\`\`\`dataviewjs
await dv.view("/assets/javascript/dataview/views/meeting_topics", {  });
\`\`\`


\`\`\`dataviewjs
await dv.view("/assets/javascript/dataview/views/meeting_topics", {  });
\`\`\`


\`\`\`dataviewjs
await dv.view("/assets/javascript/dataview/views/meeting_topics", {  });
\`\`\`


\`\`\`dataviewjs
await dv.view("/assets/javascript/dataview/views/meeting_topics", {  });
\`\`\`


\`\`\`dataviewjs
await dv.view("/assets/javascript/dataview/views/meeting_topics", {  });
\`\`\`


\`\`\`dataviewjs
await dv.view("/assets/javascript/dataview/views/meeting_topics", {  });
\`\`\`


\`\`\`dataviewjs
await dv.view("/assets/javascript/dataview/views/meeting_topics", {  });
\`\`\`


\`\`\`dataviewjs
await dv.view("/assets/javascript/dataview/views/meeting_topics", {  });
\`\`\`


\`\`\`dataviewjs
await dv.view("/assets/javascript/dataview/views/meeting_topics", {  });
\`\`\`


\`\`\`dataviewjs
await dv.view("/assets/javascript/dataview/views/meeting_topics", {  });
\`\`\`


\`\`\`dataviewjs
await dv.view("/assets/javascript/dataview/views/meeting_topics", {  });
\`\`\`



`;
var meeting_default2 = meetingMarkdownTemplate;

// src/data/templates/markdown/process.ts
var processMarkdownTemplate = `
\`\`\`dataviewjs
await dv.view("/assets/javascript/dataview/views/process", {obsidian: obsidian});
\`\`\`

## Process Description

1) Lorem markdownum natale egressus congestaque rogant. 
2) Quodque et cumque

## Notes

> [!Warning]
> Lyrnesia hunc leti tuam *lacrimis dedere* serpentis vacca rectorque.


`;
var process_default2 = processMarkdownTemplate;

// src/data/templates/markdown/project.ts
var projectMarkdownTemplate = `
# Experiments

- ### [[Samples - \${project_name}|Samples]]
  \`\`\`dataview
  LIST
  FROM #sample AND!"assets"
  WHERE project.name = this.project.name
  SORT file.mtime.ts DESC
  LIMIT 6
  \`\`\`

- ### [[Analyses]]
  \`\`\`dataview
  LIST
  FROM #analysis  AND!"assets"
  WHERE project.name = this.project.name
  SORT file.mtime.ts DESC
  LIMIT 6
  \`\`\`

- ### [[Processes]]
  \`\`\`dataview
  LIST
  FROM #process  AND!"assets"
  SORT file.mtime.ts DESC
  LIMIT 6
  \`\`\`

- ### Project Meetings
  \`\`\`dataview
  LIST
  FROM #meeting AND!"assets"
  WHERE project.name = this.project.name
  SORT file.mtime.ts DESC
  LIMIT 6
  \`\`\`

- ### Other Meetings
	- [[Clustertreffen 3 (2022 Nov, M\xFCnchen)]]
 

# Important Dates

- ### General
	**Project start:** \`=this.project.start\`
	**Project end:** \`=this.project.end\`

- ### Reports
  \`\`\`dataviewjs
  var querry = Object.entries(dv.current().file.frontmatter.project.reports)
        .map(q => '- [ ] ' + q[1].type + '[due::' + q[1]['due date'] + ']')
  dv.paragraph(querry)
  \`\`\`

- ### Upcoming Meetings
	- 17.11.2022 Clustertreffen M\xFCnchen
`;
var project_default2 = projectMarkdownTemplate;

// src/data/templates/markdown/sample.ts
var sampleMarkdownTemplate = `
> [!Example] TOC
> - [[#Properties]]
> - [[#Processing]]
> - [[#My Notes]]
> - [[#Characterization]]
> - [[#Electrochemical Characterization]]

## Properties

\`\`\`eln-properties
key: sample
actionButtons: false
cssclasses: eln-sample
\`\`\`

## Processing

**Open process description**
- [[{{process.name}}]]

\`\`\`eln-properties
file: sample.process.name
key: process
actionButtons: false
cssclasses: eln-process
\`\`\`


## My Notes

> [!Info]
> Add your notes for this sample here.

## Characterization

\`\`\`dataview
TABLE WITHOUT ID
    file.link as Analysis,
    analysis["method"] as Method,
    analysis["operator"] as Operator,
    analysis["date"] as Date,
    analysis["status"] as Status
FROM #analysis 
WHERE sample.name = this.sample.name
\`\`\`

## Electrochemical Characterization

\`\`\`dataview
TABLE WITHOUT ID
    file.link as Analysis,
    sample["working electrode"]["name"] as "WE Electrode",
    sample["electrolyte"]["name"] as Electrolyte,
    analysis["method"] as Method,
    analysis["parameters"]["cycles"] as Cycles,
    analysis["parameters"]["Ewe min"] as Ewe_min,
    analysis["parameters"]["Ewe max"] as Ewe_max,
    analysis["date"] as Date,
    analysis["status"] as Status
FROM #analysis
WHERE sample.name = this.sample.name AND analysis.method = "GCPL"
\`\`\`

`;
var sample_default2 = sampleMarkdownTemplate;

// src/data/templates/markdown/samplelist.ts
var defaultMarkdownTemplate2 = `
> [!Example] TOC
> - [[#Compounds]]
> - [[#Electrodes]]
> - [[#Electrochemical Cells / Batteries]]
> - [[#All Samples]]

## Compounds

\`\`\`dataview
TABLE WITHOUT ID
  file.link as Sample, 
  sample["chemical formula"] as "Formula", 
  sample.educts.name as "Educts",
  sample.educts.mass as "Mass",
  date-created
FROM #sample
WHERE project.name = this.project.name AND sample.type = "compound"
SORT sample.type, file.link asc
\`\`\`

## Electrodes

\`\`\`dataview
TABLE WITHOUT ID
  file.link as Sample, 
  sample["active material"].name as "Active material",
  sample["active material"].mass as "AM mass",
  sample.binder.mass as "Binder mass",
  sample["conductive additive"].mass as "Cond. additive mass",
  date-created
FROM #sample
WHERE project.name = this.project.name AND sample.type = "electrode"
SORT electrode["active-material"], sample.type, file.link asc
\`\`\`

## Electrochemical Cells / Batteries

\`\`\`dataview
TABLE WITHOUT ID
  file.link as Sample, 
  sample["working electrode"]["name"] as "Working",
  sample["counter electrode"]["name"] as "Counter",
  sample["reference electrode"]["name"] as "Reference",
  sample["electrolyte"]["name"] as "Electrolyte",
  date-created
FROM #sample
WHERE project.name = this.project.name AND sample.type = "electrochemical cell"
SORT sample.type, file.link asc
\`\`\`

## All Samples

\`\`\`dataview
TABLE WITHOUT ID
  file.link as Sample, 
  sample.type as Type,
  sample.description as Description, 
  date-created
FROM #sample
WHERE project.name = this.project.name
SORT sample.type, file.link asc
\`\`\`
`;
var samplelist_default2 = defaultMarkdownTemplate2;

// src/data/templates/markdownTemplates.ts
var markdownTemplates = {
  analysis: analysis_default2,
  chemical: chemical_default2,
  contact: contact_default2,
  dailyNote: dailynote_default2,
  default: default_default2,
  device: device_default2,
  instrument: instrument_default2,
  meeting: meeting_default2,
  process: process_default2,
  project: project_default2,
  sample: sample_default2,
  sampleList: samplelist_default2
};

// src/settings/settings.ts
var DEFAULT_SETTINGS = {
  general: {
    authors: [
      { name: "Anne Anybody", initials: "AA" },
      { name: "Nick Nobody", initials: "NN" }
    ],
    operators: [
      { name: "Anne Anybody", initials: "AA" },
      { name: "Nick Nobody", initials: "NN" }
    ]
  },
  navbar: {
    enabled: true,
    groups: [
      { id: "resources", name: "Resources", order: 1 },
      { id: "experiments", name: "Experiments", order: 2 },
      { id: "other", name: "Other", order: 3 }
    ]
  },
  footer: {
    enabled: true,
    includeVersion: true,
    includeAuthor: true,
    includeMtime: true,
    includeCtime: false
  },
  note: {
    analysis: {
      navbar: {
        display: true,
        name: "Analysis",
        group: "experiments"
      },
      commands: {
        enabled: true,
        id: "create-analysis-note",
        name: "Create Analysis Note"
      },
      status: ["pending", "in progress", "completed", "failed"],
      titleTemplate: [
        { type: "userInput", field: "sample.name", separator: " - " },
        { type: "userInput", field: "analysis.method", separator: "_" },
        { type: "index", field: "02", separator: "" }
      ],
      folderTemplate: [
        { type: "string", field: "Experiments/Analyses", separator: "/" },
        { type: "userInput", field: "project.name", separator: "/" },
        { type: "userInput", field: "sample.name", separator: "/" },
        { type: "userInput", field: "analysis.method", separator: "_" },
        { type: "index", field: "02", separator: "" }
      ],
      customMetadataTemplate: false,
      customMarkdownTemplate: false,
      customMetadataTemplatePath: "",
      customMarkdownTemplatePath: "",
      metadataTemplate: metadataTemplates.analysis,
      markdownTemplate: markdownTemplates.analysis
    },
    chemical: {
      navbar: {
        display: true,
        name: "Chemical",
        group: "resources"
      },
      commands: {
        enabled: true,
        id: "create-chemical-note",
        name: "Create Chemical Note"
      },
      type: [
        {
          name: "active material",
          subClassMetadataTemplate: subClassMetadataTemplates.chemical["active material"]
        },
        {
          name: "binder",
          subClassMetadataTemplate: subClassMetadataTemplates.chemical.binder
        },
        {
          name: "conductive additive",
          subClassMetadataTemplate: subClassMetadataTemplates.chemical["conductive additive"]
        },
        {
          name: "current collector",
          subClassMetadataTemplate: subClassMetadataTemplates.chemical["current collector"]
        },
        {
          name: "electrolyte",
          subClassMetadataTemplate: subClassMetadataTemplates.chemical.electrolyte
        },
        {
          name: "inorganic compound",
          subClassMetadataTemplate: subClassMetadataTemplates.chemical["inorganic compound"]
        },
        {
          name: "metal",
          subClassMetadataTemplate: subClassMetadataTemplates.chemical.metal
        },
        {
          name: "organic compound",
          subClassMetadataTemplate: subClassMetadataTemplates.chemical["organic compound"]
        },
        {
          name: "polymer",
          subClassMetadataTemplate: subClassMetadataTemplates.chemical.polymer
        },
        {
          name: "semiconductor",
          subClassMetadataTemplate: subClassMetadataTemplates.chemical.semiconductor
        },
        {
          name: "separator",
          subClassMetadataTemplate: subClassMetadataTemplates.chemical.separator
        },
        {
          name: "solvent",
          subClassMetadataTemplate: subClassMetadataTemplates.chemical.solvent
        }
      ],
      fieldOfUse: ["electrode", "electrochemical cell", "synthesis", "undefined"],
      supplier: [
        { name: "abcr", web: "https://www.abcr.com" },
        { name: "Alfa Aesar", web: "https://www.alfa.com" },
        { name: "Acros Organics", web: "https://www.acros.com" },
        { name: "Carl Roth", web: "https://www.carlroth.com" },
        { name: "Merck", web: "https://www.merck.com" },
        { name: "Sigma Aldrich", web: "https://www.sigmaaldrich.com" },
        { name: "VWR", web: "https://www.vwr.com" },
        { name: "TCI", web: "https://www.tci-chemicals.com" }
      ],
      manufacturer: [
        { name: "abcr", web: "https://www.abcr.com" },
        { name: "Alfa Aesar", web: "https://www.alfa.com" },
        { name: "Acros Organics", web: "https://www.acros.com" },
        { name: "Carl Roth", web: "https://www.carlroth.com" },
        { name: "Merck", web: "https://www.merck.com" },
        { name: "Sigma Aldrich", web: "https://www.sigmaaldrich.com" },
        { name: "VWR", web: "https://www.vwr.com" },
        { name: "TCI", web: "https://www.tci-chemicals.com" }
      ],
      titleTemplate: [
        { type: "userInput", field: "chemical.name", separator: "" }
      ],
      folderTemplate: [
        { type: "string", field: "Resources/Chemicals", separator: "/" },
        { type: "userInput", field: "chemical.type", separator: "" }
      ],
      customMetadataTemplate: false,
      customMarkdownTemplate: false,
      customMetadataTemplatePath: "",
      customMarkdownTemplatePath: "",
      metadataTemplate: metadataTemplates.chemical,
      markdownTemplate: markdownTemplates.chemical
    },
    dailyNote: {
      navbar: {
        display: true,
        name: "Daily Note",
        group: "other"
      },
      commands: {
        enabled: true,
        id: "create-daily-note",
        name: "Create Daily Note"
      },
      titleTemplate: [
        { type: "dateField", field: "currentDate", separator: " - " },
        { type: "dateField", field: "weekday", separator: ", " },
        { type: "dateField", field: "dayOfMonth", separator: ". " },
        { type: "dateField", field: "monthName", separator: "" }
      ],
      folderTemplate: [
        { type: "string", field: "Daily Notes", separator: "/" },
        { type: "dateField", field: "year", separator: "/" },
        { type: "dateField", field: "month", separator: " " },
        { type: "dateField", field: "monthName", separator: "" }
      ],
      customMetadataTemplate: false,
      customMarkdownTemplate: false,
      customMetadataTemplatePath: "",
      customMarkdownTemplatePath: "",
      metadataTemplate: metadataTemplates.dailyNote,
      markdownTemplate: markdownTemplates.dailyNote
    },
    device: {
      navbar: {
        display: true,
        name: "Device",
        group: "resources"
      },
      commands: {
        enabled: true,
        id: "create-device-note",
        name: "Create Device Note"
      },
      type: [
        { name: "balance", method: ["weighing"] },
        { name: "coater", method: ["spin coating", "doctor blade", "slot die", "spray coating"] },
        { name: "ball mill", method: ["planetary ball mill", "vibrating ball mill"] },
        { name: "broad ion beam cutter", method: ["ion beam milling", "ion beam polishing"] },
        { name: "sputter coater", method: ["sputtering", "magnetron sputtering"] },
        { name: "thermal evaporator", method: ["thermal evaporation", "electron beam evaporation"] },
        { name: "plasma cleaner", method: ["plasma cleaning", "plasma etching"] },
        { name: "fume hood", method: ["fume extraction"] },
        { name: "furnace", method: ["sintering", "calcination"] },
        { name: "glove box", method: ["inert atmosphere handling"] },
        { name: "hot plate", method: ["heating"] },
        { name: "oven", method: ["drying", "curing"] },
        { name: "centrifuge", method: ["centrifugation"] },
        { name: "sonicator", method: ["ultrasonic cleaning", "sonication"] },
        { name: "stirrer", method: ["magnetic stirring", "overhead stirring"] },
        { name: "pH meter", method: ["pH measurement"] }
      ],
      titleTemplate: [
        { type: "userInput", field: "device.manufacturer", separator: " - " },
        { type: "userInput", field: "device.name", separator: "" }
      ],
      folderTemplate: [
        { type: "string", field: "Resources/Devices", separator: "/" },
        { type: "userInput", field: "device.manufacturer", separator: " - " },
        { type: "userInput", field: "device.name", separator: "" }
      ],
      customMetadataTemplate: false,
      customMarkdownTemplate: false,
      customMetadataTemplatePath: "",
      customMarkdownTemplatePath: "",
      metadataTemplate: metadataTemplates.device,
      markdownTemplate: markdownTemplates.device
    },
    instrument: {
      navbar: {
        display: true,
        name: "Instrument",
        group: "resources"
      },
      commands: {
        enabled: true,
        id: "create-instrument-note",
        name: "Create Instrument Note"
      },
      type: [
        {
          name: "X-ray diffractometer",
          abbreviation: "XRD",
          technique: ["diffraction (reflection mode)", "diffraction (transmission mode)"]
        },
        {
          name: "Scanning electron microscope",
          abbreviation: "SEM",
          technique: ["SE inlens", "SE thorny", "BSE", "EDS", "EBSD", "STEM", "EsB"]
        },
        {
          name: "Transmission electron microscope",
          abbreviation: "TEM",
          technique: ["SAED", "HRTEM", "STEM", "EELS", "EDS"]
        },
        {
          name: "Atomic force microscope",
          abbreviation: "AFM",
          technique: ["topography", "phase contrast", "conductivity", "magnetic force", "electric force"]
        }
      ],
      titleTemplate: [
        { type: "userInput", field: "instrument.manufacturer", separator: " - " },
        { type: "userInput", field: "instrument.name", separator: "" }
      ],
      folderTemplate: [
        { type: "string", field: "Resources/Devices", separator: "/" },
        { type: "userInput", field: "instrument.manufacturer", separator: " - " },
        { type: "userInput", field: "instrument.name", separator: "" }
      ],
      customMetadataTemplate: false,
      customMarkdownTemplate: false,
      customMetadataTemplatePath: "",
      customMarkdownTemplatePath: "",
      metadataTemplate: metadataTemplates.instrument,
      markdownTemplate: markdownTemplates.instrument
    },
    meeting: {
      navbar: {
        display: true,
        name: "Meeting",
        group: "other"
      },
      commands: {
        enabled: true,
        id: "create-meeting-note",
        name: "Create Meeting Note"
      },
      type: ["meeting", "conference", "workshop", "symposium"],
      titleTemplate: [
        { type: "userInput", field: "meeting.date", separator: " - " },
        { type: "userInput", field: "meeting.title", separator: "" }
      ],
      folderTemplate: [
        { type: "string", field: "Meetings", separator: "/" },
        { type: "dateField", field: "year", separator: "/" },
        { type: "dateField", field: "month", separator: " " },
        { type: "dateField", field: "monthName", separator: "" }
      ],
      customMetadataTemplate: false,
      customMarkdownTemplate: false,
      customMetadataTemplatePath: "",
      customMarkdownTemplatePath: "",
      metadataTemplate: metadataTemplates.meeting,
      markdownTemplate: markdownTemplates.meeting
    },
    process: {
      navbar: {
        display: true,
        name: "Process",
        group: "experiments"
      },
      commands: {
        enabled: true,
        id: "create-process-note",
        name: "Create Process Note"
      },
      class: "organic synthesis",
      type: ["synthesis", "polymerization", "functionalization", "deprotection", "protection"],
      titleTemplate: [
        { type: "userInput", field: "process.name", separator: "" }
      ],
      folderTemplate: [
        { type: "string", field: "Processes", separator: "/" },
        { type: "userInput", field: "process.class", separator: "" }
      ],
      customMetadataTemplate: false,
      customMarkdownTemplate: false,
      customMetadataTemplatePath: "",
      customMarkdownTemplatePath: "",
      metadataTemplate: metadataTemplates.process,
      markdownTemplate: markdownTemplates.process
    },
    project: {
      navbar: {
        display: true,
        name: "Project",
        group: "other"
      },
      commands: {
        enabled: true,
        id: "create-project-note",
        name: "Create Project Note"
      },
      type: [
        {
          name: "research",
          category: ["chemistry", "electrochemistry", "physics", "materials science", "engineering"],
          subClassMetadataTemplate: subClassMetadataTemplates.project.research
        },
        {
          name: "development",
          category: ["battery", "fuel cell", "supercapacitor", "electrolyzer"],
          subClassMetadataTemplate: subClassMetadataTemplates.project.development
        },
        {
          name: "programming",
          category: ["application", "webapp", "backend", "database", "data analysis", "machine learning"],
          subClassMetadataTemplate: subClassMetadataTemplates.project.programming
        },
        {
          name: "meeting",
          category: ["conference", "workshop", "symposium"],
          subClassMetadataTemplate: subClassMetadataTemplates.project.meeting
        }
      ],
      titleTemplate: [
        { type: "userInput", field: "project.name", separator: "" }
      ],
      folderTemplate: [
        { type: "string", field: "Projects", separator: "/" },
        { type: "userInput", field: "project.type", separator: "" }
      ],
      customMetadataTemplate: false,
      customMarkdownTemplate: false,
      customMetadataTemplatePath: "",
      customMarkdownTemplatePath: "",
      metadataTemplate: metadataTemplates.project,
      markdownTemplate: markdownTemplates.project
    },
    sample: {
      navbar: {
        display: true,
        name: "Sample",
        group: "experiments"
      },
      commands: {
        enabled: true,
        id: "create-sample-note",
        name: "Create Sample Note"
      },
      type: [
        {
          name: "compound",
          subClassMetadataTemplate: subClassMetadataTemplates.sample.compound
        },
        {
          name: "electrode",
          subClassMetadataTemplate: subClassMetadataTemplates.sample.electrode
        },
        {
          name: "electrochemical cell",
          subClassMetadataTemplate: subClassMetadataTemplates.sample["electrochemical cell"]
        }
      ],
      titleTemplate: [
        { type: "operator", field: "operators[sample.operator].initials", separator: "-" },
        { type: "project", field: "projects[project.name].abbreviation", separator: "-" },
        { type: "setting", field: "note.sample.type[sample.type].abbreviation", separator: "" },
        { type: "index", field: "03", separator: "" }
      ],
      folderTemplate: [
        { type: "string", field: "Experiments/Samples", separator: "/" },
        { type: "userInput", field: "project.name", separator: "/" },
        { type: "userInput", field: "sample.type", separator: "" }
      ],
      customMetadataTemplate: false,
      customMarkdownTemplate: false,
      customMetadataTemplatePath: "",
      customMarkdownTemplatePath: "",
      metadataTemplate: metadataTemplates.sample,
      markdownTemplate: markdownTemplates.sample
    },
    sampleList: {
      navbar: {
        display: true,
        name: "Sample List",
        group: "experiments"
      },
      commands: {
        enabled: true,
        id: "create-sample-list-note",
        name: "Create Sample List Note"
      },
      titleTemplate: [
        { type: "string", field: "Samples", separator: " - " },
        { type: "userInput", field: "project.name", separator: "" }
      ],
      folderTemplate: [
        { type: "string", field: "Projects", separator: "/" },
        { type: "userInput", field: "project.name", separator: "" }
      ],
      customMetadataTemplate: false,
      customMarkdownTemplate: false,
      customMetadataTemplatePath: "",
      customMarkdownTemplatePath: "",
      metadataTemplate: metadataTemplates.sampleList,
      markdownTemplate: markdownTemplates.sampleList
    },
    default: {
      navbar: {
        display: false,
        name: "Default Note",
        group: "other"
      },
      commands: {
        enabled: false,
        id: "create-default-note",
        name: "Create Default Note"
      },
      titleTemplate: [
        { type: "string", field: "Untiteled Note", separator: "" }
      ],
      folderTemplate: [
        { type: "string", field: "Notes", separator: "" }
      ],
      customMetadataTemplate: false,
      customMarkdownTemplate: false,
      customMetadataTemplatePath: "",
      customMarkdownTemplatePath: "",
      metadataTemplate: metadataTemplates.default,
      markdownTemplate: markdownTemplates.default
    }
  }
};

// src/settings/ENLSettingTab.ts
var import_obsidian18 = require("obsidian");

// src/ui/modals/TemplateEditorModal.ts
var import_obsidian14 = require("obsidian");
var PathTemplateEditorModal = class extends import_obsidian14.Modal {
  constructor(app, template, onSave, title = "Edit Path Template") {
    super(app);
    this.template = JSON.parse(JSON.stringify(template));
    this.originalTemplate = template;
    this.onSave = onSave;
    this.setTitle(title);
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("p", {
      text: "Configure the template elements that determine how paths/titles are generated."
    });
    this.renderTemplateElements();
    new import_obsidian14.Setting(contentEl).addButton(
      (button) => button.setButtonText("Add Element").setCta().onClick(() => {
        this.template.push({
          type: "string",
          field: "",
          separator: ""
        });
        this.renderTemplateElements();
      })
    );
    const buttonContainer = contentEl.createEl("div", { cls: "modal-button-container" });
    new import_obsidian14.Setting(buttonContainer).addButton(
      (button) => button.setButtonText("Save").setCta().onClick(() => {
        this.onSave(this.template);
        this.close();
      })
    ).addButton(
      (button) => button.setButtonText("Cancel").onClick(() => {
        this.close();
      })
    );
  }
  renderTemplateElements() {
    const existingContainer = this.contentEl.querySelector(".template-elements");
    if (existingContainer) {
      existingContainer.remove();
    }
    const container = this.contentEl.createEl("div", { cls: "template-elements" });
    this.template.forEach((element, index) => {
      const elementContainer = container.createEl("div", { cls: "template-element" });
      elementContainer.createEl("h4", { text: `Element ${index + 1}` });
      new import_obsidian14.Setting(elementContainer).setName("Type").addDropdown((dropdown) => {
        dropdown.addOption("string", "Static String").addOption("dateField", "Date Field").addOption("userInput", "User Input").addOption("index", "Auto Index").setValue(element.type).onChange((value) => {
          element.type = value;
        });
      });
      new import_obsidian14.Setting(elementContainer).setName("Field").setDesc("The field value or path (e.g., 'currentDate', 'this.userInput.author')").addText(
        (text) => text.setValue(element.field).onChange((value) => {
          element.field = value;
        })
      );
      new import_obsidian14.Setting(elementContainer).setName("Separator").setDesc("Optional separator to append after this element").addText(
        (text) => text.setValue(element.separator || "").onChange((value) => {
          element.separator = value;
        })
      );
      new import_obsidian14.Setting(elementContainer).addButton(
        (button) => button.setButtonText("Delete Element").setWarning().onClick(() => {
          this.template.splice(index, 1);
          this.renderTemplateElements();
        })
      );
      elementContainer.createEl("hr");
    });
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};
var MetadataTemplateEditorModal = class extends import_obsidian14.Modal {
  constructor(app, template, onSave) {
    super(app);
    this.template = JSON.parse(JSON.stringify(template));
    this.originalTemplate = template;
    this.onSave = onSave;
    this.setTitle("Edit Metadata Template");
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("p", {
      text: "Configure the metadata fields for this note type. This is a simplified editor - for complex configurations, edit the template files directly."
    });
    this.renderFields();
    new import_obsidian14.Setting(contentEl).addButton(
      (button) => button.setButtonText("Add Field").setCta().onClick(() => {
        const fieldName = `field_${Object.keys(this.template).length + 1}`;
        this.template[fieldName] = {
          inputType: "text",
          default: ""
        };
        this.renderFields();
      })
    );
    const buttonContainer = contentEl.createEl("div", { cls: "modal-button-container" });
    new import_obsidian14.Setting(buttonContainer).addButton(
      (button) => button.setButtonText("Save").setCta().onClick(() => {
        this.onSave(this.template);
        this.close();
      })
    ).addButton(
      (button) => button.setButtonText("Cancel").onClick(() => {
        this.close();
      })
    );
  }
  renderFields() {
    const existingContainer = this.contentEl.querySelector(".metadata-fields");
    if (existingContainer) {
      existingContainer.remove();
    }
    const container = this.contentEl.createEl("div", { cls: "metadata-fields" });
    Object.entries(this.template).forEach(([fieldName, field]) => {
      const fieldContainer = container.createEl("div", { cls: "metadata-field" });
      fieldContainer.createEl("h4", { text: fieldName });
      const typedField = field;
      new import_obsidian14.Setting(fieldContainer).setName("Input Type").addDropdown((dropdown) => {
        dropdown.addOption("text", "Text").addOption("number", "Number").addOption("date", "Date").addOption("dropdown", "Dropdown").addOption("multiselect", "Multi-select").addOption("list", "List").setValue(typedField.inputType || "text").onChange((value) => {
          typedField.inputType = value;
        });
      });
      new import_obsidian14.Setting(fieldContainer).setName("Default Value").addText(
        (text) => text.setValue(String(typedField.default || "")).onChange((value) => {
          typedField.default = value;
        })
      );
      new import_obsidian14.Setting(fieldContainer).setName("Query Field").setDesc("Show this field in the note creation dialog").addToggle(
        (toggle) => toggle.setValue(typedField.query || false).onChange((value) => {
          typedField.query = value;
        })
      );
      new import_obsidian14.Setting(fieldContainer).addButton(
        (button) => button.setButtonText("Delete Field").setWarning().onClick(() => {
          delete this.template[fieldName];
          this.renderFields();
        })
      );
      fieldContainer.createEl("hr");
    });
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};

// src/ui/modals/ArrayEditorModal.ts
var import_obsidian15 = require("obsidian");
var ArrayEditorModal = class extends import_obsidian15.Modal {
  constructor(app, items, onSave, itemTemplate, title = "Edit Items", fieldDescriptions = {}) {
    super(app);
    this.items = JSON.parse(JSON.stringify(items));
    this.onSave = onSave;
    this.itemTemplate = itemTemplate;
    this.title = title;
    this.fieldDescriptions = fieldDescriptions;
    this.setTitle(title);
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("p", {
      text: `Manage ${this.title.toLowerCase()}. Add, edit, or remove items from the list.`
    });
    this.renderItems();
    new import_obsidian15.Setting(contentEl).addButton(
      (button) => button.setButtonText("Add Item").setCta().onClick(() => {
        const newItem = JSON.parse(JSON.stringify(this.itemTemplate));
        this.items.push(newItem);
        this.renderItems();
      })
    );
    const buttonContainer = contentEl.createEl("div", { cls: "modal-button-container" });
    new import_obsidian15.Setting(buttonContainer).addButton(
      (button) => button.setButtonText("Save").setCta().onClick(() => {
        this.onSave(this.items);
        this.close();
      })
    ).addButton(
      (button) => button.setButtonText("Cancel").onClick(() => {
        this.close();
      })
    );
  }
  renderItems() {
    const existingContainer = this.contentEl.querySelector(".array-items");
    if (existingContainer) {
      existingContainer.remove();
    }
    const container = this.contentEl.createEl("div", { cls: "array-items" });
    this.items.forEach((item, index) => {
      const itemContainer = container.createEl("div", { cls: "array-item" });
      itemContainer.createEl("h4", { text: `Item ${index + 1}` });
      Object.keys(this.itemTemplate).forEach((key) => {
        const value = item[key];
        const description = this.fieldDescriptions[key] || `Configure ${key}`;
        if (Array.isArray(value)) {
          new import_obsidian15.Setting(itemContainer).setName(this.capitalizeKey(key)).setDesc(`${description} (comma-separated)`).addText(
            (text) => text.setValue(value.join(", ")).onChange((newValue) => {
              item[key] = newValue.split(",").map((v) => v.trim()).filter((v) => v);
            })
          );
        } else {
          new import_obsidian15.Setting(itemContainer).setName(this.capitalizeKey(key)).setDesc(description).addText(
            (text) => text.setValue(String(value || "")).onChange((newValue) => {
              item[key] = newValue;
            })
          );
        }
      });
      new import_obsidian15.Setting(itemContainer).addButton(
        (button) => button.setButtonText("Delete Item").setWarning().onClick(() => {
          this.items.splice(index, 1);
          this.renderItems();
        })
      );
      itemContainer.createEl("hr");
    });
    if (this.items.length === 0) {
      container.createEl("p", {
        text: "No items configured. Click 'Add Item' to get started.",
        cls: "empty-state"
      });
    }
  }
  capitalizeKey(key) {
    return key.split(/(?=[A-Z])/).map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};

// src/ui/modals/FilePickerModal.ts
var import_obsidian16 = require("obsidian");
var FilePickerModal = class extends import_obsidian16.Modal {
  constructor(app, onSelect, fileExtension = ".md", title = "Select File", currentPath = "") {
    super(app);
    this.onSelect = onSelect;
    this.fileExtension = fileExtension;
    this.title = title;
    this.currentPath = currentPath;
    this.setTitle(title);
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("p", {
      text: `Select a ${this.fileExtension} file from your vault, or enter a path manually.`
    });
    let manualPath = this.currentPath;
    new import_obsidian16.Setting(contentEl).setName("File Path").setDesc("Enter the path to the template file").addText((text) => {
      text.setValue(this.currentPath).onChange((value) => {
        manualPath = value;
      });
    }).addButton(
      (button) => button.setButtonText("Use This Path").setCta().onClick(() => {
        this.onSelect(manualPath);
        this.close();
      })
    );
    contentEl.createEl("hr");
    contentEl.createEl("h4", { text: "Or browse files:" });
    this.renderFileBrowser(contentEl);
    new import_obsidian16.Setting(contentEl).addButton(
      (button) => button.setButtonText("Cancel").onClick(() => {
        this.close();
      })
    );
  }
  renderFileBrowser(containerEl) {
    const browserContainer = containerEl.createEl("div", { cls: "file-browser" });
    const files = this.app.vault.getFiles().filter((file) => file.extension === this.fileExtension.replace(".", "")).sort((a, b) => a.path.localeCompare(b.path));
    if (files.length === 0) {
      browserContainer.createEl("p", {
        text: `No ${this.fileExtension} files found in the vault.`,
        cls: "empty-state"
      });
      return;
    }
    files.forEach((file) => {
      const fileItem = browserContainer.createEl("div", { cls: "file-item" });
      fileItem.createEl("span", {
        text: file.path,
        cls: "file-path"
      });
      const selectButton = fileItem.createEl("button", {
        text: "Select",
        cls: "file-select-button"
      });
      selectButton.addEventListener("click", () => {
        this.onSelect(file.path);
        this.close();
      });
    });
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};

// src/ui/modals/NoteTypeManagerModal.ts
var import_obsidian17 = require("obsidian");
var NoteTypeManagerModal = class extends import_obsidian17.Modal {
  constructor(app, settings, onSave) {
    super(app);
    this.settings = JSON.parse(JSON.stringify(settings));
    this.onSave = onSave;
    this.setTitle("Manage Note Types");
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("p", {
      text: "Add custom note types or remove existing ones. Built-in note types cannot be deleted but can be disabled."
    });
    this.renderNoteTypes();
    this.createAddNoteTypeSection(contentEl);
    const buttonContainer = contentEl.createEl("div", { cls: "modal-button-container" });
    new import_obsidian17.Setting(buttonContainer).addButton(
      (button) => button.setButtonText("Save Changes").setCta().onClick(() => {
        this.onSave(this.settings);
        this.close();
      })
    ).addButton(
      (button) => button.setButtonText("Cancel").onClick(() => {
        this.close();
      })
    );
  }
  renderNoteTypes() {
    const existingContainer = this.contentEl.querySelector(".note-types-list");
    if (existingContainer) {
      existingContainer.remove();
    }
    const container = this.contentEl.createEl("div", { cls: "note-types-list" });
    container.createEl("h4", { text: "Existing Note Types" });
    const builtInTypes = /* @__PURE__ */ new Set([
      "analysis",
      "chemical",
      "dailyNote",
      "device",
      "instrument",
      "meeting",
      "process",
      "project",
      "sample",
      "sampleList",
      "default"
    ]);
    Object.entries(this.settings.note).forEach(([noteType, config]) => {
      const typeContainer = container.createEl("div", { cls: "note-type-item" });
      const header = typeContainer.createEl("div", { cls: "note-type-header" });
      header.createEl("span", {
        text: this.capitalizeNoteTypeName(noteType),
        cls: "note-type-name"
      });
      if (builtInTypes.has(noteType)) {
        header.createEl("span", {
          text: "Built-in",
          cls: "note-type-badge built-in"
        });
      } else {
        header.createEl("span", {
          text: "Custom",
          cls: "note-type-badge custom"
        });
        const deleteButton = header.createEl("button", {
          text: "Delete",
          cls: "note-type-delete"
        });
        deleteButton.addEventListener("click", () => {
          if (confirm(`Are you sure you want to delete the "${noteType}" note type? This action cannot be undone.`)) {
            delete this.settings.note[noteType];
            this.renderNoteTypes();
          }
        });
      }
      const toggleContainer = typeContainer.createEl("div", { cls: "note-type-controls" });
      new import_obsidian17.Setting(toggleContainer).setName("Enabled").setDesc(builtInTypes.has(noteType) ? "Enable/disable this built-in note type" : "Enable/disable this custom note type").addToggle(
        (toggle) => {
          var _a, _b;
          return toggle.setValue((_b = (_a = config.commands) == null ? void 0 : _a.enabled) != null ? _b : true).onChange((value) => {
            if (config.commands) {
              config.commands.enabled = value;
            }
          });
        }
      );
    });
  }
  createAddNoteTypeSection(containerEl) {
    containerEl.createEl("hr");
    containerEl.createEl("h4", { text: "Add New Note Type" });
    let newTypeName = "";
    let newTypeDisplayName = "";
    new import_obsidian17.Setting(containerEl).setName("Note Type ID").setDesc("Internal identifier (camelCase, no spaces)").addText(
      (text) => text.setPlaceholder("e.g., customExperiment").onChange((value) => {
        newTypeName = value.trim();
      })
    );
    new import_obsidian17.Setting(containerEl).setName("Display Name").setDesc("Human-readable name shown in the UI").addText(
      (text) => text.setPlaceholder("e.g., Custom Experiment").onChange((value) => {
        newTypeDisplayName = value.trim();
      })
    );
    new import_obsidian17.Setting(containerEl).addButton(
      (button) => button.setButtonText("Add Note Type").setCta().onClick(() => {
        if (!newTypeName) {
          new import_obsidian17.Notice("Please enter a note type ID");
          return;
        }
        if (!newTypeDisplayName) {
          newTypeDisplayName = this.capitalizeNoteTypeName(newTypeName);
        }
        if (this.settings.note[newTypeName]) {
          new import_obsidian17.Notice("A note type with this ID already exists");
          return;
        }
        const newNoteConfig = {
          ...JSON.parse(JSON.stringify(DEFAULT_SETTINGS.note.default)),
          navbar: {
            ...DEFAULT_SETTINGS.note.default.navbar,
            name: newTypeDisplayName
          },
          commands: {
            ...DEFAULT_SETTINGS.note.default.commands,
            id: `create-${newTypeName}`,
            name: `Create ${newTypeDisplayName}`
          }
        };
        this.settings.note[newTypeName] = newNoteConfig;
        new import_obsidian17.Notice(`Added new note type: ${newTypeDisplayName}`);
        this.renderNoteTypes();
        newTypeName = "";
        newTypeDisplayName = "";
      })
    );
  }
  capitalizeNoteTypeName(noteType) {
    const nameMap = {
      "dailyNote": "Daily Note",
      "sampleList": "Sample List"
    };
    return nameMap[noteType] || noteType.split(/(?=[A-Z])/).map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};

// src/settings/ENLSettingTab.ts
var ELNSettingTab = class extends import_obsidian18.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "ELN Plugin Settings" });
    this.createGeneralSettings(containerEl);
    this.createNavbarSettings(containerEl);
    this.createFooterSettings(containerEl);
    this.createNoteSettings(containerEl);
  }
  createGeneralSettings(containerEl) {
    containerEl.createEl("h3", { text: "General Settings" });
    this.createEditableList(
      containerEl,
      "Authors",
      this.plugin.settings.general.authors,
      async (updatedList) => {
        this.plugin.settings.general.authors = updatedList;
        await this.plugin.saveSettings();
      }
    );
    this.createEditableList(
      containerEl,
      "Operators",
      this.plugin.settings.general.operators,
      async (updatedList) => {
        this.plugin.settings.general.operators = updatedList;
        await this.plugin.saveSettings();
      }
    );
  }
  createNavbarSettings(containerEl) {
    containerEl.createEl("h3", { text: "Navbar Settings" });
    new import_obsidian18.Setting(containerEl).setName("Display Navigation Bar").setDesc("Display a navigation bar at the top of all notes.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.navbar.enabled).onChange(async (value) => {
        this.plugin.settings.navbar.enabled = value;
        await this.plugin.saveSettings();
      })
    );
  }
  createFooterSettings(containerEl) {
    containerEl.createEl("h3", { text: "Footer Settings" });
    new import_obsidian18.Setting(containerEl).setName("Display Footer").setDesc("Display a footer at the bottom of all notes.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.footer.enabled).onChange(async (value) => {
        this.plugin.settings.footer.enabled = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian18.Setting(containerEl).setName("Include Version").setDesc("Include the ELN version in the footer of notes.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.footer.includeVersion).onChange(async (value) => {
        this.plugin.settings.footer.includeVersion = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian18.Setting(containerEl).setName("Include Author").setDesc("Include author information in the footer of notes.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.footer.includeAuthor).onChange(async (value) => {
        this.plugin.settings.footer.includeAuthor = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian18.Setting(containerEl).setName("Include Modification Time").setDesc("Include the last modification time in the footer of notes.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.footer.includeMtime).onChange(async (value) => {
        this.plugin.settings.footer.includeMtime = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian18.Setting(containerEl).setName("Include Creation Time").setDesc("Include the creation time in the footer of notes.").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.footer.includeCtime).onChange(async (value) => {
        this.plugin.settings.footer.includeCtime = value;
        await this.plugin.saveSettings();
      })
    );
  }
  createNoteSettings(containerEl) {
    const headerContainer = containerEl.createEl("div", { cls: "note-settings-header" });
    headerContainer.createEl("h3", { text: "Note Settings" });
    new import_obsidian18.Setting(headerContainer).setName("Manage Note Types").setDesc("Add custom note types or manage existing ones").addButton(
      (button) => button.setButtonText("Manage").onClick(() => {
        new NoteTypeManagerModal(
          this.app,
          this.plugin.settings,
          async (updatedSettings) => {
            this.plugin.settings = updatedSettings;
            await this.plugin.saveSettings();
            this.display();
          }
        ).open();
      })
    );
    Object.entries(this.plugin.settings.note).forEach(([noteType, config]) => {
      this.createNoteTypeSection(containerEl, noteType, config);
    });
  }
  createNoteTypeSection(containerEl, noteType, config) {
    const noteSection = containerEl.createEl("details", { cls: "note-settings-section" });
    noteSection.createEl("summary", {
      text: this.capitalizeNoteTypeName(noteType),
      cls: "note-settings-summary"
    });
    const contentEl = noteSection.createEl("div", { cls: "note-settings-content" });
    this.createNoteNavbarSettings(contentEl, noteType, config);
    this.createNoteCommandSettings(contentEl, noteType, config);
    this.createNoteTemplateSettings(contentEl, noteType, config);
    this.createNoteSpecificSettings(contentEl, noteType, config);
  }
  createNoteNavbarSettings(containerEl, noteType, config) {
    containerEl.createEl("h5", { text: "Navbar Settings" });
    new import_obsidian18.Setting(containerEl).setName("Display in Navbar").setDesc("Show this note type in the navigation bar.").addToggle(
      (toggle) => toggle.setValue(config.navbar.display).onChange(async (value) => {
        config.navbar.display = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian18.Setting(containerEl).setName("Display Name").setDesc("Name shown in the navbar.").addText(
      (text) => text.setValue(config.navbar.name).onChange(async (value) => {
        config.navbar.name = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian18.Setting(containerEl).setName("Navbar Group").setDesc("Group this note type belongs to in the navbar.").addDropdown((dropdown) => {
      this.plugin.settings.navbar.groups.forEach((group) => {
        dropdown.addOption(group.id, group.name);
      });
      dropdown.setValue(config.navbar.group).onChange(async (value) => {
        config.navbar.group = value;
        await this.plugin.saveSettings();
      });
    });
  }
  createNoteCommandSettings(containerEl, noteType, config) {
    containerEl.createEl("h5", { text: "Command Settings" });
    new import_obsidian18.Setting(containerEl).setName("Enable Command").setDesc("Enable the command to create this note type.").addToggle(
      (toggle) => toggle.setValue(config.commands.enabled).onChange(async (value) => {
        config.commands.enabled = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian18.Setting(containerEl).setName("Command ID").setDesc("Unique identifier for the command.").addText(
      (text) => text.setValue(config.commands.id).onChange(async (value) => {
        config.commands.id = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian18.Setting(containerEl).setName("Command Name").setDesc("Display name for the command.").addText(
      (text) => text.setValue(config.commands.name).onChange(async (value) => {
        config.commands.name = value;
        await this.plugin.saveSettings();
      })
    );
  }
  createNoteTemplateSettings(containerEl, noteType, config) {
    containerEl.createEl("h5", { text: "Template Settings" });
    new import_obsidian18.Setting(containerEl).setName("Title Template").setDesc("Template for generating note titles.").addButton(
      (button) => button.setButtonText("Edit").onClick(() => {
        new PathTemplateEditorModal(
          this.app,
          config.titleTemplate,
          async (updatedTemplate) => {
            config.titleTemplate = updatedTemplate;
            await this.plugin.saveSettings();
          },
          "Edit Title Template"
        ).open();
      })
    );
    new import_obsidian18.Setting(containerEl).setName("Folder Template").setDesc("Template for determining note folder location.").addButton(
      (button) => button.setButtonText("Edit").onClick(() => {
        new PathTemplateEditorModal(
          this.app,
          config.folderTemplate,
          async (updatedTemplate) => {
            config.folderTemplate = updatedTemplate;
            await this.plugin.saveSettings();
          },
          "Edit Folder Template"
        ).open();
      })
    );
    new import_obsidian18.Setting(containerEl).setName("Use Custom Metadata Template").setDesc("Use a custom metadata template file.").addToggle(
      (toggle) => toggle.setValue(config.customMetadataTemplate).onChange(async (value) => {
        config.customMetadataTemplate = value;
        await this.plugin.saveSettings();
      })
    );
    if (config.customMetadataTemplate) {
      new import_obsidian18.Setting(containerEl).setName("Metadata Template Path").setDesc("Path to the custom metadata template file.").addText(
        (text) => text.setValue(config.customMetadataTemplatePath).onChange(async (value) => {
          config.customMetadataTemplatePath = value;
          await this.plugin.saveSettings();
        })
      ).addButton(
        (button) => button.setButtonText("Browse").onClick(() => {
          new FilePickerModal(
            this.app,
            (selectedPath) => {
              config.customMetadataTemplatePath = selectedPath;
              this.plugin.saveSettings();
              this.display();
            },
            ".md",
            "Select Metadata Template"
          ).open();
        })
      );
    } else {
      new import_obsidian18.Setting(containerEl).setName("Metadata Template").setDesc("Edit the metadata template structure.").addButton(
        (button) => button.setButtonText("Edit").onClick(() => {
          new MetadataTemplateEditorModal(
            this.app,
            config.metadataTemplate,
            async (updatedTemplate) => {
              config.metadataTemplate = updatedTemplate;
              await this.plugin.saveSettings();
            }
          ).open();
        })
      );
    }
    new import_obsidian18.Setting(containerEl).setName("Use Custom Markdown Template").setDesc("Use a custom markdown template file.").addToggle(
      (toggle) => toggle.setValue(config.customMarkdownTemplate).onChange(async (value) => {
        config.customMarkdownTemplate = value;
        await this.plugin.saveSettings();
      })
    );
    if (config.customMarkdownTemplate) {
      new import_obsidian18.Setting(containerEl).setName("Markdown Template Path").setDesc("Path to the custom markdown template file.").addText(
        (text) => text.setValue(config.customMarkdownTemplatePath).onChange(async (value) => {
          config.customMarkdownTemplatePath = value;
          await this.plugin.saveSettings();
        })
      ).addButton(
        (button) => button.setButtonText("Browse").onClick(() => {
          new FilePickerModal(
            this.app,
            (selectedPath) => {
              config.customMarkdownTemplatePath = selectedPath;
              this.plugin.saveSettings();
              this.display();
            },
            ".md",
            "Select Markdown Template"
          ).open();
        })
      );
    }
  }
  createNoteSpecificSettings(containerEl, noteType, config) {
    containerEl.createEl("h5", { text: "Note-Specific Settings" });
    Object.entries(config).forEach(([key, value]) => {
      if ([
        "navbar",
        "commands",
        "titleTemplate",
        "folderTemplate",
        "customMetadataTemplate",
        "customMarkdownTemplate",
        "customMetadataTemplatePath",
        "customMarkdownTemplatePath",
        "metadataTemplate",
        "markdownTemplate"
      ].includes(key)) {
        return;
      }
      if (Array.isArray(value)) {
        this.createNoteSpecificArraySetting(containerEl, noteType, key, value);
      } else if (typeof value === "string") {
        this.createNoteSpecificStringSetting(containerEl, noteType, key, value);
      }
    });
  }
  createNoteSpecificArraySetting(containerEl, noteType, key, value) {
    const isStringArray = value.length === 0 || typeof value[0] === "string";
    if (isStringArray) {
      this.createStringList(
        containerEl,
        this.capitalizeKey(key),
        value,
        async (updatedList) => {
          this.plugin.settings.note[noteType][key] = updatedList;
          await this.plugin.saveSettings();
        }
      );
    } else {
      const setting = new import_obsidian18.Setting(containerEl).setName(this.capitalizeKey(key)).setDesc(`Manage ${key} configurations.`);
      value.forEach((item, index) => {
        if (item && typeof item === "object" && item !== null && "name" in item) {
          setting.addButton(
            (button) => button.setButtonText(String(item.name)).onClick(() => {
              new ArrayEditorModal(
                this.app,
                [item],
                async (updatedItems) => {
                  if (updatedItems.length > 0) {
                    Object.assign(item, updatedItems[0]);
                    await this.plugin.saveSettings();
                  }
                },
                item,
                `Edit ${item.name}`
              ).open();
            })
          );
        }
      });
      setting.addButton(
        (button) => button.setButtonText("Manage All").onClick(() => {
          const template = value.length > 0 ? value[0] : { name: "", web: "" };
          new ArrayEditorModal(
            this.app,
            value,
            async (updatedItems) => {
              this.plugin.settings.note[noteType][key] = updatedItems;
              await this.plugin.saveSettings();
              this.display();
            },
            template,
            `Manage ${this.capitalizeKey(key)}`
          ).open();
        })
      );
    }
  }
  createNoteSpecificStringSetting(containerEl, noteType, key, value) {
    new import_obsidian18.Setting(containerEl).setName(this.capitalizeKey(key)).addText(
      (text) => text.setValue(value).onChange(async (newValue) => {
        this.plugin.settings.note[noteType][key] = newValue;
        await this.plugin.saveSettings();
      })
    );
  }
  capitalizeNoteTypeName(noteType) {
    const nameMap = {
      "dailyNote": "Daily Note",
      "sampleList": "Sample List"
    };
    return nameMap[noteType] || noteType.charAt(0).toUpperCase() + noteType.slice(1);
  }
  capitalizeKey(key) {
    return key.split(/(?=[A-Z])/).map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  }
  /**
   * Create an editable list for string arrays.
   */
  createStringList(containerEl, title, items, onSave) {
    const setting = new import_obsidian18.Setting(containerEl).setName(title);
    const listEl = setting.controlEl.createEl("div", { cls: "editable-list" });
    items.forEach((item, index) => {
      const itemEl = listEl.createEl("div", { cls: "editable-list-item" });
      const input = itemEl.createEl("input", {
        type: "text",
        value: item
      });
      input.addEventListener("blur", async () => {
        items[index] = input.value.trim();
        await onSave(items);
      });
      const removeButton = itemEl.createEl("button", { text: "Remove" });
      removeButton.addEventListener("click", async () => {
        items.splice(index, 1);
        await onSave(items);
        this.display();
      });
    });
    const addButton = listEl.createEl("button", { text: "Add" });
    addButton.addEventListener("click", async () => {
      items.push("");
      await onSave(items);
      this.display();
    });
  }
  /**
   * Creates an editable list for a setting.
   */
  createEditableList(containerEl, title, items, onSave) {
    const setting = new import_obsidian18.Setting(containerEl).setName(title);
    const listEl = setting.controlEl.createEl("div", { cls: "editable-list" });
    items.forEach((item, index) => {
      const itemEl = listEl.createEl("div", { cls: "editable-list-item" });
      if (typeof item === "object" && item !== null) {
        Object.keys(item).forEach((key) => {
          const value = item[key];
          if (Array.isArray(value)) {
            const input = itemEl.createEl("input", {
              type: "text",
              value: value.join(", "),
              placeholder: key.charAt(0).toUpperCase() + key.slice(1)
            });
            input.addEventListener("blur", async () => {
              item[key] = input.value.split(",").map((v) => v.trim()).filter((v) => v);
              await onSave(items);
            });
          } else {
            const input = itemEl.createEl("input", {
              type: "text",
              value: value || "",
              placeholder: key.charAt(0).toUpperCase() + key.slice(1)
            });
            input.addEventListener("blur", async () => {
              item[key] = input.value.trim();
              await onSave(items);
            });
          }
        });
      }
      const removeButton = itemEl.createEl("button", { text: "Remove" });
      removeButton.addEventListener("click", async () => {
        items.splice(index, 1);
        await onSave(items);
        this.display();
      });
    });
    const addButton = listEl.createEl("button", { text: "Add" });
    addButton.addEventListener("click", async () => {
      const newItem = items.length > 0 ? Object.keys(items[0]).reduce((acc, key) => {
        acc[key] = Array.isArray(items[0][key]) ? [] : "";
        return acc;
      }, {}) : {};
      items.push(newItem);
      await onSave(items);
      this.display();
    });
  }
};

// src/ui/views/NestedPropertiesEditor.ts
var import_obsidian22 = require("obsidian");

// src/renderer/renderFrontMatter.ts
var import_obsidian21 = require("obsidian");

// src/renderer/npe/core/renderArray.ts
function renderArray2(view, key, value, parent, level, fullKey, filterKeys) {
  console.debug("renderArray called - needs restoration");
  const container = parent.createDiv({ cls: "npe-array-container" });
  container.createDiv({ text: `Array: ${key} (${value.length} items)`, cls: "npe-array-header" });
}

// src/renderer/npe/core/renderPrimitive.ts
var import_obsidian19 = require("obsidian");

// src/renderer/npe/helpers/getPropertyIcon.ts
function getPropertyIcon2(key, dataType) {
  if (dataType === "boolean") return "check-square";
  if (dataType === "number") return "hash";
  if (dataType === "date") return "calendar";
  if (dataType === "link") return "link";
  if (dataType === "external-link") return "external-link";
  return "text";
}

// src/renderer/npe/helpers/getPropertyInputType.ts
function getPropertyInputType2(dataType) {
  switch (dataType) {
    case "string":
    case "link":
    case "external-link":
    case "latex":
      return "text";
    case "number":
      return "number";
    case "boolean":
      return "checkbox";
    case "date":
      return "date";
    default:
      return "text";
  }
}

// src/utils/updateProperties.ts
async function updateProperties2(app, file, key, value, dataType = "string") {
  if (!file) return;
  switch (dataType) {
    case "string":
      value = value.toString();
      break;
    case "link":
      value = `[[${value}]]`;
      break;
    case "external-link":
      value = value.toString();
      break;
    case "number":
      value = Number(value);
      break;
    case "boolean":
      break;
    case "latex":
      value = `$${value}$`;
      break;
    default:
      break;
  }
  if (typeof value === "number" && isNaN(value) || value === null || JSON.stringify(value) === "{}") {
    value = void 0;
  }
  await app.fileManager.processFrontMatter(file, (frontmatter) => {
    const keys = key.split(".");
    let obj = frontmatter;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) {
        obj[keys[i]] = {};
      }
      obj = obj[keys[i]];
    }
    if (value === void 0) {
      if (Array.isArray(obj)) {
        obj.splice(Number(keys[keys.length - 1]), 1);
      } else {
        delete obj[keys[keys.length - 1]];
      }
    } else {
      obj[keys[keys.length - 1]] = value;
    }
  });
}

// src/renderer/npe/legacy/updateProperties.ts
async function updateProperties3(view, key, value, dataType = "string") {
  const app = view.app;
  const file = view.currentFile;
  if (!file) return;
  await updateProperties2(app, file, key, value, dataType);
}

// src/utils/changeKeyName.ts
function renameObjectKey2(oldObject, oldKey, newKey) {
  const keys = Object.keys(oldObject != null ? oldObject : {});
  const newObject = keys.reduce((acc, currentKey) => {
    if (currentKey === oldKey) {
      acc[newKey] = oldObject[oldKey];
    } else {
      acc[currentKey] = oldObject[currentKey];
    }
    return acc;
  }, {});
  return newObject;
}
async function changeKeyName2(app, file, key, newKey) {
  await app.fileManager.processFrontMatter(file, (frontmatter) => {
    const keys = key.split(".");
    let obj = frontmatter;
    const lastKey = keys[keys.length - 1];
    let targetObject;
    if (keys.length > 1) {
      for (let i = 0; i < keys.length - 2; i++) {
        if (!obj[keys[i]]) {
          obj[keys[i]] = {};
        }
        obj = obj[keys[i]];
      }
      const targetKey = keys[keys.length - 2];
      targetObject = obj[targetKey];
    } else {
      targetObject = obj;
    }
    if (targetObject) {
      const renamed = renameObjectKey2(targetObject, lastKey, newKey);
      if (keys.length > 1) {
        const targetKey = keys[keys.length - 2];
        obj[targetKey] = renamed;
      } else {
        for (const k of Object.keys(obj)) {
          delete obj[k];
        }
        Object.assign(obj, renamed);
      }
    }
  });
}

// src/renderer/npe/legacy/changeKeyName.ts
async function changeKeyName3(app, file, key, newKey) {
  await changeKeyName2(app, file, key, newKey);
}

// src/renderer/npe/helpers/getFrontmatterValue.ts
function getFrontmatterValue2(app, fullKey) {
  var _a;
  const activeFile = app.workspace.getActiveFile();
  if (!activeFile) return null;
  const frontmatter = (_a = app.metadataCache.getFileCache(activeFile)) == null ? void 0 : _a.frontmatter;
  if (!frontmatter) return null;
  const keys = fullKey.split(".");
  let value = frontmatter;
  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key];
    } else {
      return null;
    }
  }
  return value;
}

// src/renderer/npe/elements/createInternalLinkElement.ts
function createInternalLinkElement2(view, linkText, container, fullKey) {
  const linkEl = container.createEl("a", {
    text: linkText,
    href: "#",
    cls: "internal-link"
  });
  console.debug("createInternalLinkElement called - needs restoration");
}

// src/renderer/npe/elements/createExternalLinkElement.ts
function createExternalLinkElement2(view, linkText, container, fullKey) {
  container.createEl("a", {
    text: linkText,
    href: linkText,
    cls: "external-link"
  });
  console.debug("createExternalLinkElement called - needs restoration");
}

// src/renderer/components/latexToHTML.ts
function latexToHTML2(latex) {
  console.warn("latexToHTML needs to be restored");
  return `<span class="latex-placeholder">${latex}</span>`;
}

// src/renderer/npe/helpers/showTypeSwitchMenu.ts
function showTypeSwitchMenu2(view, container, key, fullKey, level, isKeyOfArrayObject) {
  console.debug("showTypeSwitchMenu called - needs restoration");
  const types = ["string", "number", "boolean", "date", "link", "external-link"];
  const typeString = types.join(", ");
  alert(`Type switch menu for ${key}. Available types: ${typeString}`);
}

// src/renderer/npe/helpers/addKeyWrapperResizeHandle.ts
function addKeyWrapperResizeHandle2(view, keyWrapper, npeViewContainer) {
  console.debug("addKeyWrapperResizeHandle called - needs restoration");
}

// src/renderer/npe/core/renderPrimitive.ts
function renderPrimitive2(view, key, value, parent, level, fullKey, isKeyOfArrayObject = false, update = false) {
  const app = view.app;
  const file = view.currentFile;
  if (!file) return;
  const { dataType, inputType, inputValue, icon, callback } = getPrimitiveDetails2(key, value);
  const container = update ? parent : parent.createDiv({ cls: "npe-key-value-container" });
  container.setAttribute("data-level", level.toString());
  container.setAttribute("data-key", fullKey);
  container.setAttribute("data-type", dataType);
  const keyWrapper = container.createDiv({ cls: "npe-primitive npe-key-wrapper" });
  keyWrapper.style.setProperty("--npe-data-level", level.toString());
  const keyDiv = keyWrapper.createDiv({ cls: "npe-key npe-primitive" });
  if (icon) {
    const iconDiv = keyDiv.createDiv({ cls: "npe-key-icon" });
    (0, import_obsidian19.setIcon)(iconDiv, icon);
  }
  const keyLabelDiv = keyDiv.createDiv({ cls: "npe-key-label npe-primitive npe-editable-key", text: key });
  keyLabelDiv.style.setProperty("--npe-data-level", level.toString());
  keyLabelDiv.contentEditable = "true";
  view.registerDomEvent(keyLabelDiv, "blur", async () => {
    var _a;
    const newKey = (_a = keyLabelDiv.textContent) == null ? void 0 : _a.trim();
    if (newKey && newKey !== key) {
      const oldFullKey = container.getAttribute("data-key") || fullKey;
      fullKey = oldFullKey.split(".").slice(0, -1).concat(newKey).join(".");
      await changeKeyName3(app, file, oldFullKey, newKey);
      key = newKey;
      container.setAttribute("data-key", fullKey);
    }
  });
  const npeViewContainer = container.closest(".npe-view-container");
  if (npeViewContainer) {
    addKeyWrapperResizeHandle2(view, keyWrapper, npeViewContainer);
  }
  const valueDiv = container.createDiv({ cls: "npe-value" });
  valueDiv.setAttribute("data-type", dataType);
  if (dataType === "external-link") {
    createExternalLinkElement2(view, inputValue, valueDiv, fullKey);
  } else if (dataType === "link") {
    createInternalLinkElement2(view, inputValue, valueDiv, fullKey);
  } else if (dataType === "latex") {
    const latexDiv = valueDiv.createDiv({ cls: "npe-latex" });
    latexDiv.innerHTML = latexToHTML2(inputValue);
    fullKey = container.getAttribute("data-key") || fullKey;
    view.registerDomEvent(latexDiv, "click", () => {
      let val = getFrontmatterValue2(app, fullKey);
      if (typeof val === "string" && val.startsWith("$") && val.endsWith("$")) {
        val = val.slice(1, -1);
      }
      latexDiv.innerHTML = val;
      latexDiv.contentEditable = "true";
      latexDiv.focus();
    });
    view.registerDomEvent(latexDiv, "blur", () => {
      const newValue = latexDiv.textContent || "";
      fullKey = container.getAttribute("data-key") || fullKey;
      updateProperties3(view, fullKey, newValue, "latex");
      latexDiv.innerHTML = latexToHTML2(newValue);
      latexDiv.contentEditable = "false";
    });
  } else if (inputType) {
    const input = valueDiv.createEl("input", {
      type: inputType,
      value: inputType === "checkbox" ? void 0 : String(inputValue),
      attr: { "data-key": fullKey, "data-type": dataType }
    });
    if (inputType === "checkbox") input.checked = !!inputValue;
    view.registerDomEvent(input, "blur", () => {
      if (callback) {
        callback(inputType === "checkbox" ? input.checked : input.value);
      }
      fullKey = container.getAttribute("data-key") || fullKey;
      updateProperties3(view, fullKey, inputType === "checkbox" ? input.checked : input.value, dataType);
      if (isKeyOfArrayObject && key === "name") {
        const objectFullKey = fullKey.split(".").slice(0, -1).join(".");
        const objectItemContainer = parent.closest(`.npe-object-container[data-key="${objectFullKey}"]`);
        const objectKeyLabelDiv = objectItemContainer == null ? void 0 : objectItemContainer.querySelector(".npe-key-label.npe-object");
        if (objectKeyLabelDiv) objectKeyLabelDiv.textContent = input.value;
      }
    });
  } else {
    valueDiv.textContent = value !== null ? value.toString() : "";
  }
  const removeButton = container.createDiv({ cls: "npe-button npe-button--remove", text: "\xD7" });
  view.registerDomEvent(removeButton, "click", () => {
    updateProperties3(view, fullKey, void 0, "undefined");
    container.remove();
  });
  const optionsButton = keyWrapper.createDiv({ cls: "npe-button npe-button--options" });
  (0, import_obsidian19.setIcon)(optionsButton, "ellipsis");
  view.registerDomEvent(optionsButton, "click", () => {
    showTypeSwitchMenu2(view, container, key, fullKey, level, isKeyOfArrayObject);
  });
}
function getPrimitiveDetails2(key, value) {
  let dataType = typeof value;
  if (dataType === "string") {
    dataType = detectStringType3(value);
  }
  const inputType = getPropertyInputType2(dataType);
  let inputValue = parsePrimitiveValue2(dataType, value);
  if (inputValue === null) {
    inputValue = "";
  }
  const icon = getPropertyIcon2(key, dataType);
  const callback = (input) => {
    if (dataType === "boolean") {
      inputValue = input ? "checked" : "";
    } else if (dataType === "number") {
      inputValue = parseFloat(input);
    } else if (dataType === "string" || dataType === "link" || dataType === "external-link" || dataType === "date" || dataType === "latex") {
      inputValue = input;
    } else {
      console.warn(`Unknown data type: ${dataType}. Input not processed.`);
    }
  };
  return { dataType, inputType, inputValue, icon, callback };
}
function parsePrimitiveValue2(dataType, value) {
  const valueTransform = {
    string: (v) => v,
    number: (v) => parseFloat(v),
    boolean: (v) => v ? "checked" : "",
    link: (v) => v.startsWith("[[") && v.endsWith("]]") ? v.slice(2, -2) : v,
    "external-link": (v) => v,
    date: (v) => v,
    latex: (v) => v.startsWith("$") && v.endsWith("$") ? v.slice(1, -1) : v,
    unknown: (v) => v
  };
  if (dataType in valueTransform) {
    return valueTransform[dataType](value);
  } else {
    console.warn(`Unknown data type: ${dataType}. Returning value as is.`);
    return value;
  }
}
function detectStringType3(value) {
  let strType;
  if (value.startsWith("[[") && value.endsWith("]]")) {
    strType = "link";
    value = value.slice(2, -2);
  } else if (/^\[.*\]\(.*\)$/.test(value)) {
    strType = "external-link";
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    strType = "date";
  } else if (/^\$.*\$$/.test(value)) {
    strType = "latex";
    value = value.slice(1, -1);
  } else {
    strType = "string";
  }
  return strType;
}

// src/renderer/npe/core/renderObjectContainer.ts
function renderObjectContainer2(view, key, value, parent, level, fullKey, filterKeys) {
  console.debug("renderObjectContainer called - needs restoration");
  const container = parent.createDiv({ cls: "npe-object-container" });
  container.createDiv({ text: `Object: ${key}`, cls: "npe-object-header" });
}

// src/renderer/npe/core/renderObject.ts
function renderObject2(view, obj, parent, filterKeys = [], level = 0, parentKey = "", isArrayItem = false) {
  if (!obj || typeof obj !== "object") {
    return;
  }
  Object.entries(obj).forEach(([key, value]) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    if (filterKeys.includes(fullKey)) {
      return;
    }
    if (Array.isArray(value)) {
      renderArray2(view, key, value, parent, level, fullKey, filterKeys);
    } else if (typeof value === "object" && value !== null) {
      renderObjectContainer2(view, key, value, parent, level, fullKey, filterKeys);
    } else {
      renderPrimitive2(view, key, value, parent, level, fullKey);
    }
  });
}

// src/renderer/npe/buttons/createToggleButton.ts
function createToggleButton2(view, buttonContainer, propertiesContainer) {
  const toggleButton = buttonContainer.createEl("button", {
    text: "Toggle",
    cls: "npe-button npe-toggle-button"
  });
  view.registerDomEvent(toggleButton, "click", () => {
    propertiesContainer.style.display = propertiesContainer.style.display === "none" ? "block" : "none";
  });
}

// src/renderer/npe/buttons/createReloadButton.ts
function createReloadButton2(view, buttonContainer, propertiesContainer, parentKey, excludeKeys) {
  const reloadButton = buttonContainer.createEl("button", {
    text: "Reload",
    cls: "npe-button npe-reload-button"
  });
  view.registerDomEvent(reloadButton, "click", () => {
    console.debug("Reload button clicked - needs implementation");
  });
}

// src/renderer/npe/buttons/createAddPropertyButton.ts
function createAddPropertyButton2(view, buttonContainer, propertiesContainer) {
  const addButton = buttonContainer.createEl("button", {
    text: "Add Property",
    cls: "npe-button npe-add-button"
  });
  view.registerDomEvent(addButton, "click", () => {
    console.debug("Add property button clicked - needs implementation");
  });
}

// src/renderer/npe/buttons/createFixDepricatedPropertiesButton.ts
function createFixDepricatedPropertiesButton2(view, buttonContainer, propertiesContainer, parentKey, excludeKeys) {
  const fixButton = buttonContainer.createEl("button", {
    text: "Fix Deprecated",
    cls: "npe-button npe-fix-button"
  });
  view.registerDomEvent(fixButton, "click", () => {
    console.debug("Fix deprecated properties button clicked - needs implementation");
  });
}

// src/renderer/npe/buttons/createOptionsMenuButton.ts
var import_obsidian20 = require("obsidian");
function createOptionsMenuButton2(app, buttonContainer, options) {
  const optionsButton = buttonContainer.createEl("button", {
    text: "Options",
    cls: "npe-button npe-options-button"
  });
  optionsButton.addEventListener("click", (event) => {
    const menu = new import_obsidian20.Menu();
    options.forEach((option) => {
      menu.addItem((item) => {
        item.setTitle(option.label);
        item.onClick(option.callback);
      });
    });
    menu.showAtMouseEvent(event);
  });
}

// src/utils/fixDeprecatedKey.ts
var deprecatedToPlural2 = {
  tag: "tags",
  cssclass: "cssclasses",
  alias: "aliases"
  // Add more mappings as needed
};
function convertToArray2(value) {
  if (Array.isArray(value)) {
    return value.map((v) => typeof v === "string" ? v.trim() : v);
  } else if (typeof value === "string") {
    if (value.includes(",")) {
      return value.split(",").map((v) => v.trim()).filter((v) => v.length > 0);
    } else {
      return [value.trim()];
    }
  }
  return [];
}
async function fixAllDeprecatedKeysInVault2(app) {
  const files = app.vault.getMarkdownFiles();
  for (const file of files) {
    for (const [deprecatedKey, pluralKey] of Object.entries(deprecatedToPlural2)) {
      console.debug(`Fixing deprecated key in file ${file.path}: ${deprecatedKey} -> ${pluralKey}`);
      await fixDeprecatedKey2(app, file, deprecatedKey, pluralKey);
    }
  }
}
async function fixDeprecatedKey2(app, file, deprecatedKey, pluralKey) {
  var _a;
  const frontmatter = (_a = app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter;
  if (!frontmatter) return;
  const hasSingular = Object.prototype.hasOwnProperty.call(frontmatter, deprecatedKey);
  const hasPlural = Object.prototype.hasOwnProperty.call(frontmatter, pluralKey);
  let pluralValue = [];
  if (hasPlural) {
    pluralValue = convertToArray2(frontmatter[pluralKey]);
  }
  let singularValue = [];
  if (hasSingular) {
    singularValue = convertToArray2(frontmatter[deprecatedKey]);
  }
  const cleanTags = (values, isTagField) => {
    if (!isTagField) return values;
    return values.map((v) => typeof v === "string" && v.startsWith("#") ? v.slice(1) : v);
  };
  if (hasSingular && hasPlural) {
    const merged = Array.from(/* @__PURE__ */ new Set([...pluralValue, ...singularValue]));
    const cleaned = cleanTags(merged, deprecatedKey === "tag" || pluralKey === "tags");
    await updateProperties2(app, file, pluralKey, cleaned, "array");
    await updateProperties2(app, file, deprecatedKey, void 0, "undefined");
  } else if (hasSingular && !hasPlural) {
    const cleaned = cleanTags(singularValue, deprecatedKey === "tag");
    await changeKeyName2(app, file, deprecatedKey, pluralKey);
    await updateProperties2(app, file, pluralKey, cleaned, "array");
  } else if (hasPlural && !hasSingular) {
    const cleaned = cleanTags(pluralValue, pluralKey === "tags");
    await updateProperties2(app, file, pluralKey, cleaned, "array");
  }
}

// src/renderer/renderFrontMatter.ts
function renderFrontMatter2(view, subKey = "", excludeKeys = [], actionButtons = true, cssclasses = []) {
  var _a;
  const app = view.app;
  const container = view.contentEl.createDiv({ cls: "npe-view-container" });
  cssclasses.forEach((cls) => container.classList.add(cls));
  let buttonContainer = null;
  if (actionButtons) {
    buttonContainer = container.createDiv({ cls: "npe-button-container" });
  }
  const propertiesContainer = container.createDiv({ cls: "npe-properties-container" });
  if (view.currentFile && view.currentFile.extension === "md") {
    const frontMatter = (_a = app.metadataCache.getFileCache(view.currentFile)) == null ? void 0 : _a.frontmatter;
    let parentKey = "";
    let fm = frontMatter;
    if (frontMatter && typeof frontMatter === "object" && subKey !== "") {
      subKey.split(".").forEach((key) => fm = fm[key]);
      parentKey = subKey;
    }
    if (buttonContainer) {
      createAddPropertyButton2(view, buttonContainer, propertiesContainer);
      createToggleButton2(view, buttonContainer, propertiesContainer);
      createReloadButton2(view, buttonContainer, propertiesContainer, parentKey, excludeKeys);
      createFixDepricatedPropertiesButton2(view, buttonContainer, propertiesContainer, parentKey, excludeKeys);
      createOptionsMenuButton2(app, buttonContainer, [
        {
          label: "Fix all deprecated keys in vault",
          callback: async () => {
            await fixAllDeprecatedKeysInVault2(app);
            new import_obsidian21.Notice("All deprecated keys in vault have been fixed.");
          }
        }
      ]);
    }
    renderObject2(view, fm, propertiesContainer, excludeKeys, 0, parentKey);
  } else {
    const infoContainer = propertiesContainer.createDiv({ cls: "npe-info-container" });
    const infoIcon = infoContainer.createDiv({ cls: "npe-info-icon" });
    (0, import_obsidian21.setIcon)(infoIcon, "info");
    const infoMessage = infoContainer.createDiv({ cls: "npe-info-message" });
    infoMessage.textContent = `The current file is not a valid markdown file. Please open a markdown file to view and edit its frontmatter.`;
  }
  return container;
}

// src/ui/views/NestedPropertiesEditor.ts
var _NPEComponent = class _NPEComponent extends import_obsidian22.MarkdownRenderChild {
  constructor(containerEl, view) {
    super(containerEl);
    this.view = view;
    this.instanceId = ++_NPEComponent.instanceCount;
    const globalWindow = window;
    if (globalWindow.npeDebug) {
      globalWindow.npeDebug.trackComponent(this);
    }
    console.debug(`NPE: Component ${this.instanceId} created`);
  }
  onload() {
    console.debug(`NPE: Component ${this.instanceId} loading`);
    if (this.view.currentFile) {
      this.renderNPEContent();
    }
  }
  renderNPEContent() {
    const viewProxy = this.createViewProxy();
    renderFrontMatter2(viewProxy);
  }
  createViewProxy() {
    const proxy = Object.create(this.view);
    proxy.registerDomEvent = (el, type, fn) => {
      this.registerDomEvent(el, type, fn);
    };
    return proxy;
  }
  onunload() {
    console.debug(`NPE: Component ${this.instanceId} unloading, cleaning up event handlers`);
    const globalWindow = window;
    if (globalWindow.npeDebug) {
      globalWindow.npeDebug.untrackComponent(this);
    }
  }
};
_NPEComponent.instanceCount = 0;
var NPEComponent = _NPEComponent;
var NestedPropertiesEditorView = class extends import_obsidian22.ItemView {
  constructor(leaf) {
    super(leaf);
    this.currentFile = null;
    this.activeLeafChangeRef = null;
    this.metadataChangeRef = null;
    this.isUpdating = false;
    this.currentNPEComponent = null;
  }
  async onOpen() {
    (0, import_obsidian22.addIcon)("npe-icon", `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon list-tree-pen"><path d="M21.332 9.257h-8m8-6h-13m-5 0v4c0 1.1.9 2 2 2h3m-5-1.481v6c0 1.1.9 2 2 2h3"/><path d="M3.332 14.257v6c0 1.1.9 2 2 2h3m12.378-5.954c.398-.398.622-.939.622-1.502 0-1.165-.959-2.124-2.124-2.124-.563 0-1.104.224-1.502.622l-5.01 5.012c-.238.238-.412.531-.506.854l-.837 2.87a.51.51 0 0 0-.02.14c0 .274.226.5.5.5a.51.51 0 0 0 .14-.02l2.87-.837c.323-.094.616-.268.854-.506l5.013-5.009z"/></svg>`);
    this.updateView();
    this.activeLeafChangeRef = () => {
      if (this.isUpdating) {
        console.debug("NPE: Skipping update - already updating");
        return;
      }
      const activeFile = this.app.workspace.getActiveFile();
      if (this.currentFile && !this.app.vault.getAbstractFileByPath(this.currentFile.path)) {
        console.debug("NPE: Current file was deleted, clearing view");
        this.currentFile = null;
        this.clearView();
      }
      if (activeFile !== this.currentFile) {
        console.debug("NPE: Active file changed, updating view");
        this.updateView();
        this.currentFile = activeFile;
      }
    };
    this.metadataChangeRef = (file) => {
      if (this.currentFile && file.path === this.currentFile.path && this.app.vault.getAbstractFileByPath(this.currentFile.path)) {
        console.debug("NPE: Metadata changed for current file, updating view");
        this.updateView();
      }
    };
    this.registerEvent(this.app.workspace.on("active-leaf-change", this.activeLeafChangeRef));
    this.registerEvent(this.app.metadataCache.on("changed", this.metadataChangeRef));
  }
  async onClose() {
    this.cleanupCurrentComponent();
    this.currentFile = null;
    console.debug("NPE: View closed, cleanup complete");
  }
  /* function to clear the view when no valid file is available */
  clearView() {
    this.cleanupCurrentComponent();
    this.contentEl.empty();
    const infoContainer = this.contentEl.createDiv({ cls: "npe-info-container" });
    const infoMessage = infoContainer.createDiv({ cls: "npe-info-message" });
    infoMessage.textContent = "No file selected or file was deleted.";
    this.currentFile = null;
  }
  /* Helper method to properly cleanup the current NPE component */
  cleanupCurrentComponent() {
    if (this.currentNPEComponent) {
      console.debug("NPE: Cleaning up current component");
      const containerEl = this.currentNPEComponent.containerEl;
      if (containerEl) {
        containerEl.innerHTML = "";
        containerEl._npeComponent = null;
      }
      this.currentNPEComponent.unload();
      this.currentNPEComponent = null;
      const globalWindow = window;
      if (typeof globalWindow.gc === "function") {
        console.debug("NPE: Triggering garbage collection");
        globalWindow.gc();
      }
    }
  }
  /* function to update the view with when the front matter changes */
  updateView() {
    if (this.isUpdating) {
      console.debug("NPE: Update already in progress, skipping");
      return;
    }
    this.isUpdating = true;
    try {
      const activeFile = this.app.workspace.getActiveFile();
      console.debug("NPE: Updating view for file:", (activeFile == null ? void 0 : activeFile.path) || "none");
      if (activeFile && !this.app.vault.getAbstractFileByPath(activeFile.path)) {
        console.debug("NPE: Active file was deleted, clearing view");
        this.clearView();
        return;
      }
      if (activeFile) {
        this.currentFile = activeFile;
        this.cleanupCurrentComponent();
        this.contentEl.empty();
        this.currentNPEComponent = new NPEComponent(this.contentEl, this);
        this.addChild(this.currentNPEComponent);
        this.component = this.contentEl;
      } else {
        console.debug("NPE: No active file, clearing view");
        this.clearView();
      }
    } catch (error) {
      console.error("NPE updateView error:", error);
      this.clearView();
    } finally {
      this.isUpdating = false;
    }
  }
  /* View abstract method implementations */
  getViewType() {
    return "NPE_VIEW";
  }
  getDisplayText() {
    return "Nested Properties Editor View";
  }
  getIcon() {
    return "npe-icon";
  }
};
NestedPropertiesEditorView.viewType = "NPE_VIEW";
var NestedPropertiesEditorCodeBlockView = class extends import_obsidian22.MarkdownRenderChild {
  constructor(app, containerEl, ctx, currentFile, key, excludeKeys = [], actionButtons = true, cssclasses = []) {
    super(containerEl);
    this.app = app;
    this.contentEl = containerEl;
    this.currentFile = currentFile;
    this.key = key;
    this.excludeKeys = excludeKeys;
    this.actionButtons = actionButtons;
    this.cssclasses = cssclasses;
    ctx.addChild(this);
  }
  onload() {
    this.render();
  }
  render() {
    var _a;
    this.containerEl.empty();
    console.log("Rendering NestedPropertiesEditorCodeBlockView with:");
    renderFrontMatter2(this, (_a = this.key) != null ? _a : "", this.excludeKeys, this.actionButtons, this.cssclasses);
  }
};

// src/ui/views/CircularProgress.ts
var import_obsidian23 = require("obsidian");

// src/utils/parsers/parseCircularProgressOptions.ts
function parseCircularProgressOptions(source) {
  const opts = {};
  source.split("\n").forEach((line) => {
    const [key, ...rest] = line.split(":");
    if (!key || rest.length === 0) return;
    const value = rest.join(":").trim();
    if (key.trim() === "value") opts.value = Number(value);
    else if (key.trim() === "color") opts.color = value;
    else if (key.trim() === "label") opts.label = value;
    else if (key.trim() === "taskLabel") opts.taskLabel = value;
  });
  return opts;
}

// src/ui/renderer/components/renderCircularProgress.ts
function renderCircularProgress(component, opts = {}) {
  var _a, _b, _c;
  const container = component.containerEl.createDiv("progress-container");
  container.setAttr("id", "cp-container");
  const progress = (_a = opts.value) != null ? _a : getTaskProgress(component);
  const cp_container = container.createDiv("circularprogress");
  const card = cp_container.createDiv("card");
  const percent = card.createDiv("percent");
  percent.style.setProperty("--clr", (_b = opts.color) != null ? _b : "#8bdaa9");
  percent.style.setProperty("--num", "0");
  percent.createDiv("dot");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "150");
  svg.setAttribute("height", "150");
  percent.appendChild(svg);
  const circle1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle1.setAttribute("cx", "70");
  circle1.setAttribute("cy", "70");
  circle1.setAttribute("r", "70");
  svg.appendChild(circle1);
  const circle2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle2.setAttribute("cx", "70");
  circle2.setAttribute("cy", "70");
  circle2.setAttribute("r", "70");
  svg.appendChild(circle2);
  const number = percent.createDiv("number");
  const h2 = number.createEl("h2");
  h2.innerHTML = `0<span>%</span>`;
  const p = number.createEl("p");
  p.innerText = (_c = opts.taskLabel) != null ? _c : "tasks";
  setTimeout(() => {
    percent.style.setProperty("--num", progress.toString());
    h2.innerHTML = `${progress}<span>%</span>`;
  }, 100);
  return { percent, h2 };
}
function updateCircularProgressValue(component, opts, percentEl, h2El) {
  var _a;
  if (!percentEl || !h2El) return;
  const progress = (_a = opts.value) != null ? _a : getTaskProgress(component);
  percentEl.style.setProperty("--num", progress.toString());
  h2El.innerHTML = `${progress}<span>%</span>`;
}
function getTaskProgress(component) {
  var _a;
  const file = component.app.workspace.getActiveFile();
  if (!file) return 0;
  const listItems = ((_a = component.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.listItems) || [];
  const tasks = listItems.filter((item) => item.task);
  if (tasks.length === 0) return 0;
  const completedTasks = tasks.filter((item) => item.task === "x");
  return Math.round(completedTasks.length / tasks.length * 100);
}

// src/ui/views/CircularProgress.ts
var CircularProgress = class extends import_obsidian23.MarkdownRenderChild {
  constructor(app, containerEl, source = "") {
    super(containerEl);
    this.percentEl = null;
    this.h2El = null;
    this.app = app;
    this.opts = parseCircularProgressOptions(source);
  }
  onload() {
    const { percent, h2 } = renderCircularProgress(this, this.opts);
    this.percentEl = percent;
    this.h2El = h2;
    this.registerEvent(
      this.app.metadataCache.on("changed", (file) => {
        var _a;
        if (file.path === ((_a = this.app.workspace.getActiveFile()) == null ? void 0 : _a.path)) {
          updateCircularProgressValue(this, this.opts, this.percentEl, this.h2El);
        }
      })
    );
  }
};

// src/ui/views/ImageViewer.ts
var import_obsidian25 = require("obsidian");

// src/utils/parsers/parseImageViewerOptions.ts
function parseImageViewerOptions(source) {
  const opts = { folder: "assets/images/Motivation/" };
  source.split("\n").forEach((line) => {
    const [key, ...rest] = line.split(":");
    if (!key || rest.length === 0) return;
    const value = rest.join(":").trim();
    if (key.trim() === "folder") opts.folder = value;
    else if (key.trim() === "bgColor") opts.bgColor = value;
    else if (key.trim() === "size") opts.size = Number(value);
    else if (key.trim() === "image") opts.image = value;
    else if (key.trim() === "shuffle") {
      opts.shuffle = value.toLowerCase();
    } else if (key.trim() === "shuffleOrder") {
      opts.shuffleOrder = value.toLowerCase();
    } else if (key.trim() === "interval") {
      opts.interval = Number(value);
    } else if (key.trim() === "thumbnails") {
      opts.thumbnails = value.toLowerCase() === "true";
    } else if (key.trim() === "invertGray") {
      opts.invertGray = value.toLowerCase() === "true";
    }
  });
  return opts;
}

// src/ui/renderer/components/renderImageViewer.ts
var import_obsidian24 = require("obsidian");
async function renderImageViewer(app, container, opts) {
  opts.folder = opts.folder.replace(/^\/|\/$/g, "");
  const folder = app.vault.getFolderByPath(opts.folder);
  if (!folder || !("children" in folder)) {
    container.createEl("div", { text: `Folder not found: ${opts.folder}` });
    return;
  }
  let images = folder.children.filter(
    (f) => f instanceof import_obsidian24.TFile && (f.extension === "jpg" || f.extension === "png" || f.extension === "jpeg" || f.extension === "gif")
  );
  if (images.length === 0) {
    container.createEl("div", { text: `No images found in: ${opts.folder}` });
    return;
  }
  if (opts.shuffleOrder === "alphabetic") {
    images = images.sort((a, b) => a.name.localeCompare(b.name));
  }
  let currentIdx = 0;
  if (opts.image) {
    const foundIdx = images.findIndex((img) => img.name === opts.image);
    if (foundIdx !== -1) currentIdx = foundIdx;
  } else {
    currentIdx = Math.floor(Math.random() * images.length);
  }
  const parentContainer = container.createDiv({ cls: "image-viewer-parent" });
  if (opts.bgColor) parentContainer.style.backgroundColor = opts.bgColor;
  if (opts.shuffle === "manual" && images.length > 1) {
    const shuffleControls = parentContainer.createDiv("image-viewer-action-buttons");
    const prevBtn = shuffleControls.createEl("button", { cls: "clickable-icon" });
    (0, import_obsidian24.setIcon)(prevBtn, "chevron-left");
    prevBtn.setAttribute("aria-label", "Previous Image");
    const nextBtn = shuffleControls.createEl("button", { cls: "clickable-icon" });
    (0, import_obsidian24.setIcon)(nextBtn, "chevron-right");
    nextBtn.setAttribute("aria-label", "Next Image");
    prevBtn.onclick = () => {
      if (opts.shuffleOrder === "random") {
        let prevIdx;
        do {
          prevIdx = Math.floor(Math.random() * images.length);
        } while (prevIdx === currentIdx && images.length > 1);
        currentIdx = prevIdx;
      } else {
        currentIdx = (currentIdx - 1 + images.length) % images.length;
      }
      showImage(currentIdx);
      if (opts.thumbnails) updateThumbnails();
    };
    nextBtn.onclick = () => {
      if (opts.shuffleOrder === "random") {
        let nextIdx;
        do {
          nextIdx = Math.floor(Math.random() * images.length);
        } while (nextIdx === currentIdx && images.length > 1);
        currentIdx = nextIdx;
      } else {
        currentIdx = (currentIdx + 1) % images.length;
      }
      showImage(currentIdx);
      if (opts.thumbnails) updateThumbnails();
    };
  }
  const imgContainer = parentContainer.createDiv({ cls: "image-viewer-container" });
  const showImage = (idx) => {
    let img = imgContainer.querySelector("img.image-viewer");
    const image = images[idx];
    const imgSrc = app.vault.getResourcePath(image);
    const applyInvert = (imgEl) => {
      if (opts.invertGray) {
        imgEl.style.filter = "invert(1) hue-rotate(180deg)";
      } else {
        imgEl.style.filter = "";
      }
    };
    if (img) {
      img.classList.add("fade-out");
      setTimeout(() => {
        img.src = imgSrc;
        img.classList.remove("fade-out");
        applyInvert(img);
      }, 700);
    } else {
      img = imgContainer.createEl("img", {
        cls: "image-viewer",
        attr: { src: imgSrc }
      });
      if (opts.size) {
        img.style.width = `${opts.size}px`;
        img.style.height = "auto";
      }
      applyInvert(img);
    }
    if (img && opts.size) {
      img.style.width = `${opts.size}px`;
      img.style.height = "auto";
    }
  };
  showImage(currentIdx);
  let timer;
  if (opts.shuffle === "auto" && opts.interval && images.length > 1) {
    const nextImage = () => {
      if (opts.shuffleOrder === "random") {
        let nextIdx;
        do {
          nextIdx = Math.floor(Math.random() * images.length);
        } while (nextIdx === currentIdx && images.length > 1);
        currentIdx = nextIdx;
      } else {
        currentIdx = (currentIdx + 1) % images.length;
      }
      showImage(currentIdx);
      if (opts.thumbnails) updateThumbnails();
    };
    timer = window.setInterval(nextImage, opts.interval * 1e3);
    new MutationObserver((mutations, obs) => {
      if (!document.body.contains(container)) {
        if (timer) window.clearInterval(timer);
        obs.disconnect();
      }
    }).observe(document.body, { childList: true, subtree: true });
  }
  let updateThumbnails = () => {
  };
  if (opts.thumbnails) {
    let thumbStart = 0;
    const maxThumbs = 5;
    const thumbContainer = parentContainer.createDiv("image-viewer-thumbnails");
    updateThumbnails = () => {
      thumbContainer.empty();
      const end = Math.min(thumbStart + maxThumbs, images.length);
      for (let i = thumbStart; i < end; i++) {
        const thumb = thumbContainer.createEl("img", {
          cls: "image-viewer-thumb" + (i === currentIdx ? " active" : ""),
          attr: { src: app.vault.getResourcePath(images[i]) }
        });
        thumb.onclick = () => {
          currentIdx = i;
          showImage(currentIdx);
          updateThumbnails();
        };
      }
      if (thumbStart > 0) {
        const left = thumbContainer.createEl("button");
        (0, import_obsidian24.setIcon)(left, "chevron-left");
        left.onclick = () => {
          thumbStart = Math.max(0, thumbStart - 1);
          updateThumbnails();
        };
        thumbContainer.prepend(left);
      }
      if (end < images.length) {
        const right = thumbContainer.createEl("button");
        (0, import_obsidian24.setIcon)(right, "chevron-right");
        right.onclick = () => {
          thumbStart = Math.min(images.length - maxThumbs, thumbStart + 1);
          updateThumbnails();
        };
        thumbContainer.append(right);
      }
    };
    updateThumbnails();
  }
}

// src/ui/views/ImageViewer.ts
var ImageViewer = class extends import_obsidian25.MarkdownRenderChild {
  constructor(app, containerEl, source) {
    super(containerEl);
    this.app = app;
    this.opts = parseImageViewerOptions(source);
  }
  async onload() {
    await renderImageViewer(this.app, this.containerEl, this.opts);
  }
};

// src/events/activeLeafChange.ts
var import_obsidian39 = require("obsidian");

// src/ui/components/navbar.ts
var import_obsidian38 = require("obsidian");

// src/core/notes/NewNote.ts
var import_obsidian37 = require("obsidian");

// src/core/templates/TemplateEvaluator.ts
var TemplateEvaluator = class _TemplateEvaluator {
  constructor(plugin) {
    this.plugin = plugin;
  }
  /**
   * Checks if a string represents an inline function.
   * @param field The string to check.
   * @returns True if the string is an inline function, false otherwise.
   */
  isInlineFunction(field) {
    const inlineFunctionPattern = /^(\(?\w+\)?\s*=>|function\s*\(|this\.\w+\(|return\s|[a-zA-Z_$][a-zA-Z0-9_$]*\s*\()/;
    if (field.includes(" ") && !field.includes("=>") && !field.includes("function") && !field.includes("this.")) {
      return false;
    }
    return inlineFunctionPattern.test(field.trim());
  }
  /**
   * Evaluates a dynamic field (legacy string-based function)
   * @param field The string field to evaluate
   * @returns The evaluated result
   */
  evaluateDynamicField(field) {
    console.warn(`Legacy string-based function evaluation is deprecated. Please use function descriptors instead. Field: ${field}`);
    const functionDescriptor = {
      type: "function",
      value: field
    };
    return _TemplateEvaluator.evaluateFunctionDescriptor(functionDescriptor, this.plugin);
  }
  /**
   * Evaluates a function descriptor with user input context.
   * @param descriptor The function descriptor to evaluate
   * @param userData The current user data
   * @returns The evaluated result
   */
  evaluateUserInputFunction(descriptor, userData) {
    if (descriptor.type !== "function") {
      throw new Error("Invalid function descriptor type");
    }
    try {
      const context = {
        ...this.plugin,
        ...userData
        // This preserves the nested structure of userData
      };
      return _TemplateEvaluator.evaluateFunctionDescriptor(descriptor, context);
    } catch (error) {
      console.error("Error evaluating user input function:", error);
      throw error;
    }
  }
  /**
   * Processes dynamic fields (e.g., `callback`, `default`, `options`) in the metadata template.
   * @param template The metadata template to process.
   */
  processDynamicFields(template) {
    for (const key in template) {
      const field = template[key];
      if (field && typeof field === "object") {
        if ("inputType" in field) {
          const templateField = field;
          if (_TemplateEvaluator.isFunctionDescriptor(templateField.callback)) {
            console.log(`Processing callback function descriptor for key "${key}":`, templateField.callback);
            templateField.callback = _TemplateEvaluator.evaluateFunctionDescriptor(templateField.callback, this.plugin);
            if (typeof templateField.callback !== "function") {
              console.warn(`Callback for key "${key}" did not evaluate to a valid function.`, templateField.callback);
            }
          } else if (typeof templateField.callback === "string" && this.isInlineFunction(templateField.callback)) {
            console.log(`Processing legacy callback string for key "${key}":`, templateField.callback);
            templateField.callback = this.evaluateDynamicField(templateField.callback);
            if (typeof templateField.callback !== "function") {
              console.warn(`Callback for key "${key}" is not a valid function.`, templateField.callback);
            }
          }
          if (_TemplateEvaluator.isFunctionDescriptor(templateField.action)) {
            console.log(`Processing action function descriptor for key "${key}":`, templateField.action);
            templateField.action = _TemplateEvaluator.evaluateFunctionDescriptor(templateField.action, this.plugin);
            if (typeof templateField.action !== "function") {
              console.warn(`Action for key "${key}" did not evaluate to a valid function.`, templateField.action);
            }
          } else if (typeof templateField.action === "string" && this.isInlineFunction(templateField.action)) {
            console.log(`Processing legacy action string for key "${key}":`, templateField.action);
            templateField.action = this.evaluateDynamicField(templateField.action);
            if (typeof templateField.action !== "function") {
              console.warn(`Action for key "${key}" is not a valid function.`, templateField.action);
            }
          }
          if (_TemplateEvaluator.isFunctionDescriptor(templateField.default)) {
            if (!templateField.default.userInputs || templateField.default.userInputs.length === 0) {
              templateField.default = _TemplateEvaluator.evaluateFunctionDescriptor(templateField.default, this.plugin);
            }
          } else if (typeof templateField.default === "string" && this.isInlineFunction(templateField.default)) {
            templateField.default = this.evaluateDynamicField(templateField.default);
          }
          if (_TemplateEvaluator.isFunctionDescriptor(templateField.options)) {
            if (!templateField.options.userInputs || templateField.options.userInputs.length === 0) {
              templateField.options = _TemplateEvaluator.evaluateFunctionDescriptor(templateField.options, this.plugin);
            }
          } else if (typeof templateField.options === "string" && this.isInlineFunction(templateField.options)) {
            templateField.options = this.evaluateDynamicField(templateField.options);
          }
        } else {
          this.processDynamicFields(field);
        }
      }
    }
  }
  /**
   * Checks if a field has any function descriptors that depend on the changed field.
   * @param field The field to check
   * @param changedFieldPath The path of the field that was changed
   * @returns True if the field depends on the changed field
   */
  checkFieldForUserInputDependencies(field, changedFieldPath) {
    const descriptorFields = ["default", "options", "callback", "action"];
    for (const descriptorField of descriptorFields) {
      const value = field[descriptorField];
      if (_TemplateEvaluator.isFunctionDescriptor(value)) {
        if (value.userInputs && value.userInputs.includes(changedFieldPath)) {
          return true;
        }
      }
    }
    return false;
  }
  /**
   * Evaluates a field's default value with the given context
   * @param field The field to evaluate
   * @param userData The user data context
   * @returns The evaluated default value
   */
  evaluateFieldDefault(field, userData) {
    if (_TemplateEvaluator.isFunctionDescriptor(field.default)) {
      if (field.default.userInputs && field.default.userInputs.length > 0) {
        return this.evaluateUserInputFunction(field.default, userData);
      } else {
        const func = _TemplateEvaluator.evaluateFunctionDescriptor(field.default, this.plugin);
        return typeof func === "function" ? func(userData) : func;
      }
    } else if (typeof field.default === "function") {
      return field.default(userData);
    } else {
      return field.default;
    }
  }
  /**
   * Helper function to check if a value is a function descriptor
   */
  static isFunctionDescriptor(value) {
    return typeof value === "object" && value !== null && "type" in value && "value" in value && value.type === "function" && typeof value.value === "string";
  }
  /**
   * Helper function to evaluate a function descriptor safely
   */
  static evaluateFunctionDescriptor(descriptor, context) {
    try {
      const functionCode = descriptor.value;
      if (functionCode.startsWith("this.") && context) {
        const expression = functionCode.replace(/this\./g, "context.");
        return new Function("context", "return " + expression)(context);
      } else if (functionCode.startsWith("new ")) {
        if (context) {
          const contextKeys = Object.keys(context);
          const contextValues = Object.values(context);
          return new Function(...contextKeys, "return " + functionCode)(...contextValues);
        } else {
          return new Function("return " + functionCode)();
        }
      } else {
        if (context) {
          const contextKeys = Object.keys(context);
          const contextValues = Object.values(context);
          return new Function(...contextKeys, "return " + functionCode)(...contextValues);
        } else {
          return new Function("return " + functionCode)();
        }
      }
    } catch (error) {
      console.error("Error evaluating function descriptor:", error);
      return null;
    }
  }
};

// src/core/notes/MetadataProcessor.ts
var MetadataProcessor = class {
  constructor(plugin) {
    this.plugin = plugin;
    this.evaluator = new TemplateEvaluator(plugin);
  }
  /**
   * Loads and processes a metadata template for a given note type
   * @param noteType The type of note (e.g., "chemical", "device", etc.)
   * @returns The processed metadata template
   */
  loadMetadataTemplate(noteType) {
    let template;
    if (noteType && noteType in this.plugin.settings.note) {
      const noteSettings = this.plugin.settings.note[noteType];
      template = noteSettings.metadataTemplate;
    } else {
      template = this.plugin.settings.note.default.metadataTemplate;
    }
    if (!template) {
      throw new Error("Failed to load metadata template.");
    }
    const processed = JSON.parse(JSON.stringify(template));
    this.evaluator.processDynamicFields(processed);
    return processed;
  }
  /**
   * Preprocesses a metadata template (handles author settings, but NOT subclass selection)
   * @param template The template to preprocess
   * @param noteType The type of note
   * @returns The preprocessed template WITHOUT subclass modifications
   */
  preprocessTemplate(template, noteType) {
    if (this.plugin.settings.footer.includeAuthor) {
      const authorList = this.plugin.settings.general.authors.map((author) => author.name);
      if (authorList.length > 1) {
        template.author.query = true;
        template.author.inputType = "dropdown";
        template.author.default = authorList[0];
        template.author.options = authorList;
      } else {
        template.author.default = authorList[0];
      }
    }
    return template;
  }
  /**
   * Finds a field with inputType "subclass" in the template
   * @param template The template to search
   * @returns The subclass field if found
   */
  findSubclassInputField(template) {
    for (const value of Object.values(template)) {
      if (value && typeof value === "object") {
        if ("inputType" in value && value.inputType === "subclass") {
          return value;
        }
        if (!("inputType" in value)) {
          const nested = this.findSubclassInputField(value);
          if (nested) return nested;
        }
      }
    }
    return void 0;
  }
  /**
   * Applies a subclass template to a base template for a specific note type and subclass name
   * @param baseTemplate The base template (will not be modified)
   * @param noteType The note type
   * @param subclassName The name of the subclass to apply
   * @returns The template with applied subclass modifications, or the base template if no subclass found
   */
  applySubclassTemplateByName(baseTemplate, noteType, subclassName) {
    console.debug(`MetadataProcessor: Applying subclass template for ${noteType}:${subclassName}`);
    if (noteType in this.plugin.settings.note) {
      const noteSettings = this.plugin.settings.note[noteType];
      if ("type" in noteSettings) {
        const typeArray = noteSettings.type;
        const typeObj = Array.isArray(typeArray) ? typeArray.find((type) => type.name === subclassName) : void 0;
        const subclassTemplate = typeObj == null ? void 0 : typeObj.subClassMetadataTemplate;
        if (subclassTemplate) {
          console.debug(`MetadataProcessor: Found subclass template for ${subclassName}:`, subclassTemplate);
          return this.applySubclassTemplate(baseTemplate, subclassTemplate);
        } else {
          console.debug(`MetadataProcessor: No subclass template found for ${subclassName}`);
        }
      }
    }
    return JSON.parse(JSON.stringify(baseTemplate));
  }
  /**
   * Gets the default subclass name for a note type
   * @param baseTemplate The base template
   * @param noteType The note type
   * @returns The default subclass name or null if not found
   */
  getDefaultSubclassName(baseTemplate, noteType) {
    const subclassInput = this.findSubclassInputField(baseTemplate);
    if (subclassInput) {
      let options = [];
      if (Array.isArray(subclassInput.options)) {
        options = subclassInput.options;
      } else if (typeof subclassInput.options === "function") {
        const evaluatedOptions = subclassInput.options({});
        options = Array.isArray(evaluatedOptions) ? evaluatedOptions : [];
      }
      const defaultSubclass = subclassInput.default || options[0] || null;
      console.debug(`MetadataProcessor: Default subclass for ${noteType}:`, defaultSubclass);
      return defaultSubclass;
    }
    return null;
  }
  /**
   * Applies the default subclass template based on the default value
   * @param template The base template
   * @param noteType The note type
   * @param subclassInput The subclass input field
   * @returns The template with applied subclass modifications
   */
  /**
   * Applies a subclass template to modify the base template
   * @param baseTemplate The base template
   * @param subclassTemplate The subclass modifications
   * @returns The modified template
   */
  applySubclassTemplate(baseTemplate, subclassTemplate) {
    console.debug("applySubclassTemplate: Subclass Template", subclassTemplate);
    const newTemplate = JSON.parse(JSON.stringify(baseTemplate));
    if (Array.isArray(subclassTemplate.remove)) {
      for (const fullKey of subclassTemplate.remove) {
        const keys = fullKey.split(".");
        let obj = newTemplate;
        for (let i = 0; i < keys.length - 1; i++) {
          const next = obj[keys[i]];
          if (!next || typeof next !== "object" || "query" in next) break;
          obj = next;
        }
        delete obj[keys[keys.length - 1]];
      }
    }
    if (subclassTemplate.replace && Array.isArray(subclassTemplate.replace)) {
      for (const { fullKey, newKey, input } of subclassTemplate.replace) {
        const keys = fullKey.split(".");
        let obj = newTemplate;
        for (let i = 0; i < keys.length - 1; i++) {
          const next = obj[keys[i]];
          if (!next || typeof next !== "object" || "query" in next) break;
          obj = next;
        }
        delete obj[keys[keys.length - 1]];
        if (newKey) {
          obj[newKey] = input;
        }
      }
    }
    if (Array.isArray(subclassTemplate.add)) {
      for (const { fullKey, input } of subclassTemplate.add) {
        const keys = fullKey.split(".");
        let obj = newTemplate;
        for (let i = 0; i < keys.length - 1; i++) {
          const current = obj[keys[i]];
          if (!current || typeof current !== "object" || "query" in current) {
            obj[keys[i]] = {};
          }
          obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = input;
      }
    }
    this.evaluator.processDynamicFields(newTemplate);
    console.debug("applySubclassTemplate: New Template", newTemplate);
    return newTemplate;
  }
  /**
   * Processes metadata by resolving all default values and user inputs
   * @param template The metadata template
   * @param userInput The user input data
   * @param parentKey The parent key for nested processing
   * @returns The processed metadata ready for note creation
   */
  async processMetadata(template, userInput, parentKey = "") {
    const result = {};
    for (const [key, config] of Object.entries(template)) {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;
      if (config !== null && typeof config === "object" && !("inputType" in config) && !("query" in config) && !("default" in config) && !("callback" in config)) {
        const nestedInput = userInput[key];
        const nestedFormData = nestedInput && typeof nestedInput === "object" && !Array.isArray(nestedInput) ? nestedInput : {};
        result[key] = await this.processMetadata(config, nestedFormData, fullKey);
      } else {
        const field = config;
        const inputValue = userInput[key];
        const defaultValue = this.evaluator.evaluateFieldDefault(field, userInput);
        if (field.inputType === "number" && field.units) {
          const unit = field.defaultUnit || (Array.isArray(field.units) ? field.units[0] : field.units);
          if (inputValue && typeof inputValue === "object" && "value" in inputValue && "unit" in inputValue) {
            result[key] = inputValue;
          } else if (inputValue !== void 0) {
            result[key] = { value: inputValue, unit };
          } else if (defaultValue !== void 0) {
            result[key] = { value: defaultValue, unit };
          } else {
            result[key] = { value: null, unit };
          }
        } else {
          result[key] = inputValue !== void 0 ? inputValue : defaultValue;
        }
      }
    }
    return result;
  }
  /**
   * Checks if the template requires user input
   * @param template The template to check
   * @returns True if user input is required
   */
  requiresUserInput(template) {
    for (const config of Object.values(template)) {
      if (config && typeof config === "object") {
        if ("inputType" in config && "query" in config && config.query === true) {
          return true;
        }
        if (!("inputType" in config) && this.requiresUserInput(config)) {
          return true;
        }
      }
    }
    return false;
  }
  /**
   * Updates fields that depend on user input when their dependencies change.
   * @param template The template to update
   * @param changedFieldPath The path of the field that was changed
   * @param userData The current user data
   * @param currentPath The current path in template traversal
   * @returns Array of field paths that were updated
   */
  updateDependentFields(template, changedFieldPath, userData, currentPath = "") {
    const updatedFields = [];
    for (const [key, config] of Object.entries(template)) {
      const fieldPath = currentPath ? `${currentPath}.${key}` : key;
      if (config !== null && typeof config === "object" && !("inputType" in config)) {
        const nestedUpdates = this.updateDependentFields(
          config,
          changedFieldPath,
          userData,
          fieldPath
        );
        updatedFields.push(...nestedUpdates);
      } else if (config && typeof config === "object" && "inputType" in config) {
        const field = config;
        if (this.evaluator.checkFieldForUserInputDependencies(field, changedFieldPath)) {
          updatedFields.push(fieldPath);
        }
      }
    }
    return updatedFields;
  }
  /**
   * Gets the TemplateEvaluator instance
   */
  getEvaluator() {
    return this.evaluator;
  }
};

// src/core/notes/PathTemplateParser.ts
var import_obsidian26 = require("obsidian");
var logger3 = createLogger("path");
async function parsePathTemplate(app, type, template, context) {
  const dateLocalizationDict = {
    "en": "en-US",
    "fr": "fr-FR",
    "de": "de-DE",
    "es": "es-ES",
    "it": "it-IT",
    "pt": "pt-PT",
    "ru": "ru-RU",
    "zh": "zh-CN",
    "ja": "ja-JP",
    "ko": "ko-KR",
    "ar": "ar-SA",
    "tr": "tr-TR",
    "pl": "pl-PL",
    "nl": "nl-NL",
    "sv": "sv-SE",
    "da": "da-DK",
    "fi": "fi-FI",
    "no": "no-NO",
    "cs": "cs-CZ",
    "hu": "hu-HU",
    "ro": "ro-RO"
  };
  const lang = (0, import_obsidian26.getLanguage)();
  logger3.debug("Language detected:", lang);
  let dateLocalization = "en-US";
  if (lang in dateLocalizationDict) {
    dateLocalization = dateLocalizationDict[lang];
  }
  logger3.debug("Date localization set to:", dateLocalization);
  if (!template || !Array.isArray(template)) {
    console.warn("Invalid template provided:", template);
    return "";
  }
  let lookupFields = {
    currentDate: (/* @__PURE__ */ new Date()).toLocaleDateString(dateLocalization),
    weekday: (/* @__PURE__ */ new Date()).toLocaleString(dateLocalization, { weekday: "long" }),
    dayOfMonth: (/* @__PURE__ */ new Date()).getDate(),
    month: (/* @__PURE__ */ new Date()).toLocaleString(dateLocalization, { month: "2-digit" }),
    monthName: (/* @__PURE__ */ new Date()).toLocaleString(dateLocalization, { month: "long" }),
    year: (/* @__PURE__ */ new Date()).getFullYear()
  };
  logger3.debug("Default lookup fields:", lookupFields);
  if (context) {
    lookupFields = { ...lookupFields, ...context };
    logger3.debug("Merged lookup fields with context:", lookupFields);
  }
  let path = template.map(({ type: type2, field, separator }) => {
    var _a;
    logger3.debug(`Processing template element:`, { type: type2, field, separator });
    let value;
    switch (type2) {
      case "dateField":
        value = (_a = lookupFields[field]) == null ? void 0 : _a.toString();
        break;
      case "userInput":
        value = getFieldValue(field, lookupFields);
        break;
      case "string":
        value = field;
        break;
      case "index":
        value = field;
        break;
      default:
        console.warn(`Unknown template element type: "${type2}"`);
        value = void 0;
    }
    logger3.debug(`Resolved value for field "${field}":`, value);
    return value !== void 0 ? `${value}${separator || ""}` : "";
  }).join("").trim();
  if (template.some((element) => element.type === "index")) {
    path = await handleIndexField(app, path, type);
  }
  return path;
}
async function handleIndexField(app, path, type) {
  var _a;
  const parentFolder = path.substring(0, path.lastIndexOf("/"));
  const baseName = path.substring(path.lastIndexOf("/") + 1);
  const match = baseName.match(/(.*?)(\d+)?$/);
  if (!match) {
    console.warn("Failed to parse base name for index handling:", baseName);
    return path;
  }
  const base = match[1];
  const minDigits = ((_a = match[2]) == null ? void 0 : _a.length) || 2;
  let index = 1;
  const parentFolderObj = app.vault.getAbstractFileByPath(parentFolder);
  if (!parentFolderObj || !(parentFolderObj instanceof import_obsidian26.TFolder)) {
    console.warn("Parent folder does not exist:", parentFolder);
    return path;
  }
  const existingNames = new Set(
    parentFolderObj.children.map(
      (child) => type === "file" ? child.name.replace(/\.[^/.]+$/, "") : child.name
    )
  );
  let uniquePath = path;
  while (existingNames.has(uniquePath.substring(uniquePath.lastIndexOf("/") + 1))) {
    const paddedIndex = index.toString().padStart(minDigits, "0");
    uniquePath = `${parentFolder}/${base}${paddedIndex}`;
    index++;
  }
  return uniquePath;
}
function getFieldValue(field, context) {
  const keys = field.split(".");
  let current = context;
  for (const key of keys) {
    if (current && typeof current === "object" && current !== null && key in current) {
      current = current[key];
    } else {
      console.warn(`Field "${field}" not found in context.`);
      return void 0;
    }
  }
  return current == null ? void 0 : current.toString();
}

// src/data/templates/processMarkdownTemplate.ts
var import_moment = __toESM(require_moment());
function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, part) => acc && acc[part] !== void 0 ? acc[part] : void 0, obj);
}
function parseOffset(offset) {
  const match = offset.trim().match(/^([+-]?\d+)\s*([yMwdhms])$/);
  if (!match) return null;
  const [, amount, unit] = match;
  const unitMap = {
    y: "years",
    M: "months",
    w: "weeks",
    d: "days",
    h: "hours",
    m: "minutes",
    s: "seconds"
  };
  return { amount: parseInt(amount, 10), unit: unitMap[unit] };
}
function processMarkdownTemplate2(template, noteTitle, userData) {
  template = template.replace(/{{\s*(date|time)(?::([^,}]+))?(?:,\s*([^}]+))?\s*}}/g, (_match, type, format, offset) => {
    let m = (0, import_moment.default)();
    if (offset) {
      const parsed = parseOffset(offset);
      if (parsed) m = m.add(parsed.amount, parsed.unit);
    }
    if (type === "date") {
      return m.format(format || "YYYY-MM-DD");
    } else if (type === "time") {
      return m.format(format || "HH:mm:ss");
    }
    return "";
  });
  template = template.replace(/{{\s*(title|year|month|day)\s*}}/g, (_match, type) => {
    const m = (0, import_moment.default)();
    if (type === "title") return noteTitle;
    if (type === "year") return m.format("YYYY");
    if (type === "month") return m.format("MM");
    if (type === "day") return m.format("DD");
    return "";
  });
  template = template.replace(/{{\s*userData\.([a-zA-Z0-9_.]+)\s*}}/g, (_match, path) => {
    const value = getNestedValue(userData, path);
    return value !== void 0 && value !== null ? String(value) : "";
  });
  template = template.replace(/{{\s*([a-zA-Z0-9_.]+)\s*}}/g, (_match, path) => {
    if (path.startsWith("userData.")) return _match;
    const value = getNestedValue(userData, path);
    return value !== void 0 && value !== null ? String(value) : "";
  });
  return template;
}

// src/core/notes/NoteCreator.ts
var NoteCreator = class {
  constructor(plugin) {
    this.plugin = plugin;
    this.metadataProcessor = new MetadataProcessor(plugin);
  }
  /**
   * Creates a new note file with the given options
   * @param options The note creation options
   * @returns The created TFile or null if creation failed
   */
  async createNote(options) {
    try {
      const noteTitle = await this.resolveNoteTitle(options);
      if (!noteTitle) {
        throw new Error("Note title could not be generated. Please check the template.");
      }
      const folderPath = await this.resolveFolderPath(options);
      const existingNote = this.plugin.app.vault.getAbstractFileByPath(`${folderPath}/${noteTitle}.md`);
      if (existingNote) {
        throw new Error(`Note "${noteTitle}" already exists in "${folderPath}".`);
      }
      const processedMetadata = await this.metadataProcessor.processMetadata(
        options.metadataTemplate,
        options.formData
      );
      const markdownContent = await this.processMarkdownContent(options);
      const noteFile = await this.createNoteFile(folderPath, noteTitle, processedMetadata, markdownContent);
      if (options.openNote && noteFile) {
        if (options.openInNewLeaf) {
          this.plugin.app.workspace.openLinkText(`${folderPath}/${noteTitle}.md`, `${folderPath}/${noteTitle}.md`, false);
        } else {
          this.plugin.app.workspace.getLeaf(false).openFile(noteFile);
        }
      }
      return noteFile;
    } catch (error) {
      console.error("Error in NoteCreator.createNote:", error);
      throw error;
    }
  }
  /**
   * Resolves the note title from options or template
   */
  async resolveNoteTitle(options) {
    if (options.noteTitle) {
      return options.noteTitle;
    }
    let titleTemplate = options.noteTitleTemplate;
    if (!titleTemplate && options.noteType) {
      if (options.noteType in this.plugin.settings.note) {
        titleTemplate = this.plugin.settings.note[options.noteType].titleTemplate;
      } else {
        titleTemplate = this.plugin.settings.note.default.titleTemplate;
      }
    }
    if (titleTemplate) {
      return await parsePathTemplate(this.plugin.app, "file", titleTemplate, options.formData);
    }
    return "New Note";
  }
  /**
   * Resolves the folder path from options or template
   */
  async resolveFolderPath(options) {
    if (options.folderPath) {
      return options.folderPath;
    }
    let folderTemplate;
    if (options.noteType && options.noteType in this.plugin.settings.note) {
      const noteSettings = this.plugin.settings.note[options.noteType];
      folderTemplate = noteSettings.folderTemplate;
    } else {
      folderTemplate = this.plugin.settings.note.default.folderTemplate;
    }
    if (folderTemplate) {
      const resolved = await parsePathTemplate(this.plugin.app, "folder", folderTemplate, options.formData);
      return resolved || "";
    }
    return "";
  }
  /**
   * Processes the markdown content template
   */
  async processMarkdownContent(options) {
    let markdownTemplate;
    if (options.noteType && options.noteType in this.plugin.settings.note) {
      const noteSettings = this.plugin.settings.note[options.noteType];
      markdownTemplate = noteSettings.markdownTemplate;
    } else {
      markdownTemplate = this.plugin.settings.note.default.markdownTemplate;
    }
    const noteTitle = await this.resolveNoteTitle(options);
    return processMarkdownTemplate2(markdownTemplate, noteTitle || "New Note", options.formData);
  }
  /**
   * Creates the actual note file
   */
  async createNoteFile(folderPath, noteTitle, metadata, content) {
    const cleanFolderPath = folderPath.endsWith("/") ? folderPath.slice(0, -1) : folderPath;
    const folder = this.plugin.app.vault.getFolderByPath(cleanFolderPath);
    if (!folder) {
      console.debug(`Folder "${cleanFolderPath}" does not exist. Creating it.`);
      await this.plugin.app.vault.createFolder(cleanFolderPath);
    }
    const notePath = `${cleanFolderPath}/${noteTitle}.md`;
    const noteFile = await this.plugin.app.vault.create(notePath, "");
    if (noteFile) {
      await this.plugin.app.fileManager.processFrontMatter(noteFile, (frontmatter) => {
        Object.assign(frontmatter, metadata);
      });
      await this.plugin.app.vault.append(noteFile, content);
    }
    return noteFile;
  }
};

// src/ui/modals/notes/NewNoteModal.ts
var import_obsidian36 = require("obsidian");

// src/ui/modals/components/LabeledTextInput.ts
var import_obsidian27 = require("obsidian");
var LabeledTextInput = class {
  constructor(options) {
    const {
      container,
      label,
      defaultValue,
      onChangeCallback = (value) => value.trim(),
      // Default callback
      actionButton = false,
      actionCallback = null,
      actionButtonIcon = "play",
      actionButtonTooltip = null,
      fieldKey = null
    } = options;
    this.wrapper = container.createDiv({ cls: "eln-modal-input-wrapper", attr: { "data-type": "text" } });
    this.wrapper.createEl("label", { text: label });
    this.input = new import_obsidian27.TextComponent(this.wrapper);
    this.input.setPlaceholder(defaultValue);
    this.input.setValue(defaultValue);
    this.input.onChange((value) => {
      try {
        onChangeCallback(value);
      } catch (error) {
        console.error(`Error in onChangeCallback for field "${fieldKey}":`, error);
        onChangeCallback(value.trim());
      }
    });
    if (actionButton) {
      this.actionButtonEl = new import_obsidian27.ButtonComponent(this.wrapper);
      this.actionButtonEl.setIcon(actionButtonIcon);
      this.actionButtonEl.onClick(() => {
        const inputValue = this.input.getValue();
        if (fieldKey) {
          console.log(`Action button clicked for field: ${fieldKey}, with value: ${inputValue}`);
        }
        if (actionCallback) {
          console.log(`Executing action callback function: ${actionCallback}`);
          actionCallback(inputValue);
        }
      });
      if (actionButtonTooltip) {
        this.actionButtonEl.setTooltip(actionButtonTooltip);
      }
    }
  }
  // Get the input component for further customization if needed
  getInput() {
    return this.input;
  }
  // Get the wrapper element
  getWrapper() {
    return this.wrapper;
  }
  // Get the action button component (if it exists)
  getActionButton() {
    return this.actionButtonEl;
  }
  // Set the value of the input field
  setValue(value) {
    this.input.setValue(value);
  }
};

// src/ui/modals/components/LabeledNumericInput.ts
var import_obsidian28 = require("obsidian");
var LabeledNumericInput = class {
  // Store the default unit for later use
  constructor(options) {
    const {
      container,
      label,
      defaultValue,
      units = null,
      defaultUnit = null,
      onChangeCallback = (result) => result
      // Default callback
    } = options;
    this.units = units;
    this.defaultUnit = defaultUnit;
    this.wrapper = container.createDiv({ cls: "eln-modal-input-wrapper", attr: { "data-type": "number" } });
    this.wrapper.createEl("label", { text: label });
    this.input = new import_obsidian28.TextComponent(this.wrapper);
    this.input.setPlaceholder(defaultValue.toString());
    this.input.setValue(defaultValue.toString());
    this.input.inputEl.setAttribute("type", "number");
    this.input.onChange((value) => {
      var _a, _b;
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        try {
          if (this.units) {
            onChangeCallback({
              value: numericValue,
              unit: (_a = this.unitDropdown) == null ? void 0 : _a.getValue()
            });
          } else {
            onChangeCallback(numericValue);
          }
        } catch (error) {
          console.error(`Error in onChangeCallback for LabeledNumericInput:`, error);
          if (this.units) {
            onChangeCallback({
              value: numericValue,
              unit: (_b = this.unitDropdown) == null ? void 0 : _b.getValue()
            });
          } else {
            onChangeCallback(numericValue);
          }
        }
      }
    });
    if (this.units) {
      if (!Array.isArray(this.units)) {
        this.units = [this.units];
      }
      if (this.units.length > 1) {
        this.unitDropdown = new import_obsidian28.DropdownComponent(this.wrapper);
        this.unitDropdown.addOptions(Object.fromEntries(this.units.map((unit) => [unit, unit])));
        this.unitDropdown.setValue(this.defaultUnit || this.units[0]);
        this.unitDropdown.onChange((unit) => {
          const numericValue = parseFloat(this.input.getValue());
          if (!isNaN(numericValue)) {
            try {
              onChangeCallback({
                value: numericValue,
                unit
              });
            } catch (error) {
              console.error(`Error in onChangeCallback for LabeledNumericInput:`, error);
              onChangeCallback({
                value: numericValue,
                unit
              });
            }
          }
        });
      } else {
        this.wrapper.createEl("span", { cls: "eln-unit", text: this.units[0] });
      }
    }
  }
  // Get the numeric input component for further customization if needed
  getInput() {
    return this.input;
  }
  // Get the unit dropdown component (if it exists)
  getUnitDropdown() {
    return this.unitDropdown;
  }
  // Get the wrapper element
  getWrapper() {
    return this.wrapper;
  }
  // Set the value of the input field
  setValue(value, unit) {
    if (typeof value === "number") {
      this.input.setValue(value.toString());
    } else {
      this.input.setValue(value);
    }
    if (this.unitDropdown) {
      if (unit) {
        this.unitDropdown.setValue(unit);
      } else {
        this.unitDropdown.setValue(this.defaultUnit || this.units[0]);
      }
    }
  }
};

// src/ui/modals/components/LabeledDateInput.ts
var LabeledDateInput = class {
  constructor(options) {
    const {
      container,
      label,
      defaultValue,
      onChangeCallback = (value) => value
    } = options;
    this.wrapper = container.createDiv({ cls: "eln-modal-input-wrapper" });
    this.wrapper.createEl("label", { text: label });
    this.input = this.wrapper.createEl("input", { cls: "eln-modal-input" });
    this.input.setAttr("type", "date");
    this.input.setAttr("value", defaultValue);
    this.input.addEventListener("input", (event) => {
      const value = event.target.value;
      try {
        onChangeCallback(value);
      } catch (error) {
        console.error(`Error in onChangeCallback for LabeledDateInput:`, error);
        onChangeCallback(value.trim());
      }
    });
  }
  // Get the input element for further customization if needed
  getInput() {
    return this.input;
  }
  // Get the wrapper element
  getWrapper() {
    return this.wrapper;
  }
  // Set the value of the date input
  setValue(value) {
    this.input.value = value;
  }
  // Get the current value of the date input
  getValue() {
    return this.input.value;
  }
};

// src/ui/modals/components/LabeledDropdown.ts
var import_obsidian29 = require("obsidian");
var LabeledDropdown = class {
  constructor(options) {
    const {
      container,
      label,
      options: dropdownOptions,
      onChangeCallback = (value) => value
    } = options;
    console.log("Creating LabeledDropdown with options:", dropdownOptions);
    this.wrapper = container.createDiv({ cls: "eln-modal-dropdown-wrapper" });
    this.wrapper.createEl("label", { text: label });
    this.dropdown = new import_obsidian29.DropdownComponent(this.wrapper);
    let processedOptions = dropdownOptions;
    if (!Array.isArray(dropdownOptions)) {
      processedOptions = [dropdownOptions];
    }
    this.dropdown.addOptions(
      Object.fromEntries(processedOptions.map((option) => [option, option]))
    );
    if (dropdownOptions.length > 0) {
      const defaultValue = dropdownOptions[0];
      this.dropdown.setValue(defaultValue);
      try {
        onChangeCallback(defaultValue);
      } catch (error) {
        console.error(`Error in onChangeCallback for LabeledDropdown:`, error);
        onChangeCallback(defaultValue.trim());
      }
    }
    this.dropdown.onChange((value) => {
      try {
        onChangeCallback(value);
      } catch (error) {
        console.error(`Error in onChangeCallback for LabeledDropdown:`, error);
        onChangeCallback(value.trim());
      }
    });
  }
  // Get the dropdown component for further customization if needed
  getDropdown() {
    return this.dropdown;
  }
  // Get the wrapper element
  getWrapper() {
    return this.wrapper;
  }
};

// src/ui/modals/components/MultiSelectInput.ts
var import_obsidian30 = require("obsidian");
var MultiSelectInput = class {
  constructor(options) {
    const {
      container,
      label,
      options: dropdownOptions,
      onChangeCallback = (selectedValues) => selectedValues
      // Default callback
    } = options;
    if (!Array.isArray(dropdownOptions)) {
      this.options = [dropdownOptions];
    } else {
      this.options = dropdownOptions;
    }
    this.onChangeCallback = onChangeCallback;
    this.selectedValues = /* @__PURE__ */ new Map();
    this.wrapper = container.createDiv({ cls: "eln-modal-multiselect-wrapper" });
    this.wrapper.createEl("label", { text: label });
    this.addDropdown();
    const addButton = new import_obsidian30.ButtonComponent(this.wrapper);
    addButton.setIcon("plus");
    addButton.onClick(() => {
      this.addDropdown();
      if (this.wrapper.lastChild) {
        this.wrapper.insertBefore(this.wrapper.lastChild, addButton.buttonEl);
      }
    });
  }
  // Add a dropdown to the multi-select input
  addDropdown(initialValue = null) {
    const dropdownWrapper = this.wrapper.createDiv({ cls: "eln-modal-multiselect-dropdown-wrapper" });
    const availableOptions = this.options.filter(
      (option) => !Array.from(this.selectedValues.values()).includes(option)
    );
    const dropdown = new import_obsidian30.DropdownComponent(dropdownWrapper);
    dropdown.addOptions(Object.fromEntries(availableOptions.map((option) => [option, option])));
    const defaultValue = initialValue || availableOptions[0];
    dropdown.setValue(defaultValue);
    this.selectedValues.set(dropdownWrapper, defaultValue);
    this.triggerOnChangeCallback();
    dropdown.onChange((value) => {
      this.selectedValues.set(dropdownWrapper, value);
      this.updateDropdownOptions();
      this.triggerOnChangeCallback();
    });
    if (this.selectedValues.size > 1) {
      const removeButton = new import_obsidian30.ButtonComponent(dropdownWrapper);
      removeButton.setIcon("cross");
      removeButton.onClick(() => {
        this.selectedValues.delete(dropdownWrapper);
        dropdownWrapper.remove();
        this.updateDropdownOptions();
        this.triggerOnChangeCallback();
      });
    }
  }
  // Update the options for all dropdowns to reflect the current selections
  updateDropdownOptions() {
    this.selectedValues.forEach((selectedValue, dropdownWrapper) => {
      const availableOptions = this.options.filter(
        (option) => !Array.from(this.selectedValues.values()).includes(option) || option === selectedValue
      );
      dropdownWrapper.empty();
      const dropdown = new import_obsidian30.DropdownComponent(dropdownWrapper);
      dropdown.addOptions(Object.fromEntries(availableOptions.map((option) => [option, option])));
      dropdown.setValue(selectedValue);
      dropdown.onChange((value) => {
        this.selectedValues.set(dropdownWrapper, value);
        this.updateDropdownOptions();
        this.triggerOnChangeCallback();
      });
      this.selectedValues.set(dropdownWrapper, selectedValue);
    });
  }
  // Trigger the onChangeCallback safely
  triggerOnChangeCallback() {
    try {
      this.onChangeCallback(Array.from(this.selectedValues.values()));
    } catch (error) {
      console.error("Error in onChangeCallback for MultiSelectInput:", error);
      this.onChangeCallback(Array.from(this.selectedValues.values()));
    }
  }
  // Get the wrapper element
  getWrapper() {
    return this.wrapper;
  }
};

// src/ui/modals/components/ListInput.ts
var import_obsidian31 = require("obsidian");
var ListInput = class {
  constructor(options) {
    const {
      container,
      label,
      defaultValue,
      dataType = "text",
      // Default to "text" if not provided
      onChangeCallback = (value) => {
        if (dataType === "number") {
          return value.split(",").map((item) => parseFloat(item.trim()));
        } else if (dataType === "boolean") {
          return value.split(",").map((item) => item.trim().toLowerCase() === "true");
        }
        return value.split(",").map((item) => item.trim());
      },
      fieldKey = null
    } = options;
    this.wrapper = container.createDiv({ cls: "eln-modal-input-wrapper", attr: { "data-type": "text" } });
    this.wrapper.createEl("label", { text: label });
    this.input = new import_obsidian31.TextComponent(this.wrapper);
    this.input.setPlaceholder(defaultValue);
    this.input.setValue(defaultValue);
    this.input.onChange((value) => {
      try {
        onChangeCallback(value);
      } catch (error) {
        console.error(`Error in onChangeCallback for field "${fieldKey}":`, error);
        onChangeCallback(value.trim());
      }
    });
  }
  // Get the input component for further customization if needed
  getInput() {
    return this.input;
  }
  // Get the wrapper element
  getWrapper() {
    return this.wrapper;
  }
  // Set the value of the input field
  setValue(value) {
    this.input.setValue(value);
  }
};

// src/ui/modals/components/DynamicInputSection.ts
var import_obsidian33 = require("obsidian");

// src/ui/modals/dialogs/InputDialog.ts
var import_obsidian32 = require("obsidian");
var InputDialog = class extends import_obsidian32.Modal {
  constructor(app, options) {
    super(app);
    this.options = {
      title: "Add New Field",
      // Default title
      placeholder: "Enter field name",
      // Default placeholder
      buttonText: "Add Field",
      // Default button text
      noticeText: "Field name cannot be empty.",
      // Default notice text
      ...options
      // Override defaults with provided options
    };
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h2", { text: this.options.title });
    const input = new import_obsidian32.TextComponent(contentEl);
    input.setPlaceholder(this.options.placeholder || "");
    const submitButton = new import_obsidian32.ButtonComponent(contentEl);
    submitButton.setButtonText(this.options.buttonText || "Submit");
    submitButton.setCta();
    submitButton.onClick(() => {
      const fieldName = input.getValue().trim();
      if (fieldName) {
        this.options.onSubmit(fieldName);
        this.close();
      } else {
        new import_obsidian32.Notice(this.options.noticeText || "Enter a value or press cancel to abort.");
      }
    });
    const cancelButton = new import_obsidian32.ButtonComponent(contentEl);
    cancelButton.setButtonText("Cancel");
    cancelButton.onClick(() => {
      this.close();
    });
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};

// src/ui/modals/components/DynamicInputSection.ts
var DynamicInputSection = class {
  constructor(app, options) {
    this.app = app;
    const {
      container,
      label,
      data,
      onChangeCallback = (updatedData) => updatedData
    } = options;
    this.data = { ...data };
    this.onChangeCallback = onChangeCallback;
    this.wrapper = container.createDiv({ cls: "eln-modal-dynamic-section-wrapper" });
    this.wrapper.createEl("h3", { text: label });
    this.renderFields();
    const addButton = new import_obsidian33.ButtonComponent(this.wrapper);
    addButton.setButtonText("Add Field");
    addButton.onClick(() => {
      new InputDialog(this.app, {
        title: "Add New Field",
        placeholder: "Enter field name",
        buttonText: "Add Field",
        noticeText: "Field name cannot be empty.",
        onSubmit: (fieldName) => {
          if (this.data[fieldName]) {
            new import_obsidian33.Notice("Field name already exists.");
            return;
          }
          this.data[fieldName] = "";
          this.renderFields();
          this.triggerOnChangeCallback();
        }
      }).open();
    });
  }
  renderFields() {
    this.wrapper.querySelectorAll(".eln-dynamic-field").forEach((el) => el.remove());
    Object.keys(this.data).forEach((key) => {
      const fieldWrapper = this.wrapper.createDiv({ cls: "eln-dynamic-field" });
      const keyInput = new import_obsidian33.TextComponent(fieldWrapper);
      keyInput.setValue(key);
      keyInput.onChange((newKey) => {
        if (newKey && newKey !== key && !this.data[newKey]) {
          const value = this.data[key];
          delete this.data[key];
          this.data[newKey] = value;
          this.renderFields();
          this.triggerOnChangeCallback();
        }
      });
      const valueInput = new import_obsidian33.TextComponent(fieldWrapper);
      valueInput.setValue(this.data[key]);
      valueInput.onChange((value) => {
        this.data[key] = value;
        this.triggerOnChangeCallback();
      });
      const removeButton = new import_obsidian33.ButtonComponent(fieldWrapper);
      removeButton.setIcon("cross");
      removeButton.setTooltip("Remove Field");
      removeButton.onClick(() => {
        delete this.data[key];
        this.renderFields();
        this.triggerOnChangeCallback();
      });
    });
  }
  // Safely trigger the onChangeCallback
  triggerOnChangeCallback() {
    try {
      this.onChangeCallback(this.data);
    } catch (error) {
      console.error("Error in onChangeCallback for DynamicInputSection:", error);
      this.onChangeCallback(this.data);
    }
  }
  // Get the wrapper element
  getWrapper() {
    return this.wrapper;
  }
};

// src/ui/modals/components/QueryDropDown.ts
var import_obsidian34 = require("obsidian");

// src/search/searchFilesByTag.ts
function extractFrontmatterTags(cache) {
  if (!cache) return [];
  const tags = cache["tags"] || cache["tag"];
  if (Array.isArray(tags)) {
    return tags.map((tag) => typeof tag === "string" ? tag.trim() : tag.toString().trim());
  } else if (typeof tags === "string") {
    return [tags];
  }
  return [];
}
function searchFilesByTag(app, searchTag) {
  const files = app.vault.getMarkdownFiles();
  return files.filter((file) => {
    var _a;
    const cache = (_a = app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter;
    const tags = extractFrontmatterTags(cache);
    return tags.some((tag) => tag.startsWith(searchTag));
  });
}

// src/ui/modals/components/QueryDropDown.ts
function matchesWhere(app, file, where) {
  var _a;
  if (!where || where.length === 0) return true;
  const cache = app.metadataCache.getFileCache(file);
  const frontmatter = (_a = cache == null ? void 0 : cache.frontmatter) != null ? _a : {};
  for (const cond of where) {
    const { field, ...ops } = cond;
    const value = field.split(".").reduce(
      (obj, k) => obj ? obj[k] : void 0,
      frontmatter
    );
    for (const op in ops) {
      const expected = ops[op];
      if (op === "is" && value !== expected) return false;
      if (op === "contains") {
        if (typeof value === "string") {
          if (!value.includes(expected)) return false;
        } else if (Array.isArray(value)) {
          if (!value.includes(expected)) return false;
        } else {
          return false;
        }
      }
    }
  }
  return true;
}
var QueryDropDown = class {
  constructor(app, options) {
    this.app = app;
    const { container, label, search, where, onChangeCallback = (value) => value } = options;
    console.debug("QueryDropDown: Initializing with options:", options);
    this.wrapper = container.createDiv({ cls: "eln-modal-dropdown-wrapper" });
    this.wrapper.createEl("label", { text: label });
    this.dropdown = new import_obsidian34.DropdownComponent(this.wrapper);
    const files = searchFilesByTag(this.app, search).filter((file) => matchesWhere(this.app, file, where));
    if (files) {
      const fileNames = files.map((file) => file.basename);
      this.dropdown.addOptions(
        Object.fromEntries(fileNames.map((name) => [name, name]))
      );
      console.debug("QueryDropDown: Populated dropdown with files:", fileNames);
      if (fileNames.length > 0) {
        const defaultValue = fileNames[0];
        this.dropdown.setValue(defaultValue);
        onChangeCallback(defaultValue);
      }
    }
    this.dropdown.onChange((value) => {
      onChangeCallback(value);
    });
  }
};

// src/ui/modals/components/SubClassSelection.ts
var import_obsidian35 = require("obsidian");
var SubClassSelection = class {
  constructor(opts) {
    const { container, label, options, defaultValue, onChangeCallback } = opts;
    console.debug("SubClassSelection: Initializing with options:", {
      label,
      options,
      defaultValue,
      onChangeCallback
    });
    const wrapper = container.createDiv({ cls: "eln-modal-dropdown-wrapper" });
    wrapper.createEl("label", { text: label });
    this.dropdown = new import_obsidian35.DropdownComponent(wrapper);
    this.dropdown.addOptions(Object.fromEntries(options.map((opt) => [opt, opt])));
    if (defaultValue && options.includes(defaultValue)) {
      this.dropdown.setValue(defaultValue);
    } else if (options.length > 0) {
      this.dropdown.setValue(options[0]);
    }
    this.dropdown.onChange(onChangeCallback);
  }
  setValue(value) {
    this.dropdown.setValue(value);
  }
  getValue() {
    return this.dropdown.getValue();
  }
};

// src/ui/modals/notes/NewNoteModal.ts
var NewNoteModal = class extends import_obsidian36.Modal {
  constructor(plugin, options) {
    super(plugin.app);
    // Store reference to input container for re-rendering
    this.initialTemplateApplied = false;
    // Prevent multiple initial applications
    this.logger = createLogger("modal");
    this.plugin = plugin;
    this.modalTitle = options.modalTitle || "New Note";
    this.noteType = options.noteType;
    this.baseMetadataTemplate = JSON.parse(JSON.stringify(options.metadataTemplate));
    this.metadataTemplate = JSON.parse(JSON.stringify(options.metadataTemplate));
    this.onSubmit = options.onSubmit;
    this.templateEvaluator = new TemplateEvaluator(plugin);
    this.metadataProcessor = new MetadataProcessor(plugin);
    this.submitted = false;
    this.data = {};
    this.inputs = {};
  }
  async onOpen() {
    const { modalEl, contentEl, titleEl } = this;
    titleEl.setText(this.modalTitle);
    modalEl.addClass("eln-modal");
    await this.applyInitialSubclassTemplate();
    this.inputContainer = contentEl.createDiv({ cls: "eln-inputs" });
    this.renderInputs(this.inputContainer, this.metadataTemplate);
    const confirmButton = new import_obsidian36.ButtonComponent(contentEl);
    confirmButton.setButtonText("Submit");
    confirmButton.setCta();
    confirmButton.onClick(async () => {
      this.submitted = true;
      this.close();
    });
  }
  onClose() {
    if (this.onSubmit) {
      this.onSubmit(this.submitted ? {
        formData: this.data,
        template: this.metadataTemplate
      } : null);
    }
  }
  renderInputs(container, template, fullKey = null) {
    for (const [key, config] of Object.entries(template)) {
      const currentKey = fullKey ? `${fullKey}.${key}` : key;
      if (config !== null && typeof config === "object" && !("inputType" in config) && !("query" in config)) {
        container.createEl("h3", { text: key.charAt(0).toUpperCase() + key.slice(1) });
        this.renderInputs(container, config, currentKey);
      } else if (config && typeof config === "object" && "inputType" in config && "query" in config && config.query === true) {
        const field = config;
        let defaultValue;
        if (TemplateEvaluator.isFunctionDescriptor(field.default)) {
          if (field.default.userInputs && field.default.userInputs.length > 0) {
            defaultValue = this.templateEvaluator.evaluateUserInputFunction(field.default, this.data);
          } else {
            defaultValue = TemplateEvaluator.evaluateFunctionDescriptor(field.default, this);
          }
        } else if (typeof field.default === "function") {
          defaultValue = field.default(this.data);
        } else {
          defaultValue = field.default;
        }
        let targetData = this.data;
        let targetInputs = this.inputs;
        if (fullKey) {
          const keys = fullKey.split(".");
          for (const k of keys) {
            if (!targetData[k]) {
              targetData[k] = {};
            }
            if (!targetInputs[k]) {
              targetInputs[k] = {};
            }
            targetData = targetData[k];
            targetInputs = targetInputs[k];
          }
        }
        switch (field.inputType) {
          case "text": {
            const textInput = new LabeledTextInput({
              container,
              label: key,
              defaultValue: defaultValue || "",
              onChangeCallback: this.createReactiveCallback(targetData, key, currentKey, field.callback)
            });
            targetData[key] = defaultValue || "";
            targetInputs[key] = textInput;
            break;
          }
          case "number": {
            const numberInput = new LabeledNumericInput({
              container,
              label: key,
              defaultValue: defaultValue || 0,
              units: field.units || [],
              defaultUnit: field.defaultUnit || (Array.isArray(field.units) ? field.units[0] : void 0),
              onChangeCallback: (value) => {
                const callback = field.callback;
                let processedValue;
                if (typeof value === "object" && value !== null) {
                  processedValue = callback ? callback(value.value) : value.value;
                } else {
                  processedValue = callback ? callback(value) : value;
                }
                targetData[key] = processedValue;
              }
            });
            targetData[key] = defaultValue || 0;
            targetInputs[key] = numberInput;
            break;
          }
          case "actiontext": {
            const defaultActionText = typeof field.default === "function" ? field.default(this.data) : field.default;
            const actionCallback = field.action;
            const actionTextInput = new LabeledTextInput({
              container,
              label: key,
              defaultValue: defaultActionText || "",
              onChangeCallback: (value) => {
                const callback = field.callback;
                targetData[key] = callback ? callback(value) : value;
              },
              actionButton: true,
              actionCallback: actionCallback || void 0,
              // Convert null to undefined
              actionButtonIcon: field.icon || "gear",
              actionButtonTooltip: field.tooltip || "Perform action",
              fieldKey: currentKey
            });
            targetData[key] = defaultActionText || "";
            targetInputs[key] = actionTextInput;
            break;
          }
          case "dropdown": {
            this.logger.debug("Creating dropdown for key:", key);
            const fieldOptions = field.options;
            const dropdownOptions = Array.isArray(fieldOptions) ? fieldOptions : [];
            const dropdownInput = new LabeledDropdown({
              container,
              label: key,
              options: dropdownOptions,
              onChangeCallback: this.createReactiveCallback(targetData, key, currentKey, field.callback)
            });
            const initialValue = defaultValue || (dropdownOptions.length > 0 ? dropdownOptions[0] : "");
            targetData[key] = initialValue;
            targetInputs[key] = dropdownInput;
            break;
          }
          case "multiselect": {
            const fieldOptions = field.options;
            const dropdownOptions = Array.isArray(fieldOptions) ? fieldOptions : [];
            const multiSelectInput = new MultiSelectInput({
              container,
              label: key,
              options: dropdownOptions,
              onChangeCallback: this.createReactiveCallback(targetData, key, currentKey, field.callback)
            });
            targetData[key] = defaultValue || [];
            targetInputs[key] = multiSelectInput;
            break;
          }
          case "date": {
            const dateInput = new LabeledDateInput({
              container,
              label: key,
              defaultValue: defaultValue || "",
              onChangeCallback: (value) => {
                const callback = field.callback;
                targetData[key] = callback ? callback(value) : value;
              }
            });
            targetData[key] = defaultValue || "";
            targetInputs[key] = dateInput;
            break;
          }
          case "dynamic": {
            const dynamicSection = new DynamicInputSection(this.app, {
              container,
              label: key,
              data: field.data || {},
              onChangeCallback: (updatedData) => {
                targetData[key] = updatedData;
              }
            });
            targetData[key] = field.data || {};
            targetInputs[key] = dynamicSection;
            break;
          }
          case "queryDropdown": {
            const queryDropDown = new QueryDropDown(this.app, {
              container,
              label: key,
              search: field.search || "",
              where: field.where || void 0,
              onChangeCallback: (value) => {
                const callback = field.callback;
                targetData[key] = callback ? callback(value) : value;
              }
            });
            targetData[key] = defaultValue || "";
            targetInputs[key] = queryDropDown;
            break;
          }
          case "subclass": {
            const fieldOptions = field.options;
            const subclassOptions = Array.isArray(fieldOptions) ? fieldOptions : [];
            const defaultValue2 = typeof field.default === "string" ? field.default : subclassOptions[0] || "";
            const subClassSelection = new SubClassSelection({
              app: this.app,
              container,
              label: key,
              options: subclassOptions,
              defaultValue: defaultValue2,
              onChangeCallback: async (selectedType) => {
                targetData[key] = selectedType;
                this.updateDependentFields(currentKey);
                this.logger.debug(`Subclass selection changed to: ${selectedType}`);
                await this.applySubclassTemplate(selectedType, currentKey);
              }
            });
            targetData[key] = defaultValue2;
            targetInputs[key] = subClassSelection;
            break;
          }
          case "list": {
            let defaultValueString = "";
            if (Array.isArray(defaultValue)) {
              defaultValueString = defaultValue.join(", ");
            } else if (typeof defaultValue === "string") {
              defaultValueString = defaultValue;
            }
            const listInput = new ListInput({
              container,
              label: key,
              defaultValue: defaultValueString,
              dataType: field.dataType || "text",
              onChangeCallback: (value) => {
                let processedValue;
                if (field.dataType === "number") {
                  processedValue = value.split(",").map((item) => parseFloat(item.trim())).filter((item) => !isNaN(item));
                } else if (field.dataType === "boolean") {
                  processedValue = value.split(",").map((item) => item.trim().toLowerCase() === "true");
                } else {
                  processedValue = value.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
                }
                targetData[key] = processedValue;
              },
              fieldKey: currentKey
            });
            let initialListValue;
            if (field.dataType === "number") {
              initialListValue = Array.isArray(defaultValue) ? defaultValue : [];
            } else if (field.dataType === "boolean") {
              initialListValue = Array.isArray(defaultValue) ? defaultValue : [];
            } else {
              initialListValue = Array.isArray(defaultValue) ? defaultValue : defaultValueString.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
            }
            targetData[key] = initialListValue;
            targetInputs[key] = listInput;
            break;
          }
          default:
            console.warn(`Unsupported input type: ${config.inputType}`);
        }
      }
    }
  }
  /**
   * Updates fields that depend on user input when their dependencies change.
   * @param changedFieldPath The path of the field that was changed (e.g., "chemical.type")
   */
  updateDependentFields(changedFieldPath) {
    this.updateFieldsInTemplate(this.metadataTemplate, changedFieldPath);
  }
  /**
   * Recursively finds and updates fields that depend on the changed field.
   * @param template The metadata template to search through
   * @param changedFieldPath The path of the field that was changed
   * @param currentPath The current path in the template traversal
   */
  updateFieldsInTemplate(template, changedFieldPath, currentPath = "") {
    for (const [key, config] of Object.entries(template)) {
      const fieldPath = currentPath ? `${currentPath}.${key}` : key;
      if (config !== null && typeof config === "object" && !("inputType" in config)) {
        this.updateFieldsInTemplate(config, changedFieldPath, fieldPath);
      } else if (config && typeof config === "object" && "inputType" in config) {
        const field = config;
        const hasUserInputDependency = this.templateEvaluator.checkFieldForUserInputDependencies(field, changedFieldPath);
        if (hasUserInputDependency) {
          this.updateFieldValue(fieldPath, field);
        }
      }
    }
  }
  /**
   * Updates the value of a field that depends on user input.
   * @param fieldPath The path to the field that needs updating
   * @param field The field configuration
   */
  updateFieldValue(fieldPath, field) {
    let newValue;
    if (typeof field.default === "function") {
      try {
        newValue = field.default(this.data);
      } catch (error) {
        console.error(`Error evaluating function for field "${fieldPath}":`, error);
        return;
      }
    } else if (TemplateEvaluator.isFunctionDescriptor(field.default)) {
      try {
        newValue = this.templateEvaluator.evaluateUserInputFunction(field.default, this.data);
      } catch (error) {
        console.error(`Error evaluating function descriptor for field "${fieldPath}":`, error);
        return;
      }
    } else {
      newValue = field.default;
    }
    this.setNestedValue(this.data, fieldPath, newValue);
    this.updateInputField(fieldPath, newValue);
  }
  /**
   * Updates an input field component with a new value
   */
  updateInputField(fullKey, value) {
    const keys = fullKey.split(".");
    let target = this.data;
    let inputField = this.inputs;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!target[keys[i]]) {
        console.warn(`Data key "${keys[i]}" does not exist in this.data at level ${i}.`);
        return;
      }
      if (!inputField[keys[i]]) {
        console.warn(`Input field key "${keys[i]}" does not exist in this.inputs at level ${i}.`);
        return;
      }
      target = target[keys[i]];
      inputField = inputField[keys[i]];
    }
    const finalKey = keys[keys.length - 1];
    target[finalKey] = value;
    const component = inputField[finalKey];
    if (component && typeof component === "object" && "setValue" in component && typeof component.setValue === "function") {
      let setValue = null;
      if (value instanceof Date) {
        setValue = value.toISOString();
      } else if (Array.isArray(value)) {
        setValue = value.join(", ");
      } else if (typeof value === "object" && value !== null) {
        setValue = JSON.stringify(value);
      } else {
        setValue = value;
      }
      component.setValue(setValue);
    } else if (component instanceof HTMLInputElement) {
      component.value = String(value || "");
    } else {
      console.warn(`Unsupported input field type for "${fullKey}".`);
    }
  }
  /**
   * Sets a nested value in an object using dot notation.
   */
  setNestedValue(obj, path, value) {
    const keys = path.split(".");
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]] || typeof current[keys[i]] !== "object") {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  }
  /**
   * Creates a callback function that updates the field value and triggers reactive updates.
   */
  createReactiveCallback(targetData, key, currentKey, callback) {
    return (value) => {
      const processedValue = callback ? callback(value) : value;
      targetData[key] = processedValue;
      this.updateDependentFields(currentKey);
    };
  }
  /**
   * Applies a subclass template when the user changes the subclass selection
   * @param selectedType The selected subclass type
   * @param fieldPath The path of the subclass field that changed
   */
  async applySubclassTemplate(selectedType, fieldPath) {
    try {
      this.logger.debug(`NewNoteModal: Applying subclass template for type: ${selectedType}`);
      const currentUserData = JSON.parse(JSON.stringify(this.data));
      this.logger.debug("Stored current user data:", currentUserData);
      this.metadataTemplate = this.metadataProcessor.applySubclassTemplateByName(
        this.baseMetadataTemplate,
        this.noteType,
        selectedType
      );
      this.restoreUserInputValues(this.metadataTemplate, currentUserData);
      this.data = {};
      this.inputs = {};
      this.inputContainer.empty();
      this.renderInputs(this.inputContainer, this.metadataTemplate);
      this.logger.debug("Subclass template applied and modal re-rendered");
    } catch (error) {
      console.error(`Could not apply subclass template for ${selectedType}:`, error);
    }
  }
  /**
   * Apply the initial subclass template if the metadata template has a subclass field
   * This should only be called once during modal initialization
   */
  async applyInitialSubclassTemplate() {
    if (this.initialTemplateApplied) {
      this.logger.debug("Initial template already applied, skipping");
      return;
    }
    this.logger.debug("NewNoteModal: Checking for subclass field in initial template");
    const subclassField = this.metadataProcessor.findSubclassInputField(this.baseMetadataTemplate);
    this.logger.debug("subclassField found:", subclassField);
    if (subclassField) {
      this.logger.debug("NewNoteModal: Applying initial subclass template");
      const defaultSubclass = this.metadataProcessor.getDefaultSubclassName(this.baseMetadataTemplate, this.noteType);
      this.logger.debug("Default subclass:", defaultSubclass);
      if (defaultSubclass) {
        this.logger.debug("NewNoteModal: Applying default subclass template for:", defaultSubclass);
        this.metadataTemplate = this.metadataProcessor.applySubclassTemplateByName(
          this.baseMetadataTemplate,
          this.noteType,
          defaultSubclass
        );
        this.logger.debug("Initial subclass template applied");
      } else {
        this.logger.debug("No default subclass found, using base template");
      }
    } else {
      this.logger.debug("No subclass field found in template");
    }
    this.initialTemplateApplied = true;
  }
  /**
   * Restores user input values that were already entered before subclass template change
   * @param template The template to restore values into
   * @param data The form data containing user input values
   */
  restoreUserInputValues(template, data) {
    if (!template || typeof template !== "object" || !data || typeof data !== "object") return;
    for (const key of Object.keys(template)) {
      const templateField = template[key];
      if (templateField && typeof templateField === "object" && "inputType" in templateField) {
        if (data[key] !== void 0) {
          const field = templateField;
          field.default = data[key];
        }
      }
      if (templateField && typeof templateField === "object" && !Array.isArray(templateField) && !("inputType" in templateField)) {
        this.restoreUserInputValues(templateField, data[key] || {});
      }
    }
  }
};

// src/core/notes/NewNote.ts
var NewNote = class {
  constructor(plugin) {
    this.plugin = plugin;
    this.metadataProcessor = new MetadataProcessor(plugin);
    this.noteCreator = new NoteCreator(plugin);
  }
  /**
   * Creates a new note, with or without modal input depending on requirements
   * @param options Configuration options for note creation
   * @returns Promise that resolves to the created TFile or null if creation failed/was cancelled
   */
  async create(options = {}) {
    var _a, _b;
    try {
      const template = this.metadataProcessor.loadMetadataTemplate(options.noteType);
      const processedTemplate = this.metadataProcessor.preprocessTemplate(template, options.noteType);
      const requiresUserInput = this.requiresUserInput(processedTemplate);
      let formData;
      let finalTemplate;
      if (requiresUserInput && !options.formData) {
        const modalResult = await this.collectUserInput(processedTemplate, options);
        if (!modalResult) {
          return null;
        }
        formData = modalResult.formData;
        finalTemplate = modalResult.template;
      } else {
        formData = options.formData || {};
        finalTemplate = processedTemplate;
      }
      const noteFile = await this.noteCreator.createNote({
        noteType: options.noteType,
        noteTitle: options.noteTitle,
        noteTitleTemplate: options.noteTitleTemplate,
        folderPath: options.folderPath,
        formData,
        metadataTemplate: finalTemplate,
        // Use the final template (with subclass modifications if any)
        openNote: (_a = options.openNote) != null ? _a : true,
        openInNewLeaf: (_b = options.openInNewLeaf) != null ? _b : false
      });
      if (noteFile) {
        new import_obsidian37.Notice("Note created successfully!");
      }
      return noteFile;
    } catch (error) {
      console.error("Error creating note:", error);
      new import_obsidian37.Notice("Failed to create note. Check the console for details.");
      return null;
    }
  }
  /**
   * Determines if the template requires user input
   * @param template The processed metadata template
   * @returns True if user input is required
   */
  requiresUserInput(template) {
    return this.hasQueryFields(template);
  }
  /**
   * Recursively checks if template has any fields with query=true
   * @param template The template to check
   * @returns True if any field requires user input
   */
  hasQueryFields(template) {
    if (!template || typeof template !== "object") {
      return false;
    }
    for (const value of Object.values(template)) {
      if (value && typeof value === "object") {
        if ("query" in value && value.query === true) {
          return true;
        }
        if (!("inputType" in value) && this.hasQueryFields(value)) {
          return true;
        }
      }
    }
    return false;
  }
  /**
   * Shows the modal to collect user input
   * @param template The processed metadata template
   * @param options The note creation options
   * @returns Promise that resolves to the form data and template or null if cancelled
   */
  async collectUserInput(template, options) {
    return new Promise((resolve) => {
      const modalOptions = {
        modalTitle: options.modalTitle || "New Note",
        noteType: options.noteType || "default",
        metadataTemplate: template,
        onSubmit: resolve
      };
      const modal = new NewNoteModal(this.plugin, modalOptions);
      modal.open();
    });
  }
};

// src/ui/components/navbar.ts
var Navbar = class {
  constructor(app, plugin) {
    this.app = app;
    this.plugin = plugin;
  }
  // Initialize the navbar
  init() {
    console.log("Initializing navbar...");
    this.addNavbarsToAllLeaves();
  }
  // Add navbars to all existing workspace leaves
  addNavbarsToAllLeaves() {
    const wsContainer = document.querySelector(".workspace-split.mod-vertical.mod-root");
    if (!wsContainer) {
      console.log("Workspace container not found.");
      return;
    }
    const wsLeafs = wsContainer.querySelectorAll(".workspace-leaf");
    wsLeafs.forEach((leaf) => this.addNavbarToLeaf(leaf));
  }
  // Add a navbar to a specific workspace leaf
  addNavbarToLeaf(leaf) {
    const leafContent = leaf.querySelector(".workspace-leaf-content");
    const thisViewHeader = leaf.querySelector(".view-header");
    const thisViewContent = leaf.querySelector(".view-content");
    if (!leafContent || !thisViewHeader || !thisViewContent) {
      console.log("Leaf content, header, or view content not found for a leaf.");
      return;
    }
    let navbarContainer = leafContent.querySelector(".eln-navbar-container");
    if (navbarContainer) {
      navbarContainer.innerHTML = "";
    } else {
      navbarContainer = document.createElement("div");
      navbarContainer.classList.add("eln-navbar-container");
      thisViewHeader.insertAdjacentElement("afterend", navbarContainer);
    }
    const navbar = document.createElement("div");
    navbar.classList.add("navbar");
    const createDropdown = (title, contentHtml) => {
      const dropdown = document.createElement("div");
      dropdown.classList.add("navbar-dropdown");
      const button = document.createElement("button");
      button.classList.add("dropbtn");
      button.textContent = title;
      const content = document.createElement("div");
      content.classList.add("dropdown-content");
      content.innerHTML = contentHtml;
      dropdown.addEventListener("mouseenter", () => {
        dropdown.classList.add("open");
        thisViewContent == null ? void 0 : thisViewContent.classList.add("eln-view-content-blur");
      });
      dropdown.addEventListener("mouseleave", () => {
        dropdown.classList.remove("open");
        thisViewContent == null ? void 0 : thisViewContent.classList.remove("eln-view-content-blur");
      });
      dropdown.appendChild(button);
      dropdown.appendChild(content);
      return dropdown;
    };
    const homeLink = document.createElement("div");
    homeLink.classList.add("navbar-home", "navbar-link-internal");
    homeLink.setAttribute("data-link", "Home");
    homeLink.innerHTML = `
            <svg width="20px" height="20px" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 20 20" xmlns:v="https://vecta.io/nano">
                <path d="M12.368 2.382l1.377 1.459c.129.145 1.713 1.764 1.732 2.015.033.426.047 2.475.424 3.273.363.769 2.279 2.985 2.172 3.331-.167.538-1.69 2.381-1.69 2.381-.293-.496-1.853-2.276-2.422-2.595-.957-.537-1.916-.816-2.806-.862-.094.02-.821-2.054-.842-2.829-.031-1.148.131-2.282.563-3.098l1.152-2.06c.263-.559.376-1.01.34-1.015z" fill="#888"/>
                <path d="M11.478 1.381c-.137-.143-.408-.354-.931-.367-.157-.004-.916.272-1.192.508L6.411 3.978c-.259.223-1.001.623-1.164.913-.263.466-.41 2.037-.677 3.31.967.234 2.821 2.283 3.076 3.455 0 0 1.202-.261 2.542-.311 0 0-.45-1.201-.645-2.426-.137-.857-.012-2.153.257-3.067.354-1.205 1.557-2.738 1.645-3.183.183-.937.035-1.288.035-1.288z" fill="#aeaeae"/>
                <path d="M5.9 17.576c.671-1.03 1.528-3.192 1.227-4.847-.245-1.346-1.179-2.883-2.83-3.801-.16.4-1.637 3.109-2.035 3.92-.139.283-.425.689-.352.944.155.545 3.851 3.77 3.991 3.784z" fill="#525252"/>
                <path d="M16.011 15.793s-1.404-2.67-3.417-3.301-4.705-.074-4.705-.074.235 1.446-.107 2.694c-.285 1.038-.786 2.306-1.159 2.796l3.555.359c1.108.162 2.551.565 2.972.692 0 0 .696.205 1.318-.133.602-.327.744-.895.78-1.136.017-.115.125-.668.299-1.123.19-.499.464-.774.464-.774z" fill="#6a6a6a"/>
            </svg>
        `;
    navbar.appendChild(homeLink);
    const newMenuContent = this.generateNewMenuContent();
    navbar.appendChild(createDropdown("New", newMenuContent));
    navbar.appendChild(createDropdown("Resources", `
            <div class="navmenu-column">
                <div class="navbar-link-internal" data-link="Instruments">Instruments</div>
                <div class="navbar-link-internal" data-link="Devices">Devices</div>
                <div class="navbar-link-internal" data-link="Chemicals">Chemicals</div>
                <div class="navbar-link-internal" data-link="Electrodes">Electrodes</div>
                <div class="navbar-link-internal" data-link="Cells">Cells</div>
            </div>
        `));
    navbar.appendChild(createDropdown("Help", `
            <div class="navmenu-column">
                <div class="navbar-link-internal" data-link="Obsidian ELN - Getting started">Getting Started Guide</div>
                <div class="navbar-link-internal" data-link="Markdown Formatting Guide">Markdown Formatting Guide</div>
                <div class="navbar-link-internal" data-link="Obsidian Tutorial for Academic Writing">Tutorial for Academic Writing</div>
                <div class="navbar-link-internal" data-link="File Export">File Export</div>
            </div>
        `));
    navbarContainer.appendChild(navbar);
    this.registerNavbarLinkListeners(navbar);
  }
  /**
   * Generate dynamic content for the "New" menu based on settings
   */
  generateNewMenuContent() {
    const { navbar, note } = this.plugin.settings;
    const groupedNoteTypes = {};
    navbar.groups.forEach((group) => {
      groupedNoteTypes[group.id] = [];
    });
    Object.entries(note).forEach(([noteType, config]) => {
      if (config.commands.enabled && config.navbar.display && groupedNoteTypes[config.navbar.group]) {
        groupedNoteTypes[config.navbar.group].push({
          noteType,
          navbar: config.navbar,
          commands: config.commands
        });
      }
    });
    const columns = navbar.groups.sort((a, b) => a.order - b.order).filter((group) => groupedNoteTypes[group.id].length > 0).map((group) => {
      const items = groupedNoteTypes[group.id].map(
        ({ noteType, navbar: navbar2 }) => `<div class="navbar-link-internal" data-action="new_${noteType}">${navbar2.name}</div>`
      ).join("");
      return `
                    <div class="navmenu-column">
                        <h3>${group.name}</h3>
                        ${items}
                    </div>
                `;
    }).join("");
    return columns;
  }
  // Add event listener for all navbar links
  registerNavbarLinkListeners(navbar) {
    const navbarLinks = navbar.querySelectorAll(".navbar-link-internal");
    navbarLinks.forEach((link) => {
      if (!link.hasAttribute("data-listener-registered")) {
        link.addEventListener("click", async (event) => {
          const action = event.currentTarget.getAttribute("data-action");
          const linkAttr = event.currentTarget.getAttribute("data-link");
          if (action) {
            if (action.startsWith("new_")) {
              const noteType = action.replace("new_", "");
              const config = this.plugin.settings.note[noteType];
              if (config && config.commands.enabled) {
                console.log(`Creating new ${config.navbar.name}...`);
                new import_obsidian38.Notice(`Creating new ${config.navbar.name}...`);
                try {
                  const newNote = new NewNote(this.plugin);
                  await newNote.create({
                    noteType
                  });
                } catch (error) {
                  console.error(`Error creating ${config.navbar.name}:`, error);
                  new import_obsidian38.Notice(`Error creating ${config.navbar.name}: ${error}`);
                }
              } else {
                new import_obsidian38.Notice(`Unknown note type: ${noteType}`);
                console.error(`Unknown note type: ${noteType}`);
              }
            } else {
              new import_obsidian38.Notice(`Unknown action: ${action}`);
              console.log(`Unknown action: ${action}`);
            }
          } else if (linkAttr) {
            console.log(`Navigating to: ${linkAttr}`);
            this.app.workspace.openLinkText(linkAttr, "", false);
          }
        });
        link.setAttribute("data-listener-registered", "true");
      }
    });
  }
};

// src/events/activeLeafChange.ts
function handleActiveLeafChange(app, plugin) {
  const activeLeaf = app.workspace.getLeaf();
  if (activeLeaf && activeLeaf.view instanceof import_obsidian39.MarkdownView && activeLeaf.view.file !== plugin.lastActiveFile) {
    addNavbar(app, plugin, activeLeaf);
    plugin.lastActiveFile = activeLeaf.view.file;
  }
}
function addNavbar(app, plugin, leaf) {
  var _a;
  const view = leaf.view;
  if (view instanceof import_obsidian39.MarkdownView && view.file) {
    const frontmatter = (_a = app.metadataCache.getFileCache(view.file)) == null ? void 0 : _a.frontmatter;
    let renderNavbar = plugin.settings.navbar.enabled;
    if (frontmatter && frontmatter.navbar !== void 0) {
      renderNavbar = frontmatter.navbar;
    }
    if (renderNavbar) {
      const navbar = new Navbar(app, plugin);
      navbar.init();
    }
  } else if (view.getViewType() === "empty") {
    if (plugin.settings.navbar.enabled) {
      const navbar = new Navbar(app, plugin);
      navbar.init();
    }
  }
}

// src/utils/parsers/parseNpeCodeBlockParams.ts
function parseNpeCodeBlockParams(source) {
  var _a, _b, _c;
  const lines = source.split("\n");
  const params = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("key:")) params.key = line.slice(4).trim();
    if (line.startsWith("excludeKeys:")) params.excludeKeys = line.slice(12).split(",").map((s) => s.trim()).filter(Boolean);
    if (line.startsWith("actionButtons:")) params.actionButtons = line.slice(14).trim().toLowerCase() !== "false";
    if (line.startsWith("cssclasses:")) params.cssclasses = line.slice(11).split(",").map((s) => s.trim()).filter(Boolean);
  }
  return {
    key: params.key,
    excludeKeys: (_a = params.excludeKeys) != null ? _a : [],
    actionButtons: (_b = params.actionButtons) != null ? _b : true,
    cssclasses: (_c = params.cssclasses) != null ? _c : []
  };
}

// src/ui/views/DailyNoteNav.ts
var import_obsidian40 = require("obsidian");
var DailyNoteNav = class extends import_obsidian40.MarkdownRenderChild {
  constructor(app, containerEl, source = "") {
    super(containerEl);
    this.app = app;
    this.source = source;
  }
  onload() {
    this.renderNav();
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        this.renderNav();
      })
    );
  }
  renderNav() {
    this.containerEl.empty();
    const dailyNotes = this.getSortedDailyNotes();
    if (!dailyNotes.length) return;
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) return;
    const index = dailyNotes.findIndex((f) => f.basename === activeFile.basename);
    const firstIdx = 0;
    const lastIdx = dailyNotes.length - 1;
    const prevIdx = index - 1;
    const nextIdx = index + 1;
    const nav = this.containerEl.createDiv({ cls: "daily-note-nav-container" });
    nav.appendChild(this.createNavButton(
      firstIdx !== index ? dailyNotes[firstIdx] : null,
      "\xAB",
      "daily-note-nav-button"
    ));
    nav.appendChild(this.createNavButton(
      prevIdx >= 0 && prevIdx !== index ? dailyNotes[prevIdx] : null,
      "\u2039",
      "daily-note-nav-button"
    ));
    nav.appendChild(this.createNavButton(
      nextIdx <= lastIdx && nextIdx !== index ? dailyNotes[nextIdx] : null,
      "\u203A",
      "daily-note-nav-button"
    ));
    nav.appendChild(this.createNavButton(
      lastIdx !== index ? dailyNotes[lastIdx] : null,
      "\xBB",
      "daily-note-nav-button"
    ));
  }
  getSortedDailyNotes() {
    const files = this.app.vault.getMarkdownFiles();
    return files.filter((f) => {
      var _a;
      const cache = this.app.metadataCache.getFileCache(f);
      const tags = ((_a = cache == null ? void 0 : cache.tags) == null ? void 0 : _a.map((t) => t.tag)) || [];
      return tags.includes("#daily-note") || f.path.toLowerCase().includes("daily");
    }).sort((a, b) => a.stat.ctime - b.stat.ctime);
  }
  createNavButton(file, label, cls) {
    const btn = document.createElement("div");
    btn.className = cls;
    if (file) {
      const a = document.createElement("a");
      a.href = file.path;
      a.setAttr("data-href", file.path);
      a.className = "internal-link";
      a.rel = "noopener";
      a.textContent = label;
      btn.appendChild(a);
    } else {
      const span = document.createElement("span");
      span.textContent = label;
      btn.appendChild(span);
    }
    return btn;
  }
};

// src/ui/views/ChemLinks.ts
var import_obsidian41 = require("obsidian");
var ChemLinks = class extends import_obsidian41.MarkdownRenderChild {
  constructor(app, containerEl, sourcePath) {
    super(containerEl);
    this.app = app;
    this.sourcePath = sourcePath;
  }
  onload() {
    this.renderLinks();
  }
  renderLinks() {
    var _a, _b, _c, _d;
    this.containerEl.empty();
    const file = this.app.vault.getAbstractFileByPath(this.sourcePath);
    if (!(file instanceof import_obsidian41.TFile)) return;
    const cache = this.app.metadataCache.getFileCache(file);
    const frontmatter = cache == null ? void 0 : cache.frontmatter;
    let cas_number = (_b = (_a = frontmatter == null ? void 0 : frontmatter.chemical) == null ? void 0 : _a.CAS) != null ? _b : "";
    if (typeof cas_number !== "string") {
      cas_number = (_d = (_c = cas_number == null ? void 0 : cas_number.toString) == null ? void 0 : _c.call(cas_number)) != null ? _d : "";
    }
    const cas_is_valid = /^\d{2,7}-\d{2}-\d$/.test(cas_number);
    let html = "";
    if (cas_is_valid) {
      html = `<h4>Chem Links</h4>
<ul>
  <li><a href="https://www.sigmaaldrich.com/DE/de/search/${cas_number}?focus=products&page=1&perpage=30&sort=relevance&term=${cas_number}&type=product" target="_blank" rel="noopener">Sigma-Aldrich</a></li>
  <li><a href="https://de.vwr.com/store/product?casNum=${cas_number}" target="_blank" rel="noopener">VWR (Germany)</a></li>
  <li><a href="https://www.thermofisher.com/search/cas/${cas_number}" target="_blank" rel="noopener">ThermoFisher Scientific</a></li>
  <li><a href="https://www.chemicalbook.com/Search_EN.aspx?keyword=${cas_number}" target="_blank" rel="noopener">ChemicalBook</a></li>
  <li><a href="https://www.chemspider.com/Search.aspx?q=${cas_number}" target="_blank" rel="noopener">ChemSpider</a></li>
  <li><a href="https://pubchem.ncbi.nlm.nih.gov/#query=${cas_number}" target="_blank" rel="noopener">PubChem</a></li>
  <li><a href="https://abcr.com/de_de/catalogsearch/advanced/result/?cas=${cas_number}" target="_blank" rel="noopener">abcr</a></li>
  <li><a href="https://www.google.com/search?rls=en&q=cas+${cas_number}" target="_blank" rel="noopener">Google</a></li>
  <li><a href="https://en.wikipedia.org/w/index.php?search=cas+${cas_number}" target="_blank" rel="noopener">Wikipedia</a></li>
</ul>`;
    } else {
      html = `<h4>Chem Links</h4>
<p>Chem Links provide a convenient way to search chemical databases from Sigma-Aldrich, VWR,
ThermoFisher Scientific, ChemicalBook, ChemSpider, PubChem, abcr, Google, and Wikipedia based on the CAS number of the substance.</p>
<p>This information is displayed, because either the CAS number is not available or the CAS number is not in the correct format.</p>
<p>To view the Chem-Links enter a valid CAS number in the metadata section with following format: 12345-67-8</p>`;
    }
    this.containerEl.insertAdjacentHTML("beforeend", html);
  }
};

// src/ui/views/PeriodicTableView.ts
var import_obsidian42 = require("obsidian");

// src/data/elements.ts
var elements = {
  "H": {
    "name": "Hydrogen",
    "atomicNumber": 1,
    "group": 1,
    "groupName": "nonmetal",
    "period": 1,
    "atomicMass": 1.008,
    "stability": "Stable",
    "isotopes": [
      "H-1",
      "H-2 (Deuterium)",
      "H-3 (Tritium)"
    ],
    "electronegativity": 2.2,
    "ionizationEnergies": [
      13.598
    ],
    "xrayAbsorptionEnergies": {
      "K": 13.6
    },
    "xrayEmissionEnergies": {}
  },
  "He": {
    "name": "Helium",
    "atomicNumber": 2,
    "group": 18,
    "groupName": "noble gas",
    "period": 1,
    "atomicMass": 4.0026,
    "stability": "Stable",
    "isotopes": [
      "He-3",
      "He-4"
    ],
    "electronegativity": null,
    "ionizationEnergies": [
      24.587
    ],
    "xrayAbsorptionEnergies": {
      "K": 24.6
    },
    "xrayEmissionEnergies": {}
  },
  "Li": {
    "name": "Lithium",
    "atomicNumber": 3,
    "group": 1,
    "groupName": "alkali metal",
    "period": 2,
    "atomicMass": 6.94,
    "stability": "Stable",
    "isotopes": [
      "Li-6",
      "Li-7"
    ],
    "electronegativity": 0.98,
    "ionizationEnergies": [
      5.391
    ],
    "xrayAbsorptionEnergies": {
      "K": 54.7
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 52,
      "K\u03B2": 59
    }
  },
  "Be": {
    "name": "Beryllium",
    "atomicNumber": 4,
    "group": 2,
    "groupName": "alkaline earth metal",
    "period": 2,
    "atomicMass": 9.0122,
    "stability": "Stable",
    "isotopes": [
      "Be-9"
    ],
    "electronegativity": 1.57,
    "ionizationEnergies": [
      9.322
    ],
    "xrayAbsorptionEnergies": {
      "K": 111.5
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 108.5,
      "K\u03B2": 118
    }
  },
  "B": {
    "name": "Boron",
    "atomicNumber": 5,
    "group": 13,
    "groupName": "metalloid",
    "period": 2,
    "atomicMass": 10.81,
    "stability": "Stable",
    "isotopes": [
      "B-10",
      "B-11"
    ],
    "electronegativity": 2.04,
    "ionizationEnergies": [
      8.298
    ],
    "xrayAbsorptionEnergies": {
      "K": 183.3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 174,
      "K\u03B2": 192
    }
  },
  "C": {
    "name": "Carbon",
    "atomicNumber": 6,
    "group": 14,
    "groupName": "nonmetal",
    "period": 2,
    "atomicMass": 12.011,
    "stability": "Stable",
    "isotopes": [
      "C-12",
      "C-13",
      "C-14"
    ],
    "electronegativity": 2.55,
    "ionizationEnergies": [
      11.26
    ],
    "xrayAbsorptionEnergies": {
      "K": 284.2
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 277,
      "K\u03B2": 300
    }
  },
  "N": {
    "name": "Nitrogen",
    "atomicNumber": 7,
    "group": 15,
    "groupName": "nonmetal",
    "period": 2,
    "atomicMass": 14.007,
    "stability": "Stable",
    "isotopes": [
      "N-14",
      "N-15"
    ],
    "electronegativity": 3.04,
    "ionizationEnergies": [
      14.534
    ],
    "xrayAbsorptionEnergies": {
      "K": 409.9
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 392,
      "K\u03B2": 426
    }
  },
  "O": {
    "name": "Oxygen",
    "atomicNumber": 8,
    "group": 16,
    "groupName": "nonmetal",
    "period": 2,
    "atomicMass": 15.999,
    "stability": "Stable",
    "isotopes": [
      "O-16",
      "O-17",
      "O-18"
    ],
    "electronegativity": 3.44,
    "ionizationEnergies": [
      13.618
    ],
    "xrayAbsorptionEnergies": {
      "K": 543.1
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 525,
      "K\u03B2": 559
    }
  },
  "F": {
    "name": "Fluorine",
    "atomicNumber": 9,
    "group": 17,
    "groupName": "halogen",
    "period": 2,
    "atomicMass": 18.998,
    "stability": "Stable",
    "isotopes": [
      "F-19"
    ],
    "electronegativity": 3.98,
    "ionizationEnergies": [
      17.423
    ],
    "xrayAbsorptionEnergies": {
      "K": 696.7
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 677,
      "K\u03B2": 722
    }
  },
  "Ne": {
    "name": "Neon",
    "atomicNumber": 10,
    "group": 18,
    "groupName": "noble gas",
    "period": 2,
    "atomicMass": 20.18,
    "stability": "Stable",
    "isotopes": [
      "Ne-20",
      "Ne-21",
      "Ne-22"
    ],
    "electronegativity": null,
    "ionizationEnergies": [
      21.564
    ],
    "xrayAbsorptionEnergies": {
      "K": 870.2
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 848,
      "K\u03B2": 905
    }
  },
  "Na": {
    "name": "Sodium",
    "atomicNumber": 11,
    "group": 1,
    "groupName": "alkali metal",
    "period": 3,
    "atomicMass": 22.99,
    "stability": "Stable",
    "isotopes": [
      "Na-23"
    ],
    "electronegativity": 0.93,
    "ionizationEnergies": [
      5.139
    ],
    "xrayAbsorptionEnergies": {
      "K": 1070.8
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 1040,
      "K\u03B2": 1075
    }
  },
  "Mg": {
    "name": "Magnesium",
    "atomicNumber": 12,
    "group": 2,
    "groupName": "alkaline earth metal",
    "period": 3,
    "atomicMass": 24.305,
    "stability": "Stable",
    "isotopes": [
      "Mg-24",
      "Mg-25",
      "Mg-26"
    ],
    "electronegativity": 1.31,
    "ionizationEnergies": [
      7.646
    ],
    "xrayAbsorptionEnergies": {
      "K": 1303
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 1253,
      "K\u03B2": 1303
    }
  },
  "Al": {
    "name": "Aluminum",
    "atomicNumber": 13,
    "group": 13,
    "groupName": "post-transition metal",
    "period": 3,
    "atomicMass": 26.982,
    "stability": "Stable",
    "isotopes": [
      "Al-27"
    ],
    "electronegativity": 1.61,
    "ionizationEnergies": [
      5.986
    ],
    "xrayAbsorptionEnergies": {
      "K": 1559
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 1486,
      "K\u03B2": 1559
    }
  },
  "Si": {
    "name": "Silicon",
    "atomicNumber": 14,
    "group": 14,
    "groupName": "metalloid",
    "period": 3,
    "atomicMass": 28.085,
    "stability": "Stable",
    "isotopes": [
      "Si-28",
      "Si-29",
      "Si-30"
    ],
    "electronegativity": 1.9,
    "ionizationEnergies": [
      8.151
    ],
    "xrayAbsorptionEnergies": {
      "K": 1839
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 1739,
      "K\u03B2": 1839
    }
  },
  "P": {
    "name": "Phosphorus",
    "atomicNumber": 15,
    "group": 15,
    "groupName": "nonmetal",
    "period": 3,
    "atomicMass": 30.974,
    "stability": "Stable",
    "isotopes": [
      "P-31"
    ],
    "electronegativity": 2.19,
    "ionizationEnergies": [
      10.487
    ],
    "xrayAbsorptionEnergies": {
      "K": 2145.5
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 2010,
      "K\u03B2": 2145
    }
  },
  "S": {
    "name": "Sulfur",
    "atomicNumber": 16,
    "group": 16,
    "groupName": "nonmetal",
    "period": 3,
    "atomicMass": 32.06,
    "stability": "Stable",
    "isotopes": [
      "S-32",
      "S-33",
      "S-34",
      "S-36"
    ],
    "electronegativity": 2.58,
    "ionizationEnergies": [
      10.36
    ],
    "xrayAbsorptionEnergies": {
      "K": 2472
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 2307,
      "K\u03B2": 2472
    }
  },
  "Cl": {
    "name": "Chlorine",
    "atomicNumber": 17,
    "group": 17,
    "groupName": "halogen",
    "period": 3,
    "atomicMass": 35.45,
    "stability": "Stable",
    "isotopes": [
      "Cl-35",
      "Cl-37"
    ],
    "electronegativity": 3.16,
    "ionizationEnergies": [
      12.967
    ],
    "xrayAbsorptionEnergies": {
      "K": 2822
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 2622,
      "K\u03B2": 2822
    }
  },
  "Ar": {
    "name": "Argon",
    "atomicNumber": 18,
    "group": 18,
    "groupName": "noble gas",
    "period": 3,
    "atomicMass": 39.948,
    "stability": "Stable",
    "isotopes": [
      "Ar-36",
      "Ar-38",
      "Ar-40"
    ],
    "electronegativity": null,
    "ionizationEnergies": [
      15.76
    ],
    "xrayAbsorptionEnergies": {
      "K": 3205.9
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 2957,
      "K\u03B2": 3205
    }
  },
  "K": {
    "name": "Potassium",
    "atomicNumber": 19,
    "group": 1,
    "groupName": "alkali metal",
    "period": 4,
    "atomicMass": 39.098,
    "stability": "Stable",
    "isotopes": [
      "K-39",
      "K-40",
      "K-41"
    ],
    "electronegativity": 0.82,
    "ionizationEnergies": [
      4.341
    ],
    "xrayAbsorptionEnergies": {
      "K": 3608.4
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 3313,
      "K\u03B2": 3608
    }
  },
  "Ca": {
    "name": "Calcium",
    "atomicNumber": 20,
    "group": 2,
    "groupName": "alkaline earth metal",
    "period": 4,
    "atomicMass": 40.078,
    "stability": "Stable",
    "isotopes": [
      "Ca-40",
      "Ca-42",
      "Ca-43",
      "Ca-44",
      "Ca-46",
      "Ca-48"
    ],
    "electronegativity": 1,
    "ionizationEnergies": [
      6.113
    ],
    "xrayAbsorptionEnergies": {
      "K": 4038.5
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 3692,
      "K\u03B2": 4038
    }
  },
  "Sc": {
    "name": "Scandium",
    "atomicNumber": 21,
    "group": 3,
    "groupName": "transition metal",
    "period": 4,
    "atomicMass": 44.956,
    "stability": "Stable",
    "isotopes": [
      "Sc-45"
    ],
    "electronegativity": 1.36,
    "ionizationEnergies": [
      6.561
    ],
    "xrayAbsorptionEnergies": {
      "K": 4492
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 4102,
      "K\u03B2": 4492
    }
  },
  "Ti": {
    "name": "Titanium",
    "atomicNumber": 22,
    "group": 4,
    "groupName": "transition metal",
    "period": 4,
    "atomicMass": 47.867,
    "stability": "Stable",
    "isotopes": [
      "Ti-46",
      "Ti-47",
      "Ti-48",
      "Ti-49",
      "Ti-50"
    ],
    "electronegativity": 1.54,
    "ionizationEnergies": [
      6.828
    ],
    "xrayAbsorptionEnergies": {
      "K": 4966
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 4510,
      "K\u03B2": 4966
    }
  },
  "V": {
    "name": "Vanadium",
    "atomicNumber": 23,
    "group": 5,
    "groupName": "transition metal",
    "period": 4,
    "atomicMass": 50.942,
    "stability": "Stable",
    "isotopes": [
      "V-50",
      "V-51"
    ],
    "electronegativity": 1.63,
    "ionizationEnergies": [
      6.746
    ],
    "xrayAbsorptionEnergies": {
      "K": 5465
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 4950,
      "K\u03B2": 5465
    }
  },
  "Cr": {
    "name": "Chromium",
    "atomicNumber": 24,
    "group": 6,
    "groupName": "transition metal",
    "period": 4,
    "atomicMass": 51.996,
    "stability": "Stable",
    "isotopes": [
      "Cr-50",
      "Cr-52",
      "Cr-53",
      "Cr-54"
    ],
    "electronegativity": 1.66,
    "ionizationEnergies": [
      6.767
    ],
    "xrayAbsorptionEnergies": {
      "K": 5989
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 5415,
      "K\u03B2": 5989
    }
  },
  "Mn": {
    "name": "Manganese",
    "atomicNumber": 25,
    "group": 7,
    "groupName": "transition metal",
    "period": 4,
    "atomicMass": 54.938,
    "stability": "Stable",
    "isotopes": [
      "Mn-55"
    ],
    "electronegativity": 1.55,
    "ionizationEnergies": [
      7.434
    ],
    "xrayAbsorptionEnergies": {
      "K": 6539
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 5899,
      "K\u03B2": 6539
    }
  },
  "Fe": {
    "name": "Iron",
    "atomicNumber": 26,
    "group": 8,
    "groupName": "transition metal",
    "period": 4,
    "atomicMass": 55.845,
    "stability": "Stable",
    "isotopes": [
      "Fe-54",
      "Fe-56",
      "Fe-57",
      "Fe-58"
    ],
    "electronegativity": 1.83,
    "ionizationEnergies": [
      7.902
    ],
    "xrayAbsorptionEnergies": {
      "K": 7112
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 6403,
      "K\u03B2": 7058
    }
  },
  "Co": {
    "name": "Cobalt",
    "atomicNumber": 27,
    "group": 9,
    "groupName": "transition metal",
    "period": 4,
    "atomicMass": 58.933,
    "stability": "Stable",
    "isotopes": [
      "Co-59"
    ],
    "electronegativity": 1.88,
    "ionizationEnergies": [
      7.881
    ],
    "xrayAbsorptionEnergies": {
      "K": 7709
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 6930,
      "K\u03B2": 7709
    }
  },
  "Ni": {
    "name": "Nickel",
    "atomicNumber": 28,
    "group": 10,
    "groupName": "transition metal",
    "period": 4,
    "atomicMass": 58.693,
    "stability": "Stable",
    "isotopes": [
      "Ni-58",
      "Ni-60",
      "Ni-61",
      "Ni-62",
      "Ni-64"
    ],
    "electronegativity": 1.91,
    "ionizationEnergies": [
      7.64
    ],
    "xrayAbsorptionEnergies": {
      "K": 8333
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 7478,
      "K\u03B2": 8333
    }
  },
  "Cu": {
    "name": "Copper",
    "atomicNumber": 29,
    "group": 11,
    "groupName": "transition metal",
    "period": 4,
    "atomicMass": 63.546,
    "stability": "Stable",
    "isotopes": [
      "Cu-63",
      "Cu-65"
    ],
    "electronegativity": 1.9,
    "ionizationEnergies": [
      7.726
    ],
    "xrayAbsorptionEnergies": {
      "K": 8979
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 8047,
      "K\u03B2": 8979
    }
  },
  "Zn": {
    "name": "Zinc",
    "atomicNumber": 30,
    "group": 12,
    "groupName": "transition metal",
    "period": 4,
    "atomicMass": 65.38,
    "stability": "Stable",
    "isotopes": [
      "Zn-64",
      "Zn-66",
      "Zn-67",
      "Zn-68",
      "Zn-70"
    ],
    "electronegativity": 1.65,
    "ionizationEnergies": [
      9.394
    ],
    "xrayAbsorptionEnergies": {
      "K": 9659
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 8638,
      "K\u03B2": 9659
    }
  },
  "Ga": {
    "name": "Gallium",
    "atomicNumber": 31,
    "group": 13,
    "groupName": "post-transition metal",
    "period": 4,
    "atomicMass": 69.723,
    "stability": "Stable",
    "isotopes": [
      "Ga-69",
      "Ga-71"
    ],
    "electronegativity": 1.81,
    "ionizationEnergies": [
      5.999
    ],
    "xrayAbsorptionEnergies": {
      "K": 10367
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 9223,
      "K\u03B2": 10367
    }
  },
  "Ge": {
    "name": "Germanium",
    "atomicNumber": 32,
    "group": 14,
    "groupName": "metalloid",
    "period": 4,
    "atomicMass": 72.63,
    "stability": "Stable",
    "isotopes": [
      "Ge-70",
      "Ge-72",
      "Ge-73",
      "Ge-74",
      "Ge-76"
    ],
    "electronegativity": 2.01,
    "ionizationEnergies": [
      7.899
    ],
    "xrayAbsorptionEnergies": {
      "K": 11103
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 9886,
      "K\u03B2": 11103
    }
  },
  "As": {
    "name": "Arsenic",
    "atomicNumber": 33,
    "group": 15,
    "groupName": "metalloid",
    "period": 4,
    "atomicMass": 74.922,
    "stability": "Stable",
    "isotopes": [
      "As-75"
    ],
    "electronegativity": 2.18,
    "ionizationEnergies": [
      9.815
    ],
    "xrayAbsorptionEnergies": {
      "K": 11867
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 10544,
      "K\u03B2": 11867
    }
  },
  "Se": {
    "name": "Selenium",
    "atomicNumber": 34,
    "group": 16,
    "groupName": "nonmetal",
    "period": 4,
    "atomicMass": 78.971,
    "stability": "Stable",
    "isotopes": [
      "Se-74",
      "Se-76",
      "Se-77",
      "Se-78",
      "Se-80",
      "Se-82"
    ],
    "electronegativity": 2.55,
    "ionizationEnergies": [
      9.752
    ],
    "xrayAbsorptionEnergies": {
      "K": 12658
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 11225,
      "K\u03B2": 12658
    }
  },
  "Br": {
    "name": "Bromine",
    "atomicNumber": 35,
    "group": 17,
    "groupName": "halogen",
    "period": 4,
    "atomicMass": 79.904,
    "stability": "Stable",
    "isotopes": [
      "Br-79",
      "Br-81"
    ],
    "electronegativity": 2.96,
    "ionizationEnergies": [
      11.814
    ],
    "xrayAbsorptionEnergies": {
      "K": 13474
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 11925,
      "K\u03B2": 13474
    }
  },
  "Kr": {
    "name": "Krypton",
    "atomicNumber": 36,
    "group": 18,
    "groupName": "noble gas",
    "period": 4,
    "atomicMass": 83.798,
    "stability": "Stable",
    "isotopes": [
      "Kr-78",
      "Kr-80",
      "Kr-82",
      "Kr-83",
      "Kr-84",
      "Kr-86"
    ],
    "electronegativity": 3,
    "ionizationEnergies": [
      13.999
    ],
    "xrayAbsorptionEnergies": {
      "K": 14326
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 12658,
      "K\u03B2": 14326
    }
  },
  "Rb": {
    "name": "Rubidium",
    "atomicNumber": 37,
    "group": 1,
    "groupName": "alkali metal",
    "period": 5,
    "atomicMass": 85.468,
    "stability": "Stable",
    "isotopes": [
      "Rb-85",
      "Rb-87"
    ],
    "electronegativity": 0.82,
    "ionizationEnergies": [
      4.177
    ],
    "xrayAbsorptionEnergies": {
      "K": 15200
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 13390,
      "K\u03B2": 15200
    }
  },
  "Sr": {
    "name": "Strontium",
    "atomicNumber": 38,
    "group": 2,
    "groupName": "alkaline earth metal",
    "period": 5,
    "atomicMass": 87.62,
    "stability": "Stable",
    "isotopes": [
      "Sr-84",
      "Sr-86",
      "Sr-87",
      "Sr-88"
    ],
    "electronegativity": 0.95,
    "ionizationEnergies": [
      5.695
    ],
    "xrayAbsorptionEnergies": {
      "K": 16105
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 14100,
      "K\u03B2": 16105
    }
  },
  "Y": {
    "name": "Yttrium",
    "atomicNumber": 39,
    "group": 3,
    "groupName": "transition metal",
    "period": 5,
    "atomicMass": 88.906,
    "stability": "Stable",
    "isotopes": [
      "Y-89"
    ],
    "electronegativity": 1.22,
    "ionizationEnergies": [
      6.217
    ],
    "xrayAbsorptionEnergies": {
      "K": 17038
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 14900,
      "K\u03B2": 17038
    }
  },
  "Zr": {
    "name": "Zirconium",
    "atomicNumber": 40,
    "group": 4,
    "groupName": "transition metal",
    "period": 5,
    "atomicMass": 91.224,
    "stability": "Stable",
    "isotopes": [
      "Zr-90",
      "Zr-91",
      "Zr-92",
      "Zr-94",
      "Zr-96"
    ],
    "electronegativity": 1.33,
    "ionizationEnergies": [
      6.634
    ],
    "xrayAbsorptionEnergies": {
      "K": 17998
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 15800,
      "K\u03B2": 17998
    }
  },
  "Nb": {
    "name": "Niobium",
    "atomicNumber": 41,
    "group": 5,
    "groupName": "transition metal",
    "period": 5,
    "atomicMass": 92.906,
    "stability": "Stable",
    "isotopes": [
      "Nb-93"
    ],
    "electronegativity": 1.6,
    "ionizationEnergies": [
      6.759
    ],
    "xrayAbsorptionEnergies": {
      "K": 18986
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 16700,
      "K\u03B2": 18986
    }
  },
  "Mo": {
    "name": "Molybdenum",
    "atomicNumber": 42,
    "group": 6,
    "groupName": "transition metal",
    "period": 5,
    "atomicMass": 95.95,
    "stability": "Stable",
    "isotopes": [
      "Mo-92",
      "Mo-94",
      "Mo-95",
      "Mo-96",
      "Mo-97",
      "Mo-98",
      "Mo-100"
    ],
    "electronegativity": 2.16,
    "ionizationEnergies": [
      7.092
    ],
    "xrayAbsorptionEnergies": {
      "K": 2e4
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 17400,
      "K\u03B2": 2e4
    }
  },
  "Tc": {
    "name": "Technetium",
    "atomicNumber": 43,
    "group": 7,
    "groupName": "transition metal",
    "period": 5,
    "atomicMass": 98,
    "stability": "Radioactive",
    "isotopes": [
      "Tc-97",
      "Tc-98",
      "Tc-99"
    ],
    "electronegativity": 1.9,
    "ionizationEnergies": [
      7.28
    ],
    "xrayAbsorptionEnergies": {
      "K": 21044
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 18200,
      "K\u03B2": 21044
    }
  },
  "Ru": {
    "name": "Ruthenium",
    "atomicNumber": 44,
    "group": 8,
    "groupName": "transition metal",
    "period": 5,
    "atomicMass": 101.07,
    "stability": "Stable",
    "isotopes": [
      "Ru-96",
      "Ru-98",
      "Ru-99",
      "Ru-100",
      "Ru-101",
      "Ru-102",
      "Ru-104"
    ],
    "electronegativity": 2.2,
    "ionizationEnergies": [
      7.36
    ],
    "xrayAbsorptionEnergies": {
      "K": 22117
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 19200,
      "K\u03B2": 22117
    }
  },
  "Rh": {
    "name": "Rhodium",
    "atomicNumber": 45,
    "group": 9,
    "groupName": "transition metal",
    "period": 5,
    "atomicMass": 102.91,
    "stability": "Stable",
    "isotopes": [
      "Rh-103"
    ],
    "electronegativity": 2.28,
    "ionizationEnergies": [
      7.46
    ],
    "xrayAbsorptionEnergies": {
      "K": 23220
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 20200,
      "K\u03B2": 23220
    }
  },
  "Pd": {
    "name": "Palladium",
    "atomicNumber": 46,
    "group": 10,
    "groupName": "transition metal",
    "period": 5,
    "atomicMass": 106.42,
    "stability": "Stable",
    "isotopes": [
      "Pd-102",
      "Pd-104",
      "Pd-105",
      "Pd-106",
      "Pd-108",
      "Pd-110"
    ],
    "electronegativity": 2.2,
    "ionizationEnergies": [
      8.34
    ],
    "xrayAbsorptionEnergies": {
      "K": 24350
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 21400,
      "K\u03B2": 24350
    }
  },
  "Ag": {
    "name": "Silver",
    "atomicNumber": 47,
    "group": 11,
    "groupName": "transition metal",
    "period": 5,
    "atomicMass": 107.87,
    "stability": "Stable",
    "isotopes": [
      "Ag-107",
      "Ag-109"
    ],
    "electronegativity": 1.93,
    "ionizationEnergies": [
      7.576
    ],
    "xrayAbsorptionEnergies": {
      "K": 25514
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 22600,
      "K\u03B2": 25514
    }
  },
  "Cd": {
    "name": "Cadmium",
    "atomicNumber": 48,
    "group": 12,
    "groupName": "transition metal",
    "period": 5,
    "atomicMass": 112.41,
    "stability": "Stable",
    "isotopes": [
      "Cd-106",
      "Cd-108",
      "Cd-110",
      "Cd-111",
      "Cd-112",
      "Cd-113",
      "Cd-114",
      "Cd-116"
    ],
    "electronegativity": 1.69,
    "ionizationEnergies": [
      8.993
    ],
    "xrayAbsorptionEnergies": {
      "K": 26711
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 23900,
      "K\u03B2": 26711
    }
  },
  "In": {
    "name": "Indium",
    "atomicNumber": 49,
    "group": 13,
    "groupName": "post-transition metal",
    "period": 5,
    "atomicMass": 114.82,
    "stability": "Stable",
    "isotopes": [
      "In-113",
      "In-115"
    ],
    "electronegativity": 1.78,
    "ionizationEnergies": [
      5.786
    ],
    "xrayAbsorptionEnergies": {
      "K": 27940
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 25200,
      "K\u03B2": 27940
    }
  },
  "Sn": {
    "name": "Tin",
    "atomicNumber": 50,
    "group": 14,
    "groupName": "post-transition metal",
    "period": 5,
    "atomicMass": 118.71,
    "stability": "Stable",
    "isotopes": [
      "Sn-112",
      "Sn-114",
      "Sn-115",
      "Sn-116",
      "Sn-117",
      "Sn-118",
      "Sn-119",
      "Sn-120",
      "Sn-122",
      "Sn-124"
    ],
    "electronegativity": 1.96,
    "ionizationEnergies": [
      7.344
    ],
    "xrayAbsorptionEnergies": {
      "K": 29200
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 26500,
      "K\u03B2": 29200
    }
  },
  "Sb": {
    "name": "Antimony",
    "atomicNumber": 51,
    "group": 15,
    "groupName": "metalloid",
    "period": 5,
    "atomicMass": 121.76,
    "stability": "Stable",
    "isotopes": [
      "Sb-121",
      "Sb-123"
    ],
    "electronegativity": 2.05,
    "ionizationEnergies": [
      8.608
    ],
    "xrayAbsorptionEnergies": {
      "K": 30491
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 27600,
      "K\u03B2": 30491
    }
  },
  "Te": {
    "name": "Tellurium",
    "atomicNumber": 52,
    "group": 16,
    "groupName": "metalloid",
    "period": 5,
    "atomicMass": 127.6,
    "stability": "Stable",
    "isotopes": [
      "Te-120",
      "Te-122",
      "Te-123",
      "Te-124",
      "Te-125",
      "Te-126",
      "Te-128",
      "Te-130"
    ],
    "electronegativity": 2.1,
    "ionizationEnergies": [
      9.009
    ],
    "xrayAbsorptionEnergies": {
      "K": 31781
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 28700,
      "K\u03B2": 31781
    }
  },
  "I": {
    "name": "Iodine",
    "atomicNumber": 53,
    "group": 17,
    "groupName": "halogen",
    "period": 5,
    "atomicMass": 126.9,
    "stability": "Stable",
    "isotopes": [
      "I-127"
    ],
    "electronegativity": 2.66,
    "ionizationEnergies": [
      10.451
    ],
    "xrayAbsorptionEnergies": {
      "K": 33169
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 29800,
      "K\u03B2": 33169
    }
  },
  "Xe": {
    "name": "Xenon",
    "atomicNumber": 54,
    "group": 18,
    "groupName": "noble gas",
    "period": 5,
    "atomicMass": 131.29,
    "stability": "Stable",
    "isotopes": [
      "Xe-124",
      "Xe-126",
      "Xe-128",
      "Xe-129",
      "Xe-130",
      "Xe-131",
      "Xe-132",
      "Xe-134",
      "Xe-136"
    ],
    "electronegativity": 2.6,
    "ionizationEnergies": [
      12.13
    ],
    "xrayAbsorptionEnergies": {
      "K": 34649
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 31100,
      "K\u03B2": 34649
    }
  },
  "Cs": {
    "name": "Cesium",
    "atomicNumber": 55,
    "group": 1,
    "groupName": "alkali metal",
    "period": 6,
    "atomicMass": 132.91,
    "stability": "Stable",
    "isotopes": [
      "Cs-133"
    ],
    "electronegativity": 0.79,
    "ionizationEnergies": [
      3.894
    ],
    "xrayAbsorptionEnergies": {
      "K": 36199
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 32400,
      "K\u03B2": 36199
    }
  },
  "Ba": {
    "name": "Barium",
    "atomicNumber": 56,
    "group": 2,
    "groupName": "alkaline earth metal",
    "period": 6,
    "atomicMass": 137.33,
    "stability": "Stable",
    "isotopes": [
      "Ba-130",
      "Ba-132",
      "Ba-134",
      "Ba-135",
      "Ba-136",
      "Ba-137",
      "Ba-138"
    ],
    "electronegativity": 0.89,
    "ionizationEnergies": [
      5.212
    ],
    "xrayAbsorptionEnergies": {
      "K": 37815
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 33800,
      "K\u03B2": 37815
    }
  },
  "La": {
    "name": "Lanthanum",
    "atomicNumber": 57,
    "group": "La-1",
    "groupName": "lanthanide",
    "period": 6,
    "atomicMass": 138.91,
    "stability": "Stable",
    "isotopes": [
      "La-138",
      "La-139"
    ],
    "electronegativity": 1.1,
    "ionizationEnergies": [
      5.577
    ],
    "xrayAbsorptionEnergies": {
      "K": 39400
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 35200,
      "K\u03B2": 39400
    }
  },
  "Ce": {
    "name": "Cerium",
    "atomicNumber": 58,
    "group": "La-2",
    "groupName": "lanthanide",
    "period": 6,
    "atomicMass": 140.12,
    "stability": "Stable",
    "isotopes": [
      "Ce-136",
      "Ce-138",
      "Ce-140",
      "Ce-142"
    ],
    "electronegativity": 1.12,
    "ionizationEnergies": [
      5.538
    ],
    "xrayAbsorptionEnergies": {
      "K": 41e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 36600,
      "K\u03B2": 41e3
    }
  },
  "Pr": {
    "name": "Praseodymium",
    "atomicNumber": 59,
    "group": "La-3",
    "groupName": "lanthanide",
    "period": 6,
    "atomicMass": 140.91,
    "stability": "Stable",
    "isotopes": [
      "Pr-141"
    ],
    "electronegativity": 1.13,
    "ionizationEnergies": [
      5.473
    ],
    "xrayAbsorptionEnergies": {
      "K": 42700
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 38e3,
      "K\u03B2": 42700
    }
  },
  "Nd": {
    "name": "Neodymium",
    "atomicNumber": 60,
    "group": "La-4",
    "groupName": "lanthanide",
    "period": 6,
    "atomicMass": 144.24,
    "stability": "Stable",
    "isotopes": [
      "Nd-142",
      "Nd-143",
      "Nd-144",
      "Nd-145",
      "Nd-146",
      "Nd-148",
      "Nd-150"
    ],
    "electronegativity": 1.14,
    "ionizationEnergies": [
      5.525
    ],
    "xrayAbsorptionEnergies": {
      "K": 44400
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 39500,
      "K\u03B2": 44400
    }
  },
  "Pm": {
    "name": "Promethium",
    "atomicNumber": 61,
    "group": "La-5",
    "groupName": "lanthanide",
    "period": 6,
    "atomicMass": 145,
    "stability": "Radioactive",
    "isotopes": [
      "Pm-145"
    ],
    "electronegativity": 1.13,
    "ionizationEnergies": [
      5.582
    ],
    "xrayAbsorptionEnergies": {
      "K": 46100
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 41e3,
      "K\u03B2": 46100
    }
  },
  "Sm": {
    "name": "Samarium",
    "atomicNumber": 62,
    "group": "La-6",
    "groupName": "lanthanide",
    "period": 6,
    "atomicMass": 150.36,
    "stability": "Stable",
    "isotopes": [
      "Sm-144",
      "Sm-147",
      "Sm-148",
      "Sm-149",
      "Sm-150",
      "Sm-152",
      "Sm-154"
    ],
    "electronegativity": 1.17,
    "ionizationEnergies": [
      5.643
    ],
    "xrayAbsorptionEnergies": {
      "K": 47800
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 42500,
      "K\u03B2": 47800
    }
  },
  "Eu": {
    "name": "Europium",
    "atomicNumber": 63,
    "group": "La-7",
    "groupName": "lanthanide",
    "period": 6,
    "atomicMass": 151.96,
    "stability": "Stable",
    "isotopes": [
      "Eu-151",
      "Eu-153"
    ],
    "electronegativity": 1.2,
    "ionizationEnergies": [
      5.67
    ],
    "xrayAbsorptionEnergies": {
      "K": 49600
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 44e3,
      "K\u03B2": 49600
    }
  },
  "Gd": {
    "name": "Gadolinium",
    "atomicNumber": 64,
    "group": "La-8",
    "groupName": "lanthanide",
    "period": 6,
    "atomicMass": 157.25,
    "stability": "Stable",
    "isotopes": [
      "Gd-152",
      "Gd-154",
      "Gd-155",
      "Gd-156",
      "Gd-157",
      "Gd-158",
      "Gd-160"
    ],
    "electronegativity": 1.2,
    "ionizationEnergies": [
      6.15
    ],
    "xrayAbsorptionEnergies": {
      "K": 51400
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 45500,
      "K\u03B2": 51400
    }
  },
  "Tb": {
    "name": "Terbium",
    "atomicNumber": 65,
    "group": "La-9",
    "groupName": "lanthanide",
    "period": 6,
    "atomicMass": 158.93,
    "stability": "Stable",
    "isotopes": [
      "Tb-159"
    ],
    "electronegativity": 1.2,
    "ionizationEnergies": [
      5.863
    ],
    "xrayAbsorptionEnergies": {
      "K": 53300
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 47e3,
      "K\u03B2": 53300
    }
  },
  "Dy": {
    "name": "Dysprosium",
    "atomicNumber": 66,
    "group": "La-10",
    "groupName": "lanthanide",
    "period": 6,
    "atomicMass": 162.5,
    "stability": "Stable",
    "isotopes": [
      "Dy-156",
      "Dy-158",
      "Dy-160",
      "Dy-161",
      "Dy-162",
      "Dy-163",
      "Dy-164"
    ],
    "electronegativity": 1.22,
    "ionizationEnergies": [
      5.938
    ],
    "xrayAbsorptionEnergies": {
      "K": 55200
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 48500,
      "K\u03B2": 55200
    }
  },
  "Ho": {
    "name": "Holmium",
    "atomicNumber": 67,
    "group": "La-11",
    "groupName": "lanthanide",
    "period": 6,
    "atomicMass": 164.93,
    "stability": "Stable",
    "isotopes": [
      "Ho-165"
    ],
    "electronegativity": 1.23,
    "ionizationEnergies": [
      6.022
    ],
    "xrayAbsorptionEnergies": {
      "K": 57100
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 5e4,
      "K\u03B2": 57100
    }
  },
  "Er": {
    "name": "Erbium",
    "atomicNumber": 68,
    "group": "La-12",
    "groupName": "lanthanide",
    "period": 6,
    "atomicMass": 167.26,
    "stability": "Stable",
    "isotopes": [
      "Er-162",
      "Er-164",
      "Er-166",
      "Er-167",
      "Er-168",
      "Er-170"
    ],
    "electronegativity": 1.24,
    "ionizationEnergies": [
      6.108
    ],
    "xrayAbsorptionEnergies": {
      "K": 59e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 51500,
      "K\u03B2": 59e3
    }
  },
  "Tm": {
    "name": "Thulium",
    "atomicNumber": 69,
    "group": "La-13",
    "groupName": "lanthanide",
    "period": 6,
    "atomicMass": 168.93,
    "stability": "Stable",
    "isotopes": [
      "Tm-169"
    ],
    "electronegativity": 1.25,
    "ionizationEnergies": [
      6.184
    ],
    "xrayAbsorptionEnergies": {
      "K": 61e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 53e3,
      "K\u03B2": 61e3
    }
  },
  "Yb": {
    "name": "Ytterbium",
    "atomicNumber": 70,
    "group": "La-14",
    "groupName": "lanthanide",
    "period": 6,
    "atomicMass": 173.05,
    "stability": "Stable",
    "isotopes": [
      "Yb-168",
      "Yb-170",
      "Yb-171",
      "Yb-172",
      "Yb-173",
      "Yb-174",
      "Yb-176"
    ],
    "electronegativity": 1.1,
    "ionizationEnergies": [
      6.254
    ],
    "xrayAbsorptionEnergies": {
      "K": 63e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 54500,
      "K\u03B2": 63e3
    }
  },
  "Lu": {
    "name": "Lutetium",
    "atomicNumber": 71,
    "group": "La-15",
    "groupName": "lanthanide",
    "period": 6,
    "atomicMass": 174.97,
    "stability": "Stable",
    "isotopes": [
      "Lu-175",
      "Lu-176"
    ],
    "electronegativity": 1.27,
    "ionizationEnergies": [
      5.426
    ],
    "xrayAbsorptionEnergies": {
      "K": 65100
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 56e3,
      "K\u03B2": 65100
    }
  },
  "Hf": {
    "name": "Hafnium",
    "atomicNumber": 72,
    "group": 4,
    "groupName": "transition metal",
    "period": 6,
    "atomicMass": 178.49,
    "stability": "Stable",
    "isotopes": [
      "Hf-174",
      "Hf-176",
      "Hf-177",
      "Hf-178",
      "Hf-179",
      "Hf-180"
    ],
    "electronegativity": 1.3,
    "ionizationEnergies": [
      6.825
    ],
    "xrayAbsorptionEnergies": {
      "K": 68400
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 59e3,
      "K\u03B2": 68400
    }
  },
  "Ta": {
    "name": "Tantalum",
    "atomicNumber": 73,
    "group": 5,
    "groupName": "transition metal",
    "period": 6,
    "atomicMass": 180.95,
    "stability": "Stable",
    "isotopes": [
      "Ta-180",
      "Ta-181"
    ],
    "electronegativity": 1.5,
    "ionizationEnergies": [
      7.549
    ],
    "xrayAbsorptionEnergies": {
      "K": 71800
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 62e3,
      "K\u03B2": 71800
    }
  },
  "W": {
    "name": "Tungsten",
    "atomicNumber": 74,
    "group": 6,
    "groupName": "transition metal",
    "period": 6,
    "atomicMass": 183.84,
    "stability": "Stable",
    "isotopes": [
      "W-180",
      "W-182",
      "W-183",
      "W-184",
      "W-186"
    ],
    "electronegativity": 2.36,
    "ionizationEnergies": [
      7.864
    ],
    "xrayAbsorptionEnergies": {
      "K": 75300
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 65e3,
      "K\u03B2": 75300
    }
  },
  "Re": {
    "name": "Rhenium",
    "atomicNumber": 75,
    "group": 7,
    "groupName": "transition metal",
    "period": 6,
    "atomicMass": 186.21,
    "stability": "Stable",
    "isotopes": [
      "Re-185",
      "Re-187"
    ],
    "electronegativity": 1.9,
    "ionizationEnergies": [
      7.833
    ],
    "xrayAbsorptionEnergies": {
      "K": 78900
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 68e3,
      "K\u03B2": 78900
    }
  },
  "Os": {
    "name": "Osmium",
    "atomicNumber": 76,
    "group": 8,
    "groupName": "transition metal",
    "period": 6,
    "atomicMass": 190.23,
    "stability": "Stable",
    "isotopes": [
      "Os-184",
      "Os-186",
      "Os-187",
      "Os-188",
      "Os-189",
      "Os-190",
      "Os-192"
    ],
    "electronegativity": 2.2,
    "ionizationEnergies": [
      8.438
    ],
    "xrayAbsorptionEnergies": {
      "K": 82600
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 71e3,
      "K\u03B2": 82600
    }
  },
  "Ir": {
    "name": "Iridium",
    "atomicNumber": 77,
    "group": 9,
    "groupName": "transition metal",
    "period": 6,
    "atomicMass": 192.22,
    "stability": "Stable",
    "isotopes": [
      "Ir-191",
      "Ir-193"
    ],
    "electronegativity": 2.2,
    "ionizationEnergies": [
      8.967
    ],
    "xrayAbsorptionEnergies": {
      "K": 86400
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 74e3,
      "K\u03B2": 86400
    }
  },
  "Pt": {
    "name": "Platinum",
    "atomicNumber": 78,
    "group": 10,
    "groupName": "transition metal",
    "period": 6,
    "atomicMass": 195.08,
    "stability": "Stable",
    "isotopes": [
      "Pt-190",
      "Pt-192",
      "Pt-194",
      "Pt-195",
      "Pt-196",
      "Pt-198"
    ],
    "electronegativity": 2.28,
    "ionizationEnergies": [
      8.958
    ],
    "xrayAbsorptionEnergies": {
      "K": 90300
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 77e3,
      "K\u03B2": 90300
    }
  },
  "Au": {
    "name": "Gold",
    "atomicNumber": 79,
    "group": 11,
    "groupName": "transition metal",
    "period": 6,
    "atomicMass": 196.97,
    "stability": "Stable",
    "isotopes": [
      "Au-197"
    ],
    "electronegativity": 2.54,
    "ionizationEnergies": [
      9.225
    ],
    "xrayAbsorptionEnergies": {
      "K": 94200
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 8e4,
      "K\u03B2": 94200
    }
  },
  "Hg": {
    "name": "Mercury",
    "atomicNumber": 80,
    "group": 12,
    "groupName": "transition metal",
    "period": 6,
    "atomicMass": 200.59,
    "stability": "Stable",
    "isotopes": [
      "Hg-196",
      "Hg-198",
      "Hg-199",
      "Hg-200",
      "Hg-201",
      "Hg-202",
      "Hg-204"
    ],
    "electronegativity": 2,
    "ionizationEnergies": [
      10.437
    ],
    "xrayAbsorptionEnergies": {
      "K": 98300
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 83e3,
      "K\u03B2": 98300
    }
  },
  "Tl": {
    "name": "Thallium",
    "atomicNumber": 81,
    "group": 13,
    "groupName": "post-transition metal",
    "period": 6,
    "atomicMass": 204.38,
    "stability": "Stable",
    "isotopes": [
      "Tl-203",
      "Tl-205"
    ],
    "electronegativity": 1.62,
    "ionizationEnergies": [
      6.108
    ],
    "xrayAbsorptionEnergies": {
      "K": 102700
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 87e3,
      "K\u03B2": 102700
    }
  },
  "Pb": {
    "name": "Lead",
    "atomicNumber": 82,
    "group": 14,
    "groupName": "post-transition metal",
    "period": 6,
    "atomicMass": 207.2,
    "stability": "Stable",
    "isotopes": [
      "Pb-204",
      "Pb-206",
      "Pb-207",
      "Pb-208"
    ],
    "electronegativity": 2.33,
    "ionizationEnergies": [
      7.417
    ],
    "xrayAbsorptionEnergies": {
      "K": 105800
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 88e3,
      "K\u03B2": 105800
    }
  },
  "Bi": {
    "name": "Bismuth",
    "atomicNumber": 83,
    "group": 15,
    "groupName": "post-transition metal",
    "period": 6,
    "atomicMass": 208.98,
    "stability": "Stable",
    "isotopes": [
      "Bi-209"
    ],
    "electronegativity": 2.02,
    "ionizationEnergies": [
      7.289
    ],
    "xrayAbsorptionEnergies": {
      "K": 109200
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 92e3,
      "K\u03B2": 109200
    }
  },
  "Po": {
    "name": "Polonium",
    "atomicNumber": 84,
    "group": 16,
    "groupName": "metalloid",
    "period": 6,
    "atomicMass": 209,
    "stability": "Radioactive",
    "isotopes": [
      "Po-209",
      "Po-210"
    ],
    "electronegativity": 2,
    "ionizationEnergies": [
      8.417
    ],
    "xrayAbsorptionEnergies": {
      "K": 112800
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 95e3,
      "K\u03B2": 112800
    }
  },
  "At": {
    "name": "Astatine",
    "atomicNumber": 85,
    "group": 17,
    "groupName": "halogen",
    "period": 6,
    "atomicMass": 210,
    "stability": "Radioactive",
    "isotopes": [
      "At-210"
    ],
    "electronegativity": 2.2,
    "ionizationEnergies": [
      9.3
    ],
    "xrayAbsorptionEnergies": {
      "K": 116800
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 98e3,
      "K\u03B2": 116800
    }
  },
  "Rn": {
    "name": "Radon",
    "atomicNumber": 86,
    "group": 18,
    "groupName": "noble gas",
    "period": 6,
    "atomicMass": 222,
    "stability": "Radioactive",
    "isotopes": [
      "Rn-222"
    ],
    "electronegativity": null,
    "ionizationEnergies": [
      10.748
    ],
    "xrayAbsorptionEnergies": {
      "K": 121e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 102e3,
      "K\u03B2": 121e3
    }
  },
  "Fr": {
    "name": "Francium",
    "atomicNumber": 87,
    "group": 1,
    "groupName": "alkali metal",
    "period": 7,
    "atomicMass": 223,
    "stability": "Radioactive",
    "isotopes": [
      "Fr-223"
    ],
    "electronegativity": 0.7,
    "ionizationEnergies": [
      4.072
    ],
    "xrayAbsorptionEnergies": {
      "K": 125e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 105e3,
      "K\u03B2": 125e3
    }
  },
  "Ra": {
    "name": "Radium",
    "atomicNumber": 88,
    "group": 2,
    "groupName": "alkaline earth metal",
    "period": 7,
    "atomicMass": 226,
    "stability": "Radioactive",
    "isotopes": [
      "Ra-226"
    ],
    "electronegativity": 0.9,
    "ionizationEnergies": [
      5.279
    ],
    "xrayAbsorptionEnergies": {
      "K": 13e4
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 108e3,
      "K\u03B2": 13e4
    }
  },
  "Ac": {
    "name": "Actinium",
    "atomicNumber": 89,
    "group": "Ac-1",
    "groupName": "actinide",
    "period": 7,
    "atomicMass": 227,
    "stability": "Radioactive",
    "isotopes": [
      "Ac-227"
    ],
    "electronegativity": 1.1,
    "ionizationEnergies": [
      5.17
    ],
    "xrayAbsorptionEnergies": {
      "K": 135e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 112e3,
      "K\u03B2": 135e3
    }
  },
  "Th": {
    "name": "Thorium",
    "atomicNumber": 90,
    "group": "Ac-2",
    "groupName": "actinide",
    "period": 7,
    "atomicMass": 232.04,
    "stability": "Radioactive",
    "isotopes": [
      "Th-232"
    ],
    "electronegativity": 1.3,
    "ionizationEnergies": [
      6.08
    ],
    "xrayAbsorptionEnergies": {
      "K": 14e4
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 115e3,
      "K\u03B2": 14e4
    }
  },
  "Pa": {
    "name": "Protactinium",
    "atomicNumber": 91,
    "group": "Ac-3",
    "groupName": "actinide",
    "period": 7,
    "atomicMass": 231.04,
    "stability": "Radioactive",
    "isotopes": [
      "Pa-231"
    ],
    "electronegativity": 1.5,
    "ionizationEnergies": [
      5.89
    ],
    "xrayAbsorptionEnergies": {
      "K": 145e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 118e3,
      "K\u03B2": 145e3
    }
  },
  "U": {
    "name": "Uranium",
    "atomicNumber": 92,
    "group": "Ac-4",
    "groupName": "actinide",
    "period": 7,
    "atomicMass": 238.03,
    "stability": "Radioactive",
    "isotopes": [
      "U-234",
      "U-235",
      "U-238"
    ],
    "electronegativity": 1.38,
    "ionizationEnergies": [
      6.19
    ],
    "xrayAbsorptionEnergies": {
      "K": 151e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 123e3,
      "K\u03B2": 151e3
    }
  },
  "Np": {
    "name": "Neptunium",
    "atomicNumber": 93,
    "group": "Ac-5",
    "groupName": "actinide",
    "period": 7,
    "atomicMass": 237,
    "stability": "Radioactive",
    "isotopes": [
      "Np-237"
    ],
    "electronegativity": 1.36,
    "ionizationEnergies": [
      6.27
    ],
    "xrayAbsorptionEnergies": {
      "K": 157e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 128e3,
      "K\u03B2": 157e3
    }
  },
  "Pu": {
    "name": "Plutonium",
    "atomicNumber": 94,
    "group": "Ac-6",
    "groupName": "actinide",
    "period": 7,
    "atomicMass": 244,
    "stability": "Radioactive",
    "isotopes": [
      "Pu-238",
      "Pu-239",
      "Pu-240",
      "Pu-241",
      "Pu-242"
    ],
    "electronegativity": 1.28,
    "ionizationEnergies": [
      6.06
    ],
    "xrayAbsorptionEnergies": {
      "K": 163e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 133e3,
      "K\u03B2": 163e3
    }
  },
  "Am": {
    "name": "Americium",
    "atomicNumber": 95,
    "group": "Ac-7",
    "groupName": "actinide",
    "period": 7,
    "atomicMass": 243,
    "stability": "Radioactive",
    "isotopes": [
      "Am-241",
      "Am-243"
    ],
    "electronegativity": 1.13,
    "ionizationEnergies": [
      5.97
    ],
    "xrayAbsorptionEnergies": {
      "K": 17e4
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 138e3,
      "K\u03B2": 17e4
    }
  },
  "Cm": {
    "name": "Curium",
    "atomicNumber": 96,
    "group": "Ac-8",
    "groupName": "actinide",
    "period": 7,
    "atomicMass": 247,
    "stability": "Radioactive",
    "isotopes": [
      "Cm-244",
      "Cm-246"
    ],
    "electronegativity": 1.28,
    "ionizationEnergies": [
      5.99
    ],
    "xrayAbsorptionEnergies": {
      "K": 177e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 143e3,
      "K\u03B2": 177e3
    }
  },
  "Bk": {
    "name": "Berkelium",
    "atomicNumber": 97,
    "group": "Ac-9",
    "groupName": "actinide",
    "period": 7,
    "atomicMass": 247,
    "stability": "Radioactive",
    "isotopes": [
      "Bk-247"
    ],
    "electronegativity": 1.3,
    "ionizationEnergies": [
      6.23
    ],
    "xrayAbsorptionEnergies": {
      "K": 184e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 148e3,
      "K\u03B2": 184e3
    }
  },
  "Cf": {
    "name": "Californium",
    "atomicNumber": 98,
    "group": "Ac-10",
    "groupName": "actinide",
    "period": 7,
    "atomicMass": 251,
    "stability": "Radioactive",
    "isotopes": [
      "Cf-249",
      "Cf-252"
    ],
    "electronegativity": 1.3,
    "ionizationEnergies": [
      6.3
    ],
    "xrayAbsorptionEnergies": {
      "K": 191e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 153e3,
      "K\u03B2": 191e3
    }
  },
  "Es": {
    "name": "Einsteinium",
    "atomicNumber": 99,
    "group": "Ac-11",
    "groupName": "actinide",
    "period": 7,
    "atomicMass": 252,
    "stability": "Radioactive",
    "isotopes": [
      "Es-252"
    ],
    "electronegativity": 1.3,
    "ionizationEnergies": [
      6.42
    ],
    "xrayAbsorptionEnergies": {
      "K": 198e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 158e3,
      "K\u03B2": 198e3
    }
  },
  "Fm": {
    "name": "Fermium",
    "atomicNumber": 100,
    "group": "Ac-12",
    "groupName": "actinide",
    "period": 7,
    "atomicMass": 257,
    "stability": "Radioactive",
    "isotopes": [
      "Fm-257"
    ],
    "electronegativity": 1.3,
    "ionizationEnergies": [
      6.5
    ],
    "xrayAbsorptionEnergies": {
      "K": 205e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 163e3,
      "K\u03B2": 205e3
    }
  },
  "Md": {
    "name": "Mendelevium",
    "atomicNumber": 101,
    "group": "Ac-13",
    "groupName": "actinide",
    "period": 7,
    "atomicMass": 258,
    "stability": "Radioactive",
    "isotopes": [
      "Md-258"
    ],
    "electronegativity": 1.3,
    "ionizationEnergies": [
      6.58
    ],
    "xrayAbsorptionEnergies": {
      "K": 212e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 168e3,
      "K\u03B2": 212e3
    }
  },
  "No": {
    "name": "Nobelium",
    "atomicNumber": 102,
    "group": "Ac-14",
    "groupName": "actinide",
    "period": 7,
    "atomicMass": 259,
    "stability": "Radioactive",
    "isotopes": [
      "No-259"
    ],
    "electronegativity": 1.3,
    "ionizationEnergies": [
      6.65
    ],
    "xrayAbsorptionEnergies": {
      "K": 219e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 173e3,
      "K\u03B2": 219e3
    }
  },
  "Lr": {
    "name": "Lawrencium",
    "atomicNumber": 103,
    "group": "Ac-15",
    "groupName": "actinide",
    "period": 7,
    "atomicMass": 262,
    "stability": "Radioactive",
    "isotopes": [
      "Lr-262"
    ],
    "electronegativity": 1.3,
    "ionizationEnergies": [
      4.9
    ],
    "xrayAbsorptionEnergies": {
      "K": 226e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 178e3,
      "K\u03B2": 226e3
    }
  },
  "Rf": {
    "name": "Rutherfordium",
    "atomicNumber": 104,
    "group": 4,
    "groupName": "transition metal",
    "period": 7,
    "atomicMass": 267,
    "stability": "Radioactive",
    "isotopes": [
      "Rf-267"
    ],
    "electronegativity": null,
    "ionizationEnergies": [
      6
    ],
    "xrayAbsorptionEnergies": {
      "K": 233e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 183e3,
      "K\u03B2": 233e3
    }
  },
  "Db": {
    "name": "Dubnium",
    "atomicNumber": 105,
    "group": 5,
    "groupName": "transition metal",
    "period": 7,
    "atomicMass": 268.126,
    "stability": "Radioactive",
    "isotopes": [
      "Db-268"
    ],
    "electronegativity": null,
    "ionizationEnergies": [
      null
    ],
    "xrayAbsorptionEnergies": {
      "K": null
    },
    "xrayEmissionEnergies": {
      "K\u03B1": null,
      "K\u03B2": null
    }
  },
  "Sg": {
    "name": "Seaborgium",
    "atomicNumber": 106,
    "group": 6,
    "groupName": "transition metal",
    "period": 7,
    "atomicMass": 271,
    "stability": "Radioactive",
    "isotopes": [
      "Sg-271"
    ],
    "electronegativity": null,
    "ionizationEnergies": [
      6.2
    ],
    "xrayAbsorptionEnergies": {
      "K": 247e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 193e3,
      "K\u03B2": 247e3
    }
  },
  "Bh": {
    "name": "Bohrium",
    "atomicNumber": 107,
    "group": 7,
    "groupName": "transition metal",
    "period": 7,
    "atomicMass": 270,
    "stability": "Radioactive",
    "isotopes": [
      "Bh-270"
    ],
    "electronegativity": null,
    "ionizationEnergies": [
      6.3
    ],
    "xrayAbsorptionEnergies": {
      "K": 254e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 198e3,
      "K\u03B2": 254e3
    }
  },
  "Hs": {
    "name": "Hassium",
    "atomicNumber": 108,
    "group": 8,
    "groupName": "transition metal",
    "period": 7,
    "atomicMass": 277,
    "stability": "Radioactive",
    "isotopes": [
      "Hs-277"
    ],
    "electronegativity": null,
    "ionizationEnergies": [
      6.4
    ],
    "xrayAbsorptionEnergies": {
      "K": 261e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 203e3,
      "K\u03B2": 261e3
    }
  },
  "Mt": {
    "name": "Meitnerium",
    "atomicNumber": 109,
    "group": 9,
    "groupName": "transition metal",
    "period": 7,
    "atomicMass": 278,
    "stability": "Radioactive",
    "isotopes": [
      "Mt-278"
    ],
    "electronegativity": null,
    "ionizationEnergies": [
      6.5
    ],
    "xrayAbsorptionEnergies": {
      "K": 268e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 208e3,
      "K\u03B2": 268e3
    }
  },
  "Ds": {
    "name": "Darmstadtium",
    "atomicNumber": 110,
    "group": 10,
    "groupName": "transition metal",
    "period": 7,
    "atomicMass": 281,
    "stability": "Radioactive",
    "isotopes": [
      "Ds-281"
    ],
    "electronegativity": null,
    "ionizationEnergies": [
      6.6
    ],
    "xrayAbsorptionEnergies": {
      "K": 275e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 213e3,
      "K\u03B2": 275e3
    }
  },
  "Rg": {
    "name": "Roentgenium",
    "atomicNumber": 111,
    "group": 11,
    "groupName": "transition metal",
    "period": 7,
    "atomicMass": 282,
    "stability": "Radioactive",
    "isotopes": [
      "Rg-282"
    ],
    "electronegativity": null,
    "ionizationEnergies": [
      6.7
    ],
    "xrayAbsorptionEnergies": {
      "K": 282e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 218e3,
      "K\u03B2": 282e3
    }
  },
  "Cn": {
    "name": "Copernicium",
    "atomicNumber": 112,
    "group": 12,
    "groupName": "transition metal",
    "period": 7,
    "atomicMass": 285,
    "stability": "Radioactive",
    "isotopes": [
      "Cn-285"
    ],
    "electronegativity": null,
    "ionizationEnergies": [
      7
    ],
    "xrayAbsorptionEnergies": {
      "K": 289e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 223e3,
      "K\u03B2": 289e3
    }
  },
  "Nh": {
    "name": "Nihonium",
    "atomicNumber": 113,
    "group": 13,
    "groupName": "post-transition metal",
    "period": 7,
    "atomicMass": 286,
    "stability": "Radioactive",
    "isotopes": [
      "Nh-286"
    ],
    "electronegativity": null,
    "ionizationEnergies": [
      7.3
    ],
    "xrayAbsorptionEnergies": {
      "K": 296e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 228e3,
      "K\u03B2": 296e3
    }
  },
  "Fl": {
    "name": "Flerovium",
    "atomicNumber": 114,
    "group": 14,
    "groupName": "post-transition metal",
    "period": 7,
    "atomicMass": 289,
    "stability": "Radioactive",
    "isotopes": [
      "Fl-289"
    ],
    "electronegativity": null,
    "ionizationEnergies": [
      7.4
    ],
    "xrayAbsorptionEnergies": {
      "K": 303e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 233e3,
      "K\u03B2": 303e3
    }
  },
  "Mc": {
    "name": "Moscovium",
    "atomicNumber": 115,
    "group": 15,
    "groupName": "post-transition metal",
    "period": 7,
    "atomicMass": 290,
    "stability": "Radioactive",
    "isotopes": [
      "Mc-290"
    ],
    "electronegativity": null,
    "ionizationEnergies": [
      7.7
    ],
    "xrayAbsorptionEnergies": {
      "K": 31e4
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 238e3,
      "K\u03B2": 31e4
    }
  },
  "Lv": {
    "name": "Livermorium",
    "atomicNumber": 116,
    "group": 16,
    "groupName": "post-transition metal",
    "period": 7,
    "atomicMass": 293,
    "stability": "Radioactive",
    "isotopes": [
      "Lv-293"
    ],
    "electronegativity": null,
    "ionizationEnergies": [
      7.9
    ],
    "xrayAbsorptionEnergies": {
      "K": 317e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 243e3,
      "K\u03B2": 317e3
    }
  },
  "Ts": {
    "name": "Tennessine",
    "atomicNumber": 117,
    "group": 17,
    "groupName": "halogen",
    "period": 7,
    "atomicMass": 294,
    "stability": "Radioactive",
    "isotopes": [
      "Ts-294"
    ],
    "electronegativity": null,
    "ionizationEnergies": [
      8
    ],
    "xrayAbsorptionEnergies": {
      "K": 324e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 248e3,
      "K\u03B2": 324e3
    }
  },
  "Og": {
    "name": "Oganesson",
    "atomicNumber": 118,
    "group": 18,
    "groupName": "noble gas",
    "period": 7,
    "atomicMass": 294,
    "stability": "Radioactive",
    "isotopes": [
      "Og-294"
    ],
    "electronegativity": null,
    "ionizationEnergies": [
      8
    ],
    "xrayAbsorptionEnergies": {
      "K": 331e3
    },
    "xrayEmissionEnergies": {
      "K\u03B1": 253e3,
      "K\u03B2": 331e3
    }
  }
};

// src/ui/renderer/components/renderPeriodicTable.ts
function renderPeriodicTable(view, container) {
  container.empty();
  const table = container.createEl("table", { cls: "periodic-table" });
  const maxPeriod = Math.max(...Object.values(elements).map((e) => e.period));
  const maxGroup = Math.max(
    ...Object.values(elements).map((e) => typeof e.group === "number" ? e.group : -Infinity)
  );
  function createPopup(contentDiv, el, symbol) {
    let popup = null;
    view.registerDomEvent(contentDiv, "mouseenter", (e) => {
      var _a, _b, _c;
      popup = document.createElement("div");
      popup.className = "element-popup";
      popup.innerHTML = `
                <strong>${el.name} (${el.atomicNumber})</strong><br>
                Symbol: ${symbol}<br>
                Group: ${el.groupName}<br>
                Period: ${el.period}<br>
                Atomic Mass: ${el.atomicMass}<br>
                Electronegativity: ${(_a = el.electronegativity) != null ? _a : "n/a"}<br>
                Stability: ${el.stability}<br>
                Isotopes: ${(_c = (_b = el.isotopes) == null ? void 0 : _b.join(", ")) != null ? _c : "n/a"}
            `;
      document.body.appendChild(popup);
      const rect = contentDiv.getBoundingClientRect();
      popup.style.position = "fixed";
      popup.style.left = `${rect.right + 8}px`;
      popup.style.top = `${rect.top}px`;
      popup.style.zIndex = "1000";
    });
    contentDiv.addEventListener("mouseleave", () => {
      if (popup) {
        popup.remove();
        popup = null;
      }
    });
  }
  for (let period = 1; period <= maxPeriod; period++) {
    const row = table.createEl("tr");
    for (let group = 1; group <= maxGroup; group++) {
      const entry = Object.entries(elements).find(
        ([, e]) => e.period === period && e.group === group
      );
      const groupName = entry ? entry[1].groupName : "";
      const cell = row.createEl("td", {
        cls: "periodic-table-cell",
        attr: { "data-group-name": groupName }
      });
      if (entry) {
        const [symbol, el] = entry;
        const content = cell.createEl("div", { cls: "element-content" });
        content.createEl("div", { text: symbol, cls: "element-symbol" });
        content.createEl("div", { text: el.atomicNumber.toString(), cls: "atomic-number" });
        content.createEl("div", { text: el.name, cls: "element-name" });
        createPopup(content, el, symbol);
      }
    }
  }
  const lanthanoids = Object.entries(elements).filter(([, e]) => typeof e.group === "string" && e.group.startsWith("La-")).sort(([, a], [, b]) => a.atomicNumber - b.atomicNumber);
  const lanthRow = container.createEl("table", { cls: "periodic-table-lanthanoids" }).createEl("tr");
  lanthanoids.forEach(([symbol, el]) => {
    const cell = lanthRow.createEl("td", {
      cls: "periodic-table-cell",
      attr: { "data-group-name": el.groupName }
    });
    const content = cell.createEl("div", { cls: "element-content" });
    content.createEl("div", { text: symbol, cls: "element-symbol" });
    content.createEl("div", { text: el.atomicNumber.toString(), cls: "atomic-number" });
    content.createEl("div", { text: el.name, cls: "element-name" });
    createPopup(content, el, symbol);
  });
  const actinoids = Object.entries(elements).filter(([, e]) => typeof e.group === "string" && e.group.startsWith("Ac-")).sort(([, a], [, b]) => a.atomicNumber - b.atomicNumber);
  const actinRow = container.createEl("table", { cls: "periodic-table-actinoids" }).createEl("tr");
  actinoids.forEach(([symbol, el]) => {
    const cell = actinRow.createEl("td", {
      cls: "periodic-table-cell",
      attr: { "data-group-name": el.groupName }
    });
    const content = cell.createEl("div", { cls: "element-content" });
    content.createEl("div", { text: symbol, cls: "element-symbol" });
    content.createEl("div", { text: el.atomicNumber.toString(), cls: "atomic-number" });
    content.createEl("div", { text: el.name, cls: "element-name" });
    createPopup(content, el, symbol);
  });
}

// src/ui/views/PeriodicTableView.ts
var PeriodicTableView = class extends import_obsidian42.MarkdownRenderChild {
  constructor(app, containerEl) {
    super(containerEl);
    this.app = app;
  }
  async onload() {
    renderPeriodicTable(this, this.containerEl);
  }
};

// src/ui/components/footer.ts
var import_obsidian43 = require("obsidian");
var Footer = class {
  constructor(app, plugin) {
    this.containerEl = null;
    this.mutationObserver = null;
    this.app = app;
    this.plugin = plugin;
    this.debouncedUpdate = (0, import_obsidian43.debounce)(() => {
      this.updateFooter();
    }, 500, true);
  }
  init() {
    this.registerEventHandlers();
    this.updateFooter();
  }
  registerEventHandlers() {
    this.app.workspace.on("active-leaf-change", () => {
      this.updateFooter();
    });
    this.app.workspace.on("file-open", () => {
      this.updateFooter();
    });
    this.app.workspace.on("layout-change", () => {
      this.updateFooter();
    });
    this.app.workspace.on("editor-change", () => {
      if (this.isEditMode()) {
        this.debouncedUpdate();
      }
    });
  }
  updateFooter() {
    const activeLeaf = this.app.workspace.activeLeaf;
    if (!(activeLeaf == null ? void 0 : activeLeaf.view) || !(activeLeaf.view instanceof import_obsidian43.MarkdownView)) {
      this.removeFooter();
      return;
    }
    const view = activeLeaf.view;
    const file = view.file;
    if (!file) {
      this.removeFooter();
      return;
    }
    if (!this.shouldShowFooter(file)) {
      this.removeFooter();
      return;
    }
    this.addFooter(view, file);
  }
  shouldShowFooter(file) {
    var _a;
    if (!this.plugin.settings.footer.enabled) {
      return false;
    }
    const frontmatter = (_a = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter;
    if ((frontmatter == null ? void 0 : frontmatter.footer) !== void 0) {
      return frontmatter.footer;
    }
    return true;
  }
  addFooter(view, file) {
    try {
      this.removeFooter();
      const container = this.findContainer(view);
      if (!container) {
        console.warn("Footer: Could not find container for current mode");
        return;
      }
      this.containerEl = this.createFooterElement(file);
      if (!this.containerEl) {
        return;
      }
      container.appendChild(this.containerEl);
      this.observeContainer(container);
    } catch (error) {
      console.error("Error adding footer:", error);
    }
  }
  findContainer(view) {
    const content = view.contentEl;
    const mode = view.getMode();
    if (mode === "preview") {
      const previewSections = content.querySelectorAll(".markdown-preview-section");
      for (let i = 0; i < previewSections.length; i++) {
        const section = previewSections[i];
        if (!section.closest(".internal-embed")) {
          return section;
        }
      }
    } else if (mode === "source") {
      return content.querySelector(".cm-sizer");
    }
    return null;
  }
  createFooterElement(file) {
    const footerEl = createDiv({ cls: "eln-footer eln-footer--hidden" });
    footerEl.createDiv({ cls: "eln-footer--separator" });
    const contentEl = footerEl.createDiv({ cls: "eln-footer--content" });
    this.addFooterContent(contentEl, file);
    setTimeout(() => {
      footerEl.removeClass("eln-footer--hidden");
    }, 10);
    return footerEl;
  }
  addFooterContent(contentEl, file) {
    const settings = this.plugin.settings.footer;
    const cache = this.app.metadataCache.getFileCache(file);
    const frontmatter = cache == null ? void 0 : cache.frontmatter;
    const infoSections = [];
    if (settings.includeVersion) {
      const version = this.plugin.manifest.version;
      infoSections.push(`ELN v${version}`);
    }
    if (settings.includeAuthor) {
      let author = frontmatter == null ? void 0 : frontmatter.author;
      if (!author && this.plugin.settings.general.authors.length > 0) {
        author = this.plugin.settings.general.authors[0].name;
      }
      if (author) {
        infoSections.push(`Author: ${author}`);
      }
    }
    if (settings.includeCtime) {
      const ctime = new Date(file.stat.ctime);
      infoSections.push(`Created: ${this.formatDate(ctime)}`);
    }
    if (settings.includeMtime) {
      const mtime = new Date(file.stat.mtime);
      infoSections.push(`Modified: ${this.formatDate(mtime)}`);
    }
    if (infoSections.length > 0) {
      const infoContainer = contentEl.createDiv({ cls: "eln-footer--info" });
      infoContainer.textContent = infoSections.join(" \u2022 ");
    }
  }
  formatDate(date) {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    };
    return date.toLocaleDateString("en-US", options);
  }
  observeContainer(container) {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    this.mutationObserver = new MutationObserver(() => {
      const footer = container.querySelector(".eln-footer");
      if (!footer) {
        const activeView = this.app.workspace.getActiveViewOfType(import_obsidian43.MarkdownView);
        if (activeView == null ? void 0 : activeView.file) {
          setTimeout(() => this.updateFooter(), 50);
        }
      }
    });
    this.mutationObserver.observe(container, {
      childList: true,
      subtree: true
    });
  }
  removeFooter() {
    if (this.containerEl) {
      this.containerEl.remove();
      this.containerEl = null;
    }
    document.querySelectorAll(".eln-footer").forEach((el) => el.remove());
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
  }
  isEditMode() {
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian43.MarkdownView);
    if (!activeView) return false;
    const mode = activeView.getMode();
    return mode === "source";
  }
  destroy() {
    this.removeFooter();
  }
};

// src/commands/newNoteCommands.ts
function addNewNoteCommands(plugin) {
  const { note } = plugin.settings;
  Object.entries(note).forEach(([noteType, config]) => {
    if (config.commands.enabled) {
      plugin.addCommand({
        id: config.commands.id,
        name: config.commands.name,
        callback: async () => {
          const newNote = new NewNote(plugin);
          await newNote.create({
            noteType
          });
        }
      });
    }
  });
}

// src/main.ts
var ElnPlugin = class extends import_obsidian44.Plugin {
  constructor() {
    super(...arguments);
    this.lastActiveFile = null;
    this.logger = createLogger("main");
  }
  async onload() {
    await this.loadSettings();
    addNewNoteCommands(this);
    this.app.workspace.onLayoutReady(() => {
      handleActiveLeafChange(this.app, this);
      this.footer = new Footer(this.app, this);
      this.footer.init();
    });
    this.addSettingTab(new ELNSettingTab(this.app, this));
    this.api = new ELNApi();
    window["elnAPI"] = this.api && this.register(() => delete window["elnAPI"]);
    this.registerView(
      NestedPropertiesEditorView.viewType,
      (leaf) => new NestedPropertiesEditorView(leaf)
    );
    if (this.app.workspace.layoutReady) {
      this.initNpeLeaf();
      this.lastActiveFile = this.app.workspace.getActiveFile();
    } else {
      this.app.workspace.onLayoutReady(() => {
        this.initNpeLeaf.bind(this);
        this.lastActiveFile = this.app.workspace.getActiveFile();
      });
    }
    this.registerMarkdownCodeBlockProcessor("eln-properties", async (source, el, ctx) => {
      const file = ctx.sourcePath ? this.app.vault.getAbstractFileByPath(ctx.sourcePath) : null;
      const params = parseNpeCodeBlockParams(source);
      new NestedPropertiesEditorCodeBlockView(
        this.app,
        el,
        ctx,
        file instanceof import_obsidian44.TFile ? file : null,
        params.key,
        params.excludeKeys,
        params.actionButtons,
        params.cssclasses
      );
    });
    this.registerMarkdownCodeBlockProcessor("circular-progress", (source, el, ctx) => {
      ctx.addChild(new CircularProgress(this.app, el, source));
    });
    this.registerMarkdownCodeBlockProcessor("image-viewer", (source, el, ctx) => {
      ctx.addChild(new ImageViewer(this.app, el, source));
    });
    this.registerMarkdownCodeBlockProcessor("daily-note-nav", (source, el, ctx) => {
      ctx.addChild(new DailyNoteNav(this.app, el, source));
    });
    this.registerMarkdownCodeBlockProcessor("chem-links", (source, el, ctx) => {
      ctx.addChild(new ChemLinks(this.app, el, ctx.sourcePath));
    });
    this.registerMarkdownCodeBlockProcessor("periodic-table", (source, el, ctx) => {
      ctx.addChild(new PeriodicTableView(this.app, el));
    });
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        this.logger.debug("Active leaf changed event fired!");
        handleActiveLeafChange(this.app, this);
      })
    );
    this.addCommand({
      id: "eln-enable-debug-npe",
      name: "Enable debug logging for NPE",
      callback: () => {
        logger.enableDebugFor("npe");
        new import_obsidian44.Notice("NPE debug logging enabled");
      }
    });
    this.addCommand({
      id: "eln-quiet-npe",
      name: "Quiet NPE logging (warnings only)",
      callback: () => {
        logger.quietComponent("npe");
        new import_obsidian44.Notice("NPE logging quieted");
      }
    });
    this.addCommand({
      id: "eln-enable-debug-modal",
      name: "Enable debug logging for modals",
      callback: () => {
        logger.enableDebugFor("modal");
        new import_obsidian44.Notice("Modal debug logging enabled");
      }
    });
    this.addCommand({
      id: "eln-quiet-modal",
      name: "Quiet modal logging (warnings only)",
      callback: () => {
        logger.quietComponent("modal");
        new import_obsidian44.Notice("Modal logging quieted");
      }
    });
    this.addCommand({
      id: "eln-show-logger-config",
      name: "Show current logger configuration",
      callback: () => {
        const config = logger.getConfig();
        console.log("ELN Logger Configuration:", config);
        new import_obsidian44.Notice("Logger configuration shown in console");
      }
    });
  }
  async initNpeLeaf() {
    this.app.workspace.detachLeavesOfType(NestedPropertiesEditorView.viewType);
    const rightLeaf = this.app.workspace.getRightLeaf(false);
    if (rightLeaf) {
      await rightLeaf.setViewState({
        type: NestedPropertiesEditorView.viewType,
        active: true
      });
    }
    this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType(NestedPropertiesEditorView.viewType)[0]
    );
  }
  onunload() {
    this.logger.info("ELN Plugin Unloaded");
    if (this.footer) {
      this.footer.destroy();
    }
    this.app.workspace.detachLeavesOfType(NestedPropertiesEditorView.viewType);
    this.app.workspace.off("active-leaf-change", () => handleActiveLeafChange(this.app, this));
    this.app.workspace.off("layout-ready", () => handleActiveLeafChange(this.app, this));
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
/*! Bundled license information:

moment/moment.js:
  (*! moment.js *)
  (*! version : 2.30.1 *)
  (*! authors : Tim Wood, Iskren Chernev, Moment.js contributors *)
  (*! license : MIT *)
  (*! momentjs.com *)
*/
