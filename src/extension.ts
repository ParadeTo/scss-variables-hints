/*
 * @Author: wangyunbo
 * @Date: 2021-05-19 23:57:46
 * @LastEditors: wangyunbo
 * @LastEditTime: 2021-05-31 13:51:59
 * @Description: file content
 * @FilePath: \css-variables-hints\src\extension.ts
 */
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as css from 'css';
import * as strip from 'strip-comments';
import { decode } from 'js-base64';

import type { Rule, Declaration } from 'css';
import axios from 'axios';

const { CompletionItem, CompletionList } = vscode

export async function activate(context: vscode.ExtensionContext) {
	// 存放提示(暂时未区分远端的资源和本地的资源，都放在一起)
	const items: vscode.CompletionItem[] = [];
	const bareItems: vscode.CompletionItem[] = [];
	const workspaceFolder = vscode.workspace.workspaceFolders || [];
	const folderPath = workspaceFolder[0]?.uri.fsPath;

	// workspace not selected
	if (!vscode.workspace.workspaceFolders) {
		return;
	}

	const config = vscode.workspace.getConfiguration('cssVarriablesHints');
	// 本地资源文件
	const hasFilesInConfig = config && config.has('files');
	// 远端资源文件
	const hasRemoteFilesInConfig = config && config.has('remoteFiles');

	// no config or specified files
	if (!config || !(hasFilesInConfig || hasRemoteFilesInConfig)) {
		return;
	}

	const configFiles: Array<string> = config.get('files') || [];
	const remoteConfigFiles: Array<string> = config.get('remoteFiles') || [];
	const configLanguageMods: Array<string> = config.get('languageModes') || [];
	// 处理本地变量
	handleConfigFiles(configFiles, folderPath, bareItems, items);
	// 处理远端变量文件
	let remoteFiles = [];
	try{
		remoteFiles	= await handleRemoteConfigFiles(remoteConfigFiles)
		remoteFiles.forEach(file => {
			handleCompletionItem(file, bareItems, items)
		})
	} catch(err) {
		vscode.window.showInformationMessage(err.message)
		console.error('读取远端文件错误：', err)
	}
	

	let completionProvider = vscode.languages.registerCompletionItemProvider(
		configLanguageMods.length ? configLanguageMods : ['css', 'postcss', 'scss', 'less', 'vue'],
		{
			async provideCompletionItems(document, position) {
				const firstCharOfLinePosition = new vscode.Position(position.line, 0);
				const withIndentBeforeCursorText = document.getText(new vscode.Range(firstCharOfLinePosition, position)) || '';
				const beforeCursorText = withIndentBeforeCursorText.trim();
				if (!beforeCursorText.match(/--([\w-]*)/)) {
					return null;
				}
				// 变量去重
				let dedup_bareItems = bareItems.reduce((finalItems: vscode.CompletionItem[], curItem: vscode.CompletionItem) => {
					if (!finalItems.some(item => item.label === curItem.label)) {
						finalItems.push(curItem)
					}
					return finalItems
				}, []);

				let dedup_items = items.reduce((finalItems: vscode.CompletionItem[], curItem: vscode.CompletionItem) => {
					if (!finalItems.some(item => item.label === curItem.label)) {
						finalItems.push(curItem)
					}
					return finalItems
				}, [])

				let completionItems: vscode.CompletionItem[] = beforeCursorText.match(/var\(--([\w-]*)/) ? dedup_bareItems : dedup_items;
				let dashPosition = null;
				let dashPosition2 = null;
				let range: vscode.Range | null = null;
				let linePrefix = '';
				if (withIndentBeforeCursorText.endsWith('--')) {
					dashPosition = new vscode.Position(position.line, withIndentBeforeCursorText.lastIndexOf('--'));
					dashPosition2 = new vscode.Position(position.line, withIndentBeforeCursorText.lastIndexOf('--') + 2);
					range = new vscode.Range(dashPosition, dashPosition2);
				}
				completionItems = completionItems.map(item => {
					if (range === null) {
						return item
					} else {
						return {
							...item,
							range
						}
					}
				})
				return new CompletionList(completionItems);
			},
		},
		'-', '-'
	);

	context.subscriptions.push(completionProvider);
}

function handleConfigFiles(configFiles: string[], folderPath: string, bareItems: vscode.CompletionItem[], items: vscode.CompletionItem[]) {
	configFiles.forEach((filePath) => {
		let file = null;
		try{
		 file = fs.readFileSync(path.join(folderPath, filePath), { encoding: 'utf8' });
		 handleCompletionItem(file, bareItems, items)
		} catch(err) {
			let str = '';
			const message = err.message;
			const stack = err.stack;
			const config = JSON.stringify(err.config || {});
			str = `error.message: ${message}\r\n
					error.stack: ${stack}\r\n
					error.config: ${config}`
			vscode.window.showInformationMessage(str)
			console.error('读取文件错误：', err)
		}
	});
}
// 处理远端文件（当前只针对gitlab）
async function handleRemoteConfigFiles(configFiles: any[]): Promise<any[]> {
	const rawRemoteFiles: any[] = [];
	for (const fileInfo of configFiles) {
		let { projectId = '', filePath = '', token = "", origin = "" } = fileInfo;
		filePath = encodeURIComponent(filePath)
		const url = `${origin}/api/v4/projects/${projectId}/repository/files/${filePath}?ref=master`;
		try {
			const result = await axios.get(url, {
				headers: {
					'PRIVATE-TOKEN': token
				}
			});
			if (result && result.data) {
				const { content: base64Content } = result.data;
				const fileContent = decode(base64Content);
				rawRemoteFiles.push(fileContent)
			}
		} catch (err) {
			let str = '';
			const message = err.message;
			const stack = err.stack;
			const config = JSON.stringify(err.config || {});
			str = `error.message: ${message}\r\n
					error.stack: ${stack}\r\n
					error.config: ${config}`
			vscode.window.showInformationMessage(str)
			console.error('读取远端文件错误：', err)
			continue;
		}
	};
	return rawRemoteFiles
}

// 对每一个资源文件生成CompletionItem
function handleCompletionItem(file: any, bareItems: vscode.CompletionItem[], items: vscode.CompletionItem[]) {
	// 去除资源里的注释
	file = strip(file);
	// 对资源文件做解析
	const cssParsed = css.parse(file);
	// 资源文件必须有根选择器
	const rootRule: Rule | undefined = cssParsed.stylesheet?.rules.find((rule: Rule) => {
		const isRuleType = rule.type = 'rule';
		const rootSelectors = [':export', ':root'];
		const hasRootSelector = rule?.selectors?.some(selector => rootSelectors.includes(selector));

		return Boolean(isRuleType && hasRootSelector);
	});
	const declarations = rootRule?.declarations;
	const variables = declarations?.filter((declaration: Declaration) => {
		return Boolean(
			declaration.type === 'declaration' &&
			declaration?.property?.startsWith('--')
		);
	});

	variables?.forEach((variable: Declaration) => {
		// For use when the user has already typed `var(`
		const completionItemBare = new CompletionItem(variable.property!, vscode.CompletionItemKind.Variable);
		// 变量的值
		completionItemBare.detail = variable.value;
		// 变量的属性
		completionItemBare.insertText = variable.property;
		bareItems.push(completionItemBare);

		const completionItem = new CompletionItem(variable.property!, vscode.CompletionItemKind.Variable);

		completionItem.detail = variable.value;
		completionItem.insertText = `var(${variable.property})`;

		items.push(completionItem);
	});
}