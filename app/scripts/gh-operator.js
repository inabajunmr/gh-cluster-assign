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
            <img src="data:image/png;base64,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sGzZMnzwwQcYPXq0EIIPKDH+wx/+gOOOOw61a9dG1apmA0Jt3LgRixYtwt///ncMHjwYM2bMCDuUST7PcGIvm1TANAHwiu/nrqbv6tOnD84//3wccsgh2GYb09CUH7ZVq1Z5X6devXrhu+++CzWmJKy//vWv3tcyIytXrsQ555yD9esTuWVatD9DhgzBGWecgX322adoWZMFSAbjx4/HDTfcYLLauOpi2jGeqBkbVNNveV8APeNCw1Q7/DKce+65qF69uqkqA9ezefNmvPvuu+jatSu+/PLLwM9lF3zllVe8LUq2/PTTT2jUqBG++OILrTqjeIhENXbsWJx00knYbrvtomgicJ2bNm3Cq6++issvv9xakszTmX4AegXuaJGCJgmgAYDZAHY0pVzU9fTo0cP7Au+xxx5RN1W0fu5fJ02ahPbt2yu9kFyxPPfcc5Um1L///W80btxYm1SKKqxYgF/8yy67LPGJX1FtbhGefvppXHfddYo9Sqw4sw01AjDXhAYmCYBBDVqaUCrqOvgl4vK7WbNmUTelXD+NWLfccgseffTRQM8uXrwY++9fOWHyjz/+6K0AdFcVgRoPUKhJkyaezeOAAw4IUDq5IsSJq6ik8QqIgDGDoCkCcObMv1WrVnjxxRdRo0aNgFgnU4xL5Y4defybX4YNG+Z9VXOJDQRw3333oWfPntZ99fMhytXArbfeiocffjiZQVdr1YhB0AQBOGP4u/POO8GfpPefQcd55syZOOYYeoJWFq5epkyZgipVcudNTZoASGAdOnQI2lVrynErNnToUHTp0sUanfIoYsQgaIIAnDD8cZ/XuXPnyK37pt+aTz75BEcccUSlaufNm+edVuSTJAngvffes3J7pTI2r7/+Otq0sT5qXWiDYFgCcMLwN2rUKO94z1X59NNP0bBhw63qP/7447jqqqsKdicpApg9e3Y5XV3FnHqTyI4//nibuxDaIBiWAKw3/PGIj19+14UORE2bNvUck+bMmVPUEzEJApg1axaOOuoo16Eup//EiRNBu5HFEsogGIYAGNJ7ssXAeGfr/FoGdSW1uS/Uje7EJIB8doFs/eMmANdXWYXGfsCAAbY7DvH0bYrO+xuGANjgiTqNxvHMr371K88f3KRzz7p168BjtyVLlnj+5jQYBRUePe67777ecdjee+8duS0iTgLgSQTP+U0aV5cv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" alt="" size="20" class="avatar avatar-small mr-1 js-avatar">
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
