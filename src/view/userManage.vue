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
      <el-table-column prop="id" label="编号" width="100" align="center"/>
      <el-table-column prop="cardImageName" label="头像" width="85" align="center">
        <template #default="scope">
          <el-image
              :src="getServerUrl('')+'/image/customer/avatar/'+scope.row.avatarImageName" :fit="fit"/>
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
import {getServerUrl} from "@/util/url";
import axios from "axios";

const searchValue = ref({
  id: '',
  nickName: ''
});
const tableData = ref([]);
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});
const formLabelWidth = '70px'

//加载数据
const loadData = () => {
  let param = new URLSearchParams();
  if (searchValue.value.nickName !== '') {
    param.append("nickName", searchValue.value.nickName);
  }
  if (searchValue.value.id !== '') {
    param.append("id", searchValue.value.id);
  }
  param.append("currentPage", pagination.value.currentPage);
  param.append("pageSize", pagination.value.pageSize);
  let url = getServerUrl('/customer/list');
  axios
      .get(url, {params: param})
      .then(function (response) {
        tableData.value = response.data.customerList;
        pagination.value.total = response.data.total;
      })
      .catch(function (error) {
        console.log(error);
      });
}

//刷新当前页
const handleCurrentChange = (currentPage) => {
  pagination.value.currentPage = currentPage;
  loadData();
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>

</style>
