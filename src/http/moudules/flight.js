import axios from '../axios'

/*
 * 航班时刻表接口
 */

// 返回列表
export const getInfos=(data) =>{
  return axios({
    url:'/flight/findPage',
    method:'post',
    data
  })
}

// 添加 && 编辑--提交
export const submitInfos = (data) => {
  return axios({
    url: '/flight/save',
    method: 'post',
    data
  })
}

// 删除
export const deleteInfos=(data)=>{
  return axios({
    url:'/flight/delete',
    method:'post',
    data
  })
}

//搜索--查询指定范围航班
export const searchFlightList=(params)=>{
  return axios({
    url:'/flight/flightNum',
    method:'get',
    params
  })
}

// 返回指定航空公司的始发站-目的站下拉列表（费率表需求）
export const returnStationList=(params)=>{
  return axios({
    url:'/flight/findFlight',
    method:'get',
    params
  })
}
