// End-to-end API test suite for Task Management application
const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE BACKEND API TESTS ---');
  let testsPassed = 0;
  let testsFailed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      testsPassed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      testsFailed++;
    }
  }

  const testEmail1 = `alice_${Date.now()}@example.com`;
  const testEmail2 = `bob_${Date.now()}@example.com`;
  let token1 = '';
  let token2 = '';
  let user1Id = '';
  let user2Id = '';
  let taskId = '';

  try {
    // 1. Health check
    console.log('\n[1] Testing Health Endpoint...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'ok', 'GET /api/health returned 200 and status ok');

    // 2. Registration - Invalid data
    console.log('\n[2] Testing Registration Validation...');
    const invalidRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', email: 'invalid-email', password: '123' })
    });
    const invalidRegData = await invalidRegRes.json();
    assert(invalidRegRes.status === 400 && invalidRegData.success === false, 'POST /api/auth/register rejects missing/short fields with 400');

    // 3. Registration - Password mismatch
    const mismatchRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice Test', email: testEmail1, password: 'Password123!', confirmPassword: 'Password999!' })
    });
    const mismatchRegData = await mismatchRegRes.json();
    assert(mismatchRegRes.status === 400 && mismatchRegData.message === 'Passwords do not match.', 'POST /api/auth/register rejects password mismatch');

    // 4. Registration - Success (User 1)
    console.log('\n[3] Testing Valid Registration for User 1...');
    const regRes1 = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice Johnson', email: testEmail1, password: 'Password123!', confirmPassword: 'Password123!' })
    });
    const regData1 = await regRes1.json();
    assert(regRes1.status === 201 && regData1.token && regData1.user.name === 'Alice Johnson', 'POST /api/auth/register successfully creates User 1');
    token1 = regData1.token;
    user1Id = regData1.user.id;

    // 5. Registration - Duplicate email check
    const dupRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice Clone', email: testEmail1, password: 'Password123!' })
    });
    const dupRegData = await dupRegRes.json();
    assert(dupRegRes.status === 400 && dupRegData.message.includes('already exists'), 'POST /api/auth/register prevents duplicate email registrations');

    // 6. Registration - User 2 (for multi-tenant isolation testing)
    const regRes2 = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bob Smith', email: testEmail2, password: 'Password456!', confirmPassword: 'Password456!' })
    });
    const regData2 = await regRes2.json();
    token2 = regData2.token;
    user2Id = regData2.user.id;
    assert(regRes2.status === 201 && token2, 'POST /api/auth/register successfully creates User 2');

    // 7. Login - Bad password
    console.log('\n[4] Testing Login Endpoint...');
    const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail1, password: 'wrongPassword!' })
    });
    assert(badLoginRes.status === 401, 'POST /api/auth/login rejects wrong password with 401');

    // 8. Login - Success
    const goodLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail1, password: 'Password123!' })
    });
    const goodLoginData = await goodLoginRes.json();
    assert(goodLoginRes.status === 200 && goodLoginData.token, 'POST /api/auth/login returns 200 and JWT token on success');

    // 9. Auth Middleware - Access without token
    console.log('\n[5] Testing Auth Middleware Protection...');
    const noTokenRes = await fetch(`${BASE_URL}/tasks`);
    assert(noTokenRes.status === 401, 'GET /api/tasks without token returns 401 Unauthorized');

    // 10. Auth - GET /api/auth/me
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const meData = await meRes.json();
    assert(meRes.status === 200 && meData.user.email === testEmail1, 'GET /api/auth/me returns current authenticated user profile');

    // 11. Task Creation - User 1 creates Task 1
    console.log('\n[6] Testing Task Creation...');
    const createTaskRes1 = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`
      },
      body: JSON.stringify({
        title: 'Complete Project Architecture',
        description: 'Design database schema and REST APIs',
        status: 'In Progress',
        priority: 'High',
        dueDate: '2026-10-15'
      })
    });
    const createTaskData1 = await createTaskRes1.json();
    assert(createTaskRes1.status === 201 && createTaskData1.task.title === 'Complete Project Architecture', 'POST /api/tasks creates task with status In Progress and High priority');
    taskId = createTaskData1.task._id;

    // 12. Task Creation - User 1 creates Task 2
    const createTaskRes2 = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`
      },
      body: JSON.stringify({
        title: 'Review Code Style and Linters',
        description: 'Ensure clean architecture and reusable components',
        status: 'Pending',
        priority: 'Low'
      })
    });
    assert(createTaskRes2.status === 201, 'POST /api/tasks creates a second task');

    // 13. Task Listing - User 1 sees 2 tasks
    console.log('\n[7] Testing Task Listing & Filtering...');
    const user1TasksRes = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const user1TasksData = await user1TasksRes.json();
    assert(user1TasksRes.status === 200 && user1TasksData.tasks.length === 2, 'GET /api/tasks returns exactly 2 tasks for User 1');

    // 14. User Isolation - User 2 sees 0 tasks
    const user2TasksRes = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    const user2TasksData = await user2TasksRes.json();
    assert(user2TasksRes.status === 200 && user2TasksData.tasks.length === 0, 'USER ISOLATION: User 2 has 0 tasks');

    // 15. User Isolation - User 2 attempts to get User 1's task by ID (should be 403 Forbidden)
    const user2GetTaskRes = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    assert(user2GetTaskRes.status === 403, 'USER ISOLATION: User 2 cannot GET User 1 task (returned 403 Forbidden)');

    // 16. User Isolation - User 2 attempts to update User 1's task (should be 403 Forbidden)
    const user2UpdateTaskRes = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token2}`
      },
      body: JSON.stringify({ title: 'Hacked Title' })
    });
    assert(user2UpdateTaskRes.status === 403, 'USER ISOLATION: User 2 cannot UPDATE User 1 task (returned 403 Forbidden)');

    // 17. User Isolation - User 2 attempts to delete User 1's task (should be 403 Forbidden)
    const user2DeleteTaskRes = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token2}` }
    });
    assert(user2DeleteTaskRes.status === 403, 'USER ISOLATION: User 2 cannot DELETE User 1 task (returned 403 Forbidden)');

    // 18. Filtering & Search for User 1
    const filterStatusRes = await fetch(`${BASE_URL}/tasks?status=In%20Progress`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const filterStatusData = await filterStatusRes.json();
    assert(filterStatusData.tasks.length === 1 && filterStatusData.tasks[0].status === 'In Progress', 'Filtering by status=In Progress returns correct 1 task');

    const searchRes = await fetch(`${BASE_URL}/tasks?search=Architecture`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const searchData = await searchRes.json();
    assert(searchData.tasks.length === 1 && searchData.tasks[0].title.includes('Architecture'), 'Search by title=Architecture returns correct 1 task');

    // 19. Task Update - User 1 updates own task
    console.log('\n[8] Testing Task Update & Status/Priority Change...');
    const updateRes = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`
      },
      body: JSON.stringify({
        status: 'Completed',
        priority: 'High',
        description: 'Successfully tested and verified.'
      })
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200 && updateData.task.status === 'Completed' && updateData.task.description.includes('Successfully'), 'PUT /api/tasks/:id updates status to Completed');

    // 20. Task Deletion - User 1 deletes own task
    console.log('\n[9] Testing Task Deletion...');
    const deleteRes = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token1}` }
    });
    const deleteData = await deleteRes.json();
    assert(deleteRes.status === 200 && deleteData.success === true, 'DELETE /api/tasks/:id deletes task successfully');

    // Verify task count is now 1
    const afterDeleteRes = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const afterDeleteData = await afterDeleteRes.json();
    assert(afterDeleteData.tasks.length === 1, 'GET /api/tasks confirms 1 remaining task after deletion');

    // 21. Logout endpoint & cookie expiration test
    console.log('\n[10] Testing Logout & Cookie Expiration...');
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` }
    });
    const logoutData = await logoutRes.json();
    assert(logoutRes.status === 200 && logoutData.success === true, 'POST /api/auth/logout returns 200 success');
    const setCookieHeader = logoutRes.headers.get('set-cookie');
    assert(
      setCookieHeader && (setCookieHeader.includes('Expires=') || setCookieHeader.includes('Max-Age=0')),
      'POST /api/auth/logout expires the token cookie'
    );

    console.log('\n----------------------------------------');
    console.log(`RESULTS: ${testsPassed} passed, ${testsFailed} failed.`);
    console.log('----------------------------------------');
    if (testsFailed === 0) {
      console.log('🎉 ALL BACKEND API AND SECURITY TESTS PASSED PERFECTLY!');
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
