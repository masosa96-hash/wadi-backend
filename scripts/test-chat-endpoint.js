/**
 * Test the /api/chat endpoint with Groq integration
 */

const API_URL = "http://localhost:4000";

async function testGuestChat() {
  console.log("\n=== Testing Guest Chat ===");
  
  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Guest-Id": "test-guest-" + Date.now(), // Guest ID for guest mode
      },
      body: JSON.stringify({
        message: "Hola, ¿cómo estás?",
        messages: [], // Empty history for guest
      }),
    });

    const data = await response.json();
    
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
    
    if (response.ok && data.ok) {
      console.log("✅ Guest chat works!");
      console.log("   Reply:", data.data.reply.substring(0, 100) + "...");
      console.log("   Model used:", data.data.model);
      return true;
    } else {
      console.log("❌ Guest chat failed!");
      console.log("   Error:", data.message || data.error);
      return false;
    }
  } catch (error) {
    console.error("❌ Request failed:", error.message);
    return false;
  }
}

async function runTests() {
  console.log("🧪 Testing /api/chat endpoint with Groq integration\n");
  
  const guestSuccess = await testGuestChat();
  
  console.log("\n=== Test Summary ===");
  console.log("Guest Chat:", guestSuccess ? "✅ PASS" : "❌ FAIL");
  
  process.exit(guestSuccess ? 0 : 1);
}

runTests();
