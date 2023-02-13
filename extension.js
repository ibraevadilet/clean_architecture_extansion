
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const folderPath = vscode.workspace.workspaceFolders[0].uri.fsPath + '/lib/features';
	if (!vscode.workspace) {
		return vscode.window.showErrorMessage('Please open a project folder first');
	  }

	  context.subscriptions.push(vscode.commands.registerCommand('clean_architecture.createScreen',()=>  creater(folderPath, 'screen')));
	  context.subscriptions.push(vscode.commands.registerCommand('clean_architecture.createUseCase',()=>  creater(folderPath, 'use_case')));
	  context.subscriptions.push(vscode.commands.registerCommand('clean_architecture.createRepo',()=>  creater(folderPath, 'repo')));
	  context.subscriptions.push(vscode.commands.registerCommand('clean_architecture.createRepoImpl',()=>  creater(folderPath, 'repo_impl')));
	  context.subscriptions.push(vscode.commands.registerCommand('clean_architecture.createRepoImplList',()=>  creater(folderPath, 'repo_impl_list')));
	

	let createrAll = vscode.commands.registerCommand('clean_architecture.createAll', function () {
		vscode.window.showInputBox({
				placeHolder: "Enter the class name"
			}).then(function (fileName) {
				if (fileName === undefined) {
					return;
				}
				let fullUseCaseFileName = fileName + '_use_case' + '.dart';
				let fullRepoFileName = fileName + '_repo' + '.dart';
				let fullRepoImplFileName = fileName + '_repo_impl' + '.dart';
				let className = capitalizeWords(fileName);
				let functionName = firstLetterLowerCase(className);

				
				const useCaseContent = `class ${className + 'UseCase'} {
					${className + 'UseCase'} ({required this.repo});
					final ${className + 'Repo'} repo;
				  
					Future<Model> ${functionName}() async {
					  try {
						return await repo.${functionName}();
					  } catch (e) {
						rethrow;
					  }
					}
				  }`;

		const repoContent = `
		abstract class ${className + 'Repo'} {
			Future<Model> ${functionName}();
		  }`;
	

		const repoImplContentList = `
		import 'package:dio/dio.dart';
		import 'package:supervisor_clean/server/catch_exception.dart';
		class ${className + 'RepoImpl'} implements ${className + 'Repo'} {
			${className + 'RepoImpl'}({required this.dio});
			final Dio dio;
			@override
			Future<List<Model>> ${functionName}() async {
			  try {
				final response = await dio.get(
				  'url',
				  queryParameters: {},
				);
		  
				return response.data
					.map<Model>(
					  (e) => Model.fromJson(e),
					)
					.toList();
			  } catch (e) {
				throw CatchException.convertException(e);
			  }
			}
		  }`;

		fs.writeFile(path.join(folderPath, fullUseCaseFileName), useCaseContent, (err) => {
			if (err) {
			  return vscode.window.showErrorMessage('Failed to create boilerplate file!');
			}
			 
		  });
		fs.writeFile(path.join(folderPath, fullRepoFileName), repoContent, (err) => {
			if (err) {
			  return vscode.window.showErrorMessage('Failed to create boilerplate file!');
			}
			 
		  });
		fs.writeFile(path.join(folderPath, fullRepoImplFileName), repoImplContentList, (err) => {
			if (err) {
			  return vscode.window.showErrorMessage('Failed to create boilerplate file!');
			}
			 
		  });

		});
	});
	context.subscriptions.push(createrAll);
	
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}


function creater (folderPath, type, number) {
	vscode.window.showInputBox({
		placeHolder: "Enter the class name"
	}).then(function (fileName) {
		if (fileName === undefined) {
			return;
		}

	let fullFileName = fileName + '_' + type + '.dart';
	let className = capitalizeWords(fileName);
	let functionName = firstLetterLowerCase(className);
	let  content;

	switch (type) {
		case 'screen':
			content = `
			import 'package:flutter/material.dart';
			
			class ${className + 'Screen'} extends StatelessWidget {
			const ${className + 'Screen'}({super.key});
			
			@override
			Widget build(BuildContext context) {
			return Scaffold(
			body: Center(
			child: Text('${className + 'Screen'}'),
			),
			);
			}
			}
			  `; 
			break;
		case 'use_case':
			content = `class ${className + 'UseCase'} {
				${className + 'UseCase'} ({required this.repo});
				final ${className + 'Repo'} repo;

				Future<Model>${functionName}() async {
				  try {
					return await repo.${functionName}();
				  } catch (e) {
					rethrow;
				  }
				}
			  }`;
			  break;
		case 'repo':
			content = `
			abstract class ${className + 'Repo'} {
				Future<void> ${functionName}();
			  }`;
			  break;

		case 'repo_impl':
			content = `
			import 'package:dio/dio.dart';
			import 'package:supervisor_clean/server/catch_exception.dart';
			class ${className + 'RepoImpl'} implements ${className + 'Repo'} {
				${className + 'RepoImpl'}({required this.dio});
				final Dio dio;
				@override
				Future<Model> ${functionName}() async {
				  try {
					final response = await dio.get(
					  'url',
					  queryParameters: {},
					);
			  
					return Model.fromJson(response.data);
				  } catch (e) {
					throw CatchException.convertException(e);
				  }
				}
			  }`;
			  break;
		case 'repo_impl_list':
			content = `
			import 'package:dio/dio.dart';
			import 'package:supervisor_clean/server/catch_exception.dart';
			class ${className + 'RepoImpl'} implements ${className + 'Repo'} {
				${className + 'RepoImpl'}({required this.dio});
				final Dio dio;
				@override
				Future<List<Model>> ${functionName}() async {
				  try {
					final response = await dio.get(
					  'url',
					  queryParameters: {},
					);
			  
					return response.data
					.map<Model>(
					  (e) => Model.fromJson(e),
					)
					.toList();
				  } catch (e) {
					throw CatchException.convertException(e);
				  }
				}
			  }`;
			  break;
	
		default:
			break;
	}
	
	
if(type === 'screen'){
	fs.mkdir(path.join(folderPath, fileName), (err)=> {
if(err){
throw err
}
  }); 

  fs.writeFile(path.join(folderPath + '/' + fileName, fullFileName), content, (err) => {
	if (err) {
	  return vscode.window.showErrorMessage('Failed to create boilerplate file!');
	}
	 
  });
}else{
	fs.writeFile(path.join(folderPath, fullFileName), content, (err) => {
		if (err) {
		  return vscode.window.showErrorMessage('Failed to create boilerplate file!');
		}
		 
	  });
}
  
});

}



function capitalizeWords(str) {
	let result = str[0].toUpperCase();
	for (let i = 1; i < str.length; i++) {
	  if (str[i - 1] === '_') {
		result += str[i].toUpperCase();
	  } else {
		result += str[i];
	  }
	}
	result = result.replaceAll(/_/g, '');
	return result;
  }

  function firstLetterLowerCase(str) {
	return str[0].toLowerCase() + str.slice(1);
  }