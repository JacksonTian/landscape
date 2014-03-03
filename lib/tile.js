/*global window, _, Scape*/
!(function () {
  var root = this;

  var Tile = function (el, template, data) {
    if (!(this instanceof Tile)) {
      return new Tile(el, template, data);
    }
    this.el = el;
    if (!Tile.compile) {
      throw new Error('need a template engine.');
    }
    this.renderFn = Tile.compile(template);
    if (data instanceof Scape) {
      this.data = data;
    } else {
      this.data = new Scape(data);
    }
    var that = this;
    this.data.bindForAll(function () {
      that.render();
    });
    this.render();
  };

  // 渲染数据到DOM中
  Tile.prototype.render = function () {
    this.el.html(this.renderFn(this.data.toData()));
    return this;
  };

  Tile.compile = window._ && _.template;

  root.Tile = Tile;
}());
