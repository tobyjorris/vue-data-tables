<template>
 <div class="container mt-5 mb-5">
   <div class="row">
     <div class="col">
       <div class="d-flex ">
         <div class="mr-4 d-flex">
            <div class="mr-2">First API Call:</div>
            <div v-if="firstCallRunning" class="spinner-border spinner-border-sm"  role="status">
              <span class="sr-only">Loading...</span>
            </div>
            <div v-else style="color: green">Done</div>
       </div>
       <div class="d-flex">
          <div class="mr-2">Second API Call:</div>
          <div v-if="secondCallRunning" class="spinner-border spinner-border-sm" role="status">
            <span class="sr-only">Loading...</span>
          </div>
          <div v-else style="color: green">Done</div>
       </div>
       </div>
     </div>
   </div>
    <div class="row">
      <div class="col">
       <b-table
        id="bv-half-lazy-table"
        :items="submissions"
        :current-page="currentPage"
        :per-page="7"
        :fields="fields"
        sort-icon-left
        hover
        small
        >
          <template v-if="firstRowMenu" #top-row>
            <td v-for="field in fields" :key="field.key">
              <template v-if="field.key === 'notified_body'">
                <v-select v-model="filters[field.key]" :options="nbOptions" :disabled="awaitingFullData"/>
              </template>
              <template v-else>
                <b-input v-model="filters[field.key]" size="sm" class="input" placeholder="Search" :disabled="awaitingFullData"></b-input>
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
          :per-page="7"
          :disabled="awaitingFullData"
          align="fill"
          size="sm"
          class="my-0"
        ></b-pagination>
      </div>
    </div>
   <div class="row mt-3">
     <div class="col">
       <div>Actual Count of Submissions in Table: {{submissions.length}}</div>
       <b-button class="mb-2 mr-3" v-b-toggle.api-lazy variant="primary">API Requirements</b-button>
       <b-button class="btn-success mb-2 mr-3" @click="retrieveDataHalfLazy">Reset Table</b-button>
       <b-collapse id="api-lazy">
          <b-card title="API Requirements">
            <h6>First Call:</h6>
            <div>"per-page": accepts an query param of how many records needed to be returned by the first call to ensure the first page of the table is filled.</div>
            <div>"total-rows": a count of the total number of records available. Used to determine paginator in event of server side pagination</div>
          </b-card>
        </b-collapse>
     </div>
   </div>
  </div>
</template>

<script>
import vSelect from "vue-select";
import {axiosMock} from "@/utils/axiosMock";
import {mockSubmissions} from "@/utils/data/submissions";
import {mockSubmissionsTwo} from "@/utils/data/submissionsTwo";
import axios from "axios";

export default {
  name: "HalfLazyTable",
  components: {
    vSelect
  },
  props: {
    firstRowMenu: {
      type: Boolean,
      default: false
    },
    perPage: {
      type: Number,
    },
    apiURL: {
      type: String,
    }
  },
  computed: {
    computedFilters() {
      const filteredObject = {}
      const filteredKeys = Object.keys(this.filters).filter(key => this.filters[key])
      filteredKeys.forEach(key => filteredObject[key] = this.filters[key])

      return filteredObject
    },
  },
  data() {
    return {
      currentPage: 1,
      submissions: [],
      firstCallRunning: null,
      secondCallRunning: null,
      awaitingFullData: true,
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
    }
  },
  mounted() {
    this.retrieveDataHalfLazy()
  },
  methods: {
    async retrieveDataHalfLazy() {
     this.initializeTable()
      try {
        await this.getFirstSubmissions().catch(e=> console.log(e))
        await this.getSecondSubmissions().catch(e=> console.log('error in second submission', e))
      }
      catch(e) {

      }
      this.awaitingFullData = false
    },
    initializeTable() {
      this.currentPage = 1
      this.firstCallRunning = true
      this.secondCallRunning = true
      this.submissions = []
      this.awaitingFullData = true
    },
    async getFirstSubmissions() {
      axiosMock.onGet(`/submissions?records=${this.perPage}`).reply(200, mockSubmissions)
      const request = await axios.get('/submissions')

      this.firstCallRunning = false
      this.totalRows = request.data.totalRecords
      this.submissions = request.data.submissions
      return request
    },
    getSecondSubmissions() {
      axiosMock.onGet("/submissions-two").reply(200, mockSubmissionsTwo)

      const request = axios.get('/submissions-two')

      request
        .then(response => {
          this.secondCallRunning = false
          this.submissions = this.submissions.concat(response.data.submissions)
        })
        .catch(error => console.log('error', error))

      return request
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
#bv-half-lazy-table {
  font-size: .8rem;
}

.vs__dropdown-toggle {
  height: 31px!important;
}

.nb-column {
  min-width: 8rem;
}
</style>