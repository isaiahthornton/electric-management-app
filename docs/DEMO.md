# Five-minute demo script

**Audience:** client (ConEd, P&R) and trainers. **Goal:** show a real three-tier app, a clear customer story, an admin story with live insight, and proof that security is enforced by the server.

## Before you start (5 minutes ahead)

- [ ] Open the live site once so the free database wakes up (the first request can take 30 seconds or more): https://thornton-energy-web-drg8hqcqeudndtf9.centralus-01.azurewebsites.net
- [ ] Have two browser windows: one for the customer (Jane) and one for the admin (use a private window so the two logins do not share session storage)
- [ ] Have a terminal open for the security proof (curl commands below)
- [ ] Know the permanent step: **paying a bill cannot be undone** (Jane has one unpaid bill). Everything else in this script can be reversed.
- [ ] Logins: Jane `jane@example.com` / `jane123`, Admin `support@thornenergy.com` / `admin123`

## 0:00 to 0:30. Opening (landing page)

> "Thornton Energy is an electric utility app. v1 was a front-end prototype on a mock API. v2 is a real three-tier system on Azure: an Angular front end, an ASP.NET Core API, and an Azure SQL database."

Point out the public rate plans on the landing page: they come from the API with no login.

## 0:30 to 2:00. Customer story (Jane)

1. **Log in as Jane.** "The API checked a hashed password and returned a signed token. The browser attaches it to every call."
2. **Dashboard:** balance due, usage vs last month, the active outage banner, and the map of her service location. "The dot is amber because her outage is in progress."
3. **Rate Plans:** show the estimate for her real usage. (You can switch plan and switch back; it is reversible.)
4. **Billing:** open the unpaid bill and click **Pay Now**. "The server sets the payment date and refuses a second payment." Balance becomes $0.

> Say: "The browser never decides money or dates. The server prices bills from the rate plan and stamps the times."

## 2:00 to 3:45. Admin story

1. **Log in as the admin** in the other window.
2. **Dashboard (KPIs):** active customers, unpaid and overdue balance, revenue this month, open outages, average usage. "These six numbers come from a SQL view, and the monthly chart from a stored procedure, so the database does the maths."
3. **Activity:** the payment Jane just made is at the top: *Bill, status, Unpaid to Paid, by jane@example.com*. "A database trigger wrote that, not the application code, so even a direct SQL edit would be caught. The user comes from the signed-in session."
4. **Outage Map:** red, amber and green dots; click one for customer, address, time and status.
5. **Outages queue:** move the red outage (Robert Chen) to **Resolved** and go back to the map: the dot turns green. (Reversible: move it back to Reported.) Check **Activity** again for the new row.

## 3:45 to 4:30. Security proof (401 and 403)

Run these in PowerShell (it logs in as Jane first and keeps her token in `$token`).

```powershell
$api = "https://thornton-energy-api-f2hcgjatdwfzdje5.centralus-01.azurewebsites.net/api"
$token = (Invoke-RestMethod "$api/auth/login" -Method Post -ContentType "application/json" `
  -Body '{"email":"jane@example.com","password":"jane123"}').token

# 401: no token at all
curl.exe -i "$api/bills"

# 403: Jane is signed in, but customers cannot use admin endpoints
curl.exe -i -H "Authorization: Bearer $token" "$api/admin/kpis"

# 403: Jane asks for another customer's bills
curl.exe -i -H "Authorization: Bearer $token" "$api/bills?customerId=2"
```

Also show it in the browser: while signed in as Jane, type `/admin` in the address bar. The guard sends her back to her own portal, and even if she bypassed the front end, the API would answer 403.

> Say: "Security is enforced on the server: login, roles and per-customer ownership. Hiding a menu item is not security."

For a local walkthrough with Swagger (the Authorize button and every endpoint), run the API in Development and open https://localhost:7159/swagger. Swagger is turned off on the live site.

## 4:30 to 5:00. Architecture and close

Show the diagram from the README (or `docs/ARCHITECTURE.md`):

`Browser -> interceptor -> middleware -> auth -> controller -> service -> repository -> DbContext -> SQL`

> "Each layer has one job. Controllers only speak HTTP, services hold the business rules, the repository talks to the database. That is what makes it testable: there are 80 server tests and 74 front-end tests, including integration tests that boot the whole API and check the 401 and 403 rules. Running cost is zero: free Azure tiers and OpenStreetMap."

Mention how AI was used (`docs/AI-LOG.md`): it helped write the SQL and documents, and each item records what was checked and corrected.

## If something goes wrong

| Symptom | Fix |
|---|---|
| First page hangs for 30+ seconds | The free database was asleep; wait, then reload |
| "Could not load..." message right after waking | Reload once |
| Pay Now already used | Pay with a different account, or show the already-paid bill and the Activity row instead |
| Map shows no tiles | Check the internet connection (tiles come from OpenStreetMap) |
| Live site down | Run locally: API with `dotnet run --launch-profile https` and the front end with `npm start` (see the README) |

## What changes the data (so you know what to expect next time)

| Step | Reversible? |
|---|---|
| Pay a bill | No |
| Switch rate plan | Yes, switch back |
| Resolve an outage | Yes, move it back to Reported or In progress |
| Contact form message | It stays in the inbox |
| Register a new user | It stays (use only if you need to show registration) |
