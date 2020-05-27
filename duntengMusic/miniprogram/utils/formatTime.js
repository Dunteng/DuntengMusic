module.exports = (date)=>{
  let fmt = 'yyyy-MM-dd hh:mm'
  const o = {
    'M+': date.getMonth()+1,  // 月份 date.getMonth()值为0~11，所以要加1
    'd+': date.getDate(),     // 日
    'h+': date.getHours(),    // 时 
    'm+': date.getMinutes(),  // 分
  }

  if(/(y+)/.test(fmt)){
    fmt = fmt.replace(RegExp.$1, date.getFullYear())
  }
  for(let k in o){
    if(new RegExp('(' + k + ')').test(fmt)){
      // o[k].toString().length == 1判断是不是0~9，是的话前面要补零
      fmt = fmt.replace(RegExp.$1, o[k].toString().length==1 ? '0'+o[k] : o[k])
    }
  }
  return fmt
}