"""OpenAI TTS via Emergent integrations library."""
from app.core.config import get_settings

settings = get_settings()


async def generate_tts_audio(
    text: str,
    voice: str = "nova",
    model: str = "tts-1",
    speed: float = 1.0,
    response_format: str = "mp3",
) -> bytes:
    """Generate audio bytes via Emergent OpenAI TTS."""
    # Import lazily so that missing/optional dependency does not break boot.
    from emergentintegrations.llm.openai import OpenAITextToSpeech

    tts = OpenAITextToSpeech(api_key=settings.EMERGENT_LLM_KEY)
    audio = await tts.generate_speech(
        text=text,
        model=model,
        voice=voice,
        speed=speed,
        response_format=response_format,
    )
    return audio
