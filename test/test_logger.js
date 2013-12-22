var sinon = require('sinon')
  , assert = require('better-assert')
  , Logger = require('../lib/logging').Logger;

describe('Logger', function () {

  describe('init', function () {
    describe('no namespace', function () {
      var logger = new Logger
      it('should default namespace to \'\'', function () {
        assert('' === logger.namespace);
      });
      it('should have empty namespace_array', function () {
        assert(! logger.namespace_array.length);
      });
      it('should have "<root>" name', function () {
        assert('<root>' === logger.name);
      });
      it('should not have a parent', function () {
        assert(! logger.parent);
      });
      it('should have no handlers', function () {
        assert(! logger._handlers.length);
      });
      it('should have no filters', function () {
        assert(! logger._filters.length);
      });
      it('should have no level', function () {
        assert(! logger._level);
      });
    });

    describe('single depth namespace', function () {
      var logger = new Logger('name');
      it('should have "name" namespace', function () {
        assert('name' === logger.namespace);
      });
      it('should have ["name"] namespace_array', function () {
         assert(1 === logger.namespace_array.length);
         assert('name' === logger.namespace_array[0]);
      });
      it('should have "name" name', function () {
        assert('name' === logger.name);
      });
      it('should have a parent of root namespace', function () {
        assert(logger.parent);
        assert('' === logger.parent.namespace);
      });
    });

    describe('multiple depth namespace', function () {
      var logger = new Logger('name.here');
      it('should have the "name.here" namespace', function () {
        assert('name.here' === logger.namespace);
      });
      it('should have ["name", "here"] namespace_array', function () {
        assert(2 === logger.namespace_array.length);
        assert('name' === logger.namespace_array[0]);
        assert('here' === logger.namespace_array[1]);
      });
      it('should have "here" name', function () {
        assert('here' === logger.name);
      });
      it('should have parent of "name" namespace', function () {
        assert('name' === logger.parent.namespace);
      });
    });

    describe('this.{levels} functions', function () {
      var logger;
      beforeEach(function () {
        sinon.spy(Logger.prototype, 'log');
        logger = new Logger;
      });
      afterEach(function () {
        Logger.prototype.log.restore();
        logger = null;
      });
      ['debug', 'info', 'warning', 'error'].forEach(function (lvl) {
        it('has ' + lvl + ' function', function () {
          assert('function' === typeof logger[lvl]);
        });
        it(lvl + ' function is bound to log with correct level', function () {
          logger[lvl]('this', 'one', 'two');
          assert(logger.log.calledOnce);
          assert(logger.log.calledWithExactly(lvl, 'this', 'one', 'two'));
          assert(logger.log.calledOn(logger));
        });
      });
    });
  });
  
  describe('Logger.getLogger', function () {
    describe('under root logger', function () {
      var logger = new Logger;
      describe('with no argument', function () {
        it('returns a root logger', function () {
          assert('' === logger.getLogger().namespace);
        });
      });
      describe('with argument', function () {
        it('takes a string to get loggers', function () {
          assert('rar' === logger.getLogger('rar').namespace);
          assert('rar.lala' === logger.getLogger('rar.lala').namespace);
        });
        it('takes an array to get loggers', function () {
          assert('rar' === logger.getLogger(['rar']).namespace);
          assert('rar.lala' === logger.getLogger(['rar', 'lala']).namespace);
        });
      });
    });
    describe('under sub namespace', function () {
      var logger = new Logger('ns.here');
      describe('with no argument', function () {
        it('returns a ns.here logger', function () {
          assert('ns.here' === logger.getLogger().namespace);
        });
      });
      describe('with argument', function () {
        it('takes a string to get loggers', function () {
          assert('ns.here.rar' === logger.getLogger('rar').namespace);
          assert('ns.here.rar.lala' === logger.getLogger('rar.lala').namespace);
        });
        it('takes an array to get loggers', function () {
          assert('ns.here.rar' === logger.getLogger(['rar']).namespace);
          assert('ns.here.rar.lala' === logger.getLogger(['rar', 'lala']).namespace);
        });
      });
    });
  });
  describe('Logger.filter', function () {
    describe('with no filters', function () {
      var logger = new Logger;
      it('returns true', function () {
        logger.filter({})
      });
    })
  });
});