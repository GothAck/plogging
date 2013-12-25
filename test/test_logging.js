var sinon = require('sinon')
  , assert = require('better-assert')
  , logging = require('../lib/logging')
  , ConsoleHandler = logging.ConsoleHandler;

describe('logging base functionality', function () {
  describe('root logger', function () {
    var root_logger = logging.getLogger();
    it('has ConsoleHandler', function () {
      assert(1 === root_logger._handlers.length)
      assert(root_logger._handlers[0] instanceof ConsoleHandler);
    });
  });
  describe('getLogger', function () {
    it('returns singleton of each logger', function () {
      assert(logging.getLogger()            === logging.getLogger());
      assert(logging.getLogger('rar')       === logging.getLogger('rar'));
      assert(logging.getLogger('rar.lala')  === logging.getLogger('rar.lala'));
      assert(logging.getLogger('rar')       === logging.getLogger('rar.lala').parent);
      assert(logging.getLogger('rar')       !== logging.getLogger('rar.lala'));
    });
  });
});
