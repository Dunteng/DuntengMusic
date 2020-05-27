// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 得到云数据库对象
const db = cloud.database()
// 得到云数据库中playlist集合对象
const playlistCollection = db.collection('playlist')

// 引入request-promise依赖
const rp = require("request-promise")
const URL = 'http://musicapi.xiecheng.live/personalized'
const MAX_LIMIT = 100 //每次读取云数据库的数据云函数中一次只能获取100条，小程序端一次只能获取20条，这里我们进行自定义一次性最大读取数
// 云函数入口函数
exports.main = async (event, context) => {
  // 从云数据库中取到的数据
  // const list = await playlistCollection.get() //不适用了。云函数中一次只能获取100条，小程序端一次只能获取20条
  const countResult = await playlistCollection.count()  //获取到的是一个对象{ total: 30, errMsg: 'collection.count:ok' }
  const total = countResult.total  //取到云数据库中playlist集合的记录的总条数
  // 得出需要向云数据库分多次读取数据的批次
  const batchTimes = Math.ceil(total/MAX_LIMIT)  
  const tasks = []
  for(let i = 0; i<batchTimes; i++){
    let promise = playlistCollection.skip(i*MAX_LIMIT).limit(MAX_LIMIT).get()
    // 这就得到了从第0条取到第99条，从第100条取到第199条，从第200条取到第299条。。。（前提是MAX_LIMIT为100的时候）
    tasks.push(promise)
  }
    // console.log(tasks) //里面是若干个promise对象
  let list = {
    data:[]
  }
  if(tasks.length>0){
    // 使用了promise.all
    list = (await Promise.all(tasks)).reduce((acc, cur)=>{
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }
  // 至此分批读取云数据库的数据完成，解决了小程序读取云数据库数据条数的限制


  // 从第三方服务器端取到的数据
  const playlist = await rp(URL).then((res) => {
    // console.log(typeof res) //在云端测试打印结果为string，需要对其转为对象,并只取result数据
    return JSON.parse(res).result
  })
  // console.log(playlist)

  // 下面进行数据去重，比较从服务器端获取到的数据和云数据库中的集合的数据是否重复
  const newData = []
  for(let i=0, len1=playlist.length; i<len1;i++){
    let flag = true  //一开始默认不重复，标志为true
    for(let j = 0, len2=list.data.length; j<len2; j++){
      if(playlist[i].id===list.data[j].id){
        flag = false  //数据重复了，标志置为false
        break  //有一次重复就跳出循环判断
      }
    }
    if (flag) {
      newData.push(playlist[i])
    }
  }
  // 删除云数据库里的数据，根据where里的条件清空数据
  // try {
  //   return await db.collection('playlist').where({
  //     // canDislike: false
  //     type: 0
  //   }).remove()
  // } catch (e) {
  //   console.error(e)
  // }

  for(let i = 0; i<newData.length; i++){
    // 注意，往云数据库里插入数据的过程是异步过程，也必须加上await关键字
    await playlistCollection.add({
      data:{
        // ...playlist[i],//通过ES6展开运算符进行数据的展开
        ...newData[i],  //不用playlist了，因为没有去重，应使用去重后的newData
        createTime: db.serverDate(), //自定义一个属性，记录数据生成的时间
      }
    }).then((res)=>{
      console.log('插入成功')
    }).catch((err)=>{
      console.error('插入失败')
    })
  }
  console.log("newdata的长度"+newData.length) 
  console.log("playlist的长度"+playlist.length)
}