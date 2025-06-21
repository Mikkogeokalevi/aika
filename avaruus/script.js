// Odotetaan, että koko sivu on latautunut
document.addEventListener('DOMContentLoaded', function() {

    // --- OSA 1: Määritelmät ja muuttujat ---

    // Oikeat päivämäärät (Paluu tulevaisuuteen -elokuvista)
    const OIKEAT_PAIVAMAARAT = ["05.11.1955", "26.10.1985", "21.10.2015"];

    // Laske oikea symbolijärjestys päivämäärien perusteella
    // Vihje: laske kaikkien numeroiden summa (nollia ei lasketa)
    // 05.11.1955 -> 5+1+1+1+9+5+5 = 27
    // 26.10.1985 -> 2+6+1+1+9+8+5 = 32
    // 21.10.2015 -> 2+1+1+2+1+5 = 12
    const OIKEA_SEKVENSSI = [27, 32, 12];
    
    // Geokätkön lopulliset koordinaatit
    // !!! VAIHDA NÄMÄ OMiksi KOORDINAATEIKSI !!!
    const LOPULLISET_KOORDINAATIT = "N 61° 00.123 E 025° 00.456";

    // Käyttäjän syöttämä sekvenssi
    let kayttajanSekvenssi = [];
    
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
    
    // --- OSA 2: Toiminnallisuus ---

    // Funktio, joka näyttää virheilmoituksen
    function naytaVirhe(viesti) {
        virheTeksti.textContent = viesti;
        virheViestiOsio.classList.remove('piilotettu');
        // Piilota virhe hetken kuluttua
        setTimeout(() => {
            virheViestiOsio.classList.add('piilotettu');
        }, 3000);
    }

    // Tarkistetaan syötetyt päivämäärät
    tarkistaNappi.addEventListener('click', function() {
        // Funktio, joka lisää etunollan tarvittaessa (esim. 5 -> "05")
        const formatNumber = (num) => num.toString().padStart(2, '0');

        // Lue arvot uusista kentistä ja yhdistä ne pp.kk.vvvv -muotoon
        const day1 = document.getElementById('day1').value;
        const month1 = document.getElementById('month1').value;
        const year1 = document.getElementById('year1').value;
        const date1 = `${formatNumber(day1)}.${formatNumber(month1)}.${year1}`;

        const day2 = document.getElementById('day2').value;
        const month2 = document.getElementById('month2').value;
        const year2 = document.getElementById('year2').value;
        const date2 = `${formatNumber(day2)}.${formatNumber(month2)}.${year2}`;

        const day3 = document.getElementById('day3').value;
        const month3 = document.getElementById('month3').value;
        const year3 = document.getElementById('year3').value;
        const date3 = `${formatNumber(day3)}.${formatNumber(month3)}.${year3}`;

        const syotetytPaivamaarat = [date1, date2, date3].sort();
        const oikeatJarjestetty = [...OIKEAT_PAIVAMAARAT].sort();

        if (JSON.stringify(syotetytPaivamaarat) === JSON.stringify(oikeatJarjestetty)) {
            // MUUTOS: Päivämäärät oikein -> näytetään Stargate, EI piiloteta aikakonetta.
            stargateOsio.classList.remove('piilotettu');
            virheViestiOsio.classList.add('piilotettu');
            
            // MUUTOS: Lukitaan nappi ja muutetaan tekstiä onnistumisen merkiksi.
            tarkistaNappi.disabled = true;
            tarkistaNappi.textContent = "Päivämäärät lukittu";
            
            luoStargateSymbolit();
        } else {
            naytaVirhe("Päivämäärät eivät täsmää. Tarkista aikakoneen lokitiedot ja yritä uudelleen.");
        }
    });
    
    // Funktio, joka luo Tähtiportin symbolit ja asettaa ne kehälle
    function luoStargateSymbolit() {
        // MUUTOS: Varmistetaan, että symboleita ei luoda moneen kertaan.
        if (stargateContainer.querySelectorAll('.stargate-symbol').length > 0) {
            return; 
        }

        const symbolienMaara = 39; // Stargatessa on 39 symbolia
        const sade = stargateContainer.offsetWidth / 2 - 25; // Säde sijoittelulle

        for (let i = 1; i <= symbolienMaara; i++) {
            const symboliElementti = document.createElement('div');
            symboliElementti.classList.add('stargate-symbol');
            symboliElementti.textContent = i; // Käytetään numeroita symboleina
            symboliElementti.dataset.symbolId = i; // Tallennetaan symbolin arvo

            const kulma = (i / symbolienMaara) * 2 * Math.PI - (Math.PI / 2);
            const x = sade * Math.cos(kulma) + sade;
            const y = sade * Math.sin(kulma) + sade;

            symboliElementti.style.left = `${x}px`;
            symboliElementti.style.top = `${y}px`;
            
            symboliElementti.addEventListener('click', handleSymbolClick);
            symboliElementti.addEventListener('touchend', handleSymbolClick);

            stargateContainer.appendChild(symboliElementti);
        }
    }
    
    // Funktio, joka käsittelee symbolin painalluksen
    function handleSymbolClick(event) {
        event.preventDefault();
        if (kayttajanSekvenssi.length >= 3) return;

        const symboli = event.target;
        const symbolId = parseInt(symboli.dataset.symbolId);
        
        symboli.classList.add('selected');
        kayttajanSekvenssi.push(symbolId);
        syoteNaytto.textContent = kayttajanSekvenssi.join(' - ');

        if (kayttajanSekvenssi.length === 3) {
            setTimeout(tarkistaSekvenssi, 500);
        }
    }

    // Funktio, joka tarkistaa lopullisen symbolisekvenssin
    function tarkistaSekvenssi() {
        if (JSON.stringify(kayttajanSekvenssi) === JSON.stringify(OIKEA_SEKVENSSI)) {
            // Oikein! Piilotetaan molemmat vaiheet ja näytetään lopputulos.
            aikakoneOsio.classList.add('piilotettu');
            stargateOsio.classList.add('piilotettu');
            lopputulosOsio.classList.remove('piilotettu');
            koordinaatitElementti.textContent = LOPULLISET_KOORDINAATIT;
            eventHorizon.classList.add('active'); 
        } else {
            // Väärin!
            naytaVirhe("Virheellinen sekvenssi. Portti nollataan.");
            // Nollaa tila
            kayttajanSekvenssi = [];
            syoteNaytto.textContent = "";
            document.querySelectorAll('.stargate-symbol.selected').forEach(el => {
                el.classList.remove('selected');
            });
        }
    }
});