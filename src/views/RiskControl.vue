<template>
  <div class="content-grid">
    <section class="panel">
      <div class="panel-title">
        <h2>风控阈值</h2>
        <el-button type="primary">保存配置</el-button>
      </div>
      <el-form label-width="140px">
        <el-form-item label="单策略最大仓位">
          <el-slider v-model="risk.singleStrategyLimit" :max="100" show-input />
        </el-form-item>
        <el-form-item label="组合最大回撤">
          <el-slider v-model="risk.maxDrawdown" :max="30" show-input />
        </el-form-item>
        <el-form-item label="单日亏损预警">
          <el-slider v-model="risk.dailyLossWarning" :max="10" show-input />
        </el-form-item>
      </el-form>
    </section>

    <section class="panel">
      <div class="panel-title">
        <h2>预警列表</h2>
        <span>示例规则</span>
      </div>
      <el-alert title="ETF Rotation 仓位接近上限" type="warning" show-icon />
      <el-alert title="Mean Reversion 波动率超过观察阈值" type="error" show-icon />
      <el-alert title="组合现金比例处于安全区间" type="success" show-icon />
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

const risk = reactive({
  singleStrategyLimit: 35,
  maxDrawdown: 12,
  dailyLossWarning: 4
});
</script>

<style scoped>
.el-alert + .el-alert {
  margin-top: 12px;
}
</style>
