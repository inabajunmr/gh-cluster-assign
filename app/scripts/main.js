function createClusterDom(cluster_name, asignee_ids) {
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
                <span class="js-username">CLUSTER1</span>
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
        cluster.appendChild(createAsigneeInputTag(asignee_id));
    });

    return target;
}

function createAsigneeInputTag(asignee_id) {
    var asignee_html = `<input style="display:none" type="checkbox" name="issue[user_assignee_ids][]">`;
    var tempEl = document.createElement('div');
    tempEl.innerHTML = asignee_html;
    var target = tempEl.firstElementChild;
    target.setAttribute("value", asignee_id);
    return target;
}

function start() {

    console.log("start");
    var find_asignee_list_interbal_id = setInterval(findTargetElement, 1000);

    function findTargetElement() {
        console.log("find start");
        var target = document.querySelector('div[data-filterable-for="assignee-filter-field"] div');
        if (target != null) {
            clearInterval(find_asignee_list_interbal_id);
            var target2 = document.querySelector('div[data-filterable-for="assignee-filter-field"]');
            var asignees = ["10000393", "16970553"];
            target2.insertBefore(createClusterDom("test", asignees), target2.firstChild);
            console.log("find end")
            kick = true;
        }
    }
}

var element = document.querySelector(".sidebar-assignee button");
element.addEventListener('click', start, false);
