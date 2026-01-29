// Airtable Configuration
const AIRTABLE_API_KEY = 'pat4HICXlDN0QBxkZ.b8d2092207dd1ee3ec676ab0b131f19ae92d17bcc17b0c9fb25d0a64dd1e0024';
const BASE_ID = 'appGoQsy2UiGyyZ3T';
const CRUISE_LINES_TABLE = 'tbl9oXySE9617moOx';

// Fetch all records from a table with pagination
async function fetchAllRecords(tableName) {
    let allRecords = [];
    let offset = null;

    do {
        const url = offset
            ? `https://api.airtable.com/v0/${BASE_ID}/${tableName}?offset=${offset}`
            : `https://api.airtable.com/v0/${BASE_ID}/${tableName}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`
            }
        });

        const data = await response.json();
        allRecords = allRecords.concat(data.records);
        offset = data.offset;
    } while (offset);

    return allRecords;
}

// Load dynamic cruise line links
async function loadDynamicCruiseLinks() {
    try {
        console.log('Loading dynamic cruise links...');
        const cruiseLines = await fetchAllRecords(CRUISE_LINES_TABLE);
        const dropdown = document.getElementById('cruises-dropdown');
        const mobileNav = document.getElementById('mobile-nav');

        console.log('Cruise lines fetched:', cruiseLines.length);
        console.log('Dropdown element:', dropdown);
        console.log('Mobile nav element:', mobileNav);

        if (!dropdown || !mobileNav) {
            console.error('Dropdown or mobile nav element not found!');
            return;
        }

        // Filter for cruise lines with Page_URL
        const withPages = cruiseLines
            .filter(line => line.fields.Page_URL)
            .sort((a, b) => {
                // Sort by Display_Order if available, otherwise alphabetically
                if (a.fields.Display_Order !== undefined && b.fields.Display_Order !== undefined) {
                    return a.fields.Display_Order - b.fields.Display_Order;
                }
                const nameA = (a.fields.Cruise_Line || '').toLowerCase();
                const nameB = (b.fields.Cruise_Line || '').toLowerCase();
                return nameA.localeCompare(nameB);
            });

        console.log('Cruise lines with Page_URL:', withPages.length);
        console.log('Cruise lines with pages:', withPages.map(line => ({
            name: line.fields.Cruise_Line,
            url: line.fields.Page_URL
        })));

        // Add dynamic cruise line links to desktop dropdown
        withPages.forEach(line => {
            const link = document.createElement('a');
            link.href = line.fields.Page_URL;
            link.textContent = line.fields.Cruise_Line;
            link.style.paddingLeft = '30px';
            link.style.fontSize = '0.95rem';
            dropdown.appendChild(link);
            console.log('Added to dropdown:', line.fields.Cruise_Line);
        });

        // Add dynamic cruise line links to mobile menu (indented further)
        withPages.forEach(line => {
            const mobileLink = document.createElement('a');
            mobileLink.href = line.fields.Page_URL;
            mobileLink.textContent = '→ ' + line.fields.Cruise_Line;
            mobileLink.style.fontSize = '1.6rem';
            mobileLink.style.paddingLeft = '40px';
            mobileLink.style.color = 'rgba(255, 255, 255, 0.85)';
            mobileNav.appendChild(mobileLink);
            console.log('Added to mobile nav:', line.fields.Cruise_Line);
        });

        console.log('Dynamic cruise links loaded successfully!');
    } catch (error) {
        console.error('Error loading dynamic cruise links:', error);
    }
}

// Mobile Menu functionality
(function() {
    function initMobileMenu() {
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const mobileMenu = document.getElementById('mobile-menu');

        if (!hamburgerBtn || !mobileMenu) {
            // Elements not ready yet, try again shortly
            setTimeout(initMobileMenu, 50);
            return;
        }

        // Mobile Menu Toggle
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');

            // Prevent body scroll when menu is open
            if (mobileMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close menu when clicking a link
        const mobileNavLinks = document.querySelectorAll('.mobile-nav a');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside (on the menu overlay)
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                hamburgerBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileMenu);
    } else {
        initMobileMenu();
    }
})();

// Load dynamic cruise links when script loads
loadDynamicCruiseLinks();
