const http = require('http')

// 利用js的getter和setter对http模块的req和res对象进行封装，并且挂载到context上面去。
// 精简版的koa2只对ctx对象设定了url和body属性，主要为了解释Koa2的逻辑。
let request = {
  get url() {
    return this.req.url
  }
}
let response = {
  get body() {
    return this._body
  },
  set body(val) {
    this._body = val
  }
}
let context = {
  get url() {
    return this.request.url
  },
  get body() {
    return this.response.body
  },
  set body(val) {
    this.response.body = val
  }
}

// 自定义的Koa2类
class Application {
  constructor() {
    // 定义属性
    this.context = context
    this.request = request
    this.response = response
    this.middlewares = []
  }
  // 处理中间件函数
  use(callback) {
    // 按顺序将async函数存放到中间件队列中
    this.middlewares.push(callback)
  }

  // 异步的compose模块【核心】
  compose(middlewares) {
    // compose函数返回的是一个函数，
    // 而这个函数又返回另一个dispath函数，
    // 最终得到一个promise，所以在外层调用它时必须要加 await。
    return function (context) {
      return dispatch(0)

      // 定义dispatch递归函数，实现Koa2的洋葱圈模型。
      // 这个函数返回的是一个promise，用于实现异步逻辑。
      function dispatch(i) {
        let fn = middlewares[i]
        // 递归出口
        if (!fn) {
          return Promise.resolve()
        }
        // middlewares队列里面的函数都带有两个固定参数：ctx和next
        return Promise.resolve(fn(context, function next() {
          return dispatch(i + 1)
        }))
      }
    }
  }

  // 开启服务，listen()方法会调用到class中的其它方法
  listen(...args) {
    const server = http.createServer(async (req, res) => {
      // 获取ctx对象
      let ctx = this.createCtx(req, res)
      // 按顺序执行中间件，
      // 在这个过程中会对操作ctx对象，比如为ctx.body赋值。
      const fn = this.compose(this.middlewares)
      await fn(ctx)
      // 当所有中间件的ctx对象全部渲染完毕后，最后再输出响应，
      // 这时候ctx对象中的body属性可能已经有值了。
      res.end(ctx.body)
    })
    // 这里调用http模块原生的listen方法，监听端口……
    server.listen(...args)
  }

  // 这个方法用来构建ctx上下文对象，里面挂载了request和response对象，
  // 而request和response又是对node原生http模块中的req和res的一层封装。
  createCtx(req, res) {
    let ctx = Object.create(this.context)
    ctx.request = Object.create(this.request)
    ctx.response = Object.create(this.response)
    ctx.req = ctx.request.req = req
    ctx.res = ctx.response.res = res
    return ctx
  }
}

module.exports = Application