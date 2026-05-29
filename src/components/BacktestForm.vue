<template>
  <section class="panel backtest-form-panel">
    <div class="panel-title">
      <div>
        <h2>回测参数</h2>
        <span>当前后端回测接口支持 MA_CROSS 双均线策略</span>
      </div>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="backtest-form"
    >
      <el-form-item label="股票选择" prop="symbol">
        <el-select
          v-model="form.symbol"
          filterable
          remote
          reserve-keyword
          clearable
          :remote-method="searchStockOptions"
          :loading="stockLoading"
          placeholder="输入代码或名称搜索股票"
        >
          <el-option
            v-for="item in stocks"
            :key="item.id"
            :label="`${item.symbol} ${item.name}`"
            :value="item.symbol"
          >
            <div class="option-row">
              <strong>{{ item.symbol }}</strong>
              <span>{{ item.name }} · {{ item.exchange }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="策略选择" prop="strategyId">
        <el-select v-model="form.strategyId" filterable clearable placeholder="选择 MA_CROSS 策略">
          <el-option
            v-for="item in availableStrategies"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
            <div class="option-row">
              <strong>{{ item.name }}</strong>
              <span>{{ item.typeDescription || item.type }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <div class="form-two-columns">
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="form.startDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择开始日期"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="form.endDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择结束日期"
          />
        </el-form-item>
      </div>

      <el-form-item label="初始资金" prop="initialCash">
        <el-input-number
          v-model="form.initialCash"
          :min="1000"
          :step="10000"
          :precision="2"
          controls-position="right"
        />
      </el-form-item>

      <el-button
        type="primary"
        class="run-button"
        :loading="loading"
        @click="submit"
      >
        运行回测
      </el-button>
    </el-form>
  </section>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';

import { searchStocks } from '@/api/stock';
import { getStrategies } from '@/api/strategyApi';
import type { BacktestRunPayload } from '@/types/backtest';
import type { StockInfo } from '@/types/stock';
import type { StrategyItem } from '@/types/strategy';

interface BacktestFormState {
  symbol: string;
  strategyId: number | string | undefined;
  startDate: string;
  endDate: string;
  initialCash: number;
}

defineProps<{
  loading?: boolean;
}>();

const emit = defineEmits<{
  run: [payload: BacktestRunPayload];
}>();

const formRef = ref<FormInstance>();
const stockLoading = ref(false);
const stocks = ref<StockInfo[]>([]);
const strategies = ref<StrategyItem[]>([]);

const form = reactive<BacktestFormState>({
  symbol: '',
  strategyId: undefined,
  startDate: '',
  endDate: '',
  initialCash: 100000
});

const availableStrategies = computed(() => {
  return strategies.value.filter((item) => item.enabled && item.type === 'MA_CROSS');
});

const rules: FormRules<BacktestFormState> = {
  symbol: [{ required: true, message: '请选择股票', trigger: 'change' }],
  strategyId: [{ required: true, message: '请选择策略', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  initialCash: [{ required: true, message: '请输入初始资金', trigger: 'change' }]
};

const searchStockOptions = async (keyword: string) => {
  if (!keyword || keyword.trim().length < 1) {
    return;
  }

  stockLoading.value = true;
  try {
    stocks.value = await searchStocks(keyword.trim());
  } finally {
    stockLoading.value = false;
  }
};

const submit = async () => {
  if (!formRef.value) {
    return;
  }

  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) {
    ElMessage.warning('请完整填写回测参数');
    return;
  }

  if (form.startDate > form.endDate) {
    ElMessage.warning('开始日期不能晚于结束日期');
    return;
  }

  if (!form.symbol || !form.strategyId) {
    ElMessage.warning('请完整填写回测参数');
    return;
  }

  emit('run', {
    strategyId: form.strategyId,
    symbol: form.symbol,
    startDate: form.startDate,
    endDate: form.endDate,
    initialCash: Number(form.initialCash)
  });
};

onMounted(async () => {
  strategies.value = await getStrategies();
});
</script>

<style scoped>
.backtest-form-panel {
  min-width: 0;
}

.backtest-form {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.backtest-form :deep(.el-select),
.backtest-form :deep(.el-date-editor),
.backtest-form :deep(.el-input-number) {
  width: 100%;
}

.form-two-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.option-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.option-row span {
  color: #64748b;
  font-size: 12px;
}

.run-button {
  width: 100%;
  margin-top: 8px;
}

@media (max-width: 720px) {
  .form-two-columns {
    grid-template-columns: 1fr;
  }
}
</style>
