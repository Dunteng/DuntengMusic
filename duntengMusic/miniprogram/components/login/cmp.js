// components/login/cmp.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: Boolean,//简写方式，默认为false
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onGotUserInfo(event){
      console.log(event)
      const userInfo = event.detail.userInfo
      // 用户允许授权
      if(userInfo){
        // 关闭底部弹出层
        this.setData({
          show: false
        })
        // 传递用户信息给父级blog
        this.triggerEvent('loginsuccess', userInfo)
      }else{
        // 授权失败
        this.triggerEvent('loginfail')
      }
    }
  }
})
