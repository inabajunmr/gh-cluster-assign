`use strict`;

// debug mode
// console.log = function(){}

var gh_cluster = {
    storage_key: "gh-cluster-assign"
};

// Create node for one cluster as asignee user.
gh_cluster.createClusterDom = function (cluster_name, target_ids, kind) {
    var cluster_html = `
    <div class="select-menu-item js-navigation-item" role="menuitem">
        <svg class="octicon octicon-check select-menu-item-icon" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true">
            <path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"></path>
        </svg>
        <div class="cluster">
        </div>
        <div class="select-menu-item-gravatar">
            <img src="https://github.com/inabajunmr/gh-cluster-assign/blob/master/app/icon.png?raw=true" alt="" size="20" class="avatar avatar-small mr-1 js-avatar">
        </div>
        <div class="select-menu-item-text lh-condensed">
            <span class="select-menu-item-heading">
                <span class="js-username"></span>
                <span class="description js-description">gh-cluster</span>
            </span>
        </div>
    </div>
    `
    var tempEl = document.createElement('div');
    tempEl.innerHTML = cluster_html;
    var target = tempEl.firstElementChild;
    target.classList.add("cluster-" + kind);
    var cluster = target.getElementsByClassName("cluster")[0];
    console.log(target_ids);

    console.log(kind);
    if (kind == "assignee") {
        target_ids.forEach(target_ids => {
            cluster.appendChild(gh_cluster.createAssigneeInputTag(target_ids));
        });
    }

    if (kind == "reviewer") {
        target_ids.forEach(target_ids => {
            cluster.appendChild(gh_cluster.createReviwerInputTag(target_ids));
        });
    }

    var name_node = document.createTextNode(cluster_name);
    var cluster_name_node = target.getElementsByClassName("js-username")[0];
    cluster_name_node.appendChild(name_node);

    return target;
}

// create node for input new asignee.(means one user)
gh_cluster.createAssigneeInputTag = function (target_id) {
    var asignee_html = `<input style="display:none" type="checkbox" name="issue[user_assignee_ids][]">`;
    var tempEl = document.createElement('div');
    tempEl.innerHTML = asignee_html;
    var target = tempEl.firstElementChild;
    target.setAttribute("value", target_id);
    return target;
}

// create node for input new reviewer.(means one user)
gh_cluster.createReviwerInputTag = function (target_id) {
    var reviwer_html = `<input style="display:none" type="checkbox" name="reviewer_user_ids[]">`;
    var tempEl = document.createElement('div');
    tempEl.innerHTML = reviwer_html;
    var target = tempEl.firstElementChild;
    target.setAttribute("value", target_id);
    return target;
}

gh_cluster.start = function () {

    // wait for loading asignee list dom
    var find_asignee_list_interbal_id = setInterval(constructAsigneeClusterOptionDom, 200);
    var find_reviewer_list_interbal_id = setInterval(constructReviewerClusterOptionDom, 200);

    function constructAsigneeClusterOptionDom() {

        if (document.getElementsByClassName("cluster-" + "assignee").length != 0) {
            console.log("already exist cluster doms");
            return;
        }

        console.log("find start assignee cluster");
        if (localStorage.getItem(gh_cluster.storage_key) == null) {
            return;
        }
        var clusters = JSON.parse(localStorage.getItem(gh_cluster.storage_key));
        console.log("construct clusters for assignee")
        console.log(clusters)

        Array.prototype.forEach.call(clusters, cluster => {
            var asignee_list_asignee_node = document.querySelector('div[data-filterable-for="assignee-filter-field"] div');
            if (asignee_list_asignee_node != null) {
                clearInterval(find_asignee_list_interbal_id);
                var asignee_list_node = document.querySelector('div[data-filterable-for="assignee-filter-field"]');
                asignee_list_node.insertBefore(gh_cluster.createClusterDom(cluster.name, cluster.ids, "assignee"), asignee_list_node.firstChild);
                console.log("find end")
            }
        });
    }

    function constructReviewerClusterOptionDom() {

        if (document.getElementsByClassName("cluster-" + "reviewer").length != 0) {
            console.log("already exist cluster doms");
            return;
        }

        console.log("find start reviewer");
        if (localStorage.getItem(gh_cluster.storage_key) == null) {
            return;
        }
        var clusters = JSON.parse(localStorage.getItem(gh_cluster.storage_key));
        console.log("construct clusters for reviewer")
        console.log(clusters)

        Array.prototype.forEach.call(clusters, cluster => {
            var asignee_list_reviewer_node = document.querySelector('div[data-filterable-for="review-filter-field"] div');
            if (asignee_list_reviewer_node != null) {
                clearInterval(find_reviewer_list_interbal_id);
                var reviewer_list_node = document.querySelector('div[data-filterable-for="review-filter-field"]');
                reviewer_list_node.insertBefore(gh_cluster.createClusterDom(cluster.name, cluster.ids, "reviewer"), reviewer_list_node.firstChild);
                console.log("find end")
            }
        });
    }
}

// send current asignee list to background for register new cluster.
gh_cluster.observeAsigneeList = function () {
    console.log("set observer");
    var target = document.getElementsByClassName('discussion-sidebar')[0];
    var observer = new MutationObserver(records => {
        console.log("observe");
        gh_cluster.sendAsigneeList();
        gh_cluster.hookAddClusterToList();
    });
    var options = {
        subtree: true,
        childList: true
    };
    observer.observe(target, options);
}

gh_cluster.sendAsigneeList = function () {
    var current_asignee_list = gh_cluster.getCurrentAsigneeList();
    var current_reviewer_list = gh_cluster.getCurrentReviewerList();

    var concat_list = current_asignee_list.concat(current_reviewer_list);
    var merge_list = concat_list.filter(function (item, pos) { return concat_list.indexOf(item) == pos });

    chrome.runtime.sendMessage({ value: { key: "asignee_ids", value: merge_list } });
}

// return current asignee id list
gh_cluster.getCurrentAsigneeList = function () {
    var node = gh_cluster.findNodeByTextNodeInSideBar("Assignees");
    var list_node = node.querySelector(".js-issue-sidebar-form .css-truncate").getElementsByTagName("p");
    var asignee_ids = [];
    Array.prototype.forEach.call(list_node, asignee_node => {
        var asignee_id_node = asignee_node.querySelector("[data-hovercard-user-id]");
        if (asignee_id_node != null) {
            var asignee_id = asignee_id_node.getAttribute("data-hovercard-user-id");
            asignee_ids.push(asignee_id);
        }
    });
    console.log(asignee_ids);
    return asignee_ids;
}

gh_cluster.getCurrentReviewerList = function () {
    var node = gh_cluster.findNodeByTextNodeInSideBar("Reviewers");
    if (node == null) {
        return [];
    }

    var list_node = node.querySelector(".js-issue-sidebar-form .css-truncate").getElementsByTagName("p");
    var reviewer_ids = [];
    Array.prototype.forEach.call(list_node, reviewer_node => {
        var asignee_id_node = reviewer_node.querySelector("[data-hovercard-user-id]");
        if (asignee_id_node != null) {
            var reviewer_id = asignee_id_node.getAttribute("data-hovercard-user-id");
            reviewer_ids.push(reviewer_id);
        }
    });

    console.log(reviewer_ids);
    return reviewer_ids;
}

gh_cluster.sendClustersByStorage = function () {
    console.log("send message");
    var clusters = localStorage.getItem(gh_cluster.storage_key);
    console.log(clusters);
    chrome.runtime.sendMessage({ value: { key: "cluster_list", value: clusters } });
}

gh_cluster.findNodeByTextNodeInSideBar = function (text) {
    for (step = 1; step < 5; step++) {
        var selector = ".sidebar-assignee:nth-child(" + step + ") button";
        var element = document.querySelector(selector);
        if (element == null) {
            continue;
        }
        if (element.textContent.trim() == text) {
            return document.querySelector(".sidebar-assignee:nth-child(" + step + ")");
        }
    }
    return null;
}

gh_cluster.findButtonByTextNodeInSideBar = function (text) {
    for (step = 1; step < 5; step++) {
        var selector = ".sidebar-assignee:nth-child(" + step + ") button";
        var element = document.querySelector(selector);
        if (element == null) {
            continue;
        }
        if (element.textContent.trim() == text) {
            return element;
        }
    }
    return null;
}

gh_cluster.removeCluster = function (name) {
    var clusters = JSON.parse(localStorage.getItem(gh_cluster.storage_key));
    console.log("before");
    console.log(clusters);

    var index;
    for (var i = 0; i < clusters.length; i++) {
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
    localStorage.setItem(gh_cluster.storage_key, JSON.stringify(clusters));

    gh_cluster.sendClustersByStorage();

}


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    // TODO shoud I filter by sender?
    console.log("SENDER");
    console.log(sender);
    console.log(message);
    messageObj = JSON.parse(message);

    console.log("JSON");
    console.log(JSON.stringify(messageObj.value));

    if (messageObj.event == "register") {
        console.log("add value from popup");
        localStorage.setItem(gh_cluster.storage_key, JSON.stringify(messageObj.value));
        chrome.runtime.sendMessage({ value: { key: "cluster_list", value: JSON.stringify(messageObj.value) } });
        return;
    }

    if (messageObj.event == "remove") {
        console.log("remove value from option");
        console.log(message.value);
        gh_cluster.removeCluster(message.value);

        chrome.runtime.sendMessage({ value: { key: "cluster_list", value: JSON.stringify(messageObj.value) } });
        return;
    }

    console.log("nop");
    return;
});

gh_cluster.hookAddClusterToList = function () {
    var element1 = gh_cluster.findButtonByTextNodeInSideBar("Assignees");
    element1.addEventListener('click', gh_cluster.start, false);

    // pull request only
    var element2 = gh_cluster.findButtonByTextNodeInSideBar("Reviewers");
    if (element2 != null) {
        console.log("HOOK Reviewers");
        element2.addEventListener('click', gh_cluster.start, false);
    }
}

// start observe for send asignee to background
gh_cluster.sendAsigneeList();
gh_cluster.observeAsigneeList();
gh_cluster.sendClustersByStorage()
gh_cluster.hookAddClusterToList();


