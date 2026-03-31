export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    console.log("ENV KEY:", process.env.PAYHERO_API_KEY);

    let body = req.body;
    if (typeof body === "string") {
      body = JSON.parse(body);
    }

    const { phone_number, amount } = body;

    if (!phone_number || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing phone or amount"
      });
    }

    let phone = phone_number.replace(/\D/g, "");
    if (phone.startsWith("0")) phone = "254" + phone.substring(1);

    console.log("Sending to PayHero:", phone, amount);

     const AUTH_TOKEN = "ZmJUSWhmTXJyRVc1NFB4cG5tOGE6c0FyMGxEYjlVVWhKbDQ4RHR4NUI5QjBaeGVmMVBXOEJ0c3dNRU5FUg==";

    const response = await fetch("https://backend.payhero.co.ke/api/v2/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${AUTH_TOKEN}`
      },
      body: JSON.stringify({
        amount: amount,
        phone_number: phone_number,
        channel_id: 6579,
        provider: "m-pesa",
        external_reference: "INV-" + Date.now(),
        customer_name: "Test User",
        callback_url: "https://fulizaincrease-iota.vercel.app/api/callback"
      })
    });


    let data;
    try {
      data = await response.json();
    } catch (err) {
      const text = await response.text();
      console.log("Non-JSON response:", text);
      throw new Error("Invalid JSON from PayHero");
    }

    console.log("PayHero response:", data);

    return res.status(200).json({
      success: true,
      payhero: data
    });

  } catch (error) {
    console.error("FULL ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
