<!--
 * @Author: wangyunbo
 * @Date: 2021-05-19 23:57:46
 * @LastEditors: wangyunbo
 * @LastEditTime: 2021-05-21 10:57:55
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
  "cssVarriablesHints.files": [ "variables.css" ],
}
```

This extension contributes the following configuration parameters:

* `files`: array of paths to files with css variables

### 用法：   
![Demo](img/demo.gif) 
1. 搜索插件名：`css-variables-hints`, 并安装。
2. 修改项目根目录下的`.vscode/settings.json`：    
```javascript
{
  ...
  "cssVarriablesHints.files": ["样式变量文件路径1", "路径2" ],
  ...
};
// 譬如：
{
  ...
  "cssVarriablesHints.files": ["node_modules//hatech-web-theme-darkblue//lib//export.scss" ],
  ...
};
```
3. 在vue文件中写样式的时候，通过`--`触发提示，如果没有提示，(1)重启编辑器试下，(2)检查下`.vscode/settings.json`配置是否不正确。
4. 具体用法看demo图
