import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import patientRoutes from "./requests/patientform.js";

const app = express();
app.use(cors({
  origin: "http://localhost:5173", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// MongoDB connection
const uri = "mongodb+srv://admin:xaXicEawmHaKj1ZD@caresync.z1uzfce.mongodb.net/?retryWrites=true&w=majority&appName=CareSync";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Routes
app.get("/", (req, res) => res.send("Hello from Express + MongoDB!"));
app.use("/patients", patientRoutes); 


// Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

