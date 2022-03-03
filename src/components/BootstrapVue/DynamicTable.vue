<template>
  <div class="container">
    <div class="row">
      <div class="col">
        <b-table
         id="bv-dynamic-table"
         :busy="loading"
         :items="submissions"
         :current-page="currentPage"
         :per-page="perPage"
         :fields="fields"
         :filter="filters"
         :filter-function="filterProvider"
         @filtered="onFilter"
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
          <template #table-busy>
            <div id="table-busy-wrapper">
              <div id="table-busy-spinner" class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
              </div>
            </div>
          </template>
          <template #cell(noc_number)="data">
            <a href="#">{{data.item.noc_number}}</a>
          </template>
          <template #cell(submission_title)="data">
            <b-form-input size="sm" v-if="submissions[data.index].isEdit && selectedCell === 'submission_title'" type="text" v-model="submissions[data.index].submission_title"></b-form-input>
            <span v-else @click="editCellHandler(data, 'submission_title')">{{data.value}}</span>
          </template>
          <template #cell(products)="data">
            <div class="table-row">{{returnProductsString(data.item.products)}}</div>
          </template>
        </b-table>
      </div>
    </div>
    <div class="row">
      <div class="col-2"></div>
      <div class="col-8">
        <div class="d-flex">
          <b-pagination
          v-model="currentPage"
          :total-rows="totalRows"
          :per-page="perPage"
          align="fill"
          size="sm"
          class="my-0"
          >
          </b-pagination>
          <div class="d-flex align-items-center">Showing {{recordsRange}} of {{totalRows}} records</div>
        </div>
      </div>
      <div class="col-2"></div>
    </div>
    <div class="row mt-4 mb-5">
      <div class="col">
        <b-button class="mb-2" v-b-toggle.api variant="primary">API Requirements</b-button>
        <b-button class="ml-3 mb-2" v-b-toggle.params variant="info">Filters</b-button>
        <b-button class="ml-3 mb-2" variant="dark" @click="apiCall()">Print API Call</b-button>
        <b-collapse id="api">
          <b-card title="API Requirements">
            <div>"total-rows": a count of the total number of records available. Used to determine paginator in event of server side pagination</div>
            <div></div>
          </b-card>
        </b-collapse>
        <b-collapse id="params">
          <b-card title="Filters">
            <div>{{ filterObject }}</div>
          </b-card>
        </b-collapse>
      </div>
    </div>
  </div>
</template>

<script>
import {axiosMock} from "@/utils/axiosMock";
import {mockSubmissions} from "@/utils/data/submissions";
import axios from "axios";
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css';

export default {
  name: "DynamicTable",
  components: {
    vSelect
  },
  props: {
    firstRowMenu: Boolean
  },
  computed: {
    filterObject() {
      const filteredObject = {}
      const filteredKeys = Object.keys(this.filters).filter(key => this.filters[key])
      filteredKeys.forEach(key => filteredObject[key] = this.filters[key])

      return filteredObject
    },
    recordsRange() {
      const totalPages = Math.ceil(this.totalRows / this.perPage)
      const resultStart = (this.currentPage -1) * this.perPage + 1
      const resultEnd = this.currentPage === totalPages ? this.totalRows : resultStart + this.perPage - 1
      return `${resultStart} through ${resultEnd}`
    }
  },
  data() {
    return {
      loading: true,
      currentPage: 1,
      totalRows: 0,
      perPage: 10,
      submissions: null,
      fields: [
        {key: 'noc_number', label: 'NoC #', sortable: true},
        {key: 'notified_body', label: 'NB', sortable: true},
        {key: 'status', label: 'Status', sortable: true},
        {key: 'submission_title', label: 'Submission Title', sortable: true},
        {key: 'products', label: 'Product(s)', sortable: true},
        {key: 'submission_type', label: 'Submission Type', sortable: true},
        {key: 'division', label: 'Division', sortable: true},
        {key: 'author', label: 'Author/Owner', sortable: true},
      ],
      nbOptions: ['BSI', 'Dekra', 'TUV-SUD'],
      filters: {
        noc_number: null,
        notified_body: null,
        status: null,
        submission_title: null,
        products: null,
        submission_type: null,
        division: null,
        author: null
      },
      selectedCell: null,

    }
  },
  async mounted() {
    try {
      await this.getSubmissions()
    }
    catch (error) {
      console.log('error', error)
    }
    finally {
      this.loading = false
    }
  },
  methods: {
    async getSubmissions() {
      axiosMock.onGet("/submissions").reply(200, mockSubmissions)

      const request = await axios.get('/submissions')
      this.submissions = request.data.submissions
      this.totalRows = request.data.submissions.length
      return request
    },
    async lazyProvider(context, callback) {
      /*
      Context is an object associated with the table state, and contains the following properties:

      currentPage: The current page number (starting from 1, the value of the current-page prop)
      perPage: The maximum number of rows per page to display (the value of the per-page prop)
      filter: The value of the filter prop
      sortBy: The current column key being sorted, or an empty string if not sorting
      sortDesc: The current sort direction (true for descending, false for ascending)
      apiUrl: The value provided to the api-url prop. null if none provided.
       */
      console.log('context', context)

      try {
        //const response = await axios.get(`/api/submission?page=${context.currentPage}&size=${context.perPage}`)
        //return response.items
      }
      catch (error) {
        return []
      }
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
    },
    editCellHandler(data, name) {
        this.submissions = this.submissions.map(item => ({...item, isEdit: false}));
        this.submissions[data.index].isEdit = true;
        this.selectedCell = name
    },
    onFilter(filteredItems) {
      console.log(filteredItems)
      this.totalRows = filteredItems.length
      this.currentPage = 1
    },
    filterProvider: function(tableRow, filterObject) {
      // by looping through the filterObject instead of the tableRow we can avoid filtering off of columns want to exclude from the filter
      for (let keyName in filterObject) {
        const rowData = this.returnString(tableRow[keyName])
        if (filterObject[keyName] !== null && !rowData.includes(filterObject[keyName].toLowerCase())) {
          return null
        }
      }
      return tableRow
    },
    returnString(data) {
      let stringData
        if (data.isArray) {
          stringData = data.toString().toLowerCase()
        } else if (typeof data === 'object') {
          stringData = JSON.stringify(data).toLowerCase()
        } else {
          stringData = data.toLowerCase()
        }

      return stringData
    }
  }
}
</script>

<style >
#bv-dynamic-table {
  font-size: .8rem;
}

.vs__dropdown-toggle {
  height: 31px!important;
}

button.page-link, span.page-link, button.page-item:disabled{
  border-radius: 3px;
  padding: .2rem .8rem!important;
  font-size: 1rem!important;
  margin: 0 5px;
  border:none !important;
}

#table-busy-spinner {
  height: 150px;
  width: 150px;
}

#table-busy-wrapper {
  display: flex;
  height: 200px;
  justify-content: center;
  align-items: center;
}
</style>
