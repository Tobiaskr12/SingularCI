import JobBuilder from "../../src/Parser/JobBuilder";
import { JobBuilderFactory } from "../../src/Parser/JobBuilderFactory";

test('The JobBuilderFactory should create a JobBuilder', () => {
    const jobBuilderFactory = new JobBuilderFactory();
    const jobBuilder = jobBuilderFactory.createJobBuilder();
    expect(jobBuilder).toBeInstanceOf(JobBuilder);
});