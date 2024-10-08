// 管理要儲存的東西
// Utilities
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import UserRole from '@/enums/UserRole.js'
import { useApi } from '@/composables/axios'

export const useUserStore = defineStore('user', () => {
  const { api, apiAuth } = useApi()

  const token = ref('')
  const account = ref('')
  const role = ref(UserRole.USER) // 使用者
  const cart = ref(0)

  // 是否登入
  const isLogin = computed(() => {
    // 以token的值是否為0來判斷
    return token.value.length > 0
  })

  // 是否為管理員
  const isAdmin = computed(() => {
    return role.value === UserRole.ADMIN
  })

  // 登入---------------------------------------------------------------------
  // 登入要對使用者的store做操作，操作成功要把上方的token、account等值換掉
  // 有些人覺得登入是表單送出，所以把請求的API放在page裡
  // 為了方便管理，老師把登入的請求放在user的store這邊(此檔案的import { useApi } from '@/composables/axios')
  const login = async (values) => {
    try {
      const { data } = await api.post('/user/login', values)
      // 跟後端的controllerss的檔案user.js登入後回傳的資料一樣
      token.value = data.result.token
      account.value = data.result.account
      role.value = data.result.role
      cart.value = data.result.cart
      return '登入成功'
    } catch (error) {
      console.log(error)
      return error?.response?.data?.message || '發生錯誤，請稍後再試'
    }
  }

  const profile = async () => {
    if (!isLogin.value) return
    // 有登入才做處理
    try {
      // 把使用者的token帶出去
      const { data } = await apiAuth.get('/user/profile')
      account.value = data.result.account
      role.value = data.result.role
      cart.value = data.result.cart
    } catch (error) {
      // 錯誤的話把東西清空
      token.value = ''
      account.value = ''
      role.value = UserRole.USER
      cart.value = 0
    }
  }

  // 登出------------------------------------------------------------------------------
  const logout = async () => {
    try {
      // 登出需要JWT，所以用apiAuth
      await apiAuth.delete('/user/logout')
    } catch (error) {
      // 一定要console.log(error)才看的到錯誤
      console.log(error)
    }
    // 登出要將所有值重設
    token.value = ''
    account.value = ''
    role.value = UserRole.USER
    cart.value = 0
  }

  // 加入購物車-------------------------------------------------
  const addCart = async (product, quantity) => {
    try {
      const { data } = await apiAuth.patch('/user/cart', {
        product, quantity
      })
      cart.value = data.result
      return {
        color: 'green',
        text: '加入購物車成功-stores'
      }
    } catch (error) {
      return {
        color: 'red',
        text: error?.response?.data?.message || '發生錯誤，請稍後再試'
      }
    }
  }

  // 結帳-------------------------------------------------------------
  const checkout = async () => {
    try {
      await apiAuth.post('/order')
      cart.value = 0
      return {
        color: 'green',
        text: '成功'
      }
    } catch (error) {
      return {
        color: 'red',
        text: error?.response?.data?.message || '發生錯誤，請稍後再試'
      }
    }
  }

  return {
    token,
    account,
    role,
    cart,
    isLogin,
    isAdmin,
    login,
    profile,
    logout,
    addCart,
    checkout
  }
}, {
  // 保存localstorage的設定
  persist: {
    // 存儲在瀏覽器local storage中的鍵名
    key: 'shop',
    // 需要持久儲存的東西
    paths: ['token']
  }
})
