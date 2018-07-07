const chartsBox = document.getElementById('charts')
const canvas = document.createElement('canvas')
chartsBox.appendChild(canvas)

canvas.style.width = '100%'
canvas.style.height = '200px'
canvas.style.border = '1px solid red'

const days = window.templateData
const byTask = {}

const parseHours = (timeStr) => {
  const [, hours, minutes] = /(\d+)h\s(\d+)m/.match(timeStr)
  return Number(hours) + (Number(minutes) / 60)
}

days.forEach(day => {
  day.comments.forEach(comment => {
    comment.objects.forEach(object => {
      if (object.key === 'vsts') {
        byTask[object.value] = (byTask[object.value] || 0) + parseHours(day.time)
      }
    })
  })
})

chartsBox.appendChild(document.createTextNode(JSON.stringify(byTask)))

// const chart = new Chart(canvas.getContext('2d'), {
//   type: 'donut',
//   data: {
//     datasets: [{
//       data: Object.values(byTask)
//     }],
//     labels: Object.keys(byTask).map(k => 'Task ' + k + ' (' + byTask[k].toFixed(1) + ' hours)')
//   }
// }, {

// })