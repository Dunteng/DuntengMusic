// 云函数入口文件
const cloud = require('wx-server-sdk')
// 引入tcb-router
const TcbRouter = require('tcb-router')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  // return {event,context}  //看看event和context到底是啥

  // new一个TcbRouter对象,需要传入一个参数,把event传入
  // 这时候tcb-router就会自动帮我们处理事件中的参数和路由转发
  const app = new TcbRouter({event})

  // 公共路由
  // app.use 表示该中间件会适用于所有的路由
  app.use(async (ctx,next)=>{
    console.log('进入全局中间件')
    ctx.data = {}
    ctx.data.openId = event.userInfo.openId //通过该公共路由获取到用户openid
    await next()  //执行一下中间件.这是一个异步操作,要加上await
    console.log('退出全局中间件')
  })

  // music相关的路由
  app.router('music', async (ctx,next)=>{
    console.log('进入音乐名称路由中间件')
    ctx.data.musicName = "Let it be"
    await next()  //执行一下中间件
    console.log('退出音乐名称路由中间件')
  }, async (ctx, next)=>{
    console.log('进入音乐类型路由中间件')
    ctx.data.musicType = '摇滚乐'
    ctx.body = {
      data: ctx.data
    }
    // ctx.body 返回数据到小程序端
    console.log('退出音乐类型路由中间件')
  })

  // movie相关的路由
  app.router('movie', async (ctx,next)=>{
    console.log('进入电影名称路由中间件')
    ctx.data.movieName = "千与千寻"
    await next()  //执行一下中间件
    console.log('退出电影名称路由中间件')
  }, async (ctx, next)=>{
    console.log('进入电影类型路由中间件')
    ctx.data.movieType = '动漫'
    ctx.body = {
      data: ctx.data
    }
    // ctx.body 返回数据到小程序端
    console.log('退出电影类型路由中间件')
  })

  // // 必须写! 需要把当前的服务返回
  return app.serve()
}