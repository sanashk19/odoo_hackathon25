// DOM Elements
const userEmailElement = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const refreshBtn = document.getElementById('refreshBtn');
const dateRangeInput = document.getElementById('dateRange');
const highRiskCount = document.getElementById('highRiskCount');
const mediumRiskCount = document.getElementById('mediumRiskCount');
const policyViolationsCount = document.getElementById('policyViolationsCount');
const potentialSavings = document.getElementById('potentialSavings');
const suspiciousExpensesBody = document.getElementById('suspiciousExpensesBody');
const filterByRisk = document.getElementById('filterByRisk');
const filterByViolation = document.getElementById('filterByViolation');
const selectAllExpenses = document.getElementById('selectAllExpenses');
const bulkAction = document.getElementById('bulkAction');
const applyBulkAction = document.getElementById('applyBulkAction');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

// Modal Elements
const expenseDetailModal = document.getElementById('expenseDetailModal');
const closeModalBtn = document.querySelector('.close-modal');
const closeModal = document.getElementById('closeModal');
const approveExpenseBtn = document.getElementById('approveExpense');
const rejectExpenseBtn = document.getElementById('rejectExpense');
const escalateExpenseBtn = document.getElementById('escalateExpense');

// State
let currentPage = 1;
const itemsPerPage = 10;
let filteredExpenses = [];
let selectedExpenseIds = new Set();

// Demo Data
const demoExpenses = generateDemoData(50);

function generateDemoData(count) {
    const categories = ['Travel', 'Meals', 'Entertainment', 'Supplies', 'Lodging', 'Transportation', 'Office'];
    const employees = [
        'John Smith', 'Emily Johnson', 'Michael Brown', 'Sarah Davis', 'David Wilson',
        'Jennifer Miller', 'James Taylor', 'Lisa Anderson', 'Robert Thomas', 'Patricia Jackson'
    ];
    const riskLevels = ['high', 'medium', 'low'];
    const violationTypes = ['duplicate', 'amount', 'time', 'category', 'policy'];
    const violationDescriptions = {
        'duplicate': [
            'Possible duplicate expense detected',
            'Similar expense submitted within 7 days',
            'Duplicate receipt detected',
            'Identical amount and merchant as previous expense'
        ],
        'amount': [
            'Amount exceeds category limit by 125%',
            'Unusually high amount for this category',
            'Amount significantly higher than team average',
            'Suspicious round number amount'
        ],
        'time': [
            'Expense submitted outside business hours',
            'Multiple expenses in a short time frame',
            'Weekend expense without prior approval',
            'Expense date on holiday'
        ],
        'category': [
            'Expense category does not match receipt',
            'Category not allowed per company policy',
            'Suspicious category for this employee',
            'Category changed from previous submission'
        ],
        'policy': [
            'Missing required documentation',
            'Expense violates company travel policy',
            'Approval chain bypassed',
            'Expense not pre-approved'
        ]
    };

    const expenses = [];
    const today = new Date();
    
    // Generate some known patterns for better demo
    for (let i = 1; i <= count; i++) {
        const riskLevel = i % 5 === 0 ? 'high' : (i % 3 === 0 ? 'medium' : 'low');
        const violationType = violationTypes[Math.floor(Math.random() * violationTypes.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const employee = employees[Math.floor(Math.random() * employees.length)];
        
        // Create some patterns for demonstration
        let amount, date, description, similarExpenses = [];
        
        // Create some patterns for demonstration
        if (i % 7 === 0) {
            // Duplicate pattern
            amount = 1250.50 + (i % 3 * 10);
            date = new Date(today);
            date.setDate(date.getDate() - (i % 30));
            description = 'Possible duplicate expense detected';
            
            // Add similar expenses for duplicates
            if (i % 3 === 0) {
                similarExpenses = [
                    {
                        id: `EXP-${today.getFullYear()}-${String(i+100).padStart(3, '0')}`,
                        date: new Date(date).toISOString().split('T')[0],
                        amount: amount + (Math.random() * 20 - 10),
                        employee: employee,
                        category: category
                    }
                ];
            }
        } else if (i % 5 === 0) {
            // High amount pattern
            amount = 2000 + Math.random() * 3000;
            date = new Date(today);
            date.setDate(date.getDate() - (i % 15));
            description = 'Amount significantly exceeds category average';
        } else if (i % 4 === 0) {
            // Weekend pattern
            amount = 100 + Math.random() * 500;
            date = new Date(today);
            date.setDate(date.getDate() - (i % 10));
            // Ensure it's a weekend day (0 = Sunday, 6 = Saturday)
            date.setDate(date.getDate() - date.getDay() - 1);
            description = 'Weekend expense without prior approval';
        } else {
            // Random pattern
            amount = 50 + Math.random() * 1000;
            date = new Date(today);
            date.setDate(date.getDate() - (i % 20));
            const descs = violationDescriptions[violationType] || ['Policy violation detected'];
            description = descs[Math.floor(Math.random() * descs.length)];
        }
        
        expenses.push({
            id: `EXP-${today.getFullYear()}-${String(i).padStart(3, '0')}`,
            employee: employee,
            category: category,
            amount: parseFloat(amount.toFixed(2)),
            date: date.toISOString().split('T')[0],
            riskLevel: riskLevel,
            violationType: violationType,
            violationDescription: description,
            receiptImage: `https://picsum.photos/600/400?random=${i}`,
            similarExpenses: similarExpenses,
            status: 'pending',
            submittedDate: new Date(date.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            merchant: `Merchant ${String.fromCharCode(65 + (i % 10))}`,
            notes: i % 4 === 0 ? 'Requires additional verification' : ''
        });
    }
    
    return expenses;
}

// Sample Data
const sampleExpenses = [...demoExpenses];

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Set demo user data if not already set
        if (!sessionStorage.getItem('isAuthenticated')) {
            sessionStorage.setItem('isAuthenticated', 'true');
            sessionStorage.setItem('userRole', 'manager');
            sessionStorage.setItem('userEmail', 'demo@company.com');
        }
        
        // Initialize components
        checkAuth();
        initializeDateRangePicker();
        setupEventListeners();
        initializeCharts();
        loadDashboardData();
        
        // Add search functionality
        const searchInput = document.getElementById('searchExpenses');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    applyFilters();
                }, 300);
            });
        }
        
        // Update user email display
        const userEmail = sessionStorage.getItem('userEmail');
        const userEmailElement = document.getElementById('userEmail');
        if (userEmailElement && userEmail) {
            userEmailElement.textContent = userEmail;
        }
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        alert('Error initializing dashboard. Please check console for details.');
    }
});

// Check authentication and role
function checkAuth() {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    const userRole = sessionStorage.getItem('userRole');
    const email = sessionStorage.getItem('userEmail');
    
    if (!isAuthenticated) {
        window.location.href = 'login.html';
        return;
    }
    
    if (userRole !== 'manager' && userRole !== 'admin') {
        window.location.href = 'emp.html';
        return;
    }
    
    if (userEmailElement) {
        userEmailElement.textContent = email || 'User';
    }
}

// Initialize date range picker
function initializeDateRangePicker() {
    if (dateRangeInput) {
        // Using flatpickr for date range selection
        flatpickr(dateRangeInput, {
            mode: 'range',
            dateFormat: 'Y-m-d',
            defaultDate: [new Date().setMonth(new Date().getMonth() - 1), new Date()],
            onChange: function(selectedDates, dateStr) {
                if (selectedDates.length === 2) {
                    loadDashboardData();
                }
            }
        });
    }
}

// Load dashboard data
function loadDashboardData() {
    // Show loading state
    document.querySelectorAll('.stat-info p').forEach(el => el.textContent = '...');
    
    // Simulate API call
    setTimeout(() => {
        // Calculate stats from demo data
        const highRisk = sampleExpenses.filter(e => e.riskLevel === 'high').length;
        const mediumRisk = sampleExpenses.filter(e => e.riskLevel === 'medium').length;
        const violations = sampleExpenses.length; // All are violations in demo
        
        // Calculate potential savings (sum of high and medium risk amounts)
        const savings = sampleExpenses
            .filter(e => e.riskLevel === 'high' || e.riskLevel === 'medium')
            .reduce((sum, e) => sum + e.amount, 0);
        
        // Update stats
        highRiskCount.textContent = highRisk;
        mediumRiskCount.textContent = mediumRisk;
        policyViolationsCount.textContent = violations;
        potentialSavings.textContent = `$${savings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        
        // Update charts
        updateCharts();
        
        // Render the expenses table
        renderExpensesTable();
    }, 300);
}

// Initialize charts
function initializeCharts() {
    try {
        const riskCtx = document.getElementById('riskDistributionChart');
        if (!riskCtx) {
            console.warn('Risk distribution chart element not found');
            return;
        }
        
        // Risk Distribution Chart
        window.riskChart = new Chart(riskCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['High Risk', 'Medium Risk', 'Low Risk'],
                datasets: [{
                    data: [0, 0, 0], // Will be updated with real data
                    backgroundColor: ['#f44336', '#ff9800', '#4caf50'],
                    borderWidth: 0,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100) || 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });

        // Violations by Category Chart
        const violationsCanvas = document.getElementById('violationsByCategoryChart');
        if (!violationsCanvas) {
            console.warn('Violations chart element not found');
            return;
        }
        
        const violationsCtx = violationsCanvas.getContext('2d');
        window.violationsChart = new Chart(violationsCtx, {
            type: 'bar',
            data: {
                labels: ['Travel', 'Meals', 'Entertainment', 'Supplies', 'Other'],
                datasets: [{
                    label: 'Violations',
                    data: [8, 12, 5, 3, 2],
                    backgroundColor: '#4a6cf7',
                    borderRadius: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.y} violations`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Number of Violations'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    });
}

// Update charts with demo data
function updateCharts() {
    try {
        if (!window.riskChart || !window.violationsChart) {
            console.warn('Charts not initialized');
            return;
        }

        // Batch updates using requestAnimationFrame for better performance
        requestAnimationFrame(() => {
            try {
                // Calculate risk distribution
                const riskCounts = sampleExpenses.reduce((acc, expense) => {
                    acc[expense.riskLevel] = (acc[expense.riskLevel] || 0) + 1;
                    return acc;
                }, { high: 0, medium: 0, low: 0 });
                
                // Calculate violations by category
                const categoryCounts = sampleExpenses.reduce((acc, expense) => {
                    acc[expense.category] = (acc[expense.category] || 0) + 1;
                    return acc;
                }, {});
                
                const categories = Object.keys(categoryCounts);
                const violations = Object.values(categoryCounts);
                
                // Update risk distribution chart
                window.riskChart.data.datasets[0].data = [
                    riskCounts.high,
                    riskCounts.medium,
                    riskCounts.low
                ];
                
                // Update violations by category chart
                window.violationsChart.data.labels = categories;
                window.violationsChart.data.datasets[0].data = violations;
                
                // Generate distinct colors for categories
                const colors = generateColors(categories.length);
                window.violationsChart.data.datasets[0].backgroundColor = colors;
                
                // Update charts with minimal animations
                window.riskChart.update('none');
                window.violationsChart.update('none');
                
            } catch (error) {
                console.error('Error in chart update animation frame:', error);
            }
        });
        
    } catch (error) {
        console.error('Error updating charts:', error);
    }
}

// Render expenses table
function renderExpensesTable(expenses = sampleExpenses) {
    filteredExpenses = [...expenses];
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedExpenses = filteredExpenses.slice(start, end);
    
    let html = '';
    
    if (paginatedExpenses.length === 0) {
        html = `
            <tr>
                <td colspan="9" class="text-center">No suspicious expenses found</td>
            </tr>
        `;
    } else {
        paginatedExpenses.forEach(expense => {
            const isSelected = selectedExpenseIds.has(expense.id);
            const riskClass = `risk-${expense.riskLevel}`;
            const violationText = getViolationText(expense.violationType);
            
            html += `
                <tr class="fade-in">
                    <td><input type="checkbox" class="expense-checkbox" data-id="${expense.id}" ${isSelected ? 'checked' : ''}></td>
                    <td>${expense.id}</td>
                    <td>${expense.employee}</td>
                    <td>${expense.category}</td>
                    <td>$${expense.amount.toFixed(2)}</td>
                    <td>${formatDate(expense.date)}</td>
                    <td><span class="risk-tag ${riskClass}">${expense.riskLevel.charAt(0).toUpperCase() + expense.riskLevel.slice(1)} Risk</span></td>
                    <td><span class="violation-tag">${violationText}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline view-detail" data-id="${expense.id}">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                </tr>
            `;
        });
    }
    
    suspiciousExpensesBody.innerHTML = html;
    updatePagination();
    setupRowEventListeners();
}

// Get violation text for display
function getViolationText(type) {
    const violations = {
        'duplicate': 'Possible Duplicate',
        'amount': 'Amount Anomaly',
        'time': 'Time Anomaly',
        'category': 'Category Violation'
    };
    return violations[type] || 'Policy Violation';
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage >= totalPages;
    
    // Enable/disable bulk actions
    updateBulkActionsState();
}

// Update bulk actions state
function updateBulkActionsState() {
    const hasSelection = selectedExpenseIds.size > 0;
    bulkAction.disabled = !hasSelection;
    applyBulkAction.disabled = !hasSelection;
}

// Setup event listeners
function setupEventListeners() {
    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Refresh data
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadDashboardData);
    }
    
    // Filters
    if (filterByRisk) {
        filterByRisk.addEventListener('change', applyFilters);
    }
    
    if (filterByViolation) {
        filterByViolation.addEventListener('change', applyFilters);
    }
    
    // Select all checkbox
    if (selectAllExpenses) {
        selectAllExpenses.addEventListener('change', function(e) {
            const checkboxes = document.querySelectorAll('.expense-checkbox');
            const isChecked = e.target.checked;
            
            checkboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
                const expenseId = checkbox.dataset.id;
                
                if (isChecked) {
                    selectedExpenseIds.add(expenseId);
                } else {
                    selectedExpenseIds.delete(expenseId);
                }
            });
            
            updateBulkActionsState();
        });
    }
    
    // Bulk actions
    if (applyBulkAction) {
        applyBulkAction.addEventListener('click', handleBulkAction);
    }
    
    // Pagination
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderExpensesTable();
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderExpensesTable();
            }
        });
    }
    
    // Modal close buttons
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            expenseDetailModal.style.display = 'none';
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            expenseDetailModal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === expenseDetailModal) {
            expenseDetailModal.style.display = 'none';
        }
    });
    
    // Expense action buttons
    if (approveExpenseBtn) {
        approveExpenseBtn.addEventListener('click', () => handleExpenseAction('approve'));
    }
    
    if (rejectExpenseBtn) {
        rejectExpenseBtn.addEventListener('click', () => handleExpenseAction('reject'));
    }
    
    if (escalateExpenseBtn) {
        escalateExpenseBtn.addEventListener('click', () => handleExpenseAction('escalate'));
    }
}

// Setup row event listeners
function setupRowEventListeners() {
    // Checkbox selection
    document.querySelectorAll('.expense-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const expenseId = this.dataset.id;
            
            if (this.checked) {
                selectedExpenseIds.add(expenseId);
            } else {
                selectedExpenseIds.delete(expenseId);
                selectAllExpenses.checked = false;
            }
            
            updateBulkActionsState();
        });
    });
    
    // View detail buttons
    document.querySelectorAll('.view-detail').forEach(btn => {
        btn.addEventListener('click', function() {
            const expenseId = this.dataset.id;
            const expense = sampleExpenses.find(e => e.id === expenseId);
            
            if (expense) {
                showExpenseDetail(expense);
            }
        });
    });
}

// Apply filters
function applyFilters() {
    const riskFilter = filterByRisk.value;
    const violationFilter = filterByViolation.value;
    const searchTerm = document.getElementById('searchExpenses')?.value?.toLowerCase() || '';
    
    let filtered = sampleExpenses.filter(expense => {
        // Apply risk filter
        if (riskFilter !== 'all' && expense.riskLevel !== riskFilter) {
            return false;
        }
        
        // Apply violation type filter
        if (violationFilter !== 'all' && expense.violationType !== violationFilter) {
            return false;
        }
        
        // Apply search term
        if (searchTerm) {
            const searchFields = [
                expense.id,
                expense.employee,
                expense.category,
                expense.violationDescription,
                expense.merchant,
                `$${expense.amount}`,
                formatDate(expense.date)
            ].join(' ').toLowerCase();
            
            if (!searchFields.includes(searchTerm)) {
                return false;
            }
        }
        
        return true;
    });
    
    currentPage = 1; // Reset to first page when filters change
    renderExpensesTable(filtered);
}

// Handle bulk actions
function handleBulkAction() {
    const action = bulkAction.value;
    
    if (!action || selectedExpenseIds.size === 0) return;
    
    const count = selectedExpenseIds.size;
    const expenseText = count === 1 ? '1 expense' : `${count} expenses`;
    
    // In a real app, this would be an API call
    console.log(`Performing ${action} on ${expenseText}:`, Array.from(selectedExpenseIds));
    
    // Show success message
    alert(`Successfully ${action}d ${expenseText}.`);
    
    // Reset selection
    selectedExpenseIds.clear();
    selectAllExpenses.checked = false;
    
    // Refresh the table
    renderExpensesTable();
}

// Show expense detail modal
function showExpenseDetail(expense) {
    const modalContent = document.getElementById('expenseDetailContent');
    const riskClass = `risk-${expense.riskLevel}`;
    const violationText = getViolationText(expense.violationType);
    
    let similarExpensesHtml = '';
    
    if (expense.similarExpenses && expense.similarExpenses.length > 0) {
        similarExpensesHtml = `
            <div class="similar-expenses">
                <h4>Similar Expenses</h4>
                <div class="similar-expenses-grid">
                    ${expense.similarExpenses.map(exp => `
                        <div class="similar-expense">
                            <div>ID: ${exp.id}</div>
                            <div>Date: ${formatDate(exp.date)}</div>
                            <div>Amount: $${exp.amount.toFixed(2)}</div>
                            <div>Employee: ${exp.employee}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    modalContent.innerHTML = `
        <div class="expense-detail-header">
            <div>
                <h3>${expense.id} - ${expense.employee}</h3>
                <p class="expense-category">${expense.category}</p>
            </div>
            <div class="expense-amount">
                <span class="amount">$${expense.amount.toFixed(2)}</span>
                <span class="date">${formatDate(expense.date)}</span>
            </div>
        </div>
        
        <div class="expense-detail-body">
            <div class="detail-row">
                <div class="detail-label">Risk Level:</div>
                <div class="detail-value">
                    <span class="risk-tag ${riskClass}">
                        ${expense.riskLevel.charAt(0).toUpperCase() + expense.riskLevel.slice(1)} Risk
                    </span>
                </div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">Violation Type:</div>
                <div class="detail-value">
                    <span class="violation-tag">${violationText}</span>
                </div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">Description:</div>
                <div class="detail-value">${expense.violationDescription || 'No description available.'}</div>
            </div>
            
            ${expense.receiptImage ? `
                <div class="detail-row">
                    <div class="detail-label">Receipt:</div>
                    <div class="detail-value">
                        <img src="${expense.receiptImage}" alt="Receipt" class="receipt-image">
                    </div>
                </div>
            ` : ''}
            
            ${similarExpensesHtml}
        </div>
    `;
    
    // Store the current expense ID on the modal for action handling
    expenseDetailModal.dataset.expenseId = expense.id;
    
    // Show the modal
    expenseDetailModal.style.display = 'flex';
}

// Handle expense actions (approve/reject/escalate)
function handleExpenseAction(action) {
    const expenseId = expenseDetailModal.dataset.expenseId;
    
    if (!expenseId) return;
    
    // In a real app, this would be an API call
    console.log(`Expense ${expenseId} ${action}d`);
    
    // Show success message
    alert(`Expense ${expenseId} has been ${action}d.`);
    
    // Close the modal
    expenseDetailModal.style.display = 'none';
    
    // Remove the expense from the list
    const index = sampleExpenses.findIndex(e => e.id === expenseId);
    if (index > -1) {
        sampleExpenses.splice(index, 1);
    }
    
    // Refresh the table
    renderExpensesTable();
}

// Handle logout
function handleLogout(e) {
    e.preventDefault();
    
    // Clear session storage
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userEmail');
    
    // Redirect to login page
    window.location.href = 'login.html';
}

// Helper function to generate distinct colors
function generateColors(count) {
    const colors = [];
    const hueStep = 360 / Math.max(1, count);
    
    for (let i = 0; i < count; i++) {
        const hue = Math.floor(i * hueStep);
        colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    
    return colors;
}

// Add some sample data if none exists
if (sampleExpenses.length === 0) {
    const categories = ['Travel', 'Meals', 'Entertainment', 'Supplies', 'Lodging', 'Transportation', 'Office'];
    const employees = [
        'John Smith', 'Emily Johnson', 'Michael Brown', 'Sarah Davis', 'David Wilson',
        'Jennifer Miller', 'James Taylor', 'Lisa Anderson', 'Robert Thomas', 'Patricia Jackson'
    ];
    const riskLevels = ['high', 'medium', 'low'];
    const violationTypes = ['duplicate', 'amount', 'time', 'category', 'policy'];
    
    const violationDescriptions = {
        'duplicate': [
            'Possible duplicate expense detected',
            'Similar expense submitted within 7 days',
            'Duplicate receipt detected',
            'Identical amount and merchant as previous expense'
        ],
        'amount': [
            'Amount exceeds category limit by 125%',
            'Unusually high amount for this category',
            'Amount significantly higher than team average',
            'Suspicious round number amount'
        ],
        'time': [
            'Expense submitted outside business hours',
            'Multiple expenses in a short time frame',
            'Weekend expense without prior approval',
            'Expense date on holiday'
        ],
        'category': [
            'Expense category does not match receipt',
            'Category not allowed per company policy',
            'Suspicious category for this employee',
            'Category changed from previous submission'
        ],
        'policy': [
            'Missing required documentation',
            'Expense violates company travel policy',
            'Approval chain bypassed',
            'Expense not pre-approved'
        ]
    };
    
    for (let i = 1; i <= 25; i++) {
        const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
        const violationType = violationTypes[Math.floor(Math.random() * violationTypes.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const employee = employees[Math.floor(Math.random() * employees.length)];
        const violationDescArray = violationDescriptions[violationType] || ['Policy violation detected'];
        
        const baseAmount = (() => {
            switch (category) {
                case 'Travel': return 1000 + (Math.random() * 1000);
                case 'Meals': return 50 + (Math.random() * 150);
                case 'Entertainment': return 100 + (Math.random() * 400);
                case 'Lodging': return 150 + (Math.random() * 350);
                case 'Transportation': return 20 + (Math.random() * 100);
                default: return 10 + (Math.random() * 200);
            }
        })();
        
        // Make some expenses suspiciously high
        const amount = riskLevel === 'high' ? 
            baseAmount * (1.5 + Math.random()) : // 50-150% higher for high risk
            baseAmount * (0.9 + (Math.random() * 0.2)); // -10% to +10% for others
        
        sampleExpenses.push({
            id: `EXP-2025-${String(i).padStart(3, '0')}`,
            employee: employee,
            category: category,
            amount: parseFloat(amount.toFixed(2)),
            date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            riskLevel: riskLevel,
            violationType: violationType,
            violationDescription: violationDescArray[Math.floor(Math.random() * violationDescArray.length)],
            receiptImage: `https://picsum.photos/600/400?random=${i}`,
            merchant: `${category} ${['Express', 'Global', 'Elite', 'Premium', 'First Class'][i % 5]} ${['Inc', 'LLC', 'Corp', 'Ltd', 'Group'][i % 5]}`,
            notes: riskLevel === 'high' ? 'Requires manager review' : '',
            similarExpenses: Math.random() > 0.7 ? [
                {
                    id: `EXP-2025-${String(i + 100).padStart(3, '0')}`,
                    date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    amount: parseFloat((amount * (0.8 + Math.random() * 0.4)).toFixed(2)),
                    employee: employee,
                    category: category
                }
            ] : []
        });
    }
    
    // Ensure we have at least some high and medium risk items for demo purposes
    if (!sampleExpenses.some(e => e.riskLevel === 'high')) {
        sampleExpenses[0].riskLevel = 'high';
        sampleExpenses[0].amount = 1500 + (Math.random() * 1000);
    }
    
    if (!sampleExpenses.some(e => e.riskLevel === 'medium')) {
        sampleExpenses[1].riskLevel = 'medium';
        sampleExpenses[1].amount = 800 + (Math.random() * 400);
    }
}
