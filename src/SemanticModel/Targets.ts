export default class Targets {
    private acceptedTargets = [
        "GitHub",
        "GitLab",
    ]
    private targets: string[] = [];

    addTarget(target:string){
        if (this.isTargetValid(target)){
            this.targets.push(target);
        } else {
            throw new Error(`${target} is not a valid target`);
        }
    }

    getTargets(): string[] {
        return this.targets;
    }

    private isTargetValid(target: string): boolean{
        return this.acceptedTargets.includes(target);
    }
}