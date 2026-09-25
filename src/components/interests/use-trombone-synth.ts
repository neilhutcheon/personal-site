"use client";

import { useCallback, useEffect, useRef } from "react";

type Voice = {
  oscillators: OscillatorNode[];
  filter: BiquadFilterNode;
  gain: GainNode;
};

/**
 * A tiny Web Audio brass synth: detuned sawtooth + square through a low-pass filter
 * whose cutoff tracks pitch, which gives a warm, buzzy, trombone-ish tone.
 * The AudioContext is created lazily on the first user gesture (browser autoplay rules).
 */
export function useTromboneSynth() {
  const ctxRef = useRef<AudioContext | null>(null);
  const voiceRef = useRef<Voice | null>(null);

  const getContext = useCallback(() => {
    if (!ctxRef.current) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctxRef.current = new Ctor();
    }
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const setFrequency = useCallback((freq: number, glide = 0.04) => {
    const ctx = ctxRef.current;
    const voice = voiceRef.current;
    if (!ctx || !voice) return;
    const now = ctx.currentTime;
    voice.oscillators.forEach((osc) => osc.frequency.setTargetAtTime(freq, now, glide));
    voice.filter.frequency.setTargetAtTime(Math.min(4200, freq * 5), now, glide);
  }, []);

  const start = useCallback(
    (freq: number) => {
      const ctx = getContext();
      if (!ctx) return;
      if (voiceRef.current) {
        setFrequency(freq);
        return;
      }
      const now = ctx.currentTime;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.06);
      gain.gain.linearRampToValueAtTime(0.11, now + 0.25);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.Q.value = 3;
      // Reason: a quick filter sweep on attack mimics the "blat" of a brass articulation.
      filter.frequency.setValueAtTime(freq * 1.5, now);
      filter.frequency.linearRampToValueAtTime(Math.min(4200, freq * 5), now + 0.08);

      const saw = ctx.createOscillator();
      saw.type = "sawtooth";
      const square = ctx.createOscillator();
      square.type = "square";
      square.detune.value = 6;
      const squareGain = ctx.createGain();
      squareGain.gain.value = 0.25;

      [saw, square].forEach((osc) => osc.frequency.setValueAtTime(freq, now));
      saw.connect(filter);
      square.connect(squareGain).connect(filter);
      filter.connect(gain).connect(ctx.destination);
      saw.start(now);
      square.start(now);

      voiceRef.current = { oscillators: [saw, square], filter, gain };
    },
    [getContext, setFrequency],
  );

  const stop = useCallback(() => {
    const ctx = ctxRef.current;
    const voice = voiceRef.current;
    if (!ctx || !voice) return;
    const now = ctx.currentTime;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setTargetAtTime(0, now, 0.05);
    voice.oscillators.forEach((osc) => osc.stop(now + 0.3));
    voiceRef.current = null;
  }, []);

  useEffect(
    () => () => {
      stop();
      void ctxRef.current?.close();
    },
    [stop],
  );

  return { start, stop, setFrequency };
}
