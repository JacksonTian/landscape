(function ($, global) {
  var Tile = function (selector, callback) {
    if (!(this instanceof Tile)) {
      return new Tile(selector, callback);
    }
    this.ready(selector, callback);
  };

  Tile.prototype.ready = function (selector, callback) {
    var view = this;
    $(function () {
      view.element = $(selector);
      callback(view);
    });
    return this;
  };
  Tile.prototype.$ = function (selector) {
    return this.element.find(selector);
  };

  Tile.prototype.delegate = function (selector, events, handler) {
    this.element.delegate(selector, events, handler);
    return this;
  };

  global.Tile = Tile;
}(jQuery, window));
