// components/blog-card/cmp.js

// 引入格式化时间的js文件
import formatTime from '../../utils/formatTime.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blog: Object
  },

  observers: {
    ['blog.createTime'](val){
      if(val){
        this.setData({
          _createTime: formatTime(new Date(val))  // 要记得先new Date
        })
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    _createTime: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onPreviewImage(event){
      console.log(event)
      wx.previewImage({
        urls: this.properties.blog.img,
        current: event.currentTarget.dataset.index
      })
    },
    onPreviewAvatar(event){
      console.log(event)
      wx.previewImage({
        urls: [].concat(this.properties.blog.avatarUrl)
      })
    }
  }
})
