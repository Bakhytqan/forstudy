(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const progressBar = document.getElementById('progressBar');
  const currentSlide = document.getElementById('currentSlide');
  const totalSlides = document.getElementById('totalSlides');
  const prevButton = document.getElementById('prevSlide');
  const nextButton = document.getElementById('nextSlide');
  const overviewPanel = document.getElementById('overviewPanel');
  const overviewLinks = document.getElementById('overviewLinks');
  let activeIndex = 0;

  totalSlides.textContent = String(slides.length).padStart(2, '0');
  slides.forEach((slide, index) => {
    const link = document.createElement('button');
    link.className = 'overview-link';
    link.type = 'button';
    link.innerHTML = `<span>${slide.dataset.title}</span><span>${String(index + 1).padStart(2, '0')}</span>`;
    link.addEventListener('click', () => { showSlide(index); closeOverview(); });
    overviewLinks.append(link);
  });

  function showSlide(index) {
    activeIndex = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => {
      const active = i === activeIndex;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      if (active) slide.scrollTop = 0;
    });
    currentSlide.textContent = String(activeIndex + 1).padStart(2, '0');
    progressBar.style.width = `${((activeIndex + 1) / slides.length) * 100}%`;
    prevButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === slides.length - 1;
    [...overviewLinks.children].forEach((link, i) => link.classList.toggle('is-current', i === activeIndex));
    document.title = `${String(activeIndex + 1).padStart(2, '0')} · ${slides[activeIndex].dataset.title} — Цифрлық гигиена`;
  }

  function closeOverview() {
    overviewPanel.classList.remove('is-open');
    overviewPanel.setAttribute('aria-hidden', 'true');
  }
  function toggleOverview() {
    const opening = !overviewPanel.classList.contains('is-open');
    overviewPanel.classList.toggle('is-open', opening);
    overviewPanel.setAttribute('aria-hidden', String(!opening));
  }

  prevButton.addEventListener('click', () => showSlide(activeIndex - 1));
  nextButton.addEventListener('click', () => showSlide(activeIndex + 1));
  document.getElementById('overviewToggle').addEventListener('click', toggleOverview);
  document.getElementById('closeOverview').addEventListener('click', closeOverview);
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => showSlide(Number(button.dataset.go))));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeOverview();
    if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
      if (event.target.closest('button, textarea, input')) return;
      event.preventDefault(); showSlide(activeIndex + 1);
    }
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      if (event.target.closest('button, textarea, input')) return;
      event.preventDefault(); showSlide(activeIndex - 1);
    }
  });
  let touchStartX = 0;
  document.getElementById('stage').addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].clientX; }, {passive:true});
  document.getElementById('stage').addEventListener('touchend', event => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 65) showSlide(activeIndex + (distance < 0 ? 1 : -1));
  }, {passive:true});

  document.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => {
    const answer = document.getElementById('domainAnswer');
    const correct = button.dataset.choice === 'look';
    answer.className = `answer-strip ${correct ? 'is-correct' : 'is-wrong'}`;
    answer.innerHTML = correct
      ? '<span class="answer-icon">✓</span><span>Дұрыс: B-де кирилл «е» (U+0435), A-да латын «e» (U+0065). Сыртқы көрініске ғана сенбе; бетбелгіні қолдан немесе мекенжайды өзің тер.<br><span class="en">Correct: B uses Cyrillic “е”, while A uses Latin “e”. Don’t rely on appearance alone.</span></span>'
      : '<span class="answer-icon">↗</span><span>A — таныс мекенжай үлгісі. B-де кирилл таңбасы ауысқан. Нақты жағдайда дерек енгізбес бұрын кез келген мекенжайды тексер.<br><span class="en">A is the familiar sample. B swaps in a Cyrillic character; verify an address before entering credentials.</span></span>';
  }));

  const caseDetails = {
    professor: ['ЖІБЕРУШІ · Файл күтілген бе? <span class="en">SENDER · Was the file expected?</span>', 'ФАЙЛ · Түрі мен мекенжайы таныс па? <span class="en">FILE · Is the type and destination known?</span>', 'ТЕКСЕР · Университеттің ресми каталогымен нақтыла. <span class="en">VERIFY · Ask through the university directory.</span>'],
    kakao: ['ЖАҢА НӨМІР · Адамды басқа жолмен раста. <span class="en">NEW NUMBER · Verify the person another way.</span>', 'СЫЙЛЫҚ КАРТАСЫ · Тосын төлем өтініші. <span class="en">GIFT CARD · Unusual payment request.</span>', 'СІЛТЕМЕГЕ ӨТПЕ · Белгілі нөмірге хабарла. <span class="en">NO LINK · Call the known contact.</span>'],
    translation: ['ҚОЛЖЕТІМДІЛІК · “Кез келген адам” тым кең. <span class="en">AUDIENCE · “Anyone” is broader than the class.</span>', 'МӘТІН · Жеке дерек бар ма? <span class="en">CONTENT · Does the draft contain identifiers?</span>', 'ӨЗГЕРТ · Рұқсатты шекте, жеке деректі алып таста. <span class="en">FIX · Restrict access and remove personal data.</span>']
  };
  document.querySelectorAll('[data-case]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-case]').forEach(card => card.classList.toggle('is-selected', card === button));
    const reveal = document.getElementById('caseReveal');
    reveal.classList.add('is-open');
    reveal.innerHTML = `<span class="reveal-icon">↳</span><div class="reveal-points">${caseDetails[button.dataset.case].map((point, i) => `<span><b>0${i + 1}</b> ${point}</span>`).join('')}</div>`;
  }));

  let timerSeconds = 12 * 60;
  let timerInterval = null;
  const timerDisplay = document.getElementById('timerDisplay');
  const timerStart = document.getElementById('timerStart');
  function renderTimer() { timerDisplay.textContent = `${String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:${String(timerSeconds % 60).padStart(2, '0')}`; }
  timerStart.addEventListener('click', () => {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; timerStart.textContent = 'ЖАЛҒАСТЫР / RESUME'; return; }
    if (timerSeconds <= 0) timerSeconds = 12 * 60;
    timerStart.textContent = 'ТОҚТАТ / PAUSE';
    timerInterval = setInterval(() => {
      timerSeconds -= 1; renderTimer();
      if (timerSeconds <= 0) { clearInterval(timerInterval); timerInterval = null; timerStart.textContent = 'БАСТА / START'; }
    }, 1000);
  });
  document.getElementById('timerReset').addEventListener('click', () => {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null; timerSeconds = 12 * 60; timerStart.textContent = 'БАСТА / START'; renderTimer();
  });

  const questions = [
    {q:'Сауатты хатта шәкіртақың жақында жойылады делінген. Алдымен нені тексересің?', kz:'A fluent email says your scholarship expires soon. What do you check first?', options:['Жіберуші мен мекенжайды сенімді арнадан тексеру / Check sender and destination through a trusted route','Грамматикасы мен логотипін қарау / Check grammar and logo','Тек сілтеме көрінісіне сену / Trust only the link preview'], answer:0, feedback:'Дұрыс. Сауатты мәтін мен логотипті көшіруге болады; жіберушіні тексеріп, тәуелсіз ресми арнаны қолдан.', fbkz:'A polished message and logo can be copied; verify the sender through an independent route.'},
    {q:'Корейше хабарлама сыйлық картасын сұрап, «тездет» дейді. Қауіпсіз әрекет қандай?', kz:'A Korean message asks for a gift card and says “hurry.” What is safest?', options:['Қысқа сілтемені басу / Tap the shortened link','Жіберушіні белгілі контакт арқылы тексеру / Verify through a known contact','Хабарды топтастарға тарату / Forward it to classmates'], answer:1, feedback:'Дұрыс. Асықтыру мен тосын төлем өтінішін тәуелсіз арнамен тексер.', fbkz:'Urgency and an unusual payment request deserve independent verification.'},
    {q:'Құпия сұхбатты аудару керек. Қауіпсіздеу таңдау қандай?', kz:'You need to translate a confidential interview. What is a safer choice?', options:['Кез келген тегін сайтқа салу / Paste it into any free site','Мақұлданған құралды қолданып, жеке деректі азайту / Use an approved tool and minimize identifiers','Құжатқа ашық сілтеме беру / Share a public document link'], answer:1, feedback:'Дәл солай. Оқу орнының ережесін ұстан, қолжетімділікті шекте, мүмкін болса жеке деректі алып таста.', fbkz:'Follow institutional policy, limit access, and remove identifiers where possible.'}
  ];
  let questionIndex = 0;
  let score = 0;
  const questionText = document.getElementById('questionText');
  const questionKz = document.getElementById('questionKz');
  const questionNumber = document.getElementById('questionNumber');
  const quizOptions = document.getElementById('quizOptions');
  const quizFeedback = document.getElementById('quizFeedback');
  const nextQuestion = document.getElementById('nextQuestion');
  const scoreValue = document.getElementById('scoreValue');
  const quizProgress = document.getElementById('quizProgress');
  function renderQuestion() {
    const item = questions[questionIndex];
    questionText.textContent = item.q;
    questionKz.textContent = item.kz;
    questionNumber.textContent = `СҰРАҚ ${String(questionIndex + 1).padStart(2, '0')} / QUESTION · 03`;
    quizProgress.style.width = `${((questionIndex + 1) / questions.length) * 100}%`;
    quizFeedback.innerHTML = ''; quizFeedback.className = 'quiz-feedback'; nextQuestion.disabled = true;
    nextQuestion.innerHTML = questionIndex === questions.length - 1 ? 'НӘТИЖЕНІ КӨРУ / RESULTS <span>→</span>' : 'КЕЛЕСІ СҰРАҚ / NEXT <span>→</span>';
    quizOptions.innerHTML = '';
    item.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.className = 'quiz-option'; button.type = 'button';
      button.innerHTML = `<span class="option-letter">0${index + 1}</span>${option}`;
      button.addEventListener('click', () => {
        const correct = index === item.answer;
        if (correct) score += 1;
        scoreValue.textContent = String(score).padStart(2, '0');
        [...quizOptions.children].forEach((optionButton, optionIndex) => {
          optionButton.disabled = true;
          if (optionIndex === item.answer) optionButton.classList.add('is-correct');
          else if (optionIndex === index) optionButton.classList.add('is-incorrect');
        });
        quizFeedback.classList.toggle('wrong', !correct);
        quizFeedback.innerHTML = `${correct ? '✓ ' : '↗ '}${item.feedback}<br><span class="en">${item.fbkz}</span>`;
        nextQuestion.disabled = false;
      });
      quizOptions.append(button);
    });
  }
  nextQuestion.addEventListener('click', () => {
    if (questionIndex < questions.length - 1) { questionIndex += 1; renderQuestion(); return; }
    if (questionIndex === questions.length - 1) {
      questionIndex = questions.length;
      questionNumber.textContent = 'САБАҚ АЯҚТАЛДЫ / SESSION COMPLETE';
      quizProgress.style.width = '100%';
      questionText.textContent = `${score} / 3 — ${score === 3 ? 'Өткір байқағыштық. Қауіпсіз дағды қалыптасты.' : score === 2 ? 'Жақсы байқадың. Әрі қарай да тексере бер.' : 'Қауіпсіз дағды бір сәт тоқтаудан басталады.'}`;
      questionKz.textContent = score === 3 ? 'Sharp eyes. Safer habits.' : score === 2 ? 'Good instincts. Keep verifying.' : 'Every safe habit starts with a pause.';
      quizOptions.innerHTML = '';
      quizFeedback.innerHTML = '<span class="safe-action"><span>ҚОРЫТЫНДЫ / TAKEAWAY</span><p>Тоқта · тексер · қорға. Күмәнді сілтемені емес, пайдалы ережені бөліс.<br><span class="en">Pause · verify · protect. Share the checklist, not suspicious links.</span></p></span>';
      nextQuestion.disabled = false;
      nextQuestion.innerHTML = 'ҚАЙТА ОЙНА / PLAY AGAIN <span>↻</span>';
      return;
    }
    questionIndex = 0; score = 0; scoreValue.textContent = '00'; renderQuestion();
  });
  renderQuestion();
  showSlide(0);
})();
