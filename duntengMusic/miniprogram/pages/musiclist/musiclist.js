// pages/musiclist/musiclist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //歌单详情信息
    listInfo: {},
    // 歌曲列表
    musiclist: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    console.log(options) //可以获取到路由传进来的参数，这里是歌单id
    wx.cloud.callFunction({
      name: 'music',
      data:{
        playlistId: options.playlistId,
        $url: 'musiclist'
      }
    }).then((res)=>{
      // console.log(res)
      const pl = res.result.playlist
      this.setData({
        musiclist: pl.tracks,
        listInfo: {
          coverImgUrl: pl.coverImgUrl,
          name: pl.name
        }
      })
      this._setMusiclist() // 歌曲列表信息存入缓存
      wx.hideLoading()
    })
  },

  _setMusiclist(){
    wx.setStorageSync('musiclist', this.data.musiclist)
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})