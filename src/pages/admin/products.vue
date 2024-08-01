<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-center">商品管理</h1>
      </v-col>
      <v-col cols="12">
        <v-btn color="green" @click="openDialog(null)">新增商品</v-btn>
      </v-col>
      <v-col cols="12">
        <!-- 商品表格--------------------------------------------------------- -->
        <!-- v-data-table-server 是有翻頁、排序功能的表格，使後端只會回傳當下那個頁面的東西（比較不會跑太久） -->
        <!-- 要綁定的屬性
        items-per-page 一頁顯示幾個
        sort-by 在表格的哪個欄位，用什麼東西去排序
        page 頁碼，表示表格現在被翻到哪一頁
        headers 表格欄位設定
        items 表示表格要顯示的東西
        items-length 每一頁加起來總共有幾筆資料
        loading 載入狀態
        search 現在搜尋的文字是什麼

        @update:items-per-page 當"每一頁顯示幾筆"改變時，要執行後方function去重新取資料
        @update:sort-by 當"排序"改變時，要執行後方function去重新取資料
        @update:page 當"翻頁"時，要執行後方function去重新取資料
        
        -->
        <v-data-table-server
          v-model:items-per-page="tableItemsPerPage"
          v-model:sort-by="tableSortBy"
          v-model:page="tablePage"
          :items="tableItems"
          :headers="tableHeaders"
          :loading="tableLoading"
          :items-length="tableItemsLength"
          :search="tableSearch"
          @update:items-per-page="tableLoadItems(false)"
          @update:sort-by="tableLoadItems(false)"
          @update:page="tableLoadItems(false)"
          hover
        >
        <!-- 特定的東西（如圖片）要修改顯示內容的方式如下---------------------- -->
          <!-- 設定其插槽名稱為top -->
          <template #top>
            <v-text-field
              label="搜尋"
              v-model="tableSearch"
              append-icon="mdi-magnify"
              @click-append="tableLoadItems(true)"
              @keydown.enter="tableLoadItems(true)"
            ></v-text-field>
          </template>
          <!-- 圖片---------- -->
          <!-- # 是指定插槽 => 欄位名稱 -->
          <template #[`item.image`]="{ value }">
            <v-img :src="value" height="50px"></v-img>
          </template>
          <!-- 是否上架------- -->
          <template #[`item.sell`]="{ value }">
            <v-icon icon="mdi-check" v-if="value"></v-icon>
          </template>
          <!-- 操作---------- -->
          <!-- { item }表示原始的東西而不是值**** -->
          <template #[`item.action`]="{ item }">
            <!-- 點擊時打開編輯視窗，並帶入item(這一列的商品資料) -->
            <v-btn icon="mdi-pencil" variant="text" color="blue" @click="openDialog(item)"></v-btn>
          </template>
        </v-data-table-server>
      </v-col>
    </v-row>
  </v-container>
  <!-- permanent表示永久固定 -->
  <v-dialog v-model="dialog.open" persistent width="500">
    <!-- :disabled="isSubmitting"表示送出中表單停用 -->
    <v-form @submit.prevent="submit" :disabled="isSubmitting">
      <v-card>
        <v-card-title>
          <!-- 如果有id => 顯示'編輯商品'
               如果沒有id => 顯示'新增商品' -->
          {{ dialog.id ? '編輯商品' : '新增商品' }}
        </v-card-title>
        <!-- 步驟5. 綁定欄位的 v-model、:error-messages -->
        <v-card-text>
          <v-text-field
            label="名稱"
            v-model="name.value.value"
            :error-messages="name.errorMessage.value"
          ></v-text-field>
          <v-text-field
            label="價格"
            type="number" min="0"
            v-model="price.value.value"
            :error-messages="price.errorMessage.value"
          ></v-text-field>
          <v-select
            label="分類"
            :items="categories"
            v-model="category.value.value"
            :error-messages="category.errorMessage.value"
          ></v-select>
          <v-checkbox
            label="上架"
            v-model="sell.value.value"
            :error-messages="sell.errorMessage.value"
          ></v-checkbox>
          <!-- 字比較多的就用v-textarea -->
          <v-textarea
            label="說明"
            v-model="description.value.value"
            :error-messages="description.errorMessage.value"
          ></v-textarea>
          <!-- vue-file-agent是檔案上傳的套件 -->
          <!-- accept 接受的格式
               deletable表示可被刪除
               max-size檔案大小限制 -->
          <!-- 呼叫檔案上傳套件內建的function，需要加 ref='' -->
          <!-- 註：要抓頁面上東西需加ref='XXX'，並於JS中const同名的ref-->
          <vue-file-agent
            v-model="fileRecords"
            v-model:raw-model-value="rawFileRecords"
            accept="image/jpeg,image/png"
            deletable
            max-size="1MB"
            help-text="選擇檔案或拖曳到這裡"
            :error-text="{ type: '檔案格式不支援', size: '檔案大小不能超過 1MB' }"
            ref="fileAgent"
          ></vue-file-agent>
        </v-card-text>
        <v-card-actions>
          <!-- :loading="isSubmitting" 表示送出的時候會轉圈，避免重複點擊 -->
          <v-btn color="red" :loading="isSubmitting" @click="closeDialog">取消</v-btn>
          <v-btn color="green" type="submit" :loading="isSubmitting">送出</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup>
import { definePage } from 'vue-router/auto'
import { ref } from 'vue'
// 步驟1-1. 引入驗證套件
import * as yup from 'yup'
import { useForm, useField } from 'vee-validate'
// 步驟6-2. 引入useApi（要把資料傳出去都要引入這個，用於跟API溝通）
import { useApi } from '@/composables/axios'
// 對話框
import { useSnackbar } from 'vuetify-use-dialog'

definePage({
  meta: {
    title: '購物網 | 商品管理',
    login: true,
    admin: true
  }
})
// 步驟6-3. 取出apiAuth（要把資料傳出去都要引入這個）
const { apiAuth } = useApi()

const createSnackbar = useSnackbar()

// 要抓頁面上東西需在標籤上加ref='XXX'，並於JS中const同名的ref
const fileAgent = ref(null)

// 視窗------------------------------------
const dialog = ref({
  open: false, // 預設對話框現在是關閉的狀態
  // 紀錄 id，沒有id就是新增，有id就是編輯
  id: ''
})

const openDialog = (item) => {
  // 如果有帶入商品資料
  if (item) {
    // 將id傳入現在商品的id，其他項目依此類推
    dialog.value.id = item._id
    name.value.value = item.name
    price.value.value = item.price
    description.value.value = item.description
    category.value.value = item.category
    sell.value.value = item.sell
  } else {
    // id是空的 => 表示現在是新增模式
    dialog.value.id = ''
  }
  dialog.value.open = true
}

// 關閉視窗funtion
const closeDialog = () => {
  dialog.value.open = false // dialog.value.open決定對話框是否開啟
  resetForm() // 重設表單，回到initialValues
  //  resetForm() 不會重設檔案上傳（因為是引入其他套件），因此要自己寫：
  fileAgent.value.deleteFileRecord() // deleteFileRecord()是套件內建的function，用於清除
}

const categories = ['衣服', '手機', '遊戲', '食品']
// 步驟2. 以schema定義格式
const schema = yup.object({
  name: yup
    .string()
    .required('商品名稱必填'),
  price: yup
    .number()
    // 打的不是數字就會觸發typeError
    .typeError('商品價格格式錯誤')
    .required('商品價格必填')
    .min(0, '商品價格不能小於 0'),
  description: yup
    .string()
    .required('商品說明必填'),
  category: yup
    .string()
    .required('商品分類必填')
    // 陣列的驗證，用.test(自定義名稱, 錯誤訊息, funtion)自己定義
    .test('isCategory', '商品分類錯誤', value => {
      return categories.includes(value)
    }),
  sell: yup
    .boolean()
})

// 步驟3. useForm()建立表單------------------------------------------------------------
// 解構出handleSubmit (處理送出表單的動作)、isSubmitting (判斷表單是否在送出)、resetForm (重設表單)
const { handleSubmit, isSubmitting, resetForm } = useForm({
  // 驗證格式為上方的schema
  validationSchema: schema,
  // 表單各欄位的初始值設定
  initialValues: {
    name: '',
    price: 0,
    description: '',
    category: '',
    sell: true
  }
})

// 步驟4. useField()建立表單的各個欄位---------------------------------------------
// useField()裡的欄位名稱要跟跟上方schema的一樣
// useField('name') => 返回與 name 字段相關的值(value)和錯誤訊息(errorMessage)

// v-model和error-messages會綁這些值
// 例如上方的v-model='account.value.value'、:error-messages="account.errorMessage.value"
//  當字段驗證失敗時，vee-validate 會自動更新 errorMessage，並顯示相應的錯誤信息（schema裡自己定義的，例如'密碼不一致'）
const name = useField('name')
const price = useField('price')
const description = useField('description')
const category = useField('category')
const sell = useField('sell')
// 檔案上傳用
const fileRecords = ref([])
const rawFileRecords = ref([])

// 步驟6-1. 定義送出的function-----------------------------------------------------------------
// handleSubmit()會先上方的schema執行驗證，過了再執行下面的程式碼
const submit = handleSubmit(async (values) => {
  // handleSubmit()不會執行驗證檔案上傳（因為是引入其他套件），因此要自己寫：
  // fileRecords.value[0]是指第一個檔案
  if (fileRecords.value[0]?.error) return
  // dialog.value.id.length === 0 => 如果是新增商品的時候，沒放圖片會被return
  if (dialog.value.id.length === 0 && fileRecords.value.length < 1) return

  try {
    // 檔案上傳會用到form-data，是一種用於構建 HTTP POST 請求的內容類型，主要用於上傳文件和提交表單數據。
    // 建立物件fd
    const fd = new FormData()
    // 把東西放入form-data：fd.append(key, value)
    fd.append('name', values.name)
    fd.append('price', values.price)
    fd.append('description', values.description)
    fd.append('category', values.category)
    fd.append('sell', values.sell)

    // 如果有放檔案就要放入fd
    if (fileRecords.value.length > 0) {
      fd.append('image', fileRecords.value[0].file)
    }

    // 如果id是空的 => 新增商品---------------------
    if (dialog.value.id === '') {
      await apiAuth.post('/product', fd)
    } else {
      // 如果id不是空的 => 編輯商品-----------------
      // .patch表示更新部分資源欄位
      await apiAuth.patch('/product/' + dialog.value.id, fd)
    }

    // 對話框
    createSnackbar({
      // 如果id是0 => 新增成功，如果有id => 編輯成功
      text: dialog.value.id === '' ? '新增成功' : '編輯成功',
      snackbarProps: {
        color: 'green'
      }
    })
    // 關閉視窗
    closeDialog()  
    // 新增或編輯後，使重新載入表格資料以更新
    tableLoadItems(true) 
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

// 一頁顯示幾個
const tableItemsPerPage = ref(10) 
// 排序
// 可以針對很多個欄位去排序，但後端就也需要寫出那個功能（這個範例只有一個）
const tableSortBy = ref([
  // createdAt是建立的日期
  // order是正的或到的排，desc是倒的
  { key: 'createdAt', order: 'desc' }
])
// 頁碼，表示表格現在被翻到哪一頁
// 如何從現在第幾頁、一頁幾筆算出後端要回給前端第幾筆～第幾筆的資料？
const tablePage = ref(1)
// 表格要顯示的東西
const tableItems = ref([])
// 表格欄位設定（理論上應該會固定，所以不用ref）
const tableHeaders = [
  // align: 'center'置中
  // sortable: 此欄位是否可以排序
  // key要跟資料庫的欄位對到，把相同key的值帶入這個欄位
  { title: '圖片', align: 'center', sortable: false, key: 'image' },
  { title: '名稱', align: 'center', sortable: true, key: 'name' },
  { title: '價格', align: 'center', sortable: true, key: 'price' },
  { title: '分類', align: 'center', sortable: true, key: 'category' },
  { title: '上架', align: 'center', sortable: true, key: 'sell' },
  // 原本的資烙沒有action，表示其為獨立於資料的欄位 => 在上方寫<template #[`item.action`]="{ item }"></template>
  { title: '操作', align: 'center', sortable: false, key: 'action' }
]
// 預設剛點進來的時候會是載入狀態
const tableLoading = ref(true)
// 每一頁加起來總共有幾筆資料，預設為0
const tableItemsLength = ref(0)
// 現在搜尋的文字是什麼
const tableSearch = ref('')

// 表格載入的funtion-------------------------------------------------------
const tableLoadItems = async (reset) => {
  // 如果重設表格會回到第一頁
  if (reset) tablePage.value = 1
  // 正在loading
  tableLoading.value = true
  try {
    // 取得表格資料
    // 設定get參數：.get(網址,請求的設定) ***get無送出的資料***
    const { data } = await apiAuth.get('/product/all', {
      params: {
        page: tablePage.value,
        itemsPerPage: tableItemsPerPage.value,
        sortBy: tableSortBy.value[0]?.key || 'createdAt',
        sortOrder: tableSortBy.value[0]?.order || 'desc',
        search: tableSearch.value
      }
    })
    // 從0開始刪除, 所有東西, 把回來的資料放進去
    tableItems.value.splice(0, tableItems.value.length, ...data.result.data)
    // 陣列的長度
    tableItemsLength.value = data.result.total
  } catch (error) {
    console.log(error)
    createSnackbar({
      text: error?.response?.data?.message || '發生錯誤',
      snackbarProps: {
        color: 'red'
      }
    })
  }
  tableLoading.value = false
}

tableLoadItems() // 第一次進來一定要呼叫
</script>

<route lang="yaml">
meta:
  layout: admin
</route>
