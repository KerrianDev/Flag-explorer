fetch("./dataFlags.json")
  .then(res => res.json())
  .then(data => {

    // ===== Flatten identique à flags.js =====

    function flattenFlags(data) {
      const result = [];

      Object.entries(data).forEach(([continentName, countries]) => {

        Object.entries(countries).forEach(([countryName, countryData]) => {

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

    // ===== Récupérer ID dans URL =====

    const params = new URLSearchParams(window.location.search);
    const flagId = params.get("id");

    if (!flagId) {
      document.body.innerHTML = "<h2>No Flag Selected</h2>";
      return;
    }

    const flag = flags.find(f => f.id === flagId);

    if (!flag) {
      document.body.innerHTML = "<h2>No Flag For Now</h2>";
      return;
    }

    // ===== Affichage =====

    const container = document.getElementById("flag-detail");

    container.innerHTML = `
  <div class="flag-detail-card">
    <img src="${encodeURI(flag.image)}" alt="${flag.name}" class="flag-detail-image">

    <h1>${flag.name}</h1>

    <div class="flag-meta">
      <p><strong>Type :</strong> ${flag.type}</p>
      <p><strong>Country :</strong> ${flag.country}</p>
      <p><strong>Continent :</strong> ${flag.continent}</p>
    </div>

    <div class="flag-actions">
      <a href="${encodeURI(flag.image)}" download class="download-btn">
        ⬇ DOWNLOAD
      </a>

      <button onclick="history.back()" class="back-btn">
        ← Back
      </button>
    </div>
  </div>
`;

  })
  .catch(error => {
    console.error("Error Loading JSON", error);
  });