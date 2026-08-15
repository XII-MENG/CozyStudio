var device = require("device");
var display = require("display");
var keyboard = require("keyboard");

display.fillScreen(display.color(0, 0, 0));
display.setTextSize(1);
display.setTextColor(display.color(255, 255, 255));
display.setTextAlign("left", "top");

var y = 12;
display.drawText("Board: " + device.getBoard(), 10, y); y += 16;
display.drawText("Resolution: " + display.width() + "x" + display.height(), 10, y); y += 16;

try {
  display.drawText("Free Heap: " + device.getFreeHeap() + " bytes", 10, y); y += 16;
} catch (e) {
  display.drawText("Free Heap: N/A", 10, y); y += 16;
}

display.setTextColor(display.color(150, 150, 150));
display.drawText("Press any key to exit", 10, display.height() - 20);

while (!keyboard.getAnyPress()) {
  delay(50);
}
