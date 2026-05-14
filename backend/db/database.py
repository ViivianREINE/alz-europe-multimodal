"""
RIMN Database Setup — SQLite (dev) via SQLAlchemy 2.0 async
"""
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from backend.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    connect_args={"check_same_thread": False},
)

AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def seed_default_users():
    from sqlalchemy import select
    from backend.db.models import User, Role
    from backend.auth.models import hash_password
    
    async with AsyncSessionLocal() as session:
        # Check student
        result = await session.execute(select(User).where(User.email == "student@rimn.ai"))
        if not result.scalar_one_or_none():
            student = User(
                email="student@rimn.ai",
                full_name="RIMN Student",
                hashed_password=hash_password("rimnpassword123"),
                role=Role.student
            )
            session.add(student)
            
        # Check teacher
        result = await session.execute(select(User).where(User.email == "teacher@rimn.ai"))
        if not result.scalar_one_or_none():
            teacher = User(
                email="teacher@rimn.ai",
                full_name="RIMN Teacher",
                hashed_password=hash_password("rimnpassword123"),
                role=Role.teacher
            )
            session.add(teacher)
            
        await session.commit()

async def init_db():
    """Create all tables on startup."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_default_users()
