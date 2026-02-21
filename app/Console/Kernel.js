/**
 * Console Kernel
 *
 * Registers console commands. Pattern from orchestr-sh-skeleton.
 * Includes migration and seeder commands so `orchestr migrate` uses app config.
 */

const {
  ConsoleKernel,
  MigrateCommand,
  MigrateRollbackCommand,
  MigrateResetCommand,
  MigrateRefreshCommand,
  MigrateFreshCommand,
  MigrateStatusCommand,
  MakeMigrationCommand,
  SeedCommand,
  MakeSeederCommand,
} = require('@orchestr-sh/orchestr');

class AppConsoleKernel extends ConsoleKernel {
  registerCommands() {
    this.registerMany([
      new MigrateCommand(this.app),
      new MigrateRollbackCommand(this.app),
      new MigrateResetCommand(this.app),
      new MigrateRefreshCommand(this.app),
      new MigrateFreshCommand(this.app),
      new MigrateStatusCommand(this.app),
      new MakeMigrationCommand(this.app),
      new SeedCommand(this.app),
      new MakeSeederCommand(this.app),
    ]);
  }
}

module.exports = { AppConsoleKernel };
