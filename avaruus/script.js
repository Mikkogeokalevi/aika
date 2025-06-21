/*
    AJAN VARTIJAT - MYSTEERIN SKRIPTI
    Versio 9.0 - Asettelun ja mobiilinäkymän korjaus
*/
document.addEventListener('DOMContentLoaded', function() {

    // Lisätty uudet item-9 ja item-10
    const lcarsItems = [
        document.getElementById('glcars-item-1'),
        document.getElementById('glcars-item-2'),
        document.getElementById('glcars-item-3'),
        document.getElementById('glcars-item-4'),
        document.getElementById('glcars-item-5'),
        document.getElementById('glcars-item-6'),
        document.getElementById('glcars-item-7'),
        document.getElementById('glcars-item-8'),
        document.getElementById('glcars-item-9'),
        document.getElementById('glcars-item-10'),
    ].filter(el => el !== null);

    const geocachingTerms = ["GEOCACHE", "WAYPOINT", "FTF", "TFTC", "SPOILER", "MUGGLED", "TRACKABLE", "CITO", "DNF"];
    
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
        if (lcarsItems.length === 0) return;
        const updateCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < updateCount; i++) {
            const randomIndex = Math.floor(Math.random() * lcarsItems.length);
            const block = lcarsItems[randomIndex];
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
                setTimeout(() => {
                    block.classList.remove('is-updating');
                }, 50);
            }, 150);
        }
    }

    setInterval(updateLcarsBlocks, 400);

});
