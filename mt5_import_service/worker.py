import os
import sys
import logging
import asyncio
import time
import signal
from datetime import datetime, timedelta
from typing import Optional
from dataclasses import dataclass
from pathlib import Path

import MetaTrader5 as mt5
import httpx
from dotenv import load_dotenv
from prisma import Prisma

project_root = Path(__file__).parent.parent
load_dotenv(project_root / ".env")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


MT5_API_URL = os.getenv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')
SYNC_INTERVAL_ACTIVE = int(os.getenv('SYNC_INTERVAL_ACTIVE', '300'))
SYNC_INTERVAL_NORMAL = int(os.getenv('SYNC_INTERVAL_NORMAL', '1800'))
SYNC_INTERVAL_INACTIVE = int(os.getenv('SYNC_INTERVAL_INACTIVE', '14400'))


@dataclass
class MT5AccountData:
    id: str
    user_id: str
    login: int
    server: str
    password_ciphertext: str
    password_iv: str
    password_tag: str
    password_key_version: str
    status: str
    last_sync_at: Optional[datetime]
    next_sync_at: Optional[datetime]
    last_trade_count: int
    is_active: bool
    last_activity_at: Optional[datetime]
    trade_count_24h: int


class MT5Credentials:
    def __init__(self, login: int, server: str, password: str):
        self.login = login
        self.server = server
        self.password = password


class MT5Connection:
    def __init__(self, credentials: MT5Credentials):
        self.credentials = credentials
        self.connected = False

    def connect(self, timeout: int = 30000) -> bool:
        try:
            if not mt5.initialize(
                login=self.credentials.login,
                password=self.credentials.password,
                server=self.credentials.server,
                timeout=timeout
            ):
                error = mt5.last_error()
                logger.error(f"MT5 initialize failed: {error}")
                return False
            
            self.connected = True
            return True
        except Exception as e:
            logger.error(f"MT5 connection error: {e}")
            return False

    def disconnect(self) -> bool:
        try:
            if self.connected:
                mt5.shutdown()
                self.connected = False
            return True
        except Exception as e:
            logger.error(f"Disconnect error: {e}")
            return False

    def get_positions(self) -> list:
        if not self.connected:
            return []
        positions = mt5.positions_get()
        return list(positions) if positions else []

    def get_deals(self, from_date: datetime, to_date: datetime) -> list:
        if not self.connected:
            return []
        deals = mt5.history_deals_get(from_date, to_date)
        return list(deals) if deals else []


class Worker:
    def __init__(self, db: Prisma = None):
        self._db = db
        self.running = True
        self.worker_id = os.getenv('WORKER_ID', 'worker-1')
        
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

    @property
    def db(self):
        return self._db

    def _signal_handler(self, signum, frame):
        logger.info(f"Received signal {signum}, shutting down...")
        self.running = False

    async def start(self):
        if self._db is None:
            self._db = Prisma()
            await self._db.connect()
        logger.info(f"Worker {self.worker_id} started")
        
        while self.running:
            try:
                await self.process_accounts()
            except Exception as e:
                logger.error(f"Worker error: {e}")
            
            await self._sleep(60)

    async def _sleep(self, seconds: int):
        """Non-blocking async sleep with cancellation support"""
        for _ in range(seconds):
            if not self.running:
                break
            await asyncio.sleep(1)

    async def process_accounts(self):
        accounts = await self.db.mt5account.find_many(
            where={
                'status': 'ACTIVE',
            }
        )
        
        for account in accounts:
            if not self.running:
                break
            
            try:
                await self.sync_account(account)
            except Exception as e:
                logger.error(f"Error syncing account {account.id}: {e}")
                await self._update_account_status(
                    account.id, 
                    'ERROR', 
                    str(e)
                )

    async def sync_account(self, account: MT5AccountData):
        logger.info(f"Syncing account {account.login} on {account.server}")
        
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
        import base64
        
        try:
            key = self._get_decryption_key()
            nonce = base64.b64decode(account.password_iv)
            ciphertext = base64.b64decode(account.password_ciphertext)
            tag = base64.b64decode(account.password_tag)
            
            aesgcm = AESGCM(key)
            password = aesgcm.decrypt(nonce, ciphertext + tag, None).decode('utf-8')
            
        except Exception as e:
            logger.error(f"Failed to decrypt password: {e}")
            await self._update_account_status(account.id, 'ERROR', 'Decryption failed')
            return

        credentials = MT5Credentials(
            login=int(account.login),
            server=account.server,
            password=password
        )

        connection = MT5Connection(credentials)
        
        if not connection.connect():
            error = mt5.last_error()
            logger.error(f"Failed to connect to MT5: {error}")
            await self._update_account_status(
                account.id, 
                'ERROR', 
                f"Connection failed: {error}"
            )
            return

        try:
            positions = connection.get_positions()
            last_sync = account.last_sync_at or (datetime.now() - timedelta(days=30))
            deals = connection.get_deals(last_sync, datetime.now())
            
            payload_positions = []
            for pos in positions:
                payload_positions.append({
                    'ticket': pos.ticket,
                    'symbol': pos.symbol,
                    'volume': pos.volume,
                    'type': 'POSITION_TYPE_BUY' if pos.type == 0 else 'POSITION_TYPE_SELL',
                    'price': pos.price_open,
                    'profit': pos.profit,
                    'commission': pos.commission,
                    'swap': pos.swap,
                    'open_time': datetime.fromtimestamp(pos.time).isoformat(),
                    'close_time': None,
                    'magic': pos.magic,
                    'comment': pos.comment,
                })

            payload_deals = []
            for deal in deals:
                if deal.entry == mt5.DEAL_ENTRY_OUT:
                    payload_deals.append({
                        'ticket': deal.ticket,
                        'position_id': deal.position_id,
                        'symbol': deal.symbol,
                        'volume': deal.volume,
                        'price': deal.price,
                        'profit': deal.profit,
                        'commission': deal.commission,
                        'fee': 0,
                        'swap': deal.swap,
                        'type': 'DEAL_TYPE_BUY' if deal.type == mt5.DEAL_TYPE_BUY else 'DEAL_TYPE_SELL',
                        'entry': 'DEAL_ENTRY_OUT',
                        'time': datetime.fromtimestamp(deal.time).isoformat(),
                        'magic': deal.magic,
                        'comment': deal.comment,
                    })

            api_token = await self._get_api_token(account.user_id)
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{MT5_API_URL}/api/mt5/store",
                    json={
                        'account_login': account.login,
                        'account_server': account.server,
                        'positions': payload_positions,
                        'deals': payload_deals,
                    },
                    headers={
                        'Authorization': f'Bearer {api_token}',
                        'Content-Type': 'application/json',
                    },
                    timeout=60.0
                )

            if response.status_code == 200:
                result = response.json()
                trade_count = len(payload_positions) + len(payload_deals)
                
                await self._update_account_sync(
                    account.id,
                    trade_count,
                    'ACTIVE',
                    None
                )
                
                logger.info(f"Imported {result.get('tradesAdded', 0)} trades for {account.login}")
            else:
                logger.error(f"Import failed: {response.status_code} - {response.text}")
                await self._update_account_status(
                    account.id,
                    'ERROR',
                    f"Import failed: {response.status_code}"
                )

        finally:
            connection.disconnect()

    def _get_decryption_key(self) -> bytes:
        key = os.getenv('TOKEN_CRYPTO_KEY', '')
        if not key:
            raise ValueError("TOKEN_CRYPTO_KEY not set")
        
        if len(key) == 44 and key.endswith('='):
            import base64
            return base64.b64decode(key)
        
        import hashlib
        return hashlib.sha256(key.encode()).digest()

    async def _get_api_token(self, user_id: str) -> str:
        user = await self.db.user.find_unique(
            where={'id': user_id},
            select={'mt5_token_hash': True}
        )
        
        if not user:
            raise ValueError(f"User not found: {user_id}")
        
        import hashlib
        import secrets
        token = secrets.token_hex(32)
        token_hash = hashlib.sha256(token.encode()).digest().hex()
        
        await self.db.user.update(
            where={'id': user_id},
            data={
                'mt5_token_hash': token_hash,
            }
        )
        
        return token

    async def _update_account_status(self, account_id: str, status: str, error: Optional[str]):
        await self.db.mt5account.update(
            where={'id': account_id},
            data={
                'status': status,
                'last_sync_error': error,
            }
        )

    async def _update_account_sync(self, account_id: str, trade_count: int, 
                                   status: str, error: Optional[str]):
        account = await self.db.mt5account.find_unique(where={'id': account_id})
        if not account:
            return
            
        now = datetime.now()
        
        if trade_count > 0:
            is_active = True
            last_activity = now
            trade_count_24h = max(0, (account.trade_count_24h or 0) + trade_count)
        else:
            is_active = False
            last_activity = account.last_activity_at
            trade_count_24h = max(0, (account.trade_count_24h or 1) - 1)
        
        next_sync = self._calculate_next_sync(trade_count)
        
        await self.db.mt5account.update(
            where={'id': account_id},
            data={
                'status': status,
                'last_sync_error': error,
                'last_sync_at': now,
                'next_sync_at': next_sync,
                'last_trade_count': trade_count,
                'is_active': is_active,
                'last_activity_at': last_activity,
                'trade_count_24h': trade_count_24h,
            }
        )

    def _calculate_next_sync(self, trade_count: int) -> datetime:
        if trade_count > 10:
            return datetime.now() + timedelta(seconds=SYNC_INTERVAL_ACTIVE)
        elif trade_count > 0:
            return datetime.now() + timedelta(seconds=SYNC_INTERVAL_NORMAL)
        else:
            return datetime.now() + timedelta(seconds=SYNC_INTERVAL_INACTIVE)


async def main():
    worker = Worker()
    await worker.start()


if __name__ == '__main__':
    import asyncio
    asyncio.run(main())
