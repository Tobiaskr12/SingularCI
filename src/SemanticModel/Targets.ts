import { Service } from "typedi";

export default interface ITargets {
    addTarget(target: string): void;
    getTargets(): string[];
    reset(): void;
}

@Service({ id: "TargetsFactory" })
export class TargetsFactory { 
    createTargets(): ITargets { 
        return new Targets();
    }
}

@Service({id:'Targets'})
class Targets implements ITargets {
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

    reset() {
        this.targets = [];
    }

    private isTargetValid(target: string): boolean{
        return this.acceptedTargets.includes(target);
    }
}