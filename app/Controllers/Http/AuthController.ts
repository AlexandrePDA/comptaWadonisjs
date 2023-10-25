import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Client from 'App/Models/Client'
import User from 'App/Models/User'
import CreateUserValidator from 'App/Validators/CreateUserValidator'

export default class AuthController {
  public showLoginForm({ view }: HttpContextContract) {
    return view.render('auth/login')
  }

  public showRegisterForm({ view }: HttpContextContract) {
    return view.render('auth/register')
  }

  public async showDashboard({ view, auth }: HttpContextContract) {
    const user = await auth.authenticate()
    const clients = await Client.query().where('user_id', user.id)
    // Récupérer les trois derniers clients
    const lastThreeClients = clients.slice().reverse().slice(0, 3)
    // Formater les dates au format "DD-MM-YYYY"
    const formattedClients = lastThreeClients.map((client) => {
      const [year, month, day] = client.month.split('-')
      return {
        name: client.name,
        month: `${day}-${month}-${year}`,
        somme: client.somme,
      }
    })
    const sommeTotale = await Client.query()
      .where('user_id', user.id)
      .sum('somme as totalSomme')
      .first()
    let totalSomme = 0 // Initialiser à 0 au cas où sommeTotale ne serait pas défini
    if (sommeTotale && sommeTotale.$extras && sommeTotale.$extras.totalSomme) {
      totalSomme = parseFloat(sommeTotale.$extras.totalSomme)
    }
    const lastClient = { lastClient: formattedClients }
    const totalClients = clients.length
    return view.render('dashboard', { user, clients, ...lastClient, totalClients, totalSomme })
  }

  public async login({ view, auth, request, response }: HttpContextContract) {
    try {
      const { email, password } = request.all()
      await auth.attempt(email, password)
      if (auth.user) {
        return response.redirect().toRoute('dashboard')
      }
    } catch (error) {
      const err = 'error'
      return view.render('auth/login', { err })
    }
  }

  public async register({ view, request, response }: HttpContextContract) {
    try {
      const payload = await request.validate(CreateUserValidator)
      payload.email = payload.email.toLowerCase()
      await User.create(payload)
      return response.redirect().toRoute('login')
    } catch (error) {
      const err = 'error'
      return view.render('auth/register', { err })
    }
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.logout()
    return response.redirect().toRoute('/')
  }
}
