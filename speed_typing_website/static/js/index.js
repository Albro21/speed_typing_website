if (chartData) {
    const ctx = document.getElementById('history').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [
                {
                    label: 'WPM',
                    data: chartData.wpm_data,
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.3)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'yWPM'
                },
                {
                    label: 'Accuracy (%)',
                    data: chartData.accuracy_data,
                    borderColor: 'rgb(190, 50, 50)',
                    fill: false,
                    tension: 0.4,
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