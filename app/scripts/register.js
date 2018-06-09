`use strict`;

var gh_cluster_register = {};

// TODO
gh_cluster_register.addCluster = function () {

    var asignee_ids = chrome.extension.getBackgroundPage().asignee_ids;

    var element = document.getElementById("test");

    var name_node = document.createTextNode(asignee_ids);
    element.appendChild(name_node);

    var element2 = document.getElementsByClassName(js-issue-title)[0];
    element2.appendChild(name_node);
    element.appendChild(element2);
}

document.getElementById('add').addEventListener('click', gh_cluster_register.addCluster);
