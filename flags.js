fetch("dataFlags.json")
  .then(response => response.json())
  .then(flags => {

    const container = document.getElementById("flags-container");
    const searchInput = document.getElementById("search");
    const typeFilter = document.getElementById("filter");
    const sortOrder = document.getElementById("sortOrder");
    const pagination = document.getElementById("pagination");
    const resultsInfo = document.getElementById("results-info");

    const ITEMS_PER_PAGE = 20;
    let currentPage = 1;
    let filteredFlags = [...flags];

    function normalize(text) {
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    }

    function displayFlags() {

      container.innerHTML = "";

      if (filteredFlags.length === 0) {
        container.innerHTML = "<p>Aucun résultat trouvé.</p>";
        if (pagination) pagination.innerHTML = "";
        if (resultsInfo) resultsInfo.textContent = "0 résultat trouvé";
        return;
      }

      if (resultsInfo) {
        resultsInfo.textContent =
          filteredFlags.length + " résultat(s) trouvé(s)";
      }

      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const pageItems = filteredFlags.slice(start, end);

      pageItems.forEach(flag => {

        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
          <img src="${flag.image}" alt="${flag.name}">
          <h3>${flag.name}</h3>
          <small>${flag.type}</small>
        `;

        card.style.cursor = "pointer";

        card.addEventListener("click", () => {
          window.location.href =
            "flag.html?name=" + encodeURIComponent(flag.name);
        });

        container.appendChild(card);
      });

      updatePagination();
    }

    function updatePagination() {

      if (!pagination) return;

      const totalPages = Math.ceil(filteredFlags.length / ITEMS_PER_PAGE);
      pagination.innerHTML = "";

      if (totalPages <= 1) return;

      const prevBtn = document.createElement("div");
      prevBtn.classList.add("page-btn");
      prevBtn.textContent = "←";
      prevBtn.onclick = () => {
        if (currentPage > 1) {
          currentPage--;
          displayFlags();
        }
      };

      const nextBtn = document.createElement("div");
      nextBtn.classList.add("page-btn");
      nextBtn.textContent = "→";
      nextBtn.onclick = () => {
        if (currentPage < totalPages) {
          currentPage++;
          displayFlags();
        }
      };

      const info = document.createElement("div");
      info.classList.add("page-info");
      info.textContent = `Page ${currentPage} / ${totalPages}`;

      pagination.appendChild(prevBtn);
      pagination.appendChild(info);
      pagination.appendChild(nextBtn);
    }

    function applyFilters() {

      const searchValue = searchInput
        ? normalize(searchInput.value)
        : "";

      const typeValue = typeFilter
        ? typeFilter.value
        : "all";

      const words = searchValue.split(" ").filter(w => w !== "");

      filteredFlags = flags.filter(flag => {

        const nameNormalized = normalize(flag.name);
        const typeNormalized = normalize(flag.type);

        const matchesAllWords = words.every(word =>
          nameNormalized.includes(word) ||
          typeNormalized.includes(word)
        );

        const matchType =
          typeValue === "all" ||
          flag.type === typeValue;

        return matchesAllWords && matchType;
      });

      // 🔠 TRI
      if (sortOrder) {
        if (sortOrder.value === "az") {
          filteredFlags.sort((a, b) =>
            a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
          );
        } else {
          filteredFlags.sort((a, b) =>
            b.name.localeCompare(a.name, "fr", { sensitivity: "base" })
          );
        }
      }

      currentPage = 1;
      displayFlags();
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }

    if (typeFilter) {
      typeFilter.addEventListener("change", applyFilters);
    }

    if (sortOrder) {
      sortOrder.addEventListener("change", applyFilters);
    }

    displayFlags();
  })
  .catch(error => {
    console.error("Erreur chargement JSON :", error);
  });