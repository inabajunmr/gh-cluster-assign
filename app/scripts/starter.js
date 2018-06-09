`use strict`;
var gh_cluster = {
    storage_key: "gh-cluster-assign",
    already_start: false
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
            <img src="https://avatars3.githubusercontent.com/u/10000393?s=60&amp;v=4" alt="" size="20" class="avatar avatar-small mr-1 js-avatar">
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
    if (gh_cluster.already_start) {
        // preserve duplicate cluster
        return;
    } else {
        gh_cluster.already_start = true;
    }

    // wait for loading asignee list dom
    var find_asignee_list_interbal_id = setInterval(constructAsigneeClusterOptionDom, 200);
    var find_reviewer_list_interbal_id = setInterval(constructReviewerClusterOptionDom, 200);

    function constructAsigneeClusterOptionDom() {
        console.log("find start");
        if (localStorage.getItem(gh_cluster.storage_key) == null) {
            return;
        }
        var clusters = JSON.parse(localStorage.getItem(gh_cluster.storage_key));
        console.log("construct clusters")
        console.log(clusters)

        Array.prototype.forEach.call(clusters, cluster => {
            var asignee_list_asignee_node = document.querySelector('div[data-filterable-for="assignee-filter-field"] div');
            if (asignee_list_asignee_node != null) {
                clearInterval(find_asignee_list_interbal_id);
                var asignee_list_node = document.querySelector('div[data-filterable-for="assignee-filter-field"]');
                // var asignees = ["10000393", "16970553"];
                asignee_list_node.insertBefore(gh_cluster.createClusterDom(cluster.name, cluster.ids, "assignee"), asignee_list_node.firstChild);
                console.log("find end")
            }
        });
    }

    function constructReviewerClusterOptionDom() {
        console.log("find start");
        if (localStorage.getItem(gh_cluster.storage_key) == null) {
            return;
        }
        var clusters = JSON.parse(localStorage.getItem(gh_cluster.storage_key));
        console.log("construct clusters")
        console.log(clusters)

        Array.prototype.forEach.call(clusters, cluster => {
            var asignee_list_reviewer_node = document.querySelector('div[data-filterable-for="review-filter-field"] div');
            if (asignee_list_reviewer_node != null) {
                clearInterval(find_reviewer_list_interbal_id);
                var reviewer_list_node = document.querySelector('div[data-filterable-for="review-filter-field"]');
                // reviewer_user_ids[]
                reviewer_list_node.insertBefore(gh_cluster.createClusterDom(cluster.name, cluster.ids, "reviewer"), reviewer_list_node.firstChild);
                console.log("find end")
            }
        });
    }
}

// send current asignee list to background for register new cluster.
gh_cluster.observeAsigneeList = function () {
    var target = document.getElementsByClassName('discussion-sidebar')[0];
    var observer = new MutationObserver(records => {
        gh_cluster.sendAsigneeList();
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
    var list_node = document.querySelector(".sidebar-assignee .js-issue-sidebar-form .css-truncate").getElementsByTagName("p");
    var asignee_ids = [];
    Array.prototype.forEach.call(list_node, asignee_node => {
        var asignee_id = asignee_node.querySelector("[data-hovercard-user-id]").getAttribute("data-hovercard-user-id");
        asignee_ids.push(asignee_id);
    });
    console.log(asignee_ids);
    return asignee_ids;
}

gh_cluster.getCurrentReviewerList = function () {
    var list_node = document.querySelector(".sidebar-assignee:nth-child(2) .js-issue-sidebar-form .css-truncate").getElementsByTagName("p");
    var reviewer_ids = [];
    Array.prototype.forEach.call(list_node, reviewer_node => {
        var reviewer_id = reviewer_node.querySelector("[data-hovercard-user-id]").getAttribute("data-hovercard-user-id");
        reviewer_ids.push(reviewer_id);
    });
    console.log(reviewer_ids);
    return reviewer_ids;
}

gh_cluster.sendClustersByStorage = function () {
    var clusters = localStorage.getItem(gh_cluster.storage_key);
    chrome.runtime.sendMessage({ value: { key: "cluster_list", value: clusters } });
}

var element1 = document.querySelector(".sidebar-assignee button");
element1.addEventListener('click', gh_cluster.start, false);

// pull request only
var element2 = document.querySelector(".sidebar-assignee:nth-child(2) button");
if (element2 != null) {
    element2.addEventListener('click', gh_cluster.start, false);
}


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    // TODO shoud I filter by sender?
    console.log("SENDER");
    console.log(sender);
    console.log("add value from popup");
    console.log(message);
    localStorage.setItem(gh_cluster.storage_key, message);
    chrome.runtime.sendMessage({ value: { key: "cluster_list", value: message } });
    return;
});

// start observe for send asignee to background
gh_cluster.sendAsigneeList();
gh_cluster.observeAsigneeList();
gh_cluster.sendClustersByStorage()
