import { Service } from "typedi";
import ITrigger from "../Common/Interfaces/ITrigger";

@Service({ id: "TriggerFactory" })
export class TriggerFactory {
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
            this.types.push(type);
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
        };

        throw new Error(`${type} is not a valid trigger type`);
    }
}