`use strict`;

// debug mode
// console.log = function(){}

var gh_operator = {};

// create node for input new asignee.(means one user)
gh_operator.createAssigneeInputTag = function (target_id) {
    var asignee_html = `<input style="display:none" type="checkbox" name="issue[user_assignee_ids][]">`;
    var tempEl = document.createElement('div');
    tempEl.innerHTML = asignee_html;
    var target = tempEl.firstElementChild;
    target.setAttribute("value", target_id);
    return target;
}

// create node for input new reviewer.(means one user)
gh_operator.createReviwerInputTag = function (target_id) {
    var reviwer_html = `<input style="display:none" type="checkbox" name="reviewer_user_ids[]">`;
    var tempEl = document.createElement('div');
    tempEl.innerHTML = reviwer_html;
    var target = tempEl.firstElementChild;
    target.setAttribute("value", target_id);
    return target;
}

// find element in side bar by button text(ex. 'Reviewer'/ 'Assignee')
gh_operator.findNodeByTextNodeInSideBar = function (text) {
    for (step = 1; step < 5; step++) {
        var selector = `.sidebar-assignee:nth-child(${step}) button`;
        var element = document.querySelector(selector);
        if (element == null) {
            continue;
        }
        if (element.textContent.trim() == text) {
            return document.querySelector(`.sidebar-assignee:nth-child(${step})`);
        }
    }
    return null;
}

// find button element in side bar by text
gh_operator.findButtonByTextNodeInSideBar = function (text) {
    for (step = 1; step < 5; step++) {
        var selector = `.sidebar-assignee:nth-child(${step}) button`;
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

// Create node for one cluster as asignee user.
gh_operator.createClusterDom = function (cluster_name, target_ids, kind) {
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
            cluster.appendChild(gh_operator.createAssigneeInputTag(target_ids));
        });
    }

    if (kind == "reviewer") {
        target_ids.forEach(target_ids => {
            cluster.appendChild(gh_operator.createReviwerInputTag(target_ids));
        });
    }

    var name_node = document.createTextNode(cluster_name);
    var cluster_name_node = target.getElementsByClassName("js-username")[0];
    cluster_name_node.appendChild(name_node);

    return target;
}
