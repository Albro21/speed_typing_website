if (chartData1m) {
    const ctx1m = document.getElementById('1m-history').getContext('2d');
    new Chart(ctx1m, {
        type: 'line',
        data: {
            labels: chartData1m.labels,
            datasets: [
                {
                    label: 'WPM',
                    data: chartData1m.wpm_data,
                    borderColor: 'rgb(54, 162, 235)',
                    fill: false,
                    yAxisID: 'yWPM'
                },
                {
                    label: 'Accuracy (%)',
                    data: chartData1m.accuracy_data,
                    borderColor: 'rgb(190, 50, 50)',
                    fill: false,
                    yAxisID: 'yAccuracy'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    ticks: {
                        color: 'white',
                    },
                    grid: {
                        color: '#555',
                    }
                },
                yWPM: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Words per Minute',
                        color: 'white',
                    },
                    ticks: {
                        color: 'white',
                        beginAtZero: true,
                    },
                    grid: {
                        color: '#555',
                    }
                },
                yAccuracy: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Accuracy (%)',
                        color: 'white',
                    },
                    ticks: {
                        color: 'white',
                        min: 0,
                        max: 100,
                        beginAtZero: true,
                    },
                    grid: {
                        color: '#555',
                        drawOnChartArea: false,
                    },
                    min: 0,
                    max: 100
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: '1m Test History',
                    color: 'white',
                    font: {
                        size: 30,
                        weight: 'bold'
                    },
                    padding: {
                        bottom: 10
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                legend: {
                    position: 'top',
                    labels: {
                        color: 'white'
                    }
                }
            }
        }
    });
}

if (chartData3m) {
    const ctx3m = document.getElementById('3m-history').getContext('2d');
    new Chart(ctx3m, {
        type: 'line',
        data: {
            labels: chartData3m.labels,
            datasets: [
                {
                    label: 'WPM',
                    data: chartData3m.wpm_data,
                    borderColor: 'rgb(54, 162, 235)',
                    fill: false,
                    yAxisID: 'yWPM'
                },
                {
                    label: 'Accuracy (%)',
                    data: chartData3m.accuracy_data,
                    borderColor: 'rgb(190, 50, 50)',
                    fill: false,
                    yAxisID: 'yAccuracy'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    ticks: {
                        color: 'white',
                    },
                    grid: {
                        color: '#555',
                    }
                },
                yWPM: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Words per Minute',
                        color: 'white',
                    },
                    ticks: {
                        color: 'white',
                        beginAtZero: true,
                    },
                    grid: {
                        color: '#555',
                    }
                },
                yAccuracy: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Accuracy (%)',
                        color: 'white',
                    },
                    ticks: {
                        color: 'white',
                        min: 0,
                        max: 100,
                        beginAtZero: true,
                    },
                    grid: {
                        color: '#555',
                        drawOnChartArea: false,
                    },
                    min: 0,
                    max: 100
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: '3m Test History',
                    color: 'white',
                    font: {
                        size: 30,
                        weight: 'bold'
                    },
                    padding: {
                        bottom: 10
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                legend: {
                    position: 'top',
                    labels: {
                        color: 'white'
                    }
                }
            }
        }
    });
}

if (chartData5m) {
    const ctx5m = document.getElementById('5m-history').getContext('2d');
    new Chart(ctx5m, {
        type: 'line',
        data: {
            labels: chartData5m.labels,
            datasets: [
                {
                    label: 'WPM',
                    data: chartData5m.wpm_data,
                    borderColor: 'rgb(54, 162, 235)',
                    fill: false,
                    yAxisID: 'yWPM'
                },
                {
                    label: 'Accuracy (%)',
                    data: chartData5m.accuracy_data,
                    borderColor: 'rgb(190, 50, 50)',
                    fill: false,
                    yAxisID: 'yAccuracy'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    ticks: {
                        color: 'white',
                    },
                    grid: {
                        color: '#555',
                    }
                },
                yWPM: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Words per Minute',
                        color: 'white',
                    },
                    ticks: {
                        color: 'white',
                        beginAtZero: true,
                    },
                    grid: {
                        color: '#555',
                    }
                },
                yAccuracy: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Accuracy (%)',
                        color: 'white',
                    },
                    ticks: {
                        color: 'white',
                        min: 0,
                        max: 100,
                        beginAtZero: true,
                    },
                    grid: {
                        color: '#555',
                        drawOnChartArea: false,
                    },
                    min: 0,
                    max: 100
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: '5m Test History',
                    color: 'white',
                    font: {
                        size: 30,
                        weight: 'bold'
                    },
                    padding: {
                        bottom: 10
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                legend: {
                    position: 'top',
                    labels: {
                        color: 'white'
                    }
                }
            }
        }
    });
}

