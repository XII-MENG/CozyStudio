var device = require("device");
var display = require("display");
var keyboard = require("keyboard");
var storage = require("storage");
var wifi = require("wifi");

// ================== CONFIG ==================
// Change YOUR_USERNAME to your GitHub username
var BASE_URL = "https://raw.githubusercontent.com/YOUR_USERNAME/bruce-appstore-data/main";
var CATEGORIES_URL = BASE_URL + "/categories.json";
// ============================================

var colours = {
  black: display.color(0, 0, 0),
  white: display.color(255, 255, 255),
  green: display.color(0, 255, 0),
  yellow: display.color(255, 255, 0),
  orange: display.color(255, 165, 0),
  grey: display.color(140, 140, 140),
  cyan: display.color(0, 220, 255),
  red: display.color(255, 80, 80)
};

var availableCategories = null;
var availableScripts = { apps: [] };
var currentView = "categories"; // categories | scripts
var selectedCategory = null;
var current = 0;
var dirty = true;
var message = "";
var messageUntil = 0;
var isLoading = false;

var displayWidth = display.width();
var displayHeight = display.height();

function showMsg(txt, time) {
  message = txt;
  messageUntil = now() + (time || 2500);
  dirty = true;
}

function clearMsg() {
  if (message && now() >= messageUntil) {
    message = "";
    dirty = true;
  }
}

function drawText(txt, size, color, y) {
  display.setTextSize(size);
  display.setTextColor(color);
  display.setTextAlign("center", "middle");
  display.drawText(txt, displayWidth / 2, y);
}

function draw() {
  if (!dirty) return;
  dirty = false;

  display.fillScreen(colours.black);

  // Title
  drawText("My App Store", 1, colours.cyan, 12);

  if (isLoading) {
    drawText("Loading...", 1, colours.orange, displayHeight / 2);
    return;
  }

  if (message) {
    drawText(message, 1, colours.orange, displayHeight / 2);
    return;
  }

  if (currentView === "categories") {
    drawCategoryView();
  } else {
    drawScriptView();
  }
}

function drawCategoryView() {
  if (!availableCategories || !availableCategories.categories) {
    drawText("No categories", 1, colours.orange, displayHeight / 2);
    return;
  }

  var cats = availableCategories.categories;
  if (cats.length === 0) {
    drawText("Empty store", 1, colours.orange, displayHeight / 2);
    return;
  }

  var cat = cats[current];

  drawText(cat.name, 2, colours.green, displayHeight / 2 - 20);
  drawText(cat.count + " app" + (cat.count === 1 ? "" : "s"), 1, colours.grey, displayHeight / 2 + 8);
  drawText((current + 1) + " / " + cats.length, 1, colours.grey, displayHeight - 28);
  drawText("< Prev   Select   Next >", 1, colours.grey, displayHeight - 12);
}

function drawScriptView() {
  if (!availableScripts.apps || availableScripts.apps.length === 0) {
    drawText("No apps in category", 1, colours.orange, displayHeight / 2);
    drawText("Press ESC to go back", 1, colours.grey, displayHeight - 12);
    return;
  }

  var app = availableScripts.apps[current];

  drawText(app.n, 2, colours.green, displayHeight / 2 - 28);
  drawText(app.d || "", 1, colours.white, displayHeight / 2);
  drawText("v" + (app.v || "?"), 1, colours.grey, displayHeight / 2 + 20);
  drawText((current + 1) + " / " + availableScripts.apps.length, 1, colours.grey, displayHeight - 28);
  drawText("< Prev   Install   Next >   ESC=Back", 1, colours.grey, displayHeight - 12);
}

function loadCategories() {
  isLoading = true;
  dirty = true;
  draw();

  if (!wifi.connected()) {
    showMsg("WiFi not connected", 4000);
    isLoading = false;
    return;
  }

  try {
    var res = wifi.httpFetch(CATEGORIES_URL, { method: "GET", responseType: "json" });
    if (res.status !== 200) {
      showMsg("HTTP " + res.status, 4000);
      isLoading = false;
      return;
    }
    availableCategories = res.body;
    current = 0;
    currentView = "categories";
  } catch (e) {
    showMsg("Error: " + e.message, 4000);
  }
  isLoading = false;
  dirty = true;
}

function loadCategory(cat) {
  isLoading = true;
  dirty = true;
  draw();

  try {
    var url = BASE_URL + "/releases/category-" + cat.slug + ".min.json";
    var res = wifi.httpFetch(url, { method: "GET", responseType: "json" });
    if (res.status !== 200) {
      showMsg("HTTP " + res.status, 3000);
      isLoading = false;
      return;
    }
    availableScripts = res.body;
    current = 0;
    currentView = "scripts";
    selectedCategory = cat;
  } catch (e) {
    showMsg("Error: " + e.message, 3000);
  }
  isLoading = false;
  dirty = true;
}

function installApp() {
  if (!availableScripts.apps || availableScripts.apps.length === 0) return;

  var app = availableScripts.apps[current];
  showMsg("Downloading metadata...", 8000);
  draw();

  if (!wifi.connected()) {
    showMsg("WiFi not connected");
    return;
  }

  try {
    // 1. Get full metadata
    var metaUrl = BASE_URL + "/repositories/" + app.s.replace(/ /g, "%20") + "/metadata.json";
    var metaRes = wifi.httpFetch(metaUrl, { method: "GET", responseType: "json" });
    if (metaRes.status !== 200) {
      showMsg("Meta HTTP " + metaRes.status);
      return;
    }
    var meta = metaRes.body;

    // 2. Download each file
    var files = meta.files || [];
    var baseDir = (meta.category === "Themes") ? "/Themes/" : "/BruceJS/";
    var catFolder = (meta.category === "Themes") ? meta.name : (meta.category || "Tools");

    try {
      storage.mkdir({ fs: "littlefs", path: baseDir + catFolder });
    } catch (e) {}

    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      var src = (typeof f === "object") ? f.source : f;
      var dest = (typeof f === "object" && f.destination) ? f.destination : src;

      showMsg("File " + (i + 1) + "/" + files.length, 8000);
      draw();

      // Build raw URL: we assume the file is next to metadata.json
      var fileUrl = BASE_URL + "/repositories/" + app.s.replace(/ /g, "%20") + "/" + encodeURIComponent(src);
      var fileRes = wifi.httpFetch(fileUrl, { method: "GET" });

      if (fileRes.status !== 200) {
        showMsg("Fail: " + src);
        return;
      }

      var localPath = baseDir + catFolder + "/" + dest;
      storage.write({ fs: "littlefs", path: localPath }, fileRes.body, "write");
    }

    showMsg("Installed!", 2000);
  } catch (e) {
    showMsg("Err: " + e.message);
  }
}

// ========== Main ==========
loadCategories();

while (true) {
  clearMsg();
  draw();

  if (keyboard.getPress(keyboard.KEY_LEFT) || keyboard.getPress(keyboard.KEY_PREV)) {
    if (currentView === "categories" && availableCategories) {
      var len = availableCategories.categories.length;
      if (len > 0) {
        current = (current - 1 + len) % len;
        dirty = true;
      }
    } else if (currentView === "scripts" && availableScripts.apps) {
      var len = availableScripts.apps.length;
      if (len > 0) {
        current = (current - 1 + len) % len;
        dirty = true;
      }
    }
  }

  if (keyboard.getPress(keyboard.KEY_RIGHT) || keyboard.getPress(keyboard.KEY_NEXT)) {
    if (currentView === "categories" && availableCategories) {
      var len = availableCategories.categories.length;
      if (len > 0) {
        current = (current + 1) % len;
        dirty = true;
      }
    } else if (currentView === "scripts" && availableScripts.apps) {
      var len = availableScripts.apps.length;
      if (len > 0) {
        current = (current + 1) % len;
        dirty = true;
      }
    }
  }

  if (keyboard.getPress(keyboard.KEY_ENTER) || keyboard.getPress(keyboard.KEY_OK) || keyboard.getPress(keyboard.KEY_SELECT)) {
    if (currentView === "categories" && availableCategories) {
      var cat = availableCategories.categories[current];
      loadCategory(cat);
    } else if (currentView === "scripts") {
      installApp();
    }
  }

  if (keyboard.getPress(keyboard.KEY_ESC) || keyboard.getPress(keyboard.KEY_BACK)) {
    if (currentView === "scripts") {
      currentView = "categories";
      current = 0;
      dirty = true;
    } else {
      break;
    }
  }

  delay(40);
}
