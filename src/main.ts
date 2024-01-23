import './assets/main.css'
import 'mdb-vue-ui-kit/css/mdb.min.css';
import './assets/indexTailwind.css';

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from "@/router";


const app = createApp(App)


app.use(router);
app.use(createPinia());

app.mount('#app')
