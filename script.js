let offres = [];
let radarChart;
let wishlist = [];

async function chargerOffres() {
  const response = await fetch("data.json");
  offres = await response.json();
  afficherOffres(offres);
}

function afficherOffres(data) {
  const container = document.getElementById("offres");
  container.innerHTML = "";
  data.forEach(o => {
    const div = document.createElement("div");
    div.className = "carte";
    div.innerHTML = `
      <h3>${o.title}</h3>
      <p>Deadline : ${o.deadline}</p>
      <p>Tags : ${o.tags.join(", ")}</p>
      <a href="${o.url}" target="_blank">Voir plus</a>
      <button onclick="ajouterWishlist('${o.title}')">Ajouter à ma sélection</button>
    `;
    container.appendChild(div);
  });
}

function ajouterWishlist(title) {
  const offre = offres.find(o => o.title === title);
  if (!wishlist.includes(offre)) {
    wishlist.push(offre);
    afficherWishlist();
  }
}

function afficherWishlist() {
  const container = document.getElementById("wishlist");
  container.innerHTML = "";
  wishlist.forEach(o => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${o.title}</strong> - <em>${o.deadline}</em>`;
    container.appendChild(div);
  });
}

function viderWishlist() {
  wishlist = [];
  afficherWishlist();
}

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;
  doc.setFontSize(14);
  doc.text("Ma sélection d'offres", 10, y);
  y += 10;
  wishlist.forEach(o => {
    doc.setFontSize(12);
    doc.text(`- ${o.title} (${o.deadline}) - ${o.url}`, 10, y);
    y += 10;
  });
  doc.save("wishlist.pdf");
}

function calculerScores() {
  const scores = {
    structuration: parseInt(document.getElementById("maturite").value),
    modele_eco: parseInt(document.getElementById("modele_eco").value),
    financement: 0,
    accompagnement: 0,
    visibilite: 0,
    partenaires: 0
  };

  const selectBesoins = document.getElementById("besoins");
  const selected = Array.from(selectBesoins.selectedOptions).map(o => o.value);
  selected.forEach(b => {
    if (b === "financement") scores.financement += 5;
    if (b === "accompagnement") scores.accompagnement += 5;
    if (b === "visibilite") scores.visibilite += 5;
    if (b === "partenaires") scores.partenaires += 5;
  });

  if (document.getElementById("deja").value === "oui") {
    scores.financement = Math.min(scores.financement, 7);
  }

  const urgence = parseInt(document.getElementById("urgence").value);
  for (let key in scores) scores[key] += urgence;

  return scores;
}

function afficherRadar(scores) {
  const ctx = document.getElementById('radarChart').getContext('2d');
  const data = {
    labels: Object.keys(scores),
    datasets: [{
      label: 'Diagnostic projet',
      data: Object.values(scores),
      fill: true,
      backgroundColor: 'rgba(75,192,192,0.2)',
      borderColor: 'rgba(75,192,192,1)',
      pointBackgroundColor: 'rgba(75,192,192,1)'
    }]
  };
  if (radarChart) radarChart.destroy();
  radarChart = new Chart(ctx, { type: 'radar', data: data });
}

function genererSynthese(scores) {
  let texte = "<h4>Synthèse rapide :</h4><ul>";
  for (let key in scores) {
    if (scores[key] > 7) texte += `<li>${key}: ✅ point fort</li>`;
    else if (scores[key] >= 4) texte += `<li>${key}: ⚠️ à consolider</li>`;
    else texte += `<li>${key}: ❌ faible</li>`;
  }
  texte += "</ul>";
  document.getElementById("synthese").innerHTML = texte;
}

function filtrerOffres(scores) {
  return offres.filter(o => o.tags.some(tag => Object.keys(scores).includes(tag) && scores[tag] >= 5));
}

// Event listeners
document.getElementById("btnValider").addEventListener("click", () => {
  const scores = calculerScores();
  afficherRadar(scores);
  genererSynthese(scores);
});

document.getElementById("btnFiltrer").addEventListener("click", () => {
  const scores = calculerScores();
  const filtres = filtrerOffres(scores);
  afficherOffres(filtres);
});

document.getElementById("btnExportPDF").addEventListener("click", exportPDF);
document.getElementById("btnViderWishlist").addEventListener("click", viderWishlist);

window.onload = chargerOffres;
