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
        <p>使用后端账号进入系统</p>
        <el-form ref="formRef" :model="form" :rules="rules" size="large" @keyup.enter="handleLogin">
          <el-form-item prop="username">
            <el-input v-model.trim="form.username" placeholder="用户名" />
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
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { login } from '@/api/auth';
import { useUserStore } from '@/stores/user';
import type { LoginResponse } from '@/types/auth';

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
  username: 'admin',
  password: ''
});

const rules: FormRules<LoginForm> = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

const normalizeLoginResponse = (result: unknown): LoginResponse | undefined => {
  const directResult = result as Partial<LoginResponse>;

  if (directResult.token && directResult.user) {
    return directResult as LoginResponse;
  }

  const nestedResult = result as { data?: Partial<LoginResponse> };

  if (nestedResult.data?.token && nestedResult.data.user) {
    return nestedResult.data as LoginResponse;
  }

  return undefined;
};

const handleLogin = async () => {
  if (!formRef.value) {
    return;
  }

  await formRef.value.validate();
  loading.value = true;

  try {
    const result = normalizeLoginResponse(await login({
      username: form.username,
      password: form.password
    }));

    if (!result) {
      ElMessage.error('登录响应缺少 token，请检查后端返回结构');
      return;
    }

    userStore.setLoginSession(result.token, result.user);
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard';
    await router.replace(redirect);
    ElMessage.success('登录成功');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-button {
  width: 100%;
}
</style>
