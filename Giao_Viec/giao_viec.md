# 🎯 GIAO_VIEC - Phase 1 (MVP Foundation)

**Ngày bắt đầu:** Jan 28, 2026  
**Deadline:** Jan 31, 2026 (EOD)  
**Mục tiêu:** 19 API endpoints + 2 FE dashboards ready to test

---

## 👥 Phân công theo từng thành viên

### 🔴 BE1 (Backend Lead - Reviewer)
**Mục tiêu:** Verify all endpoints work, code review, unblock team

**Công việc:**
- [ ] Review tất cả code từ BE2/BE3/BE4
- [ ] Run `docker-compose up` và test init-db endpoint
- [ ] Check database connection (Supabase)
- [ ] Verify all 19 endpoints exist (list in QUICK_REFERENCE.md)
- [ ] Check for 422/500 errors, fix bugs
- [ ] Ensure schemas match endpoints

**Success criteria:**
- All 19 endpoints return 200-201 status
- Database tables created successfully
- Team can login and get JWT token

**Tài liệu tham khảo:**
- TESTING_GUIDE.md (3 test flows)
- QUICK_REFERENCE.md (19 endpoints)

---

### 🟡 BE2 (Topics Module)
**Mục tiêu:** Implement Topics endpoints (create, list, approve, evaluate)

**Công việc:**
- [ ] Copy code from CODE/backend/topics/ vào `app/api/v1/endpoints/topic.py`
- [ ] Implement schema từ SCHEMAS/topic.py
- [ ] Create service layer: `app/services/topic_service.py`
- [ ] Register routes in `app/api/v1/api.py`
- [ ] Test endpoints:
  - `POST /api/v1/topics` (create)
  - `GET /api/v1/topics` (list)
  - `POST /api/v1/topics/{id}/approve` (lecturer only)
  - `POST /api/v1/topics/{id}/evaluate` (evaluation)

**Success criteria:**
- All 4 endpoints return proper responses
- Validation works (required fields, role checks)
- No 422 errors

**Tài liệu tham khảo:**
- CODE/backend/topics/ (starter code)
- IMPLEMENTATION_GUIDE.md (step-by-step)
- TESTING_GUIDE.md (Flow 1 - Topics test)

---

### 🟠 BE3 (Teams Module)
**Mục tiêu:** Implement Teams endpoints (create, join, list members)

**Công việc:**
- [ ] Copy code từ CODE/backend/teams/ vào `app/api/v1/endpoints/team.py`
- [ ] Implement schema từ SCHEMAS/team.py
- [ ] Create service layer: `app/services/team_service.py`
- [ ] Register routes in `app/api/v1/api.py`
- [ ] Test endpoints:
  - `POST /api/v1/teams` (create)
  - `GET /api/v1/teams` (list)
  - `POST /api/v1/teams/join` (join by code)
  - `GET /api/v1/teams/{id}/members` (list members)

**Success criteria:**
- All 4 endpoints working
- Join code generation working
- Role validation in place

**Tài liệu tham khảo:**
- CODE/backend/teams/ (starter code)
- IMPLEMENTATION_GUIDE.md
- TESTING_GUIDE.md (Flow 2 - Teams test)

---

### 🟠 BE4 (Tasks/Sprints Module)
**Mục tiêu:** Implement Tasks/Sprints endpoints (create, assign, update status)

**Công việc:**
- [ ] Copy code từ CODE/backend/tasks/ vào `app/api/v1/endpoints/task.py`
- [ ] Implement schema từ SCHEMAS/task.py
- [ ] Create service layer: `app/services/task_service.py`
- [ ] Register routes in `app/api/v1/api.py`
- [ ] Test endpoints:
  - `POST /api/v1/sprints` (create)
  - `POST /api/v1/tasks` (create)
  - `PATCH /api/v1/tasks/{id}` (update status)
  - `GET /api/v1/tasks?sprint_id={id}` (list by sprint)

**Success criteria:**
- All 4 endpoints working
- Task status update working
- Sprint-task relationship correct

**Tài liệu tham khảo:**
- CODE/backend/tasks/ (starter code)
- IMPLEMENTATION_GUIDE.md
- TESTING_GUIDE.md (Flow 3 - Tasks test)

---

### 🟢 FE1 (Frontend Lead - Lecturer Dashboard)
**Mục tiêu:** Build lecturer dashboard to manage topics

**Công việc:**
- [ ] Copy `Giao_Viec_2/CODE/fe/lecturerTopicsService.js` vào `frontend/src/services/`
- [ ] Create `frontend/src/pages/LecturerDashboard.jsx`
- [ ] Create component: Topics table (list all topics)
- [ ] Create component: Topic detail view
- [ ] Create component: Approve/Reject buttons
- [ ] Add evaluation form component
- [ ] Link to menu/routing

**Success criteria:**
- Can see list of topics (real data from API)
- Can approve/reject topics
- Can add evaluation criteria
- No CORS/API errors

**UI Checklist:**
- [ ] Table with columns: Title, Group, Status, Actions
- [ ] Approve button (admin/lecturer only)
- [ ] Reject button with reason modal
- [ ] Evaluate button opens form
- [ ] Responsive design (Ant Design)

**Tài liệu tham khảo:**
- Giao_Viec_2/CODE/fe/lecturerTopicsService.js
- QUICK_REFERENCE.md (lecturer endpoints)
- Frontend Ant Design docs

---

### 🔵 FE2 (Frontend - Student Dashboard)
**Mục tiêu:** Build student dashboard to join teams and view projects

**Công việc:**
- [ ] Copy `Giao_Viec_2/CODE/fe/studentTeamsService.js` vào `frontend/src/services/`
- [ ] Create `frontend/src/pages/StudentDashboard.jsx`
- [ ] Create component: Topics list (to select and create team)
- [ ] Create component: Team creation form (with team name, members)
- [ ] Create component: Join team form (input join code)
- [ ] Create component: Team members list

**Success criteria:**
- Can see available topics (real data from API)
- Can create team by selecting topic
- Can join existing team with code
- Can view team members
- No CORS/API errors

**UI Checklist:**
- [ ] Topics list with "Create Team" button
- [ ] Team creation modal (team name, student selection)
- [ ] Join team modal (input code field)
- [ ] Team members table
- [ ] Responsive design (Ant Design)

**Tài liệu tham khảo:**
- Giao_Viec_2/CODE/fe/studentTeamsService.js
- QUICK_REFERENCE.md (student endpoints)

---

## 🧪 Testing Checklist

**Before marking as DONE, run tests:**

### Auth Test
```bash
1. POST /api/v1/auth/register
   - email: test@example.com
   - password: password123
   - role_id: 5 (Student)
   - full_name: Test User
   
2. POST /api/v1/auth/login
   - username: test@example.com
   - password: password123
   
3. GET /api/v1/users/me
   - Header: Authorization: Bearer {token}
```

### Topics Flow (BE2 + FE1)
```bash
1. Lecturer login
2. GET /api/v1/topics (should return list)
3. POST /api/v1/topics/approve (if available)
4. FE1: Can see topics in dashboard
```

### Teams Flow (BE3 + FE2)
```bash
1. Student login
2. GET /api/v1/teams (should return list)
3. POST /api/v1/teams (create new team)
4. POST /api/v1/teams/join (join with code)
5. FE2: Can see teams in dashboard
```

### Tasks Flow (BE4)
```bash
1. POST /api/v1/sprints (create sprint)
2. POST /api/v1/tasks (create task)
3. PATCH /api/v1/tasks/{id} (update status)
4. GET /api/v1/tasks?sprint_id={id} (list by sprint)
```

---

## 📋 Dùng file nào?

| Tên file | Dùng khi nào |
|----------|-----------|
| TASK_ASSIGNMENT.md | Cần xem chi tiết công việc của bạn |
| IMPLEMENTATION_GUIDE.md | Đang code backend endpoint |
| TESTING_GUIDE.md | Muốn test backend endpoint |
| QUICK_REFERENCE.md | Cần xem danh sách 19 endpoints |
| CRISIS_PLAN.md | Cần hiểu deadline + risk |
| CODE/ | Cần code mẫu (copy paste) |
| SCHEMAS/ | Cần xem Pydantic models |

---

## ⏰ Timeline

| Ngày | Milestone | Owner |
|-----|-----------|-------|
| Jan 28 | Setup, data models defined | BE1 |
| Jan 29 | All endpoints (skeleton) implemented | BE1-4 |
| Jan 30 | Endpoints tested + FE services ready | BE1-4, FE1-2 |
| Jan 31 | Dashboards integrated + full test | FE1-2 |
| Feb 1 | Ready for Phase 2 | All |

---

## 🚨 Nếu bị block...

**Vấn đề:** Endpoint returns 422 error  
→ Kiểm tra IMPLEMENTATION_GUIDE.md, section "Schema validation"

**Vấn đề:** FE không kết nối được API  
→ Check `frontend/.env` có `VITE_API_URL=http://localhost:8000/api/v1` không?

**Vấn đề:** Database connection failed  
→ Run `docker-compose restart backend` và check logs: `docker-compose logs backend`

**Vấn đề:** JWT token invalid  
→ Make sure header là `Authorization: Bearer {token}` (uppercase Bearer)

**Không biết code phần nào:**  
→ Xem file trong CODE/ folder (có code mẫu sẵn)

---

## ✅ Khi xong Phase 1

Sau khi tất cả 19 endpoints được test thành công + 2 FE dashboards hoạt động:

1. Chạy `git push` (save code)
2. Mở file `Giao_Viec_2/giao_viec.md`
3. Bắt đầu Phase 2 (DAO layer + FE integration)

---

**Chúc bạn làm việc vui vẻ! 🚀**  
*Có vấn đề? Xem QUICK_REFERENCE.md hoặc gọi BE1.*
