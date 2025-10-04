document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    const userEmail = sessionStorage.getItem('userEmail');
    const userName = sessionStorage.getItem('userName');
    const userCountry = sessionStorage.getItem('userCountry') || 'Not specified';
    const userCurrency = sessionStorage.getItem('userCurrency') || 'USD';

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        window.location.href = 'login.html';
        return;
    }

    // DOM Elements
    const userFullNameElement = document.getElementById('userFullName');
    const userEmailElement = document.getElementById('userEmail');
    const profileFullNameElement = document.getElementById('profileFullName');
    const profileEmailElement = document.getElementById('profileEmail');
    const profileCountryElement = document.getElementById('profileCountry');
    const profileCurrencyElement = document.getElementById('profileCurrency');
    const logoutBtn = document.getElementById('logoutBtn');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');

    // Set user information
    function setUserInfo() {
        userFullNameElement.textContent = userName || 'User';
        userEmailElement.textContent = userEmail || '';
        profileFullNameElement.textContent = userName || 'Not specified';
        profileEmailElement.textContent = userEmail || 'Not specified';
        profileCountryElement.textContent = userCountry;
        profileCurrencyElement.textContent = userCurrency;
    }

    // Initialize the page
    setUserInfo();

    // Logout functionality
    logoutBtn.addEventListener('click', function() {
        // Clear session storage
        sessionStorage.clear();
        // Redirect to login page
        window.location.href = 'login.html';
    });

    // Edit Profile Button
    editProfileBtn.addEventListener('click', function() {
        // In a real app, this would open an edit profile form
        alert('Edit profile functionality will be implemented here');
    });

    // Change Password Button
    changePasswordBtn.addEventListener('click', function() {
        // In a real app, this would open a change password form
        alert('Change password functionality will be implemented here');
    });

    // Change Avatar Button
    changeAvatarBtn.addEventListener('click', function() {
        // In a real app, this would open a file picker to upload a new avatar
        alert('Change avatar functionality will be implemented here');
    });

    // Add animation to buttons on hover
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        });

        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
});

// Function to get currency symbol
function getCurrencySymbol(currency) {
    const symbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'INR': '₹',
        'JPY': '¥',
        'CAD': 'C$',
        'AUD': 'A$',
        'SGD': 'S$',
        'AED': 'د.إ'
    };
    return symbols[currency] || '$';
}
