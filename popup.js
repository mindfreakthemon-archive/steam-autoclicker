document.addEventListener('DOMContentLoaded', function () {
	var max = document.getElementById("max"),
		run = document.getElementById("run"),
		abort = document.getElementById("abort"),
		item_title = document.getElementById("item-title"),
		item_image = document.getElementById("item-image");

	chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
		var tab = tabs[0];

		chrome.tabs.sendMessage(tab.id, { type: 'initial' }, function (response) {
			if (response.item_title) {
				max.value = response.max;

				item_title.innerText = response.item_title;

				var img = document.createElement('img');
				img.src = response.item_image;

				item_image.appendChild(img);
			}
		});

		run.addEventListener('click', function () {
			chrome.tabs.sendMessage(tab.id, { type: 'execution', max: max.value });
			window.close();
		});

		abort.addEventListener('click', function () {
			chrome.tabs.sendMessage(tab.id, { type: 'abort' });
			window.close();
		});
	});
});
