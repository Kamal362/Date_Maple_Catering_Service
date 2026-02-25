import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { CategorySales } from '../services/analyticsService';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryChartProps {
  data: CategorySales[];
  title?: string;
  height?: number;
}

const CategoryChart: React.FC<CategoryChartProps> = ({ 
  data, 
  title = 'Sales by Category', 
  height = 300 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // Prepare chart data
  const chartData = {
    labels: data.map(item => item.category),
    datasets: [
      {
        data: data.map(item => item.sales),
        backgroundColor: isDark ? [
          '#4ade80', // Green
          '#22c55e',
          '#16a34a',
          '#86efac',
          '#bbf7d0',
        ] : [
          '#D2691E', // Chocolate - lighter
          '#CD853F', // Peru
          '#DEB887', // BurlyWood
          '#F5DEB3', // Wheat
          '#D2B48C', // Tan
        ],
        borderColor: isDark ? [
          '#1f2937',
          '#1f2937',
          '#1f2937',
          '#1f2937',
          '#1f2937',
        ] : [
          '#FFF8E1',
          '#FFF8E1',
          '#FFF8E1',
          '#FFF8E1',
          '#FFF8E1',
        ],
        borderWidth: 2,
        hoverOffset: 15
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: isDark ? '#9ca3af' : '#5D4037',
          font: {
            family: "'Playfair Display', serif",
            size: 12
          },
          padding: 20
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
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(74, 222, 128, 0.9)' : 'rgba(139, 69, 19, 0.9)',
        titleColor: isDark ? '#1f2937' : '#FFF8E1',
        bodyColor: isDark ? '#1f2937' : '#FFF8E1',
        borderColor: isDark ? '#4ade80' : '#D2B48C',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            const dataIndex = context.dataIndex;
            const category = data[dataIndex];
            const percentage = ((context.parsed / context.dataset.data.reduce((a: number, b: number) => a + b, 0)) * 100).toFixed(1);
            return [
              `${category.category}`,
              `Sales: ${category.sales}`,
              `Revenue: $${category.revenue.toFixed(2)}`,
              `Percentage: ${percentage}%`
            ];
          }
        }
      }
    },
    cutout: '60%'
  };

  // Calculate totals
  const totalSales = data.reduce((sum, item) => sum + item.sales, 0);
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div className="bg-cream rounded-xl p-6 shadow-md border border-secondary-tea">
      <div style={{ height: `${height}px` }} className="flex items-center justify-center">
        <Doughnut data={chartData} options={options} />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 text-center">
        <div className="bg-light-tea rounded-lg p-3">
          <p className="text-secondary-tea text-sm">Total Sales</p>
          <p className="text-2xl font-bold text-primary-tea">{totalSales}</p>
        </div>
        <div className="bg-light-tea rounded-lg p-3">
          <p className="text-secondary-tea text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-accent-tea">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default CategoryChart;