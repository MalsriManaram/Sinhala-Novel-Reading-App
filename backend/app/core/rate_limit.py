"""Simple in-memory sliding-window rate limiter."""
import time
from collections import deque, defaultdict
from threading import Lock

_buckets: dict = defaultdict(deque)
_lock = Lock()


def check_rate(key: str, max_hits: int, window_seconds: int) -> bool:
    """Return True if request allowed, False if rate-limited."""
    now = time.time()
    with _lock:
        q = _buckets[key]
        # purge expired
        while q and now - q[0] > window_seconds:
            q.popleft()
        if len(q) >= max_hits:
            return False
        q.append(now)
        return True
