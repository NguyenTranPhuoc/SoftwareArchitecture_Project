// Integration test script for frontend-backend connectivity
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Test user ID from seed data
const TEST_USER_ID = '674612345678901234567890';
const TEST_CONVERSATION_ID = '674612345678901234abcde1';

interface TestResult {
    name: string;
    passed: boolean;
    error?: string;
    response?: any;
}

const results: TestResult[] = [];

// Helper function to run a test
async function runTest(
    name: string,
    testFn: () => Promise<any>
): Promise<void> {
    try {
        console.log(`\n🧪 Testing: ${name}...`);
        const response = await testFn();
        results.push({ name, passed: true, response });
        console.log(`✅ PASSED: ${name}`);
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        results.push({ name, passed: false, error: errorMsg });
        console.log(`❌ FAILED: ${name}`);
        console.log(`   Error: ${errorMsg}`);
    }
}

// Test 1: Backend health check
async function testHealthCheck() {
    const response = await fetch(`${BASE_URL}/health`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.success) throw new Error('Health check returned success=false');
    return data;
}

// Test 2: API root endpoint
async function testApiRoot() {
    const response = await fetch(`${API_URL}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.success) throw new Error('API root returned success=false');
    return data;
}

// Test 3: Get conversations
async function testGetConversations() {
    const response = await fetch(`${API_URL}/conversations?userId=${TEST_USER_ID}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.success) throw new Error('Get conversations returned success=false');
    return data;
}

// Test 4: Get specific conversation
async function testGetConversation() {
    const response = await fetch(`${API_URL}/conversations/${TEST_CONVERSATION_ID}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.success) throw new Error('Get conversation returned success=false');
    return data;
}

// Test 5: Get messages
async function testGetMessages() {
    const response = await fetch(`${API_URL}/messages/${TEST_CONVERSATION_ID}?limit=10&skip=0`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.success) throw new Error('Get messages returned success=false');
    return data;
}

// Test 6: Create new message
async function testSendMessage() {
    const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            conversationId: TEST_CONVERSATION_ID,
            senderId: TEST_USER_ID,
            content: 'Test message from integration script',
            type: 'text',
        }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(`HTTP ${response.status}: ${error.error || 'Unknown error'}`);
    }
    const data = await response.json();
    if (!data.success) throw new Error('Send message returned success=false');
    return data;
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Frontend-Backend Integration Tests\n');
    console.log('='.repeat(60));

    await runTest('1. Backend Health Check', testHealthCheck);
    await runTest('2. API Root Endpoint', testApiRoot);
    await runTest('3. Get Conversations', testGetConversations);
    await runTest('4. Get Specific Conversation', testGetConversation);
    await runTest('5. Get Messages', testGetMessages);
    await runTest('6. Send New Message', testSendMessage);

    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary\n');

    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;

    console.log(`Total Tests: ${results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);

    if (failed > 0) {
        console.log('\n❌ Failed Tests:');
        results
            .filter((r) => !r.passed)
            .forEach((r) => {
                console.log(`   - ${r.name}: ${r.error}`);
            });
    }

    console.log('\n' + '='.repeat(60));

    if (failed === 0) {
        console.log('✨ All tests passed! Frontend-backend integration is working.\n');
        process.exit(0);
    } else {
        console.log('⚠️  Some tests failed. Please check the errors above.\n');
        process.exit(1);
    }
}

// Run tests
runAllTests().catch((error) => {
    console.error('💥 Test runner crashed:', error);
    process.exit(1);
});
