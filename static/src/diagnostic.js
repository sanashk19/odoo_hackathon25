// Diagnostic Script - Add this to admin.html temporarily to debug
console.log('🔍 DIAGNOSTIC SCRIPT LOADED');
console.log('Current URL:', window.location.href);
console.log('Document ready state:', document.readyState);

// Check if admin.js loaded
setTimeout(() => {
    console.log('\n=== DIAGNOSTIC CHECK ===');
    console.log('1. Checking if admin.js loaded...');
    console.log('   API_BASE_URL exists:', typeof API_BASE_URL !== 'undefined');
    console.log('   window.users exists:', typeof window.users !== 'undefined');
    
    console.log('\n2. Checking functions...');
    const functions = [
        'initUserManagement',
        'initWorkflowBuilder',
        'openUserModal',
        'saveWorkflow',
        'createNewWorkflow',
        'testWorkflow'
    ];
    
    functions.forEach(func => {
        const exists = typeof window[func] === 'function';
        console.log(`   ${func}: ${exists ? '✅' : '❌'}`);
    });
    
    console.log('\n3. Checking buttons...');
    const buttons = [
        { id: 'addUserBtn', name: 'Add User' },
        { id: 'saveWorkflowBtn', name: 'Save Workflow' },
        { id: 'newWorkflowBtn', name: 'New Workflow' },
        { id: 'testWorkflowBtn', name: 'Test Workflow' }
    ];
    
    buttons.forEach(btn => {
        const element = document.getElementById(btn.id);
        console.log(`   ${btn.name} (${btn.id}): ${element ? '✅ Found' : '❌ Not found'}`);
        if (element) {
            console.log(`      - Visible: ${element.offsetParent !== null}`);
            console.log(`      - Disabled: ${element.disabled}`);
        }
    });
    
    console.log('\n4. Checking if DOMContentLoaded fired...');
    console.log('   Document ready state:', document.readyState);
    
    console.log('\n5. Manual button test...');
    const testBtn = document.getElementById('addUserBtn');
    if (testBtn) {
        console.log('   Attempting to click Add User button programmatically...');
        try {
            testBtn.click();
            console.log('   ✅ Click executed');
        } catch (e) {
            console.log('   ❌ Click failed:', e.message);
        }
    }
    
    console.log('\n=== END DIAGNOSTIC ===\n');
}, 2000);

// Listen for any clicks on the page
document.addEventListener('click', function(e) {
    console.log('🖱️ CLICK DETECTED:', {
        target: e.target.tagName,
        id: e.target.id,
        class: e.target.className,
        text: e.target.textContent?.substring(0, 30)
    });
}, true);

console.log('✅ Diagnostic script initialized - click detection active');
