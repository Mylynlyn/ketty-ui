import axios from '../axios'

/*
 * 物流模块 新增模块下的所有方法
 */

// 这里就是不同的模块
// 单号导入——保存
export const save = (data) => {
    return axios({
        url: '/tAviationnum/save',
        method: 'post',
        data
    })
}
// 制单——暂存、提交、作废
export const savetAviation = (data) => {
    return axios({
        url: '/tAviation/save',
        method: 'post',
        data
    })
}
// 更新单号——作废&未使用的
export const refreshList = (data) => {
    return axios({
        url: '/tAviationnum/listByFlag',
        method: 'post',
        data
    })
}
// 更新单号——已使用
export const refreshUsedList = (data) => {
  return axios({
    url: '/tAviation/findPage',
    method: 'post',
    data
  })
}
// 获取托运人客户表
export const getSendNameList =(data) =>{
  return axios({
    url:'/tAviation/sendName',
    method:'post',
    data
  })
}

// 获取暂存数据
export const getStagingData = (data) =>{
  return axios({
    url:'/tAviation/staging',
    method:'post',
    data
  })
}
// 权限操作
export const operateData=(params)=>{
  return axios({
    url:'/tAviation/applyAndAgree',
    method:'get',
    params
  })
}

//作废单号--查看
export const viewDetail=(params)=>{
  return axios({
    url:'/tAviation/findByNum',
    method:'get',
    params
  })
}
