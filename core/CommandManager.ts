import { ICommand } from './types';

class CommandManager {
  private history: ICommand[] = [];
  private future: ICommand[] = [];

  execute(command: ICommand) {
    command.execute();
    this.history.push(command);
    this.future = []; // Clear redo stack
    console.log('Command executed:', command.constructor.name);
  }

  undo() {
    const command = this.history.pop();
    if (command) {
      command.undo();
      this.future.push(command);
      console.log('Command undone');
    }
  }

  redo() {
    const command = this.future.pop();
    if (command) {
      command.execute();
      this.history.push(command);
      console.log('Command redone');
    }
  }

  canUndo() {
    return this.history.length > 0;
  }

  canRedo() {
    return this.future.length > 0;
  }
}

export const commandManager = new CommandManager();