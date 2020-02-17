`use strict`;

// debug mode

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
    200
  );

  var unused = "test"

  function constructAsigneeClusterOptionDom() {
    if (document.getElementsByClassName("cluster-assignee").length != 0) {
      clearInterval(find_asignee_list_interbal_id);
      return;
    }

    if (localStorage.getItem(gh_cluster.storage_key) == null) {
      clearInterval(find_reviewer_list_interbal_id);
      return;
    }

    let clusters = JSON.parse(localStorage.getItem(gh_cluster.storage_key));
    let asignee_list_asignee_node = document.querySelector(
      'div[data-filterable-for="assignee-filter-field"] div'
    );

    if (asignee_list_asignee_node != null) {
      clearInterval(find_asignee_list_interbal_id);
    } else {
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
    });
  }

  function constructReviewerClusterOptionDom() {
    if (document.getElementsByClassName("cluster-reviewer").length != 0) {
      clearInterval(find_reviewer_list_interbal_id);
      return;
    }

    if (localStorage.getItem(gh_cluster.storage_key) == null) {
      clearInterval(find_reviewer_list_interbal_id);
      return;
    }
    let clusters = JSON.parse(localStorage.getItem(gh_cluster.storage_key));
    let asignee_list_reviewer_node = document.querySelector(
      'div[data-filterable-for="review-filter-field"] div'
    );
    if (asignee_list_reviewer_node != null) {
      clearInterval(find_reviewer_list_interbal_id);
    } else {
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
    });
  }
};

// send current asignee list to background for register new cluster.
gh_cluster.observeAsigneeList = function() {
  let target = document.getElementsByClassName("discussion-sidebar")[0];
  let observer = new MutationObserver(records => {
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
  if (node === null) {
    return [];
  }
  let list_node = node
    .querySelector(".js-issue-sidebar-form .css-truncate")
    .getElementsByTagName("p");
  let asignee_ids = [];
  Array.prototype.forEach.call(list_node, asignee_node => {
    let asignee_id_node = asignee_node.querySelector("[data-hovercard-url]");

    if (asignee_id_node != null) {
      let asignee_id = asignee_id_node
        .getAttribute("data-hovercard-url")
        .replace("/hovercards?user_id=", "");
      asignee_ids.push(asignee_id);
    }
  });

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
    let asignee_id_node = reviewer_node.querySelector("[data-hovercard-url]");
    if (asignee_id_node != null) {
      let reviewer_id = asignee_id_node
        .getAttribute("data-hovercard-url")
        .replace("/hovercards?user_id=", "");
      reviewer_ids.push(reviewer_id);
    }
  });

  return reviewer_ids;
};

gh_cluster.sendClustersByStorage = function() {
  let clusters = localStorage.getItem(gh_cluster.storage_key);

  chrome.runtime.sendMessage({
    value: { key: "cluster_list", value: clusters }
  });
};

gh_cluster.removeCluster = function(name) {
  let clusters = JSON.parse(localStorage.getItem(gh_cluster.storage_key));

  let index;
  for (let i = 0; i < clusters.length; i++) {
    if (clusters[i].name === name) {
      index = i;
      break;
    }
  }

  clusters.splice(index, 1);

  localStorage.setItem(gh_cluster.storage_key, JSON.stringify(clusters));

  gh_cluster.sendClustersByStorage();
};

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  // TODO shoud I filter by sender?

  messageObj = JSON.parse(message);

  if (messageObj.event == "register") {
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
    gh_cluster.removeCluster(messageObj.value);
    gh_cluster.sendClustersByStorage();
    return;
  }

  return;
});

gh_cluster.hookAddClusterToList = function() {
  let element1 = gh_operator.findButtonByTextNodeInSideBar("Assignees");
  element1.addEventListener("click", gh_cluster.start, false);

  // pull request only
  let element2 = gh_operator.findButtonByTextNodeInSideBar("Reviewers");
  if (element2 != null) {
    element2.addEventListener("click", gh_cluster.start, false);
  }
};

// start observe for send asignee to background
gh_cluster.sendAsigneeList();
gh_cluster.observeAsigneeList();
gh_cluster.sendClustersByStorage();
gh_cluster.hookAddClusterToList();
