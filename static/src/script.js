// Global Variables
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let complianceData = JSON.parse(localStorage.getItem('complianceData')) || {
    violations: [],
    carbonFootprint: 0,
    gstData: { totalGST: 0, inputTaxCredit: 0 }
};

// Carbon Footprint Data (kg CO2 per category)
const carbonFactors = {
    travel: 0.21, // per km
    fuel: 2.31, // per liter
    food: 0.5, // per meal
    accommodation: 12.0, // per night
    office: 0.1, // per item
    other: 0.05
};

// Policy Limits
const policyLimits = {
    travel: 50000,
    fuel: 10000,
    food: 2000,
    accommodation: 8000,
    office: 5000,
    other: 3000
};

// GST Rates
const gstRates = {
    travel: 5,
    fuel: 28,
    food: 5,
    accommodation: 12,
    office: 18,
    other: 18
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupEventListeners();
    updateDashboard();
    renderExpensesList();
    updateComplianceMetrics();
    initializeCharts();
    
    // Set default date to today
    document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
}

// Navigation Setup
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and tabs
            navButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked button and corresponding tab
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Event Listeners Setup
function setupEventListeners() {
    document.getElementById('expenseForm').addEventListener('submit', handleExpenseSubmission);
}

// Handle Expense Submission
function handleExpenseSubmission(e) {
    e.preventDefault();
    
    const formData = {
        id: Date.now(),
        amount: parseFloat(document.getElementById('expenseAmount').value),
        category: document.getElementById('expenseCategory').value,
        date: document.getElementById('expenseDate').value,
        description: document.getElementById('expenseDescription').value,
        status: 'pending',
        carbonFootprint: 0,
        gst: 0,
        timestamp: new Date().toISOString()
    };

    // Calculate carbon footprint
    formData.carbonFootprint = calculateCarbonFootprint(formData.category, formData.amount);
    
    // Calculate GST
    formData.gst = calculateGST(formData.category, formData.amount);

    // Add to expenses array
    expenses.push(formData);
    
    // Save to localStorage
    localStorage.setItem('expenses', JSON.stringify(expenses));
    
    // Update UI
    updateDashboard();
    renderExpensesList();
    updateComplianceMetrics();
    
    // Reset form
    document.getElementById('expenseForm').reset();
    document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
    
    // Show success message
    showMessage('Expense added successfully!', 'success');
    
    // Check for policy violations
    checkPolicyCompliance();
}

// Calculate Carbon Footprint
function calculateCarbonFootprint(category, amount) {
    const factor = carbonFactors[category] || carbonFactors.other;
    let footprint = 0;
    
    switch(category) {
        case 'travel':
            // Assume ₹10 per km for travel
            footprint = (amount / 10) * factor;
            break;
        case 'fuel':
            // Assume ₹100 per liter
            footprint = (amount / 100) * factor;
            break;
        case 'food':
            // Assume ₹500 per meal
            footprint = (amount / 500) * factor;
            break;
        case 'accommodation':
            // Assume ₹3000 per night
            footprint = (amount / 3000) * factor;
            break;
        default:
            footprint = amount * factor / 1000; // Convert to reasonable scale
    }
    
    return Math.round(footprint * 100) / 100; // Round to 2 decimal places
}

// Calculate GST
function calculateGST(category, amount) {
    const rate = gstRates[category] || gstRates.other;
    return Math.round((amount * rate / 100) * 100) / 100;
}

// Update Dashboard
function updateDashboard() {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const pendingApprovals = expenses.filter(expense => expense.status === 'pending').length;
    const totalCarbonFootprint = expenses.reduce((sum, expense) => sum + (expense.carbonFootprint || 0), 0);
    const policyViolations = complianceData.violations.length;

    document.getElementById('totalExpenses').textContent = `₹${totalExpenses.toLocaleString()}`;
    document.getElementById('pendingApprovals').textContent = pendingApprovals;
    document.getElementById('carbonFootprint').textContent = `${totalCarbonFootprint.toFixed(2)} kg CO₂`;
    document.getElementById('policyViolations').textContent = policyViolations;
}

// Render Expenses List
function renderExpensesList() {
    const expensesList = document.getElementById('expensesList');
    
    if (expenses.length === 0) {
        expensesList.innerHTML = '<p style="text-align: center; color: #666;">No expenses added yet.</p>';
        return;
    }

    const expensesHTML = expenses.map(expense => `
        <div class="expense-item">
            <div class="expense-info">
                <div class="expense-amount">₹${expense.amount.toLocaleString()}</div>
                <div class="expense-category">${expense.category} - ${expense.description}</div>
                <div style="font-size: 0.8rem; color: #888;">
                    ${new Date(expense.date).toLocaleDateString()} | 
                    CO₂: ${expense.carbonFootprint?.toFixed(2) || 0} kg | 
                    GST: ₹${expense.gst?.toFixed(2) || 0}
                </div>
            </div>
            <div class="expense-status ${expense.status}">${expense.status.toUpperCase()}</div>
        </div>
    `).join('');

    expensesList.innerHTML = expensesHTML;
}

// Policy Compliance Check
function checkPolicyCompliance() {
    const violations = [];
    
    // Check category-wise spending limits
    const categoryTotals = {};
    expenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    Object.entries(categoryTotals).forEach(([category, total]) => {
        const limit = policyLimits[category];
        if (total > limit) {
            violations.push({
                type: 'spending_limit',
                category: category,
                message: `${category} spending (₹${total.toLocaleString()}) exceeds limit (₹${limit.toLocaleString()})`,
                severity: 'high',
                amount: total - limit
            });
        }
    });

    // Check for duplicate expenses (same amount, category, and date)
    const expenseMap = new Map();
    expenses.forEach(expense => {
        const key = `${expense.amount}-${expense.category}-${expense.date}`;
        if (expenseMap.has(key)) {
            violations.push({
                type: 'duplicate',
                message: `Potential duplicate expense: ₹${expense.amount} for ${expense.category} on ${expense.date}`,
                severity: 'medium',
                expenseId: expense.id
            });
        }
        expenseMap.set(key, expense);
    });

    // Check for unusually high single expenses
    expenses.forEach(expense => {
        const categoryLimit = policyLimits[expense.category];
        if (expense.amount > categoryLimit * 0.5) {
            violations.push({
                type: 'high_amount',
                message: `High expense amount: ₹${expense.amount.toLocaleString()} for ${expense.category}`,
                severity: 'low',
                expenseId: expense.id
            });
        }
    });

    complianceData.violations = violations;
    localStorage.setItem('complianceData', JSON.stringify(complianceData));
    
    updateComplianceMetrics();
    renderViolations();
}

// Update Compliance Metrics
function updateComplianceMetrics() {
    const totalExpenses = expenses.length;
    const violationCount = complianceData.violations.length;
    const complianceScore = totalExpenses > 0 ? Math.max(0, 100 - (violationCount / totalExpenses * 100)) : 100;
    
    const totalCarbonFootprint = expenses.reduce((sum, expense) => sum + (expense.carbonFootprint || 0), 0);
    const carbonOffsetCost = totalCarbonFootprint * 50; // ₹50 per kg CO₂
    
    const totalGST = expenses.reduce((sum, expense) => sum + (expense.gst || 0), 0);
    const inputTaxCredit = totalGST * 0.8; // Assume 80% can be claimed as ITC

    document.getElementById('complianceScore').textContent = `${Math.round(complianceScore)}%`;
    document.getElementById('totalEmissions').textContent = `${totalCarbonFootprint.toFixed(2)} kg`;
    document.getElementById('carbonOffset').textContent = `₹${carbonOffsetCost.toFixed(2)}`;
    document.getElementById('totalGST').textContent = `₹${totalGST.toFixed(2)}`;
    document.getElementById('inputTaxCredit').textContent = `₹${inputTaxCredit.toFixed(2)}`;

    complianceData.carbonFootprint = totalCarbonFootprint;
    complianceData.gstData = { totalGST, inputTaxCredit };
    localStorage.setItem('complianceData', JSON.stringify(complianceData));
}

// Render Violations
function renderViolations() {
    const violationList = document.getElementById('violationList');
    
    if (complianceData.violations.length === 0) {
        violationList.innerHTML = '<div class="message success"><i class="fas fa-check-circle"></i> No policy violations detected!</div>';
        return;
    }

    const violationsHTML = complianceData.violations.map(violation => `
        <div class="violation-item ${violation.severity}">
            <i class="fas fa-exclamation-triangle violation-icon"></i>
            <div>
                <strong>${violation.type.replace('_', ' ').toUpperCase()}</strong><br>
                ${violation.message}
            </div>
        </div>
    `).join('');

    violationList.innerHTML = violationsHTML;
}

// Calculate GST Function (for button)
function calculateGST() {
    updateComplianceMetrics();
    showMessage('GST calculations updated!', 'success');
}

// Initialize Charts
function initializeCharts() {
    initializeExpenseChart();
    initializeCarbonChart();
    initializeCategoryChart();
    initializeApprovalChart();
}

// Expense Chart (Dashboard)
function initializeExpenseChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    
    // Group expenses by month
    const monthlyData = {};
    expenses.forEach(expense => {
        const month = new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        monthlyData[month] = (monthlyData[month] || 0) + expense.amount;
    });

    const labels = Object.keys(monthlyData);
    const data = Object.values(monthlyData);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Expenses',
                data: data,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Expense Trend'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Carbon Chart (Compliance Tab)
function initializeCarbonChart() {
    const ctx = document.getElementById('carbonChart').getContext('2d');
    
    // Group carbon footprint by category
    const categoryCarbon = {};
    expenses.forEach(expense => {
        categoryCarbon[expense.category] = (categoryCarbon[expense.category] || 0) + (expense.carbonFootprint || 0);
    });

    const labels = Object.keys(categoryCarbon);
    const data = Object.values(categoryCarbon);
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Carbon Footprint by Category'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Category Chart (Reports Tab)
function initializeCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    // Group expenses by category
    const categoryData = {};
    expenses.forEach(expense => {
        categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.amount;
    });

    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Amount (₹)',
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Expenses by Category'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Approval Chart (Reports Tab)
function initializeApprovalChart() {
    const ctx = document.getElementById('approvalChart').getContext('2d');
    
    // Group by approval status
    const statusData = {
        pending: expenses.filter(e => e.status === 'pending').length,
        approved: expenses.filter(e => e.status === 'approved').length,
        rejected: expenses.filter(e => e.status === 'rejected').length
    };

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Pending', 'Approved', 'Rejected'],
            datasets: [{
                data: [statusData.pending, statusData.approved, statusData.rejected],
                backgroundColor: ['#FF9800', '#4CAF50', '#F44336'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Approval Status Distribution'
                }
            }
        }
    });
}

// Generate Compliance Report (PDF)
function generateComplianceReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Compliance & ESG Report', 20, 30);
    
    // Date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
    
    let yPosition = 60;
    
    // Compliance Summary
    doc.setFontSize(16);
    doc.text('Compliance Summary', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    const complianceScore = Math.max(0, 100 - (complianceData.violations.length / Math.max(expenses.length, 1) * 100));
    doc.text(`Compliance Score: ${Math.round(complianceScore)}%`, 20, yPosition);
    yPosition += 10;
    doc.text(`Total Violations: ${complianceData.violations.length}`, 20, yPosition);
    yPosition += 20;
    
    // ESG Impact
    doc.setFontSize(16);
    doc.text('Environmental Impact (SDG 13)', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    const totalCarbon = expenses.reduce((sum, expense) => sum + (expense.carbonFootprint || 0), 0);
    doc.text(`Total Carbon Footprint: ${totalCarbon.toFixed(2)} kg CO₂`, 20, yPosition);
    yPosition += 10;
    doc.text(`Carbon Offset Required: ₹${(totalCarbon * 50).toFixed(2)}`, 20, yPosition);
    yPosition += 20;
    
    // GST Compliance
    doc.setFontSize(16);
    doc.text('GST Compliance', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    const totalGST = expenses.reduce((sum, expense) => sum + (expense.gst || 0), 0);
    doc.text(`Total GST: ₹${totalGST.toFixed(2)}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Input Tax Credit: ₹${(totalGST * 0.8).toFixed(2)}`, 20, yPosition);
    yPosition += 20;
    
    // Policy Violations
    if (complianceData.violations.length > 0) {
        doc.setFontSize(16);
        doc.text('Policy Violations', 20, yPosition);
        yPosition += 15;
        
        doc.setFontSize(10);
        complianceData.violations.forEach((violation, index) => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }
            doc.text(`${index + 1}. ${violation.message}`, 20, yPosition);
            yPosition += 8;
        });
    }
    
    // Footer
    doc.setFontSize(8);
    doc.text('This report is generated automatically and is audit-ready.', 20, 280);
    doc.text('Aligned with SDG 13: Climate Action', 20, 285);
    
    // Save the PDF
    doc.save('compliance-esg-report.pdf');
    showMessage('Compliance report generated successfully!', 'success');
}

// Preview Report
function previewReport() {
    const reportWindow = window.open('', '_blank');
    const totalCarbon = expenses.reduce((sum, expense) => sum + (expense.carbonFootprint || 0), 0);
    const totalGST = expenses.reduce((sum, expense) => sum + (expense.gst || 0), 0);
    const complianceScore = Math.max(0, 100 - (complianceData.violations.length / Math.max(expenses.length, 1) * 100));
    
    reportWindow.document.write(`
        <html>
        <head>
            <title>Compliance & ESG Report Preview</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { color: #4CAF50; }
                h2 { color: #2c3e50; margin-top: 30px; }
                .metric { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; }
                .violation { background: #fff3cd; padding: 10px; margin: 5px 0; border-radius: 5px; }
            </style>
        </head>
        <body>
            <h1>Compliance & ESG Report</h1>
            <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
            
            <h2>Compliance Summary</h2>
            <div class="metric">Compliance Score: ${Math.round(complianceScore)}%</div>
            <div class="metric">Total Violations: ${complianceData.violations.length}</div>
            
            <h2>Environmental Impact (SDG 13)</h2>
            <div class="metric">Total Carbon Footprint: ${totalCarbon.toFixed(2)} kg CO₂</div>
            <div class="metric">Carbon Offset Required: ₹${(totalCarbon * 50).toFixed(2)}</div>
            
            <h2>GST Compliance</h2>
            <div class="metric">Total GST: ₹${totalGST.toFixed(2)}</div>
            <div class="metric">Input Tax Credit: ₹${(totalGST * 0.8).toFixed(2)}</div>
            
            ${complianceData.violations.length > 0 ? `
                <h2>Policy Violations</h2>
                ${complianceData.violations.map((v, i) => `<div class="violation">${i + 1}. ${v.message}</div>`).join('')}
            ` : '<h2>No Policy Violations Detected</h2>'}
            
            <hr style="margin-top: 40px;">
            <p><small>This report is generated automatically and is audit-ready. Aligned with SDG 13: Climate Action</small></p>
        </body>
        </html>
    `);
}

// Show Message
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Sample Data for Demo
function loadSampleData() {
    if (expenses.length === 0) {
        const sampleExpenses = [
            {
                id: 1,
                amount: 15000,
                category: 'travel',
                date: '2024-01-15',
                description: 'Business trip to Mumbai',
                status: 'approved',
                carbonFootprint: 315,
                gst: 750,
                timestamp: new Date().toISOString()
            },
            {
                id: 2,
                amount: 2500,
                category: 'food',
                date: '2024-01-16',
                description: 'Client dinner',
                status: 'pending',
                carbonFootprint: 2.5,
                gst: 125,
                timestamp: new Date().toISOString()
            },
            {
                id: 3,
                amount: 8000,
                category: 'accommodation',
                date: '2024-01-17',
                description: 'Hotel stay - 2 nights',
                status: 'approved',
                carbonFootprint: 24,
                gst: 960,
                timestamp: new Date().toISOString()
            }
        ];
        
        expenses = sampleExpenses;
        localStorage.setItem('expenses', JSON.stringify(expenses));
        
        updateDashboard();
        renderExpensesList();
        checkPolicyCompliance();
        updateComplianceMetrics();
    }
}

// Load sample data on first visit
setTimeout(loadSampleData, 1000);
