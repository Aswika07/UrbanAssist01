
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "./dynamodb.js";

const TABLE_NAME = "UrbanAssit_Complaints";

const STATUS_MAP = {
  open: "Open",
  inprogress: "InProgress",
  resolved: "Resolved",
  closed: "Closed",

 
  "inprogress": "InProgress",
  "Inprogress": "InProgress",   // <-- This fixes your current DB issue
  "INPROGRESS": "InProgress",
  "in_progress": "InProgress",
  "In_Progress": "InProgress",

  "open": "Open",
  "OPEN": "Open",

  "resolved": "Resolved",
  "RESOLVED": "Resolved",

  "closed": "Closed",
  "CLOSED": "Closed",
};

const normalizeStatus = (status) => {
  if (!status || typeof status !== "string") return "Open"; 
  const lower = status.toLowerCase().replace(/[_ ]/g, ""); 
  return STATUS_MAP[lower] || "Open"; 
};

export const listComplaints = async (req, res) => {
  try {
    const data = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
      })
    );

    const complaints = data.Items || [];
    const statusCounts = {
      Open: 0,
      InProgress: 0,
      Resolved: 0,
      Closed: 0,
    };

    const normalizedComplaints = complaints.map((item) => {
      const normalized = normalizeStatus(item.status);
      statusCounts[normalized]++;
      return {
        complaintId: item.complaintId,
        complaintCategory: item.complaintCategory || "N/A",
        phoneNumber: item.phoneNumber || "N/A",
        areaCode: item.areaCode || "N/A",
        status: normalized, 
        priority: item.priority || "MEDIUM",
        createdAt: item.createdAt,
      };
    });

    const total = normalizedComplaints.length;

    res.status(200).json({
      success: true,
      summary: {
        total,
        open: statusCounts.Open,
        inProgress: statusCounts.InProgress,
        resolved: statusCounts.Resolved,
        closed: statusCounts.Closed,
      },
      complaints: normalizedComplaints,
    });
  } catch (error) {
    console.error("Error listing complaints:", error);
    res.status(500).json({
      success: false,
      message: "Failed to list complaints",
      error: error.message,
    });
  }
};