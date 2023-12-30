"use client"
import React, { FormEvent, useState } from "react"
import { scrapeAndStoreProduct } from "../lib/actions"
const isValidAmazonProductURL = (url: string) => {
  try {
    const parsedURL = new URL(url)
    const hostname = parsedURL.hostname

    console.log({ hostname })
    // check if hostname contains amazon.com or amazon.xx
    if (hostname.includes("amazon.com") || hostname.endsWith("amazon")) {
      return true
    }
  } catch (error) {
    return false
  }
  return false
}

const Searchbar = () => {
  const [searchPrompt, setSearchPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log(searchPrompt)
    const isValidLink = isValidAmazonProductURL(searchPrompt)
    if (!isValidLink) {
      alert("Please enter a valid Amazon product link")
      return
    }

    try {
      setIsLoading(true)
      // Scrape the product page
      // redirect to product page
      const product = await scrapeAndStoreProduct(searchPrompt)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <form className="flex flex-wrap gap-4 mt-12" onSubmit={handleSubmit}>
      <input
        type="text"
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
        placeholder="Enter product link"
        className="searchbar-input"
      />
      <button
        type="submit"
        className="searchbar-btn"
        disabled={searchPrompt === "" || isLoading}
      >
        {isLoading ? "Searching..." : "Search"}
      </button>
    </form>
  )
}

export default Searchbar
