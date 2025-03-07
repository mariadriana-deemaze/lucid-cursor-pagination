import Configure from '@adonisjs/core/commands/configure';

export async function configure(command: Configure) {
  const codemods = await command.createCodemods();

  await codemods.updateRcFile((rcFile: any) => {
    rcFile.addProvider('lucid-cursor-pagination/providers/lucid-cursor-provider');
  });
}
