import asyncio
import logging
from backend.db.database import init_db, AsyncSessionLocal
from backend.db.models import User, Role
from backend.auth.models import hash_password
from sqlalchemy import select

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def seed():
    # 1. Initialize tables
    logger.info("Initializing database...")
    await init_db()
    
    async with AsyncSessionLocal() as session:
        # 2. Check if users already exist
        result = await session.execute(select(User))
        if result.scalars().first():
            logger.info("Database already contains users. Skipping seed.")
            return

        # 3. Create default users
        users = [
            User(
                email="teacher@rimn.ai",
                full_name="Dr. Somesh Nandi",
                hashed_password=hash_password("rimnpassword123"),
                role=Role.teacher
            ),
            User(
                email="student@rimn.ai",
                full_name="Arjun Sharma",
                hashed_password=hash_password("rimnpassword123"),
                role=Role.student
            ),
            User(
                email="admin@rimn.ai",
                full_name="RIMN Administrator",
                hashed_password=hash_password("adminpassword123"),
                role=Role.admin
            )
        ]
        
        session.add_all(users)
        await session.commit()
        logger.info("Successfully seeded database with default users.")

if __name__ == "__main__":
    asyncio.run(seed())
