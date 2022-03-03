<template>
  <data-table
      id="submission-table"
      class="p-datatable-sm"
      :value="submissions"
      :paginator="true"
      :rowHover="true"
      :rows="10"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      dataKey="id"
      responsiveLayout="scroll"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
  >
    <template #header>
      <h2>Dynamically Generated Columns</h2>
    </template>
    <Column v-for="column in columns" :key="column.field" :field="column.field" :header="column.header">

    </Column>
  </data-table>
</template>

<script>
import DataTable from 'primevue/datatable/'
import Column from 'primevue/column/'
import axios from 'axios'
import {axiosMock} from "@/utils/axiosMock";
import { mockSubmissions } from '@/utils/data/submissions'

export default {
  name: 'StaticTable',
  components: {
    Column,
    DataTable
  },
  data() {
    return {
      loading: true,
      submissions: null,
      columns: null
    }
  },
  created() {
    //
  },
  mounted() {
    this.columns = [
      {field: 'noc_number', header: 'NoC #', styles: {'min-width': '5rem'}},
      {field: 'notified_body', header: 'NB'},
      {field: 'status', header: 'Status'},
      {field: 'submission_title', header: 'Submission Title'},
      {field: 'products', header: 'Product(s)'},
      {field: 'submission_type', header: 'Submission Type'},
      {field: 'division', header: 'Division'},
      {field: 'author', header: 'Author/Owner'},
    ]
    this.getSubmissions()
  },
  methods: {
    async getSubmissions() {
      axiosMock.onGet("/submissions").reply(200, mockSubmissions)

      await axios.get('/submissions').then(response => this.submissions = response.data.submissions)
    },
    returnProductsString(productsArray) {
      const arrayOfProducts = []
      for (let product of productsArray) {
        arrayOfProducts.push(product.product_name)
      }

      return arrayOfProducts.join(', ')
    }
  }
}
</script>

<style scoped>
#submission-table {
  font-size: .8rem;
}
</style>
