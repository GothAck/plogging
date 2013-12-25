var sinon = require('sinon')
  , assert = require('better-assert')
  , logging = require('../../lib/logging')
  , BaseHandler = logging.BaseHandler
  , ConsoleHandler = logging.ConsoleHandler;

describe('ConsoleHandler', function () {
  describe('new', function () {
    beforeEach(function () {
      sinon.spy(ConsoleHandler, 'super_');
    });
    afterEach(function () {
      ConsoleHandler.super_.restore();
    });
    it('calls BaseHandler init', function () {
      new ConsoleHandler;
      assert(ConsoleHandler.super_.calledOnce);
    });
  });
  describe('handle', function () {
    var handler = new ConsoleHandler;
    beforeEach(function () {
      sinon.stub(ConsoleHandler.prototype, 'emit');
    });
    afterEach(function () {
      ConsoleHandler.prototype.emit.restore();
    });
    it('calls emit', function () {
      handler.handle(123);
      assert(handler.emit.calledOnce);
      assert(handler.emit.calledWithExactly(123));
    });
  });
  describe('emit', function () {
    var handler = new ConsoleHandler
      , console_methods = ['log', 'info', 'warn', 'error'];
    before(function () {
      handler.console = {
          log: new Function
        , info: new Function
        , warn: new Function
        , error: new Function
      }
      sinon.stub(handler.console);
    });
    beforeEach(function () {
      console_methods.forEach(function (method) {
        handler.console[method].reset();
      })
    });
    it('calls console.error for error level', function () {
      handler.emit({ lvl: 'error', msg: 'rar' });
      assert(handler.console.error.calledOnce);
      assert(! handler.console.warn.called);
      assert(! handler.console.info.called);
      assert(! handler.console.log.called);
    });
    it('calls console.warn for warning level', function () {
      handler.emit({ lvl: 'warning', msg: 'rar' });
      assert(! handler.console.error.called);
      assert(handler.console.warn.calledOnce);
      assert(! handler.console.info.called);
      assert(! handler.console.log.called);
    });
    it('calls console.info for error info', function () {
      handler.emit({ lvl: 'info', msg: 'rar' });
      assert(! handler.console.error.called);
      assert(! handler.console.warn.called);
      assert(handler.console.info.calledOnce);
      assert(! handler.console.log.called);
    });
    it('calls console.log for other levels', function () {
      handler.emit({ lvl: 'doesntexist', msg: 'rar' });
      handler.emit({ lvl: 'other', msg: 'rar' });
      assert(! handler.console.error.called);
      assert(! handler.console.warn.called);
      assert(! handler.console.info.called);
      assert(handler.console.log.calledTwice);
    });
  });
});
