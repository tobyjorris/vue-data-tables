<template>
  <div class="container">
    <div class="row mt-3">
      <div class="col d-flex justify-content-center">
          <img alt="Vue logo" class="mr-4" style="height: 96px; width: auto" src="./assets/logo.png">
      </div>
    </div>
    <div class="row">
      <div class="col">
         <simple-apps-table
           id="simple-apps-table"
           filterable
           lazy
           api-url="/submissions"
           second-api-url="/submissions-two"
           :table-fields="tableFields"
           :filters="filters"
        >
          <!--Any custom column cells can go here-->
          <template #cell(noc_number)="data">
            {{debug(data)}}
            <a href="#">{{data.item.noc_number}}</a>
          </template>
          <template #cell(products)="data">
            <div class="table-row">{{returnStringFromArray(data.item.products, 'product_name')}}</div>
          </template>
        </simple-apps-table>
      </div>
<!--      <b-tabs content-class="mt-3" fill>-->
<!--        <b-tab title="Bootstrap Vue" active>-->
<!--          <div class="container">-->
<!--            <div class="row mt-5">-->
<!--&lt;!&ndash;             &ndash;&gt;-->
<!--            </div>-->
<!--&lt;!&ndash;            <div class="row">&ndash;&gt;-->
<!--&lt;!&ndash;              <half-lazy-table :first-row-menu="false"  />&ndash;&gt;-->
<!--&lt;!&ndash;            </div>&ndash;&gt;-->
<!--          </div>-->
<!--        </b-tab>-->
<!--&lt;!&ndash;        <b-tab title="PrimeVue" >&ndash;&gt;-->
<!--&lt;!&ndash;          <div class="container">&ndash;&gt;-->
<!--&lt;!&ndash;            <div class="row mt-5 mb-5">&ndash;&gt;-->
<!--&lt;!&ndash;              <p-v-static-table />&ndash;&gt;-->
<!--&lt;!&ndash;            </div>&ndash;&gt;-->
<!--&lt;!&ndash;            <div class="row">&ndash;&gt;-->
<!--&lt;!&ndash;              <p-v-dynamic-table />&ndash;&gt;-->
<!--&lt;!&ndash;            </div>&ndash;&gt;-->
<!--&lt;!&ndash;          </div>&ndash;&gt;-->
<!--&lt;!&ndash;        </b-tab>&ndash;&gt;-->
<!--      </b-tabs>-->
    </div>
  </div>
</template>

<script>

import PVStaticTable from "@/components/PrimeVue/StaticTable";
import PVDynamicTable from "@/components/PrimeVue/DynamicTable";
import SimpleAppsTable from "@/components/BootstrapVue/DynamicTable";
import HalfLazyTable from "@/components/BootstrapVue/HalfLazyTable"
export default {
  name: 'App',
  components: {
    PVStaticTable,
    PVDynamicTable,
    SimpleAppsTable,
    HalfLazyTable
  },
  data() {
    return {
      tableFields: [
        {key: 'noc_number', label: 'NoC #', sortable: true, class: 'noc-col align-middle',},
        {key: 'notified_body', label: 'NB', sortable: true, class: 'nb-col'},
        {key: 'status', label: 'Status', sortable: true},
        {key: 'submission_title', label: 'Submission Title', sortable: true},
        {key: 'products', label: 'Product(s)', sortable: true},
        {key: 'submission_type', label: 'Submission Type', sortable: true},
        {key: 'division', label: 'Division', sortable: true, class: 'division-col'},
        {key: 'author', label: 'Author/Owner', sortable: true},
      ],
      filters: [
        {key: 'noc_number', value: null},
        {key: 'notified_body', value: null, options: [{label: '', value: null}, 'BSI', 'Dekra', 'TUV-SUD']},
        {key: 'status', value: null},
        {key: 'submission_title', value: null},
        {key: 'products', value: null},
        {key: 'submission_type', value: null},
        {key: 'division', value: null},
        {key: 'author', value: null},
      ]
    }
  },
  methods: {
    debug(data) {
      console.log('data', data)
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
  }
}
</script>

<style>
#simple-apps-table {
  font-size: .8rem;
}

.noc-col {
  width: 6rem;
}

.nb-col {
  width: 5rem
}

.division-col {
  width: 5rem;
}
</style>
