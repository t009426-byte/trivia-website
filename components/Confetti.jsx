'use client'

import { useEffect, useRef } from 'react'

const COLORS = ['#7c3aed','#ec4899','#f97316','#10b981','#3b82f6','#fbbf24','#ef4444','#a78bfa']

export default function Confetti({ active }) {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Stop & clear if not active
    if (!active) {
      if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null }
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      return
    }

    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    let particles = Array.from({ length: 160 }, () => ({
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height - canvas.height * 1.1,
      w:    Math.random() * 14 + 5,
      h:    Math.random() * 7  + 4,
      col:  COLORS[Math.floor(Math.random() * COLORS.length)],
      rot:  Math.random() * 360,
      rspd: Math.random() * 9 - 4.5,
      vx:   Math.random() * 4 - 2,
      vy:   Math.random() * 4 + 2.5,
      op:   1,
    }))

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.rspd
        if (p.y > canvas.height * 0.65) p.op -= 0.022
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot * Math.PI / 180)
        ctx.globalAlpha = Math.max(0, p.op)
        ctx.fillStyle = p.col
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      })
      particles = particles.filter(p => p.op > 0)
      if (particles.length > 0) {
        animRef.current = requestAnimationFrame(draw)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        animRef.current = null
      }
    }

    draw()

    return () => {
      if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null }
    }
  }, [active])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}
    />
  )
}
