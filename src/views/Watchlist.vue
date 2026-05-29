<template>
  <div class="watchlist-page">
    <el-card class="panel-card" shadow="never">
      <template #header>
        <div class="panel-title">
          <div>
            <h2>自选股</h2>
            <span>当前用户关注的股票池</span>
          </div>
          <el-button type="primary" @click="openSearchDialog">搜索添加</el-button>
        </div>
      </template>

      <el-alert v-if="watchlistError" :title="watchlistError" type="error" show-icon :closable="false" />

      <el-table
        v-loading="watchlistLoading"
        :data="watchlist"
        class="data-table"
        empty-text="暂无自选股，请点击搜索添加"
        @row-click="goStockDetail"
      >
        <el-table-column prop="symbol" label="股票代码" width="140" />
        <el-table-column prop="name" label="股票名称" min-width="160" />
        <el-table-column prop="exchange" label="交易所" width="120" />
        <el-table-column prop="industry" label="行业" min-width="180" />
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
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click.stop="goStockDetail(row)">
              详情
            </el-button>
            <el-button link type="danger" :loading="deletingId === row.id" @click.stop="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="searchDialogVisible" title="股票搜索" width="760px" destroy-on-close>
      <el-form :model="searchForm" label-width="88px" @submit.prevent>
        <el-form-item label="关键词">
          <el-input
            v-model.trim="searchForm.keyword"
            clearable
            placeholder="请输入股票代码或名称"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="searchLoading" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-alert v-if="searchError" :title="searchError" type="error" show-icon :closable="false" />

      <el-table
        v-loading="searchLoading"
        :data="searchResults"
        class="data-table"
        empty-text="暂无搜索结果"
      >
        <el-table-column prop="symbol" label="股票代码" width="140" />
        <el-table-column prop="name" label="股票名称" min-width="160" />
        <el-table-column prop="exchange" label="交易所" width="120" />
        <el-table-column prop="industry" label="行业" min-width="160" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              :disabled="isAdded(row)"
              :loading="addingStockId === row.id"
              @click="handleAdd(row)"
            >
              {{ isAdded(row) ? '已添加' : '添加' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { getWatchlistMarketQuotes } from '@/api/marketApi';
import {
  addWatchlistItem,
  deleteWatchlistItem,
  getWatchlist,
  searchStocks
} from '@/api/stock';
import type { MarketQuote } from '@/types/market';
import type { StockInfo, WatchlistItem } from '@/types/stock';

interface WatchlistMarketRow extends WatchlistItem {
  closePrice?: number;
  changeRate?: number;
  volume?: number;
}

const router = useRouter();
const watchlist = ref<WatchlistMarketRow[]>([]);
const searchResults = ref<StockInfo[]>([]);
const watchlistLoading = ref(false);
const searchLoading = ref(false);
const searchDialogVisible = ref(false);
const watchlistError = ref('');
const searchError = ref('');
const deletingId = ref<number>();
const addingStockId = ref<number>();

const searchForm = reactive({
  keyword: ''
});

const buildMarketRows = (items: WatchlistItem[], quotes: MarketQuote[]) => {
  const quoteMap = new Map(quotes.map((quote) => [quote.symbol, quote]));

  return items.map((item) => {
    const quote = quoteMap.get(item.symbol);

    return {
      ...item,
      closePrice: quote?.closePrice,
      changeRate: quote?.changeRate,
      volume: quote?.volume
    };
  });
};

const addedStockIds = computed(() => new Set(watchlist.value.map((item) => item.stockId)));

const isAdded = (stock: StockInfo) => addedStockIds.value.has(stock.id);

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

const loadWatchlist = async () => {
  watchlistLoading.value = true;
  watchlistError.value = '';

  try {
    const nextWatchlist = await getWatchlist();
    const quotes = await getWatchlistMarketQuotes();
    watchlist.value = buildMarketRows(nextWatchlist, quotes);
  } catch {
    watchlist.value = [];
    watchlistError.value = '自选股或行情加载失败，请稍后重试';
  } finally {
    watchlistLoading.value = false;
  }
};

const openSearchDialog = () => {
  searchDialogVisible.value = true;
  searchError.value = '';
};

const handleSearch = async () => {
  if (!searchForm.keyword) {
    ElMessage.warning('请输入股票代码或名称');
    return;
  }

  searchLoading.value = true;
  searchError.value = '';

  try {
    searchResults.value = await searchStocks(searchForm.keyword);
  } catch {
    searchResults.value = [];
    searchError.value = '股票搜索失败，请检查关键词或稍后重试';
  } finally {
    searchLoading.value = false;
  }
};

const resetSearch = () => {
  searchForm.keyword = '';
  searchResults.value = [];
  searchError.value = '';
};

const handleAdd = async (stock: StockInfo) => {
  if (isAdded(stock)) {
    return;
  }

  addingStockId.value = stock.id;

  try {
    await addWatchlistItem({
      stockId: stock.id
    });
    ElMessage.success('已加入自选股');
    await loadWatchlist();
  } catch {
    ElMessage.error('添加自选股失败');
  } finally {
    addingStockId.value = undefined;
  }
};

const handleDelete = async (item: WatchlistItem) => {
  try {
    await ElMessageBox.confirm(`确认删除 ${item.name}（${item.symbol}）？`, '删除自选股', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    });
  } catch {
    return;
  }

  deletingId.value = item.id;

  try {
    await deleteWatchlistItem(item.id);
    ElMessage.success('已删除自选股');
    await loadWatchlist();
  } catch {
    ElMessage.error('删除自选股失败');
  } finally {
    deletingId.value = undefined;
  }
};

const goStockDetail = (item: WatchlistMarketRow) => {
  router.push(`/stocks/${item.symbol}`);
};

onMounted(() => {
  loadWatchlist();
});
</script>
