<template>
  <div>
    <div class="toolbar" style="float:left;padding-top:10px;">
      <el-form :inline="true" :size="size">
        <el-form-item>
          <el-input v-model="keywords" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')" perms="data:ratio:search" type="primary"
                     @click="search"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-plus" :label="$t('action.add')" perms="data:ratio:add" type="primary"
                     @click="addInfo"></kt-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table :data="tableData" :size="size" :cell-style="{padding:'3px 0'}"
              :header-cell-style="{background:'#EEEEEE',color:'#606266'}">
      <el-table-column type="index" :index="returnIndex" label="序号" width="80"></el-table-column>
      <template v-for="item in headers">
        <el-table-column :label="item.label" :prop="item.prop">
        </el-table-column>
      </template>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <kt-button type="text" :size="size" icon="el-icon-edit" @click="editInfo(scope.$index,scope.row)"
                     :label="$t('action.edit')" perms="data:ratio:edit">
          </kt-button>
          <kt-button type="text" :size="size" icon="el-icon-delete" @click="deleteInfo(scope.$index,scope.row)"
                     :label="$t('action.delete')" perms="data:ratio:delete">
          </kt-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pageStyle">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 30]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next"
        :total="total">
      </el-pagination>
    </div>
    <el-dialog :visible.sync="dialogVisible" :title="dialogTitle" width="30%" class="dialogStyle">
      <el-form :model="dataForm" ref="dataForm" :rules="dataFormRules" label-width="100px" :size="size">
        <el-form-item label="航空公司" prop="station">
          <el-select v-model="dataForm.station" style="width:100%" @change="changeFlightCompany">
            <template v-for="item in flightCompanyOptions">
              <el-option :label="item.label" :key="item.value" :value="item.value"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="目的站" prop="destination">
          <el-select v-model="dataForm.destination" style="width:100%" @change="changeDestination">
            <template v-for="item in destinationOptions">
              <el-option :label="item.destination" :value="item.destination"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="航班号" prop="flightNumArray">
          <el-select v-model="dataForm.flightNumArray" style="width:100%" multiple>
            <template v-for="item in flightNumOptions">
              <el-option :label="item.flightNum" :value="item.flightNum"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="托运人" prop="sendNameArray">
          <el-select v-model="dataForm.sendNameArray" style="width:100%" multiple>
            <template v-for="item in sendNameOptions">
              <el-option :label="item.sendname" :value="item.sendname"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="货物类型" prop="rateclass">
          <el-select v-model="dataForm.rateclass" style="width:100%" @change="changeRateClass">
            <template v-for="item in goodTypeOptions">
              <el-option :label="item.goodtype" :value="item.goodtype"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="费率" prop="ratio">
          <el-input v-model="dataForm.ratio"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="dialogVisible=false">{{$t('action.cancel')}}</el-button>
        <el-button :size="size" type="primary" @click.native="submit('dataForm')">{{$t('action.submit')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
    import KtButton from '@/views/Core/KtButton'
    import Cookies from "js-cookie"

    let tokens = Cookies.get('token')
    let user = Cookies.get('user')
    export default {
        components: {
            KtButton
        },
        data() {
            return {
                size: 'small',
                keywords: '',
                tableData: [],
                headers: [
                    {label: '航空公司', prop: 'station'},
                    {label: '目的站', prop: 'destination'},
                    {label: '航班号', prop: 'flightnum'},
                    {label: '托运人', prop: 'sendname'},
                    {label: '货物类型', prop: 'rateclass'},
                    {label: '费率', prop: 'ratio'}
                ],
                currentPage: 1,
                pageSize: 10,
                total: 0,
                dialogVisible: false,
                dialogTitle: '',
                dataForm: {
                    station:'',
                    destination:'',
                    flightnum:'',
                    flightNumArray:[],
                    sendname:'',
                    sendNameArray:[],
                    rateclass:'',
                    ratio:''
                },
                dataFormRules: {
                    station: [{required: true, message: "请选择航空公司", trigger: 'blur'}],
                    destination: [{required: true, message: "请选择目的站", trigger: 'blur'}],
                    flightNumArray: [{required: true, message: "请选择航班号", trigger: 'blur'}],
                    sendNameArray: [{required: true, message: "请选择托运人", trigger: 'blur'}],
                    rateclass: [{required: true, message: "请选择货物类型", trigger: 'blur'}],
                    ratio: [{required: true, message: "请输入费率", trigger: 'blur'}]
                },
                flightCompanyOptions: [
                    {label: '东航', value: '东航'},
                    {label: '南航', value: '南航'}
                ],
                sendNameOptions:[],// 托运人列表
                destinationOptions:[],//目的站列表
                flightNumOptions:[],//航班号列表
                goodTypeOptions:[]// 货物类型列表
            }
        },
        mounted() {
            this.returnList()
        },
        methods: {
            returnList() {
                const columnFilter = {
                    keywords: {name: 'keywords', value: this.keywords},
                }
                this.$api.ratio.getInfos({
                    columnFilters: columnFilter,
                    pageSize: this.pageSize,
                    pageNum: this.currentPage
                }).then(res => {
                    console.log(res)
                    if (res.code == 200) {
                        this.tableData = res.data.content
                        this.total = res.data.totalSize
                    }
                })
            },
            search() {
                this.currentPage = 1;
                this.returnList()
            },
            handleSizeChange(val) {
                this.pageSize = val;
                this.returnList()
            },
            handleCurrentChange(val) {
                this.currentPage = val;
                this.returnList()
            },
            returnIndex(val) {
                return (this.currentPage - 1) * this.pageSize + val + 1
            },
            addInfo() {
                this.getSendNameOptions()
                this.dialogTitle = '新增'
                this.dialogVisible = true
            },
            editInfo(index, row) {
                this.getSendNameOptions()
                row.flightNumArray=row.flightnum.split(',')
                row.sendNameArray=row.sendname.split(',')
                this.dataForm = Object.assign({},row)
                this.dialogTitle = '编辑'
                this.dialogVisible = true
            },
            deleteInfo(index, row) {
                this.$confirm('确认删除吗？删除后不可恢复！', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: "取消",
                    type: 'warning'
                }).then(() => {
                    this.$api.ratio.deleteInfos([{
                        id: row.id
                    }]).then(res => {
                        if (res.code == 200) {
                            this.$message.success("删除成功！")
                            this.returnList()
                        }
                    })
                })
            },
            submit(val) {
                if (this.dialogTitle == '新增') {
                    this.dataForm.createby = user
                } else {
                    this.dataForm.lastupdateby = user
                }
                this.dataForm.flightnum=this.dataForm.flightNumArray.join(',')
                this.dataForm.sendname=this.dataForm.sendNameArray.join(',')
                console.log(this.dataForm)
                this.$refs[val].validate((valid) => {
                    const that = this
                    if (valid) {
                        this.$api.ratio.submitInfos(this.dataForm).then(res => {
                            if (res.code == 200) {
                                that.$message.success("提交成功！")
                                that.returnList()
                                that.$refs[val].resetFields()
                                that.dialogVisible = false
                            }
                        })
                    }
                })
            },
            getSendNameOptions() {
                this.sendNameOptions=[]
                this.$api.send.getInfos({
                    columnFilters: {keywords: {name: 'keywords', value: ''}},
                    pageSize: 0,
                    pageNum: 0
                }).then(res => {
                    console.log(res)
                    if (res.code == 200) {
                        this.sendNameOptions=[]
                            this.sendNameOptions=res.data.content
                    }
                })
            },
            changeFlightCompany(val){// 改变航空公司获取目的站列表和货物类型列表
                this.flightNumOptions=[]
                this.dataForm.flightNumArray=[]
                this.dataForm.destination=''
                this.dataForm.rateclass=''
                this.goodTypeOptions=[]
                console.log(val)
                this.$api.flight.returnStationList({
                    flightName:val,
                    executiontNum:null
                }).then(res=>{
                    console.log(res)
                    if(res.code==200){
                        this.destinationOptions=res.data
                    }
                })
                this.$api.goods.searchGoods({
                    airFight:val
                }).then(res => {
                    console.log(res)
                    if (res.code == 200) {
                        this.goodTypeOptions = res.data
                    }
                })
            },
            changeDestination(val){// 改变目的站获取航班号列表
                this.dataForm.flightNumArray=[]
                console.log(val)
                this.$api.flight.returnStationList({
                    flightName:this.dataForm.station,
                    executiontNum:val
                }).then(res=>{
                    console.log(res)
                    if(res.code==200){
                        this.flightNumOptions=res.data
                    }
                })
            },
            changeRateClass(val){
                console.log(val)
            }

        }
    }
</script>
<style scoped>
  .toolbar {
    display: flex;
    justify-content: flex-start;
  }

  .pageStyle {
    margin: 20px 0;
    text-align: right;
  }

  .dialogStyle /deep/ .el-dialog__body {
    padding: 20px 50px 20px 30px
  }
</style>
