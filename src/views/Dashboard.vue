<template>
  <div>
    <div class="page-grid">
      <el-card class="dashboard-card" shadow="never">
        <template #header>
          <span>自选股数量</span>
        </template>
        <div v-loading="watchlistLoading" class="dashboard-metric">
          <strong>{{ watchlistCount }}</strong>
          <span>当前关注标的</span>
        </div>
      </el-card>

      <el-card class="dashboard-card" shadow="never">
        <template #header>
          <span>策略数量</span>
        </template>
        <div class="dashboard-metric">
          <strong>--</strong>
          <span>阶段 1 占位，等待策略接口接入</span>
        </div>
      </el-card>

      <el-card class="dashboard-card" shadow="never">
        <template #header>
          <span>模拟账户资产</span>
        </template>
        <div class="dashboard-metric">
          <strong>--</strong>
          <span>阶段 1 占位，不包含真实交易</span>
        </div>
      </el-card>
    </div>

    <el-alert v-if="errorMessage" :title="errorMessage" type="error" show-icon :closable="false" />

    <section class="panel overview-panel">
      <div class="panel-title">
        <div>
          <h2>阶段 1 工作台</h2>
          <span>优先完成自选股维护和股票搜索流程</span>
        </div>
      </div>
      <el-empty description="策略、回测、模拟交易数据将在后续阶段接入真实接口" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { getWatchlist } from '@/api/stock';

const watchlistCount = ref(0);
const watchlistLoading = ref(false);
const errorMessage = ref('');

const loadWatchlistCount = async () => {
  watchlistLoading.value = true;
  errorMessage.value = '';

  try {
    const watchlist = await getWatchlist();
    watchlistCount.value = watchlist.length;
  } catch {
    watchlistCount.value = 0;
    errorMessage.value = '自选股数量加载失败，请检查后端 /api/watchlist 接口';
  } finally {
    watchlistLoading.value = false;
  }
};

onMounted(() => {
  loadWatchlistCount();
});
</script>
