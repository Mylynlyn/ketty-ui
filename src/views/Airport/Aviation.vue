<template>
  <div class="page-container">
    <!--工具栏-->
    <div class="toolbar">
      <el-form :inline="true" size="small">
        <el-form-item>
          <el-input v-model="keywords" placeholder="请输入单号">
            <kt-button slot="append" icon="el-icon-search" @click="searchTable" perms="air:num:search"
                       label=""></kt-button>
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
        <kt-button label="单号导入" perms="air:num:add" type="primary" @click="singleDialogVisible=true"/>
        <el-upload
          accept=".xls, .xlsx"
          action='http://39.105.37.45:8001/tAviationnum/importExcel'
          :headers="headers"
          :file-list="fileList"
          :on-success="fileSuccess"
          :on-error="fileError"
          :on-exceed="handleExceed"
          :show-file-list="false"
        >
          <kt-button label="批量导入" perms="air:num:batch" type="primary"/>
        </el-upload>
        <kt-button label="制单" perms="air:aviation:add" type="success" @click='makeForm'/>
      </div>
    </div>
    <div v-if="this.activeName=='used'">
      <el-table :data="usedTable" :size="tableSize" :cell-style="{padding:'3px 0'}"
                :header-cell-style="{background:'#EEEEEE',color:'#606266'}">
        <el-table-column type="index" :index="returnUsedIndex" label="序号"></el-table-column>
        <template v-for="item in usedHeaders">
          <el-table-column :label="item.label" :prop="item.prop" :width="item.width"></el-table-column>
        </template>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-view" @click="viewUsedDetail(scope.$index,scope.row)"
                       :size="tableSize" perms="air:num:view">查看
            </el-button>
            <el-button type="text" icon="el-icon-edit" @click="operateFormDetail(scope.$index,scope.row)"
                       :size="tableSize">
              <span v-if="scope.row.status=='-1'">申请</span>
              <span v-else-if="scope.row.status=='0'&&(currentRole.indexOf('管理员')>-1||currentRole.indexOf('总经理')>-1)">待审核</span>
              <span v-else-if="scope.row.status=='0'&&(currentRole.indexOf('管理员')==-1||currentRole.indexOf('总经理')==-1)">审核中</span>
              <span v-else>编辑</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pageStyle">
        <el-pagination
          @size-change="usedHandleSizeChange"
          @current-change="usedHandleCurrentChange"
          :current-page="usedCurrentPage"
          :page-sizes="[10, 20, 30,40,50]"
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
        <el-table-column label="作废原因" prop="cancelreason"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-view" @click="viewInvalidDetail(scope.$index,scope.row)"
                       :size="tableSize" perms="air:num:view">查看
            </el-button>
            <el-button type="text" icon="el-icon-edit" @click="operateFormDetail(scope.$index,scope.row)"
                       :size="tableSize">
              <span v-if="scope.row.status=='-1'">申请</span>
              <span v-else-if="scope.row.status=='0'&&(currentRole.indexOf('管理员')>-1||currentRole.indexOf('总经理')>-1)">待审核</span>
              <span v-else-if="scope.row.status=='0'&&(currentRole.indexOf('管理员')==-1||currentRole.indexOf('总经理')==-1)">审核中</span>
              <span v-else>编辑</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pageStyle">
        <el-pagination
          @size-change="invalidHandleSizeChange"
          @current-change="invalidHandleCurrentChange"
          :current-page="invalidCurrentPage"
          :page-sizes="[10, 20, 30,40,50]"
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
          :page-sizes="[10, 20, 30,40,50]"
          :page-size="notUsedPageSize"
          layout="total, sizes, prev, pager, next"
          :total="notUsedTotal">
        </el-pagination>
      </div>
    </div>
    <el-dialog :visible.sync="dialogVisible" width="950px" title="制单" class="makeFormStyle">
      <el-form :model="addForm" ref="addForm" size="mini" :rules="addFormRules" id="print_content">
        <div class="normal_circle" v-show="formFlag==1||formFlag==4">正常</div>
        <div class="invalid_circle" v-show="formFlag==2||formFlag==3">作废</div>
        <el-row style="padding:0 10px">
          <el-col :span="8">
            <el-form-item prop="aviationnum" label="单号" label-width="80px">
              <el-select v-model="addForm.aviationnum" style="width:100%" filterable>
                <template v-for="item in aviationnumOptions">
                  <el-option :label="item.aviationnum" :key="item.aviationnum" :value="item.aviationnum"></el-option>
                </template>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="deliverystationArray" label="交货运站" label-width="80px">
              <el-cascader v-model="addForm.deliverystationArray" :options="deliveryOptions" :show-all-levels="false"
                           @change="changeDeliveryStation" style="width:100%"></el-cascader>
            </el-form-item>
          </el-col>
        </el-row>
        <div class="formBorder">
          <el-row class="itemTitle">出港目的地</el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="始发站" prop="startstation" label-width="80px">
                <el-select v-model="addForm.startstation" style="width:100%" @change="getFlightOptions" filterable>
                  <template v-for="element in startStationOptions">
                    <el-option :label="element.stationName" :value="element.stationName"
                               :key="element.stationName"></el-option>
                  </template>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="目的站" prop="outstation" label-width="80px">
                <el-select v-model="addForm.outstation" style="width:100%" @change="getFlightOptions" filterable>
                  <template v-for="element in outStationOptions">
                    <el-option :label="element.stationName" :value="element.stationName"
                               :key="element.stationName"></el-option>
                  </template>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row class="itemTitle">托运人信息</el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="姓名" prop="sendname" label-width="80px">
                <el-select v-model="addForm.sendname" @change="changeSendName" style="width:100%"
                           filterable default-first-option clearable>
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
              <el-form-item label="姓名" prop="receivename" label-width="80px">
                <el-select v-model="addForm.receivename" @change="changeReceiveName" style="width:100%"
                           filterable allow-create default-first-option clearable>
                  <template v-for="item in receiveNameOptions">
                    <el-option :label="item.receivename" :value="item.receivename" :key="item.receivename"></el-option>
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
            <el-col :span="8">
              <el-form-item label="第一承运" prop="firstcarrier" label-width="80px">
                <el-input v-model="addForm.firstcarrier" :disabled='true'></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="中转站" prop="transferstation" label-width="80px">
                <el-select v-model="addForm.transferstation" style="width:100%" filterable clearable>
                  <template v-for="item in transferStationOptions">
                    <el-option :label="item.stationName" :value="item.stationName" :key="item.stationName"></el-option>
                  </template>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="到达站" prop="outstation" label-width="80px">
                <el-input v-model="addForm.outstation" :disabled='true'></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="航班" prop="flight" label-width="80px">
                <el-select v-model="addForm.flight" style="width:100%" @change="selectFlight" filterable clearable>
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
                <el-select v-model="addForm.flightnum" style="width:100%" filterable clearable>
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
                <el-select v-model="addForm.attention" placeholder="请选择" style="width:100%" filterable clearable>
                  <el-option v-for="item in attentionOptions" :key="item.value" :label="item.label"
                             :value="item.value"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row class="itemTitle">货物信息</el-row>
          <el-table :data="cargoTableData" :size="cargoSize" width="100%" class="cargoTableStyle"
                    :summary-method="getSummaries"
                    @cell-click="cellEdit" :cell-class-name="getRowColumn" :span-method="objectSpanMethod">
            <el-table-column label="件数" prop="rcp" align="center" width="60px">
              <template slot-scope="scope">
                <el-input v-model="scope.row.rcp"
                          v-if="scope.row.index==tabRowIndex && scope.column.index==tabColumnIndex" :size="cargoSize">
                </el-input>
                <span v-else>{{scope.row.rcp}}</span>
              </template>
            </el-table-column>
            <el-table-column label="毛重(kg)" prop="grossall" align="center" width="70px">
              <template slot-scope="scope">
                <el-input v-model="scope.row.grossall"
                          v-if="scope.row.index==tabRowIndex && scope.column.index==tabColumnIndex" :size="cargoSize">
                </el-input>
                <span v-else>{{scope.row.grossall}}</span>
              </template>
            </el-table-column>
            <el-table-column label="运价种类" prop="rateclass" align="center">
              <template slot-scope="scope">
                <el-select v-model="scope.row.rateclass"
                           v-if="scope.row.index==tabRowIndex && scope.column.index==tabColumnIndex"
                           @change="changeGoodType" :size="cargoSize" filterable>
                  <template v-for="item in goodsInfoOptions">
                    <el-option :label="item.goodtype" :value="item.goodtype" :key="item.goodtype"></el-option>
                  </template>
                </el-select>
                <span v-else>{{scope.row.rateclass}}</span>
              </template>
            </el-table-column>
            <el-table-column label="商品代号" align="center">
              <template slot-scope="scope">
                <el-select v-model="scope.row.itemnum"
                           v-if="scope.row.index==tabRowIndex && scope.column.index==tabColumnIndex"
                           @change="changeGoodNum" :size="cargoSize" filterable>
                  <template v-for="item in goodsInfoOptions">
                    <el-option :label="item.goodnum" :value="item.goodnum" :key="item.goodnum"></el-option>
                  </template>
                </el-select>
                <span v-else>{{scope.row.itemnum}}</span>
              </template>
            </el-table-column>
            <el-table-column label="计费重量(kg)" prop="weightall" align="center" width="95px">
              <template slot-scope="scope">
                <span>{{scope.row.weightall}}</span>
              </template>
            </el-table-column>
            <el-table-column label="费率" prop="rate" align="center" width="60px">
              <template slot-scope="scope">
                <span>{{finalRatio}}</span>
              </template>
            </el-table-column>
            <el-table-column label="航空运费" prop="airfreightall" align="center">
              <template slot-scope="scope">
                <span>{{scope.row.airfreightall}}</span>
              </template>
            </el-table-column>
            <el-table-column label="尺寸(cm)" align="center">
              <el-table-column label="货物包装" prop="goodname" align="center">
                <template slot-scope="scope">
                  <el-select v-model="scope.row.goodname"
                             v-if="scope.row.index==tabRowIndex && scope.column.index==tabColumnIndex" :size="cargoSize"
                             filterable>
                    <template v-for="item in packagOptions">
                      <el-option :label="item.label" :value="item.label"></el-option>
                    </template>
                  </el-select>
                  <span v-else>{{scope.row.goodname}}</span>
                </template>
              </el-table-column>
              <el-table-column label="长" prop="chang" align="center" width="50px">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.chang"
                            v-if="scope.row.index==tabRowIndex && scope.column.index==tabColumnIndex" :size="cargoSize">
                  </el-input>
                  <span v-else>{{scope.row.chang}}</span>
                </template>
              </el-table-column>
              <el-table-column label="宽" prop="kuan" align="center" width="50px">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.kuan"
                            v-if="scope.row.index==tabRowIndex && scope.column.index==tabColumnIndex" :size="cargoSize">
                  </el-input>
                  <span v-else>{{scope.row.kuan}}</span>
                </template>
              </el-table-column>
              <el-table-column label="高" prop="gao" align="center" width="50px">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.gao"
                            v-if="scope.row.index==tabRowIndex && scope.column.index==tabColumnIndex" :size="cargoSize">
                  </el-input>
                  <span v-else>{{scope.row.gao}}</span>
                </template>
              </el-table-column>
              <el-table-column label="体积(m³)" prop="tiji" align="center" width="70px">
                <template slot-scope="scope">
                  <span>{{scope.row.tiji}}</span>
                </template>
              </el-table-column>
            </el-table-column>
            <el-table-column label="操作" align="center" width="50px">
              <template slot-scope="scope">
                <el-button icon="el-icon-delete" type="text" :size="cargoSize"
                           @click.native.prevent="deleteCargoRow(scope.$index,cargoTableData)"></el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="text-align:center">
            <el-button icon="el-icon-circle-plus-outline" @click="addCargoTable" :size="cargoSize"></el-button>
          </div>
          <el-row class="itemTitle">付款金额</el-row>
          <el-row>
            <template v-for="item in payOptions">
              <el-col :span="12">
                <el-form-item :label="item.label" :prop="item.prop" label-width="80px">
                  <el-radio-group v-model="addForm[item.prop]">
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
              <el-col :span="6">
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
              <el-form-item label="时间" prop="filltime" label-width="80px">
                <el-input v-model="addForm.filltime" :disabled="true">
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="地点" prop="place" label-width="80px">
                <el-input v-model="addForm.place" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="制单员" prop="carrier" label-width="80px">
                <el-input v-model="addForm.carrier" :disabled="true">
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="formFlag==2||formFlag==3">
            <el-col :span="8">
              <el-form-item label="作废原因" prop="cancelreason" label-width="80px"
                            :rules="{required: true, message: ' ', trigger: 'blur'}">
                <el-select v-model="addForm.cancelreason" style="width:100%">
                  <template v-for="item in cancelReasonOptions">
                    <el-option :label="item.label" :value="item.label"></el-option>
                  </template>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="作废费用" prop="invalidcharge" label-width="80px"
                            :rules="{required: true, message: ' ', trigger: 'blur'}">
                <el-input v-model="addForm.invalidcharge"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm('addForm','staging','')" :size="cargoSize"
                   v-show="formFlag==0&&stagingFlag==0">暂存</el-button>
        <el-button type="primary" @click="submitForm('addForm','used','')" :size="cargoSize"
                   v-show="formFlag==0&&stagingFlag==0">提交</el-button>
       <el-button type="primary" @click="submitForm('addForm','invalid','')" :size="cargoSize"
                  v-show="formFlag==0&&stagingFlag==0">作废</el-button>
         <el-button type="primary" @click="editSubmit('addForm','used','')" :size="cargoSize"
                    v-show="formFlag==0&&stagingFlag==1">提交</el-button>
        <el-button type="primary" @click="editSubmit('addForm','invalid','')" :size="cargoSize"
                   v-show="formFlag==0&&stagingFlag==1">作废</el-button>
        <el-button type="primary" @click="editSubmit('addForm','used','')" :size="cargoSize"
                   v-show="formFlag==1">提交</el-button>
        <el-button type="primary" @click="editSubmit('addForm','invalid','')" :size="cargoSize"
                   v-show="formFlag==1">作废</el-button>
        <el-button type="primary" @click="editSubmit('addForm','invalid','')" :size="cargoSize"
                   v-show="formFlag==2">提交</el-button>
        <el-button type="primary" v-print="'#print_content'" :size="cargoSize">打印</el-button>
        <el-button type="primary" @click="submitForm('addForm','used','next')" :size="cargoSize"
                   v-show="formFlag==0&&stagingFlag==0">下一票</el-button>
         <el-button type="primary" @click="editSubmit('addForm','used','next')" :size="cargoSize"
                    v-show="formFlag==0&&stagingFlag==1">下一票</el-button>
      </span>
      <el-dialog title="请选择作废原因" :visible.sync="invalidReasonDialogVisible" width="550px" append-to-body>
        <el-form :model='invalidForm' ref="invalidForm">
          <el-form-item label="作废原因" prop="cancelreason" label-width="80px" :rules="{required: true, message: '请选择作废原因', trigger: 'blur'}">
            <el-radio-group v-model="invalidForm.cancelreason">
              <template v-for="item in cancelReasonOptions">
                <el-radio :label="item.label"></el-radio>
              </template>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="作废费用" prop="invalidcharge" label-width="80px" :rules="{required: true, message: ' ', trigger: 'blur'}">
            <el-row>
              <el-col :span="12"><el-input v-model="invalidForm.invalidcharge" :size="cargoSize"></el-input></el-col>
            </el-row>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click.native="submitFormInvalid('invalidForm')" :size="cargoSize">确定</el-button>
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
          >{{$t('action.submit')}}</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
    import KtTable from "@/views/Core/KtTable";
    import KtButton from "@/views/Core/KtButton";
    import AirForm from '@/views/Airport/AirForm'
    import Cookies from "js-cookie"

    export default {
        components: {
            KtTable,
            KtButton,
            AirForm
        },
        data() {
            return {
                invalidForm:{},
                stagingFlag: 0,//记录是否存在暂存数据，0不存在，1存在
                formFlag: 0,// 0为制单，1为已使用的编辑，2为作废的编辑，3为作废的查看，4为已使用的查看
                currentRole: Cookies.get('role'),
                goodtype: '',
                goodnum: '',
                finalRatio: 0,
                rcpVisible: false,
                invalidReasonDialogVisible:false,
                cargoSize: 'mini',
                tableSize: 'small',
                usedCurrentPage: 1,
                usedPageSize: 10,
                invalidCurrentPage: 1,
                invalidPageSize: 10,
                notUsedCurrentPage: 1,
                notUsedPageSize: 10,
                headers: {token: Cookies.get('token')},
                dateArray: [],//记录日期选择器时间
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
                    {prop: "outstation", label: "目的站", width: '150px'},
                    {prop: "flight", label: "航班号", width: '150px'},
                    {prop: "rcpall", label: "件数", width: '150px'},
                    {prop: "weightall", label: "重量", width: '150px'}
                ],
                invalidHeaders: [
                    {prop: "aviationnum", label: "作废单号"}
                ],
                notUsedHeaders: [
                    {prop: "aviationnum", label: "未使用单号"}
                ],
                dialogVisible: false,
                dataFormRules: {
                    aviationnum: [{required: true, message: "请输入单号", trigger: "blur"}]
                },
                dataForm: {
                    id: 0,
                    aviationnum: ''
                },
                fileList: [],
                addForm: {
                    aviationnum: '',
                    deliverystation: '',
                    deliverystationArray: [],
                    startstation: '',
                    outstation: '',
                    sendname: '',
                    sendtel: '',
                    sendadr: '',
                    cashtype: '',
                    receivename: '',
                    receivetel: '',
                    receiveadr: '',
                    firstcarrier: '',
                    transferstation: '',
                    flight: '',
                    riqi: '',
                    flightnum: '',
                    attention: '',
                    paytype: '',
                    weightcharge: '',
                    makingcharge: '',
                    otherallcharges: '',
                    total: '',
                    filltime: '',
                    place: '',
                    carrier: '',
                    rcpall: ''
                },
                addFormRules: {
                    aviationnum: [{required: true, message: ' ', trigger: 'blur'}],
                    deliverystationArray: [{required: true, message: ' ', trigger: 'blur'}],
                    startstation: [{required: true, message: ' ', trigger: 'blur'}],
                    outstation: [{required: true, message: ' ', trigger: 'blur'}],
                    sendname: [{required: true, message: ' ', trigger: 'blur'}],
                    sendtel: [{required: true, message: ' ', trigger: 'blur'}],
                    sendadr: [{required: true, message: ' ', trigger: 'blur'}],
                    cashtype: [{required: true, message: ' ', trigger: 'blur'}],
                    receivename: [{required: true, message: ' ', trigger: 'blur'}],
                    receivetel: [{required: true, message: ' ', trigger: 'blur'}],
                    receiveadr: [{required: true, message: ' ', trigger: 'blur'}],
                    firstcarrier: [{required: true, message: ' ', trigger: 'blur'}],
                    // transferstation: [{required: true,message:' ',trigger:'blur'}],
                    // destinationstation: [{required: true,message:' ',trigger:'blur'}],
                    flight: [{required: true, message: ' ', trigger: 'blur'}],
                    riqi: [{required: true, message: ' ', trigger: 'blur'}],
                    flightnum: [{required: true, message: ' ', trigger: 'blur'}],
                    attention: [{required: true, message: ' ', trigger: 'blur'}],
                    paytype: [{required: true, message: ' ', trigger: 'blur'}],
                    weightcharge: [{required: true, message: ' ', trigger: 'blur'}],
                    makingcharge: [{required: true, message: ' ', trigger: 'blur'}],
                    otherallcharges: [{required: true, message: ' ', trigger: 'blur'}],
                    total: [{required: true, message: ' ', trigger: 'blur'}],
                    filltime: [{required: true, message: ' ', trigger: 'blur'}],
                    place: [{required: true, message: ' ', trigger: 'blur'}],
                    carrier: [{required: true, message: ' ', trigger: 'blur'}]
                },
                labelPosition: 'left',
                aviationnumOptions: [],//--单号
                deliveryOptions: [//--交货运站
                    {
                        value: '东航',
                        label: '东航',
                        children: [
                            {value: '大兴东航', label: '大兴东航'},
                            {value: '首都东航', label: '首都东航'}
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
                startStationOptions: [],
                outStationOptions: [],
                transferStationOptions: [],
                sendNameOptions: [],//--托运人信息表
                sendInfoOptions: [//--托运人信息
                    {label: '电话', prop: 'sendtel', labelwidth: '60px', disable: true},
                    {label: '地址', prop: 'sendadr', labelwidth: '60px', disable: true}
                ],
                receiveInfoOptions: [
                    {label: '电话', prop: 'receivetel', disable: true},
                    {label: '地址', prop: 'receiveadr', disable: true},
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
                tabRowIndex: -1,
                tabColumnIndex: -1,
                cargoTableData: [],
                goodsInfoOptions: [],
                packagOptions: [
                    {label: '纸箱'},
                    {label: '木箱'},
                    {label: '托盘'}
                ],
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
                    {label: '航空费用', prop: 'weightcharge', disable: true},
                    {label: '制单费用', prop: 'makingcharge', disable: false},
                    {label: '其他费用', prop: 'otherallcharges', disable: false},
                    {label: '总额', prop: 'total', disable: true},
                ],
                fillInfoOptions: [
                    {label: '时间', prop: 'filltime', disable: true},
                    {label: '地点', prop: 'place', disable: false},
                    {label: '制单员', prop: 'carrier', disable: true}
                ],
                cancelReasonOptions: [
                    {label: '客户退货'},
                    {label: '航班取消'},
                    {label: '航班拉货'},
                    {label: '人为操作'}
                ]
            };
        },
        methods: {
            createReceiveInfo(name, tel, adr) {
                this.$api.receiver.submitInfos({
                    receivename: name,
                    receivetel: tel,
                    receiveadr: adr
                }).then(res => {
                })
            },
            changeRcpStatus() {
                this.rcpVisible = true
            },
            blurRcp() {
                this.rcpVisible = false
            },
            cellEdit(row, column) {
                this.tabRowIndex = row.index
                this.tabColumnIndex = column.index
            },
            getRowColumn({row, column, rowIndex, columnIndex}) {
                row.index = rowIndex
                column.index = columnIndex
            },
            objectSpanMethod({row, column, rowIndex, columnIndex}) {
                if (columnIndex === 1 || columnIndex == 2 || columnIndex == 3 || columnIndex == 4 || columnIndex == 5 || columnIndex === 6) {
                    if (rowIndex % this.cargoTableData.length === 0) {
                        return {
                            rowspan: this.cargoTableData.length,
                            colspan: 1
                        };
                    } else {
                        return {
                            rowspan: 0,
                            colspan: 0
                        };
                    }
                }
            },
            deleteCargoRow(index, rows) {
                rows.splice(index, 1)
                if(this.cargoTableData.length==0){
                    this.goodtype=''
                }
            },
            getSummaries(param) {
                const {columns, data} = param;
                const sums = [];
                const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12]
                columns.forEach((column, index) => {
                    if (index === 0) {
                        sums[index] = '合计';
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
                        sums[index] += ' ';
                    } else {
                        sums[index] = 'N/A';
                    }
                    arr.forEach((itemIndex) => {
                        sums[itemIndex] = ''
                    })
                });
                return sums;
            },
            addCargoTable() {
                this.cargoTableData.push({})
                const length = this.cargoTableData.length
                if (length > 1) {
                    this.cargoTableData[length - 1].grossall = this.cargoTableData[length - 2].grossall
                }
                console.log(this.cargoTableData)
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
            changeDeliveryStation(val) {//改变交货运站--影响第一承运，获取货物信息表
                this.addForm.deliverystation = val[1]
                if (val[0] == '东航') {
                    this.addForm.firstcarrier = 'MU'
                } else {
                    this.addForm.firstcarrier = 'CZ'
                }
                if (val[1].indexOf('大兴') > -1) {
                    this.addForm.startstation = "北京大兴"
                } else if (val[1].indexOf('首都') > -1) {
                    this.addForm.startstation = "北京首都"
                }
                this.$api.goods.searchGoods({
                    airFight: val[0]
                }).then(res => {
                    console.log(res)
                    if (res.status == 200) {
                        this.goodsInfoOptions = res.data
                    }
                })
            },
            getStationOptions(val) {//获取三类站点
                this.$api.transfer.searchInfos({
                    note: val
                }).then(res => {
                    if (res.status == 200) {
                        if (val == '始发站') {
                            this.startStationOptions = res.data
                        } else if (val == '中转站') {
                            this.transferStationOptions = res.data
                        } else {
                            this.outStationOptions = res.data
                        }
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
                    if (res.status == 200) {
                        this.sendNameOptions = res.data.content
                    }
                })
            },
            changeSendName(val) {//托运人信息自动关联,获取费率
                for (let i = 0; i < this.sendNameOptions.length; i++) {
                    if (this.sendNameOptions[i].sendname == val) {
                        this.addForm.sendtel = this.sendNameOptions[i].sendtel
                        this.addForm.sendadr = this.sendNameOptions[i].sendadr
                        this.addForm.cashtype = this.sendNameOptions[i].cashtype
                    }
                }
                this.getFinalRatio()
            },
            getReceiveNameOptions() {//获取收货人信息表
                this.$api.receiver.getInfos({
                    columnFilters: {type: {name: 'keywords', value: ''}},
                    pageSize: 0,
                    pageNum: 0
                }).then(res => {
                    if (res.status == 200) {
                        this.receiveNameOptions = res.data.content
                    }
                })
            },
            changeReceiveName(val) {//收货人信息自动关联
                console.log(val)
                for (let i = 0; i < this.receiveNameOptions.length; i++) {
                    if (this.receiveNameOptions[i].receivename == val) {
                        this.addForm.receivetel = this.receiveNameOptions[i].receivetel
                        this.addForm.receiveadr = this.receiveNameOptions[i].receiveadr
                    }
                }
                console.log(this.addForm.receivename)
            },
            getFlightOptions() {//获取筛选后的航班号列表
                if (this.addForm.startstation != '' && this.addForm.startstation != undefined && this.addForm.outstation != '' && this.addForm.outstation != undefined) {
                    this.$api.flight.searchFlightList({
                        startStation: this.addForm.startstation,
                        destination: this.addForm.outstation
                    }).then(res => {
                        console.log(res)
                        if (res.status == 200) {
                            this.flightOptions = res.data
                        }
                    })
                }
            },
            selectFlight(val) {//选定航班，关联班次,获取费率
                for (let i = 0; i < this.flightOptions.length; i++) {
                    if (this.flightOptions[i].flight == val) {
                        this.addForm.flightnum = this.flightOptions[i].flightnum
                    }
                }
                this.getFinalRatio()
            },
            changeGoodNum(val) {//商品代码改变，关联运价种类，获取费率
                this.goodnum = val
                for (let i = 0; i < this.goodsInfoOptions.length; i++) {
                    if (this.goodsInfoOptions[i].goodnum == val) {
                        this.cargoTableData[this.tabRowIndex].rateclass = this.goodsInfoOptions[i].goodtype
                        this.goodtype = this.goodsInfoOptions[i].goodtype
                    }
                }
                this.getFinalRatio()
            },
            changeGoodType(val) {//运价种类改变，关联商品代码，获取费率
                this.goodtype = val
                for (let i = 0; i < this.goodsInfoOptions.length; i++) {
                    if (this.goodsInfoOptions[i].goodtype == val) {
                        this.cargoTableData[this.tabRowIndex].itemnum = this.goodsInfoOptions[i].goodnum
                        this.goodnum = this.goodsInfoOptions[i].goodnum
                    }
                }
                this.getFinalRatio()
            },
            getCurrentTime() {//获取当前时间
                let currentTime = new Date()
                let dateValue = currentTime.getFullYear() + '-' + (currentTime.getMonth() + 1) + '-' + currentTime.getDate()
                this.addForm.filltime = dateValue
            },
            getUsedDetail(index, row) {  //获取已使用单号数据
                this.getAviationnumOptions()
                this.getStationOptions('始发站')
                this.getStationOptions('中转站')
                this.getStationOptions('目的站')
                this.getSendNameOptions()
                this.getReceiveNameOptions()
                this.dialogVisible = true
                var flightCompany = ''
                if (row.deliverystation.indexOf("东航") > -1) {
                    row.deliverystationArray = ['东航', row.deliverystation]
                    flightCompany = '东航'
                } else {
                    row.deliverystationArray = ['南航', row.deliverystation]
                    flightCompany = '南航'
                }
                this.addForm = Object.assign({}, row)
                this.addForm.invalidcharge = 0;
                this.cargoTableData = []
                if (row.cargoTable != null && row.cargoTable != undefined) {
                    for (var i = 0; i < row.cargoTable.length; i++) {
                        this.cargoTableData.push(row.cargoTable[i])
                    }
                }
                if (this.cargoTableData.length > 0) {
                    this.goodtype = this.cargoTableData[0].rateclass
                    this.getFinalRatio()
                }
                this.$api.goods.searchGoods({//获取货物列表
                    airFight: flightCompany
                }).then(res => {
                    console.log(res)
                    if (res.status == 200) {
                        this.goodsInfoOptions = res.data
                    }
                })
                this.getFlightOptions()//获取航班列表
            },
            getInvalidDetail(val) {// 获取作废单号的数据
                this.addForm = {}
                this.cargoTableData = []
                this.$api.tAviationnum.viewDetail({
                    aviationnum: val
                }).then(res => {
                    console.log(res)
                    if (res.status == 200) {
                        this.addForm = Object.assign({}, res.data)
                        if (res.data.cargoTable != null && res.data.cargoTable != undefined) {
                            for (var i = 0; i < res.data.cargoTable.length; i++) {
                                this.cargoTableData.push(res.data.cargoTable[i])
                            }
                        }
                        if (this.cargoTableData.length > 0) {
                            this.goodtype = this.cargoTableData[0].rateclass
                            this.getFinalRatio()
                        }
                        var flightCompany = ''
                        if (this.addForm.deliverystation.indexOf("东航") > -1) {
                            this.addForm.deliverystationArray = ['东航', this.addForm.deliverystation]
                            flightCompany = '东航'
                        } else {
                            this.addForm.deliverystationArray = ['南航', this.addForm.deliverystation]
                            flightCompany = '南航'
                        }
                        this.dialogVisible = true
                    }
                })
            },
            viewUsedDetail(index, row) {
                this.formFlag = 4
                this.getUsedDetail(index, row)
            },
            viewInvalidDetail(index, row) {// 查看作废单号
                this.formFlag = 3
                this.getInvalidDetail(row.aviationnum)
            },
            operateFormDetail(index, row) {//对于单号的权限操作
                if (row.status == '0' && (this.currentRole.indexOf("管理员") > -1 || this.currentRole.indexOf('总经理') > -1)) {
                    this.$confirm(row.lastupdateby + '申请编辑权限', '提示', {
                        confirmButtonText: '同意',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.$api.tAviationnum.operateData({
                            aviationNum: row.aviationnum,
                            status: row.status,
                            carrier: Cookies.get('user')
                        }).then(res => {
                            if (res.status == 200) {
                                console.log(this.activeName)
                                if (this.activeName == 'used') {
                                    this.refreshUsedData()
                                } else {
                                    this.refreshData('invalid')
                                }
                            }
                        })
                    }).catch(() => {
                        this.$message({
                            type: 'info',
                            message: '已取消'
                        });
                    });
                } else if (row.status == '-1') {//申请&待审核
                    this.$api.tAviationnum.operateData({
                        aviationNum: row.aviationnum,
                        status: row.status,
                        carrier: Cookies.get('user')
                    }).then(res => {
                        if (res.status == 200) {
                            if (this.activeName == 'used') {
                                this.refreshUsedData()
                            } else {
                                this.refreshData('invalid')
                            }
                        }
                    })
                } else if (row.status == '0') {
                    if (this.activeName == 'used') {
                        this.refreshUsedData()
                    } else {
                        this.refreshData('invalid')
                    }
                } else {//编辑
                    if (this.activeName == 'used') {
                        this.formFlag = 1
                        this.getUsedDetail(index, row)
                    } else {
                        this.formFlag = 2
                        this.getInvalidDetail(row.aviationnum)
                    }
                }
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
            this.goodtype=''
            this.formFlag = 0
            this.addForm = {}
            this.cargoTableData = []
            this.getAviationnumOptions()
            this.getStationOptions('始发站')
            this.getStationOptions('中转站')
            this.getStationOptions('目的站')
            this.getSendNameOptions()
            this.getReceiveNameOptions()
            this.getCurrentTime()
            this.addForm.carrier = Cookies.get('user')
            this.addForm.place = Cookies.get('dep')
            this.$api.tAviationnum.getStagingData().then(res => {
                console.log(res)
                if (res.status == 200) {
                    if (res.data != null) {
                        this.stagingFlag = 1
                        this.aviationnumOptions = [] // 存在暂存数据的时候，必须先处理暂存数据，下拉列表置空，不可选别的单号
                        var flightCompany = ''
                        if (res.data.deliverystation.indexOf("东航") > -1) {
                            res.data.deliverystationArray = ['东航', res.data.deliverystation]
                            flightCompany = '东航'
                        } else {
                            res.data.deliverystationArray = ['南航', res.data.deliverystation]
                            flightCompany = '南航'
                        }
                        this.addForm = Object.assign({}, res.data)
                        if (res.data.cargoTable != null && res.data.cargoTable != undefined) {
                            for (var i = 0; i < res.data.cargoTable.length; i++) {
                                this.cargoTableData.push(res.data.cargoTable[i])
                            }
                            if (this.cargoTableData.length > 0) {
                                this.goodtype = this.cargoTableData[0].rateclass
                                this.getFinalRatio()
                            }
                            this.$api.goods.searchGoods({//获取货物列表
                                airFight: flightCompany
                            }).then(res => {
                                if (res.status == 200) {
                                    this.goodsInfoOptions = res.data
                                }
                            })
                            this.getFlightOptions()//获取航班列表
                        }
                    } else {
                        this.stagingFlag = 0
                        this.addCargoTable()
                    }
                }
                this.dialogVisible = true;
            })
            this.addForm.invalidcharge = 0;
        },
        refreshUsedData() { // 更新已使用单号列表
            const columnFilter = {
                keywords: {name: 'keywords', value: this.keywords},
                date1: {name: 'date1', value: this.dateArray.length > 0 ? this.dateArray[0] : ''},
                date2: {name: 'date2', value: this.dateArray.length > 0 ? this.dateArray[1] : ''},
            }
            this.$api.tAviationnum.refreshUsedList({
                columnFilters: columnFilter,
                pageSize: this.usedPageSize,
                pageNum: this.usedCurrentPage
            }).then(res => {
                console.log(res)
                if (res.status == 200) {
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
                if (res.status == 200) {
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
                        let params = Object.assign({}, this.dataForm)
                        this.$api.tAviationnum.save(params).then((res) => {
                            if (res.status == 200) {
                                this.$message({message: '操作成功', type: 'success'})
                                this.$refs['dataForm'].resetFields()
                                this.singleDialogVisible = false
                                this.activeName = 'not_used'
                                this.refreshData('not_used')
                                this.getAviationnumOptions()
                            }
                        })
                    })
                }
            })
        },
        submitForm(formval, val, e) { // 制单----提交、作废、暂存、下一票
            if (val == 'staging') {
                this.addForm.delflag = -1;
            } else if (val == 'used') {
                this.addForm.delflag = 1;
            } else {
                this.addForm.delflag = 2
            }
            this.addForm.lastupdateby = Cookies.get('user')
            this.addForm.cargoTable = this.cargoTableData
            this.$refs[formval].validate((valid) => {
                const that = this
                console.log(valid)
                if (valid) {
                    if (val == 'invalid') {
                        this.invalidReasonDialogVisible = true
                    } else {
                        this.$api.tAviationnum.savetAviation(this.addForm).then(res => {
                            if (res.status == 200) {
                                that.$message({message: '操作成功', type: 'success'})
                                that.refreshUsedData()
                                that.refreshData("invalid")
                                that.refreshData("not_used")
                                this.$refs[formval].resetFields()
                                that.cargoTableData = []
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
        submitFormInvalid(formval) {
                this.$refs[formval].validate((valid) => {
                    if(valid){
                        this.addForm.cancelreason=this.invalidForm.cancelreason
                        this.addForm.invalidcharge=this.invalidForm.invalidcharge
                        this.addForm.weightcharge=0
                        if (this.stagingFlag == 0 && this.formFlag==0) {
                            this.$api.tAviationnum.savetAviation(this.addForm).then(res => {
                                console.log(res)
                                if (res.status == 200) {
                                    this.$message({message: '操作成功', type: 'success'})
                                    this.refreshUsedData()
                                    this.refreshData("invalid")
                                    this.refreshData("not_used")
                                    this.invalidReasonDialogVisible = false
                                    this.dialogVisible = false
                                    this.$refs['addForm'].resetFields()
                                    this.$refs[formval].resetFields()
                                }
                            })
                        } else {
                            this.$api.tAviationnum.editSubmittAviation(this.addForm).then(res => {
                                console.log(res)
                                if (res.status == 200) {
                                    this.$message({message: '操作成功', type: 'success'})
                                    this.refreshUsedData()
                                    this.refreshData("invalid")
                                    this.refreshData("not_used")
                                    this.invalidReasonDialogVisible = false
                                    this.dialogVisible = false
                                    this.$refs['addForm'].resetFields()
                                    this.$refs[formval].resetFields()
                                }
                            })
                        }
                    }
                })
        },
        editSubmit(formval, val, e) {
            if (val == 'staging') {
                this.addForm.delflag = -1;
            } else if (val == 'used') {
                this.addForm.delflag = 1;
            } else {
                this.addForm.delflag = 2
            }
            this.addForm.lastupdateby = Cookies.get('user')
            this.addForm.cargoTable = this.cargoTableData
            console.log(this.addForm)
            this.$refs[formval].validate((valid) => {
                const that = this
                if (valid) {
                    if ((val == 'invalid' && this.formFlag == 0)||(val == 'invalid' && this.formFlag == 1)) {
                        this.invalidReasonDialogVisible = true
                    } else {
                        this.$api.tAviationnum.editSubmittAviation(this.addForm).then(res => {
                            if (res.status == 200) {
                                that.$message({message: '操作成功', type: 'success'})
                                that.refreshUsedData()
                                that.refreshData("invalid")
                                that.refreshData("not_used")
                                this.$refs[formval].resetFields()
                                that.cargoTableData = []
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
        fileSuccess(res, file, fileList) {
            this.$message.success("文件上传成功")
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
        getFinalRatio() {
                console.log(this.goodtype)
            if (this.addForm.sendname != '' && this.addForm.sendname != undefined
                && this.goodtype != ''
                && this.addForm.flight != '' && this.addForm.flight != undefined
                && this.addForm.weightall != '' && this.addForm.weightall != undefined) {
                this.$api.ratio.getRatio({
                    sendName: this.addForm.sendname,
                    rateClass: this.goodtype,
                    flightNum: this.addForm.flight,
                    chargeWeight: this.addForm.weightall
                }).then(res => {
                    console.log(res)
                    if (res.status == 200) {
                        if (res.data.length > 0) {
                            this.finalRatio = res.data[0].ratio
                            const airfreightall=Number(this.addForm.weightall * this.finalRatio).toFixed(2)
                            // this.$set(this.addForm,'weightcharge',Number(this.addForm.weightall * this.finalRatio).toFixed(2))
                            if(this.addForm.delflag!=undefined&&this.addForm.delflag==2){
                                this.addForm.weightcharge=0
                            }else {
                                this.addForm.weightcharge=airfreightall
                            }
                            this.addForm = Object.assign({}, this.addForm)
                            this.addForm.total = Number(this.addForm.otherallcharges) + Number(this.addForm.weightcharge) + Number(this.addForm.makingcharge) + Number(this.addForm.invalidcharge)
                            for (let i = 0; i < this.cargoTableData.length; i++) {//费率变化--航空运费改变
                                this.cargoTableData[i].rate = res.data[0].ratio
                                this.cargoTableData[i].weightall = this.addForm.weightall
                                this.cargoTableData[i].airfreightall = airfreightall
                            }
                        } else {
                            this.$message.warning("当前无匹配费率，请重新选择！")
                            this.finalRatio = 0
                            this.addForm.weightcharge = 0
                            this.addForm = Object.assign({}, this.addForm)
                            this.addForm.total = Number(this.addForm.otherallcharges) + Number(this.addForm.weightcharge) + Number(this.addForm.makingcharge) + Number(this.addForm.invalidcharge)
                            for (var i = 0; i < this.cargoTableData.length; i++) {
                                this.cargoTableData[i].rate = 0
                                this.cargoTableData[i].weightall = this.addForm.weightall
                                this.cargoTableData[i].airfreightall = 0
                            }
                        }
                    }
                })
            } else {
                this.finalRatio = 0
            }
            return this.finalRatio
        }
    },
    mounted(){
        this.refreshUsedData()
        this.refreshData('invalid')
        this.refreshData('not_used')
    },
    watch: {
        cargoTableData: {
            handler(newarr, oldarr)
            { //
                this.addForm.rcpall = 0;//记录总件数
                let weightOldValue = this.addForm.weightall
                var weight_num = 0
                for (let i = 0; i < this.cargoTableData.length; i++) {
                    this.cargoTableData[i].rate = this.cargoTableData[0].rate
                    this.cargoTableData[i].tiji = Number(this.cargoTableData[i].chang * this.cargoTableData[i].kuan * this.cargoTableData[i].gao * this.cargoTableData[i].rcp / 1000000)
                    if (isNaN(this.cargoTableData[i].tiji)) {
                        this.cargoTableData[i].chargeweight = 0
                    } else {
                        this.cargoTableData[i].chargeweight = Number(this.cargoTableData[i].tiji * 1000 / 6).toFixed(2)//单个泡重
                    }
                    weight_num += Number(this.cargoTableData[i].chargeweight)//计算总的泡重
                    this.addForm.rcpall += Number(this.cargoTableData[i].rcp)
                    if (i > 0) {
                        this.cargoTableData[i].grossall = this.cargoTableData[0].grossall//给每条数据记录总毛重
                    }
                }
                if (this.cargoTableData.length > 0 && this.cargoTableData[0].grossall != undefined) {
                    this.addForm.weightall = Number(weight_num) > Number(this.cargoTableData[0].grossall) ? Math.ceil(weight_num) : Math.ceil(this.cargoTableData[0].grossall)
                } else {
                    this.addForm.weightall = 0
                }
                if (this.addForm.weightall != weightOldValue) {
                    this.getFinalRatio()
                }
                const airfreightall=Number(this.addForm.weightall * this.finalRatio).toFixed(2)
                if(this.addForm.delflag!=undefined&&this.addForm.delflag==2){
                    this.addForm.weightcharge=0
                }else {
                    this.addForm.weightcharge=airfreightall
                }
                this.addForm = Object.assign({}, this.addForm)
                for (let i = 0; i < this.cargoTableData.length; i++) {//给每条数据记录总航空费用
                    this.cargoTableData[i].weightall = this.addForm.weightall
                    this.cargoTableData[i].airfreightall = airfreightall
                }
            },
            immediate: true,
            deep: true
        },
        'addForm.weightcharge': {
            handler(newvalue, oldvalue) {
                this.addForm.total = Number(this.addForm.otherallcharges) + Number(this.addForm.weightcharge) + Number(this.addForm.makingcharge) + Number(this.addForm.invalidcharge)
            },
            immediate: true,
            deep: true
        },
        'addForm.otherallcharges': {
            handler(newvalue, oldvalue) {
                this.addForm.total = Number(this.addForm.otherallcharges) + Number(this.addForm.weightcharge) + Number(this.addForm.makingcharge) + Number(this.addForm.invalidcharge)
            },
            immediate: true,
            deep: true
        },
        'addForm.makingcharge': {
            handler(newvalue, oldvalue) {
                this.addForm.total = Number(this.addForm.otherallcharges) + Number(this.addForm.weightcharge) + Number(this.addForm.makingcharge) + Number(this.addForm.invalidcharge)
            },
            immediate: true,
            deep: true
        },
        'addForm.invalidcharge': {
            handler(newvalue, oldvalue) {
                this.addForm.total = Number(this.addForm.otherallcharges) + Number(this.addForm.weightcharge)
                    + Number(this.addForm.makingcharge) + Number(this.addForm.invalidcharge)
            },
            immediate: true,
            deep: true
        },
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

  .makeFormStyle /deep/ .el-dialog__body {
    padding: 10px 20px 20px 20px
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

  .makeFormStyle /deep/ .el-input.is-disabled .el-input__inner {
    color: #606266;
    border:1px solid #9e9e9eb5
  }

  .makeFormStyle /deep/ .el-input__inner {
    border:1px solid #9e9e9eb5
  }
  .makeFormStyle /deep/ .el-form-item.is-error .el-input__inner{
    border-color:#F56C6C
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

  .cargoTableStyle /deep/ .cell {
    padding-left: 5px;
    padding-right: 5px
  }

  .cargoTableStyle /deep/ .el-input__inner {
    padding: 0 0px
  }

  .form_input_style /deep/ .el-form-item__content {
    width: 60%;
  }

  .form_input_style /deep/ .el-input__inner {
    padding: 0 0px;
    width: 100%
  }

  .normal_circle {
    position: absolute;
    right: 180px;
    top: 60px;
    width: 32px;
    height: 10px;
    line-height: 15px;
    padding: 15px;
    color: #fff;
    font-weight: bold;
    text-align: center;
    word-break: break-all;
    border-radius: 50%;
    background-color: #5acc9b;
    background-position: right bottom;
    box-shadow: 0 0 0 1px #ffffff, 0 0 0 6px #5acc9b, 0 0 0 24px #fff, 0 0 0 26px #8fddbb, 0 0 0 30px #fff, 0 0 0 32px #dbf4ea;
    font-size: 16px;
    transform: rotate(-45deg);
  }

  .invalid_circle {
    position: absolute;
    right: 180px;
    top: 60px;
    width: 32px;
    height: 10px;
    line-height: 15px;
    padding: 15px;
    color: #fff;
    font-weight: bold;
    text-align: center;
    word-break: break-all;
    border-radius: 50%;
    background-color: #f44336;
    background-position: right bottom;
    box-shadow: 0 0 0 1px #ffffff, 0 0 0 6px #f44336, 0 0 0 24px #fff, 0 0 0 26px #f44336d4, 0 0 0 30px #fff, 0 0 0 32px #ff57227d;
    font-size: 16px;
    transform: rotate(-45deg);
  }
</style>
