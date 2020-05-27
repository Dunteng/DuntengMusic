// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database() //请先调用 init 完成初始化后再调用其他云 API。
const showTheTrueFaceCollection = db.collection('showTheTrueFace')

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const data = await showTheTrueFaceCollection.get().then(res => {
    return res.data
  })
  
  return data
  
}