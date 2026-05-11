<template>
  <div class="birth-sky-loader">
    <canvas ref="canvas" class="star-canvas"></canvas>

    <div class="center-content">
      <div class="eyebrow">ONE MORE THING</div>

      <div class="birth-headline">
        NOW, LET'S MEET<br />
        YOUR BIRTH SKY
      </div>

      <div class="subline">
        The stars that were shining<br />
        the night you were born
      </div>

      <div class="loading-text">
        LOADING STELLARIUM
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GuiLoader',

  data () {
    return {
      raf: null,
      resizeObserver: null,
      stars: []
    }
  },

  mounted () {
    const canvas = this.$refs.canvas
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      this.stars = []
    }

    resize()

    this.resizeObserver = new ResizeObserver(resize)
    this.resizeObserver.observe(canvas)

    const draw = (ts) => {
      const W = canvas.width
      const H = canvas.height
      const t = ts * 0.001

      if (W > 0 && H > 0) {
        ctx.fillStyle = '#000005'
        ctx.fillRect(0, 0, W, H)

        if (!this.stars.length) {
          this.stars = Array.from({ length: 280 }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 1.6 + 0.2,
            tw: Math.random() * Math.PI * 2,
            sp: Math.random() * 2.0 + 0.4,
            hue: Math.random() < 0.15 ? (Math.random() < 0.5 ? 200 : 40) : 0
          }))
        }

        this.stars.forEach((s) => {
          const a = 0.3 + 0.55 * Math.sin(t * s.sp + s.tw)

          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)

          if (s.hue === 200) {
            ctx.fillStyle = `rgba(140,200,255,${a})`
          } else if (s.hue === 40) {
            ctx.fillStyle = `rgba(255,220,130,${a})`
          } else {
            ctx.fillStyle = `rgba(255,255,255,${a * 0.85})`
          }

          ctx.fill()

          if (s.r > 1.2) {
            ctx.save()
            ctx.globalAlpha = a * 0.4
            ctx.strokeStyle = s.hue === 200
              ? 'rgba(140,200,255,1)'
              : 'rgba(255,255,255,1)'
            ctx.lineWidth = 0.5

            const len = s.r * 3.5
            ctx.beginPath()
            ctx.moveTo(s.x - len, s.y)
            ctx.lineTo(s.x + len, s.y)
            ctx.moveTo(s.x, s.y - len)
            ctx.lineTo(s.x, s.y + len)
            ctx.stroke()
            ctx.restore()
          }
        })

        const nebX = W * 0.5
        const nebY = H * 0.45
        const nebR = Math.min(W, H) * 0.55
        const neb = ctx.createRadialGradient(nebX, nebY, 0, nebX, nebY, nebR)

        neb.addColorStop(0, 'rgba(60,20,100,0.12)')
        neb.addColorStop(0.5, 'rgba(20,10,60,0.06)')
        neb.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(nebX, nebY, nebR, 0, Math.PI * 2)
        ctx.fillStyle = neb
        ctx.fill()
      }

      this.raf = requestAnimationFrame(draw)
    }

    this.raf = requestAnimationFrame(draw)
  },

  beforeDestroy () {
    if (this.raf) cancelAnimationFrame(this.raf)
    if (this.resizeObserver) this.resizeObserver.disconnect()
  }
}
</script>

<style scoped>
.birth-sky-loader {
  position: absolute;
  inset: 0;
  background: #000005;
  overflow: hidden;
}

.star-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.center-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  pointer-events: none;
  text-align: center;
}

.eyebrow {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: rgba(160, 200, 255, 0.6);
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

.birth-headline {
  font-family: 'Bebas Neue', sans-serif !important;
  font-size: clamp(36px, 5vw, 70px) !important;
  line-height: 1.05 !important;
  letter-spacing: 0em !important;
  text-align: center !important;
  color: #ffffff !important;
  text-shadow: 0 0 60px rgba(120, 180, 255, 0.4) !important;
  font-weight: 400 !important;
  transform: scaleX(0.88) !important;
  transform-origin: center !important;
}
.subline {
  font-family: 'DM Mono', monospace;
  font-size: clamp(10px, 1.2vw, 15px);
  color: rgba(160, 200, 255, 0.5);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  max-width: 400px;
  margin-top: 8px;
}

.loading-text {
  margin-top: 20px;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: rgba(160, 200, 255, 0.45);
  letter-spacing: 0.25em;
  text-transform: uppercase;
  animation: pulse-tap 1.8s ease-in-out infinite;
}

@keyframes pulse-tap {
  0%, 100% {
    opacity: 0.35;
  }

  50% {
    opacity: 0.9;
  }
}
</style>
