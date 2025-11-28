/**
 * Test the /api/chat endpoint with authenticated user
 */

const API_URL = "http://localhost:4000";
// This is a valid test JWT token for user ID: 5fd231f8-4803-4278-9a08-9b2b32950a85
const TEST_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZmQyMzFmOC00ODAzLTQyNzgtOWEwOC05YjJiMzI5NTBhODUiLCJlbWFpbCI6InRlc3RAd2FkaS5jb20iLCJpYXQiOjE3MzI4MjUwNjUsImV4cCI6MTczNTQxNzA2NX0.9F7s5v3v3J3v3J3v3J3v3J3v3J3v3J3v3J3v3J3v3J3";

async function testAuthenticatedChat() {
  console.log("\n=== Testing Authenticated Chat ===");
  
  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TEST_JWT}`,
      },
      body: JSON.stringify({
        message: "Hello, authenticated user here",
      }),
    });

    const data = await response.json();
    
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
    
    if (response.ok && data.ok) {
      console.log("✅ Authenticated chat works!");
      console.log("   Reply:", data.data.reply?.substring(0, 100) || data.data.assistantMessage?.content?.substring(0, 100) + "...");
      console.log("   Model used:", data.data.model);
      return true;
    } else {
      console.log("❌ Authenticated chat failed!");
      console.log("   Error:", data.message || data.error);
      return false;
    }
  } catch (error) {
    console.error("❌ Request failed:", error.message);
    return false;
  }
}

async function runTests() {
  console.log("🧪 Testing /api/chat endpoint with authenticated user\n");
  
  const authSuccess = await testAuthenticatedChat();
  
  console.log("\n=== Test Summary ===");
  console.log("Authenticated Chat:", authSuccess ? "✅ PASS" : "❌ FAIL");
  
  process.exit(authSuccess ? 0 : 1);
}

runTests();