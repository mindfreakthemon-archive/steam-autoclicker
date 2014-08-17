var maximum = 0;

var checkbox = document.getElementById("market_buynow_dialog_accept_ssa"),
	purchase = document.getElementById("market_buynow_dialog_purchase"),
	dialog_error = document.getElementById("market_buynow_dialog_error"),
	dialog_buttons = document.getElementById("market_buynow_dialog_bottom_buttons"),
	cancel_button = document.getElementById("market_buynow_dialog_cancel"),
	searches = document.getElementById("searchResultsRows");
checkbox.checked = true;

function check(callback) {
	var rows = searches.querySelectorAll('.market_listing_row');

	if (!rows.length) {
		callback();
		return;
	}

	var first = rows[0];

	var price = first.querySelector('.market_listing_price.market_listing_price_with_fee'),
		button = first.querySelector('.item_market_action_button_contents'),
		price_text = price.innerText;

	if (price_text.indexOf('$') === -1) {
		callback();
		return;
	}

	var price_float = Number(price_text.substr(1, price_text.indexOf(' ')));

	if (price_float > maximum) {
		callback();
		return;
	}

	triggerClick(button);

	setTimeout(function () {
		triggerClick(purchase);

		var lunch_interval;

		function lunch_action() {
			var no_error = dialog_error.style.display === 'none',
				no_success = dialog_buttons.style.display === 'none';

			// if got anything
			if (!no_error || !no_success) {
				clearInterval(lunch_interval);

				// miss
				if (!no_error) {
					triggerClick(cancel_button);
					callback();
					return;
				}

				// hit
				alert('Got your stuff..');
			}
		}

		lunch_interval = setInterval(lunch_action, 100);
	}, 0);
}

function triggerClick(target) {
	var event = new MouseEvent('click', {
		view: window,
		bubbles: true,
		cancelable: true
	});

	target.dispatchEvent(event);
}

function updateRequest(callback) {
	var xml_http = new XMLHttpRequest();

	xml_http.onerror = function () {
		console.log(arguments);
	};

	xml_http.onreadystatechange = function () {
		if (xml_http.readyState === 4) {
			callback(xml_http.status !== 200, xml_http.responseText);
		}
	};

	xml_http.open("GET", window.location.href, true);
	xml_http.send();
}

var update_timeout,
	forse_stop = false;

function setupTimeout(handler, timeout) {
	if (forse_stop) {
		forse_stop = false;
		return;
	}

	update_timeout = setTimeout(function () {
		updateRequest(handler);
	}, timeout || 500);
}

document.addEventListener('DOMContentLoaded', function () {alert(1);});

chrome.runtime.onMessage.addListener(function (request, sender, callback) {
	switch (request.type) {
		case 'initial':
			var item_title = document.getElementById("largeiteminfo_item_name"),
				item_image = document.querySelector("#mainContents .market_listing_largeimage img");

			callback({ item_title: item_title.innerText, item_image: item_image.src, max: maximum });
			break;
		case 'abort':
			forse_stop = true;
			clearTimeout(update_timeout);
			break;
		case 'execution':
			maximum = request.max;

			updateRequest(function handler(error, response) {
				if (error) {
					setupTimeout(handler, 2000);
					return;
				}

				var doc = document.implementation.createHTMLDocument("");
				doc.documentElement.innerHTML = response;

				var script_text = doc.querySelectorAll('script')[19].innerText;
				script_text = script_text.replace("Event.observe( document, 'dom:loaded', function() {",
					"(function(f){f()})(function (){");

				searches.innerHTML = doc.getElementById('searchResultsRows').innerHTML;

				var scripts = document.querySelectorAll('script.autoclicker');
				for (var i = 0, l = scripts.length; i < l; i++) {
					scripts[i].parentNode.removeChild(scripts[i]);
				}

				var script = document.createElement('script');
				script.innerHTML = script_text;
				script.className = 'autoclicker';
				document.body.appendChild(script);

				check(function () {
					setupTimeout(handler);
				});
			});
			break;
	}
});