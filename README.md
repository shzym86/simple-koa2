## 精简版Koa2原理

通过node的http模块构建一个最简单的Koa2，主要学习Koa2源码中ctx和middleware的实现原理。

#### 核心点：

- 封装http模块
- 封装ctx对象，包含request对象和response对象
- 中间件实现原理：异步[compose](https://github.com/shzym86/koa2-learning/blob/master/koa-middleware-compose.js)模块

#### 测试

```bash
node server.js
```

打开浏览器输入: http://localhost:3000
页面中会显示：1 3 5 4 2
