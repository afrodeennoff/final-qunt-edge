"""
MT5 Import Service - Unified Entry Point

This module provides a unified entry point that runs both the worker and scheduler
in a single asyncio event loop with shared Prisma client connection.

Usage:
    python -m mt5_import_service.main

Or with Docker:
    docker run mt5-worker
"""

import asyncio
import signal
import logging
from typing import Optional

from prisma import Prisma

from worker import Worker
from scheduler import Scheduler

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class MT5Service:
    """Unified MT5 import service that runs both worker and scheduler"""
    
    def __init__(self):
        self.db: Optional[Prisma] = None
        self.worker: Optional[Worker] = None
        self.scheduler: Optional[Scheduler] = None
        self.shutdown_event = asyncio.Event()
        self.worker_task: Optional[asyncio.Task] = None
        self.scheduler_task: Optional[asyncio.Task] = None
        self.worker_running = True
        self.scheduler_running = True
    
    def setup_signal_handlers(self):
        """Setup graceful shutdown handlers"""
        loop = asyncio.get_running_loop()
        for sig in (signal.SIGINT, signal.SIGTERM):
            loop.add_signal_handler(sig, self._signal_handler)
    
    def _signal_handler(self):
        """Handle shutdown signals"""
        logger.info("Received shutdown signal")
        self.shutdown_event.set()
        self.worker_running = False
        self.scheduler_running = False
    
    async def start(self):
        """Start the service"""
        # Initialize shared Prisma client
        self.db = Prisma()
        await self.db.connect()
        logger.info("Connected to database")
        
        # Initialize worker and scheduler with shared DB
        self.worker = Worker(db=self.db)
        self.worker.running = self.worker_running
        
        self.scheduler = Scheduler(db=self.db)
        self.scheduler.running = self.scheduler_running
        self.scheduler.worker = self.worker
        
        # Start worker and scheduler as concurrent tasks
        self.worker_task = asyncio.create_task(self.worker.start())
        self.scheduler_task = asyncio.create_task(self.scheduler.start())
        
        logger.info("Worker and scheduler started")
        
        # Wait for shutdown signal
        await self.shutdown_event.wait()
        
        # Graceful shutdown
        await self._shutdown()
    
    async def _shutdown(self):
        """Gracefully shutdown with 30-second timeout"""
        logger.info("Initiating graceful shutdown...")
        
        # Signal tasks to stop
        if self.worker:
            self.worker.running = False
        if self.scheduler:
            self.scheduler.running = False
        
        # Wait for tasks with timeout
        tasks = []
        if self.worker_task and not self.worker_task.done():
            tasks.append(self.worker_task)
        if self.scheduler_task and not self.scheduler_task.done():
            tasks.append(self.scheduler_task)
        
        if tasks:
            try:
                await asyncio.wait_for(
                    asyncio.gather(*tasks, return_exceptions=True),
                    timeout=30.0
                )
                logger.info("All tasks stopped gracefully")
            except asyncio.TimeoutError:
                logger.warning("Shutdown timed out after 30s, cancelling tasks...")
                # Cancel tasks
                for task in tasks:
                    if not task.done():
                        task.cancel()
        
        # Disconnect database
        if self.db:
            await self.db.disconnect()
        
        logger.info("MT5 Service stopped")


async def main():
    """Main entry point"""
    service = MT5Service()
    service.setup_signal_handlers()
    
    try:
        await service.start()
    except Exception as e:
        logger.error(f"Service error: {e}", exc_info=True)
        raise


if __name__ == '__main__':
    asyncio.run(main())
