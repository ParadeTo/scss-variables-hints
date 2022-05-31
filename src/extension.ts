/*
 * @Author: wangyunbo
 * @Date: 2021-05-19 23:57:46
 * @LastEditors: wangyunbo
 * @LastEditTime: 2021-05-31 14:01:06
 * @Description: file content
 * @FilePath: \hatech-web-css-hints\src\extension.ts
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as css from 'css';
import * as strip from 'strip-comments';
import SourceFiles from './handleSource';
import type { Rule, Declaration } from 'css';

const { CompletionItem, CompletionList } = vscode;

export async function activate(context: vscode.ExtensionContext) {
  const items: vscode.CompletionItem[] = [];
  const bareItems: vscode.CompletionItem[] = [];
  // workspace not selected
  if (!vscode.workspace.workspaceFolders) {
    return;
  }
  const editor = vscode.window.activeTextEditor;
  if (!editor || !vscode.workspace.workspaceFolders) {
    return null;
  }

  const config = vscode.workspace.getConfiguration('cssVarriablesHints');
  const configLanguageMods: Array<string> = config.get('languageModes') || [];
  // 处理本地变量
  handleConfigFiles(editor, bareItems, items);
  let completionProvider = vscode.languages.registerCompletionItemProvider(
    configLanguageMods.length
      ? configLanguageMods
      : ['css', 'postcss', 'scss', 'less', 'vue'],
    {
      async provideCompletionItems(document, position) {
        try {
          let linePrefix = document
            .lineAt(position)
            .text.substring(0, position.character);
          let lineContent = document
            .lineAt(position)
            .text.substring(0);
          const firstCharOfLinePosition = new vscode.Position(position.line, 0);
          const withIndentBeforeCursorText =
            document.getText(
              new vscode.Range(firstCharOfLinePosition, position)
            ) || '';
          const list = withIndentBeforeCursorText.split(':');
          let beforeCursorText = '';
          if (list.length > 1) {
            beforeCursorText = list[1].trim();
          } else {
            beforeCursorText = list[0].trim();
          }
          if (!/(#|-)/.test(linePrefix)) {
            return null;
          }

          let completionItems: vscode.CompletionItem[] = /^#/.test(beforeCursorText)
            ? bareItems
            : items;
          let dashPosition = null;
          let dashPosition2 = null;
          let range: vscode.Range | null = null;
          if (beforeCursorText.startsWith('#')) {
            dashPosition = new vscode.Position(
              position.line,
              withIndentBeforeCursorText.indexOf('#')
            );
            dashPosition2 = new vscode.Position(
              position.line,
              lineContent.length
            );
            range = new vscode.Range(dashPosition, dashPosition2);
          } else if (beforeCursorText.startsWith('-')) {
            dashPosition = new vscode.Position(
              position.line,
              withIndentBeforeCursorText.lastIndexOf('-')
            );
            dashPosition2 = new vscode.Position(
              position.line,
              lineContent.length
            );
            range = new vscode.Range(dashPosition, dashPosition2);
          }
          completionItems = completionItems.map((item) => {
            if (range === null) {
              return item;
            } else {
              return {
                ...item,
                range,
              };
            }
          });
          return new CompletionList(completionItems);
        } catch (err) {
          console.log(err);
        }
      },
    },
    ...['-', '#']
  );

  context.subscriptions.push(completionProvider);
}

function handleConfigFiles(
  editor: any,
  bareItems: vscode.CompletionItem[],
  items: vscode.CompletionItem[]
) {
  let folderPath = '';
  let relativeFolderPath = '';
    const resource = editor.document.uri;
    const config = vscode.workspace.getConfiguration('cssVarriablesHints');
  // 本地资源文件
  const hasFilesInConfig = config && config.has('file');
  if (hasFilesInConfig) {
    const configFile: { folderPath: string } | undefined = config.get('file');
    if (typeof configFile === 'object') {
      relativeFolderPath = configFile.folderPath || '';
      if (resource.scheme === 'file') {
      const folder: any = vscode.workspace.getWorkspaceFolder(resource);
      if (folder) {
        folderPath = folder.uri.path + '/' + relativeFolderPath;
      }
    }
    } else {
       const msg = '配置文件有误';
       vscode.window.showInformationMessage(msg);
    }
  } else {
    const msg = '请配置项目目标文件的相对路径';
    vscode.window.showInformationMessage(msg);
    return;
  }
  const instance = new SourceFiles(folderPath);
  const filePaths = instance.getFilesPath();
  console.log('fffff:', filePaths);
  filePaths.forEach((filePath) => {
    let file = null;
    const filename = path.basename(filePath).split('.')[0];
    try {
      file = fs.readFileSync(filePath, { encoding: 'utf8' });
      handleCompletionItem(file, filename, bareItems, items);
    } catch (err: any) {
      let str = '';
      const message = err.message;
      const stack = err.stack;
      const configStr = JSON.stringify(err.config || {});
      str = `error.message: ${message}\r\n
					error.stack: ${stack}\r\n
					error.config: ${configStr}`;
      vscode.window.showInformationMessage(str);
      console.error('读取文件错误：', err);
    }
  });
}

// 对每一个资源文件生成CompletionItem
function handleCompletionItem(
  file: any,
  filename: string,
  bareItems: vscode.CompletionItem[],
  items: vscode.CompletionItem[]
) {
  // 去除资源里的注释
  file = strip(file);
  // 对资源文件做解析
  const cssParsed = css.parse(file);
  // 资源文件必须有根选择器
  const rootRule: Rule | undefined = cssParsed.stylesheet?.rules.find(
    (rule: Rule) => {
      const isRuleType = (rule.type = 'rule');
      const rootSelectors = [':export', ':root'];
      const hasRootSelector = rule?.selectors?.some((selector) =>
        rootSelectors.includes(selector)
      );

      return Boolean(isRuleType && hasRootSelector);
    }
  );
  const declarations = rootRule?.declarations;
  const variables = declarations?.filter((declaration: Declaration) => {
    return Boolean(
      declaration.type === 'declaration' && declaration?.value?.startsWith('#')
    );
  });

  variables?.forEach((variable: Declaration) => {
    const completionItemBare = new CompletionItem(
      variable.value!,
      vscode.CompletionItemKind.Variable
    );
    completionItemBare.detail = `主题：${filename} 变量：${variable.property} 色值：${variable.value}`;
    completionItemBare.insertText = `var(${variable.property});`;
    bareItems.push(completionItemBare);

    const completionItem = new CompletionItem(
      variable.property!,
      vscode.CompletionItemKind.Variable
    );

    completionItem.detail = `主题：${filename} 变量：${variable.property} 色值：${variable.value}`;
    completionItem.insertText = `var(${variable.property});`;

    items.push(completionItem);
  });
}
