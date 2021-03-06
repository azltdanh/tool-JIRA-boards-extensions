(function(document) {
  const calcSum = (accumulator, currentValue) =>
    parseInt(accumulator) + parseInt(currentValue);

  const getSum = arrPoints => {
    return arrPoints.length > 0
      ? arrPoints.map(item => item.point).reduce(calcSum)
      : 0;
  };

  const updateBadge = (id, data) => {
    var ghxWrapper = document.querySelector('.ghx-work-wrapper');
    var node = ghxWrapper.querySelector(`#${id}`);
    if (!node) {
      node = document.createElement('div');
      node.id = id;
      node.className = 'aui-badge';
      node.style.marginBottom = '5px';
      // node.style.textTransform = 'uppercase';
      ghxWrapper.prepend(node);
    } else {
      node.removeChild(node.childNodes[0]);
    }
    node.appendChild(document.createTextNode(data.join(', ')));

    return node;
  };

  const debug = false;

  // Backlog
  const initBacklogCounter = () => {
    const backlog = document.querySelector('.ghx-backlog-container');
    const backlogId = backlog.getAttribute('data-sprint-id');
    if (debug) console.log('backlogId', backlogId);
    if (backlog) {
      const backlogBadgeGroup = backlog.querySelector('.ghx-badge-group');
      // const backlogStatTotal = backlog.querySelector('.ghx-stat-total');
      let backlogBadge = backlogBadgeGroup.querySelector(
        '.aui-badge[data-sprint-id="' + backlogId + '"]'
      );
      if (!backlogBadge) {
        backlogBadge = document.createElement('span');
        backlogBadge.className = 'aui-badge ghx-label-2';
        backlogBadge.setAttribute('data-sprint-id', backlogId);

        backlogBadgeGroup.appendChild(backlogBadge);
      } else {
        backlogBadge.removeChild(backlogBadge.childNodes[0]);
      }

      const issues = backlog
        .querySelector('.ghx-issues')
        .querySelectorAll(
          '.ghx-backlog-card:not(.ghx-filtered) .aui-badge.ghx-statistic-badge'
        );
      if (debug) console.log('stories', backlogId, issues);
      const points = Array.from(issues)
        .map(item => parseInt(item.textContent) || 0)
        .reduce(calcSum);
      backlogBadge.appendChild(document.createTextNode(points));
    }
  };

  // Active sprints
  const initActiveSprintCounter = () => {
    var sprintLength = localStorage.getItem('sprint_length') || 20;
    var daysLeft = parseInt(
      document.querySelector('.days-left').textContent,
      10
    );
    var daysPass = sprintLength - daysLeft;
    if (debug)
      console.log(
        'sprintLength',
        sprintLength,
        'daysLeft',
        daysLeft,
        'daysPass',
        daysPass
      );

    var sprintReports = [];
    var sprintTickets = [];
    var columnPoints = [];

    const headers = document.querySelectorAll('li[data-id]');
    headers.forEach(function(header) {
      var columnId = header.getAttribute('data-id');
      var columnName = header
        .querySelector('h2')
        .textContent.toLowerCase()
        .replace(/(ready for |\/deployment)/gi, '');
      var columnHeader = header.querySelector('.ghx-column-header-flex');
      var badge = header.querySelector('[data-column-id="' + columnId + '"]');

      if (!badge) {
        badge = document.createElement('span');
        badge.style.marginLeft = 'auto';
        badge.style.position = 'absolute';
        // badge.style.top = '4px';
        badge.style.right = '4px';
        badge.className = 'aui-badge';
        badge.setAttribute('data-column-id', columnId);
        // while (columnHeader.children.length > 1) {
        //   columnHeader.removeChild(columnHeader.firstChild);
        // }
        columnHeader.appendChild(badge);
      } else {
        badge.removeChild(badge.childNodes[0]);
      }

      // var swimLanes = document.querySelectorAll('.ghx-swimlane');
      // if (debug) console.log('swimLanes', swimLanes);

      var columns = document.querySelectorAll(
        'li[data-column-id="' + columnId + '"]'
      );
      if (debug) console.log('column', columnId, columns);

      if (!columns) {
        return;
      }

      var totalPoints = 0;

      var tickets = [];
      columns.forEach(function(column) {
        const issues = column.querySelectorAll('.ghx-issue');
        if (debug) console.log(issues);
        tickets = tickets.concat(Array.from(issues));
      });

      if (debug) console.log('tickets', columnId, tickets);

      tickets.forEach(function(ticket) {
        if (debug) console.log('ticket', ticket);
        var estimate = ticket.querySelector('.ghx-estimate');
        var issuePoints = parseInt(estimate.textContent);
        totalPoints += isNaN(issuePoints) ? 0 : issuePoints;

        var ghxDays = ticket.querySelector('.ghx-days');
        var issueDays = ghxDays
          ? parseInt(ghxDays.getAttribute('data-tooltip'))
          : 0;
        var issueKey = ticket.getAttribute('data-issue-key');
        sprintTickets.push({
          key: issueKey,
          days: issueDays,
          point: issuePoints,
          status: columnName
        });
      });

      badge.appendChild(document.createTextNode(totalPoints));
      columnPoints.push({ name: columnName, point: totalPoints });
    });

    if (debug) console.log('sprintTickets', sprintTickets);

    var deployTickets = sprintTickets.filter(
      item => item.status == 'deploy' && item.days <= daysPass
    );
    if (debug) console.log('deployTickets', deployTickets);
    if (deployTickets.length > 0) {
      updateBadge(
        'ghx-tickets',
        deployTickets.map(item => item.key)
      ).style.textTransform = 'uppercase';
    }

    var doneTickets = sprintTickets.filter(
      item => item.status == 'done' && item.days <= daysPass
    );
    if (debug) console.log('doneTickets', doneTickets);
    if (doneTickets.length > 0) {
      updateBadge(
        'ghx-tickets',
        doneTickets.map(item => item.key)
      ).style.textTransform = 'uppercase';
    }

    sprintReports.push(`total: ${getSum(columnPoints)}`);
    // columnPoints.push({ name: 'total', point: getSum(columnPoints) });
    sprintReports.push(
      `commit: ${localStorage.getItem('sprint_committed') || 20}`
    );
    sprintReports.push(
      `in-sprint: ${getSum(
        columnPoints.filter(
          item =>
            item.name != 'deploy' && item.name != 'done' && item.name != 'total'
        )
      )}`
    );
    sprintReports.push(
      `deploy-in-sprint: ${getSum(
        deployTickets.filter(item => item.point > 0)
      )}`
    );
    sprintReports.push(
      `done-in-sprint: ${getSum(doneTickets.filter(item => item.point > 0))}`
    );
    updateBadge('ghx-sprint', sprintReports);

    updateBadge(
      'ghx-status',
      columnPoints.map(item => `${item.name} ${item.point}`)
    );
  };

  // Issue Navigator
  const initIssueNavigatorCounter = () => {
    const issueNavigator = document.getElementById(
      'global-issue-navigator-container'
    );
    const spSpan = document.evaluate(
      '//span[text()="Story Points"]',
      issueNavigator,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
    const spHeader = spSpan.closest('th');

    if (spHeader) {
      let spBadge = spHeader.querySelector('.aui-badge');
      if (!spBadge) {
        spBadge = document.createElement('span');
        spBadge.className = 'aui-badge ghx-label-2';

        spHeader.appendChild(spBadge);
      } else {
        spBadge.removeChild(spBadge.childNodes[0]);
      }

      const issues = document
        .getElementById('issuetable')
        .querySelectorAll(`.${spHeader.getAttribute('data-id')}`);
      if (debug) console.log('stories', issues);
      const points = Array.from(issues)
        .map(item => parseInt(item.textContent) || 0)
        .reduce(calcSum);
      spBadge.appendChild(document.createTextNode(points));
    }
  };

  function initBoard() {
    const backlog = document.getElementById('ghx-backlog');
    if (backlog) {
      console.log('initBacklogCounter');
      initBacklogCounter();
      new MutationObserver(initBacklogCounter).observe(backlog, {
        attributes: true,
        childList: true
      });
    }

    const pool = document.getElementById('ghx-pool');
    const days = document.querySelector('.days-left');
    if (pool && days) {
      console.log('initActiveSprintCounter');
      initActiveSprintCounter();
      new MutationObserver(initActiveSprintCounter).observe(pool, {
        childList: true
      });
    }

    const issueNavigator = document.getElementById(
      'global-issue-navigator-container'
    );
    if (issueNavigator) {
      console.log('initIssueNavigatorCounter');
      initIssueNavigatorCounter();
      new MutationObserver(initIssueNavigatorCounter).observe(issueNavigator, {
        childList: true
      });
    }
  }

  initBoard();

  // On page changed, init again board
  new MutationObserver(initBoard).observe(document.body, { attributes: true });
})(document);
