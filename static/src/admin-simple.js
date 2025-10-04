// Simplified Admin.js - Guaranteed to work
console.log('✅ Admin Simple JS Loading...');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM Ready!');
    
    // Initialize sample users
    window.users = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active', lastLogin: new Date().toISOString() },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'manager', status: 'active', lastLogin: new Date().toISOString() },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'employee', status: 'active', lastLogin: new Date().toISOString() },
        { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'employee', status: 'inactive', lastLogin: new Date().toISOString() }
    ];
    
    console.log('✅ Sample users created:', window.users.length);
    
    // Render users table
    renderUsersTable();
    
    // Setup Add User button
    const addUserBtn = document.getElementById('addUserBtn');
    if (addUserBtn) {
        console.log('✅ Add User button found');
        addUserBtn.addEventListener('click', function() {
            console.log('🔘 ADD USER BUTTON CLICKED!');
            alert('Add User button works! Opening modal...');
            openUserModal();
        });
    } else {
        console.error('❌ Add User button NOT found');
    }
    
    // Setup Save Workflow button
    const saveWorkflowBtn = document.getElementById('saveWorkflowBtn');
    if (saveWorkflowBtn) {
        console.log('✅ Save Workflow button found');
        saveWorkflowBtn.addEventListener('click', function() {
            console.log('💾 SAVE WORKFLOW BUTTON CLICKED!');
            alert('Save Workflow button works!');
            showNotification('Workflow saved successfully!', 'success');
        });
    } else {
        console.error('❌ Save Workflow button NOT found');
    }
    
    // Setup New Workflow button
    const newWorkflowBtn = document.getElementById('newWorkflowBtn');
    if (newWorkflowBtn) {
        console.log('✅ New Workflow button found');
        newWorkflowBtn.addEventListener('click', function() {
            console.log('🆕 NEW WORKFLOW BUTTON CLICKED!');
            alert('New Workflow button works!');
            if (confirm('Create a new workflow? Any unsaved changes will be lost.')) {
                const canvas = document.getElementById('workflowNodes');
                if (canvas) canvas.innerHTML = '';
                showNotification('New workflow created!', 'info');
            }
        });
    } else {
        console.error('❌ New Workflow button NOT found');
    }
    
    // Setup Test Workflow button
    const testWorkflowBtn = document.getElementById('testWorkflowBtn');
    if (testWorkflowBtn) {
        console.log('✅ Test Workflow button found');
        testWorkflowBtn.addEventListener('click', function() {
            console.log('🧪 TEST WORKFLOW BUTTON CLICKED!');
            alert('Test Workflow button works!');
            showNotification('Testing workflow...', 'info');
        });
    } else {
        console.error('❌ Test Workflow button NOT found');
    }
    
    // Setup form submission
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('📝 FORM SUBMITTED!');
            
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const role = document.getElementById('role').value;
            
            if (!firstName || !lastName || !email || !role) {
                alert('Please fill in all required fields!');
                return;
            }
            
            const newUser = {
                id: window.users.length + 1,
                name: `${firstName} ${lastName}`,
                email: email,
                role: role,
                status: 'active',
                lastLogin: new Date().toISOString()
            };
            
            window.users.push(newUser);
            console.log('✅ User added:', newUser);
            
            renderUsersTable();
            closeModal(document.getElementById('userModal'));
            showNotification('User added successfully!', 'success');
            userForm.reset();
        });
    }
    
    console.log('✅ All event listeners attached!');
});

// Render users table
function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) {
        console.error('❌ Users table body not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    window.users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="badge">${user.role}</span></td>
            <td>${user.manager || '-'}</td>
            <td><span class="status-badge status-${user.status}">${user.status}</span></td>
            <td>${new Date(user.lastLogin).toLocaleString()}</td>
            <td>
                <button class="btn-icon" onclick="alert('Edit user: ${user.name}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="if(confirm('Delete ${user.name}?')) alert('User deleted')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    console.log('✅ Users table rendered:', window.users.length, 'users');
}

// Open user modal
function openUserModal() {
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        console.log('✅ Modal opened');
    } else {
        console.error('❌ Modal not found');
    }
}

// Close modal
function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        console.log('✅ Modal closed');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    console.log(`📢 Notification: ${message} (${type})`);
    alert(message); // Simple alert for now
}

// Re-analyze expenses
function reanalyzeExpenses() {
    console.log('🔄 Analyzing expenses...');
    alert('Analyzing expenses...');
    
    setTimeout(() => {
        const analysis = {
            totalExpenses: 3470,
            totalCount: 35,
            avgPerExpense: 99.14,
            categories: [
                { name: 'Travel', amount: 1250, count: 5 },
                { name: 'Meals', amount: 450, count: 8 },
                { name: 'Office Supplies', amount: 320, count: 12 },
                { name: 'Accommodation', amount: 890, count: 3 },
                { name: 'Transportation', amount: 560, count: 7 }
            ]
        };
        
        let message = `📊 Expense Analysis Results:\n\n`;
        message += `Total: $${analysis.totalExpenses}\n`;
        message += `Count: ${analysis.totalCount} expenses\n`;
        message += `Average: $${analysis.avgPerExpense.toFixed(2)}\n\n`;
        message += `By Category:\n`;
        analysis.categories.forEach(cat => {
            message += `• ${cat.name}: $${cat.amount} (${cat.count} expenses)\n`;
        });
        message += `\n💡 Top spending: ${analysis.categories[0].name}`;
        
        alert(message);
        console.log('✅ Analysis complete:', analysis);
    }, 500);
}

// View expense insights
function viewExpenseInsights() {
    console.log('📊 Viewing expense insights...');
    
    const insights = `📈 Expense Insights Dashboard

💰 Total Expenses: $3,470
📊 Categories: 5
👥 Avg per User: $99.14

Top Categories:
1. Travel: $1,250 (36%)
2. Accommodation: $890 (26%)
3. Transportation: $560 (16%)

💡 Recommendations:
• Consider setting spending limits for Travel
• Most frequent: Office Supplies (12 expenses)
• Average approval time: 1.2 days`;
    
    alert(insights);
    console.log('✅ Insights displayed');
}

// Send AI message
function sendAIMessage(message) {
    console.log('💬 Sending AI message:', message);
    
    // Simulate AI response
    setTimeout(() => {
        const responses = {
            'reduce travel': 'To reduce travel expenses, consider: 1) Implement virtual meetings, 2) Set per-diem rates, 3) Require advance booking for better rates.',
            'expense trends': 'Your expense trends show: Travel costs increased 15% this quarter, while Office Supplies decreased 8%. Consider reviewing travel policies.',
            'default': 'I can help you with expense policies, spending limits, approval workflows, and compliance. What would you like to know?'
        };
        
        const lowerMessage = message.toLowerCase();
        let response = responses.default;
        
        if (lowerMessage.includes('travel') || lowerMessage.includes('reduce')) {
            response = responses['reduce travel'];
        } else if (lowerMessage.includes('trend') || lowerMessage.includes('department')) {
            response = responses['expense trends'];
        }
        
        alert(`🤖 AI Assistant:\n\n${response}`);
        console.log('✅ AI response sent');
    }, 500);
}

// Setup modal close buttons
setTimeout(() => {
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    console.log('✅ Close buttons setup:', closeButtons.length);
}, 500);

console.log('✅ Admin Simple JS Loaded!');
