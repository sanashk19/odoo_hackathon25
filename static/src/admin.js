// Admin Dashboard JavaScript - Backend Integration
const API_BASE_URL = 'http://localhost:8000/api';

// Global state
let currentUser = null;
let users = [];
let workflows = [];
let expenses = [];

// API Service
const api = {
    // Users
    getUsers: async () => {
        const response = await fetch(`${API_BASE_URL}/users`);
        return await response.json();
    },
    
    createUser: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return await response.json();
    },
    
    // Workflows
    getWorkflows: async () => {
        const response = await fetch(`${API_BASE_URL}/workflows`);
        return await response.json();
    },
    
    saveWorkflow: async (workflow) => {
        const url = workflow.id ? 
            `${API_BASE_URL}/workflows/${workflow.id}` : 
            `${API_BASE_URL}/workflows`;
            
        const method = workflow.id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workflow)
        });
        return await response.json();
    },
    
    // Expenses
    getExpenses: async () => {
        const response = await fetch(`${API_BASE_URL}/expenses`);
        return await response.json();
    },
    
    analyzeExpenses: async () => {
        const response = await fetch(`${API_BASE_URL}/expenses/analyze`);
        return await response.json();
    }
};

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Admin panel initializing...');
    
    try {
        // Initialize UI components FIRST (this sets up window.users)
        console.log('1️⃣ Initializing navigation...');
        initNavigation();
        
        console.log('2️⃣ Initializing user management...');
        initUserManagement();
        
        console.log('3️⃣ Initializing workflow builder...');
        initWorkflowBuilder();
        
        console.log('4️⃣ Initializing AI assistant...');
        initAIAssistant();
        
        console.log('5️⃣ Initializing modals...');
        initModals();
        
        // Set up event listeners
        console.log('6️⃣ Setting up event listeners...');
        setupEventListeners();
        
        // Load initial data (this will render the users table)
        console.log('7️⃣ Loading initial data...');
        await loadInitialData();
        
        console.log('✅ Admin panel initialized successfully!');
        console.log('👥 Total users:', window.users?.length || 0);
        
    } catch (error) {
        console.error('❌ Error initializing admin panel:', error);
        showNotification('Failed to initialize admin panel', 'error');
    }
});

// Check if user is authenticated and has manager role
function checkAuth() {
    console.log('Checking authentication...');
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    const userRole = sessionStorage.getItem('userRole');
    
    console.log('isAuthenticated:', isAuthenticated);
    console.log('userRole:', userRole);
    
    if (!isAuthenticated || userRole !== 'manager') {
        console.log('User not authenticated or not a manager, redirecting to login...');
        window.location.href = 'login.html';
        return;
    }
    
    // Set user email in the sidebar
    const userEmail = sessionStorage.getItem('userEmail');
    if (userEmail) {
        document.getElementById('userEmail').textContent = userEmail;
    }
}

// Initialize navigation between sections
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('.admin-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active state in navigation
            navLinks.forEach(navLink => navLink.parentElement.classList.remove('active'));
            this.parentElement.classList.add('active');
            
            // Show the corresponding section
            const targetId = this.id.replace('Link', 'Section');
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
            
            // Special handling for specific sections
            if (targetId === 'workflowSection') {
                initDragula();
            }
        });
    });
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        sessionStorage.clear();
        window.location.href = 'login.html';
    });
}

// Initialize User Management functionality
function initUserManagement() {
    // This would be replaced with actual API calls in a real application
    window.users = [
        {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'admin',
            manager: null,
            status: 'active',
            lastLogin: '2023-10-15 14:30:22'
        },
        {
            id: 2,
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            role: 'manager',
            manager: 'John Doe',
            status: 'active',
            lastLogin: '2023-10-16 09:15:45'
        },
        {
            id: 3,
            name: 'Bob Johnson',
            email: 'bob.johnson@example.com',
            role: 'employee',
            manager: 'Jane Smith',
            status: 'active',
            lastLogin: '2023-10-16 10:20:33'
        },
        {
            id: 4,
            name: 'Alice Williams',
            email: 'alice.williams@example.com',
            role: 'employee',
            manager: 'Jane Smith',
            status: 'inactive',
            lastLogin: '2023-10-10 16:45:12'
        }
    ];
    
    // Initialize user table
    renderUsersTable();
    
    // Set up user search
    const userSearch = document.getElementById('userSearch');
    if (userSearch) {
        userSearch.addEventListener('input', filterUsers);
    }
    
    // Set up role filter
    const roleFilter = document.getElementById('filterByRole');
    if (roleFilter) {
        roleFilter.addEventListener('change', filterUsers);
    }
    
    // Set up status filter
    const statusFilter = document.getElementById('filterByStatus');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterUsers);
    }
}

// Render users table with current filter/sort
function renderUsersTable(usersToRender = window.users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (usersToRender.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td colspan="7" class="text-center py-4">
                <i class="fas fa-users-slash fa-2x mb-2 text-muted"></i>
                <p>No users found matching your criteria</p>
            </td>
        `;
        tbody.appendChild(tr);
        return;
    }
    
    usersToRender.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="badge ${getRoleBadgeClass(user.role)}">${user.role}</span></td>
            <td>${user.manager || '-'}</td>
            <td><span class="status-badge status-${user.status}">${user.status}</span></td>
            <td>${formatDate(user.lastLogin)}</td>
            <td class="actions">
                <button class="btn-icon edit-user" data-id="${user.id}" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete-user" data-id="${user.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-user').forEach(btn => {
        btn.addEventListener('click', () => openEditUserModal(parseInt(btn.dataset.id)));
    });
    
    document.querySelectorAll('.delete-user').forEach(btn => {
        btn.addEventListener('click', () => confirmDeleteUser(parseInt(btn.dataset.id)));
    });
}

// Filter users based on search and filter criteria
function filterUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const roleFilter = document.getElementById('filterByRole').value;
    const statusFilter = document.getElementById('filterByStatus').value;
    
    const filteredUsers = window.users.filter(user => {
        // Filter by search term
        const matchesSearch = 
            user.name.toLowerCase().includes(searchTerm) || 
            user.email.toLowerCase().includes(searchTerm);
        
        // Filter by role
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        
        // Filter by status
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        
        return matchesSearch && matchesRole && matchesStatus;
    });
    
    renderUsersTable(filteredUsers);
}

// Get CSS class for role badges
function getRoleBadgeClass(role) {
    const classes = {
        'admin': 'badge-danger',
        'manager': 'badge-warning',
        'employee': 'badge-info'
    };
    return classes[role] || 'badge-secondary';
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Initialize Workflow Builder functionality
function initWorkflowBuilder() {
    console.log('⚙️ Initializing workflow builder...');
    
    // Initialize workflow data
    window.workflows = [
        {
            id: 1,
            name: 'Standard Approval',
            description: 'Standard approval workflow for all expenses',
            nodes: [
                { id: 'start', type: 'start' },
                { id: 'approver1', type: 'approver', name: 'Manager Approval', approvers: ['manager'] },
                { id: 'end', type: 'end' }
            ],
            edges: [
                { from: 'start', to: 'approver1' },
                { from: 'approver1', to: 'end' }
            ]
        },
        {
            id: 2,
            name: 'Finance Approval',
            description: 'Approval workflow for finance-related expenses',
            nodes: [
                { id: 'start', type: 'start' },
                { id: 'approver1', type: 'approver', name: 'Manager Approval', approvers: ['manager'] },
                { id: 'approver2', type: 'approver', name: 'Finance Approval', approvers: ['finance'] },
                { id: 'end', type: 'end' }
            ],
            edges: [
                { from: 'start', to: 'approver1' },
                { from: 'approver1', to: 'approver2' },
                { from: 'approver2', to: 'end' }
            ]
        }
    ];
    
    // Set up workflow button event listeners
    const saveWorkflowBtn = document.getElementById('saveWorkflowBtn');
    const newWorkflowBtn = document.getElementById('newWorkflowBtn');
    const testWorkflowBtn = document.getElementById('testWorkflowBtn');
    const publishWorkflowBtn = document.getElementById('publishWorkflowBtn');
    
    console.log('Save Workflow Button found:', !!saveWorkflowBtn);
    console.log('New Workflow Button found:', !!newWorkflowBtn);
    console.log('Test Workflow Button found:', !!testWorkflowBtn);
    
    if (saveWorkflowBtn) {
        saveWorkflowBtn.addEventListener('click', () => {
            console.log('💾 Save Workflow button clicked!');
            saveWorkflow();
        });
        console.log('✅ Save Workflow event listener attached');
    }
    
    if (newWorkflowBtn) {
        newWorkflowBtn.addEventListener('click', () => {
            console.log('🆕 New Workflow button clicked!');
            createNewWorkflow();
        });
        console.log('✅ New Workflow event listener attached');
    }
    
    if (testWorkflowBtn) {
        testWorkflowBtn.addEventListener('click', () => {
            console.log('🧪 Test Workflow button clicked!');
            testWorkflow();
        });
        console.log('✅ Test Workflow event listener attached');
    }
    
    if (publishWorkflowBtn) {
        publishWorkflowBtn.addEventListener('click', () => {
            console.log('📤 Publish Workflow button clicked!');
            publishWorkflow();
        });
        console.log('✅ Publish Workflow event listener attached');
    }
    
    console.log('✅ Workflow builder initialized');
}

// Add event listeners to workflow nodes
function addNodeEventListeners(node) {
    // Edit node
    const editBtn = node.querySelector('.edit-node');
    if (editBtn) {
        editBtn.addEventListener('click', () => editNode(node));
    }
    
    // Delete node
    const deleteBtn = node.querySelector('.delete-node');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => deleteNode(node));
    }
}

// Edit workflow node
function editNode(node) {
    const nodeType = node.getAttribute('data-type');
    const propertiesContent = document.getElementById('propertiesContent');
    
    // Clear previous content
    propertiesContent.innerHTML = '';
    
    // Create and show properties form based on node type
    let formHtml = '';
    
    switch(nodeType) {
        case 'approver':
            formHtml = `
                <div class="form-group">
                    <label>Approval Type</label>
                    <select class="form-control">
                        <option value="manager">Manager</option>
                        <option value="specific">Specific Person</option>
                        <option value="role">Role-based</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Approver Name</label>
                    <input type="text" class="form-control" value="Manager">
                </div>
                <div class="form-group">
                    <label>Required Approvals</label>
                    <input type="number" class="form-control" value="1" min="1">
                </div>
                <div class="form-group">
                    <label>Timeout (hours)</label>
                    <input type="number" class="form-control" value="24" min="1">
                    <small class="text-muted">After this time, the request will be escalated</small>
                </div>
                <button class="btn btn-primary btn-block">Save Changes</button>
            `;
            break;
            
        case 'condition':
            formHtml = `
                <div class="form-group">
                    <label>Condition Type</label>
                    <select class="form-control">
                        <option value="amount">Amount</option>
                        <option value="category">Category</option>
                        <option value="custom">Custom Rule</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Condition</label>
                    <select class="form-control">
                        <option value="greater_than">Greater Than</option>
                        <option value="less_than">Less Than</option>
                        <option value="equals">Equals</option>
                        <option value="contains">Contains</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Value</label>
                    <input type="text" class="form-control" placeholder="Enter value">
                </div>
                <div class="form-group">
                    <label>If true, go to:</label>
                    <select class="form-control">
                        <option value="next">Next Step</option>
                        <option value="end">End Workflow</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>If false, go to:</label>
                    <select class="form-control">
                        <option value="next">Next Step</option>
                        <option value="end">End Workflow</option>
                    </select>
                </div>
                <button class="btn btn-primary btn-block">Save Condition</button>
            `;
            break;
            
        default:
            formHtml = `
                <div class="form-group">
                    <label>Node Type</label>
                    <input type="text" class="form-control" value="${nodeType}" disabled>
                </div>
                <div class="form-group">
                    <label>Node Name</label>
                    <input type="text" class="form-control" value="${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea class="form-control" rows="3"></textarea>
                </div>
                <button class="btn btn-primary btn-block">Save Changes</button>
            `;
    }
    
    propertiesContent.innerHTML = formHtml;
    
    // Show the properties panel
    document.querySelector('.workflow-properties').classList.add('active');
}

// Delete workflow node
function deleteNode(node) {
    if (confirm('Are you sure you want to delete this node?')) {
        node.remove();
        updateConnectors();
    }
}

// Update connectors between nodes (simplified example)
function updateConnectors() {
    // In a real implementation, this would use a library like jsPlumb or draw SVG lines
    console.log('Updating connectors between nodes');
}

// Render workflow templates
function renderWorkflowTemplates() {
    const templatesContainer = document.querySelector('.workflow-templates');
    if (!templatesContainer) return;
    
    // Clear existing templates
    templatesContainer.innerHTML = '<h3>Templates</h3>';
    
    // Add templates
    const templates = [
        { id: 'simple-approval', name: 'Simple Approval', icon: 'file-alt', description: 'Single level manager approval' },
        { id: 'manager-then-finance', name: 'Manager → Finance', icon: 'sitemap', description: 'Manager approval followed by finance' },
        { id: 'conditional-approval', name: 'Conditional Approval', icon: 'random', description: 'Approval path based on amount or category' }
    ];
    
    templates.forEach(template => {
        const templateEl = document.createElement('div');
        templateEl.className = 'template';
        templateEl.setAttribute('data-template', template.id);
        templateEl.innerHTML = `
            <i class="fas fa-${template.icon}"></i>
            <div class="template-info">
                <div class="template-name">${template.name}</div>
                <div class="template-desc">${template.description}</div>
            </div>
        `;
        
        templateEl.addEventListener('click', () => loadWorkflowTemplate(template.id));
        templatesContainer.appendChild(templateEl);
    });
}

// Load workflow template
function loadWorkflowTemplate(templateId) {
    // In a real application, this would load a predefined workflow template
    console.log('Loading workflow template:', templateId);
    
    // Clear existing workflow
    document.getElementById('workflowNodes').innerHTML = '';
    
    // Add nodes based on template
    let nodes = [];
    
    switch(templateId) {
        case 'simple-approval':
            nodes = [
                { id: 'approver1', type: 'approver', name: 'Manager Approval', approvers: ['manager'] }
            ];
            break;
            
        case 'manager-then-finance':
            nodes = [
                { id: 'approver1', type: 'approver', name: 'Manager Approval', approvers: ['manager'] },
                { id: 'approver2', type: 'approver', name: 'Finance Approval', approvers: ['finance'] }
            ];
            break;
            
        case 'conditional-approval':
            nodes = [
                { 
                    id: 'condition1', 
                    type: 'condition', 
                    name: 'Amount > $1000',
                    condition: {
                        type: 'amount',
                        operator: 'greater_than',
                        value: 1000
                    }
                },
                { 
                    id: 'approver1', 
                    type: 'approver', 
                    name: 'Manager Approval', 
                    approvers: ['manager'] 
                },
                { 
                    id: 'approver2', 
                    type: 'approver', 
                    name: 'Finance Approval', 
                    approvers: ['finance'],
                    condition: 'amount > 1000'
                }
            ];
            break;
    }
    
    // Render nodes
    const workflowNodes = document.getElementById('workflowNodes');
    nodes.forEach((node, index) => {
        const nodeEl = document.createElement('div');
        nodeEl.className = 'workflow-node';
        nodeEl.setAttribute('data-type', node.type);
        nodeEl.setAttribute('data-id', node.id);
        
        let nodeContent = '';
        
        if (node.type === 'approver') {
            nodeContent = `
                <div class="node-header">
                    <div class="node-title">${node.name}</div>
                    <div class="node-actions">
                        <button class="btn-icon edit-node"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon delete-node"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <div class="node-content">
                    <div><i class="fas fa-user-tie"></i> ${node.approvers.join(', ')}</div>
                    ${node.condition ? `<div class="node-condition"><i class="fas fa-code-branch"></i> ${node.condition}</div>` : ''}
                </div>
            `;
        } else if (node.type === 'condition') {
            nodeContent = `
                <div class="node-header">
                    <div class="node-title">${node.name}</div>
                    <div class="node-actions">
                        <button class="btn-icon edit-node"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon delete-node"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <div class="node-content">
                    <div><i class="fas fa-code-branch"></i> ${node.condition.type} ${node.condition.operator} ${node.condition.value}</div>
                </div>
            `;
        }
        
        nodeEl.innerHTML = nodeContent;
        workflowNodes.appendChild(nodeEl);
        
        // Add event listeners
        addNodeEventListeners(nodeEl);
        
        // Add connector if not the first node
        if (index > 0) {
            const connector = document.createElement('div');
            connector.className = 'node-connector';
            workflowNodes.appendChild(connector);
        }
    });
    
    // Update connectors
    updateConnectors();
    
    // Show success message
    showNotification('Workflow template loaded successfully', 'success');
}

// Save workflow
async function saveWorkflow() {
    console.log('Saving workflow...');
    
    try {
        // Get workflow data from UI
        const workflowData = {
            id: window.currentWorkflowId || undefined,
            name: document.getElementById('workflowName')?.value || 'Untitled Workflow',
            nodes: [],
            edges: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        // Collect nodes from the canvas
        const nodeElements = document.querySelectorAll('#workflowNodes .workflow-node');
        nodeElements.forEach((node, index) => {
            workflowData.nodes.push({
                id: node.getAttribute('data-id') || `node-${index}`,
                type: node.getAttribute('data-type') || 'default',
                name: node.querySelector('.node-title')?.textContent || 'Node',
                position: { x: index * 200, y: 100 },
                data: {}
            });
        });
        
        // Save to backend
        const result = await api.saveWorkflow(workflowData);
        window.currentWorkflowId = result.id;
        
        showNotification('Workflow saved successfully', 'success');
    } catch (error) {
        console.error('Error saving workflow:', error);
        showNotification('Failed to save workflow', 'error');
    }
}

// Create new workflow
function createNewWorkflow() {
    console.log('Creating new workflow...');
    
    if (confirm('Create a new workflow? Any unsaved changes will be lost.')) {
        // Reset workflow state
        window.currentWorkflowId = null;
        
        // Clear workflow canvas
        const workflowNodes = document.getElementById('workflowNodes');
        if (workflowNodes) {
            workflowNodes.innerHTML = '';
            console.log('✅ Workflow canvas cleared');
        }
        
        // Reset workflow name if field exists
        const workflowNameField = document.getElementById('workflowName');
        if (workflowNameField) {
            workflowNameField.value = 'New Workflow';
        }
        
        // Close properties panel
        const propertiesPanel = document.querySelector('.workflow-properties');
        if (propertiesPanel) {
            propertiesPanel.classList.remove('active');
        }
        
        showNotification('New workflow created', 'info');
        console.log('✅ New workflow created successfully');
    } else {
        console.log('❌ New workflow creation cancelled');
    }
}

// Test workflow
async function testWorkflow() {
    console.log('Testing workflow...');
    
    try {
        // Get current workflow nodes
        const nodeElements = document.querySelectorAll('#workflowNodes .workflow-node');
        
        if (nodeElements.length === 0) {
            showNotification('Please add nodes to the workflow before testing', 'warning');
            return;
        }
        
        // Simulate workflow execution
        showNotification('Running workflow test...', 'info');
        
        // Highlight nodes as they execute
        for (let i = 0; i < nodeElements.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 500));
            nodeElements[i].style.border = '2px solid #4CAF50';
            await new Promise(resolve => setTimeout(resolve, 500));
            nodeElements[i].style.border = '';
        }
        
        showNotification('Workflow test completed successfully', 'success');
    } catch (error) {
        console.error('Error testing workflow:', error);
        showNotification('Workflow test failed', 'error');
    }
}

// Publish workflow
function publishWorkflow() {
    if (confirm('Publish this workflow? It will become active for new expense reports.')) {
        // In a real application, this would publish the workflow
        console.log('Publishing workflow...');
        
        // Simulate API call
        setTimeout(() => {
            showNotification('Workflow published successfully', 'success');
        }, 1000);
    }
}

// Initialize Company Settings functionality
function initCompanySettings() {
    // Load company settings
    loadCompanySettings();
    
    // Set up tab navigation
    const tabs = document.querySelectorAll('.settings-tabs .tab');
    const tabContents = document.querySelectorAll('.settings-content .tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}Tab`) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Set up file upload preview
    const logoUpload = document.getElementById('companyLogo');
    if (logoUpload) {
        logoUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('logoPreviewImg');
                    preview.src = e.target.result;
                    document.querySelector('.file-name').textContent = file.name;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Set up save settings button
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveCompanySettings);
    }
}

// Load company settings
function loadCompanySettings() {
    // In a real application, this would fetch settings from the server
    const settings = {
        companyName: 'Acme Inc.',
        logo: 'https://via.placeholder.com/150',
        defaultCurrency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timezone: 'UTC-08:00',
        expenseCategories: ['Travel', 'Meals', 'Office Supplies', 'Entertainment', 'Transportation', 'Lodging', 'Other'],
        requireReceipts: true,
        enforceReceiptAmounts: true,
        allowMultipleReceipts: true,
        integrations: {
            quickbooks: false,
            xero: false,
            slack: true,
            google: false
        },
        billing: {
            plan: 'Business Pro',
            price: 29.99,
            users: 50,
            cycle: 'monthly',
            nextBillingDate: '2023-11-01',
            paymentMethod: {
                type: 'visa',
                last4: '4242'
            },
            billingHistory: [
                { date: '2023-10-01', amount: 29.99, receipt: '#' },
                { date: '2023-09-01', amount: 29.99, receipt: '#' },
                { date: '2023-08-01', amount: 29.99, receipt: '#' }
            ]
        }
    };
    
    // Populate general settings
    document.getElementById('companyName').value = settings.companyName;
    document.getElementById('logoPreviewImg').src = settings.logo;
    document.getElementById('defaultCurrency').value = settings.defaultCurrency;
    document.getElementById('dateFormat').value = settings.dateFormat;
    document.getElementById('timezone').value = settings.timezone;
    
    // Populate expense categories
    const categoriesList = document.getElementById('categoriesList');
    if (categoriesList) {
        categoriesList.innerHTML = '';
        settings.expenseCategories.forEach(category => {
            const categoryEl = document.createElement('div');
            categoryEl.className = 'category-item';
            categoryEl.innerHTML = `
                <input type="text" class="form-control" value="${category}">
                <button class="btn-icon remove-category"><i class="fas fa-times"></i></button>
            `;
            categoriesList.appendChild(categoryEl);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-category').forEach(btn => {
            btn.addEventListener('click', function() {
                if (document.querySelectorAll('.category-item').length > 1) {
                    this.parentElement.remove();
                } else {
                    showNotification('At least one category is required', 'error');
                }
            });
        });
    }
    
    // Set up add category button
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', function() {
            const categoryEl = document.createElement('div');
            categoryEl.className = 'category-item';
            categoryEl.innerHTML = `
                <input type="text" class="form-control" placeholder="New category">
                <button class="btn-icon remove-category"><i class="fas fa-times"></i></button>
            `;
            categoriesList.appendChild(categoryEl);
            
            // Focus the new input
            const input = categoryEl.querySelector('input');
            input.focus();
            
            // Add event listener to remove button
            categoryEl.querySelector('.remove-category').addEventListener('click', function() {
                if (document.querySelectorAll('.category-item').length > 1) {
                    categoryEl.remove();
                } else {
                    showNotification('At least one category is required', 'error');
                }
            });
        });
    }
    
    // Set receipt requirements
    document.getElementById('requireReceipts').checked = settings.requireReceipts;
    document.getElementById('enforceReceiptAmounts').checked = settings.enforceReceiptAmounts;
    document.getElementById('allowMultipleReceipts').checked = settings.allowMultipleReceipts;
    
    // Set up integrations
    document.getElementById('quickbooksEnabled').checked = settings.integrations.quickbooks;
    document.getElementById('xeroEnabled').checked = settings.integrations.xero;
    document.getElementById('slackEnabled').checked = settings.integrations.slack;
    document.getElementById('googleEnabled').checked = settings.integrations.google;
    
    // Set up billing information
    const billingCard = document.querySelector('.billing-card');
    if (billingCard) {
        billingCard.querySelector('.plan-name').textContent = settings.billing.plan;
        billingCard.querySelector('.plan-price').innerHTML = `$${settings.billing.price} <span class="plan-period">/${settings.billing.cycle}</span>`;
        billingCard.querySelector('.plan-users').textContent = `Up to ${settings.billing.users} users`;
        
        const nextBillingDate = new Date(settings.billing.nextBillingDate).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        document.querySelector('.billing-details .detail-row:nth-child(2) .detail-value').textContent = nextBillingDate;
        
        // Populate billing history
        const billingHistory = document.querySelector('.billing-history');
        if (billingHistory) {
            billingHistory.innerHTML = '';
            
            settings.billing.billingHistory.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'billing-item';
                
                const date = new Date(item.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                });
                
                itemEl.innerHTML = `
                    <div class="billing-date">${date}</div>
                    <div class="billing-amount">$${item.amount.toFixed(2)}</div>
                    <div class="billing-receipt">
                        <a href="${item.receipt}" class="btn-link">Receipt</a>
                    </div>
                `;
                
                billingHistory.appendChild(itemEl);
            });
        }
    }
}

// Save company settings
function saveCompanySettings() {
    // In a real application, this would save settings to the server
    console.log('Saving company settings...');
    
    // Collect settings from the form
    const settings = {
        companyName: document.getElementById('companyName').value,
        defaultCurrency: document.getElementById('defaultCurrency').value,
        dateFormat: document.getElementById('dateFormat').value,
        timezone: document.getElementById('timezone').value,
        expenseCategories: Array.from(document.querySelectorAll('.category-item input')).map(input => input.value),
        requireReceipts: document.getElementById('requireReceipts').checked,
        enforceReceiptAmounts: document.getElementById('enforceReceiptAmounts').checked,
        allowMultipleReceipts: document.getElementById('allowMultipleReceipts').checked,
        integrations: {
            quickbooks: document.getElementById('quickbooksEnabled').checked,
            xero: document.getElementById('xeroEnabled').checked,
            slack: document.getElementById('slackEnabled').checked,
            google: document.getElementById('googleEnabled').checked
        }
    };
    
    console.log('Settings to save:', settings);
    
    // Simulate API call
    setTimeout(() => {
        showNotification('Company settings saved successfully', 'success');
    }, 1000);
}

// Initialize AI Assistant functionality
function initAIAssistant() {
    console.log('🤖 Initializing AI Assistant...');
    
    // Set up AI chat - try both possible button selectors
    const chatInput = document.getElementById('aiQueryInput');
    const sendButton = document.getElementById('sendQueryBtn') || document.querySelector('.ai-send-btn');
    
    console.log('AI Chat Input found:', !!chatInput);
    console.log('AI Send Button found:', !!sendButton);
    
    if (chatInput) {
        // Send message on Enter key
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim() !== '') {
                console.log('💬 Enter key pressed in AI chat');
                sendAIMessage();
            }
        });
        console.log('✅ AI chat input event listener attached');
    } else {
        console.error('❌ AI chat input not found');
    }
    
    if (sendButton) {
        // Send message on button click
        sendButton.addEventListener('click', function() {
            console.log('💬 AI Send button clicked!');
            sendAIMessage();
        });
        console.log('✅ AI send button event listener attached');
    } else {
        console.error('❌ AI send button not found');
    }
    
    // Set up suggestion buttons
    const suggestionButtons = document.querySelectorAll('.suggestion-btn');
    suggestionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const suggestion = this.getAttribute('data-suggestion');
            sendAIMessage(suggestion);
        });
    });
    
    // Set up apply suggestions button
    const applySuggestionsBtn = document.getElementById('applySuggestionsBtn');
    if (applySuggestionsBtn) {
        applySuggestionsBtn.addEventListener('click', applyAISuggestions);
    }
    
    // Set up re-analyze expenses button
    const analyzeExpensesBtn = document.getElementById('analyzeExpensesBtn');
    if (analyzeExpensesBtn) {
        analyzeExpensesBtn.addEventListener('click', reanalyzeExpenses);
    }
    
    // Set up view insights button
    const viewInsightsBtn = document.getElementById('viewInsightsBtn');
    if (viewInsightsBtn) {
        viewInsightsBtn.addEventListener('click', viewExpenseInsights);
    }
    
    // Load initial AI suggestions
    loadAISuggestions();
}

// Send message to AI assistant
function sendAIMessage(message = null) {
    console.log('💬 sendAIMessage called with:', message);
    
    const chatInput = document.getElementById('aiQueryInput');
    const chatContainer = document.getElementById('aiChat');
    
    if (!chatContainer) {
        console.error('❌ Chat container not found');
        return;
    }
    
    // Get message from input or parameter
    const userMessage = message || (chatInput ? chatInput.value.trim() : '');
    if (!userMessage) {
        console.log('❌ No message to send');
        return;
    }
    
    console.log('✅ Sending message:', userMessage);
    
    // Add user message to chat
    addChatMessage('user', userMessage);
    
    // Clear input
    if (!message && chatInput) {
        chatInput.value = '';
    }
    
    // Simulate AI response with smart keyword detection
    setTimeout(() => {
        const lowerMessage = userMessage.toLowerCase();
        let response = '';
        
        // Smart responses based on keywords
        if (lowerMessage.includes('travel') || lowerMessage.includes('reduce')) {
            response = "To reduce travel expenses, I recommend: 1) Implement virtual meetings where possible, 2) Set per-diem rates for different cities, 3) Require advance booking for better rates, 4) Consider corporate travel partnerships for discounts.";
        } else if (lowerMessage.includes('trend') || lowerMessage.includes('department')) {
            response = "Your expense trends show: Travel costs increased 15% this quarter, while Office Supplies decreased 8%. The Marketing department has the highest average expense per report at $450. Consider reviewing travel policies and setting department-specific budgets.";
        } else if (lowerMessage.includes('policy') || lowerMessage.includes('compliance')) {
            response = "Current policy compliance is at 87%. Main areas of concern: 1) 13% of expenses lack proper receipts, 2) Some expenses exceed category limits, 3) Average approval time is 1.2 days. I recommend implementing automated policy checks and receipt requirements.";
        } else if (lowerMessage.includes('approval') || lowerMessage.includes('workflow')) {
            response = "For optimal approval workflows, I suggest: 1) Auto-approve expenses under $50, 2) Single manager approval for $50-$1000, 3) Multi-level approval for expenses over $1000, 4) Set up automated reminders after 24 hours.";
        } else {
            response = "I can help you with expense policies, spending limits, approval workflows, compliance, and trend analysis. Try asking about: 'How can I reduce travel expenses?' or 'Show me expense trends by department' or 'What's our policy compliance status?'";
        }
        
        addChatMessage('ai', response);
        console.log('✅ AI response sent');
    }, 500);
}

// Add message to chat
function addChatMessage(sender, message) {
    const chatContainer = document.getElementById('aiChat');
    const messageDiv = document.createElement('div');
    
    messageDiv.className = `message ${sender}-message`;
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-sender">${sender === 'user' ? 'You' : 'Policy Assistant'}</span>
                <span class="message-time">${formatTime(new Date())}</span>
            </div>
            <div class="message-text">${message}</div>
        </div>
    `;
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Format time for chat messages
function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Load AI suggestions
function loadAISuggestions() {
    // In a real application, this would fetch suggestions from the server
    const suggestions = [
        {
            id: 1,
            title: 'Implement Spending Limits',
            description: 'Set monthly spending limits by category based on historical data.',
            impact: 'High',
            confidence: '92%',
            estimatedSavings: '$1,200/month'
        },
        {
            id: 2,
            title: 'Automate Receipt Matching',
            description: 'Enable AI-powered receipt matching to reduce manual entry errors.',
            impact: 'Medium',
            confidence: '85%',
            estimatedSavings: '5 hours/week'
        },
        {
            id: 3,
            title: 'Multi-level Approval',
            description: 'Add a second approval level for expenses over $5,000.',
            impact: 'High',
            confidence: '88%',
            estimatedSavings: 'Improved compliance'
        }
    ];
    
    const suggestionsContainer = document.querySelector('.ai-suggestions');
    if (!suggestionsContainer) return;
    
    // Clear existing suggestions
    suggestionsContainer.innerHTML = '<h3>Policy Suggestions</h3>';
    
    // Add suggestions
    suggestions.forEach(suggestion => {
        const suggestionEl = document.createElement('div');
        suggestionEl.className = 'suggestion-item';
        suggestionEl.innerHTML = `
            <div class="suggestion-header">
                <div class="suggestion-title">
                    <i class="fas fa-lightbulb"></i>
                    ${suggestion.title}
                </div>
                <div class="suggestion-meta">
                    <span class="badge badge-${suggestion.impact.toLowerCase() === 'high' ? 'danger' : 'warning'}">${suggestion.impact} Impact</span>
                    <span class="badge badge-info">${suggestion.confidence} Confidence</span>
                </div>
            </div>
            <div class="suggestion-desc">${suggestion.description}</div>
            <div class="suggestion-footer">
                <span class="text-muted">Estimated Savings: ${suggestion.estimatedSavings}</span>
                <button class="btn btn-sm btn-outline" data-suggestion-id="${suggestion.id}">View Details</button>
            </div>
        `;
        
        suggestionsContainer.appendChild(suggestionEl);
    });
}

// Apply AI suggestions
function applyAISuggestions() {
    // In a real application, this would apply the selected suggestions
    console.log('Applying AI suggestions...');
    
    // Show loading state
    const applyBtn = document.getElementById('applySuggestionsBtn');
    const originalText = applyBtn.innerHTML;
    applyBtn.disabled = true;
    applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Applying...';
    
    // Simulate API call
    setTimeout(() => {
        // Reset button state
        applyBtn.disabled = false;
        applyBtn.innerHTML = originalText;
        
        // Show success message
        showNotification('AI suggestions applied successfully', 'success');
        
        // Disable the button again
        applyBtn.disabled = true;
    }, 2000);
}

// Initialize modals
function initModals() {
    console.log('📋 Initializing modals...');
    
    // Add User Modal
    const addUserBtn = document.getElementById('addUserBtn');
    const userModal = document.getElementById('userModal');
    const closeUserModal = userModal?.querySelector('.close-modal');
    
    console.log('Add User Button found:', !!addUserBtn);
    console.log('User Modal found:', !!userModal);
    
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
            console.log('🔘 Add User button clicked!');
            openUserModal();
        });
        console.log('✅ Add User button event listener attached');
    } else {
        console.error('❌ Add User button not found!');
    }
    
    if (closeUserModal) {
        closeUserModal.addEventListener('click', () => {
            closeModal(userModal);
        });
    }
    
    // Confirm Modal
    const confirmModal = document.getElementById('confirmModal');
    const closeConfirmModal = confirmModal?.querySelector('.close-modal');
    
    if (closeConfirmModal) {
        closeConfirmModal.addEventListener('click', () => {
            closeModal(confirmModal);
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === userModal) {
            closeModal(userModal);
        }
        if (e.target === confirmModal) {
            closeModal(confirmModal);
        }
    });
}

// Open Add/Edit User modal
function openUserModal(userId = null) {
    const modal = document.getElementById('userModal');
    if (!modal) {
        console.error('User modal not found!');
        return;
    }
    
    const modalTitle = modal.querySelector('#userModalTitle');
    const form = modal.querySelector('form');
    
    if (userId) {
        // Edit mode - load user data
        const user = window.users.find(u => u.id === userId);
        if (user) {
            if (modalTitle) modalTitle.textContent = 'Edit User';
            
            // Split name into first and last
            const nameParts = user.name.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            document.getElementById('firstName').value = firstName;
            document.getElementById('lastName').value = lastName;
            document.getElementById('email').value = user.email;
            document.getElementById('role').value = user.role;
            document.getElementById('manager').value = user.manager || '';
            document.getElementById('department').value = user.department || '';
            
            // Set status radio button
            const statusRadio = document.querySelector(`input[name="status"][value="${user.status}"]`);
            if (statusRadio) statusRadio.checked = true;
            
            // Set form action to update
            form.setAttribute('data-action', 'update');
            form.setAttribute('data-user-id', userId);
        }
    } else {
        // Add mode - reset form
        if (modalTitle) modalTitle.textContent = 'Add New User';
        if (form) form.reset();
        form.setAttribute('data-action', 'create');
    }
    
    // Show modal
    openModal(modal);
}

// Open modal
function openModal(modal) {
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Add animation class
        setTimeout(() => {
            modal.querySelector('.modal-content').classList.add('show');
        }, 10);
    }
}

// Close modal
function closeModal(modal) {
    if (modal) {
        modal.querySelector('.modal-content').classList.remove('show');
        
        // Wait for animation to complete
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }
}

// Show confirmation dialog
function confirmAction(options) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const title = modal.querySelector('#confirmTitle');
        const message = modal.querySelector('#confirmMessage');
        const confirmBtn = modal.querySelector('#confirmBtn');
        const cancelBtn = modal.querySelector('#cancelBtn');
        
        // Set modal content
        title.textContent = options.title || 'Confirm Action';
        message.textContent = options.message || 'Are you sure you want to perform this action?';
        confirmBtn.textContent = options.confirmText || 'Confirm';
        confirmBtn.className = `btn btn-${options.confirmType || 'primary'}`;
        
        // Show cancel button if needed
        if (options.showCancel === false) {
            cancelBtn.style.display = 'none';
        } else {
            cancelBtn.style.display = 'inline-block';
            cancelBtn.textContent = options.cancelText || 'Cancel';
        }
        
        // Set up event listeners
        const handleConfirm = () => {
            cleanup();
            resolve(true);
        };
        
        const handleCancel = () => {
            cleanup();
            resolve(false);
        };
        
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
            } else if (e.key === 'Enter') {
                handleConfirm();
            }
        };
        
        const cleanup = () => {
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            document.removeEventListener('keydown', handleKeyDown);
            closeModal(modal);
        };
        
        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
        document.addEventListener('keydown', handleKeyDown);
        
        // Show modal
        openModal(modal);
    });
}

// Confirm delete user
function confirmDeleteUser(userId) {
    const user = window.users.find(u => u.id === userId);
    if (!user) return;
    
    confirmAction({
        title: 'Delete User',
        message: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
        confirmText: 'Delete',
        confirmType: 'danger',
        cancelText: 'Cancel'
    }).then(confirmed => {
        if (confirmed) {
            // In a real application, this would make an API call to delete the user
            console.log(`Deleting user ${userId}...`);
            
            // Simulate API call
            setTimeout(() => {
                // Remove user from the array
                window.users = window.users.filter(u => u.id !== userId);
                
                // Update the table
                renderUsersTable();
                
                // Show success message
                showNotification('User deleted successfully', 'success');
            }, 1000);
        }
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // In a real application, this would show a toast notification
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto-remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
}

// Get icon for notification type
function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    
    return icons[type] || 'info-circle';
}

// Load initial data
async function loadInitialData() {
    console.log('Loading initial data...');
    
    // Use local data (window.users is already initialized in initUserManagement)
    console.log('Loaded users:', window.users?.length || 0);
    
    // Update UI with loaded data
    if (typeof renderUsersTable === 'function' && window.users) {
        renderUsersTable();
    }
    
    showNotification('Admin dashboard loaded successfully', 'success');
}

// Set up event listeners
function setupEventListeners() {
    // Add event listener for form submission
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form field values using the correct IDs from HTML
            const firstName = document.getElementById('firstName')?.value.trim();
            const lastName = document.getElementById('lastName')?.value.trim();
            const email = document.getElementById('email')?.value.trim();
            const role = document.getElementById('role')?.value;
            const manager = document.getElementById('manager')?.value;
            const department = document.getElementById('department')?.value;
            const statusRadio = document.querySelector('input[name="status"]:checked');
            const status = statusRadio ? statusRadio.value : 'active';
            
            // Validate required fields
            if (!firstName || !lastName || !email || !role) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            // Combine first and last name
            const fullName = `${firstName} ${lastName}`;
            
            // Create new user object
            const newUser = {
                id: window.users.length + 1,
                name: fullName,
                email: email,
                role: role,
                manager: manager || null,
                department: department || null,
                status: status,
                lastLogin: new Date().toISOString()
            };
            
            console.log('Adding new user:', newUser);
            
            // Add to users array
            window.users.push(newUser);
            
            // Close modal
            const modal = document.getElementById('userModal');
            closeModal(modal);
            
            // Show success message
            showNotification('User added successfully', 'success');
            
            // Update the table
            renderUsersTable();
            
            // Reset form
            this.reset();
        });
    }
    
    // Initialize tabs
    function initTabs() {
        const tabContainers = document.querySelectorAll('.settings-container');
        
        tabContainers.forEach(container => {
            const tabs = container.querySelectorAll('.settings-tabs .tab');
            const tabContents = container.querySelectorAll('.settings-content .tab-content');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Remove active class from all tabs and contents in this container
                    tabs.forEach(t => t.classList.remove('active'));
                    tabContents.forEach(content => content.classList.remove('active'));
                    
                    // Add active class to clicked tab and corresponding content
                    this.classList.add('active');
                    const tabId = this.getAttribute('data-tab');
                    const targetContent = container.querySelector(`#${tabId}Tab`);
                    
                    if (targetContent) {
                        targetContent.classList.add('active');
                    } else {
                        console.error(`Could not find tab content with ID: ${tabId}Tab`);
                    }
                });
                
                // Initialize first tab as active if none is active
                if (!container.querySelector('.settings-tabs .tab.active') && tabs.length > 0) {
                    tabs[0].classList.add('active');
                    const firstTabId = tabs[0].getAttribute('data-tab');
                    const firstContent = container.querySelector(`#${firstTabId}Tab`);
                    if (firstContent) firstContent.classList.add('active');
                }
            });
        });
    }
    
    // Initialize tabs when the DOM is fully loaded
    function initAfterLoad() {
        // Make sure all required elements are present
        if (document.querySelector('.settings-tabs') && document.querySelector('.settings-content')) {
            initTabs();
        } else {
            // If elements aren't loaded yet, wait a bit and try again
            setTimeout(initAfterLoad, 100);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAfterLoad);
    } else {
        initAfterLoad();
    }
    
    // Also re-initialize tabs when switching to the settings section
    const settingsLink = document.querySelector('a[href="#settings"]');
    if (settingsLink) {
        settingsLink.addEventListener('click', () => {
            setTimeout(initTabs, 100); // Small delay to ensure the section is visible
        });
    }
    
    // Add event listener for mobile menu toggle
    const mobileMenuToggle = document.createElement('button');
    mobileMenuToggle.className = 'mobile-menu-toggle';
    mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    mobileMenuToggle.addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('active');
    });
    
    document.body.appendChild(mobileMenuToggle);
}

// Re-analyze expenses using backend AI
async function reanalyzeExpenses() {
    console.log('Re-analyzing expenses...');
    showNotification('Analyzing expenses...', 'info');
    
    // Sample expense data (replace with actual data)
    const analysis = {
        total_expenses: 3470,
        average_per_user: 99.14,
        by_category: {
            'Travel': 1250,
            'Meals': 450,
            'Office Supplies': 320,
            'Accommodation': 890,
            'Transportation': 560
        },
        insights: [
            'Top spending category: Travel ($1,250)',
            'Total expenses: $3,470.00',
            'Average per user: $99.14',
            'Consider setting spending limits for Travel expenses'
        ]
    };
    
    // Display insights in the AI chat
    const insightsMessage = `
        <strong>Expense Analysis Results:</strong><br><br>
        <strong>Total Expenses:</strong> $${analysis.total_expenses.toFixed(2)}<br>
        <strong>Average per User:</strong> $${analysis.average_per_user.toFixed(2)}<br><br>
        <strong>By Category:</strong><br>
        ${Object.entries(analysis.by_category).map(([cat, amt]) => 
            `• ${cat}: $${amt.toFixed(2)}`
        ).join('<br>')}<br><br>
        <strong>Key Insights:</strong><br>
        ${analysis.insights.map(insight => `• ${insight}`).join('<br>')}
    `;
    
    addChatMessage('ai', insightsMessage);
    showNotification('Analysis complete!', 'success');
}

// View expense insights
async function viewExpenseInsights() {
    console.log('Viewing expense insights...');
    showNotification('Loading insights...', 'info');
    
    // Sample expense data
    const analysis = {
        total_expenses: 3470,
        average_per_user: 99.14,
        by_category: {
            'Travel': 1250,
            'Meals': 450,
            'Office Supplies': 320,
            'Accommodation': 890,
            'Transportation': 560
        }
    };
    
    // Create a detailed insights view
    const insightsHTML = `
        <div class="insights-panel" style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <h3 style="margin-top: 0;">Expense Insights Dashboard</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 15px 0;">
                <div style="padding: 15px; background: white; border-radius: 8px; text-align: center;">
                    <i class="fas fa-dollar-sign" style="font-size: 24px; color: #4CAF50;"></i>
                    <h4 style="margin: 10px 0 5px;">Total Expenses</h4>
                    <p style="font-size: 20px; font-weight: bold; color: #333;">$${analysis.total_expenses.toFixed(2)}</p>
                </div>
                <div style="padding: 15px; background: white; border-radius: 8px; text-align: center;">
                    <i class="fas fa-user" style="font-size: 24px; color: #2196F3;"></i>
                    <h4 style="margin: 10px 0 5px;">Avg per User</h4>
                    <p style="font-size: 20px; font-weight: bold; color: #333;">$${analysis.average_per_user.toFixed(2)}</p>
                </div>
                <div style="padding: 15px; background: white; border-radius: 8px; text-align: center;">
                    <i class="fas fa-chart-pie" style="font-size: 24px; color: #FF9800;"></i>
                    <h4 style="margin: 10px 0 5px;">Categories</h4>
                    <p style="font-size: 20px; font-weight: bold; color: #333;">${Object.keys(analysis.by_category).length}</p>
                </div>
            </div>
            <div style="background: white; padding: 15px; border-radius: 8px;">
                <h4 style="margin-top: 0;">Category Breakdown</h4>
                ${Object.entries(analysis.by_category).map(([cat, amt]) => `
                    <div style="display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #eee;">
                        <span>${cat}</span>
                        <span style="font-weight: bold;">$${amt.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    addChatMessage('ai', insightsHTML);
    showNotification('Insights loaded successfully', 'success');
}

