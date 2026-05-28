<template>
  <section class="panel">
    <div class="panel-title">
      <h2>系统设置</h2>
      <span>基础偏好配置</span>
    </div>
    <el-form label-width="140px" class="settings-form">
      <el-form-item label="系统名称">
        <el-input v-model="settings.systemName" />
      </el-form-item>
      <el-form-item label="默认市场">
        <el-select v-model="settings.market">
          <el-option label="A股" value="cn" />
          <el-option label="港股" value="hk" />
          <el-option label="美股" value="us" />
        </el-select>
      </el-form-item>
      <el-form-item label="数据刷新频率">
        <el-select v-model="settings.refreshRate">
          <el-option label="15 秒" value="15s" />
          <el-option label="30 秒" value="30s" />
          <el-option label="60 秒" value="60s" />
        </el-select>
      </el-form-item>
      <el-form-item label="风险提醒">
        <el-switch v-model="settings.riskNotice" />
      </el-form-item>
      <el-button type="primary">保存设置</el-button>
    </el-form>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

const settings = reactive({
  systemName: 'Quant Trading Assistant',
  market: 'cn',
  refreshRate: '30s',
  riskNotice: true
});
</script>

<style scoped>
.settings-form {
  max-width: 560px;
}
</style>
