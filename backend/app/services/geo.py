"""Geo-IP helper — used to decide RevenueCat vs Ideamart paywall."""
from fastapi import Request


def get_country_code(request: Request, user_country: str | None = None) -> str:
    """Return ISO country code, falling back to user record then 'US'."""
    # Cloud providers usually inject CF-IPCountry or X-AppEngine-Country.
    headers = request.headers
    for h in ("cf-ipcountry", "x-country-code", "x-vercel-ip-country", "x-appengine-country"):
        v = headers.get(h)
        if v and len(v) == 2:
            return v.upper()
    if user_country:
        return user_country.upper()
    return "US"


def is_sri_lanka(request: Request, user_country: str | None = None) -> bool:
    return get_country_code(request, user_country) == "LK"
