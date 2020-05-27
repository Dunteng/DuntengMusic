// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 得到云数据库对象
const db = cloud.database()
// 得到云数据库中mybanner集合对象
const swiper = db.collection('mybanner')

// 引入request-promise依赖
const rp = require("request-promise")

// 云函数入口函数
exports.main = async (event, context) => {
 return await swiper.skip(event.start)
    .limit(event.count)
    .orderBy('id', 'desc')
    .get()
    .then((res) => {
       console.log(res)
      return res
    })
}