<template>
  <div class="content-grid">
    <section class="panel">
      <div class="panel-title">
        <h2>回测任务</h2>
        <el-button type="primary">创建回测</el-button>
      </div>
      <el-table :data="backtests">
        <el-table-column prop="name" label="任务名称" min-width="180" />
        <el-table-column prop="range" label="时间范围" min-width="180" />
        <el-table-column prop="returnRate" label="收益率" width="110" />
        <el-table-column prop="drawdown" label="最大回撤" width="120" />
        <el-table-column prop="status" label="状态" width="100" />
      </el-table>
    </section>

    <section class="panel">
      <div class="panel-title">
        <h2>核心指标</h2>
        <span>最近任务</span>
      </div>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="年化收益">18.6%</el-descriptions-item>
        <el-descriptions-item label="Sharpe">1.73</el-descriptions-item>
        <el-descriptions-item label="最大回撤">-5.2%</el-descriptions-item>
        <el-descriptions-item label="胜率">57.4%</el-descriptions-item>
      </el-descriptions>
    </section>
  </div>
</template>

<script setup lang="ts">
const backtests = [
  {
    name: 'Alpha Momentum 2025',
    range: '2025-01-01 至 2025-12-31',
    returnRate: '+18.6%',
    drawdown: '-5.2%',
    status: '完成'
  },
  {
    name: 'ETF Rotation Q1',
    range: '2026-01-01 至 2026-03-31',
    returnRate: '+6.4%',
    drawdown: '-2.1%',
    status: '完成'
  },
  {
    name: 'Mean Reversion Stress',
    range: '2024-01-01 至 2024-12-31',
    returnRate: '+3.2%',
    drawdown: '-9.8%',
    status: '排队'
  }
];
</script>
