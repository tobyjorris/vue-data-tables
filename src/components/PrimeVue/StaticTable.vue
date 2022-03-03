<template>
  <div class="container">
    <div class="row">
      <div class="col">
       <data-table
        id="submission-table"
        class="p-datatable-sm"
        :value="submissions"
        :paginator="true"
        :rowHover="true"
        :rows="10"
        :loading="loading"
        :lazy="true"
        :totalRecords="totalRecords"
        :filters.sync="filters"
        :globalFilterFields="['noc_number', 'notified_body', 'status', 'submission_title', 'products.product_name', 'submission_type', 'division', 'author']"
        filterDisplay="row"
        ref="dt"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        dataKey="id"
        responsiveLayout="scroll"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        @page="onPage($event)"
        @sort="onSort($event)"
        @filter="onFilter($event)"
      >
      <template #header>
        <h2>Static Columns</h2>
      </template>
      <column field="noc_number" header="NoC #" :styles="{'min-width': '5rem'}">
         <template #filter="{filterModel,filterCallback}">
            <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" class="p-column-filter" placeholder="Search"/>
        </template>
        <template #body="{data}">
          <a href="#">{{data.noc_number}}</a>
        </template>
      </column>
      <column field="notified_body" header="NB" :styles="{'min-width': '5rem'}">
         <template #filter="{filterModel,filterCallback}">
            <InputText type="text" v-model="filterModel.value" @keydown.enter="filterCallback()" placeholder="Search"/>
        </template>
        <template #body="{data}">
         {{data.notified_body}}
        </template>
      </column>
      <column field="status" header="Status" >
        <template #body="{data}">
         {{data.status}}
        </template>
      </column>
      <column field="submission_title" header="Submission Title" :styles="{'max-width': '8rem', 'overflow': 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap'}" >
        <template #body="{data}">
         {{data.submission_title}}
        </template>
      </column>
      <column field="products" header="Product(s)" >
        <template #body="{data}">
          {{returnProductsString(data.products)}}
        </template>
      </column>
      <column field="submission_type" header="Submission Type" >
        <template #body="{data}">
         {{data.submission_type}}
        </template>
      </column>
      <column field="division" header="Division" :styles="{'max-width': '5rem'}" >
        <template #body="{data}">
          {{data.division}}
        </template>
      </column>
      <column field="author" header="Author/Owner" >
        <template #body="{data}">
          {{data.author}}
        </template>
      </column>
    </data-table>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <button class="btn btn-primary" @click="apiCall">Print Query Params</button>
      </div>
    </div>
  </div>

</template>

<script>
import DataTable from 'primevue/datatable/'
import InputText from 'primevue/inputtext'
import Column from 'primevue/column/'
import axios from 'axios'
import {axiosMock} from "@/utils/axiosMock";
import { mockSubmissions } from '@/utils/data/submissions'

export default {
  name: 'StaticTable',
  components: {
    Column,
    DataTable,
    InputText
  },
  props: {
  //
  },
  computed: {
    totalRecords() {
      return !this.loading ? this.submissions.length : null
    }
  },
  data() {
    return {
      loading: null,
      submissions: [],
      columns: null,
      lazyParams: {},
      filters: {
        'noc_number': {value: '', matchMode: 'contains'},
        'notified_body': {value: '', matchMode: 'contains'},
        'status': {value: '', matchMode: 'contains'},
        'submission_title': {value: '', matchMode: 'contains'},
        'products.product_name': {value: '', matchMode: 'contains'},
        'submission_type': {value: '', matchMode: 'contains'},
        'division': {value: '', matchMode: 'contains'},
        'author': {value: '', matchMode: 'contains'},
      }
    }
  },
  created() {
   //
  },
  mounted() {
    this.loading = true
    this.lazyParams = {
            first: 0,
            rows: this.$refs.dt.rows,
            sortField: null,
            sortOrder: null,
            filters: this.filters
        }
    this.getSubmissions()
  },
  methods: {
    async getSubmissions() {
      axiosMock.onGet("/submissions").reply(200, mockSubmissions)

      const response = await axios.get('/submissions').then(response => {
        this.submissions = response.data.submissions
        this.loading = false
      })
    },
    returnProductsString(productsArray) {
      const arrayOfProducts = []
      for (let product of productsArray) {
        arrayOfProducts.push(product.product_name)
      }

      return arrayOfProducts.join(', ')
    },
    apiCall() {
      const queryParams = this.lazyParams ? Object.keys(this.lazyParams).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(this.lazyParams[k])).join('&') : ''

      console.log(JSON.stringify(this.lazyParams))
    },
    onPage(event) {
      this.lazyParams = event
      this.apiCall()
    },
   onSort(event) {
      this.lazyParams = event;
      this.apiCall();
    },
    onFilter() {
      this.lazyParams.filters = this.filters;
      this.apiCall();
    },
  }
}
</script>

<style scoped>
#submission-table {
  font-size: .8rem;
}
</style>
