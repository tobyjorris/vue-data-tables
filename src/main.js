import Vue from 'vue'
import App from './App.vue'
import 'bootstrap/dist/js/bootstrap.min'
import './scss/custom-bootstrap.scss'
import 'jquery/src/jquery.js'

import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';

import PrimeVue from 'primevue/config';
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'

Vue.use(PrimeVue);
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons)

new Vue(App).$mount('#app')
