(function ($, global) {
  var Land = function (selector, callback) {
    if (!(this instanceof Land)) {
      return new Land(selector, callback);
    }
    this.ready(selector, callback);
  };

  Land.prototype.ready = function (selector, callback) {
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
  Land.prototype.$ = function (selector) {
    return $(selector, this.element);
  };

  Land.prototype.delegate = function (selector, events, handler) {
    this.element.delegate(selector, events, handler);
    return this;
  };

  global.Land = Land;
}(jQuery, window));
