// pages/blog-edit/blog-edit.js

const MAX_WORDS_NUM = 140  //最大发布的文字数
const MAX_IMG_NUM = 9  //最多只能选择上传9张图

const db = wx.cloud.database()
let content = ''  //textarea的文本内容
let userInfo = {}
Page({
  data: {
    wordsNum: 0, // 输入文字个数
    footerBottom: 0, //footer的bottom样式的值
    images: [],  //已选择的图片
    selectPhoto: true //当选择图片达到九张的时候置为false
  },


  onLoad: function (options) {
    console.log(options)
    userInfo = options //将用户昵称和头像保存
  },

  onInput(event){
    // console.log(event)
    // console.log(event.detail.value)
    let wordsNum = event.detail.value.length
    if(wordsNum>=MAX_WORDS_NUM){
      wordsNum = `最大字数为${MAX_WORDS_NUM}`
    }
    this.setData({
      wordsNum
    })
    content = event.detail.value
  },

  onFocus(event){
    console.log(event)
    this.setData({
      footerBottom: event.detail.height
    })
   }, 

  onBlur(){
    this.setData({
      footerBottom: 0
    })
  },

  onChooseImage(){
    //还能再选几张图片
    let remainNum = MAX_IMG_NUM - this.data.images.length
    
    wx.chooseImage({
      count: remainNum, // count代表还能传几张图片
      sizeType: ['original'], //原图
      sourceType: ['album','camera'], // 相册还是拍照
      success: (res)=>{
        console.log(res)  // 这里的res就保存了我们选择要上传的图片列表
          this.setData({
            images: this.data.images.concat(res.tempFilePaths),  // 由于我们可能是分多次的选择图片，所以直接赋给images的话只会覆盖原先的数据，所以最好用追加的方式，用concat
          })

        remainNum = MAX_IMG_NUM - this.data.images.length //更新remainNum用以判断能否继续添加图片
        this.setData({
          selectPhoto: remainNum<=0?false:true
        })
      },
    })

  },

  onDelImage(event){
    this.data.images.splice(event.target.dataset.index, 1) //splice会返回删除的元素
    this.setData({
      images: this.data.images, // 这时候的this.data.images已经删除过了
    })
    // 只要this.data.images.length比最大图片数少1就恢复添加按钮的显示👇
    if(this.data.images.length==MAX_IMG_NUM-1){
      this.setData({
        selectPhoto: true
      })
    }
  },

  // 图片预览功能
  onPreivewImage(event){
    wx.previewImage({
      urls: this.data.images,
      current: event.target.dataset.imgsrc,
    })
  },

  // 发布功能
  // 图片数据 ——> 云存储   fileID ——>云数据库
  send() {

    if (content.trim() === '') {
      wx.showModal({
        title: '请写点什么吧~',
        content: '',
      })
      return
    }
    //👆文本为空不允许，文本不为空才执行下面的程序👇

    wx.showLoading({
      title: '发布中',
      mask: true,  //有蒙板效果
    })
    if(this.data.images.length===0){
      //没有图片只有纯文字时
      console.log(666)
      db.collection('blog').add({
        data: {
          ...userInfo,
          content,
          img: [],
          createTime: db.serverDate(),  //服务器时间  
        }
      }).then(res => {
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
        })

        // 返回动态页面，并刷新
        wx.navigateBack()
        const pages = getCurrentPages()
        console.log(pages)
        const pervPage = pages[pages.length - 2] //拿到上一页面的实例
        pervPage.onPullDownRefresh() //调用上一页面的上拉刷新函数

      }).catch(err => {
        wx.hideLoading()
        wx.showToast({
          title: '发布失败，请检查您的网络',
          icon: 'none'
        })
      })
    }else{
      // 有图片时进行图片的上传
      let imagesObj = {}
      imagesObj.urlList = this.data.images //this.data.images是由所有已选图片url组成的数组
      let fileIds = []  // 用于存储fileID
      this.uploadimg(imagesObj, fileIds)

    }



  },


  uploadimg(imgObj, fileIds) {
    var that = this,
      i = imgObj.i ? imgObj.i : 0,//当前上传的哪张图片
      success = imgObj.success ? imgObj.success : 0,//上传成功的个数
      fail = imgObj.fail ? imgObj.fail : 0;//上传失败的个数

    let item = imgObj.urlList[i]
    // 使用正则表达式截取到每张图片的后缀名
    let suffix = /\.\w+$/.exec(item)[0]
    
    wx.cloud.uploadFile({
      cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 1000000 + suffix, //云存储路径，必须先存在，这里做了唯一化，避免重名导致的资源覆盖
      filePath: imgObj.urlList[i],
      success: (res) => {
        success++;//图片上传成功，图片上传成功的变量+1
        console.log(res)
        fileIds = fileIds.concat(res.fileID) //每次上传成功就添加fileID到数组中
        console.log(i);
        //这里可能有BUG，失败也会执行这里,所以这里应该是后台返回过来的状态码为成功时，这里的success才+1
      },
      fail: (res) => {
        fail++;//图片上传失败，图片上传失败的变量+1
        console.log('fail:' + i + "fail:" + fail);
        wx.hideLoading()
        wx.showToast({
          title: '图片上传失败',
          icon: 'none'
        })
      },
      complete: () => {
        console.log(i);
        i++;//这个图片执行完上传后，开始上传下一张
        if (i == imgObj.urlList.length) {   //当图片传完时，停止调用          
          console.log('执行完毕');
          console.log('成功：' + success + " 失败：" + fail);

          if(fail===0&&success===imgObj.urlList.length){ //全部上传成功时，进行数据存入云数据库
            console.log(fileIds)
            // fileID存入云数据库
            db.collection('blog').add({
              data: {
                ...userInfo,
                content,
                img: fileIds,
                createTime: db.serverDate(),  //服务器时间  
              }
            }).then(res => {
              wx.hideLoading()
              wx.showToast({
                title: '发布成功',
              })

              // 返回动态页面，并刷新
              wx.navigateBack()
              const pages = getCurrentPages()
              console.log(pages)
              const pervPage = pages[pages.length - 2] //拿到上一页面的实例
              pervPage.onPullDownRefresh() //调用上一页面的上拉刷新函数

            }).catch(err => {
              wx.hideLoading()
              wx.showToast({
                title: '发布失败，请检查您的网络',
                icon: 'none'
              })
            })
          }
        } else {//若图片还没有传完，则继续调用函数
          console.log(i);
          imgObj.i = i;
          imgObj.success = success;
          imgObj.fail = fail;
          that.uploadimg(imgObj, fileIds);
        }

      }
    });

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