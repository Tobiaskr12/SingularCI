import StageBuilder from "./StageBuilder";

export default class StageSymbolTable {

  private instance: StageSymbolTable | undefined;
  private stages: Record<string, StageBuilder>;

  constructor() {
    this.stages = {};
  }

  getInstance (): StageSymbolTable {
    if (!this.instance) {
      this.instance = new StageSymbolTable();
    }

    return this.instance;
  }

  addJob (stage: StageBuilder): void {
    this.stages[stage.getName()] = stage;
  }

  getJob (name: string): StageBuilder {
    if (this.stages[name]) {
      return this.stages[name];
    }
    
    throw new Error(`Stage ${name} not found`);
  }
}