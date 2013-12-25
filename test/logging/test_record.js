var sinon = require('sinon')
  , assert = require('better-assert')
  , logging = require('../../lib/logging')
  , Record = logging.Record;

describe('Record', function () {
  describe('new', function () {
    it('sets properties', function () {
      var args = ['name', 'lvl', 'fn', 'lno', 'msg', 'args', 'exc_info', 'func', 'extra']
        , record = new Record(0, 1, 2, 3, 4, 5, 6, 7, 8);

      args.forEach(function (arg, i) {
        assert(record[arg] === i);
      });
      assert(record.date instanceof Date);
    });
  });
});
