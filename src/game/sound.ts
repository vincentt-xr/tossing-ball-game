let audioContext: AudioContext | null = null;

export const playGameSound = (kind: "hit" | "bounce" | "combo") => {
  const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return;
  audioContext ??= new AudioContextCtor();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const now = audioContext.currentTime;
  oscillator.type = kind === "combo" ? "triangle" : "sine";
  oscillator.frequency.value = kind === "bounce" ? 150 : kind === "combo" ? 720 : 420;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(kind === "combo" ? 0.08 : 0.045, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + (kind === "combo" ? 0.18 : 0.1));
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.2);
};
