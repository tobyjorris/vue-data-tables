<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col">
        <b-table
         id="bv-dynamic-table"
         :busy="loading.base"
         :items="tableData"
         :current-page="currentPage"
         :per-page="perPage"
         :fields="fields"
         :filter="filters"
         :filter-function="filterProvider"
         @filtered="onFilter"
         sort-icon-left
         show-empty
         empty-filtered-text="No records to show. Please check your filters and try again."
         hover
         small
        >
          <template v-if="firstRowMenu" #top-row>
            <td v-for="field in fields" :key="field.key">
              <template v-if="field.key === 'notified_body'">
                <b-form-select v-model="filters[field.key]" size="sm" :options="nbOptions" :disabled="loading.lazy"/>
              </template>
              <template v-else>
                <b-input v-model="filters[field.key]" size="sm" class="input" placeholder="Search"  :disabled="loading.lazy"></b-input>
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
          <template
            v-for="(_, name) in $scopedSlots"
            :slot="name"
            slot-scope="slotData"
          >
            <slot :name="name" v-bind="slotData"/>
          </template>
          <template #cell(submission_title)="data">
            <b-form-input size="sm" v-if="tableData[data.index].isEdit && selectedCell === 'submission_title'" type="text" v-model="tableData[data.index].submission_title"></b-form-input>
            <span v-else @click="editCellHandler(data, 'submission_title')">{{data.value}}</span>
          </template>
           <template #cell(products)="data">
            <div class="table-row">{{returnStringFromArray(data.item.products, 'product_name')}}</div>
          </template>
        </b-table>
      </div>
    </div>
    <div class="row">
      <div class="col align-self-center">
        <div v-if="!loading.lazy" class="d-flex justify-content-around">
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
    </div>
    <div class="row mt-4 mb-5">
      <div class="col">
        <b-button class="mb-2" v-b-toggle.api variant="primary">API Requirements</b-button>
        <b-button class="ml-3 mb-2" variant="dark" @click="resetTable()">Reset Table</b-button>
        <b-collapse id="api">
          <b-card title="API Requirements">
            <h6>Query Params</h6>
            <div>"?count=": handle a query parameter that returns a specified amount of records starting from index 0</div>
            <div>"second-api-call": how are we going to handle the second api call returning the 'rest' of the records?</div>
            <h6>Response Formats</h6>
            <div>"response.data[<strong>tableData</strong>]": a consistent, generic name for the key in the response object that holds all of the records to go into the table</div>
            <div>"response.data.tableData.totalRows": a count of the total number of records available, only needed on ?count= calls Used to determine paginator in event of lazy loading behavior</div>
            <div></div>
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
import {mockSubmissionsTwo} from "@/utils/data/submissionsTwo";

export default {
  name: "DynamicTable",
  props: {
    firstRowMenu: {
      type: Boolean,
      default: false
    },
    lazy: {
      type: Boolean,
      default: false
    },
    apiUrl: {
      type: String,
      required: true
    },
    secondApiUrl: {
      type: String,
      required: false
    },
  },
  computed: {
    propsError() {
      if (this.lazy && !this.secondApiUrl) {
        throw new Error('Usage of the "lazy" prop requires the usage of the secondApiUrl prop')
      }
    },
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
      loading: {
        base: true,
        lazy: this.lazy
      },
      loadingSecondData: false,
      currentPage: 1,
      totalRows: 0,
      perPage: 10,
      tableData: null,
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
  mounted() {
    this.getTableData()
  },
  methods: {
    async getTableData() {
      try {
        await this.firstDataBatch()
        if (this.lazy) await this.secondDataBatch()
      }
      catch (error) {
        this.loading.base = false
        this.loading.lazy = false
        console.log('error getting table data', error)
      }
    },
    async firstDataBatch() {
      axiosMock.onGet(`${this.apiUrl}`).reply(200, mockSubmissions)
      axiosMock.onGet(`${this.apiUrl}?count=${this.perPage}`).reply(200, mockSubmissions)
      const apiEndpoint = this.lazy ? `${this.apiUrl}?count=${this.perPage}` : this.apiUrl

      const request = await axios.get(apiEndpoint)
      this.tableData = request.data.submissions
      this.totalRows = this.lazy ? request.data.submissions.totalRecords : request.data.submissions.length
      this.loading.base = false
      return request
    },
    async secondDataBatch() {
      axiosMock.onGet(this.secondApiUrl).reply(200, mockSubmissionsTwo)
      const request = await axios.get(this.secondApiUrl)
      this.tableData = this.tableData.concat(request.data.submissions)
      this.loading.lazy = false
      return request
    },
    setFields() {

    },
    resetTable() {
      this.tableData = []
      this.loading = true
      this.totalRows = 0
      this.currentPage = 1
      this.getTableData()
    },
    returnStringFromArray(dataArray, keyToPrint) {
      /*
      Assumes an array with single nested objects in it, ie:
      const array = [
        {key: value, key2: value}
        {key: value, key2: value}
      ]
       */
      const stringArray = []
      for (let data of dataArray) {
        stringArray.push(data[keyToPrint])
      }
      return stringArray.join(', ')
    },
    editCellHandler(data, name) {
        this.tableData = this.tableData.map(item => ({...item, isEdit: false}));
        this.tableData[data.index].isEdit = true;
        this.selectedCell = name
    },
    onFilter(filteredItems) {
      this.totalRows = filteredItems.length
      this.currentPage = 1
    },
    filterProvider: function(tableRow, filterObject) {
      // by looping through the filterObject instead of the tableRow we can avoid filtering off of columns want to exclude from the 'filter functionality'
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

button.page-link, span.page-link, button.page-item:disabled{
  border-radius: 3px;
  padding: .2rem .8rem!important;
  font-size: 1rem!important;
  margin: 0 5px;
  border:none !important;
}

#table-busy-spinner {
  margin-top: 75px;
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
