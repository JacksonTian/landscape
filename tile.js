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
      if (view.element.size()) {
        callback(view);
      } else {
        console.log(selector + " block doesn't exist.");
      }
    });
    return this;
  };
  Tile.prototype.$ = function (selector) {
    return $(selector, this.element);
  };

  Tile.prototype.delegate = function (selector, events, handler) {
    this.element.delegate(selector, events, handler);
    return this;
  };

  global.Tile = Tile;
}(jQuery, window));
