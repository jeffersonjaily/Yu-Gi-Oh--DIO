function drawCard(hand, deck, isPlayer = true) {
  if (hand.length >= MAX_HAND_SIZE || deck.length === 0) return false;
  const card = deck.shift();
  hand.push(card);
  if (isPlayer) playerDeckCount--; else enemyDeckCount--;
  updateDeckCount();
  return true;
}

function playCard(hand, field, isPlayer = true) {
  if (hand.length === 0 || field.length >= MAX_FIELD_SIZE) return false;
  const card = hand.shift();
  if (isPlayer) card.mode = "attack";
  field.push(card);
  return true;
}
