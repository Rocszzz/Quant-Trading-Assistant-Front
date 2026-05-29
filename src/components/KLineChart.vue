<template>
  <div class="kline-chart-wrap">
    <div v-if="loading" class="kline-chart-loading">
      <el-skeleton :rows="8" animated />
    </div>
    <el-empty v-else-if="!history || history.values.length === 0" description="暂无 K 线数据" />
    <div v-show="!loading && history && history.values.length > 0" ref="chartRef" class="kline-chart" />
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts/core';
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent
} from 'echarts/components';
import { CandlestickChart, LineChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import type { ComposeOption } from 'echarts/core';
import type {
  DataZoomComponentOption,
  GridComponentOption,
  LegendComponentOption,
  TooltipComponentOption
} from 'echarts/components';
import type { CandlestickSeriesOption, LineSeriesOption } from 'echarts/charts';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import type { MarketKLineHistory } from '@/types/market';

type KLineChartOption = ComposeOption<
  | CandlestickSeriesOption
  | DataZoomComponentOption
  | GridComponentOption
  | LegendComponentOption
  | LineSeriesOption
  | TooltipComponentOption
>;

const props = defineProps<{
  history?: MarketKLineHistory;
  loading?: boolean;
}>();

echarts.use([
  CandlestickChart,
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  TooltipComponent,
  CanvasRenderer
]);

const chartRef = ref<HTMLDivElement>();
let chartInstance: echarts.ECharts | undefined;
let resizeObserver: ResizeObserver | undefined;

const formatMaValues = (values?: Array<number | null>) => values?.map((value) => value ?? '-') ?? [];

const chartOption = computed<KLineChartOption>(() => {
  const history = props.history;

  return {
    animation: false,
    color: ['#2563eb', '#f59e0b', '#64748b'],
    grid: {
      top: 44,
      right: 24,
      bottom: 72,
      left: 52
    },
    legend: {
      top: 8,
      data: ['K线', 'MA5', 'MA10', 'MA20']
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    xAxis: {
      type: 'category',
      data: history?.dates ?? [],
      boundaryGap: true,
      axisLine: {
        lineStyle: {
          color: '#cbd5e1'
        }
      }
    },
    yAxis: {
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
        start: 45,
        end: 100
      },
      {
        type: 'slider',
        height: 22,
        bottom: 24,
        start: 45,
        end: 100
      }
    ],
    series: [
      {
        name: 'K线',
        type: 'candlestick',
        data: history?.values ?? [],
        itemStyle: {
          color: '#ef4444',
          color0: '#10b981',
          borderColor: '#ef4444',
          borderColor0: '#10b981'
        }
      },
      {
        name: 'MA5',
        type: 'line',
        data: formatMaValues(history?.ma5),
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 1.4
        }
      },
      {
        name: 'MA10',
        type: 'line',
        data: formatMaValues(history?.ma10),
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 1.4
        }
      },
      {
        name: 'MA20',
        type: 'line',
        data: formatMaValues(history?.ma20),
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 1.4
        }
      }
    ]
  };
});

const renderChart = async () => {
  if (props.loading || !props.history || props.history.values.length === 0) {
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
  () => [props.history, props.loading],
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
