import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { RevenuePoint } from '../services/analyticsService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SalesChartProps {
  data: RevenuePoint[];
  title?: string;
  height?: number;
}

const SalesChart: React.FC<SalesChartProps> = ({ 
  data, 
  title = 'Revenue Trend', 
  height = 300 
}) => {
  // Prepare chart data
  const chartData = {
    labels: data.map(point => {
      const date = new Date(point.date);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }),
    datasets: [
      {
        label: 'Daily Revenue',
        data: data.map(point => point.amount),
        borderColor: '#8B4513',
        backgroundColor: 'rgba(139, 69, 19, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#8B4513',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#4A4A4A',
          font: {
            family: "'Playfair Display', serif",
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: title,
        color: '#8B4513',
        font: {
          family: "'Playfair Display', serif",
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        backgroundColor: 'rgba(139, 69, 19, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#D4A574',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `Revenue: $${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(139, 69, 19, 0.1)'
        },
        ticks: {
          color: '#4A4A4A',
          callback: function(value: any) {
            return `$${value}`;
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(139, 69, 19, 0.1)'
        },
        ticks: {
          color: '#4A4A4A'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  };

  return (
    <div className="bg-cream rounded-xl p-6 shadow-md border border-secondary-tea">
      <div style={{ height: `${height}px` }}>
        <Line data={chartData} options={options} />
      </div>
      <div className="mt-4 text-center">
        <p className="text-dark-tea text-sm">
          Total Period Revenue: <span className="font-semibold text-primary-tea">
            ${data.reduce((sum, point) => sum + point.amount, 0).toFixed(2)}
          </span>
        </p>
      </div>
    </div>
  );
};

export default SalesChart;