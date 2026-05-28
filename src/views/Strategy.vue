<template>
  <section class="panel">
    <div class="panel-title">
      <h2>策略管理</h2>
      <el-button type="primary">新建策略</el-button>
    </div>
    <el-table :data="strategies">
      <el-table-column prop="name" label="策略名称" min-width="180" />
      <el-table-column prop="type" label="策略类型" width="130" />
      <el-table-column prop="frequency" label="频率" width="120" />
      <el-table-column prop="riskLevel" label="风险等级" width="120" />
      <el-table-column prop="status" label="状态" width="120" />
      <el-table-column label="操作" width="180">
        <template #default>
          <el-button link type="primary">查看</el-button>
          <el-button link>配置</el-button>
        </template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script setup lang="ts">
const strategies = [
  {
    name: 'Alpha Momentum CN',
    type: '多因子',
    frequency: '日频',
    riskLevel: '中',
    status: '运行中'
  },
  {
    name: 'ETF Rotation',
    type: '轮动',
    frequency: '周频',
    riskLevel: '低',
    status: '运行中'
  },
  {
    name: 'Mean Reversion',
    type: '均值回归',
    frequency: '分钟级',
    riskLevel: '高',
    status: '暂停'
  }
];
</script>
