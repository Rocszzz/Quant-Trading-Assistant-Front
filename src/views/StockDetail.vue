<template>
  <div class="stock-detail-page">
    <el-button class="back-button" link type="primary" @click="router.back()">返回</el-button>

    <el-alert v-if="errorMessage" :title="errorMessage" type="error" show-icon :closable="false" />

    <el-skeleton v-if="loading" :rows="8" animated />

    <template v-else>
      <div class="stock-header">
        <div>
          <h2>{{ stockInfo?.name || symbol }}</h2>
          <span>{{ symbol }} · {{ stockInfo?.exchange || '--' }}</span>
        </div>
        <div class="quote-highlight">
          <strong>{{ formatPrice(quote?.closePrice) }}</strong>
          <span :class="getChangeClass(quote?.changeRate)">
            {{ formatPercent(quote?.changeRate) }}
          </span>
        </div>
      </div>

      <div class="detail-grid">
        <el-card class="panel-card" shadow="never">
          <template #header>
            <div class="panel-title">
              <div>
                <h2>股票基础信息</h2>
                <span>证券代码、交易所、行业与状态</span>
              </div>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="股票代码">{{ stockInfo?.symbol || symbol }}</el-descriptions-item>
            <el-descriptions-item label="股票名称">{{ stockInfo?.name || '--' }}</el-descriptions-item>
            <el-descriptions-item label="交易所">{{ stockInfo?.exchange || '--' }}</el-descriptions-item>
            <el-descriptions-item label="行业">{{ stockInfo?.industry || '--' }}</el-descriptions-item>
            <el-descriptions-item label="状态">{{ stockInfo?.status || '--' }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ stockInfo?.updatedAt || '--' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card class="panel-card" shadow="never">
          <template #header>
            <div class="panel-title">
              <div>
                <h2>最新行情</h2>
                <span>价格、涨跌幅、成交量与行情时间</span>
              </div>
            </div>
          </template>
          <div class="quote-grid">
            <div>
              <span>最新价</span>
              <strong>{{ formatPrice(quote?.closePrice) }}</strong>
            </div>
            <div>
              <span>涨跌幅</span>
              <strong :class="getChangeClass(quote?.changeRate)">
                {{ formatPercent(quote?.changeRate) }}
              </strong>
            </div>
            <div>
              <span>成交量</span>
              <strong>{{ formatVolume(quote?.volume) }}</strong>
            </div>
            <div>
              <span>交易日期</span>
              <strong>{{ quote?.tradeDate || '--' }}</strong>
            </div>
          </div>
        </el-card>
      </div>

      <el-card class="panel-card kline-panel" shadow="never">
        <template #header>
          <div class="panel-title">
            <div>
              <h2>K 线走势</h2>
              <span>展示日 K 与 MA5、MA10、MA20 均线</span>
            </div>
            <el-button :loading="loading" @click="loadStockDetail">刷新</el-button>
          </div>
        </template>
        <KLineChart :history="kLineHistory" :loading="loading" />
      </el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import KLineChart from '@/components/KLineChart.vue';
import { getMarketQuote, getStockBasicInfo, getStockKLineHistory } from '@/api/marketApi';
import type { MarketKLineHistory, MarketQuote } from '@/types/market';
import type { StockInfo } from '@/types/stock';

const route = useRoute();
const router = useRouter();
const symbol = String(route.params.symbol || '');
const stockInfo = ref<StockInfo>();
const quote = ref<MarketQuote>();
const kLineHistory = ref<MarketKLineHistory>();
const loading = ref(false);
const errorMessage = ref('');

const formatPrice = (value?: number) => (typeof value === 'number' ? value.toFixed(2) : '--');
const formatPercent = (value?: number) => {
  if (typeof value !== 'number') {
    return '--';
  }

  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
};
const formatVolume = (value?: number) => (typeof value === 'number' ? value.toLocaleString() : '--');
const getChangeClass = (value?: number) => ({
  'market-positive': typeof value === 'number' && value > 0,
  'market-negative': typeof value === 'number' && value < 0
});

const loadStockDetail = async () => {
  if (!symbol) {
    errorMessage.value = '缺少股票代码，无法加载股票详情';
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    const [nextStockInfo, nextQuote, nextKLineHistory] = await Promise.all([
      getStockBasicInfo(symbol).catch(() => undefined),
      getMarketQuote(symbol),
      getStockKLineHistory(symbol)
    ]);

    stockInfo.value = nextStockInfo;
    quote.value = nextQuote;
    kLineHistory.value = nextKLineHistory;
  } catch {
    stockInfo.value = undefined;
    quote.value = undefined;
    kLineHistory.value = undefined;
    errorMessage.value = '股票详情加载失败，请稍后重试或检查行情接口';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadStockDetail();
});
</script>
