import { Service } from "typedi";
import JobBuilder from "./JobBuilder";

@Service({ id: "JobBuilderFactory" })
export class JobBuilderFactory {
  public createJobBuilder() {
    return new JobBuilder();
  }
}