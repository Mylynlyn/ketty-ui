import axios from '../axios'

/* 
 * 物流模块 新增模块下的所有方法 
 */

// 这里就是不同的模块
// 单号保存
export const save = (data) => {
    return axios({
        url: '/tAviationnum/save',
        method: 'post',
        data
    })
}
// 主页面保存
export const savetAviation = (data) => {
    return axios({
        url: '/tAviation/save',
        method: 'post',
        data
    })
}
// 分页查询
export const findPage = (data) => {
    return axios({
        url: '/tAviationnum/findPage',
        method: 'post',
        data
    })
}