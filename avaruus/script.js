document.addEventListener('DOMContentLoaded', function() {

    // --- OSA 1: Määritelmät ja muuttujat ---
    const OIKEAT_PAIVAMAARAT = ["05.11.1955", "26.10.1985", "21.10.2015"];
    const OIKEA_SEKVENSSI = [27, 32, 12];
    const LOPULLISET_KOORDINAATIT = "N 61° 00.123 E 025° 00.456";

    let kayttajanSekvenssi = [];
    let valittavaSymboli = null;
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    
    // Kaikkien osioiden viittaukset
    const introSection = document.getElementById('intro-section');
    const loginSection = document.getElementById('login-section');
    const missionBriefingSection = document.getElementById('mission-briefing-section');
    const aikakoneOsio = document.getElementById('aikakone-osio');
    const stargateOsio = document.getElementById('stargate-osio');
    const lopputulosOsio = document.getElementById('lopputulos-osio');
    
    const loginButton = document.getElementById('login-button');
    const nicknameInput = document.getElementById('nickname-input');
    const tarkistaNappi = document.getElementById('tarkista-paivamaarat');
    const confirmButton = document.getElementById('confirm-selection');
    const cancelButton = document.getElementById('cancel-selection');
    const modalOverlay = document.getElementById('modal-overlay');
    const zoomView = document.getElementById('zoom-view');

    // --- OSA 2: Yleiset apufunktiot ---

    function naytaVirhe(viesti) {
        const virheViestiOsio = document.getElementById('virhe-viesti');
        const virheTeksti = document.getElementById('virhe-teksti');
        virheTeksti.textContent = viesti;
        virheViestiOsio.classList.remove('piilotettu');
        setTimeout(() => { virheViestiOsio.classList.add('piilotettu'); }, 3000);
    }
    
    // UUSI: Typewriter-funktio tekstianimaatioille
    function typeWriter(element, text, speed, callback) {
        let i = 0;
        element.innerHTML = ""; // Tyhjennetään elementti ensin
        const cursorSpan = document.createElement('span');
        cursorSpan.className = 'typewriter-cursor';
        element.appendChild(cursorSpan);

        const typing = setInterval(() => {
            if (i < text.length) {
                cursorSpan.insertAdjacentText('beforebegin', text.charAt(i));
                i++;
            } else {
                clearInterval(typing);
                if (callback) {
                    // Pieni tauko ennen callbackin kutsumista
                    setTimeout(callback, 500);
                }
            }
        }, speed);
    }

    // --- OSA 3: Mysteerin vaiheiden hallinta ---

    // VAIHE 1: Aloitetaan introanimaatio
    function startIntro() {
        const introText1 = `U.S.S. Enterprise - Komentosillan loki, kapteeni Jean-Luc Picard. Tähtipäivä 47634.4.`;
        const introText2 = `Olemme havainneet vakavan poikkeaman aika-avaruusjatkumossa Omega-sektorissa. Muinainen porttiteknologia, jota paikalliset kutsuivat "Tähtiportiksi", on fuusioitunut primitiivisen, mutta yllättävän tehokkaan aikakoneen jäänteisiin. Syntynyt paradoksi uhkaa repiä todellisuuden rakenteen. Ajallinen päädirektiivi on vaarassa. Yhdistän sinut, lähimmän kenttäagentin, suoraan aluksen päätteeseen.`;
        
        const textElement1 = document.getElementById('intro-text-1');
        const textElement2 = document.getElementById('intro-text-2');

        typeWriter(textElement1, introText1, 50, () => {
            typeWriter(textElement2, introText2, 40, () => {
                // Kun molemmat tekstit ovat valmiit, näytä login-osio
                introSection.classList.add('piilotettu');
                loginSection.classList.remove('piilotettu');
                nicknameInput.focus();
            });
        });
    }

    // VAIHE 2: Käyttäjä "kirjautuu sisään"
    loginButton.addEventListener('click', () => {
        const nickname = nicknameInput.value.trim();
        if (nickname === "") {
            alert("Syötä nimimerkki jatkaaksesi.");
            return;
        }
        
        loginSection.classList.add('piilotettu');
        missionBriefingSection.classList.remove('piilotettu');

        const missionText = `Tervetuloa, kadetti ${nickname}. Sinun tehtäväsi on kriittinen: sinun on vakautettava portti syöttämällä järjestelmään kolme keskeistä päivämäärää, jotka liittyvät aikakoneen matkoihin. Nämä ajalliset ankkurit stabiloivat jatkumon. Onnistuminen paljastaa symbolisekvenssin portin soittamiseen ja antaa sinulle palkkion sijainnin. Toimi nopeasti. Picard, loppu.`;
        const missionElement = document.getElementById('mission-text');
        
        typeWriter(missionElement, missionText, 30, () => {
            // Kun tehtävänanto on valmis, näytä DeLorean
            aikakoneOsio.classList.remove('piilotettu');
        });
    });

    // VAIHE 3: Päivämäärien tarkistus
    tarkistaNappi.addEventListener('click', function() {
        const formatNumber = (num) => num.toString().padStart(2, '0');
        const date1 = `${formatNumber(document.getElementById('day1').value)}.${formatNumber(document.getElementById('month1').value)}.${document.getElementById('year1').value}`;
        const date2 = `${formatNumber(document.getElementById('day2').value)}.${formatNumber(document.getElementById('month2').value)}.${document.getElementById('year2').value}`;
        const date3 = `${formatNumber(document.getElementById('day3').value)}.${formatNumber(document.getElementById('month3').value)}.${document.getElementById('year3').value}`;

        const syotetytPaivamaarat = [date1, date2, date3].sort();
        const oikeatJarjestetty = [...OIKEAT_PAIVAMAARAT].sort();

        if (JSON.stringify(syotetytPaivamaarat) === JSON.stringify(oikeatJarjestetty)) {
            stargateOsio.classList.remove('piilotettu');
            tarkistaNappi.disabled = true;
            tarkistaNappi.textContent = "Päivämäärät lukittu";
            luoStargateSymbolit();
        } else {
            naytaVirhe("Päivämäärät eivät täsmää. Tarkista aikakoneen lokitiedot ja yritä uudelleen.");
        }
    });

    // VAIHE 4 & 5: Tähtiportin logiikka (sis. laitetunnistuksen)

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

    function addSymbolToSequence(symbolId, symbolElement) {
        if (kayttajanSekvenssi.length >= 3 || kayttajanSekvenssi.includes(symbolId)) return;
        kayttajanSekvenssi.push(symbolId);
        document.getElementById('symboli-jono').textContent = kayttajanSekvenssi.join(' - ');
        if (symbolElement) symbolElement.classList.add('selected');
        if (kayttajanSekvenssi.length === 3) setTimeout(tarkistaSekvenssi, 500);
    }
    
    function tarkistaSekvenssi() {
        if (JSON.stringify(kayttajanSekvenssi) === JSON.stringify(OIKEA_SEKVENSSI)) {
            missionBriefingSection.classList.add('piilotettu');
            aikakoneOsio.classList.add('piilotettu');
            stargateOsio.classList.add('piilotettu');
            lopputulosOsio.classList.remove('piilotettu');
            document.getElementById('event-horizon').classList.add('active');
            document.getElementById('koordinaatit').textContent = LOPULLISET_KOORDINAATIT;
        } else {
            naytaVirhe("Virheellinen sekvenssi. Portti nollataan.");
            kayttajanSekvenssi = [];
            document.getElementById('symboli-jono').textContent = "";
            document.querySelectorAll('.stargate-symbol.selected').forEach(el => el.classList.remove('selected'));
        }
    }

    function toggleZoomView(show = false) {
        if (show) {
            modalOverlay.classList.remove('piilotettu');
            zoomView.classList.remove('piilotettu');
        } else {
            modalOverlay.classList.add('piilotettu');
            zoomView.classList.add('piilotettu');
            valittavaSymboli = null;
        }
    }
    
    confirmButton.addEventListener('click', () => {
        if (valittavaSymboli !== null) {
            const originalSymbol = document.querySelector(`[data-symbol-id='${valittavaSymboli}']`);
            addSymbolToSequence(valittavaSymboli, originalSymbol);
            toggleZoomView(false);
        }
    });

    cancelButton.addEventListener('click', () => toggleZoomView(false));
    modalOverlay.addEventListener('click', () => toggleZoomView(false));

    // --- KÄYNNISTYS ---
    startIntro();
});
