var asignee_html = `
<div class="select-menu-item js-navigation-item" role="menuitem">
    <svg class="octicon octicon-check select-menu-item-icon" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true">
        <path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"></path>
    </svg>
    <input style="display:none" type="checkbox" value="10000393" name="issue[user_assignee_ids][]">
    <input style="display:none" type="checkbox" value="16970553" name="issue[user_assignee_ids][]">
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

function start() {

    console.log("start");
    var find_asignee_list_interbal_id = setInterval(findTargetElement, 1000);

    function findTargetElement() {
        console.log("find start");
        var target = document.querySelector('div[data-filterable-for="assignee-filter-field"] div');
        if (target != null) {
            clearInterval(find_asignee_list_interbal_id);
            var target2 = document.querySelector('div[data-filterable-for="assignee-filter-field"]');
            const tempEl = document.createElement('div');
            tempEl.innerHTML = asignee_html;
            target2.insertBefore(tempEl.firstElementChild, target2.firstChild);
            console.log("find end")
            kick = true;
        }
    }
}

var element = document.querySelector(".sidebar-assignee button");
element.addEventListener('click', start, false);
