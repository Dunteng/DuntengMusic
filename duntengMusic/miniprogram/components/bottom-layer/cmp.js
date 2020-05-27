Component({
  /**
   * 组件的属性列表
   */
  properties: {
    layerShow: Boolean, //简写方式，默认为false
  },
  options:{
    styleIsolation: 'apply-shared',
    multipleSlots: true, //允许多个slot插槽
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
    onClose(){
      this.setData({
        layerShow: false
      })
    },
  }
})
