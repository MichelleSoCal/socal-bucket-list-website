// Cookie Consent and Privacy Manager for SoCal Bucket List
// Handles Google Analytics consent and localStorage privacy notices with granular controls

(function() {
    'use strict';

    const CONSENT_KEYS = {
        GA: 'socal_ga_consent',
        STORAGE: 'socal_storage_consent',
        BANNER_SHOWN: 'socal_consent_banner_shown'
    };
    const GA_ID = 'G-8FCF1EFQXH';

    // Check consent status for each feature
    function getConsentStatus(key) {
        return localStorage.getItem(key);
    }

    // Save consent decision
    function saveConsent(key, accepted) {
        localStorage.setItem(key, accepted ? 'accepted' : 'declined');
    }

    // Mark that banner has been shown
    function markBannerShown() {
        localStorage.setItem(CONSENT_KEYS.BANNER_SHOWN, 'true');
    }

    // Initialize Google Analytics
    function initializeGoogleAnalytics() {
        // Create and inject gtag script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', GA_ID);

        console.log('Google Analytics initialized');
    }

    // Create and show consent banner with individual toggles
    function showConsentBanner() {
        // Create banner HTML
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.innerHTML = `
            <div style="position: fixed; bottom: 0; left: 0; right: 0; background: rgba(26, 10, 31, 0.98); border-top: 2px solid rgba(255, 110, 199, 0.5); padding: 25px; z-index: 10000; box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);">
                <div style="max-width: 1200px; margin: 0 auto;">
                    <h3 style="color: #ff6ec7; margin: 0 0 15px 0; font-size: 1.2rem;">🍪 Privacy & Cookie Preferences</h3>
                    <p style="color: rgba(255, 255, 255, 0.9); margin: 0 0 20px 0; font-size: 0.95rem; line-height: 1.6;">
                        We care about your privacy. Choose what you're comfortable with:
                    </p>

                    <!-- Consent Options -->
                    <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px;">
                        <!-- Google Analytics Option -->
                        <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 110, 199, 0.2); border-radius: 10px; padding: 15px;">
                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 15px;">
                                <div style="flex: 1;">
                                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                                        <span style="font-size: 1.3rem;">📊</span>
                                        <strong style="color: #fff; font-size: 1rem;">Google Analytics</strong>
                                    </div>
                                    <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.85rem; margin: 0; line-height: 1.4;">
                                        Helps us understand which pages are popular and improve the site. Uses cookies to track your visit.
                                    </p>
                                </div>
                                <label style="position: relative; display: inline-block; width: 50px; height: 26px; flex-shrink: 0;">
                                    <input type="checkbox" id="ga-consent-toggle" checked style="opacity: 0; width: 0; height: 0;">
                                    <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255, 110, 199, 0.3); transition: 0.3s; border-radius: 26px;"></span>
                                    <span style="position: absolute; content: ''; height: 18px; width: 18px; left: 4px; bottom: 4px; background-color: white; transition: 0.3s; border-radius: 50%;"></span>
                                </label>
                            </div>
                        </div>

                        <!-- LocalStorage Option -->
                        <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 110, 199, 0.2); border-radius: 10px; padding: 15px;">
                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 15px;">
                                <div style="flex: 1;">
                                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                                        <span style="font-size: 1.3rem;">💾</span>
                                        <strong style="color: #fff; font-size: 1rem;">Local Storage (Address & Cache)</strong>
                                    </div>
                                    <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.85rem; margin: 0; line-height: 1.4;">
                                        Saves your address locally and caches data for faster page loads. <strong style="color: #6eff6e;">100% local</strong> - never leaves your device.
                                    </p>
                                </div>
                                <label style="position: relative; display: inline-block; width: 50px; height: 26px; flex-shrink: 0;">
                                    <input type="checkbox" id="storage-consent-toggle" checked style="opacity: 0; width: 0; height: 0;">
                                    <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255, 110, 199, 0.3); transition: 0.3s; border-radius: 26px;"></span>
                                    <span style="position: absolute; content: ''; height: 18px; width: 18px; left: 4px; bottom: 4px; background-color: white; transition: 0.3s; border-radius: 50%;"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                        <button id="consent-save" style="background: linear-gradient(135deg, #ff6ec7 0%, #ff9a56 100%); color: white; border: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 1rem; transition: transform 0.2s;">
                            Save Preferences
                        </button>
                        <button id="consent-accept-all" style="background: transparent; color: rgba(255, 255, 255, 0.9); border: 2px solid rgba(255, 110, 199, 0.4); padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.95rem; transition: all 0.2s;">
                            Accept All
                        </button>
                        <button id="consent-decline-all" style="background: transparent; color: rgba(255, 255, 255, 0.6); border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.95rem; text-decoration: underline; transition: color 0.2s;">
                            Decline All
                        </button>
                        <button id="consent-privacy-link" style="background: none; border: none; color: #a78bfa; text-decoration: underline; cursor: pointer; font-size: 0.9rem; padding: 12px 0; margin-left: auto;">
                            Privacy Details
                        </button>
                    </div>
                </div>
            </div>

            <!-- Privacy Details Modal (hidden by default) -->
            <div id="privacy-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.8); z-index: 10001; align-items: center; justify-content: center; padding: 20px;">
                <div style="background: linear-gradient(to bottom, #1a0a1f 0%, #2d1b3d 100%); border: 2px solid rgba(255, 110, 199, 0.5); border-radius: 12px; padding: 30px; max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto;">
                    <h2 style="color: #ff6ec7; margin: 0 0 20px 0;">Your Privacy Matters</h2>

                    <h3 style="color: #a78bfa; font-size: 1.1rem; margin: 20px 0 10px 0;">📊 Google Analytics (Optional)</h3>
                    <p style="color: rgba(255, 255, 255, 0.9); line-height: 1.6; margin: 0 0 15px 0;">
                        We use Google Analytics to understand how visitors use our site (which pages are popular, how long people stay, etc.).
                        This helps us improve the website. Google Analytics sets cookies in your browser to track your visit.
                    </p>
                    <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.9rem; line-height: 1.6; margin: 0 0 15px 0;">
                        <strong>You can decline</strong> and the site will work perfectly - you just won't be tracked.
                    </p>

                    <h3 style="color: #a78bfa; font-size: 1.1rem; margin: 20px 0 10px 0;">💾 Local Storage (Optional)</h3>
                    <p style="color: rgba(255, 255, 255, 0.9); line-height: 1.6; margin: 0 0 15px 0;">
                        When you enter your address to calculate distances to destinations, we can save it in your browser's local storage.
                        We also cache destination/flight/cruise data to make pages load faster on return visits.
                    </p>
                    <p style="color: rgba(255, 255, 255, 0.9); line-height: 1.6; margin: 0 0 15px 0;">
                        <strong style="color: #6eff6e;">✓ Your data stays 100% on your device</strong><br>
                        <strong style="color: #6eff6e;">✓ We never send it to our servers</strong><br>
                        <strong style="color: #6eff6e;">✓ You can clear it anytime with the button below</strong>
                    </p>
                    <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.9rem; line-height: 1.6; margin: 0 0 15px 0;">
                        <strong>You can decline</strong> and the site will work fine - you'll just need to re-enter your address each time and pages might load a bit slower.
                    </p>

                    <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(255, 110, 199, 0.2);">
                        <button id="clear-all-data-btn" style="background: transparent; color: #ff6e6e; border: 2px solid #ff6e6e; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.95rem; width: 100%; margin-bottom: 15px; transition: all 0.2s;">
                            🗑️ Clear All My Data
                        </button>
                        <button id="close-privacy-modal" style="background: linear-gradient(135deg, #ff6ec7 0%, #ff9a56 100%); color: white; border: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 1rem; width: 100%; transition: transform 0.2s;">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Add toggle functionality
        setupToggle('ga-consent-toggle');
        setupToggle('storage-consent-toggle');

        // Add hover effects
        setupHoverEffects();

        // Attach event listeners
        document.getElementById('consent-save').onclick = handleSave;
        document.getElementById('consent-accept-all').onclick = handleAcceptAll;
        document.getElementById('consent-decline-all').onclick = handleDeclineAll;
        document.getElementById('consent-privacy-link').onclick = showPrivacyModal;
        document.getElementById('close-privacy-modal').onclick = hidePrivacyModal;
        document.getElementById('clear-all-data-btn').onclick = clearAllData;

        // Close modal on background click
        document.getElementById('privacy-modal').onclick = function(e) {
            if (e.target.id === 'privacy-modal') {
                hidePrivacyModal();
            }
        };
    }

    function setupToggle(toggleId) {
        const toggle = document.getElementById(toggleId);
        const slider = toggle.nextElementSibling;
        const knob = slider.nextElementSibling;

        toggle.addEventListener('change', function() {
            if (this.checked) {
                slider.style.backgroundColor = '#ff6ec7';
                knob.style.transform = 'translateX(24px)';
            } else {
                slider.style.backgroundColor = 'rgba(255, 110, 199, 0.3)';
                knob.style.transform = 'translateX(0)';
            }
        });

        // Initialize state
        if (toggle.checked) {
            slider.style.backgroundColor = '#ff6ec7';
            knob.style.transform = 'translateX(24px)';
        }
    }

    function setupHoverEffects() {
        const saveBtn = document.getElementById('consent-save');
        const acceptAllBtn = document.getElementById('consent-accept-all');
        const declineAllBtn = document.getElementById('consent-decline-all');
        const clearDataBtn = document.getElementById('clear-all-data-btn');

        saveBtn.onmouseover = () => saveBtn.style.transform = 'translateY(-2px)';
        saveBtn.onmouseout = () => saveBtn.style.transform = 'translateY(0)';

        acceptAllBtn.onmouseover = () => {
            acceptAllBtn.style.borderColor = 'rgba(255, 110, 199, 0.6)';
            acceptAllBtn.style.color = '#fff';
        };
        acceptAllBtn.onmouseout = () => {
            acceptAllBtn.style.borderColor = 'rgba(255, 110, 199, 0.4)';
            acceptAllBtn.style.color = 'rgba(255, 255, 255, 0.9)';
        };

        declineAllBtn.onmouseover = () => declineAllBtn.style.color = 'rgba(255, 255, 255, 0.9)';
        declineAllBtn.onmouseout = () => declineAllBtn.style.color = 'rgba(255, 255, 255, 0.6)';

        if (clearDataBtn) {
            clearDataBtn.onmouseover = () => {
                clearDataBtn.style.background = '#ff6e6e';
                clearDataBtn.style.color = 'white';
            };
            clearDataBtn.onmouseout = () => {
                clearDataBtn.style.background = 'transparent';
                clearDataBtn.style.color = '#ff6e6e';
            };
        }
    }

    function showPrivacyModal() {
        const modal = document.getElementById('privacy-modal');
        modal.style.display = 'flex';
    }

    function hidePrivacyModal() {
        const modal = document.getElementById('privacy-modal');
        modal.style.display = 'none';
    }

    function clearAllData() {
        const confirmed = confirm('Are you sure you want to clear all your data? This will remove:\n\n• Your cookie consent preferences\n• Your saved address\n• Cached destination data\n\nYou\'ll need to set your preferences again.');

        if (confirmed) {
            // Clear everything from localStorage
            localStorage.clear();

            // Show confirmation
            alert('✓ All data cleared! The page will now reload.');

            // Reload the page
            window.location.reload();
        }
    }

    function handleSave() {
        const gaToggle = document.getElementById('ga-consent-toggle');
        const storageToggle = document.getElementById('storage-consent-toggle');

        // Save preferences
        saveConsent(CONSENT_KEYS.GA, gaToggle.checked);
        saveConsent(CONSENT_KEYS.STORAGE, storageToggle.checked);
        markBannerShown();

        // Initialize GA if accepted
        if (gaToggle.checked) {
            initializeGoogleAnalytics();
        } else {
            console.log('Google Analytics declined by user');
        }

        // Handle storage consent
        if (!storageToggle.checked) {
            // User declined storage - clear any existing cached data (but keep consent preferences)
            const consentKeys = Object.values(CONSENT_KEYS);
            Object.keys(localStorage).forEach(key => {
                if (!consentKeys.includes(key)) {
                    localStorage.removeItem(key);
                }
            });
            console.log('Local storage (except consent) cleared per user preference');
        } else {
            console.log('Local storage enabled');
        }

        removeBanner();
    }

    function handleAcceptAll() {
        document.getElementById('ga-consent-toggle').checked = true;
        document.getElementById('storage-consent-toggle').checked = true;

        // Trigger visual update
        setupToggle('ga-consent-toggle');
        setupToggle('storage-consent-toggle');

        handleSave();
    }

    function handleDeclineAll() {
        document.getElementById('ga-consent-toggle').checked = false;
        document.getElementById('storage-consent-toggle').checked = false;

        // Trigger visual update
        setupToggle('ga-consent-toggle');
        setupToggle('storage-consent-toggle');

        handleSave();
    }

    function removeBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.style.transition = 'opacity 0.3s';
            banner.style.opacity = '0';
            setTimeout(() => banner.remove(), 300);
        }
    }

    // Check if storage is allowed before using it
    function isStorageAllowed() {
        return getConsentStatus(CONSENT_KEYS.STORAGE) === 'accepted';
    }

    // Initialize on page load
    function init() {
        const gaConsent = getConsentStatus(CONSENT_KEYS.GA);
        const storageConsent = getConsentStatus(CONSENT_KEYS.STORAGE);
        const bannerShown = getConsentStatus(CONSENT_KEYS.BANNER_SHOWN);

        if (gaConsent === 'accepted') {
            // User previously accepted GA - load it immediately
            initializeGoogleAnalytics();
        } else if (gaConsent === 'declined') {
            // User previously declined GA
            console.log('Google Analytics disabled by user preference');
        }

        if (storageConsent === 'declined') {
            // User declined storage - make sure nothing is cached (except consent)
            console.log('Local storage disabled by user preference');
        }

        // Show banner if no decision has been made yet
        if (!bannerShown) {
            showConsentBanner();
        }
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Function to reopen the consent banner (e.g., from Privacy Settings link)
    function reopenConsentBanner() {
        // Remove existing banner if present
        const existingBanner = document.getElementById('cookie-consent-banner');
        if (existingBanner) {
            existingBanner.remove();
        }

        // Show the banner
        showConsentBanner();

        // Load current preferences and update toggles
        const gaConsent = getConsentStatus(CONSENT_KEYS.GA);
        const storageConsent = getConsentStatus(CONSENT_KEYS.STORAGE);

        const gaToggle = document.getElementById('ga-consent-toggle');
        const storageToggle = document.getElementById('storage-consent-toggle');

        // Set toggles based on saved preferences
        gaToggle.checked = (gaConsent === 'accepted');
        storageToggle.checked = (storageConsent === 'accepted');

        // Update visual state
        setupToggle('ga-consent-toggle');
        setupToggle('storage-consent-toggle');
    }

    // Make functions available globally
    window.clearSoCalData = clearAllData;
    window.isStorageAllowed = isStorageAllowed;
    window.reopenConsentBanner = reopenConsentBanner;
})();
