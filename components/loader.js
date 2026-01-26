// Load shared header and footer components
async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        if (!response.ok) throw new Error(`Failed to load ${componentPath}`);
        let html = await response.text();

        // Fix paths based on current location
        html = fixPaths(html);

        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
        }
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
    }
}

// Determine the correct path to components based on current location
function getComponentPath(filename) {
    const currentPath = window.location.pathname;
    const depth = (currentPath.match(/\//g) || []).length - 1;

    // If we're at root level (index.html)
    if (depth === 0) {
        return `components/${filename}`;
    }
    // If we're one level deep (/cruises/, /flights/, /destinations/)
    else if (depth === 1) {
        return `../components/${filename}`;
    }
    // If we're two levels deep (/cruises/ports/)
    else if (depth === 2) {
        return `../../components/${filename}`;
    }
    // Default fallback
    return `../components/${filename}`;
}

// Fix absolute paths to be relative based on current page depth
function fixPaths(html) {
    const currentPath = window.location.pathname;
    const depth = (currentPath.match(/\//g) || []).length - 1;

    let prefix = '';
    if (depth === 0) {
        prefix = '';  // Root level
    } else if (depth === 1) {
        prefix = '../';  // One level deep
    } else if (depth === 2) {
        prefix = '../../';  // Two levels deep
    }

    // Replace absolute paths with relative paths
    html = html.replace(/href="\//g, `href="${prefix}`);
    html = html.replace(/src="\//g, `src="${prefix}`);

    return html;
}

// Load components when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([
        loadComponent('header-placeholder', getComponentPath('header.html')),
        loadComponent('footer-placeholder', getComponentPath('footer.html'))
    ]);

    // Load header.js after header is loaded
    const headerScript = document.createElement('script');
    headerScript.src = getComponentPath('header.js');
    document.body.appendChild(headerScript);
});
