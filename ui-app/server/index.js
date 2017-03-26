// @flow
const express = require('express');
const app = express();
const query = require('./sql-api')

const respond = (sql, params, res, map = x => x) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Content-Type', 'text/json')
  query(sql, params)
  .then(x => res.end(JSON.stringify(map(x.rows))))
  .catch(x => {
    console.error(x)
    res.set('status', 500)
    res.end(`Error:\n${x.toString()}`)
  })
}

app.get('/api/query', (req, res) => {
  const fs = require('fs')
  respond(fs.readFileSync('./server/query.sql', 'utf8'), req.query, res)
})

app.get('/api/countries', (req, res) => {
  respond(`select distinct(code) as country from ss_locations order by code`, {}, res, xs => xs.map(x => x.country))
})

app.listen(3081);
