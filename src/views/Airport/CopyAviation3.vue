<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar">
      <el-form :inline="true" size="small">
        <el-form-item>
          <el-input v-model="keywords" placeholder="请输入单号">
            <el-button slot="append" icon="el-icon-search" @click="searchTable"></el-button>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-model="dateArray"
            type="daterange"
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :time-arrow-control="true"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
    </div>
    <div class="tabs">
      <el-tabs v-model="activeName" type="card" @tab-click="handleTabChange">
        <el-tab-pane name="used">
          <template slot="label">已用单号({{usedTotal}})</template>
        </el-tab-pane>
        <el-tab-pane name="invalid">
          <template slot="label">作废单号({{invalidTotal}})</template>
        </el-tab-pane>
        <el-tab-pane name="not_used">
          <template slot="label">未使用单号({{notUsedTotal}})</template>
        </el-tab-pane>
      </el-tabs>
      <div class="btn">
        <kt-button label="单号导入" perms="sys:role:view" type="primary" @click="singleDialogVisible=true"/>
        <el-upload
          accept=".xls, .xlsx"
          action='http://39.105.37.45:8001/tAviationnum/importExcel'
          :headers="headers"
          :file-list="fileList"
          :limit="1"
          :on-success="fileSuccess"
          :on-error="fileError"
          :on-exceed="handleExceed"
          :show-file-list="false"
        >
          <kt-button label="批量导入" perms="sys:role:view" type="primary"/>
        </el-upload>
        <kt-button label="制单" perms="sys:role:view" type="success" @click='makeForm'/>
      </div>
    </div>
    <div v-if="this.activeName=='used'">
      <el-table :data="usedTable" :size="tableSize" :cell-style="{padding:'3px 0'}"
                :header-cell-style="{background:'#EEEEEE',color:'#606266'}">
        <el-table-column type="index" :index="returnUsedIndex" label="序号"></el-table-column>
        <template v-for="item in usedHeaders">
          <el-table-column :label="item.label" :prop="item.prop"></el-table-column>
        </template>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-edit" @click="editUsedDetail(scope.$index,scope.row)"
                       :size="tableSize">编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pageStyle">
        <el-pagination
          @size-change="usedHandleSizeChange"
          @current-change="usedHandleCurrentChange"
          :current-page="usedCurrentPage"
          :page-sizes="[10, 20, 30]"
          :page-size="usedPageSize"
          layout="total, sizes, prev, pager, next"
          :total="usedTotal">
        </el-pagination>
      </div>
    </div>
    <div v-else-if="this.activeName=='invalid'">
      <el-table :data="invalidTable" :size="tableSize" :cell-style="{padding:'3px 0'}"
                :header-cell-style="{background:'#EEEEEE',color:'#606266'}">
        <el-table-column type="index" :index="returnInvalidIndex" label="序号" width="200"></el-table-column>
        <el-table-column label="单号" prop="aviationnum"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-view" @click="viewInvalidDetail(scope.$index,scope.row)"
                       :size="tableSize">查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pageStyle">
        <el-pagination
          @size-change="invalidHandleSizeChange"
          @current-change="invalidHandleCurrentChange"
          :current-page="invalidCurrentPage"
          :page-sizes="[10, 20, 30]"
          :page-size="invalidPageSize"
          layout="total, sizes, prev, pager, next"
          :total="invalidTotal">
        </el-pagination>
      </div>
    </div>
    <div v-else>
      <el-table :data="notUsedTable" :size="tableSize" :cell-style="{padding:'3px 0'}"
                :header-cell-style="{background:'#EEEEEE',color:'#606266'}">
        <el-table-column type="index" :index="returnNotUsedIndex" label="序号" width="500"></el-table-column>
        <template v-for="item in notUsedHeaders">
          <el-table-column :label="item.label" :prop="item.prop"></el-table-column>
        </template>
      </el-table>
      <div class="pageStyle">
        <el-pagination
          @size-change="notUsedHandleSizeChange"
          @current-change="notUsedHandleCurrentChange"
          :current-page="notUsedCurrentPage"
          :page-sizes="[10, 20, 30]"
          :page-size="notUsedPageSize"
          layout="total, sizes, prev, pager, next"
          :total="notUsedTotal">
        </el-pagination>
      </div>
    </div>
    <el-dialog :visible.sync="dialogVisible" width="60%" title="制单"  class="makeFormStyle">
      <el-form :model="addForm" ref="addForm" size="mini" :rules="addFormRules" id="print_content">
        <el-row style="padding:0 10px">
          <el-col :span="8">
            <el-form-item prop="aviationnum" label="单号" label-width="80px">
              <el-select v-model="addForm.aviationnum" style="width:100%">
                <template v-for="item in aviationnumOptions">
                  <el-option :label="item.aviationnum" :key="item.aviationnum" :value="item.aviationnum"></el-option>
                </template>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="deliverystation" label="交货运站" label-width="80px">
              <el-cascader v-model="addForm.deliverystation" :options="deliveryOptions" :show-all-levels="false"
                           @change="changeDeliveryStation" style="width:100%"></el-cascader>
            </el-form-item>
          </el-col>
        </el-row>
        <div class="formBorder">
          <el-row class="itemTitle">出港目的地</el-row>
          <el-row>
            <template v-for="item in stationOptions">
              <el-col :span="12">
                <el-form-item :label="item.label" :prop="item.prop" label-width="120px">
                  <el-select v-model="addForm[item.prop]" style="width:100%" @change="getFlightOptions">
                    <template v-for="element in allStationOptions">
                      <el-option :label="element.stationname" :value="element.stationname"
                                 :key="element.stationname"></el-option>
                    </template>
                  </el-select>
                </el-form-item>
              </el-col>
            </template>
          </el-row>
          <el-row class="itemTitle">托运人信息</el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="姓名" prop="sendname" label-width="80px">
                <el-select v-model="addForm.sendname" @change="changeSendName"  style="width:100%">
                  <template v-for="item in sendNameOptions">
                    <el-option :label="item.sendname" :value="item.sendname" :key="item.sendname">
                    </el-option>
                  </template>
                </el-select>
              </el-form-item>
            </el-col>
            <template v-for="item in sendInfoOptions">
              <el-col :span="8">
                <el-form-item :label="item.label" :prop="item.prop" label-width="80px">
                  <el-input v-model="addForm[item.prop]" :disabled="item.disable"></el-input>
                </el-form-item>
              </el-col>
            </template>
          </el-row>
          <el-row class="itemTitle">收货人信息</el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="姓名" prop="receivername" label-width="80px">
                <el-select v-model="addForm.receivername" @change="changeReceiveName"  style="width:100%">
                  <template v-for="item in receiveNameOptions">
                    <el-option :label="item.receivename" :value="item.receivename" :key="item.receivename"></el-option>
                  </template>
                </el-select>
              </el-form-item>
            </el-col>
            <template v-for="item in receiverInfoOptions">
              <el-col :span="8">
                <el-form-item :label="item.label" :prop='item.prop' label-width="80px">
                  <el-input v-model="addForm[item.prop]" :disabled="item.disable"></el-input>
                </el-form-item>
              </el-col>
            </template>
          </el-row>
          <el-row class="itemTitle">航线</el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="第一承运" prop="firstcarrier" label-width="80px" >
                <el-input v-model="addForm.firstcarrier"  :disabled='true'></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="中转站" prop="transferstation" label-width="80px">
                <el-select v-model="addForm.transferstation"  style="width:100%">
                  <template v-for="item in allStationOptions">
                    <el-option :label="item.stationname" :value="item.stationname" :key="item.stationname"></el-option>
                  </template>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="到达站" prop="destinationstation" label-width="80px">
                <el-input v-model="addForm.outstation" :disabled='true'></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="航班" prop="flight" label-width="80px">
                <el-select v-model="addForm.flight"  style="width:100%" @change="selectFlight">
                  <template v-for="item in flightOptions">
                    <el-option :label="item.flight" :value="item.flight" :key="item.flight"></el-option>
                  </template>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="日期" prop="riqi" label-width="80px">
                <el-date-picker
                  v-model="addForm.riqi"
                  type="date"
                  value-format="yyyy-MM-dd"
                  placeholder="请选择日期时间" style="width:100%">
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="班次" prop="flightnum" label-width="80px">
                <el-select v-model="addForm.flightnum" style="width:100%" @change="getFlightRatio">
                  <el-option label="早" value="早班"></el-option>
                  <el-option label="晚" value="晚班"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row class="itemTitle">注意事项</el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="注意事项" prop="attention" label-width="80px">
                <el-select v-model="addForm.attention" placeholder="请选择" style="width:100%">
                  <el-option v-for="item in attentionOptions" :key="item.value" :label="item.label"
                             :value="item.value"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row class="itemTitle">货物信息</el-row>
          <el-table :data="cargoTableData" size="mini" width="100%" @cell-click="cellEdit" :cell-class-name="getRowColumn"
                    :summary-method="getSummary" class="cargoTableStyle">
            <el-table-column label="件数" prop="rcp"  align="center" width="60px">
              <template slot-scope="scope">
                <el-input v-model="scope.row.rcp" v-if="scope.row.index==tabRowIndex && scope.column.index==tabColumnIndex" :size="cargoSize">
                </el-input >
                <span v-else>{{scope.row.rcp}}</span>
              </template>
            </el-table-column>
            <el-table-column label="商品代码" align="center">
              <template slot-scope="scope">
                <el-select v-model="scope.row.itemnum" v-if="scope.row.index==tabRowIndex && scope.column.index==tabColumnIndex"
                           @change="changeGoodNum" :size="cargoSize">
                  <template v-for="item in goodsInfoOptions">
                    <el-option :label="item.goodnum" :value="item.goodnum" :key="item.goodnum"></el-option>
                  </template>
                </el-select>
                <span v-else>{{scope.row.itemnum}}</span>
              </template>
            </el-table-column>
            <el-table-column label="运价种类" prop="rateclass" align="center" >
              <template slot-scope="scope">
                <el-select v-model="scope.row.rateclass" v-if="scope.row.index==tabRowIndex && scope.column.index==tabColumnIndex"
                           @change="changeGoodType" :size="cargoSize">
                  <template v-for="item in goodsInfoOptions">
                    <el-option :label="item.goodtype" :value="item.goodtype" :key="item.goodtype"></el-option>
                  </template>
                </el-select>
                <span v-else>{{scope.row.rateclass}}</span>
              </template>
            </el-table-column>
            <el-table-column label="毛重" prop="grossweight" align="center" width="60px">
              <template slot-scope="scope">
                <el-input v-model="scope.row.grossweight" v-if="scope.row.index==tabRowIndex && scope.column.index==tabColumnIndex" :size="cargoSize">
                </el-input>
                <span v-else>{{scope.row.grossweight}}</span>
              </template>
            </el-table-column>
            <el-table-column label="计费重量" prop="chargeweight" align="center">
              <template slot-scope="scope">
                <span>{{scope.row.chargeweight}}</span>
              </template>
            </el-table-column>
            <el-table-column label="费率" prop="rate" align="center" >
              <template slot-scope="scope">
                <span>{{scope.row.rate}}</span>
              </template>
            </el-table-column>
            <el-table-column label="航空运费" prop="weightcharge" align="center">
              <template slot-scope="scope">
                <span>{{scope.row.weightcharge}}</span>
              </template>
            </el-table-column>
            <el-table-column label="货物包装" prop="goodname" align="center" >
              <template slot-scope="scope">
                <el-input v-model="scope.row.goodname" v-if="scope.row.index==tabRowIndex && scope.column.index==tabColumnIndex" :size="cargoSize">
                </el-input>
                <span v-else>{{scope.row.goodname}}</span>
              </template>
            </el-table-column>
            <el-table-column label="尺寸(m)" align="center">
              <el-table-column label="长" prop="chang" align="center" width="50px">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.chang" v-if="scope.row.index==tabRowIndex && scope.column.index==tabColumnIndex" :size="cargoSize">
                  </el-input>
                  <span v-else>{{scope.row.chang}}</span>
                </template>
              </el-table-column>
              <el-table-column label="宽" prop="kuan" align="center" width="50px">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.kuan" v-if="scope.row.index==tabRowIndex && scope.column.index==tabColumnIndex" :size="cargoSize">
                  </el-input>
                  <span v-else>{{scope.row.kuan}}</span>
                </template>
              </el-table-column>
              <el-table-column label="高" prop="gao" align="center" width="50px">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.gao" v-if="scope.row.index==tabRowIndex && scope.column.index==tabColumnIndex" :size="cargoSize">
                  </el-input>
                  <span v-else>{{scope.row.gao}}</span>
                </template>
              </el-table-column>
              <el-table-column label="体积" prop="tiji" align="center" width="50px">
                <template slot-scope="scope">
                  <span>{{scope.row.tiji}}</span>
                </template>
              </el-table-column>
            </el-table-column>
            <el-table-column label="操作" align="center" width="50px">
              <template slot-scope="scope">
                <el-button icon="el-icon-delete" type="text" :size="cargoSize" @click.native.prevent="deleteCargoRow(scope.$index,cargoTableData)"></el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="text-align:center">
            <el-button icon="el-icon-circle-plus-outline"  @click="addCargoTable" :size="cargoSize"></el-button>
          </div>
          <el-row class="itemTitle">付款金额</el-row>
          <el-row>
            <template v-for="item in payOptions">
              <el-col :span="8">
                <el-form-item :label="item.label" :prop="item.prop" label-width="80px">
                  <el-radio-group v-model="addForm[item.prop]" >
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
            <el-col :span="8">
              <el-form-item label="时间" prop="create_time" label-width="80px">
                <el-input v-model="addForm.create_time" :disabled="true">
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="地点" prop="place" label-width="80px">
                <el-select v-model="addForm.place" style="width: 100%">
                  <el-option label="北京分公司" value="北京分公司"></el-option>
                  <el-option label="南京分公司" value="南京分公司"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="制单员" prop="carrier" label-width="80px">
                <el-input v-model="addForm.carrier" :disabled="true">
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer" v-show="permVisible=='valid'">
        <kt-button label="暂存" type="primary" perms="air:aviation:add" @click="submitForm('addForm','staging','')"
                   v-show="typeVisible=='makeform'"/>
        <kt-button label="提交" type="primary" @click="submitForm('addForm','used','')" perms="air:aviation:add"/>
        <kt-button label="作废" type="primary" @click="submitForm('addForm','invalid','')" perms="air:aviation:add"/>
        <kt-button label="打印" type="primary" v-print="'#print_content'" perms="air:aviation:add"/>
        <kt-button label="下一票" type="primary" @click="submitForm('addForm','used','next')" perms="air:aviation:add"
                   v-show="typeVisible=='makeform'"/>
      </span>
      <el-dialog title="请选择作废原因" :visible.sync="invalidReasonDialogVisible" width="30%" append-to-body>
        <el-radio-group v-model="addForm.invalidreason">
          <el-radio label="客户退货"></el-radio>
          <el-radio label="航班取消"></el-radio>
          <el-radio label="航班拉货"></el-radio>
          <el-radio label="人为操作"></el-radio>
        </el-radio-group>
        <div slot="footer" class="dialog-footer">
          <el-button @click.native="invalidReasonDialogVisible = false">取消</el-button>
          <el-button type="primary" @click.native="submitFormInvalid">确定</el-button>
        </div>
      </el-dialog>
    </el-dialog>
    <el-dialog title="单号导入" :visible.sync="singleDialogVisible" width="350px">
      <el-form :model="dataForm" label-width="60px" :rules="dataFormRules" ref="dataForm">
        <el-form-item label="单号" prop="aviationnum">
          <el-input v-model="dataForm.aviationnum" auto-complete="off" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button @click.native="singleDialogVisible = false">{{$t('action.cancel')}}</el-button>
          <el-button type="primary" @click.native="submitSingleForm"
                     :loading="editLoading">{{$t('action.submit')}}</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
    import KtTable from "@/views/Core/KtTable";
    import KtButton from "@/views/Core/KtButton";
    import AirForm from '@/views/Airport/AirForm'
    import Cookies from "js-cookie"

    let tokens = Cookies.get('token')
    let user = Cookies.get('user')
    export default {
        components: {
            KtTable,
            KtButton,
            AirForm
        },
        data() {
            return {
                invalidReasonDialogVisible:false,
                cargoSize:'mini',
                sendRatio:1,
                flightRatio:1,
                tableSize: 'small',
                usedCurrentPage: 1,
                usedPageSize: 10,
                invalidCurrentPage: 1,
                invalidPageSize: 10,
                notUsedCurrentPage: 1,
                notUsedPageSize: 10,
                headers: {token: tokens},
                dateArray: [],//记录日期选择器时间
                permVisible: 'invalid',//valid为制单和已使用单号的编辑页面（button保留），invalid为作废的查看页面，button禁掉。
                typeVisible: 'makeform',//makeform为制单页面，edit为编辑页面
                keywords: '',
                usedTotal: 0,
                invalidTotal: 0,
                notUsedTotal: 0,
                usedTable: [],
                invalidTable: [],
                notUsedTable: [],
                dialogVisible: false,
                value: "",
                input1: "",
                singleDialogVisible: false,
                activeName: "used",
                usedHeaders: [
                    {prop: "aviationnum", label: "单号"},
                    {prop: "sendname", label: "发货人"},
                    {prop: "destinationstation", label: "目的站"},
                    {prop: "flight", label: "航班号"},
                    {prop: "rateclass", label: "件数"},
                    {prop: "chargeweight", label: "重量"}
                ],
                invalidHeaders: [
                    {prop: "aviationnum", label: "作废单号"}
                ],
                notUsedHeaders: [
                    {prop: "aviationnum", label: "未使用单号"}
                ],
                dialogVisible: false,
                editLoading: false,
                dataFormRules: {
                    aviationnum: [{required: true, message: "请输入单号", trigger: "blur"}]
                },
                dataForm: {
                    id: 0,
                    aviationnum: ''
                },
                fileList: [],
                addForm: {},
                addFormRules:{
                    aviationnum: [{required: true,message:' ',trigger:'blur'}],
                    deliverystation: [{required: true,message:' ',trigger:'blur'}],
                    startstation: [{required: true,message:' ',trigger:'blur'}],
                    outstation: [{required: true,message:' ',trigger:'blur'}],
                    sendname: [{required: true,message:' ',trigger:'blur'}],
                    sendtel: [{required: true,message:' ',trigger:'blur'}],
                    sendadr: [{required: true,message:' ',trigger:'blur'}],
                    cashtype:[{required: true,message:' ',trigger:'blur'}],
                    receivername: [{required: true,message:' ',trigger:'blur'}],
                    receivertel: [{required: true,message:' ',trigger:'blur'}],
                    receiveradr: [{required: true,message:' ',trigger:'blur'}],
                    firstcarrier: [{required: true,message:' ',trigger:'blur'}],
                    transferstation: [{required: true,message:' ',trigger:'blur'}],
                    destinationstation: [{required: true,message:' ',trigger:'blur'}],
                    flight: [{required: true,message:' ',trigger:'blur'}],
                    riqi: [{required: true,message:' ',trigger:'blur'}],
                    flightnum: [{required: true,message:' ',trigger:'blur'}],
                    attention: [{required: true,message:' ',trigger:'blur'}],
                    paytype:[{required: true,message:' ',trigger:'blur'}],
                    weightallcharges:[{required: true,message:' ',trigger:'blur'}],
                    otherallcharges:[{required: true,message:' ',trigger:'blur'}],
                    total:[{required: true,message:' ',trigger:'blur'}],
                    create_time: [{required: true,message:' ',trigger:'blur'}],
                    place: [{required: true,message:' ',trigger:'blur'}],
                    carrier: [{required: true,message:' ',trigger:'blur'}]
                },
                labelPosition: 'left',
                aviationnumOptions: [],//--单号
                deliveryOptions: [//--交货运站
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
                stationOptions: [//--出港目的地
                    {label: '始发站', prop: 'startstation'},
                    {label: '目的站', prop: 'outstation'},
                ],
                allStationOptions: [],//--站点信息表--对应出港目的地
                sendNameOptions: [],//--托运人信息表
                sendInfoOptions: [//--托运人信息
                    {label: '电话', prop: 'sendtel', labelwidth: '60px',disable:true},
                    {label: '地址', prop: 'sendadr', labelwidth: '60px',disable:true}
                ],
                receiverInfoOptions: [
                    {label: '电话', prop: 'receivertel',disable:true},
                    {label: '地址', prop: 'receiveradr',disable:true},
                ],
                receiveNameOptions: [],
                flightOptions: [],//--航班表--筛后数据
                attentionOptions: [
                    {
                        value: "机场自提,普货无锂电池非危险品",
                        label: "机场自提,普货无锂电池非危险品"
                    },
                    {
                        value: "送货",
                        label: "送货"
                    }
                ],
                cargoTableData:[],
                tabRowIndex:-1,
                tabColumnIndex:-1,
                goodsInfoOptions:[],
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
                        prop: 'cashtype',
                        radioOptions: [
                            {label: '现结', labelText: '现结'},
                            {label: '月结', labelText: '月结'}
                        ]
                    }
                ],
                chargeOptions: [
                    {label: '航空费用', prop: 'weightallcharges', disable: true},
                    {label: '其他费用', prop: 'otherallcharges', disable: false},
                    {label: '总额', prop: 'total', disable: true},
                ],
                fillInfoOptions: [
                    {label: '时间', prop: 'create_time',disable: true},
                    {label: '地点', prop: 'place',disable: false},
                    {label: '制单员', prop: 'carrier',disable: true}
                ]
            };
        },
        methods: {
            cellEdit(row,column){
                this.tabRowIndex=row.index
                this.tabColumnIndex=column.index
            },
            getRowColumn({row,column,rowIndex,columnIndex}){
                row.index=rowIndex
                column.index=columnIndex
            },
            deleteCargoRow(index,rows){
                rows.splice(index, 1)
            },
            getSummary(param){
                const { columns, data } = param;
                const sums = [];
                columns.forEach((column, index) => {
                    if (index === 0) {
                        sums[index] = '总价';
                        return;
                    }
                    const values = data.map(item => Number(item[column.property]));
                    if (!values.every(value => isNaN(value))) {
                        sums[index] = values.reduce((prev, curr) => {
                            const value = Number(curr);
                            if (!isNaN(value)) {
                                return prev + curr;
                            } else {
                                return prev;
                            }
                        }, 0);
                        sums[index] += ' 元';
                    } else {
                        sums[index] = 'N/A';
                    }
                });

                return sums;
            },
            addCargoTable(){
                console.log(this.cargoTableData)
                this.cargoTableData.push({})
            },
            returnUsedIndex(val) {
                return (this.usedCurrentPage - 1) * this.usedPageSize + val + 1
            },
            usedHandleSizeChange(val) {
                this.usedPageSize = val
                this.refreshUsedData()
            },
            usedHandleCurrentChange(val) {
                this.usedCurrentPage = val
                this.refreshUsedData()
            },
            returnInvalidIndex(val) {
                return (this.invalidCurrentPage - 1) * this.invalidPageSize + val + 1
            },
            invalidHandleSizeChange(val) {
                this.invalidPageSize = val
                this.refreshData("invalid")
            },
            invalidHandleCurrentChange(val) {
                this.invalidCurrentPage = val
                this.refreshData('invalid')
            },
            returnNotUsedIndex(val) {
                return (this.notUsedCurrentPage - 1) * this.notUsedPageSize + val + 1
            },
            notUsedHandleSizeChange(val) {
                this.notUsedPageSize = val
                this.refreshData("not_used")
            },
            notUsedHandleCurrentChange(val) {
                this.notUsedCurrentPage = val
                this.refreshData('not_used')
            },
            getAviationnumOptions() { //获取单号
                this.$api.tAviationnum.refreshList({
                    columnFilters: {type: {name: 'type', value: 'not_used'}},
                    pageSize: 0,
                    pageNum: 0
                }).then(res => {
                    if (res.code == 200) {
                        this.aviationnumOptions = res.data.content
                    }
                })
            },
            changeDeliveryStation(val) {//改变交货运站--影响第一承运，获取货物信息表--通过航司筛选（涉及费率）
                console.log(val[0])
                if (val[0] == '东航') {
                    this.addForm.firstcarrier = 'MU'
                } else {
                    this.addForm.firstcarrier = 'CZ'
                }
                this.$api.searchGoodsList({
                    airfight:val[0]
                }).then(res=>{
                    if(res.code==200){
                        this.goodsInfoOptions=res.data
                    }
                })

            },
            getAllStationOptions() {//获取所有站点
                this.$api.transfer.getInfos({
                    columnFilters: {type: {name: 'keywords', value: ''}},
                    pageSize: 0,
                    pageNum: 0
                }).then(res => {
                    console.log(res)
                    if (res.code == 200) {
                        this.allStationOptions = res.data.content
                    }
                })
            },
            getSendNameOptions() {//获取托运人信息表
                this.$api.send.getInfos({
                    columnFilters: {type: {name: 'keywords', value: ''}},
                    pageSize: 0,
                    pageNum: 0
                }).then(res => {
                    console.log(res)
                    if (res.code == 200) {
                        this.sendNameOptions = res.data.content
                    }
                })
            },
            changeSendName(val) {//托运人信息自动关联,获取托运人费率
                console.log(val)
                this.sendNameOptions.forEach(function (item, index) {
                    if (item.sendname == val) {
                        this.addForm.sendtel = item.sendtel
                        this.addForm.sendadr = item.sendadr
                        this.addForm.cashtype = item.cashtype
                    }
                })
                this.$api.ratio.getRatio({
                    sendname:val
                }).then(res=>{
                    if(res.code==200){
                        this.sendRatio=res.data[0]
                    }
                })
            },
            getFlightRatio(val){//班次改变，获取班次费率
                this.$api.ratio.getRatio({
                    sendname:val
                }).then(res=>{
                    if(res.code==200){
                        this.flightRatio=res.data[0]
                    }
                })
            },
            getReceiveNameOptions() {//获取收货人信息表
                this.$api.receiver.getInfos({
                    columnFilters: {type: {name: 'keywords', value: ''}},
                    pageSize: 0,
                    pageNum: 0
                }).then(res => {
                    console.log(res)
                    if (res.code == 200) {
                        this.receiveNameOptions = res.data.content
                    }
                })
            },
            changeReceiveName() {//收货人信息自动关联
                console.log(val)
                this.receiveNameOptions.forEach(function (item, index) {
                    if (item.receivename == val) {
                        this.addForm.receivertel = item.receivetel
                        this.addForm.receivertel = item.receiveadr
                    }
                })
            },
            getFlightOptions() {//获取筛选后的航班号列表
                console.log(this.addForm.startstation)
                console.log(this.addForm.outstation)
                if (this.addForm.startstation != '' && this.addForm.startstation != undefined && this.addForm.outstation != ''&& this.addForm.outstation != undefined) {
                    this.$api.flight.searchFlightList({
                        startStation:this.addForm.startstation,
                        destination:this.addForm.outstation
                    }).then(res=>{
                        console.log(res)
                        if(res.code==200){
                            this.flightOptions=res.data
                        }
                    })
                }
            },
            selectFlight(val){//选定航班，关联班次
                this.flightOptions.forEach(function (item, index) {
                    if (item.flight == val) {
                        this.addForm.flightnum = item.flightnum
                    }
                })
            },
            changeGoodNum(val){//商品代码改变，关联运价种类和费率
                console.log(val)
                console.log(this.tabRowIndex)
                this.goodsInfoOptions.forEach(function (item, index) {
                    if (item.goodnum == val) {
                        this.cargoTableData[this.tabRowIndex].goodtype=item.goodtype
                        this.cargoTableData[this.tabRowIndex].goodratio=item.sendnameexp
                    }
                })
            },
            changeGoodType(val){//运价种类改变，关联商品代码
                console.log(val)
                console.log(this.tabRowIndex)
                this.goodsInfoOptions.forEach(function (item, index) {
                    if (item.goodtype == val) {
                        this.cargoTableData[this.tabRowIndex].goodnum=item.goodnum
                        this.cargoTableData[this.tabRowIndex].goodratio=item.sendnameexp
                    }
                })
            },
            getCurrentTime(){//获取当前时间
                let currentTime=new Date()
                console.log(currentTime)
                let dateValue=currentTime.getFullYear()+'-'+(currentTime.getMonth()+1)+'-'+currentTime.getDate()
                console.log(dateValue)
                this.addForm.create_time=dateValue
            },
            viewInvalidDetail(index, row) {//查看作废单号---只有查看，最后一行功能要禁掉
                // console.log(row)
                this.dialogVisible = true
                this.addForm = row
                this.permVisible = "invalid"
            },
            editUsedDetail(index, row) {  //修改已使用单号
                this.permVisible = "valid"
                this.typeVisible = 'edit'
                this.dialogVisible = true
                this.addForm = row
            },
            searchTable() { //查询
                this.usedCurrentPage = 1
                this.refreshUsedData()
            },
            handleTabChange(tab, event) { //tab页切换
                console.log(tab.name)
                if (tab.index == 0) {
                    this.refreshUsedData()
                } else {
                    this.refreshData(tab.name)
                }
            },
            makeForm() {  //制单，获取暂存数据
                this.getAviationnumOptions()
                this.getSendNameOptions()
                this.getReceiveNameOptions()
                this.getAllStationOptions()
                this.getCurrentTime()
                this.addForm.carrier=user
                this.permVisible = 'valid';
                this.typeVisible = 'makeform'
                this.$api.tAviationnum.getStagingData().then(res => {
                    console.log(res)
                    if (res.code == 200) {
                        if (res.data != null) {
                            this.addForm = res.data
                        }
                    } else {
                        this.$message.error("获取暂存数据失败！")
                    }
                    this.dialogVisible = true;
                })
            },
            refreshUsedData() { // 更新已使用单号列表
                const columnFilter = {
                    keywords: {name: 'keywords', value: this.keywords},
                    date1: {name: 'date1', value: this.dateArray.length > 0 ? this.dateArray[0] : ''},
                    date2: {name: 'date2', value: this.dateArray.length > 0 ? this.dateArray[1] : ''},
                }
                console.log(columnFilter)
                this.$api.tAviationnum.refreshUsedList({
                    columnFilters: columnFilter,
                    pageSize: this.usedPageSize,
                    pageNum: this.usedCurrentPage
                }).then(res => {
                    console.log(res)
                    if (res.code == 200) {
                        this.usedTable = res.data.content
                        this.usedTotal = res.data.totalSize
                    }
                })
            },
            refreshData(val) { // 更新作废单号列表或者未使用单号列表
                this.$api.tAviationnum.refreshList({
                    columnFilters: {type: {name: 'type', value: val}},
                    pageSize: val == 'invalid' ? this.invalidPageSize : this.notUsedPageSize,
                    pageNum: val == 'invalid' ? this.invalidCurrentPage : this.notUsedCurrentPage
                }).then(res => {
                    console.log(res)
                    if (res.code == 200) {
                        if (val == 'invalid') {
                            this.invalidTable = res.data.content
                            this.invalidTotal = res.data.totalSize
                        } else {
                            this.notUsedTable = res.data.content
                            this.notUsedTotal = res.data.totalSize
                        }
                    }
                })
            },
            submitSingleForm: function () {  // 单号导入--提交
                this.$refs.dataForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true
                            let params = Object.assign({}, this.dataForm)
                            this.$api.tAviationnum.save(params).then((res) => {
                                if (res.code == 200) {
                                    this.$message({message: '操作成功', type: 'success'})
                                    this.editLoading = false
                                    this.$refs['dataForm'].resetFields()
                                    this.singleDialogVisible = false
                                    this.activeName = 'not_used'
                                    this.refreshData('not_used')
                                    this.getAviationnumOptions()
                                } else {
                                    this.$message({message: '操作失败, ' + res.msg, type: 'error'})
                                }
                            })
                        })
                    }
                })
            },
            submitForm(formval, val, e) { // 制单----提交、作废、暂存、下一票
                this.addForm.lastupdateby = user
                if (val == 'staging') {
                    this.addForm.delflag = -1;
                } else if (val == 'used') {
                    this.addForm.delflag = 1;
                } else {
                    this.addForm.delflag = 2
                }
                this.$refs[formval].validate((valid) => {
                    const that = this
                    if (valid) {
                        if(val=='invalid'){
                            this.invalidReasonDialogVisible=true
                        }else{
                            this.$api.tAviationnum.savetAviation(this.addForm).then(res => {
                                if (res.code == 200) {
                                    that.$message({message: '操作成功', type: 'success'})
                                    that.refreshUsedData()
                                    that.refreshData("invalid")
                                    that.refreshData("not_used")
                                    this.$refs[formval].resetFields()
                                    if (e != 'next') {
                                        that.getAviationnumOptions()
                                        that.getCurrentTime()
                                        that.dialogVisible = false
                                    }
                                }
                            })
                        }

                    }
                })
            },
            submitFormInvalid(){
                this.$api.tAviationnum.savetAviation(this.addForm).then(res => {
                    if (res.code == 200) {
                        this.$message({message: '操作成功', type: 'success'})
                        this.refreshUsedData()
                        this.refreshData("invalid")
                        this.refreshData("not_used")
                        this.invalidReasonDialogVisible=false
                        this.dialogVisible = false
                        this.$refs['addForm'].resetFields()
                    }
                })
            },
            fileSuccess(res, file, fileList) {
                this.$message.success("文件上传成功");
                this.activeName = 'not_used'
                this.refreshData('not_used')
            },
            fileError(err, file, fileList) {
                this.$message.error("文件上传失败");
            },
            fileChange(files, fileList) {
                console.log(files);
                this.fileList = [];
                this.fileList.push(files.raw);
                let file = new FormData();
                file.append("file", files.raw);
            },
            handleExceed(files, fileList) {
                this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${
                    files.length
                } 个文件，
            共选择了 ${files.length + fileList.length} 个文件`);
            },
        },
        mounted() {
            this.refreshUsedData()
            this.refreshData('invalid')
            this.refreshData('not_used')
        },
        watch: {
            cargoTableData:{
                handler(newarr,oldarr){
                    this.addForm.weightallcharges=0;
                    for (let i = 0; i < this.cargoTableData.length; i++) {
                        this.cargoTableData[i].tiji= this.cargoTableData[i].chang* this.cargoTableData[i].kuan*this.cargoTableData[i].gao
                        this.cargoTableData[i].rate=this.sendRatio*this.flightRatio*this.cargoTableData[i].goodratio
                        this.cargoTableData[i].chargeweight=Number(this.cargoTableData[i].tiji*this.cargoTableData[i].rcp*1000/6).toFixed(2)
                        this.cargoTableData[i].weightcharge=Number(this.cargoTableData[i].chargeweight) > Number(this.cargoTableData[i].grossweight) ? Number(this.cargoTableData[i].chargeweight*this.cargoTableData[i].rate).toFixed(2) :Number(this.cargoTableData[i].grossweight*this.cargoTableData[i].rate).toFixed(2)
                        this.addForm.weightallcharges+=Number(this.cargoTableData[i].weightcharge)
                        this.addForm.total=Number(this.addForm.otherallcharges)+Number(this.addForm.weightallcharges)
                    }
                },
                immediate:true,
                deep:true
            },
            'addForm.otherallcharges':{
                handler(newvalue,oldvalue){
                    this.addForm.total=Number(this.addForm.otherallcharges)+Number(this.addForm.weightallcharges)
                },
                immediate:true,
                deep:true
            }

        }
    };
</script>
<style scoped lang="scss">
  .toolbar {
    display: flex;
    justify-content: flex-start;
  }

  .menu-container {
    margin-top: 10px;
  }

  .menu-header {
    padding-left: 8px;
    padding-bottom: 5px;
    text-align: left;
    font-size: 16px;
    color: rgb(20, 89, 121);
  }

  .tabs {
    width: 100%;
    align-items: center;
    justify-content: space-between;
    display: flex;

    .btn {
      width: 260px;
      align-items: center;
      justify-content: space-around;
      display: flex;

      .el-upload {
        margin: 0 10px;
      }
    }
  }

  .dialog-footer {
    text-align: right;
  }

  .head {
    display: flex;
    margin-bottom: 5px;

    .ipt {
      display: flex;
      align-items: center;
      margin-left: 10px;

      .el-input {
        width: 210px;
        margin-left: 5px;
      }
    }
  }

  .content {
    padding: 10px;
    /*border: 1px solid gray;*/
  }

  ._item {
    margin-top: 5px;
    margin-bottom: 5px;

    .label {
      text-align: left;
      color: #888888;
      /*color: #246894;*/
      font-size: 14px;
      font-weight: bold;
    }

    /deep/ .el-input-group__prepend {
      /*background-color: #0088AA;*/
      /*background-color: none;*/
      color: #333333;
      width: 60px;
      padding: 0 5px;
    }
  }

  ._select {
    margin-left: 1px;
    margin-bottom: 1px;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    span {
      display: inline-block;
      background-color: #f5f7fa;
      color: #333333;
      width: 60px;
      height: 30px;
      line-height: 30px;
      padding: 0 5px;
      font-size: 13px;
      border: 1px solid #DCDFE6;
      border-radius: 4px;
    }
  }

  #descr_Form > > > .el-form-item__label {
    font-size: 12px;
  }

  .prefixStyle {
    color: #333333;
    width: 60px;
    padding: 0 5px;
  }

  .el_prefix {
    color: #333333;
    width: 60px;
    padding: 0 5px;
    height: 30px;
    line-height: 30px;
    margin: 0px;
    font-size: 13px;
    border: 1px solid #DCDFE6;
    border-radius: 4px;
  }

  .pageStyle {
    margin: 20px 0;
    text-align: right;
  }

  .formBorder {
    padding: 5px 10px 10px 10px;
  }

  .itemTitle {
    text-align: left;
    color: #888888;
    font-size: 14px;
    font-weight: bold;
  }
  .makeFormStyle /deep/ .el-dialog__body{
    padding:10px 20px
  }
  .makeFormStyle /deep/ .el-form-item {
    white-space: nowrap;
    margin-bottom: 5px;
  }

  .makeFormStyle /deep/ .el-form-item__label {
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

  .col_input > > > .el-input__inner {
    border-top: 0px;
    border-left: 0px;
    border-right: 0px;
    border-bottom: 0px;
    padding: 0;
    border-radius: 0;
    outline: none;
    width: 80%;
    text-overflow: ellipsis;
  }

  .col_input_mini > > > .el-input__inner {
    border-top: 0px;
    border-left: 0px;
    border-right: 0px;
    border-bottom: 1px solid #DCDFE6;
    padding: 0;
    border-radius: 0;
    outline: none;
    width: 80%;
    text-overflow: ellipsis;
  }

  .col_mini {
    padding-top: 8px
  }

  .cargoTableStyle /deep/ .cell{
    padding-left:5px;
    padding-right:5px
  }
  .cargoTableStyle /deep/ .el-input__inner{
    padding:0 0px
  }
</style>
