var util = require('util')
  , colors = require('colors')
  , logging = require('./logging');

module.exports = function (logging) {
  var exports = {}
    , Formatter = logging.Formatter;
  function ColorFormatter (fmt, datefmt, colordefs) {
    this.constructor.super_.apply(this, arguments);
    if (colordefs)
      this._colordefs = colordefs;
    this.enabled = process.stdout.isTTY
  }
  util.inherits(ColorFormatter, Formatter);
  exports.ColorFormatter = ColorFormatter;
  ColorFormatter.prototype._colordefs = {
      lvl: { error: ['red'], warning: ['yellow'], info: ['green'] }
  }
  ColorFormatter.prototype._formatter = function (name, value) {
    var def = this._colordefs[name];
    if (! (this.enabled && def))
      return value;
    if (Array.isArray(def))
      return def.reduce(
          function (str, color) {
            return colors[color](str);
          }
        , value
      );
    def = def[value];
    if (Array.isArray(def))
      return def.reduce(
          function (str, color) {
            return colors[color](str);
          }
        , value
      );
    return value;
  }
  ColorFormatter.prototype.format = function (record) {
    return this.constructor.super_.prototype.format
      .call(this, record, this._formatter.bind(this));
  }

  return exports;
}
