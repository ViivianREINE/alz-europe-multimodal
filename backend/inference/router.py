"""
Inference Router — /inference/grade, /inference/result/{id}
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import uuid, json, logging

from backend.db.database import get_db
from backend.db.models import User, Submission, Notification, Role
from backend.auth.models import get_current_user
from backend.inference.pipeline import run_grading

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/inference", tags=["inference"])


@router.post("/grade")
async def grade_submission(
    question: str = Form(...),
    student_answer: str = Form(...),
    subject: Optional[str] = Form(None),
    topic: Optional[str] = Form(None),
    reference_answer: Optional[str] = Form(None),
    choices: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    image_bytes = None
    if image and image.filename:
        image_bytes = await image.read()
    
    audio_bytes = None
    if audio and audio.filename:
        audio_bytes = await audio.read()

    parsed_choices = None
    if choices:
        try:
            parsed_choices = json.loads(choices)
        except Exception:
            pass

    submission_id = str(uuid.uuid4())
    submission = Submission(
        id=submission_id, user_id=current_user.id,
        question=question, student_answer=student_answer,
        subject=subject, topic=topic,
        reference_answer=reference_answer, status="processing",
    )
    db.add(submission)
    await db.commit()

    try:
        result = await run_grading(
            question=question, student_answer=student_answer,
            image_bytes=image_bytes, audio_bytes=audio_bytes, 
            reference_answer=reference_answer,
            choices=parsed_choices,
        )
        submission.status = "done"
        submission.score = result["score"]
        submission.feedback = result["feedback"]["message"]
        submission.reasoning_trace = result["reasoning_trace"]
        submission.modality_weights = result["modality_weights"]
        submission.contradiction_detected = result["contradiction_detected"]
        submission.confidence = result["confidence"]
        
        # Notify student of successful submission
        success_notif = Notification(
            user_id=current_user.id,
            title="Submission Scored!",
            message=f"Your submission for '{subject or 'Unknown'}' was processed. Score: {result['score']}%",
            type="success",
            link="/student/history"
        )
        db.add(success_notif)

        # Notify all teachers
        teachers_res = await db.execute(select(User).where(User.role.in_([Role.teacher, Role.admin])))
        for teacher in teachers_res.scalars().all():
            db.add(Notification(
                user_id=teacher.id,
                title="New Submission Graded",
                message=f"{current_user.full_name} submitted '{subject or 'Unknown'}' — Score: {result['score']}%",
                type="info",
                link="/teacher/submissions"
            ))

        await db.commit()
        return {"submission_id": submission_id, "status": "done", **result}
    except Exception as e:
        logger.error(f"Inference failed: {e}", exc_info=True)
        submission.status = "failed"
        
        # Notify student of failure
        fail_notif = Notification(
            user_id=current_user.id,
            title="Submission Failed",
            message=f"We encountered an error processing your '{subject or 'Unknown'}' submission. Please try again.",
            type="alert",
            link="/student/submit"
        )
        db.add(fail_notif)

        # Notify all teachers of failure too
        teachers_res = await db.execute(select(User).where(User.role.in_([Role.teacher, Role.admin])))
        for teacher in teachers_res.scalars().all():
            db.add(Notification(
                user_id=teacher.id,
                title="Submission Processing Error",
                message=f"{current_user.full_name}'s submission for '{subject or 'Unknown'}' failed to process.",
                type="alert",
                link="/teacher/submissions"
            ))

        await db.commit()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/result/{submission_id}")
async def get_result(
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
        raise HTTPException(status_code=404, detail="Submission not found")
    return {
        "submission_id": sub.id, "status": sub.status, "score": sub.score,
        "feedback": sub.feedback, "reasoning_trace": sub.reasoning_trace,
        "modality_weights": sub.modality_weights,
        "contradiction_detected": sub.contradiction_detected,
        "confidence": sub.confidence, "created_at": str(sub.created_at),
    }


@router.post("/ask-question")
async def ask_topic_question(
    topic: str = Form(...),
    question: str = Form(...),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
):
    from backend.inference.pipeline import gemini_model
    from PIL import Image
    import io

    if not gemini_model:
        raise HTTPException(status_code=503, detail="AI Service unavailable")

    try:
        content = [
            f"You are the RIMN Study Assistant. The student is asking about: {topic}.\n"
            f"Student Question: {question}\n"
            f"Provide an extremely accurate, detailed educational answer suitable for 11th/12th standard CBSE Science."
        ]
        if image and image.filename:
            img_bytes = await image.read()
            img = Image.open(io.BytesIO(img_bytes))
            content.append(img)
            
        response = gemini_model.generate_content(content)
        return {"response": response.text}
    except Exception as e:
        logger.error(f"Topic Q&A failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
