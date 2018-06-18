const myKoa = require('./application')
const app = new myKoa()

app.use(async (ctx, next) => {
  ctx.body = '1'
  await next()
  ctx.body += '2'
})
app.use(async (ctx, next) => {
  ctx.body += '3'
  await next()
  ctx.body += '4'
})
app.use(async (ctx, next) => {
  ctx.body += '5'
})
app.listen(3000, () => {
  console.log('server runing on port 3000')
})