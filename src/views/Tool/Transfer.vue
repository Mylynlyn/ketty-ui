<template>
  <div>
    <div class="toolbar" style="float:left;padding-top:10px;">
      <el-form :inline="true"  :size="size">
        <el-form-item>
          <el-input v-model="keywords" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-search" :label="$t('action.search')" perms="data:transfer:search" type="primary" @click="search"/>
        </el-form-item>
        <el-form-item>
          <kt-button icon="fa fa-plus" :label="$t('action.add')" perms="data:transfer:add" type="primary" @click="addInfo"></kt-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table :data="tableData" :size="size" :cell-style="{padding:'3px 0'}" :header-cell-style="{background:'#EEEEEE',color:'#606266'}">
      <el-table-column type="index" :index="returnIndex" label="序号" width="80"></el-table-column>
      <template v-for="item in headers">
        <el-table-column :label="item.label" :prop="item.prop" show-overflow-tooltip>
        </el-table-column>
      </template>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <kt-button type="text" :size="size" icon="el-icon-edit" @click="editInfo(scope.$index,scope.row)"
                     perms="data:transfer:edit" :label="$t('action.edit')"></kt-button>
          <kt-button type="text" :size="size" icon="el-icon-delete" @click="deleteInfo(scope.$index,scope.row)"
                     perms="data:transfer:delete" :label="$t('action.delete')"></kt-button>
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
        <template v-for="item in formHeaders">
          <el-form-item :label="item.label" :prop="item.prop">
            <el-input v-model="dataForm[item.prop]"></el-input>
          </el-form-item>
        </template>
        <el-form-item label="站点类型" prop="noteArr">
          <el-select v-model="dataForm.noteArr" multiple placeholder="请选择" style="width:100%">
          <template v-for="item in typeOptions">
          <el-option :label="item.label" :value="item.label"></el-option>
        </template>
          </el-select>
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
                size:'small',
                keywords:'',
                tableData:[],
                headers:[
                    {label:'站点名称',prop:'stationname'},
                    {label:'站点缩写',prop:'stationnameabb'},
                    {label:'站点类型',prop:'note'}
                ],
                currentPage:1,
                pageSize:10,
                total:0,
                formHeaders:[
                    {label:'站点名称',prop:'stationname'},
                    {label:'站点缩写',prop:'stationnameabb'}
                ],

                dialogVisible:false,
                dialogTitle:'',
                dataForm:{
                    stationname:'',
                    stationnameabb:'',
                    noteArr:[],
                    note:''
                },
                dataFormRules:{
                    stationname:[{required:true,message:'请输入站点名称',trigger:'blur'}],
                    stationnameabb:[{required:true,message:'请输入站点缩写',trigger:'blur'}],
                   noteArr:[{required:true,message:'选择站点类型',trigger:'blur'}]
                },
                typeOptions:[
                    {label:'始发站'},
                    {label:'目的站'},
                    {label:'中转站'}
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
                this.$api.transfer.getInfos({
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
                row.noteArr=row.note.split(',')
                this.dataForm = Object.assign({}, row)
                console.log(this.dataForm)
                this.dialogTitle='编辑'
                this.dialogVisible=true
            },
            deleteInfo(index,row){
                this.$confirm('确认删除吗？删除后不可恢复！','提示',{
                    confirmButtonText:'确定',
                    cancelButtonText:"取消",
                    type:'warning'
                }).then(()=>{
                    this.$api.transfer.deleteInfos([{
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
                this.dataForm.note=this.dataForm.noteArr.join(',')
                this.$refs[val].validate((valid)=>{
                    const that = this
                    if(valid){
                        this.$api.transfer.submitInfos(this.dataForm).then(res=>{
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
            returnStationType(val){
                var arr= val.split(',');
                return arr
               //   const arrLable=[];
               //  var label=''
               // for(var i=0;i<arr.length;i++){
               //     for(var j=0;j<this.typeOptions.length;j++){
               //         if(arr[i]==this.typeOptions[j].value){
               //             arrLable.push(this.typeOptions[j].label)
               //         }
               //     }
               // }
               // label=arrLable.join(',')
               //  return label
               //  console.log(label)
            },
            returnNoteString(index,row){
                let notes=''
                if(row.note!=null){
                   notes=row.note.join(',')
                }
                return notes
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
