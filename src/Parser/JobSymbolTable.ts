import JobBuilder from "./JobBuilder";

export default class JobSymbolTable {

  private instance: JobSymbolTable | undefined;
  private jobs: Record<string, JobBuilder>;

  constructor() {
    this.jobs = {};
  }

  getInstance (): JobSymbolTable {
    if (!this.instance) {
      this.instance = new JobSymbolTable();
    }

    return this.instance;
  }

  addJob (job: JobBuilder): void {
    this.jobs[job.getName()] = job;
  }

  getJob (name: string): JobBuilder {
    if (this.jobs[name]) {
      return this.jobs[name];
    }
    
    throw new Error(`Job ${name} not found`);
  }
}