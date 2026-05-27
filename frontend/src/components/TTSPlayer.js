/**
 * Glassmorphic floating TTS player used in the reader screen.
 * Calls /api/tts/speech/sentences and uses expo-av to play.
 */
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/store";
import { radii } from "../theme/tokens";
import { api } from "../lib/api";
import { t } from "../theme/i18n";

const SPEEDS = [1, 1.25, 1.5, 2];

export default function TTSPlayer({ text, voice = "nova", onProgressChange }) {
  const colors = useTheme((s) => s.colors)();
  const lang = useTheme((s) => s.language);
  const [busy, setBusy] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [sentences, setSentences] = useState([]);
  const soundRef = useRef(null);
  const tickRef = useRef(null);

  useEffect(() => () => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (soundRef.current) soundRef.current.unloadAsync();
  }, []);

  const generate = async () => {
    const r = await api.post("/tts/speech/sentences", {
      text: text.slice(0, 3500),
      voice,
      speed,
      model: "tts-1",
      response_format: "mp3",
    });
    return r.data;
  };

  const play = async () => {
    if (playing && soundRef.current) {
      await soundRef.current.pauseAsync();
      setPlaying(false);
      return;
    }
    if (soundRef.current) {
      await soundRef.current.playAsync();
      setPlaying(true);
      return;
    }
    setBusy(true);
    try {
      const { audio_base64, sentences: ofs } = await generate();
      setSentences(ofs);
      const uri = `data:audio/mpeg;base64,${audio_base64}`;
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true, rate: speed });
      soundRef.current = sound;
      setPlaying(true);
      tickRef.current = setInterval(async () => {
        if (!soundRef.current) return;
        const st = await soundRef.current.getStatusAsync();
        if (!st.isLoaded) return;
        const s = st.positionMillis / 1000;
        const idx = ofs.findIndex((o) => s >= o.start_s && s < o.end_s);
        onProgressChange?.(idx, ofs);
        if (st.didJustFinish) {
          setPlaying(false);
          onProgressChange?.(-1, ofs);
        }
      }, 150);
    } finally {
      setBusy(false);
    }
  };

  const rewind = async () => {
    if (!soundRef.current) return;
    const st = await soundRef.current.getStatusAsync();
    if (!st.isLoaded) return;
    await soundRef.current.setPositionAsync(Math.max(0, st.positionMillis - 15000));
  };

  const setRate = async (rate) => {
    setSpeed(rate);
    if (soundRef.current) await soundRef.current.setRateAsync(rate, true);
  };

  return (
    <View
      testID="tts-player"
      style={{
        position: "absolute", left: 16, right: 16, bottom: 22,
        backgroundColor: colors.glass, borderColor: colors.border, borderWidth: 1,
        borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 10,
        flexDirection: "row", alignItems: "center", gap: 6,
      }}
    >
      <Pressable testID="tts-rewind" onPress={rewind} style={{ padding: 6 }}>
        <Ionicons name="play-back" size={18} color={colors.text} />
      </Pressable>
      <Pressable
        testID="tts-play"
        onPress={play}
        style={{
          backgroundColor: colors.primary, borderRadius: radii.pill,
          paddingHorizontal: 14, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6,
        }}
      >
        {busy
          ? <ActivityIndicator size="small" color="#1A140A" />
          : <Ionicons name={playing ? "pause" : "play"} size={16} color="#1A140A" />}
        <Text style={{ color: "#1A140A", fontWeight: "700", fontSize: 13 }}>
          {playing ? t(lang, "pause") : t(lang, "listen")}
        </Text>
      </Pressable>
      <View style={{ flexDirection: "row", gap: 4, marginLeft: 4 }}>
        {SPEEDS.map((s) => (
          <Pressable
            key={s}
            onPress={() => setRate(s)}
            testID={`tts-speed-${s}`}
            style={{
              paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8,
              borderWidth: 1, borderColor: speed === s ? colors.primary : colors.border,
              backgroundColor: speed === s ? "rgba(199,146,62,0.12)" : "transparent",
            }}
          >
            <Text style={{ color: speed === s ? colors.primary : colors.textDim, fontSize: 11 }}>{s}x</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
