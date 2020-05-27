// components/search/cmp.js
let keyword = ''  //当前查询的关键字

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    placeholder: {
      type:String,
      value: "请输入关键字"
    }
  },
  // 记录外部传入的外部样式类
  externalClasses:[
    "iconfont",
    "icon-sousuo"
  ],
  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onInput(event){
      // console.log(event)
      keyword = event.detail.value
    },


    onSearch(){
      // console.log(keywords)
      this.triggerEvent('search', {
        keyword
      })
    },

    goback(){
      this.triggerEvent('goback')
      
    },
  }
})
