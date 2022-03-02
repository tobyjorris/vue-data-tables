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
        <h2>Static Columns</h2>
      </template>
      <column field="noc_number" header="NoC #" :styles="{'min-width': '5rem'}">
        <template #body="{data}">
          <a href="#">{{data.noc_number}}</a>
        </template>
      </column>
      <column field="notified_body" header="NB" :styles="{'min-width': '5rem'}">
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
</template>

<script>
import DataTable from 'primevue/datatable/'
import Column from 'primevue/column/'
import axios from 'axios'
import axiosMock from "@/utils/axiosMock"
import { mockSubmissions } from '@/utils/data/submissions'

export default {
  name: 'StaticTable',
  components: {
    Column,
    DataTable
  },
  props: {
  //
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
