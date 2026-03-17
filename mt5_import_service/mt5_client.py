import os
import sys
import logging
import json
from datetime import datetime, timedelta
from typing import Optional
from dataclasses import dataclass
from pathlib import Path

import MetaTrader5 as mt5
import requests
from cryptography.fernet import Fernet
from dotenv import load_dotenv

project_root = Path(__file__).parent.parent
load_dotenv(project_root / ".env")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class MT5Credentials:
    login: int
    server: str
    password: str


@dataclass
class TradeData:
    ticket: int
    symbol: str
    volume: float
    trade_type: str
    price: float
    profit: float
    commission: float
    swap: float
    open_time: datetime
    close_time: Optional[datetime]
    magic: Optional[int]
    comment: Optional[str]


class MT5Client:
    def __init__(self, credentials: MT5Credentials, timeout: int = 30000):
        self.credentials = credentials
        self.timeout = timeout
        self.connected = False

    def connect(self) -> bool:
        try:
            if not mt5.initialize(
                login=self.credentials.login,
                password=self.credentials.password,
                server=self.credentials.server,
                timeout=self.timeout
            ):
                error = mt5.last_error()
                logger.error(f"MT5 initialize failed: {error}")
                return False
            
            self.connected = True
            logger.info(f"Connected to MT5: {self.credentials.server}")
            return True
            
        except Exception as e:
            logger.error(f"MT5 connection error: {e}")
            return False

    def disconnect(self) -> bool:
        try:
            if self.connected:
                mt5.shutdown()
                self.connected = False
                logger.info("Disconnected from MT5")
            return True
        except Exception as e:
            logger.error(f"MT5 disconnect error: {e}")
            return False

    def get_account_info(self) -> Optional[dict]:
        if not self.connected:
            return None
        
        account = mt5.account_info()
        if account is None:
            return None
        
        return {
            'login': account.login,
            'server': account.server,
            'currency': account.currency,
            'balance': account.balance,
            'equity': account.equity,
            'margin': account.margin,
            'free_margin': account.margin_free,
            'leverage': account.leverage,
            'name': account.name,
            'company': account.company,
        }

    def get_open_positions(self) -> list[TradeData]:
        if not self.connected:
            return []
        
        positions = mt5.positions_get()
        if positions is None or len(positions) == 0:
            return []
        
        trades = []
        for pos in positions:
            trades.append(TradeData(
                ticket=pos.ticket,
                symbol=pos.symbol,
                volume=pos.volume,
                trade_type='POSITION_TYPE_BUY' if pos.type == 0 else 'POSITION_TYPE_SELL',
                price=pos.price_open,
                profit=pos.profit,
                commission=pos.commission,
                swap=pos.swap,
                open_time=pos.time,
                close_time=None,
                magic=pos.magic,
                comment=pos.comment,
            ))
        
        return trades

    def get_closed_deals(self, from_date: datetime, to_date: datetime) -> list[TradeData]:
        if not self.connected:
            return []
        
        deals = mt5.history_deals_get(from_date, to_date)
        if deals is None or len(deals) == 0:
            return []
        
        trades = []
        for deal in deals:
            if deal.entry == mt5.DEAL_ENTRY_IN:
                continue
                
            trades.append(TradeData(
                ticket=deal.ticket,
                symbol=deal.symbol,
                volume=deal.volume,
                trade_type='DEAL_TYPE_BUY' if deal.type == mt5.DEAL_TYPE_BUY else 'DEAL_TYPE_SELL',
                price=deal.price,
                profit=deal.profit,
                commission=deal.commission,
                swap=deal.swap,
                open_time=datetime.fromtimestamp(deal.time),
                close_time=datetime.fromtimestamp(deal.time),
                magic=deal.magic,
                comment=deal.comment,
            ))
        
        return trades

    def test_connection(self) -> tuple[bool, Optional[str]]:
        if self.connect():
            account_info = self.get_account_info()
            self.disconnect()
            if account_info:
                return True, None
            return False, "Could not get account info"
        else:
            error = mt5.last_error()
            return False, str(error) if error else "Unknown error"


class CryptoHelper:
    @staticmethod
    def get_encryption_key() -> bytes:
        key = os.getenv('TOKEN_CRYPTO_KEY', '')
        if not key:
            raise ValueError("TOKEN_CRYPTO_KEY environment variable is not set")
        
        if len(key) == 44 and key.endswith('='):
            return base64.b64decode(key)
        
        import hashlib
        return hashlib.sha256(key.encode()).digest()
    
    @staticmethod
    def decrypt(ciphertext: str, iv: str, tag: str) -> Optional[str]:
        try:
            from cryptography.hazmat.primitives.ciphers.aead import AESGCM
            import base64
            
            key = CryptoHelper.get_encryption_key()
            nonce = base64.b64decode(iv)
            ciphertext_bytes = base64.b64decode(ciphertext)
            tag_bytes = base64.b64decode(tag)
            
            aesgcm = AESGCM(key)
            plaintext = aesgcm.decrypt(nonce, ciphertext_bytes + tag_bytes, None)
            return plaintext.decode('utf-8')
        except Exception as e:
            logger.error(f"Decryption error: {e}")
            return None


class APIClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        })

    def import_trades(self, account_login: int, account_server: str, 
                     positions: list[dict], deals: list[dict]) -> dict:
        payload = {
            'account_login': account_login,
            'account_server': account_server,
            'positions': positions,
            'deals': deals,
        }
        
        response = self.session.post(
            f'{self.base_url}/api/mt5/store',
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            return response.json()
        
        logger.error(f"Import trades failed: {response.status_code} - {response.text}")
        return {'success': False, 'error': response.text}

    def get_accounts(self) -> list[dict]:
        response = self.session.get(f'{self.base_url}/api/mt5/store')
        
        if response.status_code == 200:
            data = response.json()
            return data.get('data', [])
        
        logger.error(f"Get accounts failed: {response.status_code}")
        return []

    def update_account_status(self, account_id: str, status: str, 
                            last_sync_error: Optional[str] = None) -> bool:
        payload = {'status': status}
        
        response = self.session.patch(
            f'{self.base_url}/api/mt5/accounts?id={account_id}',
            json=payload,
            timeout=30
        )
        
        return response.status_code == 200


def transform_position_to_dict(position: TradeData) -> dict:
    return {
        'ticket': position.ticket,
        'symbol': position.symbol,
        'volume': position.volume,
        'type': position.trade_type,
        'price': position.price,
        'profit': position.profit,
        'commission': position.commission,
        'swap': position.swap,
        'open_time': position.open_time.isoformat() if isinstance(position.open_time, datetime) else str(position.open_time),
        'close_time': position.close_time.isoformat() if position.close_time and isinstance(position.close_time, datetime) else None,
        'magic': position.magic,
        'comment': position.comment,
    }


def transform_deal_to_dict(deal: TradeData) -> dict:
    return {
        'ticket': deal.ticket,
        'position_id': deal.ticket,
        'symbol': deal.symbol,
        'volume': deal.volume,
        'price': deal.price,
        'profit': deal.profit,
        'commission': deal.commission,
        'fee': 0,
        'swap': deal.swap,
        'type': deal.trade_type,
        'entry': 'DEAL_ENTRY_OUT',
        'time': deal.close_time.isoformat() if isinstance(deal.close_time, datetime) else str(deal.close_time),
        'magic': deal.magic,
        'comment': deal.comment,
    }


if __name__ == '__main__':
    import base64
    
    logger.info("MT5 Client Test")
    
    server = os.getenv('MT5_TEST_SERVER', 'MetaQuotes-Demo')
    login = int(os.getenv('MT5_TEST_LOGIN', '0'))
    password = os.getenv('MT5_TEST_PASSWORD', '')
    api_url = os.getenv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')
    api_token = os.getenv('MT5_API_TOKEN', '')
    
    if not password or not api_token:
        logger.error("MT5_TEST_PASSWORD and MT5_API_TOKEN must be set")
        sys.exit(1)
    
    credentials = MT5Credentials(login=login, server=server, password=password)
    client = MT5Client(credentials)
    
    success, error = client.test_connection()
    
    if success:
        logger.info("Connection successful!")
        account_info = client.get_account_info()
        logger.info(f"Account: {account_info}")
    else:
        logger.error(f"Connection failed: {error}")
    
    client.disconnect()
