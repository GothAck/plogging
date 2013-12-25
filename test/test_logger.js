var sinon = require('sinon')
  , assert = require('better-assert')
  , logging = require('../lib/logging')
  , Logger = logging.Logger;

describe('Logger', function () {

  describe('init', function () {
    describe('called without new', function () {
      before(function () {
        sinon.stub(logging, 'getLogger');
      });
      after(function () {
        logging.getLogger.restore();
      });
      it('calls getLogger', function () {
        Logger('rar.lala.here');
        assert(logging.getLogger.calledOnce);
        assert(logging.getLogger.calledWithExactly('rar.lala.here'));
      });
    });
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
  describe('filters', function () {
    describe('filter()', function () {
      describe('with none', function () {
        var logger = new Logger;
        it('returns true', function () {
          logger.filter({})
        });
      });
      describe('with three', function () {
        var logger = new Logger
          , record = 1234;
        describe('all pass', function () {
          var mock = sinon.mock({ filter: new Function });
          before(function () {
            logger._filters.splice(0, undefined, mock.object, mock.object, mock.object);
            mock.expects('filter').thrice()
              .withExactArgs(record).returns(true);
          });
          it('returns true and runs all three filters', function () {
            assert(logger.filter(record));
            mock.verify();
          });
          after(mock.restore.bind(mock));
        });
        describe('one fails', function () {
          var mock = sinon.mock({ filter: new Function });
          before(function () {
            logger._filters.splice(0, undefined, mock.object, mock.object, mock.object);
            mock.expects('filter').once()
              .withExactArgs(record).returns(false);
          });
          it('returns false and runs one filter', function () {
            assert(! logger.filter(record));
            mock.verify();
          });
        after(mock.restore.bind(mock));
        });
      });      
    });
    describe('addFilter()', function () {
      var logger = new Logger;
      it('throws when called with object without filter function', function () {
        var err;
        try {
          logger.addFilter({});
        } catch (e) {
          err = e;
        }
        assert(err);
      });
      it('does not throw when called with object with filter function', function () {
        var filter = { filter: new Function };
        logger.addFilter(filter);
      });
    });
    describe('removeFilter()', function () {
      var logger = new Logger;
      it('does not throw when empty', function () {
        assert(0 === logger._filters.length);
        logger.removeFilter({});
      });
      it('removes existing filter', function () {
        var filter = { filter: new Function };
        assert(0 === logger._filters.length);
        logger.addFilter(filter);
        assert(1 === logger._filters.length);
        logger.removeFilter(filter);
        assert(0 === logger._filters.length);
      });
    });
  });

  describe('#handle()', function () {
    var logger = new Logger('rar')
      , record = 1234
      , mock = sinon.mock({ handle: new Function });
    before(function () {
      logger._handlers.splice(0, undefined, mock.object, mock.object, mock.object);
      mock.expects('handle').thrice()
        .withExactArgs(record);
    });
    after(mock.restore.bind(mock));
    beforeEach(function () {
      sinon.stub(logger.parent, 'handle');
    });
    afterEach(function () {
      logger.parent.handle.restore();
    })
    it('calls handle on every handler', function () {
      logger.handle(record);
      mock.verify();
    });
    it('if propagate calls #.parent.handle()', function () {
      logger.handle(record);
      assert(logger.parent.handle.calledOnce);
    });
    it('if not propagate does not call #.parent.handle() ', function () {
      logger.propagate = false;
      logger.handle(record);
      assert(! logger.parent.handle.called);
      logger.propagate = true;
    });
    it('does not die on root logger', function () {
      var tmp_root = new Logger;
      tmp_root.handle(record);
    })
  });

  describe('handlers', function () {
    describe('#addHandler()', function () {
      var logger = new Logger;
      it('throws when handler not subprototype of BaseHandler', function () {
        var err;
        try {
          logger.addHandler({});
        } catch (e) {
          err = e;
        }
        assert(err);
        assert(0 === logger._handlers.length);
      });
      it('does not throw when handler subproto of BaseHandler', function () {
        logger.addHandler(new logging.BaseHandler);
      });
    });
    describe('#removeHandler()', function () {
      var logger = new Logger;
      it('does not throw if no handlers', function () {
        assert(0 === logger._handlers.length);
        logger.removeHandler({});
      });
      it('removes existing handler', function () {
        var handler = new logging.BaseHandler;
        assert(0 === logger._handlers.length);
        logger.addHandler(handler);
        assert(1 === logger._handlers.length);
        // Test removal of non-existing
        logger.removeHandler({});
        assert(1 === logger._handlers.length);
        logger.removeHandler(handler);
        assert(0 === logger._handlers.length);
      });
    })
  });

  describe('makeRecord()', function () {
    var logger = new Logger
      , args = ['name', 'lvl', 'fn', 'lno', 'msg', 'args', 'exc_info', 'func', 'extra']
    it('returns a new Record object', function () {

      var record = logger.makeRecord.apply(logger, args.map(function (a, i) { return i; }));
      assert(record instanceof logging.Record);
      args.forEach(function (arg, i) {
        assert(i === record[arg]);
      });
    });
  });

  describe('log()', function () {
    var logger = new Logger;
    beforeEach(function () {
      sinon.spy(Logger.prototype, 'makeRecord');
      sinon.spy(Logger.prototype, 'handle');
    });
    afterEach(function () {
      Logger.prototype.makeRecord.restore();
      Logger.prototype.handle.restore();
    });
    it('calls makeRecord', function () {
      logger.log('level', 'message', 'one', 'two');
      assert(Logger.prototype.makeRecord.calledOnce);
      assert(Logger.prototype.makeRecord.calledWithExactly(
        logger.namespace, 'level', null, null, 'message', ['one', 'two']
      ));
      assert(Logger.prototype.makeRecord.getCall(0).returnValue instanceof logging.Record)
    });
    it('calls handle', function () {
      logger.log('level', 'message', 'one', 'two');
      assert(Logger.prototype.handle.calledOnce);
      assert(
        Logger.prototype.handle.getCall(0).args[0] ===
        Logger.prototype.makeRecord.getCall(0).returnValue
      );
    });
  });

  describe('setLevel()', function () {
    var logger = new Logger;
    beforeEach(function () {
      logger._level = null;
    });
    it('sets level when valid', function () {
      assert(logger._level === null);
      logger.setLevel('error');
      assert(logger._level === 'error');
    });
    it('does not set level when invalid', function () {
      assert(logger._level === null);
      logger.setLevel('doesntexist');
      assert(logger._level === null);
    });
    it('sets level to null correctly', function () {
      assert(logger._level === null);
      logger.setLevel('error');
      assert(logger._level === 'error');
      logger.setLevel(null);
      assert(logger._level === null);
    });
  });

  describe('getEffectiveLevel()', function () {
    var root_logger = logging.getLogger()
      , deep_logger = logging.getLogger('deep');
    it('returns null when not set and no parent', function () {
      assert(root_logger._level === null);
      assert(deep_logger._level === null);
      assert(root_logger.getEffectiveLevel() === null);
      assert(deep_logger.getEffectiveLevel() === null);
    });
    it('returns current logger level when set', function () {
      assert(root_logger._level === null);
      deep_logger.setLevel('error');
      assert('error' === deep_logger.getEffectiveLevel());
      deep_logger.setLevel(null);
    });
    it('returns parent logger level when set', function () {
      root_logger.setLevel('error');
      assert('error' === root_logger.getEffectiveLevel());
      assert(null === deep_logger._level);

      assert('error' === deep_logger.getEffectiveLevel());
      root_logger.setLevel(null);
    });
  });

});
