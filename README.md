# Blackjack Game using Deck of Cards API

This is a simple web-based Blackjack simulator game built with the [Deck of Cards API](https://deckofcardsapi.com/), React, and Next.js in Typescript. The game allows a user to play against a dealer, drawing cards and standing according to basic Blackjack rules.

## Features

- Fetches real playing cards from Deck of Cards API
- Handles card drawing, reshuffling, and game logic
- Tracks player and dealer hands
- Supports "Hit", "Stand", and "Reset" game actions

## Technologies Used

- **Node.js**
- **Deck of Cards API**
- **Next.js**

## Setup Instructions

1. **Clone this repository:**

2. **Install dependencies and run:**

```bash
npm install
npm run dev
```

## How to Play

- When you load the page, a shuffled deck is generated and 2 cards each are dealt to the player and dealer.
- Click **Hit** to draw another card.
- Click **Stand** to end your turn and let the dealer draw until their total is 17 or more.
- Click **Reset** to start a new game.

## API Endpoints Used

- `GET /api/deck/new/shuffle/?deck_count=1` – Create a new shuffled deck
- `GET /api/deck/{deck_id}/draw/?count=N` – Draw N cards
- `GET /api/deck/{deck_id}/shuffle/` – Reshuffle the current deck
