import Product from "@/app/lib/models/product.model"
import { connectToDB } from "@/app/lib/mongoose"
import { generateEmailBody, sendEmail } from "@/app/lib/nodemailer"
import { scrapeAmazonProduct } from "@/app/lib/scraper"
import { getEmailNotifType } from "@/app/lib/utils"
import { User } from "@/app/types"
import { NextResponse } from "next/server"

export const maxDuration = 300 // 5 minutes, this function can run for a maximum of 5 minutes, next.js 13.4.10+ only
export const dynamic = "force-dynamic" // Force dynamic rendering, which will result in routes being rendered for each user at request time. This option is equivalent to getServerSideProps() in the pages directory.
export const revalidate = 0 // Ensure a layout or page is always dynamically rendered even if no dynamic functions or uncached data fetches are discovered.

export async function GET(request: Request) {
  try {
    connectToDB()
    const products = await Product.find({})
    if (!products) throw new Error("No products found")

    // 1. scrape latest product details and update db
    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        // Scrape product
        const scrapedProduct = await scrapeAmazonProduct(currentProduct.url)
        if (!scrapedProduct) return
        // Update product
        const updatedPriceHistory = [
          ...currentProduct.priceHistory,
          { price: scrapedProduct.currentPrice },
        ]

        const product = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: Math.min(
            ...updatedPriceHistory.map((item: any) => item.price)
          ),
          highestPrice: Math.max(
            ...updatedPriceHistory.map((item: any) => item.price)
          ),
          averagePrice:
            updatedPriceHistory.reduce(
              (acc: any, curr: any) => acc + curr.price,
              0
            ) / updatedPriceHistory.length,
        }

        const updatedProduct = await Product.findOneAndUpdate(
          { url: scrapedProduct.url },
          product,
          { upsert: true, new: true }
        ) // upsert: true means if the product doesn't exist, create a new one

        // check each product's status and send email accordingly
        const emailNotifType = getEmailNotifType(scrapedProduct, updatedProduct)
        if (emailNotifType && updatedProduct.users.length > 0) {
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
          }
          const emailContent = generateEmailBody(productInfo, emailNotifType)
          const userEmails = updatedProduct.users.map(
            (user: User) => user.email
          )
        }

        return updatedProduct
      })
    )

    return NextResponse.json({
      message: "OK",
      data: updatedProducts,
    })
  } catch (error: any) {
    throw new Error(`Error in GET: ${error.message}`)
  }
}
