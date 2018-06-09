`use strict`;
var gh_cluster = {};

// Create node for one cluster as asignee user.
gh_cluster.createClusterDom = function (cluster_name, asignee_ids) {
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
    console.log(asignee_ids);

    asignee_ids.forEach(asignee_id => {
        cluster.appendChild(gh_cluster.createAsigneeInputTag(asignee_id));
    });

    var name_node = document.createTextNode(cluster_name);
    var cluster_name_node = target.getElementsByClassName("js-username")[0];
    cluster_name_node.appendChild(name_node);

    return target;
}

// create node for input new asignee.(means one user)
gh_cluster.createAsigneeInputTag = function (asignee_id) {
    var asignee_html = `<input style="display:none" type="checkbox" name="issue[user_assignee_ids][]">`;
    var tempEl = document.createElement('div');
    tempEl.innerHTML = asignee_html;
    var target = tempEl.firstElementChild;
    target.setAttribute("value", asignee_id);
    return target;
}

gh_cluster.start = function () {
    console.log("start");
    // wait for loading asignee list dom
    var find_asignee_list_interbal_id = setInterval(findTargetElement, 1000);

    function findTargetElement() {
        console.log("find start");
        var asignee_list_asignee_node = document.querySelector('div[data-filterable-for="assignee-filter-field"] div');
        if (asignee_list_asignee_node != null) {
            clearInterval(find_asignee_list_interbal_id);
            var asignee_list_node = document.querySelector('div[data-filterable-for="assignee-filter-field"]');
            var asignees = ["10000393", "16970553"];
            asignee_list_node.insertBefore(gh_cluster.createClusterDom("test", asignees), asignee_list_node.firstChild);
            console.log("find end")
        }
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
    chrome.runtime.sendMessage({ value: current_asignee_list });
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

var element = document.querySelector(".sidebar-assignee button");
element.addEventListener('click', gh_cluster.start, false);

// start observe for send asignee to background
gh_cluster.sendAsigneeList();
gh_cluster.observeAsigneeList();
