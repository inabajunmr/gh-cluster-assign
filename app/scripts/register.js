`use strict`;

var gh_cluster_register = {};

gh_cluster_register.addCluster = function () {

    var storage_key = "gh-cluster-assign";
    var asignee_ids = chrome.extension.getBackgroundPage().asignee_ids;
    var clusters = chrome.extension.getBackgroundPage().cluster_list;
    var cluster_name = document.querySelectorAll('input')[0].value;

    console.log(clusters);

    if (clusters == null) {
        clusters = [];
    } else {
        clusters = JSON.parse(clusters);
    }

    if (cluster_name == '') {
        document.getElementById("alert").innerHTML = "Specify cluster name!";
        return;
    }

    var cluster = {
        name: cluster_name,
        ids: asignee_ids
    };

    clusters.push(cluster);

    console.log("start send message to content");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, JSON.stringify(clusters),
            function (response) {
                console.log(response);
            });
    });
    console.log("end send message to content");

    return;
}

document.getElementById('add').addEventListener('click', gh_cluster_register.addCluster);
