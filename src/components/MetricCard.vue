<template>
  <section class="metric-card">
    <div>
      <span>{{ label }}</span>
      <strong>{{ value }}</strong>
    </div>
    <el-tag :type="trendType" effect="dark">{{ trend }}</el-tag>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  label: string;
  value: string;
  trend: string;
  positive?: boolean;
}>();

const trendType = computed(() => (props.positive === false ? 'danger' : 'success'));
</script>
