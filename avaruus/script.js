/*
    AJAN VARTIJAT - MYSTEERIN SKRIPTI
    Versio 14.3 - Dynaaminen portin ohjeistus
*/
document.addEventListener('DOMContentLoaded', function() {

    // --- OSA 1: Määritelmät ja vakiot ---
    const OIKEAT_PAIVAMAARAT = ["05.11.1955", "26.10.1985", "21.10.2015"];
    const OIKEA_SEKVENSSI = [27, 32, 12];
    const LOPULLISET_KOORDINAATIT = "N 61° 00.123 E 025° 00.456"; // !!! VAIHDA TÄMÄ !!!
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const geocachingTerms = ["KÄTKÖ", "REISSARI", "HUNTTI", "PÖLJÄ", "JÄSTI", "DENARI", "MIKKO","KALEVI", "ÖÖRTTI", "MULTI", "TRADI", "MIITTI", "TILTU", "EUKKA", "E5KIMO", "LAHJEMIES", "NAATT1", "MILDE04", "MYSSE"];

    // --- Globaalit muuttujat ---
    let kayttajanSekvenssi = [];
    let valittavaSymboli = null;
    let nickname = ''; // Nimimerkki tallennetaan tänne globaalisti

    // --- DOM-elementtien viittaukset ---
    const elementit = {
        introSection: document.getElementById('intro-section'),
        loginSection: document.getElementById('login-section'),
        missionBriefingSection: document.getElementById('mission-briefing-section'),
        aikakoneOsio: document.getElementById('aikakone-osio'),
        stargateOsio: document.getElementById('stargate-osio'),
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
        syoteNaytto: document.getElementById('syote-naytto')
    };
    
    // --- OSA 2: APUFUNKTIOT ---
    function generateRandomGcCode() {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        const length = Math.floor(Math.random() * 3) + 4;
        for (let i = 0; i < length; i++) {
            result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return 'GC' + result;
    }

    function updateLcarsBlocks() {
        if (elementit.lcarsItems.length === 0) return;
        const updateCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < updateCount; i++) {
            const randomIndex = Math.floor(Math.random() * elementit.lcarsItems.length);
            const block = elementit.lcarsItems[randomIndex];
            if (!block || block.classList.contains('is-updating')) continue;
            block.classList.add('is-updating');
            let newText = '';
            if (Math.random() < 0.3) {
                newText = geocachingTerms[Math.floor(Math.random() * geocachingTerms.length)];
            } else {
                newText = generateRandomGcCode();
            }
            setTimeout(() => {
                block.textContent = newText;
                setTimeout(() => { block.classList.remove('is-updating'); }, 50);
            }, 150);
        }
    }

    function naytaVirhe(viesti) {
        const virheViestiOsio = document.getElementById('virhe-viesti');
        const virheTeksti = document.getElementById('virhe-teksti');
        virheTeksti.textContent = viesti;
        virheViestiOsio.classList.remove('piilotettu');
        setTimeout(() => { virheViestiOsio.classList.add('piilotettu'); }, 3000);
    }
    
    function typeWriter(element, text, speed, callback) {
        let i = 0;
        element.innerHTML = "";
        const cursorSpan = document.createElement('span');
        cursorSpan.className = 'typewriter-cursor';
        element.appendChild(cursorSpan);
        const typing = setInterval(() => {
            if (i < text.length) {
                cursorSpan.insertAdjacentText('beforebegin', text.charAt(i));
                i++;
            } else {
                element.removeChild(cursorSpan);
                clearInterval(typing);
                if (callback) setTimeout(callback, 500);
            }
        }, speed);
    }

    function toggleZoomView(show = false) {
        elementit.modalOverlay.classList.toggle('piilotettu', !show);
        elementit.zoomView.classList.toggle('piilotettu', !show);
        if (!show) valittavaSymboli = null;
    }

    // --- OSA 3: PÄÄLOGIIKKA JA VAIHEET ---
    function startIntro() {
        // --- NIMET MUUTETTU: Emmett -> Erkki, DeLorean -> aikakone ---
        const introText1 = `Suuret kilowatit! Kuuletko minua? Täällä tohtori Erkki Ruskea! Aikakoneen ja jonkin vieraan porttiteknologian yhteensulautuma on luonut vaarallisen aikaparadoksin!`;
        const introText2 = `Jotta voimme palata takaisin tulevaisuuteen – tai ylipäätään mihinkään tulevaisuuteen – meidän on kalibroitava tämä sotku. Tarvitsen sinulta ne kolme tärkeintä päivämäärää seikkailuistamme. Syötä ne aikapiireihin, niin voimme vakauttaa jatkumon. Olen yhdistänyt sinut suoraan järjestelmään.`;
        
        typeWriter(document.getElementById('intro-text-1'), introText1, 50, () => {
            typeWriter(document.getElementById('intro-text-2'), introText2, 40, () => {
                elementit.loginSection.classList.remove('piilotettu');
                const loginHeading = document.getElementById('login-heading');
                typeWriter(loginHeading, "YHDISTETÄÄN AIKAKONEEN PÄÄTTEESEEN", 70, () => {
                    let dotCount = 0;
                    const dotInterval = setInterval(() => {
                        if (dotCount < 4) {
                            loginHeading.textContent += ".";
                            dotCount++;
                        } else {
                            clearInterval(dotInterval);
                            setTimeout(() => {
                                elementit.loginContainer.classList.remove('piilotettu');
                                elementit.nicknameInput.focus();
                            }, 300);
                        }
                    }, 400);
                });
            });
        });
    }

    function runAuthSequence(nickname) {
        const authMessages = [
            "Yhdistetään aikakoneen verkkoon...",
            `Haetaan tunnistetta: ${nickname}...`,
            "Varmennetaan kvanttisignatuuria...",
            `Tunniste ${nickname} hyväksytty!`,
            `Tervetuloa järjestelmään, ${nickname}.`
        ];
        const authTextElement = document.getElementById('auth-text');
        let messageIndex = 0;
        function showNextMessage() {
            if (messageIndex < authMessages.length) {
                authTextElement.textContent = authMessages[messageIndex];
                messageIndex++;
                setTimeout(showNextMessage, 2200);
            } else {
                elementit.authSequence.classList.add('fade-out');
                setTimeout(() => {
                    showMissionBriefing(nickname);
                    elementit.authSequence.classList.remove('fade-out'); 
                }, 500); 
            }
        }
        showNextMessage();
    }

    function showMissionBriefing(nickname) {
        elementit.introSection.classList.add('piilotettu');
        elementit.loginSection.classList.add('piilotettu');
        elementit.missionBriefingSection.classList.remove('piilotettu');
        // --- Nimi muutettu myös täällä ---
        const missionText = `Hienoa, ${nickname}, että pääsit linjoille! Tehtäväsi on elintärkeä: syötä ne kolme kohtalokasta päivämäärää aikakoneen piireihin. Ne toimivat ajallisina ankkureina ja korjaavat paradoksin. Onnistuminen paljastaa symbolit, joilla saat portin soitettua ja palkkion koordinaatit. Älä aikaile, koko aika-avaruusjatkumo on sinusta kiinni! Tohtori Erkki Ruskea, loppu.`;
        
        typeWriter(document.getElementById('mission-text'), missionText, 30, () => {
            elementit.aikakoneOsio.classList.remove('piilotettu');
            document.getElementById('day1').focus();
        });
    }
    
    function runPowerUpSequence() {
        elementit.powerUpSequence.classList.remove('piilotettu');
        const powerUpMessages = ["Tarkistetaan ajallista siirtymää...", "Synkronoidaan vuon kondensaattoria...", "Aikapiirit vakaat! Reititetään virtaa...", "Portin matriisi aktivoitu! Valmistaudutaan aktivointiin..."];
        setTimeout(() => { elementit.powerUpText.textContent = powerUpMessages[0]; }, 0);
        setTimeout(() => { elementit.powerUpText.textContent = powerUpMessages[1]; }, 1000);
        setTimeout(() => { elementit.powerUpText.textContent = powerUpMessages[2]; }, 2500);
        setTimeout(() => { elementit.powerUpText.textContent = powerUpMessages[3]; }, 3800);
        setTimeout(() => { elementit.progressBarInner.style.width = '100%'; }, 100);
        setTimeout(() => {
            elementit.powerUpSequence.classList.add('piilotettu');
            elementit.stargateOsio.classList.remove('piilotettu');
            // Kutsutaan uutta funktiota, joka hoitaa ohjeiden kirjoittamisen
            showStargateInstructions();
        }, 4500);
    }

    // --- TÄMÄ ON UUSI FUNKTIO PORTIN OHJEILLE ---
    function showStargateInstructions() {
        const ohjeTeksti = `Loistavaa, ${nickname}! Virta on vakaa, mutta portti vaatii vielä oikean symbolisekvenssin. Olen päätellyt, että tarvittavat symbolit liittyvät niihin kolmeen päivämäärään. Laske kunkin päivämäärän numerot yhteen. Esimerkiksi 01.01.2000 olisi 1+1+2, eli symboli 4. Syötä kolme symbolia oikeassa järjestyksessä, niin tämä sotku on selvitetty!`;
        
        typeWriter(elementit.stargateOhjeTeksti, ohjeTeksti, 40, () => {
            // Kun teksti on kirjoitettu, näytetään portti ja luodaan symbolit
            elementit.stargateContainer.classList.remove('piilotettu');
            elementit.syoteNaytto.classList.remove('piilotettu');
            luoStargateSymbolit();
        });
    }

    function addSymbolToSequence(symbolId, symbolElement) {
        if (kayttajanSekvenssi.length >= 3 || kayttajanSekvenssi.includes(symbolId)) return;
        kayttajanSekvenssi.push(symbolId);
        document.getElementById('symboli-jono').textContent = kayttajanSekvenssi.join(' - ');
        if (symbolElement) symbolElement.classList.add('selected');
        if (kayttajanSekvenssi.length === 3) setTimeout(tarkistaSekvenssi, 500);
    }

    function tarkistaSekvenssi() {
        if (JSON.stringify(kayttajanSekvenssi) === JSON.stringify(OIKEA_SEKVENSSI)) {
            elementit.missionBriefingSection.classList.add('piilotettu');
            elementit.aikakoneOsio.classList.add('piilotettu');
            elementit.stargateOsio.classList.add('piilotettu');
            elementit.lopputulosOsio.classList.remove('piilotettu');
            document.getElementById('event-horizon').classList.add('active');
            document.getElementById('koordinaatit').textContent = LOPULLISET_KOORDINAATIT;
        } else {
            naytaVirhe("Virheellinen sekvenssi. Portti nollataan.");
            kayttajanSekvenssi = [];
            document.getElementById('symboli-jono').textContent = "";
            document.querySelectorAll('.stargate-symbol.selected').forEach(el => el.classList.remove('selected'));
        }
    }

    function luoStargateSymbolit() {
        const stargateContainer = document.getElementById('stargate-container');
        if (!stargateContainer || stargateContainer.querySelectorAll('.stargate-symbol').length > 0) return;
        const symbolienMaara = 39;
        const sade = stargateContainer.offsetWidth / 2 - 25;
        for (let i = 1; i <= symbolienMaara; i++) {
            const symboliElementti = document.createElement('div');
            symboliElementti.classList.add('stargate-symbol');
            symboliElementti.textContent = i;
            symboliElementti.dataset.symbolId = i;
            const kulma = (i / symbolienMaara) * 2 * Math.PI - (Math.PI / 2);
            const x = sade * Math.cos(kulma) + sade;
            const y = sade * Math.sin(kulma) + sade;
            symboliElementti.style.left = `${x}px`;
            symboliElementti.style.top = `${y}px`;
            const eventHandler = isTouchDevice ? 'touchend' : 'click';
            symboliElementti.addEventListener(eventHandler, (event) => {
                event.preventDefault();
                if(event.target.classList.contains('selected')) return;
                const symbolId = parseInt(event.target.dataset.symbolId);
                if (isTouchDevice) {
                    valittavaSymboli = symbolId;
                    document.getElementById('zoomed-symbol').textContent = valittavaSymboli;
                    toggleZoomView(true);
                } else {
                    addSymbolToSequence(symbolId, event.target);
                }
            });
            stargateContainer.appendChild(symboliElementti);
        }
    }

    // --- OSA 4: TAPAHTUMANKUUNTELIJAT ---
    elementit.loginButton.addEventListener('click', () => {
        // Tallennetaan nimimerkki globaaliin muuttujaan
        nickname = elementit.nicknameInput.value.trim();
        if (nickname === "") { alert("Syötä nimimerkki jatkaaksesi."); return; }
        elementit.loginContainer.classList.add('piilotettu');
        elementit.authSequence.classList.remove('piilotettu');
        runAuthSequence(nickname);
    });

    elementit.tarkistaNappi.addEventListener('click', function() {
        const formatNumber = (num) => num.toString().padStart(2, '0');
        const date1 = `${formatNumber(document.getElementById('day1').value)}.${formatNumber(document.getElementById('month1').value)}.${document.getElementById('year1').value}`;
        const date2 = `${formatNumber(document.getElementById('day2').value)}.${formatNumber(document.getElementById('month2').value)}.${document.getElementById('year2').value}`;
        const date3 = `${formatNumber(document.getElementById('day3').value)}.${formatNumber(document.getElementById('month3').value)}.${document.getElementById('year3').value}`;
        const syotetytPaivamaarat = [date1, date2, date3].sort();
        const oikeatJarjestetty = [...OIKEAT_PAIVAMAARAT].sort();
        if (JSON.stringify(syotetytPaivamaarat) === JSON.stringify(oikeatJarjestetty)) {
            elementit.tarkistaNappi.disabled = true;
            elementit.tarkistaNappi.textContent = "Päivämäärät lukittu";
            runPowerUpSequence();
        } else {
            naytaVirhe("Päivämäärät eivät täsmää. Tarkista aikakoneen lokitiedot ja yritä uudelleen.");
        }
    });

    elementit.confirmButton.addEventListener('click', () => {
        if (valittavaSymboli !== null) {
            const originalSymbol = document.querySelector(`[data-symbol-id='${valittavaSymboli}']`);
            addSymbolToSequence(valittavaSymboli, originalSymbol);
            toggleZoomView(false);
        }
    });

    elementit.cancelButton.addEventListener('click', () => toggleZoomView(false));
    elementit.modalOverlay.addEventListener('click', () => toggleZoomView(false));
    
    // --- OSA 5: KÄYNNISTYS ---
    updateLcarsBlocks();
    setInterval(updateLcarsBlocks, 400);
    startIntro();
});
