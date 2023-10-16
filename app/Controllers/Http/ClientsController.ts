import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Client from 'App/Models/Client'
import CreateClientValidator from 'App/Validators/CreateClientValidator'

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

    const formattedClients = reversedClients.map((client) => {
      const [year, month, day] = client.month.split('-')
      return {
        name: client.name,
        month: `${day}-${month}-${year}`,
        somme: client.somme,
      }
    })
    return view.render('history', {
      user,
      totalClients,
      totalSomme,
      reversedClients: formattedClients,
    })
  }

  public async addMission({ auth, request, response }: HttpContextContract) {
    const payload = await request.validate(CreateClientValidator)
    const user = await auth.authenticate()
    const newClient = new Client()
    newClient.fill({
      name: payload.name.toLowerCase(),
      month: payload.month,
      somme: payload.somme,
      user_id: user.id,
    })
    await newClient.save()
    return response.redirect().toRoute('dashboard')
  }
}
