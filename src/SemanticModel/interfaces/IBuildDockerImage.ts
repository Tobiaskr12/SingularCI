export default interface IBuildDockerImage{
  getImageName():string;
  getBuildFilePath():string;
  getUserName():string;
  getPassword():string;
}