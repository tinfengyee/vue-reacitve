/**
 * 面试官的步步紧逼：Vue2 和 Vue3 的响应式原理比对
 * https://juejin.cn/post/7124351370521477128
 */

// 使用一个全局变量存储被注册的副作用函数
let activeEffect
// 注册副作用函数
function effect(fn) {
    activeEffect = fn
    fn()
}
const obj = new Proxy(data, {
    // getter 拦截读取操作
    get(target, key) {
        // 将副作用函数 activeEffect 添加到存储副作用函数的全局变量 targetMap 中
        track(target, key)
        // 返回读取的属性值
        return Reflect.get(target, key)
    },
    // setter 拦截设置操作
    set(target, key, val) {
        // 设置属性值
        const result = Reflect.set(target, key, val)
        // 把之前存储的副作用函数取出来并执行
        trigger(target, key)
        return result
    }
})
// 存储副作用函数的全局变量
const targetMap = new WeakMap()
// 在 getter 拦截器内追踪依赖的变化
function track(target, key) {
    // 没有 activeEffect，直接返回
    if(!activeEffect) return
    // 根据 target 从全局变量 targetMap 中获取 depsMap
    let depsMap = targetMap.get(target)
    if(!depsMap) {
       // 如果 depsMap 不存，那么需要新建一个 Map 并且与 target 关联
       depsMap = new Map()
       targetMap.set(target, depsMap)
    }
    // 再根据 key 从 depsMap 中取得 deps, deps 里面存储的是所有与当前 key 相关联的副作用函数
    let deps = depsMap.get(key)
    if(!deps) {
       // 如果 deps 不存在，那么需要新建一个 Set 并且与 key 关联
       deps = new Set()
       depsMap.set(key, deps)
    }
    // 将当前的活动的副作用函数保存起来
    deps.add(activeEffect)
}
// 在 setter 拦截器中触发相关依赖
function trgger(target, key) {
    // 根据 target 从全局变量 targetMap 中取出 depsMap
    const depsMap = targetMap.get(target)
    if(!depsMap) return
    // 根据 key 取出相关联的所有副作用函数
    const effects = depsMap.get(key)
    // 执行所有的副作用函数
    effects && effects.forEach(fn => fn())
}

class RefImpl{
  private _value
  public dep
  // 表示这是一个 Ref 类型的响应式数据
  private _v_isRef = true
  constructor(value) {
      this._value = value
      // 依赖存储
      this.dep = new Set()
  }
// getter 访问拦截
  get value() {
      // 依赖收集
      trackRefValue(this)
      return this._value
  }
// setter 设置拦截
  set value(newVal) {
      this._value = newVal
      // 触发依赖
      triggerEffect(this.dep)   
  }
}