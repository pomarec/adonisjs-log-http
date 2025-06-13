/*
 * @rlanz/sentry
 *
 * (c) Romain Lanz
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type Configure from '@adonisjs/core/commands/configure'
import { stubsRoot } from './stubs/main.js'

/**
 * Configures the package
 */
export async function configure(command: Configure) {
  const codemods = await command.createCodemods()

  /**
   * Publish config file
   */
  await codemods.makeUsingStub(stubsRoot, 'stubs/config/log_http.stub', {})

  /**
   * Register middleware
   */
  await codemods.registerMiddleware('router', [
    {
      path: '@akago/adonisjs-log-http/middleware',
      position: 'before',
    },
  ])
}
