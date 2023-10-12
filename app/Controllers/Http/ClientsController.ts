import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Client from 'App/Models/Client'
import CreateClientValidator from 'App/Validators/CreateClientValidator'
import CreateMissionValidator from 'App/Validators/CreateMissionValidator'

export default class ClientsController {
  public showAddClient({ view }: HttpContextContract) {
    return view.render('addClient')
  }

  public async showAddMission({ auth, view }: HttpContextContract) {
    const user = await auth.authenticate()
    const clients = await Client.query().where('user_id', user.id).distinct('name')
    return view.render('addMission', { clients })
  }

  public async showHistoryGeneral({ auth, view }: HttpContextContract) {
    const user = await auth.authenticate()
    const clients = await Client.query().where('user_id', user.id)
    const totalClients = clients.length
    const totalSomme = clients.reduce((acc, client) => acc + client.somme, 0)
    const reversedClients = clients.slice().reverse()
    return view.render('history', { user, totalClients, totalSomme, reversedClients })
  }

  public async addClient({ auth, request, response }: HttpContextContract) {
    const payload = await request.validate(CreateClientValidator)
    const user = await auth.authenticate()
    const newClient = new Client()
    newClient.fill({
      name: payload.name,
      month: payload.month,
      somme: payload.somme,
      user_id: user.id,
    })
    await newClient.save()
    return response.redirect().toRoute('dashboard')
  }

  public async addMission({ auth, request, response }: HttpContextContract) {
    const payload = await request.validate(CreateMissionValidator)
    const user = await auth.authenticate()
    const existingClient = await Client.query()
      .where('name', payload.name)
      .where('month', payload.month)
      .first()
    if (existingClient) {
      existingClient.somme += payload.somme
      await existingClient.save()
    } else {
      await Client.create({
        name: payload.name,
        month: payload.month,
        somme: payload.somme,
        user_id: user.id,
      })
    }
    return response.redirect().toRoute('dashboard')
  }
}
