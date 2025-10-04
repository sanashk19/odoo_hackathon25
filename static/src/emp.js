// DOM Elements
const newExpenseBtn = document.getElementById('newExpenseBtn');
const expenseModal = document.getElementById('expenseModal');
const closeModalBtn = document.querySelector('.close-modal');
const expenseForm = document.getElementById('expenseForm');
const expenseTableBody = document.getElementById('expenseTableBody');
const searchExpenses = document.getElementById('searchExpenses');
const receiptUpload = document.getElementById('receiptUpload');
const fileName = document.getElementById('fileName');
const useOCR = document.getElementById('useOCR');
const pendingAmount = document.getElementById('pendingAmount');
const approvedAmount = document.getElementById('approvedAmount');
const rejectedAmount = document.getElementById('rejectedAmount');

// Get user's currency from session storage or default to USD
const userCurrency = sessionStorage.getItem('userCurrency') || 'USD';
const userCountry = sessionStorage.getItem('userCountry') || 'United States';

// Update currency display in the UI
document.addEventListener('DOMContentLoaded', () => {
    const currencyDisplay = document.createElement('div');
    currencyDisplay.className = 'currency-display';
    currencyDisplay.textContent = `Currency: ${userCurrency}`;
    document.querySelector('.header-content').appendChild(currencyDisplay);
});

// Sample data for demonstration
let expenses = [
    {
        id: 1,
        date: '2025-10-01',
        category: 'Travel',
        description: 'Taxi to client meeting',
        amount: 35.50,
        currency: userCurrency,
        status: 'approved',
        receipt: 'taxi_receipt.jpg',
        submittedAt: new Date('2025-10-01T10:30:00'),
        approvedAt: new Date('2025-10-02T14:20:00'),
        approvedBy: 'John Doe',
        comments: 'Client meeting transportation'
    },
    {
        id: 2,
        date: '2025-10-02',
        category: 'Food',
        description: 'Team lunch',
        amount: 78.90,
        currency: userCurrency,
        status: 'pending',
        receipt: 'lunch_receipt.jpg',
        submittedAt: new Date('2025-10-02T13:45:00')
    },
    {
        id: 3,
        date: '2025-09-28',
        category: 'Office',
        description: 'Printer paper and supplies',
        amount: 45.20,
        currency: userCurrency,
        status: 'rejected',
        receipt: 'office_supplies.pdf',
        submittedAt: new Date('2025-09-28T16:20:00'),
        rejectedAt: new Date('2025-09-29T09:15:00'),
        comments: 'Please use the approved vendor for office supplies.'
    }
];

// Format currency
function formatCurrency(amount, currency = userCurrency) {
    // Default to USD if the currency is not supported
    try {
        return new Intl.NumberFormat(userCountry, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    } catch (e) {
        console.warn(`Currency ${currency} not supported, falling back to USD`);
        return new Intl.NumberFormat(userCountry, {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }
};

// Format date
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

// Update summary cards
const updateSummaryCards = () => {
    const pending = expenses.filter(exp => exp.status === 'pending')
        .reduce((sum, exp) => sum + exp.amount, 0);
    const approved = expenses.filter(exp => exp.status === 'approved')
        .reduce((sum, exp) => sum + exp.amount, 0);
    const rejected = expenses.filter(exp => exp.status === 'rejected')
        .reduce((sum, exp) => sum + exp.amount, 0);
    
    pendingAmount.textContent = formatCurrency(pending);
    approvedAmount.textContent = formatCurrency(approved);
    rejectedAmount.textContent = formatCurrency(rejected);
};

// Render expense table
const renderExpenseTable = (expensesToRender = expenses) => {
    expenseTableBody.innerHTML = '';
    
    if (expensesToRender.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="text-center">No expenses found</td>
        `;
        expenseTableBody.appendChild(row);
        return;
    }
    
    expensesToRender.forEach(expense => {
        const row = document.createElement('tr');
        row.className = 'fade-in';
        
        // Status badge
        let statusBadge = '';
        if (expense.status === 'pending') {
            statusBadge = '<span class="status status-pending">Pending</span>';
        } else if (expense.status === 'approved') {
            statusBadge = '<span class="status status-approved">Approved</span>';
        } else {
            statusBadge = '<span class="status status-rejected">Rejected</span>';
        }
        
        // Action buttons
        const viewBtn = `<button onclick="viewExpense(${expense.id})" title="View Details"><i class="fas fa-eye"></i></button>`;
        const editBtn = expense.status === 'pending' 
            ? `<button onclick="editExpense(${expense.id})" title="Edit"><i class="fas fa-edit"></i></button>` 
            : '';
        const deleteBtn = expense.status === 'pending'
            ? `<button onclick="deleteExpense(${expense.id})" title="Delete"><i class="fas fa-trash"></i></button>`
            : '';
        
        row.innerHTML = `
            <td>${formatDate(expense.date)}</td>
            <td>${expense.category}</td>
            <td>${expense.description}</td>
            <td>${formatCurrency(expense.amount, expense.currency)}</td>
            <td>${statusBadge}</td>
            <td class="action-buttons">
                ${viewBtn}
                ${editBtn}
                ${deleteBtn}
            </td>
        `;
        
        expenseTableBody.appendChild(row);
    });
};

// View expense details
const viewExpense = (id) => {
    const expense = expenses.find(exp => exp.id === id);
    if (!expense) return;
    
    const detailsModal = document.getElementById('expenseDetailsModal');
    const detailsContent = document.getElementById('expenseDetailsContent');
    
    let detailsHTML = `
        <div class="expense-details">
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${formatDate(expense.date)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Category:</span>
                <span class="detail-value">${expense.category}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Description:</span>
                <span class="detail-value">${expense.description}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="detail-value">${formatCurrency(expense.amount, expense.currency)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="status status-${expense.status}">${expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Receipt:</span>
                <span class="detail-value">
                    <a href="#" class="receipt-link" onclick="viewReceipt('${expense.receipt}')">
                        <i class="fas fa-file-invoice"></i> ${expense.receipt}
                    </a>
                </span>
            </div>`;
    
    if (expense.status === 'approved' && expense.approvedBy) {
        detailsHTML += `
            <div class="detail-row">
                <span class="detail-label">Approved By:</span>
                <span class="detail-value">${expense.approvedBy}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Approved On:</span>
                <span class="detail-value">${formatDate(expense.approvedAt)}</span>
            </div>`;
    }
    
    if (expense.status === 'rejected' && expense.rejectedBy) {
        detailsHTML += `
            <div class="detail-row">
                <span class="detail-label">Rejected By:</span>
                <span class="detail-value">${expense.rejectedBy}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Rejected On:</span>
                <span class="detail-value">${formatDate(expense.rejectedAt)}</span>
            </div>`;
    }
    
    if (expense.comments) {
        detailsHTML += `
            <div class="detail-row full-width">
                <span class="detail-label">Comments:</span>
                <div class="comments">${expense.comments}</div>
            </div>`;
    }
    
    detailsHTML += `</div>`;
    
    detailsContent.innerHTML = detailsHTML;
    detailsModal.style.display = 'flex';
};

// View receipt (simulated)
const viewReceipt = (filename) => {
    alert(`Opening receipt: ${filename}\n\nThis is a simulation. In a real app, this would open the receipt file.`);
};

// Edit expense
const editExpense = (id) => {
    const expense = expenses.find(exp => exp.id === id);
    if (!expense) return;
    
    // Populate form with expense data
    document.getElementById('expenseDate').value = expense.date;
    document.getElementById('expenseCategory').value = expense.category.toLowerCase();
    document.getElementById('expenseDescription').value = expense.description;
    document.getElementById('expenseAmount').value = expense.amount;
    document.getElementById('expenseCurrency').value = expense.currency;
    
    // Show the modal
    expenseModal.style.display = 'flex';
    
    // Update form for editing
    const formTitle = document.querySelector('#expenseModal .modal-header h2');
    formTitle.textContent = 'Edit Expense';
    
    // Store the expense ID for updating
    expenseForm.dataset.editId = id;
};

// Delete expense
const deleteExpense = (id) => {
    if (confirm('Are you sure you want to delete this expense?')) {
        expenses = expenses.filter(exp => exp.id !== id);
        renderExpenseTable();
        updateSummaryCards();
    }
};

// Search expenses
const searchExpensesHandler = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    if (!searchTerm) {
        renderExpenseTable(expenses);
        return;
    }
    
    const filteredExpenses = expenses.filter(exp => 
        exp.description.toLowerCase().includes(searchTerm) ||
        exp.category.toLowerCase().includes(searchTerm) ||
        exp.amount.toString().includes(searchTerm) ||
        exp.status.toLowerCase().includes(searchTerm) ||
        formatDate(exp.date).toLowerCase().includes(searchTerm)
    );
    
    renderExpenseTable(filteredExpenses);
};

// Handle receipt upload
const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    fileName.textContent = file.name;
    
    // If OCR is enabled, simulate processing
    if (useOCR.checked) {
        // Simulate OCR processing delay
        setTimeout(() => {
            // Simulate extracted data (in a real app, this would come from an OCR API)
            const ocrData = {
                amount: (Math.random() * 500 + 10).toFixed(2),
                date: new Date().toISOString().split('T')[0],
                category: ['travel', 'food', 'accommodation', 'office', 'other'][Math.floor(Math.random() * 5)]
            };
            
            // Auto-fill form with OCR data
            document.getElementById('expenseAmount').value = ocrData.amount;
            document.getElementById('expenseDate').value = ocrData.date;
            document.getElementById('expenseCategory').value = ocrData.category;
            
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'ocr-success';
            successMsg.innerHTML = '<i class="fas fa-check-circle"></i> Receipt processed successfully!';
            document.querySelector('.file-upload').appendChild(successMsg);
            
            // Remove message after 3 seconds
            setTimeout(() => {
                successMsg.remove();
            }, 3000);
            
        }, 1500);
    }
};

// Handle form submission
const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Get user's currency from session storage or default to USD
    const userCurrency = sessionStorage.getItem('userCurrency') || 'USD';
    
    const formData = {
        id: expenseForm.dataset.editId || Date.now(),
        date: document.getElementById('expenseDate').value,
        category: document.getElementById('expenseCategory').value,
        description: document.getElementById('expenseDescription').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        currency: userCurrency, // Use the user's selected currency
        status: 'pending',
        receipt: receiptUpload.files[0] ? receiptUpload.files[0].name : 'receipt.jpg',
        submittedAt: new Date()
    };
    
    // Check if we're editing an existing expense
    if (expenseForm.dataset.editId) {
        // Update existing expense
        const index = expenses.findIndex(exp => exp.id === parseInt(expenseForm.dataset.editId));
        if (index !== -1) {
            // Preserve some fields that shouldn't change
            formData.status = expenses[index].status;
            formData.submittedAt = expenses[index].submittedAt;
            
            if (expenses[index].approvedAt) formData.approvedAt = expenses[index].approvedAt;
            if (expenses[index].approvedBy) formData.approvedBy = expenses[index].approvedBy;
            if (expenses[index].rejectedAt) formData.rejectedAt = expenses[index].rejectedAt;
            if (expenses[index].rejectedBy) formData.rejectedBy = expenses[index].rejectedBy;
            if (expenses[index].comments) formData.comments = expenses[index].comments;
            
            expenses[index] = formData;
        }
        delete expenseForm.dataset.editId;
    } else {
        // Add new expense
        expenses.unshift(formData);
    }
    
    // Reset form and close modal
    expenseForm.reset();
    fileName.textContent = 'No file chosen';
    expenseModal.style.display = 'none';
    
    // Update UI
    renderExpenseTable();
    updateSummaryCards();
    
    // Show success message
    alert('Expense submitted successfully!');
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the page
    renderExpenseTable();
    updateSummaryCards();
    
    // Set default date to today
    document.getElementById('expenseDate').valueAsDate = new Date();
});

// Open modal
newExpenseBtn.addEventListener('click', () => {
    // Reset form
    expenseForm.reset();
    document.getElementById('expenseDate').valueAsDate = new Date();
    fileName.textContent = 'No file chosen';
    
    // Update form title
    const formTitle = document.querySelector('#expenseModal .modal-header h2');
    formTitle.textContent = 'Submit New Expense';
    
    // Show modal
    expenseModal.style.display = 'flex';
});

// Close modal when clicking the X
closeModalBtn.addEventListener('click', () => {
    expenseModal.style.display = 'none';
});

// Close modal when clicking outside the modal content
window.addEventListener('click', (e) => {
    if (e.target === expenseModal) {
        expenseModal.style.display = 'none';
    }
    
    const detailsModal = document.getElementById('expenseDetailsModal');
    if (e.target === detailsModal) {
        detailsModal.style.display = 'none';
    }
});

// Close details modal
const closeDetailsModal = document.querySelector('.close-details-modal');
if (closeDetailsModal) {
    closeDetailsModal.addEventListener('click', () => {
        document.getElementById('expenseDetailsModal').style.display = 'none';
    });
}

// Form submission
expenseForm.addEventListener('submit', handleFormSubmit);

// Search expenses
searchExpenses.addEventListener('input', searchExpensesHandler);

// Handle receipt upload
receiptUpload.addEventListener('change', handleReceiptUpload);

// Sort table when clicking on column headers
document.querySelectorAll('th').forEach(header => {
    header.addEventListener('click', () => {
        const column = header.textContent.trim().toLowerCase();
        const icon = header.querySelector('i');
        let direction = 'asc';
        
        // Toggle sort direction
        if (icon.classList.contains('fa-sort-up')) {
            icon.classList.remove('fa-sort-up');
            icon.classList.add('fa-sort-down');
            direction = 'desc';
        } else if (icon.classList.contains('fa-sort-down')) {
            icon.classList.remove('fa-sort-down');
            icon.classList.add('fa-sort');
            direction = 'none';
        } else {
            icon.classList.add('fa-sort-up');
            direction = 'asc';
        }
        
        // Reset other sort icons
        document.querySelectorAll('th i').forEach(i => {
            if (i !== icon) {
                i.className = 'fas fa-sort';
            }
        });
        
        if (direction === 'none') {
            renderExpenseTable();
            return;
        }
        
        // Sort expenses
        const sortedExpenses = [...expenses].sort((a, b) => {
            let aValue, bValue;
            
            switch (column) {
                case 'date':
                    aValue = new Date(a.date);
                    bValue = new Date(b.date);
                    break;
                case 'category':
                    aValue = a.category.toLowerCase();
                    bValue = b.category.toLowerCase();
                    break;
                case 'amount':
                    aValue = a.amount;
                    bValue = b.amount;
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                default:
                    return 0;
            }
            
            if (aValue < bValue) return direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        
        renderExpenseTable(sortedExpenses);
    });
});

// Cancel button in form
document.getElementById('cancelExpense').addEventListener('click', () => {
    expenseModal.style.display = 'none';
});
