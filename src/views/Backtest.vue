<template>
  <div class="backtest-page">
    <section class="backtest-hero">
      <div>
        <span class="eyebrow">Backtest Center</span>
        <h2>回测中心</h2>
        <p>按后端回测接口运行策略历史验证，集中查看核心指标和逐笔成交明细。</p>
      </div>
      <div class="hero-snapshot">
        <span>最近结果</span>
        <strong :class="latestReturnClass">{{ latestReturnText }}</strong>
      </div>
    </section>

    <div class="backtest-layout">
      <BacktestForm :loading="running" @run="handleRunBacktest" />

      <section class="panel record-panel">
        <div class="panel-title">
          <div>
            <h2>回测记录</h2>
            <span>点击记录查看历史详情</span>
          </div>
          <el-button text type="primary" :loading="recordsLoading" @click="loadRecords">刷新</el-button>
        </div>

        <el-table
          v-loading="recordsLoading"
          :data="records"
          class="record-table"
          empty-text="暂无回测记录"
          @row-click="openRecordDetail"
        >
          <el-table-column label="标的/策略" min-width="210">
            <template #default="{ row }">
              <div class="record-main">
                <strong>{{ row.symbol }}</strong>
                <span>策略 #{{ row.strategyId }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="区间" min-width="190">
            <template #default="{ row }">{{ row.startDate }} 至 {{ row.endDate }}</template>
          </el-table-column>
          <el-table-column label="收益率" width="110" align="right">
            <template #default="{ row }">
              <span :class="getRateClass(row.totalReturn)">
                {{ formatPercent(row.totalReturn) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'SUCCESS' ? 'success' : 'warning'" effect="plain">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90" align="right">
            <template #default>
              <el-button link type="primary">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>
    </div>

    <div v-loading="running || detailLoading" class="result-area">
      <template v-if="activeResult">
        <BacktestResult :result="activeResult" />
        <EquityCurveChart :points="activeResult.equityCurve" />
        <BacktestTradeTable :trades="activeResult.trades" />
      </template>
      <section v-else class="panel empty-result">
        <el-empty description="运行回测或选择历史记录后查看结果" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed, onMounted, ref } from 'vue';

import {
  getBacktestDetail,
  getBacktestRecords,
  getBacktestTrades,
  runBacktest
} from '@/api/backtestApi';
import BacktestForm from '@/components/BacktestForm.vue';
import BacktestResult from '@/components/BacktestResult.vue';
import BacktestTradeTable from '@/components/BacktestTradeTable.vue';
import EquityCurveChart from '@/components/EquityCurveChart.vue';
import type {
  BacktestEquityPoint,
  BacktestRecord,
  BacktestResult as BacktestResultType,
  BacktestRunPayload
} from '@/types/backtest';

const running = ref(false);
const recordsLoading = ref(false);
const detailLoading = ref(false);
const activeResult = ref<BacktestResultType | null>(null);
const records = ref<BacktestRecord[]>([]);

const formatPercent = (value: number) => {
  const numericValue = Number(value);
  const displayValue = Math.abs(numericValue) > 1 ? numericValue : numericValue * 100;

  return `${displayValue.toFixed(2)}%`;
};

const getRateClass = (value: number) => {
  if (value > 0) {
    return 'rate-positive';
  }

  if (value < 0) {
    return 'rate-negative';
  }

  return '';
};

const buildEquityCurve = (record: BacktestRecord): BacktestEquityPoint[] => {
  return [
    {
      date: record.startDate,
      asset: record.initialCash,
      returnRate: 0
    },
    {
      date: record.endDate,
      asset: record.finalAsset,
      returnRate: record.totalReturn
    }
  ];
};

const buildResult = async (record: BacktestRecord): Promise<BacktestResultType> => {
  const trades = await getBacktestTrades(record.id);

  return {
    ...record,
    equityCurve: buildEquityCurve(record),
    trades
  };
};

const latestReturnText = computed(() => {
  const value = activeResult.value?.totalReturn ?? records.value[0]?.totalReturn;

  return typeof value === 'number' ? formatPercent(value) : '--';
});

const latestReturnClass = computed(() => {
  const value = activeResult.value?.totalReturn ?? records.value[0]?.totalReturn ?? 0;

  return getRateClass(value);
});

const loadRecords = async () => {
  recordsLoading.value = true;
  try {
    records.value = await getBacktestRecords();
  } finally {
    recordsLoading.value = false;
  }
};

const handleRunBacktest = async (payload: BacktestRunPayload) => {
  running.value = true;
  try {
    const record = await runBacktest(payload);
    activeResult.value = await buildResult(record);
    ElMessage.success('回测已完成');
    await loadRecords();
  } finally {
    running.value = false;
  }
};

const openRecordDetail = async (record: BacktestRecord) => {
  detailLoading.value = true;
  try {
    const detail = await getBacktestDetail(record.id);
    activeResult.value = await buildResult(detail);
  } finally {
    detailLoading.value = false;
  }
};

onMounted(() => {
  loadRecords();
});
</script>

<style scoped>
.backtest-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.backtest-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px;
  border: 1px solid rgba(37, 99, 235, 0.18);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(15, 23, 42, 0.97), rgba(30, 64, 175, 0.86)),
    #0f172a;
  color: #ffffff;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
}

.backtest-hero h2,
.backtest-hero p {
  margin: 0;
}

.backtest-hero h2 {
  margin-top: 6px;
  font-size: 24px;
}

.backtest-hero p {
  margin-top: 8px;
  color: #cbd5e1;
  font-size: 13px;
}

.eyebrow {
  color: #67e8f9;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.hero-snapshot {
  min-width: 150px;
  padding: 14px 16px;
  border: 1px solid rgba(226, 232, 240, 0.16);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.42);
  text-align: right;
}

.hero-snapshot span,
.hero-snapshot strong {
  display: block;
}

.hero-snapshot span {
  color: #94a3b8;
  font-size: 12px;
}

.hero-snapshot strong {
  margin-top: 8px;
  font-size: 26px;
  line-height: 1;
}

.backtest-layout {
  display: grid;
  grid-template-columns: minmax(320px, 0.72fr) minmax(0, 1.28fr);
  gap: 18px;
}

.record-panel {
  min-width: 0;
}

.record-table {
  --el-table-header-bg-color: #f8fafc;
  --el-table-row-hover-bg-color: rgba(37, 99, 235, 0.06);
  cursor: pointer;
}

.record-main strong,
.record-main span {
  display: block;
}

.record-main strong {
  color: #0f172a;
  font-size: 14px;
}

.record-main span {
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
}

.result-area {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 220px;
}

.empty-result {
  display: grid;
  place-items: center;
  min-height: 280px;
}

.rate-positive {
  color: #dc2626;
  font-weight: 700;
}

.rate-negative {
  color: #059669;
  font-weight: 700;
}

@media (max-width: 1180px) {
  .backtest-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .backtest-hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .hero-snapshot {
    width: 100%;
    text-align: left;
  }
}
</style>
