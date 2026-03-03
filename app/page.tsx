"use client";
import React, { useEffect, useState } from "react";

export default function Home() {
  const url = "https://deckofcardsapi.com/api/deck";

  const [deckId, setDeckId] = useState("");
  const [dealerCount, setDealerCount] = useState(0);
  const [playerCount, setPlayerCount] = useState(0);
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);
  const [result, setResult] = useState("");
  const [isStand, setIsStand] = useState(false);

  // Helper: Reset game
  const reset = async () => {
    setDeckId("");
    setPlayerCards([]);
    setDealerCards([]);
    setDealerCount(0);
    setPlayerCount(0);
    setResult("");
    setIsStand(false);
    // Re-initialize game
    fetchInitialData();
  };

  const cardData = (card) => ({
    card: `${card.value} of ${card.suit}`,
    cardPic: card.image,
    value: card.value,
  });

  const getCardNumericValue = (cardValue) => {
    switch (cardValue) {
      case "ACE":
        return 11;
      case "KING":
      case "QUEEN":
      case "JACK":
        return 10;
      default:
        return Number(cardValue);
    }
  };

  const gameResult = (dCount, pCount) => {
    if (pCount > 21) return "You Bust! You lose!";
    if (dCount > 21) return "Dealer Busts! You win!";
    if (pCount > dCount) return "Your count is higher! You win!";
    if (pCount < dCount) return "Your count is lower! You lose!";
    return "You tie!";
  };

  const fetchInitialData = async () => {
    try {
      const deckRes = await fetch(`${url}/new/shuffle/?deck_count=1`);
      const deckData = await deckRes.json();
      const id = deckData.deck_id;
      setDeckId(id);

      const drawRes = await fetch(`${url}/${id}/draw/?count=4`);
      const drawData = await drawRes.json();
      const cards = drawData.cards;

      setPlayerCards([cardData(cards[0]), cardData(cards[2])]);
      setDealerCards([cardData(cards[1]), cardData(cards[3])]);

      setPlayerCount(
        getCardNumericValue(cards[0].value) +
          getCardNumericValue(cards[2].value),
      );
      setDealerCount(
        getCardNumericValue(cards[1].value) +
          getCardNumericValue(cards[3].value),
      );
    } catch (err) {
      console.error("Initialization error:", err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const hit = async () => {
    if (isStand || result) return;
    try {
      const res = await fetch(`${url}/${deckId}/draw/?count=1`);
      const data = await res.json();
      const newCard = data.cards[0];

      const newPlayerCards = [...playerCards, cardData(newCard)];
      const newPlayerCount = playerCount + getCardNumericValue(newCard.value);

      setPlayerCards(newPlayerCards);
      setPlayerCount(newPlayerCount);

      if (newPlayerCount >= 21) {
        setIsStand(true);
        setResult(gameResult(dealerCount, newPlayerCount));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const dealerDraw = async () => {
    try {
      const res = await fetch(`${url}/${deckId}/draw/?count=1`);
      const data = await res.json();
      const newCard = data.cards[0];

      const newDealerCount = dealerCount + getCardNumericValue(newCard.value);
      setDealerCards((prev) => [...prev, cardData(newCard)]);
      setDealerCount(newDealerCount);

      return newDealerCount;
    } catch (error) {
      console.log(error);
    }
  };

  const standAction = async () => {
    setIsStand(true);
    let currentDealerCount = dealerCount;

    // Simple dealer AI: hit until 17
    if (currentDealerCount < 17) {
      currentDealerCount = await dealerDraw();
    }

    setResult(gameResult(currentDealerCount, playerCount));
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      <footer className="header">
        <div className="container">
          <span className="flex display-6 pt-2">Blackjack Demo</span>
        </div>
      </footer>
      <main className="container flex-grow-1 py-5">
        <div className="mt-4">
          <h4>
            {isStand
              ? `Dealer Count: ${dealerCount}, Player Count: ${playerCount}`
              : `Player Count: ${playerCount}`}
          </h4>
        </div>

        {result && (
          <div className="text-center my-4">
            <h1 className="fw-bold">{result}</h1>
            <button className="btn btn-danger" onClick={reset}>
              RESET
            </button>
          </div>
        )}

        <h2 className="fw-bold">Dealer</h2>
        <div className="d-flex flex-wrap gap-3">
          {dealerCards.map((card, i) => (
            <div key={i} className="text-center">
              <h3>Card {i + 1}</h3>
              <img
                className="cards"
                style={{ width: "150px" }}
                src={
                  !isStand && i === 1
                    ? "https://deckofcardsapi.com/static/img/back.png"
                    : card.cardPic
                }
                alt={card.card}
              />
            </div>
          ))}
        </div>

        <h2 className="fw-bold mt-4">Player</h2>
        {!result && (
          <div className="mb-3 d-flex gap-2">
            <button className="btn btn-success" onClick={hit}>
              HIT
            </button>
            <button className="btn btn-warning" onClick={standAction}>
              STAND
            </button>
          </div>
        )}

        <div className="d-flex flex-wrap gap-3">
          {playerCards.map((card, i) => (
            <div key={i} className="text-center">
              <h3>Card {i + 1}</h3>
              <img
                className="cards"
                style={{ width: "150px" }}
                src={card.cardPic}
                alt={card.card}
              />
            </div>
          ))}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <span className="flex">
            Disclaimer: This Blackjack demo does not cover all the rules.
          </span>
        </div>
      </footer>
    </div>
  );
}
