<template>
  <div>
    <div class="toolbar" style="float:left;padding-top:10px;">
      <el-form :inline="true" :size="size">
        <el-form-item>
          <el-input v-model="keywords" placeholder="航班号"></el-input>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')" perms="data:flight:search" type="primary"
                     @click="search"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-plus" :label="$t('action.add')" perms="data:flight:add" type="primary"
                     @click="addInfo"></kt-button>
        </el-form-item>
        <el-form-item>
          <el-upload accept=".xls, .xlsx"
                     action='http://39.105.37.45:8001/flight/importExcel'
                     :headers="uploadHeaders"
                     :file-list="fileList"
                     :on-success="fileSuccess"
                     :on-error="fileError"
                     :show-file-list="false" >
            <kt-button icon="fa fa-cloud-upload" label="批量导入" perms="data:flight:upload" type="primary"></kt-button>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-download" label="下载模板" perms="data:flight:download" type="text"
                     @click="downloadTemplate"></kt-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table :data="tableData" :size="size" :cell-style="{padding:'3px 0'}" max-height="480"
              :header-cell-style="{background:'#EEEEEE',color:'#606266'}" v-loading="tableLoading" :element-loading-text="$t('action.loading')">
      <el-table-column type="index" :index="returnIndex" label="序号" width="60"></el-table-column>
      <template v-for="item in headers">
        <el-table-column :label="item.label" :prop="item.prop" :min-width="item.minwidth" show-overflow-tooltip>
        </el-table-column>
      </template>
      <el-table-column label="操作" width="150px">
        <template slot-scope="scope">
          <kt-button type="text" :size="size" icon="el-icon-edit" @click="editInfo(scope.$index,scope.row)" perms="data:flight:edit" :label="$t('action.edit')">
          </kt-button>
          <kt-button type="text" :size="size" icon="el-icon-delete" @click="deleteInfo(scope.$index,scope.row)" perms="data:flight:delete" :label="$t('action.delete')">
          </kt-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pageStyle">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10,20,30,50,100,200]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next"
        :total="total">
      </el-pagination>
    </div>
    <el-dialog :visible.sync="dialogVisible" :title="dialogTitle" width="30%" class="dialogStyle">
      <el-form :model="dataForm" ref="dataForm" :rules="dataFormRules" label-width="110px" :size="size">
        <template v-for="item in formHeaders">
          <el-form-item :label="item.label" :prop="item.prop">
            <el-input v-model="dataForm[item.prop]"></el-input>
          </el-form-item>
        </template>
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
    let user = Cookies.get('user')
    export default {
        components: {
            KtButton
        },
        data() {
            return {
                tableLoading:false,
                size: 'small',
                keywords: '',
                tableData: [],
                headers: [
                    {label: '始发站', prop: 'startstation'},
                    {label: '始发站缩写', prop: 'startstationabb'},
                    {label: '目的站', prop: 'destination'},
                    {label: '目的站缩写', prop: 'destinationabb'},
                    {label: '航班号', prop: 'flightnum'},
                    {label: '起飞时间', prop: 'starttime'},
                    {label: '到达时间', prop: 'arrivetime'},
                    {label: '班期', prop: 'flightdate'},
                    {label: '执行起始时间', prop: 'executestarttime',minwidth:'100px'},
                    {label: '执行结束时间', prop: 'executeovertime',minwidth:'100px'}
                ],
                currentPage: 1,
                pageSize: 10,
                total: 0,
                formHeaders: [
                    {label: '始发站', prop: 'startstation'},
                    {label: '始发站缩写', prop: 'startstationabb'},
                    {label: '目的站', prop: 'destination'},
                    {label: '目的站缩写', prop: 'destinationabb'},
                    {label: '航班号', prop: 'flightnum'},
                    {label: '起飞时间', prop: 'starttime'},
                    {label: '到达时间', prop: 'arrivetime'},
                    {label: '班期', prop: 'flightdate'},
                    {label: '执行起始时间', prop: 'executestarttime'},
                    {label: '执行结束时间', prop: 'executeovertime'}
                ],
                dialogVisible: false,
                dialogTitle: '',
                dataForm: {
                    startstation: '',
                    startstationabb: "",
                    destination: '',
                    destinationabb: '',
                    flightnum: '',
                    starttime: '',
                    arrivetime: '',
                    flightdate: '',
                    executestarttime: '',
                    executeovertime: ''
                },
                dataFormRules: {
                    startstation: [{required:true,message:"请输入始发站",trigger:'blur'}],
                    startstationabb: [{required:true,message:"请输入始发站缩写",trigger:'blur'}],
                    destination: [{required:true,message:"请输入目的站",trigger:'blur'}],
                    destinationabb: [{required:true,message:"请输入目的站缩写",trigger:'blur'}],
                    flightnum: [{required:true,message:"请输入航班号",trigger:'blur'}],
                    starttime: [{required:true,message:"请输入起飞时间",trigger:'blur'}],
                    arrivetime: [{required:true,message:"请输入到达时间",trigger:'blur'}],
                    flightdate: [{required:true,message:"请输入班期",trigger:'blur'}],
                    executestarttime: [{required:true,message:"请输入执行起始时间",trigger:'blur'}],
                    executeovertime: [{required:true,message:"请输入执行结束时间",trigger:'blur'}]
                },
                uploadHeaders: {token: Cookies.get('token')},
                fileList: []
            }
        },
        mounted() {
            this.returnList()
        },
        methods: {
            returnList() {
                this.tableLoading=true
                const columnFilter={
                    keywords:{name:'keywords',value:this.keywords},
                }
                this.$api.flight.getInfos({
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
                this.dialogTitle = '新增'
                this.dialogVisible = true
            },
            editInfo(index, row) {
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
                    this.$api.flight.deleteInfos([{
                        id: row.id
                    }]).then(res => {
                        if (res.code == 200) {
                            this.$message.success("删除成功！")
                            this.returnList()
                        }
                    })
                })
            },
            close(val) {
                this.dialogVisible = false
                if (this.dialogTitle == "新增") {
                    this.$refs[val].resetFields()
                }
            },
            submit(val) {
                if (this.dialogTitle == '新增') {
                    this.dataForm.createby = user
                } else {
                    this.dataForm.lastupdateby = user
                }
                this.$refs[val].validate((valid) => {
                    const that = this
                    if (valid) {
                        this.$api.flight.submitInfos(this.dataForm).then(res => {
                            if (res.code == 200) {
                                that.dialogVisible = false
                                that.$message.success("提交成功！")
                                that.returnList()
                                this.$refs[val].resetFields()
                            }
                        })
                    }
                })
            },
            downloadTemplate(){
                const url=`http://39.105.37.45:8001/flight/download?token=${this.uploadHeaders.token}`
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

  .pageStyle {
    margin: 20px 0;
    text-align: right;
  }
  .dialogStyle /deep/ .el-dialog__body {
    padding: 20px 50px 20px 30px
  }
</style>
