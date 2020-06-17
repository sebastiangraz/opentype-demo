window.addEventListener("DOMContentLoaded", (event) => {});
var FontDragAndDrop = FontDragAndDrop || {};

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
		displayContainer = document.getElementById("custom");
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
				droppedFileName,
				droppedFileSize;

			if (droppedFullFileName.match(acceptedFileExtensions)) {
				droppedFileName = droppedFullFileName.replace(/\..+$/, ""); // Removes file extension from name
				droppedFileName = droppedFileName.replace(/\W+/g, "-"); // Replace any non alpha numeric characters with -
				droppedFileSize = Math.round(file.size / 1024) + "kb";

				// Custom Addition by Andras Larsen
				document.title = droppedFileName;

				FontDragAndDrop.processData(file, droppedFileName, droppedFileSize);
			} else {
				alert(
					"Invalid file extension. Will only accept ttf, otf, woff or woff2 font files"
				);
			}
		}
	};

	FontDragAndDrop.processData = function (file, name, size) {
		var reader = new FileReader();
		reader.name = name;
		reader.size = size;

		/* 
	Chrome 6 dev can't do DOM2 event based listeners on the FileReader object so fallback to DOM0
	http://code.google.com/p/chromium/issues/detail?id=48367
	reader.addEventListener("loadend", FontDragAndDrop.buildFontListItem, false);
	*/
		reader.onloadend = function (event) {
			FontDragAndDrop.buildFontListItem(event);
		};
		reader.readAsDataURL(file);
	};

	FontDragAndDrop.buildFontListItem = function (event) {
		domElements = [
			document.createElement("li"),
			document.createElement("span"),
			document.createElement("span"),
		];

		var name = event.target.name,
			size = event.target.size,
			data = event.target.result;

		// Get font file and prepend it to stylsheet using @font-face rule
		fontFaceStyle =
			"@font-face{font-family: " + name + "; src:url(" + data + ");}";
		styleSheet.insertRule(fontFaceStyle, 0);

		domElements[2].appendChild(document.createTextNode(size));
		domElements[1].appendChild(document.createTextNode(name));
		domElements[0].className = "active";
		domElements[0].title = name;
		domElements[0].style.fontFamily = name;
		domElements[0].appendChild(domElements[1]);
		domElements[0].appendChild(domElements[2]);

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
