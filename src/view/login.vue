<template>
  <div class="bg_pic">
    <div class="title-and-card">
      <p class="logo">
        <img src="@/assets/images/logo.png" height="66" alt="logo"/>
      </p>
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>管理员登录</span>
          </div>
        </template>
        <el-form :model="form" :rules="rules">
          <el-form-item prop="userName">
            <el-input
                v-model="form.userName"
                clearable
                placeholder="请输入用户名..."
                :prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
                type="password"
                v-model="form.password"
                clearable
                show-password
                placeholder="请输入密码..."
                :prefix-icon="Lock"
            />
          </el-form-item>
          <div class="login-btn">
            <el-button type="primary" @click="handleLogin">登录</el-button>
          </div>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import {ref} from "vue";
import {Lock, User} from "@element-plus/icons-vue";
import router from "@/router";
import axiosUtil from '@/util/axios';

const form = ref({
  userName: "",
  password: "",
});

const rules = {
  userName: [{required: true, message: "请输入用户名", trigger: "blur"}],
  password: [{required: true, message: "请输入密码", trigger: "blur"}],
};

const handleLogin = async () => {
  if (form.value.userName === "") {
    ElMessage.error("用户名不能为空");
    return false;
  }
  if (form.value.password === "") {
    ElMessage.error("密码不能为空");
    return false;
  }
  let params = new URLSearchParams();
  params.append("userName", form.value.userName);
  params.append("password", form.value.password);
  let url = '/administrator/login';
  try {
    const result = await axiosUtil.get(url, params);
    if (result.data.code === 0) {
      window.sessionStorage.setItem("userName", result.data.userName);
      window.sessionStorage.setItem("administratorId", result.data.id);
      window.sessionStorage.setItem("token", result.data.token);
      router.replace('/main');
    } else if (result.data.code === 500) {
      ElMessage.error(result.data.msg);
    }
  } catch (err) {
    console.log("error:" + err);
    ElMessage.error("服务器出错，请联系管理员！");
  }
}
</script>

<style scoped>
.bg_pic {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-width: 1000px;
  z-index: -10;
  zoom: 1;
  background-color: #fff;
  background-image: url(../assets/images/bg.jpeg);
  background-repeat: no-repeat;
  background-size: cover;
  -webkit-background-size: cover;
  -o-background-size: cover;
  background-position: center 0;
}

.bg_pic .title-and-card {
  margin-top: 6%;
}

.logo {
  text-align: center;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.box-card {
  width: 32%;
  margin-left: 34%;
}

.login-btn {
  text-align: center;
}
</style>
