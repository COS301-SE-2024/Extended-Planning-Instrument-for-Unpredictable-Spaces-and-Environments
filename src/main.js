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
import Menubar from 'primevue/menubar'
import Toolbar from 'primevue/toolbar'
import Badge from 'primevue/badge'
import Avatar from 'primevue/avatar'
import Calendar from 'primevue/calendar'
import Chart from 'primevue/chart'
import Timeline from 'primevue/timeline'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Knob from 'primevue/knob'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ConfirmDialog from 'primevue/confirmdialog'
import Button from 'primevue/button'
import ConfirmationService from 'primevue/confirmationservice'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import { store } from './store'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'
import Carousel from 'primevue/carousel'
import FileUpload from 'primevue/fileupload'
import VueSignaturePad from 'vue-signature-pad'
import Ripple from 'primevue/ripple'

import 'primeicons/primeicons.css'
import 'primevue/resources/themes/md-dark-indigo/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import { QrcodeStream, QrcodeDropZone, QrcodeCapture } from 'vue-qrcode-reader'
import Tooltip from 'primevue/tooltip'

const app = createApp(App)
app.config.globalProperties.$supabase = supabase

app.directive('ripple', Ripple)
app.directive('tooltip', Tooltip)

app.use(VueSignaturePad)
app.use(router)
app.use(PrimeVue)
app.use(ConfirmationService)
app.use(store)
app.use(ToastService)
app.component('Carousel', Carousel)
app.component('FileUpload', FileUpload)
app.component('Toast', Toast)
app.component('InputText', InputText)
app.component('FloatLabel', FloatLabel)
app.component('Password', Password)
app.component('InputSwitch', InputSwitch)
app.component('Menu', Menu)
app.component('Menubar', Menubar)
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
app.component('ConfirmDialog', ConfirmDialog)
app.component('ConfirmationService', ConfirmationService)
app.component('Button', Button)
app.component('Dialog', Dialog)
app.component('Dropdown', Dropdown)
app.component('QrcodeStream', QrcodeStream)
app.component('QrcodeDropZone', QrcodeDropZone)
app.component('QrcodeCapture', QrcodeCapture)

app.mount('#app')
