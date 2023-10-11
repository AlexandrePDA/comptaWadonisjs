import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import CreateUserValidator from 'App/Validators/CreateUserValidator'

export default class AuthController {
  public showLoginForm({ view }: HttpContextContract) {
    return view.render('auth/login')
  }

  public showRegisterForm({ view }: HttpContextContract) {
    return view.render('auth/register')
  }

  public async showDashboard({ view }: HttpContextContract) {
    return view.render('dashboard')
  }

  public async login({ auth, request, response }: HttpContextContract) {
    const { email, password } = request.all()
    await auth.attempt(email, password)
    if (auth.user) {
      return response.redirect().toRoute('dashboard')
    }
  }

  public async register({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateUserValidator)
    await User.create(payload)
    return response.redirect().toRoute('login')
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.logout()
    return response.redirect().toRoute('/')
  }
}
