import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

import MainLayout from '@/layouts/MainLayout.vue';
import { useUserStore } from '@/stores/user';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录'
    }
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: {
          title: '首页'
        }
      },
      {
        path: 'watchlist',
        name: 'Watchlist',
        component: () => import('@/views/Watchlist.vue'),
        meta: {
          title: '自选股'
        }
      },
      {
        path: 'strategy',
        name: 'Strategy',
        component: () => import('@/views/Strategy.vue'),
        meta: {
          title: '策略管理'
        }
      },
      {
        path: 'backtest',
        name: 'Backtest',
        component: () => import('@/views/Backtest.vue'),
        meta: {
          title: '回测中心'
        }
      },
      {
        path: 'paper-trading',
        name: 'PaperTrading',
        component: () => import('@/views/PaperTrading.vue'),
        meta: {
          title: '模拟交易'
        }
      },
      {
        path: 'risk-control',
        name: 'RiskControl',
        component: () => import('@/views/RiskControl.vue'),
        meta: {
          title: '风控配置'
        }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue'),
        meta: {
          title: '系统设置'
        }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  const userStore = useUserStore();

  if (to.path !== '/login' && !userStore.isLoggedIn) {
    return {
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    };
  }

  if (to.path === '/login' && userStore.isLoggedIn) {
    return '/dashboard';
  }

  return true;
});

export default router;
