var util = require('util')
  , moment = require('moment')
  , colors = require('colors');

function Record (name, lvl, fn, lno, msg, args, exc_info, func, extra) {
  this.date = new Date;
  this.name = name;
  this.lvl = lvl;
  this.fn = fn;
  this.lno = lno;
  this.msg = msg;
  this.args = args || [];
  this.exc_info = exc_info;
  this.func = func;
  this.extra = extra;
}
exports.Record = Record;

function Logger (namespace) {
  if (!(this instanceof Logger))
    return exports.getLogger(namespace);
  namespace = (namespace || '');
  if (Array.isArray(namespace))
    namespace = namespace.join('.');
  var namespace_array = namespace.split('.').filter(Boolean)
    , name = namespace_array.slice(-1)[0] || '<root>';

  Object.defineProperties(this, {
      name: {
        enumerable: false, value: name
      }
    , namespace: {
        enumerable: true, value: namespace
      }
    , namespace_array: {
        enumerable: false, value: namespace_array
      }
    , parent: {
        enumerable: false, value: namespace ? getLogger(namespace_array.slice(0, -1).join('.')) : null
      }
    , _handlers: {
        enumerable: false, value: []
      }
    , _filters: {
        enumerable: false, value: []
      }
    , _level: {
        enumerable: false, writable: true, value: null
      }
  })
  this.propagate = true;
  var self = this;
  self.levels.forEach(function (lvl) {
    Object.defineProperty(self, lvl, { enumerable: false, value: self.log.bind(self, lvl) });
  })
}
exports.Logger = Logger;
Logger.prototype.levels = ['debug', 'info', 'warning', 'error'];

Logger.prototype.getLogger = function (namespace) {
  namespace = namespace || []
  if (! Array.isArray(namespace))
    namespace = namespace.split('.');
  return getLogger(this.namespace_array.concat(namespace));
}

Logger.prototype.filter = function (record) {
  if (!this._filters.length)
    return true;
  return this._filters.every(function (filter) {
    return filter.filter(record);
  })
}
Logger.prototype.addFilter = function (filter) {
  if (filter.filter instanceof Function)
    return this._filters.push(filter);
  throw new Error('filter object requires a filter function');
}
Logger.prototype.removeFilter = function (filter) {
  var index = this._filters.indexOf(filter);
  if (~index)
    this._filters.splice(index, 1);
}

Logger.prototype.handle = function (record) {
  this._handlers.forEach(function (handler) {
    handler.handle(record);
  });
  if (this.propagate && this.parent) {
    this.parent.handle(record)
  }
}
Logger.prototype.addHandler = function (handler) {
  if (handler instanceof BaseHandler)
    return this._handlers.push(handler);
  throw new Error('handler is not a sub-prototype of BaseHandler');
}
Logger.prototype.removeHandler = function (handler) {
  var index = this._handlers.indexOf(handler);
  if (~index)
    this._handlers.splice(index, 1);
}

Logger.prototype.makeRecord = function (name, lvl, fn, lno, msg, args, exc_info, func, extra) {
  return new Record(name, lvl, fn, lno, msg, args, exc_info, func, extra);
}

Logger.prototype.log = function (lvl, msg, args) {
  var stack = (new Error).stack;
  args = Array.prototype.slice.call(arguments, 2);
  this.handle(this.makeRecord(this.namespace, lvl, null, null, msg, args))
}

Logger.prototype.setLevel = function (lvl) {
  if (lvl === null || ~this.levels.indexOf(lvl))
    this._level = lvl;
}

Logger.prototype.getEffectiveLevel = function () {
  if (this._level)
    return this._level;
  if (this.parent)
    return this.parent.getEffectiveLevel();
  return this._level;
}

function BaseHandler () {
  Object.defineProperty(this, '_formatter', {
      enumerable: false
    , writable: true
    , value: default_formatter
  });
}
exports.BaseHandler = BaseHandler;
BaseHandler.prototype.emit = function (record) { throw new Error('BaseHandler should not be used directly') }
BaseHandler.prototype.setFormatter = function (formatter) {
  if (formatter instanceof Formatter)
    return this._formatter = formatter;
  throw new Error('formatter needs to be a prototype of Formatter');
}
BaseHandler.prototype.format = function (record) { return record.msg = this._formatter.format(record) }

function BaseFilter () {}
exports.BaseFilter = BaseFilter;
BaseFilter.prototype.filter = function () { throw new Error('BaseFilter should not be used directly') }

function Formatter (fmt, datefmt) {
  Object.defineProperty(this, 'fmt', {
    value: fmt || '%(date)s - %(lvl)s - %(name)s - %(msg)s'
  });
  Object.defineProperty(this, 'datefmt', {
    value: datefmt || ''
  });
}
exports.Formatter = Formatter;
Formatter.prototype.format = function (record, formatter) {
  formatter = formatter || function (name, value) { return value };
  var self = this
    , offset = 0;
  return (this.fmt
    .replace(/%\((\w+)\)(\w)/g, function (match, name, format) {
      var res = name === 'date' ? self.formatDate(record.date) : record[name];

      return formatter(name, res);
    })
    .replace(/%(\w)/g, function (match, format) {
      if (record.args && offset < record.args.length )
        return record.args[offset ++];
      throw new Error('Not enough args for string format');
    })
  )
}
Formatter.prototype.formatDate = function (date) {
  return moment(date).format(this.datefmt);
}

var default_formatter = new Formatter;

function ConsoleHandler () {
  this.constructor.super_.apply(this, arguments)
  this.console = console;
}
exports.ConsoleHandler = ConsoleHandler;
util.inherits(ConsoleHandler, BaseHandler);

ConsoleHandler.prototype.map = { info: 'info', warning: 'warn', error: 'error' }
ConsoleHandler.prototype.handle = function (record) {
  return this.emit(record);
}
ConsoleHandler.prototype.emit = function (record) {
  this.format(record);
  if (this.map[record.lvl])
    this.console[this.map[record.lvl]](record.msg);
  else
    this.console.log(record.lvl, record.msg);
}

var loggers = {}
loggers[''] = new Logger;

;(function configureRootLogger (logger) {
  logger.addHandler(new ConsoleHandler);
})(loggers[''])

function getLogger(namespace) {
  namespace = namespace || '';
  return loggers[namespace] || (loggers[namespace] = new Logger(namespace));
}
exports.getLogger = getLogger;

exports.formatters = require('./formatters')(exports);
