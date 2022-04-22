import SemanticModel from "../SemanticModel";

export interface IDSLParser {
  parse(): SemanticModel;
}