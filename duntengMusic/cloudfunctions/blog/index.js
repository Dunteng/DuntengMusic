// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const TcbRouter = require('tcb-router')
// const db = wx.cloud.database()  在云端这样写是错的，不用加wx
const db = cloud.database()
const blogCollection = db.collection('blog')
const blogCommentCollection = db.collection('blog-comment')

const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  app.router('list', async (ctx, next)=>{
    const keyword = event.keyword
    let w = {}
    if(keyword.trim()!=''){
      w = {
        content: new db.RegExp({
          regexp: keyword,
          options: 'i'  // i表示忽略大小写
        })
      }
    }
    
    let blogList = await blogCollection.where(w).skip(event.start)
                    .limit(event.count)
                    .orderBy('createTime','desc')
                    .get()
                    .then(res=>{
                      return res.data
                    })
    ctx.body = blogList //返回数据
  })


  app.router('detail', async (ctx,next)=>{
    let blogId = event.blogId
    // 博文详情查询
    let detail = await blogCollection.where({
      _id: blogId
    }).get().then(res=>{
      return res.data
    })

    // 评论查询
    const countResult = await blogCommentCollection.count()
    const total = countResult.total   // 评论总条数
    let commentList = {
      data: []
    }
    if(total>0){ // 如果又total>0，说明有评论，要进行查询
      // 所有评论总数 / 最大查询量 然后向上取整，即为要查询所有评论要进行的次数
      const batchTimes = Math.ceil(total/MAX_LIMIT) 
      const tasks = []
      for(let i = 0; i<batchTimes; i++){
        let promise = blogCommentCollection.skip(i * MAX_LIMIT)
                      .limit(MAX_LIMIT).where({
                        blogId: blogId
                      }).orderBy('createTime','desc')
                      .get()
        tasks.push(promise)  
      } 
      if(tasks.length>0){
        commentList = (await Promise.all(tasks)).reduce((acc,cur)=>{
          return {
            data: acc.data.concat(cur.data)
          }
        })
      }
    }

    ctx.body={
      commentList,
      detail
    }

  })

  const wxContext = cloud.getWXContext()
  app.router('getListByOpenid', async(ctx, next)=>{
    ctx.body = await blogCollection.where({
      _openid: wxContext.OPENID
    }).skip(event.start).limit(event.count)
    .orderBy('createTime', 'desc').get().then(res=>{
      return res.data
    })
  })


  return app.serve()  //注意这个serve后面的括号别丢了，我有次查bug查了好久竟是因为丢了这个圆括号
}