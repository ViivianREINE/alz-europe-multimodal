"""
Submissions + Analytics API Routers
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from collections import defaultdict

from backend.db.database import get_db
from backend.db.models import User, Submission, MasteryRecord, Role
from backend.auth.models import get_current_user, require_teacher

# ── Submissions Router ────────────────────────────────────────────────────────
submissions_router = APIRouter(prefix="/submissions", tags=["submissions"])


@submissions_router.get("/")
async def list_submissions(
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role in (Role.teacher, Role.admin):
        result = await db.execute(
            select(Submission, User.full_name)
            .join(User, Submission.user_id == User.id)
            .order_by(Submission.created_at.desc())
            .limit(limit).offset(offset)
        )
        rows = result.all()
        return [
            {
                "id": row[0].id,
                "question": row[0].question[:80] + "..." if len(row[0].question) > 80 else row[0].question,
                "score": row[0].score,
                "status": row[0].status,
                "subject": row[0].subject,
                "topic": row[0].topic,
                "created_at": str(row[0].created_at),
                "user_name": row[1] or "Student",
                "student_name": row[1] or "Student",
            }
            for row in rows
        ]

    result = await db.execute(
        select(Submission)
        .where(Submission.user_id == current_user.id)
        .order_by(Submission.created_at.desc())
        .limit(limit).offset(offset)
    )
    subs = result.scalars().all()
    return [
        {
            "id": s.id,
            "question": s.question[:80] + "..." if len(s.question) > 80 else s.question,
            "score": s.score,
            "status": s.status,
            "subject": s.subject,
            "topic": s.topic,
            "created_at": str(s.created_at),
        }
        for s in subs
    ]


@submissions_router.get("/{submission_id}")
async def get_submission(
    submission_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(Submission).where(
            Submission.id == submission_id,
            Submission.user_id == current_user.id,
        )
    )
    sub = res.scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=404, detail="Not found")
    return {
        "id": sub.id, "question": sub.question, "student_answer": sub.student_answer,
        "score": sub.score, "max_score": sub.max_score, "feedback": sub.feedback,
        "reasoning_trace": sub.reasoning_trace, "modality_weights": sub.modality_weights,
        "contradiction_detected": sub.contradiction_detected,
        "confidence": sub.confidence, "subject": sub.subject,
        "topic": sub.topic, "status": sub.status, "created_at": str(sub.created_at),
    }


# ── Analytics Router ──────────────────────────────────────────────────────────
analytics_router = APIRouter(prefix="/analytics", tags=["analytics"])


@analytics_router.get("/student")
async def student_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(Submission).where(
            Submission.user_id == current_user.id,
            Submission.status == "done",
        ).order_by(Submission.created_at.asc())
    )
    subs = res.scalars().all()

    if not subs:
        return {"total": 0, "average_score": 0, "by_subject": {}, "recent": []}

    scores = [s.score for s in subs if s.score is not None]
    by_subject = defaultdict(list)
    for s in subs:
        if s.subject and s.score is not None:
            by_subject[s.subject].append(s.score)

    recent = [
        {"date": str(s.created_at)[:10], "score": s.score, "subject": s.subject}
        for s in subs[-20:]
    ]

    return {
        "total": len(subs),
        "average_score": round(sum(scores) / len(scores), 1) if scores else 0,
        "best_score": round(max(scores), 1) if scores else 0,
        "by_subject": {
            subj: round(sum(sc) / len(sc), 1)
            for subj, sc in by_subject.items()
        },
        "recent": recent,
        "score_trend": [{"idx": i + 1, "score": s} for i, s in enumerate(scores[-30:])],
    }


@analytics_router.get("/teacher")
async def teacher_analytics(
    current_user: User = Depends(require_teacher),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(Submission).where(Submission.status == "done")
    )
    subs = res.scalars().all()
    scores = [s.score for s in subs if s.score is not None]

    by_subject = defaultdict(list)
    for s in subs:
        if s.subject and s.score is not None:
            by_subject[s.subject].append(s.score)

    return {
        "total_submissions": len(subs),
        "class_average": round(sum(scores) / len(scores), 1) if scores else 0,
        "by_subject": {
            subj: {
                "count": len(sc),
                "average": round(sum(sc) / len(sc), 1),
            }
            for subj, sc in by_subject.items()
        },
        "score_distribution": _score_distribution(scores),
    }


def _score_distribution(scores):
    buckets = {"0-50": 0, "50-70": 0, "70-85": 0, "85-100": 0}
    for s in scores:
        if s < 50:
            buckets["0-50"] += 1
        elif s < 70:
            buckets["50-70"] += 1
        elif s < 85:
            buckets["70-85"] += 1
        else:
            buckets["85-100"] += 1
    return buckets
