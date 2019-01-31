`use strict`;

// debug mode
// console.log = function(){}

let gh_cluster_register = {};

gh_cluster_register.addCluster = function() {
  let asignee_ids = chrome.extension.getBackgroundPage().asignee_ids;
  let clusters = chrome.extension.getBackgroundPage().cluster_list;
  let cluster_name = document.querySelectorAll("input")[0].value;

  console.log(clusters);

  if (clusters == null) {
    clusters = [];
  } else {
    clusters = JSON.parse(clusters);
  }

  if (cluster_name == "") {
    document.getElementById("alert").innerHTML = "Specify cluster name!";
    return;
  }

  let cluster = {
    name: cluster_name,
    ids: asignee_ids
  };

  clusters.push(cluster);

  console.log("start send message to content");
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      JSON.stringify({ value: clusters, event: "register" }),
      function(response) {
        console.log(response);
      }
    );
  });
  console.log("end send message to content");

  return;
};

document
  .getElementById("add")
  .addEventListener("click", gh_cluster_register.addCluster);
