import { Service } from "typedi";
import IVariables from "./interfaces/IVariables";

@Service({ id: "VariablesFactory" })
export default class VariablesFactory {
  createVariables(): IVariables {
    return new Variables();
  }
}

@Service({ id: "Variables" })
class Variables implements IVariables {
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

  reset() {
    this.variables = {};
  }

}

