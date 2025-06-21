/*
    AJAN VARTIJAT - MYSTEERIN SKRIPTI
    Versio 5.0 - Puhdistettu ja virheetön
*/
document.addEventListener('DOMContentLoaded', function() {

    // --- OSA 1: Määritelmät ja vakiot ---
    const OIKEAT_PAIVAMAARAT = ["05.11.1955", "26.10.1985", "21.10.2015"];
    const OIKEA_SEKVENSSI = [27, 32, 12];
    const LOPULLISET_KOORDINAATIT = "N 61° 00.123 E 025° 00.456";
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // --- Globaalit muuttujat ---
    let kayttajanSekvenssi = [];
    let valittavaSymboli = null;
    
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
        zoomView: document.getElementById('zoom-view')
    };
    
    // --- OSA 2: APUFUNKTIOT ---

    function generateRandomNumbers(length) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += Math.floor(Math.random() * 10);
        }
        return result;
    }

    function updateLcarsNumbers() {
        const num1 = document.getElementById('glcars-num-1');
        const num2 = document.getElementById('glcars-num-2');
        const num3 = document.getElementById('glcars-num-3');
        const num4 = document.getElementById('glcars-num-4');
        if (num1) num1.textContent = generateRandomNumbers(4) + ' ' + generateRandomNumbers(2);
        if (num2) num2.textContent = generateRandomNumbers(4) + ' ' + generateRandomNumbers(2);
        if (num3) num3.textContent = generateRandomNumbers(4) + ' ' + generateRandomNumbers(2);
        if (num4) num4.textContent = generateRandomNumbers(4) + ' ' + generateRandomNumbers(2);
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
        const introText1 = `U.S.S. Enterprise - Komentosillan loki, kapteeni Jean-Luc Picard. Tähtipäivä 47634.4.`;
        const introText2 = `Olemme havainneet vakavan poikkeaman aika-avaruusjatkumossa Omega-sektorissa. Muinainen porttiteknologia, jota paikalliset kutsuivat "Tähtiportiksi", on fuusioitunut primitiivisen, mutta yllättävän tehokkaan aikakoneen jäänteisiin. Syntynyt paradoksi uhkaa repiä todellisuuden rakenteen. Ajallinen päädirektiivi on vaarassa. Yhdistän sinut, lähimmän kenttäagentin, suoraan aluksen päätteeseen.`;
        typeWriter(document.getElementById('intro-text-1'), introText1, 50, () => {
            typeWriter(document.getElementById('intro-text-2'), introText2, 40, () => {
                elementit.loginSection.classList.remove('piilotettu');
                elementit.nicknameInput.focus();
            });
        });
    }

    function runAuthSequence(nickname) {
        const authMessages = ["Yhdistetään Tähtilaivaston verkkoon...", "Haetaan tunnistetta...", "Varmennetaan kvanttisignatuuria...", "Tunniste hyväksytty! Tervetuloa järjestelmään."];
        const authTextElement = document.getElementById('auth-text');
        let messageIndex = 0;
        function showNextMessage() {
            if (messageIndex < authMessages.length) {
                authTextElement.textContent = authMessages[messageIndex];
                messageIndex++;
                setTimeout(showNextMessage, 1500);
            } else {
                showMissionBriefing(nickname);
            }
        }
        showNextMessage();
    }

    function showMissionBriefing(nickname) {
        elementit.introSection.classList.add('piilotettu');
        elementit.loginSection.classList.add('piilotettu');
        elementit.missionBriefingSection.classList.remove('piilotettu');
        const missionText = `Kiitos yhteydenotosta, kadetti ${nickname}. Sinun tehtäväsi on kriittinen: sinun on vakautettava portti syöttämällä järjestelmään kolme keskeistä päivämäärää, jotka liittyvät aikakoneen matkoihin. Nämä ajalliset ankkurit stabiloivat jatkumon. Onnistuminen paljastaa symbolisekvenssin portin soittamiseen ja antaa sinulle palkkion sijainnin. Toimi nopeasti. Picard, loppu.`;
        typeWriter(document.getElementById('mission-text'), missionText, 30, () => {
            elementit.aikakoneOsio.classList.remove('piilotettu');
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
        if (stargateContainer.querySelectorAll('.stargate-symbol').length > 0) return;
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
        const nickname = elementit.nicknameInput.value.trim();
        if (nickname === "") {
            alert("Syötä nimimerkki jatkaaksesi.");
            return;
        }
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
            elementit.stargateOsio.classList.remove('piilotettu');
            elementit.tarkistaNappi.disabled = true;
            elementit.tarkistaNappi.textContent = "Päivämäärät lukittu";
            luoStargateSymbolit();
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

    updateLcarsNumbers();
    setInterval(updateLcarsNumbers, 1500);
    startIntro();
});
