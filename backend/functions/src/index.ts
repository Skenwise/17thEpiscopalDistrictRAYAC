import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {onRequest} from "firebase-functions/v2/https";
import {v4 as uuidv4} from "uuid";

initializeApp();
const db = getFirestore();

const GEEPAY_BASE_URL = "https://api.geepay.co.zm";
const HYMN_PRICE = 50;

async function getAccessToken(): Promise<string> {
  const clientId = process.env.GEEPAY_CLIENT_ID!;
  const clientSecret = process.env.GEEPAY_CLIENT_SECRET!;

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(`${GEEPAY_BASE_URL}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
    } as Record<string, string>,
    body: params.toString(),
  });

  const data = await response.json();

  if (!data.access_token) {
    throw new Error("Failed to obtain GeePay access token");
  }

  return data.access_token;
}

export const createCheckout = onRequest(
  {
    cors: true,
    secrets: ["GEEPAY_CLIENT_ID", "GEEPAY_CLIENT_SECRET"],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({error: "Method not allowed"});
      return;
    }

    const {email, phone, name} = req.body;

    if (!email || !phone || !name) {
      res.status(400).json({error: "Missing required fields: email, phone, name"});
      return;
    }

    try {
      const token = await getAccessToken();
      const transactionRef = uuidv4();
      const callbackUrl = "https://us-central1-districtrayac.cloudfunctions.net/geepayWebhook";
      const returnUrl = `https://districtrayac.web.app/payment-success?ref=${transactionRef}`;

      await db.collection("payments").doc(transactionRef).set({
        email,
        phone,
        name,
        amount: HYMN_PRICE,
        status: "pending",
        createdAt: new Date(),
      });

      const response = await fetch(`${GEEPAY_BASE_URL}/api/v1/checkout/session`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "X-Client-ID": process.env.GEEPAY_CLIENT_ID!,
          "X-Transaction-Ref": transactionRef,
          "X-Callback-URL": callbackUrl,
          "Content-Type": "application/json",
          "Accept": "application/json",
        } as Record<string, string>,
        body: JSON.stringify({
          amount: HYMN_PRICE,
          order_id: transactionRef,
          customer: {name, email},
          return_url: returnUrl,
          receipt_redirect: true,
        }),
      });

      const data = await response.json();

      if (data.checkout_url) {
        res.status(200).json({checkout_url: data.checkout_url});
      } else {
        throw new Error("No checkout URL returned from GeePay");
      }
    } catch (error: any) {
      console.error("Checkout creation failed:", error);
      res.status(500).json({error: error.message || "Failed to create checkout session"});
    }
  }
);

export const geepayWebhook = onRequest(
  {
    cors: false,
    secrets: ["GEEPAY_CLIENT_ID", "GEEPAY_CLIENT_SECRET"],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }

    const {status, data} = req.body;

    if (!data?.transaction_reference) {
      res.status(400).send("Missing transaction reference");
      return;
    }

    const transactionRef = data.transaction_reference;

    try {
      const paymentRef = db.collection("payments").doc(transactionRef);
      const paymentDoc = await paymentRef.get();

      if (!paymentDoc.exists) {
        console.error(`Payment not found: ${transactionRef}`);
        res.status(404).send("Payment not found");
        return;
      }

      const payment = paymentDoc.data()!;

      if (status === "successful") {
        await paymentRef.update({
          status: "success",
          externalReference: data.external_reference,
          completedAt: new Date(),
        });

        const usersSnapshot = await db
          .collection("users")
          .where("email", "==", payment.email)
          .limit(1)
          .get();

        if (!usersSnapshot.empty) {
          await usersSnapshot.docs[0].ref.update({
            premiumUnlocked: true,
            paymentDate: new Date(),
            paymentRef: transactionRef,
          });
          console.log(`Premium unlocked for: ${payment.email}`);
        } else {
          await db.collection("pendingUnlocks").doc(payment.email).set({
            email: payment.email,
            transactionRef,
            unlockedAt: new Date(),
          });
          console.log(`Pending unlock stored for: ${payment.email}`);
        }
      } else {
        await paymentRef.update({
          status: "failed",
          completedAt: new Date(),
        });
      }

      res.status(200).send("OK");
    } catch (error: any) {
      console.error("Webhook processing failed:", error);
      res.status(500).send("Internal server error");
    }
  }
);
