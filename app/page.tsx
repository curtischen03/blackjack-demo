"use client";
import React, { useEffect, useState } from "react";

interface Card {
  card: string;
  cardPic: string;
  value: string;
}

export default function Home() {
  const url = "https://deckofcardsapi.com/api/deck";

  const [deckId, setDeckId] = useState<string>("");
  const [dealerCount, setDealerCount] = useState<number>(0);
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [result, setResult] = useState<string>("");
  const [isStand, setIsStand] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const cardData = (card: any): Card => ({
    card: `${card.value} of ${card.suit}`,
    cardPic: card.image,
    value: card.value,
  });

  const getCardNumericValue = (cardValue: string): number => {
    if (["KING", "QUEEN", "JACK"].includes(cardValue)) return 10;
    if (cardValue === "ACE") return 11;
    return Number(cardValue);
  };

  const gameResult = (dCount: number, pCount: number): string => {
    if (pCount > 21) return "You Bust! You lose!";
    if (dCount > 21) return "Dealer Busts! You win!";
    if (pCount > dCount) return "You win!";
    if (pCount < dCount) return "You lose!";
    return "You tie!";
  };

  const fetchInitialData = async () => {
    setIsFetching(true);
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
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const reset = () => {
    setDeckId("");
    setPlayerCards([]);
    setDealerCards([]);
    setDealerCount(0);
    setPlayerCount(0);
    setResult("");
    setIsStand(false);
    fetchInitialData();
  };

  const hit = async () => {
    if (isStand || result || isFetching) return;
    try {
      const res = await fetch(`${url}/${deckId}/draw/?count=1`);
      const data = await res.json();
      const newCard = data.cards[0];
      const newCount = playerCount + getCardNumericValue(newCard.value);

      setPlayerCards((prev) => [...prev, cardData(newCard)]);
      setPlayerCount(newCount);

      if (newCount >= 21) handleStand(newCount, dealerCount);
    } catch (error) {
      console.log(error);
    }
  };

  const handleStand = async (pCount = playerCount, dCount = dealerCount) => {
    setIsStand(true);
    let currentDealerCount = dCount;
    let currentDealerCards = [...dealerCards];

    while (currentDealerCount < 17 && pCount <= 21) {
      const res = await fetch(`${url}/${deckId}/draw/?count=1`);
      const data = await res.json();
      const newCard = data.cards[0];
      currentDealerCount += getCardNumericValue(newCard.value);
      currentDealerCards.push(cardData(newCard));
      setDealerCount(currentDealerCount);
      setDealerCards([...currentDealerCards]);
    }
    setResult(gameResult(currentDealerCount, pCount));
  };

  // Internal Card Component for Mobile Fanning
  const CardHand = ({
    cards,
    isDealer,
  }: {
    cards: Card[];
    isDealer?: boolean;
  }) => (
    <div
      className="d-flex flex-row flex-wrap justify-content-center mt-3 position-relative"
      style={{ minHeight: "160px" }}
    >
      {cards.map((card, i) => (
        <div
          key={i}
          className="position-relative"
          style={{
            width: "80px",
            marginLeft: i === 0 ? "0" : "-40px", // Fanning effect
            zIndex: i,
          }}
        >
          <img
            className="rounded shadow-sm img-fluid"
            src={
              isDealer && !isStand && i === 1
                ? "https://deckofcardsapi.com/static/img/back.png"
                : card.cardPic
            }
            alt={card.card}
            style={{ minWidth: "100px", maxWidth: "120px" }}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-vh-100 d-flex flex-column bg-dark text-white">
      <header className="bg-black p-3 text-center border-bottom border-secondary">
        <h1 className="h4 mb-0">Blackjack Demo</h1>
      </header>

      <main className="container-fluid container-md flex-grow-1 py-4 text-center">
        {/* Score Board */}
        <div className="bg-secondary bg-opacity-25 rounded-pill py-2 px-4 d-inline-block mb-4">
          <span className="fw-light">
            {isStand
              ? `Dealer: ${dealerCount} vs Player: ${playerCount}`
              : `Your Score: ${playerCount}`}
          </span>
        </div>

        {result && (
          <div className="my-3 animate-fade-in">
            <h2 className="display-5 fw-bold text-warning">{result}</h2>
            <button
              className="btn btn-outline-light btn-lg mt-2"
              onClick={reset}
            >
              Play Again
            </button>
          </div>
        )}

        {/* Game Table Area */}
        <div className="row justify-content-center">
          <div className="col-12 col-md-10">
            <section className="mb-5">
              <h3 className="h6 text-uppercase ls-wide opacity-50">
                Dealer Hand
              </h3>
              <CardHand cards={dealerCards} isDealer />
            </section>

            <section className="mt-5">
              <h3 className="h6 text-uppercase ls-wide opacity-50">
                Your Hand
              </h3>
              <CardHand cards={playerCards} />

              {!result && (
                <div className="mt-4 d-flex justify-content-center gap-3">
                  <button
                    className="btn btn-success btn-lg px-5 shadow"
                    onClick={hit}
                  >
                    HIT
                  </button>
                  <button
                    className="btn btn-warning btn-lg px-5 shadow"
                    onClick={() => handleStand()}
                  >
                    STAND
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <footer className="p-3 text-center opacity-50 small mt-auto">
        <p className="mb-0">Deck of Cards API • Mobile Optimized</p>
      </footer>

      <style jsx>{`
        .ls-wide {
          letter-spacing: 0.1rem;
        }
        @media (min-width: 768px) {
          .position-relative {
            margin-left: 10px !important;
          }
        }
      `}</style>
    </div>
  );
}
