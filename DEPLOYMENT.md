# Deployment Guide for Chronos CRM

## Common Issue: Blank Page After Deployment

If you see a blank page after deploying, it's because React Router needs server-side configuration to handle client-side routing.

## Quick Fixes by Platform

### Netlify
✅ Already configured! The `public/_redirects` file handles SPA routing automatically.

### Vercel
✅ Already configured! The `vercel.json` file handles SPA routing automatically.

### Apache / cPanel / Shared Hosting
✅ Already configured! The `public/.htaccess` file handles SPA routing.

**Important:** Make sure `.htaccess` is uploaded to your server root directory.

### Other Platforms

#### Nginx
Add to your nginx config:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

#### Express.js
```javascript
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

## Build and Deploy Steps

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Test locally:**
   ```bash
   npm run preview
   ```

3. **Deploy the `dist/` folder** to your hosting provider

## Environment Variables (For Supabase)

If using Supabase, make sure to set these environment variables on your hosting platform:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Platform-Specific Instructions:

**Netlify:**
- Go to Site Settings → Build & deploy → Environment
- Add variables there

**Vercel:**
- Go to Project Settings → Environment Variables
- Add variables there

**cPanel/Shared Hosting:**
- Create a `.env` file in your root directory (NEVER commit this to Git!)
- Add the variables there

## Troubleshooting

### Still seeing a blank page?

1. **Check browser console** (F12) for errors
2. **Check asset paths** - If deployed to a subdirectory, you may need to update `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/your-subdirectory/',
     // ...
   })
   ```

3. **Check if files are loading**:
   - Open browser DevTools → Network tab
   - Refresh the page
   - Look for 404 errors on JS/CSS files

4. **Clear browser cache** and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Common Errors

**"Failed to load module script"**
- Your server isn't serving files with correct MIME types
- Add to `.htaccess`: `AddType application/javascript .js`

**White screen, no errors in console**
- React Router can't find a route
- Check that server redirects all routes to `/index.html`

**Assets return 404**
- You're deployed to a subdirectory
- Update `base` in `vite.config.ts`

## Testing Deployment Locally

```bash
npm run build
npm run preview
```

Open `http://localhost:4173` and test:
- Navigate to `/transactions`
- Refresh the page (should NOT 404)
- Navigate to `/tasks`
- Refresh again (should NOT 404)

If these work locally but not on your server, it's a server configuration issue.
