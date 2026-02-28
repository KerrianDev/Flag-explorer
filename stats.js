// ===== CLASSEMENT TÉLÉCHARGEMENTS =====

function loadDownloadRanking() {

  const rankingContainer = document.getElementById("downloadRanking");
  rankingContainer.innerHTML = "";

  const downloads = [];

  for (let key in localStorage) {
    if (key.startsWith("downloads_")) {
      const name = key.replace("downloads_", "");
      const value = parseInt(localStorage.getItem(key)) || 0;

      if (value > 0) {
        downloads.push({ name, value });
      }
    }
  }

  downloads.sort((a, b) => b.value - a.value);

  if (downloads.length === 0) {
    rankingContainer.innerHTML = "<p>Aucun téléchargement pour le moment.</p>";
    return;
  }

  downloads.slice(0, 10).forEach((item, index) => {

    const medal =
      index === 0 ? "🥇" :
      index === 1 ? "🥈" :
      index === 2 ? "🥉" : "";

    const row = document.createElement("div");
    row.classList.add("ranking-row");

    row.innerHTML = `
      <span class="rank">${medal} ${index + 1}</span>
      <span class="rank-name">${item.name}</span>
      <span class="rank-value">${item.value} téléchargements</span>
    `;

    rankingContainer.appendChild(row);
  });
}

// ===== CLASSEMENT QUIZ =====

function loadQuizRanking() {

  const rankingContainer = document.getElementById("quizRanking");
  rankingContainer.innerHTML = "";

  const scores =
    JSON.parse(localStorage.getItem("quizScores")) || [];

  scores.sort((a, b) => b.score - a.score);

  if (scores.length === 0) {
    rankingContainer.innerHTML = "<p>Aucun score enregistré.</p>";
    return;
  }

  scores.slice(0, 10).forEach((player, index) => {

    const medal =
      index === 0 ? "🥇" :
      index === 1 ? "🥈" :
      index === 2 ? "🥉" : "";

    const row = document.createElement("div");
    row.classList.add("ranking-row");

    row.innerHTML = `
      <span class="rank">${medal} ${index + 1}</span>
      <span class="rank-name">${player.name}</span>
      <span class="rank-value">${player.score} pts</span>
    `;

    rankingContainer.appendChild(row);
  });
}
// ===== STATS GLOBALES =====

function loadGlobalStats() {

  const container = document.getElementById("stats-container");

  const totalGames = parseInt(localStorage.getItem("totalGames")) || 0;
  const totalCorrect = parseInt(localStorage.getItem("totalCorrect")) || 0;
  const totalWrong = parseInt(localStorage.getItem("totalWrong")) || 0;
  const bestStreak = parseInt(localStorage.getItem("bestStreak")) || 0;

  const totalAnswers = totalCorrect + totalWrong;

  const accuracy =
    totalAnswers > 0
      ? ((totalCorrect / totalAnswers) * 100).toFixed(1)
      : 0;

  container.innerHTML = `
    <div class="ranking-row">
      <span>🎮 Parties jouées</span>
      <span>${totalGames}</span>
    </div>

    <div class="ranking-row">
      <span>✅ Réponses correctes</span>
      <span>${totalCorrect}</span>
    </div>

    <div class="ranking-row">
      <span>❌ Réponses incorrectes</span>
      <span>${totalWrong}</span>
    </div>

    <div class="ranking-row">
      <span>📈 Taux de réussite</span>
      <span>${accuracy}%</span>
    </div>

    <div class="ranking-row">
      <span>🔥 Meilleure série</span>
      <span>${bestStreak}</span>
    </div>
  `;
}

loadGlobalStats();

loadDownloadRanking();
loadQuizRanking();