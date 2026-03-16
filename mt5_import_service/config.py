import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

DATABASE_URL = os.getenv('DATABASE_URL', '')

NEXT_PUBLIC_APP_URL = os.getenv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')

TOKEN_CRYPTO_KEY = os.getenv('TOKEN_CRYPTO_KEY', '')

MT5_API_TOKEN = os.getenv('MT5_API_TOKEN', '')

MT5_TEST_SERVER = os.getenv('MT5_TEST_SERVER', 'MetaQuotes-Demo')
MT5_TEST_LOGIN = os.getenv('MT5_TEST_LOGIN', '')
MT5_TEST_PASSWORD = os.getenv('MT5_TEST_PASSWORD', '')

WORKER_ID = os.getenv('WORKER_ID', 'worker-1')
SYNC_INTERVAL_ACTIVE = int(os.getenv('SYNC_INTERVAL_ACTIVE', '300'))
SYNC_INTERVAL_NORMAL = int(os.getenv('SYNC_INTERVAL_NORMAL', '1800'))
SYNC_INTERVAL_INACTIVE = int(os.getenv('SYNC_INTERVAL_INACTIVE', '14400'))
MT5_TERMINALS_PER_WORKER = int(os.getenv('MT5_TERMINALS_PER_WORKER', '5'))
IMPORT_WORKERS = int(os.getenv('IMPORT_WORKERS', '2'))

if not TOKEN_CRYPTO_KEY:
    raise ValueError("TOKEN_CRYPTO_KEY environment variable is required")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")
