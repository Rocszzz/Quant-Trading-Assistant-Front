<template>
  <el-container class="app-layout">
    <el-aside width="240px" class="app-sidebar">
      <div class="brand">
        <div class="brand-mark">Q</div>
        <div>
          <strong>Quant Assistant</strong>
          <span>量化投资工作台</span>
        </div>
      </div>
      <el-menu
        class="side-menu"
        router
        :default-active="activePath"
        background-color="#101827"
        text-color="#9ca3af"
        active-text-color="#22d3ee"
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="app-header">
        <div>
          <h1>{{ currentTitle }}</h1>
          <p>实时关注策略、资金、风险与模拟交易状态</p>
        </div>
        <el-dropdown @command="handleCommand">
          <div class="user-panel">
            <el-avatar :size="36">{{ userInitial }}</el-avatar>
            <div>
              <strong>{{ userStore.displayName }}</strong>
              <span>{{ userStore.roleName }}</span>
            </div>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="settings">系统设置</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>

      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>

    <nav class="mobile-bottom-nav" aria-label="移动端主导航">
      <router-link
        v-for="item in mobileMenuItems"
        :key="item.path"
        :to="item.path"
        class="mobile-nav-item"
        :class="{ active: activePath === item.path }"
      >
        <el-icon>
          <component :is="item.icon" />
        </el-icon>
        <span>{{ item.title }}</span>
      </router-link>
      <button type="button" class="mobile-nav-item mobile-nav-button" @click="moreDrawerVisible = true">
        <el-icon>
          <Menu />
        </el-icon>
        <span>更多</span>
      </button>
    </nav>

    <el-drawer v-model="moreDrawerVisible" title="更多功能" direction="btt" size="46%" class="mobile-more-drawer">
      <div class="mobile-more-grid">
        <router-link
          v-for="item in moreMenuItems"
          :key="item.path"
          :to="item.path"
          class="mobile-more-item"
          @click="moreDrawerVisible = false"
        >
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.title }}</span>
        </router-link>
      </div>
    </el-drawer>
  </el-container>
</template>

<script setup lang="ts">
import {
  DataAnalysis,
  Histogram,
  Menu,
  Monitor,
  Operation,
  Setting,
  Star,
  TrendCharts
} from '@element-plus/icons-vue';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { logout as logoutApi } from '@/api/auth';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const moreDrawerVisible = ref(false);

const menuItems = [
  {
    path: '/dashboard',
    title: '首页',
    icon: DataAnalysis
  },
  {
    path: '/watchlist',
    title: '自选股',
    icon: Star
  },
  {
    path: '/strategy',
    title: '策略管理',
    icon: TrendCharts
  },
  {
    path: '/backtest',
    title: '回测中心',
    icon: Histogram
  },
  {
    path: '/paper-trading',
    title: '模拟交易',
    icon: Monitor
  },
  {
    path: '/risk-control',
    title: '风控配置',
    icon: Operation
  },
  {
    path: '/settings',
    title: '系统设置',
    icon: Setting
  }
];

const mobileMenuItems = [
  menuItems[0],
  menuItems[1],
  menuItems[2]
];

const moreMenuItems = [
  menuItems[3],
  menuItems[4],
  menuItems[5],
  menuItems[6]
];

const activePath = computed(() => route.path);
const currentTitle = computed(() => String(route.meta.title || '首页'));
const userInitial = computed(() => userStore.displayName.slice(0, 1).toUpperCase());

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    try {
      await logoutApi();
    } finally {
      userStore.logout();
      router.push('/login');
    }
    return;
  }

  if (command === 'settings') {
    router.push('/settings');
  }
};
</script>
