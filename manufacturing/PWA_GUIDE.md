# PWA Setup Guide

## What's Been Added

Your app is now a Progressive Web App (PWA) with the following features:

### 1. **manifest.json** (`public/manifest.json`)
- App name: "Hardware ERP Manufacturing"
- Theme color: Blue (#2563eb)
- Standalone display mode (app-like experience)
- App shortcuts for quick access to Order, Process, and Reports
- Icon sizes: 192x192 and 512x512

### 2. **Service Worker** (`public/sw.js`)
- Offline caching for core assets
- Cache versioning for updates
- Network-first fallback strategy

### 3. **PWA Meta Tags** (`index.html`)
- Theme color for browser UI
- Apple mobile web app support
- Manifest link
- Description for SEO

### 4. **Service Worker Registration** (`src/main.tsx`)
- Automatic registration on app load
- Console logging for debugging

### 5. **Vite Optimization** (`vite.config.ts`)
- Code splitting for better performance
- React vendor chunk
- Lucide icons chunk

## Next Steps

### 1. Create App Icons
You need to add icon files to the `public` folder:
- `icon-192x192.png` - 192x192 pixels
- `icon-512x512.png` - 512x512 pixels

**Quick way to create icons:**
1. Use any image editor (Canva, Figma, Photoshop)
2. Create a square icon with your logo
3. Export in both sizes as PNG
4. Place in the `public` folder

### 2. Test PWA Locally
```bash
npm run dev
```
Open Chrome DevTools → Application tab:
- Check "Manifest" section to see PWA details
- Check "Service Workers" to see if registered
- Check "Storage" → "Cache Storage" to see cached files

### 3. Test PWA Features
- **Install**: Click the install icon in browser address bar
- **Offline**: Turn off network and reload - should still work
- **Add to Home Screen**: On mobile, add to home screen
- **Shortcuts**: Long-press app icon to see shortcuts

### 4. Deploy PWA
When deploying to Firebase or any host:
```bash
npm run build
firebase deploy
```

The PWA will work automatically after deployment.

## PWA Benefits

✅ **Installable** - Can be installed on desktop and mobile
✅ **Offline Support** - Works without internet
✅ **Fast Loading** - Cached assets load instantly
✅ **App-like Experience** - Full screen, no browser UI
✅ **Push Notifications** - Ready for future implementation
✅ **Better SEO** - Indexed by search engines
✅ **Cross-Platform** - Works on iOS, Android, Desktop

## Troubleshooting

**Icons not showing?**
- Make sure icon files exist in `public/` folder
- Check file names match exactly: `icon-192x192.png`, `icon-512x512.png`

**Service Worker not registering?**
- Check browser console for errors
- Ensure you're running on HTTPS or localhost
- Clear cache and reload

**PWA not installable?**
- Must be served over HTTPS (except localhost)
- Check manifest.json is valid in DevTools
- Ensure icons are present and correct size

**Offline not working?**
- Check Service Worker is active in DevTools
- Verify cache is populated
- Check network tab for failed requests

## Advanced Features (Optional)

### Add Push Notifications
Install `@vite-pwa/plugin` for advanced PWA features:
```bash
npm install -D vite-plugin-pwa
```

Update `vite.config.ts`:
```typescript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  // ... rest of config
})
```

### Add Update Notification
Add an in-app notification when new version is available.

## Testing Checklist

- [ ] Icons display correctly
- [ ] Manifest loads in DevTools
- [ ] Service Worker registers
- [ ] App can be installed
- [ ] Works offline
- [ ] Shortcuts work on mobile
- [ ] Theme color matches design
