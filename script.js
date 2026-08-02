console.log("Bienvenue chez Les Assaisonnements L'Impérial !");

// ============================================================
// SAISON FORCÉE : laisse "" pour automatique selon la date.
// Pour forcer une saison manuellement, écris l'une de ces valeurs :
// "noel", "nouvel_an", "valentin", "paques"
// Exemple : const SAISON_FORCEE = "noel";
// ============================================================
const SAISON_FORCEE = "valentin";

const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");

hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});
document.addEventListener("click", (event) => {
  const clicDansMenu = navMenu.contains(event.target);
  const clicSurHamburger = hamburger.contains(event.target);

  if (!clicDansMenu && !clicSurHamburger && navMenu.classList.contains("active")) {
    navMenu.classList.remove("active");
  }
});

function agrandirImage(img) {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  lightboxImg.src = img.src;
  lightbox.classList.add("active");
}

function fermerImage() {
  document.getElementById("lightbox").classList.remove("active");
}

// ---------- Gestion des quantités sur une carte produit ----------

function changerQuantite(bouton, delta) {
  const ligne = bouton.closest('.ligne-grammage');
  const quantiteSpan = ligne.querySelector('.quantite-valeur');
  let quantite = parseInt(quantiteSpan.innerText, 10);
  quantite = Math.max(0, quantite + delta);
  quantiteSpan.innerText = quantite;

  const carte = bouton.closest('.carte-produit');
  calculerTotal(carte);
}

function calculerTotal(carte) {
  const lignes = carte.querySelectorAll('.ligne-grammage');
  let total = 0;
  lignes.forEach(ligne => {
    const prixUnitaire = parseInt(ligne.dataset.prix, 10);
    const quantite = parseInt(ligne.querySelector('.quantite-valeur').innerText, 10);
    total += prixUnitaire * quantite;
  });
  carte.querySelector('.prix-total').innerText = 'Total : ' + total + ' FCFA';
}

// ---------- Panier commun à tous les produits ----------

const CLE_PANIER = 'panierImperial';

function chargerPanier() {
  const donnees = localStorage.getItem(CLE_PANIER);
  return donnees ? JSON.parse(donnees) : [];
}

function sauvegarderPanier(panier) {
  localStorage.setItem(CLE_PANIER, JSON.stringify(panier));
}

function totalArticle(item) {
  return item.lignes.reduce((somme, ligne) => somme + ligne.prixUnitaire * ligne.quantite, 0);
}

function totalPanier(panier) {
  return panier.reduce((somme, item) => somme + totalArticle(item), 0);
}

function afficherPanierFlottant() {
  const barre = document.getElementById('panier-flottant');
  if (!barre) return;
  const panier = chargerPanier();
  document.getElementById('panier-total').innerText =
    'Panier : ' + panier.length + ' article(s) - ' + totalPanier(panier) + ' FCFA';
}

function construireListeArticles(panier) {
  let html = '';
  panier.forEach((item, itemIndex) => {
    html += '<div class="article-panier">';
    html += '<p class="article-nom">' + item.nom + '</p>';
    item.lignes.forEach((ligne, ligneIndex) => {
      html += '<div class="ligne-panier-detail">';
      html += '<span>' + ligne.quantite + ' x ' + ligne.label + '</span>';
      html += '<button type="button" class="btn-retirer-unite" onclick="retirerUneUnite(' + itemIndex + ',' + ligneIndex + ')">Retirer 1</button>';
      html += '</div>';
    });
    html += '<p class="sous-total-article">Sous-total : ' + totalArticle(item) + ' FCFA</p>';
    html += '</div>';
  });
  return html;
}

function afficherRecapCommande() {
  const panier = chargerPanier();
  const recapListe = document.getElementById('recap-liste');
  const recapTotalGlobal = document.getElementById('recap-total-global');
  if (!recapListe || !recapTotalGlobal) return;

  if (panier.length === 0) {
    recapListe.innerHTML = '<p>Votre panier est vide. <a href="produits.html">Retournez choisir vos produits</a>.</p>';
    recapTotalGlobal.style.display = 'none';
  } else {
    recapListe.innerHTML = construireListeArticles(panier);
    recapTotalGlobal.style.display = 'block';
    recapTotalGlobal.innerText = 'Total général : ' + totalPanier(panier) + ' FCFA';
  }
}

function retirerUneUnite(itemIndex, ligneIndex) {
  const panier = chargerPanier();
  const item = panier[itemIndex];
  if (!item) return;

  item.lignes[ligneIndex].quantite -= 1;

  if (item.lignes[ligneIndex].quantite <= 0) {
    item.lignes.splice(ligneIndex, 1);
  }

  if (item.lignes.length === 0) {
    panier.splice(itemIndex, 1);
  }

  sauvegarderPanier(panier);
  afficherRecapCommande();
}

function ajouterAuPanier(bouton) {
  const carte = bouton.closest('.carte-produit');
  const nomProduit = carte.querySelector('h3').innerText;
  const lignesDOM = carte.querySelectorAll('.ligne-grammage');

  let lignes = [];

  lignesDOM.forEach(ligne => {
    const quantite = parseInt(ligne.querySelector('.quantite-valeur').innerText, 10);
    if (quantite > 0) {
      const label = ligne.querySelector('.grammage-label').innerText;
      const prixUnitaire = parseInt(ligne.dataset.prix, 10);
      lignes.push({ label: label, prixUnitaire: prixUnitaire, quantite: quantite });
    }
  });

  if (lignes.length === 0) {
    alert("Merci de choisir au moins une quantité avant d'ajouter ce produit.");
    return;
  }

  const panier = chargerPanier();
  panier.push({ nom: nomProduit, lignes: lignes });
  sauvegarderPanier(panier);

  lignesDOM.forEach(ligne => {
    ligne.querySelector('.quantite-valeur').innerText = '0';
  });
  calculerTotal(carte);
  afficherPanierFlottant();

  const texteOriginal = bouton.innerText;
  bouton.innerText = 'Ajouté ✓';
  setTimeout(() => { bouton.innerText = texteOriginal; }, 1200);
}

function validerPanier() {
  const panier = chargerPanier();
  if (panier.length === 0) {
    alert("Votre panier est vide. Choisissez au moins un produit avant de valider.");
    return;
  }
  window.location.href = 'commande.html';
}

if (document.getElementById('panier-flottant')) {
  afficherPanierFlottant();
}

if (document.getElementById('recap-commande')) {
  afficherRecapCommande();

  document.getElementById('form-commande').addEventListener('submit', function (e) {
    e.preventDefault();

    const panierActuel = chargerPanier();
    if (panierActuel.length === 0) {
      alert("Votre panier est vide. Retournez choisir vos produits.");
      return;
    }

    const champs = [
      document.getElementById('nom'),
      document.getElementById('prenom'),
      document.getElementById('email'),
      document.getElementById('contact'),
      document.getElementById('lieu')
    ];

    let tousRemplis = true;

    champs.forEach(champ => {
      const conteneur = champ.closest('.champ-formulaire');
      if (champ.value.trim() === '') {
        conteneur.classList.add('champ-erreur');
        tousRemplis = false;
      } else {
        conteneur.classList.remove('champ-erreur');
      }
    });

    if (!tousRemplis) {
      return;
    }

    const prenom = document.getElementById('prenom').value.trim();
    alert("Votre commande a bien été enregistrée. Merci " + prenom + " ! Nous vous contacterons très vite.");

    localStorage.removeItem(CLE_PANIER);
    // Prochaine étape : envoi des emails via EmailJS
  });
}

// ============================================================
// ---------- Thèmes saisonniers (automatique + forçable) ----------
// ============================================================

// Calcule la date de Pâques pour une année donnée (algorithme de Meeus/Jones/Butcher)
function calculerDatePaques(annee) {
  const a = annee % 19;
  const b = Math.floor(annee / 100);
  const c = annee % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mois = Math.floor((h + l - 7 * m + 114) / 31);
  const jour = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(annee, mois - 1, jour);
}

// Détermine quelle saison est active aujourd'hui (ou la saison forcée)
function determinerSaison() {
  if (SAISON_FORCEE) return SAISON_FORCEE;

  const aujourdhui = new Date();
  const jour = aujourdhui.getDate();
  const mois = aujourdhui.getMonth() + 1;
  const annee = aujourdhui.getFullYear();

  // Noël : 1er - 25 décembre
  if (mois === 12 && jour >= 1 && jour <= 25) return 'noel';

  // Nouvel An : 26 décembre - 2 janvier
  if ((mois === 12 && jour >= 26) || (mois === 1 && jour <= 2)) return 'nouvel_an';

  // Saint-Valentin : 7 - 14 février
  if (mois === 2 && jour >= 7 && jour <= 14) return 'valentin';

  // Pâques : la semaine précédant Pâques jusqu'au jour J
  const paques = calculerDatePaques(annee);
  const debutPaques = new Date(paques);
  debutPaques.setDate(paques.getDate() - 7);
  if (aujourdhui >= debutPaques && aujourdhui <= paques) return 'paques';

  return null;
}

// Éléments décoratifs (emoji) et type d'animation par saison
const DECORATIONS_SAISON = {
  noel: { symboles: ['❄️'], animation: 'chute' },
  nouvel_an: { symboles: ['✨', '🎉', '🎊'], animation: 'flotte' },
  valentin: {
    symboles: ['♥'],
    animation: 'flotte',
    couleurs: ['#772332', '#a21728', '#b92052', '#bf464f', '#c5828b']
  },
  paques: { symboles: ['🌸', '🌿', '🥚'], animation: 'flotte' }
};

// Crée les éléments flottants/tombants pour une saison donnée
function creerDecorationSaison(saison) {
  const infos = DECORATIONS_SAISON[saison];
  if (!infos) return;

  const conteneur = document.createElement('div');
  conteneur.id = 'decoration-saison';
  conteneur.className = 'decoration-saison';

  const nombreElements = 16; // niveau modéré

  for (let n = 0; n < nombreElements; n++) {
    const span = document.createElement('span');
    const symbole = infos.symboles[Math.floor(Math.random() * infos.symboles.length)];
    span.innerText = symbole;

    const gauche = Math.random() * 100;
    const taille = 14 + Math.random() * 14;
    const duree = 8 + Math.random() * 8;
    const delai = Math.random() * 10;

    span.style.left = gauche + '%';
    span.style.fontSize = taille + 'px';
    span.style.animationDuration = duree + 's';
    span.style.animationDelay = delai + 's';
    span.style.animationName = infos.animation === 'chute' ? 'chute-decor' : 'flotte-decor';

    // Couleur aléatoire pour les saisons qui en définissent une palette (ex: Saint-Valentin)
    if (infos.couleurs) {
      span.style.color = infos.couleurs[Math.floor(Math.random() * infos.couleurs.length)];
    }

    conteneur.appendChild(span);
  }

  document.body.appendChild(conteneur);
}

// Applique la saison active : classe sur le body + décoration
function appliquerSaison() {
  const saison = determinerSaison();

  document.body.classList.remove('saison-noel', 'saison-nouvel-an', 'saison-valentin', 'saison-paques');

  const ancienneDecoration = document.getElementById('decoration-saison');
  if (ancienneDecoration) ancienneDecoration.remove();

  if (saison) {
    document.body.classList.add('saison-' + saison.replace('_', '-'));
    creerDecorationSaison(saison);
  }
}

appliquerSaison();