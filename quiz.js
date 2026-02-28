fetch("dataFlags.json")
  .then(res => res.json())
  .then(flags => {

    // ===== ELEMENTS DOM =====

    const startBtn = document.getElementById("startBtn");
    const modeSelect = document.getElementById("modeSelect");
    const difficultySelect = document.getElementById("difficultySelect");
    const typeSelect = document.getElementById("typeSelect");

    const quizContainer = document.getElementById("quiz-container");
    const flagImg = document.getElementById("quiz-flag");
    const answersBox = document.getElementById("answers");

    const scoreDisplay = document.getElementById("score");
    const streakDisplay = document.getElementById("streak");
    const timerDisplay = document.getElementById("timer");
    const bestScoreDisplay = document.getElementById("bestScore");
    const collectionDisplay = document.getElementById("collectionProgress");

    // ===== STATS GLOBALES =====

    let totalGames = parseInt(localStorage.getItem("totalGames")) || 0;
    let totalCorrect = parseInt(localStorage.getItem("totalCorrect")) || 0;
    let totalWrong = parseInt(localStorage.getItem("totalWrong")) || 0;
    let bestStreak = parseInt(localStorage.getItem("bestStreak")) || 0;

    // ===== COLLECTION =====

    let discovered =
      JSON.parse(localStorage.getItem("discoveredFlags")) || [];

    function updateCollection() {

        // IDs valides actuels
        const validIds = flags.map(f => f.id);

        // On garde uniquement les IDs encore existants
        discovered = discovered.filter(id => validIds.includes(id));

         // On resauvegarde proprement
         localStorage.setItem(
        "discoveredFlags",
      JSON.stringify(discovered)
     );

  collectionDisplay.textContent =
    discovered.length + " / " + flags.length;
}

    // ===== GENERER TYPES =====

    const types = [...new Set(flags.map(f => f.type))];

    types.forEach(type => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      typeSelect.appendChild(option);
    });

    // ===== VARIABLES QUIZ =====

    let score = 0;
    let streak = 0;
    let timer = 60;
    let interval = null;
    let currentBestKey = null;

    // ===== UTIL =====

    function shuffle(arr) {
      return arr.sort(() => Math.random() - 0.5);
    }

    function getFilteredFlags() {
      const type = typeSelect.value;
      if (type === "all") return flags;
      return flags.filter(f => f.type === type);
    }

    // ===== SAUVEGARDE CLASSEMENT GLOBAL =====

    function saveQuizScore(name, scoreValue) {

      const scores =
        JSON.parse(localStorage.getItem("quizScores")) || [];

      scores.push({
        name: name || "Anonyme",
        score: scoreValue,
        date: new Date().toISOString()
      });

      localStorage.setItem("quizScores", JSON.stringify(scores));
    }

    // ===== FIN DE PARTIE =====

    function endGame() {

      if (interval) clearInterval(interval);

      const playerName = prompt("Entrez votre nom pour le classement :");

      saveQuizScore(playerName, score);

      alert("Partie terminée ! Score final : " + score);

      quizContainer.style.display = "none";
    }

    // ===== QUESTION =====

    function newQuestion(flagPool, numberOfChoices) {

      const correct =
        flagPool[Math.floor(Math.random() * flagPool.length)];

      flagImg.src = correct.image;

      const wrong = shuffle(
        flagPool.filter(f => f.id !== correct.id)
      ).slice(0, numberOfChoices - 1);

      const options = shuffle([correct, ...wrong]);

      answersBox.innerHTML = "";

      options.forEach(option => {

        const btn = document.createElement("div");
        btn.classList.add("answer-btn");
        btn.textContent = option.name;

        btn.onclick = () => {

          if (option.id === correct.id) {

            btn.classList.add("correct");

            score++;
            streak++;
            totalCorrect++;

            if (!discovered.includes(correct.id)) {

                discovered.push(correct.id);

                localStorage.setItem(
                 "discoveredFlags",
                 JSON.stringify(discovered)
                 );

                 updateCollection(); // ← AJOUT IMPORTANT
            }

            if (streak > bestStreak) {
              bestStreak = streak;
              localStorage.setItem("bestStreak", bestStreak);
            }

          } else {

            btn.classList.add("wrong");
            streak = 0;
            totalWrong++;
          }

          localStorage.setItem("totalCorrect", totalCorrect);
          localStorage.setItem("totalWrong", totalWrong);

          scoreDisplay.textContent = score;
          streakDisplay.textContent = streak;

          setTimeout(() => {

            if (modeSelect.value === "normal") {
              newQuestion(flagPool, numberOfChoices);
            } else if (timer > 0) {
              newQuestion(flagPool, numberOfChoices);
            }

          }, 600);
        };

        answersBox.appendChild(btn);
      });
    }

    // ===== TIMER =====

    function startTimer(flagPool, numberOfChoices) {

      timer = 60;
      timerDisplay.textContent = timer;

      interval = setInterval(() => {

        timer--;
        timerDisplay.textContent = timer;

        if (timer <= 0) {
          endGame();
        }

      }, 1000);

      newQuestion(flagPool, numberOfChoices);
    }

    // ===== START QUIZ =====

    startBtn.onclick = () => {

      score = 0;
      streak = 0;

      scoreDisplay.textContent = 0;
      streakDisplay.textContent = 0;

      totalGames++;
      localStorage.setItem("totalGames", totalGames);

      const flagPool = getFilteredFlags();
      const numberOfChoices =
        parseInt(difficultySelect.value);

      currentBestKey =
        "bestScore_" +
        modeSelect.value +
        "_" +
        difficultySelect.value;

      let bestScore =
        parseInt(localStorage.getItem(currentBestKey)) || 0;

      bestScoreDisplay.textContent = bestScore;

      quizContainer.style.display = "block";

      if (modeSelect.value === "timed") {
        startTimer(flagPool, numberOfChoices);
      } else {
        timerDisplay.textContent = "--";
        newQuestion(flagPool, numberOfChoices);
      }

      updateCollection();
    };

  });