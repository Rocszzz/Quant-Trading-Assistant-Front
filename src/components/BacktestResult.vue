<template>
  <section class="backtest-result-grid">
    <div
      v-for="item in metrics"
      :key="item.label"
      class="metric-card backtest-metric"
    >
      <div>
        <span>{{ item.label }}</span>
        <strong :class="item.className">{{ item.value }}</strong>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { BacktestResult } from '@/types/backtest';

const props = defineProps<{
  result: BacktestResult;
}>();

const formatMoney = (value: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 2
  }).format(value);
};

const formatPercent = (value: number) => {
  const displayValue = Math.abs(value) > 1 ? value : value * 100;

  return `${displayValue.toFixed(2)}%`;
};

const formatDrawdown = (value: number) => `-${Math.abs(Math.abs(value) > 1 ? value : value * 100).toFixed(2)}%`;

const getRateClass = (value: number) => {
  if (value > 0) {
    return 'rate-positive';
  }

  if (value < 0) {
    return 'rate-negative';
  }

  return '';
};

const metrics = computed(() => [
  {
    label: '最终资产',
    value: formatMoney(props.result.finalAsset),
    className: ''
  },
  {
    label: '总收益率',
    value: formatPercent(props.result.totalReturn),
    className: getRateClass(props.result.totalReturn)
  },
  {
    label: '最大回撤',
    value: formatDrawdown(props.result.maxDrawdown),
    className: 'rate-negative'
  },
  {
    label: '胜率',
    value: formatPercent(props.result.winRate),
    className: getRateClass(props.result.winRate)
  },
  {
    label: '交易次数',
    value: String(props.result.tradeCount),
    className: ''
  }
]);
</script>

<style scoped>
.backtest-result-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
}

.backtest-metric {
  min-height: 104px;
}

.backtest-metric strong {
  font-size: 24px;
}

.rate-positive {
  color: #dc2626 !important;
}

.rate-negative {
  color: #059669 !important;
}

@media (max-width: 1280px) {
  .backtest-result-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .backtest-result-grid {
    grid-template-columns: 1fr;
  }
}
</style>
