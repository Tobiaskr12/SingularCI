import StageBuilder from "./StageBuilder";

export default class StageSymbolTable {

  private static instance: StageSymbolTable | undefined;
  private stages: Record<string, StageBuilder>;

  private constructor() {
    this.stages = {};
  }

  static getInstance(): StageSymbolTable {
    if (!this.instance) {
      this.instance = new StageSymbolTable();
    }

    return this.instance;
  }

  addStage(stage: StageBuilder): void {
    if (this.stages[stage.getName()]) {
      throw new Error(`Stage ${stage.getName()} already exists`);
    }
    
    this.stages[stage.getName()] = stage;
  }

  getStage(name: string): StageBuilder {
    if (this.stages[name]) {
      return this.stages[name];
    }
    
    throw new Error(`Stage ${name} not found`);
  }

  getStages(): Record<string, StageBuilder> {
    return this.stages;
  }

  reset(): void {
    this.stages = {};
  }
}