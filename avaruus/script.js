/*
    AJAN VARTIJAT - MYSTEERIN SKRIPTI
    Versio 24.0 - Laajennus neljään päivämäärään
*/
document.addEventListener('DOMContentLoaded', function() {

    // --- OSA 1: Määritelmät ja vakiot ---
    // MUUTOS: Lisätty neljäs päivämäärä, sekvenssi ja koodi
    const OIKEAT_PAIVAMAARAT = ["05.11.1955", "26.10.1985", "21.10.2015", "02.09.1885"];
    const OIKEA_SEKVENSSI = [27, 32, 12, 33]; // 2+9+1+8+8+5 = 33
    const OIKEAT_KOODIT = [26, 30, 9, 29]; // 33 - 4 = 29
    const LOPULLISET_KOORDINAATIT = "N 61° 00.123 E 025° 00.456"; // !!! VAIHDA TÄMÄ !!!
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const geocachingTerms = ["KÄTKÖ", "REISSARI", "HUNTTI", "PÖLJÄ", "JÄSTI", "DENARI", "MIKKO","KALEVI", "ÖÖRTTI", "MULTI", "TRADI", "MIITTI", "TILTU", "EUKKA", "E5KIMO", "LAHJEMIES", "NAATT1", "MILDE04", "MYSSE"];
    const WARP_GAME_LEVELS = 7;

    // --- Globaalit muuttujat ---
    let kayttajanSekvenssi = [];
    let valittavaSymboli = null;
    let nickname = '';
    let activeTypewriters = [];
    let warpGameSequence = [];
    let playerWarpSequence = [];
    let warpLevel = 0;
    let playerCanClickPad = false;
    let audioContext;
    let audioUnlocked = false;

    // --- DOM-elementtien viittaukset ---
    const elementit = {
        startScreen: document.getElementById('start-screen'),
        startButton: document.getElementById('start-button'),
        sisaltoLaatikko: document.querySelector('.sisalto-laatikko'),
        introSection: document.getElementById('intro-section'),
        loginSection: document.getElementById('login-section'),
        missionBriefingSection: document.getElementById('mission-briefing-section'),
        aikakoneOsio: document.getElementById('aikakone-osio'),
        stargateOsio: document.getElementById('stargate-osio'),
        calibrationOsio: document.getElementById('calibration-osio'),
        warpGameContainer: document.getElementById('warp-game-container'),
        warpCoreOsio: document.getElementById('warp-core-osio'),
        lopputulosOsio: document.getElementById('lopputulos-osio'),
        loginButton: document.getElementById('login-button'),
        loginContainer: document.getElementById('login-container'),
        nicknameInput: document.getElementById('nickname-input'),
        authSequence: document.getElementById('auth-sequence'),
        tarkistaNappi: document.getElementById('tarkista-paivamaarat'),
        confirmButton: document.getElementById('confirm-selection'),
        cancelButton: document.getElementById('cancel-selection'),
        modalOverlay: document.getElementById('modal-overlay'),
        zoomView: document.getElementById('zoom-view'),
        powerUpSequence: document.getElementById('power-up-sequence'),
        powerUpText: document.getElementById('power-up-text'),
        progressBarInner: document.querySelector('.progress-bar-inner'),
        lcarsItems: Array.from(document.querySelectorAll('[id^="glcars-item-"]')),
        stargateOhjeTeksti: document.getElementById('stargate-ohje-teksti'),
        stargateContainer: document.getElementById('stargate-container'),
        syoteNaytto: document.getElementById('syote-naytto'),
        calibrationOhjeTeksti: document.getElementById('calibration-ohje-teksti'),
        calibrationInputsContainer: document.getElementById('calibration-inputs-container'),
        kalibroiNappi: document.getElementById('kalibroi-nappi'),
        logo: document.querySelector('.logo'),
        numberGrid: document.getElementById('number-grid'),
        warpCoreOhje: document.getElementById('warp-core-ohje-teksti'),
        startWarpGameButton: document.getElementById('start-warp-game-button'),
        warpCoreStatus: document.getElementById('warp-core-status'),
        warpLevelDisplay: document.getElementById('warp-level'),
        warpPadsContainer: document.querySelector('.warp-pads-container'),
        warpPads: document.querySelectorAll('.warp-pad'),
        sounds: {
            typewriter: document.getElementById('typewriter-sound'),
            pad1: document.getElementById('pad-sound-1'),
            pad2: document.getElementById('pad-sound-2'),
            pad3: document.getElementById('pad-sound-3'),
            pad4: document.getElementById('pad-sound-4'),
            error: document.getElementById('error-sound'),
            powerup: document.getElementById('power-up-sound'),
            stargate: document.getElementById('stargate-active-sound')
        }
    };
    
    // --- APUFUNKTIOT ---
    function unlockAudio() {
        if (audioUnlocked) return;
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            audioUnlocked = true;
        } catch (e) {}
    }

    // --- ÄÄNILOGIIKKA ---
    function playSound(soundElement) {
        if (!audioUnlocked || !soundElement) return;
        soundElement.pause();
        soundElement.currentTime = 0;
        soundElement.play().catch(e => {});
    }

    function startTypingSound() {
        if (!audioUnlocked) return;
        const typewriterSound = elementit.sounds.typewriter;
        if (typewriterSound && typewriterSound.paused) {
            typewriterSound.play().catch(e => {});
        }
    }

    function stopTypingSound() {
        if (!audioUnlocked) return;
        setTimeout(() => {
            if (activeTypewriters.length === 0) {
                const typewriterSound = elementit.sounds.typewriter;
                if (typewriterSound) {
                    typewriterSound.pause();
                    typewriterSound.currentTime = 0;
                }
            }
        }, 100); 
    }

    // --- TYPEWRITER ---
    function typeWriter(element, text, speed, callback) { 
        let i = 0; 
        const oldCursor = element.querySelector('.typewriter-cursor'); 
        if (oldCursor) oldCursor.remove(); 
        element.innerHTML = ""; 
        const cursorSpan = document.createElement('span'); 
        cursorSpan.className = 'typewriter-cursor'; 
        element.appendChild(cursorSpan);
        startTypingSound();
        const writerObject = { element: element, text: text, callback: callback, id: null };
        const intervalId = setInterval(() => { 
            if (i < text.length) { 
                cursorSpan.insertAdjacentText('beforebegin', text.charAt(i)); 
                i++; 
            } else { 
                clearInterval(intervalId); 
                activeTypewriters = activeTypewriters.filter(w => w.id !== writerObject.id); 
                stopTypingSound();
                if (element.contains(cursorSpan)) { 
                    element.removeChild(cursorSpan); 
                } 
                if (callback) setTimeout(callback, 500); 
            } 
        }, speed);
        writerObject.id = intervalId;
        activeTypewriters.push(writerObject);
    }

    // --- Muut apufunktiot ---
    function skipCurrentAnimations() { if (activeTypewriters.length === 0) return; const writersToSkip = [...activeTypewriters]; activeTypewriters = []; writersToSkip.forEach(writer => { clearInterval(writer.id); writer.element.innerHTML = writer.text; if (writer.callback) { writer.callback(); } }); stopTypingSound(); }
    function populateNumberGrid() { if (!elementit.numberGrid) return; const fragment = document.createDocumentFragment(); for (let i = 0; i < 150; i++) { const numSpan = document.createElement('span'); const numLength = Math.floor(Math.random() * 4) + 1; numSpan.textContent = Math.random().toString().slice(2, 2 + numLength); fragment.appendChild(numSpan); } elementit.numberGrid.appendChild(fragment); }
    function updateNumberGrid() { if (!elementit.numberGrid || elementit.numberGrid.children.length === 0) return; const updateCount = 5; for (let i = 0; i < updateCount; i++) { const randomIndex = Math.floor(Math.random() * elementit.numberGrid.children.length); const numSpan = elementit.numberGrid.children[randomIndex]; if(numSpan) { const numLength = Math.floor(Math.random() * 4) + 1; numSpan.textContent = Math.random().toString().slice(2, 2 + numLength); } } }
    function generateRandomGcCode() { const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; let result = ''; const length = Math.floor(Math.random() * 3) + 4; for (let i = 0; i < length; i++) { result += charset.charAt(Math.floor(Math.random() * charset.length)); } return 'GC' + result; }
    function updateLcarsBlocks() { if (elementit.lcarsItems.length === 0) return; const updateCount = Math.floor(Math.random() * 3) + 1; for (let i = 0; i < updateCount; i++) { const randomIndex = Math.floor(Math.random() * elementit.lcarsItems.length); const block = elementit.lcarsItems[randomIndex]; if (!block || block.classList.contains('is-updating')) continue; block.classList.add('is-updating'); let newText = ''; if (Math.random() < 0.3) { newText = geocachingTerms[Math.floor(Math.random() * geocachingTerms.length)]; } else { newText = generateRandomGcCode(); } setTimeout(() => { block.textContent = newText; setTimeout(() => { block.classList.remove('is-updating'); }, 50); }, 150); } }
    function naytaVirhe(viesti) { const virheViestiOsio = document.getElementById('virhe-viesti'); const virheTeksti = document.getElementById('virhe-teksti'); virheTeksti.textContent = viesti; virheViestiOsio.classList.remove('piilotettu'); setTimeout(() => { virheViestiOsio.classList.add('piilotettu'); }, 3000); }
    function toggleZoomView(show = false) { elementit.modalOverlay.classList.toggle('piilotettu', !show); elementit.zoomView.classList.toggle('piilotettu', !show); if (!show) valittavaSymboli = null; }

    // --- POIMUYDIN-PELIN LOGIIKKA ---
    function startWarpGame() {
        elementit.warpCoreOhje.innerHTML = '';
        const ohjeTeksti = `Erinomaista, ${nickname}! Kenttä on vakaa, mutta se aiheutti virtapiikin poimuytimeen! Sinun on manuaalisesti vahvistettava ytimen ohjaussekvenssit. Toista näkemäsi valo- ja äänisarja.`;
        typeWriter(elementit.warpCoreOhje, ohjeTeksti, 40, () => {
            elementit.startWarpGameButton.classList.remove('piilotettu');
        });
    }
    function runWarpGame() {
        elementit.startWarpGameButton.classList.add('piilotettu');
        elementit.warpCoreStatus.classList.remove('piilotettu');
        elementit.warpPadsContainer.classList.remove('piilotettu');
        warpLevel = 0;
        warpGameSequence = [];
        setTimeout(nextWarpRound, 500);
    }
    function nextWarpRound() {
        warpLevel++;
        elementit.warpLevelDisplay.textContent = warpLevel;
        playerWarpSequence = [];
        playerCanClickPad = false;
        const newStep = Math.floor(Math.random() * 4) + 1;
        warpGameSequence.push(newStep);
        playWarpSequence();
    }
    function playWarpSequence() {
        let i = 0;
        const sequenceInterval = setInterval(() => {
            if (i >= warpGameSequence.length) {
                clearInterval(sequenceInterval);
                playerCanClickPad = true;
                return;
            }
            lightUpPad(warpGameSequence[i]);
            i++;
        }, 800);
    }
    function lightUpPad(padId) {
        const pad = document.querySelector(`.warp-pad[data-pad='${padId}']`);
        const sound = elementit.sounds[`pad${padId}`];
        if (!pad || !sound) return;
        pad.classList.add('lit');
        playSound(sound);
        setTimeout(() => pad.classList.remove('lit'), 400);
    }
    function warpPadClickHandler(e) {
        if (!playerCanClickPad) return;
        const padElement = e.currentTarget;
        const padId = parseInt(padElement.dataset.pad, 10);
        lightUpPad(padId);
        playerWarpSequence.push(padId);
        const lastIndex = playerWarpSequence.length - 1;
        if (playerWarpSequence[lastIndex] !== warpGameSequence[lastIndex]) {
            playSound(elementit.sounds.error);
            naytaVirhe("Sekvenssivirhe! Ytimen epävakaus kasvaa... Yritetään alusta.");
            playerCanClickPad = false;
            elementit.warpPadsContainer.classList.add('piilotettu');
            elementit.warpCoreStatus.classList.add('piilotettu');
            startWarpGame();
            return;
        }
        if (playerWarpSequence.length === warpGameSequence.length) {
            playerCanClickPad = false;
            if (warpLevel >= WARP_GAME_LEVELS) {
                setTimeout(warpGameWin, 1000);
            } else {
                setTimeout(nextWarpRound, 1500);
            }
        }
    }
    function warpGameWin() {
        document.getElementById('lopputulos-osio').classList.remove('piilotettu');
        document.getElementById('warp-game-container').classList.add('osio-valmis');
    }

    // --- PÄÄLOGIIKKA ---
    function startIntro() { const introText1 = `Suuret kilowatit! Kuuletko minua? Täällä tohtori Erkki Ruskea! Aikakoneen ja jonkin vieraan porttiteknologian yhteensulautuma on luonut vaarallisen aikaparadoksin!`; const introText2 = `Jotta voimme palata takaisin tulevaisuuteen – tai ylipäätään mihinkään tulevaisuuteen – meidän on kalibroitava tämä sotku. Tarvitsen sinulta ne **neljä** tärkeintä päivämäärää seikkailuistamme. Syötä ne aikapiireihin, niin voimme vakauttaa jatkumon. Olen yhdistänyt sinut suoraan järjestelmään.`; typeWriter(document.getElementById('intro-text-1'), introText1, 50, () => { typeWriter(document.getElementById('intro-text-2'), introText2, 40, () => { elementit.loginSection.classList.remove('piilotettu'); const loginHeading = document.getElementById('login-heading'); typeWriter(loginHeading, "YHDISTETÄÄN AIKAKONEEN PÄÄTTEESEEN", 70, () => { let dotCount = 0; const dotInterval = setInterval(() => { if (dotCount < 4) { loginHeading.textContent += "."; dotCount++; } else { clearInterval(dotInterval); setTimeout(() => { elementit.loginContainer.classList.remove('piilotettu'); elementit.nicknameInput.focus(); }, 300); } }, 400); }); }); }); }
    function runAuthSequence(nickname) { const authMessages = ["Yhdistetään aikakoneen verkkoon...",`Haetaan tunnistetta: ${nickname}...`,"Varmennetaan kvanttisignatuuria...",`Tunniste ${nickname} hyväksytty!`,`Tervetuloa järjestelmään, ${nickname}.`]; const authTextElement = document.getElementById('auth-text'); let messageIndex = 0; function showNextMessage() { if (messageIndex < authMessages.length) { authTextElement.textContent = authMessages[messageIndex]; messageIndex++; setTimeout(showNextMessage, 2200); } else { elementit.authSequence.classList.add('fade-out'); setTimeout(() => { showMissionBriefing(nickname); elementit.authSequence.classList.remove('fade-out'); }, 500); } } showNextMessage(); }
    function showMissionBriefing(nickname) { elementit.introSection.classList.add('piilotettu'); elementit.loginSection.classList.add('piilotettu'); elementit.missionBriefingSection.classList.remove('piilotettu'); const missionText = `Hienoa, ${nickname}, että pääsit linjoille! Tehtäväsi on elintärkeä: syötä ne **neljä** kohtalokasta päivämäärää aikakoneen piireihin. Ne toimivat ajallisina ankkureina ja korjaavat paradoksin. Onnistuminen paljastaa symbolit, joilla saat portin soitettua ja palkkion koordinaatit. Älä aikaile, koko aika-avaruusjatkumo on sinusta kiinni! Tohtori Erkki Ruskea, loppu.`; typeWriter(document.getElementById('mission-text'), missionText, 30, () => { elementit.aikakoneOsio.classList.remove('piilotettu'); document.getElementById('day1').focus(); }); }
    function runPowerUpSequence() { playSound(elementit.sounds.powerup); elementit.powerUpSequence.classList.remove('piilotettu'); const powerUpMessages = ["Tarkistetaan ajallista siirtymää...", "Synkronoidaan vuon kondensaattoria...", "Aikapiirit vakaat! Reititetään virtaa...", "Portin matriisi aktivoitu! Valmistaudutaan aktivointiin..."]; setTimeout(() => { elementit.powerUpText.textContent = powerUpMessages[0]; }, 0); setTimeout(() => { elementit.powerUpText.textContent = powerUpMessages[1]; }, 1000); setTimeout(() => { elementit.powerUpText.textContent = powerUpMessages[2]; }, 2500); setTimeout(() => { elementit.powerUpText.textContent = powerUpMessages[3]; }, 3800); setTimeout(() => { elementit.progressBarInner.style.width = '100%'; }, 100); setTimeout(() => { elementit.powerUpSequence.classList.add('piilotettu'); elementit.stargateOsio.classList.remove('piilotettu'); showStargateInstructions(); }, 4500); }
    
    function showStargateInstructions() { 
        const ohjeTeksti = `Loistavaa, ${nickname}! Virta on vakaa, mutta portti vaatii vielä oikean symbolisekvenssin. Olen päätellyt, että tarvittavat symbolit liittyvät niihin **neljään** päivämäärään. Laske kunkin päivämäärän numerot yhteen. Esimerkiksi 01.01.2000 olisi 1+1+2, eli symboli 4. Syötä **neljä** symbolia oikeassa järjestyksessä, niin tämä sotku on selvitetty!`; 
        typeWriter(elementit.stargateOhjeTeksti, ohjeTeksti, 40, () => { elementit.stargateContainer.classList.remove('piilotettu'); elementit.syoteNaytto.classList.remove('piilotettu'); luoStargateSymbolit(); }); 
    }
    
    function addSymbolToSequence(symbolId, symbolElement) { 
        // MUUTOS: Tarkistetaan 4, ei 3
        if (kayttajanSekvenssi.length >= 4 || kayttajanSekvenssi.includes(symbolId)) return; 
        kayttajanSekvenssi.push(symbolId); 
        document.getElementById('symboli-jono').textContent = kayttajanSekvenssi.join(' - '); 
        if (symbolElement) symbolElement.classList.add('selected'); 
        // MUUTOS: Tarkistetaan 4, ei 3
        if (kayttajanSekvenssi.length === 4) setTimeout(tarkistaSekvenssi, 500); 
    }
    
    function tarkistaSekvenssi() { 
        if (JSON.stringify(kayttajanSekvenssi) === JSON.stringify(OIKEA_SEKVENSSI)) { 
            playSound(elementit.sounds.stargate); 
            document.getElementById('event-horizon').classList.add('active'); 
            setTimeout(() => { 
                elementit.stargateOsio.classList.add('osio-valmis'); 
                elementit.calibrationOsio.classList.remove('piilotettu'); 
                showCalibrationInstructions(); 
            }, 1500); 
        } else { 
            playSound(elementit.sounds.error); 
            naytaVirhe("Virheellinen sekvenssi. Portti nollataan."); 
            kayttajanSekvenssi = []; 
            document.getElementById('symboli-jono').textContent = ""; 
            document.querySelectorAll('.stargate-symbol.selected').forEach(el => el.classList.remove('selected')); 
        } 
    }

    function showCalibrationInstructions() { 
        const ohjeTeksti = `Upeaa työtä, ${nickname}! Portti on auki, mutta fuusio aikakoneen kanssa tekee siitä vaarallisen epävakaan! Ennen kuin voimme saada turvallisen lukeman kätkön koordinaatteihin, meidän on kalibroitava aluksen suojakenttä kompensoimaan portin energiavaihteluita. Olen ohjannut tarvittavat kontrollit LCARS-päätteelle. Taajuudet täytyy laskea portin omasta avaussekvenssistä: ota kukin valitsemasi symbolin numero ja vähennä siitä sen järjestysnumero (1, 2, 3 tai 4). Tämä antaa meille tarvittavat **neljä** kalibrointikoodia.`; 
        typeWriter(elementit.calibrationOhjeTeksti, ohjeTeksti, 40, () => { elementit.calibrationInputsContainer.classList.remove('piilotettu'); document.getElementById('freq1').focus(); }); 
    }
    
    function luoStargateSymbolit() { const stargateContainer = document.getElementById('stargate-container'); if (!stargateContainer || stargateContainer.querySelectorAll('.stargate-symbol').length > 0) return; const symbolienMaara = 39; const sade = stargateContainer.offsetWidth / 2 - 25; for (let i = 1; i <= symbolienMaara; i++) { const symboliElementti = document.createElement('div'); symboliElementti.classList.add('stargate-symbol'); symboliElementti.textContent = i; symboliElementti.dataset.symbolId = i; const kulma = (i / symbolienMaara) * 2 * Math.PI - (Math.PI / 2); const x = sade * Math.cos(kulma) + sade; const y = sade * Math.sin(kulma) + sade; symboliElementti.style.left = `${x}px`; symboliElementti.style.top = `${y}px`; const eventHandler = isTouchDevice ? 'touchend' : 'click'; symboliElementti.addEventListener(eventHandler, (event) => { event.preventDefault(); if(event.target.classList.contains('selected')) return; const symbolId = parseInt(event.target.dataset.symbolId); if (isTouchDevice) { valittavaSymboli = symbolId; document.getElementById('zoomed-symbol').textContent = valittavaSymboli; toggleZoomView(true); } else { addSymbolToSequence(symbolId, event.target); } }); stargateContainer.appendChild(symboliElementti); } }
    
    // --- TAPAHTUMANKUUNTELIJAT ---
    elementit.startButton.addEventListener('click', () => {
        unlockAudio();
        elementit.startScreen.style.display = 'none';
        elementit.sisaltoLaatikko.style.display = 'block';
        startIntro();
    });
    elementit.loginButton.addEventListener('click', () => { nickname = elementit.nicknameInput.value.trim(); if (nickname === "") { alert("Syötä nimimerkki jatkaaksesi."); return; } elementit.loginContainer.classList.add('piilotettu'); elementit.authSequence.classList.remove('piilotettu'); runAuthSequence(nickname); });
    
    elementit.kalibroiNappi.addEventListener('click', () => {
        // MUUTOS: Kerätään neljä arvoa
        const syotetytKoodit = [
            parseInt(document.getElementById('freq1').value, 10), 
            parseInt(document.getElementById('freq2').value, 10), 
            parseInt(document.getElementById('freq3').value, 10),
            parseInt(document.getElementById('freq4').value, 10)
        ];
        if (JSON.stringify(syotetytKoodit) === JSON.stringify(OIKEAT_KOODIT)) {
            elementit.calibrationOsio.classList.add('osio-valmis');
            elementit.warpGameContainer.classList.remove('piilotettu');
            startWarpGame();
        } else {
            playSound(elementit.sounds.error);
            naytaVirhe("Kalibrointi epäonnistui. Tarkista taajuudet ja yritä uudelleen.");
        }
    });

    elementit.startWarpGameButton.addEventListener('click', runWarpGame);
    
    elementit.tarkistaNappi.addEventListener('click', function() {
        const formatNumber = (num) => num.toString().padStart(2, '0');
        // MUUTOS: Kerätään neljä päivämäärää
        const date1 = `${formatNumber(document.getElementById('day1').value)}.${formatNumber(document.getElementById('month1').value)}.${document.getElementById('year1').value}`;
        const date2 = `${formatNumber(document.getElementById('day2').value)}.${formatNumber(document.getElementById('month2').value)}.${document.getElementById('year2').value}`;
        const date3 = `${formatNumber(document.getElementById('day3').value)}.${formatNumber(document.getElementById('month3').value)}.${document.getElementById('year3').value}`;
        const date4 = `${formatNumber(document.getElementById('day4').value)}.${formatNumber(document.getElementById('month4').value)}.${document.getElementById('year4').value}`;
        const syotetytPaivamaarat = [date1, date2, date3, date4].sort();
        const oikeatJarjestetty = [...OIKEAT_PAIVAMAARAT].sort();

        if (JSON.stringify(syotetytPaivamaarat) === JSON.stringify(oikeatJarjestetty)) {
            elementit.aikakoneOsio.classList.add('osio-valmis');
            runPowerUpSequence();
        } else {
            playSound(elementit.sounds.error);
            naytaVirhe("Päivämäärät eivät täsmää. Tarkista aikakoneen lokitiedot ja yritä uudelleen.");
        }
    });

    elementit.confirmButton.addEventListener('click', () => { if (valittavaSymboli !== null) { const originalSymbol = document.querySelector(`[data-symbol-id='${valittavaSymboli}']`); addSymbolToSequence(valittavaSymboli, originalSymbol); toggleZoomView(false); } });
    elementit.cancelButton.addEventListener('click', () => toggleZoomView(false));
    elementit.modalOverlay.addEventListener('click', () => toggleZoomView(false));
    elementit.warpPads.forEach(pad => {
        const eventType = isTouchDevice ? 'touchend' : 'click';
        pad.addEventListener(eventType, (e) => { e.preventDefault(); warpPadClickHandler(e); });
    });
    
    // --- KÄYNNISTYS ---
    updateLcarsBlocks();
    setInterval(updateLcarsBlocks, 400);
    populateNumberGrid();
    setInterval(updateNumberGrid, 200);
    if(elementit.logo) {
        elementit.logo.addEventListener('click', skipCurrentAnimations);
        elementit.logo.style.cursor = 'pointer';
    }
});
