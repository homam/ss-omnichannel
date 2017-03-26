# Omni-Channel Dashboard

## Prerequisites

Make sure you have Home Brew installed on your Mac (https://brew.sh/).

**Install PostgreSQL locally**

```bash
brew install postgres
```

**Make sure you have NodeJS version 7.2**

The easiest way is to install [nvm](https://github.com/creationix/nvm#installation) is to run this command:

```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash
```

After `nvm` installation, navigate to `ss-omnichannel` directory and run:

```
nvm use 7.2
```

## Preparing the Data

**If you already have `ss_purchases.csv`**, copy the CSV file to `./import/data` directory and only run:

```
./import-purchases.sh 
```

Otherwise to **generate purchases** from raw sales data:

Copy exported CSV files into the `./import/data` directory (make sure the files are named correctly):

```
$ tree ./import/data

import/data
├── customer.csv
├── location.csv
├── saleitems.csv
└── sales.csv
```

In terminal run:

```
./init.sh
```

This takes a few hours. You can follow the progress on the terminal output.

You need to run `./init.sh` every time that you have new CSV files only once.

## Starting the Web app

To start the omnichannel dashboard Web app run:

```
./start.sh
```

The program opens the dashboard in your default Web browser.

## Details

### Database

The import script (re-) creates the following tables in `public` schema:

```
ss_customers
ss_locations
ss_sales
ss_saleitems
ss_purchases
```

Generating `purchases` table might take a couple of hours. If it takes too long, restart your computer and start over.
