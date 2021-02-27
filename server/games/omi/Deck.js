class Deck {
    constructor() {
        this.deck = [];
    }

    generateDeck() {
        this.deck = [];

        const values = ['7', '8', '9', '10', '11', '12', '13', '14']; // 11 = Jack, 12 = Queen, 13 = King, 14 = Ace
        const suits = ['S', 'H', 'C', 'D']; // S = Spades, H = Hearts, C = Clubs, D = Diamonds
        const imageNames = [
            "S7.jpg",
            "S8.jpg",
            "S9.jpg",
            "S10.jpg",
            "SJ.jpg",
            "SQ.jpg",
            "SK.jpg",
            "SA.jpg",
            "H7.jpg",
            "H8.jpg",
            "H9.jpg",
            "H10.jpg",
            "HJ.jpg",
            "HQ.jpg",
            "HK.jpg",
            "HA.jpg",
            "C7.jpg",
            "C8.jpg",
            "C9.jpg",
            "C10.jpg",
            "CJ.jpg",
            "CQ.jpg",
            "CK.jpg",
            "CA.jpg",
            "D7.jpg",
            "D8.jpg",
            "D9.jpg",
            "D10.jpg",
            "DJ.jpg",
            "DQ.jpg",
            "DK.jpg",
            "DA.jpg"
        ];

        const createCard = (suit, value, imageName) => {
            const name = suit + value;
            return { name, suit, value, imageName };
        }

        let imageIndex = 0;
        for (let s = 0; s < suits.length; s++) {
            for (let v = 0; v < values.length; v++) {
                this.deck.push(createCard(suits[s], values[v], imageNames[imageIndex]));
                imageIndex++;
            }
        }
    }

    shuffle() {
        let currentIndex = this.deck.length, tempCard, randomIndex;
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            tempCard = this.deck[currentIndex];
            this.deck[currentIndex] = this.deck[randomIndex];
            this.deck[randomIndex] = tempCard;
        }
    }

    deal() {
        const dealtCard = this.deck.shift();
        return dealtCard;
    }
}

module.exports = Deck;