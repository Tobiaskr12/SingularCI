export default interface ITargets {
  addTarget(target: string): void;
  getTargets(): string[];
  reset(): void;
}
