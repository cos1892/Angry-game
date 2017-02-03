window.onload = () => {
    let stones = [];
    let pigs = [];
    let explosions = [];
    let health = 3;
    let score = 0;
    let undead = false; 
    let bestScore = localStorage.getItem('bestScore') || 0;
    let bestScoreElement = document.querySelector('.best-score > span');
    bestScoreElement.innerHTML = bestScore;
    let scoreElement  = document.querySelector('.score > span');
    scoreElement.innerHTML = score;
    let healthElement  = document.querySelector('.health > span');
    healthElement.innerHTML = health;
    let startGame = document.querySelector('.start-game');
    let startButton = document.querySelector('.start');
    let gameOverElement = document.querySelector('.game-over');
    let playAgainButton = document.querySelector('.play-again');
    let bird = document.querySelector('.angry-bird');
    let body = document.querySelector('body');
    let playArea = document.querySelector('.play-area');
    playArea.style.animationPlayState = 'paused';
    bird.style.animationPlayState = 'paused';
    let pigCreaterTimeout;
    let checkCollisionsTimeout;

    //callback for keydown listener
    let keyListener = function(e) {
        if(e.keyCode === 38) {
            if(bird.offsetTop > 19) {
               bird.style.top = (bird.offsetTop - 20) + 'px';
            }
        }
        if(e.keyCode === 40) {
            if(bird.offsetTop < (bird.offsetParent.clientHeight - bird.clientHeight - 19)) {
                bird.style.top = (bird.offsetTop + 20) + 'px';
            }
        }
        if(e.keyCode === 32) {
            stones.push(new Stone());
        } 
    }

    function minusHealth() {
        if(health > 1) {
            health--;
            healthElement.innerHTML = health;
            undead = true;
            bird.classList.add('undead');
            setTimeout(function() {
                undead = false;
                bird.classList.remove('undead');
            }, 2000);
        } else {
            gameOver();
        }
    }

    class Stone {
        constructor() {
            this.stone = document.createElement('div');
            this.stone.classList.add('stone');
            this.stone.style.left = (bird.offsetLeft + bird.clientWidth/ 2) + 'px';
            this.stone.style.top = (bird.offsetTop + bird.clientHeight/ 2) + 'px';
            playArea.appendChild(this.stone);
            this.init = setTimeout(function initialize() {
                if(this.stone.offsetLeft > playArea.clientWidth) {
                    clearTimeout(this.init);
                    playArea.removeChild(this.stone);
                    stones.shift();
                }
                this.stone.style.left = (this.stone.offsetLeft + 10) + 'px';
                this.init = setTimeout(initialize.bind(this), 1000 / 60);
            }.bind(this), 1000 / 60);
        }
    }

    class Pig {
        constructor(posTop) {
            this.pig = document.createElement('div');
            this.pig.classList.add('pig');
            this.pig.style.left = (playArea.clientWidth + this.pig.clientWidth) + 'px';
            this.pig.style.top = posTop + 'px';
            playArea.appendChild(this.pig);
            this.init = setTimeout(function initialize() {
                if(this.pig.offsetLeft < 0 - this.pig.clientWidth) {
                    clearTimeout(this.init);
                    playArea.removeChild(this.pig);
                    pigs.shift();
                    if(!undead) {
                        minusHealth();
                    }
                }
                this.pig.style.left = (this.pig.offsetLeft - 10) + 'px';
                this.init = setTimeout(initialize.bind(this), 1000 / 30);
            }.bind(this), 1000/30);
        }
    }

    class Explosion {
        constructor(posX, posY) {
            this.explosion = document.createElement('div');
            this.explosion.classList.add('explosion');
            this.explosion.style.left = posX + 'px';
            this.explosion.style.top = posY + 'px';
            playArea.appendChild(this.explosion);
            this.init = setTimeout(function() {
                playArea.removeChild(this.explosion);
                explosions.shift();
            }.bind(this), 300);
        }
    }

    //generator Pigs
    function pigCreater() {
        pigs.push(new Pig(Math.random() * (playArea.clientHeight - 96)));
        pigCreaterTimeout = setTimeout(pigCreater, 1000);
    }

    function collides(x, y, r, b, x2, y2, r2, b2) {
        return !(r <= x2 || x > r2 || b <= y2 || y > b2);
    }

    function checkCollisions() {
        // Run collision detection for all pigs and stones
        for(let i = 0; i < pigs.length; i++) {
            let pigPosX = pigs[i].pig.offsetLeft;
            let pigPosY = pigs[i].pig.offsetTop;
            let pigWidth = pigs[i].pig.clientWidth;
            let pigHeight = pigs[i].pig.clientHeight;

            for(let j = 0; j < stones.length; j++) {
                let stonePosX = stones[j].stone.offsetLeft;
                let stonePosY = stones[j].stone.offsetTop;
                let stoneWidth = stones[j].stone.clientWidth;
                let stoneHeight = stones[j].stone.clientHeight;

                if(collides(pigPosX, pigPosY, pigPosX + pigWidth, pigPosY + pigHeight, stonePosX, stonePosY, stonePosX + stoneWidth, stonePosY + stoneHeight)) {
                    // Remove the enemy
                    playArea.removeChild(pigs[i].pig);
                    clearTimeout(pigs[i].pig.init);
                    pigs.splice(i, 1);
                    i--;

                    // Add score
                    score += 1;
                    scoreElement.innerHTML = score;

                    // Add an explosion
                    explosions.push(new Explosion(pigPosX, pigPosY));

                    // Remove the bullet and stop this iteration
                    playArea.removeChild(stones[j].stone);
                    clearTimeout(stones[j].stone.init);
                    stones.splice(j, 1);
                    j--;
                    break;
                }
            }

            if(!undead) {
                if(collides(pigPosX, pigPosY, pigPosX + pigWidth, pigPosY + pigHeight, bird.offsetLeft, bird.offsetTop, bird.offsetLeft + bird.clientWidth, bird.offsetTop + bird.clientHeight)) {
                    minusHealth();
                }
            }
        }

        checkCollisionsTimeout = setTimeout(checkCollisions, 1000 / 60);
    }

    function gameOver() {
        if(score > bestScore) {
            localStorage.setItem('bestScore', score);
            bestScore = localStorage.getItem('bestScore');
            bestScoreElement.innerHTML = bestScore;
        }
        healthElement.innerHTML = '0';
        playArea.style.animationPlayState = 'paused';
        bird.style.animationPlayState = 'paused';
        body.removeEventListener('keydown', keyListener);
        clearTimeout(pigCreaterTimeout);
        clearTimeout(checkCollisionsTimeout);

        // clear arrays after game over
        stones.map(item => {
            playArea.removeChild(item.stone);
            clearTimeout(item.stone.init);
        });
        stones.splice(0, stones.length);
        pigs.map(item => {
            playArea.removeChild(item.pig);
            clearTimeout(item.pig.init);
        });
        pigs.splice(0, pigs.length);
        explosions.map(item => {
            playArea.removeChild(item.explosion);
            clearTimeout(item.explosion.init);
        });
        explosions.splice(0, explosions.length);
        gameOverElement.style.display = 'block';
    }

    startButton.addEventListener('click', function(e) {
        startGame.style.display = 'none';
        playArea.style.animationPlayState = 'running';
        bird.style.animationPlayState = 'running';
        body.addEventListener('keydown', keyListener);
        pigCreaterTimeout = setTimeout(pigCreater, 1000);
        checkCollisionsTimeout = setTimeout(checkCollisions, 1000 / 60);
    });

    playAgainButton.addEventListener('click', function(e) {
        gameOverElement.style.display = 'none';
        health = 3;
        score = 0;
        bestScore = localStorage.getItem('bestScore');
        scoreElement.innerHTML = score;
        healthElement.innerHTML = health;
        playArea.style.animationPlayState = 'running';
        bird.style.animationPlayState = 'running';
        body.addEventListener('keydown', keyListener);
        pigCreaterTimeout = setTimeout(pigCreater, 1000);
        checkCollisionsTimeout = setTimeout(checkCollisions, 1000 / 60);
    });
}