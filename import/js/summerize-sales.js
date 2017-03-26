// module
const Promise = require("bluebird")
const R = require('ramda');
const trace = (x, y) => { console.warn(x); return y; }
const trace1 = x => trace(x, x)

const foldTreeToValue = R.curry((f, seed, tree) => {
    if(!tree){
        return seed
    }
    const {node, children} = tree
    const c = children.reduce((a, b) => foldTreeToValue(f, a, b), f(seed, node))
    return c
})

const summerizeTree = foldTreeToValue(
  (a, b) => ({
    total: a.total + b.total,
    quantity: a.quantity + b.quantity,
    salesids: a.salesids.concat([b.salesid])
  }),
  {total: 0, quantity: 0, salesids: []}
)

// pg client -> salesid -> Promise {total, quantity, salesids: []}
module.exports = async (client, salesid) => {
  const getSale = async salesid => 
    client.query(`
      select salesid, customerid, saletime, total, locationid, has_been_returned_from_these_salesids 
      from ss_sales 
      where salesid = ${salesid}
    `)
    .then(x => x.rows[0] || null)
    .then(x => !x ? null : R.merge(x, { has_been_returned_from_these_salesids: R.filter(y => y != salesid)(x.has_been_returned_from_these_salesids || []) }))

  const getReturns = async has_been_returned_from_these_salesids => 
    has_been_returned_from_these_salesids.length == 0 
    ? Promise.resolve([])
    : client.query(`   
       select salesid, customerid, saletime, total, locationid, has_been_returned_from_these_salesids 
       from ss_sales  
       where salesid in (${has_been_returned_from_these_salesids.join(',')})
     `)
     .then(x => x.rows || [])
     .then(R.map(x => R.merge(x, { has_been_returned_from_these_salesids: R.filter(y => y != x.salesid)(x.has_been_returned_from_these_salesids || []) })))

  const getAllReturns = async has_been_returned_from_these_salesids => {
    if(has_been_returned_from_these_salesids.length == 0) {
      return []
    }

    const rets = await getReturns(has_been_returned_from_these_salesids)
    const ret_salesids = R.pipe(R.chain(x => x), R.filter(x => !!x), R.uniq)(rets.map(x => x.has_been_returned_from_these_salesids))
    // console.log('ret_salesids', has_been_returned_from_these_salesids, ret_salesids)
    const nrets = await getAllReturns(ret_salesids)
    return rets.concat(nrets)

  }

  const makeTree = async (salesid) => {

    // console.log('makeTree', salesid)

    const sale = await getSale(salesid)

    // console.log('sale', sale)

    const rets = !sale.has_been_returned_from_these_salesids ? [] : await getAllReturns(sale.has_been_returned_from_these_salesids)

    // console.log('returns', rets)

    const all_sales = [sale].concat(rets)

    return { 
      purchaseid: sale.salesid, 
      customerid: sale.customerid,
      saletime: sale.saletime,
      locationid: sale.locationid,
      total: R.pipe(R.map(x => +x.total), R.sum)(all_sales)
    }
  }

  // return getSale(salesid).then(s => getReturns(s.saleitemids))

  return makeTree(salesid) //.then(summerizeTree)
}