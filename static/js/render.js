function updateDeckCount() {
  playerDeckCountElem.textContent = playerDeckCount;
  enemyDeckCountElem.textContent = enemyDeckCount;
}

function updateLP() {
  playerLPElem.textContent = playerLP;
  enemyLPElem.textContent = enemyLP;
  playerBarElem.style.width = `${(playerLP / MAX_LP) * 100}%`;
  enemyBarElem.style.width = `${(enemyLP / MAX_LP) * 100}%`;
}

function renderField(field, container, isEnemy = false) {
  container.innerHTML = "";
  field.forEach((card, index) => {
    const img = document.createElement("img");
    img.src = (isEnemy && !attackModeActive) ? cardBackImage : card.card_images[0].image_url;
    img.title = `${card.name}\nATK: ${card.atk} / DEF: ${card.def}\nModo: ${card.mode || "attack"}`;
    img.classList.remove("card-zoomed");
    img.style.cursor = "pointer";

    if (!isEnemy && selectedPlayerCardIndex === index) img.classList.add("selected");
    container.appendChild(img);
  });
}
