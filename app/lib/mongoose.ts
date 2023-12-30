// MongoDB object modeling tool designed to work in an asynchronous environment.
import mongoose from "mongoose"

let isConnected = false // variable to check if connection is established

export const connectToDB = async () => {
  mongoose.set("strictQuery", true) // prevent mongoose from querying with undefined fields
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from environment variables")
  }

  if (isConnected) return console.log(" => using existing database connection")

  try {
    await mongoose.connect(process.env.MONGODB_URI)
    isConnected = true
    console.log(" => using new database connection")
  } catch (error) {
    console.log(" => error connecting to database: ", error)
  }
}
