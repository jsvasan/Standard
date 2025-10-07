<?php
/*
Plugin Name: Health Registration App
Plugin URI: https://yourwebsite.com
Description: Embeds the Health Registration App into WordPress for collecting health information with buddy and next of kin details
Version: 1.0.0
Author: Your Name
Author URI: https://yourwebsite.com
License: GPL v2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Text Domain: health-registration
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
    // Save settings if form submitted
    if (isset($_POST['health_reg_save_settings'])) {
        check_admin_referer('health_reg_settings_action');
        update_option('health_reg_app_url', sanitize_url($_POST['health_reg_app_url']));
        echo '<div class="notice notice-success"><p>Settings saved successfully!</p></div>';
    }
    
    $app_url = get_option('health_reg_app_url', '');
    ?>
    <div class="wrap">
        <h1>Health Registration App Settings</h1>
        <form method="post" action="">
            <?php wp_nonce_field('health_reg_settings_action'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="health_reg_app_url">App URL</label>
                    </th>
                    <td>
                        <input 
                            type="url" 
                            id="health_reg_app_url"
                            name="health_reg_app_url" 
                            value="<?php echo esc_attr($app_url); ?>" 
                            class="regular-text"
                            placeholder="https://your-deployed-app-url.com"
                            required
                        />
                        <p class="description">
                            Enter your deployed Health Registration App URL from Emergent platform
                        </p>
                    </td>
                </tr>
            </table>
            <?php submit_button('Save Settings', 'primary', 'health_reg_save_settings'); ?>
        </form>
        
        <hr style="margin: 40px 0;">
        
        <h2>How to Use</h2>
        <div style="background: #fff; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
            <h3>Step 1: Configure App URL</h3>
            <p>Enter your deployed app URL in the field above and save.</p>
            
            <h3>Step 2: Add to Any Page</h3>
            <p>Use this shortcode in any WordPress page or post:</p>
            <code style="background: #f0f0f0; padding: 10px; display: block; margin: 10px 0;">[health_registration]</code>
            
            <h3>Step 3: Customize Height (Optional)</h3>
            <p>Adjust iframe height by adding height parameter:</p>
            <code style="background: #f0f0f0; padding: 10px; display: block; margin: 10px 0;">[health_registration height="1000px"]</code>
            
            <h3>Features</h3>
            <ul style="list-style: disc; margin-left: 20px;">
                <li>✅ Collapsible registration form with personal health info</li>
                <li>✅ Blood group dropdown selection</li>
                <li>✅ 1-2 buddies registration (collapsible)</li>
                <li>✅ 1-3 next of kin contacts (dynamic)</li>
                <li>✅ Email notifications to admin</li>
                <li>✅ Unique phone number validation</li>
                <li>✅ Age calculation from date of birth</li>
                <li>✅ Mobile and desktop responsive</li>
            </ul>
        </div>
        
        <hr style="margin: 40px 0;">
        
        <h2>Need Help?</h2>
        <div style="background: #e7f3ff; padding: 15px; border-left: 4px solid #007AFF; border-radius: 3px;">
            <h4 style="margin-top: 0;">Deployment Instructions</h4>
            <ol>
                <li>Go to your Emergent platform dashboard</li>
                <li>Click the <strong>"Deploy"</strong> button</li>
                <li>Copy the deployment URL provided</li>
                <li>Paste it in the "App URL" field above</li>
                <li>Save settings and use the shortcode!</li>
            </ol>
        </div>
    </div>
    <?php
}

// Shortcode function
function health_registration_shortcode($atts) {
    $url = get_option('health_reg_app_url');
    
    // Check if URL is configured
    if (empty($url)) {
        if (current_user_can('manage_options')) {
            return '<div style="padding: 20px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; margin: 20px 0;">
                <strong>⚠️ Health Registration App Not Configured</strong><br>
                Please go to <a href="' . admin_url('options-general.php?page=health-registration') . '">Settings → Health Registration</a> to configure the app URL.
            </div>';
        }
        return '<div style="padding: 20px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; margin: 20px 0;">
            The Health Registration App is temporarily unavailable. Please contact the administrator.
        </div>';
    }
    
    // Parse shortcode attributes
    $atts = shortcode_atts(array(
        'height' => '900px',
        'width' => '100%',
    ), $atts);
    
    // Generate unique ID for this instance
    $iframe_id = 'health-reg-' . uniqid();
    
    // Output the iframe
    ob_start();
    ?>
    <div class="health-registration-app-container">
        <div class="health-registration-loading" id="loading-<?php echo $iframe_id; ?>">
            <p>Loading Health Registration Form...</p>
        </div>
        <iframe 
            id="<?php echo $iframe_id; ?>"
            src="<?php echo esc_url($url); ?>"
            width="<?php echo esc_attr($atts['width']); ?>"
            height="<?php echo esc_attr($atts['height']); ?>"
            frameborder="0"
            scrolling="auto"
            style="border: none; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: none;"
            title="Health Registration App"
            loading="lazy"
            allowfullscreen>
        </iframe>
    </div>
    
    <script>
    (function() {
        var iframe = document.getElementById('<?php echo $iframe_id; ?>');
        var loading = document.getElementById('loading-<?php echo $iframe_id; ?>');
        
        iframe.addEventListener('load', function() {
            loading.style.display = 'none';
            iframe.style.display = 'block';
        });
        
        // Timeout fallback
        setTimeout(function() {
            loading.style.display = 'none';
            iframe.style.display = 'block';
        }, 5000);
    })();
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('health_registration', 'health_registration_shortcode');

// Add custom styles to frontend
function health_registration_frontend_styles() {
    ?>
    <style>
        .health-registration-app-container {
            max-width: 1200px;
            margin: 20px auto;
            padding: 0 15px;
            position: relative;
        }
        
        .health-registration-loading {
            text-align: center;
            padding: 60px 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 2px dashed #dee2e6;
        }
        
        .health-registration-loading p {
            margin: 0;
            font-size: 16px;
            color: #6c757d;
        }
        
        @media (max-width: 768px) {
            .health-registration-app-container iframe {
                height: 800px !important;
            }
        }
        
        @media (max-width: 480px) {
            .health-registration-app-container {
                padding: 0;
            }
            .health-registration-app-container iframe {
                border-radius: 0;
            }
        }
    </style>
    <?php
}
add_action('wp_head', 'health_registration_frontend_styles');

// Add admin menu item for quick access to registrations
function health_reg_admin_menu() {
    add_menu_page(
        'Health Registrations',
        'Registrations',
        'manage_options',
        'health-registrations-view',
        'health_reg_view_page',
        'dashicons-clipboard',
        30
    );
}
add_action('admin_menu', 'health_reg_admin_menu');

// View registrations page
function health_reg_view_page() {
    $app_url = get_option('health_reg_app_url');
    $registrations_url = $app_url ? rtrim($app_url, '/') . '/registrations' : '';
    ?>
    <div class="wrap">
        <h1>View Health Registrations</h1>
        
        <?php if ($registrations_url): ?>
            <div style="background: #fff; padding: 20px; border: 1px solid #ccc; border-radius: 5px; margin: 20px 0;">
                <p style="font-size: 16px;">Access the admin panel to view and manage all health registrations.</p>
                
                <p>
                    <a href="<?php echo esc_url($registrations_url); ?>" 
                       target="_blank" 
                       class="button button-primary button-large"
                       style="font-size: 16px;">
                        📋 View All Registrations
                    </a>
                </p>
                
                <hr style="margin: 30px 0;">
                
                <h3>Features Available:</h3>
                <ul style="list-style: disc; margin-left: 20px; line-height: 1.8;">
                    <li>View complete list of all registrations</li>
                    <li>Expandable cards with detailed information</li>
                    <li>Export single registration (formatted for WhatsApp)</li>
                    <li>Export all registrations at once</li>
                    <li>Search and filter capabilities</li>
                </ul>
                
                <hr style="margin: 30px 0;">
                
                <h3>Admin Email Notifications:</h3>
                <p>All new registrations are automatically sent to: <strong>jsvasan.ab@gmail.com</strong></p>
                <p style="color: #666; font-style: italic;">Email includes complete registration details with personal info, buddies, and next of kin contacts.</p>
            </div>
        <?php else: ?>
            <div class="notice notice-error" style="padding: 20px;">
                <p style="font-size: 16px;"><strong>⚠️ App Not Configured</strong></p>
                <p>Please configure the Health Registration App URL first.</p>
                <p>
                    <a href="<?php echo admin_url('options-general.php?page=health-registration'); ?>" class="button button-primary">
                        Go to Settings
                    </a>
                </p>
            </div>
        <?php endif; ?>
        
        <div style="background: #e7f3ff; padding: 15px; border-left: 4px solid #007AFF; border-radius: 3px; margin-top: 20px;">
            <h4 style="margin-top: 0;">📱 Mobile Access</h4>
            <p>Users can also access the registration form directly from their mobile devices. The app is fully responsive and works seamlessly on all screen sizes.</p>
        </div>
    </div>
    <?php
}

// Add admin notice if app not configured
function health_reg_admin_notice() {
    $app_url = get_option('health_reg_app_url');
    $current_screen = get_current_screen();
    
    if (empty($app_url) && $current_screen->id !== 'settings_page_health-registration') {
        ?>
        <div class="notice notice-warning is-dismissible">
            <p>
                <strong>Health Registration App:</strong> 
                Please <a href="<?php echo admin_url('options-general.php?page=health-registration'); ?>">configure the app URL</a> to start using the health registration system.
            </p>
        </div>
        <?php
    }
}
add_action('admin_notices', 'health_reg_admin_notice');

// Activation hook
function health_reg_activate() {
    // Set default option if not exists
    if (!get_option('health_reg_app_url')) {
        add_option('health_reg_app_url', '');
    }
}
register_activation_hook(__FILE__, 'health_reg_activate');

// Deactivation hook
function health_reg_deactivate() {
    // Clean up if needed (optional)
}
register_deactivation_hook(__FILE__, 'health_reg_deactivate');

// Add settings link on plugin page
function health_reg_plugin_settings_link($links) {
    $settings_link = '<a href="' . admin_url('options-general.php?page=health-registration') . '">Settings</a>';
    array_unshift($links, $settings_link);
    return $links;
}
add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'health_reg_plugin_settings_link');
