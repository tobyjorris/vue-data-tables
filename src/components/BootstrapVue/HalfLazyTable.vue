<template>
 <div class="container mt-5">
    <div class="row">
      <div class="col">
       <b-table
        id="bv-half-lazy-table"
        :items="submissions"
        :current-page="currentPage"
        :per-page="5"
        :fields="fields"
        sort-icon-left
        hover
        small
    >
          <template v-if="firstRowMenu" #top-row>
            <td v-for="field in fields" :key="field.key">
              <template v-if="field.key === 'notified_body'">
                <v-select v-model="filters[field.key]" :options="nbOptions"/>
              </template>
              <template v-else>
                <b-input v-model="filters[field.key]" size="sm" class="input" placeholder="Search"></b-input>
              </template>
            </td>
          </template>
          <template #cell(noc_number)="data">
            <a href="#">{{data.item.noc_number}}</a>
          </template>
          <template #cell(products)="data">
            <div class="table-row">{{returnProductsString(data.item.products)}}</div>
          </template>
        </b-table>
      </div>
    </div>
    <div class="row">
      <div class="col-3">
        <b-pagination
          v-model="currentPage"
          :total-rows="totalRows"
          :per-page="5"
          align="fill"
          size="sm"
          class="my-0"
        ></b-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import vSelect from "vue-select";
import axiosMock from "@/utils/axiosMock";
import axiosMockDelay from '@/utils/axiosMockDelay'
import {mockSubmissions} from "@/utils/data/submissions";
import {mockSubmissionsTwo} from "@/utils/data/submissionsTwo";
import axios from "axios";

export default {
  name: "HalfLazyTable",
  components: {
    vSelect
  },
  props: {
    firstRowMenu: Boolean
  },
  computed: {
    computedFilters() {
      const filteredObject = {}
      const filteredKeys = Object.keys(this.filters).filter(key => this.filters[key])
      filteredKeys.forEach(key => filteredObject[key] = this.filters[key])

      return filteredObject
    }
  },
  data() {
    return {
      currentPage: 1,
      submissions: null,
      fields: [
        {key: 'noc_number', label: 'NoC #', sortable: true},
        {key: 'notified_body', label: 'NB', class: 'nb-column', sortable: true},
        {key: 'status', label: 'Status', sortable: true},
        {key: 'submission_title', label: 'Submission Title', sortable: true},
        {key: 'products', label: 'Product(s)', sortable: true},
        {key: 'submission_type', label: 'Submission Type', sortable: true},
        {key: 'division', label: 'Division', sortable: true},
        {key: 'author', label: 'Author/Owner', sortable: true},
      ],
      nbOptions: ['BSI', 'Dekra', 'TUV-SUD'],
      filters: {
        noc_number: '',
        notified_body: '',
        status: '',
        submission_title: '',
        products: '',
        submission_type: '',
        division: '',
        author: ''
      },
      totalRows: undefined,
      awaitingFullData: null,
    }
  },
  mounted() {
    this.awaitingFullData = true
    try {
      this.getFirstSubmissions()
      this.getSecondSubmissions()
    }
    catch (error) {
      console.log(error)
    }

    this.awaitingFullData = false
  },
  methods: {
    async getFirstSubmissions() {
      axiosMock.onGet("/submissions").reply(200, mockSubmissions)

      await axios.get('/submissions').then(response => {
        this.totalRows = response.data.totalRecords
        this.submissions = response.data.submissions
      })
    },
    async getSecondSubmissions() {
      axiosMockDelay.onGet("/submissions-two").reply(200, mockSubmissionsTwo)

      await axios.get('/submissions-two').then(response => {
        this.submissions = this.submissions.concat(response.data.submissions)
      })
    },
    returnProductsString(productsArray) {
      //Handles displaying a nested array of data in a column as a comma seperated string
      const arrayOfProducts = []
      for (let product of productsArray) {
        arrayOfProducts.push(product.product_name)
      }

      return arrayOfProducts.join(', ')
    },
    returnFilterString() {
      // Builds a filter string to be appended to an api call as query params.
      let filterString = ''
      for (let filterKey in this.computedFilters) {
        filterString = filterString + `&${filterKey}=${this.computedFilters[filterKey]}`
      }
      return filterString
    },
    apiCall() {
      // axios.get(`/api/submissions?${this.returnFilterString()}`
      // Could django handle this as an object payload instead? Unconventional?
      console.log(this.returnFilterString())
    }
  }
}
</script>

<style scoped>

</style>