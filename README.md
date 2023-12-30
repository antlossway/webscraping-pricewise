# Notes for JSMastery Pricewise project

[https://youtu.be/lh9XVGv6BHs?si=bJTAhW2eMYRk0S9h](https://youtu.be/lh9XVGv6BHs?si=bJTAhW2eMYRk0S9h)

This project is very interesting for me as it shows how to do web scraping in a safe way using brightdata's service.

## Next.js

```
export const maxDuration = 300 // 5 minutes, this function can run for a maximum of 5 minutes, next.js 13.4.10+ only

export const dynamic = "force-dynamic" // Force dynamic rendering, which will result in routes being rendered for each user at request time. This option is
equivalent to getServerSideProps() in the pages directory.

export const revalidate = 0 // Ensure a layout or page is always dynamically rendered even if no dynamic functions or uncached data fetches are discovered.
```

## Carousel

The tutorial use 3rd party package to save time, not bad.

```
npm install react-responsive-carousel
```

## Web Scraping

https://brightdata.com/products/web-unlocker

For new user, they give $5 credit for testing.

## Parsing HTML

We need to extract product details (price, description, etc...) from the scraped data.

Cheerio is a fast library for parsing and manipulating HTML and XML.

```
npm install axios cheerio

 try {
    // Fetch the product page
    const response = await axios.get(url, options)

    const $ = cheerio.load(response.data)
    // Extract product title
    // element has type of object representing a DOM element, so use .text() to get the text content
    const title = $("#productTitle").text().trim()
 }
```

## MongoDB

1.

```
npm install mongoose
```

2. Create Database and keep `MONGODB_URI` in .env

3. Create Schema
   app/models/product.model.ts

## Server Action

Interaction with Database, the actions are defined in
`/app/lib/actions/index.ts`

## email

use nodemailer package
smtp server use outlook email account, for simple test, it's a great solution.

## cronjob

to periodically scrape all products, update in database and notify users the change of the product (back to stock or price reduction)

1. create `/app/api/cron/route.ts` GET function
2. use free service of cron-job.org to call HTTP GET of the API
   This is interesting if I feel lazy or I want to use serverless solution.
   But if I have hands on a server, I will just set up cronjob by myself.
