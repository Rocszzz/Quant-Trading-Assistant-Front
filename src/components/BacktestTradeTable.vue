<template>
  <section class="panel">
    <div class="panel-title">
      <div>
        <h2>交易明细</h2>
        <span>{{ trades.length }} 笔成交记录</span>
      </div>
    </div>

    <el-table :data="trades" class="trade-table" empty-text="暂无交易明细">
      <el-table-column prop="tradeDate" label="日期" min-width="130" />
      <el-table-column prop="side" label="买入/卖出" width="110">
        <template #default="{ row }">
          <el-tag :type="row.side === 'BUY' ? 'danger' : 'success'" effect="plain">
            {{ row.side === 'BUY' ? '买入' : '卖出' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="价格" width="120" align="right">
        <template #default="{ row }">{{ formatNumber(row.price) }}</template>
      </el-table-column>
      <el-table-column prop="quantity" label="数量" width="120" align="right" />
      <el-table-column prop="amount" label="金额" width="140" align="right">
        <template #default="{ row }">{{ formatNumber(row.amount) }}</template>
      </el-table-column>
      <el-table-column prop="reason" label="触发原因" min-width="220" show-overflow-tooltip />
    </el-table>
  </section>
</template>

<script setup lang="ts">
import type { BacktestTrade } from '@/types/backtest';

defineProps<{
  trades: BacktestTrade[];
}>();

const formatNumber = (value: number) => {
  return Number(value).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};
</script>

<style scoped>
.trade-table {
  --el-table-header-bg-color: #f8fafc;
  --el-table-row-hover-bg-color: rgba(37, 99, 235, 0.06);
}
</style>
