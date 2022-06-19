import axios from '../axios'

/*
 * 商品种类&代码关系表接口
 */

// 返回列表
export const getInfos=(data) =>{
  return axios({
    url:'/goodnum/findPage',
    method:'post',
    data
  })
}

// 添加 && 编辑--提交
export const submitInfos = (data) => {
  return axios({
    url: '/goodnum/save',
    method: 'post',
    data
  })
}

// 删除
export const deleteInfos=(data)=>{
  return axios({
    url:'/goodnum/delete',
    method:'post',
    data
  })
}

//搜索 通过航司筛选货物信息表、商品代码及费率 --旧（弃用）
export const searchGoodsList=(params)=>{
  return axios({
    url:'/goodnum/findRatio',
    method:'get',
    params
  })
}

//根据航空公司筛选货物列表（包含货物类型和商品代码）
export const searchGoods=(params)=>{
  return axios({
    url:'/goodnum/findName',
    method:'get',
    params
  })
}

