import uvicorn
import logging
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
from jose import JWTError, jwt
from pydantic import BaseModel

from database.base import Database
from database import UsersManager
from apis.dependencies import get_users_manager
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
    messages_router,
    programs_router
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)





# هنا التحقق و هدا كود عشواؤي 
SECRET_KEY = "xK9#mP2$vL5@nQ8&wR3^jT6*hY1!cF4"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

app = FastAPI(
    title="School Management System API",
    description="Integrated API for the School Management System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8080",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Authorization", "Content-Type"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Error on {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return user_id

db = Database()

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/auth/login")
def login(
    credentials: LoginRequest,
    manager: UsersManager = Depends(get_users_manager)
):
    user = manager.authenticate_user(credentials.username, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    user.pop("password", None)
    token = create_access_token(data={"sub": str(user["id"])})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

app.include_router(users_router,                dependencies=[Depends(get_current_user)])
app.include_router(parents_router,              dependencies=[Depends(get_current_user)])
app.include_router(conversations_router,        dependencies=[Depends(get_current_user)])
app.include_router(classes_router,              dependencies=[Depends(get_current_user)])
app.include_router(students_router,             dependencies=[Depends(get_current_user)])
app.include_router(teachers_router,             dependencies=[Depends(get_current_user)])
app.include_router(student_enrollments_router,  dependencies=[Depends(get_current_user)])
app.include_router(teacher_assignments_router,  dependencies=[Depends(get_current_user)])
app.include_router(resources_router,            dependencies=[Depends(get_current_user)])
app.include_router(assessments_router,          dependencies=[Depends(get_current_user)])
app.include_router(grades_router,               dependencies=[Depends(get_current_user)])
app.include_router(attendance_router,           dependencies=[Depends(get_current_user)])
app.include_router(schedules_router,            dependencies=[Depends(get_current_user)])
app.include_router(user_transactions_router,    dependencies=[Depends(get_current_user)])
app.include_router(student_fees_router,         dependencies=[Depends(get_current_user)])
app.include_router(payments_router,             dependencies=[Depends(get_current_user)])
app.include_router(notifications_router,        dependencies=[Depends(get_current_user)])
app.include_router(messages_router,             dependencies=[Depends(get_current_user)])
app.include_router(posts_router,                dependencies=[Depends(get_current_user)])
app.include_router(programs_router,             dependencies=[Depends(get_current_user)])

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Welcome to the School Management System API. All systems are running efficiently!"
    }

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=False
    )
