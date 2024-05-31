import { createApp } from 'vue'
import App from './App.vue'
import router from '../src/router'
import { supabase } from './supabase'

import PrimeVue from 'primevue/config'
import InputText from 'primevue/inputtext'
import FloatLabel from 'primevue/floatlabel'
import Password from 'primevue/password'
import InputSwitch from 'primevue/inputswitch'
import Menu from 'primevue/menu'
import Toolbar from 'primevue/toolbar'
import Badge from 'primevue/badge'
import Avatar from 'primevue/avatar'
import Calendar from 'primevue/calendar'
import Chart from 'primevue/chart'
import Timeline from 'primevue/timeline'
import Card from 'primevue/card'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Knob from 'primevue/knob'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

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
app.component('Menu', Menu)
app.component('Toolbar', Toolbar)
app.component('Badge', Badge)
app.component('Avatar', Avatar)
app.component('Calendar', Calendar)
app.component('Chart', Chart)
app.component('Timeline', Timeline)
app.component('Accordion', Accordion)
app.component('AccordionTab', AccordionTab)
app.component('Knob', Knob)
app.component('DataTable', DataTable)
app.component('Column', Column)

app.mount('#app')
