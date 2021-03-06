const fs = require("fs");

const five = require("johnny-five");
const font = require("oled-font-5x7");
const Oled = require("oled-js");
const Raspi = require("raspi-io").RaspiIO;

const board = new five.Board({ io: new Raspi() });
board.on("ready", () => {
  console.log("Connected to Raspberry, ready.");
  const opts = {
    width: 128,
    height: 32,
    address: 0x3c,
  };

  // how often to check for changes in usb stream file
  const interval = 1000; 

  // Create a screen
  const oled = new Oled(board, five, opts);
  oled.dimDisplay(true);
  let screen = "--";

  // Update function
  function update() {
    // Read the file
    fs.readFile("/proc/asound/card0/stream0", "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }

      let rate = "";
      let bits = "";

      // Get the current streaming rate frequency
      let match = data.match(/Momentary freq = ([0-9]+) Hz/);
      if (match && match.length > 1) {
        rate = match[1];
        rate = rate / 1000;
        rate = rate.toFixed(1);
        rate = rate.replace(".0", "");
        rate = rate.toString() + "kHz";
      }

      if (rate) {
        // Look for the Altset enabled
        let altset = data.match(/Altset = ([0-9]+)/);

        // Look for the bit depth for this Altset
        let regexp = new RegExp(
          "Altset " + altset[1] + ".+?Bits: ([0-9]+)",
          "s"
        );
        match = data.match(regexp);
        if (match && match.length > 1) {
          bits = match[1] + "bit";
        }
      }

      // Get the new screen
      let newScreen = rate ? rate : "logo";

      // Only update on change
      if (screen != newScreen) {
        oled.clearDisplay(false);
        if (newScreen === "logo") {
          // Draw the logo
          logo(oled);
        } else {
          // Draw the frequency and rate
          oled.setCursor(1, 1);
          oled.writeString(font, 2, newScreen, 1, true, 2);
          oled.setCursor(1, 20);
          oled.writeString(font, 1, bits, 1, true, 2);
        }
        // Update the screen
        oled.update();
        screen = newScreen;
      }
      // Schedule next update
      setTimeout(update, interval);
    });
  }

  // This draws a nice logo on the screen
  function logo(oled) {
    // Logo
    let lw = 30;
    let lh = 20;
    let lx = 0;
    let ly = 6;
    oled.fillRect(lx, ly, lw, lh, 1);
    oled.fillRect(lx + 2, ly + 2, lw - 4, lh - 4, 0);
    oled.fillRect(lx + 8, ly + 8, lw - 16, lh - 16, 1);

    // Letters
    let x = 50;
    let y = 12;
    const h = 8;
    const w = 14;
    const s = 8;

    // M
    oled.drawLine(x, y, x, y + h);
    oled.drawLine(x + w / 2, y, x + w / 2, y + h);
    oled.drawLine(x + w, y, x + w, y + h);
    oled.drawLine(x, y, x + w, y);

    // O
    x += w + s;
    oled.drawLine(x, y, x, y + h);
    oled.drawLine(x, y, x + w, y);
    oled.drawLine(x, y + h, x + w, y + h);
    oled.drawLine(x + w, y, x + w, y + h);

    // P
    x += w + s;
    oled.drawLine(x, y, x, y + h);
    oled.drawLine(x, y, x + w - 1, y);
    oled.drawLine(x, y + h / 2, x + w, y + h / 2);
    oled.drawLine(x + w, y + 1, x + w, y + h / 2);

    // I
    x += w + s;
    oled.drawLine(x, y, x, y + h);
  }

  update();
});


