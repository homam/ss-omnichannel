const Promise = require("bluebird")
const pg = require('pg')
const R = require('ramda');
const QueryStream = require('pg-query-stream')
const JSONStream = require('JSONStream')
const Rx = require('rx');
const RxNode = require('rx-node');
const fs = require('fs');
const summerizeSales = require('./summerize-sales')

const config = 'postgresql://localhost'
const client = new pg.Client(config)
const client_worker = new pg.Client(config)


var concat = require('concat-stream')
var Transform = require('stream').Transform

// var wstream = fs.createWriteStream('./output.txt', { flags: 'a' })

const insertPurchase = (client, obj) => 
  client.query(`INSERT INTO ss_purchases ("purchaseid","customerid","saletime","locationid","total") VALUES (${obj.purchaseid}, ${obj.customerid}, '${obj.saletime.toISOString()}', ${obj.locationid}, ${obj.total});`)

client_worker.connect(async (err, conn) => {

  const end = () => {
    console.warn('ended')
    client_worker.end()
    client.end()
  }

  if(err) {
    end()
    throw err
  }

  client.connect(async (err, conn) => {
    if(err) {
      end()
      throw err
    }

    const mapper = new Transform({objectMode: true})
    mapper._transform = function(obj, enc, cb) {

      const self = this

      summerizeSales(client_worker, obj.salesid).then(res => {
        // console.warn('summary', JSON.stringify(res))
        return insertPurchase(client_worker, res).then(_ => res)
      })
      .then(res => {
        self.push(res)
        cb();
      })
      .catch(err => {
        console.error('error in summerizeSales', err)
        throw err
      })
    }

    // cleanup ss_purchases table
    await client.query(`
      drop table if exists ss_purchases;
      CREATE TABLE ss_purchases
          ("saletime" timestamp, "customerid" int, "total" decimal, "locationid" int, purchaseid int)
      ;
    `)

    const count = await client.query(`SELECT count(*) as count FROM ss_sales where is_a_return_from_these_salesids is null and customerid is not null and customerid != 1073744086`)
    const totalCount = count.rows[0].count

    process.stdout.write(`Creating Purchases \n`)
    process.stdout.write(`Total Count = ${totalCount} \n`)


    const stream = new QueryStream('SELECT * FROM ss_sales where is_a_return_from_these_salesids is null and customerid is not null and customerid != 1073744086 order by salesid', [], {highWaterMark: 100, batchSize: 50})
    const query = client.query(stream)

    var row = 0;
    stream.pipe(mapper).on('data', function(res) {

      const progress = ++row / totalCount

      process.stdout.clearLine();
      process.stdout.cursorTo(0);

      process.stdout.write(`${progress == 1 ? '100' : (Math.round(1000 * progress * 100) / 1000).toString().padEnd(5, '0') }%;\t ${JSON.stringify(res)}`.substr(0, 80))
      
    }).on('end', end)

  })
})