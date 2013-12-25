var sinon = require('sinon')
  , assert = require('better-assert')
  , logging = require('../../lib/logging')
  , BaseHandler = logging.BaseHandler
  , Formatter = logging.Formatter;

describe('BaseHandler', function () {
  describe('new', function () {
    it('sets formatter to instance of BaseFormatter', function () {
      var handler1 = new BaseHandler
        , handler2 = new BaseHandler;
      assert(handler1._formatter instanceof Formatter);
      assert(handler1._formatter === handler2._formatter);
    });
  });
  describe('emit', function () {
    var base_handler = new BaseHandler;
    beforeEach(function () {
      sinon.spy(BaseHandler.prototype, 'emit');
    });
    afterEach(function () {
      BaseHandler.prototype.emit.restore();
    });
    it('throws Error', function () {
      try {
        base_handler.emit({});
      } catch (e) {}
      assert(base_handler.emit.calledOnce);
      assert(base_handler.emit.threw('Error'))
    });
  });
  describe('format', function () {
    var base_handler = new BaseHandler;
    beforeEach(function () {
      sinon.spy(base_handler._formatter, 'format');
    });
    afterEach(function () {
      base_handler._formatter.format.restore();
    });
    it('calls _formatter.format', function () {
      base_handler.format({});
      assert(base_handler._formatter.format.calledOnce);
    });
  });
  describe('#setFormatter()', function () {
    var base_handler = new BaseHandler;
    beforeEach(function () {
      sinon.spy(base_handler, 'setFormatter');
    });
    afterEach(function () {
      base_handler.setFormatter.restore();
    })
    it('sets new formatter when called with a subproto of Formatter', function () {
      var formatter = new Formatter;
      assert(base_handler._formatter !== formatter);
      base_handler.setFormatter(formatter);
      assert(base_handler._formatter === formatter);
    });
    it('throws Error when called with other objects', function () {
      try {
        base_handler.setFormatter({});
      } catch (e) {}
      assert(base_handler.setFormatter.threw('Error'));
    });
  });
});
