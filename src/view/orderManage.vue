<template>
  <div>
    <el-select clearable v-model="searchValue.optionsStateValue" placeholder="订单状态" style="width: 100px">
      <el-option
          v-for="item in optionsState"
          :key="item.value"
          :label="item.label"
          :value="item.value"
      />
    </el-select>
    <el-input v-model="searchValue.customerName" v-on:keyup.enter="loadData" class="input-with-select" clearable
              style="width: 222px;margin-left: 2px" placeholder="收货人">
    </el-input>
    <el-input v-model="searchValue.phoneNum" v-on:keyup.enter="loadData" class="input-with-select" clearable
              style="width: 222px;margin-left: 2px" placeholder="手机号">
    </el-input>
    <el-button @click="loadData" style="margin-left: 2px">搜索</el-button>
  </div>
  <div style="margin-top: 5px">
    <el-table :data="tableData" style="width: 100%" border="true">
      <el-table-column type="expand">
        <template #default="props">
          <el-table :data="props.row.orderGoodsList">
            <el-table-column prop="goods.cardImageName" label="展示图片" width="85" align="center">
              <template #default="scope">
                <el-image
                    :src="axiosUtil.getServerUrl('/image/goods/card/'+scope.row.goods.cardImageName)" :fit="fit"/>
              </template>
            </el-table-column>
            <el-table-column label="商品名称" prop="goods.name" align="center" width="400" show-overflow-tooltip/>
            <el-table-column label="分类" prop="goods.typeName" align="center" width="100"/>
            <el-table-column label="数量" prop="num" align="center" width="100"/>
            <el-table-column label="价格" prop="goods.price" align="center" width="100"/>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column prop="addDate" label="时间" width="200" sortable align="center"/>
      <el-table-column prop="price" label="价格" width="100" align="center"/>
      <el-table-column prop="state" label="状态" width="100" align="center">
        <template #default="scope">
          <strong v-show="scope.row.state===1" style="color: orange">已付款</strong>
          <strong v-show="scope.row.state===2" style="color: cornflowerblue">待付款</strong>
          <strong v-show="scope.row.state===3" style="color:red;">已取消</strong>
          <strong v-show="scope.row.state===4" style="color: green">已完成</strong>
        </template>
      </el-table-column>
      <el-table-column prop="phoneNum" label="手机号" width="120" align="center"/>
      <el-table-column prop="customerName" label="收货人" width="100" align="center"/>
      <el-table-column prop="address" label="收货地址" width="400" align="center" show-overflow-tooltip/>
      <el-table-column fixed="right" label="操作" width="150" align="center">
        <template #default="scope">
          <el-popconfirm
              confirm-button-text="是"
              cancel-button-text="否"
              icon-color="#626AEF"
              title="你确定要删除这个订单吗?"
              @confirm="confirmDelete(scope.row.id)"
          >
            <template #reference>
              <el-button type="danger" :icon="Delete" circle/>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <div class="demo-pagination-block" style="margin-top: 5px">
      <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :small="small"
          :disabled="disabled"
          layout="total,prev, pager, next, jumper"
          :total="pagination.total"
          @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from "vue";
import {Search, Edit, Delete} from "@element-plus/icons-vue";
import axiosUtil from '@/util/axios';

const searchValue = ref({
  customerName: '',
  optionsStateValue: null,
  phoneNum: ''
});
const optionsState = [
  {
    value: 1,
    label: '已付款',
  },
  {
    value: 2,
    label: '待付款',
  },
  {
    value: 3,
    label: '已取消',
  },
  {
    value: 4,
    label: '已完成',
  }
]
const tableData = ref([]);
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

//加载数据
const loadData = async () => {
  let params = new URLSearchParams();
  if (searchValue.value.customerName !== '') {
    params.append("customerName", searchValue.value.customerName);
  }
  if (searchValue.value.optionsStateValue !== null) {
    params.append("state", searchValue.value.optionsStateValue);
  }
  if (searchValue.value.phoneNum !== '') {
    params.append("phoneNum", searchValue.value.phoneNum);
  }
  params.append("currentPage", pagination.value.currentPage);
  params.append("pageSize", pagination.value.pageSize);
  let url = '/order/list';
  const res = await axiosUtil.get(url, params);
  tableData.value = res.data.orderList;
  pagination.value.total = res.data.total;
}

//刷新当前页
const handleCurrentChange = (currentPage) => {
  pagination.value.currentPage = currentPage;
  loadData();
}

//删除订单
const confirmDelete = async (id) => {
  let params = new URLSearchParams();
  let url = '/order/delete';
  params.append("id", id);
  const res = await axiosUtil.post(url, params);
  if (res.data.code === 0) {
    ElMessage.success(res.data.msg);
    await loadData();
  }
  if (res.data.code === 500) {
    ElMessage.error(res.data.msg);
  }
}

onMounted(async () => {
  await loadData();
});
</script>

<style scoped>

</style>
