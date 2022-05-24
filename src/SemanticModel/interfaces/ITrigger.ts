export default interface ITrigger {
  addType(type:string):void;
  addBranch(branch:string):void;
  getTypes():string[];
  getBranches():string[];
  reset():void;
}
