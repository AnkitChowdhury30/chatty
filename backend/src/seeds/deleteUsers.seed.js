import { config } from "dotenv";
import connectDB from "../lib/db.js";
import User from "../models/user.model.js";

config();

const deleteAllUsers = async () => {
  try {
    await connectDB();
    
    const result = await User.deleteMany({});
    console.log(`${result.deletedCount} users deleted successfully`);
  } catch (error) {
    console.error("Error deleting users:", error);
  }
};

deleteAllUsers();