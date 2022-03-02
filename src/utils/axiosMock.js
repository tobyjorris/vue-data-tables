const axios = require('axios')
const MockAdapter = require('axios-mock-adapter')
const axiosMock = new MockAdapter(axios, {delayResponse: 5000})

export {
    axiosMock,
}
