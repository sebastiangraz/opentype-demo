// https://interactjs.io/

var el = document.querySelector("#textbox");
console.log(el);
el.onmousedown = function (event) {
	let shiftX = event.clientX - el.getBoundingClientRect().left;
	let shiftY = event.clientY - el.getBoundingClientRect().top;

	el.style.position = "absolute";
	el.style.zIndex = 1000;
	document.querySelector("#canvas").append(el);

	moveAt(event.pageX, event.pageY);

	// moves the el at (pageX, pageY) coordinates
	// taking initial shifts into account
	function moveAt(pageX, pageY) {
		el.style.left = pageX - shiftX + "px";
		el.style.top = pageY - shiftY + "px";
	}

	function onMouseMove(event) {
		moveAt(event.pageX, event.pageY);
	}

	// move the el on mousemove
	document.addEventListener("mousemove", onMouseMove);

	// drop the el, remove unneeded handlers
	el.onmouseup = function () {
		document.removeEventListener("mousemove", onMouseMove);
		el.onmouseup = null;
	};
};

el.ondragstart = function () {
	return false;
};
