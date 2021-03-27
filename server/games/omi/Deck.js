class Deck {
    constructor() {
        this.deck = [];
    }

    generateDeck() {
        this.deck = [];

        const values = ['7', '8', '9', '10', '11', '12', '13', '14']; // 11 = Jack, 12 = Queen, 13 = King, 14 = Ace
        const suits = ['S', 'H', 'C', 'D']; // S = Spades, H = Hearts, C = Clubs, D = Diamonds
        const imageNames = [
            "S7.png",
            "S8.png",
            "S9.png",
            "S10.png",
            "SJ.png",
            "SQ.png",
            "SK.png",
            "SA.png",
            "H7.png",
            "H8.png",
            "H9.png",
            "H10.png",
            "HJ.png",
            "HQ.png",
            "HK.png",
            "HA.png",
            "C7.png",
            "C8.png",
            "C9.png",
            "C10.png",
            "CJ.png",
            "CQ.png",
            "CK.png",
            "CA.png",
            "D7.png",
            "D8.png",
            "D9.png",
            "D10.png",
            "DJ.png",
            "DQ.png",
            "DK.png",
            "DA.png"
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