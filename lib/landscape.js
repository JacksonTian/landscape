/*global EventProxy, window*/
(function (global) {
  var $ = global.jQuery || global.Zepto;
  var Landscape = function () {
    this.version = "0.0.3";
  };

  /**
   * 继承
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
    $.extend(sub.prototype, properties);
    return sub;
  };

  global.Landscape = Landscape;
}(window));

(function (global) {
  var $ = global.$;
  /**
   * Land定义，是对jQuery的简单封装，用于约束DOM操作在一个确定的视图内进行
   */
  var Land = function (selector, callback) {
    if (!(this instanceof Land)) {
      return new Land(selector, callback);
    }
    return this.ready(selector, callback);
  };

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
   * 从当前Land视图查找元素
   */
  Land.prototype.$ = function (selector) {
    return $(selector, this.element);
  };

  /**
   * 给前Land视图委托事件
   */
  Land.prototype.delegate = function (selector, events, handler) {
    this.element.delegate(selector, events, handler);
    return this;
  };

  global.Land = Land;
}(window));

(function (global) {
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

    for (var k = 0; k < keys.length; k++) {
      this.bind(keys[k], check);
    }
    // for chain
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
   * 获取Scape的值
   */
  Scape.prototype.get = function (key, formatter) {
    var val = key ? this.data[key] : this.data;
    return (typeof formatter === 'function') ? formatter(val) : val;
  };

  /**
   * 删除
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
