`use strict`;

// debug mode
// console.log = function(){}
// TODO
// TODO
// TODO
var asignee_ids = [];
var cluster_list = [];

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.value.key === "asignee_ids") {
    asignee_ids = request.value.value;
  }

  if (request.value.key === "cluster_list") {
    cluster_list = request.value.value;
  }

  return true;
});
