<template>
  <div>
    <div class="page-grid">
      <MetricCard label="模拟账户权益" value="¥ 1,284,900" trend="+1.12%" />
      <MetricCard label="可用资金" value="¥ 426,300" trend="33.2%" />
      <MetricCard label="持仓数量" value="18" trend="6 sectors" />
      <MetricCard label="当日回撤" value="-0.38%" trend="正常" />
    </div>

    <section class="panel">
      <div class="panel-title">
        <h2>模拟持仓</h2>
        <span>仅展示模拟数据，不包含真实交易功能</span>
      </div>
      <el-table :data="positions">
        <el-table-column prop="asset" label="资产" min-width="160" />
        <el-table-column prop="weight" label="权重" width="120" />
        <el-table-column prop="profit" label="浮动收益" width="130" />
        <el-table-column prop="strategy" label="来源策略" min-width="180" />
        <el-table-column prop="risk" label="风险标记" width="120" />
      </el-table>
    </section>
  </div>
</template>

<script setup lang="ts">
import MetricCard from '@/components/MetricCard.vue';

const positions = [
  {
    asset: '沪深300ETF',
    weight: '28%',
    profit: '+2.8%',
    strategy: 'ETF Rotation',
    risk: '正常'
  },
  {
    asset: '中证500ETF',
    weight: '18%',
    profit: '+1.4%',
    strategy: 'Alpha Momentum CN',
    risk: '正常'
  },
  {
    asset: '现金类资产',
    weight: '33%',
    profit: '+0.1%',
    strategy: 'Risk Buffer',
    risk: '低风险'
  }
];
</script>
