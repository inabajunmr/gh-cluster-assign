var asignee_ids = [];

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        asignee_ids = request.value;
    }
);