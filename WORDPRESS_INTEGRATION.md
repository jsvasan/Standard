# WordPress Integration Guide
## Health Registration App - WordPress Installation

### Overview
This guide will help you integrate the Health Registration App into your WordPress website.

---

## Method 1: iFrame Embedding (Recommended)

### Step 1: Deploy Your App
1. Click the **"Deploy"** button in Emergent platform
2. Copy the deployment URL (e.g., `https://your-app.emergent.sh`)

### Step 2: Add to WordPress

#### Option A: Using HTML Block (WordPress 5.0+)
1. Go to your WordPress admin dashboard
2. Create a new page or edit existing page
3. Add a **Custom HTML** block
4. Paste this code:

```html
<div class="health-registration-app">
  <iframe 
    src="YOUR_DEPLOYED_APP_URL_HERE"
    width="100%"
    height="900px"
    frameborder="0"
    scrolling="auto"
    style="border: none; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"
    title="Health Registration">
  </iframe>
</div>

<style>
.health-registration-app {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 15px;
}

@media (max-width: 768px) {
  .health-registration-app iframe {
    height: 800px;
  }
}
</style>
```

5. Replace `YOUR_DEPLOYED_APP_URL_HERE` with your actual deployment URL
6. Publish the page

#### Option B: Using Shortcode (Requires Code Snippet Plugin)

1. Install **"Code Snippets"** plugin from WordPress repository
2. Go to **Snippets → Add New**
3. Add this code:

```php
<?php
// Health Registration App Shortcode
function health_registration_app_shortcode($atts) {
    $atts = shortcode_atts(array(
        'url' => 'YOUR_DEPLOYED_APP_URL_HERE',
        'height' => '900px',
    ), $atts);
    
    $output = '<div class="health-registration-app">';
    $output .= '<iframe ';
    $output .= 'src="' . esc_url($atts['url']) . '" ';
    $output .= 'width="100%" ';
    $output .= 'height="' . esc_attr($atts['height']) . '" ';
    $output .= 'frameborder="0" ';
    $output .= 'scrolling="auto" ';
    $output .= 'style="border: none; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);" ';
    $output .= 'title="Health Registration">';
    $output .= '</iframe>';
    $output .= '</div>';
    
    return $output;
}
add_shortcode('health_registration', 'health_registration_app_shortcode');

// Add custom styles
function health_registration_app_styles() {
    echo '<style>
    .health-registration-app {
        max-width: 1200px;
        margin: 20px auto;
        padding: 0 15px;
    }
    @media (max-width: 768px) {
        .health-registration-app iframe {
            height: 800px !important;
        }
    }
    </style>';
}
add_action('wp_head', 'health_registration_app_styles');
?>
```

4. Save and activate the snippet
5. Use shortcode in any page: `[health_registration]`

---

## Method 2: Direct Link Button

Add a button that opens the app in a new tab:

```html
<div style="text-align: center; margin: 40px 0;">
  <a href="YOUR_DEPLOYED_APP_URL_HERE" 
     target="_blank" 
     rel="noopener noreferrer"
     style="display: inline-block; background: #007AFF; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,122,255,0.3);">
    📋 Register for Health Services
  </a>
</div>
```

---

## Method 3: WordPress Plugin (Advanced)

Create a custom plugin file:

### File: `health-registration-plugin.php`

```php
<?php
/*
Plugin Name: Health Registration App
Plugin URI: https://yourwebsite.com
Description: Embeds the Health Registration App into WordPress
Version: 1.0.0
Author: Your Name
Author URI: https://yourwebsite.com
*/

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Register settings page
function health_reg_add_admin_menu() {
    add_options_page(
        'Health Registration Settings',
        'Health Registration',
        'manage_options',
        'health-registration',
        'health_reg_settings_page'
    );
}
add_action('admin_menu', 'health_reg_add_admin_menu');

// Settings page content
function health_reg_settings_page() {
    ?>
    <div class="wrap">
        <h1>Health Registration App Settings</h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('health_reg_settings');
            do_settings_sections('health-registration');
            submit_button();
            ?>
        </form>
        <hr>
        <h2>How to Use</h2>
        <p>Use this shortcode in any page or post:</p>
        <code>[health_registration]</code>
    </div>
    <?php
}

// Register settings
function health_reg_register_settings() {
    register_setting('health_reg_settings', 'health_reg_app_url');
    
    add_settings_section(
        'health_reg_main_section',
        'App Configuration',
        null,
        'health-registration'
    );
    
    add_settings_field(
        'health_reg_app_url',
        'App URL',
        'health_reg_app_url_field',
        'health-registration',
        'health_reg_main_section'
    );
}
add_action('admin_init', 'health_reg_register_settings');

// URL field callback
function health_reg_app_url_field() {
    $url = get_option('health_reg_app_url');
    echo '<input type="url" name="health_reg_app_url" value="' . esc_attr($url) . '" style="width: 100%; max-width: 500px;" placeholder="https://your-app-url.com" />';
    echo '<p class="description">Enter your deployed Health Registration App URL</p>';
}

// Shortcode
function health_registration_shortcode($atts) {
    $url = get_option('health_reg_app_url');
    
    if (empty($url)) {
        return '<div style="padding: 20px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 5px;">Please configure the Health Registration App URL in Settings → Health Registration</div>';
    }
    
    $atts = shortcode_atts(array(
        'height' => '900px',
    ), $atts);
    
    ob_start();
    ?>
    <div class="health-registration-app-container">
        <iframe 
            src="<?php echo esc_url($url); ?>"
            width="100%"
            height="<?php echo esc_attr($atts['height']); ?>"
            frameborder="0"
            scrolling="auto"
            style="border: none; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"
            title="Health Registration App"
            loading="lazy">
        </iframe>
    </div>
    <style>
        .health-registration-app-container {
            max-width: 1200px;
            margin: 20px auto;
            padding: 0 15px;
        }
        @media (max-width: 768px) {
            .health-registration-app-container iframe {
                height: 800px !important;
            }
        }
    </style>
    <?php
    return ob_get_clean();
}
add_shortcode('health_registration', 'health_registration_shortcode');

// Add admin page link to view registrations
function health_reg_view_registrations_menu() {
    add_menu_page(
        'Health Registrations',
        'Health Registrations',
        'manage_options',
        'health-registrations-view',
        'health_reg_view_page',
        'dashicons-list-view',
        30
    );
}
add_action('admin_menu', 'health_reg_view_registrations_menu');

function health_reg_view_page() {
    $app_url = get_option('health_reg_app_url');
    $admin_url = $app_url ? rtrim($app_url, '/') . '/registrations' : '';
    ?>
    <div class="wrap">
        <h1>Health Registrations</h1>
        <?php if ($admin_url): ?>
            <p><a href="<?php echo esc_url($admin_url); ?>" target="_blank" class="button button-primary">View All Registrations</a></p>
            <p>Access the admin panel to view and manage all health registrations.</p>
        <?php else: ?>
            <p style="color: #d63638;">Please configure the app URL in Settings → Health Registration first.</p>
        <?php endif; ?>
    </div>
    <?php
}
?>
```

### To Install the Plugin:

1. Save the above code as `health-registration-plugin.php`
2. Create a folder named `health-registration-app`
3. Put the PHP file inside the folder
4. Zip the folder: `health-registration-app.zip`
5. Go to WordPress: **Plugins → Add New → Upload Plugin**
6. Upload the zip file and activate
7. Go to **Settings → Health Registration**
8. Enter your deployed app URL
9. Use shortcode `[health_registration]` in any page

---

## Troubleshooting

### iFrame Not Loading
- Check if your deployment URL is correct
- Ensure your app allows iframe embedding (check CORS settings)
- Try opening the app URL directly in a browser first

### Height Issues
- Adjust the `height` parameter in the iframe
- For mobile: Use media queries to set appropriate heights

### Admin Setup
- Make sure to register an admin first at: `/admin-setup` route
- Admin will receive email notifications for all registrations

---

## Next Steps After Installation

1. **Test the Form**: Submit a test registration
2. **Check Admin Email**: Verify email notifications are working
3. **Customize Appearance**: Adjust iframe height and styling as needed
4. **Add Navigation**: Create menu links to the registration page

---

## Support

For deployment URL or technical issues, contact your app administrator.

**Current Admin Email**: jsvasan.ab@gmail.com (receives all registration notifications)
