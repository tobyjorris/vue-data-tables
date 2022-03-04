<template>
  <div class="container">
    <div class="row mt-3">
      <div class="col d-flex justify-content-center">
          <img alt="Vue logo" class="mr-4" style="height: 96px; width: auto" src="./assets/logo.png">
      </div>
    </div>
    <div class="row">
      <b-tabs content-class="mt-3" fill>
        <b-tab title="Bootstrap Vue" active>
          <div class="container">
            <div class="row mt-5">
              <simple-apps-table
                  filterable
                  lazy
                  api-url="/submissions"
                  second-api-url="/submissions-two"
                  :per-page="5"
              >
              <!--Any custom column cells can go here-->
                <template #cell(noc_number)="data">
                  <a href="#">{{data.item.noc_number}}</a>
                </template>
                <template #cell(products)="data">
                  <div class="table-row">{{returnStringFromArray(data.item.products, 'product_name')}}</div>
                </template>
              </simple-apps-table>
            </div>
<!--            <div class="row">-->
<!--              <half-lazy-table :first-row-menu="false"  />-->
<!--            </div>-->
          </div>
        </b-tab>
<!--        <b-tab title="PrimeVue" >-->
<!--          <div class="container">-->
<!--            <div class="row mt-5 mb-5">-->
<!--              <p-v-static-table />-->
<!--            </div>-->
<!--            <div class="row">-->
<!--              <p-v-dynamic-table />-->
<!--            </div>-->
<!--          </div>-->
<!--        </b-tab>-->
      </b-tabs>
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
  methods: {
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
