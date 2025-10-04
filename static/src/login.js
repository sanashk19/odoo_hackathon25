document.addEventListener('DOMContentLoaded', function() {
    // OTP Verification Variables
    let otpTimer;
    let timeLeft = 60; // 1 minute in seconds
    let userEmail = ''; // Will store the user's email for OTP verification
    let verificationToken = ''; // Will store the verification token from the server
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const countrySelect = document.getElementById('country');
    
    // Toggle between login and signup forms
    showSignup.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
    });
    
    showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        signupForm.classList.remove('active');
        loginForm.classList.add('active');
    });
    
    // Load countries from REST Countries API
    async function loadCountries() {
        try {
            const response = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
            const countries = await response.json();
            
            // Sort countries alphabetically
            countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
            
            // Add countries to the select element
            countries.forEach(country => {
                if (country.currencies) {
                    const option = document.createElement('option');
                    option.value = country.name.common;
                    option.textContent = country.name.common;
                    countrySelect.appendChild(option);
                }
            });
        } catch (error) {
            console.error('Error loading countries:', error);
            // Fallback to some common countries if API fails
            const fallbackCountries = [
                'United States', 'United Kingdom', 'Canada', 'Australia', 
                'Germany', 'France', 'Japan', 'India', 'Singapore', 'United Arab Emirates'
            ];
            
            fallbackCountries.forEach(country => {
                const option = document.createElement('option');
                option.value = country;
                option.textContent = country;
                countrySelect.appendChild(option);
            });
        }
    }
    
    // Generate a random 6-digit OTP
    function generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    // OTP Verification Functions
    function showOtpModal(email) {
        userEmail = email;
        document.getElementById('userEmail').textContent = email;
        document.getElementById('otpModal').style.display = 'flex';
        startOtpTimer();
        
        // Generate and fill a new OTP
        const otp = generateOTP();
        console.log('Generated OTP for testing:', otp); // Log the OTP for testing
        
        const otpInputs = document.querySelectorAll('.otp-input');
        otpInputs.forEach((input, index) => {
            input.value = otp[index] || '';
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        
        // Focus the verify button
        const verifyBtn = document.getElementById('verifyOtpBtn');
        if (verifyBtn) {
            verifyBtn.focus();
        }
    }

    function hideOtpModal() {
        document.getElementById('otpModal').style.display = 'none';
        clearInterval(otpTimer);
        timeLeft = 60;
        updateCountdown();
    }

    function startOtpTimer() {
        clearInterval(otpTimer);
        timeLeft = 60;
        updateCountdown();
        
        otpTimer = setInterval(() => {
            timeLeft--;
            updateCountdown();
            
            if (timeLeft <= 0) {
                clearInterval(otpTimer);
                document.getElementById('resendOtp').style.display = 'inline';
                document.getElementById('countdown').style.display = 'none';
            }
        }, 1000);
    }

    function updateCountdown() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        document.getElementById('countdown').textContent = `(${minutes}:${seconds < 10 ? '0' : ''}${seconds})`;
    }

    function getOtpValue() {
        const inputs = document.querySelectorAll('.otp-input');
        return Array.from(inputs).map(input => input.value).join('');
    }

    function validateOtp(otp) {
        return /^\d{6}$/.test(otp);
    }

    // Close modal when clicking outside of it
    window.onclick = function(event) {
        const modal = document.getElementById('otpModal');
        if (event.target === modal) {
            hideOtpModal();
        }
    }

    // Close button
    document.querySelector('.close').addEventListener('click', hideOtpModal);

    // OTP Input handling
    document.querySelectorAll('.otp-input').forEach((input, index, inputs) => {
        // Move to next input on number input
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1) {
                if (index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            }
            
            // Enable/disable verify button based on OTP completion
            const otp = getOtpValue();
            document.getElementById('verifyOtpBtn').disabled = !validateOtp(otp);
        });

        // Handle backspace
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });

    // Resend OTP
    document.getElementById('resendOtp').addEventListener('click', async (e) => {
        e.preventDefault();
        
        try {
            // Show loading state
            const resendBtn = e.target;
            const originalText = resendBtn.textContent;
            resendBtn.textContent = 'Sending...';
            resendBtn.style.pointerEvents = 'none';
            
            // In a real app, you would make an API call to resend OTP
            // For now, we'll just reset the timer
            startOtpTimer();
            document.getElementById('resendOtp').style.display = 'none';
            document.getElementById('countdown').style.display = 'inline';
            
            // Show success message
            showMessage('New OTP sent to your email', 'success');
            
        } catch (error) {
            console.error('Error resending OTP:', error);
            showMessage('Failed to resend OTP. Please try again.', 'error');
        } finally {
            // Reset button state
            const resendBtn = document.getElementById('resendOtp');
            resendBtn.textContent = 'Resend OTP';
            resendBtn.style.pointerEvents = 'auto';
        }
    });

    // Verify OTP
    document.getElementById('verifyOtpBtn').addEventListener('click', async () => {
        const otp = getOtpValue();
        
        if (!validateOtp(otp)) {
            document.getElementById('otpError').textContent = 'Please enter a valid 6-digit OTP';
            return;
        }
        
        const verifyBtn = document.getElementById('verifyOtpBtn');
        const originalText = verifyBtn.textContent;
        verifyBtn.disabled = true;
        verifyBtn.textContent = 'Verifying...';
        
        try {
            // In a real app, you would verify the OTP with your backend
            // For now, we'll simulate a successful verification
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Show success message and redirect
            showMessage('Email verified successfully!', 'success');
            setTimeout(() => {
                hideOtpModal();
                // Redirect to dashboard or login page
                // Use the correct path to emp.html
                const basePath = window.location.pathname.split('/').slice(0, -1).join('/');
                window.location.href = basePath + '/emp.html';
            }, 1500);
            
        } catch (error) {
            console.error('Error verifying OTP:', error);
            document.getElementById('otpError').textContent = 'Invalid OTP. Please try again.';
        } finally {
            verifyBtn.textContent = originalText;
            verifyBtn.disabled = false;
        }
    });

    // Form submission handlers
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const role = document.getElementById('loginRole').value;
        const country = document.getElementById('loginCountry').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Clear previous error messages
        const emailError = document.getElementById('emailError');
        const passwordError = document.getElementById('passwordError');
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
        
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Get selected role
            const role = document.getElementById('loginRole').value;
            
            // Store user data in session storage
            sessionStorage.setItem('isAuthenticated', 'true');
            sessionStorage.setItem('userEmail', email);
            sessionStorage.setItem('userName', email.split('@')[0]);
            sessionStorage.setItem('userRole', role);
            
            // Store country and currency for the user
            const country = document.getElementById('loginCountry').value;
            const currency = getCurrencyForCountry(country);
            sessionStorage.setItem('userCountry', country);
            sessionStorage.setItem('userCurrency', currency);
            
            // For demo purposes, show success message and redirect
            showMessage('Login successful!', 'success');
            
            // Redirect based on role after a short delay
            setTimeout(() => {
                const basePath = window.location.pathname.split('/').slice(0, -1).join('/');
                if (role === 'employee') {
                    window.location.href = basePath + '/emp.html';
                } else if (role === 'manager' || role === 'admin') {
                    window.location.href = basePath + '/manage.html';
                }
            }, 1000);
            
        } catch (error) {
            console.error('Login error:', error);
            showMessage('Invalid email or password', 'error');
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
    
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const companyName = document.getElementById('companyName').value.trim();
        const country = countrySelect.value;
        
        // Clear previous error messages
        const emailError = document.getElementById('signupEmailError');
        const passwordError = document.getElementById('signupPasswordError');
        emailError.textContent = '';
        passwordError.textContent = '';
        
        // Basic validation
        if (!fullName || !email || !password || !companyName || !country) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        // Reset error states
        document.getElementById('signupEmail').parentElement.classList.remove('error');
        document.getElementById('signupPassword').parentElement.classList.remove('error');
        
        // Validate email
        if (!email) {
            emailError.textContent = 'Email is required';
            document.getElementById('signupEmail').parentElement.classList.add('error');
            return;
        } else if (!isValidEmail(email)) {
            emailError.textContent = 'Invalid email format';
            document.getElementById('signupEmail').parentElement.classList.add('error');
            return;
        }

        // Validate password
        if (!password) {
            passwordError.textContent = 'Password is required';
            document.getElementById('signupPassword').parentElement.classList.add('error');
            return;
        } else if (password.length !== 6) {
            passwordError.textContent = 'Password must be exactly 6 characters';
            document.getElementById('signupPassword').parentElement.classList.add('error');
            return;
        }
        
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';
        
        try {
            // In a real app, you would send this data to your backend
            // For now, we'll simulate a successful account creation
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show OTP modal
            showOtpModal(email);
            
            // In a real app, you would make an API call to register the user
            // and the backend would send an OTP to the user's email
            console.log('User registered:', { email, fullName, companyName, country });
            
            // Get currency for the selected country
            const currency = await getCurrencyForCountry(country);
            
            // Prepare data for the backend
            const userData = {
                fullName,
                email,
                password, // In a real app, this should be hashed
                company: {
                    name: companyName,
                    country,
                    currency: currency || 'USD' // Default to USD if currency not found
                }
            };
            
            console.log('User registration data:', userData);
            
        } catch (error) {
            console.error('Registration error:', error);
            showMessage('An error occurred during registration. Please try again.', 'error');
        } finally {
            // Reset button state
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
    
    // Helper function to get currency for a country
    async function getCurrencyForCountry(countryName) {
        try {
            const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fields=currencies`);
            const data = await response.json();
            
            if (data && data[0]?.currencies) {
                // Get the first currency code
                const currencyCode = Object.keys(data[0].currencies)[0];
                return currencyCode;
            }
        } catch (error) {
            console.error('Error fetching currency:', error);
        }
        return null;
    }
    
    // Helper function to validate email with comprehensive pattern matching
    function isValidEmail(email) {
        if (!email || typeof email !== 'string') return false;
        
        // Trim and convert to lowercase
        email = email.trim().toLowerCase();
        
        // Check basic email format
        const re = /^[a-z0-9]+(?:[._%+\-][a-z0-9]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;
        if (!re.test(email)) {
            return false;
        }
        
        // Additional checks for invalid patterns
        if (
            email.startsWith('.') || 
            email.endsWith('.') ||
            email.includes('..') ||
            email.includes('.@') ||
            email.includes('@.') ||
            email.split('@').length !== 2 ||
            email.indexOf('@') === 0 ||
            email.lastIndexOf('.') < email.indexOf('@') ||
            email.lastIndexOf('.') === email.length - 1
        ) {
            return false;
        }
        
        // Check for valid domain part
        const domainPart = email.split('@')[1];
        if (domainPart.split('.').some(part => part.length < 2)) {
            return false; // Each domain part should be at least 2 characters
        }
        
        return true;
    }
    
    // Helper function to show messages (for non-field specific messages)
    function showMessage(message, type) {
        // Remove any existing messages
        const existingMessage = document.querySelector('.global-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `global-message ${type}`;
        messageDiv.textContent = message;
        
        // Insert the message at the top of the form container
        const formContainer = document.querySelector('.form-container');
        if (formContainer) {
            formContainer.insertBefore(messageDiv, formContainer.firstChild);
            
            // Auto-hide message after 5 seconds
            setTimeout(() => {
                messageDiv.style.opacity = '0';
                setTimeout(() => messageDiv.remove(), 300);
            }, 5000);
        }
    }
    
    // Initialize the page
    loadCountries();
    
    // Add event listeners for real-time validation
    const loginEmail = document.getElementById('loginEmail');
    const signupEmail = document.getElementById('signupEmail');
    const loginPassword = document.getElementById('loginPassword');
    const signupPassword = document.getElementById('signupPassword');
    
    // Login email validation
    if (loginEmail) {
        loginEmail.addEventListener('input', function() {
            const email = this.value.trim();
            const emailError = document.getElementById('emailError');
            
            if (email && !isValidEmail(email)) {
                emailError.textContent = 'Please enter a valid email address';
                this.parentElement.classList.add('error');
            } else {
                emailError.textContent = '';
                this.parentElement.classList.remove('error');
            }
        });
    }
    
    // Signup email validation
    if (signupEmail) {
        signupEmail.addEventListener('input', function() {
            const email = this.value.trim();
            const emailError = document.getElementById('signupEmailError');
            
            if (email && !isValidEmail(email)) {
                emailError.textContent = 'Please enter a valid email address';
                this.parentElement.classList.add('error');
            } else {
                emailError.textContent = '';
                this.parentElement.classList.remove('error');
            }
        });
    }
    
    // Login password validation
    if (loginPassword) {
        loginPassword.addEventListener('input', function() {
            const password = this.value;
            const passwordError = document.getElementById('passwordError');
            
            if (password && password.length !== 6) {
                passwordError.textContent = 'Password must be exactly 6 characters';
                this.parentElement.classList.add('error');
            } else {
                passwordError.textContent = '';
                this.parentElement.classList.remove('error');
            }
        });
    }
    
    // Signup password validation
    if (signupPassword) {
        signupPassword.addEventListener('input', function() {
            const password = this.value;
            const passwordError = document.getElementById('signupPasswordError');
            
            if (password && password.length !== 6) {
                passwordError.textContent = 'Password must be exactly 6 characters';
                this.parentElement.classList.add('error');
            } else {
                passwordError.textContent = '';
                this.parentElement.classList.remove('error');
            }
        });
    }
    
    // Remove the debug button click handler since we're auto-filling now
    
    // Initialize the page
    loadCountries();
    
    // Check for URL parameters (e.g., for email verification or password reset)
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    
    if (status === 'verified') {
        showMessage('Email verified successfully! You can now log in.', 'success');
    } else if (status === 'reset_sent') {
        showMessage('Password reset link has been sent to your email.', 'success');
    } else if (status === 'reset_success') {
        showMessage('Password has been reset successfully! You can now log in with your new password.', 'success');
    }
});
