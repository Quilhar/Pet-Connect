# PetConnect API setup

The site now uses the RescueGroups public API through the Netlify function at `/api/rescue-groups`.

1. Deploy this folder to Netlify.
2. In Netlify, open **Site configuration > Environment variables**.
3. Add `RESCUE_GROUPS_API_KEY` with the RescueGroups API key as its value.
4. Redeploy the site.

Do not put the API key in HTML, browser JavaScript, or a committed `.env` file. GitHub Pages and other static-only hosts cannot securely run this integration because they do not provide a server-side environment for the key.

The search page sends species, sex, distance, and ZIP filters to the proxy. The detail page requests the selected RescueGroups animal by ID.
