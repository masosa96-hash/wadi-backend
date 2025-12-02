# Deployment Guide (Copy-Paste Ready)

## Railway (Backend)

1. Open `apps/api/.env.railway.example` in this repo.
2. Go to your Railway project -> Select the Service -> **Variables**.
3. For each line in the example file, create a variable with the same NAME.
4. Paste the correct values:
   - **SUPABASE\_...**: Get these from Supabase -> Settings -> API.
   - **JWT_SECRET**: Use the "JWT Secret" from Supabase -> Settings -> API.
   - **GROQ_API_KEY**: Your Groq API key.
   - **FRONTEND_URL**: Initially you can put `http://localhost:5173` or a placeholder, but once Vercel is deployed, come back and update this to the real Vercel URL.
5. Redeploy the Railway service.
6. After deploy, copy the public backend URL (e.g., `https://your-app.up.railway.app`).

## Vercel (Frontend)

1. Open `apps/frontend/.env.vercel.example` in this repo.
2. Go to Vercel -> Project -> Settings -> **Environment Variables**.
3. Add variables for **Production** (and Preview/Development if you want):
   - **VITE_SUPABASE_URL** & **VITE_SUPABASE_ANON_KEY**: Same as backend.
   - **VITE_API_URL**: Paste the **Railway backend URL** from the previous step.
   - **VITE_GUEST_MODE**: Set to `true`.
4. Deploy the frontend on Vercel.
5. Copy the public URL (e.g., `https://your-frontend.vercel.app`).

## Final Cross-Check

1. **Update Backend**: Go back to Railway -> Variables.
2. Update `FRONTEND_URL` to match your new Vercel URL.
3. Redeploy Railway.
4. **Verify**:
   - Visit the Vercel URL in a browser.
   - The app should load.
   - Try sending a message (Guest Mode). It should work without errors.
