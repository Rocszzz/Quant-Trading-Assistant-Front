<template>
  <div>
    <div class="page-grid">
      <el-card class="dashboard-card" shadow="never">
        <template #header>
          <span>自选股数量</span>
        </template>
        <div v-loading="loading" class="dashboard-metric">
          <strong>{{ watchlistCount }}</strong>
          <span>当前关注标的</span>
        </div>
      </el-card>

      <el-card class="dashboard-card" shadow="never">
        <template #header>
          <span>上涨标的</span>
        </template>
        <div v-loading="loading" class="dashboard-metric">
          <strong>{{ risingCount }}</strong>
          <span>自选股最新涨跌幅为正</span>
        </div>
      </el-card>

      <el-card class="dashboard-card" shadow="never">
        <template #header>
          <span>行情交易日期</span>
        </template>
        <div v-loading="loading" class="dashboard-metric">
          <strong class="dashboard-time">{{ latestUpdateTime || '--' }}</strong>
          <span>取自最新一条行情记录</span>
        </div>
      </el-card>
    </div>

    <el-alert v-if="errorMessage" :title="errorMessage" type="error" show-icon :closable="false" />

    <el-card class="panel-card overview-panel" shadow="never">
      <template #header>
        <div class="panel-title">
          <div>
            <h2>行情概览</h2>
            <span>自选股最新价格、涨跌幅、成交量与交易日期</span>
          </div>
          <el-button :loading="loading" @click="loadMarketOverview">刷新</el-button>
        </div>
      </template>

      <el-skeleton v-if="loading" :rows="6" animated />
      <el-table
        v-else
        :data="overviewRows"
        class="data-table"
        empty-text="暂无行情数据，请先添加自选股"
        @row-click="goStockDetail"
      >
        <el-table-column prop="symbol" label="股票代码" width="140" />
        <el-table-column prop="name" label="股票名称" min-width="150" />
        <el-table-column label="最新价" width="120">
          <template #default="{ row }">
            {{ formatPrice(row.closePrice) }}
          </template>
        </el-table-column>
        <el-table-column label="涨跌幅" width="120">
          <template #default="{ row }">
            <span :class="getChangeClass(row.changeRate)">
              {{ formatPercent(row.changeRate) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="成交量" min-width="140">
          <template #default="{ row }">
            {{ formatVolume(row.volume) }}
          </template>
        </el-table-column>
        <el-table-column prop="tradeDate" label="交易日期" min-width="140" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { getWatchlistMarketQuotes } from '@/api/marketApi';
import { getWatchlist } from '@/api/stock';
import type { MarketQuote } from '@/types/market';
import type { WatchlistItem } from '@/types/stock';

interface MarketOverviewRow extends WatchlistItem {
  closePrice?: number;
  changeRate?: number;
  volume?: number;
  tradeDate?: string;
}

const router = useRouter();
const watchlist = ref<WatchlistItem[]>([]);
const quotes = ref<MarketQuote[]>([]);
const loading = ref(false);
const errorMessage = ref('');

const quoteMap = computed(() => new Map(quotes.value.map((quote) => [quote.symbol, quote])));
const watchlistCount = computed(() => watchlist.value.length);
const risingCount = computed(() => quotes.value.filter((quote) => quote.changeRate > 0).length);
const latestUpdateTime = computed(() => quotes.value.reduce((latest, quote) => {
  if (!latest) {
    return quote.tradeDate;
  }

  return quote.tradeDate > latest ? quote.tradeDate : latest;
}, ''));
const overviewRows = computed<MarketOverviewRow[]>(() => watchlist.value.map((item) => {
  const quote = quoteMap.value.get(item.symbol);

  return {
    ...item,
    closePrice: quote?.closePrice,
    changeRate: quote?.changeRate,
    volume: quote?.volume,
    tradeDate: quote?.tradeDate
  };
}));

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

const loadMarketOverview = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const nextWatchlist = await getWatchlist();
    watchlist.value = nextWatchlist;
    quotes.value = await getWatchlistMarketQuotes();
  } catch {
    quotes.value = [];
    errorMessage.value = '行情概览加载失败，请稍后重试或检查行情接口';
  } finally {
    loading.value = false;
  }
};

const goStockDetail = (row: MarketOverviewRow) => {
  router.push(`/stocks/${row.symbol}`);
};

onMounted(() => {
  loadMarketOverview();
});
</script>
