<template>
  <div class="strategy-page">
    <section class="strategy-hero">
      <div>
        <span class="eyebrow">Strategy Desk</span>
        <h2>策略管理</h2>
        <p>集中管理策略模板、运行状态与参数版本，参数变更统一调用后端接口覆盖保存。</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreateDialog">新增策略</el-button>
    </section>

    <div class="strategy-layout">
      <section class="panel strategy-list-panel">
        <div class="strategy-toolbar">
          <div>
            <h3>策略池</h3>
            <span>{{ strategies.length }} 个策略实例</span>
          </div>
          <el-segmented v-model="typeFilter" :options="typeFilterOptions" />
        </div>

        <el-table
          v-loading="loading"
          :data="filteredStrategies"
          class="strategy-table"
          empty-text="暂无策略，请先新增策略"
        >
          <el-table-column prop="name" label="策略名称" min-width="190">
            <template #default="{ row }">
              <div class="strategy-name-cell">
                <strong>{{ row.name }}</strong>
                <span>{{ row.description || '未填写策略描述' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="策略类型" width="150">
            <template #default="{ row }">
              <el-tag effect="plain" :type="getStrategyTagType(row.type)">
                {{ row.typeDescription || getStrategyTypeLabel(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="enabled" label="是否启用" width="130">
            <template #default="{ row }">
              <el-switch
                v-model="row.enabled"
                :loading="enabledLoadingId === row.id"
                active-text="启用"
                inactive-text="停用"
                inline-prompt
                @change="(value: boolean | string | number) => handleEnabledChange(row, Boolean(value))"
              />
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" min-width="170" />
          <el-table-column label="操作" width="230" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" :icon="Edit" @click="openEditDialog(row)">编辑</el-button>
              <el-button link type="success" :icon="Setting" @click="openParamPanel(row)">参数配置</el-button>
              <el-button link type="danger" :icon="Delete" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <section class="panel param-panel">
        <div class="param-header">
          <div>
            <span class="eyebrow">Parameter Console</span>
            <h3>{{ activeStrategy ? activeStrategy.name : '策略参数配置' }}</h3>
          </div>
          <el-tag v-if="activeStrategy" effect="dark">{{ getStrategyTypeLabel(activeStrategy.type) }}</el-tag>
        </div>

        <div v-if="!activeStrategy" class="param-empty">
          <el-icon><Setting /></el-icon>
          <strong>选择一个策略进行参数配置</strong>
          <span>不同策略类型会展示对应的参数结构。</span>
        </div>

        <el-form
          v-else
          ref="paramFormRef"
          v-loading="paramLoading"
          :model="paramForm"
          :rules="paramRules"
          label-position="top"
          class="param-form"
        >
          <template v-if="activeStrategy.type === 'MA_CROSS'">
            <el-form-item label="shortWindow 短周期" prop="shortWindow">
              <el-input-number v-model="paramForm.shortWindow" :min="1" :max="250" controls-position="right" />
            </el-form-item>
            <el-form-item label="longWindow 长周期" prop="longWindow">
              <el-input-number v-model="paramForm.longWindow" :min="2" :max="500" controls-position="right" />
            </el-form-item>
            <el-form-item label="positionRatio 仓位比例" prop="positionRatio">
              <el-input-number
                v-model="paramForm.positionRatio"
                :min="0.01"
                :max="1"
                :step="0.01"
                :precision="2"
                controls-position="right"
              />
            </el-form-item>
          </template>

          <template v-if="activeStrategy.type === 'MACD'">
            <el-form-item label="fastPeriod 快线周期" prop="fastPeriod">
              <el-input-number v-model="paramForm.fastPeriod" :min="1" :max="100" controls-position="right" />
            </el-form-item>
            <el-form-item label="slowPeriod 慢线周期" prop="slowPeriod">
              <el-input-number v-model="paramForm.slowPeriod" :min="2" :max="200" controls-position="right" />
            </el-form-item>
            <el-form-item label="signalPeriod 信号周期" prop="signalPeriod">
              <el-input-number v-model="paramForm.signalPeriod" :min="1" :max="100" controls-position="right" />
            </el-form-item>
          </template>

          <template v-if="activeStrategy.type === 'BREAKOUT'">
            <el-form-item label="lookbackPeriod 回看周期" prop="lookbackPeriod">
              <el-input-number v-model="paramForm.lookbackPeriod" :min="2" :max="500" controls-position="right" />
            </el-form-item>
            <el-form-item label="breakoutRatio 突破比例" prop="breakoutRatio">
              <el-input-number
                v-model="paramForm.breakoutRatio"
                :min="0.001"
                :max="0.2"
                :step="0.001"
                :precision="3"
                controls-position="right"
              />
            </el-form-item>
          </template>

          <div class="param-actions">
            <el-button @click="resetParams">恢复默认</el-button>
            <el-button type="primary" :loading="paramSaving" @click="submitParams">保存参数</el-button>
          </div>
        </el-form>
      </section>
    </div>

    <el-dialog v-model="strategyDialogVisible" :title="strategyDialogTitle" width="520px">
      <el-form
        ref="strategyFormRef"
        :model="strategyForm"
        :rules="strategyRules"
        label-position="top"
      >
        <el-form-item label="策略名称" prop="name">
          <el-input v-model.trim="strategyForm.name" maxlength="40" show-word-limit placeholder="请输入策略名称" />
        </el-form-item>
        <el-form-item label="策略类型" prop="type">
          <el-select v-model="strategyForm.type" placeholder="请选择策略类型">
            <el-option
              v-for="item in strategyTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="策略描述" prop="description">
          <el-input
            v-model.trim="strategyForm.description"
            type="textarea"
            :rows="4"
            maxlength="200"
            show-word-limit
            placeholder="说明策略逻辑、适用品种或风险边界"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="strategyDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="strategySaving" @click="submitStrategy">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  Delete,
  Edit,
  Plus,
  Setting
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { computed, onMounted, reactive, ref } from 'vue';

import {
  createStrategy,
  deleteStrategy,
  getStrategies,
  getStrategyDetail,
  saveStrategyParams,
  updateStrategy
} from '@/api/strategyApi';
import type {
  BreakoutParams,
  DoubleMaParams,
  MacdParams,
  StrategyItem,
  StrategyParamItem,
  StrategyParams,
  StrategyPayload,
  StrategyType
} from '@/types/strategy';

type StrategyForm = Pick<StrategyPayload, 'name' | 'type' | 'description'>;
type ParamForm = Partial<DoubleMaParams & MacdParams & BreakoutParams>;

const strategyTypeOptions: Array<{ label: string; value: StrategyType }> = [
  {
    label: '双均线策略',
    value: 'MA_CROSS'
  },
  {
    label: 'MACD 策略',
    value: 'MACD'
  },
  {
    label: '突破策略',
    value: 'BREAKOUT'
  }
];

const typeFilterOptions = [
  {
    label: '全部',
    value: 'ALL'
  },
  ...strategyTypeOptions
];

const defaultParams: Record<StrategyType, StrategyParams> = {
  MA_CROSS: {
    shortWindow: 5,
    longWindow: 20,
    positionRatio: 0.3
  },
  MACD: {
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9
  },
  BREAKOUT: {
    lookbackPeriod: 20,
    breakoutRatio: 0.03
  }
};

const strategies = ref<StrategyItem[]>([]);
const loading = ref(false);
const strategyDialogVisible = ref(false);
const strategySaving = ref(false);
const editingStrategy = ref<StrategyItem | null>(null);
const enabledLoadingId = ref<number | string | null>(null);
const typeFilter = ref('ALL');
const activeStrategy = ref<StrategyItem | null>(null);
const paramLoading = ref(false);
const paramSaving = ref(false);
const strategyFormRef = ref<FormInstance>();
const paramFormRef = ref<FormInstance>();

const strategyForm = reactive<StrategyForm>({
  name: '',
  type: 'MA_CROSS',
  description: ''
});

const paramForm = reactive<ParamForm>({});

const strategyRules: FormRules<StrategyForm> = {
  name: [
    {
      required: true,
      message: '请输入策略名称',
      trigger: 'blur'
    },
    {
      min: 2,
      max: 40,
      message: '策略名称长度需在 2 到 40 个字符之间',
      trigger: 'blur'
    }
  ],
  type: [
    {
      required: true,
      message: '请选择策略类型',
      trigger: 'change'
    }
  ],
  description: [
    {
      max: 200,
      message: '策略描述不能超过 200 个字符',
      trigger: 'blur'
    }
  ]
};

const paramRules = computed<FormRules<ParamForm>>(() => {
  if (activeStrategy.value?.type === 'MA_CROSS') {
    return {
      shortWindow: [{ required: true, message: '请输入短周期', trigger: 'blur' }],
      longWindow: [{ required: true, message: '请输入长周期', trigger: 'blur' }],
      positionRatio: [{ required: true, message: '请输入仓位比例', trigger: 'change' }]
    };
  }

  if (activeStrategy.value?.type === 'MACD') {
    return {
      fastPeriod: [{ required: true, message: '请输入快线周期', trigger: 'blur' }],
      slowPeriod: [{ required: true, message: '请输入慢线周期', trigger: 'blur' }],
      signalPeriod: [{ required: true, message: '请输入信号周期', trigger: 'blur' }]
    };
  }

  return {
    lookbackPeriod: [{ required: true, message: '请输入回看周期', trigger: 'blur' }],
    breakoutRatio: [{ required: true, message: '请输入突破比例', trigger: 'change' }]
  };
});

const strategyDialogTitle = computed(() => (editingStrategy.value ? '编辑策略' : '新增策略'));

const filteredStrategies = computed(() => {
  if (typeFilter.value === 'ALL') {
    return strategies.value;
  }

  return strategies.value.filter((item) => item.type === typeFilter.value);
});

const getStrategyTypeLabel = (type: StrategyType) => {
  return strategyTypeOptions.find((item) => item.value === type)?.label || type;
};

const getStrategyTagType = (type: StrategyType) => {
  const tagTypeMap: Record<StrategyType, 'success' | 'warning' | 'info'> = {
    MA_CROSS: 'success',
    MACD: 'warning',
    BREAKOUT: 'info'
  };

  return tagTypeMap[type];
};

const createStrategyCode = (name: string, type: StrategyType) => {
  const normalizedName = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const codeSuffix = normalizedName || String(Date.now());

  return `${type.toLowerCase()}_${codeSuffix}`;
};

const getParamValue = (params: StrategyParamItem[] | undefined, key: string, defaultValue: number) => {
  const value = params?.find((item) => item.paramKey === key)?.paramValue;
  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : defaultValue;
};

const assignParams = (params: StrategyParams) => {
  Object.keys(paramForm).forEach((key) => {
    delete paramForm[key as keyof ParamForm];
  });
  Object.assign(paramForm, params);
};

const toFormParams = (type: StrategyType, params: StrategyParamItem[] | undefined): StrategyParams => {
  if (type === 'MA_CROSS') {
    const defaults = defaultParams.MA_CROSS as DoubleMaParams;

    return {
      shortWindow: getParamValue(params, 'shortPeriod', defaults.shortWindow),
      longWindow: getParamValue(params, 'longPeriod', defaults.longWindow),
      positionRatio: getParamValue(params, 'positionRatio', defaults.positionRatio)
    };
  }

  if (type === 'MACD') {
    const defaults = defaultParams.MACD as MacdParams;

    return {
      fastPeriod: getParamValue(params, 'fastPeriod', defaults.fastPeriod),
      slowPeriod: getParamValue(params, 'slowPeriod', defaults.slowPeriod),
      signalPeriod: getParamValue(params, 'signalPeriod', defaults.signalPeriod)
    };
  }

  const defaults = defaultParams.BREAKOUT as BreakoutParams;

  return {
    lookbackPeriod: getParamValue(params, 'lookbackPeriod', defaults.lookbackPeriod),
    breakoutRatio: getParamValue(params, 'breakoutRatio', defaults.breakoutRatio)
  };
};

const getCurrentParams = (): StrategyParams => {
  if (activeStrategy.value?.type === 'MA_CROSS') {
    return {
      shortWindow: Number(paramForm.shortWindow),
      longWindow: Number(paramForm.longWindow),
      positionRatio: Number(paramForm.positionRatio)
    };
  }

  if (activeStrategy.value?.type === 'MACD') {
    return {
      fastPeriod: Number(paramForm.fastPeriod),
      slowPeriod: Number(paramForm.slowPeriod),
      signalPeriod: Number(paramForm.signalPeriod)
    };
  }

  return {
    lookbackPeriod: Number(paramForm.lookbackPeriod),
    breakoutRatio: Number(paramForm.breakoutRatio)
  };
};

const toParamItems = (type: StrategyType, params: StrategyParams): StrategyParamItem[] => {
  if (type === 'MA_CROSS') {
    const maParams = params as DoubleMaParams;

    return [
      {
        paramKey: 'shortPeriod',
        paramValue: String(maParams.shortWindow),
        paramType: 'NUMBER',
        remark: '短期均线周期'
      },
      {
        paramKey: 'longPeriod',
        paramValue: String(maParams.longWindow),
        paramType: 'NUMBER',
        remark: '长期均线周期'
      },
      {
        paramKey: 'positionRatio',
        paramValue: String(maParams.positionRatio),
        paramType: 'NUMBER',
        remark: '仓位比例'
      }
    ];
  }

  if (type === 'MACD') {
    const macdParams = params as MacdParams;

    return [
      {
        paramKey: 'fastPeriod',
        paramValue: String(macdParams.fastPeriod),
        paramType: 'NUMBER',
        remark: '快线周期'
      },
      {
        paramKey: 'slowPeriod',
        paramValue: String(macdParams.slowPeriod),
        paramType: 'NUMBER',
        remark: '慢线周期'
      },
      {
        paramKey: 'signalPeriod',
        paramValue: String(macdParams.signalPeriod),
        paramType: 'NUMBER',
        remark: '信号周期'
      }
    ];
  }

  const breakoutParams = params as BreakoutParams;

  return [
    {
      paramKey: 'lookbackPeriod',
      paramValue: String(breakoutParams.lookbackPeriod),
      paramType: 'NUMBER',
      remark: '回看周期'
    },
    {
      paramKey: 'breakoutRatio',
      paramValue: String(breakoutParams.breakoutRatio),
      paramType: 'NUMBER',
      remark: '突破比例'
    }
  ];
};

const buildStrategyPayload = (enabled: boolean): StrategyPayload => {
  return {
    name: strategyForm.name,
    code: editingStrategy.value?.code || createStrategyCode(strategyForm.name, strategyForm.type),
    type: strategyForm.type,
    description: strategyForm.description,
    enabled
  };
};

const validateParamRelation = () => {
  if (activeStrategy.value?.type === 'MA_CROSS' && Number(paramForm.shortWindow) >= Number(paramForm.longWindow)) {
    ElMessage.warning('短周期必须小于长周期');
    return false;
  }

  if (activeStrategy.value?.type === 'MACD' && Number(paramForm.fastPeriod) >= Number(paramForm.slowPeriod)) {
    ElMessage.warning('MACD 快线周期必须小于慢线周期');
    return false;
  }

  return true;
};

const loadStrategies = async () => {
  loading.value = true;
  try {
    strategies.value = await getStrategies();
  } finally {
    loading.value = false;
  }
};

const openCreateDialog = () => {
  editingStrategy.value = null;
  Object.assign(strategyForm, {
    name: '',
    type: 'MA_CROSS',
    description: ''
  });
  strategyDialogVisible.value = true;
};

const openEditDialog = (strategy: StrategyItem) => {
  editingStrategy.value = strategy;
  Object.assign(strategyForm, {
    name: strategy.name,
    type: strategy.type,
    description: strategy.description || ''
  });
  strategyDialogVisible.value = true;
};

const submitStrategy = async () => {
  if (!strategyFormRef.value) {
    return;
  }

  await strategyFormRef.value.validate();
  strategySaving.value = true;

  try {
    if (editingStrategy.value) {
      await updateStrategy(editingStrategy.value.id, buildStrategyPayload(editingStrategy.value.enabled));
      ElMessage.success('策略已更新');
    } else {
      const params = toParamItems(strategyForm.type, defaultParams[strategyForm.type]);
      await createStrategy({
        ...buildStrategyPayload(true),
        params
      });
      ElMessage.success('策略已创建');
    }

    strategyDialogVisible.value = false;
    await loadStrategies();
  } finally {
    strategySaving.value = false;
  }
};

const openParamPanel = async (strategy: StrategyItem) => {
  activeStrategy.value = strategy;
  assignParams(defaultParams[strategy.type]);
  paramLoading.value = true;

  try {
    const detail = await getStrategyDetail(strategy.id);
    activeStrategy.value = detail;
    assignParams(toFormParams(detail.type, detail.params));
  } finally {
    paramLoading.value = false;
  }
};

const resetParams = () => {
  if (!activeStrategy.value) {
    return;
  }

  assignParams(defaultParams[activeStrategy.value.type]);
};

const submitParams = async () => {
  if (!activeStrategy.value || !paramFormRef.value) {
    return;
  }

  await paramFormRef.value.validate();

  if (!validateParamRelation()) {
    return;
  }

  paramSaving.value = true;
  try {
    const params = toParamItems(activeStrategy.value.type, getCurrentParams());
    await saveStrategyParams(activeStrategy.value.id, {
      params
    });
    activeStrategy.value.params = params;
    ElMessage.success('策略参数已保存');
  } finally {
    paramSaving.value = false;
  }
};

const handleEnabledChange = async (strategy: StrategyItem, enabled: boolean) => {
  enabledLoadingId.value = strategy.id;
  const previousEnabled = !enabled;

  try {
    await updateStrategy(strategy.id, {
      name: strategy.name,
      code: strategy.code,
      type: strategy.type,
      description: strategy.description || '',
      enabled
    });
    ElMessage.success(enabled ? '策略已启用' : '策略已停用');
  } catch (error) {
    strategy.enabled = previousEnabled;
    throw error;
  } finally {
    enabledLoadingId.value = null;
  }
};

const handleDelete = async (strategy: StrategyItem) => {
  await ElMessageBox.confirm(`确认删除策略「${strategy.name}」？`, '删除策略', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  });

  await deleteStrategy(strategy.id);
  ElMessage.success('策略已删除');

  if (activeStrategy.value?.id === strategy.id) {
    activeStrategy.value = null;
    assignParams(defaultParams.MA_CROSS);
  }

  await loadStrategies();
};

onMounted(() => {
  loadStrategies();
});
</script>

<style scoped>
.strategy-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.strategy-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px;
  border: 1px solid rgba(14, 165, 233, 0.2);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(17, 94, 89, 0.88)),
    #0f172a;
  color: #ffffff;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
}

.strategy-hero h2,
.strategy-hero p {
  margin: 0;
}

.strategy-hero h2 {
  margin-top: 6px;
  font-size: 24px;
}

.strategy-hero p {
  margin-top: 8px;
  color: #b6d1dd;
  font-size: 13px;
}

.eyebrow {
  color: #22d3ee;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.strategy-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(340px, 0.8fr);
  gap: 18px;
}

.strategy-list-panel,
.param-panel {
  min-width: 0;
}

.strategy-toolbar,
.param-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}

.strategy-toolbar h3,
.param-header h3 {
  margin: 0;
  color: #0f172a;
  font-size: 17px;
}

.strategy-toolbar span {
  display: inline-block;
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
}

.strategy-table {
  --el-table-header-bg-color: #f8fafc;
  --el-table-row-hover-bg-color: rgba(34, 211, 238, 0.08);
}

.strategy-name-cell strong,
.strategy-name-cell span {
  display: block;
}

.strategy-name-cell strong {
  color: #0f172a;
  font-size: 14px;
}

.strategy-name-cell span {
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
}

.param-panel {
  background:
    linear-gradient(180deg, rgba(248, 250, 252, 0.98), rgba(255, 255, 255, 0.94)),
    #ffffff;
}

.param-empty {
  display: grid;
  place-items: center;
  min-height: 320px;
  color: #64748b;
  text-align: center;
}

.param-empty .el-icon {
  color: #0891b2;
  font-size: 34px;
}

.param-empty strong {
  margin-top: 14px;
  color: #0f172a;
}

.param-empty span {
  margin-top: 6px;
  font-size: 13px;
}

.param-form {
  padding-top: 4px;
}

.param-form :deep(.el-input-number) {
  width: 100%;
}

.param-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 8px;
}

@media (max-width: 1180px) {
  .strategy-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .strategy-hero,
  .strategy-toolbar,
  .param-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .strategy-hero .el-button,
  .strategy-toolbar .el-segmented {
    width: 100%;
  }
}
</style>
