// Shared caching utility for SoCal Bucket List
// Handles localStorage caching for Airtable data and user preferences

const CacheManager = {
    // Cache keys
    KEYS: {
        FLIGHTS: 'socal_cache_flights',
        CRUISES: 'socal_cache_cruises',
        DESTINATIONS: 'socal_cache_destinations',
        CRUISE_PORTS: 'socal_cache_cruise_ports',
        CRUISE_LINES: 'socal_cache_cruise_lines',
        USER_ADDRESS: 'socal_user_address',
        USER_LOCATION: 'socal_user_location'
    },

    // Cache TTL (Time To Live) - 1 hour for Airtable data
    CACHE_TTL: 60 * 60 * 1000, // 1 hour in milliseconds

    /**
     * Check if storage is allowed by user consent
     */
    isStorageAllowed() {
        // Check if consent system has loaded and user has given permission
        return typeof window.isStorageAllowed === 'function' && window.isStorageAllowed();
    },

    /**
     * Save data to cache with timestamp
     * @param {string} key - Cache key
     * @param {*} data - Data to cache
     * @param {boolean} neverExpire - If true, data won't have expiration
     */
    set(key, data, neverExpire = false) {
        // Check if user has consented to storage
        if (!this.isStorageAllowed()) {
            console.log('Storage declined by user - not caching');
            return;
        }

        try {
            const cacheItem = {
                data: data,
                timestamp: Date.now(),
                neverExpire: neverExpire
            };
            localStorage.setItem(key, JSON.stringify(cacheItem));
        } catch (error) {
            console.error('Error saving to cache:', error);
        }
    },

    /**
     * Get data from cache if not expired
     * @param {string} key - Cache key
     * @returns {*} Cached data or null if expired/not found
     */
    get(key) {
        // If storage not allowed, don't return cached data
        if (!this.isStorageAllowed()) {
            return null;
        }

        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;

            const cacheItem = JSON.parse(cached);

            // If data never expires, return it
            if (cacheItem.neverExpire) {
                return cacheItem.data;
            }

            // Check if data is still fresh
            const age = Date.now() - cacheItem.timestamp;
            if (age < this.CACHE_TTL) {
                return cacheItem.data;
            }

            // Data expired, remove it
            localStorage.removeItem(key);
            return null;
        } catch (error) {
            console.error('Error reading from cache:', error);
            return null;
        }
    },

    /**
     * Clear specific cache entry
     * @param {string} key - Cache key to clear
     */
    clear(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    },

    /**
     * Clear all SoCal Bucket List cache data
     */
    clearAll() {
        try {
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            console.log('All cache cleared');
        } catch (error) {
            console.error('Error clearing all cache:', error);
        }
    },

    /**
     * Get cache statistics
     * @returns {Object} Cache stats including size and items
     */
    getStats() {
        const stats = {
            items: 0,
            size: 0,
            cached: []
        };

        try {
            Object.entries(this.KEYS).forEach(([name, key]) => {
                const cached = localStorage.getItem(key);
                if (cached) {
                    stats.items++;
                    stats.size += cached.length;
                    const item = JSON.parse(cached);
                    const age = Date.now() - item.timestamp;
                    const ageMinutes = Math.floor(age / 60000);
                    stats.cached.push({
                        name: name,
                        age: ageMinutes + ' minutes',
                        expires: item.neverExpire ? 'Never' : (60 - ageMinutes) + ' minutes'
                    });
                }
            });

            // Convert size to KB
            stats.size = (stats.size / 1024).toFixed(2) + ' KB';
        } catch (error) {
            console.error('Error getting cache stats:', error);
        }

        return stats;
    },

    /**
     * Save user's address (persists indefinitely)
     */
    saveUserAddress(address) {
        this.set(this.KEYS.USER_ADDRESS, address, true);
    },

    /**
     * Get user's saved address
     */
    getUserAddress() {
        return this.get(this.KEYS.USER_ADDRESS);
    },

    /**
     * Save user's geocoded location (persists indefinitely)
     */
    saveUserLocation(lat, lng) {
        this.set(this.KEYS.USER_LOCATION, { lat, lng }, true);
    },

    /**
     * Get user's saved location
     */
    getUserLocation() {
        return this.get(this.KEYS.USER_LOCATION);
    }
};

// Make CacheManager available globally
window.CacheManager = CacheManager;
