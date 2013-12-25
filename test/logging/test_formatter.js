var sinon = require('sinon')
  , assert = require('better-assert')
  , logging = require('../../lib/logging')
  , moment = require('moment')
  , Formatter = logging.Formatter;

describe('Formatter', function () {
  describe('new', function () {
    it('has defaults', function () {
      var formatter = new Formatter;
      assert(formatter.fmt === '%(date)s - %(lvl)s - %(name)s - %(msg)s');
      assert(formatter.datefmt === '');
    });
    it('sets properties', function () {
      var formatter = new Formatter('format', 'dateformat');
      assert(formatter.fmt === 'format');
      assert(formatter.datefmt === 'dateformat');
    });
  });
  describe('formatDate', function () {
    var formatter = new Formatter;
    beforeEach(function () {
      sinon.spy(moment.fn, 'format');
    });
    afterEach(function () {
      moment.fn.format.restore();
    });
    it('calls moment.format with this.datefmt', function () {
      var date = new Date
        , ret = formatter.formatDate(date);
      assert(moment.fn.format.calledOnce);
      assert(moment.fn.format.calledWithExactly(''));
      assert(ret === moment(date).format());
    });
  });
  describe('#format()', function () {
    var fields = ['date', 'name', 'lvl', 'fn', 'lno', 'msg', 'exc_info', 'func', 'extra']
      , record = { args: [100, 101, 102] };
    fields.forEach(function (f, i) {
      record[f] = i;
    });
    before(function () {
      sinon.stub(Formatter.prototype, 'formatDate', String);
    });
    after(function () {
      Formatter.prototype.formatDate.restore();
    });
    beforeEach(function () {
      sinon.spy(Formatter.prototype, 'format');
    });
    afterEach(function () {
      Formatter.prototype.format.restore();
    });
    it('replaces all %(rar)s fields', function () {
      var formatter = new Formatter('%(' + fields.join(')s %(') + ')s')
        , res = formatter.format(record)
        , expected = fields.map(function (f, i) { return i }).join(' ');
      assert(expected === res);
    });
    describe('%s fields', function () {
      it('replaces all', function () {
        var formatter = new Formatter('%s %s %s')
          , res = formatter.format(record)
          , expected = record.args.join(' ');
        assert(expected === res);
      });
      it('returns when record.args length is more than the number of fields', function () {
        var formatter = new Formatter('%s %s');
        assert('100 101' === formatter.format(record));
      });
      it('throws Error when record.args length is less than the number of fields', function () {
        var formatter = new Formatter('%s %s %s %s');
        try {
          formatter.format(record);
        } catch (e) {}
        assert(formatter.format.threw('Error'))
      });
    });
  });
});
