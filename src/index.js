import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
    path : "./.env"
})
const PORT = process.env.PORT || 8001;
connectDB()
.then(()=> {
    app.listen(PORT, () => {
        console.log(`The server is running on ${PORT}`);
      });
})
.catch((err) => {
    console.log("Database connection failed:", err);
    process.exit(1); // Exit the process with failure
})

