/**
 * ContextDic Pro - Ads Service
 * Handles Google AdSense integration and premium features
 */

class AdsService {
    constructor() {
        // TODO: Replace with your actual AdSense Publisher ID
        this.adClient = 'ca-pub-YOUR_PUBLISHER_ID'; 
        this.adSlots = {
            popup: 'YOUR_POPUP_AD_SLOT_ID',
            settings: 'YOUR_SETTINGS_AD_SLOT_ID',
            banner: 'YOUR_BANNER_AD_SLOT_ID'
        };
        this.adsEnabled = true;
        this.isInitialized = false;
    }

    /**
     * Initialize Google AdSense
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            // Check if user has premium subscription
            const settings = await chrome.storage.local.get(['isPremium', 'adsEnabled']);
            
            if (settings.isPremium) {
                this.adsEnabled = false;
                console.log('Premium user - ads disabled');
                return;
            }

            if (settings.adsEnabled === false) {
                this.adsEnabled = false;
                console.log('User disabled ads');
                return;
            }

            // Load AdSense script only if ads are enabled
            if (this.adsEnabled && this.adClient !== 'ca-pub-YOUR_PUBLISHER_ID') {
                await this.loadAdSenseScript();
                this.isInitialized = true;
                console.log('AdSense initialized successfully');
            } else {
                console.log('AdSense not configured or ads disabled');
            }
        } catch (error) {
            console.error('Failed to initialize ads:', error);
        }
    }

    /**
     * Load Google AdSense script
     */
    loadAdSenseScript() {
        return new Promise((resolve, reject) => {
            // Check if script already exists
            if (document.querySelector(`script[src*="pagead2.googlesyndication.com"]`)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.async = true;
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.adClient}`;
            script.crossOrigin = 'anonymous';
            script.onload = resolve;
            script.onerror = () => {
                console.warn('AdSense script failed to load - continuing without ads');
                this.adsEnabled = false;
                resolve(); // Don't reject - extension should work without ads
            };
            document.head.appendChild(script);
        });
    }

    /**
     * Create ad container for popup
     */
    createPopupAd() {
        if (!this.shouldShowAds()) return null;

        const adContainer = document.createElement('div');
        adContainer.className = 'contextdic-ad-container';
        adContainer.innerHTML = `
            <div class="contextdic-ad-label">Advertisement</div>
            <ins class="adsbygoogle contextdic-popup-ad"
                 style="display:block;width:300px;height:100px;"
                 data-ad-client="${this.adClient}"
                 data-ad-slot="${this.adSlots.popup}"
                 data-ad-format="rectangle"
                 data-full-width-responsive="false">
            </ins>
        `;

        // Initialize the ad after a short delay
        this.initializeAdElement(adContainer);
        return adContainer;
    }

    /**
     * Create banner ad for settings page
     */
    createBannerAd(width = 320, height = 50) {
        if (!this.shouldShowAds()) return null;

        const adContainer = document.createElement('div');
        adContainer.className = 'contextdic-banner-ad';
        adContainer.innerHTML = `
            <div class="contextdic-ad-label">Advertisement</div>
            <ins class="adsbygoogle contextdic-settings-ad"
                 style="display:block;width:${width}px;height:${height}px;"
                 data-ad-client="${this.adClient}"
                 data-ad-slot="${this.adSlots.banner}"
                 data-ad-format="banner"
                 data-full-width-responsive="false">
            </ins>
        `;

        this.initializeAdElement(adContainer);
        return adContainer;
    }

    /**
     * Initialize ad element
     */
    initializeAdElement(container) {
        setTimeout(() => {
            try {
                const adElement = container.querySelector('.adsbygoogle');
                if (adElement && window.adsbygoogle) {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                }
            } catch (error) {
                console.warn('Ad failed to load:', error);
                this.handleAdError(container);
            }
        }, 200);
    }

    /**
     * Handle ad loading errors gracefully
     */
    handleAdError(container) {
        if (container) {
            container.style.display = 'none';
        }
    }

    /**
     * Check if ads should be shown
     */
    shouldShowAds() {
        return this.adsEnabled && this.isInitialized && this.adClient !== 'ca-pub-YOUR_PUBLISHER_ID';
    }

    /**
     * Get premium user status
     */
    async isPremiumUser() {
        const settings = await chrome.storage.local.get(['isPremium']);
        return settings.isPremium || false;
    }

    /**
     * Set premium user status
     */
    async setPremiumStatus(isPremium) {
        await chrome.storage.local.set({ isPremium });
        this.adsEnabled = !isPremium;
        
        // Hide all ads if premium
        if (isPremium) {
            this.hideAllAds();
        }
    }

    /**
     * Hide all displayed ads
     */
    hideAllAds() {
        const ads = document.querySelectorAll('.contextdic-ad-container, .contextdic-banner-ad');
        ads.forEach(ad => ad.style.display = 'none');
        
        // Add premium class to body
        document.body.classList.add('premium-user');
    }

    /**
     * Show premium upgrade prompt
     */
    createPremiumPrompt() {
        const prompt = document.createElement('div');
        prompt.className = 'contextdic-premium-prompt';
        prompt.innerHTML = `
            <div class="premium-content">
                <h3>🚀 Upgrade to ContextDic Pro Premium</h3>
                <ul>
                    <li>✅ Ad-free experience</li>
                    <li>✅ Unlimited translations</li>
                    <li>✅ Translation history</li>
                    <li>✅ Priority support</li>
                </ul>
                <div class="premium-pricing">
                    <button class="premium-btn monthly" data-plan="monthly">
                        $2.99/month
                    </button>
                    <button class="premium-btn yearly" data-plan="yearly">
                        $19.99/year <span class="save-badge">Save 44%</span>
                    </button>
                </div>
                <button class="close-premium-prompt">Maybe later</button>
            </div>
        `;

        // Add event listeners
        prompt.addEventListener('click', (e) => {
            if (e.target.classList.contains('premium-btn')) {
                this.handlePremiumUpgrade(e.target.dataset.plan);
            } else if (e.target.classList.contains('close-premium-prompt')) {
                prompt.remove();
            }
        });

        return prompt;
    }

    /**
     * Handle premium upgrade
     */
    handlePremiumUpgrade(plan) {
        // TODO: Implement actual payment processing
        chrome.tabs.create({ 
            url: `https://your-website.com/premium?plan=${plan}` 
        });
        
        // Track the conversion attempt
        this.trackEvent('premium_upgrade_attempt', { plan });
    }

    /**
     * Track analytics events
     */
    trackEvent(eventName, data = {}) {
        try {
            chrome.runtime.sendMessage({
                type: 'analytics',
                event: eventName,
                data: data,
                timestamp: Date.now()
            });
        } catch (error) {
            console.log('Analytics tracking failed:', error);
        }
    }

    /**
     * Configure ads for development/testing
     */
    setTestMode(enabled = true) {
        if (enabled) {
            this.adClient = 'ca-pub-YOUR_PUBLISHER_ID'; // Keep placeholder in test mode
            this.adsEnabled = false;
            console.log('Ads service in test mode - no real ads will load');
        }
    }
}

// Export the service
export default new AdsService(); 