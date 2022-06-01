<!--
 * @Author: wangyunbo
 * @Date: 2021-05-19 23:57:46
 * @LastEditors: wangyunbo
 * @LastEditTime: 2021-05-31 14:01:45
 * @Description: file content
 * @FilePath: \hatech-web-css-hints\README.md
-->

# css-variable-hints

css 变量提示插件,通过输入`-` 或 `#`触发。

### 功能
1. 以`#`触发仅提示十六进制符号的颜色值 比如：`--danger-color: #f53f3f;`;
2. 以`-`触发的会提示出所有css变量。

变量文件需遵循的规则：目标文件里的变量必须用 `:root{}` 或 `:export{}`包括。

![Demo](https://github.com/airbender92/css-variables-hints/blob/master/img/css-variable-hints.gif)

Be sure that you have one of supported language modes selected in right bottom of your vscode window:
* css
* postcss
* scss
* less
* vue


## Extension Configuration

在项目的`.vscode/settings.json`文件中配置css变量文件的路径数组，如下所示：
Minimal configuration file:
```
{
  ...
  // 本地资源变量文件路径配置规则 以`**`开始和结尾。
  "cssVarriablesHints.files": [
    "**/node_modules/@hatech/theme/lib/**",
    "**/src/theme/**"
  ],
  ...
};
```
### 用法：   

1. 搜索插件名：`css-variables-hints`, 并安装。
2. 修改项目根目录下的`.vscode/settings.json`：
```javascript
{
  ...
  // 本地资源变量文件路径列表
  "cssVarriablesHints.files": [
    "**/node_modules/@hatech/theme/lib/**",
    "**/src/theme/**"
  ],
  ...
};
```

3. 在vue文件中写样式的时候，通过`-`或`#`触发提示，如果没有提示，(1)重启编辑器试下，(2)检查下`.vscode/settings.json`配置是否不正确。


