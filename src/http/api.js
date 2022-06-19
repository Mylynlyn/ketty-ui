/*
 * 接口统一集成模块
 */
import * as login from './moudules/login'
import * as user from './moudules/user'
import * as dept from './moudules/dept'
import * as role from './moudules/role'
import * as menu from './moudules/menu'
import * as dict from './moudules/dict'
import * as log from './moudules/log'
import * as tAviationnum from './moudules/tAviationnum' //这里是导入moudules下你新建的js文件
import * as send from './moudules/send'
import * as receiver from './moudules/receiver'
import * as flight from './moudules/flight'
import * as transfer from './moudules/transfer'
import * as goods from './moudules/goods'
import * as ratio from './moudules/ratio'

// 默认全部导出 这里是所有的接口
export default {
  login,
  user,
  dept,
  role,
  menu,
  dict,
  log,
  tAviationnum,
  send,
  receiver,
  flight,
  transfer,
  goods,
  ratio
}
