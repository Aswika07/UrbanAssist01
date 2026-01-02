
import axios from "axios";
const API_BASE = " http://localhost:5000/api";
export const fetchComplaints = async () => {
  try {
    const response = await axios.get(`${API_BASE}/complaints`);
    console.log("API Response:", response.data);
    
    // Handle both response formats: direct array or object with complaints array
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.complaints) {
      return response.data.complaints;
    } else {
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching complaints:", error);
    throw error;
  }
};

// Update complaint status - CORRECTED ENDPOINT
export const updateComplaintStatus = async (complaintId, status) => {
  try {
    console.log("Sending update request:", { complaintId, status });
    
    // Using the correct endpoint: /api/complaints/status
    const response = await axios.put(`${API_BASE}/complaints/status`, {
      complaintId,
      status
    });
    
    console.log("Update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating complaint:", error.response?.data || error);
    throw error;
  }
};

// Optional: Get complaint by ID
export const getComplaintById = async (complaintId) => {
  try {
    const response = await axios.get(`${API_BASE}/complaints/${complaintId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching complaint:", error);
    throw error;
  }
};

// Optional: Get statistics
export const getComplaintStats = async () => {
  try {
    const response = await axios.get(`${API_BASE}/complaints/stats`);
    return response.data;
  } catch (error) {
    console.error("Error fetching stats:", error);
    // Return default stats if endpoint doesn't exist
    return {
      total: 0,
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0
    };
  }
};