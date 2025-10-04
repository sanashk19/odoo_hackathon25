// Sample Data
const sampleExpenses = [
    {
        id: 'EXP-2025-101',
        employee: 'John Smith',
        category: 'Travel',
        amount: 1250.75,
        date: '2025-09-15',
        riskLevel: 'high',
        violationType: 'amount',
        violationDescription: 'Amount exceeds $1000 travel limit',
        receiptImage: 'https://picsum.photos/600/400?random=1',
        similarExpenses: [
            { id: 'EXP-2025-102', date: '2025-09-10', amount: 1245.50, employee: 'John Smith', category: 'Travel' },
            { id: 'EXP-2025-103', date: '2025-09-05', amount: 1255.25, employee: 'John Smith', category: 'Travel' }
        ],
        status: 'pending',
        merchant: 'Global Airlines',
        notes: 'Requires manager approval for amount over limit'
    },
    {
        id: 'EXP-2025-201',
        employee: 'Sarah Johnson',
        category: 'Meals',
        amount: 350.00,
        date: '2025-09-18',
        riskLevel: 'medium',
        violationType: 'duplicate',
        violationDescription: 'Similar expense submitted on same day',
        receiptImage: 'https://picsum.photos/600/400?random=2',
        similarExpenses: [
            { id: 'EXP-2025-202', date: '2025-09-18', amount: 345.00, employee: 'Sarah Johnson', category: 'Meals' }
        ],
        status: 'pending',
        merchant: 'Gourmet Bistro',
        notes: 'Possible duplicate meal expense'
    },
    {
        id: 'EXP-2025-301',
        employee: 'Michael Chen',
        category: 'Entertainment',
        amount: 850.00,
        date: '2025-09-20',
        riskLevel: 'high',
        violationType: 'policy',
        violationDescription: 'Entertainment expense requires pre-approval',
        receiptImage: 'https://picsum.photos/600/400?random=3',
        similarExpenses: [],
        status: 'pending',
        merchant: 'Premier Club',
        notes: 'Missing pre-approval documentation'
    },
    {
        id: 'EXP-2025-401',
        employee: 'Emily Davis',
        category: 'Supplies',
        amount: 1200.00,
        date: '2025-09-12',
        riskLevel: 'high',
        violationType: 'amount',
        violationDescription: 'Office supplies over $1000 require quotes',
        receiptImage: 'https://picsum.photos/600/400?random=4',
        similarExpenses: [],
        status: 'pending',
        merchant: 'Office Plus',
        notes: 'Missing required quotes'
    },
    {
        id: 'EXP-2025-501',
        employee: 'David Wilson',
        category: 'Transportation',
        amount: 85.00,
        date: '2025-09-22',
        riskLevel: 'low',
        violationType: 'time',
        violationDescription: 'Weekend expense without prior approval',
        receiptImage: 'https://picsum.photos/600/400?random=5',
        similarExpenses: [],
        status: 'pending',
        merchant: 'City Cab Co.',
        notes: 'Weekend travel not pre-approved'
    }
];

// Initialize the dashboard with demo data
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Set demo user data
        if (!sessionStorage.getItem('isAuthenticated')) {
            sessionStorage.setItem('isAuthenticated', 'true');
            sessionStorage.setItem('userRole', 'manager');
            sessionStorage.setItem('userEmail', 'demo@company.com');
        }
        
        // Initialize UI components
        initializeDateRangePicker();
        setupEventListeners();
        initializeCharts();
        
        // Load and display data
        loadDashboardData();
        
        // Update user email display
        const userEmail = sessionStorage.getItem('userEmail');
        const userEmailElement = document.getElementById('userEmail');
        if (userEmailElement && userEmail) {
            userEmailElement.textContent = userEmail;
        }
        
        console.log('Dashboard initialized with demo data');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        alert('Error initializing dashboard. Please check console for details.');
    }
});

// Load dashboard data
function loadDashboardData() {
    try {
        // Show loading state
        document.querySelectorAll('.stat-info p').forEach(el => el.textContent = '...');
        
        // Simulate API call delay
        setTimeout(() => {
            try {
                // Calculate stats from sample data
                const highRisk = sampleExpenses.filter(e => e.riskLevel === 'high').length;
                const mediumRisk = sampleExpenses.filter(e => e.riskLevel === 'medium').length;
                const violations = sampleExpenses.length;
                
                // Calculate potential savings (sum of high and medium risk amounts)
                const savings = sampleExpenses
                    .filter(e => e.riskLevel === 'high' || e.riskLevel === 'medium')
                    .reduce((sum, e) => sum + e.amount, 0);
                
                // Update stats
                const highRiskCount = document.getElementById('highRiskCount');
                const mediumRiskCount = document.getElementById('mediumRiskCount');
                const policyViolationsCount = document.getElementById('policyViolationsCount');
                const potentialSavings = document.getElementById('potentialSavings');
                
                if (highRiskCount) highRiskCount.textContent = highRisk;
                if (mediumRiskCount) mediumRiskCount.textContent = mediumRisk;
                if (policyViolationsCount) policyViolationsCount.textContent = violations;
                if (potentialSavings) {
                    potentialSavings.textContent = `$${savings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                }
                
                // Update charts and table
                updateCharts();
                renderExpensesTable();
                
                console.log('Dashboard data loaded successfully');
            } catch (error) {
                console.error('Error processing dashboard data:', error);
                alert('Error loading dashboard data. Please check console for details.');
            }
        }, 300);
    } catch (error) {
        console.error('Error in loadDashboardData:', error);
        alert('Error loading dashboard. Please check console for details.');
    }
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
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '70%',
            }
        });

        // Violations by Category Chart
        const violationsCtx = document.getElementById('violationsByCategoryChart');
        if (violationsCtx) {
            window.violationsChart = new Chart(violationsCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: [], // Will be populated with categories
                    datasets: [{
                        label: 'Violations',
                        data: [], // Will be populated with counts
                        backgroundColor: '#4a6cf7',
                        borderRadius: 4,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false,
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                display: false
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

// Update charts with current data
function updateCharts() {
    try {
        if (!window.riskChart || !window.violationsChart) {
            console.warn('Charts not initialized');
            return;
        }
        
        // Calculate risk distribution
        const riskCounts = {
            high: sampleExpenses.filter(e => e.riskLevel === 'high').length,
            medium: sampleExpenses.filter(e => e.riskLevel === 'medium').length,
            low: sampleExpenses.filter(e => e.riskLevel === 'low').length
        };
        
        // Calculate violations by category
        const categoryMap = new Map();
        sampleExpenses.forEach(expense => {
            categoryMap.set(expense.category, (categoryMap.get(expense.category) || 0) + 1);
        });
        
        const categories = Array.from(categoryMap.keys());
        const categoryCounts = Array.from(categoryMap.values());
        
        // Update risk distribution chart
        window.riskChart.data.datasets[0].data = [
            riskCounts.high,
            riskCounts.medium,
            riskCounts.low
        ];
        
        // Update violations by category chart
        window.violationsChart.data.labels = categories;
        window.violationsChart.data.datasets[0].data = categoryCounts;
        
        // Generate distinct colors for categories
        const colors = generateColors(categories.length);
        window.violationsChart.data.datasets[0].backgroundColor = colors;
        
        // Update charts
        window.riskChart.update();
        window.violationsChart.update();
        
    } catch (error) {
        console.error('Error updating charts:', error);
    }
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

// Render expenses table
function renderExpensesTable(expenses = sampleExpenses) {
    try {
        const tableBody = document.getElementById('suspiciousExpensesBody');
        if (!tableBody) {
            console.warn('Table body element not found');
            return;
        }
        
        // Clear existing rows
        tableBody.innerHTML = '';
        
        if (expenses.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="9" class="text-center">No suspicious expenses found</td>';
            tableBody.appendChild(row);
            return;
        }
        
        // Add rows for each expense
        expenses.forEach(expense => {
            const row = document.createElement('tr');
            row.className = 'fade-in';
            
            const riskClass = `risk-${expense.riskLevel}`;
            const violationText = getViolationText(expense.violationType);
            
            row.innerHTML = `
                <td><input type="checkbox" class="expense-checkbox" data-id="${expense.id}"></td>
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
            `;
            
            tableBody.appendChild(row);
        });
        
        // Add event listeners
        setupRowEventListeners();
        
    } catch (error) {
        console.error('Error rendering expenses table:', error);
    }
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Get violation text for display
function getViolationText(type) {
    const violations = {
        'duplicate': 'Duplicate',
        'amount': 'Amount',
        'time': 'Time',
        'category': 'Category',
        'policy': 'Policy'
    };
    return violations[type] || 'Violation';
}

// Setup event listeners for table rows
function setupRowEventListeners() {
    // View detail buttons
    document.querySelectorAll('.view-detail').forEach(button => {
        button.addEventListener('click', function() {
            const expenseId = this.getAttribute('data-id');
            const expense = sampleExpenses.find(e => e.id === expenseId);
            if (expense) {
                showExpenseDetail(expense);
            }
        });
    });
    
    // Checkbox selection
    document.querySelectorAll('.expense-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const expenseId = this.getAttribute('data-id');
            if (this.checked) {
                selectedExpenseIds.add(expenseId);
            } else {
                selectedExpenseIds.delete(expenseId);
            }
            updateBulkActionsState();
        });
    });
}

// Show expense detail modal
function showExpenseDetail(expense) {
    const modal = document.getElementById('expenseDetailModal');
    const modalContent = document.getElementById('expenseDetailContent');
    
    if (!modal || !modalContent) {
        console.warn('Modal elements not found');
        return;
    }
    
    const riskClass = `risk-${expense.riskLevel}`;
    const violationText = getViolationText(expense.violationType);
    
    // Build similar expenses HTML
    let similarExpensesHtml = '';
    if (expense.similarExpenses && expense.similarExpenses.length > 0) {
        similarExpensesHtml = `
            <div class="similar-expenses">
                <h4>Similar Expenses</h4>
                <div class="similar-expenses-grid">
                    ${expense.similarExpenses.map(exp => `
                        <div class="similar-expense">
                            <div><strong>ID:</strong> ${exp.id}</div>
                            <div><strong>Date:</strong> ${formatDate(exp.date)}</div>
                            <div><strong>Amount:</strong> $${exp.amount.toFixed(2)}</div>
                            <div><strong>Employee:</strong> ${exp.employee}</div>
                            ${exp.category ? `<div><strong>Category:</strong> ${exp.category}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Set modal content
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
            
            <div class="detail-row">
                <div class="detail-label">Merchant:</div>
                <div class="detail-value">${expense.merchant || 'N/A'}</div>
            </div>
            
            ${expense.notes ? `
                <div class="detail-row">
                    <div class="detail-label">Notes:</div>
                    <div class="detail-value">${expense.notes}</div>
                </div>
            ` : ''}
            
            <div class="detail-row">
                <div class="detail-label">Receipt:</div>
                <div class="detail-value">
                    <img src="${expense.receiptImage}" alt="Receipt" class="receipt-image" style="max-width: 100%; border: 1px solid #eee; border-radius: 4px;">
                </div>
            </div>
            
            ${similarExpensesHtml}
        </div>
    `;
    
    // Show the modal
    modal.style.display = 'flex';
    
    // Add close event listeners
    const closeButtons = modal.querySelectorAll('.close-modal, #closeModal');
    closeButtons.forEach(button => {
        button.onclick = function() {
            modal.style.display = 'none';
        };
    });
    
    // Close when clicking outside the modal
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// Update bulk actions state based on selection
function updateBulkActionsState() {
    const bulkAction = document.getElementById('bulkAction');
    const applyBulkAction = document.getElementById('applyBulkAction');
    const selectAllCheckbox = document.getElementById('selectAllExpenses');
    
    if (!bulkAction || !applyBulkAction) return;
    
    const hasSelection = selectedExpenseIds.size > 0;
    bulkAction.disabled = !hasSelection;
    applyBulkAction.disabled = !hasSelection;
    
    // Update select all checkbox
    if (selectAllCheckbox) {
        const allCheckboxes = document.querySelectorAll('.expense-checkbox');
        selectAllCheckbox.checked = allCheckboxes.length > 0 && 
                                  selectedExpenseIds.size === allCheckboxes.length;
    }
}

// Initialize date range picker
function initializeDateRangePicker() {
    const dateRangeInput = document.getElementById('dateRange');
    if (!dateRangeInput) return;
    
    // Using flatpickr for date range selection
    flatpickr(dateRangeInput, {
        mode: 'range',
        dateFormat: 'Y-m-d',
        defaultDate: [new Date().setMonth(new Date().getMonth() - 1), new Date()],
        onChange: function(selectedDates) {
            if (selectedDates.length === 2) {
                // Filter expenses by date range
                const filtered = sampleExpenses.filter(expense => {
                    const expenseDate = new Date(expense.date);
                    return expenseDate >= selectedDates[0] && expenseDate <= selectedDates[1];
                });
                renderExpensesTable(filtered);
            }
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sessionStorage.clear();
            window.location.href = 'login.html';
        });
    }
    
    // Filter dropdowns
    const filterByRisk = document.getElementById('filterByRisk');
    const filterByViolation = document.getElementById('filterByViolation');
    
    if (filterByRisk) {
        filterByRisk.addEventListener('change', applyFilters);
    }
    
    if (filterByViolation) {
        filterByViolation.addEventListener('change', applyFilters);
    }
    
    // Search input
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
    
    // Select all checkbox
    const selectAllCheckbox = document.getElementById('selectAllExpenses');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.expense-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
                const expenseId = checkbox.getAttribute('data-id');
                if (this.checked) {
                    selectedExpenseIds.add(expenseId);
                } else {
                    selectedExpenseIds.delete(expenseId);
                }
            });
            updateBulkActionsState();
        });
    }
    
    // Bulk actions
    const applyBulkAction = document.getElementById('applyBulkAction');
    if (applyBulkAction) {
        applyBulkAction.addEventListener('click', function() {
            const bulkAction = document.getElementById('bulkAction');
            if (!bulkAction || selectedExpenseIds.size === 0) return;
            
            const action = bulkAction.value;
            if (!action) return;
            
            // In a real app, this would be an API call
            alert(`Performing ${action} on ${selectedExpenseIds.size} selected expense(s)`);
            
            // Reset selection
            selectedExpenseIds.clear();
            document.querySelectorAll('.expense-checkbox').forEach(cb => cb.checked = false);
            updateBulkActionsState();
            
            // Refresh the table
            renderExpensesTable();
        });
    }
}

// Apply filters to the table
function applyFilters() {
    const riskFilter = document.getElementById('filterByRisk')?.value || 'all';
    const violationFilter = document.getElementById('filterByViolation')?.value || 'all';
    const searchTerm = document.getElementById('searchExpenses')?.value?.toLowerCase() || '';
    
    const filtered = sampleExpenses.filter(expense => {
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
    
    renderExpensesTable(filtered);
}

// Global state for selected expense IDs
const selectedExpenseIds = new Set();
