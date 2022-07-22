var FontDragAndDrop = FontDragAndDrop || {};
var otf = document.querySelector("#otfeatures");
var cta = document.querySelector("#extended");
var exit = document.querySelector("#exit");
(function () {
  var dropContainer,
    dropListing,
    displayContainer,
    domElements,
    fontPreviewFragment = document.createDocumentFragment(),
    styleSheet,
    fontFaceStyle;

  FontDragAndDrop.setup = function () {
    dropListing = document.getElementById("fonts");
    dropContainer = document.getElementsByTagName("section")[0];
    displayContainer = document.getElementById("canvas");
    styleSheet = document.styleSheets[0];

    dropListing.addEventListener(
      "click",
      FontDragAndDrop.handleFontChange,
      false
    );

    /* DnD event listeners */
    dropContainer.addEventListener(
      "dragenter",
      function (event) {
        FontDragAndDrop.preventActions(event);
      },
      false
    );
    dropContainer.addEventListener(
      "dragover",
      function (event) {
        FontDragAndDrop.preventActions(event);
      },
      false
    );
    dropContainer.addEventListener("drop", FontDragAndDrop.handleDrop, false);
  };

  FontDragAndDrop.handleDrop = function (evt) {
    var dt = evt.dataTransfer,
      files = dt.files || false,
      count = files.length,
      acceptedFileExtensions = /^.*\.(ttf|otf|woff|woff2)$/i;

    FontDragAndDrop.preventActions(evt);

    for (var i = 0; i < count; i++) {
      var file = files[i],
        droppedFullFileName = file.name,
        droppedFileName;

      if (droppedFullFileName.match(acceptedFileExtensions)) {
        droppedFileName = droppedFullFileName.replace(/\..+$/, ""); // Removes file extension from name
        droppedFileName = droppedFileName.replace(/\W+/g, "-"); // Replace any non alpha numeric characters with -

        // Custom Addition by Andras Larsen

        FontDragAndDrop.processData(file, droppedFileName);
      } else {
        alert(
          "Invalid file extension. Will only accept ttf, otf, woff or woff2 font files"
        );
      }
    }
  };

  FontDragAndDrop.processData = function (file, name) {
    var reader = new FileReader();
    reader.name = name;
    /* 
	Chrome 6 dev can't do DOM2 event based listeners on the FileReader object so fallback to DOM0
	http://code.google.com/p/chromium/issues/detail?id=48367
	reader.addEventListener("loadend", FontDragAndDrop.buildFontListItem, false);
	*/
    reader.onloadend = function (event) {
      try {
        var fontBuffer = event.target.result;

        var vf = new VariableFont(opentype.parse(fontBuffer));
        onFontLoaded(vf, fontBuffer);
        FontDragAndDrop.buildFontListItem(event);
      } catch (e) {
        alert("Error: " + e);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  function Uint8ToString(u8a) {
    var CHUNK_SZ = 0x8000;
    var c = [];
    for (var i = 0; i < u8a.length; i += CHUNK_SZ) {
      c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)));
    }
    return c.join("");
  }

  function onFontLoaded(varFont, fontBuffer) {
    var currentSettings = [];
    if (varFont.getAxesCount()) {
      const controls = otf.querySelector(".controls");

      varFont.tables.fvar.axes.map((e, i) => {
        currentSettings.push("'" + e.tag + "' " + e.defaultValue.toString());

        controls.innerHTML += `<div class="slider-container">
        <div class="slider-controls">
          <label for="text-weight" class="slider-label">
            <span class="slider-name">${e.tag} </span>
            <span class="output" data-index="${i}">${e.defaultValue}</span>
          </label>
        </div>
        <input
          type="range"
          min="${e.minValue}"
          max="${e.maxValue}"
          value="${e.defaultValue}"
          class="slider"
          id="${e.tag}"
          name="${e.tag}"
          data-index="${i}"
        />
      </div>`;
      });

      document.querySelectorAll("input[type=range]").forEach((box) =>
        box.addEventListener("input", (e) => {
          console.log(e);
          currentSettings = [];
          for (var k = 0; k < varFont.getAxesCount(); k++) {
            var axis = varFont.getAxis(k);
            var element = document.getElementById(axis.tag.toString());
            currentSettings.push(
              "'" + axis.tag.toString() + "' " + element.value
            );
          }
          const container = document.querySelector(".container");
          console.log(currentSettings.join());
          Object.assign(container.style, {
            fontVariationSettings: `${currentSettings.join()}`,
          });
        })
      );
    }
  }

  FontDragAndDrop.buildFontListItem = function (event) {
    domElements = [
      document.createElement("li"),
      document.createElement("span"),
    ];

    var name = event.target.name,
      data = event.target.result;

    var base64String = btoa(Uint8ToString(new Uint8Array(data)));

    // Get font file and prepend it to stylsheet using @font-face rule
    fontFaceStyle =
      "@font-face{font-family: " +
      name +
      "; src:url('data:;base64," +
      base64String +
      "');}";
    styleSheet.insertRule(fontFaceStyle, 0);

    domElements[1].appendChild(
      document.createTextNode(name.replace(/-/g, " "))
    );
    domElements[0].className = "active";
    domElements[0].title = name;
    domElements[0].style.fontFamily = name;
    domElements[0].appendChild(domElements[1]);

    fontPreviewFragment.appendChild(domElements[0]);

    dropListing.appendChild(fontPreviewFragment);
    FontDragAndDrop.updateActiveFont(domElements[0]);
    displayContainer.style.fontFamily = name;
  };

  /* Control changing of fonts in drop list  */
  FontDragAndDrop.handleFontChange = function (evt) {
    var clickTarget = evt.target || window.event.srcElement;

    if (clickTarget.nodeName.toLowerCase() === "span") {
      clickTarget = clickTarget.parentNode;
      FontDragAndDrop.updateActiveFont(clickTarget);
    }
  };
  FontDragAndDrop.updateActiveFont = function (target) {
    var getFontFamily = target.title,
      dropListItem = dropListing.getElementsByTagName("li");
    displayContainer.style.fontFamily = getFontFamily;
    for (var i = 0, len = dropListItem.length; i < len; i++) {
      dropListItem[i].className = "";
    }
    target.className = "active";
  };

  FontDragAndDrop.preventActions = function (evt) {
    if (evt.stopPropagation && evt.preventDefault) {
      evt.stopPropagation();
      evt.preventDefault();
    } else {
      evt.cancelBubble = true;
      evt.returnValue = false;
    }
  };

  window.addEventListener("load", FontDragAndDrop.setup, false);
})();

cta.addEventListener("click", (event) => {
  otf.classList.toggle("active");
});

exit.addEventListener("click", (event) => {
  otf.classList.remove("active");
});
