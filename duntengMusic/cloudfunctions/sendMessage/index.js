// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  // const { OPENID } = cloud.getWXContext()
  try {
    const result = await cloud.openapi.subscribeMessage.send ({
      // touser: OPENID,
      touser: event.openid,
      page: `/pages/blog-comment/blog-comment?blogId=${event.blogId}`,
      data: {
        thing1:{
          value: "发布的动态有新回复啦！"
        },
        thing3: {
          value: event.content  
        }
      },
      templateId: 'Vs66cfna_zW0TP4L53sqxY7d2wV8qLkS6TimIBIkfis'
    })
    console.log(result)
    return result
  } catch (err) {
    console.log(err)
    return err
  }
}