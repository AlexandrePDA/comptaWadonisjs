/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'
import User from 'App/Models/User'

Route.get('/', async ({ view }) => {
  return view.render('home')
})

Route.get('/login', 'AuthController.showLoginForm')
Route.get('/register', 'AuthController.showRegisterForm')
Route.get('/logout', 'AuthController.logout').as('logout')
Route.get('/dashboard', 'AuthController.showDashboard').middleware('auth').as('dashboard')
Route.get('showAddMission', 'ClientsController.showAddMission').middleware('auth')
Route.get('showHistoryGeneral', 'ClientsController.showHistoryGeneral').middleware('auth')
Route.get('/dashboard-data', 'DashboardController.getData').middleware('auth')
Route.get('/dashboard-dataByMonth', 'DashboardController.byMonth').middleware('auth')
Route.get('/settings', 'DashboardController.showSettings').middleware('auth')
Route.get('/showClients', 'DashboardController.showClients').middleware('auth')

Route.post('/addMission', 'ClientsController.addMission').middleware('auth').as('addMission')
Route.post('/login', 'AuthController.login').as('login')
Route.post('/register', 'AuthController.register').as('register')
Route.post('addTax', 'DashboardController.addTax').middleware('auth').as('addTax')
Route.post('delete', 'DashboardController.delete').middleware('auth').as('delete')

Route.get('/test', async () => {
  return User.all()
})
