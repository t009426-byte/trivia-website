/* Questions are now fetched live from OpenTDB via /api/questions.
   This file keeps only the UI constants, topic metadata and messages. */

export const PER_GAME  = 8    // questions shown per game
export const TIMER_SEC = 30   // seconds per question

export const TOPIC_META = {
  geography: { name:'الجغرافيا',   emoji:'🌍', hint:'خرائط وأماكن' },
  history:   { name:'التاريخ',     emoji:'🏛️', hint:'أشياء قديمة'  },
  science:   { name:'العلوم',      emoji:'🔬', hint:'علم وترفيه'   },
  food:      { name:'طعام وشراب',  emoji:'🍕', hint:'أشياء لذيذة'  },
  animals:   { name:'الحيوانات',   emoji:'🦁', hint:'فراء وحراشف'  },
}

export const CORRECT_MSG = [
  '🎉 أصبت تماماً!', '🔥 أنت في قمة نشاطك!', '🧠 عبقري بامتياز!',
  '✅ إجابة صحيحة يا ذكي!', '💪 هيا! هذا صحيح!', '🌟 نجم حقيقي!',
  '👏 في الصميم!', '🎯 في القلب!', '🤓 انظر إليك تتألق!', '💡 رائع جداً!',
]

export const WRONG_MSG = [
  '😬 آسف، ليس هذا!', '💀 يا إلهي! خطأ!', '🙈 لا، لا، لا!',
  '❌ إجابة خاطئة!', '😅 لم تقترب حتى!', '🤦 يا حسرة…',
  '💩 خطأ!', '🎸 خطأ! (تحطيم غيتار)', '😵 حظاً أوفر في المرة القادمة!', '🤡 حقاً؟!',
]

export const TIMEOUT_MSG = [
  '⏰ انتهى الوقت! كنت بطيئاً جداً!', '⌛ نفد الوقت! أوه!',
  '💨 يطير الوقت حين تكون محتاراً!', '🐢 هل أنت سلحفاة؟',
  '⏳ دق الدق، نفد الوقت!',
]

export const SCORE_INFO = [
  { min:0,  max:2,  emoji:'😭', msg:'يا إلهي! حتى سمكتي الذهبية أحرزت نتيجة أعلى. استمر في التدريب!' },
  { min:3,  max:4,  emoji:'😐', msg:'ممم. لقد حاولت! هذا… شيء ما، أظن.' },
  { min:5,  max:6,  emoji:'😊', msg:'ليس سيئاً! تعرف أشياء — أشياء عادية، لكنها لا تزال أشياء!' },
  { min:7,  max:7,  emoji:'😎', msg:'جيد جداً! أنت رسمياً أذكى من حجر. حجر كبير.' },
  { min:8,  max:8,  emoji:'🤩', msg:'مثير للإعجاب! هل تغش؟ (أمزح فقط… في الغالب 👀)' },
  { min:9,  max:10, emoji:'🏆', msg:'مثالي! يا لك من عبقري مطلق! وظّف هذا الشخص فوراً!' },
]
