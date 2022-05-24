import Pipeline from "../SemanticModel/Pipeline";

export interface IDSLParser {
  parse(): Pipeline;
}