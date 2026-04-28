# app.py

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import database to ensure initialization
from database.base import Database

# Import all routers from the apis package
from apis import (
    users_router,
    parents_router,
    conversations_router,
    classes_router,
    students_router,
    teachers_router,
    student_enrollments_router,
    teacher_assignments_router,
    resources_router,
    assessments_router,
    grades_router,
    attendance_router,
    schedules_router,
    user_transactions_router,
    student_fees_router,
    payments_router,
    notifications_router,
    posts_router,
    messages_router
)

app = FastAPI(
    title="School Management System API",
    description="Integrated API for the School Management System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = Database()

# Include all application routers
app.include_router(users_router)
app.include_router(parents_router)
app.include_router(conversations_router)
app.include_router(classes_router)
app.include_router(students_router)
app.include_router(teachers_router)
app.include_router(student_enrollments_router)
app.include_router(teacher_assignments_router)
app.include_router(resources_router)
app.include_router(assessments_router)
app.include_router(grades_router)
app.include_router(attendance_router)
app.include_router(schedules_router)
app.include_router(user_transactions_router)
app.include_router(student_fees_router)
app.include_router(payments_router)
app.include_router(notifications_router)
app.include_router(messages_router)
app.include_router(posts_router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Welcome to the School Management System API. All systems are running efficiently!"
    }

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)