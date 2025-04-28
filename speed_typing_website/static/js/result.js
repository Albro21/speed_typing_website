const speedChartCTX = document.getElementById('speedChart').getContext('2d');

const mistakeLabels = Object.keys(mistypedLetters);
const mistakeData = Object.values(mistypedLetters);
const mistakesChartCTX = document.getElementById('mistakesChart').getContext('2d');

const delayLabels = Object.keys(letterTimings);
const delayData = Object.values(letterTimings);
const delayChartCTX = document.getElementById('delayChart').getContext('2d');

const chart = new Chart(speedChartCTX, {
    type: 'line',
    data: {
        labels: speedCurve.map((_, i) => i + 1),
        datasets: [{
            label: 'Speed over time (WPM)',
            data: speedCurve,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.3,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 15,
        }]
    },
    options: {
        responsive: true,
        plugins: {
            tooltip: {
                enabled: true,
                callbacks: {
                    title: (context) => {
                        const time = context[0].label;
                        return `Time: ${time}s`;
                    },
                    label: (context) => `WPM: ${context.parsed.y}`
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time (seconds)'
                },
                ticks: {
                    callback: function(value) {
                        return value + 's';
                    }
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'WPM'
                },
                beginAtZero: true
            }
        }
    }
});

const mistakesChart = new Chart(mistakesChartCTX, {
    type: 'bar',
    data: {
        labels: mistakeLabels,
        datasets: [{
            label: 'Mistakes per Letter',
            data: mistakeData,
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Mistake Count'
                },
                grid: {
                    color: '#444'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Letter'
                },
                grid: {
                    display: false
                }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    title: context => {
                        const letter = context[0].label;
                        return `Letter "${letter}"`;
                    },
                    label: context => `Mistakes: ${context.parsed.y}`
                }
            }
        }
    }
});

const delayChart = new Chart(delayChartCTX, {
    type: 'bar',
    data: {
        labels: delayLabels,
        datasets: [{
            label: 'Delay per Letter',
            data: delayData,
            backgroundColor: 'rgba(0, 123, 255, 0.6)',
            borderColor: 'rgb(0, 123, 255)',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Delay duration (ms)'
                },
                ticks: {
                    callback: function(value) {
                        return value + ' ms';
                    }
                },
                grid: {
                    color: '#444'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Letter'
                },
                grid: {
                    display: false
                }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    title: context => {
                        const letter = context[0].label;
                        return `Letter "${letter}"`;
                    },
                    label: context => `Delay: ${context.parsed.y}ms`
                }
            }
        }
    }
});
