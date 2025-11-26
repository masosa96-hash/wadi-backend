/**
 * Test script for run creation endpoint
 * Tests the POST /api/projects/:id/runs endpoint
 */

const API_URL = "http://localhost:4000";

async function testRunCreation() {
  console.log("🧪 Testing Run Creation Endpoint\n");

  // You'll need to replace these with actual values from your Supabase
  const TEST_USER_ID = "test-user-id"; // Replace with actual user ID
  const TEST_PROJECT_ID = "test-project-id"; // Replace with actual project ID
  const TEST_INPUT = "Hello, can you help me with a simple task?";

  try {
    console.log("1️⃣ Testing health endpoint...");
    const healthResponse = await fetch(`${API_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log("✅ Health check:", healthData);

    if (healthData.status !== "ok") {
      console.error("❌ API is not healthy, aborting test");
      return;
    }

    console.log("\n2️⃣ Testing run creation...");
    console.log("Input:", TEST_INPUT);
    console.log("Project ID:", TEST_PROJECT_ID);

    const response = await fetch(
      `${API_URL}/api/projects/${TEST_PROJECT_ID}/runs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // You'll need to add proper authentication header
          // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
        },
        body: JSON.stringify({
          input: TEST_INPUT,
          model: "gpt-3.5-turbo", // Will be mapped to llama-3.1-8b-instant
        }),
      }
    );

    console.log("Response status:", response.status);

    const data = await response.json();
    console.log("\n📄 Response data:");
    console.log(JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("\n✅ SUCCESS: Run created successfully!");
      console.log("Run ID:", data.run?.id);
      console.log("Model used:", data.run?.model);
      console.log("Credits used:", data.credits_used);
      console.log("Credits remaining:", data.credits_remaining);
    } else {
      console.log("\n❌ FAILED: Run creation failed");
      console.log("Error:", data.error);
      if (data.code) {
        console.log("Error code:", data.code);
      }
      if (data.details) {
        console.log("Details:", data.details);
      }
    }
  } catch (error) {
    console.error("\n❌ Error during test:");
    console.error(error.message);
    console.error(error.stack);
  }
}

// Run the test
testRunCreation();
