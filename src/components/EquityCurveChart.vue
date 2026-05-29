<template>
  <section class="panel equity-panel">
    <div class="panel-title">
      <div>
        <h2>收益曲线</h2>
        <span>净值变化与区间收益走势</span>
      </div>
    </div>
    <el-empty v-if="!points.length" description="暂无收益曲线数据" />
    <div v-show="points.length" ref="chartRef" class="equity-chart" />
  </section>
</template>

<script setup lang="ts">
import { LineChart } from 'echarts/charts';
import {
  DataZoomComponent,
  GridComponent,
  TooltipComponent
} from 'echarts/components';
import * as echarts from 'echarts/core';
import type { ComposeOption } from 'echarts/core';
import type { LineSeriesOption } from 'echarts/charts';
import type {
  DataZoomComponentOption,
  GridComponentOption,
  TooltipComponentOption
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import type { BacktestEquityPoint } from '@/types/backtest';

type EquityChartOption = ComposeOption<
  | DataZoomComponentOption
  | GridComponentOption
  | LineSeriesOption
  | TooltipComponentOption
>;

const props = defineProps<{
  points: BacktestEquityPoint[];
}>();

echarts.use([
  DataZoomComponent,
  GridComponent,
  LineChart,
  TooltipComponent,
  CanvasRenderer
]);

const chartRef = ref<HTMLDivElement>();
let chartInstance: echarts.ECharts | undefined;
let resizeObserver: ResizeObserver | undefined;

const chartOption = computed<EquityChartOption>(() => ({
  animation: false,
  color: ['#2563eb'],
  grid: {
    top: 18,
    right: 24,
    bottom: 54,
    left: 64
  },
  tooltip: {
    trigger: 'axis',
    valueFormatter: (value) => Number(value).toLocaleString('zh-CN', {
      maximumFractionDigits: 2
    })
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: props.points.map((item) => item.date),
    axisLine: {
      lineStyle: {
        color: '#cbd5e1'
      }
    }
  },
  yAxis: {
    type: 'value',
    scale: true,
    splitLine: {
      lineStyle: {
        color: '#edf2f7'
      }
    }
  },
  dataZoom: [
    {
      type: 'inside',
      start: 0,
      end: 100
    },
    {
      type: 'slider',
      height: 22,
      bottom: 16,
      start: 0,
      end: 100
    }
  ],
  series: [
    {
      name: '资产净值',
      type: 'line',
      smooth: true,
      symbol: 'none',
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: 'rgba(37, 99, 235, 0.24)'
            },
            {
              offset: 1,
              color: 'rgba(37, 99, 235, 0.02)'
            }
          ]
        }
      },
      lineStyle: {
        width: 2.4
      },
      data: props.points.map((item) => item.asset)
    }
  ]
}));

const renderChart = async () => {
  if (!props.points.length) {
    return;
  }

  await nextTick();

  if (!chartRef.value) {
    return;
  }

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value);
  }

  chartInstance.setOption(chartOption.value, true);
  chartInstance.resize();
};

watch(
  () => props.points,
  () => {
    renderChart();
  },
  {
    deep: true
  }
);

onMounted(() => {
  renderChart();

  if (chartRef.value) {
    resizeObserver = new ResizeObserver(() => {
      chartInstance?.resize();
    });
    resizeObserver.observe(chartRef.value);
  }
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  chartInstance?.dispose();
});
</script>

<style scoped>
.equity-chart {
  width: 100%;
  height: 360px;
}
</style>
