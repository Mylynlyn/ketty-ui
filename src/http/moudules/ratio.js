import axios from '../axios'

/*
 * 费率表接口
 */

// 返回列表
export const getInfos=(data) =>{
  return axios({
    url:'/tGoodallratio/findPage',
    method:'post',
    data
  })
}

// 添加 && 编辑--提交
export const submitInfos = (data) => {
  return axios({
    url: '/tGoodallratio/save',
    method: 'post',
    data
  })
}

// 删除
export const deleteInfos=(data)=>{
  return axios({
    url:'/tGoodallratio/delete',
    method:'post',
    data
  })
}

//获取费率
export const getRatio=(params)=>{
  return axios({
    url:'/tGoodallratio/findRatio',
    method:'get',
    params
  })
}



