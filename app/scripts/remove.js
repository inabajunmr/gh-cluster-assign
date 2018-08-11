var gh_cluster_option = {};

// debug mode
// console.log = function(){}

gh_cluster_option.reflesh = function() {
  console.log("Reflesh remove window");

  while (document.getElementById("clusters").firstChild)
    document
      .getElementById("clusters")
      .removeChild(document.getElementById("clusters").firstChild);

  var clusters = chrome.extension.getBackgroundPage().cluster_list;
  console.log(clusters);
  if (clusters == null) {
    return;
  }

  clusters = JSON.parse(clusters);

  console.log(`Remove Clusters ${clusters}`);

  Array.prototype.forEach.call(clusters, cluster => {
    var one_cluster_html = `<li><span></span><button></button></li>`;
    var li = document.createElement("li");
    var span = document.createElement("span");
    span.appendChild(document.createTextNode(cluster.name));
    var button = document.createElement("button");
    button.appendChild(document.createTextNode("delete"));

    function wrappedRemoveCluster() {
      gh_cluster_option.removeCluster(cluster.name);
    }

    button.addEventListener("click", wrappedRemoveCluster);

    li.appendChild(span);
    li.appendChild(button);

    document.getElementById("clusters").appendChild(li);
  });
};

gh_cluster_option.removeCluster = function(cluster_name) {
  var removeObj = { value: cluster_name, event: "remove" };

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, JSON.stringify(removeObj), function(
      response
    ) {
      console.log(response);
    });
  });

  setTimeout(gh_cluster_option.reflesh, 200);
};

gh_cluster_option.reflesh();
