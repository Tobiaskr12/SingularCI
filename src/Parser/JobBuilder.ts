import Task from "../Common/Task";

export default class JobBuilder{
   constructor(private name:string, private tasks:Task[]){

   } 

   setName(name:string){
       this.name = name;
   }
   getName():string{
       return this.name;
   }
   addTask(task:Task){
        this.tasks.push (task)
   }
}