<template>
  <el-dialog
      v-model="smallTypeDialogVisible"
      :title="dialogTitle"
      width="40%"
      :show-close="false"
      :close-on-click-modal="false"
  >
    <el-form :model="smallTypeForm">
      <el-form-item label="名称" :label-width="formLabelWidth">
        <el-input v-model="smallTypeForm.name"/>
      </el-form-item>
      <el-form-item label="商品大类" :label-width="formLabelWidth">
        <el-select
            v-model="smallTypeForm.bigTypeId"
            filterable
            placeholder="请选择商品大类..."
        >
          <el-option
              v-for="item in allBigTypeList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="排列顺序" :label-width="formLabelWidth">
        <el-input-number
            v-model="smallTypeForm.sortNum"
            :min="1"
            :max="100"
            controls-position="right"
            value-on-clear="min"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeSmallTypeDialog">关闭</el-button>
        <el-button
            type="primary"
            @click="saveSmallType"
            v-if="dialogType !== 2"
        >
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
  <div>
    <el-select
        v-model="searchValue.bigTypeId"
        filterable
        clearable
        placeholder="商品大类"
        style="width: 222px"
    >
      <el-option
          v-for="item in allBigTypeList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
      />
    </el-select>
    <el-input
        v-model="searchValue.name"
        v-on:keyup.enter="loadData"
        class="input-with-select"
        clearable
        style="width: 222px;margin-left: 2px"
        placeholder="名称"
    >
    </el-input>
    <el-button @click="loadData" style="margin-left: 2px">搜索</el-button>
    <el-button
        type="primary"
        style="float: right"
        @click="openSmallTypeDialog(1)"
    >添加
    </el-button
    >
  </div>
  <div style="margin-top: 5px">
    <el-table :data="tableData" style="width: 100%" border="true">
      <el-table-column prop="name" label="名称" align="center"/>
      <el-table-column
          prop="bigTypeName"
          label="商品大类名称"
          sortable
          align="center"
      />
      <el-table-column
          prop="sortNum"
          label="排列顺序"
          align="center"
          sortable
          show-overflow-tooltip
      />
      <el-table-column fixed="right" label="操作" width="150" align="center">
        <template #default="scope">
          <el-button
              :icon="Search"
              circle
              @click="
              openSmallTypeDialog(2);
              getSmallTypeDetails(scope.row.id);
            "
          />
          <el-button
              type="success"
              :icon="Edit"
              circle
              @click="
              openSmallTypeDialog(3);
              getSmallTypeDetails(scope.row.id);
            "
          />
          <el-popconfirm
              confirm-button-text="是"
              cancel-button-text="否"
              icon-color="#626AEF"
              title="你确定要删除这个商品小类吗?"
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
  name: "",
  bigTypeId: undefined,
});
const tableData = ref([]);
const smallTypeDialogVisible = ref(false);
const dialogTitle = ref("");
const dialogType = ref(0);
const smallTypeForm = ref({
  id: 0,
  name: "",
  sortNum: 1,
  bigTypeId: 0,
});
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});
const allBigTypeList = ref();
const formLabelWidth = "70px";

//加载数据
const loadData = async () => {
  let params = new URLSearchParams();
  if (searchValue.value.name !== "") {
    params.append("name", searchValue.value.name);
  }
  if (searchValue.value.bigTypeId !== undefined) {
    params.append("bigTypeId", searchValue.value.bigTypeId);
  }
  params.append("currentPage", pagination.value.currentPage);
  params.append("pageSize", pagination.value.pageSize);
  let url = "/smallType/list";
  const res = await axiosUtil.get(url, params);
  tableData.value = res.data.smallTypeList;
  pagination.value.total = res.data.total;
  let url2 = "/bigType/getAllBigType";
  const res2 = await axiosUtil.get(url2);
  allBigTypeList.value = res2.data.allBigTypeList;
  smallTypeForm.value.bigTypeId = allBigTypeList.value[0].id;
}

//刷新当前页
const handleCurrentChange = (currentPage) => {
  pagination.value.currentPage = currentPage;
  loadData();
}

//打开Dialog设置title
const openSmallTypeDialog = (type) => {
  if (type === 1) {
    dialogType.value = 1;
    dialogTitle.value = "添加商品小类";
    smallTypeDialogVisible.value = true;
  }
  if (type === 2) {
    dialogType.value = 2;
    dialogTitle.value = "查看商品小类";
    smallTypeDialogVisible.value = true;
  }
  if (type === 3) {
    dialogType.value = 3;
    dialogTitle.value = "修改商品小类";
    smallTypeDialogVisible.value = true;
  }
}

//关闭Dialog
const closeSmallTypeDialog = () => {
  smallTypeDialogVisible.value = false;
  resetValue();
}

//添加或修改商品小类
const saveSmallType = async () => {
  let params = new URLSearchParams();
  if (smallTypeForm.value.id !== 0) {
    params.append("id", smallTypeForm.value.id);
  }
  let name = smallTypeForm.value.name;
  let sortNum = smallTypeForm.value.sortNum;
  if (name === "") {
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
  let bigTypeId = smallTypeForm.value.bigTypeId;
  params.append("bigTypeId", bigTypeId);
  params.append("name", name);
  params.append("sortNum", sortNum);
  let url = "/smallType/save";
  const res = await axiosUtil.post(url, params);
  if (res.data.code === 0) {
    smallTypeDialogVisible.value = false;
    ElMessage.success(res.data.msg);
    await loadData();
    resetValue();
  } else if (res.data.code === 500) {
    ElMessage.error(res.data.msg);
  }
}

//根据id获取商品小类
const getSmallTypeDetails = async (id) => {
  if (id !== 0) {
    smallTypeForm.value.id = id;
  }
  let url = '/smallType/findById';
  let params = new URLSearchParams();
  params.append("id", id);
  const res = await axiosUtil.get(url, params);
  smallTypeForm.value.name = res.data.smallType.name;
  smallTypeForm.value.sortNum = res.data.smallType.sortNum;
  smallTypeForm.value.bigTypeId = res.data.smallType.bigTypeId;
}

//重置值
const resetValue = () => {
  smallTypeForm.value.id = 0;
  smallTypeForm.value.name = "";
  smallTypeForm.value.sortNum = 0;
}

//删除商品小类
const confirmDelete = async (id) => {
  let params = new URLSearchParams();
  params.append("id", id);
  let url = '/smallType/delete';
  const res = await axiosUtil.post(url, params);
  if (res.data.code === 0) {
    ElMessage.success(res.data.msg);
    await loadData();
  }
  if (res.data.code === 500) {
    ElMessage.error(res.data.msg);
  }
};

onMounted(async () => {
  await loadData();
});
</script>

<style scoped>
</style>
