# Smart Print — Product and Prototype Blueprint

**Version:** 1.0
**Purpose:** A handoff document for designers and developers building a professional Smart Print demo and, later, a deployable kiosk system.

## 1. Product definition

Smart Print is licensed kiosk software installed on an operator-owned laptop. The laptop drives an external touchscreen monitor, a printer, and a supported cash-acceptor controller. Customers choose print size and color mode, send a document by **local QR upload, Bluetooth, or USB**, review a price calculated from the scanned document, and pay with **cash** or an **e-wallet**. **Every received document is stored locally on the kiosk laptop for the active job in both Online and Offline modes; document contents are not uploaded to the Smart Print SaaS cloud.** The screen asks customers to pay the exact price, but the demo continues the order if excess money is received and shows the excess separately. Operators purchase a per-kiosk software license and manage their machines through a dashboard. Smart Print supplies software, setup guidance, and tested hardware profiles; operators source and maintain hardware.

The first demo is a **UI prototype**. It must visibly label simulated uploads, cash insertion, e-wallet confirmation, printer events, license activation, power loss, and component failures. It does not need a payment integration, hardware controller, or printing backend. This document is the deliverable for now; no website or application is requested yet.

### Core design principles

1. Show the total price before accepting payment.
2. Never show a kiosk as ready when it cannot fulfill a job.
3. Preserve a paid job and a clear resolution path when printing fails.
4. Keep customer documents private and short-lived.
5. Make operator controls inaccessible from the customer screen.
6. Keep payments, licensing, and device events traceable for support and reconciliation.
7. After a short power interruption, resume the same payment or print job; after a longer outage, return to Welcome while preserving all received money and unfinished jobs for recovery.

### Responsive UI target

The **UI prototype** must work on tablets, laptops, and large external touchscreen monitors in portrait and landscape, with the same flows and state at every size. **Both the Operator and Smart Print Admin dashboards must be fully usable on cellphones**, not merely viewable there. Design fluidly for 320–2560 CSS-pixel widths; review both dashboards at 320/360/375/390/430 px phone widths, customer tablet screens at 600/768/1024 px, a compact 1366×768 laptop, and a 1920×1080 external touchscreen. Small customer screens stack options and price details vertically; larger screens may show a price summary beside the current step. Phone dashboards use compact navigation, readable cards in place of wide tables, adaptable charts/filters, and forms/dialogs that remain usable with an on-screen keyboard. Sales monitoring, incidents, settings, network reconnection, license/fleet views, and Admin-only scenario controls must retain their desktop actions and role restrictions on phones. Keep prices, payment state, errors, and primary actions readable without horizontal page overflow or overlapping controls. Use touch-friendly targets, keyboard support, and layouts that remain usable with increased text size. This UI requirement does not imply that every tablet already supports the production printer, cash controller, Bluetooth, USB, and hotspot hardware; those adapters need device-specific validation.

## 2. Users and surfaces

| User | Surface | Main tasks |
| --- | --- | --- |
| Customer | Fullscreen touchscreen kiosk | Choose print options, upload, review scanned document and price, pay, collect print |
| Customer | Phone local QR upload page or Bluetooth sender | Send a file directly to the kiosk laptop's active local session and return to the touchscreen |
| Operator | Operator dashboard: online cloud view for setup/settings and protected local dashboard through the kiosk hotspot when offline | Activate and configure kiosks online; while offline, use the local dashboard to monitor status, incidents, and sales or select Wi-Fi to return Online; cannot run demo fault scenarios |
| Smart Print Admin | Protected SaaS console and Demo Scenario Lab | Issue licenses, manage operators, view fleet health and support events, and exclusively run demo fault scenarios |

The external touchscreen is the customer display. **The first install requires internet** to activate the license and obtain the initial Operator configuration. Feature customization is done in the protected **online Operator dashboard**. The laptop keeps a verified local copy of that configuration for Offline mode. In Offline mode it turns on a **local hotspot with no internet access for connected devices**. An Operator can connect a phone or laptop to that hotspot and open the kiosk's protected **local Operator dashboard** (the local admin portal) to view status, incidents, held transactions, and sales. From that dashboard, the Operator can change from Offline to Online, choose a nearby Wi-Fi network, enter its password, and connect the kiosk. Normal feature-setting changes require the online dashboard.

### First-install activation and configuration

1. Install Smart Print on the laptop. In the local setup wizard, the kiosk device scans nearby Wi-Fi networks and lists their names, signal strength, and security status. The Operator selects a network, enters its password if needed, and presses **Connect**. Show connection and internet-reachability checks, with **Rescan** and retry/error states. Show **Setup required** until the kiosk has internet and activation finishes; do not open the customer Welcome screen or accept money yet.
2. Operator signs in to the online dashboard and enters/assigns a valid license key. The license service binds the entitlement to this kiosk identity and returns its active status.
3. Operator customizes the kiosk's features online: printer profile, prices and copy limit, allowed file inputs, cash/e-wallet availability, change/refund settings, payment timers, outage window, and Online/Offline policy.
4. Operator publishes the configuration. The kiosk downloads and verifies the license plus a versioned configuration, stores them locally, and runs printer, cash-controller, local storage, and local QR/Bluetooth/USB checks.
5. Once activation, configuration, and required checks pass, the customer Welcome screen becomes available. The Operator may then choose Offline mode; the kiosk uses its locally stored configuration within the documented license grace period.

The initial internet connection comes from the Wi-Fi network selected in setup or another supported internet uplink. The kiosk hotspot is for local customer uploads and local Operator access; in Offline mode it does not provide internet to connected phones or laptops. A successful Wi-Fi association alone does not satisfy setup: verify that the kiosk can reach the license service.

If the first installation has no internet, the license is invalid, or no configuration has been published, remain on **Setup required** and do not accept payments. Later settings changes require the online dashboard and are applied only after the kiosk reconnects; do not replace an active order's frozen price or interrupt a paid job. Customer documents stay local throughout setup and operation.

## 3. Customer journey and screens

| # | Screen | Required content and behavior |
| --- | --- | --- |
| 1 | Welcome | Brand, clear **Start printing** action, supported input methods, kiosk availability, and **Recover previous transaction** access for a verified customer after a long outage |
| 2 | Print preferences | Ask for paper/print size, **Black & white** or **Colored**, and **number of copies** before upload. Start at 1 copy, provide clear minus/plus controls and an Operator-configured maximum. Show only options supported by the printer; one/two-sided printing may also be chosen here if supported. |
| 3 | Select file source | Offer **QR code upload**, **Bluetooth transfer**, and **USB drive** in both Online and Offline modes when their local adapters are ready. Show the reason if a specific adapter is unavailable. |
| 4 | Upload/pairing | QR: single-use upload session on the customer's phone over the kiosk's local Wi-Fi/hotspot or local network, with connection instructions; internet access is not required. Bluetooth: temporary kiosk pairing/receive session with visible device name and pairing instructions. USB: select a supported file from the inserted drive. All three paths save the received working copy locally on the laptop and show progress, timeout, cancel, and transfer errors. |
| 5 | Document scan | Show scanning progress, then safe preview, filename, file type, page count, detected image count, and each image's printed area or dimensions where measurable; explain unsupported or unreadable files and allow replacement |
| 6 | Price review | Show selected size and color mode, detected pages/images, image-size or coverage charges, **price for one complete copy**, **number of copies**, **copy subtotal**, any other disclosed charge, and **final total**. Make the multiplication explicit (for example, **₱15 per copy × 2 copies = ₱30 total**). Provide prominent **Continue to payment** and **Cancel** buttons and a short print-failure policy summary. |
| 7 | Payment selection | After **Continue to payment**, show cash and e-wallet choices only when their components and Operator-selected network mode allow them. In Offline mode, disable e-wallet payment with a clear explanation and keep supported cash payment available. Keep the approved order and price visible, and disclose the refund and excess-payment policy for each method before it is chosen. |
| 7A | Cash payment | Price due, accepted total, remaining amount or excess amount, supported denominations, prominent **Insert money before timer ends** countdown, cancel/help, and a transaction reference shown before money is inserted. Remind customers **Please pay the exact amount** and show whether automatic change is available. Each confirmed coin/bill insertion refreshes the cash inactivity timer. If an inserted denomination exceeds the remaining price, the demo accepts it and proceeds instead of rejecting the print. |
| 7B | E-wallet payment | Kiosk-specific payment QR/reference, price due, confirmed amount received, remaining or excess amount, prominent **Complete payment before timer ends** countdown, awaiting/confirmed/expired/failed states; QR is never treated as proof of payment. Reconcile any excess actually received separately from the print price. |
| 8 | Print progress | Paid → queued → printing → completed, with plain-language error and recovery states |
| 8F | Cash refund to e-wallet | If a cash-paid job becomes unrecoverable, Automatic refund is On, and Automatic change is Off, show the charge for unprinted pages/copies and ask the customer to choose a supported e-wallet and enter/confirm its mobile number. Show **Refund pending** after submission and a reference; show **Refund sent** only after the payout provider confirms it. |
| 8R | Short-outage automatic recovery | If power returns within the configured window, show the same payment or paid print job directly. Restore confirmed cash/e-wallet amounts, remaining balance, completed pages, component checks, and automatic print recovery progress. |
| 8L | Long-outage transaction hold | If power returns after the window, open Welcome for a new customer, but keep the earlier money and job in a protected hold record. Offer **Recover previous transaction** by reference/verification and alert the Operator; do not automatically print, refund, or apply the old balance to a stranger's new job. |
| 9 | Print successful | Clear **Printing successful** message, job/reference ID, completed page/copy count, collection reminder, and **Report a problem** and **Done** buttons. Show **Your uploaded file has been deleted from Smart Print** only after cleanup is confirmed. Return to Welcome after Done or an inactivity timeout. |
| 9A | Report a problem | Let the customer select an issue such as **Lines on print**, **Faded/poor quality**, **Wrong or missing pages**, **Paper damaged**, or **Other problem**; accept a short optional description, show the linked job ID, and submit the concern. Also offer this route from print-error screens. |

### Essential customer-side states

- **Not ready:** printer offline, paper unavailable, error, maintenance mode, or unavailable payment method. Block payment before the customer can continue from the price review.
- **Cancel at price review:** discard the unpaid order and temporary file, then return to Welcome without opening payment or printing. The customer can decide after seeing the complete price.
- **Unreadable or unanalyzable document:** do not estimate a price or permit payment. Show the reason and offer Replace file or Cancel.
- **Excess payment:** the UI demo does not reject an order when confirmed cash or e-wallet funds exceed the price. It marks the order paid, continues printing, and displays **Price**, **Amount received**, and **Excess/change due** separately. The Operator's change setting determines the demo's next state; the excess is never silently added to the print price or hidden from transaction records.
- **Cash canceled with money inserted:** if the selected hardware can return money, automatically return exactly the confirmed cash amount accepted so far. Do not promise a completed cash refund unless the hardware confirms the return. For a non-returning acceptor, keep the amount in an unresolved case and show the Operator's support process.
- **E-wallet pending/expired:** keep the job unprinted until the payment provider confirms it through the backend.
- **Payment timer expires:** stop accepting new cash for that session or expire the displayed e-wallet payment attempt. If no money was received, clear the unpaid session and return to Welcome. If any confirmed amount was received, save it in a protected payment hold, return to Welcome, and allow verified recovery by transaction reference; never erase the balance or count it as a completed sale. Resolve any in-flight cash event or e-wallet confirmation before deciding the final amount.
- **Paid but printer failed:** preserve the job/payment record and attempt automatic recovery first. If the job becomes unrecoverable, apply that kiosk's **Automatic refund on unrecoverable print failure** setting; if no refund can be issued, keep a visible unresolved case and alert the Operator. Never report a refund as completed before it is actually confirmed.
- **Customer reports poor print quality after success:** keep the printer-reported job as completed, create a separate concern linked to it, and alert the Operator. A customer report does not silently trigger the automatic refund toggle; the Operator reviews the physical-output issue and records any reprint or refund decision.
- **Successful print cleanup:** after every page of every requested copy is confirmed complete, delete Smart Print's stored document and generated previews/temporary print files. Keep only the job, payment, page-completion, and audit metadata needed for sales and support. A later reprint requires a new upload; never delete the customer's original file on their USB drive or phone.
- **Power restored within the configured window:** resume the exact same transaction. If payment was incomplete, restore confirmed cash accepted and e-wallet funds received, show the remaining price, and let the customer continue paying without starting over. If printing was in progress, resume the same paid job and automatically replace an unfinished sheet as described below. A power interruption alone never triggers a refund.
- **Power restored after the window:** open Welcome instead of automatically continuing the old payment or print job. Keep every confirmed amount and the old job in a protected hold record, show an Operator alert, and provide a verified recovery path for the prior customer. Do not erase the balance, silently keep it as sales, automatically refund it, or attach it to a new customer's order.
- **Inactivity:** warn, then clear only sessions with no money received. A session with cash accepted or e-wallet funds confirmed must remain in the ledger and follow the payment-hold/recovery rules.

## 4. UI demo scope

### Clickable demo scenarios

1. **Happy path, cash:** Start printing → choose size, B&W/color, and **2 copies** → select QR upload and send a sample PDF → watch simulated scan → see page/image findings and **price per copy × 2** → Continue to payment → simulate cash payment → print both copies → show success and file-deleted status.
2. **Happy path, e-wallet:** choose size and B&W/color → select Bluetooth transfer and receive a sample PDF → review scan and price → Continue to payment → show payment QR → press a clearly marked **Simulate payment confirmed** control → complete.
3. **USB and price cancellation:** choose preferences → select a file from a simulated USB drive → review the calculated price → press **Cancel** → return to Welcome with no payment and no job printed.
4. **Printer unavailable:** show why the machine cannot take payment and how the operator can fix it.
5. **Paid job fails:** simulate a paper jam, preserve the paid order, and show a retry/support route.
6. **Operator journey:** with internet connected, sign in to the online Operator dashboard, activate a sample license, configure printer/prices/features, publish settings, and show the kiosk becoming Ready. Then open Sales Monitoring, inspect kiosk health, and enter maintenance mode.
7. **First-install gate:** simulate a fresh install with no internet or no valid license. Show **Setup required**, block the customer Welcome screen and payment, then connect, activate, publish configuration, and pass checks before opening the kiosk.
8. **Short-outage print recovery:** start a paid three-page job; mark page 1 as printing but not complete; Smart Print Admin simulates a 2-minute outage and restores power. The kiosk opens the same paid job, shows **Discarding unfinished sheet**, then automatically prints a fresh page 1 followed by pages 2 and 3. It does not refund, charge again, create a fresh order, or show Welcome first.
9. **Component failures:** use Smart Print Admin to set the printer or another component to **Offline** or **Failed**; show the corresponding customer-facing block/recovery state; restore the component and show the job continuing where safe.
10. **Incident monitoring:** Smart Print Admin triggers printer Offline, paper jam, payment failure, and power loss; the Operator opens their incident log to see each event, its severity, affected kiosk/job, detected cause, customer impact, current status, and recovery action. Smart Print Admin restores a simulated component and its incident changes to Resolved.
11. **Sales monitoring:** complete sample cash and e-wallet jobs, then show the Operator's sales totals, payment breakdown, and transaction list updating. A simulated refund changes the refund and net-sales figures without deleting the original transaction.
12. **Refund setting:** the Operator turns **Automatic refund on unrecoverable print failure** on and off in Settings. Smart Print Admin simulates a mid-print printer failure. Show automatic recovery being attempted first, then an automatic simulated refund for **only the unprinted pages/copies** when enabled and supported: cash through the enabled change dispenser; cash with change disabled through the customer's chosen e-wallet and confirmed number; or e-wallet payment through the original provider transaction back to the sending wallet. If the selected route is unavailable, show an unresolved case and Operator alert.
13. **Print-quality concern:** finish a sample job, show **Printing successful**, then select **Report a problem → Lines on print** and submit. Show the customer's reference confirmation and the new concern in the Operator dashboard with a maintenance follow-up status.
14. **Short-outage payment recovery:** Smart Print Admin simulates a 2-minute outage while ₱5 of a ₱10 cash price has been accepted. On restart, the same payment screen shows **₱5 received / ₱5 remaining** and accepts only the remaining exact amount. Repeat with a confirmed e-wallet amount; pending/unconfirmed transfers are verified before being credited.
15. **Long-outage hold:** Smart Print Admin simulates an 11-minute outage during a partially paid or paid job. On restart, show Welcome. The old transaction remains in an Operator-visible hold list with its exact confirmed amount, job status, and reference. No automatic refund or print occurs. Demonstrate **Recover previous transaction** only after customer/reference verification.
16. **Cash timer:** on the Cash screen, show a visible countdown. Simulate one coin insertion, refresh the inactivity timer, and keep the accepted amount. Let the timer expire with a remaining balance; show **Payment time ended — your money is saved** with the transaction reference, then return to Welcome and show the held amount in the Operator dashboard.
17. **E-wallet timer:** on the E-wallet screen, show a visible countdown next to the payment QR. Let it expire without payment and return to Welcome. Repeat with a provider-confirmed amount arriving near expiry; credit and preserve that amount after reconciliation instead of discarding it.
18. **Copy-price breakdown and cleanup:** use a sample three-page file priced at ₱5 per page. With **2 copies**, show **₱15 per copy × 2 = ₱30 total** before payment. After all six page/copy units complete, show **Printing successful** and **File deleted from Smart Print**. The transaction remains visible in Sales Monitoring without retaining the document.
19. **Excess-payment choice:** show a ₱15 order and simulate receiving ₱20. The kiosk displays **₱15 price / ₱20 received / ₱5 excess** and continues the print. In the Operator's **Automatic change** setting, show the ₱5 change being returned by a simulated supported payout method. In the requested **No change given** demo setting, show the ₱5 as disclosed and outstanding rather than pretending change was paid. Label that latter setting **Demo only — not deployable in the Philippines as described**.
20. **Operator network mode:** in Operator Settings, select **Offline** even while a simulated internet connection is available. The customer can still choose **local QR upload, Bluetooth, or USB** and pay cash; e-wallet payment and cloud sync are disabled. All received files stay on the kiosk laptop. Sales and incident events show **Pending sync**. Switch back to **Online** and show connected payment/sync options returning and queued metadata synchronizing without uploading document files. Only Smart Print Admin may use the separate fault Scenario Lab; Operators control their kiosk's network mode, not fault simulation.
21. **Offline local Operator dashboard:** switch the activated kiosk to Offline, show its hotspot as available with **No internet access**, connect an Operator device, open the protected local dashboard, inspect local sales/incidents, then change the mode to **Online**. Show the kiosk scanning nearby Wi-Fi, Operator network/password selection, connection checks, cloud reconnection, and queued metadata sync; customer hotspot access never grants admin access.
22. **Wi-Fi selection:** during first install, show a simulated nearby-network scan, password entry, connecting, failed-password/no-internet states, and successful license-service reachability. Later, from the Operator's Online-mode network settings or the offline local portal, rescan and choose a network; show **Online** only after the kiosk confirms internet access.

### Smart Print Admin — Demo Scenario Lab

The protected Smart Print Admin UI includes a **System checks & scenarios** section. **Only an authenticated Smart Print Admin can run demo fault scenarios or change simulated component status**; the customer kiosk has no simulation controls. Each component card shows its normal status, selected simulated status, last check, customer impact, and a **Restore normal** action. Include a **Reset all simulations** action and an obvious **Simulation active** indicator. Record each scenario change in the demo activity log.

| Component check | Demo controls | Customer-facing result |
| --- | --- | --- |
| Printer | Ready / Offline / Failed / Out of paper / Paper jam | Block new payments when unavailable; pause an active paid job and show recovery instructions |
| Coin acceptor | Ready / Offline / Failed | Disable cash payment; retain existing accepted-cash record and require operator resolution if money is already inside |
| Bill acceptor | Ready / Offline / Failed | Disable bills when the acceptor fails; in production, also disable any denomination that could create excess the configured payout method cannot return |
| E-wallet service | Ready / Offline / Payment pending / Payment failed | Disable new e-wallet checkout or show pending/failed state; never print from an unconfirmed payment |
| Internet connection | Connected / Disconnected | Disable provider-dependent payment, payouts, and cloud sync when disconnected; local QR upload remains available if the kiosk's local Wi-Fi/hotspot or LAN is healthy |
| Local Wi-Fi / hotspot | Ready / Offline / Failed | Disable local QR upload if phones cannot reach the kiosk; Bluetooth and USB may remain available |
| Local storage / job ledger | Healthy / Failed | Stop new transactions; show service unavailable because paid-job recovery cannot be guaranteed |
| License | Active / Expired / Verification unavailable | Show the configured grace or unavailable state; do not silently bypass licensing |
| Power | On / Simulate power loss / Restore after 2 minutes / Restore after 11 minutes | Short outage resumes the same payment or print screen; long outage opens Welcome and places the old transaction on hold without losing money |

The Operator dashboard and Smart Print Admin can view an **Interrupted jobs and held transactions** panel: order ID, confirmed money received, remaining amount, payment status, outage duration, last confirmed page, page in progress at interruption, automatic system checks, discarded-sheet event, recovery/hold status, and event timeline. A short-outage print recovery starts by itself, without an operator Resume button. Smart Print Admin can demonstrate **Automatically checking**, **Discarding unfinished sheet**, **Printing a fresh page 1**, **Waiting for printer** if sheet clearing fails, **Held after long outage**, and **Completed** through the exclusive Scenario Lab. These are UI simulations, not real printer commands.

### Operator and Smart Print Admin — Incident log and alerts

Add an **Incident log** visible to Operators for their own kiosks and to Smart Print Admin for the fleet. Show an active-incident count and a clear alert banner when a failure affects customers or a paid job. Each entry includes timestamp, severity (**Info / Warning / Critical**), kiosk ID, component, order/job ID when relevant, error code, plain-language description, customer impact, automatic action taken, status (**Active / Recovering / Resolved / Needs review**), and resolution time. The detail view shows a chronological event timeline and suggested operator steps when automatic recovery cannot solve the issue. Viewing incidents does not grant access to demo fault controls.

Provide filters for date, kiosk, component, severity, and status; search by order ID or error code; and a safe export of redacted incident data for support. Keep normal system checks separate from incidents while allowing the operator to open the most recent check from an incident. Smart Print Admin's demo scenario controls must generate realistic incident entries and resolution events, so the presenter can show how the operator identifies a problem immediately. In production, persist incident events locally across a power outage and synchronize them to the SaaS dashboard when connectivity returns. Never include document contents, customer files, secrets, or full payment credentials in logs.

### Operator dashboard — Sales Monitoring

Operators can monitor sales for **their own kiosks only**. Show cards for today's gross confirmed payments, refunds, net collected amount, completed print jobs, and paid jobs still printing or awaiting recovery. Add a daily sales chart and a payment-method breakdown for **cash versus e-wallet**. Filters cover today/week/month/custom date range, kiosk, payment method, print size, and B&W/color.

The transaction table shows time, order ID, kiosk, print summary, payment method, amount, payment status, print status, and refund/credit status. Selecting a row opens its timeline and links to any related incident. Gross is the sum of confirmed payments; net collected is gross minus recorded refunds. Keep completed-job counts separate from payment totals so a paid interrupted job remains visible without being mistaken for a successful print. Include expected cashbox amount and collected cashbox amount for reconciliation, plus the e-wallet settlement reference/status where available. Show **Last updated** and **Pending sync** when a kiosk is offline; never label unsynced local figures as fully reconciled.

Show **print sales**, **change returned**, and **unsettled excess/change due** as separate figures. Excess received is not part of the quoted print price. A failed change payout remains an outstanding amount owed and produces an Operator alert; do not label it returned or silently include it in sales.

For the UI demo, use fictional transactions and charts. Completing the sample cash and e-wallet journeys updates the visible totals; the power-loss scenario leaves the payment counted and the job marked **Recovering** until printing finishes. The Operator can view this dashboard but cannot launch demo fault scenarios from it.

### Operator dashboard — Customer concerns and print quality

Add a **Customer concerns** inbox for the Operator's kiosks. Each report shows the job ID, kiosk, time, selected issue, optional description, print/payment status, and handling status (**New / Investigating / Resolved**). Link it to the job timeline and any printer incident. A concern about lines, fading, or poor quality should create a maintenance follow-up so the Operator can check ink/toner, print head, paper path, or other applicable hardware. Show repeated quality reports for the same kiosk prominently. The Operator can record a resolution such as maintenance completed, reprint offered, refund handled, or no issue found. Keep the original customer report and resolution history for audit.

The customer sees a **Concern submitted** confirmation and reference number. Do not ask for personal contact details just to file a concern; if follow-up contact is offered, make it optional and explain how it will be used. Reports from a printing-error screen use the same inbox. A complaint is a reported issue, not proof that the hardware detected a failure or that a refund was issued.

### Operator settings — Print-failure refund policy

Add a per-kiosk toggle labeled **Automatic refund on unrecoverable print failure**. The setting has an explanatory line: **“If a paid job cannot be completed after recovery attempts, automatically refund only the price of pages or copies that were not successfully printed, when a supported return route is available.”** Show separate capability badges for **Cash dispenser refund**, **Cash-to-e-wallet payout**, and **Original e-wallet refund**. With Automatic change enabled, cash refunds use the same tested payout mechanism when it can dispense the exact amount. With Automatic change disabled, a cash-paying customer chooses a supported e-wallet and confirms its mobile number for a separate payout. E-wallet payments use the original provider transaction to return funds to the verified sending wallet; no destination number is entered for that route. Record who changed the setting and when. Show the current policy and any method limitation before the customer pays.

| Setting/result | Required behavior |
| --- | --- |
| Toggle On, refund supported | After the printer failure is confirmed unrecoverable, automatically sum the frozen prices of unprinted page/copy units and request that amount as a refund. Show **Refund pending**, and show **Refunded** only after confirmation. Record the amount, unprinted units, and reference. |
| Toggle On, refund unsupported for that method | Do not pretend money was returned. Show **Automatic refund unavailable**, open an unresolved refund/support case, and alert the Operator. |
| Toggle Off | Do not initiate an automatic refund. Preserve the paid job and amount, open an unresolved case, and alert the Operator for their stated support/refund process. |
| Temporary error or power interruption | Do not refund for power loss alone. Resume payment or printing automatically within the configured outage window; after it, hold the balance/job and show Welcome without losing the money. |

**Refund route by payment method:**

| Original payment | Automatic route when refund toggle is On | If unavailable or unsuccessful |
| --- | --- | --- |
| Cash, Automatic change On | Use the enabled change dispenser to return the exact charge for unprinted page/copy units; confirm payout before showing **Refunded**. | Keep **Refund pending/needs assistance**, record the amount owed, and alert the Operator; do not claim cash was dispensed. |
| Cash, Automatic change Off | Ask the customer to select a supported e-wallet and enter the receiving number; confirm the wallet and masked number, then initiate a **cash-to-e-wallet payout** for the unprinted units. This is a new outbound transfer, not a refund of an original e-wallet payment. | Hold the amount and alert the Operator if the customer cannot provide a destination or the payout provider cannot complete the transfer. Never mark it sent based only on form submission. |
| E-wallet | Use the provider's partial-refund operation on the original payment transaction, directing funds to the verified sending wallet/payment source. Show a masked source identifier only if the provider supplies one. | Keep **Refund pending/needs assistance**, record the provider response, and alert the Operator. Some provider/payment-method combinations require manual processing rather than an automatic transfer. |

For the cash-to-e-wallet route, show the refund amount and supported wallet choices before entry. Require the customer to enter and confirm the number, display the destination in masked form for final confirmation, and validate the format and destination with the payout provider where available. The customer receives the full calculated refund for unprinted units; any transfer fee is an Operator cost, not a deduction from that refund. Link the destination to the current verified job/refund case, encrypt it, restrict Operator access, and remove it after the payout and required record-retention period. Submit only one idempotent payout for that case. If the customer is no longer at the kiosk, the held refund can be claimed later using the protected transaction-recovery flow; do not send it to a number supplied by an unverified person.

The selected provider must be tested for partial refunds and the specific e-wallet method before production. For example, [PayMongo documents partial refunds to the original payment method](https://developers.paymongo.com/v1/docs/refunding-transactions), while [Maya's documentation lists manual refund handling for some e-wallet methods](https://developers.maya.ph/reference/managing-voids-and-refunds-in-maya-checkout). For cash-to-e-wallet refunds, Smart Print needs a separate disbursement product: [Maya's Unified Transfer documentation describes payout use cases and e-wallet account numbers](https://developers.maya.ph/reference/about-unified-transfer). Do not promise a transfer until the chosen provider, wallet, and operator account are enabled for it.

For a job stopped partway through, record each page and copy as **confirmed printed** or **not printed**. When the toggle is On and the method supports refunds, return **only the frozen charge for not-printed units**. A partially printed sheet that is discarded counts as not printed; a page successfully reprinted during automatic recovery counts as printed and receives no refund. For example, if three pages cost ₱5 each and page 1 completed but pages 2 and 3 did not, the automatic refund is **₱10**, not ₱15. If none printed, refund all page charges. Allocate any image surcharge or other disclosed fee to page/copy units in the price snapshot so only charges assigned to unprinted units are refunded. Never refund more than the confirmed payment received, and prevent duplicate refunds. The toggle changes refund handling only; it does not give the Operator access to Smart Print Admin fault controls.

### Operator settings — Excess payment and change

Add a per-kiosk **Change handling** choice to the UI demo:

| Choice | Demo behavior |
| --- | --- |
| **Automatic change** | Accept excess, continue the print, and show the exact difference being returned through a simulated cash payout device or supported e-wallet return. Show **Change returned** only after confirmation. |
| **No change given — demo only** | Accept excess and continue the print as requested, but explicitly show the excess amount and the no-change message. Record it separately from the print price. This is a concept for demonstrating the proposed UI, not an approved Philippine production setting. |

Example: a ₱15 order receives ₱20. The print continues; **₱5** is change due, independent of the page price and any later refund for unprinted pages. If automatic payout fails, keep the ₱5 as an unsettled change obligation and alert the Operator. The chosen policy must be visible before cash is inserted or an e-wallet payment is made. Do not label a payment method as capable of automatic change unless the connected payout hardware or provider can actually return that amount.

**Philippine deployment gate:** [Republic Act No. 10909](https://ldr.senate.gov.ph/legislative%2Bissuances/Republic%20Act%20No.%2010909) requires business establishments to give exact change and prohibits giving insufficient or no change. [DTI's explanation of its implementing rules](https://www.dti.gov.ph/dti-news-archived/dti-region-11-news-archived/dti-dti-issues-irr-on-no-shortchanging-act-2) says exact change should be given without waiting for a customer request. A notice asking for exact payment does not make a **No change given** production mode compliant. For an unattended Philippine kiosk, provide a reliable change/return mechanism; otherwise prevent excess from being accepted in production or use a staffed process that gives the exact change immediately. Obtain local legal review before deployment. The UI demo may still show the requested scenario with an explicit **Demo only** label.

### Operator settings — Power-outage recovery window

The short-outage auto-resume window is configurable as **5 or 10 minutes**, with **10 minutes as the default**. A restart at or before the limit resumes the existing payment or print job automatically; a restart after the limit opens Welcome and holds the prior transaction. This setting affects screen routing and automatic continuation only. It never deletes confirmed cash/e-wallet funds or triggers a refund. Changing the setting does not retroactively change an already interrupted transaction. Only Smart Print Admin can simulate outage durations in the demo.

### Operator settings — Payment countdowns

Show a configurable **Cash insertion timer** and **E-wallet payment timer** in Operator Settings, with separate durations for each method. Proposed UI demo defaults are **60 seconds for cash** and **5 minutes for e-wallet**; Operators may change them. The cash countdown begins when the Cash screen opens and refreshes after each confirmed coin or bill insertion, giving the customer time to insert the next denomination. The e-wallet countdown begins when the payment QR/reference is shown and must follow the provider's actual expiry rules in production. Display the remaining time prominently and warn before expiry. Limit timer changes to authorized Operator roles and audit each change.

At expiry, first reconcile any cash event or e-wallet confirmation already in flight. If payment is complete, proceed to printing. If no amount was received, close the unpaid attempt. If a partial amount was received, stop the old payment attempt, save the exact confirmed amount and remaining balance, and move it to a recoverable hold with the transaction reference. A recovered customer gets a fresh timer for the remaining amount; a new customer cannot use the held balance. If power returns within the configured outage recovery window, restore the payment screen with its confirmed amount and start a fresh timer so the outage does not consume the customer's insertion time. Payment timers and the 5/10-minute power-outage window are separate settings.

### Operator settings — Online and Offline mode

Add a protected per-kiosk **Online / Offline** mode selector in the Operator dashboard's Settings → Network screen, available through the cloud dashboard when the kiosk is reachable and through the local dashboard when it is offline. The **Online** network settings ask the kiosk device to scan nearby Wi-Fi networks; show the returned network names, signal strength, security/connection status, **Rescan**, password entry for the selected network, and connection progress. The scan must come from the kiosk's Wi-Fi adapter, so the cloud dashboard can display fresh results only while it can reach that kiosk. **Online** enables internet-dependent features only after the kiosk connects to the chosen network and verifies internet/service reachability. **Offline** automatically turns on the kiosk's local hotspot, which gives connected devices access to local kiosk services but **does not provide internet**. Display the hotspot name and local dashboard address/QR in protected Operator instructions, and explain to phone users that a **No internet** Wi-Fi warning is expected. Local QR document uploads continue over this hotspot.

An Operator can connect a phone or laptop to the hotspot and open the kiosk's **local Operator dashboard even while the kiosk has no internet**. After local sign-in, its Settings → Network screen shows the current **Offline** mode, kiosk/component status, local sales and incidents, held transactions, and sync queue. When the Operator changes the mode to **Online**, the dashboard asks the kiosk to scan nearby Wi-Fi networks, shows the results, and lets the Operator select a network and enter its password. Show **Connecting** while the kiosk tests Wi-Fi, internet, and Smart Print service access. Only after those checks pass does the mode become **Online** and resume cloud sync and published-settings retrieval. If a check fails, show the reason, offer **Rescan/Retry**, and keep the mode **Offline** with the local dashboard available. Changing prices or other normal feature settings still requires the online Operator dashboard after internet is restored. This local dashboard is served by the kiosk itself, not by the SaaS cloud; merely joining the hotspot must never sign anyone in or expose admin pages or data.

If the laptop's Wi-Fi hardware cannot host the hotspot and scan/connect to another Wi-Fi network at the same time, the production build needs a supported second Wi-Fi adapter or a wired uplink so the Operator does not lose local portal access during reconnection. The UI demo can simulate this flow without claiming actual hardware support.

In Offline mode the Smart Print application avoids internet-dependent services even if an uplink is present: it disables e-wallet checkout and provider confirmation, cash-to-e-wallet payouts, remote dashboard synchronization, cloud telemetry, license renewal checks, and automatic update downloads. It does not erase local data. **Local QR upload, Bluetooth, USB, cash acceptance, print/scan/price calculation, local sales and incident logs, and hardware-based cash change/refunds remain usable** if the cached license/configuration, license grace, hotspot, printer, storage, and cash-controller checks pass. All received document files remain on the laptop in either mode; Online mode may sync job metadata, but not document contents.

| Feature | Online mode | Offline mode |
| --- | --- | --- |
| Kiosk hotspot | May remain available for local uploads/admin access | Turns on automatically; connected devices have local access only, with no internet routing |
| Nearby Wi-Fi scan and internet connection | Kiosk scans on Operator request; selected network is tested before Online is shown | Available through the local admin portal's Switch to Online flow, subject to supported Wi-Fi hardware |
| QR upload to kiosk laptop | Available over local Wi-Fi/hotspot or LAN | Available through the kiosk hotspot; no internet needed |
| Protected local admin portal | Available on the local kiosk network | Available through the hotspot after Operator sign-in; includes Switch to Online |
| Bluetooth and USB upload | Available when local adapters are ready; files saved locally | Available when local adapters are ready; files saved locally |
| Cash payment and local printing | Available when hardware is ready | Available when hardware and offline license policy allow |
| E-wallet payment and original-payment refund | Available when provider is connected | Disabled; pending provider actions stay unresolved until Online returns |
| Cash-to-e-wallet refund payout | Available when payout provider is connected | Queue an owed refund case; do not claim transfer was sent |
| Local sales, incident log, and job recovery | Available | Available locally; mark cloud sync pending |
| Cloud metadata sync, remote monitoring, license renewal, updates | Available; document files stay local | Paused; resume and reconcile when Online returns |

Switching to Offline must not interrupt an active e-wallet payment, payout, or paid print job. A local QR upload may continue because it does not use the internet. Warn the Operator and apply the mode after any provider-dependent transaction reaches a safe state; if internet connectivity drops unexpectedly, preserve its state and reconcile when Online returns. When switching back through the local portal or online dashboard, synchronize queued **metadata and payment/incident events only**, with duplicate protection, check for a newly published configuration, and show the last successful sync time. Never upload customer document bytes as part of normal sync. The Operator may select the mode but cannot use Smart Print Admin fault-scenario controls. The Offline hotspot must have internet sharing/routing disabled for connected devices, and the kiosk must restrict its own application cloud traffic; enforce device-wide data limits separately if the operating system or other apps could still use the uplink.

### Demo data and disclosure

Use fictional operator, kiosk, document, and transaction data. Add a persistent **Demo mode — no real payment or printing** indicator. Demonstrate all three input paths with simulated QR, Bluetooth, and USB transfers. Keep fault-simulation controls in the Smart Print Admin-only demo panel; neither the customer kiosk nor the Operator dashboard may expose them.

## 5. Feature catalog

### Customer features

- Responsive, large-target touchscreen layout; clear progress, back/cancel controls, and readable error messages.
- Print-size, B&W/color, and copy-count choices before file upload; QR upload, Bluetooth transfer, USB file selection, and supported-format guidance.
- Document scan with page count, detected image count, available image dimensions, and safe preview.
- Transparent price review showing one-copy breakdown, number of copies, copy subtotal, and final total, with **Continue to payment** and **Cancel** before any payment is accepted.
- Cash and e-wallet paths with distinct payment states, visible excess/change due, and the Operator's demo change-handling choice.
- Print status, job reference, automatic session reset, and privacy message.
- **Printing successful** screen with **Report a problem** for print quality or other errors, plus a concern reference after submission.
- File-deleted confirmation after all requested copies print successfully; only non-document transaction metadata remains.
- Optional future: accessibility settings and receipts.

### Operator features

- Internet-required first-install activation, license and device identity, and an online printer/controller setup wizard. The customer kiosk stays locked until a valid license and initial configuration are downloaded.
- Online dashboard customization for prices, copy limit, supported inputs, payment/change/refund options, timers, outage policy, and printer settings; publish a versioned configuration to the kiosk. Its Online-mode network settings show nearby Wi-Fi networks scanned by the reachable kiosk device and connection-test results.
- Automatic local hotspot in Offline mode with no internet for connected devices; authenticated local admin portal for status, incidents, held transactions, sales, uplink checks, and **Switch to Online**. Normal feature changes remain in the online dashboard.
- Pricing by page size, B&W/color, page count, configured image-size/coverage bands, simplex/duplex, copies, and optional service fee; preview how each rule changes the customer quote.
- Enable only settings the attached printer actually supports.
- Printer status, paper/ink/toner alerts where hardware reports them, connectivity, and maintenance mode.
- Maximum copies per order and document-storage cleanup status, including failed-deletion alerts.
- System checks for printer, cash acceptors, e-wallet service, network, storage, and license; clear distinction between live status and simulated demo status.
- Read-only interrupted-job recovery panel; no demo fault scenario controls.
- Active incident alerts and searchable incident logs with severity, cause, affected kiosk/job, automatic response, and resolution timeline.
- Sales Monitoring with revenue cards, daily trend chart, cash/e-wallet breakdown, per-kiosk filters, transaction history, refund tracking, and sync status.
- Customer concerns inbox linked to jobs, print-quality categories, repeated-issue alerts, maintenance follow-up, and resolution history.
- Per-kiosk **Automatic refund on unrecoverable print failure** toggle: cash routes through the enabled change dispenser or, when change is disabled, to the customer's confirmed e-wallet number through a payout provider; e-wallet payments return through the original transaction, with capability indicators and unresolved-case alerts.
- Per-kiosk power-outage auto-resume window (5 or 10 minutes, default 10) and a held-transactions list showing money owed or print work pending after longer outages.
- Configurable, visible Cash and E-wallet payment countdowns with warning state, accepted-amount preservation, timeout hold, and audit history.
- Operator-controlled Online/Offline kiosk mode that disables internet-dependent features and background traffic while preserving local QR/Bluetooth/USB uploads, cash, printing, ledgers, and later metadata synchronization.
- Change handling setting for the UI demo, supported payout status, and separate tracking of change returned versus unsettled excess; **No change given** is demo-only for Philippine deployment.
- Job queue, failed-job recovery, refund/credit case records, transaction ledger, cash reconciliation, and e-wallet settlement view.
- Cashbox collection record with timestamp, operator identity, expected amount, and counted amount.
- Role-based access for owner, manager, and technician; sensitive actions require reauthentication.
- Downloadable setup guide, wiring diagram, compatible hardware list, and diagnostics checklist.

### Smart Print SaaS features

- Operator organizations, subscriptions, per-kiosk license issuance, activation and deactivation.
- Smart Print Admin-only Demo Scenario Lab for power loss and component Offline/Failed states; Operators cannot open or run it.
- Fleet inventory and health, software version, update channel, and support diagnostics.
- Audit trail for license, pricing, maintenance, refund, and operator-account actions.
- License renewal notifications and a documented grace policy for temporary network loss.

## 6. Recommended system boundaries for production

```text
Customer phone ── local Wi-Fi/hotspot QR upload ──> local QR receive adapter ──┐
Operator device ── kiosk hotspot ──> authenticated local admin portal ────────┤
Customer phone ── Bluetooth ──> local Bluetooth receive adapter ───────────────┤
Customer drive ── USB ──> local USB file-selection adapter ────────────────────┤
                                                                             ▼
Touchscreen kiosk UI ──> local kiosk service ──> local document store
                             │                         │
                             ├── cash-acceptor         └── scan/price ──> printer
                             └── Online only: secure SaaS API for license,
                                 metadata sync, dashboard, and e-wallet provider
```

The **local kiosk service** owns the QR receive endpoint, authenticated local admin portal, hotspot control, encrypted local document store, printer, cash-controller, Bluetooth receive, and USB file-selection access. Every QR/Bluetooth/USB file follows the same local validation, scan, price, print, and deletion lifecycle. The **SaaS backend** owns first-install license activation, the online Operator configuration/dashboard, metadata synchronization, and authoritative e-wallet payment confirmation; it does **not** receive customer document files in either mode. The kiosk stores a verified license entitlement and published configuration locally for offline operation. The kiosk UI displays state but does not decide whether a payment is valid. Implement each input method and each hardware/payment connection behind a separate adapter so the UI and order logic do not depend on one device/vendor. Bluetooth file reception requires a tested native kiosk-side method; do not assume browser Web Bluetooth can receive arbitrary files from every phone.

The QR code points to a short-lived, job-specific **local kiosk address**. A customer's phone must be on the kiosk's local Wi-Fi/hotspot or reachable local network; the upload page explains how to connect. The kiosk validates the one-time session and writes the file to its local store without sending it through the public internet. The local receive service must not be exposed as a public internet upload endpoint.

For the first real hardware pilot, choose one laptop operating system, one printer model, one coin acceptor, one bill acceptor, and one controller/interface. Publish that tested profile before claiming broad hardware compatibility. Tablet support can be evaluated separately because peripheral access differs by platform.

## 7. Business rules and state models

### Price calculation

Store money as integer centavos. The order is: **choose print size, B&W/color, and number of copies → upload → scan → show final price → customer chooses Continue to payment or Cancel**. Scan the file before pricing to validate page count and detect embedded pictures, including count and printed area or dimensions where the file format permits. Base any image-size charge on the area the image occupies on the printed page, not merely its file size or pixel count. If a picture cannot be measured reliably, show that clearly and use a published fallback rule; do not imply the scan measured ink or toner exactly. The operator configures an understandable formula using page count, selected paper size and color mode, sides, applicable image-size/coverage bands, and disclosed fees. Calculate the price for **one complete copy** from the page-level charges, then multiply by the selected copy count; show both values and the final total. Allocate the final charge to individual page/copy units, including any applicable surcharge or fee, so the sum of units equals the total and an unprinted-unit refund is exact. For example, a three-page file at ₱5 per page costs ₱15 per copy; two copies cost ₱30. Recalculate if the file or choices change. Freeze a price snapshot only when the customer presses **Continue to payment**. Pressing **Cancel** deletes the unpaid order and temporary upload. A later operator price edit cannot change a confirmed order.

### Job states

`DRAFT → PREFERENCES_SELECTED → FILE_READY → SCANNING → PRICED → AWAITING_PAYMENT → PAID → QUEUED → PRINTING → COMPLETED`

Alternative terminal or recovery states: `CANCELED_UNPAID`, `PARTIALLY_FUNDED`, `PAYMENT_EXPIRED`, `PAYMENT_HELD_AFTER_TIMEOUT`, `INTERRUPTED`, `RECOVERING`, `HELD_AFTER_LONG_OUTAGE`, `FAILED_RECOVERABLE`, `REFUND_PENDING`, `REFUNDED`, `MANUAL_REVIEW`. Record every transition with time, kiosk ID, order ID, and cause. Print commands need an idempotency key so a retry or network replay does not accidentally print twice.

### Power-loss and interrupted-print recovery

Before accepting money or starting a paid print, persist the order, transaction reference, confirmed cash/e-wallet amounts, file reference, print settings, copy/page plan, current state, and the applicable outage window to durable local storage. Checkpoint each page or print unit as **pending**, **sent**, or **confirmed complete** using a printer/status signal that the chosen hardware can actually provide. On app start, inspect this ledger and calculate the outage duration before routing. Use persisted timestamps and a trustworthy time source; if duration cannot be established, use the long-outage hold path rather than silently losing a payment. Record the interruption, boot, checks, routing decision, and recovery/hold in the incident log. In the UI demo, the power-loss fault is triggered only from Smart Print Admin.

For an outage of **10 minutes or less by default** (or 5 minutes if configured), restore the existing transaction directly. If payment is incomplete, display the same order price, confirmed amount received, and remaining amount; accept only the unpaid balance. If an e-wallet transfer was pending during the outage, reconcile it with the payment provider before crediting it. If the job was already paid and printing, automatically run component checks and continue its print recovery. No new order, second charge, or power-loss refund is created.

For an outage **longer than the configured window**, route the kiosk to Welcome so a new customer can start. Mark the prior transaction `HELD_AFTER_LONG_OUTAGE`, keep its confirmed money and file/print status, stop automatic payment or print continuation, and alert the Operator. The previous customer can use **Recover previous transaction** with their reference and verification, or receive Operator assistance; the balance is never exposed or assigned to a different customer. Keep the transaction in the Operator's held list until it is claimed or resolved. Do not auto-refund merely because the outage lasted too long.

For the short-outage demo example, page 1 was being printed but had no completed-page checkpoint when power failed. On power return within the window, the same order is shown. The system treats page 1 as unfinished regardless of how much of that page reached the paper. It cancels any stale printer command, ejects or clears the partial sheet, marks that sheet as **discarded**, and automatically prints a fresh page 1, then pages 2 onward. A printer cannot reliably continue ink/toner placement halfway down the same physical sheet. “Continue” means **print a new copy of the interrupted page**, not resume within that sheet. If the printer cannot eject/clear the sheet or confirm it is ready, the kiosk waits on the same paid job and raises an Admin incident; it must not feed another sheet into a jam. Do not infer a physically completed sheet merely because a job was accepted by the operating system print queue. A page already marked confirmed complete is not reprinted.

The selected printer/driver must support a safe recovery procedure for clearing an unfinished sheet and preventing an old spool command from restarting alongside the replacement page. If that capability is unavailable, mark the hardware profile as unsuitable for automatic power-loss recovery. A missing completion acknowledgement can still cause an already-finished page to be reprinted; the implementation must test and document this limitation for the chosen printer rather than promise perfect duplicate prevention.

If the printer remains offline or failed after a short-outage reboot, stay on the interrupted-job screen with **Waiting for printer** or **Operator assistance required** and raise an Admin alert. When it returns to Ready, automatically recheck the page checkpoint, clear any unfinished sheet, and print a fresh copy of the page without a completion checkpoint. Never generate a new payment intent or print order during recovery. After a long outage, Welcome may appear while the old paid job remains held and visible to the Operator; it must not be mistaken for a completed, refunded, or forgotten transaction.

### Document cleanup after printing

Mark a job **COMPLETED** only after every requested page/copy unit is confirmed printed. Then remove Smart Print's local document, converted/preview files, and temporary spool copy where controllable, regardless of whether the file arrived by QR, Bluetooth, or USB. The SaaS cloud holds no document copy to clean up. Do not remove the customer's original from their phone or USB drive. Record a deletion timestamp/status without retaining the document contents. Show **File deleted from Smart Print** only after cleanup succeeds; if any managed copy remains, show cleanup pending internally, retry deletion, and alert the Operator if retries fail. The success screen may still confirm printing, but it must not falsely claim deletion.

Keep the file while a paid job is interrupted, recovering, or held after an outage so it can be finished. Delete an unpaid upload when the customer cancels or the unpaid session expires with no money received. If a transaction with money received remains unresolved, retain the document only under a disclosed, bounded retention policy and delete it after the case is completed or formally closed. Run periodic cleanup for orphan previews and temporary files so they do not accumulate. A later customer concern can use the job metadata; offering a reprint after completed-file deletion requires a fresh upload.

### Payment rules

- Cash: accepted value comes only from trusted controller events, never from an on-screen button in production. Record each accepted denomination and a transaction total. Once the confirmed total reaches or exceeds the price, stop further acceptance and mark the order paid; do not cancel or restart printing because the last denomination exceeded the remaining balance.
- Excess: calculate `change due = confirmed amount received − frozen order price` when positive. Keep that difference distinct from page charges and print-failure refunds. The demo follows the Operator's selected change scenario. Philippine production must provide exact change or prevent excess acceptance when change cannot be given.
- E-wallet: create a unique payment intent/reference per order. Confirm through a trusted backend/provider event; handle delayed, duplicate, and expired callbacks. Displaying or scanning a QR is not confirmation.
- Payment and printing are separate records linked by order ID. Confirmed cash accepted and e-wallet funds received must survive kiosk restart, including when the customer has not yet paid the full price. A paid order must be recoverable without charging again.
- Power loss alone never triggers a refund. Within the configured window, continue collecting only the remaining amount or resume printing. Beyond it, hold the old balance/job and show Welcome; require reference/identity verification before anyone reclaims the balance.
- A visible countdown governs each active cash/e-wallet payment attempt. Expiry does not erase confirmed funds; it closes the attempt and holds any partial balance. A short-outage recovery starts a fresh countdown while preserving the same transaction and amount received.
- Refunds require a defined process for each payment method. The per-kiosk automatic-refund toggle applies only after recovery fails; when enabled and supported, the refund amount is the sum of frozen charges for page/copy units not successfully printed, capped by the frozen order price. Cash uses the enabled change dispenser or, if change is disabled, a separate payout to the customer's chosen and confirmed e-wallet number. An e-wallet payment uses the original provider transaction to return money to the verified sending wallet/payment source, without destination entry. Refund/payout requests must be idempotent and confirmed before the UI reports success. Return any excess/change due separately, even if the print later fails. If the dispenser cannot return the exact amount, no destination was confirmed, or a provider cannot complete the requested route, keep an unresolved case and alert the Operator.

### Offline behavior

**First install is always Online:** the kiosk must reach the license service and download its initial published Operator configuration before serving customers. After that, Operator-selected Offline mode turns on the kiosk hotspot for local uploads and local admin access, but provides **no internet** to connected devices. It disables internet-dependent kiosk services and background cloud traffic to save data; an unexpected internet outage imposes the same provider/cloud limits even if Online was selected. A signed-in Operator can open the local portal through the hotspot without cloud access and switch the kiosk back to Online using a working internet uplink. **All three document inputs—local QR upload, Bluetooth, and USB—can work without internet** when the relevant local connection and storage are ready. E-wallet payments and provider-dependent refunds/payouts require Online mode and connectivity. Cash with a locally stored file may continue only if the kiosk can enforce its cached pricing/configuration, license grace, durable local records, and eventual reconciliation. Otherwise show **Temporarily unavailable** and block payment. Keep provider-dependent refunds and payouts pending until Online mode and connectivity return. New feature customization requires the online Operator dashboard; offline mode uses the last verified configuration. Never silently treat an offline e-wallet QR as paid.

## 8. Security and privacy requirements

| Area | Production requirement |
| --- | --- |
| Kiosk lockdown | Dedicated OS account; fullscreen kiosk mode; block access to desktop, browser navigation, file system, settings, and operator tools from customer view |
| Operator access | Unique accounts, role-based permissions, strong authentication, MFA for remote/admin access, login rate limits, short privileged sessions |
| Offline hotspot and local portal | Start the hotspot in Offline mode with internet sharing disabled; authenticate and authorize local Operator access using credentials provisioned during online setup, protect sessions and login attempts, separate customer upload routes from admin routes, and log local mode/uplink changes for later sync |
| Wi-Fi selection | Restrict scans, network selection, and credential entry to the protected first-install setup flow or authenticated Operators; store Wi-Fi passwords in the operating system's protected credential store, never in kiosk UI logs or SaaS metadata; verify internet and service reachability before enabling online-only payments or sync |
| File upload | Apply the same allowlisted types, size/page limits, content checks, generated filenames, isolated conversion/preview, and malware scanning where feasible to local QR, Bluetooth, and USB inputs; secure the local QR session and receive endpoint |
| Document privacy | Store customer document contents only on the kiosk laptop in both modes; encrypt the local working copy, isolate it by job, keep it out of SaaS sync and public URLs, delete it after confirmed successful printing, retain unresolved paid files only for a bounded period, and sync only minimal transaction metadata |
| USB | Restrict to supported document types; prevent execution and autorun; scan/validate files; do not expose local drives in customer UI |
| Bluetooth | Limit discoverability and pairing to the active customer session; require explicit receive approval/session matching; reject unexpected file types and sizes; remove pairing/session access afterward |
| Payments | Kiosk cannot mark e-wallet payment complete itself; verify provider events server-side; deduplicate callbacks; reconcile paid orders against provider records |
| Cash-to-e-wallet payout | Require a verified refund case and confirmed destination, protect the entered wallet number, use an idempotent payout request, and show success only after provider confirmation |
| Cash | Trust only authenticated/validated controller events where supported; detect disconnect/tamper conditions; stop accepting when printer cannot fulfill orders |
| Recovery integrity | Durable paid-job and per-page checkpoints; cancel stale spool commands, clear and record discarded partial sheets before reprinting the interrupted page; never charge twice or reprint a page already confirmed complete |
| Power and payment persistence | Save each confirmed cash denomination and e-wallet credit durably before showing it as received; preserve partial balances across restart; apply the 5/10-minute routing rule without deleting held funds |
| Held-balance access | Use a hard-to-guess claim reference and verification/rate limits before reopening a held transaction; never display its amount or document to an unverified new customer |
| Licensing and configuration | Require online first-install activation tied to kiosk identity; verify and cache the server-issued entitlement and versioned Operator configuration; enforce revocation and documented offline grace; never rely on a UI-only license check or accept money before setup completes |
| API and updates | HTTPS, authorization on every protected endpoint, secret storage outside UI code, signed software updates, controlled rollout and rollback |
| Audit and support | Log payment, print, license, pricing, refund, admin, device failure, and recovery events; alert on active incidents; persist logs across restart; redact document contents, secrets, access tokens, and sensitive personal data |

These are implementation requirements, not claims that the UI demo is secure. Security controls require backend, OS, device, and operational work beyond a clickable prototype. Relevant guidance: [OWASP File Upload](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), [Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [REST Security](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html), and [Logging](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html).

## 9. Suggested core records

| Record | Key fields |
| --- | --- |
| Organization | ID, name, owner, billing status |
| User | ID, organization, role, authentication status |
| Kiosk | ID, organization, device identity, license, software version, status |
| Network mode | Kiosk, Operator-selected Online/Offline mode, change time/actor, last successful sync, queued record count |
| Network connection | Kiosk, selected Wi-Fi network ID/SSID, signal and connection state, last scan/check time, internet/service reachability, error code; no plaintext password in application records |
| License | Key/ID, plan, valid dates, kiosk binding, activation/revocation history |
| Published configuration | Kiosk, version, prices/features/timers/hardware profile, published-by actor/time, local verification and last-applied time |
| Printer profile | Kiosk, model/driver, supported sizes/modes, readiness signals |
| Price rule | Kiosk, size, color, sides, base unit price, image-size/coverage bands, fees, effective date |
| Document | Job ID, safe filename, type, file size, page count, image count/printed area when measurable, encrypted storage reference, expiry, cleanup/deletion status and time |
| Order/job | ID, kiosk, claim reference, selected options, total and per-page/copy price snapshot, state, timestamps, outage window, recovery/hold status |
| Payment | ID, order, method, each confirmed cash/e-wallet amount, total received, remaining balance, excess/change due, change returned, change status, timer start/expiry, provider/controller reference, status, events |
| Change policy | Kiosk, automatic-change or demo-only no-change choice, supported payout methods, effective time, changed-by actor |
| Refund policy | Kiosk, automatic-refund toggle, supported methods, effective time, changed-by actor |
| Refund case | Order/payment, reason, unprinted page/copy units, frozen unit charges, calculated refund amount, route (cash dispenser / cash-to-e-wallet payout / original e-wallet transaction), request/reference, protected destination token or masked source if provided, status, resolution |
| Print attempt | ID, order, printer, command key, page/copy index, sent/confirmed checkpoint, status, errors |
| Component check | Kiosk, component, observed status, simulated status if demo, check time, fault cause |
| Incident event | ID, time, severity, kiosk, component, order reference, error code, impact, action, status, resolution time; no document content |
| Customer concern | ID, job/kiosk reference, time, issue category, optional description, status, maintenance action, resolution; optional contact stored separately |
| Audit event | Actor, action, target, time, outcome, redacted details |

## 10. Build sequence

1. **UI demo:** simulated device-side Wi-Fi scan and connection during first-install activation and later Online-mode selection, online Operator feature customization, mock QR/Bluetooth/USB transfers, simulated cash/e-wallet/printing, Smart Print Admin Scenario Lab, power-loss recovery, and component failure journeys.
2. **Connected foundation:** real license service and online Operator configuration publishing, with verified local license/configuration cache and setup gate.
3. **Local pilot:** kiosk service and secure local document store, local Wi-Fi/hotspot QR upload, one printer and cash-controller profile, durable per-page job ledger, startup recovery, tested USB and Bluetooth input, real print and fault handling using the cached configuration.
4. **Payment and fleet pilot:** e-wallet provider integration, metadata-only remote dashboard, audit and monitoring.
5. **Scale:** more validated hardware profiles, controlled updates, support tooling, and analytics.

### UI demo acceptance checklist

- A viewer can finish both cash and e-wallet journeys without explanation.
- A first-time install with no internet, invalid license, or missing published Operator configuration shows **Setup required** and cannot accept money; online activation and configuration publishing unlock the kiosk.
- First install and Operator Online-mode network settings show Wi-Fi networks found by the kiosk device, a password prompt where needed, Rescan, connecting/error states, and an internet/service check. A connected Wi-Fi network without internet does not mark the kiosk Online or unlock license activation.
- Offline mode is available only after successful first-install activation; it uses the last verified configuration, while feature customization remains in the online Operator dashboard.
- In Offline mode the hotspot turns on and a connected phone shows no internet access but can still upload by local QR. A signed-in Operator can open the local Operator dashboard over that hotspot, go to Settings → Network, switch from Offline to Online, select a scanned Wi-Fi network, and enter its password. Online services and queued metadata sync resume only after Wi-Fi, internet, and Smart Print service checks pass; a failed connection leaves the kiosk Offline. A customer joining the hotspot cannot see admin data or use mode controls.
- Welcome has no language selector; print size and B&W/color are requested before file upload.
- The first print-options screen requires a copy count (default 1) and enforces the Operator's maximum.
- File source screen offers QR, Bluetooth, and USB as supported options; each has a distinct simulated transfer flow and errors.
- Operator Offline mode keeps local QR/Bluetooth/USB uploads, cash, printing, and logs available when local checks pass; it disables e-wallet payment/payout, cloud sync, and updates. Switching Online restores connected services and synchronizes queued metadata without uploading document files.
- The demo shows the same local file storage and post-print deletion for QR, Bluetooth, and USB in both modes; QR uses a local Wi-Fi/hotspot connection rather than the public internet.
- After upload, the demo scans the document and shows page count, image count/available dimensions, and an itemized final price.
- With a three-page file at ₱5 per page and two copies, price review shows **₱15 per copy × 2 = ₱30 total**; per-page/copy charges add up to that total.
- Price review has working **Continue to payment** and **Cancel** paths; payment cannot start before Continue, and Cancel leaves no unpaid job active.
- Once calculated, every subsequent screen shows the order price and state consistently.
- The excess-payment demo accepts ₱20 for a ₱15 price and continues printing; it shows the ₱5 excess separately and follows the Operator's simulated change policy. **No change given** is labeled demo-only for Philippine deployment.
- The kiosk blocks payment when printer status is unavailable.
- A paid failed job remains visible for recovery.
- With the default 10-minute window, a simulated 2-minute outage during page 1 opens the **same paid job** directly; Welcome does not appear first, and payment is not requested again.
- A simulated 2-minute outage after ₱5 of a ₱10 price was accepted restores **₱5 received / ₱5 remaining**; no refund or reset of the accepted amount occurs.
- A simulated 11-minute outage opens Welcome but leaves the previous payment/job in a protected Operator-visible hold; it does not automatically print, refund, or give the balance to another customer.
- Cash and e-wallet screens show a visible countdown. Cash insertion refreshes its inactivity timer; expiry with a partial confirmed amount creates a recoverable hold instead of deleting the money. An e-wallet confirmation arriving near expiry is reconciled before the attempt is closed.
- The recovery demo shows the unfinished page being discarded, automatically prints a fresh copy of that page, then advances through remaining pages without an operator Resume action; if the sheet cannot be cleared, it waits and creates an Admin incident instead of feeding paper into a jam.
- Only Smart Print Admin can simulate Offline/Failed for the printer and other components, see the customer impact, restore normal status, and reset all simulations; Operator and customer views have no fault controls.
- Each simulated failure and automatic recovery creates an incident-log entry with severity, affected component/job, timeline, action taken, and final status; active incidents are prominent in Admin.
- Operator Sales Monitoring reflects completed cash/e-wallet demo payments, refunds, and recovering paid jobs; its totals and transaction rows agree with each other.
- A completed job shows **Printing successful** and lets the customer submit a line/poor-quality concern; the Operator sees the linked report and maintenance follow-up without changing the payment or print status automatically.
- After every requested copy completes, Smart Print deletes its managed document and previews, confirms deletion only after success, and retains the sales/job record without the file.
- The Operator refund toggle changes the simulated unrecoverable-failure outcome; with Toggle On and a supported method, the automatic refund equals only the frozen charges of unprinted page/copy units. The demo shows one completed and two unprinted ₱5 pages producing a ₱10 refund. Unsupported refunds and Toggle Off create visible unresolved cases, never a false **Refunded** state.
- With Automatic change and Automatic refund enabled, the cash refund demo dispenses that ₱10 through the change mechanism; the e-wallet demo sends the ₱10 partial refund through the original payment transaction to the verified sending wallet. Neither route reports **Refunded** before the payout/provider confirms it.
- With Automatic change Off and Automatic refund On, the cash-paid failure demo asks for a supported e-wallet and confirmed number, then shows the ₱10 payout as **Pending** until the simulated provider confirms it. The payout is tied to the same refund case and cannot be submitted twice.
- Operator screens require a mock sign-in and cannot be opened from normal customer controls.
- Demo controls and fictional data are clearly labeled.
- Both Operator and Smart Print Admin dashboards work at 320–430 px cellphone widths, including sales/incident review, network mode changes, fleet/license inspection, and Admin-only scenario run/reset. Tablet portrait and landscape, 1366×768 laptop, and 1920×1080 external touchscreen flows have no clipped controls or horizontal page overflow; touch, mouse, and keyboard interactions remain usable.

## 11. Decisions needed before hardware implementation

1. Target laptop operating system and external touchscreen resolution.
2. Printer model, paper sizes, duplex/color support, and how readiness is reported.
3. Coin acceptor, bill acceptor, controller interface, denomination set, and overpayment rejection capability.
4. Bluetooth receive method, supported phone platforms, pairing flow, and USB drive handling on the chosen laptop operating system.
5. Chosen e-wallet/payment provider and refund workflow.
6. Document formats, maximum file size/pages, and file retention time.
7. License term, activation transfer policy, and offline grace period.
8. Who handles customer support and cash refunds: operator, Smart Print, or both.

**Product decisions already made:** customers are asked to pay the exact amount, but the UI demo continues printing if excess money is received. The demo is UI only and must not imply that simulated payments, change returns, or printer actions are real. The requested **No change given** setting is demo-only for Philippine deployment pending a compliant production design.

## 12. Circuit + Paper Flow visual identity

Use a modern **blue/cyan technology palette with green/white paper and leaf tones**. It should feel connected, reliable, clean, and approachable while keeping customer instructions, prices, and system status easy to read on a public touchscreen. This visual theme replaces the earlier Philippine-inspired color palette; the product still uses Philippine peso prices and local payment examples.

| Role | Name | Hex | Use |
| --- | --- | --- | --- |
| Primary | Circuit Blue | `#155E8B` | Start printing, Continue, selected steps, links; white text |
| Dark feature surface | Deep Circuit Navy | `#0B1F33` | Welcome hero and selected technology panels |
| Deep text | Ink | `#102A43` | Headings, prices, and body text |
| Background | Paper White | `#F8FCFA` | Main kiosk and dashboard background |
| Surface | Clean White | `#FFFFFF` | Cards, forms, receipts, and price breakdown |
| Technology accent | Electric Cyan | `#22D3EE` | Sparse nodes/connection highlights on navy; not small text on white |
| Soft organic surface | Soft Mint | `#E8F5EF` | Leaf/paper illustrations and gentle section backgrounds |
| Success | Leaf Green | `#166534` | Paid, printing successful, connected status; white text |
| Alert | Alert Red | `#B4232D` | Errors, failed checks, printer unavailable; white text |

Keep the main customer action blue. Reserve cyan for decorative technology details, green for success/organic accents, and red for problems rather than routine navigation. Use mostly Paper White and Clean White surfaces to keep the interface calm. Status must always include words and icons, not color alone. The specified white-on-blue, white-on-red, white-on-green, dark-on-paper-white, and cyan-on-navy text combinations exceed the [WCAG 2.2 4.5:1 normal-text contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum); use cyan on navy chiefly for accents, not dense body copy.

### Circuit and paper-flow inspiration

Combine two complementary motifs in the UI demo. **Circuit board / digital grid** means thin geometric paths, sparse cyan/blue nodes, and quiet connection patterns that suggest QR, Bluetooth, USB, and kiosk networking. Use them chiefly on Welcome, input selection, and small system-status illustrations. **Leaf / paper flow** means smooth curves and layered sheets that suggest a document moving through printing; use them in print progress, success, and selected empty states. Leaf Green, Soft Mint, and Paper White soften the blue technology theme. Together they should feel futuristic, reliable, clean, and approachable.

Use motifs as restrained decoration, not as backgrounds behind prices, forms, error messages, or dense dashboard tables. Keep the same visual language on tablet, laptop, and cellphone layouts; simplify or remove decoration when space is tight. Any glow or motion must be subtle, short, and compatible with reduced-motion settings. The leaf motif is a design reference, **not** a claim that Smart Print is environmentally friendly or reduces paper use. Do not add Philippine flag colors, sun motifs, banig patterns, or other national imagery to this theme.
