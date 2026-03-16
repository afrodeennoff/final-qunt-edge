import os
import sys
import logging
import asyncio
from datetime import datetime
from pathlib import Path

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from dotenv import load_dotenv
load_dotenv(project_root / ".env")

from prisma import Prisma
from worker import Worker, MT5_API_URL, SYNC_INTERVAL_ACTIVE, SYNC_INTERVAL_NORMAL, SYNC_INTERVAL_INACTIVE

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Scheduler interval in seconds (5 minutes)
SCHEDULER_INTERVAL_SECONDS = 300


class Scheduler:
    def __init__(self, db: Prisma = None):
        self._db = db
        self.worker = None
        self.running = True

    @property
    def db(self):
        return self._db

    async def start(self):
        if self._db is None:
            self._db = Prisma()
            await self._db.connect()
        logger.info("Scheduler started")
        
        while self.running:
            try:
                await self.check_pending_accounts()
            except Exception as e:
                logger.error(f"Scheduler error: {e}", exc_info=True)
            
            # Sleep for 5 minutes (300 seconds)
            # Check for cancellation every second
            for _ in range(SCHEDULER_INTERVAL_SECONDS):
                if not self.running:
                    break
                await asyncio.sleep(1)
        
        logger.info("Scheduler stopped")

    async def check_pending_accounts(self):
        pending_accounts = await self._db.mt5account.find_many(
            where={
                'status': 'PENDING',
            }
        )
        
        logger.info(f"Found {len(pending_accounts)} pending accounts")
        
        for account in pending_accounts:
            if not self.running:
                break
            
            try:
                if self.worker is None:
                    self.worker = Worker(db=self._db)
                await self.worker.sync_account(account)
            except Exception as e:
                logger.error(f"Error syncing pending account {account.id}: {e}")

    def stop(self):
        """Stop the scheduler"""
        self.running = False
        logger.info("Scheduler received stop signal")


if __name__ == '__main__':
    scheduler = Scheduler()
    try:
        asyncio.run(scheduler.start())
    except KeyboardInterrupt:
        logger.info("Scheduler interrupted")
        scheduler.stop()
