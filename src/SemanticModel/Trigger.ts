import { Service } from "typedi";
import ITrigger from "./interfaces/ITrigger";

export default interface ITriggerFactory {
    createTrigger():ITrigger
}

@Service({ id: "TriggerFactory" })
export class TriggerFactory implements ITriggerFactory {
    createTrigger(): ITrigger {
        return new Trigger();
    }
}

@Service({ id: "Trigger" })
class Trigger implements ITrigger {
    private validTypes = [
        "push",
        "pull_request",
    ]

    private types: string[] = [];
    private branches: string[] = [];

    addType(type: string) {
        if (this.isTypeValid(type)) {
            if (!this.types.includes(type)) {
                this.types.push(type);
            }
        }
    }

    addBranch(branch: string){
        this.branches.push(branch);
    }

    getTypes(): string[]{
        return this.types;
    }

    getBranches(): string[]{
        return this.branches;
    }

    reset() {
        this.types = [];
        this.branches = [];
    }

    private isTypeValid(type: string): boolean { 
        if (this.validTypes.includes(type)) {
            return true;
        }

        throw new Error(`${type} is not a valid trigger type`);
    }
}