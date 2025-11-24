require('dotenv').config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.set('trust proxy', true); // Enable trust for req.ip
app.use(express.json());

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads/resolutions", express.static(path.join(__dirname, "uploads/resolutions")));

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Create a specific folder for resolution images
const resolutionsDir = path.join(__dirname, "uploads/resolutions");
if (!fs.existsSync(resolutionsDir)) {
  fs.mkdirSync(resolutionsDir, { recursive: true });
  console.log("✅ Created 'uploads/resolutions' directory.");
}

// Multer config for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db",
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL");
  }
});

// --- Firewall Middleware ---

let blockedIpSet = new Set();

async function refreshBlockedIps() {
  try {
    const [results] = await db.promise().query("SELECT ip_address FROM firewall_blocked_ips");
    blockedIpSet = new Set(results.map(row => row.ip_address));
    console.log(`✅ Firewall blocklist refreshed. ${blockedIpSet.size} IPs are blocked.`);
  } catch (err) {
    console.error("❌ Failed to refresh firewall blocklist:", err);
  }
}

// Middleware to check for blocked IPs on every request
const firewallMiddleware = (req, res, next) => {
  const clientIp = req.ip;

  if (blockedIpSet.has(clientIp)) {
    // Log the blocked attempt
    logAccessAttempt(clientIp, 'unknown', `${req.method} ${req.originalUrl}`, 'Blocked', null);
    
    // Send a 403 Forbidden response
    return res.status(403).json({
      error: "You have been blocked by an administrator. Please contact support if you believe this is a mistake."
    });
  }

  next(); // IP is not blocked, proceed to the next middleware/route
};

// Initial load of blocked IPs and set up periodic refresh
refreshBlockedIps();
setInterval(refreshBlockedIps, 5 * 60 * 1000); // Refresh every 5 minutes

// Apply the firewall middleware to all routes
app.use(firewallMiddleware);


// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Helper function to get GMT+8 time
function getGMT8Time() {
  const now = new Date();
  // Convert to GMT+8 (8 hours ahead of UTC)
  const gmt8Time = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  return gmt8Time.toISOString().slice(0, 19).replace('T', ' ');
}

// Helper function to generate a unique 4-digit incident ID
function generateUniqueIncidentId(callback) {
  const newId = Math.floor(1000 + Math.random() * 9000);
  const sql = "SELECT id FROM incident_report WHERE id = ?";
  db.query(sql, [newId], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    if (results.length > 0) {
      // ID exists, try again
      return generateUniqueIncidentId(callback);
    }
    // ID is unique
    callback(null, newId);
  });
}

// Helper function to log access attempts
function logAccessAttempt(ip, user, action, status, deviceId = null) {
  const sql = `
    INSERT INTO firewall_access_logs (ip_address, user, action, status, timestamp, device_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [ip, user, action, status, getGMT8Time(), deviceId], (err) => {
    if (err) {
      console.error("❌ SQL error logging access attempt:", err);
    }
  });
}

// Updated Login route with client-based role restrictions
app.post("/login", (req, res) => {
  console.log("Login attempt received.");
  const { username, password, clientType, deviceId } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  if (!username || !password) {
    console.log("Missing username or password.");
    return res.status(400).json({ error: "Username and password are required" });
  }

  // Validate clientType parameter
  if (!clientType || !['web', 'mobile'].includes(clientType)) {
    console.log("Invalid clientType.");
    return res.status(400).json({ 
      error: "Client type is required and must be 'web' or 'mobile'" 
    });
  }

  console.log(`Attempting login for user: ${username}, clientType: ${clientType}`);
  const sql = "SELECT * FROM users WHERE USER = ? AND PASSWORD = ?";
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error("❌ SQL error during login:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      console.log("Invalid username or password.");
      logAccessAttempt(ipAddress, username, 'POST /login', 'Failed', deviceId);
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = results[0];
    console.log(`User found: ${user.USER}, Role: '${user.ROLE}', Status: '${user.STATUS}'`); // Added quotes for clarity
    console.log(`User role from DB (original): '${user.ROLE}'`); // New log
    console.log(`User role from DB (lowercase): '${user.ROLE.toLowerCase()}'`); // New log // Added quotes for clarity
    console.log(`User role from DB (original): '${user.ROLE}'`); // New log
    console.log(`User role from DB (lowercase): '${user.ROLE.toLowerCase()}'`); // New log

    // Check if user status allows login
    if (user.STATUS !== "Verified") {
      if (user.STATUS === "Pending") {
        console.log("Account pending verification.");
        logAccessAttempt(ipAddress, username, 'POST /login', 'Failed');
        return res.status(403).json({ 
          error: "Account status is Pending. Please verify your account." 
        });
      } else {
        console.log(`Account status "${user.STATUS}" does not allow login.`);
        logAccessAttempt(ipAddress, username, 'POST /login', 'Failed');
        return res.status(403).json({
          error: `Account status "${user.STATUS}" does not allow login.` 
        });
      }
    }

    // Apply role restrictions based on client type
    let allowedRoles = [];
    let clientName = "";

    if (clientType === 'web') {
      // ReactJS - Allow all roles for web application
      allowedRoles = ['admin', 'tanod', 'resident']; // Changed to lowercase
      clientName = "web application";
    } else if (clientType === 'mobile') {
      // React Native - Only Tanod and Resident allowed
      allowedRoles = ['tanod', 'resident']; // Changed to lowercase
      clientName = "mobile application";
    }
    console.log(`Client Type: '${clientType}'`); // New log
    console.log(`Allowed Roles for this client type: ${JSON.stringify(allowedRoles)}`); // New log

    // Check if user.ROLE is defined and not empty
    if (!user.ROLE || user.ROLE.trim() === '') {
      console.log(`Access denied: User role is undefined or empty for user ${user.USER}.`);
      logAccessAttempt(ipAddress, username, 'POST /login', 'Blocked', deviceId);
      return res.status(403).json({
        error: "Access denied. Your account has no assigned role. Please contact an administrator."
      });
    }

    // Check if user role is allowed for this client (case-insensitive)
    if (!allowedRoles.includes(user.ROLE.toLowerCase())) {
      console.log(`Access denied for role ${user.ROLE} on ${clientName}.`); // Added quotes for clarity
      logAccessAttempt(ipAddress, username, 'POST /login', 'Blocked', deviceId);
      return res.status(403).json({
        error: `Access denied. Only ${allowedRoles.join(' and ')} users are allowed to access the ${clientName}.`
      });
    }

    console.log("Login successful.");
    logAccessAttempt(ipAddress, username, 'POST /login', 'Success', deviceId);
    // Return success with user data (excluding password for security)
    return res.json({ 
      success: true, 
      message: "Login successful",
      user: {
        id: user.ID,
        username: user.USER,
        name: user.NAME,
        email: user.EMAIL,
        address: user.ADDRESS,
        role: user.ROLE,
        status: user.STATUS,
        image: user.IMAGE
      }
    });
  });
});

// SOS Report endpoint
app.post("/sos-report", (req, res) => {
  const { userId, username, latitude, longitude, location } = req.body;

  if (!userId || !username || !latitude || !longitude || !location) {
    return res.status(400).json({ success: false, message: "Missing required SOS data" });
  }

  const currentTime = getGMT8Time();
  const incidentType = "SOS";
  const status = "New"; // Or "Emergency"

  generateUniqueIncidentId((err, incidentId) => {
    if (err) {
      console.error("❌ Error generating unique incident ID:", err);
      return res.status(500).json({ error: "Failed to generate unique incident ID" });
    }

    const sql = `
      INSERT INTO incident_report (id, incident_type, latitude, longitude, datetime, reported_by, status, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [incidentId, incidentType, latitude, longitude, currentTime, username, status, location], (err, result) => {
      if (err) {
        console.error("❌ SQL error inserting SOS report:", err);
        return res.status(500).json({ success: false, message: "Database error while saving SOS report" });
      }
      res.json({ success: true, message: "SOS report received and saved", id: incidentId });
    });
  });
});

// API endpoint to fetch all users
app.get("/api/users", (req, res) => {
  const sql = "SELECT ID, USER, NAME, EMAIL, ADDRESS, ROLE, STATUS, IMAGE FROM users";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ SQL error:", err);
      return res.status(500).json({ error: "Failed to fetch users" });
    }
    res.json(results);
  });
});

// API endpoint to fetch all registered and verified Tanods
app.get("/api/tanods", (req, res) => {
  const sql = "SELECT ID, USER, NAME, EMAIL, ADDRESS, ROLE, STATUS, IMAGE FROM users WHERE ROLE = 'Tanod' AND STATUS = 'Verified'";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching tanods:", err);
      return res.status(500).json({ error: "Failed to fetch tanods" });
    }
    res.json(results);
  });
});

// Update user by ID with image upload support (for accounts management)
app.put("/api/users/:id", upload.single("image"), (req, res) => {
  const userId = req.params.id;
  const { username, role, name, email, address, status, password } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  console.log('Updating user by ID:', {
    userId,
    data: { username, role, name, email, address, status, password: password ? '[PROVIDED]' : '[NOT PROVIDED]' },
    hasImage: !!image
  });

  // Get current user data first
  const getUserSql = "SELECT USER, NAME, EMAIL, ADDRESS, ROLE, STATUS, IMAGE FROM users WHERE ID = ?";
  
  db.query(getUserSql, [userId], (err, userResults) => {
    if (err) {
      console.error("❌ SQL error fetching user:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (userResults.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const currentUser = userResults[0];
    
    // Build dynamic SQL query - only update provided fields
    let sql = "UPDATE users SET ";
    let params = [];
    let updateFields = [];

    // Add fields to update only if they are provided
    if (username && username.trim()) {
      updateFields.push("USER = ?");
      params.push(username.trim());
    }

    if (name && name.trim()) {
      updateFields.push("NAME = ?");
      params.push(name.trim());
    }

    if (email && email.trim()) {
      updateFields.push("EMAIL = ?");
      params.push(email.trim());
    }

    if (address !== undefined) { // Allow empty string to clear address
      updateFields.push("ADDRESS = ?");
      params.push(address.trim());
    }

    if (role && role.trim()) {
      updateFields.push("ROLE = ?");
      params.push(role.trim());
    }
    
    if (status && status.trim()) {
      updateFields.push("STATUS = ?");
      params.push(status.trim());
    }
    
    if (password && password.trim()) {
      updateFields.push("PASSWORD = ?");
      params.push(password.trim());
    }
    
    if (image) {
      updateFields.push("IMAGE = ?");
      params.push(image);
      
      // Delete old image if it exists
      if (currentUser.IMAGE && currentUser.IMAGE.trim() !== '') {
        const oldImagePath = path.join(__dirname, "uploads", currentUser.IMAGE);
        fs.unlink(oldImagePath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error("Error deleting old profile image:", err);
          } else {
            console.log("Old profile image deleted:", currentUser.IMAGE);
          }
        });
      }
    }

    // Check if there are fields to update
    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    // Complete the SQL query
    sql += updateFields.join(", ");
    sql += " WHERE ID = ?";
    params.push(userId);

    console.log('SQL Query:', sql);
    console.log('Parameters (excluding password):', params.map((p, i) => 
      updateFields[i] && updateFields[i].includes('PASSWORD') ? '[HIDDEN]' : p
    ));

    // Execute the update
    db.query(sql, params, (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ success: false, message: "Username already exists" });
        }
        console.error("❌ SQL update error:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "User not found or no changes made" });
      }

      console.log(`✅ User updated successfully. ID: ${userId}`);
      
      // Return success response with updated image filename if applicable
      const response = { 
        success: true, 
        message: "User updated successfully"
      };
      
      if (image) {
        response.image = image;
      }
      
      res.json(response);
    });
  });
});

// Get user by username
app.get("/api/user/:username", (req, res) => {
  const username = req.params.username;
  
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }
  
  const sql = "SELECT ID, USER, NAME, EMAIL, ADDRESS, ROLE, STATUS, IMAGE FROM users WHERE USER = ?";
  
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error("❌ SQL error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(results[0]);
  });
});

// Update user profile by username (for navbar profile modal)
app.put("/api/user/:username", upload.single("image"), (req, res) => {
  const username = req.params.username;
  const { name, username: newUsername, password, address, email } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!username) {
    return res.status(400).json({ success: false, message: "Username is required" });
  }

  console.log('Updating user profile:', {
    originalUsername: username,
    newData: { name, newUsername, password: password ? '[PROVIDED]' : '[NOT PROVIDED]', address, email },
    hasImage: !!image
  });

  // First, get the current user data to check what exists
  const getUserSql = "SELECT ID, USER, NAME, EMAIL, ADDRESS, IMAGE FROM users WHERE USER = ?";
  
  db.query(getUserSql, [username], (err, userResults) => {
    if (err) {
      console.error("❌ SQL error fetching user:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (userResults.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const currentUser = userResults[0];
    
    // Build dynamic SQL query - only update provided fields
    let sql = "UPDATE users SET ";
    let params = [];
    let updateFields = [];

    // Add fields to update only if they are provided
    if (name && name.trim()) {
      updateFields.push("NAME = ?");
      params.push(name.trim());
    }

    if (newUsername && newUsername.trim()) {
      updateFields.push("USER = ?");
      params.push(newUsername.trim());
    }

    if (password && password.trim()) {
      updateFields.push("PASSWORD = ?");
      params.push(password.trim());
    }

    if (address !== undefined) { // Allow empty string to clear address
      updateFields.push("ADDRESS = ?");
      params.push(address.trim());
    }

    if (email && email.trim()) {
      updateFields.push("EMAIL = ?");
      params.push(email.trim());
    }

    if (image) {
      updateFields.push("IMAGE = ?");
      params.push(image);
      
      // Delete old image if it exists
      if (currentUser.IMAGE && currentUser.IMAGE.trim() !== '') {
        const oldImagePath = path.join(__dirname, "uploads", currentUser.IMAGE);
        fs.unlink(oldImagePath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error("Error deleting old profile image:", err);
          } else {
            console.log("Old profile image deleted:", currentUser.IMAGE);
          }
        });
      }
    }

    // Check if there are fields to update
    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    // Complete the SQL query
    sql += updateFields.join(", ");
    sql += " WHERE USER = ?";
    params.push(username);

    console.log('SQL Query:', sql);
    console.log('Parameters:', params);

    // Execute the update
    db.query(sql, params, (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ success: false, message: "Username already exists" });
        }
        console.error("❌ SQL update error:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "User not found or no changes made" });
      }

      console.log(`✅ User profile updated successfully for: ${username}`);
      
      // Return success response with updated image filename if applicable
      const response = { 
        success: true, 
        message: "User profile updated successfully"
      };
      
      if (image) {
        response.image = image;
      }
      
      // If username was changed, include the new username
      if (newUsername && newUsername.trim()) {
        response.newUsername = newUsername.trim();
      }
      
      res.json(response);
    });
  });
});

// Delete user by ID
app.delete("/api/users/:id", (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  const sql = "DELETE FROM users WHERE ID = ?";
  
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("❌ SQL delete error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User deleted successfully" });
  });
});

// Fetch incidents
app.get("/api/incidents", (req, res) => {
  const sql = `
    SELECT id, incident_type, location, status, datetime, image, reported_by, latitude, longitude
      FROM incident_report
      ORDER BY datetime DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ SQL error:", err);
      return res.status(500).json({ error: "Failed to fetch incidents" });
    }
    res.json(results);
  });
});

// Insert incident with image file upload
app.post("/api/incidents", upload.single("image"), (req, res) => {
  const { incidentType, latitude, longitude, datetime, address, reported_by } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!incidentType || !latitude || !longitude || !datetime || !address || !reported_by) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const latNum = parseFloat(latitude);
  const lonNum = parseFloat(longitude);
  if (isNaN(latNum) || isNaN(lonNum)) {
    return res.status(400).json({ error: "Invalid coordinates" });
  }
  const status = "Under Review";

  generateUniqueIncidentId((err, incidentId) => {
    if (err) {
      console.error("❌ Error generating unique incident ID:", err);
      return res.status(500).json({ error: "Failed to generate unique incident ID" });
    }

    console.log("Received incident report:", {
      id: incidentId,
      incidentType,
      latitude: latNum,
      longitude: lonNum,
      datetime,
      address,
      reported_by,
      image,
    });

    const sql = `
      INSERT INTO incident_report (id, incident_type, latitude, longitude, datetime, image, location, status, reported_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [incidentId, incidentType, latNum, lonNum, datetime, image, address, status, reported_by],
      (err, result) => {
        if (err) {
          console.error("❌ SQL insert error:", err);
          return res.status(500).json({ error: "Failed to insert incident" });
        }

        res.json({ success: true, message: "Incident reported", id: incidentId });

        // After successfully inserting the incident, notify all Tanod accounts
        const getTanodsSql = "SELECT USER FROM users WHERE ROLE = 'Tanod' AND STATUS = 'Verified'";
        db.query(getTanodsSql, (tanodErr, tanodResults) => {
          if (tanodErr) {
            console.error("❌ SQL error fetching Tanods for notification:", tanodErr);
            // Continue without sending notifications if there's an error fetching Tanods
            return;
          }

          if (tanodResults.length > 0) {
            const notificationTime = getGMT8Time();
            const notificationAction = `New Incident Reported by ${reported_by} at ${address} - Type: ${incidentType}`;
            const notificationLocation = address;

            tanodResults.forEach(tanod => {
              const insertLogSql = `
                INSERT INTO logs_patrol (USER, TIME, ACTION, LOCATION, incident_id)
                VALUES (?, ?, ?, ?, ?)
              `;
              db.query(insertLogSql, [tanod.USER, notificationTime, notificationAction, notificationLocation, incidentId], (logErr) => {
                if (logErr) {
                  console.error(`❌ SQL error inserting notification for Tanod ${tanod.USER}:`, logErr);
                } else {
                  console.log(`✅ Notification sent to Tanod ${tanod.USER} for incident ${incidentId}`);
                }
              });
            });
          } else {
            console.log("No verified Tanod accounts found to notify.");
          }
        });

        // After successfully inserting the incident, notify all Resident accounts
        const getResidentsSql = "SELECT USER FROM users WHERE ROLE = 'Resident' AND STATUS = 'Verified'";
        db.query(getResidentsSql, (residentErr, residentResults) => {
          if (residentErr) {
            console.error("❌ SQL error fetching Residents for notification:", residentErr);
            return;
          }

          if (residentResults.length > 0) {
            const notificationTime = getGMT8Time();
            const notificationAction = `Incident reported at ${address} (${incidentType}). Please avoid the area.`;
            const notificationLocation = address;

            residentResults.forEach(resident => {
              const insertLogSql = `
                INSERT INTO logs_resident (USER, TIME, ACTION, LOCATION)
                VALUES (?, ?, ?, ?)
              `;
              db.query(insertLogSql, [resident.USER, notificationTime, notificationAction, notificationLocation], (logErr) => {
                if (logErr) {
                  console.error(`❌ SQL error inserting notification for Resident ${resident.USER}:`, logErr);
                } else {
                  console.log(`✅ Notification sent to Resident ${resident.USER} for incident ${incidentId}`);
                }
              });
            });
          } else {
            console.log("No verified Resident accounts found to notify.");
          }
        });
      }
    );
  });
});

// Update incident status by ID
app.put("/api/incidents/:id/status", (req, res) => {
  const incidentId = req.params.id;
  const { status, assigned_tanod } = req.body;

  if (!incidentId || !status) {
    return res.status(400).json({ success: false, message: "Incident ID and status are required" });
  }

  // Validate status value
  const validStatuses = ["Under Review", "In Progress", "Resolved"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid status. Must be one of: Under Review, In Progress, Resolved" 
    });
  }

  // Build SQL query dynamically
  let sql = "UPDATE incident_report SET status = ?";
  let params = [status, incidentId];

  // Add assigned to query if provided
  if (assigned_tanod) {
    sql = "UPDATE incident_report SET status = ?, assigned = ? WHERE id = ?";
    params = [status, assigned_tanod, incidentId];
  } else {
    sql += " WHERE id = ?";
  }
  
  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("❌ SQL update error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Incident not found" });
    }

    res.json({ 
      success: true, 
      message: "Incident status updated successfully",
      status: status,
      assigned_tanod: assigned_tanod || null
    });
  });
});

// API endpoint to fetch incidents assigned to a specific user
app.get("/api/incidents/assigned/:username", (req, res) => {
  const username = req.params.username;
  
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }
  
  // Fetch non-resolved incidents AND resolved incidents from the last 7 days
  const sql = `
    SELECT id, incident_type as type, location, status, datetime as created_at, 
           image, reported_by, latitude, longitude, assigned, resolved_by, resolved_at
    FROM incident_report 
    WHERE assigned = ? 
    AND (
      status != 'Resolved' 
      OR (status = 'Resolved' AND resolved_at >= DATE_SUB(NOW(), INTERVAL 7 DAY))
    )
    ORDER BY datetime DESC
  `;
  
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching assigned incidents:", err);
      return res.status(500).json({ error: "Failed to fetch assigned incidents" });
    }
    
    console.log(`Fetched ${results.length} assigned incidents for ${username} (including resolved within 7 days)`);
    res.json(results);
  });
});

// API endpoint to mark incident as resolved (FIXED VERSION)
app.put("/api/incidents/:id/resolve", (req, res) => {
  const incidentId = req.params.id;
  const { resolved_by } = req.body; // Optional: track who resolved it
  
  if (!incidentId) {
    return res.status(400).json({
      success: false,
      message: "Incident ID is required"
    });
  }
  
  // Update with current GMT+8 timestamp for resolved_at
  const resolvedAt = getGMT8Time();
  const sql = `UPDATE incident_report SET status = 'Resolved', resolved_at = ?, resolved_by = ? WHERE id = ?`;
  
  db.query(sql, [resolvedAt, resolved_by || null, incidentId], (err, result) => {
    if (err) {
      console.error("❌ SQL update error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false, 
        message: "Incident not found"
      });
    }
    
    // Log the resolution action
    if (resolved_by) {
      const logSql = `
        INSERT INTO logs_patrol (USER, TIME, ACTION, LOCATION) 
        VALUES (?, ?, ?, ?)
      `;
      
      // Get incident details for logging
      const getIncidentSql = "SELECT incident_type, location FROM incident_report WHERE id = ?";
      db.query(getIncidentSql, [incidentId], (err, incidentResults) => {
        if (!err && incidentResults.length > 0) {
          const incident = incidentResults[0];
          db.query(logSql, [
            resolved_by,
            getGMT8Time(),
            `Resolved Incident: ${incident.incident_type}`,
            incident.location
          ], (logErr) => {
            if (logErr) {
              console.error("Error logging incident resolution:", logErr);
            }
          });
        }
      });
    }
    
    // Automatically update the incident_report status to 'Resolved'
    const updateIncidentSql = `UPDATE incident_report SET status = 'Resolved' WHERE id = ?`;
    db.query(updateIncidentSql, [incidentId], (updateErr, updateResult) => {
      if (updateErr) {
        console.error("❌ SQL error updating incident_report status:", updateErr);
      }
    });

    res.json({
      success: true,
      message: "Incident marked as resolved successfully",
      incident_id: incidentId,
      status: 'Resolved',
      resolved_at: resolvedAt,
      resolved_by: resolved_by || null
    });
  });
});

// API endpoint to assign a tanod to an incident
app.put("/api/incidents/:id/assign", (req, res) => {
  const incidentId = req.params.id;
  const { tanod_id } = req.body;

  if (!incidentId || !tanod_id) {
    return res.status(400).json({ success: false, message: "Incident ID and Tanod ID are required" });
  }
  const sql = `UPDATE incident_report SET status = 'In Progress', assigned = ? WHERE id = ?`;

  db.query(sql, [tanod_id, incidentId], (err, result) => {
    if (err) {
      console.error("❌ SQL update error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Incident not found"
      });
    }
    
    // Log the assignment action
    const logSql = `
      INSERT INTO logs_patrol (USER, TIME, ACTION, LOCATION, incident_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    // Get incident details for logging
    const getIncidentSql = "SELECT incident_type, location FROM incident_report WHERE id = ?";
    db.query(getIncidentSql, [incidentId], (err, incidentResults) => {
      if (!err && incidentResults.length > 0) {
        const incident = incidentResults[0];
        db.query(logSql, [
          tanod_id,
          getGMT8Time(),
          `Assigned to Incident: ${incident.incident_type}`,
          incident.location,
          incidentId // ADDED incidentId HERE
        ], (logErr) => {
          if (logErr) {
            console.error("Error logging incident assignment:", logErr);
          }
        });
      }
    });
    
    res.json({
      success: true,
      message: "Tanod assigned successfully and incident is now In Progress.",
      incident_id: incidentId,
      status: 'In Progress',
      assigned_tanod: tanod_id
    });
  });
});
// API endpoint to get incident details by ID
app.get("/api/incidents/:id", (req, res) => {
  const incidentId = req.params.id;
  
  if (!incidentId) {
    return res.status(400).json({ error: "Incident ID is required" });
  }
  
  const sql = `
    SELECT id, incident_type as type, location, status, datetime as created_at,
           image, reported_by, latitude, longitude, assigned, resolved_by, resolved_at, resolution_image_path
    FROM incident_report 
    WHERE id = ?
  `;
  
  db.query(sql, [incidentId], (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching incident:", err);
      return res.status(500).json({ error: "Failed to fetch incident details" });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Incident not found" });
    }
    
    res.json(results[0]);
  });
});

// API endpoint to delete an incident by ID
app.delete("/api/incidents/:id", (req, res) => {
  const incidentId = req.params.id;

  if (!incidentId) {
    return res.status(400).json({ success: false, message: "Incident ID is required" });
  }

  // First, get the incident to delete its image if it exists
  const getIncidentSql = "SELECT image FROM incident_report WHERE id = ?";
  db.query(getIncidentSql, [incidentId], (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching incident for deletion:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Incident not found" });
    }

    const imageToDelete = results[0].image;

    const deleteSql = "DELETE FROM incident_report WHERE id = ?";
    db.query(deleteSql, [incidentId], (deleteErr, result) => {
      if (deleteErr) {
        console.error("❌ SQL error deleting incident:", deleteErr);
        return res.status(500).json({ success: false, message: "Failed to delete incident" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Incident not found" });
      }

      // Delete the associated image file from the uploads folder
      if (imageToDelete) {
        const imagePath = path.join(__dirname, "uploads", imageToDelete);
        fs.unlink(imagePath, (unlinkErr) => {
          if (unlinkErr && unlinkErr.code !== 'ENOENT') {
            console.error("Error deleting incident image file:", unlinkErr);
          }
        });
      }

      res.json({ success: true, message: "Incident deleted successfully" });
    });
  });
});

// API endpoint to check for new incident assignments for a user
app.get("/api/incidents/new-assignments/:username", (req, res) => {
  const username = req.params.username;
  const { last_check } = req.query; // Optional timestamp for checking new assignments
  
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }
  
  let sql = `
    SELECT id, incident_type as type, location, status, datetime as created_at,
           reported_by, assigned
    FROM incident_report 
    WHERE assigned = ? AND status != 'Resolved'
  `;
  
  const params = [username];
  
  // If last_check timestamp is provided, only get assignments after that time
  if (last_check) {
    sql += ` AND datetime > ?`;
    params.push(last_check);
  }
  
  sql += ` ORDER BY datetime DESC`;
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching new assignments:", err);
      return res.status(500).json({ error: "Failed to fetch new assignments" });
    }
    
    res.json({
      success: true,
      new_assignments: results,
      count: results.length
    });
  });
});

// NEW: API endpoint to get all incidents (including resolved) for history view
app.get("/api/incidents/history/:username", (req, res) => {
  const username = req.params.username;
  
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }
  
  // Fetch all incidents assigned to user, including resolved ones
  const sql = `
    SELECT id, incident_type as type, location, status, datetime as created_at, 
           image, reported_by, latitude, longitude, assigned, resolved_by, resolved_at
    FROM incident_report 
    WHERE assigned = ?
    ORDER BY datetime DESC
  `;
  
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching incident history:", err);
      return res.status(500).json({ error: "Failed to fetch incident history" });
    }
    
    console.log(`Fetched ${results.length} total incidents (including resolved) for ${username}`);
    res.json(results);
  });
});

// API endpoint to fetch incidents reported by a specific user
app.get("/api/incidents/reported/:username", (req, res) => {
  const username = req.params.username;
  
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }
  
  // Fetch all incidents reported by this user, including resolved ones from the last 7 days
  const sql = `
    SELECT id, incident_type as type, location, status, datetime as created_at, 
           image, reported_by, latitude, longitude, assigned, resolved_by, resolved_at
    FROM incident_report 
    WHERE reported_by = ? 
    AND (
      status != 'Resolved' 
      OR (status = 'Resolved' AND resolved_at >= DATE_SUB(NOW(), INTERVAL 7 DAY))
    )
    ORDER BY datetime DESC
  `;
  
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching user reports:", err);
      return res.status(500).json({ error: "Failed to fetch user reports" });
    }
    
    console.log(`Fetched ${results.length} reports made by ${username} (including resolved within 7 days)`);
    res.json(results);
  });
});

// API endpoint to get all user reports (including resolved) for history view
app.get("/api/incidents/reports-history/:username", (req, res) => {
  const username = req.params.username;
  
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }
  
  // Fetch all incidents reported by user, including resolved ones
  const sql = `
    SELECT id, incident_type as type, location, status, datetime as created_at, 
           image, reported_by, latitude, longitude, assigned, resolved_by, resolved_at
    FROM incident_report 
    WHERE reported_by = ?
    ORDER BY datetime DESC
  `;
  
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching user report history:", err);
      return res.status(500).json({ error: "Failed to fetch user report history" });
    }
    
    console.log(`Fetched ${results.length} total reports (including resolved) made by ${username}`);
    res.json(results);
  });
});

// Email verification code generation and sending
app.post("/pre-register-send-code", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  // Generate a 6-digit numeric code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  // Set expiration time (e.g., 10 minutes from now)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes in milliseconds

  // Check if email already exists in users table
  const checkEmailSql = "SELECT ID, STATUS FROM users WHERE EMAIL = ?";
  db.query(checkEmailSql, [email], (err, results) => {
    if (err) {
      console.error("❌ SQL error checking email existence:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (results.length > 0) {
      const user = results[0];
      if (user.STATUS === "Verified") {
        return res.status(400).json({ success: false, message: "This email is already registered and verified." });
      }
      // If email exists but is not verified, update the existing record with new code
      const updateSql = "UPDATE users SET email_verification_code = ?, email_verification_code_expires_at = ? WHERE EMAIL = ?";
      db.query(updateSql, [verificationCode, expiresAt, email], (updateErr, updateResult) => {
        if (updateErr) {
          console.error("❌ SQL error updating verification code for existing user:", updateErr);
          return res.status(500).json({ success: false, message: "Database error" });
        }
        sendVerificationEmail(email, verificationCode, res);
      });
    } else {
      // If email does not exist, insert a new record with 'Pending' status
      const insertSql = "INSERT INTO users (EMAIL, STATUS, email_verification_code, email_verification_code_expires_at) VALUES (?, ?, ?, ?)";
      db.query(insertSql, [email, "Pending", verificationCode, expiresAt], (insertErr, insertResult) => {
        if (insertErr) {
          console.error("❌ SQL error inserting new user for verification:", insertErr);
          return res.status(500).json({ success: false, message: "Database error" });
        }
        sendVerificationEmail(email, verificationCode, res);
      });
    }
  });
});

function sendVerificationEmail(email, verificationCode, res) {
  const mailOptions = {
    from: `"PatroNet" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Email Verification Code",
    html: `Your verification code is: <strong>${verificationCode}</strong>. It will expire in 10 minutes.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Error sending verification email:", error);
      // Log the full error object for more details
      console.error("Nodemailer error details:", error); 
      return res.status(500).json({ success: false, message: "Error sending verification email" });
    }
    console.log("✅ Verification email sent:", info.response);
    res.json({ success: true, message: "Verification code sent to your email." });
  });
}

// Register route
app.post("/register", (req, res) => {
  const { username, password, role, name, email, address } = req.body;

  if (!username || !password || !role || !name || !email || !address) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  // 1. Check if the email has been pre-verified
  const checkEmailVerifiedSql = "SELECT ID, STATUS FROM users WHERE EMAIL = ?";
  db.query(checkEmailVerifiedSql, [email], (err, results) => {
    if (err) {
      console.error("❌ SQL error checking email verification status:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (results.length === 0 || results[0].STATUS !== "Email Verified") {
      return res.status(403).json({ success: false, message: "Email not pre-verified. Please verify your email first." });
    }

    // Email is pre-verified, proceed with full registration
    const userIdToUpdate = results[0].ID; // Get the ID of the pre-registered entry

    // 2. Insert the new user with 'Verified' status
    // Ensure all fields are updated, including those that might have been null during pre-registration
    const insertUserSql = `
      UPDATE users 
      SET USER = ?, PASSWORD = ?, ROLE = ?, NAME = ?, ADDRESS = ?, STATUS = 'Verified', 
          email_verification_code = NULL, email_verification_code_expires_at = NULL
      WHERE ID = ? AND EMAIL = ?
    `;
    
    db.query(insertUserSql, [username, password, role, name, address, userIdToUpdate, email], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          // This could happen if username is duplicated
          return res.status(409).json({ success: false, message: "Username already exists" });
        }
        console.error("❌ SQL insert/update error during registration:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(500).json({ success: false, message: "Failed to complete registration. User not found or no changes made." });
      }

      console.log("✅ User registered successfully and email verified.");
      res.json({ success: true, message: "User registered successfully. Your email has been verified." });
    });
  });
});

app.post("/pre-register-verify-code", (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, message: "Email and code are required." });
  }

  const sql = "SELECT email_verification_code, email_verification_code_expires_at FROM users WHERE EMAIL = ?";
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching verification code:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Email not found." });
    }

    const user = results[0];
    const storedCode = user.email_verification_code;
    const expiresAt = new Date(user.email_verification_code_expires_at);

    if (!storedCode || storedCode !== code || new Date() > expiresAt) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification code." });
    }

    // Code is valid, update user status to 'Email Verified' and clear code
    const updateSql = "UPDATE users SET STATUS = 'Email Verified', email_verification_code = NULL, email_verification_code_expires_at = NULL WHERE EMAIL = ?";
    db.query(updateSql, [email], (updateErr, updateResult) => {
      if (updateErr) {
        console.error("❌ SQL update error (code verification):", updateErr);
        return res.status(500).json({ success: false, message: "Database error" });
      }
      res.json({ success: true, message: "Email verified successfully. You can now proceed with registration." });
    });
  });
});

// API endpoint to create a new schedule entry
app.post("/api/schedules", (req, res) => {
  const { user, location, day, start_time, end_time, month } = req.body; // Updated for new fields
  
  if (!user) {
    return res.status(400).json({ success: false, message: "User is required" });
  }
  
  // Get the user's ID and IMAGE first to keep it consistent
  const getUserSQL = "SELECT ID, IMAGE FROM users WHERE USER = ?";
  
  db.query(getUserSQL, [user], (userErr, userResults) => {
    if (userErr) {
      console.error("❌ SQL error fetching user:", userErr);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    
    if (userResults.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    const userId = userResults[0].ID;
    const userImage = userResults[0].IMAGE;
    
    // Check if this user already has a schedule entry
    const checkExistsSQL = "SELECT ID FROM schedules WHERE user_id = ?";
    
    db.query(checkExistsSQL, [userId], (checkErr, checkResults) => {
      if (checkErr) {
        console.error("❌ SQL error checking schedule:", checkErr);
        return res.status(500).json({ success: false, message: "Database error" });
      } else if (checkResults.length > 0) {
        // A schedule already exists for this user.
        return res.status(409).json({ success: false, message: "User already has a schedule entry. Please edit the existing one." });
      } else {
        // No schedule exists, so insert a new one.
        const insertSQL = `
          INSERT INTO schedules (user_id, USER, STATUS, LOCATION, DAY, START_TIME, END_TIME, IMAGE, MONTH)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.query(
          insertSQL, 
          [userId, user, 'Off Duty', location || null, day, start_time, end_time, userImage, month || 'All'], // Default status to 'Off Duty'
          (insertErr, result) => {
          if (insertErr) {
            console.error("❌ SQL insert error:", insertErr);
            return res.status(500).json({ success: false, message: "Failed to insert schedule entry" });
          }
          
          res.json({ 
            success: true, 
            message: "Schedule entry created successfully",
            id: result.insertId
          });
          }
        );
      }
    });
  });
});

// API endpoint to sync tanods from users table to schedules table
app.post("/api/sync-tanods", (req, res) => {
  // First, get all users with ROLE=Tanod including their IMAGE
  const getUsersSQL = `
    SELECT ID, USER, NAME, IMAGE 
    FROM users 
    WHERE ROLE = 'Tanod' AND STATUS = 'Verified'
  `;
  
  db.query(getUsersSQL, (err, users) => {
    if (err) {
      console.error("❌ SQL error fetching tanods:", err);
      return res.status(500).json({ error: "Failed to fetch tanods" });
    }
    
    if (users.length === 0) {
      return res.json({ success: true, message: "No tanods found to sync", count: 0 });
    }
    
    // For each user, check if they exist in schedules table
    let syncCount = 0;
    let errorCount = 0;
    let processedCount = 0;
    
    users.forEach(user => {
      // Log the user data to verify what we're working with
      console.log(`Processing user: ID=${user.ID}, USER=${user.USER}, IMAGE=${user.IMAGE}`);
      
      const checkExistsSQL = "SELECT ID FROM schedules WHERE ID = ? OR USER = ?";
      
      db.query(checkExistsSQL, [user.ID, user.USER], (err, exists) => {
        if (err) {
          console.error(`❌ Error checking if user ${user.USER} exists in schedules:`, err);
          errorCount++;
          processedCount++;
          checkCompleted();
        } else {
          if (exists.length === 0) {
            // User doesn't exist in schedules, add them with SAME ID as users table
            // Include the IMAGE from users table - NO LOGS INSERTION
            const insertSQL = `
              INSERT INTO schedules (ID, USER, STATUS, TIME, IMAGE)
              VALUES (?, ?, 'OFF DUTY', NULL, ?)
            `;
            
            // Ensure the ID is properly passed as a number if needed
            const userId = parseInt(user.ID, 10);
            
            // Log the values being inserted
            console.log(`Inserting schedule: ID=${userId}, USER=${user.USER}, IMAGE=${user.IMAGE}, TIME=NULL`);
            
            db.query(insertSQL, [userId, user.USER, user.IMAGE], (err, result) => {
              if (err) {
                console.error(`❌ Error adding user ${user.USER} to schedules:`, err);
                console.error(err);
                errorCount++;
              } else {
                console.log(`✅ Successfully added user ${user.USER} with ID=${userId} to schedules with IMAGE=${user.IMAGE}`);
                syncCount++;
              }
              processedCount++;
              checkCompleted();
            });
          } else {
            console.log(`User ${user.USER} already exists in schedules, skipping`);
            processedCount++;
            checkCompleted();
          }
        }
      });
    });
    
    // Helper function to check if all users have been processed
    function checkCompleted() {
      if (processedCount === users.length) {
        res.json({
          success: true,
          message: `Sync completed. Added ${syncCount} new tanods. Errors: ${errorCount}`,
          count: syncCount
        });
      }
    }
  });
});

// API endpoint to insert log entry
app.post("/api/logs", (req, res) => {
  const { user, action } = req.body;
  
  if (!user || !action) {
    return res.status(400).json({ 
      success: false, 
      message: "User and action are required" 
    });
  }
  
  const currentTime = getGMT8Time();
  
  const sql = `
    INSERT INTO logs (USER, TIME, ACTION)
    VALUES (?, ?, ?)
  `;
  
  db.query(sql, [user, currentTime, action], (err, result) => {
    if (err) {
      console.error("❌ SQL insert error for logs:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to insert log entry" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "Log entry created successfully",
      id: result.insertId
    });
  });
});

// API endpoint to fetch all logs
app.get("/api/logs", (req, res) => {
  const sql = "SELECT * FROM logs ORDER BY TIME DESC";
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching logs:", err);
      return res.status(500).json({ error: "Failed to fetch logs" });
    }
    res.json(results);
  });
});

// API endpoint to fetch logs by user
app.get("/api/logs/:user", (req, res) => {
  const username = req.params.user;
  
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }
  
  const sql = "SELECT * FROM logs WHERE USER = ? ORDER BY TIME DESC";
  
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching user logs:", err);
      return res.status(500).json({ error: "Failed to fetch user logs" });
    }
    res.json(results);
  });
});

// API endpoint to fetch logs by user
app.get("/api/logs_resident/:user", (req, res) => {
  const username = req.params.user;
  
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }
  
  const sql = "SELECT * FROM logs_resident WHERE USER = ? ORDER BY TIME DESC";
  
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching user logs:", err);
      return res.status(500).json({ error: "Failed to fetch user logs" });
    }
    res.json(results);
  });
});

// API endpoint to fetch patrol logs by user
app.get("/api/logs_patrol/:user", (req, res) => {
  const username = req.params.user;
  
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }
  
  const sql = "SELECT * FROM logs_patrol WHERE USER = ? ORDER BY TIME DESC";
  
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching user patrol logs:", err);
      return res.status(500).json({ error: "Failed to fetch user patrol logs" });
    }
    res.json(results);
  });
});

// Schedule update endpoint
app.put("/api/schedules/:id", (req, res) => {
  const scheduleId = req.params.id;
  const { status, location, day, start_time, end_time, month } = req.body;
  
  if (!scheduleId) {
    return res.status(400).json({ success: false, message: "Schedule ID is required" });
  }
  
  // Build the SQL query for updating schedule
  let sql = "UPDATE schedules SET";
  const params = [];
  
  // Add fields if they are provided
  const updates = [];
  
  if (status !== undefined) {
    updates.push(" STATUS = ?");
    params.push(status);
  }
  
  if (location !== undefined) {
    updates.push(" LOCATION = ?");
    params.push(location);
  }

  if (day !== undefined) {
    updates.push(" DAY = ?");
    params.push(day);
  }

  if (start_time !== undefined) {
    updates.push(" START_TIME = ?");
    params.push(start_time);
  }

  if (end_time !== undefined) {
    updates.push(" END_TIME = ?");
    params.push(end_time);
  }

  if (month !== undefined) {
    updates.push(" MONTH = ?");
    params.push(month);
  }
  
  if (updates.length === 0) {
    return res.status(400).json({ success: false, message: "No fields to update" });
  }
  
  sql += updates.join(",");
  sql += " WHERE ID = ?";
  params.push(scheduleId);
  
  // Update the schedule
  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("❌ SQL update error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Schedule entry not found" });
    }
    
    res.json({ 
      success: true, 
      message: "Schedule updated successfully"
    });
  });
});

// Helper function to calculate status based on time logs
function calculateStatusFromLogs(logs, currentTime) {
  if (!logs || logs.length === 0) {
    return 'OFF DUTY';
  }
  
  const now = new Date(currentTime);
  const today = now.toISOString().slice(0, 10);
  
  // Find today's log entry
  const todayLog = logs.find(log => {
    const logDate = new Date(log.TIME).toISOString().slice(0, 10);
    return logDate === today;
  });
  
  if (!todayLog) {
    return 'OFF DUTY'; // No TIME entries today = "Off Duty"
  }
  
  // If there's both TIME_IN and TIME_OUT today = "Off Duty"
  if (todayLog.TIME_IN && todayLog.TIME_OUT) {
    return 'OFF DUTY';
  }
  
  // If there's a recent TIME_IN but no TIME_OUT today
  if (todayLog.TIME_IN && !todayLog.TIME_OUT) {
    const timeInDate = new Date(todayLog.TIME_IN);
    const hoursDiff = (now - timeInDate) / (1000 * 60 * 60); // Hours difference
    
    if (hoursDiff >= 8) {
      return 'OFF DUTY'; // Past 8 hours or more = "Off Duty"
    } else {
      return 'ON DUTY'; // Recent TIME_IN but no TIME_OUT today = "On Duty"
    }
  }
  
  return 'OFF DUTY';
}

// API endpoint to delete schedule entry
app.delete("/api/schedules/:id", (req, res) => {
  const scheduleId = req.params.id;
  
  if (!scheduleId) {
    return res.status(400).json({ success: false, message: "Schedule ID is required" });
  }
  
  const sql = "DELETE FROM schedules WHERE ID = ?";
  
  db.query(sql, [scheduleId], (err, result) => {
    if (err) {
      console.error("❌ SQL delete error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Schedule entry not found" });
    }
    
    res.json({ 
      success: true, 
      message: "Schedule entry deleted successfully" 
    });
  });
});

// API endpoint to fetch all schedules with IMAGE included
app.get("/api/schedules", (req, res) => {
  const sql = "SELECT ID, user_id, USER, STATUS, LOCATION, TIME, IMAGE, DAY, START_TIME, END_TIME, MONTH FROM schedules"; // Explicitly select columns
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ SQL error:", err);
      return res.status(500).json({ error: "Failed to fetch schedules" });
    }
    res.json(results);
  });
});

// Updated API endpoint to check user's schedule and log status for current time
app.get("/api/user-time-status/:username", async (req, res) => {
  const username = req.params.username;
  
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }
  
  try {
    // Get current GMT+8 time
    const currentTime = getGMT8Time();
    const today = currentTime.slice(0, 10); // Get date part (YYYY-MM-DD)
    // Get user's schedule information
    const schedule = await new Promise((resolve, reject) => {
      const sql = "SELECT ID, user_id, USER, STATUS, LOCATION, IMAGE, DAY, START_TIME, END_TIME, MONTH FROM schedules WHERE USER = ?"; // Removed TIME column
      db.query(sql, [username], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });

    // Helper function to check if there is a valid schedule for today
    const hasValidScheduleToday = (schedule) => {
      if (!schedule || !schedule.DAY || !schedule.START_TIME || !schedule.END_TIME || !schedule.MONTH) {
        return false;
      }
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const now = new Date();
      const todayDayName = dayNames[now.getDay()];
      const currentMonthName = monthNames[now.getMonth()];
      
      const isMonthMatch = schedule.MONTH === 'All' || schedule.MONTH.toLowerCase() === currentMonthName.toLowerCase();
      const isDayMatch = schedule.DAY.toLowerCase() === todayDayName.toLowerCase();

      return isDayMatch && isMonthMatch;
    };

    if (!schedule) {
      // If no schedule is found, return a default status (e.g., "Off Duty")
      // and indicate that no schedule was found.
      return res.json({
        success: true,
        schedule: null,
        logs: null,
        currentTime: currentTime,
        hasTimeInToday: false,
        hasTimeOutToday: false,
        hasValidTime: false,
        mostRecentLogTime: null,
        calculatedStatus: 'Off Duty',
        message: "No schedule found for user"
      });
    }
    // Get today's log entry
    const todayLog = await new Promise((resolve, reject) => {
      const sql = "SELECT * FROM logs WHERE USER = ? AND DATE(TIME) = ? LIMIT 1";
      db.query(sql, [username, today], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });

    // Calculate hardcoded status based on today's log TIME_IN and TIME_OUT
    let calculatedStatus = 'Off Duty'; // Default status
    
    if (todayLog) {
      if (todayLog.TIME_IN && !todayLog.TIME_OUT) {
        // Has TIME_IN but no TIME_OUT = On Duty
        calculatedStatus = 'On Duty';
      } else if (todayLog.TIME_IN && todayLog.TIME_OUT) {
        // Has both TIME_IN and TIME_OUT = Off Duty
        calculatedStatus = 'Off Duty';
      }
    }

    // Format the schedule time for display
    let formattedScheduleDisplay = "No schedule assigned";
    if (schedule && schedule.DAY && schedule.START_TIME && schedule.END_TIME) {
      // Simple time formatting for display
      const formatTime = (timeStr) => new Date(`1970-01-01T${timeStr}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      formattedScheduleDisplay = `${schedule.DAY}, ${formatTime(schedule.START_TIME)} - ${formatTime(schedule.END_TIME)}`;
    }

    res.json({
      success: true,
      schedule: {
        id: schedule.ID,
        user: schedule.USER,
        status: calculatedStatus,
        location: schedule.LOCATION || null,
        // NEW: Send formatted schedule string
        scheduledTime: formattedScheduleDisplay
      },
      logs: {
        timeIn: todayLog?.TIME_IN ? {
          time: todayLog.TIME_IN,
          location: todayLog.LOCATION || 'Unknown Location',
          action: 'TIME-IN'
        } : null,
        timeOut: todayLog?.TIME_OUT ? {
          time: todayLog.TIME_OUT,
          location: todayLog.LOCATION || 'Unknown Location',
          action: 'TIME-OUT'
        } : null
      },
      currentTime: currentTime,
      hasTimeInToday: !!todayLog?.TIME_IN,
      hasTimeOutToday: !!todayLog?.TIME_OUT,
      hasValidTime: hasValidScheduleToday(schedule), // Check if schedule is valid for today
      mostRecentLogTime: todayLog?.TIME_OUT || todayLog?.TIME_IN || null, // From logs
      calculatedStatus: calculatedStatus // Hardcoded based on TIME_IN/TIME_OUT
    });
  } catch (error) {
    console.error("❌ Error in user-time-status:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// NEW: Endpoint to handle time-in/time-out photo uploads
app.post("/api/upload-time-photo", upload.single("photo"), (req, res) => {
  // The 'upload.single("photo")' middleware handles the file saving.
  // 'photo' must match the key used in the FormData from the mobile app.

  if (!req.file) {
    // This error occurs if no file was part of the request.
    console.error("❌ Upload Error: No file received.");
    return res.status(400).json({ success: false, message: "No photo file was uploaded." });
  }

  // If we get here, the file was successfully uploaded by multer.
  // The unique filename is available in req.file.filename.
  const filename = req.file.filename;
  console.log(`✅ Photo uploaded successfully: ${filename}`);

  // Send a success response back to the mobile app with the filename.
  res.json({
    success: true,
    message: "Photo uploaded successfully.",
    filename: filename, // The mobile app will use this filename
  });
});

// Also modify the endpoint to not update schedule STATUS:
app.post("/api/time-record", async (req, res) => {
  const { user, action, photo } = req.body; // 1. Destructure the 'photo' from the request body
  
  if (!user || !action) {
    return res.status(400).json({ 
      success: false, 
      message: "User and action are required" 
    });
  }
  
  if (!['TIME-IN', 'TIME-OUT'].includes(action)) {
    return res.status(400).json({ 
      success: false, 
      message: "Action must be either 'TIME-IN' or 'TIME-OUT'" 
    });
  }
  // Check if user has a valid schedule for TIME-IN
  if (action === 'TIME-IN') {
    
    try {
      const schedule = await new Promise((resolve, reject) => {
        const sql = "SELECT DAY, START_TIME, END_TIME, MONTH FROM schedules WHERE USER = ?";
        db.query(sql, [user], (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        });
      });

      if (!schedule || !schedule.DAY || !schedule.START_TIME || !schedule.END_TIME) {
        return res.status(400).json({ 
          success: false, 
          message: "Cannot time in without a valid schedule. Please contact your administrator." 
        });
      }
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const now = new Date();
      const todayDayName = dayNames[now.getDay()];
      const currentMonthName = monthNames[now.getMonth()];

      const isMonthMatch = schedule.MONTH === 'All' || schedule.MONTH.toLowerCase() === currentMonthName.toLowerCase();
      const isDayMatch = schedule.DAY.toLowerCase() === todayDayName.toLowerCase();

      if (!isDayMatch || !isMonthMatch) {
        return res.status(400).json({
          success: false, 
          message: "Cannot time in without a valid schedule. Please contact your administrator." 
        });
      }
    } catch (error) {
      console.error("❌ Error checking schedule:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Database error while checking schedule" 
      });
    }
  }
  const currentTime = getGMT8Time();
  try {
    const today = currentTime.slice(0, 10);
    
    // Determine the new status and action based on the time record action
    const newStatus = action === 'TIME-IN' ? 'On Duty' : 'Off Duty';
    const logAction = action === 'TIME-IN' ? 'On Duty' : 'COMPLETED'; // Set logs ACTION to COMPLETED for TIME-OUT
    
    const existingLog = await new Promise((resolve, reject) => {
      const sql = "SELECT * FROM logs WHERE USER = ? AND DATE(TIME) = ? LIMIT 1";
      db.query(sql, [user, today], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });

    if (existingLog) {
      // Update existing log with ACTION matching the new status
      // 2. Add the photo column to the UPDATE query
      const photoColumn = action === 'TIME-IN' ? 'time_in_photo' : 'time_out_photo';
      const updateSql = `
        UPDATE logs 
        SET ${action === 'TIME-IN' ? 'TIME_IN = ?' : 'TIME_OUT = ?'}, ACTION = ?, ${photoColumn} = ?
        WHERE USER = ? AND DATE(TIME) = ?
      `;
      
      await new Promise((resolve, reject) => {
        db.query(
          updateSql, 
          // 3. Add the photo filename to the query parameters
          [currentTime, logAction, photo, user, today],
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });
    } else {
      // Insert new log with ACTION matching the new status
      // 4. Add the photo column to the INSERT query
      const photoColumn = action === 'TIME-IN' ? 'time_in_photo' : 'time_out_photo';
      const insertSql = `
        INSERT INTO logs (USER, TIME, ${action === 'TIME-IN' ? 'TIME_IN' : 'TIME_OUT'}, ACTION, ${photoColumn})
        VALUES (?, ?, ?, ?, ?)
      `;
      
      await new Promise((resolve, reject) => {
        db.query(
          insertSql, 
          // 5. Add the photo filename to the query parameters
          [user, currentTime, currentTime, logAction, photo],
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });
    }
    // Update schedule STATUS to match the log ACTION
    try {
      await new Promise((resolve, reject) => {
        const updateScheduleSql = "UPDATE schedules SET STATUS = ? WHERE USER = ?";
        db.query(updateScheduleSql, [newStatus, user], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    } catch (error) {
      console.error("❌ Error updating schedule status:", error);
      // Don't fail the entire request if schedule update fails
    }
    res.json({ 
      success: true, 
      message: `${action} recorded successfully`,
      time: currentTime,
      action: logAction, // Return the ACTION that matches STATUS
      status: newStatus
    });
  } catch (error) {
    console.error("❌ Error in time-record:", error);
    res.status(500).json({ 
      success: false, 
      message: "Database error" 
    });
  }
});

// API endpoint to fetch all activities
app.get("/api/activities", (req, res) => {
  const sql = "SELECT * FROM activities ORDER BY date DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching activities:", err);
      return res.status(500).json({ error: "Failed to fetch activities" });
    }
    res.json(results);
  });
});

// API endpoint to add a new activity
app.post("/api/activities", upload.single("image"), (req, res) => {
  const { title, date, description } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!title || !date || !description) {
    return res.status(400).json({ success: false, message: "Title, date, and description are required" });
  }

  const sql = "INSERT INTO activities (title, date, description, image) VALUES (?, ?, ?, ?)";
  db.query(sql, [title, date, description, image], (err, result) => {
    if (err) {
      console.error("❌ SQL error adding activity:", err);
      return res.status(500).json({ success: false, message: "Failed to add activity" });
    }
    res.json({ success: true, message: "Activity added successfully", id: result.insertId });
  });
});

// API endpoint to update an activity by ID
app.put("/api/activities/:id", upload.single("image"), (req, res) => {
  const activityId = req.params.id;
  const { title, date, description } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!activityId) {
    return res.status(400).json({ success: false, message: "Activity ID is required" });
  }

  // First, get the current activity data to check for existing image
  const getActivitySql = "SELECT image FROM activities WHERE _id = ?";
  db.query(getActivitySql, [activityId], (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching activity for update:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Activity not found" });
    }

    const currentImage = results[0].image;

    let sql = "UPDATE activities SET ";
    let params = [];
    let updateFields = [];

    if (title) {
      updateFields.push("title = ?");
      params.push(title);
    }
    if (date) {
      updateFields.push("date = ?");
      params.push(date);
    }
    if (description) {
      updateFields.push("description = ?");
      params.push(description);
    }
    if (image) {
      updateFields.push("image = ?");
      params.push(image);
      // Delete old image if a new one is uploaded and an old one exists
      if (currentImage) {
        const oldImagePath = path.join(__dirname, "uploads", currentImage);
        fs.unlink(oldImagePath, (unlinkErr) => {
          if (unlinkErr && unlinkErr.code !== 'ENOENT') {
            console.error("Error deleting old activity image:", unlinkErr);
          }
        });
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    sql += updateFields.join(", ");
    sql += " WHERE _id = ?";
    params.push(activityId);

    db.query(sql, params, (updateErr, result) => {
      if (updateErr) {
        console.error("❌ SQL error updating activity:", updateErr);
        return res.status(500).json({ success: false, message: "Failed to update activity" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Activity not found or no changes made" });
      }

      res.json({ success: true, message: "Activity updated successfully" });
    });
  });
});

// API endpoint to delete an activity by ID
app.delete("/api/activities/:id", (req, res) => {
  const activityId = req.params.id;

  if (!activityId) {
    return res.status(400).json({ success: false, message: "Activity ID is required" });
  }

  // First, get the activity to delete its image if it exists
  const getActivitySql = "SELECT image FROM activities WHERE _id = ?";
  db.query(getActivitySql, [activityId], (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching activity for deletion:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Activity not found" });
    }

    const imageToDelete = results[0].image;

    const deleteSql = "DELETE FROM activities WHERE _id = ?";
    db.query(deleteSql, [activityId], (deleteErr, result) => {
      if (deleteErr) {
        console.error("❌ SQL error deleting activity:", deleteErr);
        return res.status(500).json({ success: false, message: "Failed to delete activity" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Activity not found" });
      }

      // Delete the associated image file from the uploads folder
      if (imageToDelete) {
        const imagePath = path.join(__dirname, "uploads", imageToDelete);
        fs.unlink(imagePath, (unlinkErr) => {
          if (unlinkErr && unlinkErr.code !== 'ENOENT') {
            console.error("Error deleting activity image file:", unlinkErr);
          }
        });
      }

      res.json({ success: true, message: "Activity deleted successfully" });
    });
  });
});

// API endpoint to fetch all announcements
app.get("/api/announcements", (req, res) => {
  const sql = "SELECT * FROM announcements ORDER BY date DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching announcements:", err);
      return res.status(500).json({ error: "Failed to fetch announcements" });
    }
    res.json(results);
  });
});

// API endpoint to add a new announcement
app.post("/api/announcements", upload.single("image"), (req, res) => {
  const { title, description, posted_by } = req.body;
  const image = req.file ? req.file.filename : null; // Get filename if image was uploaded
  const date = getGMT8Time(); // Use the helper function for GMT+8 time

  if (!title || !description || !posted_by) {
    return res.status(400).json({ success: false, message: "Title, description, and posted_by are required" });
  }

  const sql = "INSERT INTO announcements (title, date, description, image, posted_by) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [title, date, description, image, posted_by], (err, result) => {
    if (err) {
      console.error("❌ SQL error adding announcement:", err);
      return res.status(500).json({ success: false, message: "Failed to add announcement" });
    }
    res.json({ success: true, message: "Announcement added successfully", id: result.insertId });
  });
});

// API endpoint to update an announcement by ID
app.put("/api/announcements/:id", upload.single("image"), (req, res) => {
  const announcementId = req.params.id;
  const { title, description, posted_by } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!announcementId) {
    return res.status(400).json({ success: false, message: "Announcement ID is required" });
  }

  // First, get the current announcement data to check for existing image
  const getAnnouncementSql = "SELECT image FROM announcements WHERE _id = ?";
  db.query(getAnnouncementSql, [announcementId], (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching announcement for update:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    const currentImage = results[0].image;

    let sql = "UPDATE announcements SET ";
    let params = [];
    let updateFields = [];

    if (title) {
      updateFields.push("title = ?");
      params.push(title);
    }
    if (description) {
      updateFields.push("description = ?");
      params.push(description);
    }
    if (posted_by) {
      updateFields.push("posted_by = ?");
      params.push(posted_by);
    }
    if (image) {
      updateFields.push("image = ?");
      params.push(image);
      // Delete old image if a new one is uploaded and an old one exists
      if (currentImage) {
        const oldImagePath = path.join(__dirname, "uploads", currentImage);
        fs.unlink(oldImagePath, (unlinkErr) => {
          if (unlinkErr && unlinkErr.code !== 'ENOENT') {
            console.error("Error deleting old announcement image:", unlinkErr);
          }
        });
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    sql += updateFields.join(", ");
    sql += " WHERE _id = ?";
    params.push(announcementId);

    db.query(sql, params, (updateErr, result) => {
      if (updateErr) {
        console.error("❌ SQL error updating announcement:", updateErr);
        return res.status(500).json({ success: false, message: "Failed to update announcement" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Announcement not found or no changes made" });
      }

      res.json({ success: true, message: "Announcement updated successfully" });
    });
  });
});

// API endpoint to delete an announcement by ID
app.delete("/api/announcements/:id", (req, res) => {
  const announcementId = req.params.id;

  if (!announcementId) {
    return res.status(400).json({ success: false, message: "Announcement ID is required" });
  }

  // First, get the announcement to delete its image if it exists
  const getAnnouncementSql = "SELECT image FROM announcements WHERE _id = ?";
  db.query(getAnnouncementSql, [announcementId], (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching announcement for deletion:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    const imageToDelete = results[0].image;

    const deleteSql = "DELETE FROM announcements WHERE _id = ?";
    db.query(deleteSql, [announcementId], (deleteErr, result) => {
      if (deleteErr) {
        console.error("❌ SQL error deleting announcement:", deleteErr);
        return res.status(500).json({ success: false, message: "Failed to delete announcement" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Announcement not found" });
      }

      // Delete the associated image file from the uploads folder
      if (imageToDelete) {
        const imagePath = path.join(__dirname, "uploads", imageToDelete);
        fs.unlink(imagePath, (unlinkErr) => {
          if (unlinkErr && unlinkErr.code !== 'ENOENT') {
            console.error("Error deleting announcement image file:", unlinkErr);
          }
        });
      }

      res.json({ success: true, message: "Announcement deleted successfully" });
    });
  });
});

// Add this API endpoint to your backend (paste.txt)
app.get("/api/logs_patrol", (req, res) => { // General fetch for all patrol logs
  const sql = "SELECT * FROM logs_patrol ORDER BY TIME DESC";
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching logs_patrol:", err);
      return res.status(500).json({ error: "Failed to fetch patrol logs" });
    }
    res.json(results);
  });
});

// Count endpoints
app.get("/api/schedules/count", (req, res) => {
  const sql = "SELECT COUNT(*) as count FROM schedules";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ SQL error:", err);
      return res.status(500).json({ error: "Failed to fetch schedules count" });
    }
    res.json(results[0]);
  });
});

app.get("/api/gis/count", (req, res) => {
  const sql = "SELECT COUNT(*) as count FROM incident_report";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ SQL error:", err);
      return res.status(500).json({ error: "Failed to fetch gis count" });
    }
    res.json(results[0]);
  });
});

app.get("/api/patrollogs/count", (req, res) => {
  const sql = "SELECT COUNT(*) as count FROM logs_patrol";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ SQL error:", err);
      return res.status(500).json({ error: "Failed to fetch patrol logs count" });
    }
    res.json(results[0]);
  });
});

app.get("/api/activities/count", (req, res) => {
  const sql = "SELECT COUNT(*) as count FROM activities";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ SQL error:", err);
      return res.status(500).json({ error: "Failed to fetch activities count" });
    }
    res.json(results[0]);
  });
});

app.get("/api/accounts/count", (req, res) => {
  const sql = "SELECT COUNT(*) as count FROM users";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ SQL error:", err);
      return res.status(500).json({ error: "Failed to fetch accounts count" });
    }
    res.json(results[0]);
  });
});

// API endpoint to receive contact messages
app.post("/api/contact-messages", (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  const currentTime = getGMT8Time();

  const sql = `
    INSERT INTO contact_messages (name, email, subject, message, timestamp, status)
    VALUES (?, ?, ?, ?, ?, 'unread')
  `;

  db.query(sql, [name, email, subject, message, currentTime], (err, result) => {
    if (err) {
      console.error("❌ SQL error inserting contact message:", err);
      return res.status(500).json({ success: false, message: "Database error while saving contact message" });
    }
    res.json({ success: true, message: "Contact message received and saved", id: result.insertId });
  });
});

// API endpoint to fetch all contact messages
app.get("/api/contact-messages", (req, res) => {
  const sql = "SELECT * FROM contact_messages ORDER BY timestamp DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching contact messages:", err);
      return res.status(500).json({ error: "Failed to fetch contact messages" });
    }
    res.json(results);
  });
});

// API endpoint to update contact message status
app.put("/api/contact-messages/:id/status", (req, res) => {
  const messageId = req.params.id;
  const { status } = req.body;

  if (!messageId || !status) {
    return res.status(400).json({ success: false, message: "Message ID and status are required" });
  }

  const validStatuses = ['unread', 'in-progress', 'replied'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status provided." });
  }

  const sql = "UPDATE contact_messages SET status = ? WHERE id = ?";
  db.query(sql, [status, messageId], (err, result) => {
    if (err) {
      console.error("❌ SQL error updating contact message status:", err);
      return res.status(500).json({ success: false, message: "Database error while updating status" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Contact message not found" });
    }
    res.json({ success: true, message: "Contact message status updated successfully" });
  });
});

// API endpoint to add a reply to a contact message
app.post("/api/contact-messages/:id/replies", (req, res) => {
  const messageId = req.params.id;
  const { sender, content } = req.body;

  if (!messageId || !sender || !content) {
    return res.status(400).json({ success: false, message: "Message ID, sender, and content are required" });
  }

  const currentTime = getGMT8Time();

  // Assuming replies are stored as a JSON array in the 'replies' column of contact_messages table
  // First, fetch the current replies
  const fetchSql = "SELECT replies FROM contact_messages WHERE id = ?";
  db.query(fetchSql, [messageId], (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching replies:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Contact message not found" });
    }

    let currentReplies = results[0].replies ? JSON.parse(results[0].replies) : [];
    const newReply = {
      id: currentReplies.length > 0 ? Math.max(...currentReplies.map(r => r.id)) + 1 : 1,
      sender,
      content,
      timestamp: currentTime,
      sent: true // Assuming replies from admin are 'sent'
    };
    currentReplies.push(newReply);

    const updateSql = "UPDATE contact_messages SET replies = ?, status = 'replied' WHERE id = ?";
    db.query(updateSql, [JSON.stringify(currentReplies), messageId], (updateErr, updateResult) => {
      if (updateErr) {
        console.error("❌ SQL error updating replies:", updateErr);
        return res.status(500).json({ success: false, message: "Database error while adding reply" });
      }
      res.json({ success: true, message: "Reply added successfully", reply: newReply });
    });
  });
});

// API endpoint to delete a contact message
app.delete("/api/contact-messages/:id", (req, res) => {
  const messageId = req.params.id;

  if (!messageId) {
    return res.status(400).json({ success: false, message: "Message ID is required" });
  }

  const sql = "DELETE FROM contact_messages WHERE id = ?";
  db.query(sql, [messageId], (err, result) => {
    if (err) {
      console.error("❌ SQL error deleting contact message:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Contact message not found" });
    }

    res.json({ success: true, message: "Contact message deleted successfully" });
  });
});

// API endpoint to fetch all tourist spots
app.get("/api/tourist-spots", (req, res) => {
  const sql = "SELECT * FROM tourist_spots ORDER BY id DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching tourist spots:", err);
      return res.status(500).json({ error: "Failed to fetch tourist spots" });
    }
    res.json(results);
  });
});

// API endpoint to add a new tourist spot
app.post("/api/tourist-spots", upload.single("image"), (req, res) => {
  const { name, description, location } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!name || !description || !location) {
    return res.status(400).json({ success: false, message: "Name, description, and location are required" });
  }

  const sql = "INSERT INTO tourist_spots (name, description, location, image) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, description, location, image], (err, result) => {
    if (err) {
      console.error("❌ SQL error adding tourist spot:", err);
      return res.status(500).json({ success: false, message: "Failed to add tourist spot" });
    }
    res.json({ success: true, message: "Tourist spot added successfully", id: result.insertId });
  });
});

// API endpoint to update a tourist spot by ID
app.put("/api/tourist-spots/:id", upload.single("image"), (req, res) => {
  const { id } = req.params;
  const { name, description, location } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!id) {
    return res.status(400).json({ success: false, message: "Tourist spot ID is required" });
  }

  // Get current tourist spot data to check for an existing image
  const getSpotSql = "SELECT image FROM tourist_spots WHERE id = ?";
  db.query(getSpotSql, [id], (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching tourist spot for update:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Tourist spot not found" });
    }

    const currentImage = results[0].image;
    let sql, params;

    if (image) {
      // If a new image is uploaded, update all fields including the image
      sql = "UPDATE tourist_spots SET name = ?, description = ?, location = ?, image = ? WHERE id = ?";
      params = [name, description, location, image, id];
      // Delete the old image if it exists
      if (currentImage) {
        const oldImagePath = path.join(__dirname, "uploads", currentImage);
        fs.unlink(oldImagePath, (unlinkErr) => {
          if (unlinkErr && unlinkErr.code !== 'ENOENT') {
            console.error("Error deleting old tourist spot image:", unlinkErr);
          }
        });
      }
    } else {
      // If no new image, update only the text fields
      sql = "UPDATE tourist_spots SET name = ?, description = ?, location = ? WHERE id = ?";
      params = [name, description, location, id];
    }

    db.query(sql, params, (updateErr, result) => {
      if (updateErr) {
        console.error("❌ SQL error updating tourist spot:", updateErr);
        return res.status(500).json({ success: false, message: "Failed to update tourist spot" });
      }
      res.json({ success: true, message: "Tourist spot updated successfully" });
    });
  });
});

// API endpoint to delete a tourist spot by ID
app.delete("/api/tourist-spots/:id", (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, message: "Tourist spot ID is required" });
  }

  // First, get the tourist spot to delete its image
  const getSpotSql = "SELECT image FROM tourist_spots WHERE id = ?";
  db.query(getSpotSql, [id], (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching tourist spot for deletion:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Tourist spot not found" });
    }

    const imageToDelete = results[0].image;
    const deleteSql = "DELETE FROM tourist_spots WHERE id = ?";
    db.query(deleteSql, [id], (deleteErr, result) => {
      if (deleteErr) {
        console.error("❌ SQL error deleting tourist spot:", deleteErr);
        return res.status(500).json({ success: false, message: "Failed to delete tourist spot" });
      }
      if (imageToDelete) {
        fs.unlink(path.join(__dirname, "uploads", imageToDelete), (unlinkErr) => {
          if (unlinkErr && unlinkErr.code !== 'ENOENT') console.error("Error deleting image file:", unlinkErr);
        });
      }
      res.json({ success: true, message: "Tourist spot deleted successfully" });
    });
  });
});

// API endpoint to fetch all custom incident types
app.get("/api/incident_types", (req, res) => {
  const sql = "SELECT * FROM incident_types ORDER BY name ASC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching incident types:", err);
      return res.status(500).json({ error: "Failed to fetch incident types" });
    }
    res.json(results);
  });
});

// API endpoint to add a new incident type
app.post("/api/incident_types", (req, res) => {
  const { name, icon, color } = req.body;

  if (!name || !icon || !color) {
    return res.status(400).json({ success: false, message: "Name, icon, and color are required" });
  }

  const sql = "INSERT INTO incident_types (name, icon, color) VALUES (?, ?, ?)";
  db.query(sql, [name, icon, color], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ success: false, message: "An incident type with this name already exists." });
      }
      console.error("❌ SQL error adding incident type:", err);
      return res.status(500).json({ success: false, message: "Failed to add incident type" });
    }
    // Return the newly created type so the frontend can update its state
    res.status(201).json({ 
      id: result.insertId,
      name,
      icon,
      color
    });
  });
});

// --- Multer Configuration for Resolution Image Uploads ---
// This sets up a specific storage location for resolution images.
const resolutionStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // The directory is 'uploads/resolutions/'
    cb(null, 'uploads/resolutions/'); 
  },
  filename: function (req, file, cb) {
    // Create a unique filename to prevent overwrites
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resolution-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadResolution = multer({ storage: resolutionStorage });

// NEW ENDPOINT: Resolve a patrol log incident with photo proof
app.post("/api/patrol-logs/resolve", uploadResolution.single("resolutionImage"), (req, res) => {
  const { logId, resolved_by } = req.body;
  console.log(`🔍 Received resolution request for logId: ${logId}, resolved_by: ${resolved_by}`);

  // Check if a file was uploaded
  if (!req.file) {
    console.error("❌ Resolve Error: No image file was received.");
    return res.status(400).json({ success: false, message: 'Resolution image is required.' });
  }
  console.log(`🔍 Image file received: ${req.file.filename}`);

  const resolution_image_path = req.file.filename;
  const resolved_at_time = getGMT8Time();

  // First, check if the patrol log exists and get the incident_id
  const checkQuery = `SELECT ID, incident_id FROM logs_patrol WHERE ID = ?`;
  db.query(checkQuery, [logId], (checkErr, checkResults) => {
    if (checkErr) {
      console.error("❌ Database error checking patrol log existence:", checkErr);
      return res.status(500).json({ success: false, message: 'Database error occurred during check.' });
    }

    if (checkResults.length === 0) {
      console.warn(`⚠️ Resolve Warning: Patrol log with ID ${logId} not found in DB.`);
      return res.status(404).json({ success: false, message: 'Patrol log not found.' });
    }

    const incidentId = checkResults[0].incident_id;
    console.log(`✅ Patrol log with ID ${logId} found. Linked incident_id: ${incidentId}`);

    // Update the patrol log status to 'Resolved'
    const updateQuery = `
      UPDATE logs_patrol 
      SET 
        status = 'Resolved', 
        resolved_by = ?, 
        resolved_at = ?, 
        resolution_image_path = ?
      WHERE ID = ?
    `;

    db.query(updateQuery, [resolved_by, resolved_at_time, resolution_image_path, logId], (err, result) => {
      if (err) {
        console.error("❌ Database error resolving patrol log:", err);
        return res.status(500).json({ success: false, message: 'Database error occurred.' });
      }

      if (result.affectedRows === 0) {
        console.warn(`⚠️ Resolve Warning: Patrol log with ID ${logId} not updated. Affected rows: 0.`);
        return res.status(404).json({ success: false, message: 'Patrol log not found.' });
      }

      console.log(`✅ Patrol log ID ${logId} has been resolved by ${resolved_by}.`);

      // Now automatically resolve the main incident report if incident_id exists
      if (incidentId) {
        const resolveIncidentSql = `
          UPDATE incident_report 
          SET status = 'Resolved', resolved_at = ?, resolved_by = ? 
          WHERE id = ?
        `;
        
        db.query(resolveIncidentSql, [resolved_at_time, resolved_by, incidentId], (resolveErr, resolveResult) => {
          if (resolveErr) {
            console.error(`❌ Error auto-resolving incident report ID ${incidentId}:`, resolveErr);
            // Return success for patrol log but note the incident update failed
            return res.status(200).json({ 
              success: true, 
              message: 'Patrol log resolved, but incident report update failed.',
              warning: 'Incident report may need manual update.'
            });
          }

          if (resolveResult.affectedRows > 0) {
            console.log(`✅ Automatically resolved incident report ID ${incidentId}.`);
            return res.status(200).json({ 
              success: true, 
              message: 'Patrol log and corresponding incident report have been resolved successfully.' 
            });
          } else {
            console.warn(`⚠️ Incident report ID ${incidentId} not found or already resolved.`);
            return res.status(200).json({ 
              success: true, 
              message: 'Patrol log resolved successfully.',
              warning: 'Incident report not found or already resolved.'
            });
          }
        });
      } else {
        // No incident_id linked, just return success for the patrol log
        console.log(`ℹ️ No incident_id linked to patrol log ${logId}.`);
        return res.status(200).json({ 
          success: true, 
          message: 'Patrol log resolved successfully (no linked incident report).' 
        });
      }
    });
  });
});
// --- Firewall Endpoints ---

// GET all blocked IPs
app.get("/api/firewall/blocked-ips", (req, res) => {
  const sql = "SELECT * FROM firewall_blocked_ips ORDER BY created_at DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching blocked IPs:", err);
      return res.status(500).json({ error: "Failed to fetch blocked IPs" });
    }
    res.json(results);
  });
});

// GET recent access logs
app.get("/api/firewall/access-logs", (req, res) => {
  // Fetch the last 100 access logs for performance
  const sql = "SELECT * FROM firewall_access_logs ORDER BY timestamp DESC LIMIT 100";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ SQL error fetching access logs:", err);
      return res.status(500).json({ error: "Failed to fetch access logs" });
    }
    res.json(results);
  });
});

// POST to block a new IP
app.post("/api/firewall/block", (req, res) => {
  const { ip_address, reason } = req.body;

  if (!ip_address) {
    return res.status(400).json({ success: false, message: "IP address is required" });
  }

  const sql = "INSERT INTO firewall_blocked_ips (ip_address, reason) VALUES (?, ?)";
  db.query(sql, [ip_address, reason], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ success: false, message: "IP address is already blocked" });
      }
      console.error("❌ SQL error blocking IP:", err);
      return res.status(500).json({ success: false, message: "Database error while blocking IP" });
    }
    refreshBlockedIps(); // Immediately refresh the blocklist in memory
    res.status(201).json({ success: true, message: "IP address blocked successfully", id: result.insertId });
  });
});

// DELETE to unblock an IP
app.delete("/api/firewall/unblock/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM firewall_blocked_ips WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ SQL error unblocking IP:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Blocked IP not found" });
    }
    refreshBlockedIps(); // Immediately refresh the blocklist in memory
    res.json({ success: true, message: "IP address unblocked successfully" });
  });
});

// Start server
const os = require("os");

app.listen(3001, "0.0.0.0", () => {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (let iface in interfaces) {
    for (let details of interfaces[iface]) {
      if (details.family === "IPv4" && !details.internal) {
        addresses.push(details.address);
      }
    }
  }
  console.log(`✅ Server running at:`);
  console.log(`   Local:   http://localhost:3001`);
  addresses.forEach(ip => console.log(`   Network: http://${ip}:3001`));
});
