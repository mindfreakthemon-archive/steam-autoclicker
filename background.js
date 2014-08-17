var url_regexp = new RegExp("http://steamcommunity.com/market/listings/[^/]+/[^/]+", "i");

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	url_regexp.lastIndex = 0;

	if (changeInfo.status == 'complete' && url_regexp.exec(tab.url)) {
		chrome.pageAction.show(tabId);
		chrome.tabs.executeScript(tabId, { file: 'autoclick.js' });
	}
});