# API security and setup

Copy `.env.example` to `.env` and provide database, session, SMTP, API-domain, results-directory, and CORS values. Use a random `SESSION_SECRET` of at least 32 characters in production and serve the API over HTTPS.

Run the API with `npm start`, use `npm run dev` locally, and run authorization tests with `npm test`.

Rotate credentials that were previously committed. Removing credentials from current source does not remove them from Git history. Uploaded files still use local disk, so use a persistent Node host or migrate uploads to object storage before serverless deployment.

Google OAuth must use the callback URL configured by `GOOGLE_CALLBACK_URL`. For live deployment, register this exact Authorized redirect URI in Google Cloud: `https://api.jntugv.edu.in/api/admins/auth/google/callback`. Add `https://admin.jntugv.edu.in` as an Authorized JavaScript origin. For local development, use `http://localhost:8888/api/admins/auth/google/callback` and localhost origins. Both Google and password login require a full `@jntugv.edu.in` email that is enabled in `admin_email_allowlist` and has a matching `admins.username` record.

For a legacy administrator whose username is not an email, run `npm run migrate-admin-email -- <current-username> <username@jntugv.edu.in>` once after the schema has initialized.
