import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    // "app.on" listener is used incase our app is not able talk with DB after successful connection of DB.
    app.on("error", (error) => {
      console.log("App is not able to talk with the DB: ", error);
      throw error;
    });

    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at PORT: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection Failed!!! ", err);
  });
