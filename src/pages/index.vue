<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-center">購物網</h1>
      </v-col>
      <v-col
        cols="12" md="6" lg="3"
        v-for="product in products" :key="product._id"
      >
        <!-- v-bind 一次把所有東西丟進去-->
        <ProductCard v-bind="product"></ProductCard>
      </v-col>
      <v-col cols="12">
        <!-- @update:model-value="loadProducts"
            當這個元件要更新v-model時（例如上一頁、下一頁或直接點頁碼）就會觸發loadProducts這個函式 -->
        <v-pagination v-model="page" :length="pages" rounded="circle" @update:model-value="loadProducts"></v-pagination>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { definePage } from 'vue-router/auto'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
// 引入自定義元件
import ProductCard from '@/components/ProductCard.vue'

definePage({
  meta: {
    title: '購物網',
    login: false,
    admin: false
  }
})

const { api } = useApi()
const createSnackbar = useSnackbar()

const page = ref(1) // 現在第幾頁
const pages = ref(1) // 總共幾頁
const ITEMS_PER_PAGE = 20 // 一頁20個

const products = ref([]) // 商品

// 取商品的function
const loadProducts = async () => {
  try {
    const { data } = await api.get('/product', {
      // 傳參數讓後端知道一頁有幾個
      params: {
        // 沒有做排序就會預設照時間排ㄋ
        itemsPerPage: ITEMS_PER_PAGE,
        page: page.value
      }
    })
    pages.value = Math.ceil(data.result.total / ITEMS_PER_PAGE) // 總共幾頁
    // 把products陣列裡的內容換掉：從第0個開始清除, products陣列長度個, 
    products.value.splice(0, products.value.length, ...data.result.data)
  } catch (error) {
    console.log(error)
    createSnackbar({
      text: error?.response?.data?.message || '發生錯誤',
      snackbarProps: {
        color: 'red'
      }
    })
  }
}
loadProducts()
</script>
