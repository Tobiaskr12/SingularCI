import Pipeline from "../Pipeline";

export interface IDSLParser {
  parse(): Pipeline;
}