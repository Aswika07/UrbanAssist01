// // import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
// // import { docClient } from "./dynamodb.js";

// // const TABLE_NAME = "UrbanAssit_Complaints";
// // const ALLOWED_STATUSES = ["Open", "Inprogress", "Resolved", "Closed"];

// // export const updateComplaintStatus = async (req, res) => {
// //   try {
// //     const { complaintId, status } = req.body;

// //     if (!complaintId || !status) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "complaintId and status are required",
// //       });
// //     }

// //     if (!ALLOWED_STATUSES.includes(status)) {
// //       return res.status(400).json({
// //         success: false,
// //         message: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(", ")}`,
// //       });
// //     }

// //     const updatedAt = new Date().toISOString();

// //     const command = new UpdateCommand({
// //       TableName: TABLE_NAME,
// //       Key: { complaintId },

// //       UpdateExpression:
// //         "SET #status = :newStatus, #updatedAt = :updatedAt",

// //       ExpressionAttributeNames: {
// //         "#status": "status",
// //         "#updatedAt": "updatedAt",
// //       },

// //       ExpressionAttributeValues: {
// //         ":newStatus": status,
// //         ":updatedAt": updatedAt,
// //       },

// //       // Prevent same status update
// //       ConditionExpression:
// //         "attribute_exists(complaintId) AND #status <> :newStatus",

// //       ReturnValues: "ALL_NEW",
// //     });

// //     const result = await docClient.send(command);

// //     console.log("UPDATED ITEM:", result.Attributes); 

// //     return res.status(200).json({
// //       success: true,
// //       message: "Complaint status updated",
// //       complaint: result.Attributes,
// //     });

// //   } catch (error) {
// //     console.error("DynamoDB Update Error:", error);

// //     if (error.name === "ConditionalCheckFailedException") {
// //       return res.status(409).json({
// //         success: false,
// //         message:
// //           "Status already exists or complaint not found",
// //       });
// //     }

// //     return res.status(500).json({
// //       success: false,
// //       message: "Failed to update complaint status",
// //     });
// //   }
// // };

// import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
// import { docClient } from "./dynamodb.js";

// const TABLE_NAME = "UrbanAssit_Complaints";
// const ALLOWED_STATUSES = ["Open", "Inprogress", "Resolved", "Closed"];

// /**
//  * Update complaint status with timestamp tracking
//  * @param {Object} req - Express request object
//  * @param {Object} res - Express response object
//  */
// export const updateComplaintStatus = async (req, res) => {
//   try {
//     const { complaintId, status } = req.body;

//     // Validation: Check required fields
//     if (!complaintId || !status) {
//       return res.status(400).json({
//         success: false,
//         message: "complaintId and status are required",
//         error: {
//           complaintId: !complaintId ? "missing" : "provided",
//           status: !status ? "missing" : "provided"
//         }
//       });
//     }

//     // Validation: Check status is allowed
//     if (!ALLOWED_STATUSES.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(", ")}`,
//         receivedStatus: status,
//         allowedStatuses: ALLOWED_STATUSES
//       });
//     }

//     // Generate timestamp
//     const updatedAt = new Date().toISOString();

//     console.log(`Updating complaint ${complaintId} to status: ${status}`);

//     // Build update command
//     const command = new UpdateCommand({
//       TableName: TABLE_NAME,
//       Key: { complaintId },

//       // Update both status and updatedAt
//       UpdateExpression: "SET #status = :newStatus, #updatedAt = :updatedAt",

//       ExpressionAttributeNames: {
//         "#status": "status",
//         "#updatedAt": "updatedAt",
//       },

//       ExpressionAttributeValues: {
//         ":newStatus": status,
//         ":updatedAt": updatedAt,
//       },

//       // Ensure complaint exists and prevent duplicate status updates
//       ConditionExpression: "attribute_exists(complaintId) AND #status <> :newStatus",

//       // Return the updated item
//       ReturnValues: "ALL_NEW",
//     });

//     // Execute update
//     const result = await docClient.send(command);

//     console.log("✅ Successfully updated complaint:", {
//       complaintId,
//       oldStatus: "unknown", // DynamoDB doesn't return old values with ALL_NEW
//       newStatus: status,
//       updatedAt
//     });

//     // Return success response
//     return res.status(200).json({
//       success: true,
//       message: "Complaint status updated successfully",
//       complaint: result.Attributes,
//       metadata: {
//         updatedFields: ["status", "updatedAt"],
//         timestamp: updatedAt
//       }
//     });

//   } catch (error) {
//     console.error("❌ DynamoDB Update Error:", error);

//     // Handle specific DynamoDB errors
//     if (error.name === "ConditionalCheckFailedException") {
//       return res.status(409).json({
//         success: false,
//         message: "Cannot update: Either complaint not found or status is already set to the requested value",
//         error: "ConditionalCheckFailed",
//         hint: "Check if the complaint exists and if the status is different from the current one"
//       });
//     }

//     if (error.name === "ValidationException") {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid request format",
//         error: error.message
//       });
//     }

//     if (error.name === "ResourceNotFoundException") {
//       return res.status(404).json({
//         success: false,
//         message: `Table ${TABLE_NAME} not found`,
//         error: error.message
//       });
//     }

//     // Generic error response
//     return res.status(500).json({
//       success: false,
//       message: "Failed to update complaint status",
//       error: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
//     });
//   }
// };

// /**
//  * Optional: Get complaint with history
//  * This is useful if you want to track status change history
//  */
// export const updateComplaintStatusWithHistory = async (req, res) => {
//   try {
//     const { complaintId, status } = req.body;

//     // Validation
//     if (!complaintId || !status) {
//       return res.status(400).json({
//         success: false,
//         message: "complaintId and status are required"
//       });
//     }

//     if (!ALLOWED_STATUSES.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(", ")}`
//       });
//     }

//     const updatedAt = new Date().toISOString();

//     // Create history entry
//     const historyEntry = {
//       status,
//       timestamp: updatedAt,
//       updatedBy: req.user?.id || "system" // If you have auth
//     };

//     const command = new UpdateCommand({
//       TableName: TABLE_NAME,
//       Key: { complaintId },

//       // Update status, updatedAt, and append to history
//       UpdateExpression: 
//         "SET #status = :newStatus, #updatedAt = :updatedAt " +
//         "ADD #statusHistory :historyEntry",

//       ExpressionAttributeNames: {
//         "#status": "status",
//         "#updatedAt": "updatedAt",
//         "#statusHistory": "statusHistory"
//       },

//       ExpressionAttributeValues: {
//         ":newStatus": status,
//         ":updatedAt": updatedAt,
//         ":historyEntry": docClient.createSet([JSON.stringify(historyEntry)])
//       },

//       ConditionExpression: "attribute_exists(complaintId)",

//       ReturnValues: "ALL_NEW",
//     });

//     const result = await docClient.send(command);

//     return res.status(200).json({
//       success: true,
//       message: "Complaint status updated with history",
//       complaint: result.Attributes
//     });

//   } catch (error) {
//     console.error("DynamoDB Update Error:", error);

//     if (error.name === "ConditionalCheckFailedException") {
//       return res.status(404).json({
//         success: false,
//         message: "Complaint not found"
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Failed to update complaint status"
//     });
//   }
// };

import { UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "./dynamodb.js";

const TABLE_NAME = "UrbanAssit_Complaints";
const ALLOWED_STATUSES = ["Open", "Inprogress", "Resolved", "Closed"];

/**
 * Update complaint status with guaranteed updatedAt storage
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId, status } = req.body;

    // Validation
    if (!complaintId || !status) {
      return res.status(400).json({
        success: false,
        message: "complaintId and status are required",
      });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(", ")}`,
      });
    }

    // Generate timestamp
    const updatedAt = new Date().toISOString();

    console.log("🔄 Updating complaint:", {
      complaintId,
      newStatus: status,
      timestamp: updatedAt
    });

    // Update command - this WILL store in DynamoDB
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { complaintId },

      // Update both status and updatedAt
      UpdateExpression: "SET #status = :newStatus, #updatedAt = :updatedAt",

      ExpressionAttributeNames: {
        "#status": "status",
        "#updatedAt": "updatedAt",
      },

      ExpressionAttributeValues: {
        ":newStatus": status,
        ":updatedAt": updatedAt,
      },

      // Only check if complaint exists (removed same-status check to allow updates)
      ConditionExpression: "attribute_exists(complaintId)",

      // Return updated item to verify
      ReturnValues: "ALL_NEW",
    });

    // Execute update
    const result = await docClient.send(command);

    console.log("✅ DynamoDB Response:", {
      complaintId: result.Attributes.complaintId,
      status: result.Attributes.status,
      updatedAt: result.Attributes.updatedAt,
      allAttributes: result.Attributes
    });

    // Verify updatedAt was stored
    if (!result.Attributes.updatedAt) {
      console.error("⚠️ WARNING: updatedAt not in response!");
    }

    return res.status(200).json({
      success: true,
      message: "Complaint status updated successfully",
      complaint: result.Attributes,
      debug: {
        updatedAtStored: !!result.Attributes.updatedAt,
        timestamp: updatedAt
      }
    });

  } catch (error) {
    console.error("❌ DynamoDB Update Error:", error);

    if (error.name === "ConditionalCheckFailedException") {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update complaint status",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
    });
  }
};

/**
 * Test function to verify updatedAt is being stored
 * Call this endpoint to test: GET /api/test-update/:complaintId
 */
export const testUpdateStorage = async (req, res) => {
  try {
    const { complaintId } = req.params;

    // Get current item
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: { complaintId }
    });

    const beforeUpdate = await docClient.send(getCommand);
    console.log("📋 Before Update:", beforeUpdate.Item);

    // Update with test values
    const testStatus = "Inprogress";
    const updatedAt = new Date().toISOString();

    const updateCommand = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { complaintId },
      UpdateExpression: "SET #status = :status, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#status": "status",
        "#updatedAt": "updatedAt"
      },
      ExpressionAttributeValues: {
        ":status": testStatus,
        ":updatedAt": updatedAt
      },
      ReturnValues: "ALL_NEW"
    });

    const updateResult = await docClient.send(updateCommand);
    console.log("🔄 After Update:", updateResult.Attributes);

    // Get item again to verify persistence
    const afterUpdate = await docClient.send(getCommand);
    console.log("✅ Verification Read:", afterUpdate.Item);

    return res.status(200).json({
      success: true,
      test: "updatedAt storage test",
      results: {
        before: beforeUpdate.Item,
        updateResponse: updateResult.Attributes,
        afterVerification: afterUpdate.Item,
        updatedAtStored: !!afterUpdate.Item.updatedAt,
        updatedAtValue: afterUpdate.Item.updatedAt
      }
    });

  } catch (error) {
    console.error("Test Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Alternative: Force update without conditions
 * Use this if you want to ensure update always works
 */
export const forceUpdateComplaintStatus = async (req, res) => {
  try {
    const { complaintId, status } = req.body;

    if (!complaintId || !status) {
      return res.status(400).json({
        success: false,
        message: "complaintId and status are required",
      });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(", ")}`,
      });
    }

    const updatedAt = new Date().toISOString();

    console.log("🔄 Force updating:", { complaintId, status, updatedAt });

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { complaintId },
      UpdateExpression: "SET #status = :status, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#status": "status",
        "#updatedAt": "updatedAt"
      },
      ExpressionAttributeValues: {
        ":status": status,
        ":updatedAt": updatedAt
      },
      ReturnValues: "ALL_NEW"
    });

    const result = await docClient.send(command);

    console.log("✅ Force update complete:", result.Attributes);

    return res.status(200).json({
      success: true,
      message: "Complaint updated (forced)",
      complaint: result.Attributes
    });

  } catch (error) {
    console.error("❌ Force update error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update complaint",
      error: error.message
    });
  }
};

/**
 * Check if updatedAt field exists in table schema
 */
export const checkUpdatedAtField = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { complaintId }
    });

    const result = await docClient.send(command);

    if (!result.Item) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    return res.status(200).json({
      success: true,
      complaint: result.Item,
      hasUpdatedAt: "updatedAt" in result.Item,
      updatedAtValue: result.Item.updatedAt || null,
      allFields: Object.keys(result.Item)
    });

  } catch (error) {
    console.error("Check Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};