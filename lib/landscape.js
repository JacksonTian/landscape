/*global EventProxy, window*/
/**
 * Landscape
 * @author Jackson Tian
 */
(function (global) {

  // 获取jQuery或者Zepto的引用
  var $ = global.jQuery || global.Zepto;

  /**
   * ## Landscape
   * Landscape由Land和Scape两个部分构成。一个是视图相关的简单模块，一个是基于消息的数据模型
   */
  /**
   * Landscape基础对象
   */
  var Landscape = function () {};

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

  // 挂载到全局中
  global.Landscape = Landscape;

  /**
   * ## Land 视图对象
   * Land视图对象是通过将页面进行模块划分，同时形成独有的作用域，可以将视图的业务逻辑包含在其中。
   * 无耦合的业务编码，业务改变或者删除时，直接将此块代码删除即可
   *
   * Example:
   * ```
   * Land('#header', function (view) {
   *   var logo = view.$('.logo');
   *   view.delegate('.logo', 'click', function (event) {
   *     // Logo的click逻辑
   *     logo.addClass('highlight');
   *   });
   *   view.delegate('.logout', 'click', function (event) {
   *     // 退出逻辑
   *   });
   * });
   * ```
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
    // 只有DOM ready后才会执行，非常安全
    $(function () {
      view.el = view.element = $(selector);
      if (view.el.size()) {
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
    return $(selector, this.el);
  };

  /**
   * 给前Land视图委托事件，采用事件委托可以很好的提升性能。
   * 同时DOM的修改不影响事件的绑定，注册的逻辑可以比较固定。
   */
  Land.prototype.delegate = function (selector, events, handler) {
    this.el.delegate(selector, events, handler);
    return this;
  };

  // 挂载Land到全局
  global.Land = Land;

  /**
   * ## Scape 数据对象
   * Scape数据对象是带有消息驱动的特殊对象，当对象的属性发生更改时，会触发属性同名的事件。
   *
   * Example:
   * ```
   * var scape = new Scape();
   * scape.ready('name', function (event) {
   *   // 当name属性被设置过，或发生更改时触发事件
   *   // event.newVal 更改后的值
   *   // event.oldVal 更改前的值 
   * });
   * // 设置属性name的值
   * // 这会触发一次`name`事件
   * scape.set('name', 'Jackson Tian');
   *
   * // onchange可以监听多个属性
   * scape.onchange('name', 'age', function (name, age) {
   *   // name和age属性都被设置过，或者设置过后，任一属性发生改变时触发
   * });
   * ```
   * Land在进行视图划分后，页面的模块与模块之间的关联交互无法完成。
   * 但正是基于Scape数据对象的消息驱动特性，跨模块的关联行为可以很好的完成。
   * 比如搜索框中的词汇发生变化时，相关的sidebar，接收到该事件，进行相应联动
   */

  /**
   * 数据层定义
   */
  var Scape = Landscape.extend(EventProxy, {
    initialize: function (data) {
      // 内部维护的对象
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
  Scape.prototype.onchange = function () {
    var data = this.data;
    var keys = [].slice.call(arguments, 0, -1);
    var callback = arguments[arguments.length - 1];
    if (typeof callback !== 'function') {
      throw new Error('最后一个参数必须是函数');
    }

    // 检查是否所有监听的属性都存在
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
        // 如果触发，收集属性
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
    // 卸载绑定的事件
    if (callback) {
      this.unbind(key, callback);
    }
    return this;
  };

  global.Scape = Scape;
}(window));
