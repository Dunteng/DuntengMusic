// pages/player/player.js

//用于存放获取到的本地缓存信息
let musiclist = [] 
// 正在播放的歌曲的index
let nowPlayingIndex = 0
// 获取全局唯一的背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()
// 获取全局的app.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: '',
    isPlaying: false,
    isLyricShow: false, //表示当前歌词是否显示
    lyric: '',
    currentTime: 0,
    isSame:false, //判断即将播放的歌曲是不是和当前正在播放的歌曲相同
    showTheTrueFace: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 在player.js这一层就实现当前歌曲播放结束后自动播放下一首
    // backgroundAudioManager.onEnded(() => {
    //   console.log('onEnded666')
    //   this.onNext()
    // })


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

    console.log(options)
    nowPlayingIndex = options.index
    musiclist = wx.getStorageSync('musiclist')
    this._loadMusicDetail(options.musicId)


  },

  _loadMusicDetail(musicId){
    // 判断点击要播的歌曲和旧的当前歌曲是不是同一首
    if(musicId == app.getPlayingMusicId()){
      this.setData({
        isSame: true
      })
    }else{
      this.setData({
        isSame: false
      })
    }
    // 如果点击要播的歌曲和旧的当前歌曲是不是同一首，则停止上一首的播放; 否则不用停止播放
    if(!this.data.isSame){
      backgroundAudioManager.stop()
    }
    // 当前播放歌曲的信息
    let music = musiclist[nowPlayingIndex]
    console.log(music)

    wx.setNavigationBarTitle({
      title: music.name
    })

    this.setData({
      picUrl: music.al.picUrl,
      isPlaying: false
    })
    app.setPlayingMusicId(musicId) // 将当前播放歌曲的id设置为全局的
    wx.showLoading({
      title: '载入中',
    })
    wx.cloud.callFunction({
      name: 'music',
      data:{
        musicId,
        $url: 'musicUrl'
      }
    }).then(res=>{
      // console.log(JSON.parse(res.result))
      let result = JSON.parse(res.result)

      if(result.data[0].url==null){
        // 这可能是一首vip歌曲，无权限听
        wx.showToast({
          title: '暂时听不了嗷~',
          icon: 'none',
          duration: 2500
        })
        return
      }

      if(!this.data.isSame){
        backgroundAudioManager.src = result.data[0].url  //歌曲源
        backgroundAudioManager.title = music.name //歌曲名
        backgroundAudioManager.coverImgUrl = music.al.picUrl //歌曲封面
        backgroundAudioManager.singer = music.ar[0].name //歌手名
        backgroundAudioManager.epname = music.al.name //专辑名

        // 保存播放历史
        this.savePlayHistory()
      }

      this.setData({
        isPlaying: true
      })

      wx.hideLoading()

      // 加载歌词
      wx.cloud.callFunction({
        name: 'music',
        data:{
          musicId,
          $url: 'lyric'
        }
      }).then(res=>{
        console.log(res)
        let lyric = '暂无歌词'
        const lrc = JSON.parse(res.result).lrc
        if(lrc){
          lyric = lrc.lyric
        }
        this.setData({
          lyric: lyric
        })
      })
    })
  },

  togglePlaying(){
    if(this.data.isPlaying){
      backgroundAudioManager.pause()
    }else{
      backgroundAudioManager.play()
    }
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },
  onPrev(){
    nowPlayingIndex--
    if(nowPlayingIndex<0){
      nowPlayingIndex = musiclist.length-1
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  onNext(){
    nowPlayingIndex++
    if (nowPlayingIndex == musiclist.length) {
      nowPlayingIndex = 0
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },

  timeUpdate(event){
    // console.log(event.detail.currentTime)
    this.selectComponent('.lyric').update(event.detail.currentTime)
  },

  onChangeLyricShow(){
    this.setData({
      isLyricShow: !this.data.isLyricShow
    })
  },

  onPlay(){
    this.setData({
      isPlaying: true
    })
  },
  onPause(){
    this.setData({
      isPlaying: false
    })
  },

// 保存播放历史
savePlayHistory(){
  // 当前正在播放的歌曲
  const music = musiclist[nowPlayingIndex]
  const openid = app.globalData.openid
  const history = wx.getStorageSync(openid)

  let exist = false // 标志当前歌曲是否已存在于history中，是的话不再重复记录
  for(let i = 0; i < history.length; i++){
    if( history[i].id == music.id ){
      exist = true
      break  // 一旦发现存在就跳出
    }
  }
  if(!exist){
    history.unshift(music)  // 数组头部插入
    wx.setStorageSync(openid, history)
  }
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