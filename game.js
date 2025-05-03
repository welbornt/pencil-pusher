class Game {
    constructor() {
        this.pencils = 0;
        this.pencilsPerSecond = 0;
        this.clickPower = 1;
        this.pencilMultiplier = 1;
        this.clickMultiplier = 1;
        this.enlightenmentPoints = 0;
        this.enlightenmentMultiplier = 1;
        this.enlightenmentCost = 1000000; // 1 million pencils for first enlightenment
        this.enlightenmentCount = 0;
        this.hasAchievedCosmicPencil = false;
        this.cookieConsent = false;
        this.upgrades = [
            {
                name: "Better Pencil",
                description: "Increases click power by 1",
                cost: 10,
                effect: () => this.clickPower++,
                owned: 0
            },
            {
                name: "Pencil Sharpener",
                description: "Automatically pushes pencils every second",
                cost: 50,
                effect: () => this.pencilsPerSecond += 1,
                owned: 0
            },
            {
                name: "Pencil Factory",
                description: "Increases pencils per second by 25%",
                cost: 200,
                effect: () => this.pencilMultiplier *= 1.25,
                owned: 0
            },
            {
                name: "Pencil Empire",
                description: "Increases click power by 50%",
                cost: 500,
                effect: () => this.clickMultiplier *= 1.5,
                owned: 0
            },
            {
                name: "Pencil God Mode",
                description: "Become the ultimate pencil deity! (Increases click power and production by 50%)",
                cost: 1000000,
                initialCost: 1000000,
                effect: () => {
                    this.clickPower *= 1.5;
                    this.pencilsPerSecond *= 1.5;
                },
                owned: 0
            },
            {
                name: "Pencil Singularity",
                description: "Create a black hole of pencils! (50x everything)",
                cost: 50000,
                effect: () => {
                    this.clickPower *= 50;
                    this.pencilsPerSecond *= 50;
                    this.pencils *= 2;
                },
                owned: 0
            },
            {
                name: "Cosmic Pencil",
                description: "Transcend reality itself! (Requires 5 enlightenments)",
                cost: 1000000000,
                effect: () => {
                    this.hasAchievedCosmicPencil = true;
                    this.clickPower *= 1000;
                    this.pencilsPerSecond *= 1000;
                    this.pencils *= 10;
                    this.showEnding();
                },
                owned: 0,
                hidden: true
            }
        ];

        this.initializeElements();
        this.setupEventListeners();
        this.checkCookieConsent();
        this.loadGame();
        this.updateUI();
        this.startGameLoop();
        this.startAutoSave();
    }

    initializeElements() {
        this.pencilsElement = document.getElementById('pencils');
        this.ppsElement = document.getElementById('pps');
        this.clickPowerElement = document.getElementById('click-power');
        this.pushButton = document.getElementById('push-pencil');
        this.upgradesGrid = document.querySelector('.upgrades-grid');
        
        // Create enlightenment section
        const enlightenmentSection = document.createElement('div');
        enlightenmentSection.className = 'enlightenment-section';
        enlightenmentSection.innerHTML = `
            <h2>Pencil Enlightenment</h2>
            <p>Points: <span id="enlightenment-points">0</span></p>
            <p>Current Bonus: <span id="enlightenment-bonus">1x</span></p>
            <p>Enlightenments: <span id="enlightenment-count">0</span></p>
            <p>Cost: <span id="enlightenment-cost">1,000,000</span> pencils</p>
            <button id="enlightenment-button" class="enlightenment-button">Achieve Enlightenment</button>
        `;
        // Insert after the stats section
        const statsSection = document.querySelector('.stats');
        statsSection.parentNode.insertBefore(enlightenmentSection, statsSection.nextSibling);
        
        // Create footer with reset button
        const footer = document.createElement('footer');
        footer.className = 'game-footer';
        footer.innerHTML = `
            <div class="footer-buttons">
                <button id="reset-button" class="reset-button">Reset Game</button>
                <button id="revoke-cookies" class="revoke-button">Revoke Cookies</button>
            </div>
        `;
        document.querySelector('.game-container').appendChild(footer);
        
        this.enlightenmentPointsElement = document.getElementById('enlightenment-points');
        this.enlightenmentBonusElement = document.getElementById('enlightenment-bonus');
        this.enlightenmentCostElement = document.getElementById('enlightenment-cost');
        this.enlightenmentCountElement = document.getElementById('enlightenment-count');
        this.enlightenmentButton = document.getElementById('enlightenment-button');
        this.resetButton = document.getElementById('reset-button');
        this.revokeButton = document.getElementById('revoke-cookies');
    }

    setupEventListeners() {
        this.pushButton.addEventListener('click', () => this.pushPencil());
        this.enlightenmentButton.addEventListener('click', () => this.achieveEnlightenment());
        this.resetButton.addEventListener('click', () => this.confirmReset());
        this.revokeButton.addEventListener('click', () => this.revokeCookies());
        this.renderUpgrades();
    }

    calculateEnlightenmentPoints() {
        const basePoints = Math.floor(Math.log10(this.pencils + 1) * 10);
        const upgradePoints = this.upgrades.reduce((sum, upgrade) => sum + upgrade.owned, 0);
        return Math.floor(basePoints + upgradePoints);
    }

    achieveEnlightenment() {
        if (this.pencils >= this.enlightenmentCost) {
            const points = this.calculateEnlightenmentPoints();
            this.enlightenmentPoints += points;
            this.enlightenmentMultiplier *= 1.1;
            this.enlightenmentCost = Math.floor(this.enlightenmentCost * 2);
            this.enlightenmentCount++;
            
            // Reset game state
            this.pencils = 0;
            this.pencilsPerSecond = 0;
            this.clickPower = 1;
            this.pencilMultiplier = 1;
            this.clickMultiplier = 1;
            this.upgrades.forEach(upgrade => {
                upgrade.owned = 0;
                upgrade.cost = upgrade.initialCost || upgrade.cost;
            });
            
            this.updateUI();
            this.renderUpgrades();
            this.saveGame();
        }
    }

    pushPencil() {
        this.pencils += this.clickPower * this.clickMultiplier * this.enlightenmentMultiplier;
        this.updateUI();
        this.saveGame();
    }

    buyUpgrade(upgrade) {
        if (this.pencils >= upgrade.cost) {
            this.pencils -= upgrade.cost;
            upgrade.effect();
            upgrade.owned++;
            upgrade.cost = Math.floor(upgrade.cost * 1.5);
            this.updateUI();
            this.renderUpgrades();
            this.saveGame();
        }
    }

    updateUpgradeStates() {
        const upgradeElements = this.upgradesGrid.querySelectorAll('.upgrade');
        upgradeElements.forEach((element, index) => {
            const upgrade = this.upgrades[index];
            if (this.pencils >= upgrade.cost) {
                element.classList.remove('disabled');
            } else {
                element.classList.add('disabled');
            }
        });
    }

    renderUpgrades() {
        this.upgradesGrid.innerHTML = '';
        this.upgrades.forEach(upgrade => {
            // Skip hidden upgrades unless conditions are met
            if (upgrade.hidden && !this.canShowUpgrade(upgrade)) {
                return;
            }
            
            const upgradeElement = document.createElement('div');
            upgradeElement.className = `upgrade ${this.pencils < upgrade.cost ? 'disabled' : ''}`;
            upgradeElement.innerHTML = `
                <h3>${upgrade.name}</h3>
                <p>${upgrade.description}</p>
                <p>Cost: <span class="cost">${upgrade.cost.toLocaleString()} pencils</span></p>
                <p>Owned: ${upgrade.owned}</p>
            `;
            upgradeElement.addEventListener('click', () => this.buyUpgrade(upgrade));
            this.upgradesGrid.appendChild(upgradeElement);
        });
    }

    canShowUpgrade(upgrade) {
        if (upgrade.name === "Cosmic Pencil") {
            return this.enlightenmentCount >= 5;
        }
        return true;
    }

    showEnding() {
        const endingOverlay = document.createElement('div');
        endingOverlay.className = 'ending-overlay';
        endingOverlay.innerHTML = `
            <div class="ending-content">
                <h1>You Have Achieved Pencil Nirvana</h1>
                <p>Through countless enlightenments and infinite pencils, you have transcended reality itself.</p>
                <p>You are now one with the Cosmic Pencil.</p>
                <p>Your journey is complete.</p>
                <div class="stats-summary">
                    <p>Total Enlightenments: ${this.enlightenmentCount}</p>
                    <p>Final Enlightenment Points: ${this.enlightenmentPoints}</p>
                    <p>Final Multiplier: ${this.enlightenmentMultiplier.toFixed(1)}x</p>
                </div>
            </div>
        `;
        document.body.appendChild(endingOverlay);
    }

    updateUI() {
        this.pencilsElement.textContent = Math.floor(this.pencils);
        this.ppsElement.textContent = (this.pencilsPerSecond * this.pencilMultiplier * this.enlightenmentMultiplier).toFixed(1);
        this.clickPowerElement.textContent = (this.clickPower * this.clickMultiplier * this.enlightenmentMultiplier).toFixed(1);
        this.enlightenmentPointsElement.textContent = this.enlightenmentPoints;
        this.enlightenmentBonusElement.textContent = this.enlightenmentMultiplier.toFixed(1) + 'x';
        this.enlightenmentCostElement.textContent = this.enlightenmentCost.toLocaleString();
        this.enlightenmentCountElement.textContent = this.enlightenmentCount;
        
        // Update enlightenment button state
        if (this.pencils >= this.enlightenmentCost) {
            this.enlightenmentButton.classList.remove('disabled');
        } else {
            this.enlightenmentButton.classList.add('disabled');
        }
        
        this.updateUpgradeStates();
    }

    startGameLoop() {
        setInterval(() => {
            this.pencils += this.pencilsPerSecond * this.pencilMultiplier * this.enlightenmentMultiplier;
            this.updateUI();
            this.saveGame();
        }, 1000);
    }

    confirmReset() {
        if (confirm('Are you sure you want to reset the game? This will erase ALL progress, including enlightenments and achievements. This cannot be undone!')) {
            this.resetGame();
        }
    }

    resetGame() {
        // Reset all game state
        this.pencils = 0;
        this.pencilsPerSecond = 0;
        this.clickPower = 1;
        this.pencilMultiplier = 1;
        this.clickMultiplier = 1;
        this.enlightenmentPoints = 0;
        this.enlightenmentMultiplier = 1;
        this.enlightenmentCost = 1000000;
        this.enlightenmentCount = 0;
        this.hasAchievedCosmicPencil = false;
        
        // Reset upgrades
        this.upgrades.forEach(upgrade => {
            upgrade.owned = 0;
            upgrade.cost = upgrade.initialCost || upgrade.cost;
        });
        
        // Clear saved game
        if (this.cookieConsent) {
            localStorage.removeItem('pencilPusherSave');
        }
        
        // Update UI
        this.updateUI();
        this.renderUpgrades();
        
        // Remove ending overlay if it exists
        const endingOverlay = document.querySelector('.ending-overlay');
        if (endingOverlay) {
            endingOverlay.remove();
        }
    }

    checkCookieConsent() {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            this.showCookieConsent();
        } else {
            this.cookieConsent = true;
        }
    }

    showCookieConsent() {
        const consentDialog = document.createElement('div');
        consentDialog.className = 'cookie-consent';
        consentDialog.innerHTML = `
            <div class="cookie-content">
                <h3>Cookie Consent</h3>
                <p>This game uses cookies to save your progress. Your game data is stored locally and is not shared with anyone.</p>
                <div class="cookie-buttons">
                    <button id="accept-cookies" class="cookie-button accept">Accept</button>
                    <button id="decline-cookies" class="cookie-button decline">Decline</button>
                </div>
            </div>
        `;
        document.body.appendChild(consentDialog);

        document.getElementById('accept-cookies').addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'true');
            this.cookieConsent = true;
            consentDialog.remove();
        });

        document.getElementById('decline-cookies').addEventListener('click', () => {
            consentDialog.remove();
        });
    }

    saveGame() {
        if (!this.cookieConsent) return;

        const gameState = {
            pencils: this.pencils,
            pencilsPerSecond: this.pencilsPerSecond,
            clickPower: this.clickPower,
            pencilMultiplier: this.pencilMultiplier,
            clickMultiplier: this.clickMultiplier,
            enlightenmentPoints: this.enlightenmentPoints,
            enlightenmentMultiplier: this.enlightenmentMultiplier,
            enlightenmentCost: this.enlightenmentCost,
            enlightenmentCount: this.enlightenmentCount,
            hasAchievedCosmicPencil: this.hasAchievedCosmicPencil,
            upgrades: this.upgrades.map(upgrade => ({
                owned: upgrade.owned,
                cost: upgrade.cost
            }))
        };

        try {
            localStorage.setItem('pencilPusherSave', JSON.stringify(gameState));
        } catch (e) {
            console.error('Error saving game:', e);
        }
    }

    loadGame() {
        if (!this.cookieConsent) return;

        try {
            const savedGame = localStorage.getItem('pencilPusherSave');
            if (savedGame) {
                const gameState = JSON.parse(savedGame);
                this.pencils = gameState.pencils;
                this.pencilsPerSecond = gameState.pencilsPerSecond;
                this.clickPower = gameState.clickPower;
                this.pencilMultiplier = gameState.pencilMultiplier;
                this.clickMultiplier = gameState.clickMultiplier;
                this.enlightenmentPoints = gameState.enlightenmentPoints;
                this.enlightenmentMultiplier = gameState.enlightenmentMultiplier;
                this.enlightenmentCost = gameState.enlightenmentCost;
                this.enlightenmentCount = gameState.enlightenmentCount;
                this.hasAchievedCosmicPencil = gameState.hasAchievedCosmicPencil;
                
                gameState.upgrades.forEach((savedUpgrade, index) => {
                    if (this.upgrades[index]) {
                        this.upgrades[index].owned = savedUpgrade.owned;
                        this.upgrades[index].cost = savedUpgrade.cost;
                    }
                });

                this.updateUI();
                this.renderUpgrades();
            }
        } catch (e) {
            console.error('Error loading saved game:', e);
        }
    }

    startAutoSave() {
        setInterval(() => {
            this.saveGame();
        }, 30000); // Save every 30 seconds
    }

    revokeCookies() {
        if (confirm('Are you sure you want to revoke cookie consent? This will delete all saved progress and stop the game from saving. You can accept cookies again later.')) {
            localStorage.removeItem('cookieConsent');
            localStorage.removeItem('pencilPusherSave');
            this.cookieConsent = false;
            this.showCookieConsent();
        }
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
}); 