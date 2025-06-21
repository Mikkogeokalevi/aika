/*
    AJAN VARTIJAT - MYSTEERIN SKRIPTI
    Versio 14.0 - Tehostettu siirtymä
*/
document.addEventListener('DOMContentLoaded', function() {

    // --- OSA 1: Määritelmät ja vakiot ---
    const OIKEAT_PAIVAMAARAT = ["05.11.1955", "26.10.1985", "21.10.2015"];
    const OIKEA_SEKVENSSI = [27, 32, 12];
    const LOPULLISET_KOORDINAATIT = "N 61° 00.123 E 025° 00.456"; // !!! VAIHDA TÄMÄ !!!
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const geocachingTerms = ["GEOCACHE", "WAYPOINT", "FTF", "TFTC", "SPOILER", "MUGGLED", "TRACKABLE", "CITO", "DNF"];

    // --- Globaalit muuttujat ---
    let kayttajanSekvenssi = [];
    let valittavaSymboli = null;
    
    // --- DOM-elementtien viittaukset ---
    const elementit = {
        // ... kaikki aiemmat viittaukset ...
        powerUpSequence: document.getElementById('power-up-sequence'), // Uusi
        powerUpText: document.getElementById('power-up-text'),         // Uusi
        progressBarInner: document.querySelector('.progress-bar-inner') // Uusi
    };
    
    // --- OSA 2: APUFUNKTIOT ---
    // ... kaikki aiemmat apufunktiot (generateRandomGcCode, updateLcarsBlocks, jne.) ...

    // --- OSA 3: PÄÄLOGIIKKA JA VAIHEET ---
    // ... startIntro, runAuthSequence, showMissionBriefing, jne. ...

    // UUSI FUNKTIO: Käynnistää virransiirtoanimaation
    function runPowerUpSequence() {
        elementit.powerUpSequence.classList.remove('piilotettu');

        const powerUpMessages = [
            "Tarkistetaan ajallista siirtymää...",
            "Synkronoidaan vuon kondensaattoria...",
            "Aikapiirit vakaat! Reititetään virtaa...",
            "Tähtiportin matriisi aktivoitu!"
        ];
        
        // Ajastetaan tekstien vaihto
        setTimeout(() => { elementit.powerUpText.textContent = powerUpMessages[0]; }, 0);
        setTimeout(() => { elementit.powerUpText.textContent = powerUpMessages[1]; }, 1000);
        setTimeout(() => { elementit.powerUpText.textContent = powerUpMessages[2]; }, 2500);
        setTimeout(() => { elementit.powerUpText.textContent = powerUpMessages[3]; }, 3800);

        // Käynnistetään palkin animaatio (CSS hoitaa loput)
        // Pieni viive varmistaa, että elementti on näkyvissä ennen animaation alkua
        setTimeout(() => {
            elementit.progressBarInner.style.width = '100%';
        }, 100);

        // Animaation jälkeen siivotaan ja näytetään tähtiportti
        setTimeout(() => {
            elementit.powerUpSequence.classList.add('piilotettu');
            elementit.stargateOsio.classList.remove('piilotettu');
            luoStargateSymbolit();
        }, 4500); // Hieman animaation keston (4s) jälkeen
    }

    // --- OSA 4: TAPAHTUMANKUUNTELIJAT ---

    // MUUTETTU: tarkistaNappi-kuuntelija
    elementit.tarkistaNappi.addEventListener('click', function() {
        const formatNumber = (num) => num.toString().padStart(2, '0');
        const date1 = `${formatNumber(document.getElementById('day1').value)}.${formatNumber(document.getElementById('month1').value)}.${document.getElementById('year1').value}`;
        const date2 = `${formatNumber(document.getElementById('day2').value)}.${formatNumber(document.getElementById('month2').value)}.${document.getElementById('year2').value}`;
        const date3 = `${formatNumber(document.getElementById('day3').value)}.${formatNumber(document.getElementById('month3').value)}.${document.getElementById('year3').value}`;
        
        const syotetytPaivamaarat = [date1, date2, date3].sort();
        const oikeatJarjestetty = [...OIKEAT_PAIVAMAARAT].sort();

        if (JSON.stringify(syotetytPaivamaarat) === JSON.stringify(oikeatJarjestetty)) {
            // Oikein! Lukitaan nappi ja käynnistetään uusi animaatio.
            elementit.tarkistaNappi.disabled = true;
            elementit.tarkistaNappi.textContent = "Päivämäärät lukittu";
            runPowerUpSequence(); // Ei enää näytetä tähtiporttia suoraan
        } else {
            naytaVirhe("Päivämäärät eivät täsmää. Tarkista aikakoneen lokitiedot ja yritä uudelleen.");
        }
    });

    // ... kaikki muut kuuntelijat ennallaan ...

    // --- OSA 5: KÄYNNISTYS ---
    // ... ennallaan ...
});
