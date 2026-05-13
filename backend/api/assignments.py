from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime

from backend.db.database import get_db
from backend.db.models import User, Assignment, Notification, Role
from backend.auth.models import get_current_user, require_teacher

assignments_router = APIRouter(prefix="/assignments", tags=["assignments"])

@assignments_router.post("/")
async def create_assignment(
    payload: dict,
    current_user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db)
):
    title = payload.get("title")
    description = payload.get("description")
    subject = payload.get("subject")
    due_date_str = payload.get("due_date")
    
    due_date = None
    if due_date_str:
        try:
            due_date = datetime.fromisoformat(due_date_str.replace("Z", "+00:00"))
        except:
            due_date = None

    new_assignment = Assignment(
        teacher_id=current_user.id,
        title=title,
        description=description,
        subject=subject,
        due_date=due_date
    )
    
    db.add(new_assignment)
    await db.commit()
    await db.refresh(new_assignment)

    # Notify all students
    students_res = await db.execute(select(User).where(User.role == Role.student))
    students = students_res.scalars().all()
    
    for student in students:
        notif = Notification(
            user_id=student.id,
            title="New Assignment Deployed",
            message=f"'{title}' has been assigned for {subject}. Check your dashboard.",
            type="assignment",
            link="/student/dashboard"
        )
        db.add(notif)
    
    await db.commit()
    return new_assignment

@assignments_router.get("/")
async def list_assignments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Assignment)
        .where(Assignment.is_active == True)
        .order_by(Assignment.created_at.desc())
    )
    assignments = res.scalars().all()
    return assignments
