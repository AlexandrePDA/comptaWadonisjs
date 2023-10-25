import Env from '@ioc:Adonis/Core/Env'
import { mailConfig } from '@adonisjs/mail/build/config'

export default mailConfig({
  mailer: 'mailgun',
  mailers: {
    mailgun: {
      driver: 'mailgun',
      baseUrl: 'https://api.mailgun.net/v3',
      key: Env.get('MAILGUN_API_KEY'),
      domain: Env.get('MAILGUN_DOMAIN'),
    },
  },
})
