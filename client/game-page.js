/* const enamy1cards = document.querySelector("#enamy-1")
const enamy2cards = document.querySelector("#enamy-2")
const friendcards = document.querySelector("#friend")
function enamyCardMove(player, card) {

    var playerCard;
    var cardNumber = card;
    if (player == "p1") {
        playerCard = friendcards.children[Math.floor(Math.random() * friendcards.children.length)]
    } else if (player == "p2") {
        playerCard = enamy1cards.children[Math.floor(Math.random() * enamy1cards.children.length)]
    } else if (player == "p3") {
        playerCard = enamy2cards.children[Math.floor(Math.random() * enamy2cards.children.length)]
    }

    playerCard.style.transition = "transform 0.5s linear 0s";
    playerCard.style.transform = "translatey(-200%) rotatey(180deg)";
    setTimeout(() => {
        playerCard.style.content = "url(assets/imgs/cards/" + cardNumber + ".jpg)";
    }, 250);

} */