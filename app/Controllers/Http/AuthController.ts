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

  public async login({ auth, request, response }: HttpContextContract) {
    const { email, password } = request.all()
    await auth.attempt(email, password)
    return response.redirect().back()
  }

  public async register({ auth, request, response }: HttpContextContract) {
    const payload = await request.validate(CreateUserValidator)
    await User.create(payload)
    return response.redirect().back()
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.logout()
    return response.redirect().back()
  }
}
