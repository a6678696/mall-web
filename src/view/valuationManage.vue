<template>
  <div>
    <el-input v-model="searchValue" v-on:keyup.enter="loadData" class="input-with-select" clearable
              style="width: 222px" placeholder="商品名称">
    </el-input>
    <el-button @click="loadData" style="margin-left: 2px">搜索</el-button>
  </div>
  <div style="margin-top: 5px">
    <el-table :data="tableData" style="width: 100%" border="true">
      <el-table-column fixed prop="cardImageName" label="展示图片" width="85" align="center">
        <template #default="scope">
          <el-image
              :src="axiosUtil.getServerUrl('/image/goods/card/'+scope.row.goods.cardImageName)" :fit="fit"/>
        </template>
      </el-table-column>
      <el-table-column fixed prop="goods.name" label="商品名称" width="200" align="center"/>
      <el-table-column prop="addDate" label="发布时间" width="200" sortable align="center"/>
      <el-table-column prop="customer.nickName" label="评价人" width="200" align="center"/>
      <el-table-column prop="rate" label="评分" width="200" align="center">
        <template #default="scope">
          <el-rate v-model="scope.row.rate" disabled/>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="内容" width="600" align="center" show-overflow-tooltip/>
      <el-table-column fixed="right" label="操作" width="100" align="center">
        <template #default="scope">
          <el-popconfirm
              confirm-button-text="是"
              cancel-button-text="否"
              icon-color="#626AEF"
              title="你确定要删除这条评价吗?"
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

const searchValue = ref('')
const tableData = ref([])
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

//加载数据
const loadData = async () => {
  let params = new URLSearchParams();
  if (searchValue.value !== '') {
    params.append("goodsName", searchValue.value);
  }
  params.append("currentPage", pagination.value.currentPage);
  params.append("pageSize", pagination.value.pageSize);
  let url = '/valuation/list';
  const res = await axiosUtil.get(url, params);
  tableData.value = res.data.valuationList;
  pagination.value.total = res.data.total;
}

//刷新当前页
const handleCurrentChange = (currentPage) => {
  pagination.value.currentPage = currentPage;
  loadData();
}

//删除评价
const confirmDelete = async (id) => {
  let params = new URLSearchParams();
  let url = '/valuation/delete';
  params.append("id", id);
  const res = await axiosUtil.post(url, params);
  if (res.data.code === 0) {
    ElMessage.success(res.data.msg);
    await loadData();
  } else if (res.data.code === 500) {
    ElMessage.error(res.data.msg);
  }
}

onMounted(async () => {
  await loadData();
});
</script>

<style scoped>

</style>
