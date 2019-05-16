const axios = require('axios')
var fs = require('fs');
require('dotenv').config()

const addressArray = ['SW SCHOLLS FERRY RD,# 102, 97007','15112,SW CANYON WREN WAY, 97007','15114,SW CANYON WREN WAY,97007','15116,SW CANYON WREN WAY,97007','15118,SW CANYON WREN WAY,97007','15120,SW CANYON WREN WAY,97007','14932,SW SCHOLLS FERRY RD,# 301,97007','14754,SW SCHOLLS FERRY RD,# 1017,97007','14339,SW BARROWS RD,97007','45.4336087,14932,SW SCHOLLS FERRY RD,# 201,97007','11950,SW HORIZON BLVD,97007']

// becomes an array of addresses that are stripped of illegal characters
const cleanedAddressesArray =
addressArray.map((currentAddress) => {

  // breaks the address string at commas into an array of address elements
  let splitAddressArray = currentAddress.split(',')

  // this will become the address with illegal characters removed
  let formattedAddress = ''

  // goes over each element of the address, checks to see if it includes illegal
  // characters
  splitAddressArray.forEach((addressElement) => {

    // if the element includes illegal characters, it will remove the element from the array
    if (addressElement.includes('#') || addressElement.includes('.')) {
      return
    }

    // removes white space from the element
    let strippedElement = addressElement.trim()

    // combines the array of elements back into a string
    formattedAddress += ` ${strippedElement}`
  })

  // gets rid of the empty space from the start of the string and returns the address to the array
  return formattedAddress.substring(1)
})

// fetch address data from an array of addresses
function fetchAddressData(addressArrayInput){
  const formattedObjects = []
  let completedFetches = 0

  // loops over the array of formmatted adresses, fetches that address,
  // formats it into a json object, writes the array of json objects to
  // the disk when all fetches have been completed
  addressArrayInput.forEach(async (address) => {

    // makes the network request, haults while the request is active and the
    // script continues when the request is completed
    const axiosRequest = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.APIKEY}`)

    // returns goes on to the next iteration if there is no response data from the fetch
    if (!axiosRequest || axiosRequest && !axiosRequest.data) return

    // if there is data from the request, formats the address and pushes it into an array
    if (axiosRequest.data.results && axiosRequest.data.results.length > 0){
      // sends the addess data to a function that formats it, the formatted address is returned
      const formatted = formatAddressData(axiosRequest.data, address)
      formattedObjects.push(formatted)
      // iterates the number of fetches that have been completed
      completedFetches += 1
    }

    // checks to see if the requests have all been completed, if so,
    // writes the array of formatted addresses to disk
    if(completedFetches === addressArrayInput.length){
      console.log('Process Completed Successfully')
      writeToDisk(formattedObjects)
    }
  })
}

// returns a formatted json address to be pushed into an array
const formatAddressData = (addressData, address) => ({
    address: address,
    lat: addressData.results[0].geometry.location.lat,
    long: addressData.results[0].geometry.location.lng
  })

// writes to disk
function writeToDisk(contents){
  console.log(contents)
  var json = JSON.stringify(contents);
  fs.writeFile('addresses.json', json, 'utf8', (test)=>{return});
}

// starts the fetching of adresses
fetchAddressData(cleanedAddressesArray)
