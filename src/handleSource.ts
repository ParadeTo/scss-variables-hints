import * as path from 'path';
import * as fs from 'fs';

class SourceFiles {
  folderPath = '';
  // 包的目录
  packageDirPath = '';
  // scss文件目录
  targetDirPath = '';
  // 目标文件path列表
  targetPathList: string[] = [];
  constructor(folderPath: string) {
    this.folderPath = folderPath;
  }

   getFilesPath() {
    let _this = this;
    let files: any[] = [];
    try {
      const folder = this.folderPath.substring(1).replace(/\//g, '\\');
      console.log(folder);
      this.targetDirPath = folder;
        files = fs.readdirSync(folder);
     } catch (err) {
       console.log('错误：', err);
     }
      // listing all files using forEach
      files.forEach(function (file) {
        _this.targetPathList.push(_this.targetDirPath + '\\' + file);
      });
    return this.targetPathList;
  }
}

export default SourceFiles;
