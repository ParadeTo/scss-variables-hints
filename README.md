<!--
 * @Author: wangyunbo
 * @Date: 2021-05-19 23:57:46
 * @LastEditors: wangyunbo
 * @LastEditTime: 2021-05-21 17:33:14
 * @Description: file content
 * @FilePath: \css-variables-hints\README.md
-->

# css-variable-hints

Simple extension for geting hints for css-variables from selected files. You can trigger it by typing `--`.
一个简单的`css-variables`变量的提示插件,通过输入`--`触发。

![Demo](https://github.com/airbender92/css-variables-hints/blob/master/img/demo.gif)

Be sure that you have one of supported language modes selected in right bottom of your vscode window:
* css
* postcss
* scss
* less
* vue


## Extension Configuration
Create or modify file `.vscode/settings.json`. Folder `.vscode` should be in your workspace root directory.

在项目的`.vscode/settings.json`文件中配置css变量文件的路径数组，如下所示：
Minimal configuration file:
```
{
  ...
  // 本地资源变量文件路径列表
  "cssVarriablesHints.files": ["src\\theme\\variables.scss"],
  // 远端资源变量文件配置列表
  "cssVarriablesHints.remoteFiles": [{
    "projectId": 8888  //gitlab项目id号,
    "filePath": "lib/export.scss", // gitlab上变量资源的文件路径
    "token": "access token", // token
    "origin": "http://xxxx:8888" // origin
  } ],
  ...
};
```
`cssVarriablesHints.files` and `cssVarriablesHints.remoteFiles` are not required at the same time.
This extension contributes the following configuration parameters:

* `files`: array of paths to files with css variables    

![Demo](img/demo.gif) 
### 用法：   

1. 搜索插件名：`css-variables-hints`, 并安装。    
2. 修改项目根目录下的`.vscode/settings.json`：        
```javascript
{
  ...
  // 本地资源变量文件路径列表
  "cssVarriablesHints.files": ["src\\theme\\variables.scss"],
  // 远端资源变量文件配置列表
  "cssVarriablesHints.remoteFiles": [{
    "projectId": 8888,  //gitlab项目id号,
    "filePath": "lib/export.scss", // gitlab上变量资源的文件路径
    "token": "access token", // token
    "origin": "http://xxxx:8888" // origin
  } ],
  ...
};
```
`cssVarriablesHints.files` 和 `cssVarriablesHints.remoteFiles` 可都配置也可任选一个配置.    
3. 本地和远端的重名变量做了去重操作（本地变量覆盖远端同名变量）    
4. 在vue文件中写样式的时候，通过`--`触发提示，如果没有提示，(1)重启编辑器试下，(2)检查下`.vscode/settings.json`配置是否不正确。    
5. 具体用法看demo图.    

