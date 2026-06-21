async function testAll() {
  const base_url = "http://localhost:5002/api";
  console.log("=== STARTING INTEGRATION TESTS ===");

  try {
    // 1. Coach Verification
    console.log("\n--- Testing Coach Client Fetch ---");
    console.log("Logging in as coach@fitbyus.com...");
    const coachLogin = await fetch(`${base_url}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "coach@fitbyus.com", password: "password123" })
    });
    const coachData = await coachLogin.json();
    if (!coachData.token) throw new Error("Coach login failed");
    console.log("Coach login successful!");

    const clientsRes = await fetch(`${base_url}/coach/clients`, {
      headers: { "Authorization": `Bearer ${coachData.token}` }
    });
    const clients = await clientsRes.json();
    console.log(`Successfully fetched ${clients.length} clients under Coach Alex.`);
    clients.forEach(c => {
      console.log(` - Client: ${c.name} (Goal: ${c.goal}, Weight: ${c.weight} kg)`);
    });

    if (clients.length === 0) throw new Error("No clients found under Coach Alex!");

    // 2. Client Profile Verification
    console.log("\n--- Testing Client Profile & Coach Resolution ---");
    console.log("Logging in as client@fitbyus.com...");
    const clientLogin = await fetch(`${base_url}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "client@fitbyus.com", password: "password123" })
    });
    const clientData = await clientLogin.json();
    if (!clientData.token) throw new Error("Client login failed");
    console.log("Client login successful!");

    const profileRes = await fetch(`${base_url}/user/profile`, {
      headers: { "Authorization": `Bearer ${clientData.token}` }
    });
    const profile = await profileRes.json();
    console.log("Coach info structure returned in client profile:");
    console.log(JSON.stringify(profile.coach, null, 2));

    if (!profile.coach?.user?.id) {
      throw new Error("FAIL: Coach user ID was not returned in the select block!");
    }
    console.log("SUCCESS: Coach user ID resolved correctly:", profile.coach.user.id);

    // 3. Client Sending Message
    console.log("\n--- Testing Chat System (Sending Message) ---");
    const testMessageContent = "Hello Coach Alex, this is an automated integration test message!";
    const sendRes = await fetch(`${base_url}/chat/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${clientData.token}`
      },
      body: JSON.stringify({
        receiverId: profile.coach.user.id,
        content: testMessageContent
      })
    });
    console.log("Send Message Status:", sendRes.status);
    const sentMsg = await sendRes.json();
    console.log("Message sent:", sentMsg);
    if (sendRes.status !== 201) throw new Error("Failed to send message");

    // 4. Verifying Chat History contains message
    console.log("\n--- Verifying Chat History ---");
    const historyRes = await fetch(`${base_url}/chat/messages?otherUserId=${profile.coach.user.id}`, {
      headers: { "Authorization": `Bearer ${clientData.token}` }
    });
    const history = await historyRes.json();
    const found = history.some(m => m.id === sentMsg.id);
    if (found) {
      console.log("SUCCESS: Message found in chat history!");
    } else {
      throw new Error("FAIL: Message not found in chat history!");
    }

    console.log("\n=== ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ===");
  } catch (err) {
    console.error("\n❌ Test Suite Failed:", err.message || err);
  }
}

testAll();
