// global.js

function updateGlobalCounter() {

  let total = 0;

  // Parcourt tout le localStorage
  for (let i = 0; i < localStorage.length; i++) {

    const key = localStorage.key(i);

    // On ne prend que les clés downloads_
    if (key.startsWith("downloads_")) {

      const value = parseInt(localStorage.getItem(key));
      total += value;
    }
  }

  const counterElement = document.getElementById("globalCounter");

  if (counterElement) {
    counterElement.textContent =
      "🌍 Total Downloads : " + total;
  }
}

// Mise à jour au chargement
updateGlobalCounter();