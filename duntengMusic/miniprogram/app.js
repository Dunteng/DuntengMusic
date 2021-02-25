//app.js
App({
  onLaunch: function (options) {
    this.checkUpdate()  //检查更新
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'dev-r049g',
        traceUser: true,  //记录小程序的访问者
      })
    }

    this.globalData = {
      playingMusicId: -1,
      openid: -1,  // 正常用户的openid不会是-1，这里占位用于存储真正的openid
      showTheTrueFace: false,
      resData: '占位'
    }  
    this.getOpenid()
    this.getShowTheTrueFace()
  },
  setPlayingMusicId(musicId){
    this.globalData.playingMusicId = musicId
  },
  getPlayingMusicId(){
    return this.globalData.playingMusicId
  },

  onShow(options){
  },
  
  getOpenid(){
    wx.cloud.callFunction({
      name: 'login'
    }).then(res=>{
      this.globalData.openid = res.result.openid
      if (wx.getStorageSync(this.globalData.openid)==''){
        wx.setStorageSync(this.globalData.openid, []) // 一开始就获得openid作为本地缓存的key，初始时缓存为空数组
      }else{
        // 否则什么都不做
      }

    })
  },

  getShowTheTrueFace(){  // 向云数据库获取页面正常显示的标志， 为了应付审查
    wx.cloud.callFunction({
      name: 'getShowTheTrueFace'
    }).then(res=>{
      this.globalData.resData = res.result[0]
      this.globalData.showTheTrueFace = res.result[0].show
    })
  },

  checkUpdate(){
    const updateManager = wx.getUpdateManager()
    // 检测版本更新
    updateManager.onCheckForUpdate(res=>{
      if(res.hasUpdate){
        updateManager.onUpdateReady(()=>{
          wx.showModal({
            title: '更新提示',
            content: '当前有新版本，是否重启',
            success(res){
              if(res.confirm){
                updateManager.applyUpdate()
              }
            }
          })
        })
      }
    })
  },

})
