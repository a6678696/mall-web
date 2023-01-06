<template>
  <el-dialog v-model="announcementDialogVisible" :title="dialogTitle" width="50%" :show-close="false"
             :close-on-click-modal="false">
    <el-form :model="announcementForm">
      <el-form-item label="标题" :label-width="formLabelWidth">
        <el-input v-model="announcementForm.title" type="textarea"/>
      </el-form-item>
      <el-form-item label="内容" :label-width="formLabelWidth">
        <el-input v-model="announcementForm.content" type="textarea" rows="4"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeAnnouncementDialog">关闭</el-button>
        <el-button type="primary" @click="saveAnnouncement" v-if="dialogType!==2">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
  <div>
    <el-input v-model="searchValue" v-on:keyup.enter="loadData" class="input-with-select" clearable
              style="width: 222px" placeholder="标题">
    </el-input>
    <el-button @click="loadData" style="margin-left: 2px">搜索</el-button>
    <el-button type="primary" style="float: right" @click="openAnnouncementDialog(1)">添加</el-button>
  </div>
  <div style="margin-top: 5px">
    <el-table :data="tableData" style="width: 100%" border="true">
      <el-table-column prop="addDate" label="发布时间" width="200" sortable align="center"/>
      <el-table-column prop="title" label="标题" width="300" align="center"/>
      <el-table-column prop="content" label="内容" width="700" align="center" show-overflow-tooltip/>
      <el-table-column fixed="right" label="操作" width="150" align="center">
        <template #default="scope">
          <el-button :icon="Search" circle @click="openAnnouncementDialog(2);getAnnouncementDetails(scope.row.id)"/>
          <el-button type="success" :icon="Edit" circle
                     @click="openAnnouncementDialog(3);getAnnouncementDetails(scope.row.id)"/>
          <el-popconfirm
              confirm-button-text="是"
              cancel-button-text="否"
              icon-color="#626AEF"
              title="你确定要删除这条公告吗?"
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

const searchValue = ref('');
const tableData = ref([]);
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});
const announcementDialogVisible = ref(false);
const dialogTitle = ref('');
const dialogType = ref(0);
const announcementForm = ref({
  id: 0,
  title: '',
  content: ''
});
const formLabelWidth = '70px'

//加载数据
const loadData = async () => {
  let params = new URLSearchParams();
  if (searchValue !== null) {
    params.append("title", searchValue.value);
  }
  params.append("page", pagination.value.currentPage);
  params.append("size", pagination.value.pageSize);
  let url = '/announcement/list';
  const result = await axiosUtil.get(url, params);
  if (result.data.code === 0) {
    tableData.value = result.data.announcementList;
    pagination.value.total = result.data.total;
  }
}

//刷新当前页
const handleCurrentChange = (currentPage) => {
  pagination.value.currentPage = currentPage;
  loadData();
}

//打开Dialog设置title
const openAnnouncementDialog = (type) => {
  if (type === 1) {
    dialogType.value = 1;
    dialogTitle.value = '添加公告';
    announcementDialogVisible.value = true;
  }
  if (type === 2) {
    dialogType.value = 2;
    dialogTitle.value = '查看公告';
    announcementDialogVisible.value = true;
  }
  if (type === 3) {
    dialogType.value = 3;
    dialogTitle.value = '修改公告';
    announcementDialogVisible.value = true;
  }
}

const closeAnnouncementDialog = () => {
  announcementDialogVisible.value = false;
  resetValue();
}

//添加或修改公告
const saveAnnouncement = async () => {
  let params = new URLSearchParams();
  if (announcementForm.value.id !== 0) {
    params.append("id", announcementForm.value.id);
  }
  let title = announcementForm.value.title;
  let content = announcementForm.value.content;
  if (title === '') {
    ElMessage.error("请输入标题");
    return false;
  }
  if (content === '') {
    ElMessage.error("请输入内容");
    return false;
  }
  params.append("title", title);
  params.append("content", content);
  let url = '/announcement/save';
  const result = await axiosUtil.post(url, params);
  if (result.data.code === 0) {
    announcementDialogVisible.value = false;
    ElMessage.success(result.data.msg);
    await loadData();
    resetValue();
  }
  if (result.data.code === 500) {
    ElMessage.error(result.data.msg);
  }
}

//根据id获取公告
const getAnnouncementDetails = async (id) => {
  if (id !== 0) {
    announcementForm.value.id = id;
  }
  let url = "/announcement/findById";
  let params = new URLSearchParams();
  params.append("id", id);
  const res = await axiosUtil.get(url, params);
  if (res.data.code === 0) {
    announcementForm.value.title = res.data.announcement.title;
    announcementForm.value.content = res.data.announcement.content;
  }
}

//重置值
const resetValue = () => {
  announcementForm.value.id = 0;
  announcementForm.value.title = '';
  announcementForm.value.content = '';
}

//删除公告
const confirmDelete = async (id) => {
  let params = new URLSearchParams();
  let url = '/announcement/delete';
  params.append("id", id);
  const result = await axiosUtil.post(url, params);
  if (result.data.code === 0) {
    ElMessage.success(result.data.msg);
    await loadData();
  }
  if (result.data.code === 500) {
    ElMessage.error(result.data.msg);
  }
}

onMounted(async () => {
  await loadData();
});
</script>

<style scoped>

</style>
