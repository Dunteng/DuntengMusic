// pages/demo/demo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    result:null,
    testObj:{
      name: 'jim',
      age: 5 
    }
  },

  onChange1(){
    this.setData({
      // testObj : {
      //   name: 'jim',
      //   age : ++this.data.testObj.age
      // }
      ['testObj.age']: ++this.data.testObj.age
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options) //空对象
    wx.getSetting({
      success: res => {
        console.log(res)

        if (res.authSetting['scope.userInfo']) {
          // 只有在获得用户授权后才能正常使用wx.getUserInfo()
          wx.getUserInfo({
            success: (res) => {
              console.log(res)
            }
          })
        }

      }
    })


  },

  onGotUserInfo(event){
    console.log(event)  //得到授权信息
  },


  getOpenid(){
    wx.cloud.callFunction({
      name: 'login',
    }).then(res=>{
      console.log(res)
    })
  },

  onChange(){
    this.setData({
      ['testObj.age']: ++this.data.testObj.age
    })
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