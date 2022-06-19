/**
 * 全局常量、方法封装模块
 * 通过原型挂载到Vue属性
 * 通过 this.Global 调用
 */

// 后台管理系统服务器地址 这里是你本地的后端服务 知道吧
export const baseUrl = 'http://39.105.37.45:8001'
// export const baseUrl = 'http://localhost:8001'
// 系统数据备份还原服务器地址
export const backupBaseUrl = 'http://localhost:8002'

export default {
    baseUrl,
    backupBaseUrl
}
