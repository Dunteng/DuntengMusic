// components/blog-ctrl/cmp.js
let userInfo = {}
const db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String,
    blog: Object,
    isLike: Boolean,
    openid: String,
  },

  externalClasses:[
    "iconfont",
    "icon-pinglun",
    "icon-fenxiang",
    "icon-dislike",
    "icon-like"
  ],

  /**
   * 组件的初始数据
   */
  data: {
    // 登录组件是否显示
    loginShow: false,
    // 底部弹出层是否显示
    layerShow: false,
    content: ""
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment(){
      // 判断用户是否授权，若是，则显示评论弹出层，否则设置loginShow为true,显示要求授权
      wx.getSetting({
        success: (res)=>{
          if(res.authSetting['scope.userInfo']){
            wx.getUserInfo({
              success:(res)=>{
                userInfo = res.userInfo
                // 显示评论弹出层
                this.setData({
                  layerShow: true
                })
              }
            })
          }else{
            this.setData({
              loginShow: true
            })
          }
        }
      })
    },

    onLoginsuccess(event){
      userInfo = event.detail
      // 授权框消失，评论弹出层显示
      this.setData({
        loginShow: false,
      },()=>{
        this.setData({
          layerShow: true
        })
      })
      //setData其实有第二个参数，是一个回调函数，将layerShow写在回调函数里
      //进行赋值，可以慢于loginShow的赋值，产生一个先后顺序的效果
    },

    onLoginfail(){
      wx.showModal({
        title: '授权后才可评论',
        content: '',
      })
    },

    onInput(event){
      this.setData({
        content: event.detail.value
      })
      // console.log(this.data.content)
    },

    like(e){
      let query = e.currentTarget.dataset['param']
      console.log(query)
      db.collection('blog').where({
        _id: this.properties.blogId
      }).update({
        data: {
          isLike: query
        },
        success: function(res) {
          console.log(res)
        }
      }),
      this.setData({
        isLike: !this.properties.isLike
      })
    },

    onSend(){

      // 插入数据库
      let content = this.data.content
      let that = this
      if(content.trim()==""){
        wx.showModal({
          title: '评论内容不能为空',
          content: '',
        })
        return
      }

      wx.showLoading({
        title: '评论中',
        mask: true,
      })

      // 往云数据库中插入评论数据
      db.collection('blog-comment').add({
        data: {
          content,
          createTime: db.serverDate(),
          blogId: that.properties.blogId,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }
      }).then(res => {
        console.log(res)
        // 收起评论框
        that.setData({
          layerShow: false,
          content: ""
        })

        wx.hideLoading()
        wx.showToast({
          title: '评论成功',
        })

        // 父级刷新评论页面
        this.triggerEvent('refreshCommentList')
      })

      wx.requestSubscribeMessage({
        tmplIds: ['Vs66cfna_zW0TP4L53sqxY7d2wV8qLkS6TimIBIkfis'],
        success(res) {
          console.log(res)
          // 推送模板消息
          wx.cloud.callFunction({
            name: 'sendMessage',
            data: {
              content,
              openid: that.properties.openid,
              blogId: that.properties.blogId
            }
          }).then(res => {
            console.log(res)
          }).catch(err => {
            console.log(err)
          })
         
        },
        fail(err) {
          console.log(err)
        },
        complete(data) {
          console.log(data)
        }
      })


    },
  }
})
