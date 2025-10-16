export default async function handler(req, res) {
  if (req.method === "POST") {
    console.log("[miniapp-webhook] event received", {
      headers: req.headers,
      body: req.body
    });
    return res.status(200).json({ received: true });
  }

  return res.status(200).json({ status: "ok" });
}

