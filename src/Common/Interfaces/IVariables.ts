export default interface IVariables{
  addVariable(key: string, value: string): void;
  getVariables(): Record<string,string>;
  getVariable(key: string): string;
  reset(): void;
}