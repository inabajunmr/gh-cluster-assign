`use strict`;

// debug mode
// console.log = function(){}

let gh_cluster = {
  storage_key: "gh-cluster-assign"
};

gh_cluster.start = function() {
  // construct clusters
  // wait for loading asignee list dom
  let find_asignee_list_interbal_id = setInterval(
    constructAsigneeClusterOptionDom,
    200
  );
  let find_reviewer_list_interbal_id = setInterval(
    constructReviewerClusterOptionDom,
    20000
  );

  function constructAsigneeClusterOptionDom() {
    if (document.getElementsByClassName("cluster-assignee").length != 0) {
      console.log("already exist cluster doms");
      return;
    }

    console.log("find start assignee cluster");
    if (localStorage.getItem(gh_cluster.storage_key) == null) {
      return;
    }

    let clusters = JSON.parse(localStorage.getItem(gh_cluster.storage_key));
    console.log("construct clusters for assignee");
    console.log(clusters);

    let asignee_list_asignee_node = document.querySelector(
      'div[data-filterable-for="assignee-filter-field"] div'
    );

    if (asignee_list_asignee_node != null) {
      clearInterval(find_asignee_list_interbal_id);
    }else{
      return;
    }

    Array.prototype.forEach.call(clusters, cluster => {
        let asignee_list_node = document.querySelector(
          'div[data-filterable-for="assignee-filter-field"]'
        );
        asignee_list_node.insertBefore(
          gh_operator.createClusterDom(cluster.name, cluster.ids, "assignee"),
          asignee_list_node.firstChild
        );
        console.log("find end");
    });
  }

  function constructReviewerClusterOptionDom() {
    if (document.getElementsByClassName("cluster-reviewer").length != 0) {
      console.log("already exist cluster doms");
      return;
    }

    console.log("find start reviewer");
    if (localStorage.getItem(gh_cluster.storage_key) == null) {
      return;
    }
    let clusters = JSON.parse(localStorage.getItem(gh_cluster.storage_key));
    console.log("construct clusters for reviewer");
    console.log(clusters);
    let asignee_list_reviewer_node = document.querySelector(
      'div[data-filterable-for="review-filter-field"] div'
    );
    if (asignee_list_reviewer_node != null) {
      clearInterval(find_reviewer_list_interbal_id);
    }else{
      return;
    }

    Array.prototype.forEach.call(clusters, cluster => {

        let reviewer_list_node = document.querySelector(
          'div[data-filterable-for="review-filter-field"]'
        );
        reviewer_list_node.insertBefore(
          gh_operator.createClusterDom(cluster.name, cluster.ids, "reviewer"),
          reviewer_list_node.firstChild
        );
        console.log("find end");
    });
  }
};

// send current asignee list to background for register new cluster.
gh_cluster.observeAsigneeList = function() {
  console.log("set observer");
  let target = document.getElementsByClassName("discussion-sidebar")[0];
  let observer = new MutationObserver(records => {
    console.log("observe");
    gh_cluster.sendAsigneeList();
    gh_cluster.hookAddClusterToList();
  });
  let options = {
    subtree: true,
    childList: true
  };
  observer.observe(target, options);
};

gh_cluster.sendAsigneeList = function() {
  let current_asignee_list = gh_cluster.getCurrentAsigneeList();
  let current_reviewer_list = gh_cluster.getCurrentReviewerList();

  let concat_list = current_asignee_list.concat(current_reviewer_list);
  let merge_list = concat_list.filter(function(item, pos) {
    return concat_list.indexOf(item) == pos;
  });

  chrome.runtime.sendMessage({
    value: { key: "asignee_ids", value: merge_list }
  });
};

// return current asignee id list
gh_cluster.getCurrentAsigneeList = function() {
  let node = gh_operator.findNodeByTextNodeInSideBar("Assignees");
  let list_node = node
    .querySelector(".js-issue-sidebar-form .css-truncate")
    .getElementsByTagName("p");
  let asignee_ids = [];
  Array.prototype.forEach.call(list_node, asignee_node => {
    let asignee_id_node = asignee_node.querySelector(
      "[data-hovercard-url]"
    );

    console.log(asignee_id_node)
    if (asignee_id_node != null) {
      let asignee_id = asignee_id_node.getAttribute("data-hovercard-url").replace("/hovercards?user_id=","");
      asignee_ids.push(asignee_id);
    }
  });
  console.log(asignee_ids);
  return asignee_ids;
};

gh_cluster.getCurrentReviewerList = function() {
  let node = gh_operator.findNodeByTextNodeInSideBar("Reviewers");
  if (node == null) {
    return [];
  }

  let list_node = node
    .querySelector(".js-issue-sidebar-form .css-truncate")
    .getElementsByTagName("p");
  let reviewer_ids = [];
  Array.prototype.forEach.call(list_node, reviewer_node => {
    let asignee_id_node = reviewer_node.querySelector(
      "[data-hovercard-url]"
    );
    if (asignee_id_node != null) {
      let reviewer_id = asignee_id_node.getAttribute("data-hovercard-url").replace("/hovercards?user_id=","");
      reviewer_ids.push(reviewer_id);
    }
  });

  console.log(reviewer_ids);
  return reviewer_ids;
};

gh_cluster.sendClustersByStorage = function() {
  console.log("send message");
  let clusters = localStorage.getItem(gh_cluster.storage_key);
  console.log(clusters);
  chrome.runtime.sendMessage({
    value: { key: "cluster_list", value: clusters }
  });
};

gh_cluster.removeCluster = function(name) {
  console.log(`START REMOVE CLUSTER ${name}`);
  let clusters = JSON.parse(localStorage.getItem(gh_cluster.storage_key));
  console.log("before");
  console.log(clusters);

  let index;
  for (let i = 0; i < clusters.length; i++) {
    console.log(clusters[i].name);
    console.log(name);
    if (clusters[i].name === name) {
      console.log("FUKC");
      index = i;
      break;
    }
  }

  console.log("after");
  console.log(index);
  clusters.splice(index, 1);
  console.log(clusters);
  console.log("END REMOVE CLUSTER");

  localStorage.setItem(gh_cluster.storage_key, JSON.stringify(clusters));

  gh_cluster.sendClustersByStorage();
};

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  // TODO shoud I filter by sender?
  console.log("SENDER");
  console.log(sender);
  console.log(message);
  messageObj = JSON.parse(message);

  console.log("JSON");
  console.log(JSON.stringify(messageObj.value));

  if (messageObj.event == "register") {
    console.log("add value from popup");
    localStorage.setItem(
      gh_cluster.storage_key,
      JSON.stringify(messageObj.value)
    );
    chrome.runtime.sendMessage({
      value: { key: "cluster_list", value: JSON.stringify(messageObj.value) }
    });
    return;
  }

  if (messageObj.event == "remove") {
    console.log("remove value from option");
    console.log(messageObj.value);
    gh_cluster.removeCluster(messageObj.value);
    gh_cluster.sendClustersByStorage();
    return;
  }

  console.log("nop");
  return;
});

gh_cluster.hookAddClusterToList = function() {
  let element1 = gh_operator.findButtonByTextNodeInSideBar("Assignees");
  element1.addEventListener("click", gh_cluster.start, false);

  // pull request only
  let element2 = gh_operator.findButtonByTextNodeInSideBar("Reviewers");
  if (element2 != null) {
    console.log("HOOK Reviewers");
    element2.addEventListener("click", gh_cluster.start, false);
  }
};

// start observe for send asignee to background
gh_cluster.sendAsigneeList();
gh_cluster.observeAsigneeList();
gh_cluster.sendClustersByStorage();
gh_cluster.hookAddClusterToList();
