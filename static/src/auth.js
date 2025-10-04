// Auth functionality for login and session management
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function handleLogin(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const role = document.getElementById('loginRole').value;
            const country = document.getElementById('loginCountry').value;
            const emailError = document.getElementById('emailError');
            const passwordError = document.getElementById('passwordError');
            
            // Reset previous errors
            emailError.textContent = '';
            passwordError.textContent = '';
            
            // Reset error states
            document.getElementById('loginEmail').parentElement.classList.remove('error');
            document.getElementById('loginPassword').parentElement.classList.remove('error');
            
            // Validate email
            if (!email) {
                emailError.textContent = 'Email is required';
                document.getElementById('loginEmail').parentElement.classList.add('error');
                return;
            } else if (!isValidEmail(email)) {
                emailError.textContent = 'Invalid email format';
                document.getElementById('loginEmail').parentElement.classList.add('error');
                return;
            }
            
            // Validate password
            if (!password) {
                passwordError.textContent = 'Password is required';
                document.getElementById('loginPassword').parentElement.classList.add('error');
                return;
            } else if (password.length !== 6) {
                passwordError.textContent = 'Password must be exactly 6 characters';
                document.getElementById('loginPassword').parentElement.classList.add('error');
                return;
            }
            
            // Validate role
            if (!role) {
                showMessage('Please select a role', 'error');
                return;
            }
            
            // Get currency based on country
            const countryToCurrency = {
                'United States': 'USD',
                'United Kingdom': 'GBP',
                'India': 'INR',
                'Japan': 'JPY',
                'Germany': 'EUR',
                'France': 'EUR',
                'Canada': 'CAD',
                'Australia': 'AUD',
                'Singapore': 'SGD',
                'United Arab Emirates': 'AED'
                // Add more country-currency mappings as needed
            };
            
            const userCurrency = countryToCurrency[country] || 'USD';
            
            // Store user data in session storage
            sessionStorage.setItem('userCountry', country);
            sessionStorage.setItem('userCurrency', userCurrency);
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            
            // Simulate API call
            setTimeout(() => {
                try {
                    // Store user session
                    sessionStorage.setItem('isAuthenticated', 'true');
                    sessionStorage.setItem('userEmail', email);
                    sessionStorage.setItem('userRole', role);
                    sessionStorage.setItem('userCountry', country);
                    
                    // Map country to currency
                    const currencyMap = {
                        'US': 'USD',
                        'GB': 'GBP',
                        'IN': 'INR',
                        'JP': 'JPY',
                        'EU': 'EUR'
                    };
                    const currency = currencyMap[country] || 'USD';
                    sessionStorage.setItem('userCurrency', currency);
                    
                    showMessage('Login successful!', 'success');
                    
                    // Redirect based on user role
                    setTimeout(() => {
                        const basePath = window.location.pathname.split('/').slice(0, -1).join('/');
                        let redirectPage = 'emp.html'; // Default for employees
                        
                        if (role === 'manager') {
                            redirectPage = 'manage.html';
                        } else if (role === 'admin') {
                            redirectPage = 'admin.html';
                        }
                        
                        window.location.href = basePath + '/' + redirectPage;
                    }, 1000);
                    
                } catch (error) {
                    console.error('Login error:', error);
                    showMessage('An error occurred during login', 'error');
                } finally {
                    // Reset button state
                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    }, 2000);
                }
            }, 1500);
        });
    }
    
    // Add logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});

// Email validation helper function
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// Show message function
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Add to DOM
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(messageDiv, container.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Logout function
function logout() {
    // Clear session storage
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userCountry');
    sessionStorage.removeItem('userCurrency');
    
    // Redirect to login page
    window.location.href = 'login.html';
}

// Check authentication on page load
function checkAuth() {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    const currentPage = window.location.pathname.split('/').pop();
    
    // If user is not authenticated and not on login page, redirect to login
    if (!isAuthenticated && currentPage !== 'login.html') {
        window.location.href = 'login.html';
        return false;
    }
    
    // If user is authenticated and on login page, redirect to emp.html
    if (isAuthenticated && currentPage === 'login.html') {
        const basePath = window.location.pathname.split('/').slice(0, -1).join('/');
        window.location.href = basePath + '/emp.html';
        return false;
    }
    
    // Update UI based on user role
    if (isAuthenticated) {
        const userRole = sessionStorage.getItem('userRole');
        const userEmail = sessionStorage.getItem('userEmail');
        
        // Add role class to body for role-based styling
        if (userRole) {
            document.body.classList.add(`role-${userRole}`);
        }
        
        // Update user email in the UI if the element exists
        const userEmailElement = document.getElementById('userEmail');
        if (userEmailElement && userEmail) {
            userEmailElement.textContent = userEmail;
        }
    }
    
    return isAuthenticated === 'true';
}

// Call checkAuth when the page loads
window.addEventListener('DOMContentLoaded', checkAuth);
