let context: AudioContext | null = null

function ctx() {
  if (!context) context = new AudioContext()
  if (context.state === 'suspended') void context.resume()
  return context
}

function tone(freq: number, duration: number, volume: number, type: OscillatorType, delay = 0) {
  const c = ctx(); const o = c.createOscillator(); const g = c.createGain()
  o.type = type; o.frequency.setValueAtTime(freq, c.currentTime + delay)
  g.gain.setValueAtTime(.0001, c.currentTime + delay)
  g.gain.exponentialRampToValueAtTime(volume, c.currentTime + delay + .025)
  g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + delay + duration)
  o.connect(g).connect(c.destination); o.start(c.currentTime + delay); o.stop(c.currentTime + delay + duration + .03)
}

export const sounds = {
  click(muted: boolean) { if (!muted) { tone(520,.12,.018,'sine'); tone(780,.09,.008,'sine',.035) } },
  seed(muted: boolean) { if (!muted) { tone(138,.34,.022,'sine'); tone(207,.28,.008,'triangle',.08) } },
  bloom(muted: boolean) { if (!muted) [0, .08, .17].forEach((d,i) => tone([659,784,988][i],.75,.012,'sine',d)) },
}
