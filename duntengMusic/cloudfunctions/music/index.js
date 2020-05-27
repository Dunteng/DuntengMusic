// 云函数入口文件
const cloud = require('wx-server-sdk')
// 引入tcb-router
const TcbRouter = require('tcb-router')
// 引入request-promise
const rp = require('request-promise')

const BASE_URL = 'http://musicapi.xiecheng.live'

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({event})

  app.router('playlist', async (ctx,next)=>{
    // 查询歌单数据，并且是分页查询，按数据创建时间倒序排序
    // 注意,没使用tcb-router之前是用retur返回,现在要用 ctx.body 返回数据到小程序端
    ctx.body = await cloud.database().collection('playlist')
      .skip(event.start)
      .limit(event.count)
      .orderBy('createTime', 'desc')
      .get()
      .then((res) => {
        //  console.log(res)
        return res
      })
  }),

  app.router('musiclist', async (ctx, next)=>{
    ctx.body = await rp(BASE_URL+'/playlist/detail?id='+event.playlistId)
    .then((res)=>{
      return JSON.parse(res)
    })
  })

  // 播放时的具体的一首歌
  app.router('musicUrl', async(ctx,next)=>{
    ctx.body = await rp(BASE_URL+`/song/url?id=${event.musicId}`).then((res)=>{
      return res
    })
  })

  // 加载歌词数据
  app.router("lyric", async(ctx, next)=>{
    ctx.body = await rp(BASE_URL+`/lyric?id=${event.musicId}`).then(res=>{
      return res
    })
  })

  // 必须写! 需要把当前的服务返回
  return app.serve()

}