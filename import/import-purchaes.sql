drop table if exists ss_purchases;
CREATE TABLE ss_purchases
    ("saletime" timestamp, "customerid" int, "total" decimal, "locationid" int, purchaseid int)
;
\copy ss_purchases from ./data/ss_purchases.csv DELIMITER ',' CSV HEADER;
create index on ss_purchases (purchaseid);
create index on ss_purchases (customerid);
create index on ss_purchases (saletime);
