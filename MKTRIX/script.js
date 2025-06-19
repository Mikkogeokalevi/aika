document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');
    const input = document.getElementById('input');
    const interactiveContainer = document.getElementById('interactive-container');

    let agentName = '';
    let currentPuzzle = 0;
    let gameState = 'AWAITING_NAME';
    let puzzles = [];

    // --- Matrix-efekti ---
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const alphabet = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const rainDrops = [];
    for (let x = 0; x < columns; x++) { rainDrops[x] = 1; }

    function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0F0';
        ctx.font = fontSize + 'px monospace';
        for (let i = 0; i < rainDrops.length; i++) {
            const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
            if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                rainDrops[i] = 0;
            }
            rainDrops[i]++;
        }
    }
    setInterval(drawMatrix, 30);

    // --- Yksinkertainen tulostuslogiikka ---
    async function type(line) {
        const speed = 40;
        const lineDiv = document.createElement('div');
        output.appendChild(lineDiv);
        for (let i = 0; i < line.length; i++) {
            lineDiv.innerHTML += line.charAt(i);
            output.scrollTop = output.scrollHeight;
            await new Promise(resolve => setTimeout(resolve, speed));
        }
    }
    function print(line) {
        const lineDiv = document.createElement('div');
        if (typeof line === 'string') lineDiv.innerText = line;
        else lineDiv.innerHTML = line.html;
        output.appendChild(lineDiv);
        output.scrollTop = output.scrollHeight;
    }
    
    // --- Pelin tilan hallinta ---
    function setInputState(enabled) {
        input.disabled = !enabled;
        if (enabled) input.focus();
    }
    function clearInteractive() { interactiveContainer.innerHTML = ''; }

    async function handleWrongAnswer() {
        setInputState(false);
        print({html: `<span class="error">VIRHE, AGENTTI ${agentName.toUpperCase()}. Järjestelmä lukittu...</span>`});
        output.classList.add('glitch-effect');
        await new Promise(resolve => setTimeout(resolve, 3000));
        output.classList.remove('glitch-effect');
        setInputState(true);
    }
    
    async function textCorruptionEffect(text) {
        const chars = 'AZX#@$*!?%/|';
        const lineDiv = document.createElement('div');
        output.appendChild(lineDiv);
        for (let i = 0; i < 3; i++) {
            let garbage = '';
            for (let j = 0; j < text.length; j++) {
                garbage += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            lineDiv.innerText = garbage;
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        lineDiv.remove();
    }

    // --- TÄSSÄ ON NYT VAIN YKSI OIKEA VERSIO KAIKISTA FUNKTIOISTA ---
    
    async function handleSuccess() {
        setInputState(false);
        const puzzle = puzzles[currentPuzzle];
        print({html: `<span class="highlight">OIKEA VASTAUS, AGENTTI ${agentName.toUpperCase()}.</span>`});
        currentPuzzle++;
        if (puzzle.reward) await type(`Koordinaatit päivitetty: ${puzzle.reward}`);
        if (currentPuzzle < puzzles.length) {
            await displayPuzzle();
        } else {
            gameState = 'FINISHED';
            await type("------------------------------------");
            print({html: "<div class='final'>LOISTAVAA! TEHTÄVÄ SUORITETTU!</div>"});
            await type("------------------------------------");
        }
    }

    async function setupMemoryPuzzle() {
        clearInteractive();
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let sequence = '';
        for (let i = 0; i < 6; i++) {
            sequence += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        puzzles[2].answer = sequence.toLowerCase();
        
        await type(`\n--- PULMA 3/7: Muistipeli ---`);
        await type(`Toista 6-merkkinen aakkosnumeerinen koodi...`);
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        interactiveContainer.innerHTML = `<div style="font-size: 2em; letter-spacing: 0.5em;">${sequence.split('').join(' ')}</div>`;
        
        await new Promise(resolve => setTimeout(resolve, 2500));
        interactiveContainer.innerHTML = `<div style="font-size: 2em; letter-spacing: 0.5em;">█ █ █ █ █ █</div>`;
        
        await type(`Syötä koodi. Jos unohdit, kirjoita 'anna uusi koodi'.`);
        setInputState(true);
    }
    
    async function setupDialPuzzle() {
        clearInteractive();
        const now = new Date();
        const targetValue = now.getMonth() + 1 + now.getDate();
        puzzles[4].answer = targetValue.toString();

        await type(`\n--- PULMA 5/7: Taajuusmodulaattori ---`);
        await type(`Järjestelmän kellopulssi on epäsynkassa. Aseta kalibrointitaajuus kuluvan KUUKAUDEN NUMERO + PÄIVÄN NUMERO.`);
        setInputState(false);
        interactiveContainer.innerHTML = `
            <div style="font-size: 2em; margin: 10px;"><span class="dial-button" id="dial-minus">[-]</span> <span id="dial-value" style="margin: 0 20px;">1</span> <span class="dial-button" id="dial-plus">[+]</span></div>
            <div><span class="dial-button" id="dial-confirm">[VAHVISTA]</span></div>`;
        let currentValue = 1;
        document.getElementById('dial-minus').onclick = () => { currentValue--; document.getElementById('dial-value').innerText = currentValue; };
        document.getElementById('dial-plus').onclick = () => { currentValue++; document.getElementById('dial-value').innerText = currentValue; };
        document.getElementById('dial-confirm').onclick = () => { (currentValue === targetValue) ? handleSuccess() : handleWrongAnswer(); };
    }
    
    async function setupWirePuzzle() {
        clearInteractive();
        await type(`\n--- PULMA 6/7: Purkujärjestelmä ---`);
        await type(`Tämä vaatii tarkkuutta, agentti ${agentName.toUpperCase()}.`);
        await type(`Lue ohjeet huolellisesti ja katkaise oikea johto.`);
        print({html: `<div style="border: 1px solid #90EE90; padding: 5px; margin-top: 10px; text-align: left;"><b>Purkuohjeisto v1.2:</b><br>- Jos punaisia johtoja on enemmän kuin yksi, katkaise keltainen johto.<br>- Jos ei ole keltaista johtoa, katkaise toinen sininen johto.<br>- Muussa tapauksessa katkaise ensimmäinen johto.</div>`});
        
        setInputState(false);
        const wires = [{ c: "sininen", t: "[---SININEN----]" }, { c: "punainen", t: "[---PUNAINEN---]" }, { c: "punainen", t: "[---PUNAINEN---]" }, { c: "sininen", t: "[---SININEN----]" }, { c: "keltainen", t: "[---KELTAINEN--]" }];
        puzzles[5].answer = "keltainen";
        
        wires.forEach(wire => {
            const el = document.createElement('div');
            el.className = 'clickable-wire'; el.innerText = wire.t;
            el.onclick = () => { (wire.c === puzzles[5].answer) ? handleSuccess() : handleWrongAnswer(); };
            interactiveContainer.appendChild(el);
        });
    }

    function initializePuzzles() {
        puzzles = [
            { question: [`\n--- PULMA 1/7: Anagrammi ---`, `Järjestä kirjaimet sanaksi: TORIDAKOINAT`], answer: "koordinaatit", reward: "43°..′..″N ..°..′..″W" },
            { question: [`\n--- PULMA 2/7: Numeerinen protokolla ---`, `Käännä numerot kirjaimiksi (A=1...): 14-1-22-9-7-15-9-14-20-9`], answer: "navigointi", reward: "43°04′..″N ..°..′..″W" },
            { type: 'interactive', setup: setupMemoryPuzzle, reward: "43°04′41″N ..°..′..″W" },
            { question: [`\n--- PULMA 4/7: Kuviopäättely ---`, `Signaalissa on toistuva kuvio. Päättele seuraava osa sekvenssissä:`, `A1-B2-C3`, `D4-E5-F6`, `G7-H8-I9`, `?-?-?`], answer: "j10-k11-l12", reward: "43°04′41″N 79°..′..″W" },
            { question: [`\n--- PULMA 5/7: Logiikkapulma ---`, `Kolme agenttia (A, B, C) piilotti kukin yhden esineen (Avain, Kartta, Kompassi). Päättele vihjeiden avulla, minkä esineen agentti C piilotti.`, `Vihje 1: Agentti A ei piilottanut Avainta.`, `Vihje 2: Agentti B piilotti Kompassin.` ], answer: "avain", reward: "43°04′41″N 79°04′..″W" },
            { type: 'interactive', setup: setupWirePuzzle, reward: "43°04′41″N 79°04′30″W" },
            { question: [`\n--- LOPULLINEN HAASTE ---`, `Koordinaatit purettu. Tiedät paikan. Missä olemme?`], answer: "niagaran putouksilla" }
        ];
    }
    
    async function displayPuzzle() {
        clearInteractive();
        const puzzle = puzzles[currentPuzzle];
        
        // Suoritetaan tekstin korruptoitumisefekti ennen pulman tulostusta
        await textCorruptionEffect(puzzle.question ? puzzle.question[0] : `PULMA ${currentPuzzle + 1}`);

        if (puzzle.type === 'interactive') {
            await puzzle.setup();
        } else {
            for (const line of puzzle.question) {
                await type(line);
            }
            setInputState(true);
        }
    }
    
    async function handleInput(command) {
        print(`> ${command}`);
        input.value = '';
        setInputState(false);

        if (gameState === 'AWAITING_NAME') {
            agentName = command || "Tuntematon";
            gameState = 'PLAYING';
            initializePuzzles();
            
            await type("Yhdistetään MIKKO-GEO-KALEVI-verkkoon...");
            await new Promise(resolve => setTimeout(resolve, 500));
            await type("Vastaanotetaan signaalia... OK");
            await new Promise(resolve => setTimeout(resolve, 500));
            print({html: `GeoAgentti ${agentName.toUpperCase()}... <span class="blinking-text">VALTUUTETTU</span>`});
            await new Promise(resolve => setTimeout(resolve, 2000));
            await type("Ladataan Ällös Operaatio ...");
            await type("------------------------------------");
            await type(`TERVETULOA, AGENTTI ${agentName.toUpperCase()}.`);
            
            await displayPuzzle();
            return;
        }

        if (gameState === 'PLAYING') {
            const puzzle = puzzles[currentPuzzle];
            if (currentPuzzle === 2 && command.toLowerCase() === 'anna uusi koodi') {
                await type("Generoidaan uutta turvakoodia...");
                await setupMemoryPuzzle();
                return;
            }
            if (command.toLowerCase() === puzzle.answer) {
                await handleSuccess();
            } else {
                await handleWrongAnswer();
            }
        }
    }

    input.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            if (input.disabled) return;
            const command = input.value.trim();
            if(command === '' && gameState !== 'AWAITING_NAME') return;
            await handleInput(command);
        }
    });

    async function main() {
        setInputState(false);
        await type("SYÖTÄ GEOKÄTKÖILY NIMESI...");
        setInputState(true);
    }

    main();
});
