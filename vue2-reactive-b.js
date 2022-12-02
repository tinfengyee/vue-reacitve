/**
 * vue中的观察者模式和发布订阅者模式 转载
 * https://blog.51cto.com/u_15127592/4336598
 */

 class Observer {
  // 需要对value的属性描述重新定义
  constructor(value) {
    this.walk(value); // 初始化的时候就对数据进行监控
  }
  walk(data) {
    Object.keys(data).forEach((key) => {
      defineReactive(data, key, data[key]);
    });
  }
}

function defineReactive(data, key, value) {
  // value 可能是一个对象,要递归劫持，所以数据不能嵌套太深
  observe(value);
  let dep = new Dep();
  Object.defineProperty(data, key, {
    get() {
      // 如果有 watcher，就让 watcher 记住 dep，防止产生重复的 dep, 同时 dep 也收集此 watcher
      if (Dep.target) {
        dep.depend();
      }
      return value;
    },
    set(newVal) {
      // 数据没变动则不处理
      if (value === newVal) return;
      observe(newVal); // 如果新值是个对象，递归拦截
      value = newVal; // 设置新的值
      dep.notify(); // 通知收集的 watcher 去更新
    },
  });
}
function observe(data) {
  // 不是对象则不处理，isObject是用来判断是否为对象的函数
  if (Object.prototype.toString.call(data) !== "[object Object]") return;
  // 通过类来实现数据的观测，方便扩展，生成实例
  return new Observer(data);
}
observe(data);

// -
class Dep {
  static target = null;
  constructor() {
    this.id = id++;
    this.subs = []; // 存放依赖的watcher
  }
  depend() {
    // 让正在执行的watcher记录dep，同时dep也会记录watcher
    Dep.target.addDep(this);
  }
  addSub(watcher) {
    // 添加观察者对象
    this.subs.push(watcher);
  }
  notify() {
    // 触发观察者对象的更新方法
    this.subs.forEach((watcher) => watcher.update());
  }
}
class Watcher {
  constructor(vm, exprOrFn) {
    this.vm = vm;
    this.deps = [];
    // 用来去重，防止多次取同一数据时存入多个相同dep
    this.depId = new Set();
    // exprOrFn是updateComponent
    this.getter = exprOrFn;
    // 更新页面
    this.get();
  }
  get() {
    Dep.target = watcher; // 取值之前，收集 watcher
    this.getter.call(this.vm); // 调用updateComponent更新页面
    Dep.target = null; // 取值完成后，将 watcher 删除
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
    this.get(); // 一修改数据就渲染更新
  }
}
function mountComponent(vm) {
  // 渲染更新页面
  let updateComponent = () => {
    let vnode = vm._render(); // 生成虚拟节点 vnode
    vm._update(vnode); // 将vnode转为真实节点
  };
  // 每个组件都要调用一个渲染 watcher
  new Watcher(vm, updateComponent);
}
mountComponent(vm);
