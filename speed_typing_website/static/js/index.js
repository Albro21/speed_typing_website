if (historyChartData) {
    const historyctx = document.getElementById('history').getContext('2d');
    const HistoryChart = new Chart(historyctx, {
        type: 'line',
        data: {
            labels: historyChartData.labels,
            datasets: [
                {
                    label: 'Accuracy (%)',
                    data: historyChartData.accuracy_data,
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
                    data: historyChartData.wpm_data,
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
                    labelColor: function(context) {
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
