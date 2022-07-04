import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DoughnutChart({ labels, data } = {}) {
    const chartData = {
        labels: labels,
        datasets: [
            {
                data: data,
                backgroundColor: labels.map(() => {
                    const r = Math.floor(Math.random() * 255);
                    const g = Math.floor(Math.random() * 255);
                    const b = Math.floor(Math.random() * 255);
                    return `rgb(${r},${g},${b})`;
                })
            }
        ]
    }

    return (
        <Doughnut data={chartData} width='200' height='200' />
    )
}