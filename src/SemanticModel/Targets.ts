export default class Targets {

    constructor(
      private targets: string[]
    ){}

    addTarget(target:string){
        this.targets.push(target);
    }

    getTargets():string[]{
        return this.targets;
    }

}