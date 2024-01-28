import './assets/css/main.css'
import 'mdb-vue-ui-kit/css/mdb.min.css';
import './assets/css/indexTailwind.css';

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from "@/router";
import FlashMessage from '@smartweb/vue-flash-message';


const app = createApp(App)


app.use(router);
app.use(createPinia());
app.use(FlashMessage);

app.mount('#app')
