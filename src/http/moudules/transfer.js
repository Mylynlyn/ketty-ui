import axios from '../axios'

/*
 * 站点信息表接口
 */

// 返回列表
export const getInfos=(data) =>{
  return axios({
    url:'/allstations/findPage',
    method:'post',
    data
  })
}

// 添加 && 编辑--提交
export const submitInfos = (data) => {
  return axios({
    url: '/allstations/save',
    method: 'post',
    data
  })
}

// 删除
export const deleteInfos=(data)=>{
  return axios({
    url:'/allstations/delete',
    method:'post',
    data
  })
}

//查询站点信息
export const searchInfos=(params)=>{
  return axios({
    url:'/allstations/findStation',
    method:'get',
    params
  })
}

