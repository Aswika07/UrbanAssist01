import dotenv from "dotenv";
dotenv.config(); 
import express from "express";
import cors from "cors";
import { listComplaints } from "./listAllComplaints.js";
import { updateComplaintStatus } from "./updateComplaintStatus.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/complaints", listComplaints);
app.put("/api/complaints/status", updateComplaintStatus);

app.listen(5000, () => {
  console.log("🚀 Server running at http://localhost:5000");
});
