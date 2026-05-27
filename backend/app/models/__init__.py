"""Import all models so SQLAlchemy registers them."""
from app.models.user import User
from app.models.novel import Novel
from app.models.chapter import Chapter
from app.models.rating import Rating
from app.models.subscription import Subscription
from app.models.ad_unlock import AdUnlock
from app.models.reminder import Reminder
from app.models.otp import OTP

__all__ = ["User", "Novel", "Chapter", "Rating", "Subscription", "AdUnlock", "Reminder", "OTP"]
