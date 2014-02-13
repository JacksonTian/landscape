/*global EventProxy, window*/
/**
 * Landscape
 * @author Jackson Tian
 */
(function (global) {

  // jQuery或者Zepto的引用
  var $ = global.jQuery || global.Zepto;

  /**
   * ## Landscape
   */
  /**
   * Landscape基础对象
   */
  var Landscape = function () {
    this.version = "0.0.3";
  };

  /**
   * 继承方法，用于类的继承
   * @param {Function} parent 父类
   * @param {Object} properties 新属性
   * @return {Function} 新的子类
   */
  Landscape.extend = function (parent, properties) {
    if (typeof parent !== "function") {
      properties = parent;
      parent = function () {};
    }

    properties = properties || {};
    var sub = function () {
      // Call the parent constructor.
      parent.apply(this, arguments);
      // Only call initialize in self constructor.
      if (this.constructor === parent && this.initialize) {
        this.initialize.apply(this, arguments);
      }
    };
    sub.prototype = new parent();
    sub.prototype.constructor = parent;
    // 拷贝附加的属性到原型上
    $.extend(sub.prototype, properties);
    // 返回子类
    return sub;
  };

  global.Landscape = Landscape;

  /**
   * ## Land 视图对象
   */
  /**
   * Land定义，是对jQuery的简单封装，用于约束DOM操作在一个确定的视图内进行
   */
  var Land = function (selector, callback) {
    if (!(this instanceof Land)) {
      return new Land(selector, callback);
    }
    return this.ready(selector, callback);
  };

  /**
   * 当视图准备就绪的时候执行注册的回调函数。
   * 回调函数构成一个密闭的作用域，相关的业务逻辑都被作用域隔离，以此实现逻辑的分割和封装
   */
  Land.prototype.ready = function (selector, callback) {
    var view = this;
    // When document ready
    $(function () {
      view.element = $(selector);
      if (view.element.size()) {
        if (typeof callback === 'function') {
          callback(view);
        }
      } else {
        throw new Error(selector + " block doesn't exist.");
      }
    });
    return this;
  };

  /**
   * 从当前Land视图查找元素，由于查找限定在了当前视图中，所以可以杜绝跨视图访问等问题
   */
  Land.prototype.$ = function (selector) {
    return $(selector, this.element);
  };

  /**
   * 给前Land视图委托事件，采用事件委托可以很好的提升性能。
   * 同时DOM的修改不影响事件的绑定，注册的逻辑可以比较固定。
   */
  Land.prototype.delegate = function (selector, events, handler) {
    this.element.delegate(selector, events, handler);
    return this;
  };

  global.Land = Land;

  /**
   * ## Scape 数据对象
   */

  /**
   * 数据层定义
   */
  var Scape = Landscape.extend(EventProxy, {
    initialize: function (data) {
      this.data = data || {};
    }
  });

  /**
   * ready方法以key绑定事件，如果该值已经被设置过，回调函数将会立即触发一次
   * @param {String} key 数据键名
   * @param {Function} callback 回调函数
   */
  Scape.prototype.ready = function (key, callback) {
    if (this.data.hasOwnProperty(key)) {
      callback({"newVal": this.data[key]});
    }
    this.bind(key, callback);
    return this;
  };

  /**
   * 当多个属性ready或者改变时触发
   */
  Scape.prototype.multi = function () {
    var data = this.data;
    var keys = [].slice.call(arguments, 0, -1);
    var callback = arguments[arguments.length - 1];
    if (typeof callback !== 'function') {
      throw new Error('最后一个参数必须是函数');
    }

    var check = function () {
      var trigger = true;
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (!data.hasOwnProperty(key)) {
          trigger = false;
          break;
        }
      }
      if (trigger) {
        var values = [];
        for (var j = 0; j < keys.length; j++) {
          values.push(data[keys[j]]);
        }
        callback.apply(null, values);
      }
    };

    // 立即检查一次
    check();

    // 为选中的属性绑定事件
    for (var k = 0; k < keys.length; k++) {
      this.bind(keys[k], check);
    }
    // for chain call
    return this;
  };

  /**
   * 设置数据到Scape对象上，会以key触发一个事件。传递值为oldVal和newVal，新旧值
   * @param {String} key 数据键名
   * @param {Mix} value 数据值
   */
  Scape.prototype.set = function (key, value) {
    var oldValue = this.data[key];
    this.data[key] = value;
    this.fire(key, {"oldVal": oldValue, "newVal": value});
    return this;
  };

  /**
   * 获取数据对象的属性值
   * 如果传入formatter函数，则返回格式化的函数
   */
  Scape.prototype.get = function (key, formatter) {
    var val = key ? this.data[key] : this.data;
    return (typeof formatter === 'function') ? formatter(val) : val;
  };

  /**
   * 删除数据对象的属性值
   */
  Scape.prototype.remove = function (key, callback) {
    delete this.data[key];
    if (callback) {
      this.unbind(key, callback);
    }
    return this;
  };

  global.Scape = Scape;
}(window));
