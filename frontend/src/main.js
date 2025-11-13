import './assets/main.css'
import './assets/styles/global-styles.css'
import router from './router/index.js'
import { createApp } from 'vue'

import App from './App.vue'



createApp(App).use(router).mount('#app')