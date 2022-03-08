<template>
  <div class="container-fluid">
    <div class="row justify-content-end mb-2">
      <div class="col-3">
        <div class="d-flex">
          <label id="page-select-label" for="per-page-select" class="w-100 mb-0 mr-3 d-flex align-items-center">Per Page:</label>
          <b-form-select id="per-page-select" v-model="perPage" :options="[10, 25, 50]"></b-form-select>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <b-table
         id="bv-dynamic-table"
         :busy="loading.base"
         :items="tableData"
         :current-page="currentPage"
         :per-page="perPage"
         :fields="tableFields"
         :filter="filters"
         :filter-function="filterProvider"
         @filtered="onFilter"
         sort-icon-left
         show-empty
         empty-filtered-text="No records to show. Please check your filters and try again."
         hover
         small
        >
          <template v-if="filterable" #top-row>
            <td v-for="(filterValue, filterName) in computedFilters" :key="filterName">
              <template v-if="!!computedFilters[filterName].options">
                <b-form-select v-model="computedFilters[filterName].value" size="sm" :options="computedFilters[filterName].options" :disabled="loading.lazy"/>
              </template>
              <template v-else>
                <b-input v-model="computedFilters[filterName].value" size="sm" class="input" placeholder="Search"  :disabled="loading.lazy"></b-input>
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
          <!--TODO update dynamic slot logic with non-deprecated syntax -->
          <!--eslint-disable vue/no-deprecated-dollar-scopedslots-api-->
          <template v-for="(_, name) in $scopedSlots" :slot="name" slot-scope="slotData">
            <slot :name="name" v-bind="slotData"/>
          </template>
          <!--TODO the template for implementing inline cell editing starts here-->
<!--          <template #cell(submission_title)="data">-->
<!--            <b-form-input size="sm" v-if="tableData[data.index].isEdit && selectedCell === 'submission_title'" type="text" v-model="tableData[data.index].submission_title"></b-form-input>-->
<!--            <span v-else @click="editCellHandler(data, 'submission_title')">{{data.value}}</span>-->
<!--          </template>-->
        </b-table>
      </div>
    </div>
    <div v-if="perPage < totalRows" class="row">
      <div class="col align-self-center">
        <div class="d-flex justify-content-around">
          <b-pagination
          v-model="currentPage"
          :total-rows="totalRows"
          :per-page="perPage"
          align="fill"
          size="sm"
          class="my-0"
          :disabled="loading.lazy"
          >
          </b-pagination>
          <div v-if="!loading.lazy" class="d-flex align-items-center">Showing {{recordsRange}} of {{totalRows}} records</div>
        </div>
      </div>
    </div>
    <div class="row mt-4 mb-5">
      <div class="col">
        <b-button class="mb-2" v-b-toggle.api variant="primary">API Requirements</b-button>
        <b-button class="ml-3 mb-2" variant="dark" @click="resetTable()">Reload Table</b-button>
        <b-collapse id="api">
          <b-card title="API Requirements">
            <h6 class="mt-3 mb-1">Query Params</h6>
            <div>"?count=": handle a query parameter that returns a specified amount of records starting from index 0</div>
            <div>"second-api-call": how are we going to handle the second api call returning the 'rest' of the records?</div>
            <div class="ml-5">- "/secondCall?count=this.perPage" - we'll need to send the same count used in the first call so we know which records not to send"</div>
            <h6 class="mt-3 mb-1">Response Formats</h6>
            <div>"response.data[<strong>tableData</strong>]": a consistent, generic name for the key in the response object that holds all of the records to go into the table</div>
            <div>"response.data.totalRows": a count of the total number of records available, only needed on ?count= calls Used to determine paginator in event of lazy loading behavior</div>
            <div class="ml-5">- Also would set us up for a callback type behavior where we get x number of records every call until tableData.length === response.data.totalRows</div>
            <h6 class="mt-3 mb-1">Optional/Questions</h6>
            <div>Filter Selects : is there a strong argument for populating select dropdowns with preset options for filters? Absolutely can be done, but requires some more development</div>
            <div class="ml-5">- Dynamically populating dropdowns based off of column content - difficult</div>
            <div class="ml-5">- Another option would be to tie in with the process for filters below - include those options with a filters server response key</div>
            <div>"filters" : bad idea to turn the table data values into objects to determine 'filterability' (tableData[0].noc_number.filterable). Makes things very complicated for the front end</div>
            <div class="ml-5">- If we don't want the front end dev to specify filters through a prop, back end could send "response.data.filters" I guess...</div>
            <div class="ml-5">- Same goes for Table Headers, except we probably need to have the front end specify them so they can assign table column widths</div>
          </b-card>
        </b-collapse>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import {axiosMock} from "@/utils/axiosMock";
import {mockSubmissions} from "@/utils/data/submissions";
import {mockSubmissionsTwo} from "@/utils/data/submissionsTwo";

export default {
  name: "DynamicTable",
  props: {
    filterable: {
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
    tableFields: {
      type: Array,
      required: true,
    },
    filters: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  computed: {
    recordsRange() {
      const totalPages = Math.ceil(this.totalRows / this.perPage)
      const resultStart = (this.currentPage -1) * this.perPage + 1
      const resultEnd = this.currentPage === totalPages ? this.totalRows : resultStart + this.perPage - 1
      return `${resultStart} through ${resultEnd}`
    },
    computedFilters: {
      get: function() {
        return this.filters
      },
      set: function(newFilters) {
        this.$emit('update:filters', newFilters)
      },
    },
  },
  data() {
    return {
      currentPage: 1,
      loading: {
        base: true,
        lazy: this.lazy
      },
      perPage: 10,
      selectedCell: null,
      totalRows: 0,
      tableData: [],
    }
  },
  mounted() {
    console.log('slots', this.$slots)
    this.checkPropsForErrors()
    // this.setFilters()
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
        console.log('Table Error', error)
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
    setFilters() {
      for (let field of this.tableFields) {
        for (let key in field) {
          if (key === 'key') this.$set(this.filters, field[key], null)
        }
      }
    },
    resetTable() {
      this.tableData = []
      this.loading.base = true
      this.loading.lazy = true
      this.totalRows = 0
      this.currentPage = 1
      this.getTableData()
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
      for (let filter of filterObject) {
        const rowData = this.returnString(tableRow[filter.key])
        if (filter.value !== null && !rowData.includes(filter.value.toLowerCase())) {
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
    },
    checkPropsForErrors() {
      const propErrors = []

      if (this.lazy && !this.secondApiUrl) {
        propErrors.push(new Error('Usage of the "lazy" prop requires the usage of the secondApiUrl prop'))
      }

      if (this.filterable && this.filters.length === 0) {
       propErrors.push(new Error('Usage of the "filterable" prop requires an array of filter objects passed to the filters prop'))
      }

      if (propErrors.length > 0) throw propErrors
    },
  }
}
</script>

<style>
button.page-link, span.page-link, button.page-item:disabled{
  border-radius: 3px;
  padding: .2rem .8rem!important;
  font-size: 1rem!important;
  margin: 0 .3rem;
  border:none !important;
}

#table-busy-spinner {
  height: 9rem;
  width: 9rem;
}

#table-busy-wrapper {
  display: flex;
  height: 200px;
  justify-content: center;
  align-items: center;
}

#page-select-label {
  font-size: 1rem;
}
</style>
