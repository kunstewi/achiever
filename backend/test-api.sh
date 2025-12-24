#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8000"
TOKEN=""
USER_ID=""
ADMIN_TOKEN=""
ADMIN_ID=""
TASK_ID=""
TEST_EMAIL="testuser$(date +%s)@example.com"
ADMIN_EMAIL="adminuser$(date +%s)@example.com"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Task Management API Testing Suite   ${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Test 1: Register a new user (Member)
echo -e "${YELLOW}[TEST 1] Registering new member user...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"password123\"
  }")

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
  echo -e "${GREEN}✓ User registration successful${NC}"
  TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')
  USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '._id')
  echo "Email: $TEST_EMAIL"
  echo "User ID: $USER_ID"
  echo "Role: $(echo "$REGISTER_RESPONSE" | jq -r '.role')"
else
  echo -e "${RED}✗ User registration failed${NC}"
  echo "$REGISTER_RESPONSE" | jq .
  exit 1
fi
echo ""

# Test 2: Register admin user
echo -e "${YELLOW}[TEST 2] Registering admin user...${NC}"
ADMIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Admin User\",
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"admin123\",
    \"adminInviteToken\": \"secret_admin_token\"
  }")

if echo "$ADMIN_RESPONSE" | grep -q "token"; then
  ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | jq -r '.token')
  ADMIN_ID=$(echo "$ADMIN_RESPONSE" | jq -r '._id')
  ROLE=$(echo "$ADMIN_RESPONSE" | jq -r '.role')
  
  if [ "$ROLE" = "admin" ]; then
    echo -e "${GREEN}✓ Admin registration successful with admin role${NC}"
  else
    echo -e "${YELLOW}⚠ Admin registered but role is: $ROLE (check ADMIN_INVITE_TOKEN in .env)${NC}"
  fi
  echo "Email: $ADMIN_EMAIL"
  echo "Admin ID: $ADMIN_ID"
else
  echo -e "${RED}✗ Admin registration failed${NC}"
  echo "$ADMIN_RESPONSE" | jq .
fi
echo ""

# Test 3: Login
echo -e "${YELLOW}[TEST 3] Testing login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"password123\"
  }")

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
  echo -e "${GREEN}✓ Login successful${NC}"
  echo "Logged in as: $(echo "$LOGIN_RESPONSE" | jq -r '.name')"
else
  echo -e "${RED}✗ Login failed${NC}"
  echo "$LOGIN_RESPONSE" | jq .
fi
echo ""

# Test 4: Get user profile
echo -e "${YELLOW}[TEST 4] Getting user profile...${NC}"
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/profile" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PROFILE_RESPONSE" | grep -q "email"; then
  echo -e "${GREEN}✓ Profile retrieved successfully${NC}"
  echo "Name: $(echo "$PROFILE_RESPONSE" | jq -r '.name')"
  echo "Email: $(echo "$PROFILE_RESPONSE" | jq -r '.email')"
  echo "Role: $(echo "$PROFILE_RESPONSE" | jq -r '.role')"
else
  echo -e "${RED}✗ Profile retrieval failed${NC}"
  echo "$PROFILE_RESPONSE" | jq .
fi
echo ""

# Test 5: Update user profile
echo -e "${YELLOW}[TEST 5] Updating user profile...${NC}"
UPDATE_PROFILE=$(curl -s -X PUT "$BASE_URL/api/auth/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User Updated"
  }')

if echo "$UPDATE_PROFILE" | grep -q "Updated"; then
  echo -e "${GREEN}✓ Profile updated successfully${NC}"
  echo "New name: $(echo "$UPDATE_PROFILE" | jq -r '.name')"
else
  echo -e "${RED}✗ Profile update failed${NC}"
  echo "$UPDATE_PROFILE" | jq .
fi
echo ""

# Test 6: Create a task
echo -e "${YELLOW}[TEST 6] Creating a new task...${NC}"
CREATE_TASK=$(curl -s -X POST "$BASE_URL/api/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task - API Testing",
    "description": "This is a test task created by automated testing",
    "priority": "High",
    "status": "Pending",
    "dueDate": "2025-12-31",
    "todoChecklist": [
      {"text": "First todo item", "completed": false},
      {"text": "Second todo item", "completed": false}
    ]
  }')

if echo "$CREATE_TASK" | grep -q "Test Task"; then
  echo -e "${GREEN}✓ Task created successfully${NC}"
  TASK_ID=$(echo "$CREATE_TASK" | jq -r '._id')
  echo "Task ID: $TASK_ID"
  echo "Title: $(echo "$CREATE_TASK" | jq -r '.title')"
  echo "Priority: $(echo "$CREATE_TASK" | jq -r '.priority')"
else
  echo -e "${RED}✗ Task creation failed${NC}"
  echo "$CREATE_TASK" | jq .
fi
echo ""

# Test 7: Get all tasks
echo -e "${YELLOW}[TEST 7] Getting all tasks...${NC}"
GET_TASKS=$(curl -s -X GET "$BASE_URL/api/tasks" \
  -H "Authorization: Bearer $TOKEN")

if echo "$GET_TASKS" | grep -q "tasks"; then
  echo -e "${GREEN}✓ Tasks retrieved successfully${NC}"
  TASK_COUNT=$(echo "$GET_TASKS" | jq -r '.totalTasks')
  echo "Total tasks: $TASK_COUNT"
  echo "Current page: $(echo "$GET_TASKS" | jq -r '.currentPage')"
else
  echo -e "${RED}✗ Tasks retrieval failed${NC}"
  echo "$GET_TASKS" | jq .
fi
echo ""

# Test 8: Get task by ID
echo -e "${YELLOW}[TEST 8] Getting task by ID...${NC}"
GET_TASK=$(curl -s -X GET "$BASE_URL/api/tasks/$TASK_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$GET_TASK" | grep -q "Test Task"; then
  echo -e "${GREEN}✓ Task retrieved successfully${NC}"
  echo "Status: $(echo "$GET_TASK" | jq -r '.status')"
  echo "Progress: $(echo "$GET_TASK" | jq -r '.progress')%"
else
  echo -e "${RED}✗ Task retrieval failed${NC}"
  echo "$GET_TASK" | jq .
fi
echo ""

# Test 9: Update task
echo -e "${YELLOW}[TEST 9] Updating task...${NC}"
UPDATE_TASK=$(curl -s -X PUT "$BASE_URL/api/tasks/$TASK_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Test Task",
    "status": "In Progress",
    "priority": "Medium"
  }')

if echo "$UPDATE_TASK" | grep -q "Updated Test Task"; then
  echo -e "${GREEN}✓ Task updated successfully${NC}"
  echo "New title: $(echo "$UPDATE_TASK" | jq -r '.title')"
  echo "New status: $(echo "$UPDATE_TASK" | jq -r '.status')"
else
  echo -e "${RED}✗ Task update failed${NC}"
  echo "$UPDATE_TASK" | jq .
fi
echo ""

# Test 10: Update task progress
echo -e "${YELLOW}[TEST 10] Updating task progress...${NC}"
UPDATE_PROGRESS=$(curl -s -X PATCH "$BASE_URL/api/tasks/$TASK_ID/progress" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "progress": 50
  }')

if echo "$UPDATE_PROGRESS" | grep -q "50"; then
  echo -e "${GREEN}✓ Task progress updated successfully${NC}"
  echo "Progress: $(echo "$UPDATE_PROGRESS" | jq -r '.progress')%"
  echo "Auto-updated status: $(echo "$UPDATE_PROGRESS" | jq -r '.status')"
else
  echo -e "${RED}✗ Task progress update failed${NC}"
  echo "$UPDATE_PROGRESS" | jq .
fi
echo ""

# Test 11: Update todo checklist
echo -e "${YELLOW}[TEST 11] Updating todo checklist...${NC}"
UPDATE_TODOS=$(curl -s -X PATCH "$BASE_URL/api/tasks/$TASK_ID/todos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "todoChecklist": [
      {"text": "First todo item", "completed": true},
      {"text": "Second todo item", "completed": false},
      {"text": "Third todo item", "completed": false}
    ]
  }')

if echo "$UPDATE_TODOS" | grep -q "Third todo"; then
  echo -e "${GREEN}✓ Todo checklist updated successfully${NC}"
  echo "Auto-calculated progress: $(echo "$UPDATE_TODOS" | jq -r '.progress')%"
  echo "Todo count: $(echo "$UPDATE_TODOS" | jq '.todoChecklist | length')"
else
  echo -e "${RED}✗ Todo checklist update failed${NC}"
  echo "$UPDATE_TODOS" | jq .
fi
echo ""

# Test 12: Get task report
echo -e "${YELLOW}[TEST 12] Getting task report...${NC}"
GET_REPORT=$(curl -s -X GET "$BASE_URL/api/reports/tasks" \
  -H "Authorization: Bearer $TOKEN")

if echo "$GET_REPORT" | grep -q "totalTasks"; then
  echo -e "${GREEN}✓ Task report retrieved successfully${NC}"
  echo "Total tasks: $(echo "$GET_REPORT" | jq -r '.totalTasks')"
  echo "Completion rate: $(echo "$GET_REPORT" | jq -r '.completionRate')%"
  echo "Average progress: $(echo "$GET_REPORT" | jq -r '.averageProgress')%"
  echo "Status breakdown:"
  echo "  - Pending: $(echo "$GET_REPORT" | jq -r '.statusStats.Pending')"
  echo "  - In Progress: $(echo "$GET_REPORT" | jq -r '.statusStats["In Progress"]')"
  echo "  - Completed: $(echo "$GET_REPORT" | jq -r '.statusStats.Completed')"
else
  echo -e "${RED}✗ Task report retrieval failed${NC}"
  echo "$GET_REPORT" | jq .
fi
echo ""

# Test 13: Get all users (Admin only)
echo -e "${YELLOW}[TEST 13] Getting all users (Admin only)...${NC}"
GET_USERS=$(curl -s -X GET "$BASE_URL/api/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo "$GET_USERS" | grep -q "users"; then
  echo -e "${GREEN}✓ Users retrieved successfully (Admin access)${NC}"
  USER_COUNT=$(echo "$GET_USERS" | jq -r '.totalUsers')
  echo "Total users: $USER_COUNT"
elif echo "$GET_USERS" | grep -q "admin only"; then
  echo -e "${YELLOW}⚠ Admin access denied - check ADMIN_INVITE_TOKEN configuration${NC}"
  echo "The admin user was not created with admin role"
else
  echo -e "${RED}✗ Users retrieval failed${NC}"
  echo "$GET_USERS" | jq .
fi
echo ""

# Test 14: Test filtering tasks
echo -e "${YELLOW}[TEST 14] Testing task filters...${NC}"
FILTER_TASKS=$(curl -s -X GET "$BASE_URL/api/tasks?status=In%20Progress&priority=Medium" \
  -H "Authorization: Bearer $TOKEN")

if echo "$FILTER_TASKS" | grep -q "tasks"; then
  FILTERED_COUNT=$(echo "$FILTER_TASKS" | jq -r '.totalTasks')
  echo -e "${GREEN}✓ Task filtering works${NC}"
  echo "Filtered results: $FILTERED_COUNT task(s)"
else
  echo -e "${RED}✗ Task filtering failed${NC}"
  echo "$FILTER_TASKS" | jq .
fi
echo ""

# Test 15: Test search functionality
echo -e "${YELLOW}[TEST 15] Testing task search...${NC}"
SEARCH_TASKS=$(curl -s -X GET "$BASE_URL/api/tasks?search=Updated" \
  -H "Authorization: Bearer $TOKEN")

if echo "$SEARCH_TASKS" | grep -q "tasks"; then
  SEARCH_COUNT=$(echo "$SEARCH_TASKS" | jq -r '.totalTasks')
  echo -e "${GREEN}✓ Task search works${NC}"
  echo "Search results: $SEARCH_COUNT task(s)"
else
  echo -e "${RED}✗ Task search failed${NC}"
  echo "$SEARCH_TASKS" | jq .
fi
echo ""

# Test 16: Test unauthorized access
echo -e "${YELLOW}[TEST 16] Testing unauthorized access...${NC}"
UNAUTH=$(curl -s -X GET "$BASE_URL/api/tasks")

if echo "$UNAUTH" | grep -q "Not authorized"; then
  echo -e "${GREEN}✓ Authorization middleware working correctly${NC}"
  echo "Unauthorized requests are properly blocked"
else
  echo -e "${RED}✗ Authorization check failed${NC}"
  echo "$UNAUTH" | jq .
fi
echo ""

# Test 17: Test Excel export
echo -e "${YELLOW}[TEST 17] Testing Excel export...${NC}"
EXPORT_FILE="test-export-$(date +%s).xlsx"
curl -s -X GET "$BASE_URL/api/reports/export" \
  -H "Authorization: Bearer $TOKEN" \
  -o "$EXPORT_FILE"

if [ -f "$EXPORT_FILE" ] && [ -s "$EXPORT_FILE" ]; then
  FILE_SIZE=$(ls -lh "$EXPORT_FILE" | awk '{print $5}')
  echo -e "${GREEN}✓ Excel export successful${NC}"
  echo "File: $EXPORT_FILE"
  echo "Size: $FILE_SIZE"
  rm "$EXPORT_FILE"
else
  echo -e "${RED}✗ Excel export failed${NC}"
fi
echo ""

# Test 18: Delete task
echo -e "${YELLOW}[TEST 18] Deleting task...${NC}"
DELETE_TASK=$(curl -s -X DELETE "$BASE_URL/api/tasks/$TASK_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo "$DELETE_TASK" | grep -q "removed"; then
  echo -e "${GREEN}✓ Task deleted successfully${NC}"
else
  echo -e "${RED}✗ Task deletion failed${NC}"
  echo "$DELETE_TASK" | jq .
fi
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}         Testing Complete!              ${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "\n${GREEN}API Endpoint Testing Summary:${NC}"
echo -e "✓ Authentication (register, login, profile)"
echo -e "✓ Task CRUD operations"
echo -e "✓ Task progress tracking"
echo -e "✓ Todo checklist management"
echo -e "✓ Task filtering and search"
echo -e "✓ Reporting and analytics"
echo -e "✓ Excel export"
echo -e "✓ Authorization middleware"
echo -e "\n${YELLOW}Note: Admin features require ADMIN_INVITE_TOKEN to be set correctly in .env${NC}\n"

