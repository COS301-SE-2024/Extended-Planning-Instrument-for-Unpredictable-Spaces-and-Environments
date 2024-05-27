import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { supabase } from './supabase'

import PrimeVue from 'primevue/config'
import InputText from 'primevue/inputtext'
import FloatLabel from 'primevue/floatlabel'
import Password from 'primevue/password'
import InputSwitch from 'primevue/inputswitch'

import 'primevue/resources/themes/md-dark-indigo/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'

const app = createApp(App)
app.config.globalProperties.$supabase = supabase
app.use(router)
app.use(PrimeVue)

app.component('InputText', InputText)
app.component('FloatLabel', FloatLabel)
app.component('Password', Password)
app.component('InputSwitch', InputSwitch)

app.mount('#app')
