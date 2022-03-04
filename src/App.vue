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
              <b-v-dynamic-table
                  first-row-menu
                  lazy
                  api-url="/submissions"
                  second-api-url="/submissions-two"
              >
              <!--TODO - configure dynamic prop slots for <template #cell(column-name)="data" /> -->
              </b-v-dynamic-table>
            </div>
            <div class="row">
              <half-lazy-table :first-row-menu="false"  />
            </div>
          </div>
        </b-tab>
        <b-tab title="PrimeVue" >
          <div class="container">
            <div class="row mt-5 mb-5">
              <p-v-static-table />
            </div>
            <div class="row">
              <p-v-dynamic-table />
            </div>
          </div>
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>

<script>

import PVStaticTable from "@/components/PrimeVue/StaticTable";
import PVDynamicTable from "@/components/PrimeVue/DynamicTable";
import BVDynamicTable from "@/components/BootstrapVue/DynamicTable";
import HalfLazyTable from "@/components/BootstrapVue/HalfLazyTable"
export default {
  name: 'App',
  components: {
    PVStaticTable,
    PVDynamicTable,
    BVDynamicTable,
    HalfLazyTable
  }
}
</script>
