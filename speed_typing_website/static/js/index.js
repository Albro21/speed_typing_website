if (mistakesChartData) {
    const mistakesctx = document.getElementById('mistakes').getContext('2d');
    const MistakesChart = new Chart(mistakesctx, {
        type: 'pie',
        data: {
            labels: mistakesChartData.labels,
            datasets: [{
                data: mistakesChartData.data,
                backgroundColor: [
                    '#FFFFFF',
                    '#E6E6E6',
                    '#CCCCCC',
                    '#B3B3B3',
                    '#999999',
                    '#808080',
                    '#666666',
                    '#4D4D4D',
                    '#3A3A3A',
                    '#333333'
                ],
                borderColor: '#161616',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: true,
                    text: 'Mistakes by Letter'
                },
                tooltip: {
                    callbacks: {
                        title: function (context) {
                            const label = context[0].label;
                            return label === ' ' ? '" "' : label;
                        }
                    }
                },
                datalabels: {
                    color: '#222',
                    formatter: function (value, context) {
                        return context.chart.data.labels[context.dataIndex];
                    },
                    font: {
                        weight: 'bold',
                        size: 14
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

const scrollContainer = document.querySelector('.card.overflow-auto');
scrollContainer.addEventListener('wheel', (evt) => {
    if (evt.deltaY === 0) return;
    evt.preventDefault();
    scrollContainer.scrollLeft += evt.deltaY;
}, { passive: false });

document.addEventListener('DOMContentLoaded', () => {
    const popoverTrigger = document.getElementById('dailyGoalPopover');
    const popoverContent = document.getElementById('popover-daily-goal').innerHTML;

    const popover = new bootstrap.Popover(popoverTrigger, {
        content: popoverContent,
        html: true,
        placement: 'right',
        sanitize: false,
        trigger: 'click',
    });

    popoverTrigger.addEventListener('shown.bs.popover', () => {
        const popoverId = popoverTrigger.getAttribute('aria-describedby');
        const popoverElement = document.getElementById(popoverId);

        if (!popoverElement) {
            return;
        }

        const dailyGoalForm = popoverElement.querySelector('#daily-goal-form');

        if (!dailyGoalForm) {
            return;
        }

        const dailyGoalSelect = dailyGoalForm.querySelector('select[name="daily_goal"]');

        if (!dailyGoalSelect) {
            return;
        }

        dailyGoalSelect.addEventListener('change', async (e) => {
            const formData = new FormData(dailyGoalForm);
            const formObj = Object.fromEntries(formData.entries());

            const data = await sendRequest('/users/daily-goal/edit/', 'PATCH', JSON.stringify(formObj));

            if (data.success) {
                queueToast('Daily goal updated', 'success');
                window.location.reload();
            } else {
                showToast(data.error || 'Failed to update daily goal', 'danger');
            }
        });
    });
});

let HistoryChart = null;

document.addEventListener('DOMContentLoaded', () => {
	const toggle = document.getElementById('chart-period-toggle');
	const icon = document.getElementById('chart-icon');
	const text = document.getElementById('chart-period');

	const periods = [
		{ label: 'Daily', icon: 'bi-calendar-event' },
		{ label: 'Weekly', icon: 'bi-calendar-week' },
		{ label: 'Monthly', icon: 'bi-calendar3' },
		{ label: 'All time', icon: 'bi-calendar3-fill' }
	];

	let currentIndex = periods.findIndex(p => p.label.toLowerCase() === 'weekly');

	// Load from localStorage if available
	const savedPeriod = localStorage.getItem('chartPeriod');
	if (savedPeriod) {
		const foundIndex = periods.findIndex(p => p.label.toLowerCase() === savedPeriod);
		if (foundIndex !== -1) {
			currentIndex = foundIndex;
		}
	}

	// Initialize chart on load
	const { label, icon: iconClass } = periods[currentIndex];
	icon.className = `bi ${iconClass} fs-5`;
	text.textContent = label;

	if (historyChartData) {
		updateChartForPeriod(label.toLowerCase());
	}

	// Toggle event
	toggle.addEventListener('click', () => {
		currentIndex = (currentIndex + 1) % periods.length;
		const { label, icon: iconClass } = periods[currentIndex];

		icon.className = `bi ${iconClass} fs-5`;
		text.textContent = label;

		localStorage.setItem('chartPeriod', label.toLowerCase());
		updateChartForPeriod(label.toLowerCase());
	});
});

function updateChartForPeriod(period) {
	const now = new Date();
	let startDate;

	switch (period) {
		case 'daily':
			startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			break;
		case 'weekly':
			startDate = new Date(now);
			startDate.setDate(now.getDate() - 7);
			break;
		case 'monthly':
			startDate = new Date(now);
			startDate.setMonth(now.getMonth() - 1);
			break;
		case 'all time':
			startDate = null;
			break;
	}

	const filteredLabels = [];
	const filteredWPM = [];
	const filteredAccuracy = [];

	for (let i = 0; i < historyChartData.labels.length; i++) {
		const labelISO = historyChartData.labels[i];
		const labelDate = new Date(labelISO);

		if (!startDate || labelDate >= startDate) {
			filteredLabels.push(formatLabel(labelDate));
			filteredWPM.push(historyChartData.wpm_data[i]);
			filteredAccuracy.push(historyChartData.accuracy_data[i]);
		}
	}

	const ctx = document.getElementById('history').getContext('2d');

	if (HistoryChart) {
		HistoryChart.destroy();
	}

	HistoryChart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: filteredLabels,
			datasets: [
				{
					label: 'Accuracy (%)',
					data: filteredAccuracy,
					borderColor: 'rgb(190, 50, 50)',
					borderDash: [5, 5],
					fill: false,
					tension: 0.2,
					yAxisID: 'yAccuracy',
					pointRadius: 0,
					pointHoverRadius: 0,
					clip: false
				},
				{
					label: 'WPM',
					data: filteredWPM,
					borderColor: '#FFFFFF',
					backgroundColor: '#212121',
					fill: true,
					tension: 0.2,
					yAxisID: 'yWPM',
					pointRadius: 0,
					pointHoverRadius: 0,
					clip: false
				}
			]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			layout: {
				padding: 0
			},
			scales: {
				yAccuracy: {
					type: 'linear',
					position: 'right',
					display: true,
					min: 0,
					max: 105,
					grid: {
						display: false,
						drawTicks: false
					},
					ticks: {
						display: false
					},
					title: {
						display: false
					}
				},
				x: {
					display: false,
					grid: { display: false },
					offset: false
				},
				yWPM: {
					display: false,
					grid: { display: false },
					offset: false,
					min: 0
				}
			},
			plugins: {
				tooltip: {
					mode: 'index',
					intersect: false,
					callbacks: {
						labelColor: function (context) {
							if (context.dataset.label === 'Accuracy (%)') {
								return {
									borderColor: 'rgb(190, 50, 50)',
									backgroundColor: 'rgb(190, 50, 50)'
								};
							}
							return {
								borderColor: '#FFFFFF',
								backgroundColor: '#FFFFFF'
							};
						}
					}
				},
				legend: {
					display: true,
					labels: {
						color: 'white'
					}
				}
			}
		}
	});
}

function formatLabel(date) {
	return date.toLocaleString('en-GB', {
		day: '2-digit',
		month: '2-digit',
		year: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	});
}

