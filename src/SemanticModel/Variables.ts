export default class Variables {
  private variables: Record<string, string> = {};

  addVariable(key:string, value:string) {
      this.variables[key] = value;
  }

  getVariables(): Record<string, string>{
      return this.variables;
  }

  getVariable(key:string): string{
    if (this.variables[key]) {
      return this.variables[key];
    }

    throw new Error(`Variable '${key}' not found`);
  }

}

