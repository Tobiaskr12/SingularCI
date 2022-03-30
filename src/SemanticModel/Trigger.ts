export type Triggers = {
    types: string[],
    branches: string[]
}

export default class Trigger {
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

    getTriggers(): Triggers {
        return {
            types: this.types,
            branches: this.branches
        }
    }

    private isTypeValid(type: string): boolean { 
        return this.validTypes.includes(type);
    }
}