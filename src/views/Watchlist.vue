<template>
  <section class="panel">
    <div class="panel-title">
      <h2>自选股</h2>
      <el-button type="primary">添加标的</el-button>
    </div>
    <el-table :data="watchlist">
      <el-table-column prop="symbol" label="代码" width="120" />
      <el-table-column prop="name" label="名称" min-width="140" />
      <el-table-column prop="price" label="最新价" width="120" />
      <el-table-column prop="change" label="涨跌幅" width="120" />
      <el-table-column prop="factor" label="因子评分" width="120" />
      <el-table-column prop="note" label="观察备注" min-width="220" />
    </el-table>
  </section>
</template>

<script setup lang="ts">
const watchlist = [
  {
    symbol: '000300',
    name: '沪深300',
    price: '3,942.18',
    change: '+0.86%',
    factor: '82',
    note: '大盘趋势强度提升'
  },
  {
    symbol: '510300',
    name: '沪深300ETF',
    price: '3.912',
    change: '+0.74%',
    factor: '79',
    note: '适合 ETF 轮动观察'
  },
  {
    symbol: '159915',
    name: '创业板ETF',
    price: '1.842',
    change: '-0.32%',
    factor: '64',
    note: '短线波动偏高'
  }
];
</script>
