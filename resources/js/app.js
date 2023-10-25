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
            backgroundColor: [
              'rgba(231, 76, 60)',
              'rgba(155, 89, 182)',
              'rgba(52, 152, 219)',
              'rgba(26, 188, 156)',
              'rgba(241, 196, 15)',
              'rgba(236, 240, 241)',
              'rgba(41, 128, 185)',
              'rgba(211, 84, 0)',
            ],
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
            backgroundColor: [
              'rgba(231, 76, 60)',
              'rgba(155, 89, 182)',
              'rgba(52, 152, 219)',
              'rgba(26, 188, 156)',
              'rgba(241, 196, 15)',
              'rgba(236, 240, 241)',
              'rgba(41, 128, 185)',
              'rgba(211, 84, 0)',
            ],
          },
        ],
      },
    })
  } catch (error) {
    console.error(error)
  }
})()
