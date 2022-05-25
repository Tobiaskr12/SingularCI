import StageBuilder from "../../src/Parser/StageBuilder";
import StageSymbolTable from "../../src/Parser/StageSymbolTable";

let stageSymbolTable: StageSymbolTable;

beforeEach(() => {
  stageSymbolTable = StageSymbolTable.getInstance();
});

test('calling getInstance should return a singleton instance', () => {
  expect(stageSymbolTable).toBeInstanceOf(StageSymbolTable);
});

test('calling addStage should add a stage to the table', () => {
  const stageBuilder = new StageBuilder();
  stageBuilder.setName('Stage 1');

  stageSymbolTable.addStage(stageBuilder);
  expect(stageSymbolTable.getStage(stageBuilder.getName())).toBe(stageBuilder);
});

test('calling getStages should return all stages', () => {
  const stageBuilder1 = new StageBuilder();
  stageBuilder1.setName('Stage 1');
  stageSymbolTable.addStage(stageBuilder1);

  const stageBuilder2 = new StageBuilder();
  stageBuilder2.setName('Stage 2');
  stageSymbolTable.addStage(stageBuilder2);

  expect(stageSymbolTable.getStages()['Stage 1']).toBe(stageBuilder1);
  expect(stageSymbolTable.getStages()['Stage 2']).toBe(stageBuilder2);
  expect(Object.keys(stageSymbolTable.getStages()).length).toBe(2);
});