# QA Test Results - CollabSphere Application

**Ngày test:** 26/01/2026  
**Tester:** QA Automation  
**Web URL:** http://localhost:3000  
**API URL:** http://localhost:8000  
**Swagger UI:** http://localhost:8000/docs

---

## 📊 Tổng Quan Kết Quả Test

| Category | Total | Passed | Failed | Success Rate |
|----------|-------|--------|--------|--------------|
| Authentication | 6 | 6 | 0 | 100% |
| Profile | 3 | 0 | 3 | 0% |
| Topics | 1 | 0 | 1 | 0% |
| Teams | 1 | 0 | 1 | 0% |
| Tasks | 0 | 0 | 0 | N/A |
| Admin Functions | 1 | 0 | 1 | 0% |
| **TOTAL** | **12** | **6** | **6** | **50%** |

---

## ✅ TEST 1: Authentication - PASS

### Test 1.1: Login - Admin
- **Input:** 
  ```json
  {
    "username": "admin@collabsphere.com",
    "password": "admin123"
  }
  ```
- **Expected:** Status 200, trả về access_token
- **Actual:** Status 200, có access_token
- **Status:** ✅ **PASS**

### Test 1.2: Login - Staff
- **Input:** 
  ```json
  {
    "username": "staff@collabsphere.com",
    "password": "staff123"
  }
  ```
- **Expected:** Status 200, trả về access_token
- **Actual:** Status 200, có access_token
- **Status:** ✅ **PASS**

### Test 1.3: Login - Head of Dept
- **Input:** 
  ```json
  {
    "username": "head_dept@collabsphere.com",
    "password": "head123"
  }
  ```
- **Expected:** Status 200, trả về access_token
- **Actual:** Status 200, có access_token
- **Status:** ✅ **PASS**

### Test 1.4: Login - Lecturer
- **Input:** 
  ```json
  {
    "username": "lecturer@collabsphere.com",
    "password": "lecturer123"
  }
  ```
- **Expected:** Status 200, trả về access_token
- **Actual:** Status 200, có access_token
- **Status:** ✅ **PASS**

### Test 1.5: Login - Student 1
- **Input:** 
  ```json
  {
    "username": "student1@collabsphere.com",
    "password": "student123"
  }
  ```
- **Expected:** Status 200, trả về access_token
- **Actual:** Status 200, có access_token
- **Status:** ✅ **PASS**

### Test 1.6: Login - Student 2
- **Input:** 
  ```json
  {
    "username": "student2@collabsphere.com",
    "password": "student123"
  }
  ```
- **Expected:** Status 200, trả về access_token
- **Actual:** Status 200, có access_token
- **Status:** ✅ **PASS**

---

## ❌ TEST 2: Profile - FAIL

### Test 2.1: Get Profile - Admin
- **Input:** GET /api/v1/profile
- **Headers:** Authorization: Bearer {token}
- **Expected:** Status 200, trả về user profile
- **Actual:** Status 404, "Not Found"
- **Status:** ❌ **FAIL**
- **Bug:** Endpoint `/api/v1/profile` không tồn tại. Endpoint đúng là `/api/v1/users/me`

### Test 2.2: Get Profile - Lecturer
- **Input:** GET /api/v1/profile
- **Headers:** Authorization: Bearer {token}
- **Expected:** Status 200, trả về user profile
- **Actual:** Status 404, "Not Found"
- **Status:** ❌ **FAIL**
- **Bug:** Endpoint `/api/v1/profile` không tồn tại. Endpoint đúng là `/api/v1/users/me`

### Test 2.3: Get Profile - Student
- **Input:** GET /api/v1/profile
- **Headers:** Authorization: Bearer {token}
- **Expected:** Status 200, trả về user profile
- **Actual:** Status 404, "Not Found"
- **Status:** ❌ **FAIL**
- **Bug:** Endpoint `/api/v1/profile` không tồn tại. Endpoint đúng là `/api/v1/users/me`

---

## ❌ TEST 3: Topics CRUD - FAIL

### Test 3.1: Create Topic - Lecturer
- **Input:** 
  ```json
  POST /api/v1/topics
  {
    "title": "Test Topic QA",
    "description": "Test description for QA",
    "max_teams": 5,
    "max_members_per_team": 6,
    "status": "DRAFT"
  }
  ```
- **Headers:** Authorization: Bearer {lecturer_token}
- **Expected:** Status 201, topic được tạo thành công
- **Actual:** Status 404, "Not Found"
- **Status:** ❌ **FAIL**
- **Bug:** Endpoint `/api/v1/topics` không được đăng ký trong API router. Cần thêm vào `app/api/v1/api.py`:
  ```python
  from app.api.v1.endpoints.topics import router as topics_router
  api_router.include_router(topics_router, prefix="/topics", tags=["topics"])
  ```

---

## ❌ TEST 4: Teams CRUD - FAIL

### Test 4.1: Create Team - Student
- **Input:** 
  ```json
  POST /api/v1/teams
  {
    "name": "QA Test Team",
    "topic_id": 1,
    "class_id": 1
  }
  ```
- **Headers:** Authorization: Bearer {student_token}
- **Expected:** Status 201, team được tạo, student trở thành leader
- **Actual:** Status 404, "Not Found"
- **Status:** ❌ **FAIL**
- **Bug:** Endpoint `/api/v1/teams` không được đăng ký trong API router. Cần thêm vào `app/api/v1/api.py`:
  ```python
  from app.api.v1.endpoints.teams import router as teams_router
  api_router.include_router(teams_router, prefix="/teams", tags=["teams"])
  ```

---

## ❌ TEST 5: Admin Functions - FAIL

### Test 5.1: Register User - Admin
- **Input:** 
  ```json
  POST /api/v1/auth/register
  {
    "email": "newuser@test.com",
    "password": "test123",
    "full_name": "Test User",
    "role_id": 5,
    "dept_id": 1
  }
  ```
- **Headers:** Authorization: Bearer {admin_token}
- **Expected:** Status 201, user được tạo
- **Actual:** Status 422, "String should have at least 8 characters" (password validation)
- **Status:** ❌ **FAIL**
- **Bug:** Password validation yêu cầu tối thiểu 8 ký tự. Test case sử dụng password "test123" (7 ký tự) không hợp lệ. Đây là validation đúng, nhưng test case cần sửa lại.

---

## 🐛 BUGS TỔNG HỢP

### Bug #1: Profile Endpoint Sai
- **Mô tả:** Test script sử dụng `/api/v1/profile` nhưng endpoint thực tế là `/api/v1/users/me`
- **Mức độ:** Medium
- **Giải pháp:** Sửa test script hoặc thêm alias endpoint

### Bug #2: Topics Endpoint Chưa Được Đăng Ký
- **Mô tả:** Endpoint `/api/v1/topics` không hoạt động vì chưa được include vào API router
- **Mức độ:** High
- **Giải pháp:** Thêm vào `app/api/v1/api.py`:
  ```python
  from app.api.v1.endpoints.topics import router as topics_router
  api_router.include_router(topics_router, prefix="/topics", tags=["topics"])
  ```

### Bug #3: Teams Endpoint Chưa Được Đăng Ký
- **Mô tả:** Endpoint `/api/v1/teams` không hoạt động vì chưa được include vào API router
- **Mức độ:** High
- **Giải pháp:** Thêm vào `app/api/v1/api.py`:
  ```python
  from app.api.v1.endpoints.teams import router as teams_router
  api_router.include_router(teams_router, prefix="/teams", tags=["teams"])
  ```

### Bug #4: Tasks Endpoint Chưa Được Đăng Ký
- **Mô tả:** Endpoint `/api/v1/tasks` có thể không hoạt động vì chưa được include vào API router
- **Mức độ:** High
- **Giải pháp:** Thêm vào `app/api/v1/api.py`:
  ```python
  from app.api.v1.endpoints.tasks import router as tasks_router
  api_router.include_router(tasks_router, prefix="/tasks", tags=["tasks"])
  ```

### Bug #5: Password Validation
- **Mô tả:** Password validation yêu cầu tối thiểu 8 ký tự
- **Mức độ:** Low (Đây là feature, không phải bug)
- **Giải pháp:** Cập nhật test cases để sử dụng password đủ 8 ký tự

---

## 📝 KHUYẾN NGHỊ

1. **Ưu tiên cao:** Đăng ký các endpoints (topics, teams, tasks) vào API router
2. **Ưu tiên trung bình:** Thống nhất endpoint profile (`/api/v1/users/me` hoặc `/api/v1/profile`)
3. **Ưu tiên thấp:** Cập nhật test cases để phù hợp với validation rules

---

## ✅ CHỨC NĂNG HOẠT ĐỘNG TỐT

- ✅ Authentication (Login) cho tất cả roles
- ✅ Backend server chạy ổn định
- ✅ Frontend server chạy ổn định
- ✅ Database connection hoạt động tốt
- ✅ Docker containers chạy đúng

---

## 📌 GHI CHÚ

- Web đã được mở tại: http://localhost:3000
- Swagger UI đã được mở tại: http://localhost:8000/docs
- Test users đã được tạo thành công trong database
- Cần sửa API router để các endpoints hoạt động đầy đủ
