import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Client from 'App/Models/Client'
import DeleteValidator from 'App/Validators/DeleteValidator'
import TaxValidator from 'App/Validators/TaxValidator'

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

  public showSettings({ view }: HttpContextContract) {
    return view.render('settings')
  }

  public async addTax({ auth, request, view }: HttpContextContract) {
    const payload = await request.validate(TaxValidator)
    const user = await auth.authenticate()
    user.taxe = payload.taxe
    await user.save()
    return view.render('settings', { user })
  }

  public async delete({ view, auth, request }: HttpContextContract) {
    const payload = await request.validate(DeleteValidator)
    const user = await auth.authenticate()

    if (payload.delete !== `supprimer/${user.name}`) {
      const error = 'input incorrect'
      return view.render('settings', { error })
    }
    await auth.logout()
    await user.delete()
    return view.render('home')
  }

  public async showClients({ view, auth }: HttpContextContract) {
    const user = await auth.authenticate()
    const clients = await Client.query().where('user_id', user.id)

    const clientData = new Map<string, { somme: number; dates: string[] }>()

    clients.forEach((client) => {
      const key = client.name

      if (clientData.has(key)) {
        clientData.get(key)!.somme += client.somme
        clientData.get(key)!.dates.push(client.month)
      } else {
        clientData.set(key, { somme: client.somme, dates: [client.month] })
      }
    })

    const formattedClientData = Array.from(clientData.entries()).map(([name, { somme, dates }]) => {
      return {
        name,
        somme,
        dates: dates.map((date) => {
          const [year, month] = date.split('-')
          return `${month}-${year}`
        }),
      }
    })
    return view.render('showClients', { clientData: formattedClientData })
  }

  public async showMonth({ view, auth }: HttpContextContract) {
    const user = await auth.authenticate()

    const clients = await Client.query().where('user_id', user.id)

    const monthlyData = {}

    for (const client of clients) {
      const month = client.month.toString().slice(0, 7) // Récupère le mois au format "yyyy-mm"

      if (!monthlyData[month]) {
        monthlyData[month] = {
          totalSomme: 0,
          clients: [],
        }
      }

      monthlyData[month].totalSomme += client.somme
      monthlyData[month].clients.push({
        name: client.name,
        somme: client.somme,
      })
    }

    const formattedData = Object.keys(monthlyData).map((month) => ({
      month,
      totalSomme: monthlyData[month].totalSomme,
      clients: monthlyData[month].clients,
    }))

    const sortedMonthlyData = formattedData.sort((a, b) => {
      const [yearA, monthA] = a.month.split('-').map(Number)
      const [yearB, monthB] = b.month.split('-').map(Number)

      if (yearA !== yearB) {
        return yearA - yearB
      }

      return monthA - monthB
    })

    const formattedMonthlyData = sortedMonthlyData.map((data) => ({
      month: `${data.month.split('-')[1]}-${data.month.split('-')[0]}`,
      totalSomme: data.totalSomme,
      clients: data.clients,
    }))

    return view.render('showMonth', { monthlyData: formattedMonthlyData })
  }
}
