// miniprogram/pages/blog/blog.js
const app = getApp()

let keyword = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 控制底部弹出层是否显示
    show: false,
    blogList: [],
    passwordLayer: true,
    showTheTrueFace: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._loadBlogList()

    let _Interval = setInterval(() => {
      console.log(app.globalData)
      if (app.globalData.resData != "占位") {
        clearInterval(_Interval)
        this.setData({
          showTheTrueFace: app.globalData.showTheTrueFace
        })
        console.log("清除interval并成功赋值showTheTrueFace")
      }
    }, 100)
  },

  _loadBlogList( start = 0 ){
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'blog',
      data:{
        keyword,
        start,
        count: 10,
        $url: 'list',
      }
    }).then(res=>{
      console.log(res)
      this.setData({
        blogList: this.data.blogList.concat(res.result)
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()  //这步e不写的话真机不会回弹页面
    })
  },

  /** 验证密钥输入 */
  onInput(e){
    const value = e.detail.value
    console.log(value, typeof value)
    if(value === '0911'){
      this.setData({
        passwordLayer: false
      })
    }
  },

  // 发布功能
  onPublish(){
    const _this = this
    wx.getSetting({
      success(res){
        console.log(res)
        if(res.authSetting['scope.userInfo']){
          // 如果已授权则getUserInfo
          wx.getUserInfo({
            success(res){
              // console.log(res)
              // 调用onLoginSuccess跳转到博文编辑页面
              _this.onLoginSuccess({
                detail: res.userInfo
              })
            }
          })
        }else{
          // 未授权则弹出底层弹出层
          _this.setData({
            show: true
          })
        }
      }
    })

  },

  onLoginSuccess(event){
    console.log(event)
    let detail = event.detail
    detail.avatarUrl = detail.avatarUrl.replace('/132','/0')
    // 用户头像图片的 URL。URL 最后一个数值代表正方形头像大小（有 0、46、64、96、132 数值可选，0 代表 640x640 的正方形头像，46 表示 46x46 的正方形头像，剩余数值以此类推。默认132），用户没有头像时该项为空。若用户更换头像，原有头像 URL 将失效。
    console.log(detail)
    wx.navigateTo({
      // 跳转到编辑页面并把昵称和头像传递过去
      url: `../blog-edit/blog-edit?nickName=${detail.nickName}&avatarUrl=${detail.avatarUrl}`,
    })
  },

  onLoginFail(){
    wx.showModal({
      title: '请您先授权',
    })
  },

  goComment(event){
    console.log(event)
    wx.navigateTo({
      url: '../../pages/blog-comment/blog-comment?blogId='+event.target.dataset.blogid,
    })
  },

  onSearch(event){
    console.log(event.detail.keyword)
    // 我们搜索出结果的时候，首先清空blogList
    this.setData({
      blogList: [],
    })
    keyword=event.detail.keyword
    this._loadBlogList(0)
  },

  onGoback(){
    this.setData({
      blogList: [],
    })
    keyword = ''
    this._loadBlogList(0)

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
    this.setData({
      blogList: []
    })
    this._loadBlogList(0)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._loadBlogList(this.data.blogList.length)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (event) {
    console.log(event)
    let blogObj = event.target.dataset.blog
    return {
      title: blogObj.content,
      path: `/pages/blog-comment/blog-comment?blogId=${blogObj._id}`,
      imageUrl: blogObj.img[0]
    }
  }
})