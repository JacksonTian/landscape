(function ($, global) {
  var View = function (selector, callback) {
    if (!(this instanceof View)) {
      return new View(selector, callback);
    }
    this.ready(selector, callback);
  };

  View.prototype.ready = function (selector, callback) {
    var view = this;
    $(function () {
      view.element = $(selector);
      callback(view);
    });
    return this;
  };
  View.prototype.$ = function (selector) {
    return this.element.find(selector);
  };

  View.prototype.delegate = function (selector, events, handler) {
    this.element.delegate(selector, events, handler);
    return this;
  };

  global.View = View;
}(jQuery, window));

