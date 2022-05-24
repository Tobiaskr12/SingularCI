import VariablesFactory from "../../src/SemanticModel/Variables";

const variablesFactory = new VariablesFactory();

test('calling reset should remove all variables', () => {
  const variables = variablesFactory.createVariables();

  variables.addVariable('key', 'value');
  variables.addVariable('key2', 'value2');

  expect(variables.getVariables()).toEqual({
    key: 'value',
    key2: 'value2'
  });

  variables.reset();

  expect(variables.getVariables()).toEqual({});
});

it('should be possible to add a variable', () => {
  const variables = variablesFactory.createVariables();

  variables.addVariable('key', 'value');

  expect(variables.getVariables()).toEqual({
    key: 'value'
  });
});

it('should be possible to get a specific variable', () => {
  const variables = variablesFactory.createVariables();

  variables.addVariable('key', 'value');

  expect(variables.getVariable('key')).toBe('value');
});

it('should be possible to get all variables', () => {
  const variables = variablesFactory.createVariables();

  variables.addVariable('key', 'value');
  variables.addVariable('key2', 'value2');

  expect(variables.getVariables()).toEqual({
    key: 'value',
    key2: 'value2'
  });
});
