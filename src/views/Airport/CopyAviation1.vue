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
            type="datetimerange"
            value-format="yyyy-MM-dd HH:mm:ss"
            :picker-options="pickerOptions"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="right">
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
      <el-table :data="usedTable" :size="tableSize" :cell-style="{padding:'3px 0'}" :header-cell-style="{background:'#EEEEEE',color:'#606266'}">
        <el-table-column type="index" :index="returnUsedIndex" label="序号"></el-table-column>
        <template v-for="item in usedHeaders">
          <el-table-column :label="item.label" :prop="item.prop"></el-table-column>
        </template>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-edit" @click="editUsedDetail(scope.$index,scope.row)" :size="tableSize">编辑</el-button>
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
      <el-table :data="invalidTable" :size="tableSize" :cell-style="{padding:'3px 0'}" :header-cell-style="{background:'#EEEEEE',color:'#606266'}">
        <el-table-column type="index" :index="returnInvalidIndex" label="序号" width="200"></el-table-column>
        <el-table-column label="单号" prop="aviationnum"></el-table-column>
        <el-table-column label="操作" >
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-view" @click="viewInvalidDetail(scope.$index,scope.row)" :size="tableSize">查看</el-button>
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
      <el-table :data="notUsedTable" :size="tableSize" :cell-style="{padding:'3px 0'}" :header-cell-style="{background:'#EEEEEE',color:'#606266'}">
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
    <el-dialog :visible.sync="dialogVisible" width="800px">
      <AirForm v-if="true"></AirForm>
      <el-form id="print_content" v-else>
        <div class="head">
          <div class="ipt">
            <span>单号:</span>
            <el-select v-model="filters.aviationnum" size="mini">
              <template v-for="item in aviationnumOptions">
                <el-option :label="item.aviationnum" :key="item.aviationnum" :value="item.aviationnum"></el-option>
              </template>
            </el-select>
          </div>
          <div class="ipt">
            <span>交货运站:</span>
            <el-cascader v-model="filters.deliverystation" :options="deliveryOptions" size="mini"></el-cascader>
          </div>
        </div>
        <div class="content">
          <div class="_item">
            <div class="label">出港目的地</div>
            <el-row>
              <el-col :span="12">
                <el-input v-model="filters.startstation" size="small">
                  <template slot="prepend">始发站</template>
                </el-input>
              </el-col>
              <el-col :span="12">
                <el-input v-model="filters.outstation" size="small">
                  <template slot="prepend">目的站</template>
                </el-input>
              </el-col>
            </el-row>
          </div>
          <div class="_item">
            <div class="label">托运人信息</div>
            <el-row>
              <el-col :span="6">
                <div class="_select">
                  <span>姓名</span>
                  <el-select v-model="filters.sendname" size="small">
                    <template v-for="item in sendNameOptions">
                      <el-option :label="item.sendname" :value="item.sendname" :key="item.sendname">
                      </el-option>
                    </template>
                  </el-select>
                </div>
              </el-col>
              <el-col :span="6">
                <el-input v-model="filters.sendtel" size="small">
                  <template slot="prepend">电话</template>
                </el-input>
              </el-col>
              <el-col :span="6">
                <el-input v-model="filters.sendadr" size="small">
                  <template slot="prepend">地址</template>
                </el-input>
              </el-col>
              <el-col :span="6">
                <el-input v-model="filters.cashtype" size="small">
                  <template slot="prepend">结算方式</template>
                </el-input>
              </el-col>
            </el-row>
          </div>
          <div class="_item">
            <div class="label">收货人信息</div>
            <el-row>
              <el-col :span="8">
                <div class="_select">
                  <span>姓名</span>
                  <el-select v-model="filters.receviername" size="small" >
                    <template v-for="item in receiverOptions">
                      <el-option :label="item.label" :value="item.label" :key="item.label"></el-option>
                    </template>
                  </el-select>
                </div>
              </el-col>
              <el-col :span="8">
                <el-input v-model="filters.receviertel" size="small">
                  <template slot="prepend">电话</template>
                </el-input>
              </el-col>
              <el-col :span="8">
                <el-input v-model="filters.recevieradr" size="small">
                  <template slot="prepend">地址</template>
                </el-input>
              </el-col>
            </el-row>
          </div>
          <div class="_item">
            <div class="label">航线</div>
            <el-row>
              <el-col :span="8">
                <el-input v-model="filters.firstcarrier" size="small">
                  <template slot="prepend">第一承运</template>
                </el-input>
              </el-col>
              <el-col :span="8">
                <el-input v-model="filters.transferstation" size="small">
                  <template slot="prepend">中转站</template>
                </el-input>
              </el-col>
              <el-col :span="8">
                <el-input v-model="filters.destinationstation" size="small">
                  <template slot="prepend">到达站</template>
                </el-input>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-input v-model="filters.flight" size="small">
                  <template slot="prepend">航班</template>
                </el-input>
              </el-col>
              <el-col :span="8">
                <el-input v-model="filters.riqi" size="small">
                  <template slot="prepend">日期</template>
                </el-input>
              </el-col>
              <el-col :span="8">
                <el-input v-model="filters.flightnum" size="small">
                  <template slot="prepend">班次</template>
                </el-input>
              </el-col>
            </el-row>
          </div>
          <div class="_item">
            <div class="label">注意事项</div>
            <div class="_select">
              <span>注意事项</span>
              <el-select v-model="filters.attention" slot="append" clearable placeholder="请选择" size="small">
                <el-option
                  v-for="item in attention_options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
          </div>
          <!-- 表格 -->
          <div class="_item">
            <div class="label">货物信息</div>
            <el-descriptions direction="vertical" :column="9" border size="small">
              <el-descriptions-item label="物品名称">
                <el-input v-model="filters.goodname" size="mini"></el-input>
              </el-descriptions-item>
              <el-descriptions-item label="商品代号">
                <el-input v-model="filters.weightnum" size="mini"></el-input>
              </el-descriptions-item>
              <el-descriptions-item label="件数运价点">
                <el-input v-model="filters.rcp" size="mini"></el-input>
              </el-descriptions-item>
              <el-descriptions-item label="运件种类">
                <el-select v-model="filters.rateclass" size="mini">
                  <template v-for="item in rateClassOptions">
                    <el-option :label="item.label" :value="item.value" :key="item.value"></el-option>
                  </template>
                </el-select>
              </el-descriptions-item>
              <el-descriptions-item label="尺寸（米）">
                <el-row>
                  <el-input v-model="filters.chang" placeholder="" size="mini">
                    <template slot="prefix">长</template>
                  </el-input>
                  *
                  <el-input v-model="filters.kuan" placeholder="" size="mini">
                    <template slot="prefix">宽</template>
                  </el-input>
                  *
                  <el-input v-model="filters.gao" placeholder="" size="mini">
                    <template slot="prefix">高</template>
                  </el-input>

                  =
                  <span>{{tiji}}（m³）</span>
                </el-row>
              </el-descriptions-item>
              <el-descriptions-item label="毛重(千克)">
                <el-input v-model="filters.grossweight" size="mini"></el-input>
              </el-descriptions-item>
              <el-descriptions-item label="计费重量(千克)">
                {{chargeweight}}
              </el-descriptions-item>
              <el-descriptions-item label="费率">
                <el-input v-model="filters.rate" size="mini"></el-input>
              </el-descriptions-item>
              <el-descriptions-item label="航空运费">
                {{weightcharge}}
              </el-descriptions-item>
            </el-descriptions>
          </div>
          <div class="_item">
            <div class="label">付款金额</div>
            <div class="_select">
              <span>其他费用</span>
              <el-select v-model="filters.othercharges" slot="append" clearable placeholder="请选择" size="small">
                <el-option
                  v-for="item in otherChargeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
            <el-row>
              <el-col :span="12">
                <div class="_select">
                  <span style="margin-right: 10px;">付款类型</span>
                  <el-radio-group v-model="filters.paytype">
                    <el-radio label="prepaid">预付</el-radio>
                    <el-radio label="collect">到付</el-radio>
                  </el-radio-group>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="_select">
                  <span style="margin-right: 10px;">付款方式</span>
                  <el-radio-group v-model="filters.paymethod">
                    <el-radio label="cash">现金</el-radio>
                    <el-radio label="online_banking">网银</el-radio>
                  </el-radio-group>
                </div>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="8">
                <el-input v-model="weightcharge" size="small" :disabled="true">
                  <template slot="prepend">航空费用</template>
                </el-input>
              </el-col>
              <el-col :span="8">
                <el-input v-model="filters.otherallcharges" size="small">
                  <template slot="prepend">其他总费用</template>
                </el-input>
              </el-col>
              <el-col :span="8">
                <el-input v-model="total" size="small" :disabled="true">
                  <template slot="prepend">总额</template>
                </el-input>
              </el-col>
            </el-row>
          </div>
          <div class="_item">
            <div class="label">填写信息</div>
            <el-row>
              <el-col :span="8">
                <el-input v-model="filters.create_time" size="small">
                  <template slot="prepend">时间</template>
                </el-input>
              </el-col>
              <el-col :span="8">
                <el-input v-model="filters.place" size="small">
                  <template slot="prepend">地点</template>
                </el-input>
              </el-col>
              <el-col :span="8">
                <el-input v-model="filters.carrier" size="small">
                  <template slot="prepend">制单员</template>
                </el-input>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer" v-show="permVisible=='valid'">
        <!-- <el-button @click="showDialog = false">取 消</el-button> -->
        <kt-button label="暂存" type="primary" perms="air:aviation:add" @click="submitForm('filters','staging','')" v-show="typeVisible=='makeform'"/>
        <kt-button label="提交" type="primary" @click="submitForm('filters','used','')" perms="air:aviation:add"/>
        <kt-button label="作废" type="primary" @click="submitForm('filters','invalid','')" perms="air:aviation:add"/>
        <kt-button label="打印" type="primary" v-print="'#print_content'" perms="air:aviation:add" />
        <kt-button label="下一票" type="primary" @click="submitForm('filters','used','next')" perms="air:aviation:add" v-show="typeVisible=='makeform'"/>
      </span>
    </el-dialog>
    <el-dialog title="单号导入" :visible.sync="singleDialogVisible" width="350px">
      <el-form :model="dataForm" label-width="60px" :rules="dataFormRules" ref="dataForm">
        <el-form-item label="单号" prop="aviationnum">
          <el-input v-model="dataForm.aviationnum" auto-complete="off" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
           <!--  <kt-button  label="取消" perms="sys:role:view" @click="singleDialogVisible = false"/>
          <kt-button  label="提交"  type="primary" perms="air:num:add"/>    -->
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
    let user=Cookies.get('user')
    export default {
        components: {
            KtTable,
            KtButton,
            AirForm
        },
        data() {
            return {
                tableSize:'small',
                usedCurrentPage:1,
                usedPageSize:10,
                invalidCurrentPage:1,
                invalidPageSize:10,
                notUsedCurrentPage:1,
                notUsedPageSize:10,
                headers:{token:tokens},
                dateArray:[],
                aviationnumOptions:[],
                sendNameOptions:[],
                permVisible:'invalid',//valid为制单和已使用单号的编辑页面（button保留），invalid为作废的查看页面，button禁掉。
                typeVisible:'makeform',//makeform为制单页面，edit为编辑页面
                deliveryOptions:[
                    {
                        value:'东航',
                        label:'东航',
                        children:[
                            {value:'大兴东航',label:'大兴东航'},
                            {value:'首都东航',label:'首都东航'},
                        ]
                    },
                    {
                        value:'南航',
                        label:'南航',
                        children: [
                            {value:'大兴南航',label:'大兴南航'}
                        ]
                    }
                ],
                receiverOptions:[
                    {label:'南京军铭物流有限公司'},
                    {label:'中集冷云（北京）供应链管理有限公司上海分公司'},
                    {label:'中集冷云（北京）供应链管理有限公司武汉分公司'},
                    {label:'武汉中航联物流有限公司'},
                    {label:'上海瞰为物流有限公司'},
                    {label:'杭州钧天货运服务有限公司'},
                    {label:'杭州吉邦航空货运代理有限公司'},
                    {label:'合肥优思达运输有限公司'},
                    {label:'合肥盛海货运有限公司'},
                ],
                rateClassOptions:[
                    {label:'',value:''}
                ],
                otherChargeOptions:[
                ],
                keywords:'',
                usedTotal:0,
                invalidTotal:0,
                notUsedTotal:0,
                usedTable: [],
                invalidTable: [],
                notUsedTable: [],
                cargoInfo: [],
                dialogVisible: false,
                value: "",
                input1: "",
                singleDialogVisible: false,
                activeName: "used",
                filters: {
                    id: 0,
                    aviationnum: '',
                    deliverystation: '',
                    startstation: "",
                    outstation: '',
                    sendname: '',
                    sendtel: '',
                    sendadr: '',
                    receviername: '',
                    receviertel: '',
                    recevieradr: '',
                    firstcarrier: '',
                    transferstation: '',
                    destinationstation: '',
                    flight: '',
                    riqi: '',
                    flightnum: '',
                    attention: '',
                    goodname:'',
                    weightnum:'',
                    rcp:'',
                    rateclass:'',
                    chang:"",
                    kuan:"",
                    gao:"",
                    tiji:"",
                    grossweight:0,
                    chargeweight:"",
                    rate:0,
                    weightcharge:"",
                    othercharges:'',
                    paytype:'',
                    paymethod: '',
                    otherallcharges:0,
                    total: '',
                    executedon: '',
                    place: '',
                    carrier: '',
                    delflag:'',
                    cashtype:''
                },
                filtersRules:{
                    aviationnum:[{required:true,message:'请选择单号',trigger:'blur'}]
                },
                columns: [],
                usedHeaders: [
                    // {prop:'id',label:'序号'},
                    {prop: "aviationnum", label: "单号"},
                    {prop: "sendname", label: "发货人"},
                    {prop: "destinationstation", label: "目的站"},
                    {prop: "flight", label: "航班号"},
                    {prop: "rateclass", label: "件数"},
                    {prop: "chargeweight", label: "重量"}
                ],
                invalidHeaders: [
                    // {prop: "id", label: "序号"},
                    {prop: "aviationnum", label: "作废单号"}
                ],
                notUsedHeaders: [
                    // {prop: "id", label: "序号"},
                    {prop: "aviationnum", label: "未使用单号"}
                ],
                attention_options: [
                    {
                        value: "attention1",
                        label: "attention1"
                    },
                    {
                        value: "attention2",
                        label: "attention2"
                    }
                ],
                pageRequest: {pageNum: 1, pageSize: 10},
                operation: false, // true:新增, false:编辑
                dialogVisible: false,
                editLoading: false,
                dataFormRules: {
                    name: [{required: true, message: "请输入角色名", trigger: "blur"}]
                },
                dataForm: {
                    id: 0,
                    aviationnum: '',
                },
                pickerOptions: {
                    shortcuts: [
                        {
                            text: "最近一周",
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                                picker.$emit("pick", [start, end]);
                            }
                        },
                        {
                            text: "最近一个月",
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                                picker.$emit("pick", [start, end]);
                            }
                        },
                        {
                            text: "最近三个月",
                            onClick(picker) {
                                return
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                                picker.$emit("pick", [start, end]);
                            }
                        }
                    ]
                },
                fileList: [],
            };
        },
        methods: {
            returnUsedIndex(val){
                return (this.usedCurrentPage-1)*this.usedPageSize +val+1
            },
            usedHandleSizeChange(val){
                this.usedPageSize=val
                this.refreshUsedData()
            },
            usedHandleCurrentChange(val){
                this.usedCurrentPage=val
                this.refreshUsedData()
            },
            returnInvalidIndex(val){
                return (this.invalidCurrentPage-1)*this.invalidPageSize +val+1
            },
            invalidHandleSizeChange(val){
                this.invalidPageSize=val
                this.refreshData("invalid")
            },
            invalidHandleCurrentChange(val){
                this.invalidCurrentPage=val
                this.refreshData('invalid')
            },
            returnNotUsedIndex(val){
                return (this.notUsedCurrentPage-1)*this.notUsedPageSize +val+1
            },
            notUsedHandleSizeChange(val){
                this.notUsedPageSize=val
                this.refreshData("not_used")
            },
            notUsedHandleCurrentChange(val){
                this.notUsedCurrentPage=val
                this.refreshData('not_used')
            },
            //获取单号
            getAviationnumOptions(){
                this.$api.tAviationnum.refreshList({
                    columnFilters:{type:{name:'type',value:'not_used'}},
                    pageSize:0,
                    pageNum:0
                }).then(res => {
                    if (res.code == 200) {
                        this.aviationnumOptions = res.data.content
                    }
                })
            },
            //获取托运人客户表
            getSendNameOptions(){
                this.$api.tAviationnum.getSendNameList().then(res=>{
                    console.log(res)
                    if(res.code==200){
                        this.sendNameOptions=res.data
                    }
                })
            },
            //查看作废单号---只有查看，最后一行功能要禁掉
            viewInvalidDetail(index,row){
                // console.log(row)
                this.dialogVisible=true
                this.filters=row
                this.permVisible="invalid"
            },
            //修改已使用单号
            editUsedDetail(index,row){
                this.permVisible="valid"
                this.typeVisible='edit'
                this.dialogVisible=true
                this.filters=row
            },
            //查询
            searchTable(){
                this.usedCurrentPage=1
                this.refreshUsedData()
            },
            //tab页切换
            handleTabChange(tab, event) {
                console.log(tab.name)
                if (tab.index == 0) {
                    this.refreshUsedData()
                } else {
                    this.refreshData(tab.name)
                }
            },
            //制单，获取暂存数据
            makeForm() {
                this.permVisible='valid';
                this.typeVisible='makeform'
                this.$api.tAviationnum.getStagingData().then(res => {
                    console.log(res)
                    if (res.code == 200) {
                        if(res.data!=null){
                            this.filters = res.data
                        }else{
                            // this.filters.chang=0
                            // this.filters.kuan=0
                            // this.filters.gao=0
                            // this.filters.grossweight=0
                            // this.filters.rate=0
                        }
                    } else {
                        this.$message.error("获取暂存数据失败！")
                    }
                    this.dialogVisible = true;
                })
            },
            // 更新已使用单号列表
            refreshUsedData() {
                const columnFilter={
                    keywords:{name:'keywords',value:this.keywords},
                    date1:{name:'date1',value:this.dateArray.length>0?this.dateArray[0]:''},
                    date2:{name:'date2',value:this.dateArray.length>0?this.dateArray[1]:''},
                }
                console.log(columnFilter)
                this.$api.tAviationnum.refreshUsedList({
                    columnFilters:columnFilter,
                    pageSize:this.usedPageSize,
                    pageNum:this.usedCurrentPage
                }).then(res => {
                    console.log(res)
                    if (res.code == 200) {
                        this.usedTable = res.data.content
                        this.usedTotal=res.data.totalSize
                    }
                })
            },
            // 更新作废单号列表或者未使用单号列表
            refreshData(val) {
                this.$api.tAviationnum.refreshList({
                    columnFilters:{type:{name:'type',value:val}},
                    pageSize:val=='invalid'?this.invalidPageSize:this.notUsedPageSize,
                    pageNum:val=='invalid'?this.invalidCurrentPage:this.notUsedCurrentPage
                }).then(res => {
                    console.log(res)
                    if (res.code == 200) {
                        if (val == 'invalid') {
                            this.invalidTable = res.data.content
                            this.invalidTotal=res.data.totalSize
                        } else {
                            this.notUsedTable = res.data.content
                            this.notUsedTotal=res.data.totalSize
                        }
                    }
                })
            },
            // 单号导入--提交
            submitSingleForm: function () {
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
                                    this.activeName='not_used'
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
            // 制单----提交、作废、暂存、下一票
            submitForm(formval, val, e) {
                this.filters.lastupdateby=user
                if(val=='staging'){
                    this.filters.delflag=-1;
                }else if(val == 'used'){
                    this.filters.delflag=1;
                }else{
                    this.filters.delflag=2
                }
                if (this.filters.aviationnum!=''&&this.filters.aviationnum!=null) {
                    this.$confirm('确认提交吗？', '提示', {}).then(() => {
                        let params = Object.assign({}, this.filters)
                        console.log(params)
                        this.$api.tAviationnum.savetAviation(params).then((res) => {
                            if (res.code == 200) {
                                this.$message({message: '操作成功', type: 'success'})
                                this.filters={
                                    chang:0,
                                    kuan:0,
                                    gao:0,
                                    grossweight:0,
                                    rate:0,
                                    otherallcharges:0
                                };
                                this.refreshUsedData()
                                this.refreshData("invalid")
                                this.refreshData("not_used")
                                this.getAviationnumOptions()
                                if (e != 'next') {
                                    this.dialogVisible = false
                                }
                            }  else {
                                this.$message({message: '操作失败, ' + res.msg, type: 'error'})
                            }
                        })
                    })
                }else{
                    this.$message.warning('请选择单号！')
                }
            },
            fileSuccess(res, file, fileList) {
                this.$message.success("文件上传成功");
                console.log(res)// todo
                this.activeName='not_used'
                this.refreshData('not_used')
            },
            fileError(err, file, fileList) {
                this.$message.error("文件上传失败");
            },
            // 导入
            fileChange(files, fileList) {
                console.log(files);
                this.fileList = [];
                this.fileList.push(files.raw);
                let file = new FormData();
                file.append("file", files.raw);
                // this.$server.apiPost("URL", file).then(res => {
                //   if (res) {
                //     this.$notify.success("导入成功。");
                //     this.pageInitialization = true;
                //     this.form.versionId = res;
                //     this.searchForm();
                //   } else {
                //     this.$notify.error("导入失败。");
                //   }
                // });
            },
            handleExceed(files, fileList) {
                this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${
                    files.length
                } 个文件，
            共选择了 ${files.length + fileList.length} 个文件`);
            },
            // 获取分页数据
            // findPage: function (data) {
            //     this.columns = this.columns1;
            //     if (data !== null) {
            //         this.pageRequest = data.pageRequest
            //     }
            //     this.pageRequest.columnFilters = {label: {name: 'label', value: this.filters.label}}
            //     this.$api.tAviationnum.refreshUsedList().then((res) => {
            //         this.pageResult = res.data
            //     }).then(data != null ? data.callback : '')
            // },

        },
        mounted() {
            this.refreshUsedData()
            this.getSendNameOptions()
            this.getAviationnumOptions()
            this.refreshData('invalid')
            this.refreshData('not_used')
        },
        computed:{
            tiji:{
                get(){
                    const that= (this.filters.chang * this.filters.kuan *this.filters.gao)
                    console.log(that)
                    this.filters.tiji=that
                    return that
                },
                set(value){
                    this.tiji=value
                }

            },
            chargeweight:function(){
                const that= Number(this.tiji/6*1000).toFixed(2)
                console.log(that)
                this.filters.chargeweight=that
                return that
            },
            weightcharge:function(){
                const weight= Number(this.chargeweight)>Number(this.filters.grossweight)?Number(this.chargeweight):Number(this.filters.grossweight)
                const that= Number(weight*this.filters.rate).toFixed(2)
                console.log(that)
                this.filters.weightcharge=that
                return that
            },
            total:function(){
                // const that=this.weightcharge+this.filters.otherallcharges
                const that=(Number(this.weightcharge)+ Number(this.filters.otherallcharges)).toFixed(2)
                console.log(that)
                this.filters.total=that
                return that
            },
        },
        watch:{

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

    /*/deep/ .el-tabs__nav {*/
    /*  border: 0 !important;*/
    /*}*/

    /*/deep/ .el-tabs__item {*/
    /*  color: #fff;*/
    /*  !*background-color: #118972;*!*/
    /*  background-color: #9adb7d;*/
    /*  border-top-right-radius: 20px;*/

    /*  &.is-active {*/
    /*    !*border-bottom-color: #118972;*!*/
    /*    border-bottom-color: #9adb7d;*/
    /*  }*/

    /*  &:nth-child(2) {*/
    /*    !*background-color: #af5921;*!*/
    /*    background-color: #f4857c;*/

    /*    &.is-active {*/
    /*      !*border-bottom-color: #af5921;*!*/
    /*      border-bottom-color: #f4857c;*/
    /*    }*/
    /*  }*/

    /*  &:nth-child(3) {*/
    /*    background-color: #8d9cb1;*/

    /*    &.is-active {*/
    /*      border-bottom-color: #8d9cb1;*/
    /*    }*/
    /*  }*/
    /*}*/
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
      font-size:13px;
      border:1px solid #DCDFE6;
      border-radius: 4px;
    }
    /*el-form-item__content{*/
    /*  display: inline-block;*/
    /*  background-color: #0088AA;*/
    /*  color: #fff;*/
    /*  width: 60px;*/
    /*  height: 30px;*/
    /*  line-height: 30px;*/
    /*  padding: 0 5px;*/
    /*  font-size:13px;*/
    /*  border:1px solid #DCDFE6;*/
    /*  border-radius: 4px;*/
    /*}*/
  }

  /*.el-descriptions__body >>> .el-form-item__label{*/
  /*  font-size:12px*/
  /*}*/
  #descr_Form >>> .el-form-item__label {
    font-size: 12px;
  }
  /*#descr_Form >>> .el-input {*/
  /*  width:40px*/
  /*}*/
  .prefixStyle{
    /*background-color: #0088AA;*/
    /*background-color: #3498db;*/
    color: #333333;
    width: 60px;
    padding: 0 5px;
  }

  .el_prefix {
    /*background-color: #0088AA;*/
    /*background-color: #3498db;*/
    color: #333333;
    width: 60px;
    padding: 0 5px;
    height:30px;
    line-height: 30px;
    margin:0px;
    font-size:13px;
    border:1px solid #DCDFE6;
    border-radius: 4px;
  }
  .pageStyle{
    margin:20px 0;
    text-align: right;
  }
</style>
