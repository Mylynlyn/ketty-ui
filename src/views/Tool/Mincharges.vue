<template>
  <div>
    <div class="toolbar" style="float:left;padding-top:10px;">
      <el-form :inline="true"  :size="size">
        <el-form-item>
          <el-input v-model="keywords" placeholder="航班"></el-input>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')" perms="data:mincharges:search" type="primary" @click="search"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-plus" :label="$t('action.add')" perms="data:mincharges:add" type="primary" @click="addInfo"></kt-button>
        </el-form-item>
        <el-form-item>
          <el-upload accept=".xls, .xlsx"
                     action='http://39.105.37.45:8001/tLowcost/importExcel'
                     :headers="uploadHeaders"
                     :file-list="fileList"
                     :on-success="fileSuccess"
                     :on-error="fileError"
                     :show-file-list="false" >
            <kt-button icon="fa fa-cloud-upload" label="批量导入" perms="data:mincharges:upload" type="primary"></kt-button>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-download" label="下载模板" perms="data:mincharges:download" type="text"
                     @click="downloadTemplate"></kt-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table :data="tableData" :size="size" :cell-style="{padding:'3px 0'}"
              :header-cell-style="{background:'#EEEEEE',color:'#606266'}" max-height="480"
              v-loading="tableLoading" :element-loading-text="$t('action.loading')">
      <el-table-column type="index" :index="returnIndex" label="序号" width="80"></el-table-column>
      <template v-for="item in headers">
        <el-table-column :label="item.label" :prop="item.prop" show-overflow-tooltip>
        </el-table-column>
      </template>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <kt-button type="text" :size="size" icon="el-icon-edit" @click="editInfo(scope.$index,scope.row)"
                     perms="data:mincharges:edit" :label="$t('action.edit')"></kt-button>
          <kt-button type="text" :size="size" icon="el-icon-delete" @click="deleteInfo(scope.$index,scope.row)"
                     perms="data:mincharges:delete" :label="$t('action.delete')"></kt-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pageStyle">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next"
        :total="total">
      </el-pagination>
    </div>
    <el-dialog :visible.sync="dialogVisible" :title="dialogTitle" width="30%" class="dialogStyle">
      <el-form :model="dataForm" ref="dataForm" :rules="dataFormRules" label-width="100px" :size="size">
        <el-form-item label="目的站" prop="destinationstation">
          <el-select v-model="dataForm.destinationstation" placeholder="请选择" style="width:100%" @change="changeDestination">
            <template v-for="item in destinationOptions">
              <el-option :label="item.stationName" :value="item.stationName"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="航空公司" prop="flightcompany">
          <el-select v-model="dataForm.flightcompany" placeholder="请选择" style="width:100%" @change="changeFlightCompany">
            <template v-for="item in flightCompanyOptions">
              <el-option :label="item.label" :value="item.label"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="航班" prop="flight">
          <el-select v-model="dataForm.flight" placeholder="请选择" style="width:100%" @change="changeFlight">
            <template v-for="item in flightOptions">
              <el-option :label="item.flightNum" :value="item.flightNum"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="货品" prop="rateclass">
          <el-select v-model="dataForm.rateclass" placeholder="请选择" style="width:100%" @change="changeGoodtype">
            <template v-for="item in goodtypeOptions">
              <el-option :label="item.goodtype" :value="item.goodtype"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="最低收费值" prop="mincharge">
          <el-input v-model="dataForm.mincharge">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :size="size" @click.native="close('dataForm')">{{$t('action.cancel')}}</el-button>
        <el-button :size="size" type="primary" @click.native="submit('dataForm')">{{$t('action.submit')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
    import KtButton from '@/views/Core/KtButton'
    import Cookies from "js-cookie"
    let tokens = Cookies.get('token')
    let user=Cookies.get('user')
    export default {
        components:{
            KtButton
        },
        data(){
            return {
                tableLoading:false,
                size:'small',
                keywords:'',
                tableData:[],
                headers:[
                    {label:'目的站',prop:'destinationstation'},
                    {label:'航空公司',prop:'flightcompany'},
                    {label:'航班',prop:'flight'},
                    {label:'货品',prop:'rateclass'},
                    {label:'最低收费值',prop:'mincharge'}
                ],
                currentPage:1,
                pageSize:10,
                total:0,
                dialogVisible:false,
                dialogTitle:'',
                dataForm:{
                    stationname:'',
                    stationnameabb:'',
                    noteArr:[],
                    note:''
                },
                dataFormRules:{
                    destinationstation:[{required:true,message:'请输入站点名称',trigger:'blur'}],
                    flightcompany:[{required:true,message:'请选择航空公司',trigger:'blur'}],
                    flight:[{required:true,message:'请选择航班',trigger:'blur'}],
                    rateclass:[{required:true,message:'请选择货品',trigger:'blur'}],
                    mincharge:[{required:true,message:'请输入最低收费值',trigger:'blur'}]
                },
                uploadHeaders: {token: Cookies.get('token')},
                fileList: [],
                destinationOptions:[],
                flightCompanyOptions:[
                    {label:'东航'},
                    {label:'南航'}
                ],
                flightOptions:[],
                goodtypeOptions:[],
            }
        },
        mounted(){
            this.returnList()
        },
        methods:{
            returnList(){
                this.tableLoading=true
                const columnFilter={
                    keywords:{name:'keywords',value:this.keywords},
                }
                this.$api.mincharges.getInfos({
                    columnFilters:columnFilter,
                    pageSize:this.pageSize,
                    pageNum:this.currentPage
                }).then(res=>{
                    console.log(res)
                    if(res.code==200){
                        this.tableData=res.data.content
                        this.total=res.data.totalSize
                        this.tableLoading=false
                    }
                })
            },
            search(){
                this.currentPage=1;
                this.returnList()
            },
            handleSizeChange(val){
                this.pageSize=val;
                this.returnList()
            },
            handleCurrentChange(val){
                this.currentPage=val;
                this.returnList()
            },
            returnIndex(val){
                return (this.currentPage-1)*this.pageSize+val+1
            },
            addInfo(){
                this.getDestinationOptions()
                this.dialogTitle='新增'
                this.dialogVisible=true
            },
            editInfo(index,row){
                this.dataForm = Object.assign({}, row)
                this.getDestinationOptions()
                this.getGoodtypeOptions()
                this.getFlightOptions()
                this.dialogTitle='编辑'
                this.dialogVisible=true
            },
            deleteInfo(index,row){
                this.$confirm('确认删除吗？删除后不可恢复！','提示',{
                    confirmButtonText:'确定',
                    cancelButtonText:"取消",
                    type:'warning'
                }).then(()=>{
                    this.$api.mincharges.deleteInfos([{
                        id:row.id
                    }]).then(res=>{
                        if(res.code==200){
                            this.$message.success("删除成功！")
                            this.returnList()
                        }
                    })
                })
            },
            close(val){
                this.dialogVisible=false
                if(this.dialogTitle=="新增"){
                    this.$refs[val].resetFields()
                }
            },
            submit(val){
                if(this.dialogTitle=='新增'){
                    this.dataForm.createby=user
                }else{
                    this.dataForm.lastupdateby=user
                }
                this.$refs[val].validate((valid)=>{
                    const that = this
                    if(valid){
                        this.$api.mincharges.submitInfos(this.dataForm).then(res=>{
                            if(res.code==200){
                                that.dialogVisible=false
                                that.$message.success("提交成功！")
                                that.returnList()
                                this.$refs[val].resetFields()
                            }
                        })
                    }
                })
            },
            getDestinationOptions(){
                this.$api.transfer.searchInfos({
                    note: '目的站'
                }).then(res => {
                    console.log(res)
                    if (res.status == 200) {
                        this.destinationOptions = res.data
                    }
                })
            },
            changeFlightCompany(){
                this.dataForm.rateclass=''
                this.dataForm.flight=''
                this.getFlightOptions()
                this.getGoodtypeOptions()
            },
            getGoodtypeOptions(){
                this.$api.goods.searchGoods({
                    airFight: this.dataForm.flightcompany
                }).then(res => {
                    console.log(res)
                    if (res.status == 200) {
                        this.goodtypeOptions = res.data
                    }
                })
            },
            changeGoodtype(val){
                this.$forceUpdate()
            },
            changeFlight(val){
                this.$forceUpdate()
            },
            getFlightOptions(){
                if(this.dataForm.destinationstation!=undefined &&this.dataForm.destinationstation!=""
                    &&this.dataForm.flightcompany!=undefined &&this.dataForm.flightcompany!="" ){
                    this.$api.flight.returnDestinationList({
                        flightName:this.dataForm.flightcompany,
                        destination:this.dataForm.destinationstation
                    }).then(res=>{
                        console.log(res)
                        if(res.status=='200'){
                            this.flightOptions=res.data
                        }
                    })
                }
            },
            changeDestination(){
                this.dataForm.flight=''
                this.getFlightOptions()
            },
            downloadTemplate(){
                const url=`http://39.105.37.45:8001/tLowcost/download?token=${this.uploadHeaders.token}`
                window.location.href=url
            },
            fileSuccess(res, file, fileList) {
                this.$message.success("文件上传成功")
                this.returnList()
            },
            fileError(err, file, fileList) {
                this.$message.error("文件上传失败");
            }
        }
    }
</script>
<style scoped>
  .toolbar {
    display: flex;
    justify-content: flex-start;
  }
  .pageStyle{
    margin:20px 0;
    text-align: right;
  }
  .dialogStyle /deep/ .el-dialog__body {
    padding: 20px 50px 20px 30px
  }
</style>
