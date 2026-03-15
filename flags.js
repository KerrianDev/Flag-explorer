fetch("./dataFlags.json")
  .then(res => res.json())
  .then(data => {

    // =============================
    // FLATTEN JSON
    // =============================

    function flattenFlags(data) {
      const result = [];

      Object.entries(data).forEach(([continentName, countries]) => {
        Object.entries(countries).forEach(([countryName, countryData]) => {

          if (countryData.flag?.id) {
            result.push({
              id: countryData.flag.id,
              name: countryData.flag.name,
              type: countryData.flag.type,
              image: countryData.flag.image,
              continent: continentName,
              country: countryName
            });
          }

          Object.values(countryData.subdivisions || {}).forEach(list => {
            if (Array.isArray(list)) {
              list.forEach(sub => {
                if (sub?.id) {
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

        });
      });

      return result;
    }

    const flags = flattenFlags(data);

    // =============================
    // DOM ELEMENTS
    // =============================

    const container = document.getElementById("flags-container");
    const searchInput = document.getElementById("search");
    const continentFilter = document.getElementById("continentFilter");
    const countryFilter = document.getElementById("countryFilter");
    const typeFilter = document.getElementById("filter");
    const sortOrder = document.getElementById("sortOrder");
    const resultsInfo = document.getElementById("results-info");

    let filteredFlags = [...flags];
    let renderedItems = 0;
    const LOAD_BATCH = 80;

    // =============================
    // NORMALIZE
    // =============================

    function normalize(text) {
      return text
        ? text.toString().toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
        : "";
    }

    // =============================
    // FILTER UPDATE FUNCTIONS
    // =============================

    function updateContinentFilter(flagsSubset) {

      const current = continentFilter.value;
      continentFilter.innerHTML = "";

      const defaultOption = document.createElement("option");
      defaultOption.value = "all";
      defaultOption.textContent = "All Continents";
      continentFilter.appendChild(defaultOption);

      const counts = {};

      flagsSubset.forEach(flag => {
        counts[flag.continent] =
          (counts[flag.continent] || 0) + 1;
      });

      Object.entries(counts)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .forEach(([continent, count]) => {

          const option = document.createElement("option");
          option.value = continent;
          option.textContent = `${continent} (${count})`;
          continentFilter.appendChild(option);
        });

      if ([...continentFilter.options].some(o => o.value === current)) {
        continentFilter.value = current;
      } else {
        continentFilter.value = "all";
      }
    }

    function updateCountryFilter(flagsSubset) {

      const current = countryFilter.value;
      countryFilter.innerHTML = "";

      const defaultOption = document.createElement("option");
      defaultOption.value = "all";
      defaultOption.textContent = "All Countries";
      countryFilter.appendChild(defaultOption);

      const counts = {};

      flagsSubset.forEach(flag => {
        counts[flag.country] =
          (counts[flag.country] || 0) + 1;
      });

      Object.entries(counts)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .forEach(([country, count]) => {

          const option = document.createElement("option");
          option.value = country;
          option.textContent = `${country} (${count})`;
          countryFilter.appendChild(option);
        });

      if ([...countryFilter.options].some(o => o.value === current)) {
        countryFilter.value = current;
      } else {
        countryFilter.value = "all";
      }
    }

    function updateTypeFilter(flagsSubset) {

      const current = typeFilter.value;
      typeFilter.innerHTML = "";

      const defaultOption = document.createElement("option");
      defaultOption.value = "all";
      defaultOption.textContent = "All Types";
      typeFilter.appendChild(defaultOption);

      const counts = {};

      flagsSubset.forEach(flag => {
        counts[flag.type] =
          (counts[flag.type] || 0) + 1;
      });

      Object.entries(counts)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .forEach(([type, count]) => {

          const option = document.createElement("option");
          option.value = type;
          option.textContent = `${type} (${count})`;
          typeFilter.appendChild(option);
        });

      if ([...typeFilter.options].some(o => o.value === current)) {
        typeFilter.value = current;
      } else {
        typeFilter.value = "all";
      }
    }

    // =============================
    // DISPLAY FLAGS (INFINITE SCROLL)
    // =============================

    function appendFlags() {

      const nextItems =
        filteredFlags.slice(renderedItems,
                            renderedItems + LOAD_BATCH);

      nextItems.forEach(flag => {

        const card = document.createElement("div");
        card.classList.add("card");
        card.style.cursor = "pointer";

        const img = document.createElement("img");
        img.src = flag.image;
        img.alt = flag.name;
        img.loading = "lazy";

        const title = document.createElement("h3");
        title.textContent = flag.name;

        const type = document.createElement("small");
        type.textContent = flag.type;

        card.append(img, title, type);

        card.addEventListener("click", () => {
          window.location.href =
            "flag.html?id=" + encodeURIComponent(flag.id);
        });

        container.appendChild(card);
      });

      renderedItems += LOAD_BATCH;
    }

    function resetDisplay() {
      container.innerHTML = "";
      renderedItems = 0;
      appendFlags();
    }

    // =============================
    // APPLY FILTERS
    // =============================

    function applyFilters() {

      const searchValue =
        normalize(searchInput.value.trim());

      const continentValue = continentFilter.value;
      const countryValue = countryFilter.value;
      const typeValue = typeFilter.value;

      const words =
        searchValue.split(" ").filter(w => w);

      filteredFlags = flags.filter(flag => {

        const nameNormalized = normalize(flag.name);
        const typeNormalized = normalize(flag.type);

        const matchesSearch =
          words.length === 0 ||
          words.every(word =>
            nameNormalized.includes(word) ||
            typeNormalized.includes(word)
          );

        const matchesContinent =
          continentValue === "all" ||
          flag.continent === continentValue;

        const matchesCountry =
          countryValue === "all" ||
          flag.country === countryValue;

        const matchesType =
          typeValue === "all" ||
          flag.type === typeValue;

        return matchesSearch &&
               matchesContinent &&
               matchesCountry &&
               matchesType;
      });

      if (sortOrder.value === "az") {
        filteredFlags.sort((a, b) =>
          a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
        );
      } else {
        filteredFlags.sort((a, b) =>
          b.name.localeCompare(a.name, "fr", { sensitivity: "base" })
        );
      }

      resultsInfo.textContent =
        `${filteredFlags.length} résultat(s) trouvé(s)`;

      resetDisplay();
    }

    // =============================
    // EVENTS
    // =============================

    searchInput.addEventListener("input", applyFilters);

    continentFilter.addEventListener("change", () => {

      const subset =
        continentFilter.value === "all"
          ? flags
          : flags.filter(f =>
              f.continent === continentFilter.value
            );

      updateCountryFilter(subset);
      updateTypeFilter(subset);
      applyFilters();
    });

    countryFilter.addEventListener("change", () => {

      const subset =
        countryFilter.value === "all"
          ? flags
          : flags.filter(f =>
              f.country === countryFilter.value
            );

      updateTypeFilter(subset);
      applyFilters();
    });

    typeFilter.addEventListener("change", applyFilters);
    sortOrder.addEventListener("change", applyFilters);

    window.addEventListener("scroll", () => {
      if (window.innerHeight + window.scrollY
          >= document.body.offsetHeight - 400) {
        if (renderedItems < filteredFlags.length) {
          appendFlags();
        }
      }
    });

    // =============================
    // INIT
    // =============================

    updateContinentFilter(flags);
    updateCountryFilter(flags);
    updateTypeFilter(flags);

    resultsInfo.textContent =
      `${flags.length} résultat(s) trouvé(s)`;

    resetDisplay();

  })
  .catch(error => {
    console.error("Erreur chargement JSON :", error);
  });