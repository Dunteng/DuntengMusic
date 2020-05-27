// components/lyric/cmp.js
let lyricHeight = 0 
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLyricShow: {
      type: Boolean,
      value: false
    },
    lyric: String,
  },

  observers: {
    lyric(lrc) {
      console.log(lrc)
        this._paresLyric(lrc)
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    lrclist: [],
    nowLyricIndex: 0, //当前选中歌词的索引下标
    scrollTop: 0,  //滚动条滚动的高度
  },

  lifetimes:{
    ready(){
      // wx.getSystemInfo可以获取到当前手机的信息，其中包括屏幕宽度screenWidth
      wx.getSystemInfo({
        success: function(res) {
          // 在小程序中宽度都为750rpx，下面可以求出1rpx对应多少px，再乘以一行歌词的高度64rpx，
          // 即可求出一行歌词有多少px
          lyricHeight = res.screenWidth / 750 * 64
        },
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    update(currentTime){
      // console.log(currentTime)
      let lrcList = this.data.lrclist
      if(lrcList.length == 0){ //如果没有歌词纯音乐，直接退出啥也不干
        return
      }
      // 如果当前的时间比歌词数据的最后一组都要大，直接让最后一组歌词高亮，滚动长度为lrcList.length * lyricHeight
      if (currentTime > lrcList[lrcList.length-1].time){
        this.setData({
          nowLyricIndex: lrcList.length-1,
          scrollTop: lrcList.length * lyricHeight
        })
      }
      for(let i = 0, len = lrcList.length; i < len; i++){
        if(currentTime<=lrcList[i].time){
          this.setData({
            nowLyricIndex: i-1,
            scrollTop: (i-1)*lyricHeight
          })
          break // 匹配上了就不用再进行后续的匹配了，节省性能开销
        }else{
          
        }
      }
    },
    _paresLyric(sLyric) {
      let line = sLyric.split('\n')
      // console.log(line)
      let _lyricList = []
      line.forEach((elem)=>{
        let time = elem.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
        if(time!=null){
          let lrc = elem.split(time)[1]
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
          // console.log(timeReg)
          // 把事件转换为秒
          let time2Seconds = parseInt(timeReg[1]*60)+parseInt(timeReg[2])+parseInt(timeReg[3])/1000
          _lyricList.push({
            lrc,
            time: time2Seconds
          })
        }
      })
      // 有些歌词是空的，上述的解析对其无效，_lyricList仍是空的，则设置为暂无歌词
      if(_lyricList.length==0){
        _lyricList.push({
          lrc: "暂无歌词",
          time: 0
        })
        console.log(_lyricList)
      }
      this.setData({
        lrclist: _lyricList
      })
      console.log(this.data.lrclist)
    }
  }
})
