// Odotetaan, että koko sivu on latautunut
document.addEventListener('DOMContentLoaded', function() {

    // --- OSA 1: Määritelmät ja muuttujat ---
    const OIKEAT_PAIVAMAARAT = ["05.11.1955", "26.10.1985", "21.10.2015"];
    const OIKEA_SEKVENSSI = [27, 32, 12];
    const LOPULLISET_KOORDINAATIT = "N 61° 00.123 E 025° 00.456";

    let kayttajanSekvenssi = [];
    let valittavaSymboli = null; 

    // UUSI: Laitetunnistus
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    
    // DOM-elementtien viittaukset
    const tarkistaNappi = document.getElementById('tarkista-paivamaarat');
    const aikakoneOsio = document.getElementById('aikakone-osio');
    const stargateOsio = document.getElementById('stargate-osio');
    const lopputulosOsio = document.getElementById('lopputulos-osio');
    const virheViestiOsio = document.getElementById('virhe-viesti');
    const virheTeksti = document.getElementById('virhe-teksti');
    const koordinaatitElementti = document.getElementById('koordinaatit');
    const syoteNaytto = document.getElementById('symboli-jono');
    const stargateContainer = document.getElementById('stargate-container');
    const eventHorizon = document.getElementById('event-horizon');
    const modalOverlay = document.getElementById('modal-overlay');
    const zoomView = document.getElementById('zoom-view');
    const zoomedSymbol = document.getElementById('zoomed-symbol');
    const confirmButton = document.getElementById('confirm-selection');
    const cancelButton = document.getElementById('cancel-selection');
    
    // --- OSA 2: Funktiot ---

    function naytaVirhe(viesti) {
        virheTeksti.textContent = viesti;
        virheViestiOsio.classList.remove('piilotettu');
        setTimeout(() => { virheViestiOsio.classList.add('piilotettu'); }, 3000);
    }

    // Ponnahdusikkunan hallinta (vain mobiilille)
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

    function tarkistaSekvenssi() {
        if (JSON.stringify(kayttajanSekvenssi) === JSON.stringify(OIKEA_SEKVENSSI)) {
            aikakoneOsio.classList.add('piilotettu');
            stargateOsio.classList.add('piilotettu');
            lopputulosOsio.classList.remove('piilotettu');
            koordinaatitElementti.textContent = LOPULLISET_KOORDINAATIT;
            eventHorizon.classList.add('active');
        } else {
            naytaVirhe("Virheellinen sekvenssi. Portti nollataan.");
            kayttajanSekvenssi = [];
            syoteNaytto.textContent = "";
            document.querySelectorAll('.stargate-symbol.selected').forEach(el => {
                el.classList.remove('selected');
            });
        }
    }

    // UUSI: Logiikka symbolin lisäämiselle ja tarkistukselle
    function addSymbolToSequence(symbolId, symbolElement) {
        if (kayttajanSekvenssi.length >= 3 || kayttajanSekvenssi.includes(symbolId)) return;
        
        kayttajanSekvenssi.push(symbolId);
        syoteNaytto.textContent = kayttajanSekvenssi.join(' - ');
        
        if (symbolElement) {
            symbolElement.classList.add('selected');
        }

        if (kayttajanSekvenssi.length === 3) {
            setTimeout(tarkistaSekvenssi, 500);
        }
    }

    function luoStargateSymbolit() {
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
            
            // KORJAUS: Lisätään eri kuuntelija laitteen mukaan
            if (isTouchDevice) {
                // Kännykällä kosketus avaa vahvistusikkunan
                symboliElementti.addEventListener('touchend', (event) => {
                    event.preventDefault();
                    if(event.target.classList.contains('selected')) return;
                    valittavaSymboli = parseInt(event.target.dataset.symbolId);
                    zoomedSymbol.textContent = valittavaSymboli;
                    toggleZoomView(true);
                });
            } else {
                // Kannettavalla klikkaus valitsee suoraan
                symboliElementti.addEventListener('click', (event) => {
                    if(event.target.classList.contains('selected')) return;
                    const symbolId = parseInt(event.target.dataset.symbolId);
                    addSymbolToSequence(symbolId, event.target);
                });
            }
            
            stargateContainer.appendChild(symboliElementti);
        }
    }

    // --- OSA 3: Tapahtumankäsittelijät ---

    tarkistaNappi.addEventListener('click', function() {
        const formatNumber = (num) => num.toString().padStart(2, '0');
        const date1 = `${formatNumber(document.getElementById('day1').value)}.${formatNumber(document.getElementById('month1').value)}.${document.getElementById('year1').value}`;
        const date2 = `${formatNumber(document.getElementById('day2').value)}.${formatNumber(document.getElementById('month2').value)}.${document.getElementById('year2').value}`;
        const date3 = `${formatNumber(document.getElementById('day3').value)}.${formatNumber(document.getElementById('month3').value)}.${document.getElementById('year3').value}`;

        const syotetytPaivamaarat = [date1, date2, date3].sort();
        const oikeatJarjestetty = [...OIKEAT_PAIVAMAARAT].sort();

        if (JSON.stringify(syotetytPaivamaarat) === JSON.stringify(oikeatJarjestetty)) {
            stargateOsio.classList.remove('piilotettu');
            virheViestiOsio.classList.add('piilotettu');
            tarkistaNappi.disabled = true;
            tarkistaNappi.textContent = "Päivämäärät lukittu";
            luoStargateSymbolit();
        } else {
            naytaVirhe("Päivämäärät eivät täsmää. Tarkista aikakoneen lokitiedot ja yritä uudelleen.");
        }
    });

    // Vahvistusnapin toiminta (vain mobiilille)
    confirmButton.addEventListener('click', function() {
        if (valittavaSymboli !== null) {
            const originalSymbol = stargateContainer.querySelector(`[data-symbol-id='${valittavaSymboli}']`);
            addSymbolToSequence(valittavaSymboli, originalSymbol);
            toggleZoomView(false);
        }
    });

    // Peruutusnappien toiminta (vain mobiilille)
    cancelButton.addEventListener('click', () => toggleZoomView(false));
    modalOverlay.addEventListener('click', () => toggleZoomView(false));
});
