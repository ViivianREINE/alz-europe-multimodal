"""
RIMN Database Models
"""
from sqlalchemy import (
    Column, String, Integer, Float, Boolean,
    DateTime, ForeignKey, Text, JSON, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.db.database import Base
import uuid
import enum


def gen_uuid():
    return str(uuid.uuid4())


class Role(str, enum.Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SAEnum(Role), default=Role.student, nullable=False)
    is_active = Column(Boolean, default=True)
    ai_personality = Column(String, default="Academic")
    ai_depth = Column(Integer, default=50)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    submissions = relationship("Submission", back_populates="user", cascade="all, delete")
    mastery_records = relationship("MasteryRecord", back_populates="user", cascade="all, delete")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete")


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    question = Column(Text, nullable=False)
    student_answer = Column(Text, nullable=False)
    reference_answer = Column(Text, nullable=True)
    subject = Column(String, nullable=True)
    topic = Column(String, nullable=True)

    # File paths (stored on disk, path in DB)
    image_path = Column(String, nullable=True)
    audio_path = Column(String, nullable=True)
    document_path = Column(String, nullable=True)

    # Grading results (populated after inference)
    status = Column(String, default="pending")  # pending | processing | done | failed
    score = Column(Float, nullable=True)
    max_score = Column(Float, default=100.0)
    feedback = Column(Text, nullable=True)

    # RIMN-specific outputs
    reasoning_trace = Column(JSON, nullable=True)      # list of reasoning steps
    modality_weights = Column(JSON, nullable=True)     # {"text": 0.6, "vision": 0.4}
    attention_data = Column(JSON, nullable=True)       # for heatmap rendering
    contradiction_detected = Column(Boolean, default=False)
    contradiction_details = Column(Text, nullable=True)
    confidence = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="submissions")


class MasteryRecord(Base):
    __tablename__ = "mastery_records"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    subject = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    mastery_score = Column(Float, default=0.0)   # 0.0 – 1.0
    attempts = Column(Integer, default=0)
    correct = Column(Integer, default=0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="mastery_records")


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(String, primary_key=True, default=gen_uuid)
    teacher_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    subject = Column(String, nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="info")  # info | assignment | success | alert
    is_read = Column(Boolean, default=False)
    link = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")
