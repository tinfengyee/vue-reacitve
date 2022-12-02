/**
 * 面试官的步步紧逼：Vue2 和 Vue3 的响应式原理比对
 * https://juejin.cn/post/7124351370521477128
 */

/**
* 这里的函数 defineReactive 用来对 Object.defineProperty 进行封装。
**/
function defineReactive(data, key, val) {
  // 依赖存储的地方
  const dep = new Dep()
  Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      get: function () {
          // 在 getter 中收集依赖
          dep.depend()
          return val
      },
      set: function(newVal) {
          val = newVal
          // 在 setter 中触发依赖
          dep.notify()
      }
  }) 
}

/**
* 我们所讲的依赖其实就是 Watcher，我们要通知用到数据的地方，而使用这个数据的地方有很多，类型也不一样，有* 可能是组件的，有可能是用户写的 watch，我们就需要抽象出一个能集中处理这些情况的类。
**/
class Watcher {
  constructor(vm, exp, cb) {
      this.vm = vm
      this.getter = exp
      this.cb = cb
      this.value = this.get()
  }

  get() {
      Dep.target = this
      let value = this.getter.call(this.vm, this.vm)
      Dep.target = undefined
      return value
  }

  update() {
      const oldValue = this.value
      this.value = this.get()
      this.cb.call(this.vm, this.value, oldValue)
  }
}

/**
* 我们把依赖收集的代码封装成一个 Dep 类，它专门帮助我们管理依赖。
* 使用这个类，我们可以收集依赖、删除依赖或者向依赖发送通知等。
**/
class Dep {
  constructor() {
      this.subs = []
  }
  
  addSub(sub) {
      this.subs.push(sub)
  }
  
  removeSub(sub) {
      remove(this.subs, sub)
  }

  depend() {
      if(Dep.target){
          this.addSub(Dep.target)
      }
  }

  notify() {
      const subs = this.subs.slice()
      for(let i = 0, l = subs.length; i < l; i++) {
          subs[i].update()
      }
  }
}

// 删除依赖
function remove(arr, item) {
  if(arr.length) {
      const index = arr.indexOf(item)
      if(index > -1){
          return arr.splice(index, 1)
      } 
  }
}