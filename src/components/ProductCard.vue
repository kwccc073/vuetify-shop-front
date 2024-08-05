<template>
  <v-card>
    <v-img :src="image" cover height="200"></v-img>
    <v-card-title>
      <router-link :to="'/products/' + _id">{{ name }}</router-link>
    </v-card-title>
    <v-card-subtitle>${{ price }}</v-card-subtitle>
    <v-card-text>
      {{ description }}
    </v-card-text>
    <v-card-actions>
      <!-- v-spacer會自動把東西推到右邊 -->
      <v-spacer></v-spacer>
      <v-btn color="primary" prepend-icon="mdi-cart" @click="addCart" :loading="loading">加入購物車</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { useUserStore } from '@/stores/user' // stores
import { useRouter } from 'vue-router' // 路由
import { useSnackbar } from 'vuetify-use-dialog'
import { ref } from 'vue'

const user = useUserStore()
const router = useRouter()
const createSnackbar = useSnackbar()

// props表示元件可以接收的資料，defineProps()是script setup的固定寫法（不須import）
// 可以一個個定義每個東西的型態、預設值等
const props = defineProps(['_id', 'category', 'description', 'image', 'name', 'price', 'sell'])

const loading = ref(false) // UIUX用，使按下去時按鈕為載入狀態（避免一直點）

const addCart = async () => {
  // 如果沒有登入
  if (!user.isLogin) {
    // 就跳到登入頁
    router.push('/login')
    return
  }
  loading.value = true // 還沒跑完的時候loading為true
  const result = await user.addCart(props._id, 1)
  createSnackbar({
    text: result.text,
    snackbarProps: {
      color: result.color
    }
  })
  loading.value = false // 跑完的時候loading為false
}
</script>
