"""
QA Test Script for CollabSphere Application
Tests all roles and functions with detailed logging
Format: Input, Output, Expected, Actual Result
"""

import requests
import json
from datetime import datetime
from typing import Dict, List, Optional

BASE_URL = "http://localhost:8000/api/v1"

# Test accounts
TEST_ACCOUNTS = {
    "admin": {
        "email": "admin@collabsphere.com",
        "password": "admin123",
        "role": "ADMIN"
    },
    "staff": {
        "email": "staff@collabsphere.com",
        "password": "staff123",
        "role": "STAFF"
    },
    "head_dept": {
        "email": "head_dept@collabsphere.com",
        "password": "head123",
        "role": "HEAD_DEPT"
    },
    "lecturer": {
        "email": "lecturer@collabsphere.com",
        "password": "lecturer123",
        "role": "LECTURER"
    },
    "student1": {
        "email": "student1@collabsphere.com",
        "password": "student123",
        "role": "STUDENT"
    },
    "student2": {
        "email": "student2@collabsphere.com",
        "password": "student123",
        "role": "STUDENT"
    }
}

class QATester:
    def __init__(self):
        self.results = []
        self.tokens = {}
        
    def log_test(self, test_name: str, role: str, input_data: Dict, 
                 expected: str, actual_result: Dict, status: str):
        """Log test result"""
        result = {
            "test_name": test_name,
            "role": role,
            "timestamp": datetime.now().isoformat(),
            "input": input_data,
            "expected": expected,
            "actual_output": actual_result,
            "status": status,  # PASS, FAIL, ERROR
            "bug": None
        }
        self.results.append(result)
        
        # Print to console
        status_icon = "[PASS]" if status == "PASS" else "[FAIL]" if status == "FAIL" else "[ERROR]"
        print(f"\n{status_icon} {test_name} - {role}")
        print(f"   Input: {json.dumps(input_data, indent=2)}")
        print(f"   Expected: {expected}")
        print(f"   Actual: {json.dumps(actual_result, indent=2)}")
        if status != "PASS":
            print(f"   [BUG DETECTED!]")
        
    def login(self, account_key: str) -> Optional[str]:
        """Login and return token"""
        account = TEST_ACCOUNTS[account_key]
        try:
            # OAuth2PasswordRequestForm requires form-data, not JSON
            response = requests.post(
                f"{BASE_URL}/auth/login",
                data={
                    "username": account["email"],  # OAuth2 uses 'username' field but expects email
                    "password": account["password"]
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                token = data.get("access_token")
                self.tokens[account_key] = token
                
                self.log_test(
                    f"Login - {account['role']}",
                    account["role"],
                    {"email": account["email"], "password": "***"},
                    "Status 200, return access_token",
                    {"status_code": response.status_code, "has_token": bool(token)},
                    "PASS" if token else "FAIL"
                )
                return token
            else:
                self.log_test(
                    f"Login - {account['role']}",
                    account["role"],
                    {"email": account["email"], "password": "***"},
                    "Status 200",
                    {"status_code": response.status_code, "error": response.text},
                    "FAIL"
                )
                return None
        except Exception as e:
            self.log_test(
                f"Login - {account['role']}",
                account["role"],
                {"email": account["email"]},
                "Status 200",
                {"error": str(e)},
                "ERROR"
            )
            return None
    
    def get_headers(self, account_key: str) -> Dict:
        """Get headers with auth token"""
        token = self.tokens.get(account_key)
        if not token:
            token = self.login(account_key)
        return {"Authorization": f"Bearer {token}"} if token else {}
    
    def test_topics_crud(self):
        """Test Topics CRUD for different roles"""
        print("\n" + "="*60)
        print("TESTING TOPICS CRUD")
        print("="*60)
        
        # 1. Lecturer creates topic
        lecturer_token = self.login("lecturer")
        if lecturer_token:
            topic_data = {
                "title": "Test Topic QA",
                "description": "Test description for QA",
                "max_teams": 5,
                "max_members_per_team": 6,
                "status": "DRAFT"
            }
            try:
                response = requests.post(
                    f"{BASE_URL}/topics",
                    json=topic_data,
                    headers=self.get_headers("lecturer")
                )
                
                expected = "Status 201, topic created"
                actual = {
                    "status_code": response.status_code,
                    "response": response.json() if response.status_code < 500 else response.text
                }
                
                if response.status_code == 201:
                    topic_id = response.json().get("topic_id")
                    self.log_test(
                        "Create Topic - Lecturer",
                        "LECTURER",
                        topic_data,
                        expected,
                        actual,
                        "PASS"
                    )
                    
                    # Test GET topic
                    response = requests.get(
                        f"{BASE_URL}/topics/{topic_id}",
                        headers=self.get_headers("lecturer")
                    )
                    self.log_test(
                        "Get Topic Detail - Lecturer",
                        "LECTURER",
                        {"topic_id": topic_id},
                        "Status 200, return topic data",
                        {"status_code": response.status_code},
                        "PASS" if response.status_code == 200 else "FAIL"
                    )
                    
                    # Test Student can see APPROVED topics only
                    student_token = self.login("student1")
                    if student_token:
                        response = requests.get(
                            f"{BASE_URL}/topics",
                            headers=self.get_headers("student1")
                        )
                        topics = response.json() if response.status_code == 200 else []
                        draft_topics = [t for t in topics if t.get("status") == "DRAFT"]
                        
                        self.log_test(
                            "Get Topics List - Student (should not see DRAFT)",
                            "STUDENT",
                            {},
                            "Status 200, no DRAFT topics",
                            {"status_code": response.status_code, "draft_count": len(draft_topics)},
                            "PASS" if len(draft_topics) == 0 else "FAIL"
                        )
                    
                    # Test Lecturer submits topic (DRAFT -> PENDING)
                    response = requests.patch(
                        f"{BASE_URL}/topics/{topic_id}/status",
                        json={"status": "PENDING"},
                        headers=self.get_headers("lecturer")
                    )
                    self.log_test(
                        "Submit Topic (DRAFT -> PENDING) - Lecturer",
                        "LECTURER",
                        {"topic_id": topic_id, "status": "PENDING"},
                        "Status 200, status changed to PENDING",
                        {"status_code": response.status_code},
                        "PASS" if response.status_code == 200 else "FAIL"
                    )
                    
                    # Test Head of Dept approves topic
                    head_token = self.login("head_dept")
                    if head_token:
                        response = requests.patch(
                            f"{BASE_URL}/topics/{topic_id}/status",
                            json={"status": "APPROVED"},
                            headers=self.get_headers("head_dept")
                        )
                        self.log_test(
                            "Approve Topic (PENDING -> APPROVED) - Head of Dept",
                            "HEAD_DEPT",
                            {"topic_id": topic_id, "status": "APPROVED"},
                            "Status 200, status changed to APPROVED",
                            {"status_code": response.status_code},
                            "PASS" if response.status_code == 200 else "FAIL"
                        )
                    
                    # Test Student can now see APPROVED topic
                    if student_token:
                        response = requests.get(
                            f"{BASE_URL}/topics",
                            headers=self.get_headers("student1")
                        )
                        topics = response.json() if response.status_code == 200 else []
                        approved_topics = [t for t in topics if t.get("status") == "APPROVED" and t.get("topic_id") == topic_id]
                        
                        self.log_test(
                            "Get Topics List - Student (should see APPROVED)",
                            "STUDENT",
                            {},
                            "Status 200, can see APPROVED topic",
                            {"status_code": response.status_code, "found_topic": len(approved_topics) > 0},
                            "PASS" if len(approved_topics) > 0 else "FAIL"
                        )
                    
                    # Test Student cannot create topic
                    response = requests.post(
                        f"{BASE_URL}/topics",
                        json=topic_data,
                        headers=self.get_headers("student1")
                    )
                    self.log_test(
                        "Create Topic - Student (should fail)",
                        "STUDENT",
                        topic_data,
                        "Status 403, forbidden",
                        {"status_code": response.status_code},
                        "PASS" if response.status_code == 403 else "FAIL"
                    )
                    
                else:
                    self.log_test(
                        "Create Topic - Lecturer",
                        "LECTURER",
                        topic_data,
                        expected,
                        actual,
                        "FAIL"
                    )
            except Exception as e:
                self.log_test(
                    "Create Topic - Lecturer",
                    "LECTURER",
                    topic_data,
                    expected,
                    {"error": str(e)},
                    "ERROR"
                )
    
    def test_teams_crud(self):
        """Test Teams CRUD for different roles"""
        print("\n" + "="*60)
        print("TESTING TEAMS CRUD")
        print("="*60)
        
        # Student creates team
        student_token = self.login("student1")
        if student_token:
            team_data = {
                "name": "QA Test Team",
                "topic_id": 1,  # Assuming topic_id 1 exists
                "class_id": 1   # Assuming class_id 1 exists
            }
            try:
                response = requests.post(
                    f"{BASE_URL}/teams",
                    json=team_data,
                    headers=self.get_headers("student1")
                )
                
                expected = "Status 201, team created, student becomes leader"
                actual = {
                    "status_code": response.status_code,
                    "response": response.json() if response.status_code < 500 else response.text
                }
                
                if response.status_code == 201:
                    team_data_resp = response.json()
                    team_id = team_data_resp.get("team_id")
                    join_code = team_data_resp.get("join_code")
                    
                    self.log_test(
                        "Create Team - Student",
                        "STUDENT",
                        team_data,
                        expected,
                        actual,
                        "PASS"
                    )
                    
                    # Test Student2 joins team
                    student2_token = self.login("student2")
                    if student2_token and join_code:
                        response = requests.post(
                            f"{BASE_URL}/teams/join",
                            json={"join_code": join_code},
                            headers=self.get_headers("student2")
                        )
                        self.log_test(
                            "Join Team by Code - Student",
                            "STUDENT",
                            {"join_code": join_code},
                            "Status 200, student joined team",
                            {"status_code": response.status_code},
                            "PASS" if response.status_code == 200 else "FAIL"
                        )
                    
                    # Test Lecturer finalizes team
                    lecturer_token = self.login("lecturer")
                    if lecturer_token and team_id:
                        response = requests.patch(
                            f"{BASE_URL}/teams/{team_id}/finalize",
                            headers=self.get_headers("lecturer")
                        )
                        self.log_test(
                            "Finalize Team - Lecturer",
                            "LECTURER",
                            {"team_id": team_id},
                            "Status 200, team finalized",
                            {"status_code": response.status_code},
                            "PASS" if response.status_code == 200 else "FAIL"
                        )
                    
                    # Test Lecturer cannot create team
                    response = requests.post(
                        f"{BASE_URL}/teams",
                        json=team_data,
                        headers=self.get_headers("lecturer")
                    )
                    self.log_test(
                        "Create Team - Lecturer (should fail)",
                        "LECTURER",
                        team_data,
                        "Status 403, forbidden",
                        {"status_code": response.status_code},
                        "PASS" if response.status_code == 403 else "FAIL"
                    )
                    
                else:
                    self.log_test(
                        "Create Team - Student",
                        "STUDENT",
                        team_data,
                        expected,
                        actual,
                        "FAIL"
                    )
            except Exception as e:
                self.log_test(
                    "Create Team - Student",
                    "STUDENT",
                    team_data,
                    expected,
                    {"error": str(e)},
                    "ERROR"
                )
    
    def test_tasks_crud(self):
        """Test Tasks CRUD"""
        print("\n" + "="*60)
        print("TESTING TASKS CRUD")
        print("="*60)
        
        # Get team_id first (assuming team exists)
        student_token = self.login("student1")
        if student_token:
            try:
                # Get teams
                response = requests.get(
                    f"{BASE_URL}/teams",
                    headers=self.get_headers("student1")
                )
                teams = response.json() if response.status_code == 200 else []
                team_id = teams[0].get("team_id") if teams else None
                
                if team_id:
                    # Create task
                    task_data = {
                        "title": "QA Test Task",
                        "description": "Test task description",
                        "team_id": team_id,
                        "status": "TODO"
                    }
                    
                    response = requests.post(
                        f"{BASE_URL}/tasks",
                        json=task_data,
                        headers=self.get_headers("student1")
                    )
                    
                    expected = "Status 201, task created"
                    actual = {
                        "status_code": response.status_code,
                        "response": response.json() if response.status_code < 500 else response.text
                    }
                    
                    if response.status_code == 201:
                        task_id = response.json().get("task_id")
                        self.log_test(
                            "Create Task - Student",
                            "STUDENT",
                            task_data,
                            expected,
                            actual,
                            "PASS"
                        )
                        
                        # Update task status
                        response = requests.put(
                            f"{BASE_URL}/tasks/{task_id}",
                            json={"status": "DOING"},
                            headers=self.get_headers("student1")
                        )
                        self.log_test(
                            "Update Task Status - Student",
                            "STUDENT",
                            {"task_id": task_id, "status": "DOING"},
                            "Status 200, status updated",
                            {"status_code": response.status_code},
                            "PASS" if response.status_code == 200 else "FAIL"
                        )
                    else:
                        self.log_test(
                            "Create Task - Student",
                            "STUDENT",
                            task_data,
                            expected,
                            actual,
                            "FAIL"
                        )
            except Exception as e:
                self.log_test(
                    "Create Task - Student",
                    "STUDENT",
                    {},
                    "Status 201",
                    {"error": str(e)},
                    "ERROR"
                )
    
    def test_admin_functions(self):
        """Test Admin-specific functions"""
        print("\n" + "="*60)
        print("TESTING ADMIN FUNCTIONS")
        print("="*60)
        
        admin_token = self.login("admin")
        if admin_token:
            # Test register new user (Admin only)
            register_data = {
                "email": "newuser@test.com",
                "password": "test123",
                "full_name": "Test User",
                "role_id": 5,  # Student
                "dept_id": 1
            }
            try:
                response = requests.post(
                    f"{BASE_URL}/auth/register",
                    json=register_data,
                    headers=self.get_headers("admin")
                )
                
                expected = "Status 201, user created"
                actual = {
                    "status_code": response.status_code,
                    "response": response.json() if response.status_code < 500 else response.text
                }
                
                self.log_test(
                    "Register User - Admin",
                    "ADMIN",
                    register_data,
                    expected,
                    actual,
                    "PASS" if response.status_code == 201 else "FAIL"
                )
                
                # Test non-admin cannot register
                lecturer_token = self.login("lecturer")
                if lecturer_token:
                    response = requests.post(
                        f"{BASE_URL}/auth/register",
                        json=register_data,
                        headers=self.get_headers("lecturer")
                    )
                    self.log_test(
                        "Register User - Lecturer (should fail)",
                        "LECTURER",
                        register_data,
                        "Status 403, forbidden",
                        {"status_code": response.status_code},
                        "PASS" if response.status_code == 403 else "FAIL"
                    )
            except Exception as e:
                self.log_test(
                    "Register User - Admin",
                    "ADMIN",
                    register_data,
                    expected,
                    {"error": str(e)},
                    "ERROR"
                )
    
    def test_profile(self):
        """Test Profile functions"""
        print("\n" + "="*60)
        print("TESTING PROFILE FUNCTIONS")
        print("="*60)
        
        for account_key in ["admin", "lecturer", "student1"]:
            token = self.login(account_key)
            if token:
                try:
                    # Get profile
                    response = requests.get(
                        f"{BASE_URL}/profile",
                        headers=self.get_headers(account_key)
                    )
                    
                    expected = "Status 200, return user profile"
                    actual = {
                        "status_code": response.status_code,
                        "has_data": bool(response.json() if response.status_code == 200 else None)
                    }
                    
                    self.log_test(
                        f"Get Profile - {TEST_ACCOUNTS[account_key]['role']}",
                        TEST_ACCOUNTS[account_key]["role"],
                        {},
                        expected,
                        actual,
                        "PASS" if response.status_code == 200 else "FAIL"
                    )
                except Exception as e:
                    self.log_test(
                        f"Get Profile - {TEST_ACCOUNTS[account_key]['role']}",
                        TEST_ACCOUNTS[account_key]["role"],
                        {},
                        expected,
                        {"error": str(e)},
                        "ERROR"
                    )
    
    def run_all_tests(self):
        """Run all test suites"""
        print("\n" + "="*60)
        print("QA TESTING STARTED")
        print(f"Time: {datetime.now().isoformat()}")
        print("="*60)
        
        # Check if backend is running
        try:
            response = requests.get(f"{BASE_URL.replace('/api/v1', '')}/test", timeout=5)
            if response.status_code != 200:
                print("[WARNING] Backend may not be running properly")
        except:
            print("Backend is not accessible. Please start the backend server first.")
            print("   Run: cd backend && python -m uvicorn app.main:app --reload --port 8000")
            return
        
        # Run test suites
        self.test_profile()
        self.test_topics_crud()
        self.test_teams_crud()
        self.test_tasks_crud()
        self.test_admin_functions()
        
        # Generate report
        self.generate_report()
    
    def generate_report(self):
        """Generate test report"""
        print("\n" + "="*60)
        print("TEST REPORT SUMMARY")
        print("="*60)
        
        total = len(self.results)
        passed = len([r for r in self.results if r["status"] == "PASS"])
        failed = len([r for r in self.results if r["status"] == "FAIL"])
        errors = len([r for r in self.results if r["status"] == "ERROR"])
        
        print(f"\nTotal Tests: {total}")
        print(f"[PASS] Passed: {passed}")
        print(f"[FAIL] Failed: {failed}")
        print(f"[ERROR] Errors: {errors}")
        print(f"Success Rate: {(passed/total*100):.1f}%" if total > 0 else "0%")
        
        # Save detailed report to file
        report_file = f"qa_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump({
                "summary": {
                    "total": total,
                    "passed": passed,
                    "failed": failed,
                    "errors": errors,
                    "success_rate": f"{(passed/total*100):.1f}%" if total > 0 else "0%"
                },
                "tests": self.results
            }, f, indent=2, ensure_ascii=False)
        
        print(f"\n[REPORT] Detailed report saved to: {report_file}")
        
        # List bugs
        bugs = [r for r in self.results if r["status"] != "PASS"]
        if bugs:
            print("\n" + "="*60)
            print("BUGS FOUND:")
            print("="*60)
            for bug in bugs:
                print(f"\n[BUG] {bug['test_name']} - {bug['role']}")
                print(f"   Expected: {bug['expected']}")
                print(f"   Actual: {json.dumps(bug['actual_output'], indent=2)}")

if __name__ == "__main__":
    tester = QATester()
    tester.run_all_tests()
