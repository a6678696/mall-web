<template>
  <el-dialog v-model="bigTypeDialogVisible" :title="dialogTitle" width="40%" :show-close="false"
             :close-on-click-modal="false">
    <el-form :model="bigTypeForm">
      <el-form-item label="名称" :label-width="formLabelWidth">
        <el-input v-model="bigTypeForm.name"/>
      </el-form-item>
      <el-form-item label="排列顺序" :label-width="formLabelWidth">
        <el-input-number v-model="bigTypeForm.sortNum" :min="1" :max="100" controls-position="right"
                         value-on-clear="min"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeBigTypeDialog">关闭</el-button>
        <el-button type="primary" @click="saveBigType" v-if="dialogType!==2">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
  <div>
    <el-input v-model="searchValue" v-on:keyup.enter="loadData" class="input-with-select" clearable
              style="width: 222px" placeholder="名称">
    </el-input>
    <el-button @click="loadData" style="margin-left: 2px">搜索</el-button>
    <el-button type="primary" style="float: right" @click="openBigTypeDialog(1)">添加</el-button>
  </div>
  <div style="margin-top: 5px">
    <el-table :data="tableData" style="width: 100%" border="true">
      <el-table-column prop="name" label="名称" align="center"/>
      <el-table-column prop="sortNum" label="排列顺序" align="center"/>
      <el-table-column prop="smallTypeNum" label="小类数量" align="center"/>
      <el-table-column fixed="right" label="操作" width="150" align="center">
        <template #default="scope">
          <el-button :icon="Search" circle @click="openBigTypeDialog(2);getBigTypeDetails(scope.row.id)"/>
          <el-button type="success" :icon="Edit" circle
                     @click="openBigTypeDialog(3);getBigTypeDetails(scope.row.id)"/>
          <el-popconfirm
              confirm-button-text="是"
              cancel-button-text="否"
              icon-color="#626AEF"
              title="你确定要删除这个商品大类吗?"
              @confirm="confirmDelete(scope.row.id,scope.row.smallTypeNum)"
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

const searchValue = ref('');
const tableData = ref([]);
const bigTypeDialogVisible = ref(false);
const dialogTitle = ref('');
const dialogType = ref(0);
const bigTypeForm = ref({
  id: 0,
  name: '',
  sortNum: 1
});
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
});
const formLabelWidth = '70px'

//加载数据
const loadData = async () => {
  let params = new URLSearchParams();
  if (searchValue !== null) {
    params.append("name", searchValue.value);
  }
  params.append("currentPage", pagination.value.currentPage);
  params.append("pageSize", pagination.value.pageSize);
  let url = '/bigType/list';
  const res = await axiosUtil.get(url, params);
  tableData.value = res.data.bigTypeList;
  pagination.value.total = res.data.total;
}

//刷新当前页
const handleCurrentChange = (currentPage) => {
  pagination.value.currentPage = currentPage;
  loadData();
}

//打开Dialog设置title
const openBigTypeDialog = (type) => {
  if (type === 1) {
    dialogType.value = 1;
    dialogTitle.value = '添加商品大类';
    bigTypeDialogVisible.value = true;
  }
  if (type === 2) {
    dialogType.value = 2;
    dialogTitle.value = '查看商品大类';
    bigTypeDialogVisible.value = true;
  }
  if (type === 3) {
    dialogType.value = 3;
    dialogTitle.value = '修改商品大类';
    bigTypeDialogVisible.value = true;
  }
}

const closeBigTypeDialog = () => {
  bigTypeDialogVisible.value = false;
  resetValue();
}

//添加或修改商品大类
const saveBigType = async () => {
  let params = new URLSearchParams();
  if (bigTypeForm.value.id !== 0) {
    params.append("id", bigTypeForm.value.id);
  }
  let name = bigTypeForm.value.name;
  let sortNum = bigTypeForm.value.sortNum;
  if (name === '') {
    ElMessage.error("请输入名称");
    return false;
  }
  if (sortNum === 0) {
    ElMessage.error("请输入排列顺序");
    return false;
  } else {
    if (sortNum < 0) {
      ElMessage.error("排列顺序的数字要大于0");
      return false;
    }
  }
  params.append("name", name);
  params.append("sortNum", sortNum);
  let url = '/bigType/save';
  const res = await axiosUtil.post(url, params);
  if (res.data.code === 0) {
    bigTypeDialogVisible.value = false;
    ElMessage.success(res.data.msg);
    await loadData();
    resetValue();
  } else if (res.data.code === 500) {
    ElMessage.error(res.data.msg);
  }
}

//根据id获取商品大类
const getBigTypeDetails = async (id) => {
  if (id !== 0) {
    bigTypeForm.value.id = id;
  }
  let url = "/bigType/findById";
  let params = new URLSearchParams();
  params.append("id", id);
  const res = await axiosUtil.get(url, params);
  bigTypeForm.value.name = res.data.bigType.name;
  bigTypeForm.value.sortNum = res.data.bigType.sortNum;
}

//重置值
const resetValue = () => {
  bigTypeForm.value.id = 0;
  bigTypeForm.value.name = '';
  bigTypeForm.value.sortNum = 0;
}

//删除商品大类
const confirmDelete = async (id, smallTypeNum) => {
  if (smallTypeNum !== 0) {
    ElMessage.error("你要删除的商品大类下有" + smallTypeNum + "个商品小类，删除前请删除所有商品小类");
    return false;
  }
  let params = new URLSearchParams();
  params.append("id", id);
  let url = '/bigType/delete';
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
