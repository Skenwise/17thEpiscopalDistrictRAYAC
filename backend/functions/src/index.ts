import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {onRequest} from "firebase-functions/v2/https";
import {v4 as uuidv4} from "uuid";

initializeApp();
const db = getFirestore();

const GEEPAY_BASE_URL = "https://pgsandbox.privatedns.org/v1";
const HYMN_PRICE = 50;

interface PaymentData {
  email: string;
  phone: string | null;
  name: string;
  amount: number;
  productName: string | null;
  productType?: string;
  paymentMethod: string | null;
  status: string;
  createdAt: Date;
}

async function getAccessToken(): Promise<string> {
  const response = await fetch(`${GEEPAY_BASE_URL}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: process.env.GEEPAY_CLIENT_ID!,
      client_secret: process.env.GEEPAY_CLIENT_SECRET!,
    }),
  });

  const data = await response.json() as {access_token?: string};
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

    const {email, phone, name, amount, productName, paymentMethod} = req.body;

    if (!email || !name) {
      res.status(400).json({error: "Missing required fields"});
      return;
    }

    const chargeAmount = typeof amount === "number" ? amount : HYMN_PRICE;

    try {
      const token = await getAccessToken();
      const transactionRef = uuidv4();
      let returnUrl = "https://17thdistrictrayac.org/checkout?payment=success";
      if (productName) {
        returnUrl += `&product=${encodeURIComponent(productName)}`;
      }

      await db.collection("payments").doc(transactionRef).set({
        email,
        phone: phone || null,
        name,
        amount: chargeAmount,
        productName: productName || null,
        paymentMethod: paymentMethod || null,
        status: "pending",
        createdAt: new Date(),
      } as PaymentData);

      const response = await fetch(`${GEEPAY_BASE_URL}/checkout/session`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "X-Client-ID": process.env.GEEPAY_CLIENT_ID!,
          "X-Transaction-Ref": transactionRef,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          order_id: transactionRef,
          amount: chargeAmount,
          customer: {
            name: name,
            email: email,
          },
          return_url: returnUrl,
          receipt_redirect: true,
        }),
      });

      const data = await response.json() as {checkout_url?: string; message?: string};
      console.log("GeePay checkout response:", JSON.stringify(data));

      if (data.checkout_url) {
        res.status(200).json({checkout_url: data.checkout_url});
      } else {
        throw new Error(data.message || "No checkout URL returned");
      }
    } catch (error) {
      const err = error as Error;
      console.error("Checkout failed:", err);
      res.status(500).json({error: err.message || "Internal server error"});
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
    console.log("Webhook received:", JSON.stringify(req.body));

    if (!data?.transaction_reference) {
      res.status(400).send("Missing transaction reference");
      return;
    }

    const transactionRef = data.transaction_reference as string;

    try {
      const paymentRef = db.collection("payments").doc(transactionRef);
      const paymentDoc = await paymentRef.get();

      if (!paymentDoc.exists) {
        res.status(404).send("Payment not found");
        return;
      }

      const payment = paymentDoc.data() as PaymentData;

      if (status === "successful") {
        await paymentRef.update({
          status: "success",
          externalReference: data.external_reference,
          completedAt: new Date(),
        });

        console.log(
          `Payment succeeded for ${payment.email}` +
          (payment.productName ? ` (product: ${payment.productName})` : "")
        );

        const usersSnapshot = await db
          .collection("users")
          .where("email", "==", payment.email)
          .limit(1)
          .get();

        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          const productName = payment.productName || "";
          const isHymnBookPurchase =
            productName.toLowerCase().includes("hymn") ||
            productName.toLowerCase().includes("hymn book") ||
            productName === "Hymn Book";

          if (isHymnBookPurchase) {
            await userDoc.ref.update({
              premiumUnlocked: true,
              paymentDate: new Date(),
              paymentRef: transactionRef,
            });
            console.log(`✅ Premium unlocked for: ${payment.email} (Hymn Book purchase)`);
          } else {
            await userDoc.ref.update({
              paymentDate: new Date(),
              paymentRef: transactionRef,
            });
            console.log(`❌ Premium NOT unlocked for: ${payment.email} (${productName || "offering/event"})`);
          }
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
        console.log(`Payment failed for: ${payment.email}`);
      }

      res.status(200).send("OK");
    } catch (error) {
      const err = error as Error;
      console.error("Webhook failed:", err);
      res.status(500).send("Internal server error");
    }
  }
);
