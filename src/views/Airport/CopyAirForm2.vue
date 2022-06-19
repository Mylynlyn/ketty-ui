<template>
  <div>
    <el-form :model="addForm" ref="addForm" size="mini">
      <el-row style="padding:0 10px">
        <el-col :span="8">
          <el-form-item prop="aviationnum" label="单号" label-width="80px">
            <el-select v-model="addForm.aviationnum">
              <template v-for="item in aviationnumOptions">
                <el-option :label="item.aviationnum" :key="item.aviationnum" :value="item.aviationnum"></el-option>
              </template>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item prop="deliverystation" label="交货运站" label-width="80px">
            <el-cascader v-model="addForm.deliverystation" :options="deliveryOptions"></el-cascader>
          </el-form-item>
        </el-col>
      </el-row>
      <div class="formBorder">
        <el-row class="itemTitle">出港目的地</el-row>
        <el-row>
          <template v-for="item in stationOptions">
            <el-col :span="12">
              <el-form-item :label="item.label" :prop="item.prop" label-width="120px">
                <el-input v-model="addForm[item.prop]"></el-input>
              </el-form-item>
            </el-col>
          </template>
        </el-row>
        <el-row class="itemTitle">托运人信息</el-row>
        <el-row>
          <el-col :span="6">
            <el-form-item label="姓名" prop="sendname" label-width="60px">
              <el-select v-model="addForm.sendname">
                <template v-for="item in sendNameOptions">
                  <el-option :label="item.sendname" :value="item.sendname" :key="item.sendname">
                  </el-option>
                </template>
              </el-select>
            </el-form-item>
          </el-col>
          <template v-for="item in sendInfoOptions">
            <el-col :span="6">
              <el-form-item :label="item.label" :prop="item.prop" label-width="60px">
                <el-input v-model="addForm[item.prop]"></el-input>
              </el-form-item>
            </el-col>
          </template>
        </el-row>
        <el-row class="itemTitle">收货人信息</el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="姓名" prop="receviername" label-width="80px">
              <el-select v-model="addForm.receviername">
                <template v-for="item in receiverOptions">
                  <el-option :label="item.label" :value="item.label" :key="item.label"></el-option>
                </template>
              </el-select>
            </el-form-item>
          </el-col>
          <template v-for="item in receiveInfoOptions">
            <el-col :span="8">
              <el-form-item :label="item.label" :prop='item.prop' label-width="80px">
                <el-input v-model="addForm[item.prop]"></el-input>
              </el-form-item>
            </el-col>
          </template>
        </el-row>
        <el-row class="itemTitle">航线</el-row>
        <el-row>
          <template v-for="item in airlineOptions">
            <el-col :span="8">
              <el-form-item :label="item.label" :prop="item.prop" label-width="80px">
                <el-input v-model="addForm[item.prop]"></el-input>
              </el-form-item>
            </el-col>
          </template>
        </el-row>
        <el-row class="itemTitle">注意事项</el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="注意事项" prop="attention" label-width="80px">
              <el-select v-model="addForm.attention" clearable placeholder="请选择">
                <el-option v-for="item in attentionOptions" :key="item.value" :label="item.label"
                           :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row class="itemTitle">货物信息</el-row>
        <el-row>
          <template v-for="item in cargoInfos">
            <el-col :span="item.width" class="col_header">{{item.text}}
            </el-col>
          </template>
        </el-row>
        <el-row>
          <el-col :span="2" class="col_body col_input">
            <el-tooltip :content="addForm.goodname">
              <el-input v-model="addForm.goodname" size="mini" class="col_input"></el-input>
            </el-tooltip>
          </el-col>
          <el-col :span="2" class="col_body col_input">
            <el-tooltip :content="addForm.weightnum">
              <el-input v-model="addForm.weightnum" size="mini"></el-input>
            </el-tooltip>
          </el-col>
          <el-col :span="3" class="col_body col_input">
            <el-tooltip :content="addForm.rcp">
              <el-input v-model="addForm.rcp" size="mini"></el-input>
            </el-tooltip>
          </el-col>
          <el-col :span="3" class="col_body">
            <el-tooltip :content="addForm.rateclass">
              <el-select v-model="addForm.rateclass" size="mini">
                <template v-for="item in rateClassOptions">
                  <el-option :label="item.label" :value="item.label" :key="item.label"></el-option>
                </template>
              </el-select>
            </el-tooltip>
          </el-col>
          <el-col :span="5" class="col_body col_input_mini">
            <el-row>
              <el-col :span="5">
                <el-tooltip :content="addForm.chang">
                  <el-input v-model="addForm.chang" placeholder="长" size="mini">
                  </el-input>
                </el-tooltip>
              </el-col>
              <el-col :span="1" class="col_mini">
                *
              </el-col>
              <el-col :span="5">
                <el-tooltip :content="addForm.kuan">
                  <el-input v-model="addForm.kuan" placeholder="宽" size="mini">
                  </el-input>
                </el-tooltip>
              </el-col>
              <el-col :span="1" class="col_mini">
                *
              </el-col>
              <el-col :span="5">
                <el-tooltip :content="addForm.gao">
                  <el-input v-model="addForm.gao" placeholder="高" size="mini">
                  </el-input>
                </el-tooltip>
              </el-col>
              <el-col :span="1" class="col_mini">
                =
              </el-col>
              <el-col :span="6" class="col_mini">
                <el-tooltip :content="tiji">
                  <span>{{tiji}}</span>
                </el-tooltip></el-col>
            </el-row>
          </el-col>
          <el-col :span="2" class="col_body col_input">
            <el-tooltip :content="addForm.grossweight">
              <el-input v-model="addForm.grossweight" size="mini"></el-input>
            </el-tooltip>
          </el-col>
          <el-col :span="3" class="col_body">
            <el-tooltip content="自动计算，请勿输入">
              <span>监听</span>
            </el-tooltip>
          </el-col>
          <el-col :span="2" class="col_body col_input">
            <el-tooltip :content="addForm.rate">
              <el-input v-model="addForm.rate" size="mini"></el-input>
            </el-tooltip>
          </el-col>
          <el-col :span="2" class="col_body">
            <el-tooltip content="自动计算，请勿输入">
              <span>监听</span>
            </el-tooltip>
          </el-col>
        </el-row>
        <el-descriptions direction="vertical" :column="9" border size="mini" v-show="false">
          <el-descriptions-item label="物品名称">
          </el-descriptions-item>
          <el-descriptions-item label="商品代号">
          </el-descriptions-item>
          <el-descriptions-item label="件数运价点">
          </el-descriptions-item>
          <el-descriptions-item label="运件种类">
          </el-descriptions-item>
          <el-descriptions-item label="尺寸（米）">
          </el-descriptions-item>
          <el-descriptions-item label="毛重(千克)">
          </el-descriptions-item>
          <el-descriptions-item label="计费重量(千克)">
          </el-descriptions-item>
          <el-descriptions-item label="费率">
          </el-descriptions-item>
          <el-descriptions-item label="航空运费">
          </el-descriptions-item>
        </el-descriptions>
        <el-row class="itemTitle">付款金额</el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="其他费用" prop="othercharges" label-width="80px">
              <el-select v-model="addForm.othercharges" clearable placeholder="请选择">
                <el-option
                  v-for="item in otherChargeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <template v-for="item in payOptions">
            <el-col :span="12">
              <el-form-item :label="item.label" :prop="item.prop" label-width="80px">
                <el-radio-group v-model="addForm[item.prop]" style="margin-left:-120px;">
                  <template v-for="arr in item.radioOptions">
                    <el-radio :label="arr.label"><span style="font-size: 12px">{{arr.labelText}}</span></el-radio>
                  </template>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </template>
        </el-row>
        <el-row>
          <template v-for="item in chargeOptions">
            <el-col :span="8">
              <el-form-item :label="item.label" :prop="item.prop" label-width="80px">
                <el-input v-model="addForm[item.prop]" :disabled="item.disable">
                </el-input>
              </el-form-item>
            </el-col>
          </template>
        </el-row>
        <el-row class="itemTitle">填写信息</el-row>
        <el-row>
          <template v-for="item in fillInfoOptions">
            <el-col :span="8">
              <el-form-item :label="item.label" :prop="item.prop" label-width="80px">
                <el-input v-model="addForm[item.prop]">
                </el-input>
              </el-form-item>
            </el-col>
          </template>
        </el-row>
      </div>
    </el-form>
  </div>
</template>
<script>
    export default {
        data() {
            return {
                tiji:'',
                addForm: {},
                labelPosition: 'left',
                aviationnumOptions: [],
                deliveryOptions: [
                    {
                        value: '东航',
                        label: '东航',
                        children: [
                            {value: '大兴东航', label: '大兴东航'},
                            {value: '首都东航', label: '首都东航'},
                        ]
                    },
                    {
                        value: '南航',
                        label: '南航',
                        children: [
                            {value: '大兴南航', label: '大兴南航'}
                        ]
                    }
                ],
                stationOptions: [
                    {label: '始发站', prop: 'startstation'},
                    {label: '目的站', prop: 'outstation'},
                ],
                sendNameOptions: [],
                sendInfoOptions: [
                    {label: '电话', prop: 'sendtel', labelwidth: '60px'},
                    {label: '地址', prop: 'sendadr', labelwidth: '60px'},
                    {label: '结算方式', prop: 'cashtype', labelwidth: '80px'},
                ],
                receiveInfoOptions: [
                    {label: '电话', prop: 'receviertel'},
                    {label: '地址', prop: 'recevieradr'},
                ],
                receiverOptions: [
                    {label: '南京军铭物流有限公司'},
                    {label: '中集冷云（北京）供应链管理有限公司上海分公司'},
                    {label: '中集冷云（北京）供应链管理有限公司武汉分公司'},
                    {label: '武汉中航联物流有限公司'},
                    {label: '上海瞰为物流有限公司'},
                    {label: '杭州钧天货运服务有限公司'},
                    {label: '杭州吉邦航空货运代理有限公司'},
                    {label: '合肥优思达运输有限公司'},
                    {label: '合肥盛海货运有限公司'}
                ],
                airlineOptions: [
                    {label: '第一承运', prop: 'firstcarrier'},
                    {label: '中转站', prop: 'transferstation'},
                    {label: '到达站', prop: 'destinationstation'},
                    {label: '航班', prop: 'flight'},
                    {label: '日期', prop: 'riqi'},
                    {label: '班次', prop: 'flightnum'}
                ],
                attentionOptions: [],
                cargoInfos: [
                    {width: 2, text: '物品名称'},
                    {width: 2, text: '商品代号'},
                    {width: 3, text: '件数运价点'},
                    {width: 3, text: '运件种类'},
                    {width: 5, text: '尺寸(m)'},
                    {width: 2, text: '毛重(kg)'},
                    {width: 3, text: '计费重量(kg)'},
                    {width: 2, text: '费率'},
                    {width: 2, text: '航空运费'}
                ],
                rateClassOptions: [
                    {label:'option1'},
                    {label:'option2'},
                    {label:'option3'},
                    {label:'option4'},
                ],
                otherChargeOptions: [],
                payOptions: [
                    {
                        label: '付款类型',
                        prop: 'paytype',
                        radioOptions: [
                            {label: 'prepaid', labelText: '预付'},
                            {label: 'collect', labelText: '到付'}
                        ]
                    },
                    {
                        label: '付款方式',
                        prop: 'paymethod',
                        radioOptions: [
                            {label: 'cash', labelText: '现金'},
                            {label: 'online_banking', labelText: '网银'}
                        ]
                    }
                ],
                chargeOptions: [
                    {label: '航空费用', prop: 'weightcharge', disable: true},
                    {label: '其他总费用', prop: 'otherallcharges', disable: false},
                    {label: '总额', prop: 'total', disable: true},
                ],
                fillInfoOptions: [
                    {label: '时间', prop: 'create_time'},
                    {label: '地点', prop: 'place'},
                    {label: '制单员', prop: 'carrier'},
                ]
            }
        }
    }
</script>
<style scoped>
  .formBorder {
    padding: 5px 10px 10px 10px;
    /*border: 1px solid gray;*/
  }

  .itemTitle {
    text-align: left;
    color: #888888;
    /*color: #246894;*/
    font-size: 14px;
    font-weight: bold;
  }

  /deep/ .el-form-item {
    white-space: nowrap;
    margin-bottom: 5px;
  }

  /deep/ .el-form-item__label {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    height: 28px;
    line-height: 28px;
    text-align: center;
    font-size: 12px;
    padding: 0 5px;
    background-color: #DCDFE6;
  }

  .col_header {
    border: 1px solid #DCDFE6;
    height: 30px;
    padding: 5px;
    font-size: 12px;
    background-color: #FAFAFA;
    color: #909399;
    margin-top: 5px
  }

  .col_body {
    border: 1px solid #DCDFE6;
    height: 50px;
    padding: 5px;
    font-size: 12px;
    margin-bottom: 10px;
  }

  .col_input >>> .el-input__inner {
    border-top: 0px;
    border-left: 0px;
    border-right: 0px;
    border-bottom: 0px;
    padding: 0;
    border-radius: 0;
    outline: none;
    width:80%;
    text-overflow:ellipsis;
  }
  .col_input_mini >>> .el-input__inner {
    border-top: 0px;
    border-left: 0px;
    border-right: 0px;
    border-bottom: 1px solid #DCDFE6;
    padding: 0;
    border-radius: 0;
    outline: none;
    width:80%;
    text-overflow:ellipsis;
  }
  .col_mini{
    padding-top:8px
  }

</style>
