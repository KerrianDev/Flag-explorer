// flag.js

const params = new URLSearchParams(window.location.search);
const flagName = params.get("name");

fetch("dataFlags.json")
  .then(response => response.json())
  .then(flags => {

    const flag = flags.find(f => f.name === flagName);
    const container = document.getElementById("flag-detail");

    if (!flag) {
      container.innerHTML = "<p>Drapeau introuvable.</p>";
      return;
    }

    // Clé unique pour ce drapeau
    const storageKey = "downloads_" + flag.name;

    // Récupérer compteur existant
    let downloadCount = localStorage.getItem(storageKey);
    if (!downloadCount) {
      downloadCount = 0;
    }

    container.innerHTML = `
  <h1>${flag.name}</h1>
  <img src="${flag.image}" alt="${flag.name}">
  <p class="download-info">
    Téléchargements : ${downloadCount}
  </p>
  <button id="downloadBtn" class="download-btn">
    Télécharger l'image
  </button>
  <br>
  <a href="flags.html" class="back-link">⬅ Retour à la bibliothèque</a>
`;

    const downloadBtn = document.getElementById("downloadBtn");
    const counterDisplay = document.getElementById("downloadCounter");

    downloadBtn.addEventListener("click", () => {

      // Incrémenter compteur
      downloadCount++;
      localStorage.setItem(storageKey, downloadCount);

      if (window.opener && window.opener.updateGlobalCounter) {
        window.opener.updateGlobalCounter();
      }

      // Mettre à jour affichage
      counterDisplay.textContent =
        "Téléchargements : " + downloadCount;

      // Lancer téléchargement
      const link = document.createElement("a");
      link.href = flag.image;

      const fileName =
        flag.name.toLowerCase().replace(/\s+/g, "-") + "-flag.png";

      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  })
  .catch(error => {
    console.error("Erreur chargement JSON :", error);
  });