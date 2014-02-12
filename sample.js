/*global Scape*/
!(function () {
  // 无需键值的Scape对象
  var Sample = function () {
    this.key = 'no_key';
    this.scape = new Scape();
  };

  Sample.prototype.set = function (val) {
    this.scape.set(this.key, val);
    return this;
  };

  Sample.prototype.get = function (formatter) {
    return this.scape.get(this.key, formatter);
  };

  Sample.prototype.ready = function (callback) {
    this.scape.ready(this.key, callback);
    return this;
  };

  Sample.prototype.remove = function (callback) {
    this.scape.remove(this.key, callback);
    return this;
  };

  /**
   * 返回一个无需键值的Scape对象
   */
  Scape.sample = function () {
    return new Sample();
  };
}());
