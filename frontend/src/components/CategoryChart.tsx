import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { CategorySales } from '../services/analyticsService';

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
  // Prepare chart data
  const chartData = {
    labels: data.map(item => item.category),
    datasets: [
      {
        data: data.map(item => item.sales),
        backgroundColor: [
          '#8B4513', // SaddleBrown
          '#D4A574', // Tan
          '#A0522D', // Sienna
          '#CD853F', // Peru
          '#DEB887', // BurlyWood
        ],
        borderColor: [
          '#FFFFFF',
          '#FFFFFF',
          '#FFFFFF',
          '#FFFFFF',
          '#FFFFFF',
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
          color: '#4A4A4A',
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
        color: '#8B4513',
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
        backgroundColor: 'rgba(139, 69, 19, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#D4A574',
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