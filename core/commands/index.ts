import { ICommand, NodeSchema } from '../types';
import { sceneGraph } from '../SceneGraph';

export class AddNodeCommand implements ICommand {
  private node: NodeSchema;

  constructor(node: NodeSchema) {
    this.node = node;
  }

  execute() {
    sceneGraph.addNode(this.node);
    sceneGraph.setSelection([this.node.id]);
  }

  undo() {
    sceneGraph.deleteNode(this.node.id);
  }
}

export class MoveNodeCommand implements ICommand {
  private id: string;
  private oldX: number;
  private oldY: number;
  private newX: number;
  private newY: number;

  constructor(id: string, oldX: number, oldY: number, newX: number, newY: number) {
    this.id = id;
    this.oldX = oldX;
    this.oldY = oldY;
    this.newX = newX;
    this.newY = newY;
  }

  execute() {
    sceneGraph.updateNode(this.id, { x: this.newX, y: this.newY });
  }

  undo() {
    sceneGraph.updateNode(this.id, { x: this.oldX, y: this.oldY });
  }
}

export class UpdatePropertyCommand implements ICommand {
  private id: string;
  private prop: keyof NodeSchema;
  private oldValue: any;
  private newValue: any;

  constructor(id: string, prop: keyof NodeSchema, oldValue: any, newValue: any) {
    this.id = id;
    this.prop = prop;
    this.oldValue = oldValue;
    this.newValue = newValue;
  }

  execute() {
    sceneGraph.updateNode(this.id, { [this.prop]: this.newValue });
  }

  undo() {
    sceneGraph.updateNode(this.id, { [this.prop]: this.oldValue });
  }
}