var sinon = require('sinon')
  , assert = require('better-assert')
  , colors = require('colors')
  , logging = require('../../lib/logging')
  , ColorFormatter = logging.formatters.ColorFormatter;

describe('ColorFormatter', function () {
  describe('init', function () {
    describe('super', function () {
      beforeEach(function () {
        sinon.spy(ColorFormatter, 'super_');
      });
      afterEach(function () {
        ColorFormatter.super_.restore();
      });
      it('calls', function () {
        new ColorFormatter('rar', 'lala');
        assert(ColorFormatter.super_.calledOnce);
      });
    });
    describe('defaults', function () {
      var formatter = new ColorFormatter;
      it('has default colordefs', function () {
        assert(formatter._colordefs === ColorFormatter.prototype._colordefs)
      });
    });
    describe('override', function () {
      var formatter = new ColorFormatter(1, 2, 3);
      it('has overridden values', function () {
        assert(1 === formatter.fmt);
        assert(2 === formatter.datefmt);
        assert(3 === formatter._colordefs);
      });
    });
  });
  describe('#format()', function () {
    var formatter = new ColorFormatter;
    beforeEach(function () {
      sinon.spy(formatter._formatter, 'bind');
      sinon.stub(ColorFormatter.super_.prototype, 'format');
    });
    afterEach(function () {
      formatter._formatter.bind.restore();
      ColorFormatter.super_.prototype.format.restore();
    });
    it('calls super#format() with bound function', function () {
      formatter.format(111);
      assert(ColorFormatter.super_.prototype.format.calledOnce);
      assert(formatter._formatter.bind.calledOnce)
      assert(formatter._formatter.bind.calledWithExactly(formatter));
      var bound = formatter._formatter.bind.returnValues[0];
      assert(ColorFormatter.super_.prototype.format.calledWithExactly(
        111, bound
      ));
    });
  });
  describe('#_formatter()', function () {
    beforeEach(function () {
      Object.keys(colors).forEach(function (key) {
        if (colors[key] instanceof Function)
          sinon.spy(colors, key);
      });
    });
    afterEach(function () {
      Object.keys(colors).forEach(function (key) {
        if (colors[key] instanceof Function)
          colors[key].restore();
      });
    });
    describe('default _colordefs', function () {
      var formatter = new ColorFormatter;
      formatter.enabled = true;
      it('error calls red', function () {
        var res = formatter._formatter('lvl', 'error');
        assert(colors.red.calledOnce);
      });
      it('warning calls yellow', function () {
        var res = formatter._formatter('lvl', 'warning');
        assert(colors.yellow.calledOnce);
      });
      it('info calls green', function () {
        var res = formatter._formatter('lvl', 'info');
        assert(colors.green.calledOnce);
      });
    });
    describe('disabled', function () {
      var formatter = new ColorFormatter;
      formatter.enabled = false;
      it('returns same value', function () {
        var res = formatter._formatter('lvl', 'error');
        assert(res === 'error');
      });
    });
    describe('enabled', function () {
      var formatter = new ColorFormatter;
      formatter.enabled = true;
      formatter._colordefs = {
          simple: ['red']
        , value: {
              thing: ['green']
          }
        , empty: []
        , empty_value: {
              other: []
          }
      }
      it('simple format calls red', function () {
        formatter._formatter('simple', 'blah');
        formatter._formatter('simple', 'rar');
        assert(colors.red.calledTwice);
      });
      it('value format calls green with correct value', function () {
        formatter._formatter('value', 'thing');
        formatter._formatter('value', 'other');
        formatter._formatter('value', 'rar');
        assert(colors.green.calledOnce);
      });
      it('empty retuns unaltered value', function () {
        var res = formatter._formatter('empty', 'thing');
        assert(res === 'thing');
      });
      it('empty_value returns unaltered value', function () {
        var res = formatter._formatter('empty_value', 'other');
        assert(res === 'other');
      })
    });
  });

});
