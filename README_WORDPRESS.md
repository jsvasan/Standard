# 📦 WordPress Plugin Package - Health Registration App

## Download Package Contents

This package contains everything you need to integrate the Health Registration App into your WordPress website.

---

## 📥 Files Included

1. **health-registration-plugin.php** - The WordPress plugin file
2. **WORDPRESS_INTEGRATION.md** - Detailed integration guide
3. **README_WORDPRESS.md** - This file

---

## 🚀 Quick Start Installation

### Step 1: Download the Plugin File

The plugin file is located at:
```
/app/health-registration-plugin.php
```

You can download it using the Emergent interface or save to GitHub.

### Step 2: Create Plugin Package

1. Create a new folder named: `health-registration-app`
2. Copy `health-registration-plugin.php` into this folder
3. Zip the folder to create: `health-registration-app.zip`

### Step 3: Install in WordPress

1. Log in to your WordPress admin dashboard
2. Go to **Plugins → Add New**
3. Click **Upload Plugin** button
4. Choose the `health-registration-app.zip` file
5. Click **Install Now**
6. Click **Activate** after installation

---

## ⚙️ Configuration

### Step 1: Deploy Your App

Before using the plugin, you need to deploy your Health Registration App:

1. In Emergent platform, click the **"Deploy"** button
2. Wait for deployment to complete
3. Copy the deployment URL (e.g., `https://your-app.emergent.sh`)

### Step 2: Configure Plugin

1. In WordPress, go to **Settings → Health Registration**
2. Paste your deployment URL in the "App URL" field
3. Click **Save Settings**

---

## 📝 Usage

### Add Registration Form to Any Page

Use this shortcode in any WordPress page or post:

```
[health_registration]
```

### Custom Height

Adjust iframe height (default is 900px):

```
[health_registration height="1000px"]
```

### Example Page Setup

1. Create a new page: **Pages → Add New**
2. Title: "Health Registration"
3. Add the shortcode: `[health_registration]`
4. Publish the page

---

## 🎯 Features

✅ **Registration Form**
- Personal health information with age calculation
- Blood group dropdown selection
- 1-2 buddies (collapsible, dynamic)
- 1-3 next of kin contacts (dynamic)
- Form validation and error handling

✅ **Admin Features**
- Email notifications for new registrations
- View all registrations dashboard
- Export single or all registrations
- Mobile and desktop responsive

✅ **WordPress Integration**
- Easy shortcode implementation
- Settings page for configuration
- Admin menu for quick access
- Responsive iframe embedding

---

## 📧 Email Notifications

All new registrations are automatically emailed to:
**jsvasan.ab@gmail.com**

Email includes:
- Complete personal health information
- Buddies details
- Next of kin contacts
- Formatted in HTML for easy reading

---

## 🔧 Admin Setup

### First-Time Setup

1. Navigate to `/admin-setup` on your deployed app URL
2. Register the admin with:
   - Name
   - Mobile/Phone
   - Email
3. Only ONE admin can be registered
4. Admin receives all email notifications

---

## 📱 Mobile Access

The registration form is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile phones
- Works in WordPress iframes

---

## 🎨 Customization

### Styling

The plugin includes default styles that match most WordPress themes. To customize:

1. Add custom CSS to your theme's `style.css`:

```css
.health-registration-app-container {
    /* Your custom styles */
}

.health-registration-app-container iframe {
    /* Iframe custom styles */
}
```

### Alternative Integration Methods

If you prefer not to use the plugin, see `WORDPRESS_INTEGRATION.md` for:
- Direct iframe embedding
- Custom HTML blocks
- Link buttons
- Advanced customization

---

## 🔍 Viewing Registrations

### From WordPress Admin

1. Go to **Registrations** in the WordPress admin menu
2. Click **View All Registrations**
3. Opens the registrations dashboard in a new tab

### Features Available

- View complete list of all registrations
- Expandable cards with details
- Export individual registrations (formatted for WhatsApp)
- Export all registrations at once
- Search and filter capabilities

---

## 🆘 Troubleshooting

### Plugin Not Working?

**Check Configuration:**
- Ensure app URL is correctly entered in Settings
- Verify deployment is active
- Test the app URL directly in browser

**iFrame Not Loading:**
- Check browser console for errors
- Disable browser extensions temporarily
- Try different browser
- Ensure deployment URL is accessible

**Email Not Sending:**
- Verify Gmail credentials are correct
- Check spam folder
- Ensure admin is registered at `/admin-setup`

### Common Issues

**Issue:** "App Not Configured" message
**Solution:** Go to Settings → Health Registration and enter your deployment URL

**Issue:** Iframe shows blank
**Solution:** Check if deployment URL works when opened directly

**Issue:** Form not responsive on mobile
**Solution:** Adjust iframe height parameter in shortcode

---

## 📊 Data Storage

- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **Frontend:** Expo React Native (Web compatible)
- All data is stored securely in MongoDB
- Unique phone number prevents duplicate registrations

---

## 🔐 Security

- Phone number uniqueness validation
- Email format validation
- Form input sanitization
- Secure iframe embedding
- Admin-only email notifications

---

## 🆕 Updates

To update the plugin:

1. Download the latest version
2. Go to **Plugins → Installed Plugins**
3. Deactivate the current version
4. Delete the old plugin
5. Install the new version
6. Reactivate

(Settings and configuration are preserved)

---

## 📞 Support & Resources

### Files Location
- Plugin file: `/app/health-registration-plugin.php`
- Integration guide: `/app/WORDPRESS_INTEGRATION.md`
- This README: `/app/README_WORDPRESS.md`

### Deployment
- Use Emergent's **Deploy** button
- Get deployment URL
- Configure in WordPress settings

### Need Help?
- Check `WORDPRESS_INTEGRATION.md` for detailed guides
- Review troubleshooting section above
- Test deployment URL directly before integrating

---

## ✨ Features Summary

| Feature | Status |
|---------|--------|
| WordPress Plugin | ✅ Ready |
| Email Notifications | ✅ Configured |
| Mobile Responsive | ✅ Yes |
| Admin Dashboard | ✅ Included |
| Export Functionality | ✅ Yes |
| Unique Phone Validation | ✅ Yes |
| Age Calculation | ✅ Automatic |
| Collapsible Sections | ✅ Yes |

---

## 📝 Version

**Version:** 1.0.0
**Last Updated:** 2025
**Compatibility:** WordPress 5.0+
**License:** GPL v2 or later

---

## 🎉 You're All Set!

Your Health Registration App is ready to be integrated into WordPress. Follow the steps above and you'll be collecting registrations in minutes!

**Next Steps:**
1. Deploy your app in Emergent
2. Install the WordPress plugin
3. Configure the app URL
4. Add shortcode to a page
5. Start collecting registrations!

Good luck! 🚀
