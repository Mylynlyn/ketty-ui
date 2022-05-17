<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar">
      <el-form :inline="true" :model="filters" ref = "filters" size="small">
        <el-form-item>
          <el-input v-model="filters.aviationnum" placeholder="Search">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-form-item>
          <el-form-item>
            <el-date-picker
            v-model="value2"
              type="datetimerange"
              :picker-options="pickerOptions"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              >
            </el-date-picker>
        </el-form-item>
        <!-- <el-form-item>
          <kt-button  label="单号导入" perms="sys:role:view"  type="primary" @click="findPage(null)"/>
        </el-form-item>
        <el-form-item>
          <kt-button  label="批量导入" perms="sys:role:view"  type="primary" @click="handleAdd" />
        </el-form-item>
        <el-form-item>
          <kt-button  label="制单" perms="sys:role:view" type="success" @click='showDialog=true'/>
        </el-form-item> -->
      </el-form>
    </div>
    <div class="tabs">
        <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
        <el-tab-pane label="已用单号(10)" name="first"></el-tab-pane>
        <el-tab-pane label="作废订单(3)" name="second"></el-tab-pane>
        <el-tab-pane label="未使用单号(3)" name="third"></el-tab-pane>
      </el-tabs>
      <div class="btn">
        <kt-button  label="单号导入" perms="sys:role:view"  type="primary" @click="showSingleDialog=true"/>
        <!-- <kt-button  label="批量导入" perms="sys:role:view"  type="primary" @click="handleAdd" /> -->
        <!-- :before-upload="beforeUploadFile" -->
        <el-upload
          accept=".xls, .xlsx"
          action="https://jsonplaceholder.typicode.com/posts/"
          :file-list="fileList"
          :limit="1"
          :on-change="fileChange"
          :on-success="fileSuccess"
          :on-error="fileError"
          :on-exceed="handleExceed"
          :show-file-list="false"
          >
          <kt-button  label="批量导入" perms="sys:role:view"  type="primary" @click="handleAdd" />
        </el-upload>
        <kt-button  label="制单" perms="sys:role:view" type="success" @click='showDialog=true'/>
      </div>
    </div>
    <!--表格内容栏-->
    <!-- <kt-table :height="220" permsEdit="sys:role:edit" permsDelete="sys:role:delete" :highlightCurrentRow="true" :stripe="false"
      :data="pageResult" :columns="columns" :showBatchDelete="false" @handleCurrentChange="handleRoleSelectChange"
      @findPage="findPage" @handleEdit="handleEdit" @handleDelete="handleDelete">
    </kt-table> -->
    <el-table
      :data="pageResult.content"
      border>
      <el-table-column
      v-for="(column,index) in columns" :key="index"
        :prop="column.prop"
        :label="column.label"
        :width="column.minWidth">
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
        width="180">
        <template slot-scope="scope">
          <kt-button  label="查看"  type="primary" perms="sys:role:view"/>
          <kt-button  label="修改"  type="primary" perms="sys:role:view"/>
          <!-- <el-button @click="onDetail(scope.row)" type="primary" size="small" circle>查看</el-button>
          <el-button type="primary" size="small" circle>修改</el-button> -->
        </template>
      </el-table-column>
    </el-table>
    <!-- </el-col> -->
    <el-dialog :visible.sync="showDialog" width="800px">
      <div class="head">
        <div class="ipt">
          <span>单号:</span>
            <el-input v-model="filters.aviationnum" prop="aviationnum" size="mini">
            </el-input>
        </div>
        <div class="ipt">
          <span>交货运站:</span>
            <el-input v-model="filters.deliveryStation" placeholder="请输入交货运站" size="mini">
            </el-input>
        </div>

      </div>
      <div class="content">
        <div class="_item">
          <div class="label">出港目的地</div>
              <el-row>
                <el-col :span="12">
                  <el-input v-model="filters.startStation" size="small">
                    <template slot="prepend">始发站</template>
                  </el-input>
                </el-col>
                <el-col :span="12">
                  <el-input v-model="filters.outStation" size="small">
                    <template slot="prepend">目的站</template>
                  </el-input>
                </el-col>
              </el-row>
        </div>
        <div class="_item">
          <div class="label">托运人信息</div>
              <el-row>
                <el-col :span="6">
                  <el-input v-model="filters.sendName" size="small">
                    <template slot="prepend">姓名</template>
                  </el-input>
                </el-col>
                <el-col :span="6">
                  <el-input v-model="filters.sendTel" size="small">
                    <template slot="prepend">电话</template>
                  </el-input>
                </el-col>
                <el-col :span="6">
                  <el-input v-model="filters.sendAdr" size="small">
                    <template slot="prepend">地址</template>
                  </el-input>
                </el-col>
                <el-col :span="6">
                  <el-input v-model="filters.pay" size="small">
                    <template slot="prepend">结算方式</template>
                  </el-input>
                </el-col>
              </el-row>
        </div>
        <div class="_item">
          <div class="label">收货人信息</div>
              <el-row>
                <el-col :span="8">
                  <el-input v-model="filters.recevierName" size="small">
                    <template slot="prepend">姓名</template>
                  </el-input>
                </el-col>
                <el-col :span="8">
                  <el-input v-model="filters.recevierTel" size="small">
                    <template slot="prepend">电话</template>
                  </el-input>
                </el-col>
                <el-col :span="8">
                  <el-input v-model="filters.recevierAdr" size="small">
                    <template slot="prepend">地址</template>
                  </el-input>
                </el-col>
              </el-row>
        </div>
        <div class="_item">
          <div class="label">航线</div>
              <el-row>
                <el-col :span="8">
                  <el-input v-model="filters.firstCarrier" size="small">
                    <template slot="prepend">第一承运</template>
                  </el-input>
                </el-col>
                <el-col :span="8">
                  <el-input v-model="filters.transferStation" size="small">
                    <template slot="prepend">中转站</template>
                  </el-input>
                </el-col>
                <el-col :span="8">
                  <el-input v-model="filters.destinationStation" size="small">
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
                  <el-input v-model="filters.flightNum" size="small">
                    <template slot="prepend">班次</template>
                  </el-input>
                </el-col>
              </el-row>
        </div>
        <div class="_item">
          <div class="label">注意事项</div>
            <div class="_select">
              <span>注意事项</span>
              <el-select v-model="value" slot="append" clearable placeholder="请选择" size="small">
                <el-option
                  v-for="item in options"
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
          <el-table
            :data="pageResult.content"
            border
            style="width: 100%">
            <el-table-column
            v-for="(column,index) in column3" :key="index"
              :prop="column.prop"
              :label="column.label"
              :width="column.minWidth"
              align="center"
              >
              <template slot-scope="scope">
               <el-input v-if="column.slot==='mz'" v-model="input1" size="small">
                    <template slot="prepend">毛重</template>
                  </el-input>
                <el-select v-if="column.slot==='yjzl'" v-model="value" slot="append" clearable placeholder="请选择" size="small">
                    <el-option
                      v-for="item in options"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                <div v-if="column.slot==='wpmc'">
                  <el-input v-model="filters.goodName" size="small">
                    <template slot="prepend">品名</template>
                  </el-input>
                  <el-input v-model="filters.chang" size="small">
                    <template slot="prepend">长</template>
                  </el-input>
                  <el-input v-model="filters.kuan" size="small">
                    <template slot="prepend">宽</template>
                  </el-input>
                  <el-input v-model="filters.gao" size="small">
                    <template slot="prepend">高</template>
                  </el-input>
                  <el-input v-model="filters.tiji" size="small">
                    <template slot="prepend">体积</template>
                  </el-input>
                </div>
              </template>
            </el-table-column>
            <!-- <el-table-column
              fixed="right"
              label="操作"
              width="180">
              <template slot-scope="scope">
                <kt-button  label="查看"  type="primary" perms="sys:role:view"/>
                <kt-button  label="修改"  type="primary" perms="sys:role:view"/>
              </template>
            </el-table-column> -->
          </el-table>
        </div>
        <div class="_item">
          <div class="label">付款金额</div>
          <div class="_select">
              <span>其他费用</span>
              <el-select v-model="value" slot="append" clearable placeholder="请选择" size="small">
                <el-option
                  v-for="item in options"
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
                  <el-radio v-model="radioValue" label="1">备选项</el-radio>
                  <el-radio v-model="radioValue" label="2">备选项</el-radio>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="_select">
                  <span style="margin-right: 10px;">付款方式</span>
                  <el-radio v-model="radioValue" label="1">备选项</el-radio>
                  <el-radio v-model="radioValue" label="2">备选项</el-radio>
                </div>
              </el-col>
            </el-row>
            <el-row>
                <el-col :span="8">
                <el-input v-model="filters.weightCharge" size="small">
                    <template slot="prepend">航空费用</template>
                  </el-input>
                </el-col>
                <el-col :span="8">
                  <el-input v-model="filters.otherCharges" size="small">
                    <template slot="prepend">其他总费用</template>
                  </el-input>
                </el-col>
                <el-col :span="8">
                  <el-input v-model="filters.total" size="small">
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
      <span slot="footer" class="dialog-footer">
        <!-- <el-button @click="showDialog = false">取 消</el-button> -->
        <kt-button  label="暂存"  type="primary" perms="sys:role:view" @click="showDialog = false"/>
        <kt-button  label="提交"  type="primary" @click="submitForm1(filters)"  perms="air:aviation:add"/>
        <kt-button  label="作废"  type="primary" perms="sys:role:view"/>
        <kt-button  label="打印"  type="primary" perms="sys:role:view"/>
        <kt-button  label="下一票"  type="primary" perms="sys:role:view"/>
        <!-- <el-button type="primary" @click="showDialog = false">暂存</el-button>
        <el-button type="primary" @click="showDialog = false">提交</el-button>
        <el-button type="primary" @click="showDialog = false">作废</el-button>
        <el-button type="primary" @click="showDialog = false">打印</el-button>
        <el-button type="primary" @click="showDialog = false">下一票</el-button> -->
      </span>
    </el-dialog>

    <el-dialog title="单号导入" :visible.sync="showSingleDialog" width="350px">
    <el-form :model="dataForm" label-width="80px" :rules="dataFormRules" ref="dataForm" >
    <!--  <div class="_item" style="margin-bottom: 10px;">
        <el-input v-model="dataForm.id" size="small">
          <template slot="prepend">序号</template>
        </el-input>
         <el-select v-model="value" slot="append" clearable placeholder="请选择" size="small">
                <el-option
                  v-for="item in list"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
        </div>
        <div class="_item">
        <el-input v-model="dataForm.aviationnum" size="small">
          <template slot="prepend">单号</template>
        </el-input>
      </div>
      -->
       <!--  <el-form-item label="序号 " prop="id">
				<el-input v-model="dataForm.id" auto-complete="off" type="textarea"></el-input>
			</el-form-item>
       -->
			<el-form-item label="单号" prop="aviationnum">
				<el-input v-model="dataForm.aviationnum" auto-complete="off" type="textarea"></el-input>
			</el-form-item>
    </el-form>
        <span slot="footer" class="dialog-footer">
           <!--  <kt-button  label="取消" perms="sys:role:view" @click="showSingleDialog = false"/>
          <kt-button  label="提交"  type="primary" perms="air:num:add"/>    -->
          <el-button  @click.native="showSingleDialog = false">{{$t('action.cancel')}}</el-button>
          <el-button  type="primary" @click.native="submitForm" :loading="editLoading">{{$t('action.submit')}}</el-button>

        </span>
    </el-dialog>
  </div>
</template>

<script>
import KtTable from "@/views/Core/KtTable";
import KtButton from "@/views/Core/KtButton";
import { format } from "@/utils/datetime";
export default {
  components: {
    KtTable,
    KtButton
  },
  data() {
    return {
      radioValue: "",
      value: "",
      input1: "",
      showDialog: false,
      showSingleDialog: false,
      activeName: "first",
      filters: {
        id:0,
        aviationnum:'',
        label:''
      },
      columns: [],
      columns1: [
        { prop: "aviationNum", label: "单号", minWidth: 120 },
        { prop: "sendName", label: "发货人" },
        { prop: "destinationStation", label: "目的站" },
        { prop: "flight", label: "航班号" },
        { prop: "rateClass", label: "件数" },
        { prop: "chargeWeight", label: "重量" }
        // {
        //   prop: "createTime",
        //   label: "创建时间",
        //   minWidth: 120,
        //   formatter: this.dateFormat
        // }
        // {prop:"lastUpdateBy", label:"更新人", minWidth:100},
        // {prop:"lastUpdateTime", label:"更新时间", minWidth:120, formatter:this.dateFormat}
      ],
      columns2: [
        { prop: "name", label: "序号" },
        { prop: "remark0", label: "作废单号" }
      ],
        columns3: [
        { prop: "name", label: "序号" },
        { prop: "remark0", label: "未使用单号" }
      ],
      column3: [
        { prop: "name", label: "件数运价点", minWidth: 100 },
        { prop: "remark0", label: "毛重(千克)", minWidth: 150, slot: "mz" },
        { prop: "remark1", label: "运件种类", slot: "yjzl", minWidth: 150 },
        { prop: "remark2", label: "商品代号" },//这里你像要哪个显示输入框就加上自己的标识 slot
        { prop: "remark3", label: "计费重量(千克)" },
        { prop: "remark4", label: "费率" },
        { prop: "remark4", label: "航空运费" },
        { prop: "remark4", label: "物品名称", slot: "wpmc", minWidth: 160 }
      ],
      options: [
        {
          value: "选项1",
          label: "黄金糕"
        },
        {
          value: "选项2",
          label: "双皮奶"
        }
      ],
      list:[{value: "选项1",
          label: "黄金糕"}]
, 	pageRequest: { pageNum: 1, pageSize: 10 },
      pageResult: {},

      operation: false, // true:新增, false:编辑
      dialogVisible: false, // 新增编辑界面是否显示
      editLoading: false,

      dataFormRules: {
        name: [{ required: true, message: "请输入角色名", trigger: "blur" }]
      },
      // 新增编辑界面数据
			dataForm: {
				id:0,
				aviationnum:'',
			},
      value2: "",
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
            onClick(picker) {return
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      },
      fileList: []
    };
  },
  methods: {
    UploadUrl() {
      // 设置为一个返回为空的方法
      return "";
    },
    fileSuccess(res, file, fileList) {
      this.$message.success("文件上传成功");
    },
    fileError(err, file, fileList) {
      this.$message.success("文件上传失败");
    },
    // beforeUploadFile(file) {
    //   const extension = file.name.substring(file.name.lastIndexOf(".") + 1);
    //   const size = file.size / 1024 / 1024;
    //   if (extension !== ".xls") {
    //     return this.$message.warning("只能上传excel的文件");
    //   } else if (extension !== ".xlsx") {
    //     return this.$message.warning("只能上传excel的文件");
    //   }
    //   if (size > 10) {
    //     return this.$message.warning("文件大小不得超过10M");
    //   }
    //   return true;
    // },
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
    onDetail() {},
    handleClick(tab, event) {
      let obj = {
        first: this.columns1,
        second: this.columns2,
        third: this.columns3
      };
      this.columns = obj[this.activeName];
      console.log("columns00000000000"+columns);
    },
    // 获取分页数据
     findPage: function(data) {
       this.columns = this.columns1;

     	if(data !== null) {
				this.pageRequest = data.pageRequest
			}
			this.pageRequest.columnFilters = {label: {name:'label', value:this.filters.label}}
			this.$api.tAviationnum.findPage(this.pageRequest).then((res) => {
				this.pageResult = res.data
			}).then(data!=null?data.callback:'')
    },
    // 批量删除
    handleDelete: function(data) {
      this.$api.role.batchDelete(data.params).then(data.callback);
    },
			// 单号新增&编辑
		submitForm: function () {
			this.$refs.dataForm.validate((valid) => {
				if (valid) {
					this.$confirm('确认提交吗？', '提示', {}).then(() => {
						this.editLoading = true
						let params = Object.assign({}, this.dataForm)
						this.$api.tAviationnum.save(params).then((res) => {
							if(res.code == 200) {
								this.$message({ message: '操作成功', type: 'success' })
							} else {
								this.$message({message: '操作失败, ' + res.msg, type: 'error'})
							}
							this.editLoading = false
							this.$refs['dataForm'].resetFields()
							this.editDialogVisible = false
							this.findPage(null)
						})
					})
				}
			})
		},
    // 制单新增&编辑
    submitForm1: function () {
			this.$refs.filters.validate((valid) => {
				if (valid) {
					this.$confirm('确认提交吗？', '提示', {}).then(() => {

						this.editLoading = true
						let params = Object.assign({}, this.filters)
						this.$api.tAviationnum.savetAviation(params).then((res) => {

							if(res.code == 200) {
								this.$message({ message: '操作成功', type: 'success' })
							} else {
								this.$message({message: '操作失败, ' + res.msg, type: 'error'})
							}
							this.editLoading = false
							this.$refs['filters'].resetFields()
							this.editDialogVisible = false
							this.findPage(null)
						})
					})
				}
			})
		},
    // 显示新增界面
    handleAdd: function() {},
    // 显示编辑界面
    handleEdit: function(params) {
      this.dialogVisible = true;
      this.operation = false;
      this.dataForm = Object.assign({}, params.row);
    },
    // 角色选择改变监听
    handleRoleSelectChange(val) {
      if (val == null || val.val == null) {
        return;
      }
      // this.selectRole = val.val;
      // this.$api.role.findRoleMenus({'roleId':val.val.id}).then((res) => {
      // 	this.$refs.menuTree.setCheckedNodes(res.data)
      // })
    },
    // 时间格式化
    dateFormat: function(row, column, cellValue, index) {
      return format(row[column.property]);
    }
  },
  mounted() {
       this.findPage(this.data);

  //这里的两个testApi 第一个是模块路径 第二个是方法名 别搞错了
 // console.log(this.$api.tAviationnum.save({xx:'测试'}))
    // this.columns = this.columns1;
    // this.pageResult = {
    //   content: new Array(1).fill({}).map((l, b) => ({
    //     id: b + 1,
    //     name: `${b + 345353524}`,
    //     remark0: "ls" + b
    //   }))
    // };


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
  /deep/ .el-tabs__nav {
    border: 0 !important;
  }
  /deep/ .el-tabs__item {
    color: #fff;
    background-color: #118972;
    border-top-right-radius: 20px;
    &.is-active {
      border-bottom-color: #118972;
    }
    &:nth-child(2) {
      background-color: #af5921;
      &.is-active {
        border-bottom-color: #af5921;
      }
    }
    &:nth-child(3) {
      background-color: #8d9cb1;
      &.is-active {
        border-bottom-color: #8d9cb1;
      }
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
  padding: 10px 0;
  border: 1px solid #000;
}
._item {
  .label {
    text-align: left;
    color: #246894;
    font-size: 14px;
    font-weight: bold;
  }

  /deep/ .el-input-group__prepend {
    background-color: #3498db;
    color: #fff;
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
    background-color: #3498db;
    color: #fff;
    width: 60px;
    height: 32px;
    line-height: 32px;
    padding: 0 5px;
  }
}
</style>
