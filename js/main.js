/* ============================================================
   ECO-LIEUTIQUE — Scripts front-end
   Menu mobile, slider domaines, apparition au scroll, année
   ============================================================ */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    /* ---------- Menu mobile (burger) ---------- */
    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('primary-nav');

    function closeMenu() {
      if (!nav || !toggle) return;
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Ouvrir le menu');
    }

    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var isOpen = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
      });

      nav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeMenu);
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
      });
    }

    /* ---------- Slider domaines d'activité ---------- */
    var slider = document.querySelector('[data-slider]');
    if (slider) {
      var track = slider.querySelector('[data-track]');
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-slide]'));
      var dotsWrap = slider.querySelector('[data-dots]');
      var prevBtn = slider.querySelector('[data-prev]');
      var nextBtn = slider.querySelector('[data-next]');
      var index = 0;
      var autoplayMs = 6500;
      var timer = null;
      var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      function goTo(nextIndex) {
        if (!slides.length) return;
        index = (nextIndex + slides.length) % slides.length;
        track.style.transform = 'translateX(-' + (index * 100) + '%)';

        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
          slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
        });

        if (dotsWrap) {
          Array.prototype.forEach.call(dotsWrap.children, function (dot, i) {
            var active = i === index;
            dot.classList.toggle('is-active', active);
            dot.setAttribute('aria-selected', String(active));
          });
        }
      }

      function buildDots() {
        if (!dotsWrap) return;
        dotsWrap.innerHTML = '';
        slides.forEach(function (slide, i) {
          var title = slide.querySelector('h4');
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'slider-dot' + (i === 0 ? ' is-active' : '');
          btn.setAttribute('role', 'tab');
          btn.setAttribute('aria-label', title ? title.textContent : ('Domaine ' + (i + 1)));
          btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
          btn.addEventListener('click', function () {
            goTo(i);
            restartAutoplay();
          });
          dotsWrap.appendChild(btn);
        });
      }

      function startAutoplay() {
        if (reduceMotion || slides.length < 2) return;
        stopAutoplay();
        timer = window.setInterval(function () {
          goTo(index + 1);
        }, autoplayMs);
      }

      function stopAutoplay() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      function restartAutoplay() {
        stopAutoplay();
        startAutoplay();
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', function () {
          goTo(index - 1);
          restartAutoplay();
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', function () {
          goTo(index + 1);
          restartAutoplay();
        });
      }

      slider.addEventListener('mouseenter', stopAutoplay);
      slider.addEventListener('mouseleave', startAutoplay);
      slider.addEventListener('focusin', stopAutoplay);
      slider.addEventListener('focusout', function (e) {
        if (!slider.contains(e.relatedTarget)) startAutoplay();
      });

      // Swipe tactile léger
      var touchStartX = 0;
      track.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoplay();
      }, { passive: true });
      track.addEventListener('touchend', function (e) {
        var delta = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(delta) > 40) {
          goTo(delta < 0 ? index + 1 : index - 1);
        }
        startAutoplay();
      }, { passive: true });

      buildDots();
      goTo(0);
      startAutoplay();
    }

    /* ---------- Quiz sensibilisation ---------- */
    (function initQuiz() {
      var root = document.getElementById('eco-quiz');
      if (!root) return;

      var panel = root.querySelector('[data-quiz-panel]');
      var progressEl = root.querySelector('[data-quiz-progress]');
      var stepEl = root.querySelector('[data-quiz-step]');
      var totalEl = root.querySelector('[data-quiz-total]');

      var questions = [
        {
          type: 'Scénario',
          prompt: 'Un pêcheur partenaire perd une partie de sa prise faute de conservation. Que prioriser en premier ?',
          choices: [
            { text: 'Lui fournir des solutions de conservation (glace, fumage, froid)', correct: true },
            { text: 'Lui demander de sortir plus souvent en mer', correct: false },
            { text: 'Baisser le prix d’achat pour compenser', correct: false }
          ],
          explainOk: 'Sans conservation, la prise perd sa valeur. Équiper avant d’augmenter l’effort de pêche.',
          explainKo: 'Pêcher davantage ne règle pas les pertes. La priorité, c’est de préserver et valoriser ce qui est déjà capturé.'
        },
        {
          type: 'Scénario',
          prompt: 'Une communauté côtière voit ses mangroves disparaître. Quel enjeu pour ECO-LIEUTIQUE ?',
          choices: [
            { text: 'Un sujet secondaire : seuls les bateaux comptent', correct: false },
            { text: 'Un enjeu central : les mangroves abritent la ressource et protègent le littoral', correct: true },
            { text: 'Un problème uniquement touristique', correct: false }
          ],
          explainOk: 'Mangroves et récifs soutiennent la biodiversité — et donc la pêche de demain.',
          explainKo: 'Sans habitats sains, la ressource baisse. Sensibiliser et protéger fait partie du métier.'
        },
        {
          type: 'Scénario',
          prompt: 'Un hôtel cherche du poisson régulier et de qualité. Que manque-t-il souvent côté pêche artisanale ?',
          choices: [
            { text: 'Uniquement plus de filets', correct: false },
            { text: 'Une chaîne organisée : collecte, conservation, commercialisation', correct: true },
            { text: 'Arrêter la formation des pêcheurs', correct: false }
          ],
          explainOk: 'Du bateau au client, il faut une organisation. C’est tout le modèle ECO-LIEUTIQUE.',
          explainKo: 'Le marché demande fiabilité et qualité — pas seulement plus d’engins de pêche.'
        },
        {
          type: 'Vrai / Faux',
          prompt: '« Plus on pêche, plus les revenus des pêcheurs augmentent forcément. »',
          choices: [
            { text: 'Vrai', correct: false },
            { text: 'Faux', correct: true }
          ],
          explainOk: 'Sans accès au marché ni conservation, la prise se perd ou se vend mal. Le volume ne suffit pas.',
          explainKo: 'Faux : sans valorisation et débouchés, pêcher plus n’améliore pas durablement les revenus.'
        },
        {
          type: 'Vrai / Faux',
          prompt: '« Former les pêcheurs aux bonnes pratiques aide à la fois les revenus et la mer. »',
          choices: [
            { text: 'Vrai', correct: true },
            { text: 'Faux', correct: false }
          ],
          explainOk: 'Sécurité, meilleures pratiques et respect de la ressource : la formation sert les hommes et l’écosystème.',
          explainKo: 'La formation n’est pas un luxe : elle renforce les compétences et protège la ressource.'
        },
        {
          type: 'Association',
          prompt: 'Cette image correspond à quel domaine d’activité ?',
          image: 'assets/im9.jpg',
          imageAlt: 'Poisson fumé et séché sur des baguettes',
          choices: [
            { text: 'Pêche durable', correct: false },
            { text: 'Conservation & transformation', correct: true },
            { text: 'Sensibilisation environnementale', correct: false }
          ],
          explainOk: 'Fumage et séchage : on prolonge la valeur du poisson après la prise.',
          explainKo: 'Ici, c’est la transformation / conservation — pas la sortie en mer ni la biodiversité.'
        }
      ];

      var index = 0;
      var score = 0;
      var answered = false;

      if (totalEl) totalEl.textContent = String(questions.length);

      function updateProgress() {
        var pct = ((index) / questions.length) * 100;
        if (progressEl) progressEl.style.width = pct + '%';
        if (stepEl) stepEl.textContent = String(Math.min(index + 1, questions.length));
      }

      function renderQuestion() {
        answered = false;
        updateProgress();
        var q = questions[index];
        var html = '';
        html += '<span class="quiz-type">' + q.type + '</span>';
        html += '<h3 class="quiz-question">' + q.prompt + '</h3>';

        if (q.image) {
          html += '<div class="quiz-match">';
          html += '<div class="quiz-match-img"><img src="' + q.image + '" alt="' + (q.imageAlt || '') + '"></div>';
          html += '<p class="muted" style="margin:0">Reliez l’image au bon domaine.</p>';
          html += '</div>';
        }

        html += '<div class="quiz-choices" role="group" aria-label="Réponses possibles">';
        q.choices.forEach(function (choice, i) {
          html += '<button type="button" class="quiz-choice" data-choice="' + i + '">' + choice.text + '</button>';
        });
        html += '</div>';
        html += '<div data-quiz-feedback></div>';
        html += '<div class="quiz-actions" data-quiz-actions hidden></div>';

        panel.innerHTML = html;

        panel.querySelectorAll('[data-choice]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            onAnswer(Number(btn.getAttribute('data-choice')));
          });
        });
      }

      function onAnswer(choiceIndex) {
        if (answered) return;
        answered = true;
        var q = questions[index];
        var buttons = panel.querySelectorAll('[data-choice]');
        var correctIndex = -1;

        q.choices.forEach(function (c, i) {
          if (c.correct) correctIndex = i;
        });

        var isCorrect = q.choices[choiceIndex] && q.choices[choiceIndex].correct;
        if (isCorrect) score += 1;

        buttons.forEach(function (btn, i) {
          btn.disabled = true;
          if (i === correctIndex) btn.classList.add(i === choiceIndex ? 'is-correct' : 'is-missed');
          else if (i === choiceIndex) btn.classList.add('is-wrong');
        });

        var feedback = panel.querySelector('[data-quiz-feedback]');
        if (feedback) {
          feedback.innerHTML =
            '<div class="quiz-feedback ' + (isCorrect ? 'is-ok' : 'is-ko') + '">' +
            '<p><strong>' + (isCorrect ? 'Bien vu.' : 'Pas tout à fait.') + '</strong> ' +
            (isCorrect ? q.explainOk : q.explainKo) +
            '</p></div>';
        }

        var actions = panel.querySelector('[data-quiz-actions]');
        if (actions) {
          actions.hidden = false;
          var nextLabel = index === questions.length - 1 ? 'Voir mon résultat' : 'Continuer';
          actions.innerHTML = '<button type="button" class="btn btn-primary" data-quiz-next>' + nextLabel + '</button>';
          actions.querySelector('[data-quiz-next]').addEventListener('click', function () {
            index += 1;
            if (index >= questions.length) renderResult();
            else renderQuestion();
          });
        }
      }

      function renderResult() {
        if (progressEl) progressEl.style.width = '100%';
        if (stepEl) stepEl.textContent = String(questions.length);

        var title;
        var message;
        if (score >= 5) {
          title = 'Vous avez le réflexe ECO-LIEUTIQUE';
          message = 'Mer, pêcheurs, conservation, marché : vous voyez la chaîne complète. On avance ensemble ?';
        } else if (score >= 3) {
          title = 'Bon regard — encore un peu de terrain';
          message = 'Vous tenez l’essentiel. La suite, c’est de relier concrètement pêche durable, valorisation et communautés.';
        } else {
          title = 'Un bon point de départ';
          message = 'La pêche durable, ce n’est pas seulement sortir en mer : c’est aussi conserver, vendre juste et protéger les habitats.';
        }

        panel.innerHTML =
          '<div class="quiz-result">' +
          '<p class="quiz-result-score"><span>' + score + '</span> / ' + questions.length + '</p>' +
          '<h3>' + title + '</h3>' +
          '<p>' + message + '</p>' +
          '<div class="quiz-actions" style="justify-content:center">' +
          '<a class="btn btn-primary" href="#contact">Nous contacter</a>' +
          '<button type="button" class="btn quiz-restart" data-quiz-restart>Recommencer</button>' +
          '</div></div>';

        var restart = panel.querySelector('[data-quiz-restart]');
        if (restart) {
          restart.addEventListener('click', function () {
            index = 0;
            score = 0;
            renderQuestion();
          });
        }
      }

      renderQuestion();
    })();

    /* ---------- Apparition au scroll (IntersectionObserver) ---------- */
    var revealEls = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window && revealEls.length) {
      var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      revealEls.forEach(function (el) { observer.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }

    /* ---------- Année dynamique du footer ---------- */
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

  });
})();
