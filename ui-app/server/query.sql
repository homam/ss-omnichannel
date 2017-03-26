with T0 AS (
  select
      o.customerid, o.saletime, l.name as name, o.total,
      (l.name like 'Web%') as web0,
      first_value(l.name) OVER w as first_store,
      first_value(l.code) OVER w as first_store_country,
      first_value(total) OVER w as first_total,
      row_number() OVER w  as row
  from ss_purchases  as o
  inner join ss_locations l on l.locationid = o.locationid
  inner join ss_customers c on o.customerid = c.customerid and c.DateCreated between '$params.cFromDate$' and '$params.cToDate$'
  where
      o.saletime between '$params.pFromDate$' and '$params.pToDate$'
  WINDOW w as (PARTITION BY o.customerid ORDER BY o.saletime)
  order by o.customerid, o.saletime
),
T AS (
  select row, customerid, coalesce(total, 0) as total,
    (CASE when web0 = True then 1 else 0 end) as web,
    (CASE when web0 = True then 0 else 1 end) as retail
  from T0
  where
    (total > 0 or row = 1)
    $(!!params.country ? `and first_store_country = '` + params.country + `'` : '')$
    $(!!params.stores ? `and first_store in (` + params.stores.map(x => "'" + x + "'").join(',') + `)` : '')$
)
,
U0 AS (
  select customerid, sum(total) as total,
  string_agg( web::text, ', ' order by row) as webs
  from T
  group by customerid
),

U as (
  select webs, sum(total)  as count from U0
  group by webs
)

select * from U
