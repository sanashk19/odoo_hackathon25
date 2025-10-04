// DOM Elements
const expensesTableBody = document.getElementById('expensesTableBody');
const searchInput = document.getElementById('searchExpenses');
const statusFilter = document.getElementById('statusFilter');
const dateFilter = document.getElementById('dateFilter');
const toSubmitAmount = document.getElementById('toSubmitAmount');
const waitingApprovalAmount = document.getElementById('waitingApprovalAmount');
const newExpenseBtn = document.getElementById('newExpenseBtn');
const expenseModal = document.getElementById('expenseDetailsModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const expenseDetailsContent = document.getElementById('expenseDetailsContent');
const notificationCenter = document.getElementById('notificationCenter');

// Sample data - In a real app, this would come from an API
let expenses = [];
let sortConfig = { key: 'date', direction: 'desc' };

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadExpenses();
    setupEventListeners();
    updateSummaryCards();
});

// Load expenses from localStorage or use sample data
function loadExpenses() {
    const savedExpenses = localStorage.getItem('expenses');
    expenses = savedExpenses ? JSON.parse(savedExpenses) : [
        {
            id: '1',
            date: '2025-10-01',
            description: 'Client Meeting Lunch',
            category: 'Food',
            amount: 45.67,
            status: 'approved',
            receipt: 'receipt1.jpg',
            submittedAt: '2025-10-01T14:30:00',
            approvedAt: '2025-10-02T09:15:00',
            approvedBy: 'John Doe',
            comments: 'Client meeting at downtown restaurant',
            currency: 'USD'
        },
        {
            id: '2',
            date: '2025-10-05',
            description: 'Flight to Conference',
            category: 'Travel',
            amount: 350.00,
            status: 'pending',
            receipt: 'receipt2.pdf',
            submittedAt: '2025-10-05T16:45:00',
            comments: 'Round trip to TechConf 2025',
            currency: 'USD'
        },
        {
            id: '3',
            date: '2025-10-10',
            description: 'Office Supplies',
            category: 'Office',
            amount: 125.89,
            status: 'draft',
            receipt: 'receipt3.jpg',
            currency: 'USD'
        },
        {
            id: '4',
            date: '2025-09-28',
            description: 'Team Dinner',
            category: 'Food',
            amount: 187.45,
            status: 'rejected',
            receipt: 'receipt4.jpg',
            submittedAt: '2025-09-28T20:15:00',
            rejectedAt: '2025-09-29T10:30:00',
            rejectedBy: 'Jane Smith',
            comments: 'Team dinner exceeds per diem limit',
            currency: 'USD'
        },
        {
            id: '5',
            date: '2025-10-12',
            description: 'Taxi to Airport',
            category: 'Travel',
            amount: 32.50,
            status: 'submitted',
            receipt: 'receipt5.jpg',
            submittedAt: '2025-10-12T08:20:00',
            currency: 'USD'
        }
    ];
    
    renderExpensesTable();
}

// Save expenses to localStorage
function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Filter changes
    if (statusFilter) statusFilter.addEventListener('change', renderExpensesTable);
    if (dateFilter) dateFilter.addEventListener('change', handleDateFilterChange);
    
    // Table header sorting
    document.querySelectorAll('th[data-sort]').forEach(header => {
        header.addEventListener('click', () => handleSort(header.dataset.sort));
    });
    
    // New Expense button
    if (newExpenseBtn) {
        newExpenseBtn.addEventListener('click', () => window.location.href = 'emp.html');
    }
    
    // Close modal functionality
    setupModalCloseHandlers();
    
    // Close notification when clicking the close button
    if (notificationCenter) {
        notificationCenter.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-notification')) {
                e.target.closest('.notification').remove();
            }
        });
    }
}

// Set up modal close handlers
function setupModalCloseHandlers() {
    console.log('Setting up modal close handlers...');
    
    // Close modal when clicking the close button (×)
    if (closeModalBtn) {
        console.log('Found close button, adding click handler');
        closeModalBtn.addEventListener('click', function(e) {
            console.log('Close button clicked');
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        });
    } else {
        console.error('Close button not found!');
    }
    
    // Close modal when clicking outside the modal content
    if (expenseModal) {
        expenseModal.addEventListener('click', function(e) {
            if (e.target === this) {
                console.log('Clicked outside modal content');
                closeModal();
            }
        });
    }
    
    // Close modal when pressing the Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && expenseModal && expenseModal.style.display === 'block') {
            console.log('Escape key pressed');
            closeModal();
        }
    });
}

// Close modal function
function closeModal() {
    if (expenseModal) {
        expenseModal.style.display = 'none';
        // Clear any form data if needed
        const forms = expenseModal.querySelectorAll('form');
        forms.forEach(form => form.reset());
    }
}

// Render expenses table
function renderExpensesTable() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilterValue = statusFilter.value;
    const dateFilterValue = dateFilter.value;
    
    // Filter expenses
    let filteredExpenses = expenses.filter(expense => {
        const matchesSearch = !searchTerm || 
            expense.description.toLowerCase().includes(searchTerm) ||
            expense.category.toLowerCase().includes(searchTerm) ||
            expense.amount.toString().includes(searchTerm);
            
        const matchesStatus = statusFilterValue === 'all' || 
            (statusFilterValue === 'submitted' && expense.status === 'pending') ||
            expense.status === statusFilterValue;
            
        const matchesDate = filterByDate(expense, dateFilterValue);
        
        return matchesSearch && matchesStatus && matchesDate;
    });
    
    // Sort expenses
    filteredExpenses.sort((a, b) => {
        let valueA, valueB;
        
        switch (sortConfig.key) {
            case 'date':
                valueA = new Date(a.date);
                valueB = new Date(b.date);
                break;
            case 'amount':
                valueA = a.amount;
                valueB = b.amount;
                break;
            case 'status':
                valueA = a.status;
                valueB = b.status;
                break;
            case 'category':
                valueA = a.category;
                valueB = b.category;
                break;
            case 'description':
            default:
                valueA = a.description;
                valueB = b.description;
        }
        
        if (valueA < valueB) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });
    
    // Clear table
    expensesTableBody.innerHTML = '';
    
    // Add rows
    if (filteredExpenses.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="text-center">
                No expenses found. Click "New Expense" to add one.
            </td>
        `;
        expensesTableBody.appendChild(row);
        return;
    }
    
    filteredExpenses.forEach(expense => {
        const row = document.createElement('tr');
        row.dataset.id = expense.id;
        
        // Format date
        const formattedDate = new Date(expense.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Status badge
        const statusBadge = `<span class="status-badge status-${expense.status}">${expense.status}</span>`;
        
        // Action buttons
        let actions = `
            <button class="btn btn-sm btn-outline view-expense" data-id="${expense.id}">
                <i class="fas fa-eye"></i> View
            </button>
        `;
        
        if (expense.status === 'draft') {
            actions += `
                <button class="btn btn-sm btn-outline edit-expense" data-id="${expense.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-outline delete-expense" data-id="${expense.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
        }
        
        // Create row HTML
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${expense.description}</td>
            <td>${expense.category}</td>
            <td>${formatCurrency(expense.amount, expense.currency)}</td>
            <td>${statusBadge}</td>
            <td class="actions">
                <div class="btn-group">
                    ${actions}
                </div>
            </td>
        `;
        
        expensesTableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.view-expense').forEach(btn => {
        btn.addEventListener('click', (e) => viewExpense(e.target.closest('button').dataset.id));
    });
    
    document.querySelectorAll('.edit-expense').forEach(btn => {
        btn.addEventListener('click', (e) => editExpense(e.target.closest('button').dataset.id));
    });
    
    document.querySelectorAll('.delete-expense').forEach(btn => {
        btn.addEventListener('click', (e) => confirmDeleteExpense(e.target.closest('button').dataset.id));
    });
}

// View expense details
function viewExpense(id) {
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;
    
    const formattedDate = new Date(expense.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
    
    // Initialize managerComments array if it doesn't exist
    if (!expense.managerComments) {
        expense.managerComments = [];
        saveExpenses();
    }
    
    let statusInfo = '';
    if (expense.status === 'approved' && expense.approvedAt) {
        const approvedDate = new Date(expense.approvedAt).toLocaleString();
        statusInfo = `
            <div class="status-info approved">
                <i class="fas fa-check-circle"></i>
                <div>
                    <h4>Approved</h4>
                    <p>Approved by ${expense.approvedBy} on ${approvedDate}</p>
                </div>
            </div>
        `;
    } else if (expense.status === 'rejected' && expense.rejectedAt) {
        const rejectedDate = new Date(expense.rejectedAt).toLocaleString();
        statusInfo = `
            <div class="status-info rejected">
                <i class="fas fa-times-circle"></i>
                <div>
                    <h4>Rejected</h4>
                    <p>Rejected by ${expense.rejectedBy} on ${rejectedDate}</p>
                    ${expense.comments ? `<p class="comments">${expense.comments}</p>` : ''}
                </div>
            </div>
        `;
    } else if (expense.status === 'pending' && expense.submittedAt) {
        const submittedDate = new Date(expense.submittedAt).toLocaleString();
        statusInfo = `
            <div class="status-info pending">
                <i class="fas fa-clock"></i>
                <div>
                    <h4>Pending Approval</h4>
                    <p>Submitted on ${submittedDate}</p>
                </div>
            </div>
        `;
    }
    
    // Get user's currency for consistent formatting
    const displayCurrency = expense.currency || sessionStorage.getItem('userCurrency') || 'USD';
    
    expenseDetailsContent.innerHTML = `
        <div class="expense-details">
            <div class="expense-header">
                <h3>${expense.description}</h3>
                <span class="amount">${formatCurrency(expense.amount, displayCurrency)}</span>
            </div>
            
            <div class="expense-meta">
                <div class="meta-item">
                    <span class="label">Date</span>
                    <span class="value">${formattedDate}</span>
                </div>
                <div class="meta-item">
                    <span class="label">Category</span>
                    <span class="value">${expense.category}</span>
                </div>
                <div class="meta-item">
                    <span class="label">Status</span>
                    <span class="status-badge status-${expense.status}">${expense.status}</span>
                </div>
            </div>
            
            ${statusInfo}
            
            ${expense.comments && expense.status !== 'rejected' ? `
                <div class="comments-section">
                    <h4>Notes</h4>
                    <p>${expense.comments}</p>
                </div>
            ` : ''}
            
            ${expense.receipt ? `
                <div class="receipt-section">
                    <div class="section-header">
                        <h4>
                            Receipt
                            <div class="tooltip">
                                <i class="fas fa-question-circle"></i>
                                <span class="tooltiptext">
                                    <strong>Receipt Guidelines:</strong><br>
                                    • Must be in JPG, PNG or PDF format<br>
                                    • Must clearly show total amount and date<br>
                                    • Must be readable and not blurry
                                </span>
                            </div>
                        </h4>
                    </div>
                    <div class="receipt-preview">
                        <img src="images/${expense.receipt}" alt="Receipt" id="receiptImage-${expense.id}" data-expense-id="${expense.id}" />
                    </div>
                    <button class="download-receipt" data-expense-id="${expense.id}">
                        <i class="fas fa-download"></i> Download Receipt
                    </button>
                </div>
            ` : ''}
            
            <div class="expense-actions mt-4">
                ${expense.status === 'draft' ? `
                    <button class="btn btn-primary" id="submitExpenseBtn" data-id="${expense.id}">
                        <i class="fas fa-paper-plane"></i> Submit for Approval
                    </button>
                    <button class="btn btn-outline edit-expense" data-id="${expense.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                ` : ''}
                
                ${expense.status === 'pending' ? `
                    <button class="btn btn-outline" id="cancelSubmissionBtn" data-id="${expense.id}">
                        <i class="fas fa-times"></i> Cancel Submission
                    </button>
                ` : ''}
                
                <button class="btn btn-outline print-expense">
                    <i class="fas fa-print"></i> Print
                </button>
            </div>
        </div>
    `;
    
    // Initialize tabs
    function setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanes = document.querySelectorAll('.tab-pane');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and panes
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                
                // Add active class to clicked button and corresponding pane
                button.classList.add('active');
                const tabId = button.getAttribute('data-tab') + 'Tab';
                document.getElementById(tabId).classList.add('active');
            });
        });
    }
    
    // Initialize comment submission
    function setupCommentForm(expense) {
        const commentForm = document.getElementById('commentForm');
        const commentInput = document.getElementById('commentText');
        
        if (commentForm) {
            commentForm.onsubmit = (e) => {
                e.preventDefault();
                const commentText = commentInput.value.trim();
                
                if (commentText) {
                    // Create new comment
                    const newComment = {
                        id: Date.now().toString(),
                        text: commentText,
                        timestamp: new Date().toISOString(),
                        author: 'Current User', // In a real app, use the actual user's name
                        role: 'Employee' // In a real app, use the actual user's role
                    };
                    
                    // Initialize comments array if it doesn't exist
                    if (!expense.comments) {
                        expense.comments = [];
                    }
                    
                    // Add comment and save
                    expense.comments.push(newComment);
                    saveExpenses();
                    
                    // Update UI
                    updateCommentsTab(expense);
                    commentInput.value = '';
                    
                    // Show success message
                    showNotification('Comment added successfully', 'success');
                }
            };
        }
        
        // Handle cancel button
        const cancelBtn = document.getElementById('cancelComment');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                commentInput.value = '';
            });
        }
    }
    
    // Initialize tabs and comment form
    setupTabs();
    setupCommentForm(expense);
    
        // Function to update the comments tab
    function updateCommentsTab(expense) {
        const commentsContainer = document.getElementById('expenseComments');
        const commentCountElement = document.getElementById('commentCount');
        
        // Initialize comments array if it doesn't exist
        if (!expense.comments || expense.comments.length === 0) {
            commentsContainer.innerHTML = '<div class="no-comments">No comments yet. Be the first to add one!</div>';
            if (commentCountElement) {
                commentCountElement.textContent = '(0)';
            }
            return;
        }
        
        // Update comment count
        if (commentCountElement) {
            commentCountElement.textContent = `(${expense.comments.length})`;
        }
        
        // Sort comments by timestamp (newest first)
        const sortedComments = [...expense.comments].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        // Generate HTML for comments
        const commentsHTML = sortedComments.map(comment => `
            <div class="comment">
                <div class="comment-header">
                    <span class="comment-author">${comment.author} <span class="comment-role">${comment.role}</span></span>
                    <span class="comment-date">${formatDate(comment.timestamp)}</span>
                </div>
                <div class="comment-body">
                    <p>${escapeHtml(comment.text)}</p>
                </div>
            </div>
        `).join('');
        
        commentsContainer.innerHTML = commentsHTML;
    }
    
    // Helper function to format date
    function formatDate(dateString) {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
    
    // Helper function to escape HTML
    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // Initialize comments tab
    updateCommentsTab(expense);
    
    // Set up cancel comment button
    const cancelCommentBtn = document.getElementById('cancelComment');
    if (cancelCommentBtn) {
        cancelCommentBtn.addEventListener('click', () => {
            document.getElementById('commentText').value = '';
        });
    }
    
    // Add event listeners to action buttons
    const submitBtn = document.getElementById('submitExpenseBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => submitExpenseForApproval(submitBtn.dataset.id));
    }
    
    const cancelBtn = document.getElementById('cancelSubmissionBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => cancelExpenseSubmission(cancelBtn.dataset.id));
    }
    
    const editBtn = expenseDetailsContent.querySelector('.edit-expense');
    if (editBtn) {
        editBtn.addEventListener('click', () => editExpense(editBtn.dataset.id));
    }
    
    const printBtn = expenseDetailsContent.querySelector('.print-expense');
    if (printBtn) {
        printBtn.addEventListener('click', () => window.print());
    }
    
    // Show modal
    expenseModal.style.display = 'flex';
    
    // Helper function to update comments tab
    function updateCommentsTab(expense) {
        const commentsContainer = document.getElementById('expenseComments');
        const commentsTabBtn = document.querySelector('[data-tab="comments"]');
        
        if (!expense.managerComments || expense.managerComments.length === 0) {
            commentsContainer.innerHTML = '<div class="no-comments">No comments yet. Be the first to add one!</div>';
            if (commentsTabBtn) commentsTabBtn.textContent = 'Comments (0)';
            return;
        }
        
        // Update comments count in tab button
        if (commentsTabBtn) {
            commentsTabBtn.textContent = `Comments (${expense.managerComments.length})`;
        }
        
        // Sort comments by timestamp (newest first)
        const sortedComments = [...expense.managerComments].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        // Render comments
        commentsContainer.innerHTML = sortedComments.map(comment => `
            <div class="comment">
                <div class="comment-header">
                    <span class="comment-author">${comment.author} <span class="comment-role">${comment.role}</span></span>
                    <span class="comment-date">${new Date(comment.timestamp).toLocaleString()}</span>
                </div>
                <div class="comment-body">
                    <p>${comment.text}</p>
                </div>
            </div>
        `).join('');
    }
}

// Edit expense
function editExpense(id) {
    // In a real app, this would open the edit form
    // For now, redirect to the main page with edit mode
    window.location.href = `emp.html?edit=${id}`;
}

// Submit expense for approval
function submitExpenseForApproval(id) {
    const expense = expenses.find(exp => exp.id === id);
    if (!expense) return;
    
    // Show confirmation dialog
    if (confirm('Are you sure you want to submit this expense for approval?')) {
        // Update status
        expense.status = 'pending';
        expense.submittedAt = new Date().toISOString();
        
        // Save changes
        saveExpenses();
        
        // Update UI
        renderExpensesTable();
        updateSummaryCards();
        
        // Show success message
        showNotification('Expense submitted for approval', 'success');
        
        // Close modal
        closeModal();
        
        // If this was the last draft, update the UI
        const draftExpenses = expenses.filter(exp => exp.status === 'draft');
        if (draftExpenses.length === 0) {
            const submitAllBtn = document.getElementById('submitAllBtn');
            if (submitAllBtn) {
                submitAllBtn.disabled = true;
            }
        }
    }
}

// Submit all draft expenses for approval
function submitAllDrafts() {
    const draftExpenses = expenses.filter(exp => exp.status === 'draft');
    
    if (draftExpenses.length === 0) {
        showNotification('No draft expenses to submit', 'info');
        return;
    }
    
    if (confirm(`Are you sure you want to submit ${draftExpenses.length} draft expense(s) for approval?`)) {
        const currentTime = new Date().toISOString();
        
        expenses = expenses.map(exp => {
            if (exp.status === 'draft') {
                return {
                    ...exp,
                    status: 'pending',
                    submittedAt: currentTime
                };
            }
            return exp;
        });
        
        saveExpenses();
        renderExpensesTable();
        updateSummaryCards();
        showNotification(`Successfully submitted ${draftExpenses.length} expense(s) for approval`, 'success');
        
        // Update the submit all button state
        const submitAllBtn = document.getElementById('submitAllBtn');
        if (submitAllBtn) {
            submitAllBtn.disabled = true;
            submitAllBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit All';
        }
    }
}

// Cancel expense submission
function cancelExpenseSubmission(id) {
    if (!confirm('Are you sure you want to cancel this submission? You can submit it again later.')) {
        return;
    }
    
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;
    
    // Update status
    expense.status = 'draft';
    
    // Save changes
    saveExpenses();
    
    // Update UI
    renderExpensesTable();
    updateSummaryCards();
    
    // Show success message
    showNotification('Submission cancelled', 'success');
    
    // Close modal
    expenseModal.style.display = 'none';
}

// Confirm delete expense
function confirmDeleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
        return;
    }
    
    deleteExpense(id);
}

// Delete expense
function deleteExpense(id) {
    const index = expenses.findIndex(e => e.id === id);
    if (index === -1) return;
    
    // Remove expense
    expenses.splice(index, 1);
    
    // Save changes
    saveExpenses();
    
    // Update UI
    renderExpensesTable();
    updateSummaryCards();
    
    // Show success message
    showNotification('Expense deleted', 'success');
}

// Handle search
function handleSearch() {
    renderExpensesTable();
}

// Handle date filter change
function handleDateFilterChange() {
    renderExpensesTable();
}

// Filter expenses by date
function filterByDate(expense, filterValue) {
    if (filterValue === 'all') return true;
    
    const today = new Date();
    const expenseDate = new Date(expense.date);
    
    switch (filterValue) {
        case 'thisMonth':
            return expenseDate.getMonth() === today.getMonth() && 
                   expenseDate.getFullYear() === today.getFullYear();
        case 'lastMonth':
            const lastMonth = new Date(today);
            lastMonth.setMonth(today.getMonth() - 1);
            return expenseDate.getMonth() === lastMonth.getMonth() && 
                   expenseDate.getFullYear() === lastMonth.getFullYear();
        case 'thisYear':
            return expenseDate.getFullYear() === today.getFullYear();
        default:
            return true;
    }
}

// Handle table sorting
function handleSort(key) {
    // Toggle sort direction if same key is clicked
    if (sortConfig.key === key) {
        sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
        sortConfig = { key, direction: 'asc' };
    }
    
    // Update sort indicators
    document.querySelectorAll('th[data-sort]').forEach(header => {
        const icon = header.querySelector('i');
        if (header.dataset.sort === key) {
            icon.className = `fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`;
        } else {
            icon.className = 'fas fa-sort';
        }
    });
    
    // Re-render table
    renderExpensesTable();
}

// Update summary cards with currency
function updateSummaryCards() {
    // Get user's currency from session storage or default to USD
    const userCurrency = sessionStorage.getItem('userCurrency') || 'USD';
    
    // Calculate totals
    const toSubmitTotal = expenses
        .filter(e => e.status === 'draft')
        .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        
    const waitingApprovalTotal = expenses
        .filter(e => e.status === 'pending' || e.status === 'submitted')
        .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    
    // Format amounts with currency symbol
    const formatAmount = (amount) => {
        try {
            // Use the same formatting as the rest of the app
            return formatCurrency(amount, userCurrency);
        } catch (e) {
            // Fallback formatting if Intl.NumberFormat fails
            const symbol = {
                'USD': '$',
                'GBP': '£',
                'INR': '₹',
                'JPY': '¥',
                'EUR': '€'
            }[userCurrency] || '$';
            return `${symbol}${amount.toFixed(2)}`;
        }
    };
    
    // Update UI with formatted amounts
    toSubmitAmount.textContent = formatAmount(toSubmitTotal);
    waitingApprovalAmount.textContent = formatAmount(waitingApprovalTotal);
}

// Format currency based on user's country and currency settings
function formatCurrency(amount, currency) {
    try {
        // Get user's currency from parameters or session storage
        const userCurrency = currency || sessionStorage.getItem('userCurrency') || 'USD';
        
        // Special handling for Indian Rupee symbol
        if (userCurrency === 'INR') {
            return `₹${parseFloat(amount).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        }
        
        // Get user's country for locale settings
        const userCountry = sessionStorage.getItem('userCountry') || 'US';
        
        // Map country names to locale strings for better number formatting
        const localeMap = {
            'United States': 'en-US',
            'United Kingdom': 'en-GB',
            'India': 'en-IN',
            'Japan': 'ja-JP',
            'Germany': 'de-DE',
            'France': 'fr-FR',
            'Canada': 'en-CA',
            'Australia': 'en-AU',
            'Singapore': 'en-SG',
            'United Arab Emirates': 'ar-AE'
        };
        
        const locale = localeMap[userCountry] || 'en-US';
        
        // Format the amount with the appropriate currency and locale
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: userCurrency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    } catch (error) {
        console.error('Error formatting currency:', error);
        // Fallback to simple formatting if Intl.NumberFormat fails
        const currencySymbols = {
            'USD': '$',
            'GBP': '£',
            'INR': '₹',
            'JPY': '¥',
            'EUR': '€',
            'CAD': 'C$',
            'AUD': 'A$',
            'SGD': 'S$',
            'AED': 'د.إ'
        };
        const userCurrency = sessionStorage.getItem('userCurrency') || 'USD';
        const symbol = currencySymbols[userCurrency] || '$';
        return `${symbol}${parseFloat(amount).toFixed(2)}`;
    }
}

// Show notification message to user
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <div class="notification-content">
            <h4>${type.charAt(0).toUpperCase() + type.slice(1)}</h4>
            <p>${message}</p>
        </div>
        <button class="close-notification">&times;</button>
    `;
    
    notificationCenter.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Simulate real-time updates (for demo purposes)
function simulateRealTimeUpdates() {
    // In a real app, this would be handled by WebSockets or polling
    const statuses = ['pending', 'approved', 'rejected'];
    const actions = ['submitted', 'approved', 'rejected'];
    const descriptions = [
        'Expense report',
        'Client meeting',
        'Business trip',
        'Office supplies',
        'Team lunch'
    ];
    
    setInterval(() => {
        // 10% chance of an update
        if (Math.random() > 0.9) {
            const actions = ['approved', 'rejected', 'updated'];
            const descriptions = ['Lunch Meeting', 'Hotel Stay', 'Flight Tickets', 'Office Supplies', 'Client Dinner'];
            const action = actions[Math.floor(Math.random() * actions.length)];
            const description = descriptions[Math.floor(Math.random() * descriptions.length)];
            
            showNotification(`Your expense "${description}" has been ${action}`, 
                           action === 'approved' ? 'success' : 
                           action === 'rejected' ? 'error' : 'info');
        }
    }, 30000); // Check every 30 seconds
}

// Simulate real-time updates (for demo purposes)
// simulateRealTimeUpdates(); // Uncomment to enable demo mode

// Handle receipt downloads using event delegation
document.addEventListener('click', function(event) {
    // Check if the clicked element or its parent is a download receipt button
    const downloadBtn = event.target.closest('.download-receipt');
    if (!downloadBtn) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    // Get the expense ID from the button's data attribute or parent element
    const expenseId = downloadBtn.dataset.expenseId || 
                     downloadBtn.closest('[data-expense-id]')?.dataset.expenseId;
    
    if (!expenseId) {
        console.error('Expense ID not found');
        showNotification('Error: Could not find expense information', 'error');
        return;
    }
    
    // Get the image element
    const imgElement = document.getElementById(`receiptImage-${expenseId}`);
    if (!imgElement) {
        console.error('Image element not found for expense:', expenseId);
        showNotification('Error: Receipt image not found', 'error');
        return;
    }
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    const filename = imgElement.src.split('/').pop() || `receipt_${expenseId}.jpg`;
    
    // Set the download attributes
    link.href = imgElement.src;
    link.download = `receipt_${expenseId}_${filename}`;
    link.style.display = 'none';
    
    // Add to document, trigger click, and clean up
    document.body.appendChild(link);
    console.log('Triggering download for:', link.href);
    link.click();
    
    // Clean up after a short delay
    setTimeout(() => {
        document.body.removeChild(link);
        console.log('Cleanup complete');
    }, 100);
    
    showNotification('Receipt download started', 'success');
});

// Initialize real-time updates (for demo)
// simulateRealTimeUpdates(); // Uncomment to enable demo mode
