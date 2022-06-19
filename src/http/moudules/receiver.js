import axios from '../axios'

/*
 * 收货人信息接口
 */

// 返回列表
export const getInfos=(data) =>{
  return axios({
    url:'/receive/findPage',
    method:'post',
    data
  })
}

// 添加 && 编辑--提交
export const submitInfos = (data) => {
  return axios({
    url: '/receive/save',
    method: 'post',
    data
  })
}

// 删除
export const deleteInfos=(data)=>{
  return axios({
    url:'/receive/delete',
    method:'post',
    data
  })
}

