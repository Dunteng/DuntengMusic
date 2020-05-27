// components/playlist/cmp.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    playlistItem:{
      type: Object
    }
  },

  observers:{
    // 监听playlistItem里的playCount属性，这样下面这种写法
    ['playlistItem.playCount'](count){
      // console.log(count)
      //格式化数据，保留小数点后两位
      // console.log(this._tranNumber(count, 2))
      this.setData({
        _count: this._tranNumber(count,2)  
        //用data中的_count来存放修改后的playlistItem.playCount的数据,
        //如果直接就存放为自身playlistItem.playCount的话会陷入死循环，即不能给被监听数据本身赋值以防陷入死循环
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    _count:0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 格式化播放数量
    _tranNumber(num, point){
      let numStr = num.toString().split('.')[0];
      if(numStr.length<6){
        return numStr;
      }else if(numStr.length>=6&&numStr.length<=8){
        let decimal = numStr.substring(numStr.length-4, numStr.length-4+point)
        return parseFloat(parseInt(num / 10000) + '.' + decimal )+ '万'
      }else if(numStr.length>8){
        let decimal = numStr.substring(numStr.length-8, numStr.length-8+point)
        return parseFloat(parseInt(num / 100000000) + '.' + decimal)+'亿'
      }
    },
    // 显示歌曲列表
    goToMusiclist() {
      wx.navigateTo({
        url: `../../pages/musiclist/musiclist?playlistId=${this.properties.playlistItem.id}`,
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      })
    }
  },



})
