class Deck {
    constructor() {
        this.deck = [];
    }

    generateDeck() {
        let card = (suit, value, img) => {
            this.name = suit + value;
            this.suit = suit;
            this.value = value;
            this.img = img;
            return { name: this.name, suit: this.suit, value: this.value, img: this.img };
        }

        let values = ['7', '8', '9', '10', '11', '12', '13', '14']; //11 = Jack, 12 = Queen, 13 = King, 14 = Ace
        let suits = ['1', '2', '3', '4']; //1 = Spades, 2 = Hearts, 3 = Clubs, 4 = Diamonds
        let imgs = [
            "url('./assets/imgs/cards/S7.jpg')",
            "url('./assets/imgs/cards/S8.jpg')",
            "url('./assets/imgs/cards/S9.jpg')",
            "url('./assets/imgs/cards/S10.jpg')",
            "url('./assets/imgs/cards/SJ.jpg')",
            "url('./assets/imgs/cards/SQ.jpg')",
            "url('./assets/imgs/cards/SK.jpg')",
            "url('./assets/imgs/cards/SA.jpg')",
            "url('./assets/imgs/cards/H7.jpg')",
            "url('./assets/imgs/cards/H8.jpg')",
            "url('./assets/imgs/cards/H9.jpg')",
            "url('./assets/imgs/cards/H10.jpg')",
            "url('./assets/imgs/cards/HJ.jpg')",
            "url('./assets/imgs/cards/HQ.jpg')",
            "url('./assets/imgs/cards/HK.jpg')",
            "url('./assets/imgs/cards/HA.jpg')",
            "url('./assets/imgs/cards/C7.jpg')",
            "url('./assets/imgs/cards/C8.jpg')",
            "url('./assets/imgs/cards/C9.jpg')",
            "url('./assets/imgs/cards/C10.jpg')",
            "url('./assets/imgs/cards/CJ.jpg')",
            "url('./assets/imgs/cards/CQ.jpg')",
            "url('./assets/imgs/cards/CK.jpg')",
            "url('./assets/imgs/cards/CA.jpg')",
            "url('./assets/imgs/cards/D7.jpg')",
            "url('./assets/imgs/cards/D8.jpg')",
            "url('./assets/imgs/cards/D9.jpg')",
            "url('./assets/imgs/cards/D10.jpg')",
            "url('./assets/imgs/cards/DJ.jpg')",
            "url('./assets/imgs/cards/DQ.jpg')",
            "url('./assets/imgs/cards/DK.jpg')",
            "url('./assets/imgs/cards/DA.jpg')"
        ];

        let imgCount = 0;
        for (let s = 0; s < suits.length; s++) {
            for (let v = 0; v < values.length; v++) {
                this.deck.push(card(suits[s], values[v], imgs[imgCount]));
                imgCount++;
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