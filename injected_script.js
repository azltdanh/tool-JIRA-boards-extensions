(function (document) {
	var calcSum = (accumulator, currentValue) => parseInt(accumulator) + parseInt(currentValue);
	var getSum = (arrPoints) => { return arrPoints.length > 0 ? arrPoints.map(item => item.point).reduce(calcSum) : 0 };
	var updateBadge = (id, data) => {
		var ghxWrapper = document.querySelector('.ghx-work-wrapper');
		var node = ghxWrapper.querySelector(`#${id}`);
		if (!node) {
			node = document.createElement('div');
			node.id = id;
			node.className = 'aui-badge';
			node.style.marginBottom = '5px';
			// node.style.textTransform = 'uppercase';
			ghxWrapper.prepend(node);
		}
		else {
			node.removeChild(node.childNodes[0]);
		}
		node.appendChild(document.createTextNode(data.join(', ')));

		return node;
	};
	function generateCounters() {
		var sprintReports = [];
		var doneTickets = [];
		var columnPoints = [];
		var headers = document.querySelectorAll('li[data-id]');
		headers.forEach(function (header) {
			var columnId = header.getAttribute('data-id');
			var columnName = header.querySelector('h2').textContent.toLowerCase().replace(/(code |ready for |ready to )/gi, '');
			var ghxLimits = header.querySelector('.ghx-limits');
			var badge = header.querySelector('[data-column-id="' + columnId + '"]');

			if (!badge) {
				badge = document.createElement('span');
				badge.style.float = 'right';
				badge.style.position = 'absolute';
				badge.style.right = '5px';
				badge.className = 'aui-badge';
				badge.setAttribute('data-column-id', columnId);
				while (ghxLimits.firstChild) {
					ghxLimits.removeChild(ghxLimits.firstChild);
				}
				ghxLimits.appendChild(badge);
			} else {
				badge.removeChild(badge.childNodes[0]);
			}

			var column = document.querySelector('li[data-column-id="' + columnId + '"]');

			if (!column) {
				return;
			}

			var totalPoints = 0;

			var tickets = column.querySelectorAll('.ghx-issue');
			tickets.forEach(function (ticket) {
				var estimate = ticket.querySelector('.ghx-estimate');
				var issuePoints = parseInt(estimate.textContent, 10);
				totalPoints += isNaN(issuePoints) ? 0 : issuePoints;

				if (columnName == 'done') {
					var ghxDays = ticket.querySelector('.ghx-days');
					var issueDays = ghxDays ? parseInt(ghxDays.getAttribute('data-tooltip'), 10) : 0;
					var issueKey = ticket.getAttribute('data-issue-key');
					doneTickets.push({ key: issueKey, days: issueDays, point: issuePoints });
				}
			});

			badge.appendChild(document.createTextNode(totalPoints));
			columnPoints.push({ name: columnName, point: totalPoints });
		});

		var daysPass = 10 - parseInt(document.querySelector('.days-left').textContent, 10);

		if (doneTickets.length > 0) updateBadge('ghx-tickets', doneTickets.filter(item => item.days < daysPass).map(item => item.key)).style.textTransform = 'uppercase';

		sprintReports.push(`committed: 55`);
		sprintReports.push(`in-sprint: ${getSum(columnPoints.filter(item => item.name != 'done' && item.name != 'total'))}`);
		sprintReports.push(`done-in-sprint: ${getSum(doneTickets.filter(item => item.days < daysPass && item.point > 0))}`);
		updateBadge('ghx-sprint', sprintReports);

		columnPoints.push({ name: 'total', point: getSum(columnPoints) });
		updateBadge('ghx-status', columnPoints.map(item => `${item.name} ${item.point}`));
	}

	function initBoard() {
		var board = document.getElementById('ghx-pool');
		if (!board) {
			return;
		}
		generateCounters();
		new MutationObserver(generateCounters).observe(board, { childList: true });
	}

	initBoard();

	// On page changed, init again board
	new MutationObserver(initBoard).observe(document.body, { attributes: true });
})(document);