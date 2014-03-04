/*global window, _*/
!(function () {
  var root = this;

  var Tile = function (el, template) {
    if (!(this instanceof Tile)) {
      return new Tile(el, template);
    }
    this.el = el;
    if (!Tile.compile) {
      throw new Error('need a template engine.');
    }
    this.renderFn = Tile.compile(template);
  };

  Tile.prototype.setData = function (data) {
    this.data = data || {};
    this.render();
  };

  // 渲染数据到DOM中
  Tile.prototype.render = function () {
    this.el.html(this.renderFn(this.data));
    return this;
  };

  Tile.compile = window._ && _.template;

  root.Tile = Tile;
}());
