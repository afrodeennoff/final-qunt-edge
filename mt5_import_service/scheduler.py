import os
import sys
import logging
import asyncio
from datetime import datetime
from pathlib import Path

import schedule
import time

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


class Scheduler:
    def __init__(self):
        self.db = Prisma()
        self.worker = Worker()
        self.running = True

    async def start(self):
        await self.db.connect()
        logger.info("Scheduler started")
        
        schedule.every(5).minutes.do(asyncio.run, self.check_pending_accounts())
        
        while self.running:
            schedule.run_pending()
            time.sleep(1)

    async def check_pending_accounts(self):
        pending_accounts = await self.db.mt5account.find_many(
            where={
                'status': 'PENDING',
            }
        )
        
        logger.info(f"Found {len(pending_accounts)} pending accounts")
        
        for account in pending_accounts:
            try:
                await self.worker.sync_account(account)
            except Exception as e:
                logger.error(f"Error syncing pending account {account.id}: {e}")


if __name__ == '__main__':
    scheduler = Scheduler()
    asyncio.run(scheduler.start())
