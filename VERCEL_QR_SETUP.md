# QR demo on Vercel

The kiosk and phone use this site's `/api/upload` routes. Vercel runs those routes as separate Functions, so the short-lived QR handoff is stored in a **private Vercel Blob store**. No third-party API or relational database is needed.

## One-time Vercel setup

1. Import this repository into a Vercel project, or open its existing Vercel project.
2. In the project's **Storage** tab, create a **Blob** store and choose **Private** access. Connect it to the project. Vercel supplies `BLOB_STORE_ID`; its short-lived OIDC token is available to the Blob SDK at runtime.
3. In **Settings → Environment Variables**, add `CRON_SECRET` with a random value of at least 16 characters. The daily cleanup job uses it to remove abandoned QR sessions.
4. Redeploy after connecting the store and adding the secret.

## Verify

1. Open `/kiosk` on one device and click **Start printing**.
2. Continue to the QR upload screen and scan its code with another device.
3. On the phone, tap **Send demo to kiosk**. Within a few seconds, the kiosk should advance to the scan screen.

The QR flow currently sends **demo document metadata only**. It does not transfer a PDF or photo from the phone. Local development works without Blob by using process memory, but a Vercel deployment requires the connected Blob store; otherwise the QR screen reports that upload is unavailable.
