`use strict`;

// debug mode

var gh_cluster_register = {};

// TODO a
// TODO b

gh_cluster_register.addCluster = function() {
  var asignee_ids = chrome.extension.getBackgroundPage().asignee_ids;
  var clusters = chrome.extension.getBackgroundPage().cluster_list;
  var cluster_name = document.querySelectorAll("input")[0].value;

  if (clusters == null) {
    clusters = [];
  } else {
    clusters = JSON.parse(clusters);
  }

  if (cluster_name == "") {
    document.getElementById("alert").innerHTML = "Specify cluster name!";
    return;
  }

  var cluster = {
    name: cluster_name,
    ids: asignee_ids
  };

  clusters.push(cluster);

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      JSON.stringify({ value: clusters, event: "register" }),
      function(response) {}
    );
  });

  return;
};

document
  .getElementById("add")
  .addEventListener("click", gh_cluster_register.addCluster);
