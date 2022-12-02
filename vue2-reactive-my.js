function defineReactive(obj, key, val) {
  // value 可能是一个对象,要递归劫持，所以数据不能嵌套太深
  observe(value);
  const dep = new Dep();
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      // 如果有 watcher，就让 watcher 记住 dep，防止产生重复的 dep, 同时 dep 也收集此 watcher
      if (Dep.target) {
        dep.depend();
      }
      return val;
    },
    set: function reactiveSetter(newVal) {
      // 数据没变动则不处理
      if (val === newVal) return;
      observe(newVal); // 如果新值是个对象，递归拦截
      value = newVal; // 设置新的值
      val = newVal;
    },
  });
}

/**
 * 我们所讲的观察者/依赖其实就是 Watcher，我们要通知用到数据的地方，而使用这个数据的地方有很多，类型也不一样，有* 可能是组件的，有可能是用户写的 watch，我们就需要抽象出一个能集中处理这些情况的类。
 **/
class Watcher {
  constructor(vm, expOrFn, cb, options) {
    this.vm = vm;
    this.deps = [];
    // 用来去重，防止多次取同一数据时存入多个相同dep
    this.depId = new Set();
    // exprOrFn是updateComponent
    this.getter = expOrFn;
    this.cb = cb;
    if (options) {
    } // else this.deep = this.user = this.lazy = this.sync = false
  }
  get() {
    Dep.targer = this; // 取值之前，收集 watcher
    let value = this.getter.call(this.vm, this.vm); // // 调用updateComponent更新页面
    Dep.target = null; // 取值完成后，将 watcher 删除
    return value;
  }
  // dep.depend执行时调用
  addDep(dep) {
    let id = dep.id;
    let has = this.depId.has(id);
    if (!has) {
      this.depId.add(id);
      // watcher存放dep
      this.deps.push(dep);
      // dep存放watcher
      dep.addSub(this);
    }
  }
  // 更新页面方法，dep.notify执行时调用
  update() {
    this.value = this.get();
  }
}

class Dep {
  constructor() {
    this.id = uid++;
    this.subs = [];
  }
  addSub(sub) {
    this.subs.push(sub);
  }
  removeSub(sub) {
    // 省略
  }
  depend() {
    if (Dep.target) {
      // 让正在执行的watcher记录dep，同时dep也会记录watcher
      Dep.target.addDep(this);
    }
  }
  notify() {
    this.subs.forEach((watcher) => watcher.update());
  }
}

class Observer {
  constructor(value) {
    this.value = value;
    // 添加一个对象依赖收集的选项
    this.dep = new Dep();
    // 给响应式对象添加 __ob__ 属性，表明这是一个响应式对象
    def(value, "__ob__", this);
    if (Array.isArray(value)) {
      // 复写 Array 7个方法
    } else {
      this.walk(value);
    }
  }

  walk(value) {
    Object.keys(value).forEach((key) => {
      // 遍历对象的属性进行响应式设置
      defineReactive(value, key, value[key]);
    });
  }
}

function observe(value) {
  if (Object.prototype.toString.call(value).slice(8, -1) !== "Object") return;
  return new Observer(value);
}

// 定义一个属性
function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true,
  });
}
