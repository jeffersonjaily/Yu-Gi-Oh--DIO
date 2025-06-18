async function startGame() {
  log("Carregando cartas...");
  try {
    await loadDeck();
    playerDeck = deck.slice(0, deck.length / 2);
    enemyDeck = deck.slice(deck.length / 2);
    playerDeckCount = playerDeck.length;
    enemyDeckCount = enemyDeck.length;
    updateDeckCount();
    for (let i = 0; i < 5; i++) {
      drawCard(playerHand, playerDeck, true);
      drawCard(enemyHand, enemyDeck, false);
    }
    while (playCard(playerHand, playerField, true)) {}
    while (playCard(enemyHand, enemyField, false)) {}
    renderField(playerField, playerFieldDiv, false);
    renderField(enemyField, enemyFieldDiv, true);
    updateLP();
    log("Jogo iniciado! Seu turno.");
    enableButtons();
  } catch (e) {
    log("Erro ao carregar cartas.");
  }
}
startGame();
