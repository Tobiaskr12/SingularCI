import StageSymbolTable from "../../src/Parser/StageSymbolTable";
import StageFactory from "../../src/SemanticModel/Stage";

let stageSymbolTable: StageSymbolTable;
let stageFactory: StageFactory;

beforeAll(() => {
  stageFactory = new StageFactory();
});

beforeEach(() => {
  stageSymbolTable = StageSymbolTable.getInstance();
});

test('calling getInstance should return a singleton instance', () => {
  expect(stageSymbolTable).toBeInstanceOf(StageSymbolTable);
});

test('calling addStage should add a stage to the table', () => {
  const stage = stageFactory.createStage('stage', [], [], 'ubuntu-latest');

  stageSymbolTable.addStage(stage);
  expect(stageSymbolTable.getStage(stage.getName())).toBe(stage);
});

test('calling getStages should return all stages', () => {
  const stage1 = stageFactory.createStage('stage1', [], [], 'ubuntu-latest');
  stageSymbolTable.addStage(stage1);

  const stage2 = stageFactory.createStage('stage2', [], [], 'ubuntu-latest');
  stageSymbolTable.addStage(stage2);

  expect(stageSymbolTable.getStages()['stage1']).toBe(stage1);
  expect(stageSymbolTable.getStages()['stage2']).toBe(stage2);
  expect(Object.keys(stageSymbolTable.getStages()).length).toBe(2);
});

afterEach(() => {
  stageSymbolTable.reset();
});