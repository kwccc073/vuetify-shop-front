<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-center">註冊</h1>
      </v-col>
      <v-divider></v-divider> //分隔線
      <v-col cols="12">
        <v-form @submit.prevent="submit" :disabled="isSubmitting">
          <!-- counter 表示顯示字符計數器，告訴用戶當前輸入了多少字符，以及最大允許的字符數。
              例如：帳號會顯示 X/20-->
          <v-text-field
            label="帳號"
            minlength="4" maxlength="20" counter
            v-model="account.value.value"
            :error-messages="account.errorMessage.value"
          ></v-text-field>
          <v-text-field
            label="信箱" type="email"
            v-model="email.value.value"
            :error-messages="email.errorMessage.value"
          ></v-text-field>
          <v-text-field
            label="密碼" type="password"
            minlength="4" maxlength="20" counter
            v-model="password.value.value"
            :error-messages="password.errorMessage.value"
          ></v-text-field>
          <v-text-field
            label="確認密碼" type="password"
            minlength="4" maxlength="20" counter
            v-model="passwordConfirm.value.value"
            :error-messages="passwordConfirm.errorMessage.value"
          ></v-text-field>
          <div class="text-center">
            <v-btn type="submit" color="green" :loading="isSubmitting">註冊</v-btn>
          </div>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// 引入驗證套件
import { useForm, useField } from 'vee-validate'
// 引入格式驗證之套件
import * as yup from 'yup'
import validator from 'validator'
import { useApi } from '@/composables/axios'
import { useRouter } from 'vue-router'
import { definePage } from 'vue-router/auto'
import { useSnackbar } from 'vuetify-use-dialog'


definePage({
  meta: {
    title: '購物網 | 註冊',
    login: false, //此頁需不需要登入
    admin: false // 此頁需不需要管理員身分
  }
})

const { api } = useApi()
const router = useRouter()
const createSnackbar = useSnackbar()

// 表單有什麼欄位裡面就放什麼欄位當key，key建議和後端一樣
const schema = yup.object({
  account: yup
    // ''裡為錯誤訊息
    .string() // 此欄位為文字
    .required('使用者帳號必填') // 此欄位為必填
    .min(4, '使用者帳號長度不符') // 最少4個字
    .max(20, '使用者帳號長度不符')
    .test(
      // .test(自訂驗證名稱, 錯誤訊息, 驗證 function)
      'isAlphanumeric', '使用者帳號格式錯誤',
      (value) => {
        return validator.isAlphanumeric(value)
      }
    ),
  email: yup
    .string()
    .required('使用者信箱必填')
    .test(
      'isEmail', '使用者信箱格式錯誤',
      (value) => {
        return validator.isEmail(value)
      }
    ),
  password: yup
    .string()
    .required('使用者密碼必填')
    .min(4, '使用者密碼長度不符')
    .max(20, '使用者密碼長度不符'),
  passwordConfirm: yup
    .string()
    // .oneOf()前面一定要有.string()
    // .oneOf(陣列, 錯誤訊息) 只允許符合陣列內其中一個值
    // .ref('password')     代表這個 schema 的 password 的欄位值
    .oneOf([yup.ref('password')], '密碼不一致')
})
// useForm()建立表單 (順序不可顛倒)------------------------------------------------------------
// useForm()來自vee-validate套件
// 解構出handleSubmit (處理送出表單的動作) 和 isSubmitting (判斷表單是否在送出)
// 指定驗證格式使用上方建立的schema
const { handleSubmit, isSubmitting } = useForm({
  validationSchema: schema
})
// useField()建立表單的各個欄位 (順序不可顛倒)---------------------------------------------
// useField()來自vee-validate套件
// 欄位名稱要跟跟上方schema的一樣
// v-model綁這些值，例如上方的v-model='account.value.value'
const account = useField('account')
const email = useField('email')
const password = useField('password')
const passwordConfirm = useField('passwordConfirm')

const submit = handleSubmit(async (values) => {
  try {
    await api.post('/user', {
      account: values.account,
      email: values.email,
      password: values.password
    })
    createSnackbar({
      text: '註冊成功',
      snackbarProps: {
        color: 'green'
      }
    })
    router.push('/login')
  } catch (error) {
    console.log(error)
    createSnackbar({
      text: error?.response?.data?.message || '發生錯誤',
      snackbarProps: {
        color: 'red'
      }
    })
  }
})
</script>
