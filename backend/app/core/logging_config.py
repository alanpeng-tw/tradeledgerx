"""
Project logging standard: timestamp (UTC+8 by default), level, module, message.
Logger name per module (e.g. app.routers.trades). No sensitive data (passwords, tokens) in logs.
Optional log file via LOG_FILE (empty = stdout only).
"""
import logging
import sys
from datetime import datetime, timedelta, timezone
from typing import Optional

from app.core.config import settings

# UTC+8 for log timestamps (override via LOG_TZ, e.g. Asia/Taipei)
try:
    import zoneinfo
    _LOG_TZ = zoneinfo.ZoneInfo(getattr(settings, "LOG_TZ", "Asia/Taipei"))
except Exception:
    _LOG_TZ = timezone(timedelta(hours=8))


class UTCP8Formatter(logging.Formatter):
    """Formatter that uses UTC+8 (or LOG_TZ) for asctime."""

    def formatTime(self, record: logging.LogRecord, datefmt: Optional[str] = None) -> str:
        ct = datetime.fromtimestamp(record.created, tz=_LOG_TZ)
        if datefmt:
            return ct.strftime(datefmt)
        return ct.strftime("%Y-%m-%dT%H:%M:%S")


def setup_logging() -> None:
    """Configure root logger with project format. Call once at app startup."""
    level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    fmt = "%(asctime)s %(levelname)s %(name)s %(message)s"
    datefmt = "%Y-%m-%dT%H:%M:%S"
    handlers: list[logging.Handler] = [logging.StreamHandler(sys.stdout)]
    if getattr(settings, "LOG_FILE", ""):
        try:
            handlers.append(logging.FileHandler(settings.LOG_FILE, encoding="utf-8"))
        except OSError:
            pass  # fallback to stdout only if file cannot be opened
    formatter = UTCP8Formatter(fmt, datefmt=datefmt)
    for h in handlers:
        h.setFormatter(formatter)
    logging.basicConfig(
        level=level,
        handlers=handlers,
        force=True,
    )


def get_logger(name: str) -> logging.Logger:
    """Return a logger for the given module (e.g. app.routers.trades)."""
    return logging.getLogger(name)
