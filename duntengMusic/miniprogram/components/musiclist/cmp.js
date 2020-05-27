// components/musiclist/cmp.js
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist: Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    playingId: -1
  },

  pageLifetimes:{
    show(){
      // console.log('我出现了' + app.getPlayingMusicId())
      this.setData({
        playingId: parseInt(app.getPlayingMusicId()) // app.getPlayingMusicId()是string，转为number类型
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSelect(event){
      // console.log(event)
      // console.log(event.currentTarget.dataset.musicid)
      const ds = event.currentTarget.dataset
      this.setData({
        playingId: ds.musicid
      })
      wx.navigateTo({
        url: `../../pages/player/player?musicId=${ds.musicid}&index=${ds.index}`,
      })
    }
  }
})
