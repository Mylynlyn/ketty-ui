import axios from '../axios'

/*
 * 站点信息表接口
 */

// 返回列表
export const getInfos=(data) =>{
  return axios({
    url:'/tLowcost/findPage',
    method:'post',
    data
  })
}

// 添加 && 编辑--提交
export const submitInfos = (data) => {
  return axios({
    url: '/tLowcost/save',
    method: 'post',
    data
  })
}

// 删除
export const deleteInfos=(data)=>{
  return axios({
    url:'/tLowcost/delete',
    method:'post',
    data
  })
}

//查询最低收费值
export const searchInfos=(params)=>{
  return axios({
    url:'/tLowcost/findMin',
    method:'get',
    params
  })
}

