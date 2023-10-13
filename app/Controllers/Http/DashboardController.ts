import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Client from 'App/Models/Client'

export default class DashboardController {
  public async getData({ auth, response }: HttpContextContract) {
    const user = await auth.authenticate()
    const clients = await Client.query().where('user_id', user.id)
    // Accumulate sums by client name
    const accumulatedData = new Map<string, number>()
    clients.forEach((client) => {
      const key = client.name
      if (accumulatedData.has(key)) {
        accumulatedData.set(key, accumulatedData.get(key)! + client.somme)
      } else {
        accumulatedData.set(key, client.somme)
      }
    })
    // Prepare labels and dataValues from accumulated data
    const labels = Array.from(accumulatedData.keys())
    const dataValues = Array.from(accumulatedData.values())
    return response.json({ labels, dataValues })
  }

  public async byMonth({ auth, response }: HttpContextContract) {
    const user = await auth.authenticate()
    const clients = await Client.query().where('user_id', user.id)

    const accumulatedData = new Map<string, number>()

    clients.forEach((client) => {
      const date = new Date(client.month)
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`
      const key = monthYear

      if (accumulatedData.has(key)) {
        accumulatedData.set(key, accumulatedData.get(key)! + client.somme)
      } else {
        accumulatedData.set(key, client.somme)
      }
    })

    // Créer une fonction de comparaison pour trier les dates
    function compareDates(a: string, b: string) {
      const dateA = new Date(a.split('/').reverse().join('/'))
      const dateB = new Date(b.split('/').reverse().join('/'))
      return dateA.getTime() - dateB.getTime()
    }

    // Convertir les clés (les mois) en objets Date et trier
    const sortedKeys = Array.from(accumulatedData.keys()).sort(compareDates)

    // Générer les dataValues en fonction des labels triés
    const sortedDataValues = sortedKeys.map((label) => accumulatedData.get(label)!)

    return response.json({ labels: sortedKeys, dataValues: sortedDataValues })
  }
}
