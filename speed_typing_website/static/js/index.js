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
                    tension: 0.4,
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
                    tension: 0.4,
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

MistakesChart.register(ChartDataLabels);