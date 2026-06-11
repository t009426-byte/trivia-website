import { NextResponse } from 'next/server'

/* OpenTDB category IDs that match our 5 topics */
const CATEGORY = {
  geography: 22,   // Geography
  history:   23,   // History
  science:   17,   // Science & Nature
  food:      25,   // Art  ← closest available; OpenTDB has no Food category
  animals:   27,   // Animals
}

/* Decode every HTML entity OpenTDB uses in its question strings */
function decode(str) {
  return str
    .replace(/&#(\d+);/g,       (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi,(_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g,   '&')
    .replace(/&lt;/g,    '<')
    .replace(/&gt;/g,    '>')
    .replace(/&quot;/g,  '"')
    .replace(/&apos;/g,  "'")
    .replace(/&#039;/g,  "'")
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&lsquo;/g, '‘')
    .replace(/&rsquo;/g, '’')
    .replace(/&hellip;/g,'…')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&nbsp;/g,  ' ')
    .replace(/&eacute;/g,'é').replace(/&egrave;/g,'è')
    .replace(/&agrave;/g,'à').replace(/&ccedil;/g,'ç')
    .replace(/&ouml;/g,  'ö').replace(/&uuml;/g,  'ü')
    .replace(/&auml;/g,  'ä').replace(/&oslash;/g,'ø')
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const topic  = searchParams.get('topic')  || 'animals'
  const amount = Math.min(Number(searchParams.get('amount') || 10), 50)

  const cat = CATEGORY[topic] ?? 27
  const url = `https://opentdb.com/api.php?amount=${amount}&type=multiple&category=${cat}`

  let raw
  try {
    const res = await fetch(url, { cache: 'no-store' })
    raw = await res.json()
  } catch {
    return NextResponse.json({ error: 'network', message: 'Could not reach OpenTDB' }, { status: 502 })
  }

  /* OpenTDB response codes:
     0 = Success  1 = No Results  5 = Rate Limit */
  if (raw.response_code === 5) {
    return NextResponse.json({ error: 'rate_limit' }, { status: 429 })
  }
  if (raw.response_code !== 0 || !raw.results?.length) {
    return NextResponse.json({ error: 'no_results' }, { status: 404 })
  }

  const questions = raw.results.map(q => {
    const correct = decode(q.correct_answer)
    const options  = shuffle([correct, ...q.incorrect_answers.map(decode)])
    return {
      q:          decode(q.question),
      o:          options,
      a:          options.indexOf(correct),
      difficulty: q.difficulty,
      category:   decode(q.category),
    }
  })

  /* ── Translate every question + its options to Arabic ──────────────────
     MyMemory is free, no API key needed, up to 10k chars/day.
     We send one request per question: "Q ||| A ||| B ||| C ||| D"
     All requests fire in parallel so latency ≈ one round-trip.
  ──────────────────────────────────────────────────────────────────────── */
  const SEP = ' ||| '

  async function translateOne(q) {
    const text = [q.q, ...q.o].join(SEP)
    try {
      const res  = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ar`,
        { cache: 'no-store', signal: AbortSignal.timeout(8000) },
      )
      const data = await res.json()
      const raw  = data?.responseData?.translatedText ?? ''
      const parts = raw.split(SEP)
      if (parts.length === 5) {
        return { ...q, q: parts[0].trim(), o: parts.slice(1).map(p => p.trim()) }
      }
    } catch { /* timeout or network — fall back to English */ }
    return q
  }

  const translated = await Promise.all(questions.map(translateOne))

  return NextResponse.json(translated)
}
