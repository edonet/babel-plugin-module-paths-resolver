/**
 *****************************************
 * Created by edonet@163.com
 * Created on 2021-05-24 22:57:48
 *****************************************
 */
'use strict';


/**
 *****************************************
 * 加载依赖
 *****************************************
 */
import * as fs from '@ainc/fs';
import { types, NodePath, PluginPass } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';
import { load } from './jsonc';


/**
 *****************************************
 * 配置对象
 *****************************************
 */
interface TSConfig {
    compilerOptions?: {
        baseUrl?: string;
        paths?: {
            [key: string]: string[];
        };
    };
}


/**
 *****************************************
 * 解析配置文件
 *****************************************
 */
const config = (
    load<TSConfig>('./tsconfig.json') ||
    load<TSConfig>('./jsconfig.json') ||
    {}
);


/**
 *****************************************
 * 插件状态
 *****************************************
 */
interface State extends PluginPass {
    dirname?: string;
    calls?: string[];
    resolvePath?(source: string): string;
}


/**
 *****************************************
 * 转换的资源路径
 *****************************************
 */
function transformSourceNode(expr: NodePath<types.StringLiteral>, state: State): void {
    if (!expr || !state.resolvePath || !types.isStringLiteral(expr)) {
        return;
    }

    // 获取路径
    const sourcePath = expr.node.value;
    const resolvedPath = state.resolvePath(sourcePath);

    // 替换路径
    if (sourcePath !== resolvedPath) {
        expr.replaceWith(
            types.stringLiteral(
                fs.isAbsolutePath(resolvedPath) ?
                './' + fs.relative(state.dirname || fs.cwd(), resolvedPath) :
                resolvedPath
            )
        );
    }
}


/**
 *****************************************
 * 转换载入声明
 *****************************************
 */
function transformImport(expr: NodePath<types.ImportDeclaration | types.ExportDeclaration>, state: State): void {
    transformSourceNode(expr.get('source') as NodePath<types.StringLiteral>, state);
}


/**
 *****************************************
 * 定义函数列表
 *****************************************
 */
const transformCalls = ['require', 'require.resolve'];


/**
 *****************************************
 * 匹配调用函数
 *****************************************
 */
function matchSourceCall(name: string, expr: NodePath<types.Identifier>): boolean {
    const { node } = expr;

    // 匹配成员节点
    if (types.isMemberExpression(node)) {
        return expr.matchesPattern(name);
    }

    // 非标识府或匹配成员
    if (!types.isIdentifier(node) || name.includes('.')) {
        return false;
    }

    // 匹配函数名
    return node.name === name;
}


/**
 *****************************************
 * 转换调用声明
 *****************************************
 */
function transformCall(expr: NodePath<types.CallExpression>, state: State): void {

    // 处理`import`调用
    if (types.isImport(expr.node.callee)) {
        return transformSourceNode(expr.get('arguments.0') as NodePath<types.StringLiteral>, state);
    }

    // 不存在转换函数
    if (!state.calls) {
        return;
    }

    // 获取调用节点
    const callee = expr.get('callee') as NodePath<types.Identifier>;
    const isSourceCall = state.calls.some(value => matchSourceCall(value, callee));

    // 处理函数调用
    if (isSourceCall) {
        transformSourceNode(expr.get('arguments.0') as NodePath<types.StringLiteral>, state);
    }
}


/**
 *****************************************
 * 插件配置
 *****************************************
 */
interface Options {
    alias?: { [key: string]: string };
    calls?: string[];
    exclude?: string[];
}


/**
 *****************************************
 * 定义插件
 *****************************************
 */
export default declare((api, opts: Options = {}) => {
    const include = fs.includePaths(opts.exclude || ['node_modules']);
    const calls = opts.calls ? [...transformCalls, ...opts.calls] : transformCalls;
    const options = config.compilerOptions || {};
    const resolvePath = fs.resolveAlias({ alias: opts.alias, baseUrl: options.baseUrl, paths: options.paths });

    // 校验版本
    api.assertVersion(7);

    // 返回插件配置
    return {
        name: 'module-paths-resolver',
        pre(file) {
            const { filename } = file.opts;

            // 过滤文件
            if (!filename || !include(filename)) {
                this.dirname = filename ? fs.dirname(filename) : process.cwd();
                this.calls = calls;
                this.resolvePath = resolvePath;
            }
        },
        visitor: {
            ImportDeclaration: transformImport,
            ExportDeclaration: transformImport,
            CallExpression: transformCall,
        },
    };
});
