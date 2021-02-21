class Deck {
    constructor() {
        this.deck = [];
    }

    generateDeck() {
        this.deck = [];
        
        let card = (suit, value, imageName) => {
            this.name = suit + value;
            this.suit = suit;
            this.value = value;
            this.imageName = imageName;
            return { name: this.name, suit: this.suit, value: this.value, imageName: this.imageName };
        }

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

        let imageIndex = 0;
        for (let s = 0; s < suits.length; s++) {
            for (let v = 0; v < values.length; v++) {
                this.deck.push(card(suits[s], values[v], imageNames[imageIndex]));
                imageIndex++;
            }
        }
    }

    shuffle() {
        let currentIndex = this.deck.length, tempVal, randIndex;
        while (currentIndex != 0) {
            randIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            tempVal = this.deck[currentIndex];
            this.deck[currentIndex] = this.deck[randIndex];
            this.deck[randIndex] = tempVal;
        }
    }

    deal() {
        let dealtCard = this.deck.shift();
        return dealtCard;
    }
}

module.exports = Deck;