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
  namespace = (namespace || '');
  if (Array.isArray(namespace))
    namespace = namespace.join('.');
  var namespace_array = namespace.split('.').filter(Boolean)
    , name = namespace.slice(-1)[0] || '';

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
  this.namespace = namespace.split('.').filter(Boolean);
  this.name = this.namespace.slice(-1)[0] || '';
  this.propagate = true;
  var self = this;
  self.levels.forEach(function (lvl) {
    Object.defineProperty(self, lvl, { enumerable: false, value: self.log.bind(self, lvl) });
  })
}
exports.Logger = Logger;
Logger.prototype.levels = ['debug', 'info', 'warning', 'error'];

Logger.prototype.getLogger = function (namespace) {
  if (! Array.isArray(namespace))
    namespace = namespace.split('.');
  return getLogger(this.namespace_array.concat(namespace));
}

Logger.prototype.filter = function (record) {
  if (!this._filters)
    return true;
  return this._filters.every(function (filter) {
    return filter.filter(record);
  })
}
Logger.prototype.addFilter = function (filter) {
  if (filter instanceof BaseFilter)
    return this._filters.push(filter);
  throw new Error('filter is not a sub-prototype of BaseFilter');
}
Logger.prototype.removeFilter = function (filter) {
  var index = this._filters.indexOf(filter);
  if (~index)
    this._filters.splice(index, 1);
}

Logger.prototype.handle = function (record) {
  this._handlers.forEach(function (handler) {
    handler.emit(record);
  })
  if (this.propagate && this.parent) {
    this.parent.handle(record)
  }
}
Logger.prototype.addHandler = function (filter) {
  if (filter instanceof BaseHandler)
    return this._handlers.push(filter);
  throw new Error('filter is not a sub-prototype of BaseHandler');
}
Logger.prototype.removeHandler = function (filter) {
  var index = this._filters.indexOf(filter);
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
    , value: base_formatter
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
Formatter.prototype.color = false;
Formatter.prototype.colors = {
  lvl: { error: 'red', warn: 'yellow', info: 'green' }
}
Formatter.prototype.colorVariable = function (name, value) {
  if (! this.color)
    return value;
  switch (name) {
    case 'lvl':
      if (this.colors.lvl[value])
        return value[this.colors.lvl[value]];
      return value;
    default:
      return value;
  }
}
Formatter.prototype.format = function (record) {
  var self = this
    , offset = 0;
  return (this.fmt
    .replace(/%\((\w+)\)(\w)/g, function (match, name, format) {
      if (name === 'date')
        return self.formatDate(record.date);
      return self.colorVariable(name, record[name]);
    })
    .replace(/%(\w)/g, function (match, format) {
      if (record.args.length && offset < record.args.length )
        return record.args[offset ++];
      throw new Error('Not enough args for string format')
    })
  )
}
Formatter.prototype.formatDate = function (date) {
  return moment(date).format(this.dateFmt);
}

var base_formatter = new Formatter;

function ConsoleHandler () {
  this.constructor.super_.apply(this, arguments)
  this.color = false;
}
exports.ConsoleHandler = ConsoleHandler;
util.inherits(ConsoleHandler, BaseHandler);
ConsoleHandler.prototype.levels = ['info', 'warn', 'error'];
ConsoleHandler.prototype.handle = function (record) {
  return this.emit(record);
}
ConsoleHandler.prototype.emit = function (record) {
  this.format(record);
  if (~this.levels.indexOf(record.lvl))
    console[record.lvl](record.msg);
  else
    console.log(record.lvl, record.msg);
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


if (require.main === module) {

  var rootLogger = getLogger();
  console.log(rootLogger);
  rootLogger.info('everything is broken! (%s, %s, %s)', 1, 2, 3)

  var deepLogger = getLogger('greg.thing.goes.here')
    , logger = deepLogger;

  do {
    console.log('Logger:', logger.namespace, logger.getEffectiveLevel());
    logger = logger.parent;
  } while (logger) 
}