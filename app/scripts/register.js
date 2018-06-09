`use strict`;

var gh_cluster_register = {};

// TODO
gh_cluster_register.addCluster = function () {
    var element = document.getElementById("test");

    var name_node = document.createTextNode("YYYYY");
    element.appendChild(name_node);


    var element2 = document.getElementsByClassName(js-issue-title)[0];
    element2.appendChild(name_node);
    element.appendChild(element2);

}

document.getElementById('add').addEventListener('click', gh_cluster_register.addCluster);
