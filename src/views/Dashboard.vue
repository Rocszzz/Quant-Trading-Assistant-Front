<template>
  <div>
    <div class="page-grid">
      <MetricCard label="总资产估值" value="¥ 8,426,310" trend="+2.41%" />
      <MetricCard label="今日策略收益" value="¥ 32,860" trend="+0.72%" />
      <MetricCard label="运行策略" value="12" trend="8 active" />
      <MetricCard label="风险事件" value="3" trend="待确认" :positive="false" />
    </div>

    <div class="content-grid">
      <section class="panel">
        <div class="panel-title">
          <h2>策略表现概览</h2>
          <span>近 30 个交易日</span>
        </div>
        <el-table :data="strategies" height="360">
          <el-table-column prop="name" label="策略名称" min-width="160" />
          <el-table-column prop="market" label="市场" width="100" />
          <el-table-column prop="returnRate" label="收益率" width="120" />
          <el-table-column prop="sharpe" label="Sharpe" width="110" />
          <el-table-column prop="drawdown" label="最大回撤" width="120" />
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <span class="status-dot" :class="row.statusClass"></span>{{ row.status }}
            </template>
          </el-table-column>
        </el-table>
      </section>

      <section class="panel">
        <div class="panel-title">
          <h2>市场快照</h2>
          <span>示例数据</span>
        </div>
        <el-timeline>
          <el-timeline-item v-for="item in marketEvents" :key="item.time" :timestamp="item.time">
            {{ item.content }}
          </el-timeline-item>
        </el-timeline>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import MetricCard from '@/components/MetricCard.vue';

const strategies = [
  {
    name: 'Alpha Momentum CN',
    market: 'A股',
    returnRate: '+12.8%',
    sharpe: '1.92',
    drawdown: '-4.6%',
    status: '运行中',
    statusClass: ''
  },
  {
    name: 'ETF Rotation',
    market: 'ETF',
    returnRate: '+8.3%',
    sharpe: '1.48',
    drawdown: '-3.1%',
    status: '运行中',
    statusClass: ''
  },
  {
    name: 'Index Hedge',
    market: '股指',
    returnRate: '+3.6%',
    sharpe: '0.96',
    drawdown: '-2.4%',
    status: '观察',
    statusClass: 'warning'
  },
  {
    name: 'Mean Reversion',
    market: 'A股',
    returnRate: '-1.2%',
    sharpe: '0.42',
    drawdown: '-6.8%',
    status: '暂停',
    statusClass: 'danger'
  }
];

const marketEvents = [
  {
    time: '09:35',
    content: '沪深 300 成分股动量因子出现短周期增强。'
  },
  {
    time: '10:20',
    content: 'ETF 轮动策略触发仓位再平衡建议。'
  },
  {
    time: '13:45',
    content: '组合波动率接近风控阈值，建议关注。'
  },
  {
    time: '14:50',
    content: '模拟账户当日收益回撤至预警线以内。'
  }
];
</script>
