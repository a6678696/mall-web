<template>
  <div>
    <el-input v-model="searchValue.id" v-on:keyup.enter="loadData" class="input-with-select" clearable
              style="width: 111px" placeholder="编号"></el-input>
    <el-input v-model="searchValue.nickName" v-on:keyup.enter="loadData" class="input-with-select" clearable
              style="width: 222px;margin-left: 2px" placeholder="昵称">
    </el-input>
    <el-button @click="loadData" style="margin-left: 2px">搜索</el-button>
  </div>
  <div style="margin-top: 5px">
    <el-table :data="tableData" style="width: 100%" border="true">
      <el-table-column type="expand">
        <template #default="props">
          <el-table :data="props.row.addressList">
            <el-table-column label="收货人名称" prop="name" align="center" width="100" show-overflow-tooltip/>
            <el-table-column label="手机号" prop="phoneNum" align="center" width="150"/>
            <el-table-column label="省市区" prop="area" align="center" width="300"/>
            <el-table-column label="详细地址" prop="details" align="center" width="200"/>
            <el-table-column label="是否是默认收货地址" prop="goods.price" align="center" width="200">
              <template #default="scope">
                <strong v-show="scope.row.isSelected" style="color: red">是</strong>
                <strong v-show="!scope.row.isSelected">否</strong>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="编号" width="100" align="center"/>
      <el-table-column prop="cardImageName" label="头像" width="85" align="center">
        <template #default="scope">
          <el-image
              :src="axiosUtil.getServerUrl('/image/customer/avatar/'+scope.row.avatarImageName)" :fit="fit"/>
        </template>
      </el-table-column>
      <el-table-column prop="nickName" label="昵称" width="300" align="center"/>
      <el-table-column prop="openid" label="openid" align="center"/>
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
import axiosUtil from '@/util/axios';

const searchValue = ref({
  id: '',
  nickName: ''
});
const tableData = ref([])
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})
const formLabelWidth = '70px'

//加载数据
const loadData = async () => {
  let params = new URLSearchParams();
  if (searchValue.value.nickName !== '') {
    params.append("nickName", searchValue.value.nickName);
  }
  if (searchValue.value.id !== '') {
    params.append("id", searchValue.value.id);
  }
  params.append("currentPage", pagination.value.currentPage);
  params.append("pageSize", pagination.value.pageSize);
  let url = '/customer/list';
  const res = await axiosUtil.get(url, params);
  tableData.value = res.data.customerList;
  pagination.value.total = res.data.total;
}

//刷新当前页
const handleCurrentChange = (currentPage) => {
  pagination.value.currentPage = currentPage;
  loadData();
}

onMounted(async () => {
  await loadData();
});
</script>

<style scoped>

</style>
