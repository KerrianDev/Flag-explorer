fetch("dataFlags.json")
  .then(res => res.json())
  .then(data => {

    // ===== FLATTEN JSON =====

    function flattenFlags(data) {
      const result = [];

      Object.entries(data).forEach(([continentName, countries]) => {

        Object.entries(countries).forEach(([countryName, countryData]) => {

          // Flag principal
          if (countryData.flag && countryData.flag.id) {
            result.push({
              id: countryData.flag.id,
              name: countryData.flag.name,
              type: countryData.flag.type,
              image: countryData.flag.image,
              continent: continentName,
              country: countryName
            });
          }

          // Subdivisions
          if (countryData.subdivisions) {
            Object.entries(countryData.subdivisions).forEach(([subType, subList]) => {

              if (Array.isArray(subList)) {
                subList.forEach(sub => {
                  if (sub && sub.id) {
                    result.push({
                      id: sub.id,
                      name: sub.name,
                      type: sub.type,
                      image: sub.image,
                      continent: continentName,
                      country: countryName
                    });
                  }
                });
              }

            });
          }

        });

      });

      return result;
    }

    const flags = flattenFlags(data);

    // ===== DOM =====

    const container = document.getElementById("flags-container");
    const searchInput = document.getElementById("search");
    const typeFilter = document.getElementById("filter");
    const sortOrder = document.getElementById("sortOrder");
    const pagination = document.getElementById("pagination");
    const resultsInfo = document.getElementById("results-info");

    const ITEMS_PER_PAGE = 80;
    let currentPage = 1;
    let filteredFlags = [...flags];

    // ===== NORMALIZE SAFE =====

    function normalize(text) {
      if (!text) return "";
      return text
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    }

    // ===== GENERER TYPES DYNAMIQUES TRIÉS =====

    const types = [...new Set(flags.map(f => f.type))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    types.forEach(type => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      typeFilter.appendChild(option);
    });

    // ===== DISPLAY =====

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
            "flag.html?id=" + encodeURIComponent(flag.id);
        });

        container.appendChild(card);
      });

      updatePagination();
    }

    // ===== PAGINATION =====

    function updatePagination() {

      if (!pagination) return;

      const totalPages = Math.ceil(filteredFlags.length / ITEMS_PER_PAGE);
      pagination.innerHTML = "";

      if (totalPages <= 1) return;

      const prevBtn = document.createElement("button");
      prevBtn.textContent = "←";
      prevBtn.disabled = currentPage === 1;
      prevBtn.onclick = () => {
        if (currentPage > 1) {
          currentPage--;
          displayFlags();
        }
      };
      pagination.appendChild(prevBtn);

      const maxVisible = 5;
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisible - 1);

      if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.textContent = i;
        if (i === currentPage) {
          pageBtn.classList.add("active-page");
        }
        pageBtn.onclick = () => {
          currentPage = i;
          displayFlags();
        };
        pagination.appendChild(pageBtn);
      }

      const nextBtn = document.createElement("button");
      nextBtn.textContent = "→";
      nextBtn.disabled = currentPage === totalPages;
      nextBtn.onclick = () => {
        if (currentPage < totalPages) {
          currentPage++;
          displayFlags();
        }
      };
      pagination.appendChild(nextBtn);
    }

    // ===== FILTERS =====

    function applyFilters() {

      const searchValue = searchInput
        ? normalize(searchInput.value.trim())
        : "";

      const typeValue = typeFilter
        ? typeFilter.value
        : "all";

      const words = searchValue.split(" ").filter(w => w !== "");

      filteredFlags = flags.filter(flag => {

        if (!flag || !flag.name || !flag.type) return false;

        const nameNormalized = normalize(flag.name);
        const typeNormalized = normalize(flag.type);

        const matchesSearch =
          words.length === 0 ||
          words.every(word =>
            nameNormalized.includes(word) ||
            typeNormalized.includes(word)
          );

        const matchesType =
          typeValue === "all" ||
          flag.type === typeValue;

        return matchesSearch && matchesType;
      });

      // TRI
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

    // ===== EVENTS =====

    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }

    if (typeFilter) {
      typeFilter.addEventListener("change", applyFilters);
    }

    if (sortOrder) {
      sortOrder.addEventListener("change", applyFilters);
    }

    // ===== INIT =====

    displayFlags();

  })
  .catch(error => {
    console.error("Erreur chargement JSON :", error);
  });