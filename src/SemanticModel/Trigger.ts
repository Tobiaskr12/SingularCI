export default class Trigger {

    constructor(
      private types: string[],
      private branches: string[]
    ){}

    addType(type:string){
        this.types.push(type);
    }

    addBranch(branch:string){
        this.branches.push(branch);
    }

    getTypes():string[]{
        return this.types;
    }

    getBranches():string[]{
        return this.branches;
    }
}