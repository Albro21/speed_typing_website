const ctx = document.getElementById('1m-history').getContext('2d');

const historyChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [
            {
                label: 'WPM',
                data: wpmData,
                borderColor: 'rgb(54, 162, 235)',
                fill: false,
                yAxisID: 'yWPM'
            },
            {
                label: 'Accuracy (%)',
                data: accuracyData,
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
