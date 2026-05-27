"""Database seeding — admin user + sample novels and chapters."""
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.core.security import hash_password
from app.models.user import User
from app.models.novel import Novel
from app.models.chapter import Chapter

settings = get_settings()


SAMPLE_NOVELS = [
    {
        "title": "The Geometry of Silence",
        "author": "Ruvinda Samaranayake",
        "synopsis": (
            "On the orbital ring of Helion-IV, a topologist hears footsteps in a corridor that no one "
            "else can. As the geometry of the station begins to disagree with itself, she must decide "
            "whether the silence is mathematics — or memory."
        ),
        "cover_url": "https://images.unsplash.com/photo-1489846986031-7cea03ab8fd0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwxfHxteXN0ZXJ5JTIwdGhyaWxsZXIlMjBkYXJrJTIwY2luZW1hdGljJTIwcG9zdGVyfGVufDB8fHx8MTc3OTg3OTA2NXww&ixlib=rb-4.1.0&q=85",
        "category": "Hard Science Fiction",
        "status": "published",
        "chapters": [
            {
                "chapter_number": 1,
                "title": "The First Echo",
                "is_premium": False,
                "content": (
                    "The ring hummed at 41 hertz, a frequency Anuki had learned to ignore in the way one ignores one's own pulse.\n\n"
                    "But tonight there was something underneath it — a softer, slower rhythm, as if the station were breathing in its sleep. "
                    "She pressed her palm to the corridor wall and counted: three seconds in, four seconds out. Not mechanical. Not human, either.\n\n"
                    "Geometry, her father had once said, is the conscience of the universe. It cannot lie, and it cannot forget.\n\n"
                    "She walked toward the silence, and the silence did not move away."
                ),
            },
            {
                "chapter_number": 2,
                "title": "Non-Euclidean Mercy",
                "is_premium": True,
                "content": (
                    "By the seventh corridor, Anuki understood she had walked further than the station was wide.\n\n"
                    "The lights ahead had begun to repeat — the same flicker pattern, every nineteen paces — and her watch insisted it was still 03:14. "
                    "She unrolled the schematic on her sleeve and traced the path with a fingertip. The corridor she stood in did not exist.\n\n"
                    "And then, very softly, she heard her own footsteps catch up from behind her."
                ),
            },
            {
                "chapter_number": 3,
                "title": "What the Topology Wants",
                "is_premium": True,
                "content": (
                    "There is a theorem, almost too cruel to be useful, that says any closed surface can be deformed without tearing into precisely one of three shapes.\n\n"
                    "Anuki was beginning to suspect the station had chosen the third."
                ),
            },
        ],
    },
    {
        "title": "හිමි කතාව",  # "The Master's Tale" — Sinhala title
        "author": "Sunethra Rajakaruna",
        "synopsis": "කොළඹ අහසේ සඳ එළිය යටතේ, පැරණි පෙම්වතුන් දෙදෙනකු හමුවේ.",
        "cover_url": "https://images.unsplash.com/photo-1622798203916-a91709f62d2a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHw0fHxmYW50YXN5JTIwcm9tYW5jZSUyMGJvb2slMjBjb3ZlciUyMGFydHxlbnwwfHx8fDE3Nzk4NzkwNjV8MA&ixlib=rb-4.1.0&q=85",
        "category": "Romance",
        "status": "published",
        "chapters": [
            {
                "chapter_number": 1,
                "title": "පළමු හමුව",
                "is_premium": False,
                "content": (
                    "කොළඹ ගාලු මුවදොර අසල, සැඳෑ දහවල හිමි ව ආ සුළඟ අතර, ඇය ඔහු දුටුවාය.\n\n"
                    "කාලය නවත්වා ඇතැයි ඇය සිතුවාය. නමුත් කාලය නවතින්නේ නැත — ඉතිරිවන්නේ අපිමයි."
                ),
            },
            {
                "chapter_number": 2,
                "title": "සිහින අතර",
                "is_premium": True,
                "content": "ඊළඟ දින දහයෙහි, ඇය නැවත නැවතත් ඔහු ගැන සිහි කළාය. නමුත් සිහින අතරින් මතු වූයේ වෙනත් මුහුණක්ය.",
            },
        ],
    },
    {
        "title": "Shadows of Pettah",
        "author": "Anuradha Perera",
        "synopsis": "A pickpocket, a missing professor, and a city that has secrets older than its streets.",
        "cover_url": "https://images.pexels.com/photos/28302225/pexels-photo-28302225.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "category": "Mystery",
        "status": "published",
        "chapters": [
            {
                "chapter_number": 1,
                "title": "The Whistler at the Bus Stand",
                "is_premium": False,
                "content": "Rohan never stole from monks, blind men, or anyone whistling the same song as his late mother. The man at the Pettah bus stand was breaking all three rules.",
            },
            {
                "chapter_number": 2,
                "title": "Rosewood and Rain",
                "is_premium": True,
                "content": "The professor's office smelled of rosewood and rain, even though the windows had been sealed for three months.",
            },
        ],
    },
    {
        "title": "The Cinnamon Coast Chronicles",
        "author": "Ishara Wijesinghe",
        "synopsis": "An epic spanning four generations of a family bound to the sea — and to a debt the sea has never forgiven.",
        "cover_url": "https://images.unsplash.com/photo-1771576741909-d0bf6f60fb05?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwyfHxmYW50YXN5JTIwcm9tYW5jZSUyMGJvb2slMjBjb3ZlciUyMGFydHxlbnwwfHx8fDE3Nzk4NzkwNjV8MA&ixlib=rb-4.1.0&q=85",
        "category": "Historical Fiction",
        "status": "upcoming",
        "chapters": [],
    },
    {
        "title": "Yaka Protocol",
        "author": "Dilshan Karunaratne",
        "synopsis": "A cybersecurity thriller set in Colombo's near-future, where an AI exorcist is the last firewall between the city and an ancient signal.",
        "cover_url": "https://images.unsplash.com/photo-1489846986031-7cea03ab8fd0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwxfHxteXN0ZXJ5JTIwdGhyaWxsZXIlMjBkYXJrJTIwY2luZW1hdGljJTIwcG9zdGVyfGVufDB8fHx8MTc3OTg3OTA2NXww&ixlib=rb-4.1.0&q=85",
        "category": "Thriller",
        "status": "upcoming",
        "chapters": [],
    },
]


def run_seed(db: Session) -> dict:
    summary = {"admin_created": False, "novels_created": 0, "chapters_created": 0}

    # Admin user
    admin = db.query(User).filter(User.email == settings.DEFAULT_ADMIN_EMAIL).first()
    if not admin:
        admin = User(
            email=settings.DEFAULT_ADMIN_EMAIL,
            name=settings.DEFAULT_ADMIN_NAME,
            password_hash=hash_password(settings.DEFAULT_ADMIN_PASSWORD),
            role="admin",
            premium_status=True,
            provider="local",
            country_code="LK",
        )
        db.add(admin)
        db.commit()
        summary["admin_created"] = True

    # Novels
    for spec in SAMPLE_NOVELS:
        existing = db.query(Novel).filter(Novel.title == spec["title"]).first()
        if existing:
            continue
        n = Novel(
            title=spec["title"],
            author=spec["author"],
            synopsis=spec["synopsis"],
            cover_url=spec["cover_url"],
            category=spec["category"],
            status=spec["status"],
            release_at=(
                datetime.now(timezone.utc) + timedelta(days=14)
                if spec["status"] == "upcoming"
                else None
            ),
        )
        db.add(n)
        db.flush()
        for ch in spec["chapters"]:
            db.add(
                Chapter(
                    novel_id=n.id,
                    chapter_number=ch["chapter_number"],
                    title=ch["title"],
                    content=ch["content"],
                    is_premium=ch["is_premium"],
                    published_at=datetime.now(timezone.utc),
                )
            )
            summary["chapters_created"] += 1
        summary["novels_created"] += 1

    db.commit()
    return summary
