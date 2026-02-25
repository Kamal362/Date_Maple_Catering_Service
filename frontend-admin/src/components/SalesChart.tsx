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
import { useTheme } from '../context/ThemeContext';

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
  title = 'Monthly Revenue Trend', 
  height = 300 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // Prepare chart data
  const chartData = {
    labels: data.map(point => {
      const date = new Date(point.date);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        year: '2-digit' 
      });
    }),
    datasets: [
      {
        label: 'Monthly Revenue',
        data: data.map(point => point.amount),
        borderColor: isDark ? '#4ade80' : '#D2691E',
        backgroundColor: isDark ? 'rgba(74, 222, 128, 0.15)' : 'rgba(210, 105, 30, 0.15)',
        borderWidth: 2,
        pointBackgroundColor: isDark ? '#4ade80' : '#D2691E',
        pointBorderColor: isDark ? '#1f2937' : '#FFF8E1',
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
          color: isDark ? '#9ca3af' : '#5D4037',
          font: {
            family: "'Playfair Display', serif",
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: title,
        color: isDark ? '#4ade80' : '#8B4513',
        font: {
          family: "'Playfair Display', serif",
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(74, 222, 128, 0.9)' : 'rgba(139, 69, 19, 0.9)',
        titleColor: isDark ? '#1f2937' : '#FFF8E1',
        bodyColor: isDark ? '#1f2937' : '#FFF8E1',
        borderColor: isDark ? '#4ade80' : '#D2B48C',
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
          color: isDark ? 'rgba(156, 163, 175, 0.2)' : 'rgba(210, 180, 140, 0.3)'
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#5D4037',
          callback: function(value: any) {
            return `$${value}`;
          }
        }
      },
      x: {
        grid: {
          color: isDark ? 'rgba(156, 163, 175, 0.2)' : 'rgba(210, 180, 140, 0.3)'
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#5D4037'
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
          Total Annual Revenue: <span className="font-semibold text-primary-tea">
            ${data.reduce((sum, point) => sum + point.amount, 0).toFixed(2)}
          </span>
        </p>
        <p className="text-secondary-tea text-xs mt-1">
          {data.length} months of data
        </p>
      </div>
    </div>
  );
};

export default SalesChart;