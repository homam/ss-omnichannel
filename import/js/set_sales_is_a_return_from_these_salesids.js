const Promise = require("bluebird")
const pg = require('pg')
const R = require('ramda');
const QueryStream = require('pg-query-stream')
const JSONStream = require('JSONStream')
const fs = require('fs');

const config = 'postgresql://localhost'
const client = new pg.Client(config)
const client_worker = new pg.Client(config)

const trace = (x, y) => { console.warn(x); return y; }
const trace1 = x => trace(x, x)


var concat = require('concat-stream')
var Transform = require('stream').Transform

// var wstream = fs.createWriteStream('./output.txt', { flags: 'a' })

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
      client_worker.query(`
        update ss_sales set is_a_return_from_these_salesids = (SELECT array_agg(distinct si.is_a_return_from_salesid) as is_a_return_from_these_salesids 
        from public.ss_saleitems si where si.is_a_return_from_salesid is not null and si.salesid = ${obj.salesid}) where salesid = ${obj.salesid}
      `)
      .then(res => {
        self.push(obj)
        cb();        
      })
      .catch(err => {
        console.error('error in setting is_a_return_from_these_salesids', err)
        throw err
      })
    }


    const count = await client.query(`SELECT count(*) as count FROM ss_sales where customerid is not null and customerid != 1073744086`)
    const totalCount = count.rows[0].count

    console.log(`Setting is_a_return_from_these_salesids`)
    console.log(`Total Count = `, totalCount)

    const stream = new QueryStream(`SELECT * FROM ss_sales where customerid is not null and customerid != 1073744086 order by salesid`, [], {highWaterMark: 100, batchSize: 50})
    const query = client.query(stream)

    var row = 0;
    stream.pipe(mapper).on('data', function(res) {
      

      const progress = ++row / totalCount

      process.stdout.clearLine();
      process.stdout.cursorTo(0);

      process.stdout.write(`${progress == 1 ? '100' : (Math.round(1000 * progress * 100) / 1000).toString().padEnd(5, '0')}%;\t ${JSON.stringify(res)}`.substr(0, 80))
      
    }).on('end', end)

  })
})