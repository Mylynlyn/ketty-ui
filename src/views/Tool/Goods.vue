<template>
  <div>
    <div class="toolbar" style="float:left;padding-top:10px;">
      <el-form :inline="true"  :size="size">
        <el-form-item>
          <el-input v-model="keywords" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')" perms="data:good:search" type="primary" @click="search"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-plus" :label="$t('action.add')" perms="data:good:add" type="primary" @click="addInfo"></kt-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table :data="tableData" :size="size" :cell-style="{padding:'3px 0'}" :header-cell-style="{background:'#EEEEEE',color:'#606266'}">
      <el-table-column type="index" :index="returnIndex" label="序号" width="80"></el-table-column>
      <template v-for="item in headers">
        <el-table-column :label="item.label" :prop="item.prop">
        </el-table-column>
      </template>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <kt-button type="text" :size="size" icon="el-icon-edit" @click="editInfo(scope.$index,scope.row)"
                     :label="$t('action.edit')" perms="data:good:edit" ></kt-button>
          <kt-button type="text" :size="size" icon="el-icon-delete" @click="deleteInfo(scope.$index,scope.row)"
                     :label="$t('action.delete')" perms="data:good:delete" ></kt-button>
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
      <el-form :model="dataForm" ref="dataForm" :rules="dataFormRules" label-width="80px" :size="size">
        <el-form-item label="航班" prop="airfight">
          <el-select v-model="dataForm.airfight" style="width:100%">
            <template v-for="item in airflightCompanyOptions">
              <el-option :label="item.label" :value="item.label"></el-option>
            </template>
          </el-select>
        </el-form-item>
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
    let user=Cookies.get('user')
    export default {
        components:{
            KtButton
        },
        data(){
            return {
                size:'small',
                keywords:'',
                tableData:[],
                headers:[
                    {label:'航班',prop:'airfight'},
                    {label:'商品种类',prop:'goodtype'},
                    {label:'商品代码',prop:'goodnum'}
                ],
                currentPage:1,
                pageSize:10,
                total:0,
                formHeaders:[
                    // {label:'航班',prop:'airfight'},
                    {label:'商品种类',prop:'goodtype'},
                    {label:'商品代码',prop:'goodnum'}
                ],
                dialogVisible:false,
                dialogTitle:'',
                dataForm:{
                    receivename:'',
                    receivetel:'',
                    receiveadr:''
                },
                dataFormRules:{
                    airfight:[{required:true,message:"请输入航班",trigger:'blur'}],
                    goodtype:[{required:true,message:"请输入商品种类",trigger:'blur'}],
                    goodnum:[{required:true,message:"请输入商品代码",trigger:'blur'}]
                },
                airflightCompanyOptions:[
                    {label:'东航'},
                    {label:'南航'}
                ]
            }
        },
        mounted(){
            this.returnList()
        },
        methods:{
            returnList(){
                const columnFilter={
                    keywords:{name:'keywords',value:this.keywords},
                }
                this.$api.goods.getInfos({
                    columnFilters:columnFilter,
                    pageSize:this.pageSize,
                    pageNum:this.currentPage
                }).then(res=>{
                    console.log(res)
                    if(res.code==200){
                        this.tableData=res.data.content
                        this.total=res.data.totalSize
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
                this.dialogTitle='新增'
                this.dialogVisible=true
            },
            editInfo(index,row){
                this.dataForm = Object.assign({},row)
                this.dialogTitle='编辑'
                this.dialogVisible=true
            },
            deleteInfo(index,row){
                this.$confirm('确认删除吗？删除后不可恢复！','提示',{
                    confirmButtonText:'确定',
                    cancelButtonText:"取消",
                    type:'warning'
                }).then(()=>{
                    this.$api.goods.deleteInfos([{
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
                        this.$api.goods.submitInfos(this.dataForm).then(res=>{
                            if(res.code==200){
                                that.dialogVisible=false
                                that.$message.success("提交成功！")
                                that.returnList()
                                this.$refs[val].resetFields()
                            }
                        })
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
  .pageStyle{
    margin:20px 0;
    text-align: right;
  }
  .dialogStyle /deep/ .el-dialog__body {
    padding: 20px 50px 20px 30px
  }
</style>
