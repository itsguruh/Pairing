<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Caseyrhodes Tech - Premium Pair Code Generator</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    /* ---- Your styles (unchanged) ---- */
    /* (keeping all your CSS exactly as you sent) */
  </style>
</head>
<body data-theme="dark">
  <div class="container">
    <div class="logo-container">
      <img src="https://files.catbox.moe/yedfbr.jpg" alt="Caseyrhodes Tech" class="logo">
      <div class="logo-glow"></div>
    </div>
    
    <div class="card">
      <h1>Caseyrhodes Tech Pair Code</h1>
      <p class="subtitle">Select your country and enter your WhatsApp number to generate your secure pairing code</p>
      
      <div class="input-group">
        <select id="country-code" class="country-select">
          <option value="">Select Country</option>
          <option value="254">Kenya (+254)</option>
          <option value="91">India (+91)</option>
          <option value="1">USA (+1)</option>
          <option value="44">UK (+44)</option>
          <!-- keep rest of your options here -->
        </select>
        <input type="tel" id="phone-number" class="input-field" placeholder="Enter WhatsApp number">
      </div>

      <button class="submit-btn">Generate Pair Code</button>
      <div class="result-container"></div>
    </div>
  </div>

  <!-- Script to handle form + fetch -->
  <script>
    document.querySelector('.submit-btn').addEventListener('click', async () => {
      const countryCode = document.getElementById('country-code').value;
      const phoneNumber = document.getElementById('phone-number').value;
      const resultContainer = document.querySelector('.result-container');

      if (!countryCode || !phoneNumber) {
        resultContainer.innerHTML = "⚠️ Please select your country and enter phone number";
        resultContainer.className = "result-container show warning";
        return;
      }

      const fullNumber = countryCode + phoneNumber;

      // Show loading animation
      resultContainer.innerHTML = '<div class="loader"></div> Generating pair code...';
      resultContainer.className = "result-container show";

      try {
        // Use Heroku backend
        const response = await fetch(`https://cryptix-md-3210ab63a8e2.herokuapp.com/pair?number=${fullNumber}`);
        const data = await response.json();

        if (data.code) {
          resultContainer.innerHTML = `
            ✅ Pair Code Generated!<br>
            <span class="code-display">${data.code}</span>
            <div class="action-buttons">
              <button class="action-btn copy-btn"><i class="fa fa-copy"></i> Copy</button>
              <button class="action-btn whatsapp-btn"><i class="fa fa-whatsapp"></i> Open WhatsApp</button>
            </div>
          `;

          // Copy button logic
          document.querySelector('.copy-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(data.code);
            document.querySelector('.copy-btn').classList.add('copied');
            document.querySelector('.copy-btn').innerText = "Copied!";
          });

          // WhatsApp button logic
          document.querySelector('.whatsapp-btn').addEventListener('click', () => {
            window.open(`https://wa.me/?text=Here is my Pair Code: ${data.code}`, "_blank");
          });

        } else {
          resultContainer.innerHTML = "❌ Failed to generate code";
          resultContainer.className = "result-container show error";
        }
      } catch (err) {
        console.error(err);
        resultContainer.innerHTML = "❌ Server error, try again later.";
        resultContainer.className = "result-container show error";
      }
    });
  </script>
</body>
</html>                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari")
            });

            if (!Gifted.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Gifted.requestPairingCode(num);
                console.log(`Your Code: ${code}`);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            Gifted.ev.on('creds.update', saveCreds);

            Gifted.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection == "open") {
                    await delay(50000);
                    const filePath = __dirname + `/temp/${id}/creds.json`;
                    if (!fs.existsSync(filePath)) {
                        console.error("File not found:", filePath);
                        return;
                    }

                    const megaUrl = await uploadCredsToMega(filePath);
                    const sid = megaUrl.includes("https://mega.nz/file/")
                        ? 'Caseyrhodes~' + megaUrl.split("https://mega.nz/file/")[1]
                        : 'Error: Invalid URL';

                    console.log(`Session ID: ${sid}`);

                    Gifted.groupAcceptInvite("Ik0YpP0dM8jHVjScf1Ay5S");

                    const sidMsg = await Gifted.sendMessage(
                        Gifted.user.id,
                        {
                            text: sid,
                            contextInfo: {
                                mentionedJid: [Gifted.user.id],
                                forwardingScore: 999,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: '120363302677217436@newsletter',
                                    newsletterName: 'ITSGURUH TECH 👻',
                                    serverMessageId: 143
                                }
                            }
                        },
                        {
                            disappearingMessagesInChat: true,
                            ephemeralExpiration: 86400
                        }
                    );

const GIFTED_TEXT = `
╔══✪〘 *CRYPTIX MD SESSION* 〙✪══╗

✅ *SESSION GENERATED SUCCESSFULLY!*

╭───────────────◆
│ 🤖 *Bot:* CRYPTIX MD
│ 👨‍💻 *Author:* GURU
│ 📞 *Contact:* +254105521300
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Caseyrhodes Tech - Premium Pair Code Generator</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    /* ---- Your styles (unchanged) ---- */
    /* (keeping all your CSS exactly as you sent) */
  </style>
</head>
<body data-theme="dark">
  <div class="container">
    <div class="logo-container">
      <img src="https://files.catbox.moe/yedfbr.jpg" alt="Caseyrhodes Tech" class="logo">
      <div class="logo-glow"></div>
    </div>
    
    <div class="card">
      <h1>Caseyrhodes Tech Pair Code</h1>
      <p class="subtitle">Select your country and enter your WhatsApp number to generate your secure pairing code</p>
      
      <div class="input-group">
        <select id="country-code" class="country-select">
          <option value="">Select Country</option>
          <option value="254">Kenya (+254)</option>
          <option value="91">India (+91)</option>
          <option value="1">USA (+1)</option>
          <option value="44">UK (+44)</option>
          <!-- keep rest of your options here -->
        </select>
        <input type="tel" id="phone-number" class="input-field" placeholder="Enter WhatsApp number">
      </div>

      <button class="submit-btn">Generate Pair Code</button>
      <div class="result-container"></div>
    </div>
  </div>

  <!-- Script to handle form + fetch -->
  <script>
    document.querySelector('.submit-btn').addEventListener('click', async () => {
      const countryCode = document.getElementById('country-code').value;
      const phoneNumber = document.getElementById('phone-number').value;
      const resultContainer = document.querySelector('.result-container');

      if (!countryCode || !phoneNumber) {
        resultContainer.innerHTML = "⚠️ Please select your country and enter phone number";
        resultContainer.className = "result-container show warning";
        return;
      }

      const fullNumber = countryCode + phoneNumber;

      // Show loading animation
      resultContainer.innerHTML = '<div class="loader"></div> Generating pair code...';
      resultContainer.className = "result-container show";

      try {
        // Use Heroku backend
        const response = await fetch(`https://cryptix-md-3210ab63a8e2.herokuapp.com/pair?number=${fullNumber}`);
        const data = await response.json();

        if (data.code) {
          resultContainer.innerHTML = `
            ✅ Pair Code Generated!<br>
            <span class="code-display">${data.code}</span>
            <div class="action-buttons">
              <button class="action-btn copy-btn"><i class="fa fa-copy"></i> Copy</button>
              <button class="action-btn whatsapp-btn"><i class="fa fa-whatsapp"></i> Open WhatsApp</button>
            </div>
          `;

          // Copy button logic
          document.querySelector('.copy-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(data.code);
            document.querySelector('.copy-btn').classList.add('copied');
            document.querySelector('.copy-btn').innerText = "Copied!";
          });

          // WhatsApp button logic
          document.querySelector('.whatsapp-btn').addEventListener('click', () => {
            window.open(`https://wa.me/?text=Here is my Pair Code: ${data.code}`, "_blank");
          });

        } else {
          resultContainer.innerHTML = "❌ Failed to generate code";
          resultContainer.className = "result-container show error";
        }
      } catch (err) {
        console.error(err);
        resultContainer.innerHTML = "❌ Server error, try again later.";
        resultContainer.className = "result-container show error";
      }
    });
  </script>
</body>
</html>
