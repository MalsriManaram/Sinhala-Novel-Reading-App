"""TTS routes — OpenAI TTS via Emergent integrations."""
import io
import base64
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from app.core.deps import get_current_user
from app.schemas.common import TTSRequestIn
from app.services import tts_service

router = APIRouter(prefix="/tts", tags=["tts"])


def _split_sentences(text: str) -> list[str]:
    import re
    # Split on ., !, ?, and Sinhala danda (।)
    parts = re.split(r"(?<=[.!?।])\s+", text.strip())
    return [p for p in (s.strip() for s in parts) if p]


@router.post("/speech")
async def generate(payload: TTSRequestIn, user=Depends(get_current_user)):
    try:
        audio = await tts_service.generate_tts_audio(
            text=payload.text,
            voice=payload.voice,
            model=payload.model,
            speed=payload.speed,
            response_format=payload.response_format,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"TTS generation failed: {exc}")

    media_type = {
        "mp3": "audio/mpeg",
        "opus": "audio/ogg",
        "aac": "audio/aac",
        "flac": "audio/flac",
        "wav": "audio/wav",
        "pcm": "audio/L16",
    }.get(payload.response_format, "application/octet-stream")
    return StreamingResponse(io.BytesIO(audio), media_type=media_type)


@router.post("/speech/sentences")
async def generate_with_sentences(payload: TTSRequestIn, user=Depends(get_current_user)):
    """Return base64 audio + sentence offsets so the client can highlight."""
    sentences = _split_sentences(payload.text)
    try:
        audio = await tts_service.generate_tts_audio(
            text=payload.text,
            voice=payload.voice,
            model=payload.model,
            speed=payload.speed,
            response_format=payload.response_format,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"TTS generation failed: {exc}")

    audio_b64 = base64.b64encode(audio).decode("utf-8")
    # Distribute durations proportional to sentence character length.
    total_chars = sum(len(s) for s in sentences) or 1
    # Rough estimate: 14 chars/sec for openai tts at 1.0
    estimated_duration_s = total_chars / 14.0 / max(payload.speed, 0.25)
    offsets = []
    cursor = 0.0
    for s in sentences:
        duration = (len(s) / total_chars) * estimated_duration_s
        offsets.append({"text": s, "start_s": round(cursor, 3), "end_s": round(cursor + duration, 3)})
        cursor += duration

    return {
        "audio_base64": audio_b64,
        "format": payload.response_format,
        "sentences": offsets,
        "estimated_duration_s": round(estimated_duration_s, 3),
    }
