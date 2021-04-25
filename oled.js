const fs = require('fs');

const five = require('johnny-five');
const font = require('oled-font-5x7');
const Oled = require('oled-js');
const Raspi = require('raspi-io').RaspiIO;
const board = new five.Board({io: new Raspi});
board.on('ready', () => {
  console.log('Connected to Raspberry, ready.');
  const opts = {
    width: 128,
    height: 32,
    address: 0x3c
  };

	let screen = "--";
	const interval = 1000;
  const oled = new Oled(board, five, opts);

	function update() {

fs.readFile('/proc/asound/card0/stream0', 'utf8' , (err, data) => {
  if (err) {
    console.error(err)
    return
  }

 let match = data.match(/Momentary freq = ([0-9]+) Hz/);
	let rate = "MOPI";
	if (match && match.length > 1) {
	rate = match[1];
	rate = rate / 1000;
	rate = rate.toFixed(1);
	rate = rate.replace(".0", "");
	rate = rate.toString() + "kHz";
	}

	if (screen != rate) {
  oled.clearDisplay();
  oled.setCursor(1, 1);
  oled.writeString(font, 2, rate, 1, true, 2);
  oled.update();
		screen = rate;
	}
   setTimeout(update, interval);
})



	}

   update();
});



