`use strict`;

var gh_cluster_register = {};

gh_cluster_register.addCluster = function () {

    var storage_key = "gh-cluster-assign";
    var asignee_ids = chrome.extension.getBackgroundPage().asignee_ids;
    var cluster_name = document.querySelectorAll('input')[0].value;

    if (cluster_name == '') {
        document.getElementById("alert").innerHTML = "Specify cluster name!";
        return;
    }

    var clusters = JSON.parse(localStorage.getItem(storage_key));
    if (clusters == null) {
        clusters = [];
    }

    var cluster = {
        name: cluster_name,
        ids: asignee_ids
    };

    clusters.push(cluster);

    localStorage.setItem(storage_key, JSON.stringify(clusters));
    document.getElementById("alert").innerHTML = JSON.stringify(clusters);
}

document.getElementById('add').addEventListener('click', gh_cluster_register.addCluster);
