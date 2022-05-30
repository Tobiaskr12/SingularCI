import ITargets from "./interfaces/ITargets";
import { Service } from "typedi";

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
        if (this.isTargetValid(target)) {
            this.targets.push(target);
        } else {
            throw new Error(`${target} is defined multiple times or invalid`);
        }
    }

    getTargets(): string[] {
        return this.targets;
    }

    reset() {
        this.targets = [];
    }

    private isTargetValid(target: string): boolean{
        return this.acceptedTargets.includes(target) && !this.targets.includes(target);
    }
}