<template>
  <main class="login-page">
    <section class="login-visual">
      <h1>Quant Trading Assistant</h1>
      <p>面向量化投研团队的策略监控、回测分析、模拟交易与风险管理工作台。</p>
      <div class="market-strip">
        <div>
          <span>策略胜率</span>
          <strong>63.8%</strong>
        </div>
        <div>
          <span>模拟净值</span>
          <strong>1.1842</strong>
        </div>
        <div>
          <span>风险状态</span>
          <strong>Normal</strong>
        </div>
      </div>
    </section>

    <section class="login-card-wrap">
      <el-card class="login-card" shadow="never">
        <h2>登录平台</h2>
        <p>使用量化投研账号进入系统</p>
        <el-form ref="formRef" :model="form" :rules="rules" size="large" @keyup.enter="handleLogin">
          <el-form-item prop="username">
            <el-input v-model="form.username" placeholder="用户名" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="form.password" type="password" placeholder="密码" show-password />
          </el-form-item>
          <el-button type="primary" size="large" class="login-button" :loading="loading" @click="handleLogin">
            登录
          </el-button>
        </el-form>
      </el-card>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useUserStore } from '@/stores/user';

interface LoginForm {
  username: string;
  password: string;
}

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const formRef = ref<FormInstance>();
const loading = ref(false);

const form = reactive<LoginForm>({
  username: 'analyst',
  password: ''
});

const rules: FormRules<LoginForm> = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

const handleLogin = async () => {
  if (!formRef.value) {
    return;
  }

  await formRef.value.validate();
  loading.value = true;

  window.setTimeout(() => {
    userStore.login(form.username, 'mock-token');
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard';
    router.push(redirect);
    loading.value = false;
  }, 300);
};
</script>

<style scoped>
.login-button {
  width: 100%;
}
</style>
