"use server"

import { revalidatePath } from "next/cache"
import Product from "../models/product.model"
import { connectToDB } from "../mongoose"
import { scrapeAmazonProduct } from "../scraper"
import { generateEmailBody, sendEmail } from "../nodemailer"
import { User } from "@/app/types"

export async function scrapeAndStoreProduct(productUrl: string) {
  if (!productUrl) return

  try {
    connectToDB()
    const scrapedProduct = await scrapeAmazonProduct(productUrl)
    if (!scrapedProduct) return

    // store in database
    let product = scrapedProduct
    const existingProduct = await Product.findOne({ url: scrapedProduct.url })
    // if product already exists, take the existing price history and add the new price to it, then calculate the new lowest, highest, and average prices
    if (existingProduct) {
      const updatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice },
      ]

      product = {
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
        discountRate:
          100 -
          (scrapedProduct.currentPrice / scrapedProduct.originalPrice) * 100,
      }
    }
    // if product doesn't exist, create a new one

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      product,
      { upsert: true, new: true }
    ) // upsert: true means if the product doesn't exist, create a new one
    // new: true means return the new product instead of the old one
    revalidatePath(`/products/${newProduct._id}`)
  } catch (error: any) {
    throw new Error(`Failed to create/update product: ${error.message}`)
  }
}

export async function getProductById(productId: string) {
  try {
    connectToDB()
    const product = await Product.findById({ _id: productId })
    if (!product) return
    return product
  } catch (error: any) {
    console.log(error)
  }
}

export async function getAllProducts() {
  try {
    connectToDB()
    const products = await Product.find()
    return products
  } catch (error: any) {
    console.log(error)
  }
}

export async function getSimilarProducts(productId: string) {
  try {
    connectToDB()
    const currentProduct = await Product.findById(productId)
    if (!currentProduct) return null
    const similarProducts = await Product.find({
      _id: { $ne: productId },
    }).limit(3)

    return similarProducts
  } catch (error: any) {
    console.log(error)
  }
}

export async function addUserEmailToProduct(
  productId: string,
  userEmail: string
) {
  try {
    connectToDB()
    const product = await Product.findById(productId)
    if (!product) {
      console.log(`product ${productId} not found`)
      return
    }

    const userExists = product.users.some(
      (user: User) => user.email === userEmail
    )
    if (!userExists) {
      // console.log(`debug user ${userEmail} is new user`)
      product.users.push({ email: userEmail })
      await product.save()

      const emailContent = generateEmailBody(product, "WELCOME")
      // console.log({ emailContent })
      await sendEmail(emailContent!, [userEmail])
    }
  } catch (error: any) {
    console.log(error)
  }
}
