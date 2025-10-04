// DOM Elements
const userEmailElement = document.getElementById('userEmail');
const approvalsTableBody = document.getElementById('approvalsTableBody');
const searchInput = document.getElementById('searchExpenses');
const filterStatus = document.getElementById('filterByStatus');
const filterEmployee = document.getElementById('filterByEmployee');
const selectAllCheckbox = document.getElementById('selectAll');
const bulkApproveBtn = document.getElementById('bulkApproveBtn');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

// Modal Elements
const modal = document.getElementById('approvalModal');
const closeModal = document.querySelector('.close-modal');
const modalEmployeeName = document.getElementById('modalEmployeeName');
const modalSubmissionDate = document.getElementById('modalSubmissionDate');
const modalCategory = document.getElementById('modalCategory');
const modalDescription = document.getElementById('modalDescription');
const modalAmount = document.getElementById('modalAmount');
const modalConvertedAmount = document.getElementById('modalConvertedAmount');
const approvalComments = document.getElementById('approvalComments');
const approveBtn = document.getElementById('approveBtn');
const rejectBtn = document.getElementById('rejectBtn');

// Receipt Modal
const receiptModal = document.getElementById('receiptModal');
const closeReceiptModal = document.querySelector('.close-receipt-modal');
const receiptImage = document.getElementById('receiptImage');

// Navigation
const approvalQueueLink = document.getElementById('approvalQueueLink');
const teamExpensesLink = document.getElementById('teamExpensesLink');
const personalExpensesLink = document.getElementById('personalExpensesLink');
const logoutBtn = document.getElementById('logoutBtn');

// State
let currentPage = 1;
const itemsPerPage = 10;
let allExpenses = [];
let filteredExpenses = [];
let selectedExpenses = new Set();
let currentExpenseId = null;

// Currency Conversion Rates (mock data - in a real app, this would come from an API)
const exchangeRates = {
    USD: 1,
    EUR: 0.85,
    GBP: 0.73,
    INR: 83.42,
    JPY: 110.25,
    AUD: 1.36,
    CAD: 1.26,
    SGD: 1.35,
    AED: 3.67
};

// Sample Data (in a real app, this would come from an API)
const sampleExpenses = [
    {
        id: 'exp-1001',
        employeeId: 'emp-001',
        employeeName: 'John Doe',
        submissionDate: '2023-10-01T14:30:00',
        category: 'Travel',
        description: 'Flight to New York for client meeting',
        amount: 450.00,
        currency: 'USD',
        receipt: 'receipt1.jpg',
        status: 'pending',
        approvalStep: 1,
        totalSteps: 3,
        history: [
            { step: 1, status: 'submitted', date: '2023-10-01T14:30:00', by: 'John Doe' },
            { step: 2, status: 'pending', date: null, by: 'Manager Review' },
            { step: 3, status: 'pending', date: null, by: 'Finance' }
        ]
    },
    {
        id: 'exp-1002',
        employeeId: 'emp-002',
        employeeName: 'Jane Smith',
        submissionDate: '2023-10-02T09:15:00',
        category: 'Meals',
        description: 'Team lunch with clients',
        amount: 120.50,
        currency: 'EUR',
        receipt: 'receipt2.jpg',
        status: 'pending',
        approvalStep: 2,
        totalSteps: 3,
        history: [
            { step: 1, status: 'submitted', date: '2023-10-02T09:15:00', by: 'Jane Smith' },
            { step: 2, status: 'approved', date: '2023-10-02T11:30:00', by: 'Manager' },
            { step: 3, status: 'pending', date: null, by: 'Finance' }
        ]
    },
    // Add more sample data as needed
];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadUserData();
    initializeEventListeners();
    loadExpenses();
    updatePagination();
});

// Check if user is authenticated
function checkAuth() {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    const userRole = sessionStorage.getItem('userRole');
    
    if (!isAuthenticated || userRole !== 'manager') {
        window.location.href = 'login.html';
        return;
    }
}

// Load user data from session storage
function loadUserData() {
    const email = sessionStorage.getItem('userEmail');
    const name = sessionStorage.getItem('userName');
    
    if (email) {
        userEmailElement.textContent = email;
    }
    
    // Update page title with user's name if available
    if (name) {
        document.title = `${name}'s Manager Dashboard - SafeNavi`;
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Search and filter events
    searchInput.addEventListener('input', filterExpenses);
    filterStatus.addEventListener('change', filterExpenses);
    filterEmployee.addEventListener('change', filterExpenses);
    
    // Table events
    selectAllCheckbox.addEventListener('change', toggleSelectAll);
    bulkApproveBtn.addEventListener('click', handleBulkApprove);
    
    // Pagination events
    prevPageBtn.addEventListener('click', () => changePage(-1));
    nextPageBtn.addEventListener('click', () => changePage(1));
    
    // Modal events
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    closeReceiptModal.addEventListener('click', () => receiptModal.style.display = 'none');
    approveBtn.addEventListener('click', () => handleApproval('approved'));
    rejectBtn.addEventListener('click', () => handleApproval('rejected'));
    
    // Navigation events
    logoutBtn.addEventListener('click', handleLogout);
    
    // Team expenses link - using direct href in HTML
    // No need for preventDefault as we want normal link behavior
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
        if (e.target === receiptModal) receiptModal.style.display = 'none';
    });
}

// Load expenses (in a real app, this would be an API call)
function loadExpenses() {
    // Simulate API call delay
    showLoading(true);
    
    setTimeout(() => {
        allExpenses = [...sampleExpenses];
        filterExpenses();
        showLoading(false);
    }, 500);
}

// Filter expenses based on search and filters
function filterExpenses() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilter = filterStatus.value;
    const employeeFilter = filterEmployee.value;
    
    filteredExpenses = allExpenses.filter(expense => {
        const matchesSearch = 
            expense.employeeName.toLowerCase().includes(searchTerm) ||
            expense.category.toLowerCase().includes(searchTerm) ||
            expense.description.toLowerCase().includes(searchTerm);
            
        const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
        const matchesEmployee = employeeFilter === 'all' || expense.employeeId === employeeFilter;
        
        return matchesSearch && matchesStatus && matchesEmployee;
    });
    
    currentPage = 1; // Reset to first page when filters change
    updateTable();
    updatePagination();
}

// Update the expenses table
function updateTable() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + itemsPerPage);
    
    approvalsTableBody.innerHTML = '';
    
    if (paginatedExpenses.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="8" class="text-center py-4">
                No expenses found matching your criteria.
            </td>
        `;
        approvalsTableBody.appendChild(row);
        return;
    }
    
    paginatedExpenses.forEach(expense => {
        const row = document.createElement('tr');
        const isSelected = selectedExpenses.has(expense.id);
        
        row.innerHTML = `
            <td><input type="checkbox" class="expense-checkbox" data-id="${expense.id}" ${isSelected ? 'checked' : ''}></td>
            <td>${expense.employeeName}</td>
            <td>${formatDate(expense.submissionDate)}</td>
            <td>${expense.category}</td>
            <td>${expense.description}</td>
            <td>${formatCurrency(expense.amount, expense.currency)}</td>
            <td><span class="status-badge status-${expense.status}">${formatStatus(expense.status)}</span></td>
            <td>
                <button class="btn-view" data-id="${expense.id}">
                    <i class="fas fa-eye"></i> Review
                </button>
            </td>
        `;
        
        approvalsTableBody.appendChild(row);
    });
    
    // Add event listeners to checkboxes and view buttons
    document.querySelectorAll('.expense-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });
    
    document.querySelectorAll('.btn-view').forEach(button => {
        button.addEventListener('click', () => openApprovalModal(button.dataset.id));
    });
    
    // Update select all checkbox state
    updateSelectAllCheckbox();
    updateBulkApproveButton();
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
    
    pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Change page
function changePage(direction) {
    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
    const newPage = currentPage + direction;
    
    if (newPage > 0 && newPage <= totalPages) {
        currentPage = newPage;
        updateTable();
        updatePagination();
    }
}

// Toggle select all checkboxes
function toggleSelectAll() {
    const checkboxes = document.querySelectorAll('.expense-checkbox');
    const isChecked = selectAllCheckbox.checked;
    
    checkboxes.forEach(checkbox => {
        const expenseId = checkbox.dataset.id;
        checkbox.checked = isChecked;
        
        if (isChecked) {
            selectedExpenses.add(expenseId);
        } else {
            selectedExpenses.delete(expenseId);
        }
    });
    
    updateBulkApproveButton();
}

// Handle individual checkbox change
function handleCheckboxChange(e) {
    const expenseId = e.target.dataset.id;
    
    if (e.target.checked) {
        selectedExpenses.add(expenseId);
    } else {
        selectedExpenses.delete(expenseId);
    }
    
    updateSelectAllCheckbox();
    updateBulkApproveButton();
}

// Update select all checkbox state
function updateSelectAllCheckbox() {
    const checkboxes = document.querySelectorAll('.expense-checkbox');
    const allChecked = checkboxes.length > 0 && Array.from(checkboxes).every(checkbox => checkbox.checked);
    
    selectAllCheckbox.checked = allChecked;
    selectAllCheckbox.indeterminate = !allChecked && selectedExpenses.size > 0;
}

// Update bulk approve button state
function updateBulkApproveButton() {
    bulkApproveBtn.disabled = selectedExpenses.size === 0;
}

// Handle bulk approval
function handleBulkApprove() {
    if (selectedExpenses.size === 0) return;
    
    if (confirm(`Approve ${selectedExpenses.size} selected expense(s)?`)) {
        showLoading(true);
        
        // Simulate API call
        setTimeout(() => {
            selectedExpenses.forEach(id => {
                const expense = allExpenses.find(e => e.id === id);
                if (expense) {
                    expense.status = 'approved';
                    expense.approvalStep++;
                    
                    // Update history
                    const currentStep = expense.history.find(h => h.status === 'pending');
                    if (currentStep) {
                        currentStep.status = 'approved';
                        currentStep.date = new Date().toISOString();
                        currentStep.by = sessionStorage.getItem('userName') || 'Manager';
                    }
                }
            });
            
            selectedExpenses.clear();
            filterExpenses();
            showLoading(false);
            showNotification(`${selectedExpenses.size} expense(s) approved successfully!`, 'success');
        }, 1000);
    }
}

// Open approval modal
function openApprovalModal(expenseId) {
    const expense = allExpenses.find(e => e.id === expenseId);
    if (!expense) return;
    
    currentExpenseId = expenseId;
    
    // Update modal content
    modalEmployeeName.textContent = expense.employeeName;
    modalSubmissionDate.textContent = formatDateTime(expense.submissionDate);
    modalCategory.textContent = expense.category;
    modalDescription.textContent = expense.description;
    modalAmount.textContent = formatCurrency(expense.amount, expense.currency);
    
    // Show converted amount if not in company currency
    const companyCurrency = sessionStorage.getItem('userCurrency') || 'USD';
    if (expense.currency !== companyCurrency) {
        const convertedAmount = convertCurrency(expense.amount, expense.currency, companyCurrency);
        modalConvertedAmount.textContent = `(${formatCurrency(convertedAmount, companyCurrency)})`;
        modalConvertedAmount.style.display = 'inline';
    } else {
        modalConvertedAmount.style.display = 'none';
    }
    
    // Update approval steps
    updateApprovalSteps(expense);
    
    // Reset form
    approvalComments.value = '';
    
    // Show modal
    modal.style.display = 'block';
}

// Update approval steps in modal
function updateApprovalSteps(expense) {
    const stepsContainer = document.querySelector('.approval-steps');
    stepsContainer.innerHTML = '';
    
    expense.history.forEach((step, index) => {
        const stepElement = document.createElement('div');
        stepElement.className = 'step';
        
        if (step.status === 'approved') stepElement.classList.add('completed');
        if (step.status === 'pending') stepElement.classList.add('active');
        
        stepElement.innerHTML = `
            <div class="step-number">${step.step}</div>
            <div class="step-label">${step.by}</div>
        `;
        
        stepsContainer.appendChild(stepElement);
        
        // Add connector if not the last step
        if (index < expense.history.length - 1) {
            const connector = document.createElement('div');
            connector.className = 'step-connector';
            stepsContainer.appendChild(connector);
        }
    });
}

// Handle approval/rejection
function handleApproval(decision) {
    if (decision === 'rejected' && !approvalComments.value.trim()) {
        alert('Please provide a reason for rejection.');
        return;
    }
    
    const expense = allExpenses.find(e => e.id === currentExpenseId);
    if (!expense) return;
    
    showLoading(true);
    
    // Simulate API call
    setTimeout(() => {
        expense.status = decision === 'approved' ? 'approved' : 'rejected';
        
        // Update history
        const currentStep = expense.history.find(h => h.status === 'pending');
        if (currentStep) {
            currentStep.status = decision;
            currentStep.date = new Date().toISOString();
            currentStep.by = sessionStorage.getItem('userName') || 'Manager';
            currentStep.comments = decision === 'rejected' ? approvalComments.value : '';
            
            // Move to next step if approved and not last step
            if (decision === 'approved' && expense.approvalStep < expense.totalSteps) {
                expense.approvalStep++;
            }
        }
        
        // Close modal and refresh data
        modal.style.display = 'none';
        filterExpenses();
        showLoading(false);
        showNotification(`Expense ${decision} successfully!`, 'success');
    }, 1000);
}

// View receipt
function viewReceipt(receiptUrl) {
    receiptImage.src = receiptUrl;
    receiptModal.style.display = 'block';
}

// Format currency
function formatCurrency(amount, currency) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Convert currency
function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;
    
    const fromRate = exchangeRates[fromCurrency] || 1;
    const toRate = exchangeRates[toCurrency] || 1;
    
    // Convert to USD first, then to target currency
    return (amount / fromRate) * toRate;
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '-';
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Format date and time
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '-';
    
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return new Date(dateTimeString).toLocaleString('en-US', options);
}

// Format status
function formatStatus(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

// Show loading state
function showLoading(show) {
    const loadingElement = document.createElement('div');
    loadingElement.id = 'loadingOverlay';
    loadingElement.style.position = 'fixed';
    loadingElement.style.top = '0';
    loadingElement.style.left = '0';
    loadingElement.style.width = '100%';
    loadingElement.style.height = '100%';
    loadingElement.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    loadingElement.style.display = 'flex';
    loadingElement.style.justifyContent = 'center';
    loadingElement.style.alignItems = 'center';
    loadingElement.style.zIndex = '9999';
    loadingElement.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin fa-3x" style="color: var(--primary-color);"></i>
            <p style="margin-top: 15px; font-weight: 500;">Processing...</p>
        </div>
    `;
    
    if (show) {
        document.body.appendChild(loadingElement);
    } else {
        const existingLoader = document.getElementById('loadingOverlay');
        if (existingLoader) {
            existingLoader.remove();
        }
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Position the notification
    const header = document.querySelector('header');
    if (header) {
        const headerRect = header.getBoundingClientRect();
        notification.style.top = `${headerRect.bottom + 10}px`;
        notification.style.right = '30px';
    }
    
    // Add show class with a small delay for the animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Handle logout
function handleLogout() {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('userName');
    window.location.href = 'login.html';
}

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 80px;
        right: -400px;
        background: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        transition: right 0.3s ease-in-out;
        max-width: 350px;
        border-left: 4px solid var(--primary-color);
    }
    
    .notification.show {
        right: 30px;
    }
    
    .notification-success {
        border-left-color: var(--success-color);
    }
    
    .notification-error {
        border-left-color: var(--danger-color);
    }
    
    .notification-warning {
        border-left-color: var(--warning-color);
    }
`;

document.head.appendChild(notificationStyles);
