'use client'

import { useState, useEffect, useRef } from 'react'
import Confetti from '@/components/Confetti'
import {
  TOPIC_META,
  CORRECT_MSG, WRONG_MSG, TIMEOUT_MSG, SCORE_INFO,
  PER_GAME, TIMER_SEC,
} from '@/data/questions'

/* ── helpers ── */
const CIRCUMF = 2 * Math.PI * 31

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function getOptClass(i, phase, selectedIdx, correctIdx) {
  if (phase !== 'feedback') return 'opt-btn'
  if (selectedIdx === i && i === correctIdx) return 'opt-btn correct'
  if (selectedIdx === i)                     return 'opt-btn wrong'
  if (i === correctIdx)                      return 'opt-btn show-ans'
  return 'opt-btn'
}

const DIFFICULTY_LABEL = { easy:'سهل 🟢', medium:'متوسط 🟡', hard:'صعب 🔴' }

/* ════════════════════ COMPONENT ════════════════════ */
export default function TriviaGame() {
  /* navigation */
  const [screen, setScreen] = useState('welcome') // welcome|topic|loading|game|error|results

  /* welcome */
  const [playerName, setPlayerName] = useState('')
  const [nameError,  setNameError]  = useState(false)

  /* game data */
  const [topic,     setTopic]     = useState('')
  const [questions, setQuestions] = useState([])
  const [qIdx,      setQIdx]      = useState(0)
  const [score,     setScore]     = useState(0)
  const scoreRef = useRef(0)

  /* timer */
  const [timeLeft, setTimeLeft] = useState(TIMER_SEC)

  /* answer phase */
  const [phase,       setPhase]       = useState('playing') // playing | feedback
  const [selectedIdx, setSelectedIdx] = useState(null)

  /* toast */
  const [toastMsg,     setToastMsg]     = useState('')
  const [toastType,    setToastType]    = useState('ok')
  const [toastVisible, setToastVisible] = useState(false)

  /* score bump */
  const [scoreBump, setScoreBump] = useState(false)

  /* confetti */
  const [showConfetti, setShowConfetti] = useState(false)

  /* error */
  const [errorMsg, setErrorMsg] = useState('')

  const currentQ = questions[qIdx]

  /* ── 1. Timer tick ── */
  useEffect(() => {
    if (screen !== 'game' || phase !== 'playing' || timeLeft <= 0) return
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [screen, phase, timeLeft])

  /* ── 2. Timeout detection ── */
  useEffect(() => {
    if (screen !== 'game' || phase !== 'playing' || timeLeft > 0) return
    setPhase('feedback')
    setSelectedIdx(null)
    setToastMsg(pick(TIMEOUT_MSG))
    setToastType('bad')
    setToastVisible(true)
  }, [timeLeft, screen, phase])

  /* ── 3. Auto-advance after feedback ── */
  useEffect(() => {
    if (phase !== 'feedback') return
    const id = setTimeout(() => {
      setToastVisible(false)
      const next = qIdx + 1
      if (next >= PER_GAME) {
        setScreen('results')
        if (scoreRef.current >= 7) setShowConfetti(true)
      } else {
        setQIdx(next)
        setTimeLeft(TIMER_SEC)
        setSelectedIdx(null)
        setPhase('playing')
      }
    }, 1900)
    return () => clearTimeout(id)
  }, [phase, qIdx])

  /* ── Fetch questions from /api/questions ── */
  async function startGame(selectedTopic) {
    const t = selectedTopic ?? topic
    setTopic(t)
    setScreen('loading')
    setShowConfetti(false)

    try {
      const res = await fetch(`/api/questions?topic=${t}&amount=10`)
      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'rate_limit') throw new Error('rate_limit')
        if (data.error === 'no_results') throw new Error('no_results')
        throw new Error('server_error')
      }

      scoreRef.current = 0
      setScore(0)
      setQIdx(0)
      setTimeLeft(TIMER_SEC)
      setPhase('playing')
      setSelectedIdx(null)
      setToastVisible(false)
      setQuestions(shuffle(data).slice(0, PER_GAME))
      setScreen('game')
    } catch (err) {
      const msgs = {
        rate_limit:   'الرجاء الانتظار لحظة قبل بدء لعبة جديدة ⏳',
        no_results:   'لا توجد أسئلة كافية لهذا الموضوع، جرب موضوعاً آخر 🤷',
        network:      'تعذّر الاتصال، تحقق من اتصالك بالإنترنت 🌐',
      }
      setErrorMsg(msgs[err.message] || 'حدث خطأ غير متوقع، حاول مجدداً 😬')
      setScreen('error')
    }
  }

  /* ── Answer click ── */
  function handleAnswer(idx) {
    if (phase !== 'playing') return
    setPhase('feedback')
    setSelectedIdx(idx)
    if (idx === currentQ.a) {
      scoreRef.current++
      setScore(scoreRef.current)
      setScoreBump(true)
      setTimeout(() => setScoreBump(false), 400)
      setToastMsg(pick(CORRECT_MSG))
      setToastType('ok')
    } else {
      setToastMsg(pick(WRONG_MSG))
      setToastType('bad')
    }
    setToastVisible(true)
  }

  /* ── Navigation ── */
  function goToTopic() {
    if (!playerName.trim()) { setNameError(true); return }
    setNameError(false)
    setScreen('topic')
  }

  /* ── Derived values ── */
  const timerOffset = CIRCUMF * (1 - timeLeft / TIMER_SEC)
  const timerStroke = timeLeft > 15 ? '#10b981' : timeLeft > 8 ? '#f59e0b' : '#ef4444'
  const timerColor  = timeLeft <= 8 ? '#fca5a5' : '#fff'

  const scoreInfo = screen === 'results'
    ? (SCORE_INFO.find(s => score >= s.min && score <= s.max) ?? SCORE_INFO[0])
    : SCORE_INFO[0]

  /* ════════════════════ RENDER ════════════════════ */
  return (
    <>
      <Confetti active={showConfetti} />
      <div className="stars" />

      {/* Toast */}
      <div className={`toast${toastVisible ? ' show' : ''} ${toastType}`}>{toastMsg}</div>

      {/* ════ WELCOME ════ */}
      {screen === 'welcome' && (
        <div className="screen" key="welcome">
          <div className="card">
            <div className="welcome-hero"><span className="welcome-icon">🧠</span></div>
            <h1 className="welcome-title">جنون مسابقة المعرفة!</h1>
            <p className="welcome-sub">أكثر مسابقة معرفية مجنونة في العالم 🎉</p>

            <label className="field-label" htmlFor="inp-name">ما اسمك يا عبقري؟</label>
            <input
              id="inp-name"
              className={`name-input${nameError ? ' error' : ''}`}
              type="text"
              placeholder='مثلاً: "الأستاذ سوبرمان" 🤓'
              maxLength={28}
              autoComplete="off"
              value={playerName}
              onChange={e => { setPlayerName(e.target.value); setNameError(false) }}
              onKeyDown={e => e.key === 'Enter' && goToTopic()}
            />
            {nameError && <p className="err-msg">⚠️ نحتاج إلى اسم! حتى &quot;بطاطا&quot; مقبول.</p>}
            <button className="btn-primary" onClick={goToTopic}>هيا نبدأ! 🚀</button>
          </div>
        </div>
      )}

      {/* ════ TOPIC ════ */}
      {screen === 'topic' && (
        <div className="screen" key="topic">
          <div className="card">
            <h2 className="topic-greeting">مرحباً، {playerName}! 👋</h2>
            <p className="topic-sub">اختر موضوعاً وأثبت ذكاءك الخارق 🧠✨</p>
            <div className="topics-grid">
              {Object.entries(TOPIC_META).map(([key, { name, emoji, hint }]) => (
                <div key={key} className="topic-card" data-t={key} onClick={() => startGame(key)}>
                  <span className="topic-icon">{emoji}</span>
                  <div className="topic-name">{name}</div>
                  <div className="topic-hint">{hint}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════ LOADING ════ */}
      {screen === 'loading' && (
        <div className="screen" key="loading">
          <div className="card loading-card">
            <div className="spinner" />
            <p className="loading-text">جارٍ تحميل الأسئلة وترجمتها…</p>
            <p className="loading-sub">{TOPIC_META[topic]?.emoji} {TOPIC_META[topic]?.name}</p>
          </div>
        </div>
      )}

      {/* ════ ERROR ════ */}
      {screen === 'error' && (
        <div className="screen" key="error">
          <div className="card" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '72px', display: 'block', marginBottom: '12px' }}>😵</span>
            <h2 className="res-title">حدث خطأ!</h2>
            <p className="res-msg" style={{ marginBottom: '28px' }}>{errorMsg}</p>
            <button className="btn-primary" style={{ marginTop: 0 }} onClick={() => setScreen('topic')}>
              🔄 حاول مجدداً
            </button>
          </div>
        </div>
      )}

      {/* ════ GAME ════ */}
      {screen === 'game' && currentQ && (
        <div className="screen" key="game">
          {/* Header */}
          <div className="game-top">
            <div className={`score-pill${scoreBump ? ' bump' : ''}`}>⭐ النتيجة: {score}</div>
            <div className="timer-wrap">
              <svg className="timer-svg" viewBox="0 0 72 72">
                <circle className="t-bg"  cx="36" cy="36" r="31" />
                <circle className="t-bar" cx="36" cy="36" r="31"
                  style={{ strokeDashoffset: timerOffset, stroke: timerStroke }} />
              </svg>
              <div className="timer-num" style={{ color: timerColor }}>{timeLeft}</div>
            </div>
            <div className="q-count">س {qIdx + 1} / {PER_GAME}</div>
          </div>

          {/* Progress bar */}
          <div className="prog-track">
            <div className="prog-fill" style={{ width: `${(qIdx / PER_GAME) * 100}%` }} />
          </div>

          {/* Question card */}
          <div className="q-card">
            <div className="q-badge-row">
              <div className="q-badge">
                <span>{TOPIC_META[topic].emoji}</span>
                <span>{TOPIC_META[topic].name}</span>
              </div>
              {currentQ.difficulty && (
                <div className="q-badge diff-badge">
                  {DIFFICULTY_LABEL[currentQ.difficulty] ?? currentQ.difficulty}
                </div>
              )}
            </div>
            <p className="q-text">{currentQ.q}</p>
          </div>

          {/* Options */}
          <div className="opts">
            {currentQ.o.map((opt, i) => (
              <button
                key={i}
                className={getOptClass(i, phase, selectedIdx, currentQ.a)}
                disabled={phase === 'feedback'}
                onClick={() => handleAnswer(i)}
              >
                <span className="opt-lbl">{'أبجد'[i]}</span>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ════ RESULTS ════ */}
      {screen === 'results' && (
        <div className="screen" key="results">
          <div className="card">
            <span className="res-icon">{scoreInfo.emoji}</span>
            <h2 className="res-title">اكتملت المسابقة!</h2>
            <p className="res-player">أحسنت، {playerName}! 🌟</p>

            <div className="score-block">
              <div className="score-big">{score} / {PER_GAME}</div>
              <div className="score-tag">إجابات صحيحة</div>
            </div>

            <div className="stats-row">
              <div className="stat-box"><div className="stat-val">{score}</div><div className="stat-lbl">صحيح ✅</div></div>
              <div className="stat-box"><div className="stat-val">{PER_GAME - score}</div><div className="stat-lbl">خطأ ❌</div></div>
              <div className="stat-box"><div className="stat-val">{Math.round((score / PER_GAME) * 100)}%</div><div className="stat-lbl">النتيجة 🎯</div></div>
            </div>

            <p className="res-msg">{scoreInfo.msg}</p>

            <div className="btn-row">
              <button className="btn-primary"
                onClick={() => { setShowConfetti(false); startGame() }}>
                🔄 العب مجدداً!
              </button>
              <button className="btn-outline"
                onClick={() => { setShowConfetti(false); setScreen('topic') }}>
                🎯 اختر موضوعاً جديداً
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
