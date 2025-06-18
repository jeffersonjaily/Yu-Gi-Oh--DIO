drawCardBtn.onclick = () => {
  if (currentTurn !== 'player') return;
  if (drawCard(playerHand, playerDeck, true)) {
    if (playCard(playerHand, playerField, true)) {
      renderField(playerField, playerFieldDiv, false);
    }
  }
};

// Outros botões como attack, defense, discard etc seguem aqui.
