var display = require("display");
var keyboard = require("keyboard");

display.fillScreen(display.color(0, 0, 0));
display.setTextSize(2);
display.setTextColor(display.color(0, 255, 0));
display.setTextAlign("center", "middle");
display.drawText("Hello World!", display.width() / 2, display.height() / 2);

display.setTextSize(1);
display.setTextColor(display.color(180, 180, 180));
display.drawText("Press any key to exit", display.width() / 2, display.height() - 20);

while (!keyboard.getAnyPress()) {
  delay(50);
}
