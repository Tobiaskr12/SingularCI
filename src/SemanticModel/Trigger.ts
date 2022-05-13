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

    private isTypeValid(type: string): boolean { 
        if (this.validTypes.includes(type)) {
            return true;
        };

        throw new Error(`${type} is not a valid trigger type`);
    }
}