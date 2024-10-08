<template>
  <!-- 手機版 側欄------------------------------------------------------------------------------------------ -->
  <v-navigation-drawer v-if="mobile" v-model="drawer">
    <v-list nav>
      <template v-for="item in navItems" :key="item.to">
        <v-list-item
          :prepend-icon="item.icon" :to="item.to"
          :title="item.text"
          v-if="item.show"
        >
        <!-- append 是一個具名插槽，用於在某些組件中指定額外的內容 -->
        <!-- 用於在v-list-item的尾部添圖標 -->
          <template #append>
            <!-- 購物車右上角的紅點
            參考：https://vuetifyjs.com/en/components/badges/#usage -->
            <v-badge color="error" :content="user.cart" v-if="item.to === '/cart' && user.cart > 0" inline></v-badge>
          </template>
        </v-list-item>
      </template>
      <!-- 登出按鈕 -->
      <v-list-item prepend-icon="mdi-account-arrow-right" v-if="user.isLogin" title="登出" @click="logout"></v-list-item>
    </v-list>
  </v-navigation-drawer>
  <!--導覽列------------------------------------------------------------------------------------------ -->
  <v-app-bar>
    <v-container class="d-flex align-center">
      <!-- 標題 -->
      <v-btn to="/" :active="false">購物網</v-btn>
      <v-spacer />
      <!-- 當為手機尺寸時，使用漢堡按鈕 -->
      <template v-if="mobile">
        <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>
      </template>
      <template v-else>
        <!-- 電腦版選單 -->
        <template v-for="item in navItems" :key="item.to">
          <v-btn v-if="item.show" :prepend-icon="item.icon" :to="item.to">
            {{ item.text }}
            <!-- 購物車右上角的紅點
            參考：https://vuetifyjs.com/en/components/badges/#usage -->
            <v-badge color="red" :content="user.cart" v-if="item.to === '/cart' && user.cart > 0" floating></v-badge>
          </v-btn>
        </template>
        <!-- 登出按鈕 -->
        <v-btn prepend-icon="mdi-account-arrow-right" v-if="user.isLogin" @click="logout">登出</v-btn>
      </template>
    </v-container>
  </v-app-bar>
  <!-- 主要內容 -->
  <v-main>
    <router-view></router-view>
  </v-main>
</template>

<script setup>
import { ref, computed } from 'vue'
// RWD斷點
import { useDisplay } from 'vuetify'
// 引入使用者的狀態
import { useUserStore } from '@/stores/user'
import { useSnackbar } from 'vuetify-use-dialog'

const { mobile } = useDisplay() // 手機斷點
const user = useUserStore()
const createSnackbar = useSnackbar()

// 判斷是否點擊漢堡按鈕
const drawer = ref(false)

// 導覽列 --------------------------------------------------------------------------
const navItems = computed(() => {
  return [
    { to: '/register', text: '註冊', icon: 'mdi-account-plus', show: !user.isLogin },
    { to: '/login', text: '登入', icon: 'mdi-account-arrow-left', show: !user.isLogin },
    { to: '/cart', text: '購物車', icon: 'mdi-cart', show: user.isLogin },
    { to: '/orders', text: '訂單', icon: 'mdi-list-box', show: user.isLogin },
    { to: '/admin', text: '管理', icon: 'mdi-cog', show: user.isLogin && user.isAdmin }
  ]
})

const logout = async () => {
  await user.logout()
  createSnackbar({
    text: '登出成功',
    snackbarProps: {
      color: 'green'
    }
  })
}
</script>
