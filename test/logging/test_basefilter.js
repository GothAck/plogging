var sinon = require('sinon')
  , assert = require('better-assert')
  , logging = require('../../lib/logging')
  , BaseFilter = logging.BaseFilter;

describe('BaseFilter', function () {
  describe('filter', function () {
    var filter = new BaseFilter;
    beforeEach(function () {
      sinon.spy(BaseFilter.prototype, 'filter');
    });
    afterEach(function () {
      BaseFilter.prototype.filter.restore();
    });
    it('throws Error', function () {
      try {
        filter.filter({});
      } catch (e) {}
      assert(filter.filter.calledOnce)
      assert(filter.filter.threw('Error'))
    });
  });
});
