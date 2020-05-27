// miniprogram/pages/playlist/playlist.js
const MAX_LIMIT = 15  //每次从云数据库中取出十五条歌单数据
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperImgUrls: [],
    // 歌单数据列表
    playlist:[],
    showTheTrueFace: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getSwiper()
    this._getPlaylist()
    console.log(app.globalData)

    let _Interval = setInterval(()=>{
      console.log(app.globalData)
      if(app.globalData.resData!="占位"){
        clearInterval(_Interval)
        this.setData({
          showTheTrueFace: app.globalData.showTheTrueFace
        })
        console.log("清除interval并成功赋值showTheTrueFace")
      }
    },100)
  },

// 获取歌单信息
  _getPlaylist(){
    wx.showLoading({
      title: '加载中',
    })

    wx.cloud.callFunction({
      name: 'music',
      data: {
        start: this.data.playlist.length,
        count: MAX_LIMIT,
        // 云函数music被tcb-router化后要使用$url指定路由
        $url: 'playlist'
      }
    }).then((res) => {
      // console.log(res)
      this.setData({
        playlist: this.data.playlist.concat(res.result.data) //注意是追加歌单数据而非替换歌单数据
      })
      wx.stopPullDownRefresh() //关闭下拉刷新动作
      wx.hideLoading() //记得关闭loading
    })
  },

// 获取轮播图信息
_getSwiper(){
  wx.cloud.callFunction({
    name: 'getSwiper',
    data:{
      "start": 0,
      "count": 5
    }
  }).then(res=>{
    // console.log(res)
    this.setData({
      swiperImgUrls: res.result.data
    })
  })

  setTimeout(()=>{
    console.log(66)
    this.setData({
      dunteng: true
    })
  },2000)
},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // 下拉刷新动作是要先清空数据,然后再重新请求数据
    this.setData({
      playlist:[]  
    })
    this._getPlaylist()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._getPlaylist()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})