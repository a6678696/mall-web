<template>
  <el-dialog v-model="modifyDialogVisible" title="修改密码" width="40%">
    <el-form :model="modifyPasswordForm">
      <el-form-item label="密码" :label-width="formLabelWidth">
        <el-input v-model="modifyPasswordForm.password1" type="password" autocomplete="off" clearable show-password/>
      </el-form-item>
      <el-form-item label="确认密码" :label-width="formLabelWidth">
        <el-input v-model="modifyPasswordForm.password2" type="password" autocomplete="off" clearable show-password/>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="modifyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="modifyPassword">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
  <el-row class="tac" :gutter="2">
    <el-col :span="4">
      <el-menu background-color="#334256" class="el-menu-vertical-demo el-menu" text-color="#fff" default-active="1"
               style="height: 100%">
        <el-menu-item>
          <img src="@/assets/images/logo2.png" style="width: 100%">
        </el-menu-item>
        <a @click="changCurrentCom('announcementManage')">
          <el-menu-item index="1">
            <el-icon>
              <Bell/>
            </el-icon>
            <span>公告管理</span>
          </el-menu-item>
        </a>
        <a @click="changCurrentCom('userManage')">
          <el-menu-item index="2">
            <el-icon>
              <User/>
            </el-icon>
            <span>用户管理</span>
          </el-menu-item>
        </a>
        <el-sub-menu index="3">
          <template #title>
            <el-icon>
              <Tickets/>
            </el-icon>
            <span>商品分类管理</span>
          </template>
          <a @click="changCurrentCom('bigTypeManage')">
            <el-menu-item index="3-1">
              <el-icon>
                <DocumentRemove/>
              </el-icon>
              商品大类
            </el-menu-item>
          </a>
          <a @click="changCurrentCom('smallTypeManage')">
            <el-menu-item index="3-2">
              <el-icon>
                <DocumentRemove/>
              </el-icon>
              商品小类
            </el-menu-item>
          </a>
        </el-sub-menu>
        <a @click="changCurrentCom('goodsManage')">
          <el-menu-item index="4">
            <el-icon>
              <Goods/>
            </el-icon>
            <span>商品管理</span>
          </el-menu-item>
        </a>
        <a @click="changCurrentCom('orderManage')">
          <el-menu-item index="5">
            <el-icon>
              <CollectionTag/>
            </el-icon>
            <span>订单管理</span>
          </el-menu-item>
        </a>
        <a @click="changCurrentCom('valuationManage')">
          <el-menu-item index="6">
            <el-icon>
              <ChatDotRound/>
            </el-icon>
            <span>评价管理</span>
          </el-menu-item>
        </a>
      </el-menu>
    </el-col>
    <el-col :span="20">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <el-breadcrumb>
              <el-breadcrumb-item><strong>首页</strong></el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentBreadName }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div>
              <el-dropdown>
                <span class="el-dropdown-link">
                  <el-avatar :size="28" src="https://image.zoutl.cn/hexo-blog/images/logo.png"/>
                  <el-icon class="el-icon--right">
                    <CaretBottom/>
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="modifyDialogVisible = true">
                      <el-icon>
                        <EditPen/>
                      </el-icon>
                      修改密码
                    </el-dropdown-item>
                    <el-dropdown-item @click="logout">
                      <el-icon>
                        <SwitchButton/>
                      </el-icon>
                      注销
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </template>
        <component :is="currentCom"></component>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import {ref, shallowRef} from "vue";
import {
  Bell,
  User,
  Tickets,
  DocumentRemove,
  Goods,
  SwitchButton,
  CollectionTag,
  CaretBottom,
  EditPen,
  ChatDotRound
} from "@element-plus/icons-vue";
import announcementManage from '@/view/announcementManage.vue'
import userManage from '@/view/userManage.vue'
import bigTypeManage from '@/view/bigTypeManage.vue'
import smallTypeManage from '@/view/smallTypeManage.vue'
import goodsManage from '@/view/goodsManage.vue'
import orderManage from '@/view/orderManage.vue'
import valuationManage from '@/view/valuationManage.vue'
import router from "@/router";
import axiosUtil from '@/util/axios';

const currentCom = shallowRef(announcementManage);
const currentBreadName = ref('公告管理');
const modifyDialogVisible = ref(false);
const modifyPasswordForm = ref({
  password1: '',
  password2: ''
});
const formLabelWidth = '70px'

//切换页面
const changCurrentCom = (currentComName) => {
  if (currentComName === "userManage") {
    currentCom.value = userManage;
    currentBreadName.value = "用户管理";
  }
  if (currentComName === "announcementManage") {
    currentCom.value = announcementManage;
    currentBreadName.value = "公告管理";
  }
  if (currentComName === "bigTypeManage") {
    currentCom.value = bigTypeManage;
    currentBreadName.value = "商品分类管理 / 商品大类";
  }
  if (currentComName === "smallTypeManage") {
    currentCom.value = smallTypeManage;
    currentBreadName.value = "商品分类管理 / 商品小类";
  }
  if (currentComName === "goodsManage") {
    currentCom.value = goodsManage;
    currentBreadName.value = "商品管理";
  }
  if (currentComName === "orderManage") {
    currentCom.value = orderManage;
    currentBreadName.value = "订单管理";
  }
  if (currentComName === "valuationManage") {
    currentCom.value = valuationManage;
    currentBreadName.value = "评价管理";
  }
}

//注销登录
const logout = () => {
  ElMessageBox
      .confirm(
          '你确定要注销登录吗?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
      )
      .then(() => {
        window.sessionStorage.clear();
        router.replace('/');
      })
      .catch(() => {

      })
}

//修改密码
const modifyPassword = async () => {
  let password1 = modifyPasswordForm.value.password1;
  let password2 = modifyPasswordForm.value.password2;
  if (password1 === '' || password2 === '') {
    ElMessage.error("密码或确认密码不能为空");
    return false;
  } else {
    if (password1 !== password2) {
      ElMessage.error("你输入的密码和确认密码不相同,请重新输入");
      return false;
    }
  }
  let administratorId = window.sessionStorage.getItem("administratorId");
  let params = new URLSearchParams();
  params.append("administratorId", administratorId);
  params.append("password", modifyPasswordForm.value.password1);
  let url = '/administrator/modifyPassword';
  const res = await axiosUtil.post(url, params);
  if (res.data.code === 0) {
    ElMessage.success(res.data.msg);
    modifyDialogVisible.value = false;
  }
  if (res.data.code === 500) {
    ElMessage.error(res.data.msg);
  }
}
</script>

<style scoped>
.el-menu {
  height: 97vh
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
