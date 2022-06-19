<template>
  <div>
    <div class="toolbar" style="float:left;padding-top:10px;">
      <el-form :inline="true" :size="size">
        <el-form-item>
          <el-input v-model="keywords" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')" perms="sys:role:view" type="primary"
                     @click="search"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-plus" :label="$t('action.add')" perms="sys:user:add" type="primary"
                     @click="addInfo"></kt-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table :data="tableData" :size="size" :cell-style="{padding:'3px 0'}"
              :header-cell-style="{background:'#EEEEEE',color:'#606266'}">
      <el-table-column type="index" :index="returnIndex" label="序号" width="80"></el-table-column>
      <el-table-column label="类型" prop="note">
        <template slot-scope="scope">
          <span v-if="scope.row.note=='1'">托运人</span>
          <span v-else-if="scope.row.note=='2'">航班</span>
          <span v-else>货物</span>
        </template>
      </el-table-column>
      <template v-for="item in headers">
        <el-table-column :label="item.label" :prop="item.prop">
        </el-table-column>
      </template>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text" :size="size" icon="el-icon-edit" @click="editInfo(scope.$index,scope.row)">编辑
          </el-button>
          <el-button type="text" :size="size" icon="el-icon-delete" @click="deleteInfo(scope.$index,scope.row)">删除
          </el-button>
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
        <el-form-item label="类型" prop="note">
          <el-select v-model="dataForm.note" style="width:100%" @change="changeType">
            <template v-for="item in noteOptions">
              <el-option :label="item.label" :key="item.value" :value="item.value"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="名称" prop="sendname">
          <el-select v-model="dataForm.sendname" style="width:100%">
            <template v-for="item in typeOptions">
              <el-option :label="item" :value="item"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="指数" prop="sendnameexp">
          <el-input v-model="dataForm.sendnameexp"></el-input>
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
                    {label: '名称', prop: 'sendname'},
                    {label: '指数', prop: 'sendnameexp'}
                ],
                currentPage: 1,
                pageSize: 10,
                total: 0,
                formHeaders: [
                    // {label: '名称', prop: 'sendname'},
                    {label: '指数', prop: 'sendnameexp'}
                ],
                dialogVisible: false,
                dialogTitle: '',
                dataForm: {},
                dataFormRules: {
                    note: [{required: true, message: "请选择类型", trigger: 'blur'}],
                    sendname: [{required: true, message: "请输入名称", trigger: 'blur'}],
                    sendnameexp: [{required: true, message: "请输入指数", trigger: 'blur'}]
                },
                noteOptions: [
                    {label: '托运人', value: '1'},
                    {label: '航班', value: '2'},
                    {label: '货物', value: '3'}
                ],
                typeOptions:[],
                sendNameOptions:[]
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
            addInfo() {// todo
                this.dataForm={}
                this.dialogTitle = '新增'
                this.dialogVisible = true
            },
            editInfo(index, row) {
                this.changeType(row.note)
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
            // close(val) {
            //     this.dialogVisible = false
            //     if (this.dialogTitle == "新增") {
            //         this.$refs[val].resetFields()
            //     }
            // },
            submit(val) {
                if (this.dialogTitle == '新增') {
                    this.dataForm.createby = user
                } else {
                    this.dataForm.lastupdateby = user
                }
                this.$refs[val].validate((valid) => {
                    const that = this
                    if (valid) {
                        this.$api.ratio.submitInfos(this.dataForm).then(res => {
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
            changeType(val){// todo
                console.log(val)
                if(val==1){
                    this.getSendNameOptions()
                }else {
                    this.typeOptions=['早班','晚班']
                }
            },
            getSendNameOptions() {
                this.$api.send.getInfos({
                    columnFilters: {keywords: {name: 'keywords', value: ''}},
                    pageSize: 0,
                    pageNum: 0
                }).then(res => {
                    console.log(res)
                    if (res.code == 200) {
                        this.typeOptions=[]
                        for(var i=0;i<res.data.content.length;i++){
                            this.typeOptions.push(res.data.content[i].sendname)
                        }
                    }
                })
            },
            getGoodTypeOptions() {// todo
                this.$api.goods.getInfos({
                    columnFilters: {keywords: {name: 'keywords', value: ''}},
                    pageSize: 0,
                    pageNum: 0
                }).then(res => {
                    console.log(res)
                    if (res.code == 200) {
                        this.goodTypeOptions = res.data.content
                    }
                })
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
