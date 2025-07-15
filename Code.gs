// Sheet name where user registration data will be stored
const SHEET_NAME = "UserSignups";

// Header row for the sheet - MUST match the order of data sent from your HTML
const HEADER_ROW = [
  "First Name",
  "Last Name",
  "Gender",
  "Date of Birth",
  "Phone Number",
  "Username",
  "Email",
  "Password (INSECURE - DO NOT USE IN PRODUCTION!)",
  "Confirm Password (INSECURE - DO NOT USE IN PRODUCTION!)"
];

/**
 * Required for proper CORS handling
 * This must be added to handle preflight OPTIONS requests
 */
function doOptions(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  return ContentService.createTextOutput()
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
}

/**
 * Helper function to create a JSON response with CORS headers
 */
function createJsonResponse(success, message, additionalData = {}) {
  const responseData = { success, message, ...additionalData };
  const output = ContentService.createTextOutput(JSON.stringify(responseData))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
  return output;
}

/**
 * Main function to handle POST requests to the web app.
 */
function doPost(e) {
  // Log the incoming request for debugging
  Logger.log("Received POST request");
  Logger.log("Request data: " + JSON.stringify(e));

  if (!e || !e.postData || !e.postData.contents) {
    Logger.log("Error: Invalid or empty request");
    return createJsonResponse(false, "Invalid request");
  }

  try {
    const data = JSON.parse(e.postData.contents);
    Logger.log("Parsed data: " + JSON.stringify(data));

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      Logger.log("Error: Sheet not found");
      return createJsonResponse(false, "Server configuration error: Sheet not found");
    }

    if (data.action === "signup") {
      return handleSignup(data, sheet);
    } else if (data.action === "login") {
      return handleLogin(data, sheet);
    } else {
      Logger.log("Invalid action: " + data.action);
      return createJsonResponse(false, "Invalid action");
    }
  } catch (error) {
    Logger.log("Error in doPost: " + error.message);
    return createJsonResponse(false, "Server error: " + error.message);
  }
}

// Your existing handleSignup, handleLogin, and setup functions here...
[REST OF YOUR EXISTING CODE] 