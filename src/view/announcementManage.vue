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
              style="width: 333px" placeholder="根据标题搜索">
      <template #append>
        <el-button :icon="Search" @click="loadData"/>
      </template>
    </el-input>
    <el-button type="primary" style="margin-left: 3px" @click="openAnnouncementDialog(1)">添加</el-button>
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
          v-model:current-page="page"
          v-model:page-size="size"
          :small="small"
          :disabled="disabled"
          layout="total,prev, pager, next, jumper"
          :total="total"
          @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from "vue";
import {Search, Edit, Delete} from "@element-plus/icons-vue";
import {getServerUrl} from "@/util/url";
import axios from "axios";

const searchValue = ref('');
const tableData = ref([]);
const page = ref(1);
const size = ref(9);
const total = ref(0);
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
const loadData = () => {
  let param = new URLSearchParams();
  if (searchValue !== null) {
    param.append("title", searchValue.value);
  }
  param.append("page", page.value);
  param.append("size", size.value);
  let url = getServerUrl('/announcement/list');
  axios
      .get(url, {params: param})
      .then(function (response) {
        tableData.value = response.data.announcementList;
        total.value = response.data.total;
      })
      .catch(function (error) {
        console.log(error);
      });
}

//刷新当前页
const handleCurrentChange = (currentPage) => {
  page.value = currentPage;
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
const saveAnnouncement = () => {
  let param = new URLSearchParams();
  if (announcementForm.value.id !== 0) {
    param.append("id", announcementForm.value.id);
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
  param.append("title", title);
  param.append("content", content);
  let url = getServerUrl('/announcement/save');
  axios.post(url, param).then(function (response) {
    if (response.data.code === 0) {
      announcementDialogVisible.value = false;
      ElMessage.success(response.data.msg);
      loadData();
      resetValue();
    }
    if (response.data.code === 500) {
      ElMessage.error(response.data.msg);
    }
  }).catch(function (error) {
    ElMessage.success(response.data.msg);
  })
}

//根据id获取公告
const getAnnouncementDetails = (id) => {
  if (id !== 0) {
    announcementForm.value.id = id;
  }
  let url = getServerUrl("/announcement/findById?id=" + id);
  axios.get(url).then(function (response) {
    announcementForm.value.title = response.data.announcement.title;
    announcementForm.value.content = response.data.announcement.content;
  }).catch(function (error) {

  })
}

//重置值
const resetValue = () => {
  announcementForm.value.id = 0;
  announcementForm.value.title = '';
  announcementForm.value.content = '';
}

//删除公告
const confirmDelete = (id) => {
  let param = new URLSearchParams();
  let url = getServerUrl('/announcement/delete');
  param.append("id", id);
  axios.post(url, param).then(function (response) {
    if (response.data.code === 0) {
      ElMessage.success(response.data.msg);
      loadData();
    }
    if (response.data.code === 500) {
      ElMessage.error(response.data.msg);
    }
  }).catch(function (error) {
    console.log(error);
  })
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>

</style>
