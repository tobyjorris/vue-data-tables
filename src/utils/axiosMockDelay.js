const axios = require('axios')
const MockAdapter = require('axios-mock-adapter')

const axiosMockDelay = new MockAdapter(axios, { delayResponse: 10000 })

export default axiosMockDelay
