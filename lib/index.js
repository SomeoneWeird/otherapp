const https = require('https')
const request = require('request')
const phantom = require('phantom')

const url = 'https://smealum.github.io/3ds/'
const payloadUrl = 'https://smealum.github.io/3ds/payload_select.js'

function fetchPage (url, callback) {
  https.get(url, function (res) {
    let d = ''
    res.on('data', function (data) {
      d += data.toString()
    })
    res.on('error', function (err) {
      return callback(err)
    })
    res.on('end', function () {
      return callback(null, d)
    })
  })
}

module.exports = function (model, version, region, callback) {
  let _ver = version.split(/[\.-]/)

  let options = {
    five: {
      o3ds: 0,
      '2ds': 0,
      n3ds: 1
    },
    zero: {
      '9': 0,
      '10': 1,
      '11': 2
    },
    one: {
      '0': 0,
      '1': 1,
      '2': 2,
      '3': 3,
      '4': 4,
      '5': 5,
      '6': 6,
      '7': 7,
      '8': 8,
      '9': 9
    },
    two: {
      '0': 0
    },
    three: {
      '7': 0,
      '8': 1,
      '9': 2,
      '10': 3,
      '11': 4,
      '12': 5,
      '13': 6,
      '14': 7,
      '15': 8,
      '16': 9,
      '17': 10,
      '18': 11,
      '19': 12,
      '20': 13,
      '21': 14,
      '22': 15,
      '23': 16,
      '24': 17,
      '25': 18,
      '26': 19,
      '27': 20,
      '28': 21,
      '29': 22,
      '30': 23,
      '31': 24,
      '32': 25,
      '33': 26,
      '34': 27,
      '35': 28,
      '36': 29,
      '37': 30,
      '38': 31,
      '39': 32,
      '137': 33,
      '999': 34
    },
    four: {
      eur: 0,
      usa: 1,
      jpn: 2,
      kor: 3
    }
  }

  let match = {
    five: options.five[model],
    zero: options.zero[_ver[0]],
    one: options.one[_ver[1]],
    two: options.two[_ver[2]],
    three: options.three[_ver[3]],
    four: options.four[region]
  }

  let js = 'function() {' +
  '  document.querySelectorAll("[name=five]")[0].selectedIndex = ' + match.five + ';' +
  '  document.querySelectorAll("[name=five]")[0].dispatchEvent(new Event("change"));' +
  '  document.querySelectorAll("[name=zero]")[0].selectedIndex = ' + match.zero + ';' +
  '  document.querySelectorAll("[name=zero]")[0].dispatchEvent(new Event("change"));' +
  '  document.querySelectorAll("[name=one]")[0].selectedIndex = ' + match.one + ';' +
  '  document.querySelectorAll("[name=one]")[0].dispatchEvent(new Event("change"));' +
  '  document.querySelectorAll("[name=two]")[0].selectedIndex = ' + match.two + ';' +
  '  document.querySelectorAll("[name=two]")[0].dispatchEvent(new Event("change"));' +
  '  document.querySelectorAll("[name=three]")[0].selectedIndex = ' + match.three + ';' +
  '  document.querySelectorAll("[name=three]")[0].dispatchEvent(new Event("change"));' +
  '  document.querySelectorAll("[name=four]")[0].selectedIndex = ' + match.four + ';' +
  '  document.querySelectorAll("[name=four]")[0].dispatchEvent(new Event("change"));' +
  '  return getUrlFromVersion([global_version[1], global_version[2], global_version[3], global_version[4], global_version[5], global_version[0]]);' +
  '}'

  phantom.create().then(function (instance) {
    instance.createPage().then(function (page) {
      page.open(url).then(function () {
        page.property('content').then(function () {
          page.evaluateJavaScript(js).then(function (url) {
            instance.exit().then(function () {
              return callback(url)
            })
          })
        })
      })
    })
  })
}

function parseObj (body, regex, replace) {
  return JSON.parse(JSON.stringify(body).match(regex)[1].replace(/\\r\\n/g, '').replace(/\s/g, '').replace(/'/g, '"').replace(new RegExp(replace, 'g'), 0))
}

module.exports.versions = function (callback) {
  const oldOptionsRegex = /oldOptions = ([\\r\\n\s'\d:{\w,}]+)\\r\\n\\r\\n/
  const zeroMicro1Regex = /zeroMicro_1 = ([\\r\\n\s'\d:{\w,}]+)\\r\\n\\r\\n/
  const NUPs1Regex = /NUPs_1 = ([\\r\\n\s'\d:{\w,}]+)\\r\\n\\r\\n/
  fetchPage(payloadUrl, function (err, body) {
    if (err) {
      return callback(err)
    }
    if (!body || !body.length) {
      return callback()
    }
    let oldOptions = parseObj(body, oldOptionsRegex, 'zeroMicro_1')
    let zeroMicro = parseObj(body, zeroMicro1Regex, 'NUPs_1')
    let nups = parseObj(body, NUPs1Regex, 'regions')

    let versions = []

    for (let first in oldOptions) {
      for (let second in oldOptions[first]) {
        for (let third in zeroMicro) {
          for (let fourth in nups) {
            let str = first + '.' + second + '.' + third + '-' + fourth
            versions.push(str)
          }
        }
      }
    }

    return callback(null, versions.reverse())
  })
}
