const API = 'https://db.ygoprodeck.com/api/v7/cardinfo.php?type=normal%20monster';
let deck = [];

async function loadDeck() {
  const response = await fetch(API);
  const data = await response.json();
  deck = data.data;
  shuffle(deck);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
  