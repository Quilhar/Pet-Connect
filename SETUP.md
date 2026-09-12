

The site uses the RescueGroups public API through the Netlify Function at `/api/rescue-groups`.

## Netlify deployment

1. Sign in at [app.netlify.com](https://app.netlify.com/) and open your site.
2. Select **Site configuration**.
3. Open **Environment variables** and choose **Add a variable**.
4. Set the key/name to `RESCUE_GROUPS_API_KEY`.
5. Paste your RescueGroups public API key into the value field. Keep the scope available to **Functions**.
6. Save the variable.
7. Select **Deploys > Trigger deploy > Deploy site**.
8. Test the deployed site over its `https://` URL.

## Local testing

1. Install the Netlify CLI: `npm install -g netlify-cli`.
2. Create a `.env` file in the project root.
3. Add `RESCUE_GROUPS_API_KEY=your-key` to that file.
4. Run `netlify dev` from the project folder.
5. Open the local URL printed by Netlify.

Do not open `index.html` directly or use Five Server. Those methods do not run the Netlify Function that proxies RescueGroups. The `.env` file is ignored by Git; never commit the real API key.

The search page sends species, sex, ZIP, and radius filters to the proxy. The detail page requests the selected RescueGroups animal by ID.
