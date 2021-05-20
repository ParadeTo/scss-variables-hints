<!--
 * @Author: wangyunbo
 * @Date: 2021-05-19 23:57:46
 * @LastEditors: wangyunbo
 * @LastEditTime: 2021-05-20 17:15:00
 * @Description: file content
 * @FilePath: \css-variables-hints\README.md
-->

# css-variable-hints

Simple extension for enabling autocompletion for css-variables from selected files. You can trigger it by typing `--`.

![Demo]()

Be sure that you have one of supported language modes selected in right bottom of your vscode window:
* css
* postcss
* scss
* less


## Extension Configuration
Create or modify file `.vscode/settings.json`. Folder `.vscode` should be in your workspace root directory.

Minimal configuration file:
```
{
  "cssVarriablesAutocomplete.files": [ "variables.css" ],
}
```

This extension contributes the following configuration parameters:

* `files`: array of paths to files with css variables
