module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
  ],
  // 定義特定檔案的規則
  overrides: [
    {
      // 指定這兩個資料夾
      // *表示只有layouts資料夾；**表示layouts資料夾裡面的資料夾的檔案也算
      files: ['src/layouts/**', 'src/pages/**'],
      rules: {
        // 關閉限制兩個英文單字組合的規定
        'vue/multi-word-component-names': 'off'
      }
    }
  ]
}
