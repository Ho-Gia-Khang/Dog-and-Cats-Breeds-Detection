import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { ImageDetectionResponse } from '../../api/model/ImageDetectionResponse'
import { FileIntermediate } from '../../types/FileIntermediate'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Confidence Level of the Model',
    },
  },
  scales: {
    y: {
      min: 0,
      max: 1,
    },
    x: { stacked: true },
  },
}
const index = ({
  images,
  results,
}: {
  images: FileIntermediate[]
  results: Record<string, ImageDetectionResponse>
}) => {
  function getColors() {
    return `rgba(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},0.5)`
  }

  const data = {
    labels: images.map((img) => img.file.name),
    datasets: Object.keys(results).map((k) => ({
      label: results[k].prediction.predicted_class,
      data: Object.keys(results).map((key) => {
        if (key === k) return results[k].prediction.confidence
        return 0
      }),
      backgroundColor: getColors(),
      borderColor: 'rgba(75,192,192,1)',
      borderWidth: 1,
    })),
  }

  return <Bar className="!w-[1000px]" options={options} data={data} />
}

export default index
