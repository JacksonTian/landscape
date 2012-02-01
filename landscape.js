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

  Land.prototype.getTemplate = function (id) {
    return $("#template_" + id).html();
  };

  global.Land = Land;
}(jQuery, window));

(function (global) {
  var Scape = function () {
    this._proxy = new EventProxy();
  };

  Scape.prototype.ready = function (key, callback) {
    if (this.hasOwnProperty(key)) {
      callback({"newVal": this[key]});
    }
    this._proxy.bind(key, callback);
  };

  Scape.prototype.set = function (key, value) {
    var oldValue = this[key];
    this[key] = value;
    this._proxy.fire(key, {"oldVal": oldValue, "newVal": value});
    return this;
  };

  global.Scape = Scape;
}(window));

