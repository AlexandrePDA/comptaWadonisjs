import '../css/app.css'
import Chart from 'chart.js/auto'

(async function () {
  try {
    const getData = async (url) => {
      const fetchDatas = await fetch(url)
      const jsonDatas = await fetchDatas.json()
      const { labels, dataValues } = jsonDatas
      return { labels, dataValues }
    }

    const { labels, dataValues } = await getData('/dashboard-data')

    new Chart(document.getElementById('doughnut'), {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            data: dataValues,
          },
        ],
      },
    })

    const datasByMonth = await getData('/dashboard-dataByMonth')
    const labelsByMonth = datasByMonth.labels
    const valuesByMonth = datasByMonth.dataValues
    new Chart(document.getElementById('bar'), {
      type: 'bar',
      data: {
        labels: labelsByMonth,
        datasets: [
          {
            label: 'Encaissement par mois',
            data: valuesByMonth,
          },
        ],
      },
    })
  } catch (error) {
    console.error(error)
  }
})()
