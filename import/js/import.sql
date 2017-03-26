drop table if exists ss_customers;
CREATE TABLE ss_customers
    ("customerid" int, "datecreated" timestamp null, "firstpurchase" timestamp null)
;
\copy ss_customers from ../data/customer.csv DELIMITER ',' CSV HEADER
create index on ss_customers (customerid);
create index on ss_customers (datecreated desc);


drop table if exists ss_locations;
CREATE TABLE ss_locations
    ("locationid" int, "code" varchar(2), "name" varchar(60))
;
\copy ss_locations from ../data/location.csv DELIMITER ',' CSV HEADER
create index on ss_locations (locationid);
create index on ss_locations (code);

drop table if exists ss_sales;
CREATE TABLE ss_sales
    ("salesid" int, "customerid" int, "locationid" int, "saletime" timestamp, "total" decimal)
;
\copy ss_sales from ../data/sales.csv DELIMITER ',' CSV HEADER
create index on ss_sales (salesid);
create index on ss_sales (customerid);
create index on ss_sales (locationid);
create index on ss_sales (saletime desc);
create index on ss_sales (saletime asc);


drop table if exists ss_saleitems;
CREATE TABLE ss_saleitems
    ("salesid" int, "saleitemid" int, "saletime" timestamp, "returnfromsaleitemid" int, "quantity" decimal, "fullprice" decimal)
;
\copy ss_saleitems from ../data/saleitems.csv DELIMITER ',' CSV HEADER
create index on ss_saleitems (salesid);
create index on ss_saleitems (saleitemid);
create index on ss_saleitems (returnfromsaleitemid);
create index on ss_saleitems (saletime desc);
create index on ss_saleitems (saletime asc);

-- is_a_return_from_salesid from which salesid this item was returned
alter table ss_saleitems add column is_a_return_from_salesid int null;
update public.ss_saleitems si set is_a_return_from_salesid = (SELECT s.salesid from public.ss_saleitems s where s.saleitemid = si.returnfromsaleitemid);
create index on ss_saleitems (is_a_return_from_salesid);

-- has_been_returned_from_saleitemid this item was returned by which saleitemid
alter table ss_saleitems add column has_been_returned_from_saleitemid int null;
update public.ss_saleitems si set has_been_returned_from_saleitemid = (SELECT s.saleitemid from public.ss_saleitems s where s.returnfromsaleitemid = si.saleitemid limit 1);
create index on ss_saleitems (has_been_returned_from_saleitemid);


-- has_been_returned_from_salesid this item was returned in which salesid
alter table ss_saleitems add column has_been_returned_from_salesid int null;
update public.ss_saleitems si set has_been_returned_from_salesid = (SELECT s.salesid from public.ss_saleitems s where s.returnfromsaleitemid = si.saleitemid limit 1);
create index on ss_saleitems (has_been_returned_from_salesid);

alter table ss_sales add column is_a_return_from_these_salesids int[] null;
-- update public.ss_sales s set is_a_return_from_these_salesids = (SELECT array_agg(distinct si.is_a_return_from_salesid) as is_a_return_from_these_salesids from public.ss_saleitems si where si.is_a_return_from_salesid is not null and si.salesid = s.salesid);


alter table ss_sales add column has_been_returned_from_these_salesids int[] null;
-- update public.ss_sales s set has_been_returned_from_these_salesids = (SELECT array_agg(distinct si.salesid) as has_been_returned_from_these_salesids from public.ss_saleitems si where si.is_a_return_from_salesid = s.salesid);
