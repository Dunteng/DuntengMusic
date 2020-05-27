// components/progress-bar/cmp.js
let movabelAreaWidth = 0;
let movableViewWidth = 0; 
const backgroundAudioManager = wx.getBackgroundAudioManager()
let currentSec = -1 //当前秒数
let duration = 0 //当前歌曲的总时长，以秒为单位

// 标志当前进度条是否在拖拽，如果false则onTimeUpdate时更新状态，否则上锁
// 解决当进度条拖动的时候和backgroundAudioManager.onTimeUpdate事件冲突问题
let isMoving = false 


Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime:{
      currentTime: '00:00',
      totalTime: '00:00'
    },
    movableDis:0,
    progress: 0
  },

  // 组件生命周期
  lifetimes:{
    ready(){
      if(this.properties.isSame&&this.data.showTime.totalTime== '00:00'){
        this._setTime()
      }
      this._getMovableDis()
      this._bindBGMEvent()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChange(event){
      // console.log(event)
      // 拖动
      if(event.detail.source == 'touch'){
        isMoving = true //上锁
        this.data.progress = event.detail.x / (movabelAreaWidth-movableViewWidth)*100
        this.data.movableDis = event.detail.x
        // 拖动过程中不断保存更新每个瞬间的状态
      }

    },
    onTouchEnd(){
      const currentTimeFmt = this._TimeFormat(Math.floor(backgroundAudioManager.currentTime))
      this.setData({
        progress: this.data.progress,
        movableDis: this.data.movableDis,
        ['showTime.currentTime']: currentTimeFmt.min + ":" + currentTimeFmt.sec
      })
      // 背景音乐跳转到拖拽处对应的时刻
      backgroundAudioManager.seek((this.data.progress/100)*duration)
      
      isMoving = false //解锁
    },
    _getMovableDis(){
      // wx.createSelectorQuery()返回一个 SelectorQuery 对象实例。在自定义组件或包含自定义组件的页面中，应使用 this.createSelectorQuery() 来代替
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec((rect)=>{
        // console.log(rect)
        movabelAreaWidth = rect[0].width
        movableViewWidth = rect[1].width
      })
    },

    _bindBGMEvent(){
      backgroundAudioManager.onPlay(()=>{
        console.log('onPlay')
        isMoving = false //解锁
        this.triggerEvent('musicPlay')
      })
      backgroundAudioManager.onStop(() => {
        console.log('onStop')
      })
      backgroundAudioManager.onPause(() => {
        console.log('onPause')
        this.triggerEvent('musicPause')
      })
      backgroundAudioManager.onWaiting(() => {
        console.log('onWaiting')
      })
      backgroundAudioManager.onCanplay(() => {
        console.log('onCanplay')
        console.log(backgroundAudioManager.duration) //结果有时候为undefined有时候又可以正确获取到歌曲总时长，小程序的一个坑。所以这下面进行一下处理
        if(typeof backgroundAudioManager.duration != 'undefined'){
          // 如果不为undefined则是正确取到了duration
          this._setTime()
        }else{
          // 否则可以使用定时器，过一秒之后再取duration。 奇技淫巧
          setTimeout(()=>{
            this._setTime()
          },1000)
        }
      })
      backgroundAudioManager.onTimeUpdate(() => {
        // 播放过程中一直都会发生，暂停的时候发生一次，页面切换时又会重新发生
        // console.log('onTimeUpdate')

        // 进度条没被拖拽时才进行
        if(isMoving===false){
          const currentTime = backgroundAudioManager.currentTime
          // console.log(currentTime)
          const duration = backgroundAudioManager.duration
          let sec = currentTime.toString().split('.')[0]
          if(sec!=currentSec){
            // console.log(sec)
            const currentTimeFmt = this._TimeFormat(currentTime)
            this.setData({
              movableDis:(movabelAreaWidth-movableViewWidth)*currentTime/duration,
              progress: currentTime / duration * 100,
              ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
            })
            // 更新currentSec
            currentSec = sec

            // 联动歌词
            this.triggerEvent('timeUpdate',{
              currentTime
            })
          }else{
            // 秒数相同的情况下就不再重复进行上述的赋值操作了，优化性能
          }
        }
      })
      backgroundAudioManager.onEnded(() => {
        console.log('onEnded')
        // 自定义组件触发事件
        this.triggerEvent('musicEnd')
      })
      backgroundAudioManager.onError(() => {
        console.log('onError')
      })
    },

    _setTime(){
      duration = backgroundAudioManager.duration
      console.log(duration)  //是秒的格式
      const durationFmt = this._TimeFormat(duration) //格式化为分秒格式
      console.log(durationFmt)
      this.setData({
        ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.sec}`
      })
    },

    _TimeFormat(second){
      const min = Math.floor(second / 60) 
      const sec = Math.floor(second % 60)
      return {
        'min': this._add0(min),
        'sec': this._add0(sec)
      }
    },
    // 对于小于10的分和秒要在前面补上0
    _add0(time){
      return time<10?'0'+time:''+time
    }
  }
})
